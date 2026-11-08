window.OPM={'isPDF':true,pattern:'d MMM yyyy hh:mm:ss a z','severTimeZone':'exportPDF'};//No I18N
mtz_pattern = window.OPM.pattern;
mtz_pattern = mtz_pattern.replace(/yy/gi,"YY");//No I18N
mtz_pattern = mtz_pattern.replace(/d/gi,"D");//No I18N
mtz_pattern = mtz_pattern.replace(/E/gi,"d");//No I18N
OPMClient=Ember.Application.create();
function drawFWAPDFWidgets(widData,width,height) 
{
	
	$('#contentDiv').attr('id',"widgetElement");
	$('#contentDiv').append('<div class="product__logo" style="display:none"><img src="/apiclient/fluidicv2/img/fwa-footer.png" class="fwaPdfLogoNew"></div>');
	var completeData=JSON.parse(widData.completeReportData);
	var completeParam=JSON.parse(widData.completeParams);
	var resourceKeyVal=JSON.parse(widData.resourceKeyVal);
	if(completeParam.template != undefined){
		if(completeParam.template == "ReportProfile"){
			fwa_drawReportFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawReportProfileWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "PolicyBasedReport"){//NO I18N
			fwa_drawReportFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawPolicyBasedReportWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "NATBasedReport"){//NO I18N
			fwa_drawReportFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawNATBasedReportWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "Compliance"){//NO I18N
			fwa_drawReportFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawComplianceReportWidgets(completeData,resourceKeyVal,completeParam,height,width);
		}else if(completeParam.template == "SecurityAuditReport"){//NO I18N
			fwa_drawFWASecurityAuditWidget(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "Change Management Notification"){//NO I18N
			fwa_drawChangeMgmtFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawChangeMgmtWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "Rule Change History Notification"){//NO I18N
			fwa_drawRuleChangeHistoryFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawRuleChangeHistoryWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}else if(completeParam.template == "RiskAnalysisReport"){//NO I18N
			fwa_drawRiskAnalysisFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawRiskAnalysisReport(completeData,completeParam,resourceKeyVal);
		}else if(completeParam.template == "RuleExpiryReport"){//NO I18N
			fwa_drawReportFrontPage(completeData,completeParam,resourceKeyVal,height,width);
			fwa_drawRuleExpiryWidgets(completeData,completeParam,height,width,resourceKeyVal);
		}
	}
    setTimeout(function(){
    	window.canvasLoded=true;
    },5000);

}

function jqGridHTMLEncode(cellValue, options, rowdata, action)
{
    return $.jgrid.htmlEncode(cellValue);
}

function fwa_loadComplianceTableData(ij,singleWidData,resourceKeyVal){
	var response=singleWidData.resultData;
	
	var colNamesList = singleWidData.columnHeader;
	var colModelList = [];
	for(var i=0;i<colNamesList.length;i++){
		colModelList.push({'name':i,'index':i}); //No I18N
	}
	
	var gridData=(response.data != undefined) ? response.data : [];
	
	if(singleWidData.rbbName == "CheckList_Summary" ){
		
		for(var i=0;i<gridData.length;i++){
			var tempData=gridData[i][0];
			if(gridData[i][0].indexOf("GenericID_") >= 0){
				tempData=resourceKeyVal[gridData[i][0]];
			}
			gridData[i][0]=tempData;
		}
	}
	fwa_loadPDFJQgridWithData('#opm_Compliance_DetailGrid'+ij,gridData,colNamesList,colModelList,"","","",{},false);
}

function fwa_drawComplianceFailedReportTable(tableID,failedObjectDetail)
{
	var gridData=(failedObjectDetail.resultData != undefined && failedObjectDetail.resultData.data != undefined)? failedObjectDetail.resultData.data : [];
	var colNamesList = [];
	var colModelList = [];
	for(var ij=0;ij<failedObjectDetail.columnHeader.length-1;ij++){
		colNamesList.push(failedObjectDetail.columnHeader[ij]);
	}

	for(var ij=0;ij<failedObjectDetail.columnHeader.length-1;ij++){
		colModelList.push({'name':ij,'index':ij}); //No I18N
	}
	fwa_loadPDFJQgridWithData(tableID,gridData,colNamesList,colModelList,"","","",{},false);
}



function fwa_drawComplianceReportWidgets(widData,resourceKeyVal,reqParams,height,width){
	var widParams ={};
	widParams.widgetElement = $('.mainContent'); //NO I18N
	var complianceData=widData[0] != undefined ? widData[0] : {};
	if(complianceData.ComplianceSummaryDetail != undefined){
		var ComplianceSummaryDetail=JSON.parse(complianceData.ComplianceSummaryDetail);
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.title+'</div>');
		var widElem=$('<div class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv);		
		$contentdiv.append("<div style='padding:10px'><span>"+reqParams.reportDesc+"</span></div>");	
		fwa_loadStandardSummaryDetail($contentdiv,reqParams,resourceKeyVal);
		if(reqParams.HyperLink == "Yes" && ComplianceSummaryDetail.xmlName=="report3_table.jasper"){
			var data=(ComplianceSummaryDetail.resultData != undefined && ComplianceSummaryDetail.resultData.data != undefined) ? ComplianceSummaryDetail.resultData.data : [];
			for(var i=0;i<data.length;i++){
				data[i][2]=resourceKeyVal[reqParams.compType+"_"+data[i][0]];
			}
			if(ComplianceSummaryDetail.resultData != undefined){
				ComplianceSummaryDetail.resultData.data=data;
			}
		}
		ComplianceSummaryDetail.widgetTitle=resourceKeyVal[reqParams.compType+".SummaryReport"];
		fwa_drawFWAReportWidget(100,ComplianceSummaryDetail,reqParams,height,width);
	}
	
	if(complianceData.ComplianceReportData != undefined){
		var ComplianceReportData=JSON.parse(complianceData.ComplianceReportData);
		for(var ij=0;ij<ComplianceReportData.length;ij++){
			var singleWidData=JSON.parse(ComplianceReportData[ij].WidgetDetail);
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf">'+ComplianceReportData[ij].section+' - '+resourceKeyVal['Compliance.'+ComplianceReportData[ij].status]+'</div>');
			var widElem=$('<div class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			var $contentdiv = $("<div class='content graphWidget'></div>");
			widElem.append($contentdiv);
			$contentdiv.append("<div style='padding:10px'><span>"+resourceKeyVal[reqParams.compType+"_"+ComplianceReportData[ij].section]+"</span></div>");
			
			for(var jk=0;jk<singleWidData.length;jk++){
				var widgetData=singleWidData[jk];
				var $contentdivSub = $("<div class='content graphWidget' style='padding-top:0px'></div>");
				$contentdiv.append($contentdivSub);
				widgetData.widgetTitle = widgetData.widgetTitle == undefined ? "" : widgetData.widgetTitle ;
				$contentdivSub.append("<div style='padding:10px'><span style='color:red'>"+widgetData.widgetTitle+"</span></div>");
				$contentdivSub.append("<div class='opm_jqGridUI' style='padding-top:0px'><table id='opm_Compliance_DetailGrid"+ij+"_"+jk+"' class='ut ut-Grid'></table></div>");
				fwa_loadComplianceTableData(ij+"_"+jk,widgetData,resourceKeyVal);
			}
			
			if(ComplianceReportData[ij].status == "Fail"){
				var $contentdivSub = $("<div class='content graphWidget' style='padding-top:0px'></div>");
				$contentdiv.append($contentdivSub);
				$contentdivSub.append("<div style='padding:10px'><span style='color:red'>"+resourceKeyVal['FailedSection.Recommendation']+" : </span></div>");
				var recText='';
				if(reqParams.checkListRec[ComplianceReportData[ij].section] != undefined){
					recText=reqParams.checkListRec[ComplianceReportData[ij].section].replace("'","`");
				}else{
					recText=resourceKeyVal[reqParams.compType+"_"+ComplianceReportData[ij].section+"_Recommendation"].replace("'","`")
				}
				
				$contentdivSub.append("<div style='padding:10px'><span>"+recText+"</span></div>");
				
			}
		}
	}
	
	if(complianceData.failedReportDataDetail != undefined){
		var failedReportDataDetail=JSON.parse(complianceData.failedReportDataDetail);
		var $contentdiv = $("<div style='border:0px;font-size:20px;color:red'><div style='font-size:17px;margin-bottom:10px'>"+resourceKeyVal.CommoncheckListString+"</div></div>");
		widParams.widgetElement.append($contentdiv);
		for(var ij=0;ij<failedReportDataDetail.length;ij++){
			var singleData=failedReportDataDetail[ij];
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf">'+singleData.widgetTitle+'</div>');
			var widElem=$('<div class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			var $contentdiv = $("<div class='content graphWidget'></div>");
			widElem.append($contentdiv);		
			$contentdiv.append("<div id='perfrmGraphSummary'></div>");
			$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_FailedReport"+ij+"' class='ut ut-Grid'></table></div>");
			fwa_drawComplianceFailedReportTable('opm_App_FailedReport'+ij,singleData);//NO I18N
		}
	}
	
	if(complianceData.ComplianceObjectSummaryDetail != undefined){
		var ComplianceObjectSummaryDetail=complianceData.ComplianceObjectSummaryDetail;
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.objectSummaryTITLE+'</div>');
		var widElem=$('<div class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv);	
		$contentdiv.append("<div id='perfrmGraphSummary'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_ObjectSummary' class='ut ut-Grid'></table></div>");
		fwa_drawPolicyObjectSummaryTable(ComplianceObjectSummaryDetail);
	}
}


function fwa_loadStandardSummaryDetail($contentdiv,reqParams,resourceKeyVal)
{
	var widHtml=$("<div class='widgetData' style='border:1px solid #DDD;border-radius:10px;background-color:#E7E7E0;min-height:165px;margin:10px'></div>");
	$contentdiv.append(widHtml);
	var netDetail=$("<div class='opmForm' style='width:50%;float:left'></div>");
	var CompDetail=$("<div class='opmForm' style='width:50%;float:right'></div>");
	widHtml.append(netDetail);
	widHtml.append(CompDetail);
	var networkDetail=reqParams.networkDetail;
	netDetail.append("<div class='opmFormRow' style='padding:5px;font-weight:bold'>"+resourceKeyVal['Compliance.NetworkDetails']+" : </div>");
	if(networkDetail.LAN != undefined && networkDetail.LAN != null){
		netDetail.append("<div class='opmFormRow' style='padding:5px'>LAN : "+networkDetail.LAN+"</div>");
	}
	if(networkDetail.WAN != undefined && networkDetail.WAN != null){
		netDetail.append("<div class='opmFormRow' style='padding:5px'>WAN : "+networkDetail.WAN+"</div>");
	}
	if(networkDetail.DMZ != undefined && networkDetail.DMZ != null){
		netDetail.append("<div class='opmFormRow' style='padding:5px'>DMZ : "+networkDetail.DMZ+"</div>");
	}
	if(networkDetail['PCI Zone'] != undefined && networkDetail['PCI Zone'] != null){
		netDetail.append("<div class='opmFormRow' style='padding:5px'>PCI Zone : "+networkDetail['PCI Zone']+"</div>");
	}
	if(networkDetail['Service Allowed'] != undefined && networkDetail['Service Allowed'] != null){
		netDetail.append("<div class='opmFormRow' style='padding:5px'>"+resourceKeyVal.Excluded_Services+" : "+networkDetail['Service Allowed']+"</div>");
	}
	if(reqParams.ruleConfigPerc != undefined && reqParams.ruleConfigPerc != null){
		CompDetail.append("<div class='opmFormRow' style='padding:5px;font-weight:bold;font-size:40px'>"+reqParams.ruleConfigPerc+" % </div>");
		CompDetail.append("<div class='opmFormRow' style='padding:5px;font-weight:bold;font-size:25px'>"+resourceKeyVal['Compliance.Compliant']+"</div>");
	}
	if(reqParams.totalCount != undefined && reqParams.totalCount != null){
		CompDetail.append("<div class='opmFormRow' style='padding:5px'>"+resourceKeyVal.Total_Comp_Section+" : "+reqParams.total+"</div>");
		CompDetail.append("<div class='opmFormRow' style='padding:5px'>"+resourceKeyVal['Status.Pass']+" : "+reqParams.passed+"</div>");
		CompDetail.append("<div class='opmFormRow' style='padding:5px'>"+resourceKeyVal['Status.Fail']+" : "+reqParams.failed+"</div>");
		CompDetail.append("<div class='opmFormRow' style='padding:5px'>"+resourceKeyVal['Compliance.UserCall']+" : "+reqParams.userCall+"</div>");
	}
	CompDetail.append("<div class='opmFormRow' style='padding:5px'>"+reqParams.ruleConfigDesc+"</div>");
}

function fwa_drawPolicyBasedReportWidgets(widData,reqParams,height,width,resourceKeyVal){
	var widParams ={};
	widParams.widgetElement = $('.mainContent'); //NO I18N
	var policyData=widData[0] != undefined ? widData[0] : {};
	if(policyData.PolicySummaryDetail != undefined){
		var PolicySummaryDetail=JSON.parse(policyData.PolicySummaryDetail);
		if(reqParams.isSingleSummaryQuery == "true"){
			fwa_drawFWAReportWidget(100,PolicySummaryDetail,reqParams,height,width);
		}else{
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.ruleSummaryTITLE+'</div>');
			var widElem=$('<div class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			var $contentdiv = $("<div class='content graphWidget'></div>");
			widElem.append($contentdiv);		
			$contentdiv.append("<div id='perfrmGraphSummary'></div>");
			$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_LegendSummary' class='ut ut-Grid'></table></div>");
			fwa_drawPolicySummaryGraph(PolicySummaryDetail);
			fwa_drawPolicySummaryTable(PolicySummaryDetail);
		}
	}
	if(policyData.PolicyDetailArray != undefined){
		var PolicyDetailArray=JSON.parse(policyData.PolicyDetailArray);
		for(var ij=0;ij<PolicyDetailArray.length;ij++){
			var singlePolicyDetail=PolicyDetailArray[ij];
			if(singlePolicyDetail.xmlName == "report10_table_GRP.jasper"){
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);
				$contDiv.append('<div class="fwaHeading_pdf">'+singlePolicyDetail.widgetTitle+'</div>');
				var widElem=$('<div class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				var $contentdiv = $("<div class='content graphWidget'></div>");
				widElem.append($contentdiv);	
				fwa_drawPolicyOptimizationDetailTable(singlePolicyDetail,$contentdiv);
			}else{
				var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
				$('.mainContent').append($contDiv);
				$contDiv.append('<div class="fwaHeading_pdf">'+singlePolicyDetail.widgetTitle+'</div>');
				var widElem=$('<div class="" style="width:100%;"></div>');
				$contDiv.append(widElem);
				var $contentdiv = $("<div class='content graphWidget'></div>");
				widElem.append($contentdiv);	
				$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_LegendPolicy"+ij+"' class='ut ut-Grid'></table></div>");
				fwa_drawPolicyDetailTable(ij,singlePolicyDetail,resourceKeyVal);
			}
		}
	}
	if(policyData.PolicyObjectSummaryDetail != undefined){
		var PolicyObjectSummaryDetail=policyData.PolicyObjectSummaryDetail;
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.objectSummaryTITLE+'</div>');
		var widElem=$('<div class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv);		
		$contentdiv.append("<div id='perfrmGraphSummary'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_ObjectSummary' class='ut ut-Grid'></table></div>");
		fwa_drawPolicyObjectSummaryTable(PolicyObjectSummaryDetail);
	}
}


function fwa_drawNATBasedReportWidgets(widData,reqParams,height,width,resourceKeyVal){
	var widParams ={};
	widParams.widgetElement = $('.mainContent'); //NO I18N
	var NATData=widData[0] != undefined ? widData[0] : {};
	
	if(NATData.NATDetailArray != undefined){
		var NATDetailArray=JSON.parse(NATData.NATDetailArray);
		var colNameList = NATData.colNameList;
		var colModelList = NATData.colModelList;
		for(var ij=0;ij<NATDetailArray.length;ij++){
			var singleNATDetail=NATDetailArray[ij];
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			$('.mainContent').append($contDiv);
			$contDiv.append('<div class="fwaHeading_pdf">'+resourceKeyVal['pdf.nat.rule.title']+'</div>');
			var widElem=$('<div class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			var $contentdiv = $("<div class='content graphWidget'></div>");
			widElem.append($contentdiv);	
			$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_LegendPolicy"+ij+"' class='ut ut-Grid'></table></div>");
			fwa_drawNATDetailTable(ij,singleNATDetail,resourceKeyVal,colNameList,colModelList);

		}
	}
	if(NATData.NATObjectSummaryDetail != undefined){
		var NATObjectSummaryDetail=NATData.NATObjectSummaryDetail;
		var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
		$('.mainContent').append($contDiv);
		$contDiv.append('<div class="fwaHeading_pdf">'+reqParams.objectSummaryTITLE+'</div>');
		var widElem=$('<div class="" style="width:100%;"></div>');
		$contDiv.append(widElem);
		var $contentdiv = $("<div class='content graphWidget'></div>");
		widElem.append($contentdiv);	
		$contentdiv.append("<div id='perfrmGraphSummary'></div>");
		$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_ObjectSummary' class='ut ut-Grid'></table></div>");
		fwa_drawPolicyObjectSummaryTable(NATObjectSummaryDetail);
	}
}


function fwa_drawPolicyOptimizationDetailTable(singlePolicyDetail,$contentdiv){
	var resultData=singlePolicyDetail.resultData;
	var finalData=[];
	var colNameList=[];
	var colModelList=[];
	if(resultData.widgetAdditionalData != undefined && resultData.widgetAdditionalData.colList != undefined){
		var colList=resultData.widgetAdditionalData.colList;
		if(colList[10]!= undefined){
			colNameList=[colList[10],colList[3],colList[4],colList[5],colList[6],colList[7]];
			colModelList.push({'name':10,'index':10}); //No I18N
		}else{
			colNameList=[colList[3],colList[4],colList[5],colList[6],colList[7]];
		}
		for(var i=3;i<=7;i++){
			colModelList.push({'name':i,'index':i}); //No I18N
		}
	}
	
	if(resultData.data != undefined){
		var optDetail=resultData.data;
		var anamolyDetail={};
		for(var ij=0;ij<optDetail.length;ij++){
			var singleDetail=optDetail[ij];
			var anomalypk=singleDetail[1];
			var desc=singleDetail[9];
			var ruleId=singleDetail[2];
			if(anamolyDetail[anomalypk] == undefined){
				anamolyDetail[anomalypk]={"desc":desc,"data":{}};//NO I18N
				anamolyDetail[anomalypk].data[ruleId]=singleDetail;
			}else{
				var anoData=anamolyDetail[anomalypk].data;
				if(anoData[ruleId] == undefined){
					anamolyDetail[anomalypk].data[ruleId]=singleDetail;
				}else{
					var oldData=anoData[ruleId];
					var newData=singleDetail;
					for(var i=4;i<7;i++){
						if(oldData[i] == ''){
							if(newData[i] !='' && newData[i] != null){
								oldData[i]=newData[i];
							}
						}else if(oldData[i] == null){
							if(newData[i] != null){
								oldData[i]=newData[i];
							}
						}else{
							if(newData[i] !='' && newData[i] != null){
								var temp=oldData[i]
								oldData[i]=temp+"<br/>"+newData[i];
							}
						}
					}
				}
			}
		}
		fwa_loadPolicyOptimizationDetails(anamolyDetail,colNameList,colModelList,$contentdiv)
	}
}

function fwa_loadPolicyOptimizationDetails(anamolyDetail,colNameList,colModelList,$contentdiv){
	$.each(anamolyDetail, function(i, item){
		var desc=item.desc;
		var tableData=[];
		$.each(item.data, function(key, val){
			tableData.push(val);
		});
		$contentdiv.append("<div><span class='headerTitleSpansRed'>"+desc+"</span></div>");		
		$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:10px;padding-bottom:20px'><table id='opm_PolicyOptDetail"+i+"' class='ut ut-Grid'></table></div>");
		fwa_loadPDFJQgridWithData('#opm_PolicyOptDetail'+i,tableData,colNameList,colModelList,"","","",{},false);
	});
}

function fwa_drawNATDetailTable(i,NATDetailArray,resourceKeyVal,colNamesList,colModelList)
{
	var gridData=[];

	var tempData = (NATDetailArray!= undefined && NATDetailArray.resultData != undefined && NATDetailArray.resultData.data != undefined)? NATDetailArray.resultData.data : [];
	for(var ij=0;ij<tempData.length;ij++){
		gridData.push(tempData[ij]);
		var status=gridData[ij].STATUS;
		var logClass="inactivestatus";//NO I18N
		var logTitle=resourceKeyVal['ComplianceTab.inactive'];//NO I18N
		if(status!=null && (status== 'Yes'||status=="enabled")){
			logClass="activestatus";//NO I18N
			logTitle=resourceKeyVal['ComplianceTab.active'];//NO I18N
		}	
		gridData[ij].STATUS = '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
		
		gridData[ij].SRC_PORT=(gridData[ij].SRC_PORT != null  && gridData[ij].SRC_PORT != undefined && gridData[ij].SRC_PORT != 'null' ) ? gridData[ij].SRC_PORT : "-";
		gridData[ij].DST_PORT=(gridData[ij].DST_PORT != null  && gridData[ij].DST_PORT != undefined && gridData[ij].DST_PORT != 'null' ) ? gridData[ij].DST_PORT : "-";
		gridData[ij].SRC_IP=(gridData[ij].SRC_IP != null  && gridData[ij].SRC_IP != undefined && gridData[ij].SRC_IP != 'null' ) ? gridData[ij].SRC_IP : "-";
		gridData[ij].MAPPED_SRC_IP=(gridData[ij].MAPPED_SRC_IP != null  && gridData[ij].MAPPED_SRC_IP != undefined && gridData[ij].MAPPED_SRC_IP != 'null' ) ? gridData[ij].MAPPED_SRC_IP : "-";
		gridData[ij].DST_IP=(gridData[ij].DST_IP != null  && gridData[ij].DST_IP != undefined && gridData[ij].DST_IP != 'null' ) ? gridData[ij].DST_IP : "-";
		gridData[ij].MAPPED_DST_IP=(gridData[ij].MAPPED_DST_IP != null  && gridData[ij].MAPPED_DST_IP != undefined && gridData[ij].MAPPED_DST_IP != 'null' ) ? gridData[ij].MAPPED_DST_IP : "-";
		gridData[ij].DESCRIPTION=(gridData[ij].DESCRIPTION != null  && gridData[ij].DESCRIPTION != undefined && gridData[ij].DESCRIPTION != 'null' ) ? gridData[ij].DESCRIPTION : "-";
		gridData[ij].DISP_SRC_PORT=(gridData[ij].SRC_PORT != '-' ) ? gridData[ij].SRC_PORT+" -> "+gridData[ij].MAPPED_SRC_PORT : "-";
		gridData[ij].DISP_DEST_PORT=(gridData[ij].DST_PORT != '-' ) ? gridData[ij].DST_PORT+" -> "+gridData[ij].MAPPED_DST_PORT : "-";
	}
	

	var compPageWidth=$('#zchartgraph2').width() - 50;
	var singleColwidth=compPageWidth/(colNamesList.length-1);
		
	
	fwa_loadPDFJQgridWithData('#opm_App_LegendPolicy'+i,gridData,colNamesList,colModelList,"","","",{},false);

	
}

function fwa_drawPolicyDetailTable(i,PolicyDetailArray,resourceKeyVal)
{
	var gridData=PolicyDetailArray.resultData;
	var headerCount=PolicyDetailArray.headerCount;
	if(gridData.widgetAdditionalData != undefined){
		var widAdd=gridData.widgetAdditionalData;
		var colList=widAdd.colList;
		var selCol=PolicyDetailArray.colList;
		var colNameList=PolicyDetailArray.columnNames;
		if(selCol != undefined && colNameList != undefined){
			var selColList = selCol.split(",");
			var colNamesList = [];
			var colModelList = [];
			for(var ij=0;ij<selColList.length;ij++){
				var colVal=selColList[ij].toUpperCase();
				var ind=colNameList.indexOf(colVal);
				if(ind != -1 && colList[ind] != "RULEID"){
					var colNam=colList[ind];
					colNam = ("RULE_SRC" == colVal) ? resourceKeyVal['CustomReport.SquidCriteria3'] : (("RULE_DST" == colVal) ? resourceKeyVal['CustomReport.SquidCriteria4'] : colNam);//NO I18N
					colNamesList.push(colNam);
					colModelList.push({'name':ind,'index':ind}); //No I18N
				}
			}
			fwa_loadPDFJQgridWithData('#opm_App_LegendPolicy'+i,gridData.data,colNamesList,colModelList,"","","",{},false);
		}else{
			var colNamesList = [];
			var colModelList = [];
			for(var ij=0;ij<headerCount;ij++){
				if(colList[ij] != "RULEID"){
					colNamesList.push(colList[ij]);
					colModelList.push({'name':ij,'index':ij}); //No I18N
				}
			}
			fwa_loadPDFJQgridWithData('#opm_App_LegendPolicy'+i,gridData.data,colNamesList,colModelList,"","","",{},false);
		}
		
	}
	
	
	
}

function fwa_drawPolicyObjectSummaryTable(PolicyObjectSummaryDetail)
{
	var gridData=PolicyObjectSummaryDetail.widgetData;
	var colNamesList = [];
	var colModelList = [];
	for(var ij=0;ij<PolicyObjectSummaryDetail.columnHeader.length-1;ij++){
		colNamesList.push(PolicyObjectSummaryDetail.columnHeader[ij]);
	}

	for(var ij=0;ij<PolicyObjectSummaryDetail.columnHeader.length-1;ij++){
		colModelList.push({'name':ij,'index':ij}); //No I18N
	}
	var objDetail={};
	for(var ij=0;ij<gridData.length;ij++){
		var key=(gridData[ij][0] != null && gridData[ij][0] != undefined )? (gridData[ij][0].value != undefined ? gridData[ij][0].value: gridData[ij][0]) : "";
		var value=(gridData[ij][1] != null && gridData[ij][1] != undefined )? (gridData[ij][1].value != undefined ? gridData[ij][1].value: gridData[ij][1]) : "";
		if(objDetail[key] == undefined){
			objDetail[key]=value;
		}else{
			var objVal=objDetail[key];
			objDetail[key]=objVal+"<br>"+value;
		}
	}
	var finalData=[];
	$.each(objDetail, function(i, item){
		finalData.push([i,item]);
	});
	fwa_loadPDFJQgridWithData('#opm_App_ObjectSummary',finalData,colNamesList,colModelList,"","","",{},false);
}

function fwa_drawPolicySummaryTable(PolicySummaryDetail)
{
	var gridData=PolicySummaryDetail.widgetData;
	var colNamesList = PolicySummaryDetail.columnHeader;
	var colModelList = [];
	for(var ij=0;ij<colNamesList.length;ij++){
		colModelList.push({'name':ij,'index':ij}); //No I18N
	}
	
	fwa_loadPDFJQgridWithData('#opm_App_LegendSummary',gridData,colNamesList,colModelList,"","","",{},false);
}

function fwa_drawPolicySummaryGraph(PolicySummaryDetail)
{
	var chartObj = {
			id:"perfrmGraphSummary",//No I18N
			type:'bar', //dial, bar,area,line,pie //No I18N
			jsonData:PolicySummaryDetail.widgetData,
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
	var arraObj={
			"placeholder":[],//No I18N
			"chartobj":[]//No I18N
	}
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push("perfrmGraphSummary"); //No I18N
	zChart(arraObj);
}

function fwa_drawReportProfileWidgets(widData,reqParams,height,width,resourceKeyVal){
	for(var ij=0;ij<widData.length;ij++){
		var singleWidData=widData[ij];
		if(singleWidData.rbbName == "PDF_Startup_Running Conflict" || singleWidData.rbbName == "PDF_Startup Configuration Changes" || singleWidData.rbbName == "PDF_Running Configuration Changes"){
			fwa_drawFWAChangeMgmtWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal);
		}else{
			fwa_drawFWAReportWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal);
		}
	}
}

function fwa_drawRuleExpiryWidgets(widData,reqParams,height,width,resourceKeyVal){
	for(var ij=0;ij<widData.length;ij++){
		var singleWidData=widData[ij];
		fwa_drawFWAReportWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal);
		if(singleWidData.ruleExpiryCompleteData != undefined){
			var compDetail = singleWidData.ruleExpiryCompleteData;
			var widParams ={};
			widParams.widgetElement = $('.mainContent'); //NO I18N
			var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
			widParams.widgetElement.append($contDiv);
			var widgetTitle='Complete Rule Detail';
			$contDiv.append('<div class="fwaHeading_pdf" id="widgetHeader">'+widgetTitle+'</div>');
			var widElem=$('<div id="widgetElement" class="" style="width:100%;"></div>');
			$contDiv.append(widElem);
			var $contentdiv = $("<div class='content graphWidget'></div>");
			widElem.append($contentdiv);
			var compcolNameList = [resourceKeyVal["INHOST_NAME"], resourceKeyVal["EXTHOST_NAME"], resourceKeyVal["SRC_INTERFACE"],resourceKeyVal["DST_INTERFACE"],resourceKeyVal["Anomaly.service"],resourceKeyVal["Raw.SUBTYPE"]];//No I18N                  

			var compcolModelList = [
			                        { name: 'source', index: 'source'}, //No I18N
			                        { name: 'destination', index: 'destination'}, //No I18N
			                        { name: 'srcInt', index: 'srcInt'}, //No I18N
			                        { name: 'dstInt', index: 'dstInt'}, //No I18N
			                        { name: 'service', index: 'service'}, //No I18N
			                        { name: 'action',index:'action',search:false,hidedlg:true,formatter:function setPolicyRuleStatus(cellValue, options, rowdata, action){//No I18N
			                        	var logTitle=resourceKeyVal["ComplianceTab.allow"];//NO I18N
			                        	if(cellValue!=null && cellValue== 'deny'){
			                        		logTitle=resourceKeyVal["ComplianceTab.deny"];//NO I18N
			                        	}
			                        	return logTitle;//No I18N
			                        }}
			                        ];
			if(reqParams.isDeviceGroup == "true" || reqParams.isDeviceGroup == true){
				compcolNameList.splice(0,0,resourceKeyVal["devicename"]);//NO I18N
				compcolModelList.splice(0,0,{ name: "devname", index: "devname"});//No I18N
			}

			for(var k=0;k<compDetail.length;k++){
				var gridData = [compDetail[k]];
				$contentdiv.append("<div >"+resourceKeyVal["webclient.fwa.ruleadmin.details.rule"]+" : "+compDetail[k].ruleNumber+"</div>");
				$contentdiv.append("<div class='opm_jqGridUI' style='padding-top:10px;padding-bottom:10px'><table id='opm_App_Legend_rule"+k+"' class='ut ut-Grid'></table></div>");
				fwa_loadPDFJQgridWithData('#opm_App_Legend_rule'+k,gridData,compcolNameList,compcolModelList,"","","","",false);
			}

		}
		
	}
}

function fwa_drawRuleChangeHistoryWidgets(widData,reqParams,height,width,resourceKeyVal){
	
	var response = widData;
	var widParams ={};
	widParams.widgetElement = $("#widgetElement"); //NO I18N
	
	var diffContents=response.diffContents;
	var isContextBased=response.isContextBased;
	var $contentdiv = $("<div class='content'></div>");
	widParams.widgetElement.append($contentdiv);
	var $fwaRuleTrackHistListAccordian = $("<div class='accordion1 multiView arrowRight arrowSolid rule-change-history' id='fwaRuleTrackHistListAccordian'></div>");
	var $ulElement=$("<ul></ul>");
	var gridData=(widData != undefined && widData.griddata != undefined) ? widData.griddata : [];
	for(var i=0;i<gridData.length;i++){
		var widgetStr="<li style='border:0.5px solid #ddd'>";
		widgetStr = widgetStr +loadRuleChangeWidgetHeaderDetails(gridData[i],resourceKeyVal);
		widgetStr = widgetStr +loadRuleChangeWidgetDetails(gridData[i],resourceKeyVal,widData.i18nfields);
		widgetStr = widgetStr+"</li>";
		$ulElement.append($(widgetStr));
	}
	
	$fwaRuleTrackHistListAccordian.append($ulElement);
	$contentdiv.append($fwaRuleTrackHistListAccordian);
}


function loadRuleChangeWidgetDetails(widgetObj,resourceKeyVal,i18nfields){
	var widgetStr='<div class="accordion1__cont"><div class="rule-change-history__table"><table style="width: 100%;margin-top:0px !important" class="fwaRuleAdminCommandTable mt-lg">';
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
		var oldRow=[{"className":"","value":resourceKeyVal['fwa.ruletrack.old.content']}];//NO I18N
		var newRow=[{"className":"","value":resourceKeyVal['fwa.ruletrack.new.content']}];//NO I18N
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
		var tableVal=[resourceKeyVal['fwa.ruletrack.old.content']];
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
		var tableVal=[resourceKeyVal['fwa.ruletrack.new.content']];
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
function loadRuleChangeWidgetHeaderDetails(widData,resourceKeyVal){
	var widgetStr="";
	var className = (widData.CHANGE_TYPE == 2 ? "modified" :(widData.CHANGE_TYPE == 1 ? "added": "deleted"));//NO I18N
	var statusTxt = (widData.CHANGE_TYPE == 2 ? resourceKeyVal['DiffPage.Modified'] :(widData.CHANGE_TYPE == 1 ? resourceKeyVal['DiffPage.Added']: resourceKeyVal['DiffPage.Deleted']));
	var modiTxt = (widData.CHANGE_TYPE == 2 ? resourceKeyVal['fwa.ruletrack.modified.by'] :(widData.CHANGE_TYPE == 1 ? resourceKeyVal['fwa.ruletrack.added.by']: resourceKeyVal['fwa.ruletrack.deleted.by']));
	widgetStr='<div class="accordion1__nav">';
	widgetStr=widgetStr+'<div class="rule-change-history__header active '+className+'" >';
	widgetStr=widgetStr+'<div class="">';
	widgetStr=widgetStr+'<div class="rule-change-history__rule">'+resourceKeyVal['Reorder.rulename']+' : <span>'+widData.ruleName+'</span></div>';
	if(widData.policyName != undefined){
		widgetStr=widgetStr+'<div class="rule-change-history__policy">'+resourceKeyVal['POLICYNAME']+' : <span>'+widData.policyName+'</span></div>';
	}
	widgetStr=widgetStr+'<div class="rule-change-history__status">'+resourceKeyVal.SESSION_STATUS+' : <span>'+statusTxt+'</span></div>';
	widgetStr=widgetStr+'<div class="rule-change-history__modified">'+modiTxt+' : <span>'+widData.updatedBy+'</span></div>';
	widgetStr=widgetStr+'<div class="rule-change-history__updated-time">'+resourceKeyVal['fwa.ruletrack.updated.time']+' : <span>'+widData.lastUpdatedTime+'</span></div>';  
	
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'<div class="">';
	widgetStr=widgetStr+'<div class="rule-change-history__desc">'+widData.description+'</div>  '; 
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'</div>';
	widgetStr=widgetStr+'</div>';
	return widgetStr;
}

function fwa_drawChangeMgmtWidgets(widData,reqParams,height,width,resourceKeyVal){
	
	var response = widData;
	var widParams ={};
	widParams.widgetElement = $("#widgetElement"); //NO I18N
	
	var diffContents=response.diffContents;
	var isContextBased=response.isContextBased;
	var $contentdiv = $("<div class='content configDiff noline'></div>");
	widParams.widgetElement.append($contentdiv);
	
	if(!widData.isContextBased)
	{
		var addArr=diffContents.addArr;
		var delArr=diffContents.delArr;
		var modArr=diffContents.modArr;
		if(addArr != undefined && addArr.length > 0){
			var $contentdiv = $("<div class='content configDiff noline'></div>");
			widParams.widgetElement.append($contentdiv);
			$contentdiv.append('<div class="opm_widget_title"><span class="headerTitleSpans">'+resourceKeyVal['ChangeMgmtMail.AddedContents']+'</span></div>');				
			var $subcontentdiv = $("<div class='content-block'></div>");
			$contentdiv.append($subcontentdiv);
			var $subSectiondiv = $("<div class='subsection' style='width: 100%;'></div>");
			var $subSectionContentdiv = $("<div class='subsection-content' style='width: 100%;'></div>");
			$subcontentdiv.append($subSectiondiv);
			$subSectiondiv.append($subSectionContentdiv);
			for(var i=0;i<addArr.length;i++){
				var str=addArr[i];
				$subSectionContentdiv.append($("<div style='padding:5px'>"+str+"</div>"));
			}
		}
		if(delArr != undefined && delArr.length > 0){
			var $contentdiv = $("<div class='content configDiff noline'></div>");
			widParams.widgetElement.append($contentdiv);
			$contentdiv.append('<div class="opm_widget_title"><span class="headerTitleSpans">'+resourceKeyVal['ChangeMgmtMail.DeletedContents']+'</span></div>');				
			var $subcontentdiv = $("<div class='content-block'></div>");
			$contentdiv.append($subcontentdiv);
			var $subSectiondiv = $("<div class='subsection' style='width: 100%;'></div>");
			var $subSectionContentdiv = $("<div class='subsection-content' style='width: 100%;'></div>");
			$subcontentdiv.append($subSectiondiv);
			$subSectiondiv.append($subSectionContentdiv);
			for(var i=0;i<delArr.length;i++){
				var str=delArr[i];
				$subSectionContentdiv.append($("<div style='padding:5px'>"+str+"</div>"));
			}
		}
		if(modArr != undefined && modArr.length > 0){
			var $contentdiv = $("<div class='content configDiff noline'></div>");
			widParams.widgetElement.append($contentdiv);
			$contentdiv.append('<div class="opm_widget_title"><span class="headerTitleSpans">'+resourceKeyVal['ChangeMgmtMail.ModifiedContents']+'</span></div>');				
			var $subcontentdiv = $("<div class='content-block'></div>");
			$contentdiv.append($subcontentdiv);
			var $subSectiondiv = $("<div class='subsection' style='width: 100%;'></div>");
			var $subSectionContentdiv = $("<div class='subsection-content' style='width: 100%;'></div>");
			$subcontentdiv.append($subSectiondiv);
			$subSectiondiv.append($subSectionContentdiv);
			$tableData=$('<div class="DI-Diff" ></div>');
			$tableContent=$('<div class="DI-DiffList"></div>')
			$tableData.append($tableContent);
			$subSectionContentdiv.append($tableData);
			for(var i=0;i<modArr.length;i++){
				var str=modArr[i];
				var leftContent = str.leftStr;
				var rightContent = str.rightStr;
				var rowClass = "normalRow";  //No I18N
				$tableContent.append($("<div class='DI-DiffRow "+rowClass+"'><div><div class='diffNormalLine' >"+leftContent+"</div><div class='diffNormalLine'>"+rightContent+"</div></div></div>"));
			}
		}
	}
	else
	{
		
		var addedClass="diffdetails addedlines";//No I18N
		var modiClass="diffdetails modifiedlines";//No I18N
		var delClass="diffdetails deletedlines";//No I18N
		$contentdiv.append('<div class="opm_widget_title"><span class="headerTitleSpans">'+resourceKeyVal['ConfigChangeTitle']+'</span><div style="float:right" class="diffdetailsWidget"><div id="Added_Div" class="'+addedClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Added"]+'</div><div id="Modified_Div" class="'+modiClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Modified"]+'</i></div><div id="Deleted_Div" class="'+delClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Deleted"]+'</div></div>');				
		var $subcontentdiv = $("<div class='content-block'></div>");
		$contentdiv.append($subcontentdiv);
		var $subSectiondiv = $("<div class='subsection' style='width: 100%;'></div>");
		var $subSectionContentdiv = $("<div class='subsection-content' style='width: 100%;'></div>");
		$subcontentdiv.append($subSectiondiv);
		$subSectiondiv.append($subSectionContentdiv);
		$tableData=$('<div class="DI-Diff" ></div>');
		$tableContent=$('<div class="DI-DiffList"></div>')
		$tableData.append($tableContent);
		$subSectionContentdiv.append($tableData);
		
		if(diffContents != undefined){
			$tableContent.append($("<div class='DI-DiffRow' style='border-bottom:1px solid #d7d7d7;background:#eee !important;font-weight:700' ><div><div>"+resourceKeyVal['BefChanges']+"</div><div>"+resourceKeyVal['ChangesMade']+"</div></div></div>"));
			for (var intex = 0; intex < diffContents.length; intex++) {
				var leftContent = diffContents[intex].leftStr;
				var rightContent = diffContents[intex].rightStr;
				var type = diffContents[intex].modType;
				var rowClass = "normalRow";  //No I18N
				var leftClass="diffNormalLine";//No I18N
				var rightClass="diffNormalLine";//No I18N
				
				if(type == "m") {
					rowClass = "ModifiedRow";  //No I18N
					leftClass="diffModifiedLine";//No I18N
					rightClass="diffModifiedLine";//No I18N
				}
				if(type== "d") {
					rowClass = "DeletedRow";  //No I18N
					leftClass="diffDeletedLine";//No I18N
				}
				if(type == "a") {
					rowClass = "AddedRow";  //No I18N
					rightClass="diffNewLine";//No I18N
				}
				$tableContent.append($("<div class='DI-DiffRow "+rowClass+"'><div><div class='"+leftClass+"' >"+leftContent+"</div><div class='"+ //No I18N
						rightClass+"'>"+rightContent+"</div></div></div>"));
			}
		}
	}
	
	
	
}


function fwa_drawFWAChangeMgmtWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal){
	var response = singleWidData.resultData;
	var widParams ={};
	widParams.widgetElement = $('.mainContent'); //NO I18N
	var $contentdiv = $("<div class='content configDiff'></div>");
	widParams.widgetElement.append($contentdiv);
	var addedClass="diffdetails addedlines";//No I18N
	var modiClass="diffdetails modifiedlines";//No I18N
	var delClass="diffdetails deletedlines";//No I18N
	var widgetTitle=singleWidData.widgetTitle;
	$contentdiv.append('<div class="opm_widget_title"><span class="headerTitleSpans">'+widgetTitle+'</span><div style="float:right" class="diffdetailsWidget"><div id="Added_Div" class="'+addedClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Added"]+'</div><div id="Modified_Div" class="'+modiClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Modified"]+'</i></div><div id="Deleted_Div" class="'+delClass+'" style="font: 12px LatoRegular !important;">'+resourceKeyVal["DiffPage.Deleted"]+'</div></div>');				
	var jsonData=response.data;
	var colList=response.widgetAdditionalData.colList;
	
	var colindex;
	var headColList=[];
	var headColModel=[];
	$.each(response.widgetAdditionalData.colList, function(key,val){
		if(val != "Changes_Made"){
			headColList.push(val);
			headColModel.push({'name':key,'index':key,sortable:false,sorttype:response.widgetAdditionalData.format[key]}); //No I18N
		}else{
			colindex=key;
		}
	});
	var $subcontentdiv = $("<div class='content-block'></div>");
	$contentdiv.append($subcontentdiv);
	$subcontentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+ij+"_"+i+"' class='ut ut-Grid'></table></div>");
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+ij+'_'+i,jsonData,headColList,headColModel,"","","","",false);
	if(jsonData != undefined && jsonData.length > 0){
		for(var i=0;i<jsonData.length;i++){
			var rowData=jsonData[i];
			if(rowData != undefined){
				var sinChmgmt=rowData[colindex];
				var $subSectiondiv = $("<div class='subsection' style='width: 100%;'></div>");
				var $subSectionTitlediv = $("<div class='subsection-title' style='width: 100%;'>"+colList[0]+" : "+rowData[0]+"</div>");
				var $subSectionContentdiv = $("<div class='subsection-content' style='width: 100%;'></div>");
				$subcontentdiv.append($subSectiondiv);
				$subSectiondiv.append($subSectionTitlediv);
				$subSectiondiv.append($subSectionContentdiv);
				$subSectionContentdiv.append('<div class="opm_jqGridUI"><table class="ut ut-Grid no-header" cellspacing="0" style="width: 100%;"><thead> <tr> <td class="center" style="border:none !important;text-align:left;">'+colList[1]+' : '+ rowData[1]+'</td> <td class="center" style="border:none !important;text-align:left;">'+colList[2]+' : '+rowData[2]+'</td> <td class="center" style="border:none !important;text-align:left;">'+colList[3]+' : '+rowData[3]+'</td></tr> </thead> </table> </div>');
				if(sinChmgmt != undefined && sinChmgmt != '-' && sinChmgmt[0] == '['){
					$tableData=$('<div class="DI-Diff" ></div>');
					$tableContent=$('<div class="DI-DiffList"></div>')
					$tableData.append($tableContent);
					$subSectionContentdiv.append($tableData);
					var diffData=JSON.parse(sinChmgmt);
					if(diffData != undefined){
						$tableContent.append($("<div class='DI-DiffRow' style='border-bottom:1px solid #d7d7d7;background:#eee !important;font-weight:700' data-lineno='"+resourceKeyVal['webclient.fwa.line']+"'><div><div>"+resourceKeyVal['webclient.fwa.File1']+"</div><div>"+resourceKeyVal['webclient.fwa.File2']+"</div></div></div>"));
						for (var intex = 0; intex < diffData.length; intex++) {
							var leftContent = diffData[intex].lc;
							var rightContent = diffData[intex].rc;
							var lineno = diffData[intex].no;
							var type = diffData[intex].t;
							var rowClass = "normalRow";  //No I18N
							var leftClass="diffNormalLine";//No I18N
							var rightClass="diffNormalLine";//No I18N
							
							if(type == "m") {
								rowClass = "ModifiedRow";  //No I18N
								leftClass="diffModifiedLine";//No I18N
								rightClass="diffModifiedLine";//No I18N
							}
							if(type== "d") {
								rowClass = "DeletedRow";  //No I18N
								leftClass="diffDeletedLine";//No I18N
							}
							if(type == "a") {
								rowClass = "AddedRow";  //No I18N
								rightClass="diffNewLine";//No I18N
							}
							$tableContent.append($("<div class='DI-DiffRow "+rowClass+"' data-lineno='"+lineno//No I18N
									+"'><div><div class='"+leftClass+"' >"+leftContent+"</div><div class='"+ //No I18N
									rightClass+"'>"+rightContent+"</div></div></div>"));
						}
					}
				}else{
					var $diffDiv=$("<div  class='no-diff-content' style='width: 100%;'>"+sinChmgmt+"</div>");
					$subSectionContentdiv.append($diffDiv);
				}
			}
		}
	}else{
		$subcontentdiv.append("<div style='padding:15px;width:100%' class='subsection'><span style='padding-left:45%'>"+resourceKeyVal['Search.No.Data']+"</span></div>");
	}
	
}

