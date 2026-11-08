function isIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var trident = ua.indexOf("Trident/");
    return (msie > -1 || trident > -1);
}

if(isIE()) {
    if (!location.origin) {
      location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
    }
    location.href = location.origin + "/BrowserNotSupported.html";
}

sessionStorage.clear();
localStorage.removeItem("selectedProbe");//No I18N
var webConsoleOpened = 'Yes'; //No I18N
if(isRMMEdition && isMSPCentral) {
    if(window.self === window.top) {
        window.location.href= '/html/redirect_rmm.html';
    }
    else {
        window.parent.postMessage({
            "key": "uems_listener_AA" + "__" + new Date().getTime() + "__" + Math.floor((Math.random() * 100000)), //NO I18N
            "data": { //NO I18N
                'name': 'opm_session_expired', //NO I18N
                "message": null //NO I18N
            },
            "type": "selfcast" //NO I18N
        }, "*");
    }
}
function closeAdBanner()
{    
    if(loginAdID!==undefined){
        $.ajax({        
            url:  "/servlets/SettingsServlet?DISABLE_CURRENT_AD="+loginAdID+"&sid="+Math.random(),//No I18N
            type: "POST",//No I18N        
            dataType: "html",//No I18N        
            success: function(response){
                $('.eventbanner').hide();
            }
        });
    }
}
function redirectAdBanner()
{
    if(hyperLink!=undefined){
    window.open(hyperLink,'_blank');
    }   
}
function loadAdBanner(userCountryName)
{
    var url = "/servlets/SettingsServlet?"; //No I18N
    var dataParams="GetLoginAd="+userCountryName+"&cookieUpdate=true&cookieName=CountryName&cookieValue="+userCountryName+"&cookieExpiry=30";//No I18N
    $.ajax({
        url: url,
        type: "POST",//No I18N
        dataType: 'json',//No I18N
        async: true,
        data:dataParams,
        success: function(jsonData)
        {
            adPath=jsonData.adPath;
            adText=jsonData.adText;
            hyperLink=jsonData.hyperLink;
            loginAdID=jsonData.loginAdID;
            if(adPath!==undefined){
                 $("#adImageDiv").show();
                 $("#adImagePath").attr("src",adPath); //No I18N
            }else if(adText!==undefined){
                $("#adTextDiv").show();
                $("#adTextDiv .eventContent").text(adText);
            }
        }
    });
            
}

function updateWebConsoleOpenStatus()
{
    var url = "/servlets/SettingsServlet?"; //No I18N
    var dataParams="WebConsoleOpened="+webConsoleOpened; //No I18N
    $.ajax({
        url: url,
        type: "POST",//No I18N
        dataType: 'text',//No I18N
        async: true,
        data:dataParams
    });
}
// Escape a string for HTML interpolation.
function escapeHTML(string) {
    var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
    };
    // Regex containing the keys listed immediately above.
	var htmlEscaper = /[&<>"'\/]/g;
	return ('' + string).replace(htmlEscaper, function(match) {
		return htmlEscapes[match];
	});
};

function checkLoginCustomized()
{
    if(loginBgValue!=="null" && loginBgValue!=="false")
    {
        $('body').addClass('loginBgCustomized');
        if(loginBgValue === "customColor")
        {
            $('body').css({'background':'#'+loginBgColor});//No I18N
        }
        else
        {
            $('body').css({'background':"url("+fluidicFolderPath+"img/login/login-bg.png?_="+Date.now()+") no-repeat center/100%"});//No I18N
        }
    }
    if(showCopyRight==="off"){
        $(".loginFooter").css({'display':'none'});//No I18N
    }
       
    
    loginBannerMessage = loginBannerMessage.replaceAll('\\n','\n');//No I18N
    if(showLoginBanner === 'true'){
        $('#mobileAppHolder').hide();
        $('body').addClass('loginBanner');
        $('#loginMessageBanner').show();
        $('#loginBannerValue').html(escapeHTML(loginBannerMessage));
        if($('.loginWarnMsg').height()  >= 60){
            $('.loginWarnMsg').addClass("extended");
        }
        if(radiusUserEnabled === 'true' || enableADAuth === 'true') {
            $('body').addClass('ADlogin');
        }
    }
}
var userCountryName="ALL"; //No I18N
var $zoho=$zoho || {};
$zoho.salesiq = $zoho.salesiq || {values:{},
   ready:function(embedinfo)
   {
   $zoho.salesiq.floatbutton.visible("hide");  //No I18N 
   $zoho.salesiq.visitor.getGeoDetails();  
   }
   };
