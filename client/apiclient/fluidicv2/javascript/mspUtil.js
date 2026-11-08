/**
 * Developer Note:
 * These scripts are prerequisites for integrating NCM features into the Ember application.
 * Ensure they are available before using functions like getNcmReportUrl(), which depend on window.OPM and other shared utilities.
 *
 * Do NOT change the script order or remove them without verifying their impact Ember-integrated flows.
 */

window.OPM.isV3ClientRestricted = window.OPM.isFWAServer;
window.OPM.isV3NCMReportRestricted = window.OPM.isV3ClientRestricted;
window.OPM.isV3ReportRestricted = window.OPM.isV3ClientRestricted || window.OPM.isOPUtils || window.OPM.isFWA;
window.OPM.isV3NCMEolRestricted = window.OPM.isV3ClientRestricted || !(window.OPM.userPermissions.reportsRead && !window.OPM.isNCMPowerUser && !window.OPM.userPermissions.operatorAccess);
window.OPM.v3AuditRoute = window.OPM.isNCM ? 'config-management' : 'audit-logs'; //No I18N
var BASE_OLD_URL = '#/Reports/NCM'; // No I18N
var BASE_NEW_URL = 'reports/config-management'; // No I18N

var reportRouteMappings = {
  HwInvReport: {
    oldUrl: BASE_OLD_URL + '/HwInvReport', // No I18N
    newUrl: BASE_NEW_URL + '/hardware-inventory' // No I18N
  },
  OSVersion: {
    oldUrl: BASE_OLD_URL + '/OSVersion', // No I18N
    newUrl: BASE_NEW_URL + '/firmware-inventory' // No I18N
  },
  DevInventory: {
    oldUrl: BASE_OLD_URL + '/DevInventory', // No I18N
    newUrl: BASE_NEW_URL + '/device-inventory' // No I18N
  },
  HealthStatus: {
    oldUrl: BASE_OLD_URL + '/HealthStatus', // No I18N
    newUrl: BASE_NEW_URL + '/network-health-status' // No I18N
  },
  DevMgmtStatus: {
    oldUrl: BASE_OLD_URL + '/DevMgmtStatus', // No I18N
    newUrl: BASE_NEW_URL + '/device-mgmt-status' // No I18N
  },
  DevAuditStatus: {
    oldUrl: BASE_OLD_URL + '/DevAuditStatus', // No I18N
    newUrl: BASE_NEW_URL + '/device-audit' // No I18N
  },
  BackupStatusReport: {
    oldUrl: BASE_OLD_URL + '/BackupStatusReport', // No I18N
    newUrl: BASE_NEW_URL + '/network-backup-status' // No I18N
  },
  OSVersionHistoryReport: {
    oldUrl: BASE_OLD_URL + '/OSVersionHistoryReport', // No I18N
    newUrl: BASE_NEW_URL + '/osversion-history' // No I18N
  },
  DeviceCredentialProfilesReport: {
    oldUrl: BASE_OLD_URL + '/DeviceCredentialProfilesReport', // No I18N
    newUrl: BASE_NEW_URL + '/device-credentials-profiles' // No I18N
  },
  DeviceCredentialsReport: {
    oldUrl: BASE_OLD_URL + '/DeviceCredentialsReport', // No I18N
    newUrl: BASE_NEW_URL + '/device-credentials' // No I18N
  },
  StartupRunningConflict: {
    oldUrl: BASE_OLD_URL + '/StartupRunningConflict', // No I18N
    newUrl: BASE_NEW_URL + '/startup-running-conflict' // No I18N
  },
  ConfigurationChanges: {
    oldUrl: BASE_OLD_URL + '/ConfigurationChanges', // No I18N
    newUrl: BASE_NEW_URL + '/config-changes' // No I18N
  },
  ConfigurationChangeTrend: {
    oldUrl: BASE_OLD_URL + '/ConfigurationChangeTrend', // No I18N
    newUrl: BASE_NEW_URL + '/config-change-trend' // No I18N
  },
  AnnotationReport: {
    oldUrl: BASE_OLD_URL + '/AnnotationReport', // No I18N
    newUrl: BASE_NEW_URL + '/config-change-annotation' // No I18N
  },
  ConfigAnalysis: {
    oldUrl: BASE_OLD_URL + '/ConfigAnalysis', // No I18N
    newUrl: BASE_NEW_URL + '/config-analysis' // No I18N
  },
  UploadReqReport: {
    oldUrl: BASE_OLD_URL + '/UploadReqReport', // No I18N
    newUrl: BASE_NEW_URL + '/config-upload-request' // No I18N
  },
  PCIReports: {
    oldUrl: BASE_OLD_URL + '/PCIReports', // No I18N
    newUrl: BASE_NEW_URL + '/pci' // No I18N
  },
  SecurityAudit: {
    oldUrl: BASE_OLD_URL + '/SecurityAudit', // No I18N
    newUrl: BASE_NEW_URL + '/security-audit' // No I18N
  },
  EOLEOSReport: {
    oldUrl: BASE_OLD_URL + '/EOLEOSReport', // No I18N
    newUrl: BASE_NEW_URL + '/eol-eos' // No I18N
  },
  ComplianceReport: {
    oldUrl: BASE_OLD_URL + '/ComplianceReport', // No I18N
    newUrl: BASE_NEW_URL + '/compliance' // No I18N
  },
  FirmwareVulnerabilityCveReport: {
    oldUrl: BASE_OLD_URL + '/FirmwareVulnerabilityCveReport', // No I18N
    newUrl: BASE_NEW_URL + '/cve-id' // No I18N
  },
  FirmwareVulnerabilityDeviceReport: {
    oldUrl: BASE_OLD_URL + '/FirmwareVulnerabilityDeviceReport', // No I18N
    newUrl: BASE_NEW_URL + '/exposed-devices' // No I18N
  },
  FirmwareVulnerabilityVersionReport: {
    oldUrl: BASE_OLD_URL + '/FirmwareVulnerabilityVersionReport', // No I18N
    newUrl: BASE_NEW_URL + '/versions-with-vulnerabilities' // No I18N
  },
  FVTrendReport: {
    oldUrl: BASE_OLD_URL + '/FVTrendReport', // No I18N
    newUrl: BASE_NEW_URL + '/fv-fix-trend' // No I18N
  },
  FVDeviceVulnHistoryReport: {
    oldUrl: BASE_OLD_URL + '/FVDeviceVulnHistoryReport', // No I18N
    newUrl: BASE_NEW_URL + '/device-vuln-history' // No I18N
  },
  UserAccessReport: {
    oldUrl: BASE_OLD_URL + '/UserAccessReport', // No I18N
    newUrl: BASE_NEW_URL + '/user-access' // No I18N
  },
  UserAuditReport: {
    oldUrl: BASE_OLD_URL + '/UserAuditReport', // No I18N
    newUrl: BASE_NEW_URL + '/user-audit' // No I18N
  },
  NotificationAudit: {
    oldUrl: BASE_OLD_URL + '/NotificationAudit', // No I18N
    newUrl: BASE_NEW_URL + '/notification-profiles-audit' // No I18N
  },
  CustomReport: {
    oldUrl: BASE_OLD_URL + '/CustomReport', // No I18N
    newUrl: BASE_NEW_URL + '/custom-report' // No I18N
  },
  AdvancedReport: {
    oldUrl: BASE_OLD_URL + '/AdvancedReport', // No I18N
    newUrl: BASE_NEW_URL + '/advanced-report' // No I18N
  },
  BackupHealthReport: {
    newUrl: BASE_NEW_URL + '/backup-health' // No I18N
  }
};

