$(document).on('click', '#remotectrl', function () {
  $('#wsinput').focus();
});
$('#wsinput').keypress(function (e) {
  var keycode = (e.keyCode ? e.keyCode : e.which);
  if (keycode == '13') {
    $('#cursorID').focus();
  }
});

var connectionErrorMessages = ["webclient.snapshot.testlink.devicedown", "webclient.testlinks.reasons.nocli", "webclient.testlinks.reasons.clitimeout"]; //No I18N
var errorTitle = "webclient.sshterminal.error.title"; //No I18N
function showErrorMessages(loginError) {
  $('#issueSubtitles').empty();
  $('#issueTitle').empty();
  $('#issueTitle').text(Ember.I18n.t(errorTitle));
  if(loginError) {
    connectionErrorMessages.splice(1,0,"webclient.testlinks.reasons.wrongdevicepassword"); //No I18n
  }
  connectionErrorMessages.forEach(function (value, index) {        
    $('#issueSubtitles').append("<li>" + Ember.I18n.t(value) + "</li>");//No I18N
  });
  $('.error').show();
}
function readCsrfToken(name)
{
  var ca = document.cookie.split(';');
  var nameEQ = name + "=";
  for(var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' '){
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0){
      return c.substring(nameEQ.length, c.length);
    }
  }
  return "";
}
function checkCliConnection(port, protocol) {
  if(port < 1 || port > 65535) {
    alert(Ember.I18n.t('webclient.admin.devicequery.invalidportnumber')); //No I18n
    return;
  }
  
  var ajaxRequestURL = window.OPM.apiUrlPattern + '/admin/checkCLIConnection';  //No I18N
  var requestType = "POST"; //NO I18n
  var data = {};
  data.port = port;
  data.protocol = protocol;
  if(isNCMTerminal) {
    ajaxRequestURL = window.OPM.apiUrlPattern + '/ncmdevice/checkCLIConnectionForCredentials';  //No I18N
      data.resourceId = resourceID;
      data.deviceType = deviceType;
      requestType = "GET"; //NO I18n
    if(port == undefined && protocol == undefined) {
      data.port = globalPort;
        data.protocol = globalProtocol;
    }
  }
  else {
    data.hostname = moName;
      data.dnsName = server;
  }
  var csrfCookie = readCsrfToken('opmcsrfcookie'); //No I18N
  if(csrfCookie){
    $.ajaxSetup({
      headers: {
        'X-ZCSRF-TOKEN':'opmcsrftoken=' + csrfCookie //No I18N
      }
    });
  }
  $.ajax({
    url: ajaxRequestURL,
    type: requestType,
    data: data,
    beforeSend: function () {
      $('.connecting').hide()
      $('.error').hide();
      $('.terminal').hide();
      $('main').removeClass('terminal-bg');
      $('.loading').show();
    },
    success: function (response) {
      $('.connecting').show();
      $('.loading').hide();
      if (response.error !== undefined) {
        if (response.error.message !== undefined) {
          showErrorMessages();
          $('#cliConnect').show();
        }
      }
      else {
        if(isNCMTerminal) {
          sshConn(response.port, response.protocol, response.auditID);
          }
          else if (response.port !== undefined && response.protocol !== undefined) {
            sshConn(response.port, response.protocol, null);
          }
          $('#portInput').hide();
          $('#protocolOption').hide();
          $('#cliConnect').hide();
          $('#connectedPort').show().text(response.port);
          $('#connectedProtocol').show().text(response.protocol);
          $('.terminal').show();
          $('main').addClass('terminal-bg');//No I18n
          if (!isIEBrowser() || /Edge/.test(navigator.userAgent)) {
            $('#wsinput').focus();
            $('main').css('padding-top','74px');//No I18n
            $('main .terminal').css('opacity','0.9');//No I18n
            $('#cursor').css('transform','none');//No I18n
            if(!noScrollTerminal) {
                $('main .terminal').css('overflow','scroll'); //No I18n
                $('main .terminal').css('height','100%'); //No I18n
            }
            $('html body').css('overflow','hidden'); //No I18n
          }
          else {                
            $('header').css('position', 'static'); //No I18N
          }
        }
      }
  });
}

