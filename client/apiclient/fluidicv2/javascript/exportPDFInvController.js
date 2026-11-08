
OPMClient.FWAGlobalDataController = Ember.Controller.extend({
	startTime : "",
	endTime : "",
	timePeriod : "today"//No I18N
});
OPMClient.FWAInventoryDataController = Ember.Controller.extend({
	startTime : "",
	endTime : "",
	timePeriod : "today"//No I18N
});

OPMClient.FWAInventoryDeviceDetailsController = Ember.ArrayController.create({
	selectedTab : "devbandwidth", //No I18N
	selResName : "",
	selDispName : "",
	selResIP : "",
	selResID : "",
	selResType : "",
	selResVendor : "",
	bandwidthGraphUnit : 'Mbps',//No I18N
	allDeviceDetails : [],
	devSnapshotReportDetails : [],
	devSnapshotReportLayout : 0,
	tabVsURL : {"devsummary":"DevSummary", "devbandwidth":"DevBandwidth","devtraff":"DevTraffic","devusers":"DevUsers","devurls":"DevURLs","devapps":"DevApps","devrules":"DevRules","devsecurity":"DevSecurity","devvpn":"DevVPN","devconfig":"DevConfig","proxyTalkers":"ProxyTalkers","proxyVirus":"ProxyVirus","proxyUsage":"ProxyUsage","devreports":"DevReports"}, //No I18N
	isReportTab:false,
	deviceDetails:{}
});

OPMClient.InventoryDateTimeNFAController = Ember.ArrayController.create({
	"15Minute": "15Minute",//No I18N
	"30Minute": "30Minute",//No I18N
	"30minute" : "30Minute",//No I18N
	"2Hour": "2Hour", //NO I18N
	"4Hour": "4Hour", //NO I18N
	"6Hour": "6Hour",//No I18N
	"Last6Hour" : "6Hour",//No I18N
	"yesterday": "yesterday",//No I18N
	"LastHour": "hourly",//No I18N
	"today": "today",//No I18N
	"24Hour": "daily",//No I18N
	"Last24Hour" : "daily",//No I18N
	"7Days": "Weekly",//No I18N
	"30Days": "Monthly",//No I18N
	"LastQuarter": "Quarterly",//No I18N
	"Quarterly": "Quarterly",//No I18N
	"custom":"custom",//No I18N
	"hourly":"LastHour",//No I18N
	"daily":"24Hour",//No I18N
	"Daily":"24Hour",//No I18N
	"Weekly": "7Days",//No I18N
	"Monthly": "30Days",//No I18N
	"monthly": "30Days",//No I18N
	"PrevMonth": "30Days",//No I18N
	"eight": "today",//No I18N
	"PrevWeek": "7Days",//No I18N
	"PreviousWeek": "7Days", //No I18N
	"yearly":"yearly", //NO I18N

    "onehour":"hourly", //No I18N
    "twohours":"2Hour", //No I18N
    "fourhours":"4Hour", //No I18N
    "sixhours":"6Hour", //No I18N
    "eighthours":"eighthours", //No I18N
    "twelvehours":"twelvehours", //No I18N
    "twfourhours":"daily", //No I18N
    "Today": "today",//No I18N
    "Yesterday": "yesterday",//No I18N
    "thisweek": "ThisWeek",//No I18N
    "lastweek": "lastweek",//No I18N
    "Last_7_Days": "Last_7_Days",//No I18N
    "Last_30_Days": "Last_30_Days",//No I18N
    "Last_60_Days": "Last_60_Days",//No I18N
    "Last_90_Days": "Last_90_Days",//No I18N
    "thismonth": "ThisMonth",//No I18N
    "Last_Month": "PrevMonth",//No I18N
    "Last_3_Months": "Last_3_Months",//No I18N
    "Last_6_Months": "Last_6_Months",//No I18N
    "Last_Quarter": "Last_Quarter",//No I18N
    "This_Quarter": "This_Quarter"//No I18N
});

OPMClient.InventoryDateTimeLegends = Ember.ArrayController.create({
	"LastHour": "onehour",//No I18N
	"hourly":"onehour",//No I18N
	"today": "onehour",//No I18N
	"yesterday":"onehour",//No I18N
	"24Hour": "onehour",//No I18N
	"7Days": "monthly",//No I18N
	"30Days": "monthly",//No I18N
	"LastQuarter": "quarterly",//No I18N
	"custom":"custom",//No I18N
	"15Minute":"onehour",//No I18N
	"30Minute":"onehour",//No I18N
	"Hourly": "onehour",//No I18N
	"6Hour": "onehour",//No I18N
	"eight": "onehour",//No I18N
	"Today": "onehour",//No I18N
	"Daily": "onehour",//No I18N
	"daily": "onehour",//No I18N
	"Yesterday": "onehour",//No I18N
	"Weekly": "monthly",//No I18N
	"PreWeek": "monthly",//No I18N
	"PrevWeek":"monthly",//No I18N
	"Monthly": "monthly",//No I18N
	"PrevMonth": "monthly",//No I18N
	"Quarterly":"quarterly",//No I18N
	"yearly":"yearly" //NO I18N
});
var pdfColNames1 = ['webclinet.nfa.maxspeed','webclinet.nfa.avgspeed','webclient.reports.volume'];//No I18N
var pdfColModel1 = [
	{ name: '0', index: '0'},//No I18N
	{ name: '1', index: '1'},  //No I18N
	{ name: '2', index: '2'} //No I18N
];
var pdfColNames2 = ['webclient.common.widgets.intfname','webclient.IN.Traffic','webclient.OUT.Traffic'];//No I18N
var pdfColModel2 = [
	{ name: '0', index: '0', formatter:jqGridHTMLEncode},//No I18N
	{ name: '1', index: '1'},  //No I18N
	{ name: '2', index: '2'} //No I18N
];

var pdfColNames3 = ['','jsp.commonstr.Name','','','NFAWidget.trfc']; // No I18N
var pdfColModel3 =  [
    { name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaReportsClrCodeFormatter}, //NO I18N
    { name: '0', index:'0', width:50,sortable: false, formatter:jqGridHTMLEncode}, //No I18N
    { name: '1', index:'1', formatter: setNFAAvailBgr}, //No I18N
    { name: '2', index:'2', hidden: true}, //No I18N
    { name: '3', index:'3', width:30,sorttype: nfa_customSort} // No I18N
];
var pdfColNames4 = ['NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','NFAWidget.trfc'];//No I18N
var pdfColModel4 =  [
	{ name: '0', index: '0', formatter:jqGridHTMLEncode},//No I18N
	{ name: '1', index: '1', formatter:jqGridHTMLEncode},  //No I18N
	{ name: '2', index: '2', formatter:jqGridHTMLEncode}, //No I18N
	{ name: '3', index: '3'} //No I18N
];
var pdfColNames7 = ['','webclient.map.name','NFAWidget.trfc','nfa.total.traffic']; //No I18N
var pdfColModel7 = [
	{ name: 'clrCode',index:'clrCode',width:5,sortable:false,formatter:nfaReportsClrCodeFormatter}, //No I18N
	{ name: 'Name', index: 'Name', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'Traffic', index: 'Traffic', classes:"pointer",sorttype: nfa_customSort }, //No I18N
	{ name: 'util', index: 'util', classes:"pointer",sorttype: nfa_customSort,formatter:setNFAAvailBgr} //No I18N
];
var pdfColNames8 = ['webclient.reports.apilog.source','pdf.DstIP','webclient.Application','webclient.admin.appmanager.port','webclient.snmpv3.AuthenticationProtocol','NFAWidget.dscp','NFAWidget.trfc']; //No I18N
var pdfColModel8 = [
	{ name: 'Source', index: 'Source', classes:"pointer", formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'Destination', index: 'Destination', classes:"pointer", formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'Appln', index: 'Appln', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'Port', index: 'Port', classes:"pointer"}, //No I18N
	{ name: 'Prot', index: 'Prot', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'DSCP', index: 'DSCP', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'Traffic', index: 'Traffic', classes:"pointer"} //No I18N
];

var pdfColNames10 = ['NFAWidget.Time','NFAWidget.IN','NFAWidget.OUT']; //No I18N
var pdfColModel10 = [
	{ name: 'Time', index: 'Time', classes:"pointer"}, //No I18N
	{ name: 'IN', index: 'IN', classes:"pointer" ,sorttype: nfa_customSort}, //No I18N
	{ name: 'OUT', index: 'OUT', classes:"pointer",sorttype: nfa_customSort } //No I18N
];
var pdfColNames11 = ['webclient.map.flash.proId','webclient.Application','webclient.Traffic','opu.views.PACKETS'];//No I18N
var pdfColModel11 = [
	{name: 'appID', index: 'appID', classes:"pointer",hidden:true},//No I18N
	{ name: 'app', index: 'app', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'traffic', index: 'traffic', classes:"pointer",sorttype: nfa_customSort }, //No I18N
	{ name: 'pkts', index: 'pkts', classes:"pointer",sorttype: 'number' } //No I18N
];

var pdfColNames17 = ['NFAWidget.CliIP','webclinet.inventory.wlc.clientmac','webclient.Application','webclient.reports.SSID','webclient.reports.PreDSCP','webclient.reports.PostDSCP','NFAWidget.trfc','opu.views.PACKETS'];//No I18N
var pdfColModel17 = [
	{ name: 'clientip', index: 'clientip', classes:"pointer",sorttype:nfa_IPV4Sorting}, //No I18N
	{ name: 'clientmac', index: 'clientmac', classes:"pointer"}, //No I18N
	{ name: 'app', index: 'app', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'ssid', index: 'ssid', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'dscpin', index: 'dscpin', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'dscpout', index: 'dscpout', classes:"pointer",formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'traffic', index: 'traffic', classes:"pointer",sorttype: nfa_customSort}, //No I18N
	{ name: 'pkts', index: 'pkts', classes:"pointer",sorttype: 'number'} //No I18N
];
var pdfColNames19 = ['webclient.general.time','webclient.devices.intftypes.min','webclient.reports.tags.max','webclient.reports.tags.avg','webclient.devices.details.avail.total']; //No I18N
var pdfColModel19 = [
	{ name: 'Time', index: 'Time', classes:"pointer"}, //No I18N
	{ name: 'Min', index: 'Min', classes:"pointer" ,sorttype:nfa_customSort}, //No I18N
	{ name: 'Max', index: 'Max', classes:"pointer" ,sorttype:nfa_customSort}, //No I18N
	{ name: 'Avg', index: 'Avg', classes:"pointer" ,sorttype:nfa_customSort}, //No I18N
	{ name: 'Total', index: 'Total', classes:"pointer" ,sorttype:nfa_customSort} //No I18N
];
var nbar2DrillDownGridNameList = ['webclient.reports.apilog.source','pdf.DstIP','webclient.Application','mediatrace.protocol','webclient.admin.mailserver.port','pdf.DstPort','webclient.settings.ip.grp.dscp','webclient.Traffic']; //No I18N		
var nbar2DrillDownGridModelList =  [
	{ name: '0', index: '0', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '1', index: '1', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '2', index: '2'}, //No I18N
	{ name: '3', index: '3'}, //No I18N
	{ name: '4', index: '4', sorttype: 'int'}, //No I18N
	{ name: '5', index: '5', sorttype: 'int'}, //No I18N
	{ name: '6', index: '6'}, //No I18N
	{ name: '7', index: '7', sorttype: nfa_customSort} //No I18N
];

var httpHostDrillDownGridNameList =['webclient.reports.apilog.source','pdf.DstIP','webclient.Application','mediatrace.protocol','webclient.admin.mailserver.port','pdf.DstPort','webclient.snapshot.name.Http.host','webclient.Traffic']; //No I18N
var httpHostDrillDownGridModelList = [
	{ name: '0', index: '0', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '1', index: '1', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '10', index: '10'}, //No I18N
	{ name: '4', index: '4'}, //No I18N
	{ name: '6', index: '6', sorttype: 'int'}, //No I18N
	{ name: '7', index: '7', sorttype: 'int'}, //No I18N
	{ name: '11', index: '11'}, //No I18N
	{ name: '5', index: '5', sorttype: nfa_customSort} //No I18N
];

var qosStatsDrillDownConvGridNameList = ['webclient.reports.apilog.source','pdf.DstIP','webclient.Application','mediatrace.protocol','pdf.SrcPort','pdf.DstPort','webclient.Qos.Class','webclient.Traffic']; //No I18N
var qosStatsDrillDownConvGridModelList = [
	{ name: '0', index: '0',width: '40',sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '1', index: '1',width: '40',sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '2', index: '2',width: '40'}, //No I18N
	{ name: '4', index: '4',width: '35'}, //No I18N
	{ name: '6', index: '6',width: '30',sorttype: 'int'}, //No I18N
	{ name: '7', index: '7',width: '30',sorttype: 'int'}, //No I18N
	{ name: '11',index:'11',width: '80'}, //No I18N
	{ name: '5', index: '5',width: '40',sorttype: nfa_customSort} //No I18N
];

var qosStatsDrillDownAppGridNameList = ['NFAWidget.App','NFAWidget.trfc','NFAWidget.perctraf']; //No I18N
var qosStatsDrillDownAppGridModelList = [
	{ name: '1', index: '1'}, //No I18N
	{ name: '2', index: '2', sorttype: nfa_customSort}, //No I18N
	{ name: '3', index: '3', sorttype: 'int',formatter: setNFAAvailBgr} //No I18N
];

var artDrillDownGridNameList = ['avc.Client','webclient.admin.alarmesc.servers','webclient.snapshot.name.NBAR2.Application','webclinet.nfa.art.clientpkts','webclinet.nfa.art.serverpkts','webclinet.nfa.art.retransmissions','webclinet.nfa.art.transactions','art.New_Conns','webclinet.nfa.art.responses','art.HB{1...7}','art.RT(sum,max,min)','art.AD(sum,max,min)','art.TD(sum,max,min)','art.ND(sum,max,min)','art.CND(sum,max,min)','art.SND(sum,max,min)','art.Server_Traffic','art.Client_Traffic']; //No I18N
var artDrillDownGridModelList = [
	{ name: '16', index: '16', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '17', index: '17', sorttype: nfa_IPV4Sorting}, //No I18N
	{ name: '2', index: '2'}, //No I18N
	{ name: '3', index: '3'}, //No I18N
	{ name: '4', index: '4'}, //No I18N
	{ name: '5', index: '5'}, //No I18N
	{ name: '6', index: '6'}, //No I18N
	{ name: '7', index: '7'}, //No I18N
	{ name: '8', index: '8'}, //No I18N
	{ name: '9', index: '9', width: '180'}, //No I18N
	{ name: '10', index: '10'}, //No I18N
	{ name: '11', index: '11'}, //No I18N
	{ name: '12', index: '12'}, //No I18N
	{ name: '13', index: '13'}, //No I18N
	{ name: '14', index: '14'}, //No I18N
	{ name: '15', index: '15'}, //No I18N
	{ name: '1', index: '1', sorttype: nfa_customSort}, //No I18N
	{ name: '0', index: '0', sorttype: nfa_customSort} //No I18N
];

var protocolGridNameList =['NFAWidget.proto','NFAWidget.trfc','webclient.fwa.total.traffic']; //No I18N
var protocolGridModelList = [
	{ name: 'Name', index: 'Name', formatter:jqGridHTMLEncode}, //No I18N
	{ name: 'volume', index: 'volume', sorttype: nfa_customSort}, //No I18N
	{ name: 'traffic', index: 'traffic',formatter:setNFAAvailBgr} //No I18N
];

var wlcConvGridNameList = ['NFAWidget.CliIP','webclinet.inventory.wlc.apmacname','webclinet.inventory.wlc.clientmac','NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','NFAWidget.WLSSID','webclinet.inventory.wlc.predscp','webclinet.inventory.wlc.postdscp','NFAWidget.trfc']; //No I18N
var wlcConvGridModelList = [ 
	{name:'0', index:'0', sorttype:'nfa_IPV4Sorting'}, //No I18N
	{name:'1', index:'1'},  //No I18N
	{name:'2', index:'2'},  //No I18N
	{name:'3', index:'3'},  //No I18N
	{name:'4', index:'4'},  //No I18N
	{name:'5', index:'5'},  //No I18N
	{name:'6', index:'6'},  //No I18N
	{name:'7', index:'7'}, //No I18N
	{name:'8', index:'8'},  //No I18N
    {name:'9', index:'9', sorttype:'nfa_customSort'} //No I18N
];

var intfConvGridNameList = ['NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','showPorts.SourcePort','showPorts.DestPort','NFAWidget.proto','NFAWidget.dscp','dscpcode','NFAWidget.trfc','webclient.reports.showgraph']; //No I18N
var intfConvGridModelList = [ 
    {name:'src', index: 'src', sorttype:'nfa_IPV4Sorting'}, //No I18N
    {name:'dst', index:'dst', sorttype:'nfa_IPV4Sorting'},  //No I18N
    {name:'app', index:'app'},  //No I18N
    {name:'port', index:'port'},  //No I18N
    {name:'dstport', index:'dstport'},  //No I18N
    {name:'prot', index:'prot'},  //No I18N
    {name:'dscp', index:'dscp'},  //No I18N
    {name:'dscpCode', index:'dscpCode', hidden:true},  //No I18N
    {name:'traffic', index:'traffic', sorttype:nfa_customSort},  //No I18N
    {name:'indvTrafficGraph', index:'indvTrafficGraph', formatter:indvTrafficGraph, classes:'pointer', width:'100'}  //No I18N
];

var asViewNameList = ['NFA.asName','NFA.asNumber','NFA.orgName','webclient.IN.Traffic','webclient.as.inminspeed','webclient.as.inmaxspeed','webclient.OUT.Traffic','webclient.as.outminspeed','webclient.as.outmaxspeed']; //No I18N
var asViewModelList = [
	{name:'0', index:'0', width:'30'}, //No I18N
	{name:'1', index:'1', width:'20'},  //No I18N
	{name:'2', index:'2', width:'55'},  //No I18N
	{name:'3', index:'3', width:'25'},  //No I18N
	{name:'4', index:'4', width:'25'},  //No I18N
	{name:'5', index:'5', width:'25'}, //No I18N
	{name:'6', index:'6', width:'25'},  //No I18N
	{name:'7', index:'7', width:'25'},  //No I18N
	{name:'8', index:'8', width:'25'}  //No I18N
];

var asViewGridNameList = ['NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','showPorts.SourcePort','showPorts.DestPort','nfa.asview.srcas','nfa.asview.dstas','NFAWidget.trfc','NoofPackets'];//No I18N
var asViewGridModelList = [
	{name:'sip', index: 'sip',width:30, sorttype:'nfa_IPV4Sorting'}, //No I18N
    {name:'dip', index:'dip', width:30,sorttype:'nfa_IPV4Sorting'},  //No I18N
    {name:'appName', index:'appName',width:30},  //No I18N
    {name:'sport', index:'sport',width:15,sorttype: 'int'},  //No I18N
    {name:'dport', index:'dport',width:15,sorttype: 'int'},  //No I18N
    {name:'srcAS', index:'srcAS',width:30},  //No I18N
    {name:'dstAS', index:'dstAS',width:30},  //No I18N
    {name:'volume', index:'volume',width:25, sorttype:nfa_customSort},  //No I18N
    {name:'packets', index:'packets',width:15,sorttype: 'int'}  //No I18N
];

OPMClient.InventoryPDFParams = Ember.ArrayController.create({
	"avcNbar2AppConDetails":{"colNamesList":nbar2DrillDownGridNameList,"colModelList":nbar2DrillDownGridModelList}, //No I18N
	"avcHttpHostConDetails":{"colNamesList":httpHostDrillDownGridNameList,"colModelList":httpHostDrillDownGridModelList}, //No I18N
	"avcQoSConDetailsConv":{"colNamesList":qosStatsDrillDownConvGridNameList,"colModelList":qosStatsDrillDownConvGridModelList}, //No I18N
	"avcQoSConDetailsApp":{"colNamesList":qosStatsDrillDownAppGridNameList,"colModelList":qosStatsDrillDownAppGridModelList}, //No I18N
	"avcArtConDetails":{"colNamesList":artDrillDownGridNameList,"colModelList":artDrillDownGridModelList}, //No I18N
	"ProtocolDistribution":{"colNamesList":protocolGridNameList,"colModelList":protocolGridModelList}, //No I18N
	"wlcDrillDown":{"colNamesList":wlcConvGridNameList,"colModelList":wlcConvGridModelList}, //No I18N
	"interfaceDrillDown":{"colNamesList":intfConvGridNameList,"colModelList":intfConvGridModelList}, //No I18N
	"asViewGridDetails":{"colNamesList":asViewNameList,"colModelList":asViewModelList}, //No I18N
	
	"nfaDevSummaryTraffic":{"colModelList":pdfColModel1,"colNamesList":pdfColNames1},//No I18N
	"nfaDevSummaryIntf":{"colModelList":pdfColModel2,"colNamesList":pdfColNames2},//No I18N
	"nfaDevSummaryPie":{"colModelList":pdfColModel3,"colNamesList":pdfColNames3},//No I18N
	"nfaDevSummaryConv":{"colModelList":pdfColModel4,"colNamesList":pdfColNames4},//No I18N
	"nfaRepProfile":{"colModelList":pdfColModel7,"colNamesList":pdfColNames7},//No I18N
	"nfaRepProfileConv":{"colModelList":pdfColModel8,"colNamesList":pdfColNames8},//No I18N
	"nfaTShootTraffTbl":{"colModelList":pdfColModel10,"colNamesList":pdfColNames10},//No I18N
	"PlanningDataPoints":{"colModelList":pdfColModel19,"colNamesList":pdfColNames19},//No I18N
	"PlanAppGrowthTbl":{"colModelList":[],"colNamesList":[]}//No I18N
});
OPMClient.FWAInventoryDateTimeLegends = Ember.ArrayController.create({
	"today": "Today",//No I18N
	"24Hour": "twfourhours",//No I18N
	"7Days": "dayanddate",//No I18N
	"30Days": "Datewise",//No I18N
	"custom":"fulltime"//No I18N
});

OPMClient.InventorySnapshotUIController = Ember.Object.create({
	successCallBackSnapshotNoAjax:function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,paramURL){
		if(snapDetailstype == "OnDemandGrid") {
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.OnDemandGrid(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "Remotegrid") { //No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Remotegrid(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "RemoteSubGrid") { //No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.RemoteSubGrid(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,paramURL);
			},0);
		} else if(snapDetailstype == "UCSFabricSummary") {//No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.UCSFabricSummary(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "UCSOverview") {//No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.UCSOverview(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "UCSChassisCount") {//No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.UCSChassisCount(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "UCSChassisSummary") {//No I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.UCSChassisSummary(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} 
	},
	successCallBackSnapshot: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) { 
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		setTimeout(function(){$("#"+reloadMsgId).remove();},3000);
		var isNFAGeoLocation = false;

		/*if(window.OPM.isPDF) {
			var reqParams = OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams[0];
			isGridViewNfaSubgrid = (snapDetails.name==='nfa.intf.cbqos')?true:isGridViewNfaSubgrid;
			isNFAGeoLocation = (reqParams.isLocation !== undefined && reqParams.isLocation == 'true')?true:false;
			if(isNFAGeoLocation) {
				isGridViewNfaSubgrid=true;
				snapshotData.isNFAPaginationGrid='false';
			}
		}*/
		/*if(snapDetails.name==='opm.interface.topsource' || snapDetails.name==='opm.interface.topdest') { //No I18N
			if(jsonData.alert !== undefined) {
				var msg=jsonData.alert+'.'; //No I18N
				msg+='<i><span style="color:blue;cursor:pointer" onclick="inventoryGlobalRoute.transitionTo(\'Settings.Basic.NFAGeoLocation\')">'+Ember.I18n.t('webclient.topo.refreshnoderesult.link',this)+'</span> Load Geo Location </i>'; //No I18N
				opm_infoMsgs('infoMsg',msg); //No I18N
			}
			isNFAGeoLocation =$("#param_"+snapId+"_isLocation").is(':checked');
			if(isNFAGeoLocation) {
				$('#param_'+snapId+'_ResolveDNS').parent().parent().hide();
			}else {
				$('#param_'+snapId+'_ResolveDNS').parent().parent().show();
			}
			if($("#param_"+snapId+"_ResolveDNS").is(':checked')) {
				$('#param_'+snapId+'_isLocation').parent().parent().hide();
			}else {
				$('#param_'+snapId+'_isLocation').parent().parent().show();
			}
			if((OPMClient.InventoryDeviceDetailsController.expandSnapWidget && isNFAGeoLocation) || ($("input:radio[name='tablegridviewtype_"+snapId+"']:checked").val()==="Grid" && isNFAGeoLocation)) {
				isGridViewNfaSubgrid=true;
				snapshotData.isNFAPaginationGrid='false'; //No I18N
			}else {
				isGridViewNfaSubgrid=false;
				snapshotData.isNFAPaginationGrid='true'; //No I18N
			}
		}*/
		if(snapDetailstype == 'TomcatSummary' || snapDetailstype == 'Summary' || snapDetailstype == 'UCSSummary' || snapDetailstype == 'HostDetails' || snapDetailstype == "SwitchSummary" || snapDetailstype == 'RouterSummary' || snapDetailstype == 'ConfigFileSummary') {
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Summary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "VersionSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.VersionSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "DraftSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.DraftSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'URLSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.URLSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'VOIPSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.VOIPSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}  else if(snapDetailstype == 'VideoSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.VideoSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'WANSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.WANSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IPAMPortSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPAMPortSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IPSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "IPAMSwitchSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPAMSwitchSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IPAMSubnetSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPAMSubnetSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IPAMDHCPSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPAMDHCPSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IntfSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IntfSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}else if(snapDetailstype == 'NFASubGrid') {//NO I18N
			isGridViewNfaSubgrid = true;
		}else if(snapDetailstype == 'NFAIntfSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFAIntfSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}else if(snapDetailstype == 'NfaAttacksSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NfaAttacksSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}else if(snapDetailstype == 'IPGroupSummary') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPGroupSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'NCMDeviceSummary' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NCMDeviceSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'ConfigDiff' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ConfigDiff(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'ConfigContent' //NO I18N
			|| snapDetailstype == 'CompareTo'//NO I18N
				 ) {
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.CompareTo(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'VMWareVMDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.VMWareVMDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}  else if(snapDetailstype == 'XenVMDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.XenVMDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'HyperVVMDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.HyperVVMDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'ESXDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ESXDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'oldESXDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.oldESXDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'oldVMInfo' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.oldVMInfo(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'XenDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.XenDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'xenPoolSummary' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.xenPoolSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'xenPoolDials' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.xenPoolDials(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'DatastoreSummary' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.DatastoreSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'HyperVDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.HyperVDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'VirtualDetails' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.VirtualDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'AssociatedDials' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.AssociatedDials(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'AssociatedGraphs' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.AssociatedGraphs(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'IPSLAGraphs' ) {//NO I18N
			isGridViewType = true;
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.IPSLAGraphs(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'FWAReportList' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.FWAReportList(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'FWAReportListOnDemand' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.FWAReportListOnDemand(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}else if(snapDetailstype == 'FWAReportData' ) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.FWAReportData(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}  else if(snapDetailstype == "RouterGraphs" || snapDetailstype == "IntfGraphs") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.RouterGraphs(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == 'Availability') {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Availability(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "BackupSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.BackupSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "ConfigSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ConfigSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "NFADevReport") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFADevReport(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "Conversation") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Grid(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,isNFAGeoLocation);
			},0);
		} else if(snapDetailstype == "ComplianceStatus" || snapDetailstype == "ConflictStatus") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ComplianceStatus(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "ResPolicySummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ResPolicySummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "PolicySummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.PolicySummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "Application") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Application(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "PieChart") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.PieChart(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "DeviceTraffic") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFAGraph(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "FWADeviceSummary") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.FWADeviceSummary(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "UCSRelationship") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.UCSRelationship(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "NFAGraph") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFAGraph(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "NFAGraphTable") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFAGraphTable(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "InterfaceTraffic") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.NFAGraph(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "ChangeTrend") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.ChangeTrend(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "Graph") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Graph(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} else if(snapDetailstype == "PortDetails") {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.PortDetails(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		} 
		
		if(isGridViewNfaSubgrid == true) {
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.isGridViewNfaSubgrid(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,isNFAGeoLocation);
			},0);
		} else if(snapDetailstype == "Grid" || (OPMClient.InventoryDeviceDetailsController.expandSnapWidget && isGridViewType && snapDetailstype !== 'IPSLAGraphs')) {//NO I18N
			setTimeout(function(){
				OPMClient.InventorySnapshotUIController.Grid(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType);
			},0);
		}
//		$('.select2').select2(); //No I18N
	},
	Summary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		if((snapDetailstype == 'Summary' || snapDetailstype == 'RouterSummary' || snapDetailstype == "SwitchSummary") && jsonData.opmdetails != null) {

			$('.DeviceDetails .DI-Header h2 > i').removeAttr('Class').addClass('opm_statusbar severity_'+jsonData.statusNum);
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.actions.deviceinfo.status",this)+"</div><div><i class='status_icon icon-status"+jsonData.statusNum+"'></i>"+jsonData.statusStr+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.view.ipaddress", this)+"</div><div>"+jsonData.opmdetails.IPAddress+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.dnsname", this)+"</div><div>"+jsonData.opmdetails.DNSName+"</div></div>"));
			if(shortSummary)
			{
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.type",this)+"</div><div>"+jsonData.opmdetails.Type+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.category",this)+"</div><div>"+jsonData.opmdetails.Category+"</div></div>"));
			}
			if(jsonData.opmdetails.dependentDisplayName!==undefined && jsonData.opmdetails.UpLinkDependency!==undefined && jsonData.opmdetails.UpLinkDependency!=="None"){
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.uplinkdependency",this)+"</div><div style='text-decoration:underline; cursor:pointer;' onclick='redirectToSnapshot(\"MonitoringDevice\",\""+jsonData.opmdetails.UpLinkDependency+"\")'>"+jsonData.opmdetails.dependentDisplayName+"</div></div>"));
			}
			else if(jsonData.opmdetails.UpLinkDependency!==undefined && jsonData.opmdetails.UpLinkDependency==="None"){
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.uplinkdependency",this)+"</div><div>"+jsonData.opmdetails.dependentDisplayName+"</div></div>"));
			}
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.vendor",this)+"</div><div>"+jsonData.vendorName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.objectdetails.sysdescr",this)+"</div><div>"+jsonData.opmdetails.SysDescription+"</div></div>"));
			var ncmDataAvailable = jsonData.ncmdetails != null && (jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE == null || jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE != true);
			OPMClient.InventoryDeviceDetailsController.isNCMDevice=ncmDataAvailable;
			if(ncmDataAvailable) {
				if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName == 'Cisco') {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.osversion",this)+"</div><div><a href='http://tools.cisco.com/security/center/selectIOSVersion.x' target='_blank'>"+jsonData.ncmdetails.OSVersion+"</a></div></div>"));
				} else {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.osversion",this)+"</div><div>"+jsonData.ncmdetails.OSVersion+"</div></div>"));
				}
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.systemlocation",this)+"</div><div>"+jsonData.ncmdetails.SystemLocation+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.syscontactperson",this)+"</div><div>"+jsonData.ncmdetails.SystemContact+"</div></div>"));
			}
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.url.pollusing",this)+"</div><div>"+jsonData.opmdetails.Monitoring+"</div></div>"));
			
			if(jsonData.nfadetails.NFAStatus == "Added") {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.flowanalysis",this)+"</div><div><i class='icon-status5'></i>&nbsp; "+jsonData.nfadetails.FlowType+"</div></div>"));
			} else if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.category == 'Router' || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.category == 'Switch'){ //No I18N
				var bLabel= '<a data-title="'+Ember.I18n.t("opm.device.summary.flowmonitoring.title", this)+'" class="heatmapStatus opmToolTipDesc" href="javascript:redirectSnapShot(\'NCMExportFlow\');">' + Ember.I18n.t('ncm.device.summary.enablenow', this) + '</a>';//No I18N
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.flowmonitoring",this)+"</div><div><i class='icon-status1'></i>&nbsp;"+bLabel+"</div></div>"));
			}
			
			if(ncmDataAvailable) {
				OPMClient.InventoryDeviceDetailsController.isNCMValidCredentials =jsonData.ncmdetails.CredentialValidity;
				OPMClient.InventoryDeviceDetailsController.isNCMSNMPCredentials = jsonData.ncmdetails.PROTOCOL.indexOf('SNMP') != -1;
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.configmanagement",this)+"</div><div><i class='icon-status5'></i>&nbsp;"+jsonData.ncmdetails.DeviceTemplateName+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.common.endofsupportdate",this)+"</div><div>"+jsonData.ncmdetails.ENDOFSUPPORTDATE+"</div></div>"));
				if(jsonData.ncmdetails.CredentialValidity == true) {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.logindetails.header",this)+"</div><div><i class='icon-status5'></i>&nbsp; "+jsonData.ncmdetails.PROTOCOL+"</div></div>"));
				} else {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.logindetails.header",this)+"</div><div><i class='icon-status1'></i>&nbsp; Credential not supplied</div></div>"));
				}
				if(jsonData.ncmdetails.SyslogChangeDetection == 'Enabled') {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SyslogChangeDetection", this)+"</div><div><i class='icon-status5'></i>&nbsp;</div></div>"));
				} else if(jsonData.ncmdetails.SyslogChangeDetection == 'Disabled')  { // No I18N
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SyslogChangeDetection", this)+"</div><div><i class='icon-status1'></i>&nbsp;</div></div>"));
				} else {
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SyslogChangeDetection", this)+"</div><div><i class='icon-status2'></i>&nbsp;"+Ember.I18n.t("webclient.common.na", this)+"</div></div>"));//No I18N
				}
			} else if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.category == 'Router' || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.category == 'Switch'){ //No I18N
				var bLabel= '<a data-title="'+Ember.I18n.t("opm.device.summary.backupnow.title", this)+'" class="heatmapStatus opmToolTipDesc" href="javascript:redirectSnapShot(\'AddToNCM\');">' + Ember.I18n.t('webclient.ncm.backup.now', this) + ' ?</a>';//No I18N
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.configmanagement",this)+"</div><div><i class='icon-status1'></i>&nbsp;"+bLabel+"</div></div>"));
			}
			if(jsonData.isStorage) {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.manufacturer",this)+"</div><div>"+jsonData.manufacturer+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.model",this)+"</div><div>"+jsonData.model+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.os",this)+"</div><div>"+jsonData.os+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.osversion",this)+"</div><div>"+jsonData.osVersion+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.serialnumber",this)+"</div><div>"+jsonData.serialNumber+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.totaldisks",this)+"</div><div>"+jsonData.totalDiskCapacity+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.allocateddisks",this)+"</div><div>"+jsonData.activeDiskCapacity+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.sparedisks",this)+"</div><div>"+jsonData.spareDiskCapacity+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.faileddisks",this)+"</div><div>"+jsonData.failedDiskCapacity+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.name.Volumes",this)+"</div><div>"+jsonData.totalVolumesCount+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.aggregates",this)+"</div><div>"+jsonData.totalAggregatesCount+"</div></div>"));
			}
			
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.pollint",this)+"</div><div>"+jsonData.opmdetails.PollInterval+"</div></div>"));
			if(deviceBasicDetails.ramSize!=="NA"){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ram",this)+"</div><div>"+deviceBasicDetails.ramSize+"</div></div>"));
			}
			if(deviceBasicDetails.hardDiskSize!=="NA"){
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.support.harddisksize",this)+" (GB)</div><div>"+deviceBasicDetails.hardDiskSize+"</div></div>"));//NO I18N
			}
			if(deviceBasicDetails.category === 'UPS' && deviceBasicDetails.upsStatus !== undefined)
			{
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.hardware.model",this)+"</div><div>"+deviceBasicDetails.upsStatus.model+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.batterystatus",this)+"</div><div>"+deviceBasicDetails.upsStatus.batteryStatus+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.batthealth",this)+"</div><div>"+deviceBasicDetails.upsStatus.batteryHealth+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.runtime",this)+"</div><div>"+deviceBasicDetails.upsStatus.runTimeRemaining+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.testdate",this)+"</div><div>"+deviceBasicDetails.upsStatus.lastSelfTestDate+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.testresult",this)+"</div><div>"+deviceBasicDetails.upsStatus.lastSelfTestResult+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.outputcurrent",this)+"</div><div>"+deviceBasicDetails.upsStatus.outputCurrent+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devicedetails.ups.outputvolts",this)+"</div><div>"+deviceBasicDetails.upsStatus.outputVolts+"</div></div>")); //No I18n
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.linkstatus",this)+"</div><div>"+deviceBasicDetails.upsStatus.linkStatus+"</div></div>")); //No I18n
			}
			if(OPMClient.ApplicationController.isAuthorized && !OPMClient.ApplicationController.isCentralServer) {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span class='pointer' onclick='changeDevicePasswordDetails(&#39;"+jsonData.opmdetails.DNSName+"&#39;);'>"+Ember.I18n.t("webclient.snapshot.password.changelink",this)+"</span></div></div>"));
			} else if(!OPMClient.ApplicationController.isCentralServer){
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span>"+Ember.I18n.t("webclient.device.usernotauthorized",this)+"</span></div></div>"));
			}
			if(ncmDataAvailable) {
				if(jsonData.ncmdetails.SHOWCOLUMN1) {
					$section.append($("<div class='DIGL-Row'><div>"+jsonData.ncmdetails.COLUMNNAME1+"</div><div>"+jsonData.ncmdetails.COLUMNVALUE1+"</div></div>"));
				}
				if(jsonData.ncmdetails.SHOWCOLUMN2) {
					$section.append($("<div class='DIGL-Row'><div>"+jsonData.ncmdetails.COLUMNNAME2+"</div><div>"+jsonData.ncmdetails.COLUMNVALUE2+"</div></div>"));
				}
				if(jsonData.ncmdetails.SHOWCOLUMN3) {
					$section.append($("<div class='DIGL-Row'><div>"+jsonData.ncmdetails.COLUMNNAME3+"</div><div>"+jsonData.ncmdetails.COLUMNVALUE3+"</div></div>"));
				}
			}
		} else if(snapDetailstype == 'HostDetails') {//NO I18N
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.status',this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.statusStr+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.ipaddress',this)+"</div><div>"+jsonData.opmdetails.IPAddress+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.dnsname',this)+"</div><div>"+jsonData.dnsName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.type',this)+"</div><div>"+jsonData.type+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.vendor',this)+"</div><div>"+jsonData.vendorName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.objectdetails.sysdescr",this)+"</div><div>"+jsonData.opmdetails.SysDescription+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.category',this)+"</div><div>"+jsonData.opmdetails.Category+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.details.tabs.monitoring',this)+"&nbsp; " +Ember.I18n.t('webclient.map.edit.mins',this)+ "</div><div>"+jsonData.opmdetails.PollInterval+"</div></div>")); //No I18N
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.uplinkdependency",this)+"</div><div>"+jsonData.opmdetails.dependentDisplayName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ram",this)+"</div><div>"+deviceBasicDetails.ramSize+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.support.harddisksize",this)+"</div><div>"+deviceBasicDetails.hardDiskSize+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.monitoringprotocol',this)+"</div><div>"+jsonData.opmdetails.Monitoring+"</div></div>"));
			if(OPMClient.ApplicationController.isAuthorized && !OPMClient.ApplicationController.isCentralServer) {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span class='pointer' onclick='changeDevicePasswordDetails(&#39;"+jsonData.opmdetails.DNSName+"&#39;);'>"+Ember.I18n.t("webclient.snapshot.password.changelink",this)+"</span></div></div>"));
			} else if(!OPMClient.ApplicationController.isCentralServer){
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span>"+Ember.I18n.t("webclient.device.usernotauthorized",this)+"</span></div></div>"));
			}
		} else if(snapDetailstype == 'ConfigFileSummary') {//NO I18N
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</div><div>"+jsonData.HostName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.ConfigurationType',this)+"</div><div>"+jsonData.FileType+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.agent.details.lastupdatedtime',this)+"</div><div>"+jsonData.CapturedOn+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.configVersion',this)+"</div><div>"+jsonData.VersionNo+"</div></div>"));
//			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.baselineversion',this)+"</div><div>"+jsonData.BASE_LINE_VERSION+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.associatedLabel',this)+"</div><div>"+jsonData.LabelName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('opu.views.ANNOTATION',this)+"</div><div>"+jsonData.Annotation+"</div></div>"));
			
			var imgUrl = Ember.I18n.t('widget.name.allConfigAuth',this); // No I18N
			if(jsonData.ChangeType === 1 || jsonData.ChangeType === '1') {
				imgUrl =  Ember.I18n.t('widget.name.allConfigUnAuth',this); // No I18N
			}
			
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('ncm.acd.Change_Type',this)+"</div><div>"+imgUrl+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.changedby',this)+"</div><div>"+jsonData.ChangedBy+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.backedupby',this)+"</div><div>"+jsonData.BackedupBy+"</div></div>"));
		} else if(snapDetailstype == 'UCSSummary') {//NO I18N
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.status',this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.statusStr+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.ipaddress',this)+"</div><div>"+jsonData.ipAddress+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.dnsname',this)+"</div><div>"+jsonData.dnsName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.type',this)+"</div><div>"+jsonData.type+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.vendor',this)+"</div><div>"+jsonData.vendorName+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.category',this)+"</div><div>"+jsonData.category+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.LastSysUpTime',this)+"</div><div>"+jsonData.ucsDetails.deviceDetails.lastSysUpTime+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.details.tabs.monitoring',this)+"&nbsp; " +Ember.I18n.t('webclient.map.edit.mins',this)+ "</div><div>"+jsonData.pollPeriod+"</div></div>")); //No I18N
			if(OPMClient.ApplicationController.isAuthorized) {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span class='pointer' onclick='changeDevicePasswordDetails(&#39;"+jsonData.dnsName+"&#39;);'>"+Ember.I18n.t("webclient.snapshot.password.changelink",this)+"</span></div></div>"));
			} else {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.action.passwords",this)+"</div><div><span>"+Ember.I18n.t("webclient.device.usernotauthorized",this)+"</span></div></div>"));
			}
		}
		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph'></section>");
		if(snapDetailstype != 'ConfigFileSummary') {
			var availabilityStr = "<div class='DIGG-Time' style='min-height:120px !important;'><b>"+Ember.I18n.t("webclient.device.monitors.snapshot.availabilitytimeline",this)+"</b><div class='DIGGT-Row'><div class='initialStatus'></div><div class='statusInfo' id='statusInfo'></div></div>"+
							"<div class='legend'>" +
							"<span class='availabilityStatus_1'>"+Ember.I18n.t("opu.common.UP_TIME",this)+"</span> " +
							"<span class='availabilityStatus_2'>"+Ember.I18n.t("webclient.availreport.seriesnames.onmaint",this)+"</span> " +
							"<span class='availabilityStatus_3'>"+Ember.I18n.t("webclient.availreport.seriesnames.dependunavail",this)+"</span>" +
							"<span class='availabilityStatus_4'>"+Ember.I18n.t("webclient.availreport.seriesnames.onhold",this)+"</span>" +
							"<span class='availabilityStatus_5'>"+Ember.I18n.t("webclient.devices.details.avail.downtime",this)+"</span>" +
							//"<span class='availabilityStatus_6'>"+Ember.I18n.t("webclient.availreport.seriesnames.parentdown",this)+"</span>" +
							"<span class='availabilityStatus_7'>"+Ember.I18n.t("webclient.devices.details.NotMonitored",this)+"</span>"+
							"</div></div>";
			
			$section.append($(availabilityStr));
		}
		
		if(snapDetailstype == 'RouterSummary'){
			var $dials = $("<div class='DIGG-Charts DIGG-Time'></div>");
			var $div = $('<div id="perfGraph'+snapId+'"></div>');
			$dials.append($div);
			$section.append($($dials));
			$sectionout.append($section);
			summaryWidgetElement.append($sectionout);
			
			var defaultOptions={colorScale:colorScale, onSelectEnabled:true,timeZone:jsonData.timeZone,timFormat:jsonData.format};
			opm_drawAvailabilityTimeLine("#statusInfo",jsonData.availability,defaultOptions);//No I18N
			
			$("#perfGraph"+snapId).attr('data-init','true');
			var perfGrapfSnapId = snapId;
//			var timeURL = "&TimeFrame="+getFormattedTimeframe("nfatime"); //No I18N
//			$.ajax({
//				type: 'GET', //No I18N
//				url: window.OPM.apiUrlPattern + "/v2/nfadevice/getDeviceReport?RouterIP="+OPMClient.InventoryDeviceDetailsController.ipAddress+timeURL,//No I18N
//				async: true,//No I18N
//				success: function(jsonData){
					var chartObj = {
						id : "perfGraph"+perfGrapfSnapId, //No I18N
						type : 'area', //No I18N
						jsonData : jsonData.nfadetails.devTraffic,
						series : "multi", //No I18N
						height : 250,
						columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Traffic", timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)}, //No I18N
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
									"text": "" //No I18N	
								}
							},
							"yaxis": [ //No I18N	
								{
									"label": { //No I18N	
										"text": jsonData.YAxis //No I18N	
									}
								}
							]
						},
						chart : {
							stacked : true
						}
					}
					
					if(reload) {
						var arraObj={
						    "placeholder":[],//No I18N
						    "chartobj":[]//No I18N
						}
						var mappingobj={};
						arraObj.chartobj.push(chartObj);
						arraObj.placeholder.push("perfGraph"+perfGrapfSnapId); //No I18N
						zChart(arraObj); 
					} else {
						addSnapshotChart(shortSummary, chartObj, "perfGraph"+perfGrapfSnapId); //No I18N
						reloadGridsterUl(snapId, reload);
					}