function getNcmReportUrl(reportKey) {
  var mapping = reportRouteMappings[reportKey];

  if (!mapping) {
    return BASE_OLD_URL;
  }

  return window.OPM.isV3NCMReportRestricted ? mapping.oldUrl : (window.OPM.v3ClientURL + mapping.newUrl);
}

function getNcmEolUrl(eolstatus){
    var BASE_NEW_URL = 'eol'; // No I18N
    return window.OPM.v3ClientURL + BASE_NEW_URL + '/' + eolstatus;// No I18N
}
// NCM Specific ember migration functions ends

function getCustomerNameList() {
	if(!window.OPM.isMSPCentral || window.OPM.isProbe) {
		return;
	}
	var customerNameList;
	var url = window.OPM.apiUrlPattern + '/admin/listCustomerNames' + (window.OPM.selCustomerID ?  '' : '?selCustomerID=-1&regionID=-1'); //No I18n
	$.ajax({
		url: url,
		type: 'GET', //No I18N
		async:false,
		success: function(response)
		{
			if (response.error) {
				opm_infoMsgs("errorMsg", response.error.message); //No I18N
				return;
            }
            customerNameList = response;
		}
    });
     window.OPM.selRegionID? '-1':window.OPM.selRegionID;
    if(window.OPM.customerNameList !== undefined) {
        window.OPM.customerNameList = customerNameList;
        if(OPMClient.ApplicationController && OPMClient.ApplicationController.customerNameList) {
			OPMClient.ApplicationController.set('customerNameList', customerNameList); //No I18N
        }
    }
	return customerNameList;
}

