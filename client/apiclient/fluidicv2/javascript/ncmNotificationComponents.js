OPMClient.NCMNotificationTriggerController = Ember.Object.create({
    gridData: {},
    updateGridSelection: function(gridId, selectedIds, status, isRender) {
        if(!selectedIds || selectedIds.length == 0) {
            return;
        }
        var gridData = OPMClient.NCMNotificationTriggerController.gridData;
        if(!gridData[gridId]) {
            gridData[gridId] = {};
        }
        for (var i = 0; i < selectedIds.length; i++) {
            var rowId = selectedIds[i];
            var rowData = $("#" + gridId).jqGrid("getRowData", rowId);
            if(isRender) {
                rowData = {"id": rowId};  //No I18N
            }
            var resolvedRowId = rowData ? rowData.id : null;
            if(!resolvedRowId && rowData) {
                // jqGrid data rows are stored with dynamic keys like <triggerName>_id.
                resolvedRowId = rowData[gridId + "_id"]; //No I18N
            }
            if(!resolvedRowId) {
                resolvedRowId = rowId;
            }
            if (status) {
                gridData[gridId][resolvedRowId] = true;
            } else {
                delete gridData[gridId][resolvedRowId];
            }
        }
    }
});

OPMClient.NcmNotificationTriggersComponent = Ember.Component.extend({
    triggerObj: null,
	templateName: "components/ncm-notification-triggers", //No I18N
	didInsertElement: function() {
	    var _self = this;
	    var parent = this.get("registerParent");
	    if(parent) {
            parent.model.triggerComponent = _self;
	    }
	    var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmchange/getRuleTriggerPreRender?eventType=' + this.eventType;//No I18N
        var data = opm_ajaxGetRequest(ajaxRequestUrl);
        // opm_ajaxGetRequest returns an API error as {messageClass, message} without data
        if(data && !data.data && data.message) {
            opm_infoMsgs("errorMsg", data.message); //No I18N
            return;
        } else if(!data || !data.data || !data.data.triggers){
            opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.data.error")); //No I18N
            return;
        }
        _self.set('triggerObj', data.data.triggers);  //No I18N
        var triggers = Object.values(data.data.triggers);
        _self.set('triggers', triggers);  //No I18N
        waitForElement(".ncm-notification-trigger." + triggers.at(-1).name, function() { //No I18N
            Ember.run.next(function () {
                _self.initializeTriggers();
            });
        }, $(".formSteps.triggerSelection")[0]);//No I18N
	}, initializeTriggers: function() {
       var _self = this;
       $(".ncm-notification-trigger .select2").select2({'minimumResultsForSearch': 0}); //No I18N

       var renderData = _self.get('renderData'); //No I18N
       var triggers = _self.get('triggers');
       triggers.forEach(function(trigger) {
           if(trigger.type == "MULTISELECT") {
               if(renderData && renderData[trigger.name]) {
                   OPMClient.NCMNotificationTriggerController.updateGridSelection(trigger.name, renderData[trigger.name], true, true);
               }
               _self.initGrid(trigger);
           }
           if(trigger.options) {
               $(".ncm-notification-trigger." + trigger.name + " .toggleCheckBox").on('change', function() { //No I18N
                   var shouldCheck = true;
                   if(trigger.type == "CHECKBOX") {
                       shouldCheck = $(".ncm-notification-trigger input." + trigger.name + "_chk:checked").length > 0; //No I18N
                   }
                   $(".ncm-notification-trigger #" + trigger.name + "_checkBox").prop('checked', shouldCheck); //No I18N
               });
           } else if(trigger.type == 'TEXT') {
               $(".ncm-notification-trigger ." + trigger.name + "_text").on('input', function() {
                   $(".ncm-notification-trigger #" + trigger.name + "_checkBox").prop('checked', true); //No I18N
               });
           }
           if(trigger.type == 'DATE') {
                waitForElement($('.dateToCol'), function() {
                    _self.initializeDatePicker(trigger);
                }, $(".formSteps.triggerSelection")[0]);//No I18N
           }
           if(trigger.dependency) {
               _self.handleDependency(trigger);
           }
       });

       $(".childTrigger-true").hide(); //No I18N
       $(".dateToCol").hide(); //No I18N

       _self.renderExistingDate();
   }, initGrid: function(trigger) {
       var _self = this;
       var gridId = '#' + trigger.name; //No I18N
       var pager = '#' + trigger.name + '_pager'; //No I18N
       var colNamesList = [ "",//No I18N
           trigger.label
       ];
       var colModelList = [ {
            name : trigger.name + '_id',//No I18N
            index : trigger.name + '_id',//No I18N
            hidden : true,
            hidedlg : true
        },{
           name : trigger.name + '_name',//No I18N
           index : trigger.name + '_name'//No I18N
       }];
       var defaultOptions = {
           multiselect: true,
           searchOption: true,
           toggleSearch:true,
           showColChooserIcon : false,
           showSearchIcon : true,
           minRowsPerPage : 10,
           removeGridPagerActions : true
       };
       var gridCallBack = function(){
           document.querySelector("#gview_"+trigger.name+" > div.ui-jqgrid-bdiv > div").classList.add('ncm_complianceiq_grid_horizontal_scroll_fix');//NO I18N
       }
       defaultOptions.gridCallBack = gridCallBack;
       $(gridId).jqGrid('GridUnload');//No I18N
       var rows = [];
       var selectedIds = OPMClient.NCMNotificationTriggerController.gridData[trigger.name] ? Object.keys(OPMClient.NCMNotificationTriggerController.gridData[trigger.name]) : [];
       var selectedIdMap = {};
       selectedIds.forEach(function(id) {
           selectedIdMap[String(id)] = true;
       });
       var selectedRows = [];
       var unselectedRows = [];

       var sortedOptions = (trigger.options || []).slice().sort(function(a, b) {
           var aLabel = (a && a.label !== undefined && a.label !== null) ? String(a.label).toLowerCase() : ""; //No I18N
           var bLabel = (b && b.label !== undefined && b.label !== null) ? String(b.label).toLowerCase() : ""; //No I18N
           return aLabel.localeCompare(bLabel);
       });

       sortedOptions.forEach(function(option) {
           var idKey = trigger.name + '_id';//No I18N
           var nameKey = trigger.name + '_name';//No I18N
           var row = {};
           row[idKey] = option.key;
           row[nameKey] = option.label;

           // Separate selected and unselected rows to prioritize selected items
           if(selectedIds.indexOf(option.key) >= 0) {
               selectedRows.push(row);
           } else {
               unselectedRows.push(row);
           }
       });

       // Add selected rows first, then unselected rows
       rows = selectedRows.concat(unselectedRows);

       opm_loadJQgridWithData(gridId, rows, colNamesList, colModelList, "", "#" + trigger.name + "_pager", "ncmNotificationTrigger", defaultOptions); //No I18N
       $(gridId).jqGrid('setGridWidth', $(gridId).closest(".opmFormRow").width());//No I18N

       if(selectedIds.length > 0) {
           var allRowIds = $(gridId).jqGrid('getDataIDs'); //No I18N
           allRowIds.forEach(function(jqRowId) {
               var rowData = $(gridId).jqGrid('getRowData', jqRowId); //No I18N
               var dataId = rowData ? (rowData[trigger.name + '_id'] || rowData.id) : null; //No I18N
               if(dataId && selectedIdMap[String(dataId)]) {
                   $(gridId).jqGrid('setSelection', jqRowId, false); //No I18N
               }
           });
       }
   }, handleDependency: function(trigger) {
       var _self = this;
       var dependency = trigger.dependency;
       var el;
       if(trigger.type == "RADIO") {
           el = $("input[name='" + trigger.name + "_radio']"); //No I18N
       } else {
           el = $("#" + trigger.name + "_select"); //No I18N
       }
       $(el).on('change', function() {
           var selectedValue;
           if(trigger.type == "RADIO") {
               selectedValue = $("input[name='" + trigger.name + "_radio']:checked").attr("data-value"); //No I18N
           } else {
               selectedValue = $(el).val();
           }
           if(dependency[selectedValue]) {
               var showArr = dependency[selectedValue].show;
               var hideArr = dependency[selectedValue].hide;
               showArr.forEach(function(showKey) {
                   $(".ncm-notification-trigger.childTrigger-true." + showKey).show(); //No I18N
               });
               hideArr.forEach(function(hideKey) {
                   $(".ncm-notification-trigger.childTrigger-true." + hideKey).hide(); //No I18N
               });
           }
       });
   }, initializeDatePicker: function(trigger) {
       var _self = this;
       $(".ncm-notification-trigger." + trigger.name + " .dateCheck").datepicker({dateFormat: 'yy-mm-dd'}); //No I18N
       $('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]').on('change', function() {
          var dateType = $('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]:checked').attr('data-type'); //No I18N
          if(dateType == 'RANGE') {
              $(".ncm-notification-trigger." + trigger.name + " .dateToCol").show(); //No I18N
          } else {
              $(".ncm-notification-trigger." + trigger.name + " .dateToCol").hide(); //No I18N
          }
       });
   }, renderExistingDate: function() {
        var _self = this;
        var triggers = _self.get('triggers');
        var data = _self.get('renderData');
        if(!data) {
            return;
        }
        triggers.forEach(function(trigger) {
            _self.renderTriggerData(trigger, data[trigger.name]);
        });
   }, renderTriggerData: function(trigger, data) {
        var _self = this;
        if(!data) {
            return;
        }
        switch(trigger.type) {
            case "TEXT": // No I18N
                $(".ncm-notification-trigger #" + trigger.name + "_text").val(data);
            break;
            case "SELECT": // No I18N
                $(".ncm-notification-trigger #" + trigger.name + "_select").val(data).trigger('change');
            break;
            case "RADIO": // No I18N
                $("input[name='" + trigger.name + "_radio'][data-value='" + data + "']").prop('checked', true); //No I18N
                $("input[name='" + trigger.name + "_radio'][data-value='" + data + "']").trigger('change'); //No I18N
            break;
            case "CHECKBOX": // No I18N
                data.forEach(function(value) {
                    $("input." + trigger.name + "_chk[data-value='" + value + "']").prop('checked', true); //No I18N
                    $("input." + trigger.name + "_chk[data-value='" + value + "']").trigger('change'); //No I18N
                });
            break;
            case "DATE": // No I18N
                var modifierSelector = '.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"][data-value="' + data.modifier + '"]'; //No I18N
                $(modifierSelector).prop('checked', true).trigger('change');//No I18N

                var formatEpochToDateStr = function(value) {
                    if (value === null || value === undefined || value === "") { //No I18N
                        return "";//No I18N
                    }
                    var num = (typeof value === 'number') ? value : (/^\d+$/.test(String(value)) ? Number(value) : null); //No I18N
                    if (num !== null && num > 0) {
                        var dt = new Date(num);
                        var y = dt.getFullYear();
                        var m = String(dt.getMonth() + 1).padStart(2, '0');//I18N
                        var d = String(dt.getDate()).padStart(2, '0');//I18N
                        return y + '-' + m + '-' + d; //No I18N
                    }
                    return value;
                };

                $(".ncm-notification-trigger #" + trigger.name + "_date_from").val(formatEpochToDateStr(data.startDate));//No I18N
                var selectedDateType = $(modifierSelector).attr('data-type'); //No I18N
                if(selectedDateType == 'RANGE') {//No I18N
                    $(".ncm-notification-trigger #" + trigger.name + "_date_to").val(formatEpochToDateStr(data.endDate));//No I18N
                }
            break;
            case "MULTISELECT": // No I18N
                OPMClient.NCMNotificationTriggerController.updateGridSelection(trigger.name, data, true, true);
                $("#" + trigger.name).trigger('reloadGrid'); //No I18N
            break;
        }
   }, resolveSelectionRule: function(trigger) {
        var rule = null;
        if(trigger) {
            rule = trigger.selectionRule || trigger.selectionMode || trigger.selectionValidation || trigger.validationMode;
            if(!rule && trigger.selectionRuleByModel) {
                rule = trigger.selectionRuleByModel;
            }
        }

        if(rule && typeof rule === "object") {
            var selectedModel = $("input[name='objectType_radio']:checked").attr("data-value"); //No I18N
            if(!selectedModel) {
                selectedModel = $("#objectType_select").val(); //No I18N
            }
            rule = (selectedModel && (rule[selectedModel] || rule[selectedModel.toLowerCase()])) || rule["default"] || rule.DEFAULT || null; //No I18N
        }

        if(trigger && trigger.requireAllSelection === true) {
            return "ALL"; //No I18N
        }
        if(!rule) {
            return "AT_LEAST_ONE"; //No I18N
        }

        rule = String(rule).toUpperCase();
        if(rule === "ALL" || rule === "ALL_REQUIRED" || rule === "REQUIRE_ALL") { //No I18N
            return "ALL"; //No I18N
        }
        return "AT_LEAST_ONE"; //No I18N
   }, validateSelectionCount: function(trigger, selectedCount, totalCount) {
        var rule = this.resolveSelectionRule(trigger);
        if(rule === "ALL" && totalCount > 0 && selectedCount !== totalCount) {
            opm_infoMsgs("errorMsg", (trigger.label || trigger.name) + " - select all values"); //No I18N
            return false;
        }
        if(selectedCount === 0) {
            opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.select.trigger.value", {triggerName: trigger.label})); //No I18N
            return false;
        }
        return true;
   }, getRawData: function() {
        var _self = this;
        var triggers = _self.get('triggers');
        var triggerData = {};
        triggers.forEach(function(trigger) {
            _self.getRawTriggerData(trigger, triggerData);
        });
        return triggerData;
   }, getRawTriggerData: function(trigger, triggerData, processChild) {
        var _self = this;
        if(trigger.isChild && !processChild) {
            return;
        }
        if(!trigger.isChild && trigger.type != "TEXT" && !$(".ncm-notification-trigger #" + trigger.name + "_checkBox").is(':checked')) { //No I18N
            return;
        }
        switch(trigger.type) {
            case "TEXT": // No I18N
                triggerData[trigger.name] = $(".ncm-notification-trigger #" + trigger.name + "_text").val();
            break;
            case "SELECT": // No I18N
                var val = $(".ncm-notification-trigger #" + trigger.name + "_select").val(); //No I18N
                if(val) { triggerData[trigger.name] = val; }
            break;
            case "RADIO": // No I18N
                var checked = $("input[name='" + trigger.name + "_radio']:checked"); //No I18N
                if(checked.length > 0) {
                    triggerData[trigger.name] = checked.attr("data-value"); //No I18N
                }
            break;
            case "CHECKBOX": // No I18N
                var checkedBoxes = [];
                $("input." + trigger.name + "_chk:checked").each(function() { //No I18N
                    checkedBoxes.push($(this).attr('data-value')); //No I18N
                });
                triggerData[trigger.name] = checkedBoxes;
            break;
            case "DATE": // No I18N
                var dateOption = $('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]:checked'); //No I18N
                if(dateOption.length > 0) {
                    triggerData[trigger.name] = {
                        modifier: dateOption.attr('data-value'), //No I18N
                        startDate: $(".ncm-notification-trigger #" + trigger.name + "_date_from").val() //No I18N
                    };
                    if(dateOption.attr('data-type') == 'RANGE') { //No I18N
                        triggerData[trigger.name].endDate = $(".ncm-notification-trigger #" + trigger.name + "_date_to").val(); //No I18N
                    }
                }
            break;
            case "MULTISELECT": // No I18N
                var data = OPMClient.NCMNotificationTriggerController.gridData;
                var selectedRowIds = data ? data[trigger.name] : null;
                triggerData[trigger.name] = selectedRowIds ? Object.keys(selectedRowIds) : [];
            break;
        }
        if(trigger.dependency) {
            var selectedValue = triggerData[trigger.name];
            var triggerObj = _self.get('triggerObj');
            var dependency = trigger.dependency;
            if(dependency[selectedValue]) {
                dependency[selectedValue].show.forEach(function(showKey) {
                    var childTrigger = triggerObj[showKey];
                    if(childTrigger) {
                        _self.getRawTriggerData(childTrigger, triggerData, true);
                    }
                });
            }
        }
   }, getData: function() {
        var _self = this;
        var triggers = _self.get('triggers');
        var triggerData = {};
        var error = false;
        triggers.forEach(function(trigger){
            var valid = _self.getTriggerData(trigger, triggerData);
            if(!valid) {
                error = true;
                return false;
            }
        });
        if(error) {
            return null;
        }
        return triggerData;
   }, getTriggerData: function(trigger, triggerData, processChild) {
         var _self = this;
         if(trigger.isChild && !processChild) {
             return true;
         }
         if(!trigger.isChild && trigger.type != "TEXT" && !$(".ncm-notification-trigger #" + trigger.name + "_checkBox").is(':checked')) { //No I18N
             return true;
         }
         var name = trigger.name;
         switch(trigger.type) {
             case "TEXT": // No I18N
                 var fieldsToValidate = {'empty': [trigger.name + "_text"]}; // No I18N
                 if(!opm_validateFields(fieldsToValidate)) {
                     return false;
                 }
                 triggerData[trigger.name] = $(".ncm-notification-trigger #" + trigger.name + "_text").val();
             break;
             case "SELECT": // No I18N
                 triggerData[trigger.name] = $(".ncm-notification-trigger #" + trigger.name + "_select").val();
                 if(!triggerData[trigger.name]) {
                     opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.select.trigger.value", {triggerName: trigger.label})); //No I18N
                     return false;
                 }
             break;
             case "RADIO": // No I18N
                 if($("input[name='" + trigger.name + "_radio']:checked").length == 0) {
                     opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.select.trigger.value", {triggerName: trigger.label})); //No I18N
                     return false;
                 }
                 triggerData[trigger.name] = $("input[name='" + trigger.name + "_radio']:checked").attr("data-value"); //No I18N
             break;
             case "CHECKBOX": // No I18N
                 var checkedCount = $("input." + trigger.name + "_chk:checked").length;
                 var totalCheckboxOptions = trigger.options ? trigger.options.length : 0;
                 if(!_self.validateSelectionCount(trigger, checkedCount, totalCheckboxOptions)) {
                     return false;
                 }
                 var checkedBoxes = [];
                 $("input." + trigger.name + "_chk:checked").each(function() { //No I18N
                     checkedBoxes.push($(this).attr('data-value')); //No I18N
                 });
                 triggerData[trigger.name] = checkedBoxes;
                break;
             case "DATE": // No I18N
                 if($('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]:checked').length == 0) {
                        opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.trigger.date.modifier.invalid", {triggerName: trigger.label})); //No I18N
                        return false;
                 }
                 var dateOption = $('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]:checked').attr('data-type'); //No I18N
                 var modifier = $('.ncm-notification-trigger.' + trigger.name + ' input[name="' + trigger.name + '_date_option"]:checked').attr('data-value'); //No I18N
                 var fieldsToValidate = {'empty': [trigger.name + "_date_from"], 'dateCheck':[trigger.name + "_date_from"]}; // No I18N
                 if(!opm_validateFields(fieldsToValidate)) {
                      return false;
                 }
                 triggerData[trigger.name] = {};
                 triggerData[trigger.name].startDate = $(".ncm-notification-trigger #" + trigger.name + "_date_from").val();
                 if(dateOption == 'RANGE') {
                     fieldsToValidate = {'empty': [trigger.name + "_date_to"], 'dateCheck':[trigger.name + "_date_to"]}; // No I18N
                      if(!opm_validateFields(fieldsToValidate)) {
                           return false;
                      }
                     triggerData[trigger.name].endDate = $(".ncm-notification-trigger #" + trigger.name + "_date_to").val();
                 }
                 triggerData[trigger.name].modifier = modifier;
             break;
             case "MULTISELECT": // No I18N
                 var data = OPMClient.NCMNotificationTriggerController.gridData;
                var selectedRowIds = data ? data[trigger.name] : null;
                var selectedKeys = selectedRowIds ? Object.keys(selectedRowIds) : [];
                var totalRows = trigger.options ? trigger.options.length : 0;
                if(!_self.validateSelectionCount(trigger, selectedKeys.length, totalRows)) {
                    return false;
                }
                triggerData[trigger.name] = selectedKeys;
             break;
         }
         if(trigger.dependency) {
            var selectedValue = triggerData[trigger.name];
            var triggers = _self.get('triggerObj');
            var dependency = trigger.dependency;
            if(dependency[selectedValue]) {
                var showArr = dependency[selectedValue].show;
                var valid = true;
                showArr.forEach(function(showKey) {
                    var childTrigger = triggers[showKey];
                    var childValid = _self.getTriggerData(childTrigger, triggerData, true);
                     if(!childValid) {
                         valid = false;
                         return false;
                     }
                });
                return valid;
            }
         }
         return true;
   }
});

OPMClient.NcmNotificationTriggerComponent = Ember.Component.extend({
    data: null,
    parentTrigger: null,
    key: null,
    isChild: false,
	templateName: "components/ncm-notification-trigger", //No I18N
	didInsertElement: function() {
        var _self = this;
        $(".optionRow .opmFormCol").css({ width: "auto", marginLeft: "4%" }); //No I18N
//        $(".optionRow .opmFormCol").css('width', 'auto'); //No I18N
//        $(".optionRow .opmFormCol").css('margin-left', '4%'); //No I18N
	}, data: function () {
        // Parent case
        if (!this.get('isChild')) {
          return this.get('triggerData');
        }

        // Child case
        var parent = this.get('parentTrigger');
        var key = this.get('key');

        if (!parent || !key) {
          return null;
        }

        var dep = parent.dependency;

        var triggerKey = dep && key && dep[key] ? dep[key].key : null;
        if(triggerKey) {
            var triggerObj = this.get('triggerObj');
            return triggerObj[triggerKey];
        }
        return null;
      }.property(
        'isChild', //No I18N
        'triggerData', //No I18N
        'parentTrigger.dependency', //No I18N
        'key', //No I18N
        'triggerObj' //No I18N
      )
});