//				}
//			});
		} else if(snapDetailstype == 'SwitchSummary') {//NO I18N
			var $dials = $("<div class='DIGG-Charts DIGG-Time switchStatus'></div>");
			$dials.append($("<div class='spmswitchContainer' id='switchsnapshotContainer'><div class='spmswitchHolder' id='switchsnapshotresult'></div></div>"));
			$section.append($($dials));
			$sectionout.append($section);
			summaryWidgetElement.append($sectionout);
			var defaultOptions={colorScale:colorScale, onSelectEnabled:true,timeZone:jsonData.timeZone,timFormat:jsonData.format};
			opm_drawAvailabilityTimeLine("#statusInfo",jsonData.availability,defaultOptions);//No I18N
			drawSPMSwitchPortDetails(OPMClient.InventoryDeviceDetailsController.ipAddress);
			
		} else if(snapDetailstype == 'ConfigFileSummary') {//NO I18N
			var $dials = $("<div class='DIGG-Charts DIGG-Time'></div>");
			var $div = $('<div id="perfGraph'+snapId+'"></div>');
			$dials.append($div);
			$section.append($($dials));
			$sectionout.append($section);
			summaryWidgetElement.append($sectionout);
			for (var index = 0; index < jsonData.dataset.length; index++) {
				var array_element = jsonData.dataset[index];
				if(array_element.seriesname.indexOf(".") != -1) {
					array_element.seriesname=Ember.I18n.t(array_element.seriesname, this);
				}
			}
			$("#perfGraph"+snapId).attr('data-init','true');
			var chartObj = {
				id : 'perfGraph' + snapId, //No I18N
				type : 'bar', //No I18N
				jsonData : jsonData.dataset,
				subType: "smootharea", //No I18N	
				series : "multi", //No I18N
				height : 375,
				columns : {
					datatype_1 : 'time', //No I18N
					datatype_2 : 'numeric', //No I18N
					columnname_1 : "Date", //No I18N	
					columnname_2 : Ember.I18n.t("dashboard.name.ncmchanges", this), //No I18N
					timeFormat: "Datewise" //No I18N	
				},
				legend : {
					"colorBox": { //No I18N
			            "shape": "circle", //No I18N
			            "strokeOpacity": 1 //No I18N
			        },
			        "fontFamily": "'LatoRegular'", //No I18N
			        "fontSize": 16, //No I18N
//							        "itemHeight": "30",
					"hAlign": "center", //No I18N
					"vAlign": "bottom" //No I18N
				},
				"axes": { //No I18N	
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"label": { //No I18N	
							"text": "" //No I18N	
						},
						"ticklabel": { //No I18N	
							"rotation": 90 //No I18N	
						}
					},
					"yaxis": [ //No I18N	
						{
							"label": { //No I18N	
								"text": "Count" //No I18N	
							}
						}
					]
				},
				chart : {
					stacked : true
				}
			}
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph"+snapId); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph"+snapId); //No I18N
				reloadGridsterUl(snapId, reload);
			} 
		} else {
			var dialValue = 0;
			var packetLoss = 0;
			if(jsonData.availdata != null && jsonData.availdata.Up != undefined && Math.ceil(jsonData.availdata.Up) >= 0) {
				dialValue = Math.ceil(jsonData.availdata.Up);
			}
			if(jsonData.packetLoss != undefined && Math.ceil(jsonData.packetLoss) >= 0) {
				packetLoss = Math.ceil(jsonData.packetLoss);
			}
			
			if(jsonData.responseTime !== "NA")
			{
				jsonData.responseTime = (jsonData.responseTime).split('ms')[0];//No I18N
			}
			var isDevicePingable = true;

			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isDevicePingable !== undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isDevicePingable == "false")
			{
				isDevicePingable = false;
				dialValue = 0; //No I18N
				packetLoss = 0; //No I18N
				dialColor = "#7f7f7f"; //No I18N
				jsonData.responseTime = "NA"; //No I18N
				var notMoniArr = ["Not Monitored"];
				if(jsonData.todayTimeAvail !== undefined && jsonData.todayTimeAvail.todayStartTime !== undefined && jsonData.todayTimeAvail.endTimeVal)
				{
					notMoniArr = ["Not Monitored,"+jsonData.todayTimeAvail.todayStartTime+","+jsonData.todayTimeAvail.endTimeVal];//NO I18N
				}
				jsonData.availability = notMoniArr;
			}
			if(dialValue !== "NA")
			{
				if(dialValue < 0)
				{
					dialValue = 0;
				}
				else if(dialValue >100)
				{
					dialValue = 100; 
				}
			}
			if(packetLoss !== "NA")
			{
				if(packetLoss < 0)
				{
					packetLoss = 0;
				}
				else if(packetLoss >100)
				{
					packetLoss = 100;
				}
			}
			var $dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
			var availDataStr = "<div class='SpeedoMeter' id='opm_availabilityDial'>"+
								"<i class='CutCircle'></i>"+
								"<div ><b>"+dialValue+" <i>% </i></b></div>"+
								"<i>"+Ember.I18n.t("webclient.devices.details.avail",this)+"</i>"+ //No I18N
								"</div>";
			$dials.append($(availDataStr));
			
			availDataStr =  "<div class='SpeedoMeter' id='opm_packetLossDial'>";//No I18N
			if(window.OPM.userPermissions.monitoringWrite && !shortSummary && !window.OPM.isCentralServer && isDevicePingable){
				availDataStr+="<i class='icon-configedit edit ConfigPacketLoss' onClick='editResponseThreshold(&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;,&#39;OpManagerDesktopObjectStatusPoll&#39;,&#39;stat&#39;,&#39;Packet_Loss&#39;,true)'></i>";//No I18N
			}
			availDataStr+="<i class='CutCircle'></i><div ><b>"+packetLoss+" <i>% </i></b></div><i>"+Ember.I18n.t("opu.common.PACKET_LOSS",this)+"</i></div>";//No I18N
			$dials.append($(availDataStr));
			
			availDataStr =  "<div class='dialcounter' id='opm_responseTimeDial'>";//No I18N
			if(window.OPM.userPermissions.monitoringWrite && !shortSummary && !window.OPM.isCentralServer && isDevicePingable){
				availDataStr+="<i class='icon-configedit edit ConfigRespTime' onClick='editResponseThreshold(&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;,&#39;OpManagerDesktopObjectStatusPoll&#39;,&#39;stat&#39;,&#39;Device&#39;,true)'></i>";//No I18N
			}
			
			if(jsonData.responseTime !== "NA")
			{
				availDataStr+="<div ><b>"+jsonData.responseTime+"<i>ms</i></b></div><i>"+Ember.I18n.t('webclient.home.server.responsetime.column.time',this)+"</i></div>";//No I18N
			}else{
				availDataStr+="<div ><b>"+jsonData.responseTime+"</b></div><i>"+Ember.I18n.t('webclient.home.server.responsetime.column.time',this)+"</i></div>";//No I18N

			}
			
			$dials.append($(availDataStr));
			
			$section.append($($dials));
			$sectionout.append($section);
			summaryWidgetElement.append($sectionout);
			if(isDevicePingable)
			{
			addDialClickEvent('opm_responseTimeDial', 'responseTime');//NO I18N
			addDialClickEvent('opm_packetLossDial', 'packetLoss');//NO I18N
			}
			var defaultOptions={colorScale:colorScale, onSelectEnabled:true,timeZone:jsonData.timeZone,timFormat:jsonData.format};
			opm_drawAvailabilityTimeLine("#statusInfo",(jsonData.availability != undefined)?jsonData.availability:jsonData.availdata,defaultOptions);//No I18N
			
			var dialDivName = "opm_availabilityDial"; //No I18N
			var pollId = "availability"; //No I18N
			var dialColor = "#f37273";	//No I18N
			$("#"+dialDivName).attr("data-dialValue",dialValue);	
			if(Math.round(dialValue) === 100)
			{
				dialColor = "#76d284"; //No I18N
			}
			
		    if(!isDevicePingable && dialValue === 0)	
			{
				dialColor = "#7f7f7f"; //No I18N
			} 
			opm_drawDialChart(dialDivName,dialValue,dialColor);
			if(isDevicePingable)
			{
			$("#"+dialDivName).click(function(e){
				redirectSnapShot("DialGraph/Availability"); //No I18N
			});
			$("#"+dialDivName).css("cursor", "pointer");
			}
			var dialDivName = "opm_packetLossDial"; //No I18N
			var pollId = "packetLoss"; //No I18N
			var dialValue = packetLoss;
			var dialColor = "#76d284";	 //No I18N
			$("#"+dialDivName).attr("data-dialValue",dialValue);	
			
			if(Math.round(dialValue) > 80)
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
			}
			if(!isDevicePingable  && dialValue === 0)	
			{
				dialColor = "#7f7f7f"; //No I18N
			}
			opm_drawDialChart(dialDivName,dialValue,dialColor);
			
			$(".Summary .DIAC-block .DIACB").each(function(e){
	   	  	if($(this).find(".SpeedoMeter").length === 0)
	   	  	{
	   	  		$(this).parent().hide();	
	   	  	}
	   	  	else
	   	  	{
	   	  		$(this).parent().show();		
	   	  	}
			});
		} 
		opm_customTooltip();
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	VersionSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		if(jsonData.BASE_LINE_VERSION == jsonData.versionId) {
			$(".baselineDiff").hide();
		}
		
		if(jsonData.VersionNo == 1) {
			$(".prevDiff").hide();
		}
		
		if(jsonData.FileType == "Startup") {
			$(".runningDiff").show();
			$(".startupdiff").hide();
			if(jsonData.Startup == jsonData.versionId) {
				$(".currentDiff").hide();
			}
		} else {
			$(".startupdiff").show();
			$(".runningDiff").hide();
			if(jsonData.Running == jsonData.versionId) {
				$(".currentDiff").hide();
			}
		}
		
		var summaryWidgetElement = widgetElement;
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		$sectionout = $("<section class='DI-Grid configVersion'></section>");
		$section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		$section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</div><div>"+jsonData.HostName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.ConfigurationType',this)+"</div><div>"+jsonData.FileType+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.capturedon',this)+"</div><div>"+jsonData.CapturedOn+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.configVersion',this)+"</div><div>"+jsonData.VersionNo+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.associatedLabel',this)+"</div><div>"+jsonData.LabelName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('opu.views.ANNOTATION',this)+"</div><div>"+jsonData.Annotation+"</div></div>"));
		
		var imgUrl = Ember.I18n.t('widget.name.allConfigAuth',this); // No I18N
		if(jsonData.ChangeType === 1 || jsonData.ChangeType === '1') {
			imgUrl =  Ember.I18n.t('widget.name.allConfigUnAuth',this); // No I18N
		}
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('ncm.acd.Change_Type',this)+"</div><div>"+imgUrl+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.changedby',this)+"</div><div>"+jsonData.ChangedBy+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.backedupby',this)+"</div><div>"+jsonData.BackedupBy+"</div></div>"));
		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph diffdetailsWidget summary'></section>");
		var $div = $("<div></div>");
		$section.append($div);
		var addedC = 0;
		var modifiedC = 0;
		var deletedC = 0;
		var funtionParams = "";
		if(jsonData.prevDiff != null) {
			$(".prevDiff").show();
			addedC = jsonData.prevDiff.addedCount;
			modifiedC = jsonData.prevDiff.modifiedCount;
			deletedC = jsonData.prevDiff.deltedCount;
			funtionParams = '"'+jsonData.prevDiff.LEFT_RESOURCE_NAME+'","'+jsonData.prevDiff.LEFT_FILE_TYPE+'","'+jsonData.prevDiff.LEFT_VERSION_NO+'","'+jsonData.prevDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
			jsonData.prevDiff.LEFT_CONFIG_ID+'","'+jsonData.prevDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.prevDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
			jsonData.prevDiff.RIGHT_VERSION_NO+'","'+jsonData.prevDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.prevDiff.RIGHT_CONFIG_ID+'"'; // No I18N
		} else {
			$(".prevDiff").hide();
		}
		
		$div.append($("<div class=\"opm_widget_title\">Diff with previous<div class=\"dashboardWidgetIcons\"></div></div>"));
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");' class=\"diffdetails addedlines\" data-count='"+addedC+"'>Added</div>")); // No I18N
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+", \"Modified\");' class=\"diffdetails modifiedlines\" data-count='"+modifiedC+"'>Modified</div>")); // No I18N
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+", \"Deleted\");' class=\"diffdetails deletedlines\" data-count='"+deletedC+"'>Deleted</div>")); // No I18N
		$div = $("<div></div>");
		$section.append($div);
		addedC = 0;
		modifiedC = 0;
		deletedC = 0;
		if(jsonData.baselineDiff != null && !jsonData.baselineDiff.SAME_BASELINE) {
			addedC = jsonData.baselineDiff.addedCount;
			modifiedC = jsonData.baselineDiff.modifiedCount;
			deletedC = jsonData.baselineDiff.deltedCount;
			funtionParams = '"'+jsonData.baselineDiff.LEFT_RESOURCE_NAME+'","'+jsonData.baselineDiff.LEFT_FILE_TYPE+'","'+jsonData.baselineDiff.LEFT_VERSION_NO+'","'+jsonData.baselineDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
			jsonData.baselineDiff.LEFT_CONFIG_ID+'","'+jsonData.baselineDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.baselineDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
			jsonData.baselineDiff.RIGHT_VERSION_NO+'","'+jsonData.baselineDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.baselineDiff.RIGHT_CONFIG_ID+'"'; // No I18N
			$div.append($("<div class=\"opm_widget_title\">Diff with baseline<div class=\"dashboardWidgetIcons\"></div></div>"));
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");' class=\"diffdetails addedlines\" data-count='"+addedC+"'>Added</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Modified\");' class=\"diffdetails modifiedlines\" data-count='"+modifiedC+"'>Modified</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Deleted\");' class=\"diffdetails deletedlines\" data-count='"+deletedC+"'>Deleted</div>")); // No I18N
		}
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$sectionout = $('<section class="opmForm"><div class="opmFormCol fullCol"><textarea id="configContent" readonly class="configcontent" style="min-height:500px;"></textarea></div></section>');
			$contentdiv.append($sectionout);
			$("#configContent").text(jsonData.Content);
			$('#configContent').elastic();
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	DraftSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid configVersion' style='min-height: 0 !important;'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</div><div>"+jsonData.RESOURCENAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.ConfigurationType',this)+"</div><div>"+jsonData.FILETYPE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.configVersion',this)+"</div><div>"+jsonData.VERSION+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.addnotes.time',this)+"</div><div>"+jsonData.modifiedOn+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('opu.views.OWNER',this)+"</div><div>"+jsonData.ownerName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('opu.views.ANNOTATION',this)+"</div><div>"+jsonData.Annotation+"</div></div>"));
		OPMClient.InventoryDeviceDetailsController.set("ncmDraftDownloadAllowed", jsonData.isDwdAllowed); // No I18N
		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph diffdetailsWidget summary'></section>");
		var $div = $("<div></div>");
		$section.append($div);
		var addedC = 0;
		var modifiedC = 0;
		var deletedC = 0;
		if(jsonData.baseVersionDiff != null) {
			addedC = jsonData.baseVersionDiff.addedCount;
			modifiedC = jsonData.baseVersionDiff.modifiedCount;
			deletedC = jsonData.baseVersionDiff.deltedCount;
			funtionParams = '"'+jsonData.baseVersionDiff.LEFT_RESOURCE_NAME+'","'+jsonData.baseVersionDiff.LEFT_FILE_TYPE+'","'+jsonData.baseVersionDiff.LEFT_VERSION_NO+'","'+jsonData.baseVersionDiff.LEFT_CONFIG_TYPE+'","'+// No I18N
			jsonData.baseVersionDiff.LEFT_CONFIG_ID+'","'+jsonData.baseVersionDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.baseVersionDiff.RIGHT_FILE_TYPE+'","'+// No I18N
			jsonData.baseVersionDiff.RIGHT_VERSION_NO+'","'+jsonData.baseVersionDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.baseVersionDiff.RIGHT_CONFIG_ID+'"';// No I18N
		}
		$div.append($("<div class=\"opm_widget_title\">Diff with base-version<div class=\"dashboardWidgetIcons\"></div></div>"));
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");' class=\"diffdetails addedlines\" data-count='"+addedC+"'>Added</div>")); // No I18N
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+", \"Modified\");' class=\"diffdetails modifiedlines\" data-count='"+modifiedC+"'>Modified</div>")); // No I18N
		$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+", \"Deleted\");' class=\"diffdetails deletedlines\" data-count='"+deletedC+"'>Deleted</div>")); // No I18N
		$div = $("<div></div>");
		$section.append($div);
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$sectionout = $('<section class="opmForm"><div class="opmFormCol fullCol"><textarea id="configContent" readonly class="configcontent" style="min-height:500px;"></textarea></div></section>');
			$contentdiv.append($sectionout);
			$("#configContent").text(jsonData.FILE_CONTENTS);
			$('#configContent').elastic();
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	URLSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		$("#deviceShortSummary .StatusColor").removeAttr('class').addClass("StatusColor severity_"+jsonData.details.status);
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid' style='height: 250px !important; min-height: 250px !important;'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.graphs.graphname", this)+"</div><div>"+jsonData.details.urlName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.status", this)+"</div><div><i class='icon-status"+jsonData.details.status+"'></i>&nbsp;"+jsonData.details.stringstatus+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.url.url", this)+"</div><div>"+jsonData.details.smartUrl+"</div></div>"));
		if(jsonData.details.parentKey !== undefined && jsonData.details.parentKey !== "NULL")
		{
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.parentname", this)+"</div><div class='pointer' onclick='redirectToDeviceSnapshot(&#39;"+jsonData.details.parentKey+"&#39;);'>"+jsonData.details.deviceName+"</div></div>"));
		}
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.url.match", this)+"</div><div>"+jsonData.details.matchContent+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.nextpoll", this)+"</div><div>"+jsonData.details.nextPoll+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.lastpoll", this)+"</div><div>"+jsonData.details.lastPolled+"</div></div>"));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		
		var $dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		var availUpValue = Math.round(jsonData.details.AvailabilityImagePath.Up);

		if(availUpValue !== "NA")
			{
				if(availUpValue < 0)
				{
					availUpValue = 0; 
				}
				else if(availUpValue >100)
				{
					availUpValue = 100; 
				}
			}
		var availDataStr = "<div class='SpeedoMeter' id='AvailabilityGaugeDiv'>"+
							"<i class='CutCircle'></i>"+
							"<div ><b>"+availUpValue+" <i>% </i> </b></div>"+
							"<i>"+Ember.I18n.t("webclient.devices.details.avail", this)+"</i>"+ //No I18N
							"</div>";
		$dials.append($(availDataStr));
		
		if(jsonData.details.responseTime === "No Response"){
			jsonData.details.responseTime = "NA"; //No I18N
		}

		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>";//No I18N
		if(window.OPM.isAuthorized && !shortSummary && !window.OPM.isCentralServer){
			availDataStr += "<i class='icon-configedit edit ConfigRespTime' onClick='editResponseThreshold(&#39;"+jsonData.details.name+"&#39;,&#39;OpManagerUrlStatusPoll&#39;,&#39;stat&#39;,&#39;Url&#39;,true)'></i>";//No I18N
		}
		availDataStr+="<div ><b>"+jsonData.details.responseTime+"<i>ms</i></b></div><i style='bottom: 20px;'>"+Ember.I18n.t("webclient.home.server.responsetime.column.time", this)+"</i></div>";//No I18N
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		addDialClickEvent('responseTimeDiv', 'urlResponseTime');//NO I18N
		
		
		var dialDivName = "AvailabilityGaugeDiv"; //No I18N
		var pollId = "availability"; //No I18N
		var dialColor = "#f37273";	//No I18N
		$("#"+dialDivName).attr("data-dialValue", jsonData.details.AvailabilityImagePath.Up);	
		if(Math.round(jsonData.details.AvailabilityImagePath.Up) === 100)
		{
			dialColor = "#76d284"; //No I18N
		}
		opm_drawDialChart(dialDivName,jsonData.details.AvailabilityImagePath.Up,dialColor);
		$("#"+dialDivName).click(function(e){
			redirectSnapShot("DialGraph/Availability"); //No I18N
		});
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
		OPMClient.InventoryURLController.set('urlSummaryObj',jsonData);// No I18N
	},
	VOIPSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		$(".timeFilterList").hide();
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("colDet.collName", this)+"</div><div>"+jsonData.monitorName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.actions.deviceinfo.status", this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.status+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIpAdd", this)+"</div><div>"+jsonData.deviceName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.dstIpAdd", this)+"</div><div>"+jsonData.targetDisplayName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIOS", this)+"</div><div>"+jsonData.iosVersion+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.details.properties.modttime',this)+"</div><div>"+jsonData.lastUpdated+"</div></div>"));
		//$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.LastOper", this)+"</div><div>"+jsonData.operimg+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div></div><div></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.Codec", this)+"</div><div>"+jsonData.codec+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.PacketSize", this)+"</div><div>"+jsonData.packetSize+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.WAN.Frequency', this)+"</div><div>"+jsonData.frequency+"</div></div>"));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		
		var $dials = $("<div class='DIGG-Time'></div>");
		
		if(jsonData.dials != null && jsonData.dials[0] != undefined && jsonData.dials.length == 3) {
			var jsonObj = {"latencySD":jsonData.digitalMeters[0].Latency,"PktLossSD":jsonData.digitalMeters[1].PacketLoss,"avgJitterSD":jsonData.dials[0].avgJitterSD,"avgJitterDS":jsonData.dials[1].avgJitterDS,"avgRTT":jsonData.dials[2].avgRTT}; //No I18N
		} else {
			var jsonObj = {"latencySD":jsonData.digitalMeters[0].Latency,"PktLossSD":jsonData.digitalMeters[1].PacketLoss,"avgJitterSD":0,"avgJitterDS":0,"avgRTT":0}; //No I18N
		}
		
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='dstsrcJitter_div'>"+
		"<div ><b>"+jsonObj.avgJitterSD+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.srcdstJitter', this)+"</i>"+
		"</div>";

		$dials.append($(availDataStr));
		
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='dstsrcJitter_div'>"+
		"<div ><b>"+jsonObj.avgJitterDS+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.dstsrcJitter', this)+"</i>"+
		"</div>";

		$dials.append($(availDataStr));

		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='roundTripTime_div'>"+
		"<div ><b>"+jsonObj.avgRTT+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ipsla.allnodes.rttime', this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));

		$section.append($($dials));
		
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");

		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonObj.PktLossSD+" %</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("ipsla.srcdstPacketLoss", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonObj.latencySD+"ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("ipsla.srcdstLatency", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		$section.append($($dials));
		
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	VideoSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);					
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("colDet.collName", this)+"</div><div>"+jsonData.monitorName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("colDet.state", this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.status+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIpAdd", this)+"</div><div>"+jsonData.deviceName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.dstIpAdd", this)+"</div><div>"+jsonData.targetDisplayName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIOS", this)+"</div><div>"+jsonData.iosVersion+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.details.properties.modttime', this)+"</div><div>"+jsonData.lastUpdated+"</div></div>"));
		//$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.LastOper", this)+"</div><div>"+jsonData.operimg+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div></div><div></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.Codec", this)+"</div><div>"+jsonData.codec+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.PacketSize", this)+"</div><div>"+jsonData.packetSize+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.WAN.Frequency', this)+"</div><div>"+jsonData.frequency+"</div></div>"));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		
		var $dials = $("<div class='DIGG-Time'></div>");
		
		if(jsonData.dials != null && jsonData.dials[0] != undefined && Object.keys(jsonData.dials[0]).length > 0) {
			var jsonObj = {
					"VideoJitterSD":jsonData.dials[0].VideoJitterSD, //No I18N
					"VideoAvgIAJitterSrc":jsonData.dials[1].VideoAvgIAJitterSrc,
					"VideoAvgIAJitterDst":jsonData.dials[2].VideoAvgIAJitterDst,
					"LatencySD":jsonData.digitalMeters[0].LatencySD,
					"AvgPosNegJitter":jsonData.digitalMeters[1].AvgPosNegJitter
				}
		} else {
			var jsonObj = {
					"VideoJitterSD":0, //No I18N
					"VideoAvgIAJitterSrc":0, //No I18N
					"VideoAvgIAJitterDst":0, //No I18N
					"LatencySD":jsonData.digitalMeters[0].LatencySD,
					"AvgPosNegJitter":jsonData.digitalMeters[1].AvgPosNegJitter
				}
		}
		
		/*var availDataStr = "<div class='SpeedoMeter' id='VideoJitterSD_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonObj.VideoJitterSD)+" % </b></div>"+
		"<i>"+Ember.I18n.t("ipsla.srcdstJitter", this)+"</i>"+ //No I18N
		"</div>";*/

		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='VideoJitterSD_div'>"+
		"<div ><b>"+jsonObj.VideoJitterSD+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.srcdstJitter', this)+"</i>"+
		"</div>";

		$dials.append($(availDataStr));
		
		/*availDataStr = "<div class='SpeedoMeter' id='VideoAvgIAJitterSrc_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonObj.VideoAvgIAJitterSrc)+" % </b></div>"+
		"<i>"+Ember.I18n.t("ipsla.avgiajitteratsrc", this)+"</i>"+ //No I18N
		"</div>";*/

		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='VideoAvgIAJitterSrc_div'>"+
		"<div ><b>"+jsonObj.VideoAvgIAJitterSrc+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.avgiajitteratsrc', this)+"</i>"+
		"</div>";
		
		$dials.append($(availDataStr));
		
		/*availDataStr = "<div class='SpeedoMeter' id='VideoAvgIAJitterDst_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonObj.VideoAvgIAJitterDst)+" % </b></div>"+
		"<i>"+Ember.I18n.t("ipsla.avgiajitteratdst", this)+"</i>"+ //No I18N
		"</div>";*/

		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='VideoAvgIAJitterDst_div'>"+
		"<div ><b>"+jsonObj.VideoAvgIAJitterDst+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.avgiajitteratdst', this)+"</i>"+
		"</div>";
		
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonObj.AvgPosNegJitter+"%</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("ipsla.posandnegavg", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div><b>"+jsonObj.LatencySD+"ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("ipsla.srcdstLatency", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		$section.append($($dials));
		
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	WANSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);					
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("colDet.collName", this)+"</div><div>"+jsonData.monitorName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.admin.downtimescheduler.status', this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.status+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIpAdd", this)+"</div><div>"+jsonData.deviceName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.dstIpAdd", this)+"</div><div>"+jsonData.targetDisplayName+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.srcIOS", this)+"</div><div>"+jsonData.iosVersion+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fault.details.properties.modttime', this)+"</div><div>"+jsonData.lastUpdated+"</div></div>"));
	//	$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.LastOper", this)+"</div><div>"+jsonData.operimg+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div></div><div></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ipsla.PacketSize", this)+"</div><div>"+jsonData.packetSize+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.WAN.Frequency', this)+"</div><div>"+jsonData.frequency+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.admin.services.TimeOut', this)+"</div><div>"+jsonData.timeout+"</div></div>"));

		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		
		var $dials = $("<div class='DIGG-Time'></div>");
		
		if(jsonData.dials != null && jsonData.dials[0] != undefined && Object.keys(jsonData.dials[0]).length > 0) {

			var jsonObj = {
				"minRTT":jsonData.dials[0].minRTT, //No I18N
				"maxRTT":jsonData.dials[0].maxRTT, //No I18N
				"avgRTT":jsonData.dials[0].avgRTT,//No I18N 
				"icmpEcho":jsonData.digitalMeters[0].ThresholdViolation,
				"icmpErrors":jsonData.digitalMeters[1].Errors
			}
		} else {
			var jsonObj = {
					"minRTT":0, //No I18N
					"maxRTT":0, //No I18N
					"avgRTT":0, //No I18N
					"icmpEcho":jsonData.digitalMeters[0].ThresholdViolation,
					"icmpErrors":jsonData.digitalMeters[1].Errors
				}
		}
		
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='minRTT_div'>"+
		"<div ><b>"+jsonObj.minRTT+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.MinRtt', this)+"</i>"+
		"</div>";
		
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='avgRTT_div'>"+
		"<div ><b>"+jsonObj.avgRTT+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.AverageRtt', this)+"</i>"+
		"</div>";

		
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='maxRTT_div'>"+
		"<div ><b>"+jsonObj.maxRTT+" ms</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('ipsla.MaxRtt', this)+"</i>"+
		"</div>";
		
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonObj.icmpEcho+" %</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("ipsla.rtt.violation", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonObj.icmpErrors+" %</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.intftypes.errors', this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		$section.append($($dials));
		
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	IPAMPortSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var info = jsonData.result[0];
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IFINDEX", this)+"</div><div>"+info['connected-port-ifindex']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.PORT", this)+"</div><div>"+info['connected-switch-port']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IFNAME", this)+"</div><div>"+info['connected-port-ifname']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IF_SPEED", this)+"</div><div>"+info['connected-port-speed']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IF_DESCR", this)+"</div><div>"+info['connected-port-ifdesc']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.common.IF_ALIAS", this)+"</div><div>"+info['connected-port-ifalias']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IF_TYPE", this)+"</div><div>"+info['connected-port-iftype']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IFMTU", this)+"</div><div>"+info['connected-port-ifmtu']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.STATUS", this)+"</div><div>"+info['operational-status']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.ADMIN_STATUS", this)+"</div><div>"+info['admin-status']+"</div></div>"));
		$section.append($(showOpUtilsCustomColumnNames("SPMPortLevelCustomField",info)));
		$sectionout.append($section1);
		
		$section1 = $("<section class='DIG-Graph'></section>");
		$section = $("<section style='left: 0px;min-height: 150px !important; overflow: auto;' class='DIG-List'></section>");
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IP_ADDRESS", this)+"</div><div>"+info['connected-ip']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this)+"</div><div>"+info['connected-mac']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.DNS_NAME", this)+"</div><div>"+info['connected-dns']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.iphone.device.type", this)+"</div><div>"+info['device-type']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.avail", this)+"</div><div>"+info['scan-status']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.VLANID", this)+"</div><div>"+info.vlan+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.VLAN_NAME", this)+"</div><div>"+info['vlan-name']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.LOGGED_ON_USER", this)+"</div><div>"+info['logged-on-user']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.PHYSICAL_LOCATION", this)+"</div><div>"+info['port-location']+"</div></div>"));
		$section1.append($section);
		$sectionout.append($section1);
		summaryWidgetElement.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	IPSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ipaddress", this)+"</div><div>"+info['ip-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this)+"</div><div>"+info['mac-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IP_TO_DNS", this)+"</div><div>"+info['ip-to-dns']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.DNS_TO_IP", this)+"</div><div>"+info['dns-to-ip']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.gmap.status", this)+"</div><div>"+info.status+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.addServer.ostype", this)+"</div><div>"+info['device-type']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.RESERVED_STATUS", this)+"</div><div>"+info['reserved-status']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.DNS_STATUS", this)+"</div><div>"+info['dns-status']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.ASSET_TAG", this)+"</div><div>"+info['asset-tag']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.LAST_ALIVE_TIME", this)+"</div><div>"+info['last-alive-time']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.LAST_SCAN_TIME", this)+"</div><div>"+info['last-scan-time']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SYS_NAME", this)+"</div><div>"+info['system-name']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.NIC_TYPE", this)+"</div><div>"+info['nic-type']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.properties.SysDescription", this)+"</div><div>"+info['system-description']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.ALIAS_NAME", this)+"</div><div>"+info['alias-name']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.systemlocation", this)+"</div><div>"+info.location+"</div></div>"));
		$section.append($(showOpUtilsCustomColumnNames("IPAMIPLevelCustomField",info)));
		$sectionout.append($section1);
		
		$section1 = $("<section class='DIG-Graph'></section>");
		$section = $("<section style='left: 0px;min-height: 150px !important; overflow: auto;' class='DIG-List'></section>");
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SWITCH_NAME", this)+"</div><div>"+info['connected-switch']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.appmanager.port", this)+"</div><div>"+info['connected-switch-port']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IFINDEX", this)+"</div><div>"+info['connected-port-ifindex']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ifname", this)+"</div><div>"+info['connected-port-ifname']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.common.IF_ALIAS", this)+"</div><div>"+info['connected-port-ifalias']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.IF_SPEED", this)+"</div><div>"+info['connected-port-speed']+"</div></div>"));
		$section1.append($section);
		$sectionout.append($section1);
		summaryWidgetElement.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	IPAMSwitchSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.ipAddress", this)+"</div><div>"+info['ip-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.dnsname", this)+"</div><div>"+info['ip-to-dns']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.snapshot.systemlocation", this)+"</div><div>"+info['system-location']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.iphone.device.type", this)+"</div><div>"+info['switch-type']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.topo.objectdetails.sysdescr", this)+"</div><div>"+info['system-description']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vimonitor.devices.snapshot.LastSysUpTime", this)+"</div><div>"+info['sysuptime-original']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SCAN_STATUS", this)+"</div><div>"+info['scan-status']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.LAST_SCAN_TIME", this)+"</div><div>"+info['last-scan-time']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_ADDRESS", this)+"</div><div>"+info['subnet-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.mac", this)+"</div><div>"+info['mac-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SYS_NAME", this)+"</div><div>"+info['system-name']+"</div></div>"));
		$section.append($(showOpUtilsCustomColumnNames("SPMSwitchLevelCustomField",info)));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		var $dials = $("<div class='DIGG-Time'></div>");
		
		var info = jsonData.result;
		var availDataStr = "<div class='SpeedoMeter' id='usedPercentage_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+info.usedPercentage+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("opu.views.USED_PORTS",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div class='SpeedoMeter' id='tansPercentage_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+info.transientPercentage+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("opu.views.TRANSIENT_PORTS",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div class='SpeedoMeter' id='available-count_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+info.availablePercentage+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("opu.views.AVAILABLE_PORTS",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		$section.append($($dials));
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='total-count_div'>"+
		"<div ><b>"+info['total-count']+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("opu.views.TOTAL_PORTS",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='used-count_div'>"+
		"<div ><b>"+info['available-count']+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("opu.views.AVAILABLE_PORTS",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
			
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='vlan-count_div'>"+
		"<div ><b>"+info['vlan-count']+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("opu.views.VLAN_PORT",this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		var dialDivName = "usedPercentage_div"; //No I18N
		var dialValue = info.usedPercentage;
		$("#"+dialDivName).attr("data-dialValue",dialValue);	
		opm_drawDialChart(dialDivName,dialValue,"#fa5b5a");	//NO I18N
		
		var dialDivName = "tansPercentage_div"; //No I18N
		var dialValue = info.transientPercentage;
		$("#"+dialDivName).attr("data-dialValue",dialValue);	
		
		opm_drawDialChart(dialDivName,dialValue,"#faad5a");//NO I18N
		
		
		var dialDivName = "available-count_div"; //No I18N
		var dialValue = info.availablePercentage;
		$("#"+dialDivName).attr("data-dialValue",dialValue);	
		opm_drawDialChart(dialDivName,dialValue,"#46bb7d");//NO I18N
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	IPAMSubnetSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var info = jsonData.rows[0];
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_ADDRESS", this)+"</div><div>"+info['subnet-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_NAME", this)+"</div><div>"+info['subnet-name']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_MASK", this)+"</div><div>"+info['subnet-mask']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_SIZE", this)+"</div><div>"+info['subnet-size']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SUBNET_USAGE", this)+"</div><div>"+info.usedPercentage+" %</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.LAST_SCAN_TIME", this)+"</div><div>"+info['last-scan-time']+"</div></div>"));
		//$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vlan.name", this)+"</div><div>"+info['vlan-name']+"</div></div>"));
		//$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.googlemap.info.location", this)+"</div><div>"+info.location+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.flash.Ticket_Description", this)+"</div><div>"+info['subnet-description']+"</div></div>"));
		$section.append($(showOpUtilsCustomColumnNames("SubnetLevelCustomField",info)));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		var $dials = $("<div class='DIGG-Time'></div>");
		var availDataStr = "<div class='SpeedoMeter' id='usedIps'>"+
							"<i class='CutCircle'></i>"+
							"<div ><b>"+info.usedPercentage+" <i>% </i></b></div>"+
							"<i>"+Ember.I18n.t("opu.views.USED_IPS", this)+"</i>"+ //No I18N
							"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='transientIps'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+info.transientPercentage+" <i>% </i></b></div>"+
		"<i>"+Ember.I18n.t("opu.views.TRANSIENT_IPS", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='availableIps'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+info.availablePercentage+" <i>% </i></b></div>"+
		"<i>"+Ember.I18n.t("opu.views.AVAILABLE_IPS", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='totalIPs'>"+
		"<div ><b>"+info['subnet-size']+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("opu.views.TOTAL_IPS", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		var dialDivName = "usedIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",info.usedPercentage);	
		
		opm_drawDialChart(dialDivName,info.usedPercentage,"#fa5b5a");//NO I18N
		
		var dialDivName = "transientIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",info.transientPercentage);	
		
		opm_drawDialChart(dialDivName,info.transientPercentage,"#faad5a");//NO I18N
		
		var dialDivName = "availableIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",info.availablePercentage);	
		opm_drawDialChart(dialDivName,info.availablePercentage,"#46bb7d");//NO I18N
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	IPAMDHCPSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var summaryWidgetElement = widgetElement;
		$sectionout = $("<section class='DI-Grid'></section>");
		$section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		$section = $("<div></div>");
		$section1.append($section);
		var info = jsonData.result[0];
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.mailserver.mailservername", this)+"</div><div>"+info['dhcp-server-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.TOTAL_IPS", this)+"</div><div>"+info['total-ips-count']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this)+"</div><div>"+info['mac-address']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.ipam.dhcp.LEASED_IPS", this)+"</div><div>"+info['leased-ips-count']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.dnsname", this)+"</div><div>"+info['ip-to-dns']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.ipam.dhcp.RESERVED_IPS", this)+"</div><div>"+info['reserved-ips-count']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.ipam.NO_OF_SCOPES", this)+"</div><div>"+info['total-scopes-count']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.ipam.dhcp.AVAILABLE_IPS_FOR_LEASE", this)+"</div><div>"+info['availble-ips-for-lease']+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("opu.views.SCAN_STATUS", this)+"</div><div>"+info['scan-status']+"</div></div>"));
		$sectionout.append($section1);
		var reservedip=info['reserved-ips-percentage'];
		var leasedip=info['leased-ips-percentage'];
		var availableip=info['avail-ips-for-leased-percentage'];
		$section = $("<section class='DIG-Graph'></section>");
		var $dials = $("<div class='DIGG-Time'></div>");
		var availDataStr = "<div class='SpeedoMeter' id='leasedIps'>"+
							"<i class='CutCircle'></i>"+
							"<div ><b>"+leasedip+" <i> % </i></b></div>"+
							"<i>"+Ember.I18n.t("opu.ipam.dhcp.LEASED_IPS", this)+"</i>"+ //No I18N
							"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='reservedIps'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+reservedip+" <i>% </i></b></div>"+
		"<i>"+Ember.I18n.t("opu.ipam.dhcp.RESERVED_IPS", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='availableIps'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+availableip+" <i>% </i></b></div>"+
		"<i>"+Ember.I18n.t("opu.ipam.dhcp.AVAILABLE_IPS_FOR_LEASE", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);

		var dialDivName = "leasedIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",leasedip);	
		opm_drawDialChart(dialDivName,leasedip,"#fa5b5a");//NO I18N

		var dialDivName = "reservedIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",reservedip);	
		opm_drawDialChart(dialDivName,reservedip,"#faad5a");//NO I18N
		
		var dialDivName = "availableIps"; //No I18N
		$("#"+dialDivName).attr("data-dialValue",availableip);	
		opm_drawDialChart(dialDivName,availableip,"#46bb7d");//NO I18N
	}
	,
	IntfSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var indexVal = jsonData.instance;
		var devicename = jsonData.name;
		jsonData.availability.Up = Math.ceil(jsonData.availability.Up);
		jsonData.txUtil = (jsonData.txUtil==="NA") ? "NA":Math.round(jsonData.txUtil); //No I18n
		jsonData.rxUtil = (jsonData.rxUtil==="NA") ? "NA":Math.round(jsonData.rxUtil); //No I18n


		jsonData.adminStatusIcon = "icon-intfStatus"+jsonData.ifAdminStatus;//No I18N			
		jsonData.operStatusIcon = "icon-intfStatus"+jsonData.ifOperStatus;//No I18N
		jsonData.intfStatusIcon = "opm_statusbar severity_"+jsonData.status;//No I18N			

		OPMClient.InventoryDeviceDetailsController.set("index",indexVal); //No I18N			
		OPMClient.InventoryDeviceDetailsController.set("deviceName",devicename); //No I18N
		var intfTypeID = jsonData.typeId;
		if(intfTypeID !== undefined || intfTypeID !== "")
		{
			OPMClient.InventoryDeviceDetailsController.set("intfTypeID",intfTypeID); //No I18N
		}
		
		var summaryWidgetElement = widgetElement;
		$("#deviceShortSummary .StatusColor").removeAttr('class').addClass("StatusColor severity_"+jsonData.status);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.view.adminstat", this)+"</div><div><i class='"+jsonData.adminStatusIcon+"'></i>"+jsonData.adminState+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.view.operstat", this)+"</div><div><i class='"+jsonData.operStatusIcon+"'></i>"+jsonData.operState+"</div></div>"));

		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.vimonitor.devices.snapshot.ipaddress", this)+"</div><div>"+(jsonData.IntfIpaddress !== undefined ? jsonData.IntfIpaddress : '')+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ifname", this)+"</div><div>"+(jsonData.ifName !== undefined ? jsonData.ifName : '')+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.ifalias", this)+"</div><div>"+(jsonData.ifAlias !== undefined ? jsonData.ifAlias : '')+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.circuitid", this)+"</div><div>"+(jsonData.CircuitID !== undefined ? jsonData.CircuitID : '')+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.hctraffic", this)+"</div><div>"+jsonData.trafficCounter+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.index", this)+"</div><div>"+jsonData.instance+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.physadd", this)+"</div><div>"+jsonData.ifPhysAddr+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.type", this)+"</div><div>"+jsonData.typeIdDescr+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.hctraffic", this)+"</div><div>"+jsonData.trafficCounter+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.url.pollusing", this)+"</div><div>"+jsonData.statusPolledVia+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.parentname", this)+"</div><div><a href=javascript:redirectToDeviceSnapshot('"+jsonData.name+"')>"+jsonData.displayName+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.properties.SysDescription", this)+"</div><div>"+jsonData.desc+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.enduser.Bandwidth", this)+" ("+Ember.I18n.t("webclient.interface.graph.rx", this)+")</div><div>"+jsonData.recBandwidth+"</div></div>"));//NO I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.enduser.Bandwidth", this)+" ("+Ember.I18n.t("webclient.interface.graph.tx", this)+")</div><div>"+jsonData.transBandwidth+"</div></div>"));//NO I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.traffic', this)+" ("+Ember.I18n.t("webclient.interface.graph.rx", this)+")</div><div>"+(jsonData.inTraffic==="NA" ? "NA":jsonData.inTraffic+"bps")+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.traffic', this)+" ("+Ember.I18n.t("webclient.interface.graph.tx", this)+")</div><div>"+(jsonData.outTraffic==="NA"?"NA":jsonData.outTraffic+"bps")+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.reports.createreport.utilization", this)+" ("+Ember.I18n.t("webclient.interface.graph.rx", this)+")</div><div>"+(jsonData.rxUtil==="NA"?"NA":jsonData.rxUtil+" %")+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.reports.createreport.utilization", this)+" ("+Ember.I18n.t("webclient.interface.graph.tx", this)+")</div><div>"+(jsonData.txUtil==="NA"?"NA":jsonData.txUtil+" %")+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.packets", this)+" ("+Ember.I18n.t("webclient.interface.graph.rx", this)+")</div><div>"+jsonData.rxPackets+"</div></div>"));//NO I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.packets", this)+" ("+Ember.I18n.t("webclient.interface.graph.tx", this)+")</div><div>"+jsonData.txPackets+"</div></div>"));//NO I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.interface.packetsize", this)+" ("+Ember.I18n.t("webclient.interface.graph.rx", this)+")</div><div>"+(jsonData.avgInPackets==="NA"?"NA":jsonData.avgInPackets+" "+Ember.I18n.t('webclient.ipsla.snapshot.bytes',this))+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.interface.packetsize", this)+" ("+Ember.I18n.t("webclient.interface.graph.tx", this)+")</div><div>"+(jsonData.avgOutPackets==="NA"?"NA":jsonData.avgOutPackets+" "+Ember.I18n.t('webclient.ipsla.snapshot.bytes',this))+"</div></div>")); //No I18n
		
		
		
		var utilValue = ""; //No I18n
		if(jsonData.Util === "NA")
		{
			utilValue = Ember.I18n.t("webclient.devices.details.notenabled", this); //No I18n
		}
		else if(jsonData.Util === "5")
		{
			utilValue = Ember.I18n.t("webclient.devices.details.normal", this); //No I18n
		}
		if(jsonData.Util === "2")
		{
			utilValue = Ember.I18n.t("webclient.devices.details.threshold", this); //No I18n
		} 

		var errorValue = ""; //No I18n
		if(jsonData.Errors === "NA")
		{
			errorValue = Ember.I18n.t("webclient.devices.details.notenabled", this); //No I18n
		}
		else if(jsonData.Errors === "5")
		{
			errorValue = Ember.I18n.t("webclient.devices.details.normal", this);	//No I18n
		}
		if(jsonData.Errors === "2")
		{
			errorValue = Ember.I18n.t("webclient.devices.details.threshold", this);	//No I18n
		} 

		var discardsValue = ""; //No I18n
		if(jsonData.Discards === "NA")
		{
			discardsValue = Ember.I18n.t("webclient.devices.details.notenabled", this); //No I18n
		}
		else if(jsonData.Discards === "5")
		{
			discardsValue = Ember.I18n.t("webclient.devices.details.normal", this);	//No I18n
		}
		if(jsonData.Discards === "2")
		{
			discardsValue = Ember.I18n.t("webclient.devices.details.threshold", this);	//No I18n
		} 

		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.intfgraph.Utilization", this)+" ("+Ember.I18n.t("webclient.common.widgets.monitors", this)+")</div><div>"+(utilValue)+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.intftypes.errors", this)+"</div><div>"+(errorValue)+"</div></div>")); //No I18n
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.intftypes.discards", this)+"</div><div>"+(discardsValue)+"</div></div>")); //No I18n
		
		
		
		
		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph'></section>");
		
		if(jsonData.availability.Up == undefined || !opm_validateNumberVal(jsonData.availability.Up) || jsonData.availability.Up <0) {
			jsonData.availability.Up = 0;
		}
		else if(jsonData.availability.Up >100)
		{
			jsonData.availability.Up = 100;
		}

		if(jsonData.rxUtil == undefined || !opm_validateNumberVal(jsonData.rxUtil) || jsonData.rxUtil <0) {
			jsonData.rxUtil = 0;
		}
		else if(jsonData.rxUtil >100)
		{
			 jsonData.rxUtil =100
		}
		
		if(jsonData.txUtil == undefined || !opm_validateNumberVal(jsonData.txUtil) || jsonData.txUtil <0) {
			jsonData.txUtil = 0;
		}
		else if(jsonData.txUtil > 100)
		{
			jsonData.txUtil = 100;
		}
		var $dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		var availDataStr = "<div class='SpeedoMeter' id='opm_availabilityDial'>"+
							"<i class='CutCircle'></i>"+
							"<div ><b>"+jsonData.availability.Up+" <i>% </i> </b></div>"+
							"<i>"+Ember.I18n.t("webclient.devices.details.avail", this)+"</i>"+ //No I18N
							"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='opm_rxUtilDial'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+jsonData.rxUtil+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("webclient.devices.details.rx", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr =  "<div class='SpeedoMeter' id='opm_txUtilDial'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+jsonData.txUtil+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("webclient.devices.details.tx", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		
		$section.append($($dials));
		
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);
		
		
		var dialDivName = "opm_availabilityDial"; //No I18N
		var pollId = "availability"; //No I18N
		var dialColor = "#f37273";	//No I18N
		$("#"+dialDivName).attr("data-dialValue", jsonData.availability.Up);	
		if(Math.round(jsonData.availability.Up) === 100)
		{
			dialColor = "#76d284"; //No I18N
		}
		opm_drawDialChart(dialDivName,jsonData.availability.Up,dialColor);
		$("#"+dialDivName).click(function(){
			redirectSnapShot("DialGraph/Availability");//NO I18N
		});
		$("#"+dialDivName).css("cursor", "pointer");
		var dialDivName = "opm_rxUtilDial"; //No I18N
		var pollId = "packetLoss"; //No I18N
		var dialColor = "#76d284";	 //No I18N
		$("#"+dialDivName).attr("data-dialValue",jsonData.rxUtil);	
		if(Math.round(jsonData.rxUtil) > 80)
		{
			dialColor = "#f37273"; //No I18N
		}
		else if(Math.round(jsonData.rxUtil) <=80 && Math.round(jsonData.rxUtil) > 60)
		{
			dialColor = "#f5c673"; //No I18N
		}
		else
		{
			dialColor = "#76d284"; //No I18N
		}
		opm_drawDialChart(dialDivName,jsonData.rxUtil,dialColor);
		var dialDivName = "opm_txUtilDial"; //No I18N
		var pollId = "packetLoss"; //No I18N
		var dialColor = "#76d284";	 //No I18N
		$("#"+dialDivName).attr("data-dialValue",jsonData.txUtil);	
		
		if(Math.round(jsonData.txUtil) > 80)
		{
			dialColor = "#f37273"; //No I18N
		}
		else if(Math.round(jsonData.txUtil) <=80 && Math.round(jsonData.txUtil) > 60)
		{
			dialColor = "#f5c673"; //No I18N
		}
		else
		{
			dialColor = "#76d284"; //No I18N
		}
		opm_drawDialChart(dialDivName,jsonData.txUtil,dialColor);
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
   	  	if($(this).find(".SpeedoMeter").length === 0)
   	  	{
   	  		$(this).parent().hide();	
   	  	}
   	  	else
   	  	{
   	  		$(this).parent().show();		
   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	NFAIntfSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid netFlowDIGrid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var tempStatusArr=[5,6,1,2];
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.Status", this)+"</div><div><i title='"+jsonData.traffic[0].StatusTxt+"' class='icon-status"+tempStatusArr[jsonData.statusNum]+"'></i></div></div>"));
		$section.append($("<div class='DIGL-Row pointer nfaSummaryEdit'><div>"+Ember.I18n.t("webclinet.inventory.nfa.bandwidthcapacity", this)+" "+Ember.I18n.t("NFAWidget.IN", this)+"</div><div><span id='bandwidthcapacityIN'>"+jsonData.iSpeed+"</span> "+Ember.I18n.t("webclinet.billing.bps", this)+"</div></div>"));
		$section.append($("<div class='DIGL-Row pointer nfaSummaryEdit'><div>"+Ember.I18n.t("webclinet.inventory.nfa.bandwidthcapacity", this)+" "+Ember.I18n.t("NFAWidget.OUT", this)+"</div><div><span id='bandwidthcapacityOUT'>"+jsonData.oSpeed+"</span> "+Ember.I18n.t("webclinet.billing.bps", this)+"</div></div>"));
		$section.append($("<div class='DIGL-Row pointer nfaSummaryEdit'><div>"+Ember.I18n.t("widget.typename.nfainterface", this)+" "+Ember.I18n.t("webclient.map.type", this)+"</div><div>"+jsonData.iType+"</div></div>"));
		$section.append($("<div class='DIGL-Row pointer nfaSummaryEdit'><div>"+Ember.I18n.t("webclinet.inventory.nfa.samplingrate", this)+"</div><div>"+jsonData.samplingRate+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclinet.inventory.nfa.nbarcbqos", this)+"</div><div>"+jsonData.isNBAR+"</div></div>"));
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>");
		
		var $dials = $("<div class='DIGG-Time'></div>");
		
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].IN+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("NFAWidget.speedin", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].OUT+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("NFAWidget.spdout", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		
		
		availDataStr = "<div class='SpeedoMeter' id='util_in_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonData.traffic[0].UtilIN)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("NFAWidget.utilin", this)+"</i>"+ //No I18N
		"</div>";
		
		$dials.append($(availDataStr));
		
		availDataStr = "<div class='SpeedoMeter' id='util_out_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonData.traffic[0].UtilOUT)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("NFAWidget.utilout", this)+"</i>"+ //No I18N
		"</div>";
		
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].alert+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("webclinet.inventory.nfa.alerts", this)+"</i>"+
		"</div>";

		$dials.append($(availDataStr));
		$section.append($($dials));
		$sectionout.append($section);
		summaryWidgetElement.append($sectionout);

		nfa_drawDial("util_in_div",jsonData.traffic[0].UtilIN);//No I18N
		nfa_drawDial("util_out_div",jsonData.traffic[0].UtilOUT);//No I18N
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
	   	  	if($(this).find(".SpeedoMeter").length === 0) {
	   	  		$(this).parent().hide();	
	   	  	}else {
	   	  		$(this).parent().show();		
	   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
		$('.nfaSummaryEdit').click(function() {
			redirectSnapShot("NFASummaryEdit");//NO I18N
		});*/
	},
	NfaAttacksSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*var summaryWidgetElement = widgetElement;
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		var tempSeverityObj={"Info":5,"Warning":2,"Major":3,"Critical":1} //No I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.sort.severity", this)+"</div><div><i title='"+jsonData.eSummary.Severity+"' class='icon-status"+tempSeverityObj[jsonData.eSummary.Severity]+"'></i></div></div>"));
		$('#nameOnly').attr('title',jsonData.eSummary.EventMsg).html(jsonData.eSummary.EventMsg);//NO I18N
		$.each(jsonData.esumList, function(indexNew, val) {
			$section.append($("<div class='DIGL-Row'><div style='padding-left: 3px;'>"+val[0]+"</div><div>"+val[1]+"</div></div>"));
		});
		$('.nbaEventActions li[data-value="'+jsonData.eSummary.Status+'"]').hide();
		if(jsonData.eSummary.Status === 'Open') {
			$('.nbaEventActions li[data-value="Close"]').show();
		}else{
			$('.nbaEventActions li[data-value="Open"]').show();
		}
		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph'></section>");
		var $dials = $("<div class='DIGG-Time'></div>");

		var srcOccupency=(jsonData.SepCount/jsonData.SepTot) *100;
		var desOccupency=(jsonData.DepCount/jsonData.DepTot) *100;
	
		if(srcOccupency>100) {
			srcOccupency=100;
		}
		if(desOccupency>100) {
			desOccupency=100;
		}

		availDataStr = "<div class='SpeedoMeter' id='srcOccupency_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(srcOccupency)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("webclient.nba.attacks.srcoccupancy", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div class='SpeedoMeter' id='dstOccupency_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(desOccupency)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("webclient.nba.attacks.dstoccupancy", this)+"</i>"+ //No I18N
		"</div>";
		$dials.append($(availDataStr));

		availDataStr = "<div class='nfaSemiDonut'><div id='sourceSpan_div'></div></div>"; //No I18N
		$dials.append($(availDataStr));	

		availDataStr = "<div class='nfaSemiDonut'><div id='dstSpan_div'></div></div>"; //No I18N
		$dials.append($(availDataStr));

		$section.append($($dials));
		$sectionout.append($section);					
		summaryWidgetElement.append($sectionout);

		nfa_drawDial("srcOccupency_div",srcOccupency);//No I18N
		nfa_drawDial("dstOccupency_div",desOccupency);//No I18N

		var chartDataValues = [
			["Src IP",jsonData.SipCount],
			["Src Port",jsonData.SportCount]
		];
		nfa_drawSemiDonut('sourceSpan_div',chartDataValues)//No I18N

		var chartDataValues = [
			["Dst IP",jsonData.DipCount],
			["Dst Port",jsonData.DportCount]
		];
		nfa_drawSemiDonut('dstSpan_div',chartDataValues)//No I18N
							
		$(".Summary .DIAC-block .DIACB").each(function(e){
	   	  	if($(this).find(".SpeedoMeter").length === 0) {
	   	  		$(this).parent().hide();	
	   	  	}else {
	   	  		$(this).parent().show();		
	   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}*/
	},
	IPGroupSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		
		var $sectionout = $("<section class='DI-Grid netFlowDIGrid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$('#nameOnly').attr('title',jsonData.traffic[0].Name).html(jsonData.traffic[0].Name);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.name", this)+"</div><div>"+jsonData.traffic[0].Name+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclinet.nfa.maxspeed", this)+"</div><div>"+jsonData.traffic[0].speed+"</div></div>"));
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FlowIPGroup") {
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.auditreport.description", this)+"</div><div>"+jsonData.traffic[0].desc+"</div></div>"));
			if(OPMClient.ApplicationController.isIpGrpBandWidthEnabled) {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclinet.inventory.allocatedbandwidth", this)+"</div><div>"+jsonData.traffic[0].bandwidth+"</div></div>"));
			}
		}

		$sectionout.append($section1);
		$section = $("<section class='DIG-Graph'></section>");
		var $dials = $("<div class='DIGG-Time'></div>");
		var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].IN+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("NFAWidget.speedin", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].OUT+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("NFAWidget.spdout", this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		$section.append($($dials));
		
		$dials = $("<div class='DIGG-Dials DIGG-Time'></div>");
		availDataStr = "<div class='SpeedoMeter' id='util_in_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonData.traffic[0].UtilIN)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("NFAWidget.utilin", this)+"</i>"+ //No I18N
		"</div>";
		
		$dials.append($(availDataStr));
		
		availDataStr = "<div class='SpeedoMeter' id='util_out_div'>"+
		"<i class='CutCircle'></i>"+
		"<div ><b>"+Math.round(jsonData.traffic[0].UtilOUT)+" <i>% </i> </b></div>"+
		"<i>"+Ember.I18n.t("NFAWidget.utilout", this)+"</i>"+ //No I18N
		"</div>";
		
		$dials.append($(availDataStr));
		
		availDataStr = "<div style='position:relative !important;' class='dialcounter' id='responseTimeDiv'>"+
		"<div ><b>"+jsonData.traffic[0].alert+"</b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t("webclient.devices.details.alarm", this)+"</i>"+
		"</div>";

		$dials.append($(availDataStr));
		$section.append($($dials));
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		
		nfa_drawDial("util_in_div",jsonData.traffic[0].UtilIN);//No I18N
		nfa_drawDial("util_out_div",jsonData.traffic[0].UtilOUT);//No I18N
		
		$(".Summary .DIAC-block .DIACB").each(function(e){
	   	  	if($(this).find(".SpeedoMeter").length === 0) {
	   	  		$(this).parent().hide();	
	   	  	}else {
	   	  		$(this).parent().show();		
	   	  	}
		});
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}*/
	},
	NCMDeviceSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.view.ipaddress", this)+"</div><div>"+jsonData.devDetails.IPAddress+"</div></div>"));//No I18N