function mspContextChange(transition) {
    var currentCustomerIDBeforeChange = window.OPM.selCustomerID;
    var currentRegionIDBeforeChange = window.OPM.selRegionID;
    var customerIDChanged = false;
    var regionIDChanged = false;

    var routePath = transition.targetName;
    if(routePath === 'Loading.index') {
        return;
    }
    //Save current selection when entering Inventory.Device snapshot route or Alarms.Alarm route, and restore it when exiting.
    try {
        var snapType = (transition.params && transition.params['Inventory.Device']) ? transition.params['Inventory.Device'].snapType : null; //No I18N
        var snapshotName = ["MonitoringDevice", "MonitoringInterface"];//No I18N
        //Save is triggered only on entering matching snapshot routes from MSP Central/All-Probes context.
        var enteringInvDevice = (typeof routePath === 'string' && ((routePath.indexOf('Inventory.Device') === 0 && (snapshotName.includes(snapType))) || routePath.indexOf('Alarms.Alarm.Details') === 0)); //No I18N
        //Stay flag: any sub-route under Inventory.Device or Alarms.Alarm.Details should not trigger restore.
        var stayingInSnapshotRoute = (typeof routePath === 'string' && ((routePath.indexOf('Inventory.Device') === 0 && (snapshotName.includes(snapType))) || routePath.indexOf('Alarms.Alarm.Details') === 0)); //No I18N
        var hasSnapshotPrev = sessionStorage.getItem('snapshotPrevCustomerID') !== null; //No I18N
        if(enteringInvDevice && !hasSnapshotPrev) {
            var curCustomerID = sessionStorage.getItem('selectedCustomerID'); //No I18N
            var curRegionID = sessionStorage.getItem('selectedRegionID'); //No I18N
            if(curCustomerID !== null) {
                sessionStorage.setItem('snapshotPrevCustomerID', curCustomerID); //No I18N
            }
            if(curRegionID !== null) {
                sessionStorage.setItem('snapshotPrevRegionID', curRegionID); //No I18N
            }
        }
        else if(!stayingInSnapshotRoute && hasSnapshotPrev) {
            var snapshotPrevCustomerID = sessionStorage.getItem('snapshotPrevCustomerID'); //No I18N
            var snapshotPrevRegionID = sessionStorage.getItem('snapshotPrevRegionID'); //No I18N
            sessionStorage.removeItem('snapshotPrevCustomerID'); //No I18N
            sessionStorage.removeItem('snapshotPrevRegionID'); //No I18N
            //Restore sessionStorage so the rest of mspContextChange picks up the previous selection
            if(snapshotPrevCustomerID !== null) {
                sessionStorage.setItem('selectedCustomerID', snapshotPrevCustomerID); //No I18N
            }
            if(snapshotPrevRegionID !== null) {
                sessionStorage.setItem('selectedRegionID', snapshotPrevRegionID); //No I18N
            }
            getCustomerDetails(snapshotPrevCustomerID, snapshotPrevRegionID);
            currentCustomerIDBeforeChange = window.OPM.selCustomerID;
            currentRegionIDBeforeChange = window.OPM.selRegionID;
        }
    } catch(e) {}
    var mspRouteList = window.OPM.mspRouteList;
    var mspRouteNames = Object.keys(mspRouteList);    
    var paramBasedRoute;
    if(transition.intent && transition.intent.url) {
        paramBasedRoute = transition.intent.url.substring(1).replace(/\//g,'.');
        /*Exceptional Route with different params and same route name*/
        if(routePath === 'Inventory.Device.index' && transition.params && ['LogicalDeviceGroup','LogicalIntfGroup', 'LogicalGroup','LogicalIPSLAGroup'].indexOf(transition.params['Inventory.Device'].snapType) > -1) {
            paramBasedRoute = paramBasedRoute.substring(0, paramBasedRoute.lastIndexOf('.'));
        }
    }
    else if(transition.params) {
        var paramsObject = transition.params;
        var routeFamily = Object.keys(paramsObject).sort(function(a, b) {return a.length - b.length});
        for(var i=0; i < routeFamily.length; i ++) {
            var currentRouteName = routeFamily[i];
            if(!$.isEmptyObject(paramsObject[currentRouteName])) {
                var paramValue = paramsObject[currentRouteName][Object.keys(paramsObject[currentRouteName])[0]];
                routeFamily[i] = currentRouteName + '.' + paramValue;
                for(var j=i+1; j < routeFamily.length; j++) {
                    var newParamsObject = routeFamily[j];
                    routeFamily[j] = routeFamily[j].indexOf(currentRouteName) === 0 ? routeFamily[i] + routeFamily[j].substring(currentRouteName.length) : routeFamily[j];
                    paramsObject[routeFamily[j]] = paramsObject[newParamsObject];                    
                }
            }
        }       
        paramBasedRoute = routeFamily[routeFamily.length - 1];
    } 
    var routeFound;
    var mspSelectEnabled = true;

    if(paramBasedRoute && mspRouteList[paramBasedRoute] !== undefined) {
        routeFound = paramBasedRoute;
    }
    else if(mspRouteList[routePath] !== undefined) { // If routename is directly present
        routeFound = routePath;
    }
    else {
        var parentRouteList = [];
        for(var i=0; i < mspRouteNames.length; i++) { // else if route name is part of a parent route
            if(routePath.indexOf(mspRouteNames[i]) === 0) {
                parentRouteList.push(mspRouteNames[i]);
                routeFound = mspRouteNames[i];
            }
            else if(paramBasedRoute && paramBasedRoute.indexOf(mspRouteNames[i]) === 0) {
                parentRouteList.push(mspRouteNames[i]);
                routeFound = mspRouteNames[i];
            }
        }
        if(parentRouteList.length > 0) { // To check and assign the closest parent route.
            routeFound = parentRouteList.reduce(function(a, b) { return a.length > b.length ? a : b});
        }
    }
    if(routeFound) {
        var mspCustomerNameList = [];
        var mspProbeNameList = [];
        var disabled = mspRouteList[routeFound].disabled;
        
        var showCentral = mspRouteList[routeFound].showCentral;
        var showCustomers = mspRouteList[routeFound].showCustomers;
        var showProbes = mspRouteList[routeFound].showProbes;
        var showAllProbes = mspRouteList[routeFound].showAllProbeOption;
        var selCustomerID = sessionStorage.getItem('selectedCustomerID');//No I18N
        var selRegionID = sessionStorage.getItem("selectedRegionID"); //NO I18N
        var selProbeName,selCustomerName;
        var customerNameList = JSON.parse(JSON.stringify(window.OPM.customerNameList));
        var probeInfo = [];
        var isProbeInstalled = false;
        if(window.OPM.isLicenseExceeded) {
            showCentral = false;
            showCustomers = true;
            showProbes = true;
            showAllProbes = false;
            sessionStorage.setItem('tempselectedCustomerID',window.OPM.selCustomerID); //No I18N
        }
        if(!selCustomerID) {
            selCustomerID = '-1';
            sessionStorage.setItem('selectedCustomerID', selCustomerID); //No I18N
        }
        if(!selRegionID) {
            selRegionID = '-1';
            sessionStorage.setItem('selectedRegionID', selRegionID); //No I18N
        }
        if(disabled) {
            $('.msp_SelProbe').addClass('disabledBlock');
            mspSelectEnabled = false;
            mspCustomerNameList = [];
            mspCustomerRemove();
            transition.abort();
            opmGlobalRoute.transitionTo('NotAuthorized'); //No I18n
        }
        else {
            var enabledCustomers = [], disabledCustomers = [];
            customerNameList.forEach(function(obj) {
                if(obj.CustomerStatus) {
                    enabledCustomers.push(obj);
                }
                else {
                    disabledCustomers.push(obj);
                }
            });
            customerNameList = enabledCustomers.concat(disabledCustomers);
            if(showCentral && showCustomers) {
                mspCustomerNameList = customerNameList.slice();
                mspCustomerNameList.unshift(mspCentralOption);
            }
            else if(showCentral) {
                mspCustomerNameList.push(mspCentralOption);
                selCustomerID = mspCentralOption.CustomerID;
                mspSelectEnabled = false;
            }
            else {
                mspCustomerNameList = customerNameList.slice();
                if(selCustomerID === '-1') { //No I18n
                    selCustomerID = mspCustomerNameList.length > 0 ? mspCustomerNameList[0].CustomerID : '-1'; //No I18n
                }
            }
            var isDashboard = false;
            if(['Home.Dashboard','Home.Dashboard.Add'].indexOf(routeFound) !== -1)
            {
                isDashboard = true;
            }
            var setFlag = false;
             mspCustomerNameList = mspCustomerNameList.map(function(obj) {
                delete obj.isSelected;
                var currentCustomerProbeSelected = false;
                if(showAllProbes){
                    obj.CustomerID != '-1' ? obj.ProbeInfo.unshift(mspProbeOption):obj;
                } 
                //Choosing region id by comparing with selRegionID and route's permission
                if(selCustomerID != '-1' && obj.ProbeInfo !== undefined){
                    obj.ProbeInfo = obj.ProbeInfo.map(function(val){
                        delete val.selected;
                        if(!showAllProbes && selRegionID == '-1' && showProbes && obj.CustomerID != '-1' && !setFlag){
                            return val.ProbeStatus && selCustomerID === obj.CustomerID? (sessionStorage.setItem("selectedRegionID",val.RegionID),selProbeName = val.ProbeDisplayName,setFlag = true,currentCustomerProbeSelected=true,$.extend({}, val, {selected: 'active'})) : val;//No I18N
                        }
                        if(!showProbes) {
                            return (showAllProbes && val.RegionID == '-1' && selCustomerID === obj.CustomerID && val.ProbeStatus) ? (sessionStorage.setItem("selectedRegionID",val.RegionID),currentCustomerProbeSelected=true, selProbeName = val.ProbeDisplayName,$.extend({}, val, {selected: 'active'})) : val;//No I18N
                        }     
                        return (selCustomerID === obj.CustomerID && selRegionID === val.RegionID && val.ProbeStatus & showProbes) ? (currentCustomerProbeSelected=true,selProbeName = val.ProbeDisplayName ,$.extend({}, val, {selected: 'active'})) : val;//No I18N
                    });
                    if(obj.ProbeInfo.length == 0 && obj.CustomerID != '-1'){
                        obj.CustomerStatus = false;
                    }
                }
                //choosing running probe for the selected customer
                if(obj.ProbeInfo) {
                    if(!showProbes) {
                        obj.ProbeInfo = obj.ProbeInfo.map(function(val){
                            if(val.RegionID != '-1') {
                                val.ProbeHide = true;
                                if(isDashboard) {
                                    val.isHide = isDashboard;
                                }
                            }
                            if(val.ProbeStatus) {
                                sessionStorage.setItem("selectedRegionID",val.RegionID);//No I18n
                                val.selected = "active";
                                selProbeName =  val.ProbeDisplayName;
                                currentCustomerProbeSelected = true;
                            }
                            return val;
                        });
                    }
                    //If Customer with no probes running got selected in RMM Edition
                    if(!currentCustomerProbeSelected && obj.ProbeInfo.length > 0 && selCustomerID === obj.CustomerID) {
                        obj.ProbeInfo[0].selected = "active";
                        sessionStorage.setItem("selectedRegionID", obj.ProbeInfo[0].RegionID);
                        selProbeName =  obj.ProbeInfo[0].ProbeDisplayName;
                        currentCustomerProbeSelected = true;
                    }
                    //Dashboard Tab should show All Probe option only 
                    if(isDashboard) {
                        selProbeName = selCustomerID !== "-1" ? obj.ProbeInfo[0].ProbeDisplayName : '';
                        sessionStorage.setItem("selectedRegionID", '-1');//No I18n
                    }
                }
                return selCustomerID === obj.CustomerID ?(selCustomerName = obj.CustomerName,probeInfo = obj.ProbeInfo,$.extend({}, obj, {isSelected: 'active'})) : obj; //No I18N
            }); 
            if(window.OPM.isRMMCentral) {
                customerNameList.forEach(function(obj) {
                    if(selCustomerID == '-1') {
                        if(obj.isProbeInstalled) {
                            isProbeInstalled = obj.isProbeInstalled;
                        }
                    }
                    else if(selCustomerID == obj.CustomerID) {
                        isProbeInstalled = obj.isProbeInstalled;
                    }
                });
            }   
            //Global Window variable initialization 
            selRegionID = window.OPM.selRegionID = sessionStorage.getItem("selectedRegionID");//No I18N
            var isWindows = window.OPM.isCentralWindows; 
            $.each(probeInfo,function(key,val){
                if(val.RegionID == selRegionID) {
                    isWindows = val.isWindows;
                }
            });
            window.OPM.isWindows = isWindows;
            mspCustomerSetup(selCustomerID,selRegionID); //No I18n 
            window.OPM.mspCustomerNameList = JSON.parse(JSON.stringify(mspCustomerNameList));
            window.OPM.ProbeNameList = probeInfo !== undefined ? JSON.parse(JSON.stringify(probeInfo)) : probeInfo;
            selCustomerID == '-1' ? $('.selectCustProbe').removeClass('selected') :$('.selectCustProbe').addClass('selected');
        }
        Ember.run.schedule('afterRender', function() { //No I18n
            //Global OPMClient variable initialization 
            customerIDChanged = currentCustomerIDBeforeChange != selCustomerID;
            regionIDChanged = currentRegionIDBeforeChange != selRegionID;
            if(!window.OPM.isRMMCentral && selRegionID != -1 && (customerIDChanged || regionIDChanged)) {
                setSecurityScore();
            }
            Ember.set('OPMClient.ApplicationController.mspCurrentScopeList', mspCustomerNameList); //No I18n
            Ember.set('OPMClient.ApplicationController.selCustomerName', selCustomerName); //No I18n
            Ember.set('OPMClient.ApplicationController.selProbeName', selProbeName);//No I18n
            Ember.set('OPMClient.ApplicationController.ProbeInfo', probeInfo);//No I18n
            Ember.set('OPMClient.ApplicationController.isWindowsOS', isWindows);//No I18n
            if(['Inventory.Device','Reports.Opmanager.Report','Alarms.Alarm.Details','Maps.Layer2MapDevices','Inventory.Snapshot.LogicalDeviceGroup','Inventory.Snapshot.LogicalIntfGroup','Inventory.Snapshot.LogicalGroup','Inventory.Snapshot.LogicalIPSLAGroup','Alarms.Alarm.RCA.ViewReport','Alarms.Alarm.RCA.EditReport','Alarms.Alarm.RCA.CreateReport','Settings.Configurations.AddAlarmProfile','Reports.AuditLogs.MailServerAudit','Inventory.List.WAN.Overview.Snapshot'].indexOf(routeFound) !== -1)
            {
                mspSelectEnabled = false; //Customers tab should be blocked for Device Snapshot Page
            }
            if(window.OPM.isRMMEdition) {
                var hideRMMprobe = false;
                Ember.set('OPMClient.ApplicationController.isRMMProbeNotInstalled', undefined);//No I18n
                if(probeInfo == undefined || probeInfo.length == 0 || selCustomerID == '-1' || !isProbeInstalled) {
                    hideRMMprobe = true;
                    $('body').removeClass("with-probeTour tour--active");
                } else {
                    if(!hideRMMprobe && !$('body').hasClass("rmmSettings") && OPMClient.ApplicationController.showRMMProbeTourStatus && !sessionStorage.getItem("hideProbeTour")){
                        $('body').addClass("with-probeTour tour--active");
                    }
                }
                Ember.set('OPMClient.ApplicationController.hideRMMprobe', hideRMMprobe);//No I18n
                var dataToPostMessage1 = {name:"customer_filter_segmentation_data_from_opm", message:{isDisableFilter: !mspSelectEnabled, isSegmented: !showCentral, opmanagerCustomerID: selCustomerID, messageFromOp: 'OPMANAGER'}}; //No I18N
                window.MESSAGE_HANDLER.postMessage(dataToPostMessage1, 'selfcast'); //No I18n
                probeDetailsToRMM(probeInfo,hideRMMprobe);
                postDisabledProbeStatusToRMM();
                Ember.run.schedule('afterRender', function() { //No I18n
                    if(isProbeInstalled && selCustomerID != '-1') {
                        isProbeInstalled = checkCurrentProbeDisabled();
                    }
                    //For dashboard should not show static page 
                    if(['Home.Dashboard'].indexOf(routeFound) == -1 || window.OPM.customerNameList.length == 0) {
                        Ember.set('OPMClient.ApplicationController.isRMMProbeNotInstalled', !isProbeInstalled); //No I18n
                    }
                });
            }  
            //Call only if MSP dropdown is changed
            if(sessionStorage.getItem("prevSelectedCustomerID") != undefined && sessionStorage.getItem("prevSelectedCustomerID") != selCustomerID || sessionStorage.getItem("prevSelectedRegionID") != undefined && sessionStorage.getItem("prevSelectedRegionID") != selRegionID) {
                //Reinitializing the dashboard when dropdown changes to update the customer permissions 
                OPMClient.MenuController.set("dashboardMenuLinks",[]);//No I18N
                if(window.OPM.userPermissions.dashboardRead) {
                    loadDashboardMenuLinks();
                }
                OPMClient.ApplicationController.set("tabDetails",[]);//No I18N
                OPMClient.ApplicationController.set("tabDetails",(window.OPM.oldView)?getTabDetails():[]);//No I18N
                sessionStorage.setItem("prevSelectedCustomerID", selCustomerID); //NO I18N
                sessionStorage.setItem("prevSelectedRegionID", selRegionID); //NO I18N
            }
            enableDisableMspSelector(mspSelectEnabled);
        });
    }
    else {
        Ember.run.schedule('afterRender', function() { //No I18n
			Ember.set('OPMClient.ApplicationController.mspCurrentScopeList', []); //No I18n
            enableDisableMspSelector(false);
        });
        mspCustomerRemove();
    }
}

function checkCurrentProbeDisabled() {
    var ProbeDetails = window.OPM.ProbeNameList;
    var status;
    $.each(ProbeDetails, function(key,val) {
        if(val.RegionID == window.OPM.selRegionID) {
            status = val.ProbeStatus;
            return status;
        }
    });
    return status;
}

function enableDisableMspSelector (mspSelectEnabled) {
    if(mspSelectEnabled) {
       $('.msp_SelProbe').removeClass('disabledBlock');
        if(window.OPM.isRMMCentral) {
            Ember.run.schedule('afterRender', function() { //No I18n
                $('.probeDD__label').removeClass('disabledBlock');
            });
        }
    }
    else {
        $('.msp_SelProbe').addClass('disabledBlock');
        if(window.OPM.isRMMCentral) {
            Ember.run.schedule('afterRender', function() { //No I18n
                $('.probeDD__label').addClass('disabledBlock');
            });
        }
    }
}

function probeDetailsToRMM(probeInfo,hideRMMprobe){
    var ProbeList = [];
    var flag=false;
    var count = 0 ;
    if(probeInfo == undefined || probeInfo.length == 0) {
        hideRMMprobe = true;
        flag = true;
    }
    $.each(probeInfo,function(key,val){
        if(!val.ProbeHide) {
            ProbeList[key] = {};
            ProbeList[key].probeName = val.ProbeDisplayName;
            ProbeList[key].regionID = val.RegionID;
            val.selected ? (ProbeList[key].isSelected = true,flag = true) : ProbeList[key].isSelected = false;
            val.ProbeStatus ? (ProbeList[key].probeDisabledStatus = false) : (ProbeList[key].probeDisabledStatus = true,ProbeList[key].probeDisabledMessage = val.ProbeStatusMsg);
        }
    });
    if(!flag && ProbeList[0] != undefined) {
        ProbeList[0].isSelected = true;
    } 
    var probeDetails1 = [];
    var probeDetails2 = [];
    $.each(ProbeList,function(key,val){
        if(!val.probeDisabledStatus) {
            probeDetails1.push(val);
        } else {
            probeDetails2.push(val);
        }
    });
    $.merge(probeDetails1,probeDetails2);
    var dataToPostMessage2 = {name:"probe_filter_data_from_opm", message:{hideProbeFilter:hideRMMprobe,probeDetails:probeDetails1}}; //No I18N
    window.MESSAGE_HANDLER.postMessage(dataToPostMessage2, 'selfcast'); //No I18n
}

function mspCustomerSetup(customerID,regionID) {
    updateCustomerValues(customerID,regionID);
    var isMSPCentralSelected = false;
    var isMSPAllProbeSelected = false;
    if(customerID === "-1")
    { 
        isMSPCentralSelected = true;
    }
    else {
        if(regionID === "-1")
        { 
                isMSPAllProbeSelected = true;
        }
    }
    Ember.set("OPMClient.ApplicationController.isMSPCentralSelected", isMSPCentralSelected); //No I18n
    Ember.set("OPMClient.ApplicationController.isMSPAllProbeSelected", isMSPAllProbeSelected); //No I18n

    //For NFA handling
    window.OPM.isMSPAllCustomerOrAllProbeSelected = (isMSPCentralSelected || isMSPAllProbeSelected);
    Ember.set("OPMClient.ApplicationController.isMSPAllCustomerOrAllProbeSelected", window.OPM.isMSPAllCustomerOrAllProbeSelected); //NO I18N
    window.OPM.faultSettingsAccess = window.OPM.isOPM && window.OPM.isOpmPlug && window.OPM.userPermissions.adminAccess && !window.OPM.isProbe && !window.OPM.isMSPProbe && !(window.OPM.isMSPCentral && !(window.OPM.selCustomerID === '-1' ? true : false)) && !window.OPM.userPermissions.bvRestricted && !window.OPM.userPermissions.devGroupRestricted && !window.OPM.userPermissions.opuRestricted && !window.OPM.userPermissions.ncmRestricted && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition && window.OPM.mspUserType !== 'Customer'; // No I18N
}

function mspCustomerRemove() {
    delete $.ajaxSettings.selCustomerID;
}
function setcustomerList() {
    var mspCustomerNameList = window.OPM.mspCustomerNameList != undefined ? JSON.parse(JSON.stringify(window.OPM.mspCustomerNameList)) : window.OPM.mspCustomerNameList;
    var probeList = window.OPM.ProbeNameList != undefined ? JSON.parse(JSON.stringify(window.OPM.ProbeNameList)) : window.OPM.ProbeNameList;
    OPMClient.ApplicationController.set('mspCurrentScopeList',[]);//No I18n
    OPMClient.ApplicationController.set('ProbeInfo', []);//No I18n
    Ember.run.schedule('afterRender', function() { //No I18n
        Ember.set('OPMClient.ApplicationController.mspCurrentScopeList', mspCustomerNameList); //No I18n
        Ember.set('OPMClient.ApplicationController.ProbeInfo', probeList);//No I18n
    });
}
function onCustomerChange(customerID) {
    sessionStorage.setItem("prevSelectedCustomerID", window.OPM.selCustomerID); //NO I18N
    sessionStorage.setItem("prevSelectedRegionID", window.OPM.selRegionID); //NO I18N
    //Clear snapshot scope on manual MSP dropdown change so saved selection is not restored later.
    sessionStorage.removeItem('snapshotPrevCustomerID'); //No I18N
    sessionStorage.removeItem('snapshotPrevRegionID'); //No I18N
    if(customerID == '-1'){
        sessionStorage.setItem("tempselectedCustomerID", customerID); //NO I18N
        onProbeSelect(customerID);
        mspCustomerSetup(customerID);
        return;
    }
    sessionStorage.setItem("tempselectedCustomerID", customerID); //NO I18N
    var selProbeName,selCustomerName;
    var probeList = [];
    var mspCustomerNameList = OPMClient.ApplicationController.mspCurrentScopeList;
    mspCustomerNameList = mspCustomerNameList.map(function(obj) {
        delete obj.isSelected;
        return customerID === obj.CustomerID ?(selCustomerName = obj.CustomerName,probeList = obj.ProbeInfo,$.extend({}, obj, {isSelected: 'active'})) : obj; //No I18N
    });
    if(window.OPM.isRMMCentral) {
       $.each(probeList,function(key,val){
            if(val.RegionID = "-1" || val.ProbeStatus) {
                onProbeSelect(val.RegionID);
                return false;
            }
        });
    }
    Ember.run.schedule('afterRender', function() { //No I18n
        Ember.set('OPMClient.ApplicationController.mspCurrentScopeList', mspCustomerNameList); //No I18n
        Ember.run.schedule('afterRender', function() { //No I18n
            Ember.set('OPMClient.ApplicationController.ProbeInfo', probeList);//No I18n
            if($('.selectCustProbe__close-search').is(":visible")) {
                var searchString = $("#searchMSPText").val();
                searchMSPDropdown(searchString);
                Ember.set('OPMClient.ApplicationController.ProbeInfo', probeList);//No I18n
                Ember.run.schedule("afterRender", function(){ //No I18N
                    highlightInputsByWords('li .probeName', searchString);//No I18N
                });
            }
        });
    });
}
function onProbeSelect(regionID){
    //Clear snapshot scope on manual MSP dropdown change so saved selection is not restored later.
    sessionStorage.removeItem('snapshotPrevCustomerID'); //No I18N
    sessionStorage.removeItem('snapshotPrevRegionID'); //No I18N

    var customerID = sessionStorage.getItem("tempselectedCustomerID"); //NO I18N
 	if(customerID == null || customerID == undefined || customerID == "") {
		customerID = window.OPM.selCustomerID;
	}
    mspCustomerSetup(customerID,regionID);
    resetCustomPropertiesOnProbeChange();
    if(window.OPM.isRMMCentral) {
        $('.probeDD__label > a').parent().removeClass('active');
    } else {
         $('.selectCustProbe').removeClass('active');
    }   
    var currentRoute = opmGlobalRoute.controller.currentRouteName;
    var currentUrl = window.location.hash;
    var isCustomAlarm = OPMClient.AlarmDetailsController.get("isCustomAlarm");//No I18N
    listCustomViews('ALARMS');//NO I18N
    if(isCustomAlarm) {
        currentUrl = "#/Alarms/Alarm/Active"; //No I18N
    }
    opmGlobalRoute.transitionTo('Loading'); //No I18N
    setTimeout(function() {
        location.href = currentUrl;
    }, 100);
    setSecurityScore();
}

function initAjaxMspPreFilter() { // Appending selCustomerID to ajax requests
    var selectedCustomerParam = window.OPM.selCustomerParam; //No I18n
    var selectedRegionParam = window.OPM.selRegionParam;//No I18n
    if(!window.OPM.isRMMEdition) {
        var windowOpen = window.open;
        window.open = function(url, name, features, replace) {
            url = appendCusIDForExternal(url);
            return windowOpen(url, name, features, replace);  
        }
    }
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        var selCustomerID = window.OPM.selCustomerID;
        var selRegionID = window.OPM.selRegionID;
        //AP related APIs
        if(options.url.indexOf('getCustomCategoryList') >= 0 || options.url.indexOf('getInterfaceTypes') >= 0 || options.url.indexOf('listAllLogicalGroups') >= 0 || options.url.indexOf('listBusinessRules') >= 0 || options.url.indexOf('addBusinessRules') >= 0 || options.url.indexOf('listDevices') >= 0 || options.url.indexOf('listInterfaces') >= 0 || options.url.indexOf('getLogicalGroupInventoryView') >= 0 || options.url.indexOf('getAlarmProfileCriteria') >= 0 || options.url.indexOf('saveAlarmProfile') >= 0 || options.url.indexOf('getAlarmProfile') >= 0 || options.url.indexOf('listNotificationTemplates') >= 0 || options.url.indexOf('manageAlarmProfile') >= 0 || options.url.indexOf('deleteAlarmProfile') >= 0 || options.url.indexOf('getWorkflowList') >= 0 || options.url.indexOf('getMOMarkerInfo') >= 0 || options.url.indexOf('getSecurityUrlsEnabledStatus') >= 0 || options.url.indexOf('getProblematicPAReport') >= 0) {
            if(options!==undefined && options.data!==undefined) {
                if(options.data.indexOf('selCustomerID') >= 0 || options.data.indexOf('regionID') >= 0) {
                    return;
                }
            }
        }
        //Exceptions
		if(nfa_isMSPNFASnapshot()) {
			selCustomerID = OPMClient.InventoryNFAController.nfaMSPCustomerID;
			selRegionID = OPMClient.InventoryNFAController.nfaMSPRegionID;
		}
        else if(options.url.indexOf('updateOpManagerSettings') >= 0) {
            if(options.data.indexOf('showLicensePopup') >= 0) {
                selCustomerID = '-1';
                selRegionID = '-1';
            }
        }
        else if(options.url.indexOf('updateLanguageSettings') >= 0) {
            selCustomerID = -1;
            selRegionID = -1;
        } 
        else if(options.url.indexOf('updateLicenseCheck') >= 0) {
            selCustomerID = '-1';
            selRegionID = '-1';
        }
        else if(options.url.indexOf('listAllLogicalGroups') >= 0 && (window.OPM.currentView && window.OPM.currentView.name !== undefined && window.OPM.currentView.name === "Settings.Configurations.AddAlarmProfile.SelectDevices")) {
            selCustomerID = '-1';
            selRegionID = '-1';
        }
        var isInventoryTabAPI = options.url.indexOf('getTabViewDetails?tabName=inventory') >= 0;
        var isDeviceListAPI = options.url.indexOf('listDevices') >= 0;

        if (isInventoryTabAPI || isDeviceListAPI) {
            var fromInstantWidget = OPMClient.ApplicationController.showInstantWidget;
            if (fromInstantWidget) {
                var parts = options.url.split('?');
                var baseUrl = parts[0];
                var query = parts[1];
                var params = {};
                var paramStrs = query ? query.split('&') : [];
                var newParams = [];

                for (var i = 0; i < paramStrs.length; i++) {
                    var keyValue = paramStrs[i].split('=');
                    var key = decodeURIComponent(keyValue[0]);
                    var value = decodeURIComponent(keyValue[1] || '');

                    if (key === 'selCustomerID') {
                        selCustomerID = value || '-1';
                        continue;
                    }
                    if (key === 'regionID') {
                        selRegionID = value || '-1';
                        continue;
                    }

                    // Keep other params
                    newParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }

                options.url = baseUrl + (newParams.length ? ('?' + newParams.join('&')) : '');
            }
        }
        //Adding customer ID to api request based on the type of request
        if(options.data === undefined || options.data === "") {
           options.data = selectedCustomerParam + '=' + selCustomerID + '&' + selectedRegionParam + '=' + selRegionID;
        }
        else if(options.data === undefined || typeof options.data === 'string') {
            options.data += '&' + selectedCustomerParam + '=' + selCustomerID + '&' + selectedRegionParam + '=' + selRegionID;
        }
        else if(options.data instanceof FormData) {
            if(isIEBrowser()) {
                options.data.append(selectedCustomerParam, selCustomerID);
                options.data.append(selectedRegionParam, selRegionID);
            }
            else {
                options.data.set(selectedCustomerParam, selCustomerID);
                options.data.set(selectedRegionParam, selRegionID);
            }
        }
        else if(typeof options.data === 'object') {
            options.data = $.extend({}, options.data, {selectedCustomerParam: selCustomerID,selectedRegionParam: selRegionID});
        }
    });
}
function getCustomerDetails(customerID, regionID){
    var customerName,probeName;
    var mspCustomerNameList = JSON.parse(JSON.stringify(window.OPM.mspCustomerNameList));
    var probeList = [];
    mspCustomerNameList = mspCustomerNameList.map(function(obj) {
        delete obj.isSelected;
        if (obj.CustomerID == customerID) {
            customerName = obj.CustomerName;
            obj.isSelected = 'active'; //No I18n
            obj.ProbeInfo = obj.ProbeInfo.map(function(val) {
                delete val.selected;
                if (val.RegionID == regionID) {
                    probeName = val.ProbeDisplayName;
                    val.selected = 'active';
                }
                return val
            });
        }
        probeList = obj.probeInfo;
        return obj;
    });
    window.OPM.mspCustomerNameList = JSON.parse(JSON.stringify(mspCustomerNameList));
    mspCustomerSetup(customerID,regionID);
    Ember.run.schedule('afterRender', function() { //No I18n
        Ember.set('OPMClient.ApplicationController.mspCurrentScopeList', mspCustomerNameList); //No I18n
        Ember.set('OPMClient.ApplicationController.selCustomerName', customerName); //No I18n
        Ember.set('OPMClient.ApplicationController.selProbeName', probeName);//No I18n
        Ember.set('OPMClient.ApplicationController.ProbeInfo', probeList);//No I18n
    });
    return [customerName,probeName];
}


