function returnYesNo(sel,criteriaAll,len)
{
  var returnVal = "no"; //No I18N
  if(sel === true)
  {
    returnVal = "yes"; //No I18N
    if(criteriaAll === undefined || criteriaAll === true)
    {
       returnVal = "all"; //No I18N
    }
    else if (len > 0)
    {
       returnVal = "yes"; //No I18N
    }
  }
  return returnVal;
}

function validateScheduleSelection() 
{
  var curTime = new Date(window.OPM.jyear,window.OPM.jmon,window.OPM.jday,window.OPM.jhour,window.OPM.jmin,window.OPM.jsec);
  var timeStr = curTime.format(window.OPM.pattern);
  var msg = "Selected time is earlier than current server time "+timeStr+", please select a different time";  //No I18N

  if (String(schedSelectedTab) === "1") {
    var selectedDate = getDate($("#onceDate").val(), $("#onceHour").val(), $("#onceMin").val());
    if (selectedDate.getTime() < curTime.getTime()) {
      alert(msg);
      return false;
    }
  }
   else if (String(schedSelectedTab) === "2") {         //No I18N
    var selectedDate = getDate($("#dailyStartDate").val(), $("#dailyHour").val(), $("#dailyMin").val());
        if (selectedDate.getTime() < curTime.getTime()) {
          alert(msg);
          return false;
        }
    
  } else if (String(schedSelectedTab) === "3") {               //No I18N
    if ($("#weeklyDayCheBox input[type=checkbox]:checked").length === 0) {
      alert(Ember.I18n.t('webclient.general.selectatleastoneday',this));    //No I18N
      return false;
    }
  } else if (String(schedSelectedTab) === "5") {             //No I18N
    if ($("#yearlyMonthCheBox input[type=checkbox]:checked").length === 0) { 
       alert(Ember.I18n.t('webclient.general.selectatleastonemonth',this));    //No I18N
      return false;
    }
    if ($("#yearlyDate").val() !== "32" && !checkValidDay("yearlyMonthCheBox", "yearlyDate")) {
       alert(Ember.I18n.t('webclient.general.dayofmonthselexceed',this));  //No I18N
      return false;
    }
  } else if ($('input:radio[name="monthlyType"]:checked').val() === "5") {
    if ($("#monthlyDayCheBox input[type=checkbox]:checked").length === 0)
     {
        alert(Ember.I18n.t('webclient.general.selectatleastoneday',this));  //No I18N
      return false;
    }
  }
  return true;
}
function getDate(datePart, hourVal, minVal) {
  dateArray = datePart.split("-");
  date = new Date(dateArray[0], (dateArray[1] - 1), dateArray[2]);
  date.setHours(hourVal);
  date.setMinutes(minVal);
  return date;
}
function checkValidDay(eleName, eleName1) {
  var arr = [31,28,31,30,31,30,31,31,30,31,30,31];
  var date = $("#"+eleName1).val();
  var flag = false;
   $.each( $("#"+eleName+" input[type=checkbox]:checked"), function(key, val)
   {
     if (arr[val.value] >= date) {
        flag = true;
        return false;
     } 
  });
  return flag;
}

function validateCriteria() {
  
  var cnt = 0;
   $.each($("#rules input[type=checkbox]:checked"), function(key, val)
   {
      if(val.name !== "clearalarm" && val.name !== "notifySeverity")
      {
        cnt = cnt+1;
      }

   });
   if(cnt === 0 || $("#rules input[type=checkbox]:checked").length === 0)
  {
    opm_slideUpDownSet("deviceAssociateDiv",'none')//No I18N
    opm_slideUpDownSet("scheduleDiv",'none')//No I18N
    opm_slideUpDownSet("alarmtriggerDiv",'block')//No I18N
     alert(Ember.I18n.t('webclient.devices.selectcriteria',this));  //No I18N
      return false;
  }

  return true;
}

