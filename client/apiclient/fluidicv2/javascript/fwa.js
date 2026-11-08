function getfwaINUsageGraph(cellValue, options, rowdata, action)
{
    var ipUtilization = Math.round(cellValue);
    if(cellValue > 100){
    	ipUtilization=">100";//No I18N
    	cellValue=100;
    	OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"FWA_INTF_INVENTORY"}); //No I18N
    }
    var lowUtil = 20;
    var highUtil = 80;
    var bgUtil = Math.round((cellValue * 80) / 100);
//    var usageColor = "url(/images/green_bar.jpg)";//No I18N
    var usageColor = "severity_5";//No I18N
//            var d = new Double(ipUtilization);
    if (cellValue > lowUtil && cellValue <= highUtil) {
//        usageColor = "url(/images/yellow_bar.jpg)";//No I18N
        usageColor = "severity_3";//No I18N
    } else if (cellValue > highUtil) {
//        usageColor = "url(/images/red_bar.jpg)";//No I18N
        usageColor = "severity_1";//No I18N
    }
    var perClass = (cellValue == 100) ? "redtxt" : "txt"; //No I18N
    var renderString = "<div nowrap style='float:left;white-space: nowrap;' title="+Math.round(cellValue)+"%><div style='float:left;padding-top:0px;background-color: #e4e2e5; width:80px;'><div class=" + usageColor + " style=\"width:" + bgUtil + "px;height:20px;float:left;\"> </div></div><span nowrap style='float:left';title='"+ bgUtil +"'>&nbsp;" + rowdata.avgBwSpeedIn + " </span></div>"; //No I18N
    return renderString;
//    return ""
//    return "<div class='StatusColor'><span class="+usageColor+" style='w idth: 20;' ></span></div>"
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



function getfwaUnusedSourceFormatter(cellValue, options, rowdata, action)
{
	var unusedsourceCount=(cellValue != undefined) ? cellValue : 0;
	var usedServiceCount=(rowdata.usedServiceCount != undefined) ? rowdata.usedServiceCount : 0;
	var totalSourceCount=(rowdata.totalSourceCount != undefined) ? rowdata.totalSourceCount : 0;
	var percent=unusedsourceCount/totalSourceCount*100;
	var returxtxt=getfwaUnusedFormatter(percent,unusedsourceCount,usedServiceCount,totalSourceCount);
//	return '<span style="display:inline-block;width:100%;text-align:center">'+txt+'</span>';
	return returxtxt;
}

function getfwaUnusedDestFormatter(cellValue, options, rowdata, action)
{
	var unuseddstCount=(cellValue != undefined) ? cellValue : 0;
	var usedDestinationCount=(rowdata.usedDestinationCount != undefined) ? rowdata.usedDestinationCount : 0;
	var totaldstCount=(rowdata.totalDestinationCount != undefined) ? rowdata.totalDestinationCount : 0;
	var percent=unuseddstCount/totaldstCount*100;
	var returxtxt=getfwaUnusedFormatter(percent,unuseddstCount,usedDestinationCount,totaldstCount);
//	return '<span style="display:inline-block;width:100%;text-align:center">'+txt+'</span>';
	return returxtxt;
}

function getfwaUnusedAppFormatter(cellValue, options, rowdata, action)
{
	var unusedappCount=(cellValue != undefined) ? cellValue : 0;
	var usedApplicationCount=(rowdata.usedApplicationCount != undefined) ? rowdata.usedApplicationCount : 0;
	var totalAppCount=(rowdata.totalApplicationCount != undefined) ? rowdata.totalApplicationCount : 0;
	var percent=unusedappCount/totalAppCount*100;
	var returxtxt=getfwaUnusedFormatter(percent,unusedappCount,usedApplicationCount,totalAppCount);
//	return '<span style="display:inline-block;width:100%;text-align:center">'+txt+'</span>';
	return returxtxt;
}

function getfwaUnusedServiceFormatter(cellValue, options, rowdata, action)
{
	var unusedserviceCount=(cellValue != undefined) ? cellValue : 0;
	var usedserviceCount=(rowdata.usedServiceCount != undefined) ? rowdata.usedServiceCount : 0;
	var totalserviceCount=(rowdata.totalServiceCount != undefined) ? rowdata.totalServiceCount : 0;
	var percent=unusedserviceCount/totalserviceCount*100;
	var returxtxt=getfwaUnusedFormatter(percent,unusedserviceCount,usedserviceCount,totalserviceCount);
//	return '<span style="display:inline-block;width:100%;text-align:center">'+txt+'</span>';
	return returxtxt;
}

function getfwaUnusedFormatter(cellValue,unusedCount,usedCount,totalCount){
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
    var renderString = "<div nowrap style='float:left;white-space: nowrap;width:100%' title=\""+divtitle+"\"><div style='margin-top:7px;float:left;padding-top:0px;background-color: #e4e2e5; width:60%;margin-left:10%'><div class=" + usageColor + " style=\"width:" + ipUtilization + "%;height:5px;float:left;\"> </div></div><div nowrap style='float:left;padding-left:5px;width:25%;' title='"+ bgUtil +"'>&nbsp;" + unusedCount + " </div></div>"; //No I18N
    return renderString;
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
 
function fwaRuleMgmtInvDevListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(rowdata.devList != '-' && rowdata.devList.length > 0){
		var tem = rowdata.devList;
		
		if(tem != undefined && tem.length > 0){
			if(tem.length > 2){
				for(var i=0;i<2;i++){
					var disTxt=tem[i].devName+" ("+tem[i].vendorName+")";
					returnTxt+='<span>'+encodeCellVal(disTxt)+'</span><br/>';
				}
				var chowCount=tem.length-2;
				returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ('+chowCount+') ...</div></div>';
				returnTxt+='<div style="display:none" id="'+expandID+'">';
				for(var i=2;i<tem.length;i++){
					var disTxt=tem[i].devName+" ("+tem[i].vendorName+")";
					returnTxt+='<span>'+encodeCellVal(disTxt)+'</span><br/>';
				}
				returnTxt+='</div>';
				returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
			}else{
				for(var i=0;i<tem.length;i++){
					var disTxt=tem[i].devName+" ("+tem[i].vendorName+")";
					returnTxt+='<span>'+encodeCellVal(disTxt)+'</span><br/>';
				}
			}
		}else{
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
		}
	}else{
		returnTxt='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}

		
	return returnTxt;
}


function fwaObjectRuleAssociationFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(rowdata.assignedRulesValue != '-'){
		var tem = $.parseJSON(rowdata.assignedRulesValue);
		var rid=$('#ruleDeviceList option:selected').val();
		var devname = $('#ruleDeviceList option:selected').text();
		if(OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected){
			rid=rowdata.rid;
			devname=rowdata.devname
		}
		if(tem != undefined && tem.length > 0){
			if(tem.length > 2){
				for(var i=0;i<2;i++){
					var disTxt=(tem[i].policyName != undefined ) ? tem[i].ruleName+" ("+tem[i].policyName+")": tem[i].ruleName;
					returnTxt+='<a style="display:inline-block;width:100%;text-align:center;color:blue;" onclick="OPMClient.FWACompliance.showFWARuleDetail(&#39;'+escape(JSON.stringify(tem[i]))+'&#39;,&#39;'+rid+'&#39;,&#39;'+devname+'&#39;)">'+encodeCellVal(disTxt)+'</a><br/>';
				}
				var chowCount=tem.length-2;
				returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ('+chowCount+') ...</div></div>';
				returnTxt+='<div style="display:none" id="'+expandID+'">';
				for(var i=2;i<tem.length;i++){
					var disTxt=(tem[i].policyName != undefined ) ? tem[i].ruleName+" ("+tem[i].policyName+")": tem[i].ruleName;
					returnTxt+='<a style="display:inline-block;width:100%;text-align:center;color:blue;" onclick="OPMClient.FWACompliance.showFWARuleDetail(&#39;'+escape(JSON.stringify(tem[i]))+'&#39;,&#39;'+rid+'&#39;,&#39;'+devname+'&#39;)">'+encodeCellVal(disTxt)+'</a><br/>';
				}
				returnTxt+='</div>';
				returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
			}else{
				for(var i=0;i<tem.length;i++){
					var disTxt=(tem[i].policyName != undefined ) ? tem[i].ruleName+" ("+tem[i].policyName+")": tem[i].ruleName;
					returnTxt+='<a style="display:inline-block;width:100%;text-align:center;color:blue;"  onclick="OPMClient.FWACompliance.showFWARuleDetail(&#39;'+escape(JSON.stringify(tem[i]))+'&#39;,&#39;'+rid+'&#39;,&#39;'+devname+'&#39;)">'+encodeCellVal(disTxt)+'</a><br/>';
				}
			}
		}else{
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
		}
	}else{
		returnTxt='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}

		
	return returnTxt;
}
function fwaDevRuleDeviceListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(rowdata.devDetail != '-'){
		var tem = rowdata.devDetail
		if(tem != undefined && tem.length > 0){
			if(tem.length > 2){
				for(var i=0;i<2;i++){
					var disTxt=" ("+tem[i].vendor+")";
					returnTxt+='<div style="display:inline-block;width:100%;">'+tem[i].devName+'<p>'+disTxt+'</p></div><br/>';
				}
				var chowCount=tem.length-2;
				returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ('+chowCount+') ...</div></div>';
				returnTxt+='<div style="display:none" id="'+expandID+'">';
				for(var i=2;i<tem.length;i++){
					var disTxt=" ("+tem[i].vendor+")";
					returnTxt+='<div style="display:inline-block;width:100%;">'+tem[i].devName+'<p>'+disTxt+'</p></div><br/>';
				}
				returnTxt+='</div>';
				returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWADevGrpJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
			}else{
				for(var i=0;i<tem.length;i++){
					var disTxt=" ("+tem[i].vendor+")";
					returnTxt+='<div style="display:inline-block;width:100%;">'+tem[i].devName+'<p>'+disTxt+'</p></div><br/>';
				}
			}
		}else{
			returnTxt+='<span style="display:inline-block;width:100%;">-</span>';
		}
	}else{
		returnTxt='<span style="display:inline-block;width:100%;">-</span>';
	}

		
	return returnTxt;
}
function unassignedListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(cellValue != undefined && cellValue.length > 0){
		if(cellValue.length > 2){
			for(var i=0;i<2;i++){
				returnTxt+='<span style="display:inline-block;width:100%;text-align:center">'+cellValue[i]+'</span><br/>';
			}
			returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ...</div></div>';
			returnTxt+='<div style="display:none" id="'+expandID+'">';
			for(var i=2;i<cellValue.length;i++){
				returnTxt+='<span style="display:inline-block;width:100%;text-align:center;">'+cellValue[i]+'</span><br/>';
			}
			returnTxt+='</div>';
			returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
		}else{
			for(var i=0;i<cellValue.length;i++){
				returnTxt+='<span style="display:inline-block;width:100%;text-align:center">'+cellValue[i]+'</span><br/>';
			}
		}
	}else{
		returnTxt+='<span style="display:inline-block;width:100%;text-align:center">-</span>';
	}
	return returnTxt;
}

function ruleRecommListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos+options.gid;//NO I18N
	var returnTxt='';
	if(cellValue != undefined && cellValue.length > 0){
		if(cellValue.length > 5){
			for(var i=0;i<5;i++){
				returnTxt+='<span style="display:inline-block;text-align:center">'+cellValue[i]+'</span><br/>';
			}
			returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ...</div></div>';
			returnTxt+='<div style="display:none" id="'+expandID+'">';
			for(var i=5;i<cellValue.length;i++){
				returnTxt+='<span style="display:inline-block;text-align:center;">'+cellValue[i]+'</span><br/>';
			}
			returnTxt+='</div>';
			returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
		}else{
			for(var i=0;i<cellValue.length;i++){
				returnTxt+='<span style="display:inline-block;text-align:center">'+cellValue[i]+'</span><br/>';
			}
		}
	}else{
		returnTxt+='<span style="display:inline-block;text-align:center">-</span>';
	}
	return returnTxt;
}

function aceListFormatter(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	var aceList=cellValue.split("<br>");
	if(aceList != undefined && aceList.length > 0){
		if(aceList.length > 2){
			for(var i=0;i<2;i++){
				returnTxt+='<span style="display:inline-block;width:100%;">'+aceList[i]+'</span><br/>';
			}
			returnTxt+='<div style="padding-top:5px" id="'+expandID+'_showLink" onclick="showFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">'+Ember.I18n.t('webclient.common.showMore', this)+' ...</div></div>';
			returnTxt+='<div style="display:none" id="'+expandID+'">';
			for(var i=2;i<aceList.length;i++){
				returnTxt+='<span style="display:inline-block;width:100%;">'+aceList[i]+'</span><br/>';
			}
			returnTxt+='</div>';
			returnTxt+='<div style="padding-top:5px;display:none" id="'+expandID+'_hideLink" onclick="hideFWAJqgridExpandDiv(\''+expandID+'\',this)" ><div class="pointer" style="display:inline-block;width:100%;text-align:center;border:1px solid #35ab6e">... '+Ember.I18n.t('webclient.common.showLess', this)+'</div></div>';
		}else{
			for(var i=0;i<aceList.length;i++){
				returnTxt+='<span style="display:inline-block;width:100%;">'+aceList[i]+'</span><br/>';
			}
		}
	}else{
		returnTxt+='<span style="display:inline-block;width:100%;">-</span>';
	}
	return returnTxt;
}

function unassignedListFormatter2(cellValue, options, rowdata, action)
{
	var expandID=options.rowId+"_ExpandDiv_"+options.pos;//NO I18N
	var returnTxt='';
	if(cellValue != undefined && cellValue.length > 0){
		for(var i=0;i<cellValue.length;i++){
			returnTxt+='<span style="display:inline-block;width:100%;text-align:center">'+cellValue[i]+'</span><br/>';
		}
	}
	return returnTxt;
}

function hideFWADevGrpJqgridExpandDiv(expandID,THIS)
{
	$('#'+expandID).hide();
	$('#'+expandID+'_showLink').show();
	$('#'+expandID+'_hideLink').hide();
	var firstTrTop=$('.smsSettingsTabLabelHeight').offset().top;
	var selTrTop=140;
	if($(THIS).parent().parent().offset().top < 140){
		selTrTop=$(THIS).parent().parent().offset().top;
	}
	var scrollTopHight=selTrTop-firstTrTop;
	$('#settingsTabHolderDiv').animate({scrollTop:scrollTopHight}, 0);
}

function hideFWAJqgridExpandDiv(expandID,THIS)
{
	$('#'+expandID).hide();
	$('#'+expandID+'_showLink').show();
	$('#'+expandID+'_hideLink').hide();
	var firstTrTop=$('.Unused .opmFormHolder .tab1').offset().top;
	var selTrTop=140;
	if($(THIS).parent().parent().offset().top < 140){
		selTrTop=$(THIS).parent().parent().offset().top;
	}
	var scrollTopHight=selTrTop-firstTrTop;
	$('.Unused .opmFormHolder').animate({scrollTop:scrollTopHight}, 0);
}

function showFWAJqgridExpandDiv(expandID,THIS)
{
	$('#'+expandID).show();
	$('#'+expandID+'_showLink').hide();
	$('#'+expandID+'_hideLink').show();
}

function getfwaOutUsageGraph(cellValue, options, rowdata, action)
{
    var ipUtilization = Math.round(cellValue);
    if(cellValue > 100){
    	ipUtilization=">100";//No I18N
    	cellValue=100;
	OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"FWA_INTF_INVENTORY"}); //No I18N
    }
    var lowUtil = 20;
    var highUtil = 80;
    var bgUtil = Math.round((cellValue * 80) / 100);
//    var usageColor = "url(/images/green_bar.jpg)";//No I18N
    var usageColor = "severity_5";//No I18N
//            var d = new Double(ipUtilization);
    if (cellValue > lowUtil && cellValue <= highUtil) {
//        usageColor = "url(/images/yellow_bar.jpg)";//No I18N
        usageColor = "severity_3";//No I18N
    } else if (cellValue > highUtil) {
//        usageColor = "url(/images/red_bar.jpg)";//No I18N
        usageColor = "severity_1";//No I18N
    }
    var perClass = (cellValue == 100) ? "redtxt" : "txt"; //No I18N
    var renderString = "<div nowrap style='float:left;white-space: nowrap;' title="+Math.round(cellValue)+"%><div style='float:left;padding-top:0px;background-color: #e4e2e5; width:80px;'><div class=" + usageColor + " style=\"width:" + bgUtil + "px;height:20px;float:left;\"> </div></div><span nowrap style='float:left';title='"+ bgUtil +"'>&nbsp;" + rowdata.avgBwSpeedOut + " </span></div>"; //No I18N
    return renderString;
//    return ""
//    return "<div class='StatusColor'><span class="+usageColor+" style='w idth: 20;' ></span></div>"
}