function changeCustomerIDSession(customerID) {
    sessionStorage.setItem('selectedCustomerID', customerID);//No I18N
}

function changeUrlOnMessage(messageData){
    var url = messageData.url.toLowerCase();
    var currentUrl = window.location.href.toLowerCase();
    var windowOrigin = window.location.origin.toLowerCase();
    if(currentUrl === url) {
        mspContextChange({targetName: OPMClient.ApplicationController.currentPath});
    }
    else if(url.indexOf(windowOrigin) > -1 || url.indexOf(windowOrigin) > -1){
        window.location.href = messageData.url;
    }
}

function setMspCustomerID(custID){
    $(".AllColCombo option[value='"+custID+"']").prop('selected',true);//No I18N
    $(".AllColCombo").select2();
    window.OPM.selCustomerID = custID;//No I18N
    sessionStorage.setItem("selectedCustomerID", custID); //NO I18N
    mspCustomerSetup(custID);
}

function isNotMspAdmin() {
    return window.OPM.isMSPCentral && (window.OPM.mspUserType === 'Customer' || !window.OPM.isAuthorized); //No I18n
}

function validateRMMUrl(url, name, features) {
    var urlConfig = {include: ["apiclient/ember/index.jsp"], exclude: ['dbQuery.jsp','googleMap.jsp']};    //No I18N
    if(urlConfig.exclude.filter(function(value) {return url.indexOf(value) > -1}).length > 0){
        return false;
    }else if(urlConfig.include.filter(function(value) {return url.indexOf(value) > -1}).length > 0){
        return true;
    }else{
        return false;
    } 
}

