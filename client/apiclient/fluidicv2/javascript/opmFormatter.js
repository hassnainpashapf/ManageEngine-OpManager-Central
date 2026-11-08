/* $Id$ */
//IgnoreI18N_Start
var pfSensePortConvertor = {
	'179' :'BGP (179)',
	'5999' :'CVSup (5999)',
	'53' :'DNS (53)',
	'853' :'DNS over TLS (853)',
	'21' :'FTP (21)',
	'3000' :'HBCI (3000)',
	'80' :'HTTP (80)',
	'443' :'HTTPS (443)',
	'5190' :'ICQ (5190)',
	'113' :'IDENT/AUTH (113)',
	'143' :'IMAP (143)',
	'993' :'IMAP/S (993)',
	'4500' :'IPsec NAT-T (4500)',
	'500' :'ISAKMP (500)',
	'1701' :'L2TP (1701)',
	'389' :'LDAP (389)',
	'636' :'LDAP/S (636)',
	'1755' :'MMS/TCP (1755)',
	'7000' :'MMS/UDP (7000)',
	'445' :'MS DS (445)',
	'3389' :'MS RDP (3389)',
	'1512' :'MS WINS (1512)',
	'1863' :'MSN (1863)',
	'119' :'NNTP (119)',
	'123' :'NTP (123)',
	'138' :'NetBIOS-DGM (138)',
	'137' :'NetBIOS-NS (137)',
	'139' :'NetBIOS-SSN (139)',
	'1194' :'OpenVPN (1194)',
	'110' :'POP3 (110)',
	'995' :'POP3/S (995)',
	'1723' :'PPTP (1723)',
	'1812' :'RADIUS (1812)',
	'1813' :'RADIUS accounting (1813)',
	'5004' :'RTP (5004)',
	'5060' :'SIP (5060)',
	'25' :'SMTP (25)',
	'465' :'SMTP/S (465)',
	'161' :'SNMP (161)',
	'162' :'SNMP-Trap (162)',
	'22' :'SSH (22)',
	'3478' :'STUN (3478)',
	'587' :'SUBMISSION (587)',
	'514' :'Syslog (514)',
	'3544' :'Teredo (3544)',
	'23' :'Telnet (23)',
	'69' :'TFTP (69)',
	'5900' :'VNC (5900)'
};
var pfSenseProtocolConvertor = {
	'any' :'Any',
	'tcp' :'TCP',
	'udp' :'UDP',
	'tcp/udp' :'TCP/UDP',
	'icmp' :'ICMP',
	'esp' :'ESP',
	'ah' :'AH',
	'gre' :'GRE',
	'etherip' :'EoIP',
	'ipv6' :'IPv6',
	'igmp' :'IGMP',
	'pim' :'PIM',
	'ospf' :'OSPF',
	'sctp' :'SCTP',
	'carp' :'CARP',
	'pfsync' :'PFSYNC'
}
//IgnoreI18N_End

var fwaRuleMgmtAlarmEvents=["FWA_OverviewReport", "FWA_OptimizationReport", "FWA_CleanupReport", "FWA_ExpiryReport", "FWA_RiskReport","FWA_Standard","Firewall Rule Change","FWA_RuleChangeAlert"];//NO I18N
function agentStatusformatter(cellValue, options, rowdata, action)
{
    var status = rowdata.STATUS;
    var iconClass = "--fault-severity icon-status5";//No I18N
    var agentUninstalled =1,agentDeviceDown =2,agentDown=3,agentNotCommunicating=4,AgentCrashed=6;
    if(status == agentUninstalled ||  status == AgentCrashed)
    {
        iconClass = "--fault-severity icon-status1"//No I18N
    }
    else if(status == agentDown)
    {
        iconClass = "--fault-severity icon-status2"//No I18N
    }
    else if(status == agentNotCommunicating)
    {
        iconClass = "--fault-severity icon-status3"//No I18N
    }
    else if(status == agentDeviceDown)
    {
        iconClass = "--fault-severity icon-status4"//No I18N
    }
    var result =   "<i class='"+iconClass+"'></i>" + opm_escapeHTML(cellValue);//No I18N
    return result;
    //        <i class="--fault-severity icon-status5"></i>

}

function agentNameformatter(cellValue, options, rowdata, action)
{
   // if(rowdata.AGENTTYPE == "Log File Agent")
   // {
   //      // var helpcard = '<a class="hasHelpCard hasHelpCard4"><div class="helpCard top"><div class=helpCardInfo><div class=helpCardContent><div><p>'+Ember.I18n.t('webclient.agent.helpcard.grid',this) +'</div></div></div></div></a>'
   //      var result = cellValue ;
   //      //result+= "  " + helpcard;
   // }
    return cellValue;
}
function agentTypeformatter(cellValue, options, rowdata, action)
{

    if(cellValue == "Idle Agent"){
        var title = Ember.I18n.t('webclient.agent.idleAgent.title',this); //No I18N
        var reason1 =Ember.I18n.t('webclient.agent.idleAgent.One',this); //No I18N
        var reason2 =Ember.I18n.t('webclient.agent.idleAgent.Two',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ reason1+ "'data-content2='"+reason2+"'></a>";//No I18N
        var mappingLink = "<br><span class='ncmLink associateAgent' > ("+Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices',this)+")  </span>"
        if(window.OPM.isMSPCentral && window.OPM.isProbeSelected== false)
        {
            mappingLink = '';
        }
        if(!window.OPM.userPermissions.discoveryWrite)
        {
            mappingLink = '';
        }
        return Ember.I18n.t('webclient.agent.idle.agent') +"  "+ mappingLink + info  ;//No I18N
    }
    else if(rowdata.AGENTTYPE == "Log File Agent" && rowdata.STATUS != 1 && !OPMClient.ApplicationController.isOPMStandardEdition && window.OPM.userPermissions.monitoringWrite )
    {
        var helpcard = '<a class="hasHelpCard hasHelpCard4"><div class="helpCard bottom"><div class=helpCardInfo><div class=helpCardContent><div><p>'+Ember.I18n.t('webclient.agent.helpcard.grid',this) +'</div></div></div></div></a>'
        var result = Ember.I18n.t('webclient.agent.log.file.agent') +"  "+ helpcard+ "<br><span class='ncmLink convertToAgent'>("+Ember.I18n.t('webclient.agent.support.convertTomonitoringAgent',this)+")</span>";
        if(window.OPM.isMSPCentral)
        {
            if(window.OPM.isProbeSelected == true)
            {
                return result
            }
        }
        else
        {
            return result
        }

    }
    var helpcard = '<a class="hasHelpCard hasHelpCard4"><div class="helpCard bottom"><div class=helpCardInfo><div class=helpCardContent><div><p class=word-break>'+Ember.I18n.t('webclient.agent.helpcard.grid',this) +'</div></div></div></div></a>'
    if(cellValue == "Log File Agent")
    {
       var result = Ember.I18n.t('webclient.agent.log.file.agent');
        result+= "  " + helpcard;
        return result;
    } else {
        return Ember.I18n.t('webclient.audit.agentmonitoring');
    }
}


function associateAgent(rowData)
{

    if(rowData.STATUS != '5')
    {
        var link = 'https://www.manageengine.com/network-monitoring/kb/agent-status-troubleshooting.html?utm_source=inproduct';//No I18N
        opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.agent.mapping.msg.down', {storeLink: link})); //No I18n
        return ;
    }
    OPMClient.SettingsAddEditController.pageObj = rowData;
    settingsGlobalRoute.transitionTo('Settings.Agents.OPM.Actions'); //No I18N
}
function convertAgentDialog(AgentInfo)
{
        //AgentInfo = JSON.parse(AgentInfo);
    if(AgentInfo.STATUS != '5')
    {
        var link = 'https://www.manageengine.com/network-monitoring/kb/agent-status-troubleshooting.html?utm_source=inproduct';//No I18N
        opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.agent.mapping.msg.down', {storeLink: link})); //No I18n
        return ;
    }
        OPMClient.SettingsGlobalMonitors.agents.selectedAgent = AgentInfo;
         $('body').addClass("ui-dialog-style2");//No I18N
        $('#convertAgentContent').text(Ember.I18n.t('webclient.Log.File.Agent.Convert',this));//No I18N
        $("#convertAgent").dialog({
            title: Ember.I18n.t('webclient.common.proceed.message',this),//No I18N
            resizable: false,
            height: "auto", // No I18N
            width:400,
            modal: true,
            close: function() {
                      $( this ).dialog( "close" );
            }

         });
          //  $('.ui-dialog-titlebar').addClass('titlebar-icon');//No I18N
        //$('<em class="svgIcon size20"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#warning-color"/></svg></em>').insertBefore('.ui-dialog-title');//No I18N

}
function convertAgent(AgentInfo)
{
    AgentInfo =OPMClient.SettingsGlobalMonitors.agents.selectedAgent;
    $(".ui-dialog-titlebar-close").click()
    var postdata = {'agentKey':AgentInfo.AGENTKEY,'mappedDevice':AgentInfo.MOID,'monAgentConvertion':true} //No I18N
    var done = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/updateAgentDetails',postdata); //No I18N
    slideSuccessHandler(done,'opm_SettingsGlobalMonitorsGridLoad',OPMClient.SettingsTabController.monitorName,"Settings.Agents.OPM"); //No I18N

}
function installedSoftwaresDate(cellValue, options, rowdata, action)
{
	var r = isNaN(cellValue) ? opm_escapeHTML(cellValue) : cellValue.slice(0, 4) + "-" + cellValue.slice(4, 6) + "-"+cellValue.slice(6);
	return r;
}
function opm_setTrapDescOnly(cellValue, options, rowdata, action)
{
    var trapDesc = (cellValue.length > 160) ? cellValue.substring(0,160)+"...":cellValue; //No I18N
    return "<span title='"+escapeHtmlTags(cellValue)+"'>"+escapeHtmlTags(trapDesc)+"</span>"; //No I18N
}
function opm_setTrapNameWithDesc(cellValue, options, rowdata, action)
{
    var trapDesc = (rowdata.description.length > 110) ? rowdata.description.substring(0,110)+"...":rowdata.description; //No I18N
    return "<div title='"+cellValue+"' tabindex='0' role='link'>"+cellValue+"</div><div class='trapSubtitle' title='"+escapeHtmlTags(rowdata.description)+"'>"+jqGridHTMLEncode(trapDesc)+"</div>"; //No I18N
}

function isDSAccessible(cellvalue, options, rowObject)
{
    var result = cellvalue == true ? "<i class='icon-status5'></i>&nbsp;" : "<i class='icon-status1'></i>&nbsp;";//No I18N
    return result;
}

function setCustomLinkUrl(cellvalue, options, rowObject)
{
    return "<a href='"+escapeHTML(rowObject.url)+"' target='_blank'>"+escapeHtmlTags(cellvalue)+"</a>"; //No I18n
}
function convertAgentFormatter(cellValue, options, rowdata, action)
{
    if(rowdata.AGENTTYPE == "Log File Agent"  && !OPMClient.ApplicationController.isOPMStandardEdition && window.OPM.userPermissions.monitoringWrite)
    {
         return rowdata.AGENTTYPE + "<span class='ncmLink' onclick= 'convertAgent(`"+JSON.stringify(rowdata)+"`)'>  ("+Ember.I18n.t('webclient.agent.support.convertTomonitoringAgent',this)+")  </span>";
    }
    else
    {
        return rowdata.AGENTTYPE
    }
}
function opm_formatKMBT(y)
{
    abs_y = Math.abs(y);
    if (abs_y >= 1000000000000)   { return y / 1000000000000 + "T" }
    else if (abs_y >= 1000000000) { return y / 1000000000 + "G" }
    else if (abs_y >= 1000000)    { return y / 1000000 + "M" }
    else if (abs_y >= 1000)       { return y / 1000 + "K" }
    else if (abs_y < 1 && y > 0)  { return y.toFixed(2) }
    else if (abs_y == 0)          { return 0 }
    else if (abs_y % 1 !== 0) { return y.toFixed(2)} //25.05000000000000 to 25.05
    else                      { return y }
}
function nbarCheckBoxFormatter(cellvalue, options, rowObject)
{
    var isChecked='';
    if(rowObject.isEnabled) {
        isChecked='checked';//No I18N
    }
    return "<div class='chkRoundBtn nfaGridStatus'><input class='nbarStatusCBox' type='checkbox' value='"+htmlEncode(rowObject.infid)+"' "+isChecked+"/><label></label></div>";//No I18N
}
function convertTimeToLongFormatter(cellvalue, rowData)
{
    return rowData.modTimeLong;
}

function setIPSLACallPath(cellValue, options, rowdata, action)
{
    var status = ""; //No I18n
    if(rowdata.Status !== undefined)
    {
        status = rowdata.Status;
    }
    if(rowdata.STATUS !== undefined)
    {
        status = rowdata.STATUS;
    }
    if(rowdata.status !== undefined)
    {
        status = rowdata.status;
    }
    if(status !== "")
    {
        status = "<div class='voipStatus"+status+"' style='float:left;top:4px'></div>"; //No I18n
    }
    return status+"<div>"+escapeHTML(cellValue)+" --> "+escapeHTML(rowdata.TARGETNAME)+"</div>"; //No I18n
}
function qosNbarCheckBoxFormatter(cellvalue, options, rowObject)
{
    var isChecked='';
    var isEnabled='';
    if(OPMClient.SettingsNFAConfigController.qosNbarEnabledInterfaces.contains(rowObject.infid.toString())){
        if(!rowObject.canEnable && !((rowObject.policyin != undefined && rowObject.policyin == "fwa.compliance.loading") || (rowObject.nbarstatus != undefined && rowObject.nbarstatus == "Loading"))){
            OPMClient.SettingsNFAConfigController.qosNbarEnabledInterfaces.splice(OPMClient.SettingsNFAConfigController.qosNbarEnabledInterfaces.indexOf(rowObject.infid.toString()), 1);
            OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces.splice(OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces.indexOf(rowObject.infid.toString()), 1);
        }else{
            isChecked = "checked"; //No I18N
        }
    }
    if(!rowObject.canEnable) {
        isEnabled='disabled';//No I18N
        if(OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces.contains(rowObject.infid.toString())){
            OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces.splice(OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces.indexOf(rowObject.infid.toString()), 1);
        }
        if(OPMClient.SettingsNFAConfigController.qosNbarSelectedIPs.contains(rowObject.routerIP)){
            OPMClient.SettingsNFAConfigController.qosNbarSelectedIPs.splice(OPMClient.SettingsNFAConfigController.qosNbarSelectedIPs.indexOf(rowObject.routerIP), 1);
        }
    }
    return "<div class='chkRoundBtn nfaGridStatus'><input class='qosNbarCBox' type='checkbox' data-routerip='"+htmlEncode(rowObject.routerIP)+"' value='"+htmlEncode(rowObject.infid)+"' "+isChecked+" "+isEnabled+"/><label></label></div>";//No I18N
}
function nipperConfigViewFormatter(cellValue, options, rowdata, action)
{
    var selId = rowdata[0];
    return "<i onclick='getNipperReport("+selId+",true,true)'><u><b>"+Ember.I18n.t('webclient.report.tooltip.view',this)+"</b></u></i>";//No I18N
}

function nipperSecAuditViewFormatter(cellValue, options, rowdata, action)
{
    var selId = rowdata[0];
    return "<i onclick='getNipperReport("+selId+",false,true)'><u><b>"+Ember.I18n.t('webclient.report.tooltip.view',this)+"</b></u></i>";//No I18N
}

function nfaShowPortsFormatter(cellvalue, options, rowObject) {
	var returnLink="";
	if(rowObject.Name.indexOf('_App')!=-1 && OPMClient.InventoryDeviceDetailsController.inventorysnapType !== 'FlowIPGroup') { //No I18N
		if(OPMClient.InventoryDeviceDetailsController.isRawEnabled){
			returnLink = "[<span class='opm_link' onclick='redirectSnapShot(\"NFAShowPorts\")'>"+Ember.I18n.t('webclient.nfa.apps.showports',this)+"</span>]"; //No I18N
		}
		returnLink+="<i class='hasHelpCard' onclick=\"window.open('https://www.manageengine.com/products/netflow/help/troubeshooting-apps-not-listed-by-name.html','_blank')\" style='float:left!important' title=\""+Ember.I18n.t('webclient.settings.forMoreinfo')+"\"></i>"; //No I18N
	}else if(rowObject.Name.indexOf('Others')!=-1) { //No I18N
		returnLink = "<i class='hasHelpCard' onclick=\"window.open('https://www.manageengine.com/products/netflow/help/troubleshooting-names-listed-as-others-in-inventory.html','_blank')\" style='float:left!important' title=\""+Ember.I18n.t('webclient.settings.forMoreinfo')+"\"></i>"; //No I18N
	}
	return returnLink;
}

function editResolveDNSFormatter(cellvalue, options, rowObject) {
    if (rowObject.Name === null || rowObject.Name === "Others") {return "";}//No I18N
    return "<i style='float:left' class='pointer icon-configedit' onclick='redirectSnapShot(\"EditDNS/"+htmlEncode(rowObject.ip)+"\")' title='"+Ember.I18n.t('webclient.action.edit',this)+"' ></i>"; //No I18n
}
function nfaBillingReportFormatter(cellvalue, options, rowObject)
{
    if(cellvalue) {
		return "<span class='textBlue' onclick='OPMClient.Reports.redirectBillReportList(\""+htmlEncode(rowObject.planid)+"\",\""+htmlEncode(rowObject.name)+"\")'>"+Ember.I18n.t('webclient.reports.viewreports',this)+"</span>";//No I18N
    }else {
        return Ember.I18n.t('webclient.reports.noreportsgenerated',this);//No I18N
    }
}
function nfaBillingOnDemandLinkFormatter(cellvalue, options, rowObject)
{
    return "<span class='textBlue'>"+Ember.I18n.t('webclient.billing.ondemand',this)+"</span>";//No I18N
}
function nfaDevFlowMsgFormatter(cellvalue,options,rowObject) {
    var returnString=""; //No I18N
    if(rowObject.tainted) {
        cellvalue+=' '+Ember.I18n.t('nfa.flowMsg.taintedPkts');//No I18N
    }
    if(cellvalue !== "" && cellvalue !== undefined) { //No I18N
        returnString="<i title='"+htmlEncode(cellvalue)+"' class='status_icon nfaDEColStats status4'></i>";//No I18N
    }
    return returnString;
}
function nfaNewStatusFormatter(cellvalue, options, rowObject) {
    if(rowObject.state !== 1) {
        return "";
    }
    var iconTitle;
    if(rowObject.wlcStatus !== 1 && rowObject.wlcStatus !== undefined) {
        iconTitle='webclient.new.intfs'; //No I18N
    }else{
        iconTitle='webclient.apmac.new'; //No I18N
    }
    return "<i class='icon-new' title='"+Ember.I18n.t(iconTitle)+"'>"+Ember.I18n.t('webclient.map.view.new')+"</i>"; //No I18N
}

function nfa_getTrafficIcon(cellValue,options,rowData,action){
    if(rowData.wlcStatus === 4){return ""};
    return (rowData.state!=1)?"<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>":"";
}

function nfa_getTrafficIconForInterface(cellvalue, options, rowObject) {
    if(window.OPM.isCentralServer && rowObject.state === 1) {
        return "<i class='icon-new' title='"+Ember.I18n.t("nfa.interface.statusNew")+"'>"+Ember.I18n.t("webclient.map.view.new")+"</i>"; //NO I18N
    }
    return (rowObject.state != 1) ? "<i class='icon-nfa icon-traffic-graph' title='"+Ember.I18n.t("NFAWidget.trfc")+"'></i>" : ""; //NO I18N
}

function policyStatusDisttribution(cellValue, options, rowdata, action) {
    var criC = parseInt((rowdata[4] == null || rowdata[4] == 'null')?0:rowdata[4]);
    var majC = parseInt((rowdata[5] == null || rowdata[5] == 'null')?0:rowdata[5]);
    var minC = parseInt((rowdata[6] == null || rowdata[6] == 'null')?0:rowdata[6]);
    var comC = parseInt((rowdata[7] == null || rowdata[7] == 'null')?0:rowdata[7]);
    var totalC = criC + majC + minC + comC;
    var compPerc = 0;
    if(totalC == 0) {
        compPerc = 0;
    } else {
        compPerc = Math.round((comC / totalC) * 100);
    }
    return '<div nowrap="" style="float:left;white-space: nowrap;">'+//No I18N
                '<div style="float:left;padding-top:0px;background-color: #e4e2e5; width:100px;">' +//No I18N
                    '<div class="severity_5" style="width:'+compPerc+'px;height:20px;float:left;"> </div>' +//No I18N
                '</div><span nowrap="" style="float:left">&nbsp;'+compPerc+'% </span>'+//No I18N
            '</div>';//No I18N
}

function countFormatter(cellValue, options, rowdata, action) {
    var format = '<i class="icon-status1" title="'+ Ember.I18n.t("jsp.commonstr.Critical", this) +'" style="float:none !important"></i>'//No I18N
            + (( cellValue == null || cellValue == 'null')?"0":cellValue)
            + ' <i class="icon-status2" title="'+ Ember.I18n.t("jsp.commonstr.Major", this) +'" style="float:none !important"></i>'//No I18N
            + (( rowdata[5] == null || rowdata[5] == 'null')?"0":rowdata[5])
            + ' <i class="icon-status3" title="'+ Ember.I18n.t("jsp.commonstr.Warning", this) +'" style="float:none !important"></i>'//No I18N
            + (( rowdata[6] == null || rowdata[6] == 'null')?"0":rowdata[6])
            + ' <i class="icon-intfStatus1" title="'+ Ember.I18n.t("webclient.common.compliant", this) +'" style="float:none !important"></i>'//No I18N
            + (( rowdata[7] == null || rowdata[7] == 'null')?"0":rowdata[7]) ;
    return format;
}

function viocountFormatter(cellValue, options, rowdata, action) {
    var criC = (( cellValue == null || cellValue == 'null')?"0":cellValue);
    var majC = (( rowdata[5] == null || rowdata[5] == 'null')?"0":rowdata[5]);
    var warC = (( rowdata[6] == null || rowdata[6] == 'null')?"0":rowdata[6]);
    var format = "<div class='severityStatusCount' title='Critical - "+criC+", Major - "+majC+", Warning - "+warC+"'><span><i class='icon-status1'></i><i>"//No I18N
            + criC
            + "</i></span><span><i class='icon-status2'></i><i>"//No I18N
            + majC
            + "</i></span><span><i class='icon-status3'></i><i>"//No I18N
            + warC + "</i></span></div>";
    return format;
}

function compcountFormatter(cellValue, options, rowdata, action) {
    var cellValue = (( cellValue == null || cellValue == 'null')?"0":cellValue);
    var format = "<div class='severityStatusCount' title='Compliant - "+cellValue+"'><span><i class='icon-intfStatus1'></i><i>"//No I18N
            + cellValue +"</i></span></div>";
    return format;
}

function setToolAction(cellValue, options, rowdata, action){
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='opm_deleteTrapForwarder(&#39;"+escape(rowdata.Dest_Addr)+"&#39;,&#39;"+opm_escapeHTML(rowdata.Dest_Port)+"&#39;)'></i>"; //No I18n
}

function showRCAHealthMessage(cellValue, options, rowdata, action){
    return cellValue;
}

function sortDescription(cellValue, options, rowdata, action)
{
    cellValue = escapeHTML(cellValue);
    var cellText = ""+cellValue;
    if(cellText.length > 100) {
        cellText = cellText.substring(0, 100) + "&nbsp;..."; // No I18N
    }
    return '<span title="'+cellValue+'">'+ cellText +'</span>';// No I18N
}

function groupNameFomatter(cellValue, options, rowdata, action)
{
    if(cellValue != null && cellValue !="" && cellValue != undefined && cellValue != 'undefined') {
//      return '<img src="images/rule_group_ico.gif">&nbsp;<u>'+cellValue+'</u>'; // No I18N
        return escapeHTML(cellValue);

    } else {
        return Ember.I18n.t("jsp.commonstr.NA",this) //No I18N
    }
}

function advancedReportFormatter(cellValue, options, rowdata, action)
{
    if(cellValue == "NETWORK") {
        return Ember.I18n.t("jsp.report.Report.NetworkReports",this); //No I18N
    }
}

function ruleNameFomatter(cellValue, options, rowdata, action)
{
    return escapeHTML(cellValue);
}
function ruleNameFomatter1(cellValue, options, rowdata, action)
{
    var iUrl = "icon-status";// No I18N
    if(rowdata[3] == 'Major' || rowdata[3] == 'MAJOR'){ // No I18N
        iUrl = iUrl+"2";// No I18N
    }  else if(rowdata[3] == 'Critical' || rowdata[3] == 'CRITICAL'){ // No I18N
        iUrl = iUrl+"1";// No I18N
    } else {
        iUrl = iUrl+"3";// No I18N
    }
    if(rowdata[4] == true || rowdata[4] == 'true' || rowdata[4] == 'COMPLIANT' || rowdata[4] == 'Compliant'){
        return '<span style="color:#46bb7d"><i class="icon-status5"></i>&nbsp;'+escapeHTML(cellValue)+'</span>'; // No I18N
    }
    return '<i class="'+iUrl+'"></i>&nbsp;'+escapeHTML(cellValue); // No I18N
}
function ruleNameStatusFomatter(cellValue, options, rowdata, action)
{
    var iUrl = "icon-status";// No I18N
    var sev = rowdata[4] ;
    sev = sev.toUpperCase();
    if(sev == 'MAJOR'){ // No I18N
        iUrl = iUrl+"2";// No I18N
    }  else if(sev == 'CRITICAL'){ // No I18N
        iUrl = iUrl+"1";// No I18N
    } else {
        iUrl = iUrl+"3";// No I18N
    }
    if(rowdata.length > 9 && (rowdata[9] == true || rowdata[9] == 'true')) {
        return '<span style="color:#46bb7d"><i class="icon-status5"></i>&nbsp;'+escapeHTML(cellValue)+'</span>'; // No I18N
    }
    return '<span style="color:#fa5b5a"><i class="'+iUrl+'"></i>&nbsp;'+escapeHTML(cellValue)+'</span>'; // No I18N
}

function reviewStatusFormatter(cellValue, options, rowdata, action)
{
    var imgUrl = "/apiclient/fluidicv2/img/samples/icons/";//No I18N
    if(cellValue == 'PENDING'){ // No I18N
        imgUrl = imgUrl+"icon-thumbsup.png";//No I18N
    }  else if(cellValue == 'REVIEWED'){ //No I18N
        imgUrl = imgUrl+"icon-thumbsup-2.png";//No I18N
    }
    else
    {
        imgUrl = "/apiclient/fluidicv2/img/transparent.png";//No I18N
        return '<img src="'+imgUrl+'" title="'+cellValue+'"class="opmThumbsDown">&nbsp;'+cellValue;//No I18N
    }
    return '<img src="'+imgUrl+'" title="'+cellValue+'">&nbsp;'+cellValue;//No I18N
}

function DAllbackupHNFormatter(cellValue, options, rowdata, action)
{
    var iUrl = "";//No I18N
    if(rowdata[2] == 'SUCCESS'){ // No I18N
        iUrl = "icon-intfStatus1";//No I18N
    }  else{ // No I18N
        iUrl = "icon-status1";//No I18N
    }
        //location.href = window.OPM.apiclientUrl+'Settings/Discovery/Credentials/Backup/Edit'; //No I18N
    return '<a href="'+window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[6]+'"><i class="'+iUrl+'"></i>&nbsp;'+escapeHTML(cellValue)+'</a>'; // No I18N
}
function NCMSyslogRegexAction(cellValue, options, rowdata, action)
{
     return "<i onclick='deleteSyslogRegex(\""+rowdata.id+"\")' class='icon-trash delete' onclick style='font-size:16px; cursor:pointer;' data-title='Delete' title='"+Ember.I18n.t('webclient.admin.traps.delete',this)+"'></i>"; // No I18N
}
function deleteNCMSysObjectIdFormmatter(cellValue, options, rowdata, action)
{
    return "<i onclick='deleteNCMSysObjectId(\""+escapeHTML(rowdata[0])+"\")' class='icon-trash delete' onclick style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' title='"+Ember.I18n.t('webclient.common.deleteSysoid',this)+"'></i>"; // No I18N
}
function backupStatusFormatter(cellValue, options, rowdata, action)
{
    var iUrl = "";//No I18N
    if(rowdata[2] == 'SUCCESS'){ // No I18N
        iUrl = "icon-intfStatus1";//No I18N
    }  else{ // No I18N
        iUrl = "icon-status1";//No I18N
    }
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}

function templateResourceCountFormmatter(cellValue, options, rowdata, action)
{
    return cellValue == 0 ? cellValue: '<u style="cursor:pointer">' + cellValue + '</u>'; // No I18N
}

function DLastbackupHNFormatter(cellValue, options, rowdata, action)
{
    var iUrl = "";//No I18N
    if(rowdata[3] == 'SUCCESS'){ // No I18N
        iUrl = "icon-intfStatus1";//No I18N
    }  else{ // No I18N
        iUrl = "icon-status1";//No I18N
    }
    //return '<a href="'+window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[1]+'"><i class="'+iUrl+'"/>&nbsp;'+cellValue+'</a>'; // No I18N
    return '<i class="'+iUrl+'"></i>&nbsp;'+escapeHTML(cellValue); // No I18N
}

function DConflictHNFormatter(cellValue, options, rowdata, action)
{
    return '<a href="'+window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[0]+'">'+escapeHTML(cellValue)+'</a>'; // No I18N
}

function backupStatusFormatter1(cellValue, options, rowdata, action)
{
    var iUrl = "";//No I18N
    if(rowdata[3] == 'SUCCESS'){ // No I18N
        iUrl = "icon-intfStatus1";//No I18N
    }  else{ // No I18N
        iUrl = "icon-status1";//No I18N
    }
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}
function backupStatusFormatter2(cellValue, options, rowdata, action)
{
    var iUrl = "";//No I18N
    if(rowdata[9] == 'SUCCESS'){ // No I18N
        iUrl = "icon-intfStatus1";//No I18N
    }  else{ // No I18N
        iUrl = "icon-status1";//No I18N
    }
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}

function changeStatusFormatter(cellValue, options, rowdata, action)
{
    var iUrl = "/apiclient/fluidicv2/img/ncm/";//No I18N
    if(rowdata[7] == '0'){ // No I18N
        iUrl = iUrl+"authorized_change_ico.gif";//No I18N
    }  else{ // No I18N
        iUrl = iUrl+"unauthorized_change_ico.gif";//No I18N
    }
    return '<img src="'+iUrl+'"/>&nbsp;'+cellValue; // No I18N
}

function DChangeAllConfigTypeFormatter(cellValue, options, rowdata, action)
{
    if(rowdata[7] == '0'){ // No I18N
        return '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+Ember.I18n.t("widget.name.allConfigAuth",this)+'" class="opmThumbsUp">&nbsp;&nbsp;'+cellValue+'</img>'//No I18N
    }  else{ // No I18N
        return '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+Ember.I18n.t("widget.name.allConfigUnAuth",this)+'" class="opmThumbsDown">&nbsp;&nbsp;'+cellValue+'</img>'//No I18N
    }
}

function DChangeHostNameFormatter(cellValue, options, rowdata, action)
{
    var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+rowdata[0]; //No I18N
    return '<a href="'+url+'">&nbsp;&nbsp;'+escapeHTML(cellValue)+'</a>'//No I18N
}
function cmpStatusFormatter(cellValue, options, rowdata, action)
{
    var className = 'opmThumbsDown';//No I18N
    if(cellValue == 'Violation' || cellValue == 'VIOLATION' || cellValue == 'false' || cellValue == false){ // No I18N
        className = 'opmThumbsDown';//No I18N
    }  else if(cellValue == 'Compliant' || cellValue == 'COMPLIANT' || cellValue == 'true' || cellValue == true) { // No I18N
        className = 'opmThumbsUp';//No I18N
    } else {
        return "<i class=''> - </i>" ; //No I18N
    }
    return "<i class='"+className+"'></i>" ; //No I18N
}




function remediationTemplate(cellValue, options, rowdata, action)
{
    if(cellValue == '[NA]') { // No I18N
        return cellValue;
    } else {
        return escapeHTML(cellValue);
    }
}


function viewFormatter(cellValue, options, rowdata, action)
{
    var img = '<img src="/apiclient/fluidicv2/img/ncm/view_16x16.png">&nbsp;'; // No I18N
    return '<div title="Review Configuration"  align="center">'+ img + '</div>';// No I18N
}


function reviewFormatter(cellValue, options, rowdata, action)
{
    var img = '<img src="/apiclient/fluidicv2/img/ncm/review_16x16.png">&nbsp;'; // No I18N
    return '<div title="View Configuration" align="center">'+img +'</div>';// No I18N
}






function versionFormatter(cellValue, options, rowdata, action)
{
    return escapeHTML(cellValue);
}

function associateColumnrenderer(cellValue, options, rowdata, action) {
    return '<span><img class="inv_opr" src="/apiclient/fluidicv2/img/ncm/associate_device_ico.gif"></img>&nbsp;'+Ember.I18n.t("associate",this)+'</span>'; // No I18N
}

function markEOLFormatter(cellValue, options, rowdata, action) {
    var markEOL = Ember.I18n.t('ncm.report.MarkAsEOL',this); // No I18N
    if(cellValue == 'DATASENT') {
        markEOL = Ember.I18n.t('ncm.report.UnmarkEOL',this); // No I18N
    }
    return '<u><strong>'+ markEOL +'</strong></u>'; // No I18N
}



function criticalFormatter(cellValue, options, rowdata, action)
{

    var criCount = cellValue;
    var format = '<div align="center"><i class="icon-status1"></i>'+( (criCount == null || criCount == 'null')?"0":criCount) +'</div>';//No I18N
    return format;
}

function majorFormatter(cellValue, options, rowdata, action)
{
    var majorCount = cellValue;
    var format = '<div align="center"><i class="icon-status2"></i>'+( (majorCount == null || majorCount == 'null')?"0":majorCount) +'</div>';//No I18N
    return format;
}

function warningFormatter(cellValue, options, rowdata, action)
{
    var majorCount = cellValue;
    var format = '<div align="center"><i class="icon-status3"></i>'+( (majorCount == null || majorCount == 'null')?"0":majorCount) +'</div>';//No I18N
    return format;
}

function compliantFormatter(cellValue, options, rowdata, action)
{

//  <div class="FilterActions acknowledgeActions" id="AcknowledgeUpDown">
//    <div id="Acknowledge" class="acknowledgeDial acknowledge">
//        <b class='count'>0</b>
//        <div class='bar'><span style='width:0'></span></div>
//        <b class='text'>Acknowledge</b>
//    </div>
//    <div id='UnAcknowledge' class='acknowledgeDial unacknowledge'>
//        <b class='count'>0</b>
//        <div class='bar'><span style='width:0'></span></div>
//        <b class='text'>Unacknowledge</b>
//    </div>
//</div>


    return '<div class="acknowledgeActions"><i class="count" style="font-size:100%">'+( (cellValue == null || cellValue == 'null')?"0":cellValue)+'</i></div>';//No I18N
}

function formatNCMScheculeDate(cellValue, options, rowdata, action)
{
    if(cellValue == null || cellValue =="null") {
        return Ember.I18n.t("webclient.ncm.schedule.completed",this); // No I18N
    }

    var vals =(""+cellValue).split('.');
    if(vals.length < 2) {
        return cellValue;
    }
    var res = vals[0];
    for(var i = 1; i < vals.length-1; i++) {
        res+=("."+vals[i]);
    }
    return res;
}

function formatNCMDTDate(cellValue, options, rowdata, action)
{
    var vals =(""+cellValue).split(' ');
    if(vals.length < 2) {
        return cellValue;
    }
    return vals[0];
}

function formatDate(cellValue, options, rowdata, action)
{
    if(cellValue == null || cellValue == undefined || cellValue == 'null') {
        cellValue = '[' + Ember.I18n.t('webclient.ncm.eol.na',this) +  ']'; // No i18n
    }
    return cellValue;
}

function policyStatusFormatterNew(cellValue, options, rowdata, action)
{
    if(rowdata[9] == 'true' || rowdata[9] == true){ // No I18N
        cellValue = '<span style="color:#46bb7d"><i class="icon-status5"></i>'+Ember.I18n.t("webclient.common.compliant", this)+'</span>';
    } else if(rowdata[9] == 'false' || rowdata[9] == false) {
        cellValue = '<span style="color:#fa5b5a"><i class="icon-status1"></i>'+Ember.I18n.t("jsp.commonstr.Violation", this)+'</span>';
    } else {
        cellValue = "-";
    }
    return cellValue;
}

function policyStatusFormatter(cellValue, options, rowdata, action) {
    var imgClass = (rowdata[4] == 0 && rowdata[5] == 0 && rowdata[6] ==0) ? "opmThumbsUp" : "opmThumbsDown";//No I18N
    var titleText = imgClass == "opmThumbsUp" ? Ember.I18n.t("webclient.common.compliant", this) : Ember.I18n.t("jsp.commonstr.Violation", this); // No I18N
    return '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+titleText+'" class="'+imgClass+'">&nbsp;&nbsp;'+ (( cellValue == null || cellValue == 'null')?" - ":escapeHTML(cellValue));//No I18N
}

function ncmTerminalAuditFormatter(cellValue, options, rowdata, action)
{
	return escapeHTML(cellValue);
}
function ncmGridHandleXssFormatter(cellValue, options, rowdata, action)
{
	return escapeHTML(cellValue);
}
function nfaBillingShowDetailsFormatter(cellvalue, options, rowObject)
{
    return "<span class='textBlue'>"+Ember.I18n.t('webclient.fault.toolbar.view',this)+" "+Ember.I18n.t('webclient.map.sort.details',this)+"</span>";//No I18N
}

function FWAdeviceRuleStatusFormatter(cellValue, options, rowdata, action) {
    var errorString = '';
    var imgUrl = "icon-status5";//No I18N
    var title = Ember.I18n.t("ipsla.success",this); // No I18N
    if(cellValue != null && cellValue != '' && rowdata.STATUS < 0) {
         errorString = cellValue;
         title = Ember.I18n.t("webclient.map.flash.failed"); //No I18N
         imgUrl = "icon-status1";//No I18N
         return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i style="color: #0000FF;cursor: pointer;"  onclick="fwa_DeviceRuleCommandStatus('+rowdata.RESOURCEID+')">'+Ember.I18n.t("webclient.map.flash.failed")+'</i>'; //No I18N
    } else if(rowdata.STATUS == 0) {
        imgUrl = "/apiclient/fluidicv2/img/ajax-loader.gif";//No I18N
        title = 'Retrieving'; // No I18N
        return '<img src="'+imgUrl+'" title="'+title+'">&nbsp;</i><i style="color: #0000FF;cursor: pointer;"  onclick="fwa_DeviceRuleCommandStatus('+rowdata.RESOURCEID+')">'+Ember.I18n.t("webclient.fwa.device.rule.status.inprogress")+'</i>'; //No I18N
    } else if(rowdata.STATUS == 10) {
        title = 'Yet to Start'; // No I18N
        return '<em class="svgIcon size16 grey-color pull-left line-height-0 mr-sm"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#play"></use></svg></em><i>'+Ember.I18n.t("webclient.general.yettostart")+'</i>'; //No I18N
    }

    return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i style="color: #0000FF;cursor: pointer;" onclick="fwa_DeviceRuleCommandStatus('+rowdata.RESOURCEID+')">'+Ember.I18n.t("ipsla.success")+'</i>'; //No I18N
}

function FWAConfigAuditStatusFormatter(cellValue, options, rowdata, action) {
	var imgUrl = "icon-status5";//No I18N
	var title = Ember.I18n.t("ipsla.success",this); // No I18N
	if(rowdata.status == 0) {
		title = Ember.I18n.t("webclient.map.flash.failed"); //No I18N
		imgUrl = "icon-status1";//No I18N
		return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i style="color: #0000FF;cursor: pointer;"  onclick="fwa_ConfigBackupStatus(\''+rowdata.sch_id+'\',\''+rowdata.versionno+'\',\''+rowdata.captured_on+'\')">'+Ember.I18n.t("webclient.map.flash.failed")+'</i>'; //No I18N
	} else if(rowdata.status == 1) {
		return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i>'+Ember.I18n.t("ipsla.success"); //No I18N
	} else{
		return '-'; //No I18N
	}
}

function fwa_ConfigBackupStatus(sch_id,versionno,captured_on){
	var resId =$('#configdeviceList').val();
	$('#fwaConfigStatusSlide').show();
	$('#fwaConfigCompareSlide').hide();
	$('#fwaConfigCompareRuleDrillSlide').hide();
	slideIn(1);
	var data={};
	data.resId=resId;
	data.sch_id=sch_id;
	data.versionno=versionno;
//	data.captured_on=captured_on;
	var url = window.OPM.apiUrlPattern + '/fwacompliance/getConfigBackupStatus';//No I18N

	$.ajax({
        url: url,
        type: 'GET', //No I18N
        async: false,
        data:data,
        success: function(response)
        {
        	if(response.configExeTime != undefined && response.configExeTime != ""){// No I18N
        		OPMClient.SettingsFWConfigController.set("lastExecTime",response.configExeTime);// No I18N
        	}
        	if(response.errorString != undefined && response.errorString != ""){// No I18N
        		OPMClient.SettingsFWConfigController.set("errorString",response.errorString);// No I18N
        	}
        	var colNamesList = [Ember.I18n.t('jsp.deviceprop.ShowCommandAdd.Command',this),Ember.I18n.t('webclient.devices.ad.description',this),Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)]; //No I18N
			var colModelList = [
			                     { name: 'command', index: 'command'}, //No I18N
			                     { name: 'desc', index: 'desc'}, //No I18N
			                     { name: 'status', index: 'status',formatter:function(cellValue, options, rowdata, action){ //No I18N
			                    	 if(cellValue == "true"){// No I18N
			                    		 var imgUrl = "icon-status5";//No I18N
			                    		 var title = Ember.I18n.t("ipsla.success"); //No I18N
			                    		 return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i>'; //No I18N
			                    	 }else if(cellValue == "false"){// No I18N
			                    		 var imgUrl = "icon-status1";//No I18N
			                    		 var title = Ember.I18n.t("ipsla.failed"); //No I18N
			                    		 return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i>'; //No I18N
			                    	 }else if(cellValue == "progress"){// No I18N
			                    		 var imgUrl = "/apiclient/fluidicv2/img/ajax-loader.gif"; //No I18N
			                    		 var title=Ember.I18n.t("opstor.inventory.areca.volumeset.progress"); //No I18N
			                    		 return '<img src="'+imgUrl+'" title="'+title+'"></i>';// No I18N
			                    	 }else if(cellValue == "pending"){// No I18N
			                    		 return Ember.I18n.t("webclient.fwa.command.not.executed");// No I18N
			                    	 }
			                     }}
			                     ];
			 $("#fwa_ConfigCmdStatusList").jqGrid('GridUnload');//no i18n
			 opm_loadJQgridWithData("#fwa_ConfigCmdStatusList", response.completeConfigDetail, colNamesList, colModelList, '', "#fwa_ConfigCmdStatusPager", "",'') ; //No I18N
	 		 $('#fwa_ConfigCmdStatusList').jqGrid('setGridWidth', $("#configCommandStatus header").width());
        }
    });
}

function fwaScheduleStatusFormatter(cellValue, options, rowdata, action) {
    if(rowdata.Status === 3 || rowdata.Status === "3"){
    	if(window.isoperator || window.OPM.userPermissions.reportsWrite){
    		return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.FWScheduleListAction(\"setFWAScheduleStatus\",\""+rowdata.ScheduleName+"\",\""+rowdata.Status+"\")' checked name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.devices.intftypes.enabled',this);//NO I18N
    	}

    }else{
    	if(window.isoperator || window.OPM.userPermissions.reportsWrite){
    		return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.FWScheduleListAction(\"setFWAScheduleStatus\",\""+rowdata.ScheduleName+"\")' name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
    	}

    }
}

function fwaUserIPActions(cellValue, options, rowdata, action) {
    if(!rowdata.isDisabled){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_adDomainActions(\"disable\",\""+rowdata.ServerID+"\")' checked name=''><label></label></div>";//No I18N
    }else{
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_adDomainActions(\"enable\",\""+rowdata.ServerID+"\")' name=''><label></label></div>";//No I18N
    }
}

function fwa_adEditOptions(cellValue, options, rowdata, action) {
    if(!rowdata.isDisabled){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_adDomainActions(\"disable\",\""+rowdata.ServerID+"\")' checked name=''><label></label></div>";//No I18N
    }else{
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_adDomainActions(\"enable\",\""+rowdata.ServerID+"\")' name=''><label></label></div>";//No I18N
    }
}
function fwaIMportLogStatusFormatter(cellValue, options, rowdata, action) {
    if(rowdata.Status === 3 || rowdata.Status === "3"){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.FWScheduleListAction(\"setFWAScheduleStatus\",\""+rowdata.ScheduleName+"\",\""+rowdata.Status+"\")' checked name=''><label></label></div>";//No I18N
    }else{
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.FWScheduleListAction(\"setFWAScheduleStatus\",\""+rowdata.ScheduleName+"\")' name=''><label></label></div>";//No I18N
    }
}
function convertToKB(cellValue, options, rowdata, action)
{
    var noOfBytes = Math.round(cellValue / 1024);
    return noOfBytes;
}

function eolFormatter(cellValue, options, rowdata, action)
{
    if(cellValue == 'Live') {//No I18N
        return '<span title="EOL Status - ' + cellValue + '">'+Ember.I18n.t("webclient.ncm.eol.na",this)+'</span>';//No I18N
    }
    var imgUrl = "/apiclient/fluidicv2/img/ncm/license.png";//No I18N
    return '<img title="EOL Status - ' + cellValue + '" src="'+imgUrl+'"></img>';//No I18N
}

function configEditFormatter(cellValue, options, rowdata, action)
{
	if(OPMClient.InventoryNCMActionController.hidedraft) {
		return "";
	}
    return '<span style="float:left;" title="Edit As Draft" onclick="openEditDraftPage('+rowdata[0]+');" class="ui-icon ui-icon-pencil pointer"></span>';//No I18N
}

function configEditFormatterv2(cellValue, options, rowdata, action)
{
	if(OPMClient.InventoryNCMActionController.hidedraft) {
		return "";
	}
	if(rowdata.fileType!='Startup' && rowdata.fileType!='Running'){
	    return "";
	}
    return '<span style="float:left;" title="Edit As Draft" onclick="openEditDraftPage('+rowdata.id+');" class="ui-icon ui-icon-pencil pointer"></span>';//No I18N
}

function customReportEditFormatter(cellValue, options, rowdata, action)
{
    return "<span class='pointer ui-icon ui-icon-pencil' title='"+Ember.I18n.t('webclient.admin.probes.Edit',this)+"' style='float:left;margin-left:5px;'></span>"; //No I18N
}

function openEditDraftPage(versionId) {
    OPMClient.InventoryDeviceDetailsController.saveUploadObjectType="ConfigChange";//No I18N
    OPMClient.InventoryDeviceDetailsController.saveUploadObjectId=versionId;
    redirectSnapShot("NCMEditConfig"); //No I18N
}

function gridMenuPopFormatter(cellValue, options, rowdata, action)
{
    return imgUrl =  '<img  id="ActionIcon" title="Actions" onclick="showHideDiv(\'dropDownDivDE\',\'fast\', event)"; title="Actions" style="padding-right:2px;" src="images/menupopup.gif"></img>'; // No I18N
}

function uploadFormatter(cellValue, options, rowdata, action) {
    var imgUrl = "/apiclient/fluidicv2/img/ncm/icon_download.gif";//No I18N
    var txt = Ember.I18n.t("ncm.mid.Upload",this);//No I18N
    return '<span><img class="inv_opr" src="'+imgUrl+'"></img><text>' + txt +'</text></span>';//No I18N
}

function healthConfigFormatter(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status3";//No I18N
	var value = -1;
    var title = '';
    var text = Ember.I18n.t("webclient.ncm.eol.na",this); // No I18N
    if(cellValue == true || cellValue == 'true') {//No I18N
		value = 1;
        imgUrl = "icon-status1";//No I18N
        title = Ember.I18n.t("ncm.InventoryImageTr.startup_running_detected",this);//No I18N
        text = Ember.I18n.t("js.commonstr.InventoryModelConflictDetected",this); // No I18N
    } else if(cellValue == false || cellValue == 'false') {//No I18N
		value = 0;
        imgUrl = "icon-status5";//No I18N
        title = Ember.I18n.t("ncm.InventoryImageTr.startup_running_sync",this);//No I18N
        text = Ember.I18n.t("js.commonstr.InventoryModelInsync",this); // No I18N
    }
	return '<i data-value="' + value + '" class="'+imgUrl+'"></i>&nbsp;&nbsp;' + text;//No I18N
}


function healthComplianceFormatter(cellValue, options, rowdata, action) {
    var lowerCaseValue = (cellValue || "").toString().toLowerCase();
    var imgUrl = "icon-status3", text = "NA", titleText = Ember.I18n.t("jsp.commonstr.ComplianceData",this); //No I18N
    if(lowerCaseValue === 'compliant' || lowerCaseValue === 'not_required') {//No I18N
        imgUrl = "icon-status5";//No I18N
        text = Ember.I18n.t("js.commonstr.InventoryModelNotviolated",this); // No I18N
        titleText = Ember.I18n.t("js.commonstr.InventoryModelCompnotviolated",this); // No I18N
    } else if(lowerCaseValue === 'violation' || lowerCaseValue === 'attention') {//No I18N
        imgUrl = "icon-status1";//No I18N
        text = Ember.I18n.t("jsp.commonstr.Violation",this); // No I18N
        titleText = Ember.I18n.t("ncm.InventoryImageTr.Comp_Violation_detected",this);//No I18N
    }
    return '<i class="'+imgUrl+'" title="'+titleText+'"></i>&nbsp;&nbsp;' + text;//No I18N
}

function statusFormatter(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status2";//No I18N
    if(cellValue == undefined) {
        cellValue = 'INTERRUPTED';//No I18N
    }
    if(cellValue === 'SUCCESS' || cellValue === 'COMPLETED') {//No I18N
        imgUrl = "icon-status5";//No I18N
    } else  if(cellValue === 'FAILURE' || cellValue === 'INTERRUPTED') {//No I18N
        imgUrl = "icon-status1";//No I18N
    } else if(cellValue === 'INPROGRESS') { //No I18N
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;"+cellValue; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + cellValue;//No I18N
}

function formateScheduleCompletion(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status2";//No I18N

    if(rowdata[4] == 'Device Discovery') { //No I18N
    	return '<i class="icon-status5"></i>&nbsp;&nbsp;' + Ember.I18n.t('webclient.ncm.settings.schedule.audit.discoveryschedule.status', this);//No I18N
    }
    if(cellValue == undefined) {
        cellValue = 'INTERRUPTED';//No I18N
    }
    if(cellValue === 'SUCCESS' || cellValue === 'COMPLETED') {//No I18N
        return '<i class="icon-status5"></i>&nbsp;&nbsp;' + cellValue;//No I18N
    } else if(cellValue === 'INPROGRESS') { //No I18N
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;"+cellValue; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + cellValue;//No I18N
}

function deviceRestStatus(cellValue, options, rowdata, action) {
	var returnValue = cellValue;
	var restStatus = rowdata.REST_CRED_STATUS;
	var restDT = rowdata.REST_DT_ID;
	if(restStatus == undefined) {
		restStatus = $("#" + options.gid).getCell(options.rowId, 'REST_CRED_STATUS'); //No I18N
    }
    if(restDT == undefined) {
    	restDT = $("#" + options.gid).getCell(options.rowId, 'REST_DT_ID'); //No I18N
    }
	if(restDT != undefined && restDT != '') {
		var imgUrl = '&nbsp;<i class="icon-status-rest-api mr-xs heatmapStatus opmToolTipDesc" data-title="'+Ember.I18n.t("webclient.ncm.restapi.enabled.addcredentials.info",this)+'">';//No I18N
		if(restStatus != undefined && restStatus == 'true' || restStatus == true) {
			imgUrl = '&nbsp;<i class="icon-status-rest-api mr-xs active heatmapStatus opmToolTipDesc" data-title="'+Ember.I18n.t("webclient.ncm.restapi.enabled.info",this)+'">';//No I18N
		}
		returnValue = '<div class="flex flex-middle-align">' + returnValue + imgUrl + '<em class="svgIcon size16 "><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#rest-api"></use></svg></em></i></div>';//No I18N
	}
	return returnValue;
}

function deviceTemplateRestStatus(cellValue, options, rowdata, action) {
	var returnValue = cellValue;
	var restDT = rowdata.REST_DT_ID;
    if(restDT == undefined) {
    	restDT = $("#" + options.gid).getCell(options.rowId, 'REST_DT_ID'); //No I18N
    }
    var isDepricated = rowdata.IS_DEPRICATED;
	if(isDepricated) {
		returnValue = '<s>' + cellValue + '</s>';
	}
	if(restDT != undefined && restDT != '') {
		var imgUrl = '&nbsp;<i class="icon-status-rest-api mr-xs active">';//No I18N
		returnValue = '<div class="flex flex-middle-align heatmapStatus opmToolTipDesc" data-title="'+Ember.I18n.t("webclient.ncm.restapi.enabled.dt.info",this)+'">' + returnValue + imgUrl + '<em class="svgIcon size16 "><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#rest-api"></use></svg></em></i></div>';//No I18N
	}
	return returnValue;
}

function restDtName(cellValue, options, rowdata, action) {
	return '<div class="flex flex-middle-align">' + cellValue + '&nbsp;<i class="icon-status-rest-api mr-xs active"><em class="svgIcon size16 "><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#rest-api"></use></svg></em></i></div>';//No I18N
}

function lastoperStatusFormatter1(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status2";//No I18N
    var opStatus = rowdata.OPERATIONSTATUS;
    var opType = rowdata.OPERATIONTYPE;
    if(opStatus == undefined) {
    	opStatus = $("#" + options.gid).getCell(options.rowId, 'OPERATIONSTATUS'); //No I18N
    }
    if(opType == undefined) {
    	opType = $("#" + options.gid).getCell(options.rowId, 'OPERATIONTYPE'); //No I18N
    }
    if(opStatus === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
    } else  if((opStatus === 'FAILURE')||(opStatus === 'INTERRUPTED')) {//No I18N
        imgUrl = "icon-status1";//No I18N
        return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + opType;//No I18N
    } else if(opStatus === 'NOTSTARTED') { //No I18N
        imgUrl = "icon-status3";//No I18N
    } else {
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;"+opType; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + opType;//No I18N
}

function lastoperStatusFormatter(cellValue, options, rowdata, action)
{
    var vals =(""+cellValue).split('__');//No I18N
    var vals1 = cellValue;
    var vals0 = cellValue;
    if(vals.length >= 2) {
        vals1 = vals[1];
        vals0 = vals[0];
    }

    var imgUrl = "icon-status2";//No I18N
    if(vals1 === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
    } else  if((vals1 === 'FAILURE')||(vals1 === 'INTERRUPTED')) {//No I18N
        imgUrl = "icon-status1";//No I18N
        var selId = rowdata[0];
        return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + vals0;//No I18N
    } else if(vals1 === 'NOTSTARTED') { //No I18N
        imgUrl = "icon-status3";//No I18N
    } else {
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;"+vals0; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + vals0;//No I18N
}

function dGroupbackupStatusFormatter(cellValue, options, rowdata, action)
{
    if(rowdata.length >= 7) {
        var manageState = rowdata[6];
        if(manageState == false || manageState == 'false') {
            cred = "";
            return '<img title="'+ cred + '" src="'+imgUrl+'"></img>';//No I18N
        }
    }
    var imgUrl = "icon-status2";//No I18N
    if(cellValue === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
    } else  if((cellValue === 'FAILURE')||(cellValue === 'INTERRUPTED')) {//No I18N
        imgUrl = "icon-status1";//No I18N
    } else if(cellValue === 'NOTSTARTED') { //No I18N
        imgUrl = "icon-status3";//No I18N
    } else {
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />"; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>';
}

function ncm_backup_status(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status3";//No I18N
    var opStatus =  cellValue;
    var text = Ember.I18n.t("ipsla.success",this);//No I18N
    if(opStatus === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
        text = Ember.I18n.t("ipsla.success",this);//No I18N
    } else if(opStatus === 'FAILURE' || cellValue === 'INTERRUPTED' ) {//No I18N
        text = Ember.I18n.t("ncm.config.backup.failed",this);//No I18N
        imgUrl = "icon-status1";//No I18N
    } else if(opStatus === 'NOTSTARTED') { //No I18N
        text = Ember.I18n.t("opu.common.NOT_STARTED",this);//No I18N
        imgUrl = "icon-status3";//No I18N
    } else {
        text = Ember.I18n.t("opu.common.IN_PROGRESS",this);//No I18N
        return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;" + text; //No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + text;//No I18N
}

function ncm_compliance_status(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status3";//No I18N
    var cmptitle = Ember.I18n.t("jsp.commonstr.ComplianceData",this);//No I18N
    var text = cellValue;
    cellValue = cellValue.toUpperCase();
    if(cellValue === 'VIOLATION') {//No I18N
        imgUrl = "icon-status1";//No I18N
        cmptitle = Ember.I18n.t("ncm.InventoryImageTr.Comp_Violation_detected",this);//No I18N
        text = Ember.I18n.t("jsp.commonstr.Violation",this); // No I18N
    } else if(cellValue === 'COMPLIANT') {//No I18N
        imgUrl = "icon-status5";//No I18N
        cmptitle = Ember.I18n.t("dashboard.name.complaint",this);//No I18N
        text = Ember.I18n.t("dashboard.name.complaint",this); // No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + text;//No I18N
}
function ncm_managed_status(cellValue, options, rowdata, action)
{
    var imgUrl = "icon-status5";//No I18N
    var text = Ember.I18n.t("webclient.map.view.managed",this);//No I18N

    if(cellValue === 'false' || cellValue === false) {//No I18N
        imgUrl = "icon-status6";//No I18N
        text = Ember.I18n.t("webclient.map.view.unmanaged",this); // No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + text;//No I18N
}

function credentialFormatter1(cellValue, options, rowdata, action)
{
	var prot_name = rowdata.PROTOCOL_DISPLAYNAME;
    var validity = rowdata.VALIDITY;
    var managed = rowdata.MANAGED;
    var bckup_status = rowdata.BACKUP_STATUS;
    if(prot_name == undefined) {
    	prot_name = $("#" + options.gid).getCell(options.rowId, 'PROTOCOL_DISPLAYNAME'); //No I18N
    }
    if(validity == undefined) {
    	validity = $("#" + options.gid).getCell(options.rowId, 'VALIDITY'); //No I18N
    }
    if(managed == undefined) {
    	managed = $("#" + options.gid).getCell(options.rowId, 'MANAGED'); //No I18N
    }
    if(bckup_status == undefined) {
    	bckup_status = $("#" + options.gid).getCell(options.rowId, 'BACKUP_STATUS'); //No I18N
    }
    var cred = Ember.I18n.t("ncm.CredentialSupplied",this) + ' - ' +prot_name;//No I18N
    var imgUrl = "/apiclient/fluidicv2/img/ncm/ready_ico.gif";//No I18N
    if(validity == 'false' || validity == false) {//No I18N
        cred = Ember.I18n.t("ncm.InventoryImageTr.No_Credential",this);//No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/notready_ico.gif";//No I18N
    } else if(managed == true || managed == 'true') {
    	imgUrl = "/apiclient/fluidicv2/img/ncm/ready_ico.gif";//No I18N
    	var bckupimg = "icon-status2";//No I18N
    	var bckupStatusMsg = Ember.I18n.t("webclient.ncm.inventory.nobackup",this); //No I18N
        if(bckup_status == undefined) {
        	bckup_status = 'INTERRUPTED';//No I18N
        }
        if(bckup_status == 'SUCCESS' || bckup_status == 'COMPLETED') {//No I18N
        	bckupimg = "icon-status5";//No I18N
        	bckupStatusMsg = Ember.I18n.t("webclient.snapshot.name.Backup.Success",this); //No I18N
        } else  if(bckup_status == 'FAILURE' || bckup_status == 'INTERRUPTED') {//No I18N
        	bckupimg = "icon-status1";//No I18N
        	bckupStatusMsg = Ember.I18n.t("webclient.snapshot.name.Backup.Failure",this); //No I18N
        } else if(bckup_status == 'INPROGRESS') { //No I18N
            return '<img src="../fluidicv2/img/ncm/icon_csh_inprogress.gif" /> <img title="'+ cred + '" src="'+imgUrl+'" />'; //No I18N
        }
        return '<i title="' + bckupStatusMsg + '" class="'+bckupimg+'"></i><img title="'+ cred + '" src="'+imgUrl+'" style="margin-top:3px"/>';//No I18N
    }
    if(managed != undefined && (managed == false || managed == 'false')) {
        cred = "";
        imgUrl = "/apiclient/fluidicv2/img/ncm/icon_disable.gif";//No I18N
    }
    return '<img title="'+ cred + '" src="'+imgUrl+'"></img>';//No I18N
}

function credentialFormatter(cellValue, options, rowdata, action)
{
    var cred = Ember.I18n.t("ncm.CredentialSupplied",this) + ' - ' +rowdata[2];//No I18N
    var imgUrl = "/apiclient/fluidicv2/img/ncm/ready_ico.gif";//No I18N
    if(cellValue == 'false' || cellValue == false) {//No I18N
        cred = Ember.I18n.t("ncm.InventoryImageTr.No_Credential",this);//No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/notready_ico.gif";//No I18N
    }
    if(rowdata.length >= 18) {
        var manageState = rowdata[17];
        if(manageState == false || manageState == 'false') {
            cred = "";
            imgUrl = "/apiclient/fluidicv2/img/ncm/icon_disable.gif";//No I18N
        }
    }
    return '<img title="'+ cred + '" src="'+imgUrl+'"></img>';//No I18N
}

function ruleCountStatusFormatter(cellValue, options, rowdata, action) {

    var vioC = rowdata[4];
    var comC = rowdata[5];
    var notAvailC = rowdata[6];
    var format = '<div class="severityStatusCount" attr-violation="'+vioC+'" attr-comp="'+comC+'" title="Violation - '+vioC+', Compliant - '+comC+', Data Not Available - '+notAvailC+'">'+//No I18N
    '<span><i class="icon-status1"></i><i>'+vioC+'</i></span><span><i class="icon-intfStatus1"></i><i>'+comC+'</i></span><span><i class="icon-status3"></i><i>'+notAvailC+'</i></span></div>';//No I18N
    return format;
}


function rulestatusValFormatter(cellValue, options, rowdata, action) {

    if(cellValue == true || cellValue == "true") {
        return '<span style="color:#46bb7d"><i class="icon-status5"></i>'+Ember.I18n.t("webclient.common.compliant", this)+'</span>';
    } else if(cellValue == false || cellValue == "false") {
        return '<span style="color:#fa5b5a"><i class="icon-status1"></i>'+Ember.I18n.t("jsp.commonstr.Violation", this)+'</span>';
    } else {
        return cellValue;
    }
}

function formatOpAudit(cellValue, options, rowdata, action)
{
    var result = rowdata[3];
    var imgUrl = "icon-status2";//No I18N
    if(result === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
    } else {//No I18N
        imgUrl = "icon-status1";//No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + cellValue;//No I18N
}

function changeTypeFormatter(cellValue, options, rowdata, action)
{
    var approvedBy = Ember.I18n.t("jsp.approval.ApprovalRequestProperties.AppBy",this); // No I18N
    var by = Ember.I18n.t("webclient.general.notavailable",this); // No I18N
    var annotation = '';
    if(rowdata != null && rowdata.length >= 9) {
        by = rowdata[9];
        if(rowdata.length >= 12 && rowdata[12] != null && rowdata[12] != undefined) {
            annotation = rowdata[12];
        }
    }

    var imgUrl = '<span title="'+Ember.I18n.t("ncm.ReportPdfUtil.AuthorizedBy",this)+' - '+by+'\n'+annotation+'"><img style="vertical-align:middle;margin: -4px 5px 0 0;" src="/apiclient/fluidicv2/img/transparent.png" class="opmThumbsUp"></img> '+Ember.I18n.t("webclient.ncm.filter.authorized",this)+'</span>'; // No I18N
    if(cellValue === 1 || cellValue === '1') {
        imgUrl =  '<span title="'+Ember.I18n.t("ncm.ReportPdfUtil.UnauthorizedBy",this)+' - '+by+'\n'+annotation+'"><img style="vertical-align:middle;margin: -4px 5px 0 0;" src="/apiclient/fluidicv2/img/transparent.png" class="opmThumbsDown"></img> '+Ember.I18n.t("webclient.ncm.filter.unauthorized",this)+'</span>'; // No I18N
    }

    return imgUrl;
}
function WidchangeTypeFormatter(cellValue, options, rowdata, action)
{
    var imgUrl = '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+Ember.I18n.t("widget.name.allConfigAuth",this)+'" class="opmThumbsUp">&nbsp;&nbsp;'+Ember.I18n.t("widget.name.allConfigAuth",this)+'</img>'//No I18N
    if(cellValue === 1 || cellValue === '1') {
        imgUrl = '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+Ember.I18n.t("widget.name.allConfigUnAuth",this)+'" class="opmThumbsDown">&nbsp;&nbsp;'+Ember.I18n.t("widget.name.allConfigUnAuth",this)+'</img>'//No I18N
    }

    return imgUrl;
}

function WidchangeHostNameFormatter(cellValue, options, rowdata, action)
{
    //var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+rowdata.VersionId; //No I18N
    //return '<a href="'+url+'">'+cellValue+'</a>';
    return cellValue;

}
function WidCompVioHostNameFormatter(cellValue, options, rowdata, action)
{
    var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigResCompliance/'+rowdata.ResPolicyId; //No I18N
    return '<a href="'+url+'">'+cellValue+'</a>';
}
function WidResCompHostNameFormatter(cellValue, options, rowdata, action)
{
    var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigResCompliance/'+rowdata[0]; //No I18N
    return '<a href="'+url+'">'+cellValue+'</a>';
}
function WidBackupHostNameFormatter(cellValue, options, rowdata, action)
{
    //var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata.ResourceId; //No I18N
    //return '<a href="'+url+'">'+cellValue+'</a>';
    return cellValue;
}
function WidEOLHostNameFormatter(cellValue, options, rowdata, action)
{
    //var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata.ResourceId; //No I18N
    //return '<a href="'+url+'">'+cellValue+'</a>';
    return cellValue;
}

function DEOLHostNameFormatter(cellValue, options, rowdata, action)
{
    var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[0]; //No I18N
    return '<a href="'+url+'">'+escapeHTML(cellValue)+'</a>';
}

function DBRHostNameFormatter(cellValue, options, rowdata, action)
{
	if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected){
		return cellValue;
	}
    var url = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[0]; //No I18N
    return '<a href="'+url+'">'+escapeHTML(cellValue)+'</a>';
}

function fwaExcludeStatusFormatter(cellValue, options, rowdata, action) {
    if(cellValue == "true" || cellValue == true){
    	if(window.OPM.isAdministrator){
    		return "<div class='chkRoundBtn'><input type='checkbox' status onclick='OPMClient.Settings.FWEnableDisablecriteria(\""+options.rowId+"\",\""+options.gid+"\",\""+cellValue+"\")' checked name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.devices.intftypes.enabled',this);//NO I18N
    	}

    }else{
    	if(window.OPM.isAdministrator){
    		return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.FWEnableDisablecriteria(\""+options.rowId+"\",\""+options.gid+"\",\""+cellValue+"\")' name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
    	}
    }
}

function fwaAlertStatusFormatter(cellValue, options, rowdata, action) {
    if(cellValue == "true" || cellValue == true){
    	if(window.isoperator || window.OPM.userPermissions.fwaSettingsWrite){
    		return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_AvailableAlertAction(\"disable\",\""+rowdata.FAAID+"\")' checked name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.devices.intftypes.enabled',this);//NO I18N
    	}
    }else{
    	if(window.isoperator || window.OPM.userPermissions.fwaSettingsWrite){
    		return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwa_AvailableAlertAction(\"enable\",\""+rowdata.FAAID+"\")' name=''><label></label></div>";//No I18N
    	}else{
    		return Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
    	}
    }
}
function fwaCollAlertStatusFormatter(cellValue, options, rowdata, action) {
    if(cellValue == "true" || cellValue == true){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwaColl_AvailableAlertAction(\"disable\",\""+rowdata.FAAID+"\")' checked name=''><label></label></div>";//No I18N
    }else{
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='OPMClient.Settings.fwaColl_AvailableAlertAction(\"enable\",\""+rowdata.FAAID+"\")' name=''><label></label></div>";//No I18N
    }
}
function FWAvDomFormatter(cellValue, options, rowdata, action) {
    if(cellValue == '-') {
        return cellValue;
    }
    return "<span class='pointer' title='"+Ember.I18n.t('webclient.fwa.devicerule.action9',this)+"' onclick='OPMClient.Settings.showVirtualFirewalls("+rowdata.DDID+",\""+rowdata.VENDOR_TYPE+"\")' style='float:left;margin-left:5px;'>#"+cellValue+"</span>"; //No I18n
}

function discoveryStatusFormatter(cellValue, options, rowdata, action)
{
	var imgUrl = "icon-status2";//No I18N
	var status = ""; //No I18N
	var value = rowdata[6];
	if(value == undefined) {
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.interrupted');//No I18N
	}
	if(value === '1_SUCCESS') {//No I18N
		imgUrl = "icon-status5";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.success');//No I18N
	} else if(value === '1_SUCCESS_MANUALLY') {//No I18N
		imgUrl = "icon-status5";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.success.manually');//No I18N
	} else if(value === '2_DEVICE_ALREADY_EXISTS') {//No I18N
		imgUrl = "icon-status5";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.alreadyExists');//No I18N
	} else if(value === '4_FAILURE') {//No I18N
		imgUrl = "icon-status1";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.failure');//No I18N
	} else if(value === '4_SysOID_NOT_FOUND') {//No I18N
		imgUrl = "icon-status1";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.SysOID');//No I18N
	} else if(value === '5_INTERRUPTED') {//No I18N
		imgUrl = "icon-status1";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.interrupted');//No I18N
	} else if(value === '6_UNKNOWN') {//No I18N
		imgUrl = "icon-status1";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.unknown');//No I18N
	} else if(value === '7_MULTIPLE_IP') {//No I18N
		imgUrl = "icon-status1";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.multipleIPs');//No I18N
	} else if(value === '0_YET_TO_ADD') {//No I18N
		imgUrl = "icon-status3";//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.yetToAdd');//No I18N
	} else if(value === '3_YET_TO_DISCOVER') {//No I18N
		status = Ember.I18n.t('webclient.ncm.discovery.report.status.yetToDiscover');//No I18N
		return "<img src='../fluidicv2/img/ncm/icon_csh_inprogress.gif' />&nbsp;&nbsp;"+status; //No I18N
	}
	return '<i class="'+imgUrl+'"></i><div style="text-align:justify;margin-left:22px;">' + status +'</div>';//No I18N
}

function progressFormatter(cellValue, options, rowdata, action)
{
	var total = Number(rowdata[5]) || 0;
	var processed = Number(rowdata[6]) || 0;
	var status = 0;
	if(total > 0 && processed > 0) {
		status = (processed * 100)/total;
	}
	if(isNaN(status)) {
		status = 0;
	}
	return "<div class='progressBarNCM'><div><i style='width:"+Math.floor(status)+"%'></i></div><b>"+Math.floor(status)+"%</b></div>"
}

function FWADevRuleChangeMgmtFormatter(cellValue, options, rowdata, action) {
    var val = '';
    var actionsDiv = "";
    if(OPMClient.ApplicationController.currentPath == "Settings.FirewallConfig.FWA.DeviceRule.VDom"){
    	var deviceType = OPMClient.SettingsFWConfigController.vendorType;
    }else{
        var deviceType = rowdata.VENDOR_TYPE;
    }
//	var isCheckpointAutoFetch = (deviceType == 'Check Point' && window.OPM.haswinscpLocation == true); //No I18N
    var crdStatus = rowdata.STATUS >= 0;
	var showBrowse = !( rowdata.MODE == 1 || rowdata.MODE == 2 || rowdata.MODE==4 || rowdata.MODE==100);
    if((rowdata.STATUS != null && rowdata.STATUS < 0) || rowdata.mode == 4 ){
        return "-";//No I18N
    }else{
        if(!showBrowse) {
        	if((window.isoperator || window.OPM.userPermissions.fwaComplianceWrite)){
        		 if(rowdata.STATUS != null && rowdata.STATUS >=0 && (rowdata.GEN_CONF_MGMT_RPT == true || rowdata.GEN_CONF_MGMT_RPT == "true")) {
                     val ="<span class='pointer ui-icon ui-icon-refresh' title='"+Ember.I18n.t('webclient.fwa.devicerule.action8',this)+"' onclick='OPMClient.Settings.showChangeMgmt("+rowdata.RESOURCEID+",\"fetch\");' style='float:left;margin-left:-3px'></span> | "; //No I18n
                 }
        	}
            if(cellValue== undefined || cellValue == '-') {
                val = val + "-";
            } else {
                val = val + "<span class='pointer' title='"+Ember.I18n.t('webclient.fwa.devicerule.action10',this)+"' onclick='OPMClient.Settings.showChangeMgmt("+rowdata.RESOURCEID+", \"latest\");' style='margin-left:5px;'>"+cellValue+"</span>"
            }
        }else{
            val = "-";//No I18N
        }
        return val;
    }
}
function FWADevRuleCompMgmtFormatter(cellValue, options, rowdata, action) {
    var val = '';
    var actionsDiv = "";
    if(OPMClient.ApplicationController.currentPath == "Settings.FirewallConfig.FWA.DeviceRule.VDom"){
        var deviceType = OPMClient.SettingsFWConfigController.vendorType;
    }else{
        var deviceType = rowdata.VENDOR_TYPE;
    }
    var isCheckpointAutoFetch = (deviceType == 'Check Point' && window.OPM.haswinscpLocation == true); //No I18N
    var isSuppVendApi = ((deviceType == 'Cisco Meraki' || deviceType == 'Check Point' || deviceType == "FortiGate" || deviceType == "Paloalto" || deviceType == "Sophos XG" || deviceType == "Firepower" || deviceType == "SonicWall" || deviceType == "Sophos" || deviceType == "WatchGuard Firewall") && rowdata.MODE==100); //No I18N
    var crdStatus = rowdata.STATUS >= 0;
    var showBrowse = !( rowdata.MODE == 1 || rowdata.MODE == 2 || rowdata.MODE==4 );
    if((rowdata.STATUS != null && rowdata.STATUS < 0) || rowdata.mode == 4 || rowdata.STATUS == 10){
        return "-";//No I18N
    }else{
        if((window.isoperator || window.OPM.userPermissions.fwaComplianceWrite)){
            if((deviceType == 'Cisco Meraki' || deviceType == 'Cisco Router' || deviceType == "Paloalto" || deviceType == "Sophos XG" || deviceType == "Cisco" || deviceType == "Firepower" || deviceType == "SonicWall" || deviceType == "Check Point" || deviceType == "FortiGate" || deviceType == "Sophos" || deviceType == "WatchGuard Firewall" || deviceType == "Netscreen Native" || deviceType == "HUAWEI") && rowdata.STATUS != null && rowdata.STATUS >=0 && (rowdata.GEN_COMP_RPT == true || rowdata.GEN_COMP_RPT == "true")) {
                if(showBrowse) {
                    if(isSuppVendApi)
                    {
                        val = "<span class='pointer ui-icon ui-icon-refresh' title='"+Ember.I18n.t('webclient.fwa.devicerule.action7',this)+"' onclick='OPMClient.Settings.genComplianceReport("+rowdata.RESOURCEID+",undefined,100, "+isSuppVendApi+",\""+rowdata.DISPLAYNAME+"\");' style='float:left;margin-left:5px;'></span> | "; //No I18n
                    }
                } else {
                    val = "<span class='pointer ui-icon ui-icon-refresh' title='"+Ember.I18n.t('webclient.fwa.devicerule.action7',this)+"'  onclick='OPMClient.Settings.genComplianceReport("+rowdata.RESOURCEID+","+rowdata.GEN_CONF_MGMT_RPT+","+rowdata.MODE+",undefined,\""+rowdata.DISPLAYNAME+"\");' style='float:left;margin-left:5px;'></span> | "; //No I18n
                }
            }
        }
        if(cellValue== undefined || cellValue == '-') {
            val = val + "-";
        } else {
            val = val + "<span class='pointer' title='"+Ember.I18n.t('webclient.fwa.devicerule.action11',this)+"' onclick='OPMClient.Settings.showComplianceReport("+rowdata.RESOURCEID+",\""+rowdata.DISPLAYNAME+"\");'>"+cellValue+"</span>"
        }
        return val;
    }

}

function FWAvDomChangeMgmtFormatter(cellValue, options, rowdata, action) {
    var val = '';
    var actionsDiv = "";
    var deviceType = rowdata.VENDOR_TYPE;
    var isCheckpointAutoFetch = (deviceType == 'Check Point' && window.OPM.haswinscpLocation == true); //No I18N
    var crdStatus = rowdata.STATUS >= 0;
    var showBrowse = !( rowdata.MODE == 1 || rowdata.MODE == 2 || rowdata.MODE==4 );

        if(!showBrowse) {
        	if((window.isoperator || window.OPM.userPermissions.fwaComplianceWrite)){
        		if(rowdata.STATUS != null && rowdata.STATUS >=0 && (rowdata.GEN_CONF_MGMT_RPT == true || rowdata.GEN_CONF_MGMT_RPT == "true")) {
                    val ="<span class='pointer ui-icon ui-icon-refresh' title='"+Ember.I18n.t('webclient.fwa.devicerule.action8',this)+"' onclick='OPMClient.Settings.showChangeMgmt("+rowdata.RESOURCEID+",\"fetch\");' style='float:left;margin-left:5px;'></span> | "; //No I18n
                }
        	}
            if(cellValue== undefined || cellValue == '-') {
                val = val + "-";
            } else {
                val = val + "<span class='pointer' title='"+Ember.I18n.t('webclient.fwa.devicerule.action10',this)+"' onclick='OPMClient.Settings.showChangeMgmt("+rowdata.RESOURCEID+", \"latest\");' style='margin-left:5px;'>"+cellValue+"</span>"
            }
        }else{
            val = "-";//No I18N
        }
        return val;

}

function FWvDomQucikActions(cellValue, options, rowdata, action)
{

    var actionsDiv = "<span class='pointer ui-icon ui-icon-trash' title='"+Ember.I18n.t('webclient.fwa.devicerule.action12',this)+"' onclick='OPMClient.Settings.deleteVDOM(\""+rowdata.RESOURCEID+"\",\""+rowdata.isProfileBased+"\")' style='float:left;margin-left:5px;'></span>"; //No I18n

    return actionsDiv;
}
function severityColorBar(cellValue, options, rowdata, action)
{
    var status = parseInt(rowdata.statusNum) || 0;
    if(rowdata.statusNum === undefined)
    {
        status = parseInt(rowdata.status) || 0;
    }
    if(window.OPM.isNewStatusPropagation && rowdata.state !== undefined) {
        var availClass = opm_getStateCls(rowdata.state);
        return "<em class='--fault-severity icon-status --dual-status status-" + status + " " + availClass + "'></em>";//No I18N
    }
    var str = "<i class='--fault-severity severity_"+status+" statusColor'></i>";//No I18N
    return str;
}

function ncmBkupStatusColorBar(cellValue, options, rowdata, action)
{
    return "<i class='backup_"+cellValue+" statusColor'></i>";//No I18N
}

function ncmLastOperationStatusColorBar(cellValue, options, rowdata, action)
{
    return "<i class='backup_"+rowdata.status+" statusColor'></i>";//No I18N
}

function configletTypeFormatter(cellValue, options, rowdata, action)
{
    var returnValue = Ember.I18n.t("ncm.configlet.type.advancedscriptmode",this);//No I18N
    if(cellValue == 'TFTP_FILE_TRANSFER_MODE') {
        returnValue = Ember.I18n.t("ncm.configlet.type.ftpMode",this);//No I18N
    } else if(cellValue == 'COMMAND_LINE_MODE') { //No I18N
        returnValue = Ember.I18n.t("ncm.configlet.type.scriptmode",this);//No I18N
    } else if(cellValue == 'PROG_CONFIGLET_MODE') { //No I18N
        returnValue = Ember.I18n.t("ncm.configlet.type.progmode",this);//No I18N
    }
    return returnValue;
}

function invenotoryeolFormatter(cellValue, options, rowdata, action)
{
    var cred = Ember.I18n.t("ncm.CredentialSupplied",this);//No I18N
    var imgUrl = "/apiclient/fluidicv2/img/ncm/ready_ico.gif";//No I18N
    if(rowdata[1] == 'false' || rowdata[1] == false) {//No I18N
        cred = Ember.I18n.t("ncm.InventoryImageTr.No_Credential",this) + ' - ' +rowdata[2];//No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/notready_ico.gif";//No I18N
    }
    if(rowdata.length >= 15) {
        var manageState = rowdata[14];
        if(manageState == false || manageState == 'false') {
            cred = "";
            imgUrl = "/apiclient/fluidicv2/img/ncm/icon_disable.gif";//No I18N
        }
    }
    var str = '<img title="'+ cred + '" src="'+imgUrl+'" style="vertical-align:middle;margin: -4px 5px 0 0;"></img>';//No I18N

    if(cellValue == 'Live') {//No I18N
        return str + '<span title="EOL Status - ' + cellValue + '">'+Ember.I18n.t("webclient.ncm.eol.na",this)+'</span>';//No I18N
    }
    var imgUrl = "/apiclient/fluidicv2/img/ncm/license.png";//No I18N

    return str + '<img title="EOL Status - ' + cellValue + '" src="'+imgUrl+'" style="vertical-align:middle;margin: -4px 5px 0 0;"></img>';//No I18N
}

function alarmsEventsTimeAgo(cellValue, options, rowdata, action)
{
    var returnText = "<div class='time'><i>on "+rowdata.time+"</i><b class='timeago' title='"+rowdata.time+"'>"+rowdata.prettyTime+"</b></div>"; //No I18N
    return returnText; //No I18N

}
function deleteColumnrenderer(cellValue, options, rowdata, action) {
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete''></i>";//No I18n
}
function msssqlDeleteColumnrenderer(cellValue, options, rowdata, action) {
    var returnText =  "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t("webclient.action.delete",this)+"'></i>";//No I18n
    return returnText;
}
function setAsInterfaceImgLink(cellValue, options, rowdata, action)
{
    return "<img src='" + rowdata.imagePath + "' />"; //No I18N
}
function severityColorIcon(cellValue, options, rowdata, action)
{
    var _status = parseInt(rowdata.statusNum) || 0;
    if(window.OPM.isNewStatusPropagation && rowdata.state !== undefined && !isNaN(parseInt(rowdata.state))) {
        var availClass = opm_getStateCls(rowdata.state);
        return "<em class='--fault-severity icon-status --dual-status status-" + _status + " " + availClass + "'></em> " + escapeHTML(rowdata.statusStr);//No I18N
    }
    return "<i class='--fault-severity icon-status"+ _status +"'></i> "+escapeHTML(rowdata.statusStr) ;//No I18N
}

function severityColorIconSnakeCase(cellValue, options, rowdata, action)
{
    var availabilityState = parseInt(rowdata.availabilityState);
    if (window.OPM.isNewStatusPropagation && rowdata.availabilityState != null && rowdata.availabilityState !== "" && !isNaN(availabilityState)) {
        var availClass = opm_getStateCls(availabilityState);
        return "<em class='--fault-severity icon-status --dual-status status-" + rowdata.status_num + " " + availClass + "'></em> " + escapeHTML(rowdata.status_str);//No I18N
    }
    return "<i class='--fault-severity icon-status"+rowdata.status_num+"'></i> "+escapeHTML(rowdata.status_str) ;//No I18N
}
function merakideviceseverityColorIcon(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.deviceStatusNum+"'></i> "+escapeHTML(rowdata.deviceStatus) ;//No I18N
}

function IPRequestSeverityColorIcon(cellValue, options, rowdata, action)
{
    var classColor = "iconStatusRed";//No I18N
    var val =rowdata["status"];//No I18N
    if(val === "Pending"){
      return "<em class='svgIcon size15 waiting-color mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#" +  "warning-round" + "'></use></svg></em>" + cellValue;
    }else if(val === "Approved"){//NO I18N
    // return "<em class='svgIcon size14 success-color mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#" +  "tick-circle" + "'></use></svg></em>" + cellValue;
       return "<em class='svgIcon size15 success-color mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#" + "icon_policy_accept" + "'></use></svg></em>" + cellValue;
    }
    return "<em class='svgIcon size15 failed-color mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#" +  "close-circle" + "'></use></svg></em>" + cellValue;
}
function sevIcon(cellValue, options, rowdata, action)
{
        return "<i class='--fault-severity icon-status"+rowdata[4]+"'></i>";//No I18N
}
function severityColorIconWithoutText(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.statusNum)+"' title='"+opm_escapeHTML(rowdata.statusStr)+"'></i>";//No I18N
}
function severityIcon(cellValue, options, rowdata, action)
{
    var _status = parseInt(rowdata.statusNum) || 0;
    if(window.OPM.isNewStatusPropagation && rowdata.state !== undefined && !isNaN(parseInt(rowdata.state))) {    
        var availClass = opm_getStateCls(rowdata.state);
        return "<em class='--fault-severity icon-status --dual-status status-" + _status + " " + availClass + "'></em>";//No I18N
    }
    return "<i class='--fault-severity icon-status"+ _status +"'></i>";//No I18N
}
function severityIntfGrpIcon(cellValue, options, rowdata, action)
{
	return "<i class='icon-status"+rowdata.statusNum+"'></i>"+cellValue;//No I18N
}

function oldvCenterSeverityIcon(cellValue, options, rowdata, action)
{
    if(rowdata.MO_STATUS === undefined || rowdata.MO_STATUS === "0"){//No I18n
        rowdata.MO_STATUS = 7;
    }
    return "<i class='icon-status"+rowdata.MO_STATUS+"'></i>";//No I18N
}
function oldESXSeverityIcon(cellValue, options, rowdata, action)
{
    if(rowdata.PREVIOUSSEVERITY === undefined || rowdata.PREVIOUSSEVERITY === 0){
        rowdata.PREVIOUSSEVERITY = 7;
    }
    return "<i class='icon-status"+rowdata.PREVIOUSSEVERITY+"'></i>";//No I18N
}
function severityMSg(cellValue, options, rowdata, action)
{
    return rowdata.statusStr;
}
function setStatusAsImgLink(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+opm_escapeHTML(cellValue)+"'></i>";//No I18N
}
function setSDNEntityWithStatus(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> "+rowdata.entity;//No I18N
}
function setSDNSpineNameWithStatus(cellValue, options, rowdata, action)
{
    if(rowdata.fabricMOName !== undefined) {
        return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> <a onclick='redirectToDeviceSnapshot(\""+rowdata.fabricMOName+"\")' class='textBlue'>"+escapeHTML(rowdata.displayName)+"</a>";//No I18N
    }
    else if(rowdata.apicMOName !== undefined){
        return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> <a onclick='redirectToDeviceSnapshot(\""+rowdata.apicMOName+"\")' class='textBlue'>"+escapeHTML(rowdata.displayName)+"</a>";//No I18N
    }
}
function sdnHealthScoreGraph(cellValue, options, rowdata, action)
{
    //return "<i class='icon-u1F53E-1' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('widget.header.healthscore',this)+"' onclick='opm_ACIInfraHealthDetails()'></i>";
    return "<i class='icon-u1F53E-1' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('widget.header.healthscore',this)+"' onclick='redirectToSnapPerfGraph(\""+OPMClient.InventoryDeviceDetailsController.deviceName+"\",\""+"packetLoss"+"\")'></i>";
    ; //No I18N
}

function opm_ACIInfraHealthDetails()
{
    opmGlobalRoute.transitionTo('Inventory.Device.FabricHealthDetails'); //No I18N
}

function opm_showInfraHealthStatus(cellValue, options, rowdata, action)
{
     return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.status)+"'></i> "+opm_escapeHTML(rowdata.entity);//No I18N
}

function opm_EPGStatus(cellValue, options, rowdata, action)
{
    if(rowdata.status !== undefined || rowdata.status !== null)
    {
        return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> "+rowdata.statusStr;//No I18N
    }
    else
    {
        return rowdata.statusStr;
    }
}

function opm_TenantStatus(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> "+escapeHTML(rowdata.dispName); //No I18N
}

function opm_EPGMonitorStatus(cellValue,options,rowdata,action)
{
	  if(window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.discoveryWrite)
		{
				if(rowdata.monitor === "Start"){
					return "<div class='clearfix'><i onclick = 'updateEPGMonitoring(\""+rowdata.epgMemId+"\",\""+"start"+"\",this)' title = '"+Ember.I18n.t('webclient.nwm.startmonitoring',this)+"' class='icon-status15 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.false')+"</span></div>"; //No I18N
				}else{
					return "<div class='clearfix'><i onclick = 'updateEPGMonitoring(\""+rowdata.epgMemId+"\",\""+"stop"+"\",this)' title = '"+Ember.I18n.t('webclient.virtual.stopmonitoring',this)+"' class='icon-status16 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.true')+"</span></div>"; //No I18N
				}
		}else{
			return "";
		}
}

function updateEPGMonitoring(epgMemberID,action)
{
    var url = window.OPM.apiUrlPattern + '/v2/device/updateEPGMonitoring'; //No I18N
    var data = {"epgMemberIDs":epgMemberID,"action":action}; //No I18n
    var response = opm_ajaxPostRequest(url,data);
    if(response !== undefined && !$.isEmptyObject(response))
    {
        if(response.result !== undefined)
        {
            opm_infoMsgs("successMsg",response.result.message); //No I18n
        }
        else if(response.error !== undefined)
        {
            opm_infoMsgs("errorMsg",response.error.message); //No I18n
        }
    }
}

function opm_goToSnapshotPage(cellValue, options, rowdata, action)
{
    if(rowdata.moName !== undefined)
    {
        return "<a href='javascript:redirectToSnapshot(\"MonitoringDevice\", \""+rowdata.moName+"\");'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
    else if(rowdata.tenantMOName !== undefined)
    {
        return "<a href='javascript:redirectToSnapshot(\"MonitoringTenant\", \""+rowdata.tenantMOName+"\");'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
}

function opm_RedirectEPGSnapPage(cellValue, options, rowdata, action)
{
    if(!window.OPM.isCustomer && rowdata.moName !== undefined && rowdata.monitor === "Stop")
    {
        return "<i class='textBlue' onClick='javascript:redirectToDeviceSnapshot(\""+rowdata.moName+"\")'>"+escapeHTML(cellValue)+"</i>"; //No I18N
    }
    else
    {
        return escapeHTML(cellValue);
    }
}

function alarmsWithDetailsGrid1(cellValue, options, rowdata, action)
{
    var returnText;
    if(rowdata.eventtype !== 'FWA_Normal' && rowdata.eventtype !== 'FWA_Anomaly' && rowdata.eventtype !== 'FWA_Bandwidth' && rowdata.category !== "Normal Alert" && rowdata.category !== "Anomaly Alert" && fwaRuleMgmtAlarmEvents.indexOf(rowdata.eventtype) <= -1) {//No I18N
        var ack = "inline";//No I18N
        var isack = true;
        var titleStr = Ember.I18n.t('webclient.fault.toolbar.acknowledge'); //No I18N
        if (rowdata.who !== 'Unacknowledge') { //No I18N
            ack = "active inline"; //No I18N
            isack = false;
            titleStr = Ember.I18n.t('webclient.fault.toolbar.tooltip.unacknowledge');//No I18N
        }
            returnText = "<div class='time'><i>on "+rowdata.modTime+"</i><b class='timeago' title='"+rowdata.modTime+"'>"+rowdata.prettyTime+"</b></div><div class='Options'>";//No I18N
            if(OPMClient.AlarmDetailsController.isWebAlarm)
            {
                if(rowdata.mute)
                {
                    returnText +="<i class='opmWebAlarmUnMute OpMToolTip' data-title='Unmute'></i>";//No I18N
                }else{
                    returnText +="<i class='opmWebAlarmMute OpMToolTip' data-title='Mute'></i>";//No I18N
                }
            }
            if((window.OPM.userPermissions.alarmsRead || window.OPM.userPermissions.operatorAccess) && !window.OPM.userPermissions.intfGroupRestricted) {
                returnText += "<i role='button' tabindex='0' class='icon-thumbs-up acknowledge OpMToolTip "+ack+"' data-title='"+titleStr+"' onclick='opm_acknowledgeFromRow(\""+rowdata.alarmId+"\","+isack+")'" + ((isack && OPMClient.AlarmActionsController.addNotesOnAck) ? "data-content=''" : "")+ "></i></div>"; //No I18N
            }
    }else {
        returnText = "<div class='time'><i>on "+rowdata.modTime+"</i><b class='timeago' title='"+rowdata.modTime+"'>"+rowdata.prettyTime+"</b></div>"; //No I18N
    }
    return returnText; //No I18N
}
function alarmsWithColoredGrid(cellvalue, options, rowdata, action)
{
    if(rowdata.eventtype !== 'FWA_Normal' && rowdata.eventtype !== 'FWA_Anomaly' && rowdata.eventtype !== 'FWA_Bandwidth' && rowdata.category !== "Normal Alert" && rowdata.category !== "Anomaly Alert" && fwaRuleMgmtAlarmEvents.indexOf(rowdata.eventtype) <= -1) {//No I18N
        var ack = "inline";//No I18N
        var isack = true;
        var titleStr = Ember.I18n.t('webclient.fault.toolbar.acknowledge'); //No I18N
        if (rowdata.who !== 'Unacknowledge') { //No I18N
            ack = "active inline"; //No I18N
            isack = false;
            titleStr = Ember.I18n.t('webclient.fault.toolbar.tooltip.unacknowledge');//No I18N
        }
            returnText = "<div class='Options'>";//No I18N
            if(OPMClient.AlarmDetailsController.isWebAlarm)
            {
                if(rowdata.mute)
                {
                    returnText +="<i class='opmWebAlarmUnMute OpMToolTip' data-title='Unmute'></i>";//No I18N
                }else{
                    returnText +="<i class='opmWebAlarmMute OpMToolTip' data-title='Mute'></i>";//No I18N
                }
            }
            if(!window.OPM.userPermissions.intfGroupRestricted) {
            returnText += "<i role='button' tabindex='0' class='icon-thumbs-up acknowledge OpMToolTip "+ack+"' data-title='"+titleStr+"' onclick='opm_acknowledgeFromRow(\""+rowdata.alarmId+"\","+isack+")';></i></div>"; //No I18N
            }
    }
    return returnText;
}
function opm_compactViewOfAlarm(cellValue, options, rowdata, action)
{
    if (rowdata.ownerName == 'Unacknowledge') //No I18N
    {
        returnText = Ember.I18n.t('webclient.admin.customgraphs.association.unassigned',this); //No I18N
    }
    else
    {
        returnText = escapeHTML(rowdata.who);
    }
    return returnText; //No I18N
}
function interfaceText(cellValue, options, rowdata, action)
{
    return Ember.I18n.t('webclient.devices.details.intf',this)+" : "+rowdata.interfaceCount;//No I18N
}
function cpuText(cellValue, options, rowdata, action)
{
    //return "CPU : "+rowdata.CPU+"%";//No I18N
    if(rowdata.CPUValue === "-")
    {
        return Ember.I18n.t('webclient.map.server.CPU',this)+" : "+Ember.I18n.t('webclient.ncm.eol.na',this);// NO I18N
    }
    else
    {
        return Ember.I18n.t('webclient.map.server.CPU',this)+" : "+rowdata.CPUValue+"%";// NO I18N
    }
}
function memoryText(cellValue, options, rowdata, action)
{
    //return "Memory : "+rowdata.Memory+"%";//No I18N
    if(rowdata.MEMValue === "-")
    {
        return Ember.I18n.t('webclient.map.server.Memory',this)+" : "+Ember.I18n.t('webclient.ncm.eol.na',this);// NO I18N
    }
    else
    {
        return Ember.I18n.t('webclient.map.server.Memory',this)+" : "+rowdata.MEMValue+"%";
    }
}

function severityIconVM(cellValue, options, rowdata, action)
{
    var returnTxt = "<i class='icon-status"+rowdata.CONNECT_STATUS+"'></i> ";
    return returnTxt;
}
function alarmEscalationDelete(cellValue, options, rowdata, action){
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='deleteEscalationRule(&#39;"+rowdata.ruleName+"&#39;);'></i>";//No I18n
}
function editServiceMonitors(monName,eName,name,port,thresh,timeOutSec,autoDisc,downSeverity)
{
    OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + name; //No I18N
    OPMClient.SettingsAddEditController.sourceName = eName;
    OPMClient.SettingsAddEditController.pageObj = {'name':name,'port':port,'thresholdTime':thresh,'timeOut':timeOutSec,'discovery':autoDisc,'downSeverity':downSeverity};//No I18N
    settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', monName); //No I18N
}
function deleteServiceMonitorFmt(cellValue, options, rowdata, action){
var monName = OPMClient.SettingsTabController.monitorName;
var eName = rowdata.EncodedServiceName;
var name = rowdata.serviceName;
var port = rowdata.portNo;
var thresh = rowdata.failureThreshold;
var timeOutSec = rowdata.timeout;
var autoDisc = rowdata.autoDiscovery;
var downSeverity = rowdata.downSeverity;
var edit =  "<i class='pointer icon-configedit' title='Edit' onclick='editServiceMonitors(\""+monName+"\",\""+eName+"\",\""+name+"\",\""+port+"\",\""+thresh+"\",\""+timeOutSec+"\",\""+autoDisc+"\",\""+downSeverity+"\")' tabindex='0' role='button'></i>"; //No I18n

    return edit + "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='delServiceMonitor(&#39;"+opm_escapeHTML(rowdata.serviceName)+"&#39;);' tabindex='0' role='button' title='"+Ember.I18n.t("webclient.devices.customfields.delete",this)+"'></i>";//No I18n
}
function forecastEdit(cellValue, options, rowdata, action){

var edit =  "<i class='pointer icon-configedit' title='"+Ember.I18n.t('webclient.title.edit',this)+"' ></i>"; //No I18n

    return edit
}
function delServiceMonitor(serviceName){
    if(confirm(Ember.I18n.t('webclient.common.deleteconfirmation',this)+" \'"+serviceName+"\' ?")){//No I18N
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/deleteServiceMonitor?serviceName='+serviceName);//No I18N
        showMessage(response,"opm_SettingsGlobalMonitorsGridLoad",OPMClient.SettingsTabController.monitorName);//No I18N
    }
}
function credentialDelete(cellValue, options, rowdata, action)
{
    return '<i class="icon-trash delete OpMToolTip" style="margin-left:20px; font-size:16px; cursor:pointer;" data-title="Delete" data-credName="'+escape(rowdata.credentialName)+'" data-credId="'+escape(rowdata.credentialId)+'" onclick="deleteCredential(this)"></i>'; //No I18n
}


function scheduleDelete(cellValue, options, rowdata, action)
{
    if(rowdata.isCentralBasedDTS !== undefined && rowdata.isCentralBasedDTS === "true") {
        return "<span style='margin-left:20px;'>-</span>"; //No I18N
    }
    if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool!=undefined) {
        return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='deleteDowntimeSchedule(&#39;" + rowdata.id + "&#39;,&#39;" + rowdata.statusNum + "&#39;,&#39;" + rowdata.suppressType + "&#39;,&#39;" + rowdata.tpiTool + "&#39;,&#39;" + rowdata.isDTUpdateDeleteResticted +"&#39;)'></i>"; //No I18n
    }
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='deleteDowntimeSchedule(&#39;" + rowdata.id + "&#39;,&#39;" + rowdata.statusNum + "&#39;,&#39;" + rowdata.suppressType +"&#39;,&#39;"+undefined+"&#39;,&#39;"+undefined+"&#39;)'></i>"; //No I18n
}
function deleteProfile(cellValue, options, rowdata, action)
{
    rowdata.profileId = opm_escapeHTML(rowdata.profileId);
    rowdata.profileName = opm_escapeHTML(rowdata.profileName);
    if(rowdata.discoveryStatus == "true")
    {
        return "<i class='discEditIcon discIcon btn-disabled' title='Edit' role='button' tabindex='0'></i><i class='discIcon discSheduleIcon'  title='Schedule' onclick='addDiscoverySchedule(&#39;"+rowdata.profileId+"&#39;,&#39;"+rowdata.profileName+"&#39;)' role='button' tabindex='0'></i><i class='discIcon discReportIcon' title='Reports' onclick='loadNetworkDiscoveryTabs(\"Reports\",&#39;"+rowdata.profileId+"&#39;);' role='button' tabindex='0'></i><i class='discIcon discDeleteIcon' title='Delete' onclick='deleteDiscoveryProfile(&#39;"+rowdata.profileId+"&#39;,&#39;"+rowdata.profileName+"&#39;)' role='button' tabindex='0'></i>"; //No I18n
    }
    else
    {
        return "<i class='discEditIcon discIcon' title='Edit' onclick='opm_ndEditProfile(\""+rowdata.profileName+"\",\""+rowdata.profileId+"\",\""+rowdata.discoveryType+"\")' role='button' tabindex='0'></i><i class='discIcon discSheduleIcon'  title='Schedule' onclick='addDiscoverySchedule(&#39;"+rowdata.profileId+"&#39;,&#39;"+rowdata.profileName+"&#39;)' role='button' tabindex='0'></i><i class='discIcon discReportIcon' title='Reports' onclick='loadNetworkDiscoveryTabs(\"Reports\",&#39;"+rowdata.profileId+"&#39;);' role='button' tabindex='0'></i><i class='discIcon discDeleteIcon' title='Delete' onclick='deleteDiscoveryProfile(&#39;"+rowdata.profileId+"&#39;,&#39;"+rowdata.profileName+"&#39;)' role='button' tabindex='0'></i>"; //No I18n
    }
}

function setAsProbeStatusImgLink(cellValue, options, rowdata, action)
{
    var imgNow=rowdata.statusImg;

    if(imgNow!=undefined){
        var statusCode = imgNow.substring(imgNow.lastIndexOf('/')+1,imgNow.lastIndexOf('.'));
        return "<i class='icon-"+statusCode+"'></i>";
    }
    else{
        return "";
    }
}
function probeZipLink(cellValue, options, rowdata, action) {
    var name = rowdata.name;
    var severity = rowdata.severity;
    if(severity != undefined && severity === "7"){
        return '<a onclick="probeDownloadZip(\''+name+'\')" title="'+ Ember.I18n.t('webclient.admin.probes.probezip') +'" tabindex="0" role="button" class="icon-zip-download"></a>';
    }
    else {
        return '<label style="font-weight:bold">Probe Installed </label>'; //No I18N
    }
}
function probeMergeRows(rowId, val, rawObject, cm)
{
    if(rawObject.attr!==undefined && rawObject.attr!==null) {
   var attr = rawObject.attr[cm.name], result;
    if (attr && attr.rowspan) {
        result = ' rowspan=' + '"' + attr.rowspan + '"'; //No I18N
    } else if (attr && attr.display) {
        result = ' style="display:' + attr.display + '"'; //No I18N
    }
    return result;
    }
}

function cellMergeRows(rowId, val, rawObject, cm)
{
    if(rawObject.attr!==undefined && rawObject.attr!==null) {
   var attr = rawObject.attr[cm.name], result;
    if (attr && attr.rowspan) {
        result = ' rowspan=' + '"' + attr.rowspan + '"'; //No I18N
    } else if (attr && attr.display) {
        result = ' style="display:' + attr.display + '"'; //No I18N
    }
    return result;
    }
}

function opm_setProbeDisplay(cellValue, options, rowdata, action)
{
    return (rowdata.probeDisplayName !== undefined) ? rowdata.probeDisplayName : ""; //No I18N
}
function opm_probeStatus(cellValue, options, rowdata, action)
{
    var statusCode = rowdata.statusImg.substring(rowdata.statusImg.lastIndexOf('/')+1,rowdata.statusImg.lastIndexOf('.'));
    return '<div class="flex flex-middle-align" style="word-break: break-word;"><span class="mr-xs line-height-0"><i class=icon-'+opm_escapeHTML(statusCode)+'></i></span>'+opm_escapeHTML(Ember.I18n.t(rowdata.serverStatusKey))+'</div>'; //No I18N
}
function opm_probeNameLink(cellValue, options, rowdata, action){
    var probeUrl = rowdata.natProtocol+"://"+rowdata.natName+":"+rowdata.natPort;
    return "<a href='"+probeUrl+"' tabindex='0' role='button' target='_blank' class='opm_link'>"+cellValue+"</a>"; //No I18N
}
function OPM_probeDetailsAction(cellValue, options, rowdata, action)
{
    if(window.OPM.isRMMEdition) {
		return rowdata.probeDisplayName;
	}
    var probeMismatchInfo = '';
    if(rowdata.isCertMismatch === 'true') {
        probeMismatchInfo = '<i class="probe-mismatch-info">'+Ember.I18n.t('webclient.hnv.probe.probelist.hostname.mismatch',this)+'</i>'; //No I18N
    }
    if(!window.OPM.showMSPAllocation) {
        return "<div style='cursor:pointer;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='OPM_editProbeDetails(&#39;"+cellValue+"&#39;)' tabindex='0' role='button'>"+rowdata.probeDisplayName+probeMismatchInfo+"</div>";//No I18n
    } else {
        return escapeHTML(rowdata.probeDisplayName);
    }
}

function additionalFieldsDelete(cellValue, options, rowdata, action){
    if(rowdata['delete'] === true){
        return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='deleteAdditionalFields(&#39;"+rowdata.id+"&#39;,&#39;"+escape(rowdata.name)+"&#39;,&#39;"+rowdata.type+"&#39;)'></i>";//No I18n
    }else{
        return "";//No I18N
    }

}
function deleteAdditionalFields(id, name, type){
	var url = window.OPM.apiUrlPattern + '/admin/deleteAdditionalField?fieldId='+id+'&name='+unescape(name)+'&type='+OPMClient.SettingsConfigurationController.additionalFieldType;//No I18N
    var moType = Ember.I18n.t('webclient.general.Devices',this);//No I18N
    if(OPMClient.SettingsConfigurationController.additionalFieldType == "interface")
    {
        var moType = Ember.I18n.t('webclient.devices.details.intf',this);//No I18N
    }
    if(confirm(Ember.I18n.t('webclient.opm.customfields.deleteconfirmation',{param0:unescape(name), param1: moType},this))){//No I18N
        var response = opm_ajaxPostRequest(url);
        showMessage(response,'listAdditionalFields',OPMClient.SettingsConfigurationController.additionalFieldType);//No I18N
    }
}
function deleteCredential(div)
{
    var credentialId = unescape($(div).attr("data-credId"));
    credentialName = unescape($(div).attr("data-credName"));

	var url = window.OPM.apiUrlPattern + '/admin/deleteCredential'; //No I18N
    if(window.OPM.isCentralServer) {
        var delConfirmMsg = Ember.I18n.t('webclient.opm.cc.central.delcredential.msg',this); //No I18N
        if(window.OPM.credDelCentralOnlyEnabled) {
            delConfirmMsg = Ember.I18n.t('webclient.opm.cc.central.delcredential.centralonly.msg',this); //No I18N
        }
    } else {
        var delConfirmMsg = Ember.I18n.t('webclient.common.deleteconfirmation',this)+" \'"+credentialName+"\' ?";//No I18N
    }
    var callBackFn = function() {
        var addClasses = "";//No I18N
        var message = "";// No I18N
        var response = opm_ajaxPostRequest(url, {'credentialName': credentialName}); //No I18N
        if(response !== undefined && !$.isEmptyObject(response))
        {
            if(response.result !== undefined)
            {
                addClasses = "successMsg";//No I18N
                message =response.result.message;
                opm_getCredentialList();
                if(window.OPM.isCentralServer && !window.OPM.credDelCentralOnlyEnabled) {
                    deleteCredentialFrmProbe(credentialId);
                }
            }
            else if(response.error !== undefined)
            {
                addClasses = "errorMsg";//No I18N
                message = response.error.message;
            }
            opm_infoMsgs(addClasses,message);
        }
    }
    if(window.OPM.isCentralServer) {
        var delOpmConfirmMsg= Ember.I18n.t('webclient.opm.cc.central.delcredential.msg',this); //No I18N
        if(window.OPM.credDelCentralOnlyEnabled) {
            delOpmConfirmMsg = Ember.I18n.t('webclient.opm.cc.central.delcredential.centralonly.msg',this); //No I18N
        }
        opmConfirm("", delOpmConfirmMsg, '500', callBackFn, Ember.I18n.t('webclient.topo.objectdetails.managed.yes'), '', Ember.I18n.t('webclient.topo.objectdetails.managed.no'), '', 'dialogStyle2', true, false, '', false, true);//No I18N
    } else {
        if(confirm(delConfirmMsg))
        {
            callBackFn();
        }
    }
}

function deleteDowntimeSchedule(scheduleId, status, suppressType, tpiTool, isDTUpdateDeleteResticted)
{
    var url = window.OPM.apiUrlPattern + '/admin/deleteDownTimeSchedules'; //No I18N
    var isFromSuppressionPage = false;
    if(window.OPM.currentView.name.indexOf('Settings.Configurations.AlarmSuppression')!==-1) {
        isFromSuppressionPage = true;
        var confirmMsg = Ember.I18n.t('webclient.alarmsuppression.dts.deleteAlert',this); //No I18n
    } else {
    var confirmMsg = Ember.I18n.t('js.common.DeleteAlert1', this); //No I18n
    if (isDTUpdateDeleteResticted != undefined && tpiTool != undefined && isDTUpdateDeleteResticted != 'undefined' && tpiTool != 'undefined') {
        var tpi = Ember.I18n.t('webclient.settings.basic.thirdparty.integration', this);//No I18N
        if (tpiTool == 'SDPOD') {
            tpi = Ember.I18n.t('webclicent.ondemand.title', this);//No I18N
		}
		else if (tpiTool == 'SDPOP') {
            tpi = Ember.I18n.t('webclient.home.servicedesk', this);//No I18N
		}
		else if (tpiTool == 'SNOW') {
            tpi = Ember.I18n.t('webclient.servicenow.title', this);//No I18N
		}
        if (isDTUpdateDeleteResticted == 'true') {
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.dts.tpi.restrictmsg', { param0: tpi}, this));// No I18N
            return false;
        }
        else {
            confirmMsg = Ember.I18n.t('webclient.dts.tpi.warningmsg', { param0: tpi}, this) + ' ' + Ember.I18n.t('js.common.DeleteAlert1', this); //No I18n
        }
    }
        if(status === "2") {
            confirmMsg = Ember.I18n.t('opm.downtime.active',this)+" "+confirmMsg ; //No I18n
        }
    }
    if(confirm(confirmMsg))
    {
        var addClasses = "";//No I18N
        var message = "";// No I18N
        var response = opm_ajaxPostRequest(url, {'scheduleId': scheduleId, 'suppressType': suppressType}); //No I18N
        if(response !== undefined && !$.isEmptyObject(response))
        {
            if(response.result !== undefined)
            {
                addClasses = "successMsg";//No I18N
                message =response.result.message;
                if(isFromSuppressionPage) {
                    opm_loadAlarmSuppressionGrid();
                } else {
                    opm_loadDowntimeSchedules();
                }
            }
            else if(response.error !== undefined)
            {
                addClasses = "errorMsg";//No I18N
                message = response.error.message;
            }
            opm_infoMsgs(addClasses,message);
        }
    }
}


function editCredential(cellValue, options, rowdata, action){
    if(OPMClient.ApplicationController.isOPUtils){
        return '<div style="cursor:pointer;" onclick="opm_gotoCredentialEdit(this)" data-credName="'+escape(cellValue)+'" data-credType="'+rowdata.type+'" data-href="'+window.OPM.apiclientUrl+'Settings/OpUtils/Discovery/Credentials/Edit">'+htmlEncode(cellValue)+'</div>';//No I18N
    }else{
        if(window.OPM.isOPM) {
            var editCredential = '';
            if(window.OPM.userPermissions.discoveryWrite){
                editCredential = '<div style="cursor:pointer;" onclick="openCredentialSlide(this)" data-credName="'+escape(cellValue)+'" data-credType="'+rowdata.type+'" data-href="'+window.OPM.apiclientUrl+'Settings/Discovery/Credentials/Monitors/Edit">'+htmlEncode(cellValue)+'</div>';//No I18N
            } else {
                editCredential = '<div data-credName="'+escape(cellValue)+'" data-credType="'+rowdata.type+'">'+htmlEncode(cellValue)+'</div>';//No I18N
            }

            if(rowdata.isCentralCred) {
            	return '<span class="textWithIcon gap-sm"><div class="text">' + editCredential + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>'; //No I18N
            } else {
            	return editCredential;
            }
        }
        return '<div style="cursor:pointer;" onclick="opm_gotoCredentialEdit(this)" data-credName="'+escape(cellValue)+'" data-credType="'+rowdata.type+'" data-href="'+window.OPM.apiclientUrl+'Settings/Discovery/Credentials/Monitors/Edit">'+htmlEncode(cellValue)+'</div>';//No I18N
    }
}

function editSPMCredential(cellValue, options, rowdata, action){
    var edit = '';
    edit += '<div style="cursor:pointer;" data-credName="'+escape(cellValue)+'" data-credType="'+rowdata.type+'"';//No I18N
    if(window.OPM.userPermissions.discoveryWrite){
        edit +='onclick="opm_gotoCredentialEdit(this)"  data-href="'+window.OPM.apiclientUrl+'Settings/OpUtils/Discovery/Credentials/Edit"';//No I18N
    }
    edit += '>'+htmlEncode(cellValue)+'</div>';
    return edit;
}

function opm_gotoCredentialEdit(div)
{
    globalSliderObj.credName = $(div).attr("data-credName");
    globalSliderObj.credType = $(div).attr("data-credType");
    window.location.href=$(div).attr("data-href");
}

function setFormatterforGridWidget(formatter)
{
    var returnFormatter = "";
    switch(formatter)
    {
        case "setAsImg"://No I18N
            returnFormatter = setStatusAsImgLink;
        break;
        case "linkToDevicesList"://No I18N
//          returnFormatter = linkToDevicesListPage;
        break;
        case "linkToDevicesListPage"://No I18N
//          returnFormatter = linkToDevicesListPage;
        break;
        case "linkToActiveAlarms"://No I18N
//          returnFormatter = linkToDevicesListPage;
        break;
        case "interfaceSummaryLink"://No I18N
            returnFormatter = linkToInterfaceSummary;
        break;
        case "setStatusImgPath"://No I18N
            returnFormatter = severityIcon;
        break;
        case "linkToOpStorSummary"://No I18N
            returnFormatter = linkToOpStorSummary;
        break;
        case "alarmsWithDetailsGrid"://No I18N
            returnFormatter = alarmsWithDetailsGrid;
        break;
        case "setSeverityImgWithPath"://No I18N

            //returnFormatter = setSeverityImgWithPath;
        break;
        case "deviceSummaryPage"://No I18N
            returnFormatter = deviceSummaryLink;
        break;
        case "WidchangeTypeFormatter"://No I18N
            returnFormatter = WidchangeTypeFormatter;
        break;
        case "WidchangeHostNameFormatter"://No I18N
            returnFormatter = WidchangeHostNameFormatter;
        break;
        case "WidCompVioHostNameFormatter"://No I18N
            returnFormatter = WidCompVioHostNameFormatter;
        break;
        case "WidBackupHostNameFormatter"://No I18N
            returnFormatter = WidBackupHostNameFormatter;
        break;
        case "WidEOLHostNameFormatter"://No I18N
            returnFormatter = WidEOLHostNameFormatter;
        break;

        default:
            returnFormatter = window[formatter];
        break;
    }
    return returnFormatter;
}
function setNull(cellValue, options, rowdata, action)
{
    if(cellValue === null)
    {
        return "NULL"; //No I18n
    }
    return cellValue;
}
function popoutNCMDeviceImg(cellValue, options, rowdata, action)
{
    //TODO: This is commented to ensure that the arrow shown in the inventory page doesn't break the popout to snapshot functionality. will fix it in next releases.
    return ""; //"<i onclick='redirectToSnapshot(\"ConfigDevice\", \""+rowdata[0]+"\"); 'class='popoutImg'></i> ";//No I18N
}

// function nfaDPIPopOutImg(cellValue, options, rowdata, action) {
//     var redirectSnapShot='DPILayer7'; //No I18n
//     switch(OPMClient.InventoryDeviceDetailsController.subFilterType){
//         case 'apps': redirectSnapShot='DPILayer4';break; //No I18n
//         case 'src': redirectSnapShot='DPISource';break; //No I18n
//         case 'dst': redirectSnapShot='DPIDestination';break; //No I18n
//     }
//     return "<i onclick='redirectToSnapshot(\""+redirectSnapShot+"\",\""+rowdata[0]+"\");'class='popoutImg' title='"+Ember.I18n.t('webclient.inventory.fullview')+"'></i>";//No I18N
// }
// function nfaDevPopoutImg(cellValue, options, rowdata, action) {
//     var filterType = OPMClient.InventoryDeviceDetailsController.subFilterType;
//     var redirectType;
//     var deviceID;
//     if(filterType === 'Devices') {//No I18n
//         redirectType='FlowDevice';//No I18n
//         deviceID=rowdata.IP;
//     }else if(filterType === 'Interfaces') {//No I18n
//         redirectType='FlowInterface';//No I18n
//         deviceID=rowdata.ID;
//     }else if(filterType === 'Groups') {//No I18n
//         redirectType=(OPMClient.InventoryDeviceDetailsController.invMainFilterObjects.IPGroups === 'IPGroups')?'FlowIPGroup':'FlowInterfaceGroup';//No I18n
//         deviceID=rowdata.ID;
//     }else if(filterType === 'Apps') {//No I18n
//         redirectType=(OPMClient.InventoryDeviceDetailsController.invMainFilterObjects.Layer4 === 'Layer4')?'FlowL4':'FlowL7';//No I18n
//         deviceID=(OPMClient.InventoryDeviceDetailsController.invMainFilterObjects.Layer4 === 'Layer4')?rowdata.AppName:rowdata.AppID;//No I18n
//     }else if(filterType === 'Attacks') {//No I18n
//         redirectType='FlowAttacks';//No I18n
//         deviceID=rowdata.evid;
//     }
//     if(rowdata.state == 1) {
//         return "";
//     }
//     return "<i onclick='redirectToSnapshot(\""+redirectType+"\",\""+deviceID+"\");'class='popoutImg OpMToolTip' data-title='"+Ember.I18n.t('webclient.inventory.fullview')+"'></i> ";//No I18N
// }
// function nfaWLCPopoutImg(cellValue, options, rowdata, action) {
//     var filterType = OPMClient.Inventory.getWlcSelectedFilterVal();
//     var redirectType;
//     var deviceID;
//     if(filterType === 'Controllers') {//No I18n
//         redirectType='FlowWLC';//No I18n
//         deviceID=rowdata.ID;
//     }else if(filterType === 'APMAC') {//No I18n
//         redirectType='FlowAPMAC';//No I18n
//         deviceID=rowdata.ID;
//     }else if(filterType === 'WIRELESS_SSID') {//No I18n
//         redirectType='FlowSSID';//No I18n
//         deviceID=rowdata.Name;
//     }else if(filterType === 'CLIENTIP'){//No I18n
//         redirectType='FlowClient';//No I18n
//         deviceID=rowdata.Name;
//     }else{
//         redirectType='FlowClientMAC';//No I18n
//         deviceID=rowdata.Name;
//     }
//     if(rowdata.state == 1) {
//         return "";
//     }
//     return "<i onclick='redirectToSnapshot(\""+redirectType+"\",\""+deviceID+"\");'class='popoutImg OpMToolTip' data-title='"+Ember.I18n.t('webclient.inventory.fullview')+"'></i> ";//No I18N
// }

function fwaDevPopoutImg(cellValue, options, rowdata, action) {
    var filterType = OPMClient.InventoryDeviceDetailsController.subFilterType;
    var redirectType;
    var deviceID;
    window.OPM.deviceListForNextPrev = [];
    if(filterType === 'Devices') {//No I18n
        redirectType='FirewallDevice';//No I18n
        deviceID=rowdata.rid;
    }else if(filterType === 'Interfaces') {//No I18n
        redirectType='FirewallInterface';//No I18n
        deviceID=rowdata.id;
    }else if(filterType === 'Clouds') {//No I18n
        redirectType='FirewallService';//No I18n
        deviceID=rowdata.Service;
    }else if(filterType === 'Rules') {//No I18n
        redirectType='FirewallRules';//No I18n
        deviceID=rowdata.Rule;
    }else if(filterType === 'Users') {//No I18n
        redirectType='FirewallUsers';//No I18n
        deviceID=rowdata.UserName;
    }
    window.OPM.deviceListForNextPrev.push(deviceID);
    return "<i onclick='redirectToSnapshot(\""+redirectType+"\",\""+deviceID+"\");'class='popoutImg OpMToolTip'  data-title='"+Ember.I18n.t('webclient.inventory.fullview')+"'></i> ";//No I18N
}
function opm_gotoProbeSnapshot(deviceName){
    $.ajax({
        dataType: "json",//No I18N
		url: window.OPM.apiUrlPattern + '/device/getProbeURL?deviceName='+deviceName,//No I18N
        async: false,               //No I18N
        success: function(jsonData){
            if(window.OPM.isCentralServer && (jsonData.ProbeURL===5050 || jsonData.ProbeURL==="5050")){//No I18N
				//opm_transitionToParentRoute("Inventory.List.Summary.Sub","Devices");//No I18N
				redirectToInventoryList(opmGlobalRoute,"Devices");//No I18N
                setTimeout(function(){opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.common.restrictionMsg',this));},1000);//No I18N
                return;
            }
            var win = window.open(jsonData.ProbeURL+"/apiclient/ember/index.jsp#/Inventory/Snapshot/MonitoringDevice/"+deviceName, '_blank');
            win.focus();
        }
    });
}
function opm_gotoProbeSnapshotLink(thisDiv) {
    var deviceName = $(thisDiv).attr('data-deviceName');
    $.ajax({
        dataType: "json",//No I18N
		url: window.OPM.apiUrlPattern + '/device/getProbeURL?deviceName='+deviceName,//No I18N
        async: false,               //No I18N
        success: function(jsonData){
            if(window.OPM.isCentralServer && (jsonData.ProbeURL===5050 || jsonData.ProbeURL==="5050")){//No I18N
				//opm_transitionToParentRoute("Inventory.List.Summary.Sub","Devices");//No I18N
				redirectToInventoryList(opmGlobalRoute,"Devices");//No I18N
                setTimeout(function(){opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.common.restrictionMsg',this));},1000);//No I18N
                return;
            }
            var win = window.open(jsonData.ProbeURL+"/apiclient/ember/index.jsp#/Inventory/Snapshot/MonitoringDevice/"+deviceName, '_blank');
            win.focus();
        }
    });
}
function selectDisplayprobes(selectedProbe){
    $("#deviceSnapshotSmallHeader").text(Ember.I18n.t('opm.inventory.device.move',this)); //No I18N
    var probeList = loadProbeDetails();
    for(var i =0; i<probeList.length;i++){
        var currentProbe = probeList[i].NAME;
        if(currentProbe == selectedProbe){
            OPMClient.InventoryDeviceDetailsController.set("currentProbeDetails",probeList.get(i)); //No I18n
            probeList.removeAt(i);
            break;
        }
    }
    OPMClient.InventoryDeviceDetailsController.set("DeviceMoveProbeList",probeList); //No I18n
    deviceSlideIn(3);
}
function popoutImg(cellValue, options, rowdata, action)
{
    return "<i onclick='redirectToDeviceSnapshot(\""+rowdata.deviceName+"\");'class='popoutImg' title='Full View'></i> ";//No I18N
}
function popoutProbeImg(cellValue, options, rowdata, action)
{
    return "<i onclick='redirectToDeviceSnapshot(\""+rowdata.deviceName+"\");'class='popoutImg' title='Full View'></i> ";//No I18N
}
function opm_probeSnapshot (cellValue, options, rowdata, action) {
    return "<span class='cursorPointer' onclick='opm_gotoProbeSnapshot(\""+rowdata.deviceName+"\")'>"+rowdata.probeDisplayName+"</span>";
}
function openEditCredentialPage(credId) {
    OPMClient.SettingsAddEditController.set('ncmCredId',credId);//No I18N
    location.href = window.OPM.apiclientUrl+'Settings/Discovery/Credentials/Backup/Edit'; //No I18N
}
function setAssignPwd(cellvalue, options, rowObject)
{
	return (rowObject.assignPass) ? (rowObject.currentUser) ? "<a style='float:left;color:green;' class='pointer' tabindex='0' role='button' onclick='openQuickLinksPassword(event);'>" + Ember.I18n.t('webclient.common.preferences.changepassword', this) + "</a>" : "<a style='float:left;color:green;' tabindex='0' role='button' class='pointer' onclick='opm_assignPassword(\"" + escape(rowObject.uName) + "\");'>" + Ember.I18n.t('webclient.usermgmt.assignnew', this) + "</a>" : Ember.I18n.t('webclient.usermgmt.notallowed', this); //No I18N
}
function formatNFADNS(cellvalue, options, rowObject)
{
	return "<i style='float:left' class='pointer icon-configedit' onclick='nfa_editDNSAction(\""+htmlEncode(rowObject.ip)+"\")' title='"+Ember.I18n.t("webclient.title.edit")+"' ></i><i class='icon-trash delete' style='margin-left:10px; font-size:16px; cursor:pointer;' onclick='nfa_deleteDNSAction(\""+htmlEncode(rowObject.ip)+"\")' title='"+Ember.I18n.t("webclient.title.delete")+"'></i>"; //NO I18N
}
function formatFWADNS(cellvalue, options, rowObject)
{
    var actionIcon = ""; //No I18N
    actionIcon += "<i style='float:left' class='pointer icon-configedit' onclick='OPMClient.Settings.FWAeditDNSAction(\""+rowObject.dnsName+"\",\""+rowObject.dnsIp+"\",\""+rowObject.dnsId+"\")' title='Edit' ></i><i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='OPMClient.Settings.deleteFWADNSAction(\""+rowObject.dnsName+"\",\""+rowObject.dnsIp+"\",\""+rowObject.dnsId+"\")' data-title='Delete'></i>"; //No I18n
    return actionIcon;
}
function reportFilteractions(cellvalue, options, rowObject)
{
    var actionIcon = ""; //No I18N
    actionIcon += "<i style='float:left' class='pointer icon-configedit' onclick='OPMClient.Reports.fwaFilterEditAction(\""+rowObject.filterType+"\")' title='Edit' ></i>"; //No I18n
    if(rowObject.value != "-"){
        actionIcon +="<i class='icon-trash delete OpMToolTip' style='font-size:16px; cursor:pointer;' onclick='OPMClient.Reports.fwaFilterDeleteAction(\""+rowObject.filterType+"\")' data-title='Delete'></i>"; //No I18n
    }

    return actionIcon;
}
function formatNFAAppMAP(cellvalue, options, rowObject)
{
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='OPMClient.Settings.deleteNFAMapAction(\""+options.rowId+"\",\""+options.gid+"\")' title='"+Ember.I18n.t('webclient.general.delete')+"'></i>"; //No I18n
}

// function formatNBAAlert(cellvalue, options, rowObject)
// {
//     var actionIcon = ""; //No I18N
//     actionIcon += "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;'></i>"; //No I18n
//     return actionIcon;
// }

function formatDeleteFWAAlert(cellvalue, options, rowObject)
{
    var actionIcon = ""; //No I18N
    if(window.isoperator || window.OPM.userPermissions.alarmsWrite){
	actionIcon += "<i class='pointer icon-configedit' title='Edit' onclick='OPMClient.Settings.FWAEditAlarmProfile("+options.rowId+",&#39#jqgridList&#39)' style='margin: 0 6px !important;display:inline-block;'></i> <i class='icon-paste OpMToolTip' tite='copy' onclick='OPMClient.Settings.FWAEditAlarmProfile("+options.rowId+",&#39#jqgridList&#39,&#39copy&#39)' style='margin:0 6px;cursor:Pointer;'></i> <i class='iconAlarmClear pointer' onclick='OPMClient.Settings.FWAClearAlertProfile(\""+rowObject.NF_ID+"\",\""+rowObject.Alert_Type+"\",\""+rowObject.FILTER_NAME+"\")' style='margin: 0 6px;' title='"+Ember.I18n.t('jsp.tools.sysoid.GetSysObjectID.Clear')+'&nbsp;'+Ember.I18n.t('webclient.devices.details.alarm',this)+"'></i><i class='icon-trash pointer' onclick='OPMClient.Settings.FWAdeleteAlertProfile(\""+rowObject.NF_ID+"\",\""+rowObject.Alert_Type+"\",\""+rowObject.FILTER_NAME+"\")' style='margin:0 6px;font-size:16px;cursor:pointer' title='Delete'></i><i class='icon-file-pdf pointer' onclick='OPMClient.Settings.FWAExportAllAlarmList(\""+rowObject.NF_ID+"\",\""+rowObject.Alert_Type+"\",\""+rowObject.FILTER_NAME+"\",\""+rowObject.Hits+"\",\""+rowObject.CRITICALITY+"\")' style='margin: 0px 6px;' title='"+Ember.I18n.t('webclient.tour.exportPDF')+"'></i>"; //No I18n
    }else{
    	actionIcon += "<i class='icon-file-pdf pointer' onclick='OPMClient.Settings.FWAExportAllAlarmList(\""+rowObject.NF_ID+"\",\""+rowObject.Alert_Type+"\",\""+rowObject.FILTER_NAME+"\")' style='margin: 0px 6px;' title='"+Ember.I18n.t('webclient.tour.exportPDF')+"'></i>"; //No I18n
    }

    return actionIcon;
}

function RuleMgmtAlrtActionFormatter(cellValue, options, rowdata, action){
	var actionIcon = ""; //No I18N
	actionIcon= "<div style='padding-top:10px'><i class='pointer icon-configedit' title='Edit' style='margin: 0 6px !important;display:inline-block;' onclick='OPMClient.Reports.FWARuleMgmtAlrtEdit("+rowdata.rid+")'></i>";//NO I18N
	actionIcon+= "<span class='reportCopy' title='Copy' onclick='OPMClient.Reports.FWARuleMgmtAlrtCopy("+rowdata.rid+")'></span>";//NO I18N
	actionIcon+= "<span class='pointer ui-icon ui-icon-trash' title='Delete' onclick='OPMClient.Reports.FWARuleMgmtAlrtDelete("+rowdata.rid+")'></span></div>";//NO I18N
    return actionIcon;
}
function RuleMgmtAlrtFormatter(cellValue, options, rowdata, action)
{
	var rettext='';
	var AlrtType='';
	var selTab=''
	if(options.colModel != undefined && options.colModel.name != undefined){
		if(options.colModel.name == "overviewTxt"){
			AlrtType="OverviewReport";//NO I18N
			selTab="Overview";//NO I18N
		}else if(options.colModel.name == "optimizationTxt"){
			AlrtType="OptimizationReport";//NO I18N
			selTab="Optimization";//NO I18N
		}else if(options.colModel.name == "unusedTxt"){
			AlrtType="CleanupReport";//NO I18N
			selTab="Unused";//NO I18N
		}else if(options.colModel.name == "expiryTxt"){
			AlrtType="ExpiryReport";//NO I18N
			selTab="Expiry";//NO I18N
		}else if(options.colModel.name == "riskTxt"){
			AlrtType="RiskReport";//NO I18N
			selTab="Risk";//NO I18N
		}
	}
	var i18nMap={
			"TotalRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.total.rule.count'),//NO I18N
			"AllowedRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.allowed.rule.count'),//NO I18N
			"DeniedRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.denied.rule.count'),//NO I18N
			"InboundRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.inbound.rule.count'),//NO I18N
			"OutboundRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.outbound.rule.count'),//NO I18N
			"InactiveRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.inactive.rule.count'),//NO I18N
			"LoggingDisabledRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.logging.disabled.rule.count'),//NO I18N
			"AllowedAnyToAnyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.AllowedAnyToAnyRulesCount.rule.count'),//NO I18N
			"AllowedRulesWithAnyServicesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.AllowedRulesWithAnyServicesCount.rule.count'),//NO I18N
			"BidirectionalRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.bidirectional.rule.count'),//NO I18N
			"RedundancyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.Redundancy.rule.count'),//NO I18N
			"GeneralizationRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.Generalization.rule.count'),//NO I18N
			"CorrelationRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.Correlation.rule.count'),//NO I18N
			"ShadowRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.Shadow.rule.count'),//NO I18N
			"GroupingRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.Grouping.rule.count'),//NO I18N
			"UnassignedInterfacesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.unassigned.interfaces.count'),//NO I18N
			"UnassignedObjectsCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.unassigned.Objects.count'),//NO I18N
			"TotalRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.total.risky.rule.count'),//NO I18N
			"CriticalRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.critical.risky.rule.count'),//NO I18N
			"HighRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.high.risky.rule.count'),//NO I18N
			"LowRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.low.risky.rule.count'),//NO I18N
			"MediumRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.medium.risky.rule.count'),//NO I18N
			"AttentionRiskyRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.attention.risky.rule.count'),//NO I18N
			"ExpiredRulesCount":Ember.I18n.t('webclient.fwa.rulemgmt.alarm.expired.rule.count')//NO I18N
				};
	var conditionMap={
			"lesser":"<",//NO I18N
			"greater":">",//NO I18N
			"lesserthan":"<=",//NO I18N
			"greaterthan":">="//NO I18N
	}
	if(rowdata != undefined && rowdata.alertNotificationFields != undefined){
		for(var i=0;i<rowdata.alertNotificationFields.length;i++){
			if(rowdata.alertNotificationFields[i].reportName == AlrtType){
				var tempData=rowdata.alertNotificationFields[i];
				if(tempData != undefined && tempData.lastAlarmGeneratedTime != undefined){
					if(window.OPM.isFWAServer){
						var tempStr='<div style="padding-top:10px;width:100%"><i class="icon-bell" style="padding-left:5px" title="'+Ember.I18n.t('webclient.fwa.rulemgmt.alert.lastgen')+'" ></i> '+i18nMap[tempData.type]+' '+conditionMap[tempData.condition]+' '+tempData.value+'</div>';
					}else{
						var tempStr='<div style="padding-top:10px;width:100%"><i class="icon-bell pointer" style="padding-left:5px" title="'+Ember.I18n.t('webclient.fwa.rulemgmt.alert.lastgen')+'" onclick="OPMClient.Reports.ruleMgmtCritAlrtDrill('+rowdata.rid+',\''+tempData.reportName+'\',\''+tempData.type+'\',\''+i18nMap[tempData.type]+'\')"></i> '+i18nMap[tempData.type]+' '+conditionMap[tempData.condition]+' '+tempData.value+'</div>';
					}
					
				}else{
					var tempStr='<div style="padding-top:10px;width:100%"><i class="icon-bell pointer" style="padding-left:5px;color:lightgrey" title="'+Ember.I18n.t('webclient.fwa.rulemgmt.alert.noalert')+'" ></i> '+i18nMap[tempData.type]+' '+conditionMap[tempData.condition]+' '+tempData.value+'</div>';
				}
				
				if(rettext != ''){
					rettext=rettext+tempStr;
				}else{
					rettext=tempStr;
				}
			}
		}
	}
	if(rettext == ''){
		if(window.OPM.isFWAServer || !window.OPM.isAdministrator){
			rettext='-';//NO I18N
		}else{
			rettext='<div class="rdmLink pull-left" style="padding-top:10px;margin:0px;height:auto"><a style="color:#3996dd" onclick="OPMClient.Reports.FWARuleMgmtAlrtEdit('+rowdata.rid+',\''+selTab+'\')">'+Ember.I18n.t('webclient.inventory.configure')+'</a></div>'
		}
	}
    return rettext;
}

function formatNFAGroups(cellvalue, options, rowObject)
{
    if (window.OPM.isProbe && rowObject.fromCentral == 1) {
        return "";
    }
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='OPMClient.Settings.deleteNFAGroupsAction(\""+options.rowId+"\",\""+options.gid+"\")' title='"+Ember.I18n.t('webclient.general.delete')+"'></i>"; //No I18n
}
function formatFWAlertDelete(cellvalue, options, rowdata)
{
    var actionIcon = ""; //No I18N
    actionIcon += "<i class='pointer icon-configedit' title='Edit' onclick=\"OPMClient.Settings.addFWASettingAvailAlert('edit', '"+rowdata.FAAID+"')\" style=\"font-size: 16px;\"></i>"; //No I18N
    actionIcon += "<i class='icon-trash delete OpMToolTip' onclick='OPMClient.Settings.fwa_AvailableAlertAction(\"delete\",\""+rowdata.FAAID+"\")' data-title='"+Ember.I18n.t('webclient.general.delete')+"' style=\"font-size: 16px;\"></i>"; //No I18n
    return actionIcon;
}
function formatFWCollAlertDelete(cellvalue, options, rowdata)
{
    var actionIcon = ""; //No I18N
    actionIcon += "<i class='pointer icon-configedit' title='Edit' onclick=\"OPMClient.Settings.addFWASettingCollAvailAlert('edit', '"+rowdata.FAAID+"')\" style=\"font-size: 16px;\"></i>"; //No I18N
    actionIcon += "<i class='icon-trash delete OpMToolTip' style='font-size:16px; cursor:pointer;' onclick='OPMClient.Settings.fwaColl_AvailableAlertAction(\"delete\",\""+rowdata.FAAID+"\")' data-title='"+Ember.I18n.t('webclient.general.delete')+"'></i>"; //No I18n
    return actionIcon;
}
function ipGrpDeleteCriteria(cellvalue, options, rowObject)
{
    var actionIcon = ""; //No I18N
    actionIcon += "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='OPMClient.Settings.ipGrpDeleteCriteria(\""+options.rowId+"\",\""+options.gid+"\")' data-title='"+Ember.I18n.t('webclient.general.delete')+"'></i>"; //No I18n
    return actionIcon;
}

function formatUserList(cellvalue, options, rowObject)
{
    var actions = ""; //No I18N
    if(window.OPM.isAuthorized || (window.isoperator && window.OPM.isNFA))
    {
        var isSelf = (parseInt(rowObject.uID) === parseInt(window.OPM.userId));
        var isSuperAdmin = (rowObject.uName === OPMClient.ApplicationController.superadminuser) && !rowObject.allowDelete;
        var isCentralNotAllowed = (rowObject.isCentralUser && !rowObject.allowTOTPReset);
        // Enable/Disable toggle - hidden for super admin, current logged-in user, and
        // central users that cannot be acted upon (matches the "Not Allowed" branch below).
        if(!isSelf && !isSuperAdmin && !isCentralNotAllowed) {
            var isActive = !(rowObject.accountActive === false || rowObject.accountActive === "false");
            var toggleTitle = isActive ? Ember.I18n.t('webclient.usermgmt.disable.user') : Ember.I18n.t('webclient.usermgmt.enable.user'); //No I18N
            actions += "<div class='chkRoundBtn style2 type2 small pointer top-0 m-none' title='" + toggleTitle + "'><div><input type='checkbox' " + (isActive ? "checked" : "") + " onclick='opm_setUserStatus(event,&#39;" + htmlEncode(rowObject.uID) + "&#39;,&#39;" + htmlEncode(rowObject.uName) + "&#39;," + (!isActive) + ")'/><label></label></div></div>"; //No I18N
        }
        if(window.OPM.isTFAEnabled && !rowObject.isCentralUser && rowObject.uName !== OPMClient.ApplicationController.superadminuser && (parseInt(rowObject.uID) !== parseInt(window.OPM.userId))) {
            if(rowObject.allowTOTPReset) {
                actions += "<em class='svgIcon size14 mr-md cursorPointer' tabindex='0' role='button' aria-label='" + Ember.I18n.t('twofactorauth.resettotp') +"' title='"+Ember.I18n.t('twofactorauth.resettotp')+"'><svg onclick='opm_userQRReset(&#39;"+htmlEncode(rowObject.uID)+"&#39;,&#39;"+htmlEncode(rowObject.uName)+"&#39)'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#scan-qr'></use></svg></em>"; //No I18n
            } else {
                // TFA is on but this user is not eligible for a TOTP reset 
                actions += "<em class='svgIcon size14 mr-md icon-disabled cursorNotAllowed' tabindex='-1' aria-disabled='true' title='"+Ember.I18n.t('twofactorauth.resettotp')+"'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#scan-qr'></use></svg></em>"; //No I18n
            }
        }
        if(!rowObject.isCentralUser && (rowObject.uName !== OPMClient.ApplicationController.superadminuser || rowObject.allowDelete) && (parseInt(rowObject.uID) !== parseInt(window.OPM.userId)))
        {
            actions += "<em class='svgIcon size16 cursorPointer' tabindex='0' role='button' aria-label='" + Ember.I18n.t('webclient.devices.customfields.delete') +"' onclick='opm_deleteUser(&#39;"+htmlEncode(rowObject.uID)+"&#39;)'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#delete'/></svg></em>"; //No I18n
        }
        if(rowObject.isCentralUser && !rowObject.allowTOTPReset) {
            return Ember.I18n.t('webclient.usermgmt.notallowed'); //No I18n
        }
    }
    if(!actions) { return ""; }
    // Flex container guarantees source-order rendering and vertical centering across the
    // toggle (block) and the SVG icons (inline) regardless of any float rules they bring.
    return "<div class='flex flex-middle-align'>" + actions + "</div>"; //No I18N
}
function opm_deleteUser(userId)
{
    if(confirm(Ember.I18n.t("webclient.admin.users.Areyousurewanttodelete",this)))
    {
        var addClasses = "";//No I18N
        var message = "";// No I18N
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/deleteUser?userId='+userId); //No I18N
        if(response !== undefined && !$.isEmptyObject(response))
        {
            if(response.result !== undefined)
            {
                addClasses = "successMsg";//No I18N
                message =response.result.message;
            }
            else if(response.error !== undefined)
            {
                addClasses = "errorMsg";//No I18N
                message = response.error.message;
            }
            opm_infoMsgs(addClasses,message);
            opm_loadallUserList();
        }
    }
}

function opm_userQRReset(userId, userName)
{
    opmConfirm('', Ember.I18n.t('twofactorauth.resettotp.confirm') + ': ' + userName, '', function(){
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/resetTOTPSecret?resetUserId='+userId); //No I18N
        showMessage(response);
        opm_loadallUserList();
    }, Ember.I18n.t('webclient.topo.addnode.clearbutton')); //No I18n

}

// Enable/disable a user account from the User Management list. Wraps the
// event.stopPropagation prevents the row-click edit handler from also opening
// the user edit slide-in.
function opm_setUserStatus(event, userId, userName, enable)
{
    if(event) {
        event.stopPropagation();
    }
    var checkbox = event && event.target ? event.target : null;
    if(enable) {
        opm_setUserStatusCall(userId, true);
        return;
    }
    // Disable flow: revert the toggle visually if the user cancels.
    $('body').addClass('ui-dialog-hide-close'); //No I18N
    opmConfirm(
        Ember.I18n.t('webclient.usermgmt.disable.user.title'), //No I18N
        Ember.I18n.t('webclient.usermgmt.disable.user.alert', {param0: userName}), //No I18N
        '',
        function() { opm_setUserStatusCall(userId, false); },
        Ember.I18n.t('webclient.restapi.disable.okBtnText'), //No I18N
        function() { if(checkbox) { checkbox.checked = true; } },
        Ember.I18n.t('webclient.restapi.disable.cancelBtnText'), //No I18N
        '', 'dialogStyle2', true, false, '', false, false //No I18N
    );
}

function opm_setUserStatusCall(userId, enable)
{
    var addClasses = ""; //No I18N
    var message = ""; //No I18N
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/updateUserStatus?userId=' + userId + '&enable=' + enable); //No I18N
    if(response !== undefined && !$.isEmptyObject(response))
    {
        if(response.result !== undefined)
        {
            addClasses = "successMsg"; //No I18N
            message = response.result.message;
        }
        else if(response.error !== undefined)
        {
            addClasses = "errorMsg"; //No I18N
            message = response.error.message;
        }
        opm_infoMsgs(addClasses, message);
    }
    opm_loadallUserList();
}

function deleteDiscoveryProfile(id,profileName){
    if(id !== undefined && profileName !== undefined){//No I18N
        if(confirm(Ember.I18n.t('webclient.admin.backup.delete_msg',this)+" "+profileName+" ?")){//No I18N
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/discovery/deleteDiscoveryProfile',{'profileId':id});//No I18N
            if(response !== undefined && !$.isEmptyObject(response))
            {
                if(response.message !== undefined)
                {
                    addClasses = "successMsg";//No I18N
                    message =response.message;
                    opm_listDiscoveryProfile('profiles');//No I18N
                }
                else if(response.result.message !== undefined)
                {
                    addClasses = "successMsg";//No I18N
                    message =response.result.message;
                    opm_listDiscoveryProfile('profiles');//No I18N
                }
                else if(response.error !== undefined)
                {
                    addClasses = "errorMsg";//No I18N
                    message = response.error.message;
                }
                opm_infoMsgs(addClasses,message);
            }
        }
    }
}

function editDiscoveryProfile(cellValue, options, rowdata, action){
	if(window.OPM.isNCM || window.OPM.isNFA) {
		return "<div style='cursor:pointer;' onclick='opm_editDiscoveryProfile(this)' data-profileName='"+cellValue+"' data-profileID='"+rowdata.profileId+"' data-href='"+window.OPM.apiclientUrl+"Settings/Discovery/NCMDiscoveryWizard'>"+cellValue+"</div>";//No I18N
    } else {
    return "<div style='cursor:pointer;' onclick='opm_editDiscoveryProfile(this)' data-profileName='"+cellValue+"' data-profileID='"+rowdata.profileId+"' data-href='"+window.OPM.apiclientUrl+"Settings/Discovery/DiscoveryWizard/Edit'>"+escapeHTML(cellValue)+"</div>";//No I18N
}
}
function listPendingDevices(cellValue, options, rowdata, action){
    if(cellValue !== "0" && cellValue !== 0){//No I18N
		return "<div style='cursor:pointer;cursor:pointer;text-decoration-line:underline !important;' onclick='opm_listPendingDevices(this);' data-profileID='"+rowdata.profileId+"' data-time='"+rowdata.time+"' data-index='"+options.colModel.name+"'>"+cellValue+"</div>";//No I18N
    }else{
        return cellValue;
    }
}
function opm_editDiscoveryProfile(div)
{
    OPMClient.DiscoveryWizardAddEditController.discoveryProfileName = $(div).attr("data-profileName");//No I18N
    OPMClient.DiscoveryWizardAddEditController.discoveryProfileId = $(div).attr("data-profileID");//No I18N
	OPMClient.DiscoveryWizardAddEditController.Edit = true;
    window.location.href=$(div).attr("data-href");//No I18N
}

function probeNameTextFormat(cellValue,options,rowdata,action) {
    var returnText = '';
    returnText += "<span class='text-ellipsis' style='width:100%;display:block'>"+htmlEncode(rowdata.probe)+"</span>";//No I18N
    return returnText;
}
function nfaAlarmsWithDetailsGrid(cellValue,options,rowdata,action) {
    var snapShotType = nfa_getSnapshotTypeFromAlertEntity(rowdata.entity), deviceID = (rowdata.entity).split("_")[0];
    var returnText = '';
    returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+htmlEncode(rowdata.sevCode)+"'></span><h3 class='cursorPointer' onclick='redirectToAlarm(\""+htmlEncode(rowdata.eventid)+"\")'>"+htmlEncode(rowdata.message)+"</h3><p class='cursorPointer' onclick='redirectToSnapshot(\""+snapShotType+"\"\,\""+deviceID+"\")'>"+htmlEncode(rowdata.displayName)+"</p>"; //NO I18N
    returnText += "<p>"+htmlEncode(rowdata.ttime)+"</p></div>";//No I18N
    return returnText;
}

function alarmsWithDetailsGrid(cellValue, options, rowdata, action)
{
    if (rowdata.type === "AnomaliesWidget") {
        return "<div class='alarm-row' title='"+escapeHTML(rowdata.message)+"'><span class='statusColor --fault-severity severity_" + rowdata.severity + "'></span><h3 class='cursorPointer' onclick='redirectToAnomalyPage(" + escapeHTML(rowdata.moid) + ", \"devices\", \"" + escapeHTML(rowdata.Period) + "\")' >" + escapeHTML(rowdata.message) + "</h3><p class='cursorPointer' onclick='redirectToDeviceSnapshot(\"" + rowdata.source + "\")'>" + escapeHTML(rowdata.displayname) + "</p><p>" + rowdata.time + "</p>"; //No I18N
    }
    var source = rowdata.source;
    var alarmUrl = redirectToAlarm(rowdata.alarmId, undefined, true);
    var deviceUrl = redirectToDeviceSnapshot(source, undefined, undefined, undefined, true);
    var wanSiteUrl = redirectWanSiteSnapshot(source, true);
    var wanLinkUrl = redirectWanLinkSnapshot(source, undefined, true);
    if(OPMClient.ApplicationController.isCentralServer && OPMClient.HomeDetailsController.probeID!=="" && source.indexOf(OPMClient.HomeDetailsController.probeID)<0){
        var returnText = '';
        source=source+"."+OPMClient.HomeDetailsController.probeID; //No I18N
         if(rowdata.entity == "localhost_FILEINTEGRITY_TAMPERED" || rowdata.entity ==   "localhost_FILEINTEGRITY_BLACKLISTED") {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + window.OPM.apiclientUrl + "Settings/Basic/SSLSettings/ScanBlackList'><p class='cursorPointer'> "+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
        else if(rowdata.category!=undefined && rowdata.category === "WanIPSite") {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + wanSiteUrl + "' ><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
        else if(rowdata.category!=undefined && rowdata.category=== "WanIP") {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + wanLinkUrl + "' ><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
        else if(rowdata.category!=undefined && rowdata.category=== "Group") {
            var groupType = rowdata.actionType === "device" ? "Device" : rowdata.actionType === "interface" ? "Interface" : "Group"; //No I18N
            var groupUrl =  redirectotGroupsSnapshot(escapeHtmlTags(rowdata.source), groupType, true);
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + groupUrl + "' ><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
        else if (rowData.category !== undefined && rowData.category === "RemoteCollector") {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><h3 class='cursorPointer' onclick='redirectToAlarm(\""+rowdata.alarmId+"\")' >"+escapeHTML(rowdata.message)+"</h3>"; //No I18N
            returnText += "<p>"+escapeHTML(rowdata.displayName)+"</p>";//No I18N
        }
        else{
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + deviceUrl + "' ><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
        returnText += "<p>" + (rowdata.technician !== undefined ? rowdata.technician + " | " : "") + rowdata.ttime+"</p></div>";//No I18N
        return returnText; //No I18N
    }
    else{
    var returnText = '';
//  returnText += "<div class='alarm-row'><span class='statusColor severity_"+rowdata.severity+"'></span><h3 class='cursorPointer' onclick='redirectToAlarm(\""+rowdata.entity+"\")' >"+rowdata.message+"</h3><p class='cursorPointer' onclick='redirectToDeviceSnapshot(\""+rowdata.source+"\")'>"+rowdata.displayName+"</p>";//No I18N
//  if(OPMClient.ApplicationController.isNCM || OPMClient.ApplicationController.isNFA)
    var entity=rowdata.entity;
	var eventType = rowdata.eventType ? rowdata.eventType : rowdata.EVENTTYPE ? rowdata.EVENTTYPE : ""; //NO I18N
    if(entity.indexOf('NCM') > -1)
        {
            var NCMUrl = redirectToNCMSnapshot(rowdata.source,"ConfigDevice", true); //No I18N
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + NCMUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
    else if(rowdata.category !== undefined && rowdata.category === "NetworkPath" || entity.indexOf('NETWORK_PATH') > -1)
        {
            var networkPathUrl = redirectToNetworkPathGraph(rowdata.source, true);
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+rowdata.message+"</h3></a><a href='" + networkPathUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
    else if(rowdata.entity == "localhost_FILEINTEGRITY_TAMPERED" || rowdata.entity ==   "localhost_FILEINTEGRITY_BLACKLISTED")
        {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+rowdata.message+"</h3></a><a href='" + window.OPM.apiclientUrl + "Settings/Basic/SSLSettings/ScanBlackList'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }
    else if(rowdata.pollID!==-1 && rowdata.category === "APM") {
        returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "'><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a>"; //No I18N
        if(OPMClient.AppsApmDetailsController.apmInstalled) {
            var apmAlarmUrl = redirectToAPMFrmAlarm(rowdata.pollID, true);
            returnText += "<a href='" + apmAlarmUrl + "' ><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        } else {
            returnText += "<p>"+escapeHTML(rowdata.displayName)+"</p>";//No I18N
        }
    }
    else if((entity.indexOf('Central_ArchiveFiles_Unprocessed') > -1) || (rowdata.category !== undefined && rowdata.category === "Probe") || (entity.indexOf("AlarmProfile") > -1) || rowdata.category === "External Object" || (rowdata.category !== undefined && rowdata.category === "RemoteCollector")) {
        returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "'><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a>"; //No I18N
        returnText += "<p>"+escapeHTML(rowdata.displayName)+"</p>";//No I18N
    }
	else if(eventType.indexOf("NFA_") > -1) { //NO I18N
        returnText += "<div class='alarm-row'><span class='statusColor severity_"+rowdata.severity+"'></span><h3 class='cursorPointer' onclick='redirectToAlarm(\""+rowdata.alarmId+"\")' >"+escapeHTML(rowdata.message)+"</h3>"; //NO I18N
		var alarmData = {entity: entity, ALARMCODE: rowdata.alarmCode, category: rowdata.category};
		if(nfa_hideRedirectLinkinAlarm(alarmData)) {
			returnText += "<p>"+escapeHTML(rowdata.displayName)+"</p>"; //NO I18N
		}else {
			if(rowdata.alarmCode === "NFA_Security_Analytics") {
				returnText += "<p class='cursorPointer' onclick='nfa_redirectAlarmToASAM(\""+entity+"\"\)'>"+escapeHTML(rowdata.displayName)+"</p>"; //NO I18N
			}else {
				var snapshotType = nfa_getSnapshotTypeFromAlertEntity(entity);
				returnText += "<p class='cursorPointer' onclick='redirectToSnapshot(\""+snapshotType+"\"\,\""+rowdata.source+"\")'>"+escapeHTML(rowdata.displayName)+"</p>"; //NO I18N
			}
		}
	}
	else if(eventType === "Security Analytics") { //NO I18N
		returnText += "<div class='alarm-row'><span class='statusColor severity_"+rowdata.severity+"'></span><h3 class='cursorPointer' onclick='redirectToAlarm(\""+rowdata.alarmId+"\")' >"+escapeHTML(rowdata.message)+"</h3>"; //NO I18N
		returnText += "<p>"+escapeHTML(rowdata.displayName)+"</p>"; //NO I18N
	}
    else if(rowdata.category!=undefined && rowdata.category === "WanIPSite") {
        returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + wanSiteUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
    }
    else if(rowdata.category!=undefined && rowdata.category=== "WanIP") {
      returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + wanLinkUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
    }
    else if(rowdata.category!=undefined && rowdata.category=== "Group") {
        var groupType = rowdata.actionType === "device" ? "Device" : rowdata.actionType === "interface" ? "Interface" : "Group"; //No I18N
        var groupUrl =  redirectotGroupsSnapshot(escapeHtmlTags(rowdata.source), groupType, true);
        returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "' ><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + groupUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
    }
    else
        {
            returnText += "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='" + alarmUrl + "'><h3 class='cursorPointer'>"+escapeHTML(rowdata.message)+"</h3></a><a href='" + deviceUrl + "'><p class='cursorPointer'>"+escapeHTML(rowdata.displayName)+"</p></a>";//No I18N
        }

    returnText += "<p>" + (rowdata.technician !== undefined ? rowdata.technician + " | " : "") + rowdata.ttime+"</p></div>";//No I18N
    return returnText; //No I18N
    }
}
function detailsGrid(cellValue, options, rowdata, action)
{
    var returnText = '';
     var url = redirectToInterfSnapshot(rowdata[5],undefined, true);
    if(window.OPM.userPermissions.intfGroupRestricted){
	    returnText += "<div class='alarm-row'><h3 class='cursorPointer'><a href=\' " + url + "\' >"+escapeHTML(rowdata[1])+"</a></h3><p>"+opm_escapeHTML(rowdata[0])+"</p>";//No I18N
        returnText += "<p> "+Ember.I18n.t("webclient.devices.intftypes.errors",this)+"  : "+opm_escapeHTML(rowdata[2])+"  |  "+Ember.I18n.t("webclient.devices.intftypes.discards",this)+" : "+opm_escapeHTML(rowdata[3])+"</p></div>";//No I18N
    }else{
        var deviceUrl = redirectToDeviceSnapshot(rowdata[4], undefined, undefined, undefined, true);
        returnText += "<div class='alarm-row'><h3 class='cursorPointer'><a href=\'" + url + "\' >"+escapeHTML(rowdata[1])+"</h3><p class='cursorPointer'><a href=\' " + deviceUrl + "\'>"+opm_escapeHTML(rowdata[0])+"</p>";//No I18N
        returnText += "<p> "+Ember.I18n.t("webclient.devices.intftypes.errors",this)+"  : "+opm_escapeHTML(rowdata[2])+"  |  "+Ember.I18n.t("webclient.devices.intftypes.discards",this)+" : "+opm_escapeHTML(rowdata[3])+"</p></div>";//No I18N
    }
    return returnText; //No I18N
}

function topnbwDetailsGrid(cellValue, options, rowdata, action)
{
    var returnText = '';
    if(window.OPM.userPermissions.intfGroupRestricted){
        returnText += "<div class='alarm-row'><h3 class='cursorPointer' onclick='redirectToInterfSnapshot(\""+rowdata.name+"\")' >"+escapeHTML(rowdata.interfaceDisplayName)+"</h3><p>"+opm_escapeHTML(rowdata.displayName)+"</p>";//No I18N
        returnText += "<p> "+Ember.I18n.t("webclient.devices.details.rx",this)+" : "+rowdata.rxTraffic+"  |  "+Ember.I18n.t("webclient.devices.details.tx",this)+" : "+rowdata.txTraffic+"</p></div>";//No I18N
    }else{
	   returnText += "<div class='alarm-row'><h3 class='cursorPointer' onclick='redirectToInterfSnapshot(\""+rowdata.name+"\")' >"+escapeHTML(rowdata.interfaceDisplayName)+"</h3><p class='cursorPointer' onclick='redirectToDeviceSnapshot(\""+rowdata.deviceName+"\")'>"+opm_escapeHTML(rowdata.displayName)+"</p>";//No I18N
        returnText += "<p> "+Ember.I18n.t("webclient.devices.details.rx",this)+" : "+rowdata.rxTraffic+"  |  "+Ember.I18n.t("webclient.devices.details.tx",this)+" : "+rowdata.txTraffic+"</p></div>";//No I18N
    }
    return returnText; //No I18N
}
function setAvailBgr(cellValue, options, rowdata, action)
{
    var availability = parseInt(rowdata.availability);
    if(rowdata.Availability !== undefined)
    {
        availability = parseInt(rowdata.Availability);
    }
    return '<div class="severity-container"><div><div class="utrow severity_5" data-value="'+availability+'" style="width: '+availability+'%;"></div></div><span>'+availability+'%</span></div>';//No I18n
}
function setPercentageBar(cellValue, options, rowdata, action){
    var value = parseInt(cellValue);
    if(value > 100){
        value = 100
    }
    return  '<div class="severity-container"><div><div class="utrow severity_5" data-value="'+opm_escapeHTML(cellValue)+'" style="width: '+opm_escapeHTML(value)+'%;"></div></div><span>'+opm_escapeHTML(cellValue)+'</span></div>';//No I18n
}
function opm_appendUnits(cellValue, options, rowdata, action)
{
    return '<div><span>'+cellValue+'</span></div>';
}
function setIntervalField(cellValue, options, rowdata, action)
{
    return "<input type='text' maxLength='4' class='numberCheck' size='5' value='"+opm_escapeHTML(cellValue)+"' id='"+opm_escapeHTML(rowdata.name)+"_INTERVAL' />"; //No I18n
}
function setThresholdField(cellValue, options, rowdata, action)
{
    return "<input type='text' size='5' class='numberCheck' value='"+opm_escapeHTML(cellValue)+"' id='"+opm_escapeHTML(rowdata.name)+"_THRESHOLDVALUE'/>"; //No I18n
}
function ADMonitorssetThresholdField(cellValue, options, rowdata, action)
{
	var thresholdValue = cellValue ? cellValue.thresholdValue : "N/A";//No I18n
	return "<input type='text' size='5' class='numberCheck' value='"+opm_escapeHTML(thresholdValue)+"' id='"+opm_escapeHTML(rowdata.name)+"_THRESHOLDVALUE'/>"; //No I18n
}
function configletActionRenderer(cellValue, options, rowdata, action) {
    var imgUrl = "/apiclient/fluidicv2/img/ncm/icon_execute.gif";//No I18N
    var txt = Ember.I18n.t("jsp.commonstr.Execute",this);//No I18N
    var str = ""+cellValue;
    if(str.indexOf('FILE_TRANSFER_MODE') != -1) {//No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/icon_download.gif";//No I18N
        txt = Ember.I18n.t("ncm.mid.Upload",this);//No I18N
    } else if(rowdata[2] == 'system' && rowdata[1].indexOf('FlowExport') != -1) {
        return Ember.I18n.t("webclient.ncm.eol.na",this); // No I18N
    }
    return '<img class="inv_opr" src="'+imgUrl+'"></img><label>' + txt +'</label>';//No I18N
}
function ncmConfigletHistoryShowRESTIcon(){
	return "<div class='opmFormTitle2' style='clear: none;float: left;width: auto;padding-right: 9px;padding-top: 10px;font-size: 14px;border:none;'>"+Ember.I18n.t('webclient.common.widgets.show',this)+"</div><div style='clear: none;float: left;margin-right: 29px;'><div class='allGreen enableDisableBtn' style='margin-top: 3px; height:31px;'><input type='checkbox' id='changeConfigletExecutionHistory' checked onclick='changeConfigletExecutionHistory()' name=''><label><i>CLI</i><i>REST</i></label></div></div>";
}
function ncmDeviceTemplateShowCustomIcon(isDeviceTemplate){
    return "<div class='opmFormTitle2' style='clear: none;float: left;width: auto;padding-right: 9px;padding-top: 10px;font-size: 14px;border:none;'>"+Ember.I18n.t('webclient.common.widgets.show',this)+"</div><div style='clear: none;float: left;margin-right: 29px;'><div class='allGreen enableDisableBtn' style='margin-top: 3px; height:31px;'><input type='checkbox' id='changeDevTemplateCustom' checked onclick='changeNCMDevTemplateCustom("+isDeviceTemplate+")' name=''><label><i>"+((isDeviceTemplate)?Ember.I18n.t('webclient.maps.allcategs',this):Ember.I18n.t('webclient.admin.timeformat.default',this))+"</i><i>"+Ember.I18n.t('webclient.admin.timeformat.custom',this)+"</i></label></div></div>";
}
function intfTemplateShowCustomIcon(){
    return "<div class='opmFormTitle2' style='clear: none;float: left;width: auto;padding-right: 9px;padding-top: 10px;font-size: 14px;border:none;'>"+Ember.I18n.t('webclient.common.appmanager.type.text',this)+"</div><div style='clear: none;float: left;margin-right: 29px;'><div class='allGreen enableDisableBtn' style='margin-top: 3px; height:31px;'><input type='checkbox' id='intfTypeList' checked onclick='changeIntfList();' name=''><label><i>"+Ember.I18n.t('webclient.maps.allcategs',this)+"</i><i>"+Ember.I18n.t('webclient.intf.common',this)+"</i></label></div></div>";//No I18N
}
// function NBAShowCustomIcon(){
//     return "<div class='opmFormTitle2' style='clear: none;float: left;width: auto;padding-right: 9px;padding-top: 10px;font-size: 14px;border:none;'>"+Ember.I18n.t('webclient.common.widgets.show',this)+":</div><div style='clear: none;font: 14px LatoRegular;float: left;margin-right: 29px;'><div class='allGreen enableDisableBtn' style='margin-top: 3px; height:31px;width: 250px'><input type='checkbox' id='status' value='true' onclick='OPMClient.Settings.NbaManageRedirect()'><label><i>"+Ember.I18n.t('webclient.settings.enableList',this)+"</i><i>"+Ember.I18n.t('webclient.settings.disableList',this)+"</i></label></div></div>";
// }
function discoveryReportIcon(){
	return "<div class='opmFormTitle2' style='clear: none;float: left;width: auto;padding-right: 9px;padding-top: 10px;font-size: 14px;border:none;'></div><div style='clear: none;float: left;margin-right: 29px;'><div class='allGreen enableDisableBtn' style='margin-top: 3px; height:31px;'><input type='checkbox' id='toggleDiscoveryProfile' onclick='toggleDiscProfReports();' checked><label><i>"+Ember.I18n.t('webclient.common.intro.Reportsheading',this)+"</i><i>"+Ember.I18n.t('webclient.discovery.profiles',this)+"</i></label></div></div>";//No I18N
}
function pendingDeviceActions(){
    return "<div class='opmBtn addUserBtn' onclick=''>"+Ember.I18n.t('webclient.settings.associatecredential',this)+"</div><div class='opmBtn addUserBtn' onclick=''>"+Ember.I18n.t('webclient.admin.delete.association.trailertitle',this)+"</div>";//No I18N
}

function NFALicence(name,task,isWlc){
    return "<div class='opmBtn addUserBtn' id ='"+task+"Btn' onclick='OPMClient.Settings.NFAupdateLicenseMgmt(\""+task+"\");'>"+name+"</div>";//No I18N
}

// function NBALicence(name,task){
//     return "<div class='opmBtn addUserBtn' id ='"+task+"' onclick='OPMClient.Settings.NBAupdateLicenseMgmt(\""+task+"\")'>"+name+"</div>";//No I18N
// }

function ncmTerminalDeviceAuditShowCustomIcon(){
    return "<div class='selBoxOpmBtnHldrTop'><label style='font-family: BitterRegular;font-size: 14px; margin-right: 10px;'>"+Ember.I18n.t('webclient.admin.devices.DeviceType',this)+"</label><div class='selBox'><div><select class='select2' id='deviceType' type='single' onchange='OPMClient.Settings.NCMListTerminalAuditHist()'> <option value='All' selected>" + Ember.I18n.t("opu.common.ALL") + "</option> <option value='Custom'>" + Ember.I18n.t("webclient.terminal.custom") + "</option> <option value='Inventoried'>" + Ember.I18n.t("webclient.terminal.inventoried") + "</option> </select></div></div></div>";
}

/* NCM Formatter */
function scheduleTypeFormatter(cellValue, options, rowdata, action) {
    if(cellValue == "Custom Template") {
        cellValue = "Configlets"; // No I18N
    }
    return escapeHTML(cellValue);
}
function disasterTypeFormatter(cellValue, options, rowdata, action) {
    cellValue = (cellValue == "MANUAL") ? Ember.I18n.t("ncm.tools.DisasterRecoveryTransformer.OnDemand",this) : cellValue; //No I18N
    return cellValue;
}
function uploadRequestFormatter(cellValue, options, rowdata, action) {
    var imgUrl = "/apiclient/fluidicv2/img/ncm/current_version.gif";//No I18N
    var str = cellValue;
    if(cellValue == 'Draft Upload') {//No I18N
        return '<u>' + cellValue +'</u>';//No I18N
    }
    return cellValue;
}

function schNameFormatter(cellValue, options, rowdata, action){
	return scheduleNameFormatter(cellValue, options, rowdata, action, 9, true);
}

function schAuditFormatter(cellValue, options, rowdata, action){
	return scheduleNameFormatter(cellValue, options, rowdata, action, 12, false);
}

function scheduleNameFormatter(cellValue, options, rowdata, action, isCentralReportColIndex, scheduleGrid) {
	cellValue = escapeHTML(cellValue);
    var isCentralReport = rowdata[isCentralReportColIndex];
    if (scheduleGrid) {
        if (ncmIsCentral() || ncmIsProbeOrProbeSelected()) {
            if (isCentralReport === 'true' || isCentralReport === true) {
                cellValue += '<span style="margin-top:0;" class="buildType pull-right" title="Central">' + (ncmIsCentral()? "P" : "C") + '</span>';
            }
        }
    } else {
        if (ncmIsProbeOrProbeSelected() && (isCentralReport === 'true' || isCentralReport === true)) {
            cellValue += '<span style="margin-top:0;" class="buildType pull-right" title="Central">C</span>';
        }
    }
	return cellValue;
}
/* NCM Formatter */

//OpUtils Formatter Starts from here

function routerDelete(cellValue, options, rowdata, action)
{
    return "<i class='meicon-discovery-reports' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('opu.gs.DiscoverSubnet',this)+"' onclick='routerActions(&#39;discoverIPv4Subnets&#39;,&#39;"+rowdata['router-id']+"&#39;)'></i><i class='icon-scanSubnet' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='routerActions(&#39;scanRouters&#39;,&#39;"+rowdata['router-id']+"&#39;)'></i><i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='routerActions(&#39;deleteRouters&#39;,&#39;"+rowdata['router-id']+"&#39;)'></i>"; //No I18n
}
function subnetDeleteScan(cellValue, options, rowdata, action)
{
	if(OPMClient.InventoryOpUtilsController.hideSubnetActions){
		return "<i class='icon-trash' style='font-size: 15px; cursor:pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='ipamSubnetActions(&#39;subnetid&#39;,&#39;ipamsubnet_deleteIcon&#39;,&#39;"+rowdata.subnetid+"&#39;)'></i>"; //No I18n
	}else{
		return "<i class='icon-ping3' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='ipamSubnetActions(&#39;subnetid&#39;,&#39;ipamsubnet_scanIcon&#39;,&#39;"+rowdata.subnetid+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='ipamSubnetActions(&#39;subnetid&#39;,&#39;ipamsubnet_deleteIcon&#39;,&#39;"+rowdata.subnetid+"&#39;)'></i>"; //No I18n
	}
}

function subnetDeleteIcon(cellValue, options, rowdata, action){
    return "<i class='icon-trash' style='font-size: 15px; cursor:pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteSubnetsInWidget(\""+options.gid+"\",&#39;"+rowdata.subnetid+"&#39;)'></i>"; //No I18n
}

function subnetDeleteIconListView(cellValue, options, rowdata, action){
    return "<i class='icon-trash' style='font-size: 15px; cursor:pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='ipamSubnetActions(&#39;subnetid&#39;,&#39;ipamsubnet_deleteIcon&#39;,&#39;"+rowdata.subnetid+"&#39;)'></i>"; //No I18n
}

function subnetDeleteEditIcon(cellValue, options, rowdata, action){
    var wid=options.gid.split("opm_DeviceSnapList")[1]
    if(window.OPM.isCentralServer){
        return "";
    }else{
         if(window.OPM.userPermissions.ipamWrite){
            return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanSubnets(undefined,undefined,\""+wid+"\",&#39;"+rowdata.subnetid+"&#39;)'></i><i class='icon-configedit' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='editSubnetInWidget(\""+options.gid+"\",&#39;"+rowdata['subnetid']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer' title='Delete' onclick='deleteSubnetsInWidget(\""+options.gid+"\",&#39;"+rowdata.subnetid+"&#39;)'></i>"; //No I18n
        }
        if(window.isoperator){
            return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanSubnets(undefined,undefined,\""+wid+"\",&#39;"+rowdata.subnetid+"&#39;)'></i>";//No I18n
        }
        if(!window.OPM.userPermissions.ipamWrite && window.OPM.userPermissions.ipamRead){
            return "";
        }
    }

}

function policyDeleteEditIcon(cellValue, options, rowdata, action){
    var wid=options.gid.split("opm_DeviceSnapList")[1]
    if(window.OPM.isCentralServer){
        return "";
    }else{
        if(window.OPM.userPermissions.ipamWrite){
            return "<i class='icon-configedit' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='editPolicyInWidget(\""+options.gid+"\",&#39;"+rowdata['dhcpServer-id']+"&#39;,&#39;"+rowdata['policy-id']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer' title='Delete' onclick='deletePolicyInWidget(\""+options.gid+"\",&#39;"+rowdata['policy-id']+"&#39;,&#39;"+rowdata['dhcpServer-id']+"&#39;)'></i>"; //No I18n
        }
        if(!window.OPM.userPermissions.ipamWrite && window.OPM.userPermissions.ipamRead){
            return "";
        }
    }
}

function superscopeDeleteEditIcon(cellValue, options, rowdata, action){
    var wid=options.gid.split("opm_DeviceSnapList")[1]
    if(window.OPM.isCentralServer){
        return "";
    }else{
        if(window.OPM.userPermissions.ipamWrite){
            return "<i class='icon-configedit' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='editSuperscopeInWidget(\""+options.gid+"\",&#39;"+rowdata.dhcpServerId+"&#39;,&#39;"+rowdata['superscope-id']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer' title='Delete' onclick='deleteSuperscopeInWidget(\""+options.gid+"\",&#39;"+rowdata['superscope-id']+"&#39;,&#39;"+rowdata.dhcpServerId+"&#39;)'></i>"; //No I18n
        }
        if(!window.OPM.userPermissions.ipamWrite && window.OPM.userPermissions.ipamRead){
            return "";
        }
    }
}

function scopeDeleteEditIcon(cellValue,options,rowdata, action){
   var wid=options.gid.split("opm_DeviceSnapList")[1]
    if(window.OPM.isCentralServer){
        return "";
    }else{
        if(window.OPM.userPermissions.ipamWrite){
            return "<i class='icon-configedit' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='editScopeInWidget(\""+options.gid+"\",&#39;"+rowdata['dhcp-scope-id']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer' title='Delete' onclick='deleteScopeInWidget(\""+options.gid+"\",&#39;"+rowdata['dhcp-scope-id']+"&#39;)'></i>"; //No I18n
        }
        if(!window.OPM.userPermissions.ipamWrite && window.OPM.userPermissions.ipamRead){
            return "";
        }
    }
}

function DHCPDeleteEditIcon(cellValue, options, rowdata, action){
    if(!window.OPM.isCentralServer){
        var wid=options.gid.split("opm_DeviceSnapList")[1];
        if(rowdata['scan-status-int']==="5"){
            if(window.OPM.isAuthorized){
                return "<i class='icon-trash' style='font-size: 15px; cursor:pointer'  title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i>";
            }else{
                return "";
            }
        }
        else if(rowdata['server-type-int']==1 || rowdata['server-type-int']==6){
            if(window.OPM.isAuthorized){
                return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer'  title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i>"; //No I18n
            }else{
                return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i>"; //No I18n
            }
        }else{
            if(window.OPM.isAuthorized){
                return "<i class='icon-configedit'  style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('webclient.title.edit',this)+"'  onclick='editDHCPServer(\""+options.gid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;,&#39;"+rowdata['server-type-int']+"&#39;)'></i><i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer'  title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i>"; //No I18n
            }else{
                return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanDHCP(undefined,undefined,\""+wid+"\",&#39;"+rowdata['dhcp-server-address']+"&#39;)'></i>"; //No I18n
            }
        }
    }else{
        return "";
    }
}

function dnsStatusFormat(cellValue, options, rowdata, action){
    if(window.isoperator){
        return "";
    }
    else if(window.OPM.isCentralServer){
        return "";
    }else{
        if(rowdata['dns-status-int']==="2" && OPMClient.InventoryOpUtilsController.isWindowsDNSServerAdded){
            return "<i style='color: #3996dd;' class='cursorPointer' onclick='addMissingDNSRecord(&#39;"+rowdata['ip-address']+"&#39;,&#39;"+options.gid+"&#39;,&#39;"+options.rowId+"&#39;)'>"+cellValue+"</i>";//No I18N
        }
        else {
            return cellValue;
        }
    }
}
function DNSDeleteEditIcon(cellValue, options, rowdata, action){
    if(window.isoperator){
        return "";
    }
    else if(window.OPM.isCentralServer){
        return "";
    }else{
        var wid=options.gid.split("opm_DeviceSnapList")[1];
        if(rowdata['dnsScanStatus']==="5"){
            return "<i class='icon-trash' style='font-size: 15px; cursor:pointer'  title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNS(undefined,undefined,\""+wid+"\",&#39;"+rowdata['DNSServerAddress']+"&#39;)'></i>";
        }
        else {
            return "<i class='icon-scanSubnet' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;'  title='"+Ember.I18n.t('opu.views.SCAN',this)+"' onclick='scanDNS(undefined,undefined,\""+wid+"\",&#39;"+rowdata['DNSServerAddress']+"&#39;)'></i><i class='icon-trash' style='font-size: 15px; cursor:pointer'  title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNS(undefined,undefined,\""+wid+"\",&#39;"+rowdata['DNSServerAddress']+"&#39;)'></i>"; //No I18n
        }
    }
}

function DNSZoneConfigurationIcon(cellValue, options, rowdata, action){
    if(window.isoperator){
            return "";
    }
    else if(window.OPM.isCentralServer){
         return "";
    }else{
        var wid=options.gid.split("opm_DeviceSnapList")[1];
        var isAws = (rowdata['dns-server-type-int'] === '2' || rowdata['dns-server-type-int'] === 2); //No I18N
        var isGcp = (rowdata['dns-server-type-int'] === '3' || rowdata['dns-server-type-int'] === 3); //No I18N
        var zoneId = rowdata['dns-zone-id'] || ''; //No I18N
        var zoneType = rowdata['dns-zone-type'];//No I18N
        if(window.OPM.userPermissions.ipamWrite){
            if (isAws) {
                var addRecordIcon = "<em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('jsp.commonstr.Add',this)+ ' ' +Ember.I18n.t('opu.ipam.records',this)+"' onClick='addZoneRecord(&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;Forward&#39;,true,&#39;"+zoneId+"&#39;);'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#file-add'></use></svg></em>"; //No I18N
                var deleteZoneIcon = "<em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNSZone(\""+options.gid+"\",&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;"+zoneId+"&#39;)'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#Trash'></use></svg></em>"; //No I18N
                return addRecordIcon + deleteZoneIcon;
            }
            if (isGcp ) {
                var gcpAddRecordIcon = "<em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('jsp.commonstr.Add',this)+ ' ' +Ember.I18n.t('opu.ipam.records',this)+"' onClick='addZoneRecord(&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;Forward&#39;,&#39;gcp&#39;,&#39;"+zoneId+"&#39;);'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#file-add'></use></svg></em>"; //No I18N
                var gcpDeleteZoneIcon = "<em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNSZone(\""+options.gid+"\",&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;"+zoneId+"&#39;)'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#Trash'></use></svg></em>"; //No I18N
                if(zoneType === 'Public' ){
                    return gcpAddRecordIcon + gcpDeleteZoneIcon;
                }
                else if(zoneType === 'Private'){
                    return gcpDeleteZoneIcon;
                }
                else{
                    return "";
                }
            }
            if(rowdata['dns-zone-type'] === 'Primary' && !rowdata['dns-zone-name'].includes('.ip6.arpa')){
                return "<em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('webclient.cit.advancedconfiguration',this)+"' onClick='zoneConfiguration1(&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;);'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#BV-settings'></use></svg></em><em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('jsp.commonstr.Add',this)+ ' ' +Ember.I18n.t('opu.ipam.records',this)+"' onClick='addZoneRecord(&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;"+rowdata['dns-zone-look-up-type']+"&#39;,false,&#39;"+zoneId+"&#39;);'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#file-add'></use></svg></em><em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNSZone(\""+options.gid+"\",&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;"+zoneId+"&#39;)'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#Trash'></use></svg></em>"
            }else{
                return "<em class='svgIcon size16 mr-xs'><svg><use></use></svg></em><em class='svgIcon size16 mr-xs'><svg><use></use></svg></em><em class='svgIcon size16 mr-xs pointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteDNSZone(\""+options.gid+"\",&#39;"+rowdata['dns-server-address']+"&#39;,&#39;"+rowdata['dns-zone-name']+"&#39;,&#39;"+zoneId+"&#39;)'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#Trash'></use></svg></em>"
            }
        }
    }
}
function DNSrecordsIcon(cellValue, options, rowdata, action){
    if(window.isoperator){
        return "";
    }
    else if(window.OPM.isCentralServer){
        return "";
    } else {
        var editAndDeleteTypes = ["A", "AAAA", "CNAME", "SRV", "MX", "PTR"]; //No I18N
        var editOnlyTypes      = ["NS"]; //No I18N
        var deleteOnlyTypes    = [];
        var recordType = rowdata['dns-record-type']; //No I18N
        var isAws = (rowdata['dns-server-type-int'] === '2' || rowdata['dns-server-type-int'] === 2); //No I18N
        var isGcp = (rowdata['dns-server-type-int'] === '3' || rowdata['dns-server-type-int'] === 3); //No I18N
        var isMicrosoft = (rowdata['dns-server-type-int'] === '1' || rowdata['dns-server-type-int'] === 1); //No I18N

        if (!window.OPM.userPermissions.ipamWrite) {
            return "";
        }
        var zType = (rowdata['dns-zone-type'] || '').toString().toLowerCase(); //No I18N
        var deleteIcon = "<i class='icon-trash pointer' style='font-size: 15px' title='" + Ember.I18n.t('webclient.action.delete', this) + "' onclick='deleteDNSRecord(\"" + options.gid + "\",&#39;" + rowdata['dns-record-id'] + "&#39;)'></i>"; //No I18N
        var editIcon   = "<i class='icon-configedit pointer' style='font-size: 15px' title='" + Ember.I18n.t('nfa.reports.modify', this) + "' onclick='ipamDNSRecordEdit(&#39;" + options.gid + "&#39;,&#39;" + options.rowId + "&#39;)'></i>"; //No I18N
        var editSpacer = "<i class='icon-configedit' style='font-size: 12px; visibility:hidden; margin-right:5px'></i>"; //No I18N
        if (isMicrosoft) {
            if (zType !== 'primary') { return ''; }
        }
        if (isAws) {
            var awsSupported = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "PTR"]; //No I18N
            if (awsSupported.indexOf(recordType) !== -1) {
                return editIcon + deleteIcon;
            }
            return "";
        }

        if (isGcp) {
            // GCP Cloud DNS: SOA/NS rrsets are managed by GCP and cannot be edited via the API.
            if (zType == 'private') { return ''; }
            var gcpSupported = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "PTR", "CAA", "SPF"]; //No I18N
            if (gcpSupported.indexOf(recordType) !== -1) {
                return editIcon + deleteIcon;
            }
            return "";
        }

        if (editAndDeleteTypes.indexOf(recordType) !== -1) {
            return editIcon + deleteIcon;
        } else if (editOnlyTypes.indexOf(recordType) !== -1) {
            return editIcon;
        } else if (deleteOnlyTypes.indexOf(recordType) !== -1) {
            return editSpacer + deleteIcon;
        }
        return "";
    }
}

function subnetApprove(cellValue, options, rowdata, action){
	if(rowdata['scan-status-int']==3){
		return "<a style='color:#0099ff' onclick=subnetApproveFunc(&#39;"+rowdata['subnet-address']+"&#39;,\""+options.gid+"\")>"+rowdata['scan-status']+"</a>"
	}
	return cellValue;
}
function schedulerDelete(cellValue, options, rowdata, action)
{
    var taskId = rowdata['task-id'];//NO I18N
	var taskName = rowdata['task_name'];//NO I18N
    if(taskId != 1 && taskId != 2 && taskId != 3 && taskName.toLowerCase() != 'default group'  && taskName.toLowerCase() != 'default task' && taskName.toLowerCase() != 'default ipv4 task' && taskName.toLowerCase() != 'default ipv6 task'){ //NO I18N
        return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteSchedulerTask(&#39;"+rowdata['tool-id']+"&#39;,&#39;"+rowdata['task-id']+"&#39;)'></i>"; //No I18n
    }else{
        return "";//No I18N
    }
}
function wolSchedulerDelete(cellValue, options, rowdata, action)
{
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteWOLSchedulerTask(&#39;"+rowdata.taskId+"&#39;)'></i>"; //No I18n
}
function routerActions(operation,selectedRouter)
{
    var message = "";//No I18N
    if(selectedRouter === undefined){
        selectedRouter = getEmberSelectedRows("DECredProfList","router-id");//NO I18N
    }
    var flag = false;
    if(operation === 'deleteRouters'){
        if(selectedRouter.length === 0){
            alert(Ember.I18n.t('opu.views.Select_router',this));//NO I18N
        }else{
            if(confirm(Ember.I18n.t('webclient.common.deleteconfirmation',this)+" "+Ember.I18n.t('webclient.admin.alarmesc.routers',this)+"?")){//No I18N
                flag = true;
                message = Ember.I18n.t("webclient.api.deletedevice.success",this);//No I18N
            }
        }
    }else if(operation === 'Search'){
        if(!$('.opm_jqGridUI .ui-jqgrid-view').hasClass('gridSearchActive'))
        {
            $('.opm_jqGridUI .ui-jqgrid-view').addClass('gridSearchActive');
            opm_basicSearchEnable(true)
        }
        else
        {
            opm_basicSearchEnable(false);
            $('.opm_jqGridUI .ui-jqgrid-view').removeClass('gridSearchActive');
        }
    }else if(operation === 'discoverIPv4Subnets'){//NO I18N
        if(selectedRouter.length === 0){
            alert(Ember.I18n.t('opu.views.Select_router',this));//NO I18N
        }else{
            var response = opm_ajaxGetRequest(window.OPM.apiUrlPattern + "/rogue/"+operation,{"ID":selectedRouter}); //No I18N
            message = Ember.I18n.t('opu.views.discover_subnets_initiated',this);//No I18N
            showOpUtilsResponse(response.data,"getRouterData","","",message);//No I18N
        }
    }
    else{
        if(selectedRouter.length === 0){
            alert(Ember.I18n.t('opu.views.Select_router',this));//NO I18N
        }else{
            flag = true;
            message = Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
        }
    }
    if(flag){
    	var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/rogue/"+operation,{"ID":selectedRouter}); //No I18N
        showOpUtilsResponse(response,"getRouterData","","",message);//No I18N
    }

}
function ruleEngineDeleteFormatter(cellValue, options, rowdata, action){
    var disabledClass = "";
    if(window.OPM.isProbe && rowdata.isProbeProfile !== undefined && rowdata.isProbeProfile == "SYNCED"){
        disabledClass="alarmProfileDisabled";//No I18N
    }
	return "<i class='discIcon discCopyIcon' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.admin.re.copyre',this)+"' onclick='copyRuleEngine(&#39;"+rowdata.ruleid+"&#39;)'></i><i class='discIcon discDeleteIcon "+disabledClass+"' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick='deleteRuleEngine(&#39;"+rowdata.ruleid+"&#39;,&#39;"+rowdata.isProbeProfile+"&#39;)'></i>"; //No I18n
}
function copyRuleEngine(ruleId){
    OPMClient.SettingsTabController.set('ruleId',ruleId);//No I18N
    if(OPMClient.DiscoveryWizardAddEditController.fromDiscoveryRule)
    {
        opm_transitionToTheRoute("Settings.Network.Discovery.Copy"); //NO I18N
    }
    else
    {
    	location.href = window.OPM.apiclientUrl+"Settings/Discovery/RuleEngine/Copy";//No I18N
	}
}
function ruleEngineEnableDisable(cellValue, options, rowdata, action){
    var disabledClass = "";
    if(window.OPM.isProbe && rowdata.isProbeProfile !== undefined && rowdata.isProbeProfile == "SYNCED"){
        disabledClass="alarmProfileDisabled";//No I18N
    }
    //chkRoundBtn
    if(cellValue==1){
            return "<div class='chkRoundBtn "+disabledClass+"'><input type='checkbox' onclick='changeRuleStatus(this,"+rowdata.ruleid+")' checked name=''><label></label></div>";//No I18N
    }
    else {
            return "<div class='chkRoundBtn "+disabledClass+"'><input type='checkbox' onclick='changeRuleStatus(this,"+rowdata.ruleid+")' name=''><label></label></div>";//No I18N
    }
}
function scheduleDiscoveryEnableDisable(cellValue, options, rowdata, action){
    //chkRoundBtn
    if(cellValue=="true"){
            return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeDiscoveryStatus(this,"+rowdata.profileId+")' checked name=''><label></label></div>";//No I18N
    }
    else {
            return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeDiscoveryStatus(this,"+rowdata.profileId+")' name=''><label></label></div>";//No I18N
    }
}
function jqGridHTMLEncode(cellValue, options, rowdata, action) {
    return $.jgrid.htmlEncode(cellValue);
}
function setRefreshIcon(cellvalue, options, rowObject) {
    var str = ""; //NO I18N
    if(rowObject.showUserStatusRefresh !== undefined) {
        str += rowObject.showUserStatusRefresh === true ? "<a style='float:left;color:green;' class='m-sm pointer' id='syncUserStatus' data-name='" + escapeHTML(rowObject.DOMAINNAME) + "' data-title='" + escapeHTML(rowObject.lastSyncTime) + "' title='"+Ember.I18n.t('webclient.domain.refresh.tooltip',this) + " " + Ember.I18n.t("webclient.addomain.refresh.syncTime", {param0: escapeHTML(rowObject.lastSyncTime)})+"'>" + Ember.I18n.t("webclient.admin.servicedesk.Syncnow") + "</a>" : "<span title='"+Ember.I18n.t('webclient.addomain.refresh.disabled',this)+"'><a class='m-sm opmLinkUnderLineHover disabledBlock'>" + Ember.I18n.t("webclient.admin.servicedesk.Syncnow") + "</a>";
    } else {
        str += "<div>" + Ember.I18n.t("ncm.firmvuln.Not_applicable") + "</div>";
    }
    return str;
}

function setAsWindowsDomainAction(cellvalue, options, rowObject)
{
	var str = ""; //NO I18N
	str += '<div class="flex flex-middle-align">';
	if(rowObject.LOGINTYPE == 2){
		str += "<i class='mr-sm pointer' title='" + Ember.I18n.t('webclient.windowsAD.addGroups',this) + "' onclick='addEditWindowsAD(\""+options.rowId+"\",\""+options.gid+"\", true, false)'><em class='svgIcon size14' ><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#plus'></use></svg></em></i>"; //NO I18N
	}
	str += "<i class='pointer' title='"+Ember.I18n.t('webclient.map.flash.delete',this)+"' onclick='deleteDomainController(\""+rowObject.DOMAINNAME+"\")'><em class='svgIcon size14'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#delete'></use></svg></em></i>"; //NO I18N
	return str;
}
function setAsWindowsADSelectedGroupAction(cellvalue, options, rowObject){
	return "<i class='pointer' title='"+Ember.I18n.t('webclient.map.flash.delete',this)+"' onclick='deleteWindowsADSelectedGroup(\""+rowObject.DOMAINNAME+"\",\""+rowObject.GROUPNAME+"\")'><em class='svgIcon size14'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#delete'></use></svg></em></i>"; //NO I18N
}
function addEditWindowsAD(rowId, tableId, isAdd, isDomainSubGrid){
	var rowData = $("#"+tableId).jqGrid("getRowData", rowId); //NO I18N
	if(isAdd && rowData.LOGINTYPE != 2){
		return;
	}
	OPMClient.SettingsAddEditController.pageObj = rowData;
	OPMClient.SettingsAddEditController.pageObj.domainSubGrid = isDomainSubGrid; //NO I18N
	OPMClient.SettingsAddEditController.pageObj.addGroups = isAdd; //NO I18N
	OPMClient.SettingsAddEditController.operation = false;
	opm_transitionToTheRoute("Settings.Basic.Authentication.Domain.AddEdit"); //NO I18N
}
function deleteDomainController(domainName){
    var cFlag = confirm(Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg',this)); //No I18N
    if(cFlag){
        var postParams = new FormData();
        postParams.set("domainName",domainName);//No I18N
	    var rsp = opm_ajaxMultiPostRequest(window.OPM.apiUrlPattern + '/admin/deleteDomain',postParams);//No I18N
		showMessage(rsp);
		if(rsp.result.message != undefined){
			opm_loadDomainControllerList();
		}
    }
}

function deleteWindowsADSelectedGroup(domainName, groupName){
	var message = Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg',this); //NO I18N
	var url = window.OPM.apiUrlPattern + '/admin/deleteDomainSelGroups'; //NO I18N
    var postParams = new FormData();
    postParams.set('domainName',domainName);//NO I18N
    postParams.set('groupName',groupName);//NO I18N
	if(confirm(message)){
		var response = opm_ajaxMultiPostRequest(url,postParams);
		showMessage(response);
		if(response.result.message != undefined){
			opm_loadDomainControllerList();
		}
    }
}
function convertLongToIPAddress(cellValue, options, rowdata, action)
{
    return getIPAddressFrmLong(cellValue);
}
function routerAlertAction(cellValue, options, rowdata, action){
    var tag = "SYS_";//No I18N
    if(options.colModel.name==="isEmailEnabled"){//No I18N
        tag="MAIL_";//No I18N
    }
    if(cellValue === "true" || cellValue === true){//No I18N
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.alertName+"' type='checkbox' onchange='showCorrespondingDiv(&#39;"+options.colModel.name+"&#39;)' checked name='' /><label></label></div>";//No I18N
    }else {
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.alertName+"' type='checkbox' onchange='showCorrespondingDiv(&#39;"+options.colModel.name+"&#39;)' name='' /><label></label></div>";//No I18N
    }
}
function bwmBlockAction(cellValue, options, rowdata, action){
    var tag = "BROADCAST_";//No I18N
    if(options.colModel.name==="isUnicast"){//No I18N
        tag="UNICAST_";//No I18N
    }
    if(cellValue === "1" || cellValue === true){//No I18N
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.interfaceid+"' type='checkbox' checked name='' /><label></label></div>";//No I18N
    }else {
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.interfaceid+"' type='checkbox' name='' /><label></label></div>";//No I18N
    }
}
function nmapScanAction(cellValue, options, rowdata, action){
    var tag = "NMAPOPT_";//No I18N
    if(cellValue === "true" || cellValue === true){//No I18N
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.optionName+"' type='checkbox' onchange='showCorrespondingDiv(&#39;"+options.colModel.name+"&#39;)' checked name='' /><label></label></div>";//No I18N
    }else {
        return "<div class='chkRoundBtn "+options.colModel.name+"'><input id='"+tag+rowdata.optionName+"' type='checkbox' onchange='showCorrespondingDiv(&#39;"+options.colModel.name+"&#39;)' name='' /><label></label></div>";//No I18N
    }
}
function nmapscanoptionsDesc(cellValue, options, rowdata, action){
    if(rowdata.optionName === "EXCLUDE_ECHO_REQUEST"){//No I18N
        return cellValue+'<div><p class="textSmall textGrey">'+Ember.I18n.t('webclient.nmap.echo.request',this)+"</p>";//No I18N
    }else if(rowdata.optionName === "USE_SYSTEM_DNS"){//No I18N
        return cellValue+'<div><p class="textSmall textGrey">'+Ember.I18n.t('webclient.nmap.use.DNS',this)+"</p></div>";//No I18N
    }else if(rowdata.optionName === "DISABLE_ARP_PING"){//No I18N
        return cellValue+'<div><p class="textSmall textGrey">'+Ember.I18n.t('webclient.nmap.Disable.ARP',this)+"</p></div>";//No I18N
    }else if(rowdata.optionName === "SUBNET_DISC_IP_FORWARD_MIB"){//No I18N
        return cellValue+'<div><p class="textSmall textGrey">'+Ember.I18n.t('opu.ipam.settings.discover_subnet_ipforwardmib_desc',this)+'</p></div>';//No I18N
    }else{
    	return cellValue;
	}
}
function setUtilization(cellValue, options, rowdata, action){
    if(rowdata.alertName === "HIGH_PORT_UTL"){//No I18N
        return cellValue+" <a id='HighUtl' onclick=showPortUtilization('portHighUtil','SPM'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.highPortUtil+"%</a>";//No I18N
    }else if(rowdata.alertName === "LOW_PORT_UTL"){//No I18N
        return cellValue+" <a id='LowUtl' onclick=showPortUtilization('portLowUtil','SPM'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.lowPortUtil+"%</a>";//No I18N
    }else if(rowdata.alertName === "IPAM_LOW_IP_UTILIZE"){//No I18N
        return cellValue+" <a id='LowUtl' onclick=showPortUtilization('lowIPUtil','IPAM'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.lowIPUtil+"%</a>";//No I18N
    }else if(rowdata.alertName === "IPAM_HIGH_IP_UTILIZE"){//No I18N
        return cellValue+" <a id='HighUtl' onclick=showPortUtilization('highIPUtil','IPAM'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.highIPUtil+"%</a>";//No I18N
    }else if(rowdata.alertName === "DHCP_SCOPE_UTILIZATION_LOW"){//No I18N
        return cellValue+" <a id='LeaseUtlScopeLow' onclick=showPortUtilization('leastScopeLow','DHCP'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.leastScopeLow+"%</a>";//No I18N
    }else if(rowdata.alertName === "DHCP_SCOPE_UTILIZATION"){//No I18N
        return cellValue+" <a id='LeaseUtlScope' onclick=showPortUtilization('leastScope','DHCP'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.leastScope+"%</a>";//No I18N
    }else if(rowdata.alertName === "DHCP_SERVER_UTILIZATION_LOW"){//No I18N
        return cellValue+" <a id='LeaseUtlServerLow' onclick=showPortUtilization('leastServerLow','DHCP'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.leastServerLow+"%</a>";//No I18N
    }else if(rowdata.alertName === "DHCP_SERVER_UTILIZATION"){//No I18N
        return cellValue+" <a id='LeaseUtlServer' onclick=showPortUtilization('leastServer','DHCP'); style='color:#0099ff'>"+OPMClient.SettingsOpUtilConfigController.leastServer+"%</a>";//No I18N
    }else if(rowdata.alertName === "MAC_MOVED"){//No I18N
        return cellValue+" <a id='MAC_IP_CHANGES' onclick=showPortUtilization('MAC_IP_CHANGES','MAC_IP_CHANGES'); style='color:#0099ff'>("+Ember.I18n.t('opu.ipam.EXCLUDE_MAC',this)+")</a>";//No I18N
    }else{
        return cellValue;
    }
}

function nfa_aclDeleteFormatter(cellvalue, options, rowObject) {
	return "<i class='icon-trash delete pointer' title='"+Ember.I18n.t("webclient.title.delete")+"' style='margin:0 7px;font-size:16px;' onclick='OPMClient.Inventory.deleteClassCriteria(\""+htmlEncode(options.rowId)+"\",\""+htmlEncode(options.gid)+"\")'></i>"; //NO I18N
}

function nfa_aclAndPolicyCmdActions(cellValue, options, rowdata)  {
	var cmdName, cmdType;
	if(options.gid==="ListACLTable") { //NO I18N
		cmdName = htmlEncode(rowdata[1]);
		cmdType = "access-list"; //NO I18N
	}else {
		cmdName = htmlEncode(rowdata.name);
		cmdType = "policy-map"; //NO I18N
	}
	var formatter = "<i class='ui-icon ui-icon-check pointer' title='"+Ember.I18n.t("webclient.common.skins.Apply")+"' style='font-size:16px;' onclick=OPMClient.Inventory.applyCmd('"+cmdName+"','"+htmlEncode(options.gid)+"');></i>"; //NO I18N
	formatter += "<i class='icon-trash delete pointer' title='"+Ember.I18n.t("webclient.title.delete")+"' style='margin:0 15px;font-size:16px;' onclick='OPMClient.Inventory.noCmd(\""+cmdName+"\",\""+cmdType+"\")'></i>"; //NO I18N
	return formatter;
}

function linkCustomUrl(cellvalue, options, rowObject){
    if(opm_isValidUrl(convertHtmlToText(cellvalue)) && !(/[<>"']/.test(cellvalue))){
        return "<a href='"+convertHtmlToText(cellvalue)+"' class='textLink' target='_blank'>"+convertHtmlToText(cellvalue)+"</a>"; //No I18n
    }else{
        return convertHtmlToText(cellvalue);
	}
}
function customURLFormat(cellvalue, options, rowObject) {
    if(opm_isValidUrl(cellvalue))
	{
        return "<a href='"+opm_escapeHTML(cellvalue)+"' target='_blank'>"+opm_escapeHTML(cellvalue)+"</a>"; //No I18n
    }
	else
	{
		return opm_escapeHTML(cellvalue);
    }
}
function deleteCustomUrlLink(cellvalue, options, rowObject) {
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick=deleteCustomUrl('"+escape(rowObject.URL)+"','"+escape(rowObject.NAME)+"','Delete'); data-title='Delete'></i>"; //No I18n
}
function deleteCustomUrl(url, name)
{
    OPMClient.InventoryDeviceDetailsController.url = unescape(url);
    OPMClient.InventoryDeviceDetailsController.name = unescape(name);
    redirectToCustomLink(OPMClient.InventoryDeviceDetailsController.deviceName,'Delete'); //No I18n
}
function showCorrespondingDiv(type){
    var tool = "Rogue";//No I18N
    if(OPMClient.SettingsOpUtilConfigController.isSPM === true){//No I18N
        tool = "SPM.Alerts";//No I18N
    }else if(OPMClient.SettingsOpUtilConfigController.isIPAM === true){//No I18N
        tool = "IPAM.Alerts";//No I18N
    }
    if(type === 'isEmailEnabled'){//No I18N
        var count = 0;
        $(".chkRoundBtn."+type).each(function(key,val){//No I18N
            if($(this).find("input").prop("checked")){
                count++;
            }
        });
        if(count === 0){
            $("#"+type+"Div").hide();//No I18N
        }else{
            if(isMailServerConfigured("Settings.OpUtils."+tool,Ember.I18n.t('webclient.admin.mailserver.message',this)+" "+Ember.I18n.t('opu.common.PLEASE_CONFIGURE',this))){//No I18N
                $("#"+type+"Div").show();//No I18N
            }
        }
    }
}
function deleteSchedulerTask(tool,taskid)
{
    if(confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_DELETE_TASK",this))){//NO I18N
        var dataParams = {"GROUP_ID":taskid};//NO I18N
        var apimethod="";//NO I18N
        if(tool === "IP_ADDRESS_MANAGER"){
            tool = "IPAM";//NO I18N
            apimethod="deleteIPAMScheduler";//NO I18N
            dataParams.ACTION_SOURCE="SubnetGroupConfig";//NO I18N
        }else{
            tool = "SPM";//NO I18N
            apimethod="deleteSPMScheduler";//NO I18N
            dataParams.ACTION_SOURCE="SPMGroupNameConfig";//NO I18N
        }
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/oputilsadmin/"+apimethod,dataParams);//NO I18N
        showOpUtilsResponse(response,"listSchedulerReports",tool,"","Successfully Deleted");//NO I18N
    }
}

function openEditTask(tool, taskName, taskID, isSchedularPage){
    OPMClient.SettingsOpUtilConfigController.set("taskName",taskName);//No I18N
    OPMClient.SettingsOpUtilConfigController.set("uniqueID",taskID);//No I18N
    if(tool === "IP_ADDRESS_MANAGER"){//NO I18N
		if(isSchedularPage){
        	opm_transitionToParentRoute("Settings.OpUtils.Scheduler.IPAM.Operation","Edit");//No I18N
		}else{
        opm_transitionToParentRoute("Settings.OpUtils.IPAM.Scheduler.Operation","Edit");//No I18N
        }
    }else{
        if(isSchedularPage){
        	opm_transitionToParentRoute("Settings.OpUtils.Scheduler.SPM.Operation","Edit");//No I18N
		}else{
        opm_transitionToParentRoute("Settings.OpUtils.SPM.Scheduler.Operation","Edit");//No I18N
    }
}
}

function deleteOpUtilsCustomColumn(tools,colId,colName,table,colorCode){
    var params = {"columnID":colId,"columnName":colName,"tableID":table};//NO I18N
    var url = window.OPM.apiUrlPattern + "/oputilsadmin/deleteIPAMCustomColumn";//NO I18N
    if(tools === "SPM"){//NO I18N
        url = window.OPM.apiUrlPattern + "/oputilsadmin/deleteSPMCustomColumn";//NO I18N
    }
    var confirmDelete = false;
    if(colorCode!=""){
        confirmDelete = confirm(Ember.I18n.t('opu.common.deleteCustomColorColumn',this));//NO I18N
    }
    else{
        confirmDelete = confirm(Ember.I18n.t('js.common.DeleteAlert1',this));//NO I18N
    }
    if(confirmDelete){
        var response = opm_ajaxPostRequest(url,params);
        showOpUtilsResponse(response,"listCustomColumns",tools,"","Successfully Deleted");//NO I18N
        getOpUtilsCustomColumnNames();
        getOpUtilsCustomColumnDetails();
    }
}
function setProcessArgs(cellValue, options, rowdata, action)
{
    return "<span title='"+opm_escapeHTML(rowdata.cmdLineArgs)+"'>"+opm_escapeHTML(cellValue)+"</span>"; //No I18n
}
function setProcessPath(cellValue, options, rowdata, action)
{
    return "<span title='"+opm_escapeHTML(rowdata.path)+"'> "+opm_escapeHTML(cellValue)+"</span>"; //No I18n
}
function setProcessName(cellValue, options, rowdata, action)
{
    return "<span title='"+opm_escapeHTML(rowdata.name)+"'>"+opm_escapeHTML(rowdata.trimName)+"</span>"; //No I18N
}
function deleteFailOverServer(cellvalue, options, rowdata, action) {
    if (rowdata.Servertype === "STANDBY") {
        return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='deleteNat(&#39;"+rowdata.Status+"&#39;)' data-title='Delete'></i>"; //No I18n
    }
    return "";
}

function redirectURL(cellvalue, options, rowdata, action){
    return "<a href='"+rowdata.connectUrl+"' target='_blank'>"+escapeHTML(rowdata.connectUrl)+"</a>";//No I18n
}

function deleteNat(serverStatus){
    if(confirm(Ember.I18n.t('js.common.DeleteAlert1',this))){//No I18n
        if (serverStatus === 'Down'){//No I18n
			var isSuccess = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/deleteFailOverDetails',''); //No I18N
            listFailOverDetails();
			showMessage(isSuccess);
        }
        else{
            alert(Ember.I18n.t('webclient.admin.failover.delete',this)); //No I18n
        }
    }
}
function devDCRLink(cellValue, options, rowdata, action){
    return window.OPM.userPermissions.reportsRead?("<a href='javascript:redirectTodevDCReport(\""+rowdata.Agent+"\",\""+rowdata.Period+"\")'>"+escapeHtmlTags(cellValue)+"</a>"):escapeHtmlTags(cellValue); //No I18N
}
function monDCRLink(cellValue, options, rowdata, action){
    return window.OPM.userPermissions.reportsRead?("<a href='javascript:redirectTomonDCReport(\""+rowdata.Name+"\",\""+rowdata.Period+"\")'>"+cellValue+"</a>"):cellValue; //No I18N
}
function drillDownToDevReport(cellValue, options, rowdata, action){

        return "<div><a class='viewReportsBtn2' href='javascript:redirectTodevDCReport(\""+rowdata.Agent+"\",\""+rowdata.Period+"\")'></a></div>"; //No I18N
}
function drillDownToMonReport(cellValue, options, rowdata, action){

        return "<div><a class='viewReportsBtn2' href='javascript:redirectTomonDCReport(\""+rowdata.Name+"\",\""+rowdata.Period+"\")'></a></div>"; //No I18N
}
function deviceVMSummaryLink(cellValue, options, rowdata, action)
{
    rowdata.source = rowdata[1];
    return "<a href='javascript:redirectToDeviceSnapshot(\""+rowdata.source+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
}
function incidentWidgetRedirection(cellValue, options, rowdata, action) {
    if (rowdata.groupBy === undefined) {
        return escapeHtmlTags(cellValue);
    }
    if (rowdata.groupBy === 'source') { // No I18N
        return "<a href='javascript:redirectToDeviceSnapshot(\""+rowdata.entityMoName+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
    }
    if (rowdata.groupBy === 'group') { // No I18N
        return "<a href='javascript:redirectotGroupsSnapshot(&#39;"+rowdata.entityMoName+"&#39;,&#39;Device&#39;)'>"+escapeHtmlTags(cellValue)+"</a>";//No I18N
    }
    return escapeHtmlTags(cellValue);
}

function deviceSummaryLink(cellValue, options, rowdata, action)
{
    if(rowdata.entity!=undefined && rowdata.entity.indexOf("AlarmProfile")!=-1) {
        return escapeHtmlTags(cellValue);
    }
    if(cellValue !== undefined && window.OPM.userPermissions.intfGroupRestricted){
       return escapeHtmlTags(cellValue);
    }
    var urlLocation = "";
    if(rowdata.source !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.source,undefined,undefined,undefined,true);
    }
    else if(rowdata.deviceName !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.deviceName,undefined,undefined,undefined,true);
    }
    else if(rowdata.name !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.name,undefined,undefined,undefined,true);
    }
    else if(rowdata.parentKey !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.parentKey,undefined,undefined,undefined,true);
    }
    else if(rowdata.moname !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.moname,undefined,undefined,undefined,true);
    }
    else if(rowdata.NAME !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.NAME,undefined,undefined,undefined,true);
    }
    else if(rowdata.Agent !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.Agent,undefined,undefined,undefined,true);
    }
	else if(rowdata.parentNode !== undefined)
	{
        urlLocation = redirectToDeviceSnapshot(rowdata.parentNode,undefined,undefined,undefined,true);
	}
    else if(rowdata.deviceMoname !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.deviceMoname,undefined,undefined,undefined,true);
    }
    else if(rowdata.deviceMOName !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata.deviceMOName,undefined,undefined,undefined,true);
    }
    else if(rowdata[5] !== undefined)
    {
        urlLocation = redirectToDeviceSnapshot(rowdata[5],undefined,undefined,undefined,true);
    }
    else
    {
        return ""; //No I18n
    }
    return "<a href=\'"+urlLocation+"\'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N

}
function linktoBVSnapshot(cellValue, options, rowdata, action)
{
	return "<a href='"+window.OPM.apiclientUrl+"Maps/BusinessView/"+opm_escapeHTML(rowdata.bvName)+"'>"+opm_escapeHTML(rowdata.bvLabel)+"</a>"; //No I18N
}

function setFWAInAvailBgr(cellValue, options, rowdata, action){
    if(cellValue > 100){
        return "<span>"+Ember.I18n.t('NFAWidget.IN',this)+" : >100%</span>";//No I18N
    }else{
        return "<span>"+Ember.I18n.t('NFAWidget.IN',this)+" : "+cellValue+"%</span>";//No I18N
    }

}

function setFWAOutAvailBgr(cellValue, options, rowdata, action){
    if(cellValue > 100){
        return "<span>"+Ember.I18n.t('NFAWidget.OUT',this)+" : >100%</span>";//No I18N
    }else{
        return "<span>"+Ember.I18n.t('NFAWidget.OUT',this)+" : "+cellValue+"%</span>";//No I18N
    }

}
function responseTimeTxt(cellValue, options, rowdata, action){

        return Ember.I18n.t('webclient.admin.url.restime',this)+" : "+rowdata.RESPONSETIME;//No I18N
}
function availTxt(cellValue, options, rowdata, action){

        return Ember.I18n.t('webclient.admin.url.avail',this)+" : "+rowdata.availPercentage +" %";//No I18N
}
function urlMonitorStatusImg(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.statusNum)+"'></i> "+opm_escapeHTML(rowdata.stringstatus);//No I18N
}
function setAgentMonState(cellValue, options, rowdata, action)
{
    return "<i class='icon-status"+rowdata.STATUS+"'></i> "+cellValue;//No I18N
}
function closeListADCompPopUp(){
    $("#listingADComp").hide();//No I18N
    $('body').removeClass('slideDivIn-12');
}
function deleteOPUAD(domainName){
    if(!window.OPM.isCentralServer){
        if(confirm(Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg',this))){ //No I18N
            var url = window.OPM.apiUrlPattern + '/ipam/deleteADDomainInOpUtils?domainName='+domainName;//No I18N
            var rsp = opm_ajaxPostRequest(url);
            var message = '';
            if(rsp.status === 'Failure'){
                message = rsp.message;
            }else{
                message = rsp.result.message
            }
            if(window.OPM.isMSPCentral){
                showOpUtilsResponse(rsp,"oputils_listAD","","",message);//No I18N
            }else{
                showOpUtilsResponse(rsp,"","","",message);//No I18N
            }
            
        }
    }else{
        opm_infoMsgs('errorMsg',Ember.I18n.t("webclient.api.xml.blockedurl",this));//No I18N
    }

}
function editOpUtilsColumn(tool, id){
    OPMClient.SettingsOpUtilConfigController.set("uniqueID",id);//No I18N
    opm_transitionToParentRoute("Settings.OpUtils."+tool+".Custom.Operation","Edit");//No I18N
}
function cmpRuleSeverityFormatter(cellValue, options, rowdata, action)
{
    var imgUrl = false;
    if(!cellValue){
        return '';
    }
    var tCellValue = cellValue.toLowerCase();
    if(tCellValue == 'major'){ // No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/major_ico.gif";//No I18N
    }  else if(tCellValue == 'critical'){ // No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/critical_ico.gif";//No I18N
    } else if(tCellValue == 'warning'){ // No I18N
        imgUrl = "/apiclient/fluidicv2/img/ncm/warning_ico.gif";//No I18N
    }
    if(!imgUrl){
        return escapeHTML(cellValue);
    }
    return '<img src="'+imgUrl+'">&nbsp;'+escapeHTML(cellValue); // No I18N
}
function cmpRuleNameFormatter(cellValue, options, rowdata, action)
{
    url = "<i class='icon-status1'></i> " + escapeHTML(cellValue);//No I18N
    if(rowdata.status != null && rowdata.status != "") {
        url = "<i class='icon-status"+rowdata.status+"'></i> "+escapeHTML(cellValue);//No I18N
    } else if(rowdata.severity == 'Major') { //No I18N
        url = "<i class='icon-status2'></i> " + escapeHTML(cellValue);//No I18N
    } else if(rowdata.severity == 'Warning'){//No I18N
        url = "<i class='icon-status3'></i> " + escapeHTML(cellValue);//No I18N
    }
    return url; // No I18N
}
function getPathVal(cellValue, options, rowdata, action)
{
    var SourceName = rowdata.srcDisplayName;
    if(SourceName.length>15){
        SourceName = SourceName.substring(0,15)+"...";
    }

    var Target = rowdata.targetDeviceName;
    if(Target.length>15){
        Target = Target.substring(0,15)+"...";
    }
    return SourceName+" &#8594 "+Target; //No I18N
}

function hostNameFormat(cellValue, options, rowdata, action)
{
    return escapeHTML(cellValue);
}
function getClassNamesForForecastGraph(graphEnabled){
    return 'icon-svg-DataMonitor pointer'+ (graphEnabled ? '' : ' disabledBlock');//No I18N
}
function getClassNamesForTestMonitor(rowdata){
    var disableTestMonitor = (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring && ('CLI' === OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.deviceProtocol));//No I18N
    return 'pointer icon-monitor'+ (disableTestMonitor || rowdata.Protocol == "DATA_INGESTION" ? ' disabledBlock' : '');//No I18N
}
function devicePerfActions(cellValue, options, rowdata, action){
    var actionDiv = '';
   if(OPMClient.InventoryDeviceDetailsController.monitorsName == 'performanceMonitors' && !(window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition) )
   {
         actionDiv = "<span title='"+Ember.I18n.t('webclient.fwa.graph')+"' class='"+getClassNamesForGraph(rowdata.checkNumeric === 'true' && rowdata.sSave === 'true')+"' style='float:left;margin-top:2px;cursor:pointer' onclick=doMonitorActions("+options.rowId+",'perfgraph');></span><span title='"+Ember.I18n.t('nfa.reports.forecast')+"' class='"+ getClassNamesForForecastGraph((rowdata.checkNumeric === 'true' && rowdata.sSave === 'true' && window.OPM.userPermissions.monitoringRead) && !rowdata.isBGPMonitor)+"' onclick=doMonitorActions("+options.rowId+",'perfforecast');></span>";//No I18N
   }
   else
   {
             actionDiv = "<span title='"+Ember.I18n.t('webclient.fwa.graph')+"' class='"+getClassNamesForGraph(rowdata.checkNumeric === 'true' && rowdata.sSave === 'true')+"' style='float:left;margin-top:2px;right:0px !important' onclick=doMonitorActions("+options.rowId+",'perfgraph');></span><span title='"+Ember.I18n.t('nfa.reports.forecast')+"' class='icon-svg-DataMonitor vmdisplayNone' onclick=doMonitorActions("+options.rowId+",'perfforecast');></span>";//No I18N


   }
    if(!window.OPM.isCentralServer){
        if(window.OPM.isAuthorized && window.OPM.isCIM){
            var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
            actionDiv += "<span class='pointer icon-configedit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick=doMonitorActions("+options.rowId+",'perfedit'); style='float:left;margin-left:5px;'></span> <span class='icon-trash delete OpMToolTip pointer' style='float:left;font-size:13px' onclick=doMonitorActions("+options.rowId+",'perfdelete'); title="+Ember.I18n.t('webclient.devices.customfields.delete',this)+"></span>";//No I18N
        }
        else if(OPMClient.InventoryDeviceDetailsController.vpnMonitorNonDeleteableList.indexOf(rowdata.name) !== -1){
            actionDiv += "<span class='pointer icon-monitor' title='"+Ember.I18n.t('webclient.snapshot.testlinks.testmonitor')+"' onclick=doMonitorActions("+options.rowId+",'perftest'); style='float:left;margin-left:5px;'></span> <span class='pointer icon-configedit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick=doMonitorActions("+options.rowId+",'perfedit'); style='float:left;margin-left:5px;'></span>";//No I18N
        }
        else if(OPMClient.InventoryDeviceDetailsController.isSDWANDevice && OPMClient.InventoryDeviceDetailsController.SDWANMonNonConfigThresholdMon.indexOf(rowdata.name) !== -1){
            actionDiv += "<span class='"+getClassNamesForTestMonitor(rowdata)+"' title='"+Ember.I18n.t('webclient.snapshot.testlinks.testmonitor')+"' onclick=doMonitorActions("+options.rowId+",'perftest'); style='float:left;margin-left:5px;font-size:13px'></span> <span class='pointer icon-configedit disabledBlock' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick=doMonitorActions("+options.rowId+",'perfedit'); style='float:left;margin-left:5px;font-size:13px'></span> <span class='icon-trash delete OpMToolTip pointer disabledBlock' style='float:left;font-size:13px' onclick=doMonitorActions("+options.rowId+",'perfdelete'); title="+Ember.I18n.t('webclient.devices.customfields.delete',this)+"></span>";//No I18N
        }
        else if(window.OPM.userPermissions.monitoringWrite){
            actionDiv += "<span class='"+getClassNamesForTestMonitor(rowdata)+"' title='"+Ember.I18n.t('webclient.snapshot.testlinks.testmonitor')+"' onclick=doMonitorActions("+options.rowId+",'perftest'); style='float:left;margin-left:5px;font-size:13px'></span> <span class='pointer icon-configedit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick=doMonitorActions("+options.rowId+",'perfedit'); style='float:left;margin-left:5px;font-size:13px'></span>";//No I18N
            var showDeleteAction = true;
            if(OPMClient.InventoryDeviceDetailsController.isKempLoadBalancer && OPMClient.InventoryDeviceDetailsController.monitorsName==="performanceMonitors")
            {
                if(defaultKempGraphs.indexOf(rowdata.policyName)!=-1){
                    showDeleteAction = false;
                }
            }
            if(OPMClient.InventoryDeviceDetailsController.isInDepthLoadBalancer && OPMClient.InventoryDeviceDetailsController.monitorsName==="performanceMonitors")//No I18N
            {
                if(defaultF5Graphs.indexOf(rowdata.policyName)!=-1){
                    showDeleteAction = false;
                }
            }
            if(OPMClient.InventoryDeviceDetailsController.monitorsName==="performanceMonitors" && rowdata.isBGPMonitor){
                showDeleteAction = false;
            }
            if(showDeleteAction)
            {
                actionDiv += "<span class='icon-trash delete OpMToolTip pointer' style='float:left;font-size:13px' onclick=doMonitorActions("+options.rowId+",'perfdelete'); title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"'></span>";//No I18N
            }
        }
    }
    return actionDiv;
}
function deviceScriptMonActions(cellValue, options, rowdata, action)
{
    var actionDiv = "<span title='"+Ember.I18n.t('webclient.fwa.graph')+"' class='"+getClassNamesForGraph(rowdata.checkNumeric === 'true')+"' style='float:left;margin-top:2px;margin-right:-4px;right:0px !important' onclick=doMonitorActions("+options.rowId+",'perfgraph');></span>";//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.adminAccess){
       if(window.OPM.userPermissions.devGrouporBVRestricted){
            actionDiv += "<span style='float:left;font-size:13px' class='ui-icon ui-icon-trash' onclick=doMonitorActions("+options.rowId+",'scriptdelete');></span>"; //No I18N
         }else{
        	actionDiv += "<span onclick=doMonitorActions("+options.rowId+",'scriptedit'); class='icon-configedit pointer' style='float:left;font-size:13px'></span><span style='float:left;font-size:13px' class='icon-trash delete OpMToolTip pointer' onclick=doMonitorActions("+options.rowId+",'scriptdelete');></span>"; //No I18N
    	}
    }
    return actionDiv;
}
function deviceEventLogMonAction(cellValue, options, rowdata, action){
    return "<span style='float:left;font-size:13px' class='icon-trash delete OpMToolTip pointer' onclick=doMonitorActions("+options.rowId+",'deviceMonitorsEventlogDelete'); title="+Ember.I18n.t('webclient.devices.customfields.delete')+"></span>"; //No I18N
}
function deviceMonitorCommonActions(cellValue,options,rowdata,action){
    var optionalParam = OPMClient.InventoryDeviceDetailsController.monitorsName;
    var isAdExchangeMssqlService = (['adServices','exchangeServices','mssqlServices'].contains(optionalParam));//No I18N
    var actionDiv = '';
    var graphClassNames = function(){
        return isAdExchangeMssqlService ? 'perfMonitorGraph pointer mRight10' : 'perfMonitorGraph pointer';//No I18N
    }
    if('urlMonitors' !== optionalParam){
        actionDiv = "<span title='"+Ember.I18n.t('webclient.fwa.graph')+"' class='"+graphClassNames()+"' style='float:left;margin-top:2px' onclick=doMonitorActions("+options.rowId+",'deviceMonitorsCommonGraph','"+optionalParam+"');></span>";//No I18N
    }
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite){
        if(!isAdExchangeMssqlService){
            actionDiv += "<span onclick=doMonitorActions("+options.rowId+",'deviceMonitorsCommonEdit','"+optionalParam+"'); title="+Ember.I18n.t('webclient.title.edit')+" class='icon-configedit pointer' style='float:left;font-size:13px'>"; //No I18N
        }
        actionDiv += "</span><span style='float:left;font-size:13px' class='icon-trash delete OpMToolTip pointer' onclick=doMonitorActions("+options.rowId+",'deviceMonitorsCommonDelete','"+optionalParam+"'); title="+Ember.I18n.t('webclient.devices.customfields.delete')+"></span>"
    }
    return actionDiv;
}
function setDevStorageMonitorActions(cellValue, options, rowdata, action) {
    var actionDiv = "";
    var supportedProtocols = ["RAID","StorageRESTAPI","StorageSMI","NETAPP_SMI"];//No I18N
    var mssqlInstanceName = "";
    if(window.OPM.userPermissions.monitoringRead){
        actionDiv+="<span title='"+Ember.I18n.t('nfa.reports.forecast')+"' class='"+ getClassNamesForForecastGraph(rowdata.checkNumeric === 'true' && rowdata.sSave === 'true')+"' onclick=doMonitorActions("+options.rowId+",'perfforecast');></span>";
    }
    if(window.OPM.userPermissions.monitoringWrite)
    {
        actionDiv += "<span class='pointer icon-configedit' title='Edit' style='float:left;margin-left:5px;' onclick=doMonitorActions("+options.rowId+",'perfedit');></span><span class='icon-trash delete OpMToolTip pointer' style='float:left' onclick=doMonitorActions("+options.rowId+",'perfdelete'); title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"'></span>"; //No I18N
        if(rowdata.Protocol !== undefined && supportedProtocols.includes(rowdata.Protocol) && "node" !== rowdata.graphType){
            actionDiv +="<div class='mediumSlider'><span title='"+Ember.I18n.t('opstor.monitor.manage.instance',this)+"' style='float:left;margin-left:10px;margin-top:2px;' onclick='listMonitorInstance(\""+deviceBasicDetails.deviceName+"\",\""+encodeURIComponent(rowdata.GRAPHID)+"\",\""+encodeURIComponent(rowdata.DISPLAYNAME)+"\");'><em class='svgIcon size13'><svg style='cursor:pointer;'><use xlink:href='\/apiclient\/fluidicv2\/img\/sprite-opm.svg#layers'/></svg></em></span></div>";
        }
    }
    return actionDiv;
}

function setStorageManageInstanceActions(cellValue, options, rowdata, action)
{
    var isChecked = "checked";//No I18N
    if(rowdata.isIgnored){
        isChecked = "";
    }
    return "<div class='chkRoundBtn'><input type='checkbox' " + isChecked + " onclick='manageStorageMonitorInstance(\""+encodeURIComponent(rowdata.row)+"\", this)' name=''><label></label></div>";//No I18N";
}
function setMonitorHealthReportsActions(cellValue, options, rowdata, action) {
    var categoryBy = options.colModel.formatoptions.categoryBy;
    if(categoryBy === 'device') {
        return "<span style='float:left; clear:none; cursor:pointer;' class='icon-ping2' title='"+Ember.I18n.t('webclient.action.ping')+"' onclick='devicePing(&quot;" + escape(rowdata.deviceIP) + "&quot;)'></span>"; //No I18n
    }
    else {
        if(rowdata.protocol && (rowdata.protocol.toLowerCase() === 'intf' || rowdata.protocol === 'DATA_INGESTION')) {
            return '-'
        }
        return "<span style='float:left; clear:none; cursor:pointer;' class='icon-monitor' title='"+Ember.I18n.t('webclient.snapshot.testlinks.testmonitor')+"' onclick='monitorHealthTest(&quot;" + escape(JSON.stringify(rowdata)) + "&quot;)'></span>"; //No I18n
    }
}

function cpuMemoryRedirectFormatter(cellValue, options, rowdata, action) {
    var key;
    if(rowdata.key === 'System CPU Utilization' || rowdata.key === 'System Memory Utilization' || rowdata.key === 'NFA FlowRate (last hour)' || rowdata.key === 'FWA FlowRate (last hour)' || rowdata.key === 'MSSQL Server Memory' || rowdata.key === 'MSSQL Process Memory' || rowdata.key === 'MSSQL Process CPU' || rowdata.key === 'MSSQL Server CPU') {
        switch(rowdata.key) {
            case 'System CPU Utilization': key = 'systemCpuUtil' ;break; // No I18n
            case 'System Memory Utilization': key = 'systemMemoryUtil' ;break; // No I18n
            case 'NFA FlowRate (last hour)': key = 'nfaFlowRateStats' ;break; // No I18n
            case 'FWA FlowRate (last hour)': key = 'fwaFlowRateStats' ;break; // No I18n
            case 'MSSQL Server Memory': key = 'mssqlMemoryUtil' ;break; // No I18n
            case 'MSSQL Process Memory': key = 'mssqlMemoryUtil' ;break; // No I18n
            case 'MSSQL Server CPU': key = 'mssqlCpuUtil' ;break; // No I18n
            case 'MSSQL Process CPU': key = 'mssqlCpuUtil' ;break; // No I18n
        }
	    return "<a class='ncmLink' onclick='cpuMemoryRedirectTab(\"" + key + "\",\"" + rowdata.displayName + "\")'>" + rowdata.displayName + "</a>";//No I18N
    }
    return rowdata.displayName;
}

function systemInfoStatusFormatter(cellValue, options, rowdata, action) {
    var childStatusArray = options.colModel.formatoptions;
    var key;
    if (rowdata.displayName == "Number of Rows Inserted") {
        return '<span style="display:inline-block" title="' + rowdata.value.substring(rowdata.value.lastIndexOf('(')+1,rowdata.value.lastIndexOf(')')) + '">' + rowdata.value.substring(0, rowdata.value.indexOf('(')) + '</span>';
    }
    if(childStatusArray && childStatusArray.childData) {
        switch(rowdata.key) {
            case 'Logical Processors': key = 'logicalProcessors' ;break; // No I18n
            case 'Number of Cores': key = 'NumberOfCores' ;break; // No I18n
            case 'RAM': key = 'RAM' ;break; // No I18n
        }
        if(key && childStatusArray.childData[key]) {
            var keyObj = childStatusArray.childData[key];
            if(keyObj.isThresholdViolated) {
                return '<span style="width:50px; display:inline-block">'+rowdata.value+'</span>' + '&nbsp; &nbsp; ' + "<i class='icon-status1 pull-none' title='"+ keyObj.toolTip +"'></i>";//No I18N
            }
            return '<span style="width:50px;  display:inline-block">'+rowdata.value+'</span>' + '&nbsp; &nbsp; ' + "<i class='icon-status5 pull-none' title='"+ keyObj.toolTip +"'></i>";//No I18N
        }
    }
    return rowdata.value;
}

function cpuMemoryRedirectTab(key,displayName) {
    supportAnalysisInstance.get("systemInfoController").send("accordionToggle", key,displayName); //No I18N
    $('#analysisSection .opmFormHolder').scrollTop($('#' + key)[0].offsetTop);
}

function setDeviceWfAction(cellValue, options, rowdata, action)
{
    var actionsDiv = "";
    if(window.OPM.isAuthorized)
    {
    actionsDiv = "<span class='icon-uni27A1 pointer' title='Execute' onclick='triggerWorkflowToDevice(&#39;"+rowdata.wfID+"&#39;,&#39;"+rowdata.triggerType+"&#39;)' style='float:left;margin-left:10px;font-size: 16px;'></span>"; //No I18N
    if(rowdata.triggerType!==undefined&&rowdata.triggerType!=="0")
    {
        actionsDiv += "<span class='pointer icon-configedit' title='Edit' onclick='editWorkflowFromSnapshot(&#39;"+rowdata.wfName+"&#39;,&#39;"+rowdata.wfID+"&#39;)' style='float:left;margin-left:10px;'></span>"; //No I18N
    }
    else
    {
        actionsDiv += "<span class='pointer icon-configedit' title='Edit' style='float:left;margin-left:10px;color:#dcdada'></span>"; //No I18N
    }
        actionsDiv += "<span title='"+Ember.I18n.t('webclient.workflow.viewlogs', this)+"'  style='float:left;margin-left:10px;' class='ui-icon ui-icon-document pointer' onclick='goToRunBookReport(\"" + rowdata.reportID + "\",\"" + rowdata.wfID + "\")'></span>"; //No I18N
    actionsDiv += "<span class='pointer icon-trash' title='Delete' onclick='removeWorkflowFromDevice(&#39;"+rowdata.wfID+"&#39;,&#39;"+rowdata.triggerType+"&#39;)' style='float:left;margin-left:10px;'></span>"; //No I18n
    }
        else
    {
        actionsDiv = "<span title='"+Ember.I18n.t('webclient.workflow.viewlogs', this)+"'  style='float:left;margin-left:10px;' class='ui-icon ui-icon-document pointer' onclick='goToRunBookReport(\"" + rowdata.reportID + "\",\"" + rowdata.wfID + "\")'></span>"; //No I18N
    }

    return actionsDiv; //No I18n
}
function notifProfileEnableDisable(cellValue, options, rowdata, action) {
	if (!window.OPM.isAuthorized) {
		return '';
	}
    var isGrpSnap = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalDeviceGroup" || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalIntfGroup" || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalIPSLAGroup"; //No I18N
    var isDevSnap = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "MonitoringDevice"; //No I18n

    var isDevNGlobal = rowdata.isGlobal && isDevSnap;
    var isDevNGrp = isDevSnap && rowdata.associationType !== "MANUAL"; //Group profile in dev snapshot page.  //No I18n

	var isChecked = 'checked'; //No I18N
	var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
	if (rowdata.status !== "true") {
		isChecked = '';
		statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
	}
    var isDisabled = "disabled";  //No I18N
    if(window.OPM.userPermissions.notificationProfileWrite){
        var isDisabled = "";
    }
    var blockTitle = ""; 
    if(isDevNGrp) {
        blockTitle = Ember.I18n.t('webclient.group.notifications.cannotmodify.grpfromdev'); //No I18n
    } else if(isDevNGlobal) {
        blockTitle = Ember.I18n.t('webclient.device.notifications.cannotmodify'); //No I18n
    } else if(isGrpSnap) {
        blockTitle = Ember.I18n.t('webclient.group.notifications.cannotmodify'); //No I18n
    }
    if(window.OPM.userPermissions.devGrouporBVRestricted ) {
        blockTitle = (isDevNGrp || isGrpSnap) ? Ember.I18n.t('webclient.group.notifications.cannotmodify.deviceGroupScope') : (isDevNGlobal ?  Ember.I18n.t('webclient.group.notifications.canmodify.deviceGroupScope') : ""); //No I18n
    }
    var disabledStatus = isGrpSnap || isDevNGlobal || isDevNGrp;
	return "<div title=\"" + escapeHTML(blockTitle) + "\" class='chkRoundBtn'><input class='"+(disabledStatus ? " disabledBlock": "" )+"' type='checkbox' onclick='changeProfileStatus(this," + rowdata.profileId + ",&#39;" + escape(rowdata.profileName) + "&#39;," + rowdata.isGlobal + "," + rowdata.status + ",false)' " + isChecked + " "+isDisabled+ " name='profileStatusBtn_" + rowdata.profileId + "' title='" + statusTitle + "'><label class='"+(disabledStatus ? " disabledBlock": "" )+"'></label></div>";//No I18N
}
function notifProfileEnableDisable_Global(cellValue, options, rowdata, action){
	if (!rowdata.hasSubProfiles) {
		var isChecked = 'checked'; //No I18N
		var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
		if (rowdata.status !== "true") {
			isChecked = '';
			statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
		}
        var isDisabled = "disabled";  //No I18N
        if (window.OPM.userPermissions.notificationProfileWrite) {
            var isDisabled = "";
        }
		return "<div class='chkRoundBtn' role='checkbox'><input type='checkbox' onclick='changeProfileStatus(this," + rowdata.profileID + ",&#39;" + escape(rowdata.profileName) + "&#39;," + rowdata.isGlobal + "," + rowdata.status + ",true)' " + isChecked + " "+isDisabled+ " name='profileStatusBtn_" + rowdata.profileID + "' title='" + statusTitle + "'><label></label></div>";//No I18N
	}
	else {
		return '';
	}
}
function ShowNotifProfileEnableDisable(cellValue, options, rowdata, action) {
	if (rowdata.status === "true") {
		return Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
	}
	else {
		return Ember.I18n.t('jsp.commonstr.Disabled', this);//No I18N
	}
}
function editDeviceProfile(cellValue, options, rowdata, action)
{
    if(window.OPM.isAuthorized)
    {
        var actions= "";
        var isGrpSnap = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalDeviceGroup" || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalIntfGroup" || OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "LogicalIPSLAGroup"; //No I18N
        var isDevSnap = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType === "MonitoringDevice"; //No I18n
        var isDevNGrp = isDevSnap && rowdata.associationType !== "MANUAL"; //Group profile in dev snapshot page.  //No I18n
        var devorBvSnap = window.OPM.userPermissions.devGrouporBVRestricted && (isDevNGrp || isGrpSnap);
        var viewCriteriaAction = "<i class='pointer icon-configfile1' data-title='View Criteria' title='"+Ember.I18n.t('webclient.np.btn.viewcriteria',this)+"' style='cursor:pointer; clear:none;float:left;' onclick='notificationCriterias(&#39;"+escape(rowdata.profileName)+"&#39;)'></i>";

        var editTitle;
        var deleteTitle = Ember.I18n.t('webclient.title.delete',this); //No I18n
        if(isGrpSnap) {
            deleteTitle = editTitle = Ember.I18n.t('webclient.group.notifications.cannotmodify'); //No I18n
        } else if(isDevNGrp) {
            deleteTitle = editTitle = Ember.I18n.t('webclient.group.notifications.cannotmodify.grpfromdev'); //No I18n
        } 
        if(devorBvSnap) {
            deleteTitle = editTitle = Ember.I18n.t('webclient.group.notifications.cannotmodify.deviceGroupScope'); //No I18n
        }
        if(window.OPM.userPermissions.notificationProfileRead){
            if(!editTitle) {
                editTitle = Ember.I18n.t('webclient.title.edit',this); //No I18n
            }
            actions += viewCriteriaAction;
            if(window.OPM.userPermissions.reportsRead && !isGrpSnap){
                actions+="<span style='cursor:pointer; clear:none;float:left;margin-left:10px;' title=\""+ Ember.I18n.t('webclient.report.tooltip.view',this) +"\" class='viewReportsBtn2' onclick='redirectToNotifprofileReport(&#39;"+rowdata.profileId+"&#39;,&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;)'"+"></span>";
            }
            actions+="<span style='cursor:pointer; clear:none;float:left;margin-left:10px;' class='icon-configedit"+(isDevNGrp || (isGrpSnap && window.OPM.userPermissions.devGrouporBVRestricted)? " onlyGreyOut" : "")+"' title=\""+ escapeHTML(editTitle)+"\" " +(isGrpSnap ? ("onclick=\"notificationEdit(&#39;"+escape(JSON.stringify(rowdata))+"&#39;)\""): (isDevNGrp ? "": ("onclick='opm_deviceNotificationEdit("+rowdata.profileId+")';")))+"></span>";
        }
        if(window.OPM.userPermissions.notificationProfileWrite){
            actions+="<div><span style='cursor:pointer;clear:none;float:left;' class='icon-trash"+(isGrpSnap || isDevNGrp ? " onlyGreyOut" : "")+"' title=\""+ escapeHTML(deleteTitle) +"\""+(isGrpSnap || isDevNGrp ? "" : "onclick='deleteNotificationProfileAssociation("+rowdata.profileId+");'")+"></span></div>";
        }
        return actions;
    }
    else
    {
        return "";//No I18n
    }
}
function opm_delNotif(cellvalue,options,rowdata,action)
{
    if(window.OPM.isAuthorized)
    {
        return "<span style='cursor:pointer;clear:none;float:left;margin-left:10px;' class='icon-trash' onclick='deleteNotificationProfileAssociation("+rowdata.profileId+");'></span>";
    }
    else
    {
        return "";//No I18n
    }
}
function redirectToNFAWlcSnapshot(devid)
{
    if(devid != undefined)
    {
        OPMClient.InventoryDeviceDetailsController.nfaDeviceID = devid;
        location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowWLC/"+devid; //No I18N
    }
}
function redirectToNFAMerakiSnapshot(devid)
{
    if(devid != undefined)
    {
        OPMClient.InventoryDeviceDetailsController.nfaDeviceID = devid;
        location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowMeraki/"+devid; //No I18N
    }
}
function redirectToNFAL4APPS(appName)
{
    if(window.isserver)
    {
        setCombo('withOutAll');//No I18n
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowL4/"+appName; //No I18N
}
function redirectToNFAL7APPS(AppID)
{
    if(window.isserver)
    {
        setCombo('withOutAll');//No I18n
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowL7/"+AppID; //No I18N
}

function redirectToNFAServices(serviceName){
	if(window.isserver){
		setCombo("withAllOnly"); //NO I18N
	}
	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowServices/"+serviceName; //NO I18N
}

function redirectToNFAProblemList(problemName,startTime,endTime,criteriaList)
{
    var params={'name':problemName,'startTime':startTime,'endTime':endTime,'criteriaList':criteriaList};//No I18N
	var invListName = (window.OPM.isNFAOldView)?'AttacksAnalysis':'FlowAnalysis'; //No I18N
	location.href = window.OPM.apiclientUrl+"Inventory/List/"+invListName+"/Attacks"; //No I18N
    setTimeout(function(){
		nfa_redirectInvList("AttacksCriteria"); //No I18N
        setTimeout(function(){
            OPMClient.Inventory.applNFAAttacksProblemCriteria(params);
        },100);
    },100);
}
function redirectToNFADevSnapshot(devid)
{
    if(devid != undefined){OPMClient.InventoryDeviceDetailsController.nfaDeviceID = devid;}
	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowDevice/"+devid; //No I18N
}
function setNFAIntfSnapFromTopIntfWidget(cellValue, options, rowdata, action)
{
	/*var redirectLink = window.OPM.isCentralServer ? "" : "href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/FlowInterface/"+htmlEncode(rowdata[1])+"' class='devHrefLink'"; //NO I18N
	return "<a "+redirectLink+" >"+htmlEncode(cellValue)+"</a>"; //NO I18N*/
    return "<span class='cursorPointer' onclick='redirectToNFASnapshot(\""+htmlEncode(rowdata[1])+"\")';>"+htmlEncode(cellValue)+"</span>"; //No I18N
}
function setNFADevfSnapFromTopDevWidget(cellValue, options, rowdata, action)
{
	return "<span class='cursorPointer' onclick='redirectToNFADevSnapshot(\""+htmlEncode(rowdata[6])+"\")';>"+htmlEncode(cellValue)+"</span>"; //No I18N
}
function setNFADevSnapFromTopDevWidget(cellValue, options, rowdata, action)
{
	return "<span class='cursorPointer' onclick='redirectToNFADevSnapshot(\""+htmlEncode(rowdata[4])+"\")';>"+htmlEncode(cellValue)+"</span>"; //No I18N
}
function setAppsSnapshotLink(cellValue, options, rowdata, action)
{
    return "<span class='cursorPointer' onclick='OPMClient.Inventory.getAppsMonitor(\""+rowdata.RESOURCEID+"\")';>"+rowdata.DISPLAYNAME+"</span>"; //No I18N
}
function setNFAProblemListLink(cellValue, options, rowdata, action)
{
    return "<span class='cursorPointer' onclick='redirectToNFAProblemList(\""+htmlEncode(rowdata[1])+"\",\""+htmlEncode(rowdata[2])+"\",\""+htmlEncode(rowdata[3])+"\",\""+htmlEncode(rowdata[5])+"\")';>"+htmlEncode(cellValue)+"</span>"; //No I18N
}
function nfa_deviceSnapshot(cellValue, options, rowdata, action)
{
	cellValue = htmlEncode(cellValue);
	var rowdataID = htmlEncode(rowdata.ID);
    if(OPMClient.ApplicationController.isCentralServer) {
        return cellValue;
    }
    if(rowdata.wlcStatus == '1') {
        return "<span class='cursorPointer' onclick='redirectToNFAWlcSnapshot(\""+rowdataID+"\")';>"+cellValue+"</span>"; //No I18N
    }else if(rowdata.wlcStatus == '2') {
        return "<span class='cursorPointer' onclick='redirectToNFAMerakiSnapshot(\""+rowdataID+"\")';>"+cellValue+"</span>"; //No I18N
    }else {
		return "<span class='cursorPointer' onclick='redirectToNFADevSnapshot(\""+rowdataID+"\")';>"+cellValue+"</span>"; //No I18N
    }
}
function  setNFARedirectCollectorSnapshot(cellValue,options,rowdata,action)
{
	if(rowdata.isInternalColl == "true"){
		return "<span class='cursorPointer'>"+htmlEncode(cellValue)+"</span>"; //No I18N
	}else{
    	return "<span class='cursorPointer' onclick=window.open(\'"+htmlEncode(rowdata.url)+"\')>"+htmlEncode(cellValue)+"</span>"; //No I18N
	}
}
function setNFACollStatus(cellValue,options,rowdata,action)
{
	if(rowdata.collStatus === 'Up')//No I18N
	{
		return "<div class='collector-up' title='"+Ember.I18n.t('nfa.central.communicationUp')+"'><svg class='svgIcon size20 ml-sm'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#arrow-up'></use></svg></div>";//No I18N
	}
	else if(rowdata.collStatus === 'Down')//No I18N
	{
		return "<div class='collector-down' title='"+Ember.I18n.t('nfa.central.communicationDown')+"'><svg class='svgIcon size20 ml-sm'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#arrow-down'></use></svg></div>";//No I18N
	}
	else if(rowdata.collStatus === 'Broken')//No I18N
	{
		return "<div class='collector-broken' title='"+Ember.I18n.t('nfa.central.communicationBroken')+"'><svg class='svgIcon size20 ml-sm'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#connection-broken-solid'></use></svg></div>";//No I18N
	}
	else
	{
		return "<div class='collector-info' title='"+Ember.I18n.t('nfa.central.buildnumberMismatch')+"'><svg class='svgIcon size20 ml-sm'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#not-equal-solid'></use></svg></div>";//No I18N
	}
}
function setcheckboxformatter(cellValue, options, rowdata, action)
{
    return "<input type='checkbox' id='nfamultiselect' />";
}
function nfa_intfCount(cellValue, options, rowdata, action)
{
    var temp = "";
    switch(options.colModel.name)
    {
        case 'IntfCount': //No I18N
            temp = (rowdata.wlcStatus === 1 || rowdata.wlcStatus === 2)?Ember.I18n.t('webclient.snapshot.name.Access.Points',this):Ember.I18n.t('webclient.devices.details.intf',this);//No I18N
        break;
        case 'PktCount': //No I18N
            temp = Ember.I18n.t('nfa.dashboard.flows',this); //No I18N
        break;
        case 'IP': //No I18N
            temp = Ember.I18n.t('webclient.IP',this); //No I18N
        break;
    }
    return "<i>"+temp+"</i> : <i>"+htmlEncode(cellValue)+"</i>"; //No I18N
}


function editDeviceFileMon(monId) {
    OPMClient.SettingsAddEditController.sourceID=monId;
    OPMClient.SettingsAddEditController.operation=false;
    redirectToMonitor(OPMClient.InventoryDeviceDetailsController.deviceName,"FileMonitor"); //No I18N
}
function editDevFolderMon(monId) {
    OPMClient.SettingsAddEditController.sourceID=monId;
    OPMClient.SettingsAddEditController.operation=false;
    redirectToMonitor(OPMClient.InventoryDeviceDetailsController.deviceName,"FolderMonitor"); //No I18N
}
function editDeviceUrlMonitor(urlName) {
    OPMClient.SettingsAddEditController.set("operation",false); //No I18N
    OPMClient.SettingsAddEditController.pageObj = {name:decodeURIComponent(urlName),urlName:decodeURIComponent(urlName)}; //No I18N
    redirectToMonitor(OPMClient.InventoryDeviceDetailsController.deviceName,"URLMonitors"); //No I18N
}

function opm_ShowCursorPointer_Virtual(cellValue, options, rowData, action){
    if(rowData.mo_name){
        return "<span class='cursorPointer'>"+opm_escapeHTML(cellValue)+"</span>";//No I18N
    }else{
        return "<span>"+opm_escapeHTML(cellValue)+"</span>";//No I18N
    }
}

function opm_showStartMonitor(cellValue,options,rowdata,action)
{
    var virtualType = opm_escapeHTML(rowdata.VIRTUAL_TYPE);
    var idToUse = rowdata.VM_ID, displayName = rowdata.DISPLAYNAME, vHostID = rowdata.VHOST_ID;

    OPMClient.InventoryDeviceDetailsController.set("vmGridID",$(this).closest(".content").attr("data-index"));//No I18N

    if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj && ((OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ENTITY_TYPE && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ENTITY_TYPE.includes("Proxmox")) || (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType.includes("Proxmox")))) {
        idToUse = rowdata.vm_id || rowdata.container_id || rowdata.host_id;
        displayName = rowdata.host_name || rowdata.container_name || rowdata.vm_name;
        vHostID = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.moID;
        virtualType = "Proxmox-Node"; //No I18N
        if(rowdata.host_id) {
            virtualType = "Proxmox-Node"; //No I18N
        } else if(rowdata.container_id) {
            virtualType = "Proxmox-Container"; //No I18N
        } else if(rowdata.vm_id) {
            virtualType = "Proxmox-VM"; //No I18N
        }
    }

    if((rowdata.IPADDRESS != "" && rowdata.IPADDRESS != undefined) || rowdata.MARKFORDELETE == true || (rowdata.IS_ORPHANED != undefined && rowdata.IS_ORPHANED == "true") || (rowdata.ip_address != "" && rowdata.ip_address != undefined)  || (rowdata.ipaddress != "" && rowdata.ipaddress != undefined))//No I18N
    {
        var toRet = "<i class='icon-status16 pointer pull-left' title = '"+Ember.I18n.t('webclient.virtual.stopmonitoring',this)+"'></i>"; //No I18N
        if(window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-status16 pointer pull-left' title = '"+Ember.I18n.t('webclient.virtual.stopmonitoring',this)+"' onclick = 'opm_stopMonitoring(\""+opm_escapeHTML(idToUse)+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        if(rowdata.MARKFORDELETE || rowdata.IS_ORPHANED == "true")
        {
            toRet = toRet+" (Orphaned)";//No I18N
        }
        return '<div class="clearfix">' + toRet +'<span onclick=labelClick(this) class="pointer monitoringStatus line-height-3 ml-xs pull-left">'+Ember.I18n.t('opm.wlc.monitoringState.true',this) +'</span></div>';
    }
    else
    {
        var toRet = "<i class='icon-status15 pointer pull-left' title = '"+Ember.I18n.t('webclient.nwm.startmonitoring',this)+"'></i>"; //No I18N
        if(window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-status15 pointer pull-left' title = '"+Ember.I18n.t('webclient.nwm.startmonitoring',this)+"' onclick = 'opm_startMonitoring(\""+opm_escapeHTML(displayName)+"\",\""+opm_escapeHTML(idToUse)+"\",\""+opm_escapeHTML(vHostID)+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        return '<div class="clearfix">' + toRet +'<span onclick=labelClick(this) class="pointer monitoringStatus line-height-3 ml-xs pull-left">'+Ember.I18n.t('opm.wlc.monitoringState.false',this) +'</span></div>';
    }
}
function labelClick(e)
{
    e.previousSibling.click();
}
function opm_showHostMonitor(cellValue,options,rowdata,action)
{
    var virtualType = "VMware-Host"; //No I18N
    OPMClient.InventoryDeviceDetailsController.set("vmGridID",$(this).closest(".content").attr("data-index"));//No I18N
    var toRet = ""; //No I18N
    var hostId = opm_escapeHTML(rowdata.VHOST_ID);
    if(rowdata.STATUS != undefined)//No I18N
    {
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-stop pointer' title = '"+Ember.I18n.t('webclient.virtual.stopmonitoring',this)+"' onclick = 'opm_stopMonitoring(\""+hostId+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        return toRet;
    }
    else
    {
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-start pointer' title = '"+Ember.I18n.t('webclient.nwm.startmonitoring',this)+"' onclick = 'opm_startMonitoring(\""+opm_escapeHTML(rowdata.DISPLAYNAME)+"\",\""+hostId+"\",\""+hostId+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        return toRet;
    }
}

function opm_stopMonitoring(vmID,virtualType,thisDiv)
{
	var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/device/unMapEntity?entityID="+vmID+"&virtualType="+virtualType);//No I18N
    if (response.error !== undefined){//No I18N
        opm_infoMsgs("errorMsg",response.error.message);//No I18N
    }else if(response.result === "false"){//No I18N
        opm_infoMsgs("errorMsg",response.status);//No I18N
    }else if (response.result === "true"){//No I18N
        $(thisDiv).closest("div.singleInvWidget").siblings("div.inventoryWidget").find('.icon-ccw.widget_refresh').trigger('click');//No I18N
        opm_infoMsgs("successMsg",response.status);//No I18N

    }
}
function opm_startMonitoring(deviceName,vmID,vHostID,virtualType,thisDiv){
    if(virtualType != undefined && 'IPMI' == virtualType){
        opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.device.ipmi.hardware.map.info.msg2',this));//No I18N
    }
    OPMClient.InventoryDeviceDetailsController.set("vmID",vmID);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("vmType",virtualType);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("vmHostName",deviceName);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("vHostID",vHostID);//No I18N
    redirectSnapShot("IPMapping");//No I18N
    OPMClient.InventoryDeviceDetailsController.vmGridID = thisDiv;
}
function testCredentialResultState(cellValue, options, rowdata, action)
{
    var str = "";
    if(cellValue === 'passed')
    {
        str = '<i class="icon-status5"></i> '+rowdata.status;//No I18N
    }
    else if(cellValue === 'failed')
    {
        str = '<i class="icon-status1"></i> '+rowdata.status;//No I18N
    }
    else if(cellValue === "nottested"){
        str = '<i class="icon-status2"></i> '+rowdata.status;//No I18N
    }
    return str;
}
function updateCredentialForAllDevice(cellValue, options, rowdata, action)
{
    var str = "";//No I18N
    if(cellValue === 'Values updated successfully')//No I18N
    {
        str = '<i class="icon-status5"></i> '+Ember.I18n.t('webclient.credential.snmp.passed',this);//No I18N
    }
    else
    {
        str = '<i class="icon-status1"></i> '+Ember.I18n.t('webclient.credential.snmp.failed',this);//No I18N
    }
    return str;
}

function NCMDGCriteriaDelete(cellValue, options, rowdata, action)
{
return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;'  title='Delete'></i>";
}

function NCMRowDelete(gridId,rowId)
{
    $('#'+gridId).delRowData(rowId);
}
//ignorei18n_start
function NCMCriteriaParameterFormatter(cellValue, options, rowdata, action)
{
    return OPMClient.SettingsNCMConfigController.parameterMap[rowdata.parameter];
}

function NCMCriteriaConditionFormatter(cellValue, options, rowdata, action)
{
    return OPMClient.SettingsNCMConfigController.conditionMap[rowdata.condition];
}
function configletDeleteRenderer(cellValue, options, rowdata, action) {
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	return '<i title="'+Ember.I18n.t("webclient.general.delete",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;" class="icon-trash delete" onclick="deleteConfiglets('+rowdata[0]+');"></i>';
}

function proConfigletDeleteRenderer(cellValue, options, rowdata, action) {
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	return '<i title="'+Ember.I18n.t("webclient.general.delete",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;" class="icon-trash delete" onclick="OPMClient.NCMConfigAutomationModel.deleteProConfiglets('+rowdata.id+');"></i>';
}

function ncmRegexDeleteRenderer(cellValue, options, rowdata, action) {
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	return '<i title="'+Ember.I18n.t("webclient.general.delete",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;" class="icon-trash delete" onclick="OPMClient.NCMConfigAutomationModel.deleteNCMRegex('+rowdata.id+');"></i>';
}

function configletGroupDeleteRenderer(cellValue, options, rowdata, action) {
	if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite || window.OPM.userPermissions.operatorAccess)){
		return "";
	}
	return '<i title="'+Ember.I18n.t("webclient.general.delete",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;" class="icon-trash delete" onclick="OPMClient.NCMConfigAutomationModel.deleteConfigletGroup('+rowdata.id+');"></i>';
}

function restConfigletAction(cellValue, options, rowdata, action)
{
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}

    if(rowdata.actions != undefined) {
        var actionJSON;
        try {
            actionJSON = JSON.parse(rowdata.actions);
        } catch(e) {
            return "";
        }
        if(actionJSON && actionJSON.json && actionJSON.json.length) {
            return "<div id='action_" + rowdata.id + "' class='ncmAction'>" + //No I18N
                "<i title='" + Ember.I18n.t("webclient.action.actions",this) + //No I18N
                "' onclick='openActionListForRestApiExecution(\"" + rowdata.id + "\", \"" + rowdata.TEMPLATE_NAME + "\", \"" + rowdata.NAME + "\");'" + //No I18N
                "class='opm-icon icon-actions'></i></div>"; //No I18N
        } else {
            return "";
        }

    }
    return "<a class='ncmLink' onclick='executeRestConfigletAPI(\"" + rowdata.id + "\", \"" + rowdata.TEMPLATE_NAME + "\", \"" + rowdata.NAME + "\");'>" +  //No I18N
                        Ember.I18n.t('webclient.support.submitquery.execute', this) + "</a>"; //No I18N
}

function executeRestConfigletAPI() {
    var operationId = arguments[0];
    var templateName = arguments[1];
    var operationName = arguments[2];
    OPMClient.NCMInventoryRestAPIController.ExecutionOperationId = operationId;
    OPMClient.NCMInventoryRestAPIController.ExecutionTemplateName = templateName;
    OPMClient.NCMInventoryRestAPIController.ExecutionOperationName = operationName;
    gotoExecuteRestTemplate('.'); //No II8N
}

function manageDeviceLinkRenderer(cellValue, options, rowdata, action){
	if(((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected) || 
			(!(OPMClient.ApplicationController.isAuthorized && window.OPM.userPermissions.ncmDevMgmtWrite))){
		return "";
	}
	return "<a class='ncmLink' title='"+Ember.I18n.t("ncm.mid.manageDevice", this)+"' onclick='OPMClient.Inventory.manageDevices(\""+rowdata["id"]+"\")'>" + Ember.I18n.t('webclient.inventory.manage', this) + "</a>";
}

function proConfigeltActionRenderer(cellValue, options, rowdata, action){

	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	var links = "<a style='float:left;' class='ncmLink' title='"+Ember.I18n.t("jsp.common.executeConfiglet", this)+"' onclick='openProConfigletExecute(\""+rowdata.id+"\")'>" + Ember.I18n.t('jsp.commonstr.Execute', this) + "</a>";
	if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.operatorAccess)) { links = ""; }  //No I18N Configlets read gates Execute Configlet

	if(window.OPM.userPermissions.ncmConfigAutomationScheduleRead || window.OPM.userPermissions.operatorAccess) {
		links += "<a style='float:left;margin-left:10px;' class='ncmLink' title='"+Ember.I18n.t('ncm.mid.scheduleCheckConfiglet',this)+"' onclick='openProConfigletSchedule(\""+rowdata.id+"\")'>" + Ember.I18n.t('webclient.general.Schedule', this) + "</a>";
	}
	return links;

}

function configeltActionRendererNew(cellValue, options, rowdata, action)
{
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	var links = "<a style='float:left;' class='ncmLink' title='"+Ember.I18n.t("jsp.common.executeConfiglet", this)+"' onclick='openConfigletExecute(\""+rowdata[0]+"\")'>" + Ember.I18n.t('jsp.commonstr.Execute', this) + "</a>";
	if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.operatorAccess)) { links = ""; }  //No I18N Configlets read gates Execute Configlet
	if(rowdata[2] == 'system' && rowdata[1].indexOf('FlowExport') != -1) {
		links = "";
	}
	if(window.OPM.userPermissions.ncmConfigAutomationScheduleRead || window.OPM.userPermissions.operatorAccess) {
		links += "<a style='float:left;margin-left:10px;' class='ncmLink' title='"+Ember.I18n.t('ncm.mid.scheduleCheckConfiglet',this)+"' onclick='openConfigletSchedule(\""+rowdata[0]+"\")'>" + Ember.I18n.t('webclient.general.Schedule', this) + "</a>";
	}
	return links;
}

function configeltActionRendererSubGrid(cellValue, options, rowdata, action)
{
	if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
		return "";
	}
	var links = "<a style='float:left;' class='ncmLink' title='"+Ember.I18n.t("jsp.common.executeConfiglet", this)+"' onclick='openConfigletExecuteFromGrp(\""+rowdata.id+"\")'>" + Ember.I18n.t('jsp.commonstr.Execute', this) + "</a>";
	if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.operatorAccess)) { links = ""; }  //No I18N Configlets read gates Execute Configlet
	if(rowdata[2] == 'system' && rowdata[1].indexOf('FlowExport') != -1) {
		links = "";
	}
	return links;
}

function advReportActionRender(cellValue, options, rowdata, action)
{
    var links = '<div class="flex flex-middle-align flex-right-align">';

	if(window.OPM.userPermissions.reportsWrite && rowdata.IS_EDITABLE !== undefined && rowdata.IS_EDITABLE === true) {
       links += '<em class="cursorPointer size14 ml-sm mr-sm svgIcon" onclick="openAdvReportActions('+rowdata.id+',\'edit\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit"></use></svg></em>';
    }
	if(window.OPM.userPermissions.reportsRead) {
	    if((!window.OPM.isOPMCentral || window.OPM.isProbe) && (!window.OPM.isMSPCentral || window.OPM.isProbeSelected)){
	       	links += '<i title="'+Ember.I18n.t('webclient.general.Schedule', this)+'" class="cursorPointer fs14 ml-sm mr-sm icon-scheduleReport" onclick="openAdvancedReportSchedule('+rowdata.id+')"></i>';
	    }
	    if(!(window.OPM.isMSPCentral && window.OPM.isProbeSelected)){
	        links += '<i title="'+Ember.I18n.t('ncm.scheduleProperties.pdf', this)+'"class="cursorPointer fs14 ml-sm mr-sm icon-file-pdf hideInProbeSelectedMSPCentral" onclick="openAdvReportActions('+rowdata.id+',\'pdf\')"></i>';
        	links += '<i title="'+Ember.I18n.t('webclient.admin.schedulereports.type.xlsx', this)+'"class="cursorPointer fs14 ml-sm mr-sm icon-file-excel hideInProbeSelectedMSPCentral" onclick="openAdvReportActions('+rowdata.id+',\'xlsx\')"></i>';
        	links += '<em title="'+Ember.I18n.t('ncm.scheduleProperties.csv', this)+'"class="cursorPointer size14 ml-sm mr-sm svgIcon hideInProbeSelectedMSPCentral" onclick="openAdvReportActions('+rowdata.id+',\'csv\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#csv"></use></svg></em>';
	    }
	}
	links += '</div>';
	return links;
}

function openAdvReportActions(report_id, action_type) {
    if(action_type == "edit") {
        location.href = window.apiclientUrl+"Reports/NCM/AdvancedReport/Edit/"+report_id; //No I18N
    } else if(action_type == "pdf" || action_type == "csv" || action_type == "xlsx") {
        var url = window.OPM.apiUrlPattern + "/ncmreports/exportAdvReport?report_id="+report_id+"&export_type="+action_type; //No I18N
        url = appendMSPDetails(url);
        url = appendEEProbeIdForUnifiedConsoleView(url);
        url = appendNCMProbeDetails(url);
        location.href = url;
    }
}

//Depricated
function viewConfigletAssocaition(cellValue, options, rowdata, action)
{
    var executeIcon = '<i title="'+Ember.I18n.t("jsp.common.executeConfiglet",this)+'" style="float:left;margin-left:10px;" title="" onclick="openConfigletExecute(\''+rowdata[0]+'\',\''+rowdata[1]+'\')" class="ui-icon ui-icon-arrowthickstop-1-e pointer"></i>';
    if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.operatorAccess)) { executeIcon = ""; }  //No I18N Configlets read gates Execute Configlet
    if(rowdata[2] == 'system' && rowdata[1].indexOf('FlowExport') != -1) {
        executeIcon = '<i style="float:left;margin-left:10px;" title="" class="ui-icon pointer"></i>';
    }

    var scheduleIcon = '<i title="'+Ember.I18n.t("ncm.mid.scheduleCheckConfiglet",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;margin-right:0" class="icon-scheduleReport" onclick="openConfigletSchedule('+rowdata[0]+')"></i>';
//  var exportbtnFormatter = '<span title="'+Ember.I18n.t("jsp.commonstr.assocDevTemplateFlowExport",this)+'" style="float:left;margin-left:10px;" class="ui-icon ui-icon-extlink pointer" onclick="openFilteredTemplates('+rowdata[0]+', \'FlowExported\')"></span>';
//  var promotebtnFormatter = '<span title="'+Ember.I18n.t("jsp.commonstr.assocDevTemplatePromoted",this)+'" style="float:left;margin-left:10px;" class="ui-icon ui-icon-document pointer" onclick="openFilteredTemplates('+rowdata[0]+', \'Promoted\')"></span>';
    var deletebtnFormatter = '<i title="'+Ember.I18n.t("webclient.general.delete",this)+'" style="margin-left:20px;font-size:16px;cursor:pointer;" class="icon-trash delete" onclick="deleteConfiglets('+rowdata[0]+');"></i>';
    if((window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral)) &&  !window.OPM.isProbeSelected){
    	return "";
    }
    return executeIcon + scheduleIcon + deletebtnFormatter;
}

function openConfigletExecute(configletId,configletName) {
    OPMClient.SettingsNCMConfigController.configletId = configletId;
    OPMClient.SettingsNCMConfigController.executionTemplate = configletName;
    OPMClient.SettingsNCMConfigController.fromConfigletGrid = true;
    location.href = location.href + '/Execute/'+OPMClient.SettingsNCMConfigController.configletId;
}

function openProConfigletExecute(configletId,configletName) {
    OPMClient.SettingsNCMConfigController.configletId = configletId;
    OPMClient.SettingsNCMConfigController.executionTemplate = configletName;
    OPMClient.SettingsNCMConfigController.fromConfigletGrid = true;
    location.href = location.href + '/Execute/'+OPMClient.SettingsNCMConfigController.configletId;
}

function openProConfigletSchedule(configletId) {
    OPMClient.SettingsNCMConfigController.CONFIGLET_ID = configletId;
    location.href = location.href + '/Schedule';
}

function openConfigletExecuteFromGrp(configletId) {
	OPMClient.SettingsNCMConfigController.CONFIGLET_ID = configletId;
    OPMClient.SettingsNCMConfigController.executeConfigletGrp = true;
    location.href = location.href + '/Execute/'+OPMClient.SettingsNCMConfigController.CONFIGLET_ID;
}

function openConfigletSchedule(configletId) {
    OPMClient.SettingsNCMConfigController.CONFIGLET_ID = configletId;
    location.href = location.href + '/Schedule';
}

function openAdvancedReportSchedule(reportId) {
    OPMClient.SettingsNCMConfigController.REPORT_ID = reportId;
    location.href = location.href + '/Schedule';
}

function openFilteredTemplates(configletId, type) {
    OPMClient.SettingsNCMConfigController.CONFIGLET_ID = configletId;
    location.href = location.href + '/' + type;
}

function openFilteredConfiglets(templateId, type) {
    OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID = templateId;
    location.href = location.href + '/' + type;
}

function viewTemplateAction(cellValue, options, rowdata, action)
{
    var exportbtnFormatter = '<span title="'+Ember.I18n.t("jsp.commonstr.assocFlowExportConfiglets",this)+'" style="float:left;margin-left:10px;" class="ui-icon ui-icon-extlink pointer" onclick="openFilteredConfiglets('+rowdata[0]+', \'FlowExported\')"></span>';
    var promotebtnFormatter = '<span title="'+Ember.I18n.t("jsp.commonstr.assocPromotedConfiglets",this)+'" style="float:left;margin-left:10px;" class="ui-icon ui-icon-document pointer" onclick="openFilteredConfiglets('+rowdata[0]+', \'Promoted\')"></span>';
    return exportbtnFormatter + promotebtnFormatter;
}

function refreshMatchingDevices() {

    var CRITERIA_LIST = new Array();
    var children = $("#CriteriaTable > div");
    for (var indexLen = 0; indexLen < children.length; indexLen++) {
        var arrayEl = $(children[indexLen]);
        var cri = {

        };
        if(indexLen==0)
        {
            cri.Comparator = "and"; // No I18N
        }
        else
        {
            cri.Comparator=arrayEl.find('select[name="comparator"]').val();
        }
        cri.Field=arrayEl.find('select[name="parameter"]').val();

        var arry = ['MANAGED','BACKUP_STATUS','ISCONFLICT','BASELINE_ISCONFLICT','COMPLIANCE_STATUS'];
		var criterialFieldID = '';
        if(arry.indexOf(cri.Field) != -1) {
			criterialFieldID = cri.Field+"_pattern";
			cri.Value=arrayEl.find("select[name='"+criterialFieldID+"']").val();
            cri.Condition = "EQUAL";
        } else {
			//criterialFieldID = 'pattern';
        	var $pattern = arrayEl.find('#pattern');
            cri.Value=$pattern.val();
            validatingField = cri.Value;
            cri.Condition = arrayEl.find('select[name="condition"]').val();
            //Checking empty value
            if(validatingField === undefined || validatingField === "" || validatingField === null ){//No I18N
            	$pattern.addClass('validateField error');//No I18N
            	$pattern.attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
            	$pattern.focus();
                opmValidate($pattern);
                $('.validateField').on('focusin',function(){
                    opmValidate($(this));
                });
                $('.validateField').on('focusout',function(){
                    $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
                });
            	return;
            }
        }
        CRITERIA_LIST.push(cri);
    }
    CRITERIA_LIST = JSON.stringify(CRITERIA_LIST);

    $("#addFieldDiv").css("display", "none");
    $("#matchDevices").css("display", "block");

    $('#DEMatchingDevicesListV2').jqGrid('GridUnload');//No I18N
    var defaultOptions = {
        multiselect: false,
        searchOption: true
    };
    populateRemoteApiClientGrid("DEMatchingDevicesListV2", "&CRITERIA_LIST="+encodeURIComponent(CRITERIA_LIST), "#DEMatchingDevicesListV2Pager", "DEMatchingDevicesListV2", defaultOptions); //No I18N
}

function NCMBacktoDG()
{

$("#addFieldDiv").show();
$("#matchDevices").hide();
}

function conditionDisplayFormatter(cellValue, options, rowdata, action)
{
    var exp = rowdata.condition;
    if(exp == 80 || exp == '80') {
        return 'should contain';
    }
    else if(exp == 90 || exp == '90')
    {
        return 'should not contain';
    }
}

function disassocaiter(cellValue, options, rowdata, action) {
    return '<div><img class="inv_opr" src="/apiclient/fluidicv2/img/ncm/dissociaterule.gif"></img></div>'; // No I18N
}

function configletResultPDF(cellValue, options, rowdata, action) {
	if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
		return "";
	}
	var tableName = options.gid;
	var links = "";

	if(tableName === "DEHistoryList"){
		links = "<span style='float:left;' class='fs20' id='pdfIconTd'><i class='icon-file-pdf OpMToolTip' title='"+Ember.I18n.t("webclient.reports.header.pdfview")+"'  style='cursor:pointer;' onclick='getConfigletExecPDF(\""+rowdata[6]+"\")'></i></span>";// No I18N
		links += "<span title='"+Ember.I18n.t("jsp.commonstr.ExportTocsv")+"'  style='float:left;margin-left:20px;margin-top: 5px;' id='csvIconTd' class='csvIcon exportIconsFix'><svg class='exportIconsFix' style='cursor:pointer;' onclick='generateNCMConfigletCSV(\""+rowdata[6]+"\")'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#csv' /></svg></span>";
		links += "<span style='float:left;' class='fs20' id='xlsIconTd'><i class='icon-file-excel OpMToolTip' title='"+Ember.I18n.t("webclient.reports.header.xlview")+"'  style='cursor:pointer;margin-left:10px;' onclick='generateNCMConfigletXLS(\""+rowdata[6]+"\")'></i></span>";
		links += "<span id='configletTextReport' title='"+Ember.I18n.t("jsp.commonstr.ExportToText")+"'style='float:left;margin-left:15px;margin-top:7px;' class='csvIcon exportIconsFix'><svg class='svgIcon size14n' onclick='generateNCMConfigletText(\""+rowdata[6]+"\");' style='cursor:pointer'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#file'/></svg>";
	} else {
		links = "<span style='float:left;' class='fs20' id='pdfIconTd'><i class='icon-file-pdf OpMToolTip' title='"+Ember.I18n.t("webclient.reports.header.pdfview")+"'  style='cursor:pointer;' onclick='getConfigletExecPDF(\""+rowdata[7]+"\")'></i></span>";// No I18N
		links += "<span title='"+Ember.I18n.t("jsp.commonstr.ExportTocsv")+"' style='float:left;margin-left:20px;margin-top: 5px;' id='csvIconTd' class='csvIcon exportIconsFix'><svg class='exportIconsFix OpMToolTip' style='cursor:pointer;' onclick='generateNCMConfigletCSV(\""+rowdata[7]+"\")'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#csv' /></svg></span>";
		links += "<span style='float:left;' class='fs20' id='xlsIconTd'><i class='icon-file-excel OpMToolTip' title='"+Ember.I18n.t("webclient.reports.header.xlview")+"'  style='cursor:pointer;margin-left:10px;' onclick='generateNCMConfigletXLS(\""+rowdata[7]+"\")'></i></span>";
		if(location.href.indexOf('RESTHistory') == -1){
			links += "<span id='configletTextReport' title='"+Ember.I18n.t("jsp.commonstr.ExportToText")+"'style='float:left;margin-left:15px;margin-top:7px;' class='csvIcon exportIconsFix'><svg class='svgIcon size14n' onclick='generateNCMConfigletText(\""+rowdata[7]+"\");' style='cursor:pointer'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#file'/></svg></span>";
		}
	}

	return links;
}
function compPolicyAssociatedDeviceCountFormatter(cellValue, options, rowdata, action){
    var onClickFun = 'OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation(' + rowdata.id + ')';
    return '<div class="policy_associate_btn maxWidthMaxContent" onclick='+onClickFun+'> '+ cellValueEscapeFormat(cellValue) + '</div>'; // NO I18N
}
function compPolicyPercentageFormatter(cellValue, options, rowdata, action){
    if(rowdata) {
        var divId = 'id="compCheckResult_' + rowdata.id + '"';//No I18N
        var divMenuContainerId = 'id="compCheckResultMenuContainer_' + rowdata.id + '"';//No I18N
        if(rowdata.isDisabled) {
            return '<div '+divId+' class="flex flex-middle-align gap-sm"><svg class="svgIcon size14"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#disabled"></use></svg><span>' + Ember.I18n.t("ncm.complianceiq.policy.disabled.msg", this) + '</span></div>';//No I18N
        }
        if(rowdata.isCompCheckRunning && rowdata.isDeviceAssociated) {
            var circularProgressBar = OPMClient.NCMCompliancePolicyController.getLiveCompCheckProgressWithSpan().outerHTML;
            return '<div '+divId+'>' + circularProgressBar + '</div>';//No I18N
        }
        if(rowdata.isEmptyData) {
            if (rowdata.isDeviceAssociated && ['policy', 'ruleGroup'].includes(OPMClient.NCMCompliancePolicyController.selectedItem)) {
                var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
                var nodeId = OPMClient.NCMCompliancePolicyController.selectedItemId;
                if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policy') {
                    return '<div '+ divId + '><div class="policy_associate_btn" onclick="OPMClient.NCMCompliancePolicyController.runComplianceCheckForResource(\''+policyId+'\',\''+rowdata.id+'\',\'' +nodeId+ '\');"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check"></use></svg></em>' + Ember.I18n.t("ncm.mid.runCheckCompliance", this) + '</div></div>'; //No I18N
                } else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'ruleGroup') {
                    var rgId = OPMClient.NCMCompliancePolicyController.getRGId();
                    return '<div '+ divId + '><div class="policy_associate_btn" onclick="OPMClient.NCMComplianceRuleGroupController.runComplianceCheckForResource(\''+policyId+'\',\'' + rgId + '\',\'' +rowdata.id+'\',\'' +nodeId+ '\');"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check"></use></svg></em>' + Ember.I18n.t("ncm.mid.runCheckCompliance", this) + '</div></div>'; //No I18N
                }
            } else {
                return '<div '+divId+'><div class="policy_result_no_data" title="' + Ember.I18n.t("webclient.reports.view.nodata", this) + '">' + Ember.I18n.t("webclient.reports.view.nodata", this) + '</div></div>';//No I18N
            }
        }
        if (rowdata.compliantPercent != 0 || rowdata.violationPercent != 0 || rowdata.notRequiredPercent != 0 || rowdata.attentionPercent != 0) {
            var compliantStyle = rowdata.compliantPercent == 0 ? 'style="display:none;"' : 'style="width:'+rowdata.compliantPercent+'%"';//No I18N
            var violationStyle = rowdata.violationPercent == 0 ? 'style="display:none;"' : 'style="width:'+rowdata.violationPercent+'%"';//No I18N
            var notAvailableStyle = rowdata.notRequiredPercent == 0 ? 'style="display:none;"' : 'style="width:'+rowdata.notRequiredPercent+'%"';//No I18N
            var attentionStyle = rowdata.attentionPercent == 0 ? 'style="display:none;"' : 'style="width:'+rowdata.attentionPercent+'%"';//No I18N
            var toRet = '<div '+divId+' title="">';
            toRet += '<div class="multistep_progress_bar_with_legends"><div class="multistep_progress_legends">';
            toRet += '<div class="legend_step_1 progress_compliant">'+rowdata.compliantPercent+'%</div>';
            toRet += '<div class="legend_step_2 progress_violation">'+rowdata.violationPercent+'%</div>';
            toRet += '<div class="legend_step_3 progress_not_required">'+rowdata.notRequiredPercent+'%</div>';
            toRet += '<div class="legend_step_4 progress_attention">'+rowdata.attentionPercent+'%</div></div>';
            toRet += '<div class="multistep_progress_bar">';
            toRet += '<div class="progress_step_1 progress_compliant" '+compliantStyle+' data-tooltip="Devices with Configuration Change: 4"></div>';
            toRet += '<div class="progress_step_2 progress_violation" '+violationStyle+' data-tooltip="Devices with Configuration Change: 4"></div>';
            toRet += '<div class="progress_step_3 progress_not_required" '+notAvailableStyle+' data-tooltip="Devices"></div>';
            toRet += '<div class="progress_step_4 progress_attention" '+attentionStyle+' data-tooltip="Devices"></div></div></div>';
            /*toRet += '<div '+divMenuContainerId+' class="dropdown_menu_content_container bottom_right info">';
            toRet += '<div class="dropdown_menu_content">';
            toRet += '<ul>';
            toRet += getLiElementForCompResult('status_compliant', 'compliant-duo', 'webclient.common.compliant', rowdata.compliantPercent);
            toRet += getLiElementForCompResult('status_violation', 'violation-duo', 'jsp.commonstr.Violation', rowdata.violationPercent);
            toRet += getLiElementForCompResult('status_not_required', 'not-required', 'ncm.complianceiq.status.not_required', rowdata.notRequiredPercent);
            toRet += getLiElementForCompResult('status_attention', 'attention-duo', 'webclient.map.view.attention', rowdata.attentionPercent);
            toRet += '</ul></div></div>';*/
            toRet += '</div>';
            return toRet;
        }
        if (rowdata.isDeviceAssociated) {
            return '<div '+ divId + '><div class="policy_associate_btn" onclick="OPMClient.NCMCompliancePolicyController.runComplianceCheck(\''+rowdata.id+'\',\''+'null'+'\',\'true\');"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check"></use></svg></em>' + Ember.I18n.t("ncm.mid.runCheckCompliance", this) + '</div></div>'; //No I18N
        } else {
            if (window.OPM.userPermissions.ncmComplianceWrite) {
                return '<div ' + divId + '><div class="policy_associate_btn" onclick="OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation(\''+rowdata.id+'\');"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em>' + Ember.I18n.t("ncm.name.associatedevices", this) + '</div></div>'; //No I18N
            } else {
                return '<div '+divId+'><div class="policy_result_no_data" title="' + Ember.I18n.t("ncm.complianceiq.policy.no.device.associated", this) + '">' + Ember.I18n.t("ncm.complianceiq.policy.no.device.associated", this) + '</div></div>';//No I18N
            }
        }
    }
    return '<div class="policy_result_no_data" title="' + Ember.I18n.t("webclient.reports.view.nodata", this) + '">' + Ember.I18n.t("webclient.reports.view.nodata", this) + '</div>';//No I18N
}
function getLiElementForCompResult(svgClass, iconName, textKey, percent) {
    var toRet = '<li class="flex flex-middle-align"><div class="dropdown_listing_icon">';
    toRet += getSvgForCompResult('size18', svgClass, iconName);
    toRet += '</div>';
    toRet += '<div class="dropdown_listing_content">';
    toRet += '<p class="limit_single_line">' + Ember.I18n.t(textKey, this) + ' <b>'+percent+'%</b></p></div></li>';
    return toRet;
}
function getSvgForCompResult(iconSize, svgClass, iconName) {
    return '<svg class="svgIcon '+iconSize+' '+svgClass+'"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#'+iconName+'"></use></svg>';
}
function compPolicyActionsFormatter(cellValue, options, rowdata, action){
    var runCompCheckAction = "onclick='OPMClient.NCMCompliancePolicyController.runComplianceCheck(\"" + rowdata.id + "\",\"null\",\"true\")'"; //No I18N
    /*var policyNodeId = OPMClient.NCMCompliancePolicyController.selectedItemId + '_policy_' + rowdata.id;
    var isFav = OPMClient.NCMCompliancePolicyController.policyCompInstance.getNodeData(policyNodeId).data.isFavourite;
    var markAsFavAction = "onclick='OPMClient.NCMCompliance.addRemovePolicyAsFav(\"" + policyNodeId + "\","+isFav+","+true+")'";*/
    /*var runAdhocAction = "onclick='OPMClient.NCMCompliancePolicyController.runAdhocCheck(\"" + rowdata.id + "\")'";
    var runOfflineAction = "onclick='OPMClient.NCMCompliancePolicyController.runOfflineCheck(\"" + rowdata.id + "\")'";*/
    var associateDevicesAction = "onclick='OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation(\"" + rowdata.id + "\")'";
    /*var cloneAction = "onclick='OPMClient.NCMCompliancePolicyController.clonePolicies(\""+rowdata.id+"\",\""+rowdata.COMPPOLICY_NAME+"\")'";*/
    var editAction = "onclick='OPMClient.NCMCompliancePolicyController.loadPolicyEdit(\"" + rowdata.id + "\")'";
    var deleteAction = "onclick='OPMClient.NCMCompliancePolicyController.deletePolicy(\""+rowdata.id+"\")'";
    var disableAction = "onclick='OPMClient.NCMCompliancePolicyController.enableDisablePolicy(\""+rowdata.id+"\",\""+rowdata.isDisabled+"\")'";
    var menuId = 'id="compPolicyActionMenu_' + rowdata.id + '"';//No I18N
    var menuContentDivId = 'id="compPolicyActionMenuContainer_' + rowdata.id + '"';//No I18N
    var toRet = "";
    if (!rowdata.isDisabled) {
        toRet += '<ul class="policy_grid_action_icon">';
        if(window.OPM.userPermissions.ncmComplianceWrite) {
            toRet += '<li class="run_check_btn" '+runCompCheckAction+' title="' + Ember.I18n.t("ncm.mid.runCheckCompliance", this) + '">'+Ember.I18n.t('webclient.admin.archive.run')+'</li>';
            toRet += '<li '+associateDevicesAction+' title="' + Ember.I18n.t("ncm.name.associatedevices", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-devices"/></svg></em></li>';
        }
        if (window.OPM.userPermissions.ncmComplianceRead) {
            toRet += '<li '+editAction+' title="' + Ember.I18n.t("webclient.ncmeditpolicy", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil"/></svg></em></li>';
        }
        if (window.OPM.userPermissions.ncmComplianceWrite) {
            toRet += '<li id="actionMenuLi"><svg class="svgIcon size18"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#DotsThreeVertical"></use></svg></li>';
        }
//        toRet += '<div '+menuId+' class="dropdown_menu_main_container hover">';
//        toRet += '<div '+menuContentDivId+' class="dropdown_menu_content_container bottom_left"><div class="dropdown_menu_content"><ul>';
////        toRet += getLiElementForCompPolicyGridActionMenu(markAsFavAction, 'star-o', isFav ? 'Remove from Favourites' : 'Mark as Favourite');
//        toRet += getLiElementForCompPolicyGridActionMenu(runAdhocAction, 'run-adhoc', Ember.I18n.t("ncm.mid.runAdhocTest", this));
//        toRet += getLiElementForCompPolicyGridActionMenu(runOfflineAction, 'run-adhoc', Ember.I18n.t("ncm.complianceiq.check.offline", this));
//        if(window.OPM.userPermissions.ncmComplianceWrite) {
//            toRet += getLiElementForCompPolicyGridActionMenu(cloneAction, 'clone-copy', Ember.I18n.t("ncm.complianceiq.policy.clone", this));
//            toRet += getLiElementForCompPolicyGridActionMenu(deleteAction, 'Trash', Ember.I18n.t("webclient.action.delete", this));
//            toRet += getLiElementForCompPolicyGridActionMenu(disableAction, 'disabled', Ember.I18n.t("jsp.commonstr.Disable", this));
//        }
//        toRet += '</ul></div></div></div>';
        toRet += '</ul>';
    } else {
        if(window.OPM.userPermissions.ncmComplianceWrite) {
            toRet += '<ul class="policy_grid_action_icon">';
            toRet += '<li '+disableAction+' title="' + Ember.I18n.t("webclient.action.enable", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable"/></svg></em></li>';
            if (rowdata.POLICY_STANDARD === 'CUSTOM') {
                toRet += '<li '+deleteAction+' title="' + Ember.I18n.t("webclient.action.delete", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#Trash"/></svg></em></li>';
            }
            toRet += '</ul>';
        }
    }
    return toRet;
}
function getLiElementForCompPolicyGridActionMenu(onClick, icon, textContent) {
    var toRet = '<li class="flex flex-middle-align" '+onClick+'>';
    toRet += '<div class="dropdown_listing_icon with_bg">';
    toRet += '<svg class="svgIcon size14"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#'+icon+'"></use></svg>';
    toRet += '</div>';
    toRet += '<div class="dropdown_listing_content"><p class="limit_single_line">'+textContent+'</p></div></li>';
    return toRet;
}
function compRuleRemediationFormatter(cellValue, options, rowdata, action){
    // The remediation column is only meaningful to roles that can execute a configlet on
    // devices - same gate as the rule's own remediation block.
    if(!window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite) {
        return '--'; // No I18N
    }
    if(rowdata) {
        if(rowdata.isCompCheckRunning) {
            var toRet = '<div class="policy_ruleGrid_result flex flex-middle-align gap-sm">';
            toRet += OPMClient.NCMCompliancePolicyController.getLiveCompCheckProgressDiv().outerHTML;
            toRet += '</div>';
            return toRet;
        }
        if(['NOT_APPLICABLE', 'APPLICABLE'].includes(rowdata.CONSOLIDATE_RESULT) || rowdata.isManualReviewRequired) {
            return '--'; // No I18N
        }
        if (rowdata.RemediationDetails === 'Click to view flow details') {
            var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
            var ruleId = OPMClient.NCMCompliancePolicyController.getRuleId();
            return "<a style='float:left;' class='ncmLink' title='" + Ember.I18n.t("ncm.complianceiq.remediation.click.to.view.msg", this) + "' onclick='OPMClient.NCMComplianceRulesController.loadRuleResultView(\""+ruleId+"\",\""+rowdata.id+"\",\""+policyId+"\",\"true\")'>View</a>";
        }
        if(rowdata.RemediationDetails === 'No remediation details available') {
            return Ember.I18n.t("ncm.complianceiq.remediation.no.data.msg", this);// No I18N
        }
        return rowdata.RemediationDetails;
    }
    return '<div class="policy_ruleGrid_result"><span class="no_underline">--</span></div>';// No I18N
}
function compRuleDevStatusFormatter(cellValue, options, rowdata, action){
    if(cellValue && rowdata) {
        if(cellValue.isCompCheckRunning) {
            var toRet = '<div class="policy_ruleGrid_result flex flex-middle-align gap-sm">';
            toRet += OPMClient.NCMCompliancePolicyController.getLiveCompCheckProgressDiv().outerHTML;
            toRet += '</div>';
            return toRet;
        }
        if(cellValue === '-') {
            return '<div class="policy_ruleGrid_result"><span class="no_underline">--</span></div>';
        }
        var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
        var ruleId = OPMClient.NCMCompliancePolicyController.getRuleId();
        var onClickResult = "onclick=OPMClient.NCMComplianceRulesController.loadRuleResultView(\""+ruleId+"\",\""+rowdata.id+"\",\""+policyId+"\")";
        var compStatusMap = {
            'COMPLIANT': { icon: 'compliant-duo', svgClass: 'status_compliant', key: 'ncm.complianceiq.mark.as.compliant'},
            'VIOLATION': { icon: 'violation-duo', svgClass: 'status_violation', key: 'ncm.complianceiq.mark.as.violation' },
            'APPLICABLE': { icon: 'check-circle-duotone', svgClass: 'status_applicable', key: 'ncm.complianceiq.mark.as.applicable'},
            'NOT_REQUIRED': { icon: 'not-required', svgClass: 'status_not_required', key: 'ncm.complianceiq.mark.as.notRequired' },
            'NOT_APPLICABLE': { icon: 'not-applicable-duo-new', svgClass: 'status_not_applicable', key: 'ncm.complianceiq.mark.as.notApplicable'},
            'ATTENTION': { icon: 'attention-duo', svgClass: 'status_attention', key: 'ncm.complianceiq.mark.as.attention' }
        }
        var resultMap = compStatusMap[cellValue];
        var uniqueId = 'ruleDeviceResult_' + rowdata.id + '_' + ruleId; //No I18N
        var divId = 'id="' + uniqueId + '"';//No I18N

        var onClickUpdateRuleStatus = "OPMClient.NCMCompliance.updateRuleComplianceStatus(" + ruleId + "," + policyId + "," + rowdata.id + ",'" + cellValue + "',this.dataset.value)";
        // The below method will handle rule status update dropdown by forming HTML dynamically and position it manually to avoid UI issues
        var onClickOpenDropdown = "onclick=\"OPMClient.NCMCompliance.openCloseRuleDeviceResult('" + uniqueId + "','" + cellValue + "'," + rowdata.isManualReviewRequired + ",'" + onClickUpdateRuleStatus.replace(/'/g, "\\'") + "')\"";

        var toRet = '<div '+divId+' class="policy_ruleGrid_result rule_grid_status_selection policy_rg_dropdown">';
        toRet += '<div class="rule-grid-selected_option" title="'+cellValue+'">';
        toRet += '<div>';
        toRet += getSvgForCompResult('size20', resultMap.svgClass, resultMap.icon);
        if(!['NOT_APPLICABLE', 'APPLICABLE'].includes(cellValue)) {
            toRet += "<span "+onClickResult+">"+cellValue+"</span>";
        } else {
            toRet += "<span class='no_underline'>"+cellValue+"</span>";
        }
        if(cellValue !== 'APPLICABLE') {
            if(window.OPM.userPermissions.ncmComplianceWrite) {
                toRet += '<svg class="size12 policy_rule_edit_onHover" ' + onClickOpenDropdown + '><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit-o"></use></svg>';
            }
        } else {
            var applicableTitle = 'title="' + Ember.I18n.t("ncm.complianceiq.rule.applicable.info.msg", this) + '"';
            toRet += '<svg class="size12 policy_rule_edit_onHover" '+applicableTitle+'><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#info-duotone"></use></svg>';
        }
        toRet += '</div></div>';
        return toRet;
    }
    return '<div class="policy_ruleGrid_result"><span class="no_underline">--</span></div>';// No I18N
}
function compRuleCondResultFormatter(cellValue, options, rowdata, action){
    if(rowdata) {
        if(rowdata.isCompCheckRunning) {
            var toRet = '<div class="policy_ruleGrid_result flex flex-middle-align gap-sm">';
            toRet += OPMClient.NCMCompliancePolicyController.getLiveCompCheckProgressDiv().outerHTML;
            toRet += '</div>';
            return toRet;
        }
        if(['NOT_APPLICABLE','APPLICABLE'].includes(rowdata.CONSOLIDATE_RESULT) || rowdata.isManualReviewRequired) {
            return '--'; //No I18N
        }
        var ruleId = OPMClient.NCMCompliancePolicyController.getRuleId();
        var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
        return "<a style='float:left;' class='ncmLink' title='" + Ember.I18n.t("ncm.complianceiq.rule.clickToView.execution.details", this) + "' onclick='OPMClient.NCMComplianceRulesController.loadRuleResultView(\""+ruleId+"\",\""+rowdata.id+"\",\""+policyId+"\")'>" + Ember.I18n.t("webclient.View", this) + "</a>";
	}
	return '<div class="policy_ruleGrid_result"><span class="no_underline">--</span></div>';// No I18N
}
function compRuleResultFormatter(cellValue, options, rowdata, action, bulkRemediation){
    if(cellValue && rowdata) {
        if(cellValue.isCompCheckRunning) {
            var toRet = '<div class="policy_ruleGrid_result flex flex-middle-align gap-sm">';
            toRet += OPMClient.NCMCompliancePolicyController.getLiveCompCheckProgressDiv().outerHTML;
            toRet += '</div>';
            return toRet;
        }
        if(cellValue.compResult === '-') {
            return '<div><span class="no_underline">NA</span></div>';
        }
        var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
        var onClickResult = "onclick=OPMClient.NCMComplianceRulesController.loadRuleResultView(\""+cellValue.ruleId+"\",\""+rowdata.id+"\",\""+policyId+"\")";
        var compStatusMap = {
            'COMPLIANT': { icon: 'compliant-duo', svgClass: 'status_compliant', key: 'ncm.complianceiq.mark.as.compliant'},
            'VIOLATION': { icon: 'violation-duo', svgClass: 'status_violation', key: 'ncm.complianceiq.mark.as.violation' },
            'APPLICABLE': { icon: 'check-circle-duotone', svgClass: 'status_applicable', key: 'ncm.complianceiq.mark.as.applicable'},
            'NOT_REQUIRED': { icon: 'not-required', svgClass: 'status_not_required', key: 'ncm.complianceiq.mark.as.notRequired' },
            'NOT_APPLICABLE': { icon: 'not-applicable-duo-new', svgClass: 'status_not_applicable', key: 'ncm.complianceiq.mark.as.notApplicable'},
            'ATTENTION': { icon: 'attention-duo', svgClass: 'status_attention', key: 'ncm.complianceiq.mark.as.attention' }
        }
        var resultMap = compStatusMap[cellValue.compResult];
        if(cellValue.compResult === 'VIOLATION' && cellValue.severity){
            resultMap.svgClass += (' ' +cellValue.severity.toLowerCase());
        }
        var uniqueId = 'ruleDeviceResult_' + rowdata.id + '_' + cellValue.ruleId; //No I18N
        var divId = 'id="' + uniqueId + '"';//No I18N
        var onClickUpdateRuleStatus = "OPMClient.NCMCompliance.updateRuleComplianceStatus(" + cellValue.ruleId + "," + policyId + "," + rowdata.id + ",'" + cellValue.compResult + "',this.dataset.value)";
        // The below method will handle rule status update dropdown by forming HTML dynamically and position it manually to avoid UI issues
        var onClickOpenDropdown = "onclick=\"OPMClient.NCMCompliance.openCloseRuleDeviceResult('" + uniqueId + "','" + cellValue.compResult + "'," + cellValue.isManualReviewRequired + ",'" + onClickUpdateRuleStatus.replace(/'/g, "\\'") + "')\"";
        var toRet = '<div ' + divId + ' class="policy_ruleGrid_result rule_grid_status_selection policy_rg_dropdown" data-rule-id="' + cellValue.ruleId + '">';
        toRet += '<div class="rule-grid-selected_option" title="'+cellValue.compResult+'">';
        toRet += '<div>';
        if(bulkRemediation){
            toRet += '<input name="remediationColCheckBox" type="checkbox"/>';
        }
        toRet += getSvgForCompResult('size20', resultMap.svgClass, resultMap.icon);
        if(!['NOT_APPLICABLE', 'APPLICABLE'].includes(cellValue.compResult)) {
            toRet += "<span "+onClickResult+">"+cellValue.compResult+"</span>";
        } else {
            toRet += "<span class='no_underline'>"+cellValue.compResult+"</span>";
        }
        if(!bulkRemediation){
            if(cellValue.compResult !== 'APPLICABLE') {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    toRet += '<svg class="size12 policy_rule_edit_onHover" ' + onClickOpenDropdown + '><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit-o"></use></svg>';
                }
            } else {
                var applicableTitle = 'title="' + Ember.I18n.t("ncm.complianceiq.rule.applicable.info.msg", this) + '"';
                toRet += '<em '+applicableTitle+'><svg class="size12 policy_rule_edit_onHover"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#info-duotone"></use></svg></em>';
            }
        }
        else{
            if(cellValue.isRemediationExecuted){
                return '<div class="policy_ruleGrid_result remediation_applied"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#checkmark-circle"/></svg></em><span class="no_underline" title="' + Ember.I18n.t('ncm.complianceiq.bulk_remediation.state.remediated.title', this) + '">' + Ember.I18n.t("ncm.complianceiq.bulk_remediation.state.remediated", this) + '</span></div>';
            }
        }
        toRet += '</div></div>';
        return toRet;
    }
//    if ((!cellValue || cellValue.isRemediationExecuted) && bulkRemediation) {
//        return '<div class="policy_ruleGrid_result remediation_applied"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#checkmark-circle"/></svg></em><span class="no_underline" title="' + Ember.I18n.t('ncm.complianceiq.bulk_remediation.state.remediated.title', this) + '">' + Ember.I18n.t("ncm.complianceiq.bulk_remediation.state.remediated", this) + '</span></div>';
//    }
    return '<div class="policy_ruleGrid_result"><span class="no_underline">--</span></div>';// No I18N
}
function compResultFormatter(cellValue, options, rowdata, action){
    if(cellValue) {
        var compStateIconMap = { 'COMPLIANT': 'compliant-duo', 'VIOLATION': 'violation-duo', 'NOT_REQUIRED': 'not-required', 'NOT_APPLICABLE': 'not-applicable-duo-new', 'ATTENTION': 'attention-duo', 'APPLICABLE': 'check-circle-duotone' }; // No I18N
        var compStateCssMap = { 'COMPLIANT': 'status_compliant', 'VIOLATION': 'status_violation', 'NOT_REQUIRED': 'status_not_required', 'NOT_APPLICABLE': 'status_not_applicable', 'ATTENTION': 'status_attention', 'APPLICABLE': 'status_applicable' }; // No I18N
        var compStateKeyMap = { 'COMPLIANT': 'webclient.common.compliant', 'VIOLATION': 'jsp.commonstr.Violation', 'NOT_REQUIRED': 'ncm.complianceiq.status.not_required', 'NOT_APPLICABLE': 'webclient.general.not.applicable', 'ATTENTION': 'webclient.map.view.attention', 'APPLICABLE': 'ncm.complianceiq.applicable' }; // No I18N
        var toRet = '<div class="device_rule_result">';
        var severityCss = '';
        if(cellValue === 'VIOLATION' && rowdata.VIOLATION_SEVERITY){
            severityCss = ' '+rowdata.VIOLATION_SEVERITY.toLowerCase();
        }
        toRet += '<svg class="svgIcon size18 ' + compStateCssMap[cellValue] + severityCss + '"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + compStateIconMap[cellValue] + '"></use></svg>'; // No I18N
        toRet += '<span>' + Ember.I18n.t(compStateKeyMap[cellValue], this) + '</span>'; // No I18N
        toRet += '</div>';
        return toRet;
    }
    return cellValue;
}
function iconColumnrenderer(cellValue, options, rowdata, action)
{
	var tableName = options.gid;
    var status='disable'; //No I18n
    var row=rowdata[0];
    if(cellValue == '1'){
		status='DISABLE'; //No I18n
		return "<div class='chkRoundBtn'><input type='checkbox' onchange='enableNotification(\"" + status + "\",\"#"+tableName+"\",\""+rowdata[0]+"\",\"enable\",\"disable\")' checked name='' id='enable'><label></label></div>";//No I18N
    }  else if(cellValue == '0'){
		status ="ENABLE";//No I18N
		return "<div class='chkRoundBtn'><input type='checkbox' onchange='enableNotification(\"" + status + "\",\"#"+tableName+"\",\""+rowdata[0]+"\",\"disable\",\"enable\")' name='' id='disable'><label></label></div>";//No I18N
    }
    else
    {
        return '<div><img class="inv_opr" src="'+cellValue+'"></img></div>'; // No I18N
    }
}

function viewAssociatedGroups(cellValue, options, rowdata, action)
{
    return '<span title="'+Ember.I18n.t('jsp.compliance.associated.rulegroups', this)+'"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em></span>';
}

function viewAssociatedPoliciesAndRGsForRG(cellValue, options, rowdata, action)
{
    if(!window.OPM.userPermissions.ncmComplianceWrite){
        return '<span title="'+Ember.I18n.t('ncm.complianceiq.associateToPoliciesRuleGroups.msg', this)+'" onclick="OPMClient.NCMComplianceUtilController.loadMsgAndClear(\'errorMsg\', \''+Ember.I18n.t('ncm.AuthorizationRestriction', this)+'\')"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em></span>';
    }
    if(rowdata.isDisabled) {
        var disableAction = "onclick='OPMClient.NCMComplianceRuleGroupController.enableDisableRuleGroup(\"" + rowdata.id + "\",\"" + true + "\",\"" + false + "\",\"" + true + "\")'";
        var toRet = '<ul class="policy_grid_action_icon">';
        toRet += '<li '+disableAction+' title="' + Ember.I18n.t("webclient.action.enable", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable"/></svg></em></li>';
        toRet += '</ul>';
        return toRet;
    }
    return '<span title="'+Ember.I18n.t('ncm.complianceiq.associateToPoliciesRuleGroups.msg', this)+'" onclick="OPMClient.NCMComplianceRuleGroupController.loadRuleGroupAssociation(\''+rowdata.id+'\',\'ListGroups\')"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em></span>';
}
function viewAssociatedPoliciesAndRGsForRule(cellValue, options, rowdata, action)
{
    if(!window.OPM.userPermissions.ncmComplianceWrite){
        return '<span title="'+Ember.I18n.t('ncm.complianceiq.associateToPoliciesRuleGroups.msg', this)+'" onclick="OPMClient.NCMComplianceUtilController.loadMsgAndClear(\'errorMsg\', \''+Ember.I18n.t('ncm.AuthorizationRestriction', this)+'\')"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em></span>';
    }
    if(rowdata.isDisabled) {
        var disableAction = "onclick='OPMClient.NCMComplianceRulesController.enableDisableRule(\"" + rowdata.id + "\",\"" + true + "\",\"" + false + "\",\"" + true + "\")'";
        var toRet = '<ul class="policy_grid_action_icon">';
        toRet += '<li '+disableAction+' title="' + Ember.I18n.t("webclient.action.enable", this) + '"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable"/></svg></em></li>';
        toRet += '</ul>';
        return toRet;
    }
    return '<span title="'+Ember.I18n.t('ncm.complianceiq.associateToPoliciesRuleGroups.msg', this)+'" onclick="OPMClient.NCMComplianceRulesController.loadRuleAssociation(\''+rowdata.id+'\',\'ListRules\')"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-file"></use></svg></em></span>';
}

function ruleNameFormatterNew(cellValue, options, rowdata, action)
{
    var href = 'compliant-duo'; // NO I18N
    var className = 'status_compliant'; // NO I18N
    if(rowdata.STATUS == 'VIOLATION'){ // NO I18N
        href = 'violation-duo'; // NO I18N
        className = 'status_violation'; // NO I18N
    }
    else if(rowdata.STATUS == 'ATTENTION'){ // NO I18N
        href = 'attention-duo'; // NO I18N
        className = 'status_attention'; // NO I18N
    }

    return '<div class="adhoc_result_rule_nameIcon '+className+'"><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#'+href+'"></use></svg></em><span>'+escapeHTML(cellValue)+'</span></div>'; // NO I18N
}
function viewAssociatedDevices(cellValue, options, rowdata, action)
{
    return '<span title="'+Ember.I18n.t('ncm.name.associatedevices', this)+'"><em class="svgIcon size18"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#associate-devices"></use></svg></em></span>';
}
function scheduleStatusFormatter(cellValue, options, rowdata, action)
{
    var tableName ="#DEAllSchedulesList";//No I18N
    var status='disable'; //No I18n
    var row=rowdata[0] ? rowdata[0] : rowdata.id;
    if(cellValue == '3'){
        status='ENABLE'; //No I18n
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableSchedule(\"DISABLE\",\""+tableName+"\",\""+row+"\")' checked name=''><label></label></div>";//No I18N
    }  else if(cellValue == '4'){
        status ="DISABLE";//No I18N
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableSchedule(\"ENABLE\",\""+tableName+"\",\""+row+"\")' name=''><label></label></div>";//No I18N
    }
}
function scheduleStatusFormatterv2(cellValue, options, rowdata, action)
{
    var tableName ="#DEAllSchedulesList";//No I18N
    var status='disable'; //No I18n
    var row=rowdata["ADMIN_STATUS"];
    if(cellValue == '3'){
        status='ENABLE'; //No I18n
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableSchedule(\"DISABLE\",\""+tableName+"\",\""+rowdata["id"]+"\")' checked name=''><label></label></div>";//No I18N
    }  else if(cellValue == '4'){
        status ="DISABLE";//No I18N
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableSchedule(\"ENABLE\",\""+tableName+"\",\""+rowdata["id"]+"\")' name=''><label></label></div>";//No I18N
    }
}
function formatNCMScheduleRun(cellValue, options, rowdata, action)
{
	return "<a class='ncmLink' title='" + Ember.I18n.t('ncm.schedule.run.executeNow.desc') + "' onclick='runSchedule(\"" + rowdata[0] + "\",\""+rowdata[3]+"\",\""+rowdata[4]+"\")'>" + Ember.I18n.t("webclient.Execute.Now", this) + "</a>";//No I18N
}

var ncmNotificationActionTypes = {};
function ncmEditNotificationActionById(actionId) {
	OPMClient.NCMConfigAutomationModel.addEditChangeManagementAction(ncmNotificationActionTypes[actionId], "Edit", actionId); //No I18N
}

function ncmNotificationActionOperations(cellValue, options, rowdata, action)
{
    if (!rowdata || !rowdata.isEditable) {
        return "";
    }
	// only the numeric id goes into the handler; the type is looked up from the row data
	var actionId = parseInt(rowdata.id, 10);
	ncmNotificationActionTypes[actionId] = rowdata.type;
	var col = "<i class='icon-configedit' style='margin-left:0 !important; font-size:16px; cursor:pointer;' title='"+escapeHTML(Ember.I18n.t('webclient.title.edit',this))+"' onclick='ncmEditNotificationActionById(" + actionId + ")'></i>"; //No I18N
	col += "<i class='icon-trash delete' style='font-size:16px; cursor:pointer;' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='OPMClient.NCMConfigAutomationModel.deleteChangeManagementAction(" + rowdata.id + ")'></i>"; //No I18N
	return col;
}

function formatNCMExecuteRequest(cellValue, options, rowdata, action)
{
	return "<a class='ncmLink' title='" + Ember.I18n.t('webclient.Execute.Now') + "' onclick='executeRequest(\"" + rowdata['id'] + "\")'>" + Ember.I18n.t("webclient.Execute.Now", this) + "</a>";//No I18N
}

function formatDeleteExecuteRequest(cellValue, options, rowdata, action) {
    var id = (options.gid === "DEPendingRequestList")? rowdata[0] : rowdata['request_id'];

    if((window.OPM.isNCMPowerUser)|| (!window.OPM.userPermissions.ncmConfigAutomationUploadRequestsWrite && !window.OPM.userPermissions.operatorAccess)) { //No I18N
        return ""; //No I18N
    }
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;'  onclick='OPMClient.NCMConfigAutomationModel.deleteRequest(\""+ options.gid +"\",\"" + id + "\")'></i>"; //No I18n
}



function ShowConfilctFormatter(cellValue, options, rowdata, action) {
    var showConflict = Ember.I18n.t('jsp.common.showConflict',this); // No I18N
    return '&nbsp;<u>'+ showConflict +'</u>'; // No I18N
}

//ignorei18n_end
function getDeleteBtn()
{
    return "<div id='opmBtndeleteBtn' class='opmBtn deleteBtn' onclick='OPMClient.Settings.deleteMultipleTraps()'\">"+Ember.I18n.t('webclient.dashboards.delete',this)+"</div>";
}
function showWindowsSeverity(cellValue, options, rowdata, action)
{
    if(cellValue === "True"){//No I18N
        return "<i class='icon-status5'></i> "+Ember.I18n.t('webclient.map.mapsymboldetails.discover.yes',this);//No I18N
    }else if(cellValue === "False"){//No I18N
        return "<i class='icon-status1'></i> "+Ember.I18n.t('webclient.map.mapsymboldetails.discover.no',this);//No I18N
    }
    else if(cellValue === "Disabled"){//No I18N
        return "<i class='icon-status7'></i> "+Ember.I18n.t('webclient.devices.intftypes.disabled',this);//No I18N
    }

}
function addonDownloadLink(tool){
    if(tool === "sdp"){//No I18N
        return Ember.I18n.t('webclient.addon.sdpdownload',this)+"<div class='opmBtn addUserBtn'>"+Ember.I18n.t('webclient.billing.download',this)+"</div></a>";//No I18N
    }else if(tool === "apm"){//No I18N
        return Ember.I18n.t('webclient.addon.apmdownload',this)+"<div class='opmBtn addUserBtn' >"+Ember.I18n.t('webclient.billing.download',this)+"</div></a>";//No I18N
    }

}
function setAsImgLink(cellValue, options, rowdata, action)
{
    return !isNaN(cellValue) ? "<i class='--fault-severity icon-status"+cellValue+"'></i>" : "";//No I18N
}
function setPerformanceLastColData(cellValue, options, rowdata, action){
    var returnVal = "";
    if(cellValue !== undefined && cellValue.length > 0){
        if(rowdata.graphType == "tabulardata") // No I18N
        {
            if(rowdata.data && rowdata.data.length > 1) {
                returnVal = '<a class="opm_link" onclick="showMoreLastPolledValue(\'' + options.rowId + '\')">' + Ember.I18n.t("webclient.snmp.viewtabularData") + '...</a>';
                OPMClient.DeviceMonitorsActionController.multipleInstanceData.push({rowId:options.rowId,data:cellValue,displayName:$($.parseHTML(rowdata.DISPLAYNAME)).text(),unit:rowdata.YAXISTEXT,graphType:rowdata.graphType});
                return returnVal;
            }

            return '';
        }


        if(cellValue.length > 1){
            if(cellValue[0].avgValue !== undefined) {
                returnVal = opm_escapeHTML(cellValue[0].avgValue);
            } else {
                var firstValue = opm_escapeHTML(cellValue[0].value);
                returnVal = opm_escapeHTML(cellValue[0].instance)+": "+firstValue;
            }
            returnVal = "<i title='"+returnVal+"'>"+returnVal+"<br/><a class='opm_link' onclick=showMoreLastPolledValue(\""+options.rowId+"\");>"+Ember.I18n.t('webclient.admin.viewinstances',this)+"...</a></i>";//No I18N
            OPMClient.DeviceMonitorsActionController.multipleInstanceData.push({rowId:options.rowId,data:cellValue,displayName:$($.parseHTML(rowdata.DISPLAYNAME)).text(),unit:rowdata.YAXISTEXT});
        }else{
            var firstValue = opm_escapeHTML(cellValue[0].value);
            if(firstValue.toString().length <= 50){
                returnVal = "<i title='"+firstValue+"'>"+firstValue+"</i>";//No I18N;
            }
            else{
                returnVal = "<div id='lastPolledValueOne_"+options.rowId+"' title='"+firstValue+"'><span>"+(firstValue).toString().substr(0,50)+"..</span> <a onclick=togglelastPolledValue(\""+options.rowId+"\"); class='opm_link'>"+Ember.I18n.t('webclient.admin.viewmore',this)+"..</a></div>";
                returnVal += "<div id='lastPolledValueTwo_"+options.rowId+"' title='"+firstValue+"' style='display:none;'><span>"+firstValue+"</span> <a onclick=togglelastPolledValue(\""+options.rowId+"\"); class='opm_link'>"+Ember.I18n.t('webclient.admin.viewless',this)+"..</a></div>";
            }
        }
    }
    return returnVal;
}
function togglelastPolledValue(id){
    $('#lastPolledValueOne_'+id).toggle();
    $('#lastPolledValueTwo_'+id).toggle();
}
function showMoreLastPolledValue(rowId){
    OPMClient.DeviceMonitorsActionController.set('graphMonObj',OPMClient.DeviceMonitorsActionController.get('multipleInstanceData')[OPMClient.DeviceMonitorsActionController.get('multipleInstanceData').map(function(obj){return obj.rowId;}).indexOf(rowId)]);//No I18N
    opmGlobalRoute.transitionTo('Inventory.Device.Monitors.LastPolledValues');//No I18N
}
function fwaInventoryDeviceStatus(cellValue, options, rowdata, action)
{

    if(rowdata.licenseStatus === 1){
        return "<i class='icon-status5'></i>"+Ember.I18n.t('webclient.topo.addnetwork.managenet',this);//No I18N
    }else{
        return "<i class='icon-status1'></i>"+Ember.I18n.t('webclient.map.flash.Unmanaged',this);//No I18N
    }
}
function fwaImageDeviceStatus(cellValue, options, rowdata, action)
{

    if(rowdata.licenseStatus === 1){
        return "<i class='icon-status5'></i>";//No I18N
    }else{
        return "<i class='icon-status1'></i>";//No I18N
    }
}
function opm_deviceNotificationEdit(id)
{
    //var rowData = grid.jqGrid('getRowData', row); //No I18N
    var data = {'profileID':id} //No I18N
    OPMClient.SettingsAddEditController.pageObj = data; //No I18N
    OPMClient.SettingsAddEditController.operation = false;
    OPMClient.SettingsAddEditController.fromSnapshotPage = true;
    opm_transitionToTheRoute("Inventory.Device.Notification.Edit");//No I18N
}

function setThresholdColor(cellValue, options, rowdata, action)
{
    if(rowdata.thresholdStatus !== undefined){
        rowdata.thresholdStatus = opm_escapeHTML(rowdata.thresholdStatus);
    }
    if(rowdata.thresholdSeverity !== undefined){
        rowdata.thresholdSeverity = opm_escapeHTML(rowdata.thresholdSeverity);
    }
    if((rowdata.thresholdStatus === Ember.I18n.t('webclient.threshold.normal',this)) || (rowdata.thresholdSeverity === Ember.I18n.t('webclient.threshold.normal',this))){
        if(rowdata.thresholdStatus !== undefined){
			return "<i class='thresholdstatusnormal'></i><i>"+rowdata.thresholdStatus+"</i>";//No I18N
        }else if(rowdata.thresholdSeverity !== undefined){
			return "<i class='thresholdstatusnormal'></i><i>"+rowdata.thresholdSeverity+"</i>";//No I18N
        }

    }
    else if((rowdata.thresholdStatus === Ember.I18n.t('webclient.monitor.threshold.violated',this)) || (rowdata.thresholdSeverity === Ember.I18n.t('webclient.monitor.threshold.violated',this))){
		var severityClass="thresholdstatusviolated",status=rowdata.thresholdStatus || rowdata.thresholdSeverity;//No I18N
 		if(rowdata.thresholdImg == "images/thresholdConAttention.gif" || rowdata.severityIcon =="images/thresholdConAttention.gif" || rowdata.statusStr == "Attention"){
			severityClass = "--fault-severity icon-status3";//No I18N
		    status = Ember.I18n.t('webclient.ncm.clientserver.config.severity.Attention',this);//No I18N
        }else if(rowdata.thresholdImg=="images/thresholdConTrouble.gif" || rowdata.severityIcon =="images/thresholdConTrouble.gif"|| rowdata.statusStr == "Trouble"){//No I18N
		    severityClass = "--fault-severity icon-status2";//No I18N
		    status = Ember.I18n.t('webclient.ncm.clientserver.config.severity.Trouble',this);//No I18N
		}else if(rowdata.thresholdImg=="images/thresholdConCritical.gif" || rowdata.severityIcon == "images/thresholdConCritical.gif"|| rowdata.statusStr == "Critical"){//No I18N
		    severityClass = "--fault-severity icon-status1";//No I18N
		    status = Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this);//No I18N
		}
		return "<i class='"+severityClass+"'></i><i>"+status+"</i>";//No I18N
    }else{
        if(rowdata.thresholdStatus !== undefined){
			return "<i class='thresholdstatusdisabled'></i><i>"+rowdata.thresholdStatus+"</i>";//No I18N
        }else if(rowdata.thresholdSeverity !== undefined){
			return "<i class='thresholdstatusdisabled'></i><i>"+rowdata.thresholdSeverity+"</i>";//No I18N
        }
    }
}
function severityIconbyStatus(cellValue, options, rowdata, action)
{
    var statusNum = parseInt(rowdata.status, 10);
    if (window.OPM.isNewStatusPropagation && rowdata.state !== undefined && rowdata.state !== null && typeof rowdata.state !== 'object' && !isNaN(statusNum)) {
        var availClass = opm_getStateCls(rowdata.state);
        return "<em class='--fault-severity icon-status --dual-status status-" + statusNum + " " + availClass + "'></em>";//No I18N
    }
    return "<i class='--fault-severity icon-status" + rowdata.status + "'></i>";//No I18N
}
function ADseverityIcon(cellValue, options, rowdata, action)
{
	if(rowdata.severity)
	{
		return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.severity)+"'></i><i >"+opm_escapeHTML(rowdata.severityStr)+"</i>";//No I18N
	}
	return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.status)+"'></i>";//No I18N
}

function createTrapFrmAlarm(cellValue, options, rowdata, action)
{
    OPMClient.SettingsAddEditController.pageObj = {};
    return "<span onclick=gotoAddTrapPage(this); data-msg='"+rowdata.text+"' class='cursorPointer'>"+Ember.I18n.t('webclient.admin.traps.addunsol',this)+"</span>";//No I18N
}
function gotoAddTrapPage(thisDiv)
{
    OPMClient.AlarmDetailsController.configPageHeader = Ember.I18n.t('webclient.admin.traps.addunsol',this); //No I18N
    OPMClient.SettingsAddEditController.pageAction = "Add";//No I18N
    OPMClient.SettingsTabController.monitorName = "traps"; //No I18N
    OPMClient.SettingsAddEditController.pageObj.snmpMsg = $(thisDiv).attr('data-msg');
    var snmpObj = opm_parseSnmpTrap(OPMClient.SettingsAddEditController.pageObj.snmpMsg);
    OPMClient.SettingsAddEditController.pageObj.snmpObj=snmpObj;
    opm_transitionToTheRoute("Alarms.TopSources.AddTrap");//No I18N
}

function authChangeCountFormatter(cellValue, options, rowdata, action)
{
    var authCount = rowdata[4];
    var unAuthCount = rowdata[5];
    return '<span><img title="'+Ember.I18n.t("jsp.common.AuthorizedConfiguraitonChanges",this)+'" src="/apiclient/fluidicv2/img/ncm/authorized_change_ico.gif">'+

    '<b>'+Ember.I18n.t("ncm.ReportTransformer.Authorized",this)+' '+authCount+'</b> '+ //No I18N
    '<img title="'+Ember.I18n.t("jsp.common.UnAuthorizedConfiguraitonChanges",this)+'" src="/apiclient/fluidicv2/img/ncm/unauthorized_change_ico.gif">'+
    '<b>'+Ember.I18n.t("ncm.ReportPdfUtil.Unauthorized",this)+' : '+unAuthCount+'</b>'+'</span>'; //No I18N
}
function setTrapStatus(cellValue, options, rowdata, action){
    var disabledStr = "";
    if(!window.OPM.userPermissions.monitoringWrite) {
        disabledStr = "disabled" //No I18N
    }
    if(rowdata.status){//No I18N
            return "<div class='chkRoundBtn'><input type='checkbox'  "+disabledStr+" onclick='changeSNMPTrapStatus(&#39;disable&#39;,&#39;"+rowdata.trapName+"&#39;)' checked name=''><label></label></div>";//No I18N
    }
    else {
            return "<div class='chkRoundBtn'><input type='checkbox'  "+disabledStr+" onclick='changeSNMPTrapStatus(&#39;enable&#39;,&#39;"+rowdata.trapName+"&#39;)' name=''><label></label></div>";//No I18N
    }
}
function changeSNMPTrapStatus(action,trapParserName)
{
	var url = window.OPM.apiUrlPattern + "/admin/enableTrapParser?trapParserName="+trapParserName;//No I18N
    if(action === "disable"){//No I18N
		url = window.OPM.apiUrlPattern + "/admin/disableTrapParser?trapParserName="+trapParserName;//No I18N
    }
    var response = opm_ajaxPostRequest(url);
    showMessage(response,"opm_SettingsGlobalMonitorsGridLoad",OPMClient.SettingsTabController.monitorName);//No I18N
}
//Availability old code
function formatDownTimeAction(cellvalue, options, rowObject)
{
	if(rowObject.Reason!=="REASONDISABLED")//No I18N
    {
        if(rowObject.OrgStartTime !== undefined){
            return "<span class='pointer ui-icon ui-icon-pencil' style='float:left' title='"+Ember.I18n.t('webclient.action.edit')+"' onclick=editReason('"+options.rowId+"',this)></span>"; //No I18n
        }

    }
    return "";//No I18N
}
//Availability old code
function editReason(rowId,tis)
{
    var tableName = $(tis).closest("table").attr("id");//No I18N
    $("#"+tableName+" #"+rowId).find('td').eq(7).html("<a href=javascript:saveReason('"+rowId+"','"+tableName+"') class='ui-icon ui-icon-disk' title='"+Ember.I18n.t('webclient.admin.StatusPoll.SaveButton')+"'></a>");// NO I18N

    $("#"+tableName).jqGrid('editRow',rowId,true);// NO I18N
}
//Availability old code
function saveReason(rowId,tableName){
    var rowObject = $("#"+tableName).getRowData(rowId);// NO I18N
    var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
    var isWanLink = OPMClient.InventoryDeviceDetailsController.WANLinkAvailability;
    if(OPMClient.InventoryDeviceDetailsController.isFromAlarmsPage === true){
        deviceName = OPMClient.AlarmDetailsController.alarmDetails.source;
    }
    else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringInterface")
    {
        deviceName = OPMClient.InventoryDeviceDetailsController.interfaceName;
    }
    var newReason=rowObject.Reason;
    if($('#'+tableName+' #'+rowId+'_Reason').val()!==undefined)//No I18N
    {
        newReason = $('#'+tableName+' #'+rowId+'_Reason').val();//No I18N
    }
    var data = {"deviceName":deviceName,"startTime":rowObject.OrgStartTime,"endTime":rowObject.OrgEndTime,"tableName":rowObject.TableName};//No I18N
    if(OPMClient.InventoryDeviceDetailsController.fromMainAvailabilityPage !== true && OPMClient.InventoryDeviceDetailsController.isFromAlarmsPage !== true){
        if(OPMClient.InventoryDeviceDetailsController.monitorsName === "processMonitors"){
            data.instance = "process";//No I18N
            data.elementID = OPMClient.DeviceMonitorsActionController.snapshotObj.id;
        }else if(OPMClient.InventoryDeviceDetailsController.monitorsName === "ntServiceMonitors"){//No I18N
            data.instance = "winService";//No I18N
            data.elementID = OPMClient.DeviceMonitorsActionController.snapshotObj.moid;
        }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "Link"){//No I18N
            data.instance = "WANLinkMonitor";//No I18N
        }else{
            data.instance = "service";//No I18N
            data.elementID = OPMClient.DeviceMonitorsActionController.snapshotObj.moid;
        }

    }
    if(trim(newReason) !==null && trim(newReason) !=="")
    {
        data.reason = newReason;
    }
    if(isWanLink !== undefined && isWanLink)
    {
        data.instance = "MerakiUplink"; //No I18n
        data.deviceName = OPMClient.InventoryDeviceDetailsController.wanName;
    }
    var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/updateAvailReason',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
	var response = opm_ajaxPostRequest(url,data);
    if(response !== undefined){
        if(OPMClient.InventoryDeviceDetailsController.fromMainAvailabilityPage !== true && OPMClient.InventoryDeviceDetailsController.isFromAlarmsPage !== true){
            if(OPMClient.InventoryDeviceDetailsController.monitorsName === "processMonitors"){
                opm_loadOutageHistoryProps(OPMClient.InventoryDeviceDetailsController.outageHistoryData, 'processAvailabilityDiv');//No I18N
            }else if(OPMClient.InventoryDeviceDetailsController.monitorsName === "serverMonitors"){//No I18N
                opm_loadOutageHistoryProps(OPMClient.InventoryDeviceDetailsController.outageHistoryData, 'processAvailabilityDiv');//No I18N
            }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "Link"){//No I18N
                reloadSnapWidgets(4);
            }else{
                opm_loadOutageHistoryProps(OPMClient.InventoryDeviceDetailsController.outageHistoryData, 'ntprocessAvailabilityDiv');//No I18N
            }
        }else{
            opm_loadAvailabilityHistoryReport(deviceName,$('#SnapAvailability .timeFilterList ul li.active').attr("data-value"));
        }

    }
}

function copyAsThisNotification(rowData)
{
    rowData = unescape(rowData);
    OPMClient.SettingsAddEditController.pageObj = JSON.parse(rowData.toString());
    OPMClient.SettingsAddEditController.operation = false;
    OPMClient.SettingsAddEditController.pageAction = "copyAs";//No I18N
    opm_transitionToTheRoute("Settings.Notification.Edit");//No I18N
}



function linkToURLSummary(cellValue, options, rowdata, action){
var name = rowdata.name;
    if(name === undefined)
    {
        name = rowdata.deviceName;
    }
    return "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+opm_escapeHTML(name)+"'>"+opm_escapeHTML(cellValue)+"</a>";//No I18N
}
function setKillProcess(cellValue, options, rowdata, action){
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.snapshot.killprocess',this)+"' onclick='killActiveProcess(&#39;"+rowdata.ProcID+"&#39;)'></i>"; //No I18n
}

function killActiveProcess(processId)
{
    if(confirm(Ember.I18n.t('webclient.devices.snapshot.procstats.kill.alert',this))){
        var data = {"processId":processId,"deviceName":OPMClient.InventoryDeviceDetailsController.deviceName}; //No I18N
		var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/device/killProcesses",data); //No I18N
        if(response !== undefined && !$.isEmptyObject(response)){
			if(OPMClient.ApplicationController.isDemoUser){
	   			 showMessage(response);
 			}else{
                if(response.result !== undefined && response.result.message !== undefined )
                {
                    opm_infoMsgs('successMsg',response.result.message);//No I18n
                }
                else
                {
            		$.each(response,function(key,value){
                	$("#processResult").append("<div class='filterRow'><div>"+key+"</div><div>"+value+"</div></div>");//No I18N
            	});
            	$("#processDiagnosticsDiv").hide();
            	$("#processResultDiv").show();
        	}

        }
    }
}
}

function setAlarmCount(cellValue, options, rowdata, action)
{
    return "<a href='"+window.OPM.apiclientUrl+"Maps/BusinessView/"+escapeHTML(rowdata.bvName)+"'><span style='color:#fa5b5a;' title='"+escapeHTML(rowdata.tooltip)+"'>"+rowdata.failedcount+"</span>/<span>"+rowdata.totalCount+"</span></a>";//No I18N
}
function linkToInterfaceSummary(cellValue, options, rowdata, action)
{

    var snapshotUrl = "";
    if(rowdata.type !== undefined && rowdata.down !== undefined )
    {
        snapshotUrl = redirectToSnapshot("MonitoringInterface", rowdata.type, undefined, undefined, true); //No I18N
		return "<a href='" + snapshotUrl + "'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
    else if(rowdata.intfName !== undefined)
    {
        snapshotUrl = redirectToSnapshot("MonitoringInterface", rowdata.intfName, undefined, undefined, true); //No I18N
		return "<a href='" + snapshotUrl + "'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
    else if(rowdata.name !== undefined)
    {
        snapshotUrl = redirectToSnapshot("MonitoringInterface", rowdata.name, undefined, undefined, true);  //No I18N
		return "<a href='" + snapshotUrl + "'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
    else if(rowdata.intfMoname !== undefined)
    {
        snapshotUrl = redirectToSnapshot("MonitoringInterface", rowdata.intfMoname, undefined, undefined, true); //No I18N
        return "<a href='" + snapshotUrl + "'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
}

function setAlarmLinkFromMessage(cellValue, options, rowdata, action)
{
    return "<div class='alarm-row'><span class='statusColor --fault-severity severity_"+rowdata.severity+"'></span><a href='javascript:redirectToAlarm(\""+rowdata.alarmId+"\");' title='"+opm_escapeHTML(rowdata.message)+"' style='white-space:normal !important;'>"+escapeHtmlTags(rowdata.message)+"</a></div>"; //No I18N
}
function deleteAssociateProfile(cellValue, options, rowdata, action)
{
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='deleteAssociatedUrlProfile(&#39;"+options.rowId+"&#39,&#39;"+opm_escapeHTML(rowdata.profileId)+"&#39;)'></i>"; //No I18n
}

function setDisplayNameField(cellValue, options, rowdata, action)
{
    return "<input type='text' value='"+cellValue+"' id='"+rowdata.moID+"_DISPNAME' style='width:100%'/>"; //No I18n
}
function setInSpeed(cellValue, options, rowdata, action)
{
    return "<input type='text' value='"+cellValue+"' id='"+rowdata.moID+"_INSPEED' style='width:100%'/>"; //No I18n
}
function setOutSpeed(cellValue, options, rowdata, action)
{
    return "<input type='text' value='"+cellValue+"' id='"+rowdata.moID+"_OUTSPEED' style='width:100%'/>"; //No I18n
}

function inftCounterSelectBox(cellvalue, options,rowData, action){
    var toRet = "<select class='select2' id='"+rowData.moID+"_COUNTER'>";
    if(cellvalue === "true"){
        toRet += "<option value='true' selected>"+Ember.I18n.t('webclient.64.bit',this)+"</option><option value='false'>"+Ember.I18n.t('webclient.32.bit',this)+"</option>";
    }else{
        toRet += "<option value='true'>"+Ember.I18n.t('webclient.64.bit',this)+"</option><option value='false' selected>"+Ember.I18n.t('webclient.32.bit',this)+"</option>";
    }
    toRet += "</select>";
    return toRet;
}
function deleteDevInterface(cellValue, options, rowdata, action)
{
    if(!window.OPM.isCentralServer)
    {
        if(window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.discoveryWrite)
        {
			var intfActions = "";
			if(!window.OPM.isOPMStandardEdition && window.OPM.userPermissions.monitoringRead && !OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring && !OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isTelemetry){
				intfActions = "<i class='icon-u1F53E-1' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.snapshot.tooltip.realtime',this)+"' onclick='generateIntfRealTime(&#39;"+rowdata.moid+"&#39,&#39;"+escape(rowdata.displayName)+"&#39)'></i>";
			}
			intfActions += "<i class='icon-trash delete' style='margin-left:10px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick='deleteInterface(&#39;"+rowdata.name+"&#39;,this)'></i>"; //No I18n
			return intfActions;
        }
        else
        {
			if(!window.OPM.isOPMStandardEdition && window.OPM.userPermissions.monitoringRead && !OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring && !OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isTelemetry){
				return "<i class='icon-u1F53E-1' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.snapshot.tooltip.realtime',this)+"' onclick='generateIntfRealTime(&#39;"+rowdata.moid+"&#39,&#39;"+escape(rowdata.displayName)+"&#39)'></i>";
			}else{
				return "";
            }
        }
    }
    else{
        if(window.OPM.userPermissions.monitoringRead){
            return "";
        }
        return "";
    }

}
function forecastInterface(cellValue, options, rowdata, action)
{
    var obj = {'policyName':(rowdata.monitorName),'graphName':(rowdata.monitorName),'deviceName':OPMClient.InventoryDeviceDetailsController.deviceName}; //No I18N
        OPMClient.InventoryDeviceDetailsController.set('policyName',rowdata.monitorName);//No I18N
    OPMClient.InventoryDeviceDetailsController.set('indexName',rowdata.monitorName);//No I18N
    OPMClient.DeviceMonitorsActionController.set('graphMonObj',obj);//No I18N

    var forecastingAction = "<i title='"+Ember.I18n.t('nfa.reports.forecast')+"' style='float:none;margin-left:15px !important' class='"+ getClassNamesForForecastGraph(window.OPM.userPermissions.monitoringRead)+"' onclick=doMonitorActions('"+options.rowId+"','intfforecast','','"+options.gid+"');></i>"; //No I18n
    return forecastingAction;
}
function trafficNA(cellValue, options, rowdata, action)
{
	if(cellValue==='NA')
	{
		return "<a href='https://www.manageengine.com/network-monitoring/faq/interface-data-collection-failure.html?utm_source=inproduct' target='_new' style='color:#0099ff'>NA</a>";
	}
	else
	{
		return opm_escapeHTML(cellValue);
	}
}

function showRxTxValue(cellValue, options, rowdata, action)
{
    if(cellValue==='NA')
    {
        return "-"; //No I18n
    }
    else
    {
        return opm_escapeHTML(cellValue);
    }
}

function subInterface(cellValue, options, rowdata, action)
{
	if(rowdata.isSubInterface === 'true')
	{
		return "<span title='"+Ember.I18n.t("webclient.device.intf.subinterface.title",this)+"'>"+cellValue+"</span>";
	}
	else
	{
		return cellValue;
	}
}
function opm_dtWMImonitorFormatter(cellValue, options, rowdata, action){
    return "<span title='"+Ember.I18n.t('webclient.dt.current.value',this)+":"+ opm_escapeHTML(rowdata.collectedValues)+" "+Ember.I18n.t('webclient.map.flash.Ticket_Description',this)+":"+opm_escapeHTML(rowdata.description)+"'>"+opm_escapeHTML(cellValue)+"</span>";
}
function deleteInterface(intfName,thisDiv){
    var msg = "<div class='opmFormRow'>" + Ember.I18n.t('webclient.js.interface.delete',this) + "</div>";//No I18N
    if(window.OPM.isNfaPlug && window.OPM.isNFAEnabled){
        msg += "<div class='opmFormRow opmCheckBox'><div><input type='checkbox' id='applicableToNFAInterfaces'><label class='line-height-5'>" + Ember.I18n.t("webclient.opm.action.applicable.nfainterface") + "</label></div></div>";//No I18N
    }
    var isApplicableToNFAInterface = false;
    var okCallBack = function(){
        var data = {'name':intfName,'isApplicableToNFAInterface': isApplicableToNFAInterface}; //No I18N
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/discovery/deleteInterfaces',data);//No I18N
        if(response !== undefined && !$.isEmptyObject(response)){
            if(response.result !== undefined)
            {
                var options = {};//No I18N
                options.callback_func = function(){
                    reloadSnapshotPage();
                }
                opm_infoMsgs('successMsg',response.result.message,options);//No I18n
            }else if(response.error !== undefined){
                opm_infoMsgs('errorMsg',response.error.message);//No I18n
            }
        }
    };
    opmConfirm("", msg, 600, okCallBack, Ember.I18n.t("webclient.restapi.copy.okBtnText"), "", Ember.I18n.t("webclient.action.cancel"), "", "dialogStyle2", true, false, "", true, true, false);//NO I18N
    $('#tempDialog').on('dialogbeforeclose', function() {
        isApplicableToNFAInterface = $('#applicableToNFAInterfaces').is(':checked');
    });
}
function showGraphPointer(cellvalue, options, rowdata, action){
    if(rowdata.checkNumeric === "true" && rowdata.sSave !== undefined && rowdata.sSave === 'true'){//No I18N
        return "<div class='pointer'>"+opm_escapeHTML(cellvalue)+"</div>";//No I18N
    }
    return opm_escapeHTML(cellvalue);
}
function showGraphPointerAndProtocol(cellvalue, options, rowdata, action){
    var returnString = rowdata.displayNameCopy;
    if(returnString === undefined){
        returnString = opm_escapeHTML(cellvalue) +" ["+opm_escapeHTML(rowdata.Protocol)+"]";
        rowdata.displayNameCopy = returnString;
    }
    rowdata.DISPLAYNAME = returnString;
    rowdata.monDisplayName = opm_escapeHTML(cellvalue);
    if(rowdata.checkNumeric === 'true' && rowdata.sSave !== undefined && rowdata.sSave === 'true'){
        return "<div class='pointer'>"+returnString+"</div>";//No I18N
    }
    return returnString;
}
function showPollingStatus(cellvalue, options, rowdata, action){
    var diagStatusIcon = 'greenStatusCircle';//No I18N
    var routeName = 'Inventory.Device.Monitors.Diagnostics';//No I18N
    var i18nText = Ember.I18n.t('opstor.inventory.active');//No I18N
    var viewInfo = '';
    var showViewInfo = !window.OPM.isCentralServer;
    rowdata.pollingStatusValue = rowdata.pollingStatus;
    if(['6','11','111','15'].indexOf(rowdata.pollingStatus) > -1){
        diagStatusIcon = 'greyStatusCircle';//No I18N
        i18nText = Ember.I18n.t('webclient.admin.scheduledt.disabled');//No I18N
    }else if(rowdata.pollingStatus === '2'){//No I18N
        diagStatusIcon = 'yellowStatusCircle';//No I18N
        i18nText = Ember.I18n.t('webclient.reports.vmwarevm.suspended');//No I18N
    }
    else if(rowdata.pollingStatus === '1')
    {
        diagStatusIcon = 'redStatusCircle';//No I18N
        i18nText = Ember.I18n.t('ipsla.failed');//No I18N
    }
    var tooltip = i18nText;
    if(['0','11','111','15'].indexOf(rowdata.pollingStatus) > -1){
        if(rowdata.pollingStatus === '11'){
            tooltip = Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.device.down',{param0:Ember.I18n.t('webclient.wf.category.device')});//No I18N
        }else if(rowdata.pollingStatus === '111'){
            tooltip = Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.polling.down');//No I18N
        }else if(rowdata.pollingStatus === '15'){
            tooltip = Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.device.down',{param0:Ember.I18n.t('webclient.admin.customfields.interface')});//No I18N
        }
        showViewInfo = false;
    }else{
        if(window.OPM.isCentralServer){
            tooltip = Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.central.tooltip');//No I18N
        }
    }
    if(rowdata.moid !== undefined){
        routeName = 'Inventory.Device.Diagnostics';//No I18N
    }
    if(showViewInfo){
        viewInfo = " <i class='textLink' onclick=opm_transitionToParentRoute('"+routeName+"','"+options.rowId+"');>("+Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.view.info')+")</i>";
    }
    return "<i id='diagStatusIcon_"+options.rowId+"' title='"+tooltip+"' class='"+diagStatusIcon+"'></i><i id='diagStatusText_"+options.rowId+"' title='"+tooltip+"'>"+i18nText+viewInfo+"</i>"
}
function setForecastAlertStatus(cellValue, options, rowdata, action){
    if(cellValue)
    {
         return '<div class="chkRoundBtn" title="'+Ember.I18n.t('webclient.devices.intftypes.enabled',this)+'" value="'+rowdata.alert+'" onclick="enableDisableForecastStatus(\''+opm_escapeHTML(rowdata.ruleID)+'\',\''+opm_escapeHTML(rowdata.valueColumnName)+'\',this)"><input type="checkbox" checked><label></label></div>';//No I18N
    }
    else
    {
        return '<div class="chkRoundBtn" title="'+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+'" value="'+rowdata.alert+'" onclick="enableDisableForecastStatus(\''+opm_escapeHTML(rowdata.ruleID)+'\',\''+opm_escapeHTML(rowdata.valueColumnName)+'\',this)"><input type="checkbox"><label></label></div>';//No I18N
    }
}
function setServiceScanStatus(cellValue, options, rowdata, action){
    if(rowdata.autoDiscovery === "true"){//No I18N
            if(window.OPM.userPermissions.monitoringWrite)
            {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeServiceScanStatus(&#39;false&#39;,&#39;"+opm_escapeHTML(rowdata.serviceName)+"&#39;,&#39;"+opm_escapeHTML(rowdata.timeout)+"&#39;,&#39;"+opm_escapeHTML(rowdata.failureThreshold)+"&#39;,&#39;"+opm_escapeHTML(rowdata.portNo)+"&#39;)' checked name=''><label></label></div>";//No I18N
            }
            else
            {
                return "<div class='chkRoundBtn'><input type='checkbox' disabled checked name=''><label></label></div>";//No I18N
            }
    }
    else {
            if(window.OPM.userPermissions.monitoringWrite)
            {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeServiceScanStatus(&#39;true&#39;,&#39;"+opm_escapeHTML(rowdata.serviceName)+"&#39;,&#39;"+opm_escapeHTML(rowdata.timeout)+"&#39;,&#39;"+opm_escapeHTML(rowdata.failureThreshold)+"&#39;,&#39;"+opm_escapeHTML(rowdata.portNo)+"&#39;)' name=''><label></label></div>";//No I18N
            }
            else
            {
                return "<div class='chkRoundBtn'><input type='checkbox' disabled name=''><label></label></div>";//No I18N
            }
    }
}
function changeServiceScanStatus(action,serviceName,timeOut,failureThreshold,portNumber)
{
	url = window.OPM.apiUrlPattern + '/admin/updateServiceMonitor'; //No I18n
	var data = {"serviceName":serviceName,"timeOut":timeOut,"failureThreshold":failureThreshold,"autoDiscovery":action}; //No I18N
    var response = opm_ajaxPostRequest(url,data);
    showMessage(response,"opm_SettingsGlobalMonitorsGridLoad",OPMClient.SettingsTabController.monitorName);//No I18N
}
function showHardwareSensorStatus(cellvalue, options, rowdata, action){
    return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.sensorstatus)+"'></i>"+opm_escapeHTML(cellvalue); //No I18N
}
function showValwithUnits(cellvalue, options, rowdata, action){
    return opm_escapeHTML(cellvalue) + " " +  "<bold>"+ opm_escapeHTML(rowdata.queryUnits)+"</bold>"; //No I18N
}
function severityIconInftOperStatus(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-intfStatus"+opm_escapeHTML(rowdata.operStatus)+"'></i> "+opm_escapeHTML(cellValue);//No I18N
}
function severityIconInftAdminStatus(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-intfStatus"+opm_escapeHTML(rowdata.adminStatus)+"'></i> "+opm_escapeHTML(cellValue);//No I18N
}
function opm_vipformatter(cellValue, options, rowdata, action){
    if(cellValue===undefined || cellValue==="" || cellValue===" "){
        var title = Ember.I18n.t('webclient.Vmware.notMonitored.reasonTitle',this); //No I18N
        var reason1 =Ember.I18n.t('webclient.Vmware.notMonitored.reasonOne',this); //No I18N
        var reason2 =Ember.I18n.t('webclient.Vmware.notMonitored.reasonTwo',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ reason1+ "'data-content2='"+reason2+"'></a>";//No I18N
        info = rowdata.MOID == -4 ? info : '' ;
        return Ember.I18n.t('webclient.not.monitored',this) + info ;//No I18N
    }
    else{
        //vmware,hyperv,xen vms page xss fix
        return opm_escapeHTML(cellValue);
    }
}

function opm_proxmoxIpformatter(cellValue, options, rowdata, action){
    var virtualType = opm_escapeHTML(rowdata.VIRTUAL_TYPE);
    var idToUse = rowdata.VM_ID, displayName = rowdata.DISPLAYNAME, vHostID = rowdata.VHOST_ID;

    if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj && ((OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ENTITY_TYPE && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ENTITY_TYPE.includes("Proxmox")) || (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType.includes("Proxmox")))) {
        idToUse = rowdata.vm_id || rowdata.container_id || rowdata.host_id;
        displayName = rowdata.host_name || rowdata.container_name || rowdata.vm_name;
        vHostID = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.moID;
        virtualType = "Proxmox-Node"; //No I18N
        if(rowdata.container_id) {
            virtualType = "Proxmox-Container"; //No I18N
        } else if(rowdata.vm_id) {
            virtualType = "Proxmox-VM"; //No I18N
        }
    }

    if(cellValue===undefined || cellValue==="" || cellValue===" "){
        var title = Ember.I18n.t('webclient.Vmware.notMonitored.reasonTitle',this); //No I18N
        var reason1 =Ember.I18n.t('webclient.Vmware.notMonitored.reasonOne',this); //No I18N
        var reason2 =Ember.I18n.t('webclient.opm.device.proxmox.notMonitored.reasonTwo',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' data-align='left' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ reason1+ "'data-content2='"+reason2+"'></a>";//No I18N
        var msg = Ember.I18n.t('webclient.not.monitored',this);//No I18N

        if(window.OPM.userPermissions.discoveryWrite && virtualType === "Proxmox-Node")
        {
            msg = "<span class='opm_link' onclick = 'opm_startMonitoring(\""+opm_escapeHTML(displayName)+"\",\""+opm_escapeHTML(idToUse)+"\",\""+opm_escapeHTML(vHostID)+"\",\""+virtualType+"\",this)'>"+ msg +"</span>";//No I18N
        }
        if(rowdata.discovery_selection) {
            msg += info;
        }

        return msg;
    }
    else{
        var helpCard = "";

        if(rowdata.isConnectNode) {
            helpCard = '<a class="hasHelpCard hasHelpCard4" tabindex="-1"> <div class="helpCard" style="display:none"> <div class="helpCardInfo"> <div class="helpCardContent"> <div> <p>' + Ember.I18n.t('webclient.opm.device.proxmox.connectnode.help',this) + '</p> </div> </div> </div> </div> </a>';
        }
        if(helpCard) {
            return escapeHTML(cellValue) + ' ' + helpCard;

        }
        return opm_escapeHTML(cellValue);
    }
}

function opu_ConncetedSwitchformatter(cellValue, options, rowdata, action){
	if(cellValue===undefined || cellValue==="" || cellValue===" "){
		var title = Ember.I18n.t('opu.common.detailsOfSwitch',this)+'<i class="icon-remove"></i>'; //No I18N
		var reason1 = '<b style="font-weight:bold;">'+Ember.I18n.t('opu.rogue.SwitchDetailsUnableRetrieve',this)+'</b>'
		var reason2 ="1. "+Ember.I18n.t('opu.rogue.NotAllSwitchesAdded',this)+ '<a href="javascript:gotoAddSwitch()" style="color:#0099ff">'+Ember.I18n.t("opu.views.ADD_SWITCH",this)+'</a></br></br>'+"2. "+Ember.I18n.t('opu.spm.SwitchesNotScannedAfterDeviceDiscovered',this) + '<a href="javascript:gotoSPMScheduler()" style="color:#0099ff">'+Ember.I18n.t("webclient.general.Schedule",this)+" "+Ember.I18n.t("opu.views.SCAN",this)+'</a></br></br>'+Ember.I18n.t('opu.common.connectedSwitchCloseMsg',this); //No I18N
		var info = "<a class='hasHelpCard hasHelpCard2 type2 oputils' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ reason1+ "'data-content2='"+reason2+"'></a>";//No I18N
		return Ember.I18n.t('webclient.map.flash.Unknown',this) + info ;//No I18N
	}
	else{
		return oputilsSwitchPortSnapshotPage(cellValue,options,rowdata,action,'switch');//No I18N
	}
}
function opu_RogueIPformatter(cellValue, options, rowdata, action){
	var title = Ember.I18n.t('opu.common.unknownIP',this)+'<i class="icon-remove"></i>'; //No I18N
	var header = '<b style="font-weight:bold;">'+Ember.I18n.t('opu.common.IP_ADDRESS_COULD_NOT_BE_RETRIEVED',this)+'</b>'
	var reason1 ="1. "+Ember.I18n.t('opu.common.IPReason1',this)+'</br></br>'+"2. "+Ember.I18n.t('opu.common.adding',this)+' <a href="javascript:gotoAddRouter()" style="color:#0099ff">'+Ember.I18n.t("webclient.admin.alarmesc.routers",this)+'</a> '+"and "+'<a href="javascript:gotoRouterScheduler()" style="color:#0099ff">'+Ember.I18n.t("opu.common.scheduling",this)+'</a> '+Ember.I18n.t('opu.common.WayToGetMoreMACIP',this) + '<a href="http://www.manageengine.com/products/oputils/rogue-detection-knowledge-base.html#rogue-detection-kbase4" style="color:#0099ff">'+Ember.I18n.t("webclient.learnmore",this)+'</a>'; //No I18N
	var info = "<a class='hasHelpCard hasHelpCard2 type2 oputils' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ header+ "'data-content2='"+reason1+"'></a>";//No I18N
	return Ember.I18n.t('webclient.map.flash.Unknown',this) + info ;//No I18N
}

function changeIntfList(){
    if($("#intfTypeList").is(":checked")){//No I18N
        opm_loadInterfaceTemplateGrid("allInterfaces");//No I18N
    }else{
        opm_loadInterfaceTemplateGrid("commonInterfaces");//No I18N
    }
}
function excuteWFfromList(cellValue, options, rowdata, action)
{
    var alarmId = options.colModel.formatoptions.alarmid;
    return "<span style='float:left;margin-left:10px;' title='"+Ember.I18n.t('webclient.workflow.executewf', this)+"' onclick='OPMClient.AlarmActionsController.opm_excuteWorkflowForalarm(\"" +opm_escapeHTML(alarmId)+ "\",\"" +opm_escapeHTML(rowdata.rbID) + "\");' class='ui-icon ui-icon-arrowthickstop-1-e pointer' ></span>"; //No I18N
}
function excuteWFfromAlarm(cellValue, options, rowdata, action)
{
    if(OPMClient.AlarmOptionsController.isDetailsPage){
        var alarmId = OPMClient.AlarmDetailsController.alarmDetails.id;
    } else {
        var alarmId = OPMClient.AlarmDetailsController.alarmId;
    }
    return " <span style='float:left;margin-left:10px;' title='"+Ember.I18n.t('webclient.workflow.executewf', this)+"' onclick='OPMClient.AlarmActionsController.opm_excuteWorkflowForalarm(\"" +alarmId+ "\",\"" + rowdata.rbID + "\");' class='ui-icon ui-icon-arrowthickstop-1-e pointer' role='button' tabindex='0'></span>"; //No I18N
}
function excuteLogaTicketfromAlarm(cellValue, options, rowdata, action)
{
    var alarmId = options.colModel.formatoptions.alarmid;
    return "<span style='float:left;margin-left:10px;' title='"+Ember.I18n.t('webclient.admin.profiledetails.LogaTicket', this)+"' onclick='triggerNotificationTemplate(\"" +opm_escapeHTML(alarmId)+ "\",\"" +opm_escapeHTML(rowdata.templateID) + "\");' class='ui-icon ui-icon-arrowthickstop-1-e pointer' ></span>"; //No I18N
}
function triggerNPfromAlarm(cellValue, options, rowdata, action)
{
    if(OPMClient.AlarmOptionsController.isDetailsPage){
        var alarmId = OPMClient.AlarmDetailsController.alarmDetails.id;
    } else {
        var alarmId = OPMClient.AlarmDetailsController.alarmId;
    }
    var profileId = ""; //No I18N
    if(rowdata.profileId !==undefined && rowdata.profileId!==null && rowdata.profileId!=="") {
        profileId = rowdata.profileId;
    } else {
        profileId = rowdata.profileID;
    }
    var str = " <span style='float:left;margin-left:10px;' title='Trigger' onclick='OPMClient.AlarmActionsController.opm_TriggerProfileForalarm(\"" +alarmId+ "\",\"" + profileId + "\");' class='ui-icon ui-icon-arrowthickstop-1-e pointer' role='button' tabindex='0'></span>"; //No I18N
    return str;
}
function linkToInterfaceByIndex(cellValue, options, rowdata, action)
{
	return "<a href='javascript:redirectToSnapshot(\"MonitoringInterface\", \""+rowdata[1]+"\");'>"+escapeHTML(cellValue)+"</a>"; //No I18N
}
function reportDeleteFormatter(cellValue, options, rowdata, action){
    if(rowdata.isCustom==="true" && window.OPM.userPermissions.reportsWrite && !window.OPM.userPermissions.devGrouporBVRestricted && !window.OPM.probeRestrictedAllProbeSelected)
    {
        return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='opm_deleteCustomReport(&#39;"+rowdata.id+"&#39;)' tabindex='0' role='button'></i>"; //No I18n
    }
    else
    {
        return "<i  style='margin-left:20px;'>-</i>"; //No I18n
    }

}
function trapsDeleteFormatter(cellValue, options, rowdata, action){

        return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='deleteselectedTraps(&#39;"+rowdata.id+"&#39;)'></i>"; //No I18n
}
function setValWithUnit(cellValue, options, rowdata, action){
    return cellValue+" "+rowdata.unit; //No I18N
}
function generateIntfRealTime(intfID,displayName)
{
    OPMClient.InventoryDeviceDetailsController.set("intfID",intfID);//No I18n
	OPMClient.InventoryDeviceDetailsController.set("intfDispName",unescape(displayName)); //No I18n
    opm_transitionToParentRoute("Inventory.Device.RealTimeInterface");//No I18N
}
function vlanMonitorUnits(cellValue, options, rowdata, action)
{
    if(rowdata.value !== "N/A")
    {
        return rowdata.value +" "+"("+rowdata.unit+")"; //No I18n
    }
    else
    {
        return rowdata.value;
    }
}
function openDeviceURLSnapshotPage(cellValue, options, rowdata, action)
{
    if(rowdata[5] !== undefined && rowdata[5] === "URL")
    {
         return "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+rowdata[1]+"'>"+escapeHTML(cellValue)+"</a>";//No I18N
    }
    else
    {
        return "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+rowdata[1]+"'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
}
function setLinkNewTab(cellValue, options, rowData, action){

    if(location.href.split("/").pop() == 'Containers')
    {

        // return "<a href='#/APM/List' 'class='devHrefLink'>"+escapeHtmlTags(cellValue)+"</a>"//No I18N
        return "<i 'class='devHrefLink'>"+escapeHtmlTags(cellValue)+"</i>"//No I18N
    }
    else
    {
        var deviceName = escapeHTML(rowData.deviceName);
        return "<a href='"+getDevSnapshotUrl(deviceName)+"'class='devHrefLink'>"+escapeHtmlTags(cellValue)+"</a>"//No I18N
    }
}

function dataStoreLink(cellValue, options, rowData, action){
    if(rowData.deviceName)
    {
        return "<a href='"+getDevSnapshotUrl(rowData.deviceName)+"'class='devHrefLink'>"+escapeHTML(cellValue) +"</a>"//No I18N
    }
    else
    {
            return escapeHTML(cellValue);
    }
}
function gotoXenPoolPage(cellValue, options, rowData, action){
    return "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/XenPool/"+rowData.POOLID+"' class='devHrefLink'>"+cellValue+"</a>";
}

function showVmMap(ipaddress,vmName,vHostID,thisDiv)
{
    OPMClient.InventoryDeviceDetailsController.set("vmHostName",vmName);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("ipMappingAddress",ipaddress);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("isOldVMMapping",true);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("vHostID",vHostID);//No I18N
    redirectSnapShot("IPMapping");//No I18N
    OPMClient.InventoryDeviceDetailsController.vmGridID = thisDiv;
}
function setThresholdTxt(cellValue, options, rowdata, action)
{
    if(rowdata.THRESHOLDENABLED === 0){
        return Ember.I18n.t("webclient.admin.scheduledt.disabled",this); //No I18n
    }else{
        return Ember.I18n.t("jsp.commonstr.Enabled",this); //No I18n
    }
}

function attentionThresholdDisplay(cellValue, options, rowdata, action){
    return cellValue+" "+rowdata.ATTENTIONUNIT;//No I18n
}
function criticalThresholdDisplay(cellValue, options, rowdata, action){
    return cellValue+" "+rowdata.CRITICALUNIT;//No I18n
}

function setIfStatusColor(cellvalue, options, rowObject)
{

	var title = rowObject.isSubInterface === "true" ? Ember.I18n.t('webclient.device.intf.subinterface.title',this):''; //No I18N
    if(rowObject.ifStatusFlag == '1')
    {
		return "<div class='deviceLegendIndex' style='background-color:#89d5a9;' title='"+title+"'>"+parseInt(rowObject.IFINDEX)+"</div>"; //No I18N
    }
    else if(rowObject.ifStatusFlag == '2')
    {
		return "<div class='deviceLegendIndex' style='background-color:#999999' title='"+title+"'>"+parseInt(rowObject.IFINDEX)+"</div>"; //No I18N
    }
    else if(rowObject.ifStatusFlag == '3')
    {
		return "<div class='deviceLegendIndex' style='background-color:#ffd1d8' title='"+title+"'>"+parseInt(rowObject.IFINDEX)+"</div>"; //No I18N
    }
    else if(rowObject.ifStatusFlag == '4')
    {
		return "<div class='deviceLegendIndex' style='background-color:#83d060' title='"+title+"'>"+parseInt(rowObject.IFINDEX)+"</div>"; //No I18N
    }
    else if(rowObject.ifStatusFlag == '5')
    {
		return "<div class='deviceLegendIndex' style='background-color:#be8c74' title='"+title+"'>"+parseInt(rowObject.IFINDEX)+"</div>"; //No I18N
    }

}

function npDevsnapshot(cellValue, options, rowdata, action){

    return "<span class='cursorPointer' onclick='redirectToSnapshot(\"MonitoringDevice\",\""+rowdata.deviceName+"\",\"Notification\")'>"+cellValue+"</span>";//No I18n
}

function top10DevicesRedirect(cellValue, options, rowdata, action){
    return "<span class='ncmLink' onclick='redirectToSnapshot(\"MonitoringDevice\",\""+opm_escapeHTML(rowdata['0'])+"\")'>"+opm_escapeHTML(rowdata['0'])+"</span>";//No I18n
}

function opm_eventTypeList(cellValue, options, rowdata, action){
    return "<span class='cursorPointer' style='text-decoration: underline;' onclick='opm_loadCustomFilterEvents(\"eventType\",\""+rowdata["0"]+"\",\""+Ember.I18n.t('webclient.admin.eventlog.configrule.eventtype',this)+" - "+rowdata["1"]+"\")'>"+cellValue+"</span>";//No I18n
}

function showNAIfNegative(cellValue, options, rowData, action){
    if(cellValue !== undefined && cellValue >= 0){
        return "<div><span>"+cellValue+"</span></div>";
    }else{
        return "<div><span>"+Ember.I18n.t('webclient.ncm.eol.na',this)+"</span></div>";
    }
}


function booleanFormatter(cellValue, options, rowData, action){
    var toReturn = "";
    if(cellValue !== undefined){
        if(cellValue === true || cellValue === "true"){
            toReturn = "<i class='icon-status5'></i>";//No I18N
        }else if(cellValue === false || cellValue === "false"){
            toReturn = "<i class='icon-status1'></i>";//No I18N
        }
    }
    return toReturn;
}
function opm_StatusPollCheckBoxFormatter(e)
{
   e = e||event;
   e.stopPropagation? e.stopPropagation() : e.cancelBubble = true;

   if($("#intfConfigStatus").prop("checked"))
   {
        $("input[name='statuspoll']").prop("checked",true); //No I18n
   }
   else
   {
        $("input[name='statuspoll']").prop("checked",false); //No I18n
   }

    $.each($('#configureIntfList').jqGrid('getDataIDs'),function(k,rowId){
   		confIntfEditedCnt(rowId);
   });
}
function opm_IntfManagePollCheckBoxFormatter(event)
{
    event = event||event;
   event.stopPropagation? event.stopPropagation() : event.cancelBubble = true;

   if($("#intfConfigManage").prop("checked"))
   {
        $("input[name='managed']").prop("checked",true); //No I18n
   }
   else
   {
        $("input[name='managed']").prop("checked",false); //No I18n
   }

   $.each($('#configureIntfList').jqGrid('getDataIDs'),function(k,rowId){
   		confIntfEditedCnt(rowId);
   });
}
function AssociateEditMonitors(cellValue, options, rowdata, action){
    var actionElements ="";
    if(!OPMClient.ApplicationController.isMSPCentralSelected)
    {
        actionElements = "<i style='float:left; margin-left:0px !important' class='pointer icon-configedit' onclick=doSettingsMonitorsActions("+options.rowId+",'perfedit'); title='"+Ember.I18n.t('webclient.action.edit',this)+"' tabindex='0' role='button'></i><i class='icon-logout OpMToolTip pointer' style='margin-left:10px; font-size:16px;' title='"+Ember.I18n.t('webclient.settings.ncm.complianceAssociate',this)+"' onclick=doSettingsMonitorsActions("+options.rowId+",'perfassociate'); tabindex='0' role='button'></i>"; //No I18n;
    }
	if(rowdata.customGraph === 'true' ){
		actionElements += "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick=doSettingsMonitorsActions("+options.rowId+",'perfdelete'); tabindex='0' role='button'></i>";//No I18n
	}
     actionElements =  actionElements || "-";
	return actionElements;
}
function opm_checkBoxFormatter(e)
{
   e = e||event;
   e.stopPropagation? e.stopPropagation() : e.cancelBubble = true;

   if($("#intfConfigStatus").prop("checked"))
   {
        $("input[name='statuspoll']").prop("checked",true);
   }
   else
   {
        $("input[name='statuspoll']").prop("checked",false);
   }
   $.each($('#configureIntfList').jqGrid('getDataIDs'),function(k,rowId){
   		confIntfEditedCnt(rowId);
   });

}

function testCredentialActions(cellValue, options, rowdata, action) {
    var action = "<div class='testCredentialActionIcons'>"
    action += rowdata.statusCode == 2 ? "<i class='view-report' tabindex='0' role='button' style='display:inline-block' title='"+Ember.I18n.t('webclient.reports.viewreports',this)+"' onclick='testCredentialViewReport(&#39;"+rowdata.profileId+"&#39;, &#39;"+escape(rowdata.profileName)+"&#39;);'></i>" : "";
    action += window.OPM.userPermissions.discoveryWrite? (rowdata.statusCode != 1 ? "<i class='reportEdit' tabindex='0' role='button' data-title='Edit' title='"+Ember.I18n.t('webclient.title.edit',this)+"' style='cursor:pointer;' onclick='editTestCredentialProfile("+rowdata.profileId+")'></i><i class='reportDelete' tabindex='0' role='button' style='cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick='deleteTestCredentialProfile(&#39;"+rowdata.profileId+"&#39;)'></i>":"") : ""; //No I18n
    action += "</div>";
    return action;
}
function testCredentialStatusIcon(cellValue, options, rowdata, action) {
    switch(rowdata.statusCode) {
        case 0 : {
            return "<em class='svgIcon size16 yetToStartCredentials'><svg><use xlink:href='/"+ window.OPM.cacheRoot+"/apiclient/fluidicv2/img/sprite-opm.svg#rocket'></use></svg></em>"+opm_escapeHTML(cellValue);
        }
        case 1 : {
            return "<i class=reportGenerating></i>"+opm_escapeHTML(cellValue);
        }
        case 2 :  {
            return "<i class=reportGenerated></i>"+opm_escapeHTML(cellValue);
        }
    }
}

function goToDatastorePage(cellValue, options, rowdata, action){
    //vmware datastore name xss fix
    cellValue = opm_escapeHTML(cellValue)
	if(rowdata.deviceName !== undefined && !window.OPM.isOPMStandardEdition){
        return "<div onclick='redirectToSnapshot(&#39;MonitoringDevice&#39;,&#39;"+opm_escapeHTML(rowdata.deviceName)+"&#39;);' class='cursorPointer'>"+cellValue+"</div>";
    }
    return "<div>"+cellValue+"</div>";

}
function setStatusfromHtml(cellValue, options, rowdata, action) {
   if(cellValue != undefined )
   {
      cellValue = escapeHTML(cellValue);
      rowdata.STATUS_STR  = rowdata.STATUS_STR ? escapeHTML(rowdata.STATUS_STR) : '';//No I18N
      return "<i class='--fault-severity icon-status"+cellValue+"'></i> "+rowdata.STATUS_STR;//No I18N
   }
   else
   {
     return '';
   }
}

function setStatusHtmlLower(cellValue, options, rowdata, action) {
   return rowdata.status || "";
}

function setStandardStatusfromHtml(cellValue, options, rowdata, action) {
   if(cellValue != undefined )
   {
      cellValue = escapeHTML(cellValue);
      rowdata.STATUS_STR  = rowdata.STATUS_STR ? escapeHTML(rowdata.STATUS_STR) : '';//No I18N
        var title="";
        if(rowdata.CONNECT_STATE) {
            title = escapeHTML(rowdata.CONNECT_STATE);
        }
        
        if(rowdata.HBA_STATE) {
            title = escapeHTML(rowdata.HBA_STATE);
        }
      return "<i class='icon-status"+cellValue+"' title='"+title+"'></i> "+rowdata.STATUS_STR;//No I18N
   }
   else
   {
     return '';
   }
}

function setDHCPFilterDescription(cellValue, options, rowdata, action){
    var cmnt=rowdata['filter-description']; //No I18n
    var text=cmnt;
    if(cmnt=="" || cmnt=="-"){
        text=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this); //No I18n
    }
    if(window.OPM.isAuthorized){
        return "<a onclick='editRogueComments(&#39;"+rowdata['filter-id']+"&#39,&#39;"+cmnt+"&#39,&#39;"+"Blocked"+"&#39);' style='color:#0099ff'>"+text+"</a>"
    }else{
        return "<a>"+text+"</a>"
    }
}

function setDhcpMacReservation(cellValue, options, rowdata, action){
    var ipAddress=rowdata['ip-address']; //No I18n
    var dhcpServerTypeInt=rowdata['server-type-int']; //No I18n
    var cmnt=rowdata['dhcp-reserved-status']; //No I18n
    var text=cmnt;
    if(cmnt==""){
        text=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this); //No I18n
    }
    if((dhcpServerTypeInt == "1" || dhcpServerTypeInt == 1) && window.OPM.isOputilsDDIManagement && window.OPM.isAuthorized){
        return "<a onclick='reserveOrUnreserveDHCPServerIP(&#39;" + options.gid.split('opm_DeviceSnapList')[1]+"&#39;, &#39;"+options.rowId+"&#39;, &#39;"+ipAddress+ "&#39;);' style='color:#0099ff'>"+text+"</a>";
    }else{
        return "<a>"+text+"</a>";
    }
}

function setVMPowerState(cellValue, options, rowData, action){
    var toReturn = "";//No I18N
    if(rowData.powerState !== undefined){
        if(rowData.powerState === "poweredOff"){//No I18N
            toReturn = "<i class='icon-status1' title='"+Ember.I18n.t('webclient.OFF',this)+"'></i>"+Ember.I18n.t('webclient.OFF',this);//No I18N
        }else if(rowData.powerState === "poweredOn"){//No I18N
            toReturn = "<i class='icon-status5' title='"+Ember.I18n.t('webclient.ON',this)+"'></i>"+Ember.I18n.t('webclient.ON',this);//No I18N
        }else if(rowData.powerState === "suspended"){//No I18N
            toReturn = "<i class='icon-status2' title='"+Ember.I18n.t('webclient.power.suspend',this)+"'></i>"+Ember.I18n.t('webclient.power.suspend',this);//No I18N
        }
    }
    return toReturn;
}
function showProbeName(cellValue, options, rowdata, action)
{
    return "<span class='probeLink inventoryListProbe cursorPointer' onclick='opm_gotoProbeSnapshot(\""+rowdata.deviceName+"\")'>"+rowdata.probeName+"</span>";// NO I18N
}
function getLastNoteFormatter(type, view) {
    return function (cellValue, options, rowdata, action) {
        return lastNoteRenderer(cellValue, options, rowdata, action, type, view);
    };
}
function lastNoteRenderer(cellValue, options, rowdata, action, type, view) {
    // Return default values if lastNote is invalid
    if (rowdata.lastNote === -1 || rowdata.lastNote === "-") {
        return view === "grid" ? "-" : ""; // NO i18n
    }

    if (type === "notes") {
        if (view === "grid") {
            return "<i class='notes_inlist' role='link' tabindex='0'>" + $.jgrid.htmlEncode(rowdata.lastNote.notes) + "</i>"; // NO i18n
        } else {
            return "<i class='notes_inlist' role='link' tabindex='0'>: " + $.jgrid.htmlEncode(rowdata.lastNote.notes) + "</i>"; // NO i18n
        }
    }
    if (type === "who") {
        return escapeHTML(rowdata.lastNote.who);
    }
    return "";
}
function viewAddedTimeOntitle(cellValue, options, rowdata, action)
{
    return "<span title='"+escapeHTML(rowdata.addedTime)+"'>"+escapeHTML(rowdata.prettyTime)+"</span>";// NO I18N
}

function intfPopoutImg(cellValue, options, rowdata, action)
{
    return "<i onclick='redirectToInterfaceSnapshot(\""+rowdata.interfaceName+"\");'class='popoutImg' title='Full View'></i> ";//No I18N
}

function htmlEncode(value){
    return $('<div/>').text(value).html(); //No I18N
}

function opm_htmlEncode(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sortFWACustomTime(cell)
{
    var duration=0;
    if(cell != undefined && cell.indexOf('Days') > -1){
        var tempDur=cell.split(' Days ');
        duration=duration+(parseInt(tempDur[0])*86400);
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Day') > -1){
        var tempDur=cell.split(' Day ');
        duration=duration+86400;
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Hrs') > -1){
        var tempDur=cell.split(' Hrs ');
        duration=duration+(parseInt(tempDur[0])*3600);
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Hr') > -1){
        var tempDur=cell.split(' Hr ');
        duration=duration+3600;
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Mins') > -1){
        var tempDur=cell.split(' Mins ');
        duration=duration+(parseInt(tempDur[0])*60);
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Min') > -1){
        var tempDur=cell.split(' Min ');
        duration=duration+60;
        cell=tempDur[1];
    }
    if(cell != undefined && cell.indexOf('Secs') > -1){
        var tempDur=cell.split(' Hrs ');
        duration=duration+parseInt(tempDur[0]);
    }
    return duration;
}

function opm_ShowCursorPointer(cellValue, options, rowData, action){
    if(rowData.NAME !== undefined && rowData.NAME !== ""){
        return "<div class='cursorPointer'>"+opm_escapeHTML(cellValue)+"</div>";//No I18N
    }else{
        return "<div>"+opm_escapeHTML(cellValue)+"</div>";//No I18N
    }
}
function opm_showDSMonitor(cellValue,options,rowdata,action)
{
    var virtualType = "VMware-Datastore"; //No I18N
    OPMClient.InventoryDeviceDetailsController.set("vmGridID",$(this).closest(".content").attr("data-index"));//No I18N
    var toRet = ""; //No I18N

    if(rowdata.deviceName != undefined)
    {
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-stop pointer' title = '"+Ember.I18n.t('webclient.virtual.stopmonitoring',this)+"' onclick = 'opm_stopDSMonitoring(\""+opm_escapeHTML(rowdata.deviceName)+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        return toRet;
    }
    else
    {
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite)
        {
            toRet = "<i class='icon-start pointer' title = '"+Ember.I18n.t('webclient.nwm.startmonitoring',this)+"' onclick = 'opm_startDSMonitoring(\""+opm_escapeHTML(rowdata.Datastore_ID)+"\",\""+virtualType+"\",this)'></i>";//No I18N
        }
        return toRet;
    }
}

function opm_stopDSMonitoring(name,virtualType,thisDiv)
{
	var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/device/deleteVirtualEntity?name="+name+"&entityType="+virtualType);//No I18N
    if (response.error !== undefined){
        opm_infoMsgs("errorMsg",response.error.message);    //No I18N
    }else if (response.result != undefined){
        $(thisDiv).closest("div.singleInvWidget").siblings("div.inventoryWidget").find('.icon-ccw.widget_refresh').trigger('click');//No I18N
        opm_infoMsgs("successMsg",response.result.message); //No I18N
    }
}
function opm_startDSMonitoring(vdID,virtualType,thisDiv)
{
	var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/device/mapEntity?entityID="+vdID+"&virtualType="+virtualType);//No I18N
    if (response.error !== undefined){
        opm_infoMsgs("errorMsg",response.error.message);    //No I18N
    }else if(response.result === "false"){  //No I18N
        opm_infoMsgs("errorMsg",response.status);//No I18N
    }else if (response.result === "true"){  //No I18N
        $(thisDiv).closest("div.singleInvWidget").siblings("div.inventoryWidget").find('.icon-ccw.widget_refresh').trigger('click');//No I18N
        opm_infoMsgs("successMsg",response.status); //No I18N
    }
}
function opm_AvailValueToString(value)
{
    var toRet="";
    if(value === 0){
        toRet = Ember.I18n.t('webclient.devices.intftypes.down',this) ; //No I18n
    }else if(value === 1){
        toRet = Ember.I18n.t('webclient.devices.intftypes.up',this); //No I18n
    }
    return toRet;
}
function interfaceListView(cellValue, options, rowData, action){
    var r_str = "";
    var redirectUrl = ""; 
    if(rowData.interfaces !== undefined && rowData.interfaces.length > 0){

        $.each(rowData.interfaces, function(i,val)
        {   
            redirectUrl = redirectToSnapshot("MonitoringInterface",val.ifName, undefined, undefined , true);  //No I18N
            var tooltipData = '{"'+Ember.I18n.t('webclient.map.view.name',this)+'":"'+escape(val.ifDispName)+'","'+Ember.I18n.t('webclient.map.view.adminstat',this)+'":"'+val.ifAdminStatus+'","'+Ember.I18n.t('webclient.map.view.operstat',this)+'":"'+val.ifOperStatus+'"}';//No I18N
            r_str += '<a href="' + redirectUrl + '" ><i data-id="'+val.moid+'" class="--fault-severity icon-status'+val.ifStatus+' icon-statusColorInfo opmToolTipDesc cursorPointer" data-intfcount=\''+rowData.interfaceCount+'\' data-obj=\''+tooltipData+'\' ></i></a>';//No I18N
        });
    }
    return r_str;
}

function getInterfaceCount(cellValue, options, rowData, action)
{
    var intfCount = $('i', rowData).attr('data-intfcount'); //No I18n
    if(intfCount !== undefined && intfCount !== "") {
        return intfCount
    } else {
        return "0"; //No I18n
    }
}

function deviceListView(cellValue, options, rowData, action){
    var r_str = "";
    if(rowData.monitors !== undefined && rowData.monitors.length > 0){

        $.each(rowData.monitors, function(i,val)
        {
            var tooltipData = "";
            if(val.monitorType === "performanceMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.snapshot.testlinks.protocol',this)+'":"'+opm_escapeHTML(val.protocol)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.pollID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';
            }
            else if(val.monitorType === "adMonitors" || val.monitorType ==="exchangeMonitors" || val.monitorType ==="mssqlMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.pollID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';
            }
            else if(val.monitorType === "urlMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.customtab.option.URL',this)+'":"'+encodeURIComponent(val.url)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.urlUnique+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "serverMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.topo.details.tabs.port',this)+'":"'+encodeURIComponent(val.portNo)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.pollID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "ntServiceMonitors" || val.monitorType === "adServices" || val.monitorType === "exchangeServices" || val.monitorType === "mssqlServices")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.servMOID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "processMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.procID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "fileMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.fileID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "folderMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.folderID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
            else if(val.monitorType === "scriptMonitors")
            {
                tooltipData = '{"'+Ember.I18n.t('webclient.admin.graphs.graphname',this)+'":"'+encodeURIComponent(val.monitorDispName)+'","'+Ember.I18n.t('webclient.devices.details.type',this)+'":"'+OPM_tabDisplayMap[val.monitorType]+'","'+Ember.I18n.t('webclient.devices.details.status',this)+'":"'+opm_escapeHTML(val.statusStr)+'"}';//No I18N
                r_str += '<i class="--fault-severity icon-status'+val.monSeverity+' icon-statusColorInfo opmToolTipDesc cursorPointer" id="'+val.monitorType+'_'+val.pollID+'" onclick="redirectToSnapshot(\'MonitoringDevice\', \''+val.deviceName+'\');" data-obj=\''+tooltipData+'\' ></i>';//No I18N
            }
        });
    }
    return r_str;
}


function tableVectorFormatter(cellValue, options, rowdata, action){
    var customDiv="";
    if(typeof cellValue === 'string'){
        customDiv+= "<div class='opm_link cursorPointer' onclick=\"javascript:location.href='#/Settings/Tools/SNMPTools/NodeViewer/"+cellValue+"'\"><span>"+cellValue+"</span></div>";
    }
    else if(Array.isArray(cellValue)){
        for (var i = 0; cellValue[i]!==undefined; i++) {
            customDiv+= "<div class='opm_link cursorPointer' onclick=\"javascript:location.href='#/Settings/Tools/SNMPTools/NodeViewer/"+cellValue[i]+"'\"><span>"+cellValue[i];
            if(cellValue[i+1]!==undefined && cellValue[i+1]!==null){
                customDiv+=", </span></div>";}
            else{
                customDiv+="</span></div>";
            }
        }
    }
    return customDiv;
}

function editStorageCredential(cellValue, options, rowdata, action){
    var editCredential = !window.OPM.userPermissions.discoveryWrite?('<div data-credName="'+cellValue+'" data-credType="'+rowdata.type+'">'+cellValue+'</div>'):('<div style="cursor:pointer;" onclick="openCredentialSlide(this)" data-credName="'+cellValue+'" data-credType="'+rowdata.type+'" data-href="'+window.OPM.apiclientUrl+'Settings/Discovery/Credentials/Storage/Edit">'+cellValue+'</div>');//No I18N
    if(rowdata.isCentralCred) {
        return '<span class="textWithIcon gap-sm"><div class="text">' + editCredential + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>'; //No I18N
    } else {
        return editCredential;
    }
}
function opstorCredentialDelete(cellValue, options, rowdata, action)
{
	return '<i class="icon-trash delete OpMToolTip" style="margin-left:20px; font-size:16px; cursor:pointer;" data-title="Delete" data-credName="'+rowdata.credentialName+'" data-credId="'+rowdata.credentialId+'" onclick="deleteOpStorCredential(this)"></i>'; //No I18n
}

function deleteOpStorCredential(div)
{
    var credentialId = unescape($(div).attr("data-credId"));
	credentialName = $(div).attr("data-credName");
	var url = window.OPM.apiUrlPattern + '/admin/deleteCredential'; //No I18N
    var callBackFn = function() {
        var addClasses = "";//No I18N
        var message = "";// No I18N
        var response = opm_ajaxPostRequest(url, {'credentialName': credentialName}); //No I18N
        if(response !== undefined && !$.isEmptyObject(response))
        {
            if(response.result !== undefined)
            {
                addClasses = "successMsg";//No I18N
                message =response.result.message;
                opstor_getCredentialList();
                if(window.OPM.isCentralServer && !window.OPM.credDelCentralOnlyEnabled) {
                    deleteCredentialFrmProbe(credentialId);
                }
            }
            else if(response.error !== undefined)
            {
                addClasses = "errorMsg";//No I18N
                message = response.error.message;
            }
            opm_infoMsgs(addClasses,message);
        }
    }
    if(window.OPM.isCentralServer) {
        var delOpmConfirmMsg= Ember.I18n.t('webclient.opm.cc.central.delcredential.msg',this); //No I18N
        if(window.OPM.credDelCentralOnlyEnabled) {
            delOpmConfirmMsg = Ember.I18n.t('webclient.opm.cc.central.delcredential.centralonly.msg',this); //No I18N
        }
        opmConfirm("", delOpmConfirmMsg, '500', callBackFn, Ember.I18n.t('webclient.topo.objectdetails.managed.yes'), '', Ember.I18n.t('webclient.topo.objectdetails.managed.no'), '', 'dialogStyle2', true, false, '', false, true);//No I18N
    } else {
        var delConfirmMsg = Ember.I18n.t('webclient.common.deleteconfirmation',this)+" \'"+credentialName+"\' ?"; //No I18N
        if(confirm(delConfirmMsg))
        {
            callBackFn();
        }
    }
}

function setAvailBgrStorage(cellValue, options, rowdata, action)
{
    var availability = 0;
    if(cellValue !== undefined)
    {
        availability = parseInt(cellValue);
    }
    return '<div class="severity-container"><div><div class="utrow severity_5" data-value="'+availability+'" style="width: '+availability+'%;"></div></div><span>'+availability+'%</span></div>'
}

function setAvailBgrStorageSummary(cellValue, options, rowdata, action)
{
    var availability = Math.round(cellValue/rowdata[4]*100);
    return '<div class="severity-container"><div><div class="utrow severity_5" data-title="'+cellValue+' TB" data-value="'+availability+'" style="width: '+availability+'%;"></div></div><span>'+availability+'%</span></div>'
}

function generateRealTimeMonitorsforDials(params){
    OPMClient.InventoryDeviceDetailsController.set("realtimeParams",params);//No I18N
    OPMClient.InventoryDeviceDetailsController.set("realTimeMonitorFromSnapshot",true);//No I18N
    opm_transitionToParentRoute("Inventory.Device.RealTimeInterface");//No I18N
}

function formatSysOIDColumn(cellvalue, options, rowdata) {
	if(rowdata[2] == null || rowdata[2] == "null") {
		if(window.OPM.userPermissions.ncmDevMgmtWrite || window.OPM.userPermissions.ncmRestricted) {
		    return "<a style='color:#31A5F0;text-decoration:underline' onclick=\"redirectToUpdateSysOID('"+ rowdata[0] +"')\">" + Ember.I18n.t("webclient.admin.adauthentication.update", this) + "</a>"; //No I18N
		} else {
			return Ember.I18n.t("webclient.admin.adauthentication.update", this);	//No I18N
		}
	} else {
		return rowdata[2];
	}
}
function groupingCriteriaDelIcon(cellValue, options, rowData, action)
{
	return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' title='"+Ember.I18n.t('webclient.general.delete')+"' onclick='groupingCriteriaDel(&#39;"+options.rowId+"&#39;);'></i>";
}
/*function groupingDelIcon(cellValue, options, rowData, action)
{
	return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.general.delete')+"' onclick='opm_deleteLogicalGroupsFrmInv(&#39;"+rowData.groupName+"&#39;)'></i>"; //No I18n

}*/
function groupingInvEditIcon(cellValue, options, rowData, action)
{
    var disableEdit = rowData.fromCentral == "true" ? "<i class='icon-configedit onlyGreyOut' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+ Ember.I18n.t('webclient.group.edit.central', {operation:Ember.I18n.t('webclient.title.edit',this)},this) +"'></i>" : "<i class='icon-configedit' style='margin-left:20px; font-size:16px; cursor:pointer;' title="+ Ember.I18n.t('webclient.title.edit',this) +" onclick='gotoEditLogicalGroup(&#39;"+escape(rowData.groupName)+"&#39;,&#39;"+escape(rowData.groupID)+"&#39;);' tabindex='0' role='button'></i>";
    return disableEdit;
}

function settingsGroupingDelIcon(cellValue, options, rowData, action)
{
    var groupMapIcon = "";
    if(rowData.groupType === "Device" || rowData.groupType === "Group")
    {
        groupMapIcon = "<div class='groupsList-table-action'><div title='"+Ember.I18n.t('webclient.selectview.MapView',this)+"' onclick='showGroupsMapSlide(&#39;"+escape(rowData.groupDisplayName)+"&#39;,&#39;"+escape(rowData.groupID)+"&#39;,&#39;"+escape(rowData.groupType)+"&#39;);' tabindex='0' role='button'><em class='svgIcon size16 ml-xs mr-xs'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#business-view'/></svg></em></div>";//No I18N
    }
    
    var actionEle = groupMapIcon+"<span class=' pointer rca-icon-edit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='gotoEditLogicalGroup(&#39;"+escape(rowData.groupName)+"&#39;,&#39;"+escape(rowData.groupID)+"&#39;);' style='float:left;margin-left:5px;' tabindex='0' role='button'></span>";//No I18N
    
    //Edit and Delete icon
   if(rowData.fromCentral == "true")
   {
    var actionEle = groupMapIcon+"<span class='onlyGreyOut rca-icon-edit' style='float:left;margin-left:5px;'  tabindex='0' role='button' title='" + Ember.I18n.t('webclient.group.edit.central', {operation:Ember.I18n.t('webclient.title.edit',this)},this) +"'></span>";//No I18N
    disabledClass = "rca-icon-delete delete OpMToolTip onlyGreyOut"//No I18N
   }
   else
   {
    disabledClass = "rca-icon-delete delete OpMToolTip pointer"//No I18N
   }
    if(rowData.groupType!=="Group" && rowData.groupType!=="Ipsla" && rowData.groupType !== "Apmservers" && rowData.groupType !== "Apmmonitors" && window.OPM.isAdministrator && !window.OPM.isFreeEdition && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition && !window.OPM.isMSPCentral && !window.OPM.isCentralServer){//No I18N
   //create RCA icon
        actionEle += "<span class='rca-icon-chart' style='float:left' onclick='createGroupAssociatedRCA(&#39;"+rowData.groupName+"&#39;)' title=\""+Ember.I18n.t('webclient.opm.rca.createnew',this)+"\" tabindex='0' role='button'></span>";  //No I18N
    }
    //delete icon
    if(rowData.fromCentral == "true")
    {
        actionEle += "<span class='"+disabledClass+"' style='float:left'  title='"+ Ember.I18n.t('webclient.group.edit.central', {operation:Ember.I18n.t('webclient.devices.customfields.delete',this)},this) +"'></span>";  //No I18N
    } else {
        actionEle += "<span class='"+disabledClass+"' style='float:left'  onclick='opm_deleteNReloadLogicalGroups(&#39;"+rowData.groupName+"&#39;)' title='"+ Ember.I18n.t('webclient.devices.customfields.delete',this) +"' tabindex='0' role='button'></span>";  //No I18N
    }
    actionEle+="<span class=' pointer  rca-icon-copy' title="+Ember.I18n.t('webclient.reports.copyas',this)+" onclick='goToGroupCopyAs(&#39;"+escape(rowData.groupName)+"&#39;,&#39;"+escape(rowData.groupID)+"&#39;);' style='float:left;'></span>"
    return actionEle;
}
function gotoEditLogicalGroup(groupName,groupId)
{
	var obj = {"groupName":unescape(groupName),"groupId":unescape(groupId)}; //No I18N
	OPMClient.SettingsAddEditController.pageObj = obj;
	OPMClient.SettingsAddEditController.slidePageHeader=Ember.I18n.t('webclient.action.edit')+" - "+groupName; //No I18N
	settingsGlobalRoute.transitionTo('Settings.Configurations.ElementsGroup.Update');  //No I18N
}
function goToGroupCopyAs(groupName,groupId)
{
	var obj = {"groupName":unescape(groupName),"groupId":unescape(groupId)}; //No I18N
    obj.copyAs=true;
	OPMClient.SettingsAddEditController.pageObj = obj;
	OPMClient.SettingsAddEditController.slidePageHeader=Ember.I18n.t('webclient.action.edit')+" - "+groupName; //No I18N
	settingsGlobalRoute.transitionTo('Settings.Configurations.ElementsGroup.CopyAs');  //No I18N
}

function opm_deleteNReloadLogicalGroups(nameArr)
{
	if(confirm(Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg',this)))
	{
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern +'/admin/deleteLogicalGroup?',{"groupName":unescape(nameArr.toString())}); //No I18n
        if(response.result !== undefined) {
            opm_infoMsgs("successMsg",response.result.message); //No I18n
        } else if(response.error !== undefined) {
            opm_infoMsgs("errorMsg",response.error.message); //No I18n
        }
		opm_loadGroupingGrid();
	}
}
function opm_deleteLogicalGroupsFrmInv(nameArr)
{
	if(confirm(Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg',this)))
	{
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern +'/admin/deleteLogicalGroup?',{"groupName":nameArr.toString()}); //No I18n
		if(response.result !== undefined)
		{
			opm_infoMsgs("successMsg",response.result.message);//No I18N
            $("#opm_interfacesList").jqGrid("GridUnload");//No I18N
			opm_listAllGroups();
            if(window.OPM.currentView.name.indexOf('Inventory.List.Summary')!==-1 && OPMClient.InventoryDeviceDetailsController.subFilterType==="GROUP"){
                OPMClient.InventoryDeviceDetailsController.set("treeGroupBy","");//No I18N
                setTimeout(function(){OPMClient.InventoryDeviceDetailsController.set("treeGroupBy","group");},100);//No I18N
            }
            $('#opm_Groups tr > td:first-child input,#cb_opm_Groups').click(); //No I18N
		}
		else if(response.error !== undefined) {
			opm_infoMsgs("errorMsg",response.error.message);//No I18N
            return false;
		}
		return true;
	}else{
		return false;
	}
}
function setGroupStatus_img(cellValue, options, rowData, action)
{
	return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowData.status)+"'></i> "+opm_escapeHTML(rowData.statusLabel);//No I18N
}

function opm_linkToGroupSnap(cellValue, options, rowData, action)
{
	var statusIcon = "<i class='--fault-severity icon-status"+rowData.statusNum+"'></i>";//No I18N
	if(window.OPM.isNewStatusPropagation && rowData.state !== undefined){
		var availClass = opm_getStateCls(rowData.state);
		statusIcon = "<em class='--fault-severity icon-status --dual-status status-" + rowData.statusNum + " " + availClass + "'></em>";//No I18N
	}
	if(rowData.type === "IPSLA" && rowData.ipslaDisplayname !== undefined){ //No I18N
        return "<span onclick='opm_linktoGroupElements(&#39;"+rowData.name+"&#39;,&#39;"+rowData.elemRedir+"&#39;)'>"+statusIcon+escapeHtmlTags(rowData.ipslaDisplayname)+"</span>"; //No I18N
    }else{
        return "<span onclick='opm_linktoGroupElements(&#39;"+rowData.name+"&#39;,&#39;"+rowData.elemRedir+"&#39;)'>"+statusIcon+escapeHtmlTags(rowData.displayname)+"</span>"; //No I18N
    }
}
function opm_linktoGroupElements(grpName,reDirectType){

    if(reDirectType === "device_snap"){
        redirectotGroupsSnapshot(grpName,'Device');//No I18N
    }
    else if(reDirectType === "interface_snap"){
        redirectotGroupsSnapshot(grpName,'Interface');//No I18N
    }
    else if(reDirectType === "device"){
        window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		redirectToDeviceSnapshot(grpName,'','MonitoringDevice');//No I18N
    }
    else if(reDirectType === "interface"){
        window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		redirectToInterfaceSnapshot(grpName);
    }
    else if(reDirectType === "ipsla" || reDirectType === "ipsla_snap"){
        redirectotGroupsSnapshot(grpName,'Ipsla');//No I18N
    }
    else if(reDirectType === "apmservers" || reDirectType === "apmmonitors"){
        var resourceId = grpName.split("APM_")[1];
        if(window.OPM.isCentralServer || window.OPM.isProbe)
        {
            resourceId = (resourceId).split(".")[0];
        }
        if(resourceId !== undefined)
        {
            redirectToAPMMonitor(resourceId);
        }else{return;}
    }
    else if(reDirectType === "apmservers_snap"){ //No I18N
        redirectotGroupsSnapshot(grpName,'Apmservers'); //No I18N
    }
    else if(reDirectType === "apmmonitors_snap"){ //No I18N
        redirectotGroupsSnapshot(grpName,'Apmmonitors'); //No I18N
    }
    else{
        redirectotGroupsSnapshot(grpName);
    }

}
function opm_widgetToGroupSnap(cellValue, options, rowData, action)
{
    var groupName = escapeHtmlTags(rowData.groupName);
    var groupType = escapeHtmlTags(rowData.groupType);
    var groupDisplayName = escapeHtmlTags(rowData.groupDisplayName);
    var url = redirectotGroupsSnapshot(groupName, groupType, true);
    return "<a href='" + url + "' style='cursor:pointer; text-decoration:none;'><i class='--fault-severity icon-status" + rowData.status + "'></i>" + groupDisplayName + "</a>"; //No I18N
}

function problematicMemberCount(cellValue, options, rowData, action)
{

    if(rowData.severityCounts!==undefined){
        var criticalWidth = ((parseInt(rowData.severityCounts["1"] || 0) / rowData.count) * 100) + '%';
        var troubleWidth = ((parseInt(rowData.severityCounts["2"] || 0) / rowData.count) * 100) + '%';
        var attentionWidth = ((parseInt(rowData.severityCounts["3"] || 0) / rowData.count) * 100) + '%';
        var serviceDownWidth = ((parseInt(rowData.severityCounts["4"] || 0) / rowData.count) * 100) + '%';
        var unmanagedWidgth = ((parseInt(rowData.severityCounts["7"] || 0) / rowData.count) * 100) + '%';
        var clearCount = rowData.count - ((parseInt(rowData.severityCounts["1"] || 0)) + (parseInt(rowData.severityCounts["2"] || 0)) + (parseInt(rowData.severityCounts["3"] || 0)) + (parseInt(rowData.severityCounts["4"] || 0)) + (parseInt(rowData.severityCounts["7"] || 0)));
    }

    return (
        '<div title='+ clearCount  +' class="severity-container" style="display: flex; align-items: center;">' + //No I18N
            '<div class="severity_5 --fault-severity" style="display: flex; width: 100%; height: 5px; position: relative;">' + //No I18N
                '<div title='+ (parseInt(rowData.severityCounts["1"] || 0))  +' class="severity_1 --fault-severity" style="width: ' + criticalWidth + '; height: 100%;"></div>' + //No I18N
                '<div title='+ (parseInt(rowData.severityCounts["2"] || 0))  +' class="severity_2 --fault-severity" style="width: ' + troubleWidth + '; height: 100%;"></div>' + //No I18N
                '<div title='+ (parseInt(rowData.severityCounts["3"] || 0))  +' class="severity_3 --fault-severity" style="width: ' + attentionWidth + '; height: 100%;"></div>' + //No I18N
                '<div title='+ (parseInt(rowData.severityCounts["4"] || 0))  +' class="severity_4 --fault-severity" style="width: ' + serviceDownWidth + '; height: 100%;"></div>' + //No I18N
                '<div title='+ (parseInt(rowData.severityCounts["7"] || 0))  +' class="severity_7 --fault-severity" style="width: ' + unmanagedWidgth + '; height: 100%;"></div>' + //No I18N

            '</div>' + //No I18N
            '<span style="margin-left: 10px;">' + //No I18N
                '<span class="showCount_1">'+ opm_escapeHTML(rowData.problematicMembers) + '</span>' + " / " + opm_escapeHTML(rowData.count) + //No I18N
            '</span>' + //No I18N
        '</div>' //No I18N
    );
}

function opm_gotoGroupElementSnap(name, memType,groupType)
{
	if(memType === "" || memType === undefined)
	{
		return;
	}
	else if(memType === "Device" || memType === "device"){
		window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		redirectToDeviceSnapshot(name,'','MonitoringDevice');//No I18N
	}else if(memType === "Interface" || memType === "interface")//No I18N
	{
		window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		redirectToInterfaceSnapshot(name);
	}else{
		if(groupType === "device")
		{
			redirectotGroupsSnapshot(name,'Device');//No I18N
		}else if(groupType === "interface") //No I18N
		{
			redirectotGroupsSnapshot(name,'Interface');//No I18N
		}else{
			redirectotGroupsSnapshot(name);
		}
	}
}
function opm_linkToElementAlarmSnapshot(cellValue, options, rowData, action)
{
	return "<span onclick='redirectToAlarm(&#39;"+rowData.alarmId+"&#39;)'><i class='--fault-severity icon-status"+rowData.status+"'></i>"+opm_escapeHTML(rowData.message)+"</span>"; //No I18N
}
function opm_gElemAlarmTogSnap(cellValue, options, rowData, action)
{
	/*if(rowData.name === OPMClient.InventoryDeviceDetailsController.selDevice)
	{
		return "<span onclick='opm_gotoGroupElementSnap(&#39;"+rowData.name+"&#39;,&#39;&#39;,'alarm')'>"+cellValue+"</span>";//No I18N
	}else{
		return "<span onclick='opm_gotoGroupElementSnap(&#39;"+rowData.name+"&#39;,&#39;"+rowData.groupType+"&#39;'alarm')'>"+cellValue+"</span>";//No I18N
	}*/
	if(rowData.name === OPMClient.InventoryDeviceDetailsController.selDevice){

		return "<span>"+cellValue+"</span>";//No I18N
	}else{
		if(rowData.type === "device" )
		{
			return "<span onclick='redirectotGroupsSnapshot(&#39;"+rowData.name+"&#39;,&#39;Device&#39;)'>"+cellValue+"</span>";//No I18N
		}
		else if(rowData.type === "interface"){
			return "<span onclick='redirectotGroupsSnapshot(&#39;"+rowData.name+"&#39;,&#39;Interface&#39;)'>"+cellValue+"</span>";//No I18N
		}
		else{
			return "<span onclick='redirectotGroupsSnapshot(&#39;"+rowData.name+"&#39;,&#39;Group&#39;)'>"+cellValue+"</span>";//No I18N
		}
	}
}
function opm_gElemAlarmToElemSnap(cellValue, options, rowData, action)
{

    if(rowData.name === OPMClient.InventoryDeviceDetailsController.selDevice){

        return "<span>"+cellValue+"</span>";//No I18N
    }
	if(rowData.groupType === "device" )
	{
		return "<span onclick='opm_gotoGroupElementSnap(&#39;"+rowData.name+"&#39;,&#39;Device&#39;)'>"+escapeHtmlTags(cellValue)+"</span>";//No I18N
	}
	else if(rowData.groupType === "interface"){
		return "<span onclick='opm_gotoGroupElementSnap(&#39;"+rowData.name+"&#39;,&#39;Interface&#39;)'>"+opm_escapeHTML(cellValue)+"</span>";//No I18N
	}
    else if(rowData.groupType === "ipsla"){
		return "<span onclick='opm_gotoGroupElementSnap(&#39;"+rowData.ipslaSource+"&#39;,&#39;Device&#39;)'>"+opm_escapeHTML(cellValue)+"</span>";//No I18N
	}
	else{
		return "<span onclick='redirectotGroupsSnapshot(&#39;"+rowData.name+"&#39;,&#39;Group&#39;)'>"+cellValue+"</span>";//No I18N
	}
}


function onMaintananceStatus(cellValue, options, rowdata, action) {
if((window.OPM.userPermissions.downtimeScheduleWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.downtimeScheduleWrite || window.OPM.restrictedPermissions.probeScopeRestricted.downtimeScheduleWrite) && rowdata.isCentralBasedDTS !== "true") {
        if (rowdata.statusNum === "1") {
            if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool != undefined) {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType +"\",\"" + rowdata.tpiTool + "\"," + rowdata.isDTUpdateDeleteResticted + ")' checked name=''><label></label></div>";//No I18N
            }
            else {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\","+undefined+","+undefined + ")' checked name=''><label></label></div>";//No I18N
            }
        }
        else if(rowdata.statusNum === "2") {
            if (window.OPM.isCentralServer) {
                if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool != undefined) {
                    return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\",\"" + rowdata.tpiTool + "\"," + rowdata.isDTUpdateDeleteResticted + ")' checked name=''><label></label></div>";//No I18N
                }
                else {
                    return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this, " + rowdata.id + ", \"" + rowdata.suppressType + "\","+undefined+","+undefined+ ")' checked name=''><label></label></div>"; //No I18N
                }
            } else {
                return rowdata.status;
            }
        }
        else {
            if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool != undefined) {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\",\"" + rowdata.tpiTool + "\"," + rowdata.isDTUpdateDeleteResticted+")' name=''><label></label></div>";//No I18N
            }
            else {
                return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\","+undefined+ ","+undefined+ ")' name=''><label></label></div>";//No I18N
            }
        }
    } else {
        if (rowdata.statusNum === "1") {
            return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this, " + rowdata.id + ", \"" + rowdata.suppressType + "\")' checked disabled name=''><label></label></div>"; //No I18N
        } else if (rowdata.statusNum === "2") {
            if (window.OPM.isCentralServer) {
                if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool != undefined) {
                    return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\",\"" + rowdata.tpiTool + "\"," + rowdata.isDTUpdateDeleteResticted + ")' checked name=''><label></label></div>";//No I18N
                }
                else {
                    return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this, " + rowdata.id + ", \"" + rowdata.suppressType +"\","+undefined+ ","+undefined + ")' checked name=''><label></label></div>"; //No I18N
                }
            } else {
                if (window.OPM.isCentralServer) {
                    if (rowdata.isDTUpdateDeleteResticted !== undefined && rowdata.tpiTool != undefined) {
                        return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this," + rowdata.id + ", \"" + rowdata.suppressType + "\",\"" + rowdata.tpiTool + "\"," + rowdata.isDTUpdateDeleteResticted + ")' checked name=''><label></label></div>";//No I18N
                    }
                    else {
                        return "<div class='chkRoundBtn'><input type='checkbox' onclick='initOnMaintanenceStatus(this, " + rowdata.id + ", \"" + rowdata.suppressType +"\","+undefined+ ","+undefined + ")' checked name=''><label></label></div>"; //No I18N
                    }
                } else {
                    return rowdata.status;
                }
            }
        } else {
            return "<div class='chkRoundBtn'><input type='checkbox' onclick='changeOnMaintanenceStatus(this, " + rowdata.id + ", \"" + rowdata.suppressType + "\")' disabled name=''><label></label></div>"; //No I18N
        }
    }
}

function redirectToAssociatedDeviceList(cellValue, options, rowdata, action){
    cellValue = opm_escapeHTML(cellValue);
    if(parseInt(cellValue)>0){
        return "<div style='text-decoration:underline;cursor:pointer;' onclick='opm_transitionToParentRoute(\"Settings.Monitors.SubMonitors.DeviceAssociated\")' tabindex='0' role='link'>"+cellValue+"</div>";//No I18N
    }
    else{
        return "<div>"+cellValue+"</div>";//No I18N
    }
}

function DeleteEditReport(cellValue, options, rowdata, action){
    var id=rowdata.ReportId;
    var actions='';
    var copyReport = "<i id='reportCopy_"+id+"' class='reportCopy' title="+Ember.I18n.t('webclient.reports.copyas',this)+" onclick='opm_copyAdvancedReport(&#39;"+rowdata.ReportId+"&#39;)' tabindex='0' role='button'></i>";//No I18n
    var editReport = "<i id='reportEdit_"+id+"' class='reportEdit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='gotoEditAdvanceReport(&#39;"+rowdata.ReportId+"&#39;);' tabindex='0' role='button'></i>";//No I18n
    var deleteReport = "<i id='reportDelete_"+id+"' class='reportDelete' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='opm_deleteAdvancedReport(&#39;"+rowdata.ReportId+"&#39;)' tabindex='0' role='button'></i>";//No I18n
    actions = copyReport;
    if(rowdata.isEdit  && rowdata.isCustom){
        actions += editReport+deleteReport;
    }
    if(OPMClient.ApplicationController.enableODReports) {
        if(opm_IsNumericVal(rowdata.ReportId)) {
            var viewReportLogs = "<i id='reportViewLog_"+id+"' class='reportViewLog' title='"+Ember.I18n.t('webclient.workflow.viewlogs', this)+"' onclick='viewReportLogs(&#39;"+rowdata.ReportId+"&#39;);' tabindex='0' role='button'></i>";//NO I18N
            actions+=viewReportLogs;
        }
    }
    return actions;
}


function deleteEditQueryReport(cellValue, options, rowdata, action){
    var id=rowdata.ReportId;
    var editReport = "<i id='reportEdit_"+id+"' class='reportEdit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='editQueryReport(&#39;"+rowdata.ReportId+"&#39;);'></i>";//No I18n
    var deleteReport = "<i id='reportDelete_"+id+"' class='reportDelete' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='opm_deleteQueryReport(&#39;"+rowdata.ReportId+"&#39;)'></i>";//No I18n
    var actions = editReport+deleteReport;
    return actions;
}

function deleteEditQueryVariables(cellValue, options, rowdata, action){
    var id=rowdata.variableID;
    var editReport = "<i id='reportEdit_"+id+"' class='reportEdit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='editQueryVariable(&#39;"+rowdata.variableID+"&#39;);'></i>";//No I18n
    var deleteReport = "<i id='reportDelete_"+id+"' class='reportDelete' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='opm_deleteQueryVariable(&#39;"+rowdata.variableID+"&#39;,&#39;"+rowdata.Name+"&#39;)'></i>";//No I18n
    var actions = editReport+deleteReport;
    return actions;
}

function deleteEditWidgetQueryVariables(cellValue, options, rowdata, action){
    var id=rowdata.variableID;
    var editReport = "<i id='reportEdit_"+id+"' class='reportEdit' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='editCustomWidgetVariable(&#39;"+rowdata.variableID+"&#39;);'></i>";//No I18n
    var deleteReport = "<i id='reportDelete_"+id+"' class='reportDelete' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='opm_deleteQueryVariable(&#39;"+rowdata.variableID+"&#39;,&#39;"+rowdata.Name+"&#39;)'></i>";//No I18n
    var actions = editReport+deleteReport;
    return actions;
}

function favouriteReport(cellValue, options, rowdata, action)
{
	if(cellValue==="True") {
		return "<i class='icon-star' style='margin-left:20px; font-size:20px; cursor:pointer;' title='"+Ember.I18n.t('webclient.reports.removefavourite',this)+"' onclick='addOrRemoveFav(\"unMark\",\""+rowdata.id+"\")'></i>"; //No I18n
	} else {
		return "<i class='icon-star-empty' style='margin-left:20px; font-size:20px; cursor:pointer;' title='"+Ember.I18n.t('webclient.reports.myfavourite',this)+"' onclick='addOrRemoveFav(\"mark\",\""+rowdata.id+"\")'></i>"; //No I18n
	}
}

function schReportEnableDisable(cellValue, options, rowdata, action){
	if(rowdata.scheduleStatus=="Enabled"){
		return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableDisableScheduleReport(&#39;"+rowdata.ScheduleName+"&#39;,&#39;Disable&#39;)' checked name=''><label></label></div>";//No I18N
	} else {
		return "<div class='chkRoundBtn'><input type='checkbox' onclick='enableDisableScheduleReport(&#39;"+rowdata.ScheduleName+"&#39;,&#39;Enable&#39;)' name=''><label></label></div>";//No I18N
	}
}
function opm_linktoFloorList(cellValue, options, rowdata, action)
{
	return "<a href='"+window.OPM.apiclientUrl+"Maps/ThreeDMaps/"+opm_escapeHTML(rowdata.floorId)+"'>"+opm_escapeHTML(rowdata.displayName)+"</a>"; //No I18N
}

function opm_linktoRackList(cellValue, options, rowdata, action)
{
	return "<a href='"+window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+opm_escapeHTML(rowdata.moid)+"'>"+opm_escapeHTML(rowdata.displayName)+"</a>"; //No I18N
}

function groupConfigFormatter(cellValue, options, rowdata, action)
{
    if(rowdata[7] != null && rowdata[7] != "") {
        return rowdata[7];
    }
    var conflict = parseInt(rowdata[4]);
    var insync = parseInt(rowdata[5]);
    var notbackedUp = parseInt(rowdata[6]);

    var title = Ember.I18n.t("jsp.commonstr.InSync",this) + " : " + insync + ", " + Ember.I18n.t("webclient.ncm.conflict",this) + " : " + conflict + ", " + Ember.I18n.t("webclient.common.na",this) + " : " + notbackedUp; //No I18N

    var resourceCount = conflict + insync + notbackedUp;
    if(resourceCount == 0) {
        resourceCount = 1;
    }
    var conflictPer = Math.round((conflict * 200) / resourceCount);
    var unchangedPer = Math.round((insync * 200) / resourceCount) ;
    var notbackedupPer = Math.round((notbackedUp * 200) / resourceCount) ;

//    var yellow = "faad5a"; //No I18N
//    var green = "46bb7d"; //No I18N
//    var red = "fa5b5b"; //No I18N

	  var yellow = "ffe102"; //No I18N
	  var green = "00ff00"; //No I18N
	  var red = "f22e07"; //No I18N

    return "<div title=\""+title+"\"><svg height=\"24\"><rect x=\"0\" y=\"10\" height=\"10\" width=\""+unchangedPer+"\" style=\"fill: #"+green+"\"/>"+ //No I18N
        "<rect x=\"" + unchangedPer + "\" y=\"10\" height=\"10\" width=\""+conflictPer+"\" style=\"fill: #"+red+"\"/>" + //No I18N
        "<rect x=\""+(conflictPer+unchangedPer)+"\" y=\"10\" height=\"10\" width=\""+notbackedupPer+"\" style=\"fill: #"+yellow+"\"/></svg></div>"; //No I18N
}

function groupConfigFormatterv2(cellValue, options, rowdata, action)
{
	if(rowdata["CONFLICT_STSTUS"] != null && rowdata["CONFLICT_STSTUS"] != "") { //7
        return rowdata["CONFLICT_STSTUS"];
    }
    var conflict = parseInt(rowdata["ConflictStatus"]); //4
    var insync = parseInt(rowdata["ConflictStatus1"]); //5
    var notbackedUp = parseInt(rowdata["ConflictStatus2"]); //6

    var title = Ember.I18n.t("jsp.commonstr.InSync",this) + " : " + insync + ", " + Ember.I18n.t("webclient.ncm.conflict",this) + " : " + conflict + ", " + Ember.I18n.t("webclient.common.na",this) + " : " + notbackedUp; //No I18N

    var resourceCount = conflict + insync + notbackedUp;
    if(resourceCount == 0) {
        resourceCount = 1;
    }
    var conflictPer = Math.round((conflict * 200) / resourceCount);
    var unchangedPer = Math.round((insync * 200) / resourceCount) ;
    var notbackedupPer = Math.round((notbackedUp * 200) / resourceCount) ;

//    var yellow = "faad5a"; //No I18N
//    var green = "46bb7d"; //No I18N
//    var red = "fa5b5b"; //No I18N

	  var yellow = "ffe102"; //No I18N
	  var green = "00ff00"; //No I18N
	  var red = "f22e07"; //No I18N

    return "<div title=\""+title+"\"><svg height=\"24\"><rect x=\"0\" y=\"10\" height=\"10\" width=\""+unchangedPer+"\" style=\"fill: #"+green+"\"/>"+ //No I18N
        "<rect x=\"" + unchangedPer + "\" y=\"10\" height=\"10\" width=\""+conflictPer+"\" style=\"fill: #"+red+"\"/>" + //No I18N
        "<rect x=\""+(conflictPer+unchangedPer)+"\" y=\"10\" height=\"10\" width=\""+notbackedupPer+"\" style=\"fill: #"+yellow+"\"/></svg></div>"; //No I18N
}

function groupComploianceFormatterv2(cellValue, options, rowdata, action)
{
    if(rowdata["COMPLIANCE_STSTUS"] != null && rowdata["COMPLIANCE_STSTUS"] != "") { //11
        return rowdata["COMPLIANCE_STSTUS"];
    }
    var violant = parseInt(rowdata["ComplianceStatus"]); //8
    var complaint = parseInt(rowdata["ComplianceStatus1"]); //9
    var datanotavailable = parseInt(rowdata["ComplianceStatus2"]); //10
    var resourceCount = violant + complaint + datanotavailable;
    if(resourceCount == 0) {
        resourceCount = 1;
    }
    var violantPer = (violant * 200) / resourceCount ;
    var complaintPer = (complaint * 200) / resourceCount ;
    var datanotavailablePer = (datanotavailable * 200) / resourceCount ;

    var title = Ember.I18n.t("fwa.Compliance.Compliant",this) + " : " + complaint + ", " + Ember.I18n.t("jsp.commonstr.Violation",this) + " : " + violant + ", " + Ember.I18n.t("webclient.common.na",this) + " : " + datanotavailable; //No I18N
//    var yellow = "faad5a"; //No I18N
//    var green = "46bb7d"; //No I18N
//    var red = "fa5b5b"; //No I18N

	  var yellow = "ffe102"; //No I18N
	  var green = "00ff00"; //No I18N
	  var red = "f22e07"; //No I18N

    return "<div title=\""+title+"\"><svg height=\"24\"><rect x=\"0\" y=\"10\" height=\"10\" width=\""+complaintPer+"\" style=\"fill: #"+green+"\"/>"+ //No I18N
        "<rect x=\""+complaintPer+"\" y=\"10\" height=\"10\" width=\""+violantPer+"\" style=\"fill: #"+red+"\"/>" + //No I18N
        "<rect x=\""+(violantPer+complaintPer)+"\" y=\"10\" height=\"10\" width=\""+datanotavailablePer+"\" style=\"fill: #"+yellow+"\"/></svg></div>"; //No I18N
}

function groupComploianceFormatter(cellValue, options, rowdata, action)
{
    if(rowdata[11] != null && rowdata[11] != "") {
        return rowdata[11];
    }
    var violant = parseInt(rowdata[8]);
    var complaint = parseInt(rowdata[9]);
    var datanotavailable = parseInt(rowdata[10]);
    var resourceCount = violant + complaint + datanotavailable;
    if(resourceCount == 0) {
        resourceCount = 1;
    }
    var violantPer = (violant * 200) / resourceCount ;
    var complaintPer = (complaint * 200) / resourceCount ;
    var datanotavailablePer = (datanotavailable * 200) / resourceCount ;

    var title = Ember.I18n.t("fwa.Compliance.Compliant",this) + " : " + complaint + ", " + Ember.I18n.t("jsp.commonstr.Violation",this) + " : " + violant + ", " + Ember.I18n.t("webclient.common.na",this) + " : " + datanotavailable; //No I18N
//    var yellow = "faad5a"; //No I18N
//    var green = "46bb7d"; //No I18N
//    var red = "fa5b5b"; //No I18N

	  var yellow = "ffe102"; //No I18N
	  var green = "00ff00"; //No I18N
	  var red = "f22e07"; //No I18N

    return "<div title=\""+title+"\"><svg height=\"24\"><rect x=\"0\" y=\"10\" height=\"10\" width=\""+complaintPer+"\" style=\"fill: #"+green+"\"/>"+ //No I18N
        "<rect x=\""+complaintPer+"\" y=\"10\" height=\"10\" width=\""+violantPer+"\" style=\"fill: #"+red+"\"/>" + //No I18N
        "<rect x=\""+(violantPer+complaintPer)+"\" y=\"10\" height=\"10\" width=\""+datanotavailablePer+"\" style=\"fill: #"+yellow+"\"/></svg></div>"; //No I18N
}

function deviceGroupDetailsDevicesAction(cellValue, options, rowdata, action) {
	if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
		return "";
	}
	return "<div id='action_" + rowdata[0] + "' class='ncmAction' style='margin-top:-8px'><i title='" + Ember.I18n.t("webclient.action.actions",this) + "' onclick='openActionListForDevice(\"" + rowdata[0] + "\");' class='opm-icon icon-actions'></i></div>";
}

function DGroupGridColumnRenderer(cellValue, options, rowdata, action) {
	var editIcon = "";
	if(rowdata[1] != "All Devices Group" && (rowdata[13] == false || rowdata[13] == 'false')) {
        editIcon = "<i title='" + Ember.I18n.t("webclient.action.edit", this) + "' style='font-size:16px;cursor:pointer;float:left;margin:0 4px !important;' onclick='OPMClient.Inventory.editDeviceGroup(\"" + rowdata[0] + "\", \"" + rowdata[1] + "\")' class='icon-configedit'></i>" // No I18N
    }
	var complianceIcon = "<div id='complianceBtn_" + rowdata[0] + "' class='ncmAction gridOption' style='float:left;position:relative;min-width:22px;'><i style='font-size:16px;margin:0 4px;'></i></div>"; //No I18N
    if(rowdata[2] == 'true' || rowdata[2] == true) {
	    if(!ncmIsProbeOrProbeSelected() || (rowdata[2] == 'true' || rowdata[2] == true)){// showing only for distributed dgs in probe or probe selected scenario
		    complianceIcon = "<div id='complianceBtn_" + rowdata[0] + "' class='ncmAction gridOption' style='float:left;position:relative;'><i title='" + Ember.I18n.t("widget.type.compliance", this) + "' style='font-size:16px;margin:0 4px;' onclick='OPMClient.Inventory.openDeviceGroupOptions(\"" + rowdata[0] + "\", \"" + rowdata[1] + "\")' class='icon-compliance'></i></div>"; //No I18N
	    }
	}
	var pdfIcon = "<div id='reportBtn_" + rowdata[0] + "' class='ncmAction gridOption' style='float:left;position:relative;'><i title='" + Ember.I18n.t("webclient.reports.header", this) + "' style='font-size:16px;margin:0 4px;' onclick='OPMClient.Inventory.openDeviceGroupOptions(\"" + rowdata[0] + "\", \"" + rowdata[1] + "\", \"true\")' class='icon-file-pdf'></i></div>"; //No I18N
	var isCentralWithoutProbe = window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected;
	var scheduleIcon = "";
	// Same gate as the ncmInSchedule funnel: schedule read plus at least one loadable task type.
	if(!isCentralWithoutProbe && ncmCanOpenScheduleAdd()) {
		scheduleIcon = '<i title="'+Ember.I18n.t("webclient.general.Schedule",this)+'" style="font-size:16px;cursor:pointer;float:left;margin:0 4px;" class="icon-scheduleReport" onclick="OPMClient.Inventory.ncmInSchedule(\'Configuration Backup\', \'' + rowdata[0] + '\');"></i>';
	}
	if(isCentralWithoutProbe) {
		complianceIcon = "";
	}
	if(!window.OPM.userPermissions.ncmComplianceWrite) {
		complianceIcon = "";
	}
	if(!window.OPM.userPermissions.reportsRead || (window.OPM.isMSPCentral && window.OPM.isProbeSelected)) {
		pdfIcon = "";
	}
	return complianceIcon + pdfIcon + scheduleIcon + editIcon;
}

function graphWidgetGridColumnFormatter(cellValue, options, rowdata, action) {
	return "<div class='ncmreportLegendBox'><div class='colorBox' style='background:" + rowdata.Color + "'></div><label>" + rowdata.Key + "</label></div>"; //No I18N
}

function intfValuesWithUnits(cellValue, options, rowdata, action) {

    if(rowdata.value !== undefined) {
        return rowdata.value +" ( "+rowdata.unit+" )"; //No I18n
    }
    else {
        return "";
    }
}

function drillDownToCategory(cellValue, options, rowdata, action)
{
    deviceCount = rowdata.associatedDevices;
	if(deviceCount===0 || deviceCount==="0"){ //No I18N
		return "0";//No I18N
	}
	else{
		return "<div style='cursor:pointer;text-decoration:underline;' onclick='opm_loadDeviceListByCategory(\""+opm_escapeHTML(rowdata.categoryName)+"\")'>"+opm_escapeHTML(deviceCount)+"</div>"; //No I18N
	}
}

function opm_customKMGTSort(cell)
{
	if(cell.indexOf("K")>0 || cell.indexOf("Kbps")>0 || cell.indexOf("KBps")>0)//No I18N	
	{
		return parseFloat(cell) * 1024;
	}
	else if(cell.indexOf("M")>0 || cell.indexOf("Mbps")>0 || cell.indexOf("MBps")>0)//No I18N	
	{
		return parseFloat(cell) * 1024 * 1024;
	}
	else if(cell.indexOf("G")>0 || cell.indexOf("Gbps")>0 || cell.indexOf("GBps")>0)//No I18N	
	{
		return parseFloat(cell) * 1024 * 1024* 1024;
	}
	else if(cell.indexOf("T")>0 || cell.indexOf("Tbps")>0 || cell.indexOf("TBps")>0)//No I18N	
	{
		return parseFloat(cell) * 1024 * 1024 * 1024 * 1024;
	}
	else if(cell.indexOf("Bytes")>0 || cell.indexOf("bps")>0 || cell.indexOf("Bps")>0)//No I18N	
	{
		return parseFloat(cell) ;
	}
	else if(cell === "NA") {
		cell = -1;
		return parseFloat(cell);
	}
	else
	{
		return parseFloat(cell);
	}
}

// function attacksAddResource(cellValue, options, rowdata){
// 	var newString = ' <i style="color:red">&nbsp;&nbsp;&nbsp  new</i>'; //NO I18N
// 	if(cellValue.indexOf(newString) == -1){
// 		return htmlEncode(cellValue);
// 	}else{
// 		var temp = cellValue.split(newString);
// 		return htmlEncode(temp[0])+newString;
// 	}
// }

function formatSNMPColumn(cellvalue, options, rowdata) {
	return "<a style='color:#31A5F0;text-decoration:underline' onclick=\"redirectToUpdateSNMPMapping('"+ rowdata[0] + "')\">" + Ember.I18n.t("webclient.admin.adauthentication.update", this) + "</a>"; //No I18N
}
function formatGroupNameColumn(cellValue, options, rowdata)
{
    var cellVal = opm_escapeHTML(cellValue);
    
    if(rowdata.fromCentral == "true") {
            return '<span class="textWithIcon gap-sm"><div class="text">' +  cellVal  + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>';
        }
    return '<span tabindex="0" role="link">'+cellVal+'</span>'; //No I18N
}
function showNotSupportedUsers(cellValue, options, rowdata, action){
    var cellVal = opm_escapeHTML(cellValue);
    if(window.OPM.isOPMStandardEdition && (rowdata.uAuth === "domain" || rowdata.uAuth === "radius") ){
        return "<div tabindex='0' role='button'>"+ cellVal +" <span style='color:red'>["+Ember.I18n.t('webclient.fwa.not.supported',this)+"]</span></div>";//No I18N
    }
    else{
        if(rowdata.isCentralUser) {
            return '<span class="textWithIcon gap-sm"><div class="text" tabindex="0" role="button">' + cellVal + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>';
        }
        if (rowdata.superadmin) {
            OPMClient.ApplicationController.set('superadminuser',cellValue);//No I18N
            return '<span class="textWithIcon"><div class="text" tabindex="0" role="button">' + cellVal + '</div><em class="svgIcon size16 waiting-color"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#crown"></use></svg></em></span>';
        }
        return "<span tabindex='0' role='button'>" + cellVal + "</span>";
    }
}
function opm_wlcApsStatus(cellvalue, options, rowdata)
{
    if(rowdata.advanceMonitoringEnabled === "false"){
        return  "<i class='icon-unmanaged18x18'><span style='float:left;padding-left:25px;white-space: nowrap;'>"+Ember.I18n.t('webclient.devices.details.NotMonitored',this)+"</span></i>" ; //No I18N
    }else{
        if(cellvalue === "5")
        {
            return  "<i class='icon-status13'><span style='float:left;padding-left:25px;'>"+Ember.I18n.t('webclient.devices.intftypes.up',this)+"</span></i>" ; //No I18N
        }
        else if(cellvalue === "7")
        {
            return  "<i class='icon-unmanaged18x18'><span style='float:left;padding-left:25px;white-space: nowrap;'>"+Ember.I18n.t('webclient.topo.addnetwork.unmanagenet',this)+"</span></i>" ; //No I18N
        }
        else{
            return  "<i class='icon-status14'><span style='float:left;padding-left:25px;'>"+Ember.I18n.t('webclient.devices.intftypes.down',this)+"</span></i>" ; //No I18N
        }
    }
}



function opm_wfDesc(cellValue, options, rowdata, action)
{
	var wfDesc = (cellValue.length > 60) ? cellValue.substring(0,60)+" <a class='opm_link' data-title='"+cellValue+"' onclick=\"opm_wfDescMore(this,'"+options.rowId+"')\">"+Ember.I18n.t('fwa.compliance.NeedMore',this)+"</a>":cellValue; //No I18N
	return "<span title='"+cellValue+"' id='cell"+options.rowId+"'>"+wfDesc+"</span>"; //No I18N
}

function opm_wfDescMore(tis,rowId) {
	var title = $(tis).data('title'); //No I18N
	$("#cell"+rowId).text(title); //No I18N
}

function nfa_deviceNameWithIP(cellValue, options, rowdata){
    var loadingMessage = ""; //NO I18N
    if(OPMClient.SettingsNFAConfigController.qosNbarLoadingDevices.contains(rowdata.RouterID.toString())){
        loadingMessage = "<span class='policyLoading'>"+Ember.I18n.t("fwa.compliance.loading", this)+"</span>"; //NO I18N
    }
    return htmlEncode(cellValue)+" ("+htmlEncode(rowdata.RouterIP)+")"+loadingMessage; //NO I18N
}

function nfa_qosStatusFormatter(cellValue, options, rowdata){
    var text = "";
    var className = "";
    switch(cellValue){
        case 0: text = Ember.I18n.t("nfa.cbqos.available", this); className = "available"; //NO I18N
                break;
        case 1: text = Ember.I18n.t("nfa.cbqos.unavailable", this); className = "unAvailable"; //NO I18N
                break;
        case 2: text = Ember.I18n.t("nfa.cbqos.unknown", this); className = "unknown"; //NO I18N
                if(window.OPM.currentView.name.indexOf("Settings.NetflowConfig") != -1){
                    text += "</span><span class='snmpedit pointer' onclick='nfa_associateSNMP(\""+htmlEncode(rowdata.RouterIP)+"\", \""+htmlEncode(rowdata.RouterDispName)+"\", \"CBQoS\")' title='"+Ember.I18n.t("nfa.nbarCbqos.associateSNMP", this)+"'>"; //NO I18N
                }
                break;
    }
    return "<span class='"+className+"'>"+text+"</span>";
}

function nfa_nbarStatusFormatter(cellValue, options, rowdata){
    var text = "";
    var className = "";
    switch(cellValue){
        case "Yes"      :   text = Ember.I18n.t("nfa.nbar.supported", this); className = "available"; //NO I18N
                            break;
        case "No"       :   text = Ember.I18n.t("nfa.nbar.notSupported", this); className = "unAvailable"; //NO I18N
                            break;
        case "Unknown"  :   text = Ember.I18n.t("nfa.nbar.unknown", this); className = "unknown"; //NO I18N
                            if(window.OPM.currentView.name.indexOf("Settings.NetflowConfig") != -1){
                                text += "</span><span class='snmpedit pointer' onclick='nfa_associateSNMP(\""+htmlEncode(rowdata.RouterIP)+"\", \""+htmlEncode(rowdata.RouterDispName)+"\", \"NBAR\")' title='"+Ember.I18n.t("nfa.nbarCbqos.associateSNMP", this)+"'>"; //NO I18N
                            }
                            break;
    }
    return "<span class='"+className+"'>"+text+"</span>";
}

function nfa_countBoxFormatter(cellValue, options, rowdata){
    return "<span class='count'>"+htmlEncode(cellValue)+"</span>"; //NO I18N
}

function deleteIntfDiscDeviceIntfCriteriaIcon(cellValue, options, rowdata, action){
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteIntfDiscDeviceIntfCriteria(&#39;"+options.rowId+"&#39,&#39;"+options.gid+"&#39);'></i>";
}
function deleteIntfDiscDeviceIntfCriteria(rowId,gridID)
{
    $('#'+gridID).jqGrid('delRowData',rowId); //No I18n
    if($("#"+gridID).jqGrid('getDataIDs').length === 0)
    {
        $("#IntfDisc_"+gridID).hide();
        $("."+gridID+"_LogicOper").hide();
    }
}

function removeIgnoredDevice(cellValue, options, rowdata){
    var ignotes = (rowdata.notes !== "" ? escape(rowdata.notes) : "");
     return "<i class='discEditIcon discIcon' title='"+Ember.I18n.t('webclient.discovery.edit.notes',this)+"'  onclick='opm_ndEditIgnoreDevNotes(\""+rowdata.ipAddress+"\",\""+ignotes+"\")' role='button' tabindex='0'></i><i class='discIcon discDeleteIcon cursorPointer' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='ndRmvIgnoredDevices(\""+rowdata.name+"\",true);' role='button' tabindex='0'></i>"; //No I18n 

    /*return "<div class='show_ndActions'><i class='cursorPointer textRed' onclick='ndRmvIgnoredDevices(\""+escape(rowdata.name)+"\",true)'>"+Ember.I18n.t('webclient.map.flash.remove',this)+"</i></div>"; //NO I18N*/
}

function ndFilterActions(cellValue, options, rowdata){
    return "<i class='icon-trash cursorPointer' onclick='ndDeleteFilter(\""+options.gid+"\",\""+options.rowId+"\",true);'></i>"; //NO I18N
}
function ndDeleteFilter(elm,rowId,isconfm)
{
    if(isconfm == true)
    {
        if(confirm(Ember.I18n.t('webclient.delete.confirmation',this))){//No I18N
            $('#'+elm).jqGrid('delRowData',rowId);
            var rowlen = $('#'+elm).jqGrid('getRowData').length;
            if(rowlen === 0)
            {
                $("#opm_ndFilterContainer").hide();
            }
            OPMClient.NetworkDiscoveryController.set("filterAction",true);//No I18N
        }
    }
    else
    {
        $('#'+elm).jqGrid('delRowData',rowId);
        var rowlen = $('#'+elm).jqGrid('getRowData').length;
        var li_id = (elm).split("_")[1];
        if(li_id !== undefined)
        {
          $(".accordion1 ul li[data-vendorid='"+li_id+"'] .deviceCount").text(rowlen);
        }
    }
}

function ndImportActions(cellValue, options, rowdata){
    if(options.gid !== "nwd_existingDev")
    {
        rowdata.name = opm_escapeHTML(rowdata.name);
        if(OPMClient.NetworkDiscoveryController.pageName === "Unapproved")
        {
            var data = {deviceList:rowdata.name};
        }
        else{
            var data = {deviceList:rowdata.name,profileId:rowdata.profileId};
        }
        return "<div class='show_ndActions'><i class='cursorPointer textGreen' onclick='opm_ndImportDevActions("+JSON.stringify(data)+",\"approve\",1);ndDeleteFilter(\""+options.gid+"\",\""+options.rowId+"\");'>"+Ember.I18n.t('webclient.discovery.action.approve',this)+"</i><i class='cursorPointer textRed' onclick='opm_ndImportDevActions("+JSON.stringify(data)+",\"ignore\",1);ndDeleteFilter(\""+options.gid+"\",\""+options.rowId+"\");'>"+Ember.I18n.t('webclient.common.ignore',this)+"</i></div>"; //NO I18N
    }
    else
    {
        return "";
    }
}

function ndReportActions(cellValue, options, rowdata){

    var statusStr = "-";
    rowdata.deviceName = opm_escapeHTML(rowdata.deviceName);
    rowdata.ipAddress = opm_escapeHTML(rowdata.ipAddress);
    if(rowdata.action == "UN_APPROVED")
    {
        var data = {deviceList:(rowdata.deviceName !== undefined ? rowdata.deviceName : rowdata.ipAddress)}
        statusStr = "<i class='cursorPointer textGreen' onclick='opm_ndImportDevActions("+JSON.stringify(data)+",\"approve\",1);opm_ndUpdateCellValue("+JSON.stringify(options)+");'>"+Ember.I18n.t('webclient.discovery.action.approve',this)+"</i>";

    }else if((rowdata.action == "ADD" || rowdata.action == "UPDATE" || rowdata.action == "APPROVED") && rowdata.isManaged === "false")
    {
        statusStr = "<i class='textLink' onclick='opm_setManageDevice(\"true\",\""+rowdata.deviceName+"\");'>"+Ember.I18n.t('webclient.inventory.manage',this)+"</i>";
    }
    return statusStr; //NO I18N
}

function ndEditProfile(cellValue, options, rowdata, action){
    if(window.OPM.isNCM || window.OPM.isNFA) {
        return "<div style='cursor:pointer;' onclick='opm_ndEditProfile(this)' data-profileName='"+cellValue+"' data-profileID='"+rowdata.profileId+"' data-href='"+window.OPM.apiclientUrl+"Settings/Discovery/NCMDiscoveryWizard' tabindex='0' role='link'>"+cellValue+"</div>";//No I18N
    } else {
        if(rowdata.discoveryStatus !== "true" && window.OPM.userPermissions.discoveryWrite)
        {
            return "<div style='cursor:pointer;' onclick='opm_ndEditProfile(\""+opm_escapeHTML(cellValue)+"\",\""+opm_escapeHTML(rowdata.profileId)+"\",\""+opm_escapeHTML(rowdata.discoveryType)+"\")' tabindex='0' role='link'>"+escapeHTML(cellValue)+"</div>";//No I18N
        }
        else
        {
            return escapeHTML(cellValue);
        }
    }
}
function opm_ndEditProfile(name,id,type)
{
    OPMClient.NetworkDiscoveryController.set("operation","Edit");//No I18N
    OPMClient.NetworkDiscoveryController.set("profileName",name);//No I18N
    OPMClient.NetworkDiscoveryController.set("profileId",id);//No I18N
    if(type === "ExistingDevices")
    {
        OPMClient.NetworkDiscoveryController.set("isExisting",true);//No I18N
    }
    opm_transitionToParentRoute("Settings.Network.ShallowDiscovery","Edit");//No I18N
}


function setGroupAvailBgr(cellValue, options, rowdata, action)
{
    var availability = opm_escapeHTML(rowdata.availability);
    if(availability !== undefined && availability === "NA")
    {
        return availability;
    }
    else
    {
        availability  = parseFloat(availability);
    return '<div class="severity-container"><div><div class="utrow severity_5" data-value="'+availability+'" style="width: '+availability+'%;"></div></div><span>'+availability+'%</span></div>';//No I18n
    }
}


function setGroupmemAvailBgr(cellValue, options, rowdata, action)
{
    var memberAvailability = opm_escapeHTML(rowdata.memberAvailability);
    if(memberAvailability !== undefined && memberAvailability === "NA")
    {
        return memberAvailability;
    }
    else
    {
        memberAvailability  = parseFloat(memberAvailability);
        return '<div class="severity-container"><div><div class="utrow severity_5" data-value="'+memberAvailability+'" style="width: '+memberAvailability+'%;"></div></div><span>'+memberAvailability+'%</span></div>';//No I18n
    }
}

function ncmeeCentralUserFormatter(cellValue, options, rowdata, action) {
//	if(cellValue != null && cellValue != undefined && cellValue.endsWith("_noc")) {
//		cellValue = cellValue.replace("_noc", "");
//	}
	return (cellValue === null || cellValue === undefined) ? "" : opm_escapeHTML(String(cellValue));
}

function businessHourRuleDelete(cellValue, options, rowdata, action){
    if(window.OPM.userPermissions.reportsWrite) {
    return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete' onclick='OPMClient.Reports.deleteBusinessRules(&#39;"+rowdata.ruleID+"&#39;);' tabindex='0' role='button' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"'></i>";//No I18n
    }
}

function nfa_invReportDetailIcon(cellValue, options, rowData, action){
    return "<img class='pointer' title='"+Ember.I18n.t("nfa.violation.report")+"' src='/apiclient/fluidicv2/img/graph_enable.png'/>"; //NO I18N
}
function nxSeverityColorIcon(cellValue, options, rowdata, action)
{
    if(rowdata.statusStr != undefined){
        var stateNum = parseInt(rowdata.state);
        if (window.OPM.isNewStatusPropagation && rowdata.state != undefined && rowdata.state !== "" && !isNaN(stateNum)) {
            return "<em class='--fault-severity icon-status --dual-status status-"+opm_escapeHTML(rowdata.statusNum)+" "+opm_getStateCls(stateNum)+"'></em> "+opm_escapeHTML(rowdata.statusStr);//No I18N
        }
        return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.statusNum)+"'></i> "+opm_escapeHTML(rowdata.statusStr);//No I18N
    }else{
        var title = Ember.I18n.t('webclient.Vmware.notMonitored.reasonTitle',this); //No I18N
        var reason1 =Ember.I18n.t('webclient.Vmware.notMonitored.reasonOne',this); //No I18N
        var reason2 =Ember.I18n.t('webclient.nutanix.notMonitored.reasonTwo',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+ reason1+ "'data-content2='"+reason2+"'></a>";//No I18N
        info = rowdata.SELECTIONSTATE == 1 ? info : '' ;
        return '<span style="color: #888888;">'+Ember.I18n.t("webclient.not.monitored",this)+'</span>'+ info ;//No I18N
    }
}
function vmwareSeverityColorIcon(cellValue, options, rowdata, action)
{
    if(rowdata.STATUS != undefined){
        var stateNum = parseInt(rowdata.state);
        if(window.OPM.isNewStatusPropagation && rowdata.state != undefined && rowdata.state !== "" && !isNaN(stateNum)){
            return "<em class='--fault-severity icon-status --dual-status status-"+opm_escapeHTML(rowdata.STATUS)+" "+opm_getStateCls(stateNum)+"'></em> "+opm_escapeHTML(rowdata.STATUS_STR || "");//No I18N
        }
        return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.STATUS)+"'></i> "+opm_escapeHTML(rowdata.STATUS_STR || "");//No I18N
    }else{
        return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowdata.STATUS)+"'></i> "+opm_escapeHTML(rowdata.STATUS_STR || "");//No I18N
    }
}
function opm_showNxHostMonitor(cellValue,options,rowdata,action)
{
    var virtualType = "Nutanix-Host"; //No I18N
    var entityId =-1;
    if(rowdata.HOST_ID != undefined){
        entityId =  opm_escapeHTML(rowdata.HOST_ID);
    }
    else{
        virtualType = "Nutanix-VM"; //No I18N
        entityId = opm_escapeHTML(rowdata.VM_ID);
    }
    OPMClient.InventoryDeviceDetailsController.set("vmGridID",$(this).closest(".content").attr("data-index"));//No I18N
    var toRet = ""; //No I18N
    if(rowdata.statusStr != undefined)//No I18N
    {
        if(!window.OPM.isCentralServer)
        {
            var isDisabled = !window.OPM.userPermissions.discoveryWrite;
            var classes = isDisabled ? "vmAction disabledBlock" : "vmAction"; // No I18N
            var title = isDisabled ? Ember.I18n.t('webclient.device.usernotauthorized',this) : Ember.I18n.t('webclient.virtual.stopmonitoring',this) // No I18N
            toRet = "<div title='"+title+"'><div class='"+classes+"' onclick = 'opm_stopMonitoring(\""+entityId+"\",\""+virtualType+"\",this)'><i class='icon-stop pointer' ></i><span class='opm_link'>"+Ember.I18n.t("webclient.common.stop")+"</span></div></div>";//No I18N
        }
        return toRet;
    }
    else
    {
        if(!window.OPM.isCentralServer)
        {
            var isDisabled = !window.OPM.userPermissions.discoveryWrite;
            var classes = isDisabled ? "vmAction disabledBlock" : "vmAction"; // No I18N
            var title = isDisabled ? Ember.I18n.t('webclient.device.usernotauthorized',this) : Ember.I18n.t('webclient.nwm.startmonitoring',this) // No I18N
            return "<div title='"+title+"'><div class='"+classes+"'  onclick = 'opm_startMonitoring(\""+opm_escapeHTML(rowdata.DISPLAYNAME)+"\",\""+entityId+"\",\""+entityId+"\",\""+virtualType+"\",this)'><i class='icon-start pointer' ></i><span class='opm_link'>"+Ember.I18n.t("webclient.admin.appsms.start")+"</span></div></div>";//No I18N
        }
        return toRet;
    }
}

function opm_ClusterIpFormatter(cellValue, options, rowdata, action)
{
    if(cellValue) {
        return cellValue;
    }

    var virtualType = "Nutanix-Cluster"; //No I18N
    var entityId = rowdata.CLUSTER_ID != undefined ? opm_escapeHTML(rowdata.CLUSTER_ID) : -1;
    var isDisabled = !window.OPM.userPermissions.discoveryWrite;
    var classes = isDisabled ? "vmAction disabledBlock" : "vmAction"; // No I18N
    var title = isDisabled ? Ember.I18n.t('webclient.device.usernotauthorized',this) : Ember.I18n.t('webclient.nwm.startmonitoring',this) // No I18N
    return "<div title='"+title+"'><div class='"+classes+"'  onclick = 'opm_startMonitoring(\""+opm_escapeHTML(rowdata.DISPLAYNAME)+"\",\""+entityId+"\",\""+entityId+"\",\""+virtualType+"\",this)'><i class='icon-start pointer' ></i><span class='opm_link'>"+Ember.I18n.t("webclient.admin.appsms.start")+"</span></div></div>";//No I18N

}

// NCM firmware vulnerability formatter starts here
function firmwareVulnerabilityDeviceToSnapshotFomatter(cellValue, options, rowdata, action)
{
//	var map = OPMClient.NCMFirmwareVulnerability.ResourceIDMap;
	// if(!setNCMEEProbeVars(map.get(cellValue))){
	// 	return cellValue;
	// }
	if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.ncmRestricted || window.OPM.userPermissions.operatorAccess) {
        return '<a onclick="redirectToMSPSnapshot('+rowdata.resourceID+')"><i></i>&nbsp;'+escapeHTML(cellValue)+'</a>'; // No I18N
	} else {
		return escapeHTML(cellValue);
	}
}

function redirectToMSPSnapshot(selDevice){
    if(!setNCMEEProbeVars(selDevice)){
        return;
    }
    redirectToSnapshot("ConfigDevice",selDevice); //No I18N
}

function firmVulDeviceSnapshotRoute(cellValue, options, rowdata, action) {
	if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.ncmRestricted || window.OPM.userPermissions.operatorAccess) {
//		return '<a href="'+window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+rowdata[0]+'" ><i></i>&nbsp;'+escapeHTML(cellValue)+'</a>'; // No I18N
		return '<a onclick="redirectToMSPSnapshot('+rowdata[0]+')"><i></i>&nbsp;'+escapeHTML(cellValue)+'</a>'; // No I18N
	} else {
		return cellValue;
	}
}
function fvDeviceSnapshotRoute(cellValue, options, rowdata, action) {
	if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.ncmRestricted || window.OPM.userPermissions.operatorAccess) {
		return '<a onclick="redirectToMSPSnapshot('+rowdata['id']+')"><i></i>&nbsp;'+escapeHTML(cellValue)+'</a>'; // No I18N
	} else {
		return escapeHTML(cellValue);
	}
}

function firmwareVulnerabilityCveIdFormatter(cellValue, options, rowdata, action)
{
    if(OPMClient.ApplicationController.isNCM === true)
    {
        return '<a href="'+window.OPM.apiclientUrl+'NCMFirmwareVulnerability/ListAll/cveId/'+cellValue+'"><i></i>&nbsp;'+cellValue+'</a>'; // No I18N
    }
    else
    {
        var val = "'"+cellValue+"'";
        return '<a onclick="opmRedirectToCveDetSlide('+val+')"><i></i>&nbsp;'+cellValue+'</a>'; // No I18N

    }
}


function firmVulnCveDetSlide(cellValue) {
    var val = "'"+cellValue+"'";//No I18N
    if(!window.OPM.isNCM && OPMClient.ReportsDetailsController.isFirmVulReport && !(location.href.includes('FirmwareVulnerabilityCveReport') || location.href.includes('FirmwareVulnerabilityDeviceReport') || location.href.includes('FirmwareVulnerabilityVersionReport'))){ // No I18N
        return '<a onclick="opmDashRedirectToCveDetSlide('+val+')"><i></i>&nbsp;'+cellValue+'</a>'; // No I18N
    }
    return '<a onclick="updateCveDetSlide('+val+')"><i></i>&nbsp;'+cellValue+'</a>'; // No I18N
}

function firmVulnPatchFormatterForCve(patchId, options, rowData, action) {
    OPMClient.NCMFirmwareVulnerabilityPatchDetailsController.patchDetails[patchId] = {"vendor":rowData.vendor,"osType":rowData.product,"version":rowData.PATCH,"cveId":rowData.CVEID};//No I18N
    return '<a onclick="redirectToPatchIdPatchDetails('+rowData.rsId+","+patchId+')">'+Ember.I18n.t('webclient.ncm.firmvuln.patch.viewPatches',this)+'</a>'; // No I18N
}

function redirectToPatchIdPatchDetails(rsId, patchId) {
    $('#vulnPage').hide();//No I18N
    $('#firmVulnPatchesCnt').show();//No I18N
    $('.tree-view__patch-loading').css('display', 'flex'); //No I18N
    OPMClient.NcmFirmVulnPatchTreeComponent.isValidPatchRender = true;
    if(OPMClient.ApplicationController.isNCM === true)
    {
        location.href = window.OPM.apiclientUrl+'NCMFirmwareVulnerability/Patches/RsId/'+rsId+'/PatchId/'+patchId; // No I18N
    }
    else{
        location.href = window.OPM.apiclientUrl+'Inventory/List/ConfigMgmt/FirmwareVulnerability/Patches/RsId/'+rsId+'/PatchId/'+patchId; // No I18N
    }
}

function firmVulnPatchFormatterForRsId(rsId, options, rowData, action) {
    return '<a onclick="redirectToRsIdPatchDetails('+rsId+')">'+Ember.I18n.t('webclient.ncm.firmvuln.patch.viewPatches',this)+'</a>'; // No I18N
}

function redirectToRsIdPatchDetails(rsId) {
    $('#vulnPage').hide();//No I18N
    $('#firmVulnPatchesCnt').show();//No I18N
    $('.tree-view__patch-loading').css('display', 'flex'); //No I18N
    OPMClient.NcmFirmVulnPatchTreeComponent.isValidPatchRender = true;
    if(OPMClient.ApplicationController.isNCM === true)
    {
        location.href = window.OPM.apiclientUrl+'NCMFirmwareVulnerability/Patches/RsId/'+rsId; // No I18N
    }
    else{
        location.href = window.OPM.apiclientUrl+'Inventory/List/ConfigMgmt/FirmwareVulnerability/Patches/RsId/'+rsId; // No I18N
    }
}

function updateCveDetSlide(cveId) {
    OPMClient.NCMFirmwareVulnerability.cveIdForDetails = cveId;//No I18N
    if(window.OPM.isNCM || location.href.includes('FirmwareVulnerabilityCveReport') || location.href.includes('FirmwareVulnerabilityDeviceReport') || location.href.includes('FirmwareVulnerabilityVersionReport')) // No I18N
    {
        if(OPMClient.ReportsDetailsController.isFirmVulReport === true){
            $('#reportTimeFilterSlide').attr('style','display:none');//No I18N
            $('#firmwareVulSlideContainer').attr('style','display:block');//No I18N
            slideIn(1);
        }
        else{
            deviceSlideIn(4);
        }
    }
    else{
        deviceSlideIn(10);
        $(".deviceSlideDivIn-10 #deviceSnapshotMoreHeader").text(cveId);//No I18N
    }
    OPMClient.NCMFirmwareVulnerability.getCveSlideDetailsForSearchTool();

}

function opmDashRedirectToCveDetSlide(cellVal) {
    OPMClient.NCMFirmwareVulnerability.cveIdForDetails=cellVal;
	if(!window.OPM.userPermissions.ncmFirmwareVulnerabilityRead) {
		return;
	}
    location.href = window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/FirmwareVulnerability"; //No I18N
    var checkAndLoad = function(){
        var elementLoaded = false;
        elementLoaded = document.getElementById("allVulnDet"); //No I18N
        if(elementLoaded){
            deviceSlideIn(9);
            OPMClient.NCMFirmwareVulnerability.updateCveDetailsForCveId();
            $('#backButCveDetPage').attr('onclick','window.history.back()'); //No I18N
            return true;
        }
        return false;
    }
     setTimeout(function repeat() {
        if(checkAndLoad()){
            return;
        }
        setTimeout(repeat, 100);
    }, 2000);
}



function opmRedirectToCveDetSlide(cellVal) {
    location.href = window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/FirmwareVulnerability"; //No I18N
    OPMClient.NCMFirmwareVulnerability.cveIdForDetails = cellVal;//No I18N
    deviceSlideIn(9);
    setTimeout(function () {
        OPMClient.NCMFirmwareVulnerability.updateCveDetailsForCveId();
        $('#backButCveDetPage').attr('onclick','deviceSlideOut(9);'); //No I18N
    },50);
}

function firmwareVulnerabilityStateFormatter(cellValue, options, rowdata, action) {
    var val = "";
    var iUrl = "";
    var vulid = rowdata[0];
    if(vulid === undefined)
    {
        vulid = rowdata.vulid;
    }
    if($('#stateValInGridView_'+vulid).text() === null)//No I18N
    {
        $('#stateValInGridView_'+vulid).text(cellValue);//No I18N
    }
    var map = OPMClient.NCMFirmwareVulnerability.getImgAndValForFVState(cellValue);
    var imgUrl = map.img;
    var newVal = map.val;
    val = val + '<div class="commentToggle"> <div class="edit" id="commentEdit_'+vulid+'"><div class="selBox" style="width: 180px;"><div>' + //No I18N
        '<select class="select2 select2-hidden-accessible" name="FirmwareVulnerabilityStateSpan" id="firmwareVulnerabilityStateSpanVal'+vulid+'" tabindex="-1" aria-hidden="true" style="width: 100px;">\n' + //No I18N
        '   <option value="Reported" title="'+Ember.I18n.t('webclient.ncm.firmwarevulnerability.state_reported', this)+'">'+Ember.I18n.t('ncm.firmvuln.Reported', this)+'</option>'+//No I18N
        '   <option value="Confirmed" title="'+Ember.I18n.t('webclient.ncm.firmwarevulnerability.state_confirmed', this)+'">'+Ember.I18n.t('ncm.firmvuln.Confirmed', this)+'</option>'+//No I18N
        '   <option value="Resolution planned" title="'+Ember.I18n.t('webclient.ncm.firmwarevulnerability.state_resolution_planned', this)+'">'+Ember.I18n.t('ncm.firmvuln.Resolution_planned', this)+'</option>'+//No I18N
        '   <option value="Resolved" title="'+Ember.I18n.t('webclient.ncm.firmwarevulnerability.state_resolved', this)+'">'+Ember.I18n.t('ncm.firmvuln.Resolved', this)+'</option>'+//No I18N
        '   <option value="Not applicable" title="'+Ember.I18n.t('webclient.ncm.firmwarevulnerability.state_not_applicable', this)+'">'+Ember.I18n.t('ncm.firmvuln.Not_applicable', this)+'</option>'+//No I18N
        '</select></div></div>';

    if(window.OPM.userPermissions.ncmFirmwareVulnerabilityWrite) {
    	val = val + '<i title="'+Ember.I18n.t('webclient.button.save',this)+'" onclick="OPMClient.NCMFirmwareVulnerability.saveStateValInGrid('+vulid+')"></i>'; //No I18N
    }

    val = val + '</div> <div class="view active" id="commentView_'+vulid+'"><span id="stateValInGridView_'+vulid+'" style="width: 180px;">'+'<img src="'+imgUrl+'"style="vertical-align:middle;margin: -4px 5px 0 0;">&nbsp;'+newVal+'</span>'; //No I18N

    if(window.OPM.userPermissions.ncmFirmwareVulnerabilityWrite) {
    	val = val + '<i class="hideInCentral" title="'+Ember.I18n.t('webclient.action.edit',this)+'" onclick="OPMClient.NCMFirmwareVulnerability.editStateValInGrid('+vulid+",'"+cellValue+ "'"+')"></i>'; //No I18N
    }

    val = val + '</div> </div>';//No I18N

    $('#stateValInGridView_'+vulid).val(cellValue);//No I18N
    return val; // No I18N
}
function stateValFormatterFirmwareVul(value)
{
    var map = OPMClient.NCMFirmwareVulnerability.getImgAndValForFVState(value);
    var imgUrl = map.img;
    var newVal = map.val;
    return '<img src="'+imgUrl+'"style="vertical-align:middle;margin: -4px 5px 0 0;">&nbsp;'+newVal+'';//No I18N
}
function firmwareVulnerabilitySeverityFormatter(cellValue,formatType) {
    var iUrl = "";
    var val = "";
    if(cellValue === 4 || cellValue === 'Critical')
    {
        iUrl = "icon-status1";//No I18N
        val = Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical', this);//No I18N
    }
    else if(cellValue === 3 || cellValue === 'Important')
    {
        iUrl = "icon-status2";//No I18N
        val = Ember.I18n.t('webclient.ncm.firmwarevulnerability.Important', this);//No I18N
    }
    else if(cellValue === 2 || cellValue === 'Moderate')
    {
        iUrl = "icon-status3";//No I18N
        val = Ember.I18n.t('webclient.ncm.firmwarevulnerability.Moderate', this);//No I18N
    }
    else if(cellValue === 1 || cellValue === 'Low')
    {
        iUrl = "icon-status4";//No I18N
        val = Ember.I18n.t('webclient.ncm.tab.Low', this);//No I18N
    }
    else if(cellValue === 0 || cellValue === 'Unrated')
    {
        iUrl = "icon-status6";//No I18N
        val = Ember.I18n.t('webclient.ncm.firmwarevulnerability.Unrated', this);//No I18N
    }
    if(formatType === 'I18N'){
        return val;
    }
    return '<i class="'+iUrl+'"></i>&nbsp;'+val; // No I18N
}


function firmwareVulnerabilityUrlFormatter(cellValue, options, rowdata, action)
{
    var urlList = cellValue;
    if(urlList === null || urlList.length == 0)
    {
        return Ember.I18n.t('webclient.general.notavailable', this);//No I18N
    }
    var size = urlList.length;
    var urls = [];
    if(size > 0)
    {
        urls.push("<a class = \"opm_link\" href='"+urlList[0]+"' target='_blank'>"+urlList[0]+"</a>");
    }
    for(var i = 1; i < size; i++)
    {
        urls.push("<br>"+"<a  class = \"opm_link\" href='"+urlList[i]+"' target='_blank'>"+urlList[i]+"</a>");
    }

    return urls;
}

function firmwareVulnerabilityUrlCveDetFormatter(cellValue, options, rowdata, action)
{
    var urlList = cellValue;
    if(urlList === null || urlList.length == 0)
    {
        return Ember.I18n.t('webclient.general.notavailable', this);//No I18N
    }
    var size = urlList.length;
    var urls = '';
    for(var i = 0; i < size; i++)
    {
        urls = urls + '<li><a  class ="opm_link" href="'+urlList[i]+'" target="_blank">'+urlList[i]+'</a></li>';//No I18N
    }

    return urls;
}

function FirmVulnupdateDbResultFormatter(value) {
    var imgUrl = "icon-status2";//No I18N
    var newVal = "";
    if(value === 'SUCCESS') {//No I18N
        imgUrl = "icon-status5";//No I18N
        newVal = Ember.I18n.t('webclient.vimonitor.credential.success', this);//No I18N
    } else  if(value === 'FAILURE') {//No I18N
        imgUrl = "icon-status1";//No I18N
        newVal = Ember.I18n.t('ncm.config.backup.failed', this);//No I18N
    } else if(value === 'INPROGRESS') { //No I18N
        $('#spinUpdateFV').show();//No I18N
        $('#fvHelpCard').hide();//No I18N
        $('#lastUpdateTime').text(Ember.I18n.t('webclient.ncm.tab.vulnerability_db_update_inprogress', this));//No I18N
        return "--";//No I18N
    }
    if(value !== 'INPROGRESS'){
        $('#syncVulnData').removeClass('btn-disabled');//No I18N
        $('#importVulnData').removeClass('btn-disabled');//No I18N
        $('#syncVulnData').removeAttr('style');//No I18N
        $('#importVulnData').removeAttr('style');//No I18N
    }
    return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + newVal;//No I18N
}

function tftpFilesFormatter(val, options, rowdata, action)
{
	if(window.OPM.isMSPCentral || (window.OPM.isValidEEInstallation && window.OPM.isCentralServer &&  !window.OPM.isProbeSelected)) {
        return "";
   	}
	var rowID = rowdata.id;
   	return "<div><span style='cursor:pointer' onclick='downloadTFTPFile(&#39;"+rowID+"&#39;);'><u>"+Ember.I18n.t('webclient.billing.download',this)+"</u></span></div>";//No I18N;
}

function firmVulnAffectedProductsFormatter(val, options, rowdata, action)
{
    var cveId = rowdata.CVEID;
    var subStr = "";
    if(val.length >= 200)
    {
        subStr = val.substr(0, 200);
    }
    else
    {
        return val;
    }
    val = '"'+val+'"';//No I18N
    val = val + ',';//No I18N
    val = val + '"'+cveId+'"';//No I18N
    var toRet = "<div id='moreIconFV"+cveId+"'>"+subStr+' '+"<span class='opm_link' id='moreIcon' onclick='replaceAffectedProductsDetMore("+val+");' >"+Ember.I18n.t('fwa.compliance.NeedMore',this)+"</span></div>";//No I18N;
    return toRet;
}
function replaceAffectedProductsDetMore(val, cveId) {
    var newVal = '"' + val + '"';//No I18N
    newVal = newVal + ',';
    newVal = newVal + '"'+cveId+'"';//No I18N
    var div = "<div id='moreIconFV"+cveId+"'>"+val+' '+"<span class='opm_link' id='moreIcon' onclick='replaceAffectedProductsDetLess("+newVal+");' >"+"show less"+"</span></div>";//No I18N
    $('#moreIconFV'+cveId).replaceWith(div);
}
function replaceAffectedProductsDetLess(val, cveId) {
    var subStr = val.substr(0, 200);
    val = '"' + val + '"';//No I18N
    val = val + ',';
    val = val + '"'+cveId+'"';//No I18N
    var div = "<div id='moreIconFV"+cveId+"'>"+subStr+' '+"<span class='opm_link' id='moreIcon' onclick='replaceAffectedProductsDetMore("+val+");' >"+Ember.I18n.t('fwa.compliance.NeedMore',this)+"</span></div>";//No I18N
    $('#moreIconFV'+cveId).replaceWith(div);//No I18N
}
function firmVulDeviceReportFormatter(cellValue, options, rowdata, action) {
    return "<div class='ncmreportLegendBox'><div class='colorBox' style='background:" + rowdata.Color + "'></div><label>" + rowdata.Key + "</label></div>"; //No I18N
}

function firmVulCriticalSevFormatter(cellValue) {
    var iUrl = "icon-status1";//No I18N
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}
function firmVulImportantSevFormatter(cellValue) {
    var iUrl = "icon-status2";//No I18N
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}
function firmVulModerateSevFormatter(cellValue) {
    var iUrl = "icon-status3";//No I18N
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}
function firmVulLowSevFormatter(cellValue) {
    var iUrl = "icon-status4";//No I18N
    return '<i class="'+iUrl+'"></i>&nbsp;'+cellValue; // No I18N
}
function exploitStatusFomatter(cellValue) {

    if(cellValue === true)
    {
        return "<span style='color: red' title="+Ember.I18n.t('webclient.ncm.firmvuln.exploitPatchAvailable', this)+">"+Ember.I18n.t('webclient.ncm.firmvuln.patchAvailable', this)+"</span>";// No I18N
    }
    return "<span title="+Ember.I18n.t('webclient.ncm.firmvuln.exploitPatchAvailable', this)+">[NA]</span>";// No I18N
}
function summaryFormatter(cellValue) {
     while(cellValue.indexOf('\\r\\n\\r\\n') !== -1){
         cellValue = cellValue.replace('\\r\\n\\r\\n','\\r\\n');
     }
     while(cellValue.indexOf('\\r\\n') !== -1){
         cellValue = cellValue.replace('\\r\\n',' ');
     }
     return cellValue;
}
function firmVulnTypeFormatter(cellValue) {
    var typeList = cellValue;
    if(typeList === undefined || typeList === null || typeList.length == 0)
    {
        return Ember.I18n.t('webclient.general.notavailable', this);//No I18N
    }
    var size = typeList.length;
    var types = '';
    for(var i = 0; i < size-1; i++)
    {
        types = types + typeList[i]+",\n";
    }
    types = types + typeList[size-1]+"";
    return types;
}
function firmVulnTypeTwoFormatter(vulType) {
    var vulTypeVal = '';
    if(vulType === '' || vulType === undefined || vulType.length === 0){
        //vulTypeClass = 'vulType disable';
        return Ember.I18n.t('webclient.general.notavailable', this);//No I18N
    }
    else {
        var len = vulType.length;
        if(len !== 0){
            vulTypeVal = vulType[0];
            for(var i=1; i<len; i++){
                vulTypeVal = vulTypeVal + ' | ' + vulType[i];
            }
        }
    }
    return vulTypeVal;
}
// NCM firmware vulnerability formatter ends here
function bgpStartTimeFormatter(cellvalue, rowData){
    return rowData.startTimems;
}

function bgpEndTimeFormatter(cellvalue, rowData){
    return rowData.endTimems;
}

function bgpDiffTimeFormatter(cellvalue, rowData){
    return rowData.diffTimems;
}

function incidentMetricSort(cellvalue, rowData){
    return rowData.meanValLong;
}

function mttrSort(cellvalue, rowData){
    return rowData.mttrLong;
}

function mtbfSort(cellvalue, rowData){
    return rowData.mtbfLong;
}

function mttfSort(cellvalue, rowData){
    return rowData.mttfLong;
}
function AddValuesGridCustomSelBox(cellValue, options, rowdata, action){
    if(rowdata.Test !== undefined){
        if((options.colModel.index).toUpperCase() === "DEVICENAME")
        {
            var reDiv = "<div style='position:relative;height:100%;padding-right:0.3em;' class='selBox'><div><select name='cFldDrop' id='cFldDrop_"+options.pos+"' class='select2'><option value='DEVICENAME'>DeviceName</option></select></div></div>";//NO I18N
        }
        else if((options.colModel.index).toUpperCase() === "INTERFACENAME"){
            var reDiv = "<div style='position:relative;height:100%;padding-right:0.3em;' class='selBox'><div><select name='cFldDrop' id='cFldDrop_"+options.pos+"' class='select2'><option value='INTERFACENAME'>"+Ember.I18n.t('webclient.topo.actions.deviceinfo.intfname',this)+"</option></select></div></div>";//NO I18N
        }
        else{
            var reDiv = "<div style='position:relative;height:100%;padding-right:0.3em;' class='selBox'><div><select name='cFldDrop' id='cFldDrop_"+options.pos+"' class='select2 custFldDrp'>";//NO I18N

            var existFlds  = $("#additionalFieldsList").jqGrid("getCol", "name");//NO I18N
                var fieldArr = [];
                $.each(existFlds,function(k,v){
                    if((options.colModel.index) === v.toUpperCase()){
                        reDiv += "<option value='"+v.toUpperCase()+"' selected='selected'>"+v+"</option>" ;//NO I18N
                    }else{
                        reDiv += "<option value='"+v.toUpperCase()+"'>"+v+"</option>" ;//NO I18N
                    }
                });
                reDiv += "</select></div></div>";//NO I18N
        }
                return reDiv;

    }else{
        if(cellValue !== undefined)
        {
            return escapeHTML(cellValue);
        }else{
            return "";
        }

    }
}
function AddSubnetImportValuesInGrid(cellValue, options, rowdata, action){
    if(rowdata.TestPreviewInOpU !== undefined){
        var id = "cFldDrop_"+options.pos;//No I18N
        var reDiv = "<div style='position:relative;height:100%;padding-right:0.3em;' class='selBox'><div><select name='cFldDrop' id='cFldDrop_"+options.pos+"' class='select2 custFldDrp'>";//NO I18N
        var importColLen = OPMClient.InventoryOpUtilsController.importIPAMColumns.length;

        for(var k=0;k<importColLen;k++){
            var importCol = OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'];
            if(importCol === "IP Address"){
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.admin.appmanager.serverip", this);
                }else if(importCol === "STATUS"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.devices.details.status", this);
                }else if(importCol === "DNSNAME"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opu.views.DNS_NAME", this);
                }else if(importCol === "OSID"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opu.views.DEVICE_TYPE", this);
                }else if(importCol === "ALIAS_NAME"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opstor.inventory.alias", this) + " " + Ember.I18n.t("opu.views.NAME", this);//No I18N
                }else if(importCol === "RESERVED_STATUS"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opu.views.RESERVED_STATUS", this);
                }else if(importCol === "TELEPHONE_NUMBER"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.admin.adduser.phone", this);
                }else if(importCol === "ASSERT_TAG"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opu.views.ASSET_TAG", this);
                }else if(importCol === "MACADDRESS"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.devices.details.mac", this);
                }else if(importCol === "SYSDESCR"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("opu.views.SYS_DESCR", this);
                }else if(importCol === "SYSNAME"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.admin.traps.sysname", this);
                }else if(importCol === "SYSLOCATION"){//No I18N
                    OPMClient.InventoryOpUtilsController.importIPAMColumns[k]['colName'] = Ember.I18n.t("webclient.snapshot.systemlocation", this);
                }
        }
        var existFlds  = OPMClient.InventoryOpUtilsController.importIPAMColumns;
        var fieldArr = [];
        var count = 0;
        $.each(existFlds,function(k,v){
            count++;
            if((options.colModel.index) === v.colName){

                reDiv += "<option value='"+v.colName+"' selected='selected'>"+v.colName+"</option>" ;//NO I18N
            }else{

                reDiv += "<option value='"+v.colName+"'>"+v.colName+"</option>" ;//NO I18N
            }
        });
        reDiv += "</select></div></div>";//NO I18N
        return reDiv;
    }
    else{
        if(cellValue !== undefined)
        {
            return escapeHTML(cellValue);
        }else{
            return "";
        }
    }
}
function discoveryCSVFieldSelection(cellValue, options, rowdata, action){
    if(rowdata.CsvFields !== undefined && options!==undefined && options.colModel!==undefined && options.colModel.index!==undefined){
        var reDiv = "<div class='selBox type2'><div style='width:175px !important'><select title='"+Ember.I18n.t("webclient.opm.settings.bulkupdate.customfield.selectfield",this)+"' name='cFldDrop' id='cFldDrop_"+options.pos+"' onchange='changeCSVFieldValue("+options.pos+")' class='select2 custFldDrp'>";//NO I18N
        reDiv += "<option value=''>"+Ember.I18n.t("webclient.admin.re.selcriteria",this)+"</option><optgroup label='"+Ember.I18n.t("webclient.map.flash.deviceProp",this)+"'>";//NO I18N
                for(var i=0;i<OPMClient.NetworkDiscoveryController.defaultDeviceProps.length;i++)
                {
                    if(OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].id===options.colModel.index){
                        OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].isSelected = true;
                        reDiv += "<option value='"+OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].id+"' selected='selected'>"+OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].text+"</option>";//NO I18N
                    }else{
                var isAlreadySelected = "";
                        reDiv += "<option value='"+OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].id+"' "+isAlreadySelected+">"+OPMClient.NetworkDiscoveryController.defaultDeviceProps[i].text+"</option>";//NO I18N
                    }
                }
        reDiv += "</optgroup><optgroup label='"+Ember.I18n.t("webclient.commontext.customfields",this)+"'>";//NO I18N
            $.each(OPMClient.NetworkDiscoveryController.deviceFieldProps,function(k,v){
                if(options.colModel.index === v.text){
                    v.isSelected = true;
                    reDiv += "<option value='"+v.id+"' selected='selected'>"+v.text+"</option>" ;//NO I18N
                }else{
                    var isAlreadySelected = "";
                    reDiv += "<option value='"+v.id+"' "+isAlreadySelected+">"+v.text+"</option>" ;//NO I18N
                }
            });
        reDiv += "</optgroup></select></div></div>";//NO I18N
        return reDiv;
    }
    else{
        if(cellValue !== undefined){
            return escapeHTML(cellValue);
        }
        else{
            return "";
        }
        
    }
}
function custiomFiledsAssociate(type){
        return "<div class='opmBtn addUserBtn' onclick='saveAdditionalFields(&#39;"+type+"&#39;)'>"+Ember.I18n.t('associate',this)+"</div>";//No I18N
}

function discoveryStatusAction(cellValue, options, rowdata){
    if(rowdata.discoveryStatus === "true")
    {
        return "<i><div class='nd_status'>"+rowdata.triggerDescription+"<div onclick='opm_ndStopDiscovery("+escape(rowdata.profileId)+");' class='nd_statusCancel pointer' title=\""+Ember.I18n.t('webclient.network.Discovery.Cancel',this)+"\"></div></div></i>"; //NO I18N
    }
    else
    {
        return opm_escapeHTML(cellValue);
    }

}
function drillDowntoSnapshot(cellValue, options, rowdata){
    if(rowdata.action == "ADD" || rowdata.action == "UPDATE" || rowdata.action == "APPROVED") {
     return "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+(rowdata.deviceName !== undefined ? rowdata.deviceName : rowdata.ipAddress)+"' style='text-decoration:none;' >"+opm_escapeHTML(cellValue)+"</a>"; //No I18N
    }
    else
    {
        return opm_escapeHTML(cellValue);
    }
}
function opm_wlcApsAdvancedMonState(cellvalue, options, rowdata)
{
    if(window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.discoveryWrite)
    {
        var apName = rowdata.apName;
        if(rowdata.advanceMonitoringEnabled !== true && rowdata.advanceMonitoringEnabled !== "true")
        {
            return "<div class='clearfix'><i onclick='opm_EnableDisableAPMonitoring(&#39;&#39;,&#39;"+rowdata.advanceMonitoringEnabled+"&#39;,"+false+",&#39;"+rowdata.apName+"&#39;)' class='icon-status15 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.false')+"</span></div>"; //No I18N
        }else{
            return "<div class='clearfix'><i onclick='opm_EnableDisableAPMonitoring(&#39;&#39;,&#39;"+rowdata.advanceMonitoringEnabled+"&#39;,"+false+",&#39;"+rowdata.apName+"&#39;)' class='icon-status16 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.true')+"</span></div>"; //No I18N
        }
    }
    else
    {
        return "";
    }
}
function opm_MerakiApsAdvancedMonState(cellvalue, options, rowdata)
{
    if(window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.discoveryWrite)
    {
        var apName = rowdata.deviceName;

        if(rowdata.advanceMonitoringEnabled !== true && rowdata.advanceMonitoringEnabled !== "true")
        {
            return "<div class='clearfix'><i onclick='opm_MerakiAPMonitoringAction(this,&#39;"+"start"+"&#39;,"+false+",&#39;"+apName+"&#39;)' class='icon-status15 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.false')+"</span></div>"; //No I18N
        }else{
            return "<div class='clearfix'><i onclick='opm_MerakiAPMonitoringAction(this,&#39;"+"stop"+"&#39;,"+false+",&#39;"+apName+"&#39;)' class='icon-status16 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.true')+"</span></div>"; //No I18N
            }
    }
    else
    {
        return "";
    }


}


function opm_SDWANDeviceAdvancedMonState(cellvalue, options, rowdata)
{
    if(window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.devGrouporBVRestricted.discoveryWrite)
    {
        var apName = rowdata.deviceMOID;

        if(rowdata.advanceMonitoringEnabled !== true && rowdata.advanceMonitoringEnabled !== "true")
        {
            return "<div class='clearfix'><i onclick='opm_SDWANDeviceMonitoringAction(this,&#39;"+"start"+"&#39;,"+false+",&#39;"+apName+"&#39;)' class='icon-status15 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.false')+"</span></div>"; //No I18N
        }else{
            return "<div class='clearfix'><i onclick='opm_SDWANDeviceMonitoringAction(this,&#39;"+"stop"+"&#39;,"+false+",&#39;"+apName+"&#39;)' class='icon-status16 pointer pull-left'></i><span class='monitoringStatus line-height-3 ml-xs pull-left'>"+Ember.I18n.t('opm.wlc.monitoringState.true')+"</span></div>"; //No I18N
        }
    }
    else
    {
        return "";
    }
}

function probeAutoDownloadStatus(cellValue, options, rowdata, action){
    if(rowdata.AUTODOWNLOAD){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='saveUpgradeSettings(&#39;false&#39;,&#39;"+rowdata.PROBEID+"&#39;)' checked><label></label></div>";//No I18N
    } else {
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='saveUpgradeSettings(&#39;true&#39;,&#39;"+rowdata.PROBEID+"&#39;)'><label></label></div>";//No I18N
    }
}

function probeNameWithStatus(cellValue, options, rowdata, action)
{

    return rowdata.ISSERVICEDOWN === true ?
     '<div class="flex flex-middle-align"><em class="svgIcon size16 pointer mr-xs" title="'+Ember.I18n.t("nfa.central.communicationDown")+'" ><svg fill="#fa5b5f"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#arrow-down"/></svg></em>'+cellValue+'</div>' : '<div class="flex flex-middle-align"><em class="svgIcon size16 pointer mr-xs" title="'+Ember.I18n.t("nfa.central.communicationUp")+'"><svg fill="#4cbb7d"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#arrow-up"/></svg></em>'+cellValue+'</div>'
}

function serverUpgradeStatusFormatter(cellValue, options, rowdata, action) {
    if (String(rowdata.IS_QPM_ALREADY_APPLIED) === "true") { //No I18N
        var appliedText = Ember.I18n.t("webclient.upgrade.manager.qpm.already.applied"); //No I18N
        return '<div class="upgradeStatusSection m-none flex upgradeStatusInactive"><span class="probeFileStatus flex flex-middle-align">' + appliedText + '</span></div>'; //No I18N
    }
    if (rowdata.ISSELECTEDFORUPGRADE === false || rowdata.ISSELECTEDFORUPGRADE === "false") {
        var notSelText = Ember.I18n.t("webclient.upgrade.manager.selection.not.pending"); //No I18N
        return '<div class="upgradeStatusSection m-none flex upgradeStatusInactive"><span class="probeFileStatus flex flex-middle-align">' + notSelText + '</span></div>'; //No I18N
    }
    var actionSpinner = "";
    var sumConstants = OPMClient.SettingsTabController.upgradeManagerDetails.sumConstants;
    var descStatus = '<em class="svgIcon size16 mr-xs"><svg fill="#ffc35a"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#trouble"/></svg></em>'; //No I18N

    var showLoadingSpinner = [sumConstants.HEALTH_CHECK_IN_PROGRESS, sumConstants.ACTION_LOADING_CLIENT, sumConstants.HEALTH_CHECK_RESTARTING, sumConstants.DOWNLOAD_IN_PROGRESS, sumConstants.UPGRADE_IN_PROGRESS, sumConstants.PLUGIN_UPGRADE_IN_PROGRESS, sumConstants.YET_TO_SEND_DOWNLOAD_REQUEST, sumConstants.DOWNLOAD_REQUEST_SEND, sumConstants.UPGRADE_WILL_BE_STARTED, sumConstants.PLUGIN_UPGRADE_WILL_BE_STARTED, sumConstants.HA_RESYNC_IN_PROGRESS].map(String).includes(String(rowdata.STATUS));

    if(showLoadingSpinner) {
        actionSpinner = '<div class="opmLoading-circle relative inline-block mr-sm"><div class="opmLoading-circle1 opmLoading-circle"></div><div class="opmLoading-circle2 opmLoading-circle"></div><div class="opmLoading-circle3 opmLoading-circle"></div><div class="opmLoading-circle4 opmLoading-circle"></div><div class="opmLoading-circle5 opmLoading-circle"></div><div class="opmLoading-circle6 opmLoading-circle"></div><div class="opmLoading-circle7 opmLoading-circle"></div><div class="opmLoading-circle8 opmLoading-circle"></div><div class="opmLoading-circle9 opmLoading-circle"></div><div class="opmLoading-circle10 opmLoading-circle"></div><div class="opmLoading-circle11 opmLoading-circle"></div><div class="opmLoading-circle12 opmLoading-circle"></div></div>';
        descStatus = "";
    }
    var failedDetails = "";//No I18N
    var downloadSpeedIcon = "";
    var downloadSlowIcon = "";

    var negativeCase = [sumConstants.HEALTH_CHECK_FAILURE, sumConstants.HEALTH_CHECK_TIMED_OUT, sumConstants.PROBE_DOWN_DURING_DOWNLOAD, sumConstants.DOWNLOAD_INTERRUPT, sumConstants.INVALID_PPM, sumConstants.OPM_PPM_INTEGRITY_FAILED, sumConstants.NO_DISK_SPACE, sumConstants.PARTIALLY_COMPLETED, sumConstants.UPGRADE_FAILED, sumConstants.PPM_DOWNLOAD_FAILED, sumConstants.PLUGIN_UPGRADE_FAILED, sumConstants.UPGRADE_FAILED_WITH_REMARKS, sumConstants.HEALTH_CHECK_RESTART_AND_RETRY_REQUIRED].map(String).includes(String(rowdata.STATUS));

    if(negativeCase) {
        descStatus = '<em class="svgIcon size16 mr-xs"><svg fill="#fb5b59"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#close-circle"/></svg></em>'; //No I18n
    }

    var showFailedDetailsTab = rowdata.STATUS == sumConstants.HEALTH_CHECK_FAILURE || rowdata.STATUS == sumConstants.HEALTH_CHECK_RESTART_REQUIRED || rowdata.STATUS == sumConstants.HEALTH_CHECK_RESTART_AND_RETRY_REQUIRED;
    if(showFailedDetailsTab) {
        failedDetails = "<a class='opm_link pointer ml-xs' style='min-width:20%' onclick='toggleSubGridRowForGridID(event, &quot;"+(options.gid+"&quot;,"+options.rowId)+", true)'>"+Ember.I18n.t("webclient.devices.details.wlc.details")+"</a>";//No I18N
    }

    if (rowdata.STATUS == sumConstants.UPGRADE_SUCCESS_WITH_REMARKS) {
        failedDetails = "<a class='opm_link pointer ml-xs' onclick='toggleSubGridRowForGridID(event, &quot;"+(options.gid+"&quot;,"+options.rowId)+", true)'>"+Ember.I18n.t("opu.views.REMARKS")+"</a>";//No I18N
        if (rowdata.FOSFileSyncActionRequired == true) {
            failedDetails += "<span class='ml-xs mr-xs'> | </span><a class='opm_link pointer' title='"+Ember.I18n.t("webclient.upgrade.manager.health.check.retry")+"' onclick='upgradeServerActions(event,\"" + rowdata.SERVERID + "\",\"retryUMRemarks\", \"" + options.rowId + "\",\"" + rowdata.SERVERMODE + "\")'> "+Ember.I18n.t("webclient.upgrade.manager.health.check.retry")+" </a>";
        }
    }

    if (rowdata.STATUS == sumConstants.UPGRADE_FAILED_WITH_REMARKS) {
        failedDetails = "<a class='opm_link pointer ml-xs' onclick='toggleSubGridRowForGridID(event, &quot;" + options.gid + "&quot;," + options.rowId + ", true)'>" + Ember.I18n.t("webclient.devices.details.wlc.details") + "</a>" + (String(rowdata.SERVERID) !== "-1" ? "<span class='ml-xs mr-xs'>|</span><a class='opm_link pointer mr-xs' title='" + Ember.I18n.t("webclient.upgrade.manager.health.check.retry") + "' onclick='upgradeServerActions(event,\"" + rowdata.SERVERID + "\",\"retryProbeUpgrade\", \"" + options.rowId + "\",\"" + rowdata.SERVERMODE + "\")'>" + Ember.I18n.t("webclient.upgrade.manager.health.check.retry") + "</a>" : ""); // No I18N
    }

    var positiveCase = [sumConstants.PPM_FILE_PLACED, sumConstants.DOWNLOAD_COMPLETED, sumConstants.HEALTH_CHECK_SUCCESS, sumConstants.REQUEST_RECEIVED, sumConstants.DOWNLOAD_COMPLETE_CENTRAL_UPGRADED, sumConstants.UPGRADE_SUCCESS, sumConstants.SAME_VERSION, sumConstants.DEFAULT, sumConstants.UPGRADE_SUCCESS_WITH_REMARKS].map(String).includes(String(rowdata.STATUS));
    if(positiveCase) {
        descStatus = '<em class="svgIcon size16 mr-xs"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_accept"/></svg></em>';
    }

    if(rowdata.SKIPUPGRADE == true || rowdata.SKIPUPGRADE == "true") {
        actionSpinner = "";
    }

    if(cellValue == undefined || cellValue == '') {
        cellValue = '-'; //No I18N
    } else if(rowdata.STATUS == sumConstants.DOWNLOAD_IN_PROGRESS || rowdata.STATUS == sumConstants.UPGRADE_IN_PROGRESS || rowdata.STATUS == sumConstants.HEALTH_CHECK_IN_PROGRESS || rowdata.STATUS == sumConstants.PLUGIN_UPGRADE_IN_PROGRESS){
        var percentVal = rowdata.UPGRADEPROGRESSPERCENTAGE ? rowdata.UPGRADEPROGRESSPERCENTAGE : (getPercFromDesc(cellValue) ?  getPercFromDesc(cellValue)[0] : '');
        if(rowdata.STATUS == sumConstants.DOWNLOAD_IN_PROGRESS) {
            if(rowdata.PPM_DOWNLOAD_SLOW) {
                downloadSlowIcon = '<em class="svgIcon size16 pointer mr-xs ml-xs" title="'+Ember.I18n.t("webclient.settings.upgrade.downloadslow")+'" ><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#warning-color"/></svg></em>';
            }

            if(rowdata.DOWNLOADSPEED) {
                downloadSpeedIcon = '<div class="flex flex-middle-align"><em class="svgIcon size16 pointer mr-xs" title="'+Ember.I18n.t("webclient.Download.Speed") + ": " + rowdata.DOWNLOADSPEED+'" ><svg fill="#4cbb7d"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#arrow-down"/></svg></em>'+rowdata.DOWNLOADSPEED+downloadSlowIcon+'</div>';
            }
        }
        if(percentVal != null && percentVal !="" && percentVal != undefined && percentVal != 'undefined') {
            cellValue = cellValue.split(/\d/)[0];
            cellValue = '<div class="upgradeStatusSection m-none"><span class="probeFileStatus flex flex-middle-align">'+actionSpinner+descStatus+cellValue+'</span><div class="loadingStatusBar"><div class="grayLine"><div class="greenLine" style="width:'+percentVal+'%"></div></div></div><span class="probeUploadingStatus">'+percentVal+'%</span>'+downloadSpeedIcon + '</div>' //No I18N
        } else {
            cellValue = '<div class="upgradeStatusSection m-none" style="display:flex"><span class="probeFileStatus flex flex-middle-align">'+actionSpinner+descStatus+cellValue+'</span>'+'</div>'
        }
    } else {
        cellValue = '<div class="upgradeStatusSection m-none flex flex-middle-align"><span class="probeFileStatus flex flex-middle-align">'+actionSpinner+descStatus+cellValue+'</span>'+failedDetails+'</div>' //No I18N
    }
    return cellValue;
}

function systemInfoServiceStatusFormatter(cellValue, options, rowdata, action) {
    var actionSpinner = "";
    var descStatus = '<em class="svgIcon size16 mr-xs"><svg fill="#ffc35a"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#trouble"/></svg></em>'; //No I18N

    var showLoadingSpinner = rowdata.statusCode == 100;

    if(showLoadingSpinner) {
        actionSpinner = '<div class="opmLoading-circle relative inline-block mr-sm"><div class="opmLoading-circle1 opmLoading-circle"></div><div class="opmLoading-circle2 opmLoading-circle"></div><div class="opmLoading-circle3 opmLoading-circle"></div><div class="opmLoading-circle4 opmLoading-circle"></div><div class="opmLoading-circle5 opmLoading-circle"></div><div class="opmLoading-circle6 opmLoading-circle"></div><div class="opmLoading-circle7 opmLoading-circle"></div><div class="opmLoading-circle8 opmLoading-circle"></div><div class="opmLoading-circle9 opmLoading-circle"></div><div class="opmLoading-circle10 opmLoading-circle"></div><div class="opmLoading-circle11 opmLoading-circle"></div><div class="opmLoading-circle12 opmLoading-circle"></div></div>';
        descStatus = "";
    }

    var negativeCase = rowdata.statusCode == 300;

    if(negativeCase) {
        descStatus = '<em class="svgIcon size16 mr-xs"><svg fill="#fb5b59"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#close-circle"/></svg></em>'; //No I18n
    }

    var positiveCase = rowdata.statusCode == 200;
    if(positiveCase) {
        descStatus = '<em class="svgIcon size16 mr-xs"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_accept"/></svg></em>';
    }

    if(cellValue == undefined || cellValue == '') {
        cellValue = '-'; //No I18N
    } else {
        if(rowdata.percent != null && rowdata.percent !="" && rowdata.percent != undefined && rowdata.percent != 'undefined') {
            cellValue = '<div class="upgradeStatusSection m-none"><span class="probeFileStatus flex flex-middle-align">'+actionSpinner+descStatus+cellValue+'</span><div class="loadingStatusBar"><div class="grayLine"><div class="greenLine" style="width:'+rowdata.percent+'%"></div></div></div><span class="probeUploadingStatus">'+rowdata.percent+'%</span></div>' //No I18N
        } else {
            cellValue = '<div class="upgradeStatusSection m-none" style="display:flex"><span class="probeFileStatus flex flex-middle-align">'+actionSpinner+descStatus+cellValue+'</span>'+'</div>'
        }
    }
    return cellValue;
}

function deviceSummaryLinkFromWLCAPs(cellvalue, options, rowdata)
{
    cellvalue = opm_escapeHTML(cellvalue);
    if(rowdata.advanceMonitoringEnabled !== undefined && rowdata.advanceMonitoringEnabled === "true" && rowdata.APMOName !== undefined)
    {
        return "<a href='javascript:redirectToDeviceSnapshot(&#39;"+rowdata.APMOName+"&#39;)'>"+cellvalue+"</a>"; //No I18N
    }else if(rowdata.advanceMonitoringEnabled !== undefined && rowdata.advanceMonitoringEnabled === "true" && rowdata.apName !== undefined)
    {
        return "<a href='javascript:redirectToDeviceSnapshot(&#39;"+rowdata.apName+"&#39;)'>"+cellvalue+"</a>"; //No I18N
    }
    else{
        return "<span>"+cellvalue+"</span>"; //No I18N
    }
}
function opm_wlcClientNamewithCnt(cellvalue, options, rowdata)
{
   return "<div class='ssidName'>"+opm_escapeHTML(rowdata.displayName)+"<div class='apcClientsgrp'>"+rowdata.ClientCount+"</div></div>";
}

function opm_apClientsSignal(cellvalue, options, rowdata)
{
   return "<div class='signalTower'><div class='signalTower__grey m0'><div class='signalTower__greyPoint signalTower--bgGrey'></div></div><div class='signalTower__green' style='width:"+cellvalue+"%'><div class='signalTower__greenPoint'></div></div>";  //No I18N
}
function linkToWLCSnapshot(cellvalue, options, rowdata)
{
    return "<a href='javascript:redirectToDeviceSnapshot(\""+rowdata.parentNode+"\")'>"+escapeHtmlTags(cellvalue)+"</a>"; //No I18N
}

function emptyHyphenFormatter(cellValue, rowData) {
    if(cellValue) {
        return escapeHTML(cellValue);
    }
    else {
        return '-';
    }
}

function interfaceStatusFormatter(cellValue, options, rowdata, action)
{
    if(cellValue == 'Up'){ // No I18N
        cellValue = '<span><i class="icon-status5"></i>'+Ember.I18n.t("webclient.devices.intftypes.up", this)+'</span>';
    } else if(cellValue == 'Down') { // No I18N
        cellValue = '<span><i class="icon-status1"></i>'+Ember.I18n.t("webclient.devices.intftypes.down", this)+'</span>';
    }
    return cellValue;
}

function encodeXSSValue(cellValue, options, rowdata, action) {
	return jqGridHTMLEncode(cellValue);
}
function roleActions(cellValue, options, rowdata, action){
    var deleteHtml = '<em class="svgIcon size16 pointer" style="margin:0 7px !important;" title="'+Ember.I18n.t('webclient.devices.customfields.delete',this)+'" onclick="roleDelete('+rowdata.roleId+')" tabindex="0" role="button"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#delete"/></svg></em>';
    return '<em class="svgIcon size16 pointer" style="margin:0 7px !important;" title="'+Ember.I18n.t('webclient.role.associate.user',this)+'" target="popover" onclick="showRoleAssociatedUsers('+rowdata.roleId+')" tabindex="0" role="button"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#user"/></svg></em>' + (rowdata.editable ? deleteHtml : '');
}
function favouriteReportAdv(cellValue, options, rowdata, action)
{
    if(cellValue==="True") {
        return "<i class='icon-star' style='margin-left:10px; font-size:20px; cursor:pointer;' title='"+Ember.I18n.t('webclient.reports.removefavourite',this)+"' onclick='addOrRemoveFav(\"unMark\",\""+rowdata.ReportId+"\")'></i>"; //No I18n
    } else {
        return "<i class='icon-star-empty' style='margin-left:10px; font-size:20px; cursor:pointer;' title='"+Ember.I18n.t('webclient.reports.myfavourite',this)+"' onclick='addOrRemoveFav(\"mark\",\""+rowdata.ReportId+"\")'></i>"; //No I18n
    }
}

function AdvancedRepFormatter(cellValue, options, rowdata, action) {
    if (cellValue === undefined || cellValue === "" || cellValue === "null" || cellValue === "NULL") {
        return "-";//No I18N
    }
    return escapeHTML(cellValue);
}

function nullValueFormatter(cellValue, options, rowdata, action) {
    if (!cellValue || cellValue.toLowerCase() === 'null') {
        return "-";//No I18N
    }
    return escapeHTML(cellValue);
}


function addPointerClass(){
    return ' class="pointer" ';//No I18N
}

function addTrapToTrapProcessor(cellValue, options, rowdata, action){
    return "<a onclick=addTrapProcessor('"+rowdata.oid+"','"+rowdata.traptype+"','"+rowdata.version+"','"+rowdata['specific-type']+"') target='_blank' class='opm_link'>"+Ember.I18n.t('webclient.admin.traps.addunsol',this)+"</a>"; //No I18n
}
function getTrapGenericType(cellValue, options, rowdata, action){
    return getTrapGenericTypeMsg(rowdata.traptype);
}
function varBindValueDesc(cellValue, options, rowdata, action){
    var msg = rowdata['varbind-values'].replace("<br>",", ");
    return escapeHTML(msg);
}
function oidWithVersion(cellValue, options, rowdata, action){
    if(rowdata.version!==undefined){
        if(rowdata.version===0){
            return rowdata.oid + '<b>(V1)</b>';//No I18N
        }else if(rowdata.version===1){
            return rowdata.oid + '<b>(V2)</b>';//No I18N
        }else if(rowdata.version===2){
            return rowdata.oid + '<b>(V2c)</b>';//No I18N
        }else if(rowdata.version===3){
            return rowdata.oid + '<b>(V3)</b>';//No I18N
        }
    }
    return rowdata.oid;
}
function trapDataFormat(cellValue, options, rowdata, action){
    var varval = '<div class="grid-container"><div class="grid-row"><div class="grid-col-2 textBold">'+ Ember.I18n.t('webclinet.inventory.nfa.values', this) +'</div><div class="grid-col-10">'+ escapeHTML(rowdata.message) +'</div></div>';
    var vardesc ='<div class="grid-row"><div class="grid-col-2 textBold">'+ Ember.I18n.t('opu.tools.VARBIND_DESCRIPTION', this) +'</div><div class="grid-col-10">'+ escapeHTML(rowdata.values) +'</div></div></div>';
    return varval+vardesc;
}
function deviceSummaryLinkFromMeraki(cellvalue, options, rowdata)
{
    cellvalue = opm_escapeHTML(cellvalue);
    if(rowdata.advanceMonitoringEnabled !== undefined && rowdata.advanceMonitoringEnabled === "true")
    {
        return "<a href='javascript:redirectToDeviceSnapshot(&#39;"+rowdata.deviceName+"&#39;)'>"+cellvalue+"</a>"; //No I18N
    }
    else{
        return "<span>"+cellvalue+"</span>"; //No I18N
    }
}
function merakiNetwkTopo(cellvalue, options, rowdata)
{
    return "<i class='icon-sm-groups' style='margin-left:10px; font-size:20px; cursor:pointer;' title='"+Ember.I18n.t('webclient.opm.topologyview',this)+"' onclick='viewMerakiNetworkTopo(\""+rowdata.networkName+"\")'></i>"; //No I18n
}

function FWARuleSuggStatusFormatter(cellValue, options, rowdata, action) {
	if(rowdata.status != undefined){
		if(rowdata.status==0){
			var imgUrl = "/apiclient/fluidicv2/img/ajax-loader.gif";//No I18N
	        var title = Ember.I18n.t('opstor.inventory.areca.volumeset.progress'); // No I18N
			return '<img src="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("webclient.fwa.device.rule.status.inprogress")+'</i>'; //No I18N
		}else if(rowdata.status == 1){
			var imgUrl = "icon-status5";//No I18N
	        var title = Ember.I18n.t('fwa.compliance.compSuccessMsg'); // No I18N
			return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("fwa.compliance.compSuccessMsg")+'</i>'; //No I18N
		}else if(rowdata.status == 2){
			var imgUrl = "icon-status1";//No I18N
	        var title = Ember.I18n.t('webclient.map.flash.failed'); // No I18N
			return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("webclient.map.flash.failed")+'</i>'; //No I18N
		}
	}
}

function FWARuleSuggStatusFormatter(cellValue, options, rowdata, action) {
	if(rowdata.status != undefined){
		if(rowdata.status==0){
			var imgUrl = "/apiclient/fluidicv2/img/ajax-loader.gif";//No I18N
	        var title = Ember.I18n.t('opstor.inventory.areca.volumeset.progress'); // No I18N
			return '<img src="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("webclient.fwa.device.rule.status.inprogress")+'</i>'; //No I18N
		}else if(rowdata.status == 1){
			var imgUrl = "icon-status5";//No I18N
	        var title = Ember.I18n.t('fwa.compliance.compSuccessMsg'); // No I18N
			return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("fwa.compliance.compSuccessMsg")+'</i>'; //No I18N
		}else if(rowdata.status == 2){
			var imgUrl = "icon-status1";//No I18N
	        var title = Ember.I18n.t('webclient.map.flash.failed'); // No I18N
			return '<i class="'+imgUrl+'" title="'+title+'">&nbsp;</i><i>'+Ember.I18n.t("webclient.map.flash.failed")+'</i>'; //No I18N
		}
	}
}

//NCM EE formatters

function ncm_probeLink(cellValue, options, rowdata, action){
	var machineName = rowdata[3];;
	var protocol = rowdata[8]; //No I18N
	var port = rowdata[7]; //No I18N
	var probeUrl = protocol+"://"+machineName+":"+port;
	return "<a href='"+probeUrl+"' target='_blank' class='opm_link'>"+cellValue+"</a>";
}

function ncm_probeEdit(cellValue, options, rowdata, action){
	var probeName = rowdata[2];
	var serverMode = rowdata[9];
	var contactName = rowdata[10];
	var contactEmail = rowdata[11];
	return "<div style='cursor:pointer;' title='Edit' onclick='OPM_editProbeDetails(&#39;"+probeName+"&#39;,&#39;"+serverMode+"&#39;,&#39;"+contactName+"&#39;,&#39;"+contactEmail+"&#39;)'>"+probeName+"</div>";//No I18n
}

function setNcmProbeStatusImg(cellValue, options, rowdata, action)
{
	var statusCode=rowdata[1];

	if(statusCode!=undefined){
		return "<i class='icon-"+statusCode+"'></i>";
	}
	else{
		return "";
	}
}

function traverseToDevAvailMonitoring()
{
    //Redirecting to device snapshot's monitoring interval page.
    redirectSnapShot("MonitoringIntervals","MonitoringDevice",OPMClient.InventoryDeviceDetailsController.deviceName); //No I18N
}
function businessviewList(cellvalue, options, rowdata)
{
    return "<i class='icon_status devBV_status --fault-severity severity_"+opm_escapeHTML(rowdata.statusNum)+"'></i><a href='javascript:goToBVMapLink(\""+opm_escapeHTML(rowdata.bvName)+"\")' style='color:#222222'>"+opm_escapeHTML(cellvalue)+"</a>"; //No I18N
}
function devSnapGroupsList(cellvalue, options, rowdata)
{
    return "<a href='javascript:redirectotGroupsSnapshot(\""+opm_escapeHTML(rowdata.name)+"\",\""+escapeHtmlTags(rowdata.groupType)+"\")' style='color:#222222'>"+opm_escapeHTML(cellvalue)+"</a>"; //No I18N
}
function businessviewAlertCount(cellvalue, options, rowdata)
{
 return opm_escapeHTML(rowdata.failedcount)+"/"+opm_escapeHTML(cellvalue);
}

function probeNameToProbeDisplayName(cellvalue, options, rowdata) {
    return rowdata.probeDisplayName;
}
function probeNameToProbeDisplayNameForIntf(cellvalue, options, rowdata) {
    return rowdata.probeName;
}
//NCM EE formatters ends

function formateRequestType(cellValue, options, rowdata, action)
{
	return '<span class="RESTRequestType ' + cellValue.toLowerCase() + '">'+cellValue+'</span>';
}

function formatFortiOSColor(cellValue, options, rowdata, action)
{
	return cellValue;
}

function fortiOSRSDest(cellValue, options, rowdata, action)
{
	var returnValue = rowdata.dst;
	var iconClass = undefined;
	if(rowdata['internet-service'] != undefined && rowdata['internet-service'] != '') {
		returnValue = rowdata['internet-service'];//No I18N
		iconClass = 'icon_static-routes_internet-service'; //No I18N
	} else if(rowdata.dstaddr != undefined && rowdata.dstaddr != '') {
		returnValue = rowdata.dstaddr;
	}
	setFormattedData(rowdata, options, returnValue);
	if(iconClass != undefined) {
		var iconColor = getFortiOSColor(1);
		returnValue = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnValue  + '</span></div>'; //No I18N
	}
	return returnValue;
}

function fortiOSRPProtocol(cellValue, options, rowdata, action)
{
	return cellValue;
}

function fortiOSRPSource(cellValue, options, rowdata, action)
{
	var ret = ""; //No I18N
	ret += "<div>" + formatFortiOSJSONArray(rowdata.src) + "</div>";//No I18N
	ret += "<div>" + formatFortiOSJSONArray(rowdata.srcaddr) + "</div>";//No I18N
	setFormattedData(rowdata, options, ret);
	return ret;
}

function fortiOSRPDest(cellValue, options, rowdata, action)
{
	var ret = ""; //No I18N
	ret += "<div>" + formatFortiOSJSONArray(rowdata.dst) + "</div>";//No I18N
	ret += "<div>" + formatFortiOSJSONArray(rowdata.dstaddr) + "</div>";//No I18N
	setFormattedData(rowdata, options, ret);
	return ret;
}

function fortiOSStatusColumn(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(cellValue == 'enable') {
		returnString = '<span><i class="icon-status5"></i>'+Ember.I18n.t("jsp.commonstr.Enabled", this)+'</span>';
	} else {
		returnString = '<span><i class="icon-status1"></i>'+Ember.I18n.t("jsp.commonstr.Disabled", this)+'</span>';
	}
	return returnString;
}

function formatFortiOSAddressName(cellValue, options, rowdata, action)
{
	var returnString = rowdata.name; //No I18N
	var iconClass = ''; //No I18N
	switch(rowdata.type) {
		case "wildcard"://No I18N
			iconClass = 'icon_address_wildcard'; //No I18N
		  break;
		case "wildcard-fqdn"://No I18N
			iconClass = 'icon_address_connector'; //No I18N
		  break;
		case "fqdn"://No I18N
			iconClass = 'icon_address_fqdn'; //No I18N
			  break;
		case "geography"://No I18N
			iconClass = 'icon_address_geography'; //No I18N
			  break;
		case "iprange"://No I18N
			iconClass = 'icon_address_iprange'; //No I18N
			  break;
		case "ipmask"://No I18N
			iconClass = 'icon_address_subnet'; //No I18N
			  break;
		case "dynamic"://No I18N
			iconClass = 'icon_address_connector'; //No I18N
			  break;
	}
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSAddrDetails(cellValue, options, rowdata, action)
{
	var returnString = ''; //No I18N
	switch(rowdata.type) {
		case "wildcard"://No I18N
			returnString = rowdata.wildcard;
		  break;
		case "wildcard-fqdn"://No I18N
			returnString = rowdata['wildcard-fqdn'];//No I18N
		  break;
		case "fqdn"://No I18N
			returnString = rowdata.fqdn;
			  break;
		case "geography"://No I18N
			returnString = rowdata.country;
			  break;
		case "iprange"://No I18N
			returnString = rowdata['start-ip'] + ' - ' + rowdata['end-ip'];//No I18N
			  break;
		case "ipmask"://No I18N
			returnString = rowdata.subnet;
			  break;
		case "dynamic"://No I18N
			returnString = rowdata.sdn;
			  break;
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatFortiOSAddressInterface(cellValue, options, rowdata, action) {
	if(cellValue == undefined || cellValue == null || cellValue == '') {
		return ''; //No I18N
	}

	var returnString = ''; // No I18N
	var iconClass = 'icon_address_port'; // No I18N
	if(cellValue == 'ssl.root') { // No I18N
		iconClass = 'icon_ssl_port'; // No I18N
	}
	if(cellValue == 'virtual-wan-link') {
		cellValue = 'SD-WAN'; // No I18N
	}
	returnString = '<div><em class="svgIcon size16" style="fill:#008b10"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + cellValue  + '</span></div>'; //No I18N

	setFormattedData(rowdata, options, cellValue);
	return returnString;
}

function formatFortiOSAddrGrpName(cellValue, options, rowdata, action)
{
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_address_group'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}


function formatFortiOSAddrV6Name(cellValue, options, rowdata, action)
{
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_address_ipv6'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSVIPName(cellValue, options, rowdata, action)
{
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_virtual-ip'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function getFortiOSColor(colorCode) {
	if(colorCode == undefined || colorCode == '' || colorCode == '0') {
		colorCode = 1;
	}

	var colors = [
		"#000000", // No I18N
		"#000000", // No I18N
	    "#236093", // No I18N
	    "#239330", // No I18N
	    "#932323", // No I18N
	    "#FF8B8B", // No I18N
	    "#FF0000", // No I18N
	    "#CC0000", // No I18N
	    "#CC5F00", // No I18N
	    "#FF8000", // No I18N
	    "#FFCF32", // No I18N
	    "#CCAE00", // No I18N
	    "#AB822F", // No I18N
	    "#66CC00", // No I18N
	    "#74AD74", // No I18N
	    "#009933", // No I18N
	    "#006600", // No I18N
	    "#0097CC", // No I18N
	    "#00AAFF", // No I18N
	    "#0041CC", // No I18N
	    "#4200CC", // No I18N
	    "#8200CC", // No I18N
	    "#C500CC", // No I18N
	    "#FF00FF", // No I18N
	    "#CC0071", // No I18N
	    "#660000", // No I18N
	    "#999999", // No I18N
	    "#666666", // No I18N
	    "#FFB162", // No I18N
	    "#AB9770", // No I18N
	    "#7A94CC", // No I18N
	    "#C982CC", // No I18N
	    "#484B3A"  // No I18N
	]

	try {
		colorCode = parseInt(colorCode);
	} catch(error) {
		return colors[0];
	}

	if(colorCode < 0 || colorCode > 32) {
		colorCode = 0;
	}

	return colors[colorCode];
}

function formatFortiOSAddr6Details(cellValue, options, rowdata, action)
{
	var returnString = '';
	switch(rowdata.type) {
		case "ipprefix"://No I18N
			returnString = rowdata.ip6
		  break;
		case "fqdn"://No I18N
			returnString = rowdata.fqdn
			  break;
		case "iprange"://No I18N
			returnString = rowdata['start-ip'] + ' - ' + rowdata['end-ip'];//No I18N
			  break;
		case "template"://No I18N
			returnString = rowdata.template + ' - ' + rowdata.host + ' ( ' +rowdata['host-type']+ ' )';//No I18N
			  break;
		case "dynamic"://No I18N
			returnString = rowdata.sdn
			  break;
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatFortiOSInterface(cellValue, options, rowdata, action) {
	var colName = null;
	if(rowdata) {
		colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	var ret = ""; //No I18N
	for(var i = 0; i < cellValue.length; i++) {
		var data = cellValue[i];
		if(data.name != undefined && data.name != '') {
			if(data.name == 'virtual-wan-link') {
				data.name = 'SD-WAN';
			}
			ret += "<div>" + data.name + "</div>";
		} else if(data.q_origin_key != undefined && data.q_origin_key != '') {
			if(data.q_origin_key == 'virtual-wan-link') {
				data.q_origin_key = 'SD-WAN'; // No I18N
			}
			ret += "<div>" + data.q_origin_key + "</div>";
		}
	}
	setFormattedData(rowdata, options, ret);
	return ret;
}

function formatFortiOSJSONArray(cellValue, options, rowdata, action) {
	var colName = null;
	if(rowdata) {
		colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	var ret = ""; //No I18N
	for(var i = 0; i < cellValue.length; i++) {
		var data = cellValue[i];
		if(data.name != undefined && data.name != '') {
			ret += "<div>" + data.name + "</div>";
		} else if(data.q_origin_key != undefined && data.q_origin_key != '') {
			ret += "<div>" + data.q_origin_key + "</div>";
		}
	}
	setFormattedData(rowdata, options, ret);
	return ret;
}

function formatFortiOSPolicyNAT(cellValue, options, rowdata, action) {
	if(rowdata.poolname && rowdata.poolname.length > 0) {
		var ret = ""; //No I18N
		cellValue = rowdata.poolname;
		for(var i = 0; i < cellValue.length; i++) {
			var data = cellValue[i];
			var arr = [];
			if(data.name != undefined && data.name != '') {
				ret += "<div>" + data.name + "</div>";
				arr.push(data.name);
			} else if(data.q_origin_key != undefined && data.q_origin_key != '') {
				ret += "<div>" + data.q_origin_key + "</div>";
				arr.push(data.q_origin_key);
			}
		}
		setFormattedData(rowdata, options, ret);
		ret = "";
		var iconClass = 'icon_policy_dynamic-pool'; // No I18N
		var iconColor = getFortiOSColor(1);
		for(var i = 0; i < arr.length; i++) {
			ret += '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + arr[i]  + '</span></div>'; //No I18N
		}
		return ret;
	} else {
		return fortiOSStatusColumn(cellValue, options, rowdata, action);
	}
}

function formatFortiOSPolicyService(cellValue, options, rowdata, action) {
	var colName = null;
	if(rowdata) {
		colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	var ret = ""; //No I18N
	var arr = [];
	for(var i = 0; i < cellValue.length; i++) {
		var data = cellValue[i];
		if(data.name != undefined && data.name != '') {
			ret += "<div>" + data.name + "</div>";
			arr.push(data.name);
		} else if(data.q_origin_key != undefined && data.q_origin_key != '') {
			ret += "<div>" + data.q_origin_key + "</div>";
			arr.push(data.q_origin_key);
		}
	}
	setFormattedData(rowdata, options, ret);
	ret = "";
	var iconClass = 'icon_policy_service'; // No I18N
	var iconColor = getFortiOSColor(1);
	for(var i = 0; i < arr.length; i++) {
		ret += '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + arr[i]  + '</span></div>'; //No I18N
	}
	return ret;
}

function formatFortiOSPolicyServiceGroup(cellValue, options, rowdata, action) {
	var returnString = rowdata.name;
	var iconClass = 'dual-monitor'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSPolicyVIPGroup(cellValue, options, rowdata, action) {
	var returnString = rowdata.name;
	var iconClass = 'group'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSVIPArray(cellValue, options, rowdata, action) {
	var colName = null;
	if(rowdata) {
		colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	var ret = ""; //No I18N
	var arr = [];
	for(var i = 0; i < cellValue.length; i++) {
		var data = cellValue[i];
		if(data.name != undefined && data.name != '') {
			ret += "<div>" + data.name + "</div>";
			arr.push(data.name);
		} else if(data.q_origin_key != undefined && data.q_origin_key != '') {
			ret += "<div>" + data.q_origin_key + "</div>";
			arr.push(data.q_origin_key);
		}
	}
	setFormattedData(rowdata, options, ret);
	ret = "";
	var iconClass = 'icon_virtual-ip'; // No I18N
	var iconColor = getFortiOSColor(1);
	for(var i = 0; i < arr.length; i++) {
		ret += '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + arr[i]  + '</span></div>'; //No I18N
	}
	return ret;
}

function formatFortiOSPolicyAction(cellValue, options, rowdata, action) {
	var returnString = cellValue;
	var iconClass = 'icon_policy_learn'; // No I18N
	if(cellValue == 'pass' || cellValue == 'accept' || cellValue == 'allow' || cellValue == 'permit') { // No I18N
		if(rowdata["learning-mode"] == 'enable') { // No I18N
			returnString = "learn"; // No I18N
		} else {
			iconClass = 'icon_policy_accept'; // No I18N
		}
	} else if(cellValue == 'deny' || cellValue == 'block') { // No I18N
		iconClass = 'icon_policy_deny'; // No I18N
	} else if(cellValue == 'reject') {// No I18N
		iconClass = 'icon_policy_reject'; // No I18N
	}
	setFormattedData(rowdata, options, returnString);
	returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatPanosAddrType(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata['ip-netmask'] != undefined && rowdata['ip-netmask'] != '') {
		returnString = 'IP-NetMask';//No I18N
	} else if(rowdata['ip-range'] != undefined && rowdata['ip-range'] != '') {//No I18N
		returnString = 'IP-Range';//No I18N
	} else if(rowdata['ip-wildcard'] != undefined && rowdata['ip-wildcard'] != '') {//No I18N
		returnString = 'IP-Wildcard';//No I18N
	} else if(rowdata.fqdn != undefined && rowdata.fqdn != '') {
		returnString = 'FQDN';//No I18N
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}
function formatPanOSDynamicAddrGrp(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata) {
		colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	if(cellValue != undefined && cellValue.filter != undefined) {
		returnString = cellValue.filter;
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}
function formatPanOSGeoLocation(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(cellValue != undefined && cellValue.latitude != undefined) {
		returnString = cellValue.latitude + ', '+ cellValue.longitude ;
	}
	return returnString;
}

function formatPanOSServiceProtocol(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata.protocol != undefined) {
		for (var protocolName in rowdata.protocol) {
			returnString = protocolName;
			break;
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSServicePort(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata.protocol != undefined) {
		for (var protocolName in rowdata.protocol) {
			var protocolVal = rowdata.protocol[protocolName];
			if(protocolVal != undefined && protocolVal.port != undefined) {
				returnString = protocolVal.port;
			}
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatFortiOSOneTimeSchName(cellValue, options, rowdata, action) {
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_schedule_one-time'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSRecSchName(cellValue, options, rowdata, action) {
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_policy_schedule'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSServiceName(cellValue, options, rowdata, action) {
	var returnString = rowdata.name; //No I18N
	var iconClass = 'icon_policy_service'; // No I18N
	setFormattedData(rowdata, options, returnString);
	var iconColor = getFortiOSColor(rowdata.color);
	returnString = '<div><em class="svgIcon size16" style="fill:' + iconColor + '"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	return returnString;
}

function formatFortiOSSecurityProfile(cellValue, options, rowdata, action) {
	var returnString = "";
	if(rowdata["av-profile"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_av"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["av-profile"]  + '</span></div>'; //No I18N
	}
	if(rowdata["webfilter-profile"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_WEB"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["webfilter-profile"]  + '</span></div>'; //No I18N
	}
	if(rowdata["dnsfilter-profile"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_DNS"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["dnsfilter-profile"]  + '</span></div>'; //No I18N
	}
	if(rowdata["application-list"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_app"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["application-list"]  + '</span></div>'; //No I18N
	}
	if(rowdata["ips-sensor"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_IPS"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["ips-sensor"]  + '</span></div>'; //No I18N
	}
	if(rowdata["ssl-ssh-profile"] != '') {
		returnString += '<div><em class="svgIcon size24"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_policy_SSL"/></svg></em><span class="ncmRESTGridTextIcon">' + rowdata["ssl-ssh-profile"]  + '</span></div>'; //No I18N
	}
	return returnString;
}

function formatEnableDisable(cellValue, options, rowdata, action) {
	var returnString = cellValue;
	var iconClass = 'icon-status6'; // No I18N
	if(rowdata['disabled'] == undefined) { //No I18N
		iconClass = 'icon_policy_accept'; //No I18N
	}
	if(iconClass == 'icon-status6') {//No I18N
		returnString = '<span><i class="icon-status6"></i></span>'; //No I18N
	} else {
		returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon"></span></div>'; //No I18N
	}
	return returnString;
}

function formatFortiOSLogs(cellValue, options, rowdata, action) {
	var returnString = cellValue;
	var iconClass = 'icon_policy_log_utm'; // No I18N
	if(returnString != 'utm') { //No I18N
		if(returnString == 'disable') { //No I18N
			iconClass = 'icon-status1'; //No I18N
			returnString = 'Disabled'; //No I18N
		} else {
			iconClass = 'icon_policy_accept'; //No I18N
			returnString = 'All'; //No I18N
		}
	} else {
		returnString = 'UTM'; //No I18N
	}
	setFormattedData(rowdata, options, returnString);
	if(iconClass == 'icon-status1') {//No I18N
		returnString = '<span><i class="icon-status1"></i>'+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+'</span>'; //No I18N
	} else {
		returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	}

	return returnString;
}

function pfsenseRuleType(cellValue, options, rowdata, action) {
	var iconClass = 'icon_policy_learn'; // No I18N
	if(cellValue == 'pass' || cellValue == 'accept' || cellValue == 'allow' || cellValue == 'permit') { // No I18N
		iconClass = 'icon_policy_accept'; // No I18N
	} else if(cellValue == 'deny' || cellValue == 'block') { // No I18N
		iconClass = 'icon_policy_deny'; // No I18N
	} else if(cellValue == 'reject') {// No I18N
		iconClass = 'hand'; // No I18N
	}
	var returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconClass + '"/></svg></em><span class="ncmRESTGridTextIcon"></span></div>'; //No I18N
	return returnString;
}

function pfsenseVIPAddress(cellValue, options, rowdata, action) {
	var subnet = rowdata.subnet;
	var subnet_bits = rowdata.subnet_bits;
	var vhid = rowdata.vhid;
	if(subnet_bits != undefined) {
		subnet = subnet + "/" + subnet_bits;
	}
	if(vhid != undefined) {
		subnet = subnet + " (vhid : " + vhid + ")";// No i18N
	}
	return subnet;
}

function pfsenseVIPIntf(cellValue, options, rowdata, action) {
	var cellValue = rowdata['interface'];
	return cellValue;
}

function pfsenseVIPType(cellValue, options, rowdata, action) {
	var returnString = '';
	if(cellValue != undefined) {
		switch(cellValue)
	    {
	        case "ipalias"://No I18N
	        	returnString = "IP Alias";//No I18N
	        break;
	        case "carp"://No I18N
	        	returnString = "CARP";//No I18N
	        break;
	        case "proxyarp"://No I18N
	        	returnString = "Proxy ARP";//No I18N
	        break;
	        case "other"://No I18N
	        	returnString = "Other";//No I18N
	        break;
	        default:
	        	returnString = cellValue;
	    }
	}
	return returnString;
}

function getAliasType(cellValue) {
	var returnString = '';
	if(cellValue != undefined) {
		switch(cellValue)
	    {
	        case "host"://No I18N
	        	returnString = "Host(s)";//No I18N
	        break;
	        case "network"://No I18N
	        	returnString = "Network(s)";//No I18N
	        break;
	        case "port"://No I18N
	        	returnString = "Port(s)";//No I18N
	        break;
	        case "url"://No I18N
	        	returnString = "URL (IPs)";//No I18N
	        break;
	        case "url_ports"://No I18N
	        	returnString = "URL (Ports)";//No I18N
	        break;
	        case "urltable"://No I18N
	        	returnString = "URL Table (IPs)";//No I18N
	        break;
	        case "urltable_ports"://No I18N
	        	returnString = "URL Table (Ports)";//No I18N
	        break;
	        default:
	        	returnString = cellValue;
	    }
	}
	return returnString;
}

function pfSenseScheduleRange(cellValue, options, rowdata, action) {
	var timerange = rowdata.timerange;
	var rangesString = '';
	var DAYS =["","Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; // No i18N
	try {
		if(timerange != undefined && timerange.length > 0) {
			for (var index = 0; index < timerange.length; index++) {
				var range = timerange[index];
				var rangeStr = '';
				if(range.month != undefined && range.day != undefined) {
					var months = range.month.split(',');
					var dates = range.day.split(',');
					if(months.length == dates.length) {
						rangeStr = 'On '; // No i18N
						for (var index1 = 0; index1 < months.length; index1++) {
							var array_element_M = months[index1];
							var array_element_D = dates[index1];
							rangeStr = rangeStr + OPMClient.Settings.monthsarray[array_element_M-1] + ' '  + array_element_D;
							if(index1 < months.length - 2) {
								rangeStr = rangeStr + ', ';
							} else if(index1 < months.length - 1){
								rangeStr = rangeStr + ' and '; // No i18N
							}
						}

						var timehrsplit = range.hour.split('-');
						rangeStr = rangeStr + ' from ' +timehrsplit[0]+ ' to ' +timehrsplit[1]; // No i18N
						rangesString = rangesString + rangeStr + ' / ' + (range.rangedescr ? range.rangedescr : "") + '</br>';// No i18N
					}
				} else if(range.position != undefined) {
					var positions = range.position.split(',');
					if(positions.length > 0) {
						var rangeStr = 'Every '; // No i18N
						for (var index1 = 0; index1 < positions.length; index1++) {
							var array_element = positions[index1];
							rangeStr = rangeStr + DAYS[array_element];
							if(index1 < positions.length - 1) {
								rangeStr = rangeStr + ', ';
							}
						}
						var timehrsplit = range.hour.split('-');
						rangeStr = rangeStr + ' from ' +timehrsplit[0]+ ' to ' +timehrsplit[1]; // No i18N
						rangesString = rangesString + rangeStr + ' / ' + (range.rangedescr ? range.rangedescr : "") + '</br>';// No i18N
					}
				}
			}
		}
	} catch (e) {
	}
	return rangesString;
}

function pfSenseTargetFormatter(cellValue, options, rowdata, action) {
	if(cellValue == 'other-subnet') {
		if(rowdata['targetip']) {
			cellValue = rowdata['targetip'];
			if(rowdata['targetip_subnet']) {
				cellValue += "/" + rowdata['targetip_subnet'];
			}
		}
	}
	if(cellValue == "" && rowdata["interface"]) {
		cellValue = rowdata["interface"].toUpperCase() + " address"; //No I18N
	}
	return cellValue;
}


function pfSenseSourcePort(cellValue, options, rowdata, action) {
	var source = rowdata['source'];
	var port = source ? source.port : undefined;
	if(port == undefined) {
		port = rowdata['sourceport'];
	}
	if(port != undefined && port != "") {
		if(port == "*" || port == "any") {
			return port;
		}
		if(pfSensePortConvertor[port] != undefined) {
			return pfSensePortConvertor[port];
		}
		return port;
	}
	return "*";
}

function pfSensePort(cellValue, options, rowdata, action) {
	var returnString = '';
	if(cellValue != undefined && pfSensePortConvertor[cellValue] != undefined) {
		return pfSensePortConvertor[cellValue];
	}
	if(cellValue != undefined) {
		return cellValue;
	}
	return returnString;
}

function pfSenseInterface(cellValue, options, rowdata, action) {
	var returnString = '';
	if(cellValue != undefined) {
		switch(cellValue)
	    {
	        case "wan"://No I18N
	        	returnString = "WAN";//No I18N
	        break;
	        case "lan"://No I18N
	        	returnString = "LAN";//No I18N
	        break;
	        case "opt1"://No I18N
	        	returnString = "OPT1";//No I18N
	        break;
	        case "op2"://No I18N
	        	returnString = "OP2";//No I18N
	        break;
	        default:
	        	returnString = cellValue;
	    }
	}
	return returnString;
}

function pfSenseDestPort(cellValue, options, rowdata, action) {
	var destination = rowdata['destination'];
	var port = destination ? destination.port : undefined;
	if(port == undefined) {
		port = rowdata['dstport'];
	}
	if(port != undefined && port != "") {
		if(port == "*" || port == "any") {
			return port;
		}
		if(pfSensePortConvertor[port] != undefined) {
			return pfSensePortConvertor[port];
		}
		return port;
	}
	return "*";
}

function pfsensenatport(cellValue, options, rowdata, action) {
	if(cellValue != undefined && cellValue != '') {
		return cellValue;
	}
	return "*";
}

function pfsensestaticnatport(cellValue, options, rowdata, action) {
	if(rowdata['staticnatport'] == undefined) {
		return "Disabled"; // No i18n
	}
	return "Enabled"; // No i18n
}

function pfSenseRuleGateway(cellValue, options, rowdata, action) {
	var returnString = '';
	var gateway = rowdata['gateway'];
	if(gateway != undefined && gateway != 'default' && gateway != "") {
		return gateway;
	}
	return "*";
}

function pfSenseRuleDest(cellValue, options, rowdata, action) {
	var returnString = '';
	var source = rowdata['destination'];
	if(source.any != undefined) {
		return '*';
	}
	if(source.network != '' && source.network != undefined) {
		switch(source.network)
	    {
	        case "wanip"://No I18N
	        	returnString = "WAN Address";//No I18N
	        break;
	        case "lanip"://No I18N
	        	returnString = "LAN Address";//No I18N
	        break;
	        case "pppoe"://No I18N
	        	returnString = "PPPoE Clients";//No I18N
	        break;
	        case "l2tp"://No I18N
	        	returnString = "L2TP Clients";//No I18N
	        break;
	        case "wan"://No I18N
	        	returnString = "WAN net";//No I18N
	        break;
	        case "lan"://No I18N
	        	returnString = "LAN net";//No I18N
	        break;
	        case "(self)"://No I18N
	        	returnString = "This Firewall";//No I18N
	        break;
	    }
	} else if(source.address != '' && source.address != undefined) {
		returnString = source.address;
	}
	if(source.not != undefined) {
		returnString = '!'+ returnString;
	}
	return returnString;
}

function pfSenseRuleSource(cellValue, options, rowdata, action) {
	var returnString = '';
	var source = rowdata['source'];
	if(source.any != undefined) {
		return '*';
	}
	if(source.network != '' && source.network != undefined) {
		switch(source.network)
	    {
	        case "wanip"://No I18N
	        	returnString = "WAN Address";//No I18N
	        break;
	        case "lanip"://No I18N
	        	returnString = "LAN Address";//No I18N
	        break;
	        case "pppoe"://No I18N
	        	returnString = "PPPoE Clients";//No I18N
	        break;
	        case "l2tp"://No I18N
	        	returnString = "L2TP Clients";//No I18N
	        break;
	        case "wan"://No I18N
	        	returnString = "WAN net";//No I18N
	        break;
	        case "lan"://No I18N
	        	returnString = "LAN net";//No I18N
	        break;
	        default:
	        	returnString = source.network;
	    }
	} else if(source.address != '' && source.address != undefined) {
		returnString = source.address;
	}
	if(source.not != undefined) {
		returnString = '!'+ returnString;
	}
	return returnString;
}

function pfSenseProtocolOnly(cellValue, options, rowdata, action) {
	var protocol = rowdata['protocol'];
	if(protocol != undefined) {
		if(pfSenseProtocolConvertor[protocol] != undefined) {
			protocol = pfSenseProtocolConvertor[protocol];
		}
	} else {
		protocol = 'any'; // No I18N
	}
	return protocol;
}

function pfSenseProtocol(cellValue, options, rowdata, action) {
	var ipprotocol = rowdata['ipprotocol'];
	var protocol = rowdata['protocol'];
	if(ipprotocol == 'inet') {//No I18N
		ipprotocol = 'IPv4';//No I18N
	} else if(ipprotocol == 'inet6') {//No I18N
		ipprotocol = 'IPv6';//No I18N
	} else if(ipprotocol == 'inet4+inet6') {//No I18N
		ipprotocol = 'IPv4+IPv6';//No I18N
	}
	if(protocol == null || protocol == undefined || protocol == 'any' || protocol == '') {
		protocol = "*"
	} else if(pfSenseProtocolConvertor[protocol] != undefined){
		protocol = pfSenseProtocolConvertor[protocol];
	}
	var returnString = ipprotocol + ' ' + protocol;
	return returnString;
}

function pfSenseIPProtocol(cellValue, options, rowdata, action) {
	var ipprotocol = rowdata['ipprotocol'];
	if(ipprotocol == 'inet') {//No I18N
		ipprotocol = 'IPv4';//No I18N
	} else if(ipprotocol == 'inet6') {//No I18N
		ipprotocol = 'IPv6';//No I18N
	} else if(ipprotocol == 'inet4+inet6') {//No I18N
		ipprotocol = 'IPv4+IPv6';//No I18N
	} else if(ipprotocol == undefined) {
		ipprotocol = '-';
	}
	return ipprotocol;
}


function formatBooleanEnabled(cellValue, options, rowdata, action) {
	var returnString = '<span><i class="icon-status1"></i>'+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+'</span>'; //No I18N
	if(cellValue != undefined && (cellValue == true || cellValue == 'true')) {
		returnString = '<span><i class="icon-status5"></i>'+Ember.I18n.t('webclient.devices.intftypes.enabled',this)+'</span>'; //No I18N
	}
	return returnString;
}

function formatArubaConfigMode(cellValue, options, rowdata, action) {
	if(cellValue == undefined) {
		cellValue = '';
	}
	if(cellValue.indexOf('PCM_') != -1) {
		cellValue = cellValue.replace(/PCM_/g, "");
	}
	return cellValue;
}

function formatArubalacp_status(cellValue, options, rowdata, action) {
    switch(cellValue)
    {
        case "LAS_DISABLED"://No I18N
        	cellValue = Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
        break;
        case "LAS_ACTIVE"://No I18N
        	cellValue = Ember.I18n.t('opstor.inventory.active',this);//No I18N
        break;
        case "LAS_PASSIVE"://No I18N
        	cellValue = Ember.I18n.t('webclient.ncm.rest.passive',this);//No I18N
        break;
    }
    return cellValue;
}

function formatArubatrunk_mode(cellValue, options, rowdata, action) {
    switch(cellValue)
    {
        case "PTT_TRUNK"://No I18N
        	cellValue = "Trunk";//No I18N
        break;
        case "PTT_LACP"://No I18N
        	cellValue = "LACP";//No I18N
        break;
        case "PTT_NONE"://No I18N
        	cellValue = Ember.I18n.t('jsp.commonstr.None',this);//No I18N
        break;
    }
    return cellValue;
}

function formatArubaVlanStatus(cellValue, options, rowdata, action) {
	switch(cellValue)
    {
        case "VS_PORT_BASED"://No I18N
        	cellValue = Ember.I18n.t("webclient.ncm.port.based",this);//No I18N
        break;
        case "VS_PROTOCOL_BASED"://No I18N
        	cellValue = Ember.I18n.t("webclient.ncm.protocol.based",this);//No I18N
        break;
        case "VS_DYNAMIC"://No I18N
        	cellValue = Ember.I18n.t('webclient.ncm.dynamic',this);//No I18N
        break;
    }
    return cellValue;
}

function formatArubaVlanType(cellValue, options, rowdata, action) {
	if(cellValue == undefined) {
		cellValue = '';
	}
	if(cellValue.indexOf('VT_') != -1) {
		cellValue = cellValue.replace(/VT_/g, "");
	}
	return cellValue;
}

function formatArubaport_mode(cellValue, options, rowdata, action) {
	cellValue = rowdata.port_mode;
	if(cellValue == undefined) {
		cellValue = '';
	}
	if(cellValue.indexOf('POM_') != -1) {
		cellValue = cellValue.replace(/POM_/g, "");
	}
	return cellValue;
}

function arista_ad_routetype(cellValue, options, rowdata, action) {
	var returnString = '';
	var routeType = rowdata.routeType;
	if(routeType != undefined) {
		if(routeType.suppressed == true) {
			returnString = returnString + "s "//No I18N
		}
		if(routeType.valid == true) {
			returnString = returnString + "* "//No I18N
		}
		if(routeType.active == true) {
			returnString = returnString + "> "//No I18N
		}
		if(routeType.ecmpHead == true) {
			returnString = returnString + "E "//No I18N
		}
		if(routeType.ecmp == true) {
			returnString = returnString + "e "//No I18N
		}
		if(routeType.stale == true) {
			returnString = returnString + "S "//No I18N
		}
		if(routeType.ecmpContributor == true) {
			returnString = returnString + "c "//No I18N
		}
		if(routeType.backup == true) {
			returnString = returnString + "b "//No I18N
		}
	}
	return returnString;
}

function arista_ad_path(cellValue, options, rowdata, action) {
	var returnString = cellValue;
	var asPathEntry = rowdata.asPathEntry;
	if(asPathEntry != undefined) {
		if(asPathEntry.asPath != undefined) {
			returnString = asPathEntry.asPath;
		}
	}
	return returnString;
}

function formatPanOSScheduleRecurrence(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata['schedule-type'] != undefined) {
		var scheduleType = rowdata['schedule-type'];//No I18N
		if(scheduleType.recurring != undefined) {
			var recurring = scheduleType.recurring;
			if(recurring.daily != undefined) {
				returnString = Ember.I18n.t('webclient.general.Daily',this);//No I18N
			}
			if(recurring.weekly != undefined) {
				returnString = Ember.I18n.t('webclient.admin.schedulereports.weekly',this);//No I18N
			}
		} else if(scheduleType['non-recurring'] != undefined) {//No I18N
			returnString = Ember.I18n.t('webclient.admin.devices.None',this);//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOsLocation(cellValue, options, rowdata, action)
{
	cellValue = rowdata['@location']; //No I18N
	if(cellValue == 'vsys') {
		cellValue = rowdata['@vsys'];//No I18N
	}
	setFormattedData(rowdata, options, cellValue);
	return cellValue;
}

function formatPanOSScheduleTimes(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata['schedule-type'] != undefined) {
		var scheduleType = rowdata['schedule-type'];//No I18N
		if(scheduleType.recurring != undefined) {
			var recurring = scheduleType.recurring;
			if(recurring.daily != undefined) {
				returnString = formatPanOSListString(recurring.daily);
			}
			if(recurring.weekly != undefined) {
				var weekly = recurring.weekly;
				for (var dayStr in weekly) {
					var dayString = '';
					var dayTimes = weekly[dayStr];
					if(dayTimes != undefined && dayTimes.member != undefined) {
						for(var i = 0; i < dayTimes.member.length; i++) {
							var data = dayTimes.member[i];
							if(i!=0) {
								dayString = dayString + ', ';
							}
							dayString = dayString + data;
						}
					}
					returnString += "<div>" + dayStr + " : "+ dayString +" </div>";
				}
			}
		} else if(scheduleType['non-recurring'] != undefined) {//No I18N
			returnString = formatPanOSListString(scheduleType['non-recurring']);//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanosAddrValue(cellValue, options, rowdata, action)
{
	var returnString = '';
	if(rowdata['ip-netmask'] != undefined && rowdata['ip-netmask'] != '') {
		returnString = rowdata['ip-netmask'];//No I18N
	} else if(rowdata['ip-range'] != undefined && rowdata['ip-range'] != '') {//No I18N
		returnString = rowdata['ip-range'];//No I18N
	} else if(rowdata['ip-wildcard'] != undefined && rowdata['ip-wildcard'] != '') {//No I18N
		returnString = rowdata['ip-wildcard'];//No I18N
	} else if(rowdata.fqdn != undefined && rowdata.fqdn != '') {
		returnString = rowdata.fqdn;
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatCheckUndefined(cellValue, options, rowdata, action)
{
	var returnString = "none"; //No I18N
	if(cellValue != undefined) {
		returnString = cellValue;
	}
	return returnString;
}

function formatCheckUndefinedHiphen(cellValue, options, rowdata, action)
{
	var returnString = "-"; //No I18N
	if(cellValue != undefined) {
		returnString = cellValue;
	}
	return returnString;
}

function formatCheckUndefinedBlank(cellValue, options, rowdata, action)
{
	var returnString = ""; //No I18N
	if(cellValue != undefined) {
		returnString = cellValue;
	}
	return returnString;
}

function formatNotNULL(cellValue, options, rowdata, action)
{
	var returnString = "-"; //No I18N
	if(cellValue != undefined && 'null' != cellValue) {
		returnString = cellValue;
	}
	return returnString;
}

function formatPanOSListString(cellValue, options, rowdata, action) {
	var ret = ""; //No I18N
	if(rowdata) {
		var colName = options.colModel.name;
		cellValue = rowdata[colName.replace('_ncmsuffix', '')];
	}
	if(cellValue != null && cellValue.member != null) {
		for(var i = 0; i < cellValue.member.length; i++) {
			var data = cellValue.member[i];
			if(data != undefined && data != '') {
				ret += "<div>" + data + "</div>";
			}
		}
	}
	setFormattedData(rowdata, options, ret);
	return ret;
}

function formatPanOSZoneList(cellValue, options, rowdata, action) {
	return addPanOSIconsToList(cellValue, options, rowdata, action, 'icon_pan-OS-zone'); //No I18N
}

function formatPanOSAddressList(cellValue, options, rowdata, action) {
	return addPanOSIconsToList(cellValue, options, rowdata, action, 'icon_pan-OS-address'); //No I18N
}

function formatPanOSUserList(cellValue, options, rowdata, action) {
	return addPanOSIconsToList(cellValue, options, rowdata, action, 'icon_pan-OS-'); //No I18N
}

function formatPanOSApplicationList(cellValue, options, rowdata, action) {
	return addPanOSIconsToList(cellValue, options, rowdata, action, 'icon_pan-OS-application'); //No I18N
}

function formatPanOSServiceList(cellValue, options, rowdata, action) {
	return addPanOSIconsToList(cellValue, options, rowdata, action, 'icon_pan-OS-service'); //No I18N
}

function formatPanOSService(cellValue, options, rowdata, action) {
	var ret = cellValue; //No I18N
	setFormattedData(rowdata, options, cellValue);
	ret = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_pan-OS-service"/></svg></em><span class="ncmRESTGridTextIcon">' + ret  + '</span></div>'; //No I18N
	return ret;
}

function formatPanOSApplication(cellValue, options, rowdata, action) {
	var returnString = "none"; //No I18N
	if(cellValue != undefined) {
		returnString = cellValue;
	}
	setFormattedData(rowdata, options, returnString);
	if(cellValue != undefined) {
		returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_pan-OS-application"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	}
	return returnString;
}

function formatPanOSSchedule(cellValue, options, rowdata, action) {
	var returnString = "none"; //No I18N
	if(cellValue != undefined) {
		returnString = cellValue;
	}
	setFormattedData(rowdata, options, returnString);
	if(cellValue != undefined) {
		returnString = '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#icon_pan-OS-schedule"/></svg></em><span class="ncmRESTGridTextIcon">' + returnString  + '</span></div>'; //No I18N
	}
	return returnString;
}

function addPanOSIconsToList(cellValue, options, rowdata, action, iconName) {
	var returnString = formatPanOSListString(cellValue, options, rowdata, action);

	var colName = options.colModel.name;
	var actualCol = colName.replace('_ncmsuffix', '');
	var negateCol = "negate-" + actualCol; // No I18N
	var negate = rowdata && rowdata[negateCol] == 'yes'; //No I18N

	var arr = returnString.split("<div>").join("").split("</div>"); //No I18N
	returnString = "";
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == '') {
			continue;
		}
		if(arr[i] == 'any') {
			returnString += '<div>' + arr[i] + '</div>'; //No I18N
		} else {
			returnString += '<div><em class="svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#' + iconName + '"/></svg></em><span class="ncmRESTGridTextIcon' + (negate ? ' strikethrough' : '') + '">' + arr[i]  + '</span></div>'; //No I18N
		}
	}
	return returnString;
}

function formatPanOSSourceTranslation(cellValue, options, rowdata, action) {
	var returnString = ''; //No I18N
	if(rowdata['source-translation'] != undefined) { //No I18N
		var translationData = rowdata['source-translation']; //No I18N
		var translatedAddress = null;
		if(translationData["dynamic-ip"]) { //No I18N
			returnString += "<div>dynamic-ip</div>";//No I18N
			translatedAddress = translationData["dynamic-ip"]["translated-address"]; //No I18N
			returnString += formatPanOSListString(translatedAddress);
		} else if(translationData["static-ip"]) { //No I18N
			returnString += "<div>static-ip</div>";//No I18N
			var data = translationData["static-ip"]; //No I18N
			translatedAddress = data["translated-address"]; //No I18N
			returnString += "<div>" + translatedAddress + "</div>";//No I18N
			returnString += "<div>bi-directional: " + data["bi-directional"] + "</div>";//No I18N
		} else if(translationData["dynamic-ip-and-port"]) { //No I18N
			returnString += "<div>dynamic-ip-and-port</div>";//No I18N
			translatedAddress = translationData["dynamic-ip-and-port"]["translated-address"]; //No I18N
			returnString += formatPanOSListString(translatedAddress);
		}
	} else  {
		returnString = "<div>none</div>";//No I18N
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSDestTranslation(cellValue, options, rowdata, action) {
	var returnString = '';
	var key = null;
	if(rowdata['destination-translation'] != undefined) { //No I18N
		key = 'destination-translation'; //No I18N

	} else if(rowdata['dynamic-destination-translation'] != undefined) { //No I18N
		key = 'dynamic-destination-translation'; //No I18N
	} else  {
		returnString = "<div>none</div>";//No I18N
		setFormattedData(rowdata, options, returnString);
		return returnString;
	}
	var translationData = rowdata[key];
	var translatedPort = translationData["translated-port"]; //No I18N
	var translatedAddress = translationData["translated-address"]; //No I18N

	returnString += "<div>" + key + "</div>";//No I18N
	returnString += "<div>address: " + translatedAddress + "</div>";//No I18N
	returnString += "<div>port: " + translatedPort + "</div>";//No I18N
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSQOSClass(cellValue, options, rowdata, action) {
	var returnString = "<div>" + rowdata.action['class'] + "</div>"; //No I18N
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSDSCP_TOS(cellValue, options, rowdata, action) {
	var returnString = '';
	if(rowdata['dscp-tos']) { //No I18N
		var data = rowdata['dscp-tos']; //No I18N
		if(data.any) {
			returnString = "<div>any</div>";//No I18N
			setFormattedData(rowdata, options, returnString);
			return returnString;
		}

		var entries = data.codepoints.entry;
		var codepoints = [];
		if(entries) {
			for(var i = 0; i < entries.length; i++) {
				var entry = entries[i];
				codepoints.push(entry['@name']); //No I18N
			}
			returnString = "<div>" + codepoints.join() + "</div>";//No I18N
		}
	} else {
		returnString = "<div>none</div>";//No I18N
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfZoneInterface(cellValue, options, rowdata, action) {
	var returnString = '';//No I18N
	if(rowdata.from) {
		var data = rowdata.from;
		var key = 'zone'; //No I18N
		if(data['interface']) {//No I18N
			key = 'interface';//No I18N
		}
		returnString = formatPanOSListString(data[key]);
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfAction(cellValue, options, rowdata, action) {
	var returnString = '';//No I18N
	var data = rowdata.action;
	if(data) {
		if(data.discard) {
			returnString = "<div>discard</div>";//No I18N
		}
		if(data.forward) {
			returnString = "<div>forward</div>";//No I18N
		}
		returnString = "<div>no-pbf</div>";//No I18N
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfEgress(cellValue, options, rowdata, action) {
	var returnString = '';//No I18N
	var data = rowdata.action;
	if(data && data.forward) {
		var egress = data.forward['egress-interface']; //No I18N
		if(egress) {
			returnString = "<div>" + egress + "</div>";//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfNextHop(cellValue, options, rowdata, action) {
	var returnString = '<div>none</div>';//No I18N
	var data = rowdata.action;
	if(data && data.forward) {
		var nexthop = data.forward.nexthop;
		if(nexthop) {
			if(nexthop['ip-address']) {//No I18N
				returnString = "<div>" + nexthop['ip-address'] + "</div>";//No I18N
			} else if(nexthop.fqdn) {//No I18N
				returnString = "<div>" + nexthop.fqdn + "</div>";//No I18N
			}
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfEnforceSymmetricRet(cellValue, options, rowdata, action) {
	var returnString = '<div>false</div>';//No I18N
	if(rowdata['enforce-symmetric-return']) { //No I18N
		var data = rowdata['enforce-symmetric-return'];  //No I18N
		if(data.enabled && data.enabled.toLowerCase != 'no') { //No I18N
			returnString = '<div>true</div>';//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSpbfMonitor(cellValue, options, rowdata, action) {
	var returnString = '<div>none</div>';//No I18N
	var colName = options.colModel.name;
	if(colName == 'Monitor_Disable') { //No I18N
		returnString = '<div>false</div>';//No I18N
	}
	var data = rowdata.action;
	if(data && data.forward && data.forward.monitor) {
		data = data.forward.monitor;
		if(colName == 'Monitor_Disable' && data['disable-if-unreachable'] && data['disable-if-unreachable'].toLowerCase() == 'yes') {//No I18N
			returnString = '<div>true</div>';//No I18N
		} else if(colName == 'Monitor_Profile' && data.profile) {//No I18N
			returnString = '<div>' + data.profile + '</div>';//No I18N
		} else if(colName == 'Monitor_Target' && data['ip-address']) {//No I18N
			returnString = '<div>' + data['ip-address'] + '</div>';//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanOSDecryptType(cellValue, options, rowdata, action) {
	var returnString = '<div>none</div>';//No I18N
	var data = rowdata.type;
	if(data) {
		if(data['ssl-forward-proxy']) { //No I18N
			returnString = '<div>ssl-forward-proxy</div>';//No I18N
		}
		if(data['ssh-proxy']) { //No I18N
			returnString = '<div>ssh-proxy</div>';//No I18N
		}
		if(data['ssl-inbound-inspection']) { //No I18N
			returnString = '<div>ssl-inbound-inspection</div>';//No I18N
		}
	}
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function formatPanosHiddenName(cellValue, options, rowdata, action) {
	return rowdata['@name'];//No I18N
}

function formatFOExtrnIPRange(cellValue, options, rowdata, action) {
	var returnString = rowdata.startip + ' - ' + rowdata.endip;//No I18N
	setFormattedData(rowdata, options, returnString);
	return returnString;
}

function setFormattedData(rowdata, options, value) {
	if(rowdata) {
		rowdata[options.colModel.name] = value.split("<div>").join("").split("</div>").join("\r\n");
	}
}

function formatAristaPreferenceMetric(cellValue, options, rowdata, action) {
	if(rowdata.preference == undefined) {
		rowdata.preference = "N.A."; //No I18N
	}
	if(rowdata.metric == undefined) {
		rowdata.metric = "N.A."; //No I18N
	}
	return rowdata.preference + " / " + rowdata.metric;
}

function formatAristaVias(cellValue, options, rowdata, action) {
	if(!rowdata.vias || rowdata.vias.length == 0) {
		return "-";
	}
	var returnValue = "";
	for(var i = 0; i < rowdata.vias.length; i++) {
		var interf = rowdata.vias[i]["interface"];
		var nha = rowdata.vias[i]["nexthopAddr"];
		if(nha == undefined || nha == "") {
			nha = "N.A."; //No I18N
		}
		returnValue += "<div>Interface: " + interf + " Next Hop: " + nha + "</div>"; //No I18N
	}
	return returnValue;
}

function formatAristaACLSqNo(cellValue, options, rowdata, action) {
	rowdata.seqno = rowdata.sequenceNumber;
	return rowdata.sequenceNumber;
}

// NCM REST API Grid Formatters End

function billPlanAction(cellValue, options, rowdata, action) {
    var deleteHtml = "<i class='icon-trash delete' style='margin:0 7px; font-size:16px; cursor:pointer;' title='Delete service plan' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='deleteServicePlan("+rowdata.servicePlanID+")'></i>";
    if(!rowdata.canDelete) {
        deleteHtml = "<i class='icon-trash delete icon-disabled' style='margin:0 7px; font-size:16px; cursor:pointer;' title='Dissociate all customers from this service plan to enable delete' style='margin-left:20px; font-size:16px; cursor:pointer;'></i>";
    }
    return "<i style='float:left;font-size: 16px' class='pointer icon-configedit' title='"+Ember.I18n.t('webclient.action.edit',this)+"' onclick='editServicePlan(" +rowdata.servicePlanID+ ")'></i>" + deleteHtml; //No I18n
}

function billPaidFormatter(cellValue, options, rowdata, action) {
    if(rowdata.paid) {
        return "<span class='table-legend paid'></span>";
    }
    return "<span class='table-legend unpaid'></span>";
}

function setStatus(cellValue, options, rowdata, action){
    if(cellValue != undefined && cellValue > -1){
        var key = ['','webclient.ncm.clientserver.config.severity.Critical','webclient.ncm.clientserver.config.severity.Trouble',//No I18N
                    'webclient.ncm.clientserver.config.severity.Attention','webclient.ncm.clientserver.config.severity.ServiceDown',//No I18N
                    'webclient.threshold.normal','','webclient.map.flash.Unknown'];//No I18N
        return "<i class='--fault-severity icon-status"+cellValue+"'></i>"+Ember.I18n.t(key[cellValue],this);//No I18N
    }return "";
}
function setIPMIManagingServerAction(cellValue, options, rowdata, action){
    var virtualType = 'IPMI';//No I18N
    if(rowdata.isMonitored == true){
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite){
            return "<i class='icon-stop pointer d-inline' onclick = 'opm_stopMonitoring(\""+opm_escapeHTML(rowdata.managedServerID)+"\",\""+virtualType+//No I18N
            "\",this)'></i><span class='monitorStatus'>"+Ember.I18n.t('webclient.common.stop',this)+"</span>";//No I18N
        }else{
            return "";//No I18N
        }
    }else{
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.discoveryWrite){
            return "<i class='icon-start pointer d-inline' onclick = 'opm_startMonitoring(\""+opm_escapeHTML(rowdata.serverName)+"\",\""+opm_escapeHTML(rowdata.managedServerID)+"\",\""+//No I18N
            opm_escapeHTML(rowdata.ipmiID)+"\",\""+virtualType+"\",this)'></i><span class='monitorStatus'>"+Ember.I18n.t('webclient.devices.intftypes.start',this)+"</span>";//No I18N
        }else{
            return "";//No I18N
        }
    }
}
function setIPMIHWInfoValue(cellValue, options, rowdata, action){
    var iconClass = 'icon-status5';//No I18N
    var statusLabel = Ember.I18n.t('webclient.fwa.snmp.disable.now',this);//No I18N
    var status = 'Disable';//No I18N
    rowdata.value = opm_escapeHTML(rowdata.value);
    if(rowdata.formatterFlag != undefined && (!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite && window.OPM.isOpmPlug)){
        if(rowdata.formatterFlag == 'IS_MONITORED'){
            if(rowdata.value == "false"){
                iconClass = 'icon-status1';//No I18N
                statusLabel = Ember.I18n.t('ncm.device.summary.enablenow',this);//No I18N
                status = 'Enable';//No I18N
            }
            return "<i class="+iconClass+" id='hardwarestatusIconIPMI'></i><a id='HwstatusIPMI' value='"+status+"' href='javascript:HwChangeStatus(true);'>"+statusLabel+"</a>";//No I18N
        }else if(rowdata.formatterFlag == 'HW_INTERVAL'){//No I18N
            iconClass = "<span name='hwareText' id='hwareText' >"+rowdata.value+"</span><span name='hwareText' style='margin-left:-9px' onclick='toggleInterval()' class='pointer icon-configedit'></span>";//No I18N
            var textbox = "<input type='text' name='HWInterval' class='hwWidgetIntervalText'  name='HWInterval' id='HWInterval' value="+rowdata.value+"></input>";//No I18N
            var saveButton = "<input type='button'  Onclick='hwInterval();toggleInterval()' name='HWInterval' class='hwWidgetSaveBtn'  value ="+Ember.I18n.t('webclient.enduser.Save',this)+"></input>";//No I18N
            var cancelButton = "<input type='button'  Onclick='toggleInterval()' name='HWInterval' class='hwWidgetCancelBtn'  value ="+Ember.I18n.t('webclient.action.Cancel',this)+"></input>";//No I18N
            return iconClass + textbox + saveButton + cancelButton;
        }
    }
    return rowdata.value;
}
function snapshotRedirectionUsingIP(cellValue, options, rowdata, action){
    if(rowdata.isMonitored == true){
        return "<span class='opm_link pointer' onclick='redirectToDeviceSnapshot(\""+opm_escapeHTML(rowdata.moName)+"\")'>"+opm_escapeHTML(rowdata.ipAddress)+"</span>";//No I18N
    }else{
        var title = Ember.I18n.t('webclient.tab.ipmi.summary.managing.servers.host.notmonitored.title',this); //No I18N
        var reason =Ember.I18n.t('webclient.tab.ipmi.summary.managing.servers.host.notmonitored.content',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' onclick='helpcard2Click(this)' data-align='left' data-title='"+title+ "' data-content1='"+ reason+ "'></a>";//No I18N
        return opm_escapeHTML(rowdata.ipAddress) + info;
    }
}
function setMappedDeviceName(cellValue, options, rowdata, action){
    if(cellValue != 'Not Available'){
        return opm_escapeHTML(cellValue);
    }else{
        var title = Ember.I18n.t('webclient.tab.ipmi.summary.managing.servers.host.notavail.title',this); //No I18N
        var reason =Ember.I18n.t('webclient.tab.ipmi.summary.managing.servers.host.notavail.content',this); //No I18N
        var info = "<a class='hasHelpCard hasHelpCard2' tabindex='0' onclick='helpcard2Click(this)' data-align='left' data-title='"+title+ "' data-content1='"+ reason+ "'></a>";//No I18N
        return cellValue + info;
    }
}
function gotoMerakiController(cellValue, options, rowdata)
{
    if(rowdata.orgMOName !== undefined)
    {
        return "<a href='javascript:redirectToDeviceSnapshot(\""+opm_escapeHTML(rowdata.orgMOName)+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
    }
    else{
        return escapeHtmlTags(cellValue);
    }
}
function gotoMerakiControllerSummaryWidget(cellValue, options, rowdata)
{
    if(rowdata.orgMOName !== undefined)
    {
        return "<a href='javascript:redirectToDeviceSnapshot(\""+rowdata.orgMOName+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
    }
    else if(rowdata[0] !== undefined)
    {
        return "<a href='javascript:redirectToDeviceSnapshot(\""+opm_escapeHTML(rowdata[0])+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
    }
    else{
        return escapeHtmlTags(cellValue);
    }
}

function statusColorIcon(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> "+rowdata.statusStr;//No I18N
}
function routerTunnelstatusColorIcon(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> "+rowdata.tunnelState;//No I18N
}
function opm_merakiRogueReport(cellvalue, options, rowdata)
{
   return "<div class='ssidName'><a href='javascript:redirectToDeviceSnapshot(\""+rowdata.orgName+"\")'>"+escapeHtmlTags(rowdata.orgDisplayName)+"</a> ("+rowdata.count+")</div>";//No I18N
}
function displayMonitorPath(cellValue, options, rowdata, action){
    return "<span>"+encodeURI(cellValue.replace(/\s/g,""))+"</span>";//No I18N
   }


 var criteriaParams = {RESOURCENAME :"webclient.common.intro.Hostname", //No I18N
						 ADDRESS :"opstor.inventory.ipaddress", //No I18N
						 VENDORNAME :"ncm.acd.Vendor", //No I18N
						 DEVICE_TEMPLATE :"jsp.report.customreports.devicetemplate", //No I18N
						 SERIES :"webclient.common.series", //No I18N
						 MODEL :"webclient.snapshot.hardware.model", //No I18N
						 OSVERSION :"webclient.snapshot.hardware.osversion", //No I18N
						 COLUMNVALUE1 :"ncm.CustomColumn1", //No I18N
						 COLUMNVALUE2 :"ncm.CustomColumn2", //No I18N
						 COLUMNVALUE3 :  "ncm.CustomColumn3"}; //No I18N
 var criteriaConditions = {EQUAL :	"webclient.admin.traps.equals", //No I18N
							 NOT_EQUAL :	"webclient.admin.traps.notequals", //No I18N
							 LIKE :	"webclient.map.foldermonitor.select.filterfilecontains", //No I18N
							 NOT_LIKE :	"webclient.admin.traps.notcontains", //No I18N
							 STARTS_WITH :	"fwa.search.starts.with", //No I18N
							 ENDS_WITH  :	"fwa.search.ends.with", //No I18N
	 						 IP_RANGE : "webclient.layer.discovery.iprange"}; //No I18N

function formatCredRuleCriteria(cellValue, rowdata) {
	if(rowdata.DEVICE_CRI_TYPE == 'CRITERIA') {
		var ret = '<div class="ruleCriteria">'; //No I18N
		if(cellValue.criteriaDetails) {
			var criterias = cellValue.criteriaDetails;
			for(var i = 0; i < criterias.length; i++) {
				var criteria = criterias[i];
				if(i != 0) {
					ret += '<span>' + escapeHTML(criteria.Comparator.toUpperCase()) + '</span>'; //No I18N
					ret += ' '; //No I18N
				}
	            var criteriaField = criteria.Field;
	            if(criteriaField.includes("COLUMNVALUE") && criteria.ColumnName != undefined && criteria.ColumnName != ''){
	                ret += '<i>' + criteria.ColumnName + '(' + Ember.I18n.t(criteriaConditions[criteria.Condition], this) + ')' + ': </i>'; //No I18N
	            }else{
	                ret += '<i>' + Ember.I18n.t(criteriaParams[criteria.Field], this) + '(' + Ember.I18n.t(criteriaConditions[criteria.Condition], this) + ')' + ': </i>'; //No I18N
	            }
				ret += escapeHTML(criteria.Value);
				ret += ' '; //No I18N
			}
		}
		ret += '</div>'; //No I18N
		return ret;
	} else {
		var ret = '<div class="ruleCriteria"><i>' + Ember.I18n.t('webclient.opm.devicegroup') + ': </i>'; //No I18N
		if(cellValue.selectedDG) {
			var deviceGroups = cellValue.selectedDG;
			for(var i = 0; i < deviceGroups.length; i++) {
				ret += deviceGroups[i].hostName;
				if(i != (deviceGroups.length - 1)) {
					ret += ', '; //No I18N
				}
			}
		}
		ret += '</div>'; //No I18N
		return ret;
	}
}

function formatCredRuleAction(cellValue, rowdata) {
	var actions = "";
	if(window.OPM.userPermissions.ncmConfigAutomationWrite) {
	    actions += '<div class="chkRoundBtn style2 type2 small pointer" title="' + Ember.I18n.t("webclient.ncm.credRule.toggle.status") + '" style="top:5px"><div style="margin-right:0;"><input type="checkbox" ' + (rowdata.STATUS ? 'checked' : '') +  ' onchange="OPMClient.NCMConfigAutomationModel.changeCredentialRuleStatus(this,' + rowdata["id"] + ')"/><label></label></div></div>'; //No I18N
		actions += '<div class="criteriaEditIcon  pointer" title="' + Ember.I18n.t("webclient.admin.re.editre") + '" onclick="OPMClient.NCMConfigAutomationModel.editCredentialRule(' + rowdata["id"] + ')"></div>'; //No I18N
        actions += '<div class="criteriaFilterIcon  pointer" title="' + Ember.I18n.t("webclient.ncm.credRule.run.through.desc") + '" onclick=OPMClient.NCMConfigAutomationModel.runCredentialRule(' + rowdata["id"] + ')></div>'; //No I18N
	}
	actions += '<i class="icon-sm-servicemonitor  pointer" style="margin-right:5px;top:6px;" title="' + Ember.I18n.t("webclient.fwa.audit.log") + '" onclick=OPMClient.NCMConfigAutomationModel.showCredRuleAuditHistory(' + rowdata["id"] + ')></i>'; //No I18N
	if(window.OPM.userPermissions.ncmConfigAutomationWrite) {
		actions += '<div class="criteriaDeleteIcon  pointer" title="' + Ember.I18n.t("webclient.devices.customfields.delete") + '" onclick=OPMClient.NCMConfigAutomationModel.deleteCredentialRule(' + rowdata["id"] + ')></div>'; //No I18N
	}
	return actions;
}
function networkPathActions(cellValue, options, rowdata, action){
     if(cellValue=="true"){
            var stateBtn = "<div class='chkRoundBtn gridchk'><input type='checkbox' title='"+Ember.I18n.t("webclient.action.unmanage")+"' onclick='opm_manageNetworkPath(this,&#39;"+rowdata.moID+"&#39;,&#39;"+cellValue+"&#39;)' checked name=''><label></label></div>";//No I18N
    }
    else {
             var stateBtn = "<div class='chkRoundBtn gridchk'><input type='checkbox' title='"+Ember.I18n.t("webclient.inventory.manage")+"' onclick='opm_manageNetworkPath(this,&#39;"+rowdata.moID+"&#39;,&#39;"+cellValue+"&#39;)' name=''><label></label></div>";//No I18N
    }
    if(rowdata.sourceMOName !== undefined || rowdata.source === "127.0.0.1")
    {
       stateBtn = stateBtn+"<i class='discIcon discEditIcon' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='editNetworkPath(&#39;"+rowdata.moID+"&#39;)'></i><i class='discIcon discDeleteIcon' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick='opm_deleteNetworkPaths(&#39;"+rowdata.moID+"&#39;)'></i>"; //No I18n
    }
    else{
        stateBtn = "<div class='chkRoundBtn gridchk btn-disabled'><input type='checkbox' title='"+Ember.I18n.t("webclient.inventory.manage")+"' name=''  onclick='javascript:return false' ><label></label></div>";//No I18N
        stateBtn = stateBtn+"<i class='discIcon discEditIcon btn-disabled' style='margin-left:20px; font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.title.edit',this)+"'></i><i class='discIcon discDeleteIcon' style='font-size:16px; cursor:pointer;' title='"+Ember.I18n.t('webclient.devices.customfields.delete',this)+"' onclick='opm_deleteNetworkPaths(&#39;"+rowdata.moID+"&#39;)'></i>"; //No I18n
    }
    return stateBtn;
}
function networkPathStatus(cellValue, options, rowdata, action)
{
    return "<span><i class='--fault-severity icon-status"+rowdata.status+"'></i> "+statusAsTxt[Number(rowdata.status)-1]+"</span>";//No I18N
}
function networkPathGraphView(cellValue, options, rowdata, action)
{
    var pathid= window.OPM.isCentralServer && rowdata.probeID !== undefined ? rowdata.moID+"_"+rowdata.probeID : rowdata.moID;//No I18N
 
      return "<span title='"+escapeHTML(cellValue)+"'><a href='#/Settings/Monitors/NetworkPathAnalysis/Profile/"+pathid+"'\"' class='opm_link'>"+escapeHTML(cellValue)+"</a></span>"; //No I18N
}
function cellValueEscapeFormat(cellValue, options, rowdata, action)
{
    return escapeHTML(cellValue);
}
function monitorPofileActions(cellValue,options,rowdata,action){
    var edit = "<span class='icon-configedit OpMToolTip pointer' title="+Ember.I18n.t('webclient.title.edit',this)+ //No I18n
    " onclick='editMonitorProfile(\""+rowdata.monitorGroupID+"\")' style='float:left;font-size:14px;margin-left:0px !important'></span>";//No I18n

    var del = '';
    if(rowdata.isDefault){
        del = "<span class='icon-trash delete OpMToolTip pointer disabledBlock' style='float:left;font-size:15px'></span>";//No I18n
    }else{
        del = "<span class='icon-trash delete OpMToolTip pointer' title="+Ember.I18n.t('webclient.devices.customfields.delete',this)+ //No I18n
    " onclick='deleteMonitorProfile(\""+rowdata.monitorGroupID+"\")' style='float:left;font-size:15px'></span>";//No I18n
    }

    return edit + del;
}
function monProfileEditThreshold(cellValue,options,rowdata,action){
    var currentMonitorType = window.OPM.currentView.handler.controller.model.currentMonitorType;
    var currentId = currentMonitorType+'_'+rowdata[getMonitorTypeIdforMonitorType(currentMonitorType)].toString();
    var edit = "<span id='"+currentId+"' class='icon-configedit OpMToolTip disabledBlock pointer' title="+Ember.I18n.t('webclient.title.edit',this)+ //No I18n
    " style='float:left;font-size:14px;margin-left:15px !important'></span>";//No I18n

    return edit;
}
function testMonitorStatus(cellValue,options,rowdata,action){
    if(rowdata.Protocol == "DATA_INGESTION") {
        return '<a class="disabledBlock textLink" title="Test Monitor" tabindex="0" role="link">'+ Ember.I18n.t('webclient.snapshot.testlinks.testmonitor') + '</a>'; // NO I18N
    }
    var returnString = '<i class="testMonitorProcess"><img src="/apiclient/fluidicv2/img/refresh_loader.gif"/></i> '+Ember.I18n.t('opu.common.IN_PROGRESS');//No I18n
    var displayString = Ember.I18n.t('webclient.snapshot.testlinks.testmonitor');//No I18N
    if(rowdata.testStatusStr === undefined){
        returnString = "<a class='pointer textLink viewDetails' onclick=testPerformanceMonitor('"+options.gid+"',"+options.rowId+") title='"+displayString+"' tabindex='0' role='link'>"+displayString+"</a>";//No I18n
    }else if(rowdata.testStatusStr === 'passed'){
        displayString = Ember.I18n.t('webclient.credential.snmp.passed');//No I18N
        returnString = '<i class="thresholdstatusnormal" title="'+displayString+'"></i><i title="'+displayString+'">'+displayString+'<a class="pointer textLink viewDetails" onclick=viewPerfMonitorTestFailureReasons("'+options.gid+'",'+options.rowId+',this) title="'+Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.view.data')+'" tabindex="0" role="link">'+' ('+Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.view.data')+')</a></i>';//No I18n
    }else if(rowdata.testStatusStr === 'failed'){
        displayString = Ember.I18n.t('webclient.credential.snmp.failed');//No I18N
        returnString = '<i class="thresholdstatusviolated" title="'+displayString+'"></i><i title="'+displayString+'">'+displayString+'<a class="pointer textLink viewDetails" onclick=viewPerfMonitorTestFailureReasons("'+options.gid+'",'+options.rowId+',this) title="'+Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.view.reasons')+'" tabindex="0" role="link">'+' ('+Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.view.reasons')+')</a></i>';//No I18n
    }
    return returnString;
}
function setAppMonitorIntervalField(cellValue, options, rowdata, action){
    var graphid = rowdata.graphid;
    if(graphid === undefined){
        graphid = $('#'+options.gid).getCell(options.rowId,'graphid');//No I18N
    }
    var textboxId = 'interval_'+graphid;//No I18n
    var interval = (cellValue !== 'N/A') ? cellValue : '';//No I18n
    return "<input type='text' maxLength='4' class='numberCheck appMonitorTextbox disabledBlock' size='5' value='"+interval+"' id='"+textboxId+//No I18n
    "' onblur='saveAppMonitorConfig(\""+textboxId+"\",\""+options.rowId+"\")' placeholder='"+Ember.I18n.t('webclient.Mins',this)+"'/>"; //No I18n
}
function setAppMonitorThresholdField(cellValue, options, rowdata, action){
    var graphid = rowdata.graphid;
    if(graphid === undefined){
        graphid = $('#'+options.gid).getCell(options.rowId,'graphid');//No I18N
    }
    var thresholdValue = (cellValue !== 'N/A') ? cellValue : '';//No I18n
    var textboxId = 'thresholdValue_'+graphid;//No I18n
    return "<input type='text' size='5' class='numberCheck appMonitorTextbox disabledBlock' placeholder='"+Ember.I18n.t('webclient.opm.monitortype.integer',this)+//No I18n
    "' value='"+thresholdValue+"' id='"+textboxId+"' onblur='saveAppMonitorConfig(\""+textboxId+"\",\""+options.rowId+"\")'/>"; //No I18n
}
function urlTemplateAddressLink(cellvalue, options, rowdata, action) {
    return "<a class='opm_link' href='"+convertHtmlToText(rowdata.urlAddress)+"' target='_blank'>"+convertHtmlToText(cellvalue)+"</a>"; //No I18n
}
function redirectToMPAssociatedDeviceList(cellValue, options, rowdata, action){
    if(parseInt(cellValue)>0){
        return "<div style='text-decoration:underline;cursor:pointer;'>"+cellValue+"</div>";//No I18N
    }
    else{
        return cellValue;
    }
}
function ipslaMonitorCSSHandle(cellValue, options, rowdata, action){
      return escapeHTML(rowdata.srcDisplayName)+" &#8594 "+escapeHTML(rowdata.targetDeviceName)+' ( '+escapeHTML(rowdata.monitorName)+' )';//No I18N
}

function networkpathProbeLink(cellValue, options, rowdata, action) {
    var probeUrl = escape(rowdata.probeURL);
    return "<span class='cursorPointer' onclick='opm_networkpathProbeSnapshot(\""+probeUrl+"\",\""+rowdata.moID+"\")'>"+escapeHTML(rowdata.probeDisplayName)+"</span>";//No I18N
}

function EEDataTransferedStatsLink(cellValue, options, rowdata, action) {
    var period = $("#EEDataTransferedStatsSelectPeriod").val(); //No I18N
    OPMClient.ApplicationController.set("selSupportProbeName",rowdata[0]); //No I18N
    return "<a class='ncmLink' onclick='EEDataTransferedStatsDetails(\"" + rowdata[0] + "\",\""+period+"\")'>" + rowdata[1] + "</a>";//No I18N
}
function showCustomFieldValue (cellValue, options, rowdata, action)
{
    var fieldValue = rowdata.value;
    if(fieldValue !== undefined) {
        return opm_escapeHTML(fieldValue);
    } else {
        return "-";
    }
}
function skipApprovalEntityActions(cellValue, options, rowdata, action){
    return "<i class='icon-trash' style='cursor:pointer; font-size:16px' onclick='OPMClient.NCMSkipApprovalController.removeEntity(\""+rowdata.id+"\")'></i>";//No I18N
}
function skipApprovalRESTEntityActions(cellValue, options, rowdata, action){
    return "<i class='icon-trash' style='cursor:pointer; font-size:16px' onclick='OPMClient.NCMSkipApprovalController.removeRESTEntity(\""+rowdata.id+"\")'></i>";//No I18N
}

function rcaEntityActions(cellValue, options, rowdata, action){
    return "<i class='icon-trash' style='cursor:pointer; font-size:16px'></i>";//No I18N
}
function rcaListActions(cellValue, options, rowdata, action){
    return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='editRCA(\""+rowdata.ID+"\")'></i><i class='rca-icon-viewMessage' onclick='viewResolvedMessages(\""+rowdata.ID+"\")' title='"+Ember.I18n.t("webclient.View",this)+" "+Ember.I18n.t("webclient.opm.rca.resolvednotes",this)+"'></i><i class='rca-icon-copy' title='"+Ember.I18n.t("button.Copy",this)+"' onclick='goToCopyRCAPage(\""+escapeHTML(rowdata.NAME)+"\",\""+escapeHTML(rowdata.DESCRIPTION)+"\",\""+rowdata.ID+"\")'></i><i class='rca-icon-delete' title='"+Ember.I18n.t("jsp.commonstr.Delete",this)+"' onclick='deleteRCA(\""+rowdata.ID+"\")'></i>";
}

function rcaFavouriteReport(cellValue, options, rowdata, action)
{
    if(cellValue===true){
        return "<i class='opm-reports2 favorite active' title='"+Ember.I18n.t("webclient.opm.common.markasunfavourite",this)+"' onclick='markFavouriteRCAReport(\""+rowdata.ID+"\",this)' style='cursor:pointer;margin: 2px 0 0 0px !important;'></i>"; //No I18n
    }else{
        return "<i class='opm-reports2 favorite' title='"+Ember.I18n.t("webclient.opm.common.markasfavourite",this)+"' onclick='markFavouriteRCAReport(\""+rowdata.ID+"\",this)' style='cursor:pointer;margin: 2px 0 0 0px !important;'></i>"; //No I18n
    }
}
function getFormattedDateTime(cellValue, options, rowdata, action)
{
    return moment.tz(new Date(cellValue),window.OPM.severTimeZone).format('DD MMM YYYY HH:mm:ss A z');//No I18N
}
function rcaProfileViewFormatter(cellValue, options, rowData, action)
{
    return "<span class='opm_link' onclick='viewRCAProfile(\""+rowData.id+"\",\""+rowData.probeID+"\")' tabindex='0' role='link'>"+escapeHTML(cellValue)+"</span>";//No I18N
}
function rcaEventsColorIcon(cellValue,options,rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.STATUS+"'></i>"+escapeHTML(cellValue);//No I18N
}
function resolveNotesActionFormatter(cellValue,options,rowdata,action)
{
     return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.title.edit",this)+"' onclick='editResolvedNote(\""+options.rowId+"\")'></i><i class='rca-icon-delete' title='"+Ember.I18n.t("webclient.devices.customfields.delete",this)+"' onclick='deleteResolvedNote(\""+rowdata.NOTESID+"\",\""+options.rowId+"\")'></i>";
}
function viewRCANotesFormatter(cellValue,options,rowdata,action)
{
    return "<span class='opm_link' onclick='viewRCAAlertResolvedMessages(\""+rowdata.id+"\",\""+rowdata.probeID+"\")' tabindex='0' role='link'>"+Ember.I18n.t('webclient.opm.resolvenote.viewmessage',this)+"</span>";//No I18N
}
function createTableBarChart(cellValue, options, rowdata, action)
{
    var percentVal = Number(cellValue);
    if(percentVal == undefined)
    {
        percentVal = 0;
    }
    var widgetData = $("#"+options.gid).data();
    var statusClass = '';//No I18N
    if(widgetData !== undefined && widgetData.WidgetAdditionalData !== undefined){
        if(percentVal >= widgetData.WidgetAdditionalData.criticalValue){
            statusClass += 'utrow severity_1';//No I18N
        }else if(percentVal >= widgetData.WidgetAdditionalData.attentionValue){
            statusClass += 'utrow severity_3';//No I18N
        }
        else{
            statusClass += 'utrow severity_5';//No I18N
        }
    }
    percentVal = opm_escapeHTML(percentVal);
    return '<div class="severity-container"><div><div class="'+statusClass+'" data-value="'+percentVal+'" style="width: '+percentVal+'%;"></div></div><span class="span-right">'+percentVal+'%</span></div>';//No I18n
}
function createBarChartForTopNGrid(cellValue,options,rowdata,action){
    var percentVal = Number(opm_escapeHTML(cellValue)) || 0;
    if(percentVal > 100){
        percentVal = 100;
    }
    percentVal = Math.round(percentVal*100)/100;
    var widgetData = $('#'+options.gid).data();
    var statusClass = 'utrow opmToolTipDesc ';//No I18N
    var colorBackground = 'style="width:'+percentVal+'%;"';//No I18N
    var volumeTxt = '';
    var dataObj = '';
    if(rowdata.volume !== undefined){
        volumeTxt = ",&quot;"+Ember.I18n.t('webclient.reports.volume')+"&quot;:&quot;"+opm_escapeHTML(rowdata.volume)+"&quot;";//No I18N
    }
    dataObj = "{&quot;"+Ember.I18n.t('opu.views.NAME')+"&quot;:&quot;"+opm_escapeHTML(rowdata.displayName)+"&quot;,&quot;"+Ember.I18n.t('webclient.devices.intftypes.value')+"&quot;:&quot;"+percentVal+"&quot;"+volumeTxt+"}";//No I18N
    if(widgetData !== undefined && widgetData.WidgetAdditionalData !== undefined){
        if('default' === widgetData.WidgetAdditionalData.colorType){
            if(percentVal > widgetData.WidgetAdditionalData.criticalValue){
                statusClass += 'severity_1';//No I18N
            }else if(percentVal > widgetData.WidgetAdditionalData.attentionValue){
                statusClass += 'severity_3';//No I18N
            }else{
                statusClass += 'severity_5';//No I18N
            }
        }else if('threshold' === widgetData.WidgetAdditionalData.colorType){//No I18N
            colorBackground = 'style="width:'+percentVal+'%;background:'+rowdata.colorCode+'"';//No I18N
        }else{
            return '<span title='+percentVal+'>'+percentVal+'</span>';//No I18N
        }
    }
    return '<div class="severity-container"><div><div class="'+statusClass+'" data-obj="'+dataObj+'" data-value="'+percentVal+'"'+colorBackground+' ></div></div><span class="span-right">'+percentVal+'%</span></div>';//No I18n
}

function alarmNoteActions(cellValue, options, rowObject, action) {
    if(window.OPM.userPermissions.alarmsRead && !(window.OPM.isFWADE && window.OPM.isFWAServer) && (window.OPM.userPermissions.superadmin || window.OPM.userName == rowObject.who)) {
        return "<i class='icon-trash fs16 pointer' style='float:left' onclick='deleteAlarmNote(&#39;"+rowObject.noteID+"&#39;)' title='"+Ember.I18n.t('webclient.general.delete',this)+"' tabindex='0' role='button'></i> <i class='icon-configedit pointer' style='float:left' onclick='editAlarmNote(&#39;"+rowObject.noteID+"&#39;,&#39;"+encodeURIComponent(rowObject.notes)+"&#39;)' title='"+Ember.I18n.t('webclient.action.edit',this)+"' tabindex='0' role='button'></i>"; //No I18n
    } else {
		return "";
	}
}
function formatInstanceValue(cellValue,options,rowdata,action){
    if(isNaN(cellValue)){
        return escapeHTML(cellValue);
    }
    return Math.round(escapeHTML(cellValue) * 1000) / 1000;
}
function setSummarySeverityStatus(cellValue, options, rowdata, action)
{
    return "<i class='icon-status"+rowdata[1]+"'></i> "+rowdata[0];//No I18N
}
function setSiteStatusIcon(cellvalue, options, rowdata)
{
    if(cellvalue === "5")
    {
        return  "<div class='flex'><i class='icon-status13'></i><span style='padding-left:5px;'>"+Ember.I18n.t('webclient.devices.intftypes.up',this)+"</span></div>" ; //No I18N
    }
    else{
        return  "<div class='flex'><i class='icon-status14'></i><span style='padding-left:5px;'>"+Ember.I18n.t('webclient.devices.intftypes.down',this)+"</span></div>" ; //No I18N
    }
}
function gotoVMSummary(cellValue, options, rowdata, action)
{
   return '<i onclick=\'opm_transitionToParentRoute(\"Inventory.List.Virtualization.Sub\",\"'+rowdata.vendor+'\");\'>'+escapeHTML(cellValue)+'</i>';//No I18N
}
function firmVulnHistoryCveRoute(cellValue, options, rowdata, action) {
    return "<a class='ncmLink' onclick='showCveHistoryReport(\"" + escapeHTML(cellValue)+"\")'>" + escapeHTML(cellValue) + "</a>";//No I18N

}

function showCveHistoryReport(cve){
    location.href = window.OPM.apiclientUrl+"Reports/NCM/FVTrendReport/"+cve; //No I18N
}

function getNonVendorTooltip(cellValue){
    return cellValue === '-' ? "<i title='"+Ember.I18n.t('webclient.opm.settings.monitoring.perf.nonvendor.tooltip')+"'>-</i>" : opm_escapeHTML(cellValue);
}
function apmMonitorTypesFormatter(cellValue, options, rowdata, action)
{
   return "<a href='javascript:redirectToAPMMonitorType(\""+rowdata.SUBGROUP+"\")'>"+escapeHTML(cellValue)+"</a>"; //No I18N
}

function apmMonitorsFormatter(cellValue, options, rowdata, action)
{
    return "<a href='javascript:redirectToAPMMonitor(\""+rowdata.resourceId+"\")'>"+escapeHTML(cellValue)+"</a>"; //No I18N
}
function apmMonitorGroupsFormatter(cellValue, options, rowdata, action)
{
    if(rowdata.subGridStatus===true || rowdata.subGridStatus===undefined)
    {
        return "<a href='javascript:redirectToAPMMonitorGroup(\""+rowdata.RESOURCEID+"\")'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }else{
        return "<a href='javascript:redirectToAPMMonitor(\""+rowdata.RESOURCEID+"\")'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
}
function setAPMStatusAsImgLink(cellValue, options, rowdata, action)
{
    return "<i style='padding-left:10px' class='icon-status"+opm_escapeHTML(cellValue)+"'></i>";//No I18N
}
function outageErrorFormatter(cellValue, options, rowdata, action)
{
    return "<span>"+opm_escapeHTML(cellValue)+" "+Ember.I18n.t('webclient.gettingstarted.in')+" "+Ember.I18n.t('webclient.apm.widgets.monitorstatus.error')+"</span>";//No I18N
}
function alarmExecutionFormatter(cellValue, options, rowdata, action)
{
    return "<i class='icon-start pointer'></i>";//No I18N
}
function apmMonitorTypeFormatter(cellValue, options, rowdata, action)
{
    return "<span>"+opm_escapeHTML(cellValue)+"</span>";//No I18N
}
function apmAlarmMessageFormatter(cellValue, options, rowdata, action)
{
    return "<span>"+opm_escapeHTML(cellValue.split("<br>")[0])+"</span>";//No I18N
}
function setAPMStatusIcon(cellValue, options, rowdata, action)
{
    var statusText = getAPMStatusText(cellValue);
    return "<i style='padding-left:10px' title='"+statusText+"' class='--fault-severity icon-apmstatus"+opm_escapeHTML(cellValue)+"'></i>";//No I18N
}
function setDefaultAPMStatusIcon(cellValue, options, rowdata, action)
{
    var statusText = getAPMStatusText(cellValue);
    return "<i style='padding-left:10px' title='"+statusText+"' class='icon-apmstatus"+opm_escapeHTML(cellValue)+"'></i>";//No I18N
}
function apmMonitorStatusFormatter(cellValue, options, rowdata, action)
{
    if(rowdata.managed!==undefined && rowdata.managed==="false"){//No I18N
        return "<i class='--fault-severity icon-apmstatus6'></i> "+Ember.I18n.t("webclient.map.flash.Unmanaged",this);//No I18N
    }else{
        return "<i class='--fault-severity icon-apmstatus"+rowdata.healthSeverity+"'></i> <span style='text-transform:capitalize;'>"+escapeHTML(rowdata.healthStatus)+"</span>";//No I18N
    }
}
function apmMonitorNameFormatter(cellValue, options, rowdata, action)
{
     return "<a onclick='redirectToAPMMonitor(\""+rowdata.resourceId+"\")' tabindex='0' role='link'>"+escapeHTML(cellValue)+"</a>";//No I18N
}
function redirectToURLSnapshot(cellValue, options, rowdata, action){
    var deviceName = rowdata.deviceName !== undefined ? rowdata.deviceName : rowdata[6];
    if(rowdata.urlName !== undefined){
        deviceName= encodeURIComponent(rowdata.urlName.trim())+"_URL"; ///No I18N
    }
    return "<a class='pointer' onclick=redirectToSnapshot('MonitoringURL','"+opm_escapeHTML(deviceName)+"')>"+opm_escapeHTML(cellValue)+"</a>";
}
function getClassNamesForGraph(graphEnabled){
    return 'perfMonitorGraph pointer'+ (graphEnabled ? '' : ' disabledBlock');//No I18N
}

function editOauthProvider(id) {
    OPMClient.__container__.lookup("router:main")._activeViews['Settings.Basic.OauthProvider'][0].send("editOauthProvider", id); //No I18n
}

function deleteOauthProvider(oauthID) {
    OPMClient.__container__.lookup("router:main")._activeViews['Settings.Basic.OauthProvider'][0].send("deleteOauthProvider", oauthID); //No I18n
}

function publicOrPrivate(cellValue, options, rowdata, action) {
	if(rowdata.IS_PUBLIC == true || rowdata.IS_PUBLIC == 'true'){
		return "<div class='flex flex-middle-align'><em class='svgIcon size16 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#user-group'/></svg></em>  "+cellValue+"</div>";//No I18n
	}else{
		return "<div class='flex flex-middle-align'><em class='svgIcon size16 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#user'/></svg></em>  "+cellValue+"</div>";//No I18n
	}
}

function severityColorIconGroup(cellValue, options, rowdata, action)
{
    return "<i class='icon-status"+rowdata.status+"'></i> "+escapeHTML(rowdata.statusLabel) ;//No I18N
}

function vpnHostPollStatus(cellValue, options, rowdata, action){

    if(rowdata.statusPoll === "true"){
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='vpnHostStuspollAction(&#39;false&#39;,&#39;"+rowdata.hostName+"&#39;,&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;,&#39;"+rowdata.instance+"&#39;)' checked name=''><label></label></div>";//No I18N
    }
    else {
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='vpnHostStuspollAction(&#39;true&#39;,&#39;"+rowdata.hostName+"&#39;,&#39;"+OPMClient.InventoryDeviceDetailsController.deviceName+"&#39;,&#39;"+rowdata.instance+"&#39;)' name=''><label></label></div>";//No I18N
    }
}

function setVPNStatus(cellValue, options, rowdata, action) {
    return "<i class='icon-status"+opm_escapeHTML(rowdata.status)+"'></i> "+rowdata.hostName; //No I18N

}

function manageDeviceInProbe (probeID, module, probeName, customerID, customerName){
    slideIn(11);
    var self = OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt'); //No I18n
    var moduleNameAliasName = module;
    if(module === "Monitoring" && !window.OPM.isOPMPLUS) {
        moduleNameAliasName = "Devices"; //No I18n
    }
    self.set("breadCrumbsSlideHeading", {moduleName: module,moduleNameAliasName:moduleNameAliasName, probeName: probeName, customerName : customerName}); //No I18n
    self.set("selectedProbeID", probeID); //No I18n
    self.set("selectedCustomerID", customerID); //No I18n
    if(module === "LiteDevices") {
        self.set('showModuleInfo', true); //No I18n
        self.set("accordionGridInsideSlide", true); //No I18n
    } else {
        loadLicenseGrid(self, module + "_" + probeID, "", "mgmt", false, customerID);
    }
}

function setIntfProfileStatus(cellValue, options, rowdata, action){
    var disabledStr = "";
    if(!window.OPM.userPermissions.discoveryWrite) {
        disabledStr = "disabled" //No I18N
    }
    if(rowdata.status === "true"){
            return "<div class='chkRoundBtn'><input type='checkbox'  "+disabledStr+" onclick='changeIntfProfileScheduleState(&#39;false&#39;,&#39;"+rowdata.profileID+"&#39;)' checked name=''><label></label></div>";//No I18N
    }
    else if(rowdata.status === "false") {
            return "<div class='chkRoundBtn'><input type='checkbox'  "+disabledStr+" onclick='changeIntfProfileScheduleState(&#39;true&#39;,&#39;"+rowdata.profileID+"&#39;)' name=''><label></label></div>";//No I18N
    }else{
        return "<div class='chkRoundBtn'><input type='checkbox' name='' disabled><label></label></div>";//No I18N; //No I18N
    }
}
function intfProfileListActions(cellValue,options,rowdata,action){
    var actionStr = ""; //No I18N
    if(rowdata.scheduleRunningStatus !==undefined && rowdata.scheduleRunningStatus !== ""){
        var actionStr =  "<i class='discEditIcon discIcon btn-disabled' title='"+Ember.I18n.t('webclient.title.edit',this)+"'></i>";//NoI18N
        if(!window.OPM.isOPMStandardEdition){
            actionStr += "<i class='discIcon discSheduleIcon btn-disabled'  title='"+Ember.I18n.t('webclient.general.Schedule',this)+"'></i>"; //No I18N
        }
        actionStr += "<i class='discIcon discReportIcon btn-disabled' title='"+Ember.I18n.t('nfa.report.name',this)+"' onclick='loadIntfProfileRep(&#39;"+rowdata.profileID+"&#39;);' style='display:none;' tabindex='0' role='button'></i><i class='icon-paste OpMToolTip' title='"+Ember.I18n.t('button.Copy',this)+"' style='margin:0 7px;cursor:Pointer;display:none;' onclick='copyThisIntfProfile(&#39;"+rowdata.profileID+"&#39;)' tabindex='0' role='button'></i><i class='discIcon discDeleteIcon btn-disabled' title='"+Ember.I18n.t('webclient.action.delete',this)+"'></i>"; //No I18n
    }else{
        if(rowdata.profileName === "AllDevices_AllInterfaces")
        {
            var actionStr =  "<i class='discEditIcon discIcon btn-disabled' style='cursor: default !important;' title='"+Ember.I18n.t('webclient.title.edit',this)+"'></i>";//NoI18N
        }else{
            var actionStr =  "<i class='discEditIcon discIcon' title='"+Ember.I18n.t('webclient.title.edit',this)+"' onclick='opm_EditIntfDiscProfile(&#39;"+rowdata.profileID+"&#39;,&#39;"+rowdata.scheduleRunningStatus+"&#39;)' tabindex='0' role='button'></i>";//NoI18N
        }
        if(!window.OPM.isOPMStandardEdition){
            actionStr += "<i class='discIcon discSheduleIcon'  title='"+Ember.I18n.t('webclient.general.Schedule',this)+"' onclick='addIntfDiscSchedule(&#39;"+rowdata.profileID+"&#39;)' tabindex='0' role='button'></i>"; //No I18N
        }
        if(rowdata.profileName === "AllDevices_AllInterfaces")
        {
            actionStr += "<i class='discIcon discDeleteIcon btn-disabled' style='cursor: default !important;' title='"+Ember.I18n.t('webclient.action.delete',this)+"' ></i>";//NoI18N
        }else{
            actionStr += "<i class='discIcon discReportIcon' title='"+Ember.I18n.t('nfa.report.name',this)+"' onclick='loadIntfProfileRep(&#39;"+rowdata.profileID+"&#39;);' style='display:none;' tabindex='0' role='button'></i><i class='icon-paste OpMToolTip' title='"+Ember.I18n.t('button.Copy',this)+"' style='margin:0 7px;cursor:Pointer;display:none;' onclick='copyThisIntfProfile(&#39;"+rowdata.profileID+"&#39;)' tabindex='0' role='button'></i><i class='discIcon discDeleteIcon' title='"+Ember.I18n.t('webclient.action.delete',this)+"' onclick='deleteIntfProfile(&#39;"+rowdata.profileID+"&#39;,&#39;"+rowdata.profileName+"&#39;)' tabindex='0' role='button'></i>"; //No I18n
        }

    }
    return actionStr;
}
function editIntfDiscProfile(cellValue,options,rowdata,action)
{
    var re = opm_escapeHTML(cellValue);
    if(rowdata.profileName === "AllDevices_AllInterfaces")
    {
           re = "<div data-editVal='"+opm_escapeHTML(cellValue)+"'>"+opm_escapeHTML(cellValue)+"</div>"; //No I18N
    }else{
        if(window.OPM.userPermissions.discoveryWrite){
           re = "<div style='cursor:pointer;' onclick='opm_EditIntfDiscProfile(&#39;"+rowdata.profileID+"&#39;,&#39;"+rowdata.scheduleRunningStatus+"&#39;)' data-editVal='"+opm_escapeHTML(cellValue)+"' tabindex='0' role='link'>"+opm_escapeHTML(cellValue)+"</div>"; //No I18N
        }
    }
    return re;
}

function usageInfoProbeRedirect(path, probeID) {
    changeEEProbeID(probeID);
    setTimeout(function() {
        Ember.run.schedule("afterRender", function() { //No I18n
            location.href = path;
        })
    }, 200);
}

function showMonitorSuppressed(cellvalue, options, rowdata, action){
    var returnString = "";
    if(rowdata.isSuppressed === "true") {
        returnString = '<div title="'+rowdata.suppressedMessage+'" class="size14"><svg class="svgIcon size14"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></div>'; //No I18N
    }
    return returnString;
}
function showSuppressedAlarmIcon(cellvalue, options, rowdata, action){
    var returnString = "<span> - </span>"; //No I18n
    if(cellvalue) {
        returnString = '<div title="'+rowdata.suppressedMessage+'" class="flex flex-middle-align height-full"><svg class="svgIcon size14"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></div>'; //No I18N
    }
    return returnString;
}
function setFavouriteReportLink(cellValue,options,rowdata,action) {
    var returnObject = cellValue;
    if(!opm_IsNumericVal(rowdata.ID)){
        return returnObject;
    }
    if(window.OPM.userPermissions.reportsRead){
        params={reportId:rowdata.ID};
        returnObject = "<div style='cursor:pointer;' onclick='opm_transitionToParentRoute(\"Reports.Opmanager.Report\",{reportId:"+rowdata.ID+"})'>"+escapeHTML(cellValue)+"</div>"; //No I18N
    }
    return returnObject;
}

function jqGridHTMLEncodeMultiLine(cellValue,options,rowdata,action) {
    var cellVal = escapeHtmlTags(cellValue);
    return cellVal.replace(/\n/g, "<br />").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
}

function opm_addCentralIcon(cellValue){
    var centralIcon = "";
    if(cellValue){
        centralIcon = '<span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span>'; //No I18N
    }
    return centralIcon;
}

function defRuleListActions(cellValue, options, rowdata, action){
    var actions = "";
    if(rowdata.module !== -1){ //Not for Static Alarm Rules
        if(rowdata.isCentralManaged) {
            actions += "<i class='rca-icon-edit btn-disabled' title='"+Ember.I18n.t("webclient.defRule.editCentralRestrict",this)+"' style='cursor: default !important;'></i>";
        } else {
            actions += "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='editAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\")'></i>";
        }
    }
    return actions;
}

function apListActions(cellValue, options, rowdata, action){
    if(rowdata.isCentralManaged) {
        return ""; //No I18N
    }
    var editTitle = Ember.I18n.t("webclient.action.edit",this); //No I18N
    var copyTitle = Ember.I18n.t("button.Copy",this); //No I18N
    var delTitle = Ember.I18n.t("jsp.commonstr.Delete",this); //No I18N
    if (OPMClient.ApplicationController.isOPM && OPMClient.ApplicationController.isCentralServer) {
        return "<i class='rca-icon-edit' title='"+editTitle+"' onclick='editAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\")'></i><i class='rca-icon-copy' title='"+copyTitle+"' onclick='copyAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\")'></i><i class='rca-icon-delete' title='"+delTitle+"' onclick='deleteAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\")'></i>";
    } else if(window.OPM.isMSPCentral) {
        return "<i class='rca-icon-edit' title='"+editTitle+"' onclick='editAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\",\""+rowdata.customerID+"\")'></i><i class='rca-icon-copy' title='"+copyTitle+"' onclick='copyAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\",\""+rowdata.customerID+"\")'></i><i class='rca-icon-delete' title='"+delTitle+"' onclick='deleteAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\",\""+rowdata.customerID+"\")'></i>";
    } else {
        return "<i class='rca-icon-edit' title='"+editTitle+"' onclick='editAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\")'></i><i class='rca-icon-copy' title='"+copyTitle+"' onclick='copyAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\")'></i><i class='rca-icon-delete' title='"+delTitle+"' onclick='deleteAP(\""+rowdata.ruleType+"\",\""+rowdata.profileID+"\")'></i>";
    }
}

function apListActionsGrpSnapshot(cellValue, options, rowdata, action){
    //Not applicable for DefRules, Hence hardcoding ruleType as Custom
    var ruleType = "Custom"; //No I18N
    if (OPMClient.ApplicationController.isOPM && OPMClient.ApplicationController.isCentralServer) {
        return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='editAP(\""+ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\")'></i>";
    } else if(window.OPM.isMSPCentral) {
        return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='editAP(\""+ruleType+"\",\""+rowdata.profileID+"\",\""+rowdata.regionID+"\",\""+rowdata.customerID+"\")'></i>";
    } else {
        return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='editAP(\""+ruleType+"\",\""+rowdata.profileID+"\")'></i>";
    }
}

function alarmProfileEnableDisable(cellValue, options, rowdata, action) {
    var isChecked = 'checked'; //No I18N
    var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
    if (!rowdata.manage) {
        isChecked = '';
        statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
    }
    // Central-managed rules on a probe: manage/unmanage (enable/disable) IS allowed (acts locally on the probe),
    // so the toggle stays clickable. Only edit/copy/delete are restricted (handled in apListActions).
    if (OPMClient.ApplicationController.isOPM && OPMClient.ApplicationController.isCentralServer) {
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='manageAP(this," + rowdata.profileID + "," + rowdata.regionID + ")' " + isChecked + " name='alarmProfileStatusBtn_" + rowdata.profileID + "' title='" + statusTitle + "'><label></label></div>";//No I18N
    } else if(window.OPM.isMSPCentral) {
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='manageAP(this," + rowdata.profileID + "," + rowdata.regionID + "," + rowdata.customerID + ")' " + isChecked + " name='alarmProfileStatusBtn_" + rowdata.profileID + "' title='" + statusTitle + "'><label></label></div>";//No I18N
    } else {
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='manageAP(this," + rowdata.profileID + ")' " + isChecked + " name='alarmProfileStatusBtn_" + rowdata.profileID + "' title='" + statusTitle + "'><label></label></div>";//No I18N
    }
}
function deviceDownDescFormatter(cellValue, options, rowdata, action)
{
    return opm_escapeHTML(rowdata.failureReason).replace(/\n/g, '<br />'); //No I18n
}

function deviceDownInfo(cellValue, options, rowdata, action)
{
    if(!(window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected) &&  (rowdata.eventType === "Device Down"))
    {
        var reqData = {devName:rowdata.deviceName,needAdvancedInfo:true,deviceDownDiagonstic:true,alarmTime:rowdata.modTimeLong};
        var diagnosticData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/getDeviceDiagnosticsInfo",reqData); //No I18n
        var title = Ember.I18n.t('opm.dsp.avail.diag',this); //No I18N
        var reason = opm_escapeHTML(diagnosticData.failureReason).replace(/\n/g, '<br/>'); //No I18n
        if(diagnosticData.error !== undefined)
        {
            reason = opm_escapeHTML(diagnosticData.error.message).replace(/\n/g, '<br/>'); //No I18n
        }
        var info = " <a class='hasHelpCard2 opm_link' tabindex='0' onclick='helpcard2Click(this,\"fromDevAlarm\")' data-align='left' data-title='"+title+ "'data-content1='"+reason+"'>("+Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.view.info',this)+")</a>";//No I18N
        return "<span title='"+opm_escapeHTML(rowdata.message)+"'>"+opm_escapeHTML(rowdata.message) +" "+info+"</span>"; //No I18N
    }
    else
    {
        return opm_escapeHTML(rowdata.message);
    }
}

function deviceDownAlarmInfo(cellValue, options, rowdata, action)
{
    if(!(window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected) && (rowdata.statusNum === "1" || rowdata.statusNum === "2" || rowdata.statusNum === "3") && rowdata.alarmViewInfo === "true")
    {
        var alrmTime = rowdata.timeInMs;
        var reqData = {devName:rowdata.source,needAdvancedInfo:true,deviceDownDiagonstic:true,alarmTime:alrmTime};
        var diagnosticData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/getDeviceDiagnosticsInfo",reqData); //No I18n
        var title = Ember.I18n.t('opm.dsp.avail.diag',this); //No I18N
        var reason = opm_escapeHTML(diagnosticData.failureReason).replace(/\n/g, '<br/>'); //No I18n
        if(diagnosticData.error !== undefined)
        {
            reason = opm_escapeHTML(diagnosticData.error.message).replace(/\n/g, '<br/>'); //No I18n
        }
        var info = " <a class='hasHelpCard2 opm_link' tabindex='0' onclick='helpcard2Click(this,\"fromDevAlarm\")' data-align='left' data-title='"+title+ "'data-content1='"+reason+"'>("+Ember.I18n.t('webclient.opm.perf.monitors.diagnostics.view.info',this)+")</a>";//No I18N
        return "<span title='"+opm_escapeHTML(rowdata.text)+"'>"+opm_escapeHTML(rowdata.text) +" "+info+"</span>"; //No I18N
    }
    else
    {
        return opm_escapeHTML(rowdata.text);
    }
}

function navToSourceDSPPage(cellValue, options, rowdata, action)
{
    if(rowdata.source !== undefined && rowdata.source !== "127.0.0.1" && rowdata.sourceMOName !== undefined)
    {
        return "<a href='javascript:redirectToSnapshot(\"MonitoringDevice\", \""+rowdata.sourceMOName+"\");'>"+escapeHTML(rowdata.sourceDisplayName)+"</a>"; //No I18N   
    }
    else
    {
        return escapeHTML(rowdata.sourceDisplayName);
    }
}

function showIntervalUnit(cellValue, options, rowdata, action)
{
    if(rowdata.customFieldId !== undefined) {
        return rowdata.interval+" ("+Ember.I18n.t('webclient.map.filemonitor.fileage.hours',this)+")"; //No I18n
    } else {
        return rowdata.interval+" ("+Ember.I18n.t('webclient.general.mins',this)+")"; //No I18n
    }
}

function opm_MerakiClientCount(cellValue,options,rowdata,action)
{
    if(rowdata.ClientCount !== "NA" && rowdata.ClientCount !== "0") { //No I18n
        return "<a class='opm_link' onClick=opm_MerakiSSIDtoClientList(&#39;"+ encodeURIComponent(rowdata.ssidName)+"&#39;)>" +opm_escapeHTML(rowdata.ClientCount)+"</a>"; //No I18n
    } else {
        return opm_escapeHTML(rowdata.ClientCount);
    }
}

function opm_MerakiSSIDtoClientList(ssid)
{
    $(".intfSubTabs").find("[data-tabname='webclient.snapshot.name.Clients']").click(); //No I18n
    setTimeout(function(){
        $(".icon-search").click();
        $('#gs_ssid').val(decodeURIComponent(ssid));
        var filter = { groupOp: "OR", rules: [] };//No I18n
        filter.rules.push({ field: "ssid", op: "cn", data: decodeURIComponent(ssid)});//No I18N
        $(jgGridTableID).jqGrid('setGridParam', { search: true, postData: { "filters": (filter.length == 0) ? "" : filter} }).trigger("reloadGrid");//No I18N
    },200);
}

function enableDisablePerfGroupStatus(cellValue, options, rowdata, action)
{
    if(cellValue){
        return "<span><i class='icon-status5'></i> "+Ember.I18n.t("webclient.devices.intftypes.enabled",this)+"</span>";//No I18N
    }else{
        return "<span><i class='icon-status7'></i> "+Ember.I18n.t("webclient.admin.scheduledt.disabled",this)+"</span>";//No I18N
    }
}
function perfGroupActions(cellValue, options, rowdata, action)
{
    var isValidUserRole = window.OPM.userPermissions.monitoringWrite?"":"disabled";//No I18N
    var perfgroupName = escapeHTML(rowdata.perfgroupName!==undefined?rowdata.perfgroupName:rowdata.Name)
    var actionStr = "";
    if(rowdata.globalAdaptiveThresholds || OPMClient.ApplicationController.currentRouteName.indexOf('Settings.Monitors.AdaptiveThreshold')!==-1){//No I18N
        actionStr += "<i class='rca-icon-edit "+isValidUserRole+"' title='"+Ember.I18n.t("webclient.devices.details.edit",this)+" "+Ember.I18n.t("opmanager.perfgroup.name",this)+"' onclick='editPerfGroup(\""+perfgroupName+"\","+rowdata.perfgroupType+")'></i>";//No I18N
    }
    if(rowdata.perfgroupType===2 && OPMClient.ApplicationController.currentRouteName.indexOf('Settings.Monitors.AdaptiveThreshold')===-1 && !window.OPM.isProbe){//No I18N
        actionStr += "<i class='rca-icon-delete "+isValidUserRole+"' title='"+Ember.I18n.t("webclient.devices.customfields.delete",this)+" "+Ember.I18n.t("opmanager.perfgroup.name",this)+"' onclick='deletePerfGroup(\""+escapeHTML(rowdata.perfgroupID)+"\")'></i>";//No I18N
    }
    if(actionStr===""){
        actionStr = "-";//No I18N
    }
    return actionStr;
}

function addUnitsInValue(cellValue, options, rowdata, action)
{
    return escapeHTML(cellValue)+" "+escapeHTML(rowdata.units);
}
function openDTDetailsPage(dtName)
{
    openDeviceTemplates();
    Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
        globalSliderObj.editVal=dtName;
        window.location.href="/apiclient/ember/index.jsp#/Settings/Configurations/DeviceTemplate/Edit";//No I18N
    });
    OPMClient.SettingsTabController.set("perfGroupEntityDetails",undefined);//No I18N
}
function PerfAssoDTFormatter(cellValue, options, rowdata, action)
{
    if(window.OPM.userPermissions.configurationWrite){
    return "<span style='cursor:pointer' onclick='openDTDetailsPage(\""+escapeHTML(cellValue)+"\")'>"+escapeHTML(cellValue)+"</span>";//No I18N
    }else{
        return "<span>"+escapeHTML(cellValue)+"</span>";//No I18N
    }
}
function showPerfGroupListFormatter(cellValue, options, rowdata, action)
{
    if(cellValue===0){
        return "<span>"+escapeHTML(cellValue)+"</span>";//No I18N
    }else{
        var entity = "";
        if(options!==undefined && options.colModel!==undefined)
        {
            if(options.colModel.name==="performanceMonitor"){//No I18N
                entity = "performanceMonitor";//No I18N
            }else if(options.colModel.name==="deviceCount"){//No I18N
                entity = "deviceAssociatedMonitors";//No I18N
            }else if(options.colModel.name==="deviceTemplateCount"){//No I18N
                entity = "deviceTemplateAssociatedMonitors";//No I18N
            }
        }
        return "<span class='textUnderlineDecoration' onclick='showPerfGroupEntityList(\""+escapeHTML(rowdata.perfgroupName)+"\",\""+escapeHTML(entity)+"\")'>"+escapeHTML(cellValue)+"</span>";
    }
}

function kempStatusFormattter(cellValue, options, rowdata, action){
    if(cellValue!==undefined)
    {
        if(cellValue===2){
            return "<div class='wlcTabStatus text-white status-solid-down'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#status-down'></use></svg></div>";//No I18N
        }else{
            return "<div class='wlcTabStatus text-white status-solid-up'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#status-up'></use></svg></div>";//No I18N
        }
    }else{
        return "";
    }
}
function kempVsSelectFormattter(cellValue, options, rowdata, action){
    if(rowdata===undefined || rowdata.moId===undefined){
        return "";
    }
    var gid = (options && options.gid) ? options.gid : "";//No I18N
    var store = gid ? $("#"+gid).data("kempVsSelStore") : null;//No I18N
    var chk = (store && store[rowdata.moId]) ? " checked" : "";//No I18N
    return "<input type='checkbox' class='kempVsBulkChk'"+chk+" value='"+escapeHTML(rowdata.moId)+"' onclick='(event||window.event).stopPropagation();opm_kempVsToggleSel(\""+gid+"\","+escapeHTML(rowdata.moId)+",this);' style='cursor:pointer;margin:0;'>";//No I18N
}
function kempVSIPFormattter(cellValue, options, rowdata, action){
    var index,name;
    if($(".kempLBSnapshot ul li.active").attr('name')==="virtualService"){//No I18N
        index = rowdata.vsIndex;
        name = (rowdata.vsName!==undefined && rowdata.vsName!=="")?rowdata.vsName:rowdata.vsIpAddress;
    }else{
        index = rowdata.index;
        name = rowdata.ipAddress;
    }
    return '<span class="opm_link" onclick="redirectToKempChildDetailsPage('+escapeHTML(rowdata.moId)+','+escapeHTML(index)+','+escapeHTML(rowdata.status)+',\''+escapeHTML(name)+'\')">'+escapeHTML(cellValue)+'</span>';//No I18N
}
function kempRSSubFormattter(cellValue, options, rowdata, action){
    if(cellValue!==undefined){
        return escapeHTML(cellValue);
    }else{
        return "-";
    }
}
function kempVSEnableDisableFormattter(cellValue, options, rowdata, action){
    var checked = "/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone";//No I18N
    var tooltipText = Ember.I18n.t("webclinet.inventory.nfa.alerts")+" "+Ember.I18n.t("webclient.admin.scheduledt.disabled");//No I18N
    var enabledValue = false;
    if(cellValue==1){
        checked = "/apiclient/fluidicv2/img/sprite-opm.svg#notifications-o";//No I18n
        tooltipText = Ember.I18n.t("webclinet.inventory.nfa.alerts")+" "+Ember.I18n.t("jsp.commonstr.Enabled");//No I18N
        enabledValue = true;
    }
    //return '<div class="chkRoundBtn"><input type="checkbox" title="'+tooltipText+'" '+checked+' onclick="enableDisableKempChild('+escapeHTML(OPMClient.InventoryDeviceDetailsController.isInDepthLoadBalancer?($(".LBSnapshot ul li.active").attr('name')==="poolMember"?rowdata.pmMoId:rowdata.vsMoId):rowdata.moId)+',this)"><label></label></div>';//No I18N
    //Added onclick="(event||window.event).stopPropagation(); = Without it, clicking the bell could also trigger the row's own click
    return '<div class="flex flex-middle-align"><span title="'+tooltipText+'" value="'+enabledValue+'" class="size18 ml-sm cursorPointer" onclick="(event||window.event).stopPropagation();enableDisableKempChild('+escapeHTML(OPMClient.InventoryDeviceDetailsController.isInDepthLoadBalancer?($(".LBSnapshot ul li.active").attr('name')==="poolMember"?rowdata.pmMoId:rowdata.vsMoId):rowdata.moId)+',this)"><svg class="svgIcon size18"><use xlink:href="'+checked+'"></use></svg></span></div>';//No I18N
}
function kempVSRSStatusFormattter(cellValue, options, rowdata, action){
    var formatText = "";
    if(cellValue!==undefined)
    {
        var customClassName = (cellValue.length>5)?'mr-xs size24':'mr-lg';//No I18N
        formatText = "<div class='flex flex-middle-align'><span class='m-none "+customClassName+"'>"+escapeHTML(cellValue.length)+"</span><span>";//No I18N
        for(var i=0;i<cellValue.length;i++)
        {
            var rsList = Object.keys(cellValue[i]);
            if(rsList.length>0)
            {
                var rsipAddress = rsList[0];
                var rsStatus = cellValue[i][rsipAddress];
                if(rsStatus===1){
                    formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-down' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.devices.intftypes.down",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                }
                else if(rsStatus===7){
                    formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-neutral' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.admin.scheduledt.disabled",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                }
                else if(rsStatus===5){
                    formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-up' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.devices.intftypes.up",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                }  
            }
        }
        formatText += "</span></div>";//No I18N
    }
    return formatText;
}

function encodeCellVal(cellVal){
	if(cellVal != undefined){
		cellVal = cellVal.replaceAll(/&/g, '&amp;');//NO I18N
		cellVal = cellVal.replaceAll(/</g, '&lt;');//NO I18N
		cellVal = cellVal.replaceAll(/>/g, '&gt;');//NO I18N
	}
	return cellVal;
}

function fwaRuleMgmtObjectDrillFormatter(cellValue, options, rowdata, action) {
	var retText='';
    if(cellValue != undefined && cellValue != 'any' && cellValue != '-'){
    	try {
            var jsonObj = JSON.parse(cellValue);
            for(var i=0; i<jsonObj.length; i++){
                if(i==0){
                    retText = getfwaRuleMgmtObjectDrillText(jsonObj[i]);
                }else{
                    retText = retText+"<br>"+getfwaRuleMgmtObjectDrillText(jsonObj[i]);
                }
            }
        } catch(e) {
            // Not valid JSON, return cellValue as-is
            retText = cellValue;
        }
    }else if(cellValue == 'any'){//NO I18N
    	retText = cellValue;
    }
    return retText;
}

function fwaRuleMgmtPortDrillFormatter(cellValue, options, rowdata, action) {
	var retText='';
    if(cellValue != undefined && cellValue != '-'){
    	var jsonObj= JSON.parse(cellValue);
    	if(jsonObj.length == 2){
    		retText = getfwaRuleMgmtObjectDrillText(jsonObj[0])+" -> "+getfwaRuleMgmtObjectDrillText(jsonObj[1]);
    	}else if(jsonObj.length == 1){
    		retText = getfwaRuleMgmtObjectDrillText(jsonObj[0]);
    	}
    }
    retText = (retText == '' ? '-' : retText);
    return retText;
}

function getfwaRuleMgmtObjectDrillText(SingObj){
	var retText="";
	if(SingObj != undefined){
		var displayText = SingObj.displayName ? SingObj.displayName : SingObj.objName;
		if(SingObj.drillAvail){
			if(retText == ''){
				if(SingObj.methodName == "showObjectDetails"){
					retText = '<a href="javascript:showObjectDetails(\''+encodeCellVal(SingObj.objName)+'\',\'\',\''+SingObj.resourceID+'\',\''+SingObj.isSRCObj+'\',false,\'\')" style="color:blue">'+encodeCellVal(displayText)+'</a>';
				}else if(SingObj.methodName == "showObjectDetailsForNAT"){//NO I18N
					retText = '<a href="javascript:showObjectDetailsForNAT(\''+encodeCellVal(SingObj.objName)+'\',\'\',\''+SingObj.resourceID+'\',\''+SingObj.isSRCObj+'\',false,\'\',\''+SingObj.objDetail+'\')" style="color:blue">'+encodeCellVal(displayText)+'</a>';
				}
			}else{
				if(SingObj.methodName == "showObjectDetails"){
					retText = retText+'<br><a href="javascript:showObjectDetails(\''+encodeCellVal(SingObj.objName)+'\',\'\',\''+SingObj.resourceID+'\',\''+SingObj.isSRCObj+'\',false,\'\')" style="color:blue">'+encodeCellVal(displayText)+'</a>';
				}else if(SingObj.methodName == "showObjectDetailsForNAT"){//NO I18N
					retText = retText+'<br><a href="javascript:showObjectDetailsForNAT(\''+encodeCellVal(SingObj.objName)+'\',\'\',\''+SingObj.resourceID+'\',\''+SingObj.isSRCObj+'\',false,\'\',\''+SingObj.objDetail+'\')" style="color:blue">'+encodeCellVal(displayText)+'</a>';
				}
			}
		}else{
			if(retText == ''){
				retText = displayText;
			}else{
				retText = retText +"<br>"+encodeCellVal(displayText);
			}
		}
	}
	return retText;
}

function virtualCapsuleFormatter(cellValue, options, rowdata, action){
    return "<span class='capsule-status gridCapsule capsule-"+opm_escapeHTML(rowdata[options.colModel.name + "_str"])+"'><p>"+opm_escapeHTML(cellValue)+"</p></span>";
}

function vsanDiskActions(cellValue, options, rowdata, action){
    var actionObj = {actionIcon:'notifications-o',tooltip:Ember.I18n.t('webclient.inventory.suppressalarms'),suppressAlarm:true};//No I18N
    if(rowdata.SUPPRESS_ALARM){
        actionObj = {actionIcon:'notification-off-duotone',tooltip:Ember.I18n.t('webclient.opm.perf.snapshot.ipmi.unsuppress.alarms'),suppressAlarm:false};//No I18N
    }
   return "<span class='pointer' title='"+actionObj.tooltip+"' onclick=suppressvSanDiskAlarm('"+options.gid+"',"+options.rowId+","+actionObj.suppressAlarm+",'"+encodeURIComponent(actionObj.tooltip)+"',this) style='float:left;font-size:18px'><svg class='svgIcon size14 mr-xs'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#"+actionObj.actionIcon+"'/></svg></span>";
}
function supressMonitorAlarmFormatter(cellValue, options, rowdata, action) {
    var widgetName = "";
    var suppressMessage = rowdata.IS_SUPPRESSED ? Ember.I18n.t('webclient.opm.perf.snapshot.ipmi.unsuppress.alarms') : Ember.I18n.t('webclient.inventory.suppressalarms'); // No I18N
    var cssClass = 'pointer'; // No I18N

    if(rowdata.suppressedMessage) {
        suppressMessage = escapeHTML(rowdata.suppressedMessage);
    }
    if(rowdata.SUPPRESSED_MSG) {
        suppressMessage = escapeHTML(rowdata.SUPPRESSED_MSG);
    }

    var actionObj = {actionIcon:'notifications-o',tooltip:suppressMessage,suppressAlarm:true};//No I18N
    if(rowdata.IS_SUPPRESSED){
        actionObj = {actionIcon:'notification-off-duotone',tooltip:suppressMessage,suppressAlarm:false};//No I18N
    }

    if(rowdata.NIC_ID) {
        widgetName = "opm.device.vmwarenetworkadapters"; // No I18N
    } else if(rowdata.HBA_ID) {
        widgetName = "opm.device.vmwarestorageadapters"; // No I18N
    } else if(rowdata.SNAPSHOT_ID && rowdata.VM_NAME){
        widgetName = "opm.device.parentVirtualSnapshotDetails"; // No I18N
        if(!rowdata.MO_NAME){
            cssClass = 'disabledBlock'; // No I18N
        }
    } else if(rowdata.SNAPSHOT_ID) {
        widgetName = "opm.device.virtualSnapshotDetails";  // No I18N
    }

   return "<div title='"+actionObj.tooltip+"'><span class='"+cssClass+"' onclick=supressMonitorAlarm('"+widgetName+"','"+options.gid+"',"+options.rowId+",this)><svg class='svgIcon size18 mr-xs'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#"+actionObj.actionIcon+"'/></svg></span></div>"; // No I18N

}
function vsanDiskOperationHealth(cellValue, options, rowdata, action){
    return "<span class='capsule-status gridCapsule capsule-"+validateHealthStatusString(rowdata.HEALTH_STR || rowdata.OP_HEALTH_STR)+"'><p>"+opm_escapeHTML(rowdata.HEALTH || rowdata.OPERATIONAL_HEALTH)+"</p></span>";
}
function vsanDiskSummaryHealth(cellValue, options, rowdata, action){
    return "<span class='capsule-status gridCapsule capsule-"+validateHealthStatusString(rowdata.SUM_HEALTH_STR)+"'><p>"+opm_escapeHTML(rowdata.SUMMARY_HEALTH)+"</p></span>";
}
function vsanHwLedStatus(cellValue, options, rowdata, action){
    var ledStatus = rowdata.LED_STATUS.split(':');
    ledStatus[0] = (ledStatus[0] === 'Blue') ? 'Blue' : 'Red';//No I18N
    return "<span class='capsule-status gridCapsule capsule-"+ledStatus[0]+"'><p>"+opm_escapeHTML(ledStatus[1])+"</p></span>";
}
function vxrailSummaryStatus(cellValue, options, rowdata, action){
    return "<span><i class='--fault-severity icon-status"+Number(rowdata.STATUS)+"' style='font-size:18px'></i>"+opm_escapeHTML(rowdata.STATUS_STR)+"</span>";
}
function redirectToMonitoringDeviceWithFormattedLink(cellValue, options, rowdata, action){
    if(cellValue !== undefined){
        if(rowdata.moName){
            return "<a class='pointer textLink' onclick=redirectToSnapshot('MonitoringDevice','"+rowdata.moName+"')>"+opm_escapeHTML(cellValue)+"</a>";//No I18N
        }else{
            return opm_escapeHTML(cellValue);
        }
    }
    return '';
}
function redirectToVM(cellValue, options, rowdata, action){
    if(cellValue !== undefined){
        var displayName = opm_escapeHTML(cellValue);
        if(rowdata.MO_NAME){
            return "<a class='pointer textLink underline' onclick=redirectToSnapshot('MonitoringDevice','"+opm_escapeHTML(rowdata.MO_NAME)+"')>"+displayName+"</a>";//No I18N
        }else{
            return displayName;
        }
    }
    return '';
}

function hardwareSensorsAction(cellValue, options, rowdata, action)
{
    var suppressIconName = "";
    if(rowdata.issuppressed){
        suppressIconName = "notification-off-duotone";//No I18N
    }else{
        suppressIconName = "notifications-o";//No I18N
    }
    var enableDisableTitleTxt = rowdata.isenabled?Ember.I18n.t("jsp.commonstr.Enabled",this):Ember.I18n.t("jsp.commonstr.Disabled",this);//No I18N
    var suppressTitleTxt = rowdata.issuppressed?Ember.I18n.t("webclient.interfaces.status.suppressalarm",this):Ember.I18n.t("webclient.devices.details.alarm",this)+" "+Ember.I18n.t("jsp.commonstr.Enabled",this);//No I18N
    var editThresholdAction = "<span class='pointer size14 ml-sm "+((rowdata.value === undefined) ? 'disabledBlock' : '')+"' title='"+Ember.I18n.t('webclient.admin.devicetype.newTempl.editThresh')+"' onclick=editThresholdHardwareSensor("+options.rowId+")><svg class='svgIcon size14 mr-xs'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#edit'></use></svg></span>";//No I18N
    return "<div class='flex flex-middle-align'><div class='chkRoundBtn small type2 top-0' title='"+enableDisableTitleTxt+"'><input id='cb_"+rowdata.sensorid+"' type='checkbox' "+(rowdata.isenabled?"checked":"")+" onclick='setManageUnmanageSensorAlarms("+rowdata.sensorid+")'></input><label class='cursorPointer' for='cb_"+rowdata.sensorid+"'></label></div><span class='pointer size14' title='"+suppressTitleTxt+"' id='suppressid_"+rowdata.sensorid+"' value='"+rowdata.issuppressed+"' onclick='suppressSensorAlarms("+rowdata.sensorid+")'><svg class='svgIcon size14 mr-xs'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#"+suppressIconName+"'/></svg></span>"+editThresholdAction+"</div>";//No I18N
}
function apmMonitorStatusWithSeverityFormatter(cellValue, options, rowdata, action)
{
    return "<a href='javascript:redirectToAPMHealth(\""+rowdata.RESOURCEID+"\",\""+rowdata.HEALTHATTRIBUTEID+"\")'><i class='--fault-severity icon-apmstatus"+rowdata.HEALTHSEVERITY+"'></i> <span style='text-transform:capitalize;'>"+escapeHTML(rowdata.HEALTHSTATUS)+"</span></a>";//No I18N
}
function apmMonitorAvailabilityStatusWithSeverityFormatter(cellValue, options, rowdata, action)
{
    if(rowdata.AVAILABILITYSEVERITY == 1){
        var STATUS = "red"; //No I18N
    }else if(rowdata.AVAILABILITYSEVERITY ==5){
        var STATUS = "green"; //No I18N
    }
    return "<div> <a href='javascript:redirectToAPMAvailability(\""+rowdata.RESOURCEID+"\",\""+rowdata.AVAILABILITYATTRIBUTEID+"\")'><i title='" +rowdata.AVAILABILITYSTATUS+"' class='apm-availability-status "+STATUS+"'></i><span style='text-transform:capitalize;'>"+escapeHTML(rowdata.AVAILABILITYSTATUS)+"</span></a></div>";//No I18N
}
function apmMonitorFomatter(cellValue, options, rowdata, action)
{
    return "<a href='javascript:redirectToAPMMonitor(\""+rowdata.RESOURCEID+"\")'>"+escapeHTML(cellValue)+"</a>"; //No I18N
}
function apmMonitorTypeFormatter(cellValue, options, rowdata, action)
{
    return "<a href='javascript:redirectToAPMAlarmType(\""+rowdata.MONITORTYPE+"\")'><div class = app-icon-div ><i title='" +rowdata.TYPE+"' class='"+rowdata.MONITORICONNAME+"'></i>"+rowdata.TYPE+"</div></a>";//No I18N
}
function apmMonitorRCAFormattedMessage(cellValue, options, rowdata, action)
{
    return opm_removeHTMLTags(cellValue).replaceAll("&nbsp;",""); //No I18n
}
function apmMonitorAlarmActionFormattedMessage(cellvalue, options, rowdata, action) {   
    var configAlarm = "void(0)"; //No I18N
    var editMonitor = "void(0)"; //No I18N

    if (window.OPM.isAPMAdmin) {
        configAlarm = "redirectToAPMAlarmConfigAlarm(" + rowdata.RESOURCEID + ")"; //No I18N
        editMonitor = "redirectToAPMEditAlarm(" + rowdata.RESOURCEID + ", \"" + rowdata.MONITORTYPE + "\",\"" + rowdata.DISPLAYNAME + "\")"; //No I18N
    }

     return "<div class='center-div'>" + //No I18N
                "<a title='"+Ember.I18n.t('webclient.inventory.configure') +" "+Ember.I18n.t('webclient.Alarm')+"' class='pr-sm' href='javascript:" + configAlarm + "'>" + //No I18N
                    "<svg class='svgIcon size14'>" + //No I18N
                        "<use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#config-outline'></use>" + //No I18N
                    "</svg>" + //No I18N
                "</a>" + //No I18N
                "<a title='"+Ember.I18n.t('webclient.action.editgraph')+"' class='pr-sm' href='javascript:" + editMonitor + "'>" + //No I18N
                    "<svg class='svgIcon size14'>" + //No I18N
                        "<use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#edit-o'></use>" + //No I18N
                    "</svg>" +
                "</a>" +  //No I18N
            "</div>"; //No I18N
}
function opm_MerakiWANLinkName(cellValue,options,rowdata,action)
{
    return "<i class='icon-status"+rowdata.status+"'></i> "+opm_escapeHTML(rowdata.displayName);//No I18N
}

function opm_MerakiMXWANState(cellValue,options,rowdata,action)
{
    if(window.OPM.userPermissions.monitoringWrite)
    {
        var isChecked='';
        if(rowdata.managed === "true") {
            isChecked='checked';//No I18N
        }
        var actionsStr = '<div class="flex flex-middle-align">';//No I18N
        if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
            actionsStr += '<div class="pointer" title="'+Ember.I18n.t("webclient.devices.details.edit",this)+'" onClick="configureThresholdForMXUplink(false,false,\''+escapeHTML(rowdata.name)+'\',\''+escapeHTML(rowdata.moid)+'\')"><svg class="svgIcon size16 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit" /></svg></div>';//No I18N
        }
        actionsStr += "<div class='chkRoundBtn'><input class='nbarStatusCBox' type='checkbox' value='"+htmlEncode(rowdata.uplinkState)+"' "+isChecked+" onclick='setWANLinkEnableDisable(this, \""+rowdata.managed+"\",\""+rowdata.name+"\")'/><label></label></div>";//No I18N
        return actionsStr+"</div>";//No I18N
    }
}

function setWANLinkEnableDisable(tis,state,name)
{
    var isMerakiUplink = false;
    if(state === 'true')
    {
        isMerakiUplink=true;
    }
    var url = window.OPM.apiUrlPattern + '/device/setManaged'; //No I18N
    var reqData = {type: "MerakiUplink",isMerakiUplink:true,name:name,manage:!isMerakiUplink}; //No I18n
    var response = opm_ajaxPostRequest(url,reqData);
    showMessage(response);
    $(".dashboardWidgetIcons").find("i[data-name='opm.merakimx.wanlink']").trigger("click");
}

function opm_WANLinkAvailData(cellValue,options,rowdata,action)
{
   return "<i class='opm_link' onclick='redirectToAvailabilitySlide(\""+opm_escapeHTML(rowdata.name)+"\",\""+opm_escapeHTML(rowdata.moid)+"\")'>"+opm_escapeHTML(rowdata.availability)+"%"+"</i>";//No I18N
}

function redirectToAvailabilitySlide(wanName, wanMoid)
{
    redirectSnapShot("AvailabilityGraph"); //No I18N
    OPMClient.InventoryDeviceDetailsController.set('WANLinkAvailability', true); //No I18n
    OPMClient.InventoryDeviceDetailsController.set('wanName', wanName); //No I18n
    OPMClient.InventoryDeviceDetailsController.set('wanLinkMoID', wanMoid); //No I18n
}

function opm_wanLinkMonData(cellValue,options,rowdata,action)
{
    var unit="";
    if(rowdata.lossPercent !== "NA" && options.colModel.name === "lossPercent") { //No I18n
        unit="%"; //No I18n
    } else if(rowdata.latencyMs !== "NA" && options.colModel.name === "latencyMs") { //No I18n
        unit=" ms"; //No I18n
    }
    return "<i class='opm_link' onclick='navToWANLinkPerfGraphPage(\""+rowdata.name+"\",\""+options.colModel.name+"\",\""+rowdata.displayName+"\")'>"+opm_escapeHTML(cellValue)+unit+"</i>";//No I18N
}

function redirectToSnapshotFromPerfGroup(cellValue, options, rowdata, action)
{
    if(rowdata.moName !== undefined)
    {
        return "<a href='javascript:removePerfGroupEntityDetailsFromController();redirectToSnapshot(\"MonitoringDevice\", \""+rowdata.moName+"\");'>"+escapeHTML(cellValue)+"</a>"; //No I18N
    }
}
function redirectToPerfMonitorFromPerfGroup(cellValue, options, rowdata, action)
{
    if(!window.OPM.isOPMLiteEdition && !(window.OPM.isMSPEdition && OPMClient.ApplicationController.isMSPCentralSelected) && window.OPM.userPermissions.monitoringWrite){
        return "<span class='cursorPointer' onclick='removePerfGroupEntityDetailsFromController();OPMClient.Settings.openEditPerformanceMonitorsSlide(\""+rowdata.graphName+"\",\""+rowdata.graphId+"\",\""+rowdata.customGraph+"\")'>"+escapeHTML(cellValue)+"</span>";//No I18N
    }else{
        return "<span>"+escapeHTML(cellValue)+"</span>";//No I18N
    }
}

function navToWANLinkPerfGraphPage(wanName, colModel, wanDisplayName)
{
    OPMClient.InventoryDeviceDetailsController.set('isMerakiWanLinkGraph', true); //No I18n
    OPMClient.InventoryDeviceDetailsController.set('wanName', wanName); //No I18n
    OPMClient.InventoryDeviceDetailsController.set('wanDisplayName', wanDisplayName); //No I18n
    OPMClient.InventoryDeviceDetailsController.set('wanLinkInstance', colModel); //No I18n
    var colName = "";
    if(colModel === "lossPercent")
    {
        colName = Ember.I18n.t('webclient.reports.createreport.packetloss',this); // No I18n
    }
    else if(colModel === "latencyMs")
    {
        colName = Ember.I18n.t('nfa.dpi.responsetime',this); // No I18n
    }
    else if(colModel === "txBytes")
    {
        colName = Ember.I18n.t('opm.merakimx.sentbytes',this); // No I18n
    }
    else if(colModel === "rxBytes")
    {
        colName = Ember.I18n.t('opm.merakimx.receivedbytes',this); // No I18n
    }
    OPMClient.InventoryDeviceDetailsController.set('wanGraphHeaderName', colName); //No I18n
    var graph_PolicyName = "MerakiUplinkLossAndLatency"; //No I18n
    if(colModel === "rxBytes" || colModel === "txBytes")
    {
        graph_PolicyName = "MerakiUplinkUsage"; //No I18n
    }
    OPMClient.InventoryDeviceDetailsController.set('wanGraphPolicyName', graph_PolicyName); //No I18n
    openPerformanceMonEnhancedGraph(graph_PolicyName,graph_PolicyName,false,true,wanDisplayName+" "+"( "+colName+" )");
}

var prevlbCellVal = {};
function lbReportCellAttr(rowId, val, rawObject, cm, rdata){
    var result;
    if (prevlbCellVal.value == val) {
        result = ' style="display: none" rowspanid="' + prevlbCellVal.cellId + '"';//No I18N
        var currCount = Number($("td[id='"+prevlbCellVal.cellId+"']").attr("rowspan"))+1;//No I18N
        $("td[id='"+prevlbCellVal.cellId +"']").attr("rowspan",currCount);//No I18N
    }
    else {
        var cellId = this.id + '_row_' + rowId + '_' + cm.name;//No I18N
        result = ' rowspan="1" id="' + cellId + '"';//No I18N
        prevlbCellVal = { cellId: cellId, value: val };
    }
    return result;
}

function showPingResponse(cellValue,options,rowdata,action)
{
     var resp = "";
     if(cellValue!==""){
         resp = cellValue.replace(/\n/g, '<br />');//No I18N
     }
     return resp;
}
function updateAutoAddDiscovery(cellValue, options, rowdata, action){
    return "<span class='pointer chkRoundBtn small' style='float:left'><input type='checkbox' class='pointer' id='"+options.gid+"_"+options.rowId+"' title='"+Ember.I18n.t(rowdata.autoAdd ? 'webclient.action.disable' : 'webclient.admin.StatusPoll.Enable')+"' onchange=doAppServiceActions("+options.rowId+",false,true) "+(rowdata.autoAdd ? 'checked' : '')+"><label></label></span>";//No I18N
}
function getApplicationServiceActions(cellValue, options, rowdata, action){
  return "<div class='flex flex-middle-align'><span class='pointer size16' title='"+Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices')+"' onclick=doAppServiceActions("+options.rowId+",false,false)><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#associate'></use></svg></span><span class='pointer size16' title='"+Ember.I18n.t('webclient.msp.billing.dissociate')+"' onclick=doAppServiceActions("+options.rowId+",true,false)><svg class='svgIcon size16 ml-sm'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#dissociate'></use></svg></span></div>";//No I18n;
}
function lastCollectedTimeMin(cellValue,options,rowdata,action){
    if(cellValue){
        return '<span title="'+Ember.I18n.t('opm.intfdata.collectedtime')+': '+(rowdata.minCollectionTime !== undefined ? convertDateAndTime(parseInt(rowdata.minCollectionTime)) : Ember.I18n.t('webclient.devices.details.service.resalert'))+'">'+escapeHTML(cellValue)+'</span>';//No I18N
    }else{
        return '<span title="'+Ember.I18n.t('webclient.devices.details.service.resalert')+'">-</span>';//No I18N
    }
}
function lastCollectedTimeMax(cellValue,options,rowdata,action){
    if(cellValue){
        return '<span title="'+Ember.I18n.t('opm.intfdata.collectedtime')+': '+(rowdata.maxCollectionTime !== undefined ? convertDateAndTime(parseInt(rowdata.maxCollectionTime)) : Ember.I18n.t('webclient.devices.details.service.resalert'))+'">'+escapeHTML(cellValue)+'</span>';//No I18N
    }else{
        return '<span title="'+Ember.I18n.t('webclient.devices.details.service.resalert')+'">-</span>';//No I18N
    }
}
function bgpMonitorsActions(cellValue, options, rowdata, action){
    var checked = "checked";//No I18n
    var statusTitle = Ember.I18n.t('Managed', this); //No I18N
    if(rowdata.status!==undefined && rowdata.status == 7) {
        checked = "";
        statusTitle = Ember.I18n.t('UnManaged', this); //No I18N
    }
    var actionsStr = '<div class="flex flex-middle-align">';//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
        actionsStr += '<div class="pointer" title="'+Ember.I18n.t("webclient.devices.details.edit",this)+'" onClick="redirectToBGPAlertsThresholds(false,false,'+escapeHTML(rowdata.moId)+',\''+escapeHTML(rowdata.peerIndex)+'\')"><svg class="svgIcon size16 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit" /></svg></div>';//No I18N
    }
    //actionsStr += '<div class="pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToBGPGraphs('+escapeHTML(rowdata.moId)+',\''+escapeHTML(rowdata.peerIndex)+'\',\''+escapeHTML(rowdata.peerAddress)+'\')"><svg class="svgIcon size16 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#graph"/></svg></div>';//No I18N
    actionsStr += '<div class="pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToBGPGraphs('+escapeHTML(rowdata.moId)+',\''+escapeHTML(rowdata.peerIndex)+'\',\''+escapeHTML(rowdata.peerAddress)+'\',\''+escapeHTML(rowdata.peerAsNumber)+'\')"><svg class="svgIcon size16 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#graph"/></svg></div>';//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
        actionsStr += '<div class="chkRoundBtn ml-xs"><input type="checkbox" '+checked+' title="' + statusTitle + '" onclick="doManageOrUnmanageBGPPeers(false,false,false,'+escapeHTML(rowdata.moId)+',this);"><label></label></div>';//No I18N
    }
    actionsStr += '</div>';//No I18N
    return actionsStr;
}


function bgpMonitorsStatus(cellValue, options, rowdata, action) {
    var status = rowdata.status;
    if(status< 5) {
        status = 1;
    }
    var str = "<div class='inline-flex flex-center'>";//No I18N
    str += "<i class='severity_"+status+" size10 circle inline-block mr-xs'></i><i>"+cellValue+"</i>"; //No I18N
    if(rowdata.isAlarmSuppressed) {
        str += '<i title="'+Ember.I18n.t("webclient.interfaces.status.suppressalarm",this)+'" class="size14 mr-xs ml-xs"><svg class="svgIcon size14 inline-block"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></i>'; //No I18N
    }
    str += "</div>";//No I18N
    return str;
}

function assocTypesDispNamesFormatter(cellValue,options,rowdata,action) {
    var assocTypesDispNames = {
        "MANUAL": Ember.I18n.t("webclient.general.Devices"), //No I18n
        "BY_DEVICE_GROUP": Ember.I18n.t("jsp.commonstr.DeviceGroup"), //No I18n
        "BY_INTERFACE_GROUP": Ember.I18n.t("alertProfile.interfaceGroup") //No I18n
    }
    return assocTypesDispNames[rowdata.associationType]
}
function ziaAlertMessage(cellValue, options, rowdata, action){
    var bgClass = "", sevText="";
    if(rowdata.severity===1){
        bgClass = "--fault-severity severity_1-bg";//No I18N
        sevText = Ember.I18n.t("webclient.map.flash.Critical",this);//No I18N
    }else if(rowdata.severity===2){
        bgClass = "--fault-severity severity_2-bg";//No I18N
        sevText = Ember.I18n.t("webclient.admin.alarmesc.trouble",this);//No I18N
    }else if(rowdata.severity===3){
        bgClass = "--fault-severity severity_3-bg";//No I18N
        sevText = Ember.I18n.t("webclient.admin.threshold.Attention",this);//No I18N
    }else if(rowdata.severity===4){
        bgClass = "--fault-severity severity_4-bg";//No I18N
        sevText = Ember.I18n.t("webclient.map.flash.ServiceDown",this);//No I18N
    }else{
        bgClass = "--fault-severity severity_5-bg";//No I18N
        sevText = Ember.I18n.t("jsp.tools.sysoid.GetSysObjectID.Clear",this);//No I18N
    }
    return '<div class="infoMssg alarm-row ziaMsg nps_speedIcon '+bgClass+'" title=""><i title="'+sevText+'" class="fs18 --fault-severity icon-status'+opm_escapeHTML(rowdata.severity)+'"></i><h3 class="cursorPointer" onclick="redirectToAlarm(\''+opm_escapeHTML(rowdata.alarmid)+'\')" title="'+opm_escapeHTML(cellValue)+'">'+opm_escapeHTML(cellValue)+'</h3><div style="left:22px;display:inline-flex;width:100%"><span class="cursorPointer" style="max-width: calc(100% - 260px);" title="'+opm_escapeHTML(rowdata.displayName)+'" onclick="redirectToDeviceSnapshot(\''+opm_escapeHTML(rowdata.source)+'\')">'+opm_escapeHTML(rowdata.displayName)+'</span><span style="color:#8a8e91;">&nbsp;&nbsp;|&nbsp;&nbsp;</span><span title="'+opm_escapeHTML(rowdata.category)+'">'+opm_escapeHTML(rowdata.category)+'</span><span style="color:#8a8e91;">&nbsp;&nbsp;|&nbsp;&nbsp;</span><span title="'+opm_escapeHTML(rowdata.time)+'">'+opm_escapeHTML(rowdata.time)+'</span></div></div>';//No I18N
}
function ziaAPossibleImpact(cellValue, options, rowdata, action){
    var impactStr = '<div class="infoMssg ziaMsg ziaImpactColorCode disLineBlock" title="'+opm_escapeHTML(cellValue)+'"><p>'+opm_escapeHTML(cellValue)+'</p>';//No I18N
    if(rowdata.impactProps!==undefined && OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide")===-1 && !window.OPM.isEmbed){
        if(!(rowdata.isLinkRxRecommendation || rowdata.isLinkTxRecommendation)){
            impactStr += "<a onclick='opm_listProfiles(\"listData\",\"impactProps\",this)'>"+Ember.I18n.t("webclient.nfa.addOnMarketing.clickHere",this)+"</a> "+Ember.I18n.t("webclient.zia.list.moreservices.txt",this)+" "+opm_escapeHTML(rowdata.impactProps.displayName).toLowerCase()+".";//No I18N
        }else if(window.OPM.isNfaPlug && window.OPM.isNFAEnabled && rowdata.impactProps.data!==undefined && rowdata.impactProps.data.length>0){
            impactStr += "<a onclick='nfa_redirectToSnapshot(\"FlowInterface\",\""+rowdata.impactProps.data[0]+"\", \"opm.interface.topconv\", "+(rowdata.isLinkRxRecommendation?"\"IN\"":"\"OUT\"")+", \"Conversation\", \"30Days\")'>"+Ember.I18n.t("webclient.nfa.addOnMarketing.clickHere",this)+"</a> "+Ember.I18n.t("webclient.zia.list.moreservices.txt",this)+" "+opm_escapeHTML(rowdata.impactProps.displayName)+".";//No I18N
        }
    }
    impactStr += "</div>";//No I18N
    return impactStr;
}
function ziaRecommendations(cellValue, options, rowdata, action){
    var recommendStr =  '<div class="infoMssg ziaMsg ziaRecommendColorCode disLineBlock" title="'+opm_escapeHTML(cellValue)+'"><p>'+opm_escapeHTML(cellValue)+'</p>';//No I18N
    if(rowdata.recommendationProps!==undefined && OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide")===-1 && !window.OPM.isEmbed){
        if(!(rowdata.isLinkRxRecommendation || rowdata.isLinkTxRecommendation)){
            recommendStr += "<a onclick='opm_listProfiles(\"listData\",\"recommendationProps\",this)'>"+Ember.I18n.t("webclient.nfa.addOnMarketing.clickHere",this)+"</a> "+Ember.I18n.t("webclient.zia.list.moreservices.txt",this)+" "+opm_escapeHTML(rowdata.recommendationProps.displayName).toLowerCase()+".";//No I18N
        }else if(window.OPM.isNfaPlug && window.OPM.isNFAEnabled && rowdata.recommendationProps.data!==undefined && rowdata.recommendationProps.data.length>0){
            recommendStr += "<a onclick='nfa_redirectToSnapshot(\"FlowInterface\",\""+rowdata.recommendationProps.data[0]+"\", \"opm.interface.topqos\", "+(rowdata.isLinkRxRecommendation?"\"IN\"":"\"OUT\"")+", \"DSCP\", \"30Days\")'>"+Ember.I18n.t("webclient.nfa.addOnMarketing.clickHere",this)+"</a> "+Ember.I18n.t("webclient.zia.list.moreservices.txt",this)+" "+opm_escapeHTML(rowdata.recommendationProps.displayName)+".";//No I18N
        }
    }
    recommendStr += "</div>";//No I18N
    return recommendStr;
}
function ziaActions(cellValue, options, rowdata, action){
    var actionStr = "";
    if(window.OPM.showWorkflow)
    {
        actionStr += '<em class="svgIcon size16 pointer mr-sm" title="'+Ember.I18n.t("webclient.workflow.executewf",this)+'" onclick="opm_listProfiles(\'Workflow\',\''+rowdata.alarmid+'\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#execute-workflow"/></svg></em>';//No I18N
    }
    if(opm_hideSettings() && !opm_hideNTemplateLink() && !window.OPM.isMSPEdition && window.OPM.userPermissions.notificationProfileWrite && window.OPM.userPermissions.dashboardWrite) {
        actionStr += '<em class="svgIcon size16 pointer mr-sm" title="'+Ember.I18n.t("webclient.admin.profiledetails.LogaTicket",this)+'" onclick="opm_listProfiles(\'LogATicket\',\''+rowdata.alarmid+'\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#log-ticket"/></svg></em>';//No I18N
        if(window.OPM.userPermissions.tpiSettingsWrite) {
            actionStr += '<em class="svgIcon size16 pointer mr-sm" title="'+Ember.I18n.t("webclient.zia.widget.forecastalarms.runplaybook",this)+'" onclick="opm_listProfiles(\'runPlayBook\',\''+rowdata.alarmid+'\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#playbook"/></svg></em>';//No I18N
        }
    }
    return actionStr;
}

function toggleSubGridRowForGridID(event, gridId, rowId, isFocus) {
    $('#' + gridId).jqGrid('toggleSubGridRow', rowId);

    var subgridIndicatorSelector = '#' + gridId + "_" + rowId + '_expandedContent';
    var isExpanded = $(subgridIndicatorSelector).length > 0 && $(subgridIndicatorSelector).is(':visible');

    if(isFocus && isExpanded) {
        var scrollContainer = $("#gview_" + gridId +"> div.ui-jqgrid-bdiv");
        var targetScrollPosition = $(event.target).offset().top - scrollContainer.offset().top + scrollContainer.scrollTop();
        scrollContainer.animate({ scrollTop: targetScrollPosition }, 'slow');
    }
}

function lbStatusFormattter(cellValue, options, rowdata, action){
    if(cellValue!==undefined)
    {
        var statusTitle = "";
        if(rowdata.availStateStr!==undefined){
            statusTitle = rowdata.availStateStr;
        }
        if(rowdata.enableStateStr!==undefined){
            statusTitle += " ("+rowdata.enableStateStr+")";
        }
        if(rowdata.statusReason!==undefined){
            if(statusTitle!==""){
                statusTitle += " - ";
            }
            statusTitle += rowdata.statusReason;
        }
        if(cellValue===2){
            return "<div class='wlcTabStatus f5ToolTipReason text-white status-solid-down' data-tooltip=\""+statusTitle+"\" data-tooltip-position='right'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#status-down'></use></svg></div>";//No I18N
        }else{
            return "<div class='wlcTabStatus f5ToolTipReason text-white status-solid-up' data-tooltip=\""+statusTitle+"\" data-tooltip-position='right'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#status-up'></use></svg></div>";//No I18N
        }
    }else{
        return "";
    }
}
function LBPoolNameFormattter(cellValue, options, rowdata, action)
{
    if(cellValue!==undefined){
        return cellValue;
    }else{
        return "-";
    }
}
function LBPoolMembersFormattter(cellValue, options, rowdata, action){
    var formatText = "";
    if(cellValue!==undefined)
    {
        if(cellValue.length===0)
        {
            formatText = "-";
        }else{
            var customClassName = (cellValue.length>5)?'mr-xs size24':'mr-lg';//No I18N
            formatText = "<div class='flex flex-middle-align'><span class='m-none "+customClassName+"'>"+escapeHTML(cellValue.length)+"</span><span>";//No I18N
            for(var i=0;i<cellValue.length;i++)
            {
                var rsList = Object.keys(cellValue[i]);
                if(rsList.length>0)
                {
                    var rsipAddress = rsList[0];
                    var rsStatus = cellValue[i][rsipAddress];
                    if(rsStatus===1){
                        formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-down' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.devices.intftypes.down",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                    }
                    else if(rsStatus===7){
                        formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-neutral' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.admin.scheduledt.disabled",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                    }
                    else if(rsStatus===5){
                        formatText += "<span class='wlcTabStatus inline-block m-none mr-xs status-solid-up' data-tooltip='"+escapeHTML(rsipAddress)+" - "+Ember.I18n.t("webclient.devices.intftypes.up",this)+"' data-tooltip-position='top'><svg class='size10 circle'></svg></span>";//No I18N
                    }
                }
            }
            formatText += "</span></div>";//No I18N
        }
    }else{
        formatText = "-";
    }
    return formatText;
}
function lbIPFormattter(cellValue, options, rowdata, action)
{
    var index,name,moId;
    if($(".LBSnapshot ul li.active").attr('name')==="virtualServer"){//No I18N
        moId = rowdata.vsMoId;
        index = rowdata.displayName;
        name = (rowdata.vsName!==undefined && rowdata.vsName!=="")?rowdata.vsName:rowdata.vsIpAddress;
    }else{
        moId = rowdata.pmMoId
        index = rowdata.displayName;
        name = (rowdata.poolName!==undefined && rowdata.poolName!=="")?rowdata.poolName:rowdata.nodeIp;
    }
    return '<span class="opm_link" onclick="redirectToLBChildDetailsPage('+escapeHTML(moId)+',\''+escapeHTML(index)+'\','+escapeHTML(rowdata.status)+',\''+escapeHTML(name)+'\')">'+escapeHTML(cellValue)+'</span>';//No I18N
}
function ziaRedirectAlarmFormatter(cellValue, options, rowdata, action)
{
    var retStr = '<div class="alarm-row iFrameApmPluginsImg"><span class="statusColor --fault-severity severity_'+escapeHTML(rowdata.statusNum)+'" title="'+escapeHTML(rowdata.severityString)+'"></span><h3 class="ziaAlarmMsgFormat cursorPointer" title="'+escapeHTML(cellValue)+'" onclick="redirectToAlarm(\''+rowdata.alarmId+'\')">'+escapeHTML(cellValue)+'</h3>';//No I18N
	var displayName = rowdata.displayName!==undefined?rowdata.displayName:(rowdata.deviceName!==undefined?rowdata.deviceName:"");//No I18N
	if(displayName!==undefined && displayName!=="")//No I18N
	{
		retStr += '<div title="'+escapeHTML(displayName)+'">'+escapeHTML(displayName)+'</div>';//No I18N
	}
    if(rowdata.modTime!==undefined && rowdata.modTime!=="")//No I18N
    {
        retStr += '<div title="'+escapeHTML(rowdata.modTime)+'">'+escapeHTML(rowdata.modTime)+'</div>';//No I18N
    }
    retStr += '</div>';//No I18N
	return retStr;
}

function ziaDisplayTimeFormatter(cellValue, options, rowdata, action)
{
    return '<span title="'+rowdata.addedTime+'">'+cellValue+'</span>';//No I18N
}
function opm_NGFWSLAName(cellValue, options, rowdata, action)
{
    var str = "<div class='inline-flex flex-center'>";//No I18N
    str += "<i class='--fault-severity icon-status"+rowdata.status+"'></i><i>"+escapeHTML(rowdata.slaName)+"</i>"; //No I18N
    if(rowdata.isSuppressed && rowdata.isSuppressed !== "f") {
        str += '<i title="'+Ember.I18n.t("webclient.interfaces.status.suppressalarm",this)+'" class="size14 mr-xs ml-xs"><svg class="svgIcon size14 inline-block"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></i>'; //No I18N
    }
    str += "</div>";//No I18N
    return str;
}
function opm_ngfwMetricSort(cell)
{
    if(cell === undefined || cell === null){
        return Number.POSITIVE_INFINITY;
    }
    var cellStr = (typeof cell === "string") ? $.trim(cell) : String(cell);//No I18N
    if(cellStr === "" || cellStr === "-" || cellStr.toUpperCase() === "NA" || cellStr.toUpperCase() === "N/A"){//No I18N
        return Number.POSITIVE_INFINITY;
    }
    var num = parseFloat(cellStr);
    return isNaN(num) ? Number.POSITIVE_INFINITY : num;
}
function opm_SDWANTunnelsStatus(cellValue, options, rowdata, action)
{
    var str = "<div class='inline-flex flex-center'>";//No I18N
    str += "<i class='--fault-severity icon-status"+rowdata.status+"'></i><i>"+escapeHTML(rowdata.displayName)+"</i>"; //No I18N
    //str += "<i class='severity_"+rowdata.status+" size10 circle inline-block mr-xs'></i><i>"+escapeHTML(rowdata.displayName)+"</i>"; //No I18N
    if(rowdata.isSuppressed && rowdata.isSuppressed !== "f") {
        str += '<i title="'+Ember.I18n.t("webclient.interfaces.status.suppressalarm",this)+'" class="size14 mr-xs ml-xs"><svg class="svgIcon size14 inline-block"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></i>'; //No I18N
    }
    str += "</div>";//No I18N
    return str;
}
function opm_SDWANTunnelsHealth(cellValue, options, rowdata, action)
{
    var statusStr_tnl = "NA";//No I18N
    var statusNum = "7";//No I18N
    if(cellValue == "red")//No I18N
    {
         var statusStr_tnl=Ember.I18n.t('widget.header.sdwan.state.poor',this);;  //No I18N
         statusNum = "1";
    }
    else if(cellValue == "yellow")//No I18N
    {
        var statusStr_tnl=Ember.I18n.t('widget.header.sdwan.state.fair',this);   //No I18N
        statusNum = "2";
    }
    else if(cellValue == "green")//No I18N
    {
        statusNum = "5";
        var statusStr_tnl=Ember.I18n.t('widget.header.sdwan.state.good',this);;//No I18N
    }
  //  return "<i class='icon-status"+statusNum+"'></i> "+statusStr_tnl;
    return statusStr_tnl;
}
function sdwanSiteDisplayNameDevices(cellValue, options, rowdata, action){
    var str = "<div class='inline-flex flex-center'>";//No I18N
    str += "<i class='--fault-severity icon-status"+rowdata.status+"'></i><i>"+escapeHTML(cellValue)+"</i>"; //No I18N
    if(rowdata.isSuppressed) {
        str += '<i title="'+Ember.I18n.t("webclient.interfaces.status.suppressalarm",this)+'" class="size14 mr-xs ml-xs"><svg class="svgIcon size14 inline-block"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></i>'; //No I18N
    }
    str += "</div>";//No I18N
    return str;
}
function setSDWANEdgeDevices(cellValue, options, rowdata, action)
{
    if(rowdata.advanceMonitoringEnabled!==undefined && rowdata.advanceMonitoringEnabled === "true")
    {
        if(rowdata.deviceMOName !== undefined && rowdata.parentDisplayName!==undefined)
        {
            return "<div onclick='redirectToDeviceSnapshot(\""+rowdata.deviceMOName+"\")'><a class='textBlue'>"+escapeHTML(rowdata.parentDisplayName)+"</a></div>";//No I18N        
        }
        else if(rowdata.deviceMOName !== undefined) {
            return "<div onclick='redirectToDeviceSnapshot(\""+rowdata.deviceMOName+"\")'><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a></div>";//No I18N
        }
    }
    else{
        return "<div><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a></div>";//No I18N
    }
}
function setOLTDeviceStatus(cellValue, options, rowdata, action)
{
    if(rowdata.oltMOName !== undefined &&  rowdata.oltDisplayName!==undefined)
    {
        return "<div onclick='redirectToDeviceSnapshot(\""+rowdata.oltMOName+"\")'><a class='textBlue'>"+escapeHTML(rowdata.oltDisplayName)+"</a></div>";//No I18N        
    }
    else{
        if(rowdata.parentDisplayName!==undefined)
        {
            return "<div><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.parentDisplayName)+"</a></div>";//No I18N
        }else{
            return "<div><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a></div>";//No I18N
        }
    }
}

function opm_SDWANDeviceCount(cellValue, options, rowdata, action)
{
      var memberStatus = "showCount_1";//No I18N
    if(rowdata.downCount!==undefined && rowdata.downCount === "0"){//No I18N
        memberStatus = "showCount_5";//No I18N
    }
    return "<div><span class='"+memberStatus+"'>"+opm_escapeHTML(rowdata.downCount)+"</span> / "+opm_escapeHTML(cellValue)+"</div>";    //No I18N

}

function formatSyncOperationType(cellValue,options,rowdata,action) {
    if(cellValue === "ADD") {
        return Ember.I18n.t('ncm.pam.sync.account.add', this);  //No I18N
    }
    else if(cellValue === "UPDATE") {
        return Ember.I18n.t('ncm.pam.sync.account.update', this);   //No I18N
    }
    else if(cellValue === "DELETE") {
        return Ember.I18n.t('ncm.pam.sync.account.delete', this);   //No I18N
    }
    return escapeHTML(cellValue);
}

function ncmConfigFormatter(rowData){
    var confJson = JSON.parse(JSON.stringify(rowData));
    if(confJson.versionId != 'None'){
        return '<a class="opm_link" target="_blank" href="'+window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+confJson.versionId+'">&nbsp;'+escapeHTML('Show')+'</a>'; // No I18N
    } else {
        return 'Not available'; //No I18n
    }
}
function commandTemplateActions(cellValue, options, rowdata, action)
{
    var title = Ember.I18n.t('highperf.test'); // NO I18N
    return "<a style='float:left;' class='ncmLink' title='"+title+"' onclick='testCommandTemplate(\""+options.rowId+"\")'>"+title+"</a>";
}
function testCommandTemplate(id){
    if(!window.OPM.userPermissions.ncmComplianceWrite){
        OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('webclient.common.restrictionMsg', this)); // NO I18N
        return;
    }
    OPMClient.NCMComplianceTemplatesController.testDetails.templateId = id;
    location.href = OPMClient.NCMComplianceListController.baseUrl +"/CommandTemplates/All/Test"; // No I18N
}
function ncmRuleVariableFormatter(cellValue,options,rowdata,action){
    return cellValue;
}
function ncmRuleCriteriaFormatter(cellValue,options,rowdata,action){
    if(cellValue){
        if(cellValue.toUpperCase() == 'FLOW'){
            return Ember.I18n.t('Flow', this); // No I18N
        }
        if(cellValue.toUpperCase() == 'ADVANCED'){
            return Ember.I18n.t('jsp.commonstr.AdvancedCriteria', this); // No I18N
        }
        if(cellValue.toUpperCase() == 'ADVANCEDBLOCKCRITERIA'){
            return Ember.I18n.t('jsp.commonstr.AdvancedCustomCriteria', this); // No I18N
        }
    }
    return Ember.I18n.t('jsp.commonstr.SimpleCriteria', this); // No I18N
}
function standardRuleFormatter(cellValue, options, rowdata, action){
    if(cellValue == 'true' || cellValue == true) {
        return Ember.I18n.t('webclient.terminal.custom', this); // No I18N
    }
    return Ember.I18n.t('standard', this); // No I18N
}

function setSitesHealth(cellValue, options, rowdata, action)
{
        if(rowdata.siteStatus == 2)
        {
            rowdata.siteStatus = 1;
        }
         if(rowdata.siteStatus == 3)
        {
            rowdata.siteStatus = 2;
        }
		        return "<i class='--fault-severity icon-status"+rowdata.siteStatus+"'></i>"+escapeHTML(cellValue);//No I18N
		}
function sdwanSitesActions(cellValue, options, rowdata, action){
    var actionsStr = '<div class="flex flex-middle-align">';//No I18N
    actionsStr += '<em class="svgIcon size16 mr-sm pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToChildElementAvailGraph('+escapeHTML(rowdata.siteMOID)+',\''+escapeHTML(rowdata.siteMOName)+'\','+escapeHTML(rowdata.siteDisplayName)+')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#line-chart"/></svg></em>';
    actionsStr += '</div>';//No I18N
    return actionsStr;
}
function redirectToSAWANHost(cellValue, options, rowdata, action)
{
    if(rowdata.moName !== undefined) {
        return "<a onclick='redirectToDeviceSnapshot(\""+rowdata.moName+"\")' class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a>";//No I18N
    }
    else{
        return cellValue;
    }
}
function sdwanTunnelActions(cellValue, options, rowdata, action){
    var checked = "checked";//No I18n
    var statusTitle = Ember.I18n.t('Managed', this); //No I18N
    OPMClient.InventoryDeviceDetailsController.tunnelDispName = rowdata.instance;
    if(rowdata.isManaged!==undefined && rowdata.isManaged == "false") {
        checked = "";
        statusTitle = Ember.I18n.t('UnManaged', this); //No I18N
    }
    var actionsStr = '<div class="flex flex-middle-align">';//No I18N
     if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite && (rowdata.tunnelType===undefined || rowdata.tunnelType==="overlay" || rowdata.tunnelType==="ipsec")) {
       // actionsStr += '<div class="pointer" title="'+Ember.I18n.t("webclient.devices.details.edit",this)+'" onClick="configChildElementAlertsThresholds(false,false,'+escapeHTML(rowdata.tunnelMOID)+',\''+escapeHTML(rowdata.instance)+'\')"><svg class="svgIcon size16 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit" /></svg></div>';//No I18N
        actionsStr += '<em class="svgIcon size16 mr-sm pointer" title="'+Ember.I18n.t("webclient.devices.details.edit",this)+'" onClick="configChildElementAlertsThresholds(false,false,'+escapeHTML(rowdata.tunnelMOID)+',\''+escapeHTML(rowdata.instance)+'\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil"/></svg></em>';
    }
    // actionsStr += '<em class="svgIcon size16 mr-sm pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToChildElemGraphs('+escapeHTML(rowdata.tunnelMOID)+',&#39;'+escapeHTML(rowdata.instance)+'&#39;,&#39;'+rowdata.displayName+'&#39;,&#39;'+rowdata.deviceID+'&#39;)"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#line-chart"/></svg></em>';
   if(rowdata.tunnelType===undefined || rowdata.tunnelType==="overlay" || rowdata.tunnelType==="ipsec"){
    var instanceDispName = rowdata.displayName || rowdata.slaName || ''; //No I18N
    actionsStr += '<div class="perfMonitorGraph pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToChildElemGraphs('+escapeHTML(rowdata.tunnelMOID)+',&#39;'+escapeHTML(rowdata.instance)+'&#39;,&#39;'+escapeHTML(instanceDispName)+'&#39;,&#39;'+escapeHTML(rowdata.deviceMOName)+'&#39;)"></div>';//No I18N
   }
   // actionsStr += '<div class="perfMonitorGraph pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToChildElemGraphs('+escapeHTML(rowdata.tunnelMOID)+',&#39;'+escapeHTML(rowdata.instance)+'&#39;,&#39;'+rowdata.displayName+'&#39;)"></div>';//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
        actionsStr += '<div class="chkRoundBtn"><input type="checkbox" '+checked+' title="' + statusTitle + '" onclick="doManageUnManageSDWanChilds(false,false,'+rowdata.isManaged+',&#39;Tunnel&#39;,'+escapeHTML(rowdata.tunnelMOID)+',this);"><label></label></div>';//No I18N
    }
    actionsStr += '</div>';//No I18N
    return actionsStr;
}

function sdwanUnderLayTunnelActions(cellValue,options,rowdata,action)
{
     var checked = "checked";//No I18n
    var statusTitle = Ember.I18n.t('Managed', this); //No I18N
    OPMClient.InventoryDeviceDetailsController.tunnelDispName = rowdata.instance;
    if(rowdata.isManaged!==undefined && rowdata.isManaged == "false") {
        checked = "";
        statusTitle = Ember.I18n.t('UnManaged', this); //No I18N
    }
    var actionsStr = '<div class="flex flex-middle-align">';//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
        actionsStr += '<div class="chkRoundBtn"><input type="checkbox" '+checked+' title="' + statusTitle + '" onclick="doManageUnManageSDWanChilds(false,false,'+rowdata.isManaged+',&#39;UnderlayTunnel&#39;,'+escapeHTML(rowdata.tunnelMOID)+',this);"><label></label></div>';//No I18N
    }
    actionsStr += '</div>';//No I18N
    return actionsStr;
}
function sdwanWanLinkActions(cellValue, options, rowdata, action){
    var checked = "checked";//No I18n
    var statusTitle = Ember.I18n.t('Managed', this); //No I18N
    OPMClient.InventoryDeviceDetailsController.tunnelDispName = rowdata.instance;
    if(rowdata.isManaged!==undefined && rowdata.isManaged == "false") {
        checked = "";
        statusTitle = Ember.I18n.t('UnManaged', this); //No I18N
    }

    var actionsStr = '<div class="flex flex-middle-align">';//No I18N
    // actionsStr += '<em class="svgIcon size16 mr-sm pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToWanLinkGraphs('+escapeHTML(rowdata.intfMoid)+',\''+escapeHTML(rowdata.intfMoName)+'\',\''+escapeHTML(rowdata.displayName)+'\')"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#line-chart"/></svg></em>';
    actionsStr += '<div class="perfMonitorGraph pointer" title="'+Ember.I18n.t("webclient.inventory.graphs",this)+'" onclick="redirectToWanLinkGraphs('+escapeHTML(rowdata.intfMoid)+',&#39;'+escapeHTML(rowdata.intfMoName)+'&#39;,&#39;'+escapeHTML(rowdata.displayName)+'&#39;,&#39;'+escapeHTML(rowdata.deviceMOName)+'&#39;)"></div>';//No I18N
    if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite) {
        actionsStr += '<div class="chkRoundBtn"><input type="checkbox" '+checked+' title="' + statusTitle + '" onclick="doManageUnManageSDWanChilds(false,false,'+rowdata.isManaged+',&#39;wanlink&#39;,'+escapeHTML(rowdata.intfMoid)+',this);"><label></label></div>';//No I18N
    }
    actionsStr += '</div>';//No I18N
    return actionsStr;
}

function redirectToTunnelJitterGraph(cellValue, options, rowdata, action){
    return "<span onclick='gotoElementSpecificGraph(\""+rowdata.rowdata+"\",\"Tunnel_Jitter\",\""+rowdata.instance+"\")'>"+cellValue+"</span>";//No I18N
}
function redirectToTunnelLatencyGraph(cellValue, options, rowdata, action){
    return "<span onclick='gotoElementSpecificGraph(\""+rowdata.rowdata+"\",\"Tunnel_Latency\",\""+rowdata.instance+"\")'>"+cellValue+"</span>";//No I18N
}
function redirectToTunnelPacketLossGraph(cellValue, options, rowdata, action){
    return "<span onclick='gotoElementSpecificGraph(\""+rowdata.rowdata+"\",\"Tunnel_PacketLoss\",\""+rowdata.instance+"\")'>"+cellValue+"</span>";//No I18N
}
function redirectToTunnelQoeGraph(cellValue, options, rowdata, action){
    return "<span onclick='gotoElementSpecificGraph(\""+rowdata.rowdata+"\",\"Tunnel_QoE\",\""+rowdata.instance+"\")'>"+cellValue+"</span>";//No I18N
}
function gotoElementSpecificGraph(elementMoid,graphName,instance){
    OPMClient.InventoryDeviceDetailsController.set('fromGraphsSummary',true);// No I18N
    var parentModel = this.get('controller.model.parentModel');
    opmGlobalRoute.transitionTo('Inventory.Device.InstanceGraph',parentModel,elementMoid,encodeURIComponent(graphName),encodeURIComponent(instance)); //No I18N
}

function formatTechnician(cellValue, options, rowdata, action) {
    if(cellValue!==undefined && cellValue === "Unacknowledge") {
        return Ember.I18n.t("webclient.alarm.unackalarms");//No I18n
    } else {
        return escapeHtmlTags(cellValue);
    }
}

function navToAlarmDetailsPage(cellValue, options, rowdata, action)
{
    return '<span class="pointer" onclick="opm_redirectToAlarmDetailsPage('+rowdata.alarmId+')">'+escapeHTML(rowdata.message)+'</span>';//No I18N
}
function opm_redirectToAlarmDetailsPage(entity,newTab)
{
	location.href = window.OPM.v3ClientURL+"alarms/details/"+encodeURIComponent(entity);//No I18N
    slideOut(9);
    slideOut(6);
    slideOut(5);
    OPMClient.AlarmOptionsController.set('isListView',false);//No I18N
    OPMClient.AlarmOptionsController.set('isDetailsPage',true);//No I18N
}
function triggerNotificationTemplate(alarmId, notificationTemplateID){
    showMessage(opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/v2/dashboard/triggerNotificationTemplate', {alarmId: alarmId, notificationTemplateID: notificationTemplateID})); //No I18n
}

function showStatusIconForAlarms(cellValue, options, rowdata, action) {
    var probeNameDiv = rowdata.probeDisplayName ? ('<div class="pa_active_alarm_probename ml-xs"> | '+rowdata.probeDisplayName+' | </div>') : '';
    return '<div class="flex"><div class="pa_active_alarm_row" data-alarmid='+rowdata.alarmId+'><i class="--fault-severity severity_'+ escapeHTML(rowdata.statusNum) +' statusColor size10 circle inline-block mr-sm" title="' + escapeHTML(rowdata.statusStr) + '"></i>' + escapeHTML(rowdata.message) + '</div> ' + probeNameDiv + '</div>';
}

function showReportsForProblematicMatrics(cellValue, options, rowdata, action) {
    if(rowdata.CONTEXT_ID) {
        if(rowdata.CUSTOMER_ID) {
            return rowdata.SHOW_REPORT ? "<div><a class='viewReportsBtn2' style='margin-left:20px; font-size:16px; cursor:pointer;' title='" + Ember.I18n.t("webclient.reports.viewreports",this) + "' onclick='showProblematicReports(\"" + rowdata.METRIC_NAME + "\",\"" + rowdata.METRIC_DISPLAY_NAME + "\", \"" + rowdata.CONTEXT_ID + "\", \"" + rowdata.CONTEXT_NAME + "\", \"" + rowdata.CUSTOMER_ID + "\")'></a></div>" : "<span style='margin-left:20px; font-size:16px;'>-</span>";
        }
        if(rowdata.NCM_PROBE_ID) {
            return rowdata.SHOW_REPORT ? "<div><a class='viewReportsBtn2' style='margin-left:20px; font-size:16px; cursor:pointer;' title='" + Ember.I18n.t("webclient.reports.viewreports",this) + "' onclick='showProblematicReports(\"" + rowdata.METRIC_NAME + "\",\"" + rowdata.METRIC_DISPLAY_NAME + "\", \"" + rowdata.NCM_PROBE_ID + "\", \"" + rowdata.CONTEXT_NAME + "\")'></a></div>" : "<span style='margin-left:20px; font-size:16px;'>-</span>";
        }
        return rowdata.SHOW_REPORT ? "<div><a class='viewReportsBtn2' style='margin-left:20px; font-size:16px; cursor:pointer;' title='" + Ember.I18n.t("webclient.reports.viewreports",this) + "' onclick='showProblematicReports(\"" + rowdata.METRIC_NAME + "\",\"" + rowdata.METRIC_DISPLAY_NAME + "\", \"" + rowdata.CONTEXT_ID + "\", \"" + rowdata.CONTEXT_NAME + "\")'></a></div>" : "<span style='margin-left:20px; font-size:16px;'>-</span>";
    } else {
        return rowdata.SHOW_REPORT ? "<div><a class='viewReportsBtn2' style='margin-left:20px; font-size:16px; cursor:pointer;' title='" + Ember.I18n.t("webclient.reports.viewreports",this) + "' onclick='showProblematicReports(\"" + rowdata.METRIC_NAME + "\",\"" + rowdata.METRIC_DISPLAY_NAME + "\")'></a></div>" : "<span style='margin-left:20px; font-size:16px;'>-</span>";
    }
}

function expandFormatter(cellValue, options, rowObject) {
    var uniqueId = 'expand_' + options.rowId + '_' + escapeHTML(options.colModel.name).replace(/[^a-zA-Z0-9]/g, "");
    cellValue = escapeHTML(cellValue);
    var tooltip = 'title="'+cellValue+'"'; //No I18n
    return '<div id="' + uniqueId + '_short" class="expand-short" data-full-id="' + uniqueId + '_full" ' + tooltip + '>' +
               '<div class="text-truncate-4 pre-line-imp gridTruncatedText">' + cellValue + '</div>' +
               '<a href="javascript:void(0);" class="show-more opm_link">'+Ember.I18n.t("webclient.common.showMore")+'</a>' +
           '</div>' +
           '<div id="' + uniqueId + '_full" class="expand-full" style="display: none;" data-short-id="' + uniqueId + '_short" ' + tooltip + '>' +
               '<div class="pre-line-imp">' + cellValue + '</div>' +
               '<a href="javascript:void(0);" class="show-less opm_link">'+Ember.I18n.t("webclient.common.showLess")+'</a>' +
           '</div>';
}

function ncmControllerActions(cellValue, options, rowdata, action){
    var actionIcon = ""; //No I18N
    actionIcon= "<div style='padding-top:10px'><i class='pointer icon-configedit' title='" + Ember.I18n.t("webclient.title.edit", this) + "' style='margin: 0 6px !important;display:inline-block;' onclick='redirectToNCMAddEditController("+rowdata.id+")'></i>";//NO I18N
    actionIcon+= "<span class='pointer ui-icon ui-icon-trash' title='" + Ember.I18n.t("webclient.devices.customfields.delete", this) + "' onclick='deleteNCMController("+rowdata.id+")'></span>";//NO I18N
    actionIcon += "<span style='margin-left:6px!important' class='ncmLink' onclick= 'refreshNCMController(`"+rowdata.id+"`)' title='"+ Ember.I18n.t('webclient.common.discovery.addtoncm',this) + "'>"+Ember.I18n.t('webclient.snapshot.procstats.refresh',this)+"</span></div>"
    return actionIcon;
}
function opm_bvlistSeverity(cellValue, options, rowData, action) {
	return "<i class='--fault-severity icon-status"+opm_escapeHTML(rowData.statusNum)+"'></i> "+severityI18NTxtNew[Number(rowData.statusNum) - 1];//No I18N
}

function opm_bvlistAction(cellValue, options, rowData, action) {
    var bvname = (rowData.bvName).split("_bv")[0];//No I18N
    if(window.OPM.isBVAdminAccess)
    {
         return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='bv_actionsPage(\"edit\",\""+bvname+"\",\""+rowData.mapType+"\");'></i>";//No I18N
    }
    else{
        return "<i class='rca-icon-edit' title='"+Ember.I18n.t("webclient.action.edit",this)+"' onclick='bv_actionsPage(\"edit\",\""+bvname+"\",\""+rowData.mapType+"\");'></i><i class='rca-icon-copy' title='"+Ember.I18n.t("webclient.reports.copyas",this)+"' onclick='editBVMap(\"copyAs\",\""+bvname+"\",\""+rowData.mapType+"\")'></i><i class='rca-icon-delete' title='"+Ember.I18n.t("jsp.commonstr.Delete",this)+"' onclick='deleteBV(\""+rowData.bvName+"\")'></i>";
    }
}

function profileNameEditAction(cellValue, options, rowdata, action) {
    cellValue = jqGridHTMLEncode(cellValue);
    var tableId = options.gid;
    if(window.OPM.userPermissions.notificationProfileWrite || window.OPM.isNFA || window.OPM.isFWA) {
        var title = Ember.I18n.t('webclient.ncm.restapi.configlet.action.rename', this);//No I18n
        if(rowdata.isEditing && (window.OPM.userPermissions.notificationProfileWrite || window.OPM.isNFA || window.OPM.isFWA)){
            var textField = '<div class="flex flex-middle-align gap-sm"><div class="opmFormCol" style="width:auto"><input id="npEditField" type="text" value="'+ cellValue +'"/></div><em class="svgIcon size24 cursorPointer p-xs" tabindex="0" role="button" title="' + Ember.I18n.t('webclient.button.save') +'" onclick="saveNpEditField(' + tableId + ',' + (rowdata.profileID == undefined ? rowdata.templateID : rowdata.profileID) + ', ' + options.rowId +')"><svg fill="#49bd80"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#tick"></use></svg></em><em class="svgIcon size24 cursorPointer p-xs" tabindex="0" role="button" style="transform: rotate(45deg);" title="' + Ember.I18n.t('webclient.tableview.columncustomizer.cancelbutton.text') +'" onclick="showNpEditField(' + tableId + ',' + options.rowId + ',false)"><svg fill="#f34848"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#plus"></use></svg></em></div>';
            return textField;
        }
        else {
            cellValue = (window.OPM.userPermissions.notificationProfileWrite || window.OPM.isNFA || window.OPM.isFWA) ? '<span class="pr-big inline-block" tabindex="0" role="button">' + cellValue + '</span><span class="p-xs pl-sm pr-sm editIcon absolute top-0 mt-xs" tabindex="0" role="button" data-title="' + title +'" title="' + title +'" onclick="showNpEditField(' + tableId + ',' + options.rowId + ')" ><em class="svgIcon size14"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#pen"/></svg></em></span>' : cellValue;
        }
    }
    return cellValue;
}
function showNpEditField(grid,rowId, isClose, newProfileName) {
    var rowIndex = grid.p._index[rowId];
    var rowData = grid.p.data[rowIndex];
    rowData.isEditing = isClose == undefined ? true : isClose;
    rowData.profileName = newProfileName ? newProfileName : rowData.profileName;
    $('#'+ grid.id).jqGrid("setRowData", rowId, rowData);
}

function saveNpEditField(gridId, profileID, rowId) {
    if(isSave) {
        var data = {};
        data.profileID = profileID;
        data.newProfileName = $("#npEditField").val();
        var fieldsToValidate = {'empty':['npEditField'], "maxCheck":{'npEditField':100}}; //No I18N
        if(!opm_validateFields(fieldsToValidate)){
            return false;
        }
        var url = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/renameNotificationProfile", data);//No I18N
        if(url.error && url.error.code === 5150) {
            $("#npEditField").addClass('validateField error');//No I18N
            $("#npEditField").attr('data-error',url.error.message);//No I18N
            $("#npEditField").focus();
            opmValidateTooltipDefine();
            opmValidate($("#npEditField"));
            return;
        }
        showMessage(url);
        if(url.error == undefined) {
            showNpEditField(gridId, rowId, false, data.newProfileName);
        }
    }
}
function remediationFormatter(cellValue, options, rowdata, action){
    if(rowdata[9] == 'FLOW'){
        if(cellValue == '[NA]') {
            return cellValue;
        }
        return '<u>'+escapeHTML(cellValue)+'</u>';
    }
    else{
        return sortDescription(cellValue, options, rowdata, action);
    }
}

function addedByDTS(cellValue, options, rowdata, action) {
    if(rowdata.isCentralBasedDTS!== undefined && rowdata.isCentralBasedDTS === "true") {
        return "Synced from Central Server"; //No I18N
    } else {
        if(rowdata.ADDED_BY !== undefined && rowdata.ADDED_TIME_STR !== undefined) {
            return rowdata.ADDED_BY+"<br/>("+rowdata.ADDED_TIME_STR+")";//No I18N
        } else {
            return "-";//No I18N
        }
    }
}
function modifiedByDTS(cellValue, options, rowdata, action) {
    if(rowdata.isCentralBasedDTS!== undefined && rowdata.isCentralBasedDTS === "true") {
        return "Synced from Central Server"; //No I18N
    } else {
        if(rowdata.MODIFIED_BY !== undefined && rowdata.MODIFIED_TIME_STR !== undefined) {
            return rowdata.MODIFIED_BY+"<br/>("+rowdata.MODIFIED_TIME_STR+")";//No I18N
        } else if(rowdata.ADDED_BY !== undefined && rowdata.ADDED_TIME_STR !== undefined) {
            return rowdata.ADDED_BY+"<br/>("+rowdata.ADDED_TIME_STR+")";//No I18N
        } else {
            return "-";//No I18N
        }
    }
}
//Temp function
function suppressionTypeDTS(cellValue, options, rowdata, action) {
    return "Monitoring"; //No I18N
}

function setCentralIconDTSName(cellValue, options, rowdata, action) {
    var cellVal = opm_escapeHTML(rowdata.name);
    if(rowdata.isCentralBasedDTS!== undefined && rowdata.isCentralBasedDTS === "true") {
        return '<span class="textWithIcon gap-sm"><div class="text">' + cellVal + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>';
    }
    return cellVal;
}
function setSchedOrCentralIcon(cellValue, options, rowdata, action) {
    var cellVal = rowdata.suppressedElement !== undefined ? opm_escapeHTML(rowdata.suppressedElement) : "";
    var catId = parseInt(rowdata.categoryId);
    var snapshotHref = ""; //No I18N
    if (rowdata.suppressedElement && rowdata.moName) {
        if (catId === 1) { //No I18N - Device
            snapshotHref = "javascript:redirectToSnapshot('MonitoringDevice','" + opm_escapeHTML(rowdata.moName) + "')"; //No I18N
        } else if (catId === 2) { //No I18N - Interface
            snapshotHref = "javascript:redirectToSnapshot('MonitoringInterface','" + opm_escapeHTML(rowdata.moName) + "')"; //No I18N
        } else if (catId === 5) { //No I18N - DeviceGroup
            snapshotHref = "javascript:redirectToSnapshot('LogicalDeviceGroup','" + opm_escapeHTML(rowdata.moName) + "')"; //No I18N
        } else if (catId === 6) { //No I18N - InterfaceGroup
            snapshotHref = "javascript:redirectToSnapshot('LogicalIntfGroup','" + opm_escapeHTML(rowdata.moName) + "')"; //No I18N
        } else if (catId === 7 && !window.OPM.isCentralServer) { //No I18N - GlobalURL (no global URL page on central)
            snapshotHref = "javascript:redirectToSnapshot('MonitoringURL','" + opm_escapeHTML(rowdata.moName) + "')"; //No I18N
        } else if (catId === 8 && rowdata.alarmID) { //No I18N - Entity
            snapshotHref = "javascript:redirectToAlarm('" + opm_escapeHTML(rowdata.alarmID) + "')"; //No I18N
        }
    }
    if (snapshotHref) {
        cellVal = '<a href="' + snapshotHref + '">' + cellVal + '</a>'; //No I18N
    }
    if(rowdata.scheduleId !== undefined && rowdata.scheduleId !== -1){
        cellVal = cellVal + '<i class="pointer icon-sm-downtimesch ml-xs" title="' + Ember.I18n.t('webclient.settings.editdowntime',this) + '" onclick="editDTSfromSuppressConfig('+opm_escapeHTML(JSON.stringify(rowdata))+')"></i>'; //No I18N
        if(rowdata.isCentralBasedDTS!== undefined && rowdata.isCentralBasedDTS === "true") {
            var uniqueCentralIconId = "usersList_CentralIcon_" + rowdata.scheduleId; //No I18N
            cellVal = '<span class="textWithIcon gap-sm"><div class="text">' + cellVal + '</div><span id="' + uniqueCentralIconId + '" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>';
        }
    }
    return cellVal;
}
function suppressParentDeviceFormatter(cellValue, options, rowdata) {
    if (!cellValue || cellValue === '-') { return cellValue || '-'; } //No I18N
    var catId = parseInt(rowdata.categoryId);
    var deviceKey = null;
    if (catId === 2 && rowdata.moName && rowdata.moName.indexOf('IF-') === 0) { //No I18N
        deviceKey = rowdata.moName.substring(3, rowdata.moName.lastIndexOf('-')); //No I18N
    } else if ((catId === 3 || catId === 8) && rowdata.moName) {
        deviceKey = rowdata.moName;
    }
    if (deviceKey) {
        return "<a href='javascript:redirectToSnapshot(\"MonitoringDevice\",\"" + opm_escapeHTML(deviceKey) + "\")'>" + opm_escapeHTML(cellValue) + "</a>"; //No I18N
    }
    return opm_escapeHTML(cellValue);
}

function loadWanSiteSnap(cellValue, options, rowdata, action){
    var siteMo = rowdata.wlSiteMOName !== undefined ? rowdata.wlSiteMOName : rowdata.siteMo;
    return "<a href='javascript:redirectWanSiteSnapshot(\""+siteMo+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
}
function loadWANLinkSnap(cellValue, options, rowdata, action){
    return "<a href='javascript:redirectWanLinkSnapshot(\""+rowdata.name+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
}
function convertWLCTimeToLongFormatter(cellvalue, rowData)
{
    return rowData.timeInLong;
}

function loadWANLinkSnapFromList(cellValue, options, rowdata, action){
    return "<a href='javascript:redirectWanLinkSnapshot(\""+rowdata.moName+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
}

function opm_WanLinkSnapshot(cellValue, options, rowdata, action){
    return "<a href='javascript:redirectWanSnapshot(\""+rowdata.snapType+"\",\""+rowdata.name+"\")'>"+escapeHtmlTags(cellValue)+"</a>"; //No I18N
}
function wanLinkAddByCSVFieldSelection(cellValue, options, rowdata, action){
    if(rowdata.CsvFields !== undefined && options!==undefined && options.colModel!==undefined && options.colModel.index!==undefined){
        var reDiv = "<div class='selBox type2'><div style='width:175px !important'><select title='"+Ember.I18n.t("webclient.opm.settings.bulkupdate.customfield.selectfield",this)+"' name='cFldDrop' id='cFldDrop_"+options.pos+"' onchange='changeCSVFieldValue("+options.pos+")' class='select2 custFldDrp'>";//NO I18N
        reDiv += "<option value=''>"+Ember.I18n.t("webclient.admin.re.selcriteria",this)+"</option><optgroup label='"+Ember.I18n.t("webclient.map.flash.deviceProp",this)+"'>";//NO I18N
        for(var i=0;i<OPMClient.SettingsWanLinksController.defaultDeviceProps.length;i++)
                {
                    if(OPMClient.SettingsWanLinksController.defaultDeviceProps[i].id===options.colModel.index){
                        OPMClient.SettingsWanLinksController.defaultDeviceProps[i].isSelected = true;
                        reDiv += "<option value='"+OPMClient.SettingsWanLinksController.defaultDeviceProps[i].id+"' selected='selected'>"+OPMClient.SettingsWanLinksController.defaultDeviceProps[i].text+"</option>";//NO I18N
                    }else{
                        var isAlreadySelected = "";
                        reDiv += "<option value='"+OPMClient.SettingsWanLinksController.defaultDeviceProps[i].id+"' "+isAlreadySelected+">"+OPMClient.SettingsWanLinksController.defaultDeviceProps[i].text+"</option>";//NO I18N
                    }
                }
        reDiv += "</optgroup><optgroup label='"+Ember.I18n.t("webclient.commontext.customfields",this)+"'>";//NO I18N
            $.each(OPMClient.SettingsWanLinksController.deviceFieldProps,function(k,v){

                if(options.colModel.index === v.text){
                    v.isSelected = true;
                    reDiv += "<option data-propid='"+v.alias+"' value='"+v.id+"' selected='selected'>"+v.text+"</option>" ;//NO I18N
                }else{
                    var isAlreadySelected = "";
                    reDiv += "<option data-propid='"+v.alias+"' value='"+v.id+"' "+isAlreadySelected+">"+v.text+"</option>" ;//NO I18N
                }
            });
        reDiv += "</optgroup></select></div></div>";//NO I18N
        return reDiv;
    }
    else{
        if(cellValue !== undefined){
            return escapeHTML(cellValue);
        }
        else{
            return "";
        }

    }
}
function notifTempEnableDisable(cellValue, options, rowdata, action) {
	if (!window.OPM.isAuthorized) {
		return '';
	}
	var isChecked = 'checked'; //No I18N
	var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
	if (rowdata.status !== "true") {
		isChecked = '';
		statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
	}
   /* var isDisabled = "disabled";  //No I18N
    if(window.OPM.userPermissions.notificationProfileWrite){
        var isDisabled = "";
    } */
    return "<div style='opacity:0.3;' class='chkRoundBtn'><input disabled type='checkbox' title='"+statusTitle+"' name='' "+isChecked+"><label></label></div>"; //No I18N
}
function deviceNotifyTempAction(cellValue, options, rowdata, action) {
    if(window.OPM.isAuthorized)
    {
        var actions= "";
        if(window.OPM.userPermissions.notificationProfileWrite){
            actions+="<span style='cursor:pointer;clear:none;float:left;margin-left:10px;' class='icon-trash' title='"+Ember.I18n.t('webclient.title.delete',this)+"' onclick='deAsociateNotifyTempAssociation("+rowdata.profileId+");'></span>";
        }
        return actions;
    }
    else
    {
        return "";//No I18n
    }
}

function deAsociateNotifyTempAssociation(profileId){
    var sType = "WANLinkMonitor"; //No I18N
    if(OPMClient.InventoryDeviceDetailsController.isWANIPMonitoringSnap && !OPMClient.InventoryDeviceDetailsController.isWANIPLinkSnapshot){
        sType = "WANLinkSite"; //No I18N
    }
    opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('webclient.admin.credential.delete',this)+" "+Ember.I18n.t('opm.client.resetthis',this)+" "+Ember.I18n.t('webclient.commonstr.template',this), '', function(){  //No I18N
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/dissociateNotificationTemplate?module=WANIPs&type="+sType+"&profileIds="+JSON.stringify([profileId])+"&entityNames="+OPMClient.InventoryDeviceDetailsController.deviceName); //No I18n
        if (response.error !== undefined)
        {
            message = response.error.message;
            opm_infoMsgs('errorMsg', message); //No I18N
        }
        else if (response.message !== undefined && response.message !== "")
        {
            opm_infoMsgs('successMsg', response.message); //No I18N
            opm_deviceSnapshotloadNotifTemplateGrid(OPMClient.InventoryDeviceDetailsController.deviceName);
        }
    },Ember.I18n.t('webclient.action.ok'), '', Ember.I18n.t('webclient.action.cancel'), '', 'dialogStyle2', true); //No I18n
}
function wanIPSnapListAction(cellVal, options, rowData, action){
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='opm_deleteWANIPFromSnap(&#39;"+rowData.moid+"&#39;)'></i>"; //No I18n
}
function partitionmultinodeFormatter(cellValue, options, rowdata, action){
    rowdata.DISPLAYNAMECOPY = opm_escapeHTML(rowdata.DISPLAYNAME);
    if(!(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring && 'CLI' === OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.deviceProtocol) && rowdata.showAddPartitionOption == 'true' && OPMClient.ApplicationController.currentRouteName.indexOf("Inventory.Device.Monitors.AddMonitor") >=0){
        return "<i title='"+rowdata.DISPLAYNAMECOPY+"'>"+rowdata.DISPLAYNAMECOPY+"</i>"+ "<br><span title='"+Ember.I18n.t('webclient.opm.perf.monitors.add.select.partition')+"' class ='pointer textLink viewDetails'>"+  "(" +Ember.I18n.t('webclient.opm.perf.monitors.add.select.partition')+")</span>";//No I18N"

    }else{
            return "<i title='"+rowdata.DISPLAYNAMECOPY+"'>"+rowdata.DISPLAYNAMECOPY+"</i>";//No I18N
    }
}

function thresholdSettingsActions(cellValue,options,rowdata,action){
    if('true' === rowdata.isThresholdEnabled){
        return "<span class='pointer opm_link flex flex-middle-align' onclick=viewConfiguredThresholds('"+options.gid+"','"+options.rowId+"',this); style='float:left;margin-left:5px;'><em class='svgIcon size14 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#popup'/></svg></em>"+Ember.I18n.t('webclient.opm.qcw.view.thresholds')+"</span>";//No I18N
    }else{
        return "<span class='flex flex-middle-align' style='float:left;margin-left:5px;'><em class='svgIcon size14 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#disabled'/></svg></em>"+Ember.I18n.t('webclient.admin.users.notconfigured')+"</span>";//No I18N
    }
}

function thresholdsByGraphAndTypeId(cellValue,options,rowdata,action){
    if(rowdata.isThresholdEnabled == true){
        return "<span class='pointer opm_link flex flex-middle-align' onclick='viewConfiguredThresholds(undefined, undefined, this, " + rowdata.GRAPHID + ", " + rowdata.typeId + ");' style='float:left;margin-left:5px;'><em class='svgIcon size14 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#popup'/></svg></em>"+Ember.I18n.t('webclient.opm.qcw.view.thresholds')+"</span>";//No I18N
    }else{
        return "<span class='flex flex-middle-align' style='float:left;margin-left:5px;'><em class='svgIcon size14 mr-sm'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#disabled'/></svg></em>"+Ember.I18n.t('webclient.admin.users.notconfigured')+"</span>";//No I18N
    }
}

function redirectSnap(cellValue, options, rowdata, action)
{
    if(rowdata!==undefined && rowdata.length>2)
    {
        return "<span class='cursorPointer' onclick='redirectToSnapshot(\"MonitoringDevice\",\""+escapeHTML(rowdata[1])+"\")'>"+cellValue+"</span>";//No I18n
    }else{
        return escapeHTML(cellValue);
    }
}
function opm_cpCustomFormatter(cellValue, options, rowdata, action)
{
    var result="";
    var checkVal = cellValue.split('_')[0];//No I18N
    if (checkVal === '0') {
        result = '<div class="cell-green">'+jqGridHTMLEncode(cellValue.split('_')[1])+'</div>';//No I18N
    }
    else {
        result = '<div class="cell-red">'+jqGridHTMLEncode(cellValue.split('_')[1])+'</div>';//No I18N
    }
    return result;
}

function triggerNotificationTemplate(alarmId, notificationTemplateID){
    showMessage(opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/v2/dashboard/triggerNotificationTemplate', {alarmId: alarmId, notificationTemplateID: notificationTemplateID})); //No I18n
}
function opm_linkIPSLASnapshot(cellValue,options,rowdata,action){
    var monitorType = rowdata.monitorType;
    var selDevice = rowdata.probeId;
    if(monitorType ==="voip"){
        monitorType = "IPSLAVoIP";; //No I18N
    }
    else if(monitorType ==="video"){
        monitorType = "IPSLAVideo";; //No I18N
    }else{
        monitorType = "IPSLAWAN";; //No I18N
    }
    return "<span onclick='redirectToSnapshot(&#39;"+monitorType+"&#39;,&#39;"+selDevice+"&#39;)'>"+escapeHtmlTags(rowdata.ipslaDisplayname)+"</span>"; //No I18N

}
function redirectToSourceSnapshot(cellValue,options,rowdata,action){
    return "<div onclick='redirectToSnapshot(&#39;MonitoringDevice&#39;,&#39;"+opm_escapeHTML(rowdata.ipslaSource)+"&#39;);' class='cursorPointer'>"+rowdata.ipslaSourceDisplayName+"</div>";
}


function redirectToNodeSnap(cellValue, options, rowdata, action){

    var str = "<div class='inline-flex flex-center'>";//No I18N
    if(rowdata.moName !== undefined && rowdata.moName !== "" && rowdata.moName !== "NA") {
        str += "<span onclick='redirectToDeviceSnapshot(\""+rowdata.moName+"\")'><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.displayName)+"</a></span>";//No I18N
    }else{
         str += "<span><i class='--fault-severity icon-status"+rowdata.status+"'></i>"+escapeHTML(rowdata.displayName)+"</span>";//No I18N
    }
    if(rowdata.suppressAlarm) {
        str += '<i title="'+Ember.I18n.t("webclient.interfaces.status.suppressalarm",this)+'" class="size14 mr-xs ml-xs"><svg class="svgIcon size14 inline-block"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#notification-off-duotone"/></svg></i>'; //No I18N
    }
    str += "</div>";//No I18N
    return str;
}
function nextHopSnapLink(cellValue, options, rowdata, action){
    if(rowdata.nextHopMoName !== undefined && rowdata.nextHopMoName !== "" && rowdata.nextHopMoName !== "NA") {
        return "<div onclick='redirectToDeviceSnapshot(\""+rowdata.nextHopMoName+"\")'><i class='--fault-severity icon-status"+rowdata.nextHopStatus+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.nextHopDisplayName)+"</a></div>";//No I18N
    }else{
        return "<div><i class='--fault-severity icon-status"+rowdata.nextHopStatus+"'></i>"+escapeHTML(rowdata.nextHopDisplayName)+"</div>";//No I18N
    }
}
function linkToIntfSnap(cellValue, options, rowdata, action){

    if(rowdata.intfMoName !== undefined && rowdata.intfMoName !== "" && rowdata.intfMoName !== "NA") {
        return "<div onclick='redirectToSnapshot(\"MonitoringInterface\",\""+rowdata.intfMoName+"\")'><i class='--fault-severity icon-status"+rowdata.intfStatus+"'></i> <a class='textBlue'>"+escapeHTML(rowdata.intfDisplayName)+"</a></span>";//No I18N
    }else{
        return "<div><i class='--fault-severity icon-status"+rowdata.intfStatus+"'></i>"+rowdata.ifIndex+"</div>";//No I18N
    }
}
function opm_setAlarmRuleNameWithDesc(cellValue, options, rowdata, action)
{
    var desc = (rowdata.description.length > 110) ? rowdata.description.substring(0,110)+"...":rowdata.description; //No I18N
    return "<div title='"+cellValue+"'>"+cellValue+"</div><div class='trapSubtitle' title='"+rowdata.description+"'>"+jqGridHTMLEncode(desc)+"</div>"; //No I18N
}

function formatTextWithTruncate(cellValue, options, rowdata, action) {
    return "<span class='truncate-2' title='"+escapeHTML(cellValue)+"'>"+escapeHTML(cellValue)+"</span>"; //No I18N
}

function deviceRemovalColor(cellValue, options, rowdata, action){
	if(rowdata['description-msg']=="opu.spm.DEVICE_REMOVED"){//No I18n
		return "<span style='color:#dc0807'>"+rowdata['description']+"</span>"; //No I18n
	}else{
        return escapeHTML(cellValue);
    }
}
function getMonitorScriptActions(cellValue, options, rowdata, action){
    return "<span class='pointer icon-configedit editScriptMonitorInDeviceTemplate' title="+Ember.I18n.t('webclient.title.edit',this)+" data-value='"+ rowdata.scriptID +"' style='float:left;margin-left:5px;' tabindex='0' role='button'></span> <span class='icon-trash delete OpMToolTip pointer deleteScriptMonitorInDeviceTemplate' data-value='"+ rowdata.scriptID +"'tabindex='0' role='button' style='float:left;font-size:13px' title="+Ember.I18n.t('webclient.devices.customfields.delete',this)+"></span>";
}


function ccEESettingsEnableDisable(cellValue, options, rowdata, action) {
    var isChecked = 'checked'; //No I18N
    var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
    if (!rowdata.status) {
        isChecked = '';
        statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
    }
    return "<div class='chkRoundBtn'><input type='checkbox' " + isChecked + " name='ccEESettingsStatusBtn_" + rowdata.moduleName + "' title='" + statusTitle + "'><label></label></div>";//No I18N
}

function eeAPIAuditReportCapsuleFormatter(cellValue, options, rowdata, action){
    if(cellValue!==undefined) {
        if(cellValue==="SUCCESS") {
            return "<span class='capsule-status gridCapsule capsule-Clear'><p>"+opm_escapeHTML(cellValue)+"</p></span>";
        } else if(cellValue==="FAILURE") {
            return "<span class='capsule-status gridCapsule capsule-Critical'><p>"+opm_escapeHTML(cellValue)+"</p></span>";
        } else if(cellValue==="IN_PROGRESS") {
            return "<span class='capsule-status gridCapsule capsule-Blue'><p>"+opm_escapeHTML(cellValue)+"</p></span>";
        } else {
			return opm_escapeHTML(cellValue);
		}
    }
}
function ncmNotificationRuleOperations(cellValue, options, rowdata, action){
    if(!rowdata || !rowdata.isEditable) {
        return "";
    }
    var col = "<i class='icon-configedit' style='margin-left:0 !important; font-size:16px; cursor:pointer;' title="+Ember.I18n.t('webclient.title.edit',this)+" onclick='OPMClient.NCMConfigAutomationModel.editChangeManagementRule(" + rowdata.id + ")'></i>"; //No I18N
    col += "<i class='icon-trash delete' style='font-size:16px; cursor:pointer;' title="+Ember.I18n.t('webclient.dashboards.delete',this)+" onclick='OPMClient.NCMConfigAutomationModel.deleteChangeManagementRule(" + rowdata.id + ")'></i>"; //No I18N
    return col;
}

function ncmNotificationRuleStatusFormatter(cellValue, options, rowdata, action)
{
    var status=false;
    if(cellValue != "true" && cellValue != true){
		status = true
    }
    // read-only users and non-owners see the status without being able to toggle it
    var canToggle = rowdata && rowdata.isEditable && window.OPM.hasNcmNotificationProfileWriteAccess;
    var handler = canToggle ? "onchange='OPMClient.NCMConfigAutomationModel.toggleNCMNotificationRule(\"" + status + "\",\"" + parseInt(rowdata.id, 10) + "\")' " : "disabled "; //No I18N
    return "<div class='chkRoundBtn'><input type='checkbox' " + handler + (status ? "" : "checked") + " name='' id='enable'><label></label></div>";//No I18N
}

function getMCPPrivacyContent(){
    var conditionsLink = 'https://www.manageengine.com/network-monitoring/'; //NO I18N
    return '<p class="mb-sm line-height-4">'+Ember.I18n.t('webclient.label.mcp.privacy.intro', {productName: OPMClient.ApplicationController.productName})+'</p>'+'<p class="mb-md line-height-4">'+ //NO I18N
            '<div class="mb-sm mt-sm fs16 textBold">'+Ember.I18n.t('webclient.label.mcp.privacy.notice')+'</div>'+ //NO I18N
            '<p>'+Ember.I18n.t('webclient.label.mcp.privacy.notice.content', {productName: OPMClient.ApplicationController.productName})+'</p>'+ //NO I18N
            '<p class="mt-sm">'+Ember.I18n.t('webclient.label.mcp.privacy.notice.content2', {productName: OPMClient.ApplicationController.productName})+'</p>'+ //NO I18N
            '<div class="mt-sm mb-sm f16 textBold">'+Ember.I18n.t('webclient.label.mcp.privacy.terms')+'</div>'+ //NO I18N
            '<p>'+Ember.I18n.t('webclient.label.mcp.privacy.terms.content')+'</p>'+ //NO I18N
            '<div class="mt-sm mb-sm pl-md"><ul class=\"list-type-disc\">'+Ember.I18n.t('webclient.label.mcp.privacy.terms.content2')+'</ul></div>'+ //NO I18N
            '<div class="infoBoxBlue multiline mt-sm mb-lg"> <p class="infoIcon"> <span class="bold">'+ //NO I18N
            '</span>'+Ember.I18n.t('webclient.label.mcp.privacy.infoMessage')+'</p> </div>'+ //NO I18N
            '<p class="mb-sm mt-sm">'+Ember.I18n.t('webclient.label.mcp.privacy.proceed')+'</p>'; //NO I18N
}
function redirectToAlarmWCAG(cellValue, options, rowdata, action) {
    return "<span tabindex='0' role='link'>"+escapeHtmlTags(cellValue)+"</span>"; //No I18N
}

function testCredProfName(cellValue, options, rowdata, action) {
    return "<span tabindex='0' role='button'>" + jqGridHTMLEncode(cellValue) + "</span>"; //No I18N
}


function ccEESettingsEnableDisable(cellValue, options, rowdata, action) {
    var isChecked = 'checked'; //No I18N
    var statusTitle = Ember.I18n.t('jsp.commonstr.Enabled', this); //No I18N
    if (!rowdata.status) {
        isChecked = '';
        statusTitle = Ember.I18n.t('jsp.commonstr.Disabled', this); //No I18N
    }
    return "<div class='chkRoundBtn'><input type='checkbox' " + isChecked + " name='ccEESettingsStatusBtn_" + rowdata.moduleName + "' title='" + statusTitle + "'><label></label></div>";//No I18N
}
function redirectToUplinkParentDevSnap(cellValue, options, rowdata, action){
    var re = "<a class='pointer' onclick=redirectToSnapshot('MonitoringDevice','"+rowdata[2]+"')>"+escapeHTML(cellValue)+"</a>";//No I18N
    if(rowdata[2].indexOf('wanlinkmonitor') !== -1){//No I18N
        return "<a class='pointer' onclick=redirectWanLinkSnapshot('"+rowdata[2]+"')>"+escapeHTML(cellValue)+"</a>";//No I18N
    }else if(rowdata[2].indexOf('wanlinksite') !== -1){//No I18N
        return "<a class='pointer' onclick=redirectWanSiteSnapshot('"+rowdata[2]+"')>"+escapeHTML(cellValue)+"</a>";//No I18N
    }
    return re;
}

function ndmSnapshotDeviceStatusFormatter(cellValue, options, rowdata, action) {
    return "<i class='--fault-severity icon-status"+escapeHTML(rowdata.snap_status)+"'></i> "+escapeHTML(rowdata.snap_statusStr) ;//No I18N
}
function ncmComplianceRemediationFormatter(cellValue, options, rowdata, action){
    return compRuleResultFormatter(cellValue, options, rowdata, action, true);
}

function ndmSnapshotDeviceMOFormatter(cellValue, options, rowdata, action) {
    return "<a href='#/Inventory/Snapshot/MonitoringDevice/"+escapeHTML(rowdata.snap_moName)+"' class='pointer' >"+escapeHTML(cellValue)+"</a>"; //No I18N
}

function addTemplateOptions() {
    return '<div class="opmBtn addUserBtn action_btn"> <div class="flex flex-middle-align">' + Ember.I18n.t('webclient.devicetemplate.add',this) +  ' <em class="svgIcon size12 ml-sm"><svg fill="#fff"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#chevron-down"></use></svg></em></div> <ul><li><a href="'+ window.OPM.apiclientUrl+'Settings/Configurations/DeviceTemplate/Add"> ' + Ember.I18n.t('webclient.admin.timeformat.default',this) +' </a></li><li><a href="'+window.OPM.apiclientUrl+'Settings/Configurations/DeviceTemplate/AddScript">' + Ember.I18n.t('webclient.admin.customDeviceTemplate.scriptTitle',this) +'</a></li></ul></div>'
}

function opu_dnsAlertDetailsFormatter(cellValue, options, rowdata, action) {
    if (!cellValue || cellValue === 'null' || cellValue === '') {
        return '-';//No I18N
    }
    try {
        var details = typeof cellValue === 'string' ? JSON.parse(cellValue) : cellValue;//No I18N
        var alertType = rowdata.alertType || rowdata['alertType'];
        var result = '';

        // Type 1: Same A Record, Different IP - show IPs
        if (details.ips && Array.isArray(details.ips)) {
            result = '<span title="' + escapeHTML(details.ips.join(', ')) + '">' + escapeHTML(details.ips.join(', ')) + '</span>';//No I18N
        }
        // Type 2: CNAME Loop - show chain
        else if (details.chain && Array.isArray(details.chain)) {
            var chain = details.chain.join(' → ');//No I18N
            result = '<span title="' + escapeHTML(chain) + '">' + escapeHTML(chain) + '</span>';//No I18N
        }
        // Type 3: MX/NS/SRV → CNAME - show record type and target
        else if (details.recordType && details.target) {
            var info = details.recordType + ' → ' + details.target;//No I18N
            result = '<span title="' + escapeHTML(info) + '">' + escapeHTML(info) + '</span>';//No I18N
        }
        else {
            result = '<span title="' + escapeHTML(cellValue) + '">' + escapeHTML(cellValue) + '</span>';//No I18N
        }
        return result;
    } catch (e) {
        return '<span title="' + escapeHTML(cellValue) + '">' + escapeHTML(cellValue) + '</span>';//No I18N
    }
}
function ruleEngineNameFormatter(cellValue, options, rowdata, action){
    if(window.OPM.isProbe && rowdata.isProbeProfile!==undefined && rowdata.isProbeProfile === "SYNCED"){
        return '<span class="textWithIcon gap-sm"><div class="text" role="link" tabindex="0">' + htmlEncode(cellValue) + '</div><span id="usersList_CentralIcon" class="buildType pull-right m-none ml-auto" title="' + Ember.I18n.t('webclient.central.icon.title',this) + '">C</span></span>'; //No I18N
    }
    return '<div style="cursor:pointer;" role="link" tabindex="0">'+htmlEncode(cellValue)+'</div>';//No I18N
}

function installedAuditStatus(cellValue, options, rowdata, action) {
    var statusStr = "";
    if(rowdata.STATUS!==undefined) {
        if(rowdata.STATUS==0) {
            statusStr = "<span class='capsule-status gridCapsule capsule-Blue'><p>"+Ember.I18n.t("opu.common.IN_PROGRESS",this)+"</p></span>";//No I18N
        } else if(rowdata.STATUS==1) {
            statusStr = "<span class='capsule-status gridCapsule capsule-Clear'><p>"+Ember.I18n.t("webclient.script.asso.success",this)+"</p></span>";//No I18N
        } else if(rowdata.STATUS==2) {
            statusStr = "<span class='capsule-status gridCapsule capsule-Critical'><p>"+Ember.I18n.t("ncm.config.backup.failed",this)+"</p></span>";//No I18N
        }
    }
    return statusStr;
}

function installedAuditOS(cellValue, options, rowdata, action) {
    var osStr = "";
    if(rowdata.OS!==undefined && rowdata.OS !== "" && rowdata.OS !== null && rowdata.OS === "linux") {
        osStr = "<img src='/apiclient/fluidicv2/img/apm-apps-logos/linux.svg' height='16px' title='"+Ember.I18n.t("webclient.common.linux",this)+"'/>"; // No I18N
    } else {
        osStr = "<img src='/apiclient/fluidicv2/img/apm-apps-logos/windows.svg' height='14px' title='"+Ember.I18n.t("webclient.common.windows",this)+"'/>"; // No I18N
    }
    return osStr;
}
function eventTypeConfigNameFormatter(cellValue, options, rowdata) {
    var name = opm_escapeHTML(rowdata.displayName || rowdata.eventType || ''); //No I18N
    var desc = opm_escapeHTML(rowdata.description || ''); //No I18N
    return "<div><span class='eventTypeConfigName'>" + name + "</span><div class='eventTypeConfigDesc'>" + desc + "</div></div>"; //No I18N
}

function eventTypeConfigNameCellAttr(rowId, cellValue, rawObject) {
    var name = opm_escapeHTML(rawObject.displayName || rawObject.eventType || ''); //No I18N
    var desc = opm_escapeHTML(rawObject.description || ''); //No I18N
    var tooltip = desc ? (name + ': ' + desc) : name; //No I18N
    return 'title="' + tooltip + '"'; //No I18N
}

function eventTypeConfigImpactFormatter(cellValue, options, rowdata) {
    var isChecked = rowdata.impactStatus ? 'checked' : ''; //No I18N
    var disabledStr = (!window.OPM.faultSettingsAccess) ? 'disabled' : ''; //No I18N
    return "<div class='chkRoundBtn'><input type='checkbox' " + disabledStr + " onclick='toggleEventTypeConfigImpact(\"" + opm_escapeHTML(rowdata.eventType) + "\", this.checked)' " + isChecked + "><label></label></div>"; //No I18N
}
function groupsEventCorEnabled(cellValue, options, rowdata)
{
   if(rowdata.canEnableEventCorrelation === "true") { //No I18N
        var isEnabled = (cellValue === "true" || cellValue === true); //No I18N
        var checkedAttr = isEnabled ? "checked" : ""; //No I18N
        var isDisabled = (!window.OPM.userPermissions.deviceAndInterfaceGroupsWrite || window.OPM.isMSPProbe) ? "disabled" : ""; //No I18N
        return "<div class='chkRoundBtn'><input type='checkbox' onclick='toggleGroupEventCorrelation(&#39;"+opm_escapeHTML(rowdata.groupName)+"&#39;,this,&#39;"+opm_escapeHTML(rowdata.eventCorrelationConfirmVariant)+"&#39;,"+rowdata.atEnabledGlobally+","+rowdata.isATEnabledForEC+")' "+checkedAttr+" "+isDisabled+" name=''><label></label></div>"; //No I18N
    }
    else{
        return "<div class='chkRoundBtn' title='"+escapeHTML(rowdata.canEnableEventCorrelationReason)+"'><input type='checkbox' disabled name=''><label></label></div>"; //No I18N
    }
}
function problemsSeverityColorIcon(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity icon-status"+rowdata.severity+"'></i> "+escapeHTML(cellValue) ;//No I18N
}
function problemsStatusColorIcon(cellValue, options, rowdata, action)
{
    return "<i class='--fault-severity ml-xs icon-status"+rowdata.severity+"'></i> ";//No I18N
}
function problemsLastNote(cellValue, options, rowdata, action){
    // Return default values if lastNote is invalid
    if (rowdata.lastNote === undefined || rowdata.lastNote === -1 || rowdata.lastNote === "-") {
        return "-"; // NO i18n
    }
    else(rowdata.lastNote !== undefined)
    { 
        return escapeHTML(rowdata.lastNote);
    }
    return "";
}
function opm_linkToProblems(cellValue, options, rowData, action)
{
	return "<span onclick='redirectToAlarm(&#39;"+rowData.problemId+"&#39;)'><i class='--fault-severity icon-status"+rowData.status+"'></i>"+opm_escapeHTML(rowData.problemName)+"</span>"; //No I18N
}

function setProfileTypeIcon(cellValue, options, rowdata, action) {
    if(rowdata.isProbeProfile !== undefined && rowdata.isProbeProfile !== null) {
        var uniqueCentralIconId = "usersList_CentralIcon_" + rowdata.ruleid; //No I18N
        if(rowdata.isProbeProfile === "REMOTE"){//No I18N
            return '<span id="' + uniqueCentralIconId + '" class="buildType m-none ml-auto" title="'+Ember.I18n.t('webclient.googlemap.addprobe.probe', this)+'">P</span>'; //No I18N
        } else {
            return '<span id="' + uniqueCentralIconId + '" class="buildType m-none ml-auto" title="'+Ember.I18n.t('webclient.common.central', this)+'">C</span>'; //No I18N
        }
    }
}
function loadWanIPSiteSnapFrmWidget(cellValue, options, rowdata, action){
    var siteMo = rowdata.siteMo !== undefined ? rowdata.siteMo : rowdata.moName;
    return "<div onclick='redirectWanSiteSnapshot(\""+siteMo+"\")'><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(cellValue)+"</a></span>";//No I18N
}
function availabilityColumnFormatter(cellValue, options, rowObject) {
    var state = rowObject.state;
    var stateText = (state && availabilityState[state]) || '';
    if (state) {
        if (state === 4 || state === 5 || state === 3) {
            return '<span class="avail-icon-cell"><i class="icon-status7"></i> ' + escapeHTML(stateText) + '</span>';
        }
        var iconClass = '';
        switch(state) {
            case 1: iconClass = 'avail-up'; break; //No I18N
            case 2: iconClass = 'avail-down'; break; //No I18N
            default: iconClass = 'avail-up'; //No I18N
        }
        return '<span class="avail-icon-cell"><em class="--avail-icon ' + iconClass + '"></em>' + escapeHTML(stateText) + '</span>';
    }
    return escapeHTML(stateText);
}
function liteDeviceColumnFormatter(cellValue, options, rowObject) {
    if (window.OPM.isNewStatusPropagation && rowObject.state !== undefined && rowObject.state !== null && rowObject.state !== "") {
        var state = parseInt(rowObject.state, 10);
        if (!isNaN(state)) {
            var stateText = (state && availabilityState[state]) || '';
            if (state === 4 || state === 5 || state === 3) {
                return '<span class="avail-icon-cell"><i class="icon-status7"></i> ' + escapeHTML(stateText) + '</span>';
            }
            var iconClass = '';
            switch (state) {
                case 1: iconClass = 'avail-up'; break; //No I18N
                case 2: iconClass = 'avail-down'; break; //No I18N
                default: iconClass = 'avail-up'; //No I18N
            }
            return '<span class="avail-icon-cell"><em class="--avail-icon ' + iconClass + '"></em>' + escapeHTML(stateText) + '</span>';
        }
    }
    var statusNum = parseInt(rowObject.statusNum, 10) || 0;
    return "<i class='--fault-severity icon-status" + statusNum + "'></i> " + escapeHTML(rowObject.statusStr); //No I18N
}
function loadWanIPLinkSnapFrmWidget(cellValue, options, rowdata, action){
    return "<div onclick='redirectWanLinkSnapshot(\""+rowdata.moName+"\")'><i class='--fault-severity icon-status"+rowdata.status+"'></i> <a class='textBlue'>"+escapeHTML(cellValue)+"</a></span>";//No I18N
}

function opm_WANIPLinkCount(cellValue, options, rowdata, action){
       var memberStatus = "showCount_1";//No I18N
    if(rowdata.downCount!==undefined && rowdata.downCount === "0"){//No I18N
        memberStatus = "showCount_5";//No I18N
    }
    var siteArr = [];
    siteArr.push(rowdata.moId);
    var withSeverity = (rowdata.downCount !== undefined && rowdata.downCount !== "0");//No I18N
    return "<div><span class='"+memberStatus+" cursorPointer' onclick='opm_WANIPLinkCountWithFilter("+JSON.stringify(siteArr)+","+withSeverity+")'>"+opm_escapeHTML(rowdata.downCount)+"</span> / "+opm_escapeHTML(cellValue)+"</div>";    //No I18N
}
function opm_WANIPLinkCountWithFilter(wanIPSiteMoArr, withSeverity){
    OPMClient.InventoryDeviceDetailsController.wanIPFilterObj.siteName=wanIPSiteMoArr.length > 0 ? wanIPSiteMoArr : [];
    OPMClient.InventoryDeviceDetailsController.wanIPFilterObj.severity=withSeverity?[1,2,3,4,6,7]:[];
    opmGlobalRoute.transitionTo('Inventory.List.WAN.Overview.Links','Overview'); //No I18N
}