//		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.fault.addnotes.device_name", this)+"</div><div>"+jsonData.devDetails.HostName+"</div></div>"));//No I18N
		
		var cred = Ember.I18n.t("webclient.inventory.ncmCredentials",this);//No I18N
		var imgUrl = "/apiclient/fluidicv2/img/ncm/notready_ico.gif";//No I18N
		var credTitle = Ember.I18n.t('ncm.device.summary.applycred.title', this);//NO I18N
		var validCredentials = jsonData.devDetails.CredentialValidity;
		if(jsonData.devDetails.CredentialValidity) {//No I18N
			cred = jsonData.devDetails.PROTOCOL;
			imgUrl = "/apiclient/fluidicv2/img/ncm/ready_ico.gif";//No I18N
			credTitle = Ember.I18n.t('ncm.device.summary.updatecred.title', this);//NO I18N
		} 
		if(jsonData.devDetails.managed == false || jsonData.devDetails.manageState == 'false') {
			cred = "";
			imgUrl = "/apiclient/fluidicv2/img/ncm/icon_disable.gif";//No I18N
		}
		if(jsonData.devDetails.managed != false || jsonData.devDetails.manageState != 'false' && OPMClient.ApplicationController.isAuthorized) {
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.name.credentialStatus", this)+"</div><div><a data-title='"+credTitle+"' class='heatmapStatus opmToolTipDesc' style='cursor:pointer' href='javascript:redirectSnapShot(\"NCMCredentials\");'><img src='"+imgUrl+"'></img>&nbsp;&nbsp;"+cred+"</a></div></div>"));//No I18N
		} else {
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.name.credentialStatus", this)+"</div><div><img src='"+imgUrl+"'></img>&nbsp;&nbsp;"+cred+"</div></div>"));//No I18N
		}
		