function appendCusIDForExternal(url) {
    var include = ['EmbedEnhancedGraph']
    if(url.indexOf(window.OPM.apiUrlPattern) > -1 || include.filter(function(value) {return url.indexOf(value) > -1}).length > 0) {
        if(url.indexOf('?') < 0) {
            url += '?'+ window.OPM.selCustomerParam + '=' + window.OPM.selCustomerID;
        }
        else {
            url += '&'+ window.OPM.selCustomerParam + '=' + window.OPM.selCustomerID;
        }
        url += '&'+ window.OPM.selRegionParam + '=' + window.OPM.selRegionID;
    }
    return url;
}

//ONLY USE THIS FUNCTION FOR MANUAL DROPDOWN CHANGES, DO NOT CHANGE MANUALLY BY REFERRING THE ELEMENT
function modifyMSPCustomerSelector(customerID, isEnabled, changeSession, showAllCustomers, changeCustomerAjax, regionID) {
    enableDisableMspSelector(isEnabled);
    if(changeSession) {
        changeCustomerIDSession(customerID);
    }
    if(changeCustomerAjax) {
        mspCustomerSetup(customerID, regionID);
    }
    if(window.OPM.isRMMCentral) {
        if(customerID != "-1") {
            Ember.set('OPMClient.ApplicationController.hideRMMprobe', false);//No I18n
        }
        var dataToPostMessage = {name:"customer_filter_segmentation_data_from_opm", message:{isDisableFilter: !isEnabled, isSegmented: !showAllCustomers, opmanagerCustomerID: customerID, messageFromOp: 'OPMANAGER'}}; //No I18N
        window.MESSAGE_HANDLER.postMessage(dataToPostMessage, 'selfcast'); //No I18n
    }
}

