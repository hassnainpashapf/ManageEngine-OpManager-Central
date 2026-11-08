
function disableinSnapshotPage()
{
	if(window.OPM.isOPMCentral && !window.OPM.probeSwitchingInSnapshot)
	{ 
		
    	$("#eeProbeSelect").prop('disabled', true);
	}
}

function changeEEProbeSelection(probeID)
{
	var selectedProbe, callLoading;
	if(probeID===undefined) {
		callLoading = true;
		selectedProbe = $("#eeProbeSelect").val(); //NO I18N
	}else {
		callLoading = false;
		selectedProbe = probeID;
		$("#eeProbeSelect").val(probeID).select2(); //NO I18N
	}
	window.OPM.previousEEProbe = window.OPM.selectedEEProbe;
	window.OPM.selectedEEProbe = selectedProbe;

	if(window.OPM.probePermissions && !$.isEmptyObject(window.OPM.probePermissions)) {
		window.OPM.userPermissions = selectedProbe == "-1" ? Object.assign({}, window.OPM.centralPermissions) : Object.assign({}, window.OPM.probePermissions);
		window.OPM.restrictedPermissions = selectedProbe == "-1" ? Object.assign({}, window.OPM.centralRestrictedPermissions) : Object.assign({}, window.OPM.restrictedProbePermissions);
		reEvaluatePermissions();
		initializeOPMClient();
	}

	opm_initializeAlarmStack();
	setProbeIdForAlertPopup(selectedProbe);
	if(selectedProbe !== "-1") 
	{
		var probeDetails = getProbeDetailsForProbe(selectedProbe);
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/enterprise/listCentralDetails'); //No I18N
		if((response !==undefined && response !==null && response.error!==undefined && response.error.message!==undefined && response.error.code !==undefined && response.error.code===16000) || $.isEmptyObject(response)){
			opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.opm.ucv.probedown",{param0: probeDetails.probeDisplayName, param1: probeDetails.ProbeURL}, this)); //No I18N
			$("#eeProbeSelect").val("-1").trigger("change");
			return;
		}
		localStorage.setItem("ProbeURL",probeDetails.ProbeURL); //No I18N
		window.OPM.isCentralServer=false;
		window.OPM.isProbe=true;
		window.OPM.isWidgetActions = false;
		if(window.isoperator) {
			window.OPM.isAllowDashboardCreation = false;
		}
		
		OPMClient.ApplicationController.set("isCentralServer",false);//No I18N
		OPMClient.ApplicationController.set("isProbe",true);//No I18N
		//setting below property distributed mode
		window.OPM.isEEProbeSelected = true;
		window.OPM.isEECentralSelected = false;
		window.OPM.isAPMInstalledInProbe = false;

		window.OPM.isAPMProfInProbe = false;
		OPMClient.ApplicationController.set("isAPMProfInProbe", false); //No I18N
		localStorage.setItem("isAPMProfInProbe",false); //No I18N

		var apmresponse =  opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/v2/admin/getAPMPluginInstallationStatus?fromCentral=true'); //No I18N
		if(apmresponse !==undefined && apmresponse !==null){
			var apmServerType = apmresponse.apmServerType;
			if(apmServerType!=null && apmServerType=="NORM"){//No I18N
				localStorage.setItem("isAPMProfInProbe",true); //No I18N
				OPMClient.ApplicationController.set("isAPMProfInProbe", true); //No I18N
				window.OPM.isAPMProfInProbe = true;
			}
		}

		var ISWINDOWS = $("#eeProbeSelect option:selected").attr("ISWINDOWS");
		if(ISWINDOWS!==undefined && ISWINDOWS!=="") {
			var isWindows = (ISWINDOWS === 'true');
			window.OPM.isWindows = isWindows;
			OPMClient.ApplicationController.set("isWindowsOS",isWindows); //No I18N
			sessionStorage.setItem("isWindows",isWindows); //No I18N
		}
	}
	else 
	{
		window.OPM.isCentralServer = true;
		window.OPM.isProbe = false;
		
		OPMClient.ApplicationController.set("isCentralServer",true);//No I18N
		OPMClient.ApplicationController.set("isProbe",false);//No I18N
		//setting below property distributed mode
		window.OPM.isEEProbeSelected = false;
		window.OPM.isEECentralSelected = true;

		window.OPM.isAPMProfInProbe = false;
		OPMClient.ApplicationController.set("isAPMProfInProbe", false);//No I18N
		localStorage.setItem("isAPMProfInProbe",false); //No I18N

		window.OPM.isWindows = window.OPM.isEEWindows;
		OPMClient.ApplicationController.set("isWindowsOS",window.OPM.isEEWindows);//No I18N
		sessionStorage.setItem("isWindows",window.OPM.isWindows); //No I18N
		window.OPM.isWidgetActions = sessionStorage.getItem("window.OPM.isWidgetActions") === "true"; //No I18N
		window.OPM.isAllowDashboardCreation = sessionStorage.getItem("window.OPM.isAllowDashboardCreation") === "true"; //No I18N
	}
	


	Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
		$(".notifyHolder").removeAttr('style');//No I18n
	});
	
    OPMClient.ApplicationController.enableODReports=window.OPM.isOPMEELiteMode&&!window.OPM.isEEProbeSelected;
	OPMClient.ApplicationController.set("isEEProbeSelected",window.OPM.isEEProbeSelected);//No I18N
	OPMClient.ApplicationController.set("isEECentralSelected",window.OPM.isEECentralSelected);//No I18N
	OPMClient.ApplicationController.set("isLamaImplemented",isLamaIntegAvailable());//No I18N
	localStorage.setItem("selectedProbe",selectedProbe); //No I18N

	OPMClient.ReportslistController.opmreports = [];//reset reports type cache
	OPMClient.ReportsDetailsController.scheduleDefaultProps={};//reset default report filters
	
	OPMClient.ApplicationController.set("severitySettingsAllowed",getFaultSeveritySettingsPermission());//No I18N

	window.OPM.viewEECentral = (window.OPM.isProbe && window.OPM.userPermissions.enterpriseSettingsWrite && window.OPM.isAllCoreModulesFullAccessAdmin);
	window.OPM.viewEEProbe = ((window.OPM.isCentralServer || window.OPM.isMSPCentral) && window.OPM.userPermissions.enterpriseSettingsWrite && window.OPM.isAllCoreModulesFullAccessAdmin);
	window.OPM.viewEEProbeUpgrade = ((window.OPM.isOPM || window.OPM.isNCMEE) && window.OPM.isCentralServer && window.OPM.userPermissions.enterpriseSettingsWrite && window.OPM.isAllCoreModulesFullAccessAdmin);
	window.OPM.hideDownTimeSchedule = !window.OPM.isOpmPlug || !window.OPM.userPermissions.downtimeScheduleRead;

    window.OPM.viewTrapSettings = (window.OPM.viewTrap && !window.OPM.isCentralServer);
	window.OPM.showWorkflow  = ((window.OPM.isOPM && window.OPM.isOpmPlug) || window.OPM.isNCM) && window.OPM.userPermissions.workflowWrite && !(window.OPM.isCentralServer || window.OPM.isMSPCentral || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition);
	window.OPM.showCredentials = window.OPM.userPermissions.discoveryRead && (window.OPM.isNCM || window.OPM.isNFA && (window.OPM.isNfaPlug || window.OPM.isNcmPlug) || window.OPM.isOPM && (window.OPM.isNfaPlug || window.OPM.isNcmPlug || window.OPM.isOpmPlug));
	window.OPM.showSaml = window.OPM.isAllModulesFullAccessAdmin && !window.OPM.isOPMStandardEdition && !window.OPM.isFWAStand && (!ncmGetSelectedProbe() || ncmGetSelectedProbe() < 0) && !window.OPM.isRMMEdition && !(window.OPM.isOPMEEUnifiedConsoleView && window.OPM.isProbe);
	window.OPM.showSuppressAlarm = (window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.monitoringWrite);
	window.OPM.viewTrapTools = (window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.toolsetWrite) && !(window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition || window.OPM.isCentralServer || window.OPM.isMSPCentral);
    window.OPM.hideSyslogViewerForwardOpm = window.OPM.isOPM && (window.OPM.isMSPCentral || window.OPM.isCentralServer || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition);
    window.OPM.showCustomServer = (window.OPM.enableCustomServer || window.OPM.isOpenFWEnabled) && window.OPM.isOPMAloneActive && window.OPM.userPermissions.discoveryWrite && !(window.OPM.isOPMLiteEdition || window.OPM.isCentralServer);
	opm_evaluateAccessPermissions();
	refreshNetworkDiscoveryButtons();
    window.OPM.showQueryReport=window.OPM.userPermissions.adminAccess && !window.OPM.userPermissions.devGrouporBVRestricted && !window.OPM.userPermissions.intfGroupRestricted && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition && !window.OPM.isFreeEdition && window.OPM.isAllModulesEnabled && !window.OPM.userPermissions.opuRestricted && !window.OPM.userPermissions.ncmRestricted && !window.OPM.mspUserType !== 'Customer' && ((window.OPM.apmInstalled == true || window.OPM.apmInstalled == 'true') ? window.OPM.isAPMFullAdmin:true);//No I18N

	OPMClient.ApplicationController.set("viewTrapSettings",window.OPM.viewTrapSettings); //No I18N
	OPMClient.ApplicationController.set("showWorkflow",window.OPM.showWorkflow); //No I18N
	OPMClient.ApplicationController.set("viewTrapTools",window.OPM.viewTrapTools); //No I18N
	OPMClient.ApplicationController.set("showSuppressAlarm",window.OPM.showSuppressAlarm); //No I18N
	OPMClient.ApplicationController.set("showOldAddCredentials",(window.OPM.showCredentials || window.OPM.isOPUtils || window.OPM.isOPM && window.OPM.isOPUPlug) && window.OPM.userPermissions.discoveryWrite); //No I18N
	OPMClient.ApplicationController.set("isNfaPlug",window.OPM.isNfaPlug);//No I18N
	OPMClient.ApplicationController.set("customWidgetAccess",window.OPM.customWidgetAccess);//No I18N
	OPMClient.ApplicationController.set("queryWidgetAccess",window.OPM.isQueryReportEnabled && window.OPM.showQueryReport);//No I18N
	OPMClient.MenuController.set("dashboardMenuLinks",[]);//No I18N
	OPMClient.MenuController.set('nocViews',[]);//No I18N
	if(window.OPM.userPermissions.dashboardRead) {
	listCCTVView();
	window.OPM.userPermissions.devGroupRestricted ? getDashboardList(undefined, true) : getDashboardList();
	}
	if(OPMClient.ApplicationController.currentRouteName.indexOf("Inventory.List.OpStor.Sub") !== -1){
    	opm_deviceListFilterReset("Storage",OPMClient.InventoryDeviceDetailsController.subFilterType); //No I18N
    }
	nfa_updateNBAandNDRValues(true);

	OPMClient.MenuController.set("networkMenuLinks",[]);//No I18N
	loadInventoryMenuLinks();
	OPMClient.MenuController.set("authenticationTabs",loadAuthenticationTabs());//No I18N
	OPMClient.MenuController.set("settingsMenuLinks",[]);//No I18N
	OPMClient.MenuController.set("settingsMonitorMenuLinks",[]);//No I18N
	window.OPM.faultSettingsAccess = window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.adminAccess && !window.OPM.isProbe && !window.OPM.isMSPProbe && !(window.OPM.isMSPCentral && !OPMClient.ApplicationController.isMSPCentralSelected) && !window.OPM.userPermissions.bvRestricted && !window.OPM.userPermissions.devGroupRestricted && !window.OPM.userPermissions.opuRestricted && !window.OPM.userPermissions.ncmRestricted && window.OPM.mspUserType !== 'Customer'; //No I18N
	initializeGlobalSubMenus();
	OPMClient.MenuController.set("ncmSettingsMenuLinks",[]);//No I18N
	OPMClient.SettingsTabController.set("discoverySettingsTab",[]);//No I18N
    initNCMSettingsMenuLinks();
	initNFASettingsMenuLinks();
	initOpmAgentSettingsMenuLinks();
	loadSettingsMenuLinks();
	OPMClient.SettingsTabController.set("configSettingsTab", OPMClient.MenuController.settingsConfigMenuLinks);//No I18N
	OPMClient.SettingsTabController.set("monitorTabs",OPMClient.MenuController.settingsMonitorMenuLinks);//No I18N
	OPMClient.SettingsTabController.set("basicSettingsTab",OPMClient.MenuController.settingsBasicMenuLinks);//No I18N
	OPMClient.SettingsTabController.set("discoverySettingsTab",OPMClient.MenuController.settingsDiscoveryMainMenuLinks);//No I18N
	OPMClient.ApplicationController.set('OPMCentral',window.OPM.isCentralServer);//No I18N
	OPMClient.SettingsTabController.set("notificationSettingsTabs", OPMClient.MenuController.settingsSummaryNotificationMenuLinks);//No I18N
	OPMClient.MenuController.set("settingsToolsMenuLinks", []);//No I18N
	initToolsMenuLinks();
	OPMClient.SettingsTabController.set("toolsTabs", OPMClient.MenuController.settingsToolsMenuLinks);//No I18N

	OPMClient.MenuController.set("reportsMenuLinks",[]);//No I18N
	loadReportsMenuLinks();

	OPMClient.MenuController.set("workflowMenuLinks",[]);//No I18N
	loadWorkflowMenuLinks();
	loadAlarmsMenuLinks();
	//Rebuilding alarmMenuLinks drops the OPMPlus Alarms > Application override; re-apply it.
	loadCloudAndAPMInsightMenuLinks();

	OPMClient.MenuController.set("mapsMenuLinks",[]);//No I18N

	initAuditMenuLinks();
	if(window.OPM.isOPM && window.OPM.userPermissions.mapsRead)
	{
		getBussViewsList();
		if(!window.OPM.isOPMStandardEdition){
			listRackViews();
			list3DFloors();
			if(window.OPM.userPermissions.mapsRead && !window.OPM.isCentralServer && !window.OPM.isMSPCentralSelected && !window.OPM.userPermissions.bvRestricted) {
				getLayer2Maps();
			}
		}
	}
	loadMapsMenuLinks();
	if(window.OPM.userPermissions.dashboardRead) {
		loadDashboardMenuLinks();
	}
	OPMClient.ApplicationController.set("tabDetails",[]);//No I18N
	OPMClient.ApplicationController.set("tabDetails",(window.OPM.oldView)?getTabDetails():[]);//No I18N
	OPMClient.AlarmStackController.set("content_alarm",[]); //No I18N
	if(window.OPM.isOPMEEUnifiedConsoleView && window.OPM.isOPMCentral) {
		if(window.OPM.isEECentralSelected) {
			$('#quickLinksDropdown').show();
		} else {
			$('#quickLinksDropdown').hide();
		}
	}

	OPMClient.SettingsConfigurationController.set("categoriesOptions",[{"isHideBtn":window.OPM.isCentralServer || !window.OPM.userPermissions.configurationWrite,"route":"Settings.Configurations.Categories.ImportDevices","tabName":Ember.I18n.t('webclient.discovery.importdevices',this)},{"isHideBtn":window.OPM.isProbe,"tabName":Ember.I18n.t('webclient.admin.category.addcategory',this),"route":"Settings.Configurations.Categories.AddCategory"}]);//No I18N
	OPMClient.SettingsConfigurationController.set("opmElementGrpbtn",[{"tabName":Ember.I18n.t('webclient.admin.re.add',this),"route":"Settings.Configurations.ElementsGroup.Create","isHideBtn":!window.OPM.userPermissions.deviceAndInterfaceGroupsWrite},{"isCustom":true,"customElement":"<div class='opmBtn addUserBtn gridBulkDelActionNP' onclick='opmBulkDeleteGroups();' tabindex='0' role='button'>"+Ember.I18n.t('webclient.general.delete',this)+"</div>","isHideBtn":!window.OPM.userPermissions.deviceAndInterfaceGroupsWrite},{"isCustom":true,"customElement":"<div class='opmBtn addUserBtn gridBulkDelActionNP' onclick='opmShowGroupSettings();' tabindex='0' role='button'>"+Ember.I18n.t('apiclient.tab.settings',this)+"</div>","isHideBtn":!window.OPM.userPermissions.deviceAndInterfaceGroupsWrite},{"isCustom":true,"customElement":"<div class='opmBtn addUserBtn gridBulkDelActionNP grpGenReportBtn' onclick='opmGroupsGenerateReports();' tabindex='0' role='button'>"+Ember.I18n.t('webclient.gettingstarted.createreports',this)+"</div>","isHideBtn":!window.OPM.userPermissions.reportsRead || !window.OPM.isOpmPlug || window.OPM.isOPMLiteEdition || window.OPM.isOPMPlusCentral || window.OPM.enableGroupGenerateReport !== true},{"isCustom":true,"customElement":"<div class='opmBtn' id='addCredBtn' onclick='openAssociateToProbes(\"Groups\",false,undefined,true);' tabindex='0' role='button'>"+Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices',this)+"</div>","isHideBtn":!window.OPM.isCentralServer}]);//No I18N
	OPMClient.SettingsConfigurationController.set("ruleEngineOptions",[{"tabName":Ember.I18n.t('webclient.rightpanel.AlarmEscalation.AddNewRule',this),"route":"Settings.Discovery.RuleEngine.Add"},{"isCustom":true,"customElement":showCustomIcons("validateReRun","",Ember.I18n.t('webclient.common.rerun',this))},{"isCustom":true,"customElement":"<div class='opmBtn' id='addCredBtn' onclick='openAssociateToProbes(\"RULEENGINE\",false,undefined,true);'>"+Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices',this)+"</div>","isHideBtn":!window.OPM.isCentralServer}]);//No I18N
	var resetDT = OPMClient.SettingsTabController.associationTitles;
	resetDT["DeviceTemplate"] = {inputName:Ember.I18n.t('webclient.map.filemonitor.templates.templatename',this),leftHeader:window.OPM.isCentralServer?Ember.I18n.t('webclient.admin.devicetype.applyTempl.availableProbes',this):Ember.I18n.t('webclient.general.availabledevices'),rightHeader:window.OPM.isCentralServer?Ember.I18n.t('webclient.admin.devicetype.applyTempl.selectedProbes',this):Ember.I18n.t('webclient.general.selecteddevices'),mainHeader:Ember.I18n.t("webclient.admin.devicetype.newTempl.devTempl",this),isDT:true};//No I18N
	if(window.OPM.isCentralServer){
		OPMClient.SettingsConfigurationController.deviceOptions=[{"isCustom":true,"customElement":custiomFiledsAssociate('device')},{"tabName":Ember.I18n.t('webclient.add.fielld',this),"route":"Settings.Configurations.AdditionalFields.Device.Add"}]; //No I18N
		OPMClient.SettingsConfigurationController.interfaceOptions=[{"isCustom":true,"customElement":custiomFiledsAssociate('interface')},{"tabName":Ember.I18n.t('webclient.add.fielld',this),"route":"Settings.Configurations.AdditionalFields.Interface.Add"}]; //No I18N
	}
	else if(window.OPM.isProbe){
		OPMClient.SettingsConfigurationController.deviceOptions=[{"tabName":Ember.I18n.t("opm.commontext.importvalues",this),"route":"Settings.Configurations.AdditionalFields.Device.Import"}]; //No I18N
		OPMClient.SettingsConfigurationController.interfaceOptions=[{"tabName":Ember.I18n.t("opm.commontext.importvalues",this),"route":"Settings.Configurations.AdditionalFields.Interface.Import"}]; //No I18N
	}
	var credentialsOptions = [
		{"tabId":"testCredential","tabName":Ember.I18n.t('webclient.map.bulkCredentialTest.testCredential'), "route":"Settings.Discovery.TestCredentials","isHide":!window.OPM.isOpmPlug || !window.OPM.userPermissions.discoveryWrite || window.OPM.isCentralServer || window.OPM.isFWA},//No I18N
		{"tabId":"Associatetodevices","tabName":Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices',this),"route":"Settings.Discovery.Credentials.Category.Associate","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug) || !window.OPM.userPermissions.discoveryWrite || window.OPM.isCentralServer}, //No I18N
		{"isCustom":true,"customElement":"<div class='opmBtn' id='addCredBtn' onclick='openAssociateToProbes(\"CREDENTIALS\",false,undefined,true);'>"+Ember.I18n.t('webclient.rightpanel.notification.Associatetodevices',this)+"</div>","isHide":!window.OPM.userPermissions.discoveryWrite || !window.OPM.isCentralServer},  //No I18N
		{"tabId":"addBackupCredential","tabName":Ember.I18n.t('webclient.discovery.addcredential',this),"route":"Settings.Discovery.Credentials.Category.Add","isHide":!window.OPM.userPermissions.discoveryWrite}, //No I18N
		{"isCustom":true,"customElement":"<div class='opmBtn' id='addCredBtn' onclick='openCredentialSlide();'>"+Ember.I18n.t('webclient.discovery.addcredential',this)+"</div>","isHide":!window.OPM.userPermissions.discoveryWrite}  //No I18N	
	];
	
	if(window.OPM.userPermissions.discoveryWrite && (window.OPM.isNCM || window.OPM.isNFA)) {
		credentialsOptions = [{"tabName":Ember.I18n.t('webclient.discovery.addcredential',this),"route":"Settings.Discovery.Credentials.Category.Add"}]; //NO I18N
	}
	OPMClient.SettingsConfigurationController.set("credentialsOptions",credentialsOptions);//No I18N
	OPMClient.Router.router.recognizer.names = {};
	OPMClient.Router.router.callbacks = [];
	routeDiclarations();
	if(callLoading) {
		//Custom Alarms Redirection handled in UCV probe switching
		var isCustomAlarm = OPMClient.AlarmDetailsController.get("isCustomAlarm");//No I18N
		if(isCustomAlarm) {
			OPMClient.ApplicationController.selectedProbeView = window.OPM.currentView.name;
		}
	OPMClient.ApplicationController.selectedProbePage = window.location.hash;
	opmGlobalRoute.transitionTo('Loading'); //No I18N

	var discoverySettingsResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/GetOpManagerSettings?fromTab=DiscoverySettings"); //No I18N
	if(discoverySettingsResponse && discoverySettingsResponse.systemSettings && discoverySettingsResponse.systemSettings.isDeleteDeviceFromOtherModules) {
		window.OPM.isDeleteDeviceFromOtherModules = discoverySettingsResponse.systemSettings.isDeleteDeviceFromOtherModules === "true";
	} else {
		window.OPM.isDeleteDeviceFromOtherModules = false;
	}
	OPMClient.ApplicationController.set("hideUpgradeManager", getHideUpgradeManager()); //No I18N
	OPMClient.ApplicationController.set("hideEmergencyPatchSettings", getHideEmergencyPatchSettings()); //No I18N
	if(!window.OPM.probeRestrictedAllProbeSelected) {
		setSecurityScore();
	}
	reinitializeZiaBot();
	initializeGenAI();
	OPMClient.SettingsAddEditController.set("dtsSuppressAlarmTypes", setSuppressAlarmTypesInDTS()); //No I18N
	window.OPM.faultSettingsAccess = window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.adminAccess && !window.OPM.isProbe && !window.OPM.isMSPProbe && !(window.OPM.isMSPCentral && !OPMClient.ApplicationController.isMSPCentralSelected) && !window.OPM.userPermissions.bvRestricted && !window.OPM.userPermissions.devGroupRestricted && !window.OPM.userPermissions.opuRestricted && !window.OPM.userPermissions.ncmRestricted && window.OPM.mspUserType !== 'Customer'; //No I18N
	loadMonInstCntSettings();
}


function getProbeDetailsForProbe(probeID) {
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/device/getProbeURL?probeID='+probeID); //No I18N
	return jsonData;
}
	
	if(window.OPM.isOPM && window.OPM.isEvalUser) {
		Ember.run.schedule('afterRender', function() { //No I18n
			$("#MainNav .NavUl > li > a").click(function(){//No I18N
				opmUserStats("Tab_"+$(this).closest(".NavUl > li").attr("data-title"));//No I18N
			});
		});
	}
		//Clear Search result when probe dropdown changed
		searchablePages = undefined;
		$('#globalSearchValue').val("");
		clearGlobalSearchPage();
}

function setProbeIdForAlertPopup(probeId) {
	var url = window.OPM.apiUrlPattern+"/alarm/setProbeIdForAlertPopup"; //No I18N
	var data = {
		"probeId": probeId //No I18N
	}
	opm_ajaxPostRequest(url, data);
}

function initAjaxEEPreFilter() {
	var windowOpen = window.open;
	window.open = function(url, name, features, replace) 
	{
		if(window.OPM.selectedEEProbe!=="-1") {
			url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
		}
		return windowOpen(url, name, features, replace);
	}
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		if(options.url.indexOf('/client/api/json/') != -1) 
		{
			if(window.OPM.selectedEEProbe!=="-1") {
				if(options.url.indexOf('updateUserZiaPreferences') >= 0 || options.url.indexOf('getUserZiaPreferences') >= 0 || options.url.indexOf('listProbes') >= 0 || options.url.indexOf('getProbeURL') >= 0 || options.url.indexOf('getLanguageSettings') >= 0 || options.url.indexOf('getAPIKey') >= 0 || options.url.indexOf('devicePresent') >= 0 || options.url.indexOf('setProbeIdForAlertPopup') >=0 || options.url.indexOf('getEESettings') >= 0 || options.url.indexOf('getTOTPInfo')>=0 || options.url.indexOf('getSecurityUrlsEnabledStatus') >= 0 || (window.OPM.EETempProbeIdExcludeForApi && (options.url.indexOf('getSecurityRecommendations') >= 0 || options.url.indexOf('setSecurityRecommendations') >= 0))) {
					return;
				}
				
				//Adding eeProbeID to api request based on the type of request
				if(options.data === undefined || options.data === "") {
					options.data = 'eeProbeID=' + window.OPM.selectedEEProbe; //No I18N
				 }
				 else if(options.data === undefined || typeof options.data === 'string') {
					if(options.data.indexOf('eeProbeID') == -1){
						options.data += '&eeProbeID=' + window.OPM.selectedEEProbe; //No I18N
					}
				 }
				 else if(options.data instanceof FormData) {
					 options.data.append("eeProbeID",window.OPM.selectedEEProbe); //No I18N
				 }
				 else if(typeof options.data === 'object') {
					 options.data = $.extend({}, options.data, {'eeProbeID': window.OPM.selectedEEProbe}); //No I18N
				 }
			}
		}
	});
}

function appendProbeIDForExternal(url,selectedProbeID) {
	var include = ['EmbedEnhancedGraph']
	if(url.indexOf(window.OPM.apiUrlPattern) > -1 || include.filter(function(value) {return url.indexOf(value) > -1}).length > 0) {
		if(url.indexOf('?') < 0) {
			url += '?eeProbeID=' + selectedProbeID;//NO I18N
		}
		else {
			url += '&eeProbeID=' + selectedProbeID;//NO I18N
		}
	}
	return url;
}

function enableDisableEEProbeSelector (EESelectEnabled) {
	if(EESelectEnabled) {
		$('#eeProbeSelect').attr("disabled", true);
	}
	else {
		$('#eeProbeSelect').attr("disabled", false);
	}
}

function eeProbeRedirection() {
	HorizontalViewMainNavScroll();
	if(OPMClient.ApplicationController.selectedProbePage!==undefined && OPMClient.ApplicationController.selectedProbePage!=="") {

		//Summary page related handling Starts
		if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.dashboard") >= 0)) {
			opmGlobalRoute.transitionTo("/"); //No I18N
		} else if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.inventory") >= 0)) {
			settingsGlobalRoute.transitionTo('Inventory.List.Summary.Sub','Devices');//No I18N
		} else if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.network") >= 0)) {
			opmGlobalRoute.transitionTo("Inventory.List.Monitoring.Sub", "Devices"); //No I18N
		} else if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.servers") >= 0)) {
			opmGlobalRoute.transitionTo('Inventory.List.Server.Sub',"Devices");//No I18N
		} else if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.virtualization") >= 0)) {
			settingsGlobalRoute.transitionTo('Inventory.List.Virtualization.Sub','all'); //No I18N
		}else if(window.OPM.selectedEEProbe!=="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("opmee.summary.oputils") >= 0)) {
			settingsGlobalRoute.transitionTo('Inventory.List.OpUtils.Sub','Devices'); //No I18N
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("#/Reports/") >= 0) { //NO I18N
			if(window.OPM.previousEEProbe!=="-1" && window.OPM.selectedEEProbe!=="-1") { //NO I18N
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}else {
				opmGlobalRoute.transitionTo("ReportsSummary"); //NO I18N
			}
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("#/Settings/") >= 0) { //NO I18N
			//FOS has different redirections based on its configuration. That's handled to redirect to default route
			if(OPMClient.ApplicationController.selectedProbePage.indexOf("#/Settings/Basic/Fos") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("#/Settings/Basic/FailoverDetails") >= 0) {
				location.href = "#/Settings/Basic/FosConfiguration"; //NO I18N
			}else if(window.OPM.previousEEProbe!=="-1" && window.OPM.selectedEEProbe!=="-1") { //NO I18N
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}else {
				var sLinks = OPMClient.MenuController.settingsMenuLinks;
				if(sLinks && sLinks.length > 0 && sLinks.every(function(l) { return l.isHide; })) {
					opmGlobalRoute.transitionTo('/'); //No I18N
				} else {
					opmGlobalRoute.transitionTo("SettingsSummary"); //NO I18N
				}
			}
		}else if(OPMClient.ApplicationController.selectedProbePage==="#/ReportsSummary" || OPMClient.ApplicationController.selectedProbePage==="#/SettingsSummary") { //NO I18N
			var sLinks2 = OPMClient.MenuController.settingsMenuLinks;
			if(OPMClient.ApplicationController.selectedProbePage==="#/SettingsSummary" && sLinks2 && sLinks2.length > 0 && sLinks2.every(function(l) { return l.isHide; })) { //No I18N
				opmGlobalRoute.transitionTo('/'); //No I18N
			} else {
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}
		}
		//Summary page related handling Ends
		else if(window.OPM.selectedEEProbe==="-1" && OPMClient.ApplicationController.selectedProbePage.indexOf("Summary")>=0) {
			location.href = redirectOPMInventory("Summary"); //No I18n
		} else if(window.OPM.selectedEEProbe==="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("Monitoring") >= 0)) {
			location.href = redirectOPMInventory("Monitoring"); //No I18n
		} else if(window.OPM.selectedEEProbe==="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("Server") >= 0)) {
			location.href = redirectOPMInventory("Server"); //No I18n
		} else if(window.OPM.selectedEEProbe==="-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("Virtualization") >= 0)) {
			location.href = redirectOPMInventory("Virtualization"); //No I18n
		}else if(window.OPM.selectedEEProbe !== "-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("/GenerateReports/selection") >= 0)){//NO I18N
			location.href = OPMClient.ApplicationController.selectedProbePage.split('/GenerateReports/selection')[0];//NO I18N
		}else if(window.OPM.selectedEEProbe !== "-1" && (OPMClient.ApplicationController.selectedProbePage.indexOf("/GenerateReports/report") >=0)){//NO I18N
			location.href = OPMClient.ApplicationController.selectedProbePage.split('/GenerateReports/report')[0];//NO I18N
		}
		//NFA Inventory
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("FlowAnalysis")>=0) { //NO I18N
			var splitArr = OPMClient.ApplicationController.selectedProbePage.split("/"); //NO I18N
			var subFilter = splitArr[splitArr.length-1];
			if(window.OPM.selectedEEProbe==="-1" && ["Devices","Interfaces","WLC"].indexOf(subFilter)===-1) { //NO I18N
				opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub", "Devices"); //NO I18N
			}else {
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}
		}
		//DPI Inventory
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("PacketAnalysis")>=0) { //NO I18N
			if(window.OPM.selectedEEProbe==="-1") { //NO I18N
				opmGlobalRoute.transitionTo("Inventory.List.Summary.Sub","Devices"); //NO I18N
			}else {
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}
		}
		else if(window.OPM.selectedEEProbe==="-1" && OPMClient.ApplicationController.selectedProbePage.indexOf("LogMgmt")>=0) { //NO I18N
			settingsGlobalRoute.transitionTo('Inventory.List.Summary.Sub','Devices');//No I18N
		}
		//NFA Snapshots
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Inventory/Snapshot/Flow")>=0) { //NO I18N
			// ['#', 'Inventory', 'Snapshot', 'FlowInterface', '10005000022']
			var splitArr = OPMClient.ApplicationController.selectedProbePage.split("/"); //NO I18N
			var subFilter = (splitArr[3]==="FlowInterface") ? "Interfaces" : ((wlcSnapType.indexOf(splitArr[3])>=0) ? "WLC" : "Devices"); //NO I18N
			opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub", subFilter); //NO I18N
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Snapshot") >= 0){
			opmGlobalRoute.transitionTo('Inventory.List.Summary.Sub','Devices');//No I18N
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Alarms/Alarm/Details") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("RCA") >= 0 || (OPMClient.ApplicationController.selectedProbeView!==undefined && OPMClient.ApplicationController.selectedProbeView.indexOf("Alarms.Alarm.Custom") >= 0) || OPMClient.ApplicationController.selectedProbePage.includes("#/Alarms/Anomalies")){
			opmGlobalRoute.transitionTo('Alarms.Alarm.All');//No I18N
		}
		//NFA Dashboard
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Home/Dashboard/NFA/")>=0) { //NO I18N
			if(window.OPM.selectedEEProbe==="-1") { //NO I18N
				location.href = window.OPM.apiclientUrl + (window.OPM.isOPMEELiteMode ? "Home/Dashboard/Overview/dashboard.name.enterprisedashboard" : "Home/Dashboard/NFA/dashboard.name.nfaprobestats"); //NO I18N
			}else {
				location.href = (window.OPM.previousEEProbe==="-1") ? window.OPM.apiclientUrl+"Home/Dashboard/NFA/NFADB.traffic" : OPMClient.ApplicationController.selectedProbePage; //NO I18N
			}
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Home/Dashboard/") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Workflows") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("/Logs") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("/DiagnosticsEE") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("/APM") >= 0) {
			if(window.OPM.userPermissions.devGroupRestricted) { //For dev or BV restricted users Need this handling
				Ember.run.schedule("afterRender", function() {//No I18N
					window.OPM.selectedEEProbe!=="-1" ? (OPMClient.MenuController.customDashboards.length > 1 ? redirectToNextDashboard('Custom',OPMClient.MenuController.customDashboards[0].displayName) : location.href= "#/Home/Dashboard/Custom/Add__New__Dash"): redirectToNextDashboard('Custom',window.OPM.defaultDashboard);//No I18N
				});
			} else {
				opmGlobalRoute.transitionTo('/');//No I18N		
			}
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/BusinessView/") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Layer2MapDevices") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/VMMap") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/HyperVMap") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/XenMap") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/NutanixMap") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/ProxmoxMap") >= 0 || OPMClient.ApplicationController.selectedProbePage.indexOf("Maps/NetworkOrgMap") >= 0 && window.OPM.probeRestrictedAllProbeSelected) {
			opmGlobalRoute.transitionTo("Maps.BusinessView"); //No I18N
		}
		else if(window.OPM.selectedEEProbe==="-1" && OPMClient.ApplicationController.selectedProbePage.indexOf("#/Analyze/") >= 0) {//No I18N
			//System Performance pages redirects to default when these option chosen since this is hidden in central
			var defaultRedirection = ["PollingStatistics", "HealthReports", "LoadDetails"].some(function(val){if(OPMClient.ApplicationController.selectedProbePage.includes(val)){return true;}});//No I18N
			if(defaultRedirection) {
				location.href = window.OPM.apiclientUrl + 'Analyze/PerformanceAssistant';
			} else {
				location.href = OPMClient.ApplicationController.selectedProbePage;
			}
		}
		else if(OPMClient.ApplicationController.selectedProbePage.indexOf("#/Support") >= 0 && window.OPM.probeRestrictedAllProbeSelected && OPMClient.MenuController.customizeSecondaryMenus
[0] && OPMClient.MenuController.customizeSecondaryMenus[0].menuLink) {
			location.href = OPMClient.MenuController.customizeSecondaryMenus[0].menuLink;
		}
		else {
			// All specific page handlers exhausted. Navigate to the original page;
			// Ember will handle unrecognised routes via its own not-found route. //No I18N
			location.href = OPMClient.ApplicationController.selectedProbePage;
		}
	}
}

function changeEEProbeID(probeID) {
	$("#eeProbeSelect").val(probeID).trigger("change");
}

function arrayElementIsSubstring(array, largerString) {
	for (var i = 0; i < array.length; i++) {
		if (largerString.indexOf(array[i]) !== -1) {
		return true;
		}
	}
	return false;
}