function errorConnecting() {
  $('.error').show();
  $('#cliConnect').show();
  $('#connectedPort').hide();
  $('#connectedProtocol').hide();
  $('#portInput').show();
  $('#protocolOption').show();
  $('.terminal').hide();
  $('main').removeClass('terminal-bg');
}

function isIEBrowser() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  var trident = ua.indexOf('Trident/');
  var edge = ua.indexOf('Edge/');
  if (msie > 0) {
    return true;
  } else if (trident > 0) {
    return true;
  } else if (edge > 0) {
    return true;
  } else {
    return false;
  }
}

function sshConn(port, linuxprotocol, auditID) {
  var protocol = wsProtocol;
  var r;
  if(isNCMTerminal) {
      var ncmParams = "";
    if(auditID != null && deviceType != 'null') {
    ncmParams = "isNCMTerminal="+isNCMTerminal+"&auditID="+auditID+"&resourceID="+resourceID+"&deviceType="+deviceType;  //No I18N
  }
    if (linuxprotocol.toLowerCase() === "ssh") { 
         r = new svGlobal.SSH(protocol + location.host.split(":")[0] + ":" + rdpPort + "/SSH?port=" + port + "&protocol=SSH&fontSize=16&mapClipboard=on&" + ncmParams +"&" + globalParam, window.outerWidth, noScrollTerminal ? $('main').height() : 10000);// No I18N
      }
      else {
         r = new svGlobal.TELNET(protocol + location.host.split(":")[0] + ":" + rdpPort + "/TELNET?port=" + port + "&protocol=TELNET&fontSize=16&mapClipboard=on&" + ncmParams +"&" + globalParam, window.outerWidth, noScrollTerminal ? $('main').height() : 10000);// No I18N
      }
  }
  else {
    if (linuxprotocol.toLowerCase() === "ssh") {
      r = new svGlobal.SSH(protocol + location.host.split(":")[0] + ":" + rdpPort + "/SSH?port=" + port + "&fontSize=16&mapClipboard=on&" + globalParam, window.outerWidth,  noScrollTerminal ? $('main').height() : 10000);// No I18N
    }
    else {
      r = new svGlobal.TELNET(protocol + location.host.split(":")[0] + ":" + rdpPort + "/TELNET?port=" + port + "&fontSize=16&mapClipboard=on&" + globalParam, window.outerWidth,  noScrollTerminal ? $('main').height() : 10000);// No I18N
    }
  }
  r.addSurface(new svGlobal.LocalInterface());
  r.onloggedin = function (e) {

  }
  r.onerror = function (e) {
    errorConnecting();
    if (e.error === true) {
      $('#hi5_notifer_all').hide();
      if(e.name === '7' || e.name === '3000' || e.name === '3005' || e.name === '3006') {
        showErrorMessages(true);
        return;
      }
      $('#issueSubtitles').empty();
      $('#issueTitle').empty();
      $('#issueTitle').text(Ember.I18n.t('webclient.admin.profiledetails.error') + ':' + e.message); //No I18N
    }
  }
  r.run();
  if(!isIEBrowser() || /Edge/.test(navigator.userAgent)) {
    $('#wsinput').keyup(function (e) {
      $("#wsinput").css("position", "fixed"); //No I18N
      $('.terminal').scrollTop($("#cursorID").position().top - 350);
      e.stopPropagation();
    });              
  }
  else {
    document.getElementById('wsinput').addEventListener("keyup", function (e) {
      $("#wsinput").css("position", "fixed"); //No I18N          
      window.scrollTo(0, $("#cursorID").position().top - 350);
      e.stopPropagation();
    });
  }  
}

function submitCliTerminalDetails() {
  $("#wsinput").remove(); //No I18n
  checkCliConnection($("#portInput").val(), $("#protocolOption").val());
}

window.addEventListener("load", function (event) {
  if(noScrollTerminal) {
    $('#svHistoryDiv').show();//No I18N
    $('.terminal').addClass('noScrollTerminal');
  }
  else {
    $('#svHistoryDiv').hide();//No I18N
    $('.terminal').addClass('scrollTerminal');
  }  
  checkCliConnection();
});