function customerIDTempChange(customerID) {
    window.OPM.selCustomerID = customerID;
}

function customerIDRevertPrevious() {
    window.OPM.selCustomerID = sessionStorage.getItem("selectedCustomerID"); //NO I18N
}

function rmmHandleNewTab(event) {    //mouse event function
    var targetElement = event.target;
    var parentElement = targetElement.parentElement;
    var dataToPostMessage = null;
    var targetHref = null;
    var targetDoc = null
    var pathUrl = "apiclient/ember/index.jsp" //No I18n
    var rmmParentUrl = window.OPM.rmmParentUrl;
    if(targetDoc = (targetElement.tagName == "A" ? targetElement : parentElement ? (parentElement.tagName == "A" ? parentElement : parentElement.parentElement ? (parentElement.parentElement.tagName == "A"?parentElement.parentElement:false):false):false)){
        if(targetHref = validateRMMUrl(targetDoc.href)?targetDoc.href:false){
            if(event.type == "mousedown"){
                if(event.which == 1 && !event.ctrlKey){
                    if(targetHref.indexOf(rmmParentUrl) > -1){
                        targetDoc.href = targetHref.replace(rmmParentUrl + pathUrl, '');
                        targetHref = targetDoc.href;
                    }
                }else if(event.which == 3 || (event.which == 1 && event.ctrlKey)){
                    if(!targetHref.indexOf(rmmParentUrl) > -1){
                        targetDoc.href = this.checkAndConcat(rmmParentUrl , pathUrl + targetHref.split(pathUrl)[1]);  //To send only pathname
                        targetHref = targetDoc.href;
                    }
                }
            }
            if(targetDoc.target == "_blank"){
                event.preventDefault();
                if(event.type == "mouseup"){
                    var origin = window.location.origin;
                    var href = targetHref.split(pathUrl)[1];
                    href = pathUrl + href;  //To send only pathname
                    dataToPostMessage = { name: "load_into_new_tab_from_opm", message: { href: href, origin: origin } }; //No I18N
                }
            }else{
                dataToPostMessage = { name: "click_event_from_opm", message: null }; //No I18N
            }
        }else if(event.which == 1){
            dataToPostMessage = { name: "click_event_from_opm", message: null }; //No I18N
        }else{
            dataToPostMessage = { name: "click_event_from_opm", message: null }; //No I18N
        }
    }else{            
        dataToPostMessage = { name: "click_event_from_opm", message: null }; //No I18N
    }
    if(event.type == "mouseup"){
        window.MESSAGE_HANDLER.postMessage(dataToPostMessage, "selfcast") //No I18N
    }
}