function fwa_drawFWAReportWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal){
	var widParams ={};
	widParams.widgetElement = $('.mainContent'); //NO I18N
	var $contDiv = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
	widParams.widgetElement.append($contDiv);
	var widgetTitle=singleWidData.widgetTitle;
	if(singleWidData.rbbName == "UnUsed Network Objects" || singleWidData.rbbName == "UnUsed Interfaces"){
		widgetTitle=(singleWidData.rbbName == "UnUsed Network Objects") ? resourceKeyVal["webcilent.fwa.unassigned.objects"] : resourceKeyVal["webcilent.fwa.unassigned.interfaces"];//No I18N
	}
	$contDiv.append('<div class="fwaHeading_pdf" id="widgetHeader_'+ij+'">'+widgetTitle+'</div>');
	var widElem=$('<div id="widgetElement_'+ij+'" class="" style="width:100%;"></div>');
	$contDiv.append(widElem);
	var $contentdiv = $("<div class='content graphWidget'></div>");
	widElem.append($contentdiv);
	
//	$contentdiv.append("<div class='opm_widget_title'><span class='headerTitleSpans'>"+widgetTitle+"</span></div>");		
	$contentdiv.append("<div id='perfrmGraph1"+ij+"'></div>");
	$contentdiv.append("<div class='opm_jqGridUI'><table id='opm_App_Legend"+ij+"' class='ut ut-Grid'></table></div>");
	fwa_loadSingleWidgetgraph(ij,singleWidData);
	fwa_loadSingleWidgetTable(ij,singleWidData);
	
}