var d=document;
s=d.createElement("script");
s.type="text/javascript";
s.id="zsiqscript";
s.defer=true;
s.src="https://salesiq.zohopublic.in/widget?wc=siq7bc51af3788230d6ba3379cd287c795c89d39dbbd856ea05a117f18eaa416445";
t=d.getElementsByTagName("script")[0];
t.parentNode.insertBefore(s,t);
d.write("<div id='zsiqwidget'></div>");   
$zoho.salesiq.afterReady = function(info) { 
       userCountryName=info.Country;
       loadAdBanner(userCountryName);
} 
function selectADLogin()
{
    //New Mickey's Authenticator for both linux and windows
    if(document.loginForm.AUTHRULE_NAME!==undefined){
    document.loginForm.AUTHRULE_NAME.value="LDAPAuthenticator"; //No I18N
    $('#domainNameDiv').attr({
        name:'domainName', //No I18N
        value:document.loginForm.domainNameAD.value
    });
}

}
function selectLocalLogin()
{

    //var placeholder = document.loginForm.domainNameAD.value;
    $(".forgotPassword").hide();
    if(document.loginForm.AUTHRULE_NAME!==undefined && (document.loginForm.domainNameAD === undefined || document.loginForm.domainNameAD.value === undefined || document.loginForm.domainNameAD.value === "Authenticator"))
    {
        document.loginForm.AUTHRULE_NAME.value="Authenticator"; //No I18N
        $('#domainNameDiv').removeAttr('name value'); //No I18N
        $(".forgotPassword").show();
    //  placeholder ="<fmt:message key='webclient.admin.adauthentication.localAuthentication'/>";
    }
    else if(document.loginForm.AUTHRULE_NAME!==undefined && document.loginForm.domainNameAD.value == "radiusUserLogin")
    {
        document.loginForm.AUTHRULE_NAME.value="RadiusAuthenticator"; //No I18N
    //  placeholder ='<fmt:message key="webclient.admin.usermanagement.radius"/>';
    $('#domainNameDiv').attr({
        name:'domainName', //No I18N
        value:'RADIUS' //No I18N
    });
    }
    else 
    {
        selectADLogin();
    }
    //   placeholder = placeholder+' '+'<fmt:message key="webclient.login.username"/>';
        //$('#userName').attr('placeholder',placeholder);//No I18N
}
detectOSnBrowser();
WindowHtWd();
function WindowHtWd(){
    var wHt=$(window).height();
    if(wHt<='939' && $('.eventbanner').offset()!==undefined){
        var topPos='-'+$('.eventbanner').offset().top+'px';//No I18N
        $('.eventbanner').css({top:topPos});
    }
}



