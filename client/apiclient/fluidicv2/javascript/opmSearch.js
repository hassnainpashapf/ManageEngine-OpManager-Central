//$Id$
var searchablePages;
var searchCategories = [
    { "displayName": Ember.I18n.t('webclient.devices.details.alarm', this), "id": "ALERT", 'show': !window.OPM.isOPUtils && !window.OPM.isOPUPlugAloneActive},//No I18N
    { "displayName": Ember.I18n.t('webclient.general.Devices', this), "id": "DEVICE", 'show': window.OPM.isOPM && window.OPM.isOpmPlug },//No I18N
    { "displayName": Ember.I18n.t('webclient.devices.details.intf', this), "id": "INTERFACE", 'show': window.OPM.isOPM && window.OPM.isOpmPlug },//No I18N
    { "displayName": Ember.I18n.t('webclient.admin.logging.httpclient', this), "id": "URL", 'show':  window.OPM.isOPM && window.OPM.isOpmPlug && !window.OPM.isOPMLiteEdition && window.OPM.userPermissions.monitoringRead && !window.OPM.isURLMonitoringRestricted},//No I18N
    { "displayName": Ember.I18n.t('webclient.fault.addnotes.notes', this), "id": "NOTE", 'show': window.OPM.isOPM && window.OPM.isOpmPlug },//No I18N
    { "displayName": Ember.I18n.t('webclient.reports.header', this), "id": "REPORTS", 'show': window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.reportsRead},//No I18N
    { "displayName": Ember.I18n.t('webclient.tab.netflow', this) + ' ' + Ember.I18n.t('webclient.general.Devices', this), "id": "NFA_DEVICE", 'show': window.OPM.isOPM && window.OPM.isNfaPlug || (window.OPM.isNFA || window.OPM.isNDP) },//No I18N
    { "displayName": Ember.I18n.t('webclient.tab.netflow', this) + ' ' + Ember.I18n.t('webclient.devices.details.intf', this), "id": "NFA_INTERFACE", 'show': window.OPM.isOPM && window.OPM.isNfaPlug || (window.OPM.isNFA || window.OPM.isNDP) },//No I18N
    { "displayName": Ember.I18n.t('webclient.common.dashboard.ipgroup', this), "id": "NFA_IPGROUP", 'show': ((window.OPM.isOPM && window.OPM.isNfaPlug) || (window.OPM.isNFA && !window.isNFAStandardEdition)) },//No I18N
    { "displayName": Ember.I18n.t('webclient.tab.ncm', this) + ' ' + Ember.I18n.t('webclient.general.Devices', this), "id": "NCM_DEVICE", 'show': window.OPM.isOPM && window.OPM.isNcmPlug || ((window.OPM.isNFA && !window.isNFAStandardEdition) || window.OPM.isNDP || window.OPM.isNCM) },//No I18N
    { "displayName": Ember.I18n.t('webclient.settings.ncm.config', this), "id": "NCM_CONFIG", 'show': window.OPM.isOPM && window.OPM.isNcmPlug || ((window.OPM.isNFA && !window.isNFAStandardEdition) || window.OPM.isNDP || window.OPM.isNCM) },//No I18N
    { "displayName": Ember.I18n.t('webclient.tab.ncm', this) + ' ' + Ember.I18n.t('webclient.opm.devicegroup', this), "id": "NCM_DEVICEGROUP", 'show': window.OPM.isOPM && window.OPM.isNcmPlug || ((window.OPM.isNFA && !window.isNFAStandardEdition) || window.OPM.isNDP || window.OPM.isNCM) },//No I18N
    { "displayName": Ember.I18n.t('webclient.tab.ncm', this) + ' ' + Ember.I18n.t('dashboard.name.ncmcompliance', this), "id": "NCM_COMPLIANCE", 'show': window.OPM.isOPM && window.OPM.isNcmPlug || ((window.OPM.isNFA && !window.isNFAStandardEdition) || window.OPM.isNDP || window.OPM.isNCM) },//No I18N
    { "displayName": Ember.I18n.t('webclient.admin.alarmesc.firewall', this) + ' ' + Ember.I18n.t('webclient.general.Devices', this), "id": "FWA_DEVICE", 'show':  window.OPM.isOPM && window.OPM.isFwaPlug || window.OPM.isFWA },//No I18N
    { "displayName": Ember.I18n.t('webclient.admin.alarmesc.firewall', this) + ' ' + Ember.I18n.t('webclient.devices.details.intf', this), "id": "FWA_INTERFACE", 'show': window.OPM.isOPM && window.OPM.isFwaPlug || window.OPM.isFWA },//No I18N
    { "displayName": Ember.I18n.t('webclient.appmanager.cloud', this) + ' ' + Ember.I18n.t('webclient.action.services', this), "id": "FWA_CLOUD", 'show': window.OPM.isOPM && window.OPM.isFwaPlug || window.OPM.isFWA },//No I18N
    { "displayName": Ember.I18n.t('opu.views.USED', this) + ' ' + Ember.I18n.t('webclient.action.rule', this), "id": "FWA_RULES", 'show': window.OPM.isOPM && window.OPM.isFwaPlug || window.OPM.isFWA },//No I18N
    { "displayName": Ember.I18n.t('opu.tools.IP_ADDRESS_MANAGER', this), "id": "IPAM_SUBNET","show": window.OPM.isOPM && window.OPM.isOPUPlug || window.OPM.isOPUtils },//No I18N
    { "displayName": Ember.I18n.t('webclient.action.switchport.header', this), "id": "IPAM_SWITCH","show": window.OPM.isOPM && window.OPM.isOPUPlug || window.OPM.isOPUtils }//No I18N
];
function setSearchTabs() {
    var allValidTabs = searchCategories.filter(function(obj) {
        return obj.show;
    }).map(function(obj) {
        return obj.id;
    });
    if (localStorage.getItem('activeSearchTabs') === null) {
        localStorage.setItem('activeSearchTabs', JSON.stringify(allValidTabs.slice(0, 6))); //No I18N
    }
    else { //
        var currentActiveTabs = JSON.parse(localStorage.getItem('activeSearchTabs')); //NO I18n
        currentActiveTabs = currentActiveTabs.filter(function(param){
            for(var i = 0; i < allValidTabs.length; i ++) {
                if(param === allValidTabs[i]){
                    return true;
                }
            }
            return false;
        });
        if(currentActiveTabs.length === 0) {
            currentActiveTabs = allValidTabs.slice(0, 5);
        }
        localStorage.setItem('activeSearchTabs', JSON.stringify(currentActiveTabs));  //NO I18n
    }
}
function createQuickSearchPages() {
	var isAllCollSelected = isAllCollectorSelected(); //NFA-DE All collector option selected or not
    var allPages = {
        settings: {
            common: [
                // basicSettingsTab:
                { "displayName": Ember.I18n.t('webclient.admin.mailserversettings'), "route": "Settings.Basic.Mail", "isHide": isNotMspAdmin() || (!window.OPM.userPermissions.generalSettingsRead)}, //No I18N
                { "displayName": Ember.I18n.t('webclient.admin.smsserver.settings'), "route": "Settings.Basic.SMS", "isHide": isNotMspAdmin() || !window.OPM.showSMSSettings || (!window.OPM.userPermissions.generalSettingsRead)},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.proxy.title'), "route": "Settings.Basic.Proxy", "isHide":!window.OPM.showProxySettings || !window.OPM.userPermissions.generalSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.oauthprovider.title'), "route": "Settings.Basic.OauthProvider", "isHide": !window.OPM.userPermissions.generalSettingsRead}, //No I18N
                { "displayName": Ember.I18n.t('webclient.admin.rebrand.Rebranding'), "route": "Settings.Basic.Rebrand", "isHide": isNotMspAdmin() || !window.OPM.userPermissions.generalSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('opm.devicesnapsettings'), "route": "Settings.Basic.ClientSettings", "isHide": isNotMspAdmin() || !window.OPM.userPermissions.generalSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.basic.serversettings', this), "route": "Settings.Basic.NFAServer", "isHide": window.OPM.isCentralServer || window.OPM.isMSPCentral || !window.OPM.userPermissions.generalSettingsRead}, //No I18N
                { "displayName": Ember.I18n.t('webclient.Listener.Port', this), "route": "Settings.Basic.NFAServer", "isHide": window.OPM.isCentralServer || window.OPM.isMSPCentral || !window.OPM.userPermissions.generalSettingsRead}, //No I18N              
                { "displayName": Ember.I18n.t('webclient.ncm.servr', this), "route": "Settings.NcmConfig.NCMServer", "isHide": (!window.OPM.userPermissions.generalSettingsRead || window.OPM.isCentralServer || window.OPM.isMSPCentral || window.isNFAStandardEdition) }, //No I18N
                { "displayName": Ember.I18n.t('webclient.admim.setting', this), "route": "Settings.Basic.System", "isHide": !window.OPM.userPermissions.generalSettingsRead },//No I18N
                { "displayName": Ember.I18n.t('opm.devicesnapsettings'), "route": "Settings.Basic.ClientSettings", "isHide": (window.OPM.isCentralServer || OPMClient.ApplicationController.isCustomer || window.OPM.isOPMLiteEdition) || isNotMspAdmin() || !window.OPM.userPermissions.generalSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.selfMonitoring'), "route": "Settings.Basic.SelfMonitoring", "isHide": OPMClient.ApplicationController.isCustomer || !window.OPM.userPermissions.generalSettingsRead },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.failover.Details'), "route": "Settings.Basic.FosConfiguration", "isHide": (window.OPM.isKingbaseDB || isNotMspAdmin()) || !window.OPM.userPermissions.generalSettingsRead}, //No I18N
                // migrationTabs:
                /*{ "displayName": Ember.I18n.t('dbmaintanence.ui.header'), "route": "Settings.Basic.DataMigration.OtherTools", "isHide": (window.OPM.isCentralServer || window.OPM.isProbe) },//No I18N
                { "displayName": Ember.I18n.t('webclient.common.enterprise', this), "route": "Settings.Basic.DataMigration.Enterprise" },//No I18N
                { "displayName": Ember.I18n.t('webclient.other.tool.tab', this), "route": "Settings.Basic.DataMigration.OtherTools" },//No I18N   */         
                // userManagementTabs:
                { "displayName": Ember.I18n.t('webclient.tab.settings.usermgmt'), "route": "Settings.Basic.UserMgmt.List", "isHide": isNotMspAdmin() || !window.OPM.userPermissions.userMgmtRead || window.OPM.isRMMCentral},//No I18N            
                { "displayName": Ember.I18n.t('webclient.admin.proxy.serverauth'), "route": getMenuLink(OPMClient.MenuController.authenticationTabs, true), "isHide": !window.OPM.showAuthentication},//No I18N
                { "displayName": Ember.I18n.t('webclient.lic.management', this), "route": "Settings.Basic.LicenseMgmt", "isPath": true, "path": "UsageInfo", "isHide": !window.OPM.isAllModulesFullAccessAdmin || !window.OPM.isOPM || window.OPM.isOPMLiteEdition || window.OPM.isProbe || window.OPM.isRMMEdition},//No I18N
                { "displayName":Ember.I18n.t("webclient.admin.settings.secrec.title",this),"route":"Settings.Basic.SSLSettings.SecurityRecommendations", isHide: window.OPM.hideSecurityRecommendations}, //No I18N
                { "Name": Ember.I18n.t('webclient.Radius.Server.Settings', this), "route": "Settings.Basic.Authentication.RadiusSetting", "isHide": isNotMspAdmin() || !window.OPM.userPermissions.userMgmtRead || window.OPM.isFIPSEnabled}, //No I18N
                { "Name": Ember.I18n.t('webclient.admin.winDomains'), "route": "Settings.Basic.Authentication.Domain", "isHide": isNotMspAdmin() || !window.OPM.userPermissions.userMgmtRead}, //No I18N
                { "Name": Ember.I18n.t('webclient.saml'), "route": "Settings.Basic.Authentication.SAML", "isHide": !window.OPM.showSaml}, //No I18N
                {"displayName":Ember.I18n.t('webclient.DBbackup'),"route":"Settings.Basic.DBbackup","isHide":!window.OPM.userPermissions.generalSettingsRead || !(window.OPM.isPGSQLDB || window.OPM.isProbeDropdownShown)},//No I18N
                //{"displayName":'OpStor',"route":"Settings.Configurations.AddOnProduct.OpStor"}//No I18N
		        {"displayName": Ember.I18n.t("webclient.settings.upgrade.title"),"route":"Settings.Basic.UpgradeInfo","isHide": getHideUpgradeManager()}//No I18N
            ],
            discovery: [
                // discoverySettingsTab:
                { "displayName": Ember.I18n.t('webclient.Deploy.Agent'), "route": "Settings.Discovery.DeployAgent", "isPath": false,  "isHide":window.OPM.isCentralServer || !(window.OPM.isOPM && window.OPM.isOpmPlug) || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition  || !window.OPM.userPermissions.discoveryWrite},//No I18N
                { "displayName": Ember.I18n.t('webclient.topo.details.tabs.discovery', this), "route": "Settings.Network.ShallowDiscovery", "isPath": true, "path": "Add", "isHide": !window.OPM.isOpmPlug || window.OPM.isNCM || window.OPM.isNFA},//No I18N
                { "displayName": Ember.I18n.t('webclient.topo.details.tabs.discovery', this), "route": "Settings.Discovery.NCMDiscoveryWizard", "isHide": !window.OPM.isNCM && !(window.OPM.isNFA && !window.isNFAStandardEdition) },//No I18N
                { "displayName": Ember.I18n.t('webclient.topo.details.tabs.discovery', this) + " " + Ember.I18n.t('webclient.reports.header', this), "route": "Settings.Network.Discovery", "isPath": true, "path": "Reports","isHide": !window.OPM.isOpmPlug || window.OPM.isNCM || window.OPM.isNFA },//No I18N
                { "displayName": Ember.I18n.t('webclient.discovery.report',this), "route":"Settings.Discovery.NCMDiscovery.Details", "isHide": (!window.OPM.isNCM && !(window.OPM.isNFA && !window.isNFAStandardEdition))},//No I18N
                { "displayName": Ember.I18n.t('webclient.topo.bulkedit.changecredential'), "route": "Settings.Discovery.Credentials.Category", "isPath": true, "path": "Monitors" , "isHide": !window.OPM.showCredentials},//No I18N
		        { "displayName":Ember.I18n.t('webclient.map.bulkCredentialTest.testCredential'), "route":"Settings.Discovery.TestCredentials","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug) || !window.OPM.userPermissions.discoveryRead},//No I18N
                // { "displayName": Ember.I18n.t('webclient.discovery.addcredential'), "route": "Settings.Discovery.Credentials.Category.Add" },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.adddevice.adddevice'), "route": "Settings.Discovery.AddNewDevice", "isPath": false, "path": "AddDevice", "isHide": window.OPM.isNCM || window.OPM.isNFA || !window.OPM.userPermissions.discoveryRead || !window.OPM.isOpmPlug},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.adddevicebytype'), "route": "Settings.Discovery.AddDeviceByType", "isPath": false, "path": "AddDeviceByType", "isHide": !window.OPM.showCustomServer},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.perf.settings.discovery.ipmi.add'), "route": "Settings.Discovery.AddIPMI", "isPath": false, "isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.devices.opstor.add.storage'), "route": "Settings.Discovery.AddStorage", "isHide": window.OPM.isNCM || window.OPM.isNFA || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite || !window.OPM.isStoragePlug},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.addwireless'), "route": "Settings.Discovery.AddWireless","isPath": false, "path": "AddWireless", "isHide": !window.OPM.isOpmPlug || window.OPM.isNCM || window.OPM.isNFA || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.add.ciscoaci'), "route": "Settings.Discovery.AddCiscoACI","isPath": false, "path": "AddCiscoACI", "isHide": !window.OPM.isOpmPlug || window.OPM.isNCM || window.OPM.isNFA || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition || !window.OPM.userPermissions.discoveryWrite} //No I18N
            ],
            tools: [
                // diagnosticTabs:
                { "displayName": Ember.I18n.t('opu.views.PING', this), "route": "Settings.Tools.Diagnostic.Ping" ,"isHide":(!window.OPM.userPermissions.toolsetPingToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.snmpping', this), "route": "Settings.Tools.Diagnostic.SnmpPing","isHide":(!window.OPM.userPermissions.toolsetPingToolsFull) },//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.proxyping', this), "route": "Settings.Tools.Diagnostic.ProxyPing" ,"isHide":(!window.OPM.userPermissions.toolsetPingToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('opmanagerclient.menu.framemenu.TraceRoute', this), "route": "Settings.Tools.Diagnostic.TraceRoute" ,"isHide":(!window.OPM.userPermissions.toolsetPingToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.wmiquerytool', this), "route": "Settings.Tools.Diagnostic.WmiQuery", "isHide": !(window.OPM.isWindows && (window.OPM.userPermissions.toolsetPingToolsFull)) },//No I18N
                // toolsTabs:
                { "displayName": Ember.I18n.t('webclient.tools.tab.diagnostictools', this), "route": "Settings.Tools.Diagnostic", "isHide": window.OPM.isCentralServer || (!window.OPM.userPermissions.toolsetPingToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.addressmonitoring', this), "route": "Settings.Tools.Address", "isHide": window.OPM.isCentralServer || (!window.OPM.userPermissions.toolsetAddressMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.networkmonitoring', this), "route": "Settings.Tools.Network", "isHide": window.OPM.isCentralServer || (!window.OPM.userPermissions.toolsetNetworkMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.ciscotools', this), "route": "Settings.Tools.Cisco", "isHide": window.OPM.isCentralServer },//No I18N
                { "displayName": Ember.I18n.t('opmanagerclient.menu.framemenu.MIBBrowser', this), "route": "Settings.Tools.MIBBrowser", "isHide": window.OPM.isCentralServer || !window.OPM.userPermissions.toolsetRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.traps.forward.title', this), "route": "Settings.Tools.ToolForward", "path": "ForwardTrap", "isPath": true ,"isHide":!window.OPM.userPermissions.toolsetRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.syslog.forward.title', this), "route": "Settings.Tools.ToolForward", "path": "ForwardSyslog", "isPath": true ,"isHide":(!(window.OPM.isNCM ? window.OPM.userPermissions.toolsetForwardSyslogFull : window.OPM.userPermissions.toolsetRead)) || window.OPM.hideSyslogViewerForwardOpm},//No I18N
                // addressToolsTabs:
                { "displayName": Ember.I18n.t('webclient.tools.tab.macaddressresolver', this), "route": "Settings.Tools.Address.MAC" ,"isHide":(!window.OPM.userPermissions.toolsetAddressMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.dnsresolver', this), "route": "Settings.Tools.Address.DNS" ,"isHide":(!window.OPM.userPermissions.toolsetAddressMonitoringFull)},//No I18N
                // networkToolsTabs:
                { "displayName": Ember.I18n.t('webclient.tools.tab.networkscanner', this), "route": "Settings.Tools.Network.NetworkScanner" ,"isHide":!window.OPM.userPermissions.toolsetWrite},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.portscanner', this), "route": "Settings.Tools.Network.PortScanner" ,"isHide":(!window.OPM.userPermissions.toolsetNetworkMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.systemexplorer', this), "route": "Settings.Tools.Network.SysExplorer" ,"isHide":(!window.OPM.userPermissions.toolsetNetworkMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.tcpreset', this), "route": "Settings.Tools.Network.TCPReset" ,"isHide":(!window.OPM.userPermissions.toolsetNetworkMonitoringFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.snmpwalker', this), "route": "Settings.Tools.SNMPTools.SNMPWalker" ,"isHide":(!window.OPM.userPermissions.toolsetSnmpToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.syslog.viewer', this), "route": "Settings.Tools.SyslogViewer" ,"isHide":(!window.OPM.userPermissions.toolsetSyslogViewerFull) || window.OPM.isFWAPlugAloneActive || window.OPM.hideSyslogViewerForwardOpm},//No I18N
                { "displayName": Ember.I18n.t('opu.snmp.TRAP_VIEWER', this), "route": "Settings.Tools.TrapViewer", "isHide":(!window.OPM.isOPM || window.OPM.isCentralServer) || !window.OPM.userPermissions.toolsetWrite},//No I18N
                // ciscoToolsTabs:
                { "displayName": Ember.I18n.t('webclient.tools.tab.devicescan', this), "route": "Settings.Tools.Cisco.DeviceScan" ,"isHide":(!window.OPM.userPermissions.toolsetCiscoToolsFull)},//No I18N
                { "displayName": Ember.I18n.t('webclient.tools.tab.devicesxplorer', this), "route": "Settings.Tools.Cisco.DeviceExplorer" ,"isHide":(!window.OPM.userPermissions.toolsetCiscoToolsFull)}//No I18N
            ],
            opm: [
                // Basic                
                { "displayName": Ember.I18n.t('webclient.DatabaseMaintenance'), "route": "Settings.Basic.Database" ,"isHide":!window.OPM.userPermissions.generalSettingsRead},//No I18N            
                // discoverySettingsTab:
                { "displayName": Ember.I18n.t('webclient.Settings.Discovery.ApmSettings.AddContainers'), "route": "Settings.Discovery.ApmSettings.Containers", "isPath": true, "path": "Kubernetes","isHide":(!window.OPM.apmInstalled || !window.OPM.isAPMAdmin || !window.OPM.showAPM)},//No I18N     
                { "displayName": Ember.I18n.t('webclient.settings.addvmware'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "vmware","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.addhyperv'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "hyperv", "isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.isWindows && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.vmware.addxenserver'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "xen","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition}, //No I18N
                { "displayName": Ember.I18n.t('webclient.settings.addnutanix'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "nutanix","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.device.proxmox.add'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "proxmox","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.snapshot.vxrail.add'), "route": "Settings.Discovery.Virtualization.Vendor", "isPath": true, "path": "vxRail","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.addmeraki'), "route": "Settings.Discovery.AddMeraki","id":"ADD_Meraki","isHide":!window.OPM.isOpmPlug || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.addWanlink'), "route": "Settings.Discovery.AddWanLink","id":"ADD_WANLink","isHide":!window.OPM.isOpmPlug || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite || !window.OPM.SHOW_WANIP_TAB},//No I18N
                { "displayName": Ember.I18n.t('webclient.devices.ucs.addUCS'), "route": "Settings.Discovery.AddDevice", "isPath": true, "path": "AddUCS","isHide":!(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryWrite) || window.OPM.isOPMLiteEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.discovery.layer2', this), "route": "Settings.Discovery.Layer2Discovery", "isPath": true, "path": "Layer2Discovery","isHide":!window.OPM.isOpmPlug || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite},//No I18N
                { "displayName": Ember.I18n.t('opm.discovery.interface'), "route": "Settings.Discovery.InterfaceDiscovery","isHide":!window.OPM.isOpmPlug || window.OPM.isNCM || window.OPM.isNFA || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite},//No I18N
                { "displayName": Ember.I18n.t('opmanagerclient.list.commonmenu.Notifications', this), "route": "Settings.Notification.Index","isHide": isNotMspAdmin() || !window.OPM.userPermissions.notificationProfileRead || !window.OPM.isOpmPlug || !window.OPM.isOPM},//No I18N
                { "displayName":Ember.I18n.t("webclient.notificationTemplates.title"),"route":"Settings.Notification.TemplateList","isHide":opm_hideNTemplateLink()}, //NO I18N
                // additionalFields:
                { "displayName": Ember.I18n.t('webclient.wf.category.device', this) + " " + Ember.I18n.t('webclient.devices.fields', this), "route": "Settings.Configurations.AdditionalFields.Device" },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.customfields.interface', this) + " " + Ember.I18n.t('webclient.devices.fields', this), "route": "Settings.Configurations.AdditionalFields.Interface" },//No I18N
                // monitorTabs:
                { "displayName": Ember.I18n.t('webclient.map.perfmonitor.subheading', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "performanceMonitors","isHide":window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead || !window.OPM.isOpmPlug},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.qcw.monitor.app', this), "route": "Settings.Monitors.Applications.App", "isPath": true, "path": "MSSQL", "isHide": (window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.settings.confign.monitor.profile.app.services', this), "route": "Settings.Monitors.ApplicationServices", "isPath": false, "isHide": (window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.ntservices.header', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "windowsServices", "isHide": (window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('widget.name.VmWareEvents', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "vmwareEvents", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.processes.header', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "processes", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.files.header', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "files", "isHide": (window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.folders.header', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "folders", "isHide": (window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.monitoring.agents', this), "route": "Settings.Agents.OPM", "isPath": false, "path": "", "isHide": (window.OPM.isCentralServer || !window.OPM.isOpmPlug || !(window.OPM.userPermissions.monitoringRead || window.OPM.userPermissions.discoveryRead)) },//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.createreport.servicemon', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "services", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead || !window.OPM.isOpmPlug},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.createreport.urls', this), "route": "Settings.Monitors.UrlMonitors", "isPath": true, "path": "monitor", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition  || !window.OPM.userPermissions.monitoringRead || !window.OPM.isOpmPlug || window.OPM.isURLMonitoringRestricted},//No I18N
		        { "displayName": Ember.I18n.t('webclient.opm.networkpath.header',this), "route": "Settings.Monitors.NetworkPathAnalysis.List", "isHide":(window.OPM.isOPMStandardEdition || window.OPM.isRMMEdition || !window.OPM.userPermissions.monitoringRead)},//No I18N
                { "displayName": Ember.I18n.t('webclient.EventLogRules', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "eventLogs", "isHide": (window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.traps.snmptraps', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "traps" ,"isHide":window.OPM.isOPMLiteEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.syslogrules.rules', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "sysLogs","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.monitoringRead && !window.OPM.isOPMLiteEdition && !window.OPM.userPermissions.devGrouporBVRestricted)},//No I18N
                { "displayName": Ember.I18n.t('webclient.script.templates', this), "route": "Settings.Monitors.SubMonitors", "isPath": true, "path": "scriptMonitors","isHide":window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead },//No I18N
                // configSettingsTab:
                { "displayName": Ember.I18n.t('webclient.admin.devicetype.newTempl.devTempl'), "route": "Settings.Configurations.DeviceTemplate","isHide":window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.configurationRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.intftemplate'), "route": "Settings.Configurations.InterfaceTemplate.Groups", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.deviceAndInterfaceGroupsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.url.urltemplate'), "route": "Settings.Monitors.UrlMonitors","isPath":true,"path":"template","isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead || !window.OPM.isOpmPlug || window.OPM.isURLMonitoringRestricted},//No I18N
                { "displayName": Ember.I18n.t('opm.devicedownschedule',this), "route": "Settings.Configurations.DowntimeSchedule.Index", "isHide": window.OPM.isCentralServer || !(window.OPM.userPermissions.downtimeScheduleRead || window.OPM.restrictedPermissions.devGrouporBVRestricted.downtimeScheduleRead || window.OPM.restrictedPermissions.probeScopeRestricted.downtimeScheduleRead)},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.device.downtime'), "route": "Settings.Configurations.DevAvailSettings", "isHide": !window.OPM.userPermissions.configurationWrite},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.StatusPoll.MonitoringIntervals'), "route": "Settings.Configurations.MonitoringIntervals", "isHide": window.OPM.isCentralServer },//No I18N
                { "displayName": Ember.I18n.t('webclient.AlarmEscalationRules'), "route": "Settings.Configurations.AlarmEscalation","isHide":!OPMClient.ApplicationController.viewAlarmEscalation},//No I18N
                { "displayName": Ember.I18n.t('webclient.audit.alarmsuppression'), "route": "Settings.Configurations.AlarmSuppression","isHide": !window.OPM.isAllModulesFullAccessAdmin || !window.OPM.isOPM},//No I18N
                { "displayName": Ember.I18n.t('webclient.faultsettings.eventtype.tab'), "route": "Settings.Configurations.EventTypeConfig", "isHide": !window.OPM.faultSettingsAccess},//No I18N
                { "displayName": Ember.I18n.t('webclient.ap.alarm.correlation.rules'), "route": "Settings.Configurations.AlarmRules.Custom","isHide":!OPMClient.ApplicationController.alarmProfileAllowed},//No I18N
                { "displayName": Ember.I18n.t('webclient.ap.default.alarms'), "route": "Settings.Configurations.AlarmRules.Default","isHide":!OPMClient.ApplicationController.alarmProfileAllowed},//No I18N
                { "displayName": Ember.I18n.t('webclient.commontext.customfields'), "route": "Settings.Configurations.AdditionalFields.Device","isHide":!window.OPM.userPermissions.configurationRead },//No I18N
                { "displayName": Ember.I18n.t('webclient.probe.details'), "route": "Settings.Configurations.Probes", "isHide": !window.OPM.isCentralServer || !window.OPM.userPermissions.configurationWrite },//No I18N
                { "displayName": Ember.I18n.t('opm.discruleengine',this), "route": "Settings.Discovery.RuleEngine", "isHide": window.OPM.isCentralServer || !window.OPM.isOPMAdminAllDevices },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.qcw.bstitle'), "route": "Settings.Configurations.QuickConfig", "isHide": window.OPM.isCentralServer || !window.OPM.showQCW},//No I18N
                { "displayName": Ember.I18n.t('webclient.IPSLA', this), "route": "Settings.Monitors.IPSLA.Settings", "isPath": true, "path": "VoipCallSettings", "isHide": window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.monitoringRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.logicalgrouping'), "route": "Settings.Configurations.ElementsGroup.Index", "isHide": (!window.OPM.userPermissions.deviceAndInterfaceGroupsRead || !window.OPM.isOPM)},//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.customers', this), "route": "Settings.Configurations.Customer.Index", "isHide": !(window.OPM.isMSPCentral && window.OPM.userPermissions.generalSettingsRead) },//No I18N
                { "displayName": Ember.I18n.t('webclient.common.deviceCategory', this), "route": "Settings.Configurations.Categories","isHide":!window.OPM.userPermissions.configurationRead},//No I18N
                //{ "displayName": Ember.I18n.t('webclient.opm.settings.confign.monitor.profile', this), "route": "Settings.Configurations.MonitorProfile", "isHide": !window.OPM.isOpmPlug || !window.OPM.userPermissions.configurationRead || window.OPM.isCentralServer || window.OPM.isProbe || window.OPM.isMSPCentral || window.OPM.isMSPProbe || window.OPM.isOPMLiteEdition},//No I18N
                // addOnTabs:
                { "displayName": Ember.I18n.t('webClient.tpi.dropmenu.title'), "route": "Settings.Basic.AddOnProduct.SDP" },//No I18N
                { "displayName": Ember.I18n.t('webclient.restapi.keymanage.pagetitle'), "route": "APIKeyManagement", "isHide": !OPMClient.ApplicationController.showRestApiKey},//No I18N
                { "displayName": Ember.I18n.t('webclient.home.servicedesk'), "route": "Settings.Basic.AddOnProduct.SDP" },//No I18N 
                { "displayName": Ember.I18n.t('webclient.apps.manager', this), "route": "Settings.Basic.AddOnProduct.ApplicationsManager","isHide":!(window.OPM.showAPM && window.OPM.isAuthorized)}//No I18N
            ],
            nfa: [
                // basicNFASettingsTab:
                { "displayName": Ember.I18n.t('webclient.basic.serversettings', this), "route": "Settings.Basic.NFAServer","isHide":(!window.OPM.userPermissions.generalSettingsRead || !window.OPM.isAuthorized)}, //No I18N
                { "displayName": Ember.I18n.t('webclient.common.centrallink', this) + ' ' + Ember.I18n.t('apiclient.tab.settings', this), "route": "Settings.Basic.NFACentral" }, //No I18N
                { "displayName": Ember.I18n.t('webclient.basic.serversettings', this), "route": "Settings.Basic.NFACentralServer" }, //No I18N
                { "displayName": Ember.I18n.t('webclient.api.admin.Probes', this), "route": "Settings.Basic.NFACollectors","isHide":!window.isserver }, //No I18N
                { "displayName": Ember.I18n.t('webclient.admin.failover.Details'), "route": "Settings.Basic.FosConfiguration", "isHide": (window.OPM.isKingbaseDB || window.isserver || !window.OPM.isNFA) }, //NO I18N
//                { "displayName": Ember.I18n.t('webclient.ncm.servr', this), "route": "Settings.NcmConfig.Basic.NCMServer" }, //No I18N
                //DiscoverySetingsTab:
                { "displayName": Ember.I18n.t('jsp.commonstr.ExportFlow', this), "route": "Settings.Discovery.ExportFlow","isHide":!window.OPM.isAdministrator}, //No I18N
                // NFALicenceNavTabs:
                { "displayName": Ember.I18n.t('webclient.mang.intfs', this), "route": "Settings.NetflowConfig.NFALicenceMgmt.Category", "isPath": true, "path": { "task": "0", "state": "1", "update": "0" } },//No I18N
                { "displayName": Ember.I18n.t('webclient.unmanag.intfs', this), "route": "Settings.NetflowConfig.NFALicenceMgmt.Category", "isPath": true, "path": { "task": "2", "state": "1", "update": "0" } },//No I18N
                { "displayName": Ember.I18n.t('webclient.new.intfs', this), "route": "Settings.NetflowConfig.NFALicenceMgmt.Category", "isPath": true, "path": { "task": "1", "state": "1", "update": "0" } },//No I18N
                // NFAGroupsTabs:
                { "displayName": Ember.I18n.t('webclient.network.devicegroups', this), "route": "Settings.NetflowConfig.Groups.Device" },//No I18N
                { "displayName": Ember.I18n.t('webclient.network.interfacegroups', this), "route": "Settings.NetflowConfig.Groups.Interface","isHide":window.isNFAStandardEdition },//No I18N
                { "displayName": Ember.I18n.t('webclient.common.dashboard.ipgroup', this), "route": "Settings.NetflowConfig.Groups.IP","isHide":window.isNFAStandardEdition },//No I18N
                { "displayName": Ember.I18n.t('webclient.app.grps', this), "route": "Settings.NetflowConfig.Groups.App" },//No I18N
                { "displayName": Ember.I18n.t('webclient.dscp.grps', this), "route": "Settings.NetflowConfig.Groups.DSCP" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.accessPointGrp', this), "route": "Settings.NetflowConfig.Groups.AccessPoint" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.ssidGrps', this), "route": "Settings.NetflowConfig.Groups.SSID" },//No I18N
                // NFAMapTabs:
                { "displayName": Ember.I18n.t('webclient.maps.bview.applicationlist', this), "route": "Settings.NetflowConfig.Map.AppList" },//No I18N
                { "displayName": Ember.I18n.t("nfa.apm.servicesList"), "route": "Settings.NetflowConfig.Map.Services" }, //NO I18N
                { "displayName": Ember.I18n.t('webclient.dscp.list', this), "route": "Settings.NetflowConfig.Map.DSCPList" },//No I18N
                // { "displayName": Ember.I18n.t('TopSites.top', this), "route": "Settings.NetflowConfig.Map.TopSites" },//No I18N
                // NFAQOSTabs:
                { "displayName": Ember.I18n.t('webclient.inventory.nfa.nbar', this), "route": "Settings.NetflowConfig.QOS.NBAR","isHide":window.isNFAStandardEdition },//No I18N
                { "displayName": Ember.I18n.t('webclient.inventory.nfa.cbqos', this), "route": "Settings.NetflowConfig.QOS.CBQOS","isHide":window.isNFAStandardEdition },//No I18N
                // netflowSettingsTabs:
                { "displayName": Ember.I18n.t('nfa.timezone.settings'), "route": "Settings.NetflowConfig.Basic.Timezone" },//No I18N
                { "displayName": Ember.I18n.t('webclient.storage.settings', this), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": (window.isNFAStandardEdition?"Aggregated":"Raw") },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.raw.data'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Raw","isHide":window.isNFAStandardEdition },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.agg.data'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Aggregated" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.hist.data'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Aggregated" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.one.minu'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Traffic" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.traffic.minu'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Traffic" },//No I18N
                { "displayName": Ember.I18n.t('webclinet.inventory.nfa.nbarcbqos'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "NBAR", 'isHide': (!window.iscbqosAddOnEnabled || window.isNFAStandardEdition) },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.autonomous'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "Autonomous" },//No I18N
                { "displayName": Ember.I18n.t('webclient.nfa.user.data'), "route": "Settings.NetflowConfig.NFAStorage.Category", "isPath": true, "path": "UserData" },//No I18N
                { "displayName": Ember.I18n.t('webclient.settings.mappings', this), "route": "Settings.NetflowConfig.Map.AppList" },//No I18N
                { "displayName": Ember.I18n.t('webclient.grp.settings', this), "route": "Settings.NetflowConfig.Groups.Device" },//No I18N

                { "displayName": Ember.I18n.t('webclinet.inventory.nfa.nbarcbqos', this), "route": "Settings.NetflowConfig.QOS.NBAR","isHide":window.isNFAStandardEdition },//No I18N
                { "displayName": Ember.I18n.t('webclient.lic.management', this), "route": "Settings.NetflowConfig.NFALicenceMgmt.Category", "isPath": true, "path": { "task": "0", "state": "1", "update": "0" }, "isHide": window.OPM.isOPMPLUS },//NO I18N
                
                { "displayName": Ember.I18n.t('nfa.flow.filters'), "route": "Settings.NetflowConfig.FlowFilter" },//No I18N
                { "displayName": Ember.I18n.t('webclient.ntwrk.mapping', this), "route": "Settings.NetflowConfig.NetworkMap", 'isHide': (!window.OPM.isNFA || !window.OPM.isNDP) },//No I18N
                { "displayName": Ember.I18n.t('highperf.engine.name', this), "route": "Settings.NetflowConfig.HighPerf", isHide: (!window.isHighPerfAddon || window.isNFAStandardEdition)},//No I18N

				//NFA Alert Profiles
				{ displayName:Ember.I18n.t("nfa.realTimeAlert.profiles"),		route:"Settings.NetflowConfig.AlertProfiles.RealTime",		isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.iscollector)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.aggregatedAlert.profiles"),		route:"Settings.NetflowConfig.AlertProfiles.Aggregated",	isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.iscollector)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.trafficPatternAlert.profiles"),	route:"Settings.NetflowConfig.AlertProfiles.TrafficPattern",isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.security.alert.profiles"),		route:"Settings.NetflowConfig.AlertProfiles.Security",		isHide:(window.isNFAGuest || window.isNFAStandardEdition || !window.isNBAAddOn)}, //NO I18N

				{ displayName:Ember.I18n.t("nfa.realTimeAlert.Add"),		route:"Settings.NetflowConfig.RealTimeAlert.Action",		isPath:true, path:{task:"Add",alertID:"New"}, isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.iscollector)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.aggregatedAlert.Add"),		route:"Settings.NetflowConfig.AggregatedAlert.Action",		isPath:true, path:{task:"Add",alertID:"New"}, isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.iscollector)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.trafficPatternAlert.add"),	route:"Settings.NetflowConfig.TrafficPatternAlert.Action",	isPath:true, path:{task:"Add",alertID:"New"}, isHide:(window.isNFAGuest || (window.isserver && !isAllCollSelected) || window.iscollector || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("nfa.security.alert.add"),		route:"Settings.NetflowConfig.SecurityAlert.Action",		isPath:true, path:{task:"Add",alertID:"New"}, isHide:(window.isNFAGuest || window.isNFAStandardEdition || !window.isNBAAddOn)}, //NO I18N

				//NFA Notification Template
				{ displayName:Ember.I18n.t("webclient.notificationTemplates.title"), route:"Settings.NetflowConfig.NotificationTemplateList", isHide:(window.OPM.isOPM || (!window.isoperator && (!window.OPM.userPermissions.notificationProfileWrite || window.isNFAGuest || isAllCollSelected)))}, //NO I18N

				//NBA-ASAM-Security-Tabs
				{ displayName:Ember.I18n.t("nfa.settings.security.title"),		route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Interface",	isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("webclient.action.interface.manage"),route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Interface",	isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("webclient.manage.pblm"),			route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Problem",		isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("webclient.manage.alg"),				route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Algorithm",	isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("webclient.manage.resc"),			route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Resource",	isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)}, //NO I18N
				{ displayName:Ember.I18n.t("webclient.action.threshold"),		route:"Settings.NetflowConfig.SecurityAnalytics.Page", isPath:true, path:"Threshold",	isHide:(!window.OPM.userPermissions.attacksRead || !window.isNBAAddOn || isAllCollSelected || window.isNFAStandardEdition)} //NO I18N
            ],
            ncm: [
                // basicNCMSettingsTab:
                { "displayName": Ember.I18n.t('webclient.basic.serversettings', this), "route": "Settings.Basic.NFAServer","isHide":!window.OPM.userPermissions.generalSettingsRead}, //No I18N
                { "displayName": Ember.I18n.t('webclient.ncm.servr', this), "route": "Settings.NcmConfig.NCMServer","isHide": !window.OPM.userPermissions.generalSettingsRead }, //No I18N
                //{"displayName":Ember.I18n.t('webclient.settings.basicsettings.scheduleupgrade.title'),"route":"Settings.Basic.Schedule"},//No I18N
                // ncmDiscoverySettingsTab:
                //{ "displayName": Ember.I18n.t('webclient.topo.details.tabs.discovery', this) + " " + Ember.I18n.t('webclient.reports.header', this), "route": "Settings.Discovery.DiscoveryProfiles" },//No I18N
                { "displayName": "", "route": "" },//No I18N
                // NCMDeviceMgmtTabs:
                { "displayName": Ember.I18n.t('webclient.all.schdls', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
                { "displayName": Ember.I18n.t('webclient.schedule.audit', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.ScheduleAudit" :  "Settings.NcmConfig.Schedules.ScheduleAudit" },//No I18N
                { "displayName": Ember.I18n.t('opmanagerclient.list.commonmenu.Notifications', this), "route": "Settings.NcmConfig.Notification", "isHide": !OPMClient.ApplicationController.isOPM || window.OPM.isOPMPLUS || window.OPM.isOPMPlusProbe},//No I18N
                { "displayName": Ember.I18n.t('webclient.shw.cmds', this), "route": "Settings.NcmConfig.DeviceMgmt.ShowCommands" },//No I18N
                { "displayName": Ember.I18n.t('webclient.label.management', this), "route": "Settings.NcmConfig.DeviceMgmt.LabelManagement" },//No I18N
                { "displayName": Ember.I18n.t('webclient.cstm.colmn', this), "route": "Settings.NcmConfig.DeviceMgmt.CustomColumn" },//No I18N
                //{"displayName":Ember.I18n.t('webclient.db.history',this),"route":"Settings.NcmConfig.DeviceMgmt.DBBackupHistory"}//No I18N
                // NCMBasicTabs:
                { "displayName": Ember.I18n.t('webclient.SNMP.Trap', this), "route": "Settings.NcmConfig.Basic.SNMPTrap" },//No I18N
                { "displayName": Ember.I18n.t('webclient.reg.syslog.server', this), "route": "Settings.NcmConfig.Basic.SyslogServer" },//No I18N
                { "displayName": Ember.I18n.t('webclient.trbl.settings', this), "route": "Settings.NcmConfig.Basic.TroubleTicket" },//No I18N
                { "displayName": Ember.I18n.t('webclient.db.adminstration', this), "route": "Settings.NcmConfig.Basic.DBAdmin" },//No I18N
                { "displayName": Ember.I18n.t('webclient.export.config', this), "route": "Settings.NcmConfig.Basic.ExportConfig", "isHide":(!window.OPM.userPermissions.adminAccess || window.OPM.userPermissions.ncmRestricted) },//No I18N
                { "displayName": Ember.I18n.t('webclient.export.history', this), "route": "Settings.NcmConfig.Basic.ExportConfigHistory", "isHide":(!window.OPM.userPermissions.adminAccess || window.OPM.userPermissions.ncmRestricted)},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.failover.Details'), "route": "Settings.Basic.FosConfiguration", "isHide": (window.OPM.isKingbaseDB || window.OPM.isNFA || window.OPM.isFWA)}, //No I18N
                // NCMAdminTabs:
                { "displayName": Ember.I18n.t('webclient.ncm.credentialRules', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.CredentialRule.AllRules" : "Settings.NcmConfig.CredentialRule.AllRules" },//No I18N
                { "displayName": Ember.I18n.t('webclient.cred.profile', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.CredentialRule.Credentials" : "Settings.NcmConfig.Credentials" },//No I18N
                { "displayName": Ember.I18n.t('webclient.all.cnfglts', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.CustomTemplate" : "Settings.NcmConfig.Admin.CustomTemplate" },//No I18N
                { "displayName": Ember.I18n.t('webclient.exec.hstry', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.ConfigletHistory" : "Settings.NcmConfig.Admin.ConfigletHistory" },//No I18N
                { "displayName": Ember.I18n.t('webclient.rest.configlets', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.RESTConfiglet" : "Settings.NcmConfig.Admin.RESTConfiglet" },//No I18N
                { "displayName": Ember.I18n.t('webclient.ncm.rest.configlets.history', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.RESTHistory" : "Settings.NcmConfig.Admin.RESTHistory" },//No I18N
                // NCMPowerDeviceMgmtTabs:
                { "displayName": Ember.I18n.t('webclient.all.schdls', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
                { "displayName": Ember.I18n.t('webclient.schedule.audit', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.ScheduleAudit" : "Settings.NcmConfig.Schedules.ScheduleAudit" },//No I18N
                { "displayName": Ember.I18n.t('webclient.shw.cmds', this), "route": "Settings.NcmConfig.DeviceMgmt.ShowCommands" },//No I18N
                { "displayName": Ember.I18n.t('webclient.label.management', this), "route": "Settings.NcmConfig.DeviceMgmt.LabelManagement" },//No I18N
                { "displayName": Ember.I18n.t('webclient.cstm.colmn', this), "route": "Settings.NcmConfig.DeviceMgmt.CustomColumn" },//No I18N
                //{"displayName":Ember.I18n.t('webclient.db.history',this),"route":"Settings.NcmConfig.DeviceMgmt.DBBackupHistory"}//No I18N
                // NCMOperDeviceMgmtTabs:
                { "displayName": Ember.I18n.t('webclient.all.schdls', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
                { "displayName": Ember.I18n.t('webclient.schedule.audit', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.ScheduleAudit" : "Settings.NcmConfig.Schedules.ScheduleAudit" },//No I18N
                // { "displayName": Ember.I18n.t('opmanagerclient.list.commonmenu.Notifications', this), "route": "Settings.NcmConfig.DeviceMgmt.Notification" },//No I18N
                //{"displayName":Ember.I18n.t('webclient.shw.cmds',this),"route":"Settings.NcmConfig.DeviceMgmt.ShowCommands"},//No I18N
                //{"displayName":Ember.I18n.t('webclient.label.management',this),"route":"Settings.NcmConfig.DeviceMgmt.LabelManagement"}//No I18N
                // NCMComplianceTabs:
//                { "displayName": Ember.I18n.t('widget.name.compPolicy', this), "route": "Settings.NcmConfig.Compliance.Policy", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
//                { "displayName": Ember.I18n.t('webclient.admin.alarmesc.ruleTitle', this), "route": "Settings.NcmConfig.Compliance.Rule", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
//                { "displayName": Ember.I18n.t('webclient.rule.grp', this), "route": "Settings.NcmConfig.Compliance.RuleGroup", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
                // NCMPCITabs:
                { "displayName": Ember.I18n.t('webclient.pci.schedules', this), "route": "Settings.NcmConfig.PCI.PCISchedules" },//No I18N
                { "displayName": Ember.I18n.t('webclient.all.rivewres', this), "route": "Settings.NcmConfig.PCI.Reviewers" },//No I18N
                { "displayName": Ember.I18n.t('webclient.all.reviews', this), "route": "Settings.NcmConfig.PCI.AllReviews" },//No I18N
                { "displayName": Ember.I18n.t('jsp.common.MyReviews', this), "route": "Settings.NcmConfig.PCI.MyReviews" },//No I18N
                // NCMRequestsTabs:
                { "displayName": Ember.I18n.t('webclient.pending.reqsts', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Pending" : "Settings.NcmConfig.UploadRequests.Pending", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('webclient.apprvd.requests', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Executable" : "Settings.NcmConfig.UploadRequests.Executable", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('webclient.apprvd.requests', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Approved" : "Settings.NcmConfig.UploadRequests.Approved", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('webclient.rejected.reqsts', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Rejected" : "Settings.NcmConfig.UploadRequests.Rejected", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('jsp.report.ReportConstruction.DeletedRequest', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Deleted" : "Settings.NcmConfig.UploadRequests.Deleted", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                // ncmSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.tab.settings.basic', this), "route": "Settings.NcmConfig.Basic.SNMPTrap" },//No I18N
                { "displayName": Ember.I18n.t('webclient.device.mgmt', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
//                { "displayName": Ember.I18n.t('dashboard.name.compliance', this), "route": "Settings.NcmConfig.Compliance.Policy", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
                { "displayName": 'PCI', "route": "Settings.NcmConfig.PCI.PCISchedules" },//No I18N
                { "displayName": Ember.I18n.t('jsp.commonstr.Configlets', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.CustomTemplate" : "Settings.NcmConfig.Admin.CustomTemplate" },//No I18N
                { "displayName": Ember.I18n.t('webclient.ncm.uploadRequests', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Pending" : "Settings.NcmConfig.UploadRequests.Pending", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('webclient.ExcludeCriteria', this), "route": "Settings.NcmConfig.ExcludeCriteria" },//No I18N
                { "displayName": Ember.I18n.t('webclient.DeviceTemplate', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.DeviceTemplates.All" : "Settings.NcmConfig.DeviceTemplates" },//No I18N
                { "displayName": Ember.I18n.t('webclient.PasswordSync', this), "route": "Settings.NcmConfig.PMP", "isHide": !window.OPM.userPermissions.tpiSettingsRead },//No I18N
                { "displayName": Ember.I18n.t('jsp.tools.sysoid.GetSysObjectID.SysObjectID', this), "route": "Settings.NcmConfig.SysObjectId" },//No I18N
                { "displayName": Ember.I18n.t('jsp.tools.sysoid.GetSysObjectID.SysObjFinder', this), "route": "Settings.NcmConfig.SysObjectIdFinder" },//No I18N
                { "displayName": Ember.I18n.t('webclient.systemdetails.desc', this), "route": "Settings.NcmConfig.SysLocationDesc" },//No I18N
                // ncmOperSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.device.mgmt', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
//                { "displayName": Ember.I18n.t('dashboard.name.compliance', this), "route": "Settings.NcmConfig.Compliance.Policy", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
                { "displayName": Ember.I18n.t('webclient.ncm.uploadRequests', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Pending" : "Settings.NcmConfig.UploadRequests.Pending", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('jsp.commonstr.Configlets', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.CustomTemplate" : "Settings.NcmConfig.Admin.CustomTemplate" },//No I18N
                { "displayName": Ember.I18n.t('webclient.SysObjectIDs', this), "route": "Settings.NcmConfig.SysObjectId" },//No I18N
                // ncmPowerSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.device.mgmt', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Schedules.AllSchedules" : "Settings.NcmConfig.Schedules.AllSchedules" },//No I18N
//                { "displayName": Ember.I18n.t('dashboard.name.compliance', this), "route": "Settings.NcmConfig.Compliance.Policy", "isHide": !OPMClient.ApplicationController.isOPM },//No I18N
                { "displayName": 'PCI', "route": "Settings.NcmConfig.PCI.PCISchedules" },//No I18N
                { "displayName": Ember.I18n.t('jsp.commonstr.Configlets', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.Configlets.CustomTemplate" : "Settings.NcmConfig.Admin.CustomTemplate" },//No I18N
                { "displayName": Ember.I18n.t('webclient.ncm.uploadRequests', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.UploadRequests.Pending" : "Settings.NcmConfig.UploadRequests.Pending", "isHide": !OPMClient.ApplicationController.isOPM  },//No I18N
                { "displayName": Ember.I18n.t('webclient.DeviceTemplate', this), "route": (window.OPM.isNCM && window.OPM.oldView) ? "NCMConfigAutomation.DeviceTemplates.All" : "Settings.NcmConfig.DeviceTemplates" },//No I18N
                { "displayName": Ember.I18n.t('webclient.restapi.keymanage.pagetitle'), "route": "APIKeyManagement", "isHide": !OPMClient.ApplicationController.showRestApiKey }//No I18N
            ],
            oputils: [
                // basicOpUtilsSettingsTab:
//                { "displayName": Ember.I18n.t('webclient.ncm.servr', this), "route": "Settings.NcmConfig.Basic.NCMServer", "isHide": window.OPM.isCentralServer }, //No I18N
                { "displayName": Ember.I18n.t('webclient.admim.setting'), "route": "Settings.Basic.System" },//No I18N
                //{ "displayName": Ember.I18n.t('dbmaintanence.ui.header'), "route": "Settings.Basic.DataMigration.OtherTools" },//No I18N
                // {"displayName":Ember.I18n.t('webclient.basic.serversettings',this),"route":"Settings.Basic.NFAServer","isHide":window.OPM.isCentralServer}, //No I18N
                //{"displayName":Ember.I18n.t('webclient.settings.basicsettings.scheduleupgrade.title'),"route":"Settings.Basic.Schedule"},//No I18N
                // opUtilsSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.mactomac.mapp', this), "route": "Settings.OpUtils.Discovery.Router" },//No I18N
                { "displayName": Ember.I18n.t("webclient.reports.createreport.ad", this), "route": "Settings.OpUtils.Discovery.AD", "isHide": !(window.OPM.isWindows && window.OPM.userPermissions.ipamWrite) },//No I18N
                { "displayName": 'SPM', "route": "Settings.OpUtils.SPM.General" ,"isHide":!(window.OPM.userPermissions.opuSettingsWrite && window.OPM.userPermissions.spmWrite)},//No I18N
                { "displayName": 'IPAM', "route": "Settings.OpUtils.IPAM.General" ,"isHide":!(window.OPM.userPermissions.opuSettingsWrite && window.OPM.userPermissions.ipamWrite)},//No I18N
                { "displayName": Ember.I18n.t('opu.tools.ROGUE', this), "route": "Settings.OpUtils.Rogue" ,"isHide":!(window.OPM.userPermissions.opuSettingsWrite && window.OPM.userPermissions.rougueDetectionWrite)},//No I18N
                { "displayName": Ember.I18n.t('webclient.action.ping', this), "route": "Settings.OpUtils.Ping.AlertRule" ,"isHide":!(window.OPM.userPermissions.opuSettingsWrite && window.OPM.userPermissions.networkToolsWrite)},//No I18N
                { "displayName": 'Syslog', "route": "Settings.OpUtils.Syslog" },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.failover.Details'), "route": "Settings.Basic.FosConfiguration", "isHide": (window.OPM.isKingbaseDB || !window.OPM.isOPUtils) }, //No I18N
                { "displayName": Ember.I18n.t('webclient.restapi.keymanage.pagetitle'), "route": "APIKeyManagement", "isHide": !OPMClient.ApplicationController.showRestApiKey }//No I18N
            ],                         	
            fwa: [
                // FWNavTabs:
                {"displayName":Ember.I18n.t('jsp.admin.ServerSettings.Ss',this),"route":"Settings.FirewallConfig.FWA.SysLog","isHide":!OPMClient.ApplicationController.isAdmin || !window.OPM.userPermissions.fwaSettingsRead},//No I18N
                {"displayName":Ember.I18n.t('webclient.topo.bulkedit.changecredential',this),"route":"Settings.FirewallConfig.FWA.DeviceRule","isHide":(!(window.OPM.userPermissions.ruleManagementRead || window.OPM.userPermissions.fwaComplianceRead) || !window.OPM.showFWACompliance)},//No I18N
                {"displayName":Ember.I18n.t('webclient.ExcludeCriteria',this),"route":"Settings.FirewallConfig.FWA.ExcludeCritList","isHide":(!window.OPM.showFWACompliance || !window.OPM.userPermissions.fwaSettingsWrite)},//No I18N
                {"displayName":Ember.I18n.t('webclient.cred.profile',this),"route":"Settings.FirewallConfig.FWA.ListProfile","isHide":(!(window.OPM.userPermissions.ruleManagementRead || window.OPM.userPermissions.fwaComplianceRead) || !window.OPM.showFWACompliance)},//No I18N
                {"displayName":Ember.I18n.t('webclient.avail.alert',this),"route":"Settings.FirewallConfig.FWA.Alert", "isPath":true, "path":{"action":"Show","proid":"All"},"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                {"displayName":Ember.I18n.t('webclient.dev.details',this),"route":"Settings.FirewallConfig.FWA.DeviceDetail","isHide":!OPMClient.ApplicationController.isAdmin || !window.OPM.userPermissions.fwaSettingsRead},//No I18N 
                // FWSystemNavTabs:
                { "displayName": Ember.I18n.t('webclient.import.logfiles', this), "route": "Settings.FirewallConfig.System.ImportedLog" ,"isHide":!window.OPM.isAdministrator},//No I18N
                { "displayName": Ember.I18n.t('webclient.prot.grps', this), "route": "Settings.FirewallConfig.System.ProtocolGroup" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.arch.files', this), "route": "Settings.FirewallConfig.System.ArchivedFile" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.cstmz.report', this), "route": "Settings.FirewallConfig.System.CustReports" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.action.switchport.dns', this), "route": "Settings.FirewallConfig.System.FWADNS" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.Working.Hours', this), "route": "Settings.FirewallConfig.System.WorkHrs" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                { "displayName": Ember.I18n.t('jsp.commonstr.DeviceGroup', this), "route": "Settings.FirewallConfig.System.DeviceGrp" ,"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
                // FWAdminNavTabs:
                { "displayName": Ember.I18n.t('webclient.intranet', this), "route": "Settings.FirewallConfig.Admin.Intranet", 'isHide': !OPMClient.ApplicationController.isAdmin },//No I18N
                { "displayName": Ember.I18n.t('webclient.data.storage', this), "route": "Settings.FirewallConfig.Admin.DataStorage", 'isHide': !OPMClient.ApplicationController.isAdmin },//No I18N
                { "displayName": Ember.I18n.t('webclient.lic.management', this), "route": "Settings.FirewallConfig.Admin.LicenseMgmt", 'isHide': ((!OPMClient.ApplicationController.isAdmin) || (OPMClient.ApplicationController.isFWADE && OPMClient.ApplicationController.isFWACollector) || (window.OPM.isOPMPLUS))},//No I18N
                { "displayName": Ember.I18n.t('webclient.enduser.cloud.services', this), "route": "Settings.FirewallConfig.Admin.FWARepository", 'isHide': !OPMClient.ApplicationController.isAdmin },//No I18N
                { "displayName": Ember.I18n.t('webclient.fwa.excludehost', this), "route": "Settings.FirewallConfig.Admin.ExcludeHost", 'isHide': !OPMClient.ApplicationController.isAdmin },//No I18N
                //FWSecurityNavTabs:
                { "displayName": Ember.I18n.t('webclient.fwa.archive.encryption',this), "route": "Settings.FirewallConfig.Security.ArchieveEncription", 'isHide': !OPMClient.ApplicationController.isAdmin },//No I18N
                // firewallSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.fwal.server', this), "route": "Settings.FirewallConfig.FWA.SysLog" , 'isHide': !window.OPM.userPermissions.fwaSettingsRead },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.systm', this), "route": "Settings.FirewallConfig.System.ImportedLog" , 'isHide': !window.OPM.isAdministrator},//No I18N
                { "displayName": Ember.I18n.t('webclient.appmanager.admin', this), "route": "Settings.FirewallConfig.Admin.Intranet" , 'isHide':  !OPMClient.ApplicationController.isAdmin },//No I18N
                { "displayName": Ember.I18n.t('webclient.fwa.snmp.settings', this), "route": "Settings.FirewallConfig.FWASNMP" , 'isHide': !window.OPM.userPermissions.fwaSettingsRead },//No I18N
                { "displayName": Ember.I18n.t('webclient.alarm.profiles', this), "route": "Settings.FirewallConfig.FWAlertProfile", 'isHide': !window.OPM.userPermissions.alarmsRead  },//No I18N
                { "displayName": Ember.I18n.t("webclient.notificationTemplates.title"),"route":"Settings.FirewallConfig.NotificationTemplateList","isHide":window.OPM.isOPM || (!window.isoperator && !window.OPM.userPermissions.notificationProfileWrite)}, //NO I18N
                { "displayName": Ember.I18n.t('webclient.Report.Filter', this), "route": "Reports.FWAReports.MyReports.RepFilter" , 'isHide': !window.OPM.userPermissions.reportsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.Report.Type', this), "route": "Reports.FWAReports.MyReports.RepType" , 'isHide': !window.OPM.userPermissions.reportsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.user.name.mapp', this), "route": "Settings.FirewallConfig.Iphost.Category", "isPath": true, "path": { "task": "0", "state": "1", "update": "0" }, 'isHide': !OPMClient.ApplicationController.isAdministrator || window.OPM.isFWAServer},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.createreport.ad', this), "route": "Settings.FirewallConfig.Iphost.Category", "isPath": true, "path": { "task": "2", "state": "1", "update": "0" }, 'isHide': !(OPMClient.ApplicationController.isAdministrator && window.OPM.isWindows) || window.OPM.isFWAServer},//No I18N
                { "displayName": Ember.I18n.t('webclient.proxy', this), "route": "Settings.FirewallConfig.Iphost.Category", "isPath": true, "path": { "task": "1", "state": "1", "update": "0" }, 'isHide': !OPMClient.ApplicationController.isAdministrator  || window.OPM.isFWAServer},//No I18N
                { "displayName": Ember.I18n.t('webclient.manualmapping', this), "route": "Settings.FirewallConfig.Iphost.Category", "isPath": true, "path": { "task": "3", "state": "1", "update": "0" }, 'isHide': !OPMClient.ApplicationController.isAdministrator  || window.OPM.isFWAServer},//No I18N
                // FWAddDeviceNavTabs
        	    { "displayName":Ember.I18n.t('webclient.simulated.firewall',this),"route":"Settings.Discovery.FWAAddDevice.FwaSimulate", 'isHide': !window.OPM.userPermissions.discoveryRead}//No I18N
                
            ], 
            fwaAdmin: [
                   //FWADEAdminCollectorSettNavTabs:
                  {"displayName":Ember.I18n.t('webclient.fwa.collector.settings',this),"route":"Settings.FirewallConfig.Collector.CollSett","isHide":!window.OPM.isAdministrator || !window.OPM.userPermissions.fwaSettingsRead},//No I18N
 				  {"displayName":Ember.I18n.t('webclient.fwa.collector.avail.alert',this),"route":"Settings.FirewallConfig.Collector.CollAvailAlert","isPath":true, "path":{"action":"Show","proid":"All"},"isHide":!window.OPM.userPermissions.fwaSettingsRead},//No I18N
 				  {"displayName":Ember.I18n.t('webclient.lic.management',this),"route":"Settings.FirewallConfig.Collector.LicenceMgmt","isHide":!(window.OPM.isAdministrator)  },//No I18N 
 				  // FWSystemNavTabs:
//                  { "displayName": Ember.I18n.t('webclient.arch.files', this), "route": "Settings.FirewallConfig.System.ArchivedFile"  , "isHide": ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist))},//No I18N
//                  { "displayName": Ember.I18n.t('jsp.commonstr.DeviceGroup', this), "route": "Settings.FirewallConfig.System.DeviceGrp"  , "isHide": ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist))},//No I18N
                  // FWAdminNavTabs:
                  { "displayName": Ember.I18n.t('webclient.intranet', this), "route": "Settings.FirewallConfig.Admin.Intranet", 'isHide': (!OPMClient.ApplicationController.isAdmin || ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist))) },//No I18N
                  { "displayName": Ember.I18n.t('webclient.fwa.excludehost', this), "route": "Settings.FirewallConfig.Admin.ExcludeHost", 'isHide': (!OPMClient.ApplicationController.isAdmin || ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist))) },//No I18N
                  // firewallSettingsTabs:
//                  { "displayName": Ember.I18n.t('webclient.lic.management', this), "route": "Settings.FirewallConfig.Admin.LicenseMgmt", 'isHide': (!OPMClient.ApplicationController.isAdmin || ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist)) || (window.OPM.isOPMPLUS)) },//No I18N
                  { "displayName": Ember.I18n.t('webclient.alarm.profiles', this), "route": "Settings.FirewallConfig.FWAlertProfile", "isHide": ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist)) || !window.OPM.userPermissions.alarmsRead}//No I18N
              ],
            apm: [
            ]
        },
        reports: {
            opm: [
                {"displayName":Ember.I18n.t('webclient.reports.nutanixreport',this), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "NutanixReport" ,"isHide": !window.OPM.userPermissions.reportsRead || OPMClient.ApplicationController.isOPMEEUnifiedConsoleView },//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.createnewreport'),"isPath": true, "path": "AddReport", "route": "Reports.Opmanager.AddReport", 'isHide':!window.OPM.userPermissions.adminAccess || window.OPM.userPermissions.devGrouporBVRestricted},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.systm'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "System" },//No I18N
                { "displayName": Ember.I18n.t('widget.typename.health'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "HealthPerf","isHide":OPMClient.ApplicationController.isOPMEELiteMode},//No I18N
                { "displayName": Ember.I18n.t('widget.typename.avail'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "AvailResponse","isHide":OPMClient.ApplicationController.isOPMEELiteMode},//No I18N
                { "displayName": Ember.I18n.t('webclient.customtab.inventory'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "Inventory" },//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.wanrtt'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "WANRTT","isHide":OPMClient.ApplicationController.isOPMEELiteMode},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.voip'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "VoIP","isHide":OPMClient.ApplicationController.isOPMEELiteMode},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.virtualreport'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "VirtualReport", 'isHide': window.OPM.isOPMStandardEdition || !window.OPM.userPermissions.reportsRead || OPMClient.ApplicationController.isOPMEEUnifiedConsoleView},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.forecastreports'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "ForecastReports", 'isHide': window.OPM.isOPMStandardEdition || !window.OPM.userPermissions.reportsRead || OPMClient.ApplicationController.isOPMEEUnifiedConsoleView},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.cpreports'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "CPReports",'isHide':OPMClient.ApplicationController.isOPMEELiteMode },//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.myfav'), "route": "Reports.Opmanager.Defreport", "isPath": true, "path": "MyFav" },//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.name.dcerrfornctlogs'), "route": "Reports.Opmanager.ServerHealthReport", "isHide":OPMClient.ApplicationController.isOPMEELiteMode},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.reports.advanced.reports'), "route": "Reports.Opmanager.Advanced", 'isHide':!window.OPM.userPermissions.adminAccess || window.OPM.userPermissions.devGrouporBVRestricted || window.OPM.userPermissions.intfGroupRestricted},//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.schedulereports.schreports'), "route": "Reports.Opmanager.ScheduleReports", 'isHide': !OPMClient.ApplicationController.isAdmin || window.OPM.userPermissions.intfGroupRestricted || window.OPM.userPermissions.devGrouporBVRestricted},//No I18N
                { "displayName": Ember.I18n.t('webclient.opm.rca.text',this)+"( RCA )","route":"Alarms.Alarm.RCA.List","isHide":!window.OPM.isOpmPlug || window.OPM.isFreeEdition || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition || !window.OPM.isAdministrator || window.OPM.userPermissions.intfGroupRestricted || window.OPM.probeRestrictedAllProbeSelected},//No I18N
                { "displayName": Ember.I18n.t('webclient.reports.Mail.Audit'), "route": "Reports.AuditLogs.MailServerAudit",'isHide': getHideMailServerAuditReport()}//No I18N

            ],
            nfa: OPMClient.MenuController.nfaReportsMenuLinks,
            ncm: OPMClient.MenuController.ncmReportsMenuLinks,
            oputils: [
                { "route": "Reports.IPAM.UnUsedIPsViewBySubnet", "displayName": Ember.I18n.t('opu.ipam.UNUSED_IP_ADDRESSES'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.ipamRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.IPAM.ReservedStaticIPBySubnet", "displayName": Ember.I18n.t('opu.ipam.RESERVED_STATIC_IP_ADDRESSES'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.ipamRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.IPAM.IPUsageSummay", "displayName": Ember.I18n.t('opu.ipam.IP_USAGE_SUMMARY'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.ipamRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.SwitchesByUsage", "displayName": Ember.I18n.t('opu.views.reports.switches_by_usage'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.SwitchesByScheduler", "displayName": Ember.I18n.t('opu.views.reports.switches_by_scheduler'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.SwitchesByVendor", "displayName": Ember.I18n.t('opu.views.reports.SWITCHES_By_Vendor'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.SwitchPortsByIfSpeed", "displayName": Ember.I18n.t('opu.views.reports.SWITCHES_BY_IFSPEED'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.SwitchReportByIfType", "displayName": Ember.I18n.t('opu.views.reports.SWITCHES_BY_IFTYPE'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.VirtualIPDevices", "displayName": Ember.I18n.t('opu.views.reports.VIRTUAL_IP_DEVICES'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.StackedPorts", "displayName": Ember.I18n.t('opu.views.reports.STACKED_PORT_DETAILS'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) ||((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.AdministrativelyDisablePorts", "displayName": Ember.I18n.t('opu.spm.ADMINISTRATIVELY_DISABLED_PORTS'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.PortsByOperationStatus", "displayName": Ember.I18n.t('opu.views.reports.PORT_OPSTATUS_BY_LCT'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils},//No I18N
                { "route": "Reports.SPM.ConnectedIPDetails", "displayName": Ember.I18n.t('opu.spm.ConnectedIPDetails'), "isPath": false, "path": "" ,'isHide': (!window.OPM.userPermissions.spmRead) || ((!window.OPM.isAuthorized && window.OPM.isCustomer) || !OPMClient.ApplicationController.isOPUPlug) && !window.OPM.isOPUtils}//No I18N
            ],
            fwa: [
                { "displayName": Ember.I18n.t('webclient.reports.cusRepheader'), "route": "Reports.FWAReports.MyReports.Profiles" , "isHide": ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist || OPMClient.FWADistributedController.selCollDown)) || !window.OPM.userPermissions.reportsRead},//No I18N
                { "displayName": Ember.I18n.t('webclient.searchreport'), "route": "Reports.FWAReports.FWASearch.AggSearch"  , "isHide": ((window.OPM.isFWADE && window.OPM.isFWAServer) && (!OPMClient.FWADistributedController.isCollectorsExist || OPMClient.FWADistributedController.selCollDown))|| !window.OPM.userPermissions.reportsRead}//No I18N
            ],
            apm: [

            ]
        },
        others: {
            support: [
                { "displayName": Ember.I18n.t('webclient.support.tab.supportinforFile', this), "route": "SIF" ,"isHide":!window.OPM.isAllCoreModulesFullAccessAdmin || isNotMspAdmin()},//No I18N
                { "displayName": Ember.I18n.t('webclient.support.thread.threaddump', this), "route": "ThreadDump" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.submitquery', this), "route": "SubmitQuery" ,"isHide":!window.OPM.isAllModulesFullAccessAdmin || isNotMspAdmin() || !window.OPM.showDBQuery},//No I18N
                { "displayName": Ember.I18n.t('webclient.workflow.viewlogs', this), "route": "ViewLogs", "isHide":!window.OPM.isAllCoreModulesFullAccessAdmin || isNotMspAdmin()}//No I18N
            ],
            about: [
                { "displayName": Ember.I18n.t('webclient.home.about', this), "route": "aboutdetails" },//No I18N
                { "displayName": Ember.I18n.t('apiclient.product.details', this), "route": "productdetails" },//No I18N
                { "displayName": Ember.I18n.t('apiclient.about.addons.details', this), "route": "addondetails" },//No I18N
                { "displayName": Ember.I18n.t('webclient.about.Licensedtype', this), "route": "LicenseTypeString" },//No I18N
                { "displayName": Ember.I18n.t('webclient.abount.licenseto.userlable', this), "route": "UserName" },//No I18N
                { "displayName": Ember.I18n.t('webclient.about.CompanyName', this), "route": "CompanyName" },//No I18N
                { "displayName": Ember.I18n.t('webclient.about.BuildNumber', this), "route": "BUILD_NUMBER" },//No I18N
                { "displayName": Ember.I18n.t('webclient.about.expireson', this), "route": "EvaluationExpiryDate" },//No I18N
                { "displayName": Ember.I18n.t('webclient.about.edition', this), "route": "Edition" },//No I18N
                { "displayName": Ember.I18n.t('webclient.admin.rebrand.ProductName', this), "route": "ProductName" }//No I18N

            ],
            installation: [
                { "displayName": Ember.I18n.t('webclient.serverinformation.header', this), "route": "installationinfo" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.ostype', this), "route": "ostype" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.opmversion', this), "route": "opmversion" },//No I18N            
                { "displayName": Ember.I18n.t('webclient.support.workingdirectory', this), "route": "workingdirectory" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.databasetype', this), "route": "databasetype" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.harddisksize', this), "route": "harddisksize" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.ramsize', this), "route": "ramsize" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.processorname', this), "route": "processorname" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.totaljvm', this), "route": "totaljvm" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.usedjvm', this), "route": "usedjvm" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.freejvm', this), "route": "freejvm" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.Load', this), "route": "Load" },//No I18N
                // { "displayName": Ember.I18n.t('webclient.about.BuildNumber', this), "route": "configJvmHeap" },//No I18N
                // { "displayName": Ember.I18n.t('webclient.about.BuildNumber', this), "route": "newConfigJvmHeap" },//No I18N
                { "displayName": Ember.I18n.t('webclient.support.threadcount', this), "route": "threadcount" }//No I18N
            ]
            // Maps: [
            //  { "displayName": Ember.I18n.t('webclient.map.gmap.header', this), "route": "Maps.GMaps.GoogleMap" }//No I18n
            // ]
        },
        help: {
            helpVideos: [
                { "displayName": Ember.I18n.t('webclient.help.howToDiscoverDevice', this), "route": "https://youtu.be/aCCOkpMEoxA?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7" },//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToDiscoverVcenter', this), "route": "https://youtu.be/QqqQDr338Ik?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryRead) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToDiscoverHyperV', this), "route": "https://youtu.be/zBJ80SNY93Q?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryRead) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToDiscoverXen', this), "route": "https://youtu.be/z0E_dl2Nla0?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.discoveryRead) || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition},//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToMontitorURLs', this), "route": "https://youtu.be/zm8HpuasH1k?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7","isHide": !(window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.monitoringRead) || window.OPM.isMSPEdition || window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || window.OPM.isURLMonitoringRestricted},//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToDeviceConf', this), "route": "https://youtu.be/-K5PuhrpKx8?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7" },//No I18N
                { "displayName": Ember.I18n.t('webclient.help.howToConfMail', this), "route": "https://youtu.be/qjz-8ZipmGA?list=PL0FkrkKW27nNxQjwszmwVnnmRDK77Meq7" }//No I18N
            ]
        },
        recommendations: {
            ALERT: [
                { "name": Ember.I18n.t("webclient.ncm.addNotification"), "href": "#/Settings/Notification/Add","isHide":!window.OPM.userPermissions.notificationProfileWrite},//No I18N
                { "name": Ember.I18n.t("webclient.fwa.add.alert"), "href": "#/Settings/FirewallConfig/FWAddAlert" }//No I18N
            ],
            DEVICE: [
                { "name": Ember.I18n.t('webclient.admin.adddevice.adddevice', this), "href": "#/Settings/Discovery/AddNewDevice" }//No I18N
            ],
            INTERFACE: [],
            URL: [],
            NOTE: [],
            NFA_DEVICE: [],
            NFA_INTERFACE: [],
            NFA_IPGROUP: [],
            NCM_DEVICE: [],
            NCM_CONFIG: [],
            NCM_DEVICEGROUP: [],
            NCM_COMPLIANCE: [],
            FWA_DEVICE: [],
            FWA_INTERFACE: [],
            FWA_CLOUD: [],
            FWA_RULES: [],
            IPAM_SUBNET: [],
            IPAM_SWITCH: []
        }, compliance: {
        	ncm:[
    	      	{ "displayName": Ember.I18n.t('ncm.complianceiq.tabname', this), "route": "NCMCompliance.Policies", "isHide": !OPMClient.ApplicationController.isNCM },//No I18N
				{ "displayName": Ember.I18n.t('widget.name.compPolicy', this), "route": "NCMCompliance.Policies", "isHide": !OPMClient.ApplicationController.isNCM },//No I18N
				{ "displayName": Ember.I18n.t('webclient.admin.alarmesc.ruleTitle', this), "route": "NCMCompliance.ListGroups.All", "isHide": !OPMClient.ApplicationController.isNCM },//No I18N
				{ "displayName": Ember.I18n.t('webclient.rule.grp', this), "route": "NCMCompliance.ListRules.All", "isHide": !OPMClient.ApplicationController.isNCM }//No I18N
        	]
        }, changes: {
        	ncm: [
        	    { "displayName": Ember.I18n.t('opmanagerclient.list.commonmenu.Notifications', this), "route": "NCMConfigAutomation.NCMChangeManagement.Notification", "isHide": !OPMClient.ApplicationController.isNCM},//No I18N
        	    { "displayName": Ember.I18n.t('webclient.pending.reqsts', this), "route": "NCMConfigAutomation.UploadRequests.PendingRequests","isHide": !OPMClient.ApplicationController.isNCM },//No I18N
        	    { "displayName": Ember.I18n.t('jsp.report.ReportConstruction.ExecutableRequest', this), "route": "NCMConfigAutomation.UploadRequests.ExecutableRequests","isHide": !OPMClient.ApplicationController.isNCM },//No I18N
                { "displayName": Ember.I18n.t('webclient.apprvd.requests', this), "route": "NCMConfigAutomation.UploadRequests.ApprovedRequests","isHide": !OPMClient.ApplicationController.isNCM },//No I18N
                { "displayName": Ember.I18n.t('webclient.rejected.reqsts', this), "route": "NCMConfigAutomation.UploadRequests.RejectedRequests","isHide": !OPMClient.ApplicationController.isNCM },//No I18N
                { "displayName": Ember.I18n.t('jsp.report.ReportConstruction.DeletedRequest', this), "route": "NCMConfigAutomation.UploadRequests.DeletedRequests","isHide": !OPMClient.ApplicationController.isNCM }//No I18N
        	]
        },
        supportAnalysis: {
            Analysis: [
                { "displayName": Ember.I18n.t("webclient.analyzer.perfAssistant"), "route": "SupportAnalysis.PerformanceAssistant"},//No I18N
                { "displayName": Ember.I18n.t('webclient.analyzer.pollStats'), "route": "SupportAnalysis.PollingStatistics", isHide: !(window.OPM.isOPM && window.OPM.isOpmPlug) || OPMClient.ApplicationController.isMSPCentralSelected || window.OPM.isCentralServer && window.OPM.isOPMEEUnifiedConsoleView},//No I18N
                { "displayName": Ember.I18n.t('webclient.analyzer.deviceHealth'), "route": "SupportAnalysis.MonitorHealthReports", 'isPath': true, 'path': 'device', isHide: !(window.OPM.isOPM && window.OPM.isOpmPlug)|| window.OPM.isCentralServer || !window.OPM.userPermissions.reportsRead || OPMClient.ApplicationController.isMSPCentralSelected},//No I18N
                { "displayName": Ember.I18n.t('webclient.analyzer.monitorHealth'), "route": "SupportAnalysis.MonitorHealthReports", 'isPath': true, 'path': 'monitor', isHide: !(window.OPM.isOPM && window.OPM.isOpmPlug) || window.OPM.isCentralServer || !window.OPM.userPermissions.reportsRead || OPMClient.ApplicationController.isMSPCentralSelected},//No I18N
                { "displayName": Ember.I18n.t('webclient.support.loadDetails'), "route": "SupportAnalysis.LoadDetails", isHide: !(window.OPM.isOPM && window.OPM.isOpmPlug) || window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected}, //No I18N
                { "displayName": Ember.I18n.t('webclient.ncmsupport.systemInfo'), "route": "SupportAnalysis.SystemInfo" },//No I18N
                { "displayName": Ember.I18n.t('webclient.analyzer.dbStats'), "route": "SupportAnalysis.DbStats", isHide: window.OPM.isOPM && !window.OPM.isOpmPlug || !window.OPM.isAllCoreModulesFullAccessAdmin},//No I18N
                { "displayName": Ember.I18n.t('webclient.support.thread.threaddump'), "route": "SupportAnalysis.ThreadDump", isHide:  window.OPM.isOPM && !window.OPM.isOpmPlug || !window.OPM.isAllCoreModulesFullAccessAdmin},//No I18N
                { "displayName": Ember.I18n.t('webclient.analyzer.querystore'), "route": "SupportAnalysis.QueryStore", isHide: !(window.OPM.isNCMEE && window.OPM.isCentralServer) && !window.OPM.isOPMEEUnifiedConsoleView && !window.OPM.isMSPCentral && window.OPM.isPGSQLDB || window.OPM.isOPM && !window.OPM.isOpmPlug || !window.OPM.isAllCoreModulesFullAccessAdmin},//No I18N
                { "displayName": Ember.I18n.t('webclient.support.cache.statistics'), "route": "SupportAnalysis.CacheStatistics", isHide:  window.OPM.isOPM && !window.OPM.isOpmPlug || !window.OPM.isAllCoreModulesFullAccessAdmin},//No I18N
                { "displayName": Ember.I18n.t('webclient.systemPerformance.settings'),"route": "SupportAnalysis.PerformanceSettings", isHide: !window.OPM.isAdminAllDevices || window.OPM.isKingbaseDB}, //No I18N
                { "displayName": Ember.I18n.t('webclient.systemPerformance.apiPerformance.title'), "route": "SupportAnalysis.ApiPerformanceAnalyzer", isHide: !window.OPM.isAdminAllDevices} //No I18N
            ]
        }
    };
    if(window.OPM.isMSPCentral) {
        ['tools'].forEach(function(key){ //No I18N
            delete allPages[key]
        });
        ['nfa', 'oputils', 'fwa', 'fwaAdmin', 'apm', 'tools'].forEach(function(key){ //No I18N
            delete allPages.settings[key];
            delete allPages.reports[key];
        });
    }
    if (window.OPM.hideSystemPerformance) {
        delete allPages.supportAnalysis;
    }
    generateSearchablePages(allPages);
}
function generateSearchablePages(allPages) {
    searchablePages = {
        settings: {},
        reports: {}
    };
    searchablePages.settings.common = (allPages.settings.common);
    if (window.OPM.isNFA || window.OPM.isNDP) {
        searchablePages.settings.nfa = (allPages.settings.nfa);
        searchablePages.reports.nfa = (allPages.reports.nfa);
        if (OPMClient.ApplicationController.isAdmin) {
            searchablePages.settings.ncm = (allPages.settings.ncm);
            searchablePages.settings.discovery = (allPages.settings.discovery);
            searchablePages.reports.ncm = (allPages.reports.ncm);
        } else {
            delete searchablePages.settings.common;
            delete searchablePages.settings.nfa;
            searchablePages.settings.nfa = [
                // NFAMapTabs:
                { "displayName": Ember.I18n.t('webclient.maps.bview.applicationlist', this), "route": "Settings.NetflowConfig.Map.AppList" },//No I18N
                { "displayName": Ember.I18n.t("nfa.apm.servicesList"), "route": "Settings.NetflowConfig.Map.Services" }, //NO I18N
                { "displayName": Ember.I18n.t('webclient.dscp.list', this), "route": "Settings.NetflowConfig.Map.DSCPList" },//No I18N
                // { "displayName": Ember.I18n.t('TopSites.top', this), "route": "Settings.NetflowConfig.Map.TopSites" },//No I18N
                // netflowOperSettingsTabs:
                { "displayName": Ember.I18n.t('webclient.settings.mappings', this), "route": "Settings.NetflowConfig.Map.AppList" },//No I18N
                { "displayName": Ember.I18n.t('webclient.grp.settings', this), "route": "Settings.NetflowConfig.Groups.App" },//No I18N
                { "displayName": Ember.I18n.t('webclient.alert.profiles', this), "route": "Settings.NetflowConfig.AlertProfiles.RealTime" }//No I18N
            ];
        }
        if(window.isNFAStandardEdition) {
            delete searchablePages.settings.ncm;
            delete searchablePages.reports.ncm;
        }
    } else if (window.OPM.isNCM) {
    	searchablePages.compliance = {};
    	searchablePages.changes = {};
        searchablePages.settings.discovery = (allPages.settings.discovery);
        searchablePages.settings.ncm = (allPages.settings.ncm);
        searchablePages.reports.ncm = (allPages.reports.ncm);
        searchablePages.compliance.ncm = (allPages.compliance.ncm);
        searchablePages.changes.ncm = (allPages.changes.ncm);
    } else if (window.OPM.isFWA && !(window.OPM.isFWADE && window.OPM.isFWAServer)) {
        searchablePages.settings.nfa = (allPages.settings.fwa);
        searchablePages.reports.nfa = (allPages.reports.fwa);
        delete searchablePages.settings.common;
        if (window.OPM.isAuthorized && window.OPM.userPermissions.generalSettingsRead) {
            searchablePages.settings.common = [
                                               {"displayName":Ember.I18n.t('webclient.admin.mailserversettings'),"route":"Settings.Basic.Mail"}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.smsserver.settings'),"route":"Settings.Basic.SMS"},//No I18N
                                               {"displayName": Ember.I18n.t('webclient.tab.settings.usermgmt'), "route": "Settings.Basic.UserMgmt.List","isHide":!window.OPM.userPermissions.userMgmtRead},//No I18N
                                               { "displayName": Ember.I18n.t('webclient.admin.proxy.serverauth'), "route": getMenuLink(OPMClient.MenuController.authenticationTabs, true), "isHide": !window.OPM.showAuthentication},//No I18N
                                               {"displayName": Ember.I18n.t('webclient.Radius.Server.Settings', this), "route": "Settings.Basic.Authentication.RadiusSetting" }, //No I18N
                                               {"displayName": Ember.I18n.t('webclient.admin.winDomains'), "route": "Settings.Basic.Authentication.Domain"}, //No I18N
                                               {"displayName": Ember.I18n.t('webclient.saml'), "route": "Settings.Basic.Authentication.SAML" , "isHide": !window.OPM.showSaml}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.ncm.sshconfig.settings'),"route":"Settings.Basic.SSHConfig" ,"isHide":(window.OPM.isFWADE && window.OPM.isFWAServer)},//No I18N
                                               {"displayName": Ember.I18n.t("webclient.settings.upgrade.title"),"route":"Settings.Basic.UpgradeInfo","isHide": getHideUpgradeManager()},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.admim.setting'),"route":"Settings.Basic.System"},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.DBbackup'),"route":"Settings.Basic.DBbackup","isHide":!window.OPM.userPermissions.generalSettingsRead || !(window.OPM.isPGSQLDB || window.OPM.isProbeDropdownShown)},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.rebrand.Rebranding'),"route":"Settings.Basic.Rebrand","isHide":!window.OPM.showFWACompliance},//No I18N
                                               {"displayName":Ember.I18n.t('opm.devicesnapsettings'),"route":"Settings.Basic.ClientSettings" ,"isHide":(window.OPM.isFWADE && window.OPM.isFWAServer)},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.settings.selfMonitoring'),"route":"Settings.Basic.SelfMonitoring"},//No I18N
                                               {"displayName":Ember.I18n.t("webclient.settings.ImportCertificate.securitysettings",this),"route":"Settings.Basic.SSLSettings.SSLConfig"}, //No I18N
                                               {"displayName":Ember.I18n.t("webclient.admin.settings.secrec.title",this),"route":"Settings.Basic.SSLSettings.SecurityRecommendations", isHide: window.OPM.hideSecurityRecommendations}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.basic.settings.privacysettings'),"route":"Settings.Basic.PrivacySettings.PIISearch" ,"isHide": !window.OPM.isAllModulesFullAccessAdmin},//No I18N
                                               {"displayName":Ember.I18n.t('webClient.tpi.dropmenu.title'),"route":"Settings.Basic.AddOnProductSummary","isHide": !window.OPM.userPermissions.tpiSettingsRead}, //NO I18N
                                               {"displayName":Ember.I18n.t('webclient.restapi.keymanage.pagetitle'),"route":"APIKeyManagement", "isHide": !OPMClient.ApplicationController.showRestApiKey}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.failover.Details'), "route":"Settings.Basic.FosConfiguration", "isHide": window.OPM.isKingbaseDB} //NO I18N
                                               ];
        }
    } 
    else if(window.OPM.isFWADE && window.OPM.isFWAServer){
        searchablePages.settings.nfa = (allPages.settings.fwaAdmin);
        searchablePages.reports.nfa = (allPages.reports.fwa);
        delete searchablePages.settings.common;
        if (window.OPM.isAuthorized && window.OPM.userPermissions.generalSettingsRead) {
        	searchablePages.settings.common = [
                                               {"displayName":Ember.I18n.t('webclient.admin.mailserversettings'),"route":"Settings.Basic.Mail"}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.smsserver.settings'),"route":"Settings.Basic.SMS"},//No I18N
                                               {"displayName": Ember.I18n.t('webclient.tab.settings.usermgmt'), "route": "Settings.Basic.UserMgmt.List","isHide":!window.OPM.userPermissions.userMgmtRead},//No I18N
                                               { "displayName": Ember.I18n.t('webclient.admin.proxy.serverauth'), "route": getMenuLink(OPMClient.MenuController.authenticationTabs, true), "isHide": !window.OPM.showAuthentication},//No I18N
                                               {"displayName": Ember.I18n.t('webclient.Radius.Server.Settings', this), "route": "Settings.Basic.Authentication.RadiusSetting", isHide: window.OPM.isFIPSEnabled}, //No I18N
                                               {"displayName": Ember.I18n.t('webclient.admin.winDomains'), "route": "Settings.Basic.Authentication.Domain" }, //No I18N
                                               {"displayName": Ember.I18n.t('webclient.saml'), "route": "Settings.Basic.Authentication.SAML" , "isHide": !window.OPM.showSaml}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.ncm.sshconfig.settings'),"route":"Settings.Basic.SSHConfig" ,"isHide":(window.OPM.isFWADE && window.OPM.isFWAServer)},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.admim.setting'),"route":"Settings.Basic.System"},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.DBbackup'),"route":"Settings.Basic.DBbackup","isHide":!window.OPM.userPermissions.generalSettingsRead || !(window.OPM.isPGSQLDB || window.OPM.isProbeDropdownShown)},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.rebrand.Rebranding'),"route":"Settings.Basic.Rebrand","isHide":!window.OPM.showFWACompliance},//No I18N
                                               {"displayName":Ember.I18n.t('opm.devicesnapsettings'),"route":"Settings.Basic.ClientSettings" ,"isHide":(window.OPM.isFWADE && window.OPM.isFWAServer)},//No I18N
                                               {"displayName":Ember.I18n.t('webclient.settings.selfMonitoring'),"route":"Settings.Basic.SelfMonitoring"},//No I18N
                                               {"displayName":Ember.I18n.t("webclient.admin.settings.secrec.title",this),"route":"Settings.Basic.SSLSettings.SecurityRecommendations", isHide: window.OPM.hideSecurityRecommendations}, //No I18N
                                               {"displayName":Ember.I18n.t("webclient.settings.ImportCertificate.securitysettings",this),"route":"Settings.Basic.SSLSettings.SSLConfig"}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.basic.settings.privacysettings'),"route":"Settings.Basic.PrivacySettings.PIISearch" ,"isHide": !window.OPM.isAllModulesFullAccessAdmin},//No I18N
                                               {"displayName":Ember.I18n.t('webClient.tpi.dropmenu.title'),"route":"Settings.Basic.AddOnProductSummary","isHide": !window.OPM.userPermissions.tpiSettingsRead}, //NO I18N
                                               {"displayName":Ember.I18n.t('webclient.restapi.keymanage.pagetitle'),"route":"APIKeyManagement", "isHide": !OPMClient.ApplicationController.showRestApiKey}, //No I18N
                                               {"displayName":Ember.I18n.t('webclient.admin.failover.Details'), "route":"Settings.Basic.FosConfiguration", "isHide": window.OPM.isKingbaseDB} //NO I18N
                                               ];
        }
    }
    else if (window.OPM.isOPUtils) {
        searchablePages.settings.tools = (allPages.settings.tools);
        searchablePages.settings.oputils = (allPages.settings.oputils);
        searchablePages.reports.oputils = (allPages.reports.oputils);
    } else {
        searchablePages = allPages;
    }
    if (OPMClient.ApplicationController.isAdmin) {
        searchablePages.recommendations = allPages.recommendations;
    }
    searchablePages.others = allPages.others;
    if (OPMClient.ApplicationController.isCustomer) {
        delete searchablePages.settings;
        delete searchablePages.others;
        delete searchablePages.help;
        delete searchablePages.recommendations;
    }
    if(OPMClient.ApplicationController.isDemoUser) {
        delete searchablePages.others.support;
    }
    if (OPMClient.ApplicationController.isCentralServer) {
        delete searchablePages.settings;
        delete searchablePages.recommendations;
    }
    if (!OPMClient.ApplicationController.showDBQuery && (searchablePages.others != undefined) && (searchablePages.others.support != undefined)) {
        addOrRemovePageInSearch(false, searchablePages.others.support, 'SubmitQuery'); //No I18N
    }
    if(window.OPM.isOPMLiteEdition)
    {
        delete searchablePages.settings.tools;
        delete searchablePages.settings.ncm;
        delete searchablePages.settings.fwa;
        delete searchablePages.settings.fwaAdmin;
        delete searchablePages.settings.nfa;
        delete searchablePages.settings.oputils;
        delete searchablePages.compliance;
        delete searchablePages.changes;
    }
}
function closeSearch() {
    if ($('#container').hasClass('globalSearchActive')) {
        $('#globalSearch').trigger('click');
    }
}
function addOrRemovePageInSearch(flag, pagePackage, pageRoute) {
    var dynamicSearchPages = {
        'SubmitQuery': { "displayName": Ember.I18n.t('webclient.support.submitquery', this), "route": "SubmitQuery" } //No I18N
    };
    if (flag) {
        pagePackage.push(dynamicSearchPages[pageRoute]);
    } else {
        if (pagePackage) {
            $.each(pagePackage, function (i, val) {
                if (val.route === pageRoute) {
                    searchablePages.others.support.splice(i, 1);
                    return false;
                }
            });
        }
    }
}
function showAboutDetails(id) {
    var licenseDetails = opm_getJSONData(window.OPM.apiUrlPattern + "/admin/licenseDetails?isFluidic=true"); //No I18N
    $('#innerSearchResults').hide();
    $('#quickSearchResults').empty();
    $('#globalSearchContainer > section .srchQuickInfoContainer').remove();
    $('#globalSearchContainer > section').append('<div class="srchQuickInfoContainer"></div>');
    var tableDiv = $('<div class="srchQuickInfo"></div>');
    tableDiv.append($('<h2>').text(Ember.I18n.t("apiclient.product.details"))); //NO I18n
    tableBodyDiv = $('<div></div>');
    var j = 0; var longRowDiv;
    var length = $("#product_Details .row").length;
    $.each($("#product_Details .row"), function (i) {
        var key = $(this).find(':first-child').attr('data-key');//No I18N
        var productType = $(this).attr('data-product');//No I18N
        var dispName = $(this).find(':first-child').text();
        var val, displayName;
        if (productType !== undefined) {
            val = licenseDetails.jsonData[productType][key];
        } else if (key === 'nfaServerType') {//No I18N
            val = serverRoleDisp;
        } else if (key === 'ProductName') {//No I18N
            val = licenseDetails.jsonData[key];
        } else {
            val = licenseDetails.jsonData[key];
        }
        if (val !== undefined) {
            var columnDiv = $('<div class="column"> <div>' + opm_escapeHTML(dispName) + '</div> <div>' + opm_escapeHTML(val) + '</div> </div>');
            $.each(searchablePages.others.about, function (sKey, sVal) {
                if (sVal.route === id) {
                    displayName = sVal.displayName;
                }
            });
            
            if(dispName === displayName) {
                columnDiv.addClass('highlight');
            }
            else if(displayName === 'Product Name' && dispName === 'Name'){
                columnDiv.addClass('highlight');
            }
            else if(displayName === 'Expires on'){
                if(dispName === 'Expiry date' || dispName === 'AMS expiry date'){
                     columnDiv.addClass('highlight');
                }
            }
            if (j++ % 2 === 0) {
                longRowDiv = $('<div class="row"></div>');
                longRowDiv.append(columnDiv);
                if (i+1 === length) {
                    tableBodyDiv.append(longRowDiv);
                }
            } else {
                longRowDiv.append(columnDiv);
                tableBodyDiv.append(longRowDiv);
            }
        }
    });
    tableDiv.append(tableBodyDiv);
    if (!window.OPM.isOPUtils && !window.OPM.isFWA && !window.OPM.isNCM) {
        tableDiv.append('<div style=" padding: 10px; background: #f5f5f7; "></div><h2>' + $('#addOn_details h2').text() + '</h2>');
        tableBodyDiv = $('<div></div>');
        var columnDiv;
        if (window.OPM.isOPM) {
            if (licenseDetails !== undefined && licenseDetails.jsonData !== undefined && licenseDetails.jsonData.ModulePropertiesMap !== undefined) {
                i = 0;
                $.each(licenseDetails.jsonData.ModulePropertiesMap, function (key, val) {
                    if (val !== null && val.Nodes !== undefined && val.Nodes === "" && val.Nodes === "" && val.Expiry !== undefined && val.Expiry === 'Never') {
                        columnDiv = ("<div class='column'><div>" + Ember.I18n.t(key, this) + "</div><div>YES</div></div>");//No I18N
                    }
                    else {
                        if (val !== null && val.Expiry !== undefined && val.Expiry !== 'Never') {
                            columnDiv = ("<div class='column'><div>" + Ember.I18n.t(key, this) + "</div><div>" + opm_escapeHTML(val.Expiry) + "</div></div>");//No I18N
                        } else {
                            if (val !== null && val.Nodes !== undefined) {
                                columnDiv = ("<div class='column'><div>" + Ember.I18n.t(key, this) + "</div><div>" + opm_escapeHTML(val.Nodes) + "</div></div>");//No I18N
                            }
                        }
                    }
                    if (i++ % 2 === 0) {
                        longRowDiv = $('<div class="row"></div>');
                        longRowDiv.append(columnDiv);
                        if (i === length) {
                            tableBodyDiv.append(longRowDiv);
                        }
                    } else {
                        longRowDiv.append(columnDiv);
                        tableBodyDiv.append(longRowDiv);
                    }
                });
                if (licenseDetails.jsonData.ModulePropertiesMap.NFAAddonsEnabled !== undefined) {
                    $.each(licenseDetails.jsonData.ModulePropertiesMap.NFAAddonsEnabled, function (key, val) {
                        columnDiv = ("<div class='column'><div>" + opm_escapeHTML(key) + "</div><div>" + opm_escapeHTML(val) + "</div></div>");//No I18N
                    });
                }
            }
        } else if (window.OPM.isNFA) {
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.tab.ncm', this) + "</div><div>" + licenseDetails.jsonData.NCMLicensedDeviceCount + " " + Ember.I18n.t('NFAWidget.devices', this) + "</div></div>");//No I18N
            if(!window.isNDRAddon) {
                if (OPMClient.ApplicationController.isFreeEdition) {
                    $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.inventory.nfa.asam', this) + "</div><div>" + Ember.I18n.t('jsp.commonstr.Disabled', this) + "</div></div>");//No I18N
                } else {
                    $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.inventory.nfa.asam', this) + "</div><div>" + licenseDetails.jsonData.NetFlow.nbaNoOfInterface + " " + Ember.I18n.t('NFAWidget.routVia', this) + "</div></div>");//No I18N
                }
            }
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('NFADB.wlc', this) + "</div><div>" + licenseDetails.jsonData.NetFlow.WLCAccessPointCount + " " + Ember.I18n.t('webclient.snapshot.name.Access.Points', this) + "</div></div>");//No I18N
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.IPSLA', this) + "</div><div>" + licenseDetails.jsonData.IpslaLicenseCount + " " + Ember.I18n.t('webclient.action.graphs', this) + "</div></div>");//No I18N
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.inventory.nfa.nbar', this) + " " + Ember.I18n.t('webclient.license.details.addon', this) + "</div><div>" + licenseDetails.jsonData.NetFlow["NBARCBQoS-addOn"] + "</div></div>");//No I18N
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.inventory.nfa.cbqos', this) + " " + Ember.I18n.t('webclient.license.details.addon', this) + "</div><div>" + licenseDetails.jsonData.NetFlow["NBARCBQoS-addOn"] + "</div></div>");//No I18N
            if(window.isHighPerfAddon){
                $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.license.details.highperf', this) + " " + Ember.I18n.t('webclient.license.details.addon', this)+(licenseDetails.jsonData.NetFlow.highPerfAddonVersion!=undefined ? " ("+licenseDetails.jsonData.NetFlow.highPerfAddonVersion+")" : "") + "</div><div>" + licenseDetails.jsonData.NetFlow.isHighPerfAddon + "</div></div>");//No I18N
            }
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.capacityplanning', this) + " " + Ember.I18n.t('webclient.license.details.addon', this) + "</div><div>" + licenseDetails.jsonData.NetFlow["Capacity-addOn"] + "</div></div>");//No I18N
            $('#addOn_details').append("<div class='row'><div>" + Ember.I18n.t('webclient.reports.billing', this) + " " + Ember.I18n.t('webclient.license.details.addon', this) + "</div><div>" + licenseDetails.jsonData.NetFlow["Billing-addOn"] + "</div></div>");//No I18N
        }
        tableDiv.append(tableBodyDiv);
    }
    $('.srchQuickInfoContainer').append(tableDiv);
}
function showInstallationDetails(searchKey) {
    $('#innerSearchResults').hide();
    $('#quickSearchResults').empty();
    $('#globalSearchContainer > section').append('<div class="srchQuickInfoContainer"></div>');
    var installDetails = opm_getJSONData(window.OPM.apiUrlPattern + "/admin/GetSystemInformation"); // No I18N
    var tableDiv = $('<div class="srchQuickInfo"></div>');
    tableDiv.append('<h2>' + Ember.I18n.t('webclient.serverinformation.header') + '</h2>');
    tableBodyDiv = $('<div></div>');
    var srchRouteObj = (header === 'About') ? searchablePages.others.about : searchablePages.others.installation;//No I18N
    var longRowDiv; var length = $("#installinfo_Details .row").length;
    $.each($("#installinfo_Details .row"), function (i) {
        var key = $(this).find(':first-child').data('key');
        var dispName = $(this).find(':first-child').text();
        $(this).find('div:nth-child(2)').remove();
        var columnDiv = $('<div class="column"> <div>' + opm_escapeHTML(dispName) + '</div> <div>' + (installDetails.jsonData[key] !== undefined ? opm_escapeHTML(installDetails.jsonData[key]) : "") + '</div> </div>');
        
        if (searchKey === key) {
            columnDiv.addClass('highlight');
        }
        if (i++ % 2 === 0) {
            longRowDiv = $('<div class="row"></div>');
            longRowDiv.append(columnDiv);
            if (i === length) {
                tableBodyDiv.append(longRowDiv);
            }
        } else {
            longRowDiv.append(columnDiv);
            tableBodyDiv.append(longRowDiv);
        }
    });
    tableDiv.append(tableBodyDiv);
    $(".srchQuickInfoContainer").append(tableDiv);
}
function openSearchSettings() {
    $("#searchSettingsDiv .menuOption > div").remove();
    $("#globalSearchContainer > section > section, .srchQuickInfoContainer").addClass('blur');
    var tempSrchCtry = [];
    var srchCtgry = $('<div></div>');
    $.each(searchCategories, function (index, value) {
        if (value.show === true) {
            tempSrchCtry.push(value);
        }
    });
    $.each(tempSrchCtry, function (key, val) {
        srchCtgry.append('<div class="opmFormRow"><div class="opmFormCol"><div class="chkRoundBtn"><input type="checkbox" id=\"' + val.id + '\" class="toDisable" onclick="changeSearchSettings()" /><label></label> </div> <label class="searchCtgry">' + val.displayName + '</label></div></div>');
    });
    $("#searchSettingsDiv .menuOption").append(srchCtgry);
    $('#globalSearchContainer > section').addClass('menuOptionContainerActive');
    checkSelectedCtgry();
}
function closeSearchSettings() {
    $('#globalSearchContainer > section').removeClass('menuOptionContainerActive');
    $("#globalSearchContainer > section > section, .srchQuickInfoContainer").removeClass('blur');
    $("#globalSearchValue").focus();
}
function checkSelectedCtgry() {
    var count = JSON.parse(localStorage.getItem("activeSearchTabs")).length;//No I18N
    $.each(JSON.parse(localStorage.getItem("activeSearchTabs")), function (index, value) {//No I18N
        $("#searchSettingsDiv :input[id='" + value + "']").attr('checked', 'checked');
    });
    if (count <= 1) {
        $("#searchSettingsDiv :input:checkbox:checked").parent().addClass("fieldDisabled");
        $("#searchSettingsDiv :input:checkbox:checked").attr('disabled', 'disabled');
        $('.srcMinMaxFieldAlert').html(Ember.I18n.t('webclient.search.settings.minwarn', this)).show();//No I18N
    }
    if (count >= 8) {
        $("#searchSettingsDiv :input:checkbox:not(:checked)").attr('disabled', 'disabled');//No I18N
        $("#searchSettingsDiv :input:checkbox:not(:checked)").parent().parent().addClass("fieldDisabled");
        $('.srcMinMaxFieldAlert').html(Ember.I18n.t('webclient.search.settings.maxwarn', this)).show();//No I18N
    }
}
function changeSearchSettings() {
    var selectedTabCount = $("#searchSettingsDiv :input:checkbox:checked").length;
    var selectedTabs = [];
    $("#searchSettingsDiv :input").each(function () {
        if ($(this).prop('checked') === true) {
            selectedTabs.push($(this).attr('id'));
        }
    });
    localStorage.setItem("activeSearchTabs", JSON.stringify(selectedTabs)); //No I18N
    if (selectedTabCount >= 8) {
        $("#searchSettingsDiv :input:checkbox:not(:checked)").attr('disabled', 'disabled');//No I18N
        $("#searchSettingsDiv :input:checkbox:not(:checked)").parent().parent().addClass("fieldDisabled");
        $('.srcMinMaxFieldAlert').html(Ember.I18n.t('webclient.search.settings.maxwarn', this)).show();//No I18N
    } else if (selectedTabCount <= 1) {
        $("#searchSettingsDiv :input:checkbox:checked").parent().addClass("fieldDisabled");
        $("#searchSettingsDiv :input:checkbox:checked").attr('disabled', 'disabled');
        $('.srcMinMaxFieldAlert').html(Ember.I18n.t('webclient.search.settings.minwarn', this)).show();//No I18N
    } else {
        $('.srcMinMaxFieldAlert').hide();
        $("#searchSettingsDiv :input:checkbox").removeAttr('disabled');
        $("#searchSettingsDiv :input:checkbox").parent().removeClass("fieldDisabled");
        $("#searchSettingsDiv :input:checkbox").parent().parent().removeClass("fieldDisabled");
    }
    var srchCtgry = '';
    var srchCatLength = $("#searchSettingsDiv :input:checkbox:checked").parent().parent().find('.searchCtgry').length;
    $("#searchSettingsDiv :input:checkbox:checked").parent().parent().find('.searchCtgry').each(function (i) {
        srchCtgry += $(this).text();
        if (++i !== srchCatLength) {
            srchCtgry += ', ';
        }
    });
    $('#searchAdvice span').html(Ember.I18n.t('webclient.search.hint', { param0: srchCtgry }, this));//No I18N
    $('#searchAdvice span').attr('title', $('#searchAdvice span').text());//No I18N
    $('#searchInfo').html(Ember.I18n.t('webclient.search.info', { param0: srchCtgry }, this));//No I18N
}
function reDirectTo(route, path) {
    if(!window.OPM.isV3ClientRestricted){
        var v3Path = '';
        if(route === 'Reports.Opmanager.Defreport'){
            v3Path = getDefaultReportsLink(path,false);
        } else if(route === 'Reports.Opmanager.ScheduleReports') { //No I18n
            v3Path = getDefaultReportsLink('ScheduleReports',false); //No I18n
        } else if(route === 'Reports.Opmanager.Advanced'){ //No I18n
            v3Path = getDefaultReportsLink('Advanced',false); //No I18n
        } else if(route === 'Reports.Opmanager.AddReport') { //No I18n
            v3Path = getDefaultReportsLink('AddReport',false); //No I18n
        } else if(route === 'Reports.Opmanager.ServerHealthReport'){ //NO I18n
            goToReportsPageLink('ServerHealthReport', 'System'); //NO I18n
        }else if(route.includes('Reports.AuditLogs')){  //NO I18n
            var match = route.match(/Reports\.AuditLogs\.(.+)$/);
            if(match){
                var context = match[1];
                if(context){
                    v3Path = getAuditReportsLink(context,false);
                }
            }
        }
        else if(route === 'Reports.Opmanager.AddReport') {
            getCreateNewReportLink();
        }
        else if(route === 'Alarms.Alarm.Trap') {
            v3Path = window.OPM.v3ClientURL+'alarms/list/trap'; //No I18n
        }
        if(v3Path){
            redirectToV3Client('',v3Path,true);
            closeSearch();
            return;
        }
    }

    if (path !== '' && path !== undefined && path !== null) {
        closeSearch();
        opmGlobalRoute.transitionTo(route, path);
        return;
    }
    if (isValidURL(route)) {
        window.open(route, '_blank');
        return;
    } else if (route === 'SubmitQuery') { //No I18N
        gotoDbQueryPg();
    } else if ($.inArray(route, ['SIF', 'ThreadDump', 'ViewLogs']) >= 0) {
        if(window.OPM.isOPM) {            
            if(route === 'ViewLogs'){
                route = 'Logs'; //No I18n
            }    
            route = 'Support/' + route; //No I18n
        }
        window.location = "#/" + route;
    } else if ($.inArray(route, ['installationinfo', 'ostype', 'opmversion', 'workingdirectory', 'databasetype', 'harddisksize', 'ramsize', 'processorname', 'totaljvm', 'usedjvm', 'freejvm', 'Load', 'threadcount']) >= 0) {
        showInstallationDetails(route);
        return;
    } else {
        if ($.inArray(route, ['aboutdetails', 'productdetails', 'addondetails', 'LicenseTypeString', 'UserName', 'CompanyName', 'BUILD_NUMBER', 'EvaluationExpiryDate', 'Edition', 'ProductName']) >= 0) {
            showAboutDetails(route);
            return;
        } else {
            if(route.startsWith("Reports.NCM") && !window.OPM.isV3NCMReportRestricted) { //No I18N
                route = route.replace("Reports.NCM.",""); //No I18N
                window.location = getNcmReportUrl(route);
                return;
            }
            opmGlobalRoute.transitionTo(route);
        }
    }
    closeSearch();
}
function isValidURL(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
}
function isValidCSVURL(str) {
    var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
}
function isValidURLTPI(str) {
    var regexp = /(ftp|http|https):\/\/([a-zA-Z0-9\-\.]+)(:[0-9]+)?(\/[^\s]*)?/;
    return regexp.test(str);
}
function pre_getSearchResult(searchKeyword, elementID) {
    $(elementID).append(getSearchResult(searchablePages.settings, searchKeyword, Ember.I18n.t('apiclient.tab.settings', this)));
    $(elementID).append(getSearchResult(searchablePages.reports, searchKeyword, Ember.I18n.t('webclient.reports.header', this)));
    $(elementID).append(getSearchResult(searchablePages.others, searchKeyword, Ember.I18n.t('webclient.map.others', this)));
    $(elementID).append(getSearchResult(searchablePages.supportAnalysis, searchKeyword, Ember.I18n.t('webclient.systemPerformance', this)));

    if(OPMClient.ApplicationController.isNCM) {
    	$(elementID).append(getSearchResult(searchablePages.compliance, searchKeyword, Ember.I18n.t('dashboard.name.compliance', this)));
    	$(elementID).append(getSearchResult(searchablePages.changes, searchKeyword, Ember.I18n.t('jsp.changemgmt.CMRulesMainView.ChangeMgmt', this)));
    }
}
function getSearchResult(searchObj, searchKeyword, searchCategory) {
    var output = '';
    if (searchObj !== undefined && searchObj.length !== 0) {
        output = '<div id="' + searchCategory + 'Div"><h2 class="searchHeader">' + searchCategory + '</h2><ul class="searchresult">';
        var tempMap = {};
        var tempDispNames = [];
        var tabIndex = 0;
        $.each(searchObj, function (sKey, sVal) {
            if(sVal !== undefined){//this check added due to console error.
                  $.each(sVal, function (key, val) {
                      var displayName = (val.Name !== undefined) ? val.Name : val.displayName;
                      var hidePage = (val.isHide !== undefined) ? val.isHide : false;
                      if (val.route !== undefined) {
                          var route = val.route;
                          if (!hidePage && (displayName !== undefined) && (displayName.search(searchKeyword) != -1) && (tempMap[route] === undefined || (val.isPath !== undefined && (val.isPath === true)))) {
                              tempMap[route] = displayName;
                              var path = '\'\'';
                              if (val.isPath === true) {
                                  path = (typeof val.path === 'object') ? JSON.stringify(val.path) : '\'' + val.path + '\'';//No I18N
                              }
                              if (window.OPM.isOPM && $.inArray(displayName, tempDispNames) !== -1) {
                                  displayName += ' (' + sKey.toUpperCase() + ')';
                              }
                              //Hightlighting search text
                              var searchText = (typeof searchKeyword === 'object') ? searchKeyword.source.toLowerCase() : searchKeyword.toLowerCase();//No I18N
                              var index = displayName.toLowerCase().indexOf(searchText);
                              if (index >= 0) {
                                  highLightedDisplayName = displayName.substring(0, index) + "<i style='font:14px LatoBold'>" + displayName.substring(index, index + searchText.length) + "</i>" + displayName.substring(index + searchText.length);
                              }
                              var method = 'reDirectTo(\'' + route + '\',' + path + ')';//No I18N
                              output += '<li><a onclick = ' + method + ' onkeydown = if(event.keyCode==13)' + method + ' tabindex=' + (tabIndex++) + '>' + highLightedDisplayName + '</li>';
                          }
                      }
                      tempDispNames.push(displayName);
                  });
            }
        });
        output += '</ul></div>';
        if (output.search('<li>') === -1) {
            output = '';
        }
    }
    return output;
}
function getSearchrecommendation(searchCategory) {
    if (searchCategory === undefined) {
        return;
    }
    var output = '<div>';
    output = '<h2 class="searchHeader">' + Ember.I18n.t('webclient.search.recommendations', this) + '</h2>';
    output += '<ul class="searchresult">';
    searchCategory.forEach(function (item) {
        if(!item.isHide){
            output += '<li><a href = ' + item.href + ' onclick = closeSearch()>' + item.name + '</li>';
        }
    });
    output += '</ul></div>';
    if (output.search('<li>') === -1) {
        output = '';
    }
    return output;
}
function getResultToActiveTab(activeTab) {
    $('#opm_recommendation').empty();
    if (window.OPM.isOPM && undefined !== searchablePages.recommendations) {
        $('#opm_recommendation').append(getSearchrecommendation(searchablePages.recommendations[activeTab]));
    }
    if ($('#globalSearchValue').val().length > 0) {
        pre_getSearchResult(RegExp($('#globalSearchValue').val(), 'i'), '#opm_recommendation'); // No I18N
    }
}
function opm_searchAll(e) {
    if(clearGlobalSearchPage()) {
        return
    }
    if (e.keyCode !== 13 && e.keyCode !== 27) {
        if ($('#searchMenus').css('opacity') !== 1) {
            $('#innerSearchResults').hide();
            $('.globalSrchTabHolder.opmSchNotesResult').hide();
        }
        $(".srchQuickInfoContainer").hide();
        $('#quickSearchResults').show();
        $('.searchInfoDiv').hide();
        var searchValue = $('#globalSearchValue').val();
        if (searchValue.length > 0) {
            $('#searchAdvice span').show();
        } else {
            $('#searchAdvice span').fadeOut();
        }
        if (searchValue.length < 2) {
            $('#innerSearchResults').show();
            $('#quickSearchResults').empty().hide();
            return;
        }
        var myExp = new RegExp(searchValue, 'i');
        $('#quickSearchResults').empty();
        pre_getSearchResult(myExp, '#quickSearchResults'); // No I18N
        $('#quickSearchResults').append(getSearchResult(searchablePages.help, myExp, Ember.I18n.t('webclient.tour.TechVideos', this)));
        if ($('#quickSearchResults').children().length === 0) {
            $('#innerSearchResults').show();
            $('#quickSearchResults').empty().hide();
        }
    }
    if (e.keyCode === 13) {
        $('#quickSearchResults').hide();
        $(".srchQuickInfoContainer").hide();
        $('#innerSearchResults').show();
        $("#opm_srchList").jqGrid('GridUnload');
        var inputString = document.getElementById('globalSearchValue').value;
        inputString = encodeURIComponent(inputString);
        if (inputString.length === 0) {
            $('#opm_recommendation').empty().hide();
            $('.searchInfoDiv').show();
            $('#innerSearchResults').hide();
            $('#searchMenus').css({ opacity: '0', filter: 'alpha(opacity=0)' });//No I18N
            $('#opm_srchList').empty();//No I18N
        }
        else {
            if (!window.OPM.isV3ClientRestricted) {
                location.href = window.OPM.v3ClientURL + 'global-search'; //No I18N
                return;
            }
            var searchDeviceData;
            opm_progressBarInit();
            var searchTypes = [];
            var opmSearchResult;
            var nfaDeviceSearchResult, nfaIPGroupSearchResult, nfaInterfaceSearchResult;
            var ncmDevicesSearchResult, ncmConfigSearchResult, ncmDeviceGroupSearchResult, ncmComplianceSearchResult;
            var fwDevicesSearchResult, fwInterfacesSearchResult, cloudServicesSearchResult, usedRuleSearchResult, subnetsSearchResult,switchesSearchResult;
            var activeSearchTabs = JSON.parse(localStorage.getItem('activeSearchTabs')); // No I18N
            if ($.inArray('ALERT', activeSearchTabs) !== -1) {
                searchTypes.push('ALERT'); // No I18N
            }
            if ($.inArray('DEVICE', activeSearchTabs) !== -1) {
                searchTypes.push('DEVICE'); // No I18N
            }
            if ($.inArray('INTERFACE', activeSearchTabs) !== -1) {
                searchTypes.push('INTERFACE'); // No I18N
            }
            if ($.inArray('URL', activeSearchTabs) !== -1) {
                searchTypes.push('URL'); // No I18N
            }
            if ($.inArray('NOTE', activeSearchTabs) !== -1) {
                searchTypes.push('NOTE'); // No I18N
            }
            if ($.inArray('REPORTS', activeSearchTabs) !== -1) {
                searchTypes.push('REPORTS'); // No I18N
            }
            if (searchTypes.length !== 0) {
                opmSearchResult = $.ajax(window.OPM.apiUrlPattern + '/discovery/doSearch?isFluidic=true&searchString=' + inputString + '&type=' + searchTypes.join()).then(function (response) { return response; }); //No I18N
            }
            if ($.inArray('NFA_DEVICE', activeSearchTabs) !== -1) {
                nfaDeviceSearchResult = $.ajax(window.OPM.apiUrlPattern + '/nfadevice/getIndexRouterData').then(function (response) {//No I18N
                    var searchItems = ["Name", "IP"];//No I18N
                    return filterSearchData(response.DevList, inputString, searchItems);
                });
            }
            if ($.inArray('NFA_INTERFACE', activeSearchTabs) !== -1) {
                nfaInterfaceSearchResult = $.ajax(window.OPM.apiUrlPattern + '/nfadevice/getIndexInterfaceData').then(function (response) {//No I18N
                    var searchItems = ["rName", "Name"];//No I18N
                    return filterSearchData(response.data, inputString, searchItems);
                });
            }
            if ($.inArray('NFA_IPGROUP', activeSearchTabs) !== -1) {
                nfaIPGroupSearchResult = $.ajax(window.OPM.apiUrlPattern + '/v2/nfadevice/getIndexIPGroupData').then(function (response) {//No I18N
                    var searchItems = ["Name"];//No I18N
                    return filterSearchData(response.traffic, inputString, searchItems);
                });
            }
            if ($.inArray('NCM_DEVICE', activeSearchTabs) !== -1) {
                ncmDevicesSearchResult = $.ajax(window.OPM.apiUrlPattern + '/ncmdevice/listAllDevices?SEARCH_STRING=' + inputString).then(function (response) {//No I18N
                    // var searchItems = [4, 5, 6, 7];  //index of items to be searched
                    // return customFilterNCMSearchData(response.rows, inputString, searchItems);
                    return response.rows;
                });
            }
            if ($.inArray('NCM_CONFIG', activeSearchTabs) !== -1) {
                ncmConfigSearchResult = $.ajax(window.OPM.apiUrlPattern + '/ncmconfig/listAllConfigs?SEARCH_STRING=' + inputString).then(function (response) {//No I18N
                    // var searchItems = [4, 5, 6, 7];  //index of items to be searched
                    // return customFilterNCMSearchData(response.rows, inputString, searchItems);
                    return response.rows;
                });
            }
            if ($.inArray('NCM_DEVICEGROUP', activeSearchTabs) !== -1) {
                ncmDeviceGroupSearchResult = $.ajax(window.OPM.apiUrlPattern + '/ncmdevice/listDeviceGroup').then(function (response) {//No I18N
                    var searchItems = [1];
                    return customFilterNCMSearchData(response.rows, inputString, searchItems);
                });
            }
            if ($.inArray('NCM_COMPLIANCE', activeSearchTabs) !== -1) {
                ncmComplianceSearchResult = $.ajax(window.OPM.apiUrlPattern + '/v2/ncmcompliance/getComplianceList').then(function (response) {//No I18N
                    var searchItems = [1, 2, 3];
                    return customFilterNCMSearchData(response.rows, inputString, searchItems);
                });
            }
            if ($.inArray('FWA_DEVICE', activeSearchTabs) !== -1) {
                fwDevicesSearchResult = $.ajax(window.OPM.apiUrlPattern + '/fwainventory/getFWAInventoryDeviceList').then(function (response) {//No I18N
                    var searchItems = ["dispName", "ip", "vendor", "resType"];//No I18N
                    return filterSearchData(response, inputString, searchItems);
                });
            }
            if ($.inArray('FWA_INTERFACE', activeSearchTabs) !== -1) {
                fwInterfacesSearchResult = $.ajax(window.OPM.apiUrlPattern + '/livetraffic/getInterfaceList').then(function (response) {//No I18N
                    var searchItems = ["firewallDispName", "dispName", "iP"];//No I18N
                    return filterSearchData(response.interfaceDetails, inputString, searchItems);
                });
            }
            if ($.inArray('FWA_CLOUD', activeSearchTabs) !== -1) {
                cloudServicesSearchResult = $.ajax(window.OPM.apiUrlPattern + '/fwainventory/getCloudTabList?timeFrame=today').then(function (response) {//No I18N
                    var searchItems = ["Category", "Service"];//No I18N
                    return filterSearchData(response.cldTabList, inputString, searchItems);
                });
            }
            if ($.inArray('FWA_RULES', activeSearchTabs) !== -1) {
                usedRuleSearchResult = $.ajax(window.OPM.apiUrlPattern + '/fwainventory/getRuleTabList?timeFrame=today').then(function (response) {//No I18N
                    var searchItems = ["Rule", "Status"];//No I18N
                    return filterSearchData(response.ruleTabList, inputString, searchItems);
                });
            }
            if ($.inArray('IPAM_SUBNET', activeSearchTabs) !== -1) {
                subnetsSearchResult = $.ajax(window.OPM.apiUrlPattern + '/ipam/searchStringInIPAM?searchValue='+inputString).then(function (response) {//No I18N
                    return response;
                });
            }
            if ($.inArray('IPAM_SWITCH', activeSearchTabs) !== -1) {
                    switchesSearchResult = $.ajax(window.OPM.apiUrlPattern + '/spm/searchStringInSPM?searchValue='+inputString).then(function (response) {//No I18N
                    return response;
                });
            }
            Ember.RSVP.hash({
                OPM: opmSearchResult,
                NFA_DEVICE: nfaDeviceSearchResult,
                NFA_INTERFACE: nfaInterfaceSearchResult,
                NFA_IPGROUP: nfaIPGroupSearchResult,
                NCM_DEVICE: ncmDevicesSearchResult,
                NCM_CONFIG: ncmConfigSearchResult,
                NCM_DEVICEGROUP: ncmDeviceGroupSearchResult,
                NCM_COMPLIANCE: ncmComplianceSearchResult,
                FWA_DEVICE: fwDevicesSearchResult,
                FWA_INTERFACE: fwInterfacesSearchResult,
                FWA_CLOUD: cloudServicesSearchResult,
                FWA_RULES: usedRuleSearchResult,
                IPAM_SUBNET: subnetsSearchResult,
                IPAM_SWITCH: switchesSearchResult
            }).then(function (results) {
                opm_progressBarComplete();
                // results=compactResults(results);
                opm_parseSearchResults(results);
            });
        }
        return false;
    }
}
function opm_parseSearchResults(searchData) {
    $('.searchInfoDiv').hide();
    $('#opm_recommendation').show();
    $('#innerSearchResults').removeClass('noSideBarGblSearch');
    $('#searchMenus').css({ opacity: '1', filter: 'alpha(opacity=100)' });//No I18N
    //Setting scrollbar left to 0 because the framework automatically setting left to -1000px which hides the menu
    $('#searchMenus .mCSB_container').css({ left: 0 });//No I18N
    
    searchMenusLiWidth = 0;
    // $('#searchMenus li').each(function() {
    //   searchMenusLiWidth += $(this).outerWidth();
    // });
    searchMenusLiWidth = JSON.parse(localStorage.getItem("activeSearchTabs")).length * 200;//No I18N
    searchMenusWd = $('#searchMenus').outerWidth();
    if (searchMenusWd < searchMenusLiWidth) { searchMenusLiWidth = searchMenusLiWidth + 50; }
    $('#searchMenus ul').css({ width: searchMenusLiWidth });//No I18N
    setTimeout(function () {
        $('#searchMenus').mCustomScrollbar({
            axis: "x",//No I18N
            scrollButtons: { enable: true },
            theme: "light-thick",//No I18N
            scrollbarPosition: "outside"//No I18N
        });
    }, 300);

    $("#opm_srchList").jqGrid('GridUnload'); //No I18N
    $('.globalSrchRsltContainer header li').removeClass('active').hide().find('i:first-child').html('--');

    var searchDeviceData = searchData.OPM;
    delete searchData.OPM;
    searchData = _.extend(searchData, searchDeviceData);

    $('.globalSrchRsltContainer header li').off('click').show();
    $('.globalSrchRsltContainer header li').click(function () {
        $('.globalSrchRsltContainer header li').removeClass('active');
        $(this).addClass('active');
        $("#opm_srchList").jqGrid('GridUnload'); //No I18N
        opm_loadSearchResult($(this).data('type'), searchData);
        getResultToActiveTab($(this).attr("data-type"));
        if ($('#opm_recommendation').children().length < 1) {
            $('#innerSearchResults').addClass('noSideBarGblSearch');
        } else {
            $('#innerSearchResults').removeClass('noSideBarGblSearch');
        }
    });

    $.each(searchData, function (key, val) {
        var liEle = $('.globalSrchRsltContainer .' + key.toLowerCase() + 'Count');//No I18N
        var value = 0;
        if (key === 'NOTE') {
            $('.globalSrchTabHolder .alarmNotesCount').html(' (0)');
            $('.globalSrchTabHolder .interfaceNotesCount').html(' (0)');
            $('.globalSrchTabHolder .deviceNotesCount').html(' (0)');
            $.each(val, function (nKey, nVal) {
                value += (!_.isEmpty(nVal) && nVal.length > 0) ? nVal.length : 0;
                $('.globalSrchTabHolder .' + nKey.toLowerCase() + 'NotesCount').html((!_.isEmpty(nVal) && nVal.length > 0) ? ' (' + nVal.length + ')' : '(0)');//No I18N
            });
        } 
        else if (key === 'IPAM_SUBNET') {
            $('.ipamSearchResult .IPsCount').text(' (0)');
            $('.ipamSearchResult .SubnetsCount').text(' (0)');
			$('#opu_srchList_IPs').jqGrid('GridUnload');
            $('#opu_srchList_Subnets').jqGrid('GridUnload');
			$('#IPnodata').css("display","none");
            $('#Subnetnodata').css("display","none");
            if(val !== undefined){
                $.each(val, function (nKey, nVal) {
                    value += (!_.isEmpty(nVal) && nVal.length > 0) ? nVal.length : 0;
                    $('.ipamSearchResult .' + nKey + 'Count').text((!_.isEmpty(nVal) && nVal.length > 0) ? ' (' + nVal.length + ')' : '(0)');//No I18N
                });
            }
        }  
        else if (key === 'IPAM_SWITCH') {
            $('.spmSearchResult .PortsCount').text(' (0)');
            $('.spmSearchResult .SwitchesCount').text(' (0)');
			$('#opu_srchList_Ports').jqGrid('GridUnload');
            $('#opu_srchList_Switches').jqGrid('GridUnload');
			$('#Switchnodata').css("display","none");
            $('#Portnodata').css("display","none");
            if(val !== undefined){
                $.each(val, function (nKey, nVal) {
                    value += (!_.isEmpty(nVal) && nVal.length > 0) ? nVal.length : 0;
                    $('.spmSearchResult .' + nKey + 'Count').text((!_.isEmpty(nVal) && nVal.length > 0) ? ' (' + nVal.length + ')' : '(0)');//No I18N
                });
            }
        }
        else {
            value = (!_.isEmpty(val) && val.length > 0) ? val.length : 0;
        }
        $(liEle).html(value === 0 ? '--' : value);
    });

    var activeSearchTabs = JSON.parse(localStorage.getItem('activeSearchTabs')); // No I18N
    $('.globalSrchRsltContainer header li').removeClass('active');
    $('#opm_recommendation').empty();
    var noDataToShow = true;
    var liList = $('.globalSrchRsltContainer header li i:first-child');
    liList.each(function () {
        if ($(this).html() !== '--' && parseInt($(this).html()) > 0) {
            $(this).parent().addClass('active');
            getResultToActiveTab($(this).parent().attr("data-type"));
            opm_loadSearchResult($(this).parent().data('type'), searchData);
            return false;
        }
    }).each(function () {
        if ($.inArray($(this).parent().attr('data-type'), activeSearchTabs) === -1) {
            $(this).parent().hide();
        }
        if ($(this).html() !== '--') {
            noDataToShow = false;
        }
    });
    count = $('.globalSrchRsltContainer header li:visible').length;
    if (count !== undefined && count > 0 && !noDataToShow) {
        count = count < 5 ? 5 : count;
        size = (100 / count).toFixed(2);
        //$('.globalSrchRsltContainer header li').css({'width':size+'%','min-height':'85px'});
        //$('.globalSrchRsltContainer header li').css({'min-height':'85px'});
        var currentWid = (count * 200) + 50;
        $('.globalSrchRsltContainer header .mCSB_container,.globalSrchRsltContainer header ul').css({ 'width': currentWid });//No I18N
    } else {
		$('#IPnodata').css("display","block");
        $('#Subnetnodata').css("display","block");
        $('#Switchnodata').css("display","block");
        $('#Portnodata').css("display","block");
        $('#opm_srchList').html('<p class="searchNoData">' + Ember.I18n.t('webclient.jqgrid.no.data.found', this) + '</p>'); //No I18N
        $("#opm_recommendation").empty();
        if (window.OPM.isOPM && searchablePages.recommendations !== undefined) {
            var recommends = [];
            $.each(JSON.parse(localStorage.getItem("activeSearchTabs")), function (index, value) {//No I18N
                $.merge(recommends, searchablePages.recommendations[value]);
            });
            $('#opm_recommendation').append(getSearchrecommendation(recommends));
        }
        pre_getSearchResult(RegExp($('#globalSearchValue').val(), 'i'), '#opm_recommendation'); // No I18N
    }
}
function compactResults(data) {
    var newObject = {};
    _.each(data, function (v, k) {
        if (!_.isEmpty(v)) {
            newObject[k] = v;
        }
    });
    return newObject;
}
function filterSearchData(array, searchStr, searchItems) {
    searchStr = searchStr.toLowerCase();
    return _.filter(array, function (obj) {
        if (_.isEmpty(searchItems)) {
            return _.values(obj).some(function (el) {
                return (el + '').toLowerCase().indexOf(searchStr) > -1;
            });
        } else {
            return _.values(_.pick(obj, searchItems)).some(function (el) {
                return (el + '').toLowerCase().indexOf(searchStr) > -1;
            });
        }
    });
}
function customFilterNCMSearchData(array, searchStr, ArrayIndexList) {
    searchStr = searchStr.toLowerCase();
    return _.filter(array, function (obj) {
        if (_.isEmpty(ArrayIndexList)) {
            return _.values(obj.cell).some(function (el) {
                return (el + '').toLowerCase().indexOf(searchStr) > -1;
            });
        } else {
            return _.filter(obj.cell, function (value, index) {
                return _.contains(ArrayIndexList, index);
            }).some(function (el) {
                return (el + '').toLowerCase().indexOf(searchStr) > -1;
            });
        }
    });
}
function opm_loadSearchResult(type, searchDatas) {
    $("#opm_srchList").jqGrid('GridUnload');
    if ($('#opm_recommendation').children().length < 1) {
        $('#innerSearchResults').addClass('noSideBarGblSearch');
    }
    if (type === 'NOTE') {
        $('#opm_srchList').hide(); 
        $('.globalSrchTabHolder.opmSchNotesResult').show();
        $('.globalSrchTabHolder.ipamSearchResult').hide();
        $('.globalSrchTabHolder.spmSearchResult').hide();
    } else if(type === 'IPAM_SUBNET'){//No I18N
        $('#opm_srchList').hide(); 
        $('.globalSrchTabHolder.ipamSearchResult').show();  
        $('.globalSrchTabHolder.opmSchNotesResult').hide(); 
        $('.globalSrchTabHolder.spmSearchResult').hide();
    }
    else if(type === 'IPAM_SWITCH'){//No I18N
        $('#opm_srchList').hide(); 
        $('.globalSrchTabHolder.spmSearchResult').show();
        $('.globalSrchTabHolder.opmSchNotesResult').hide();
        $('.globalSrchTabHolder.ipamSearchResult').hide();
    }
    else {
        $('#opm_srchList').show(); 
        $('.globalSrchTabHolder.opmSchNotesResult').hide();
        $('.globalSrchTabHolder.ipamSearchResult').hide();
        $('.globalSrchTabHolder.spmSearchResult').hide();
    }
    var onselect = '';
    var colNamesList, colModelList;
    if (type === 'DEVICE') {
        colNamesList = [Ember.I18n.t('webclient.devices.details.status', this), Ember.I18n.t('webclient.devices.details.devicename', this), Ember.I18n.t('webclient.devices.details.ipaddress', this), Ember.I18n.t('webclient.devices.details.category', this), Ember.I18n.t('webclient.devices.details.devicename', this)]; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'Name', index: 'Name', classes: 'cursorPointer' }, //No I18N
            { name: 'IpAddress', index: 'IpAddress', width: 30 }, //No I18N
            //\ { name: 'type', index: 'type', width: 30}, //No I18N
            { name: 'deviceName', index: 'deviceName', hidden: true, classes: 'GridColHidden' }, //No I18N
            { name: 'Category', index: 'Category', width: 30 } //No I18N
            //  { name: 'vendorName', index: 'vendorName', width:30 }, //No I18N
            //  { name: 'interfaceCount', index: 'interfaceCount', sorttype:'int', width:10,formatter:interfaceText}, //No I18N
            //{ name: 'assocmonitors', index: 'assocmonitors', sorttype:'int', width:monitorsCount_width, formatter:showDeviceMonitorsLink }, //No I18N
            //  { name: 'notificationProfile', index: 'notificationProfile', sorttype:'int', width:notifProfile_width, formatter:showDeviceNotificationLink }, //No I18N
        ];
        if (window.OPM.isCentralServer === true) {
            colNamesList.push(Ember.I18n.t('webclient.admin.probes.probename', this)); //No I18N
            colModelList.push({ name: 'Probename', index: 'Probename', width: 30 }); //No I18N
        }
        onselect = 'device';//No I18N
    }
    else if (type === 'ALERT') {
        colNamesList = ['', Ember.I18n.t('webclient.fault.details.properties.source', this), Ember.I18n.t('webclient.fault.alarm.category', this), Ember.I18n.t('webclient.fault.alarm.operator', this), '', Ember.I18n.t('webclient.fault.details.properties.severity', this), /*Ember.I18n.t('webclient.fault.event.text', this),*/ Ember.I18n.t('webclient.api.ui.event.entity', this), '','']; //No I18N
        colModelList = [
            //          { name: 'message', index: 'message', formatter:showAlarmLink },
            { name: 'severity', index: 'severity', formatter: severityColorBar }, //No I18N
            { name: 'message', index: 'message', classes: "cursorPointer" }, //No I18N
            { name: 'displayName', index: 'displayName', hidden: false, classes: "cursorPointer", formatter: escapeHtmlTags }, //No I18N
            { name: 'category', index: 'category', hidden: false, classes: "cursorPointer" }, //No I18N
            { name: 'who', index: 'who', hidden: false, classes: "cursorPointer", formatter: opm_compactViewOfAlarm }, //No I18N
            { name: 'severityStr', index: 'severityStr', hidden: true, classes: "GridColHidden" }, //No I18N
            // { name: 'severity', index: 'severity', hidden: false, formatter: severityMSg, classes: "cursorPointer" }, //No I18N
            { name: 'entity', index: 'entity', hidden: true, formatter: escapeHtmlTags }, //No I18N
            { name: 'prettyTime', index: 'prettyTime', hidden: false, classes: "cursorPointer" },//No I18N
            { name: 'alarmId', index: 'alarmId', hidden: true }//No I18N

        ];
        onselect = 'alarm';//No I18N
    }
    else if (type === 'INTERFACE') {
        colNamesList = ['', Ember.I18n.t('webclient.map.interfaceName', this), Ember.I18n.t('webclient.devices.details.devicename', this), Ember.I18n.t('webclient.map.interfaceName', this)]; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'Name', index: 'Name', search: true, width: 80 }, //No I18N
            { name: 'deviceName', index: 'deviceName', search: true, width: 50 }, //No I18N
            { name: 'inferfaceName', index: 'inferfaceName', search: true, width: 50, hidden: true } //No I18N
        ];
        onselect = 'interface';//No I18N
    }
    else if (type === 'URL') {
        colNamesList = ['', '', '', '']; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'DISPLAYNAME', index: 'DISPLAYNAME', search: true, width: 80 }, //No I18N
            { name: 'URL', index: 'URL', search: true, width: 50 }, //No I18N
            { name: 'NAME', index: 'NAME', hidden: true, search: false, width: 0 } //No I18N
        ];
        onselect = 'url';//No I18N
    }else if(type === 'REPORTS'){ //No I18N
            colNamesList = ['', Ember.I18n.t('webclient.reports.ReportName',this), '', '','']; //No I18N
            colModelList = [
            { name: 'reportId', index: 'reportId', hidden: true, search: false, width: 0 }, //No I18N
            { name: 'reportName', index: 'reportName',width:100,classes:'cursorPointer reportsSrch'}, //No I18N
            { name: 'reportType', index: 'reportType', hidden: true, search: false, width: 0 }, //No I18N
            { name: 'isCustom', index: 'isCustom', hidden: true, search: false, width: 0 }, //No I18N
            { name: 'isEdit', index: 'isEdit', hidden: true, search: false, width: 0 } //No I18N
        ];
        onselect = 'reports';//No I18N
    }
    /*else if (type === 'NOTE') {
        colNamesList = ['', Ember.I18n.t('webclient.fault.details.properties.source', this), Ember.I18n.t('webclient.fault.alarm.category', this), Ember.I18n.t('webclient.fault.alarm.operator', this), Ember.I18n.t('webclient.fault.details.properties.severity', this), Ember.I18n.t('webclient.fault.addnotes.notes', this), Ember.I18n.t('webclient.fault.addnotes.user', this), Ember.I18n.t('webclient.api.ui.event.entity', this), '']; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'displayname', index: 'displayname', search: true, width: 80 }, //No I18N
            { name: 'category', index: 'category', search: true, width: 50 }, //No I18N
            { name: 'ownerName', index: 'ownerName', hidden: false, classes: "cursorPointer", formatter: opm_compactViewOfAlarm }, //No I18N
            { name: 'severityStr', index: 'severityStr', hidden: true, classes: "GridColHidden" }, //No I18N
            { name: 'notes', index: 'notes', hidden: false, search: false, width: 0 }, //No I18N
            { name: 'commented_by', index: 'commented_by', hidden: false, search: false, width: 0 }, //No I18N
            { name: 'entity', index: 'entity', hidden: true }, //No I18N
            { name: 'prettyTime', index: 'prettyTime', hidden: false, classes: "cursorPointer" }//No I18N
        ];
        onselect = 'alarm';//No I18N
    }*/
    else if (type === 'FWA_CLOUD') {
        colNamesList = ['', 'Service Name', 'Category']; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'Service', index: 'Service', search: false, width: 80 }, //No I18N
            { name: 'Category', index: 'Category', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_fwa_clouds';//No I18N
    }
    else if (type === 'FWA_DEVICE') {
        colNamesList = ['', 'Name', 'IP Address', 'Type', 'Vendor']; //No I18N
        colModelList = [
            { name: 'rid', index: 'rid', search: false, hidden: true, width: 0 }, //No I18N
            { name: 'dispName', index: 'dispName', search: false, width: 80 }, //No I18N
            { name: 'ip', index: 'ip', search: false, width: 50 }, //No I18N
            { name: 'resType', index: 'resType', search: false, width: 50 }, //No I18N
            { name: 'vendor', index: 'vendor', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_fwa_devices';//No I18N
    }
    else if (type === 'FWA_INTERFACE') {
        colNamesList = ['', 'Interface Name', 'IP Address', 'Device Name']; //No I18N
        colModelList = [
            { name: 'id', index: 'id', search: false, hidden: true, width: 0 }, //No I18N
            { name: 'dispName', index: 'dispName', search: false, width: 80 }, //No I18N
            { name: 'iP', index: 'iP', search: false, width: 50 }, //No I18N
            { name: 'firewallDispName', index: 'firewallDispName', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_fwa_interfaces';//No I18N
    }
    else if (type === 'FWA_RULES') {
        colNamesList = ['', 'Rule', 'Status']; //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'Rule', index: 'Rule', search: false, width: 80 }, //No I18N
            { name: 'Status', index: 'Status', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_fwa_rules';//No I18N
    }
    else if (type === 'NCM_COMPLIANCE') {
        colNamesList = ['ID', Ember.I18n.t('webclient.inventory.policyname', this),//No I18N
            Ember.I18n.t('jsp.admin.sharedprofile.SharedProfileAdd.Desc', this),//No I18N
            Ember.I18n.t('jsp.commonstr.ConfigurationType', this)]; //No I18N
        searchDatas[type] = array2map(searchDatas[type], ['ID','Policy Name', 'Description', 'Config Type'], [0, 1, 2, 3]);
        colModelList = [
            { name: 'ID', index: 'ID', search: false, hidden: true, width: 0 }, //No I18N
            { name: 'Policy Name', index: 'Policy Name', search: false, width: 80 }, //No I18N
            { name: 'Description', index: 'Description', search: false, width: 50 }, //No I18N
            { name: 'Config Type', index: 'Config Type', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_ncm_compliance';//No I18N
    }
    else if (type === 'NCM_DEVICE') {
        colNamesList = ['', 'ID', Ember.I18n.t('webclient.map.name', this),//No I18N
            Ember.I18n.t('webclient.admin.ruleaction.deviceprop.type', this),//No I18N
            Ember.I18n.t('webclient.snapshot.hardware.model', this)]; //No I18N
        searchDatas[type] = array2map(searchDatas[type], ['status', 'ID', 'Name', 'Type', 'Model'], [18, 0, 5, 6, 7]); //No I18N
        colModelList = [
            { name: 'status', index: 'status', formatter: ncmLastOperationStatusColorBar }, //No I18N
            { name: 'ID', index: 'ID', hidden: true, search: false, sortable: false, width: 0 }, //No I18N
            { name: 'Name', index: 'Name', search: false, width: 80 }, //No I18N
            { name: 'Type', index: 'Type', search: false, width: 50 }, //No I18N
            { name: 'Model', index: 'Model', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_ncm_devices';//No I18N
    }
    else if (type === 'NCM_CONFIG') {//No I18N
        colNamesList = ['ID',//No I18N
            Ember.I18n.t('webclient.common.capturedon', this),//No I18N
            Ember.I18n.t('webclient.common.intro.Hostname', this),//No I18N
            Ember.I18n.t('ncm.acd.Version_No', this),//No I18N
            Ember.I18n.t('jsp.commonstr.ConfigurationType', this)]; //No I18N
        searchDatas[type] = array2map(searchDatas[type], ['ID', 'Captured On', 'Host Name', 'Version', 'Config Type'], [0, 1, 2, 4, 6]);//No I18N
        colModelList = [
            { name: 'ID', index: 'ID', hidden: true, search: false, sortable: false, width: 0 }, //No I18N
            { name: 'Captured On', index: 'Captured On', search: false }, //No I18N
            { name: 'Host Name', index: 'Host Name', search: false }, //No I18N
            { name: 'Version', index: 'Version', search: false }, //No I18N
            { name: 'Config Type', index: 'Config Type', search: false } //No I18N
        ];
        onselect = 'search_ncm_configs';//No I18N
    }
    else if (type === 'NCM_DEVICEGROUP') {
        colNamesList = ['', 'ID', Ember.I18n.t('webclient.map.name', this), Ember.I18n.t('jsp.admin.sharedprofile.SharedProfileAdd.Desc', this)]; //No I18N
        searchDatas[type] = array2map(searchDatas[type], ['ID', 'Name', 'Description'], [0, 1, 3]);
        colModelList = [
            { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
            { name: 'ID', index: 'ID', hidden: true, search: false }, //No I18N
            { name: 'Name', index: 'Name', search: false, width: 50 }, //No I18N
            { name: 'Description', index: 'Description', search: false, width: 50 } //No I18N
        ];
        onselect = 'search_ncm_device_groups';//No I18N
    }
	else if(type=="NFA_DEVICE") { //NO I18N
		colNamesList=["","","","","","","","","","",""]; //NO I18N
		colModelList=[
			{ name:"clrCode",	index:"clrCode",	formatter:nfaColorBarFormatter}, //NO I18N
			{ name:"ID",		index:"ID",			hidden:true}, //NO I18N
			{ name:"Name",		index:"Name"		}, //NO I18N
			{ name:"IP",		index:"IP"			}, //NO I18N
			{ name:"rImg",		index:"rImg",		formatter:nfa_deviceImgFormatter}, //NO I18N
			{ name:"wlcStatus",	index:"wlcStatus",	hidden:true}, //NO I18N
			{ name:"MerakiID",	index:"MerakiID",	hidden:true}, //NO I18N
			{ name:"rType",		index:"rType",		hidden:true}, //NO I18N
			{ name:"IntfCount",	index:"IntfCount",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("widget.typename.nfainterface")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"PktCount",	index:"PktCount",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("webclient.maps.bview.packet")+": "+htmlEncode(cellValue)},	hidden:window.OPM.isCentralServer}, //NO I18N
			{ name:"probeName",	index:"probeName",	hidden:(!window.OPM.isCentralServer && !isAllCollectorSelected())} //NO I18N
		];
		onselect="search_nfa_devices"; //NO I18N
	}
	else if(type=="NFA_INTERFACE") { //NO I18N
		colNamesList = ["","","","","","","","","","","","","","","","",""]; //NO I18N
		colModelList = [
			{ name:"clrCode",		index:"clrCode",	formatter:nfaColorBarFormatter}, //NO I18N
			{ name:"ID",			index:"ID",			hidden:true}, //NO I18N
            { name:"Status",        index:"Status",     formatter:nfa_interfaceStatusFormatter, hidden:window.OPM.isCentralServer}, //NO I18N
			{ name:"Name",			index:"Name",		formatter:jqGridHTMLEncode}, //NO I18N
			{ name:"rName",			index:"rName",		formatter: jqGridHTMLEncode}, //NO I18N
			{ name:"RouterID",		index:"RouterID",	hidden:true}, //NO I18N
			{ name:"state",			index:"state",		hidden:true}, //NO I18N
			{ name:"sampleRate",	index:"sampleRate",	hidden:true}, //NO I18N
			{ name:"collectorID",	index:"collectorID",hidden:true}, //NO I18N
			{ name:"UtilIN",		index:"UtilIN",		formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.in.percentage")+": "+htmlEncode(cellValue)+"%"},	hidden:window.OPM.isCentralServer}, //NO I18N
			{ name:"UtilOUT",		index:"UtilOUT",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.out.percentage")+": "+htmlEncode(cellValue)+"%"},	hidden:window.OPM.isCentralServer}, //NO I18N
			{ name:"IN",			index:"IN",			formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.in.speed")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"OUT",			index:"OUT",		formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.out.speed")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"alert",			index:"alert",		formatter:function(cellValue,options,rowdata){return Ember.I18n.t("webclient.map.flash.DeleteConfirmDialog")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"isVPCInterface",index:"isVPCInterface",hidden:true}, //NO I18N
			{ name:"statuscode",	index:"statuscode",	hidden:true}, //NO I18N
			{ name:"lastContactTime",index:"lastContactTime",hidden:true} //NO I18N
		];
		onselect="search_nfa_interfaces"; //NO I18N
	}
	else if(type=="NFA_IPGROUP") { //NO I18N
		colNamesList=["","","","","","","",""]; //NO I18N
		colModelList=[
			{ name:"clrCode",	index:"clrCode",formatter:nfaColorBarFormatter}, //NO I18N
			{ name:"ID",		index:"ID",		hidden:true}, //NO I18N
			{ name:"Name",		index:"Name",	formatter:jqGridHTMLEncode}, //NO I18N
			{ name:"UtilIN",	index:"UtilIN",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.in.percentage")+": "+htmlEncode(cellValue)+"%"}}, //NO I18N
			{ name:"UtilOUT",	index:"UtilOUT",formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.out.percentage")+": "+htmlEncode(cellValue)+"%"}}, //NO I18N
			{ name:"IN",		index:"IN",		formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.in.speed")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"OUT",		index:"OUT",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("nfa.units.out.speed")+": "+htmlEncode(cellValue)}}, //NO I18N
			{ name:"alert",		index:"alert",	formatter:function(cellValue,options,rowdata){return Ember.I18n.t("webclient.map.flash.DeleteConfirmDialog")+": "+htmlEncode(cellValue)}} //NO I18N
		];
		onselect = 'search_nfa_ipgroups';//No I18N
	}

    var defaultOptions = { "multiselect": false, "minRowsPerPage": 100, "rowNumNeeded": false };//No I18N
    if (type === 'NOTE') {
        showNotes("opmSchNotesResult");//No I18N
        var c = 0;
        if (searchDatas[type] !== undefined) {
            $('.globalSrchTabHolder.opmSchNotesResult').show();
            $('#opm_srchList_DEVICE').jqGrid('GridUnload');
            $('#opm_srchList_INTERFACE').jqGrid('GridUnload');
            $('#opm_srchList_ALARM').jqGrid('GridUnload');
            $.each(searchDatas[type], function (key, val) {
                if (key === 'DEVICE') {
                    colNamesList = [Ember.I18n.t('webclient.devices.details.status', this), Ember.I18n.t('webclient.devices.details.devicename', this), Ember.I18n.t('webclient.devices.details.ipaddress', this), Ember.I18n.t('webclient.devices.details.devicename', this), Ember.I18n.t('webclient.devices.details.category', this)]; //No I18N
                    colModelList = [
                        { name: 'status', index: 'status', formatter: severityColorBar }, //No I18N
                        { name: 'Name', index: 'Name', classes: 'cursorPointer' }, //No I18N
                        { name: 'IpAddress', index: 'IpAddress', width: 30 }, //No I18N
                        { name: 'deviceName', index: 'deviceName', hidden: true, classes: 'GridColHidden' }, //No I18N
                        { name: 'Category', index: 'Category', width: 30 } //No I18N
                    ];
                    if (window.OPM.isCentralServer === true) {
                        colNamesList.push(Ember.I18n.t('webclient.admin.probes.probename', this)); //No I18N
                        colModelList.push({ name: 'Probename', index: 'Probename', width: 30 }); //No I18N
                    }
                    onselect = 'device';//No I18N
                } else if (key === 'INTERFACE') { //No I18N
                    colNamesList = ['', Ember.I18n.t('webclient.map.interfaceName', this), Ember.I18n.t('webclient.map.interfaceName', this)]; //No I18N
                    colModelList = [
                        { name: 'status', index: 'statusNum', formatter: severityColorBar }, //No I18N
                        { name: 'Name', index: 'Name', search: true, width: 80 }, //No I18N
                        { name: 'inferfaceName', index: 'inferfaceName', search: true, width: 50, hidden: true} //No I18N
                    ];
                    onselect = 'interface';//No I18N
                } else if (key === 'ALARM') { //No I18N
                    colNamesList = ['', Ember.I18n.t('webclient.fault.details.properties.source', this), Ember.I18n.t('webclient.fault.alarm.category', this), Ember.I18n.t('webclient.fault.alarm.operator', this), '', Ember.I18n.t('webclient.fault.details.properties.severity', this), /*Ember.I18n.t('webclient.fault.event.text', this),*/ Ember.I18n.t('webclient.api.ui.event.entity', this), '','']; //No I18N
                    colModelList = [
                        { name: 'severity', index: 'severity', formatter: severityColorBar }, //No I18N
                        { name: 'message', index: 'message', classes: "cursorPointer", formatter: redirectToAlarmWCAG }, //No I18N
                        { name: 'displayName', index: 'displayName', hidden: false, classes: "cursorPointer", formatter: escapeHtmlTags }, //No I18N
                        { name: 'category', index: 'category', hidden: false, classes: "cursorPointer" }, //No I18N
                        { name: 'who', index: 'who', hidden: false, classes: "cursorPointer", formatter: opm_compactViewOfAlarm }, //No I18N
                        { name: 'severityStr', index: 'severityStr', hidden: true, classes: "GridColHidden" }, //No I18N
                        // { name: 'severity', index: 'severity', hidden: false, formatter: severityMSg, classes: "cursorPointer" }, //No I18N
                        { name: 'entity', index: 'entity', hidden: true, formatter: escapeHtmlTags }, //No I18N
                        { name: 'prettyTime', index: 'prettyTime', hidden: false, classes: "cursorPointer" },//No I18N
                        { name: 'alarmId', index: 'alarmId', hidden: true}//No I18N
                    ];
                    onselect = 'alarm';//No I18N
                }
                opm_loadJQgridWithData("#opm_srchList_" + key, val, colNamesList, colModelList, "", "#" + key.toLowerCase() + "NotesPgr", onselect, defaultOptions); //No I18N
                c++;
            });
        } else {
            colNamesList = ['']; //No I18N
            colModelList = [
                { name: 'alarmId', index: 'alarmId', hidden: true } //No I18N
            ];
            onselect = 'alarm';//No I18N
            $('.globalSrchTabHolder.opmSchNotesResult').hide();
            opm_loadJQgridWithData("#opm_srchList", searchDatas[type], colNamesList, colModelList, "", "#opm_srchPager", onselect, defaultOptions); //No I18N
        }
    }else if(type === 'IPAM_SUBNET'){//No I18N
        showNotes("ipamSearchResult");//No I18N
        $('.globalSrchTabHolder.ipamSearchResult').show();
        $('.globalSrchTabHolder.spmSearchResult').hide();
        $('#opu_srchList_IPs').jqGrid('GridUnload');
        $('#opu_srchList_Subnets').jqGrid('GridUnload');
        if (searchDatas[type] !== undefined) {
            $.each(searchDatas[type], function (key, val) {
                if (key === 'Subnets') {
                    colNamesList = ["",Ember.I18n.t('opu.views.SUBNET_ADDRESS', this), Ember.I18n.t('opu.views.NAME', this), Ember.I18n.t('opu.views.SIZE', this), Ember.I18n.t('opu.common.USAGE', this), Ember.I18n.t('opu.views.STATUS', this), Ember.I18n.t('opu.views.USED', this), Ember.I18n.t('opu.views.AVAILABLE', this), Ember.I18n.t('opu.views.TRANSIENT', this), Ember.I18n.t('opu.views.LAST_SCAN_TIME', this), 'subnetid','Subnet mask','GID']; //No I18N
                    colModelList = [
                        {name: 'scan-status-int', index: 'scan-status-int', search: false,formatter: OPMClient.Inventory.oputils_statusColorBar},//No I18N
                        {name: 'subnet-address', index: 'subnet-address', formatter: getSubnetFromLong, classes: "pointer", sortable: true, sorttype: 'text', search: true, width: 80}, //No I18N
                        {name: 'subnet-name', index: 'subnet-name', width: 60, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'subnet-size', index: 'subnet-size', width: 40, sortable: true, sorttype: 'int'}, //No I18N
                        {name: 'percentage', index: 'percentage', sortable: true, sorttype: 'int', width: 80, align: 'left', search: true}, //No I18N
                        {name: 'scan-status', index: 'scan-status', width: 50, sortable: true, sorttype: 'text', align: 'left', search: false}, //No I18N
                        {name: 'usedCount', index: 'usedCount', width: 35, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                        {name: 'availableCount', index: 'availableCount', width: 50, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                        {name: 'transientCount', index: 'transientCount', width: 50, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                        {name: 'last-scan-time', index: 'last-scan-time', sortable: true, width: 80, search: false}, //No I18N
                        {name: 'subnetid', index: 'subnetid', hidden: true}, //No I18N
                        {name: 'subnet-mask', index: 'subnet-mask', hidden: true}, //No I18N
                         {name: 'snapshot-id', index: 'snapshot-id', hidden: true} //No I18N
                    ];
                    onselect = 'search_ipam_Subnets1';//No I18N
                }else{
                    colNamesList = ["",Ember.I18n.t('opu.views.IP_ADDRESS', this), Ember.I18n.t('webclient.vimonitor.snapshot.macaddress', this), Ember.I18n.t('opu.views.IP_TO_DNS', this), Ember.I18n.t('opu.views.DNS_TO_IP', this), Ember.I18n.t('opu.views.DNS_STATUS', this), Ember.I18n.t('webclient.topo.actions.deviceinfo.status', this), Ember.I18n.t('webclient.addServer.ostype', this), Ember.I18n.t('opu.views.CONNECTED_SWITCH', this),Ember.I18n.t('opu.views.PORT', this),Ember.I18n.t('opu.views.RESERVED_STATUS', this),Ember.I18n.t('opu.views.ALIAS_NAME', this),Ember.I18n.t('webclient.devices.properties.SysDescription', this),Ember.I18n.t('opu.views.ASSET_TAG', this),Ember.I18n.t('opu.common.IF_ALIAS', this),Ember.I18n.t('webclient.devices.details.ifname', this),Ember.I18n.t('opu.views.IFINDEX', this),Ember.I18n.t('opu.views.IF_TYPE', this)]; //No I18N
                    colModelList = [
                        {name: 'scan-status-int', index: 'scan-status-int', formatter: OPMClient.Inventory.oputils_statusColorBar, search: false},//No I18N
                        {name: 'ip-address', index: 'ip-address', search: true, classes: "pointer", width: 100, sortable: true}, //No I18N
                        {name: 'mac-address', index: 'mac-address', width: 120, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'ip-to-dns', index: 'ip-to-dns', sortable: true, width: 100, sorttype: 'text'}, //No I18N
                        {name: 'dns-to-ip', index: 'dns-to-ip', width: 100, sortable: true, sorttype: 'text',hidden:true}, //No I18N
                        {name: 'dns-status', index: 'dns-status', width: 80, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'status', index: 'status', width: 80, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'device-type', index: 'device-type', sortable: true, sorttype: 'text', width: 100}, //No I18N
                        {name: 'connected-switch', index: 'connected-switch', sortable: true, sorttype: 'text', width: 100}, //No I18N
                        {name: 'connected-switch-port', index: 'connected-switch-port', width: 80, sortable: true,  sorttype: 'int'}, //No I18N
                        {name: 'reserved-status', index: 'reserved-status', hidden:true, sortable: true}, //No I18N
                        {name: 'alias-name', index: 'alias-name', hidden:true, sortable: true}, //No I18N
                        {name: 'system-description', index: 'system-description', hidden:true, sortable: true}, //No I18N
                        {name: 'asset-tag', index: 'asset-tag', hidden:true, sortable: true}, //No I18N
                        {name: 'connected-port-ifalias', index: 'connected-port-ifalias', hidden:true, sortable: true}, //No I18N
                        {name: 'connected-port-ifname', index: 'connected-port-ifname', hidden:true, sortable: true}, //No I18N
                        {name: 'connected-port-ifindex ', index: 'connected-port-ifindex', hidden:true, sortable: true}, //No I18N
                        {name: 'connected-port-iftype', index: 'connected-port-iftype', hidden:true, sortable: true} //No I18N
                    ];
                    onselect = 'search_ipam_Subnets';//No I18N
                }
                opm_loadJQgridWithData("#opu_srchList_" + key, val, colNamesList, colModelList, "", "#opu_srchList_" + key+ "Pgr", onselect, defaultOptions); //No I18N
            });
        }else {
            $('.globalSrchTabHolder.ipamSearchResult').hide();
            opm_loadJQgridWithData("#opm_srchList", searchDatas[type], colNamesList, colModelList, "", "#opm_srchPager", onselect, defaultOptions); //No I18N
        }
    }else if(type === 'IPAM_SWITCH'){//No I18N
        showNotes("spmSearchResult");//No I18N
        $('.globalSrchTabHolder.spmSearchResult').show();
        $('.globalSrchTabHolder.ipamSearchResult').hide();
        $('#opu_srchList_Ports').jqGrid('GridUnload');
        $('#opu_srchList_Switches').jqGrid('GridUnload');
        if (searchDatas[type] !== undefined) {
            $.each(searchDatas[type], function (key, val) {
                if (key === 'Switches') {
                    colNamesList = ["",Ember.I18n.t('opu.views.SWITCH_NAME', this), Ember.I18n.t('opu.views.IP_ADDRESS', this), Ember.I18n.t('opu.views.DNS_NAME', this), Ember.I18n.t('opu.views.STATUS', this), Ember.I18n.t('opu.common.USAGE', this), Ember.I18n.t('opu.views.USED', this), Ember.I18n.t('opu.views.AVAILABLE', this), Ember.I18n.t('opu.views.TRANSIENT', this), Ember.I18n.t('opu.views.TOTAL', this), Ember.I18n.t('opu.views.SYS_NAME', this), Ember.I18n.t('opu.views.LAST_SCAN_TIME', this), Ember.I18n.t('opu.views.REMARKS', this), "confid"]; //No I18N
                    colModelList = [
                    {name:'scan-status-int',index:'scan-status-int',formatter:OPMClient.Inventory.oputils_statusColorBar,search: false,width: 3}, //No I18N
                    {name: 'switch-name', index: 'switch-name', classes: "pointer", width: 120, sortable: true, sorttype: 'text'}, //No I18N
                    {name: 'ip-address', index: 'ip-address', width: 100, sortable: true, sorttype: 'text', hidden: true}, //No I18N
                    {name: 'ip-to-dns', index: 'ip-to-dns', width: 120, sortable: true, sorttype: 'text'}, //No I18N
                    {name: 'scan-status', index: 'scan-status', width: 60, sortable: true, sorttype: 'text', search: false}, //No I18N
                    {name: 'usedPercentage', index: 'usedPercentage', formatter: addPercentageSymbol, width: 120, sortable: true, sorttype: 'int', search: true}, //No I18N
                    {name: 'used-count', index: 'used-count', width: 70, sortable: true, sorttype: 'int'}, //No I18N
                    {name: 'available-count', index: 'available-count', width: 70, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                    {name: 'transient-count', index: 'transient-count', width: 70, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                    {name: 'total-count', index: 'total-count', width: 50, sortable: true, sorttype: 'int', hidden: false}, //No I18N
                    {name: 'system-name', index: 'system-name', sortable: true, sorttype: 'text', width: 100}, //No I18N
                    {name: 'last-scan-time', index: 'last-scan-time', hidden: false, sortable: true, width: 120, search: false}, //No I18N
                    {name: 'remarks', index: 'remarks', hidden: false, sortable: true, sorttype: 'text', width: 100}, //No I18N
                    {name: 'config-id', index: 'config-id',hidden:true} //No I18N
                    ];
                    onselect = 'search_spm_Switches';//No I18N
                }else{
                    colNamesList = ['',Ember.I18n.t('opu.views.SWITCH_NAME', this), Ember.I18n.t('opu.views.IFINDEX', this), Ember.I18n.t('webclient.devices.details.ifname', this), Ember.I18n.t('opu.views.PORT', this), Ember.I18n.t('webclient.admin.url.avail', this), Ember.I18n.t('webclient.vimonitor.snapshot.macaddress', this), Ember.I18n.t('opu.views.IP_ADDRESS', this), Ember.I18n.t('opu.views.DNS_NAME', this), Ember.I18n.t('opu.views.VLANID', this), Ember.I18n.t('opu.views.VLAN_NAME', this), Ember.I18n.t('opu.views.IF_SPEED', this), Ember.I18n.t('opu.common.IF_ALIAS', this), Ember.I18n.t('opu.views.LAST_CHANGE_TIME', this),"","",""]; //No I18N
                    colModelList = [
                        {name: 'scan-status-int', index: 'scan-status-int', formatter: OPMClient.Inventory.oputils_statusColorBar, search: false},//No I18N
                        {name: 'switch-name', index: 'switch-name', classes: "pointer", width: 100, sortable: true, sorttype: 'text', fixed: true}, //No I18N
                        {name: 'connected-port-ifindex', index: 'connected-port-ifindex', width: 50, sortable: true, fixed: true, sorttype: 'int'}, //No I18N
                        {name: 'connected-port-ifname', index: 'connected-port-ifname', width: 70, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'connected-switch-port', index: 'connected-switch-port', width: 40, sortable: true, fixed: true, sorttype: 'int'}, //No I18N
                        {name: 'operational-status', index: 'operational-status', width: 50, sortable: true, sorttype: 'text', fixed: true}, //No I18N
                        {name: 'connected-mac', index: 'connected-mac', width: 110, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'connected-ip', index: 'connected-ip', width: 100, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'connected-dns', index: 'connected-dns', width: 100, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'vlan', index: 'vlan', width: 80, sortable: true, sorttype: 'int'}, //No I18N
                        {name: 'vlan-name', index: 'vlan-name', hidden: false, width: 100, fixed: true, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'connected-port-speed', index: 'connected-port-speed', hidden: false, width: 70, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'connected-port-ifalias', index: 'connected-port-ifalias', hidden: true, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'status-change-time', index: 'status-change-time', hidden: true, sortable: true, sorttype: 'text'}, //No I18N
                        {name: 'config-id', index: 'config-id',hidden:true}, //No I18N
                        {name: 'resource-id', index: 'resource-id',hidden:true}, //No I18N
                        {name: 'operational-status-int', index: 'operational-status-int',hidden:true} //No I18N
                        ];
                    onselect = 'search_ipam_Switches';//No I18N

                }
                opm_loadJQgridWithData("#opu_srchList_" + key, val, colNamesList, colModelList, "", "#opu_srchList_" + key+ "Pgr", onselect, defaultOptions); //No I18N
            });
        }else {
            $('.globalSrchTabHolder.spmSearchResult').hide();
            opm_loadJQgridWithData("#opm_srchList", searchDatas[type], colNamesList, colModelList, "", "#opm_srchPager", onselect, defaultOptions); //No I18N
        }
    } 
    else {
        opm_loadJQgridWithData("#opm_srchList", searchDatas[type], colNamesList, colModelList, "", "#opm_srchPager", onselect, defaultOptions); //No I18N
    }
}
function showNotes(divClass) {
    $('.'+divClass+' > header > div > span').off('click');
    $('.'+divClass+' > header > div > span').click(function () {
        if (!$(this).hasClass('active')) {
            $(this).parent().find('span').removeClass('active');
            $(this).addClass('active');
            glbSrchTabContentActive = '#' + $(this).data('href');
            $(this).closest('.'+divClass).find('.opmCusGrid').removeClass('active').find(glbSrchTabContentActive).addClass('active');
            $(this).closest('.'+divClass).find(glbSrchTabContentActive).addClass('active');
        }
    });
}
//Keys Array length == index Array length. source >= keys Array Length
//var keys=['foo', 'bar', 'qux']; var rows=[['1', '2', '3','4'],['5','6','7','8']]; var indexArray=[0,1,3];
function array2map(rows, keys, indexArray) {
    if (_.isEmpty(rows) || _.isEmpty(rows[0].cell)) {
        return rows;
    }
    var output = [];
    _.each(rows, function (row) {
        var some = {};
        _.each(keys, function (k, i) { some[k] = row.cell[indexArray[i]]; });
        output.push(some);
    });
    return output;
}

$(document).ready(function () {
    $('#globalSearchValue').focus(function () {
        if ($('#globalSearchValue').val().length > 0) {
            $('#searchAdvice span').fadeIn();
        }
        if ($('#globalSearchContainer > section').hasClass('menuOptionContainerActive')) {
            closeSearchSettings();
        }
    }).focusout(function () {
        $('#searchAdvice span').fadeOut();
    });
});
$(document).keydown(function (e) {
    var _target = $(e.target);
    var _focused = $(document.activeElement);
    var _inputting = _focused.get(0).tagName.toLowerCase() === "textarea" || _focused.get(0).tagName.toLowerCase() === "input"; //No I18N
    if (!_inputting || $('#container').hasClass('globalSearchActive')) {
        switch (e.keyCode) {
            case 191:
                if (!$('#container').hasClass('globalSearchActive')) {
                    e.preventDefault();
                    $('#globalSearch').trigger('click');
                } else if (!_inputting) {
                    e.preventDefault();
                    $("#globalSearchValue").focus();
                }
                break;
            case 27:
                e.preventDefault();
                if ($('#globalSearchContainer > section').hasClass('menuOptionContainerActive')) {
                    closeSearchSettings();
                } else {
                    closeSearch();
                }
                //close oputils ip related action menu
                if($('.oputilsIPTools').css("display") === "block"){
                    $('.oputilsIPTools').hide();    
                }
                break;
            case 39:
                $("ul.searchresult li a:focus").parent().next().find('a').focus();
                break;
            case 37:
                $("ul.searchresult li a:focus").parent().prev().find('a').focus();
                break;
        }
    }
});

//Utility function
function searchPageChecker(searchablePages) {
    if (searchablePages !== undefined && searchablePages.length !== 0) {
        $.each(searchablePages, function (seKey, seVal) {
            $.each(seVal, function (sKey, sVal) {
                $.each(sVal, function (key, val) {
                    try {
                        var displayName = (val.Name !== undefined) ? val.Name : val.displayName;
                        if (val.route !== undefined) {
                            var route = val.route;
                            var path = '';
                            if (val.isPath === true) {
                                path = (typeof val.path === 'object') ? JSON.stringify(val.path) : val.path;//No I18N
                            }
                            reDirectTo(route, path);
                        }
                    } catch (error) {
                        // console.log('Display Names: ' + displayName + ' | Route: ' + route + ' | Path: ' + path);
                        // console.log('###Error: ' + error);
                    }
                });
            });
        });
    }
}

function clearGlobalSearchPage() {
    var inputString = document.getElementById('globalSearchValue').value;
    inputString = encodeURIComponent(inputString);
    if (inputString.length === 0) {
        $('#opm_recommendation').empty().hide();
        $('.searchInfoDiv').show();
        $('#innerSearchResults').hide();
        $('#quickSearchResults').empty();
        $('#searchMenus').css({ opacity: '0', filter: 'alpha(opacity=0)' });//No I18N
        $('#opm_srchList').empty();//No I18N
        return true;
    }
}