function fwa_loadSingleWidgetTable(ij,singleWidData){
	var response=singleWidData.resultData;
	var rbbname=singleWidData.rbbName;
	
	if(rbbname != "Overrall Rules Report" && response.widgetAdditionalData!= undefined && response.widgetAdditionalData.isGraphWidget !== undefined && (response.widgetAdditionalData.isGraphWidget === true || response.widgetAdditionalData.isGraphWidget === "true")){
		return ;
	}
	var colNamesList = [];
	var colModelList = [];
	var response=singleWidData.resultData;
	$.each(response.widgetAdditionalData.colList, function(key,val){
		if(val != "RULEID"){
			colNamesList.push(val);
			colModelList.push({'name':key,'index':key,sortable:false,sorttype:response.widgetAdditionalData.format[key]}); //No I18N
		}
	});
	var gridData=(response.data != undefined) ? response.data : [];
	if(response.overall != undefined){
		$.each(response.overall, function(key,val){
			if(val != null && val.length == colModelList.length){
				gridData.push(val);
			}
		});
	}
	
	if(response.widgetAdditionalData.format != undefined){
		var columnFormat=response.widgetAdditionalData.format;
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
	}       
	
	var defOptions={};
	if(rbbname != undefined && rbbname == "AllVPNSession"){
		var tempcolNamesList=colNamesList;
		var tempcolModelList=colModelList;
		var tempData=gridData;
		tempcolNamesList.unshift("");
		tempcolModelList.push({"name":10,"index":10});
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
			if(tempData != undefined && tempData.length >10){
				var compPageWidth=$('#zchartgraph2').width() - 110;
			}else{
				var compPageWidth=$('#zchartgraph2').width() - 50;
			}
			
			var singleColwidth=compPageWidth/(colModelList.length-1);
			if(ik == 0){
				colModelList[ik].singleColwidth="5px";
			}else{
				colModelList[ik].singleColwidth=singleColwidth+"px";
			}
		}
		gridData=tempData;
		colNamesList=tempcolNamesList;
		colModelList=tempcolModelList;
	}
	
	
	if(rbbname != undefined && rbbname == "ActiveVpnSessions"){
		var tempcolNamesList=colNamesList;
		var tempcolModelList=colModelList;
		var tempData=gridData;
		tempcolNamesList.unshift("");
		tempcolModelList.push({"name":tempcolModelList.length,"index":tempcolModelList.length});
		for(var ik=0;ik<tempData.length;ik++){
			var newVal="";
			var rowdata=tempData[ik];
			var logClass="activestatus";//NO I18N
			var logTitle=Ember.I18n.t("webclient.nfa.inventory.active",this);//NO I18N
			newVal= '<span class="'+logClass+'" title="'+logTitle+'" style="float:left"></span>';//No I18N
			tempData[ik].unshift(newVal);
		}
		for(var ik=0;ik<colModelList.length;ik++){
			if(tempData != undefined && tempData.length >10){
				var compPageWidth=$('#zchartgraph2').width() - 110;
			}else{
				var compPageWidth=$('#zchartgraph2').width() - 50;
			}
			var singleColwidth=compPageWidth/(colModelList.length-1);
			if(ik == 0){
				colModelList[ik].singleColwidth="5px";
			}else{
				colModelList[ik].singleColwidth=singleColwidth+"px";
			}
		}
		gridData=tempData;
		
		colNamesList=tempcolNamesList;
		colModelList=tempcolModelList;
	}
	if(gridData != undefined && gridData.length >10){
		defOptions.rowNumNeeded=true;
	}
	
	fwa_loadPDFJQgridWithData('#opm_App_Legend'+ij,gridData,colNamesList,colModelList,"","","",defOptions,false);
}

