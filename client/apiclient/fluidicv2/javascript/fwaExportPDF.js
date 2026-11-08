var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

window.OPM={'isPDF':true,pattern:'d MMM yyyy hh:mm:ss a z'};//No I18N
mtz_pattern = window.OPM.pattern;
mtz_pattern = mtz_pattern.replace(/yy/gi,"YY");//No I18N
mtz_pattern = mtz_pattern.replace(/d/gi,"D");//No I18N
mtz_pattern = mtz_pattern.replace(/E/gi,"d");//No I18N
OPMClient=Ember.Application.create();
			
function drawFWAPDFWidgets(widData,threadVal,width,height) {

    widData.TimeZone = threadVal.userTimeZone;
    OPMClient = (OPMClient != undefined)? OPMClient : Ember.Application.create();
    
    window.OPM = (window.OPM != undefined)? window.OPM : {};
    window.OPM.productName = threadVal.productName;
    window.OPM.productImgSrc = threadVal.reportimage;
    window.OPM.userTimeZone = threadVal.userTimeZone;
    window.OPM.severTimeZone = "exportPDF";//No I18N
    OPMClient.NFAReportsPDFCurrentApiurl='';
    OPMClient.InventoryDeviceDetailsController={'snapshotData':{'snapList':[],'reqParams':[],'widData':[widData]}};//NO I18N
    OPMClient.FWAGlobalDataController={'startTime':'','endTime':'','timePeriod':'today'};//No I18N
    
    var reqParams = threadVal.reqParams;
    var snapDetails = widData.fwasnapDetails;
    var snapId = (widData.snapDetails)?snapDetails.id:0;

    OPMClient.InventoryDeviceDetailsController.snapshotData.snapList.push(snapDetails);
    OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams.push(reqParams);
    OPMClient.FWAGlobalDataController.timePeriod = (reqParams.TimeFrame != undefined)?reqParams.TimeFrame:'today'; //No I18N

    var imported = document.createElement('script');
    imported.src ="/apiclient/fluidicv2/javascript/OPMI18N_12300_"+threadVal.userLocale+".js"; //No I18N
    document.head.appendChild(imported);

    imported.onload = function() {
        $('#contentDiv').attr('id',"widgetElement_"+snapId);
        $('#inventoryGridStyle .grid-stack-item').attr('id',snapId);
        $('#inventoryGridStyle .grid-stack-item').attr('data-gs-id',snapId);
        if(reqParams != undefined){
        	if(reqParams.pdfReqFrom == "FWACompleteData"){
           	 fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	 fwa_drawFWACompleteDataWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWAReportData"){//NO I18N
           	fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	fwa_drawFWAReportDataWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "FWAGraph"){//NO I18N
           	 fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	 fwa_drawFWAGraphWidget(snapId,widData,threadVal,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWAReportList"){//NO I18N
           	fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	fwa_drawFWAReportListWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWADeviceSummary"){//NO I18N
           	fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	fwa_drawFWADeviceSummaryWidget(snapId,widData);
           }else  if(reqParams.pdfReqFrom == "FWARuleMgmtGrid"){//NO I18N
             fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
             fwa_drawFWARuleMgmtGridWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWAReportSingleWidget"){//NO I18N
           	fwa_drawPDFHeaderInfo(snapId,widData,reqParams);
           	fwa_drawFWAReportSingleWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "fwaInventoryList"){//NO I18N
				fwa_drawInventoryListPDFHeaderInfo(snapId,widData,reqParams);
               	fwa_drawFWARuleMgmtInventoryWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "InventoryMultiWidget"){//NO I18N
           	fwa_drawFromPage(snapId,widData,reqParams,width,height,true);
           	fwa_drawFWAInventoryMultipleWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWAReportMultiWidget"){//NO I18N
           	fwa_drawFromPage(snapId,widData,reqParams,width,height);
           	fwa_drawFWAReportMultipleWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWAReportRawWidget"){//NO I18N
           	fwa_drawFromPage(snapId,widData,reqParams,width,height);
           	fwa_drawFWAReportRawWidget(snapId,widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWARuleImpact"){//NO I18N
           	fwa_drawFWARuleImpactWidget(widData,reqParams);
           }else  if(reqParams.pdfReqFrom == "FWASecurityAudit"){//NO I18N
//           	if(widData.content != undefined){
//           		if(window.OPM.productName == "Firewall Analyzer"){
//           			widData.content = '<div class="imgPreviewHolder"><img src="\\apiclient\\fluidicv2\\img\\fwa-logo.png" width="310px" height="115px"></div>'+widData.content;
//           		}else{
//           			widData.content = '<div class="imgPreviewHolder"><img src="\\apiclient\\fluidicv2\\img\\opmanager_logo_report.gif" width="310px" height="115px"></div>'+widData.content;
//           		}
//           	}
        	   fwa_drawFWARuleImpactWidget(widData,reqParams);
              	var deviceName = widData.displayName;
              	if($(".reportdate")[0]!= undefined && $(".reportdate")[0].innerHTML != null){
              		var rptGenTime = $(".reportdate")[0].innerHTML;
              	}else{
              		var rptGenTime = $(".dateDiv b").text();              		
              	}
              	if(window.OPM.productName == "Firewall Analyzer"){
              		var logo = "fwa-logo.png"; //No I18N
              	}else{
              		var logo = "opmanager_logo_report.gif"; //No I18N
              	}
              	$("#zchartgraph2").prepend('<div id="widgetElement_0" class="dashboardWidget fullCol pdfReportGraph" style="width:100%;padding:20px;background: white;"><div style="height:1080px;border:1px solid"><div style="width:30%;height:100%;background:#736F6E;float:left;"><div style="width:100%;height:100%;display:table;text-align:center;-webkit-transform: rotate(-90deg);-moz-transform: rotate(-90deg);"><span style="display:table-cell;vertical-align:middle;color:white;font-size:30pt">'+Ember.I18n.t("webclient.reports.header")+'</span></div></div><div style="width:70%;height:100%;float:right;background: white;"><div id="logo_pdf_remove" style="width:100%;float:right"><div style="float:right"><img src="/apiclient/fluidicv2/img/'+logo+'" width="250" height="100"></div><div style="height:10pt"></div></div><div style="width:100%;padding-left:60px;top:100px;position:relative"><table width="100%"><tbody><tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t("RouterName")+'</td><td style="width:75%;padding:5px">'+deviceName+'</td></tr><tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t("webclient.reports.ReportName")+'</td><td style="width:75%;padding:5px">'+Ember.I18n.t("jsp.commonstr.SecurityAudit")+'</td></tr><tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t("nfa.report.name")+' '+Ember.I18n.t("webclient.fwa.gen.time")+'</td><td style="width:75%;padding:5px">'+rptGenTime+'</td></tr></tbody></table></div></div></div><div class="opmFormRow nfaPDFPrivacyMsg"><div class="opmFormCol fullCol opmInfoMsg"><p ><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p></div></div></div>'); //No I18N
           }else  if(reqParams.pdfReqFrom == "FWAAlertList"){//NO I18N
        	   $('#zchartgraph2').empty();
        	   $('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
        	   var $maindiv = $("<main class='mainContent'></main>");
        	   $('#zchartgraph2').append($maindiv);
        	   if(window.OPM.productName == "Firewall Analyzer"){
        		   $maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
        	   }else{
        		   $maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
        	   }
        	   var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
        	   $maindiv.append($contDiv);
        	   $contDiv.append('<div class="fwaHeading_pdf">'+reqParams.header+'</div>')
        	   var tableContent='<table><tbody>';
        	  
        	   for(i=1; i<=4; i++){
        		   var keys = "title"+i; //No I18N
        		   var value = "value"+i; //No I18N
        		   $('#deviceInfoDiv .info'+i).show();
        		   tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams[keys]+"</span> : "+reqParams[value]+"</td></tr>";//NO I18N
        	   }
        	   tableContent=tableContent+"</tbody>";//No I18N
        	   if(tableContent != '<table><tbody></tbody>'){
        		   tableContent=tableContent+"</table>";
        		   var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
        		   $contDiv.append($paramTab);
        		   $paramTab.html(tableContent);
        	   }
        	   $contDiv.append('<div id="widgetElement_0" class="" style="width:100%;"></div>');
        	   $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
        	   fwaAlertListExportPDF("0",widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtOverviewFullExport"){//NO I18N
        	   fwa_drawRuleMgmtHeader(snapId,widData,reqParams,width,height);
        	   fwa_drawFWARuleMgmtOverviewWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtNatRules"){//NO I18N
        	   fwa_drawRuleMgmtNatRulesHeader(snapId,widData,reqParams,width,height);
        	   fwa_drawFWARuleMgmtNatRules(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtOverview"){//NO I18N
        	   fwa_drawRuleMgmtHeader(snapId,widData,reqParams,width,height);
        	   fwa_drawFWARuleMgmtOverviewWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtOptimizationExport"){//NO I18N
        	   fwa_drawRuleMgmtOptimizationHeader(snapId,widData,reqParams,width,height);
        	   fwa_drawFWARuleMgmtOptimizationWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtUnusedExport"){//NO I18N
        	   fwa_drawUnusedRulePDFHeaderInfo(snapId,widData,reqParams);
        	   fwa_drawFWAUnusedRuleDataWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtRuleReorderExport"){//NO I18N
        	   fwa_drawRuleMgmtReorderHeader(snapId,widData,reqParams,width,height);
        	   fwa_drawFWARuleMgmtReorderWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaComplianceStandardExport"){//NO I18N
        		fwa_drawStandardFromPage(snapId,widData,reqParams,width,height);
        		 fwa_drawFWAStandardWidget(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaChangeMgmtExport"){//NO I18N
       			fwa_drawChangeMgmtFromPage(snapId,widData,reqParams,width,height);
       			fwa_drawFWAChangeMgmtWidget(snapId,widData,reqParams);
           }
           else if(reqParams.pdfReqFrom == "FWAAggSearchReport"){
           		var widParams ={};
				widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
				fwa_AggSrchRptInxPage(snapId,widData,reqParams,width,height,false);
           		FWARawSearchReport(snapId,widData,reqParams);
           }
           else if(reqParams.pdfReqFrom == "FWARawSearchReport"){ //NO I18N
           		var widParams ={};
				widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
				fwa_AggSrchRptInxPage(snapId,widData,reqParams,width,height,false);
           		FWARawSearchReport(snapId,widData,reqParams);
           }else if(reqParams.pdfReqFrom == "fwaRuleMgmtRuleRecomExport"){ //NO I18N
        	   fwa_drawUnusedRulePDFHeaderInfo(snapId,widData,reqParams);
        	   fwa_ruleRecommendation(snapId,widData,reqParams);
           }
           else if(reqParams.pdfReqFrom == "RuleComparison"){ //NO I18N
				fwa_drawPDFRuleCompHeaderInfo(snapId,widData,reqParams);
				fwa_drawFWARuleMgmtComparisonWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "fwaRuleMgmtPolicyFineTuningExport"){ //NO I18N
        	  	fwa_drawFineTuningPDFHeaderInfo(snapId,widData,reqParams);
        	  	fwa_policyFineTuningDetails(snapId,widData,reqParams);
	       }else if(reqParams.pdfReqFrom == "ConfigbackupRuleComparison"){ //NO I18N
				fwa_drawPDFConfigBackupRuleCompHeaderInfo(snapId,widData,reqParams);
				fwa_drawFWARuleMgmtComparisonWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "ConfigbackupConfigComparison"){ //NO I18N
				fwa_drawPDFConfigBackupRuleCompHeaderInfo(snapId,widData,reqParams);
				fwa_drawFWABackupConfigComparisonWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "FWAConfigComparison"){ //NO I18N
				fwa_drawPDFConfigCompHeaderInfo(snapId,widData,reqParams);
				fwa_drawFWABackupConfigComparisonWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "FWARuleExpiry"){//NO I18N
       	   		fwa_drawRuleExpiryHeader(snapId,widData,reqParams,width,height);
       	   		fwa_drawFWARuleExpiryWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "FWAObjUsageSingleReport"){//NO I18N
       	   		fwa_ObjUsageIndexPage(snapId,widData,reqParams,width,height);
       	   		fwa_drawFWAObjUsageSingleWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "fwaObjUsageMultiWidget"){//NO I18N
        	  	var widParams ={};
       	   		fwa_ObjUsageIndexPage(snapId,widData,reqParams,width,height);
       	   		fwa_drawFWAObjUsageMultiiWidget(snapId,widData,reqParams);
          }else if(reqParams.pdfReqFrom == "fwaObjUsageDrillRep"){//NO I18N
	   	   		fwa_ObjUsageIndexPage(snapId,widData,reqParams,width,height);
	   	   		fwaObjUsageExpandDrill(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRuleMgmtDupObjReport"){//NO I18N
	    	  	fwa_DupObjIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaDupObjGenerateReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaruleapproval"){//NO I18N
	    	  	fwa_RuleApprovalIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaRuleApprovalReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRuleMgmtObjectDetails"){//NO I18N
	    	  	fwaObjectDetailsIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaObjectDetailReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRiskTrendReport"){//NO I18N
	    	  	fwaRiskTrendIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaRiskTrendReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRiskReport"){//NO I18N
	    	  	fwaRiskIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaRiskReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRiskRulesReport"){//NO I18N
	    	    if(reqParams.category == "Rule"){
	    	    	fwaRiskRuleIndexPage(snapId,widData,reqParams,width,height);
		    	  	fwaRiskRuleReport(snapId,widData,reqParams);
	    	    }else{
	    	    	fwaRiskCompIndexPage(snapId,widData,reqParams,width,height);
		    	  	fwaRiskCompRuleReport(snapId,widData,reqParams);
	    	    }
	      }else if(reqParams.pdfReqFrom == "fwaRuleChangeHistoryExport"){//NO I18N
	    	  if(reqParams.type== "all"){
	    		  fwaRuleChangeAllIndexPage(snapId,widData,reqParams,width,height);
		    	  fwaRuleChangeAllReport(snapId,widData,reqParams);
	    	  }else{
	    		  fwaRuleChangeIndexPage(snapId,widData,reqParams,width,height);
		    	  fwaRuleChangeReport(snapId,widData,reqParams);
	    	  }
	    	  	
	      }else if(reqParams.pdfReqFrom == "fwaRuleTrackHistoryComplete"){//NO I18N
	    	  fwaRuleChangeCompleteIndexPage(snapId,widData,reqParams,width,height);
	    	  fwaRuleChangeCompleteReport(snapId,widData,reqParams);
	      }else if(reqParams.pdfReqFrom == "fwaRuleMgmtExcludedRules"){//NO I18N
	    	  	fwaExcludedRuleIndexPage(snapId,widData,reqParams,width,height);
	    	  	fwaExcludedRuleReport(snapId,widData,reqParams);
	      } else if(reqParams.pdfReqFrom == "fwaVpnSummaryReport"){//NO I18N
			fwaVpnSummaryIndexReport(snapId,widData,reqParams,width,height);
			fwaVpnSummaryMultipleReport(snapId,widData,reqParams);
	  	  }
        }
    } 
    setTimeout(function(){
    	window.canvasLoded=true;
    },5000);
    

}

function fwaBarCountFormatter(cellValue, options, rowdata, action,maxVal)
{
	var perc=cellValue;
	if(maxVal != undefined && maxVal != 0){
		perc=(parseInt(cellValue)/parseInt(maxVal))*100;
	}
	return '<div class="right dataStatus" style="max-height:15px"><div class="ut-row dataStatus-'+Math.ceil(perc/20)+'" data-value="'+cellValue+'" style="width: '+perc+'%;"><span>'+cellValue+'</span></div></div>';
}

function fwaappPercentageFormatter(cellValue, options, rowdata, action)
{
	var style = "";
	if(rowdata != null && rowdata.colorBar != null && rowdata.colorBar != '') {
		style="background:"+rowdata.colorBar+";";//No I18N
	}
	return '<div class="right dataStatus" style="max-height:15px"><div class="ut-row dataStatus-'+Math.ceil(cellValue/20)+'" data-value="'+cellValue+'" style="'+style+'width:'+cellValue+'%;"><span>'+cellValue+'%</span></div></div>';
}

function fwa_drawFineTuningPDFHeaderInfo(snapId,widData,reqParams) {
	

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	if(reqParams != undefined && reqParams.reportTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.reportTitle+'</div>')
    }
	
	var tableContent='<table><tbody>';
    if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
    
    if(reqParams.rulename != undefined) {
    	var ruleNameList = JSON.parse(reqParams.rulename).join(",");
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.admin.alarmesc.RuleName")+"</span> : "+ruleNameList+"</td></tr>";//NO I18N
    }
    	
	tableContent=tableContent+"</tbody>";//No I18N
	
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');

}

function fwa_drawUnusedRulePDFHeaderInfo(snapId,widData,reqParams) {
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	
    if(reqParams != undefined && reqParams.reportTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.reportTitle+'</div>')
    }
    
    var tableContent='<table><tbody>';
    var substr = (reqParams.reportSubTitle == undefined) ? "" :"<tr><td colspan='2'>"+ reqParams.reportSubTitle+"</td></tr>"; //NO I18N
    tableContent = tableContent + substr;
    
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
    
    if(reqParams.rulename != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.admin.alarmesc.RuleName")+"</span> : "+reqParams.rulename+"</td></tr>";//NO I18N
    }
   
    if(reqParams.rows != undefined && reqParams.page != undefined){
    	var pageCount=parseInt(reqParams.page);
    	var rowCount=parseInt(reqParams.rows);
    	var totRecords=(reqParams.TotalRecords != undefined) ? reqParams.TotalRecords : 0;
		var startIndex=((pageCount-1)*rowCount <= 0) ? 1 : ((pageCount-1)*rowCount);
		if(totRecords != 0){
			var endIndex=((pageCount*rowCount) < totRecords) ? (pageCount*rowCount) : totRecords;
		}else{
			var endIndex=pageCount*rowCount
		}
		tableContent = tableContent+"<tr><td colspan='2'>"+Ember.I18n.t('webclient.fwa.record.count')+" : "+startIndex+" - "+endIndex+"</td></tr>";//NO I18N
		$('#recordCountTitleDiv').text(Ember.I18n.t('webclient.fwa.record.count'));//NO I18N
		$('#recordCountDiv').text(startIndex+" - "+endIndex);
	}
   
    var paramsInfoString = fwa_getPDFParamsInfo(reqParams);
    if(paramsInfoString != ''){
    	tableContent = tableContent+"<tr><td colspan='2'>"+paramsInfoString+"</td></tr>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(reqParams.startDate != undefined) {
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+reqParams.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+reqParams.endDate+"</td></tr></tfoot>";//NO I18N
    }
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwa_drawPDFRuleCompHeaderInfo(snapId,widData,reqParams){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent' ></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.comp.report")+'</div>')
	var tableContent='<table><tbody>';
   
    if(reqParams != undefined && reqParams.paramText != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.paramText+"</span></td></tr>";//NO I18N
    }
    if(reqParams.filename1 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.File1")+"</span> : "+reqParams.filename1+"</td></tr>";//NO I18N
    }
    
    if(reqParams.filename2 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.File2")+"</span> : "+reqParams.filename2+"</td></tr>";//NO I18N
    }
    
    if(reqParams.diffOnly != undefined) {
        $('#deviceInfoDiv .info3').show();
        $('#deviceInfoDiv .title3').text(Ember.I18n.t("webclient.common.widgets.show")); //NO I18N
        var valtxt='';
        if(reqParams.diffOnly == "true"){
        	valtxt = Ember.I18n.t("diffonly"); //NO I18N
        }else{
        	valtxt = Ember.I18n.t("webclient.fwa.rule.comp.all.policies"); //NO I18N
        }
        tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.common.widgets.show")+"</span> : "+valtxt+"</td></tr>";//NO I18N
    }
    
    if(reqParams.sysTime != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time')+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable" style="padding-left:20px"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
   
}

function fwa_drawPDFConfigCompHeaderInfo(snapId,widData,reqParams){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.opmplus.gettingstarted.config.changemanagement")+'</div>')
    
    var tableContent='<table><tbody>';
   
    if(reqParams != undefined && reqParams.paramText != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.paramText+"</span></td></tr>";//NO I18N
    }
    if(reqParams.diffAlone != undefined) {
        var tempHtml="";
        if(reqParams.diffAlone == "true"){
        	tempHtml=Ember.I18n.t("diffonly");//NO I18N
        }else{
        	tempHtml=Ember.I18n.t("webclient.All.Lines");//NO I18N
        }
        tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.common.widgets.show')+"</span> : "+tempHtml+"</td></tr>";//NO I18N
    }
    if(reqParams.sysTime != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time')+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    }
    
    if(reqParams.compHeader1 != undefined) {
    	tableContent = tableContent+"<tr><td><span>"+Ember.I18n.t("lhs")+" "+Ember.I18n.t("jsp.commonstr.ConfigType")+"</span> : "+reqParams.compHeader1+"</td><td><span>"+Ember.I18n.t("rhs")+" "+Ember.I18n.t("jsp.commonstr.ConfigType")+"</span> : "+reqParams.compHeader2+"</td></tr>";//NO I18N
    }
    
    if(reqParams.filename1 != undefined) {
    	tableContent = tableContent+"<tr><td><span>"+Ember.I18n.t("lhs")+" "+Ember.I18n.t("jsp.commonstr.configVersion")+"</span> : "+reqParams.filename1+"</td><td><span>"+Ember.I18n.t("rhs")+" "+Ember.I18n.t("jsp.commonstr.configVersion")+"</span> : "+reqParams.filename2+"</td></tr>";//NO I18N
    }
    
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable" style="padding-left:20px"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwa_drawPDFConfigBackupRuleCompHeaderInfo(snapId,widData,reqParams){
	
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	if(reqParams.type == "rule"){
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.comp.report")+'</div>')
	}else{
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.backupconfig.config.comp")+'</div>')
	}
	
    
    var tableContent='<table><tbody>';
   
    if(reqParams != undefined && reqParams.paramText != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.paramText+"</span></td></tr>";//NO I18N
    }
    if(reqParams.compHeader1 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.fwa.backupconfig.comp.backupconf")+"</span> : "+reqParams.compHeader1+"</td></tr>";//NO I18N
    }
    
    if(reqParams.compHeader2 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.fwa.backupconfig.with")+"</span> : "+reqParams.compHeader2+"</td></tr>";//NO I18N
    }
    
    if(reqParams.diffOnly != undefined) {
    	var valtxt='';
        if(reqParams.diffOnly == "true"){
        	valtxt = Ember.I18n.t("diffonly"); //NO I18N
        }else{
        	if(reqParams.type == "rule"){
        		valtxt = Ember.I18n.t("webclient.fwa.rule.comp.all.policies"); //NO I18N
        	}else{
        		valtxt = Ember.I18n.t("alllines"); //NO I18N
        	}
        }
        tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.common.widgets.show")+"</span> : "+valtxt+"</td></tr>";//NO I18N
    }
    
    if(reqParams.sysTime != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time')+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable" style="padding-left:20px"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}


function fwa_drawPDFHeaderInfo(snapId,widData,reqParams) {
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	
    if(reqParams != undefined && reqParams.reportTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.reportTitle+'</div>')
    }
    
    var tableContent='<table><tbody>';
    var substr = (reqParams.reportSubTitle == undefined) ? "" :"<tr><td colspan='2'>"+ reqParams.reportSubTitle+"</td></tr>"; //NO I18N
    tableContent = tableContent + substr;
    
    if(reqParams.title1 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title1+"</span> : "+reqParams.value1+"</td></tr>";//NO I18N
    }
    if(reqParams.title2 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title2+"</span> : "+reqParams.value2+"</td></tr>";//NO I18N
    }
    if(reqParams.title3 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title3+"</span> : "+reqParams.value3+"</td></tr>";//NO I18N
    }
    if(reqParams.title4 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title4+"</span> : "+reqParams.value4+"</td></tr>";//NO I18N
    }
    if(reqParams.pdfReqFrom == "FWARuleMgmtGrid"){
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    	}
    }
   
    if(reqParams.rows != undefined && reqParams.page != undefined){
    	var pageCount=parseInt(reqParams.page);
    	var rowCount=parseInt(reqParams.rows);
    	var totRecords=(reqParams.TotalRecords != undefined) ? reqParams.TotalRecords : 0;
		var startIndex=((pageCount-1)*rowCount <= 0) ? 1 : ((pageCount-1)*rowCount);
		if(totRecords != 0){
			var endIndex=((pageCount*rowCount) < totRecords) ? (pageCount*rowCount) : totRecords;
		}else{
			var endIndex=pageCount*rowCount
		}
		tableContent = tableContent+"<tr><td colspan='2'>"+Ember.I18n.t('webclient.fwa.record.count')+" : "+startIndex+" - "+endIndex+"</td></tr>";//NO I18N
	}
    var paramsInfoString = fwa_getPDFParamsInfo(reqParams);
    if(paramsInfoString != ''){
    	tableContent = tableContent+"<tr><td colspan='2'>"+paramsInfoString+"</td></tr>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(widData.startTime != undefined) {
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+widData.startTime+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+widData.endTime+"</td></tr></tfoot>";//NO I18N
    }
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}
function fwa_getPDFParamsInfo(reqParams) {
    var paramsInfoString=[];
    var snapDetail=OPMClient.InventoryDeviceDetailsController.snapshotData.snapList[0];
    var snapParams = (snapDetail != undefined)?snapDetail.parameters:[];
   
    var bvStartTime,bvEndTime;
    
    if(reqParams.ResolveDNS != undefined) {
        paramsInfoString.push(Ember.I18n.t('opu.common.RESOLVE_DNS')+" : "+reqParams.ResolveDNS);//No I18N
    }
    
    if(reqParams.graphUnit != undefined) {
        paramsInfoString.push(Ember.I18n.t('webclient.fwa.inventory.graphunit')+" : "+reqParams.graphUnit);//No I18N
    }
    
    if(reqParams.speedType != undefined) {
    	var speedMsg = (reqParams.speedType == "Average") ? "webclient.reports.tags.avg":((reqParams.speedType == "Maximum")?"webclient.reports.tags.max":"webclient.reports.tags.min");//NO I18N
        paramsInfoString.push(Ember.I18n.t('webclient.map.flash.speed')+" : "+Ember.I18n.t(speedMsg));//No I18N
    }
    
    if(reqParams.filterStTime != undefined) {
        bvStartTime = reqParams.filterStTime;
        bvEndTime = reqParams.filterEdTime;
    }

    
    return paramsInfoString = paramsInfoString.join(',');
}

function getI18nValue(key) {
    if(key == 'Data') {
        return Ember.I18n.t('webclient.nfa.widget.flowtype'); //NO I18N
    }
    return ((Ember.I18n.t(key)).indexOf('Missing translation')!= -1)?key:Ember.I18n.t(key);
}

function getInvFWAPieColDetails(widAddData){
	var colData={"colNameList":[],"colModelList":[]};//No I18N
	var key=widAddData.keyIndex;
	var value=widAddData.valueIndex;
	if(widAddData.colList != undefined){
		colData.colNameList=widAddData.colList;
	}
	if(widAddData.format != undefined){
		for(var i=0;i<colData.colNameList.length;i++){
			if( i == value){
				colData.colModelList.push({name:''+i+'',name:''+i+'',sortable:true,sorttype:widAddData.format[i], width:300, formatter: fwaappPercentageFormatter});
			}else{
				colData.colModelList.push({name:''+i+'',name:''+i+'',sortable:true,sorttype:widAddData.format[i]});
			}
		}
	}else{
		for(var i=0;i<colData.colNameList.length;i++){
			if( i == value){
				colData.colModelList.push({name:''+i+'',name:''+i+'', width:300, formatter: fwaappPercentageFormatter});
			}else{
				colData.colModelList.push({name:''+i+'',name:''+i+''});
			}
		}
	}
	return colData;
}

function fwa_drawFWAGraphWidget(snapId,widData,threadVal,reqParams) {

	var widParams ={};
	var snapDetails=widData.fwasnapDetails;
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var apiResponse=widData;
	$contentdiv.append("<div id='perfGraph"+snapId+"'></div>");
	
	var graphParams = {};
	graphParams.id = 'perfGraph'+snapId;
	if(apiResponse.GraphData == undefined){
		apiResponse.GraphData=[];
	}
	if(snapDetails != undefined && (snapDetails.name == 'fwa.device.bandwidth' || snapDetails.name == 'fwa.interface.bandwidth')){
		$.each(apiResponse.GraphData, function(i, item){
			if(item != undefined && item.seriesname == 'In'){
				item.seriesname=Ember.I18n.t('NFAWidget.IN',this);//No I18N
			}else if(item != undefined && item.seriesname == 'Out'){//No I18N
				item.seriesname=Ember.I18n.t('NFAWidget.OUT',this);//No I18N
			}
		});
	}
	graphParams.data = apiResponse.GraphData;
	graphParams.yAxis = apiResponse.yAxis;
//	graphParams.customToolTip = nfa_getCustomTooltipFormat();
	graphParams.graphType = 'area';//No I18N
	var timeFormat="today";//No I18N
	if(reqParams != undefined && reqParams.reportName != undefined){
		graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(reqParams.reportName);
	}else{
		graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(timeFormat);
	}
	
	loadFWAPDFGraph(graphParams);
	if(snapDetails != undefined && (snapDetails.name == 'fwa.device.bandwidth' || snapDetails.name == 'fwa.interface.bandwidth')){
		$contentdiv.append("<div class='opm_jqGridUI'><table id='fwa_InterfaceTrafficIn"+snapId+"' class='ut ut-Grid'></table></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='fwa_InterfaceTrafficOut"+snapId+"' class='ut ut-Grid'></table></div>");
		var tableParams = {};
		var trafficIn = {};
		if(apiResponse.yAxis != undefined){
			trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this)+" ("+apiResponse.yAxis+")";
		}else{
			trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this);//NO I18N
		}
		
		trafficIn.defaultOptions = {};
		var widgetID=snapId;
		trafficIn.gridId = 'fwa_InterfaceTrafficIn'+snapId; //No I18N
		trafficIn.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
		trafficIn.colModels = [
		                     { name: '2', index: '2', classes:"pointer"}, //No I18N
		                     { name: '0', index: '0', classes:"pointer"}, //No I18N
		                     { name: '4', index: '4', classes:"pointer"} //No I18N
		                     ]; 
		trafficIn.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
		tableParams.trafficDetailIn=trafficIn;
		
		
		var trafficOut = {};
		if(apiResponse.yAxis != undefined){
			trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this)+" ("+apiResponse.yAxis+")";
		}else{
			trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this);//NO I18N
		}
		
		trafficOut.defaultOptions = {};
		
		trafficOut.gridId = 'fwa_InterfaceTrafficOut'+snapId; //No I18N
		trafficOut.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
		trafficOut.colModels = [
		                      { name: '8', index: '8', classes:"pointer"}, //No I18N
		                      { name: '6', index: '6', classes:"pointer"}, //No I18N
		                      { name: '10', index: '10', classes:"pointer"} //No I18N
		                      ]; 
		trafficOut.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
		tableParams.trafficDetailOut=trafficOut;
		fwa_loadPDFJQgridWithData('#'+trafficIn.gridId,trafficIn.data,trafficIn.colNames,trafficIn.colModels,trafficIn.captionTitle,"","",trafficIn.defaultOptions,false,reqParams);
		fwa_loadPDFJQgridWithData('#'+trafficOut.gridId,trafficOut.data,trafficOut.colNames,trafficOut.colModels,trafficOut.captionTitle,"","",trafficOut.defaultOptions,false,reqParams);
	}	
}

function fwa_drawFWAReportDataWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWASingleWidget(snapId,widData,reqParams,widParams);
}

function fwa_drawFWARuleMgmtNatRules(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleMgmtNatRulesWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWARuleMgmtOverviewWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleOverviewWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWARuleExpiryWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleExpiryCompleteWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWAChangeMgmtWidget(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWAChangeManagementWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWAStandardWidget(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWACompStandardWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWARuleMgmtOptimizationWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleOptimizationWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWABackupConfigComparisonWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWABackupConfiCompWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWARuleMgmtComparisonWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleComparisonWidget(snapId,widData,reqParams,widParams,reqParams.repTitle);
}

function fwa_drawFWARuleMgmtInventoryWidget(snapId,widData,reqParams){

	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
	var defaultOptions = {};
	var sendObj = {};
	var gridDet = {};
	sendObj.gridId = "opm_fwa_table"+snapId;//No I18N
	if(widData.interfaceDetails != undefined){
		sendObj.data = widData.interfaceDetails;
		gridDet = getFWAInvColmodelNameList("Grid","Interfaces"); //No I18N
	}else if(widData.gridData != undefined){
		sendObj.data = widData.gridData;
		gridDet = getFWAColmodelNameListForRuleMgmtList(reqParams);
	}else if(widData.userTabList != undefined){
		sendObj.data = widData.userTabList;
		gridDet = getFWAInvColmodelNameList("Grid","Users"); //No I18N
	}else if(widData.cldTabList != undefined){
		sendObj.data = widData.cldTabList;	
		gridDet = getFWAInvColmodelNameList("Grid","Clouds"); //No I18N
	}else if(widData.ruleTabList != undefined){
		sendObj.data = widData.ruleTabList;	
		gridDet = getFWAInvColmodelNameList("Grid","Rules"); //No I18N
	}else{
		sendObj.data = widData;
		gridDet = getFWAInvColmodelNameList("Grid","Devices"); //No I18N
	}
	sendObj.defaultOptions = defaultOptions;

	sendObj.colNames = gridDet.colNamesList;
	sendObj.colModels = gridDet.colModelList;
	
	sendObj.captionTitle = "";
	sendObj.gridNavigator = "";		
	fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,false,reqParams);
}

function fwaRuleMgmtInvDevListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(rowdata.devList != '-' && rowdata.devList.length > 0){
		var tem = rowdata.devList;
		
		if(tem != undefined && tem.length > 0){
			for(var i=0;i<tem.length;i++){
				var disTxt=tem[i].devName+" ("+tem[i].vendorName+")";
				returnTxt+='<span>'+disTxt+'</span><br/>';
			}
		}else{
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
		}
	}else{
		returnTxt='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}

		
	return returnTxt;
}


function getFWAColmodelNameListForRuleMgmtList(reqParams){
	var gridDet={"colNamesList":[],"colModelList":[]};//No I18N

	//No I18N

	var type="Device";//No I18N
	if(reqParams.advancedFilters != undefined){
		var advFilter=JSON.parse(reqParams.advancedFilters);
		if(advFilter.type != undefined && advFilter.type[0] != undefined){
			type=advFilter.type[0];
		}
	}
	if(type == "Device"){
		gridDet.colNamesList = [Ember.I18n.t('webclient.devices.details.vendor',this),'','','','','','','',Ember.I18n.t('fwa.firewallListView.name',this),Ember.I18n.t('webclient.topo.ipAddress',this),Ember.I18n.t('opstor.inventory.accordance.diskdrive.mode',this),Ember.I18n.t('webclient.fwa.rulemgmt.rule.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.object.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.unassigned.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.risk.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.security.stats',this),'']; //No I18N
		gridDet.colModelList = [
		                        { name: 'vendor',index:'vendor',hidden:true}, //No I18N
		                        { name: 'isdevRuleConfigured', index: 'isdevRuleConfigured',hidden:true,classes:'GridColHidden'}, //No I18N
		                        { name: 'LAST_CONFIG_BACKUP_TIME', index: 'LAST_CONFIG_BACKUP_TIME',hidden:true,classes:'GridColHidden' }, //No I18N
		                        { name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden' }, //No I18N
		                        { name: 'DDID', index: 'DDID',hidden:true,classes:'GridColHidden' }, //No I18N
		                        { name: 'resName', index: 'resName',hidden:true,classes:'GridColHidden' }, //No I18N
		                        { name: 'licenseStatus', index: 'licenseStatus',hidden:true,classes:'GridColHidden'}, //No I18N
		                        { name: 'devRuleSchedule', index: 'devRuleSchedule',hidden:true,classes:'GridColHidden'}, //No I18N
		                        { name: 'dispName', index: 'dispName',classes:"pointer", width:90,formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	return cellValue+"<br/>("+rowdata.vendor+")";//No I18N
		                        }},
		                        { name: 'ip', index: 'ip', classes:"pointer",hidden:true}, //No I18N
		                        { name: 'devRuleMode',index:'devRuleMode', width:60}, //No I18N
		                        { name: 'RULES_STATS',index:'RULES_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		if(cellValue.Total_Rules_Count != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.security.rules',this)+" : "+cellValue.Total_Rules_Count+"</br>";
		                        		}
		                        		if(cellValue.Disabled_Rules_Count != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.rulemgmt.disabled.rules',this)+" : "+cellValue.Disabled_Rules_Count+"</br>";
		                        		}
		                        		if(cellValue.ExpiryReport != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+" : "+cellValue.ExpiryReport+"</br>";
		                        		}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'OBJECTS_STATS',index:'OBJECTS_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		for(var i=0;i<cellValue.length;i++){
		    								retText = retText+cellValue[i].dispText+" : "+cellValue[i].count+"</br>";
		    							}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'UNASSIGNED_STATS',index:'UNASSIGNED_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		if(cellValue.FirewallObjects != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+" : "+cellValue.FirewallObjects+"</br>";
		                        		}
		                        		if(cellValue.InterfaceDetails != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+" : "+cellValue.InterfaceDetails+"</br>";
		                        		}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'RISK_STATS', index: 'RISK_STATS',search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var riskStatus='<div class="risk-counts">';
		                        	var colorsval = {"critical":"red","low":"green","high":"orange","medium":"yellow","attention":"violet"}; //No I18N
		                        	var colorsStr = {"critical":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"high":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"medium":Ember.I18n.t('webclient.Medium',this),"low":Ember.I18n.t('webclient.ncm.tab.Low',this),"attention":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Attention',this)}; //No I18N
		                        	if(cellValue == "-"){
		                        		riskStatus="-"
		                        	}else{
		                        		$.each(colorsStr, function(idx, val)
		                        				{
		                        			var level = idx;
		                        			var count = val+" : "+cellValue[level];
		                        			var ruleCnt = cellValue[level];
		                        			riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
		                        				});
		                        		riskStatus += "</div>";
		                        	}
		                        	return riskStatus;
		                        }},
		                        { name: 'AUDIT_STATS', index: 'AUDIT_STATS',search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var riskStatus='<div class="risk-counts">';
		                        	var colorsval = {"CRITICAL_COUNT":"red","LOW_COUNT":"green","HIGH_COUNT":"orange","MEDIUM_COUNT":"yellow","INFORMATIONAL_COUNT":"violet"}; //No I18N
		                        	var colorsStr = {"CRITICAL_COUNT":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"HIGH_COUNT":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"MEDIUM_COUNT":Ember.I18n.t('webclient.Medium',this),"LOW_COUNT":Ember.I18n.t('webclient.ncm.tab.Low',this),"INFORMATIONAL_COUNT":Ember.I18n.t('webclient.fwa.rulemgmt.informational',this)}; //No I18N
		                        	if(cellValue == "-"){
		                        		riskStatus="-"
		                        	}else{
		                        		$.each(colorsStr, function(idx, val)
		                        				{
		                        			if(idx != "TOTAL_COUNT"){
		                        				var level = idx;
		                        				var count = val+" : "+cellValue[level];
		                        				var ruleCnt = cellValue[level];
		                        				riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
		                        			}
		                        				});
		                        		riskStatus += "</div>";
		                        	}
		                        	return riskStatus;
		                        }},
		                        { name: 'devRuleScheduleTxt',index:'devRuleScheduleTxt',hidden:true,formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	if(rowdata.devRuleSchedule === 'Enabled'){
		                        		return "<i class='icon-status5'></i>"+Ember.I18n.t('webclient.devices.intftypes.enabled',this);//No I18N
		                        	}else if(rowdata.devRuleSchedule === 'Disabled'){//No I18N
		                        		return "<i class='icon-status1'></i>"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
		                        	}else{
		                        		return "-";
		                        	}
		                        }}
		                        ];
	}else{
		gridDet.colNamesList = ['','',Ember.I18n.t('webclient.settings.devicegrp.name',this),Ember.I18n.t('webclient.ipsla.voipDashboard.Description',this),Ember.I18n.t('widget.name.firewalldevList',this),Ember.I18n.t('jsp.commonstr.DeviceCount',this),Ember.I18n.t('webclient.fwa.rulemgmt.rule.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.object.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.unassigned.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.security.stats',this)]; //No I18N
		gridDet.colModelList = [
		                        { name: 'devGrpId', index: 'devGrpId',hidden:true,classes:'GridColHidden'}, //No I18N
		                        { name: 'devList', index: 'devList',hidden:true,classes:'GridColHidden'}, //No I18N
		                        { name: 'dispName', index: 'dispName',classes:"pointer"}, //No I18N
		                        { name: 'desc', index: 'desc',hidden:true}, //No I18N
		                        { name: 'devListDiv',index:'devListDiv',sortable:false,formatter:fwaRuleMgmtInvDevListFormatter,search:false}, //No I18N
		                        { name: 'devCount',index:'devCount',hidden:true}, //No I18N
		                        { name: 'RULES_STATS',index:'RULES_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		if(cellValue.Total_Rules_Count != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.security.rules',this)+" : "+cellValue.Total_Rules_Count+"</br>";
		                        		}
		                        		if(cellValue.Disabled_Rules_Count != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.rulemgmt.disabled.rules',this)+" : "+cellValue.Disabled_Rules_Count+"</br>";
		                        		}
		                        		if(cellValue.ExpiryReport != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+" : "+cellValue.ExpiryReport+"</br>";
		                        		}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'OBJECTS_STATS',index:'OBJECTS_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		for(var i=0;i<cellValue.length;i++){
		    								retText = retText+cellValue[i].dispText+" : "+cellValue[i].count+"</br>";
		    							}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'UNASSIGNED_STATS',index:'UNASSIGNED_STATS',formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var retText='';
		                        	if(cellValue == "-"){
		                        		retText = "-";
		                        	}else{
		                        		if(cellValue.FirewallObjects != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+" : "+cellValue.FirewallObjects+"</br>";
		                        		}
		                        		if(cellValue.InterfaceDetails != undefined){
		                        			retText = retText+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+" : "+cellValue.InterfaceDetails+"</br>";
		                        		}
		                        	}
		                        	return retText;
		                        }},
		                        { name: 'AUDIT_STATS', index: 'AUDIT_STATS',search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
		                        	var riskStatus='<div class="risk-counts">';
		                        	var colorsval = {"CRITICAL_COUNT":"red","LOW_COUNT":"green","HIGH_COUNT":"orange","MEDIUM_COUNT":"yellow","INFORMATIONAL_COUNT":"violet"}; //No I18N
		                        	var colorsStr = {"CRITICAL_COUNT":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"HIGH_COUNT":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"MEDIUM_COUNT":Ember.I18n.t('webclient.Medium',this),"LOW_COUNT":Ember.I18n.t('webclient.ncm.tab.Low',this),"INFORMATIONAL_COUNT":Ember.I18n.t('webclient.fwa.rulemgmt.informational',this)}; //No I18N
		                        	if(cellValue == "-"){
		                        		riskStatus="-"
		                        	}else{
		                        		$.each(colorsStr, function(idx, val)
		                        				{
		                        			if(idx != "TOTAL_COUNT"){
		                        				var level = idx;
		                        				var count = val+" : "+cellValue[level];
		                        				var ruleCnt = cellValue[level];
		                        				riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
		                        			}
		                        				});
		                        		riskStatus += "</div>";
		                        	}
		                        	return riskStatus;
		                        }}
		                        ];
	}	

	return gridDet;
}

function fwa_drawFWAReportSingleWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	if(reqParams.expand){
		var response=widData;
		var $contentdiv = $("<div class='content singleInvWidget'></div>");
		widParams.widgetElement.append($contentdiv);
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
		var defaultOptions = {};
		var gridData = response.data;
		var sendObj = {};
		defaultOptions.page=reqParams.page;
		defaultOptions.rows=reqParams.rows;
		defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
		defaultOptions.criteria=response.widgetAdditionalData.criteria;
		defaultOptions.rowNumNeeded=true;
		sendObj.gridId = "opm_fwa_table"+snapId;//No I18N
		sendObj.data = gridData;
		sendObj.defaultOptions = defaultOptions;
		if(reqParams.type != undefined && reqParams.type == 'raw'){
			sendObj.colNames =[''];
			sendObj.colModels = getFWAColModels(sendObj.colNames.length);
		}else{
			sendObj.colNames = response.widgetAdditionalData.colList;
			sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
			var columnFormat=[];
			if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.format != undefined){
				columnFormat=response.widgetAdditionalData.format;
			}
			if(columnFormat != undefined && (columnFormat.length > 0 && columnFormat.length == sendObj.colModels.length )){
				var tempData=sendObj.data;
				for(var k=0;k<columnFormat.length;k++){
					if(columnFormat[k] == "time"){
						for(var ik=0;ik<tempData.length;ik++){
							var cellvalue = tempData[ik][k];
							if(cellvalue != undefined && cellvalue.indexOf(",") > -1){
								var tempTxt=cellvalue.split(",");
								if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
									cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
								}
							}else if(cellvalue != undefined && cellvalue.indexOf(" ") > -1){
								var tempTxt=cellvalue.split(" ");
								if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
									cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
								}
							}
							tempData[ik][k]=cellvalue;
						}
						
						sendObj.colModels[k].formatter =  fwaTimeFormatter;
						sendObj.colModels[k].unformat = fwaTimeUnFormatter;
					}
				}
			}
			if(reqParams.reportParams != undefined){
				var reqJson=$.parseJSON(reqParams.reportParams);
				if(reqJson.RBBNAME != undefined && reqJson.RBBNAME == "Firewall_UserAudit_LSR" ){
					sendObj.colNames = [Ember.I18n.t("NFAWidget.Time",this),Ember.I18n.t("webclient.mibbrowser.host",this),Ember.I18n.t("webclient.fault.addnotes.user",this),Ember.I18n.t("ipsla.Action",this),Ember.I18n.t("webclient.auditreport.description",this)];//No I18N
					for(n=0; n<sendObj.data.length; n++){
						if(sendObj.data[n][3] == "1"){
							sendObj.data[n][3] = Ember.I18n.t("webclient.login",this);//NO I18N
			       	 	}else if(sendObj.data[n][3] == "2"){
			       	 		sendObj.data[n][3] = Ember.I18n.t("webclient.fwa.audit.logout",this);//NO I18N
			       	 	}else if(sendObj.data[n][3] == "3"){
			       	 		sendObj.data[n][3] = Ember.I18n.t("webclient.fwa.audit.failed.login",this);//NO I18N
			       	 	}else if(sendObj.data[n][3] == "4"){
			       	 		sendObj.data[n][3] = Ember.I18n.t("webclient.fwa.audit.comm.exec",this);//NO I18N
			       	 	}
					}
				}
				if(reqJson.RBBNAME != undefined && reqJson.RBBNAME == "AllVPNSession"){
					var colNamesList=sendObj.colNames;
					var colModelList=sendObj.colModels;
					var tempData=sendObj.data;
					colNamesList.unshift("");
					colModelList.unshift({});
					var formatLen=10;
					for(var ik=0;ik<tempData.length;ik++){
						var newVal="";
						var rowdata=tempData[ik];
						var logClass="inactivestatus";//NO I18N
						var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
						if(rowdata[formatLen]!=undefined && rowdata[formatLen]== 'Connected'){
							logClass="activestatus";//NO I18N
							logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
						}	
						newVal= '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
						tempData[ik].unshift(newVal);
					}
					for(var ik=0;ik<colModelList.length;ik++){
						var compPageWidth=$('#zchartgraph2').width() - 110;
						var singleColwidth=compPageWidth/(colModelList.length-1);
						if(ik == 0){
							colModelList[ik].singleColwidth="5px";
						}else{
							colModelList[ik].singleColwidth=singleColwidth+"px";
						}
					}
					sendObj.data=tempData;
					sendObj.colNames=colNamesList;
					sendObj.colModels=colModelList;
				}
				
				
				if(reqJson.RBBNAME != undefined && reqJson.RBBNAME == "ActiveVpnSessions"){
					var colNamesList=sendObj.colNames;
					var colModelList=sendObj.colModels;
					var tempData=sendObj.data;
					colNamesList.unshift("");
					colModelList.unshift({});
					for(var ik=0;ik<tempData.length;ik++){
						var newVal="";
						var rowdata=tempData[ik];
						var logClass="activestatus";//NO I18N
						var logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
						newVal= '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
						tempData[ik].unshift(newVal);
					}
					for(var ik=0;ik<colModelList.length;ik++){
						var compPageWidth=$('#zchartgraph2').width() - 110;
						var singleColwidth=compPageWidth/(colModelList.length-1);
						if(ik == 0){
							colModelList[ik].singleColwidth="5px";
						}else{
							colModelList[ik].singleColwidth=singleColwidth+"px";
						}
					}
					sendObj.data=tempData;
					sendObj.colNames=colNamesList;
					sendObj.colModels=colModelList;
				}
			}
		}
		sendObj.captionTitle = "";
		sendObj.gridNavigator = "";		
		fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,true,reqParams);
	}else{
		fwa_drawFWAReportWidget(snapId,widData,reqParams,widParams)
	}
}

function fwa_getDeviceScoreStatus(score){
	if(score == null){ return { color: 'red', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.risky') }; }//No I18N
	if(score < 50){ return { color: 'red', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.risky') }; }//No I18N
	if(score < 80){ return { color: 'orange', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.needsReview') }; }//No I18N
	return { color: 'green', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.healthy') };//No I18N
}

function fwa_drawFWARuleMgmtDeviceScoreWidget(snapId,widData){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	
	// Get ratings from apiData
	var ratings = (widData && widData.ratings) || {};
	var securityScore = (ratings.security && ratings.security.score != null) ? ratings.security.score : 0;
	var baselineScore = (ratings.baseline && ratings.baseline.score != null) ? ratings.baseline.score : 0;
	var regulatoryScore = (ratings.regulatory && ratings.regulatory.score != null) ? ratings.regulatory.score : 0;
	
	// Get status for each score
	var securityStatus = fwa_getDeviceScoreStatus(securityScore);
	var baselineStatus = fwa_getDeviceScoreStatus(baselineScore);
	var regulatoryStatus = fwa_getDeviceScoreStatus(regulatoryScore);
	
	// Calculate stroke-dashoffset for SVG circles (282.74 is circumference for r=45)
	var securityOffset = 282.74 * (1 - securityScore / 100);
	var baselineOffset = 282.74 * (1 - baselineScore / 100);
	var regulatoryOffset = 282.74 * (1 - regulatoryScore / 100);
	
	// Build fwa-score-section with only fwa-score-section-row
	var $scoreSection = $('<div class="fwa-score-section"></div>');
	var $scoreSectionRow = $('<div class="fwa-score-section-row" style="display:flex;gap:12px"></div>');
	
	// Security Rating Card
	var securityCardClass = 'fwa-score-card';//No I18N
	if(securityStatus.color === 'red'){ securityCardClass += ' fwa-score-card--risky'; }
	else if(securityStatus.color === 'orange'){ securityCardClass += ' fwa-score-card--review'; }
	else if(securityStatus.color === 'green'){ securityCardClass += ' fwa-score-card--compliant'; }
	
	var $securityCard = $('<div id="SecurityRatingCard_'+snapId+'" style="width:30%;margin-right:10px;float:left" class="'+securityCardClass+'"></div>');
	$securityCard.append('<div class="fwa-score-card__hdr">'+
		'<span class="fwa-score-card__title">'+Ember.I18n.t('webclient.fwa.rulemgmt.device.score.security')+'</span>'+
		'<span class="fwa-score-badge fwa-score-badge--'+securityStatus.color+'" style="float:right">'+securityStatus.text+'</span>'+
	'</div>');
	$securityCard.append('<div class="fwa-score-body">'+
		'<span class="fwa-score-percent fwa-score-percent--'+securityStatus.color+'">'+securityScore+'%</span>'+
	'</div>');
	$scoreSectionRow.append($securityCard);
	
	// Baseline Rating Card
	var baselineCardClass = 'fwa-score-card';//No I18N
	if(baselineStatus.color === 'red'){ baselineCardClass += ' fwa-score-card--risky'; }
	else if(baselineStatus.color === 'orange'){ baselineCardClass += ' fwa-score-card--review'; }
	else if(baselineStatus.color === 'green'){ baselineCardClass += ' fwa-score-card--compliant'; }
	
	var $baselineCard = $('<div id="BaselineRatingCard_'+snapId+'" style="width:30%;margin-right:10px;float:left" class="'+baselineCardClass+'"></div>');
	$baselineCard.append('<div class="fwa-score-card__hdr">'+
		'<span class="fwa-score-card__title">'+Ember.I18n.t('webclient.fwa.rulemgmt.device.score.baseline')+'</span>'+
		'<span class="fwa-score-badge fwa-score-badge--'+baselineStatus.color+'" style="float:right">'+baselineStatus.text+'</span>'+
	'</div>');
	$baselineCard.append('<div class="fwa-score-body">'+
		'<span class="fwa-score-percent fwa-score-percent--'+baselineStatus.color+'">'+baselineScore+'%</span>'+
	'</div>');
	$scoreSectionRow.append($baselineCard);
	
	// Regulatory Rating Card
	var regulatoryCardClass = 'fwa-score-card';//No I18N
	if(regulatoryStatus.color === 'red'){ regulatoryCardClass += ' fwa-score-card--risky'; }
	else if(regulatoryStatus.color === 'orange'){ regulatoryCardClass += ' fwa-score-card--review'; }
	else if(regulatoryStatus.color === 'green'){ regulatoryCardClass += ' fwa-score-card--compliant'; }
	
	var $regulatoryCard = $('<div id="RegulatoryRatingCard_'+snapId+'" style="width:30%;margin-right:10px;float:left" class="'+regulatoryCardClass+'"></div>');
	$regulatoryCard.append('<div class="fwa-score-card__hdr">'+
		'<span class="fwa-score-card__title">'+Ember.I18n.t('webclient.fwa.rulemgmt.device.score.regulatory')+'</span>'+
		'<span class="fwa-score-badge fwa-score-badge--'+regulatoryStatus.color+'" style="float:right">'+regulatoryStatus.text+'</span>'+
	'</div>');
	$regulatoryCard.append('<div class="fwa-score-body">'+
		'<span class="fwa-score-percent fwa-score-percent--'+regulatoryStatus.color+'">'+regulatoryScore+'%</span>'+
	'</div>');
	$scoreSectionRow.append($regulatoryCard);
	
	$scoreSection.append($scoreSectionRow);
	$contentdiv.append($scoreSection);
}

function fwa_drawFWADeviceSummaryWidget(snapId,widData,repTitle){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	if(repTitle){
		$contentdiv.append("<div class='opm_widget_title'><span class='headerTitleSpans'>"+repTitle+"</span></div>");
	}
	var $digList=$("<section class='DI-Grid' style='padding-top:20px'></section>");
	var $digGraph=$("<section class='DIG-Graph'></section>");
	$digList.append($digGraph);
	$digList.append("<div style='width:100%'><div style='width:48%;float:left' id='devList1'></div><div style='width:48%;float:left' id='devList2'></div></div>");
	$contentdiv.append($digList);
	var $donotList=$("<div class='DIGG-Dials DIGG-Time'></div>");
	$digGraph.append($donotList);
	
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonst.HostName',this)+" :</div><div>"+widData.deviceDispName+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.map.view.ipaddress',this)+" :</div><div>"+widData.ipAddress+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('opu.views.TYPE',this)+" :</div><div>"+widData.type+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('jsp.commonstr.Vendor',this)+" :</div><div>"+widData.vendorName+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.livetraffic.downlinkspeed',this)+" :</div><div>"+widData.downlink_speed+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.livetraffic.uplinkspeed',this)+" :</div><div>"+widData.uplink_speed+"</div></div>");
	$('#devList1').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.Last.Packet.Received',this)+" :</div><div>"+widData.last_pck_rcvd+"</div></div>");
	
	if(widData.managed == "1"){
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+" :</div><div>"+Ember.I18n.t('Managed',this)+"</div></div>");
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+" :</div><div>"+Ember.I18n.t('UnManaged',this)+"</div></div>");
	}
	
	if(widData.type == "Firewall"){
		if(widData.managed == "1"){
			if(widData.DDID != undefined){
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.deviceRule',this)+" :</div><div>"+Ember.I18n.t('webclient.fwa.inventory.configured',this)+"</div></div>");
			}else{
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.deviceRule',this)+" :</div><div>"+Ember.I18n.t('webclient.admin.users.notconfigured',this)+"</div></div>");
			}
		}else{
			$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.deviceRule',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
		}
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.inventory.deviceRule',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
	}	
	
	if(widData.type == "Firewall"){
		if(widData.virtual == "false"){
			if(widData.managed == "1"){
				if(widData.snmpSettings == "none"){
					$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>"+Ember.I18n.t('webclient.admin.users.notconfigured',this)+"</div></div>");
				}else{
					if(widData.snmpSettings){
						$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>"+Ember.I18n.t('webclient.fwa.inventory.configured',this)+"|"+Ember.I18n.t('webclient.devices.intftypes.enabled',this)+"</div></div>");
					}else{
						$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>"+Ember.I18n.t('webclient.fwa.inventory.configured',this)+"|"+Ember.I18n.t('webclient.devices.intftypes.disabled',this)+"</div></div>");
					}
				}
			}else{
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
			}
		}else{
			$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
		}
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.snmp.settings',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
	}	
	
	
	if(widData.type == "Firewall"){
		if(widData.managed == "1"){
			if(widData.intranetSettings){
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.setting.intranet.setting',this)+" :</div><div>"+Ember.I18n.t('webclient.fwa.inventory.configured',this)+"</div></div>");
			}else{
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.setting.intranet.setting',this)+" :</div><div>"+Ember.I18n.t('webclient.admin.users.notconfigured',this)+"</div></div>");
			}
		}else{
			$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.setting.intranet.setting',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
		}
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('fwa.setting.intranet.setting',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
	}	
	
	if(widData.type == "Firewall"){
		if(widData.managed == "1"){
			if(widData.excludehosts){
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.excludehost',this)+" :</div><div>"+Ember.I18n.t('webclient.fwa.inventory.configured',this)+"</div></div>");
			}else{
				$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.excludehost',this)+" :</div><div>"+Ember.I18n.t('webclient.admin.users.notconfigured',this)+"</div></div>");
			}
		}else{
			$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.excludehost',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
		}
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.fwa.excludehost',this)+" :</div><div>["+Ember.I18n.t('webclient.ncm.eol.na',this)+"]</div></div>");
	}	
	
	if(widData.virtual == "false"){
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.vicategory',this)+" :</div><div>"+Ember.I18n.t('opu.common.FALSE',this)+"</div></div>");
	}else{
		$('#devList2').append("<div class='DIGL-Row'><div>"+Ember.I18n.t('webclient.vimonitor.vicategory',this)+" :</div><div>"+Ember.I18n.t('opu.common.TRUE',this)+"</div></div>");
	}
	
	var grType=widData.speedType
	var tableData=widData.tableData;
	if(tableData != undefined){
		var inVal=0;
		var outVal=0;
		var percinVal=0;
		var percOutVal=0;
		var inText='';
		var OutText='';
		var suffixtext="";
		if(grType == 'Minimum'){
			inVal=tableData.data[0][2];
			percinVal=tableData.data[0][3];
			outVal=tableData.data[0][8];
			percOutVal=tableData.data[0][9];
			suffixtext=Ember.I18n.t('webclient.reports.tags.min',this);//NO I18N
		}else if(grType == 'Maximum'){//NO I18N
			inVal=tableData.data[0][0];
			percinVal=tableData.data[0][1];
			outVal=tableData.data[0][6];
			percOutVal=tableData.data[0][7];
			suffixtext=Ember.I18n.t('webclient.reports.tags.max',this);//NO I18N
		}else{
			inVal=tableData.data[0][4];
			outVal=tableData.data[0][10];
			percinVal=tableData.data[0][5];
			percOutVal=tableData.data[0][11];
			suffixtext=Ember.I18n.t('webclient.reports.tags.avg',this);//NO I18N
		}
		inVal = (inVal == "") ? 0:inVal;
		outVal = (outVal == "") ? 0:outVal;
		percinVal = (percinVal == "") ? 0:percinVal;
		percOutVal = (percOutVal == "") ? 0:percOutVal;
		inText=Ember.I18n.t('NFAWidget.IN',this)+" ("+suffixtext+")";
		OutText=Ember.I18n.t('NFAWidget.OUT',this)+" ("+suffixtext+")";
		
		temp = {};
		var obj1=changefwaSpeedSuffix(inVal);
		temp.speedvalue = obj1.val;
		temp.unit = obj1.unit;
		temp.iconspeedTitle = inText;
		var $traffInDial=$("<div><b>"+temp.speedvalue+"<i>"+temp.unit+"</i></b> <span>"+temp.iconspeedTitle+"</span> <i class='arrow'></i></div>");
		
		temp = {};
		var obj1=changefwaSpeedSuffix(outVal);
		temp.speedvalue = obj1.val;
		temp.unit = obj1.unit;
		temp.iconspeedTitle = OutText;
		var $traffOutDial=$("<div><b>"+temp.speedvalue+"<i>"+temp.unit+"</i></b> <span>"+temp.iconspeedTitle+"</span> <i class='arrow'></i></div>");
		var $traffDial=$('<div class="trafficInOut"><h3>'+Ember.I18n.t('NFAWidget.trfc',this)+'</h3></div>');
		$traffDial.append($traffInDial);
		$traffDial.append($traffOutDial);
		$donotList.append($traffDial);
		
		//Constructing Utilization and alerts Dial		
		temp = {};
		var dialDetails = getFormattedDialDetails(percinVal);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'util_in_div';//NO I18N
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'util_in_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	
		temp.iconTitle = Ember.I18n.t('webclient.reports.TrafficIN',this)+" ("+suffixtext+")";	
	    $donotList.append("<br/><div class='SpeedoMeter pointer' id="+temp.snapHolderId+"><i class='CutCircle'></i> <div ><b><span>"+temp.value+"</span> <i>% </i> </b></div> <i title="+temp.iconTitle+">"+temp.iconTitle+"</i></div>")
		opm_drawDialChart(temp.dialDivName,temp.dialValue,temp.dialColor);
		
		temp = {};
		dialDetails = getFormattedDialDetails(percOutVal);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'util_out_div';//NO I18N
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'util_out_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	
		temp.iconTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this)+" ("+suffixtext+")";
		$donotList.append("<div class='SpeedoMeter pointer' id="+temp.snapHolderId+"><i class='CutCircle'></i> <div ><b><span>"+temp.value+"</span> <i>% </i> </b></div> <i title="+temp.iconTitle+">"+temp.iconTitle+"</i></div>")
		opm_drawDialChart(temp.dialDivName,temp.dialValue,temp.dialColor);
		
	}
}

function changefwaSpeedSuffix(val){
	var obj={'val':0,'unit':''};//NO I18N
	if(val > (1024*1024*1024)){
		obj.val=((val / (1024*1024*1024)).toFixed(2));
		obj.unit=Ember.I18n.t('webclient.Gbps',this);//NO I18N
//		val = ((val / (1024*1024*1024)).toFixed(2)) +" "+Ember.I18n.t('webclient.Gbps',this); //No I18N
	}
	else if(val > 1024*1024){
		obj.val=((val/(1024*1024)).toFixed(2));
		obj.unit=Ember.I18n.t('webclient.Mbps',this);//NO I18N
//		val = ((val/(1024*1024)).toFixed(2))+" "+Ember.I18n.t('webclient.Mbps',this); //No I18N
	} else if(val > 1024){
		obj.val=((val/1024).toFixed(2));
		obj.unit=Ember.I18n.t('webclient.Kbps',this);//NO I18N
//		val = ((val/1024).toFixed(2))+" "+Ember.I18n.t('webclient.Kbps',this); //No I18N
	} else{
		obj.val=val;
		obj.unit=Ember.I18n.t('webclient.interface.units.bps',this);//NO I18N
//		val = val+" "+Ember.I18n.t('webclient.interface.units.bps',this); //No I18N
	}
	return obj;
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

function fwa_drawChangeMgmtFromPage(snapId,widData,reqParams,width,height,fromInv){
	
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.gettingstarted.fwa.standards.changemanagement',this)+'</div>');
    var tableContent='<table><tbody>';
   
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.reports.tags.DeviceName',this)+"</span> : "+reqParams.displayName+"</td></tr>";//NO I18N
    
    
    if(widData != undefined && widData.REPORT_TIME != undefined ){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+widData.REPORT_TIME+"</td></tr>";//NO I18N
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+widData.FROM_DATE+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+widData.TO_DATE+"</td></tr></tfoot>";//NO I18N
	}
    if(widData != undefined && widData.summaryDetail != undefined ){
    	var summaryDetail=widData.summaryDetail;
    	var configStr=(summaryDetail.cm_added != undefined ? summaryDetail.cm_added : 0)+" - "+Ember.I18n.t('added')+" | "+(summaryDetail.cm_modified != undefined ? summaryDetail.cm_modified : 0)+" - "+Ember.I18n.t('modified')+" | "+(summaryDetail.cm_deleted != undefined ? summaryDetail.cm_deleted : 0)+" - "+Ember.I18n.t('deleted');
    	var policyStr=(summaryDetail.added != undefined ? summaryDetail.added : 0)+" - "+Ember.I18n.t('added')+" | "+(summaryDetail.modified != undefined ? summaryDetail.modified : 0)+" - "+Ember.I18n.t('modified')+" | "+(summaryDetail.deleted != undefined ? summaryDetail.deleted : 0)+" - "+Ember.I18n.t('deleted');
    	tableContent = tableContent+"<tbody><tr><td><span>"+Ember.I18n.t('webclient.snapshot.name.Config.Changes')+"</span> : "+configStr+"</td><td><span>"+Ember.I18n.t('webclient.fwa.change.policy.changes')+"</span> : "+policyStr+"</td></tr></tbody>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}


function fwa_drawStandardFromPage(snapId,widData,reqParams,width,height,fromInv){
	$('.headerImage').remove();
	$('.headerInfo').remove();
	$('.subHeaderInfo').remove();
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div style='height:"+(height-120)+"px;border:1px solid'></div>");
	widParams.widgetElement.append($contentdiv);
	$contentdiv.append('<div style="width:30%;height:100%;background:#736F6E;float:left"><div style="width:100%;height:100%;display:table;text-align:center;-webkit-transform: rotate(-90deg);-moz-transform: rotate(-90deg);"><span style="display:table-cell;vertical-align:middle;color:white;font-size:35pt">'+Ember.I18n.t('webclient.reports.header',this)+'</span></div></div>');
	
	var $rightTab =  $('<div style="width:70%;height:100%;float:right"></div>');
	$contentdiv.append($rightTab);
	if(window.OPM.productName == "Firewall Analyzer"){
		$rightTab.append('<div id="logo_pdf_remove" style="width:100%;float:right"><div style="float:right"><img src="/apiclient/fluidicv2/img/fwa-logo.png" width="250" height="100"/></div><div style="height:10pt"></div></div>');
	}else{
		$rightTab.append('<div id="logo_pdf_remove" style="width:100%;float:right"><div style="float:right"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" width="250" height="100"/></div><div style="height:10pt"></div></div>');
	}
	var $filterDiv=$('<div style="width:100%;padding-left:60px;top:100px;position:relative"></div>');
	$rightTab.append($filterDiv);
	
	
	var repName=(reqParams.customRepName != undefined )? reqParams.customRepName : reqParams.reportName;
	var filtertab='<table width="100%"><tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t('webclient.reports.ReportName',this)+'</td><td style="width:75%;padding:5px">'+repName+'</td></tr>';//No I18N
	if(reqParams.customDesc != undefined && reqParams.customDesc != ''){
		filtertab+='<tr><td style="width:25%;padding:5px;font-weight:bold"></td><td style="width:75%;padding:5px">'+reqParams.customDesc+'</td></tr>';//NO I18N
	}
	filtertab+='<tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t('webclient.reports.tags.DeviceName',this)+'</td><td style="width:75%;padding:5px">'+reqParams.displayName+'</td></tr>';//NO I18N
	
	if(widData[reqParams.reportName] != undefined && widData[reqParams.reportName].lastGenerated != undefined ){
		filtertab+='<tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t('webclient.fwa.gen.time',this)+'</td><td style="width:75%;padding:5px">'+widData[reqParams.reportName].lastGenerated.replace("on ","")+'</td></tr>';//NO I18N
	}
	
	
	
	if(widData.netWorkDetails != undefined){
		var jsonResp=widData.filterDetail;
		var tabWidth=(width*0.7)-110;
		filtertab+='<tr><td style="width:25%;padding:5px;font-weight:bold">'+Ember.I18n.t('fwa.compliance.Network_Detail',this)+'</td><td style="width:60%;padding:5px"></td></tr>';//No I18N
		filtertab+='</table></td></tr>';//NO I18N
		
		filtertab+='<tr><td colspan="2"><table cellspacing=0 cellpadding=0 style="border:1px solid #d6d6d6;width:'+tabWidth+'px">';//NO I18N
		$.each(widData.netWorkDetails, function(index,value) {
		    if(index== "DMZ" || index== "WAN" || index== "LAN" || index== "PCI Zone"){
		        filtertab+='<tr style="border-bottom:0.5px solid"><td style="width:50%;padding:5px;border-bottom:1px solid #d6d6d6;border-right:1px solid #d6d6d6">'+index+'</td><td style="width:50%;padding:5px;border-bottom:1px solid #d6d6d6;">'+value.join(",")+'</td></tr>';//NO I18N
		    }
		});
		filtertab+='</table></td></tr>';//NO I18N
		
	}
	
	
	filtertab+='</table>';//NO I18N
	$filterDiv.append(filtertab);
	widParams.widgetElement.append('<div class="opmFormRow" style="width:'+(width-40)+'px;margin-top:20px;border:0px !important"><div class="opmFormCol fullCol privacyInfoMsgUserDetails"><p>* '+Ember.I18n.t('fwa.GDPRalert.csvPDFMsg',this)+'</p><hr/></div></div>');
	
}
function fwa_drawFromPage(snapId,widData,reqParams,width,height,fromInv){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	if(fromInv){
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.customtab.inventory',this)+'</div>')
	}else{
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.reports.header',this)+'</div>')
	}
    
    var tableContent='<table><tbody>';
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.headerText1+"</span> : "+reqParams.headerVal1+"</td></tr>";//NO I18N
	if(reqParams.headerText2 != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.headerText2+"</span> : "+reqParams.headerVal2+"</td></tr>";//NO I18N
	}
	
	
	if(reqParams.snapType == "FWADeviceRuleMgmt" || reqParams.snapType == "FWADevGrpRuleMgmt"){
    	var totWidgetData=widData.widData;
    	var widParams ={};
    	if(totWidgetData != undefined){
    		for(var i=0;i<totWidgetData.length;i++){
    			var widgetDetails=totWidgetData[i].widDetails;
    			var singleWidData=totWidgetData[i].widData;
    			if(widgetDetails != undefined && widgetDetails.type == "FWARuleMgmtSummary"){
    				var htmlStr="";//No I18N
    				if(reqParams.devType == "Device"){
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.security.rules',this)+"</span> : "+singleWidData.SUMMARY_STATS.Total_Rules_Count;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+"</span> : "+singleWidData.SUMMARY_STATS.ExpiryReport.ExpiryReport;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.overall.risk',this)+"</span> : "+singleWidData.SUMMARY_STATS.Total_Riskly_Rules_Count+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.rule.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.objectCount;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.network.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.networkCount;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.service.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.serviceCount+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.rulemgmt.last.backup.time',this)+"</span> : "+singleWidData.SUMMARY_STATS.LAST_CONFIG_BACKUP_TIME+"</td></tr>";//NO I18N
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.snapshot.name.Config.Changes',this)+"</span> : "+Ember.I18n.t('webclient.linesadded',this)+" - "+singleWidData.SUMMARY_STATS.CONFIG_CHANGE_STATS.cm_added+" , "+Ember.I18n.t('webclient.linesModified',this)+" - "+singleWidData.SUMMARY_STATS.CONFIG_CHANGE_STATS.cm_modified+" , "+Ember.I18n.t('webclient.linesdeleted',this)+" - "+singleWidData.SUMMARY_STATS.CONFIG_CHANGE_STATS.cm_deleted+"</td></tr>";//NO I18N
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.change.rule.changes',this)+"</span> : "+Ember.I18n.t('webclient.linesadded',this)+" - "+singleWidData.SUMMARY_STATS.RULE_CHANGE_STATS.added+" , "+Ember.I18n.t('webclient.linesModified',this)+" - "+singleWidData.SUMMARY_STATS.RULE_CHANGE_STATS.modified+" , "+Ember.I18n.t('webclient.linesdeleted',this)+" - "+singleWidData.SUMMARY_STATS.RULE_CHANGE_STATS.deleted+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+"</span> : "+singleWidData.SUMMARY_STATS.UNASSIGNED_STATS.InterfaceDetails;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.UNASSIGNED_STATS.FirewallObjects+"</td></tr>";//NO I18N
    					
    				}else{
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.rulemgmt.total.device.count',this)+"</span> : "+singleWidData.SUMMARY_STATS.TOTAL_DEVICE_COUNT+"</td></tr>";//NO I18N
    					
    					var devListStr='';
    			    	if(widData.grpDevDetails != undefined){
    			    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			    			if(ik ==0){
    			    				devListStr = widData.grpDevDetails[ik].displayname;
    			    			}else{
    			    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			    			}
    			    		}
    			    	}
    			    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.security.rules',this)+"</span> : "+singleWidData.SUMMARY_STATS.Total_Rules_Count;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+"</span> : "+singleWidData.SUMMARY_STATS.ExpiryReport.ExpiryReport+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.rule.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.objectCount;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.network.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.networkCount;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.service.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.OBJECTS_STATS.serviceCount+"</td></tr>";//NO I18N
    					
    					tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+"</span> : "+singleWidData.SUMMARY_STATS.UNASSIGNED_STATS.InterfaceDetails;//NO I18N
    					tableContent = tableContent+" | <span>"+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+"</span> : "+singleWidData.SUMMARY_STATS.UNASSIGNED_STATS.FirewallObjects+"</td></tr>";//NO I18N
    					
    				}
    			}
    		}
    	}
    }
	
	tableContent=tableContent+"</tbody>";//No I18N
	if(reqParams.snapType != "FWADeviceRuleMgmt" && reqParams.snapType != "FWADevGrpRuleMgmt"){
		tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+widData.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+widData.endDate+"</td></tr></tfoot>";//NO I18N
	}
	
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    
    if(widData.filterDetail != undefined){
		var jsonResp=widData.filterDetail;
		var defTableDiv='<h2 class="fwaSubHeading">'+Ember.I18n.t('webclient.fwa.filter.default.criteria',this)+'</h2>';
		defTableDiv=defTableDiv+'<table><thead><tr><th style="width:33%">'+Ember.I18n.t('webclient.devices.fields',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.discovery.type',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.widget.value',this)+'</th></tr></thead>';//NO I18N
		$.each(jsonResp.default_crt, function(index,value) {
	    	if(value.field == "adv_log_srch"){
	    		value.field = Ember.I18n.t('webclient.fwa.search.type',this);//NO I18N
	    		value.type = Ember.I18n.t('webclient.fwa.search.is',this);
	    		value.value = (value.value == "LOGTYPE:1:u" ? Ember.I18n.t('fwa.search.unknown.protocol',this):(value.value == "LOGTYPE:1:proxy" ? Ember.I18n.t('fwa.search.raw.proxy.logs',this):Ember.I18n.t('fwa.search.raw.firewall.logs',this)));//NO I18N
	    	}
	    	defTableDiv+='<tr><td>'+value.field+'</td><td>'+value.type+'</td><td>'+value.value+'</td></tr>';//NO I18N
		});
		defTableDiv+='</table>';//NO I18N
		var $deftableTab=$('<div class="fwaTableUi noBorderTheadBottom"></div>');
    	$contDiv.append($deftableTab);
    	$deftableTab.html(defTableDiv);
		if(jsonResp.my_crt.filterApplied == "true"){
			defTableDiv='<h2 class="fwaSubHeading">'+Ember.I18n.t('webclient.fwa.filter.my.criteria',this)+'</h2>';
			defTableDiv=defTableDiv+'<table><thead><tr><th style="width:33%">'+Ember.I18n.t('webclient.devices.fields',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.discovery.type',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.widget.value',this)+'</th></tr></thead>';//NO I18N
			$.each(jsonResp.my_crt, function(index,value) {
			    if(value.field != undefined){
			    	defTableDiv+='<tr><td>'+value.field+'</td><td>'+value.type+'</td><td>'+value.value+'</td></tr>';//NO I18N
			    }
			});
			defTableDiv+='</table>';//NO I18N
			var $deftableTab2=$('<div class="fwaTableUi noBorderTheadBottom"></div>');
	    	$contDiv.append($deftableTab2);
	    	$deftableTab2.html(defTableDiv);
		}	
	}
    
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
}


function fwa_drawRuleMgmtReorderHeader(snapId,widData,reqParams,width,height){
	
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.fwa.rule.reorder',this)+'</div>');
    var tableContent='<table><tbody>';
   
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    var reptit=Ember.I18n.t("fwa.Complete.Changes",this);//NO I18N
    if(reqParams.reorderObjectType == "suggested"){
    	reptit = Ember.I18n.t("fwa.Suggested.Changes",this);//NO I18N
    }
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('fwa.compliance.Report_Name',this)+"</span> : "+reptit+"</td></tr>";//NO I18N
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+widData.lastGen+"</td></tr>";//NO I18N
    tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+widData.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+widData.endDate+"</td></tr></tfoot>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwa_drawRuleMgmtOptimizationHeader(snapId,widData,reqParams,width,height){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.fwa.policy.optimization',this)+'</div>');
    var tableContent='<table><tbody>';
   
    
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else{
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    if(reqParams.anomalyType != undefined && reqParams.anomalyType != "all") {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.Anomaly.Report.Type',this)+"</span> : "+reqParams.anomalyType+"</td></tr>";//NO I18N
    }
   
    tableContent=tableContent+"</tbody>";//No I18N
   
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
//    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    

}
function fwa_drawRuleExpiryHeader(snapId,widData,reqParams,width,height){


	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	var repTitle="";
	if(reqParams.type == "allsch"){
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.allsch',this);//No I18N
	}else if(reqParams.type == "active" || reqParams.type == "expiresnext"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.active',this);//No I18N
	}else if(reqParams.type == "upcoming"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.upcoming',this);//No I18N	
	}else if(reqParams.type == "expired"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.expired',this);//No I18N
	}else if(reqParams.type == "recurring"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.recurring',this);//No I18N
	}
	$contDiv.append('<div class="fwaHeading_pdf">'+repTitle+'</div>');
    
    var tableContent='<table><tbody>';
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else{
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
    if(reqParams.type == "active" || reqParams.type == "expiresnext"){//NO I18N
    	if(reqParams.filter != "all"){
    		var filterMap ={1:Ember.I18n.t('webclient.24.Hrs',this),7:Ember.I18n.t('webclient.7.Days',this),30:Ember.I18n.t('webclient.30.Days',this),90:Ember.I18n.t('webclient.90.Days',this)}
    		var filterTxt = (reqParams.type == "active") ?Ember.I18n.t('webclient.fwa.rule.expiry.filter.msg1',this) :Ember.I18n.t('webclient.fwa.rule.expiry.filter.msg3',this);
   		 	tableContent = tableContent+"<tr><td colspan='2'><span>"+filterTxt+"</span> : "+filterMap[reqParams.filter]+"</td></tr>";//NO I18N   
    	}
	}
    
    if(reqParams.type == "expired"){//NO I18N
    	if(reqParams.filter != "all"){
    		var filterMap ={1:Ember.I18n.t('webclient.24.Hrs',this),7:Ember.I18n.t('webclient.7.Days',this),30:Ember.I18n.t('webclient.30.Days',this),90:Ember.I18n.t('webclient.90.Days',this)}
    		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.rule.expiry.filter.msg2',this)+"</span> : "+filterMap[reqParams.filter]+"</td></tr>";//NO I18N
    	}
    }
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
   
    tableContent=tableContent+"</tbody>";//No I18N
    
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');

}

function fwa_drawRuleMgmtHeader(snapId,widData,reqParams,width,height){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.repTitle+'</div>');
    var tableContent='<table><tbody>';
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else{
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
	if(reqParams.query != undefined){	
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('ncm.complianceiq.rule.criteria_pattern',this)+"</span> : "+reqParams.query+"</td></tr>";//NO I18N
	}

	if(reqParams.filterMap != undefined){	
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.admin.re.criteria',this)+"</span> <br> ";//NO I18N
		var filterMap=JSON.parse(reqParams.filterMap);
		$.each(filterMap, function(key,value) {
			tableContent = tableContent+"<span style='padding-left:10px'>"+value.chipNumber+"</span> : <span>"+value.fieldName+" " +value.condition+" "+value.fieldValues.join(",")+"</span><br>";//NO I18N
		});
		tableContent = tableContent+"</td></tr>";//NO I18N
	}

    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    if(reqParams.policyNameList != undefined){
		var policyNameList=reqParams.policyNameList.split(",");
		var policyNameStr="";
		for(var ij=0;ij<policyNameList.length;ij++){
			policyNameStr+=policyNameList[ij]+"<br/>";
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.inventory.policyname',this)+"</span> : "+policyNameStr+"</td></tr>";//NO I18N
	}
	tableContent=tableContent+"</tbody>";//No I18N
	
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    var colNamesList = ['', '',Ember.I18n.t("webclient.inventory.policyname",this),Ember.I18n.t("webclient.fwa.rule.num.id",this), Ember.I18n.t("webclient.fault.event.displayName",this), Ember.I18n.t("NFAWidget.Dst",this), Ember.I18n.t("webclient.WAN.SourceInterface",this),Ember.I18n.t("fwa.webclient.destination.interface",this),Ember.I18n.t("NFAWidget.App",this),Ember.I18n.t("fwa.rule.service",this),Ember.I18n.t("webclient.admin.proxy.serverauth",this),Ember.I18n.t("webclient.inventory.direction",this),'NAT','UTM',Ember.I18n.t("jsp.approval.Schedule",this),Ember.I18n.t("webclient.fwa.policy.schedule.timeout",this),Ember.I18n.t("webclient.fwa.policy.traffic.shaper",this),Ember.I18n.t("webclient.fwa.comment",this),Ember.I18n.t("webclient.fwa.policy.applied.on",this),'URL',Ember.I18n.t("webclient.fwa.policy.log.level",this),Ember.I18n.t("webclient.fwa.policy.log.interval",this),Ember.I18n.t("webclient.common.appmanager.type.text",this),Ember.I18n.t("fwa.webclient.devicerule.checkpoint.logtrack",this),Ember.I18n.t("webclient.admin.traps.action",this)];//No I18N                  
	var colModelList = [{ name: 'logging', index: 'logging'},//NO I18N
	                    { name: 'status', index: 'status'}, //NO I18N
	                    { name: 'policyname', index: 'policyname'}, //No I18N
	                    { name: 'rulename', index: 'rulename'}, //No I18N
	                    { name: 'rule_src', index: 'rule_src'}, //No I18N
	                    { name: 'rule_dst', index: 'rule_dst'}, //No I18N
	                    { name: 'src_int', index: 'src_int'}, //No I18N
	                    { name: 'dst_int', index: 'dst_int'}, //No I18N
	                    { name: 'application', index: 'application'}, //No I18N
	                    { name: 'service', index: 'service'}, //No I18N
	                    { name: 'authetication', index: 'authetication'}, //No I18N
	                    { name: 'direction', index: 'direction'}, //No I18N
	                    { name: 'nat', index: 'nat'}, //No I18N
	                    { name: 'utm', index: 'utm'}, //No I18N
	                    { name: 'schedule', index: 'schedule'}, //No I18N
	                    { name: 'schedule_timeout', index: 'schedule_timeout'}, //No I18N
	                    { name: 'traffic_shaper', index: 'traffic_shaper'}, //No I18N
	                    { name: 'comments', index: 'comments'}, //No I18N
	                    { name: 'Applied_On', index: 'Applied_On'}, //No I18N
	                    { name: 'url', index: 'url'}, //No I18N
	                    { name: 'log_level', index: 'log_level'}, //No I18N
	                    { name: 'log_interval', index: 'log_interval'}, //No I18N
	                    { name: 'type', index: 'type'}, //No I18N
	                    { name: 'Track', index: 'Track'}, //No I18N
	                    { name: 'action',index:'action'}//NO I18N
	                    ];
	
	var deviceType=reqParams.deviceType;
	if(deviceType=='Paloalto' || deviceType=='SRX Log Format' || deviceType=='HUAWEI' || deviceType=='Netscreen Native' || deviceType=='SonicWall' ){//No I18N
		colNamesList[6]=Ember.I18n.t("webclient.fwa.source.zone",this);
		colNamesList[7]=Ember.I18n.t("webclient.fwa.destination.zone",this);
	}
	
	if(reqParams.filters != undefined){
		var filters=JSON.parse(reqParams.filters);
		var jsonResp=filters.rules;
		var tabWidth=(width*0.7)-110;
		
		var defTableDiv='<h2 class="fwaSubHeading">Search Criteria</h2>';
		defTableDiv=defTableDiv+'<table><thead><tr><th style="width:33%">'+Ember.I18n.t('webclient.devices.fields',this)+'</th><th style="width:50%">'+Ember.I18n.t('webclient.widget.value',this)+'</th></tr></thead>';//NO I18N
		
		
		$.each(jsonResp, function(index,value) {
			var field=value.field;
			var fieldName="";
			for(var ji=0;ji<colModelList.length;ji++){
				if(colModelList[ji].index == field){
					fieldName=colNamesList[ji];
				}
			}
			defTableDiv+='<tr><td>'+fieldName+'</td><td>'+value.data+'</td></tr>';//NO I18N
		});
		defTableDiv+='</table>';//NO I18N
		var $deftableTab=$('<div class="fwaTableUi noBorderTheadBottom"></div>');
    	$contDiv.append($deftableTab);
    	$deftableTab.html(defTableDiv);
		
	}
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
}


function fwa_drawRuleMgmtNatRulesHeader(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	
    if(reqParams != undefined && reqParams.repTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.repTitle+'</div>')
    }
    
    var tableContent='<table><tbody>';
   

	if(widData.grpName != undefined){
			tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
			var devListStr='';
			if(widData.grpDevDetails != undefined){
				for(var ik=0;ik < widData.grpDevDetails.length;ik++){
					if(ik ==0){
						devListStr = widData.grpDevDetails[ik].displayname;
					}else{
						devListStr += " , "+widData.grpDevDetails[ik].displayname;
					}
				}
			}
			tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
		}else{
			tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
		}

    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwa_drawFWARuleImpactWidget(widData,reqParams){
	if(widData.content != undefined){
		$('#zchartgraph2').html(widData.content);
		$("#zchartgraph2 a").replaceWith(function(){
			return $("<span>" + $(this).html() + "</span>");
		});
	}
}

function fwa_drawFWAReportRawWidget(snapId,widData,reqParams){
	var repList=widData.reportList;
	var widParams ={};
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);

	var reptitle=Ember.I18n.t("webclient.fwa.formatted.logs",this);//NO I18N
	var widElem=$('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
	widParams.widgetElement=widElem;
	$contDiv.append(widElem);
	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);

	if(repList[0] != undefined){
		repDetails=repList[0];
				
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");	
		var defaultOptions = {};
		defaultOptions.page=reqParams.page;
		defaultOptions.rows=reqParams.rows;
		var gridData =[];
		if(repDetails.repData != undefined && repDetails.repData.data != undefined){
			gridData = repDetails.repData.data;
		}
		var sendObj = {};
		defaultOptions.rowNumNeeded=true;
		sendObj.gridId = "opm_App_Legend"+snapId;//No I18N
		sendObj.defaultOptions = defaultOptions;
		if(reqParams != undefined && reqParams.type == 'raw'){
			reptitle=Ember.I18n.t("webclient.fwa.raw.logs",this);//NO I18N
			repDetails.colNameList=["Syslog Message"];
		}
		sendObj.colNames = repDetails.colNameList;
		var colModelList=getFWAColModels(repDetails.colNameList.length);
		if(repDetails.columnFormat != undefined){
			var columnFormat=repDetails.columnFormat;
			if(colModelList.length == columnFormat.length){
				for(var k=0;k<columnFormat.length;k++){
					if(columnFormat[k] == "time"){
						for(var j=0;j<gridData.length;j++){
							var cellvalue=gridData[j][k];
							if(cellvalue != undefined && cellvalue.indexOf(",") > -1){
								var tempTxt=cellvalue.split(",");
								if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
									cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
								}
								gridData[j][k]=cellvalue;
							}else if(cellvalue != undefined && cellvalue.indexOf(" ") > -1){
								var tempTxt=cellvalue.split(" ");
								if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
									cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
								}
								gridData[j][k]=cellvalue;
							}
						}
					}
				}
			}
		}
		sendObj.data = gridData;
		sendObj.colModels = colModelList;
		sendObj.captionTitle = "";
		sendObj.gridNavigator = "";		
		fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,true,reqParams);	
	}
	$contDiv.append('<div class="fwaHeading_pdf">'+reptitle+'</div>');
}
function fwa_drawFWAReportMultipleWidget(snapId,widData,reqParams){
	$('.headerInfo').remove();
	$('.subHeaderInfo').remove();
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var reportList= widData.selreportList;
	for(var ij=0;ij<reportList.length;ij++){
		fwa_drawFWAReportWidgetNew(ij,reportList[ij].repData,reqParams,widParams,reportList[ij].rbbTitle);
	}
}

function fwa_drawFWAInventoryMultipleWidget(snapId,widData,reqParams){
	$('.headerInfo').remove();
	$('.subHeaderInfo').remove();
	var totWidgetData=widData.widData;
	var widParams ={};
	if(totWidgetData != undefined){
		for(var i=0;i<totWidgetData.length;i++){
			var widgetDetails=totWidgetData[i].widDetails;
			var singleWidData=totWidgetData[i].widData;
			if(widgetDetails != undefined && (widgetDetails.type == "FWACompleteData" || widgetDetails.type == "FWAReportData")){
				widgetDetails.tempId=i;
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);	
				$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t(widgetDetails.desc)+'</div>');
				var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
				$('#widgetElement_'+i).append($contentdiv);
				var response=singleWidData;
				if(response.widgetAdditionalData.chartType == "pie"){
					$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
					$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+i+"' class='ut ut-Grid'></table></div>");
					loadPieGraphParams(i,widData,reqParams,widParams,response);
					loadTableParams(i,widData,reqParams,widParams,response);
				}else if(response.widgetAdditionalData.chartType == "timeseries"){//NO I18N
					$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
					$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+i+"' class='ut ut-Grid'></table></div>");
					loadTimeSeriesGraphParams(i,widData,reqParams,widParams,response);
				}else if(response.widgetAdditionalData.isTableData == "true" || response.widgetAdditionalData.chartType == "bar"){//No I18N
					$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_bar_table"+i+"' class='ut ut-Grid'></table></div>");
					var defaultOptions = {};
					var gridData = response.data;
					var sendObj = {};
					defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
					defaultOptions.criteria=response.widgetAdditionalData.criteria;
					sendObj.gridId = "opm_fwa_bar_table"+i;//No I18N
					sendObj.data = gridData;
					sendObj.defaultOptions = defaultOptions;
					if(response.widgetAdditionalData.chartType == "bar"){
						var colDetail=getFWABarColDetails(response);
						sendObj.colNames = colDetail.colNameList;
						sendObj.colModels = colDetail.colModelList;
					}else{
						sendObj.colNames = response.widgetAdditionalData.colList;
						sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
					}
					sendObj.captionTitle = "";
					sendObj.gridNavigator = "";		
					fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,false,reqParams);
				}

			}else if(widgetDetails != undefined && widgetDetails.type == "FWADeviceSummary"){
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);	
				$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t(widgetDetails.desc)+'</div>');
				var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				fwa_drawFWADeviceSummaryWidget(i,singleWidData);
			}else if(widgetDetails != undefined && widgetDetails.type == "FWARuleMgmtGrid"){
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);	
				$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t(widgetDetails.desc)+'</div>');
				var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				var response=singleWidData;
				var widParams ={};
				widParams.widgetElement = $("#widgetElement_"+i); //NO I18N
				var parameters = widgetDetails.parameters;
				var widtype="";
				for(l=0;l<parameters.length;l++){
					if(parameters[l].param == "type"){
						widtype=parameters[l].value;
					}
				}
				var reqParams={"type":widtype};//NO I18N
				fwa_drawFWARuleMgmtGridWidgetSingle(i,singleWidData,reqParams,widParams);
				
			}else if(widgetDetails != undefined && widgetDetails.type == "FWARuleMgmtDeviceScore"){
				var $contDiv = $('<div class="" style="margin-bottom: 40px;margin-right:10px;margin-left:10px;top:17px;"></div>');
				$('.mainContent').append($contDiv);	
				var widElem=$('<div id="widgetElement_'+i+'" class="" ></div>');
				$contDiv.append(widElem);
				fwa_drawFWARuleMgmtDeviceScoreWidget(i,singleWidData);
			}else if(widgetDetails != undefined && widgetDetails.type == "FWAReportList"){
				var reportList= singleWidData.reportList;
				for(var ij=0;ij<reportList.length;ij++){
					var tempid=i+"_"+ij;
					
					var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
					$('.mainContent').append($contDiv);	
					var repTitle = reportList[ij].rbbTitle;
					$contDiv.append('<div class="fwaHeading_pdf">'+repTitle+'</div>');
					var widElem=$('<div id="widgetElement_'+tempid+'" class="" style="width:100%;"></div>');
					$contDiv.append(widElem);
					var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+tempid+"' style='page-break-after:always;'></div>");
					$('#widgetElement_'+tempid).append($contentdiv);
					
					var response=reportList[ij].repData;
					if(response.widgetAdditionalData.chartType == "pie"){
						$contentdiv.append("<div id='perfGraph1"+tempid+"'></div>");
						$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+tempid+"' class='ut ut-Grid'></table></div>");
						loadPieGraphParams(tempid,widData,reqParams,widParams,response);
						loadTableParams(tempid,widData,reqParams,widParams,response);
					}else if(response.widgetAdditionalData.chartType == "timeseries"){//NO I18N
						$contentdiv.append("<div id='perfGraph1"+tempid+"'></div>");
						$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+i+"' class='ut ut-Grid'></table></div>");
						loadTimeSeriesGraphParams(tempid,widData,reqParams,widParams,response);
					}else if(response.widgetAdditionalData.isTableData == "true" || response.widgetAdditionalData.chartType == "bar"){//No I18N
						$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_bar_table"+tempid+"' class='ut ut-Grid'></table></div>");
						var defaultOptions = {};
						var gridData = response.data;
						var sendObj = {};
						defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
						defaultOptions.criteria=response.widgetAdditionalData.criteria;
						sendObj.gridId = "opm_fwa_bar_table"+tempid;//No I18N
						sendObj.data = gridData;
						sendObj.defaultOptions = defaultOptions;
						if(response.widgetAdditionalData.chartType == "bar"){
							var colDetail=getFWABarColDetails(response);
							sendObj.colNames = colDetail.colNameList;
							sendObj.colModels = colDetail.colModelList;
						}else{
							sendObj.colNames = response.widgetAdditionalData.colList;
							sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
						}
						sendObj.captionTitle = "";
						sendObj.gridNavigator = "";		
						fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,false,reqParams);
					}
				}
			}else if(widgetDetails != undefined && widgetDetails.type == "FWAGraph"){
				var snapDetails=widgetDetails;
				var apiResponse=singleWidData;
				
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);	
				$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t(widgetDetails.desc)+'</div>');
				var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
				$('#widgetElement_'+i).append($contentdiv);
				
				var response=singleWidData;
				$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
				$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+i+"' class='ut ut-Grid'></table></div>");
				var graphParams = {};
				graphParams.id = 'perfGraph1'+i;
				if(apiResponse.GraphData == undefined){
					apiResponse.GraphData=[];
				}
				if(snapDetails != undefined && (snapDetails.name == 'fwa.device.bandwidth' || snapDetails.name == 'fwa.interface.bandwidth')){
					$.each(apiResponse.GraphData, function(i, item){
						if(item != undefined && item.seriesname == 'In'){
							item.seriesname=Ember.I18n.t('NFAWidget.IN',this);//No I18N
						}else if(item != undefined && item.seriesname == 'Out'){//No I18N
							item.seriesname=Ember.I18n.t('NFAWidget.OUT',this);//No I18N
						}
					});
				}
				graphParams.data = apiResponse.GraphData;
				graphParams.yAxis = apiResponse.yAxis;
			//	graphParams.customToolTip = nfa_getCustomTooltipFormat();
				graphParams.graphType = 'area';//No I18N
				
				var timeFormat="today";//No I18N
				if(reqParams != undefined && reqParams.timeFrame != undefined){
					graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(reqParams.timeFrame);
				}else{
					graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(timeFormat);
				}
				
				loadFWAPDFGraph(graphParams);
				if(snapDetails != undefined && (snapDetails.name == 'fwa.device.bandwidth' || snapDetails.name == 'fwa.interface.bandwidth')){
					$contentdiv.append("<div class='opm_jqGridUI'><table id='fwa_InterfaceTrafficIn"+i+"' class='ut ut-Grid'></table></div>");
					$contentdiv.append("<div class='opm_jqGridUI'><table id='fwa_InterfaceTrafficOut"+i+"' class='ut ut-Grid'></table></div>");
					var tableParams = {};
					var trafficIn = {};
					if(apiResponse.yAxis != undefined){
						trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this)+" ("+apiResponse.yAxis+")";
					}else{
						trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this);//NO I18N
					}
					
					trafficIn.defaultOptions = {};
					var widgetID=i;
					trafficIn.gridId = 'fwa_InterfaceTrafficIn'+i; //No I18N
					trafficIn.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
					trafficIn.colModels = [
					                     { name: '2', index: '2', classes:"pointer"}, //No I18N
					                     { name: '0', index: '0', classes:"pointer"}, //No I18N
					                     { name: '4', index: '4', classes:"pointer"} //No I18N
					                     ]; 
					trafficIn.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
					tableParams.trafficDetailIn=trafficIn;
					
					
					var trafficOut = {};
					if(apiResponse.yAxis != undefined){
						trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this)+" ("+apiResponse.yAxis+")";
					}else{
						trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this);//NO I18N
					}
					
					trafficOut.defaultOptions = {};
					
					trafficOut.gridId = 'fwa_InterfaceTrafficOut'+i; //No I18N
					trafficOut.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
					trafficOut.colModels = [
					                      { name: '8', index: '8', classes:"pointer"}, //No I18N
					                      { name: '6', index: '6', classes:"pointer"}, //No I18N
					                      { name: '10', index: '10', classes:"pointer"} //No I18N
					                      ]; 
					trafficOut.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
					tableParams.trafficDetailOut=trafficOut;
					fwa_loadPDFJQgridWithData('#'+trafficIn.gridId,trafficIn.data,trafficIn.colNames,trafficIn.colModels,trafficIn.captionTitle,"","",trafficIn.defaultOptions,false,reqParams);
					fwa_loadPDFJQgridWithData('#'+trafficOut.gridId,trafficOut.data,trafficOut.colNames,trafficOut.colModels,trafficOut.captionTitle,"","",trafficOut.defaultOptions,false,reqParams);
				}	
			}
		}
	}
 	
}

function fwa_drawFWARuleMgmtReorderWidget(snapId,widData,reqParams){

	var widParams ={};
	var colNamesList=[];
	var colModelList=[];
	var gridData=[];
	
	var response=widData;
	if(reqParams.reorderObjectType == "suggested"){
		$('#widgetElement_'+snapId).append("<div class='content singleInvWidget'><div class='opm_jqGridUI'><table id='opm_fwa_suggtable"+snapId+"' class='ut ut-Grid'></table></div></div>");
	}else{
		$('#widgetElement_'+snapId).append("<div class='content singleInvWidget'><div class='opm_jqGridUI'><table id='opm_fwa_comptable"+snapId+"' class='ut ut-Grid'></table></div></div>");
	}
	
	if(reqParams.reorderObjectType == "suggested"){
		if(widData.ReorderDetails.reorderReport != null) {
			var reorderReport = widData.ReorderDetails.reorderReport;
			if(reorderReport.selectedColumn != null) {
				var colNamesList = [];
				var colModelList = [];
				for (var index = 0; index < reorderReport.selectedColumn.length; index++) {
					var array_element = reorderReport.selectedColumn[index];
					colNamesList.push(array_element);
					colModelList.push({ name: array_element, index: array_element});
				}
				fwa_loadPDFJQgridWithData('#opm_fwa_suggtable'+snapId,reorderReport.results,colNamesList,colModelList,"","","",{},false);
			}
		}
	}else{
		if(widData.ReorderDetails.reorderFullReport != null) {
			var fullReport = widData.ReorderDetails.reorderFullReport;
			if(fullReport.selectedColumn != null) {
				var colNamesList = [];
				var colModelList = [];
				for (var index = 0; index < fullReport.selectedColumn.length; index++) {
					var array_element = fullReport.selectedColumn[index];
					colNamesList.push(array_element);
					colModelList.push({ name: array_element, index: array_element});
				}

				fwa_loadPDFJQgridWithData('#opm_fwa_comptable'+snapId,fullReport.results,colNamesList,colModelList,"","","",{},false);
			}
		}
	}
}

function fwa_drawFWAUnusedRuleDataWidget(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var colNamesList=[];
	var colModelList=[];
	var gridData=[];
	

	
	if(reqParams.unsedType==="unusedRules") {
		if(reqParams.unusedRuleType == "ACE"){
			colNamesList = [Ember.I18n.t("webclient.inventory.acl",this)+"/"+Ember.I18n.t("jsp.commonstr.RuleName",this),Ember.I18n.t("webclient.fwa.unused.ace",this)]; //No I18N
			colModelList = [{ name: 'aclname', index: 'aclname'}, //No I18N
			                { name: 'aces', index: 'aces'} //No I18N
			               ];
			gridData=widData.UnusedAces;
		}else{
			if(reqParams.deviceType == "Cisco"){
				colNamesList = [Ember.I18n.t("webclient.fwa.rule.num.id",this),Ember.I18n.t("webclient.fwa.rule.description",this)]; //No I18N
				colModelList = [{ name: 'Rule', index: 'Rule'}, //No I18N
									{ name: 'Description', index: 'Description'} //No I18N
				];
				gridData=widData.UnusedRules;
			}else{
				var colNamesList=JSON.parse(reqParams.overviewcolName);
				var colModelList=JSON.parse(reqParams.overviewcolModel);
				
				var OverviewColNameListTemp=[];
				var OverviewColModelListTemp=[];
				
				for(var i=0;i<colModelList.length;i++){
					if(colModelList[i].name != 'cb'){//No I18N
						OverviewColNameListTemp.push(colNamesList[i]);
						OverviewColModelListTemp.push(colModelList[i]);
					}
				}
				for(var i=0;i<OverviewColModelListTemp.length;i++){
					var col = OverviewColModelListTemp[i];
					if(col.index === 'logging'){//No I18N
						OverviewColModelListTemp[i].width = 40;
						OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
							var logClass="iconLogdisable";//NO I18N
							var logTitle=Ember.I18n.t("webclient.fwa.logging.disabled",this);//NO I18N
							if(cellValue!=null && cellValue.indexOf("enable")>-1){
								logClass="iconLog";//NO I18N
								logTitle=Ember.I18n.t("webclient.fwa.logging.enabled",this);//NO I18N
							}	
							return '<span class="'+logClass+'" title="'+logTitle+'"></span>';//No I18N
						}
					} else if(col.index === 'status'){//No I18N
						OverviewColModelListTemp[i].width = 40;
						OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
							var logClass="inactivestatus";//NO I18N
							var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
							if(cellValue!=null && cellValue== 'Yes'){
								logClass="activestatus";//NO I18N
								logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
							}	
							return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
						}
					} else if(col.index === 'action'){//No I18N		
						OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
							var logTitle = "";//NO I18N
							if(cellValue !== null && cellValue != undefined){
								if(cellValue.toLowerCase() === 'permit' || cellValue.toLowerCase() === 'allow' || cellValue.toLowerCase() === 'accept'){
									logTitle = Ember.I18n.t("webclient.fwa.policy.allow",this);//NO I18N
								} else if(cellValue.toLowerCase() === 'deny' || cellValue.toLowerCase() === 'drop'){//No I18N
									logTitle = Ember.I18n.t("deny",this);//NO I18N
								} else {
									logTitle = cellValue;
								}
							}
							return logTitle;
						};
					} else if(col.index === 'lastUpdatedTime'){//No I18N
						OverviewColModelListTemp[i].hidden = true;
					} else if(col.name === 'cb'){//No I18N
						OverviewColModelListTemp[i].index = 'cb';//NO I18N
					} else if(col.formatter){
						OverviewColModelListTemp[i].formatter = overListObjectDetailFormatter;
					}
				}
				var tempColModel = [];
				for(var k=0; k<OverviewColModelListTemp.length; k++) {
					tempColModel[k] = {};
					tempColModel[k].index = OverviewColModelListTemp[k].index;
					tempColModel[k].name = OverviewColModelListTemp[k].name;
					if(OverviewColModelListTemp[k].formatter != undefined && OverviewColModelListTemp[k].formatter != false){
						tempColModel[k].formatter = OverviewColModelListTemp[k].formatter;
					}
					if(OverviewColModelListTemp[k].width != undefined){
						tempColModel[k].width = OverviewColModelListTemp[k].width;
					}
					if(OverviewColModelListTemp[k].hidden != undefined){
						tempColModel[k].hidden = OverviewColModelListTemp[k].hidden;
					}
				}
				var colNamesList = OverviewColNameListTemp;
				var colModelList = tempColModel;
				gridData=widData.data;
			}
			
		}
		
	}else if(reqParams.unsedType==="unusedObjects") {//NO I18N
		if(reqParams.unsedObjectType == "full"){
			var colNamesList = [Ember.I18n.t('webclient.inventory.policyname', this),Ember.I18n.t('webclient.admin.alarmesc.RuleName', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this)]; //No I18N
			var colModelList = [
			                    {name: 'policyname', index: 'policyname', sortable: false}, //No I18N
			                    {name: 'rulename', index: 'rulename', sortable: false}, //No I18N
			                    {name: 'usedsrc', index: 'usedsrc', title:false,sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'unusedsrc', index: 'unusedsrc', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'useddst', index: 'useddst', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }},//No I18N
			                    {name: 'unuseddst', index: 'unuseddst', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }},//No I18N
			                    {name: 'usedservice', index: 'usedservice', title:false,sortable:false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'unusedservice', index: 'unusedservice', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }} //No I18N
			                    ];

			if(reqParams.deviceType == "Paloalto"){
				colNamesList.push(Ember.I18n.t('webclient.fwa.used', this));
				colNamesList.push(Ember.I18n.t('webclient.fwa.policy.unused', this));
				colModelList.push({name: 'usedapp', index: 'usedapp', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {
					var text1=''
						jQuery(cell).find('span a').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}});
				colModelList.push({name: 'unusedapp', index: 'unusedapp', title:false, sortable: false, formatter:unassignedListFormatter,unformat:function(cellvalue, options, cell) {
					var text1=''
						jQuery(cell).find('span a').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}});
			}
			if(reqParams.deviceType != 'Cisco'){
				colModelList[0].hidden=true;
			}
			gridData=widData.data;
		}else{
			colNamesList = [Ember.I18n.t('webclient.inventory.policyname', this),Ember.I18n.t('webclient.admin.alarmesc.RuleName', this),Ember.I18n.t('webclient.fwa.object.type', this),Ember.I18n.t('webclient.fwa.unused.obj.count', this),Ember.I18n.t('webclient.fwa.unused.perc', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this),Ember.I18n.t('webclient.fwa.used', this), Ember.I18n.t('webclient.fwa.policy.unused', this),'Unused Source Count','Unused Destination Count','Unused Services Count','','','','','','']; //No I18N
			colModelList = [
			                    {name: 'policyname', index: 'policyname', sortable: false,formatter:function(cellValue, options, rowdata, action){//No I18N
			                    	return '<div data-val="'+cellValue+'" class="fwaGridDiv" style="padding:0px 7px;text-align:center"><span class="pointer">'+cellValue+'</span></div>';//No I18N
			                    },unformat:function(cellvalue, options, cell){//No I18N
			                    	return $('div', cell).attr('data-val');
			                    }}, //No I18N
			                    {name: 'rulename', index: 'rulename', sortable: false}, //No I18N
			                    {name: 'objType', index: 'objType', sortable: false,formatter:function(cellValue, options, rowdata, action){//No I18N
			                    	var objTxt='<div class="fwaGridDiv" title="'+Ember.I18n.t('NFAWidget.Src', this)+'"><span class="pointer">'+Ember.I18n.t('NFAWidget.Src', this)+'</span></div>';
			                    	objTxt+='<div class="fwaGridDiv" title="'+Ember.I18n.t('NFAWidget.Dst', this)+'"><span class="pointer">'+Ember.I18n.t('NFAWidget.Dst', this)+'</span></div>';
			                    	objTxt+='<div class="fwaGridDiv" title="'+Ember.I18n.t('fwa.rule.service', this)+'"><span class="pointer">'+Ember.I18n.t('fwa.rule.service', this)+'</span></div>';
			                    	if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
			                    		objTxt+='<div class="fwaGridDiv" title="'+Ember.I18n.t('webclient.snapshot.application', this)+'"><span class="pointer">'+Ember.I18n.t('webclient.snapshot.application', this)+'</span></div>';
			                    	}
			                    	return objTxt;
			                    },unformat:function(cellvalue, options, cell){//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('div span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'objCount', index: 'objCount', sortable: false,formatter:function(cellValue, options, rowdata, action){//No I18N
			                    	var objTxt='<div class="fwaGridDiv" title="'+rowdata.unusedSourceCount+'"><span class="pointer">'+rowdata.unusedSourceCount+'</span></div>';
			                    	objTxt+='<div class="fwaGridDiv" title="'+rowdata.unusedDestinationCount+'"><span class="pointer">'+rowdata.unusedDestinationCount+'</span></div>';
			                    	objTxt+='<div class="fwaGridDiv" title="'+rowdata.unusedServiceCount+'"><span class="pointer">'+rowdata.unusedServiceCount+'</span></div>';
			                    	if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
			                    		objTxt+='<div class="fwaGridDiv" title="'+rowdata.unusedApplicationCount+'"><span class="pointer">'+rowdata.unusedApplicationCount+'</span></div>';
			                    	}
			                    	return objTxt;
			                    },unformat:function(cellvalue, options, cell){//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('div span').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'objPercentage', index: 'objPercentage', sortable: false,formatter:getfwaUnusedObjectFormatter,unformat:function(cellvalue, options, cell){//No I18N
			                    	var text1=''
			                    		jQuery(cell).find('.fwaGridDiv .percenTxt').each(function(i,e){
			                    			text1+=jQuery(e).text()+"\n";//No I18N
			                    		});
			                    	return text1;
			                    }}, //No I18N
			                    {name: 'usedsrc', index: 'usedsrc', sortable: false,hidden:true}, //No I18N
			                    {name: 'unusedsrc', index: 'unusedsrc', sortable: false,hidden:true}, //No I18N
			                    {name: 'useddst', index: 'useddst', sortable: false,hidden:true},//No I18N
			                    {name: 'unuseddst', index: 'unuseddst', sortable: false,hidden:true},//No I18N
			                    {name: 'usedservice', index: 'usedservice',sortable:false,hidden:true}, //No I18N
			                    {name: 'unusedservice', index: 'unusedservice', sortable: false,hidden:true}, //No I18N
			                    {name: 'unusedSourceCount', index: 'unusedSourceCount', sortable: false,hidden:true}, //No I18N
			                    {name: 'unusedDestinationCount', index: 'unusedDestinationCount', sortable: false,hidden:true}, //No I18N
			                    {name: 'unusedServiceCount', index: 'unusedServiceCount', sortable: false,hidden:true}, //No I18N
			                    {name: 'usedSourceCount', index: 'usedSourceCount', sortable: false,hidden:true}, //No I18N
			                    {name: 'totalSourceCount', index: 'totalSourceCount', sortable: false,hidden:true}, //No I18N
			                    {name: 'usedDestinationCount', index: 'usedDestinationCount', sortable: false,hidden:true},//No I18N
			                    {name: 'totalDestinationCount', index: 'totalDestinationCount', sortable: false,hidden:true},//No I18N
			                    {name: 'usedServiceCount', index: 'usedServiceCount',sortable:false,hidden:true}, //No I18N
			                    {name: 'totalServiceCount', index: 'totalServiceCount', sortable: false,hidden:true} //No I18N
			                    ];

			if(reqParams.deviceType == "Paloalto"){
				colNamesList.push(Ember.I18n.t('webclient.fwa.used', this));
				colNamesList.push(Ember.I18n.t('webclient.fwa.policy.unused', this));
				colNamesList.push('Unused Application Count');
				colNamesList.push('');
				colNamesList.push('');
				colModelList.push({name: 'usedapp', index: 'usedapp',hidden:true, sortable: false});
				colModelList.push({name: 'unusedapp', index: 'unusedapp',hidden:true, sortable: false});
				colModelList.push({name: 'unusedApplicationCount', index: 'unusedApplicationCount',sortable: false,hidden:true});
				colModelList.push({name: 'usedApplicationCount', index: 'usedApplicationCount',hidden:true, sortable: false});
				colModelList.push({name: 'totalApplicationCount', index: 'totalApplicationCount',hidden:true, sortable: false});
			}
			if(reqParams.deviceType  != 'Cisco'){
				colModelList[0].hidden=true;
			}
			gridData=widData.data;
		}
	}else if(reqParams.unsedType==="unassignedObject") {//NO I18N
		colNamesList= [Ember.I18n.t("webclient.Object.name",this),Ember.I18n.t("webclient.fwa.object.details",this),Ember.I18n.t("webclient.common.appmanager.type.text",this)]; //No I18N
		colModelList = [{ name: 'NAME', index: 'NAME'}, //No I18N
		                     { name: 'TO_DISPLAY', index: 'TO_DISPLAY'}, //No I18N
		                     { name: 'OBJECT_TYPE', index: 'OBJECT_TYPE'} //No I18N
		                     ];
		if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
			 colNamesList.splice(0,0,Ember.I18n.t("webclient.fault.addnotes.device_name",this));//NO I18N
			 colModelList.splice(0,0,{ name: "devname", index: "devname"});//No I18N
		 }
		gridData=widData.UnusedObjectsReport;
	}else if(reqParams.unsedType==="unusedInterfaces") {//NO I18N
		colNamesList= [Ember.I18n.t("webclient.topo.actions.deviceinfo.intfname",this),Ember.I18n.t("webclient.map.view.ipaddress",this), Ember.I18n.t("webclient.common.appmanager.type.text",this),Ember.I18n.t("webclient.fwa.rule.mode",this), Ember.I18n.t("webclient.fwa.services.allowed",this),'Vdom', Ember.I18n.t("webclient.fwa.arp.forward",this)]; //No I18N
		colModelList = [{ name: 'INTERFACE_NAME', index: 'INTERFACE_NAME'}, //No I18N
		                     { name: 'IPADDRESS', index: 'IPADDRESS'}, //No I18N
		                     { name: 'INTERFACE_TYPE', index: 'INTERFACE_TYPE'}, //No I18N
		                     { name: 'MODE', index: 'MODE'}, //No I18N
		                     { name: 'SERVICES_ALLOWED', index: 'SERVICES_ALLOWED'}, //No I18N
		                     { name: 'VDOM_NAME', index: 'VDOM_NAME'}, //No I18N
		                     { name: 'ARP_FORWARD', index: 'ARP_FORWARD'} //No I18N
		                     ];
		if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
			 colNamesList.splice(0,0,Ember.I18n.t("webclient.fault.addnotes.device_name",this));//NO I18N
			 colModelList.splice(0,0,{ name: "devname", index: "devname"});//No I18N
		 }
		gridData=widData.UnusedInterfacesReport;
	}
	
	var response=widData;
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	if(reqParams.unsedType==="unusedObjects") {
		$contentdiv.append("<div class='opm_jqGridUI opmfwaReportsGridview opmfwanopaddingGridview opmReportsGridview nfa groupHeading themeOne nonCiscoUnusedObjDiv'><table id='unusedObjectsList' class='ut ut-Grid'></table></div>");
		fwa_loadPDFJQgridWithData('#unusedObjectsList',gridData,colNamesList,colModelList,"","","",{},false);
	}else{
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
		fwa_loadPDFJQgridWithData('#opm_fwa_table'+snapId,gridData,colNamesList,colModelList,"","","",{},false);
	}
	if(reqParams.unsedType==="unusedObjects") {
		if(reqParams.unsedObjectType == "full"){
			var tempGroupHeaders = [];
			tempGroupHeaders = [
			                    {startColumnName: 'usedsrc', numberOfColumns: 2 , titleText: "<div align='center'>"+Ember.I18n.t("webclient.fault.details.properties.source", this)+"</div>"}, //NO I18N
			                    {startColumnName: 'useddst', numberOfColumns: 2 , titleText: "<div align='center'>"+Ember.I18n.t("webclient.ipsla.rttDashboard.Destination", this)+"</div>"}, //NO I18N
			                    {startColumnName: 'usedservice', numberOfColumns: 2 , titleText: "<div align='center'>"+Ember.I18n.t("webclient.audit.service", this)+"</div>"} //NO I18N
			                    ];
			if(reqParams.deviceType == "Paloalto"){
				tempGroupHeaders.push({startColumnName: 'usedapp', numberOfColumns: 2 , titleText: "<div align='center'>"+Ember.I18n.t("webclient.snapshot.application", this)+"</div>"});
			}
			$("#unusedObjectsList").jqGrid("setGroupHeaders", {//NO I18N
				useColSpanStyle: true,
				groupHeaders: tempGroupHeaders
			});
			$("#gview_unusedObjectsList .jqg-first-row-header").remove();
			
		}
	}
}

function fwa_drawFWARuleMgmtGridWidget(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	fwa_drawFWARuleMgmtGridWidgetSingle(snapId,widData,reqParams,widParams)
}

function fwa_drawFWACompleteDataWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	if(reqParams.expand){
		var response=widData;
		var $contentdiv = $("<div class='content singleInvWidget'></div>");
		widParams.widgetElement.append($contentdiv);
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
		var defaultOptions = {};
		defaultOptions.page=reqParams.page;
		defaultOptions.rows=reqParams.rows;
		var gridData = response.data;
		var sendObj = {};
		defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
		defaultOptions.criteria=response.widgetAdditionalData.criteria;
		defaultOptions.rowNumNeeded=true;
		sendObj.gridId = "opm_fwa_table"+snapId;//No I18N
		sendObj.data = gridData;
		sendObj.defaultOptions = defaultOptions;
		if(reqParams.type != undefined && reqParams.type == 'raw'){
			sendObj.colNames =[''];
			sendObj.colModels = getFWAColModels(sendObj.colNames.length);
		}else{
			sendObj.colNames = response.widgetAdditionalData.colList;
			sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length);
		}
		sendObj.captionTitle = "";
		sendObj.gridNavigator = "";		
		fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,true,reqParams);
	}else{
		fwa_drawFWASingleWidget(snapId,widData,reqParams,widParams)
	}
	
}

function fwa_drawFWAReportListWidget(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	if(reqParams.expand){
		var response=widData;
		var $contentdiv = $("<div class='content singleInvWidget'></div>");
		widParams.widgetElement.append($contentdiv);
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
		var defaultOptions = {};
		defaultOptions.page=reqParams.page;
		defaultOptions.rows=reqParams.rows;
		var gridData = response.data;
		var sendObj = {};
		defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
		defaultOptions.criteria=response.widgetAdditionalData.criteria;
		defaultOptions.rowNumNeeded=true;
		sendObj.gridId = "opm_fwa_table"+snapId;//No I18N
		sendObj.defaultOptions = defaultOptions;
		if(reqParams.type != undefined && reqParams.type == 'raw'){
			sendObj.colNames =[''];
			sendObj.colModels = getFWAColModels(sendObj.colNames.length);
		}else{
			sendObj.colNames = response.widgetAdditionalData.colList;
			sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length);
		}
		 if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.format != undefined){
			 var columnFormat=response.widgetAdditionalData.format;
			 colModelList=sendObj.colModels;
			 for(var k=0;k<colModelList.length;k++){
				 if(columnFormat[k] == "time"){
					 for(var j=0;j<gridData.length;j++){
						 var cellvalue=gridData[j][k];
						 if(cellvalue != undefined && cellvalue.indexOf(",") > -1){
							 var tempTxt=cellvalue.split(",");
							 if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
								 cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
							 }
						 }else if(cellvalue != undefined && cellvalue.indexOf(" ") > -1){
							 var tempTxt=cellvalue.split(" ");
							 if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length ==2 ){
								 cellvalue='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
							 }
						 }
						 gridData[j][k]=cellvalue;
					 }
				 }
			 }
		 }
		sendObj.data = gridData;
		sendObj.captionTitle = "";
		sendObj.gridNavigator = "";		
		fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,true,reqParams);
	}else{
		fwa_drawFWASingleWidget(snapId,widData,reqParams,widParams)
	}
	
}

function loadPieGraphParams(snapId,widData,reqParams,widParams,response){
	var jsonData = response.data;
	var multiData = new Array();
	var addDetails = JSON.parse(JSON.stringify(response.widgetAdditionalData));
	var colDetail=getInvFWAPieColDetails(addDetails);
	var colNames = colDetail.colNameList;
	if(response.data != undefined){
		for (var indexx = 0; indexx < response.data.length; indexx++) {
			var array_element = response.data[indexx];
			var arr = new Array();
			if(response.widgetAdditionalData.keyIndex != undefined && response.widgetAdditionalData.valueIndex != undefined ){
				arr.push(array_element[response.widgetAdditionalData.keyIndex]);
				arr.push(array_element[response.widgetAdditionalData.valueIndex]);
			}else{
				arr.push(array_element[0]);
				arr.push(array_element[1]);
			}
			multiData.push(arr);
		}
	}
	var graphParams = {};
	graphParams.id = 'perfGraph1'+snapId;//No I18N
	graphParams.data = multiData;
	graphParams.graphType = 'pie';//No I18N
	
	if(response.widgetAdditionalData.keyIndex != undefined && response.widgetAdditionalData.valueIndex != undefined ){
		graphParams.colName1=colNames[response.widgetAdditionalData.keyIndex];
		graphParams.colName2=colNames[response.widgetAdditionalData.valueIndex];
	}else{
		graphParams.colName1=colNames[0];
		graphParams.colName2=colNames[1];
	}
	loadFWAPDFGraph(graphParams);
}

function loadTableParams(snapId,widData,reqParams,widParams,response){
	var defaultOptions = {};
	var gridData = response.data;
	var sendObj = {};
	var addDetails = JSON.parse(JSON.stringify(response.widgetAdditionalData));
	var colDetail=getInvFWAPieColDetails(addDetails);
	var colNames = colDetail.colNameList;
	var colModel = colDetail.colModelList;
	sendObj.gridId = 'opm_App_Legend'+snapId;//No I18N
	sendObj.data = response.data;
	sendObj.colModels = colModel;
	sendObj.colNames = colNames;
	sendObj.defaultOptions = defaultOptions;
	if(sendObj.colModels != undefined && sendObj.colModels[0] !=undefined){
		sendObj.colModels[0].formatter =  function(cellvalue, options) {
			return '<div class="nfaDataStatus" style="background:'+fluidicv2[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span style="color:blue;cursor:pointer">'+cellvalue+'</span>';
		}
		colModel[0].unformat =  function(cellvalue, options, cell) {
			return cellvalue;
		}
	}
	fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,false,reqParams);
}

function loadTimeSeriesGraphParams(snapId,widData,reqParams,widParams,response){
	var graphParams = {};
	graphParams.id = 'perfGraph1'+snapId;
	graphParams.graphType = 'area';//No I18N
	if(response.GraphData != undefined && response.GraphData.chartData != undefined)
	{	
		
		graphParams.data = response.GraphData.chartData;
		graphParams.yAxis = response.GraphData.xyTitles[1];

	}else{
		graphParams.data = [];
		graphParams.yAxis = "";
	}
	var timeFormat="today";//No I18N
	if(reqParams != undefined && reqParams.timeFrame != undefined){
		graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(reqParams.timeFrame);
	}else{
		graphParams.timeFormat=OPMClient.InventoryDateTimeLegends.get(timeFormat);
	}
	
	loadFWAPDFGraph(graphParams);
}
function overListObjectDetailFormatter(cellValue, options, rowdata, action){
	var retText='';
    if(cellValue == undefined || cellValue == '' || cellValue == '-'){
    	return retText;
    }
    if(cellValue == 'any'){//NO I18N
    	return cellValue;
    }
    if(Array.isArray(cellValue)){
    	try {
            for(var i=0; i<cellValue.length; i++){
            	var jsonObj = typeof cellValue[i] === 'string' ? JSON.parse(cellValue[i]) : cellValue[i];
            	retText = retText + '<span>' + jsonObj.objName + '</span><br>';
            }
        } catch(e) {
            retText = cellValue.join(', ');
        }
    } else if(typeof cellValue === 'string'){//No I18N
    	try {
    		var parsed = JSON.parse(cellValue);
    		if(Array.isArray(parsed)){
    			for(var i=0; i<parsed.length; i++){
    				retText = retText + '<span>' + parsed[i].objName + '</span><br>';
    			}
    		} else if(parsed.objName != undefined){
    			retText = '<span>' + parsed.objName + '</span>';
    		} else {
    			retText = cellValue;
    		}
    	} catch(e) {
    		retText = cellValue;
    	}
    } else {
    	retText = String(cellValue);
    }
    return retText;
}

function excludeoverListObjectDetailFormatter(cellValue, options, rowdata, action){
	var objDetArr=JSON.parse(cellValue);
	var returnstr='';
	for(var i=0;i<objDetArr.length;i++){
		var objDet=objDetArr[i]
		returnstr=returnstr+'<span>'+objDet.objName+'</span><br>';
	}
	return returnstr;
}

function fwa_drawFWABackupConfiCompWidget(snapId,widData,reqParams,widParams,repTitle) {
	var viewlistType=[];
	if(reqParams.viewlistType != undefined){
		viewlistType=reqParams.viewlistType;
	}
	var $contentdiv = $("<div class='content configDiff'></div>");
	widParams.widgetElement.append($contentdiv);
	var addedClass="diffdetails addedlines";//No I18N
	var modiClass="diffdetails modifiedlines";//No I18N
	var delClass="diffdetails deletedlines";//No I18N
	var tableRowClassList=[];
	if(viewlistType.indexOf("add") > -1){
		tableRowClassList.push("staticTable__row diffNewLine");
	}else{
		addedClass="diffdetails addedlines hideDiv";//No I18N
	}
	if(viewlistType.indexOf("modify") > -1){	
		tableRowClassList.push("staticTable__row diffModifiedLine");
	}else{
		modiClass="diffdetails modifiedlines hideDiv";//No I18N
	}
	if(viewlistType.indexOf("delete") > -1){
		tableRowClassList.push("staticTable__row diffDeletedLine");
	}else{
		delClass="diffdetails deletedlines hideDiv";//No I18N
	}
	$contentdiv.append('<div style="float:right;height:25px;border-bottom:1px solid lightgrey;margin-top:5px" class="diffdetailsWidget"><div id="Added_Div" class="'+addedClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesadded",this)+' - <i id="added">'+widData.addedCount+'</i></div><div id="Modified_Div" class="'+modiClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesModified",this)+' - <i id="modified">'+widData.modifiedCount+'</i></div><div id="Deleted_Div" class="'+delClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesdeleted",this)+' - <i id="deleted">'+widData.deltedCount+'</i></div>');				
	if(reqParams.pdfReqFrom != "FWAConfigComparison"){
		$contentdiv.append('<div class="fileHeading"><div class="fileName1">'+reqParams.filename1+'</div><div class="fileName2">'+reqParams.filename2+'</div></div>');
	}
	$tableData=$('<div class="DI-Diff" style="padding-left:20px"></div>');
	$tableContent=$('<div class="DI-DiffList fwaDiffContent staticTable overflowHideCols staticTable--col6" style="margin-top:5px"></div>')
	$tableData.append($tableContent);
	$contentdiv.append($tableData);
	var jsonData=widData;
	if(reqParams.diffOnly == "true" || reqParams.diffOnly == true || reqParams.diffAlone == "true" || reqParams.diffAlone == true){
		if(jsonData.diffLeft != undefined){
			for (var intex = 0; intex < jsonData.diffLeft.length; intex++) {
				var array_element11 = jsonData.diffLeft[intex];
				var array_element12 = jsonData.diffRight[intex];
				var rowClass = "diffNormalLine";  //No I18N
				if(array_element11.styleClass == "diffModifiedLine" || array_element12.styleClass == "diffModifiedLine") {
					rowClass = "staticTable__row diffModifiedLine";  //No I18N
				}
				if(array_element11.styleClass == "diffDeletedLine" || array_element12.styleClass == "diffDeletedLine") {
					rowClass = "staticTable__row diffDeletedLine";  //No I18N
				}
				if(array_element11.styleClass == "diffNewLine" || array_element12.styleClass == "diffNewLine") {
					rowClass = "staticTable__row diffNewLine";  //No I18N
				}
				$tableContent.append($("<div class='DI-DiffRow "+rowClass+"' data-lineno='"+array_element11.rowCount//No I18N
						+"'><div><div id='diffOnlyLeft"+intex+"'></div><div id='diffOnlyRight"+intex+"'></div></div></div>"));
				$("#diffOnlyLeft"+intex).text(array_element11.rowData);
				$("#diffOnlyRight"+intex).text(array_element12.rowData);
			}
		}
	}else{
		if(jsonData.allLeft != undefined){
			for (var intex = 0; intex < jsonData.allLeft.length; intex++) {
				var array_element11 = jsonData.allLeft[intex];
				var array_element12 = jsonData.allRight[intex];
				var rowClass = "diffNormalLine";  //No I18N
				if(array_element11.styleClass == "diffModifiedLine" || array_element12.styleClass == "diffModifiedLine") {
					rowClass = "staticTable__row diffModifiedLine";  //No I18N
				}
				if(array_element11.styleClass == "diffDeletedLine" || array_element12.styleClass == "diffDeletedLine") {
					rowClass = "staticTable__row diffDeletedLine";  //No I18N
				}
				if(array_element11.styleClass == "diffNewLine" || array_element12.styleClass == "diffNewLine") {
					rowClass = "staticTable__row diffNewLine";  //No I18N
				}
				$tableContent.append($("<div class='DI-DiffRow "+rowClass+"' data-lineno='"+array_element11.rowCount//No I18N
						+"'><div><div  id='allLinesLeft"+intex+"'></div><div id='allLinesRight"+intex+"'></div></div></div>"));
				$("#allLinesLeft"+intex).text(array_element11.rowData);
				$("#allLinesRight"+intex).text(array_element12.rowData);
			}
		}
		
	}
	
	
	if(viewlistType.indexOf("add") <= -1){
		$(".diffNewLine").hide();
	}
	if(viewlistType.indexOf("modify") <= -1){	
		$(".diffModifiedLine").hide();
	}
	if(viewlistType.indexOf("delete") <= -1){
		$(".diffDeletedLine").hide();
	}

}

function fwa_drawFWARuleComparisonWidget(snapId,widData,reqParams,widParams,repTitle) {
	var viewlistType=[];
	if(reqParams.viewlistType != undefined){
		viewlistType=reqParams.viewlistType;
	}
	var $contentdiv = $("<div class='content configDiff'></div>");
	widParams.widgetElement.append($contentdiv);
	var addedClass="diffdetails addedlines";//No I18N
	var modiClass="diffdetails modifiedlines";//No I18N
	var delClass="diffdetails deletedlines";//No I18N
	var tableRowClassList=[];
	if(viewlistType.indexOf("add") > -1){
		tableRowClassList.push("staticTable__row diffNewLine");
	}else{
		addedClass="diffdetails addedlines hideDiv";//No I18N
	}
	if(viewlistType.indexOf("modify") > -1){	
		tableRowClassList.push("staticTable__row diffModifiedLine");
	}else{
		modiClass="diffdetails modifiedlines hideDiv";//No I18N
	}
	if(viewlistType.indexOf("delete") > -1){
		tableRowClassList.push("staticTable__row diffDeletedLine");
	}else{
		delClass="diffdetails deletedlines hideDiv";//No I18N
	}
	$contentdiv.append('<div style="float:right;height:30px;border-bottom:1px solid lightgrey;padding-top:3px" class="diffdetailsWidget"><div id="Added_Div" class="'+addedClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesadded",this)+' - <i id="added">'+widData.addcount+'</i></div><div id="Modified_Div" class="'+modiClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesModified",this)+' - <i id="modified">'+widData.modicount+'</i></div><div id="Deleted_Div" class="'+delClass+'" style="font: 12px LatoRegular !important;">'+Ember.I18n.t("webclient.linesdeleted",this)+' - <i id="deleted">'+widData.deletecount+'</i></div>');				
	$contentdiv.append('<div class="fileHeading"><div class="fileName1">'+reqParams.filename1+'</div><div class="fileName2">'+reqParams.filename2+'</div></div>');
	$tableData=$('<div class="tableData" id="fwaDiffTableData"></div>');
	$tableContent=$('<div class="fwaDiffContent staticTable overflowHideCols staticTable--col4"></div>')
	$tableData.append($tableContent);
	$contentdiv.append($tableData);
	$tableContent.append('<div class="staticTable__row "><div class="line_col" ></div><div class="staticTable__col">'+Ember.I18n.t("webclient.inventory.policyname",this)+'</div><div class="staticTable__col" style="border-right:1px solid #e2e2e2">'+Ember.I18n.t("jsp.commonstr.RuleName",this)+'</div><div class="staticTable__col">'+Ember.I18n.t("webclient.inventory.policyname",this)+'</div><div class="staticTable__col">'+Ember.I18n.t("jsp.commonstr.RuleName",this)+'</div></div>');
	for(var i=0;i<widData.diffContent.length;i++){
		var diffRow=widData.diffContent[i];
		if(diffRow.rowClass != "staticTable__row diffNormalLine"){
			if(!(tableRowClassList.indexOf(diffRow.rowClass) > -1)){
				diffRow.rowClass=diffRow.rowClass+" hideDiv";//No I18N
			}
		}
		$tableContent.append('<div class="'+diffRow.rowClass+'"><div class="line_col" >'+diffRow.lineno+'</div> <div class="staticTable__col"><div class="grid-row no-gutters"><div class="">'+diffRow.policyName1+'</div></div></div><div class="staticTable__col" style="border-right:1px solid #e2e2e2">'+diffRow.ruleName1+'</div><div class="staticTable__col">'+diffRow.policyName2+'</div><div class="staticTable__col">'+diffRow.ruleName2+'</div></div>');
	}
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.comp.comp.details",this)+'</div>');
	var widElem=$('<div id="widgetElement_100" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widElem.append($contentdiv);	
	
	for(var i=0;i<widData.diffContent.length;i++){
		var diffRow=widData.diffContent[i];
		if(diffRow.rowClass != 'staticTable__row diffNormalLine' && (tableRowClassList.indexOf(diffRow.rowClass) > -1)){
			var ruleName=diffRow.ruleName1;
			var ruleName2=diffRow.ruleName2;
			var modType=diffRow.rowClass;
			var embText=(modType == "staticTable__row diffModifiedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.modified',{ param0: ruleName} ,this) : (modType == "staticTable__row diffNewLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.added',{ param0: ruleName2} ,this):(modType == "staticTable__row diffDeletedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.deleted',{ param0: ruleName} ,this):ruleName)));//No I18N
			$subContentData=$('<div style="page-break-inside:avoid !important;"></div>');
			$contentdiv.append($subContentData);
			$subContentData.append("<div style='color:blue;padding:20px'>"+embText+"</div>");
			$tableData=$('<table style="width:100%;padding-left:20px;padding-right:20px;" class="fwaRuleAdminCommandTable" cellSpacing=0></table>');
			$subContentData.append($tableData);
			var lineDiff=diffRow.lineDiff;
			
			if(modType == "staticTable__row diffModifiedLine"){
				var tableHeader='<tr style="width:100%;background:#f4f5f6"><td style="width:20%">'+Ember.I18n.t("webclient.fwa.rule.comp.rule.column",this)+'</td><td style="width:40%">'+reqParams.filename1+'</td><td style="width:40%">'+reqParams.filename2+'</td></table>';
				$tableData.append(tableHeader);
			}else if(modType == "staticTable__row diffNewLine"){//NO I18N
				var tableHeader='<tr style="width:100%;background:#f4f5f6"><td style="width:20%">'+Ember.I18n.t("webclient.fwa.rule.comp.rule.column",this)+'</td><td style="width:40%">'+reqParams.filename1+'</td><td style="width:40%" class="fwaDiffAddedCell">'+reqParams.filename2+'</td></table>';
				$tableData.append(tableHeader);
			}else{
				var tableHeader='<tr style="width:100%;background:#f4f5f6"><td style="width:20%">'+Ember.I18n.t("webclient.fwa.rule.comp.rule.column",this)+'</td><td style="width:40%" class="fwaDiffDeletedCell">'+reqParams.filename1+'</td><td style="width:40%">'+reqParams.filename2+'</td></table>';
				$tableData.append(tableHeader);
			}
			
			
			for(var j=0;j<lineDiff.length;j++){
				var lineTxt="";
				var rowClass=(modType == "staticTable__row diffModifiedLine" && lineDiff[j].type == "modified") ? 'fwaDiffModifiedRow' : '';
				var SecondCellClass=(modType == "staticTable__row diffNewLine") ? 'fwaDiffAddedCell' : '';//NO I18N
				var firstCellClass=(modType == "staticTable__row diffDeletedLine") ? 'fwaDiffDeletedCell' : '';//No I18N
				lineTxt='<tr class="'+rowClass+'"><td>'+lineDiff[j].param+'</td>';
				if(lineDiff[j].val1[0] != undefined){
					if(lineDiff[j].val1[0].drillNeed){
						lineTxt=lineTxt+'<td class="'+firstCellClass+'">'+lineDiff[j].val1[0].val+'</td>';
					}else{
						lineTxt=lineTxt+'<td class="'+firstCellClass+'">'+lineDiff[j].val1[0].dispText+'</td>';
					}
				}else{
					lineTxt=lineTxt+'<td class="'+firstCellClass+'"></td>';
				}
				if(lineDiff[j].val2[0] != undefined){
					if(lineDiff[j].val2[0].drillNeed){
						lineTxt=lineTxt+'<td class="'+SecondCellClass+'">'+lineDiff[j].val2[0].val+'</td>';
					}else{
						lineTxt=lineTxt+'<td class="'+SecondCellClass+'">'+lineDiff[j].val2[0].dispText+'</td>';
					}
				}else{
					lineTxt=lineTxt+'<td class="'+SecondCellClass+'"></td>';
				}
				$tableData.append(lineTxt);
			}
		}
	}
}



function fwa_drawFWARuleOptimizationWidget(snapId,widData,reqParams,widParams,repTitle) {
	if(reqParams.anomalyType != undefined && reqParams.anomalyType == "all"){
		loadPolicyOptimizationStatsGraph(snapId,widData,widParams);
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		snapId=2;
		$contDiv.append('<div class="fwaHeading_pdf">Summary of Firewall Policy Anomalies</div>');
		var widElem=$('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
	}
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_'+snapId).append($contentdiv);		
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	var colNameList=[Ember.I18n.t("webclient.inventory.policyname",this),'Anamoly Type',Ember.I18n.t("jsp.admin.sharedprofile.SharedProfileAdd.Desc",this)];//NO I18N
	var colModelList = new Array();
	
	colModelList.push({ name: "PolicyName", index: "PolicyName"});//NO I18N
	if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
		colNameList=[Ember.I18n.t("webclient.inventory.policyname",this),Ember.I18n.t("webclient.fault.addnotes.device_name",this),'Anamoly Type',Ember.I18n.t("jsp.admin.sharedprofile.SharedProfileAdd.Desc",this)];//NO I18N
		
		colModelList.push({ name: "DeviceName", index: "DeviceName"});//NO I18N
	}
	colModelList.push({ name: "AnomalyType", index: "AnomalyType"});//NO I18N
	colModelList.push({ name: "Description", index: "Description"});//NO I18N
	
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId, widData.gridData, colNameList, colModelList, "", "", "","",false); //No I18N
	
	
	var anamolyDetail=JSON.parse(widData.anamolyStr);
	var deviceType=reqParams.deviceType;
	var compcolNameList=[];
	var compcolModelList=[];
	if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("webclient.fwa.source.zone", this),Ember.I18n.t("webclient.fwa.destination.zone", this),Ember.I18n.t("NFAWidget.App", this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'SrcInt', index: 'SrcInt',classes:"nolink"}, //No I18N
		                    { name: 'DstInt', index: 'DstInt',classes:"nolink"}, //No I18N
		                    { name: 'Application', index: 'Application',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N	
		                    ];
	}else if(deviceType == "Paloalto" || deviceType == "FortiGate"){//NO I18N
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("webclient.fwa.source.zone", this),Ember.I18n.t("webclient.fwa.destination.zone", this),Ember.I18n.t("NFAWidget.App", this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'SrcInt', index: 'SrcInt',classes:"nolink"}, //No I18N
		                    { name: 'DstInt', index: 'DstInt',classes:"nolink"}, //No I18N
		                    { name: 'Application', index: 'Application',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N	
		                    ];
	}else if(deviceType=='SRX Log Format' || deviceType=='HUAWEI' || deviceType=='Netscreen Native' || deviceType=='SonicWall'){//NO I18N
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("webclient.fwa.source.zone", this),Ember.I18n.t("webclient.fwa.destination.zone", this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'SrcInt', index: 'SrcInt',classes:"nolink"}, //No I18N
		                    { name: 'DstInt', index: 'DstInt',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N	
		                    ];
	}else if(deviceType=='Check Point' || deviceType=='Barracuda' || deviceType=='F5 Firewall' || deviceType=='Cisco Meraki' || deviceType=='Netfilter'){//NO I18N
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N
		                    ];
	}else if(deviceType == "Firepower"){//NO I18N
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("webclient.WAN.SourceInterface", this),Ember.I18n.t("fwa.webclient.destination.interface", this),Ember.I18n.t("NFAWidget.App", this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'SrcInt', index: 'SrcInt',classes:"nolink"}, //No I18N
		                    { name: 'DstInt', index: 'DstInt',classes:"nolink"}, //No I18N
		                    { name: 'Application', index: 'Application',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N	
		                    ];
	}else{
		compcolNameList=[Ember.I18n.t("webclient.admin.alarmesc.ruleTitle", this),Ember.I18n.t("webclient.admin.eventlog.configrule.source", this),Ember.I18n.t("NFAWidget.Dst", this),Ember.I18n.t("webclient.WAN.SourceInterface",this),Ember.I18n.t("fwa.webclient.destination.interface",this),Ember.I18n.t("fwa.rule.service", this),Ember.I18n.t("webclient.admin.traps.action", this)];//No I18N
		compcolModelList= [{ name: 'Rule', index: 'Rule',classes:"nolink"}, //No I18N
		                    { name: 'Source', index: 'Source',classes:"nolink"}, //No I18N
		                    { name: 'Destination', index: 'Destination',classes:"nolink"}, //No I18N
		                    { name: 'SrcInt', index: 'SrcInt',classes:"nolink"}, //No I18N
		                    { name: 'DstInt', index: 'DstInt',classes:"nolink"}, //No I18N
		                    { name: 'Service', index: 'Service',classes:"nolink"}, //No I18N
		                    {name : 'Action', index: 'Action',classes:"nolink"}//No I18N	
		                    ];
	}
	var $contentdiv = $("<div class='content graphWidget' style='border:none'></div>");
	$('#widgetElement_'+snapId).append($contentdiv);	
	for(var ij=0;ij<widData.gridData.length;ij++){
		var singleana=widData.gridData[ij];
		var polname=singleana.PolicyName;
		var desc=singleana.Description;
		var DrillDownID=singleana.DrillDownID;
		var policyList=anamolyDetail.results[polname];
		if(policyList != undefined && policyList[DrillDownID] != undefined){
			$contentdiv.append("<div style='color:blue;padding-top:10px'>"+desc+"</div>");
			$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:10px;padding-bottom:10px'><table id='policy_opt_det_"+ij+"' class='ut ut-Grid'></table></div>");
			fwa_loadPDFJQgridWithData('#policy_opt_det_'+ij, policyList[DrillDownID].data, compcolNameList, compcolModelList, "", "", "","",false); //No I18N
		}
	}
	$('.mainContent').append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');//NO I18N
    
}

function fwa_updateWidgetData(res, wide,reqParams)
{
	var supportedDevMsgCard = Ember.I18n.t('fwa.compliance.DevNotSupported',this);//NO I18N
	supportedDevMsgCard=supportedDevMsgCard.replace('@textToReplace@',res.policyParsingSupportedDevices);
	
	var wDetails = '<div><a href="javascript:void(0)"  class="comRep tblWidgetlink"><div class="opmFormRow" style="padding:10px;border:1px solid #DDD;border-radius:10px;height:135px;"><div class="opmFormCol" style="width:58%;float:left"><div class="opmFormRow" style="min-height:150px"><div class="opmFormCol" style="width:25%;float:left"><div class="graphDiv" style="width:80px;height:80px;padding:10px"></div></div><div class="opmFormCol" style="width:75%;margin:0px;float:left;"><table class="clearBoth" border="0" width="100%" cellspacing="0" cellpadding="0"><tr><td width="5%" class="compliantNo" style="font-size:35px"  valign="bottom">&nbsp;</td><td class="greyTxt2 paddingLeft7" valign="bottom">'+Ember.I18n.t('fwa.compliance.Compliant',this)+'</td></tr></table><div class="greyTxt2 recommedTitle">'+Ember.I18n.t('fwa.compliance.Comp_Recommendation',this)+':</div><div class="greyTxt2 recommed"></div></div></div></div><div class="opmFormCol;" style="width:38%;float:right;"><table  class="floatRight" style="height:100%;width:100%" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" class="padding5"><div class="failedTitle paddingBottom10" style="color:red;font-size:16px">'+Ember.I18n.t('fwa.compliance.Failed_Count',this)+'<span class="failedCount"></span></div><ul class="faildRule clearBoth" style="height:130px"></ul></td></tr></table></div></div></a></div>';	//NO I18N

	var wStatDetails = '<div><a href="javascript:void(0)"  class="comRep tblWidgetlink"><div class="opmFormRow" style="padding:10px;border:1px solid #DDD;border-radius:10px"><div class="opmFormCol" style="width:58%;height:200px;"><div class="opmFormRow" style="font-size:16px"><div class="opmFormCol" style="width:100%"><div class="failedTitle paddingBottom10">'+Ember.I18n.t('fwa.compliance.Stat',this)+'<br/> <span class="statTotal">'+Ember.I18n.t('fwa.compliance.Total_sections',this)+' : <span class="statTCount">10</span></span></div></div></div><div class="opmFormRow" style="min-height:100px;padding:10px"><div class="opmFormCol" style="width:100%;float:left"><table width="95%" border="0" cellspacing="0" cellpadding="0" align="center" class="statisticTbl"></table></div></div></div><div class="opmFormCol;" style="width:38%;float:right;height:200px;"><table  class="floatRight" style="height:100%;width:100%" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" class="padding5"><div class="failedTitle paddingBottom10" style="color:red;font-size:16px">'+Ember.I18n.t('fwa.compliance.Failed_Count',this)+'<span class="failedCount"></span></div><ul class="faildRule clearBoth" style="height:130px"></ul></td></tr></table></div></div></a></div>';	//NO I18N

	var customW = '<div id="customList" style="width:160px;" class="dropDownRadius1 padding5"><ul class="listMenu1"></ul><div><span style="width:25px;" onclick="editWidgets();" class="tryBtn wGoBut floatRight">'+Ember.I18n.t('fwa.compliance.Go',this)+'</span></div></div>';	//NO I18N

	var emptyWidget = '<div class="emptyWid grayTableBorder"><div class="complianceWelDiv"><div class="compWelImg"><img src="/apiclient/fluidicv2/img/complianceImg.jpg" /></div><div class="compWelTitle"><h2>'+Ember.I18n.t('fwa.compliance.Compliance',this)+'</h2><p>'+Ember.I18n.t('fwa.compliance.compTitle',this)+'</p></div></div><div class="compWelCont"><div class="compWelContInner"><div class="compWelAct"><a href="javascript:void(0);" class="addWidBtn addWidBtn1">'+Ember.I18n.t('fwa.compliance.compAddWidget',this)+'</a><p>'+Ember.I18n.t('fwa.compliance.MakeRulesCompl',this)+'</p></div><div class="welcontDesc"><ol><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc1',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc2',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc3',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc4',this)+'</li></ol></div></div></div></div>'; 	//NO I18N

	var deviceNotSupport = '<div class="deviceNotSupport"><div class="complianceWelDiv"><div class="compWelImg"><img src="/apiclient/fluidicv2/img/complianceImg.jpg" /></div><div class="compWelTitle"><h2>'+Ember.I18n.t('fwa.compliance.Compliance',this)+'</h2><p>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc1',this)+'</p></div></div><div class="compWelCont"><div class="compWelContInner"><div class="compWelAct"><p>'+supportedDevMsgCard+'</p></div><div class="welcontDesc"><ol><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc1',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc2',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc3',this)+'</li><li>'+Ember.I18n.t('fwa.compliance.EmptyDivDesc4',this)+'</li></ol></div></div></div></div>'; 	//NO I18

	var compError = '<div class="complianceError"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td height="15"></td></tr><tr><td align="center" height="28"><div class="" style="padding: 20px 0;"><span class="msgtxt complianceTabNotReadOnly"><img src="/apiclient/fluidicv2/img/status1.png" align="absmiddle" alt="errormsg" /> Device Rule is not Configured for the Firewall. <a href="javascript:goToDevRulePage()">click here</a> to configure.</span><span class="msgtxt complianceTabReadOnly"><img src="/apiclient/fluidicv2/img/status1.png" width="16" height="14" alt="errormsg" />Device Rule is not Configured for the Firewall.</span><div style="display: table; margin: 30px 0 10px;"><a href="javascript:void(0);" class="addWidBtn addConfig">Add Configuration</a></div></div></td></tr><tr><td height="15"></td></tr></table><br><br> <table width="80%" align="center" border="0" cellspacing="0" cellpadding="0" class="configboxerror"><tr><td align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="6%" align="right" height="50"><img src="/apiclient/fluidicv2/img/FWA.gif" width="41" height="32" alt="fwa" /></td><td width="94%"><h1 class="title">Firewall Analyzer - Compliance Reports</h1></td></tr></table></td></tr><tr><td align="center" style="padding-left:10px;padding-right:10px;" height="28"><div class="statusmsg" style="text-align:left; padding-bottom:10px;"><h4 class="title1">Security Audit and Risk Mitigation</h4><p class="content">Periodical audit of Firewall security is essential to keep the network secured from the external attack. It helps to fill the holes in the device configuration, so that the attackers don&rsquo;t exploit it.  Achieve this with Security Audit and Configuration Analysis report.</p><h4 class="title1">Change Monitoring and Alerting</h4><p class="content">Any untoward change in the Firewall configuration will undermine the network security. So you need to get real-time alerts for who is making the change, when it is made, what was the reason. Instant notification ensures that you can initiate remedial action swiftly. Accomplish this with Change Management reports and alerts.</p><h4 class="title1">Smart Rules Monitoring - Used and Unused</h4><p class="content">The critical components of the Firewall to secure the network are the rules/ACLs. The efficiency to allow or block traffic through the Firewall depends on it. Unused rules should tuned to make it perform and over used rules to be watched out for compromises. Analyze the rules with Used Rules report and Unused Rules report.</p></div></td></tr><tr><td height="15"></td></tr></table></div>'

	if(res.netWorkDetails!==undefined && res[wide]!==undefined )
	{
		jQuery('div[wid="'+wide+'"]').find('.widgetDate').html(res[wide].lastGenerated);	//NO I18N
		var displayGraph = res.displayGraph;
		if(displayGraph){
			jQuery('div[wid="'+wide+'"]').find('.widgetData').html(wDetails);	//NO I18N
			jQuery('div[wid="'+wide+'"]').find('.failedCount').html(res[wide].failedCount);	//NO I18N
			jQuery('div[wid="'+wide+'"]').find('.recommed').html(res[wide].recommendation);	//NO I18N
			jQuery('div[wid="'+wide+'"]').find('.compliantNo').html(Math.round(parseInt(res[wide].pieData.data))+'%');	//NO I18N
		}
		else{
			
			jQuery('div[wid="'+wide+'"]').find('.widgetData').html(wStatDetails);	//NO I18N	
			jQuery('div[wid="'+wide+'"]').find('.widgetData .statTCount').text(res[wide].totalCount)//No I18N
			var statistic = '<tbody style="font-size:16px"><tr align="center"><td class="passedRule" style="color:#009A57;border-right:1px solid #EEE;">Passed</td><td class="failedRule" style="color: #DA4531; border-right: 1px solid #EEE;">Failed</td><td class="usercallRule" style="color: #FFA200; border-right: 1px solid #EEE;">Usercall</td></tr><tr align="center"><td class="passedRuleCount" style=" border-right: 1px solid #EEE;">'+res[wide].passCount+'</td><td class="failedRuleCount" style=" border-right: 1px solid #EEE;">'+res[wide].failedCount+'</td><td class="usercallRuleCount" style=" border-right: 1px solid #EEE;">'+res[wide].userCallCount+'</td></tr></tbody>';//No I18N		
			jQuery('div[wid="'+wide+'"]').find('.widgetData .statisticTbl').html(statistic);//No I18N
			
			jQuery('.gridster_ul div[wid="'+wide+'"]').find('.statLink').attr('wide',wide)//No I18N
			jQuery('.statLink').off('click').on('click', function(e){//No I18N
				 if(jQuery(e.target).closest('.passedRule').length || jQuery(e.target).closest('.passedRuleCount').length)
				 {
						if((window.OPM.isFWA && window.OPM.oldView)){
							var xurl = window.apiclientUrl+"FWACompliance/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
						}else{
							var xurl = window.apiclientUrl+"Reports/Reports.FWAReports/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
						}
				 	
				 	jQuery(this).attr('href',xurl);//No I18N
				 
					 //jQuery(this).attr('href','complianceWidget.do?eeFwd=true&action=lastGen&rID='+rID+'&reportID='+reportID+'&reportName='+jQuery(this).attr('wide')+'&deviceType='+deviceType+'&displayName='+encodeURIComponent(device)+'&resourceName='+encodeURIComponent(resourceName)+'&filter=Pass'+fromAdminServer)//No I18N
				 }else if(jQuery(e.target).closest('.failedRule').length || jQuery(e.target).closest('.failedRuleCount').length){//No I18N
					 	if((window.OPM.isFWA && window.OPM.oldView)){
					 		var xurl = window.apiclientUrl+"FWACompliance/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
						}else{
							 var xurl = window.apiclientUrl+"Reports/Reports.FWAReports/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
						}
					
				 	jQuery(this).attr('href',xurl);//No I18N
					//jQuery(this).attr('href','complianceWidget.do?eeFwd=true&action=lastGen&rID='+rID+'&reportID='+reportID+'&reportName='+jQuery(this).attr('wide')+'&deviceType='+deviceType+'&displayName='+encodeURIComponent(device)+'&resourceName='+encodeURIComponent(resourceName)+'&filter=Fail'+fromAdminServer)//No I18N
				 }else {
					 if((window.OPM.isFWA && window.OPM.oldView)){
						 var xurl = window.apiclientUrl+"FWACompliance/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
					 }else{
						 var xurl = window.apiclientUrl+"Reports/Reports.FWAReports/Device/"+rID+"/Info/"+encodeURIComponent(jQuery(this).attr('wide'))+"/none"; //No I18N
					 }
					
				 	jQuery(this).attr('href',xurl);//No I18N
					//jQuery(this).attr('href','complianceWidget.do?eeFwd=true&action=lastGen&rID='+rID+'&reportID='+reportID+'&reportName='+jQuery(this).attr('wide')+'&deviceType='+deviceType+'&displayName='+encodeURIComponent(device)+'&resourceName='+encodeURIComponent(resourceName)+fromAdminServer)//No I18N
				 }
			 })
			
			if(parseInt(res[wide].pieData.data) === 100){
				
//				var cong = '<a target="_blank" href="complianceWidget.do?eeFwd=true&action=lastGen&rID='+rID+'&reportID='+reportID+'&reportName='+wide+'&deviceType='+deviceType+'&displayName='+encodeURIComponent(device)+'&resourceName='+encodeURIComponent(resourceName)+fromAdminServer+'" style="font-size: 16px;"><div class="congrats marginTop15">'+Ember.I18n.t('Congratulations+'</div><div class="congrats"><span class="devicen">'+res.selectedDevice+'</span>  is 100 % </div><div class="congrats"><span class="compName">'+wide+'</span> ' +Ember.I18n.t('Compliant+'</div></a>';	//NO I18N	
				if((window.OPM.isFWA && window.OPM.oldView)){
					var cong = '<a  href="'+window.apiclientUrl+"FWACompliance/Device/"+rID+"/Info/"+encodeURIComponent(wide)+"/none"+'" style="font-size: 16px;"><div class="congrats marginTop15">'+Ember.I18n.t('fwa.compliance.Congratulations',this)+'</div><div class="congrats"><span class="devicen">'+res.selectedDevice+'</span>  is 100 % </div><div class="congrats"><span class="compName">'+wide+'</span> ' +Ember.I18n.t('fwa.compliance.Compliant',this)+'</div></a>';	//NO I18N
				}else{
					var cong = '<a  href="'+window.apiclientUrl+"Reports/Reports.FWAReports/Device/"+rID+"/Info/"+encodeURIComponent(wide)+"/none"+'" style="font-size: 16px;"><div class="congrats marginTop15">'+Ember.I18n.t('fwa.compliance.Congratulations',this)+'</div><div class="congrats"><span class="devicen">'+res.selectedDevice+'</span>  is 100 % </div><div class="congrats"><span class="compName">'+wide+'</span> ' +Ember.I18n.t('fwa.compliance.Compliant',this)+'</div></a>';	//NO I18N
				}
					

				jQuery('.gridster_ul div[wid="'+wide+'"]').find('table.floatRight .failedTitle').html(cong)	//NO I18N
				jQuery('.gridster_ul div[wid="'+wide+'"]').find('table.floatRight').addClass('guaranteed')	//NO I18N
				jQuery('.gridster_ul div[wid="'+wide+'"]').find('.floatRight .faildRule').remove();	//NO I18N
				jQuery('.gridster_ul div[wid="'+wide+'"]').find('.floatRight .compMore').remove();	//NO I18N
				
				if(!displayGraph){
					jQuery('div[wid="'+wide+'"]').find('table.floatRight .failedTitle').css({'margin-bottom': '10px'});//No I18N
				}
				
			}else{
				jQuery('.gridster_ul div[wid="'+wide+'"]').find('.failedTitle').addClass('failedTitle1') 	//NO I18N
			}
			 
			jQuery('div[wid="'+wide+'"]').find('.widgetData').css('height', 200);	//NO I18N
		}
		
		
		jQuery('.gridster_ul div[wid="'+wide+'"]').find('.pdfIcons').removeClass('dispNoneImp')//No I18N 
		var lie = '';	//NO I18N
		 
		if(res[wide].failedSectionDisplayOrder.length)
		{
			jQuery(res[wide].failedSectionDisplayOrder).each(function(index, element)
			{
				var xurl = "#";
				
				var ids = element.replace(/\./g,'');
					//lie +='<li><a target="_blank" href="complianceWidget.do?eeFwd=true&action=lastGen&ddid='+ddid+'&rID='+rID+'&reportID='+reportID+'&reportName='+wide+'&deviceType='+deviceType+'&displayName='+encodeURIComponent(res.selectedDevice)+'&resourceName='+encodeURIComponent(resourceName)+'&id='+ids+colID+fromAdminServer+'">'+ element+' <span class="ruleFailDesc">'+res[wide].failedRules[element]+'</span></a></li>';	//NO I18N
           		lie +='<li><a  href="'+xurl+'">'+ element+' <span class="ruleFailDesc" style="color:#666">'+res[wide].failedRules[element]+'</span></a></li>';	//NO I18N
           
            });
			jQuery('div[wid="'+wide+'"]').find('.faildRule').html(lie);	//NO I18N
		}
		
		if(displayGraph){
			placePieGraph(res, wide);
		}
	}
	OPMClient.FWAComplianceDetailsController={"complianceReportName":reqParams.reportName,"devid":reqParams.rID};//NO I18N
	fwa_complianceReportList(res.completeDetail.resultJSONObject);
	load_fwaCompleteStandardList(res);
	if(res.compObjectDetail != undefined){
		load_fwaStandardObjectDetails(res.compObjectDetail);
	}
}

function load_fwaStandardObjectDetails(jsonData){
	$('#subDivCompRep').append("<div class='' style='padding: 20px;border-top: 1px solid #d6d6d6;color: red;'><span class='headerTitleSpans'>Firewall Object Details</span></div>");
	jQuery('#subDivCompRep').append("<div class='opm_jqGridUI' style='padding-top:0px !important'><table id='compObjectDetails' class='ut ut-Grid'></table></div>");
	var gridTable="#compObjectDetails";//NO I18N
	$(gridTable).width('100%');
	$(gridTable).prop("cellSpacing","0");
	var tableElement=document.getElementById(gridTable.replace("#",""));
	var header = tableElement.createTHead();
	var rowheader = header.insertRow(0); 
	var cell = rowheader.insertCell(0);
	cell.innerHTML = Ember.I18n.t('webclient.Object.name');//NO I18N
	cell = rowheader.insertCell(1);
	cell.innerHTML = Ember.I18n.t('webclient.fwa.object.details');//NO I18N
	var objList=[];
	for(var i=0;i<jsonData.length;i++){
		objList.push(jsonData[i].objName);
	}
	for(var i=0;i<jsonData.length;i++){
		var objDet=jsonData[i];
		var row = tableElement.insertRow(i+1);
		var cell = row.insertCell(0);
		cell.innerHTML ='<span id="'+objDet.objName+'">'+objDet.objName+'</span>';
		cell = row.insertCell(1);
		var innerText="";
		for(var j=0;j<objDet.objDetail.length;j++){
			innerText=innerText+'<span>'+objDet.objDetail[j]+'</span><br>';
		}
		cell.innerHTML = innerText;
	}
}
function load_fwaCompleteStandardList(response){
	var res=response.completeDetail.resultJSONObject;
	var resKey = Object.keys(res.reportRes);
	var HeaderLoaded=false;
	if(res!= null)
	{
		jQuery(res.sectionDisplayOrder).each(function(rulInx, rulEle) {

			jQuery(res.reportRes[resKey]).each(function(index, element) {
				if(rulEle === element.rule)
				{
					if(objlen(element.checkListDetail) > 0)
					{
						jQuery(element.checkListDetail).each(function(chkinx, chkLst){
							if(!chkLst.hasOwnProperty("NoData"))
							{
								if(!HeaderLoaded){
									$('#subDivCompRep').append("<div class='' style='padding: 20px;border-top: 1px solid #d6d6d6;color: red;'><span class='headerTitleSpans'>Insecure Service Audit</span></div>");
									HeaderLoaded=true;
								}
								jQuery(chkLst.DATA).each(function(chkdataInx, chkdataele) {
									showfwaCompleteSectionData(chkdataele);
								});
							}
						});
					}
				}
			});
		});
	}
}



function showfwaCompleteSectionData(chkdataele){
	
	if(chkdataele.hasOwnProperty("sectionData")){
		var sectData = JSON.parse(chkdataele.sectionData);
		var popupTitle = chkdataele.popUpTitle;
		var colNames = [Ember.I18n.t('webclient.inventory.policyname',this),Ember.I18n.t('ncm.acd.Rulename',this),Ember.I18n.t('NFAWidget.Src',this),Ember.I18n.t('NFAWidget.Dst',this),Ember.I18n.t('fwa.rule.service',this),Ember.I18n.t('webclient.WAN.SourceInterface',this),Ember.I18n.t('fwa.webclient.destination.interface',this)] //NO I18N
		var colOrder = ["Policy Name","Rule Name","Source","Destination","Service","Src Interface","Dst Interface"] //NO I18N
		var colWidth=100/colNames.length;
		if(sectData.length){
			var sdCol = '', hcount = 0, colHead = '';
			jQuery(sectData).each(function(index, element) {
				sdCol += '<tr>'
					jQuery(colOrder).each(function(sinx, sele) {
						if(hcount === 0)
						{
							colHead += '<td width="'+colWidth+'%" style="word-break:break-all;">'+colNames[sinx]+'</td>';
						}

						if(sele === 'Service'){	//NO I18N	

							var str = element[sele];
							if(str.match(/\/>|<br>|<img|<a/g) === null)	//NO I18N
							{
								str = str.replace(/</g,"&lt;").replace(/>/g,"&gt;")	//NO I18N
							}
							sdCol += '<td width="'+colWidth+'%" style="word-break:break-all;">'+str+'</td>';	//NO I18N			
						}else{
							sdCol += '<td width="'+colWidth+'%" style="word-break:break-all;">'+element[sele]+'</td>';	//NO I18N
						}
					});	
				hcount = 3;
				sdCol += '</tr>'
			});

			var sec = '<div id="sectionDataDiv" style="" class="layerOuterNew whitebg"><span style="padding-left:20px;color:red"><span>'+popupTitle+'</span></span>        <div class="sectionDataCont opmTabCont" style="padding:20px"><table class="pciSummaryTbl complianEvenRow" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><thead><tr>'+colHead+'</tr></thead><tbody>'+sdCol+'</tbody></table></div></div>';
			jQuery('#subDivCompRep').append(sec);//NO I18N
		}
	}
}


function fwa_complianceReportList(res)
{
	if(res!= null)
	{
	        if(res.hasOwnProperty("error")){
			printNotification("error", res.error); //No I18N
		}else{
			$('#mainDivCompRep').show();
//			results=res;	
			var resKey = Object.keys(res.reportRes);
			fwa_complianceRepTable(res,'All');	//NO I18N
			var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]//No I18N
			var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]//No I18N
			var rDate = new Date(res.reportDate)
		 
			var repDates = res.reportDate.split(' '), cDate = repDates[0], cTime = repDates[1]
			cDate = cDate.split('-'); cTime = cTime.split(":")
			rDate = new Date(cDate[0], (cDate[1] -1), cDate[2], cTime[0], cTime[1], 00)
				
			jQuery('.compRepDate').text(days[rDate.getDay()] +' '+ rDate.getDate()+' '+months[rDate.getMonth()]+' '+rDate.getFullYear() +' at' + ' '+rDate.getHours()+':'+rDate.getMinutes())//No I18N

			jQuery('#compliancePciReport').find('.rName').text(res.reportName);	//NO I18N
			if(res.latestConfigVersion > parseInt(res.ruleVer)){
				jQuery('.latestVers').remove();//NO I18N
				jQuery('#compliancePciReport').find('.rName').after('<span class="latestVers"> '+Ember.I18n.t('fwa.compliance.latest_ver',this)+' <a href="javascript:void(0)" onclick="getLatestVersion()">'+Ember.I18n.t('fwa.compliance.here',this)+'</a></span>')
			}
			jQuery('#compliancePciReport').find('.rDate').text(res.reportDate);	//NO I18N
			jQuery('#compliancePciReport').find('.rDesc').html(res.reportDesc);	//NO I18N
			jQuery('#compliancePciReport').find('.ruleConfigDesc').text(res.ruleConfigDesc);	//NO I18N
			jQuery('#compliancePciReport').find('.pciSummaryTxt').text(decodeURIComponent(OPMClient.FWAComplianceDetailsController.complianceReportName));	//NO I18N
			jQuery('#compliancePciReport').find('.ruleVer a').text('Version '+res.ruleVer);	//NO I18N
			var networkDetails = '';	//NO I18N
			var count = 0;
			jQuery.each(res.netWorkDetails, function(netkey, netval)
			{
				if(count < 2)
				{ 
				  networkDetails += '<li>'+netkey+' - '+netval.toString()+'</li>';	//NO I18N
				  count = count+1;	
				}
			});
		
			jQuery('.networkDetails').html('<ul>'+networkDetails+'</ul>');	//NO I18N
		
			jQuery('.netWorkMore').click(function(){ //NO I18N
				jQuery('.netWorkBut').trigger('click');  //NO I18N
			})
		
			
			if(parseInt(res.ruleConfigPerc) == 100)
			{
				jQuery('.pciPercNum').addClass('pciConfigCompleteTxt').text(Math.round(parseInt(res.ruleConfigPerc))+'%');	//NO I18N
				jQuery('.pcidssPercentage').addClass('pciConfigComplete').animate({width:(Math.round(parseInt(res.ruleConfigPerc)))+'%'},800) ;	//NO I18N
			}
			else
			{
				jQuery('.pciPercNum').text(Math.round(parseInt(res.ruleConfigPerc))+'%');	//NO I18N
				jQuery('.pcidssPercentage').animate({width:(Math.round(parseInt(res.ruleConfigPerc)))+'%'},800)	;	//NO I18N
			} 
			jQuery('#compliancePciReport').fadeIn(); 	//NO I18N
		
			
		}
	}
}


function fwa_complianceRepTable(res, filter, etype)
{
	
	jQuery('.compResFail').remove();//NO I18N
	jQuery('#compliancePciDetail').fadeIn();	//NO I18N
	var tbl = '<table width="100%" border="0" class="pciSummaryTbl pciSummaryTbl1" cellspacing="0" cellpadding="0"><thead><tr><td width="14%">'+Ember.I18n.t('fwa.compliance.Rules',this)+'</td><td width="6%">'+Ember.I18n.t('webclient.devices.details.status',this)+'</td><td>'+Ember.I18n.t('fwa.compliance.Description',this)+'</td></tr></thead><tbody>',	//NO I18N
	resKey = Object.keys(res.reportRes), col = '';	//NO I18N
	var comDetailDiv = '';	//NO I18N
	var userCall = false;
	
	
	if(resKey != null)
	{	
	
		jQuery(res.sectionDisplayOrder).each(function(rulInx, rulEle) {
			
			jQuery(res.reportRes[resKey]).each(function(index, element) {
				if(rulEle === element.rule)
				{
					if(jQuery.trim(element.Status) === 'UserCall')
					{
						userCall = true;
					}
					var statIcon = element.Status == 'Pass' ? 'pciPassIcon' : 'pciFailIcon';	//NO I18N
						statIcon = element.Status == 'UserCall' ? 'starIcon' : statIcon; 	//NO I18N
					var statTitle = element.Status == 'Pass' ? 'Pass' : 'Failed';	//NO I18N				
						statTitle = element.Status == 'UserCall' ? 'UserCall' : statTitle; 	//NO I18N
					if(filter == 'All')	//NO I18N
					{	
					   comDetailDiv += fwa_complianceDetail(element, index)
					   col += '<tr><td class="bdrRight"><a href="javascript:void(0);" onclick="navigatetodetail(this)">'+element.rule+'</a></td><td class="bdrRight"><img src="/apiclient/fluidicv2/img/spacer.gif" class="'+statIcon+'" align="absmiddle" title="'+statTitle+'" /></td><td>'+element.Description+'</td></tr>';	//NO I18N
					}
					else if(filter == jQuery.trim(element.Status))
					{
						comDetailDiv += fwa_complianceDetail(element, index)
						col += '<tr><td class="bdrRight"><a href="javascript:void(0);" onclick="navigatetodetail(this)">'+element.rule+'</a></td><td class="bdrRight"><img src="/apiclient/fluidicv2/img/spacer.gif" class="'+statIcon+'" align="absmiddle" /> '+element.Status+'</td><td>'+element.Description+'</td></tr>';	//NO I18N
						userCall = false;
					}
				}
			});
        });
	}
	if(userCall === true)
	{
		jQuery('.userCall').show();//NO I18N
	}
	else
	{
		jQuery('.userCall').hide();//NO I18N
	}
	col = col+'</tbody>';	//NO I18N
	jQuery('.pciReportData').html(tbl+col);	//NO I18N
	jQuery('#compliancePciDetail').html(comDetailDiv).fadeIn();	//NO I18N
}

function navigatetodetail(tis,type)
{
	var eleid = '';
	if(type !== true)
	{	
		eleid = jQuery(tis).text();
		eleid = '#'+eleid.replace(/\./g,'').replace(' ','');	//NO I18N
	}
	else
	{
		eleid = tis.replace(' ','');	//NO I18N
	}
	
	if(jQuery(eleid).length)
	{
		var total=parseInt(jQuery(eleid).offset().top)-parseInt($('.compHdr').offset().top);
		jQuery("#mainDivCompRep").scrollTop(total);	//NO I18N
	}
}

function objlen(a)
{
	var count = 0;
	var i;
	for (i in a) {
		if (a.hasOwnProperty(i)) {
			count++;
		}
	}
	return count;
}

function fwa_complianceDetail(element, rulInx)
{ 
	jQuery('#compliancePciDetail').hide();	//NO I18N
	jQuery('#compliancePciDetail').fadeIn();	//NO I18N
	var compDetail = '';
	if(objlen(element.ruleDetail) > 0 || objlen(element.checkListDetail) > 0)
	{  
		var comptbl = '';
		if(objlen(element.ruleDetail) > 0)
		{
			jQuery.each(element.ruleDetail.colList, function(key, val){
				
				 var grpName = '<div class="pciReportGroupDiv"><div class="reportGrpName">'+key+'</div><table width="100%" border="0" class="pciSummaryTbl complianEvenRow" cellspacing="0" cellpadding="0">'
				
				var theads = '';
				if(key !== 'colList')
				{
					var rowhead = '', rowcol = '';
					var colwidth=100/val.length;
					jQuery(val).each(function(index, ele1) {
						rowhead += '<td width="'+colwidth+'%" style="word-break:break-all;">'+ele1+'</td>'
					});
					rowhead = '<thead><tr>'+rowhead+'</tr></thead>'; //NO I18N
					
					jQuery(element.ruleDetail[key]).each(function(rulinx, rulEle){
						
						rowcol += '<tr>'
						jQuery(val).each(function(index, ele1) {
							var rowHLCol = '';
							if(rulEle.hasOwnProperty('highlight'))
							{
								var vals = rulEle.highlight.split('&&')
								jQuery(vals).each(function(index, sele) {
									var vals1 = sele.split('=') 
									if(ele1 === vals1[0] && rulEle[ele1] == vals1[1])
									{
										rowHLCol = ' class="highlightLCol"'//NO I18N
									}
								});
							}
							
							var colres = rulEle[ele1];
							if(!rulEle.hasOwnProperty("NoData"))
							{
								if(ele1 === 'Details')
								{
									rowHLCol = ' width="50%" class="configCol"';//NO I18N
								}else if(ele1 === 'Status')//NO I18N
								{
									var statIcon = rulEle[ele1] == 'Pass' ? 'pciPassIcon' : 'pciFailIcon';//NO I18N
										statIcon = rulEle[ele1] == 'UserCall' ? 'starIcon' : statIcon; //NO I18N
										var statTitle = rulEle[ele1] == 'Pass' ? 'Pass' : 'Failed';	//NO I18N				
											statTitle = rulEle[ele1] == 'UserCall' ? 'UserCall' : statTitle; 	//NO I18N
									colres = '<img src="/apiclient/fluidicv2/img/spacer.gif" class="'+statIcon+'" title="'+statTitle+'" />';
								}
							}
							if(colres !== undefined)
							{
								var str = colres;
								if(str.match(/\/>|<br|<img|<a/g) === null)
								{
									str = str.replace(/</g,"&lt;").replace(/>/g,"&gt;")	//NO I18N
								}
								rowcol += '<td'+rowHLCol+' valign="top" width="'+colwidth+'%" style="word-break:break-all;">'+str+'</td>';	//NO I18N
							}
							else
							{
								rowcol = '<td class="nodataStat" colspan="'+val.length+'">'+rulEle.NoData+'</td>';
							}
						});
						rowcol += '</tr>';
					});
					 
					comptbl +='<div class="pciReportData">'+grpName+rowhead+'<tbody>'+rowcol+'</tbody></table></div></div>';	
				}
				
			})
		}
		
		if(objlen(element.checkListDetail) > 0)
		{
			
			jQuery(element.checkListDetail).each(function(chkinx, chkLst){
					
					var subClass = ''; 
					if(element.checkListDetail.length > 1)
					{
						subClass = ' pciSubCateg'//NO I18N
					}
					
					var colList = chkLst.ColList.split(',');
					
					var colHead = '';
					jQuery(colList).each(function(colInx, colEle) {
						colHead += '<td>'+colEle+'</td>'     
					});
					colHead = '<tr>'+colHead+'</tr>';
					
					var colRow = '';
					if(!chkLst.hasOwnProperty("NoData"))
					{
						jQuery(chkLst.DATA).each(function(chkdataInx, chkdataele) {
						
						if(chkdataele.Details !== undefined){	
						colRow += '<tr>';
						jQuery(colList).each(function(colInx, colEle) {
							 
							var colres = chkdataele[colEle], rowHLCol = '';
							if(colEle === 'Details')
							{
								rowHLCol = ' width="50%" class="configCol"';//NO I18N
							}
							if(colEle === 'Status')
							{
								var statIcon = chkdataele[colEle] == 'Pass' ? 'pciPassIcon' : 'pciFailIcon';//NO I18N
									statIcon = chkdataele[colEle] == 'UserCall' ? 'starIcon' : statIcon; //NO I18N
								var statTitle = chkdataele[colEle] == 'Pass' ? 'Pass' : 'Failed';	//NO I18N				
									statTitle = chkdataele[colEle] == 'UserCall' ? 'UserCall' : statTitle; 	//NO I18N
								colres = '<img src="/apiclient/fluidicv2/img/spacer.gif" class="'+statIcon+'" title="'+statTitle+'" />';
							}
							
							if(chkdataele.hasOwnProperty("sectionData") && colEle === 'Details')
							{
								colres = '<a href="javascript:void(0)" ruleInx="'+rulInx+'" chkLsInx="'+chkinx+'" dataInx="'+chkdataInx+'" class="sectionData" onclick="showSectionData(this)">'+colres+'</a>';
							}
							colRow += '<td '+rowHLCol+' valign="top">'+colres+'</td>'     
						});
						colRow +='</tr>';
						}
						
					});
					}
					else
					{
						colRow = '<td class="nodataStat" colspan="2">'+chkLst.NoData+'</td>' 
					}
					var chkListTitle = '';
					if(chkLst.Title !== '')
					{
						var showFP = '';
						chkListTitle = '<div class="reportGrpName">'+chkLst.Title+ showFP+'</div>'	
					}
					
					comptbl += '<div class="pciRepChkList'+subClass+'">'+chkListTitle+'<table width="100%" border="0" class="pciSummaryTbl complianEvenRow" cellspacing="0" cellpadding="0"><thead>'+colHead+'</thead><tbody>'+colRow+'</tbody></table></div>';				 
			})
		}
		var excludeServ = '';
		
		var secRecommedation = '';	
		if(element.hasOwnProperty("sectionRecommendation")){
			secRecommedation = '<div class="recommendationDiv"><h3>'+Ember.I18n.t('fwa.compliance.Section_Recommedation',this)+':</h3><p>'+element.sectionRecommendation+'</p></div>';
		}	

		var compid = element.rule
		compid = compid.replace(/\./g,'').replace(' ','');	//NO I18N
		var rulColor = element.Status === 'Pass' ? 'green' : 'red';//NO I18N
			rulColor = element.Status === 'UserCall' ? 'gray' : rulColor; //NO I18N
		compDetail = '<div class="complianceReportDiv" id="'+compid+'"><div class="pciSummaryDiv m0"><div class="pciSummaryNav"><ul><li class="f16 pciSummaryTxt">'+element.rule+'</li> <li>-</li>  <li class="ruleStat '+rulColor+'">'+element.Status+'</li> <li>'+excludeServ+'</li></ul><p class="ruleDesc">'+element.Description+'</p></div>'+comptbl+secRecommedation+'</div></div>';	//NO I18N
		
		
		
	}
	else
	{	
		var colres = '';
		var statIcon = element.Status === 'Pass' ? 'pciPassIcon' : 'pciFailIcon';//NO I18N
			statIcon = element.Status === 'UserCall' ? 'starIcon' : statIcon; //NO I18N
		var statTitle = element.Status == 'Pass' ? 'Pass' : 'Failed';	//NO I18N				
			statTitle = element.Status == 'UserCall' ? 'UserCall' : statTitle; 	//NO I18N
			colres = '<img src="/apiclient/fluidicv2/img/spacer.gif" class="'+statIcon+'" title="'+statTitle+'" />';
		
		comptbl = '<div class="pciRepChkList"><table width="100%" border="0" class="pciSummaryTbl complianEvenRow" cellspacing="0" cellpadding="0"><thead><tr><td width="50%">'+Ember.I18n.t('fwa.compliance.Details',this)+'</td><td>'+Ember.I18n.t('webclient.devices.details.status',this)+'</td></tr></thead><tbody><td>'+element.NoData+'</td><td>'+colres+'</td></tbody></table></div>';				 		
		var secRecommedation = '';	
		if(element.hasOwnProperty("sectionRecommendation")){
			secRecommedation = '<div class="recommendationDiv"><h3>'+Ember.I18n.t('fwa.compliance.Section_Recommedation',this)+':</h3><p>'+element.sectionRecommendation+'</p></div>';
		}

		var compid = element.rule
		compid = compid.replace(/\./g,'').replace(' ','');	//NO I18N
		var rulColor = element.Status === 'Pass' ? 'green' : 'red';//NO I18N
			rulColor = element.Status === 'UserCall' ? 'gray' : rulColor; //NO I18N
		compDetail = '<div class="complianceReportDiv" id="'+compid+'"><div class="pciSummaryDiv m0"><div class="pciSummaryNav"><ul><li class="f16 pciSummaryTxt">'+element.rule+'</li> <li>-</li>  <li class="ruleStat '+rulColor+'">'+element.Status+'</li></ul><p class="ruleDesc">'+element.Description+'</p></div>'+comptbl+secRecommedation+'</div></div>';	//NO I18N
		
	}
	 	
	return compDetail;
}


function placePieGraph(res, wide)
{
	var dive = jQuery('div[wid="'+wide+'"]').find('.graphDiv');	//NO I18N
	
	var original = res[wide].pieData.data;
	var dummy = (100 - res[wide].pieData.data);
	var gcolor = '';	//NO I18N
	
	if(original>=60)
	{
		gcolor = '#94c63d';	//NO I18N
	}
	else if(original>=50)
	{
		gcolor = '#f29a00';	//NO I18N
	}
	else if(original<50)
	{
		gcolor = '#da3515';	//NO I18N
	}
	var xurl="#";
	 var cong = '<a  href="'+xurl+'" style="font-size: 16px;"><div class="congrats marginTop15">'+Ember.I18n.t('fwa.compliance.Congratulations',this)+'</div><div class="congrats"><span class="devicen">'+res.selectedDevice+'</span>  is 100 % </div><div class="congrats"><span class="compName">'+wide+'</span> ' +Ember.I18n.t('fwa.compliance.Compliant',this)+'</div></a>';	//NO I18N	

	if(original==100)
	{
		jQuery('div[wid="'+wide+'"]').find('table.floatRight').addClass('guaranteed');	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.failedTitle').html(cong);	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.more').remove();	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.recommedTitle').remove();	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.widgetData .faildRule').removeClass('faildRule')//NO I18N
		jQuery('div[wid="'+wide+'"]').find('table.floatLeft').removeAttr('width').removeAttr('style').css({'width':'100%','border-bottom-right-radius': 0, 'border-top-right-radius': 0});	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('table.floatRight').css({'border-top-left-radius': 0, 'border-bottom-left-radius': 0})//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.devicen').html(jQuery('.compDevName').val());	//NO I18N
		jQuery('div[wid="'+wide+'"]').find('.compName').html(wide);	//NO I18N
	}
	
	var data = [{ label: "Series1",  data: original, color: gcolor}, { label: "Series2",  data: dummy, color: '#eeeeee'}];	//NO I18N
	plotGraph = jQuery.plot(jQuery(dive), data, {
		series: {
			pie: {
				innerRadius: 0.3,
				show: true
			},
			legend: {
				show: false
			},
			label: {
				show: false
			},
			grid: {
				hoverable: true
			}
		}
	});
	animateFlotGraph(original);
	$('.legend').hide();
}

function animateFlotGraph(Count)
{
	jQuery('.graph').animate( {tabIndex: 0}, {	//NO I18N
		 duration: 500,
		 step: function (now, fx) 
		 { 
		   var r = jQuery.map( Count, function ( o ) {
				 return [[ o[0], o[1] * fx.pos ]];
		   }); 
		   plotGraph.setData( [{ data: r }] );
		   plotGraph.draw(); 
		 }
	});
}
 

function fwa_drawFWAChangeManagementWidget(snapId,widData,reqParams,widParams,repTitle) {
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	if(widData.chartWidgetData != undefined && widData.chartWidgetData.WidgetData != undefined){		
		$contentdiv.append("<div id='changeTrendGraph' style='height:450px'></div>");
		
		var chartObj = {
				id:"changeTrendGraph",//No I18N
				type:'bar', //dial, bar,area,line,pie //No I18N
				subType:"smootharea",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
				jsonData:widData.chartWidgetData.WidgetData.chartData,
				margin: "30",
				height:310,
				series:"multi",//No I18N
				columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Time",this),columnname_2:Ember.I18n.t("ncm.acd.Change_Count",this),timeFormat:'Datewise'},//No I18N
				"legend": { //No I18N	
					"enabled":true,//No I18N
					"fontSize": 10,//No I18N
					"itemHeight": "20",//No I18N
					"hAlign":"center",//NO I18N
					"vAlign":"bottom"//NO I18N
				},
				pie:{innerLabel:true},
				chart : {
					stacked : true
				},
				isFWAChart:true
		}
		
		
		var arraObj={
				"placeholder":[],//No I18N
				"chartobj":[]//No I18N
		}
		arraObj.chartobj.push(chartObj);
		arraObj.placeholder.push("changeTrendGraph"); //No I18N
		zChart(arraObj);
	}
	
				
	$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:0px !important'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	var colNamesList = [Ember.I18n.t("ncm.acd.Configuration_Changes_On",this), Ember.I18n.t('jsp.commonstr.ChangedBy',this),Ember.I18n.t('webclient.map.interfaces.changed',this)+" "+Ember.I18n.t('webclient.fault.toolbar.from',this), Ember.I18n.t('ncm.acd.Version_No',this), Ember.I18n.t('webclient.common.changedtype',this), Ember.I18n.t('webclient.fwa.config.change.count',this), Ember.I18n.t('webclient.fwa.change.rule.change.count',this)]; //No I18N
	var colModelList = [{ name: 'Changed_On', index: 'Changed_On', classes:"pointer", formatter:cmpchangelistFormatter}, //No I18N
	                    { name: 'Changed_By', index: 'Changed_By'}, //No I18N
	                    { name: 'Changed_From', index: 'Changed_From'}, //No I18N
	                    { name: 'VersionNo', index: 'VersionNo'}, //No I18N
	                    { name: 'Type', index: 'Type'} , //No I18N
	                    { name: 'Total_Changes', index: 'Total_Changes', formatter:configChangeCountLinkFormatter}, //No I18N
	                    { name: 'ruleChangeCount', index: 'ruleChangeCount'} //No I18N
	                    ];
	
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId, widData.gridData, colNamesList, colModelList, "", "", "","",false); //No I18N
	
	var deviceType=reqParams.deviceType;
	if(deviceType=='Cisco' && widData.ciscoStartupRunningConflicts != undefined){//No I18N
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widParams.widgetElement.append($contentdiv);
		$contentdiv.append("<div class='opm_widget_title'><span class='headerTitleSpans'>"+Ember.I18n.t("webclient.Startup.Running.Conflict.Report",this)+"</span></div>");			
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend2"+snapId+"' class='ut ut-Grid'></table></div>");
		
		var colNamesList2 = ['Changed_On', 'Changed_By', 'Total_Changes']; //No I18N
		var colModelList2 = [{ name: 'Changed_On', index: 'Changed_On', classes:"pointer", formatter:cmpconflictFormatter}, //No I18N
		                    { name: 'Changed_By', index: 'Changed_By', classes:"pointer"}, //No I18N
		                    { name: 'Total_Changes', index: 'Total_Changes',classes:"pointer", formatter:conflictChangeCountFormatter} //No I18N
		                    ];
		
		fwa_loadPDFJQgridWithData('#opm_App_Legend2'+snapId, widData.ciscoStartupRunningConflicts.gridData, colNamesList2, colModelList2, "", "", "","",false); //No I18N
	}
	
}

function cmpchangelistFormatter(cellValue, options, rowdata, action)
{
	return '<span ><img src="/apiclient/fluidicv2/img/spacer.gif" alt="" border="0" align="absmiddle" style="float:left;margin-left:5px;margin-right:5px;margin-top:2px;" class="configChanges" title="Show Latest Config Changes"/>'+cellValue+'</span>'; //No I18N
}
function cmpconflictFormatter(cellValue, options, rowdata, action)
{
	return '<span ><img src="/apiclient/fluidicv2/img/spacer.gif" alt="" border="0" align="absmiddle" style="float:left;margin-left:5px;margin-right:5px;margin-top:2px;" class="configChanges" title="Show Latest Config Changes"/>'+cellValue+'</span>'; //No I18N
}

function fwa_drawFWACompStandardWidget(snapId,widData,reqParams,widParams,repTitle) {
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var response=widData;
//	$contentdiv.append("<div class='opm_widget_title'><span class='headerTitleSpans'>"+reqParams.reportName+" "+Ember.I18n.t("nfa.report.name",this)+"</span></div>");
	var pciDiv ="<div class='widget pciWidget' wid='PCI DSS'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>PCI DSS</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.PciDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var sansDiv ="<div class='widget sansWidget' wid='SANS'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>SANS</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.SansDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var nistDiv ="<div class='widget nistWidget' wid='NIST'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>NIST</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.NIST_Desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var isoDiv ="<div class='widget nistWidget' wid='ISO'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>ISO</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.IsoDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var nercDiv ="<div class='widget nistWidget' wid='NERC-CIP'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>NERC-CIP</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.NercDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var soxDiv ="<div class='widget soxWidget' wid='SOX'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>SOX</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.sox.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var hipaaDiv ="<div class='widget hipaaWidget' wid='HIPAA'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>HIPAA</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.hipaa.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var gdprDiv ="<div class='widget gdprWidget' wid='GDPR'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>GDPR</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.gdpr.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var glbaDiv ="<div class='widget glbaWidget' wid='GLBA'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>GLBA</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.glba.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var baselDiv ="<div class='widget baselWidget' wid='BASEL-II'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>BASEL-II</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.basel.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var socDiv ="<div class='widget socWidget' wid='SOC 2 Type II'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>SOC 2 Type II</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.soc.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var cjisDiv ="<div class='widget cjisWidget' wid='CJIS'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>CJIS</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.CJISDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var cisDiv ="<div class='widget cisWidget' wid='CIS Controls v8'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>CIS</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.CISDivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var gsmaDiv ="<div class='widget gsmaWidget' wid='GSMA'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>GSMA</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.GSMADivDesc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	var nisDiv ="<div class='widget gsmaWidget' wid='NIS 2'><div style=' float:left; width:100%; margin: 20;' ><div style='width:100%;font-weight:bold' class='opm_widget_title'><span class='comRep'>NIS 2</span><span class='widgetDate' style='padding-left:10px'></span></div><div style='height: 100%;padding: 25px 5px 5px;overflow: auto;'><div class='widgetDesc' style='padding-bottom:10px;min-height: 80px'>"+Ember.I18n.t('fwa.compliance.nis.desc',this)+"</div><div class='widgetData marginTop20' style='padding:0px;'></div></div></div></div>";//No I18N
	
	switch(reqParams.reportName)	//NO I18N
	{
	case 'PCI DSS':	//NO I18N
	{
		$contentdiv.append(pciDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'PCI DSS',reqParams);	//NO I18N
	}
	break;
	case 'SANS':	//NO I18N
	{
		$contentdiv.append(sansDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'SANS',reqParams);	//NO I18N
	}
	break;
	case 'NIST':	//NO I18N
	{
		$contentdiv.append(nistDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'NIST',reqParams);	//NO I18N
	}	
	break;
	case 'ISO':	//NO I18N
	{
		$contentdiv.append(isoDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'ISO',reqParams);	//NO I18N
	}	
	break;
	case 'NERC-CIP':	//NO I18N
	{
		$contentdiv.append(nercDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'NERC-CIP',reqParams);	//NO I18N
	}	
	break;
	case 'SOX':	//NO I18N
	{
		$contentdiv.append(soxDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'SOX',reqParams);	//NO I18N
	}	
	break;
	case 'HIPAA':	//NO I18N
	{
		$contentdiv.append(hipaaDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'HIPAA',reqParams);	//NO I18N
	}	
	break;
	case 'GDPR':	//NO I18N
	{
		$contentdiv.append(gdprDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'GDPR',reqParams);	//NO I18N
	}	
	break;
	case 'GLBA':	//NO I18N
	{
		$contentdiv.append(glbaDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'GLBA',reqParams);	//NO I18N
	}	
	break;
	case 'BASEL-II':	//NO I18N
	{
		$contentdiv.append(baselDiv);
		fwa_updateWidgetData(widData, 'BASEL-II',reqParams);	//NO I18N
	}	
	break;
	case 'SOC 2 Type II':	//NO I18N
	{
		$contentdiv.append(socDiv);
		fwa_updateWidgetData(widData, 'SOC 2 Type II',reqParams);	//NO I18N
	}	
	break;
	case 'CJIS':	//NO I18N
	{
		$contentdiv.append(cjisDiv);
		fwa_updateWidgetData(widData, 'CJIS',reqParams);	//NO I18N
	}	
	break;
	case 'CIS Controls v8':	//NO I18N
	{
		$contentdiv.append(cisDiv);
		fwa_updateWidgetData(widData, 'CIS Controls v8',reqParams);	//NO I18N
	}	
	break;
	case 'GSMA':	//NO I18N
	{
		$contentdiv.append(gsmaDiv);	//NO I18N
		fwa_updateWidgetData(widData, 'GSMA',reqParams);	//NO I18N
	}
	break;
	case 'NIS 2':	//NO I18N
	{
		$contentdiv.append(nisDiv);
		fwa_updateWidgetData(widData, 'NIS 2',reqParams);	//NO I18N
	}
	break;
	}
	
}

function fwa_drawFWARuleExpiryCompleteWidget(snapId,widData,reqParams,widParams,repTitle) {
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	var repTitle="";
	if(reqParams.type == "allsch"){
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.allsch',this);//No I18N
	}else if(reqParams.type == "active" || reqParams.type == "expiresnext"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.active',this);//No I18N
	}else if(reqParams.type == "upcoming"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.upcoming',this);//No I18N	
	}else if(reqParams.type == "expired"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.expired',this);//No I18N
	}else if(reqParams.type == "recurring"){//NO I18N
		 repTitle=Ember.I18n.t('webclient.fwa.rule.expiry.recurring',this);//No I18N
	}
	if(repTitle != undefined){
		$contDiv.append("<div class='fwaHeading_pdf'>"+repTitle+"</div>");
	}
	var widElem=$('<div id="widgetElement_2" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_2').append($contentdiv);
	var response=widData;
	
					
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	 var colNamesList = ['','','','',Ember.I18n.t("webclient.fwa.rule.num.id",this),Ember.I18n.t("Schedulemail.body6",this), Ember.I18n.t("fwa.compliance.Schedule_Type",this),Ember.I18n.t("webclient.fwa.rule.expiry.daysofweek",this),Ember.I18n.t("webclient.admin.schedulereports.time",this),Ember.I18n.t("webclient.devices.details.starttime",this),Ember.I18n.t("webclient.devices.details.endtime",this),Ember.I18n.t("webclient.fwa.rule.expiry.range",this)]; //No I18N
	 var colModelList = [
	                      { name: 'state', index: 'state', hidden:true}, //No I18N
						  { name: 'mailid', index: 'mailid', hidden:true}, //No I18N
						  { name: 'ruleNumber', index: 'ruleNumber', hidden:true}, //No I18N
						  { name: 'stateImg', index: 'stateImg',search:false,width:40,hidedlg:true,formatter:function setRuleExpiryStatus(cellValue, options, rowdata, action){//No I18N
								var logClass="inactivestatus";//NO I18N
								var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
								if(rowdata.state!=null && rowdata.state== 'active'){
									logClass="activestatus";//NO I18N
									logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
								}else if(rowdata.state!=null && rowdata.state== 'expired'){//NO I18N
									logClass="expiredstatus";//NO I18N
									logTitle=Ember.I18n.t("webclient.fwa.rule.expired",this);//NO I18N
								}	
								return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
						  }}, 
	                      { name: 'ruleNumberTxt', index: 'ruleNumberTxt',formatter:function(cellValue, options, rowdata, action){// No I18N
	                    	  return "<span style='color:blue;cursor:pointer' data-val='"+rowdata.ruleNumber+"'>"+rowdata.ruleNumber+"</span>";
	                      },unformat:function(cellvalue, options, cell) {
		                    	 return $('span', cell).attr('data-val');
		                   }}, //No I18N
	                      { name: 'scheduleName', index: 'scheduleName'}, //No I18N
	                      { name: 'scheduleType', index: 'scheduleType'}, //No I18N
	                      { name: 'daysofweek', index: 'daysofweek'}, //No I18N
	                      { name: 'time', index: 'time'}, //No I18N		
	                      { name: 'starttime', index: 'starttime'}, //No I18N		
	                      { name: 'endtime', index: 'endtime'} , //No I18N		
	                      { name: 'range', index: 'range'} //No I18N		
	                      ];
	
	 
	var gridData=widData.gridData;
	var haspolicyName = false;
	if(gridData != undefined && gridData.length > 0){
		if(gridData[0].policyname != undefined){
			haspolicyName = true;
		}
	}
	if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
		colNamesList.splice(4,0,Ember.I18n.t("webclient.fault.addnotes.device_name",this));//NO I18N
		colModelList.splice(4,0,{ name: "devname", index: "devname"});//No I18N
		if(haspolicyName){
			colNamesList.splice(5,0,Ember.I18n.t("webclient.inventory.policyname",this));//NO I18N
			colModelList.splice(5,0,{ name: "policyname", index: "policyname"});//No I18N
		}
	}else{
		if(haspolicyName){
			colNamesList.splice(4,0,Ember.I18n.t("webclient.inventory.policyname",this));//NO I18N
			colModelList.splice(4,0,{ name: "policyname", index: "policyname"});//No I18N
		}
	}
	
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","",{},false,reqParams);
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	if(repTitle != undefined){
		$contDiv.append("<div class='fwaHeading_pdf'>"+Ember.I18n.t("webclient.fwa.rule.expiry.rule.details",this)+"</div>");
	}
	var widElem=$('<div id="widgetElement_3" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_3').append($contentdiv);
	
	var compcolNameList = [Ember.I18n.t("webclient.fault.event.displayName",this), Ember.I18n.t("NFAWidget.Dst",this), Ember.I18n.t("webclient.WAN.SourceInterface",this),Ember.I18n.t("fwa.webclient.destination.interface",this),Ember.I18n.t("fwa.rule.service",this),Ember.I18n.t("webclient.admin.traps.action",this)];//No I18N                  

	 var compcolModelList = [
	 { name: 'source', index: 'source'}, //No I18N
	 { name: 'destination', index: 'destination'}, //No I18N
	 { name: 'srcInt', index: 'srcInt'}, //No I18N
	 { name: 'dstInt', index: 'dstInt'}, //No I18N
	 { name: 'service', index: 'service'}, //No I18N
	 { name: 'action',index:'action',search:false,hidedlg:true,formatter:function setPolicyRuleStatus(cellValue, options, rowdata, action){//No I18N
		 var logTitle=Ember.I18n.t("webclient.fwa.policy.allow",this);//NO I18N
		 if(cellValue!=null && cellValue== 'deny'){
			 logTitle=Ember.I18n.t("deny",this);//NO I18N
		 }
		 return logTitle;//No I18N
	 }}
	 ];
	 if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
		 compcolNameList.splice(0,0,Ember.I18n.t("webclient.fault.addnotes.device_name",this));//NO I18N
		 compcolModelList.splice(0,0,{ name: "devname", index: "devname"});//No I18N
	 }
	for(var ij=0;ij<widData.gridData.length;ij++){
		var singleana=widData.gridData[ij];
		var gridtemp=[singleana];
		var ruleName=singleana.ruleNumber;
		$contentdiv.append("<div style='padding-top:10px'>"+Ember.I18n.t("webclient.fwa.ruleadmin.details.rule",this)+" : "+ruleName+"</div>");
		$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:10px;padding-bottom:10px'><table id='policy_opt_det_"+ij+"' class='ut ut-Grid'></table></div>");
		fwa_loadPDFJQgridWithData('#policy_opt_det_'+ij, gridtemp, compcolNameList, compcolModelList, "", "", "","",false); //No I18N
	
	}
}

function fwa_drawFWARuleOverviewWidget(snapId,widData,reqParams,widParams,repTitle) {
	
	if(widData.deviceScore != undefined){
		var $contDiv = $('<div class="" style="margin-bottom: 40px;margin-right:10px;margin-left:10px;top:17px;"></div>');
		$('.mainContent').append($contDiv);	
		var widElem=$('<div id="widgetElement_9999" class="" ></div>');
		$contDiv.append(widElem);
		fwa_drawFWARuleMgmtDeviceScoreWidget(9999, widData.deviceScore);
	}

	if(reqParams.overviewrepType != undefined && reqParams.overviewrepType == "fullExport"){
		if(widData.statisticsList != undefined){
			loadPolicyOverviewStatsGraph(reqParams,widData.statisticsList,widParams);
		}
	}
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	if(repTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf">'+repTitle+'</div>');
	}
	var widElem=$('<div id="widgetElement_101" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_101').append($contentdiv);
	var response=widData;
					
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	
	var colNamesList=JSON.parse(reqParams.overviewcolName);
	var colModelList=JSON.parse(reqParams.overviewcolModel);
	
	var OverviewColNameListTemp=[];
	var OverviewColModelListTemp=[];
	
	for(var i=0;i<colModelList.length;i++){
		if(colModelList[i].name != 'cb'){//No I18N
			OverviewColNameListTemp.push(colNamesList[i]);
			OverviewColModelListTemp.push(colModelList[i]);
		}
	}
	for(var i=0;i<OverviewColModelListTemp.length;i++){
		var col = OverviewColModelListTemp[i];
		if(col.index === 'logging'){//No I18N
			OverviewColModelListTemp[i].width = 40;
			OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
				var logClass="iconLogdisable";//NO I18N
				var logTitle=Ember.I18n.t("webclient.fwa.logging.disabled",this);//NO I18N
				if(cellValue!=null && cellValue.indexOf("enable")>-1){
					logClass="iconLog";//NO I18N
					logTitle=Ember.I18n.t("webclient.fwa.logging.enabled",this);//NO I18N
				}	
				return '<span class="'+logClass+'" title="'+logTitle+'"></span>';//No I18N
			}
		} else if(col.index === 'status'){//No I18N
			OverviewColModelListTemp[i].width = 40;
			OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
				var logClass="inactivestatus";//NO I18N
				var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
				if(cellValue!=null && cellValue== 'Yes'){
					logClass="activestatus";//NO I18N
					logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
				}	
				return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
			}
		} else if(col.index === 'action'){//No I18N		
			OverviewColModelListTemp[i].formatter = function (cellValue, options, rowdata, action){
				var logTitle = "";//NO I18N
				if(cellValue !== null && cellValue != undefined){
					if(cellValue.toLowerCase() === 'permit' || cellValue.toLowerCase() === 'allow' || cellValue.toLowerCase() === 'accept'){
						logTitle = Ember.I18n.t("webclient.fwa.policy.allow",this);//NO I18N
					} else if(cellValue.toLowerCase() === 'deny' || cellValue.toLowerCase() === 'drop'){//No I18N
						logTitle = Ember.I18n.t("deny",this);//NO I18N
					} else {
						logTitle = cellValue;
					}
				}
				return logTitle;
			};
		} else if(col.index === 'lastUpdatedTime'){//No I18N
			OverviewColModelListTemp[i].hidden = true;
		} else if(col.name === 'cb'){//No I18N
			OverviewColModelListTemp[i].index = 'cb';//NO I18N
		} else if(col.formatter){
			OverviewColModelListTemp[i].formatter = overListObjectDetailFormatter;
		}
	}
	var tempColModel = [];
	for(var k=0; k<OverviewColModelListTemp.length; k++) {
		tempColModel[k] = {};
		tempColModel[k].index = OverviewColModelListTemp[k].index;
		tempColModel[k].name = OverviewColModelListTemp[k].name;
		if(OverviewColModelListTemp[k].formatter != undefined && OverviewColModelListTemp[k].formatter != false){
			tempColModel[k].formatter = OverviewColModelListTemp[k].formatter;
		}
		if(OverviewColModelListTemp[k].width != undefined){
			tempColModel[k].width = OverviewColModelListTemp[k].width;
		}
		if(OverviewColModelListTemp[k].hidden != undefined){
			tempColModel[k].hidden = OverviewColModelListTemp[k].hidden;
		}
	}
	var gridData=widData.data;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,OverviewColNameListTemp,tempColModel,"","","",{},false,reqParams);
	if(widData.compObjectDetail != undefined){
		fwa_loadOverviewObjectDetails(widData.compObjectDetail,widParams);
	}
}

function fwa_drawFWARuleMgmtNatRulesWidget(snapId,widData,reqParams,widParams,repTitle) {
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var response=widData;			
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	
	var colDetails = widData.colListForExportPDF.widgetAdditionalData;
	
	var colNamesList = colDetails.colNameList;
	var colModelList = colDetails.colModelList;
	
			for(var k=0; k<colModelList.length; k++) {
				
				if(colModelList[k].name === "STATUS") {
					colModelList[k].formatter =  function(cellValue, options, rowdata, action) { 
						var logClass, logTitle;
						if(cellValue!==null && cellValue==="Yes" || cellValue==="enabled") {
							logClass = "activestatus";//NO I18N
							logTitle = Ember.I18n.t("webclient.nfa.inventory.active");//NO I18N
						}else {
							logClass = "inactivestatus";//NO I18N
							logTitle = Ember.I18n.t("webclient.nfa.inventory.inactive");//NO I18N
						}
						return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
					};
				}
			
			}
	



	var gridData=widData.data;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","",{},false,reqParams);
}

function loadPolicyOptimizationStatsGraph(snapId,jsonData,widParams){	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_'+snapId).append($contentdiv);
//	$contentdiv.append("<div class='opm_widget_title'><span class='headerTitleSpans'>Policy Optimization Details</span></div>");			
	$contentdiv.append("<div id='ruleSummaryGraph'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='ruleSummaryTable' class='ut ut-Grid'></table></div>");
	
	var response=jsonData;
	var dataChart = new Array();
	var multiData = new Array();
	var totalCount=0;
	var catList=["Redundancy","Generalization","Correlation","Shadow","Grouping"];// No I18N
	if(response.policyOptGraph != undefined){
		for (var index = 0; index < response.policyOptGraph.Category.length; index++) {
			var array_element = response.policyOptGraph.Category[index];
			var arr = new Array();
			arr.push(array_element);
			arr.push(response.policyOptGraph.count[index]);
			arr.push(catList[index]);
			var dt = {

			};
			dt.actualTitle = array_element;
			dt.Id=array_element;
			dt.count = response.policyOptGraph.count[index];
			totalCount=totalCount+response.policyOptGraph.count[index];
			dataChart.push(dt);
			multiData.push(arr);
		}
	}
	
	var chartObj = {
			id:"ruleSummaryGraph",//No I18N
			type:'pie', //dial, bar,area,line,pie //No I18N
			subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
			customClass:"opm_pie",//No I18N
			jsonData:multiData,
			margin: "30",
			height:310,
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("webclient.fault.alarm.category",this),columnname_2:Ember.I18n.t("webclient.common.widgets.eventcount",this),suffix:"",timeFormat:'hours'},//No I18N
			"legend": { //No I18N	
				"enabled":true,//No I18N
				"fontSize": 10,//No I18N
				"itemHeight": "20",//No I18N
				"hAlign":"center",//NO I18N
				"vAlign":"bottom"//NO I18N
			},
			pie:{innerLabel:true},
			isFWAChart:true
	}
	var arraObj={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	}
	var mappingobj={};
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push("ruleSummaryGraph"); //No I18N
	zChart(arraObj);
	
	var dataArray1 = new Array();
	
	for (var i = 0; i < dataChart.length; i++) {
		var row = dataChart[i];
		dataArray1.push({"Key":row.actualTitle, "keyValue":catList[i], "text":row.actualTitle, "Value":row.count,"url":row.url});//No I18N
	}
	dataArray1.push({"Key":Ember.I18n.t("opu.common.ALL",this), "keyValue":"all", "text": Ember.I18n.t("opu.common.ALL",this), "Value":totalCount,"url":""});//No I18N
	
	var xaxis=(response.policyOptGraph != undefined ) ? response.policyOptGraph.xaxisLabel : "";
	var colNamesList1 = [xaxis,'Count']; //No I18N
	var colModelList1 = [
	                     { name: 'Key', index: 'Key'}, //No I18N	
	                     { name: 'Value', index: 'Value'} //No I18N
	                     ];
	fwa_loadPDFJQgridWithData('#ruleSummaryTable', dataArray1, colNamesList1, colModelList1, "", "","","",false); //No I18N
	
}



function loadPolicyOverviewStatsGraph(reqParams,jsonData,widParams){	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">Rule Summary Details</div>');
	var widElem=$('<div id="widgetElement_100" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_100').append($contentdiv);		
	$contentdiv.append("<div id='ruleSummaryGraph'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='ruleSummaryTable' class='ut ut-Grid'></table></div>");
	
	var multiData=[];
	for (var index = 0; index < jsonData.length; index++) {
		var array_element =jsonData[index];
		if(array_element.rbbName != "Total Rules"){
			var arr = new Array();
			arr.push(array_element.i18Ntitle);
			arr.push(array_element.Count);
			arr.push(array_element.rbbName);
			arr.push(array_element.rbbOrderId);
			arr.push(array_element.title);
			var dt = {

			};
			multiData.push(arr);
		}
	}
	var chartObj = {
			id:"ruleSummaryGraph",//No I18N
			type:'bar', //dial, bar,area,line,pie //No I18N
			jsonData:multiData,
			height:400,
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("fwa.compliance.Stat",this),columnname_2:Ember.I18n.t("webclient.common.widgets.eventcount",this),suffix:"",timeFormat:'hours'},//No I18N
			"legend": { //No I18N	
				"enabled":true,//No I18N
				"fontSize": 10,//No I18N
				"layout":"horizontal",//NO I18N
				"itemWidth":400,//NO I18N
				"hAlign":"center",//NO I18N
				"vAlign":"bottom"//NO I18N
			},
			pie:{innerLabel:true},
			isFWAChart:true
	}
	var arrayObj={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	}
	if(reqParams.overviewChartType != undefined){
		chartObj.type=reqParams.overviewChartType;
	}
	arrayObj.chartobj.push(chartObj);
	arrayObj.placeholder.push("ruleSummaryGraph");
	zChart(arrayObj);
	
	
	var colNamesList1 = [Ember.I18n.t("fwa.compliance.Stat",this),Ember.I18n.t("webclient.common.widgets.eventcount",this)]; //No I18N
	var colModelList1 = [
	                     { name: 'i18Ntitle', index: 'i18Ntitle'}, //No I18N
	                     { name: 'Count', index: 'Count'} //No I18N
	                     ];
	fwa_loadPDFJQgridWithData('#ruleSummaryTable', jsonData, colNamesList1, colModelList1, "", "","","",false); //No I18N
	
	
}

function fwa_loadOverviewObjectDetails(jsonData,widParams){	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">Firewall Object Details</div>');
	var widElem=$('<div id="widgetElement_1000" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_1000').append($contentdiv);
	$contentdiv.append("<div class='opm_jqGridUI'><table id='compObjectDetails' class='ut ut-Grid'></table></div>");
	var gridTable="#compObjectDetails";//NO I18N
	$(gridTable).width('100%');
	$(gridTable).prop("cellSpacing","0");
	var tableElement=document.getElementById(gridTable.replace("#",""));
	var header = tableElement.createTHead();
	var rowheader = header.insertRow(0); 
	var cell = rowheader.insertCell(0);
	cell.innerHTML = Ember.I18n.t('webclient.Object.name');//NO I18N
	cell = rowheader.insertCell(1);
	cell.innerHTML = Ember.I18n.t('webclient.fwa.object.details');//NO I18N
	var objList=[];
	for(var i=0;i<jsonData.length;i++){
		objList.push(jsonData[i].objName);
	}
	for(var i=0;i<jsonData.length;i++){
		var objDet=jsonData[i];
		var row = tableElement.insertRow(i+1);
		var cell = row.insertCell(0);
		cell.innerHTML ='<span id="'+objDet.objName+'">'+objDet.objName+'</span>';
		cell = row.insertCell(1);
		var innerText="";
		for(var j=0;j<objDet.objDetail.length;j++){
			innerText=innerText+'<span>'+objDet.objDetail[j]+'</span><br>';
		}
		cell.innerHTML = innerText;
	}
}

function fwa_drawFWAReportWidgetNew(snapId,widData,reqParams,widParams,repTitle){
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);

	if(repTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf">'+repTitle+'</div>')
	}
	var widElem=$('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
	widParams.widgetElement=widElem;
	$contDiv.append(widElem);
	fwa_drawFWAReportWidget(snapId,widData,reqParams,widParams,repTitle);
}

function fwa_drawFWAReportWidget(snapId,widData,reqParams,widParams,repTitle) {
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$('#widgetElement_'+snapId).append($contentdiv);
	var response=widData;
					
	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");

	if(reqParams != undefined){
		if(reqParams.rowCount == "15" || reqParams.rowCount == "20" || parseInt(reqParams.rowCount) > 20 ){
			if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType != "line"){
				$("#perfrmGraph1"+snapId).hide();
			}
		}else if(reqParams.reportParams != undefined){
			var reportParams=JSON.parse(reqParams.reportParams);
			if(reportParams != undefined && (reportParams.rowCount == "15" || reportParams.rowCount == "20" || parseInt(reportParams.rowCount) > 20)){
				if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType != "line"){
					$("#perfrmGraph1"+snapId).hide();
				}
			}
		}
		
	}
	
	if(!(response.widgetAdditionalData!= undefined && (response.widgetAdditionalData.isTableWidget === true || response.widgetAdditionalData.isTableWidget === "true"))){
		var id1='perfrmGraph1'+snapId;//NO I18N
		var xtype;
		var chartType;
		var fwaChartData;
		var columnname1;
		var columnname2;
		var vertical=true;
		var stacked=false;
		if(response.WidgetType != undefined && response.WidgetType == "pie")
		{
			chartType = "pie"; //No I18N
			fwaChartData = response.WidgetData.chartData;
		}else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.WidgetType == "verticalbar") //No I18N
		{
			chartType = "bar"; //No I18N
			stacked=true;
			fwaChartData = response.WidgetData.chartData;
		}else if(response.widgetAdditionalData != undefined && (response.widgetAdditionalData.chartType == "timeseries" ||response.widgetAdditionalData.chartType == "line" ||response.widgetAdditionalData.chartType == "livexy"))//No I18N
		{ 
			chartType = "line"; //No I18N
			fwaChartData = response.WidgetData.chartData;
		}
		else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "stackedArea")
		{
			chartType = "area"; //No I18N
			fwaChartData = response.WidgetData.chartData;
			stacked=true;
		}
		else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "multiBar")
		{
			chartType = "bar"; //No I18N
			fwaChartData = response.WidgetData.chartData;
		}
		else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "map")
		{
			chartType = "map"; //No I18N
			$("#perfrmGraph1"+snapId).show();
			fwaChartData = response.WidgetData.chartData;
		}
		else
		{
			stacked=true;
			chartType = "bar"; //No I18N
			fwaChartData = response.WidgetData.chartData;
		}
		if(response.WidgetData.xyTitles != undefined)
		{
			columnname1 = response.WidgetData.xyTitles[0];
			columnname2 = response.WidgetData.xyTitles[1];
		}
		else
		{
			columnname1 = "Time"; //No I18N
			columnname2 = "Flow"; //No I18N
		}
		if(response.widgetAdditionalData.xaxis == "string")
		{
			xtype = "ordinal"; //No I18N
		}
		else
		{
			xtype = "time"; //No I18N
		}
		if(response.widgetAdditionalData.WidgetType == "verticalbar"){
			vertical=false;
			stacked=true;
		}
		var timeformat=OPMClient.FWAGlobalDataController.timePeriod;
		if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.period != undefined){
			timeformat=response.widgetAdditionalData.period;
		}
		var x_axes = response.WidgetData.xyTitles !== undefined ? response.WidgetData.xyTitles[0] : "";//No I18N
		var y_axes = response.WidgetData.xyTitles !== undefined ? response.WidgetData.xyTitles[1] : "";//No I18N
//		chartType = "map";
//		response.widgetAdditionalData.chartType = "map";
		if(chartType == "pie"){
			 var testObj = {
				        id:id1, //No I18N
				        type:'pie', //No I18N
				        subType:"simplePie", //No I18N
				        customClass:"opm_pie", //No I18N
				        jsonData: fwaChartData,
				        height:350,
				        margin: 30,
				        columns:{
				            datatype_1:'ordinal',  //No I18N
				            datatype_2:'numeric',  //No I18N
				            columnname_1:columnname1, //No I18N
				            columnname_2:columnname2 
				        },
				        legend: {
				            colors:widParams.colorArray,
				            enabled: false
				        },
				        pie:{innerLabel:true},
				        isFWAChart:true
				    }
		}else if(chartType == "map"){ //No I18N
			var testObj = {
					id:id1,
					jsonData:fwaChartData,
					legend:{}
			}
		}else{
			 var testObj = {
				        id : id1,
				        type : chartType,
				        jsonData : fwaChartData,
				        series : "multi", //No I18N
				        height : 350,
				        columns:{
				        	datatype_1:xtype,
							datatype_2:'numeric',//No I18N
							columnname_1:columnname1,
							columnname_2:columnname2,
							timeFormat:timeformat
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
				        axes:{
	   				        "xaxis": {//No I18N
	   				        		"label": {//No I18N
	   				        			"text":x_axes,//No I18N
	   				        			"fontSize": 13,//No I18N
	   				        		    "fontWeight": 'Bold',//No I18N
		   				        		"fontFamily":"LatoRegular"//No I18N
	   				            	},
	   				             	"ticklabel": {//No I18N
	   				             	"rotation": 45,//No I18N
	   			                    "maxWidth": 75,//No I18N
	   			                    "marginLeft":0,//No I18N
	   			                    "marginRight":0//No I18N
	   				            	}
	   				            	
	   				        	},
	   				     	   "yaxis": [//No I18N
	   				            {"label": {//No I18N
	   				                    "text": y_axes,//No I18N
	   				        			"fontSize": 13,//No I18N
	   				        		    "fontWeight": 'Bold',//No I18N
		   				        		"fontFamily":"LatoRegular"//No I18N
	   				                }
	   				            }
	   				        ]
	   			    	},
				        noDataHandler : {
				            text: Ember.I18n.t('webclient.common.nodata') //No I18N 
				        },
				        chart : {
				            stacked : stacked
				        },
				        isFWAChart:true
				    }
		}
		var arrayObj={
				"placeholder":[],//No I18N
				"chartobj":[]//No I18N
		}
		arrayObj.chartobj.push(testObj);
		arrayObj.placeholder.push(id1);
		if(chartType == "map"){
			zMap(arrayObj,0,columnname2);	
		}else{
			zChart(arrayObj);			
		}
	}

	if(!(response.widgetAdditionalData!= undefined && (response.widgetAdditionalData.isGraphWidget === true || response.widgetAdditionalData.isGraphWidget === "true" || response.widgetAdditionalData.chartType == "map"))){
		var colNamesList = [];
		var colModelList = [];
		$.each(response.widgetAdditionalData.colList, function(key,val){
			colNamesList.push(val);
			colModelList.push({'name':key,'index':key,sortable:false,sorttype:response.widgetAdditionalData.format[key]}); //No I18N
		});
		if(colModelList != undefined && colModelList[0] !=undefined){
			colModelList[0].formatter =  function(cellvalue, options) {
				if(cellvalue == 'Others'){
					return '<span data-val="'+cellvalue+'">'+Ember.I18n.t("webclient.map.others",this)+'</span>';
				}else if(cellvalue == 'Total'){//No I18N
					return '<span data-val="'+cellvalue+'">'+Ember.I18n.t("webclient.devices.details.avail.total",this)+'</span>';
				}else{
					return '<span data-val="'+cellvalue+'">'+cellvalue+'</span>';
				}
			}
			colModelList[0].unformat =  function(cellvalue, options, cell) {
				return $('span', cell).attr('data-val');
			}
		}
		var columnFormat=[];
		if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.format != undefined){
			columnFormat=response.widgetAdditionalData.format;
		}
		if(columnFormat != undefined && (columnFormat.length > 0 && columnFormat.length == colModelList.length )){
			for(var k=0;k<columnFormat.length;k++){
				if(columnFormat[k] == "time"){
					colModelList[k].formatter =  fwaTimeFormatter;
					colModelList[k].unformat = fwaTimeUnFormatter;
				}
			}
		}
		
		if(response.RBBNAME =="AllVPNSession"){
			var tempcolNamesList = [];
			var tempcolModelList = [];
			var formatLen=10;
			tempcolNamesList.push("");
			var colformatter={ name: 'status', index: 'status',search:false,width:40,hidedlg:true,formatter:function setVPNStatisFormatter(cellValue, options, rowdata, action){//No I18N
				var logClass="inactivestatus";//NO I18N
				var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
				if(rowdata[formatLen]!=undefined && rowdata[formatLen]== 'Connected'){
					logClass="activestatus";//NO I18N
					logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
				}	
				return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
			}};
			tempcolModelList.push(colformatter);
			for(var ij=0;ij<colNamesList.length;ij++){
				tempcolNamesList.push(colNamesList[ij]);
				tempcolModelList.push(colModelList[ij]);
			}
			colNamesList=tempcolNamesList;
			colModelList=tempcolModelList;
		}
		
		if(response.RBBNAME =="ActiveVpnSessions"){
			var tempcolNamesList = [];
			var tempcolModelList = [];
			tempcolNamesList.push("");
			var colformatter={ name: 'status', index: 'status',search:false,width:40,hidedlg:true,formatter:function setVPNStatisFormatter(cellValue, options, rowdata, action){//No I18N
				var logClass="activestatus";//NO I18N
				var logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
				return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
			}};
			tempcolModelList.push(colformatter);
			for(var ij=0;ij<colNamesList.length;ij++){
				tempcolNamesList.push(colNamesList[ij]);
				tempcolModelList.push(colModelList[ij]);
			}
			colNamesList=tempcolNamesList;
			colModelList=tempcolModelList;
		}
		
		
		var onSelectFunction;
		var defOpts = {selColIndex:[0],criteria:response.widgetAdditionalData.criteria};

		var gridData=response.data
		if(response.overall != undefined){
			$.each(response.overall, function(key,val){
				if(val != null && val.length == colModelList.length){
					gridData.push(val);
				}
			});
		}
		fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","",defOpts,false,reqParams);
	}
}

function fwaTimeFormatter(cellValue, options, rowdata, action){
	var finTxt=cellValue;
	if(cellValue.indexOf(",") > -1){
		var tempTxt=cellValue.split(",");
		if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length == 2 ){
			finTxt='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
		}
	}else if(cellValue.indexOf(" ") > -1){
		var tempTxt=cellValue.split(" ");
		if(tempTxt[0] != undefined && tempTxt[1] != undefined && tempTxt.length == 2 ){
			finTxt='<span>'+tempTxt[0]+'</span><br><span>'+tempTxt[1]+'</span>';
		}
	}
	return '<span data-val="'+cellValue+'">'+finTxt+'</span>';
}

function fwaTimeUnFormatter(cellvalue, options, cell){
	return $('span', cell).attr('data-val');
}

function fwa_drawFWARuleMgmtGridWidgetSingle(snapId,widData,reqParams,widParams){
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var response=widData;
	$contentdiv.append("<div id='perfGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	var widType = reqParams.type;
	var detMap={};
	var gridData=[];
	var chartData=[];
	var colNameList=[];
	var colModelList=[];
	if(widType == "Overview"){
		detMap={};
		detMap.Total_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.total.rules',this);//No I18N
		detMap.Allowed_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.allowed.rules',this);//No I18N
		detMap.Denied_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.denied.rules',this);//No I18N
		detMap.Inbound_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.inbound.rules',this);//No I18N
		detMap.Outbound_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.outbound.rules',this);//No I18N
		detMap.Disabled_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.inactive.rules',this);//No I18N
		detMap.Logging_Disabled_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.logging.rules',this);//No I18N
		detMap.Any_To_Any_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.anytoany.rules',this);//No I18N
		detMap.Any_Services_Rules_Count=Ember.I18n.t('webclient.fwa.rulemgmt.anyservices.rules',this);//No I18N
        detMap.Bidirectional_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.bidirectional.rules',this);//No I18N
       
        var ruleStats= (widData.response != undefined && widData.response.RULES_STATS!= undefined) ? widData.response.RULES_STATS : {};
        $.each(detMap, function(idx, val)
		{
        	var i18nStr=val;
        	if(ruleStats[idx] != undefined){
        		var value=ruleStats[idx];
	        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
	        	gridData.push({"stat":i18nStr,"value":value});
        	}
		});
        colNameList=[Ember.I18n.t('fwa.compliance.Stat',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
        colModelList=[
                      {"name":"stat","index":"stat"},//No I18N
                      {"name":"value","index":"value"}//No I18N
                      ];
        
		
	}else if(widType == "Risk"){//No I18N
		detMap={};
		detMap.critical= Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this);//No I18N
		detMap.high= Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this);//No I18N
		detMap.medium= Ember.I18n.t('webclient.Medium',this);//No I18N
		detMap.low= Ember.I18n.t('webclient.ncm.tab.Low',this);//No I18N
		detMap.attention= Ember.I18n.t('webclient.admin.traps.attention',this);//No I18N
       
        var ruleStats= (widData.response != undefined && widData.response.RISK_STATS!= undefined) ? widData.response.RISK_STATS : {};
        $.each(detMap, function(idx, val)
		{
        	var i18nStr=val;
        	if(ruleStats[idx] != undefined){
        		var value=ruleStats[idx];
	        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
	        	gridData.push({"stat":i18nStr,"value":value});
        	}
		});
        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
        colModelList=[
                      {"name":"stat","index":"stat"},//No I18N
                      {"name":"value","index":"value"}//No I18N
                      ];
       
	}else if(widType == "Security"){//No I18N
		detMap={};
		detMap.CRITICAL_COUNT= Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this);//No I18N
		detMap.HIGH_COUNT= Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this);//No I18N
		detMap.MEDIUM_COUNT= Ember.I18n.t('webclient.Medium',this);//No I18N
		detMap.LOW_COUNT= Ember.I18n.t('webclient.ncm.tab.Low',this);//No I18N
		detMap.INFORMATIONAL_COUNT= Ember.I18n.t('webclient.fwa.rulemgmt.informational',this);//No I18N
        
        var ruleStats= (widData.response != undefined && widData.response.AUDIT_STATS!= undefined) ? widData.response.AUDIT_STATS : {};
	       
        $.each(detMap, function(idx, val)
		{
        	var i18nStr=val;
        	if(ruleStats[idx] != undefined){
        		var value=ruleStats[idx];
	        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
	        	gridData.push({"stat":i18nStr,"value":value});
        	}
		});
        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
        colModelList=[
                      {"name":"stat","index":"stat"},//No I18N
                      {"name":"value","index":"value"}//No I18N
                      ];
        
        
	}else if(widType == "Optimization"){//No I18N
		detMap={};
		detMap.Redundancy= Ember.I18n.t('webclient.fwa.Redundancy',this);//No I18N
		detMap.Generalization= Ember.I18n.t('webclient.fwa.Generalization',this);//No I18N
		detMap.Correlation= Ember.I18n.t('webclient.fwa.Correlation',this);//No I18N
		detMap.Shadow= Ember.I18n.t('webclient.fwa.Shadow',this);//No I18N
		detMap.Grouping= Ember.I18n.t('webclient.fwa.Grouping',this);//No I18N
        
        var anomalytats= (widData.response != undefined && widData.response.ANOMALY_STATS!= undefined) ? widData.response.ANOMALY_STATS : {};
	    
        $.each(detMap, function(idx, val)
		{
        	var i18nStr=val;
        	if(anomalytats[idx] != undefined){
        		var value=anomalytats[idx];
	        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
	        	gridData.push({"stat":i18nStr,"value":value});
        	}
		});
        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
        colModelList=[
                      {"name":"stat","index":"stat"},//No I18N
                      {"name":"value","index":"value"}//No I18N
                      ];
        
        
	}else if(widType == "Standards"){//No I18N
		detMap=["PCI DSS","SANS","NIST","ISO","NERC-CIP","SOX","HIPAA","GDPR","GLBA","BASEL-II","SOC 2 Type II","CIS Controls v8", "CJIS","GSMA","NIS 2"];//No I18N
        
        var standardstats= (widData.response != undefined && widData.response.Standard_STATS!= undefined) ? widData.response.Standard_STATS : {};
	    
        for(var ij=0;ij<detMap.length;ij++){
        	var i18nStr=detMap[ij];
        	if(standardstats[i18nStr] != undefined){
        		var value=standardstats[i18nStr];
	        	gridData.push({"stat":i18nStr,"value":value});
        	}
        }
        colNameList=[Ember.I18n.t('fwa.rulemgmt.standard.name',this),Ember.I18n.t('fwa.rulemgmt.standard.compliant.percent',this)];//No I18N
        colModelList=[
                      {"name":"stat","index":"stat"},//No I18N
                      {"name":"value","index":"value",formatter:function fwaruleMgmtFormatter(cellValue, options, rowdata, action){//No I18N
                    	  var datStatus=6-(Math.ceil(cellValue/20));
                    	  return '<div class="right dataStatus" style="max-height:15px"><div class="ut-row dataStatus-'+datStatus+'" data-value="'+cellValue+'" style="width:'+cellValue+'%;"><span>'+cellValue+'%</span></div></div>';
					  }}
                      ];
        
        
	}
	if(widType != "Standards"){
		
		var graphParams = {};
		graphParams.id = 'perfGraph1'+snapId;
		graphParams.data = chartData;
		
		graphParams.colName1 = Ember.I18n.t("webclient.fault.alarm.category",this);//No I18N
		graphParams.colName2 = Ember.I18n.t("webclient.report.hardware.value",this);//No I18N
		graphParams.graphType = 'bar';//No I18N	
		graphParams.xAxis = "";//No I18N
		graphParams.yAxis = Ember.I18n.t("webclient.common.widgets.eventcount",this);//No I18N
		graphParams.xaxis = { 
				"label": { //No I18N	
					"text": "" //No I18N	
				},
				"ticklabel": {//No I18N
					"rotation": 45,//No I18N
					"maxWidth": 75,//No I18N
					"marginLeft":0,//No I18N
					"marginRight":0//No I18N
				}
			}
		loadFWAPDFGraph(graphParams);
		
	}
	var defaultOptions = {};
	var gridData = gridData;
	var sendObj = {};
	sendObj.gridId = "opm_App_Legend"+snapId;//No I18N  
	sendObj.data = gridData;
	sendObj.defaultOptions = defaultOptions;
	sendObj.captionTitle = "";
	sendObj.gridNavigator = "";		
	fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,colNameList,colModelList,"","","",sendObj.defaultOptions,false,reqParams);
	
	
}

function fwa_drawFWASingleWidget(snapId,widData,reqParams,widParams) {
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var response=widData;
	if(response.widgetAdditionalData.chartType == "pie"){
		$contentdiv.append("<div id='perfGraph1"+snapId+"'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
		loadPieGraphParams(snapId,widData,reqParams,widParams,response);
		loadTableParams(snapId,widData,reqParams,widParams,response);
	}else if(response.widgetAdditionalData.chartType == "timeseries"){//NO I18N
		$contentdiv.append("<div id='perfGraph1"+snapId+"'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
		loadTimeSeriesGraphParams(snapId,widData,reqParams,widParams,response);
	}else if(response.widgetAdditionalData.isTableData == "true" || response.widgetAdditionalData.chartType == "bar"){//No I18N
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_bar_table"+snapId+"' class='ut ut-Grid'></table></div>");
		var defaultOptions = {};
		var gridData = response.data;
		var sendObj = {};
		defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
		defaultOptions.criteria=response.widgetAdditionalData.criteria;
		sendObj.gridId = "opm_fwa_bar_table"+snapId;//No I18N
		sendObj.data = gridData;
		sendObj.defaultOptions = defaultOptions;
		if(response.widgetAdditionalData.chartType == "bar"){
			var colDetail=getFWABarColDetails(response);
			sendObj.colNames = colDetail.colNameList;
			sendObj.colModels = colDetail.colModelList;
		}else{
			sendObj.colNames = response.widgetAdditionalData.colList;
			sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
		}
		sendObj.captionTitle = "";
		sendObj.gridNavigator = "";		
		fwa_loadPDFJQgridWithData('#'+sendObj.gridId,sendObj.data,sendObj.colNames,sendObj.colModels,"","","",sendObj.defaultOptions,false,reqParams);
	}
}

function loadFWAPDFGraph(graphData){
     var chartObj = {
        id : graphData.id,
        type : graphData.graphType,
        jsonData : graphData.data,
        height :350,
        columns:{
        	
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
        noDataHandler : {
            text: Ember.I18n.t('webclient.common.nodata') //No I18N 
        },
        chart : {
            stacked : false
        }
    }
    if(graphData != undefined && graphData.legend != undefined && graphData.legend.colors != undefined){
    	chartObj.legend.colors = graphData.legend.colors;
    }
    if(graphData.graphType == "pie"){
    	chartObj.subType="simplePie", //No I18N
    	chartObj.customClass="opm_pie", //No I18N
    	chartObj.pie={innerLabel:true}
    	chartObj.columns={
             datatype_1:'ordinal', //No I18N
             datatype_2:'numeric', //No I18N
             columnname_1: graphData.colName1, //No I18N
             columnname_2: graphData.colName2 
         };
    	chartObj.legend.enabled=false;
    }else if(graphData.graphType == "area"){//NO I18N
    	chartObj.columns={
                datatype_1:'time', //No I18N
                datatype_2:'numeric', //No I18N
                columnname_1: Ember.I18n.t('NFAWidget.Time'), //No I18N
                columnname_2: graphData.yAxis 
            };
    	if(graphData.timeFormat != undefined){
    		chartObj.columns.timeFormat=graphData.timeFormat;
    	}
    	chartObj.axes={ //No I18N	
			"rotated": false, //No I18N	
			"xaxis": { //No I18N	
				"label": { //No I18N	
					"text": ((graphData.xAxis !== undefined)?graphData.xAxis : "") //No I18N	
				}
			},
			"yaxis": [ //No I18N	
				{
					"label": { //No I18N	
						"text": ((graphData.yAxis !== undefined)?graphData.yAxis : "") //No I18N
					}
				}
			]
		};
    	chartObj.series="multi";//NO I18N
    }else if(graphData.graphType == "line"){//NO I18N
    	chartObj.columns={
                datatype_1:'time', //No I18N
                datatype_2:'numeric', //No I18N
                columnname_1: graphData.colName1, 
                columnname_2: graphData.colName2 
            };
    	if(graphData.timeFormat != undefined){
    		chartObj.columns.timeFormat=graphData.timeFormat;
    	}
    	chartObj.axes={	
			"rotated": false, //No I18N	
			"xaxis": { //No I18N	
				"label": { //No I18N	
					"text": ((graphData.xAxis !== undefined)?graphData.xAxis : "") //No I18N	
				}
			},
			"yaxis": [ //No I18N	
				{
					"label": { //No I18N	
						"text": ((graphData.yAxis !== undefined)?graphData.yAxis : "") //No I18N
					}
				}
			]
		};
    	chartObj.series="multi";//NO I18N
    }else if(graphData.graphType == "bar"){//NO I18N
    	chartObj.columns={
                datatype_1:'ordinal', //No I18N
                datatype_2:'numeric', //No I18N
                columnname_1: graphData.colName1,
                columnname_2: graphData.colName2 
            };
    	chartObj.axes={ 
			"rotated": false, //No I18N	
			"xaxis": { //No I18N	
				"label": { //No I18N	
					"text": ((graphData.xAxis !== undefined)?graphData.xAxis : "") //No I18N	
				}
			},
			"yaxis": [ //No I18N	
				{
					"label": { //No I18N	
						"text": ((graphData.yAxis !== undefined)?graphData.yAxis : "") //No I18N
					}
				}
			]
		};
    	chartObj.series="multi";//NO I18N
    	chartObj.chart = {stacked:true}
        chartObj.isFWAChart = true;

    }
    
    if(graphData.xaxis != undefined)
    {
    	if(chartObj.axes != undefined){
    		chartObj.axes.xaxis=graphData.xaxis;
    	}else{
    		chartObj.axes={ 
    				"rotated": false, //No I18N	
    				"xaxis": { //No I18N	
    					"label": { //No I18N	
    						"text":"" //No I18N	
    					}
    				},
    				"yaxis": [ //No I18N	
    				           {
    				        	   "label": { //No I18N	
    				        		   "text": "" //No I18N
    				        	   }
    				           }
    				           ]
    		};
    	}
    }
    var arraObj={placeholder:[],chartobj:[]}
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push(graphData.id);
    zChart(arraObj);
}


function fwa_loadPDFJQgridWithData(gridTable,jsonData,colNamesList,colModelList,captionTitle,gridNavigator,onSelectFunction,defaultOptions,isExpand,reqParamsTemp) 
{
	if(isExpand){
		var startIndex=1;
		if(reqParamsTemp != undefined && reqParamsTemp.page != undefined && reqParamsTemp.rows != undefined){
			startIndex=((parseInt(reqParamsTemp.page)-1)*parseInt(reqParamsTemp.rows))+1;
		}
		$(gridTable).addClass('fwaExpandTable');
		$(gridTable).width('100%');
		$(gridTable).prop("cellSpacing","0");
		var tableElement=document.getElementById(gridTable.replace("#",""));
		var header = tableElement.createTHead();
		if (defaultOptions.rowNumNeeded != undefined && defaultOptions.rowNumNeeded) {
			var rowheader = header.insertRow(0);    
			var cell = rowheader.insertCell(0);
			cell.innerHTML = "";
			for(var ij=0;ij<colNamesList.length;ij++){
				var cell = rowheader.insertCell(ij+1);
				cell.innerHTML = colNamesList[ij];
			}
			if(jsonData != undefined){
				var collength=colModelList.length;
				var singColWidth=(95/collength);
				
				for(var i=0;i<jsonData.length;i++){
					var row = tableElement.insertRow(i+1);
					var cell = row.insertCell(0);
					cell.innerHTML = startIndex;
					cell.style.width="50px";
					startIndex++;
					for(var j=0;j<colModelList.length;j++){
						var cell = row.insertCell(j+1);
						if(colModelList[j].singleColwidth != undefined){
							cell.style.width=colModelList[j].singleColwidth;
						}else{
							cell.style.width=singColWidth+"%";
						}
						cell.innerHTML = jsonData[i][j];
					}
				}
			}
	    }else{
	    	var rowheader = header.insertRow(0); 
	    	for(var ij=0;ij<colNamesList.length;ij++){
	    		var cell = rowheader.insertCell(ij);
	    		cell.innerHTML = colNamesList[ij];
	    	}
	    	var collength=colModelList.length;
			var singColWidth=100/collength;
	    	for(var i=0;i<jsonData.length;i++){
	    		var row = tableElement.insertRow(i+1);
	    		for(var j=0;j<colModelList.length;j++){
	    			var cell = row.insertCell(j);
	    			cell.style.width=singColWidth+"%";
	    			cell.innerHTML = jsonData[i][j];
	    		}
	    	}
	    }
	}else{
	    var defaultSortName = ""; //No I18N
	    var defaultSortOrder = "asc"; //No I18N
	    var rowNumNeeded = false;
	    var minRowsPerPage =(jsonData != undefined) ? jsonData.length : 10;
	    if(defaultOptions.rows != undefined){
	    	minRowsPerPage=defaultOptions.rows;
	    }
	    var subGrid = false;
	    var headertitles=false;
	    var gridCallBack;
	    var rownumWidth=25;
	    var lazyLoadParams = {};
	    var isLazyLoadingGrid = false;
	    var setPagerDynamically = false;
	    if (defaultOptions != undefined)
	    {
	        if(defaultOptions.subGrid !== undefined) {
	            subGrid = defaultOptions.subGrid;
	        }
	        if (defaultOptions.sortName != undefined) {
	            defaultSortName = defaultOptions.sortName;
	        }
	        if (defaultOptions.sortOrder != undefined) {
	            defaultSortOrder = defaultOptions.sortOrder;
	        }
	        if (defaultOptions.rowNumNeeded != undefined) {
	            rowNumNeeded = defaultOptions.rowNumNeeded;
	            rownumWidth = 80;
	        }
	        /*if (defaultOptions.minRowsPerPage != undefined) {
	            minRowsPerPage = defaultOptions.minRowsPerPage;
	        }*/
	        if(defaultOptions.headertitles!==undefined) {
	            headertitles=defaultOptions.headertitles
	        }
	        if(defaultOptions.gridCallBack !== undefined){
	            gridCallBack=defaultOptions.gridCallBack;
	        }
			if(defaultOptions.lazyLoadParams !== undefined) {
				lazyLoadParams = defaultOptions.lazyLoadParams;
				isLazyLoadingGrid = true;
			}
	    }
	    var grid = $(gridTable);
	    var gridDivId = "#gbox_"; //No I18N
	    var gridTableIdAlone = gridTable.substring(1);
	    gridDivId = gridDivId+gridTableIdAlone;
	    var gridDiv = $(gridDivId);

	    if (gridDiv.length > 0) {
	        grid.jqGrid('clearGridData'); //No I18N
	        grid.jqGrid('setGridParam', { datatype: "jsonstring", datastr: jsonData}); //No I18N
	        grid.trigger('reloadGrid'); //No I18N
	    }
	    else
	    {

	        var gridviewVal = false;
	        grid.jqGrid(
	        {
	            colNames: escapeGridColumnNames(colNamesList),
	            colModel: colModelList,
	            datatype: "jsonstring", //No I18N
	            datastr: jsonData,
	            loadOnce: true,
	            headertitles:headertitles,
	            jsonReader: { root: function (obj) { return obj; }, repeatitems: false },
	            rownumbers: rowNumNeeded,
	            rowNum: minRowsPerPage,
	            rownumWidth:rownumWidth, //minor ui issue in number column width
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
					    	var currentDataset = Math.ceil(page/lazyLoadParams.pagesPerDataset);
					    	if(currentDataset===3)
					    	{
					    		if(lazyLoadParams.totalDataset>=(lazyLoadParams.datasetIndex+1))
					    		{
					    			lazyLoadParams.datasetIndex++;
					    			lazyLoadParams.data.splice(0,lazyLoadParams.fetchRows);
						    		var params = {
						    			page:lazyLoadParams.datasetIndex,
						    			rows:lazyLoadParams.viewRecords,
						    			totalrows:lazyLoadParams.fetchRows,
						    			records:lazyLoadParams.totalRecords
						    		}
						    		if(lazyLoadParams.apiParams!==undefined){
						    			lazyLoadParams.apiParams
						    			params = $.extend({},params,lazyLoadParams.apiParams);
						    		}
						    		var jsonResponse = opm_ajaxGetResponse(lazyLoadParams.apiUrl,params);
	       							lazyLoadParams.data = lazyLoadParams.data.concat(jsonResponse.rows);
	       							$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
								        datatype: 'local',//No I18N
								        data: lazyLoadParams.data,
								        page: lazyLoadParams.pagesPerDataset+1
								    });
					    		}
					    	}
					    	if(currentDataset===1)
					    	{
					    		if(lazyLoadParams.datasetIndex>3)
					    		{
					    			lazyLoadParams.datasetIndex--;
					    			lazyLoadParams.data.splice(2*lazyLoadParams.fetchRows,lazyLoadParams.fetchRows);
						    		var params = {
						    			page:lazyLoadParams.datasetIndex-2,
						    			rows:lazyLoadParams.viewRecords,
						    			totalrows:lazyLoadParams.fetchRows,
						    			records:lazyLoadParams.totalRecords
						    		}
						    		if(lazyLoadParams.apiParams!==undefined){
						    			lazyLoadParams.apiParams
						    			params = $.extend({},params,lazyLoadParams.apiParams);
						    		}
						    		var jsonResponse = opm_ajaxGetResponse(lazyLoadParams.apiUrl,params);
	       							lazyLoadParams.data = jsonResponse.rows.concat(lazyLoadParams.data);
	       							$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
								        datatype: 'local',//No I18N
								        data:lazyLoadParams.data,
								        page:lazyLoadParams.pagesPerDataset+1
								    });
					    		}
					    	}
				    	}
				    }
				    return true;
    			},	
	            onSelectAll: function(rowIds, allChecked) {
	            },
	            subGridRowExpanded: function(subgrid_id, row_id)
	            {
	            	
	            },
	            afterInsertRow: function(rowId, rowData, rowElem) {
	            },
	            rowattr: function (rd) {
	            },
	            beforeSelectRow: function(rowId, rowElem) {
	            },
	            onSelectRow: function(id,status) {
	            },
	            onCellSelect: function(row, col, content, event) {
	            },
	            loadComplete: function () {
	            	if($(gridTable).getGridParam("reccount")===0)
					{
						$(gridTable).show().text(Ember.I18n.t('webclient.jqgrid.no.data.found')); //No I18n
						$(gridTable).addClass("gridnodata");
					}
	                if(gridCallBack !== undefined && gridCallBack !== null) {
	                    gridCallBack(gridTableIdAlone);
	                }
	            }
	        });
	    }
	}
	
}

function getFWABarColDetails(widData){
	var colData={"colNameList":[],"colModelList":[]};//No I18N
	var widAddData=widData.widgetAdditionalData;
	var key=widAddData.keyIndex;
	var value=widAddData.valueIndex;
	var maxVal=0;
	if(widAddData.colList != undefined){
		colData.colNameList=widAddData.colList;
	}
	if(widAddData.format != undefined){
		for(var i=0;i<colData.colNameList.length;i++){
			if( i == value){
				colData.colModelList.push({name:''+i+'',name:''+i+'',sortable:true,sorttype:widAddData.format[i], width:280, formatter: fwaappPercentageFormatter});
			}else{
				colData.colModelList.push({name:''+i+'',name:''+i+'',sortable:true,sorttype:widAddData.format[i]});
			}
		}
	}else{
		for(var i=0;i<colData.colNameList.length;i++){
			if( i == value){
				colData.colModelList.push({name:''+i+'',name:''+i+'', width:280, formatter: fwaappPercentageFormatter});
			}else{
				colData.colModelList.push({name:''+i+'',name:''+i+''});
			}
		}
	}
	
	if(colData.colNameList[value].indexOf("%") < 0){
		if(widData.data != undefined){
			$.each(widData.data,function(seriesKey,val)
					{
						var curVal =parseInt(val[value]);
						maxVal = (maxVal > curVal)?(maxVal):(curVal);
					});
		}
		if(widAddData.format != undefined){
			colData.colModelList[value]={name:''+value+'',name:''+value+'', width:280,sortable:true,sorttype:widAddData.format[value], formatter: function(cellValue, options, rowdata, action){
				return fwaBarCountFormatter(cellValue, options, rowdata, action,maxVal);
			}};
		}else{
			colData.colModelList[value]={name:''+value+'',name:''+value+'', width:280, formatter: function(cellValue, options, rowdata, action){
				return fwaBarCountFormatter(cellValue, options, rowdata, action,maxVal);
			}};
		}
		
	}
	
	return colData;
}
function getFWAColModels(colCount,widAdditionalData){
	var colModelList = [];
	for(var i=0;i<colCount;i++){
		if(widAdditionalData != undefined && widAdditionalData.format != undefined){
			if(widAdditionalData != undefined && widAdditionalData.valueIndex != undefined && i == widAdditionalData.valueIndex){
				colModelList.push({name:''+i+'',name:''+i+'', width:300, formatter: fwaappPercentageFormatter,sortable:true,sorttype:widAdditionalData.format[i]});
			}else{
				colModelList.push({name:''+i+'',name:''+i+'',sortable:true,sorttype:widAdditionalData.format[i]});
			}
		}else{
			if(widAdditionalData != undefined && widAdditionalData.valueIndex != undefined && i == widAdditionalData.valueIndex){
				colModelList.push({name:''+i+'',name:''+i+'', width:300, formatter: fwaappPercentageFormatter});
			}else{
				colModelList.push({name:''+i+'',name:''+i+''});
			}
		}
		
	}
	return colModelList;
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
	$("#"+elm).append("<img src='/apiclient/fluidicv2/img/speedo-meter-needle.png' />");//No I18N

	Rotdeg=(180/100)*val;
	Rotdeg='rotate('+Rotdeg+'deg)';//No I18N
	$("#"+elm).find('img').css({transform:Rotdeg});//No I18N


}

function jqGridHTMLEncode(cellValue, options, rowdata, action) {
    return $.jgrid.htmlEncode(cellValue);
}

function fwaAlertListExportPDF(snapId,widData,reqParams){
	if(window.OPM.productName == "Firewall Analyzer"){
		$('.fwaPdfLogo').attr("src","/apiclient/fluidicv2/img/fwa-logo.png");
	}else{
		$('.fwaPdfLogo').attr("src","/apiclient/fluidicv2/img/opmanager_logo_report.gif");
	}
	var widParams ={};
   	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
   	var response=widData;
		var $contentdiv = $("<div class='content singleInvWidget'></div>");
		widParams.widgetElement.append($contentdiv);
		$contentdiv.append("<div class='opm_jqGridUI'><table id='fwalarmList' class='ut ut-Grid'></table></div>");
		var defaultOptions = {};
		defaultOptions.page=reqParams.page;
		defaultOptions.rows=reqParams.rows;
		
		var colNamesList = ['','',Ember.I18n.t("webclient.wf.category.device"),Ember.I18n.t("webclient.map.flash.Tic_Priority"),Ember.I18n.t("webclient.fwa.gen.time"),Ember.I18n.t("webclient.map.flash.DeleteConfirmDialog")+" "+Ember.I18n.t("opstor.inventory.hpmsa2312.owner"),Ember.I18n.t("ncm.acd.Status")]; //No I18N
	    var colModelList = [
	        {name: "alarmType", index: "alarmType",hidden:true,classes:'pointer'}, //No I18n
	        {name: "entity", index: "entity",hidden:true,classes:'pointer'}, //No I18n
	        {name: "Device", index: "Device",classes:'pointer'},//No I18n
	        {name: "Priority", index: "Priority",classes:'pointer'}, //No I18n
	        {name: "Generated_Time", index: "Generated_Time",classes:'pointer'}, //No I18n
	        {name: "alertOwner", index: "alertOwner",classes:'pointer'}, //No I18n
	        {name: "Status", index: "Status",classes:'pointer'} //No I18n
	    ];
   	fwa_loadPDFJQgridWithData("#fwalarmList",response.data,colNamesList,colModelList,"","","",defaultOptions,false,reqParams); //No I18n
}


function showObjectDetails(objName,objValue,resourceID,isSRCObj,queryDB,target){
}


function getfwaUnusedObjFormatter(cellValue,unusedCount,usedCount,totalCount){
    var ipUtilization = Math.round(cellValue);
    var lowUtil = 20;
    var highUtil = 80;
    var bgUtil = Math.round((cellValue * 80) / 100);
    var usageColor = "severity_5";//No I18N
    if (cellValue > lowUtil && cellValue <= highUtil) {
        usageColor = "severity_3";//No I18N
    } else if (cellValue > highUtil) {
        usageColor = "severity_1";//No I18N
    }
    var divtitle=Ember.I18n.t('webclient.fwa.used', this)+" : "+usedCount+" | "+Ember.I18n.t('webclient.fwa.policy.unused', this)+" : "+unusedCount+" | "+Ember.I18n.t('opu.views.TOTAL', this)+" : "+totalCount;
    var perClass = (cellValue == 100) ? "redtxt" : "txt"; //No I18N
    var renderString = "<div class='fwaGridDiv' nowrap style='float:left;white-space: nowrap;width:100%' title=\""+divtitle+"\"><div style='margin-top:7px;float:left;padding-top:0px;background-color: #e4e2e5; width:60%;margin-left:10%'><div class=" + usageColor + " style=\"width:" + ipUtilization + "%;height:5px;float:left;\"> </div></div><div nowrap style='float:left;padding-left:10px;' title='"+ bgUtil +"' class='percenTxt'>" + ipUtilization + "%</div></div>"; //No I18N
    return renderString;
}

function getfwaUnusedObjectFormatter(cellValue, options, rowdata, action)
{
	var returxtxt='';
	var unusedsourceCount=(rowdata.unusedSourceCount != undefined) ? rowdata.unusedSourceCount : 0;
	var usedSourceCount=(rowdata.usedSourceCount != undefined) ? rowdata.usedSourceCount : 0;
	var totalSourceCount=(rowdata.totalSourceCount != undefined) ? rowdata.totalSourceCount : 0;
	var percentsource=unusedsourceCount/totalSourceCount*100;
	var returxtxtsource=getfwaUnusedObjFormatter(percentsource,unusedsourceCount,usedSourceCount,totalSourceCount);
	returxtxt+=returxtxtsource;
	
	var unuseddstCount=(rowdata.unusedDestinationCount != undefined) ? rowdata.unusedDestinationCount : 0;
	var usedDestinationCount=(rowdata.usedDestinationCount != undefined) ? rowdata.usedDestinationCount : 0;
	var totaldstCount=(rowdata.totalDestinationCount != undefined) ? rowdata.totalDestinationCount : 0;
	var percentdst=unuseddstCount/totaldstCount*100;
	var returxtxtdst=getfwaUnusedObjFormatter(percentdst,unuseddstCount,usedDestinationCount,totaldstCount);
	returxtxt+=returxtxtdst;
	
	var unusedserviceCount=(rowdata.unusedServiceCount != undefined) ? rowdata.unusedServiceCount : 0;
	var usedserviceCount=(rowdata.usedServiceCount != undefined) ? rowdata.usedServiceCount : 0;
	var totalserviceCount=(rowdata.totalServiceCount != undefined) ? rowdata.totalServiceCount : 0;
	var percentservice=unusedserviceCount/totalserviceCount*100;
	var returxtxtservice=getfwaUnusedObjFormatter(percentservice,unusedserviceCount,usedserviceCount,totalserviceCount);
	returxtxt+=returxtxtservice;
	
	if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
		var unusedappCount=(rowdata.unusedApplicationCount != undefined) ? rowdata.unusedApplicationCount : 0;
		var usedApplicationCount=(rowdata.usedApplicationCount != undefined) ? rowdata.usedApplicationCount : 0;
		var totalAppCount=(rowdata.totalApplicationCount != undefined) ? rowdata.totalApplicationCount : 0;
		var percentapp=unusedappCount/totalAppCount*100;
		var returxtxtapp=getfwaUnusedObjFormatter(percentapp,unusedappCount,usedApplicationCount,totalAppCount);
		returxtxt+=returxtxtapp;
	}
	
	return returxtxt;
}


function unassignedListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(cellValue != undefined && cellValue.length > 0){
		for(var i=0;i<cellValue.length;i++){
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center" class="nolink">'+cellValue[i]+'</span><br/>';
		}
	}else{
		returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}
	return returnTxt;
}
function FWARawSearchReport(snapId,widData,reqParams){
	var response=widData;
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);
	if(reqParams.reportTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf" >'+reqParams.reportTitle+'</div>');
	}
	
	var widElem=$('<div id="widgetElement_10" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widElem.append($contentdiv);
	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");

	var colNamesList = [];
	var colModelList = [];
	if(response.widgetAdditionalData!= undefined && (response.widgetAdditionalData.isTableWidget === true || response.widgetAdditionalData.isTableWidget === "true")){
		var selColList = JSON.parse(reqParams.colModelList); 
		$.each(selColList, function(key,val){
			colNamesList.push(response.widgetAdditionalData.colList[val]);	
			colModelList.push({'name':val,'index':val,sortable:false,sorttype:"text"}); //No I18N
		});
	}else{
		var selColList = JSON.parse(reqParams.colModelList);
		$.each(selColList, function(key,val){
			colNamesList.push(response.AllColumns[val]);	
			colModelList.push({'name':val,'index':val,sortable:false,sorttype:"text"}); //No I18N
		});
	}
	var onSelectFunction;
	var gridData=response.data
	if(response.overall != undefined){
		$.each(response.overall, function(key,val){
			if(val != null && val.length == colModelList.length){
				gridData.push(val);
			}
		});
	}
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams);//NO I18N
}

function fwa_AggSrchRptInxPage(snapId,widData,reqParams,width,height){
	
	var params = reqParams;
	var criteria = JSON.parse(params.criteria);
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	if(params.reportTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf">'+params.reportTitle+'</div>');
	}else{
		$contDiv.append('<div class="fwaHeading_pdf">'+widData.reportTitle+'</div>');
	}
	
    var tableContent='<table><tbody>';
    
    tableContent = tableContent+"<tr><td colspan='2' style='word-break:break-all'><span>"+Ember.I18n.t('webclient.devices.details.devicename',this)+"</span> : "+params.selectedDevices+"</td></tr>";//NO I18N
    tableContent=tableContent+"</tbody>";//No I18N
    if(widData.startTime != undefined && widData.endTime != undefined){
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('widget.col.start.time')+"</span> : "+widData.startTime+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+widData.endTime+"</td></tr></tfoot>";//NO I18N
	}else{
		tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('widget.col.start.time')+"</span> : "+params.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+params.endDate+"</td></tr></tfoot>";//NO I18N
	}
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    var condition = "";//NO I18N      
	if(params.matchStatus == "OR"){ //NO I18N
		condition = Ember.I18n.t("webclient.attacks.criteria.any"); //NO I18N
	}else{
		condition = Ember.I18n.t("webclient.attacks.criteria.all"); //NO I18N
	}
	
	var defTableDiv='<h2 class="fwaSubHeading">'+Ember.I18n.t('criteria',this)+'('+condition+')</h2>';
	defTableDiv=defTableDiv+'<table><thead><tr><th style="width:33%">'+Ember.I18n.t('webclient.devices.fields',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.admin.re.condition',this)+'</th><th style="width:33%">'+Ember.I18n.t('webclient.widget.value',this)+'</th></tr></thead>';//NO I18N
	$.each(criteria, function(index,value) {
		defTableDiv+='<tr><td>'+value.key+'</td><td>'+value.operator+'</td><td>'+value.value+'</td></tr>';//NO I18N
	});
	defTableDiv+='</table>';//NO I18N
	var $deftableTab=$('<div class="fwaTableUi noBorderTheadBottom"></div>');
	$contDiv.append($deftableTab);
	$deftableTab.html(defTableDiv);
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
   
}

function fwa_ruleRecommendation(snapId,widData,reqParams){
	var response=widData;
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	
	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");

	var colNamesList = [Ember.I18n.t('webclient.fwa.rule.recommendation.overly.permissive.rule.name', this),Ember.I18n.t("webclient.fault.details.properties.source", this),Ember.I18n.t("webclient.ipsla.rttDashboard.Destination", this),Ember.I18n.t("webclient.audit.service", this)]; //No I18N
	var colModelList = [
	                    {name: 'rulename', index: 'rulename', sortable: false}, //No I18N
	                    {name: 'suggestSrcObj', index: 'suggestSrcObj', title:false,sortable: false, formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	                    	var text1=''
	                    		jQuery(cell).find('span').each(function(i,e){
	                    			text1+=jQuery(e).text()+"\n";//No I18N
	                    		});
	                    	return text1;
	                    }}, //No I18N
	                    {name: 'suggestDstObj', index: 'suggestDstObj', title:false, sortable: false, formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	                    	var text1=''
	                    		jQuery(cell).find('span').each(function(i,e){
	                    			text1+=jQuery(e).text()+"\n";//No I18N
	                    		});
	                    	return text1;
	                    }}, //No I18N
	                    {name: 'suggestPort', index: 'suggestPort', title:false, sortable: false, formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	                    	var text1=''
	                    		jQuery(cell).find('span').each(function(i,e){
	                    			text1+=jQuery(e).text()+"\n";//No I18N
	                    		});
	                    	return text1;
	                    }}//No I18N
						]
	var onSelectFunction;
	var gridData=response.data
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams);//NO I18N
}

function ruleRecommListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(cellValue != undefined && cellValue.length > 0){
		for(var i=0;i<cellValue.length;i++){
			returnTxt+='<span style="display:inline-block;text-align:center" class="nolink">'+cellValue[i]+'</span><br/>';
		}
	}else{
		returnTxt+='<span style="display:inline-block;text-align:center">-</span>';
	}
	return returnTxt;
}

function fwa_policyFineTuningDetails(snapId,widData,reqParams){
	var jsonData = {};
	jsonData.data=widData;
	var widParams ={};
//	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
//	var $contentdiv = $("<div class='content graphWidget'></div>");
//	widParams.widgetElement.append($contentdiv);
//	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
//	$contentdiv.append("<div id='policyFineTuneTables'><div class='opmFormRow' style='font-weight: bold;position: relative;top: 25px;'>"+Ember.I18n.t('webclient.fwa.policy.fine.tuned.rule')+"</div><div class='opm_jqGridUI'><table id='policyFineTuneList1' class='ut ut-Grid'></table></div><div class='opmFormRow' style='font-weight: bold;position: relative;top: 25px;'>"+Ember.I18n.t('webclient.map.sort.details')+"</div><div class='opm_jqGridUI'><table id='policyFineTuneList2' class='ut ut-Grid'></table></div></div><div style='display: none;'><div style='padding-top: 50px;text-align: center;' id='RuleNotSuppPolicyFineTuningMsg'></div></div>");
	var index =0;
	var ruleNameList = JSON.parse(reqParams.rulename);
	for(var i=0;i<ruleNameList.length;i++){
		if(widData[ruleNameList[i]] != undefined && widData[ruleNameList[i]].data != undefined){
			fwa_loadPolicyTuningWidget(i,ruleNameList[i],widData[ruleNameList[i]],reqParams);
		}
	}
}

function fwa_loadPolicyTuningWidget(i,ruleName,ruleDetail,reqParams){
	var jsonData= {}
	jsonData.data = ruleDetail;
	
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.admin.alarmesc.ruleTitle")+' : '+ruleName+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);
	
	var tableContent='<table><tbody>';
	
    if(ruleDetail.startDate != undefined && ruleDetail.endDate != undefined) {
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+ruleDetail.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+ruleDetail.endDate+"</td></tr></tfoot>";//NO I18N
    }	
	tableContent=tableContent+"</tbody>";//No I18N
	
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contentdiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    $contentdiv.append("<div><div class='opmFormRow' style='font-weight: bold;position: relative;top: 25px;'>"+Ember.I18n.t('webclient.fwa.ruleadmin.details.rule')+"</div><div class='opm_jqGridUI'><table id='policyFineTuneList3_"+i+"' class='ut ut-Grid'></table></div></div>");
    var colNames =[Ember.I18n.t('jsp.commonstr.RuleName',this),Ember.I18n.t('webclient.fault.event.displayName',this),Ember.I18n.t('webclient.ipsla.rttDashboard.Destination',this),Ember.I18n.t('nfa.apm.service',this),Ember.I18n.t('webclient.admin.traps.action',this)];//No I18N
    var colModel =[
      { name: 'ruleName', index: 'ruleName',hidden:true},//NO I18N
      { name: 'source', index: 'source',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
        	var text1=''
        		jQuery(cell).find('span').each(function(i,e){
        			text1+=jQuery(e).text()+"\n";//No I18N
        		});
        	return text1;
          }}, 
      { name: 'destination', index: 'destination',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
        	var text1=''
        		jQuery(cell).find('span').each(function(i,e){
        			text1+=jQuery(e).text()+"\n";//No I18N
        		});
        	return text1;
          }},
      { name: 'service', index: 'service',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
        	var text1=''
        		jQuery(cell).find('span').each(function(i,e){
        			text1+=jQuery(e).text()+"\n";//No I18N
        		});
        	return text1;
          }},
      { name: 'action',index:'action',formatter:function setPolicyRuleStatus(cellValue, options, rowdata, action){//No I18N
			var logTitle=Ember.I18n.t("webclient.fwa.policy.allow",this);//NO I18N
			if(cellValue!=null && cellValue== 'deny'){
				logTitle=Ember.I18n.t("deny",this);//NO I18N
			}	
			return logTitle;
		}}
      ];
    if(reqParams.vendorName == "Paloalto"){
    	colNames.splice(3, 0, Ember.I18n.t('webclient.snapshot.application',this)); //No I18N
    	var applc = { name: 'application', index: 'application',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
        	var text1=''
        		jQuery(cell).find('span').each(function(i,e){
        			text1+=jQuery(e).text()+"\n";//No I18N
        		});
        	return text1;
        }}
    	colModel.splice(3, 0, applc);
    }
    var ruleData = (ruleDetail.ruleDetail != undefined) ? ruleDetail.ruleDetail : [];
    fwa_loadPDFJQgridWithData('#policyFineTuneList3_'+i,ruleData,colNames,colModel,"","","","",false,reqParams);//NO I18N
    
	if(jsonData.data != undefined && jsonData.data != undefined && jsonData.data.data != undefined && jsonData.data.data.explainTable != undefined && jsonData.data.data.fineTuneData != undefined){
		$contentdiv.append("<div id='policyFineTuneTables'><div class='opmFormRow' style='font-weight: bold;position: relative;top: 25px;'>"+Ember.I18n.t('webclient.fwa.policy.fine.tuned.rule')+"</div><div class='opm_jqGridUI'><table id='policyFineTuneList1_"+i+"' class='ut ut-Grid'></table></div><div class='opmFormRow' style='font-weight: bold;position: relative;top: 25px;'>"+Ember.I18n.t('webclient.map.sort.details')+"</div><div class='opm_jqGridUI'><table id='policyFineTuneList2_"+i+"' class='ut ut-Grid'></table></div></div>");
		var resp = jsonData.data.data.fineTuneData;
		var resp1 = jsonData.data.data.explainTable;
	    var colNames =[Ember.I18n.t('webclient.fault.event.displayName',this),Ember.I18n.t('webclient.ipsla.rttDashboard.Destination',this),Ember.I18n.t('nfa.apm.service',this)];//No I18N
	    var colModel =[
	      { name: 'usedsrc', index: 'usedsrc',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	      	var text1=''
	    		jQuery(cell).find('span').each(function(i,e){
	    			text1+=jQuery(e).text()+"\n";//No I18N
	    		});
	    	return text1;
	      }}, //No I18N
	      { name: 'useddst', index: 'useddst',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	      	var text1=''
	    		jQuery(cell).find('span').each(function(i,e){
	    			text1+=jQuery(e).text()+"\n";//No I18N
	    		});
	    	return text1;
	      }}, //No I18N
	      { name: 'usedser', index: 'usedser',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	      	var text1=''
	    		jQuery(cell).find('span').each(function(i,e){
	    			text1+=jQuery(e).text()+"\n";//No I18N
	    		});
	    	return text1;
	      }} //No I18N
	      ];
	    if(reqParams.vendorName == "Paloalto"){
	    	colNames.splice(3, 0, Ember.I18n.t('webclient.snapshot.application',this)); //No I18N
	    	var applc = { name: 'usedapp', index: 'usedapp',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	        		jQuery(cell).find('span').each(function(i,e){
	        			text1+=jQuery(e).text()+"\n";//No I18N
	        		});
	        	return text1;
	        }}
	    	colModel.splice(3, 0, applc);
	    }
	    fwa_loadPDFJQgridWithData('#policyFineTuneList1_'+i,resp,colNames,colModel,"","","","",false,reqParams);//NO I18N
	    
	    var colNames1 =["",Ember.I18n.t('webclient.fwa.policy.fine.tune.existing.config',this),Ember.I18n.t("webclient.fwa.policy.fine.tune.used.object",this),Ember.I18n.t('webclient.fwa.policy.fine.tune.unused.object',this)];//No I18N
	    var colModel1 =[
	      { name: 'header', index: 'header'}, //No I18N
	      { name: 'exist', index: 'exist',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	      	var text1=''
	    		jQuery(cell).find('span').each(function(i,e){
	    			text1+=jQuery(e).text()+"\n";//No I18N
	    		});
	    	return text1;
	      }}, //No I18N
	      { name: 'used', index: 'used',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	      		jQuery(cell).find('span').each(function(i,e){
	      			text1+=jQuery(e).text()+"\n";//No I18N
	      		});
	      	return text1;
	        }},
	      { name: 'unused', index: 'unused',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	      	var text1=''
	    		jQuery(cell).find('span').each(function(i,e){
	    			text1+=jQuery(e).text()+"\n";//No I18N
	    		});
	    	return text1;
	      }} //No I18N
	      ];
	    fwa_loadPDFJQgridWithData('#policyFineTuneList2_'+i,resp1,colNames1,colModel1,"","","","",false,reqParams);//NO I18N
	}else if(jsonData.data != undefined && jsonData.data.data != undefined && jsonData.data.data.msg != undefined){
		$contentdiv.append("<div class='infoBoxBlue' style='margin-top:50px'><p class='infoIcon'>"+jsonData.data.data.msg+"</p></div>");
	}
}

function fwa_drawFWAObjUsageSingleWidget(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	drawFwaObjUsageRepWidget(snapId,widData,reqParams,widParams);
}

function drawFwaObjUsageRepWidget(snapId,widData,reqParams,widParams,isMultiWidget){
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$("#widgetElement_"+snapId).append($contentdiv);
	var response=widData;
	if(widData !=undefined && widData.dispName != undefined && isMultiWidget){
		$('#widgetHeader_'+snapId).html(widData.dispName);
	}
	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	if(reqParams != undefined){
		if(reqParams.rowCount == "15" || reqParams.rowCount == "20" || parseInt(reqParams.rowCount) > 20 ){
			if(jsonResp.WidgetType != undefined){
				$("#perfrmGraph1"+snapId).hide();
			}
		}
	}
	

	var id1='perfrmGraph1'+snapId;//NO I18N
	var xtype;
	var chartType;
	var fwaChartData;
	var columnname1;
	var columnname2;
	var vertical=true;
	var stacked=false;
	if(response.widgetData === undefined){
		$("#perfrmGraph1"+snapId).hide();
	}else if(response.widgetData != undefined)
	{
		if(response.WidgetType != undefined && response.WidgetType == "pie")
		{
			chartType = "pie"; //No I18N
			fwaChartData = response.widgetData.chartData;
		}else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.WidgetType == "verticalbar") //No I18N
		{
			chartType = "bar"; //No I18N
			stacked=true;
			fwaChartData = response.widgetData.chartData;
		}else if(response.widgetAdditionalData != undefined && (response.widgetAdditionalData.chartType == "timeseries" ||response.widgetAdditionalData.chartType == "line" ||response.widgetAdditionalData.chartType == "livexy"))//No I18N
		{ 
			chartType = "line"; //No I18N
			fwaChartData = response.widgetData.chartData;
		}
		else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "stackedArea")
		{
			chartType = "area"; //No I18N
			fwaChartData = response.widgetData.chartData;
			stacked=true;
		}
		else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "multiBar")
		{
			chartType = "bar"; //No I18N
			fwaChartData = response.widgetData.chartData;
		}
		else
		{
			stacked=true;
			chartType = "bar"; //No I18N
			fwaChartData = response.widgetData.chartData;
		}
		if(response.widgetData.xyTitles != undefined)
		{
			columnname1 = response.widgetData.xyTitles[0];
			columnname2 = response.widgetData.xyTitles[1];
		}
		else
		{
			columnname1 = "Time"; //No I18N
			columnname2 = "Flow"; //No I18N
		}
		xtype = "ordinal"; //No I18N
		
		var timeformat=OPMClient.FWAGlobalDataController.timePeriod;
		if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.period != undefined){
			timeformat=response.widgetAdditionalData.period;
		}
		var x_axes = response.widgetData.xyTitles !== undefined ? response.widgetData.xyTitles[0] : "";//No I18N
		var y_axes = response.widgetData.xyTitles !== undefined ? response.widgetData.xyTitles[1] : "";//No I18N
		if(chartType == "pie"){
			 var testObj = {
				        id:id1, //No I18N
				        type:'pie', //No I18N
				        subType:"simplePie", //No I18N
				        customClass:"opm_pie", //No I18N
				        jsonData: fwaChartData,
				        height:350,
				        margin: 30,
				        columns:{
				            datatype_1:'ordinal',  //No I18N
				            datatype_2:'numeric',  //No I18N
				            columnname_1:columnname1, //No I18N
				            columnname_2:columnname2 
				        },
				        legend: {
				            colors:widParams.colorArray,
				            enabled: false
				        },
				        pie:{innerLabel:true},
				        isFWAChart:true
				    }
		}else{
			 var testObj = {
				        id : id1,
				        type : chartType,
				        jsonData : fwaChartData,
				        series : "multi", //No I18N
				        height : 350,
				        columns:{
				        	datatype_1:xtype,
							datatype_2:'numeric',//No I18N
							columnname_1:columnname1,
							columnname_2:columnname2,
							timeFormat:timeformat
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
				        axes:{
	   				        "xaxis": {//No I18N
	   				        		"label": {//No I18N
	   				        			"text":x_axes,//No I18N
	   				        			"fontSize": 13,//No I18N
	   				        		    "fontWeight": 'Bold',//No I18N
		   				        		"fontFamily":"LatoRegular"//No I18N
	   				            	},
	   				             	"ticklabel": {//No I18N
	   				             	"rotation": 45,//No I18N
	   			                    "maxWidth": 75,//No I18N
	   			                    "marginLeft":0,//No I18N
	   			                    "marginRight":0//No I18N
	   				            	}
	   				            	
	   				        	},
	   				     	   "yaxis": [//No I18N
	   				            {"label": {//No I18N
	   				                    "text": y_axes,//No I18N
	   				        			"fontSize": 13,//No I18N
	   				        		    "fontWeight": 'Bold',//No I18N
		   				        		"fontFamily":"LatoRegular"//No I18N
	   				                }
	   				            }
	   				        ]
	   			    	},
				        noDataHandler : {
				            text: Ember.I18n.t('webclient.common.nodata') //No I18N 
				        },
				        chart : {
				            stacked : stacked
				        },
				        isFWAChart:true
				    }
		}
		var arrayObj={
				"placeholder":[],//No I18N
				"chartobj":[]//No I18N
		}
		arrayObj.chartobj.push(testObj);
		arrayObj.placeholder.push(id1);
		zChart(arrayObj);
	}
	if(response.tableData !== undefined){
		var colNamesList = response.colNameList;
		var colModelList = [];
		$.each(response.colModelList, function(key, val){
			var colList={name:val,value:val,sortable:false};//NO I18N
			colModelList.push(colList);
		});
		var gridData=response.tableData;
		fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId, gridData, colNamesList, colModelList, "", "", "", {},false,reqParams);
	}
	
	
}

function fwa_ObjUsageIndexPage(snapId,widData,reqParams){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	if(reqParams.pdfReqFrom == "fwaObjUsageMultiWidget"){
		var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	}else{
		var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	}
	
	$maindiv.append($contDiv);
	
    if(reqParams != undefined && reqParams.reportTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.reportTitle+'</div>')
    }
    
    var tableContent='<table><tbody>';
    var substr = (reqParams.reportSubTitle == undefined) ? "" :"<tr><td colspan='2'>"+ reqParams.reportSubTitle+"</td></tr>"; //NO I18N
    tableContent = tableContent + substr;
    
    if(reqParams.pdfReqFrom == "fwaObjUsageDrillRep" && reqParams.repTitle != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.repTitle+"</td></tr>";//NO I18N
	}
		
    if(reqParams.reportName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.reports.ReportName")+"</span> : "+reqParams.reportName+"</td></tr>";//NO I18N
    }
    if(reqParams.value1 != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.fault.addnotes.device_name")+"</span> : "+reqParams.value1+"</td></tr>";//NO I18N
    }
   
    if(reqParams.rows != undefined && reqParams.page != undefined){
    	var pageCount=parseInt(reqParams.page);
    	var rowCount=parseInt(reqParams.rows);
    	var totRecords=(reqParams.TotalRecords != undefined) ? reqParams.TotalRecords : 0;
		var startIndex=((pageCount-1)*rowCount <= 0) ? 1 : ((pageCount-1)*rowCount);
		if(totRecords != 0){
			var endIndex=((pageCount*rowCount) < totRecords) ? (pageCount*rowCount) : totRecords;
		}else{
			var endIndex=pageCount*rowCount
		}
		tableContent = tableContent+"<tr><td colspan='2'>"+Ember.I18n.t('webclient.fwa.record.count')+" : "+startIndex+" - "+endIndex+"</td></tr>";//NO I18N
	}
    
    var paramsInfoString = fwa_getPDFParamsInfo(reqParams);
    if(paramsInfoString != ''){
    	tableContent = tableContent+"<tr><td colspan='2'>"+paramsInfoString+"</td></tr>";//NO I18N
    }
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(reqParams.value2 != undefined) {
    	tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime')+"</span> : "+reqParams.value2+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+reqParams.value3+"</td></tr></tfoot>";//NO I18N
    }
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    if(reqParams.pdfReqFrom == "fwaObjUsageMultiWidget"){
    	$contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    }else{
    	$contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    }
    
}

function fwa_drawFWAObjUsageMultiiWidget(snapId,widData,reqParams){
	var widParams ={};
	var k = 0;
	$("#widgetElement_"+snapId).remove(); //NO I18N
	if(widData.leftWidget != undefined){
		for(i=0; i<widData.leftWidget.length; i++){
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf" id="widgetHeader_'+i+'"></div>');
			var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			drawFwaObjUsageRepWidget(i,widData.leftWidget[i],reqParams,widParams,true);	
		}
	}
	if(widData.rightWidget != undefined){
		for(j=3; j<6; j++){
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf" id="widgetHeader_'+j+'"></div>');
			var widElem=$('<div id="widgetElement_'+j+'" class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			drawFwaObjUsageRepWidget(j,widData.rightWidget[k],reqParams,widParams,true);
			k++;
		}
	}
}


function fwaObjUsageExpandDrill(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	var response=widData;
				
	$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");

	var colNamesList = [];
	var colModelList = [];
	if(reqParams.type != undefined){
		if(reqParams.type == "Network"){
			if(reqParams.drillRptType == "topRule"){
				colNamesList = [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")]; //No I18N
				colModelList = [{"name":"rule"},{"name":"hits"}]; //No I18N
			}else if(reqParams.drillRptType == "topIP"){ //No I18N
				colNamesList = [Ember.I18n.t("opstor.inventory.ipaddress"), Ember.I18n.t("webclient.fwa.hits")]; //No I18N
				colModelList = [{"name":"rule"},{"name":"hits"}]; //No I18N
			}
		}else if(reqParams.type == "Service"){
			if(reqParams.drillRptType == "topRule"){
				colNamesList = [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")]; //No I18N
				colModelList = [{"name":"rule"},{"name":"hits"}]; //No I18N
			}else if(reqParams.drillRptType == "topPort"){ //No I18N
				colNamesList = [Ember.I18n.t("opu.views.PORT"), Ember.I18n.t("webclient.fwa.hits")]; //No I18N
				colModelList = [{"name":"rule"},{"name":"hits"}]; //No I18N
			}
		}		
	}else{
		colNamesList = widData.colNameList;
		colModelList=getFWAColModels(colNamesList.length);
	}
	
	var onSelectFunction;
	var gridData=response.data;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","",{},false,reqParams);
}

function fwaObjectDetailsIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);

	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.object.details")+'</div>');
	var tableContent='<table><tbody>';


	var deviceName = widData.devicedisplayName != undefined ? widData.devicedisplayName : Ember.I18n.t("webclient.reports.alldevices.id");  //No I18N
	var objType=(reqParams.type == "Network")? Ember.I18n.t("webclient.fwa.network.objects"): ((reqParams.type == "Service") ? Ember.I18n.t("webclient.fwa.service.objects") : reqParams.type);//NO I18N
	var count=widData.records;

	if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
		var devListStr='';
		if(widData.grpDevDetails != undefined){
			for(var ik=0;ik < widData.grpDevDetails.length;ik++){
				if(ik ==0){
					devListStr = widData.grpDevDetails[ik].displayname;
				}else{
					devListStr += " , "+widData.grpDevDetails[ik].displayname;
				}
			}
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.reports.tags.devDispName")+"</span> : "+devListStr+"</td></tr>";//NO I18N
	}else{
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+deviceName+"</td></tr>";//NO I18N
	}

	
	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.fwa.object.type")+"</span> : "+objType+"</td></tr>";//NO I18N
	tableContent = tableContent+"<tr><td colspan='2'><span>Object Count</span> : "+count+"</td></tr>";//NO I18N

	if(tableContent != '<table><tbody></tbody>'){
		tableContent=tableContent+"</table>";
		var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
		$contDiv.append($paramTab);
		$paramTab.html(tableContent);
	}
	$contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
	$contDiv.append('<p class="PDFPrivacyMsgDiv" ><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');

}

function fwaExcludedRuleIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);

	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rulemgmt.excluded.rules.list")+'</div>');
	var tableContent='<table><tbody>';


	var deviceName = reqParams.deviceName != undefined ? reqParams.deviceName : '';  //No I18N
	
	if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
		var devListStr='';
		if(widData.grpDevDetails != undefined){
			for(var ik=0;ik < widData.grpDevDetails.length;ik++){
				if(ik ==0){
					devListStr = widData.grpDevDetails[ik].displayname;
				}else{
					devListStr += " , "+widData.grpDevDetails[ik].displayname;
				}
			}
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.reports.tags.devDispName")+"</span> : "+devListStr+"</td></tr>";//NO I18N
	}else{
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+deviceName+"</td></tr>";//NO I18N
	}


	if(tableContent != '<table><tbody></tbody>'){
		tableContent=tableContent+"</table>";
		var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
		$contDiv.append($paramTab);
		$paramTab.html(tableContent);
	}
	$contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
	$contDiv.append('<p class="PDFPrivacyMsgDiv" ><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');

}


function fwa_RuleApprovalIndexPage(snapId,widData,reqParams,width,height){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.approval.dash")+'</div>');
    var tableContent='<table><tbody>';
    var deviceName = widData.deviceName != undefined ? widData.deviceName : Ember.I18n.t("webclient.reports.alldevices.id");  //No I18N
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t("webclient.reports.tags.devDispName")+"</span> : "+deviceName+"</td></tr>";//NO I18N
	tableContent=tableContent+"</tbody>";//No I18N
	if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
	$contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
   
}

function fwa_DupObjIndexPage(snapId,widData,reqParams){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	
	$maindiv.append($contDiv);
	
    if(reqParams != undefined && reqParams.reportTitle != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.reportTitle+'</div>')
    }
    
    var tableContent='<table><tbody>';
    
    if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title1+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    if(reqParams.group != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title3+"</span> : "+reqParams.value3+"</td></tr>";//NO I18N
    }
    if(reqParams.objType != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.title2+"</span> : "+reqParams.objType+"</td></tr>";//NO I18N
    }
    if(reqParams.rows != undefined && reqParams.page != undefined){
    	var pageCount=parseInt(reqParams.page);
    	var rowCount=parseInt(reqParams.rows);
    	var totRecords=(reqParams.TotalRecords != undefined) ? reqParams.TotalRecords : 0;
		var startIndex=((pageCount-1)*rowCount <= 0) ? 1 : ((pageCount-1)*rowCount);
		if(totRecords != 0){
			var endIndex=((pageCount*rowCount) < totRecords) ? (pageCount*rowCount) : totRecords;
		}else{
			var endIndex=pageCount*rowCount
		}
		tableContent = tableContent+"<tr><td colspan='2'>"+Ember.I18n.t('webclient.fwa.record.count')+" : "+startIndex+" - "+endIndex+"</td></tr>";//NO I18N
	}
    
    tableContent=tableContent+"</tbody>";//No I18N
   
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
}

function fwaDupObjGenerateReport(snapId,widData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var response=widData;
	var $contentdiv = $("<div class='content singleInvWidget'></div>");
	widParams.widgetElement.append($contentdiv);
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_fwa_table"+snapId+"' class='ut ut-Grid'></table></div>");
	
	var map = {};
  	var colNames = ["S.No","Object Name","Rules Associated","Object Details"]; //No I18N
  	var colModels =[];
  	var colhandlemap={"Object Name":0,"Rules Associated":0,"Object Details":0,"S.No":0}; //No I18N

  	grpSetting = function (rowId, val, rawObject, cm) {

  	        var result = '';//NO I18N
  	        if(rawObject.groupingData){
  	        var attr = rawObject.groupingData[cm.name];
  	        if (attr && attr.rowspan) {
  	        result = ' rowspan=' + '"' + attr.rowspan + '"';//NO I18N
  	        colhandlemap[cm.name]= attr.rowspan-1;
  	        }
  	      
  	    } else if(colhandlemap[cm.name] > 0){
  	  result = ' style="display:none;"';//NO I18N
  	colhandlemap[cm.name] =colhandlemap[cm.name] -1;
  	    }
  	        return result;
  	    };

	for( var i=0 ; i<colNames.length; i++){
		colNames[i] = escapeHTML(colNames[i]);
		var row;
		if(colNames[i] == "S.No"){
			row = {name : colNames[i]+'', index : colNames[i]+'',formatter:AdvancedRepFormatter,width:50};
		}
		else if(colNames[i] == "Object Details"){
			row = {name : colNames[i]+'', index : colNames[i]+'',formatter:splitAssociatedRules};
		}else if(colNames[i] == "Rules Associated"){
			row = {name : colNames[i]+'', index : colNames[i]+'',formatter:drillAssociatedRules};
		} 
		else{
			row = {name : colNames[i]+'', index : colNames[i]+'',formatter:AdvancedRepFormatter};	
		}
		row.sortable=false;
		row.cellattr = grpSetting;
        colModels.push(row);
	}
	var tableData;
	if(reqParams.objType === "Network" && reqParams.group == "false"){
		tableData = response.networkObject;
	}else if(reqParams.objType === "Network" && reqParams.group == "true"){ //No I18N
		tableData = response.networkObjectGroup;
	}else if(reqParams.objType === "Service" && reqParams.group == "false"){ //No I18N
		tableData = response.serviceObject;
	}else if(reqParams.objType === "Service" && reqParams.group == "true"){ //No I18N
		tableData = response.serviceObjectGroup;
	}
	
	var defaultOptions = {Search:false,shrinkToFit:false,hideCSV:true,hideExcel:true,sortable:false,"pagination":false,minRowsPerPage:tableData.data.length}; //No I18N	    
	var sendObj = {};
	sendObj.gridId = "opm_fwa_table"+snapId;//No I18N
	sendObj.defaultOptions = defaultOptions;
	fwa_loadPDFJQgridWithData('#'+sendObj.gridId,tableData.data,colNames,colModels,"","","",sendObj.defaultOptions,false,reqParams);
}

function escapeHTML(string) {
	if(string===undefined){
        return "";
    }else{
	var htmlEscaper = /[&<>"'\/]/g;
	return ('' + string).replace(htmlEscaper, function(match) {
		return htmlEscapes[match];
	});
	}
};
function AdvancedRepFormatter(cellValue, options, rowdata, action) {
    if (cellValue === undefined || cellValue === "" || cellValue === "null" || cellValue === "NULL") {
        return "-";//No I18N
    }
    return escapeHTML(cellValue);
}


function splitAssociatedRules(cellValue, options, rowdata, action){
	var rulesList = "";
	for(var i = 0; i < cellValue.length; i++) {
	    rulesList+=cellValue[i]+"<br>";
	}
	return rulesList;
}


function drillAssociatedRules(cellValue, options, rowdata, action){
	if(cellValue === undefined || cellValue === "" || cellValue === "null" || cellValue === "NULL"){
		return '<span>'+Ember.I18n.t("webclient.fwa.duplicate.objects.noruleaccosiate")+'</span>'; //No I18N
	}else{
		var rulesList = "";
		for(var i = 0; i < cellValue.length; i++) {
		    rulesList+=cellValue[i]+"<br>";
		}
		return rulesList;
	}
}

function fwaObjectDetailReport(snapId,widData,reqParams){

	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var widgeType = reqParams.widgeType != undefined ? reqParams.widgeType : "";
	var response=widData;
	
	var $contentdiv2 = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv2);
	snapId = 2;				
	$contentdiv2.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	var colNamesList = ["","",Ember.I18n.t("webclient.fwa.rule.mgmt.object.name"),Ember.I18n.t("webclient.fwa.object.type"),Ember.I18n.t("webclient.map.sort.details"),Ember.I18n.t("webclient.fwa.duplicate.object.associate.rules")];
	
	var colModelList = [
	                     	{ name: 'objID', index: 'objID',hidden:true,hidedlg:true}, //No I18N
	                     	{ name: 'assignedRulesValue', index: 'assignedRulesValue',hidden:true},//NO I18N
	                     	{ name: 'objName', index: 'objName'}, //No I18N
	                     	{ name: 'objType', index: 'objType'}, //No I18N 
	                     	{ name: 'objValue', index: 'objValue'}, //No I18N
	                     	{ name: 'assignedRulesValueTxt', index: 'assignedRulesValueTxt',formatter:fwaObjectRuleAssociationFormatter,search:false}//NO I18N
	                     ]
	if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true)){
		colNamesList.splice(2,0,Ember.I18n.t("webclient.fault.addnotes.device_name",this));//NO I18N
		colModelList.splice(2,0,{ name: "devname", index: "devname"});//No I18N
	}
	gridData=response.data;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams); //No I18N	

}

function fwaExcludedRuleReport(snapId,widData,reqParams){

	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var widgeType = reqParams.widgeType != undefined ? reqParams.widgeType : "";
	var response=widData;
	
	var $contentdiv2 = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv2);
	snapId = 2;				
	$contentdiv2.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	
	var colNamesList = ['','','','',Ember.I18n.t("webclient.fault.addnotes.device_name",this),Ember.I18n.t("webclient.inventory.policyname",this),Ember.I18n.t("webclient.fwa.rule.num.id",this), Ember.I18n.t("webclient.fault.event.displayName",this), Ember.I18n.t("NFAWidget.Dst",this), Ember.I18n.t("webclient.WAN.SourceInterface",this),Ember.I18n.t("fwa.webclient.destination.interface",this),Ember.I18n.t("NFAWidget.App",this),Ember.I18n.t("fwa.rule.service",this),Ember.I18n.t("webclient.admin.traps.action",this),Ember.I18n.t("webclient.fwa.rulemgmt.exclude.by",this),Ember.I18n.t("webclient.fwa.rulemgmt.exclude.time",this)];//No I18N                  

	var colModelList = [
	{ name: 'status', index: 'status',search:false,width:40,hidedlg:true,formatter:function setPolicyRuleStatus(cellValue, options, rowdata, action){//No I18N
		var logClass="inactivestatus";//NO I18N
		var logTitle=Ember.I18n.t("webclient.nfa.inventory.inactive",this);//NO I18N
		if(cellValue!=null && cellValue== 'Yes'){
			logClass="activestatus";//NO I18N
			logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
		}	
		return '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
	}}, 
	{ name: 'trackId', index: 'trackId',hidden:true}, //No I18N
	{ name: 'vendorType', index: 'vendorType',hidden:true,hidedlg:true}, //No I18N
	{ name: 'rid', index: 'rid',hidden:true,hidedlg:true}, //No I18N
	{ name: 'devname', index: 'devname',hidden:!reqParams.isDeviceGroup}, //No I18N
	{ name: 'policyName', index: 'policyName'}, //No I18N
	{ name: 'ruleName', index: 'ruleName'}, //No I18N
	{ name: 'rule_src', index: 'rule_src',formatter:excludeoverListObjectDetailFormatter}, //No I18N
	{ name: 'rule_dst', index: 'rule_dst',formatter:excludeoverListObjectDetailFormatter}, //No I18N
	{ name: 'src_int', index: 'src_int'}, //No I18N
	{ name: 'dst_int', index: 'dst_int'}, //No I18N
	{ name: 'application', index: 'application',formatter:excludeoverListObjectDetailFormatter,hidden:true}, //No I18N
	{ name: 'service', index: 'service',formatter:excludeoverListObjectDetailFormatter}, //No I18N
	{ name: 'action',index:'action',search:false,hidedlg:true},//No I18N
	{ name: 'excludedBy', index: 'excludedBy'}, //No I18N
	{ name: 'excludedTime', index: 'excludedTime'} //No I18N
	];
	gridData=response.data;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams); //No I18N	

}

function fwaObjectRuleAssociationFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(rowdata.assignedRulesValue != '-'){
		var tem = $.parseJSON(rowdata.assignedRulesValue);
		if(tem != undefined && tem.length > 0){
			for(var i=0;i<tem.length;i++){
				var disTxt=(tem[i].policyName != undefined ) ? tem[i].ruleName+" ("+tem[i].policyName+")": tem[i].ruleName;
				returnTxt+='<a style="display:inline-block;width:100%;text-align:center;"  >'+disTxt+'</a><br/>';
			}
		}else{
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
		}
	}else{
		returnTxt='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}

		
	return returnTxt;
}
function fwaRuleApprovalReport(snapId,widData,reqParams){
	var widParams ={};
	var widgeType = reqParams.widgeType != undefined ? reqParams.widgeType : "";
	var response=widData;
	
	if(widgeType == ""){
		var PendReqCount=0;
		var ApprReqCount=0;
		var RejeReqCount=0;
		$.each(response.resourceDet, function(k,val){
			PendReqCount=PendReqCount+(val.pending != undefined ? val.pending : 0);
			ApprReqCount=ApprReqCount+(val.approved != undefined ? val.approved : 0);
			RejeReqCount=RejeReqCount+(val.rejected != undefined ? val.rejected : 0);
		});
		var totCount=PendReqCount+ApprReqCount+RejeReqCount;
		var $totdiv = $("<div class='grid-col-3' style='padding-left:0px !important;padding-right:0px !important'><div class='ncmFirVulnInfoBox ncmFirVulnInfoBox__small iconTotalVulnerabilities'><i class='icon-svg-TotalRequest'></i><div class='count' id='TotalReqCount'>"+totCount+"</div><div class='desc'>"+Ember.I18n.t("webclient.fwa.rule.approval.total.request")+"</div></div></div>");
		var $pendiv = $("<div class='grid-col-3' style='padding-left:20px !important;padding-right:0px !important'><div class='ncmFirVulnInfoBox ncmFirVulnInfoBox__small iconCriticalVulnerabilies'><i class='icon-svg-PendingRequest'></i><div class='count' id='PendingReqCount'>"+PendReqCount+"</div><div class='desc'>"+Ember.I18n.t("jsp.report.ReportConstruction.PendingRequest")+"</div></div></div>");
		var $appdiv = $("<div class='grid-col-3' style='padding-left:20px !important;padding-right:0px !important'><div class='ncmFirVulnInfoBox ncmFirVulnInfoBox__small iconTotalVulnerabilities'><i class='icon-svg-ApprovedRequest'></i><div class='count' id='ApprovedReqCount'>"+ApprReqCount+"</div><div class='desc'>"+Ember.I18n.t("jsp.report.ReportConstruction.ApprovedRequest")+"</div></div></div>");
		var $rejdiv = $("<div class='grid-col-3' style='padding-left:20px !important;padding-right:0px !important'><div class='ncmFirVulnInfoBox ncmFirVulnInfoBox__small iconCriticalVulnerabilies'><i class='icon-svg-RejectedRequest'></i><div class='count' id='RejectedReqCount'>"+RejeReqCount+"</div><div class='desc'>"+Ember.I18n.t("jsp.report.ReportConstruction.RejectedRequest")+"</div></div></div>");
		var $gridRow=$("<div class='grid-row sm'></div>");
		$gridRow.append($totdiv);
		$gridRow.append($pendiv);
		$gridRow.append($appdiv);
		$gridRow.append($rejdiv);
		var $gridCont=$("<div class='grid-container' style='padding-left: 0px;padding-right:0px'></div>");
		$gridCont.append($gridRow);
		var $contentdiv2 = $("<div class='vulnerabilitiesTopInfo ruleDashboard' style='border:0px;padding-top:20px'></div>");
		$contentdiv2.append($gridCont);
		$("#widgetElement_"+snapId).append($contentdiv2);
	}
	
	if(widgeType == "" || widgeType == "deviceReport"){
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.approval.device.specific")+'</div>');
		var widElem=$('<div id="widgetElement_100" class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv2 = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv2);
		snapId = 2;				
		$contentdiv2.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
		
		var colNamesList = [Ember.I18n.t("webclient.map.bulkCredentialTest.credentialName"),Ember.I18n.t("webclient.discovery.pending"),Ember.I18n.t("webclient.network.discovery.approved"),Ember.I18n.t("webclient.fwa.rule.approval.rejected")];//NO I18N
		var colModelList = [
		                       {name: 'displayName', index: 'displayName'}, //No I18N
		                       {name: 'pending', index: 'pending'}, //No I18N
		                       {name: 'approved', index: 'approved'}, //No I18N
		                       {name: 'rejected', index: 'rejected'} //No I18N
		                     ];
		gridData=[];
		$.each(response.resourceDet, function(k,val){
			val.displayName=k;
			gridData.push(val);
		});
		fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams); //No I18N	
	}
	
	if(widgeType == "" || widgeType == "userReport"){
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.rule.approval.user.specific")+'</div>');
		var widElem=$('<div id="widgetElement_100" class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv);
		snapId = 1;				
		$contentdiv.append("<div id='perfrmGraph1"+snapId+"'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
		if(response.userGridData != undefined)
		{
			var jsonData = response;
			var fwaChartData=[];
			var pendingMap={"data":[],"seriesname":"Pending"};//NO I18N
			var approveMap={"data":[],"seriesname":"Approved"};//NO I18N
			var rejectedMap={"data":[],"seriesname":"Rejected"};//NO I18N
			$.each(response.userGridData, function(k,val){
				var tempArr=[k,val.pending];
				pendingMap.data.push(tempArr);
				tempArr=[k,val.approved];
				approveMap.data.push(tempArr);
				tempArr=[k,val.rejected];
				rejectedMap.data.push(tempArr);
			});
			fwaChartData.push(pendingMap);
			fwaChartData.push(approveMap);
			fwaChartData.push(rejectedMap);
			var chartType="bar";//NO I18N
			var columnname1 = "UserName";//NO I18N
			var columnname2 = "Count";//NO I18N
			var vertical=false;
			var stacked=true;
			var x_axes = "UserName";//NO I18N
			var y_axes = "Count";//NO I18N

			var testObj = 
			{
					id:"perfrmGraph1"+snapId,//No I18N
					type:chartType,
					jsonData:fwaChartData,
					series:"multi",//No I18N
					height:400,
					columns:{
						datatype_1:'ordinal',//No I18N
						datatype_2:'numeric',//No I18N
						columnname_1:columnname1,
						columnname_2:columnname2
					},
					tooltip:[0,1],
					canvas:
					{
						title:
						{
							show:false,
							text:""
						}
					},
					chart:{
						stacked:stacked
					},
					area:{
						marker:true
					},
					legend:{
						"enabled":true,//No I18N
						"fontSize": 10,//No I18N
						"itemHeight": "20"//No I18N
					},
					bar:{
						rotated:false,
						levelMarker:false
					},
					axes:{
						"xaxis": {//No I18N
							"label": {//No I18N
								"text":x_axes,//No I18N
								"fontSize": 13,//No I18N
								"fontWeight": 'Bold',//No I18N
								"fontFamily":"LatoRegular"//No I18N
							},
							"ticklabel": {//No I18N
								"rotation": 45,//No I18N
								"maxWidth": 75,//No I18N
								"marginLeft":0,//No I18N
								"marginRight":0//No I18N
							}

						},
						"yaxis": [//No I18N
						          {"label": {//No I18N
						        	  "text": y_axes,//No I18N
						        	  "fontSize": 13,//No I18N
						        	  "fontWeight": 'Bold',//No I18N
						        	  "fontFamily":"LatoRegular"//No I18N
						          }
						          }
						          ]
					},
					isFWAChart:true
			}
			
			testObj.legend.hAlign="center";//No I18N
			testObj.legend.vAlign="bottom";//No I18N

			var arraObject={
					"placeholder":[],//No I18N
					"chartobj":[]//No I18N
			}
			if(fwaChartData.length > 10){
				$('#perfrmGraph1'+snapId).hide();
			}else{
				$('#perfrmGraph1'+snapId).show();
				arraObject.chartobj.push(testObj);
				arraObject.placeholder.push("perfrmGraph1"+snapId);
				zChart(arraObject);
			}
		}	

		var userArr=[];
		$.each(response.userGridData, function(k,val){
			val.displayName=k;
			userArr.push(val);
		});
		var colNamesList = [Ember.I18n.t("webclient.admin.users.username"),Ember.I18n.t("webclient.discovery.pending"),Ember.I18n.t("webclient.network.discovery.approved"),Ember.I18n.t("webclient.fwa.rule.approval.rejected")];//NO I18N
		var colModelList = [
		                       {name: 'displayName', index: 'displayName'}, //No I18N
		                       {name: 'pending', index: 'pending'}, //No I18N
		                       {name: 'approved', index: 'approved'}, //No I18N
		                       {name: 'rejected', index: 'rejected'} //No I18N
		                     ];
		var gridData=userArr;
		fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNamesList,colModelList,"","","","",false,reqParams); //No I18N	
		
	}
	
}

function fwaRiskTrendIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	
	if(reqParams != undefined){
		if(reqParams.type === "severity"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.risk.analysis.report")+'</div>')	
		}else if(reqParams.type === "trend"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.risk.trend.report")+'</div>')	
		}
    }
    
    var tableContent='<table><tbody>';
   
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
	if(reqParams.riskProfileName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.risk.profile.name',this)+"</span> : "+reqParams.riskProfileName+"</td></tr>";//NO I18N
	}
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $("#widgetElement_"+snapId).append('<div class="content graphWidget">');
    $(".graphWidget").append("<div id='perfGraph1"+snapId+"'></div>");
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}
function fwaRuleChangeCompleteIndexPage(snapId,widData,reqParams,width,height){

	var resDetail=widData.resourceDetails;
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.fwa.ruletrack.history',this)+'</div>')
    
    var tableContent='<table><tbody>';
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+resDetail.displayname+"</td></tr>";//NO I18N
   
	if((reqParams.DateRange == false || reqParams.DateRange == "false") && reqParams.timeFrame != undefined){
		var strTimeFrame=Ember.I18n.t('webclient.reports.timeframe.today',this);//NO I18N
		if(reqParams.timeFrame == "24Hour"){
			strTimeFrame=Ember.I18n.t('webclient.reports.timeframe.last24hrs',this);//NO I18N
		}else if(reqParams.timeFrame == "7Days"){//NO I18N
			strTimeFrame=Ember.I18n.t('webclient.reports.timeframe.last7days',this);//NO I18N
		}else if(reqParams.timeFrame == "30Days"){//NO I18N
			strTimeFrame=Ember.I18n.t('webclient.reports.timeframe.last30days',this);//NO I18N
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.vimonitor.devices.overview.TimePeriod',this)+"</span> : "+strTimeFrame+"</td></tr>";//NO I18N
    }else if(reqParams.startDate != undefined){
    	tableContent = tableContent+"<tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime',this)+"</span> : "+reqParams.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime',this)+"</span> : "+reqParams.endDate+"</td></tr>";//NO I18N
    }
    
	if(reqParams.versionno != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('ncm.acd.Version_No',this)+"</span> : "+reqParams.versionno+"</td></tr>";//NO I18N
	}
	if(reqParams.sortType != undefined){
		var sortStr=(reqParams.sortType == "time") ? Ember.I18n.t('webclient.admin.schedulereports.time',this) : Ember.I18n.t('jsp.commonstr.RuleName',this);//NO I18N
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.maptab.sortby',this)+"</span> : "+sortStr+"</td></tr>";//NO I18N
	}
    
	if(reqParams.status != undefined){
		var statusStr=[];
		if(reqParams.status.indexOf(1) >= 0){
			statusStr.push(Ember.I18n.t('added',this));
		}
		if(reqParams.status.indexOf(2) >= 0){
			statusStr.push(Ember.I18n.t('modified',this));
		}
		if(reqParams.status.indexOf(3) >= 0){
			statusStr.push(Ember.I18n.t('deleted',this));
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.common.widgets.showonly',this)+"</span> : "+statusStr.join(',')+"</td></tr>";//NO I18N
	}
	
    tableContent=tableContent+"</tbody>";//No I18N
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    

}

function fwaRuleChangeAllIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.fwa.change.rule.changes',this)+'</div>')
    
    var tableContent='<table><tbody>';
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.displayName+"</td></tr>";//NO I18N
   
	if(reqParams.DateRange == false || reqParams.DateRange == "false"){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.vimonitor.devices.overview.TimePeriod',this)+"</span> : "+reqParams.timeFrame+"</td></tr>";//NO I18N
    }else{
    	tableContent = tableContent+"<tr><td><span>"+Ember.I18n.t('webclient.devices.details.starttime',this)+"</span> : "+reqParams.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime',this)+"</span> : "+reqParams.endDate+"</td></tr>";//NO I18N
    }
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwaRuleChangeIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf"></div>');
	$maindiv.append($contDiv);
	
	if(reqParams != undefined){
		if(reqParams.type === "latest"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header1")+'</div>')	
		}else if(reqParams.type === "user"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header2")+'</div>')	
		}else if(reqParams.type === "statsTrend"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header3")+'</div>')	
		}else if(reqParams.type === "totalTrend"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header4")+'</div>')	
		}else if(reqParams.type === "table"){
			$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header5")+'</div>')	
		}
    }
    
    var tableContent='<table><tbody>';
   
    if(reqParams.displayName != undefined) {
    	 tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name',this)+"</span> : "+reqParams.displayName+"</td></tr>";//NO I18N
    }
    if(reqParams.DateRange == false || reqParams.DateRange == "false"){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.vimonitor.devices.overview.TimePeriod',this)+"</span> : "+reqParams.timeFrame+"</td></tr>";//NO I18N
    }else{
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.devices.details.starttime',this)+"</span> : "+reqParams.startDate+"</td></tr>";//NO I18N
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.devices.details.endtime',this)+"</span> : "+reqParams.endDate+"</td></tr>";//NO I18N
    }
    
    
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>');
    $("#widgetElement_"+snapId).append('<div class="content graphWidget">');
    $(".graphWidget").append("<div id='perfGraph1"+snapId+"'></div>");
    $contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwaRuleChangeCompleteReport(snapId,widData,reqParams){
	var response = widData;
	
	var i=1;
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;margin-top:10px"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.ruletrack.history")+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);
	
	var $fwaRuleTrackHistListAccordian = $("<div class='accordion1 multiView arrowRight arrowSolid rule-change-history' id='fwaRuleTrackHistListAccordian'></div>");
	var $ulElement=$("<ul></ul>");
	var gridData=(widData != undefined && widData.griddata != undefined) ? widData.griddata : [];
	for(var i=0;i<gridData.length;i++){
		var widgetStr="<li style='border:0.5px solid #ddd;' class='ruleChangeHistoryLi'>";
		widgetStr = widgetStr +loadRuleChangeWidgetHeaderDetails(gridData[i]);
		widgetStr = widgetStr +loadRuleChangeWidgetDetails(gridData[i],widData.i18nfields);
		widgetStr = widgetStr+"</li>";
		$ulElement.append($(widgetStr));
	}
	
	$fwaRuleTrackHistListAccordian.append($ulElement);
	$contentdiv.append($fwaRuleTrackHistListAccordian);
}

function loadRuleChangeWidgetDetails(widgetObj,i18nfields){
	var widgetStr='<div class="accordion1__cont pageBreak"><div class="rule-change-history__table"><table style="width: 100%;margin-top:0px !important" class="fwaRuleAdminCommandTable mt-lg">';
	var i18nList=['ruleName','policyName','sourceList','destinationList','serviceList','applicationList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
	var i18nMap=[];
	for(var i=0;i<i18nList.length;i++){
		var temp={"key":i18nList[i],"val":i18nfields[i18nList[i]]};
		i18nMap.push(temp);
	}
	var headerList=[];
	var detailMap=[];
	if(widgetObj.CHANGE_TYPE == 2){
		var MODIFIED_FIELDS = JSON.parse(widgetObj.MODIFIED_FIELDS);
		var PREVIOUS_RULE_DETAILS = JSON.parse(widgetObj.PREVIOUS_RULE_DETAILS);
		var RULE_DETAILS = JSON.parse(widgetObj.RULE_DETAILS);
		var detailMap=[];
		var oldRow=[{"className":"","value":Ember.I18n.t('webclient.fwa.ruletrack.old.content',this)}];//NO I18N
		var newRow=[{"className":"","value":Ember.I18n.t('webclient.fwa.ruletrack.new.content',this)}];//NO I18N
		var headerVal=[''];
		
		for(var ij=0;ij<i18nMap.length;ij++){
			var tempmap=i18nMap[ij];
			var key=i18nMap[ij].key;
			var val=i18nMap[ij].val;

			headerVal.push(val);
			var prevValFinal="";
			var currValFinal="";
			var cellClass="";
			if(MODIFIED_FIELDS.indexOf(key) >= 0){
				cellClass="fwaRuleChangeModifiedRow";//NO I18N
			}
			if(PREVIOUS_RULE_DETAILS[key] != undefined){
				var prevVal=PREVIOUS_RULE_DETAILS[key];
				if(prevVal != undefined && Array.isArray(prevVal)){
					var prevValArr=prevVal;
					for(var k=0;k<prevValArr.length;k++){
						if(prevValFinal == ""){
							prevValFinal=prevValArr[k];
						}else{
							prevValFinal=prevValFinal+"</br>"+prevValArr[k];
						}
					}
				}else{
					prevValFinal=(prevVal == undefined ? "" : prevVal);
				}
			}
			oldRow.push({"className":cellClass,"value":prevValFinal});
			if(RULE_DETAILS[key] != undefined){
				var currVal=RULE_DETAILS[key];
				
				if(currVal != undefined && Array.isArray(currVal)){
					var currValArr=currVal;
					for(var k=0;k<currValArr.length;k++){
						if(currValFinal == ""){
							currValFinal=currValArr[k];
						}else{
							currValFinal=currValFinal+"</br>"+currValArr[k];
						}
					}
				}else{
					currValFinal=(currVal == undefined ? "" : currVal);
				}
			}
			newRow.push({"className":cellClass,"value":currValFinal});
		
		}
		detailMap.push(oldRow);
		detailMap.push(newRow);
		headerList = headerVal;
		detailMap = detailMap;
	}else if(widgetObj.CHANGE_TYPE == 3){
		var headerVal=[''];
		var tableVal=[Ember.I18n.t('webclient.fwa.ruletrack.old.content',this)];
		var PREVIOUS_RULE_DETAILS = JSON.parse(widgetObj.PREVIOUS_RULE_DETAILS);
		for(var ij=0;ij<i18nMap.length;ij++){
			var tempmap=i18nMap[ij];
			var key=i18nMap[ij].key;
			var val=i18nMap[ij].val;
			
			headerVal.push(val);
			if(PREVIOUS_RULE_DETAILS[key] != undefined){
				var prevVal=PREVIOUS_RULE_DETAILS[key];
				var prevValFinal="";
				if(prevVal != undefined && Array.isArray(prevVal)){
					var prevValArr=prevVal;
					for(var k=0;k<prevValArr.length;k++){
						if(prevValFinal == ""){
							prevValFinal=prevValArr[k];
						}else{
							prevValFinal=prevValFinal+"</br>"+prevValArr[k];
						}
					}
				}else{
					prevValFinal=(prevVal == undefined ? "" : prevVal);
				}
				tableVal.push(prevValFinal);
			}else{
				tableVal.push("");
			}
		}
		headerList = headerVal;
		detailMap = tableVal;
	}else if(widgetObj.CHANGE_TYPE == 1){
		var headerVal=[''];
		var tableVal=[Ember.I18n.t('webclient.fwa.ruletrack.new.content',this)];
		var RULE_DETAILS = JSON.parse(widgetObj.RULE_DETAILS);
		for(var ij=0;ij<i18nMap.length;ij++){
			var tempmap=i18nMap[ij];
			var key=i18nMap[ij].key;
			var val=i18nMap[ij].val;
			
			headerVal.push(val);
			if(RULE_DETAILS[key] != undefined){
				var currVal=RULE_DETAILS[key];
				var currValFinal="";
				if(currVal != undefined && Array.isArray(currVal)){
					var currValArr=currVal;
					for(var k=0;k<currValArr.length;k++){
						if(currValFinal == ""){
							currValFinal=currValArr[k];
						}else{
							currValFinal=currValFinal+"</br>"+currValArr[k];
						}
					}
				}else{
					currValFinal=(currVal == undefined ? "" : currVal);
				}
				tableVal.push(currValFinal);
			}else{
				tableVal.push("");
			}
		}
		headerList = headerVal;
		detailMap = tableVal;
	}
	
	if(headerList.length > 0){
		widgetStr=widgetStr+'<tr  style="width: 100%; background: #f4f5f6">';
		for(var k=0;k<headerList.length;k++){
			widgetStr = widgetStr + '<td>'+headerList[k]+'</td>';
		}
		widgetStr=widgetStr+'</tr>';
	}
	if(widgetObj.CHANGE_TYPE == 2){
		for(var k=0;k<detailMap.length;k++){
			widgetStr=widgetStr+'<tr>';
			var rowDet=detailMap[k];
			for(var l=0;l<rowDet.length;l++){
				if(rowDet[l].className == undefined){
					widgetStr=widgetStr+'<td>'+rowDet[l].value+'</td>';
				}else{
					widgetStr=widgetStr+'<td class="'+rowDet[l].className+'">'+rowDet[l].value+'</td>';
				}
			}
			widgetStr=widgetStr+'</tr>';
		}
	}else{
		if(widgetObj.CHANGE_TYPE == 1){
			widgetStr=widgetStr+'<tr  class="fwaRuleChangeAddedCol">';
		}else{
			widgetStr=widgetStr+'<tr  class="fwaRuleChangeDeletedCol">';
		}
		for(var k=0;k<detailMap.length;k++){
			widgetStr = widgetStr + '<td>'+detailMap[k]+'</td>';
		}
		widgetStr=widgetStr+'</tr>';
	}
	widgetStr=widgetStr+'</table></div></div>';
	return widgetStr
}
function loadRuleChangeWidgetHeaderDetails(widData){
	var widgetStr="";
	var className = (widData.CHANGE_TYPE == 2 ? "modified" :(widData.CHANGE_TYPE == 1 ? "added": "deleted"));//NO I18N
	var statusTxt = (widData.CHANGE_TYPE == 2 ? Ember.I18n.t('added',this):(widData.CHANGE_TYPE == 1 ? Ember.I18n.t('modified',this): Ember.I18n.t('deleted',this)));//NO I18N
	var modiTxt = (widData.CHANGE_TYPE == 2 ? Ember.I18n.t('webclient.fwa.ruletrack.modified.by',this):(widData.CHANGE_TYPE == 1 ? Ember.I18n.t('webclient.fwa.ruletrack.added.by',this): Ember.I18n.t('webclient.fwa.ruletrack.deleted.by',this)));//NO I18N
	widgetStr='<div class="accordion1__nav">';
	widgetStr=widgetStr+'<div class="rule-change-history__header active '+className+'" >';
	widgetStr=widgetStr+'<div class="">';
	widgetStr=widgetStr+'<div class="rule-change-history__rule">'+Ember.I18n.t('webclient.admin.alarmesc.RuleName',this)+' : <span>'+widData.ruleName+'</span></div>';
	if(widData.policyName != undefined){
		widgetStr=widgetStr+'<div class="rule-change-history__policy">'+Ember.I18n.t('webclient.inventory.policyname',this)+' : <span>'+widData.policyName+'</span></div>';
	}
	widgetStr=widgetStr+'<div class="rule-change-history__status">'+Ember.I18n.t('jsp.commonstr.Status',this)+' : <span>'+statusTxt+'</span></div>';
	widgetStr=widgetStr+'<div class="rule-change-history__modified">'+modiTxt+' : <span>'+widData.updatedBy+'</span></div>';
	widgetStr=widgetStr+'<div class="rule-change-history__updated-time">'+Ember.I18n.t('webclient.fwa.ruletrack.updated.time',this)+' : <span>'+widData.lastUpdatedTime+'</span></div>';                                                                           
                                                                     
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'<div class="">';
	widgetStr=widgetStr+'<div class="rule-change-history__desc">'+widData.description+'</div>  ';   
	
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'</div>';
	return widgetStr;
}

function fwaRuleChangeAllReport(snapId,widData,reqParams){
	var i=100;
	
	//count widget 
	var countData=widData.count;

	var constr='';
	constr='<div class="grid-row mb-none"><div class="grid-col pl-none"><div class="infoMssg rounded info flex-center m-none"><svg class="svgIcon size22 mr-sm"><use xlink:href="../../apiclient/fluidicv2/img/sprite-opm.svg#file-checked"></use></svg><p><span class="bold mr-xs">'+countData.total+'</span>'+Ember.I18n.t("opstor.inventory.lightning.cache.total")+'</p></div></div>';
	constr=constr+'<div class="grid-col"><div class="infoMssg rounded success flex-center m-none"><svg class="svgIcon size22 mr-sm"><use xlink:href="../../apiclient/fluidicv2/img/sprite-opm.svg#file-add"></use></svg><p><span class="bold mr-xs">'+countData.added+'</span>'+Ember.I18n.t("added")+'</p></div></div>';
	constr=constr+'<div class="grid-col"><div class="infoMssg rounded warning flex-center m-none"><svg class="svgIcon size22 mr-sm"><use xlink:href="../../apiclient/fluidicv2/img/sprite-opm.svg#file-edit"></use></svg><p><span class="bold mr-xs">'+countData.modified+'</span>'+Ember.I18n.t("modified")+'</p></div></div>';
	constr=constr+'<div class="grid-col"><div class="infoMssg rounded danger flex-center m-none"><svg class="svgIcon size22 mr-sm"><use xlink:href="../../apiclient/fluidicv2/img/sprite-opm.svg#file-remove"></use></svg><p><span class="bold mr-xs">'+countData.deleted+'</span>'+Ember.I18n.t("deleted")+'</p></div></div></div>';
	var $contDiv = $(constr); 
	$('.mainContent').append($contDiv);	
	
	//latest count widget
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;margin-top:10px"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header1")+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);
	$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
	
	var fwaChartData=[];
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	var latestData=widData.latest;
	if(latestData != undefined){
		fwaChartData.push(["Added",(latestData.addedLatest != undefined ? latestData.addedLatest : 0)]);
		fwaChartData.push(["Modified",(latestData.modifiedLatest != undefined ? latestData.modifiedLatest : 0)]);
		fwaChartData.push(["Deleted",(latestData.deletedLatest != undefined ? latestData.deletedLatest : 0)]);
	}
	var testObj = {
			id:'perfGraph1'+i,//No I18N 
			type: 'pie',//No I18N
			subType: "simpleDonut",//simplePie , semiDount, simpleDonut,gaugeDial,simpleDial//No I18N
			customClass: "opm_pie discoveryStatusDial",//No I18N
			jsonData:fwaChartData,
			height:350,
			columns:{
				datatype_1:"ordinal",//No I18N 
				datatype_2:'numeric',//No I18N
				columnname_1:"Type",//No I18N 
				columnname_2:"Change Count"//No I18N 
			},
			"legend": { //No I18N	
				"enabled":true,//No I18N
				"fontSize": 10,//No I18N
				"itemHeight": "20"//No I18N
			},
			pie:{innerLabel:true},
			legend:{enabled:true,layout:"horizontal",vAlign:"bottom",hAlign:"center","shapes": ["circle"]}//No I18N
	}
	 var colorArray=new Array();
	 colorArray.push("#9dfcc9");
	 colorArray.push("#fac564");
	 colorArray.push("#faa5a5");
	 testObj.legend.colors=colorArray;
	arraObject.chartobj.push(testObj);
	arraObject.placeholder.push('perfGraph1'+i);	
	zChart(arraObject);	
	
	
	//User specific report
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	i++;
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header2")+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);

	$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
	var timeformat=OPMClient.FWAInventoryDateTimeLegends.get("custom");
	if(reqParams.timeFrame != undefined){
		timeformat=OPMClient.FWAInventoryDateTimeLegends.get(reqParams.timeFrame);
	}
	
	var fwaChartData=widData;
	var graphType="bar";//No I18N
	var datatype_1="ordinal";//No I18N
	var datatype_2="numeric";//No I18N
	var colName1=Ember.I18n.t('opu.views.USER_NAME',this);//No I18N
	var colName2=Ember.I18n.t('webclient.common.widgets.eventcount',this);//No I18N
	fwaChartData=((widData.user != undefined && widData.user.gridData != undefined) ? widData.user.gridData: {});
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	var testObj = 
	{
			id:'perfGraph1'+i,//No I18N
			type:graphType,
			jsonData:fwaChartData,
			series:"multi",//No I18N
			height:350,
			columns:{
				datatype_1:datatype_1,
				datatype_2:datatype_2,
				columnname_1:colName1,
				columnname_2:colName2,
				timeFormat:timeformat
			},
			tooltip:[0,1],
			canvas:
			{
				title:
				{
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
				"fontSize": 10,//No I18N
				"itemHeight": "20"//No I18N
			},
			bar:{
				rotated:false,
				levelMarker:false
			},
			axes:{
				"xaxis": {//No I18N
					"label": {//No I18N
						"text":colName1,//No I18N
						"fontSize": 13,//No I18N
						"fontWeight": 'Bold',//No I18N
						"fontFamily":"LatoRegular"//No I18N
					},
					"ticklabel": {//No I18N
						"rotation": 45,//No I18N
						"maxWidth": 75,//No I18N
						"marginLeft":0,//No I18N
						"marginRight":0//No I18N
					}

				},
				"yaxis": [//No I18N
				          {"label": {//No I18N
				        	  "text": colName2,//No I18N
				        	  "fontSize": 13,//No I18N
				        	  "fontWeight": 'Bold',//No I18N
				        	  "fontFamily":"LatoRegular"//No I18N
				          }
				          }
				          ]
			}
	}
	var colorArray=new Array();
	colorArray.push("#9dfcc9");
	colorArray.push("#fac564");
	colorArray.push("#faa5a5");
	testObj.legend.colors=colorArray;
	
	arraObject.chartobj.push(testObj);
	arraObject.placeholder.push('perfGraph1'+i);	
	zChart(arraObject);

	
	//stats trend report
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	i++;
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header3")+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);

	$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
	var timeformat=OPMClient.FWAInventoryDateTimeLegends.get("custom");
	if(reqParams.timeFrame != undefined){
		timeformat=OPMClient.FWAInventoryDateTimeLegends.get(reqParams.timeFrame);
	}
	
	var fwaChartData=widData;
	var graphType="line";//No I18N
	var datatype_1="time";//No I18N
	var datatype_2="numeric";//No I18N
	var colName1=Ember.I18n.t('webclient.admin.schedulereports.time',this);//No I18N
	var colName2=Ember.I18n.t('webclient.common.widgets.eventcount',this);//No I18N
	
	fwaChartData=((widData.statsTrend != undefined && widData.statsTrend != undefined) ? widData.statsTrend: {});
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	var testObj = 
	{
			id:'perfGraph1'+i,//No I18N
			type:graphType,
			jsonData:fwaChartData,
			series:"multi",//No I18N
			height:350,
			columns:{
				datatype_1:datatype_1,
				datatype_2:datatype_2,
				columnname_1:colName1,
				columnname_2:colName2,
				timeFormat:timeformat
			},
			tooltip:[0,1],
			canvas:
			{
				title:
				{
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
				"fontSize": 10,//No I18N
				"itemHeight": "20"//No I18N
			},
			bar:{
				rotated:false,
				levelMarker:false
			},
			axes:{
				"xaxis": {//No I18N
					"label": {//No I18N
						"text":colName1,//No I18N
						"fontSize": 13,//No I18N
						"fontWeight": 'Bold',//No I18N
						"fontFamily":"LatoRegular"//No I18N
					},
					"ticklabel": {//No I18N
						"rotation": 45,//No I18N
						"maxWidth": 75,//No I18N
						"marginLeft":0,//No I18N
						"marginRight":0//No I18N
					}

				},
				"yaxis": [//No I18N
				          {"label": {//No I18N
				        	  "text": colName2,//No I18N
				        	  "fontSize": 13,//No I18N
				        	  "fontWeight": 'Bold',//No I18N
				        	  "fontFamily":"LatoRegular"//No I18N
				          }
				          }
				          ]
			}
	}
	 var colorArray=new Array();
	 colorArray.push("#9dfcc9");
	 colorArray.push("#fac564");
	 colorArray.push("#faa5a5");
	 testObj.legend.colors=colorArray;
	arraObject.chartobj.push(testObj);
	arraObject.placeholder.push('perfGraph1'+i);	
	zChart(arraObject);
	
	//Total trend report
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	i++;
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	$('.mainContent').append($contDiv);	
	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.change.rule.widget.header4")+'</div>');
	var widElem=$('<div id="widgetElement_'+i+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content singleInvWidget' id='WidElement_"+i+"' style='page-break-after:always;'></div>");
	$('#widgetElement_'+i).append($contentdiv);

	$contentdiv.append("<div id='perfGraph1"+i+"'></div>");
	var timeformat=OPMClient.FWAInventoryDateTimeLegends.get("custom");
	if(reqParams.timeFrame != undefined){
		timeformat=OPMClient.FWAInventoryDateTimeLegends.get(reqParams.timeFrame);
	}
	
	var fwaChartData=widData;
	var graphType="line";//No I18N
	var datatype_1="time";//No I18N
	var datatype_2="numeric";//No I18N
	var colName1=Ember.I18n.t('webclient.admin.schedulereports.time',this);//No I18N
	var colName2=Ember.I18n.t('webclient.common.widgets.eventcount',this);//No I18N
	
	fwaChartData=((widData.totalTrend != undefined && widData.totalTrend != undefined) ? widData.totalTrend: {});
	var arraObject={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	};
	var testObj = 
	{
			id:'perfGraph1'+i,//No I18N
			type:graphType,
			jsonData:fwaChartData,
			series:"multi",//No I18N
			height:350,
			columns:{
				datatype_1:datatype_1,
				datatype_2:datatype_2,
				columnname_1:colName1,
				columnname_2:colName2,
				timeFormat:timeformat
			},
			tooltip:[0,1],
			canvas:
			{
				title:
				{
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
				"fontSize": 10,//No I18N
				"itemHeight": "20"//No I18N
			},
			bar:{
				rotated:false,
				levelMarker:false
			},
			axes:{
				"xaxis": {//No I18N
					"label": {//No I18N
						"text":colName1,//No I18N
						"fontSize": 13,//No I18N
						"fontWeight": 'Bold',//No I18N
						"fontFamily":"LatoRegular"//No I18N
					},
					"ticklabel": {//No I18N
						"rotation": 45,//No I18N
						"maxWidth": 75,//No I18N
						"marginLeft":0,//No I18N
						"marginRight":0//No I18N
					}

				},
				"yaxis": [//No I18N
				          {"label": {//No I18N
				        	  "text": colName2,//No I18N
				        	  "fontSize": 13,//No I18N
				        	  "fontWeight": 'Bold',//No I18N
				        	  "fontFamily":"LatoRegular"//No I18N
				          }
				          }
				          ]
			}
	}

	arraObject.chartobj.push(testObj);
	arraObject.placeholder.push('perfGraph1'+i);	
	zChart(arraObject);
	
	
	
	
}

function fwaRuleChangeReport(snapId,widData,reqParams){

	if(reqParams.type == "latest"){
		var fwaChartData=[];
		var arraObject={
				"placeholder":[],//No I18N
				"chartobj":[]//No I18N
		};
		if(widData != undefined){
			fwaChartData.push(["Added",(widData.addedLatest != undefined ? widData.addedLatest : 0)]);
			fwaChartData.push(["Modified",(widData.modifiedLatest != undefined ? widData.modifiedLatest : 0)]);
			fwaChartData.push(["Deleted",(widData.deletedLatest != undefined ? widData.deletedLatest : 0)]);
		}
		var testObj = {
				id:'perfGraph1'+snapId,//No I18N 
				type: 'pie',//No I18N
				subType: "simpleDonut",//simplePie , semiDount, simpleDonut,gaugeDial,simpleDial//No I18N
				customClass: "opm_pie discoveryStatusDial",//No I18N
				jsonData:fwaChartData,
				height:350,
				columns:{
					datatype_1:"ordinal",//No I18N 
					datatype_2:'numeric',//No I18N
					columnname_1:"Type",//No I18N 
					columnname_2:"Change Count"//No I18N 
				},
				"legend": { //No I18N	
					"enabled":true,//No I18N
					"fontSize": 10,//No I18N
					"itemHeight": "20"//No I18N
				},
				pie:{innerLabel:true},
				legend:{enabled:true,layout:"horizontal",vAlign:"bottom",hAlign:"center","shapes": ["circle"]} //No I18N
		}
		 var colorArray=new Array();
		 colorArray.push("#9dfcc9");
		 colorArray.push("#fac564");
		 colorArray.push("#faa5a5");
		 testObj.legend.colors=colorArray;
		arraObject.chartobj.push(testObj);
		arraObject.placeholder.push('perfGraph1'+snapId);	
		zChart(arraObject);	
	}else if(reqParams.type == "table"){
		$(".graphWidget").append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");

		var colNamesList=[Ember.I18n.t('webclient.fwa.change.policy.changeson',this),Ember.I18n.t('webclient.common.changedby',this),Ember.I18n.t('webclient.fwa.change.policy.changes.from',this),Ember.I18n.t('ncm.acd.Version_No',this),Ember.I18n.t('webclient.fwa.change.policy.added.count',this),Ember.I18n.t('webclient.fwa.change.policy.modi.count',this),Ember.I18n.t('webclient.fwa.change.policy.deleted.count',this)];//No I18N
		var colModelList=[{'name':'changedOn','index':'changedOn',classes:"pointer"},//No I18N
		                  {'name':'changedBy','index':'changedBy'},//No I18N
		                  {'name':'changedFrom','index':'changedFrom'},//No I18N
		                  {'name':'versionNo','index':'versionNo'},//No I18N
		                  {'name':'addedCount','index':'addedCount'},//No I18N
		                  {'name':'modifiedCount','index':'modifiedCount'},//No I18N
		                  {'name':'deletedCount','index':'deletedCount'}//No I18N
		                  ];
		fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,widData.gridData,colNamesList,colModelList,"","","","",false,reqParams); //No I18N	
	}else{
		var timeformat=OPMClient.FWAInventoryDateTimeLegends.get("custom");
		if(reqParams.timeFrame != undefined){
			timeformat=OPMClient.FWAInventoryDateTimeLegends.get(reqParams.timeFrame);
		}
		
		var fwaChartData=widData;
		var graphType="line";//No I18N
		var datatype_1="time";//No I18N
		var datatype_2="numeric";//No I18N
		var colName1=Ember.I18n.t('webclient.admin.schedulereports.time',this);//No I18N
		var colName2=Ember.I18n.t('webclient.common.widgets.eventcount',this);//No I18N
		if(reqParams.type == "user"){
			fwaChartData=widData.gridData;
			graphType="bar";//No I18N
			datatype_1="ordinal";//No I18N
			colName1=Ember.I18n.t('opu.views.USER_NAME',this);//No I18N
			colName2=Ember.I18n.t('webclient.common.widgets.eventcount',this);//No I18N
		}
		var arraObject={
				"placeholder":[],//No I18N
				"chartobj":[]//No I18N
		};
		var testObj = 
		{
				id:'perfGraph1'+snapId,//No I18N
				type:graphType,
				jsonData:fwaChartData,
				series:"multi",//No I18N
				height:350,
				columns:{
					datatype_1:datatype_1,
					datatype_2:datatype_2,
					columnname_1:colName1,
					columnname_2:colName2,
					timeFormat:timeformat
				},
				tooltip:[0,1],
				canvas:
				{
					title:
					{
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
					"fontSize": 10,//No I18N
					"itemHeight": "20"//No I18N
				},
				bar:{
					rotated:false,
					levelMarker:false
				},
				axes:{
					"xaxis": {//No I18N
						"label": {//No I18N
							"text":colName1,//No I18N
							"fontSize": 13,//No I18N
							"fontWeight": 'Bold',//No I18N
							"fontFamily":"LatoRegular"//No I18N
						},
						"ticklabel": {//No I18N
							"rotation": 45,//No I18N
							"maxWidth": 75,//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}

					},
					"yaxis": [//No I18N
					          {"label": {//No I18N
					        	  "text": colName2,//No I18N
					        	  "fontSize": 13,//No I18N
					        	  "fontWeight": 'Bold',//No I18N
					        	  "fontFamily":"LatoRegular"//No I18N
					          }
					          }
					          ]
				}
		}
		if(reqParams.type == "statsTrend" || reqParams.type == "user"){
			var colorArray=new Array();
			colorArray.push("#9dfcc9");
			colorArray.push("#fac564");
			colorArray.push("#faa5a5");
			testObj.legend.colors=colorArray;
		}
		
		arraObject.chartobj.push(testObj);
		arraObject.placeholder.push('perfGraph1'+snapId);	
		zChart(arraObject);
	}
}


function fwaRiskTrendReport(snapId,widData,reqParams){
	var graphParams = {};
	graphParams.id = 'perfGraph1'+snapId;
	delete widData.TimeZone
	
	if(reqParams.type == "trend"){
		graphParams.data = widData.trend;
		graphParams.colName1 = "Date"; //No I18N
		graphParams.colName2 = "Count"; //No I18N
		graphParams.graphType = 'line';//No I18N
		graphParams.xAxis = "Date"; //No I18N
		graphParams.yAxis = "Count"; //No I18N
		var colorArray=new Array();
		colorArray.push("#00c6e4");
		colorArray.push("#ee7e85");
		colorArray.push("#f5be67");
		colorArray.push("#e6de77");
		colorArray.push("#6abb85");
		colorArray.push("#a052a6");
		graphParams.legend={"colors":colorArray};//No I18N
	}else{
		graphParams.data = widData.severity;
		graphParams.colName1 = "Severity"; //No I18N
		graphParams.colName2 = "Count"; //No I18N
		graphParams.graphType = 'bar';//No I18N
		graphParams.xAxis = "Severity"; //No I18N
		graphParams.yAxis = "Count"; //No I18N
		var colorArray=new Array();
		colorArray.push("#ee7e85");
		colorArray.push("#f5be67");
		colorArray.push("#e6de77");
		colorArray.push("#6abb85");
		colorArray.push("#a052a6");
		graphParams.legend={"colors":colorArray};//No I18N
	}
	graphParams.timeFormat = "monthly"; //No I18N
	var timeFormat="custom";//No I18N
	loadFWAPDFGraph(graphParams);
}


function fwaRiskIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	if(reqParams != undefined && reqParams.headerName != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.headerName+'</div>')
    }
    
    var tableContent='<table><tbody>';
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
	if(reqParams.riskProfileName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.risk.profile.name',this)+"</span> : "+reqParams.riskProfileName+"</td></tr>";//NO I18N
	}

    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
    var $contDiv1 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
    $contDiv1.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.risk.trend.report")+'</div>');
    $contDiv1.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv1.append("<div class='content graphWidget graphWidget1'><div id='perfGraph10'></div></div>");
    $maindiv.append($contDiv1);
    
    var $contDiv2 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
    $contDiv2.append('<div class="fwaHeading_pdf">'+Ember.I18n.t("webclient.fwa.risk.analysis.report")+'</div>');
    $contDiv2.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv2.append("<div class='content graphWidget graphWidget1'><div id='perfGraph11'></div></div>");
    $maindiv.append($contDiv2);
}
function fwaRiskReport(snapId,widData,reqParams){
	var graphParams = {};
	graphParams.id = 'perfGraph10';
	graphParams.data = widData.trend;
	graphParams.colName1 = "Date"; //No I18N
	graphParams.colName2 = "Count"; //No I18N
	graphParams.graphType = 'line';//No I18N
	graphParams.timeFormat = "monthly"; //No I18N
	graphParams.xAxis = "Date"; //No I18N
	graphParams.yAxis = "Count"; //No I18N
	var timeFormat="custom";//No I18N
	var colorArray=new Array();
	colorArray.push("#00c6e4");
	colorArray.push("#ee7e85");
	colorArray.push("#f5be67");
	colorArray.push("#e6de77");
	colorArray.push("#6abb85");
	colorArray.push("#a052a6");
	graphParams.legend={"colors":colorArray};//No I18N
	loadFWAPDFGraph(graphParams);

	var graphParams1 = {};
	graphParams1.id = 'perfGraph11';
	graphParams1.data = widData.severity;
	graphParams1.colName1 = "Severity"; //No I18N
	graphParams1.colName2 = "Count"; //No I18N
	graphParams1.graphType = 'bar';//No I18N
	graphParams1.xAxis = "Severity"; //No I18N
	graphParams1.yAxis = "Count"; //No I18N
	var colorArray=new Array();
	colorArray.push("#ee7e85");
	colorArray.push("#f5be67");
	colorArray.push("#e6de77");
	colorArray.push("#6abb85");
	colorArray.push("#a052a6");
	graphParams1.legend={"colors":colorArray};//No I18N
	loadFWAPDFGraph(graphParams1);
}

function fwaRiskCompIndexPage(snapId,widData,reqParams,width,height){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	if(reqParams != undefined && reqParams.headerName != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.headerName+'</div>')
    }
    
    var tableContent='<table><tbody>';
   
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
	if(reqParams.riskProfileName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.risk.profile.name',this)+"</span> : "+reqParams.riskProfileName+"</td></tr>";//NO I18N
	}

	if(reqParams.severity != undefined){
		var severityStr= JSON.parse(reqParams.severity).join(",");
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.map.filemonitor.alarmseverity',this)+"</span> : "+severityStr+"</td></tr>";//NO I18N
	}

    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $maindiv.append('<div class="fwaMainContent_pdf" style="border: none;top:20px;margin-bottom:60px;page-break-inside:avoid !important;"><div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');
    
}

function fwaRiskRuleIndexPage(snapId,widData,reqParams,width,height){
    $('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(window.OPM.productName == "Firewall Analyzer"){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	if(reqParams != undefined && reqParams.headerName != undefined){
    	$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.headerName+'</div>')
    }
    var tableContent='<table><tbody>';
    
    if((reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true) && widData.grpName != undefined){
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.settings.devicegrp.name',this)+"</span> : "+widData.grpName+"</td></tr>";//NO I18N
    	var devListStr='';
    	if(widData.grpDevDetails != undefined){
    		for(var ik=0;ik < widData.grpDevDetails.length;ik++){
    			if(ik ==0){
    				devListStr = widData.grpDevDetails[ik].displayname;
    			}else{
    				devListStr += " , "+widData.grpDevDetails[ik].displayname;
    			}
    		}
    	}
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('widget.name.firewalldevList',this)+"</span> : "+devListStr+"</td></tr>";//NO I18N
    }else if(reqParams.deviceName != undefined) {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
    }
    
	if(reqParams.riskProfileName != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.risk.profile.name',this)+"</span> : "+reqParams.riskProfileName+"</td></tr>";//NO I18N
	}

	if(reqParams.severity != undefined){
		var severityStr= JSON.parse(reqParams.severity).join(",");
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.map.filemonitor.alarmseverity',this)+"</span> : "+severityStr+"</td></tr>";//NO I18N
	}
	
    tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.gen.time',this)+"</span> : "+reqParams.sysTime+"</td></tr>";//NO I18N
    if(reqParams.policyNameList != undefined){
		var policyNameList=reqParams.policyNameList.split(",");
		var policyNameStr="";
		for(var ij=0;ij<policyNameList.length;ij++){
			policyNameStr+=policyNameList[ij]+"<br/>";
		}
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.inventory.policyname',this)+"</span> : "+policyNameStr+"</td></tr>";//NO I18N
	}
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $maindiv.append('<div id="widgetElement_'+snapId+'" class=""></div>');
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>');

}

function fwaRiskCompRuleReport(snapId,widData,reqParams){
	var $maindiv = $(".mainContent");
	var response=widData;
	var gridData=response.gridData;
	var rulesdata=widData.rulesData;
	var colNamesFromWidData = widData.colNames;
    	var colModelsFromWidData = widData.colModel;
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var $contentdiv2 = $("<div class='content graphWidget'></div>");
	widParams.widgetElement.append($contentdiv2);			
	$contentdiv2.append("<div class='opm_jqGridUI' style='padding-top:0px !important'><table id='opm_App_complete_Legend' class='ut ut-Grid'></table></div>");
	
	var colNames = [Ember.I18n.t("webclient.fwa.risk.level",this),Ember.I18n.t("webclient.fwa.risk.info",this),"Rules Count"]; //No I18N
    var colModel = [
                        {name: 'level', index: 'level'}, //No I18N
                        {name: 'info', index: 'info',formatter:function(cellValue, options, rowdata, action){//No I18N
		                	return "<i class='textLink'>"+cellValue+"</i>";
		                },unformat:function(cellvalue, options, cell) {
		                	return cellvalue;
		                }
		                },
		                {name: 'ruleCount', index: 'ruleCount'} //No I18N
                       ];
	fwa_loadPDFJQgridWithData('#opm_App_complete_Legend',gridData,colNames,colModel,"","","","",false,reqParams); //No I18N	

	
	
	for(var i=0;i<gridData.length;i++){
		var sinDet=gridData[i];
		var $contDiv = $('<div class="fwaMainContent_pdf" style="top:20px;margin-bottom:60px;page-break-inside:avoid !important;"></div>');
		if(sinDet.info != undefined){
	    	$contDiv.append('<div class="fwaHeading_pdf">'+sinDet.info+'</div>')
	    }
		$maindiv.append($contDiv);
		var tableContent='<table><tbody>';
		
		var colors = {"Critical":"red","Low":"green","High":"orange","Medium":"#b3b315","Attention":"violet"}; //No I18N
    	var textCol = colors[sinDet.level];
    	
		tableContent = tableContent+"<tr><td style='color:"+textCol+"'><span>"+Ember.I18n.t('webclient.fwa.risk.level',this)+"</span> : "+sinDet.level+"</td></tr>";//NO I18N
//		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fwa.risk.info',this)+"</span> : "+sinDet.info+"</td></tr>";//NO I18N
		tableContent = tableContent+"<tr><td><span>Rules Count</span> : "+sinDet.ruleCount+"</td></tr>";//NO I18N
		tableContent=tableContent+"</tbody>";//No I18N
		tableContent=tableContent+"</table>";
		var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
		$contDiv.append($paramTab);
		$paramTab.html(tableContent);
		
		var ruleDet=rulesdata[sinDet.info];
		if(ruleDet != undefined && ruleDet.gridData != undefined){
			var $detailTab=$('<div class="DetailsDiv"></div>');
			$detailTab.append('<header class="headerSpan">Rule Details</header>');//NO I18N
			var $contentdiv = $("<div class='content graphWidget'></div>");
			$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:0px'><table id='opm_App_Legend"+i+"' class='ut ut-Grid'></table></div>");
			$detailTab.append($contentdiv);
			$contDiv.append($detailTab);
			

	colNamesList = colNamesFromWidData;
	colModelList = colModelsFromWidData;

			var ruleData=ruleDet.gridData;
			fwa_loadPDFJQgridWithData('#opm_App_Legend'+i,ruleData,colNamesList,colModelList,"","","",{},false,reqParams);
			
			$detailTab.append('<header class="headerSpan">'+Ember.I18n.t('webclient.fwa.risk.findings',this)+'</header>');//NO I18N
			$detailTab.append('<div>'+ruleDet.findings+'</div>');
			$detailTab.append('<header class="headerSpan">'+Ember.I18n.t('fwa.compliance.Comp_Recommendation',this)+'</header>');//NO I18N
			$detailTab.append('<div>'+ruleDet.recommendation+'</div>');
		}
	}
}

function fwaRiskRuleReport(snapId,widData,reqParams){
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var widgeType = reqParams.widgeType != undefined ? reqParams.widgeType : "";
	var response=widData;
	
	var $contentdiv2 = $('<div class="fwaMainContent_pdf" style="top:20px;margin-bottom:60px;page-break-inside:avoid !important;"></div>');
	widParams.widgetElement.append($contentdiv2);
	snapId = 2;				
	
	var $detailTab=$('<div class="DetailsDiv"></div>');
	var $contentdiv = $("<div class='content graphWidget'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+snapId+"' class='ut ut-Grid'></table></div>");
	$detailTab.append($contentdiv);
	$contentdiv2.append($detailTab);

	if(reqParams.category == "Rule"){
	    colNames = response.colNames;
	    colModel = response.colModel;

				colNames.unshift('');
		        colModel.unshift({name: 'severityIcon', index: 'severityIcon',width:50,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
		            var colors = {"Critical":"#FB5A57","Low":"#74C38F","High":"#FAAD5A","Medium":"#E8DE65","Attention":"#AC4CAB"}; //No I18N
		            var severityOrder = ["Critical","High","Medium","Low","Attention"]; //No I18N
		            var severity = "";
		            // Find highest severity from rowdata.risk array
		            if(rowdata.risk && rowdata.risk.length > 0){
		                for(var s=0; s<severityOrder.length; s++){
		                    for(var r=0; r<rowdata.risk.length; r++){
		                        if(rowdata.risk[r].level == severityOrder[s] && rowdata.risk[r].count > 0){
		                            severity = severityOrder[s];
		                            break;
		                        }
		                    }
		                    if(severity != "") break;
		                }
		            }
		            var sevStr = "";
		            var bgColor = colors[severity];
		            if(severity == "Critical"){
		                sevStr = Ember.I18n.t('webclient.map.filemonitor.alarmseverity', this)+" : "+Ember.I18n.t('webclient.admin.traps.critical',this); //No I18N
		            }else if(severity == "High"){//No I18N
		                sevStr = Ember.I18n.t('webclient.map.filemonitor.alarmseverity', this)+" : "+Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this); //No I18N
		            }else if(severity == "Medium"){//No I18N
		                sevStr = Ember.I18n.t('webclient.map.filemonitor.alarmseverity', this)+" : "+Ember.I18n.t('webclient.Medium',this); //No I18N
		            }else if(severity == "Low"){//No I18N
		                sevStr = Ember.I18n.t('webclient.map.filemonitor.alarmseverity', this)+" : "+Ember.I18n.t('webclient.ncm.tab.Low',this); //No I18N
		            }else if(severity == "Attention"){//No I18N
		                sevStr = Ember.I18n.t('webclient.map.filemonitor.alarmseverity', this)+" : "+Ember.I18n.t('webclient.ncm.clientserver.config.severity.Attention',this); //No I18N
		            }
		            return '<span class="activestatus" title="'+sevStr+'" style="margin-top:5px;margin-left:20px;background-color: '+bgColor+'"></span>';//NO I18N
		        }});

        for(var k=0; k<colModel.length; k++) {

            if(colModel[k].name === "risk") {
                colModel[k].formatter =  function(cellValue, options, rowdata, action){
                                                         var riskStatus='<div class="risk-counts">';
                                                         var colors = {"Critical":"red","Low":"green","High":"orange","Medium":"yellow","Attention":"violet"}; //No I18N
                                                             for(i=0; i<cellValue.length; i++){
                                                                 var level = cellValue[i].level;
                                                                 var count = cellValue[i].count+" "+cellValue[i].level;
                                                                 var ruleCnt = cellValue[i].count;
                                                                 riskStatus += '<span class="risk-count-'+colors[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';
                                                             }
                                                             riskStatus += "</div>";
                                                             return riskStatus;
                                                     }
            break;
            }
        }
	}
	gridData=response.gridData;
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+snapId,gridData,colNames,colModel,"","","","",false,reqParams); //No I18N	
	var riskData = response.riskData;
	var riskSectionInfo = response.riskSectionInfo;
	for(var i=0;i<gridData.length;i++){
		var sinDet=gridData[i];
		var $contDiv = $('<div class="fwaMainContent_pdf" style="top:20px;margin-bottom:60px;page-break-inside:avoid !important;"></div>');
		if(sinDet.ruleName != undefined){
	    	$contDiv.append('<div class="fwaHeading_pdf">'+Ember.I18n.t('webclient.admin.alarmesc.RuleName',this)+' : '+sinDet.ruleName+'</div>')
	    }
		widParams.widgetElement.append($contDiv);
		var tableContent='<table><tbody>';
		var policyName=sinDet.policyName;
		
		if(riskData != undefined && riskData[policyName] != undefined){
			var $detailTab=$('<div class="DetailsDiv"></div>');
			$detailTab.append('<header class="headerSpan">Risk Details</header>');//NO I18N
			var $contentdiv = $("<div class='content graphWidget'></div>");
			$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:0px'><table id='opm_App_Legend_Risk"+i+"' class='ut ut-Grid'></table></div>");
			$detailTab.append($contentdiv);
			$contDiv.append($detailTab);
			
			var riskTableData=(riskData[policyName][sinDet.ruleName]) ? riskData[policyName][sinDet.ruleName] : [];
			for(var ij=0;ij<riskTableData.length;ij++){
				var info=riskTableData[ij].info;
				if(riskSectionInfo[info] != undefined){
					riskTableData[ij].findings =riskSectionInfo[info].findings;
					riskTableData[ij].recommendation =riskSectionInfo[info].recommendation;
				}
			}
			var colNamesList = [Ember.I18n.t("webclient.fwa.risk.info", this),Ember.I18n.t("webclient.fwa.risk.level"),Ember.I18n.t("webclient.fwa.risk.findings", this),Ember.I18n.t("fwa.compliance.Comp_Recommendation")]; //No I18N
			var colModelList = [
						    { name: 'info', index: 'info'}, //No I18N
			                { name: 'level', index: 'level',width:30,formatter:function(cellValue, options, rowdata, action){//No I18N
	                        	var colors = {"Critical":"red","Low":"green","High":"orange","Medium":"#b3b315","Attention":"violet"}; //No I18N
			                	return '<i style="color:'+colors[cellValue]+'">'+cellValue+'</i>';
			                }},
			                { name: 'findings', index: 'findings'}, //No I18N
			                { name: 'recommendation', index: 'recommendation'} //No I18N
			                ];
			fwa_loadPDFJQgridWithData('#opm_App_Legend_Risk'+i,riskTableData,colNamesList,colModelList,"","","",{},false,reqParams);
		}
	}
}

function getFWAInvColmodelNameList(viewType,filterType){
	var gridDet={"colNamesList":[],"colModelList":[]};//No I18N
	var hideEE = false;
	if(filterType === "Devices"){
		
		if(viewType == "Grid"){
			gridDet.colNamesList = ['','','','',Ember.I18n.t('fwa.firewallListView.name',this),Ember.I18n.t('webclient.fwa.inventory.license',this),Ember.I18n.t('webclient.topo.ipAddress',this),Ember.I18n.t('ipsla.Type',this),Ember.I18n.t('webclient.devices.details.vendor',this),Ember.I18n.t('fwa.livetraffic.uplinkspeed',this),Ember.I18n.t('fwa.livetraffic.downlinkspeed',this),Ember.I18n.t('fwa.setting.intranet.setting',this),Ember.I18n.t('webclient.topo.details.tabs.snmp',this),'','','','','','','',Ember.I18n.t('webclient.admin.probes.probename',this)]; //No I18N
			gridDet.colModelList = [{ name: 'licenseStatus', index: 'licenseStatus',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'intranetSettings', index: 'intranetSettings',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'isOfflineDevice', index: 'isOfflineDevice',hidden:true,classes:'GridColHidden'}, //No I18N
			    					{ name: 'trafficIcon', index: 'trafficIcon',search:false,width:4,classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
			    						if(!rowdata.isOfflineDevice){
			    							return "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>";
			    						}else{
			    							return '';
			    						}
			    						
			    					}}, 
			    					{ name: 'dispName', index: 'dispName',classes:"pointer", width:13}, //No I18N
			    					{ name: 'status', index: 'status',formatter:fwaImageDeviceStatus,width:7,sortable:false,search:false}, //No I18N
			    					{ name: 'ip', index: 'ip', classes:"pointer", width:10}, //No I18N
			    					{ name: 'resType', index: 'resType',classes:"pointer", width:10}, //No I18N
			    					{ name:'vendor',index:'vendor',width:10}, //No I18N
			    					{ name: 'uplinkSpeed', index: 'uplinkSpeed',sorttype:fwacustomsort,sortable:true,width:10}, //No I18N
			    					{ name: 'downlinkSpeed', index: 'downlinkSpeed',sorttype:fwacustomsort,sortable:true,width:10},//No I18N
			    					{  name: 'intranetRedirect', search:false, index:'intranetRedirect',hidden:hideEE,sortable:false, width:14,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var actionsDiv="";
			    						if(rowdata.resType != "Squid"){
			    							if(!rowdata.intranetSettings){
			    								return Ember.I18n.t('webclient.admin.users.notconfigured',this);//No I18N
			    							}else{
			    								return Ember.I18n.t("webclient.fwa.inventory.configured",this);//No I18N
			    							}
			    						}
			    						return actionsDiv;
			    					}},
			    					{  name: 'snmpSettings', search:false, index:'snmpSettings',hidden:hideEE,sortable:false, width:13,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						if(!rowdata.isVdom && rowdata.resType != "Squid"){
			    							if(cellValue == "none"){
				    							return Ember.I18n.t('webclient.admin.users.notconfigured',this);//No I18N
				    						}else if(cellValue == true){
				    							return Ember.I18n.t('webclient.devices.intftypes.enabled',this);//No I18N
				    						}else{
				    							return Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
				    						}
			    						}else{
			    							return "-";//NO I18N
			    						}
			    					}}, 
			    					{ name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'reportID', index: 'reportID',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'DDID', index: 'DDID',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'resName', index: 'resName',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'syslogPort', index: 'syslogPort',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'isVdom', index: 'isVdom',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'SnmpSettConf', index: 'SnmpSettConf',hidden:true,classes:'GridColHidden',formatter:function(cellValue, options, rowdata, action){//No I18N
			    						if(!rowdata.isVdom && rowdata.resType != "Squid"){
			    							return rowdata.snmpSettings;
			    						}else{
			    							return '-';
			    						}
			    					},unformat:function(cellValue, options){
			    						return cellValue;
			    					}},
								{ name: 'probeDisplayName', index: 'probeDisplayName', hidden:!hideEE, width:13} //No I18N
			    			];
		}else{			
			gridDet.colNamesList = ['','','','',Ember.I18n.t('fwa.firewallListView.name',this),Ember.I18n.t('webclient.fault.event.severity',this),Ember.I18n.t('webclient.topo.ipAddress',this),Ember.I18n.t('ipsla.Type',this),Ember.I18n.t('webclient.devices.details.vendor',this),Ember.I18n.t('fwa.livetraffic.uplinkspeed',this),Ember.I18n.t('fwa.livetraffic.downlinkspeed',this),'','','','','','','','','','',Ember.I18n.t('webclient.admin.probes.probename',this)]; //No I18N
			gridDet.colModelList = [{ name: 'licenseStatus', index: 'licenseStatus',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'intranetSettings', index: 'intranetSettings',hidden:true}, //No I18N
			        { name: 'isOfflineDevice', index: 'isOfflineDevice',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'UnassignedAction', search:false, index:'UnassignedAction',sortable:false, width:3,formatter:function(cellValue, options, rowdata, action){//No I18N
                    	var unAssProto=OPMClient.InventoryFWAController.unAssignedProto;
                    	var isUnAssignProto=OPMClient.InventoryFWAController.UnassignedProt;
                    	if(unAssProto.length>0){
                        	var resName=rowdata.resName;
                        	for(var i = 0; i < unAssProto.length; i++) {  
                                if(unAssProto.indexOf(resName) > -1){
                                	isUnAssignProto.push(true);
                                	return "<i class='icon-wrench pointer' title='"+Ember.I18n.t('webclient.fwa.TrafficTable.UnassignedMess',this)+"'></i>";//NO I18N
                                }
                                else{
                                	isUnAssignProto.push(false);
                                	return '';
                                }
                            }
                    	}
                    	else{
                    		return '';
                    	}
					}}, 
					{ name: 'dispName', index: 'dispName',classes:"cursorPointer", width:30,sortable:true}, //No I18N
					{ name: 'licStatus', index: 'licStatus',width:20,sortable:true,search:true}, //No I18N
					{ name: 'ip', index: 'ip', classes:"pointer", width:30,sortable:true}, //No I18N
					{ name: 'resType', index: 'resType',classes:"pointer", width:20,sortable:true}, //No I18N
					{ name:'vendor',index:'vendor',width:20,sortable:true}, //No I18N
					{ name: 'uplinkSpeed', index: 'uplinkSpeed', width:25, sorttype: fwacustomsort,sortable:true}, //No I18N
					{ name: 'downlinkSpeed', index: 'downlinkSpeed', width:25, sorttype: fwacustomsort,sortable:true}, //No I18N
					{  name: 'intranetRedirect', search:false, index:'intranetRedirect',hidden:hideEE,sortable:false, width:40,formatter:function(cellValue, options, rowdata, action){//No I18N
						var actionsDiv="";
						if(rowdata.resType != "Squid"){
							if(!rowdata.intranetSettings){
								return Ember.I18n.t('webclient.intranet',this)+" : "+Ember.I18n.t('webclient.admin.users.notconfigured',this);//No I18N
							}else{
								return Ember.I18n.t('webclient.intranet',this)+" : "+Ember.I18n.t("webclient.fwa.inventory.configured",this);//No I18N
							}
						}
						return actionsDiv;
					}}, 
					{   name: 'snmpSettings', search:false, index:'snmpSettings',sortable:false,hidden:hideEE, width:40,formatter:function(cellValue, options, rowdata, action){//No I18N
						if(!rowdata.isVdom && rowdata.resType != "Squid"){
							if(cellValue == "none"){
								return Ember.I18n.t('webclient.topo.details.tabs.snmp',this)+" : "+Ember.I18n.t('webclient.admin.users.notconfigured',this);//No I18N
							}else if(cellValue == true){
								return Ember.I18n.t('webclient.topo.details.tabs.snmp',this)+" : "+Ember.I18n.t('webclient.devices.intftypes.enabled',this);//No I18N
							}else{
								return Ember.I18n.t('webclient.topo.details.tabs.snmp',this)+" : "+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
							}
						}else{
							return Ember.I18n.t('webclient.topo.details.tabs.snmp',this)+" : -";//No I18N
						}
					}}, 
					{ name: 'probeDisplayName', index: 'probeDisplayName', hidden:!hideEE, width:10}, //No I18N
					{ name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'reportID', index: 'reportID',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'DDID', index: 'DDID',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'resName', index: 'resName',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'syslogPort', index: 'syslogPort',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'isVdom', index: 'isVdom',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'SnmpSettConf', index: 'SnmpSettConf',hidden:true,classes:'GridColHidden',formatter:function(cellValue, options, rowdata, action){//No I18N
						if(!rowdata.isVdom && rowdata.resType != "Squid"){
							return rowdata.snmpSettings;
						}else{
							return '-';
						}
						},unformat:function(cellValue, options){
							return cellValue;
    					}},
    					{ name: 'fullViewIcon', index: 'fullViewIcon',title:false,width:10,formatter:fwaDevPopoutImg} //No I18N
    					
			];
		}	
	}
	else if(filterType === "Interfaces"){
		if(viewType == "Grid"){
			gridDet.colNamesList = ['','','',Ember.I18n.t('NFAWidget.intfName',this),Ember.I18n.t('webclient.reports.tags.IPAddress',this),Ember.I18n.t('webclient.devices.details.devicename',this),Ember.I18n.t('fwa.livetraffic.uplinkspeed',this),Ember.I18n.t('fwa.livetraffic.downlinkspeed',this),Ember.I18n.t('fwa.livetraffic.avgInUtilization',this),Ember.I18n.t('fwa.livetraffic.avgOutUtilization',this),'','','','','']; //No I18N
			gridDet.colModelList = [{ name: 'avgBwSpeedIn', index: 'avgBwSpeedIn',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'avgBwSpeedOut', index: 'avgBwSpeedOut',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'trafficIcon', index: 'trafficIcon',search:false,width:10,classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
						return "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>";
					}}, 
			        { name: 'dispName', index: 'dispName',classes:"pointer", width:30}, //No I18N
					{ name: 'iP', index: 'iP', classes:"pointer", width:30,formatter:ipWithMask}, //No I18N
					{ name: 'firewallDispName', index: 'firewallDispName', width:30,sortable:true}, //No I18N
					{ name: 'upSpeed', index: 'upSpeed', width:25,sorttype:fwacustomsort,sortable:true}, //No I18N
					{ name: 'downSpeed', index: 'downSpeed', width:25,sorttype:fwacustomsort,sortable:true}, //No I18N
					{ name: 'avgBandwidthIn', hidden:hideEE,index: 'avgBandwidthIn',search:false, formatter:getfwaINUsageGraph ,sortable: true, sorttype: 'float', width: 50, align: 'left'}, //No I18N
					{ name: 'avgBandwidthOut', hidden:hideEE,search:false, index: 'avgBandwidthOut',formatter:getfwaOutUsageGraph, sortable: true, sorttype: 'float', width: 50, align: 'left'}, //No I18N
					{ name: 'ifMask', index: 'ifMask',classes:"pointer", sortable:false,hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'snmpCommunity', index: 'snmpCommunity',classes:"pointer", sortable:false,hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'snmpPort', index: 'snmpPort',classes:"pointer",sortable:false,hidden:true,classes:'GridColHidden'}, 	//No I18N
					{ name: 'id', index: 'id',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden'} //No I18N
				];
		}else{	
			gridDet.colNamesList = ['','','',Ember.I18n.t('NFAWidget.intfName',this),Ember.I18n.t('webclient.reports.tags.IPAddress',this),Ember.I18n.t('webclient.devices.details.devicename',this),Ember.I18n.t('fwa.livetraffic.uplinkspeed',this),Ember.I18n.t('fwa.livetraffic.downlinkspeed',this),Ember.I18n.t('fwa.livetraffic.avgInUtilization',this),Ember.I18n.t('fwa.livetraffic.avgOutUtilization',this),'','','','','']; //No I18N
			gridDet.colModelList = [{ name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'avgBwSpeedIn', index: 'avgBwSpeedIn',hidden:true,classes:'GridColHidden'}, //No I18N
			    	{ name: 'avgBwSpeedOut', index: 'avgBwSpeedOut',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'dispName', index: 'dispName',classes:"pointer", width:40,sortable:true}, //No I18N
					{ name: 'iP', index: 'iP', width:45,formatter:ipWithMask,sortable:true}, //No I18N
					{ name: 'firewallDispName', index: 'firewallDispName',width:45,sortable:true}, //No I18N
					{ name: 'upSpeed', index: 'upSpeed', width:25,sorttype:fwacustomsort,sortable:true}, //No I18N
					{ name: 'downSpeed', index: 'downSpeed', width:25,sorttype:fwacustomsort,sortable:true}, //No I18N
					{ name: 'avgBandwidthIn', hidden:hideEE, search:false, index: 'avgBandwidthIn', width:50,sorttype:'float',sortable:true,formatter:getfwaUsageGraphListIn}, //No I18N
					{ name: 'avgBandwidthOut', hidden:hideEE, search:false, index: 'avgBandwidthOut', width:50,sorttype:'float',sortable:true,formatter:getfwaUsageGraphListOut}, //No I18N
					{ name: 'ifMask', index: 'ifMask', width:35,sortable:false,hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'snmpCommunity', index: 'snmpCommunity', width:35,sortable:false,hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'snmpPort', index: 'snmpPort', width:35,sortable:false,hidden:true,classes:'GridColHidden'}, 	//No I18N
					{ name: 'id', index: 'id',hidden:true,classes:'GridColHidden'}, //No I18N
					{ name: 'fullViewIcon', index: 'fullViewIcon',title:false,width:10,formatter:fwaDevPopoutImg} //No I18N
					
				];
		}
		}else if(filterType === "Users"){//No I18N
			if(viewType == "Grid"){
				gridDet.colNamesList = ['','','',Ember.I18n.t('webclient.admin.users.username',this),Ember.I18n.t('webclient.fwa.hits',this),Ember.I18n.t('widget.col.duration',this),Ember.I18n.t('webclient.fwa.total.traffic',this)]; //No I18N
				gridDet.colModelList = [
										{ name: 'clrCode', index: 'clrCode',hidden:true,formatter:fwaInvColorFormatter}, //No I18N
										{ name: 'trafficIcon', index: 'trafficIcon',search:false,width:4,classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
											return "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>";
										}}, 
										{ name: 'UserNameUnknown', index: 'UserNameUnknown',search:false,classes:"pointer", width:3,formatter:function(cellValue, options, rowdata, action){//No I18N
								        	if(rowdata.UserName=="Unknown"){
								        		return '<a class="hasHelpCard hasHelpCard4 hasHelpCardHover" style="cursor:default;right:5px" title="'+Ember.I18n.t('webclient.fwa.inventory.unknown.user',this)+'"  tabindex="-1"></a>';
								        	}
								        	else{
								        		return '';
								        	}
								        }}, 
								        { name: 'UserName', index: 'UserName',classes:"pointer", width:30}, //No I18N
								        { name: 'Hits', index: 'Hits', classes:"pointer", width:30,sorttype:'int',sortable:true}, //No I18N
										{ name: 'Duration', index: 'Duration', classes:"pointer", width:30}, //No I18N
										{ name: 'Traffic', index: 'Traffic', width:25,sortable:true} //No I18N
									];
			}else{			
				gridDet.colNamesList = ['','',Ember.I18n.t('webclient.admin.users.username',this),Ember.I18n.t('webclient.fwa.hits',this),Ember.I18n.t('widget.col.duration',this),Ember.I18n.t('webclient.fwa.total.traffic',this),'','']; //No I18N
				gridDet.colModelList = [{ name: 'clrCode', index: 'clrCode',formatter:fwaInvColorFormatter}, //No I18N
				        { name: 'statusKey', index: 'statusKey',classes:"pointer", width:30,hidden:true}, //No I18N
				        { name: 'UserName', index: 'UserName',classes:"pointer", width:30,sortable:true}, //No I18N
						{ name: 'Hits', index: 'Hits', classes:"pointer",sorttype:'int',sortable:true, width:30,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.fwa.hits',this)+" : "+cellValue}}, //No I18N
						{ name: 'Duration', index: 'Duration', classes:"pointer",sortable:true, width:30,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('widget.col.duration',this)+" : "+cellValue}}, //No I18N
						{ name: 'Traffic', index: 'Traffic', width:25,sorttype:'int',sortable:true,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.fwa.total.traffic',this)+" : "+cellValue}}, //No I18N
						{ name: 'statusKey', index: 'statusKey',hidden:true,classes:'GridColHidden'}, //No I18N
						{ name: 'fullViewIcon', index: 'fullViewIcon',title:false,width:10,formatter:fwaDevPopoutImg} //No I18N
					];
			}
		
		
	}else if(filterType === "Clouds"){//No I18N
		if(viewType == "Grid"){
			gridDet.colNamesList = ['','',Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),Ember.I18n.t('webclient.common.widgets.category',this),Ember.I18n.t('webclient.fwa.total.traffic',this)]; //No I18N
			gridDet.colModelList = [
			        { name: 'statusKey', index: 'statusKey',hidden:true,classes:'GridColHidden'}, //No I18N
			        { name: 'trafficIcon', index: 'trafficIcon',search:false,width:4,classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
						return "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>";
					}}, 
			        { name: 'Service', index: 'Service',classes:"pointer", width:30}, //No I18N
					{ name: 'Category', index: 'Category', classes:"pointer", width:30}, //No I18N
					{ name: 'Total Bytes', index: 'Total Bytes', width:30,sortable:true} //No I18N
				];
		}else{			
			gridDet.colNamesList = ['','',Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),Ember.I18n.t('webclient.common.widgets.category',this),Ember.I18n.t('webclient.fwa.total.traffic',this),'','']; //No I18N
			gridDet.colModelList = [{ name: 'clrCode', index: 'clrCode',formatter:fwaInvColorFormatter, search:false,width:20}, //No I18N
			        { name: 'statusKey', index: 'statusKey',classes:"pointer", width:30,hidden:true}, //No I18N
			        { name: 'Service', index: 'Service',classes:"pointer", width:30,sortable:true}, //No I18N
					{ name: 'Category', index: 'Category', classes:"pointer",sortable:true, width:30,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.common.widgets.category',this)+" : "+cellValue}}, //No I18N
					{ name: 'Total Bytes', index: 'Total Bytes', width:30,sortable:true,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.fwa.total.traffic',this)+" : "+cellValue}}, //No I18N
					{ name: 'statusKey', index: 'statusKey',classes:"pointer", width:30,hidden:true}, //No I18N
					{ name: 'fullViewIcon', index: 'fullViewIcon',title:false,width:10,formatter:fwaDevPopoutImg} //No I18N
				];
		}
	}else if(filterType === "Rules"){//No I18N
		if(viewType == "Grid"){
			gridDet.colNamesList = ['','',Ember.I18n.t('webclient.admin.alarmesc.ruleTitle',this),Ember.I18n.t('webclient.fault.event.severity',this),Ember.I18n.t('webclient.fwa.hits',this),Ember.I18n.t('webclient.fwa.total.traffic',this)]; //No I18N
			gridDet.colModelList = [{ name: 'RBBGID', index: 'RBBGID',hidden:true,classes:'GridColHidden'}, //No I18N
                    { name: 'trafficIcon', index: 'trafficIcon',search:false,width:5,classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
						return "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>";
					}}, 
			        { name: 'Rule', index: 'Rule',classes:"pointer", width:30,sorttype: 'int'}, //No I18N
			        { name: 'Status', index: 'Status', width:30}, //No I18N
					{ name: 'Hits', index: 'Hits',sorttype:'int',sortable:true, width:30}, //No I18N
					{ name: 'Total Bytes', index: 'Total Bytes', width:30,sortable:true} //No I18N
				];
		}else{			
			gridDet.colNamesList = ['','',Ember.I18n.t('webclient.admin.alarmesc.ruleTitle',this),Ember.I18n.t('webclient.fault.event.severity',this),Ember.I18n.t('webclient.fwa.hits',this),Ember.I18n.t('webclient.fwa.total.traffic',this),'','']; //No I18N
			gridDet.colModelList = [{ name: 'clrCode', index: 'clrCode',formatter:fwaRuleColorFormatter, search:false,width:20}, //No I18N
			        { name: 'RBBGID', index: 'RBBGID',classes:"pointer", width:30,hidden:true}, //No I18N
			        { name: 'Rule', index: 'Rule',classes:"pointer", width:30,sortable:true,sorttype: 'int'}, //No I18N
					{ name: 'Status', index: 'Status', classes:"pointer",sortable:true, width:30,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+" : "+cellValue}}, //No I18N
					{ name: 'Hits', index: 'Hits', classes:"pointer",sorttype:'int',sortable:true, width:30,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.fwa.hits',this)+" : "+cellValue}}, //No I18N
					{ name: 'Total Bytes', index: 'Total Bytes', width:30,sortable:true,formatter:function(cellValue, options, rowdata, action){return Ember.I18n.t('webclient.fwa.total.traffic',this)+" : "+cellValue}}, //No I18N
					{ name: 'RBBGID', index: 'RBBGID',classes:"pointer", width:30,hidden:true}, //No I18N
					{ name: 'fullViewIcon', index: 'fullViewIcon',title:false,width:10,formatter:fwaDevPopoutImg} //No I18N
				];
		}
	}else if(filterType === "Rulemgmt"){//No I18N

		var type="Device";//No I18N
		if(OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type != undefined && OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0] != undefined && OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0] == "DevGrp"){
			type=OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0];
		}
		
		if(type == "Device"){
			gridDet.colNamesList = [Ember.I18n.t('webclient.devices.details.vendor',this),'','','','','','','',Ember.I18n.t('webclient.fault.addnotes.device_name',this),Ember.I18n.t('webclient.fwa.inventory.license',this),Ember.I18n.t('webclient.topo.ipAddress',this),Ember.I18n.t('opstor.inventory.accordance.diskdrive.mode',this),Ember.I18n.t('webclient.fwa.rulemgmt.rule.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.object.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.unassigned.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.risk.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.security.stats',this),'']; //No I18N
			gridDet.colModelList = [
			                        { name: 'vendor',index:'vendor',hidden:true}, //No I18N
			                        { name: 'isdevRuleConfigured', index: 'isdevRuleConfigured',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'LAST_CONFIG_BACKUP_TIME', index: 'LAST_CONFIG_BACKUP_TIME',hidden:true,classes:'GridColHidden' }, //No I18N
			                        { name: 'rid', index: 'rid',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'DDID', index: 'DDID',hidden:true,classes:'GridColHidden' }, //No I18N
			    					{ name: 'resName', index: 'resName',hidden:true,classes:'GridColHidden' }, //No I18N
			                        { name: 'licenseStatus', index: 'licenseStatus',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'devRuleSchedule', index: 'devRuleSchedule',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'dispName', index: 'dispName',classes:"pointer", width:90,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						return cellValue+"<br/>("+rowdata.vendor+")";//No I18N
			    					}},
			    					{ name: 'status', index: 'status', width:50,hidden:true,formatter:fwaImageDeviceStatus,sortable:false,search:false}, //No I18N
			    					{ name: 'ip', index: 'ip', classes:"pointer",hidden:true}, //No I18N
			    					{ name: 'devRuleMode',index:'devRuleMode', width:60}, //No I18N
			    					{ name: 'RULES_STATS',index:'RULES_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							if(cellValue.Total_Rules_Count != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.security.rules',this)+" : "+cellValue.Total_Rules_Count+"</br>";
			    							}
			    							if(cellValue.Disabled_Rules_Count != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.rulemgmt.disabled.rules',this)+" : "+cellValue.Disabled_Rules_Count+"</br>";
			    							}
			    							if(cellValue.ExpiryReport != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+" : "+cellValue.ExpiryReport+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'OBJECTS_STATS',index:'OBJECTS_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							for(var i=0;i<cellValue.length;i++){
			    								retText = retText+cellValue[i].dispText+" : "+cellValue[i].count+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'UNASSIGNED_STATS',index:'UNASSIGNED_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							if(cellValue.FirewallObjects != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+" : "+cellValue.FirewallObjects+"</br>";
			    							}
			    							if(cellValue.InterfaceDetails != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+" : "+cellValue.InterfaceDetails+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'RISK_STATS', index: 'RISK_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var riskStatus='<div class="risk-counts" title="">';
			    						var colorsval = {"critical":"red","low":"green","high":"orange","medium":"yellow","attention":"violet"}; //No I18N
			    						var colorsStr = {"critical":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"high":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"medium":Ember.I18n.t('webclient.Medium',this),"low":Ember.I18n.t('webclient.ncm.tab.Low',this),"attention":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Attention',this)}; //No I18N
			    						if(cellValue == "-" || cellValue == undefined){
			    							riskStatus="-"
			    						}else{
			    							$.each(colorsStr, function(idx, val)
			    							{
			    								var level = idx;
			    								var count = val+" : "+cellValue[level];
			    								var ruleCnt = cellValue[level];
			    								riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
			    							});
				    						riskStatus += "</div>";
			    						}
			    						return riskStatus;
			    					}},
			    					{ name: 'AUDIT_STATS', index: 'AUDIT_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var riskStatus='<div class="risk-counts" title="">';
			    						var colorsval = {"CRITICAL_COUNT":"red","LOW_COUNT":"green","HIGH_COUNT":"orange","MEDIUM_COUNT":"yellow","INFORMATIONAL_COUNT":"violet"}; //No I18N
			    						var colorsStr = {"CRITICAL_COUNT":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"HIGH_COUNT":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"MEDIUM_COUNT":Ember.I18n.t('webclient.Medium',this),"LOW_COUNT":Ember.I18n.t('webclient.ncm.tab.Low',this),"INFORMATIONAL_COUNT":Ember.I18n.t('webclient.fwa.rulemgmt.informational',this)}; //No I18N
			    						if(cellValue == "-"){
			    							riskStatus="-"
			    						}else{
			    							$.each(colorsStr, function(idx, val)
			    							{
			    								if(idx != "TOTAL_COUNT"){
			    									var level = idx;
					    							var count = val+" : "+cellValue[level];
					    							var ruleCnt = cellValue[level];
					    							riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
			    								}
			    							});
				    						riskStatus += "</div>";
			    						}
			    						return riskStatus;
			    					}},
			    					{ name: 'devRuleScheduleTxt',index:'devRuleScheduleTxt',hidden:true,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						if(rowdata.devRuleSchedule === 'Enabled'){
			    					        return "<i class='icon-status5'></i>"+Ember.I18n.t('webclient.devices.intftypes.enabled',this);//No I18N
			    					    }else if(rowdata.devRuleSchedule === 'Disabled'){//No I18N
			    					        return "<i class='icon-status1'></i>"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
			    					    }else{
			    					    	return "-";
			    					    }
			    					}}
			    					];
		}else{
			gridDet.colNamesList = ['','',Ember.I18n.t('webclient.settings.devicegrp.name',this),Ember.I18n.t('webclient.ipsla.voipDashboard.Description',this),Ember.I18n.t('widget.name.firewalldevList',this),Ember.I18n.t('jsp.commonstr.DeviceCount',this),Ember.I18n.t('webclient.fwa.rulemgmt.rule.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.object.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.unassigned.stats',this),Ember.I18n.t('webclient.fwa.rulemgmt.security.stats',this)]; //No I18N
			gridDet.colModelList = [
			                        { name: 'devGrpId', index: 'devGrpId',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'devList', index: 'devList',hidden:true,classes:'GridColHidden'}, //No I18N
			                        { name: 'dispName', index: 'dispName',classes:"pointer"}, //No I18N
			    					{ name: 'desc', index: 'desc',hidden:true}, //No I18N
			    					{ name: 'devListDiv',index:'devListDiv',sortable:false,formatter:fwaRuleMgmtInvDevListFormatter,search:false}, //No I18N
			    					{ name: 'devCount',index:'devCount',hidden:true}, //No I18N
			    					{ name: 'RULES_STATS',index:'RULES_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							if(cellValue.Total_Rules_Count != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.security.rules',this)+" : "+cellValue.Total_Rules_Count+"</br>";
			    							}
			    							if(cellValue.Disabled_Rules_Count != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.rulemgmt.disabled.rules',this)+" : "+cellValue.Disabled_Rules_Count+"</br>";
			    							}
			    							if(cellValue.ExpiryReport != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.rule.expiry.expired',this)+" : "+cellValue.ExpiryReport+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'OBJECTS_STATS',index:'OBJECTS_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							for(var i=0;i<cellValue.length;i++){
			    								retText = retText+cellValue[i].dispText+" : "+cellValue[i].count+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'UNASSIGNED_STATS',index:'UNASSIGNED_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var retText='';
			    						if(cellValue == "-"){
			    							retText = "-";
			    						}else{
			    							if(cellValue.FirewallObjects != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.unassigned.objects',this)+" : "+cellValue.FirewallObjects+"</br>";
			    							}
			    							if(cellValue.InterfaceDetails != undefined){
			    								retText = retText+Ember.I18n.t('webclient.fwa.unassigned.interfaces',this)+" : "+cellValue.InterfaceDetails+"</br>";
			    							}
			    						}
			    						return retText;
			    					}},
			    					{ name: 'AUDIT_STATS', index: 'AUDIT_STATS',sortable:false,search:false,formatter:function(cellValue, options, rowdata, action){//No I18N
			    						var riskStatus='<div class="risk-counts" title="">';
			    						var colorsval = {"CRITICAL_COUNT":"red","LOW_COUNT":"green","HIGH_COUNT":"orange","MEDIUM_COUNT":"yellow","INFORMATIONAL_COUNT":"violet"}; //No I18N
			    						var colorsStr = {"CRITICAL_COUNT":Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this),"HIGH_COUNT":Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this),"MEDIUM_COUNT":Ember.I18n.t('webclient.Medium',this),"LOW_COUNT":Ember.I18n.t('webclient.ncm.tab.Low',this),"INFORMATIONAL_COUNT":Ember.I18n.t('webclient.fwa.rulemgmt.informational',this)}; //No I18N
			    						if(cellValue == "-"){
			    							riskStatus="-"
			    						}else{
			    							$.each(colorsStr, function(idx, val)
			    							{
			    								if(idx != "TOTAL_COUNT"){
			    									var level = idx;
			    									var count = val+" : "+cellValue[level];
			    									var ruleCnt = cellValue[level];
			    									riskStatus += '<span class="risk-count-'+colorsval[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';  
			    								}
			    							});
				    						riskStatus += "</div>";
			    						}
			    						return riskStatus;
			    					}}
			    					];
		}	
	
	}
	
	return gridDet;
}

function fwaImageDeviceStatus(cellValue, options, rowdata, action)
{
    if(rowdata.licenseStatus === 1){
        return Ember.I18n.t("webclient.map.view.managed");//No I18N
    }else{
        return Ember.I18n.t("webclient.map.view.unmanaged");//No I18N
    }
}

function fwacustomsort(cell){
    if(cell.indexOf("KB")>0 || cell.indexOf("Kbps")>0)//No I18N 
    {
        return parseFloat(cell) * 1024;
    }
    else if(cell.indexOf("MB")>0 || cell.indexOf("Mbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024;
    }
    else if(cell.indexOf("GB")>0 || cell.indexOf("Gbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024* 1024;
    }
    else if(cell.indexOf("TB")>0 || cell.indexOf("Tbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024* 1024*1024;
    }
    else if(cell.indexOf("Bytes")>0 || cell.indexOf("bps")>0)//No I18N  
    {   
        return parseFloat(cell) ;
    }
    else if(cell.indexOf("-") != -1)//No I18N   
    {
        return 0 ;
    }
    else
    {
        return parseFloat(cell);
    }
}

function ipWithMask(cellValue, options, rowdata, action){
	if(cellValue != undefined && cellValue != null && cellValue != '-' && cellValue != ""){
		var ifMask = rowdata.ifMask;
		var ifMask = (ifMask != undefined && ifMask != null && ifMask != '-')?(ifMask):('255.255.255.255');//No I18N

		return cellValue+"/"+ifMask;//No I18N
	}
	return '-';
}

function getfwaINUsageGraph(cellValue, options, rowdata, action)
{
    var ipUtilization = Math.round(cellValue);
    if(cellValue > 100){
    	ipUtilization=">100";//No I18N
    	cellValue=100;
    }
    var lowUtil = 20;
    var highUtil = 80;
    var bgUtil = Math.round((cellValue * 80) / 100);
    var usageColor = "severity_5";//No I18N
    if (cellValue > lowUtil && cellValue <= highUtil) {
        usageColor = "severity_3";//No I18N
    } else if (cellValue > highUtil) {
        usageColor = "severity_1";//No I18N
    }
    var perClass = (cellValue == 100) ? "redtxt" : "txt"; //No I18N
    var renderString = "<div nowrap style='float:left;white-space: nowrap;' title="+Math.round(cellValue)+"%><div style='float:left;padding-top:0px;background-color: #e4e2e5; width:80px;'><div class=" + usageColor + " style=\"width:" + bgUtil + "px;height:20px;float:left;\"> </div></div><span nowrap style='float:left';title='"+ bgUtil +"'>&nbsp;" + rowdata.avgBwSpeedIn + " </span></div>"; //No I18N
    return renderString;
}

function getfwaOutUsageGraph(cellValue, options, rowdata, action)
{
    var ipUtilization = Math.round(cellValue);
    if(cellValue > 100){
    	ipUtilization=">100";//No I18N
    	cellValue=100;
    }
    var lowUtil = 20;
    var highUtil = 80;
    var bgUtil = Math.round((cellValue * 80) / 100);
    var usageColor = "severity_5";//No I18N
    if (cellValue > lowUtil && cellValue <= highUtil) {
        usageColor = "severity_3";//No I18N
    } else if (cellValue > highUtil) {
        usageColor = "severity_1";//No I18N
    }
    var perClass = (cellValue == 100) ? "redtxt" : "txt"; //No I18N
    var renderString = "<div nowrap style='float:left;white-space: nowrap;' title="+Math.round(cellValue)+"%><div style='float:left;padding-top:0px;background-color: #e4e2e5; width:80px;'><div class=" + usageColor + " style=\"width:" + bgUtil + "px;height:20px;float:left;\"> </div></div><span nowrap style='float:left';title='"+ bgUtil +"'>&nbsp;" + rowdata.avgBwSpeedOut + " </span></div>"; //No I18N
    return renderString;
}

function fwaInvColorFormatter(cellValue, options, rowdata, action){
	var status = 1;
	if(rowdata.statusKey === undefined) {
		status = 1;
	}else {
		if(rowdata.statusKey == "G80"){
			status = 1;
		}else if(rowdata.statusKey == "20-80"){
			status = 2;
		}else{
			status = 5;
		}
	}
	var str = "<i class='severity_"+status+" statusColor'></i>";//No I18N
	return str;	
}

function fwa_drawInventoryListPDFHeaderInfo(snapId, widData, params) {
	$('#zchartgraph2').empty();
	var header = $('<header id="pageHeader"><div class="green-border"> </div></header>'); //No I18N
	$('#zchartgraph2').append(header); //No I18N

	var $maindiv = $("<main class='mainContent'></main>"); //No I18N
	$('#zchartgraph2').append($maindiv); //No I18N
	
	if(window.OPM.productName == "Firewall Analyzer"){ //No I18N
	$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>'); //No I18N
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>'); //No I18N
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>'); //No I18N
	$maindiv.append($contDiv);

	if(params.reportTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf">'+params.reportTitle+'</div>'); //No I18N
	}else{
		$contDiv.append('<div class="fwaHeading_pdf">'+widData.reportTitle+'</div>'); //No I18N
	}

	var tableContent='<table><tbody>'; //No I18N
	if(params.timeFrame != undefined){
		tableContent = tableContent+"<tr><td colspan='2' style='word-break:break-all'><span>"+Ember.I18n.t('webclient.vimonitor.devices.overview.TimePeriod',this)+"</span> : "+params.timeFrame+"</td></tr>";//NO I18N 
	}
	tableContent=tableContent+"</tbody>";//No I18N
	if(params.startDate != undefined && params.endDate != undefined){
		tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('widget.col.start.time')+"</span> : "+params.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+params.endDate+"</td></tr></tfoot>";//NO I18N 
	}
	if(tableContent != '<table><tbody></tbody>'){ //No I18N
		tableContent=tableContent+"</table>"; //No I18N
		var $paramTab=$('<div class="fwaTableUi titleTable"></div>'); //No I18N
		$contDiv.append($paramTab);
		$paramTab.html(tableContent);
	}
	var criteria = [];
	var advancedFilters = JSON.parse(params.advancedFilters);
	if (advancedFilters && Object.keys(advancedFilters).length > 0) {	
		criteria.push(params.advancedFilters);
	}

	if (criteria.length > 0) {
		var condition = Ember.I18n.t("webclient.attacks.criteria.all"); //NO I18N
		var defTableDiv = '<h2 class="fwaSubHeading">' + Ember.I18n.t('webclient.auditreport.filters', this) + '(' + condition + ')</h2>'; //No I18N
		defTableDiv = defTableDiv + '<table><thead><tr><th style="width:50%">' + Ember.I18n.t('webclient.devices.fields', this) + '</th><th style="width:50%">' + Ember.I18n.t('webclient.widget.value', this) + '</th></tr></thead>';//NO I18N
		
		$.each(criteria, function(index, value) {
			var jsonData = JSON.parse(value);
			
			Object.keys(jsonData).forEach(function(key) {
					var displayKey = ""; //No I18N
					if (key == "firewallStatus") { //No I18N
						displayKey = Ember.I18n.t('snapshot.desc.firewall', this)+" "+Ember.I18n.t("opu.views.STATUS"); //No I18N 
					} else if (key == "Resources__VENDOR_TYPE") { //No I18N
						displayKey = Ember.I18n.t('opstor.inventory.vendor', this) + ' ' + Ember.I18n.t('opstor.inventory.type', this); //No I18N
					} else if (key == "Resources__RESOURCETYPE") { //No I18N
						displayKey = Ember.I18n.t('webclient.widget.resourcetype', this); //No I18N
					} else if (key == "Resources__LIC_STATUS") { //No I18N
						displayKey = Ember.I18n.t('webclient.fwa.inventory.license', this) + ' ' + Ember.I18n.t('opu.views.STATUS', this); //No I18N
					} else if (key == "type"){ //No I18N
						displayKey = Ember.I18n.t('webclient.devices.details.type', this); //No I18N
					} else if(key == "InterfaceInfo__RID" || key == "Rule__FWDevice" ){ //No I18N
						displayKey = Ember.I18n.t("webclient.devices.details.devicename"); //No I18N
					} else if (key == "User__Proto") { //No I18N
						displayKey = Ember.I18n.t('webclient.prot.grps', this); //No I18N
					} else if (key == "Cloud__Cat") { //No I18N
						displayKey = Ember.I18n.t('webclient.appmanager.cloud', this)+" "+Ember.I18n.t("Category"); //No I18N
					} else if (key == "Cloud__Usage") { //No I18N
						displayKey = Ember.I18n.t('webclient.appmanager.cloud', this)+" "+Ember.I18n.t("webclient.devices.realtime.usage"); //No I18N
					} else{
						displayKey = key;
					}
					var value = jsonData[key];
					if( key == "firewallStatus" ){ //No I18N
					  if(value.length == 1){
						  if(value[0] == 'clear'){ //No I18N
							  value = Ember.I18n.t('webclient.fwa.flow.ok', this); //No I18N
						  }else if(value[0] == 'critical'){ //No I18N
							  value = " > 60"+Ember.I18n.t('webclient.map.filemonitor.fileage.mins',this);//NO I18N
						  }
					  }else{
						  value = Ember.I18n.t('webclient.fwa.flow.ok', this)+","+Ember.I18n.t('webclient.fwa.no.flow',this)+" > 60"+Ember.I18n.t('webclient.map.filemonitor.fileage.mins',this);//NO I18N
					  }
					} else if (key == "Resources__LIC_STATUS") { //No I18N
						value = value.map(function(val) {
							return val == 0 ? Ember.I18n.t('webclient.map.flash.Unmanaged', this) : Ember.I18n.t('webclient.map.view.managed', this); //No I18N
						});
						value = value.join(', '); //No I18N
					} else if (key == "User__Usage") { //No I18N
						if (value.length == 1 && value[0].startsWith("L")) { //No I18N
							displayValue = "< " + value[0].substring(1) + "% Traffic"; //No I18N
						} else if (value.length == 2) {
							displayValue = "< " + value[0].substring(1) + "% Traffic, " + value[1].replace("-", " - ") + "% Traffic"; //No I18N
						}
						value = displayValue;
					} else if (key == "Cloud__Usage") { //No I18N
						if (value.length == 1 && value[0].startsWith("L")) { //No I18N
							displayValue = "< " + value[0].substring(1) + "% Traffic"; //No I18N
						} else if (value.length == 1 && value[0].startsWith("G")) { //No I18N
							displayValue = "> " + value[0].substring(1) + "% Traffic"; //No I18N
						} else if (value.length == 2) {
							displayValue = "<  20% Traffic" +" , "+ "> 80% Traffic"; //No I18N
						}
						value = displayValue;
					} else if (key == "User__Proto" || key == "InterfaceInfo__RID" || key == "Rule__FWDevice") { //No I18N
						var protocolgroup = JSON.parse(params.fwaFilters);
						var protocolTitles = [];
						for (var i = 0; i < value.length; i++) {
							for (var j = 0; j < protocolgroup.length; j++) {
								if (protocolgroup[j].key == value[i]) {
									protocolTitles.push(protocolgroup[j].actualTitle);
									break;
								}
							}
						}
						value = protocolTitles.join(', '); //No I18N
					} else if (key == "Cloud__Cat") { //No I18N
						value = value.join(', '); //No I18N
					} else if (key == "Rule__Status") { //No I18N
						if(value.length == 1){
							value = value[0] == "permit" ? Ember.I18n.t('webclient.fwa.allowed', this) : Ember.I18n.t('webclient.fwa.denied', this); //No I18N
						}else{
							value = Ember.I18n.t('webclient.fwa.allowed', this)+" , "+Ember.I18n.t('webclient.fwa.denied', this); //No I18N
						}
					}
					defTableDiv += '<tr><td>' + displayKey + '</td><td>' + value + '</td></tr>'; //NO I18N
			});
		});
		
		defTableDiv += '</table>'; //NO I18N
		var $deftableTab = $('<div class="fwaTableUi noBorderTheadBottom"></div>'); //No I18N
		$contDiv.append($deftableTab);
		$deftableTab.html(defTableDiv);
	}
	$contDiv.append('<div id="widgetElement_'+snapId+'" class="" style="width:100%;"></div>'); //No I18N
	$contDiv.append('<p class="PDFPrivacyMsgDiv"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>'); //No I18N
}

function fwaVpnSummaryIndexReport(snapId, widData, params) {
	$('#zchartgraph2').empty();
	var header = $('<header id="pageHeader"><div class="green-border"> </div></header>'); //No I18N
	$('#zchartgraph2').append(header); //No I18N
	var $maindiv = $("<main class='mainContent'></main>"); //No I18N
	$('#zchartgraph2').append($maindiv); //No I18N
	if(window.OPM.productName == "Firewall Analyzer"){ //No I18N
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>'); //No I18N
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>'); //No I18N
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>'); //No I18N
	$maindiv.append($contDiv); 
	if(params.reportTitle != undefined){
		$contDiv.append('<div class="fwaHeading_pdf">'+params.reportTitle+'</div>'); //No I18N
	}else{
		$contDiv.append('<div class="fwaHeading_pdf">'+widData.reportTitle+'</div>'); //No I18N
	}
	var tableContent='<table><tbody>'; //No I18N
	if(params.timeFrame != undefined){
		tableContent = tableContent+"<tr><td colspan='2' style='word-break:break-all'><span>"+Ember.I18n.t('webclient.vimonitor.devices.overview.TimePeriod',this)+"</span> : "+params.timeFrame+"</td></tr>"; //No I18N
	}
	tableContent=tableContent+"</tbody>"; //No I18N
	if(params.startDate != undefined && params.endDate != undefined){
		tableContent = tableContent+"<tfoot><tr><td><span>"+Ember.I18n.t('widget.col.start.time')+"</span> : "+params.startDate+"</td><td><span>"+Ember.I18n.t('webclient.devices.details.endtime')+"</span> : "+params.endDate+"</td></tr></tfoot>"; //No I18N
	}
	if(params.deviceName){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+Ember.I18n.t('webclient.fault.addnotes.device_name')+"</span> : "+params.deviceName+"</td></tr>"; //No I18N
	}
	if(tableContent != '<table><tbody></tbody>'){ //No I18N
		tableContent=tableContent+"</table>"; //No I18N
		var $paramTab=$('<div class="fwaTableUi titleTable"></div>'); //No I18N
		$contDiv.append($paramTab);
		$paramTab.html(tableContent);
	}
	$maindiv.append('<div id="widgetElement_'+snapId+'" class=""></div>'); //No I18N
	$contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%"><i>'+Ember.I18n.t("webclient.advance.settings.note")+':</i> '+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg")+'</p>'); //No I18N
	var widParams = {};
	widParams.widgetElement = $("#widgetElement_" + snapId); //No I18N
}

function fwaVpnSummaryMultipleReport(snapId, widData, reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //No I18N
	var reportList = widData.selreportList;
	for (var ij = 0; ij < reportList.length; ij++) {
		fwaVpnSummaryCompleteReport(ij, reportList[ij].repData, reqParams, widParams, reportList[ij].rbbTitle);
	}
}

function fwaVpnSummaryCompleteReport(snapId,widData,reqParams,widParams,repTitle){
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>'); //No I18N
	$('.mainContent').append($contDiv); //No I18N
	if (repTitle != undefined) {
		$contDiv.append('<div class="fwaHeading_pdf">' + repTitle + '</div>'); //No I18N
	}
	var widElem = $('<div id="widgetElement_' + snapId + '" class="" style="width:100%;"></div>'); //No I18N
	widParams.widgetElement = widElem;
	$contDiv.append(widElem);
	fwa_drawVPNReportWidget(snapId, widData, widParams);
}

function fwa_drawVPNReportWidget(snapId, widData, widParams) {
	var $widgetElem = widParams.widgetElement;
	$widgetElem.find('.graphWidget').remove(); //No I18N
	var $contentdiv = $("<div class='content graphWidget'></div>"); //No I18N
	$contentdiv.append("<div id='perfGraph" + snapId + "'></div>"); //No I18N
	$widgetElem.append($contentdiv);
	var colorCodes = ["", "#45bd7f", "#ed4f4f", "#42cdcd", "#528ee9"]; //No I18N
	var colorCode = colorCodes[snapId] || "#528ee9"; //No I18N
	var arrayObj = { "placeholder": [], "chartobj": [] }; //No I18N
	var widgetType = "bar"; //No I18N
	if (widData && widData.widgetAdditionalData && widData.widgetAdditionalData.chartType != undefined) {
		widgetType = widData.widgetAdditionalData.chartType;
		if (widgetType == "line") { //No I18N
			widgetType = "area"; //No I18N
		}
	}
	var testObj;
	if (widgetType == "map") { //No I18N
		testObj = {
			"id": "perfGraph" + snapId, //No I18N
			"jsonData": widData.WidgetData.chartData, //No I18N
			"legend": { //No I18N
				"enabled": true, //No I18N
				"vAlign": "center", //No I18N
				"hAlign": "center", //No I18N
				"colors": ["#f44336", "#FF8A65", "#FF9800", "#26A69A", "#81C784", "#C0CA33", "#E6EE9C", "#CDDC39"], //No I18N
				"patternPallete": ["stripes-fill"], //No I18N
				"marginRight": 20, //No I18N
				"colorBox": { "strokeColor": "black", "strokeWidth": 1 } //No I18N
			},
			"plot": { "events": { "cursor": "pointer" } } //No I18N
		};
	} else if (widgetType == "bar" || widgetType == "area") { //NO I18N
		testObj = {
			id: "perfGraph" + snapId, //No I18N
			type: widgetType,
			"yaxiscolumnorder": [0], //No I18N
			jsonData: widData.WidgetData.chartData,
			series: "multi", //No I18N
			height: 350,
			columns: {
				datatype_1: (snapId == 3 || snapId == 4) ? "time" : "ordinal", //No I18N
				datatype_2: 'numeric', //No I18N
				columnname_1: "VPN Name", //No I18N
				columnname_2: "Count" //No I18N
			},
			tooltip: [0, 1],
			canvas: { title: { show: false, text: "" } }, //No I18N
			chart: { stacked: true }, 
			area: { marker: true }, 
			legend: { "enabled": false, "fontSize": 10 }, //No I18N
			bar: { rotated: false, levelMarker: false },
			axes: {
				"rotated": false, //No I18N
				"xaxis": { //No I18N
					"label": { //No I18N
						"text": Ember.I18n.t("NFAWidget.Time"), //No I18N
						"fontSize": 13, //No I18N
						"fontWeight": 'Bold', //No I18N
						"fontFamily": "LatoRegular" //No I18N
					},
					"ticklabel": { "alignMode": "rotate" }, //No I18N
					"axisline": { "show": (snapId == 1 || snapId == 2) ? false : true } //No I18N
				},
				"yaxis": [ //No I18N
					{
						"label": { //No I18N
							"text": (snapId == 3 ? Ember.I18n.t("webclient.getquote.module.usersCount") : Ember.I18n.t("webclient.fwa.vpn.sessionCount")), //No I18N
							"fontSize": 13, //No I18N
							"fontWeight": 'Bold', //No I18N
							"fontFamily": "LatoRegular" //No I18N
						},
						"show": (snapId == 1 || snapId == 2) ? false : true //No I18N
					}
				]
			},
			"plot": { //No I18N
				"plotoptions": { //No I18N
					"area": { //No I18N
						"gradients": { //No I18N
							"type": "linear", //No I18N
							"options": { //No I18N
								"linear": { //No I18N
									"colorGamma": [3, 0], //No I18N
									"x2": 0, //No I18N
									"y1": 100, //No I18N
									"y2": 40 //No I18N
								}
							}
						},
						"mode": "cardinal", //No I18N
						"strokeWidth": 2, //No I18N
						"fillOpacity": 0.37209302325581395, //No I18N
						"animation": { "type": "pointTween" } //No I18N
					},
					"bar": { //No I18N
						"border": { "show": true, "radius": "3" }, //No I18N
						"levelMarker": { "enabled": false }, //No I18N
						"datalabels": { "show": true, "labelPos": "middle", "fontColor": "#FFFFFF" } //No I18N
					}
				}
			},
			"legend": { //No I18N
				"colors": [colorCode], //No I18N
				"enabled": false //No I18N
			},
			isFWAChart: true
		};
	}
	arrayObj.chartobj.push(testObj);
	arrayObj.placeholder.push("perfGraph" + snapId); //No I18N
	if (widgetType == "map") { //No I18N
		if (document.getElementById("perfGraph" + snapId)) { //No I18N
			zMap(arrayObj, 0, "Count"); //No I18N
		}
	} else {
		if (document.getElementById("perfGraph" + snapId)) { //No I18N
			zChart(arrayObj);
		}
	}
}