//		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.devices.details.type", this)+"</div><div>"+jsonData.devDetails.DeviceType+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.DeviceTemplateName", this)+"</div><div>"+jsonData.devDetails.DeviceTemplateName+"</div></div>"));
		if(validCredentials) {
			// Backup Status
			var bStatus=jsonData.confDetails.BackupStatus;
			var bLabel = '';
			var color = '';
			var backed_up = true;
			if(bStatus==='SUCCESS'){//No I18N
				bLabel=Ember.I18n.t('fwa.compliance.compSuccessMsg',this);//No I18N
				bLabel = "<i class='icon-status5'></i>&nbsp;";//No I18N
			} else if(bStatus==='FAILURE') {//NO I18N
				if(validCredentials && jsonData.devDetails.PROTOCOL.indexOf('SNMP') == -1) {
					bLabel='<a data-title="'+Ember.I18n.t("ncm.device.summary.testcredential.title", this)+'" class="heatmapStatus opmToolTipDesc" href="javascript:OPMClient.InventoryDeviceDetailsController.snapshotTestCredentials=true;redirectSnapShot(\'NCMCredentials\');">' + Ember.I18n.t('webclient.map.testCredential',this)+ '</a>';//No I18N
				} else {
					bLabel= '<a href="javascript:OPMClient.Inventory.ncmBackupConfig('+OPMClient.InventoryDeviceDetailsController.selDevice+');">' + Ember.I18n.t('webclient.ncm.backup.now', this) + ' ?</a>';//No I18N
				}
				bLabel = "<i class='icon-status1'></i>&nbsp;" + bLabel;	//No I18N
			} else {
				backed_up = false;
				if(validCredentials) {
					bLabel= '<a href="javascript:OPMClient.Inventory.ncmBackupConfig('+OPMClient.InventoryDeviceDetailsController.selDevice+');">' + Ember.I18n.t('webclient.ncm.backup.now', this) + ' ?</a>';//No I18N
				} else {
					bLabel = Ember.I18n.t("ncm.Util.GraphUtil.Not_Backed_Up", this);//NO I18N
				}
				bLabel = "<i class='icon-status3'></i>&nbsp;" + bLabel;	//No I18N
			}
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.config.backup.status", this)+"</div><div>"+bLabel+"</div></div>"));
			
			//Change tracking
			var changeTrackingLabel = "";
			var changeTrackingTitle = "";
			if(jsonData.devDetails.SyslogChangeDetection == 'Enabled') {
				changeTrackingLabel = "<i class='icon-status5'></i>&nbsp;" // No I18N
			} else if(jsonData.devDetails.SyslogChangeDetection == 'Disabled')  { // No I18N
				changeTrackingTitle = Ember.I18n.t("ncm.device.summary.changeDetection.title", this);//NO I18N
				if(validCredentials && jsonData.devDetails.PROTOCOL.indexOf('SNMP') == -1) {
					changeTrackingLabel = "<a data-title='"+changeTrackingTitle+"' class='heatmapStatus opmToolTipDesc' href='javascript:redirectSnapShot(\"NCMChangeDetection\");'><i class='icon-status1'></i>&nbsp;"+Ember.I18n.t("ncm.device.summary.enablenow", this)+" </a>";
				} else {
					changeTrackingTitle = Ember.I18n.t("ncm.device.summary.changedetection.snmp.title", this) + "<br><br>" + changeTrackingTitle;//NO I18N
					changeTrackingLabel = "<span data-title='"+changeTrackingTitle+"' class='pointer heatmapStatus opmToolTipDesc'><i class='icon-status3'></i>&nbsp;" + Ember.I18n.t("webclient.general.notavailable", this) + "</span>";// No I18N
				}
			} else {
				changeTrackingTitle = Ember.I18n.t("ncm.device.summary.changeDetection.title", this);//NO I18N
				if(validCredentials && jsonData.devDetails.PROTOCOL.indexOf('SNMP') == -1) {
					changeTrackingLabel = "<a data-title='"+changeTrackingTitle+"' class='heatmapStatus opmToolTipDesc' href='javascript:redirectSnapShot(\"NCMChangeDetection\");'><i class='icon-status3'></i>&nbsp;"+Ember.I18n.t("ncm.device.summary.enablenow", this)+" </a>";
				} else {
					if(jsonData.devDetails.PROTOCOL.indexOf('SNMP') != -1) {
						changeTrackingTitle = Ember.I18n.t("ncm.device.summary.changedetection.snmp.title", this) + "<br><br>" + changeTrackingTitle;//NO I18N
					}
					changeTrackingLabel = "<span data-title='"+changeTrackingTitle+"' class='pointer heatmapStatus opmToolTipDesc'><i class='icon-status3'></i>&nbsp;" + Ember.I18n.t("webclient.general.notavailable", this) + "</span>";// No I18N
				}
			}
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SyslogChangeDetection", this)+"</div><div>"+changeTrackingLabel+"</div></div>"));//No I18N		
			if(backed_up) {
				var runningConfigFound = jsonData.confDetails.Running != undefined && jsonData.confDetails.Running.versionId != undefined && jsonData.confDetails.Running.versionId != 'None';//NO I18N
				var startupConfigFound = jsonData.confDetails.Startup != undefined && jsonData.confDetails.Startup.versionId != undefined && jsonData.confDetails.Startup.versionId != 'None';//NO I18N
				var conflictTitle = '';
				var baselineVersion = (runningConfigFound)?jsonData.confDetails.RunningBaseline.versionId:jsonData.confDetails.StartupBaseline.versionId;
				var runnngVersion = (runningConfigFound)?jsonData.confDetails.Running.versionId:jsonData.confDetails.Startup.versionId;
				if(!runningConfigFound) {
					jsonData.confDetails.Running = jsonData.confDetails.Startup;
				}
				var baselineRuningConflict = jsonData.confDetails.baseRunninConflict;
				if(baselineRuningConflict.not_backed_up != true) {
					if(baselineRuningConflict.conflict){
						conflictLabel=Ember.I18n.t('js.commonstr.InventoryModelConflictDetected',this);//No I18N
						conflictTitle = Ember.I18n.t('ncm.device.summary.view.baselineRunningDiff', this);//NO I18N
						conflictLabel = "<a data-title='"+conflictTitle+"' class='heatmapStatus opmToolTipDesc' href='javascript:OPMClient.InventoryNCMActionController.openDiffcompareTo("+baselineVersion+","+runnngVersion+");'><i class='icon-status1'></i>&nbsp;"+conflictLabel+" </a>";//No I18N
					} else {
						conflictLabel=Ember.I18n.t('js.commonstr.InventoryModelInsync',this);//No I18N
						conflictTitle = Ember.I18n.t('ncm.InventoryImageTr.baseline_running_sync', this);//NO I18N
						conflictLabel = "<span data-title='"+conflictTitle+"' class='heatmapStatus opmToolTipDesc'><i class='icon-status5'></i>&nbsp;" + conflictLabel + '</span>';//No I18N
					}
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("widget.name.current.baselineRunningConflict", this)+"</div><div>"+conflictLabel+"</div></div>"));//No I18N
				}
				if(startupConfigFound && runningConfigFound) {
					var startupRuningConflict = jsonData.confDetails.startupRunninConflict;
					conflictTitle = '';
					if(startupRuningConflict.not_backed_up != true) {
						if(startupRuningConflict.conflict) {
							conflictLabel=Ember.I18n.t('js.commonstr.InventoryModelConflictDetected',this);//No I18N
							conflictTitle = Ember.I18n.t('ncm.device.summary.view.startupRunningDiff', this);//NO I18N
							conflictLabel = "<a data-title='"+conflictTitle+"' class='heatmapStatus opmToolTipDesc' href='javascript:OPMClient.InventoryNCMActionController.openDiffcompareTo("+jsonData.confDetails.Startup.versionId+","+jsonData.confDetails.Running.versionId+");'><i class='icon-status1'></i>&nbsp;"+conflictLabel+" </a>";//No I18N
						} else {
							conflictLabel=Ember.I18n.t('js.commonstr.InventoryModelInsync',this);//No I18N
							conflictTitle = Ember.I18n.t('ncm.InventoryImageTr.startup_running_sync', this);//NO I18N
							conflictLabel = "<span data-title='"+conflictTitle+"' class='heatmapStatus opmToolTipDesc'><i class='icon-status5'></i>&nbsp;" + conflictLabel + '</span>';//No I18N
						}
						$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("widget.name.current.startupRunningConflict", this)+"</div><div>"+conflictLabel+"</div></div>"));//No I18N
					}
				}
				if(runningConfigFound) {
					var runningconfigVersion=jsonData.confDetails.Running.versionId;
					var runningconfigFile=jsonData.confDetails.Running.versionNo;
					var baselineconfigVersion=jsonData.confDetails.RunningBaseline.versionId;
					var baselineconfigFile=jsonData.confDetails.RunningBaseline.versionNo;
					var RunningConfigsLabel = '<a class="pointer" href="javascript:redirectToSnapshot(\'ConfigChange\', '+runningconfigVersion+')">' + Ember.I18n.t("jsp.commonstr.CurrentVersion", this) + ' ( ' + runningconfigFile + ' )</a> , <a class="pointer" href="javascript:redirectToSnapshot(\'ConfigChange\', '+baselineconfigVersion+')">' + Ember.I18n.t("jsp.commonstr.baselineversion", this) + ' ( ' + baselineconfigFile+' ) </a>';
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.device.running.config", this)+"</div><div>"+RunningConfigsLabel+"</div></div>"));
				}
				
				if(startupConfigFound) {
					var startupBaselineconfigVersion=jsonData.confDetails.StartupBaseline.versionId;
					var startupBaselineconfigFile=jsonData.confDetails.StartupBaseline.versionNo;
					var startupconfigVersion=jsonData.confDetails.Startup.versionId;
					var startupconfigFile=jsonData.confDetails.Startup.versionNo;
					var StartupConfigsLabel = '<a class="pointer" href="javascript:redirectToSnapshot(\'ConfigChange\', '+startupconfigVersion+')">' + Ember.I18n.t("jsp.commonstr.CurrentVersion", this) + ' ( ' + startupconfigFile + ' ) </a> , <a class="pointer" href="javascript:redirectToSnapshot(\'ConfigChange\', '+startupBaselineconfigVersion+')">' + Ember.I18n.t("jsp.commonstr.baselineversion", this) + ' ( ' + startupBaselineconfigFile+' ) </a>';
					$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.device.sartup.config", this)+"</div><div>"+StartupConfigsLabel+"</div></div>"));
				}
			}
			
			//Compliance Status
			var compCritical=jsonData.confDetails.CriticalCount;
			var compMajor=jsonData.confDetails.MajorCount;
			var comptrouble=jsonData.confDetails.WarningCount;
			var complianceText = '';
			if(compCritical===0 && compMajor===0 && comptrouble===0){
				if(bStatus != 'SUCCESS') {
					complianceText = "<i class='icon-status3'></i>&nbsp;"+Ember.I18n.t('jsp.commonstr.ComplianceData',this);//No I18N
				} else {
					complianceText = "<i class='icon-status5'></i>&nbsp;";//No I18N
				}
			} else {
				if(compCritical>0){
					complianceText=complianceText+'<i class="icon-status1" style="float:none !important" title="'+Ember.I18n.t('webclient.admin.alarmesc.critical',this)+'"></i>&nbsp;'+compCritical+"&nbsp;";//No I18N
				}
				if(compMajor>0){
					complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('ncm.complinace.major',this)+"' class='icon-status2'></i>&nbsp;"+compMajor+"&nbsp;";//No I18N
				}
				if(comptrouble>0){
					complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('webclient.admin.syslogrules.warning',this)+"' class='icon-status3'></i>&nbsp;"+comptrouble+"&nbsp;";//No I18N
				}
			}
			
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("dashboard.name.compliancestatus", this)+"</div><div>"+complianceText+"</div></div>"));
			
			var lastOpStatus = jsonData.devDetails.LastOperationStatus == 'FAILURE';//NO I18N
			if(jsonData.devDetails.LastOperationStatus == 'SUCCESS') {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.LastOperation", this)+"</div><div><i class='icon-status5'></i>&nbsp;"+jsonData.devDetails.LastOperationType+"</div></div>"));//No I18N 
			} else if(jsonData.devDetails.LastOperationStatus == 'FAILURE') {//NO I18N
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.LastOperation", this)+"</div><div><i class='icon-status1'></i>&nbsp;"+jsonData.devDetails.LastOperationType+"</div></div>")); //No I18N
			} else if(jsonData.devDetails.LastOperationStatus == 'NOTSTARTED') {//NO I18N
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.LastOperation", this)+"</div><div><i class='icon-status3'></i>&nbsp;"+jsonData.devDetails.LastOperationType+"</div></div>")); //No I18N
			} else {
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.LastOperation", this)+"</div><div id='ncmlastoperationstatus'><img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;"+jsonData.devDetails.LastOperationType+"</div></div>")); //No I18N
				setTimeout(function(){
					refreshLastOperationStatus();
				},3000);
			}
		}
		
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.ReportPdfUtil.SeriesModel", this)+"</div><div>"+jsonData.devDetails.Series+" &amp; "+jsonData.devDetails.Model+"</div></div>"));
		if(jsonData.devDetails.vendorName == 'Cisco') {
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.ReportPdfUtil.OSTypeOSVersion", this)+"</div><div>"+jsonData.devDetails.OSType+" &amp; <a href='http://tools.cisco.com/security/center/selectIOSVersion.x' target='_blank'>"+jsonData.devDetails.OSVersion+"</a></div></div>"));
		} else {
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.ReportPdfUtil.OSTypeOSVersion", this)+"</div><div>"+jsonData.devDetails.OSType+" &amp; "+jsonData.devDetails.OSVersion+"</div></div>"));
		}
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SystemDescription", this)+"</div><div>"+jsonData.devDetails.SystemDescription+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.SystemLocation", this)+"</div><div>"+jsonData.devDetails.SystemLocation+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.report.EOSD", this)+"</div><div>"+jsonData.devDetails.ENDOFSALEDATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("ncm.report.EOSUD", this)+"</div><div>"+jsonData.devDetails.ENDOFSUPPORTDATE+"</div></div>"));
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.deviceprop.DevicePropertiesView.LastSuccessfulOperation", this)+"</div><div>"+jsonData.devDetails.LastSuccessfulOperationAt+"</div></div>"));//No I18N
		
		if(jsonData.devDetails.showCustomColumn) {
			$section.append($("<div class='DIGL-Row'><div>"+jsonData.devDetails.COLUMNNAME1+"</div><div>"+jsonData.devDetails.COLUMNVALUE1+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+jsonData.devDetails.COLUMNNAME2+"</div><div>"+jsonData.devDetails.COLUMNVALUE2+"</div></div>"));
			$section.append($("<div class='DIGL-Row'><div>"+jsonData.devDetails.COLUMNNAME3+"</div><div>"+jsonData.devDetails.COLUMNVALUE3+"</div></div>"));
		}
		$sectionout.append($section1);
		
		$section = $("<section class='DIG-Graph'></section>"); 
		var responseTableStr = '<div style="min-height:100px;max-height:150px;overflow:auto;float:left">'+
			'<table id="COMMAND_RESPONSE_TABLE" class="terminal-row" style="background:#000000; min-height:100px;max-height:150px;min-width:540px;font-family: verdana, arial, helvetica, sans-serif; font-size: 10px; font-weight: normal; border: 0px solid #D9FABC; padding:0px;">'+ //No I18N
				'<table style="min-width:540px;max-width:540px; border="0" cellpadding="0" cellspacing="0" valign="top"><tbody><tr>'+ //No I18N
				'<td width="140" align="left" valign="middle" nowrap="" class="legend_title" style="line-height:20px;"><strong>&nbsp;&nbsp;'+Ember.I18n.t("jsp.audit.DeviceResponse.ExecutionOutput", this)+':</strong></td>'+ //No I18N
				'<td width="20" align="center" valign="middle"><img src="images/deviceresponse_icon.gif" width="9" height="9"></td>'+ //No I18N
				'<td width="150" nowrap="" class="legend_font" style="line-height:20px;">&nbsp;&nbsp;'+Ember.I18n.t("jsp.audit.DeviceResponse.DeviceResponse", this)+'</td>'+ //No I18N
				'<td width="20" align="center" valign="middle"><img src="images/cmdexecuted_icon.gif" width="9" height="9"></td>'+ //No I18N
				'<td width="*" nowrap="" class="legend_font" style="line-height:20px;">&nbsp;&nbsp;'+Ember.I18n.t("jsp.audit.DeviceResponse.ExecutedCommand", this)+'</td>'+ //No I18N
				'</tr></tr></tbody></table></div>'; //No I18N
			
		var hardwareStyles = "";
		if(lastOpStatus) {
			hardwareStyles = "max-height:250px !important;min-height:150px !important"; //No I18N
		}
		      	
		$section1 = $("<section class='DIG-List DIGmCustomScroll' style='"+hardwareStyles+"'></section>");
		var $header = $("<section class='opm_widget_title noBackground' style='z-index=0'>"+Ember.I18n.t("webclient.admin.hardwaredetails", this)+"</section>"); //No I18N
		$section1.append($header);
		$section2 = $("<div></div>");
		$section1.append($section2);
		for (var intIndex = 0; intIndex < jsonData.HardwareValue.length; intIndex++) {
			var array_elementx = jsonData.HardwareValue[intIndex];
			$section2.append($("<div class='DIGL-Row'><div>"+array_elementx.key+"</div><div>"+array_elementx.value+"</div></div>"));
		}
		$section.append($section1);
		$sectionout.append($section);
		
		$contentdiv.append($sectionout);
		widgetElement.append($contentdiv);
		if(lastOpStatus) {
			$section.append($(responseTableStr)); 
			populateDevResponse("#COMMAND_RESPONSE_TABLE", jsonData.lastOperationDetails.COMMAND_RESPONSE); //No I18N
		}
		
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
		opm_customTooltip();
	},
	ConfigDiff: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		if($("#li_"+snapId+" .opm_widget_title").length > 0) {
			$("#li_"+snapId+" .opm_widget_title").remove();
		}
		var $contentdiv = $("<div class='content'></div>");
		var $sectionout = $("<section class='configVersion'></section>");
		var $section = $("<section class='diffdetailsWidget'></section>");
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		var totalC = 0;
		if(jsonData.startupRunningDiff != null) {
			
			var funtionParams = '"'+jsonData.startupRunningDiff.LEFT_RESOURCE_NAME+'","'+jsonData.startupRunningDiff.LEFT_FILE_TYPE+'","'+jsonData.startupRunningDiff.LEFT_VERSION_NO+'","'+jsonData.startupRunningDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
			jsonData.startupRunningDiff.LEFT_CONFIG_ID+'","'+jsonData.startupRunningDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.startupRunningDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
			jsonData.startupRunningDiff.RIGHT_VERSION_NO+'","'+jsonData.startupRunningDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.startupRunningDiff.RIGHT_CONFIG_ID+'"'; // No I18N
		
			var $div = $("<div></div>");
			$div.append($("<div class=\"opm_widget_title\">"+Ember.I18n.t("jsp.commonstr.startuprunningconflictdiff",this)+"<div class=\"dashboardWidgetIcons\"></div></div>"));
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");' class=\"diffdetails addedlines\" data-count='"+jsonData.startupRunningDiff.addedCount+"'>"+Ember.I18n.t("webclient.linesadded")+"</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Modified\");' class=\"diffdetails modifiedlines\" data-count='"+jsonData.startupRunningDiff.modifiedCount+"'>"+Ember.I18n.t("webclient.linesModified")+"</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Deleted\");' class=\"diffdetails deletedlines\" data-count='"+jsonData.startupRunningDiff.deltedCount+"'>"+Ember.I18n.t("webclient.linesdeleted")+"</div>")); // No I18N
			$section.append($div);
			totalC++;
		}
		
		if(jsonData.baselineRunningDiff != null) {
			var $div = $("<div></div>");
			var funtionParams = '"'+jsonData.baselineRunningDiff.LEFT_RESOURCE_NAME+'","'+jsonData.baselineRunningDiff.LEFT_FILE_TYPE+'","'+jsonData.baselineRunningDiff.LEFT_VERSION_NO+'","'+jsonData.baselineRunningDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
			jsonData.baselineRunningDiff.LEFT_CONFIG_ID+'","'+jsonData.baselineRunningDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.baselineRunningDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
			jsonData.baselineRunningDiff.RIGHT_VERSION_NO+'","'+jsonData.baselineRunningDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.baselineRunningDiff.RIGHT_CONFIG_ID+'"'; // No I18N
		
			$div.append($("<div class=\"opm_widget_title\">"+Ember.I18n.t("jsp.commonstr.diffwithbaseline",this)+"<div class=\"dashboardWidgetIcons\"></div></div>"));
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");' class=\"diffdetails addedlines\" data-count='"+jsonData.baselineRunningDiff.addedCount+"'>"+Ember.I18n.t("webclient.linesadded")+"</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Modified\");' class=\"diffdetails modifiedlines\" data-count='"+jsonData.baselineRunningDiff.modifiedCount+"'>"+Ember.I18n.t("webclient.linesModified")+"</div>")); // No I18N
			$div.append($("<div onclick='OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Deleted\");' class=\"diffdetails deletedlines\" data-count='"+jsonData.baselineRunningDiff.deltedCount+"'>"+Ember.I18n.t("webclient.linesdeleted")+"</div>")); // No I18N
			$section.append($div);
			totalC++;
		}
		if(totalC>0) {
			widgetElement.append($contentdiv);
			totalC = totalC*4 + 2;
			if($("#li_"+snapId).attr("data-gs-height") != totalC && $("#li_"+snapId).attr("data-gs-height") != totalC+"") {
				$("#li_"+snapId).attr("data-gs-height", totalC);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
			}  else if(!reload) {
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
				reloadGridsterUl(snapId, reload);
			}
		}
	},
	CompareTo: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
	},
	VMWareVMDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.uuid',this)+"</div><div>"+jsonData.UUID+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.guestos',this)+"</div><div>"+jsonData.OS_NAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.cpu',this)+"</div><div>"+jsonData.NUM_VCPU+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.cpuspd',this)+"</div><div>"+jsonData.MAX_CPU_MHZ+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memory',this)+"</div><div>"+jsonData.MEMORY_MB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.vmcharts.MemoryOverhead.chartTitle',this)+"</div><div>"+jsonData.MEM_OVERHEAD_MB+"</div></div>")); //No I18N
		$section.append($("<div class='DIGL-Row'></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.virtualhosttext.shortform',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.HOSTNAME+"\")'>"+jsonData.HOSTDISPLAYNAME+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.vcenter',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.VCENTERNAME+"\")'>"+jsonData.VCENTERDISPLAYNAME+"</a></div></div>"));

		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.powerstate',this)+"</div><div>"+jsonData.VM_POWERSTATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ConnectionState',this)+"</div><div>"+jsonData.VM_CONNECTIONSTATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	XenVMDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.uuid',this)+"</div><div>"+jsonData.UUID+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.guestos',this)+"</div><div>"+jsonData.OSNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.cpu',this)+"</div><div>"+jsonData.NO_OF_VCPUS+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memory',this)+"</div><div>"+jsonData.TOTAL_MEM+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.vmcharts.MemoryOverhead.chartTitle',this)+"</div><div>"+jsonData.MEM_OVERHEAD_MB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.virtualhosttext.shortform',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.HOSTNAME+"\")'>"+jsonData.HOSTDISPLAYNAME+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.powerstate',this)+"</div><div>"+jsonData.POWER_STATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.pool',this)+"</div><div>"+jsonData.POOLNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.toolstatus',this)+"</div><div>"+jsonData.TOOLS_STATUS+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.niccount',this)+"</div><div>"+jsonData.VNIC_COUNT+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>")); //No I18N
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	HyperVVMDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.uuid',this)+"</div><div>"+jsonData.UUID+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.vcpus',this)+"</div><div>"+jsonData.NUMOFVCPUS+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.cpuallocated',this)+"</div><div>"+jsonData.MAXCPUALLOCATIONMHZ+"&nbsp;MHz</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memory',this)+"</div><div>"+jsonData.MEMCAPACITY+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.cpureservation',this)+"</div><div>"+jsonData.CPURESERVATIONMHZ+"&nbsp;MHz</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.cpulimit',this)+"</div><div>"+jsonData.CPULIMITMHZ+"&nbsp;MHz</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memreservation',this)+"</div><div>"+jsonData.MEMRESERVATIONMB+"&nbsp;MB</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memlimit',this)+"</div><div>"+jsonData.MEMLIMITMB+"&nbsp;MB</div></div>"));
		
		$section.append($("<div class='DIGL-Row'></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.virtualhosttext.shortform',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.HOSTNAME+"\")'>"+jsonData.HOSTDISPLAYNAME+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.powerstate',this)+"</div><div>"+jsonData.POWERSTATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>")); //No I18N
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	ESXDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.cpucores',this)+"</div><div>"+jsonData.CPU_CORES+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ProcessorType',this)+"</div><div>"+jsonData.CPU_MODEL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+"</div><div>"+jsonData.BUILD_INFO+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.memorycapacity',this)+"</div><div>"+jsonData.MEM_CAPACITY_MB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.NumberofNics',this)+"</div><div>"+jsonData.NUM_PNIC+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.NubmerofHBAs',this)+"</div><div>"+jsonData.NUM_HBA+"</div></div>")); //No I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ConnectionState',this)+"</div><div>"+jsonData.CONNECTION_STATUS+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>"));
		if(jsonData.VCENTERNAME !== undefined && jsonData.VCENTERDISPLAYNAME !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.vcenter',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.VCENTERNAME+"\")'>"+jsonData.VCENTERDISPLAYNAME+"</a></div></div>"));
		}
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.hardware.model',this)+"</div><div>"+jsonData.HARDWARE_MODEL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.hardware.manufacturer',this)+"</div><div>"+jsonData.HARDWARE_VENDOR+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.totalvms',this)+"</div><div>"+jsonData.TotalVms+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.totaldatastores',this)+"</div><div>"+jsonData.TotalDataStores+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	oldESXDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.vHostDetails.VHOST_NAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.cpucores',this)+"</div><div>"+jsonData.vHostDetails.NUM_PHYCPU_CORES+" X "+jsonData.vHostDetails.AVG_CPUSPEED_MHZ+" MHz</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ProcessorType',this)+"</div><div>"+jsonData.vHostDetails.CPU_MODEL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+"</div><div>"+jsonData.vHostDetails.VHOST_VERSION+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.memorycapacity',this)+"</div><div>"+jsonData.vHostDetails.TOTAL_MEM_CAPACITYMB+" MB</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.NumberofNics',this)+"</div><div>"+jsonData.vHostDetails.NUM_NIC+"</div></div>"));
		if(jsonData.vHostDetails.NUM_HBA !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.NubmerofHBAs',this)+"</div><div>"+jsonData.vHostDetails.NUM_HBA+"</div></div>")); //No I18N
		}
		if(jsonData.vHostDetails.CONNECTION_STATUS !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ConnectionState',this)+"</div><div>"+jsonData.vHostDetails.CONNECTION_STATUS+"</div></div>"));
		}
		if(jsonData.vHostDetails.AVG_CPUUSAGE_VALUE !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.CPUUsage',this)+"</div><div>"+jsonData.vHostDetails.AVG_CPUUSAGE_VALUE+" "+jsonData.vHostDetails.AVG_CPUUSAGE_UNIT+"</div></div>"));
		}
		if(jsonData.vHostDetails.MEM_USED_VALUE !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.MemoryUsage',this)+"</div><div>"+jsonData.vHostDetails.MEM_USED_VALUE+" "+jsonData.vHostDetails.MEM_USED_UNIT+"</div></div>"));
		}
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.LastSysUpTime',this)+"</div><div>"+jsonData.vHostDetails.LAST_SYSUPTIME+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	XenDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.cpucores',this)+"</div><div>"+jsonData.CPUCORES+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.hyperv.cpumodel',this)+"</div><div>"+jsonData.CPU_MODEL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+"</div><div>"+jsonData.PRODUCT_VERSION+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.memorycapacity',this)+"</div><div>"+jsonData.TOTAL_MEMORY+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.cpuspd',this)+"</div><div>"+jsonData.CPU_SPEED_MHZ+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.niccount',this)+"</div><div>"+jsonData.NIC_COUNT+"</div></div>")); //No I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.pool',this)+"</div><div>"+jsonData.POOLNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.ismaster',this)+"</div><div>"+jsonData.IS_MASTER+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	xenPoolSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		$sectionout = $("<section class='DI-Grid'></section>");
		$section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		$section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+"</div><div><i class='icon-status5'></i> Clear</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.poolname',this)+"</div><div>"+jsonData.Name+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.masterhost',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.masterMo+"\")'>"+jsonData.MasterName+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.haenabled',this)+"</div><div>"+jsonData.HA_ENABLED+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.wlbenabled',this)+"</div><div>"+jsonData.WLB_ENABLED+"</div></div>"));
		if(jsonData.WLB_ENABLED === "true"){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.xen.wlburl',this)+"</div><div>"+jsonData.WLB_URL+"</div></div>"));
		}
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.agent.details.lastupdatedtime',this)+"</div><div>"+jsonData.lastUpdatedTime+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},DatastoreSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		$sectionout = $("<section class='DI-Grid'></section>");
		$section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		$section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.admin.downtimescheduler.status', this)+"</div><div><i class='icon-status"+jsonData.statusNum+"'></i>&nbsp;"+jsonData.status+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.DatastoreName',this)+"</div><div>"+jsonData.ENTITY_NAME+"</div></div>"));
		if(jsonData.IS_ACCESSIBLE !== undefined && jsonData.IS_ACCESSIBLE === true){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.accessibility',this)+"</div><div><i class='icon-status5'></i></div></div>"));
		}else{
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.accessibility',this)+"</div><div><i class='icon-status1'></i></div></div>"));
		}
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.common.appmanager.type.text',this)+"</div><div>"+jsonData.TYPE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.googlemap.info.location',this)+"</div><div>"+jsonData.DATASTORE_URL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.vcenter',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.VCENTERNAME+"\")'>"+jsonData.VCENTERDISPLAYNAME+"</a></div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.reports.capacitymb',this)+"</div><div>"+jsonData.CAPACITY_MB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.reports.freespacemb',this)+"</div><div>"+jsonData.FREESPACE_MB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.agent.details.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	xenPoolDials: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div id='snapHolder_"+snapId+"' class='content speedoMeterWidget' style='display:table'></div>");
		if(shortSummary){
			$contentdiv = $("<div id='inventoryGridStyle' style='display:table'><div class='opm_widget_title' style='margin:0 0 40px;position:relative'><span class='headerTitleSpan'>Inventory Details</span></div>");
		}
		if(jsonData != undefined && !$.isEmptyObject(jsonData)) {
			widgetElement.append($contentdiv);
			var $dials = $("<div class='DIGG-Time' style='display: table-row;text-align:center'></div>");
			var i = 1;
			$.each(jsonData,function(k,v){
				var availDataStr = "<div style='position:relative !important; top:0 !important;' class='dialcounter' id='opm_"+snapId+"_"+i+"'>"+
				"<div style='padding-bottom:30px !important;'><b><span>"+v+"</span></b></div>"+
				"<i style='bottom: 20px;' title='"+k+"'>"+k+"</i>"+
				"</div>";
				$dials.append($(availDataStr));
				i++
			}) ;

			$contentdiv.append($dials);
			
			if(!expandWidget) {
				var holderHeight = $("#snapHolder_"+snapId).height();
				var newsizeY = Math.round(holderHeight / 36)+1;
				if ($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
					$("#li_"+snapId).attr("data-gs-height", newsizeY);
					reloadGridsterUl(snapId, reload);
				} else if(!reload){
					reloadGridsterUl(snapId, reload);
				}
			}
		} else {
			if ($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload){
				reloadGridsterUl(snapId, reload);
			}
		} 
	},
	HyperVDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.cpucores',this)+"</div><div>"+jsonData.CPUCORES+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.hyperv.cpumodel',this)+"</div><div>"+jsonData.CPUMODEL+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.details.memorycapacity',this)+"</div><div>"+jsonData.MEMCAPACITY+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.Processors',this)+"</div><div>"+jsonData.NUMOFLOGICALPROCESSORS+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.admin.ruleaction.deviceprop.vendor',this)+"</div><div>"+jsonData.HARDWAREVENDOR+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.NumberofNics',this)+"</div><div>"+jsonData.NUMOFNICS+"</div></div>")); //No I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+jsonData.LASTUPDATEDTIME+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	oldVMInfo: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.entityname',this)+"</div><div>"+jsonData.DEVProps.ENTITYNAME+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.uuid',this)+"</div><div>"+jsonData.DEVProps.UUID+"</div></div>"));
		if(jsonData.DEVProps.OSNAMETP !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.guestos',this)+"</div><div>"+jsonData.DEVProps.OSNAMETP+"</div></div>"));
		}
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.cpu',this)+"</div><div>"+jsonData.DEVProps.NUM_VCPU+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.cpuspd',this)+"</div><div>"+jsonData.DEVProps.MAXCPU_ALLOCATIONMHZ+" MHz</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memory',this)+"</div><div>"+jsonData.DEVProps.MEM_CAPACITYMB+"</div></div>"));
		if(jsonData.DEVProps.MEM_OVERHEADMB !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.vmcharts.MemoryOverhead.chartTitle',this)+"</div><div>"+jsonData.DEVProps.MEM_OVERHEADMB+"</div></div>")); //No I18N
		}
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.cpureservation',this)+"</div><div>"+jsonData.RAProps.CPU_RESERVATIONMHZ+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.cpulimit',this)+"</div><div>"+jsonData.RAProps.CPU_LIMITMHZ+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memreservation',this)+"</div><div>"+jsonData.RAProps.MEM_RESERVATIONMB+"</div></div>")); //No I18N
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.memlimit',this)+"</div><div>"+jsonData.RAProps.MEM_LIMITMB+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.virtualhosttext.shortform',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.DEVProps.HOSTMONAME+"\")'>"+jsonData.DEVProps.HOSTMODISPNAME+"</a></div></div>"));
		if(jsonData.DEVProps.VCENTERNAME !== undefined){
			$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.snapshot.vcenter',this)+"</div><div><a style='text-decoration:none;' href='javascript:redirectToDeviceSnapshot(\""+jsonData.DEVProps.VCENTERNAME+"\")'>"+jsonData.DEVProps.VCENTERDISPLAYNAME+"</a></div></div>"));
		}

		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.powerstate',this)+"</div><div>"+jsonData.DEVProps.VM_POWERSTATE+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ConnectionState',this)+"</div><div>"+(jsonData.DEVProps.CONNECTION_STATE !== undefined ? jsonData.DEVProps.CONNECTION_STATE : "")+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+"</div><div>"+(jsonData.DEVProps.LAST_SYSUPTIME !== undefined ? jsonData.DEVProps.LAST_SYSUPTIME : "")+"</div></div>"));
		$sectionout.append($section1);
		$contentdiv.append($sectionout);
		if(!shortSummary) {
			$('.DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
			});
		}
	},
	VirtualDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div id='snapHolder_"+snapId+"' class='content speedoMeterWidget' style='display:table'></div>");
		if(jsonData != null && jsonData.length > 0) {
			widgetElement.append($contentdiv);
			var $dials = $("<div class='DIGG-Time' style='display: table-row'></div>");
			for (var indexi = 0; indexi < jsonData.length; indexi++) {
				var array_element = jsonData[indexi];
				var availDataStr = "<div style='position:relative !important; top:0 !important;' class='dialcounter' id='opm_"+snapId+array_element.url+"'>"+
				"<div style='padding-bottom:30px !important;'><b><span>"+array_element.value+"</span></b></div>"+
				"<i style='bottom: 20px;' title='"+array_element.name+"'>"+array_element.name+"</i>"+
				"</div>";
				$dials.append($(availDataStr));
			}
			$contentdiv.append($dials);
			if(!expandWidget) {
				var holderHeight = $("#snapHolder_"+snapId).height();
				var newsizeY = Math.round(holderHeight / 36)+1;
				if ($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
					$("#li_"+snapId).attr("data-gs-height", newsizeY);
					reloadGridsterUl(snapId, reload);
				} else if(!reload){
					reloadGridsterUl(snapId, reload);
				}
			}
		} else {
			if ($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload){
				reloadGridsterUl(snapId, reload);
			}
		} 
	},
	AssociatedDials: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div id='snapHolder_"+snapId+"' class='content speedoMeterWidget' style='display:table'></div>");
		if(jsonData != null && jsonData.length > 0) {
			widgetElement.append($contentdiv);
			var $dials = $("<div class='DIGG-Time dialGraphCounter' style='display: table-row'></div>");
			for (var indexi = 0; indexi < jsonData.length; indexi++) {
				var array_element = jsonData[indexi];
				if(array_element.dialType == "meter") {
				if(Number(array_element.value) < 0)
					{
						array_element.value = 0;
					}
					else if(Number(array_element.value) > 100)
					{
						array_element.value = 100;	
					}
					var availDataStr = "<div class='SpeedoMeter' data-value='"+array_element.DiagnosticName+"' id='opm_"+snapId+"_"+array_element.pollId+"_"+indexi+"'>";//No I18N

					if(array_element.diagnosticsEnabled === true){
						availDataStr += "<i class='icon-configedit edit processDiagnostics' title='"+Ember.I18n.t('webclient.snapshot.tooltip.procdiagnostics',this)+"' onClick='getProcessStatistics(&#39;"+array_element.DiagnosticName+"&#39;)'></i>";//No I18N
					}

					availDataStr += "<i class='CutCircle'></i>";//No I18N
					if(window.OPM.userPermissions.monitoringRead && !window.OPM.isCentralServer && isDevicePingable &&array_element.pdName === "packetLoss"){
						availDataStr+="<i class='icon-configedit edit ConfigPacketLoss' onClick='editResponseThreshold('"+OPMClient.InventoryDeviceDetailsController.deviceName+"','OpManagerDesktopObjectStatusPoll','stat','Packet_Loss',true)'></i>";//No I18N
					}
					availDataStr += "<div ><b><span>"+array_element.value+"</span> <i>% </i> </b></div>";//No I18N
					
					if(array_element.pdName === "availability" || array_element.pdName === "packetLoss")
					{
						availDataStr += "<i title='"+array_element.displayName+" "+array_element.protocol+"'>"+array_element.displayName+"</i>"+"</div>";
					}
					else
					{
						availDataStr += "<i title='"+array_element.displayName+" "+array_element.protocol+"'>"+array_element.displayName+" ("+array_element.protocol+")</i>"+"</div>";
					}
					
					$dials.append($(availDataStr));
				} else {
					var availDataStr = "<div style='position:relative !important;' class='dialcounter' id='opm_"+snapId+"_"+array_element.pollId+"_"+indexi+"'>"+"<div style='padding-bottom:30px !important;'><b><span>"+array_element.value+"</span><i  style='font-size:25px !important' title='"+array_element.unit+"'>"+array_element.unit+"</i></b></div>";

					if(window.OPM.userPermissions.monitoringRead && !window.OPM.isCentralServer && isDevicePingable &&array_element.pdName === "responseTime"){
						availDataStr+="<i class='icon-configedit edit ConfigPacketLoss' onClick='editResponseThreshold(&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;,&#39;OpManagerDesktopObjectStatusPoll&#39;,&#39;stat&#39;,&#39;Device&#39;,true)'></i>";//No I18N
					}
					
					if(array_element.pdName === "responseTime")
					{
						availDataStr += "<i style='bottom: 20px;' title='"+array_element.displayName+" "+array_element.protocol+"'>"+array_element.displayName+"</i>"+"</div>";
					}
					else
					{
						availDataStr += "<i style='bottom: 20px;' title='"+array_element.displayName+" "+array_element.protocol+"'>"+array_element.displayName+" ("+array_element.protocol+")</i>"+"</div>";
					}
					$dials.append($(availDataStr));
				}
			}
			$contentdiv.append($dials);
			var avaliablityDiv = "";
			for (var indexi = 0; indexi < jsonData.length; indexi++) {
				var array_element = jsonData[indexi];
				var dialDivName = "opm_"+snapId+"_"+array_element.pollId+"_"+indexi;//No I18N
				if(array_element.dialType == "meter") {

					if(Number(array_element.value) < 0)
					{
						array_element.value = 0;
					}
					else if(Number(array_element.value) > 100)
					{
						array_element.value = 100;	
					}
					
					var pollId = array_element.pollKey;
					var dialValue = array_element.value;
					var dialColor = "#76d284";	//No I18N
					$("#"+dialDivName).attr("data-dialValue",dialValue);	
					$("#"+dialDivName).attr("value",pollId);	
					
					if(Math.round(dialValue) > 80)
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
					}
					if(array_element.pdName === "availability") {
						if(Math.round(dialValue) === 100)
						{
							dialColor = "#76d284"; //No I18N
						}
						else if(Math.round(dialValue) > 80)
						{
							dialColor = "#f5c673"; //No I18N
						} 
						else
						{
							dialColor = "#f37273"; //No I18N
						}
						avaliablityDiv = dialDivName;
					}
					opm_drawDialChart(dialDivName,dialValue,dialColor);
				}
				if(!reload) {
					var pollPeriod = array_element.period;
					var param = "pollId";//No I18N
					if(pollId !== null && pollPeriod !== null)
					{
						if(array_element.pdName === "availability" || array_element.pdName === "packetLoss" || array_element.pdName === "responseTime")
						{
							pollPeriod = pollPeriod*60;
							param = "instance";//No I18N
						} 
					}
				}
				if(array_element.pdName != "availability")
				{
					addDialClickEvent(dialDivName, array_element.pdName, array_element.pollKey);
				} 
			}
			if(avaliablityDiv != "") {
				$("#"+avaliablityDiv).click(function(){
					redirectSnapShot("DialGraph/Availability");//NO I18N
				});
				$("#"+dialDivName).css("cursor", "pointer");
			}
			if(!expandWidget) {
				var holderHeight = $("#snapHolder_"+snapId).height();
				var newsizeY = Math.floor(holderHeight / 36) + 2;
				var prevY = parseInt($("#li_"+snapId).attr("data-gs-height"));
				newsizeY = (newsizeY == 7) ? 8: newsizeY;
				if(prevY == 2) {
					if (prevY != newsizeY) {
						$("#li_"+snapId).attr("data-gs-height", newsizeY);
						reloadGridsterUl(snapId, reload);
					} else if(!reload){
						reloadGridsterUl(snapId, reload);
					}
				} else if(!reload){
					reloadGridsterUl(snapId, reload);
				}
			}
		} else {
			if ($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload){
				reloadGridsterUl(snapId, reload);
			}
		} 
	},
	AssociatedGraphs: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		widgetElement.append($contentdiv);
		
		var $graphs = $("<div class='outletSubDiv' style='width: 100%;'></div>");
		$contentdiv.append($graphs);
		
		for (var indexi = 0; indexi < jsonData.length; indexi++) {
			var array_elementi = jsonData[indexi];
			var $graph = $("<div style='cursor: pointer; float:left;width:400px;' ><div style='width:95% !important;' class='opm_widget_title'>"+array_elementi.displayName+"</div>" + '<div id="perfGraph_'+array_elementi.policyName+'_'+indexi+'"></div></div>');
			$graphs.append($graph);
			loadAssociatedGraph(OPMClient.InventoryDeviceDetailsController.deviceName, array_elementi.policyName, 'perfGraph_'+array_elementi.policyName+'_'+indexi, array_elementi.name, array_elementi.displayName); //No I18N
		}
	},
	IPSLAGraphs: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		var $contentdiv = $("<div class='content graphWidget'></div>");
		var $graphs = $("<div class='outletSubDiv'></div>");
		$contentdiv.append($graphs);
		$graphs.append($('<div id="perfGraph1_'+snapId+'" style="width:auto !important;"></div>'));
		$("#perfGraph1_"+snapId).attr('data-init','true');


		var grData = jsonData.graphData;
		if(grData == undefined || grData[0].data == null) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			
			widgetElement.append($contentdiv);

			if(OPMClient.InventoryDeviceDetailsController.expandSnapWidget === true && grData!==undefined && grData[0].data !== undefined)
			{
			
				validateGridColumnDetails(snapshotData.graphTableData.colModelList,snapshotData.graphTableData.colNamesList);
				var $div='<div id="ipslaExpandDataList" class="opm_jqGridUI" style="float:left;width:100%;padding:0 30px"></div>';
				$contentdiv.append($div);
				widgetElement.append($contentdiv);
				var defaultOptions = {minRowsPerPage:100};

				$.each(grData, function(key, val)
				{
					$('#ipslaExpandDataList').append('<div id="ipslaExpandDataList_'+key+'" class="opmIpslaMonitor"></div>');
					
					var gridData = ipslaArrayToObject(val.data);
					$('#ipslaExpandDataList_'+key).append("<div id='opm_grapTblPager_"+key+"'></div><table id='opm_grapTbl"+snapId+"_"+key+"'><tr><td></td></</table>");
					var tempNames = snapshotData.graphTableData.colNamesList;
					if(val.seriesname!==undefined){
						tempNames[1]=val.seriesname;
					}
					opm_loadJQgridWithData("#opm_grapTbl"+snapId+"_"+key,gridData, tempNames ,snapshotData.graphTableData.colModelList,val.seriesName, "opm_grapTblPager_"+key, "",defaultOptions); //No I18N
				});
			}


			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}


			var chartObj = {
				id:"perfGraph1_"+snapId, //No I18N
				type:'area', //No I18N
				jsonData:grData,
				series:"multi", //No I18N
				height:350,
				columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:jsonData.xyTitles[0],columnname_2:jsonData.xyTitles[1], timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)}, //No I18N
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
							"text": jsonData.xyTitles[0] //No I18N	
						}
					},
					"yaxis": [ //No I18N	
						{
							"label": { //No I18N	
								"text": jsonData.xyTitles[1] //No I18N	
							}
						}
					]
				},
			    chart:{
			        stacked:true
			    },
			    area:{
			        marker:true
			    }
			}
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1_"+snapId); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1_"+snapId); //No I18N
			}
		}
	},
	FWAReportList: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		widgetElement.empty();
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var newsizeY = 2;
		if($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
			$("#li_"+snapId).attr("data-gs-height", newsizeY);
			reloadGridsterUl(snapId, reload);
		} else if(!reload) {
			reloadGridsterUl(snapId, reload);
		}
		var $graphs = $("<div id='snapHolder_"+snapId+"' style='width:100%;display:table;'></div>");
		if(jsonData.reportList.length > 0) {
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
				if($('body').hasClass('chrome')){
					var $graph = $("<div style='float:left;display: table-row; width:100%; ' id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:60px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				}else{
					var $graph = $("<div style='float:left;display: table-row; width:100%; ' id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:60px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');//NO I18N
				}
				$graphs.append($graph);
				loadClickEventForRefreshButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
				if(shortSummary) {
					return;    
				}
			}
			
			for(var pwid=0;pwid < pieWidgetArr.length;pwid++){
				var widElement=pieWidgetArr[pwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				if($('body').hasClass('chrome')){
					var $graph = $("<div style=' float:left;display: table-row; width:100%; ' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				}else{
					var $graph = $("<div style=' float:left;display: table-row; width:100%; ' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				}
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement);
				loadClickEventForRefreshButton(widElement);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
			}
			
			for(var cwid=0;cwid < otherWidContent.length;cwid++){
				var widElement=otherWidContent[cwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				if($('body').hasClass('chrome')){
					var $graph = $("<div style=' float:left; width:50%;display: table-row; margin-top: 20px;'  id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:97%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;width:97%" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				}else{
					var $graph = $("<div style=' float:left; width:50%;display: table-row; margin-top: 20px;'  id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:97%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;width:97%" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				}
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement);
				loadClickEventForRefreshButton(widElement);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
			}
			
			for(var gwid=0;gwid < gridWidget.length;gwid++){
				var widElement=gridWidget[gwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				if($('body').hasClass('chrome')){
					var $graph = $("<div style=' float:left; width:100%;display: table-row; margin-top: 20px;'  id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				}else{
					var $graph = $("<div style=' float:left; width:100%;display: table-row; margin-top: 20px;'  id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				}
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement);
				loadClickEventForRefreshButton(widElement);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
			}
			
			var len = jsonData.reportList.length;
			var pieCount=len-otherWidContent.length;
			var otherCount=otherWidContent.length;
			var numrows = pieCount+( Math.floor(otherCount / 2)  + otherCount % 2);
		} else {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
			}  else if(!reload) {
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
				reloadGridsterUl(snapId, reload);
			}
		}
	},
	FWAReportListOnDemand: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		if((timeChange || pageReload) && window.OPM.snapshotType == 'fullView'){
			$('#snapHolder_'+snapId).remove();
			var $header=$('<div class="opm_widget_title ondemandWidget firsttineOndemandLoad"><span class="headerTitleSpan">'+snapDetails.desc+'</span><div class="dashboardWidgetIcons" style="position: relative;top: -2px;"><div><div><i title="'+Ember.I18n.t('webclient.general.reload',this)+'" class="icon-ccw widget_refresh" onclick="reloadSnapWidgets('+snapIndex+');"></i></div></div></div></div>');
			widgetElement.append($header);
			$("#li_"+snapId).attr("data-gs-height", 2);
			reloadGridsterUl(snapId, reload);
		}else{
			$('#li_'+snapId).find(".ondemandWidget").remove();
			var newsizeY = 2;
			if($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", newsizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var $graphs = $("<div id='snapHolder_"+snapId+"' style='width:100%;display:table'></div>");
			if(jsonData.reportList.length > 0) {
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
					if($('body').hasClass('chrome')){
						var $graph = $("<div style='float:left;display: table-row; width:100%; '  id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i class=\"icon-file-pdf widget_edit\" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:60px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
					}else{
						var $graph = $("<div style='float:left;display: table-row; width:100%; '  id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:60px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');//NO I18N
					}
					
					$graphs.append($graph);
					loadClickEventForRefreshButton(widElement);
					loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
					if(shortSummary) {
						return;    
					}
				}
				
				for(var pwid=0;pwid < pieWidgetArr.length;pwid++){
					var widElement=pieWidgetArr[pwid];
					var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
					if($('body').hasClass('chrome')){
						var $graph = $("<div style=' float:left;display: table-row; width:100%; '  id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit\" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
					}else{
						var $graph = $("<div style=' float:left;display: table-row; width:100%; '  id='fwa_inventory_widget_"+widElement.widId+"'><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
					}
					
					$graphs.append($graph);
					loadClickEventForResolveDNS(widElement);
					loadClickEventForRefreshButton(widElement);
//					loadClickEventForExpButton(widElement);
					loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
				}
				
				for(var cwid=0;cwid < otherWidContent.length;cwid++){
					var widElement=otherWidContent[cwid];
					var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
					if($('body').hasClass('chrome')){
						var $graph = $("<div style=' float:left; width:50%;display: table-row; margin-top: 20px;' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:97%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit\" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;width:97%" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
					}else{
						var $graph = $("<div style=' float:left; width:50%;display: table-row; margin-top: 20px;' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:97%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;width:97%" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
					}
					
					$graphs.append($graph);
					loadClickEventForResolveDNS(widElement);
					loadClickEventForRefreshButton(widElement);
//					loadClickEventForExpButton(widElement);
					loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
				}
				
				for(var gwid=0;gwid < gridWidget.length;gwid++){
					var widElement=gridWidget[gwid];
					var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
					if($('body').hasClass('chrome')){
						var $graph = $("<div style=' float:left; width:100%;display: table-row; margin-top: 20px;' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit\" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
					}else{
						var $graph = $("<div style=' float:left; width:100%;display: table-row; margin-top: 20px;' id='fwa_inventory_widget_"+widElement.widId+"' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
					}
					
					$graphs.append($graph);
					loadClickEventForResolveDNS(widElement);
					loadClickEventForRefreshButton(widElement);
//					loadClickEventForExpButton(widElement);
					loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle);
				}
				
				var len = jsonData.reportList.length;
				var pieCount=len-otherWidContent.length;
				var otherCount=otherWidContent.length;
				var numrows = pieCount+( Math.floor(otherCount / 2)  + otherCount % 2);
			} else {
				if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
					$("#li_"+snapId).attr("data-gs-height", 2);
					reloadGridsterUl(snapId, reload);
					var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
					widgetElement.append($header);
				}  else if(!reload) {
					var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
					widgetElement.append($header);
					reloadGridsterUl(snapId, reload);
				}
			}
		}
	},
	FWAReportData: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {		
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		jsonData.widTitle=snapDetails.desc;
		loadFWAReportDataSnapShot(snapIndex,jsonData,snapId,widgetElement,reload);
	},
	FWAReportDrillList: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div style='padding: 0 !important;' class='content'></div>");
		var $graphs = $("<div id='snapHolder_"+snapId+"' style='width:100%;display:table;'></div>");
		$contentdiv.append($graphs);
		
		if(jsonData.snapshotMenu.length > 0) {
			widgetElement.append($contentdiv);
			var snapshotList=jsonData.snapshotMenu;
			var gridWidget=[];
			var indexi=0;
			$.each(snapshotList,function(seriesKey,val)
			{
				val.widId="FWAReportGraphs_"+snapId+"_"+indexi;//No I18N
				indexi++;
				gridWidget.push(val);	
			});
			
			for(var gwid=0;gwid < gridWidget.length;gwid++){
				var widElement=gridWidget[gwid];
				var $graph = $("<div style='cursor: pointer; display: table-row; float:left; width:100%; margin-top: 20px;' ><div style='width:100%;' class='opm_widget_title'>"+widElement.rbbTitle+"</div>" + '<div style="padding-top:65px;" id="'+widElement.widId+'"></div></div>');
				$graphs.append($graph);
				loadFWACompleteTable(widElement, widElement.widId, "all");// No I18N
			}
			var len = jsonData.snapshotMenu.length;
			var newsizeY = 2;
			if($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", newsizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
			}  else if(!reload) {
				var $header = $("<div class='opm_widget_title'>" + snapDetails.desc + "</div>");
				widgetElement.append($header);
				reloadGridsterUl(snapId, reload);
			}
		}
	},
	RouterGraphs: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='graphWidget content' style='width: 100%;'></div>");
		var $graphs = $("<div class='outletSubDiv' style='width: 100%;'></div>");
		$contentdiv.append($graphs);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		
		$("#perfGraph1"+snapId).attr('data-init','true');
		
		var multiData = [];
		if(jsonData.graphData !== undefined){
			multiData = jsonData.graphData;
		}
		
		var x_axes = jsonData.xyTitles !== undefined ? jsonData.xyTitles[0] : Ember.I18n.t('webclient.admin.schedulereports.time',this);//No I18N
		var y_axes = jsonData.xyTitles !== undefined ? jsonData.xyTitles[1] : "";//No I18N
		if(y_axes === "" && jsonData.yAxis !== undefined){
			y_axes = jsonData.yAxis;
		}
		
		var height = 400;
		widgetElement.append($contentdiv);
		if(OPMClient.InventoryDeviceDetailsController.expandSnapWidget === true && multiData!==undefined && multiData[0] !== undefined && multiData[0].data !== undefined)
		{
			var $div='<div id="routerExpandDataList" class="opm_jqGridUI" style="float:left;width:100%;padding:0 30px"></div>';
			$contentdiv.append($div);
			widgetElement.append($contentdiv);
			var colNames =[Ember.I18n.t('webclient.auditreport.dateandtime',this),Ember.I18n.t('webclient.widget.value',this)]; //No I18N
			var colModels =
			[
				{ name: '0', index: '0',formatter:convertDateAndTime,sortable:true}, //No I18N
				{ name: '1', index: '1', sorttype:'number'} //No I18N
			];
			var defaultOptions = {"sortName":"0","sortOrder":"desc",minRowsPerPage:100};//No I18N
			$.each(multiData, function(key, val)
			{
				$('#routerExpandDataList').append('<div id="routerExpandDataList_'+key+'" class="opmIpslaMonitor"></div>');
				$('#routerExpandDataList_'+key).append("<div id='opm_grapTblPager_"+key+"'></div><table id='opm_grapTbl"+snapId+"_"+key+"'><tr><td></td></</table>");
				opm_loadJQgridWithData("#opm_grapTbl"+snapId+"_"+key,multiData[key].data ,colNames,colModels,multiData[key].seriesname, "opm_grapTblPager_"+key, "",defaultOptions); //No I18N
			});
		}
		if(multiData.length == 0){
			$("#li_"+snapId).attr("data-gs-height", 7);
			height = 150;
			reloadGridsterUl(snapId, reload);
		}else if($("#li_"+snapId).attr("data-gs-height") != 13 && $("#li_"+snapId).attr("data-gs-height") != "13") {
			$("#li_"+snapId).attr("data-gs-height", 13);
			reloadGridsterUl(snapId, reload);
		} else if(!reload) {
			reloadGridsterUl(snapId, reload);
		}
		var chartObj = {
			id : 'perfGraph1' + snapId, //No I18N
			type : 'area', //No I18N
			jsonData : multiData,
			series : "multi", //No I18N
			height : height,
			columns : {
				datatype_1 : 'time', //No I18N
				datatype_2 : 'numeric', //No I18N
				columnname_1 : x_axes,
				columnname_2 : y_axes,
				timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)
			},
			tooltip: [0,Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}} ({{col(1)}})"],//No I18N
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
						}
					}
				]
			},
			chart : {
				stacked : true
			}
		}
		if(jsonData.suffix !== undefined){
			chartObj.columns.suffix = jsonData.suffix;
		}
		if(reload) {
			var arraObj={
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push('perfGraph1' + snapId); //No I18N
			zChart(arraObj); 
		} else {
			addSnapshotChart(shortSummary, chartObj, 'perfGraph1' + snapId); //No I18N
		}
	},
	Availability: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		var $section = $("<section class='DIG-Graph' style='padding-left: 0px;'></section>");
		var $sectionout = $("<section class='DI-Grid'></section>");
		var availabilityStr = "<div class='DIGG-Time'><b>"+Ember.I18n.t("webclient.device.monitors.snapshot.availabilitytimeline",this)+"</b><div class='DIGGT-Row'><div class='initialStatus'></div><div class='statusInfo' id='statusInfo'></div></div>"+
						"<div class='legend'>" +
						"<span class='availabilityStatus_1'>"+Ember.I18n.t("opu.common.UP_TIME",this)+"</span> " +
						"<span class='availabilityStatus_2'>"+Ember.I18n.t("webclient.availreport.seriesnames.onmaint",this)+"</span> " +
						"<span class='availabilityStatus_3'>"+Ember.I18n.t("webclient.availreport.seriesnames.dependunavail",this)+"</span>" +
						"<span class='availabilityStatus_4'>"+Ember.I18n.t("webclient.availreport.seriesnames.onhold",this)+"</span>" +
						"<span class='availabilityStatus_5'>"+Ember.I18n.t("webclient.devices.details.avail.downtime",this)+"</span>" +
						"<span class='availabilityStatus_6'>"+Ember.I18n.t("webclient.availreport.seriesnames.parentdown",this)+"</span></div></div>";
		
		$section.append($(availabilityStr));
		$sectionout.append($section);
		$contentdiv.append($sectionout);
		widgetElement.append($contentdiv);
		var defaultOptions={colorScale:colorScale, onSelectEnabled:true,timeZone:jsonData.timeZone,timFormat:jsonData.format};
		opm_drawAvailabilityTimeLine("#statusInfo",jsonData,defaultOptions);//No I18N
	},
	BackupSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content graphWidget' style='width: 100%;'></div>");
		widgetElement.append($contentdiv);
		var $graphs = $("<div class='outletSubDiv' style='width: 100%;'></div>");
		$contentdiv.append($graphs);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		var $daywiseSummary = $("<div id='daywiseSummary' style='width:100%;'><div>");
		$graphs.append($daywiseSummary);
		for (var indexgr = 0; indexgr < jsonData.dayBackupList.length; indexgr++) {
			var array_element = jsonData.dayBackupList[indexgr];
			var statusClass = 'dwAlert'; //No I18N	
			if(array_element.dayMap.status == 'success') { //No I18N	
				statusClass = 'dwSuccess'; //No I18N	
			} else if(array_element.dayMap.status == 'failure') { //No I18N	
				statusClass = 'dwFailure'; //No I18N	
			} 
			var dayDiv = '<div class="dwcontainer">'+
							  '<div class="dwleft">'+array_element.dayMap.Day+'<span>'+array_element.dayMap.dateStr+'</span></div>'+
							  '<div class="dwcenter" id="perfGraph_'+indexgr+'_'+snapId+'"></div>'+
							  '<div class="dwright"><img src="../fluidicv2/img/transparent.png" class="'+statusClass+'" /></div>'+
							  '</div>';
			$daywiseSummary.append($(dayDiv));
		}
		$("#perfGraph1"+snapId).attr('data-init','true');
		var chartObj = {
			id:"perfGraph1"+snapId, //No I18N
			type:'line', //No I18N
			jsonData:jsonData.dataset,
			series:"multi", //No I18N
			height:200,
			columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Day",columnname_2:"Count", columnname_3: "Status", timeFormat:'lastweek'}, //No I18N
			legend : {
				"colorBox": { //No I18N 
		            "shape": "circle", //No I18N
		            "strokeOpacity": 1 //No I18N
		        },
		        "fontFamily": "'LatoRegular'", //No I18N
		        "fontSize": 16, //No I18N
				"hAlign": "center", //No I18N
				"vAlign": "bottom" //No I18N
			},
			"axes": { //No I18N	
				"rotated": false, //No I18N	
				"xaxis": { //No I18N	
					"label": { //No I18N	
						"text": "" //No I18N	
					}
				},
				"yaxis": [ //No I18N	
					{
						"label": { //No I18N	
							"text": jsonData.yaxis //No I18N	
						}
					}
				]
			},
			chart:{stacked:false}
		}
		var arraObj={
		    "placeholder":[],//No I18N
		    "chartobj":[]//No I18N
		}
		if(reload) {
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
		} else {
			addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId); //No I18N
		} 
		for (var indexgr = 0; indexgr < jsonData.dayBackupList.length; indexgr++) {
			var array_element = jsonData.dayBackupList[indexgr];
			array_element.dayMap.dataset[0].yaxiscolumnorder = jsonData.dataset[0].yaxiscolumnorder;
			var chartObj = {
				id:"perfGraph_"+indexgr+"_"+snapId, //No I18N
				type:'line', //No I18N
				subType: "step-after", //No I18N
				jsonData:array_element.dayMap.dataset,
				series:"multi", //No I18N
				height:50,
				columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:Ember.I18n.t('NFAWidget.Time', this),columnname_2:Ember.I18n.t('webclient.common.operationstatus', this),timeFormat:'hours',//No I18N
					"format": {//No I18N
					    "customFormat": OPMClient.InventorySnapshotUIController.backupSummaryFormat //No I18N	
					}
				}, 
				"legend": { //No I18N	
					"enabled": "false" //No I18N	
				},
				"axes": { //No I18N	
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"show": "false" //No I18N
					},
					"yaxis": [ //No I18N	
						{
							"show": "false" //No I18N
						}
					]
				},
				chart:{stacked:true}
			}
			if(reload) {
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph_"+indexgr+"_"+snapId); //No I18N
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph_"+indexgr+"_"+snapId); //No I18N
			} 
		}
		if(reload) {
			zChart(arraObj);
		} else {
			reloadGridsterUl(snapId, reload);
		}
	},
	backupSummaryFormat: function (value, datatype, columnInfo, type, chartObj) {
        if(value == 1) {
        	return Ember.I18n.t('fwa.compliance.compSuccessMsg', this);//No I18N
        } else if(value == -1){
        	return Ember.I18n.t('ncm.config.backup.failed', this);//No I18N
        } else {
        	return '-';
        }
    },
	ConfigSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div id='configSummaryTable' class='content'></div>");
		widgetElement.append($contentdiv);
		var bStatus=jsonData.BackupStatus;
		var compCritical=jsonData.CriticalCount;
		var compMajor=jsonData.MajorCount;
		var comptrouble=jsonData.WarningCount;
		var eolStatus=jsonData.ENDOFSALEDATE;
		var runningconfigVersion=jsonData.Running.versionId;
		var runningconfigFile=jsonData.Running.versionNo;
		var baselineconfigVersion=jsonData.RunningBaseline.versionId;
		var baselineconfigFile=jsonData.RunningBaseline.versionNo;
		var startupBaselineconfigVersion=jsonData.StartupBaseline.versionId;
		var startupBaselineconfigFile=jsonData.StartupBaseline.versionNo;
		var startupconfigVersion=jsonData.Startup.versionId;
		var startupconfigFile=jsonData.Startup.versionNo;
		
		var colNames = [
			'',
			''
		];
		
		var colModel =	[
			{ name: 'FIELD', index:'FIELD'}, //No I18N
			{ name: 'VALUE', index:'VALUE'} //No I18N
		];
		
		
		
		var $legendTable = $("<div class='opm_jqGridUI opm_jqGridUIBorder'><table id='configSummaryDetails'></table></div>");
		$contentdiv.append($legendTable);
		
		var gridData = new Array();
		var objectRow = {
				
		};
		var bLabel = '';
		var color = '';
		if(bStatus==='SUCCESS'){//No I18N
			bLabel=Ember.I18n.t('fwa.compliance.compSuccessMsg',this);//No I18N
			bLabel = "<i class='icon-status5'></i>&nbsp;"+bLabel;//No I18N
		} else if(bStatus==='FAILURE') {//NO I18N
			bLabel=Ember.I18n.t('ncm.config.backup.failed',this);//No I18N
			bLabel = "<i class='icon-status1'></i>&nbsp;"+bLabel;	//No I18N
		} else {
			bLabel=Ember.I18n.t('ncm.Util.GraphUtil.Not_Backed_Up',this);//No I18N
			bLabel = "<i class='icon-status3'></i>&nbsp;"+bLabel;	//No I18N
		}
		objectRow.FIELD=Ember.I18n.t("ncm.config.backup.status", this); //No I18N	
		objectRow.VALUE="<div>"+bLabel+"</div>"; 
		gridData.push(objectRow);
		
		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("dashboard.name.compliancestatus", this); //No I18N	
		var complianceText = '';
		if(compCritical===0 && compMajor===0 && comptrouble===0){
			if(bStatus != 'SUCCESS') {
				complianceText = "<i class='icon-status3'></i>&nbsp;"+Ember.I18n.t('jsp.commonstr.ComplianceData',this);//No I18N
				objectRow.VALUE="<div>"+complianceText+"</div>";
				gridData.push(objectRow);
			} else {
				complianceText = "<i class='icon-status5'></i>&nbsp;"+Ember.I18n.t('webclient.common.compliant',this);//No I18N
				objectRow.VALUE="<div>"+complianceText+"</div>";
				gridData.push(objectRow);
			}
		} else {
			if(compCritical>0){
				complianceText=complianceText+'<i class="icon-status1" style="float:none !important" title="'+Ember.I18n.t('webclient.admin.alarmesc.critical',this)+'"></i>&nbsp;'+compCritical+"&nbsp;";//No I18N
			}
			if(compMajor>0){
				complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('ncm.complinace.major',this)+"' class='icon-status2'></i>&nbsp;"+compMajor+"&nbsp;";//No I18N
			}
			if(comptrouble>0){
				complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('webclient.admin.syslogrules.warning',this)+"' class='icon-status3'></i>&nbsp;"+comptrouble+"&nbsp;";//No I18N
			}
			objectRow.VALUE="<div>"+complianceText+"</div>";
			gridData.push(objectRow);
		}
		
		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("ncm.device.eol.status", this); //No I18N	
		var eolLabel=eolStatus;