function getfwaUsageGraphListIn(cellValue, options, rowdata, action)
{
	return "<span>"+Ember.I18n.t('NFAWidget.IN',this)+":"+rowdata.avgBwSpeedIn+"</span>";//No I18N
}
function getfwaUsageGraphListOut(cellValue, options, rowdata, action)
{
	return "<span>"+Ember.I18n.t('NFAWidget.OUT',this)+":"+rowdata.avgBwSpeedOut+"</span>";//No I18N
}
function fwacustomsort(cell){
    if(cell.indexOf("KB")>0 || cell.indexOf("Kbps")>0)//No I18N 
    {
        return parseFloat(cell) * 1024;//No I18N    
    }
    else if(cell.indexOf("MB")>0 || cell.indexOf("Mbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024;//No I18N 
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
        return 0 ;//No I18N 
    }
    else
    {
        return parseFloat(cell);
    }
}

var setFWADETimeConst;
var fwaDeviceRuleListReload;
// Fallback max diff-line count, mirrors FwConfigMgmt.DEFAULT_DIFF_LINE_THRESHOLD (Java) - used only when the
// grid row/response does not carry the live configured value (e.g. FWA_DIFF_LINE_THRESHOLD system property).
var FWA_DEFAULT_DIFF_LINE_THRESHOLD = 10000;
window.fwacomboChanged =false;
function reloadFWACollectorList(){
	if(!window.OPM.isFWAServer) {
		location.href = window.OPM.apiclientUrl+"Home";//No I18N
		return;
	}
	OPMClient.FWADistributedController.set('FWACollList',[]);//No I18N
	var jsonResponse;
	$.ajax({
		url: window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorDetails', //No I18N
		type: 'GET', //No I18N
		async:false,
		success: function(jsonResp)
		{
			if(jsonResp != undefined && jsonResp.colList != undefined && jsonResp.colList.length > 0){
				OPMClient.FWADistributedController.set('FWACollList',jsonResp.colList);//No I18N
				OPMClient.FWADistributedController.set('showAllCollDownImg',false);//No I18N
				OPMClient.FWADistributedController.set('isCollectorsExist',true);//No I18N
				OPMClient.FWADistributedController.set('selCollDown',false);//No I18N
				window.OPM.FWACollAvail=true;
				if(jsonResp.allCollDown){
					OPMClient.FWADistributedController.set('showAllCollDownImg',true);//No I18N
					location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
				}else{
					for(var i=0;i<jsonResp.colList.length;i++){
						if(sessionStorage.getItem("selectedFWACollectorID") == jsonResp.colList[i].CID){
							if(!jsonResp.colList[i].STATUS){
								OPMClient.FWADistributedController.set('selCollDown',true);//No I18N
								return;
							}
						}
					}
				}
				return;
			}else{
				location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
				return;
			}
		}
	});

}

function checkFWACollectorExistance()
{
	if(!window.OPM.isFWAServer) {
		location.href = window.OPM.apiclientUrl+"Home";//No I18N
		return;
	}
	OPMClient.FWADistributedController.set('FWACollList',[]);//No I18N
	var jsonResponse;
	$.ajax({
		url: window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorDetails', //No I18N
		type: 'GET', //No I18N
		async:false,
		success: function(jsonResp)
		{
			$('.fullMsgDiv').hide();
			$('.fwaDEColComboDiv').show();
//			$('body').removeClass('initialMsg');
			$("#main").show();
			if(jsonResp != undefined && jsonResp.colList != undefined && jsonResp.colList.length > 0){
				OPMClient.FWADistributedController.set('FWACollList',jsonResp.colList);//No I18N
				OPMClient.FWADistributedController.set('showAllCollDownImg',false);//No I18N
				OPMClient.FWADistributedController.set('isCollectorsExist',true);//No I18N
				OPMClient.FWADistributedController.set('selCollDown',false);//No I18N
				window.OPM.FWACollAvail=true;
				if(jsonResp.allCollDown){
					OPMClient.FWADistributedController.set('showAllCollDownImg',true);//No I18N
					location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
					return;
				}else{
					if(window.fwacomboChanged != undefined && window.fwacomboChanged){
						window.fwacomboChanged=false;
						loadFWACollectorList($('.FWAAllColCombo'));
						location.href =window.FullIndexURL;
						return;
					}else{
						for(var i=0;i<jsonResp.colList.length;i++){
							if(sessionStorage.getItem("selectedFWACollectorID") == jsonResp.colList[i].CID){
								if(jsonResp.colList[i].STATUS){
									if(window.OPM.userPermissions.dashboardRead || window.isoperator){
										location.href = window.OPM.apiclientUrl+"Home";//No I18N
									}else{
										location.href = window.OPM.apiclientUrl+"Inventory/List/LogMgmt/Devices"; //No I18N
									}
									return;
								}else{
									location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
									return;
								}
							}
						}
					}
				}
			}else{
				location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
				return;
			}
		}
	});
}


function loadFWACollectorList(selElem){
	selElem.empty();
	if(OPMClient.FWADistributedController != undefined && OPMClient.FWADistributedController.FWACollList != undefined){
		var Options="";//No I18N
		for(var i=0;i<OPMClient.FWADistributedController.FWACollList.length;i++)
		{
			Options += "<option value='"+OPMClient.FWADistributedController.FWACollList[i].CID+"'>"+OPMClient.FWADistributedController.FWACollList[i].NAME+"</option>"; //No I18n
		}	
		selElem.html(Options);
		if(sessionStorage.getItem("selectedFWACollectorID") == undefined || sessionStorage.getItem("selectedFWACollectorID") == null) {	//No I18n
			selElem.find("option:first").attr('selected','selected');//No I18N
		}else{
			if(selElem.find("option[value='"+sessionStorage.getItem("selectedFWACollectorID")+"']").length > 0){
				selElem.val(sessionStorage.getItem("selectedFWACollectorID")).prop('selected',true); //No I18n
			}else{
				selElem.find("option:first").attr('selected','selected');//No I18N
			}
		}
		selElem.select2();
	}
}



function fwacollComboChanged(selCol)
{
	window.fwacomboChanged=true;
	sessionStorage.setItem("selectedFWACollectorID",selCol);//NO I18N
	localStorage.setItem("selectedFWACollectorID",selCol);//NO I18N
	window.OPM.FWASelCollId = $(".FWAAllColCombo").val();
	reloadFWACollChangedPage();
	initializeGenAI();
}
function reloadFWACollChangedPage()
{
	var URL=location.href;
	var indexURL =URL.substr(URL.indexOf("#/")+2,URL.length);
	var urlArr=indexURL.split("/");
	var colltotDetail = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorDetails');//No I18N
	var collDetail=colltotDetail.colList;
	for(var i=0;i<collDetail.length;i++){
		if(sessionStorage.getItem("selectedFWACollectorID") == collDetail[i].CID){
			if(collDetail[i].STATUS){
				enableMainTabLinkDE();
				if(urlArr != undefined){
					listCustomViews('ALARMS');//NO I18N
					if(urlArr[0] != undefined && urlArr[0] == 'Home'){
						if(urlArr[3] != undefined && !(fwaList.indexOf(urlArr[3]) >= 0)){
							OPMClient.HomeDetailsController.favouriteDashboard = OPMClient.ApplicationController.defaultDashboard = window.OPM.defaultDashboard = "";//NO I18N
							OPMClient.ApplicationController.defaultProduct = window.OPM.defaultProduct = "FWA";//NO I18N
							indexURL="Home";//NO I18N
						}
					}else if(urlArr[0] != undefined && urlArr[0] == 'Inventory'){
						if(urlArr[1] != undefined && urlArr[1] == 'List'){
							if(urlArr[4] != undefined && (urlArr[4] == 'ShortSummary' || urlArr[4] == 'FWAUnassignedProtocol')){
								indexURL="Inventory/List/LogMgmt/Devices";//NO I18n
							}
						}
					}else if(urlArr[0] != undefined && urlArr[0] == 'Alarms'){
						var isCustomAlarm = OPMClient.AlarmDetailsController.get("isCustomAlarm");//No I18N
						if((urlArr[2] != undefined && urlArr[2] == 'Details') || isCustomAlarm){
							indexURL="Alarms/Alarm/Active";//NO I18n
						}
					}
					else if(urlArr[0] != undefined && urlArr[0] == 'Reports'){
						if(urlArr[1] != undefined && urlArr[1] == 'Reports.FWAReports'){
							var RedirURL="Reports/Reports.FWAReports/MyReports/Profiles";//NO I18n
							if(urlArr[2] != undefined && urlArr[2] == 'FireReports'){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/FireReports";//NO I18n
								}
							}else if(urlArr[2] != undefined && urlArr[2] == 'ProxyReports'){
								if(collDetail[i] != undefined && collDetail[i].hasProxyDev){
									RedirURL="Reports/Reports.FWAReports/ProxyReports";//NO I18n
								}
							}else if(urlArr[2] != undefined && urlArr[2] == 'VpnReports'){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/VpnReports";//NO I18n
								}
							}else if(urlArr[2] != undefined && urlArr[2] == 'ChangeManagement'){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/ChangeManagement";//NO I18n
								}
							}else if(urlArr[2] != undefined && urlArr[2] == 'SecAudit'){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/SecAudit/Report";//NO I18n
								}
							}else if(urlArr[2] != undefined && (urlArr[2] == 'Standards' || urlArr[2] == 'Device')){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/Standards";//NO I18n
								}
							}else if(urlArr[2] != undefined && urlArr[2] == 'RuleManagement'){
								if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
									RedirURL="Reports/Reports.FWAReports/RuleManagement/Overview";//NO I18n
								}
							}
							indexURL=RedirURL;
						}
					}else if(urlArr[0] != undefined && urlArr[0] == 'FWACompliance'){

						var RedirURL="Reports/Reports.FWAReports/MyReports/Profiles";//NO I18n
						if(urlArr[1] != undefined && urlArr[1] == 'ChangeManagement'){
							if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
								RedirURL="FWACompliance/ChangeManagement";//NO I18n
							}
						}else if(urlArr[1] != undefined && urlArr[1] == 'SecAudit'){
							if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
								RedirURL="FWACompliance/SecAudit/Report";//NO I18n
							}
						}else if(urlArr[1] != undefined && (urlArr[1] == 'Standards' || urlArr[1] == 'Device')){
							if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
								RedirURL="FWACompliance/Standards";//NO I18n
							}
						}else if(urlArr[1] != undefined && urlArr[1] == 'RuleManagement'){
							if(collDetail[i] != undefined && collDetail[i].hasFirewallDev){
								RedirURL="FWACompliance/RuleManagement";//NO I18n
							}
						}
						indexURL=RedirURL;
					
					}else if(urlArr[0] != undefined && urlArr[0] == 'FWANewCompliance'){
						indexURL="FWANewCompliance/RuleManagement/Overview";//No I18N
					}else if(urlArr[0] != undefined && urlArr[0] == 'FWASearch'){
						indexURL="FWASearch/Search";//NO I18n
					}else if(urlArr[0] != undefined && urlArr[0] == 'FWACollImg'){
						indexURL="Home";//NO I18N
					}
				}
			}else{
				indexURL='FWACollImg';//No I18N
			}
		}
	}
	window.FullIndexURL = window.OPM.apiclientUrl + indexURL;
	location.href="#/";
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

function showFWACollDownMsg(colDetail){
	if(sessionStorage != undefined && sessionStorage.getItem("selectedFWACollectorID") != undefined && sessionStorage.getItem("selectedFWACollectorID") != null){//NO I18N
		if(colDetail != undefined && colDetail.cid != undefined){
			if(sessionStorage.getItem("selectedFWACollectorID") == colDetail.cid){
				if(!colDetail.status){
					location.href = window.OPM.apiclientUrl+"FWACollImg";//No I18N
					return;
				}
			}
		}
	}
}

