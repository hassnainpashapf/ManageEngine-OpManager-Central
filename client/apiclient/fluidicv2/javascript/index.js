function setProductType(productType) {
        document.getElementById('productType').value=productType;
        document.frm.submit();
    }
function isIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var trident = ua.indexOf("Trident/");
    return (msie > -1 || trident > -1);
}
function itomUpdateWS(obj)
{
    sessionStorage.setItem("wsId",obj.wsId); //No I18N
}
             var websocket;
             var wsProtocol;
callbacks={};
previousValue ="";
arcOver = d3.arc()
.innerRadius(0)
.outerRadius(120 + 15);
arcOverundo = d3.arc()
.innerRadius(0)
.outerRadius(120 );
$(document).ready(function()
{
    if(websocket !== undefined && websocket.readyState !== WebSocket.CLOSED)
    {
        console.log("WebSocket is already opened.");
            return;
    }

    wsProtocol = 'ws://'; //NO I18N
    if(location.protocol === 'https:')
    {
      wsProtocol = 'wss://'
    }
    websocketConnection();
});

// WebSocket related Activities Starts
function websocketConnection(){
    // Close existing connection if any to prevent duplicates
    if (websocket) {
        if (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING) {
            console.info("Closing existing WebSocket before creating new connection"); //NO I18N
            websocket._isIntentionalClose = true; // Mark this specific instance for intentional closing
            websocket.close();
        }
    }
    console.info("Creating new websocket connection..."); //No I18n
    // Creating a New Websocket Connection
    var webSocketURL = wsProtocol+location.hostname+(location.port ? ':'+location.port: '');
	websocket = new WebSocket(webSocketURL+"/PNSHandler"); //NO I18N
	websocket.onopen = function(evt) { onOpen_OPMWS(evt) };
	websocket.onclose = function(evt) { onClose_OPMWS(evt) };
	websocket.onmessage = function(evt) { onMessage_OPMWS(evt) };
	websocket.onerror = function(evt) { onError_OPMWS(evt) };
}

function onOpen_OPMWS(evt)
{
    console.info("WebSocket connected."); //NO I18N
    isReconnecting = false;
    
    // Clear any previous stable timer to prevent it from resetting the counter prematurely
    if (stableConnectionTimer) {
        clearTimeout(stableConnectionTimer);
    }
    if (reconnectAttempts > 0) {
        var stableConnectionDelay = 60000; // 1 minute
        // After a stable connection for 1 minute, reset the reconnect attempts counter.
        stableConnectionTimer = setTimeout(() => {
            console.info("WebSocket connection has been stable, resetting reconnect attempts counter."); //NO I18N
            reconnectAttempts = 0;
            stableConnectionTimer = null; // Clear the reference to the timer
        }, stableConnectionDelay);
    }

    if(window.OPM.disableWebSocketPingPong){
        console.info("onOpen_OPMWS :: PingPong check is disabled."); //NO I18N
    }else{
        // Invoking Client-Server reachability check on Websocket opening
        clientServerReachabilityCheck();
    }
}

var pingResponseReceived = false;
var heartbeatInterval, failureCheckInterval;
var failureCheckTimeout; // Track the setTimeout to prevent zombie timers
var fetchRetryTimeout; // Track the retry timer to prevent multiple pending retries
var isReconnecting = false; // Flag to prevent multiple reconnection attempts
var reconnectAttempts = 0; // Counter for reconnection attempts
var stableConnectionTimer = null; // Timer to reset reconnect attempts after stable connection

// Common function to clear all WebSocket timers
function clearAllTimers() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    if (failureCheckInterval) {
        clearInterval(failureCheckInterval);
        failureCheckInterval = null;
    }
    if (failureCheckTimeout) {
        clearTimeout(failureCheckTimeout);
        failureCheckTimeout = null;
    }
    if (fetchRetryTimeout) {
        clearTimeout(fetchRetryTimeout);
        fetchRetryTimeout = null;
    }
}