//		if(eolStatus==='Critical'){//No I18N
//			eolLabel = "<i class='icon-status1'></i>&nbsp;"+eolLabel;//No I18N
//		} else if(eolStatus==='Major'){//No I18N
//			eolLabel = "<i class='icon-status2'></i>&nbsp;"+eolLabel;//No I18N
//		} else {
//			eolLabel=Ember.I18n.t('webclient.common.na',this);//No I18N
//			eolLabel = "<i class='icon-status3'></i>&nbsp;"+eolLabel;//No I18N
//		} 
		
		objectRow.VALUE="<div>"+eolLabel+"</div>";
		gridData.push(objectRow);
		
		var runnningSt = 'N/A'; //No I18N
		if(runningconfigVersion!==undefined){
			runnningSt = runningconfigFile;
		}
		
		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("ncm.device.running.config", this); //No I18N	
		objectRow.VALUE="<div>"+runnningSt+"</div>";
		gridData.push(objectRow);
		
		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("ncm.device.running.baseline", this); //No I18N	
		objectRow.VALUE="<div>"+baselineconfigFile+"</div>";
		gridData.push(objectRow);

		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("ncm.device.sartup.config", this); //No I18N	
		objectRow.VALUE="<div>"+startupconfigFile+"</div>";
		gridData.push(objectRow);
		
		objectRow = {
				
		};
		objectRow.FIELD=Ember.I18n.t("ncm.device.startup.baseline", this); //No I18N	
		objectRow.VALUE="<div>"+startupBaselineconfigFile+"</div>";
		gridData.push(objectRow);
		var defaultGridOpts = {isNCM: true};
		opm_loadJQgridWithData("#configSummaryDetails", gridData, colNames, colModel, '', "", "opm_Config_Summary",defaultGridOpts); //No I18N
	},
	NFADevReport: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		var snapId1 = snapId;
		var colNames1 = [
			'',
			Ember.I18n.t(snapshotData.additionaldata.keyName,this),	
			'',
			'',
			Ember.I18n.t('NFAWidget.trfc',this) //No I18N	
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP', width:50,sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART',formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', width:30, sortable: false}// No I18N
		];

		var multiData = new Array();
		var gridData1 = new Array();
		if (jsonData[snapshotData.additionaldata.data] != null) {
			for (var indexx = 0; indexx < jsonData[snapshotData.additionaldata.data].length; indexx++) {
				var obj = {
						
				};
				var array_element = jsonData[snapshotData.additionaldata.data][indexx];
				obj.APP=array_element[0];
				obj.CHART=array_element[2];
				obj.PERCENTAGE=array_element[2]+" %";
				obj.TRAFFIC=array_element[1];
				gridData1.push(obj);
				var arr = new Array();
				arr.push(array_element[0]+" : "+array_element[1]);
				arr.push(array_element[2]);
				multiData.push(arr);
			}
		}
		
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_App_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		if(multiData.length == 0) {
			 if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				 $("#li_"+snapId).attr("data-gs-height", 2);
				 reloadGridsterUl(snapId, reload);
				 $("#li_"+snapId+" .content").remove();
				 $("#li_"+snapId+" .content .opm_jqGridUI").addClass("nodata");
			 }  else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			widgetElement.append($contentdiv);
			var height = 400;
			var margin = "70";
			if(multiData.length <= 8) {
				height = 300;
				margin = "30";
				sizeY = 11;
			} 
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
				$("#li_"+snapId+" .content .opm_jqGridUI").removeClass("nodata");
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id:"perfGraph1"+snapId1,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:height,
				margin: margin,
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t(snapshotData.additionaldata.keyName,this),columnname_2:"Traffic",suffix:"%",timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)},//No I18N
				"legend": { //No I18N
					'colors':nfaPieColors,//NO I18N
					"enabled": "false" //No I18N
				},
				pie:{innerLabel:true}
			}
			
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
			}
			
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc', //No I18N
				pagination:false,
				minRowsPerPage:11
			};
			opm_loadJQgridWithData("#opm_App_Legend"+snapId1, gridData1, colNames1, colModel1, '', "", "opm_App_Legend", defaultOptions); //No I18N
			if(window.OPM.isPDF)
			{
				$('.opm_jqGridUI').css({'margin':'0 30px'});
				$('#opm_App_Legend'+snapId1).jqGrid('setGridWidth',$('.pdfReportGraph').width()-60);
			}
		}*/
	},
	Conversation: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType, isNFAGeoLocation) {
		/*var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		var snapId1 = snapId;
		var onSelectFunction=(snapshotData.onselectfunction!==undefined)?snapshotData.onselectfunction:'opm_App_Legend';//No I18N
		var resultData=jsonData.result;
		var rowClasses='pointer'; //No I18N
		if(isNFAGeoLocation && jsonData.loc !== undefined) {
			resultData=jsonData.loc.result;
			rowClasses=onSelectFunction=''; //No I18N
		}

		var colNames1 = [
			'',
			Ember.I18n.t(snapshotData.additionaldata.keyName,this),	
			'',
			'',
			Ember.I18n.t('NFAWidget.trfc',this) //No I18N	
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'Name', index:'Name', classes:rowClasses, width:50, sortable: false}, //No I18N
			{ name: 'trafficVal', index:'trafficVal', classes:rowClasses, formatter: appPercentageFormatter}, //No I18N
			{ name: 'traffic', index:'traffic', hidden: true}, //No I18N
			{ name: 'volume', index: 'volume', classes:rowClasses, width:30, sortable: false}// No I18N
		];

		for(var i = 0; i < snapshotData.colModelList.length; i++) {
			if(snapshotData.colModelList[i].hidden == true || snapshotData.colModelList[i].hidden == 'true') { //No I18N
				colNames1.push('');// No I18N
				colModel1.push(snapshotData.colModelList[i]);
			}
		}
		var multiData = new Array();
		if (resultData != null) {
			for (var indexx = 0; indexx < resultData.length; indexx++) {
				var array_element = resultData[indexx];
				array_element.trafficVal = Number(array_element.traffic.split(" ")[0]);
				
				var arr = new Array();
				arr.push(array_element.Name+" : "+array_element.volume);
				arr.push(array_element.trafficVal);
				multiData.push(arr);
			}
		}

		var $contentdiv = $("<div class='content graphWidget'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_App_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		if(multiData.length == 0) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				 $("#li_"+snapId).attr("data-gs-height", 2);
				 reloadGridsterUl(snapId, reload);
				 $("#li_"+snapId+" .content").remove();
			}  else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			widgetElement.append($contentdiv);
			var height = 400;
			var margin = "70";
			if(multiData.length <= 8) {
				height = 300;
				margin = "30";
				sizeY = 11;
			}
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
				$("#li_"+snapId+" .content .opm_jqGridUI").removeClass("nodata");
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id:"perfGraph1"+snapId1,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:height,
				margin: margin,
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t(snapshotData.additionaldata.keyName,this),columnname_2:Ember.I18n.t('NFAWidget.trfc',this),suffix:"%",timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)},//No I18N
				"legend": { //No I18N
					"colors":nfaPieColors,//NO I18N
					"enabled": "false" //No I18N
				},
				pie:{innerLabel:true}
			}
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
			}
			
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc', //No I18N
				snapId:snapId1,
				pagination:false,
				minRowsPerPage:11
			};
			opm_loadJQgridWithData("#opm_App_Legend"+snapId1, resultData, colNames1, colModel1, '', "",onSelectFunction, defaultOptions); //No I18N
			if(window.OPM.isPDF)
			{
				$('.opm_jqGridUI').css({'margin':'0 30px'});
				$('#opm_App_Legend'+snapId1).jqGrid('setGridWidth',$('.pdfReportGraph').width()-60);
			}
		}*/
	},
	ComplianceStatus: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapId1 = snapId;
		var ComplianceStatus = snapDetailstype == "ComplianceStatus";//NO I18N
		var colNames1 = [
			'',
			(ComplianceStatus)?Ember.I18n.t("jsp.commonstr.ComplianceStatus",this):Ember.I18n.t("widget.name.current.confifConflictstatus",this), //No I18N	
			'',
			'',
			Ember.I18n.t("jsp.commonstr.DeviceCount",this) //No I18N	
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		var colorArray = new Array();

		var total = 0;
		if(ComplianceStatus) {
			total = jsonData.Violation + jsonData.Comp_Data_Not_Available + jsonData.Compliant;
		} else {
			if(jsonData.Conflict != undefined || jsonData.ConflictNA != undefined || jsonData.Unchanged != undefined) {
				total = jsonData.Conflict + jsonData.ConflictNA + jsonData.Unchanged;
			}
		}
		
		var obj = {
				
		};
		var firsval1 = (ComplianceStatus)?"jsp.commonstr.DevicesWithViolations":"ncm.acd.Startup-Running_Conflict"; // No I18N
		var firsval2 = (ComplianceStatus)?jsonData.Violation:jsonData.Conflict;
		
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100)) + " %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA5B5A";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.CompliantDevices":"js.commonstr.DashBoardWithoutStartupRunningconflict"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Compliant:jsonData.Unchanged;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#46BB7D";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.ComplianceData":"jsp.commonstr.DevicesNotBackedUp"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Comp_Data_Not_Available:jsonData.ConflictNA;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA7100";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='opm_jqGridUI'><table class='ut ut-Grid' id='opm_App_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		
		if(total == 0 || multiData.length == 0) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				 $("#li_"+snapId).attr("data-gs-height", 2);
				 reloadGridsterUl(snapId, reload);
				 $("#li_"+snapId+" .content").remove();
			}  else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			widgetElement.append($contentdiv);
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
				$("#li_"+snapId+" .content .opm_jqGridUI").removeClass("nodata");
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id:"perfGraph1"+snapId1,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:300,
				margin: "30",
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Status",this),columnname_2:Ember.I18n.t("webclient.general.Devices",this),suffix:"%",timeFormat:'hours'},//No I18N
				"legend": { //No I18N
					"colors":colorArray,//NO I18N
					"enabled": "false" //No I18N
				},
				pie:{innerLabel:true}
			}
			
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
			}
			
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc' //No I18N
			};
			opm_loadJQgridWithData("#opm_App_Legend"+snapId1, gridData1, colNames1, colModel1, '', "", "opm_App_Legend", defaultOptions); //No I18N
		}
	},
	ResPolicySummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapId1 = snapId;
		var colNames1 = [
			'',
			Ember.I18n.t("webclient.map.filemonitor.alarmseverity",this), //No I18N	
			'',
			'',
			Ember.I18n.t("webclient.common.widgets.eventcount",this) //No I18N	
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		var total = jsonData.Major+jsonData.Critical+jsonData.Warning+jsonData.Success;
		var colorArray = new Array();
		
		var obj = {
				
		};
		var firsval1 = "ncm.complinace.major"; // No I18N
		var firsval2 = jsonData.Major;
		
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA7100";//NO I18N
		
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(Math.floor((firsval2/total)*100));
		colorArray.push(obj.colorBar);
		multiData.push(arr);
		
		obj = {
				
		};
		firsval1 = "webclient.admin.threshold.Critical"; // No I18N
		firsval2 = jsonData.Critical;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA5B5A";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = "webclient.admin.eventlogrules.warning"; // No I18N
		firsval2 = jsonData.Warning;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FCA966";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = "webclient.common.compliant"; // No I18N
		firsval2 = jsonData.Success;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#46BB7D";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_App_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		
		if(multiData.length == 0) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				 reloadGridsterUl(snapId, reload);
			}  else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			$("#li_"+snapId+" .content .opm_jqGridUI").addClass("nodata");
		} else {
			widgetElement.append($contentdiv);
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
				$("#li_"+snapId+" .content .opm_jqGridUI").removeClass("nodata");
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id:"perfGraph1"+snapId1,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:300,
				margin: "30",
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Severity",columnname_2:Ember.I18n.t("jsp.commonstr.Status",this),suffix:"%",timeFormat:'hours'},//No I18N
				"legend": { //No I18N
					"colors":colorArray,//NO I18N
					"enabled": "false" //No I18N
				},
				pie:{innerLabel:true}
			}
			
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
			}
			
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc' //No I18N
			};
			opm_loadJQgridWithData("#opm_App_Legend"+snapId1, gridData1, colNames1, colModel1, '', "", "opm_App_Legend", defaultOptions); //No I18N
		}
	},
	PolicySummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapId1 = snapId;
		var colNames1 = [
			'',
			OPMClient.InventoryDeviceDetailsController.policyName + Ember.I18n.t("jsp.commonstr.Status",this), //No I18N	
			'',
			'',
			Ember.I18n.t("jsp.commonstr.DeviceCount",this) //No I18N	
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		var total = jsonData.TOTAL_DEVICE_COUNT;
		var colorArray = new Array();
		var obj = {
				
		};
		var firsval1 = "jsp.commonstr.CompliantDevices"; // No I18N
		var firsval2 = jsonData.COMPLIANT_DEVICE_COUNT;
		var perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[0];
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(perTon);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[0]);
		}
		
		obj = {
				
		};
		firsval1 = "jsp.commonstr.ViolatedDevices"; // No I18N
		firsval2 = jsonData.VIOLATION_DEVICE_COUNT;
		perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[1];
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(perTon);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[1]);
		}
		obj = {
				
		};
		firsval1 = "jsp.commonstr.ComplianceData"; // No I18N
		firsval2 = jsonData.DATANOTAVA_DEVICE_COUNT;
		perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[2];
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(perTon);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[2]);
		}
		
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_App_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		
		widgetElement.append($contentdiv);
		if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
			$("#li_"+snapId).attr("data-gs-height", sizeY);
			reloadGridsterUl(snapId, reload);
		} else if(!reload) {
			reloadGridsterUl(snapId, reload);
		}
		var chartObj = {
			id:"perfGraph1"+snapId1,//No I18N
			type:'pie', //dial, bar,area,line,pie //No I18N
			subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
			customClass:"opm_pie",//No I18N
			jsonData:multiData,
			height:300,
			margin: "30",
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Status",this),columnname_2:Ember.I18n.t("webclient.general.Devices",this),suffix:"%",timeFormat:'hours'},//No I18N
			"legend": { //No I18N
				"colors":colorArray,//NO I18N
				"enabled": "false" //No I18N
			},
			pie:{innerLabel:true}
		}
		
		if(reload) {
			var arraObj={
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
			zChart(arraObj); 
		} else {
			addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
		}
		
		var defaultOptions = {
			sortName: 'PERCENTAGE', //No I18N
			sortOrder: 'desc' //No I18N
		};
		opm_loadJQgridWithData("#opm_App_Legend"+snapId1, gridData1, colNames1, colModel1, '', "", "opm_App_Legend", defaultOptions); //No I18N
	},
	Application: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*var colNames = [
			'',
			Ember.I18n.t('NFAWidget.App',this), //No I18N
			'',
			'',
			Ember.I18n.t('NFAWidget.trfc',this) //No I18N
		];

		var colModel =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP', width:50,sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', width:30, sortable: false}// No I18N
		];
		var appData = jsonData.topApp; 
		var type = $("#li_"+snapId+" input[name=\"ReportType\"]:checked").val();
		$('#widgetElement_'+snapId+' .headerTitleSpan').html($('#param_'+snapId+'_ReportType').find(':selected').text());
		if(appData == undefined){
			appData = jsonData.topProt;
			colNames = [
				'',
				Ember.I18n.t('NFAWidget.proto',this), //No I18N	
				'',
				'',
				Ember.I18n.t('NFAWidget.trfc',this) //No I18N	
			];
		}
		var multiData = new Array();
		var gridData = new Array();
		if (appData != null) {
			for (var indexx = 0; indexx < appData.length; indexx++) {
				var obj = {
						
				};
				var array_element = appData[indexx];
				obj.APP=array_element[0];
				obj.CHART=array_element[2];
				obj.PERCENTAGE=array_element[2]+" %";
				obj.TRAFFIC=array_element[1];
				gridData.push(obj);
				var arr = new Array();
				arr.push(array_element[0]+" : "+array_element[1]);
				arr.push(array_element[2]);
				multiData.push(arr);
			}
		}
		
		var $contentdiv = $("<div class='content graphWidget'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		var tblStyle='';
		if(window.OPM.isPDF){tblStyle='margin:0 30px';}
		var $legendTable = $("<div class='contentRight opm_jqGridUI' style='"+tblStyle+"'><table class='ut ut-Grid' id='opm_App_Legend"+snapId+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		
		if(multiData.length == 0) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			widgetElement.append($contentdiv);
			var height = 400;
			var margin = "70";
			if(multiData.length <= 6) {
				height = 300;
				margin = "30";
				sizeY = 11;
			}
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			
			var chartObj = {
				id:"perfGraph1"+snapId,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:height,
				margin: margin,
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:(type == 'topProt')?Ember.I18n.t('NFAWidget.proto',this):Ember.I18n.t('NFAWidget.App',this),columnname_2:Ember.I18n.t('NFAWidget.trfc',this),suffix:"%"},//No I18N
				"legend": { //No I18N
					"colors":nfaPieColors,	//NO I18N
					"enabled": "false" //No I18N	
				},
				pie:{innerLabel:true}
			}
			
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
				zChart(arraObj);
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId); //No I18N
			}
			
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc', //No I18N
				pagination:false,
				minRowsPerPage:11
			};
			opm_loadJQgridWithData("#opm_App_Legend"+snapId, gridData, colNames, colModel, '', "", "opm_App_Legend",defaultOptions); //No I18N
			if(window.OPM.isPDF){$('#opm_App_Legend'+snapId).jqGrid('setGridWidth',$('.pdfReportGraph').width()-60);}
		}*/
	},
	PieChart: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapId1 = snapId;
		if(jsonData.avilability != null) {
			jsonData.data = jsonData.avilability[0];
		} else {
			jsonData.data = jsonData;
		}
		
		var colNames1 = [
			'',
			'Availability', //No I18N	
			'',
			''
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50} //No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		if (jsonData.data != null) {
			for (var indexx = 0; indexx < Object.keys(jsonData.data).length; indexx++) {
				var obj = {
						
				};
				var array_element = jsonData.data[Object.keys(jsonData.data)[indexx]];
				
				obj.APP=Object.keys(jsonData.data)[indexx];
				obj.CHART=array_element;
				obj.PERCENTAGE=array_element+" %";
				gridData1.push(obj);
				var arr = new Array();
				arr.push(Object.keys(jsonData.data)[indexx]+" : "+array_element);
				arr.push(array_element);
				multiData.push(arr);
			}
		}
		
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_pie_Legend"+snapId1+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId1+'" style="width:auto !important;"></div>'));
		if(multiData.length == 0) {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		} else {
			widgetElement.append($contentdiv);
			var height = 400;
			var margin = "70";
			if(multiData.length <= 6) {
				height = 300;
				margin = "30";
				sizeY = 11;
			}
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id:"perfGraph1"+snapId1,//No I18N
				type:'pie', //dial, bar,area,line,pie //No I18N
				subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				customClass:"opm_pie",//No I18N
				jsonData:multiData,
				height:height,
				margin: margin,
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Availability",columnname_2:"Value",suffix:"%",timeFormat:'hours'},//No I18N
				"legend": { //No I18N	
					"colors":nfaPieColors,	//NO I18N
					"enabled": "false" //No I18N	
				},
				pie:{innerLabel:true}
			}
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push("perfGraph1"+snapId1); //No I18N
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId1); //No I18N
			}
			var defaultOptions = {
				sortName: 'PERCENTAGE', //No I18N
				sortOrder: 'desc' //No I18N
			};
			opm_loadJQgridWithData("#opm_pie_Legend"+snapId1, gridData1, colNames1, colModel1, '', "", "opm_pie_Legend", defaultOptions); //No I18N
		}
	},
	FWADeviceSummary: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {  
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		$.ajax({
			type: 'GET', //No I18N
			url: window.OPM.apiUrlPattern + "/fwaglobal/getDeviceSummary?rid="+OPMClient.InventoryDeviceDetailsController.snapshotObjectId,//No I18N
			async: true,
			dataType: "json",  //No I18N
			success: function(jsonData1){
				var summaryWidgetElement = widgetElement;
				var $sectionout = $("<section style='padding-top:60px' class='DI-Grid'></section>");
				var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
				var $section = $("<div></div>");
				$section1.append($section);
				
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.common.intro.Hostname",this)+"</div><div>"+jsonData1.deviceName+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.map.view.ipaddress",this)+"</div><div>"+jsonData1.ipAddress+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.graph.type",this)+"</div><div>"+jsonData1.type+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("webclient.admin.ruleaction.deviceprop.vendor",this)+"</div><div>"+jsonData1.vendorName+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("jsp.commonstr.Status",this)+"</div><div>"+(jsonData1.managed == 1)?Ember.I18n.t("webclient.topo.addnetwork.managenet",this):Ember.I18n.t("webclient.topo.addnetwork.unmanagenet",this)+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("fwa.livetraffic.downlinkspeed",this)+"</div><div>"+jsonData1.downlink_speed+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("fwa.livetraffic.uplinkspeed",this)+"</div><div>"+jsonData1.uplink_speed+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("fwa.Last.Packet.Received",this)+"</div><div>"+jsonData1.last_pck_rcvd+"</div></div>"));
				$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t("fwa.Virtual.Firewall",this)+"</div><div>"+(jsonData1.virtual)?Ember.I18n.t("webclient.topo.objectdetails.managed.yes",this):Ember.I18n.t("webclient.topo.objectdetails.managed.no",this)+"</div></div>"));

				$sectionout.append($section1);
				$section = $("<section class='DIG-Graph'></section>");
				var $dials = $("<div class='DIGG-Charts DIGG-Time'></div>");
				var $div = $('<div id="perfGraph'+snapId+'"></div>');
				$div.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
				$dials.append($div);
				$section.append($($dials));
				$sectionout.append($section);
				summaryWidgetElement.append($sectionout);
				
				if(!shortSummary) {
					$('.DIGmCustomScroll > div').mCustomScrollbar({
						axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside' // No I18N
					});
				}
				
				
				if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
					$("#li_"+snapId).attr("data-gs-height", sizeY);
					reloadGridsterUl(snapId, reload);
				} else if(!reload) {
					reloadGridsterUl(snapId, reload);
				}
				
				var timeperiod="today";//NO I18N
				if(OPMClient.FWAGlobalDataController.timePeriod != undefined){
					timeperiod=OPMClient.FWAGlobalDataController.timePeriod;
				}
				var chartObj = {
					id:"perfGraph1"+snapId, //No I18N
					type:'area', //No I18N
					jsonData:jsonData.GraphData,
					series:"multi", //No I18N
					height:350,
					columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Traffic", timeFormat:OPMClient.FWADeviceSummaryTimeLegends.get(timeperiod)}, //No I18N
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
								"text": "" //No I18N	
							}
						},
						"yaxis": [ //No I18N	
							{
								"label": { //No I18N	
									"text": (jsonData.yAxis != undefined)? "Traffic("+jsonData.yAxis+")":"Traffic" //No I18N	
								}
							}
						]
					},
					chart:{stacked:true}
				}
				if(OPMClient.FWAGlobalDataController.startTime == undefined){
					if(OPMClient.FWAGlobalDataController.timePeriod == undefined){
						OPMClient.FWAGlobalDataController.timePeriod = "today";//NO I18N
					}
					setfwaCustomTimeFromTimeFrame();
				}
				chartObj.axes.xaxis.minRange=new Date(OPMClient.FWAGlobalDataController.startTime).getTime();
				chartObj.axes.xaxis.maxRange=new Date(OPMClient.FWAGlobalDataController.endTime).getTime();

				if(snapDetails.name==="fwa.device.bandwidth")
				{
					if(timeperiod==="24Hour" || timeperiod === "today"){
						chartObj.plot={
							"events" : {//NO I18N
								"click" : "fwaDeviceGraphDetails"//NO I18N
							}
						}
					}
				}
				if(reload) {
					var arraObj={
					    "placeholder":[],//No I18N
					    "chartobj":[]//No I18N
					}
					var mappingobj={};
					arraObj.chartobj.push(chartObj);
					arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
					zChart(arraObj); 
				} else {
					addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId); //No I18N
				}
			}
		});
	},
	UCSRelationship: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {  
		var $contentdiv = $("<div class='content graphWidget'></div>");
		var $graphs = $("<div class='outletSubDiv'></div>");
		$graphs.append($('<div id="sunburstGraph" style="margin-left:63pt"></div><div style="float: right;margin-right: 77pt;margin-top: -304pt;">'+
				'<div><div style="float:left;background-color:#62a221;width:10px;height:10px;"></div><span style="padding-left:3pt;">UP</span></div>'+
				'<div ><div style="float:left;background-color:#cc3502;width:10px;height:10px;"></div><span style="padding-left:3pt;">DOWN</span></div></div>'));
		$contentdiv.append($graphs);
		widgetElement.append($contentdiv);
		sunburst('sunburstGraph',jsonData); //No I18N
	},
	NFAGraph: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {  
		/*var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		var $contentdiv = $("<div class='content graphWidget'></div>");
		var $graphs = $("<div class='outletSubDiv'></div>");
		$contentdiv.append($graphs);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		$("#perfGraph1"+snapId).attr('data-init','true');
		var graphData = (jsonData.graphData !== undefined)?jsonData.graphData :((jsonData.GraphData !== undefined) ? jsonData.GraphData : ((jsonData.devTraffic !== undefined)?jsonData.devTraffic:jsonData.dataset));
		if(graphData !== null & graphData.length > 0)
		{
			var graphTitle;
			widgetElement.append($contentdiv);
			if(snapshotData !== undefined && snapshotData.graphTableData !== undefined) {
				if(snapDetailstype == "DeviceTraffic") {
					var tblStyle = (window.OPM.isPDF)?'margin:0 30px;overflow:hidden;':'margin-left:65px;overflow:hidden;width:1214px;';//NO I18N
					$div = $("<div class='opm_jqGridUI' style='"+tblStyle+"'><table id='opm_grapTbl"+snapId+"'></table><div id='opm_grapTblPager"+snapId+"'></div></div>");
					$contentdiv.append($div);
					validateGridColumnDetails(snapshotData.graphTableData.colModelList,snapshotData.graphTableData.colNamesList);
					var tempArr=[];
					tempArr.push([jsonData.max,jsonData.avgSpeed,jsonData.volume]);
					opm_loadJQgridWithData("#opm_grapTbl"+snapId,tempArr, snapshotData.graphTableData.colNamesList, snapshotData.graphTableData.colModelList, "", "", "opm_grapTblTest", ""); //No I18N
				}else {
					var divString = "<div class='opm_jqGridUI'><table id='opm_grapTbl"+snapId+"'></table><div id='opm_grapTblPager"+snapId+"'></div></div>";
					if(jsonData.spdString) {
						divString = "<div><div class='trafficTbleMsgDiv' style='text-align:center;margin-bottom:20px;'>"+jsonData.spdString+"</div></div>"+divString;
					}
					$contentdiv.append($(divString));
					validateGridColumnDetails(snapshotData.graphTableData.colModelList,snapshotData.graphTableData.colNamesList);
					var defaultOptions = {};
					if(snapDetails.name === 'opm.interface.traffic') { //No I18N
						graphTitle = jsonData.Data.granularity+' '+Ember.I18n.t('webclient.availability.datatype.average',this); //No I18N
						var indexVsNames=[];
						if(jsonData.Data.showGranularity) {
							snapshotData.graphTableData.colNamesList[2]=Ember.I18n.t('webclient.devices.intftypes.max',this) //No I18N
							snapshotData.graphTableData.colNamesList[4]=Ember.I18n.t('webclient.devices.intftypes.min',this) //No I18N
							setHiddenColumn(snapshotData.graphTableData.colModelList,['minHR','maxHR'],true); //No I18N
							$('#param_'+snapId+'_granularity').parent().parent().show(); 

						}else {									
							snapshotData.graphTableData.colNamesList[2]=Ember.I18n.t('webclient.inventory.1min',this) //No I18N
							snapshotData.graphTableData.colNamesList[3]=jsonData.Data.granularity;
							snapshotData.graphTableData.colNamesList[4]=Ember.I18n.t('webclient.inventory.1min',this) //No I18N
							snapshotData.graphTableData.colNamesList[5]=jsonData.Data.granularity;
							setHiddenColumn(snapshotData.graphTableData.colModelList,['minHR','maxHR'],false); //No I18N
						
							defaultOptions.gridCallBack = function() {
								$("#opm_grapTbl"+snapId).jqGrid('setGroupHeaders', { //No I18N
						            useColSpanStyle:true,
						            groupHeaders:[
						                {startColumnName: 'max', numberOfColumns: 2, titleText: '<div align="center">'+Ember.I18n.t('webclient.reports.max',this)+'</div>'}, //No I18N
						                {startColumnName: 'min', numberOfColumns: 2, titleText: '<div align="center">'+Ember.I18n.t('opu.common.MINIMUM',this)+'</div>'} //No I18N
						            ]
						        });
								$('#gview_opm_grapTbl'+snapId+' > div.ui-state-default > div > table > thead > tr.jqg-first-row-header').remove();
								$('#param_'+snapId+'_granularity').parent().parent().hide();
							}
						}
					}
					opm_loadJQgridWithData("#opm_grapTbl"+snapId, jsonData.Data.trafficdata, snapshotData.graphTableData.colNamesList, snapshotData.graphTableData.colModelList, "", "", "opm_grapTblTest", defaultOptions); //No I18N
				}
			}

			var timePeriod = OPMClient.FWAGlobalDataController.timePeriod;yAxis
			var yAxis = (jsonData.YAxis)?jsonData.YAxis:((jsonData.yAxis)?jsonData.yAxis:jsonData.yaxis);
			yAxis = Ember.I18n.t('NFAWidget.trfc')+"("+yAxis+")"; //No I18N
			
			var chartObj = {
				id : 'perfGraph1'+snapId, //No I18N
				type : (jsonData.grapPlotType == undefined)?'area':jsonData.grapPlotType, //No I18N
				jsonData : graphData,
				series : "multi", //No I18N
				height : 350,
				columns:{
					datatype_1:'time', //No I18N
					datatype_2:'numeric', //No I18N
					columnname_1: Ember.I18n.t('NFAWidget.Time'), //No I18N
					columnname_2: Ember.I18n.t('NFAWidget.trfc'), //No I18N
					columnname_3: Ember.I18n.t('webclient.widget.value'), //No I18N
					timeFormat: OPMClient.InventoryDateTimeLegends.get(timePeriod)
				},
				legend : {
					colorBox: {
						shape: "circle", //No I18N
						strokeOpacity: 1
					},
					fontFamily: "'LatoRegular'", //No I18N
					fontSize: 14,
					hAlign: "center", //No I18N
					vAlign: "bottom" //No I18N
				},
				axes: {
					rotated: false,
					xaxis: {
						label: { text: "" } //No I18N
					},
					yaxis: [{
						label: {
							text: yAxis
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
			if(graphTitle != undefined) {
				chartObj.canvas = {
					title : {
						text : graphTitle,
						show : true,
						hAlign : 'center', //No I18N
						vAlign : 'top' //No I18N
					}
				}
			}

			var arraObj={
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
			zChart(arraObj);

			if(window.OPM.isPDF) {
				$('#perfGraph1'+snapId).css({"overflow":"hidden"});
				var tempSnapshotData = OPMClient.InventoryDeviceDetailsController.snapshotData.snapList[snapIndex].snapshotData;
				if(tempSnapshotData!=undefined && tempSnapshotData.colModelList!=undefined && tempSnapshotData.colNamesList!=undefined)
				{
					var $legendTable = $("<div class='opm_jqGridUI' style='margin:20px 30px'><table class='ut ut-Grid' id='opmdetailtable"+snapId+"'></table></div>");
					$contentdiv.append($legendTable);
					var tableData=[];
					if(jsonData.TrafficData!=undefined){
						tableData = jsonData.TrafficData;
					}else if(jsonData.result!=undefined){
						tableData = jsonData.result;
					}else if(jsonData.MCastRows!=undefined){
						tableData = jsonData.MCastRows;
					}else if(jsonData.resultVector!=undefined){
						tableData = jsonData.resultVector;
					}else if(jsonData.URLStatsData!=undefined){
						tableData = jsonData.URLStatsData;
					}else if(jsonData.ArtData!=undefined){
						tableData = jsonData.ArtData;
					}else if(jsonData.data!=undefined){
						tableData = jsonData.data;
					}else if(jsonData.resultdata!=undefined){
						tableData = jsonData.resultdata;
					}else if(jsonData.tableData!=undefined){
						tableData = jsonData.tableData;
					}
					var onselectfunction =  (tempSnapshotData.onselectfunction!=undefined)?tempSnapshotData.onselectfunction:""; //No I18N
					setHiddenColumn(tempSnapshotData.colModelList,['indvTrafficGraph','nameWithPort'],true); //No I18N
					validateGridColumnDetails(tempSnapshotData.colModelList,tempSnapshotData.colNamesList);
					if(snapDetails.name == 'NFA.interface.MNettraffic') { //NO I18N
						var reqParams=OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams[snapIndex];
						var gridDetails = nfa_getMedianetGridDetails(reqParams.GroupBy,reqParams.SortBy);
						tempSnapshotData.colNamesList = gridDetails.colNamesList;
						tempSnapshotData.colModelList = gridDetails.colModelList;
					}
					opm_loadJQgridWithData("#opmdetailtable"+snapId,tableData, tempSnapshotData.colNamesList,tempSnapshotData.colModelList,'',"",onselectfunction,{'searchOption':false}); //No I18N
					$('#opmdetailtable'+snapId).jqGrid('setGridWidth',$('.pdfReportGraph').width()-60);
				}
			}
		}*/
	},
	NFAGraphTable: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		/*if(jsonData.message !== undefined) {
			opm_infoMsgs('infoMsg',jsonData.message);//NO I18N
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != "2") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		}else {
			var $pdfContentdiv = $("<div class='content'></div>");
			widgetElement.append($pdfContentdiv);

			if($('#param_'+snapId+'_TypeOFGraph').val()==='queue' || (window.OPM.isPDF && OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams[snapIndex].TypeOFGraph == 'queue')) { //No I18N
				sizeY=14;
				var $contentdiv = $("<div class='content graphWidget' style='float:left;width:100%;height:auto;position:relative;top:0;overflow:hidden;'></div>");
				var $graphs = $("<div class='outletSubDiv'></div>");
				$contentdiv.append($graphs);
				$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
				$pdfContentdiv.append($contentdiv);
				nfaCBQosTriGraph("perfGraph1"+snapId,jsonData.GraphData,'',jsonData.yAxis,reload,shortSummary,jsonData.TimeZone);//NO I18N
			}else {
				var graphStyle=(window.OPM.isPDF)?'':'width:50%';
				var $contentdiv = $("<div class='graphWidget cbqosTriGraph' style="+graphStyle+"></div>");
				var $graphs = $("<div class='outletSubDiv'></div>");
				$contentdiv.append($graphs);
				$graphs.append($('<div id="perfGraph1'+snapId+'_pre" style="width:auto !important;"></div>'));
				$pdfContentdiv.append($contentdiv);
				nfaCBQosTriGraph("perfGraph1"+snapId+"_pre",jsonData.preDS,Ember.I18n.t('webclient.nfa.cbqos.prepolicy',this),jsonData.preyAxis,reload,shortSummary,jsonData.TimeZone);//NO I18N

				$contentdiv = $("<div class='graphWidget cbqosTriGraph' style="+graphStyle+"></div>");
				var $graphs = $("<div class='outletSubDiv'></div>");
				$contentdiv.append($graphs);
				$graphs.append($('<div id="perfGraph1'+snapId+'_post" style="width:auto !important;"></div>'));
				$pdfContentdiv.append($contentdiv);
				nfaCBQosTriGraph("perfGraph1"+snapId+"_post",jsonData.postDS,Ember.I18n.t('webclient.nfa.cbqos.postpolicy',this),jsonData.postyAxis,reload,shortSummary,jsonData.TimeZone);//NO I18N

				$contentdiv = $("<div class='graphWidget' style='float:left;width:100%;height:auto;position:relative;top:0;overflow:hidden;margin-bottom:40px;'></div>");
				var $graphs = $("<div class='outletSubDiv'></div>");
				$contentdiv.append($graphs);
				$graphs.append($('<div id="perfGraph1'+snapId+'_drop" style="width:auto !important;"></div>'));
				$pdfContentdiv.append($contentdiv);
				nfaCBQosTriGraph("perfGraph1"+snapId+"_drop",jsonData.dropDS,Ember.I18n.t('webclient.nfa.cbqos.dropped',this),jsonData.dropyAxis,reload,shortSummary,jsonData.TimeZone);//NO I18N
			}

			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}	
		}*/
	},
	ChangeTrend: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
			var $contentdivx = $("<div class='content graphWidget' style='width: 100%;'></div>");
			widgetElement.append($contentdivx);
			var $graphsx = $("<div class='outletSubDiv' style='width: 100%;'></div>");
			$contentdivx.append($graphsx);
			$graphsx.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
			$("#perfGraph1"+snapId).attr('data-init','true');
			for (var index = 0; index < jsonData.dataset.length; index++) {
				var array_element = jsonData.dataset[index];
				if(array_element.seriesname.indexOf(".") != -1) {
					array_element.seriesname=Ember.I18n.t(array_element.seriesname, this);
				}
			}
			var chartObj = {
			id : 'perfGraph1' + snapId, //No I18N
			type : 'bar', //No I18N
			jsonData : jsonData.dataset,
			subType: "smootharea", //No I18N	
			series : "multi", //No I18N
			height : 375,
			columns : {
				datatype_1 : 'time', //No I18N
				datatype_2 : 'numeric', //No I18N
				columnname_1 : "Date", //No I18N	
				columnname_2 : Ember.I18n.t("dashboard.name.ncmchanges", this), //No I18N
				timeFormat: "Datewise" //No I18N	
			},
			legend : {
				"colorBox": { //No I18N
		            "shape": "circle", //No I18N
		            "strokeOpacity": 1 //No I18N
		        },
		        "fontFamily": "'LatoRegular'", //No I18N
		        "fontSize": 16, //No I18N
	//					        "itemHeight": "30",
				"hAlign": "center", //No I18N
				"vAlign": "bottom" //No I18N
			},
			"axes": { //No I18N	
				"rotated": false, //No I18N	
				"xaxis": { //No I18N	
					"label": { //No I18N	
						"text": "" //No I18N	
					},
					"ticklabel": { //No I18N	
						"rotation": 90 //No I18N	
					}
				},
				"yaxis": [ //No I18N	
					{
						"label": { //No I18N	
							"text": "Count" //No I18N	
						}
					}
				]
			},
			chart : {
				stacked : true
			}
		}
		if(reload) {
			var arraObj={
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push('perfGraph1' + snapId); //No I18N
			zChart(arraObj); 
		} else {
			addSnapshotChart(shortSummary, chartObj, 'perfGraph1' + snapId); //No I18N
			reloadGridsterUl(snapId, reload);
		}
	},
	Graph: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='graphWidget content' style='width: 100%;'></div>");
		var $graphs = $("<div class='outletSubDiv' style='width: 100%;'></div>");
		$contentdiv.append($graphs);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		
		$("#perfGraph1"+snapId).attr('data-init','true');
		
		if (Object.keys(jsonData).length !== 0) 
		{
			var grapData = [];
			if(jsonData.graphData != null && jsonData.graphData && Object.keys(jsonData.graphData).length > 0) {
				grapData = jsonData.graphData;
			}
			else if(jsonData.data != null && jsonData.data && Object.keys(jsonData.data).length > 0) {
				grapData = jsonData.data;
			}
		}
		if(grapData.length == 0)
		{
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
				$("#li_"+snapId).attr("data-gs-height", 2);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			} 
		}
		else
		{
			widgetElement.append($contentdiv);
			if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", sizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
			var chartObj = {
				id : 'perfGraph1' + snapId, //No I18N
				type : 'area', //No I18N
				subType: "smootharea", //No I18N	
				jsonData : grapData,
				series : "multi", //No I18N
				height : 400,
				columns : {
					datatype_1 : 'time', //No I18N
					datatype_2 : 'numeric', //No I18N
					columnname_1 : "Time", //No I18N	
					columnname_2 : snapDetails.desc,
					timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)
				},
				legend : {
					"colorBox": { //No I18N
			            "shape": "circle", //No I18N
			            "strokeOpacity": 1 //No I18N
			        },
			        "fontFamily": "'LatoRegular'", //No I18N
			        "fontSize": 16, //No I18N
//								        "itemHeight": "30",
					"hAlign": "center", //No I18N
					"vAlign": "bottom" //No I18N
				},
				chart : {
					stacked : true
				}
			}
			if(reload) {
				var arraObj={
				    "placeholder":[],//No I18N
				    "chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push('perfGraph1' + snapId); //No I18N
				if(jsonData.consolidatedValues !== undefined)
				{
					arraObj.consolidatedValues = jsonData.consolidatedValues;
				}
				zChart(arraObj); 
			} else {
				addSnapshotChart(shortSummary, chartObj, 'perfGraph1' + snapId, jsonData.consolidatedValues); //No I18N
			}
		}
	},
	PortDetails: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div class='content'></div>");
		$contentdiv.append($("<div class='spmswitchContainer' id='switchsnapshotContainer'><div class='spmswitchHolder' id='switchsnapshotresult'></div></div>"));
		if (jsonData.status !== "Failure") {
			var totalPorts = jsonData.result.length;
            if(totalPorts != 0) {
            	widgetElement.append($contentdiv);
                $('#switchsnapshot').show();
                var onesetOfPortsRows = "";
                var numberOfSetOfPorts = 0;
                var addRows = "";
                var allPorts = "";
                var setofport16 = 1;
                var ifNameFontCss = "";
                for (i = 1; i <= totalPorts; i++) {
                    var portDetails = jsonData.result[i - 1];
                    var portstatus = portDetails['operational-status-int'];//NO I18N
                    var portnumber = portDetails["connected-switch-port"];//NO I18N 
                    var portstatusStr = portDetails["operational-status"];//NO I18N 
                    var ifindex = portDetails["connected-port-ifindex"];//NO I18N 
                    var switchname = portDetails["switch-name"];//NO I18N 
                    // var tooltip = "<b>" + Ember.I18n.t("webclient.topo.details.tabs.port", this) + " </b>&nbsp;: " + portnumber + "<br><b>" + Ember.I18n.t("webclient.topo.status", this) + " </b>&nbsp;: " + portstatusStr + "<br><b>" + Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this) + "</b>&nbsp;: " + portDetails['connected-mac'] + "<br><b>" + Ember.I18n.t("webclient.topo.addnoderesult.ipaddress", this) + "</b>&nbsp;: " + portDetails['connected-ip'] + "<br><b>" + Ember.I18n.t("webclient.vimonitor.devices.snapshot.dnsname", this) + "</b>&nbsp;: " + portDetails['connected-dns'];//NO I18N
                    var macaddr = portDetails['connected-mac'];//NO I18N
                    var portifname = portDetails['connected-port-ifname'];//NO I18N
                    var viewnameonport = portDetails.spviewname;
                	ifNameFontCss = portDetails.spviewnamestyle;
                	if(macaddr !==""){
                    	macaddr = macaddr.split(",");
                    	if(macaddr.length >2){
                    		macaddr = macaddr[0]+", "+macaddr[1]+", ....";//NO I18N 
                    	}
                    }else{
                    	macaddr =" - ";
                    }
                    var ipaddres = portDetails["connected-ip"];//NO I18N
	                if(ipaddres !==""){
	                    ipaddres = ipaddres.split(",");
	                    if(ipaddres.length >2){
	                        ipaddres = ipaddres[0]+", "+ipaddres[1]+", ....";//NO I18N 
	                    }
	                }else{
	                    ipaddres =" - ";
	                }
	                var tooltip = '{"'+Ember.I18n.t("webclient.topo.details.tabs.port", this)+'":"'+portnumber+'","'+Ember.I18n.t("opu.views.IFINDEX", this)+'":"'+ifindex+'","'+Ember.I18n.t("opu.views.IFNAME", this)+'":"'+ifname+'","'+Ember.I18n.t("webclient.topo.status", this)+'":"'+portstatusStr+'","'+Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this)+'":"'+macaddr+'","'+Ember.I18n.t("webclient.admin.appmanager.serverip", this)+'":"'+ipaddres+'"}';//No I18N
	                  
                    if(i % 2 == 0) {
                        onesetOfPortsRows += "<div class='spmswitchColumn'>" + addRows + getSwitchPortSnapshot(portstatus, portnumber, tooltip,switchname,ifindex,viewnameonport) + "</div>";//NO I18N
                        addRows = "";
                    } else {
                        addRows = getSwitchPortSnapshot(portstatus, portnumber, tooltip,switchname,ifindex,viewnameonport);
                    }
                    if (setofport16 === 16) {
                        allPorts += "<div class='spmswitchRow "+ifNameFontCss+"'>" + onesetOfPortsRows + "</div>";//NO I18N
                        setofport16 = 0;
                        onesetOfPortsRows = "";
                        numberOfSetOfPorts++;
                    }
                    setofport16++;
                }
                //if have one port or total port count is oddnumber...
                if (addRows !== "") {
                    addRows += "<div></div>";//NO I18N
                    onesetOfPortsRows += "<div class='spmswitchColumn'>" + addRows + "</div>";//NO I18N
                }
                if (setofport16 > 1) {
                    allPorts += "<div class='spmswitchRow "+ifNameFontCss+"'>" + onesetOfPortsRows + "</div>";//NO I18N
                }
                if (totalPorts <= 64) {//enble scorell if more then two rows...
                    $("#switchsnapshotContainer").css("overflow", "hidden");
                }
                $("#switchsnapshotresult").html(allPorts);//NO I18N
                opm_customTooltip();
                if($("#li_"+snapId).attr("data-gs-height") != 12 && $("#li_"+snapId).attr("data-gs-height") != 12+"") {
                    $("#li_"+snapId).attr("data-gs-height", 12);
                    reloadGridsterUl(snapId, reload);
				}  else if(!reload) {
            		reloadGridsterUl(snapId, reload);
            	}
            } else {
            	if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
            		 $("#li_"+snapId).attr("data-gs-height", 2);
            		reloadGridsterUl(snapId, reload);
            	} else if(!reload) {
            		reloadGridsterUl(snapId, reload);
            	}
			}
		} else {
			if($("#li_"+snapId).attr("data-gs-height") != 2 && $("#li_"+snapId).attr("data-gs-height") != 2+"") {
       		 	$("#li_"+snapId).attr("data-gs-height", 2);
       		 	reloadGridsterUl(snapId, reload);
			} else if(!reload) {
				reloadGridsterUl(snapId, reload);
			}
		}
	},
	isGridViewNfaSubgrid: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,isNFAGeoLocation) {
	},
	Grid: function(jsonData, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex, isGridViewType, isGridViewNfaSubgrid,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		if(!$('#widgetElement_'+snapId).children('div').hasClass('content')) {
			$contentdiv = $("<div class='content'></div>");
			widgetElement.append($contentdiv);
		}else {
			$contentdiv = $('#widgetElement_'+snapId+' .content');
		}
		// var $contentdiv = $("<div data-index='"+snapIndex+"' class='content'></div>");
		// if(snapDetailstype == "Grid") {
		// 	widgetElement.append($contentdiv);
		// }
		/*if(snapDetails.name === 'dpi.srcdst.conv')	{
			if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'DPISource') {
				setHiddenColumn(snapshotData.colModelList,['0'],true);
			}else{
				setHiddenColumn(snapshotData.colModelList,['1'],true);
			}

		}else if(snapDetails.name === 'dpi.application.conv')	{
			if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'DPILayer4') {
				setHiddenColumn(snapshotData.colModelList,['2'],true);
			}else{
				setHiddenColumn(snapshotData.colModelList,['11'],true);
			}

		}*/
		if((!reload && !pageReload) || firsttineOndemandLoad || isGridViewType) {

			validateGridColumnDetails(snapshotData.colModelList,snapshotData.colNamesList);
			validateGridColumnDetails(snapshotData.colModelList1,snapshotData.colNamesList1);
			validateGridColumnDetails(snapshotData.colModelList2,snapshotData.colNamesList2);
		}
		if((window.OPM.isCentralServer || !window.OPM.isAuthorized) && (snapDetails.name==="opm.device.vmwarevms" || snapDetails.name==="opm.device.hypervvms" || snapDetails.name==="opm.device.xenvms" || snapDetails.name==="opm.device.hosts" || snapDetails.name==="opm.device.nutanix.orphanedvms" || snapDetails.name==="opm.device.nutanix.vms" || snapDetails.name==="opm.device.nutanixhosts") ){
			delete snapshotData.colModelList[snapshotData.colModelList.length-1];
			delete snapshotData.colNamesList[snapshotData.colNamesList.length-1];
		}
		
		//Deleting showGraph column from table
		/*if(window.OPM.isPDF) {
			setHiddenColumn(snapshotData.colModelList,['indvTrafficGraph','modifyDNS'],true); //No I18N
		}*/
		
		var defaultOptions = {
			minRowsPerPage: (expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?50:10,
			isSnapshotGrid: true,
			snapId: snapId,
			snapIndex:snapIndex,
			reload: reload,
			pagination: (expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?true:false
		};
		/*if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'FlowWLC' || OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'FlowAPMAC') {
			defaultOptions.reportType=jsonData.reportType;
		}
		if(snapDetails.name === 'opm.interface.application') {
			if(OPMClient.InventoryDeviceDetailsController.inventorysnapType !== 'FlowIPGroup') {
				OPMClient.InventoryDeviceDetailsController.isRawEnabled=OPMClient.Settings.isRawEnabled();
			}
		}*/
		if(snapDetails.name === "opm.device.interfaces"){//No I18N
			defaultOptions.pagination = true;
			if(window.OPM.userPermissions.discoveryWrite && !window.OPM.isCentralServer)
			{
				defaultOptions.multiselect = true;
				defaultOptions.delIcon = true;
				defaultOptions.apiUrl = window.OPM.apiUrlPattern + "/discovery/deleteInterfaces?";//No I18N
				defaultOptions.urlParameter = "name";//No I18N
				defaultOptions.deleteName = "name";//No I18N
				defaultOptions.delConfirmMsg = Ember.I18n.t('webclient.js.interface.delete',this);//No I18N
			}
		}
		var gridData = jsonData;
		if(jsonData.fanDetails != null) {
			gridData = jsonData.fanDetails;
		} else if(jsonData.portDetails != null) {
			gridData = jsonData.portDetails;
		} else if(jsonData.psuDetails != null) {
			gridData = jsonData.psuDetails;
		} else if(jsonData.chassisProps != null && jsonData.chassisProps.fanDetails != null) {
			gridData = jsonData.chassisProps.fanDetails;
		} else if(jsonData.chassisProps != null && jsonData.chassisProps.psuDetails != null) {
			gridData = jsonData.chassisProps.psuDetails;
		} else if(jsonData.chassisProps != null && jsonData.chassisProps.serverDetails != null) {
			gridData = jsonData.chassisProps.serverDetails;
		} else if(jsonData.gridData != null) {
			gridData = jsonData.gridData;
		} else if(jsonData.topConv != null) {
			gridData = jsonData.topConv;
		} else if(jsonData.TrafficData != null) {
			gridData = jsonData.TrafficData;
		} else if(jsonData.Data != null) {
			gridData = jsonData.Data; 
		} else if(snapDetails.name == "ipsla.voip.notifprofiles" && jsonData.notificationProfiles != null) {
			gridData = jsonData.notificationProfiles; 
		} else if(jsonData.thresholdVariables != null) {
			gridData = jsonData.thresholdVariables; 
		} else if(jsonData.result != null) {
			gridData = jsonData.result; 
		}else if(jsonData.tableData != null) {
			gridData = jsonData.tableData; 
		}else if(jsonData.Offenders != null) {
			gridData = jsonData.Offenders; 
		}else if(jsonData.Targets != null) {
			gridData = jsonData.Targets; 
		}else if(jsonData.RouterField != null) {
			gridData = jsonData.RouterField; 
		}else if(jsonData.ConnList != null) {
			gridData = jsonData.ConnList; 
		}else if(jsonData.eData != null) {
			gridData = jsonData.eData; 
		} else if(jsonData.qosDropsVector != null) {
			gridData = jsonData.qosDropsVector; 
		}else if(jsonData.data != null) {
			gridData = jsonData.data; 
		}else if(jsonData.resultdata != null) {
			gridData = jsonData.resultdata; 
		}else if(jsonData.resultData != null) {
			gridData = jsonData.resultData; 
		}else if(jsonData.ArtData != null) {
			gridData = jsonData.ArtData; 
		}else if(jsonData.resultVector != null) {
			gridData = jsonData.resultVector; 
		}else if(jsonData.MCastRows != null) {
			gridData = jsonData.MCastRows; 
		}else if(jsonData.URLStatsData != null) {
			gridData = jsonData.URLStatsData; 
		}
		else if(snapDetails.name == "ipsla.voip.thresholdDetails"){
			gridData = jsonData.thresholdDetails;
		}
		else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringVLAN" && snapDetailstype == "Grid" && jsonData.length > 0)
		{
			$.each(jsonData,function(key,value)
			{
				if(value.intfDetails !== undefined)
				{
					gridData = value.intfDetails; 
				}
				else
				{
					gridData = jsonData;
				}
			});
		}
		if(snapDetails.name === "opm.device.oldvmwarevms"){//No I18N
			gridData = jsonData.vmDetails;
		}
		if(snapDetails.name === "opm.device.oldvmwareDataStores"){//No I18N
			gridData = jsonData.dataStoreDetails;
		}
		if(snapDetails.name === "opm.device.oldvmwarenetworkadapters"){//No I18N
			gridData = jsonData.netAdapterDetails;
		}
		if(snapDetails.name === "opm.device.oldvmwarestorageadapters"){//No I18N
			gridData = jsonData.storageAdapterDetails;
		}
		if(snapDetails.name === "opm.device.oldresourceallocation"){//No I18N
			gridData = jsonData.resourceAllocDetails;
		}
		if(snapDetails.name === "opm.device.oldvnicdetails"){//No I18N
			gridData = jsonData.vmNWADetails;
		}
		if(snapDetails.name === "opm.device.oldvmdatastore"){//No I18N
			gridData = jsonData.vmDSDetails;
		}
		if(snapDetails.name === "opm.device.oldvCenterDetails"){//No I18N
			var newJson = [];
			$.each(jsonData.hostInfo,function(key,value)
			{
				$.each(jsonData.vmInfo,function(kk,val)
				{
					if(val.VHOST_NAME == value.VHOST_NAME)
					{
						val.VHOSTDISPLAYNAME = value.DISPLAYNAME;
						newJson.push(val);
					}
				});
			});
			gridData = newJson;
		
			defaultOptions.grouping = true;
			defaultOptions.groupingField = "VHOSTDISPLAYNAME"; //No I18N
		}
		if(gridData.message != null || gridData.error != null) {
			gridData = new Array();
		}
		if(gridData.message != null) {
			opm_infoMsgs('errorMsg', gridData.message);//No I18N	
		}

		var showAllTxt = "";
		if(gridData.length > 10 && !(window.OPM.isPDF || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)) {
			if(snapDetails.name !== "opm.device.interfaces") { //No I18N
				showAllTxt = "<div class='widgetListMore' onclick='expandSnapWidget(\""+snapIndex+"\");'>"+Ember.I18n.t('webclient.snapshot.showall',this)+"...</div>";
			}
		}
		var $div = $("<div class='opm_jqGridUI'><table id='opm_DeviceSnapList"+snapId+"'></table><div id='opm_DeviceSnapPager"+snapId+"'></div></div>"+showAllTxt);
		$contentdiv.append($div);

		$contentdiv.addClass('multipleJqGrid');

		/*if((snapDetails.name==="opm.interface.topsource" || snapDetails.name==="opm.interface.topdest")) {
			if($('#param_'+snapId+'_isNetwork').val()==='true') {
				setHiddenColumn(snapshotData.colModelList,['resolveDNS'],true);
			}else {
				setHiddenColumn(snapshotData.colModelList,['resolveDNS'],false);
			}
		}
		if(!window.OPM.isPDF && snapDetails.name==="opm.interface.topconv") {
			$contentdiv.removeClass('multipleJqGrid');
			if($("#param_"+snapId+"_ResolveDNS").is(':checked')) {
				setHiddenColumn(snapshotData.colModelList,['indvTrafficGraph'],true);
			}else {
				setHiddenColumn(snapshotData.colModelList,['indvTrafficGraph'],false);
			}
			if(jsonData.fromRaw) {
				setHiddenColumn(snapshotData.colModelList,['dstport'],false);
			}else{
				setHiddenColumn(snapshotData.colModelList,['dstport'],true);
			}
		}
		var isDrops = false;
		if(OPMClient.InventoryNFAController!=undefined && OPMClient.InventoryNFAController.isNFASnapshot && $('input[name="showQoSDrop_'+snapId+'"]').length > 0) {
			isDrops = $("#li_"+snapId+" input[name=\"showQoSDrop_"+snapId+"\"]:checked").val();
		}
		if(window.OPM.isPDF && snapDetails.name==="NFA.interface.QosStats")
		{
			isDrops=OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams[snapIndex].showQoSDrop;
		}
		if((isDrops!==undefined && isDrops==="true") || (artGraphType!==undefined && artGraphType==="client")) {
			opm_loadJQgridWithData("#opm_DeviceSnapList"+snapId, gridData, snapshotData.colNamesList1, snapshotData.colModelList1, "", "", "", defaultOptions); //No I18N
		} else if(artGraphType!==undefined && artGraphType==="server") {//NO I18N
			opm_loadJQgridWithData("#opm_DeviceSnapList"+snapId, gridData, snapshotData.colNamesList2, snapshotData.colModelList2, "", "", "", defaultOptions); //No I18N
		} else {
			if(window.OPM.isPDF){defaultOptions.noPaginationShowAll=true;}*/
			opm_loadJQgridWithData("#opm_DeviceSnapList"+snapId, gridData, snapshotData.colNamesList, snapshotData.colModelList, "", "", snapshotData.onselectfunction, defaultOptions); //No I18N
		/*}
		if(snapDetails.name === 'opm.interface.traffic' || snapDetails.name === 'wlc.apmacsnap.traffic') {
			$('#opm_DeviceSnapList'+snapId).setGridParam({sortname:'Time', sortorder: 'desc'}).trigger('reloadGrid');
		}*/
		if(snapDetails.name === 'opm.device.notes') {
						$('#opm_DeviceSnapList'+snapId).setGridParam({sortname:'FIELDNAME', sortorder: 'asc'}).trigger('reloadGrid');
		}
		if(snapDetails.name === "opm.device.oldresourceallocation"){//No I18N
			$("#opm_DeviceSnapList"+snapId).jqGrid('setGroupHeaders', { //No I18n
				  useColSpanStyle: true,
				  groupHeaders:[
					{startColumnName: 'CPU_RESERVATIONMHZ', numberOfColumns: 3, titleText: Ember.I18n.t('webclient.map.server.CPU',this)}, //No I18n
					{startColumnName: 'MEM_RESERVATIONMB', numberOfColumns: 3, titleText: Ember.I18n.t('webclient.map.server.Memory',this)} //No I18n
				  ]
			});

			$("#gview_opm_DeviceSnapList"+snapId+" .jqg-first-row-header").remove();
		}
	},
	UCSOverview: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var multiData = new Array();
		if (deviceBasicDetails.serviceProfileDetails != null) {
			var arr = new Array();
			arr.push("Associated"); //No I18N
			arr.push(deviceBasicDetails.serviceProfileDetails.ProfileAssoicatedServer);
			multiData.push(arr);
			arr = new Array();
			arr.push("Unassociated"); //No I18N
			arr.push(deviceBasicDetails.serviceProfileDetails.totalServer - deviceBasicDetails.serviceProfileDetails.ProfileAssoicatedServer);
			multiData.push(arr);
		}
		
		var $contentdiv = $("<div class='content'></div>");
		var $graphs = $("<div class='contentLeft'></div>");
		$contentdiv.append($graphs);
		
		var $legendTable = $("<div class='contentRight opm_jqGridUI'><table class='ut ut-Grid' id='opm_pie_Legend"+snapId+"'></table></div>");
		$contentdiv.append($legendTable);
		$graphs.append($('<div id="perfGraph1'+snapId+'" style="width:auto !important;"></div>'));
		
		widgetElement.append($contentdiv);
		
		var height = 400;
		
		if($("#li_"+snapId).attr("data-gs-height") != sizeY && $("#li_"+snapId).attr("data-gs-height") != sizeY+"") {
			$("#li_"+snapId).attr("data-gs-height", sizeY);
			reloadGridsterUl(snapId, reload);
		} else if(!reload) {
			reloadGridsterUl(snapId, reload);
		}
		var chartObj = {
			id:"perfGraph1"+snapId,//No I18N
			type:'pie', //dial, bar,area,line,pie //No I18N
			subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
			customClass:"opm_pie",//No I18N
			jsonData:multiData,
			height:height,
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Profiles",columnname_2:"Value",timeFormat:'hours'},//No I18N
			legend : {
				"colorBox": { //No I18N
		            "shape": "circle", //No I18N
		            "strokeOpacity": 1 //No I18N
		        },
		        "fontFamily": "'LatoRegular'", //No I18N
		        "fontSize": 16, //No I18N
//						        "itemHeight": "30",
				"hAlign": "center", //No I18N
				"vAlign": "bottom" //No I18N
			}
//			,
//			pie:{innerLabel:true}
		}
		if(reload) {
			var arraObj={
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			var mappingobj={};
			arraObj.chartobj.push(chartObj);
			arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
			zChart(arraObj); 
		} else {
			addSnapshotChart(shortSummary, chartObj, "perfGraph1"+snapId); //No I18N
		}
	},
	UCSChassisCount: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $contentdiv = $("<div id='snapHolder_"+snapId+"' class='content speedoMeterWidget' style='display:table'></div>");
		widgetElement.append($contentdiv);
		var $dials = $("<div class='DIGG-Time' style='display: table-row'></div>");
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.chassisCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.ucs.chassis',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.chassisServerCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.ucs.chassisservers',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.rackServerCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.ucs.rackmountserver',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.fabricInterConnectCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.ucs.fabricinterconnects',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.fanModuleCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.devices.ucs.fanmodules',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.serviceProfileCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.serviceprofile',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.portCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.ethernetports',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.iomCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.iomodule',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.fexCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.fex',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.adaptorCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.adaptorunit',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		
		var availDataStr = "<div style='position:relative !important;  top:0 !important;' class='dialcounter'>"+
		"<div style='padding-bottom: 30px !important;'><b><span>"+deviceBasicDetails.ucsComponentsCount.processorCount+"</span></b></div>"+
		"<i style='bottom: 20px;'>"+Ember.I18n.t('webclient.ucs.processunit',this)+"</i>"+
		"</div>";
		$dials.append($(availDataStr));
		$contentdiv.append($dials);
		
		if(!expandWidget) {
			var holderHeight = $("#snapHolder_"+snapId).height();
			var newsizeY = Math.round(holderHeight / 36)+1;
			if ($("#li_"+snapId).attr("data-gs-height") != newsizeY && $("#li_"+snapId).attr("data-gs-height") != newsizeY+"") {
				$("#li_"+snapId).attr("data-gs-height", newsizeY);
				reloadGridsterUl(snapId, reload);
			} else if(!reload){
				reloadGridsterUl(snapId, reload);
			}
		}
	},
	UCSChassisSummary: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.hardware.model',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.model+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.ucs.powerstatus',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.powerStatus+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.ucs.operstate',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.operState+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.ucs.configstate',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.configState+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.Name',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.name+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.ucs.operability',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.operability+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.ucs.serial',this)+"</div><div>"+deviceBasicDetails.chassisProps.chassisDetails.serial+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.details.parentucs',this)+"</div><div class='pointer' onclick='redirectToDeviceSnapshot(\""+deviceBasicDetails.deviceName+"\")'><a>"+deviceBasicDetails.deviceDisplayName+"</a></div></div>"));
		$sectionout.append($section1);
		widgetElement.append($sectionout);
	},
	UCSFabricSummary: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var $sectionout = $("<section class='DI-Grid'></section>");
		var $section1 = $("<section class='DIG-List DIGmCustomScroll'></section>");
		var $section = $("<div></div>");
		$section1.append($section);
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.snapshot.hardware.model',this)+"</div><div>"+deviceBasicDetails.fabricDetails.model+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.ucs.gateway',this)+"</div><div>"+deviceBasicDetails.fabricDetails.gateway+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.ucs.subnetmask',this)+"</div><div>"+deviceBasicDetails.fabricDetails.subnetmask+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.ucs.operability',this)+"</div><div>"+deviceBasicDetails.fabricDetails.operability+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.Name',this)+"</div><div>"+deviceBasicDetails.fabricDetails.name+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.map.view.ipaddress',this)+"</div><div>"+deviceBasicDetails.fabricDetails.ipAddress+"</div></div>"));
		$section.append($("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.devices.ucs.serial',this)+"</div><div>"+deviceBasicDetails.fabricDetails.serial+"</div></div>"));
		$sectionout.append($section1);
		widgetElement.append($sectionout);
	},
	Remotegrid: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		
		var url = apiURL + "&jqgridLoad=true"; // No I18N
		var $contentdiv1 = $("<div class='content'></div>");
//		if((!reload && !pageReload) || firsttineOndemandLoad) {
//			for(var i = 0; i < snapshotData.colModelList.length; i++) {
//				var columnModel = snapshotData.colModelList[i];
//				if("" != snapshotData.colNamesList[i] && Ember.I18n.t(snapshotData.colNamesList[i],this).indexOf("Missing translation") != -1) {
//					snapshotData.colNamesList[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
//				}
//				if(columnModel.formatter != null && columnModel.formatter != "") {
//					var tmpFunc = new Function('return '+columnModel.formatter);
//					columnModel.formatter = tmpFunc();
//				}
//			}
//		}
		var defaultOptions = {
			multiselect: false,
			searchOption: true,
			toggleSearch: false,
			minRowsPerPage: (expandWidget)?50:10,
			isSnapshotGrid: true,
			snapId: snapId,
			reload: reload,
			reloadMsgId: reloadMsgId,
			pagination: (expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?true:false,
			expandedGrid: expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget
		};
		var showAllTxt = "<div class='widgetListMore' onclick='expandSnapWidget(\""+snapIndex+"\");'>Show All...</div>";
		var $div1 = $("<div class='opm_jqGridUI'><table id='opm_DeviceSnapList_"+snapId+"'></table><div id='opm_DeviceSnapPager_"+snapId+"'></div></div>"+showAllTxt);
		$contentdiv1.append($div1);
		widgetElement.append($contentdiv1);
		loadJQgridWithRemote("#opm_DeviceSnapList_"+snapId, url, snapshotData.colNamesList, snapshotData.colModelList, "", "#opm_DeviceSnapPager_"+snapId, snapshotData.onselectfunction, defaultOptions); //No I18N
	},
	RemoteSubGrid: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType,paramURL) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