function showFWALicExMsg(licstatus){
	location.reload();
}

function CollectorDetailEdited(cid,action,fromPage){
	if(!window.OPM.isFWAServer) {
		location.href = window.OPM.apiclientUrl+"Home";//No I18N
		return;
	}
	OPMClient.FWADistributedController.set('FWACollList',[]);//No I18N
	var jsonResponse;
	$.ajax({
		url: window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorDetails', //No I18N
		type: 'GET', //No I18N
		async:false,
		success: function(jsonResp)
		{
			if(jsonResp != undefined && jsonResp.colList != undefined && jsonResp.colList.length > 0){
				OPMClient.FWADistributedController.set('FWACollList',jsonResp.colList);//No I18N
				OPMClient.FWADistributedController.set('showAllCollDownImg',false);//No I18N
				OPMClient.FWADistributedController.set('isCollectorsExist',true);//No I18N
				OPMClient.FWADistributedController.set('selCollDown',false);//No I18N
				window.OPM.FWACollAvail=true;
				var colstatus=jsonResp.colList[0].STATUS;
				var colcid=jsonResp.colList[0].CID;
				loadFWACollectorList($('.FWAAllColCombo'));
				if(action == 'delete'){
					if(cid == sessionStorage.getItem("selectedFWACollectorID")){
						$('.FWAAllColCombo').val(colcid).select2();
						sessionStorage.setItem("selectedFWACollectorID",$('.FWAAllColCombo').val());//No I18N
						if(!colstatus){
							disableMainTabLinkDE();
						}else{
							enableMainTabLinkDE();
						}
					}
				}else{
					if(cid == sessionStorage.getItem("selectedFWACollectorID")){
						for(var ij=0;ij<jsonResp.colList.length;ij++){
							if(jsonResp.colList[ij].CID == sessionStorage.getItem("selectedFWACollectorID")){
								if(jsonResp.colList[ij].STATUS){
									enableMainTabLinkDE();
								}else{
									disableMainTabLinkDE();
								}
							}
						}
					}
				}
				return;
			}else{
				OPMClient.FWADistributedController.FWACollList=[];
				window.OPM.FWACollAvail=false;
				OPMClient.FWADistributedController.set('showAllCollDownImg',true);//No I18N
				OPMClient.FWADistributedController.set('isCollectorsExist',false);//No I18N
				disableMainTabLinkDE();
				settingsTabs.setProperties({"subTabs":[{"displayName":Ember.I18n.t('webclient.googlemap.addprobe.probe',this),"route":"Settings.FirewallConfig.Collector.CollSett"}]});//No I18N
			}
		}
	});
}

function FWACollectorDeleted(cid){
	if(cid == sessionStorage.getItem("selectedFWACollectorID")){
		if(OPMClient.FWADistributedController.FWACollList.length == 1){
			OPMClient.FWADistributedController.FWACollList=[];
			window.OPM.FWACollAvail=false;
			OPMClient.FWADistributedController.set('showAllCollDownImg',true);//No I18N
			OPMClient.FWADistributedController.set('isCollectorsExist',false);//No I18N
			disableMainTabLinkDE();
			if(!window.OPM.oldView){
				settingsTabs.setProperties({"subTabs":[{"displayName":Ember.I18n.t('webclient.googlemap.addprobe.probe',this),"route":"Settings.FirewallConfig.Collector.CollSett"}]});//No I18N
			}
		}else{
			var colList = OPMClient.FWADistributedController.FWACollList;
			for(var ij=0;ij<OPMClient.FWADistributedController.FWACollList.length;ij++){
				if(OPMClient.FWADistributedController.FWACollList[ij].CID == cid){
					colList.splice(ij,1);
				}
			}
			OPMClient.FWADistributedController.set('FWACollList',colList);//No I18N
			var colstatus=OPMClient.FWADistributedController.FWACollList[0].STATUS;
			var colcid=OPMClient.FWADistributedController.FWACollList[0].CID;
			if(colstatus){
				enableMainTabLinkDE();
			}else{
				disableMainTabLinkDE();
			}
			$('.FWAAllColCombo').val(colcid).select2();
			sessionStorage.setItem("selectedFWACollectorID",$('.FWAAllColCombo').val());//No I18N
		}
	}else{
		var colList = OPMClient.FWADistributedController.FWACollList;
		for(var ij=0;ij<OPMClient.FWADistributedController.FWACollList.length;ij++){
			if(OPMClient.FWADistributedController.FWACollList[ij].CID == cid){
				colList.splice(ij,1);
			}
		}
		OPMClient.FWADistributedController.set('FWACollList',colList);//No I18N
	}
	loadFWACollectorList($('.FWAAllColCombo'));
}

function fwa_saveAsCSVFile(csvData, fileName) {
    if (!csvData) {
        alert(Ember.I18n.t('webclient.common.invalidData')); //No I18N
        return;
    }
    csvData += '\r\n\r\n\r\n\r\n\r\n\r\n\r\n'; //No I18N
    csvData += '"*************************************************************** ' + Ember.I18n.t('webclient.Note') + ' ***********************************************************************"\r\n'; //No I18N
    csvData += '"*   ' + Ember.I18n.t('nfa.GDPRalert.csvPDFMsg') + '     *"\r\n'; //No I18N
    csvData += '"***********************************************************************************************************************************************"\r\n'; //No I18N
    fileName += '.csv'; //No I18N
    if (navigator.msSaveBlob) {
        var blobIE = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' }); //No I18N
        navigator.msSaveBlob(blobIE, fileName);
        return;
    }
    var blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' }); //No I18N
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); //No I18N
    a.href = url;
    a.download = fileName;
    if (typeof a.click === 'function') { //No I18N
        a.click();
    } else {
        var evt = new MouseEvent("click", { bubbles: true, cancelable: true }); //No I18N
        a.dispatchEvent(evt);
    }
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);
}

function firewallReportGenCsv(repTitle)
{
	if(OPMClient.FWAReportsDetailsController.rtype == "MyRep" &&  ($("#tabList").find("option:selected").attr('repType') == "raw")){ //No I18n
		var fileName =$('#deviceList').find("option:selected").text(); //NO I18N
		fileName += '_'+$(".list li a.active").text()+'_';  //NO I18N
		fileName += $('#opm_currentTime').text().replace(/[ ,:\/]/g , "_");  //NO I18N
		fwa_generateCSV($("#0_List"),fileName);
	}else{
		if(repTitle != undefined){
			var fileName=repTitle;
		}else{
			var fileName=OPMClient.FWAReportsDetailsController.repTitle;
		}
		var CSV = '';   //No I18N
		var tableIds=OPMClient.FWAReportWidgetLoadingController.singWidTabId;
		for(var t=0;t<tableIds.length;t++){
			tableIds[t]=$('#'+(tableIds[t]));
		}
		for(tabArr=0; tabArr<tableIds.length; tabArr++){
			var mymodel = tableIds[tabArr].getGridParam('colModel');//No I18N
			var arrData = tableIds[tabArr].jqGrid('getRowData');//No I18N
			if(tableIds[tabArr][0].id == 'unusedObjectsList' || tableIds[tabArr][0].id == 'unusedCountDrillList'){
		    	 var headers=[Ember.I18n.t('webclient.inventory.policyname', this),Ember.I18n.t("ncm.acd.Rulename",this),Ember.I18n.t("webclient.fwa.used.source",this),Ember.I18n.t("webclient.fwa.unused.source",this),Ember.I18n.t("webclient.fwa.used.dst",this),Ember.I18n.t("webclient.fwa.unused.dst",this),Ember.I18n.t("webclient.fwa.used.service",this),Ember.I18n.t("webclient.fwa.unused.service",this)];//No I18N
		    	 if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
		    		 headers.push(Ember.I18n.t("webclient.fwa.used.application",this));
		    		 headers.push(Ember.I18n.t("webclient.fwa.unused.application",this));
		    	 }
		    }else{
		    	 var headers=tableIds[tabArr].jqGrid("getGridParam", "colNames");// No I18N
		    }
			if(OPMClient.FWAReportsDetailsController.reportList[tabArr].rbbTitle!=undefined){
				var ReportTitle=OPMClient.FWAReportsDetailsController.reportList[tabArr].rbbTitle;
			}
			else{
				var ReportTitle=OPMClient.FWAReportsDetailsController.reportList[tabArr];
			}
			var excludeColumns=[];
			var includeColumns=[];

			CSV +=  '\r\n\n'+ReportTitle+'\n';//No I18N
			 if(tableIds[tabArr][0].id == "unusedRulesList"){
				 excludeColumns.push("action");
			 }else{
				 for (var colName in arrData[0]) {
						if(opm_isHTML(arrData[0][colName])) {
							excludeColumns.push(colName);
						}
					}
			 }
			

			if (true) {
				var row = "";//No I18N
				if(headers) {
					for (var i = 0; i < headers.length; i++) {  
						if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i]) && mymodel[i].name != "rn") {	
							row +='"' + headers[i] + '",'; //No I18N
							includeColumns.push(mymodel[i].name);
						}else {  
							excludeColumns.push(mymodel[i].name);
						}	
					}
				}
				row = row.slice(0, -1);     
				CSV += row + '\r\n';//No I18N
			}
			if(tableIds[tabArr][0].id == "unusedRulesList" || tableIds[tabArr][0].id == "unusedAceList"){
				var exclude='<span class="pointer">';//No I18N
				var exclude1="<a href=";//No I18N
				for (var i = 0; i < arrData.length; i++) {
					var row = "";//No I18N

					for (var j=0; j<includeColumns.length; j++) {
						var toinsert=arrData[i][includeColumns[j]];

						if(toinsert.indexOf(exclude)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf(exclude1)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf("<br>")>-1) {
							toinsert = toinsert.replaceAll("<br>","\r");
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else {
							row += '"' + toinsert + '",';//No I18N
						}
					
					}
					row = row.slice(0, -1);
					CSV += row + '\r\n';//No I18N
				}
			}else if(tableIds[tabArr][0].id == "suggestedChangesList"){
				var exclude='<span class="pointer">';//No I18N
				var exclude1="<a href=";//No I18N
				for (var i = 0; i < arrData.length; i++) {
					var row = "";//No I18N

					for (var j=0; j<includeColumns.length; j++) {
						var toinsert=arrData[i][includeColumns[j]];

						if(toinsert.indexOf(exclude)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf(exclude1)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf("<br>")>-1) {
							var html = toinsert.replaceAll("<br>","\r");
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf("<img")>-1) {
							 var html =toinsert.replace(/<img[^>]*>/g," to ");
							 row += '"' + html + '",';//No I18N
						}
						else {
							row += '"' + toinsert + '",';//No I18N
						}
					
					}
					row = row.slice(0, -1);
					CSV += row + '\r\n';//No I18N
				}
			}else{
				var exclude='<span class="pointer">';//No I18N
				var exclude1="<a href=";//No I18N
				for (var i = 0; i < arrData.length; i++) {
					var row = "";//No I18N

					for (var j=0; j<includeColumns.length; j++) {
						var toinsert=arrData[i][includeColumns[j]];

						if(toinsert.indexOf(exclude)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else if(toinsert.indexOf(exclude1)>-1) {
							var html = $.parseHTML(toinsert);
							row += '"' + $(html).text().trim() + '",';//No I18N
						}else {
							row += '"' + toinsert + '",';//No I18N
						}
					
					}
					row = row.slice(0, -1);
					CSV += row + '\r\n';//No I18N
				}
			}
			
		}
	    for(var t=0;t<tableIds.length;t++){
	    	OPMClient.FWAReportWidgetLoadingController.singWidTabId[t]=tableIds[t][0].id;
		}
	    fwa_saveAsCSVFile(CSV,fileName);
	}
}