function checkAndConcat(firstUrl, secondUrl) {
    var returnUrl = null;
    if(firstUrl[firstUrl.length - 1] === "/"){
        if(secondUrl[0] === "/"){
            returnUrl = firstUrl + secondUrl.substring(1);
        }else{
            returnUrl = firstUrl + secondUrl;
        }
    } else{
        if(secondUrl[0] === "/"){
            returnUrl = firstUrl + secondUrl;
        }else{
            returnUrl = firstUrl + "/" + secondUrl;
        }
    }
    return returnUrl;
}

function postDisabledProbeStatusToRMM() {
    var disabledProbeList = window.OPM.customerNameList.map(function(obj) {
        return !obj.CustomerStatus ? {id: obj.CustomerID, reason: Ember.I18n.t("webclient.msp.probe.disabled")} : '';  //No I18N
	}).filter(function(customer) { return customer !== ''});
    window.MESSAGE_HANDLER.postMessage({name:"customer_details_array_to_be_disabled_from_opm", message:{opmanagerCustomerID: disabledProbeList}}, "selfcast"); //No I18N
}

function updateCustomerValues(customerID,regionID)
{
    if(customerID!==undefined)
    {
        window.OPM.selCustomerID = customerID;
        sessionStorage.setItem('selectedCustomerID', customerID);//No I18N
		if(customerID == -1) {
			regionID = -1;
		}
    }
    if(regionID!==undefined)
    {
        window.OPM.selRegionID = regionID;
        sessionStorage.setItem("selectedRegionID", regionID);//No I18N
		window.OPM.isProbeSelected = regionID != -1 && window.OPM.selCustomerID != -1;
    } else {
		window.OPM.isProbeSelected = false;
	}   
}