//		widgetElement.attr("data-colNames", JSON.stringify(snapshotData.colNamesList));// No I18N
//		widgetElement.attr("data-colModel", JSON.stringify(snapshotData.colModelList));// No I18N
		var url = apiURL + "&jqgridLoad=true"; // No I18N
		var $contentdiv1 = $("<div class='content'></div>");
//		if((!reload && !pageReload) || firsttineOndemandLoad) {
//			for(var i = 0; i < snapshotData.colModelList.length; i++) {
//				var columnModel = snapshotData.colModelList[i];
//				if("" != snapshotData.colNamesList[i] ) {
//					snapshotData.colNamesList[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
//				} 
//				if(columnModel.formatter != null && columnModel.formatter != "") {
//					var tmpFunc = new Function('return '+columnModel.formatter);
//					columnModel.formatter = tmpFunc();
//				}
//			}
//			for(var i = 0; i < snapshotData.subgrid.colModelList.length; i++) {
//				var columnModel = snapshotData.subgrid.colModelList[i];
//				if("" != snapshotData.subgrid.colNamesList[i] ) {
//					snapshotData.subgrid.colNamesList[i] = Ember.I18n.t(snapshotData.subgrid.colNamesList[i],this);
//				} 
//				if(columnModel.formatter != null && columnModel.formatter != "") {
//					var tmpFunc = new Function('return '+columnModel.formatter);
//					columnModel.formatter = tmpFunc();
//				}
//			}
//		}
		var defaultOptions = snapshotData.subgrid;
		defaultOptions.multiselect=false;
		defaultOptions.searchOption=false;
		defaultOptions.minRowsPerPage=(expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?50:10;
		defaultOptions.isSnapshotGrid=true;
		defaultOptions.snapId=snapId;
		defaultOptions.paramURL=paramURL;
		defaultOptions.reload=reload;
		defaultOptions.reloadMsgId=reloadMsgId;
		defaultOptions.pagination=(expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?true:false;
		defaultOptions.subGrid=true;
		defaultOptions.expandedGrid=expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget;
		var showAllTxt = "<div class='widgetListMore' onclick='expandSnapWidget(\""+snapIndex+"\");'>Show All...</div>";
		$div1 = $("<div class='opm_jqGridUI'><table id='opm_DeviceSnapList_"+snapId+"'></table><div id='opm_DeviceSnapPager_"+snapId+"'></div></div>"+showAllTxt);
		$contentdiv1.append($div1);
		widgetElement.append($contentdiv1);
		loadJQgridWithRemote("#opm_DeviceSnapList_"+snapId, url, snapshotData.colNamesList, snapshotData.colModelList, "", "#opm_DeviceSnapPager_"+snapId, snapshotData.onselectfunction, defaultOptions); //No I18N
	},
	OnDemandGrid: function(apiURL, sizeY, reloadMsgId, widgetElement, snapDetailstype, snapId, snapIndex,timeframe,firsttineOndemandLoad, reload, shortSummary, expandWidget, pageReload, timeChange,artGraphType) {
		var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
		var snapDetails = snapshotDataObj.snapList[snapIndex];
		var snapshotData = snapDetails.snapshotData;
		
//		widgetElement.attr("data-colNames", JSON.stringify(snapshotData.colNamesList));// No I18N
//		widgetElement.attr("data-colModel", JSON.stringify(snapshotData.colModelList));// No I18N
//		if(!reload || firsttineOndemandLoad) {
//			for(var i = 0; i < snapshotData.colModelList.length; i++) {
//				var columnModel = snapshotData.colModelList[i];
//				try{
//					if(snapshotData.colNamesList[i] != "") {
//						snapshotData.colNamesList[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
//					}
//					if(columnModel.formatter != null && columnModel.formatter != "") {
//						var tmpFunc = new Function('return '+columnModel.formatter);
//						columnModel.formatter = tmpFunc();
//					}
//				} catch(e){
//					//ignore formatter undefined exceptions as of now. Remove once fixed
//				}
//			}
//		}
		
		var $contentdiv2 = $("<div class='content'></div>");
		widgetElement.append($contentdiv2);
		
		var showAllTxt = "<div class='widgetListMore' onclick='expandSnapWidget(\""+snapIndex+"\");'>Show All...</div>";
//		$div2 = $("<div class='opm_jqGridUI' id='snap_data_holder_"+snapId+"' data-colNames='"+JSON.stringify(snapshotData.colNamesList)+"' data-colModel='"+JSON.stringify(snapshotData.colModelList)+"'><table id='opm_DeviceSnapList"+snapId+"'></table><div id='opm_DeviceSnapPager"+snapId+"'></div></div>"+showAllTxt);
		$div2 = $("<div class='opm_jqGridUI' id='snap_data_holder_"+snapId+"'><table id='opm_DeviceSnapList"+snapId+"'></table><div id='opm_DeviceSnapPager"+snapId+"'></div></div>"+showAllTxt);

		$contentdiv2.append($div2);
		$("#li_"+snapId+" .content .opm_jqGridUI").addClass("nodata");
	}
});