function fwa_generateCSV(grid,captionTitle,staticRowData,vpnWidget,reportTitle)
{
	if(captionTitle===undefined||captionTitle===null||captionTitle==="") {
		captionTitle=Ember.I18n.t('webclient.export.excel.name',this);// No I18N
	}
	if(vpnWidget != undefined && vpnWidget){
		var headers = OPMClient.FWAInventoryReportDrillController.colNameList;
		var mymodel = getFWAColModels(headers.length);
	}else{
		var mymodel = grid.getGridParam('colModel');//No I18N
		var headers=grid.jqGrid("getGridParam", "colNames");//No I18N
	}

	if(staticRowData != undefined){
		var arrData = staticRowData;//No I18N
	}else{
		var arrData = grid.jqGrid('getRowData');//No I18N
	}
	
	
	var fileName=captionTitle;
	if(reportTitle != undefined && reportTitle != ""){
		var ReportTitle=reportTitle;	
	}else{
		var ReportTitle=captionTitle;		
	}
	var CSV = '';   //No I18N
	var excludeColumns=[];
	var includeColumns=[];

	CSV += ReportTitle + '\r\n\n';//No I18N
	for (var colName in arrData[0]) {
		if(isNaN(arrData[0][colName]) && opm_isHTML(arrData[0][colName])) {
			excludeColumns.push(colName);
		}
	}

	if (true) {
		var row = "";//No I18N
		if(headers) {
			for (var i = 0; i < headers.length; i++) {  
				if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i]) && mymodel[i].name != "rn") {	
					row +='"' + headers[i] + '",'; //No I18N
					includeColumns.push(mymodel[i].name);
				}else {  
					excludeColumns.push(mymodel[i].name);
				}	
			}
		}
		row = row.slice(0, -1);     
		CSV += row + '\r\n';//No I18N
	}

	var exclude='<span class="pointer">';//No I18N
	var exclude1="<a href=";//No I18N
	for (var i = 0; i < arrData.length; i++) {
		var row = "";//No I18N

		for (var j=0; j<includeColumns.length; j++) {
			var toinsert=arrData[i][includeColumns[j]]+"";

			if(toinsert.indexOf(exclude)>-1) {
				var html = $.parseHTML(toinsert);
				row += '"' + $(html).text().trim() + '",';//No I18N
			}else if(toinsert.indexOf(exclude1)>-1) {
				var html = $.parseHTML(toinsert);
				row += '"' + $(html).text().trim() + '",';//No I18N
			}else {
				row += '"' + toinsert + '",';//No I18N
			}
		
		}
		row = row.slice(0, -1);
		CSV += row + '\r\n';//No I18N
	}
	fwa_saveAsCSVFile(CSV,fileName);
}

function getColnameForXLSExport(grid,hideRowNO,vpnwidget){

	var ishideRowNO = (hideRowNO != undefined )?hideRowNO:false;
	var mymodel = grid.getGridParam('colModel');// No I18N

	if(vpnwidget){
		var headers = OPMClient.FWAInventoryReportDrillController.colNameList;
	}else{
		var headers=grid.jqGrid("getGridParam", "colNames");// No I18N
	}
	var excludeColumns=[];
	var columnheaders=[]; 
	var datavector=[];
	
	if (true) {
		if(headers) {
			for (var i = 0; i < headers.length; i++) {
				if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i]) && mymodel[i].name!="rn") {  
					columnheaders.push(encodeURI(headers[i]));
				}   
				else {  
					excludeColumns.push(mymodel[i].name);
				}   
			}
		}
	}
	return columnheaders;
}

function fwa_generateXLSFromServer(grid,captionTitle,hideRowNO,gridData)
{
    $('form[target=miniWin]').remove();
    if(captionTitle===undefined||captionTitle===null||captionTitle==="") {
        captionTitle=Ember.I18n.t('webclient.export.excel.name',this);// No I18N
    }
	var ishideRowNO = (hideRowNO != undefined )?hideRowNO:false;
    var mymodel = grid.getGridParam('colModel');// No I18N
    if(gridData != undefined){
    	var arrData = gridData;
    }else{
        var arrData = grid.jqGrid('getRowData');// No I18N
    }
    var headers=grid.jqGrid("getGridParam", "colNames");// No I18N
    var fileName=captionTitle;
    var ReportTitle=captionTitle 
    var excludeColumns=[];
    var columnheaders=[]; 
    var datavector=[];
    for (var colName in arrData[0]) {
        if(opm_isHTML(arrData[0][colName])) {
            excludeColumns.push(colName);
        }
    }
    if (true) {
        if(headers) {
            for (var i = 0; i < headers.length; i++) {  
				if(!ishideRowNO){
                if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i]) && mymodel[i].name!="rn") {  
                    columnheaders.push(headers[i]);
                }   
                else {  
                    excludeColumns.push(mymodel[i].name);
                }   
            }
				else{
					if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i]) && mymodel[i].name != "rn") {
						columnheaders.push(headers[i]);
					}	
					else {  
						excludeColumns.push(mymodel[i].name);
					}
				}
			}
        }
    }
    var exclude='<span class="pointer">';// No I18N
    var exclude1="<a href=";// No I18N
    var exclude2='<span class="activestatus" title="Active" style="float:left"></span>';// No I18N
    var exclude3='<span class="inactivestatus" title="Inactive" style="float:left"></span>';
    for (var i = 0; i < arrData.length; i++) {
        var innervect = [];
        for (var colName in arrData[i]) {
            if(excludeColumns.indexOf(colName) > -1) {
                continue;
            }
            var toinsert=arrData[i][colName]+"";   
            if(toinsert.indexOf(exclude)>-1) {
                var html = $.parseHTML(toinsert);
                innervect.push($(html).text().trim());
            }
            else if(toinsert.indexOf(exclude1)>-1) {
                var html = $.parseHTML(toinsert);
                innervect.push($(html).text().trim());
            }
            else if(toinsert.indexOf(exclude2)>-1) {
                var html = $.parseHTML(toinsert);
                innervect.push($(html).text().trim());
            }
            else if(toinsert.indexOf(exclude3)>-1) {
                var html = $.parseHTML(toinsert);
                innervect.push($(html).text().trim());
            }
            else {
                innervect.push(toinsert);
            }
        }
        datavector.push(innervect);
    }
    if (datavector.length<0) {        
        alert("Invalid data");// No I18N
        return;
    }
        var form=$("<form method='post' id='XlsForm' target='miniWin' action='"+window.OPM.opmUrl + window.OPM.apiUrlPattern + "/admin/generatexlsfile'><input type='text' name='fileName' value='"+fileName+"'/><input type='text' name='title' value='"+ReportTitle+"'/><input type='text' name='columnheaders' value='"+JSON.stringify(columnheaders)+"'/><input type='text' name='datavector' value='"+escapeHTML(JSON.stringify(datavector))+"'/><input type='hidden' name='opmcsrftoken' value='"+readCsrfToken("opmcsrfcookie")+"'/></form>");//No I18N
        $(document.body).append(form);
        form.submit();
    $('#XlsForm').remove();
	//window.open(window.OPM.opmUrl+window.OPM.apiUrlPattern + '/admin/generatexlsfile?fileName='+fileName+'&title='+ReportTitle+'&columnheaders='+JSON.stringify(columnheaders)+'&datavector='+JSON.stringify(datavector))
}