function fwa_loadSingleWidgetgraph(ij,singleWidData){
	var response=singleWidData.resultData;
	if(response.widgetAdditionalData!= undefined && response.widgetAdditionalData.isTableWidget !== undefined && (response.widgetAdditionalData.isTableWidget === true ||  response.widgetAdditionalData.isTableWidget === "true")){
		return ;
	}
	var id1='perfrmGraph1'+ij;//NO I18N
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
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
	}else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.WidgetType == "verticalbar") //No I18N
	{
		chartType = "bar"; //No I18N
		stacked=true;
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
	}else if(response.widgetAdditionalData != undefined && (response.widgetAdditionalData.chartType == "timeseries" ||response.widgetAdditionalData.chartType == "line" ||response.widgetAdditionalData.chartType == "livexy"))//No I18N
	{ 
		chartType = "line"; //No I18N
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
	}
	else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "stackedArea")
	{
		chartType = "area"; //No I18N
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
		stacked=true;
	}
	else if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.chartType == "multiBar")
	{
		chartType = "bar"; //No I18N
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
	}
	else
	{
		stacked=true;
		chartType = "bar"; //No I18N
		fwaChartData = (response.WidgetData != undefined && response.WidgetData.chartData != undefined) ? response.WidgetData.chartData : [];
	}
	if(response.WidgetData !=undefined && response.WidgetData.xyTitles != undefined)
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
	var timeformat="Today";//NO I18N
	if(response.widgetAdditionalData != undefined && response.widgetAdditionalData.period != undefined){
		timeformat=response.widgetAdditionalData.period;
	}
	var x_axes = (response.WidgetData != undefined && response.WidgetData.xyTitles !== undefined) ? response.WidgetData.xyTitles[0] : "";//No I18N
	var y_axes = (response.WidgetData != undefined && response.WidgetData.xyTitles !== undefined) ? response.WidgetData.xyTitles[1] : "";//No I18N
	if(fwaChartData.length <= 20){
		if(chartType == "pie"){
			 var testObj = {
				        id:id1, 
				        type:'pie', //No I18N
				        subType:"simplePie", //No I18N
				        customClass:"opm_pie", //No I18N
				        jsonData: fwaChartData,
				        height:350,
				        margin: 30,
				        columns:{
				            datatype_1:'ordinal',  //No I18N
				            datatype_2:'numeric',  //No I18N
				            columnname_1:columnname1,
				            columnname_2:columnname2 
				        },
				        legend: {
				            enabled: false
				        },
				        noDataHandler : {
				            text:"No Data" //No I18N 
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
				            text:"No Data" //No I18N 
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
}


function fwa_loadPDFJQgridWithData(gridTable,jsonData,colNamesList,colModelList,captionTitle,gridNavigator,onSelectFunction,defaultOptions,isExpand) 
{
	var startIndex=1;
	$(gridTable).width('100%');
	$(gridTable).prop("cellSpacing","0");
	var tableElement=document.getElementById(gridTable.replace("#",""));
	var header = tableElement.createTHead();
	if (defaultOptions.rowNumNeeded != undefined && defaultOptions.rowNumNeeded) {
		$(gridTable).addClass('fwaExpandTable');
		var rowheader = header.insertRow(0);    
		var cell = rowheader.insertCell(0);
		cell.innerHTML = "";
		for(var ij=0;ij<colNamesList.length;ij++){
			var cell = rowheader.insertCell(ij+1);
			cell.innerHTML = colNamesList[ij];
		}
		var collength=colModelList.length;
		var singColWidth=90/collength;
		if(jsonData != undefined && jsonData.length > 0){
			for(var i=0;i<jsonData.length;i++){
	    		var row = tableElement.insertRow(i+1);
	    		var cell = row.insertCell(0);
	    		cell.style.width="10%";
				cell.innerHTML = startIndex;
				startIndex++;
	    		for(var j=0;j<colModelList.length;j++){
	    			var cell = row.insertCell(j+1);
	    			if(colModelList[j].singleColwidth != undefined){
						cell.style.width=colModelList[j].singleColwidth;
					}else{
						cell.style.width=singColWidth+"%";
					}
	    			var colindex=colModelList[j].index;
	    			cell.innerHTML = jsonData[i][colindex];
	    		}
	    	}
		}else{
			var row = tableElement.insertRow(1);
			var cell = row.insertCell(0);
			cell.colSpan = (colModelList.length+1)+"";
			cell.innerHTML = "No Data";//NO I18N
		}
	 }else{
    	var rowheader = header.insertRow(0); 
    	for(var ij=0;ij<colNamesList.length;ij++){
    		var cell = rowheader.insertCell(ij);
    		cell.innerHTML = colNamesList[ij];
    	}
    	var collength=colModelList.length;
		var singColWidth=100/collength;
		if(jsonData != undefined && jsonData.length > 0){
			for(var i=0;i<jsonData.length;i++){
	    		var row = tableElement.insertRow(i+1);
	    		for(var j=0;j<colModelList.length;j++){
	    			var cell = row.insertCell(j);
	    			if(colModelList[j].singleColwidth != undefined){
						cell.style.width=colModelList[j].singleColwidth;
					}else{
						cell.style.width=singColWidth+"%";
					}
	    			var colindex=colModelList[j].index;
	    			cell.innerHTML = jsonData[i][colindex];
	    		}
	    	}
		}else{
			var row = tableElement.insertRow(1);
			var cell = row.insertCell(0);
			cell.colSpan = colModelList.length+"";
			cell.innerHTML = "No Data";//NO I18N
		}
    	
    }

	
}

function fwa_drawChangeMgmtFrontPage(widData,reqParams,resourceKeyVal,height,width){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(reqParams.isFWA){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+resourceKeyVal['FireTop.Reports']+'</div>');
	var tableContent='<table><tbody>';
	
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['AddReport.Page2.Rname']+"</span> : "+resourceKeyVal['Titlekey']+"</td></tr>";//NO I18N
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['Device_Name']+"</span> : "+widData.deviceName+"</td></tr>";//NO I18N
	
	if(widData.configType != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['ConfigFileType']+"</span> : "+widData.configType+"</td></tr>";//NO I18N
	}
	if(widData.changedBy != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['changed_By']+"</span> : "+widData.changedBy+"</td></tr>";//NO I18N
	}
	if(widData.changedFrom != undefined && widData.changedFrom != '-'){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['ChangeMgmtMail.changedFrom']+"</span> : "+widData.changedFrom+"</td></tr>";//NO I18N                                                   
	}
	if(widData.modTime != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['ChangedOn']+"</span> : "+widData.modTime+"</td></tr>";//NO I18N                                                  
	}
	tableContent=tableContent+"</tbody></table>";//No I18N
	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
	$contDiv.append($paramTab);
	$paramTab.html(tableContent);
	$contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%">'+resourceKeyVal.gdpr_Disclaimer+'</p>');
	$maindiv.append('<div id="widgetElement"></div>');
}

function fwa_drawRuleChangeHistoryFrontPage(widData,reqParams,resourceKeyVal,height,width){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(reqParams.isFWA){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+resourceKeyVal['ruleTracking.schedule.Title']+'</div>');
	var tableContent='<table><tbody>';
	
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['Device_Name']+"</span> : "+reqParams.deviceName+"</td></tr>";//NO I18N
	
	if(widData.configVersion != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['DiffPage.Version_NO']+"</span> : "+reqParams.configVersion+"</td></tr>";//NO I18N
	}
	if(widData.changedBy != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['changed_By']+"</span> : "+reqParams.changedBy+"</td></tr>";//NO I18N
	}
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['DiffPage.Added']+" "+resourceKeyVal['ruleTracking.rule.count']+"</span> : "+reqParams.addedCount+"</td></tr>";//NO I18N
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['DiffPage.Modified']+" "+resourceKeyVal['ruleTracking.rule.count']+"</span> : "+reqParams.modifiedCount+"</td></tr>";//NO I18N
	tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['DiffPage.Deleted']+" "+resourceKeyVal['ruleTracking.rule.count']+"</span> : "+reqParams.deltedCount+"</td></tr>";//NO I18N
	if(reqParams.genTime != undefined){
		tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['ChangedOn']+"</span> : "+reqParams.genTime+"</td></tr>";//NO I18N                                                  
	}
	tableContent=tableContent+"</tbody></table>";//No I18N
	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
	$contDiv.append($paramTab);
	$paramTab.html(tableContent);
	$contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%">'+resourceKeyVal.gdpr_Disclaimer+'</p>');
	$maindiv.append('<div id="widgetElement"></div>');
}

function fwa_drawReportFrontPage(widData,reqParams,resourceKeyVal,height,width){
	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(reqParams.isFWA){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	$contDiv.append('<div class="fwaHeading_pdf">'+resourceKeyVal['FireTop.Reports']+'</div>');
	var tableContent='<table><tbody>';
    if(reqParams.isNATReport == "true") {
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ReportName+"</span> : "+reqParams.reportName+"</td></tr>";//NO I18N
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_Devices+"</span> : "+reqParams.resourceNames+"</td></tr>";//NO I18N
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_GenTime+"</span> : "+reqParams.genTime+"</td></tr>";//NO I18N
    	tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_RuleCategory+"</span> : "+reqParams.ruleCategoryForPDF+"</td></tr>";//NO I18N
	}  
	else {
		if(reqParams.isPolicyBasedJasper == "true" || reqParams.hideFromAndTo == "true"){
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ReportName+"</span> : "+reqParams.reportName+"</td></tr>";//NO I18N
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_Devices+"</span> : "+reqParams.resourceNames+"</td></tr>";//NO I18N
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_GenTime+"</span> : "+reqParams.genTime+"</td></tr>";//NO I18N                                                       
		}
		
		if(reqParams.isPolicyBasedJasper != "true" && reqParams.hideFromAndTo != "true"){
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ReportName+"</span> : "+reqParams.reportName+"</td></tr>";//NO I18N  
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_Devices+"</span> : "+reqParams.resourceNames+"</td></tr>";//NO I18N  
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_GenTime+"</span> : "+reqParams.genTime+"</td></tr>";//NO I18N  
			if(reqParams.startDate != undefined){
				tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_FromTime+"</span> : "+reqParams.startDate+"</td></tr>";//NO I18N  
				tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ToTime+"</span> : "+reqParams.endDate+"</td></tr>";//NO I18N                                                        
			}
		}
		
		if(reqParams.isPolicyBasedJasper != undefined && reqParams.isPolicyBasedJasper == "true"){
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ReportList+"</span> : "+reqParams.reportList+"</td></tr>";//NO I18N  
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_RuleCategory+"</span> : "+reqParams.ruleCategoryForPDF+"</td></tr>";//NO I18N  
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_PolicyName+"</span> : "+reqParams.policyNamesForPDF+"</td></tr>";//NO I18N  
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_SearchCriteria+"</span> : "+reqParams.searchCriteriaForPDF+"</td></tr>";//NO I18N
		}
		
		if(reqParams.isPolicyBasedJasper != "true"){
			tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_ReportList+"</span> : "+reqParams.reportList+"</td></tr>";//NO I18N	
			if(reqParams.compType == undefined && (reqParams.rpt != 'RuleExpiryReport')){
				reqParams.criteriaConfigured = reqParams.criteriaConfigured.replace("adv_log_srch",resourceKeyVal["Search.searchType"]);
				reqParams.criteriaConfigured = reqParams.criteriaConfigured.replace("LOGTYPE:1:proxy",resourceKeyVal["Search.RawProxy"]);
				reqParams.criteriaConfigured = reqParams.criteriaConfigured.replace("LOGTYPE:1:u",resourceKeyVal["Search.UnknownProto"]);
				reqParams.criteriaConfigured = reqParams.criteriaConfigured.replace("LOGTYPE:1:s,LOGTYPE:1:lt",resourceKeyVal["Search.RawLogs"]);
				tableContent = tableContent+"<tr><td colspan='2'><span>"+reqParams.pdfHome_Criteria+"</span> : "+reqParams.criteriaConfigured+"</td></tr>";//NO I18N
			}
		}
	}
	
	tableContent=tableContent+"</tbody></table>";//No I18N
	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
	$contDiv.append($paramTab);
	$paramTab.html(tableContent);
	$contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%">'+resourceKeyVal.gdpr_Disclaimer+'</p>');
}

function fwa_drawFWASecurityAuditWidget(widData,reqParams,height,width,resourceKeyVal){
	for(var ij=0;ij<widData.length;ij++){
		var singleWidData=widData[ij];
		fwa_drawFWASecurityWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal);
	}
	
}
function drawFWAImpactWidgets(singleWidData,height,width){
	if(singleWidData.content != undefined){
		$('#zchartgraph2').html(singleWidData.content);
		$("#zchartgraph2 a").replaceWith(function(){
			return $("<span>" + $(this).html() + "</span>");
		});
	}
	setTimeout(function(){
    	window.canvasLoded=true;
    },5000);
}

function fwa_drawFWASecurityWidget(ij,singleWidData,reqParams,height,width,resourceKeyVal){
	if(singleWidData.content != undefined){
		$('#zchartgraph2').html(singleWidData.content);
		$("#zchartgraph2 a").replaceWith(function(){
			return $("<span>" + $(this).html() + "</span>");
		});
		var deviceName = singleWidData.displayName;
		if($(".reportdate")[0]!= undefined && $(".reportdate")[0].innerHTML != null){
      		var rptGenTime = $(".reportdate")[0].innerHTML;
      	}else{
      		var rptGenTime = $(".dateDiv b").text();              		
      	}
      	if(reqParams.isFWA){
      		var logo = "fwa-logo.png"; //No I18N
      	}else{
      		var logo = "opmanager_logo_report.gif"; //No I18N
      	}
      	$("#zchartgraph2").prepend('<div id="widgetElement_0" class="" style="width:100%;padding:20px;background: white;"><div style="height:1075px;border:1px solid"><div style="width:30%;height:100%;background:#736F6E;float:left;"><div style="width:100%;height:100%;display:table;text-align:center;-webkit-transform: rotate(-90deg);-moz-transform: rotate(-90deg);"><span style="display:table-cell;vertical-align:middle;color:white;font-size:30pt">'+resourceKeyVal['FireTop.Reports']+'</span></div></div><div style="width:70%;height:100%;float:right;background: white;"><div id="logo_pdf_remove" style="width:100%;float:right"><div style="float:right"><img src="/apiclient/fluidicv2/img/'+logo+'" width="250" height="100"></div><div style="height:10pt"></div></div><div style="width:100%;padding-left:60px;top:100px;position:relative"><table width="100%"><tbody><tr><td style="width:25%;padding:5px;font-weight:bold">'+resourceKeyVal.DeviceName+'</td><td style="width:75%;padding:5px">'+deviceName+'</td></tr><tr><td style="width:25%;padding:5px;font-weight:bold">'+resourceKeyVal.pdfHome_ReportName+'</td><td style="width:75%;padding:5px">'+resourceKeyVal['CompTab.SecurityAudit']+'</td></tr><tr><td style="width:25%;padding:5px;font-weight:bold">'+resourceKeyVal.pdfHome_GenTime+'</td><td style="width:75%;padding:5px">'+rptGenTime+'</td></tr></tbody></table></div></div></div></div><i >'+resourceKeyVal.gdpr_Disclaimer+'<br/>'); //No I18N
 
	}
}

function fwa_drawRiskAnalysisFrontPage(widData,reqParams,resourceKeyVal,width,height){

	$('#zchartgraph2').empty();
	$('#zchartgraph2').append('<header id="pageHeader"><div class="green-border"> </div></header>');
	
	var $maindiv = $("<main class='mainContent'></main>");
	$('#zchartgraph2').append($maindiv);
	
	if(reqParams.isFWA){
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/fwa-logo.png" class="fwaPdfLogoNew"></div>');
	}else{
		$maindiv.append('<div class="product__logo"><img src="/apiclient/fluidicv2/img/opmanager_logo_report.gif" class="fwaPdfLogoNew"></div>');
	}
	var $contDiv = $('<div class="fwaMainContent_pdf" style="height:1000px !important;margin-bottom:40px"></div>');
	$maindiv.append($contDiv);
	
	$contDiv.append('<div class="fwaHeading_pdf">'+resourceKeyVal['Risk']+'</div>')
    
    var tableContent='<table><tbody>';
    if(reqParams.deviceGroupId != undefined){
    	 tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['DevGroup']+"</span> : "+reqParams.resourceName+"</td></tr>";//NO I18N
    }else{
    	 tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal['Device_Name']+"</span> : "+reqParams.resourceName+"</td></tr>";//NO I18N
    }
   
    tableContent = tableContent+"<tr><td colspan='2'><span>"+resourceKeyVal.pdfHome_GenTime+"</span> : "+reqParams.genTime+"</td></tr>";//NO I18N
    
    tableContent=tableContent+"</tbody>";//No I18N
    if(tableContent != '<table><tbody></tbody>'){
    	tableContent=tableContent+"</table>";
    	var $paramTab=$('<div class="fwaTableUi titleTable"></div>');
    	$contDiv.append($paramTab);
    	$paramTab.html(tableContent);
    }
    $contDiv.append('<p class="PDFPrivacyMsgDiv" style="position:absolute;bottom:10px;width:97%">'+resourceKeyVal.gdpr_Disclaimer+'</p>');
    
    var $contDiv1 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
    $contDiv1.append('<div class="fwaHeading_pdf">'+resourceKeyVal.Risk_Trend_Report+'</div>');
    $contDiv1.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv1.append("<div class='content graphWidget graphWidget1'><div id='perfGraph10'></div></div>");
    $maindiv.append($contDiv1);
    
    var $contDiv2 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;"></div>');
    $contDiv2.append('<div class="fwaHeading_pdf">'+resourceKeyVal.Risk_Level_Analysis_Report+'</div>');
    $contDiv2.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv2.append("<div class='content graphWidget graphWidget1'><div id='perfGraph11'></div></div>");
    $maindiv.append($contDiv2);
    
    var $contDiv3 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;float:left"></div>');
    $contDiv3.append('<div class="fwaHeading_pdf">'+resourceKeyVal.Show_By_Rule+'</div>');
    $contDiv3.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv3.append("<div class='opm_jqGridUI'><table id='fwaRuleTable' class='ut ut-Grid'></table></div>");
    $maindiv.append($contDiv3);
    
    var $contDiv4 = $('<div class="fwaMainContent_pdf" style="margin-bottom: 40px;page-break-inside:avoid !important;top:17px;float:left"></div>');
    $contDiv4.append('<div class="fwaHeading_pdf">'+resourceKeyVal.Show_By_Risk+'</div>');
    $contDiv4.append('<div id="widgetElement_11" class="" style="width:100%;"></div>');
    $contDiv4.append("<div class='opm_jqGridUI'><table id='fwaRiskTable' class='ut ut-Grid'></table></div>");
    $maindiv.append($contDiv4);
    
     	    var colNames = widData[0].colNames;
     	    var colModel = widData[0].colModel;

    
	gridData=widData[0].gridRuleData;
	fwaSingleRiskTable(gridData,colNames,colModel);
	

	var colNames = [resourceKeyVal["policyImpactAnalysis.fwa.riskLevel"],resourceKeyVal.Risk+" "+resourceKeyVal["LogLevel.Info"],"Rules Count"]; //No I18N
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

	gridData=widData[0].gridRiskData;
	fwa_loadPDFJQgridWithData('#fwaRiskTable',gridData,colNames,colModel,"","","",{},false);
}

function fwa_drawRiskAnalysisReport(widData,reqParams,resourceKeyVal){
	var graphParams = {};
	graphParams.id = 'perfGraph10';
	graphParams.data = widData[0].trend;
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
	graphParams1.data = widData[0].severity;
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
            columnname_1: graphData.colName1, 
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
   var arraObj={placeholder:[],chartobj:[]}
   arraObj.chartobj.push(chartObj);
   arraObj.placeholder.push(graphData.id);
   zChart(arraObj);
}

function fwaSingleRiskTable(gridData,colNamesList,colModelList){
	var gridData=(gridData != undefined) ? gridData : [];
	
	var defOptions={};
	var tempcolNamesList=colNamesList;
	var tempcolModelList=colModelList;
	var tempData=gridData;

	for(var ik=0;ik<tempData.length;ik++){
		var newVal="";
		var rowdata=tempData[ik];
		var riskStatus='<div class="risk-counts">';
		if(rowdata.risk != undefined){
			var colors = {"Critical":"red","Low":"green","High":"orange","Medium":"yellow","Attention":"violet"}; //No I18N
        	for(i=0; i<rowdata.risk.length; i++){
        		var singleRow = rowdata.risk[i];
        		var level = singleRow.level;
        		var count = singleRow.count+" "+singleRow.level;
        		var ruleCnt = singleRow.count;
        		riskStatus += '<span class="risk-count-'+colors[level]+'" data-tooltip-bottom="'+count+'">'+ruleCnt+'</span>';
        	}
        	riskStatus += "</div>";
        	rowdata.risk = riskStatus;		
		}
	}
	
	gridData=tempData;
	
	colNamesList=tempcolNamesList;
	colModelList=tempcolModelList;
	fwa_loadPDFJQgridWithData('#fwaRuleTable',gridData,colNamesList,colModelList,"","","",{},false);

}