function ncmDeviceRepFormatter(cellValue, options, rowdata, action) {
	return '<div class="nfaDataStatus" style="background:'+cellValue+'"></div>';
}
function getNFAInventoryTimePeriod() {
	var timePeriod = OPMClient.FWAGlobalDataController.timePeriod;
	if(OPMClient.InventoryDeviceDetailsController.expandSnapWidget && OPMClient.FWAGlobalDataController.expandtimePeriod != undefined) {
		timePeriod = OPMClient.FWAGlobalDataController.expandtimePeriod;
		}
	if(timePeriod == undefined) {
		timePeriod='fulltime'; //NO I18N
	}
	return timePeriod;
}

// Methods for getting forensics grid column name and column model for both client and pdf reports

function nfa_severityBar(cellValue,options,rowdata) {
	if(cellValue!==undefined) {
		var className = ""; //NO I18N
		var availability = parseInt(cellValue);
		if(availability>0 && availability<=25) {
			className = "lineChartValue severity_5"; //NO I18N
		}else if(availability>25 && availability<=50) {
			className = "lineChartValue severity_3"; //NO I18N
		}else if(availability>50 && availability<=75) {
			className = "lineChartValue severity_2"; //NO I18N
		}else {
			className = "lineChartValue severity_1"; //NO I18N
		}
		return "<div class='lineChartOuter'><div class='"+className+"' data-value='"+availability+"' style='width:"+availability+"%;'></div><span>"+availability+"%</span></div>"; //NO I18N
	}
}

function nfa_getPieTableColorBar(cellValue,options,rowdata,action) {
	return (options.rowId>10)?"":"<div class='nfaDataStatus' style='background:"+fluidicv2[options.rowId-1]+"'></div>"; //NO I18N
}

function nfa_getPieArray(data) {
	if(data.length===0) { return data;}
	var dataArray = (data.length<=10)?data:data.slice(0,10);
	if((dataArray[dataArray.length-1][0]).indexOf("Others")!==-1) { //NO I18N
		dataArray.pop();
	}
	return dataArray;
}

function nfa_getTrafficSummaryGridDetails() {
	var colNamesList = ["webclient.reports.tags.Category","opu.views.TOTAL","webclient.reports.max","opu.common.MINIMUM","webclient.availability.datatype.average","traffic.StandardDeviation",Ember.I18n.t("nfa.report.nthPercentail",{n:window.OPM.nfaPercentile})]; //NO I18N
	var colModelList = [
		{ name:"0", index:"0"}, //NO I18N
		{ name:"1", index:"1", sorttype:nfa_customSort }, //NO I18N
		{ name:"2", index:"2", sorttype:nfa_customSort }, //NO I18N
		{ name:"3", index:"3", sorttype:nfa_customSort }, //NO I18N
		{ name:"4", index:"4", sorttype:nfa_customSort }, //NO I18N
		{ name:"5", index:"5", sorttype:nfa_customSort }, //NO I18N
		{ name:"6", index:"6", sorttype:nfa_customSort } //NO I18N
	];
	return validateGridColumnDetails(colModelList,colNamesList);
}

function nfa_getForensicsTrafficGridDetails(){
	var colNamesList = ["NFAWidget.Time", "NFAWidget.IN", "NFAWidget.OUT"]; //NO I18N
	var colModelList = [
		{name: "Time",		index: "Time",	sorttype:"date",datefmt:"M-d-y H:i"}, //NO I18N
		{name: "IN",		index: "IN",	sorttype: nfa_customSort}, //NO I18N
		{name: "OUT",		index: "OUT",	sorttype: nfa_customSort} //NO I18N
	];
	return validateGridColumnDetails(colModelList,colNamesList);
}

function nfa_getMulticastSummaryGridDetails() {
	var colNamesList = ["webclient.reports.tags.Category","opu.views.TOTAL","webclient.availability.datatype.average"]; //NO I18N
	var colModelList = [
		{ name:"type",	index:"type"}, //NO I18N
		{ name:"total",	index:"total", sorttype:nfa_customSort}, //NO I18N
		{ name:"avg",	index:"avg", sorttype:nfa_customSort} //NO I18N
	];
	return validateGridColumnDetails(colModelList,colNamesList);
}

function nfa_getMulticastGridDetails(groupBy,resolveDNS) {
	var colNamesList = ["NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","webclient.widget.disk.volume","webclient.maps.bview.packet","webclient.reports.createreport.utilization"]; //NO I18N
	var colModelList = [
		{ name:"0",	index:"0", width:40, sorttype:nfa_IPV4Sorting, formatter:jqGridHTMLEncode}, //NO I18N
		{ name:"1",	index:"1", width:40, sorttype:nfa_IPV4Sorting, formatter:jqGridHTMLEncode}, //NO I18N
		{ name:"2",	index:"2", width:30}, //NO I18N
		{ name:"3",	index:"3", width:25, sorttype:nfa_customSort}, //NO I18N
		{ name:"4",	index:"4", width:20, sorttype:"number"}, //NO I18N
		{ name:"5",	index:"5", width:15, sorttype:"number"} //NO I18N
	];
	if(groupBy!=="none") { //NO I18N
		colModelList.splice(4,2);
		if(resolveDNS && groupBy!=="application") { //NO I18N
			colModelList[3].name = colModelList[3].index = "4"; //NO I18N
		}
	}
	colNamesList = nfa_modifyMulticastMedianetGridDetail(colNamesList,groupBy);
	return validateGridColumnDetails(colModelList,colNamesList);
}
function nfa_getMedianetGridDetails(groupBy,sortBy) {
	var colNamesList;
	var colModelList = [
		{ name: 'src', index: 'src',formatter:jqGridHTMLEncode}, //No I18N
		{ name: 'dst', index: 'dst',formatter:jqGridHTMLEncode}, //No I18N
		{ name: 'app', index: 'app',sorttype:'text'}, //No I18N
		{ name: 'mPkts', index: 'mPkts',sorttype:'int'}, //No I18N
		{ name: 'mVolume', index: 'mVolume',sorttype:nfa_customSort}, //No I18N
		{ name: 'rtt', index: 'rtt',sorttype:'int'}, //No I18N
		{ name: 'jittermax', index: 'jittermax',sorttype:'number'}, //No I18N
		{ name: 'jittermin', index: 'jittermin',sorttype:'number'}, //No I18N
		{ name: 'jitteravg', index: 'jitteravg',sorttype:'number'}, //No I18N
		{ name: 'pktLostEvent', index: 'pktLostEvent',sorttype:'int'}, //No I18N
		{ name: 'pktLost', index: 'pktLost',sorttype:'int'}, //No I18N
		{ name: 'pktRate', index: 'pktRate',sorttype:'number'}, //No I18N
		{ name: 'appID', index: 'appID',hidden:true} //No I18N
	];
	
	if(sortBy === "all") { //No I18N
		for(var i=0;i<colModelList.length;i++) {
			colModelList[i].align = "center"; //No I18N
		}
		colNamesList = ['NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','opu.views.PACKETS','webclient.reports.volume','ipsla.Rtt','webclient.devices.intftypes.max','webclient.devices.intftypes.min','webclient.devices.intftypes.avg','NFAWidget.event','webclient.common.widgets.eventcount','nfa.medianet.rate','webclient.forensics.AppID']; //No I18N
	}else {
		colNamesList = ['NFAWidget.Src','NFAWidget.Dst','NFAWidget.App','webclinet.nfa.medianet.mediapkts','webclinet.nfa.medianet.mediavol','ipsla.Rtt','webclinet.nfa.medianet.jittermax','webclinet.nfa.medianet.jittermin','webclinet.nfa.medianet.jitteravg','webclinet.nfa.medianet.pktlostevent','medianet.packetlost','webclinet.nfa.medianet.pktlostrate','webclient.forensics.AppID']; //No I18N
	}

	switch(sortBy) {
		case 'media'	: 	colNamesList.splice(5,8);colModelList.splice(5,8); //No I18N
							break;
		case 'packet'	: 	colNamesList.splice(3,7);colModelList.splice(3,7); //No I18N
							break;
		case 'jitter'	: 	colNamesList.splice(3,3);colModelList.splice(3,3);colNamesList.splice(6,4);colModelList.splice(6,4); //No I18N
							break;
		case 'rtt'		: 	colNamesList.splice(3,2);colModelList.splice(3,2);colNamesList.splice(4,3);colModelList.splice(4,3);colNamesList.splice(5,3);colModelList.splice(5,3); //No I18N
							break;
	}
	colNamesList = nfa_modifyMulticastMedianetGridDetail(colNamesList,groupBy);
	colModelList = nfa_modifyMulticastMedianetGridDetail(colModelList,groupBy);
	var returnObj = validateGridColumnDetails(colModelList,colNamesList);
	returnObj.groupHeaders = {
        useColSpanStyle:true,
        groupHeaders:[
            {startColumnName: 'mPkts', numberOfColumns: 2, titleText: '<div align="center">'+Ember.I18n.t('nfa.medianet.media')+'</div>'}, //No I18N
            {startColumnName: 'jittermax', numberOfColumns: 3, titleText: '<div align="center">'+Ember.I18n.t('webclient.map.jitter')+'</div>'}, //No I18N
            {startColumnName: 'pktLostEvent', numberOfColumns: 3, titleText: '<div align="center">'+Ember.I18n.t('medianet.packetlost')+'</div>'} //No I18N
        ]
    }
	return returnObj;
}
function nfa_modifyMulticastMedianetGridDetail(colList,groupBy) {
	switch(groupBy) {
		case 'application'	: 	colList.splice(0,2);break; //No I18N
		case 'source'		: 	colList.splice(1,2);break; //No I18N
		case 'destination'	: 	colList.splice(0,1);colList.splice(1,1);break; //No I18N
	}
	return colList;
}

function nfa_getForensicsGridDetails(reportType,isTOS,gridData,isCloudInterface) {
	var hiddenCollArr = [];
	var gridDetails = nfa_getColumnNameModelDetails(((reportType=="conversation")?"forensicsConv":"forensicsReports")); //NO I18N
	var colNamesList = gridDetails.colNamesList;
	var colModelList = gridDetails.colModelList;

	if(isCloudInterface && reportType === "conversation"){ //NO I18N
		setHiddenColumn(colModelList, ["nexthop", "fnf"], true); //NO I18N
		if(gridData[0] !== undefined && gridData[0].StartTime !== undefined && gridData[0].StartTime !== ""){ //NO I18N
			setHiddenColumn(colModelList, ["StartTime", "EndTime", "latency", "trafficType"], false); //NO I18N
		}else{
			setHiddenColumn(colModelList, ["indvTrafficGraph"], false); //NO I18N
		}
	}else if(reportType === "conversation") { //NO I18N
		if(gridData[0] != undefined) {
			if(gridData[0].pkts2!==undefined && gridData[0].pkts2!=="") { //NO I18N
				hiddenCollArr = ["nexthop1","nexthop2","pkts1","pkts2","flowevent"]; //NO I18N
			}
			if(gridData[0].StartTime!==undefined && gridData[0].StartTime!=="") { //NO I18N
				//to display below columns when Show All Conv is enabled
				hiddenCollArr.push("StartTime"); //NO I18N
				hiddenCollArr.push("EndTime"); //NO I18N
				hiddenCollArr.push("latency"); //NO I18N
				hiddenCollArr.push("srcASName"); hiddenCollArr.push("dstASName"); //NO I18N
				hiddenCollArr.push("srcMACAddress"); hiddenCollArr.push("dstMACAddress"); //NO I18N
			}else {
				hiddenCollArr.push("indvTrafficGraph"); //NO I18N
			}
		}
		hiddenCollArr.push(((isTOS)?"tos":"dscp")); //NO I18N
		setHiddenColumn(colModelList,hiddenCollArr,false);
	}else {
		switch(reportType) {
			case "application"	: 	hiddenCollArr = ["app"];break; //NO I18N
			case "DSCP"			: 	hiddenCollArr = [((isTOS)?"tos":"dscp")];break; //NO I18N
			case "TCP_FLAGS"	: 	hiddenCollArr = ["tcp_flags"];break; //NO I18N
			case "nextHop"		: 	hiddenCollArr = ["nexthop"];break; //NO I18N
			case "source"		: 	 //NO I18N
			case "destination"	: 	hiddenCollArr = ["src","dst"];break; //NO I18N
			case "asview"		: 	hiddenCollArr = ["as","asnumber"];break; //NO I18N
		}
		setHiddenColumn(gridDetails.colModelList,hiddenCollArr,false);
	}
	if(colModelList[0].name === 'indvTrafficGraph') colModelList[0].hidedlg = true;
	return validateGridColumnDetails(colModelList,colNamesList);
}

function nfa_getWlcForensicsGridDetails(reportType,showAllConv) {
	var hiddenCollArr = [], status;
	var gridDetails = nfa_getColumnNameModelDetails("wlcForensicsConv"); //NO I18N
	if(reportType==="conversation") { //NO I18N
		hiddenCollArr.push("appID"); //NO I18N
		hiddenCollArr.push((showAllConv)?"indvTrafficGraph":"CollectionTime"); //NO I18N
		for(var i=0;i<gridDetails.colModelList.length;i++) {
			status = hiddenCollArr.contains(gridDetails.colModelList[i].name);
			gridDetails.colModelList[i].hidden = status;
			gridDetails.colModelList[i].hidedlg = status;
		}
	}else {
		switch(reportType) {
			case "SSID"			: 	hiddenCollArr.push("ssid");		break; //NO I18N
			case "IPHost"		: 	hiddenCollArr.push("clientip");	break; //NO I18N
			case "Host"			: 	hiddenCollArr.push("clientmac");break; //NO I18N
			case "application"	: 	hiddenCollArr.push("app");		break; //NO I18N
			case "DSCPIn"		: 	hiddenCollArr.push("dscpin");	break; //NO I18N
			case "DSCPOut"		: 	hiddenCollArr.push("dscpout");	break; //NO I18N
		}
		setHiddenColumn(gridDetails.colModelList,hiddenCollArr,false);
	}
	if(gridDetails.colModelList[0].name === 'indvTrafficGraph') gridDetails.colModelList[0].hidedlg = true;
	return validateGridColumnDetails(gridDetails.colModelList,gridDetails.colNamesList);
}

function nfa_getDPIForensicsGridDetails(reportType, protocol) {
	var columnDetails = nfa_getColumnNameModelDetails("dpiReportGridDetails"); //NO I18N
	switch(reportType) {
		case 'app'		: 	if(protocol == "17"){columnDetails.colNamesList.splice(1,2);columnDetails.colModelList.splice(1,2);} //NO I18N
							break;
		case 'urlHost'	: 	columnDetails.colNamesList[0] = Ember.I18n.t("fwa.report.url"); //No I18N
							break;
		case 'src'		: 	columnDetails.colNamesList[0] = Ember.I18n.t("NFAWidget.Src"); //No I18N
							if(protocol == "17"){columnDetails.colNamesList.splice(1,2);columnDetails.colModelList.splice(1,2);} //NO I18N
							break;
		case 'dst'		: 	columnDetails.colNamesList[0] = Ember.I18n.t("NFAWidget.Dst"); //No I18N
							if(protocol == "17"){columnDetails.colNamesList.splice(1,2);columnDetails.colModelList.splice(1,2);} //NO I18N
							break;
		case 'conv'		: 	columnDetails = nfa_getColumnNameModelDetails("dpiConvGridDetails"); //NO I18N
							if(protocol == "17"){columnDetails.colNamesList.splice(2,1);columnDetails.colModelList.splice(2,1);columnDetails.colNamesList.splice(6,2);columnDetails.colModelList.splice(6,2);columnDetails.colNamesList.splice(8,1);columnDetails.colModelList.splice(8,1);} //NO I18N
							break;
		case 'traffic'	: 	columnDetails = nfa_getColumnNameModelDetails("dpiTrafficGridDetails"); //NO I18N
							break;
	}
	return columnDetails;
}

function nfa_getIndividualGraphGridDetails(reportType,isNBAR,exportReqFrom,isFrom) {
	var colNamesList,colModelList;
	if(exportReqFrom === "ASView" || exportReqFrom === "ASGroup") { //NO I18N
		colNamesList = OPMClient.InventoryPDFParams.get("nfaTShootTraffTbl.colNamesList"); //NO I18N
		colModelList = OPMClient.InventoryPDFParams.get("nfaTShootTraffTbl.colModelList"); //NO I18N
	}else if(exportReqFrom==="CBQoS") { //NO I18N
		colNamesList = ["webclient.nfa.cbqos.prepolicy","webclient.nfa.cbqos.postpolicy","webclient.nfa.cbqos.postpercent","webclient.nfa.cbqos.dropped","webclient.nfa.cbqos.droppedpercent"]; //NO I18N
		colModelList = [
			{ name:"1", index:"1", sorttype:"int"}, //NO I18N
			{ name:"2", index:"2", sorttype:"int"}, //NO I18N
			{ name:"4", index:"4", sorttype:"int"}, //NO I18N
			{ name:"3", index:"3", sorttype:"int"}, //NO I18N
			{ name:"5", index:"5", sorttype:"int"} //NO I18N
		];
	}else if(isFrom === "cloudUser"){ //NO I18N
		colNamesList = ["NFAWidget.Src", "NFAWidget.App", "NFAWidget.dscp", "NFAWidget.trfc"]; //NO I18N
		colModelList = [
			{name: "0",	index: "0"}, //NO I18N
			{name: "1",	index: "1"}, //NO I18N
			{name: "2",	index: "2"}, //NO I18N
			{name: "4",	index: "4"} //NO I18N
		];
	}else if(reportType==="Conversation" && exportReqFrom==="FlowAPMAC"){ //NO I18N
		colNamesList = ["NFAWidget.CliIP","webclinet.inventory.wlc.apmacname","webclinet.inventory.wlc.clientmac","NFAWidget.App","NFAWidget.WLSSID","webclinet.inventory.wlc.predscp","webclinet.inventory.wlc.postdscp","NFAWidget.trfc"]; //NO I18N
		colModelList = [
			{ name:"0", index:"0"}, //NO I18N
			{ name:"1", index:"1"}, //NO I18N
			{ name:"2", index:"2"}, //NO I18N
			{ name:"5", index:"5"}, //NO I18N //added new column for conversation src and dst (index 3 & 4) to maintain the existing column order
            { name:"6", index:"6"}, //NO I18N
            { name:"7", index:"7"}, //NO I18N
            { name:"8", index:"8"}, //NO I18N
            { name:"9", index:"9"} //NO I18N
		];
	}else if(reportType==="Conversation" || reportType==="ConvNetWork") { //NO I18N
		colNamesList = ["NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","showPorts.SourcePort","showPorts.DestPort","NFAWidget.proto","NFAWidget.dscp","NFAWidget.trfc"]; //NO I18N
		colModelList = [
			{ name:"src",	index:"src",	sortable:true}, //NO I18N
			{ name:"dst",	index:"dst",	sortable:true}, //NO I18N
			{ name:"app",	index:"app",	sortable:true}, //NO I18N
			{ name:"port",	index:"port",	sortable:true}, //NO I18N
			{ name:"dstport",	index:"dstport",sortable:true}, //NO I18N
			{ name:"prot",		index:"prot",	sortable:true}, //NO I18N
			{ name:"dscp",		index:"dscp",	sortable:true}, //NO I18N
			{ name:"traffic",	index:"traffic",sortable:true} //NO I18N
		];
	}else {
		colNamesList = ["webclient.dashboards.name","NFAWidget.trfc","NFAWidget.perctraf"]; //NO I18N
		if(isNBAR) {
			colModelList = [
				{ name:"1", index:"1", sortable:true}, //NO I18N
				{ name:"3", index:"3", sortable:true}, //NO I18N
				{ name:"2", index:"2", sortable:true} //NO I18N
			];
		}else {
			colModelList = [
				{ name:"Name",		index:"Name",		sortable:true}, //NO I18N
				{ name:"volume",	index:"volume",		sortable:true}, //NO I18N
				{ name:"traffic",	index:"traffic",	sortable:true} //NO I18N
			];
		}
	}
	return validateGridColumnDetails(colModelList,colNamesList);
}