function fwa_isValidName(testName,restrictedChars) {
	restrictedChars = (restrictedChars !== undefined)?restrictedChars:'~!@#$%^&*()+=-[]\\\';,./{}|\":<>?'; //No I18N
	for (var i = 0; i < testName.length; i++) {
		if (restrictedChars.indexOf(testName.charAt(i)) != -1) {
			return false;
		}
	}
	return true;
}

function fwaJqgridSearchClear(THIS){
	var tableID="statisticsList";//NO I18N
	if($('#fwaPolicyOverviewList').is(':visible')){
		tableID="statisticsDrillList";//NO I18N
	}
	var closeID=$(THIS).attr('id').replace("_close","");
	$('#gbox_'+tableID+' '+'#'+closeID).val("");
	var e = $.Event("keypress");//No I18N
    e.keyCode = 13;
    $('#gbox_'+tableID+' '+'#'+closeID).trigger(e);
}


function fwa_getModelForDevMultiSelect(){
	var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorVsResourceList'); //No I18N
	var collObj = {}; 
	var deviceList = [],totalAvailDevCount = 0,totalSelDevCount = 0,selectedDevCount=0,selectedCollCount=0;
	for(var i=0;i<response.length;i++) {
		collObj.className = "chkParentChild"; //No I18N
		collObj.collectorId = "collector_"+i; //No I18N
		collObj.devLstId = "devList_"+i; //No I18N
		collObj.collId = response[i].cid;
		collObj.displayName = response[i].collectorName;
		if(response[i].deviceList != undefined){
			collObj.intfList = response[i].deviceList;
			collObj = fwa_changeIntfListCheckedVal(collObj,[]);
			totalAvailDevCount +=  collObj.intfList.length;
			totalSelDevCount += collObj.selectedIntfCount;
		}else{
			collObj.selectedIntfCount=0;
			collObj.intfList = []
		}

		deviceList[i] = collObj;
		collObj ={};
	}
	if(deviceList[0] !== undefined){
		deviceList[0].className += " active"; //No I18N
	}
	OPMClient.FWAUserMgmtDetailsController.set("lists",[]); //No I18N
	OPMClient.FWAUserMgmtDetailsController.set("lists.totalAvailDevCount",totalAvailDevCount); //No I18N
	OPMClient.FWAUserMgmtDetailsController.set("lists.totalSelDevCount",totalSelDevCount); //No I18N
	OPMClient.FWAUserMgmtDetailsController.set("lists.availDeviceList",deviceList); //No I18N
	OPMClient.FWAUserMgmtDetailsController.set("lists.selectedDevCount",selectedDevCount); //No I18N
	OPMClient.FWAUserMgmtDetailsController.set("lists.selectedCollCount",selectedCollCount); //No I18N
	if(OPMClient.SettingsAddEditController.operation || OPMClient.SettingsAddEditController.pageObj.addGroups){
		OPMClient.FWAUserMgmtDetailsController.set("selectedFWADevices",[]); //No I18N
		OPMClient.FWAUserMgmtDetailsController.set("loadFWADECollDetails",true); //No I18N
	}
}

function fwa_changeIntfListCheckedVal(collObj,selDeviceList) {
	collObj.selectedIntfCount = 0;
	var collID=collObj.collectorId.replace("collector_",""); //No I18N
	for(var i=0;i<collObj.intfList.length;i++){
		if(selDeviceList.contains(""+collObj.intfList[i][1])) {
			collObj.selectedIntfCount++;
			if(collObj.intfList[i][2] == undefined){
				collObj.intfList[i].push("checked"); //No I18N
			}else{
				collObj.intfList[i][2]="checked"; //No I18N
			}
			
		}else{
			if(collObj.intfList[i][2] == undefined){
				collObj.intfList[i].push(""); //No I18N
			}else{
				collObj.intfList[i][2]=""; //No I18N
			}
		}
		collObj.intfList[i].push("DeviceID_"+collID+"_"+i); //No I18N
	}
	collObj.allIntfSelected = (collObj.selectedIntfCount == collObj.intfList.length)?"checked":""; //No I18N
	return collObj;
}

function fwaSearchMultiSelCollList(str){
    $('#fwaCollList .chkParentChild .routerName').each(function () {//No I18N
        if($(this).text().search(new RegExp(str, "i")) >= 0) {//No I18N
            $(this).closest('li').click().show();
        }else {
            $(this).closest('li').hide();
        }
    });

    var scrlListHt=$('.chkParentChild.active').find('ul')[0].scrollHeight; //No I18N
    if(scrlListHt<268){scrlListHt=268;}
    $('.opmAccListChk').css({height:scrlListHt,'max-height':'630px'});
}
function fwaSearchMultiSelDeviceList(str){
    $('#fwaCollList .chkParentChild.active .intfName').each(function () {//No I18N
        if($(this).text().search(new RegExp(str, "i")) >= 0) {//No I18N
            $(this).closest('li').show();
        }else {
            $(this).closest('li').hide();
        }
        $('.opmAccListChk').removeAttr('style').css({height:$('.chkParentChild.active').find('ul')[0].scrollHeight,'max-height':'630px'}); //No I18N
    });

}

function fwa_KeyCopyToClipBoard(str){
//	var str = fwa_getCentralServerId();
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
   opm_infoMsgs('successMsg',Ember.I18n.t('webclient.fwa.settings.installationkey.copied',this)); //No I18N
}

function fwa_getAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
	var uniqueID;
	$.ajax({
		url: apiURL,
		data: formData, //No I18N
		type: 'GET', //No I18N
		dataType: 'json', //No I18n
		async:true,
		beforeSend: function(XMLHttpRequest,settings) {
			if(message != undefined){
				uniqueID = opm_infoMsgs("infoMsg", message); //NO I18N
			}
			appendFWACollectorDetails(XMLHttpRequest,settings);
		},
		success: function(jsonData) {
			if(message != undefined){
				$("#"+uniqueID).remove(); //NO I18N
			}
			callBckFunc(jsonData,callBckParams);
		}
	});
}

function fwa_getCentralServerId(){
	if(window.OPM.isFWADE && window.OPM.isFWAServer){
		var serverDet=opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/fwaenterprise/getFWACentralID'); //No I18N
		if(serverDet != undefined && serverDet.installationKey != undefined){
			return serverDet.installationKey;
		}else{
			return null;
		}
	}else{
		return null;
	}
	
}
function fwa_postAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
	var uniqueID;
	$.ajax({
		url: apiURL,
		data: formData,
		type: "POST", //NO I18N
		dataType: "json", //NO I18N
		async:true,
		beforeSend: function(XMLHttpRequest,settings) {
			if(message != undefined){
				uniqueID = opm_infoMsgs("infoMsg", message); //NO I18N
			}
			appendFWACollectorDetails(XMLHttpRequest,settings);
		},
		success: function(jsonData) {
			if(message != undefined){
				$("#"+uniqueID).remove(); //NO I18N
			}
			callBckFunc(jsonData,callBckParams);
		}
	});
}
function fwa_getModelForProbeDeviceMultiSelect(response,self){
	OPMClient.FWAReportProfileController.multiSelectReportList = [];
	var reportList=[],totalAvailWidgetCount=0;
	var repList =JSON.stringify(self.get("reportList"));
	for(var i=0;i<response.length;i++) {
		var reportObj = {};
		reportObj.className = "chkParentChild"; //No I18N
		reportObj.probeid = response[i].probeid;
		reportObj.selWidgetCount = 0; 
		reportObj.allWidgetsSelected="";
		reportObj.index = i; 
		reportObj.reportLstId = "reportLst_"+response[i].probeid+"_"+i; //No I18N
		reportObj.widgetLstId = "widgetLst_"+response[i].probeid+"_"+i; //No I18N
		reportObj.checked = false;
		totalAvailWidgetCount +=  response[i].resDet.length;
		reportObj.displayName = response[i].probeName;
		reportObj.widgetList = response[i].resDet;
		reportList[i] = reportObj;
	}
	if(reportList[0] !== undefined){
		reportList[0].className += " active"; //No I18N
	}
	self.set("reportList",reportList);//NO I18N
	OPMClient.FWAReportProfileController.multiSelectReportList=reportList;
	self.set("totalAvailWidgetCount",totalAvailWidgetCount); //No I18N
	self.set("totalSelWidgetCount",0); //No I18N
}

function fwa_getModelForReportMultiSelect(jsonData,self,selRbbgID){
	var response = jsonData.reportList; //No I18N
	var reportList=[],totalAvailWidgetCount=0;
	var rbbgIndex="-1";
	for(var i=0;i<response.length;i++) {
		var reportObj = {};
		reportObj.className = "chkParentChild"; //No I18N
		reportObj.rbbgid = response[i].rbbgid; //No I18N
		if(reportObj.rbbgid == selRbbgID){
			rbbgIndex=i;
		}
		reportObj.selWidgetCount = 0; //No I18N
		reportObj.allWidgetsSelected="";
		reportObj.index = i; //No I18N
		reportObj.reportLstId = "reportLst_"+response[i].rbbgid+"_"+i; //No I18N
		reportObj.widgetLstId = "widgetLst_"+response[i].rbbgid+"_"+i; //No I18N
		reportObj.checked = false;
		totalAvailWidgetCount +=  response[i].rbbList.length;
		reportObj.displayName = response[i].repName;
		reportObj.widgetList = response[i].rbbList;
		reportList[i] = reportObj;
	}
	if(rbbgIndex != "-1"){
		if(rbbgIndex != 0 && reportList[0] !== undefined){
			reportList[0].className += " noActive"; //No I18N
		}
		reportList[rbbgIndex].className += " active"; //No I18N
		$('#routerList').animate({scrollTop: $('#routerList').prop("scrollHeight")}, 100);
	}else{
		if(reportList[0] !== undefined){
			reportList[0].className += " active"; //No I18N
		}
	}
	
	self.set("reportList",reportList);//NO I18N
	OPMClient.FWAReportProfileController.multiSelectReportList=reportList;
	self.set("totalAvailWidgetCount",totalAvailWidgetCount); //No I18N
	self.set("totalSelWidgetCount",0); //No I18N
	OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
}