function clientServerReachabilityCheck() {
    console.info("Starting heartbeat check..."); //NO I18N
	var heartBeatIntervalPeriod = 10000;

    // Clear any existing timers to prevent zombie timers
    clearAllTimers();

	// Sending Client to Server request periodically
    heartbeatInterval = setInterval(() => {
            try {
                websocket.send("-"); //NO I18N
            } catch (error) {
                console.error("Heartbeat send error:", error); //NO I18N
            }
        }, heartBeatIntervalPeriod);

    var failureCount = 0;
	var failureCountThreshold = 3;

    // Delay the failure check slightly to allow the first response to arrive
    failureCheckTimeout = setTimeout(() => {
        // Guard: Check if cleared during delay (race condition protection)
        if (failureCheckTimeout === null) {
            return;
        }
        
        failureCheckInterval = setInterval(() => {
            if (pingResponseReceived) {
                pingResponseReceived = false;
                failureCount = 0;
            } else {
                console.warn("HeartbeatCheck :: No pong response received from the server within the last 10 seconds."); //NO I18N
                failureCount++;
                // Attempt reconnection after threshold failures
                if (failureCount >= failureCountThreshold) {
                    console.warn("HeartbeatCheck :: Ping-Pong failure count exceeded the threshold, triggering reconnect..."); //NO I18N
                    clearAllTimers(); // Stop all heartbeat activity
                    // Directly call onClose to ensure reconnection logic runs, as websocket.close() is unreliable offline.
                    onClose_OPMWS({ target: websocket, code: 'Heartbeat-Failure' }); //NO I18N
                    failureCount = 0;
                }
            }
        }, heartBeatIntervalPeriod);
        failureCheckTimeout = null; // Clear reference after interval is created
    }, heartBeatIntervalPeriod / 2);
}

function onClose_OPMWS(evt)
{
    console.warn("WebSocket disconnected. Code: " + evt.code); //NO I18n
    
    // Skip reconnection if this was an intentional close
    if (evt.target._isIntentionalClose) {
        console.info("onClose_OPMWS :: Previous open session is cleared."); //NO I18N
        return;
    }

    // Prevent multiple concurrent reconnection attempts
    if (isReconnecting) {
        console.info("onClose_OPMWS :: Reconnection already in progress, skipping."); //NO I18N
        return;
    }
    
	if(window.OPM.disableWebSocketPingPong){
        console.info("onClose_OPMWS :: PingPong check is disabled. Reconnect skipped."); //NO I18N
    }else{
        if (stableConnectionTimer) {
            clearTimeout(stableConnectionTimer);
        }
        isReconnecting = true;
        clearAllTimers();

        // New logic: Immediate first attempt, then 1-minute intervals.
        var delay = 0;
        if (reconnectAttempts > 0) {
            delay = 60000; // 1 minute for subsequent attempts
        }
        
        reconnectAttempts++; // Increment for the next cycle

        console.info("Reconnection attempt #" + reconnectAttempts + ". Retrying in " + delay + "ms"); //NO I18N
        
        setTimeout(() => {
            isReconnecting = false; // Reset the flag before attempting to connect
            websocketConnection();
        }, delay);
    }
}

function onMessage_OPMWS(event)
{
    if(event.data !== undefined)
    {
        var serverData = JSON.parse(event.data);
        // Periodic Response from Server to Client handling
        if (serverData["-"] === "-") {
            pingResponseReceived = true;
        }
        var functionName = Object.keys(serverData)[0];
        var functionArgs = serverData[functionName];
        if(window[functionName]) {
                window[functionName](functionArgs);
            }
    }
}

function onError_OPMWS(evt)
{
    console.error("WebSocket error occurred:", evt); //NO I18N
}
// WebSocket related Activities Ends

//window.onload=dwr.engine.setActiveReverseAjax(true);
try{
    // jQuery.browser is deprecated.
    // More details: http://api.jquery.com/jQuery.browser
    if(!$.browser){
        (function() {
            var matched, browser;
            jQuery.uaMatch = function( ua ) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                /(msie) ([\w.]+)/.exec( ua ) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                [];

                return {
                    browser: match[ 1 ] || "",
                    version: match[ 2 ] || "0"
                };
            };

            matched = jQuery.uaMatch( navigator.userAgent );
            browser = {};

            if ( matched.browser ) {
                browser[ matched.browser ] = true;
                browser.version = matched.version;
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if ( browser.chrome ) {
                browser.webkit = true;
            } else if ( browser.webkit ) {
                browser.safari = true;
            }

            jQuery.browser = browser;
        })();
    }
    setTimeout(loadApmResizingElements, 1);
}
catch(Err){

}
//checkForWebAlarms();
function loadApmResizingElements(){
    if(window.OPM.apmInstalled===true || window.OPM.apmInstalled==="true"){
        $.getScript('javascript/jquery.ba-postmessage.min.js'); //NO I18N
        $.getScript('javascript/IframeResize-parent.js');   //NO I18N
    }
}
    
    
$(document).ready(function()
{

    if(isIE()) {
        if (!location.origin) {
          location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
        }
        location.href = location.origin + "/BrowserNotSupported.html";
    }
});
// var websocket;
// var callbacks={};
// var previousValue ="";
// var arcOver = d3.arc().innerRadius(0).outerRadius(120+15);
// var arcOverundo = d3.arc().innerRadius(0).outerRadius(120);
// function isIE() 
// {
//     var ua = window.navigator.userAgent;
//     var msie = ua.indexOf("MSIE ");
//     var trident = ua.indexOf("Trident/");
//     return (msie > -1 || trident > -1);
// }
// function setProductType(productType)
// {
//     document.getElementById('productType').value=productType;
//     document.frm.submit();
// }
// function itomUpdateWS(obj)
// {
//     sessionStorage.setItem("wsId",obj.wsId); //No I18N
// }
// function loadApmResizingElements(){
//     if(window.OPM.apmInstalled===true || window.OPM.apmInstalled==="true"){
//         $.getScript('javascript/jquery.ba-postmessage.min.js'); //NO I18N
//         $.getScript('javascript/IframeResize-parent.js');   //NO I18N
//     }
// }