function updateCustomerRegionAjaxOnly(customerID,regionID) {
    if(customerID!==undefined)
    {
        window.OPM.selCustomerID = customerID;
    }
    if(regionID!==undefined)
    {
        window.OPM.selRegionID = regionID;
	}   
}

function nfa_setMSPCustomerIDRegionID(devID) {
	var deviceID = parseInt(devID), customerID = sessionStorage.getItem("selectedCustomerID"), regionID = sessionStorage.getItem("selectedRegionID"); //NO I18N
	
	if(!isNaN(deviceID) && deviceID > 0 && window.OPM.isMSPCentral) {
		//calculating region ID from NFA device ID
		regionID =  ((parseInt(deviceID/10000000000)*10000000000)+1).toString();

		if(window.OPM.mspRegionIDCustomerIDMap === undefined || window.OPM.mspRegionIDCustomerIDMap[regionID] === undefined) {
			nfa_loadRegionIDCustomerIDMap();
		}

		if(window.OPM.mspRegionIDCustomerIDMap[regionID] !== undefined) {
			customerID = window.OPM.mspRegionIDCustomerIDMap[regionID];
		}
	}

	OPMClient.InventoryNFAController.nfaMSPCustomerID = customerID;
	OPMClient.InventoryNFAController.nfaMSPRegionID = regionID;
	updateCustomerRegionAjaxOnly(customerID, regionID);
}

function nfa_loadRegionIDCustomerIDMap() {
	window.OPM.mspRegionIDCustomerIDMap = {};
	var customerDetails = window.OPM.customerNameList, probeDetails, tempRegionID;
	for(var i=0, len1=customerDetails.length; i<len1; i++) {
		probeDetails = customerDetails[i].ProbeInfo;
		for(var j=0, len2=probeDetails.length; j<len2; j++) {
			tempRegionID = probeDetails[j].RegionID;
			window.OPM.mspRegionIDCustomerIDMap[tempRegionID] = customerDetails[i].CustomerID;
		}
	}
}

function nfa_isMSPNFASnapshot() {
	//the value will be returned true for NFA snapshots in All Customer and All Probes view in MSP Central
	if(OPMClient.InventoryNFAController !== undefined && OPMClient.InventoryNFAController.isNFASnapshot && window.OPM.currentView !== undefined && window.OPM.currentView.name !== undefined && (window.OPM.currentView.name).indexOf("Inventory.Device") > -1 && window.OPM.isMSPAllCustomerOrAllProbeSelected) { //NO I18N
		return true;
	}
	return false;
}