function fwa_selectModelForProbeDeviceMultiSelect(selDevList,self){
	var reportList = self.get("reportList");
	var totalAvailWidgetCount = self.get("totalAvailWidgetCount"); //No I18N
	var temptotalWidgetSlectedList=0;
	for(var i=0;i<reportList.length;i++){
		var selWidgetCount = 0;
		for(var j=0;j<reportList[i].widgetList.length;j++){
			if(selDevList.indexOf(reportList[i].widgetList[j].id) > -1){
				selWidgetCount=selWidgetCount+1;
				temptotalWidgetSlectedList=temptotalWidgetSlectedList+1;
				reportList[i].widgetList[j].ischecked = "checked"
			}
		}
		reportList[i].selWidgetCount=selWidgetCount;
		if(selWidgetCount == reportList[i].widgetList.length){
			reportList[i].allWidgetsSelected="checked";
		}
	}
	if(temptotalWidgetSlectedList == totalAvailWidgetCount){
		self.set("isAllReportTypeSelected","checked"); //No I18N
	}
	self.set("totalSelWidgetCount",temptotalWidgetSlectedList); //No I18N
	OPMClient.FWAReportProfileController.multiSelectReportList=reportList;
	self.set("reportList",reportList);//No I18N
}

function fwa_selectModelForReportMultiSelect(selreport,self){
	var reportList = self.get("reportList");
	var totalAvailWidgetCount = self.get("totalAvailWidgetCount"); //No I18N
	var temptotalWidgetSlectedList=0;
	
	for(var ij=0;ij<selreport.length;ij++){
		var rbbgid=selreport[ij].rbbgid;
		var widgetLst=selreport[ij].rbblist;
		for(var i=0;i<reportList.length;i++){
			if(rbbgid == reportList[i].rbbgid){
				var selWidgetCount = 0;
				for(var j=0;j<reportList[i].widgetList.length;j++){
					if(widgetLst == "all"){
						selWidgetCount=selWidgetCount+1;
						temptotalWidgetSlectedList=temptotalWidgetSlectedList+1;
						reportList[i].widgetList[j].ischecked = "checked"
					}else if(widgetLst.indexOf(reportList[i].widgetList[j].rbbname) > -1){
						selWidgetCount=selWidgetCount+1;
						temptotalWidgetSlectedList=temptotalWidgetSlectedList+1;
						reportList[i].widgetList[j].ischecked = "checked"
					}
				}
				reportList[i].selWidgetCount=selWidgetCount;
				if(selWidgetCount == reportList[i].widgetList.length){
					reportList[i].allWidgetsSelected="checked";
				}
			}
		}
	}
		
	if(temptotalWidgetSlectedList == totalAvailWidgetCount){
		self.set("isAllReportTypeSelected","checked"); //No I18N
	}
	self.set("totalSelWidgetCount",temptotalWidgetSlectedList); //No I18N
	OPMClient.FWAReportProfileController.multiSelectReportList=reportList;
	self.set("reportList",reportList);//No I18N
	OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
}
function fwa_getModelForRuleMultiSelect(jsonData, self, selCategoryId, selRuleList) {
    var ruleList = [], totalAvailRuleCount = 0, totalSelRuleCount = 0;
    var categoryIndex = "-1";
    var categoryKeys = Object.keys(jsonData);
    var selRuleSet = new Set(selRuleList || []);
    
    for (var i = 0; i < categoryKeys.length; i++) {
        var categoryKey = categoryKeys[i];
        var categoryData = jsonData[categoryKey];
        var ruleObj = {};
        ruleObj.className = (i == 0 ? "chkParentChild active" : "chkParentChild noActive"); //No I18N
        ruleObj.categoryId = categoryKey;
        if (ruleObj.categoryId == selCategoryId) {
            categoryIndex = i;
        }
        ruleObj.selRuleCount = 0;
        ruleObj.allRulesSelected = "";
        ruleObj.index = i;
        ruleObj.ruleLstId = "ruleLst_" + categoryKey + "_" + i; //No I18N
        ruleObj.ruleItemLstId = "ruleItemLst_" + categoryKey + "_" + i; //No I18N
        ruleObj.checked = false;
        totalAvailRuleCount += categoryData.rules.length;
        ruleObj.displayName = categoryData.repName;
		ruleObj.repId = categoryData.repId;
        ruleObj.ruleItemList = [];
        
        for (var j = 0; j < categoryData.rules.length; j++) {
            var rule = categoryData.rules[j];
            var isChecked = selRuleSet.has(rule.ruleId) ? "checked" : "";//No I18N
            if (isChecked === "checked") {
                ruleObj.selRuleCount++;
                totalSelRuleCount++;
            }
            ruleObj.ruleItemList.push({
                ruleId: rule.ruleId,
                ruleName: rule.ruleName,
                criteriaPattern: rule.criteriaPattern,
                criteria: rule.criteria,
				isIntfSpecific: rule.isIntfSpecific,
                ischecked: isChecked
            });
        }
        ruleObj.allRulesSelected = (ruleObj.selRuleCount === ruleObj.ruleItemList.length && ruleObj.ruleItemList.length > 0) ? "checked" : "";//No I18N
        ruleList[i] = ruleObj;
    }
    
    // ... rest of the function
    self.set("ruleList", ruleList);//No I18N
    OPMClient.FWARiskAnalysisConfigProfileController.multiSelectRuleList = ruleList;
    self.set("totalAvailRuleCount", totalAvailRuleCount);//No I18N
    self.set("totalSelRuleCount", totalSelRuleCount);//No I18N
    $('#totalSelectedPredefinedRules').text('('+totalSelRuleCount+')'); //No I18N
    
    // Check if any selected rule has isIntfSpecific and show/hide intfSpecificRiskNote
    var hasIntfSpecificSelected = false;
    for (var k = 0; k < ruleList.length; k++) {
        for (var l = 0; l < ruleList[k].ruleItemList.length; l++) {
            if (ruleList[k].ruleItemList[l].ischecked === "checked" && ruleList[k].ruleItemList[l].isIntfSpecific) { //No I18N
                hasIntfSpecificSelected = true;
                break;
            }
        }
        if (hasIntfSpecificSelected) {
			break;
		}
    }
    if (hasIntfSpecificSelected) {
        $('.intfSpecificRiskNote').show(); //No I18N
    } else {
        $('.intfSpecificRiskNote').hide(); //No I18N
    }
}

function fwa_getnotselectedmetrics(idstr)
{
    var toRetArr = [];
    var checkedBoxCount = $("#" + idstr + " input:not(:checked)").length; //No I18N
    for (var i = 0; i < checkedBoxCount; i++)
    {
        var value = $("#" + idstr + " input:not(:checked)")[i].value;
        if(value!=="on")
        {
            toRetArr.push(value); //No I18N
        }
    }
    return toRetArr;

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
	
function fwa_getScheduleTime()
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
    var JsonData ={};
    JsonData.SchDate = SchDate;
    JsonData.SchTime = SchTime;
    JsonData.SchMin = SchMin;
    JsonData.hrlyEvery = hrlyEvery;
    JsonData.SchMonth = SchMonth;
    JsonData.SchDay = SchDay;
    return JsonData;
}

function fwaOperNotAuthorized(){
	if(window.isoperator){
		opmGlobalRoute.transitionTo("NotAuthorized"); //NO I18N
		return true;
	}	
}

function setFWASubHeaderActive() {
	setTimeout(function(){
		var selectorClass = '.adminTabs'; // No I18N
		$('.settingsHdr .adminTabs li a').removeClass('active');
		$(selectorClass).find('a').each(function() {
			var count = $(this).closest('.navTabList').count;
			if(count > 0) {
				return;
			}
			var href = $(this).attr('href');
			var url = window.location.href.split('#')[1];
			
			if(href != undefined) {
				var href = href.replace('#', '');
				if(url.indexOf(href) != -1) {
					$('.d_info a.active').removeClass('active');
					$('.d_info.active').removeClass('active');
					if($(this).parent().hasClass('d_info')) {
						$(this).addClass('active');
					} else {
						$(this).closest('.d_info').children('a').addClass('active');
					}
					$(this).addClass('active');
					return;
				}
			}
		});
	}, 200);
}