//ignorei18n_start
$(document).ready(function()
{
    if($('#domainDiv').length==1){
        $('#LoginDiv').addClass('domainField');
    }
    if(isRMMEdition) {
        $(".inputFieldCol .opmCheckBox").hide();//No I18N
    }
    $('.select2').select2({minimumResultsForSearch:-1});
    var ieDetails = IeVersionCheck();
    if (ieDetails.IsIE && ieDetails.TrueVersion < 10) {
        if(ieDetails.TrueVersion <= 7) {
            $('body').addClass('ie7');
        }
        doIEHandling(true);
    } else if (ieDetails.IsIE && ieDetails.CompatibilityMode && ieDetails.ActingVersion < 10) {
        doIEHandling(true, true);
        if(ieDetails.ActingVersion <= 7) {
            $('body').addClass('ie7');
        }
    } 
    else {
        doIEHandling(false);
        var loginAdsContent = "";
        var loginPagingContent=""
        var cnt=1;
        var scrWidth = 0;
        var play;
        //collect images path from ZOHO Creator
        if(showAds)
			{
            jQuery.getJSON("https://creatorexport.zoho.com/showJson.do?sharedBy=networkmonitor&appLinkName=inside-opmanager&viewLinkName=Login_Ads_New_Webclient_Report&fileType=json&callback=?",
            function(data)
            {
                for(i=0; i< data['Login_Ads_New_Webclient'].length; i++)
                {
                    //alert(data['Login_Ads'][i]['Locale']);
                    if(language == data['Login_Ads_New_Webclient'][i]['Locale'])
                    {
                    var adTargetUrl = data.Login_Ads_New_Webclient[i].Ad_Target_URL;
                    var adImageUrl = data.Login_Ads_New_Webclient[i].Ad_Image_URL;
                    var adTitle = escapeHTML(data.Login_Ads_New_Webclient[i].Ad_Title);
                    var isValidUrl = /^https?:\/\//i; //No I18N
                    if(isValidUrl.test(adTargetUrl) && isValidUrl.test(adImageUrl)) {
                    loginAdsContent += "<a href='"+escapeHTML(adTargetUrl)+"' title='"+adTitle+"' target='_blank' ><img src='"+escapeHTML(adImageUrl)+"' border=0; alt='"+adTitle+"'  style='padding:0 10px 0 5px;'/></a>";
                    }
                    //loginPagingContent+='<a href="#" rel="'+cnt+'"></a>';
                    cnt+=1;
                    }
                }
                $("#folio_block").html(loginAdsContent);
                $("#folio_block").show();
                $("#opmDftLogo").hide();
            });
        }
         $('#frmTleRightlinksclick').click(function(){
            $("#loginFirst").slideDown(1000);
            $("#userName").val("admin");
            $("#password").val("admin");
            $("select[name=domainNameAD]").val("NULL");
            $("input[name=authType]").val("localUserLogin");
            $("#errorDiv").hide();
        });
        if(isDemoUser !== null && isDemoUser==='true' && isOPM !== true && isOPMPLUS !== true && isNFA !== true && isNCM !== true && isFWA !== true && isOPUtils !== true)
        {
            $('#btnSubmit').click();
        }

    }
        if(isDemoUser !== 'true')
    {
        //POST LOAD PAGE STRUCTURE HANDLING (Not for demo)
        if(typeof isTFAPage === "undefined") {
            $(".oneTimePasswordBox").remove();
            $('.getEmailBox').remove();
        }
        checkLoginCustomized();
        $("#domainDiv select").select2();
        if(isSAMLEnabled && isOtherAuthDisabled) {
            $(".opmLoginBox").addClass("fromLoginLocally");
        }
        if(login_status !== null) {
            if(saml_err !== null) {
                showLoginOption(true);
            }
            else {
                showLoginOption(false);
            }
            $(".opmLoginBox").addClass("InvalidUsername");
        }
        if(radiusEnabled === null && winDomains === null) {
            $(".loginPopUp").addClass("WithOutAuthenticationDropDown");
        }
        if(forgotPassRedirect === "true") {
            showForgotPassword();
        }
    }

    if(isDemoUser !== 'true' || ( isOPM !== true && isOPMPLUS !== true && isNFA !== true && isNCM !== true && isFWA !== true && isOPUtils !== true))
    {
        $(document).ready(function() { loginFromCookie(); });
    }
    //WebConsoleOpened status update should always in last line of document.ready
    updateWebConsoleOpenStatus();

    setincheckbox();
    selectLocalLogin();
	
					
    if(apmURL!=="" && (apmURL.startsWith("http") || apmURL.startsWith("https"))){
        //document.write('<iframe src="'+apmURL+'" width="0" height="0" tabindex="-1" title="empty" class="hidden" style="display:none;"></iframe>');
    }
});

    

//Start Slider close button show hide
function makeCloseBtShow()
{
$("#sliderClosebt").show();
}
function makeCloseBtHide()
{
$("#sliderClosebt").hide();
}
// Start Close Slider Image
function closeSliderImage()
{
    if ($("#folio_block").css('display') == 'block')
    {
        clearInterval(play); //Stop the rotation
        $("#opmDftLogo1").show();
        $("#folio_block").hide();
        $('.loginPaging').hide();
        //$('#sliderClosebt').hide();
        //$('div.hdrMnuUnSelectBG.selected').removeClass('selected');//No I18N
        $('div.sliderClosebt').addClass('selected');                  //No I18N
        $('div.sliderClosebtTxt').html('<fmt:message key="webclient.loginpage.show.ad"/>');
        $.ajax({
         url: "/LoginPage.do",          //No I18N
         data: "ShowAds=false",
         cache: false,
         success: function(response) {
           }
    });
    }
    else
    {
        $("#opmDftLogo1").hide();
        $("#folio_block").show();
        $('.loginPaging').show();

        $('div.sliderClosebt.selected').removeClass('selected');//No I18N
        //$('div.sliderClosebt').addClass('sliderClosebt');
        $('div.sliderClosebtTxt').html('<fmt:message key="webclient.loginpage.close.ad"/>');
        //clearInterval(play); //Stop the rotation
        //rotate(); //Trigger rotation immediately
        //rotateSwitch(); // Resume rotation
        $.ajax({
         url: "/LoginPage.do",          //No I18N
         data: "ShowAds=true",
         cache: false,
         success: function(response) {
           }
    });

    }

}