function validateTimeWindow()
  {
    var twoptionIs = $('input:radio[name="twoption"]:checked').val();
    if(twoptionIs  == "All")
    {
      return true;
    }
      
    var StartTime = $("#startHour").val()+":"+$("#startMinute").val();
    var EndTime = $("#endHour").val()+":"+$("#endMinute").val();
    if(StartTime === "")
    {
      alert(Ember.I18n.t('webclient.notiftimewindow.nofrmtime.alert',this));    //No I18N
      return false;
    }
    if(EndTime === "")
    {
      alert(Ember.I18n.t('webclient.notiftimewindow.noendtime.alert',this));      //No I18N
      return false;                   
    }
    if(StartTime.indexOf( ":") === -1)
    {
       alert(Ember.I18n.t('webclient.notiftimewindow.format.alert',this));    //No I18N
      return false;                   
    }
    if(EndTime.indexOf( ":") === -1)
    {
       alert(Ember.I18n.t('webclient.notiftimewindow.format.alert',this));    //No I18N
      return false;                   
    }
    // To compare two minute values, appending a dummy date (Ex: 01/01/2011) with that and converting it to milliseonds
    /*if(Date.parse('01/01/2011 '+StartTime) > Date.parse('01/01/2011 '+EndTime)) {
        alert(Ember.I18n.t("webclient.stvsendtime.validation",this)); //No I18N
        return false;
    }*/

    var startHour = StartTime.substring(0,StartTime.indexOf(":"));          
    var endHour = EndTime.substring(0,EndTime.indexOf(":"));          
    var startMinute = StartTime.substring(StartTime.indexOf(":")+1,StartTime.length);   
    var endMinute = EndTime.substring(EndTime.indexOf(":")+1,EndTime.length);     
    var sh = parseInt(startHour,10);
    var sm = parseInt(startMinute,10);
    var eh = parseInt(endHour,10);
    var em = parseInt(endMinute,10);
    if( startHour === "" || startMinute === "" || !isValidIntegerNumber(startHour) || !isValidIntegerNumber(startMinute) || !(sh <=23) || !(sm <= 59) )
    {
      alert(Ember.I18n.t('webclient.notiftimewindow.frmtime.alert',this));      //No I18N
      return false;                   
    }
    if(endHour === "" || endMinute === "" || !isValidIntegerNumber(endHour) || !isValidIntegerNumber(endMinute) || !(eh <=23) || !(em <=59))
    {
      alert(Ember.I18n.t('webclient.notiftimewindow.endtime.alert',this));      //No I18N   
      return false;                   
    }

    if($("#days input[type=checkbox]:checked").length === 0)
    {
      alert(Ember.I18n.t('webclient.notiftimewindow.selectadate',this));     //No I18N
      return false;    
    }
    return true;
                    
  }

  function isValidIntegerNumber(inpString)
  {
    if(/^[-+]?\d+(\\d+)?$/.test(inpString))
    {
    if(inpString>= 0)
    {
    return true;                        
    }        
    }
  return false;                       
  }

  function validateRecurring()
  {

    if($("#tcount").prop("checked") && !opm_isValidNumber(document.getElementById("triggerCount"), Ember.I18n.t('webclient.admin.notification.recurring.triggerCount',this)))
    { 
      return false;
    }
    if($("#delayInterval").val() !== "" && !opm_isValidNumber(document.getElementById("delayInterval"), Ember.I18n.t('webclient.admin.notification.recurring.delay',this)))
    {
      return false;
    }

    if($("#triggerInterval").val() !== "" && !opm_isValidNumber(document.getElementById("triggerInterval"), Ember.I18n.t('webclient.admin.notification.recurring.triggerinterval',this)))
    {
      return false;
    }
    return true;
  }