// function onOpen_OPMWS(evt)
// {
//     /*if(event.data !== undefined)
//     {
//         console.log(event.data);
//     }*/
// }
// function onClose_OPMWS(evt)
// {
//     console.log("DISCONNECTED");
// }
// function onMessage_OPMWS(event)
// {
//     if(event.data !== undefined)
//     {
//         var serverData = JSON.parse(event.data);
//         var functionName = Object.keys(serverData)[0];
//         var functionArgs = serverData[functionName];
//         window[functionName](functionArgs);
//     }
// }
// function onError_OPMWS(evt)
// {
//     console.log("WS ERROR>>>>>>>>>>>>>>>>>..");
// }
// try{
//     // jQuery.browser is depricated.
//     // More details: http://api.jquery.com/jQuery.browser
//     if(!$.browser)
//     {
//         (function() {
//             var matched, browser;
//             jQuery.uaMatch = function( ua ) {
//             ua = ua.toLowerCase();

//             var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
//                 /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
//                 /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
//                 /(msie) ([\w.]+)/.exec( ua ) ||
//                 ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
//                 [];

//                 return {
//                     browser: match[ 1 ] || "",
//                     version: match[ 2 ] || "0"
//                 };
//             };

//             matched = jQuery.uaMatch( navigator.userAgent );
//             browser = {};

//             if ( matched.browser ) {
//                 browser[ matched.browser ] = true;
//                 browser.version = matched.version;
//             }

//             // Chrome is Webkit, but Webkit is also Safari.
//             if ( browser.chrome ) {
//                 browser.webkit = true;
//             } else if ( browser.webkit ) {
//                 browser.safari = true;
//             }

//             jQuery.browser = browser;
//         })();
//     }
//     setTimeout(loadApmResizingElements, 1);
// }
// catch(Err){

// }
// $('#v2HtmlHolder').addClass("opmFullScreen");// No I18N
// window.OPM.oldView = true;
// $('#v2BodyHolder').addClass("NavText");//No I18N
// var hideAsideClass = window.OPM.isNCM ? "hideAsideClass ":""; // No I18N
// var menuAlignClass = hideAsideClass + 'horizontalView';//NO I18N
// $('#v2HtmlHolder').addClass(menuAlignClass);// No I18N
// if(window.OPM.isOPM){
//     $('#v2HtmlHolder').addClass(window.OPM.language+"_lang");//No I18N
//     if(window.OPM.isAuthorized && !window.OPM.isCustomer && !window.OPM.isCentralServer){
//         $('#v2HtmlHolder').addClass("invAddBtn");//No I18N
//     }
// }
// if(window.OPM.isOPUtils){
//     $('#v2BodyHolder').addClass("moduleUI OPUModuleUI");//NO I18N
// }
// $(document).ready(function()
// {
    
//     if(isIE())
//     {
//         if (!location.origin)
//         {
//             location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
//         }
//         location.href = location.origin + "/BrowserNotSupported.html";
//     }
//     if(websocket !== undefined && websocket.readyState !== WebSocket.CLOSED)
//     {
//         console.log("WebSocket is already opened.");
//         return;
//     }
//     var wsProtocol = 'ws://';//No I18N
//     if(location.protocol === 'https:')//No I18N
//     {
//         wsProtocol = 'wss://';//No I18N
//     }
//     var webSocketURL = wsProtocol+location.hostname+(location.port ? ':'+location.port: '');
//     websocket = new WebSocket(webSocketURL+"/PNSHandler");                //NO I18N
//     websocket.onopen = function(evt) { onOpen_OPMWS(evt) };
//     websocket.onclose = function(evt) { onClose_OPMWS(evt) };
//     websocket.onmessage = function(evt) { onMessage_OPMWS(evt) };
//     websocket.onerror = function(evt) { onError_OPMWS(evt) };