function fwaruleMgmt_validateFields(invalidEnteries){
	var count = 0;
	var firstElement = "";//No I18N
	if(invalidEnteries.empty !== undefined && invalidEnteries.empty.length > 0)
	{
		$.each(invalidEnteries.empty,function(key,val){
			var validatingField = trim($("#"+val).val());//No I18N
			if(validatingField === undefined || validatingField === "" || validatingField === null ){//No I18N
				count++;
			}
		});
	}
	if(count === 0){
		if(invalidEnteries.positive !== undefined && invalidEnteries.positive.length > 0){
			$.each(invalidEnteries.positive,function(key,val){
				var validatingField = trim($("#"+val).val());
				if(!opm_IsNumeric(validatingField) || validatingField <= 0){
					count++;
				}
			});
		}
		if(invalidEnteries.isNumeric !== undefined && invalidEnteries.isNumeric.length > 0){
			$.each(invalidEnteries.isNumeric,function(key,val){
				var validatingField = trim($("#"+val).val());
				if(!opm_IsNumeric(validatingField)){
					count++;
				}
			});
		}
	}
	if(count > 0){
		return false;    
	}
	return true;
}
function fwa_getAjaxResponse(apiURL,formData) {
	var responseObj = {};
	$.ajax({
		url: apiURL,
		data: formData,
		type: 'GET', //No I18N
		dataType: 'json', //No I18n
		async:false,
		beforeSend: function(XMLHttpRequest,settings) {
  			appendCollectorDetails(XMLHttpRequest, settings);
  			appendFWACollectorDetails(XMLHttpRequest,settings);
  		},
		success: function(jsonData) {
			if(jsonData !== null) {
				responseObj = jsonData;
			}
		}
	});
	return responseObj;
}

function fwa_showFWAAddonPromotionDiv() {
	var promotionDetails = fwa_getAjaxResponse(window.OPM.apiUrlPattern+"/fwaglobal/getFWAPromotionDetails"); //NO I18N

	//Addon promotion content handling
	var obj = {display: false, showExportFlow: false, showEnableFirewall: false};
	if(window.OPM.isFwaPlug && promotionDetails.fwaManagedDeviceCount === 0) {
		obj.display = true;
		obj.showExportFlow = true;
	}else if(!window.OPM.isFwaPlug && !window.OPM.isEvalUser) {
		obj.display = true;
		obj.showEnableFirewall = true;
		$('#addDeviceIcon').hide();
		$('#fwaEditIntf').hide();
	}
	obj.display ? $("#opm_devListHolder").hide() : $("#opm_devListHolder").show(); //NO I18N
	OPMClient.InventoryFWAController.set("fwaAddonPromotion", obj); //NO I18N

	//Addon trial popup handling
	if(promotionDetails.showOptionToEnableTrialLicense) {
		var addOnProperties = checkWidgetIsAddOnAndsetData("fwa.promotion.top.band"); //NO I18N
		addOnProperties.fwaCloseIcon = true;
		addOnProperties.showCloseOptions = true;
		OPMClient.InventoryDeviceDetailsController.set("opmAddOnPopupProps", addOnProperties); //NO I18N
		fwa_showAddonPopup();
	}
}

function fwa_addonLicensePopupAction(remindMe) {
	var callBackFunction = function(response) {
		hideAddonPopup();
	};
	fwa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/fwaglobal/updateFWAPromotionDetails", {closePreference: remindMe}, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
}

function fwa_showFWAAddonPromotionDivFromMsgFramework() {
	var addOnProperties = checkWidgetIsAddOnAndsetData("fwa.promotion.top.band"); //NO I18N
	addOnProperties.fwaCloseIcon = true;
	addOnProperties.showCloseOptions = false;
	OPMClient.InventoryDeviceDetailsController.set("opmAddOnPopupProps", addOnProperties); //NO I18N
	fwa_showAddonPopup();
}

function fwa_showAddonPopup() {
	if(window.OPM.isProbe) {
		$("#probeMsg").show(); $("#tryNowBtn").hide();
	}else {
		$("#probeMsg").hide(); $("#tryNowBtn").show();
	}
	$(".addon-popup__wrapper .addon-popup__modal").addClass("nfa-addon relative"); //NO I18N
	$(".addon-popup__wrapper").css({"display": "flex", "opacity": 1}); //NO I18N
}
function fwa_validateMaxRountVal(val){
	if(isNaN(val) || val > OPMClient.FWACustomReportRowcountController.maxRowCount){
		return false;
	}else{
		return true;
	}
}

function devAuditSuccessLink(cellValue, options, rowdata, action) {
	var retText="";
	if(rowdata.SUCCESS_COUNT != undefined){
		if(rowdata.SUCCESS_COUNT == 0){
			retText +="<a>"+rowdata.SUCCESS_COUNT+"</a>";//No I18N
		}else{
			retText +="<a style='color:blue;text-decoration:underline' onclick='deviceAuditDrillRep("+rowdata.PROCESS_ID+",\"Success\")'>"+rowdata.SUCCESS_COUNT+"</a>";//No I18N
		}
	}
	return retText;
}

function devAuditFailureLink(cellValue, options, rowdata, action) {
	var retText="";
	if(rowdata.FAILURE_COUNT != undefined){
		if(rowdata.FAILURE_COUNT == 0){
			retText +="<a>"+rowdata.FAILURE_COUNT+"</a>";//No I18N
		}else{
			retText +="<a style='color:blue;text-decoration:underline' onclick='deviceAuditDrillRep("+rowdata.PROCESS_ID+",\"Failure\")'>"+rowdata.FAILURE_COUNT+"</a>";//No I18N
		}
	}
	return retText;
}

function devAuditINprogressLink(cellValue, options, rowdata, action) {
	var retText="";
	if(rowdata.INPROGRESS_COUNT != undefined){
		if(rowdata.INPROGRESS_COUNT == 0){
			retText +="<a>"+rowdata.INPROGRESS_COUNT+"</a>";//No I18N
		}else{
			retText +="<a style='color:blue;text-decoration:underline' onclick='deviceAuditDrillRep("+rowdata.PROCESS_ID+",\"In Progress\")'>"+rowdata.INPROGRESS_COUNT+"</a>";//No I18N
		}
	}
	return retText;
}
function deviceAuditDrillRep(processid, status){
	location.href = window.OPM.apiclientUrl+"Reports/AuditLogs/DeviceAudit/DrillPage/"+processid+"/"+status; //No I18N
}

function configChangeCountLinkFormatter(cellValue, options, rowdata, action)
{
	if(cellValue == -1) {
		var hugeDiffTooltip = Ember.I18n.t("webclient.fwa.diff.huge.config.unavailable", {param0: (rowdata && rowdata.diffLineThreshold) || FWA_DEFAULT_DIFF_LINE_THRESHOLD}); //No I18N
		var hugeDiffLabel = Ember.I18n.t("webclient.fwa.diff.huge.label", this); //No I18N
		return '<span style="color:blue;cursor:pointer;" class="pointer" title="'+hugeDiffTooltip+'" onclick="opm_infoMsgs(\'infoMsg\',\''+hugeDiffTooltip+'\');">'+hugeDiffLabel+'</span>'; //No I18N
	}
	if(cellValue > 0){
		return '<span style="color:blue" class="pointer" onclick="OPMClient.Settings.showChangeMgmtReport('+OPMClient.FWAReportsDetailsController.devID+','+rowdata.VersionNo+',\''+rowdata.Type+'\');">'+cellValue+'</span>'; //No I18N	
	}else{
		return cellValue;
	}
	
}

function conflictChangeCountFormatter(cellValue, options, rowdata, action)
{
	if(cellValue == -1) {
		var hugeDiffTooltip = Ember.I18n.t("webclient.fwa.diff.huge.config.unavailable", {param0: (rowdata && rowdata.diffLineThreshold) || FWA_DEFAULT_DIFF_LINE_THRESHOLD}); //No I18N
		var hugeDiffLabel = Ember.I18n.t("webclient.fwa.diff.huge.label", this); //No I18N
		return '<span style="color:blue;cursor:pointer;" class="pointer" title="'+hugeDiffTooltip+'" onclick="opm_infoMsgs(\'infoMsg\',\''+hugeDiffTooltip+'\');">'+hugeDiffLabel+'</span>'; //No I18N
	}
	return cellValue;
}
function ruleChangeCountLinkFormatter(cellValue, options, rowdata, action)
{
	if(cellValue > 0){
		return '<span style="color:blue" class="pointer" onclick="OPMClient.Reports.showRuleChangeReport('+options.rowId+');">'+cellValue+'</span>'; //No I18N
	}else{
		return cellValue;
	}
	
}

function searchRuleNameTextinList(str){
	$(".ruleDetailRows").each(function () {//No I18N
		if ($(this).attr("ruleName").search(new RegExp(str, "i")) >= 0) {//No I18N
			$(this).show();
		} else {
			$(this).hide()
		}
	});
}

function fwa_validateCustomTime(startTime, endTime) {
    if (!startTime || !endTime) {
        opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.customTime.emptyMsg")); //No I18N
        return false;
    }
    var sDate = new Date(startTime);
    var eDate = new Date(endTime);
    if (isNaN(sDate) || isNaN(eDate)) {
        opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.customTime.emptyMsg")); //No I18N
        return false;
    }
    if (sDate >= eDate) {
        opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.admin.archive.timeerr")); //No I18N
        return false;
    }
    return true;
}

function fwaobjectLinkBrFormatter(cellValue, options, rowdata, action)
{
	if(cellValue != undefined){
		var objLinks = cellValue.split("<br>");
		var retLink = [];
		for(var i=0;i<objLinks.length;i++){
			retLink.push(escapeHTML(objLinks[i]));
		}
		return retLink.join("<br>");//NO I18N
	}else{
		return '';
	}
}

function fwaobjectLinkCommaFormatter(cellValue, options, rowdata, action)
{
	if(cellValue != undefined){
		var objLinks = cellValue.split(",");
		var retLink = [];
		for(var i=0;i<objLinks.length;i++){
			retLink.push(escapeHTML(objLinks[i]));
		}
		return retLink.join("<br>");//NO I18N
	}else{
		return '';
	}
}