function showCriteriaLayer(criteria)
{
  var isAlreadyVisible = $("#"+criteria).is(":visible");
  if(isAlreadyVisible)
  {
    $("#"+criteria).hide();
  }
  else
  {
    $("#"+criteria).show();
    var colNames = [];
    var colModels = [];
    var defaultOptions = {"searchOption":true,"multiselect":true,"toggleSearch":false};//No I18N
    if(criteria === "ntservices")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/listWindowsServiceMonitors',function(jsonData)  //No I18n
      {
        colNames = [Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),'']; //No I18N
        colModels = 
        [
          { name: 'name', index: 'name'}, //No I18N 
          { name: 'serviceName', index: 'serviceName',hidden:true} //No I18N
        ];
        defaultOptions.sortName="name"; //No I18n
        if(Object.keys(jsonData).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
          var grid = $("#"+criteria+"List");
        var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.ntServices.ntServiceMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this));  //No I18n
        }
      });
    }
    else if (criteria === "files")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/showFileMonitorTemplates',function(jsonData)  //No I18n
      {
        colNames = [Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),'']; //No I18N
        colModels = 
        [
          { name: 'name', index: 'name'}, //No I18N 
          { name: 'serviceName', index: 'serviceName',hidden:true} //No I18N
        ];
        defaultOptions.sortName="name"; //No I18n
        if(Object.keys(jsonData).length !== 0 && jsonData.message === undefined)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
            var grid = $("#"+criteria+"List");
        var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.fileMonitors.fileMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this));  //No I18n
        }
      });
    }
    else if (criteria === "folders")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/showFolderMonitorTemplates',function(jsonData)  //No I18n
      {
        colNames = [Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),'']; //No I18N
        colModels = 
        [
          { name: 'templateName', index: 'templateName'}, //No I18N 
          { name: 'templateId', index: 'templateId',hidden:true} //No I18N
        ];
        defaultOptions.sortName="name"; //No I18n
        if(Object.keys(jsonData).length !== 0 && jsonData.message === undefined)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData.dtlsTemplate, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N

          var grid = $("#"+criteria+"List");
        var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.folderMonitors.folderMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
      });
    }
    else if (criteria === "services")
    {
        colNames = [Ember.I18n.t('webclient.admin.ruleaction.ntservices.name',this),'']; //No I18N
        colModels =
        [
          { name: 'name', index: 'name'}, //No I18N 
          { name: 'id', index: 'id',hidden:true} //No I18N
        ];

        defaultOptions.sortName="name"; //No I18n
        if(Object.keys(wrkflwInfoObj.criteria.criteriaProp.services.ServiceMonitors).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", wrkflwInfoObj.criteria.criteriaProp.services.ServiceMonitors, colNames, colModels, "", "#"+criteria+"Pager", criteria+"List",defaultOptions); //No I18N
          var grid = $("#"+criteria+"List");
        var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.services.ServiceMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
    }
    else if(criteria === "processes")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/listProcessTemplates',function(jsonData) //No I18n
      {
        colNames = [Ember.I18n.t('webclient.devices.details.processname',this),'']; //No I18N
        colModels = 
        [
          { name: 'displayName', index: 'displayName'}, //No I18N 
          { name: 'templateId', index: 'templateId',hidden:true} //No I18N
        ];
        defaultOptions.sortName="displayName"; //No I18n
        if(Object.keys(jsonData).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N


          var grid = $("#"+criteria+"List");
        var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.processMonitors.processMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });

        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
      });
    }
    else if(criteria === "eventlogs")
    {
      
        colNames = [Ember.I18n.t('webclient.admin.eventlog.configrule.rulename',this),'']; //No I18N
        colModels = 
        [
          { name: 'name', index: 'name'}, //No I18N 
          { name: 'logFileName', index: 'logFileName',hidden:true} //No I18N
        ];
        defaultOptions.sortName="name"; //No I18n
        if(Object.keys(wrkflwInfoObj.criteria.criteriaProp.eventlog.allEventLogRules).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", wrkflwInfoObj.criteria.criteriaProp.eventlog.allEventLogRules, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
            var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.eventlog.allEventLogRules, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
    }
    else if (criteria === "traps")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/listTrapProcessors',function(jsonData) //No I18n
      {
        colNames = [Ember.I18n.t('webclient.admin.traps.name',this),'']; //No I18N
        colModels = 
        [
          { name: 'trapName', index: 'trapName'}, //No I18N 
          { name: 'parseId', index: 'parseId',hidden:true} //No I18N
        ];
        defaultOptions.sortName="trapName"; //No I18n
        if(Object.keys(jsonData).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
          var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.snmpTrap.allTraps[0].list, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
      });
    }
    else if(criteria === "scripts")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/listScriptMonitors',function(jsonData) //No I18n
      {
        colNames = [Ember.I18n.t('webclient.map.name',this),'']; //No I18N
        colModels = 
        [
          { name: 'graphName', index: 'graphName'}, //No I18N 
          { name: 'graphID', index: 'graphID',hidden:true} //No I18N
        ];
        defaultOptions.sortName="graphName"; //No I18n
        if(Object.keys(jsonData).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
          var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.scriptMonitors.scriptMonitors, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
      });
    }
    else if(criteria === "syslogs")
    {
        colNames = [Ember.I18n.t('webclient.admin.eventlog.configrule.rulename',this),'']; //No I18N
        colModels = 
        [
          { name: 'RuleName', index: 'RuleName'}, //No I18N 
          { name: 'RuleId', index: 'RuleId',hidden:true} //No I18N
        ];
        defaultOptions.sortName="graphName"; //No I18n
        if(Object.keys(wrkflwInfoObj.criteria.criteriaProp.syslog.allSysLogRules).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", wrkflwInfoObj.criteria.criteriaProp.syslog.allSysLogRules, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
            var selCnt = 1;
        $.each(wrkflwInfoObj.criteria.criteriaProp.syslog.allSysLogRules, function(key,obj){
          if(obj.selected !== undefined && obj.selected === true)
          {
            $("#"+criteria+"List").jqGrid('setSelection', selCnt, true);//No I18N

          }
          selCnt = selCnt+1;

        });
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
    }
    else if(criteria === "urls")
    {
      $.getJSON(window.OPM.apiUrlPattern + '/admin/listURLMonitors',function(jsonData) //No I18n
      {
        colNames = [Ember.I18n.t('webclient.admin.url.urlname',this),'']; //No I18N
        colModels = 
        [
          { name: 'displayName', index: 'displayName'}, //No I18N 
          { name: 'url', index: 'url',hidden:true} //No I18N
        ];
        defaultOptions.sortName="displayName"; //No I18n
        if(Object.keys(jsonData).length !== 0)
        {
          opm_loadJQgridWithData("#"+criteria+"List", jsonData, colNames, colModels, "", "#"+criteria+"Pager", "",defaultOptions); //No I18N
        }
        else
        {
          $("#"+criteria).html(Ember.I18n.t('webclient.devices.details.monitornotavail',this)); //No I18n
        }
      });
    }
  }
}

 function returnTimes(dbMnutes)
{
  
    var minutes = Number(dbMnutes);
    var _convert = "";
    var _temp = "";
    if(minutes%60 > 0)
    {
      _convert = String(minutes);
      return(_convert+"_"+1);
      
    }
    minutes = minutes/60;
    if(minutes%60 > 0)
    {
      _convert = String(minutes);
      _temp = _convert;
      //return(_convert+"_"+1);
  
    }
    minutes = minutes/24;
    var _str = String(minutes);
    for(var i=0;i<_str.length;i++)
    {
      if(_str.charAt(i) === ".")
      {
        minutes = 0;
      }
    }
    if(minutes%24 > 0)
    {
      _convert = String(minutes);
      return(_convert+"_"+3);
    }
    else
    {
      return(_temp+"_"+2);
    }
      
    return(_convert);         
}