//     OPMClient.AppsApmDetailsController.apmPluginDownloadArchivesLink = 'https://archives3.manageengine.com/network-monitoring/opm-and-apm-plugin-170000'; //No I18N
//     if (window.OPM.apmInstalled === true)
//     {
//     //  alert(OPMClient.AppsApmDetailsController.apmInstalled);
//         OPMClient.AppsApmDetailsController.apmInstalled = true;
//         OPMClient.AppsApmDetailsController.apmBaseUrl = "<%=IAMEncoder.encodeJavaScript(apmBaseUrl)%>";//No I18N
//         OPMClient.AppsApmDetailsController.apmLogoutUrl = "<%=IAMEncoder.encodeJavaScript(apmBaseUrl)%>/Logout.do?showPreLogin=false"; //No I18N
//         OPMClient.AppsApmDetailsController.apmBuildNumber = window.OPM.apmBuildNumber;
//         OPMClient.AppsApmDetailsController.apmDownloadLink = Ember.I18n.t('webclient.addon.apmdownloadlink',this); //No I18N
//         OPMClient.AppsApmDetailsController.isAPMLoggedIn = false;

//         //isAuthTokenBasedAPMPlugin used for knowing APM was started or not. before 16210 it's possible to come true before APM started.
//         if(window.OPM.isAuthTokenBasedAPMPlugin){
//             document.write("<iframe src=\"/apiclient/ember/AppManagerSSO.jsp\" width=\"0\" height=\"0\" tabindex=\"-1\" title=\"empty\" style=\"display:none;\"></iframe>");
//             if(!(Number(window.OPM.apmBuildNumber) < 16210)){
//                 OPMClient.AppsApmDetailsController.isAPMLoggedIn = true;
//                 OPMClient.AppsApmDetailsController.loggedInDate = Number(Date.now());
//             }
//         }
//         if(localStorage.getItem('isAPMRunning') !== null){
//             localStorage.removeItem('isAPMRunning');//No I18n
//         }
//         //Handled for multiple tab refreshing case...
//         if(sessionStorage.getItem('isAPMRunning') !== null && window.OPM.apmPluginSyncStatus !== 'INIT_SYNC_SUCCESS'){
//             sessionStorage.removeItem('isAPMRunning');//No I18N
//         }
//     }
//     else
//     {
//         OPMClient.AppsApmDetailsController.apmInstalled = false;
//         if(window.OPM.language == 'ja_JP' || window.OPM.language == 'zh_CN'){
//             OPMClient.AppsApmDetailsController.apmDownloadLink = Ember.I18n.t('webclient.addon.apmdownloadlink',this); //No I18N
//         }
//         else
//         {
//             OPMClient.AppsApmDetailsController.apmDownloadLink = Ember.I18n.t('webclient.addon.apmdownloadlink',this)+"<%=apmDownloadUrl%>"; //No I18N
//         }
//         OPMClient.AppsApmDetailsController.apmSupportedApplicationsLink = Ember.I18n.t('webclient.addon.apmsupportedapplnlink',this)+"<%=apmDownloadUrl%>";//No I18N
//         OPMClient.AppsApmDetailsController.apmDemoLink = 'https://'+((window.OPM.isCentralServer || window.OPM.isProbe) ? 'eedemo' : 'demo')+'.appmanager.com/index.do?from_opm';//No I18N
//         OPMClient.AppsApmDetailsController.apmIndexLink =  Ember.I18n.t('webclient.addon.apmindexlink',this); //No I18N
//         if(('UNINSTALLED' === window.OPM.apmInstallationStatus) && (localStorage.getItem('isFreshAPMInstallation') !== null)){
//             localStorage.removeItem('isFreshAPMInstallation');//No I18n 
//         }
//     }
//     if(window.OPM.installedLanguage == "zh" && (window.OPM.isOPM && window.OPM.isOpmPlug)){
//         OPMClient.BVMapDetailsController.set('availRegionMap',true); //No I18N
//         lang = window.OPM.language;
//     }

//     if(window.OPM.isLiveChatEnabled && window.OPM.showLiveChat)
//     {
        var salesiqHost = "https://salesiq.zohopublic.in/widget";//No I18N
        if(window.OPM.language === "zh_CN"){                                
            salesiqHost = "https://salesiq.zoho.com.cn/widget";//No I18N
        }
//         var $zoho=$zoho || {};
//         $zoho.salesiq = $zoho.salesiq || {widgetcode:"<%=chatWidgetCode%>",values:{},ready:function(){}};//No I18N
//         var d=document;
//         s=d.createElement("script");
//         s.type="text/javascript";
//         s.id="zsiqscript";
//         s.defer=true;
//         s.src=salesiqHost;
//         t=d.getElementsByTagName("script")[0];
//         t.parentNode.insertBefore(s,t);
//         d.write("<div id='zsiqwidget'></div>");
//     }
// });