function nfa_getDevTrafficTblDetails(colNamesList,colModelList,showGranularity,granularity) {
	if(showGranularity===undefined || showGranularity) {
		colNamesList[2]=Ember.I18n.t("webclient.reports.max"); //NO I18N
		colNamesList[4]=Ember.I18n.t("opu.common.MINIMUM"); //NO I18N
		setHiddenColumn(colModelList,["minHR","maxHR"],true); //NO I18N
	}else {
		colNamesList[2]=Ember.I18n.t("webclient.inventory.1min"); //NO I18N
		colNamesList[3]=granularity;
		colNamesList[4]=Ember.I18n.t("webclient.inventory.1min"); //NO I18N
		colNamesList[5]=granularity;
		setHiddenColumn(colModelList,["minHR","maxHR"],false); //NO I18N
		var gridCallBackFunc = function(gridTableID) {
			$("#"+gridTableID).jqGrid("setGroupHeaders",{ //NO I18N
				useColSpanStyle:true,
				groupHeaders:[
					{startColumnName:"max",numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t("webclient.reports.max")+"</div>"}, //NO I18N
					{startColumnName:"min",numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t("opu.common.MINIMUM")+"</div>"} //NO I18N
				]
			});
			$("#gview_"+gridTableID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //No I18N
		}
	}
	return {colNamesList:colNamesList,colModelList:colModelList,gridCallBackFunc:gridCallBackFunc};
}

function nfa_getPercentileReportGridDetails(gridTableID,sourceType) {
	var gridDetails = {};
	gridDetails.colNamesList = [Ember.I18n.t("NFAWidget.Devname"),Ember.I18n.t("NFAWidget.intfName"),Ember.I18n.t("NFAWidget.trfc"),Ember.I18n.t("nfa.report.nthPercentail",{n:"90"}),Ember.I18n.t("nfa.report.nthPercentail",{n:"95"}),Ember.I18n.t("nfa.report.nthPercentail",{n:"99"}),Ember.I18n.t("NFAWidget.trfc"),Ember.I18n.t("nfa.report.nthPercentail",{n:"90"}),Ember.I18n.t("nfa.report.nthPercentail",{n:"95"}),Ember.I18n.t("nfa.report.nthPercentail",{n:"99"})]; //NO I18N
	gridDetails.colModelList = [
		{name:"name",		index:"name",		align:"center"}, //NO I18N
		{name:"iName",		index:"iName",		align:"center"}, //NO I18N
		{name:"trafficIN",	index:"trafficIN",	align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"90thIN",		index:"90thIN",		align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"95thIN",		index:"95thIN",		align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"99thIN",		index:"99thIN",		align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"trafficOUT",	index:"trafficOUT",	align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"90thOUT",	index:"90thOUT",	align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"95thOUT",	index:"95thOUT",	align:"center", sorttype:nfa_customSort}, //NO I18N
		{name:"99thOUT",	index:"99thOUT",	align:"center", sorttype:nfa_customSort} //NO I18N
	];
	if(sourceType !== "1" && sourceType !== "4" ) {
        gridDetails.colNamesList[0] = Ember.I18n.t("webclient.opm.groupname.header"); //NO I18N
        gridDetails.colModelList[1].hidden = true;
    }
    if(sourceType === "4" ) {
        gridDetails.colNamesList[0] = Ember.I18n.t("wlc.controller.name"); //NO I18N
        gridDetails.colNamesList[1] = Ember.I18n.t("webclinet.inventory.wlc.apmacname"); //NO I18N
    }
	gridDetails.gridCallBackFunc = function(gridTableID) {
		$("#"+gridTableID).jqGrid("setGroupHeaders",{ //NO I18N
			useColSpanStyle:true,
			groupHeaders:[
				{startColumnName:"trafficIN", numberOfColumns:4, titleText:"<div align='center'>"+Ember.I18n.t("NFAWidget.IN")+"</div>"}, //NO I18N
				{startColumnName:"trafficOUT",numberOfColumns:4, titleText:"<div align='center'>"+Ember.I18n.t("NFAWidget.OUT")+"</div>"} //NO I18N
			]
		});
		$("#gview_"+gridTableID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
	}
	return gridDetails;
}

function nfa_getColumnNameModelDetails(tableName){
	var colNamesList=[],colModelList=[];
	switch(tableName) {
		case "flowTemplate"			: 	colNamesList = ["webclient.nfa.flowTemplate.id", "webclient.nfa.flowTemplate.fieldCount"]; //NO I18N
										colModelList = [
											{name: "templateID", index: "templateID", sorttype: "number"}, //NO I18N
											{name: "fieldCount", index: "fieldCount", sorttype: "number"} //NO I18N
										];
										break;

		case "flowTemplateSubGrid"	: 	colNamesList = ["webclient.nfa.flowTemplate.fieldID", "webclient.nfa.flowTemplate.fieldName", "webclient.nfa.flowTemplate.fieldLength"]; //NO I18N
										colModelList = [
											{name: "0", index: "0", sorttype: "number"}, //NO I18N
											{name: "1", index: "1"}, //NO I18N
											{name: "2", index: "2", sorttype: "number"} //NO I18N
										];
										break;

		case "uniqueConv"			: 	colNamesList = ["webclient.devices.details.starttime","webclient.devices.details.endtime","NFAWidget.trfc","opu.views.PACKETS"]; //NO I18N
										colModelList = [
											{ name:"StartTime",	index:"StartTime",	width:"30", sorttype:"time"}, //NO I18N
											{ name:"EndTime",	index:"EndTime",	width:"30", sorttype:"time"}, //NO I18N
											{ name:"traffic",	index:"traffic",	width:"30", sorttype:nfa_customSort}, //NO I18N
											{ name:"pkts",		index:"pkts",		width:"20", sorttype:"number"} //NO I18N
										];
										break;

		case "wlcUniqueConv"		: 	colNamesList = ["nfa.forensics.collectionTime","NFAWidget.trfc","opu.views.PACKETS"]; //NO I18N
										colModelList = [
											{ name:"CollectionTime",index:"CollectionTime",	width:"30", sorttype:"time"}, //NO I18N
											{ name:"traffic",		index:"traffic",		width:"30", sorttype:nfa_customSort}, //NO I18N
											{ name:"pkts",			index:"pkts",			width:"20", sorttype:"number"} //NO I18N
										];
										break;

		case "forensicsReports"		: 	colNamesList = ["","NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","NFAWidget.dscp","sch.tos","webclient.TCP_FLAGS","nfa.reports.NextHop","NFA.asName","NFA.asNumber","NFAWidget.trfc","opu.views.PACKETS","","",""]; //NO I18N
										colModelList = [
											{ name: "indvTrafficGraph",index:"indvTrafficGraph",formatter:"indvTrafficGraph",classes:"pointer",width:"25",sortable:false,search:false}, //NO I18N
											{ name: "src", 		index: "src",		sorttype: nfa_IPV4Sorting,	classes:"pointer",	hidden:true}, //NO I18N
											{ name: "dst", 		index: "dst",		sorttype: nfa_IPV4Sorting,	classes:"pointer",	hidden:true}, //NO I18N
											{ name: "app",		index: "app",		sorttype: "text",			classes:"pointer",	hidden:true}, //NO I18N
											{ name: "dscp",		index: "dscp",		sorttype: "text",			classes:"pointer",	hidden:true}, //NO I18N
											{ name: "tos",		index: "tos",		sorttype: "text",			classes:"pointer",	hidden:true}, //NO I18N
											{ name: "tcp_flags",index: "tcp_flags",	sorttype: "text",			classes:"pointer",	hidden:true}, //NO I18N
											{ name: "nexthop",	index: "nexthop",	sorttype: nfa_IPV4Sorting,	classes:"pointer",	hidden:true}, //NO I18N
											{ name: "as",		index: "as",		classes:"pointer",			hidden:true}, //NO I18N
											{ name: "asnumber",	index: "asnumber",	sorttype: "number",			classes:"pointer",	hidden:true}, //NO I18N
											{ name: "traffic",	index: "traffic",	sorttype: nfa_customSort,	classes:"pointer"}, //NO I18N
											{ name: "pkts",		index: "pkts",		sorttype: "number",			classes:"pointer"}, //NO I18N
											{ name: "appID",	index: "appID",		hidden:true}, //NO I18N
											{ name: "srcip",	index: "srcip",		hidden:true}, //NO I18N
											{ name: "dstip",	index: "dstip",		hidden:true} //NO I18N
										];
										break;

		case "forensicsConv" 		: 	colNamesList = ["","NFAWidget.Src","nfa.source.MAC","NFAWidget.Dst","nfa.destination.MAC","NFAWidget.App","pdf.SrcPort","pdf.DstPort","NFAWidget.proto","NFAWidget.dscp","sch.tos","webclient.TCP_FLAGS","webclient.admin.syslogrules.flowrate","NFAWidget.trfc","opu.views.PACKETS","nfa.reports.NextHop","nfa.reports.FNFNbarApp","nfa.reports.msrcip","nfa.reports.mdstip","nfa.reports.msrcport","nfa.reports.mdstport","nfa.reports.flowevents","webclient.devices.details.starttime","webclient.devices.details.endtime","webclient.map.latency","","","","nfa.asview.srcas","nfa.asview.dstas","","","webclient.Traffic.Type"]; //NO I18N
										colModelList = [
											{ name: "indvTrafficGraph",index:"indvTrafficGraph",formatter:"indvTrafficGraph",classes:"pointer",width:"35",sortable:false,search:false,hidden:true,hidedlg:true}, //NO I18N
											{ name: "src", 		index: "src",		sorttype: nfa_IPV4Sorting}, //NO I18N
											{ name: "srcMACAddress", index: "srcMACAddress", hidden:true,	hidedlg:true}, //NO I18N
											{ name: "dst", 		index: "dst",		sorttype: nfa_IPV4Sorting}, //NO I18N
											{ name: "dstMACAddress", index: "dstMACAddress", hidden:true,	hidedlg:true}, //NO I18N
											{ name: "app",		index: "app",		sorttype: "text"}, //NO I18N
											{ name: "srcport",	index: "srcport",	sorttype: "number"}, //NO I18N
											{ name: "dstport",	index: "dstport",	sorttype: "number"}, //NO I18N
											{ name: "prot",		index: "prot",		sorttype: "text"}, //NO I18N
											{ name: "dscp",		index: "dscp",		sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "tos",		index: "tos",		sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "tcp_flags",index: "tcp_flags",	sorttype: "text"}, //NO I18N
											{ name: "flowrate",	index: "flowrate",	sorttype: nfa_customSort}, //NO I18N
											{ name: "traffic",	index: "traffic",	sorttype: nfa_customSort}, //NO I18N
											{ name: "pkts",		index: "pkts",		sorttype: "number"}, //NO I18N
											{ name: "nexthop",	index: "nexthop",	sorttype: nfa_IPV4Sorting}, //NO I18N
											{ name: "fnf",		index: "fnf",		sorttype: "text"}, //NO I18N
											{ name: "nexthop1",	index: "nexthop1",	sorttype: nfa_IPV4Sorting,	hidden:true,	hidedlg:true}, //NO I18N
											{ name: "nexthop2",	index: "nexthop2",	sorttype: nfa_IPV4Sorting,	hidden:true,	hidedlg:true}, //NO I18N
											{ name: "pkts1",	index: "pkts1",		sorttype: "number",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "pkts2",	index: "pkts2",		sorttype: "number",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "flowevent",index: "flowevent", sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "StartTime",index: "StartTime", sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "EndTime",	index: "EndTime",	sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "latency",	index: "latency",	sorttype: "text",			hidden:true,	hidedlg:true}, //NO I18N
											{ name: "appID",	index: "appID",		hidden:true,	hidedlg:true}, //NO I18N
											{ name: "srcip",	index: "srcip",		hidden:true,	hidedlg:true}, //NO I18N
											{ name: "dstip",	index: "dstip",		hidden:true,	hidedlg:true}, //NO I18N
											{ name: "srcASName",index: "srcASName",	hidden:true,	hidedlg:true}, //NO I18N
											{ name: "dstASName",index: "dstASName",	hidden:true,	hidedlg:true}, //NO I18N
											{ name: "srcAS",	index: "srcAS",		hidden:true,	hidedlg:true}, //NO I18N
											{ name: "dstAS",	index: "dstAS",		hidden:true,	hidedlg:true}, //NO I18N
											{ name: "trafficType",	index: "trafficType",	hidden:true,	hidedlg:true} //NO I18N
										];
										break;

		case "wlcForensicsConv"		:	colNamesList = ["","NFAWidget.WLSSID","NFAWidget.CliIP","webclinet.inventory.wlc.clientmac","NFAWidget.App","webclient.reports.PreDSCP","webclient.reports.PostDSCP","NFAWidget.trfc","opu.views.PACKETS","nfa.forensics.collectionTime",""]; //NO I18N
										colModelList = [
											{ name: "indvTrafficGraph", index: "indvTrafficGraph",	classes:"pointer", formatter:indvTrafficGraph, width:"25",sortable:false,search:false,hidedlg:true}, //NO I18N
											{ name: "ssid", 			index: "ssid", 				classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: "text"}, //NO I18N
											{ name: "clientip", 		index: "clientip", 			classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: nfa_IPV4Sorting}, //NO I18N
											{ name: "clientmac",		index: "clientmac", 		classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: "text"}, //NO I18N
											{ name: "app", 				index: "app", 				classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: "text"}, //NO I18N
											{ name: "dscpin", 			index: "dscpin", 			classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: "text"}, //NO I18N
											{ name: "dscpout", 			index: "dscpout", 			classes:"pointer", formatter:jqGridHTMLEncode, hidden:true, hidedlg:true,	sorttype: "text"}, //NO I18N
											{ name: "traffic", 			index: "traffic", 			classes:"pointer", sorttype: nfa_customSort}, //NO I18N
											{ name: "pkts", 			index: "pkts", 				classes:"pointer", sorttype: "int"}, //NO I18N
											{ name: "CollectionTime",	index: "CollectionTime", 	hidden:true,	hidedlg:true}, //NO I18N
											{ name: "appID",			index: "appID", 			hidden:true,	hidedlg:true} //NO I18N
										];
										break;

		case "dpiReportGridDetails": 	colNamesList = ["NFAWidget.App", "nfa.dpi.avgnrt", "nfa.dpi.avgart", "NFAWidget.trfc", "opu.views.PACKETS"]; //NO I18N
										colModelList = [
											{name: "0", index: "0", classes: "pointer"}, //NO I18N
											{name: "1", index: "1", classes: "pointer"}, //NO I18N
											{name: "2", index: "2", classes: "pointer", sorttype: nfa_customSort}, //NO I18N
											{name: "3", index: "3", classes: "pointer"}, //NO I18N
											{name: "4", index: "4", classes: "pointer"} //NO I18N
										];
										break;

		case "dpiConvGridDetails" 	: 	colNamesList = ["NFAWidget.Src", "NFAWidget.Dst", "fwa.report.url", "NFAWidget.App", "pdf.SrcPort", "pdf.DstPort", "NFAWidget.proto", "nfa.dpi.avgnrt", "nfa.dpi.avgart", "NFAWidget.trfc", "opu.views.PACKETS", "webclient.enduser.Connections"]; //NO I18N
										colModelList = [
											{name: "0", index: "0", width: 27,sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "1", index: "1", width: 27,sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "11", index: "11", width: 50}, //NO I18N
											{name: "2", index: "2", width: 25}, //NO I18N
											{name: "3", index: "3", width: 15,sorttype: "int"}, //NO I18N
											{name: "4", index: "4", width: 15,sorttype: "int"}, //NO I18N
											{name: "5", index: "5", width: 17}, //NO I18N
											{name: "6", index: "6", width: 20,sorttype: "int"}, //NO I18N
											{name: "7", index: "7", width: 20,sorttype: "int"}, //NO I18N
											{name: "8", index: "8", width: 20,sorttype: nfa_customSort}, //NO I18N
											{name: "9", index: "9", width: 17,sorttype: "int"}, //NO I18N
											{name: "10", index: "10", width: 20,sorttype: "int"} //NO I18N
										];
										break;

		case "dpiTrafficGridDetails": 	colNamesList = ["NFAWidget.Time", "NFAWidget.trfc"]; //NO I18N
										colModelList = [{name: "0", index: "0"},{name: "1", index: "1", sorttype: nfa_customSort}]; //NO I18N
										break;

		case "dpiDrillDown" 		: 	colNamesList = ["NFAWidget.Src", "NFAWidget.Dst", "fwa.report.url", "NFAWidget.App", "pdf.SrcPort", "pdf.DstPort", "NFAWidget.proto", "nfa.dpi.avgnrt", "nfa.dpi.avgart", "NFAWidget.trfc", "opu.views.PACKETS", "webclient.enduser.Connections"]; //NO I18N
										colModelList = [
											{name: "0", index: "0", width: 30, sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "1", index: "1", width: 30, sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "11", index: "11", width: 50}, //NO I18N
											{name: "2", index: "2", width: 30}, //NO I18N
											{name: "3", index: "3", width: 20, sorttype: "int"}, //NO I18N
											{name: "4", index: "4", width: 20, sorttype: "int"}, //NO I18N
											{name: "5", index: "5", width: 20}, //NO I18N
											{name: "6", index: "6", width: 25, sorttype: "int"}, //NO I18N
											{name: "7", index: "7", width: 25, sorttype: "int"}, //NO I18N
											{name: "8", index: "8", width: 30, sorttype: nfa_customSort}, //NO I18N
											{name: "9", index: "9", width: 20, sorttype: "int"}, //NO I18N
											{name: "10", index: "10", width: 25, sorttype: "int"} //NO I18N
										];
										break;
										
		case "asDrillDown"			: 	colNamesList = ["NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","pdf.SrcPort","pdf.DstPort","nfa.asview.srcas","nfa.asview.dstas","NFAWidget.trfc","opu.views.PACKETS"]; //NO I18N
										colModelList = [
											{name: "sip",		index: "sip",		width:30,	sorttype: "nfa_IPV4Sorting"}, //NO I18N
											{name: "dip",		index: "dip", 		width:30,	sorttype: "nfa_IPV4Sorting"}, //NO I18N
											{name: "appName",	index: "appName",	width:30}, //NO I18N
											{name: "sport",		index: "sport",		width:15,	sorttype: "int"}, //NO I18N
											{name: "dport",		index: "dport",		width:15,	sorttype: "int"}, //NO I18N
											{name: "srcAS",		index: "srcAS",		width:30}, //NO I18N
											{name: "dstAS",		index: "dstAS",		width:30}, //NO I18N
											{name: "volume",	index: "volume",	width:20,	sorttype:nfa_customSort}, //NO I18N
											{name: "packets",	index: "packets",	width:15,	sorttype: "int"} //NO I18N
										];
										break;
										
		case "searchReport": 			colNamesList = ["webclient.settings.devicegrp.routername", "NFAWidget.intfName", "webclient.admin.syslogrules.sourceip", "pdf.DstIP", "NFAWidget.App", "opu.views.PORT", "NFAWidget.proto", "NFAWidget.dscp","nfa.cloud.srccategory","nfa.cloud.dstcategory","nfa.cloud.srcresolvedby","nfa.cloud.dstresolvedby","nfa.asview.srcas", "nfa.asview.dstas", "NFAWidget.trfc", ""]; //NO I18N
										colModelList = [
											{name: "deviceName", 	index: "deviceName",	width: "70"}, //NO I18N
											{name: "interfaceName", index: "interfaceName",	width: "70"}, //NO I18N
											{name: "src", 			index: "src",			width: "70", sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "dst", 			index: "dst",			width: "70", sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "app", 			index: "app",			width: "50"}, //NO I18N
											{name: "srcport", 		index: "srcport",		width: "30", sorttype: "int"}, //NO I18N
											{name: "prot", 			index: "prot",			width: "50"}, //NO I18N
											{name: "dscp", 			index: "dscp",			width: "35"}, //NO I18N
											{name: "srcCategory", 	index: "srcCategory",	width: "70"}, //NO I18N
											{name: "dstCategory", 	index: "dstCategory",	width: "70"}, //NO I18N
											{name: "srcResolvedBy", index: "srcResolvedBy",	width: "70"}, //NO I18N
											{name: "dstResolvedBy",	index: "dstResolvedBy",	width: "70"}, //NO I18N
											{name: "srcASName", 	index: "srcas",			width: "70"}, //NO I18N
											{name: "dstASName", 	index: "dstas",			width: "70"}, //NO I18N
											{name: "traffic", 		index: "traffic",		width: "50", sorttype: nfa_customSort}, //NO I18N
											{name: "id", 			index: "id",			width: "20", sortable: false, search: false} //NO I18N
										];
										break;
										
		case "wlcSearchReport": 		colNamesList = ["webclient.nfa.inventory.controllers", "NFAWidget.CliIP", "webclinet.inventory.wlc.apmacname", "webclinet.inventory.wlc.clientmac", "NFAWidget.App", "NFAWidget.WLSSID", "webclinet.inventory.wlc.predscp", "webclinet.inventory.wlc.postdscp", "NFAWidget.trfc", ""]; //NO I18N
										colModelList = [
											{name: "devName", 	index: "devName", 	width: "30", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "clientip", 	index: "clientip", 	width: "20", sorttype:nfa_IPV4Sorting}, //NO I18N
											{name: "apmac", 	index: "apmac", 	width: "30", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "clientmac", index: "clientmac", width: "30", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "app", 		index: "app", 		width: "20", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "ssid", 		index: "ssid", 		width: "25", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "dscpin", 	index: "dscpin", 	width: "20", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "dscpout", 	index: "dscpout", 	width: "20", formatter:jqGridHTMLEncode}, //NO I18N
											{name: "traffic", 	index: "traffic", 	width: "30", sorttype: nfa_customSort}, //NO I18N
											{name: "id", 		index: "id",		hidden: true, sortable: false, search: false} //NO I18N
										];
										break;
		case "geolocation"			: 	colNamesList = ["opu.views.NAME", "NFAWidget.trfc"]; //NO I18N
										colModelList = [
											{name: "Name", index: "Name"}, //NO I18N
											{name: "volume", index: "volume", sorttype: "nfa_customSort"} //NO I18N
										];
										break;
		case "geolocationSubGrid"	: 	colNamesList = ["NFAWidget.Src", "NFAWidget.Dst", "NFAWidget.App", "showPorts.SourcePort", "showPorts.DestPort", "NFAWidget.proto", "NFAWidget.dscp", "dscpcode", "NFAWidget.trfc"]; //NO I18N
										colModelList = [
											{name: "src", index: "src", sorttype: "nfa_IPV4Sorting"}, //NO I18N
											{name: "dst", index: "dst", sorttype: "nfa_IPV4Sorting"}, //NO I18N
											{name: "app", index: "app"}, //NO I18N
											{name: "port", index: "port", sorttype: "number"}, //NO I18N
											{name: "dstport", index: "dstport", sorttype: "number"}, //NO I18N
											{name: "prot", index: "prot"}, //NO I18N
											{name: "dscp", index: "dscp"}, //NO I18N
											{name: "dscpCode", index: "dscpCode", hidden: true}, //NO I18N
											{name: "traffic", index: "traffic", sorttype: "nfa_customSort"} //NO I18N
										];
										break;
		case "LANWANReport": 			colNamesList = ["NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","opu.views.PORT","NFAWidget.proto","NFAWidget.dscp","nfa.asview.srcas","nfa.asview.dstas","NFAWidget.trfc","","","",""]; //NO I18N
										colModelList = [
											{name: "src", 			index: "src",			width: "70", sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "dst", 			index: "dst",			width: "70", sorttype: nfa_IPV4Sorting}, //NO I18N
											{name: "app", 			index: "app",			width: "50"}, //NO I18N
											{name: "port", 			index: "port",			width: "30", sorttype: "int"}, //NO I18N
											{name: "prot", 			index: "prot",			width: "50"}, //NO I18N
											{name: "dscp", 			index: "dscp",			width: "35"}, //NO I18N
											{name: "srcASName", 	index: "srcASName",		width: "70"}, //NO I18N
											{name: "dstASName", 	index: "dstASName",		width: "70"}, //NO I18N
											{name: "traffic", 		index: "traffic",		width: "50", sorttype: nfa_customSort}, //NO I18N
											{name: "indvTrafficGraph",index:"indvTrafficGraph",formatter:"indvTrafficGraph",classes:"pointer",width:"25",sortable:false,search:false}, //NO I18N
											{name: "dstport", 		index: "dstport",		hidden: true}, //NO I18N
											{name: "dscpCode", 		index: "dscpCode",		hidden: true}, //NO I18N
											{name: "id", 			index: "id",			hidden: true, sortable: false, search: false} //NO I18N
										];
										break;
	case "cloudFlowProfileSubGrid": 	colNamesList = ["NFAWidget.intfName", "jsp.commonstr.Status", "nfa.region.name", "nfa.aws.flowLogID", "", "", "nfa.aws.exportFlowLogs"]; //NO I18N
										colModelList = [
											{name: "interfaceName",		index: "interfaceName"}, //NO I18N
											{name: "status",			index: "status",		width: "40"}, //NO I18N
											{name: "regionName",		index: "regionName",	width: "70"}, //NO I18N
											{name: "flowLogID",			index: "flowLogID",		width: "80",		formatter: function(cellvalue, options, rowObject){ //NO I18N
												return htmlEncode(cellvalue)+" <i id='flowLogID_"+htmlEncode(rowObject.interfaceID)+"' class='pointer icon-configedit' title='"+Ember.I18n.t("nfa.aws.flowLogID.edit")+"' onclick='nfa_cloudFlowProfilesAction(\"updateFlowLogID\",\""+htmlEncode(rowObject.profileID)+"\",\""+htmlEncode(rowObject.interfaceID)+"\",\""+htmlEncode(cellvalue)+"\");'></i>"; //NO I18N
											}},
											{name: "profileID",			index: "profileID",		hidden: true}, //NO I18N
											{name: "interfaceID",		index: "interfaceID",	hidden: true}, //NO I18N
											{name: "exportStatus",		index: "exportStatus",	width: "70",		formatter: function(cellvalue, options, rowObject){ //NO I18N
												var title, checked, action;
												if(cellvalue === "true"){ //NO I18N
													title = Ember.I18n.t("opm.wlc.monitoringState.true"); checked = "checked"; action = "stop"; //NO I18N
												}else{
													title = Ember.I18n.t("opm.wlc.monitoringState.false"); checked = ""; action = "start"; //NO I18N
												}
												return "<div class='chkRoundBtn'><input id='exportStatus_"+htmlEncode(rowObject.interfaceID)+"' type='checkbox' title='"+title+"' onclick='nfa_cloudFlowProfilesAction(\""+action+"\",\""+htmlEncode(rowObject.profileID)+"\",\""+htmlEncode(rowObject.interfaceID)+"\");' "+checked+"><label></label></div>"; //NO I18N
											}}
										];
										break;
		case "trafficSummary"		: 	colNamesList = ["webclient.reports.tags.Category","opu.views.TOTAL","webclient.reports.max","opu.common.MINIMUM","webclient.devices.intftypes.min","webclient.devices.intftypes.min","webclient.availability.datatype.average","traffic.StandardDeviation",Ember.I18n.t("nfa.report.nthPercentail",{n:window.OPM.nfaPercentile})]; //NO I18N
										colModelList = [ 
											{name:"traffic",index:"traffic",align:"center"}, //NO I18N
											{name:"total",	index:"total",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"max",	index:"max",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"maxHR",	index:"maxHR",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"min",	index:"min",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"minHR",	index:"minHR",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"avg",	index:"avg",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"std",	index:"std",	align:"center", sorttype:nfa_customSort}, //NO I18N
											{name:"95th",	index:"95th",	align:"center", sorttype:nfa_customSort} //NO I18N
										];
										break;
		case "nfaConsReportConvList": 	colNamesList = ["NFAWidget.Src","NFAWidget.Dst","NFAWidget.App","pdf.SrcPort","pdf.DstPort","NFAWidget.proto","NFAWidget.dscp","nfa.asview.srcas","nfa.asview.dstas","NFAWidget.trfc"]; //NO I18N
										colModelList = [
											{name:"0", index:"0", width:"70", sorttype:nfa_IPV4Sorting}, //NO I18N
											{name:"1", index:"1", width:"70", sorttype:nfa_IPV4Sorting}, //NO I18N
											{name:"2", index:"2", width:"50"}, //NO I18N
											{name:"3", index:"3", width:"30", sorttype:"number"}, //NO I18N
											{name:"4", index:"4", width:"30", sorttype:"number"}, //NO I18N
											{name:"5", index:"5", width:"50"}, //NO I18N
											{name:"6", index:"6", width:"35"}, //NO I18N
											{name:"7", index:"7", width:"70", hidden:false}, //NO I18N
											{name:"8", index:"8", width:"70", hidden:false}, //NO I18N
											{name:"9", index:"9", width:"50", sorttype: nfa_customSort} //NO I18N
										];
										break;
		case "wlcConsReportConvList": 	colNamesList = ["NFAWidget.CliIP", "webclinet.inventory.wlc.apmacname", "webclinet.inventory.wlc.clientmac", "NFAWidget.App", "NFAWidget.WLSSID", "webclinet.inventory.wlc.predscp", "webclinet.inventory.wlc.postdscp", "NFAWidget.trfc"]; //NO I18N
										colModelList = [
											{name:"0", index:"0", sorttype:nfa_IPV4Sorting}, //NO I18N
											{name:"1", index:"1"}, //NO I18N
											{name:"2", index:"2"}, //NO I18N
											{name:"3", index:"3"}, //NO I18N
											{name:"4", index:"4"}, //NO I18N
											{name:"5", index:"5"}, //NO I18N
											{name:"6", index:"6"}, //NO I18N
											{name:"7", index:"7", sorttype:nfa_customSort} //NO I18N
										];
										break;
		case "attacksEventList": 		colNamesList = ["","","NFAWidget.problem","NFAWidget.Offenders","webclient.nba.routedviacnt","NFAWidget.targets","NFAWidget.Time","webclient.fwa.hits","webclient.alarm.severity","jsp.commonstr.Status","","","","",""]; //NO I18N
										colModelList = [
											{ name:"evid",			index:"evid",			hidden:true},  //NO I18N
											{ name:"AlgorithmType",	index:"AlgorithmType",	classes:"pointer",	width:10,	sortable:false,	search:false,	formatter:nfa_attacksAlgorithmTypeFormatter}, //NO I18N
											{ name:"Problem",		index:"Problem",		classes:"pointer",	width:40,	sorttype:"string"}, //NO I18N
											{ name:"OffendersCnt",	index:"OffendersCnt",	classes:"pointer",	width:30,	sorttype:"number"}, //NO I18N
											{ name:"RoutedViaCnt",	index:"RoutedViaCnt",	classes:"pointer",	width:20,	sorttype:"number"}, //NO I18N
											{ name:"TargetsCnt",	index:"TargetsCnt",		classes:"pointer",	width:30,	sorttype:"number"}, //NO I18N
											{ name:"GenTime",		index:"GenTime",		classes:"pointer",	width:30}, //NO I18N
											{ name:"Hits",			index:"Hits",			classes:"pointer",	width:20,	sorttype:"number"}, //NO I18N
											{ name:"Severity",		index:"Severity",		classes:"pointer",	width:20,	sorttype:"string"}, //NO I18N
											{ name:"Status",		index:"Status",			classes:"pointer",	width:20,	sorttype:"string"}, //NO I18N
											{ name:"AlgorithmId",	index:"AlgorithmId",	hidden:true}, //NO I18N
											{ name:"ProblemId",		index:"ProblemId",		hidden:true}, //NO I18N
											{ name:"streamid",		index:"streamid",		hidden:true}, //NO I18N
											{ name:"resource",		index:"resource",		hidden:true}, //NO I18N
											{ name:"BaseProblem",	index:"BaseProblem",	hidden:true} //NO I18N
										];
										break;
		case "NetworkSpeedReport": 		colNamesList = ["NFAWidget.Time","webclient.skin.upload","webclient.billing.download","webclient.Upload.Volume","webclient.Download.Volume","nfa.report.jitterms","webclient.opm.networkpath.threshold.latency"]; //NO I18N
										colModelList = [
											{name:"time",		index:"time",		sorttype:"time"}, //NO I18N
											{name:"upload",		index:"upload",		sorttype:nfa_customSort}, //NO I18N
											{name:"download",	index:"download",	sorttype:nfa_customSort}, //NO I18N
											{name:"uploadVol",	index:"uploadVol",	sorttype:nfa_customSort}, //NO I18N
											{name:"downloadVol",index:"downloadVol",sorttype:nfa_customSort}, //NO I18N
											{name:"jitter",		index:"jitter",		sorttype:"number"}, //NO I18N
											{name:"latency",	index:"latency",	sorttype:"number"} //NO I18N
										];
										break;
		case "NetworkSpeedSummary": 	colNamesList = ["webclient.reports.tags.Category","nfa.src.minSpeed","opstor.inventory.maxspeed","nfa.AverageSpeed"]; //NO I18N
										colModelList = [
											{name:"traffic",index:"traffic",align:"center"}, //NO I18N
											{name:"min",	index:"min",	align:"center"}, //NO I18N
											{name:"max",	index:"max",	align:"center"}, //NO I18N
											{name:"avg",	index:"avg",	align:"center"} //NO I18N
										];
										break;
		case "tpAnalysisReport":		colNamesList = ["","nfa.anamoly.time","widget.name.rttraf","Threshold.Lower_Limit","Threshold.Upper_Limit","webclient.reports.showgraph"]; //NO I18N
										colModelList = [
											{name:"0", index:"0", hidden:true}, //NO I18N
											{name:"1", index:"1", sorttype:"date",datefmt:"M-d-y H:i"}, //NO I18N
											{name:"2", index:"2", sorttype:nfa_customSort}, //NO I18N
											{name:"3", index:"3", sorttype:nfa_customSort}, //NO I18N
											{name:"4", index:"4", sorttype:nfa_customSort}, //NO I18N
											{name:"indvTrafficGraph",index:"indvTrafficGraph",formatter:indvTrafficGraph,classes:"pointer",width:"50",sortable:false,search:false} //NO I18N
										];
										break;
		case "nfaAlertConvTable":       colNamesList = [Ember.I18n.t("NFAWidget.Src"),Ember.I18n.t("NFAWidget.Dst"),Ember.I18n.t("NFAWidget.App"),Ember.I18n.t("pdf.SrcPort"),Ember.I18n.t("pdf.DstPort"),Ember.I18n.t("NFAWidget.dscp"),Ember.I18n.t("NFAWidget.trfc")]; //NO I18N
										colModelList = [
											{name:"src",		index:"src",sorttype:nfa_IPV4Sorting}, //NO I18N
											{name:"dst",		index:"dst",sorttype:nfa_IPV4Sorting}, //NO I18N
											{name:"app",		index:"app",	sortable:true, sorttype:"text"}, //NO I18N
											{name:"srcport",index:"srcport",sorttype:"int"},//NO I18N
											{name:"dstport",index:"dstport",sorttype:"int"},//NO I18N
											{name:"dscp",		index:"dscp",	sortable:true, sorttype:"text"}, //NO I18N
											{name:"traffic",	index:"traffic",sortable:true, sorttype:nfa_customSort} //NO I18N
										];
										break;
		case "nfaWlcAlertConvTable":    colNamesList = ['NFAWidget.CliIP','webclinet.inventory.wlc.clientmac','webclient.Application','webclient.reports.SSID','webclient.reports.PreDSCP','webclient.reports.PostDSCP','NFAWidget.trfc','opu.views.PACKETS'];//No I18N
										colModelList = [
											{ name: 'clientip', index: 'clientip', sorttype:nfa_IPV4Sorting}, //No I18N
											{ name: 'clientmac', index: 'clientmac', classes:"pointer"}, //No I18N
											{ name: 'app', index: 'app', formatter:jqGridHTMLEncode}, //No I18N
											{ name: 'ssid', index: 'ssid', formatter:jqGridHTMLEncode}, //No I18N
											{ name: 'dscpin', index: 'dscpin', formatter:jqGridHTMLEncode}, //No I18N
											{ name: 'dscpout', index: 'dscpout', formatter:jqGridHTMLEncode}, //No I18N
											{ name: 'traffic', index: 'traffic', sorttype: nfa_customSort}, //No I18N
											{ name: 'pkts', index: 'pkts', sorttype: 'number'} //No I18N
										];
										break;
		case "nfassidgrpAlertConvTable":colNamesList = ['NFAWidget.CliIP','webclinet.inventory.wlc.apmacname','webclinet.inventory.wlc.clientmac','NFAWidget.App','NFAWidget.WLSSID','webclinet.inventory.wlc.predscp','webclinet.inventory.wlc.postdscp','NFAWidget.trfc']; //No I18N
										colModelList = [ 
											{name:'0', index:'0', sorttype:'nfa_IPV4Sorting'}, //No I18N
											{name:'1', index:'1'},  //No I18N
											{name:'2', index:'2'},  //No I18N
											{name:'3', index:'3'},  //No I18N
											{name:'4', index:'4'},  //No I18N
											{name:'5', index:'5'},  //No I18N
											{name:'6', index:'6'},  //No I18N
											{name:'7', index:'7', sorttype:'nfa_customSort'} //No I18N
										];
										break;
		case "dnsThirdLevel":			colNamesList = ["NFAWidget.CliIP", "webclient.Server.IP", "webclient.dns.query", "webclient.query.type", "nfa.dpi.responsetime", "webclient.opm.settings.monitoring.urlmonitor.resp.code", "webclient.query.timestamp", ""]; //NO I18N
										colModelList = [{name: "0", index: "0"}, {name: "1", index: "1"}, {name: "2", index: "2"}, {name: "3", index: "3"}, {name: "4", index: "4", sorttype:"int"}, {name: "5", index: "5"}, {name: "6", index: "6", sorttype: function(cellValue, rowObject) {return parseInt(rowObject["7"])}}, {name: "7", index: "7", hidden: true}]; //NO I18N
										break;
		case "dhcpThirdLevel":			colNamesList = ["webclinet.inventory.wlc.clientmac", "webclient.client.hostname", "webclient.requested.ip", "webclient.assigned.ip", "webclient.dhcp.server.ip", "webclient.request.count", "webclient.transaction.time", ""]; //NO I18N
										colModelList = [{name: "0", index: "0"}, {name: "1", index: "1"}, {name: "2", index: "2"}, {name: "3", index: "3"}, {name: "4", index: "4"}, {name: "5", index: "5", sorttype:"int"}, {name: "6", index: "6", sorttype: function(cellValue, rowObject) {return parseInt(rowObject["7"])}}, {name: "7", index: "7", hidden: true}]; //NO I18N
										break;
	}
	return validateGridColumnDetails(colModelList,colNamesList);
}