//Start Slider loading JS function
function loadSliderImage()
{
    $("#loader").hide();

    $(".loginPaging").show();
    $(".loginPaging a:first").addClass("active");

    var imageWidth = $(".window1").width();
    var imageSum = $(".image_reel img").size();
    var imageReelWidth = imageWidth * imageSum;

    $(".image_reel").css({'width' : imageReelWidth});

//Paging + Slider Function
    rotate = function(){
        var triggerID = $active.attr("rel") - 1; //Get number of times to slide
        var image_reelPosition = triggerID * imageWidth; //Determines the distance the image reel needs to slide

        $(".loginPaging a").removeClass('active'); //Remove all active class
        $active.addClass('active'); //Add active class (the $active is declared in the rotateSwitch function)

//Slider Animation
        $(".image_reel").animate({
            right: -image_reelPosition
        }, 500 );

    };

//Rotation + Timing Event
    rotateSwitch = function()
    {
        play = setInterval(function(){ //Set timer - this will repeat itself every 3 seconds
            $active = $('.loginPaging a.active').next();
            if ( $active.length === 0) { //If paging reaches the end...
            //  $active = $('.loginPaging a:first'); //go back to first
            }
            rotate(); //Trigger the paging and slider function
        }, 10000); //Timer speed in milliseconds (3 seconds)
    };

    rotateSwitch(); //Run function on launch

//On Hover
    $(".image_reel a").hover(function() {
        clearInterval(play); //Stop the rotation
    }, function() {
        rotateSwitch(); //Resume rotation
    });

//On Click
    $(".loginPaging a").click(function() {
        $active = $(this); //Activate the clicked paging
        //Reset Timer
        clearInterval(play); //Stop the rotation
        rotate(); //Trigger rotation immediately
        rotateSwitch(); // Resume rotation
        return false; //Prevent browser jump to link anchor
    });


//customize check box
    $(".checkBox,.checkBoxClear").click(function(srcc)
    {
        if ($(this).hasClass("checkBox"))
        {
            $(this).removeClass("checkBox");
            $(this).addClass("checkBoxClear");
        }
        else
        {
            $(this).removeClass("checkBoxClear");
            $(this).addClass("checkBox");
        }
    });


//Start Setfocus
        $('input:text:first').focus();
        $('input:text').bind("keydown", function(e)
         {
            var n = $("input:text").length;

            if (e.which == 13)
            { //Enter key
              e.preventDefault(); //Skip default behavior of the enter key
              var nextIndex = $('input:text').index(this) + 1;
                  if(nextIndex < n-1)
                  {
                    $('input:text')[nextIndex].focus();
                  }
                  else
                  {
                    $('input:text')[nextIndex-1].blur();
                    $('#btnSubmit').click();
                  }
            }
          }); 
}
function IeVersionCheck() {
    var value = {
        IsIE: false,
        TrueVersion: 0,
        ActingVersion: 0,
        CompatibilityMode: false
    };

    //Try to find the Trident version number
    var trident = window.navigator.userAgent.match(/Trident\/(\d+)/);
    if (trident) {
        value.IsIE = true;
        //Convert from the Trident version number to the IE version number
        value.TrueVersion = parseInt(trident[1], 10) + 4;
    }

    //Try to find the MSIE number
    var msie = window.navigator.userAgent.match(/MSIE (\d+)/);
    if (msie) {
        value.IsIE = true;
        //Find the IE version number from the user agent string
        value.ActingVersion = parseInt(msie[1]);
    } else {
        //Must be IE 11 in "edge" mode
        value.ActingVersion = value.TrueVersion;
    }

    //If we have both a Trident and MSIE version number, see if they're different
    if (value.IsIE && value.TrueVersion > 0 && value.ActingVersion > 0) {
        //In compatibility mode if the trident number doesn't match up with the MSIE number
        value.CompatibilityMode = value.TrueVersion != value.ActingVersion;
    }
    return value;
}
//Start Browser checking for IE
function doIEHandling(notSupportedIE, iscompatibilityMode)
{
    var objref = document.getElementById('ie6_statusmsg');
    //if(jQuery.browser.msie && jQuery.browser.version=="6.0")
     if(notSupportedIE)
     {
        document.getElementById("form1").style.display = 'none';
        document.getElementById("browserNotSupportDiv").style.display = 'block';
        if(iscompatibilityMode) {
            $('.browserNotSupportClass').hide();
        } else {
            $('.compatibilityModeClass').hide();
        }
        webConsoleOpened = 'No-IEInCompatibility';
     }
     else
     {
        $('#authenticationDiv').css({left:'0',opacity:'1'});
        $('#forgotPasswordDiv').css({left:'100%',opacity:'0'});

        //document.getElementById("loginHolderdisable").style.display="none";
        if(objref!==null){
        objref.style.display = 'none';
        }
     }
}
// ignorei18n_end
