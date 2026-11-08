//$Id$
window.OPM.alarmListForNextPrev;
window.OPM.deviceListForNextPrev;
window.OPM.shortSummaryIndex=0;
var lastTenUsers=new Array(5);
var lastTenUsersIndex=0;
var topAPS=[];
var lastUser='';

var colorScale={'ParentDown':'availabilityStatus_6', //No I18N
			'OnHold':'availabilityStatus_4', //No I18N
			'OnMaintenance':'availabilityStatus_2', //No I18N
		'DownTime':'availabilityStatus_5', //No I18N
		'DependentUnavailable':'availabilityStatus_3', //No I18N
		'UP':'availabilityStatus_1', // No I18N
		'Not Monitored':'availabilityStatus_7'}; //No I18N
var statusColors = [faultSeverityColorCodes["critical"],faultSeverityColorCodes["trouble"],faultSeverityColorCodes["attention"],faultSeverityColorCodes["servicedown"],faultSeverityColorCodes["clear"],faultSeverityColorCodes["info"],faultSeverityColorCodes["unmanaged"],faultSeverityColorCodes["notmonitored"]];
var availColors = ['#77d283','#afafaf','#ffee00','#ffc0cb','#f47272','#5DA5DA','#9E4B4B','#FFC10F','#746ECF','#A957C0','#716398','#A3AFC7'];//No I18N
var availTopNColors = [ "#a2d2ff","#f6d55c","#7a5195","#f4a261","#2a9d8f","#3fc1c9","#f77f00","#e9c46a","#6a994e","#264653","#8c2f39","#9b5de5","#665191","#d45087","#ff6b6b","#f28500","#4ecdc4","#c0c0c0","#4f4f4f","#4682b4","#008b8b","#e63946","#dda15e","#003f5c"]//No I18N

var availDistColors = ['#77d283','#46bb7d','#ffc0cb','#ffee00','#faad5a','#fa5b5a','#5DA5DA'];//No I18N
var averageAvailColors = ['#77d283','#fa5b5a','#5DA5DA'];//No I18N
var wanRttThresholdViol = ['#77d283','#fa5b5a','#5DA5DA','#e89d06'];//No I18N
var availabiltyStatusColors = ['#46bb7d','#fa5b5a','#e8de65','#ffc0cb','#7f7f7f','#5DA5DA'];//No I18N
var availabiltyStateColors = ['#46bb7d','#fa5b5a','#7f7f7f','#7f7f7f','#7f7f7f','#7f7f7f'];//No I18N

var categoryColors = ["#327FB2","#3992CC","#40A4E6","#47B6FF","#59BDFF","#6CC5FF","#7ECCFF","#91D3FF","#A3DAFF","#B5E2FF","#C8E9FF","#DAF0FF","#EDF8FF"];//No I18N //"#0E2433","#15374C",//No I18N

var bv_availColors = ['#46bb7d','#268633','#EF87CD','#ffee00','#F4B172','#fa5b5a','#31A5F0'];//No I18N
var ipamSeverityColors = ['#fa5b5a','#46bb7d','#faad5a','#3099D0','#faad5a'];//No I18N
var ipamSeverityColors1 = ['#fa5b5a','#faad5a','#46bb7d','#3099D0','#46bb7d'];//No I18N
var severityColors = ['#fa5b5a','#faad5a','#e8de65','#ac4cab','#46bb7d','#7f7f7f','#7f7f7f'];//No I18N
var storageSeverityColors = ['#46bb7d','#fa5b5a','#faad5a'];//No I18N
var severityAsTxt = ['Critical','Trouble','Attention','Service Down','Clear','Info','Unknown'];//No I18N
var severityAsI18NTxt = [Ember.I18n.t("webclient.admin.alarmesc.critical",this),Ember.I18n.t("webclient.admin.alarmesc.trouble",this),Ember.I18n.t("webclient.admin.alarmesc.attention",this),Ember.I18n.t("webclient.admin.alarmesc.servicedown",this),Ember.I18n.t("webclient.map.view.clear",this),Ember.I18n.t("webclient.admin.alarmesc.info",this),Ember.I18n.t("webclient.map.flash.Unknown",this),Ember.I18n.t('webclient.device.status.notmonitored',this)];//No I18N
var interfaceMainFilter = ['Critical','Trouble','Attention','Service Down','Clear','Unknown','Interfaces'];//No I18N
var interfaceI18NMainFilter = [Ember.I18n.t("webclient.admin.alarmesc.critical",this),Ember.I18n.t("webclient.admin.alarmesc.trouble",this),Ember.I18n.t("webclient.admin.alarmesc.attention",this),Ember.I18n.t("webclient.admin.alarmesc.servicedown",this),Ember.I18n.t("webclient.map.view.clear",this),Ember.I18n.t("webclient.map.flash.Unknown",this),Ember.I18n.t("webclient.devices.details.intf",this)];//No I18N
var severityNumColor = {'1':faultSeverityColorCodes["critical"],'2':faultSeverityColorCodes["trouble"],'3':faultSeverityColorCodes["attention"],'4':faultSeverityColorCodes["servicedown"],'5':faultSeverityColorCodes["clear"],'6':faultSeverityColorCodes["info"],'7':faultSeverityColorCodes["unmanaged"]};//No I18N
var severityTxtColor = {'Critical':faultSeverityColorCodes["critical"],'Trouble':faultSeverityColorCodes["trouble"],'Attention':faultSeverityColorCodes["attention"],'Service Down':faultSeverityColorCodes["servicedown"],'Clear':faultSeverityColorCodes["clear"],'Unknown':faultSeverityColorCodes["unmanaged"],'UnManaged':faultSeverityColorCodes["unmanaged"],'Device Not Monitored':faultSeverityColorCodes["notmonitored"]};//No I18N
var statusAsTxt = [Ember.I18n.t("webclient.admin.alarmesc.critical",this),Ember.I18n.t("webclient.admin.alarmesc.trouble",this),Ember.I18n.t("webclient.admin.alarmesc.attention",this),Ember.I18n.t("webclient.admin.alarmesc.servicedown",this),Ember.I18n.t("webclient.map.view.clear",this),Ember.I18n.t("webclient.admin.alarmesc.info",this),Ember.I18n.t("webclient.map.view.unmanaged",this)];  //No I18n
var nfaStatusAsTxt = [Ember.I18n.t("webclient.common.widgets.critical",this) , Ember.I18n.t("webclient.common.major",this) , Ember.I18n.t("webclient.general.warning",this) ];  //No I18n
var oputilsStatusAsTxt = [Ember.I18n.t("opu.views.AVAILABLE",this),Ember.I18n.t("opu.views.TRANSIENT",this),'','',Ember.I18n.t("opu.views.USED",this),''];  //No I18n
var oputilsPolorChartFiter = ['Above 80%','20% - 80%','','','Below 20%'];//No I18N 
var oputilsAvailabilityChartFilter = [Ember.I18n.t("opu.views.USED",this),Ember.I18n.t("opu.views.TRANSIENT",this),'',Ember.I18n.t('opu.ping.NOT_SCANNED',this),Ember.I18n.t("opu.views.AVAILABLE",this)];//No I18N
var oputilsBwmStatusColor = ['#46bb7d','#fa5b5a','#46bb7d','#46bb7d','#46bb7d','#46bb7d']; //No I18N
var oputilsWOLStatusColor = ['#fa5b5a','#46bb7d'];//No I18N
var deviceStatusSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"2":Ember.I18n.t('webclient.admin.threshold.Trouble',this),"3":Ember.I18n.t('webclient.admin.threshold.Attention',this),"4":Ember.I18n.t('webclient.admin.alarmesc.servicedown',this),"5":Ember.I18n.t('webclient.map.view.clear',this),"7":Ember.I18n.t('webclient.map.view.unmanaged',this),"8":Ember.I18n.t('webclient.device.status.notmonitored',this)}; //No I18n
var intfStatusSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"2":Ember.I18n.t('webclient.admin.threshold.Trouble',this),"3":Ember.I18n.t('webclient.admin.threshold.Attention',this),"5":Ember.I18n.t('webclient.map.view.clear',this),"7":Ember.I18n.t('webclient.map.view.unmanaged',this)}; //No I18n
var groupTypeSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"Device":Ember.I18n.t('Device',this),"Interface":Ember.I18n.t('widget.typename.nfainterface',this),"Group":Ember.I18n.t('webclient.opm.group',this),"IPSLA":Ember.I18n.t('webclient.IPSLA',this)}; //No I18n
var alarmProfileStatusSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"2":Ember.I18n.t('webclient.admin.threshold.Trouble',this),"3":Ember.I18n.t('webclient.admin.threshold.Attention',this),"5":Ember.I18n.t('webclient.map.view.clear',this)}; //No I18n
var alarmProfileStateSearch = {"":Ember.I18n.t('opu.common.ALL',this),"true":Ember.I18n.t('jsp.commonstr.Enabled',this),"false":Ember.I18n.t('jsp.commonstr.Disabled',this)}; //No I18n
var defaultKempGraphs = ["KempLBTotalTPS","KempLBSSLTPS","KempVSTotalConns","KempVSInPackets","KempVSOutPackets","KempVSInBytes","KempVSOutBytes","KempRSTotalConns","KempRSInPackets","KempRSOutPackets","KempRSInBytes","KempRSOutBytes","KemprSActiveConns","KempvSActiveConns","KempUCD5MinAvgCPUUtilization","KempUCDMemoryUtilization","SysUpTime"];//No I18n
var defaultF5Graphs = ["F5LBSSLTPS","SysUpTime","F5LBThroughputIn","F5LBThroughputOut","F5LBServerActiveConnections","F5LBServerTotalConnections","F5LBSSLServerActiveConnections","F5LBSSLClientActiveConnections","sysStatClientCurConns","F5LBClientTotalConnections","F5VSActiveConns","F5VSTotalConns","F5VSInBytes","F5VSOutBytes","F5VSInPackets","F5VSOutPackets","F5PoolMemberActiveConns","F5PoolMemberTotalConns","F5PoolMemberInBytes","F5PoolMemberOutBytes","F5PoolMemberInPackets","F5PoolMemberOutPackets","F5LBServerPacketsOut","F5LBServerPacketsIn","F5LBClientPacketsIn","F5LBClientPacketsOut"];//No I18n
var hideBlinkIcon = [];
var showBlinkIcon = [];
var faultSeverity = ['critical','trouble','attention','servicedown','clear','info','unmanaged'];//No I18N
var faultIconUrls = ["status-1", "status-2", "status-3", "status-4", "status-5", "status-6", "status-7"]; // No I18N
var severityColorsNFA = {'1':'#fa5b5a','2':'#faad5a','3':'#e8de65','4':'#ac4cab','5':'#46bb7d','6':'#7f7f7f','7':'#7f7f7f'};//No I18N
var wanIPStatusSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"2":Ember.I18n.t('webclient.admin.threshold.Trouble',this),"3":Ember.I18n.t('webclient.admin.threshold.Attention',this),"5":Ember.I18n.t('webclient.map.view.clear',this),"7":Ember.I18n.t('webclient.map.view.unmanaged',this)}; //No I18n

var ziaBotActions = ["device_details","devicedetails_summary","devicedetails_alarmdetails","devicedetails_getavailability","devicedetails_gethealthsummary","alarm_details","RecentTenAlarms","ViewTop10ProblematicDevices","ViewAlarmSeverityBasedSummary","getDeviceComplianceSummary","getRecentDownDevices","getRecentDiscoveredDevices","device_actions","deviceactions_pingdevice","deviceactions_getTraceRoute","deviceactions_suppressAlarms","alarm_actions","alarmactions_acknowledgeAlarms","alarmactions_UnacknowledgeAlarms","alarmactions_clearAlarms","dashboard_actions","createDashboard","copyDashboard","report_summary"];//No I18N
var merakiStatusSearch={"0":Ember.I18n.t('opu.common.ALL',this),"dormant":Ember.I18n.t('webclient.Dormant',this),"online":Ember.I18n.t('opstor.inventory.online',this),"alerting":Ember.I18n.t('webclient.opm.meraki.status.alerting',this),"offline":Ember.I18n.t('opm.printer.state.offline',this)};
var suppressAlarmRuleEngine = ["SUPPRESSPROCESSMONITOR","SUPPRESSSCRIPTMONITOR","SUPPRESSEVENTLOGMONITOR","SUPPRESSPERFORMANCEMONITOR","SUPPRESSMSSQLMONITOR","SUPPRESSADMONITOR","SUPPRESSEXCHANGEMONITOR","SUPPRESSSERVICEMONITOR","SUPPRESSNTSERVICEMONITOR","SUPPRESSMSSQLSERVICEMONITOR","SUPPRESSADSERVICEMONITOR","SUPPRESSEXCHANGESERVICEMONITOR","SUPPRESSFILEMONITOR","SUPPRESSFOLDERMONITOR","SUPPRESSURLMONITOR","SUPPRESSSYSLOGS","SUPPRESSTRAPS","SUPPRESSEVENTTYPES","SUPPRESSSENSOR","SUPPRESSSENSORTYPE"]; //No I18N
var suppressAlarmDTS = ["PROCESS","EVENTLOG","SERVICE","NTSERVICE","MSSQL_SERVICE","AD_SERVICE","EXCHANGE_SERVICE","MSSQL","AD","EXCHANGE","FILE","FOLDER","DEVICE_SPECIFIC_URL","PERFORMANCE","SCRIPT","SYSLOG","TRAP","POOL_MEMBER","F5_VIRTUAL_SERVER","KEMP_VIRTUAL_SERVICES","REAL_SERVER"]; //No I18N
var suppressActionType = {PROCESS:19, SCRIPT:20, EVENTLOG:21, PERFORMANCE:22, MSSQL:23, AD:24, EXCHANGE:25, SERVICE:26, NTSERVICE:27, MSSQL_SERVICE:28, AD_SERVICE:29, EXCHANGE_SERVICE:30, FILE:31, FOLDER:32, DEVICE_SPECIFIC_URL:33, SYSLOG:34, TRAP:35, POOL_MEMBER:40, F5_VIRTUAL_SERVER:41, REAL_SERVER:42, KEMP_VIRTUAL_SERVICES:43};
var eventTypesForSuppression = [
  "Agent Down","AlarmProfile","AP Removed","Aruba SDWAN","BGP Flap","BGP Peer State Change","Cisco SDWAN","Credential Migration","Credential Test","Device Decommission","Eventlog Alarm","F5 Pool Member Availability Change","F5 Pool Member Enabled Change","F5 Virtual Server Availability Change","F5 Virtual Server Enabled Change","FCSwitch Port Status Change","FCSwitch Status Change", //No I18n
  "Kemp Real Server Exceeded","Kemp Real Server State Change","Kemp Virtual Service Exceeded","Kemp Virtual Service State Change","Meraki Network Decommission","New AP Added","Printer Health","SDWAN Interface State Change","SDWAN Site State Change","SDWAN Tunnel State Change","Stack Switch Number Change","Stack Switch Role Change","Stack Switch State Change","Storage Array Status Change", //No I18n
  "Storage Disk Status Change","Syslog Alarm","TapeLibrary Status Change","Trap","UCS Health Alarm","UPS Battery Health","VMware Discovery","VMware Host Events","VMware NIC Status","VMware SAN Disk Status","VMware Storage Adapter Status","VMware VM Events","Xen Discovery" //No I18n
];
var minMx_blinkColors = [
	'#00c6e4', //No I18N
	'#faa43a' //No I18N
	//'#faa43a', //No I18N
	//'#5da5da', //No I18N
	//'#60bd68', //No I18N
	//'#b2912f', //No I18N
]
var npSeverityColor=[faultSeverityColorCodes["critical"],faultSeverityColorCodes["trouble"],faultSeverityColorCodes["attention"]];//No I18N
var networkPathStatusList = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"2":Ember.I18n.t('webclient.admin.threshold.Trouble',this),"3":Ember.I18n.t('webclient.admin.threshold.Attention',this),"5":Ember.I18n.t('webclient.map.view.clear',this),"7":Ember.I18n.t('webclient.map.view.unmanaged',this)}; //No I18n
var severityI18NTxtNew = [Ember.I18n.t("webclient.admin.alarmesc.critical",this),Ember.I18n.t("webclient.admin.alarmesc.trouble",this),Ember.I18n.t("webclient.admin.alarmesc.attention",this),Ember.I18n.t("webclient.admin.alarmesc.servicedown",this),Ember.I18n.t("webclient.map.view.clear",this),Ember.I18n.t("webclient.admin.alarmesc.info",this),Ember.I18n.t("webclient.map.flash.Unmanaged",this),Ember.I18n.t('webclient.device.status.notmonitored',this)];//No I18N
var ipslaStatusSearch = {"0":Ember.I18n.t('opu.common.ALL',this),"1":Ember.I18n.t('webclient.admin.threshold.Critical',this),"5":Ember.I18n.t('webclient.map.view.clear',this),"7":Ember.I18n.t('webclient.map.flash.Unknown',this)}; //No I18n
var availabilityState = {"0":Ember.I18n.t("opu.common.ALL",this),"1":Ember.I18n.t("webclient.devices.intftypes.up",this),"2":Ember.I18n.t("webclient.devices.intftypes.down",this),"3":Ember.I18n.t("webclient.availreport.seriesnames.dependunavail",this),"4":Ember.I18n.t("webclient.availreport.seriesnames.onhold",this),"5":Ember.I18n.t("webclient.availreport.seriesnames.onmaint",this)}; //No I18N
OPMClient.RemoteCollectorDownloadUtil = {
	windowsDownloadUrl: 'https://archives.manageengine.com/remote-collector/3003/ManageEngine_RemoteCollector_64bit.exe', //NO I18N
	linuxDownloadUrl: 'https://archives.manageengine.com/remote-collector/3003/ManageEngine_RemoteCollector_64bit.bin' //NO I18N
}; 

Object.keys = Object.keys || function(o) {
    var result = [];
    for(var name in o) {
        if (o.hasOwnProperty(name))
         { result.push(name);  }
    }
    return result;
};

jQuery.expr[":"].contains = function (a, i, m) {
	return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};

function opudiffOnlyAjax(url,callback){
	$.ajax(
	{
		type: 'GET',    //No I18N
	    dataType:'json',    //No I18N
	    url: url,
	    async:false,
	    beforeSend: function(XMLHttpRequest,settings)
	    {
	        uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.map.flash.Loading',this));//No I18N
	    },
	    success: function(jsonData)
	    {
	        $("#"+uniqueId).remove();
	        OPMClient.InventoryOpUtilsController.set("configDiffJSONData", jsonData);//No I18N
	        if(jsonData.status != null && jsonData.status === "Failure") {
	            opm_infoMsgs("errorMsg",jsonData.message);//NO I18N
	            setTimeout(function(){window.history.back();}, 4000);
	            return;
	        }else{
	        	callback(jsonData);
	        }
	    }
	});
}

function opm_ajaxPostRequest(postUrl,postData)
{
	if(window.OPM.isNCM && OPMClient.ApplicationController.isDemoUser) {
		return;
	}
/*	if(showLoading)
	{
		opm_showLoadingTextOnReq(true);
	}*/
	var done = "";//false;
	$.ajax(
	{
		url: postUrl,
		data: postData, //No I18N
		type: 'POST', //No I18N
		async:false,
		dataType: 'json', //No I18n
		beforeSend: function(XMLHttpRequest,settings) {
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			done = response;
			/*if(showLoading)
			{
				opm_showLoadingTextOnReq(false);
			}
			done = opm_showResponseMessage(response);*/
		}
	});
	return done;
}

function opm_ajaxPostRequestWithMsg(postUrl, postData, msg, callback,self){

	if(window.OPM.isNCM && OPMClient.ApplicationController.isDemoUser) {
		return;
	}
	var currentFunctionName = arguments.callee.name;
	var uniqueId = '';//No I18N
	$.ajax({
		url: postUrl,
		data: postData,
		type: 'POST',//No I18N
		async: true,//No I18N
		dataType: 'json', //No I18n
		self:self,
		beforeSend: function(XMLHttpRequest,settings){
			if(msg !== '')
			{
				uniqueId = opm_infoMsgs("infoMsg",msg);//No I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response){
			setTimeout(function(){
			$("#"+uniqueId).remove();
			if(window.OPM.isRMMCentral) {
				window.MESSAGE_HANDLER.postMessage({name: 'close_message_banner_from_opm', message: null}, 'selfcast'); //No I18n
			}
		},1000);
			if(response !== undefined && callback !== undefined){
				if(callback.callback != undefined) {
					isOtpValidationRequired(response, currentFunctionName, postUrl, postData, callback, msg);
				} else if(OPMClient.ApplicationController.isDemoUser && response.error !== undefined && response.error.message !== undefined) {
					opm_infoMsgs('errorMsg',response.error.message); //No I18N
				} else {
					callback(response);
				}
			}
		}
	});
}

function opm_ajaxDownloadFileWithMsg(downloadUrl, postData, msg, callback) {
	var uniqueId = ''; //No I18N
	$.ajax({
		url: downloadUrl,
		data: postData,
		type: 'POST', //No I18N
		async: true,
		xhrFields: { responseType: 'blob' }, //No I18N
		beforeSend: function (XMLHttpRequest, settings) {
			if (msg) {
				uniqueId = opm_infoMsgs("infoMsg", msg); //No I18N
			}
			appendCollectorDetails(XMLHttpRequest, settings);
			appendFWACollectorDetails(XMLHttpRequest, settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function (blob, _, xhr) {
			$("#" + uniqueId).remove();
			var disposition = xhr.getResponseHeader('Content-Disposition'); //No I18N
			var filename = 'download.zip';//No I18N
			if (disposition) {
				var matches = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
				if (matches && matches[1]) {
					filename = matches[1].replace(/['"]/g, '');
				}
			}

			if (window.navigator.msSaveBlob) {
				window.navigator.msSaveBlob(blob, filename);
			} else {
				var downloadUrl = URL.createObjectURL(blob);
				var a = document.createElement("a");
				a.href = downloadUrl;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				URL.revokeObjectURL(downloadUrl); // Cleanup
			}

			if (callback) callback(blob);
		}
	});
}

function defCallBackFunction(response)
{
	if(response.result !== undefined)
	{
    	var message = response.result.message;
    	opm_infoMsgs("successMsg",message); //No I18N
    }
    else if(response.error !== undefined)
    {
    	opm_infoMsgs("errorMsg",response.error.message); //No I18N
    }
}
function opm_ajaxPostRequestWithClbk(postUrl, postData, msg, callback){
	var uniqueId = '';//No I18N
	$.ajax({
		url: postUrl,
		data: postData,
		type: 'POST',//No I18N
		async: true,//No I18N
		cache:false,
		processData:false,
		contentType:false,
		beforeSend: function(XMLHttpRequest,settings) {
			if(msg !== '')
			{
				uniqueId = opm_infoMsgs("infoMsg",msg);//No I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response){
			$("#"+uniqueId).remove();
			if(response !== undefined){
				callback(response);
			}
		}
	});
}
function fileDownloadUsingMultiPostBlob(url, postParams, infoMsg) {
	$.ajax({
		url: url,
		type: "POST",//NO I18N
		data: postParams,
		cache:false,
		processData:false,
		contentType:false,
		mimeType: "multipart/form-data", //No I18N
		xhrFields: {// to avoid binary data being mangled on charset conversion
			responseType: 'blob' //NO I18N 
		},
		success: function(blob, status, xhr) {
			// check for a filename
			var filename = "";
			var disposition = xhr.getResponseHeader('Content-Disposition');//NO I18N
			if (disposition && disposition.indexOf('attachment') !== -1) {
				var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				var matches = filenameRegex.exec(disposition);
				if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
			}
			if(infoMsg) {
				$("#"+infoMsg).remove();
			}
			if (typeof window.navigator.msSaveBlob !== 'undefined') {
				window.navigator.msSaveBlob(blob, filename);
			} else {
				var URL = window.URL || window.webkitURL;
				var downloadUrl = URL.createObjectURL(blob);
	
				if (filename) {
					var a = document.createElement("a");
					if (typeof a.download === 'undefined') {
						window.location.href = downloadUrl;
					} else {
						a.href = downloadUrl;
						a.download = filename;
						document.body.appendChild(a);
						a.click();
					}
				} else {
					window.location.href = downloadUrl;
				}
				setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
			}
		}
	});
}
function opu_multipartAjaxPostRequestWithClbk(postUrl, postData, msg, callback, timeoutMs, timeoutCallback){
	var uniqueId = '';//No I18N
	$.ajax({
		url: postUrl,
		data: postData,
		type: 'POST',//No I18N
		async: true,
		cache:false,
		processData:false,
		contentType:false,
		mimeType: "multipart/form-data", //No I18N
		timeout: timeoutMs ? timeoutMs : 0,
		beforeSend: function(XMLHttpRequest,settings) {
			if(msg !== '')
			{
				uniqueId = opm_infoMsgs("infoMsg",msg);//No I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response){
			$("#"+uniqueId).remove();
			if(response !== undefined){
				callback(response);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$("#"+uniqueId).remove();
			if (typeof timeoutCallback === 'function') {
				timeoutCallback(textStatus, errorThrown);
			}
		}
	});
}
function opm_ajaxPostRequestWithOutAsync(postUrl,postData)
{
	var done = false;
	$.ajax(
	{
		url: postUrl,
		data: postData, //No I18N
		type: 'POST', //No I18N
		//async:false,
		beforeSend: function(XMLHttpRequest,settings) {
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			done = response; //opm_showResponseMessage(response);
		}
	});
	return done;
}

function opm_ajaxPostMethod(postUrl,postData, otpDetails)
{
	if(window.OPM.isNCM && OPMClient.ApplicationController.isDemoUser) {
		return;
	}
	var res = "";
	var currentFunctionName = arguments.callee.name;
	$.ajax(
	{
		url: postUrl,
		data: postData, //No I18N
		type: 'POST', //No I18N
		async:false,
		beforeSend: function(XMLHttpRequest,settings) {
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			res = response;
			isOtpValidationRequired(res, currentFunctionName, postUrl, postData, otpDetails);
		}
	});
	return res;
}

function opm_ajaxGetResponse(url,data)
{
	var toRet = {};
	$.ajax(
	{
		url: url,
		data: data, //No I18N
		type: 'GET', //No I18N
		dataType: 'json', //No I18n
		async:false,
		beforeSend: function(XMLHttpRequest,settings)
  		{
  			opm_progressBarInit();
  			appendCollectorDetails(XMLHttpRequest, settings);
  			appendFWACollectorDetails(XMLHttpRequest,settings);
  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
  		},
		success: function(jsonData)
		{
			opm_progressBarComplete();
			toRet = jsonData;
		}
	});
	return toRet;
}
function opm_ajaxGetResponseWithMsg(url,data,msg,clbk,self,errorClbk,completeClbk)
{
	var uniqueId = "";//No I18N
	$.ajax(
	{
		url: url,
		data: data, //No I18N
		type: 'GET', //No I18N
		dataType: 'json', //No I18n
		async:true,
		self:self,
		beforeSend: function(XMLHttpRequest,settings)
  		{
  			if(msg !== '')
  			{
  				uniqueId = opm_infoMsgs("infoMsg",msg);//No I18N
  			}
  			appendCollectorDetails(XMLHttpRequest,settings);
  			appendFWACollectorDetails(XMLHttpRequest,settings);
  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
  		},
		success: function(jsonData)
		{
			$("#"+uniqueId).remove();
			if(typeof clbk === 'function') {
				clbk(jsonData);
			}
		},
		error: function(XMLHttpRequest, status, errorThrown)
		{
			$("#"+uniqueId).remove();
			if(typeof errorClbk === 'function') {
				errorClbk(XMLHttpRequest, status, errorThrown);
			}
		},
		complete: function()
		{
			if(typeof completeClbk === 'function') {
				completeClbk();
			}
		}
	});
}
function ajaxGetRequestWithOutAsync(Url,data)
{
	var dataStr = {};
	$.ajax(
	{
		url: Url,
		data: data, //No I18N
		type: 'GET', //No I18N
		dataType:'json', //No I18n
	//	async:false,
		beforeSend: function(XMLHttpRequest,settings)
  		{
  			opm_progressBarInit();
  			appendCollectorDetails(XMLHttpRequest,settings);
  			appendFWACollectorDetails(XMLHttpRequest,settings);
  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
  		},
		success: function(jsonData)
		{
			opm_progressBarComplete();
			dataStr = {"data":jsonData};//No I18N
			return dataStr;
		}
	});

}
function opm_ajaxGetRequest(Url,data)
{
	var dataStr = {};
	$.ajax(
	{
		url: Url,
		data: data, //No I18N
		type: 'GET', //No I18N
		dataType:'json', //No I18n
		async:false,
		beforeSend: function(XMLHttpRequest,settings)
  		{
			opm_progressBarInit();
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(jsonData)
		{
			opm_progressBarComplete();
			if (opm_checkIfAValIsValid(jsonData,"json") && jsonData !== null && jsonData.error === undefined && jsonData.result === undefined && Object.keys(jsonData).length !== 0)
			{
				$("#responseMessage").hide();//No I18N
				dataStr = {"data":jsonData}; //No I18N
			}
			else
			{
				$("#responseMessage").show();//No I18N
				var message;
				if(jsonData == null){
					return {};
				}
				if (jsonData.message !== undefined)
				{
					message = jsonData.message;
					dataStr = {"messageClass":"resDiv greenDiv"}; //No I18N
				}
				else if (jsonData.error !== undefined)
				{
					message = jsonData.error.message;
					dataStr = {"messageClass":"resDiv errorDiv"}; //No I18N
				}
				else if (jsonData.result !== undefined)
				{
					message = jsonData.result.message;
					dataStr = {"messageClass":"resDiv greenDiv"}; //No I18N
				}
				else
				{
					message = "webclient.reports.view.nodata"; //No I18N
					dataStr = {"messageClass":"resDiv greenDiv"}; //No I18N
				}

				if(message.indexOf('webclient') !== -1) //No I18N
                {
                    dataStr.message = Ember.I18n.t(message,this); //No I18N
                }
                else
                {
                    dataStr.message = message ;
                }
			}
		}
	});
	return dataStr;
}

function opm_getJSONData(url,data)
{
	var getjson = {'success':true,'jsonData':{}};//No I18N
	$.ajax(
	{
		url: url,
		type: 'GET', //No I18N
	//	dataType:'json', //No I18n
		data:data,
		async:false,
		beforeSend: function(XMLHttpRequest,settings)
  		{
			opm_progressBarInit();
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(jsonData)
		{
			opm_progressBarComplete();
			if(jsonData.result !== undefined || jsonData.error !== undefined)
			{
				if(jsonData.result !== undefined)
				{
					opm_infoMsgs('successMsg',jsonData.result.message); //No I18N
				}
				if(jsonData.error !== undefined)
				{
					opm_infoMsgs('errorMsg',jsonData.error.message); //No I18N
				}
				getjson.success = false;
			}
			else
			{
				 getjson.success = true;
				 getjson.jsonData = jsonData;
			}
		}
	});
	return getjson;
}

function opm_getJSONcallback(url,calbk,id,data,tabName)
{
	opm_progressBarInit(id);
	$.getJSON(url,data,function(jsonData){ //No I18N
		opm_progressBarComplete(id);
		if(jsonData.result !== undefined || jsonData.error !== undefined)
		{
			if(tabName!=="Applications")//No I18N
		{
			if(jsonData.result !== undefined)
			{
				opm_infoMsgs('successMsg',jsonData.result.message); //No I18N
			}
			if(jsonData.error !== undefined)
			{
				opm_infoMsgs('errorMsg',jsonData.error.message); //No I18N
				}
			}
		}
		else
		{
			calbk(jsonData);
		}

	});
}
function presentData(response2)
{
	$.each(Object.keys(response2),function(index, key)
	{
		var id ="#NFA"+key;//No I18N
		var value =response2[key];
		if($(id)==undefined && value.length >0)
		{
			return true;
		}
		var inputType =$(id).attr("type") || $('#NFAcount').prop("tagName");
		switch(inputType)
		{
			case "text"://No I18N
				$(id).val(value);
		        break;
			case "SELECT"://No I18N
				$(id).val(value).select2();
		        break;
		    case "radio"://No I18N
				$(id).prop('checked',$.parseJSON(value));
		        break;
		}
	});
}
function readCookie(name)
{
  var url = "/servlets/SettingsServlet?"; //No I18N
    var dataParams = "readCookie=true&cookieName="+name;//No I18N
    var val = "";
    $.ajax({
        url: url,
        type: "POST",//No I18N
        dataType: "html",//No I18N
        async: false,
        data:dataParams,
        success: function(data, textStatus, XMLHttpRequest) {
            val = data;
	        	if(data != null){
	        		val =  data.trim();
	        	}
            }
        });
    return val;
}
function eraseCookie(name)
{
    var url = "/servlets/SettingsServlet?"; //No I18N
    var dataParams = "eraseCookie=true&cookieName="+name;//No I18N

    $.ajax({
        url: url,
        type: "POST",//No I18N
        dataType: "html",//No I18N
        async: false,
        data:dataParams
    });
}
function createCookie(name, value, days)
{
  var url = "/servlets/SettingsServlet?"; //No I18N
    var dataParams = "cookieUpdate=true&cookieName="+name+"&cookieValue="+value+"&cookieExpiry="+days;//No I18N
    $.ajax({
        url: url,
        type: "POST",//No I18N
        dataType: "html",//No I18N
        async: false,
        data:dataParams
    });
}

//added for threshold limit alone - ends

function opm_isValidNumber(inpString, where)
{
    var str = opm_trimVal(inpString.value);

    if(/^[-+]?\d+(\.\d+)?$/.test(str))
    {
        if(str > 0)
        {
	     	if(opm_isInteger(inpString,where))
		{
		return true;
		}
        }
        else
        {
            alert(Ember.I18n.t('webclient.js.enterPositive',this) +" "+where);//No I18N
        }
    }
    else
    {
        alert(Ember.I18n.t('webclient.js.integerValue',this) +" "+where);//No I18N
    }
    parseInt(inpString).value = "";
    parseInt(inpString).focus();
    return false;
}
function opm_trimVal(s)
{
    return s.replace( /^\s*/, "" ).replace( /\s*$/, "" );//No I18N
}
// added for threshold limit alone
function opm_isInteger(inpString, where)
{
    var str = opm_trimVal(inpString.value);
    var invalid = "."; // Invalid character is a .

    if (str.indexOf(invalid) > -1)
    {
        alert(Ember.I18n.t('webclient.js.integerValue',this) + where);//No I18N
        parseInt(inpString).value = "";//No I18N
        parseInt(inpString).focus();
	return false;
    }
    return true;
}

function opm_isValNumberAllowNegative(inpString, where)
{
	var str = trimVal(parseInt(inpString).value);
	if(/^[-+]?\d+(\.\d+)?$/.test(str))
	{
		return true;
	}
	else
	{
		alert(Ember.I18n.t('webclient.js.integerValue',this) + where);//No I18N
	}
	parseInt(inpString).value = "";
	parseInt(inpString).focus();
	return false;
}
function opm_validateIpRange(ipaddr1,ipaddr2){
	var parts1 = ipaddr1.split(".");
	var parts2 = ipaddr2.split(".");
	for (var i=0; i<parts1.length; i++)
	{
		p1 = parseInt(parseFloat(parts1[i]));
		p2 = parseInt(parseFloat(parts2[i]));
		if( p1 < p2 )
		{
			return true;
		}
		else if( p1 > p2)
		{
			return false;
		}
		else
		{
			continue;
		}
	}
	return true;
}

function opm_validateNumericThreshold(thType, threshold, rearm, msg)
{
	if(trim(threshold.value) === "")
	{
		return true;
	}
	if(!opm_isInteger(threshold, Ember.I18n.t('webclient.admin.customgraph.ThresholdLimit',this)))//No I18N
	{
		return false;
	}
	if(!opm_isValNumberAllowNegative(threshold, Ember.I18n.t('webclient.admin.customgraph.ThresholdLimit',this)))//No I18N
	{
		return false;
	}
	if(!opm_checkRearmValue(thType, threshold, rearm))
	{
		return false;
	}
	if(msg && trim(msg.value) ==="")
	{
		alert(Ember.I18n.t('webclient.threshold.entermsg',this));//No I18N
		msg.focus();
		return false;
	}
	return true;
}
/*function opm_validateNumericMonitorThreshold(thType, threshold, rearm, msg)
{

	if(threshold === "")
	{
		return true;
	}
	if(!opm_IsNumericVal(threshold))//No I18N
	{
		return false;
	}
	if(!opm_checkMonitorRearmValue(thType, threshold, rearm))
	{
		return false;
	}
	if(msg && trim(msg) === "")
	{
		alert(Ember.I18n.t('webclient.threshold.entermsg',this)); //No I18N
		return false;
	}
	return true;
}
function opm_checkRearmValue(thType, threshold, rearm)
{
	if(!rearm.disabled && (!opm_isValNumberAllowNegative(rearm, Ember.I18n.t('webclient.admin.customgraph.RearmValue',this)) || !opm_isInteger(rearm, "<fmt:message key='webclient.admin.customgraph.RearmValue'/>")))
	{
		return false;
	}
	switch(thType.value)
	{
		case "min" : //No I18N
			if(parseInt(threshold.value) > parseInt(rearm.value))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdless',this));//No I18N
				threshold.focus();
				return false;
			}
			break;
		case "max" : //No I18N
			if(parseInt(threshold.value) < parseInt(rearm.value))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdgreat',this));//No I18N
				threshold.focus();
				return false;
			}
			break;
		case "equal" : //No I18N
			if(parseInt(threshold.value) === parseInt(rearm.value))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdequalmsg',this));//No I18N
				threshold.focus();
				return false;
			}
			break;
		case "notEqual" : //No I18N
			return true;
	}
	return true;
}*/
/*function opm_checkMonitorRearmValue(thType, threshold, rearm)
{

	if(thType !== "notequal" && !opm_IsNumericVal(rearm))
	{
		return false;
	}
	switch(thType)
	{
		case "min" : //No I18N
			if(parseInt(threshold) > parseInt(rearm))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdless',this));//No I18N
				return false;
			}
			break;
		case "max" : //No I18N
			if(parseInt(threshold) < parseInt(rearm))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdgreat',this));//No I18N
				return false;
			}
			break;
		case "equal" : //No I18N
			if(parseInt(threshold) === parseInt(rearm))
			{
				alert(Ember.I18n.t('webclient.admin.customgraph.thresholdequalmsg',this));//No I18N
				return false;
			}
			break;
		case "notequal" : //No I18N
			return true;
	}
	return true;
}
function opm_compareWithHigherSeverity(thType, highSev, lowSev)
{
	switch(thType)
	{
		case "min" : //No I18N
			if(parseInt(highSev.value) >= parseInt(lowSev.value))
			{
				alert(Ember.I18n.t('webclient.threshold.alert.highval',this));//No I18N
				lowSev.focus();
				return false;
			}
			break;
		case "max" : //No I18N
			if(parseInt(highSev.value) <= parseInt(lowSev.value))
			{
				alert(Ember.I18n.t('webclient.threshold.alert.lowval',this));//No I18N
				lowSev.focus();
				return false;
			}
			break;
		default :
			if(parseInt(highSev.value) === parseInt(lowSev.value))
			{
				alert(Ember.I18n.t('webclient.threshold.samevaluealert',this));//No I18N
				lowSev.focus();
				return false;
			}
			break;
	}
	return true;
}
function opm_compareMonitorHigherSeverity(thType, highSev, lowSev)
{
	if(highSev === "" && lowSev === ""){
		return true;
	}else{
		switch(thType)
		{
			case "min" : //No I18N
				if(parseInt(highSev) >= parseInt(lowSev))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.highval',this));//No I18N
					return false;
				}
				break;
			case "max" : //No I18N
				if(parseInt(highSev) <= parseInt(lowSev))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.lowval',this));//No I18N
					return false;
				}
				break;
			default :
				if(parseInt(highSev) === parseInt(lowSev))
				{
					alert(Ember.I18n.t('webclient.threshold.samevaluealert',this));//No I18N
					return false;
				}
				break;
		}
	}
	return true;
}
*/

/*** Current time formating starts here ****/
var i18n = {
			dayNames:
			[
				Ember.I18n.t("webclient.general.day.sun",this),//No I18N
				Ember.I18n.t("webclient.general.day.mon",this),//No I18N
				Ember.I18n.t("webclient.general.day.tue",this),//No I18N
				Ember.I18n.t("webclient.general.day.wed",this),//No I18N
				Ember.I18n.t("webclient.general.day.thu",this),//No I18N
				Ember.I18n.t("webclient.general.day.fri",this),//No I18N
				Ember.I18n.t("webclient.general.day.sat",this),//No I18N
				Ember.I18n.t("webclient.general.sunday",this),//No I18N
				Ember.I18n.t("webclient.general.monday",this),//No I18N
				Ember.I18n.t("webclient.general.tuesday",this),//No I18N
				Ember.I18n.t("webclient.general.wednesday",this),//No I18N
				Ember.I18n.t("webclient.general.thursday",this),//No I18N
				Ember.I18n.t("webclient.general.friday",this),//No I18N
				Ember.I18n.t("webclient.general.saturday",this) //No I18N
				],
			monthNames: [
				Ember.I18n.t("webclient.general.month.jan",this),//No I18N
				Ember.I18n.t("webclient.general.month.feb",this),//No I18N
				Ember.I18n.t("webclient.general.month.mar",this),//No I18N
				Ember.I18n.t("webclient.general.month.apr",this),//No I18N
				Ember.I18n.t("webclient.general.may",this),//No I18N
				Ember.I18n.t("webclient.general.month.jun",this),//No I18N
				Ember.I18n.t("webclient.general.month.jul",this),//No I18N
				Ember.I18n.t("webclient.general.month.aug",this),//No I18N
				Ember.I18n.t("webclient.general.month.sep",this),//No I18N
				Ember.I18n.t("webclient.general.month.oct",this),//No I18N
				Ember.I18n.t("webclient.general.month.nov",this),//No I18N
				Ember.I18n.t("webclient.general.month.dec",this),//No I18N
				Ember.I18n.t("webclient.general.january",this),//No I18N
				Ember.I18n.t("webclient.general.february",this),//No I18N
				Ember.I18n.t("webclient.general.march",this),//No I18N
				Ember.I18n.t("webclient.general.april",this),//No I18N
				Ember.I18n.t("webclient.general.may",this),//No I18N
				Ember.I18n.t("webclient.general.june",this),//No I18N
				Ember.I18n.t("webclient.general.july",this),//No I18N
				Ember.I18n.t("webclient.general.august",this),//No I18N
				Ember.I18n.t("webclient.general.september",this),//No I18N
				Ember.I18n.t("webclient.general.october",this),//No I18N
				Ember.I18n.t("webclient.general.november",this),//No I18N
				Ember.I18n.t("webclient.general.december",this) //No I18N
		]
	};

var am_pm_i18n = {PM:Ember.I18n.t('webclient.timer.pm',this),AM:Ember.I18n.t('webclient.timer.am',this)}; //No I18n

Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);

};
var dateFormat = function () {
	var	token = /d{1,4}|E{1,4}|M{1,4}|yy(?:yy)?|([Hhmsat])\1?|[LloSz]|"[^"]*"|'[^']*'/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) {val = "0" + val;}
			return val;
		};

	return function (date, mask, utc) {
		var dF = dateFormat;

		if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		date = date ? new Date(date) : new Date();
		if (isNaN(date)) {
			throw SyntaxError("invalid date"); //No I18N
		}

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		if (mask.slice(0, 4) === "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",  //No I18N
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			M = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			m = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			flags = {
				d:    d,
				dd:   pad(d),
				EEE:  i18n.dayNames[D],
				EEEE: i18n.dayNames[D + 7],
				M:    M + 1,
				MM:   pad(M + 1),
				MMM:  i18n.monthNames[M],
				MMMM: i18n.monthNames[M + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				m:    m,
				mm:   pad(m),
				s:    s,
				ss:   pad(s),
				a:    H < 12 ? am_pm_i18n.AM : am_pm_i18n.PM,  //No I18N
				z:    OPM.tzone
			};

		return mask.replace(token, function ($0) {
			date.setSeconds(date.getSeconds()+1);
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

dateFormat.masks = {
	"default":      "ddd MMM dd yyyy hh:mm:ss", //No I18N
	shortDate:      "M/d/yy", //No I18N
	mediumDate:     "MMM d, yyyy", //No I18N
	longDate:       "MMMM d, yyyy", //No I18N
	fullDate:       "dddd, MMMM d, yyyy", //No I18N
	shortTime:      "h:mm a", //No I18N
	mediumTime:     "h:mm:ss a", //No I18N
	longTime:       "h:mm:ss a z", //No I18N
	isoDate:        "yyyy-MM-dd", //No I18N
	isoTime:        "hh:mm:ss", //No I18N
	isoDateTime:    "yyyy-MM-dd'a'hh:mm:ss", //No I18N
	isoUtcDateTime: "UTC:yyyy-MM-dd'a'hh:mm:ss'z'" //No I18N
};
function opm_showCurrentTime(curTimeInMilliSec) {
	if (window.OPM.jyear !== undefined) {
		curTime = new Date(window.OPM.jyear, window.OPM.jmon, window.OPM.jday, window.OPM.jhour, window.OPM.jmin, window.OPM.jsec);
		window.OPM.jsec = parseInt(window.OPM.jsec) + 1;
	}
	if (curTimeInMilliSec) {
		var timeStr;
		var lang = window.OPM.language;
        lang = lang.replace("_","-").replace("sp","es"); //No I18N
        if(timeFormat.indexOf('zzzz') != -1){
            var formatter = new Intl.DateTimeFormat(lang, {
                weekday: 'long',     //NO I18N
                year: 'numeric',     // "2025"
                month: 'long',       //NO I18N
                day: 'numeric',      // "23"
                hour: 'numeric',     // "11"Popm
                minute: '2-digit',   // "13"
                second: '2-digit',   // "00"
                hour12: true,        // AM/PM format
                timeZone: window.OPM.isNFA ? window.OPM.userTimeZone : window.OPM.severTimeZone, // optional: specify desired timezone
                timeZoneName: 'long'  //NO I18N
              });

            timeStr = formatter.format(curTimeInMilliSec);
        }else{
            timeStr = moment.tz(new Date(curTimeInMilliSec),window.OPM.isNFA ? window.OPM.userTimeZone : window.OPM.severTimeZone).format(timeFormat);
        }
        $("#opm_currentTime").text(timeStr);//No I18N
        OPMClient.ApplicationController.set("currentServerTime", timeStr); //No I18n
        OPMClient.ApplicationController.serverTime += 1000;
	}
}
if (window.OPM.pattern !== undefined) {
	opm_showCurrentTime(OPMClient.ApplicationController.serverTime);
	setInterval(function () { opm_showCurrentTime(OPMClient.ApplicationController.serverTime); }, 1000);
}
/*** Current time formating end here ****/

function opm_setDeviceSerachFocus()
{
	$('#inputString').focus();//No I18N
	$('#inputString').val('');//No I18N
}

function opm_calculateConversion(units,val)
{
	var toreturn;
	if(units === "bytes" || units==="mins")
	{
		toreturn=val;
	}
	else if(units==="KB")
	{
		toreturn=val*1024;
	}
	else if(units==="MB")
	{
		toreturn=val*1024*1024;
	}
	else if(units==="GB")
	{
		toreturn=val*1024*1024*1024;
	}
	else if(units==="hours")
	{
		toreturn=val*60;
	}
	else if(units==="days")
	{
		toreturn=val*1440;
	}
	return 	toreturn;
}

function opm_isNumberKey(evt){

    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)){
        return false;
    }
    else{
    	return true;
    }
}
function opm_changeTheme(theme)
{
	var selectedTheme = "";
	var fromForm = false;
	if (theme !== undefined && theme !== null && theme !== "" && theme !== "null")
	{
		selectedTheme = theme;
	}
	else
	{
		selectedTheme = opm_getValueofSelectedRadioButton(document.PreferencesForm.selectedskin);
		if (selectedTheme !== null && selectedTheme !== undefined && selectedTheme !== "null" && selectedTheme !== "" && selectedTheme !== "Apiclient")
		{
			fromForm = true;
		}
	}
}
function opm_progressBarComplete(id)
{
	if(id !== undefined && id !== "")
	{
		var sbid = $(id).data('cpbid');
		$('#'+sbid).removeClass('commonloading').addClass('commonsuccess');
	}
	else
	{
		$('.commonProgressbar').removeClass('commonloading').addClass('commonsuccess');
	}
	setTimeout(function(){
		if(id !== undefined && id !== "")
		{
			var sbid = $(id).data('cpbid');
			$('#'+sbid).hide().removeClass('commonsuccess');
			$('#'+sbid).remove();
		}
		else
		{
			$('.commonProgressbar').hide().removeClass('commonsuccess');
		}
    },500);
}
function opm_progressBarInit(id)
{
	if(id !== undefined && id !== "")
	{
		var subId = "cpbar_"+(new Date()).getTime();//No I18N
		$(id+' .commonProgressbar').remove();
		$(id).append("<div class='commonProgressbar' id='"+subId+"'></div>");
		$("#"+subId).show().addClass('commonloading');
		$(id).attr("data-cpbid", subId);
	}
	else
	{
		$('.commonProgressbar').show().addClass('commonloading');
	}
}

function opm_drawAvailabilityTimeLine(elm,data,option)
{
	$(elm).empty();
	$(".initialStatus").empty();
	for(i=0;i<25;i++)
	{
		$(".initialStatus").append('<i>'+i+'</i>');//No I18N
	}
	if(data.length > 0)
	{
		$.each(data, function(key,val)
		{
			var availData= val.split(",");
			var name = availData[0];
			var startT = Number(availData[1]);
			var endT = Number(availData[2]);
			if(availData[3] !== undefined &&  availData[3] !== ""){
				var displayState = availData[3];
			}else{
				var displayState = availData[0];
			}

			var tz = (option.timeZone !== undefined ? option.timeZone : window.OPM.severTimeZone);
			var tformat = (option.timFormat !== undefined ? option.timFormat : window.OPM.pattern);

			var d= moment.tz(new Date(startT),tz);

			d.startOf('day');//No I18N
		    //d.setMinutes(0);
		    //d.setSeconds(0);
		   // d.setTimezone("PST");
			var initialTime=d;
			var startTime=moment.tz(new Date(startT),tz);
			//startTime.setTimezone("PST");
			var endTime=moment.tz(new Date(endT),tz);
			//endTime.setTimezone("PST");
			divWidth=Math.floor((endTime-startTime)/1000/60/60*24);
			divPosX=Math.floor((startTime-initialTime)/1000/60/60*24);

			statusClass = option.colorScale[name];

			var pattern = tformat;
				pattern = pattern.replace(/yy/gi,"YY");//No I18N
				pattern = pattern.replace(/d/gi,"D");//No I18N
				pattern = pattern.replace(/E/gi,"d");//No I18N

			if(divWidth !== -1)
			{
				$(elm).append("<div class='"+statusClass+"' data-pos='"+divPosX+"' style='width:"+divWidth+"px;left:"+divPosX+"px'><i></i><div><span>"+Ember.I18n.t('webclient.devices.details.avail',this)+" "+Ember.I18n.t('webclient.support.thread.state',this)+": "+displayState+"</span><span>"+Ember.I18n.t('mediatrace.starttime',this)+": "+startTime.format(pattern)+"</span><span>"+Ember.I18n.t('webclient.devices.details.endtime',this)+": "+endTime.format(pattern)+"</span></div></div>");
			}

			var num = Number(startTime.toDate().getHours()+"."+startTime.toDate().getMinutes());
			var num1 = Number(endTime.toDate().getHours()+"."+endTime.toDate().getMinutes());
			if(num === 0 && num1 < 0.59)
			{
				num = 0;
			}
			else if(num > 0 && num1 < 0.59)
			{
				num = 1;
			}

			var si = Math.ceil(num);
			var endi = Math.floor(num1);
			for(i=si;i<=endi;i++)
			{
				if(i === si || i === endi)
				{
					$($(".initialStatus i")[i]).addClass(colorScale[name]);
				}
			}


		});
	}
	$(elm+" > div").hover(
	  function(){
	    $tis=$(this);
	    setTimeoutConst=setTimeout(function(){
	      tisPos=$tis.offset();
	      tisPosY=tisPos.top;
	      tisPosX=tisPos.left;
	      divPosY=($tis.outerHeight())+tisPos.top;
	      if($('html').hasClass('onScrollTopBandHide')){//No I18N
	      	divPosY += 50;
	      }
	      childWd=$tis.find('div').outerWidth()/2;
	      divPosX=($tis.outerWidth()/2)+tisPos.left-childWd;
	      $tis.find('div').css({top:divPosY,left:divPosX,display:'block'});//No I18N
	      stateToolTipWd=$tis.find('div').outerWidth();
	      dis=tisPosX+($tis.outerWidth()/2);
	      TotalWd=dis+(stateToolTipWd/2);
	      if(wWd>TotalWd){
	      	$tis.find('div').animate({top:divPosY+10,opacity:'1'});
	      }else{
	      	divPosX=(tisPosX+$tis.outerWidth())-stateToolTipWd;
			ArrowPos=($tis.width()/2)-10;
			if(ArrowPos<6){ArrowPos=5;}
			$('body').append('<style class="stateToolTipStyle">.statusInfo > div >div:before{right:'+ArrowPos+'px !important;left:auto !important}</style>');
	      	$tis.find('div').css({left:divPosX}).animate({top:divPosY+10,opacity:'1'});
	      }
	    },300);
	  },
	  function(){
	    clearTimeout(setTimeoutConst);
	    $tis.find('div').css({display:'none',opacity:'0',top:'0',left:'0'});//No I18N
	    $('.stateToolTipStyle').remove();
	  });
}
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHexCode(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function opm_lightToDarkColor(color, op) {
	if(color!==undefined){
		var rgbPattern = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		if(rgbPattern!==null){
			color = rgbToHexCode(parseInt(rgbPattern[1]),parseInt(rgbPattern[2]),parseInt(rgbPattern[3]));
		}
	}
  color = String(color).replace(/[^0-9a-f]/gi, '');
  if (color.length < 6) {
    color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  }
  op = op || 0;
  var returnrgb = "#", c, i;
  for (i = 0; i < 3; i++) {
    c = parseInt(color.substr(i*2,2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * op)), 255)).toString(16);
    returnrgb += ("00"+c).substr(c.length);
  }
  return returnrgb;
}

function opm_getjsonStatus(jsonData)
{
	var returnBoo = false;
	if(jsonData.result !== undefined || jsonData.error !== undefined)
	{
		if(jsonData.result !== undefined)
		{
			opm_infoMsgs('successMsg',jsonData.result.message); //No I18N
		}
		if(jsonData.error !== undefined)
		{
			opm_infoMsgs('errorMsg',jsonData.error.message); //No I18N
		}
		returnBoo = false;
	}
	else
	{
		 returnBoo = true;
	}
	return returnBoo;
}
// function slideIn(a){
// 				adClas='slideDivIn-'+a; //No I18N
// 				$('body').addClass(adClas);
// 			}
// function slideOut(a){
// 	removClas='slideDivIn-'+a; //No I18N
// 	$('body').removeClass(removClas);
// }
function opm_gotoSlideEdit(thisDiv){
	globalSliderObj.editVal=$(thisDiv).attr("data-editVal");
//	console.log($(thisDiv).attr("data-href"));
	window.location.href=$(thisDiv).attr("data-href");
}
function opm_ajaxMultiPostRequest(postUrl,postData,showLoading,otpDetails)
{
	var done = "";
	var currentFunctionName = arguments.callee.name;
	$.ajax(
	{
		url: postUrl,
		data: postData, //No I18N
		type: 'POST', //No I18N
		async:false,
		cache:false,
		processData:false,
		contentType:false,
		beforeSend: function(XMLHttpRequest,settings)
		{
			opm_progressBarInit();
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			opm_progressBarComplete();
			done = response;
			isOtpValidationRequired(done, currentFunctionName, postUrl, postData, otpDetails);
		}
	});
	return done;
}
function opm_ajaxMultiPostRequestWithMsg(postUrl,postData,msg,isShowError)
{
	var uniqueId = '';//No I18N
	var done = '';//No I18N
	$.ajax(
	{
		url: postUrl,
		data: postData, //No I18N
		type: 'POST', //No I18N
		async:false,
		cache:false,
		processData:false,
		contentType:false,
		beforeSend: function(XMLHttpRequest,settings)
		{
			if(msg !== "")
			{
				uniqueId = opm_infoMsgs('infoMsg',msg);//No I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			$("#"+uniqueId).remove();//No I18N
			done = response;
		},
		complete: function(xhr, respStatus) {
			if(isShowError)
			{
	        	if(xhr.status === 403 || xhr.status === "403")
	        	{
	        		opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.api.file.notsupport',this));//No I18N
	        	}
	        	else if(xhr.status === 406 || xhr.status === "406")
	        	{
	        		opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.bv.bgupload.sizeexceed', { param0:"3 MB" },this));//No I18N
	        	}
	        }
    	}
	});
	return done;
}

function opm_ajaxMultiPostAsyncRequestWithMsg(postUrl,postData,msg,isShowError,callbackFn)
{
	var uniqueId = '';//No I18N
	var done = '';//No I18N
	$.ajax(
	{
		url: postUrl,
		data: postData,
		type: 'POST', //No I18N
		async:true,
		cache:false,
		processData:false,
		contentType:false,
		beforeSend: function(XMLHttpRequest,settings)
		{
			if(msg !== "")
			{
				uniqueId = opm_infoMsgs('infoMsg',msg);//No I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendFWACollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response)
		{
			$("#"+uniqueId).remove();//No I18N
			if(callbackFn) {
				return callbackFn(response);
			}
			done = response;
		},
		complete: function(xhr, respStatus) {
			if(isShowError)
			{
	        	if(xhr.status === 403 || xhr.status === "403")
	        	{
	        		opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.api.file.notsupport',this));//No I18N
	        	}
	        	else if(xhr.status === 406 || xhr.status === "406")
	        	{
	        		opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.bv.bgupload.sizeexceed', { param0:"3 MB" },this));//No I18N
	        	}
	        }
    	}
	});
	return done;
}

function navDashTabList(elm, hasAnExtraView){
	$(elm+' .more').hide();
	$(elm+' .more .moreList').empty();
	navDashTabListCalc(elm);	

	$(elm+' li').click(function(){
		if(!$(this).parent().hasClass('opmDeviceMoreList')){
		if(!hasAnExtraView){
			$(this).parent().parent().parent().parent().find('a').removeClass('active');
			$(this).find('a').addClass('active');
		}
			if($(this).parent().hasClass('moreList')){
				$(elm+' .list li:last-child').appendTo($(elm+' .moreList'));
			if(hasAnExtraView != undefined && hasAnExtraView) {
				$(this).appendTo($(elm+' .list div.ember-view'));
			} else {
				$(this).appendTo($(elm+' .list'));
			}

				$(elm+" .moreList li").sort(sort_li).appendTo(elm+' .moreList');
			}
			if('Home.Dashboard.index' === window.OPM.currentView.name && $('.dropDownMenu.active > a > span:last-child').text() === ''){
    			setDashboardSubTabHeader('Custom' === OPMClient.HomeDetailsController.dashboardType ? OPMClient.HomeDetailsController.dashboardName : Ember.I18n.t(OPMClient.HomeDetailsController.dashboardName));//No I18N
			}
		}
	});

	window.onresize = function() {
		navDashTabListCalc(elm);
	}
}

function navDashTabListCalc (elm) { 
	if(location.href.indexOf("APM/List") != -1 || location.href.indexOf("#/Alarms/Alarm") != -1)
	{
		var availLength=$('.opmDashboardSubLinks').outerWidth()-200;
	}
	else
	{		
		var availLength=$('.opmDashboardSubLinks').outerWidth() - 100 - $(".dahboard-actns").width(); //Dashboard menu buttons occupies more spacce as well
	}
	var drpDwnEle = $(elm+' .list li');
	var totalDrpDwnLength = $(elm+' .list li').length;
	var totalLength = 0;
	for(var k=0;k<totalDrpDwnLength;k++){
		totalLength += $(drpDwnEle[k]).outerWidth();
	}
	if(availLength<totalLength){
		var eleWd = 0;
		for(var i=0;i<totalDrpDwnLength;i++)
		{
			eleWd += $(drpDwnEle[i]).outerWidth();
			if(eleWd > availLength){
				eleWd -= $(drpDwnEle[i]).outerWidth();
				break;
			}
		}
		var sliceCount = totalDrpDwnLength - i;
		$(elm+' .list li').slice(-sliceCount).appendTo(elm+' .more ul');
		$(elm+' .more').css({display:'block',right:'auto',left:eleWd+10+'px'});
	}
}

function navTabList(elm, hasAnExtraView){
	$(elm+' .more').hide();
	$(elm+' .more .moreList').empty();
	rowLength=$(elm+' .list').outerWidth();
	rowChild=$(elm+' .list li').length;
	rowLimit=rowChild*160;
	if(rowLength<rowLimit){
		rowLength=rowLength-100;
		for(i=1;i<=rowChild;){
			rowCol=i*160;
			if(rowCol>rowLength){
				i=i-1;
				morePos=i*160;
				break;
			}
			i++;
		}
		moveCount=rowChild-i;
		$(elm+' .list li').slice(-moveCount).appendTo(elm+' .more ul');
		$(elm+' .more').css({display:'block',right:'auto',left:+morePos+'px'});
	}

	$(elm+' li').click(function(){
		if(!$(this).parent().hasClass('opmDeviceMoreList')){
		if(!hasAnExtraView){
			$(this).parent().parent().parent().parent().find('a').removeClass('active');
			$(this).find('a').addClass('active');
		}
			if($(this).parent().hasClass('moreList')){
				$(elm+' .list li:last-child').appendTo($(elm+' .moreList'));
			if(hasAnExtraView != undefined && hasAnExtraView) {
				$(this).appendTo($(elm+' .list div.ember-view'));
			} else {
				$(this).appendTo($(elm+' .list'));
			}

				$(elm+" .moreList li").sort(sort_li).appendTo(elm+' .moreList');
			}
		}
	});
}

function opm_getAboutDetails()
{
	$("#about_shimmer1").show();
	$("#about_shimmer2").show();
	$("#addOn_details").hide();
	$("#aboutPage_content1").hide();
	$("#aboutPage_content2").hide();
	var productDetailsLoad =  function(productDetails) {
		$("#about_shimmer1").hide();
		$("#aboutPage_content1").show();
		$.each($("#aboutPage_content1 .row"),function(){
			var key = $(this).find(':first-child').attr('data-key');//No I18N
			if(key !== 'ProductName'){
				$(this).find('div:nth-child(2)').remove();
			}
			if(key === 'PATCH_DATE' || key === 'amsExpiry'){ //No I18N
				if(productDetails[key] == undefined){
					$(this).hide();
				}
				else{
					$(this).append('<div>'+opm_escapeHTML(productDetails[key])+'</div>');//No I18N
				}
			} else if(key === 'BUILD_NUMBER' && !getHideUpgradeManager()) { //No I18N
				$(this).append('<div>'+opm_escapeHTML(productDetails[key])+' <a class="opm_link upgradeLink" id="upgradeLink"> ( ' + Ember.I18n.t("webclient.smartupgrade.upgrade", this) + ' )</a></div>');//No I18N
			} else {
				if (key !== 'ProductName') {
					if(productDetails[key] !== undefined){
						if(window.OPM.isFWAAuditEdition && key == 'Edition'){
							$(this).append('<div>'+opm_escapeHTML(productDetails[key])+' - '+Ember.I18n.t('webclient.Audit',this)+'</div>');//No I18N
						}else{
							$(this).append('<div>'+opm_escapeHTML(productDetails[key])+'</div>');//No I18N
						}
						
					}
					else {
						$(this).hide();
					}
				}
			} 
		});
		if (productDetails && productDetails.serverTime !== undefined) { //Update server time from API response
			OPMClient.ApplicationController.serverTime = productDetails.serverTime;
		}
		if(window.OPM.rebrandObj.isCustomRebranding && productDetails && productDetails.LicenseType === "Evaluation") {
			productDetails.CompanyName = window.OPM.rebrandObj.companyName;
		}
	}
	opm_getJSONcallback(window.OPM.apiUrlPattern + "/admin/getBasicLicenseDetails",productDetailsLoad); //No I18N
	if(window.OPM.userPermissions.adminAccess) {
		var aboutPageFunction = function(licenseDetails) {
			$("#about_shimmer2").hide();
			$("#aboutPage_content2").show();
			$.each($("#aboutPage_content2 .row"),function(){
				var key = $(this).find(':first-child').attr('data-key');//No I18N
				var productType = $(this).attr('data-product');//No I18N
				if(key !== 'ProductName'){
					$(this).find('div:nth-child(2)').remove();
				}
				if(productType !== undefined) {
					if(productType === "OpUtils" && key === 'NumberOfIPs'){//No I18N
						$(this).append('<div>'+opm_escapeHTML(licenseDetails.ModulePropertiesMap.IPAddressManager.Nodes)+'</div>');//No I18N
					}else if(productType === "OpUtils" && key === 'NumberOfPorts'){//No I18N
						$(this).append('<div>'+opm_escapeHTML(licenseDetails.ModulePropertiesMap.SwitchPortMapper.Nodes)+'</div>');//No I18N
					}else{
						$(this).append('<div>'+opm_escapeHTML(licenseDetails[productType][key])+'</div>');//No I18N
					}
				}else if(key === 'nfaServerType') {//No I18N
					$(this).append('<div>'+opm_escapeHTML(serverRoleDisp)+'</div>');//No I18N
				}
				else {
					if(licenseDetails[key] !== undefined){
						$(this).append('<div>'+opm_escapeHTML(licenseDetails[key])+'</div>');//No I18N
					}
					else {
						$(this).hide();
					}
				}
			});
			$('#addOn_details').show();
			$('#addOn_details div').remove();
			if(window.OPM.isOPM)
			{
				if(licenseDetails!==undefined && licenseDetails.licensedLiteDevices!==undefined && licenseDetails.managedLiteDevice!==undefined) {
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t("webclient.general.liteDevices.tab",this)+"</div><div>"+opm_escapeHTML(licenseDetails.managedLiteDevice)+"/"+opm_escapeHTML(licenseDetails.licensedLiteDevices)+" "+Ember.I18n.t('webclient.general.Devices',this)+"</div></div>");//No I18N
				}
				if(licenseDetails!==undefined && licenseDetails!==undefined && licenseDetails.ModulePropertiesMap!==undefined){
					if(licenseDetails.ModulePropertiesMap.licensedDiskCount !== undefined && licenseDetails.ModulePropertiesMap.managedDiskCount !== undefined){
						$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.Storage',this)+"</div><div>"+opm_escapeHTML(licenseDetails.ModulePropertiesMap.managedDiskCount)+"/"+opm_escapeHTML(licenseDetails.ModulePropertiesMap.licensedDiskCount)+" "+Ember.I18n.t('webclient.general.Disks',this)+"</div></div>");//No I18N
					}
					if(licenseDetails.ModulePropertiesMap.isStorageAddonAvailable && !licenseDetails.ModulePropertiesMap.storageAddonExpired) {
						$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.about.storageexpireson',this)+"</div><div>"+opm_escapeHTML(licenseDetails.ModulePropertiesMap.storageAddonExpiryDate)+"</div></div>");//No I18N
					}
					$.each(licenseDetails.ModulePropertiesMap, function(key,val){
						if(val !== null && val.Nodes !== undefined && val.Nodes === "" && val.Nodes === "" && val.Expiry !== undefined && val.Expiry === 'Never'){
							$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t(key,this)+"</div><div>YES</div></div>");//No I18N
							}
						else{
							var addOnArr = ["SwitchPortMapper","IPAddressManager","NetFlow","FWA","NCM"];//No I18N
							if(val !== null && val.Expiry !== undefined && val.Expiry !== 'Never' && !addOnArr.contains(key)){
								$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t(key,this)+"</div><div>"+opm_escapeHTML(val.Expiry)+"</div></div>");//No I18N
							}else{
									if(val !== null && val.Nodes !== undefined)
									{
										$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t(key,this)+"</div><div>"+opm_escapeHTML(val.Nodes)+"</div></div>");//No I18N
									}
							}
						}
						});
                    if(licenseDetails.OpUtils.DDIManagement !== undefined){
                        $('#addOn_details').append("<div class='row'><div>"+"DDIManagement"+"</div><div>"+opm_escapeHTML(licenseDetails.OpUtils.DDIManagement)+"</div></div>");//No I18N
                    }
					if(licenseDetails.ModulePropertiesMap.NFAAddonsEnabled !== undefined){
						$.each(licenseDetails.ModulePropertiesMap.NFAAddonsEnabled, function(key,val){
							if(key === "HighPerf" && licenseDetails.NetFlow !== undefined && licenseDetails.NetFlow.highPerfAddonVersion !== undefined){
								$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t(key,this)+" ("+opm_escapeHTML(licenseDetails.NetFlow.highPerfAddonVersion)+")"+"</div><div>"+opm_escapeHTML(val)+"</div></div>");//No I18N
							}else{
								$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t(key,this)+"</div><div>"+opm_escapeHTML(val)+"</div></div>");//No I18N
							}
						});
					}
				}
		}else if(window.OPM.isNFA && window.OPM.userPermissions.adminAccess && !window.isNFAStandardEdition) {
				if(licenseDetails.ncmPromAddonExpiry !== undefined){
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.tab.ncm',this)+"</div><div>"+opm_escapeHTML(licenseDetails.ncmPromAddonExpiry)+"</div></div>");//No I18N
				}
				else{
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.tab.ncm',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NCMLicensedDeviceCount)+" "+Ember.I18n.t('NFAWidget.devices',this)+"</div></div>");//No I18N
				}
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.IPSLA',this)+"</div><div>"+opm_escapeHTML(licenseDetails.IpslaLicenseCount)+" "+Ember.I18n.t('webclient.action.graphs',this)+"</div></div>");//No I18N
				if(window.OPM.isOPUPlug){
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('opu.tools.IP_ADDRESS_MANAGER',this)+"</div><div>"+opm_escapeHTML(licenseDetails.ipamCount)+" / "+opm_escapeHTML(licenseDetails.OpUtils.NumberOfIPs)+" "+Ember.I18n.t('webclient.snapshot.name.IPs',this)+"</div></div>");//No I18N
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.action.switchport.header',this)+"</div><div>"+opm_escapeHTML(licenseDetails.spmCount)+" / "+opm_escapeHTML(licenseDetails.OpUtils.NumberOfPorts)+" "+Ember.I18n.t('opu.spm.Ports',this)+"</div></div>");//No I18N
				    $('#addOn_details').append("<div class='row'><div>"+"DDIManagement"+"</div><div>"+opm_escapeHTML(licenseDetails.OpUtils.DDIManagement)+"</div></div>");//No I18N
				}
				if (!window.isNDRAddon) {
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.inventory.nfa.asam',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow["ASAM-addOn"])+"</div></div>"); //NO I18N
				}
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.inventory.nfa.nbar',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow["NBARCBQoS-addOn"])+"</div></div>");//No I18N
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.inventory.nfa.cbqos',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow["NBARCBQoS-addOn"])+"</div></div>");//No I18N

				if(window.isHighPerfAddon){
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.license.details.highperf',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+(licenseDetails.NetFlow.highPerfAddonVersion!=undefined ? " ("+opm_escapeHTML(licenseDetails.NetFlow.highPerfAddonVersion)+")" : "")+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow.isHighPerfAddon)+"</div></div>");//No I18N
				}
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.capacityplanning',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+"</div><div>"+licenseDetails.NetFlow["Capacity-addOn"]+"</div></div>");//No I18N
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.reports.billing',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+"</div><div>"+licenseDetails.NetFlow["Billing-addOn"]+"</div></div>");//No I18N
				//if(window.OPM.isDPIEnabled){
					$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.nfa.dpi',this)+" "+Ember.I18n.t('webclient.license.details.addon',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow.totalDPIManaged)+" / "+opm_escapeHTML(licenseDetails.NetFlow.totalDPILicensed)+"</div></div>");//No I18N
				//}
				$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('FailOver',this)+"</div><div>"+opm_escapeHTML(licenseDetails.NetFlow.FailOver)+"</div></div>");//No I18N
			}
		//	if(window.OPM.isOPM || window.OPM.isNFA || window.OPM.isFWA)
		//	{
		//		$('#addOn_details').append("<div class='row'><div>"+Ember.I18n.t('webclient.tab.enduserbeta',this)+"</div><div>"+licenseDetails.EndUserCount+" "+Ember.I18n.t('webclient.Users',this)+"</div></div>");//No I18N
		//	}
			if(window.OPM.isEvalUser === true){
				loadCountryDetails(licenseDetails);
			}
		}
		opm_getJSONcallback(window.OPM.apiUrlPattern + "/admin/licenseDetails?isFluidic=true",aboutPageFunction); //No I18N
	}
	Ember.run.schedule('afterRender', function() { //No I18N
		$(document).on('click', '#upgradeLink', function() { //No I18N
			location.href = window.OPM.apiclientUrl + "Settings/Basic/UpgradeManager"; //No I18N
			cancelDropDown();
		});
	});
}
function removeNotification()
{
	// if(OPMClient.UserNotificationController.notifyCount > 0)
	// {
		opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/dashboard/clearUserNotification?ClearType=all"); //No I18n
	// }

	$('#userNotify').removeClass('ring');
	OPMClient.UserNotificationController.set('notifyCount',0); //No I18N
	OPMClient.UserNotificationController.set('showNotifyCount',false); //No I18N
}

function removeUploadRequestNotificationInstantlyJS(notificationData){
	if(OPMClient.UserNotificationController.content_notification != null && OPMClient.UserNotificationController.content_notification.length > 0) {
		for (var index = 0; index < OPMClient.UserNotificationController.content_notification.length; index++) {
			var notifData = OPMClient.UserNotificationController.content_notification[index];
			if(notifData.isApprovalRequest == true && notificationData.id == notifData.id) {
				OPMClient.UserNotificationController.content_notification.removeAt(index);
				break;
			}
		}
	}
}
function redirectThresholdNotification() {
	if(window.OPM.isMSPCentral && window.OPM.mspUserType === 'Customer') {
		redirectToDevices();
	} else {
		opm_transitionToTheRoute('Settings.Configurations.Customer.Index');//No I18N
	}
}
function showUserNotificationInstantlyJS(notificationData,flag){
	  if(notificationData.length===undefined){
	    opm_loadSingleNotification(notificationData,flag);
	  }
	  else{
	    $.each(notificationData, function(i,val){
	    opm_loadSingleNotification(val,flag);
		});
	  }
}
function opm_loadSingleNotification(notificationData,flag){

	if(flag!==undefined && flag===false){
		var temp="temp";//No I18N
	}
	else {
		if(notificationData.isMSPThresholdNotification) {
			OPMClient.UserNotificationController.set('notifyCount',1); //No I18N
		} else {
			OPMClient.UserNotificationController.set('notifyCount',parseInt(OPMClient.UserNotificationController.get('notifyCount'))+1); //No I18N
		}
		OPMClient.UserNotificationController.set('showNotifyCount',true); //No I18N
	}
	if((notificationData.MessageType!==undefined && notificationData.MessageType==="WebAlarm") || (notificationData.category !==undefined && notificationData.category === "WebAlarm")){
	    notificationData.CreatedUserName=Ember.I18n.t('webclient.admin.systm',this);     //No I18N
	    notificationData.isWebAlarm=true;
	}
	// NCM Upload Request data
	if(notificationData.isApprovalRequest) {
		if(notificationData.isApprove && notificationData.status != null) {
			if(notificationData.isExecuted){
				notificationData.statusStr = Ember.I18n.t('EXECUTED', this); //No I18N
			} else {
				notificationData.statusStr = Ember.I18n.t(notificationData.status, this);
			}

		} else {
			notificationData.status='';
		}
	}else if(notificationData.isRuleApprovalRequest) {
		if((notificationData.isApprove || notificationData.isReject || notificationData.isDelete) && notificationData.status != null) {
			notificationData.statusStr = Ember.I18n.t(notificationData.status, this);
		} else {
			notificationData.status='';
		}
	}else {
		notificationData.Content=$("<div>"+opm_escapeHTML(notificationData.Content)+"</div>").text();
		if(notificationData.isMSPThresholdNotification) {
			for (var index = 0; index < OPMClient.UserNotificationController.content_notification.length; index++) {
				var notifData = OPMClient.UserNotificationController.content_notification[index];
				if(notifData.isMSPThresholdNotification) {
					OPMClient.UserNotificationController.content_notification.removeAt(index);
					break;
				}
			}
		}
		if(notificationData.Time != undefined) {
			var dt= new Date(notificationData.Time);
			notificationData.formattedDate=dt.format(window.OPM.pattern); //No I18N
		}
	}
	OPMClient.UserNotificationController.content_notification.unshiftObject(OPMClient.UserNotificationStack.create(notificationData));
}

function opm_loadSingleNotificationAPNS(notificationData,flag){
	if(notificationData.MentionedBy==="Post"){
		notificationData.isPost=true;
	}
	else {
		notificationData.isPost=false;
	}
	if(flag!==undefined && flag===false){
		var temp="temp";//No I18N
	}
	else {
		OPMClient.UserNotificationController.set('notifyCount',parseInt(OPMClient.UserNotificationController.get('notifyCount'))+1); //No I18N
		OPMClient.UserNotificationController.set('showNotifyCount',true); //No I18N
	}
	notificationData.isGeneral = true;
	notificationData.Content=$("<div>"+notificationData.Content+"</div>").text();
	if(notificationData.Time != undefined) {
		var dt= new Date(notificationData.Time);
		notificationData.formattedDate=dt.format(window.OPM.pattern); //No I18N
	}
	OPMClient.UserNotificationController.content_notification.unshiftObject(OPMClient.UserNotificationStack.create(notificationData));
}
function opm_loadScheduleNotification(notificationData,flag){

	OPMClient.UserNotificationController.set('notifyCount',parseInt(OPMClient.UserNotificationController.get('notifyCount'))+1); //No I18N
	OPMClient.UserNotificationController.set('showNotifyCount',true); //No I18N
	notificationData.isSchedule = true;
	notificationData.Content=$("<div>"+notificationData.Content+"</div>").text();
	if(notificationData.Time != undefined) {
		var dt= new Date(notificationData.Time);
		notificationData.formattedDate=dt.format(window.OPM.pattern);
	}
	OPMClient.UserNotificationController.content_notification.unshiftObject(OPMClient.UserNotificationStack.create(notificationData));
}

function opm_ShowEnterpriseStatus(prop)
{
	if(OPMClient.ApplicationController.isCentralServer || OPMClient.ApplicationController.isMSPCentral)
	{
		OPMClient.ProbeStatus.set('probeUp',prop.up.length);//No I18n
		OPMClient.ProbeStatus.set('probeDown',prop.down.length);//No I18n
		window.OPM.probeUp=prop.up.length;
		window.OPM.probeDown=prop.down.length;
	}
	else if(OPMClient.ApplicationController.isProbe)
	{
		if(prop.CentralStatus === "Up")//No I18n
		{
			$('.statusDown').hide();
		}
		else{
			$('.statusUp').hide();
		}
		OPMClient.ProbeStatus.set('centralStatus',prop.CentralStatus);//No I18n
		window.OPM.centralStatus=prop.CentralStatus;
	}
	if(window.OPM.isNCMEE) {
		loadNCMProbeList();
	}
}

function opm_ShowEnterpriseErrMsg(prop){
	opm_infoMsgs("errorMsg",prop.errMsg);//No I18N
}

function opm_SetGraphDisplaySettingsUpdated(prop){
    if(prop.isGraphDisplaySettingsUpdated !== undefined && prop.isGraphDisplaySettingsUpdated === "true")
    {
     localStorage.setItem('isGraphSettingsChanged',true);//No I18N
    }
}
var tempOffsetWid = 0;
function liveUpdateAlarmInUIInstantlyJS(prop)
{
	if(prop.isAlertPopupEnabled !== undefined && prop.isAlertPopupEnabled === "true")
	{
		showAlarmInUIInstantlyJS(prop);
	}
	if(OPMClient.ApplicationController.currentPath==="Home.Dashboard.index" || OPMClient.ApplicationController.currentPath==="CCTVSlide.Index" || OPMClient.ApplicationController.currentPath==="index")
	{
		if(prop.entity !== undefined && prop.entity.indexOf('EC_PROBLEM') === 0)
		{
			return;
		}
		var entity = encodeURIComponent(prop.entity);
		var widLength = $('.opm_jqGridUI.liveWidgetRecentAlarms').length;
		if(widLength>0)
		{
			for(var i=0;i<widLength;i++)
			{
				var wId = $($('.opm_jqGridUI.liveWidgetRecentAlarms')[i]).find('table.ut.ut-Grid').attr('id');//No I18N
				prop.ttime = prop.strModTime;
				prop.showHighlightMsg = true;
				if($("#"+wId).length>0){
					var alarmCat = prop.category;
					var alarmSev = prop.severity;

					var widgetCat = $("#"+wId).data("category");
					var widgetSev = $("#"+wId).data("severity");

					if((widgetCat == "All" || widgetCat == alarmCat) && (alarmSev !== undefined && widgetSev !== undefined && widgetSev.indexOf(alarmSev.toString()) > -1))
					{
						var growArr = addUpAlertRowDetails(wId);
						var rowcount = growArr[0];
						var lastrowid = growArr[1];

						if(rowcount >= 10)
						{
							$("#"+wId).jqGrid('delRowData',lastrowid);//No I18N
							$("#"+wId).jqGrid('addRowData',lastrowid,prop,"first");//No I18N
						}
						else
						{
							if(rowcount == 0)
							{
								$("#"+wId).empty().removeClass("gridnodata");
								var dummyDiv = {};
								dummyDiv.entity="";
								$("#"+wId).jqGrid('addRowData',-1,dummyDiv,"first");//No I18N
								$($("#"+wId+" tr")[0]).empty().attr("class","jqgfirstrow");
							}
							$("#"+wId).jqGrid('addRowData',rowcount+1,prop,"first");//No I18N
						}
						if(OPMClient.ApplicationController.currentPath==="Home.Dashboard.index")
						{
							dashcallbackNew(wId);
						}
					}
				}
			}
		}

		if(prop.monDivId !== undefined)
		{
			var widLength = $('.opm_jqGridUI.liveWidgetMonView').length;
			if(widLength>0)
			{
				for(var i=0;i<widLength;i++)
				{
					var wId = $($('.opm_jqGridUI.liveWidgetMonView')[i]).find('table.ut.ut-Grid').attr('id');//No I18N
					if($("#"+wId).length>0)
					{
						var statusId = "#"+prop.monDivId;
						if($("#"+wId+" "+statusId)[0] !== undefined)
						{
							var statusClass = "--fault-severity icon-status"+prop.monDivStatus+" icon-statusColorInfo opmToolTipDesc cursorPointer newHeatIcon"; //No I18n
							$($("#"+wId+" "+statusId)).removeAttr("class");
						 	tempOffsetWid = $("#"+wId+" "+statusId)[0].offsetWidth; //This is needed for updating the animation.
							$($("#"+wId+" "+statusId)).addClass(statusClass);
						 	var elemData = $("#"+wId+" "+statusId).data("obj");
							elemData[Ember.I18n.t('webclient.devices.details.status',this)] = alarmStatusStr(prop.monDivStatus); //No I18n
						 	$("#"+wId+" "+statusId).data("obj",elemData);
						}
					}
				}
			}
		}

		if(entity!==undefined && entity!=="" && entity.indexOf("IF_")===0){
			var entityData = entity.split("_");
			if($('.liveWidget i[data-id="'+entityData[entityData.length-1]+'"]')[0] !== undefined)
			{
				$('.liveWidget i[data-id="'+entityData[entityData.length-1]+'"]').removeAttr("class");//No I18N
				tempOffsetWid = $('.liveWidget i[data-id="'+entityData[entityData.length-1]+'"]')[0].offsetWidth; //This is needed for updating the animation.
				$('.liveWidget i[data-id="'+entityData[entityData.length-1]+'"]').addClass("--fault-severity icon-status"+prop.severity+" icon-statusColorInfo opmToolTipDesc cursorPointer newHeatIcon");//No I18N
			}
		}
	}
}
function updateProbeStateInstantlyJS(probeInstallStatus) {
		var probestatus = false;
		if(probeInstallStatus.probeStatus == 'Success'){
			probestatus = true;
		}
		if (window.OPM.isMSPCentral){
		window.OPM.mspCustomerNameList = window.OPM.mspCustomerNameList.map(function(obj) {
			if(obj.CustomerID === probeInstallStatus.CustomerID) {
				var customerStatus = false;
				obj.ProbeInfo = obj.ProbeInfo.map(function(val) {
					customerStatus =  customerStatus || (val.ProbeName == probeInstallStatus.ProbeName ? probestatus : val.ProbeStatus);
					return val.ProbeName == probeInstallStatus.ProbeName ? $.extend({}, val, {'ProbeStatus': probestatus}) : val;  //No I18N
				});
				return $.extend({}, obj, {'CustomerStatus': customerStatus, 'isProbeInstalled': probestatus});  //No I18N
			} else {
				return obj;
			}
		});
		window.OPM.customerNameList = window.OPM.customerNameList.map(function(obj) {
			if(obj.CustomerID === probeInstallStatus.CustomerID) {
				var customerStatus = false;
				obj.ProbeInfo = obj.ProbeInfo.map(function(val) {
					customerStatus =  customerStatus || (val.ProbeName == probeInstallStatus.ProbeName ? probestatus : val.ProbeStatus);
					return val.ProbeName == probeInstallStatus.ProbeName ? $.extend({}, val, {'ProbeStatus': probestatus}) : val;  //No I18N
				});
				return $.extend({}, obj, {'CustomerStatus': customerStatus, 'isProbeInstalled': probestatus});  //No I18N
			} else {
				return obj;
			}
		});
		OPMClient.ApplicationController.set("mspCurrentScopeList",window.OPM.mspCustomerNameList.slice());//No I18N
		}
	if(window.OPM.isRMMCentral) {
		postDisabledProbeStatusToRMM();
		if(window.OPM.selCustomerID == '-1') {
			if(OPMClient.ApplicationController.isRMMProbeNotInstalled) {
				OPMClient.ApplicationController.set("isRMMProbeNotInstalled",!probestatus);//No I18N
			} else {
				OPMClient.ApplicationController.set("isRMMProbeNotInstalled",true);//No I18N
				$.each(window.OPM.customerNameList,function(key,obj) {
					if(obj.isProbeInstalled) {
						OPMClient.ApplicationController.set("isRMMProbeNotInstalled",!obj.isProbeInstalled);//No I18N
					}
				});
			}
		}
		else if(probeInstallStatus.CustomerID == window.OPM.selCustomerID) {
			OPMClient.ApplicationController.set("isRMMProbeNotInstalled",!probestatus);//No I18N
		}
	}
	var viewInstance = OPMClient.__container__.lookup('router:main')._activeViews.MspGettingStarted; //No I18N
	if(viewInstance && viewInstance[0]) { //No I18n
		viewInstance[0].send('probeStatusChanged', probeInstallStatus); //No I18n
	}
}

function showAlarmInUIInstantlyJS(prop)
{
	if(OPMClient.AlarmStackController.freshStart===true){
			OPMClient.AlarmStackController.set('minimize',false); //No I18N
			$(".notify").addClass("maximized");
	}
	OPMClient.AlarmStackController.set('freshStart',false); //No I18N
	var message = prop.message;
	var modTime = prop.strModTime;
	var deviceName = prop.source;
	var deviceDispName = prop.displayName;
	var entity = encodeURIComponent(prop.entity);
	if(entity !== undefined && entity !== null && entity.indexOf('EC_PROBLEM') === 0 && !window.OPM.enableProblems)
	{
		return;
	}

	var severity = "<img src='/images/devices/status"+prop.severity+".gif' /> "+prop.stringseverity; //No I18N
	var severityClass = "status-clear"; //No I18N
	var colors = ['red', 'orange', 'yellow', 'Fuchsia','green'];//No I18N
	var color = colors[4];
	prop.severity = parseInt(prop.severity);
	if(window.OPM.isMSPCentral && prop.EVENTTYPE === 'Websocket connection Lost') { //No I18n
		opm_infoMsgs('infoMsg', message + " " + Ember.I18n.t('webclient.settings.forMoreinfo') + " " + Ember.I18n.t('webclient.general.linktemplate',{link:"https://www.manageengine.com/network-monitoring-msp/faq.html#websocket-error-occurs", linkText: Ember.I18n.t('webclient.nfa.addOnMarketing.clickHere')})); //No I18n
	}
	if (prop.severity === 1)
	{
		severityClass = "status-critical"; //No I18N
		color = colors[0];
	}
	else if (prop.severity === 2)
	{
		severityClass = "status-trouble"; //No I18N
		color = colors[1];
	}
	else if (prop.severity === 3)
	{
		severityClass = "status-attention"; //No I18N
		color = colors[2];
	}
	else if (prop.severity === 4)
	{
		severityClass = "status-down"; //No I18N
		color = colors[3];
	}
	else if (prop.severity === 6)
	{
    	severityClass = "status-info"; //No I18N
	}
	var who = prop.who;

	var category = prop.category;
//	alert(OPMClient.AlarmStackController.content.length);
	var lenOfInstantAlerts = OPMClient.AlarmStackController.content_alarm.length;
//	alert("dataCount: "+OPMClient.AlarmStackController.dataCount);
	var dataCount = OPMClient.AlarmStackController.dataCount + 1;
	//OPMClient.AlarmStackController.pushObject(OPMClient.AlarmStack.create({message:"Time: "+prop.modTime+" - Source: \n"+prop.source+" - Message: "+prop.message}));//No I18N


	var hm_elem = $('.heatmapHolder .heatmapStatus[data-devicename="'+prop.source+'"]');//No I18N
	if(hm_elem.length > 0)
	{
		var hm_status = hm_elem.attr('data-status');//No I18N
		hm_elem.data('obj').Status = prop.stringseverity;//No I18N
		hm_elem.removeClass('--fault-severity severity_'+hm_status).addClass('--fault-severity severity_'+prop.severity).attr('data-status',prop.severity);//No I18N
	}
	opm_bvStatusUpdateDynamic(prop);
	if((window.OPM.currentView.name).indexOf('Maps.ThreeDRacks.ViewRack') !== -1 || (window.OPM.currentView.name).indexOf('Maps.ThreeDMaps.ThreeDMap') !== -1)
	{
		opm_RackStatusUpdateDynamic(prop);
	}


	if(prop.ALARMCODE !== undefined && prop.ALARMCODE.indexOf("IF-") === 0 || prop.ALARMCODE.indexOf("PORT_") === 0 || prop.ALARMCODE.indexOf("IF_") === 0 || prop.ALARMCODE.indexOf("IpslaTrap") === 0)
	{
		if((window.OPM.currentView.name).indexOf('Maps.BusinessView.BVMap.index') !== -1)
		{
			opmBV_getInterfaceAlarmDetails(prop.entity);
		}
	}
	// if (lenOfInstantAlerts > 4)
	// {
	// 	OPMClient.AlarmStackController.content_alarm.removeAt(0);
	// 	OPMClient.AlarmStackController.set("showMoreAlert",true); //No I18N
	// 	OPMClient.AlarmStackController.set("moreCount",dataCount-5); //No I18N
	// }
	//var dwrHeight = $("#col4").height();
	//setwidthforDWR(dwrHeight);

	if(prop.ALARMCODE !== undefined && prop.ALARMCODE.indexOf("PROBE_DOWN_") === 0) {
		$("#eeProbeSelect option:contains('" + deviceDispName + "')").attr("disabled",true); //No I18N
	}

	if(prop.ALARMCODE !== undefined && prop.ALARMCODE.indexOf("PROBE_UP_") === 0) {
		$("#eeProbeSelect option:contains('" + deviceDispName + "')").attr("disabled",false); //No I18N
	}

	if((category === "SelfMonitoring" || category === "MailServer") && OPMClient.ApplicationController.isOPUtils){
		OPMClient.AlarmStackController.content_alarm.pushObject(OPMClient.AlarmStack.create({"message":prop.message, "source":prop.displayName, "modtime":prop.strModTime,"severityClass":severityClass})); //No I18N
	}else{
		OPMClient.AlarmStackController.content_alarm.pushObject(OPMClient.AlarmStack.create({"message":prop.message, "source":prop.displayName, "modtime":prop.strModTime, "alarmUrl":window.OPM.v3ClientURL+"alarms/details/"+prop.id,"severityClass":severityClass})); //No I18N
	}

	OPMClient.AlarmStackController.set('currentNotifyClass',severityClass); //No I18N
	setTimeout(function(){opm_notify();},100);

	OPMClient.AlarmStackController.set("showCount",true); //No I18N
	OPMClient.AlarmStackController.set("dataCount",dataCount); //No I18N
	OPMClient.AlarmStackController.set("showClose",true); //No I18N

	var newjson = {"message": message, "displayName":deviceDispName, "category":category, "who": who, "severity":severity, "modTime": modTime, "entity":entity,"deviceName":deviceName}; //No I18N

	if(prop.severity !== 5 && OPMClient.AlarmStackController.alarmPage === "Active")
	{
	   OPMClient.AlarmStackController.set("minimize",true); //No I18N

		var rowLen = jQuery('#Alarms tr').length+1;//No I18N
		var alarmCnt = Number($("#alarmCaption").html().split("(")[1].split(")")[0]);
		$.each(jQuery('#Alarms tr'),function(ind,row)//No I18N
		{
			if(row.id !== "" && row.id === entity)
			{
				jQuery('#Alarms').jqGrid('delRowData',row.id); //No I18N
				alarmCnt = alarmCnt-1;
			}
		});
		alarmCnt = alarmCnt+1;
		jQuery('#Alarms').jqGrid('addRowData',entity,newjson,"first"); //No I18N
		alarmListTitle = Ember.I18n.t('webclient.tab.activealarm',this); //No I18N
		alarmListTitle = alarmListTitle+" ("+alarmCnt+")"; //No I18N
		$("#alarmCaption").html(alarmListTitle);//No I18N

	}
}
function alarmStatusStr(status)
{
	if(status === "1")
	{
		return Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical', this); //No I18n
	}
	else if(status === "2")
	{
		return Ember.I18n.t('webclient.ncm.clientserver.config.severity.Trouble', this); //No I18n
	}
	else if(status === "3")
	{
		return Ember.I18n.t('webclient.ncm.clientserver.config.severity.Attention', this); //No I18n
	}
	else if(status === "4")
	{
		return Ember.I18n.t('webclient.ncm.clientserver.config.severity.ServiceDown', this); //No I18n
	}
	else if(status === "5")
	{
		return Ember.I18n.t('webclient.ncm.clientserver.config.severity.Clear', this); //No I18n
	}
	return status
}
function addUpAlertRowDetails(wId)
{
	var rowcount=0;
	var lastrowid = -1;
	$.each($("#"+wId+" tr.jqgrow"), function(ind, row){
			rowcount++;
			lastrowid = row.id;
	});
	return [rowcount, lastrowid];
}
function showSyslogInUIInstantlyJS(prop)
{
	$('#Syslog:contains('+Ember.I18n.t('webclient.jqgrid.no.data.found',this)+')').text('');
	if($("#Syslog").jqGrid('getDataIDs').length === 0)
	{
		sysLogViewer(prop.last);
	}
	else
	{
	 	jQuery('#Syslog').jqGrid('addRowData',$.jgrid.randId(),prop.last,"first"); //No I18N
		jQuery("#Syslog").trigger('reloadGrid'); //No I18n
	}
}
function setwidthforDWR(dwrHeight)
{
	if(dwrHeight >= 450)
	{
		OPMClient.AlarmStackController.content_alarm.removeAt(0);
		OPMClient.AlarmStackController.set("showClose",true); //No I18N
	}
}
function opm_minimizeAlarmStack(action)
{
	if(action === "close")
	{
		$('.notifyHolder .minMaxNotifications').off('click');
		$('.notifyHolder .minMaxNotifications').toggle(function(){
				btmVal='-'+($('.notifyHolder').outerHeight()-40+'px'); //No I18N
				$('.notifyHolder').addClass('minimized').css({bottom:btmVal},300);
				$(this).removeClass('icon-down-dir').addClass('icon-up-dir');
				$('.notifyContent').hide();
			},function(){
				$('.notifyHolder').removeClass('minimized').css({bottom:'0'},300);
				$(this).addClass('icon-down-dir').removeClass('icon-up-dir');
				$('.notifyHolder header > div > span:first-child').removeAttr('class');
				opm_notify();
			}
		);
		$('.notifyHolder .closeNotifications').click(function(){
			$('.notify').remove();
		});
		OPMClient.AlarmStackController.set("minimize",true); //No I18N
		OPMClient.AlarmStackController.set("showClose",false);	 //No I18N
	}
	else if(action === "open")
	{
		OPMClient.AlarmStackController.set("minimize",false); //No I18N
		OPMClient.AlarmStackController.set("showClose",true);	 //No I18N
	}
}

function opm_initializeAlarmStack()
{
	OPMClient.AlarmStackController.set("content_alarm",[]); //No I18N
	OPMClient.AlarmStackController.set("dataCount",0); //No I18N
	OPMClient.AlarmStackController.set("showMoreAlert",false); //No I18N
	OPMClient.AlarmStackController.set("moreCount",0); //No I18N
	OPMClient.AlarmStackController.set("minimize",false); //No I18N
	OPMClient.AlarmStackController.set("showCount",false); //No I18N
	OPMClient.AlarmStackController.set("showClose",false); //No I18N
}


//notifications
function opm_notify(){
	if(!$('.notifyHolder').hasClass('minimized')){
		$('.notifyContent').show();
		$('.notifyHolder').show();
		$('.notifyHolder .notifyRow').css({height:'58px'});
		notifyRowLngt=$('.notifyHolder .notifyRow').length;
		if(notifyRowLngt<=7){
			notifyHolderHt=(notifyRowLngt*58)+40;
			$('.notifyHolder').css({height:notifyHolderHt+'px'});
		}else{
			notifyHolderHt=($('.notifyHolder .notifyRow').outerHeight()*7)+40;
			$('.notifyHolder').css({height:notifyHolderHt+'px'});
		}
		$('.notifyHolder header > div > span:first-child').removeAttr('class');
	}
}
function opm_loadNewUserNotifications(){
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/dashboard/getUserNotification"); //No I18n
	if(window.OPM.userNotificationCount>0){
		OPMClient.UserNotificationController.set('notifyCount',window.OPM.userNotificationCount); //No I18N
		OPMClient.UserNotificationController.set('showNotifyCount',true); //No I18N
	}
	if(jsonData != undefined) {
		$.each(jsonData, function(i,val){
			showUserNotificationInstantlyJS(val,false);
		});
	if (window.OPM.isNCM) {
		$('#userNotify .userNotifyListHolder .mCSB_container').css('flex-direction', 'column');
	}
	}
}


function opm_createZCRealTimeGraph(divID,graphData,mmaValues)
{
	var xaxis = document.getElementById("widget"+divID).getAttribute("xaxis");
	var yaxis = document.getElementById("widget"+divID).getAttribute("yaxis");
	if (xaxis == null && yaxis == null && OPMClient.InventoryDeviceDetailsController.isIntfTrafficPage)
	{
		xaxis = Ember.I18n.t('webclient.reports.time',this); //No I18N
		yaxis = Ember.I18n.t('webclient.interface.units.bps',this); //No I18N
	}
	if(OPMClient.InventoryDeviceDetailsController.realTimeMonitorFromSnapshot){
		xaxis = Ember.I18n.t('webclient.reports.time',this); //No I18N
		yaxis = OPMClient.InventoryDeviceDetailsController.realtimeParams.yaxis;
	}
	var maxRange = null;
	var minRange = null;
	if(yaxis!==null && (yaxis.toLowerCase().indexOf("utilization")!=-1 || yaxis.toLowerCase().indexOf("percentage")!=-1 || yaxis.indexOf("%")!=-1)){//No I18N
		maxRange = 100;
		minRange = 0;
	}
	if (graphData !== undefined && graphData.length > 0)
	{
		$.each(graphData,function(key,objk)
		{
			var mma = mmaValues[objk.seriesname];
			objk.seriesname = mma.seriesName+" - "+Ember.I18n.t('webclient.reports.tags.min',this)+" : "+mma.minVal+" "+Ember.I18n.t('webclient.reports.tags.max',this)+" : "+mma.maxVal+" "+Ember.I18n.t('webclient.reports.tags.avg',this)+" : "+mma.avgVal;
		});
		var zcObj =
		{
	        id:"widget"+divID, //No I18N
	        type:'line', //No I18N
	        jsonData:graphData,
	        series:"multi", //No I18N
	        height:250,
	        columns:
	        {
	            datatype_1:'time', //No I18N
	            datatype_2:'numeric', //No I18N
	            datatype_3:'ordinal', //No I18N
	            columnname_1:xaxis,
	            columnname_2:yaxis,
	            //columnname_3:'Label', //No I18N
	            timeFormat:'HMS', //No I18N
	            format: {customFormat: function(value, datatype, columnInfo, type, chartObj) {return opm_formatKMBT(value);}},
	            ordinal: {tooltipformat: {customFormat: function(value, datatype, columnInfo, type, chartObj) {return value.split('-')[0]}}} //No I18N
	        },
	        canvas:{title:{show:false,text:""}}, //No I18N
	        axes:
	        {
				rotated: false,
				xaxis: {label: {text: xaxis}},
				yaxis: [{label: {text:yaxis},minRange:minRange,maxRange:maxRange}]
			},
	    	chart:{stacked:false},
	    	legend:{enabled:true,layout:'horizontal'}, //No I18n
	    	tooltip:[0,"{{val(2)}} : {{val(1)}} ({{col(1)}})"], //No I18N
	    	isRealTime:true
		}
		zcObj.consolidatedValues = mmaValues;
		var widgetRTGraph = zChartForRealTime(zcObj);
		opmWidget_RTGraphArr[divID] = widgetRTGraph;
	}
	else
	{
		$("#widget"+divID).html(Ember.I18n.t("webclient.reports.view.nodata",this)); //No data handle //No I18N
		if (OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide") !== -1) { //No data height issue fixed in cctv
			$("#widget"+divID).attr("class","cctvNoDataWidget");
		}
	}
}
function showRealTimeWidgetData(prop)
{
	if($("#widget"+prop.widgetID)!==null)
	{
		if(opmWidget_RTGraphArr[prop.widgetID] === undefined && prop.imageName === undefined)
		{
			if(OpmDashwidgetComponentArray != undefined && OpmDashwidgetComponentArray[prop.widgetID]!==undefined && OpmDashwidgetComponentArray[prop.widgetID].widgetParams!==undefined && OpmDashwidgetComponentArray[prop.widgetID].widgetParams.apiRendered)
			{
				reloadDashWidget(prop.widgetID);
			}

			//To avoid client exception check added
			if(OPMClient.ApplicationController.currentPath.indexOf("RealTimeInterface")!==-1 && prop.widgetID !== undefined)
			{
				$("#zcContain_widget"+prop.widgetID).empty();
				var graphData = [];
				$.each(prop.widgetData,function(key,val)
				{
					graphData.push({seriesname:key,data:val});
				});
				opm_createZCRealTimeGraph(prop.widgetID,graphData,prop.consolidatedValues);
			}
		}
		else if(prop.imageName!==undefined)
		{
			opmWidget_RTGraphArr[prop.widgetID] = prop;
			if(OPMClient.ApplicationController.currentPath.indexOf("RealTimeInterface")!==-1)//No I18N
			{
				if($("#intfRealTimeGraph").children()[1] !== undefined && ($("#intfRealTimeGraph").children()[1].id).indexOf(prop.widgetID) > -1){
					$("#intfRealTimeGraph img").attr("src","data:image;base64,"+prop.encodedImage);//No I18N
				}
			}
			else if(OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide")!==-1)//No I18N
			{
				var imageName = (sessionStorage.getItem("Theme")==="darkTheme")?(prop.darkThemeEncodedImage):(prop.encodedImage);//NO I18N
				$("#widget_holder_"+prop.widgetID+" img").attr("src","data:image;base64,"+imageName);//No I18N
			}
			else if($("#widget_holder_"+prop.widgetID).hasClass("embedView"))
			{
				$("#widget_holder_"+prop.widgetID+" img").attr("src","data:image;base64,"+prop.encodedImage);//No I18N
			}
			else
			{
				$("#widget"+prop.widgetID).find("span").remove();//No I18N
				$("#widget"+prop.widgetID+" img").attr("src","data:image;base64,"+prop.encodedImage);//No I18N
				setDashboardWidgetHeightManually(prop.widgetID,undefined,undefined,undefined,17);
				dashcallbackNew(prop.widgetID);
			}
		}
		else{
			if(!document.hidden){
				updateSeriesDataForRealTime(prop.widgetID,prop);
			}else if(!window.OPM.isEmbed){
				tempArray = Object.keys(opmWidget_RTGraphArr);
				opm_stopRealTimeWidget();
				scheduleRealtimePolling();
			}
		}
	}
	/*
	if(OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide") == -1)
	{
	//adjusting height when no data available by default in realtime
	var widgetId = prop.widgetID;
	var el = $('#li_'+widgetId);
    var node = el.data('_gridstack_node');//No I18N

    if(!node)
    {
    	return;
    }
	var ContentHeight =0;
	for(var i=0;i< $("[data-widgetid='"+widgetId+"']").parent().children().length;i++)
	{
		ContentHeight = ContentHeight + $("[data-widgetid='"+widgetId+"']").parent().children()[i].scrollHeight;
	}
	var grid =$("#cctvViewGrids0").data('gridstack');
	var grid =$("#cctvViewGrids0").data('gridstack');
    var height = Math.ceil((ContentHeight + grid.opts.verticalMargin) / (grid.cellHeight() + grid.opts.verticalMargin));
    height = height + 3;
    var x = node.x
	var y = node.y
	var width = node.width;
	if(ContentHeight < 100)
       {
       		grid.update($( $("#"+$(node.el[0])[0].id)[0]),x,y,width ,height+3);
       }else{
       		grid.update($( $("#"+$(node.el[0])[0].id)[0]),x,y,width ,height);
       }
   }
	*/
}
function scheduleRealtimePolling(){
	var self = OPMClient.ApplicationController;
	clearTimeout(self.get('timeoutConst'));
	self.set('timeoutConst',undefined);//No I18N
	if(!document.hidden){
		$.each(tempArray,function(index,widgetId){
			setTimeout(function(){
				if(OPMClient.ApplicationController.currentPath.indexOf('CCTVSlide') > -1){
					OPMClient.CCTV.CCTVLoadSlideOneByOne(widgetId,'refresh');//No I18N
				}else if('Inventory.Device.RealTimeInterface' === window.OPM.currentView.name){//No I18N
					opm_emberViewRerender(window.OPM.currentView.name);
				}else{
					reloadDashWidget(widgetId);
				}
			},index*500);
		});
		tempArray = [];
		return;
	}else{
		self.set('timeoutConst',setTimeout(function(){//No I18N
			scheduleRealtimePolling();
		},1000));
	}
}
function updateSeriesDataForRealTime(widgetID,jsonData)
{
	var chartdata = opmWidget_RTGraphArr[widgetID].seriesdata;
	if(chartdata !== null)
	{
	    var index = 0;
	    var dataPoints = [];
	    var dataIndex = [];
	    chartdata.forEach( function(series)
	    {
        	var instanceNameAlone = series.seriesname.split(' -')[0];
        	if(jsonData.widgetData[instanceNameAlone] !== undefined)
    		{
        		var obj = jsonData.widgetData[instanceNameAlone][0];
				var val1 = obj[0];
				var val2 = obj[1];
				dataPoints.push([val1,val2]);
    			dataIndex.push(index);
			}
            index++;
	    });
		if(dataPoints.length > 0)
		{
			
			opmWidget_RTGraphArr[widgetID].pushDataPoint(dataIndex,dataPoints,jsonData.clearTime);
			$.each(chartdata,function(key,objk)
			{
				var seriesname = objk.seriesname.split(' -')[0]; //No I18N
				var mma = jsonData.consolidatedValues[seriesname];
				objk.seriesname = seriesname+" - "+Ember.I18n.t('webclient.reports.tags.min',this)+" : "+mma.minVal+" "+Ember.I18n.t('webclient.reports.tags.max',this)+" : "+mma.maxVal+" "+Ember.I18n.t('webclient.reports.tags.avg',this)+" : "+mma.avgVal; //No I18N
			});
			opmWidget_RTGraphArr[widgetID].redraw();
		}
	}  
}
function opm_clearRealTimeData(widgetID,removeData)
{
    $.each(removeData,function(k,xTime)
    {
        var zChart = opmWidget_RTGraphArr[widgetID];
        $.each(zChart.seriesdata,function(index,series)
        {
            $.each(series.data[0],function(n,arr)
            {
                if(arr !== undefined && arr[0] === xTime)
                {
                    series.data[0].splice(n,1);
                }
            });
            zChart.updateScale(series,"x");//No I18N
            zChart.updateScale(series,"y");//No I18N
        });
    });
}
function getBvList()
{
    var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/businessview/getBusinessView');//No I18N
    return list;

}

function opm_stopRealTimeWidgetDelete(widgetID)
{
	if (Object.keys(opmWidget_RTGraphArr).indexOf(widgetID) !== -1)
	{
		if (window.OPM.isEmbed)
		{
			if(window.OPM.Embedtype === 'cctv')
			{
				opm_ajaxPostMethod('/embedWidget?type=cctv&cctvID='+window.OPM.cctvID+'&authKey='+window.OPM.authKey+'&widgetID='+window.OPM.widgetID+"&methodCall=stopRealTimeGraphs&wsId="+sessionStorage.getItem("wsId")); //No I18n
			}
			else
			{
				opm_ajaxPostMethod('/embedWidget?type='+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+'&widgetID='+window.OPM.widgetID+"&methodCall=stopRealTimeGraphs&wsId="+sessionStorage.getItem("wsId")); //No I18n
			}
		}
		else
		{
			var data = {"widgetID":widgetID,"wsId":sessionStorage.getItem("wsId")};//No I18n
			opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/dashboard/stopRealTimeGraphs',data); //No I18n
		}
		delete opmWidget_RTGraphArr[widgetID];
	}
}

function opm_stopMonViewWidgetDelete(widgetID)
{
	if(Object.keys(opmWidget_MonViewArr).indexOf(widgetID) !== -1)
	{
		var data = {"monitorViewGraphs":"true","widgetID":widgetID,"wsId":sessionStorage.getItem("wsId")};//No I18n
		opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/dashboard/stopRealTimeGraphs',data); //No I18n
		delete opmWidget_MonViewArr[widgetID];
	}
}

function opm_initializeColorPicker(pickColor,id){
	if(pickColor===undefined || pickColor==="undefined" || pickColor == ""){
		pickColor="#2c6cd2"; //No I18N
	}
	var divId='colorPickerInput'; //No I18N
	if(id!==undefined){
		divId=id;
	}
	$(".colorPreview").css('background-color',pickColor);//No I18N
	$(".colorPreview").attr('data-bgColor',  pickColor);
	$('#'+divId).ColorPicker({
	eventName:'click', //No I18N
	color: pickColor,
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		$('#colorSelector div').css('backgroundColor', '#' + hex);
		$('.colorPreview').css('backgroundColor', '#' + hex);
		$('#cp_HexValue').val("#"+hex);
	}
	});
}

function opm_initializeColorPickerNew(pickColor,id){
	if(pickColor===undefined || pickColor==="undefined"){
		pickColor="#2c6cd2"; //No I18N
	}
	$('#'+id+'Preview').css('background-color', pickColor);
	$('#'+id+'Preview').attr('data-bgColor',  pickColor);
	var divId='colorPickerInput';//No I18N
	if(id!==undefined){
		divId=id;
	}
	$('#'+divId).ColorPicker({
	eventName:'click', //No I18N
	color: pickColor,
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		$('#'+id+'Preview').css('background-color', '#' + hex);
		$('#'+id+'Preview').attr('data-bgColor', '#' + hex);
		$('#'+id+'_value').val('#'+hex);
		if(id === "bv_canvasBGColor")
		{
			$('#'+id+'_value').val("#"+hex);//No I18N
			setBVCanvasBGColor('#BVMapBGImg',"#"+hex);//No I18N
		}
	}
	});
}

function opm_allinitializeColorPicker(pickColor){
	if(pickColor===undefined || pickColor==="undefined"){
		pickColor="#2c6cd2"; //No I18N
	}
	$('#allcolorPreview').css('background-color', pickColor);
	$('#allcolorPreview').attr('data-bgColor',  pickColor);
	$('#allcolorPickerInput').ColorPicker({
	eventName:'click', //No I18N
	color: pickColor,
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		$('#allcolorSelector div').css('backgroundColor', '#' + hex);
		$('#allcolorPreview').css('backgroundColor', '#' + hex);
		$('#allcp_HexValue').val("#"+hex);
		if(OPMClient.BVMapDetailsController.isJointBV)
		{
			changeLabelSettingsJointMap();
		}
	}
	});
}

function opm_uploadBgImg(fileName)
{
	var frmData = new FormData();
	var loginImg = document.getElementById(fileName).files[0];

	if (loginImg === undefined)
	{
		alert(Ember.I18n.t('webclient.settings.bgsettings.uploadimg',this));  //No I18N
		return false;
	}

	var bgImg = $("#"+fileName)[0].files[0];//No I18N
	if(bgImg !== undefined && bgImg !== null)
	{
		var mimeType=bgImg.type;
		if(mimeType.split('/')[0]!=='image'){
			alert(Ember.I18n.t('webclient.settings.uploadproperimg',this)); //No I18N
			return false;
		}
	}
	frmData.append("bvImage",loginImg); //No I18N
	var url = window.OPM.apiUrlPattern + '/businessview/uploadBusinessViewBG';//No I18N
	var success = opm_ajaxMultiPostRequest(url,frmData);

	 if(success)
    {
    	showMessage(success);
    	if(success.result)
   		{
   			$('#bvBGImage,#bv_customBGImg').val('');
    		opm_loadBVImagesList();
    	}

    }
}
function opmMoreList(){
	rowLength=$('.opmMoreList .list').outerWidth();
	rowChild=$('.opmMoreList .list li').length;
	rowLimit=rowChild*160;
	if(rowLength<rowLimit){
		rowLength=rowLength-130;
		for(i=1;i<=rowChild;){
			rowCol=i*160;
			if(rowCol>rowLength){
				i=i-1;
				break;
			}
			i++;
		}
		moveCount=rowChild-i;
		$('.opmMoreList .list li').slice(-moveCount).appendTo('.opmMoreList .more ul');
		$('.opmMoreList .more').css({display:'block'});
	}

	$('.opmMoreList li').click(function(){
		$(this).parent().parent().parent().find('li').removeClass('active');
		$(this).addClass('active');
		if($(this).parent().parent().hasClass('more')){
			$('.opmMoreList .list li:last-child').appendTo($('.opmMoreList .more ul'));
			$(this).appendTo($('.opmMoreList .list ul'));
			$(".opmMoreList .more li").sort(sort_li).appendTo('.opmMoreList .more ul');
		}
	});
}

function opm_goToSummaryPage(type,name)
{
	$('body').removeClass('deviceMenuSlideIn');
	 $(".ui-tooltip").remove();//No I18n
	var reDirectUrl = "Inventory/Snapshot/MonitoringDevice/"+name; //No I18N

	if(type === "NetFlow"){
		//reDirectUrl = "NFAInventory/Interface/"+name+"/interface/SummaryReport"; //No I18N
		reDirectUrl = "Inventory/Snapshot/FlowInterface/"+name; //No I18N
	}
	else if(type === "Interface")
	{
		reDirectUrl = "Inventory/Snapshot/MonitoringInterface/"+name; //No I18n
	}
	else if(type === "Rack")
	{
	        reDirectUrl = "Maps/ThreeDRacks/View/"+name; //NO I18N
	}
	else if(type === "Floor")
	{
		reDirectUrl = "Maps/ThreeDMaps/"+name; //NO I18N
	}
	else if(type === "UCS")
	{
		reDirectUrl = "UCS/Device/"+name+"/Summary"; // No I18n
	}
	else if(type === "IPSLAVoIP" || type === "IPSLAWAN" || type === "IPSLAVideo")
	{
		reDirectUrl = "Inventory/Snapshot/"+type+"/"+name; // No I18n
	}

	location.href = window.OPM.apiclientUrl+reDirectUrl;
}


function opm_getjsonStatusMsg(jsonData)
{
	var returnBoo = "";
	if(jsonData.result !== undefined || jsonData.error !== undefined)
	{
		if(jsonData.result !== undefined)
		{
			returnBoo = jsonData.result.message;
		}
		if(jsonData.error !== undefined)
		{
			returnBoo = jsonData.error.message;
		}
	}
	else if(jsonData.error !== undefined)
	{
		if(jsonData.error !== undefined)
		{
			returnBoo = jsonData.error.message;
		}
	}
	else
	{
		 returnBoo = "";
	}
	return returnBoo;
}
//function handleUserConnectivity(prop)
//{
//	//console.log(prop);
//		prop.APName=prop.APName.replace(/(RestRoom)|(Tollet)|(Toilet)/g,'');
//		var trapDate= new Date(parseInt(prop.Time));
//
//	//Recent Users List
//	if(prop.AccountId!==undefined && prop.AccountId!=="" && prop.AccountId!=="null" && enduserListObj[prop.AccountId]!==undefined){
//		if(OPMClient.EndusersListController.recentUsers.length>500){
//			OPMClient.EndusersListController.set('recentUsers',[]); //No I18N
//		}
//		OPMClient.EndusersListController.recentUsersHolder.pushObject({AccountId:prop.AccountId, trapTime:prop.Time, apName:prop.APName ,userObj:enduserListObj[prop.AccountId]});
//		// if(!$('.recentUsersList').is(':hover')){
//		// 	OPMClient.EndusersListController.recentUsers.pushObject({AccountId:prop.AccountId, trapTime:prop.Time, apName:prop.APName ,userObj:enduserListObj[prop.AccountId]});
//		// }
//	}
//
//		//Track user Map View
//		if($('#gmapsView.endUsersMapView').length>0){
//			var obj=enduserListObj[prop.AccountId];
//			var objName = enduserListObj[prop.AccountId]!==undefined?enduserListObj[prop.AccountId].DISPLAYNAME:prop.IPAddress;
//			if(prop.AccountId==="null"){
//				obj={DISPLAYNAME:prop.IPAddress,ACCOUNTID:0};
//				objName=prop.IPAddress;
//			}
//			if(obj===undefined){
//				obj={DISPLAYNAME:prop.IPAddress,ACCOUNTID:"N/A"}; //No I18N
//			}
//			var apName = prop.APName.replace(/(RestRoom)|(Tollet)|(Toilet)/g,'');
//			obj.IMAGE = obj.IMAGE !== undefined?obj.IMAGE:'/apiclient/fluidicv2/img/samples/images/endUser/User-Icon.png'; //No I18n
//				if(prop.Latitude!==undefined && prop.Latitude!=="" && prop.Longitude!==undefined && prop.Longitude!==""){ //&& (prop.AccountId===1484 || prop.AccountId==='1484' || prop.AccountId===1877 || prop.AccountId==='1877' || prop.AccountId===1623 || prop.AccountId==='1623' || prop.AccountId===1913 || prop.AccountId==='1913' || prop.AccountId===25 || prop.AccountId==='25' || (obj.DEPARTMENT!==undefined && obj.DEPARTMENT==="OpManager"))){
//					loadUserMapAnimation(obj,objName,apName,prop.Latitude,prop.Longitude);
//				}
//		}
//
//		//UserMapsView
//		var apFlag = false;
//		if(OPMClient.EndUsersMapController.apFilter==="All" || OPMClient.EndUsersMapController.apFilter==="all" || OPMClient.EndUsersMapController.apFilter.length===0){
//			apFlag = true;
//		}
//		else{
//			$.each(OPMClient.EndUsersMapController.apFilter,function(i,val){
//				if(val===prop.APName){
//					apFlag=true;
//				}
//			});
//		}
//		if($('#blipView.endUsersMapView').length>0 && apFlag){
//			var obj={};
//			if(prop.AccountId==="null"){
//			obj={DISPLAYNAME:prop.IPAddress,ACCOUNTID:"N/A"}; //No I18N
//			}
//			else{
//				obj=enduserListObj[prop.AccountId];
//			}
//			if(obj===undefined){
//				obj={DISPLAYNAME:prop.IPAddress,ACCOUNTID:"N/A"}; //No I18N
//			}
//			obj.IMAGE = obj.IMAGE !== undefined?obj.IMAGE:'/apiclient/fluidicv2/img/samples/images/endUser/User-Icon.png'; //No I18N
//			obj.ap=prop.APName;
//			obj.mapDisplay=obj.DISPLAYNAME.split(" ")[0];
//			if(obj.ACCOUNTID==="N/A" || lastUser.indexOf(obj.ACCOUNTID)===-1){
//				lastUser=obj.ACCOUNTID.toString();
//				loadUserAnimation(obj);
//			}
//			if(obj.AccountId!=="N/A" && lastTenUsers.indexOf(prop.AccountId)==-1){
//				lastTenUsers[lastTenUsersIndex]=prop.AccountId;
//				lastTenUsersIndex++;
//				if(lastTenUsersIndex>=5){
//					lastTenUsersIndex=0;
//				}
//
//				if($('.imageResults img').length>=5){
//					$('.imageResults img:last-child').remove();
//				}
//				$('.imageResults').prepend('<img title="'+obj.DISPLAYNAME+'" onclick="goToEndUser(this);" data-userid="'+obj.ACCOUNTID+'" src="'+obj.IMAGE+'">'); //No I18N
//			}
//
//			if(activeUserConnectionsAP[prop.APName]===undefined){
//				activeUserConnectionsAP[prop.APName]=1;
//			}
//			else{
//				activeUserConnectionsAP[prop.APName]++;
//			}
//
//			if(topAPS.length<=2 && (topAPS[0]===undefined || Object.keys(topAPS[0]).indexOf(prop.APName)==-1) && (topAPS[1]===undefined || Object.keys(topAPS[1]).indexOf(prop.APName)==-1) && (topAPS[2]===undefined || Object.keys(topAPS[2]).indexOf(prop.APName)==-1))
//			{
//				var tempObj={};
//				tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//				topAPS[topAPS.length]=tempObj;
//				if(topAPS.length==1){
//					OPMClient.EndUsersMapController.set('firstPoint',prop.APName); //No I18N
//				}
//				else if(topAPS.length==2){
//					OPMClient.EndUsersMapController.set('secondPoint',prop.APName); //No I18N
//				}
//				else if(topAPS.length==3){
//					OPMClient.EndUsersMapController.set('thirdPoint',prop.APName); //No I18N
//				}
//			}
//			else if(topAPS[0]!==undefined && Object.keys(topAPS[0]).indexOf(prop.APName)!==-1){
//				var tempObj={};
//				tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//				topAPS[0]=tempObj;
//				OPMClient.EndUsersMapController.set('firstPoint',prop.APName); //No I18N
//			}
//			else if(topAPS[1]!==undefined && Object.keys(topAPS[1]).indexOf(prop.APName)!==-1){
//				var tempObj={};
//				tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//				topAPS[1]=tempObj;
//				OPMClient.EndUsersMapController.set('secondPoint',prop.APName); //No I18N
//			}
//			else if(topAPS[2]!==undefined && Object.keys(topAPS[2]).indexOf(prop.APName)!==-1){
//				var tempObj={};
//				tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//				topAPS[2]=tempObj;
//				OPMClient.EndUsersMapController.set('thirdPoint',prop.APName); //No I18N
//			}
//			else{
//				if(topAPS[0][Object.keys(topAPS[0])[0]]<activeUserConnectionsAP[prop.APName]){
//					var tempObj={};
//					tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//					topAPS[0]=tempObj;
//					OPMClient.EndUsersMapController.set('firstPoint',prop.APName); //No I18N
//				}
//				else if(topAPS[1][Object.keys(topAPS[1])[0]]<activeUserConnectionsAP[prop.APName]){
//					var tempObj={};
//					tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//					topAPS[1]=tempObj;
//					OPMClient.EndUsersMapController.set('secondPoint',prop.APName); //No I18N
//				}
//				else if(topAPS[2][Object.keys(topAPS[2])[0]]<activeUserConnectionsAP[prop.APName]){
//					var tempObj={};
//					tempObj[prop.APName]=activeUserConnectionsAP[prop.APName];
//					topAPS[2]=tempObj;
//					OPMClient.EndUsersMapController.set('thirdPoint',prop.APName); //No I18N
//				}
//			}
//
//			activeUserConnections=activeUserConnections+1;
//			OPMClient.EndUsersMapController.set('totalCount',activeUserConnections); //No I18N
//			OPMClient.EndUsersMapController.set('totalCountText',activeUserConnections.toLocaleString('en')); //No I18N
//	}
//
//}
/*function systemPerformanceStatus(){
	var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getSystemPerformanceStatus');//No I18N
	showSystemPerformanceStatusJS(response.data);
}*/
function showSystemPerformanceStatusJS(response){
	if(response !== undefined && response !== null && !$.isEmptyObject(response)){//No I18N
		$.each(response,function(key,val){
			$("#"+key).attr("data-title","");//No I18N
			$("#"+key).attr("data-title",val.statusMsg);//No I18N
			$("#"+key).removeClass('severity_5 severity_1 severity_7');//No I18N
			$("#"+key).addClass('severity_'+val.status);//No I18N
		});
	}
}

function opm_setColorsForSeries(data)
{
	var arr = [];
	$.each(data,function(key,val){
		arr.push(severityTxtColor[val.seriesname]);
	});
	return arr;
}
function opm_getColorForSeverity(data,keyName)
{
	var arr = [];
	$.each(data,function(key,val){
		arr.push(severityColorsNFA[String(val[keyName])]);
	});
	return arr;
}

function uploadGMapFile(fileId,fileKeyId,fileConId) {


    var isCheckedAccess = document.getElementById(fileConId).checked;
    var filename = document.getElementById(fileId);
    var file = filename.files[0];
    var data = new FormData();
    data.append('file', file); //No I18N
    var api_key = $("#"+fileKeyId).val();
    var fieldsToValidate = {'empty':[fileKeyId]};//No I18N

    if (file === undefined) {
        alert(Ember.I18n.t('webclient.map.gmaps.uploadvalidfile.message', this)); //NO I18N
        return false;
    }
    else if(trimAll(api_key) === "")
    {
		opm_validateFields(fieldsToValidate);
		return false;
    }
    else if (!isCheckedAccess) {
    	if($("#rec_gMapAcess").is(":visible"))
    	{
    		$(".googleMapTermsServiceError").show();
    	}else{
        	alert(Ember.I18n.t('webclient.consent.confirmation',this)); //NO I18N
        }
        return false;
    } else {
        var isCheckedAccess = document.getElementById(fileConId).checked;
        var filename = document.getElementById(fileId);
        var file = filename.files[0];
        var data = new FormData();
        data.append('mapFile', file); //No I18N
        data.append('consentStatus', isCheckedAccess); //No I18N
        data.append('mapKey', api_key); //No I18N

        	 data.append('isMapUpdated', true); //No I18N

        var fileName = file.name;
        if (fileName === null || fileName === undefined || fileName.indexOf(".html") == -1) {
            alert(Ember.I18n.t('webclient.map.gmaps.uploadvalidfile.message', this)); //NO I18N
            return;
        } else {
            var url = isRegionMap ? window.OPM.apiUrlPattern + '/maps/extractRegionMap' : window.OPM.apiUrlPattern + '/maps/extractGMap'; //NO I18N
            $.ajax({
                type: "POST", //No I18N
                url: url,
                data: data,
                cache: false,
                processData: false,
                contentType: false,
                success: function(jsonData) {
                	if(jsonData.error != undefined){
						opm_infoMsgs("errorMsg",jsonData.error.message); //No I18N
					}
					else if(jsonData.result !== undefined){
						opm_infoMsgs("successMsg",jsonData.result.message); //No I18N
						location.reload();
					}
					else
					{
						opm_infoMsgs("errorMsg",jsonData); //No I18N
					}
                }
            });
        }
    }
}

function ncm_openApprovalRequest(isApprove, reqID, status,isOpUAlarm)
{
	if(isOpUAlarm){
		return;
	}
	if(OPMClient.ApplicationController.isNCM) {
		if(isApprove) {
			status = ('APPROVED' == status) ? 'ApprovedRequests': 'RejectedRequests';//No I18n
			location.href=window.OPM.apiclientUrl+"NCMConfigAutomation/UploadRequests/"+status; //No I18n
		} else {
			location.href=window.OPM.apiclientUrl+"NCMConfigAutomation/UploadRequests/PendingRequests/"+reqID; //No I18n
		}
	}
	else {
		if(isApprove) {
			status = ('APPROVED' == status) ? 'Approved': 'Rejected';//No I18n
			location.href=window.OPM.apiclientUrl+"Settings/NcmConfig/UploadRequests/"+status; //No I18n
		} else {
			location.href=window.OPM.apiclientUrl+"Settings/NcmConfig/UploadRequests/Pending/"+reqID; //No I18n
		}
	}
}

function sendTPIAlert(prop){
	opm_infoMsgs("infoMsg", prop.message);//No I18n
}


function whiteListAlert(prop){
	if(window.OPM.isLicenseExceeded) {
		return;
	}
	if(prop.code == 2500){
		opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.securitysettings.fileintegrity',this)+" : "+Ember.I18n.t('webclient.security.fileintegrity.blacklistedandtamperedfound',this)+" "+Ember.I18n.t('webclient.security.fileintegrity.redirect',this));//No I18N
	}else if(prop.code == 2501){
		opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.securitysettings.fileintegrity',this)+" : "+Ember.I18n.t('webclient.security.fileintegrity.blacklistedfound',this)+" "+Ember.I18n.t('webclient.security.fileintegrity.redirect',this));//No I18N
	}else if(prop.code == 2502){
		opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.securitysettings.fileintegrity',this)+" : "+Ember.I18n.t('webclient.security.fileintegrity.tamperedfound',this)+" "+Ember.I18n.t('webclient.security.fileintegrity.redirect',this));//No I18N
	}else if(prop.code == 2600){
		opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.security.fileintegrity.issueFound',this)+" "+Ember.I18n.t('webclient.security.fileintegrity.redirect',this));//No I18N
	}else if(prop.code == 2601){
		opm_infoMsgs('successMsg',Ember.I18n.t('webclient.securitysettings.fileintegrity',this)+" : "+Ember.I18n.t('webclient.securitysettings.fileintegrity.scannednothreat',this)+" "+Ember.I18n.t('webclient.security.fileintegrity.redirect',this));//No I18N
	}
}

function reloadFileIntegrityRoute(){
	if(window.OPM.currentView.name == "Settings.Basic.SSLSettings.ScanBlackList.index" || window.OPM.currentView.name == "Settings.Basic.SSLSettings.ScanBlackList"){
		emberRouteRefresh("Settings.Basic.SSLSettings.ScanBlackList");//No I18N
		opm_emberViewRerender("Settings.Basic.SSLSettings.ScanBlackList");//No I18N
	}else{
		opm_transitionToParentRoute('Settings.Basic.SSLSettings.ScanBlackList');//No I18N
	}
	opm_closeInfoMsg();
}

function showInstantNotification(prop)
{
	if(prop.length > 0)
	{
		var str = prop.split("%--%")[0]; //No I18N
		opm_infoMsgs("infoMsg",str,undefined,true);//No I18N
		$(".topbandMsgClose").click(function()
		{
			//AutoUpgrade schdeuler (SPHandler.scheduleUpgrade()) only will send message to his function with %--%, thats currently not in use, so commenting
			//removeInstantNotification(prop.split("%--%")[1]);//No I18N
		});
	}
}
function showDeviceMigrationStatus(prop){
	if(prop.migrationStatus ==="completed"){
		if(!$("#DeviceMoveDeviceSelector").is(":visible")){
			$("#DeviceMoveDeviceSelector").show();
		}
		if($("#DeviceMoveProgress").is(":visible")){
			$("#DeviceMoveProgress").hide();
		}
		window.history.back();
	}
	else{
		if($("#DeviceMoveDeviceSelector").is(":visible")){
			$("#DeviceMoveDeviceSelector").hide();
		}
		if(!$("#DeviceMoveProgress").is(":visible")){
			$("#DeviceMoveProgress").show();
		}
		OPMClient.DeviceMigrationController.set("inProgress",prop.inProgress);//No I18N
		OPMClient.DeviceMigrationController.set("toMigrate",prop.toMigrate);//No I18N
		OPMClient.DeviceMigrationController.set("completed",prop.completed);//No I18N
		OPMClient.DeviceMigrationController.set("failed",prop.failed);//No I18N
		OPMClient.DeviceMigrationController.set("completedPercentage",prop.completedPercentage);//No I18N

		$(".discoveryLoading .greenLine").css("width",prop.completedPercentage+"%");//No I18N
		var colNames =
			[
				Ember.I18n.t("webclient.fault.addnotes.device_name",this), //No I18n
				Ember.I18n.t("webclient.map.description",this), //No I18n
				Ember.I18n.t("webclient.admin.users.username",this), //No I18n
				Ember.I18n.t("webclient.admin.scheduledt.startsat",this), //No I18n
				Ember.I18n.t("webclient.admin.scheduledt.endsat",this), //No I18n
				Ember.I18n.t("webclient.devices.details.starttime",this), //No I18n
				Ember.I18n.t("webclient.devices.details.endtime",this), //No I18n
				''
			];
		var colModels =
			[
				{ name: "DEVICENAME", index: "DEVICENAME"}, //No I18n
				{ name: "DESCRIPTION", index: "DESCRIPTION",formatter: function(cellValue, options, rowdata, action) {return Ember.I18n.t(rowdata.DESCRIPTION)+"</div>";}}, //No I18n
				{ name: "USERNAME", index: "USERNAME"}, //No I18n
				{ name: "FROM", index: "FROM"}, //No I18n
				{ name: "TO", index: "TO"}, //No I18n
				{ name: "STARTTIME", index: "STARTTIME"}, //No I18n
				{ name: "ENDTIME", index: "ENDTIME"}, //No I18n
				{ name: "ID", index: "ID",hidden: true, sortable: false} //No I18n
			];
		var defaultOptions = {"searchOption":true,"toggleSearch":false,"rowNumNeeded":false,"retainSelection":true};  //No I18n
		$('#DeviceMoveStatusList').jqGrid('GridUnload');
		opm_loadJQgridWithData('#DeviceMoveStatusList', prop.statusMapList, colNames, colModels, '', '#DeviceMovePager', 'DeviceMoveStatusList',defaultOptions); //No I18N
		$('#DeviceMoveStatusList').jqGrid('setGridWidth', $('#DeviceMoveStatusList').closest(".opmFormHolder").width()-30);
		$("#cb_DeviceMoveStatusList").hide();
	}
}
function showWebSocketMessage(prop){
	opm_infoMsgs('infoMsg',prop.message);//No I18N
}
function showWebSocketSuccessMessage(prop)
{
	if(prop && prop.message){
		opm_infoMsgs("successMsg", prop.message, undefined, true);//No I18N
	}
}
function showWebSocketErrorMessage(prop)
{
	if(prop && prop.message && prop.noClose === "true") {
		opm_infoMsgs("errorMsg", prop.message, {noClose: true}, true); //No I18n
	} else if(prop && prop.message){
		opm_infoMsgs("errorMsg",prop.message, undefined, true);//No I18N
	}
}
function showAPMStartupStatus(jsonData){
	if(window.OPM.isApmPlug){
		if(jsonData !== undefined && jsonData.apmSyncStatus === 'INIT_SYNC_SUCCESS' && jsonData.apmRunningState){//No I18N
			//Getting an autologin issue, if trying to load iframe within 5sec after the APM start.
			setTimeout(function(){
				if(OPMClient.AppsApmDetailsController.apmInstalled){
					OPMClient.AppsApmDetailsController.setProperties({loadAutoLoginIframe:true,showLoading:true,loggedInDate:Number(Date.now())});
				}else{
					OPMClient.AppsApmDetailsController.setProperties({hideInitSync:true});
				}
				if(!window.OPM.isEEProbeSelected && window.OPM.currentView.name !== 'APM.List' && (localStorage.getItem('isFreshAPMInstallation') || window.OPM.apmInstalled !== 'true') && !sessionStorage.getItem('hideAPMStartedMessage')){
					if(window.OPM.isOPMEssential)
 					{
 						opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.opm.apm.plugin.initial.sync.success.info.essential',{param0:window.OPM.opmUrl,param1:Ember.I18n.t('webclient.common.appmanager.servertab.title')}));//No I18N
 					}
 					else
 					{
 					opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.opm.apm.plugin.initial.sync.success.info',{param0:window.OPM.opmUrl,param1:Ember.I18n.t('webclient.common.appmanager.servertab.title')}));//No I18N
 					}					sessionStorage.setItem('hideAPMStartedMessage',true);//No I18N
				}
			},5000);
		}
	}
}

function showAPMRunningStatus(response){
	if(response != undefined){
		if(response.success){
			if(OPMClient.ApplicationController.apmErrorMsg !== undefined && OPMClient.ApplicationController.apmErrorMsg !== ''){ //No I18N
				$('#'+OPMClient.ApplicationController.apmErrorMsg).remove(); //No I18N
				OPMClient.ApplicationController.apmErrorMsg = ''; //No I18N
			}
		}

		if(response.errormsg && window.OPM.isAPMEnabled){
			OPMClient.ApplicationController.set('apmErrorMsg',opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.msg.error.apm.plugin.reachable', this)));//No I18N
		}else if(response.APMStatus ==="Reconnecting" && window.OPM.isAPMEnabled){ //No I18n
			sessionStorage.setItem('isAPMRunning',false);//No I18n
			localStorage.setItem('isAPMRunning',false);//No I18n
			OPMClient.AppsApmDetailsController.isAPMLoggedIn = false;
			OPMClient.AppsApmDetailsController.showLoading = true;
			OPMClient.ApplicationController.set('apmErrorMsg',opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.msg.apm.plugin.restartmsg', this)));//No I18N
		}
	}
}

function showAPMAuthFailure(response){
	if(response != undefined){
		if((sessionStorage.getItem("loadAPMLogin")==false || sessionStorage.getItem("loadAPMLogin") == null || sessionStorage.getItem("loadAPMLogin") ==undefined) &&  (response.isAuthenticationSuccess === false || response.isAuthenticationSuccess === "false")){//No I18N
			OPMClient.ApplicationController.set('apmErrorMsg',opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.msg.error.apm.plugin.login', this)));//No I18N
			sessionStorage.setItem('loadAPMLogin', true);//No I18N
			OPMClient.AppsApmDetailsController.loadAPMLogin = true;
		}else{
			sessionStorage.setItem('loadAPMLogin', false);//No I18N
			OPMClient.AppsApmDetailsController.loadAPMLogin = false;
		}
	}
}

function showServiceEndedMsg()
{
	showSessionEndedMsg();
}

function removeInstantNotification(key)
{
	if (key) {
	$.ajax({
			url: window.OPM.apiUrlPattern + "/admin/delInstantNotification", //No I18N
			data: {"key":key}, //No I18N
			type: 'POST', //No I18N
			success: function(response)
			{

			}
		});
	}
}

function showMailServerStatusInstantly(prop) {
	var message;
	if(prop.statusCode == 1001) {
		message = Ember.I18n.t('webclient.mail.server.delay.alarmMsg'); //No I18N
		if(window.OPM.isAllModulesFullAccessAdmin) {
			message += ' '+Ember.I18n.t('webclient.mail.server.delay.admin'); //No I18N
		}else{
			message += ' '+Ember.I18n.t('webclient.mail.server.delay.otheruser'); //No I18N
		}
	} else if (prop.statusCode == 1002) {
		message = Ember.I18n.t('webclient.mail.server.down.alarmMsg'); //No I18N
		if(window.OPM.isAllModulesFullAccessAdmin) {
			message += ' '+Ember.I18n.t('webclient.mail.server.down.admin'); //No I18N
		}else{
			message += ' '+Ember.I18n.t('webclient.mail.server.down.otheruser'); //No I18N
		}
	} else if (prop.statusCode == 1003) {
	    message = Ember.I18n.t('webclient.mail.server.clear'); //No I18N
	} else if (prop.statusCode == 1004) {
         message = Ember.I18n.t('webclient.mail.server.up'); //No I18N
    }
	opm_infoMsgs(prop.msgType, message);
}

window.onbeforeunload = function () {
	opm_stopRealTimeWidget();
	opm_stopSyslogServer();
};

function opm_stopRealTimeWidget()
{
	if(Object.keys(opmWidget_RTGraphArr).toString() !== "" && !(window.OPM.isOPMEEUnifiedConsoleView&&window.OPM.isCentralServer))
	{
		var data = {"widgetID":Object.keys(opmWidget_RTGraphArr).toString(),"wsId":sessionStorage.getItem("wsId")};//No I18n
		if (window.OPM.isEmbed)
		{
			if(window.OPM.Embedtype === 'cctv')
			{
				opm_ajaxPostMethod('/embedWidget?type=cctv&cctvID='+window.OPM.cctvID+'&authKey='+window.OPM.authKey+'&apiKey=EmbedView&methodCall=stopRealTimeGraphs',data); //No I18n
			}
			else
			{
				opm_ajaxPostMethod('/embedWidget?type='+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+'&apiKey=EmbedView&methodCall=stopRealTimeGraphs',data); //No I18n
			}
		}
		else
		{
			var url = window.OPM.apiUrlPattern + '/dashboard/stopRealTimeGraphs';//No I18N
			if(OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide")!==-1 && (sessionStorage.getItem("Theme")!=="WhiteTheme"))//No I18N
			{
				url += "?Theme=darkTheme";//No i18N
			}
			opm_ajaxPostMethod(url,data);
		}
	}
	opmWidget_RTGraphArr = {};
	if(Object.keys(opmWidget_MonViewArr).toString() !== "")
	{
		var data = {"monitorViewGraphs":"true","widgetID":Object.keys(opmWidget_MonViewArr).toString(),"wsId":sessionStorage.getItem("wsId")};//No I18n
		opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/dashboard/stopRealTimeGraphs',data); //No I18n
	}
	opmWidget_MonViewArr = {};
}


function redirectToSystemPerformance(){
		OPMClient.UserNotificationController.set('showNotifyCount',false); //No I18N
		redirectToOpmDashboard('Overview&quot','System Performance');	//No I18N
}

function opm_gotoWebAlarmMessage(entity,messageID,thisDiv){
		/*$.ajax({
	                url: window.OPM.apiUrlPattern + "/admin/updateNotificationReadStatus?message_id="+messageID, //No I18N
				type: 'POST', //No I18N
				thisDiv:thisDiv,
				success: function(response)
				{
						$(thisDiv).closest('article').removeClass('gray');
				}
		});
		settingsGlobalRoute.transitionTo('Alarms.Alarm.Details',entity);	//No I18N
		setTimeout(function(){
				$('.alarmFullView li.Events').trigger('click');
		},500);*/
}

function opm_hideWebAlarmNotifications(entity, thisDiv) {
	$.ajax({
		url: window.OPM.apiUrlPattern +"/dashboard/hideNotifications?type=webalarm&entity=" + entity, //No I18N
		type: 'POST', //No I18N
		success: function (response) {
			$(thisDiv).parent().remove();
		}
	});
}


// function opm_hideNCMReqNotifications(postId, commentId, thisDiv) {
// }

function opm_hideAllNotifications(type) {
	var url = window.OPM.apiUrlPattern+"/dashboard/hideNotifications"; //No I18N
	var data = {
			"type": type, //No I18N
			"clearAll": true //No I18N
		};
	var result = opm_ajaxPostRequest(url, data);
	if (result.error != null) {
		showMessage(result);
	} else {
		$('#' + type + 'Section article[id!="' + type + 'NotFound"]').remove();
		$('#' + type + 'NotFound').show();
	}
}

function opm_stopSyslogServer()
{
	var requestId =  OPMClient.SettingsAddEditController.syslogRequestId;
	if(requestId !== "")
	{
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/removeRequestId?requestid='+requestId);//No I18N
	}
}

//opm advanced settings slider

function opmAdvancedSettingsIn(){
	if(window.OPM.viewEEProbe) {
		$("#EEGettingStarted").show();
		$('body').addClass('ui-dialog-style2 ui-dialog-hide-title');
		$("#EEGettingStarted").dialog({
			modal: true,
			resizable: false,
			width: 1000,
			title: '',
			closeOnEscape: false
		});
		opm_loadPIKey();
		OPMClient.ApplicationController.set('installationKeyToShowProbe', opm_mask(OPMClient.ApplicationController.installationKey, 4, 4)); //No I18N
	}
}
function opmAdvancedSettingsOut(){
	$("#EEGettingStarted").dialog("close");
	if($('#mobileApplicationPromotion').css('display') && $('#mobileApplicationPromotion').css('display') !== 'block') {
		$('body').removeClass('ui-dialog-hide-title');
	}
}

function opm_goToInstallProbesPage(){
	setTimeout(function(){
		OPMClient.ApplicationController.set('isGlobalVisible',false);//No I18N
		OPMClient.ApplicationController.set('isGlobalVisible',true);//No I18N
		OPMClient.ApplicationController.set('globalSlide','installProbes');//No I18N
		setTimeout(function(){
	opmAdvancedSettingsIn();
		},500);
	},500);
}
function deviceScanNotificationInstantlyJS(prop)
{
	if(!window.OPM.isDemoUser){
		OPUDeviceScanResults(JSON.parse(prop));
	}
}

var kbps_i18n = Ember.I18n.t("webclient.vimonitor.devices.overview.kbps",this); //No I18n
var pageReloadtimer = "";

function opm_autoRefreshPage()
{
	if(window.OPM.autoRefresh !== undefined && String(window.OPM.autoRefresh) === "-1")
	{
		clearInterval(pageReloadtimer);
	}

	if(window.OPM.autoRefresh !== undefined && String(window.OPM.autoRefresh) !== "-1" && Number(window.OPM.autoRefresh) >= 1)
	{
		clearInterval(pageReloadtimer);
		var time = ((window.OPM.autoRefresh*60)*1000);
		pageReloadtimer = setInterval(function(){
			if((window.OPM.currentView.name).indexOf('Home.Dashboard.index') !== -1 && !$('#v2BodyHolder').hasClass('dashboardSlideDivIn-2') && !$('#v2BodyHolder').hasClass('dashboardSlideDivIn-!'))
			{
				var ember_Obj = OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
				if(ember_Obj.context != undefined && ember_Obj.context.dashName === "dashboard.name.apm")
				{
					if(localStorage.getItem("apmPage") !== undefined && localStorage.getItem("apmPage") !== null)
					{
						var apm_Page = localStorage.getItem("apmPage");//No I18N
					}
					else
					{
						var apm_Page = $('.iFrameApmPlugins').attr('data-pagename');
					}

					if(OPMClient.AppsApmDetailsController.apmInstalled && apm_pagesArr.indexOf(apm_Page) == -1)
					{
						loadApmPages(apm_Page);
					}

				}
				else
				{
					//var tmeppLoc = location.href;
					//opm_transitionToParentRoute('Loading');//No I18n
					//setTimeout(function(){ location.href = tmeppLoc},100);
					emberRouteRefresh("Home");//No I18N
				}

			}
			else if((window.OPM.currentView.name === 'Alarms.Alarm.'+OPMClient.AlarmDetailsController.currentPage || window.OPM.currentView.name === 'Alarms.Alarm.Custom') && OPMClient.AlarmDetailsController.currentPage !== "Events" && (window.OPM.currentView.name).indexOf('Alarms.Alarm.Details') === -1)
			{
				opm_emberViewRerender(window.OPM.currentView.name);
			}
		}, time);
	}
}
function opm_showDiskSpaceAlert(msg){
	opm_infoMsgs(msg.status,msg.message);
}
var auditModule = {};
function opm_showDeviceHistory(deviceMOID,timePeriod)
{

	deviceSlideIn(8);
	$('.deviceHistoryTimeFilter .icon-time').off('click');
	$('.deviceHistoryTimeFilter .icon-time').click(function()
	{
		if(!$(this).parent().hasClass('active'))
		{
			$(this).parent().addClass('active').find('ul').css({display:'block'}).animate({opacity:'1',top:'30px'},300); //No I18N
		}
		else
		{
			$(this).parent().removeClass('active').find('ul').css({display:'none',opacity:'0',top:'0'}); //No I18N
		}
	});
	$('.deviceHistoryTimeFilter ul li').click(function(){
		if(!$(this).hasClass('active') && !$(this).hasClass('header') && !$(this).hasClass('activeInfo'))
		{
			$('.deviceHistoryTimeFilter ul li').removeClass('active');
			$(this).addClass('active');
			var timePeriod = $(this).attr("data-value");
			var title = $(this).attr("data-title");
			$('.deviceHistoryTimeFilter .timeFrameTitle').html(title);
			$(".deviceHistoryTimeFilter .activeInfo").html(title);
			loadSnapshotAudit(deviceMOID);
		}
	});
	if(!['FlowDevice','FlowWLC','ConfigDevice'].contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType)){
		if($('#moduleDrpDwn option').size() === 0)
		{
			var apiURL = window.OPM.apiUrlPattern + "/reports/getAuditReportFilters?deviceName="+OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.deviceName+"&deviceSnapshotType="+OPMClient.InventoryDeviceDetailsController.inventorysnapType; //No I18N
			var auditData = opm_getJSONData(apiURL);
			auditModule = auditData.jsonData.modulesList;
		}
		$("#moduleDrpDwn").html("<option></option><option value='-1'> All </option>");
		$.each(auditModule, function(moduleGroup, moduleValues){
			var moduleOptions = "";
			$.each(moduleValues, function(opmModuleID, opmModuleName){
				moduleOptions = moduleOptions + "<option value='"+opmModuleID+"'>"+opmModuleName+"</option>";
			});
			if (moduleOptions !== "") {
				$("#moduleDrpDwn").append("<optgroup label='" + moduleGroup + "'>" + moduleOptions + "</optgroup>");
			}
		});
		$('#moduleDrpDwn').select2({
	    	placeholder:Ember.I18n.t('webclient.Filter.by',this) //No I18N
		});
	}
	loadSnapshotAudit(deviceMOID);
}
function loadSnapshotAudit(deviceMOID)
{
	var timePeriod = $('.deviceHistoryTimeFilter li.active').attr("data-value");
	var urlP = window.OPM.apiUrlPattern + "/reports/getReportsData?reportID=Audit&viewAs=json&moid="+deviceMOID+"&period="+timePeriod+"&deviceSnapshotType="+OPMClient.InventoryDeviceDetailsController.inventorysnapType; //No I18N
	if (OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'MonitoringDevice'){
		var moduleId = $("#moduleDrpDwn").val();
		urlP += (moduleId === "" || moduleId === "-1") ? "":("&moduleId="+moduleId); //No I18N
	}else if(['FlowDevice','FlowWLC'].contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType)){ //No I18N
		urlP += "&RouterID="+OPMClient.InventoryDeviceDetailsController.deviceName; //No I18N
	}
	// else if (OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'ConfigDevice')
	// {
	// 	var ncmModuleID = Object.keys(auditModule) [Object.values(auditModule).indexOf(Ember.I18n.t("webclient.audit.ncm"))];
	// 	urlP += "&moduleId="+ncmModuleID; //No I18N
	// }

	var response = opm_getJSONData(urlP);
	$("#deviceHistoryList").html("");
	var auditReport = response.jsonData[0];
	$(".deviceHistoryTimeFilter .timeFrameTitle").attr("title",auditReport.Time);
	if(auditReport.graphDetails !== undefined)
	{
		if (auditReport.graphDetails.length === 0){
		$("#deviceHistoryList").html("<div class='deviceHistoryListNoData'>"+Ember.I18n.t('webclient.reports.healthreport.nodata',this)+"</div>");
		}
		else{
			$.each(auditReport.graphDetails,function(index,prop){
				prop.USERNAME = escapeHTML(prop.USERNAME);
				prop.TIME = escapeHTML(prop.TIME);
				$("#deviceHistoryList").append("<div class='deviceHistorySingle level-"+prop.LEVEL+"'><div class='left'><b>"+prop.TIME+"</b></div><div class='right'><b>"+escapeHTML(prop.DESCRIPTION)+"</b><span>"+prop.USERNAME+"</span></div></div>");
			});
		}
	}
}
function toggleDisc()
{
	//Discovery Notification Toggle
	$('body').addClass("discoveryStarted");
	var element = '.notifyDiscovery .notifyDiscToggle'; //No I18n
	opm_toggleClickAction(element,function(){
			btmVal='-'+($('.notifyDiscLevel').outerHeight()-40+'px'); //No I18N
			$(element).parent().parent().parent().addClass('minimized');
			$('.notifyDiscLevel').css({bottom:btmVal},300);
			$(element).removeClass('icon-down-dir').addClass('icon-up-dir');
			$('.notifyDiscovery').addClass('minimized').removeClass('maximized');
			// $('.notifyDiscLevel-2 section').hide();
		},function(){
		opm_notifyDisc();
			$(element).parent().parent().parent().removeClass('minimized');
			$('.notifyDiscLevel').css({bottom:'0'},300);
			$(element).addClass('icon-down-dir').removeClass('icon-up-dir');
			$('.notifyDiscovery .nofityDiscRow').css({height:'60px'});
			opm_notifyDisc();
			$('.notifyDiscovery').removeClass('minimized').addClass('maximized');
			$('.notifyDiscovery').show();
			$('.notifyDiscLevel-2 section').show();
		}
	);


	$('.notifyDiscLevel-2 .discoveryLogs_Tabs').click(function(){
		var correntTab = $(this);
		$('.notifyDiscLevel-2 .discoveryLogs_Tabs').removeClass('active');
		correntTab.addClass("active");
		$(".notifyDiscLevel .dis_content").hide();
		$(".notifyDiscLevel .discovery_"+correntTab.attr("data-tab")).show();
	});
}

function opm_notifyDisc()
{
	$('.notifyDiscovery').show();
	$('.notifyAlertInfo').hide();
	//Discovery Notification Height
	if(!$('.notifyDiscovery').hasClass('minimized'))
	{
		$('.notifyDiscovery .nofityDiscRow').css({height:'60px'});
		nofityDiscRow=$('.notifyDiscovery .nofityDiscRow').length;
		if(nofityDiscRow<=6)
		{
			nofityDiscRowHt=(nofityDiscRow*60)+40;
			$('.notifyDiscLevel').css({height:nofityDiscRowHt+'px'});
		}
		else
		{
			nofityDiscRowHt=($('.notifyDiscovery .nofityDiscRow').outerHeight()*6)+80;
			$('.notifyDiscLevel').css({height:nofityDiscRowHt+'px'});
		}
		$('.notifyDiscovery header > div > span:first-child').removeAttr('class');
		$('.notifyDiscovery').removeClass('minimized').addClass('maximized');
	}

}
var discoveryStatus = false;
function showDiscoveryStatusInUI(prop)
{
	//don't show for Oputils, NCM or NFA stadalone product.
	if(window.OPM.isOPUtils || window.OPM.isNCM || window.OPM.isNFA){
		return;
	}
	if(prop.discoveryStatus !== undefined)
	{
		if(prop.discoveryStatus === "Started") //Once discovery starts,The Progress popup should be show.
		{
			localStorage.removeItem("DISCOVERY_POPUP_JUSTONCE"); //No I18n
		}
		discoveryStatus = true;
	}
	//Don't show if close the progress popup
	var showDiscProgress = localStorage.getItem("DISCOVERY_POPUP_JUSTONCE"); //No I18n
	if(showDiscProgress)
	{
		return;
	}
	if(window.OPM.isAuthorized && (discoveryStatus || (prop.discoveredDevicesCount !== undefined && prop.discoveredDevicesCount)))
	{
		opm_notifyDisc();
		$(".notifyDiscStatusBar").css({width:prop.percentage+'%'});
		$(".discover_headerInfo2").html(prop.percentage+"%");
		if (prop.discoveryStatus !== undefined)
		{
			if (prop.discoveryStatus == "Started")
			{
				$('.notifyDiscovery header > div > span:first-child').html(Ember.I18n.t('webclient.discovery.start.infoMsg',this)); //No I18N
				document.getElementById('discoveryLogs_list').innerHTML = ""; //No I18N
				document.getElementById('discoverySummary_dial').innerHTML = ""; //No I18N
				document.getElementById('discNotifyTabs').style.display = 'none'; //No I18N
				document.getElementById('discoverySummary_dial').style.display = 'none'; //No I18N
				document.getElementById('discoveryLogs_container').style.display = 'block'; //No I18N
			}
			else
			{
				$('.notifyDiscovery header > div > span:first-child').html(Ember.I18n.t('webclient.discovery.comp.infoMsg',this)); //No I18N
				document.getElementById('discNotifyTabs').style.display = 'block'; //No I18N
				document.getElementById('discoverySummary_dial').style.display = 'block'; //No I18N
				document.getElementById('discoveryLogs_container').style.display = 'none'; //No I18N
				var discoverFail_count = prop.totalDevicesCount - prop.discoveredDevicesCount;
				var success_percent = Math.round((prop.discoveredDevicesCount/prop.totalDevicesCount)*100);
				var fail_percent = Math.round((discoverFail_count/prop.totalDevicesCount)*100);
				var rowLen = $("#discoveryLogs_list .nofityDiscRow").length;
				if(rowLen < 6)
				{
					$('.notifyDiscLevel').css({height:'440px'}).addClass("noLog_Data");
				}
				var jsonData = {"summarData":[[ Ember.I18n.t("webclient.discovery.success.discovered",this),success_percent],[Ember.I18n.t("webclient.map.others",this),fail_percent]]}//No I18N
				discoverySummaryChartReport(jsonData,[prop.discoveredDevicesCount,prop.totalDevicesCount]);
				//To show logs if the devices is not discovered. //No I18N
				prop.title = escapeHTML(prop.title);
				if(prop.title !== undefined && prop.title !== 'undefined' && prop.title !== ""){
					$("#discoveryLogs_list").append('<div class="discStateInfotxt"><svg class="size16 svgIcon mr-xs" fill="#fff"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#info"/></svg><div>'+prop.title+'</div></div>');
					$("#discoveryLogs_list").addClass('height-full');//No I18N
				}
			}
		}
		else
		{
			prop.title = escapeHTML(prop.title);
			if($('#discoveryLogs_list').hasClass('height-full')){
				document.getElementById('discoveryLogs_list').innerHTML = ""; //No I18N
				$("#discoveryLogs_list").removeClass('height-full');//No I18N
			}
			if (prop.info !== undefined)
			{
				$("#discoveryLogs_list").append("<a class='nofityDiscRow discovery-failed'><div class='title'>"+prop.title+"</div><div class='info'>"+prop.info+"</div></a>");
			}
			else
			{
				$("#discoveryLogs_list").append("<a class='nofityDiscRow discovery-success'><div class='title noInfo'>"+prop.title+"</div></a>");
			}
		}
		if(!$('body').hasClass("discoveryStarted"))
		{
			toggleDisc();
		}
	}
}
function discoverySummaryChartReport(data,countArr,isOPUDHCPPage)
{
	var id1="discoverySummary_dial";//No I18N
	var zcObj = {
		"placeholder": [],//No I18N
		"chartobj": []//No I18N
	};
	var propObj =
		{
			id: id1,
			type: 'pie',//No I18N
			subType: "simpleDonut",//simplePie , semiDount, simpleDonut,gaugeDial,simpleDial//No I18N
			customClass: "opm_pie discoveryStatusDial",//No I18N
			jsonData: data.summarData,
			// series:"multi",//No I18N
			height: 270,
			width: "100%",
			columns: {
				datatype_1: 'ordinal',//No I18N
				datatype_2: 'numeric',//No I18N
				columnname_1: "Label",//No I18N
				columnname_2: "Percentage",//No I18N
				columnname_3: '',
				timeFormat: 'hours',//$("#selectedTime option:selected").data('time')//No I18N
				suffix: "%"//No I18N
			},
			tooltip: [Ember.I18n.t('webclient.map.flash.label', this) + " : {{val(0)}}", Ember.I18n.t('webclient.devices.intftypes.value', this) + " : {{val(1)}}"],//No I18N
			canvas: {
				title: {
					show: false,
					text: ""
				}
			},
			chart: {
				stacked: true
			},
			area: {
				marker: true
			},
			legend: {
				"enabled": true,//No I18N
				colors: ['#46bb7d', '#7f7f7f', '#e8de65'],//No I18N
				"hAlign": "center",//No I18N//No I18N
				"vAlign": "bottom",//No I18N//No I18N
				"fontSize": 12,//No I18N
				"fontColor": "#8b8b8b",//No I18N
				events:{"enabled":false}//No I18N
			},
			bar: {
				rotated: false,
				levelMarker: true
			},
			pie: { innerLabel: false }
		};
	zcObj.chartobj.push(propObj);
	zcObj.placeholder.push(id1);

	zChart(zcObj);
	var lableTitle = [Ember.I18n.t('webclient.discovery.success.discovered'),Ember.I18n.t('webclient.devices.details.avail.total')];//No I18N
	if(isOPUDHCPPage !== undefined){
		lableTitle = [Ember.I18n.t('webclient.script.asso.success'),Ember.I18n.t('webclient.credential.snmp.failed')];//No I18N
	}
	$(".discoveryStatusDial .legseries .series:nth-child(" + (1) + ") span").text(lableTitle[0]+" - "+countArr[0]);	//No I18N
	$(".discoveryStatusDial .legseries .series:nth-child(" + (2) + ") span").text(lableTitle[1]+" - "+countArr[1]);


}


function emberRouteRefresh(page)
{
	for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
		if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name === page){
			OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
		}
	}
}
function getScheduleTime()
{
    var schFrequency = $("#schedule  .active").attr("value");//No I18N
    var SchDate,SchTime,SchMin,SchDay,SchMonthWeekNumber,SchMonthType,SchMonth,hrlyEvery;
    if(schFrequency == 1)
    {
        SchDate = $('#onceDate').val();
        SchTime = $('#onceHour option:selected').val();
        SchMin = $('#onceMin option:selected').val();
    }
    else if(schFrequency == 2)
    {
        SchDate = $('#dailyStartDate').val();
        SchTime = $('#dailyHour option:selected').val();
        SchMin = $('#dailyMin option:selected').val();
    }
    else if(schFrequency == 3)
    {
        SchDay = [];//No I18N
        SchTime = $('#weeklyHour option:selected').val();
        SchMin = $('#weeklyMin option:selected').val();
        $.each($("#weeklyDayCheBox input[type=checkbox]:checked"), function(key, val){
            SchDay.push(val.value);//No I18N
        });
    }
    else if(schFrequency == 4)
    {//No I18N
        SchDay =[];//No I18N
        SchTime = $('#monthlyHour option:selected').val();
        SchMin = $('#monthlyMin option:selected').val();
        SchMonthType = $('input:radio[name="monthlyType"]:checked').val();//No I18N

        if(SchMonthType === '4')//No I18N
        {
            SchDate = $("#monthlyDate option:selected").val();
            scheduleDivUrl += '&schedType='+schFrequency+'&monthlyDate='+SchDate+'&monthlyHour='+SchTime+'&monthlyMin='+SchMin;//No I18N
        }
        else
        {
            SchMonthWeekNumber = $("#monthlyWeekNum option:selected").val();
            var monthlyDayCheBox = $("#monthlyDayCheBox input[type=checkbox]:checked");

            $.each(monthlyDayCheBox, function(key, val){
                SchDay.push(val.value);//No I18N
            });

            if(SchDay === undefined ||SchDay === "" || SchDay.length === 0){//No I18N
                alert(Ember.I18n.t('webclient.admin.daytoschedule',this)); //No I18N
                return false;
            }
        }
    }
    else if(schFrequency == 6)
    {//No I18N
        SchDate = $('#yearlyDate option:selected').val();
        SchTime = $('#yearlyHour option:selected').val();
        SchMin = $('#yearlyMin option:selected').val();
        SchMonth = [];//No I18N

        $.each($("#yearlyMonthCheBox input[type=checkbox]:checked"), function(key, val){//No I18N
            SchMonth.push(val.value);//No I18N
        });

        if(SchMonth === undefined ||SchMonth === "" || SchMonth.length === 0){//No I18N
            alert(Ember.I18n.t('webclient.admin.monthtoschedule',this)); //No I18N
            return false;
        }
    }
    else if(schFrequency == 7)
    {//No I18N
        SchDate = $('#hrlyDate').val();
        SchTime = $('#hrlyHour option:selected').val();
        SchMin = $('#hrlyMin option:selected').val();
        hrlyEvery = $('#hrlyEvery option:selected').val();
    }
    var JsonData ={};
    JsonData.SchDate = SchDate;
    JsonData.SchTime = SchTime;
    JsonData.SchMin = SchMin;
    JsonData.hrlyEvery = hrlyEvery;
    JsonData.SchMonth = SchMonth;
    JsonData.SchDay = SchDay;
    return JsonData;
}
function opm_createAndLoadJQgridWithData(jsonData, colNamesList, colModelList, tableProps)
{
	if (opm_checkIfAValIsValid(tableProps) && opm_checkIfAValIsValid(tableProps.tableDetails))
	{
		var mainDiv = tableProps.tableDetails.mainDiv; //No I18N
		var prefix = tableProps.tableDetails.prefix; //No I18N
		if (prefix != undefined && prefix != "") {prefix = prefix+"_"; } //No I18N
		if (tableProps.customTitle != undefined)
		{
			var leftContentTitle = tableProps.customTitle.leftContent; //No I18N
			var rightContentTitle = tableProps.customTitle.rightContent; //No I18N
			var customTitleClass = tableProps.customTitle.divClass; //No I18N
			if (leftContentTitle != undefined || rightContentTitle != undefined)
			{
				if (mainDiv != undefined && mainDiv != "") //No I18N
				{
					var mainDivElement = document.getElementById(mainDiv);
					var titleDivElem = document.createElement("div"); //No I18N
					titleDivElem.setAttribute("id",prefix+"JQ_Title"); //No I18N
					if (customTitleClass != undefined && customTitleClass != "") //No I18N
					{
						titleDivElem.setAttribute("class",customTitleClass); //No I18N
					}
					var h3Elem = document.createElement("h3"); //No I18N
					if (leftContentTitle != undefined && leftContentTitle != "")
					{
//						var h3LeftText = document.createTextNode(leftContentTitle);
						h3Elem.innerHTML = leftContentTitle; //No I18N
					}
					if (rightContentTitle != undefined && rightContentTitle != "")
					{
						var spanRight = document.createElement("span"); //No I18N
						spanRight.style.cssFloat = "right"; //No I18N
//						var h3RightText = document.createTextNode(rightContentTitle);
						spanRight.innerHTML = rightContentTitle; //No I18N
						h3Elem.appendChild(spanRight); //No I18N
					}
					titleDivElem.appendChild(h3Elem);
					mainDivElement.appendChild(titleDivElem);
				}
			}

		}
		var gridTable = ""; //No I18N
		var gridNavigator = ""; //No I18N
		var captionTitle = ""; //No I18N
		var onSelectFunction = ""; //No I18N
		var defaultOption = {};
		var createTable = tableProps.tableDetails.createTable;
		if (createTable)
		{
//			alert(mainDiv+": "+createTable);
			if(mainDiv != undefined && mainDiv != "") //No I18N
			{
				var mainDivElem = document.getElementById(mainDiv);
				var subDivElem = document.createElement("div"); //No I18N

				gridTable = prefix+"JQ_tableList"; //No I18N
				if (tableProps.tableDetails.pagerNeeded != undefined && tableProps.tableDetails.pagerNeeded)
				{
//					alert("Creating pager");
					gridNavigator = prefix+"JQ_Pager"; //No I18N
					var pagerElem = document.createElement("div"); //No I18N
					pagerElem.setAttribute("id",gridNavigator); //No I18N
					subDivElem.appendChild(pagerElem);
				}

				var tableElem = document.createElement("table"); //No I18N
				tableElem.setAttribute("id",gridTable); //No I18N
				var trElem = document.createElement("tr"); //No I18N
				var tdElem = document.createElement("td"); //No I18N
				trElem.appendChild(tdElem);
				tableElem.appendChild(trElem);

				subDivElem.appendChild(tableElem);
				mainDivElem.appendChild(subDivElem);
			}
		}
		else
		{
			if (tableProps.tableDetails.gridTable != undefined) { gridTable = tableProps.tableDetails.gridTable; }
			if (tableProps.tableDetails.gridNavigator != undefined) { gridNavigator = tableProps.tableDetails.gridNavigator; }
		}
		if (tableProps.tableTitle != undefined) { captionTitle = tableProps.tableTitle; }
		if (tableProps.onSelectFunction != undefined) {onSelectFunction = tableProps.onSelectFunction; }
		if (tableProps.defaultOption != undefined) {defaultOption = tableProps.defaultOption; }
		opm_loadJQgridWithData("#"+gridTable, jsonData, colNamesList, colModelList, captionTitle, "#"+gridNavigator, onSelectFunction, defaultOption); //No I18N
	}
}
function opm_loadTimelineChartWithData(divId,jsonData,defaultOptions){
	var tempD3 = d3;
	var availabilityData={};
	//Generating Dynamic Availability Data
   $.each(jsonData,function(key,value)
   {
    var availData= value.split(",");
    if(availabilityData[availData[0]]===undefined){
    	var tempArray = [];
    	tempArray.pushObject({"starting_time": availData[1], "ending_time": availData[2]});
    	var tempAvailObj={};
    	tempAvailObj.state=availData[0];
    	tempAvailObj.times=tempArray;
    	availabilityData[availData[0]]=tempAvailObj;
    }
    else{
    	availabilityData[availData[0]].times.pushObject({"starting_time": availData[1], "ending_time": availData[2]});
    }
   });
   var availabilityDataArr = [];
   $.each(availabilityData, function(i,item){
   	availabilityDataArr.pushObject(item);
   });

   //Setting Color Ranges
   var colorRange=[];
   var colorDomain=[];
   $.each(defaultOptions.colorScale, function(i,item){
   	colorDomain.push(i);
   	colorRange.push(item);
   });
   var colorScale_generated = tempD3.scaleOrdinal().range(colorRange).domain(colorDomain);

   //Display type selection [rect (or) circle]
   var displayFinal="";
	if(defaultOptions.displayType!==undefined && defaultOptions.displayType!==""){
		displayFinal=defaultOptions.displayType;
	}
	else{
		displayFinal="rect"; //No I18N
	}

	//Default TickFormat Option
	var tickMe={
		  format: d3.timeFormat("%H"), //No I18N
		  tickTime: d3.timeHours,
		  tickInterval: 1,
		  tickSize: 6
		};
	if(defaultOptions.tickOptions!==undefined && defaultOptions.tickOptions!==""){
		tickMe = defaultOptions.tickOptions;
	}

	//Default Click Funtion
	var defaultClickOnGrid = function(d, i, datum){
		var d_start = new Date(parseInt(d.starting_time));
		var d_end = new Date(parseInt(d.ending_time));
		var finalMsg="<b>"+Ember.I18n.t('webclient.support.thread.state',this)+": </b>"+datum.state+"<br /><b>"+Ember.I18n.t('webclient.devices.intftypes.start',this)+": </b>"+d_start.toString()+"<br /><b>"+Ember.I18n.t('webclient.devices.intftypes.end',this)+": </b>"+d_end.toString(); //No I18N
   	$("#"+divId+"_svg").tooltip({
      track: true,
      content:finalMsg
    });
	};

   //On Grid Select Options
   var finalGridSelect = function(){};
   if(defaultOptions.onSelectEnabled!==undefined && defaultOptions.onSelectEnabled!==""){
   		if(defaultOptions.onSelectFunction!==undefined && defaultOptions.onSelectFunction!==""){
   		finalGridSelect=onSelectFunction;
   		}
   		else{
   		finalGridSelect = defaultClickOnGrid;
   		}
   }

   var finalGridUnSelect = function(d, i, datum){
   	//$("#"+divId+"_svg").tooltip({ disabled: true });
   };

   //Rendering the Chart
   		  var wid = parseInt($("#"+divId).parent().width());
   		  wid=wid-20;
   		  if(defaultOptions.width!==undefined && defaultOptions.width!==""){
   		  	wid=defaultOptions.width;
   		  }
          var chart = tempD3.timeline().colors( colorScale_generated ).colorProperty('state').mouseover(function(d, i, datum){ finalGridSelect(d, i, datum); }).mouseout(function(d, i, datum){ finalGridUnSelect(d, i, datum); }).tickFormat(tickMe).width(wid); //No I18N
          var svg = tempD3.select("#"+divId).append("svg").attr("width", wid).datum(availabilityDataArr).call(chart); //No I18N

   //Creating ID and title for SVG Tag
   $("#"+divId+" svg").attr('id',divId+'_svg');
   $("#"+divId+" svg").attr('title','Sample Data');


}
function opm_showJQueryTabDivBased(ulId,contentDiv,divToShow,linkToHighlight)
{
	var ulIdElem = document.getElementById(ulId); //No I18N
	if (ulIdElem != undefined)
	{
		var ulIdWithHash = "#"+ulId; //No I18N
		var linkElems = $(ulIdWithHash).children();
		for (var i=0; i<linkElems.length; i++)
		{
			var liElem = linkElems[i];
			var liElemId = liElem.getAttribute("id"); //No I18N
			if (liElemId == linkToHighlight)
			{
				liElem.className = "ui-tabs-active ui-state-active"; //No I18N
			}
			else
			{
				liElem.className = "ui-state-default"; //No I18N
			}
		}
	}
	var contentDivElem = document.getElementById(contentDiv);
	if (contentDivElem != undefined)
	{
		var contentDivWithHash = "#"+contentDiv; //No I18N
		var contentElems = $(contentDivWithHash).children();
		for (var i=0; i<contentElems.length; i++)
		{
			var divElem = contentElems[i];
			var divElemId = divElem.getAttribute("id"); //No I18N
			if (divElemId == divToShow)
			{
				divElem.style.display = "block"; //No I18N
			}
			else
			{
				divElem.style.display = "none"; //No I18N
			}
		}
	}

}

function opm_setDisplayShowHideDiv(divId, display) {
	var divIdwithHash = "#" + divId;
	if (display == 'none') {
		$(divIdwithHash).hide('fast');
	}
	else {
		$(divIdwithHash).show('fast');
	}
	OPMClient.SettingsConfigurationController.set("errorInfoMsg",""); //No I18n
}

function opm_basicSearchEnable(enable)
{
	if(enable)
	{
		$(".ui-search-toolbar").show();
		$("#searchIcon").attr("onclick","opm_basicSearchEnable(false)");
		$("#searchIcon").attr("src","images/searchSelect.jpg");
		if(window.OPM.isOPM) {
			invDeviceJqGridHt();
			invIntfJqGridHt();
		}
	}
	else
	{
		$(".ui-search-toolbar").hide();
		$("#searchIcon").attr("onclick","opm_basicSearchEnable(true)");
		$("#searchIcon").attr("src","images/Search.jpg");
		if(window.OPM.isOPM) {
			invDeviceJqGridHt();
			invIntfJqGridHt();
		}
	}
}
function opm_pingDevice(MainElement,element,deviceName,page,pollerId)
{
	/*$("#pingDeviceDivCnt").empty();
	$.getJSON(window.OPM.apiUrlPattern + "/device/getPingResponse?deviceName="+deviceName,function(response) //No I18N
						{
		if(response.PingResponse !== undefined)
		{
			$("#pingDeviceDivCnt").html("<span style='font-size:12pt;' >"+Ember.I18n.t('webclient.map.PingResults',this)+"</span><br />"+(response.PingResponse.Details).replace(/\n/g, '<br />')); //No I18N
		}
		else
		{
			$("#pingDeviceDivCnt").html(response.error.message);
		}
	});*/
        if(window.OPM.isCentralServer) {
		var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getPingResponse',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
        } else {
		var url = window.OPM.apiUrlPattern + "/device/getPingResponse";//No I18N
        }
		var data = {};
		if(page === "AddDevice" || page === "AddWireless" || page === "Ansible") {
			//url += '?fromAddDevice=true';//No I18N
			data.deviceName = deviceName;
			data.fromAddDevice = "true";//No I18N
		}
		else if(page === "WANLinkSnapshot" || OPMClient.AlarmDetailsController.alarmDetails.category === "WanIP"){
			data.deviceName = deviceName;
			data.fromWANLink = "true";//No I18N
		}
		else
		{
			data.deviceName = encodeURIComponent(deviceName);
		}

		if(page === "AddDevice" && pollerId !== undefined){
			data.pollerID = pollerId;
		}
		var ajaxType = 'POST'; //No I18n
		if(page === "AlarmSnapshotForInfo")
		{
			var url = window.OPM.apiUrlPattern+"/device/getDeviceDiagnosticsInfo"; //No I18n
			var data = {devName:OPMClient.AlarmDetailsController.alarmDetails.source,needAdvancedInfo:true,deviceDownDiagonstic:true,alarmTime:OPMClient.AlarmDetailsController.alarmDetails.modTime};
			ajaxType = 'GET'; //No I18n
		}

		$.ajax(
		{
			url: url,
			type: ajaxType,
			dataType:'json', //No I18n
			data: data,
		//	async:false,
			success: function(response)
			{
				MainElement.removeClass('loading').addClass('success');

				if(response.PingResponse !== undefined)
				{
					content = (escapeHTML(response.PingResponse.Details)).replace(/\n/g, '<br />'); //No I18N
				}
				else if(page === "AddDevice" && response.result !== undefined)
				{
					MainElement.removeClass('loading').addClass('error');
					content = (escapeHTML(response.result.message)).replace(/\n/g, '<br />'); //No I18N
				}
				else if(page === "AlarmSnapshotForInfo" && response.failureReason !== undefined)
				{
					content = (escapeHTML(response.failureReason)).replace(/\n/g, '<br />'); //No I18N
				}
				else
				{
					MainElement.removeClass('loading').addClass('error');
					content = (escapeHTML(response.error.message)).replace(/\n/g, '<br />'); //No I18N
				}

			//	$('body').append("<div class='OpMToolBar dummy' style='top:"+PosY+"px;left:0;opacity:0'><div class='title'>"+title+"</div><div class='content'>"+content+"</div></div>");
				//MaxHt=$('.OpMToolBar.dummy .content').outerHeight();
			//	$('.OpMToolBar.dummy').remove();

			//	$('.OpMToolBar .content').empty().css({'max-height':MaxHt});
				if(element[0] !== undefined && document.getElementById(element[0].id) !== null)
				{
					element.html(content);
				}
				//$('.opmMask').remove();

			}
		});

}

function opm_traceRoute(MainElement,element,deviceName,page)
{
/*
	$("#pingDeviceDivCnt").empty();
	$("#pingDeviceDivCnt").show();
	$.getJSON(window.OPM.apiUrlPattern + "/device/getTraceResponse?deviceName="+deviceName,function(response) //No I18N
						{
		if(response.PingResponse !== undefined)
		{
			$("#pingDeviceDivCnt").html("<span style='font-size:12pt;' >"+Ember.I18n.t('webclient.map.PingResults',this)+"</span><br />"+(response.TraceResponse.Details).replace(/\n/g, '<br />')); //No I18N
		}
		else
		{
			$("#pingDeviceDivCnt").html(response.error.message);
		}
	});*/
	var data = {

	};
	if(page === "WANLinkSnapshot" || OPMClient.AlarmDetailsController.alarmDetails.category === "WanIP"){
		data.fromWANLink = "true";//No I18N
	}
	data.deviceName = encodeURIComponent(deviceName);
	if(window.OPM.isCentralServer) {
	var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getTraceResponse',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
	} else {
	var url = window.OPM.apiUrlPattern + "/device/getTraceResponse";//No I18N
	}
		$.ajax(
		{
			url: url,
			type: 'POST', //No I18N
			dataType:'json', //No I18n
			data: data,
		//	async:false,
			success: function(response)
			{
				MainElement.removeClass('loading').addClass('success');

				if(response.TraceResponse !== undefined)
				{
					content = (response.TraceResponse.Details).replace(/\n/g, '<br />'); //No I18N
				}
				else
				{
					MainElement.removeClass('loading').addClass('error');
					content = escapeHTML(response.error.message);
				}

			//	$('body').append("<div class='OpMToolBar dummy' style='top:"+PosY+"px;left:0;opacity:0'><div class='title'>"+title+"</div><div class='content'>"+content+"</div></div>");
				//MaxHt=$('.OpMToolBar.dummy .content').outerHeight();
			//	$('.OpMToolBar.dummy').remove();

			//	$('.OpMToolBar .content').empty().css({'max-height':MaxHt});

				if(element[0] !== undefined && document.getElementById(element[0].id) !== null)
				{
					element.html(content);
				}
				//$('.opmMask').remove();

			}
		});

}
function redirectToOPMUrlSnapshot(devName, page)
{
	if(page !== undefined && page !== "")
	{
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+devName+"/"+page;	//No I18N
	}
	else
	{
		//location.href = window.OPM.apiclientUrl+"Inventory/Device/"+devName+"/Summary";	//No I18N
		//BalajiG
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+devName;	//No I18N
	}
}
function redirectToNotifprofileReport(profileId,deviceName)
{
	OPMClient.ReportsDetailsController.set("NPprofileId",profileId); //No I18N
	OPMClient.ReportsDetailsController.set("NPdeviceName",deviceName); //No I18N
	OPMClient.ReportsDetailsController.set("fromNotificationProfile",true); //No I18N
	var npReportId = window.npReportId;
	if(OPMClient.ApplicationController.isEEProbeSelected) {
		var reportURL = window.OPM.apiUrlPattern + '/reports/getReportsList?isFavouriteNeeded=true';//No I18N
		var jsonData = opm_ajaxGetResponse(reportURL);
		setReportList(jsonData);
			$.each(SystemReportsList,function(i,obj)
			{
				if(obj.Name === "Notification Profiles Triggered")
				{
				    npReportId = obj.id;
				}
			});
	}
	localStorage.setItem('reportPreFilter', JSON.stringify({deviceName:deviceName,profileId:profileId,time:'thismonth'})); //NO I18n
	goToReportsPageLink(npReportId, 'System'); //NO I18n
}
function redirectTodevDCReport(devName,period)
{
	OPMClient.ReportsDetailsController.set("DCRdevName",devName); //No I18N
	OPMClient.ReportsDetailsController.set("DCRmonName",""); //No I18N
	OPMClient.ReportsDetailsController.set("devPeriod",period); //No I18n
	localStorage.setItem('reportPreFilter', JSON.stringify({deviceName:devName,time:period,pollingObject:'None',fromWidget:true,fromDevWidget:true})); //NO I18n
	goToReportsPageLink(OPMClient.ReportsDetailsController.dcReportId, 'System'); //NO I18n
}
function redirectTomonDCReport(monName,period)
{
	OPMClient.ReportsDetailsController.set("DCRmonName",monName); //No I18N
	OPMClient.ReportsDetailsController.set("DCRdevName",""); //No I18N
	OPMClient.ReportsDetailsController.set("monPeriod",period); //No I18n
	localStorage.setItem('reportPreFilter', JSON.stringify({pollingObject:monName,time:period,fromDevWidget:true})); //NO I18n
	goToReportsPageLink(OPMClient.ReportsDetailsController.dcReportId, 'System'); //NO I18n
}
function redirectToDataCollectionErrorLog(reportId)
{
	goToReportsPageLink(reportId, 'System'); //NO I18n
}
function redirectToMonitor(devName,page,page1) {
	if(page!==undefined && page!=="") {
		if(page1!==undefined && page1!=="") {
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Monitors/AddMonitor/"+page+"/"+page1; //No I18N
		} else {
			if(page === "AddWMI" || page === "AddExchange" || page === "AddMSSQL" || page === "AddAD" || page === "EventLogInterval") {
				location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Monitors/"+page; //No I18N
			} else {
				location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Monitors/AddMonitor/"+page; //No I18N
			}
		}
	} else {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+'/Monitors'; //No I18N
	}
}
function redirectToVmware(page)
{
	/*if(page == 'Associate')//No I18N
	{
		location.href=window.OPM.apiclientUrl+"Settings/Monitors/SubMonitors/vmwareEvents/Associate";//No I18N
	}
	else
	{*/
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/VMWareEvents/"+page;	//No I18N
//	}

}
/* for custom link actions*/
function redirectToCustomLink(devName,page) {
	if(page !== undefined && page !== "")
	{
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/CustomLinks/"+page;	//No I18N
	}
	else
	{
		//location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Summary";	//No I18N
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/CustomLinks";	//No I18N
	}
}
function redirectToCredential(devName,page) {
	if(page !== undefined && page !== "")
	{
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/ReDiscoverDevice/"+page;	//No I18N
	}
	else
	{
		//location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Summary";	//No I18N
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/ReDiscoverDevice";	//No I18N
	}
}
function redirectToInterfaceSnapshot(name, page) {
	if(page !== undefined && page !== "")
	{
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringInterface/"+name+"/"+page; 	//No I18N
	}
	else
	{
		//location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Summary";	//No I18N
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringInterface/"+name;	//No I18N
	}
}

function opm_drawDialChart(elm,val,color) {

if(val !== "NA")
{
	if(Number(val)<0)
	{
		val = 0;
	}
	else if(Number(val)>100)
	{
		val = 100;
	}
}
else if(val === "NA")
{
	val = 0;
}

	var wid = 180;
	var ht = 90;
	$("#"+elm+" svg,#"+elm+" img").remove();
    var svgns = d3.namespaces.svg;
    var chart = document.createElementNS(svgns, "svg:svg");//No I18N
    chart.setAttribute("width", wid);
    chart.setAttribute("height", ht);
    chart.setAttribute("viewBox", "0 0 " + wid + " " + ht);//No I18N

   	var clippath = document.createElementNS(svgns, 'clippath');//No I18N
	clippath.setAttributeNS(null, 'id', 'cut-off-bottom');//No I18N

	r = document.createElementNS(svgns, 'rect');//No I18N
	r.setAttributeNS(null, 'x', '0');//No I18N
	r.setAttributeNS(null, 'y', '0');//No I18N
	r.setAttributeNS(null, 'width', wid);//No I18N
	r.setAttributeNS(null, 'height', '60');//No I18N
	clippath.appendChild(r);
	chart.appendChild(clippath);

	var circle = document.createElementNS(svgns, 'circle');//No I18N
	circle.setAttributeNS(null, 'cx', '90');//No I18N
	circle.setAttributeNS(null, 'cy', '90');//No I18N
	circle.setAttributeNS(null, 'r', '60');//No I18N
	circle.setAttribute("fill", 'transparent');//No I18N
	circle.setAttribute("stroke", color);
	circle.setAttribute("stroke-width", '40');//No I18N
	circle.setAttributeNS(svgns, 'clip-path', 'url(#cut-off-bottom)');//No I18N
	chart.appendChild(circle);

	var line = document.createElementNS(svgns, 'line');//No I18N
	line.setAttributeNS(null, 'x1', '90');//No I18N
	line.setAttributeNS(null, 'x2', '90');//No I18N
	line.setAttributeNS(null, 'y1', '0');//No I18N
	line.setAttributeNS(null, 'y2', '60');//No I18N
	line.setAttribute("stroke", 'rgba(226, 226, 226, 0.8)');//No I18N
	line.setAttribute("stroke-width", '1');//No I18N
	line.setAttributeNS(svgns, 'clip-path', 'url(#line)');//No I18N
	chart.appendChild(line);

    $("#"+elm).prepend(chart);
    $("#"+elm).append("<img src='"+window.OPM.fluidicPath+"img/speedo-meter-needle.png' />");//No I18N

   setTimeout(function(){
	   	Rotdeg=(180/100)*val;
		Rotdeg='rotate('+Rotdeg+'deg)';//No I18N
		$("#"+elm).find('img').css({transform:Rotdeg});//No I18N
	},200);


}
function opm_editRuleEngine(ruleId){
    OPMClient.SettingsTabController.set('ruleId',ruleId);//No I18N
    if(OPMClient.DiscoveryWizardAddEditController.fromDiscoveryRule)
    {
        opm_transitionToTheRoute("Settings.Network.Discovery.EditRule"); //NO I18N
    }
    else
    {
    	location.href = window.OPM.apiclientUrl+"Settings/Discovery/RuleEngine/Edit";//No I18N
    }
}
function opm_editDowntimeSchedule(dtName)
{
	location.href = window.OPM.apiclientUrl+"Settings/Configurations/DowntimeSchedule/Edit";//No I18N
}
function bubbleSort(a)
{
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < a.length-1; i++) {
            if (a[i] > a[i+1]) {
                var temp = a[i];
                a[i] = a[i+1];
                a[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}
function showBannerForUser(prop) {
	var validProps = [];
	for(var i=0;i<prop.length;i++)
	{
		if(prop[i].bannerName==="MobileAppPromotion"){
			if(window.OPM.mobileAppPromotion.showPopup){
				validProps.push(prop[i]);
			}
		}else{
    			if (!(window.OPM.isCentralServer || window.OPM.isProbe || window.isNFADE || window.OPM.isFWADE || window.OPM.language === 'ja_JP' || window.OPM.language === 'zh_CN' || window.OPM.isDemoUser || window.OPM.amsAlert || window.OPM.showASFMsg || window.OPM.isMSPEdition)) {
		        	validProps.push(prop[i]);
			}
		}
	}
	if(validProps.length>0){
        OPMClient.ApplicationController.set('showBannerForUser',prop); //NO I18N
    }
}
function closeBannerforUser(opt,bannerName){
     var reviewdata = {};
    if (opt === 'later') {
        reviewdata.status = 'true';
    } else {
        reviewdata.status = 'false';
    }
    reviewdata.bannerName = bannerName;
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateBannerDetailsForUser", reviewdata); //No I18N
    if(bannerName==="License_Review"){//No I18N
    	$('.review-band').hide();//No I18N
    }if(bannerName==="MobileAppPromotion"){//No I18N
    	$('body').removeClass('ui-dialog-style2 ui-dialog-hide-title');//No I18n
		$("#mobileApplicationPromotion").dialog("destroy");//No I18n
		if(OPMClient.ApplicationController.mobileAppPromotion !== undefined && window.OPM.mobileAppPromotion !== undefined) {
			OPMClient.ApplicationController.set("mobileAppPromotion.showPopup", false); //NO I18N
			window.OPM.mobileAppPromotion.showPopup = false;
		}
    }
}

function closeRMMProbeTour(hide,PageName,MessageId) {
	$('body').removeClass("with-probeTour tour--active");
	OPMClient.ApplicationController.set('hideProbeTour',true);//No I18N
	OPMClient.ApplicationController.set('showRMMProbeTourStatus',false);//No I18N
	if(hide) {
		OPMClient.ApplicationController.set('showRMMProbeTour',undefined);//No I18N
	} else {
		opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser?',{pageName:PageName,msgId:MessageId});//No I18N
	}
}
function playSoundForWebAlarm(prop)
{
	var ping = new Audio(prop.soundFile); //No I18N
	ping.play();
	$('#userNotify').addClass('ring');
	if(prop.Time != undefined) {
		prop.Time = Number(prop.Time);
		opm_loadSingleNotification(prop,true);
	}
}

function opm_fillBvPropsWith(thisDiv){
	var bvPropType = "";
	$("#allDialogBoxContent").empty();
	if(thisDiv===undefined){
		bvPropType="devicePropLink"; //No I18N
		thisDiv="#devicePropLink"; //No I18N
	}
	else{
		bvPropType=$(thisDiv).attr('data-attr-proptype');
	}
	$(".bvPropsMenu").removeClass('ui-tabs-active');
	$(".bvPropsMenu").removeClass('ui-state-active');
	$(".bvPropsMenu").addClass('ui-state-default');
	$(thisDiv).addClass('ui-state-active');
	$(thisDiv).addClass('ui-tabs-active');
	if(bvPropType==="devicePropLink"){
		$("#allDialogBoxContent").html($("#deviceDialogBox").html());
		$("#truncateLabel").prop('checked',true);
		$("#truncateVal").val('15');
		$("#showdeviceLabel").prop('checked',true);
		$('#allDialogBoxContent input[name="deviceIcons"][value="1"]').prop('checked',true);
	}
	else if(bvPropType==="linkPropLink"){
		$("#allDialogBoxContent").html($("#linkDialogBox").html());
		opm_initializeColorPicker();
		$(".colorPreview").css('background-color','#2c6cd2');
		$("#cp_HexValue").val('#2c6cd2');
		//Link props default

			$("#straightLine").css('background','url("/apiclient/fluidicv2/img/bv/dialog_lines_hover.png") no-repeat');//No I18N
			var lineStyle = "1";
			$("#dashedStraightLine").css('background','none');//No I18N
			$("#curvedLine").css('background','none');//No I18N
			$("#dashedCurvedLine").css('background','none');//No I18N

			$( ".linkLineDown" ).click(function() {
				$("#straightLine").css('background','none');//No I18N
			$("#dashedStraightLine").css('background','none');//No I18N
			$("#curvedLine").css('background','none');//No I18N
			$("#dashedCurvedLine").css('background','none');//No I18N
			$(this).css('background','url("/apiclient/fluidicv2/img/bv/dialog_lines_hover.png") no-repeat');//No I18N

			});
			$("#linkLineDownImg img").attr('src','images/bv/straight_line_mc.png');
			$('#lineSize').val("3");//No I18N
			$('#showLinkLabel').prop("checked", true);
	}
	else if(bvPropType==="shortcutPropLink"){
		$("#allDialogBoxContent").html($("#shortcutDialogBox").html());
	}
	else{
		$("#allDialogBoxContent").html("Delete, Move"); //No I18N
	}
}
function opm_showPointer(cellValue, options, rowdata, action)
{
	return "<span class='pointer' tabindex='0' role='link'> "+escapeHTML(cellValue)+"</span>";
}
function browseActions() {
	$('.opmDeviceBrowseBtn').click(function(){
		if(!$(this).hasClass('active')){
			$(this).addClass('active');//No I18N
			$('.opmDeviceBrowseList').css({display:'block'}).animate({opacity:'1',top:'40px'},300);//No I18N
		}else{
			$(this).removeClass('active');//No I18N
			$('.opmDeviceBrowseList').css({display:'none',opacity:'0',top:'0'});//No I18N
		}
	});

	$('body').click(function(e){
		opmDeviceBrowseBtn =$('.opmDeviceBrowseBtn');
		if(opmDeviceBrowseBtn.hasClass('active')){
			if(!$(e.target).closest('.opmDeviceBrowseBtn').length){
				$('.opmDeviceBrowseBtn').removeClass('active');//No I18N
				$('.opmDeviceBrowseList').css({display:'none',opacity:'0',top:'0'});//No I18N
			}
		}
	});
}

function terminalActions() {
	$('.opmDeviceTerminalBtn').click(function(){
			redirectSnapShot('Terminal'); //No I18N
	});

	$('body').click(function(e){
		opmDeviceTerminalBtn =$('.opmDeviceTerminalBtn');
		if(opmDeviceTerminalBtn.hasClass('active')){
			if(!$(e.target).closest('.opmDeviceTerminalBtn').length){
				$('.opmDeviceTerminalBtn').removeClass('active');//No I18N
				$('.opmDeviceTerminalList').css({display:'none',opacity:'0',top:'0'});//No I18N
			}
		}
	});
}
function opm_selectedLayout()
{
	var layOut = OPMClient.Layer2MapDetailsController.layOut;
	$('.layer2Actions div').removeClass('active');
	$('.'+layOut).addClass('active');
}
function reportsValidateCustomTime() {
	if($('#startTimeConf').val()==="" || $('#startTimeConf').val()===undefined) {
		alert(Ember.I18n.t('webclient.admin.archive.timeerr'));//No I18N
		return false;
	}
	if($('#endTimeConf').val()==="" || $('#endTimeConf').val()===undefined) {
		alert(Ember.I18n.t('webclient.admin.archive.timeerr'));//No I18N
		return false;
	}
	if($('#startTimeConf').val()>$('#endTimeConf').val())
	{
		alert(Ember.I18n.t('webclient.stvsendtime.validation',this));//No I18N
		return false;
	}
	if($('#startTimeConf').val()===$('#endTimeConf').val()) {
		if(parseInt($('#startHour option:selected').val())>parseInt($('#endHour option:selected').val())) {
			alert(Ember.I18n.t('webclient.stvsendtime.validation',this));//No I18N
			return false;
		}
	}
	return true;
}
function opm_redirectToMapHomePage()
{
	location.href = window.OPM.apiclientUrl+"Maps/BusinessView";	//No I18N

}
function getAndSetPerformanceMonitors(obj,self)
{
	var url = window.OPM.apiUrlPattern + "/device/getPerformanceMonitorDetails";//No I18N
	// var data = {"name":obj.deviceName,"policyName":obj.policyName,"graphName":obj.graphName,"checkNumeric":"true","pollID":obj.pollID};//No I18N
	var data = {"name":obj.deviceName,"policyName":obj.policyName,"checkNumeric":"true"};//No I18N
	if(obj.pollID !== undefined) {
		data.pollId=obj.pollID;
	}
	if(obj.graphName !== undefined && !obj.graphName.includes(',')) {
    		data.graphName=obj.graphName;
    	}
	if(obj.instanceName !== undefined && obj.instanceName !== "" && obj.graphName !== "stat" && obj.graphName !== "WANLinkMonitor"){//No I18N
		data.instanceName = obj.instanceName;
	}else if(obj.instanceName !== undefined && obj.instanceName !== "" && obj.graphName === "stat"){//No I18N
		data.instance = obj.instanceName;
	}else if(obj.instanceName !== undefined && obj.instanceName !== "" && obj.graphName === "WANLinkMonitor"){//No I18N
		data.instance = obj.instanceName;
	}else if(OPMClient.InventoryDeviceDetailsController.monitorsName==="mssqlMonitors"){//No I18N
		data.instanceName = $('#instanceList').val();//No I18N
	}else if(obj.instanceName === undefined && OPMClient.AlarmDetailsController.alarmDetails.instanceName !== undefined && OPMClient.AlarmDetailsController.alarmDetails.instanceName !== "" && OPMClient.AlarmDetailsController.alarmActionView === "inventoryDeviceMonitorsMonAction"){//No I18N
		data.instanceName = OPMClient.AlarmDetailsController.alarmDetails.instanceName;
	}
	var jsonData = opm_ajaxGetResponse(url,data);
	if(jsonData.monitors.isAtEnabled == undefined)
	{
		jsonData.monitors.AT_NOT_APPLICABLE = true;
	}
	var is_at_enabled = false;
    var at_prefix =  '' ;
	var is_at_enabled = jsonData.monitors.isAtEnabled;
	if(self)
	{
		jsonData.monitors.isResponseTime = (jsonData.monitors.isResponseTime =="true")
		self.set('MonitorDetails',jsonData.monitors);//No I18N
		if(is_at_enabled)
        {
            at_prefix = 'at_';//No I18N
        }
	}
	if($('#monitorHeader')[0] != undefined && OPMClient.SettingsAddEditController.fromAlarmsPage===true)
	{
		$('#monEditHeader').parent().hide();
	}
	if(jsonData.error === undefined)
	{
		OPMClient.DeviceMonitorsActionController.editPerfMonitorDetails = jsonData.monitors;
		$('#monEditHeader').text(jsonData.monitors.DISPLAYNAME); //No I18N
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringURL"){
			$("#graphName").val(deviceBasicDetails.details.urlName);
		}else if(OPMClient.AlarmDetailsController.alarmActionView === "alarmsRespThresholdEdit") { //No I18N
			$("#graphName").val(OPMClient.AlarmDetailsController.alarmDetails.displayName);
		} else{
			$("#graphName").val(jsonData.monitors.DISPLAYNAME);
		}
		$("#monInterval").prop("maxLength","5");
		$("#monInterval").val(jsonData.monitors.interval);
		if(OPMClient.DeviceMonitorsActionController.editPerfMonitorDetails.Protocol === "DATA_INGESTION") {
			$("#monIntervalDiv").remove()
		}
		$("#monUnits").val(jsonData.monitors.YAXISTEXT);
		$("#failureThreshold").val(jsonData.monitors.FAILURETHRESHOLD);
		$("#graphOID").val(jsonData.monitors.oid);
		if(('CLI' === jsonData.monitors.Protocol) && jsonData.monitors.cliIdDisplayName){
			$("#graphOID").val(jsonData.monitors.cliIdDisplayName);
		}
		if(jsonData.monitors.graphType == "tabulardata") { // No I18N
			$("#monUnits").closest(".opmFormCol").hide(); // No I18N
		}
		if(self != undefined){
			self.set('model.multipleOID',false);//No I18N
			if(jsonData.monitors.alternativeOIDs != undefined && Object.keys(jsonData.monitors.alternativeOIDs).length >0){
				setMultipleOID('inventory',jsonData.monitors,self);//No I18N
			}
			self.set('isCustomScriptMonitor', false);//No I18N
			if(jsonData.monitors.Protocol !== undefined && jsonData.monitors.Protocol === "SCRIPT_POLL"){//No I18N
				self.set('isCustomScriptMonitor', true);//No I18N
			}
		}

		$("input[name='perfStoreData'][value='"+jsonData.monitors.sSave+"']").prop('checked',true); // No I18N
		if(jsonData.monitors.numericType !== undefined)
		{
			$("input[name='perfStoreDataType'][value='"+jsonData.monitors.numericType+"']").prop('checked',true); // No I18N
		}

		if(obj.graphName !== null && obj.graphName === "stat"){
			$("#monInterval").attr("disabled",true);
		}else{
			$("#monInterval").attr("disabled",false);
		}

		if(jsonData.monitors.isAdaptiveThresholdsEnabled){
			$("#"+at_prefix+"attentionMsg").val(jsonData.monitors.defaultMessage_AT);
			$("#"+at_prefix+"troubleMsg").val(jsonData.monitors.defaultMessage_AT);
			$("#"+at_prefix+"criticalMsg").val(jsonData.monitors.defaultMessage_AT);
			$("#rearmMsg").val(jsonData.monitors.defaultClrMessage_AT);
		}else{
		$("#"+at_prefix+"attentionMsg").val(jsonData.monitors.defaultMessage);
		$("#"+at_prefix+"troubleMsg").val(jsonData.monitors.defaultMessage);
		$("#"+at_prefix+"criticalMsg").val(jsonData.monitors.defaultMessage);
		$("#rearmMsg").val(jsonData.monitors.defaultClrMessage);
		}

		if(jsonData.monitors.adStoreFilePath!==undefined){
			$('#dbFilePathDiv').show();
			$('#dbFilePath').val(jsonData.monitors.adStoreFilePath);
		}
		else{
			$('#dbFilePathDiv').hide();
		}
		if(jsonData.monitors.xchgStoreLocation!==undefined){
			$('#xchangeLocationDiv').show();
			$('#xchangeLocation').val(jsonData.monitors.xchgStoreLocation);
		}
		else{
			$('#xchangeLocationDiv').hide();
		}
		if(jsonData.monitors.isAdaptiveThresholdsEnabled===undefined)
		{	
			$("#enableATDiv").hide();//No I18N
		}else{
		$("#enableAT").prop("checked",jsonData.monitors.isAdaptiveThresholdsEnabled).change();//No I18N
			$("input[name='perfGrpDataType'][value='"+((jsonData.monitors.deviationType!==undefined && jsonData.monitors.isAdaptiveThresholdsEnabled)?jsonData.monitors.deviationType:2)+"']").prop("checked",true);//No I18N
		}
		if(jsonData.monitors.thresholdSet != undefined)
		{
			$.each(jsonData.monitors.thresholdSet, function(key,vals)
			{
				if(vals.severity == "3")
				{

					if(vals.warningThresholdTextualType != undefined)
					{
						$("#attentionStrType").select2().val(vals.warningThresholdTextualType).trigger("change");//No I18N
						$("#attentionVal").val(vals.warningThresholdTextValue);
						$("#rearmStrType").select2().val(vals.rearmTextualType).trigger("change");//No I18N
						$("#rearmVal").val(vals.rearmTextValue);
					}
					else
					{
						$("#"+at_prefix+"attentionType").val(vals.warningThresholdType);
						$("#"+at_prefix+"attentionVal").val(vals.warningThresholdValue);
						if(!is_at_enabled)
						{
							$("#rearmVal").val(vals.rearmValue);
						}
						if(!is_at_enabled)
						{
							setThesholdValues(vals.warningThresholdType);
						}
					}


					$("#rearmMsg").val(vals.clrMessage);
					$("#"+at_prefix+"attentionMsg").val(vals.warningMessage);
				}
				if(vals.severity == "2")
				{

					if(vals.troubleThresholdTextualType != undefined)
					{
						$("#troubleStrType").select2().val(vals.troubleThresholdTextualType).trigger('change');//No I18N
						$("#troubleVal").val(vals.troubleThresholdTextValue);
						$("#rearmStrType").select2().val(vals.rearmTextualType).trigger("change");//No I18N
						$("#rearmVal").val(vals.rearmTextValue);
					}
					else
					{
						$("#"+at_prefix+"troubleType").val(vals.troubleThresholdType);
						$("#"+at_prefix+"troubleVal").val(vals.troubleThresholdValue);
						if(!is_at_enabled)
						{
							$("#rearmVal").val(vals.rearmValue);
						}
						if(!is_at_enabled)
						{
							setThesholdValues(vals.troubleThresholdType);
						}
					}

					$("#"+at_prefix+"troubleMsg").val(vals.troubleMessage);
					$("#rearmMsg").val(vals.clrMessage);
				}
				if(vals.severity == "1")
				{

					if(vals.criticalThresholdTextualType != undefined)
					{
						$("#criticalStrType").select2().val(vals.criticalThresholdTextualType).trigger("change");//No I18N
						$("#criticalVal").val(vals.criticalThresholdTextValue);
						$("#rearmStrType").select2().val(vals.rearmTextualType).trigger("change");//No I18N
						$("#rearmVal").val(vals.rearmTextValue);
					}
					else
					{
						$("#"+at_prefix+"criticalType").val(vals.criticalThresholdType);
						 $("#"+at_prefix+"criticalVal").val(vals.criticalThresholdValue);
						 if(!is_at_enabled)
						 {
						 	$("#rearmVal").val(vals.rearmValue);
						 }
						 if(!is_at_enabled)
						 {
						 	setThesholdValues(vals.criticalThresholdType);
						 }
					}

					$("#"+at_prefix+"criticalMsg").val(vals.criticalMessage);
					$("#rearmMsg").val(vals.clrMessage);
				}
			});
		}
		if(jsonData.monitors.isAdaptiveThresholdsEnabled){
			if(jsonData.monitors.lowerlimitProps!==undefined)
			{
				$("#lowerLimitType").val(jsonData.monitors.lowerlimitProps.lowerlimitThresholdType).select2().trigger("change");//No I18n
				$("#lowerLimitValue").val(jsonData.monitors.lowerlimitProps.lowerlimitThresholdValue);//No I18n
				$("#upperLimitType").val((jsonData.monitors.lowerlimitProps.lowerlimitThresholdType==="min")?"max":"min").select2().trigger("change");//No I18n
			}
			if(jsonData.monitors.upperlimitProps!==undefined)
			{
				$("#upperLimitType").val(jsonData.monitors.upperlimitProps.upperlimitThresholdType).select2().trigger("change");//No I18n
				$("#upperLimitValue").val(jsonData.monitors.upperlimitProps.upperlimitThresholdValue);//No I18n
				$("#lowerLimitType").val((jsonData.monitors.upperlimitProps.upperlimitThresholdType==="min")?"max":"min").select2().trigger("change");//No I18n
				$("#upperLimitMsg").val(jsonData.monitors.upperlimitProps.upperlimitMessage);//No I18n
			}
		}
		if(obj.instanceName !== "" && obj.instanceName !== "URL" && obj.instanceName !== "Device")
		{
			if(jsonData.monitors.sSave===true || jsonData.monitors.sSave==="true"){
				$("#sSave_true").prop('checked',true);
			}
			else{
				$("#sSave_false").prop('checked',true);
			}

			if(!jsonData.monitors.checkNumeric || jsonData.monitors.checkNumeric === "false")
			{
				$('.perf_NonNumeric').show();
				$('.perf_numeric').hide();
				$('#perfStoreDataTypeDiv').hide();
			}
			var insNames = [
				Ember.I18n.t('webclient.devices.details.instance'),//No I18N
				Ember.I18n.t('webclient.devices.intftypes.95percentile'),//No I18N
				Ember.I18n.t('webclient.action.currVal'),//No I18N
				Ember.I18n.t('webclient.devices.intftypes.min'),//No I18N
				Ember.I18n.t('webclient.devices.intftypes.max'),//No I18N
				Ember.I18n.t('webclient.devices.intftypes.avg')//No I18N
			];
			var instModel = [
				{'name':'displayaName','index':'displayaName'},//No I18N
				{'name':'95th','index':'95th'},//No I18N
				{'name':'lastPolled','index':'lastPolled'},//No I18N
				{'name':'minVal','index':'minVal',width:50},//No I18N
				{'name':'maxVal','index':'maxVal',width:50},//No I18N
				{'name':'avgVal','index':'avgVal',width:50}//No I18N
			];
			var Instancedata = [];
			if(jsonData.statsList !== undefined)
			{
				$.each(jsonData.statsList, function(i,val)
				{
					if(val.instance == "NULL"){
						var  descs= (jsonData.monitors.DISPLAYNAME);
					}else{
						var  descs= (val.instance);
					}
					var moniDispName = "";
					if(descs!=null && descs.length >27)
					{
						moniDispName = (descs.substring(0,24)+"...");//No I18N
					}
					else
					{
						moniDispName = descs;
					}

					if(val.instance == "NULL")
					{
						Instancedata.push({'title':val.instance,'displayaName':moniDispName,'95th':'-','lastPolled':'-','minVal':'-','maxVal':'-','avgVal':'-'});//No I18N
					}
					else
					{
						Instancedata.push({'title':val.instance,'displayaName':moniDispName,'95th':val.percentile,'lastPolled':val.lastPolledValue,'minVal':val.minimumValue,'maxVal':val.maximumValue,'avgVal':val.averageValue});//No I18N
					}
				});
					Ember.run.schedule('afterRender', function(){//No I18N
						opm_loadJQgridWithData("#perfStatTable", Instancedata, insNames, instModel, "", "", "",""); //No I18N
					});
				$('#instanceTable').show();
				$('#perfStatTable').jqGrid('setGridWidth', $('#perfStatTable').closest('.opmFormHolder').width()-60);//No I18n
			}
		}
		if(!jsonData.monitors.checkNumeric || jsonData.monitors.checkNumeric === "false"){//No I18N
			$('.perf_NonNumeric').show();
			$('.perf_numeric').hide();
			$('#perfStoreDataTypeDiv').hide();
		}
		OPMClient.DeviceMonitorsActionController.set('minInterval',jsonData.minInterval);//No I18N
		OPMClient.DeviceMonitorsActionController.set('editMonitorObj',jsonData.monitors);//No I18N
		self.set('model.GRAPHID',jsonData.monitors.GRAPHID);//NO I18N
		OPMClient.InventoryDeviceDetailsController.set("isCFMonAdded", false); //No I18n
		if(jsonData.monitors.customFieldId !== undefined){
			OPMClient.InventoryDeviceDetailsController.set("isCFMonAdded", true); //No I18n
		}
	}else{
		opm_infoMsgs("errorMsg",jsonData.error.message);//No I18N
	}
	observeThresholdChanges('monitors');//No I18N
}
function setThesholdValues(type,page)
{
	if(page !== undefined && page === 'editPerfPage')
	{
		$("#snmpWarnType").val(type).select2();
		$("#snmpTroubleType").val(type).select2();
		$("#snmpErrorType").val(type).select2();
		$('#snmpRearmValue').prop('disabled',false);
	    switch(type)
	    {
	        case "min" : //No I18N
	            $("#snmpRearmType").val("maxEqual").select2(); //No I18N
	            break;
	        case "max" : //No I18N
	            $("#snmpRearmType").val("minEqual").select2(); //No I18N
	            break;
			case "minEqual": //No I18N
	            $("#snmpRearmType").val("max").select2(); //No I18N
				break;
			case "maxEqual": //No I18N
	            $("#snmpRearmType").val("min").select2(); //No I18N
				break;
	        case "equal" : //No I18N
	            $("#snmpRearmType").val("equal").select2(); //No I18N
	            break;
	        case "notEqual" : //No I18N
	            $("#snmpRearmType").val("equal").select2(); //No I18N
	            $("#snmpRearmValue").val("");//No I18N
	             $('#snmpRearmType,#snmpRearmValue').prop('disabled',true);
	            break;
	    }
	}else
	{
		if(page !== undefined && page === "addCustomPerf"){
			$("#attentionType").val(type).select2();
		  	$("#troubleType").val(type).select2();
		  	$("#criticalType").val(type).select2();
		  	$("#rearmType").val("minEqual").select2(); // NO I18N
		  }else{
		  	$("#attentionType").val(type);
		  	$("#troubleType").val(type);
		  	$("#criticalType").val(type);
		  }
	 	$('#rearmVal').prop('disabled',false);

	 switch(type)
	{

		case "min" : //No I18N
			$("#rearmType").val("maxEqual"); //No I18N
				$("#lowerLimitType").val("max").select2().trigger("change");//No I18n
   				$("#upperLimitType").val("min").select2().trigger("change");//No I18n
			break;
		case "minEqual" : //No I18N
			$("#rearmType").val("max"); //No I18N
				$("#lowerLimitType").val("max").select2().trigger("change");//No I18n
   				$("#upperLimitType").val("min").select2().trigger("change");//No I18n
			break;
		case "max" : //No I18N
			$("#rearmType").val("minEqual"); //No I18N

				$("#lowerLimitType").val("min").select2().trigger("change");//No I18n
   				$("#upperLimitType").val("max").select2().trigger("change");//No I18n
				break;
		case "maxEqual" : //No I18N
			$("#rearmType").val("min"); //No I18N

			$("#lowerLimitType").val("min").select2().trigger("change");//No I18n
			$("#upperLimitType").val("max").select2().trigger("change");//No I18n
			break;
			case "equal" : //No I18N
				$("#rearmType").val("equal"); //No I18N
				break;
			case "notEqual" : //No I18N
				$("#rearmType").val("equal"); //No I18N
				$("#rearmVal").val("");//No I18N
				 $('#rearmType,#rearmVal').prop('disabled',true);
				break;
		}
		checkThresholdEnabledOrNot('monitors');//No I18N
		if(OPMClient.SettingsTabController.monitorName == "EditThresholds" || OPMClient.SettingsTabController.monitorName === "thresholdSettings"){
			$("#QCWFormHolder").off("scroll"); // No I18N
		}
	}

}
function setCustomPerfThresholdValues(div)
{
	var type = $(div).val();
	$('#rearmVal').prop('disabled',false);
	switch(type)
	{
		case "min" : //No I18N
			$("#rearmType").val("maxEqual").select2(); //No I18N
			$('#lowerLimitType').val('max').select2().trigger("change"); //No I18N
			$('#upperLimitType').val('min').select2().trigger("change");//No I18N
			break;
		case "minEqual" : //No I18N
			$("#rearmType").val("max").select2(); //No I18N
			$('#lowerLimitType').val('max').select2().trigger("change"); //No I18N
			$('#upperLimitType').val('min').select2().trigger("change");//No I18N
			break;
		case "max" : //No I18N
			$("#rearmType").val("minEqual").select2(); //No I18N
			$('#lowerLimitType').val('min').select2().trigger("change"); //No I18N
			$('#upperLimitType').val('max').select2().trigger("change");//No I18N
			break;
		case "maxEqual" : //No I18N
			$("#rearmType").val("min").select2(); //No I18N
			$('#lowerLimitType').val('min').select2().trigger("change"); //No I18N
			$('#upperLimitType').val('max').select2().trigger("change");//No I18N
			break;
		case "equal" : //No I18N
			$("#rearmType").val("equal").select2(); //No I18N
			break;
		case "notEqual" : //No I18N
			$("#rearmType").val("equal").select2(); //No I18N
			$("#rearmVal").val("");//No I18N
			$('#rearmType,#rearmVal').prop('disabled',true);
			break;
	}
	if($(div).prop('id')!=="attentionType"){
		$(div).closest('.thresholdDetails').find('#attentionType').val(type).select2();
	}
	if($(div).prop('id')!=="troubleType"){
		$(div).closest('.thresholdDetails').find('#troubleType').val(type).select2();
	}
	if($(div).prop('id')!=="criticalType"){
		$(div).closest('.thresholdDetails').find('#criticalType').val(type).select2();
	}
	checkThresholdEnabledOrNot('monitors');//No I18N
}
var updatePerfMonErrorObj = {};
function validatePerfThresholds(dataType,valDiv)
{
	if(dataType !== undefined && dataType === "3")
	{
		if(!opm_doesThresholdConfigured('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal',valDiv) || !opm_validateMonitorThreshold_Float('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal','attentionType'))
		{
			return false;
		}
	}
	else
	{
		if(!opm_doesThresholdConfigured('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal',valDiv) || !opm_validateMonitorThreshold('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal','attentionType'))
		{
			return false;
		}
	}
	return true;
}
function validatePerfThresholdsForDT(valDiv, datatype)
{
	if(checkMultipleThresholdsConfiguredInDT(valDiv)){
		return validateMultipleThresholdsForBulk(valDiv,datatype);
	}
	updatePerfMonErrorObj={};
	if(datatype !== undefined && datatype === "3")
	{
		if(!opm_doesThresholdConfigured('snmpWarnValue', 'snmpTroubleValue', 'snmpErrorValue', 'snmpRearmValue',valDiv) ||!opm_validateMonitorThreshold_Float('snmpWarnValue', 'snmpTroubleValue', 'snmpErrorValue', 'snmpRearmValue','snmpWarnType',valDiv))
		{
			$.each(updatePerfMonErrorObj,function(field,msg)
			{
	            $(valDiv).find("#"+field).addClass('validateField error');//No I18N
	            $(valDiv).find("#"+field).attr('data-error',msg);//No I18N
	             opmValidateTooltipDefine();
	             opmValidate($(valDiv).find("#"+field));//No I18N
			});
			return false;
		}
	}
	else
	{
		if(!opm_doesThresholdConfigured('snmpWarnValue', 'snmpTroubleValue', 'snmpErrorValue', 'snmpRearmValue',valDiv) || !opm_validateMonitorThreshold('snmpWarnValue', 'snmpTroubleValue', 'snmpErrorValue', 'snmpRearmValue','snmpWarnType',valDiv))
		{
			$.each(updatePerfMonErrorObj,function(field,msg)
			{
	            $(valDiv).find("#"+field).addClass('validateField error');//No I18N
	            $(valDiv).find("#"+field).attr('data-error',msg);//No I18N
	             opmValidateTooltipDefine();
	             opmValidate($(valDiv).find("#"+field));//No I18N
			});
			return false;
		}
	}
	return true;
}
function opm_doesThresholdConfigured(warnTh, trblTh, critTh, rearm,valDiv)
{
	if(valDiv)
	{
		warnVal = $(valDiv).find("#"+warnTh).val();
		trblVal = $(valDiv).find("#"+trblTh).val();
		critVal = $(valDiv).find("#"+critTh).val();
		rearmVal = $(valDiv).find("#"+rearm).val();
	}
	else
	{
		warnVal = $("#"+warnTh).val();
		trblVal = $("#"+trblTh).val();
		critVal = $("#"+critTh).val();
		rearmVal = $("#"+rearm).val();
	}
	if((trim(warnVal)==="") && (trim(trblVal)==="") && (trim(critVal)===""))
	{
		if(trim(rearmVal)!=="")
		{
			updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.ThresholdTextualValue');  //No I18N
			return false;
		}
		return true;
	}
	return true;
}
function opm_validateMonitorThreshold(warnTh, trblTh, critTh, rearm, thType,valDiv)
{
	if(!opm_validateNumericMonitorThreshold(thType, critTh, rearm, Ember.I18n.t('webclient.threshold.error',this),valDiv) || !opm_validateNumericMonitorThreshold(thType, trblTh, rearm, Ember.I18n.t('webclient.threshold.trouble',this),valDiv) || !opm_validateNumericMonitorThreshold(thType, warnTh, rearm, Ember.I18n.t('webclient.threshold.warning',this),valDiv))
	{
		return false;
	}
	if(!opm_compareMonitorHigherSeverity(thType, critTh, trblTh,valDiv) || !opm_compareMonitorHigherSeverity(thType, trblTh, warnTh,valDiv) || !opm_compareMonitorHigherSeverity(thType, critTh, warnTh,valDiv) )
	{
		return false;
	}
    return true;
}
function opm_validatePositiveIntegerThreshold(warnTh, trblTh, critTh, rearm)
{
	var a = [],b=[];
	a[0] = $("#"+warnTh).val(); b[0] = warnTh;
	a[1] = $("#"+trblTh).val();	b[1] = trblTh;
	a[2] = $("#"+critTh).val();	b[2] = critTh;
	a[3] = $("#"+rearm).val();	b[3] = rearm;
	for (var i = a.length - 1; i >= 0; i--) {
			if((!opm_IsNumeric(a[i]) || a[i] <= 0 )&& a[i] !='' )
			{
				updatePerfMonErrorObj[b[i]]=Ember.I18n.t('webclient.admin.profiledetails.enter');  //No I18N
				return false;
			}

	}
	if(a[3] == '' || a[3] == undefined  )
	{
						updatePerfMonErrorObj[b[3]]=Ember.I18n.t('webclient.opm.perfgrp.rearm.value.validationtxt');  //No I18N
		return false;
	}
		return true;
}
function opm_validatePositiveIntegerThreshold(warnTh, trblTh, critTh, rearm)
{
	var a = [],b=[];
	a[0] = $("#"+warnTh).val(); b[0] = warnTh;
	a[1] = $("#"+trblTh).val();	b[1] = trblTh;
	a[2] = $("#"+critTh).val();	b[2] = critTh;
	a[3] = $("#"+rearm).val();	b[3] = rearm;
	for (var i = a.length - 1; i >= 0; i--) {
			if((!opm_IsNumeric(a[i]) || a[i] <= 0 )&& a[i] !='' )
			{
				updatePerfMonErrorObj[b[i]]=Ember.I18n.t('webclient.admin.profiledetails.enter');  //No I18N
				return false;
			}

	}
	if(a[3] == '' || a[3] == undefined  )
	{
						updatePerfMonErrorObj[b[3]]=Ember.I18n.t('webclient.opm.perfgrp.rearm.value.validationtxt');  //No I18N
		return false;
	}
		return true;
}
function opm_validateNumericMonitorThreshold(thType, threshold, rearm, msg, valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	var thrtype = $('#'+thType+' option:selected').val();
	var isCheckNumeric = OPMClient.SettingsDeviceTemplateController.isCheckNumeric;
	if(valDiv!==undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
	}
	if(thresholdVal === "")
	{
		return true;
	}
	if((isCheckNumeric && !opm_validateSignedFloat(thresholdVal)) || (OPMClient.SettingsDeviceTemplateController.isIPMI && !opm_IsNumeric(thresholdVal)))
	{
		updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.admin.StatusPoll.Pleaseenterintegervalue');  //No I18N
		return false;
	}
	else if(!opm_checkMonitorRearmValue(thType, threshold, rearm,valDiv))
	{
		return false;
	}
	return true;
}
function opm_checkRearmValue(thType, threshold, rearm)
{
	var thresholdVal = $('#'+threshold).val();
	var thrtype = $('#'+thType+' option:selected').val();
	var rval = $('#'+rearm).val();

	if(!rval.disabled && !opm_isValNumberAllowNegative(rval,''))
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.StatusPoll.Enterpositivevalue');
		return false;
	}
	switch(thrtype.value)
	{
		case "min" : //No I18N
		case "minEqual" : //No I18N
			if(parseInt(thresholdVal.value) > parseInt(rval.value))
			{
				updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.admin.customgraph.thresholdless');
				return false;
			}
			break;
		case "maxEqual" : //No I18N
		case "max" : //No I18N
			if(parseInt(thresholdVal.value) < parseInt(rval.value))
			{
				updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.admin.customgraph.thresholdgreat');
				return false;
			}
			break;
		case "equal" : //No I18N
			if(parseInt(thresholdVal.value) === parseInt(rval.value))
			{
				updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.admin.customgraph.thresholdequalmsg');
				return false;
			}
			break;
		case "notEqual" : //No I18N
			return true;
	}
	return true;
}
function opm_checkMonitorRearmValue(thType, threshold, rearm, valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	var thrtype = $('#'+thType+' option:selected').val();
	var rval = $('#'+rearm).val();
	var isCheckNumeric = OPMClient.SettingsDeviceTemplateController.isCheckNumeric;

	if(valDiv!==undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
		rval = $(valDiv).find('#'+rearm).val();
	}
	if(thrtype !== "notEqual" && (rval === undefined || rval === null || rval === ""))
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.devices.snapshot.editprocessmonitor.validrearm');//No I18N
		return false;
	}
	if((thrtype !== "notEqual" && !opm_validateSignedFloat(rval) && isCheckNumeric) || (thrtype !== "notEqual" && OPMClient.SettingsDeviceTemplateController.isIPMI && !opm_IsNumeric(rval)))
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.js.integerValue')+" "+Ember.I18n.t('webclient.map.edit.rearmvalue');//No I18N
		return false;
	}
	switch(thrtype)
	{
		case "minEqual" : //No I18N
		case "min" : //No I18N
			if(parseInt(thresholdVal) > parseInt(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdless');
				return false;
			}
			break;
		case "maxEqual" : //No I18N
		case "max" : //No I18N
			if(parseInt(thresholdVal) < parseInt(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdgreat');
				return false;
			}
			break;
		case "equal" : //No I18N
			if(parseInt(thresholdVal) === parseInt(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdequalmsg');
				return false;
			}
			break;
		case "notEqual" : //No I18N
			return true;
	}
	return true;
}
/*function opm_compareWithHigherSeverity(thType, highSev, lowSev)
{
	var thrtype = $('#'+thType+' option:selected').val();
	var hVal = $('#'+highSev).val();
	var lVal = $('#'+lowSev).val();

	switch(thrtype)
	{
		case "min" : //No I18N
			if(parseInt(hVal.value) >= parseInt(lVal.value))
			{
				updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.highval');
				return false;
			}
			break;
		case "max" : //No I18N
			if(parseInt(hVal.value) <= parseInt(lVal.value))
			{
				updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.lowval');
				return false;
			}
			break;
		default :
			if(parseInt(hVal.value) === parseInt(lVal.value))
			{
				updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.samevaluealert');
				return false;
			}
			break;
	}
	return true;
}*/
function opm_compareMonitorHigherSeverity(thType, highSev, lowSev, valDiv)
{
	var thrtype = $('#'+thType+' option:selected').val();
	var hVal = $('#'+highSev).val();
	var lVal = $('#'+lowSev).val();

	if(valDiv!==undefined){
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
		hVal = $(valDiv).find('#'+highSev).val();
		lVal = $(valDiv).find('#'+lowSev).val();
	}

	if(hVal === "" && lVal === ""){
		return true;
	}else{
		switch(thrtype)
		{
			case "min" : //No I18N
			case "minEqual" : //No I18N
				if(parseInt(hVal) >= parseInt(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.highval');
					return false;
				}
				break;
			case "max" : //No I18N
			case "maxEqual" : //No I18N
				if(parseInt(hVal) <= parseInt(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.lowval');
					return false;
				}
				break;
			default :
				if(parseInt(hVal) === parseInt(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.samevaluealert');
					return false;
				}
				break;
		}
	}
	return true;
}
function opm_validateMonitorThreshold_Float(warnTh, trblTh, critTh, rearm, thType,valDiv)
{
	if(!opm_validateNumericMonitorThreshold_Float(thType, critTh, rearm, Ember.I18n.t('webclient.threshold.error',this),valDiv) || !opm_validateNumericMonitorThreshold_Float(thType, trblTh, rearm, Ember.I18n.t('webclient.threshold.trouble',this),valDiv) || !opm_validateNumericMonitorThreshold_Float(thType, warnTh, rearm, Ember.I18n.t('webclient.threshold.warning',this),valDiv))
	{
		return false;
	}
	if(!opm_compareMonitorHigherSeverity_Float(thType, critTh, trblTh,valDiv) || !opm_compareMonitorHigherSeverity_Float(thType, trblTh, warnTh,valDiv) || !opm_compareMonitorHigherSeverity_Float(thType, critTh, warnTh,valDiv) )
	{
		return false;
	}
    return true;
}
function opm_validateNumericMonitorThreshold_Float(thType, threshold, rearm, msg, valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	var thrtype = $('#'+thType+' option:selected').val();

	var isCheckNumeric = true;
	if(valDiv!==undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
	}
	if(thresholdVal === "")
	{
		return true;
	}
	if(isCheckNumeric && !opm_validateSignedFloat(thresholdVal))
	{
		updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.message.validFloat');  //No I18N
		return false;
	}
	else if(isCheckNumeric && !opm_validateDecimalPlacesForSignedFloat(thresholdVal))
	{
		updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.opm.decimalplaces.allowed');  //No I18N
		return false;
	}
	else if(!opm_checkMonitorRearmValue_Float(thType, threshold, rearm,valDiv))
	{
		return false;
	}
	return true;
}
function opm_checkMonitorRearmValue_Float(thType, threshold, rearm, valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	var thrtype = $('#'+thType+' option:selected').val();
	var rval = $('#'+rearm).val();
	var isCheckNumeric = true;

	if(valDiv!==undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
		rval = $(valDiv).find('#'+rearm).val();
	}
	if(thrtype !== "notEqual" && (rval === undefined || rval === null || rval === ""))
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.devices.snapshot.editprocessmonitor.validrearm');//No I18N
		return false;
	}
	if(thrtype !== "notEqual" && !opm_validateSignedFloat(rval) && isCheckNumeric)
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.message.validFloat')+" for "+Ember.I18n.t('webclient.map.edit.rearmvalue');//No I18N
		return false;
	}
	if(thrtype !== "notEqual" && !opm_validateDecimalPlacesForSignedFloat(rval) && isCheckNumeric)
	{
		updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.opm.decimalplaces.allowedforrearm');//No I18N
		return false;
	}
	switch(thrtype)
	{
		case "min" : //No I18N
		case "minEqual" : //No I18N
			if(parseFloat(thresholdVal) > parseFloat(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdless');
				return false;
			}
			break;
		case "max" : //No I18N
		case "maxEqual" : //No I18N
			if(parseFloat(thresholdVal) < parseFloat(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdgreat');
				return false;
			}
			break;
		case "equal" : //No I18N
			if(parseFloat(thresholdVal) === parseFloat(rval))
			{
				updatePerfMonErrorObj[rearm]=Ember.I18n.t('webclient.admin.customgraph.thresholdequalmsg');
				return false;
			}
			break;
		case "notEqual" : //No I18N
			return true;
	}
	return true;
}
function opm_compareMonitorHigherSeverity_Float(thType, highSev, lowSev, valDiv)
{
	var thrtype = $('#'+thType+' option:selected').val();
	var hVal = $('#'+highSev).val();
	var lVal = $('#'+lowSev).val();

	if(valDiv!==undefined){
		thrtype = $(valDiv).find('#'+thType+' option:selected').val();
		hVal = $(valDiv).find('#'+highSev).val();
		lVal = $(valDiv).find('#'+lowSev).val();
	}

	if(hVal === "" && lVal === ""){
		return true;
	}else{
		switch(thrtype)
		{
			case "min" : //No I18N
			case "minEqual" : //No I18N
				if(parseFloat(hVal) >= parseFloat(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.highval');
					return false;
				}
				break;
			case "max" : //No I18N
			case "maxEqual" : //No I18N
				if(parseFloat(hVal) <= parseFloat(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.alert.lowval');
					return false;
				}
				break;
			default :
				if(parseFloat(hVal) === parseFloat(lVal))
				{
					updatePerfMonErrorObj[lowSev]=Ember.I18n.t('webclient.threshold.samevaluealert');
					return false;
				}
				break;
		}
	}
	return true;
}
function validatePerfMultipleThresholds_Equal(dataType)
{
	if(dataType !== undefined && dataType === "3")
	{
		if(!opm_validateMultiThreshold_Float_Equal('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal'))
		{
			return false;
		}
	}
	else
	{
		if(!opm_validateMultiThreshold_Equal('attentionVal', 'troubleVal', 'criticalVal', 'rearmVal'))
		{
			return false;
		}
	}
	return true;
}

function opm_validateMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv)
{
	if(!opm_validateNumericMonitorMultiThreshold_Equal(critTh,valDiv) || !opm_validateNumericMonitorMultiThreshold_Equal(trblTh,valDiv) || !opm_validateNumericMonitorMultiThreshold_Equal(warnTh,valDiv) || !opm_validateNumericRearmMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv))
	{
		return false;
	}
	if(!opm_compareDuplicateNumericMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv))
	{
		return false;
	}
    return true;
}
function opm_validateNumericRearmMultiThreshold_Equal(warnTh, trblTh, critTh, rearm,valDiv)
{
	var warningVal = $('#'+warnTh).val();
	var troubleVal = $('#'+trblTh).val();
	var criticalVal = $('#'+critTh).val();
	var rearmVal = $('#'+rearm).val();

	if(valDiv != undefined){
		warningVal = $(valDiv).find('#snmpWarnValue').val();
		troubleVal = $(valDiv).find('#snmpTroubleValue').val();
		criticalVal = $(valDiv).find('#snmpErrorValue').val();
		rearmVal = $(valDiv).find('#snmpRearmValue').val();
	}

	if(!(warningVal.trim() === "" && troubleVal.trim() === "" && criticalVal.trim() === ""))
	{
		if(rearmVal.trim() === "")
		{
			updatePerfMonErrorObj[rearm] = Ember.I18n.t('webclient.devices.snapshot.editprocessmonitor.validrearm',this); //No I18N
			return false;
		}
		else
		{
			return opm_validateNumericMonitorMultiThreshold_Equal(rearm,valDiv);
		}
	}
}
function opm_validateNumericMonitorMultiThreshold_Equal(threshold,valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	if(valDiv != undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
	}
	if(thresholdVal.trim() === "")
	{
		return true;
	}

	if(thresholdVal.trim().length > 90 )
	{
		updatePerfMonErrorObj[threshold] = Ember.I18n.t('webclient.maxlength.inclusive.pipesymbol.message',{length:90});  //No I18N
		return false;
	}

	if(thresholdVal.indexOf("|") > -1)
    {
        var thresVals = thresholdVal.split("|");
		for(var th=0;th<thresVals.length;th++)
		{
			if(thresVals[th].trim() === "")
			{
				updatePerfMonErrorObj[threshold]= Ember.I18n.t('webclient.propervalue.multi.threshold.pipeseparate',this);  //No I18N
				return false;
			}
			else if(!opm_isSignedInteger(thresVals[th].trim()))
			{
				updatePerfMonErrorObj[threshold]= Ember.I18n.t('webclient.propervalue.numericvalueformultiplevalue',this);  //No I18N
				return false;
			}
		}
    }
    else if(!opm_isSignedInteger(thresholdVal))
    {
    	updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.admin.profiledetails.enter',this);  //No I18N
        return false;
    }
	return true;
}

function opm_compareDuplicateNumericMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv)
{
    var valsArray = [];
    var multiArr = [warnTh, trblTh, critTh, rearm];

    for(var mul=0; mul<multiArr.length; mul++)
    {
    	var thresholdVal = $('#'+multiArr[mul]).val();
    	if(valDiv != undefined){
    		thresholdVal = $(valDiv).find('#'+multiArr[mul]).val();
    	}
    	var thresVals = thresholdVal.split("|");
    	for(var th=0;th<thresVals.length;th++)
        {
        	var currVal = parseInt(thresVals[th].trim());
        	if(valsArray.contains(currVal))
        	{
            	updatePerfMonErrorObj[multiArr[mul]]=Ember.I18n.t('webclient.samevalues.multithresh.already.exists.message',this); //No I18N
            	return false;
            	}
            	else
           	 {
            		valsArray.push(currVal);
            	}
        }
    }
    return true;
}
function opm_validateMultiThreshold_Float_Equal(warnTh, trblTh, critTh, rearm, valDiv)
{
	if(!opm_validateDecimalMonitorMultiThreshold_Equal(critTh,valDiv) || !opm_validateDecimalMonitorMultiThreshold_Equal(trblTh,valDiv) || !opm_validateDecimalMonitorMultiThreshold_Equal(warnTh,valDiv) || !opm_validateDecimalRearmMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv))
	{
		return false;
	}
	if(!opm_compareDuplicateDecimalMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv))
	{
		return false;
	}
    return true;
}
function opm_validateDecimalRearmMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv)
{
	var warningVal = $('#'+warnTh).val();
	var troubleVal = $('#'+trblTh).val();
	var criticalVal = $('#'+critTh).val();
	var rearmVal = $('#'+rearm).val();

	if(valDiv != undefined){
		warningVal = $(valDiv).find('#snmpWarnValue').val();
		troubleVal = $(valDiv).find('#snmpTroubleValue').val();
		criticalVal = $(valDiv).find('#snmpErrorValue').val();
		rearmVal = $(valDiv).find('#snmpRearmValue').val();
	}

	if(!(warningVal.trim() === "" && troubleVal.trim() === "" && criticalVal.trim() === ""))
	{
		if(rearmVal.trim() === "")
		{
			updatePerfMonErrorObj[rearm] = Ember.I18n.t('webclient.devices.snapshot.editprocessmonitor.validrearm',this); //No I18N
			return false;
		}
		else
		{
			return opm_validateDecimalMonitorMultiThreshold_Equal(rearm,valDiv);
		}
	}
}
function opm_validateDecimalMonitorMultiThreshold_Equal(threshold,valDiv)
{
	var thresholdVal = $('#'+threshold).val();
	if(valDiv != undefined){
		thresholdVal = $(valDiv).find('#'+threshold).val();
	}
	if(thresholdVal.trim() === "")
	{
		return true;
	}

	if(thresholdVal.trim().length > 90 )
	{
		updatePerfMonErrorObj[threshold] = Ember.I18n.t('webclient.maxlength.inclusive.pipesymbol.message',{length:90});  //No I18N
		return false;
	}

	if(thresholdVal.indexOf("|") > -1)
    {
        var thresVals = thresholdVal.split("|");
		for(var th=0;th<thresVals.length;th++)
		{
			if(thresVals[th].trim() === "")
			{
				updatePerfMonErrorObj[threshold]= Ember.I18n.t('webclient.propervalue.multi.threshold.pipeseparate',this);
				return false;
			}
			else if(!opm_validateSignedFloat(thresVals[th].trim()))
			{
				updatePerfMonErrorObj[threshold]= Ember.I18n.t('webclient.propervalue.decimalvalueformultiplevalue',this);
				return false;
			}
			else if(!opm_validateDecimalPlacesForSignedFloat(thresVals[th].trim()))
			{
				updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.opm.decimalplaces.allowed');  //No I18N
				return false;
			}
		}
    }
    else if(!opm_validateSignedFloat(thresholdVal))
    {
    	updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.message.validFloat',this);  //No I18N
        return false;
    }
    else if(!opm_validateDecimalPlacesForSignedFloat(thresholdVal))
	{
		updatePerfMonErrorObj[threshold]=Ember.I18n.t('webclient.opm.decimalplaces.allowed');  //No I18N
		return false;
	}
	return true;
}

function opm_compareDuplicateDecimalMultiThreshold_Equal(warnTh, trblTh, critTh, rearm, valDiv)
{
    var valsArray = [];
    var multiArr = [warnTh, trblTh, critTh, rearm];

    for(var mul=0; mul<multiArr.length; mul++)
    {
    	var thresholdVal = $('#'+multiArr[mul]).val();
    	if(valDiv != undefined){
    		thresholdVal = $(valDiv).find('#'+multiArr[mul]).val();
    	}
    	var thresVals = thresholdVal.split("|");
    	for(var th=0;th<thresVals.length;th++)
        {
        	var currVal = parseFloat(thresVals[th].trim());
        	if(valsArray.contains(currVal))
        	{
            	updatePerfMonErrorObj[multiArr[mul]]=Ember.I18n.t('webclient.samevalues.multithresh.already.exists.message',this); //No I18N
            	return false;
            }
            else
            {
            	valsArray.push(currVal);
            }
        }
    }
    return true;
}
function doSettingsMonitorsActions(rowId,actionType){
	var rowData = $('#'+OPMClient.SettingsTabController.monitorName+'List').jqGrid('getRowData',rowId);//No I18N
	switch(actionType){
		case 'perfedit'://No I18N
			OPMClient.Settings.openEditPerformanceMonitorsSlide(rowData.graphName,rowData.graphId,rowData.customGraph);
			break;
		case 'perfassociate'://No I18N
			opm_transitionToParentRoute('Settings.Monitors.SubMonitors.AssociatePerfMonitors',rowId);//No I18N
			break;
		case 'perfdelete'://No I18N
			delcustomPerfMon(rowData.graphName,rowData.graphId,rowData.protocol);
			break;
	}
}
function doMonitorActions(rowId,actionType,optionalParam,gid){
	//Following rowData will support only for monitors page, separate handling needed for other grid(S)
	if(actionType == 'intfforecast' && gid != undefined)
	{
		var rowData = $('#'+gid).jqGrid('getRowData',rowId);//No I18N
	}
	else
	{
	var rowData = $('#opm_'+OPMClient.InventoryDeviceDetailsController.monitorsName+'List').jqGrid('getRowData',rowId);//No I18N
		if(rowData.isSuppressed!==undefined) {
			OPMClient.DeviceMonitorsActionController.set("snapshotObj.isSuppressed",rowData.isSuppressed);//No I18N
		}
		if(rowData.suppressedMessage!==undefined) {
			OPMClient.DeviceMonitorsActionController.set("snapshotObj.suppressedMessage",rowData.suppressedMessage);//No I18N
		}
	}
	switch(actionType){
		case 'perfgraph'://No I18N
			if (rowData.checkNumeric === "true") {
				if('scriptMonitors' === OPMClient.InventoryDeviceDetailsController.monitorsName){
					openPerformanceMonEnhancedGraph(rowData.displayName,rowData.displayName,false,false,rowData.displayName);
				}else{
					openPerformanceMonEnhancedGraph(rowData.policyName,rowData.name,false,false,rowData.displayNameCopy);
				}
			}
			break;
		case 'perfforecast'://No I18N
			openPerformanceMonEnhancedGraph(rowData.policyName,rowData.name,'forecast',false,rowData.displayNameCopy);//No I18N
			break;
		case 'intfforecast'://No I18N
			openPerformanceMonEnhancedGraph(rowData.monitorName,rowData.monitorName,'forecast',true,rowData.monitorName);//No I18N
			break;
		case 'perftest'://No I18N
			var data = {};
		    if('scriptMonitors' === OPMClient.InventoryDeviceDetailsController.monitorsName){
		        data = {deviceName:OPMClient.InventoryDeviceDetailsController.deviceName,displayName:rowData.displayName,pollingStatus:rowData.pollingStatusValue,rowId:rowId,lastCollectedTime:rowData.lastCollectedTime,pollId:rowData.pollid,units:rowData.YAXISTEXT,fromDiagnostic:optionalParam||false};
		    }else{
		        data = {deviceName:OPMClient.InventoryDeviceDetailsController.deviceName,policyName:rowData.policyName,graphName:rowData.name,instanceName:rowData.Instance,displayName:$($.parseHTML(rowData.DISPLAYNAME)).text(),pollingStatus:rowData.pollingStatusValue,rowId:rowId,lastCollectedTime:rowData.lastCollectedTime,pollId:rowData.pollId,units:rowData.YAXISTEXT,fromDiagnostic:optionalParam||false,graphType:rowData.graphType};
		    }
		    OPMClient.DeviceMonitorsActionController.setProperties({graphMonObj:data});
		    opm_transitionToParentRoute('Inventory.Device.Monitors.Test');//No I18N
			break;
		case 'perfedit'://No I18N
			var obj = {pgHeader:rowData.policyName,deviceName:OPMClient.InventoryDeviceDetailsController.deviceName,policyName:rowData.policyName,graphName:rowData.name,instanceName:rowData.Instance !== undefined ? rowData.Instance : '',isBGPMonitor:rowData.isBGPMonitor,pollId:rowData.pollId,graphType:rowData.graphType};
			OPMClient.DeviceMonitorsActionController.set('editMonitorObj',obj);//No I18N
			opm_transitionToParentRoute('Inventory.Device.Monitors.MonAction',obj.deviceName);//No I18N
			break;
		case 'perfdelete'://No I18N
			deleteDevicePerfMonitor(rowData);
			break;
		case 'scriptedit'://No I18N
			OPMClient.SettingsAddEditController.setProperties({operation:false,pageAction:'Edit','pageObj.graphName':rowData.displayName});//No I18N
    		OPMClient.InventoryDeviceDetailsController.set('scriptID',rowData.OID);//No I18N
    		redirectToMonitor(OPMClient.InventoryDeviceDetailsController.deviceName,"NewScriptMonitors"); //No I18N
			break;
		case 'scriptdelete'://No I18N
			deleteDeviceScriptMonitor(rowData.pollid);
			break;
		case 'deviceMonitorsCommonGraph'://No I18N
			rowData.monType = optionalParam;
			OPMClient.DeviceMonitorsActionController.set('snapshotObj', rowData);//No I18N
			if('fileMonitors' === optionalParam || 'folderMonitors' === optionalParam){
				redirectSnapShot('Monitors/FileFolderGraph/'+optionalParam+'/'+(rowData.filemonitorid || rowData.foldermonitorid)+'/'+encodeURIComponent(rowData.monitorname));// No I18N
			}else if('processMonitors' === optionalParam){//No I18N
				redirectSnapShot('Monitors/ProcessGraph/'+(rowData.id)+'/'+encodeURIComponent(rowData.name));// No I18N
			}else if('serverMonitors' === optionalParam){//No I18N
				redirectSnapShot('Monitors/ServiceGraph/'+(rowData.moid)+'/'+encodeURIComponent(rowData.name)+'/'+rowData.portNo);// No I18N
			}else if(['adServices','exchangeServices','mssqlServices','ntServiceMonitors'].contains(optionalParam)){//No I18N
				var instanceName = ('ntServiceMonitors' === optionalParam) ? 'winService' : 'service';// No I18N
				redirectSnapShot('Monitors/AvailabilityGraph/'+(rowData.moid || rowData.serviceMOID)+'/'+instanceName+'/'+encodeURIComponent(rowData.name || rowData.displayName));// No I18N
			}else{
				opm_transitionToParentRoute('Inventory.Device.Monitors.Details');//No I18N
			}
			break;
		case 'deviceMonitorsCommonEdit'://No I18N
			switch(optionalParam){
				case 'serverMonitors'://No I18N
					editDeviceServerMonitor(rowData.name,rowData.portNo);
				break
				case 'ntServiceMonitors'://No I18N
					editDevNTService(rowData.serviceID);
				break
				case 'processMonitors'://No I18N
					goToProcessMonitors(rowData.id);
				break
				case 'fileMonitors'://No I18N
					editDeviceFileMon(rowData.filemonitorid);
				break
				case 'folderMonitors'://No I18N
					editDevFolderMon(rowData.foldermonitorid);
				break
				case 'urlMonitors'://No I18N
					editDeviceUrlMonitor(rowData.name);
				break;
			}
			break;
		case 'deviceMonitorsCommonDelete'://No I18N
			switch(optionalParam){
				case 'serverMonitors'://No I18N
					deleteServerMonitor(rowData.name);
				break
				case 'ntServiceMonitors'://No I18N
					deleteDevNtServiceMonitor(rowData.serviceID);
				break
				case 'processMonitors'://No I18N
					deleteDeviceProcessMonitor(rowData.id);
				break
				case 'fileMonitors'://No I18N
					deleteDeviceFileFolderMonitor(rowData.filemonitorid);
				break
				case 'folderMonitors'://No I18N
					deleteDeviceFileFolderMonitor(rowData.foldermonitorid);
				break
				case 'urlMonitors'://No I18N
					deleteDeviceURLMonitor(rowData.name);
				break;
				case 'adServices'://No I18N
				case 'exchangeServices'://No I18N
				case 'mssqlServices'://No I18N
					deleteDevADMSEXCcServiceMonitors(rowData.serviceID,getDeleteServiceAPIName(optionalParam));
				break;
			}
			break;
		case 'deviceMonitorsEventlogDelete'://No I18N
			deleteDevEventlogMonitor(rowData.id);
			break;
	}
}
function doAppServiceActions(appServiceRowId,isDissociate,isDiscoveryAction){
    var self = window.OPM.currentView.handler.controller;
    self.setProperties({isActionTriggered:true,appServiceRowId:appServiceRowId,isDissociate:isDissociate,isDiscoveryAction:isDiscoveryAction});
}
function getDeleteServiceAPIName(serviceType){
	return (serviceType === 'adServices') ? 'deleteADServices' : ((serviceType === 'exchangeServices') ? 'deleteExchangeServices' : 'deleteMSSQLServices');//No I18N
}
/*
	policyName, graphName - primary params for getting graph data.
	graphCategory - to identify the category of the graph, like forecast, kemp, bgp etc.,
	isSingleGraph - to know the redirection page
	displayName - name showing in the breadcrumb
	graphSettingsObject - additional data for the graph (ex. previous settings applied to the expanded graph)
*/
function openPerformanceMonEnhancedGraph(policyName,graphName,graphCategory,isSingleGraph,displayName,period,startTime,endTime,graphSettingsObject){
	var graphTypeMapping = {forecast:1,hardware:2,bgp:3,kemp:4,sdwan:5,sdwanChildAvail:6};
	var urlParams = {policyName:encodeURIComponent(policyName),indexName:encodeURIComponent(graphName),graphHeader:displayName,selectedPeriod:(period || 'Today'),startTime:(startTime || ''),endTime:(endTime || ''),graphSettingsObject:graphSettingsObject};//No I18N
	var routePath = 'EnhancedGraph/'+urlParams.policyName+'/'+urlParams.indexName+'/'+encodeURIComponent(urlParams.graphHeader)+'/'+(graphCategory ? graphTypeMapping[graphCategory] : '0');//No I18N
	if(graphSettingsObject !== undefined){
		if(graphCategory === 'hardware'){
			urlParams.paramsList = graphSettingsObject.paramsList;
			urlParams.selectedParam = graphSettingsObject.selectedParam;
			if(graphSettingsObject.IPMIData !== undefined){
				urlParams.isIPMI = true;
				urlParams.IPMIData = graphSettingsObject.IPMIData;
			}
			delete urlParams.graphSettingsObject;
		}else if(graphCategory === 'kemp'){//No I18N
			urlParams.parameterName = graphSettingsObject.parameterName;
			urlParams.instance = graphSettingsObject.instance;
			delete urlParams.graphSettingsObject;
		}
	}
	OPMClient.InventoryDeviceDetailsController.setProperties({graphURLParams:urlParams});
	if(isSingleGraph){
		if(OPMClient.InventoryDeviceDetailsController.fromDiagnostics){
			redirectSnapShot(routePath,'MonitoringDevice',OPMClient.InventoryDeviceDetailsController.deviceName);//No I18N
		}else{
			redirectSnapShot(routePath);
		}
	}else{
		redirectSnapShot('Monitors/'+routePath); // No I18N
	}
}
function closePerfGraph()
{
	deviceSlideOut(1);
	redirectToDeviceSnapshot(OPMClient.InventoryDeviceDetailsController.deviceName,'Monitors');//No I18N
}

function opm_drawStackedZchart(jsonData,divId,seriesType,report,graphDataType)
{
	$('#'+divId).empty();
	 var x_axes = jsonData.xyTitles !== undefined ? jsonData.xyTitles[0] : "";//No I18N
	 var y_axes = jsonData.xyTitles !== undefined ? jsonData.xyTitles[1] : "";//No I18N
	 var legendsTemp={
				"colorBox": { //No I18N
					"shape": "circle", //No I18N
					"strokeOpacity": 1 //No I18N
				},
				"fontFamily": "'LatoRegular'", //No I18N
				"fontSize": 16, //No I18N
				"hAlign": jsonData.hAlign ? jsonData.hAlign : "right", //No I18N
				"vAlign": jsonData.vAlign ? jsonData.vAlign : "center" //No I18N
			};
	var graphData;
	var graphView;
	var graphSubType;
	var datatype = "time";//No I18N
	var timeFormat;
	if(report === 'availDashReport')
	{
		graphData = jsonData.chartData;
		graphView = 'bar'; //No I18n
		legendsTemp.colors=["#31B404","#9ACD32","#8000FF","#D2ACF9","#e75480","#ffb6c1","#FFF300","#ffff94","#ffa500","#ff8c00","#ff4500","#ff0000","#307d99"]; //No I18n

		$.each(jsonData.xyTitles,function(key,value)
		{
			if(graphDataType !== undefined && graphDataType === "2")
			{
				datatype = 'ordinal'; //No I18n
			}
			else
			{
				datatype = 'time'; //No I18n
			}
		});
		timeFormat = $("#periodDrpdwn").val();
	}
	else
	{
		graphData = jsonData.graphData;
		graphView = 'area'; //No I18n
	}
	if(timeFormat === undefined || timeFormat === null || timeFormat === "")
	{
		timeFormat = 'hours'; //No I18N
	}
	var chartObj = {
		id : divId, //No I18N
		type : graphView, //No I18N
		jsonData : graphData,
		series : seriesType, //No I18N
		height : jsonData.height ? jsonData.height : 250,
		columns:{
			datatype_1:datatype, //No I18N
			datatype_2:'numeric', //No I18N
			columnname_1:x_axes, //No I18N
			columnname_2:y_axes, //No I18N
			timeFormat:jsonData.timeFormat ? jsonData.timeFormat : timeFormat
		},
		tooltip: [0,Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}} ({{col(1)}})"],//No I18N
		canvas:{
			title:{
				show:true
				//text:jsonData[0].seriesname
			}
		},//No I18N
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

	if(jsonData.autoRotation){
		chartObj.axes.xaxis.ticklabel = {"rotation": 'auto'};//No I18N
		chartObj.axes.xaxis.show = true;
	}

	if(report === "availDashReport")
	{
		chartObj.legend.events = {
			"click":function (ele, d, i, chartObj) { //No I18n
				var legendComponent = chartObj.legend.component;
				var legendOptions = chartObj.systemConf.legend;
				if(d.seriesname !== "Not Monitored")
				{
					legendComponent.toggleItemNUpdateChart(ele.toElement, d, i, legendOptions);
					opm_getAvailDeviceListByLegend(d);
				}
        	}
        }
	}
	if(graphDataType === '4'){
		var availColors = ['#77d283','#f47272'];//No I18N
		legendsTemp.colors = availColors;
		graphData = jsonData.chartData[0].data;
		chartObj = {
			id:divId,
			type:'pie',//No I18N
			subType:"simpleDonut",//No I18N
			customClass:"opm_pie",//No I18N
			jsonData:graphData,
			height:jsonData.height ? jsonData.height : 250,
			columns:{
				datatype_1:'ordinal',//No I18N
				datatype_2:'numeric',//No I18N
				columnname_1:Ember.I18n.t('webclient.support.thread.state',this),//No I18N
				columnname_2:Ember.I18n.t('webclient.support.thread.percentage',this),//No I18N
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
				pie: {
						innerRadius: "65%",
						datalabels: {
							handleOverlapping: true,
							type: 'doubleside',//No I18N
							showAs: 'y',//No I18N
							line: {
								strokeColor: 'gray',//No I18N
								strokeWidth: 0.5
							}
					}
				}
			},
			datalabels: {
				handleOverlapping: true,
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

	var ticklabel = {
		"rotation": "20", //No I18n
		"alignMode": "zigzag" //No I18n
	}
	var arraObj={
		"placeholder":[],//No I18N
		"chartobj":[]//No I18N
	};
	var mappingobj={};
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(divId); //No I18N
	if(report !== undefined && report === 'availDashReport' && datatype === 'ordinal')
	{
		arraObj.chartobj[0].axes.xaxis.ticklabel = ticklabel;
	}
	if(jsonData.consolidatedValues !== undefined)
	{
		arraObj.consolidatedValues = jsonData.consolidatedValues; //No I18N
	}
	zChart(arraObj);
}

function opm_eeGetProbeURL(deviceName)
{
	var eeProbeURL='';
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/device/getProbeURL?deviceName='+deviceName); //No I18N
	if(jsonData !== undefined && jsonData.ProbeURL !== undefined)
	{
		eeProbeURL = jsonData.ProbeURL;
	}
	return eeProbeURL;
}

function addDevicetoGMap(deviceName,action)
{
	if(window.OPM.isCentralServer)
	{
		var probeURL = opm_eeGetProbeURL(deviceName);
		if(probeURL !== undefined || probeURL !== "")
		{
			window.open(probeURL+window.OPM.apiclientUrl+"Maps/GMaps/"+deviceName+"/View", "_blank"); //No I18n
		}
	}
	else
	{
		if(action === "Add")
		{
			location.href=window.OPM.apiclientUrl+"Maps/GMaps/"+deviceName+"/Add"; //No I18N
		}
		else
		{
			location.href=window.OPM.apiclientUrl+"Maps/GMaps/"+deviceName+"/View"; //No I18N
		}
	}
}

function getTestcredentialResponse(obj)
{
	var url = window.OPM.apiUrlPattern + "/device/testCredential"; //No I18N
	var nonSnmpCredType = $('input:radio[name=nonSnmpCredType]:checked').val();
	var snmpCredentialName = $('#SnmpCredentialDrp option:selected').val();
	var nonSnmpCredentialName = $('#nonSnmpCredentialDrp option:selected').val();
	var operation = "snmpCredential";//No I18N
	var data = {};
	var hrType = obj.hrType;
	var category = deviceBasicDetails.category;
	var type = deviceBasicDetails.type;
	var VMwareCredentialName = "";
	var CitrixCredentialName = "";
	var nutanixCredentialName = "";
	var ipmiCredentialName = '';
	var oldVMCredential = "";//No I18N
	var telemetryCredentialName = "";

	if(['FlowDevice', 'FlowWLC'].contains(window.OPM.currentView.context.snapType)){
		if(snmpCredentialName == "None"){
			opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.nfa.setSNMP.alertMsg", this)); //NO I18N
			return;
		}
		data.SnmpCredName = snmpCredentialName;
		data.operation = "snmpCredential"; //No I18N
		if(window.OPM.currentView.context.snapType == "FlowDevice"){
			data.deviceName = deviceBasicDetails.ipAddress; //No I18N
			data.RouterID=OPMClient.InventoryDeviceDetailsController.nfaDeviceID;
		}else if(window.OPM.currentView.context.snapType == "FlowWLC"){ //NO I18N
			data.deviceName = deviceBasicDetails.devIP;
			data.RouterID=OPMClient.InventoryDeviceDetailsController.deviceName;
		}
	}else {

		if(OPMClient.DeviceMonitorsActionController.deviceTestCredentialResp !== undefined && OPMClient.DeviceMonitorsActionController.deviceTestCredentialResp.vCenterCred !== undefined && OPMClient.DeviceMonitorsActionController.deviceTestCredentialResp.vCenterCred === "true")
		{
			VMwareCredentialName = $('#vmCredentialDrp option:selected').val();
		}
		if(deviceBasicDetails.entityType !== undefined && deviceBasicDetails.entityType === "Xen-Host")
		{
			CitrixCredentialName = $('#citrixCredentialDrp option:selected').val();
		}
		if(deviceBasicDetails.entityType !== undefined && deviceBasicDetails.isNutanixParent)
		{
			nutanixCredentialName = $('#nutanixCredentialDrp option:selected').val();
		}
		if(deviceBasicDetails.oldVirtualCenter === "true"){
			oldVMCredential = $("#VMWareCredentialDrp").val();
		}
		if(category == 'IPMI'){
			ipmiCredentialName = $("#ipmiCredentialDrp").val();
		}
		if(deviceBasicDetails.type === 'UCS System'){
			data.UCSCredentialName = $("#UCSCredentialDrp option:selected").val();
			operation = "ucscredential";//No I18N
		}
		else if(deviceBasicDetails.type === 'Cisco ACI'){
			data.ACICredentialName = $("#ACICredentialDrp option:selected").val();
			operation = "acicredential";//No I18N
		}
		else if(OPMClient.InventoryDeviceDetailsController.sdwan_restapi_cred_types.indexOf(deviceBasicDetails.type) !== -1)
		{
			data.restAPICredName = $('#RestApiCredentialDrp option:selected').val();
			//operation = "acicredential";//No I18N
			//snmpCredentialName = undefined;
		}
		else if(category != 'IPMI' && type !== "Unknown" && category !== "Router" && category !== "Switch" && category !== "Firewall" && category !== "UPS" && category !== "Printer")
		{
	       if(nonSnmpCredType === "single")
	       {
	       		operation = "cliCredential";//No I18N
	       		var protocol = $('#linProtocolCp option:selected').val();
	            var portNumber = $("#linPortCp").val();//No I18N
				var loginUserName = $("#linUserNameCp").val();//No I18N
				var loginPassWord =  $("#linpasswordCp").val();//No I18N
			    var prompt = $("#linCmdPromptCp").val();//No I18N
			    var loginPrompt = $("#linLoginPromptCp").val();//No I18N
			    var passWordPrompt =  $("#linPwdPromptCp").val();//No I18N
			    var cliTimeout = $("#cliTimeOutCp").val();//No I18N
			    if ('SSH' === protocol && $('#linSSHKeyCp').is(':checked')) {
					var sshKeyFile = $("#sshkeyfileCp").closest('.fileUpload').find('.fileUploadTxt').text(); //No I18N
			    	if (sshKeyFile !== undefined && $.trim(sshKeyFile) !== "") {
			    		var data = {
			                'username':loginUserName,//No I18N
			                'prompt':prompt,//No I18N
			                'loginprompt':'',//No I18N
			                'passwordprompt':'',//No I18N
			                'port':portNumber,//No I18N
			                'protocol':protocol,//No I18N
			                'cliTimeout':cliTimeout,//No I18N
			                'requestid':"cliCredential",//No I18N
			                'sshKeyAuth': true,//No I18N
			                'sshKeyFile': sshKeyFile,//No I18N
			                'sshNewFile':$("#sshkeyfileCp").attr('newFile'),//No I18N
			                'vCenter':VMwareCredentialName, //No I18N
			                'xenCredName':CitrixCredentialName, //No I18N
			                'nutanixCredName':nutanixCredentialName //No I18N
					    };
			    	} else {
	                    $("#sshkeyfileCp").addClass('validateField error');//No I18N
	                    $("#sshkeyfileCp").attr('data-error',Ember.I18n.t('webclient.general.fileselecterror',this));//No I18N
	                     $("#sshkeyfileCp").focus();
	                     opmValidate($("#sshkeyfileCp"));
	                    return false;
			    	}

			    } else if(loginPassWord === "" || loginPassWord === null)
			    {
			    	var data = {
		                'username':loginUserName,//No I18N
		                'prompt':prompt,//No I18N
		                'loginprompt':loginPrompt,//No I18N
		                'passwordprompt':passWordPrompt,//No I18N
		                'port':portNumber,//No I18N
		                'protocol':protocol,//No I18N
		                'cliTimeout':cliTimeout,//No I18N
		                'requestid':"cliCredential",//No I18N
		                'vCenter':VMwareCredentialName, //No I18N
		                'xenCredName':CitrixCredentialName, //No I18N
			            'nutanixCredName':nutanixCredentialName //No I18N
				    };
				}
			    else
			    {
	       			var data = {
		                'username':loginUserName,//No I18N
		                'password':loginPassWord,//No I18N
		                'prompt':prompt,//No I18N
		                'loginprompt':loginPrompt,//No I18N
		                'passwordprompt':passWordPrompt,//No I18N
		                'port':portNumber,//No I18N
		                'protocol':protocol,//No I18N
		                'cliTimeout':cliTimeout,//No I18N
		                'requestid':"cliCredential",//No I18N
						'vCenter':VMwareCredentialName,//No I18N
						'xenCredName':CitrixCredentialName, //No I18N
			            'nutanixCredName':nutanixCredentialName //No I18N
	            	 };
	             }
	       		if(hrType !== "CLI")
	       		{
	       			var wmiUserName = $("#wmiUserNameCp").val();//No I18N
					var wmiloginPassWord =  $("#wmiPasswordCp").val();//No I18N
	      	 		operation = "wmiCredential";//No I18N

	      	 		if(wmiloginPassWord === "" || wmiloginPassWord === null)
	      	 		{
	      	 			var data = {
				            'username':wmiUserName,//No I18N
					        'vCenter':VMwareCredentialName,//No I18N
						    'xenCredName':CitrixCredentialName, //No I18N
			                'nutanixCredName':nutanixCredentialName //No I18N
		           		};
		            	operation = "snmpCredential";//No I18N
	      	 		}
	      	 		else
	      	 		{
		      	 		var data = {
			                'username':wmiUserName,//No I18N
			                'password':wmiloginPassWord,//No I18N
							'vCenter':VMwareCredentialName,//No I18N
							'xenCredName':CitrixCredentialName, //No I18N
			                'nutanixCredName':nutanixCredentialName //No I18N
		      	 		};
		      	 	}

					var isWinRMEnabled = $("#isWinRMEnabled").is(":checked");//No I18N

					if(isWinRMEnabled){
						var winRMValues = getWinRMValues();
						if(!winRMValues) {
							return;
						}
						data.isWinRMEnabled = winRMValues.isWinRMEnabled;
						data.winrmProtocol = winRMValues.winrmProtocol;
						data.winrmPort = winRMValues.winrmPort;
						data.winrmTimeout = winRMValues.winrmTimeout;
					}
	      	 	}

	      	 	if(deviceBasicDetails.isvCenter)
	      	 	{
					var VMwareCredentialName = $('#vmCredentialDrp option:selected').val();
					var wmiUserName = $("#wmiUserNameCp").val();//No I18N
					var wmiloginPassWord =  $("#wmiPasswordCp").val();//No I18N
					if(hrType !== "CLI")
					{
						if(wmiloginPassWord === "" || wmiloginPassWord === null) {
							var data = {
								'username':wmiUserName,//No I18N
								'vCenter':VMwareCredentialName,//No I18N
								'xenCredName':CitrixCredentialName, //No I18N
								'nutanixCredName':nutanixCredentialName //No I18N
							};
						} else {
							var data = {
								'username':wmiUserName,//No I18N
								'password':wmiloginPassWord,//No I18N
								'vCenter':VMwareCredentialName,//No I18N
								'xenCredName':CitrixCredentialName, //No I18N
								'nutanixCredName':nutanixCredentialName //No I18N
							};
						}
					}
					else
					{
						if(loginPassWord === "" || loginPassWord === null) {
							var data = {
			                'username':loginUserName,//No I18N
		                    'prompt':prompt,//No I18N
		                    'loginprompt':loginPrompt,//No I18N
		                    'passwordprompt':passWordPrompt,//No I18N
		                    'port':portNumber,//No I18N
		                    'protocol':protocol,//No I18N
		                    'cliTimeout':cliTimeout,//No I18N
		                    'requestid':"cliCredential",//No I18N
							'vCenter':VMwareCredentialName,//No I18N
							'xenCredName':CitrixCredentialName, //No I18N
			                'nutanixCredName':nutanixCredentialName //No I18N
		        		};
						} else {
							var data = {
								'username':loginUserName,//No I18N
								'password':loginPassWord,//No I18N
								'prompt':prompt,//No I18N
								'loginprompt':loginPrompt,//No I18N
								'passwordprompt':passWordPrompt,//No I18N
								'port':portNumber,//No I18N
								'protocol':protocol,//No I18N
								'cliTimeout':cliTimeout,//No I18N
								'requestid':"cliCredential",//No I18N
								'vCenter':VMwareCredentialName,//No I18N
								'xenCredName':CitrixCredentialName, //No I18N
								'nutanixCredName':nutanixCredentialName //No I18N
							};
						}
					}
	      	 	}
	      	 	//for avoid testing cli credential when we don't have proper cli credential
	      	 	if((!window.OPM.isWindows && hrType !== "CLI") || (operation === 'cliCredential' && loginUserName ==='' && ($('.snmptr').css('display') === 'block'))){
	      	 		operation = "snmpCredential";//No I18N
	      	 	}
	       }
	       else
	       {

	       		operation = "globalCLICredential";//No I18N
	       		if(deviceBasicDetails.entityType == 'Nutanix-Cluster' && obj.nonSnmpCredentialName == undefined )
	       		{
					operation = "snmpCredential";//No I18N
	       		}
	       		var data = {
		            	'NonSnmpCredName':nonSnmpCredentialName,//No I18N
						'vCenter':VMwareCredentialName,//No I18N
						'xenCredName':CitrixCredentialName, //No I18N
			            'nutanixCredName':nutanixCredentialName //No I18N
			    };

	       		if(hrType !== "CLI")
	       		{
	      	 		operation = "globalWMICredential";//No I18N
	      	 	}
	       }
		}
	    if(deviceBasicDetails.isvCenter || deviceBasicDetails.snapDetails.isVxRail){
			data.vCenter = VMwareCredentialName;
		}
		if(deviceBasicDetails.isXenServer) {
			data.xenCredName = CitrixCredentialName;
		}
		if(deviceBasicDetails.entityType != undefined && deviceBasicDetails.entityType === "Nutanix-Cluster"){
			data.nutanixCredName = nutanixCredentialName;
		}
		if((category === 'WirelessLANController' || category === 'NGFW') && !deviceBasicDetails.isTelemetry) {
			data.restAPICredName = $('#RestApiCredentialDrp option:selected').val();
			if(operation != "globalCLICredential"){
                operation = "cliCredential";//No I18N
                data.requestid = "cliCredential";//No I18N
			}
		}
		data.SnmpCredName = snmpCredentialName;
		data.operation = operation;
		data.deviceName = deviceBasicDetails.deviceName;

		if(category == 'IPMI'){
			if((!window.OPM.isShowHPSNMPMon && deviceBasicDetails.type === 'HP iLO') || deviceBasicDetails.type === 'Supermicro IPMI'){
				delete data.SnmpCredName;
			}
			if(deviceBasicDetails.type != 'IBM IMM'){
				data.ipmiCredName = ipmiCredentialName;
				data.operation = 'ipmiCredential';//No I18N
			}
		}
		if(deviceBasicDetails.vendorName === 'Palo Alto Networks' && OPMClient.ApplicationController.currentPath === "Inventory.Device.DiscoverVPN") { //No I18n
			data.restAPICredName = $('#vpn_RestApiCredentialDrp option:selected').val();
			data.operation = 'restapicredentials';//No I18N
		}
		var restApiCred = $('#RestApiCredentialDrp option:selected').val();
		if(deviceBasicDetails.ProxmoxDetails && deviceBasicDetails.ProxmoxDetails.isPrimaryNode && restApiCred) {
			data.restAPICredName = restApiCred;
		}
		if(deviceBasicDetails.isTelemetry) {
			data = {};
			data.moid = deviceBasicDetails.moID;
			data.operation = 'telemetryCredential';//No I18N
			data.telemetryCredName = $('#TelemetryCredentialDrp option:selected').val();
		}
	}
	if(OPMClient.InventoryDeviceDetailsController.isOpenFWDevice) {
		url += "?operation=openfw";
		data = {};
		data.deviceName = deviceBasicDetails.deviceName;
		data.credentialName = $('#customDeviceCredentialList option:selected').val();
	}
   	var testResponseClbk = function(testResponse){
   		testResponseFunc(testResponse,hrType)
		};
	opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),testResponseClbk);//No I18N
}
function testResponseFunc(testResponse,hrType){
		var respData = [];
		var failedReasons = [];

	 	if(testResponse.snmp !== undefined)
	 	{
	 		if(testResponse.snmp === true || testResponse.snmp === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.topo.details.tabs.snmp',this),'result':'passed'}); //No I18N
	 		}
	 		else
	 		{
	 			var reasons = [
	 			Ember.I18n.t('webclient.intf.failure.reason1',this),//No I18N
	 			Ember.I18n.t('webclient.intf.failure.reason2',this),//No I18N
	 			Ember.I18n.t('webclient.intf.failure.reason3',this),//No I18N
	 			Ember.I18n.t('webclient.intf.failure.reason4',this)//No I18N
	 			];
	 			failedReasons.push({'protocol':Ember.I18n.t('webclient.topo.details.tabs.snmp',this),'reasons':reasons});//No I18N
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.topo.details.tabs.snmp',this),'result':'failed'});//No I18N
	 		}

	 	}else if(testResponse.telemetry !== undefined){
	 		if(testResponse.telemetry === true || testResponse.telemetry === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.opm.credential.type.telemetry',this),'result':'passed'}); //No I18N
	 		}
	 		else
	 		{
	 			var reasons = [
	 			Ember.I18n.t('webclient.telemetry.cred.failure.reason1',this),//No I18N
	 			Ember.I18n.t('webclient.telemetry.cred.failure.reason2',this),//No I18N
	 			Ember.I18n.t('webclient.telemetry.cred.failure.reason3',this),//No I18N
	 			Ember.I18n.t('webclient.telemetry.cred.failure.reason4',this)//No I18N
	 			];
	 			failedReasons.push({'protocol':Ember.I18n.t('webclient.opm.credential.type.telemetry',this),'reasons':reasons});//No I18N
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.opm.credential.type.telemetry',this),'result':'failed'});//No I18N
	 		}
		}
	 	else
	 	{
	 		if(testResponse.ucs !== undefined){
	 			if(testResponse.ucs === true || testResponse.ucs === "true"){
	 				respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.devices.ucs.ucs',this),'result':'passed'});//No I18N
	 			}else if(testResponse.ucs === false || testResponse.ucs === "false"){
	 				respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.devices.ucs.ucs',this),'result':'failed'});//No I18N
	 			}

	 		}else{
	 			if(testResponse.ipmi == undefined && !testResponse.proxmox && !OPMClient.InventoryDeviceDetailsController.isOpenFWDevice){
	 				respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('webclient.topo.details.tabs.snmp',this),'result':'nottested'});//No I18N
	 			}
	 		}

	 	}

	 	var hrCredType = "CLI";//No I18N
	 	if(hrType !== "CLI")
   		{
   			hrCredType = "WMI";//No I18N
   		}

		if(testResponse.vmware !== undefined)
	 	{
	 		if(testResponse.vmware === true || testResponse.vmware === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('dashboard.name.VMware',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.vmware === false || testResponse.vmware === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('dashboard.name.VMware',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('dashboard.name.VMware',this),'result':'nottested'});//No I18N
	 		}
	 	}
		if(testResponse.citrix !== undefined)
	 	{
	 		if(testResponse.citrix === true || testResponse.citrix === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.admin.credential.citrixcredential',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.citrix === false || testResponse.citrix === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.admin.credential.citrixcredential',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('webclient.admin.credential.citrixcredential',this),'result':'nottested'});//No I18N
	 		}
	 	}
	 	if(testResponse.nutanixServer !== undefined && testResponse.nutanixServer === true)
	 	{
	 		if(testResponse.nutanix === true || testResponse.nutanix === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('dashboard.name.nutanix',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.nutanix === false || testResponse.nutanix === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('dashboard.name.nutanix',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('dashboard.name.nutanix',this),'result':'nottested'});//No I18N
	 		}
	 	}
	 	if(testResponse.ipmi !== undefined)
	 	{
	 		if(testResponse.ipmi === true || testResponse.ipmi === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.opm.perf.settings.discovery.ipmi',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.ipmi === false || testResponse.ipmi === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.opm.perf.settings.discovery.ipmi',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('webclient.opm.perf.settings.discovery.ipmi',this),'result':'nottested'});//No I18N
	 		}
	 	}

	 	if(testResponse.aci !== undefined)
	 	{
	 		if(testResponse.aci === true || testResponse.aci === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('opm.ciscoaci.aci',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.aci === false || testResponse.aci === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('opm.ciscoaci.aci',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('opm.ciscoaci.aci',this),'result':'nottested'});//No I18N
	 		}
	 	}

	 	if(testResponse.nonsnmp !== undefined)
	 	{
	 		if(testResponse.nonsnmp === true || testResponse.nonsnmp === "true")
	 		{
				//Ignore When OpenFw Device is there
				if(!OPMClient.InventoryDeviceDetailsController.isOpenFWDevice){
	 				respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':hrCredType,'result':'passed'});//No I18N
				}
				else {
					if(testResponse.wmi === true || testResponse.wmi === "true") {
						respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':'WMI','result':'passed'});//No I18N
					} else if(testResponse.cli === true || testResponse.cli === "true") {
						respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':'CLI','result':'passed'});//No I18N
					}
				}
				var msg = Ember.I18n.t('webclient.credential.snmp.passed',this);//No I18N
	 			var colorClass = "credentialStatusPassed";//No I18N
	 		}
	 		else if(testResponse.nonsnmp === false || testResponse.nonsnmp === "false")
	 		{
				//Ignore When OpenFw Device is there
				if(!OPMClient.InventoryDeviceDetailsController.isOpenFWDevice){
					if(hrCredType === "WMI" || hrCredType === "CLI")
					{
						respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':hrCredType,'result':'failed'});//No I18N
						failedReasons.push({'protocol':hrCredType,'reasons':[testResponse.reason]});//No I18N
					}
				} else {
					if(testResponse.wmi === false || testResponse.wmi === "false") {
						respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':'WMI','result':'failed'});//No I18N
						failedReasons.push({'protocol':'WMI','reasons':[testResponse.reason]});//No I18N
					} else if(testResponse.cli === false || testResponse.cli === "false") {
						respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':'CLI','result':'failed'});//No I18N
						failedReasons.push({'protocol':'CLI','reasons':[testResponse.reason]});//No I18N
					}
				}
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':hrCredType,'result':'nottested'});//No I18N
	 		}
	 		if(testResponse.hrType==="BOTH")//No I18N
	 		{
	 			if(testResponse.cli === true || testResponse.cli === "true")//No I18N
		 		{
		 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':"CLI",'result':'passed'});//No I18N
		 		}
		 		else if(testResponse.cli === false || testResponse.cli === "false")//No I18N
		 		{
					respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':"CLI",'result':'failed'});//No I18N
	 				failedReasons.push({'protocol':"CLI",'reasons':[testResponse.clireason]});//No I18N
		 		}
	 		}
	 	}

		 if(testResponse.rest !== undefined)
	 	{
	 		if(testResponse.rest === true || testResponse.rest === "true")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.passed',this),'protocol':Ember.I18n.t('webclient.ncm.restapi',this),'result':'passed'});//No I18N
	 		}
	 		else if(testResponse.rest === false || testResponse.rest === "false")
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.failed',this),'protocol':Ember.I18n.t('webclient.ncm.restapi',this),'result':'failed'});//No I18N
	 		}
	 		else
	 		{
	 			respData.push({'status':Ember.I18n.t('webclient.credential.snmp.nottested',this),'protocol':Ember.I18n.t('webclient.ncm.restapi',this),'result':'nottested'});//No I18N
	 		}
	 	}

		if(respData.length > 0)
		{
			$('#testCredentialMsgDiv').show();
			var colNames = [Ember.I18n.t('webclient.credential.protocol',this),'',Ember.I18n.t('webclient.credential.result',this)];//No I18N
			var colModels = [{name:'protocol',index:'protocol'},{name:'status',index:'status',hidden:true},{name:'result','index':'result',formatter:testCredentialResultState}];//No I18N

	 		opm_loadJQgridWithData("#testCredResultTable", respData, colNames, colModels, "", "", "",""); //No I18N
			$('testCredResultTable').trigger('reload');
		}
		OPMClient.InventoryDeviceDetailsController.set("testCredDetails",[]);//No I18N
		if(failedReasons.length > 0)
		{

			$('#testCredentialResults').show();
		//	$('#testReasonDiv').show();
		//	$('#testReasonHeader').show();
		//	var rColsName = [Ember.I18n.t('webclient.credential.protocol',this),Ember.I18n.t('webclient.devices.snapshot.statreason',this)];//No I18N
		//	var rcolModels = [{name:'protocol',index:'protocol'},{name:'reason','index':'reason'}];//No I18N
	 	//	opm_loadJQgridWithData("#testCredReasonTable", failedReasons, rColsName, rcolModels, "", "", "",""); //No I18N
		//	$('testCredReasonTable').trigger('reload');
			OPMClient.InventoryDeviceDetailsController.set("testCredDetails",failedReasons);//No I18N
		}
}
function editResponseThreshold(name,policyName,graphName,instance,isNumeric)
{
	var editObj = {'deviceName':name,'name':name,'policyName':policyName,'graphName':graphName,'checkNumeric':isNumeric};//No I18N
	if(instance !== undefined && instance !== null && instance !== "") {
		editObj.instanceName = instance;
	}
	OPMClient.InventoryDeviceDetailsController.set('responseTimeEditObj',editObj);//No I18N
	opm_transitionToParentRoute('Inventory.Device.RespThreshold'); //No I18N
}
function editUrlMonitorFrmSnapshot(name,urlName)
{
	OPMClient.SettingsAddEditController.pageObj = {'urlName':urlName,'isDeviceSnapshotPage':true,'name':name};//No I18N
	OPMClient.SettingsAddEditController.set('fromSnapshotPage',true);//No I18N
	opm_transitionToParentRoute('Inventory.Device.EditUrl'); //No I18N

}
function testUrlMonitorFrmSnapshot(name,urlName)
{
	OPMClient.SettingsAddEditController.pageObj = {'urlName':urlName,'isDeviceSnapshotPage':true,'name':name};//No I18N
	opm_transitionToParentRoute('Inventory.Device.TestUrl'); //No I18N

}

function opm_removeItemFromArray(arr,item)
{
	if(arr.indexOf(item) !== -1)
	{
		arr.splice( $.inArray(item, arr), 1 );
	}
}
function opm_launchApp(name)
{
	var userAgent = window.navigator.userAgent;
	if(OPMClient.ApplicationController.isDemoUser){
	 	opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.api.demoopmanager.notauthmsg',this));//No I18N
	 	return;
	 }
	if(!(userAgent.indexOf('MSIE ')>0 || userAgent.indexOf('Trident/')>0 || userAgent.indexOf('Edge/')>0))
	{
	 alert(Ember.I18n.t('webclient.devices.rdp.browsermsg',this));//No I18n
	 return;
	 }
	if(userAgent.indexOf('Edge/')>0)
	{
		alert(Ember.I18n.t('webclient.microsoftedge.notsupported.activexobject',this)); //No I18n
	 	return;
	}
	try
	{
	 var ws = new ActiveXObject("WScript.Shell");
	ws.Exec("%systemRoot%\\System32\\mstsc.exe /v:"+name);//No I18n
}
	catch(err)
	{
		if(userAgent.indexOf('Trident/')>0)
		{
			alert(Ember.I18n.t('webclient.ie.stepstorun.activexobject',this)); //No I18n
		}
		else
		{
			opm_infoMsgs('infoMsg',err.message); //No I18N
		}
	}
}
function opm_addCategory(){
	var selectedMenu = (OPMClient.ApplicationController.selectedMenu==="Virtualization" || OPMClient.ApplicationController.selectedMenu===undefined)?(window.OPM.oldView?"Summary":"Monitoring"):OPMClient.ApplicationController.selectedMenu;//No I18N
	if(selectedMenu === 'Storage'){
		selectedMenu = 'OpStor';//No I18n
		settingsGlobalRoute.transitionTo('Inventory.List.'+selectedMenu+'.Sub.AddCategory'); //No I18n
	}else{
	settingsGlobalRoute.transitionTo('Inventory.List.'+selectedMenu+'.Sub.AddCategory','Devices'); //No I18n
}

}
function displayRearmCondition(sel,dispId)
{
	if(sel.value === '>=')	//No I18N
	{
		document.getElementById(dispId).value='<=';
	}
	else if(sel.value === '<=')
	{
		document.getElementById(dispId).value='>=';
	}
}
function setRearmCondition(val,dispId)
{
	if(val === '>=')	//No I18N
	{
		document.getElementById(dispId).value='<=';
	}
	else if(val === '<=')
	{
		document.getElementById(dispId).value='>=';
	}
}
function setHideRearm(val,elemtId)
{
	if(val === '=')
	{
		document.getElementById(elemtId).style.display="none";
	}
	else
	{
		document.getElementById(elemtId).style.display="";
	}
}
function hideRearm(sel,elemtId)
{
	if(sel.value === '=')
	{
		document.getElementById(elemtId).style.display="none";
	}
	else
	{
		document.getElementById(elemtId).style.display="";
	}
}
function dt_changeThreshold_new(thisDiv){
	$(thisDiv).closest('.opmForm').find('#snmpRearmValue').prop('disabled',false); //No I18N
	var selectVal=$(thisDiv).val();

	if($(thisDiv).attr('id')!=="snmpWarnType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.opmForm').find('#snmpWarnType').val(selectVal).select2();
	}
	if($(thisDiv).attr('id')!=="snmpTroubleType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.opmForm').find('#snmpTroubleType').val(selectVal).select2();
	}
	if($(thisDiv).attr('id')!=="snmpErrorType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.opmForm').find('#snmpErrorType').val(selectVal).select2();
	}
	if(selectVal==='min'){//No I18N
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('maxEqual').select2(); //No I18N
        $(thisDiv).closest('.opmForm').find('#lowerLimitType').val('max').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitType').val('min').select2().trigger("change"); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitTypeQCW').val('max').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitTypeQCW').val('min').select2().trigger("change"); //No I18N
	}
	else if(selectVal==='max'){
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('minEqual').select2(); //No I18N
        $(thisDiv).closest('.opmForm').find('#lowerLimitType').val('min').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitType').val('max').select2().trigger("change"); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitTypeQCW').val('min').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitTypeQCW').val('max').select2().trigger("change"); //No I18N
	}
	else if(selectVal==='equal'){
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('equal').select2(); //No I18N
	}
	else if(selectVal==='minEqual'){
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('max').select2(); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitType').val('max').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitType').val('min').select2().trigger("change"); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitTypeQCW').val('max').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitTypeQCW').val('min').select2().trigger("change"); //No I18N
	}
	else if(selectVal==='maxEqual'){
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('min').select2(); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitType').val('min').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitType').val('max').select2().trigger("change"); //No I18N
		$(thisDiv).closest('.opmForm').find('#lowerLimitTypeQCW').val('min').select2().trigger("change"); //No I18N
        $(thisDiv).closest('.opmForm').find('#upperLimitTypeQCW').val('max').select2().trigger("change"); //No I18N
	}
	else if(selectVal==='notEqual'){
		$(thisDiv).closest('.opmForm').find('#snmpRearmType').val('equal').select2(); //No I18N
		$(thisDiv).closest('.opmForm').find('#snmpRearmValue').prop('disabled',true); //No I18N
	}
	else{
		$(thisDiv).closest('.opmForm').find('#snmpRearmValue').prop('disabled',false); //No I18N
	}
	checkThresholdEnabledInDTBulk('settings',$(thisDiv).closest('.opmForm'));//No I18N
}
function dt_changeThreshold(thisDiv){
	$(thisDiv).closest('.singleColList').find('#snmpRearmValue').prop('disabled',false); //No I18N
	var selectVal=$(thisDiv).val();

	if($(thisDiv).attr('id')!=="snmpWarnType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.singleColList').find('#snmpWarnType').val(selectVal).select2();
	}
	if($(thisDiv).attr('id')!=="snmpTroubleType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.singleColList').find('#snmpTroubleType').val(selectVal).select2();
	}
	if($(thisDiv).attr('id')!=="snmpErrorType" && (selectVal==='min' || selectVal==='max' || selectVal==='equal' || selectVal==='minEqual' || selectVal==='maxEqual' || selectVal==='notEqual')){
		$(thisDiv).closest('.singleColList').find('#snmpErrorType').val(selectVal).select2();
	}
	if(selectVal==='min'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('max').select2(); //No I18N
	}
	else if(selectVal==='max'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('min').select2(); //No I18N
	}
	else if(selectVal==='equal'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('equal').select2(); //No I18N
	}
	else if(selectVal==='minEqual'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('max').select2(); //No I18N
	}
	else if(selectVal==='maxEqual'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('min').select2(); //No I18N
	}
	else if(selectVal==='notEqual'){
		$(thisDiv).closest('.singleColList').find('#snmpRearmType').val('equal').select2(); //No I18N
		$(thisDiv).closest('.singleColList').find('#snmpRearmValue').prop('disabled',true); //No I18N
	}
	else{
		$(thisDiv).closest('.singleColList').find('#snmpRearmValue').prop('disabled',false); //No I18N
	}
	if(OPMClient.ApplicationController.currentPath === 'Settings.Configurations.QuickConfig.Operation.EditThreshold'){
		checkThresholdEnabledOrNot('QCW');//No I18N
	}else{
		checkThresholdEnabledInDTBulk('bulksnmp',$(thisDiv).closest('.singleColList'));//No I18N
	}
	if($('#AddMonitorsTwo').length){
		$.each($('#AddMonitorsTwo .singleColList'),function(index,currdiv){
	        removeIdForSelect2(currdiv);
	        $(currdiv).find('.select2').select2();
	        addIdForSelect2(currdiv);
	    });
	}
}
function loadOPMProbeURL(grid,row){
	var probeName = grid.jqGrid('getCell', row, 'natName'); //No I18N
    if (probeName !== null && probeName !== "")
    {
    	var protocol = grid.jqGrid('getCell', row, 'natProtocol'); //No I18N
    	var port = grid.jqGrid('getCell', row, 'natPort'); //No I18N
    	var probeUrl = protocol+"://"+probeName+":"+port;
        opm_goToProbeLink(probeUrl); //No I18N
	}
}
function opm_goToProbeLink(url)
{
	window.open(url,'_newtab');
}
function changeThresholdTypes(wTyp,trTyp,crTyp,rTyp,rVal,symbol)
{
	$("#"+wTyp).val(symbol);
	  $("#"+trTyp).val(symbol);
	  $("#"+crTyp).val(symbol);
	 $('#'+rTyp+',#'+rVal).prop('disabled',false);
	 switch(symbol)
	{
		case "min" : //No I18N
			$("#"+rTyp).val("maxEqual"); //No I18N
			break;
		case "minEqual" : //No I18N
			$("#"+rTyp).val("max"); //No I18N
			break;
		case "max" : //No I18N
			$("#"+rTyp).val("minEqual"); //No I18N
			break;
		case "maxEqual" : //No I18N
			$("#"+rTyp).val("min"); //No I18N
			break;
		case "equal" : //No I18N
			$("#"+rTyp).val("equal"); //No I18N
			break;
		case "notEqual" : //No I18N
			$("#"+rTyp).val("equal"); //No I18N
			$("#"+rVal).val("");//No I18N
			 $('#'+rTyp+',#'+rVal).prop('disabled',true);
			break;
	}

}
function validatescriptMonitorThreshold(dataType)
{

	if(dataType !== undefined && dataType === "3")
	{
		if(!opm_doesThresholdConfigured('warningThresholdValue', 'troubleThresholdValue', 'criticalThresholdValue', 'rearmValue') || !opm_validateMonitorThreshold_Float('warningThresholdValue', 'troubleThresholdValue', 'criticalThresholdValue', 'rearmValue','warningThresholdType'))
		{
			return false;
		}
	}
	else
	{
		if(dataType !== undefined && dataType === "2")
		{
			if(!opm_doesThresholdConfigured('warningThresholdValue', 'troubleThresholdValue', 'criticalThresholdValue', 'rearmValue'))
			{
				return false;
			}
		}
		else
		{
		if(!opm_doesThresholdConfigured('warningThresholdValue', 'troubleThresholdValue', 'criticalThresholdValue', 'rearmValue') || !opm_validateMonitorThreshold('warningThresholdValue', 'troubleThresholdValue', 'criticalThresholdValue', 'rearmValue','warningThresholdType'))
		{
			return false;
			}
		}
	}
	return true;

	}
function opm_dashProbeChange(thisDiv){
	var probeID=$(thisDiv).val();
	if(probeID==="all"){
		OPMClient.HomeDetailsController.probeID="";
	}
	else{
		OPMClient.HomeDetailsController.probeID=probeID;
	}
	reloadDashboard();
	// OPMClient.CCTV.getHomeDashDetails(OPMClient.HomeDetailsController.dashboardName,OPMClient.HomeDetailsController.dashboardType);
}
function OPM_editProbeDetails(probeName,serverMode,contactPerson,contactEmail){
	OPMClient.SettingsAddDeviceController.probeName=probeName;
	OPMClient.SettingsAddDeviceController.contactPerson=contactPerson;
	OPMClient.SettingsAddDeviceController.contactEmail=contactEmail;
	if (window.OPM.showMSPAllocation){
		settingsGlobalRoute.transitionTo('Settings.Configurations.Customer.EditProbe', probeName); //No I18N
	} else if (window.OPM.isRMMCentral) {
		settingsGlobalRoute.transitionTo('Settings.Configurations.Probes.Edit', probeName); //No I18N
	} else {
		settingsGlobalRoute.transitionTo('Settings.Configurations.Probes.Index.Edit'); //No I18N
	}
}

function OPM_editProxyDetails(){
	settingsGlobalRoute.transitionTo('Settings.Configurations.CentralDetails.Proxy'); //No I18N
}

function probeDownloadZip(probeName) {
	var url = window.OPM.apiUrlPattern + '/admin/getProbeZip?probeName='+probeName;//No I18N
	opm_exportFilesPostMethod(url,{},"_blank");//No I18N
}

function opm_KeyCopyToClipBoard(){
	var str = OPMClient.ApplicationController.installationKey;
	// Create new element
   var el = document.createElement('textarea');
   // Set value (string to be copied)
   el.value = str;
   // Set non-editable to avoid focus and move outside of view
   el.setAttribute('readonly', '');
   el.style = {position: 'absolute', left: '-9999px'};
   document.body.appendChild(el);
   // Select text inside element
   el.select();
   // Copy text to clipboard
   document.execCommand('copy'); //No I18N
   // Remove temporary element
   document.body.removeChild(el);
   opm_infoMsgs('successMsg',Ember.I18n.t('webclient.settings.installationkey.copied',this)); //No I18N
}
function opm_widgetSelectChange(systemID){
	var urlsArr = [{"url":window.OPM.apiUrlPattern + '/diagnostics/getDataCollectionRate?graphType=Table&probe=All&module=All',//No I18N
				   "id":'ArchivedData'//No I18N
				},
				{
					"url":window.OPM.apiUrlPattern + '/diagnostics/getDataCollectionRate?graphType=ModuleLoad&probe=All&module=All',//No I18N
					"id":'ModulesLoaded'//No I18N
				},
				{
					"url":window.OPM.apiUrlPattern + '/diagnostics/getDataCollectionRate?graphType=Event&probe=All&module=All',//No I18N
					"id":'EventsReceived'//No I18N
				}];
	$.each(urlsArr, function(ind,ob){
		var dataObj = {};
		if(ob.id===systemID){
		var zcDCRObj = {"placeholder":[],//No I18N
					"chartobj":[]//No I18N
				};
			if(ob.url.indexOf('&probe=')){
				ob.url=ob.url.split("&probe=")[0];
			}
			ob.url=ob.url+"&module=All&probe="+$('#'+systemID+"_select").val(); //No I18N
			var systemClbk = function(response,ob){
			//	i++;
				var systemWidget = ob.id;
				if(systemWidget === "ArchivedData" || systemWidget === "ModulesLoaded" || systemWidget === "EventsReceived"){//No I18N
					if(Object.keys(response).length>0){

						var dataArr = response[Object.keys(response)[0]];
						if(dataArr === "" || dataArr === {} || $.isEmptyObject(dataArr) || dataArr.length === 0){//No I18N
							dataObj.chartData = [];
						}else{
							dataObj.chartData = dataArr;
						}
						zcDCRObj.chartobj.push(opm_zchartAddObj(systemWidget,dataObj));
						$("#"+systemWidget).empty();
						zcDCRObj.placeholder.push(systemWidget);
					}
					else{
						//$('#'+systemWidget+'_select').hide().next().hide();
						dataObj.chartData = [];
						zcDCRObj.chartobj.push(opm_zchartAddObj(systemWidget,dataObj));
						$("#"+systemWidget).empty();
						zcDCRObj.placeholder.push(systemWidget);
					}
				   	zChart(zcDCRObj);
				}

			};
			//opm_getJSONcallback(ob.url,systemClbk);
			$.getJSON(ob.url,function(jsonData){ //No I18N
				systemClbk(jsonData,ob);
			});
		}
			});
}
function loadAssociatedURLProfiles(data)
{
	var dataArr = jQuery.makeArray(data);
	var colNamesList = ['',Ember.I18n.t('webclient.admin.profiledetails.profilename',this),Ember.I18n.t('webclient.map.type',this),Ember.I18n.t('webclient.admin.traps.action',this)]; //No I18N
	var colModelList = [
		{ name: 'profileId', index: 'profileId',hidden:true},//No I18N
		{ name: 'profileName', index: 'profileName', formatter: jqGridHTMLEncode},//No I18N
		{ name: 'profileLabel', index: 'profileLabel'},//No I18N
		{ name: 'actions', index: 'actions',classes:"pointer",formatter:deleteAssociateProfile}//No I18N
	];
	opm_loadJQgridWithData("#associatedProfilesList", dataArr, colNamesList, colModelList, "", "","", ''); //No I18N
	$('#associatedProfilesList').jqGrid('setGridWidth', $('#associatedProfilesList').closest(".slideContHolder").width()-100);
}
function disableProcessRearm(val, divId){
	if(val==="=" || val==="!="){
		$("#"+divId).attr('disabled', true);
		$("#"+divId).val('');
	}
	else
	{
		$("#"+divId).attr('disabled', false);
	}
}
function callOptionButton()
{
	$('.multipleAlarms.actions').off('click','.opmDeviceMoreListBtn');
	$('.multipleAlarms.actions').on('click','.opmDeviceMoreListBtn',function(){
		if(!$(this).hasClass('active')){
			alarmsMenuAccr();
			$(this).addClass('active');//No I18N
			$('.opmDeviceMoreList').css({display:'block'}).animate({opacity:'1',top:'40px'},300);//No I18N
			$('.opmDeviceMoreList').find('li')[0].focus();
		}else{
			$(this).removeClass('active');//No I18N
			$('.opmDeviceMoreList').css({display:'none',opacity:'0',top:'0'});//No I18N
		}
	});

	$('body').click(function(e){
		opmDeviceMoreListBtn =$('.opmDeviceMoreListBtn');
		if(opmDeviceMoreListBtn.hasClass('active')){
			if(!$(e.target).closest('.opmDeviceMoreListBtn').length){
				$('.opmDeviceMoreListBtn').removeClass('active');//No I18N
				$('.opmDeviceMoreList').css({display:'none',opacity:'0',top:'0'});//No I18N
			}
		}
	});
}
function alarmsMenuAccr()
{

	var hidePingTraceRoute = (OPMClient.AlarmDetailsController.alarmDetails.entity !== undefined && (OPMClient.AlarmDetailsController.alarmDetails.entity.startsWith('WMISchdulerRefresh') || OPMClient.AlarmDetailsController.alarmDetails.entity.startsWith('DatapollThreadBlocked')));//No I18N
    var hideAlarmActionOnAlarmSnapshot = OPMClient.AlarmDetailsController.alarmDetails.source === 'System' || hidePingTraceRoute ||   OPMClient.AlarmDetailsController.alarmDetails.entity === "DatapollThreadBlocked" || //No I18N
    ["WanIPSite", "WanIP", "APM", "Probe", "Data Collection", "External Object"].includes(OPMClient.AlarmDetailsController.alarmDetails.category) || ["SelfMonitoring Alarm", "NFA_TRAFFIC", "NFA_ALERTS", "FOS SelfMonitor Alarm", "File Integrity Events", "Security Analytics"].includes(OPMClient.AlarmDetailsController.alarmDetails.EVENTTYPE) || //No I18N
    OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(OPMClient.AlarmDetailsController.alarmDetails.EVENTTYPE) || OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(OPMClient.AlarmDetailsController.alarmDetails.ALARMCODE) ||
    (OPMClient.AlarmDetailsController.alarmDetails.category === "MailServer" && (window.OPM.isNFA || window.OPM.isFWA || window.OPM.isNCM)); //No I18N


			$('#alarmListViewActions').empty();
			$('#detailviewActions').empty();

            var tempActions = OPMClient.AlarmOptionsController.alarmActions;
			OPMClient.AlarmOptionsController.set('selectedEntities',[]);//No I18n
			if(OPMClient.AlarmOptionsController.isMultipleAlarmSelected && OPMClient.AlarmOptionsController.isListView){

				var grid = jQuery("#opm_Alarms");	//No I18N
				var selRowIds = grid.jqGrid('getGridParam','selarrrow');	//No I18N
				var entityArr = [];
				$.each(selRowIds, function(){
					var id = this;
					var entity = grid.jqGrid('getCell', id, 'alarmId'); //No I18N
					entityArr.push(entity);
				});
				OPMClient.AlarmOptionsController.set('selectedEntities',entityArr); //No I18N

				$.each(tempActions,function(k,v){

					if(v.isMultiSupport && v.showAction && v.action != 'web'){
						$('#alarmListViewActions').append('<li class="OpMToolTip '+v.classes+'" onclick="'+v.actionName+'(&#34;'+v.functArg+'&#34;,&#34;'+entityArr+'&#34;)" data-content="" role="button" tabindex="0">'+v.displayName+'</li>');
					}
				});

			}else{

				if(OPMClient.AlarmOptionsController.isListView){
				var rId = $("#opm_Alarms").jqGrid('getGridParam','selrow');
				var entity = $("#opm_Alarms").jqGrid('getCell',rId,'alarmId');
					OPMClient.AlarmOptionsController.selectedEntities.push(entity);
			}
            if(OPMClient.AlarmOptionsController.selectedEntities.length == 1)
            {
                OPMClient.Alarms.getAlarmDetails(OPMClient.AlarmOptionsController.selectedEntities[0]);
            }
			var eventObj = OPMClient.AlarmDetailsController.alarmDetails;
				OPMClient.AlarmDetailsController.set('isSyslogAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isTrapAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isEventlogAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isURLAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isPerformanceAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isProcessAlarm',false); //No I18N
				OPMClient.AlarmDetailsController.set('isCredentialAlarm',false) //No I18N

			//****To set the alarm specific options ***//


			var dType = "";
				if(eventObj.entity !== undefined && eventObj.entity.indexOf("IF_") !== -1){
					dType = "INTERFACE"; //No I18N
				}else if(eventObj.entity !== undefined && eventObj.category === "URL")//No I18N
				{
					dType = "URL" ; //No I18N
				}
				
				// Check if it's a problem alarm (entity starts with EC_PROBLEM_)
				var isProblemAlarm = eventObj !== undefined && eventObj.entity !== undefined && eventObj.entity.indexOf('EC_PROBLEM_') === 0;
				
				$.each(tempActions,function(k,v){
					// For problem alarms, only show testAct action and hide all others
					if(isProblemAlarm && v.action !== "testAct") {
						v.showAction = false;
						return true;
					}
					
					if(hideAlarmActionOnAlarmSnapshot  == true && v.action != "suppressAlarm") {
                        v.showAction = false;
                        return true;
                    }
                    if(v.action == "suppressAlarm" && window.OPM.showSuppressAlarm == true && eventTypesForSuppression.includes(eventObj.EVENTTYPE)) {
                        OPMClient.AlarmDetailsController.set('showSuppressionAction',true); //No I18N
                        $('.alarmsPageActions, .deviceslideActionBtn').show();
                        v.showAction = true;
                    } else if(v.action == "suppressAlarm" &&  (window.OPM.showSuppressAlarm == false || !eventTypesForSuppression.includes(eventObj.EVENTTYPE))) {
                        v.showAction = false;
                        OPMClient.AlarmDetailsController.set('showSuppressionAction',false); //No I18N
                    }
					if(v.action == "wflow" && OPMClient.AlarmDetailsController.alarmDetails.hideExecuteWorkflow == true) {
						v.showAction = false;
						return true;
					}
						if(v.action == "wflow" && OPMClient.AlarmDetailsController.alarmDetails.hideExecuteWorkflow == true) {
                            v.showAction = false;
                        }
						if(v.action =="falseAlarms")
						{
							if((window.OPM.userPermissions.monitoringWrite && !window.OPM.isCentralServer && !window.OPM.isMSPCentral && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition)) {
								v.showAction = true;
							} else {
								v.showAction = false;
							}
							var isML_Alarm = OPMClient.AlarmDetailsController.alarmDetails.ALARMCODE.indexOf('ML_') == 0//No I18n
							v.showAction = (isML_Alarm && v.showAction)  ? true : false;
						}
					if(v.action == "avail" || v.action == "testAct" || v.action == "notify" || v.action == "wflow" || v.action == "rdp")
					{
						if(v.action == "avail") {
							v.showAction = (window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer) ;
						} else if(v.action == "notify") {
							v.showAction = (window.OPM.isOPM && !window.OPM.isCentralServer && window.OPM.userPermissions.notificationProfileWrite && !window.OPM.userPermissions.devGrouporBVRestricted && !isNotMspAdmin()) ;
						} else if(v.action == "wflow") {
							v.showAction = (window.OPM.isOPM && !window.OPM.isCentralServer && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition && OPMClient.ApplicationController.showWorkflow);
						} else if(v.action == "testAct") {
							v.showAction = (window.OPM.isOPM && window.OPM.userPermissions.notificationProfileWrite);
						}
						if ((v.action == "testAct" || v.action == "notify")) {
							if(eventObj!=undefined && eventObj.entity !=undefined)
							{
								if(v.action === "notify") {
									 if(eventObj.entity.indexOf('AlarmProfile_') >=0) {
									 	v.showAction = false;
									 }
								}
								if(eventObj.entity.indexOf('VMware_NIC_') >= 0 || eventObj.entity.indexOf('VMware_HBA_') >= 0 || eventObj.category === "Probe")
								{
									v.showAction = false;
								}
							}
						}
						if(eventObj.category == "NetworkPath" || eventObj.category == "Group" || eventObj.category ==="RemoteCollector")
						{
							v.showAction = false;
						}
						if((eventObj.category == "WanIPSite" || eventObj.category == "WanIP") &&  (v.action == "notify" || v.action == "wflow" || v.action == "testAct"))
						{
							v.showAction = false;
						}
						if(eventObj.category == "WanIPSite" && v.action == "avail"){
							v.showAction = false;
						}
						if(OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.EVENTTYPE) || OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.ALARMCODE)){
							v.showAction = false;
						}
						if((eventObj.isPollerDevice !== undefined && eventObj.isPollerDevice) && (v.action == "testAct" || v.action == "wflow" || v.action == "rdp")){
							v.showAction = false;
						}
					}
					if(v.action === "events" || v.action === "syslog" || v.action === "trap" || v.action === "process" || v.action === "threshold" || v.action === "url" || v.action === "unAck" || v.action === "monitor" || v.action == "testCred" || v.action == "assoCred")
					{
						v.showAction = false; //((window.OPM.isAuthorized && window.OPM.isOPM && !window.OPM.isCentralServer) && false);
					}
					else if(v.action === "rdp")
					{
						if(OPMClient.AlarmDetailsController.alarmDetails.vendorName == "Microsoft" && window.OPM.userPermissions.monitoringWrite)
						{
							var systemSettingsDetails = OPMClient.Settings.getSystemSettingsDetails();
							v.functArg = OPMClient.AlarmDetailsController.alarmDetails.dnsName+"&#34;,&#34;"+OPMClient.AlarmDetailsController.alarmDetails.source;
							v.showAction = (systemSettingsDetails.systemSettings ? systemSettingsDetails.systemSettings.showRemoteDesktop == "true" && systemSettingsDetails.systemSettings.isRDPChanged == false && window.OPM.isOPM && !window.OPM.isCentralServer && !window.OPM.isOPMStandardEdition && !window.OPM.isMSPCentral && !window.OPM.isOPMEEUnifiedConsoleView : false);
						}
						else
						{
							v.showAction = false;
						}
					}

					if(v.action === "events" && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Eventlog") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isEventlogAlarm',true); //No I18N
						v.showAction=(window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && OPMClient.AlarmDetailsController.isEventlogAlarm);
						if(OPMClient.ApplicationController.isMSPAllProbeSelected) {
							v.showAction = false;
						}
					}
					else if(v.action === "syslog" && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Syslog") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isSyslogAlarm',true); //No I18N
						v.showAction=(window.OPM.isOPM && OPMClient.AlarmDetailsController.isSyslogAlarm && window.OPM.userPermissions.monitoringWrite && !window.OPM.userPermissions.devGrouporBVRestricted);
						if(OPMClient.ApplicationController.isMSPAllProbeSelected) {
							v.showAction = false;
						}
					}
					else if(v.action === "trap" && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Trap") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isTrapAlarm',true); //No I18N
							v.showAction=(window.OPM.viewTrap && !window.OPM.userPermissions.devGrouporBVRestricted);
						if(OPMClient.ApplicationController.isMSPAllProbeSelected) {
							v.showAction = false;
						}
					}
					else if(v.action === "process" && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Process") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isProcessAlarm',true); //No I18N
						v.showAction=(window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && OPMClient.AlarmDetailsController.isProcessAlarm);
					}
					else if(v.action === "threshold" && (eventObj.entType !== undefined && (eventObj.entType.indexOf("Url") !== -1)))
					{
						OPMClient.AlarmDetailsController.set('isURLAlarm',true); //No I18N
						v.actionName = "editURLThresholdFrmAlarm";//No I18N
						v.functArg = "alarmsRespThresholdEdit";//No I18N
						v.showAction = (window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer && OPMClient.AlarmDetailsController.isURLAlarm);
					}
					else if((v.action === "threshold" || v.action === "url") && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Threshold") !== -1) && eventObj.entType !== undefined && (eventObj.entType.indexOf("Url") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isURLAlarm',true); //No I18N
						v.actionName = "testUrlFrmAlarm";//No I18N
						v.functArg = "settingsMonitorsUrlMonitorsAddEdit";//No I18N
						v.showAction=(window.OPM.userPermissions.monitoringRead && window.OPM.isOPM && !window.OPM.isCentralServer && OPMClient.AlarmDetailsController.isURLAlarm);
					}
					else if((v.action === "threshold" || v.action === "monitor") && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Threshold") !== -1) && eventObj.entType === undefined)
					{
						OPMClient.AlarmDetailsController.set('isPerformanceAlarm',true); //No I18N
						if(v.action === "threshold") {
							v.actionName = "editThresholdAlarm";//No I18N
							v.functArg = "inventoryDeviceMonitorsMonAction";//No I18N
						}
						v.showAction=(window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer && OPMClient.AlarmDetailsController.isPerformanceAlarm);
						if(v.action === "threshold" && OPMClient.ApplicationController.isMSPAllProbeSelected) {
							v.showAction = false;
						}
						if(eventObj.category === "NetworkPath" || eventObj.category === "LogicalGroup" || eventObj.category === "RemoteCollector")
						{
							v.showAction = false;
						}
						if(v.action==="threshold" && eventObj.ALARMCODE.indexOf("BGPPeer") !== -1) {
							v.showAction = false;
						}
						if(OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.EVENTTYPE) || OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.ALARMCODE)){
							v.showAction = false;
						} else if(eventObj.category == "WanIPSite" || eventObj.category == "WanIP")
						{
							v.showAction = false;
						}
						
					}
					else if((v.action === "rdp" || v.action === "notify") && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("URL") !== -1 || eventObj.ALARMCODE !== undefined && eventObj.ALARMCODE.indexOf("THRESHOLD-DOWN_VMware-datastore") !== -1))
					{
						v.showAction = (v.showAction && false);
					}
					else if(v.action === "avail" && (eventObj.entType !== undefined && eventObj.entType.indexOf("Url") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isURLAlarm',true); //No I18N
					}

					if((eventObj.category === "NetworkPath" || eventObj.category === "Group" || eventObj.category === "RemoteCollector") && (v.action === "unmanage" || v.action === "manage"))
					{
						v.showAction = false;
					}
					else if((OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.EVENTTYPE) || OPMClient.AlarmDetailsController.sdwanChildEventCodes.contains(eventObj.ALARMCODE)) && (v.action === "unmanage" || v.action === "manage")){
						v.showAction = false;
					}
					else
					{
						if(v.action === "manage" && (eventObj.managed || eventObj.managed === "true")) {
							v.showAction = ((window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer) && false);
						}
						else if(v.action === "manage" && (!eventObj.managed || eventObj.managed === "false")) {
							v.functArg = true+'&#34;,&#34;'+dType+'&#34;,&#34;'+OPMClient.AlarmDetailsController.alarmDetails.source;
							v.showAction = ((window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer) && true);
						}
						if(v.action === "unmanage" && (eventObj.managed  || eventObj.managed === "true")) {
							v.functArg = false+'&#34;,&#34;'+dType+'&#34;,&#34;'+OPMClient.AlarmDetailsController.alarmDetails.source;
							v.showAction = ((window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer) && true);
						} else if(v.action === "unmanage" && (!eventObj.managed  || eventObj.managed === "false")) {
							v.showAction = ((window.OPM.userPermissions.monitoringWrite && window.OPM.isOPM && !window.OPM.isCentralServer) && false);
						}
					}

					if(v.action === "threshold" && (eventObj.EVENTTYPE !== undefined && eventObj.EVENTTYPE.indexOf("Eventlog") !== -1))
					{
						OPMClient.AlarmDetailsController.set('isEventlogAlarm',true); //No I18N
						v.showAction=false;
					}

					if(v.action === "web" && OPMClient.AlarmDetailsController.isWebAlarm)
					{
						v.showAction = (window.OPM.isOPM && OPMClient.AlarmDetailsController.isWebAlarm && window.OPM.userPermissions.alarmsWrite);
					}
					else if(v.action === "web" && !OPMClient.AlarmDetailsController.isWebAlarm) {
						v.showAction = false;
					}
					if(v.action === "eMail" ||v.action === "ePDF" ||v.action === "eXLS")
					{
                        v.showAction = (window.OPM.userPermissions.alarmsWrite && !window.OPM.userPermissions.devGrouporBVRestricted);
                    }
					if(v.action === "eMail" && window.OPM.probeRestrictedAllProbeSelected) {
						v.showAction = false;
					}
					if(eventObj.EVENTTYPE != undefined && (eventObj.EVENTTYPE == "Credential Test" || eventObj.EVENTTYPE == "Credential-Test-Passed")) {
						if(v.action == "avail" || v.action == "testAct" || v.action == "notify" || v.action == "wflow" || v.action == "rdp") {
							v.showAction = false;
						} else if(v.action == "testCred" || v.action == "assoCred") {
							OPMClient.AlarmDetailsController.set('isCredentialAlarm',true); //No I18N
							v.showAction = (window.OPM.userPermissions.discoveryWrite && window.OPM.isOPM && !window.OPM.isCentralServer && OPMClient.AlarmDetailsController.isCredentialAlarm);
						}
					}
					if(eventObj.EVENTTYPE !== undefined && ["NFA_TRAFFIC", "NFA_ALERTS", "Security Analytics"].indexOf(eventObj.EVENTTYPE) > -1 && ["wflow", "testAct", "avail", "notify"].indexOf(v.action) > -1) {
						v.showAction = false;
					}

					if((v.action == "wflow" || v.action == "testAct" || v.action == "avail" || v.action == "notify" || v.action == "manage" || v.action == "unmanage") && eventObj.category == 'APM') {
						v.showAction = false;
					}
					if((v.action == "avail" || v.action == "rdp") && OPMClient.AlarmDetailsController.alarmDetails.entity.indexOf("AlarmProfile_")>=0) {
						v.showAction = false;
					}
					if(['wflow','testAct','avail','notify','manage','unmanage','rdp'].contains(v.action) && (eventObj.entity !== undefined && eventObj.entity.startsWith('DatapollThreadBlocked'))){
						v.showAction = false;	
					}

					if(OPMClient.AlarmOptionsController.isListView) {
						if(v.action == "suppressAlarm") {
                            v.showAction = false;
                        }
						if(v.showAction) {
							$('#alarmListViewActions').append('<li class="OpMToolTip '+v.classes+'" onclick="'+v.actionName+'(&#34;'+v.functArg+'&#34;)" data-content="" role="button" tabindex="0">'+v.displayName+'</li>');
						}
					}

					if(OPMClient.AlarmOptionsController.isShortsummary)
					{
						if(v.showAction) {
							$('#alarmListViewActions').append('<li class="OpMToolTip '+v.classes+'" onclick="'+v.actionName+'(&#34;'+v.functArg+'&#34;)" data-content="" role="button" tabindex="0">'+v.displayName+'</li>');
						}
					}

					if(eventObj.category == "External Object"){
						v.showAction = false;
					}

					if('monitor' === v.action && v.showAction && eventObj.hideTestMonitor){
						v.showAction = false;
						$("#alarmListViewActions .testMonitor").hide();
					}

					if(OPMClient.AlarmOptionsController.isDetailsPage && OPMClient.AlarmDetailsController.alarmDetails.error==undefined)
					{
						var hideDatastoreactions = ["showDeviceAvail","manageUnmanageFrmAlarm","testThresholdfrmAlarm"];//No I18n
						if(OPMClient.AlarmDetailsController.alarmDetails.isDatastore && hideDatastoreactions.indexOf(v.actionName) >= 0) {
							v.showAction = false;
						}
						if(v.action =="falseAlarms")
						{
							if(window.OPM.isOPMEEUnifiedConsoleView && window.OPM.isCentralServer) {
								v.showAction = false;
							}

						var isML_Alarm = OPMClient.AlarmDetailsController.alarmDetails.ALARMCODE.indexOf('ML_') == 0//No I18n
							v.showAction = isML_Alarm && v.showAction  ? true : false;
						}

						if(v.showAction && !(v.action === "eMail" ||v.action === "ePDF" ||v.action === "eXLS")) {
							if(v.action === "testAct" && isProblemAlarm) {
								v.displayName = Ember.I18n.t('webclient.event.correlation.triggerNPT');//No I18n
							}
							else if(v.action === "testAct"){
								v.displayName = Ember.I18n.t('webclient.Test.Action');//No I18n
							}
							if(!(OPMClient.ApplicationController.isFreeEdition && OPMClient.AlarmDetailsController.alarmDetails.entity=='FreeLicenseDeviceCountExceeded')) {
								$('#detailviewActions').append('<b class="'+v.classes+'" onclick="'+v.actionName+'(&#34;'+v.functArg+'&#34;)" data-content="" role="button" tabindex="0">'+v.displayName+'</b>');
							}
						}
					}
				});
			}
			/*$('.deviceslideActionBtn').off().click(function(){
				if(!$('body').hasClass('deviceMenuSlideIn'))//No I18n
				{
					$('body').addClass('deviceMenuSlideIn');//No I18n
				}else{
					$('body').removeClass('deviceMenuSlideIn');//No I18n
				}

			});*/


	/*deviceMenuAccrHt=$('.deviceMenuAccr').outerHeight();//No I18n
	deviceMenuAccrHdrHt=$('.deviceMenuAccr header').length * 36;//No I18n
	deviceMenuAccrUlHt=deviceMenuAccrHt-deviceMenuAccrHdrHt;

	$('.deviceMenuAccr header').click(function(){
		$(this).parent().parent().find('.deviceMenuAccrSingle').removeClass('active').css({height:'36px'});//No I18n
		$('.deviceMenuAccr ul').removeAttr('style');//No I18n
		deviceMenuAccrActiveUlHt=$(this).parent().find('ul').outerHeight();//No I18n

		if(deviceMenuAccrActiveUlHt > deviceMenuAccrUlHt){
			deviceMenuAccrFinalUlHt=deviceMenuAccrUlHt;
		}else{
			deviceMenuAccrFinalUlHt=deviceMenuAccrActiveUlHt;
		}

		$(this).parent().find('ul').css({height:deviceMenuAccrFinalUlHt});
		$(this).parent().addClass('active').css({height:deviceMenuAccrFinalUlHt+35});//No I18n

	});
	opm_tooltip();*/
	 var isDatastore = OPMClient.AlarmDetailsController.alarmDetails.isDatastore || false ;
	if(isDatastore)
	{
		["wfExec","availability","rdp","testMonitor","addnote"].forEach(function(item) {//No I18n
			$("#alarmListViewActions ."+item).hide();
		});
	}
}
function redirectToDevFrmVLANSnap(devName)
{
	if(devName !== undefined && devName !== "")
	{
		redirectToSnapshot("MonitoringDevice",devName); //No I18n
}
	else
{
		historyBack();
	}
}
function getDevSnapshotUrl(devName,page)
{
	// if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "ConfigDevice") { // No I18N
	// 	devName = OPMClient.InventoryDeviceDetailsController.selDevice;
	// }
	if(page !== undefined && page !== "")
	{
		return window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+devName+"/"+page;	//No I18N
	}
	else
	{	return window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName;	//No I18N
	}
}
function ipslaArrayToObject(arr)
{
	var dArr = new Array();
	$.each(arr,function(k,v){
		dArr.push({'0':v[0],'1':v[1]});
	});
	return dArr;

}
/*function executeVMTask(taskID,deviceName,moID){
	var data = {"deviceName":deviceName,"taskID":taskID,"virtualType":deviceBasicDetails.entityType,'moID':moID}; //No I18N
	var result = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/v2/device/executeTask',data); //No I18N
	if(result.error != null)
	{
		opm_infoMsgs("errorMsg",result.error);
	} else if(result.infoerror != null){
		opm_infoMsgs("infoMsg",result.infoerror+Ember.I18n.t("webclient.virtual.taskprogress",this)); //No I18N
	}
	else{
		opm_infoMsgs("successMsg",result.success); //No I18N
	}

}*/
function opm_gridRelayout(closureDiv){

}
function getFormattedDialDetails(dialValue)
{
	var dialDetails ={};
	dialDetails.dialValue = Math.round(dialValue);
	if(dialDetails.dialValue>100)
	{
		dialDetails.dialValue = 100;
	}
	dialDetails.dialColor = "#76d284";	 //No I18N
	if(dialDetails.dialValue > 80) {
		dialDetails.dialColor = "#f37273"; //No I18N
	}else if(dialDetails.dialValue <=80 && dialDetails.dialValue > 60) {
		dialDetails.dialColor = "#f5c673"; //No I18N
	}else {
		dialDetails.dialColor = "#76d284"; //No I18N
	}
	return dialDetails;
}
function convertArraytoObject(arr)
{
	var result = [];
	for(var i=0;i<arr.length;i++)
	{
		var temp = {};
		temp.key = arr[i][0];
		temp.value = arr[i][1];
		result.push(temp);
	}
	$("#less").hide();
	return result;
}
function isAllValsameinArray(array)
{
	var length = array.length;
	for(var i = 1; i < array.length; i++)
    {
        if(array[0] !== array[i])
        {
            return false;
        }
    }
    return true;
}

function showAllDetails(len)
{
	$("#more").hide();
	for(var i=0;i<=len;i++)
	{
		$("#node"+i).show();
	}
	$("#less").show();
}
function showless(len)
{
	for(var i=10;i<=len;i++)
	{
		$("#node"+i).hide();
	}
	$("#less").hide();
	$("#more").show();
}
function opm_contructObjDonutDial(arr,ackArr)
{
	var returnObj = {list:[],colors:[]};
	$.each(arr, function(key, val){
		var ind = severityAsTxt.indexOf(key);
		var item = {title:statusAsTxt[ind],value:val,status:String(ind+1)};
		if(ackArr !== undefined && ackArr[key] !== undefined)
		{
			item.ack = ackArr[key];
		}
		returnObj.list.push(item);
		returnObj.colors.push(severityNumColor[ind+1]);

	});
	return returnObj;
}
function showNotifyAlertInfo(showNotify)
{
	if(showNotify)
	{
		$(".notifyAlertInfo").show();
	}
	else
	{
		$(".notifyAlertInfo").hide();
	}
}
function disableNotifyAlertInfo()
{
	var PopupStatus = $('input:radio[name="notifyAlertInfo"]:checked').val();
	if(PopupStatus === 'justOnce')
	{
		$('.notifyDiscovery').hide();
		localStorage.setItem("DISCOVERY_POPUP_JUSTONCE", true); //No I18n
	}
	else
	{
		opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/updateOpManagerSettings',{'fromTab':'DiscoveryPopup','DISCOVERY_PROGRESS_POPUP':"false"}); //No I18n
		$('.notifyDiscovery').hide();
	}
}

function logoutSession() {
	location.href = '/apiclient/ember/Logout.jsp';
}

function logoutDeletedUser(prop) {
    opm_infoMsgs("errorMsg", prop.message);//No I18N
    setTimeout(function() {
        location.href = '/apiclient/ember/Logout.jsp';
    }, 5000);
}

function logoutPassChangedUser(prop) {
    opm_infoMsgs("errorMsg", prop.message);//No I18N
    setTimeout(function() {
        location.href = '/apiclient/ember/Logout.jsp';
    }, 5000);
}

function logoutUser() {
	location.href = '/apiclient/ember/Logout.jsp';
}

function logoutSAML() {
	postServletCall("/sso_logoutreq"); //No I18n
}

function selectAllCheckboxesWithInElement(isChecked, elementID) {
	$("#"+elementID+" [type=checkbox]").prop("checked",isChecked);
}

function tickAccordianParentChkBox(element, accParentDivID, selectAllCheckBoxID) {
	var accordianParentDiv = $(element).parent().parent().parent().parent().parent().parent();
	var totalCheckBoxes = accordianParentDiv.find(".opmAccCont").find("input[type=checkbox]").size();
	var tickedCheckBoxes = accordianParentDiv.find(".opmAccCont").find("input[type=checkbox]:checked").size();
	accordianParentDiv.find(".opmAccHdr").find("input[type=checkbox]").prop("checked", (totalCheckBoxes === tickedCheckBoxes));//No I18N
	tickAccordianSelectAllChkBox(accParentDivID, selectAllCheckBoxID);
}

function tickAccordianSelectAllChkBox(accParentDivID, selectAllCheckBoxID) {
	var totalCheckBoxes = $("#"+accParentDivID + " .opmAccHdr").find("input[type=checkbox]").size();
	var tickedCheckBoxes = $("#"+accParentDivID+" .opmAccHdr").find("input[type=checkbox]:checked").size();
	$("#"+selectAllCheckBoxID).prop("checked", (totalCheckBoxes === tickedCheckBoxes));
}

function tickAccordianHdrCheckBox(element, accParentDivID, selectAllCheckBoxID) {
	selectallinform(element);
	tickAccordianSelectAllChkBox(accParentDivID, selectAllCheckBoxID);
}
function createSnmpGraph(divID,graphData){
	var xaxis = Ember.I18n.t('webclient.reports.time',this); //No I18N
	var yaxis = graphData[0].seriesname+" ( "+Ember.I18n.t('Units.Kbps',this)+")"; //No I18N
	if (graphData !== undefined && graphData.length > 0)
	{

		var arraObj={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
		}
		var zcObj =
		{
	        id:"widget"+divID, //No I18N
	        type:'line', //No I18N
	        jsonData:graphData,
	        series:"multi", //No I18N
	        height:250,
	        columns:
	        {
	            datatype_1:'time', //No I18N
	            datatype_2:'numeric', //No I18N
	            columnname_1:xaxis,
	            columnname_2:yaxis,
	            timeFormat:'HMS' //No I18N
	        },
	        canvas:{title:{show:false,text:""}}, //No I18N
	        axes:
	        {
				rotated: false,
				xaxis: {label: {text: xaxis}},
				yaxis: [{label: {text:yaxis},minRange:0}]
			},
	    	chart:{stacked:false},
	    	legend:{enabled:true},
	    	tooltip:[0,1],
	    	isRealTime:true
		}
		arraObj.chartobj.push(zcObj);
		arraObj.placeholder.push("widget"+divID);
		zChart(arraObj);
	}
	else
	{
		$("#widget"+divID).html(Ember.I18n.t("webclient.reports.view.nodata",this)); //No I18N
	}
}

function opu_ajaxPostRequestWithMsg(postUrl,msg,postData,callBackFunc){
	var done = "";//false;
	$.ajax(
	{
		url: postUrl,
		data: postData,
		type: 'POST', //No I18N
		async:true,
		dataType: 'json', //No I18n
		uniqueId: '',
		beforeSend: function(XMLHttpRequest,settings) {
			this.uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this));//No I18N
			appendCollectorDetails(XMLHttpRequest,settings);
		},
		success: callBackFunc
	});
}

function notifyBusinessView(prop)
{
	$("#"+l2Map_tempId).remove();
	if((window.OPM.currentView.name).indexOf('Maps.Layer2MapDevices') !== -1 && prop.mapName !== "" && prop.result == "success")
	{
		goToBVMapLink(prop.mapName);
	}
	else if(prop.mapName !== "" && prop.result == "success" && prop.reSync !== undefined && prop.reSync)
	{
		if((window.OPM.currentView.name).indexOf('Maps.BusinessView.BVMap.index') !== -1)
		{
			$(".mapsActions.bv_sync").removeClass('btn-disabled');
			opm_infoMsgs('successMsg',Ember.I18n.t('opm.layer2map.bv.success',this));//No I18N
			var bvName = (OPMClient.BVMapDetailsController.bvMapId).split("_bv")[0];
			loadBusinessViewNew(bvName,"BVMapBGImg"); //No I18N
		}

	}
	else if(prop.mapName !== "" && prop.result == "success")
	{
		$(".mapsActions.bv_sync").removeClass('btn-disabled');
		opm_infoMsgs('infoMsg',"<i onclick='goToBVMapLink(\""+prop.mapName+"\")'>"+Ember.I18n.t('webclient.map.layer2map.bv.success',this)+"</i>");//No I18N

	}
}
function tempCloseFn(){
	 
	if(window.OPM.currentView.name === "Inventory.Device.Monitors.AddSNMPMonitor.AddSNMP.SNMPMIBBrowser.index"){//No I18N
		settingsGlobalRoute.transitionTo("Inventory.Device.Monitors.AddSNMPMonitor.AddSNMP");//No I18N
		$("#formula").focus();
	}else if('Inventory.Device.Monitors.AddMonitor.index' === window.OPM.currentView.name && ('performanceMonitors' === OPMClient.InventoryDeviceDetailsController.monitorsName || 'scriptMonitors' === OPMClient.InventoryDeviceDetailsController.monitorsName)){//No I18N
		redirectToMonitor(OPMClient.InventoryDeviceDetailsController.deviceName);
	}else{
		window.history.back();
	}
}

function opm_compareInterfaceHigherSeverity(thresType, highSeverity, lowSeverity,intfRow)
{
	var hVal = $("#"+highSeverity).val();
	var lVal = $("#"+lowSeverity).val();

	if(thresType === "max") {
		thresType = "maxequal"; //No I18n
	}
	else if(thresType === "min") {
		thresType = "minequal"; //No I18n
	}


	if(hVal !== "" && lVal !== "")
	{
		switch(thresType)
		{
			case "minequal" : //No I18N
				if(parseFloat(hVal) >= parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.highval')); //No I18n
					$(".folderFileOpmTab li").removeClass("active"); //No I18n
					$('.IntfThresholdSettingsTab li[data-attr-div="'+intfRow+'"]').addClass("active");; //No I18n
					$(".IntfThresholdSettings").hide();
					$("#"+$(this).attr('data-attr-div')).show();
					$('.IntfThresholdSettingsTab .IntfThresholdSettings#'+intfRow+'').show()
					$("#"+lowSeverity).focus();
					return false;
				}
				break;
			case "maxequal" : //No I18N
				if(parseFloat(hVal) <= parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.lowval')); //No I18n
					$(".folderFileOpmTab li").removeClass("active"); //No I18n
					$('.IntfThresholdSettingsTab li[data-attr-div="'+intfRow+'"]').addClass("active");; //No I18n
					$(".IntfThresholdSettings").hide();
					$("#"+$(this).attr('data-attr-div')).show();
					$('.IntfThresholdSettingsTab .IntfThresholdSettings#'+intfRow+'').show()
					$("#"+lowSeverity).focus();
					return false;
				}
				break;
			default :
				if(parseFloat(hVal) === parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.samevaluealert')); //No I18n
					$(".folderFileOpmTab li").removeClass("active"); //No I18n
					$('.IntfThresholdSettingsTab li[data-attr-div="'+intfRow+'"]').addClass("active");; //No I18n
					$(".IntfThresholdSettings").hide();
					$("#"+$(this).attr('data-attr-div')).show();
					$('.IntfThresholdSettingsTab .IntfThresholdSettings#'+intfRow+'').show()
					$("#"+lowSeverity).focus();
					return false;
				}
			break;
		}
	}
	return true;
}
function setIntfRearmType(thresType)
{
	switch(thresType)
	{
		case "minequal" : //No I18N
			return "max"; //No I18n
			break;
		case "maxequal" : //No I18N
			return "min"; //No I18n
			break;
		case "min" : //No I18N
			return "maxequal"; //No I18n
			break;
		case "max" : //No I18N
			return "minequal"; //No I18n
			break;
		default :
			return "min"; //No I18n
			break;
	}
}

function sortDescByObjKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}
function sortAscByObjKey(data, key) {
    return data.sort(function (a, b) {
        var x = a[key].toUpperCase();
        var y = b[key].toUpperCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function getColorCode(colorval) {
    var rgbColor = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(rgbColor[0]);
    for (var i = 1; i <= 3; ++i) {
        rgbColor[i] = parseInt(rgbColor[i]).toString(16);
        if (rgbColor[i].length == 1) {
        	rgbColor[i] = '0' + rgbColor[i];
       	}
    }
   var color = '#' + rgbColor.join('');
   return color;
}
function enableStorageAddon() {
	// var jsonData = opm_ajaxGetRequest(window.OPM.apiUrlPattern + "/admin/enableStorageAddOn",""); //No I18N
	// if(jsonData.registered) {
	// 	opm_infoMsgs("successMsg",Ember.I18n.t('webclient.storage.addon.success',this));//No I18N
	// }
	location.href = "#/Inventory/List/OpStor/RAID";//No I18N
	closeMessageInfoDetails();
}
function opm_isValidName(validateStr,restrictedChars) {
	restrictedChars = (restrictedChars !== undefined)?restrictedChars:'~!@#$%^&*()+=-_[]\\\';,./{}|\":<>?'; //No I18N
	for (var i = 0; i < validateStr.length; i++) {
		if (restrictedChars.indexOf(validateStr.charAt(i)) != -1) {
			return false;
		}
	}
	return true;
}

function executeVMTask(taskID,deviceName,moID){
	var data = {"deviceName":deviceName,"taskID":taskID,"virtualType":deviceBasicDetails.entityType,'moID':moID}; //No I18N
	var result = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/v2/device/executeTask',data); //No I18N
	if(result.error != null)
	{
		opm_infoMsgs("errorMsg",result.error);//No I18N
	} else if(result.infoerror != null){
		opm_infoMsgs("infoMsg",result.infoerror+Ember.I18n.t("webclient.virtual.taskprogress",this)); //No I18N
	}
	else{
		opm_infoMsgs("successMsg",result.success); //No I18N
	}
}

function sort_li(a,b){
    return ($(b).data('nav')) < ($(a).data('nav')) ? 1 : -1;
}

function syncDTNow()
{
	var syncCallbck = function(response){
            showMessage(response);
        }

    if(confirm(Ember.I18n.t('webclient.opm.unknownsnap.syncNreDiscover.info',this))){
		opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/syncDeviceTemplateNow','',Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),syncCallbck);//No I18N
	}else{
		return;
	}

}
function getNewFeatureTag(pageName, callback)
{
	opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/admin/getMessagesForPage?pageName=' + pageName, {}, '', function(response){ //No I18N
		var featureList = response[pageName] ? response[pageName].messages.NEW : undefined;
		if(typeof callback === 'function') { //No I18N
			callback(featureList);
		}
	});
}
function setMultipleOID(pageName,jsonData,self)
{
	var wmiClasses = [];
	var text = [];
	var protocol = jsonData.Protocol;
	var helpKey = 'webclient.opm.inventory.monitor.edit.oid.info';//No I18N
	var classLabel = '';

	$.each(jsonData.alternativeOIDs,function(key,value){
		wmiClasses.push({'k':key,'v':value.DISPLAYNAME});
		text.push({'oid':key,'description':value.INFO});
	});
	if(pageName == "settings"){
		helpKey = 'webclient.opm.settings.perfmonitor.edit.oid.info';//No I18N
	}
	if(protocol == 'WMI'){
		classLabel = Ember.I18n.t('webclient.WMI.Class',this);//No I18N
	}else if(protocol == 'CLI'){//No I18N
		classLabel = Ember.I18n.t('webclient.opm.settings.perfmonitor.edit.cli.command',this);//No I18N
	}else{
		classLabel = Ember.I18n.t('webclient.opm.settings.perfmonitor.edit.snmp.id',this);//No I18N
	}
	self.set('model.classLabel',classLabel);//No I18N
	self.set('model.helpContent',[{'description':Ember.I18n.t(helpKey,{param0:classLabel},this)}]);//No I18N
	self.set('model.alternativeOIDInfo',text);//No I18N
	self.set('model.multipleOID',true);//No I18N
	self.set('model.availableClasses',wmiClasses);//No I18N
	self.set('model.selectedClass',jsonData.oid);//No I18N
}

/********** OpManager Add-on Demo Code starts *************/

function setAddonPopupPos(){
	var addonPopUpPosY = window.scrollY;
	var addonPopUpPosX = window.scrollX;
	if(document.querySelector('[target="addon-popup-position"]')!=null){
		addonPopUpPosY = window.scrollY + document.querySelector('[target="addon-popup-position"]').getBoundingClientRect().top; //No I18N
		addonPopUpPosX = window.scrollX + document.querySelector('[target="addon-popup-position"]').getBoundingClientRect().left; //No I18N
	}
	$('.addon-popup__wrapper-animation').css({
		"top": addonPopUpPosY,//No I18N
		"left": addonPopUpPosX//No I18N
	});
}
function hideAddonPopup() {
	$('.sample-data-msg').fadeIn();
	var addonPopUpPosY = window.scrollY;
	var addonPopUpPosX = window.scrollX;
	if(document.querySelector('[target="addon-popup-position"]')!=null){
		addonPopUpPosY = window.scrollY + document.querySelector('[target="addon-popup-position"]').getBoundingClientRect().top; //No I18N
		addonPopUpPosX = window.scrollX + document.querySelector('[target="addon-popup-position"]').getBoundingClientRect().left; //No I18N
	}
	$('.addon-popup__wrapper').hide();
	$('.addon-popup__wrapper-animation').css({
			'background-color': 'rgba(0,0,0,0.5)', "display": "block", "top": 0, "left": addonPopUpPosX + 20, 'width': 0, "height": 0, "border-radius": "50%"//No I18N
	});
	$(".addon-popup__wrapper .addon-popup__modal").removeClass("nfa-addon relative"); //NO I18N
}
function showAddonPopup (){
	$('.addon-popup__wrapper-animation').removeAttr('style');
	$('.addon-popup__wrapper').css({
			'display': 'flex', 'opacity': 0//No I18N
	});
	var addonPopUpModalPosY = window.scrollY;
	var addonPopUpModalPosX = window.scrollX;
	if(document.querySelector('[target="addon-popup-position"]')!=null){
		addonPopUpModalPosY = window.scrollY + document.querySelector('.addon-popup__modal').getBoundingClientRect().top;//No I18N
		addonPopUpModalPosX = window.scrollX + document.querySelector('.addon-popup__modal').getBoundingClientRect().left;//No I18N
	}
	$('.addon-popup__wrapper-animation').css({
			'background-color': 'rgba(255,255,255,0.5)','width': 300,'height': 300,"top": addonPopUpModalPosY - 20,"left": addonPopUpModalPosX + 20//No I18N
	});
	setTimeout(function(){
		$('.addon-popup__wrapper').css({
				'opacity': 1//No I18N
		})
	}, 200);
	$('.sample-data-msg').fadeOut();
}
function checkWidgetIsAddOnAndsetData(tabName){
	var addOnData = {productTabName:tabName};
	switch(tabName){
		case "nfa.promotion.top.band": //NO I18N
			addOnData.modulmsg = Ember.I18n.t("opm.Addon.tryNowMsg",{param0:"NFA",param1:Ember.I18n.t("webclient.mainviewpage.title")}); //NO I18N
			addOnData.modulmsgheader = Ember.I18n.t("opm.nfaAddon.tryNowMsgTitle"); //NO I18N
			addOnData.productimgLink = "/apiclient/fluidicv2/img/sprite-opm.svg#nfa"; //NO I18N
			addOnData.knowmoreLink = "https://www.manageengine.com/network-monitoring/network-traffic-analysis.html"; //NO I18N
			addOnData.enableModule = "opm_enableNFAAddonLicense(\'NFA\')"; //NO I18N
			addOnData.enableModuleMsg = Ember.I18n.t("webClient.common.enableModule",{param0:Ember.I18n.t("webclient.trainingvideos.nfa")}); //NO I18N
			addOnData.probeMsg = Ember.I18n.t('webclient.common.contact_central_for_trial',{param0:Ember.I18n.t("webclient.trainingvideos.nfa")});//No I18N
			break;
		case "ncm.promotion.top.band": //NO I18N
		case "nfancm.promotion.top.band": //NO I18N
			addOnData.modulmsg = Ember.I18n.t("opm.Addon.tryNowMsg",{param0:"NCM",param1:Ember.I18n.t(window.OPM.isNFA?"webclient.productname.nfa":"webclient.mainviewpage.title")}); //NO I18N
			addOnData.modulmsgheader = Ember.I18n.t("opm.ncmAddon.tryNowMsgTitle"); //NO I18N
			addOnData.productimgLink = "/apiclient/fluidicv2/img/sprite-opm.svg#ncm"; //NO I18N
			addOnData.knowmoreLink = "https://www.manageengine.com/network-configuration-manager/manage-device-configuration.html"; //NO I18N
			addOnData.enableModule = "opm_enableNFAAddonLicense(\'NCM\')"; //NO I18N
			addOnData.enableModuleMsg = Ember.I18n.t("webClient.common.enableModule",{param0:Ember.I18n.t("webclient.trainingvideos.ncm")}); //NO I18N
			addOnData.probeMsg = Ember.I18n.t('webclient.common.contact_central_for_trial',{param0:Ember.I18n.t("webclient.trainingvideos.ncm")});//No I18N
			break;
		case "fwa.promotion.top.band": //NO I18N
			addOnData.modulmsg = Ember.I18n.t("opm.Addon.tryNowMsg",{param0:"FWA",param1:Ember.I18n.t("webclient.mainviewpage.title")}); //NO I18N
			addOnData.modulmsgheader = Ember.I18n.t("opm.fwaAddon.tryNowMsgTitle"); //NO I18N
			addOnData.productimgLink = "/apiclient/fluidicv2/img/sprite-opm.svg#fwa"; //NO I18N
			addOnData.knowmoreLink = "https://www.manageengine.com/products/firewall/firewall-management.html"; //NO I18N
			addOnData.enableModule = "opm_enableNFAAddonLicense(\'FWA\')"; //NO I18N
			addOnData.enableModuleMsg = Ember.I18n.t("webClient.common.enableModule",{param0:Ember.I18n.t("webclient.trainingvideos.fwa")}); //NO I18N
			addOnData.probeMsg = Ember.I18n.t('webclient.common.contact_central_for_trial',{param0:Ember.I18n.t("webclient.trainingvideos.fwa")});//No I18N
			break;
		case "spm.ports.view"://No I18N
			addOnData.modulmsg = Ember.I18n.t('opu.spm.addOnPopup.module',this);//No I18N
			addOnData.modulmsgheader = Ember.I18n.t('opu.spm.addOnPopup.moduleheader',this);//No I18N
			addOnData.productimgLink = "/apiclient/fluidicv2/img/sprite-opm.svg#oputils";//No I18N
			addOnData.sampleImg = "/apiclient/fluidicv2/img/addon-spm.svg";//No I18N
			addOnData.knowmoreLink = 'https://www.manageengine.com/products/oputils/switch-port-mapper.html';//No I18N
			addOnData.enableModule = 'enableIPAMAddonLicense()';//No I18N
			addOnData.enableModuleMsg = Ember.I18n.t('webClient.common.enableModule',{param0:Ember.I18n.t('webclient.action.switchport.header',this)},this);//No I18N
			addOnData.probeMsg = Ember.I18n.t('webclient.common.contact_central_for_trial',{param0:Ember.I18n.t('dashboard.name.spm',this)},this);//No I18N
			break;
		case "IPAM"://No I18N
			addOnData.modulmsg = Ember.I18n.t('opu.ipam.addOnPopup.module',this);//No I18N
			addOnData.modulmsgheader = Ember.I18n.t('opu.ipam.addOnPopup.moduleheader',this);//No I18N
			addOnData.productimgLink = "/apiclient/fluidicv2/img/sprite-opm.svg#oputils";//No I18N
			addOnData.knowmoreLink = 'https://www.manageengine.com/products/oputils/ip-address-manager.html';//No I18N
			addOnData.enableModule = 'enableIPAMAddonLicense()';//No I18N
			addOnData.enableModuleMsg = Ember.I18n.t('webClient.common.enableModule',{param0:Ember.I18n.t('opu.tools.IP_ADDRESS_MANAGER',this)},this);//No I18N
			addOnData.probeMsg = Ember.I18n.t('webclient.common.contact_central_for_trial',{param0:Ember.I18n.t('dashboard.name.ipam',this)},this);//No I18N
			break;
		default:
			addOnData.modulmsg = "";
			addOnData.productimgLink = "";
			addOnData.knowmoreLink = "";
			addOnData.enableModule = "";
			addOnData.enableModuleMsg = "";
			addOnData.probeMsg = "";
	}
	return addOnData;
}
function closeAddonPopupifExist(){
    $('.demo-image-wrapper,[target="addon-popup-position"],.addon-popup__wrapper').hide();
    $('#inventoryGridStyle').show();
    $('[target="addon-popup-position"]').hide();
}
function displayAddonPopupIn(time,showDemoImg){
    if(window.OPM.isOPM && !isIPAMAddonLicenseEnabled() && !window.OPM.isEvalUser && !window.OPM.isLicenseExceeded && !window.OPM.isOPMPLUS && !window.OPM.isFreeEdition){
 	OPMClient.InventoryDeviceDetailsController.set('showAddOnPopup',true);//NO I18N
	if(showDemoImg){
    		$('.demo-image-wrapper').show();
			$('#inventoryGridStyle').hide();
    	}
		$('[target="addon-popup-position"]').show();
    	setAddonPopupPos();
    	if(!window.OPM.isOPUPlug){
			setTimeout(function(){
				if(OPMClient.InventoryDeviceDetailsController.showAddOnPopup){
					showAddonPopup();
				}
			}, time);
    	}else if(time == 0){
    		showAddonPopup();
    	}
	}
}
function displayAddonPopupInVentoryList(timeout,currentPath){
	if(currentPath===undefined){
		currentPath=OPMClient.ApplicationController.currentPath;
	}
    if(window.OPM.isOPM && !isIPAMAddonLicenseEnabled() && !window.OPM.isEvalUser && !window.OPM.isLicenseExceeded  && !window.OPM.isOPMPLUS && !window.OPM.isFreeEdition){
        if(!window.OPM.isOPUPlug){
	    	$('.icon-search').hide();
	       $('#oputilsaddbutton,#deleteAllRogueBtn,#opuSubnetaddBtn').hide();
	        $('#ipamAddonLink').show();
	        $('[target="addon-popup-position"]').show();
	        $('#inventoryGridStyle').hide();
	        setAddonPopupPos();
	        if(window.OPM.isProbe){
	        	$('#probeMsg').show();
	        	$('#tryNowBtn').hide();
	        }else{
	        	$('#probeMsg').hide();
	        	$('#tryNowBtn').show();
	        }
        	// $('.demo-image-wrapper.on-inventory').show();
        	$('.FilterAccordionContainer,.device.active').addClass('prevent-click');
        	setTimeout(function(){
	        	if(currentPath===OPMClient.ApplicationController.currentPath){
	        		showAddonPopup();
	        	}
	        }, timeout);
        }else if(timeout == 0){
        	setAddonPopupPos();
        	showAddonPopup();
    	}else{
    		if (OPMClient.InventoryDeviceDetailsController.subFilterType !== "Rogue"){
    			$('#oputilsaddbutton,#deleteAllRogueBtn,#opuSubnetaddBtn').hide();
    			$('[target="addon-popup-position"]').show();
	        	$('[target="addon-popup-position"]').css('cssText',"padding: 0px 155px;");
    		}
    	}
    }
}
function hideAddonPopupInVentoryList(){
	if(window.OPM.isOPM && !isIPAMAddonLicenseEnabled() && !window.OPM.isEvalUser && !window.OPM.isLicenseExceeded && !window.OPM.isOPMPLUS){
	    $('.icon-search').show();
	if(OPMClient.InventoryDeviceDetailsController.subFilterType === "Subnets" || OPMClient.InventoryDeviceDetailsController.subFilterType === "IPs"){//No I18N
            $('#oputilsaddbutton').hide();   
            $('#opuSubnetaddBtn').show();
        }else{
            $('#oputilsaddbutton').show();   
            $('#opuSubnetaddBtn').hide();
        }
	    $('#ipamAddonLink').hide();
	    $('.demo-image-wrapper.on-inventory,[target="addon-popup-position"]').hide();
	    $('.FilterAccordionContainer,.device.active').removeClass('prevent-click');
	    $('#inventoryGridStyle').show();
	}
}

function goToCentral() {
	var serverURLPath;
	if(window.iscollector) {
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaee/getCentralInfo"); //NO I18N
		serverURLPath = "https://"+response.servname+":"+response.port+"/"; //NO I18N
	}else {
		serverURLPath = OPMClient.ApplicationController.centralUrl;
	}
	window.open(serverURLPath,"_blank"); //NO I18N
}

function opm_enableNFAAddonLicense(moduleName) {
	if(!window.OPM.isEvalUser) {
		var callBackFunction = function(response) {
			if(response.status) {
				opm_infoMsgs("successMsg",Ember.I18n.t("fwa.compliance.Update_Successful")); //NO I18N
				window.location.reload();
			}else {
				opm_infoMsgs("errorMsg",response.error.message); //NO I18N
			}
		}
		//Metrack block starts
		var snapName = moduleName.toLowerCase();// moduleName will never be undefined
		if(window.OPM.isNFA && moduleName === 'NCM'){//NO I18N
			snapName = 'nfa_ncm';//NO I18N
		}
		ncmusrsts1("try_addon_lic_"+snapName);// No I18n
		//Metrack block ends
		nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/admin/enableAddonLicense",{module:moduleName},callBackFunction,""); //NO I18N
	}
}

/********** OpManager Add-on Demo Code ends *************/

var alarmPageReloadTimer = "";
function opmAlarmAutoRefresh() {
	if(window.OPM.alarmRefreshInterval!==0 && window.OPM.showAlarmAutoRefresh) {
		var time = ((window.OPM.alarmRefreshInterval*60)*1000);
		alarmPageReloadTimer = setInterval(function(){
			loadAlarmsListIntoGrid();
		}, time);
	}
}
function showPrevUpgradeFailed(message) {
	if(message !== undefined)
	{
		opm_infoMsgs("errorMsg", message, {noClose: true}, true); //No I18n
	}
}

var alarmPageReloadTimer = "";
function opmAlarmAutoRefresh() {
	clearInterval(alarmPageReloadTimer);
	if(window.OPM.currentView.name === "Alarms.Alarm.Active") {
		if(window.OPM.alarmRefreshInterval!==0 && window.OPM.showAlarmAutoRefresh) {
			var time = ((window.OPM.alarmRefreshInterval*60)*1000);
			alarmPageReloadTimer = setInterval(function(){
				opm_emberViewRerender(window.OPM.currentView.name);
			}, time);
		}
	}
}

function OPM_deleteProbe()
{
	if(confirm(Ember.I18n.t("webclient.admin.delete.probe.confirm",this)))
	{
		var isSuc = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/enterprise/deleteProbe',{"probeName":OPMClient.SettingsAddDeviceController.probeName}); //No I18N
		if(isSuc)
		{
			showMessage(isSuc);
			window.historyBack();
			if(window.OPM.isMSPCentral) {
				getCustomerNameList();
			}
			if(window.OPM.isNCMEE) {
				ncmProbeDeleted(OPMClient.SettingsAddDeviceController.probeName);
			}
		}
	}
}


function probeNameToDispName(probeName) {
	var probeDispName = probeName;
	$.each(OPMClient.ApplicationController.probeList, function(key,val)
	{
		if(val.NAME == probeName)
		{
			probeDispName = val.DISPLAYNAME;
		}
	});
	return probeDispName;
}
String.prototype.startsWith || (String.prototype.startsWith = function(word) {
    return this.lastIndexOf(word, 0) === 0;
});
function redirectToElementLicensePage(){
	location.href = window.OPM.apiclientUrl+"Settings/Basic/LicenseMgmt/UsageInfo"; //No I18N
}

function processTestConnection (idpTestResponse) {
	idpTestResponse = idpTestResponse.map(function(obj) {
		return $.extend({}, obj, {results: obj.results.map(function(resultsObj) {
			return $.extend({}, resultsObj, {className: resultsObj.status})
		})});
	});
	OPMClient.ApplicationController.set('popupAttributes', {heading: Ember.I18n.t('webclient.saml.testcon'), lists: idpTestResponse}); //No I18n
	var testWindow = OPMClient.__container__.lookup('controller:SettingsBasicAuthenticationSAML').samlTestWindow; //No I18N
	if(testWindow) {
		testWindow.close();
	}
}

function opm_compareNetworkPathHigherSeverity(thresType, highSeverity, lowSeverity,tab)
{
	var hVal = $("#"+highSeverity).val();
	var lVal = $("#"+lowSeverity).val();

	if(hVal !== "" && lVal !== "")
	{
		switch(thresType)
		{
			case "min" : //No I18N
				if(parseFloat(hVal) >= parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.highval')); //No I18n
					opmActiveNetworkpathTab(tab);
					$("#"+lowSeverity).focus();
					return false;
				}
				break;
			case "max" : //No I18N
				if(parseFloat(hVal) <= parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.alert.lowval')); //No I18n
					opmActiveNetworkpathTab(tab);
					$("#"+lowSeverity).focus();
					return false;
				}
				break;
			default :
				if(parseFloat(hVal) === parseFloat(lVal))
				{
					alert(Ember.I18n.t('webclient.threshold.samevaluealert')); //No I18n
					opmActiveNetworkpathTab(tab);
					return false;
				}
			break;
		}
	}
	return true;
}

function setThesholdsForNetworkPath(type)
{
	 switch(type)
	{
		case "min" : //No I18N
			//$("#rearmType").val("max"); //No I18N
			return "max"; //No I18n
			break;
		case "max" : //No I18N
			//$("#rearmType").val("min"); //No I18N
			return "min"; //No I18n
			break;
		case "equal" : //No I18N
			//$("#rearmType").val("equal"); //No I18N
			return "equal"; //No I18n
			break;
		case "notEqual" : //No I18N
			return "equal"; //No I18n
		break;
	}

}

function opm_exportFilesPostMethod(url,data,target)
{
     if(!data) {
        data = {};
     }
	 var form=document.createElement("form");   //No I18n
		form.action=url;
        form.setAttribute("method","post");//No I18n
		form.setAttribute("target",(target !== undefined && target !== "" ? target : "_self"));//No I18n
		//Adding eeProbeID to api request based on the type of request

			if(window.OPM.isEEProbeSelected) {
				data.eeProbeID = window.OPM.selectedEEProbe;
			}
			if(window.OPM.isMSPCentral)
			{
				data.selCustomerID = window.OPM.selCustomerID;
				data.regionID = window.OPM.selRegionID;
			}

		if(data !== undefined && typeof data === 'object' && Object.keys(data).length > 0){
			$.each(data,function(index, key)
			{
	        var element1=document.createElement("input");//No I18n
	        element1.setAttribute("type","text");//No I18n
	        element1.setAttribute("name",index);//No I18n
	        element1.setAttribute("value",key);//No I18n
	        form.appendChild(element1);
	   	   });
		}

        var csrfelement=document.createElement("input");//No I18N
	    csrfelement.setAttribute("type","hidden");//No I18N
	    csrfelement.setAttribute("name","opmcsrftoken");//No I18N
	    csrfelement.setAttribute("value",readCsrfToken("opmcsrfcookie"));//No I18N
	    form.appendChild(csrfelement);
	    document.body.appendChild(form);
	    form.submit();
}



function EEDataTransferedStatsDetails(probeName, timePeriod) {
    slideIn(1);
    if(probeName !== "" && probeName !== undefined) { //No I18N
        $('#probeName').val(probeName); //No I18N
        $('#probeName').select2(); //No I18N
    } else {
    	if($('#probeName').val() !== "" && $('#probeName').val() !== undefined) {
        	probeName = $('#probeName').val(); //No I18N
        } else {
        	probeName = OPMClient.ApplicationController.get("selSupportProbeName"); //No I18N
        }
    }

    if(timePeriod !== "" && timePeriod !== undefined) {
        $('#timePeriod').val(timePeriod); //No I18N
        $('#timePeriod').select2(); //No I18N
    } else {
        timePeriod = $('#timePeriod').val(); //No I18N
    }

    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/diagnostics/getEEDataTransferedStats?time='+timePeriod+'&probeName='+probeName); //No I18n
    if(jsonData.TimeInterval!== "" && jsonData.TimeInterval!== undefined) {
        $("#TimeInterval").text(jsonData.TimeInterval);
    }
    colNames = [Ember.I18n.t("webclient.reports.apilog.module",this), Ember.I18n.t("webclient.settings.devicegrp.count",this),Ember.I18n.t("webclient.analyzer.ee.apt",this),Ember.I18n.t("webclient.analyzer.ee.mpt",this)]; //No I18n
    colModel = [
		{'name':'0', 'index':'0', sorttype:'text', width:50}, //No I18N
		{'name':'1', 'index':'1', sorttype:'int', width:10}, //No I18N
		{'name':'2', 'index':'2', sorttype:'int', width:20}, //No I18N
		{'name':'3', 'index':'3', sorttype:'int', width:20} //No I18N
    ]
    var defaultOptions = {searchOption: true,minRowsPerPage: 50}
    opm_loadJQgridWithData('#EEDataTransferedStatsDetailscontentID', jsonData.data, colNames, colModel, '', '#EEDataTransferedStatsDetailspagerID', '', defaultOptions); //No I18N
    $("body").addClass("settingsPage");
}

function closeEEDataTransferedStatsDetails() {
    $("body").removeClass("settingsPage");
    slideOut(1);
}

function isOtpValidationRequired(response, currentFunctionName, postUrl, postData, otpDetails, msg) {
	if (response.error) {
		if (response.error.code === 15008 || response.error.code === 15005) {
			if (!otpDetails) {
				otpDetails = {
					otpPageType: "dialog" //No I18n
				}
			}
			else if (!otpDetails.otpPageType) {
				otpDetails.otpPageType = "dialog"; //No I18n
			}
			OPMClient.ApplicationController.set("otpDetails", { otpPageType: otpDetails.otpPageType, callback: otpDetails.callback, resubmitFunctionName: currentFunctionName, postData: postData, postUrl: postUrl, maskedEmail: response.error.maskedEmail, totpAndNotConfig: response.error.code === 15005 ? true : false, otpCustomMessage: otpDetails.otpCustomMessage, tfaMode: response.error.tfaMode, cancelCallBack: otpDetails.cancelCallBack, msg: msg }); //No I18n
		} else if (response.error.code === 15003) {
			opm_infoMsgs("infoMsg", Ember.I18n.t('twofactorauth.email.error') + " " + '<a id="redirectMail">' + Ember.I18n.t('twofactorauth.redirectMail') + '</a>'); //No I18N
			$('#redirectMail').click(function () {
				opm_transitionToTheRoute("Settings.Basic.Mail");//No I18N
			});
		}
		else if (otpDetails && otpDetails.callback) {
			otpDetails.callback(response);
		}
	}
	else if (otpDetails && otpDetails.callback) {
		otpDetails.callback(response);
	}
}

function generateRandomNumberUsingTimestamp(){
	return Math.floor(Math.random() * 100000) + Date.now();
}
/*-----------------------------------------------------------------------------------------
					Secure probe installation key changes starts
-----------------------------------------------------------------------------------------*/

//Auto regeneration
function liveUpdateProbeInstallationKey(prop) {
	if(prop.isRegenerated) {
		if(window.OPM.isProbe && window.OPM.isOPMEEUnifiedConsoleView) {
			return false;
		}
		opm_loadPIKey();
		var apiKeyToShow = opm_mask(OPMClient.ApplicationController.installationKey, 4, 4);
		OPMClient.ApplicationController.set("installationKeyToShow",apiKeyToShow); //No I18N
		OPMClient.ApplicationController.set('installationKeyToShowProbe',apiKeyToShow); //No I18N
	}
}

//Manual regeneration
function regenerateProbeInstallKey() {
	var url = window.OPM.apiUrlPattern + '/enterprise/regeneratePIKey'; //No I18N
	var result = opm_ajaxPostRequest(url);
	if(result.apikey!==undefined && result.apikey!=="" && result.apikey!==null) {
		OPMClient.ApplicationController.set("installationKey",result.apikey); //No I18N
		var apiKeyToShow = opm_mask(OPMClient.ApplicationController.installationKey, 4, 4);
		OPMClient.ApplicationController.set("installationKeyToShow",apiKeyToShow); //No I18N
		OPMClient.ApplicationController.set('installationKeyToShowProbe',apiKeyToShow); //No I18N
	}
	showMessage(result);
}

function initiateCopyToClipboard() {
	$(".probePopup_Confirmation").addClass("active");
	$("#EEGettingStarted").addClass("probe_installation_disabled");
}

function cancelCopyToClipboard() {
	$(".probePopup_Confirmation").removeClass("active");
	$("#EEGettingStarted").removeClass("probe_installation_disabled");
}

function copyProbeKeyToClipboard() {
	if(OPMClient.ApplicationController.installationKeyToShowProbe.includes("*********")) {
		toggleInstallationKey();
		Ember.run.schedule('afterRender', function() { //No I18n
			opm_CopyToClipBoard("#installtionKeyInfoPopUp"); //No I18n
			toggleInstallationKey();
		});
	} else {
		opm_CopyToClipBoard("#installtionKeyInfoPopUp"); //No I18n
	}
	opm_infoMsgs('successMsg',Ember.I18n.t('webclient.settings.installationkey.copied',this)); //No I18N
	cancelCopyToClipboard();
}
/*-----------------------------------------------------------------------------------------
					Secure probe installation key changes ends
-----------------------------------------------------------------------------------------*/

function apm_contructObjDonutDial(arr)
{
	var monitorType = arr.WidgetAdditionalData.apmMonitorType;
	var apmSeverityAsTxt = ['critical','warning','clear','UnKnown','unmanaged','up','down'];//No I18N
	var apmStatusAsTxt = [Ember.I18n.t("webclient.admin.alarmesc.critical",this),Ember.I18n.t("webclient.admin.eventlogrules.warning",this),Ember.I18n.t("jsp.tools.sysoid.GetSysObjectID.Clear",this),Ember.I18n.t("webclient.common.unknown",this),Ember.I18n.t("webclient.map.flash.Unmanaged",this),Ember.I18n.t("webclient.devices.intftypes.up",this),Ember.I18n.t("webclient.devices.intftypes.down",this)];  //No I18n
	var apmHealthSeverityNumColor = [statusColors[0],statusColors[1],statusColors[4],'#7f7f7f','#9F9FEB',statusColors[4],statusColors[0]];//No I18N
	var apmAvailSeverityNumColor = ['#fa5b5a','#fbaf55','#46bb7d','#7f7f7f','#9F9FEB','#46bb7d','#fa5b5a'];//No I18N
	var returnObj = {list:[],colors:[]};
	$.each(arr.WidgetData.Details, function(key, val){
		var ind = apmSeverityAsTxt.indexOf(key);
		returnObj.list.push({title:apmStatusAsTxt[ind],value:val,status:String(ind+1)});
		if(monitorType==="availability") {
        	returnObj.colors.push(apmAvailSeverityNumColor[ind]);
        } else if(monitorType==="health"){ //No I18N
        	returnObj.colors.push(apmHealthSeverityNumColor[ind]);
        }
	});
	return returnObj;
}

function addPerfGroupToParamsObject(paramsObject,pageType,existingPerfGrpId) {
    var perfGroupId = $('#perfGroupValue_'+pageType).attr('data-perfGroupId')+'';
	if(existingPerfGrpId===perfGroupId) {
		return;
	}
	if(perfGroupId!==undefined && perfGroupId!=='') {
		paramsObject.perfGroupId=perfGroupId;
	}
}

function removePerfGrpFromDropDownAndCache(newPerfGroup,availablePerfGroups) {
	availablePerfGroups.forEach(function (eachPerfGrp,index) {
		if(eachPerfGrp.PERFGROUPID===newPerfGroup.PERFGROUPID){
			availablePerfGroups.removeAt(index);
		}
	});
}

function opmUserStats(actionName)
{
	if(window.OPM.isEvalUser && window.OPM.isOPM){
		try
		{	
			var data={};
			data.pageId = encodeURIComponent(actionName);
			var url = window.OPM.apiUrlPattern + "/ncmclient/usrsts1";//No I18N
			$.ajax(
			{
				url: url,
				type: 'POST', //No I18N
				dataType:'json', //No I18n
				data: data,
				async:true,
				success: function(response)
				{}
			});
		}catch(e){

		}
	}
}

function updateFaultSeverityColorsArray(faultSeverityColorCodes) {
var severityNameMappings = { critical: 'Critical', trouble: 'Trouble', attention: 'Attention', servicedown: 'Service Down', clear: 'Clear', info: 'Unknown', unmanaged: 'UnManaged' }; //No I18N
for(var i=0; i<7;i++){
  statusColors[i]=faultSeverityColorCodes[faultSeverity[i]];
  severityNumColor[i+1]=faultSeverityColorCodes[faultSeverity[i]];
  if(i==5){
    severityTxtColor[severityNameMappings[faultSeverity[i]]] = faultSeverityColorCodes[faultSeverity[i+1]];
  } else {
    severityTxtColor[severityNameMappings[faultSeverity[i]]] = faultSeverityColorCodes[faultSeverity[i]];
  }
}
}

function downloadSIF(sifFile) {
	window.open(window.OPM.apiUrlPattern + '/admin/getSIFDetails?download='+sifFile);
}
function setScheduleTime() {
	var date = {}
	var hours = [];
	var minutes = [];
	var monthlyDate = [];
	for(var i = 0; i < 24; i++) {
		hours.push({'key' : i, 'value' : ('0'+i).slice(-2)});
	}
	for(var i = 0; i < 60; i++) {
		minutes.push({'key':i, 'value': ('0'+i).slice(-2)});
	}
	for(var i = 1; i <= 32; i++) {
		if(i == 32) {
			monthlyDate.push({'key':i, 'value': Ember.I18n.t("webclient.wf.sched.lastday")});
		} else {
			monthlyDate.push({'key':i, 'value': i});
		}
	}
	var weeklyDay = 
	[	{'key': 1, 'value':Ember.I18n.t("webclient.general.sunday")},//No I18N
		{'key': 2, 'value':Ember.I18n.t("webclient.general.monday")},//No I18N
		{'key': 3, 'value':Ember.I18n.t("webclient.general.tuesday")},//No I18N
		{'key': 4, 'value':Ember.I18n.t("webclient.general.wednesday")},//No I18N
		{'key': 5, 'value':Ember.I18n.t("webclient.general.thursday")},//No I18N
		{'key': 6, 'value':Ember.I18n.t("webclient.general.friday")},//No I18N
		{'key': 7, 'value':Ember.I18n.t("webclient.general.saturday")}//No I18N
	]
	date.hours =hours;
	date.minutes = minutes;
	date.monthlyDate = monthlyDate;
	date.weeklyDay = weeklyDay;
	return date;
}
function editResponseThresholdforWAN_IP(name,policyName,graphName,instance,isNumeric)
{
	var editObj = {'deviceName':name,'name':name,'policyName':policyName,'graphName':graphName,'instanceName':instance,'checkNumeric':isNumeric};//No I18N
	OPMClient.InventoryDeviceDetailsController.set('responseTimeEditObj',editObj);//No I18N
	opm_transitionToParentRoute('Inventory.List.WAN.Overview.Snapshot.RespThreshold'); //No I18N
}

function checkATLimitValues(numericType,isQCW)
{
	var lowerLimitValue = isQCW ? "lowerLimitValueQCW" : "lowerLimitValue";//No I18N
	var upperLimitValue = isQCW ? "upperLimitValueQCW" : "upperLimitValue";//No I18N
	var validationType = numericType ? 'validIntegerorDecimal' : 'validInteger'; //No I18N

	if ($("#"+lowerLimitValue).val()!==""){
		var lowerObj = {};
		lowerObj[validationType] = [lowerLimitValue];
		if(!opm_validateFields(lowerObj)) {
			return false;
		}
	}
	if ($("#"+upperLimitValue).val()!== "") {
		var upperObj = {};
		upperObj[validationType] = [upperLimitValue];
		if(!opm_validateFields(upperObj)){
			return false;
		}
	}  
	return true;
}

function checkATLimitValuesWithPrefix(numericType,prefix)
{
	var selectorPrefix = prefix ? prefix + "#" : "";
	var lowerLimitValue = selectorPrefix + "lowerLimitValue";//No I18N
	var upperLimitValue = selectorPrefix + "upperLimitValue";//No I18N
	var validationType = numericType ? 'validIntegerorDecimal' : 'validInteger'; //No I18N

	if ($("#"+lowerLimitValue).val()!==""){
		var lowerObj = {};
		lowerObj[validationType] = [lowerLimitValue];
		if(!opm_validateFields(lowerObj)) {
			return false;
		}
	}
	if ($("#"+upperLimitValue).val()!== "") {
		var upperObj = {};
		upperObj[validationType] = [upperLimitValue];
		if(!opm_validateFields(upperObj)){
			return false;
		}
	}  
	return true;
}

function checkATLimitRangeValues(isQCW)
{
	var lowerLimitValueId = "lowerLimitValue";//No I18N
	var upperLimitValueId = "upperLimitValue";//No I18N
	var upperLimitTypeId = "upperLimitType";//No I18N
	if(isQCW){
		lowerLimitValueId = "lowerLimitValueQCW";//No I18N
		upperLimitValueId = "upperLimitValueQCW";//No I18N
		upperLimitTypeId = "upperLimitTypeQCW";//No I18N
	}
	var lowerLimitValue = $("#"+lowerLimitValueId).val();//No I18N
	var upperLimitValue = $("#"+upperLimitValueId).val();//No I18N
	var limitRangeType = $("#"+upperLimitTypeId).val();//No I18N
	if(lowerLimitValue!=="" && upperLimitValue!=="" && !isNaN(Number(lowerLimitValue)) && !isNaN(Number(upperLimitValue))){
		if(limitRangeType==="max"){//No I18N
			if(Number(lowerLimitValue) > Number(upperLimitValue) || Number(lowerLimitValue) === Number(upperLimitValue)){
				opm_validateFields({'customErrorFocus':[{identifier:upperLimitValueId,message:Ember.I18n.t("webclient.opm.at.upperlimit.maxvalue")}]});//No I18N
				return false;
			}
		}else{
			if(Number(upperLimitValue) > Number(lowerLimitValue) || Number(lowerLimitValue) === Number(upperLimitValue)){
				opm_validateFields({'customErrorFocus':[{identifier:lowerLimitValueId,message:Ember.I18n.t("webclient.opm.at.lowerlimit.maxvalue")}]});//No I18N
				return false;
			} 
		}
	}
	return true;
}

function checkATLimitRangeValuesWithPrefix(prefix)
{
	var selectorPrefix = prefix ? prefix + "#" : "";
	var lowerLimitValueId = selectorPrefix + "lowerLimitValue";//No I18N
	var upperLimitValueId = selectorPrefix + "upperLimitValue";//No I18N
	var upperLimitTypeId = selectorPrefix + "upperLimitType";//No I18N
	
	var lowerLimitValue = $("#"+lowerLimitValueId).val();//No I18N
	var upperLimitValue = $("#"+upperLimitValueId).val();//No I18N
	var limitRangeType = $("#"+upperLimitTypeId).val();//No I18N
	if(lowerLimitValue!=="" && upperLimitValue!=="" && !isNaN(Number(lowerLimitValue)) && !isNaN(Number(upperLimitValue))){
		if(limitRangeType==="max"){//No I18N
			if(Number(lowerLimitValue) > Number(upperLimitValue) || Number(lowerLimitValue) === Number(upperLimitValue)){
				opm_validateFields({'customErrorFocus':[{identifier:upperLimitValueId,message:Ember.I18n.t("webclient.opm.at.upperlimit.maxvalue")}]});//No I18N
				return false;
			}
		}else{
			if(Number(upperLimitValue) > Number(lowerLimitValue) || Number(lowerLimitValue) === Number(upperLimitValue)){
				opm_validateFields({'customErrorFocus':[{identifier:lowerLimitValueId,message:Ember.I18n.t("webclient.opm.at.lowerlimit.maxvalue")}]});//No I18N
				return false;
			} 
		}
	}
	return true;
}

function showHideATAdvConfig(showConfig,thresholdType,parentEle)
{
	var lowerLimitTypeVal = (thresholdType!==undefined && thresholdType==="min")?"max":"min";//No I18N
	var upperLimitTypeVal = (lowerLimitTypeVal==="min")?"max":"min";//No I18N
	parentEle = (parentEle===undefined)?"":parentEle;
	if(showConfig)
	{
		$(parentEle+" #atAdvConfig").show();//No I18N
		$(parentEle+" #lowerLimitType").val(lowerLimitTypeVal).select2().trigger("change");//No I18n
		$(parentEle+" #upperLimitType").val(upperLimitTypeVal).select2().trigger("change");//No I18n
		$(parentEle+" #lowerLimitValue").val("");//No I18n
		$(parentEle+" #upperLimitValue").val("");//No I18n
		$(parentEle+" #upperLimitMsg").val(Ember.I18n.t("webclient.opm.at.maxlimit.msg",this));//No I18n
	}
	else{
		$(parentEle+" #atAdvConfig").hide();//No I18N
	}
}
function opmSplitImageExtension(filename)
{
	var nameWithoutExt = "";
	var lastDotIndex = filename.lastIndexOf('.');//No I18N
	nameWithoutExt = filename.substring(0, lastDotIndex);
	if(nameWithoutExt !== undefined)
	{
		return nameWithoutExt;
	}
}

function opm_sendReloadEESetttingsRequestToClient(prop) {
	if(prop.isReload) {
		getEESettingsGlobalVars();
	}
}



		/*------------------------------------------------------------
			Centralized Configuration related Global Variables
		------------------------------------------------------------*/
	function getEESettingsGlobalVars() {
		if(window.OPM.isOPM && (window.OPM.isCentralServer || window.OPM.isProbe)) {
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/enterprise/getEESettings'); //No I18n
			window.OPM.syncBasicSettings = false;
			if(jsonData.syncBasicSettings!==undefined) {
				window.OPM.syncBasicSettings = jsonData.syncBasicSettings;
			}
			OPMClient.ApplicationController.set("syncBasicSettings",window.OPM.syncBasicSettings); //No I18n

			window.OPM.centralizedConfigSettings = {};
			window.OPM.centralizedConfigSettingsDispName = {};
			window.OPM.centralizedConfigSettingsProbeModified = {};
			window.OPM.centralizedConfigSettingsHideBanner = {};
			if(jsonData.centralizedConfigSettings!==undefined && jsonData.centralizedConfigSettings.Settings!==undefined) {
				$.each(jsonData.centralizedConfigSettings.Settings, function(i, val){
					window.OPM.centralizedConfigSettings[val.moduleName]=val.status;
					window.OPM.centralizedConfigSettingsProbeModified[val.moduleName] = val.isProbeModified;
					window.OPM.centralizedConfigSettingsHideBanner[val.moduleName] = val.isBannerHide;
					if(val.moduleDisplayName!==undefined) {
						window.OPM.centralizedConfigSettingsDispName[val.moduleName]=val.moduleDisplayName;
					}
				});
			}
			OPMClient.ApplicationController.set("centralizedConfigSettings",window.OPM.centralizedConfigSettings); //No I18n
			OPMClient.ApplicationController.set("centralizedConfigSettingsProbeModified",window.OPM.centralizedConfigSettingsProbeModified); //No I18n
			OPMClient.ApplicationController.set("centralizedConfigSettingsHideBanner",window.OPM.centralizedConfigSettingsHideBanner); //No I18N

			window.OPM.centralizedConfigConfigurations = {};
			window.OPM.centralizedConfigConfigurationsDispName = {};
			window.OPM.centralizedConfigConfigurationsProbeModified = {};
			window.OPM.centralizedConfigConfigurationsHideBanner = {};
			if(jsonData.centralizedConfigSettings!==undefined && jsonData.centralizedConfigSettings.Configurations!==undefined) {
				$.each(jsonData.centralizedConfigSettings.Configurations, function(i, val){
					window.OPM.centralizedConfigConfigurations[val.moduleName]=val.status;
					window.OPM.centralizedConfigConfigurationsProbeModified[val.moduleName] = val.isProbeModified;
					window.OPM.centralizedConfigConfigurationsHideBanner[val.moduleName] = val.isBannerHide;
					if(val.moduleDisplayName!==undefined) {
						window.OPM.centralizedConfigConfigurationsDispName[val.moduleName]=val.moduleDisplayName;
					}
				});
			}
			OPMClient.ApplicationController.set("centralizedConfigConfigurations",window.OPM.centralizedConfigConfigurations); //No I18n
			OPMClient.ApplicationController.set("centralizedConfigConfigurationsProbeModified",window.OPM.centralizedConfigConfigurationsProbeModified); //No I18n
			OPMClient.ApplicationController.set("centralizedConfigConfigurationsHideBanner",window.OPM.centralizedConfigConfigurationsHideBanner); //No I18n
		}
	}
	
function getPublicKey()
 {
     var publicKey = "";
     var dataParams = "action=getKeyForAuthentication"; //No I18N
     $.ajax({
         url: "/servlets/SettingsServlet",//No I18N
         type: "POST", //No I18N
         dataType: "json", //No I18N
         async: false,
         data: dataParams,
         success : function(jsonData)
         {
             publicKey = jsonData.publickey;
         }
     });
     return publicKey;
 }

 // This function encrypts the given password using the provided RSA public key from server side.
 // It converts the public key string into PEM format, parses it into a usable public key object,
 // and then encrypts the password using RSA-OAEP with SHA-256 for hashing and MGF1 for padding.
 // The encrypted password is then Base64 encoded and assigned to the password field of the login form.
 function changePasswordValue(password,publicKey)
  {
    var publicKey = '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';//No I18N
    var pkey = forge.pki.publicKeyFromPem(publicKey);
    var utf8_encoded_data = forge.util.encodeUtf8(password);
    var enc = pkey.encrypt(utf8_encoded_data, 'RSA-OAEP', {//No I18N
                      md: forge.md.sha256.create(),
                      mgf1: { md: forge.md.sha256.create() }
    });
    var encryptedPwd = forge.util.encode64(enc);
    return encryptedPwd;
  }
