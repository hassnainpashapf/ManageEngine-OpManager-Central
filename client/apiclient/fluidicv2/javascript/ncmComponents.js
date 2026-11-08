//IgnoreI18N_Start
var NcmDGroupComponentArray = [];
var NcmComplianceComponentArray = [];
OPMClient.NCMComponentController = Ember.ArrayController.create({
	ncmDeviceSelectionComponent : null,
	deviceSelector : null,
	deviceGroupSelector : null,
	customerSelector : null,
	probeSelector : null,
	criteriaDeviceSelector : null,
	ncmDeviceFilter : null,
	ncmDeviceFilterValue : null,
	ncmAdvReportOptions: null,
	ncmDynamicCriteriaOptions: null,
	ncmConfigletParamComponent : null,
	ncmConfigletExecutionParamComponent : null,
    ncmTestCredResponseComponent : null,
    ncmConfigSearchComponent : null
});

OPMClient.NcmRestApiFormElementComponent = Ember.Component.extend({
	templateName: "components/ncm-rest-api-form-element", //No I18N
	tagName:"",
	didInsertElement: function() {
		var _self = this;
		$('.opmFormgroup .opmFormgroup__header .opmFormgroup__icon .add_icon').off('click').on('click', function() {
			var currentForm = $(this).closest('.ncmRestElementSubForm');
			var lastForm = $(currentForm).parent().children('.ncmRestElementSubForm').last();
			_self.send('addAdditionalChild', lastForm);
		});
		$('.credentialBox').each(function() {
			initializeMultiselectBox(this);
		});
		$('.select2[data-custom="true"]').each(function() {
			addCustomItemListenerToSelect2(this);
		});
	},
	actions: {
		addAdditionalChild: function(lastForm) {
			var _self = this;
			var lastFormId = $(lastForm).attr('id');
			var lastIndex = lastFormId.lastIndexOf('_');
			var lastFormIdNum = lastFormId.substring(lastIndex + 1);
			
			var newIdNum = parseInt(lastFormIdNum) + 1;
			var newId = lastFormId.substring(0, lastIndex) + '_' + newIdNum;
			$(lastForm).find('.select2').each(function() {
				if($(this).hasClass('select2-hidden-accessible')) {
					$(this).select2('destroy');
				}
			});
			var newForm = $(lastForm).clone(true);
			$(lastForm).find('.select2').each(function() {
				if(!$(this).hasClass('select2-hidden-accessible')) {
					applySelect2ToRestElements(this);
				}
			});
			$(newForm).attr('id', newId);
			$(newForm).find('.opmFormgroup__title').text(lastFormId.substring(0, lastIndex) + ' ' + (newIdNum + 1));
			$(newForm).find('select').each(function() {
				applySelect2ToRestElements(this);
			});
			$(newForm).find('.select2[data-custom="true"]').each(function() {
				addCustomItemListenerToSelect2(this);
			});
			$(newForm).find('.credentialBox').each(function() {
				_self.send('initializeMultiselectBox', this);
			});
			
			$(newForm).find('.opmFormgroup__header .opmFormgroup__icon .add_icon').off('click').on('click', function() {
				var form = $(newForm).parent().children('.ncmRestElementSubForm').last();
				_self.send('addAdditionalChild', form);
			});
			
			$(newForm).find('.opmFormgroup__header .opmFormgroup__icon .remove_icon').off('click').on('click', function() {
				$(newForm).remove();
			});
			
			$(newForm).insertAfter(lastForm);
		},
		showHidePassword : function(credential){
		    showHidePassword(credential);
		},
		enableDisableRESTStatus : function(paramElementId) {
        	var paramElement = $('#' + paramElementId);
        	if($(paramElement).hasClass("enable")) {
        	    if(paramElementId == "backup_config") {
        	        var confirmBody = Ember.I18n.t("ncm.server.rest.backup.disable.client.help",this); //No I18N
        	        var cancelCallBack = function() {
                        return;
                    }
                    var okCallBack = function() {
                        paramElement.removeClass("enable");
                    }
        	        ncmConfirmDialog(confirmBody, okCallBack, cancelCallBack);
        	    }
        	    else {
        		    paramElement.removeClass("enable");
        		}
        	} else {
        		paramElement.addClass("enable");
        	}
        	$(paramElement).trigger('change');
        }
	}
});

function applySelect2ToRestElements(element) {
    if($(element).hasClass('select2-hidden-accessible')) {
        $(element).select2('destroy');
    }
    if(!$(element).hasClass('select2-hidden-accessible')) {
        var origId = $(element).attr("id");
        var newId = "select2_" + origId; //No I18N
        var changed = false;

        if($("[id='"+origId+"'").length > 1) {
            changed = true;
            var index = 0;
            $("[id='"+origId+"'").each(function() {
                $(this).attr("orig-id", origId);
                $(this).attr("id", newId + "_" + index);
                index++;
            });
        }
        $(element).select2({minimumResultsForSearch: 0});
        if(changed) {
            $("[id^="+ newId + "]").each(function() {
                $(this).attr("id", $(element).attr("orig-id"));
            });
        }
    }
}

function initializeMultiselectBox(box) {
	$(box).find('.selectBox').off('click').on('click', function(event) {
		$(this).siblings('.dropDownBox').toggle();
		$(box).focus();
	});
	if($(box).attr('data-custom') == "true") {
		var searchText = Ember.I18n.t('opu.common.SEARCH'); // No I18N
		var addText = Ember.I18n.t('jsp.commonstr.Add'); // No I18N
		$(box).find('.dropDownBox > .credentialSearch > input').attr('placeholder', searchText + '/' + addText);
	}
	$(box).find('.dropDownBox > .credentialSearch > input').off('keyup').on('keyup', function(event) {
		var searchText = $(this).val();
		var list = $(this).closest('.dropDownBox').find('.dropDownList ul li:not(".group")');
		if(searchText.trim() == '') {
			$(list).show();
		} else {
			$(list).each(function() {
				var liText = $(this).find('.opmCheckBox label').text();
				if(liText.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		}
		
		if($(box).attr('data-custom') == "true") { //No I18N
			var count = $(this).closest('.dropDownBox').find('.dropDownList ul li:not(".group"):visible').length;
			if(count == 0) {
				$(this).parent().addClass('addBtn'); //No I18N
			} else {
				$(this).parent().removeClass('addBtn'); //No I18N
			}
			
			if(count == 0 && event.which == 13 && searchText.trim() != '') {
				list = $(this).closest('.dropDownBox').find('.dropDownList ul');
				if($(list).find('li.group.custom').length == 0) {
					var customGroup = document.createElement('li'); //No I18N
					$(customGroup).addClass('group custom');
					$(customGroup).text(Ember.I18n.t('webclient.ncm.restapi.configlet.execute.customValues',this)); //No I18N
					$(list).append(customGroup);
				}
				var li = document.createElement('li'); //No I18N
				var div1 = document.createElement('div'); //No I18N
				$(div1).addClass('opmCheckBox'); //No I18N
				
				var div2 = document.createElement('div'); //No I18N
				var input = document.createElement('input'); //No I18N
				$(input).attr('type', 'checkbox');//No I18N
				$(input).attr('data-name', searchText);
				$(input).attr('id', searchText);
				
				var label = document.createElement('label'); //No I18N
				$(label).text(searchText);
				
				$(div2).append(input);
				$(div2).append(label);
				$(div1).append(div2);
				$(li).append(div1);
				$(list).append(li);
				$(input).on('change', function() {
					multiselectLiOnChange(box, this);
				});
				setTimeout(function () {
					$(input).prop('checked', true);
					$(input).trigger('change');
				}, 100);
			}
		} 
	});
	$(box).find('.dropDownBox .dropDownList ul li input[type="checkbox"]').off('change').on('change', function() {
		multiselectLiOnChange(box, this);
	});
	$(box).focusout(function(event) {
		if($(event.relatedTarget).closest(box).length == 0) {
			$(this).find('.dropDownBox').hide();
		} else {
			$(box).focus();
		}
	});
}

function addCustomItemListenerToSelect2(select) {
	var searchBox = null;
	$(select).off('select2:open').on('select2:open', function() {
		searchBox = $('input.select2-search__field');
		var searchTxt = Ember.I18n.t('opu.common.SEARCH'); // No I18N
		var addText = Ember.I18n.t('jsp.commonstr.Add'); // No I18N
		$(searchBox).attr('placeholder', searchTxt + '/' + addText);
		$(searchBox).off('keydown').on('keydown', function(event) {
			if(event.which == 13) {
				var searchValue = $(searchBox).val();
				var exist = false;
				$('.select2-results__options li:not(".select2-results__message")').each(function() {
					if($(this).text().trim() == searchValue) {
						exist = true;
						return false;
					}
				});
				if(!exist) {
				    if(searchValue.trim() == '') {
				        searchValue = $(searchBox).val();
				    }
				    addCustomValueToSelect(select, searchValue, exist);
				}
			}
		});
	});
}

function addCustomValueToSelect(select, value, exist) {
	if($(select).find('optgroup.custom').length == 0) {  //No I18N
		var optgroup = document.createElement('optgroup'); //No I18N 
		$(optgroup).attr('label', Ember.I18n.t('webclient.ncm.restapi.configlet.execute.customValues')); //No I18N
		$(optgroup).attr('id', 'customGroup' + $(select).attr("id")); //No I18N
		$(optgroup).addClass('custom');
		$(select).append(optgroup);
	}
	if(!exist && value.trim() != '') {
		var option = document.createElement('option');
		$(option).attr('value', value);
		$(option).text(value);
		$(select).find('optgroup[id^=customGroup]').append(option);
		$(option).prop('selected', true);
		$(select).select2('close');
		$(select).trigger('change');
	}
}

function multiselectLiOnChange(box, listItem) {
	var selectedList = $(box).prev('.selBoxList');
	var name = $(listItem).attr('data-name');
	if($(listItem).is(':checked')) {
		var _self = listItem;
		var li = document.createElement('li');
		$(li).text(name);
		var i = document.createElement('i');
		$(i).addClass('close');
		$(i).on('click', function() {
			$(_self).prop('checked', false);
			$(_self).trigger('change');
		}); 
		$(li).append(i);
		$(selectedList).find('ul').append(li);
		if($(listItem).hasClass('customDS')) {
			 $(listItem).closest('ul').find('input[type="checkbox"]:checked').not($(listItem)).click();
		} else {
			$(listItem).closest('ul').find('input.customDS[type="checkbox"]:checked').click();
		}
	} else {
		$(selectedList).find('ul li').each(function() {
			if($(this).text() == name) {
				$(this).remove();
				return false;
			}
		});
	}
	var numSelectedItems = $(listItem).closest('ul').find('input[type="checkbox"]:checked').length;
	var select = $(box).find('.selectBox');
	var newText = numSelectedItems + ' ' + Ember.I18n.t('webclient.ncm.restapi.configlet.execute.deviceSelection.multiSelect.Selected'); //No I18N
	if(numSelectedItems == 0) {
		newText = Ember.I18n.t('webclient.ncm.restapi.configlet.execute.deviceSelection.multiSelect.noneSelected'); //No I18N
	}
	$(select).contents().filter(function() {
	    return this.nodeType === 3;
	}).remove();
	$(select).prepend(document.createTextNode(newText));
}

OPMClient.NcmRestColorPalletComponent = Ember.Component.extend({
	templateName: "components/ncm-rest-color-pallet", //No I18N
	didInsertElement: function() {
		$('.inputWithColor').on('click', function() {
			if($(this).hasClass('active')) {
				$(this).removeClass('active');
			} else {
				$(this).addClass('active');
			}
		});
		
		$('.csColorList li').on('click', function(event) {
			$(this).closest('.inputWithColor').find('input.rest-color').val($(this).attr('cscolorvalue'));
			$(this).closest('.inputWithColor').find('.emptySpace').css('background-color', $(this).css('background-color'));
			$(this).closest('.inputWithColor').removeClass('active');
			event.stopPropagation();
		});
	},
	colorObserver: function() {
		this.rerender();
	}.observes('colorClass')
});

OPMClient.NcmRestObjectGridComponent = Ember.Component.extend({
	templateName: "components/ncm-rest-object-grid", //No I18N
	didInsertElement: function() {
		var data={};
		data.operationId = this.get('gridoperationId');
		data.resourceId = this.get('gridResourceId');
		if(!data.resourceId || data.resourceId == -1 || data.resourceId == "-1") {
			return;
		}
		data.action = this.get('gridAction');
		data.postJSONData = this.get('postJSONData');
		var assignGridId = this.get('assignGridId');
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmconfiglets/getMKeyObjectList'; //No I18N
		$.ajax({
			type : "POST", // No I18N
			url : ajaxRequestUrl,
			data : data,
			dataType : 'json', // No I18N
			success : function(jsondata) {
				if(jsondata != undefined && jsondata.isSuccess) {
					var gridData = jsondata.gridData;
					var colModelList = jsondata.colModelList;
					var colNamesList = jsondata.colNameList;
					if(jsondata.isv2Grid) {
						try {
							for (var index = 0; index < colNamesList.length; index++) {
								var colmnName = colNamesList[index];
								if(colmnName != 'ID' && colmnName != '') {
									colNamesList[index] = Ember.I18n.t(colmnName);
								}
							}
						} catch (e) {
							
						}
					}
					var defaultOptions = {
						enableColChooser : true,
						gridTableId : jsondata.grid_id,
						multiselect : true,
						forceSingleSelection : true,
						groupsList: jsondata.groupsList,
						grouping:jsondata.grouping,
						groupingView:jsondata.groupingView,
						sortname:jsondata.sortname,
						pagination: true,
						reloadAfterFirstLoad:true,
						forceGroupHeadersAtEachLoad:true,
						isNCM: true
					};
					if(assignGridId != false && assignGridId != 'false') {
						OPMClient.NCMInventoryRestAPIController.set('RestSnapshotGridId', jsondata.grid_id); //No I18N	
					}
					OPMClient.SettingsTabController.tableName = jsondata.grid_id;
					ncm_loadJQgridWithData("#"+jsondata.grid_id, gridData, colNamesList, colModelList, "", "#mKeyObjectGrid_Pager",jsondata.grid_id,defaultOptions); //No I18N
					$("#"+jsondata.grid_id).trigger('reloadGrid'); //No I18N
				} else if(jsondata) {
					OPMClient.NCMComplianceUtilController.loadMsgAndClear("errorMsg", jsondata.statusMsg);
				}
			}
		});
	}, 
	operationObserver: function() {
		this.rerender();
	}.observes('gridoperationId'), 
	resourceIdObserver: function() {
		this.rerender();
	}.observes('gridResourceId')
});

OPMClient.NcmRestCliResultComponent = Ember.Component.extend({
	templateName: "components/ncm-rest-cli-result", //No I18N
	didInsertElement: function() {
		var data={};
		data.operationId = this.get('OperationId');
		data.resourceId = this.get('ResourceId') == undefined ? OPMClient.InventoryDeviceDetailsController.RESOURCEID : this.get('ResourceId');
		data.action = this.get('Action');
		data.postJSONData = this.get('postJSONData');
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmconfiglets/execAPIAndGetResult'; //No I18N
		$("#commandResponse").val(Ember.I18n.t("webclient.ncm.restapi.configlet.execute.wait"));
		setTimeout(function() {
			var callBackFunc = function(jsonData) {
			    if(jsonData.isSuccess) {
                    if(jsonData.devResponse.isSuccess) {
                        $("#commandResponse").val(jsonData.devResponse.response);
                    } else {
                        $("#commandResponse").val(JSON.stringify(jsonData.devResponse));
                    }
                } else {
                    if(jsonData.statusMsg) {
                        $("#commandResponse").val(jsonData.statusMsg);
                    } else if(jsonData.devResponse) {
                        $("#commandResponse").val(jsonData.devResponse.response);
                    } else {
                        $("#commandResponse").val(jsonData);
                    }

                }
			}
			ncm_postAjaxResponseWithAsync(ajaxRequestUrl, data, callBackFunc);
		}, 500);
	}, 
	operationObserver: function() {
		this.rerender();
	}.observes('OperationId'), 
	resourceIdObserver: function() {
		this.rerender();
	}.observes('ResourceId')
});

function initializeRESTComponents(form, evenIfHidden) {
	$(".tags_textbox > input[type=text]").on({
		focusout : function() {
			var txt = this.value; //.replace(/[^a-z0-9\@\+\-\.\#\/\:"]/ig, ''); // allowed characters
			if (txt) {
				var em = $("<em/>", {
					text : txt,
					insertBefore : this
				});
				$(em).on('click', function() {
					$(this).remove();
				});
			}
			this.value = "";
		},
		keyup : function(ev) {
			if (/(13)/.test(ev.which)) {
				$(this).focusout();
			}
		}
	});
	$('.tags_textbox').on('click', 'em', function() {
		$(this).remove();
	});

	$('.btnGroup > .opmBtn').on('click', function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
	
	$('.btnGroup').each(function() {
		if($(this).find('.opmBtn').length == 2) {
			if($(this).find('.opmBtn.active').length == 0) {
				$(this).find('.opmBtn:first').click();	
			}
		}
	});
	
	$(form).find('.opmFormRow').each(function() {
		var colCount = $(this).children('.opmFormCol').length;
		if(colCount > 1) {
			for(var i = 1; i < colCount; i++) {
				$(this).children('.opmFormCol').eq(i).css({'margin' : '0 0 0 2%'});
			}
		}
		if(colCount == 3) {
			$(this).addClass('column3');
		}
	});

	if($(form).find('.opmFormRow.column3').length > 0) {
		$(form).css({'max-width' : '1050px'}); //No I18N
		$(form).find('.opmFormRow, .opmFormTitle').css({'max-width' : '1050px'}); //No I18N
		$('.fixedFooter').css({'max-width' : '1050px'}); //No I18N
	} else {
		$('.fixedFooter').css({'max-width' : '700px'}); //No I18N
	}
	setTimeout(function() {
		setRestColumnWidth(form, evenIfHidden);
	}, 500);
}

function setRestColumnWidth(wrapper, evenIfHidden) {
	$(wrapper).find('.opmFormCol:not(.fullCol)' + (!evenIfHidden ? ':visible' : '')).each(function() {	
		var parent = $(this).closest('.opmFormRow');
		var parentWidth = getWidth(parent);
		var noOfCol = $(parent).children('.opmFormCol').length;
		var width = parentWidth;
		if(noOfCol == 2) {
			width = (parentWidth * 48) / 100;
		}
		if(noOfCol == 3) { //No I18N
			width = (parentWidth * 32) / 100;
		}
		$(this).css({'width': width + 'px'});
	});
}

function getWidth(element) {
	if($(element).is(':visible')) {
		return $(element).width();
	}
	var clone = $(element).clone();
    $(clone).css("visibility","hidden");
    $(clone).appendTo($('body'));
	var width = $(clone).outerWidth();
	$(clone).remove();
	return width;
}

OPMClient.NcmRestApiFormComponent = Ember.Component.extend({
	templateName: "components/ncm-rest-api-form", //No I18N
	didInsertElement: function() {
		$("select.select2:not(.select2-hidden-accessible)").each(function() {
			applySelect2ToRestElements(this);
		});
		var viewData = this.get('viewData');
		if(viewData != undefined && viewData.deviceSelected) {
			this.send('addDependencyListeners');
			this.send('addDefaultValues');
		}
		var operationData = this.get('operation');
		if(operationData) {
			var plotType = operationData.PLOT_TYPE;
			if(plotType == "VIEW_FORM" || plotType == "DELETE_FORM") { //No I18N
				setTimeout(function() {
					disableRestComponents('#executeForm'); //No I18N
				}, 2000);
			} else {
				setTimeout(function() {
					disableRestComponents('#executeForm', true); //No I18N
				}, 1000);
			}
		}
		initializeRESTComponents($('#executeForm'), false);
		if(OPMClient.NCMInventoryRestAPIController.RestSnapshotSlide || OPMClient.NCMInventoryRestAPIController.ConfigAutomationSlide) {
			var mKey = OPMClient.NCMInventoryRestAPIController.RestSnapshotSelMKey;
			if(mKey != null) {
				var objectListCheckInterval = setInterval(function() {
					if($('#objectList option').length == 1) {
						return;
					}
					$('#objectList option[value="' + mKey + '"]').prop('selected', true);
					$('#objectList').trigger('change'); //No I18N
					$('#objectList').prop('disabled', true); //No I18N
					OPMClient.NCMInventoryRestAPIController.RestSnapshotSelMKey = null;
					clearInterval(objectListCheckInterval);
				}, 100);
			}
		}
		initializeHeaderIcons(operationData);
	},
	actions: {
		addDefaultValues: function() {
			var _self = this;
			var executionData = _self.get('executionData');
			executionData.parameterGroups.forEach(function(group) {
				group.paramList.forEach(function(param) {
					if(!param.isUserInput) {
						return;
					}
					addRESTDefaultValues(param);
				});
			});
		},
		addDependencyListeners: function() {
			var _self = this;
			var executionData = _self.get('executionData');
			executionData.parameterGroups.forEach(function(group) {
				group.paramList.forEach(function(param) {
					if(param.isUserInput) {
						if(param.dependencyJson || param.children) {
							addDependencyToRESTElement(param, "dependencyJson"); //No I18N
						}
						if(param.optionfilter) {
							param.optionfilter = param.optionfilter.replace(new RegExp("'", "g"), "\"");
							var filters = JSON.parse(param.optionfilter);
							var operationData = _self.get('operation');
							if(operationData) {
								var actionDetails = operationData.actionDetails;
								if(actionDetails) {
									var action = actionDetails.NAME;
									var filterName = 'hideOn' + action;
									if(filters[filterName]) {
										var filter = filters[filterName];
										var options = filter.split(',');
										for(var i = 0; i < options.length; i++) {
											$("#" + param.paramName).children('option[value="' + options[i] + '"]').remove();
										}
									}
								}
							}
						}
						_self.send('addValidationsAndRestrictions', param);
					}
				});
			});
		}, 
		addValidationsAndRestrictions: function(param, selectorPref) {
			var _self = this;
			var ele = $('#' + param.paramName);
			if(selectorPref != undefined) {
				ele = $(selectorPref).find('#' + param.paramName);
			}
			if($(ele).length > 0) {
				if(param.category.toLowerCase() == 'value') { //No I18N
					if(param.dataType && param.dataType.toLowerCase() == 'string' && param.datasource == undefined) { //No I18N
						if(param.size != undefined && !isNaN(param.size)) {
							$(ele).attr('maxlength', param.size);
							return;
						}
					}
					
					if(param.dataType && (param.dataType.toLowerCase() == 'integer' || param.dataType.toLowerCase() == 'float')) { //No I18N
						$(ele).attr('type', 'number');
						if(param.dataType.toLowerCase() == 'float') {
							$(ele).attr('step', '0.0000000001');
						}
						if(param['max-value'] != undefined) { //No I18N
							$(ele).attr('max', param['max-value']);
						}
						
						if(param['min-value'] != undefined) { //No I18N
							$(ele).attr('min', param['min-value']);
						}
						var placeHolder = '['; //No I18N
						placeHolder += (param['min-value'] != undefined) ? param['min-value'] : ""; //No I18N
						placeHolder += " - "; //No I18N
						placeHolder += (param['max-value'] != undefined) ? param['max-value'] : ""; //No I18N
						placeHolder += "]"; //No I18N
						if(placeHolder != "[ - ]") { //No I18N
							$(ele).attr('placeholder', placeHolder);
						}
						return;
					}
				}
				
				if(param.category.toLowerCase() == 'list') { //No I18N
					if(param.children != undefined &&
							(param.children.length > 1 || 
									(param.children.length > 0 && param.children[0].category.toLowerCase() == 'list'))) { //No I18N
						var noOfForms = $(ele).find('.ncmRestElementSubForm').length;
						for(var i = 0; i < noOfForms; i++) {
							var prefix = $('#' + param.paramName + '_' + i);//No I18N
							for(var j = 0; j < param.children.length; j++) {
								var child = param.children[j];
								if(child.isUserInput) {
									_self.send('addValidationsAndRestrictions', child, prefix);
								}
							}
						}
					}
				} else {
					if(param.children) {
						for(var i = 0; i < param.children.length; i++) {
							var child = param.children[i];
							if(child.isUserInput) {
								_self.send('addValidationsAndRestrictions', child, ele);
							}
						}
					}
				}
			}
		}
	},
	viewDataObserver: function() {
		this.rerender();
	}.observes('viewData') //No I18N
});

function addRESTDefaultValues(param, parent) {
	var paramElement = $('#' + param.paramName);
	if(parent != undefined) {
		paramElement = $(parent).find('#' + param.paramName);
	}
	
	if(param.defaultValue && param.defaultValue != "") {
		if(param.dataType == 'OPTION' || $(paramElement).is('select')) {
			$(paramElement).find('option[value="--"]').remove();
			$(paramElement).find('option[value="' + param.defaultValue + '"]').prop('selected', true);
			$(paramElement).trigger('change');
		} else if(param.dataType == 'SWITCH') {
			$(paramElement).find('.opmBtn').each(function() {
				if($(this).attr('data-value') == param.defaultValue) {
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					return false;
				}
			});
		} else if(param.dataType == 'STATUS') {
			if(param.defaultValue == $(paramElement).attr('data-true')) {
				$(paramElement).addClass('enable');
			}
//			$(paramElement).prop('checked', (param.defaultValue == $(paramElement).attr('data-true')));
			$(paramElement).trigger('change');
		} else {
			$(paramElement).val(param.defaultValue);
		}
	}
	
	if(param.children) {
		for(var i = 0; i < param.children.length; i++) {
			var child = param.children[i];
			if(child.isUserInput) {
				addRESTDefaultValues(child, paramElement);
			}
		}
	} 
}

function initializeHeaderIcons(operationData) {
	$('#slideHeaderIcons em').hide();
	if(operationData && operationData.actionDetails) {
		var subActions = operationData.actionDetails.subAction;
		if(subActions) {
			var headerActions = subActions.headerActions;
			if(headerActions) {
				for(var i = 0; i < headerActions.length; i++) {
					var action = headerActions[i];
					$('#slideHeaderIcons em.' + action.KEY).attr('data-key', action.KEY);
					$('#slideHeaderIcons em.' + action.KEY).attr('data-mkey', action.mkey);
					$('#slideHeaderIcons em.' + action.KEY).attr('title', action.NAME);
					$('#slideHeaderIcons em.' + action.KEY).show();
				}
			}
		}
	}
}

function selectMultiselectOptionsForRESTElement(element, val, replaceWithTextBox, param, fromDetailsPage) {
	if($(element).attr('data-type') == 'MULTISELECT') { //No I18N
		var delimeter = $(element).attr('data-delimiter');
		var addCustDataToMultiSelect = ((param.addMKeyDataToMultiSelect != undefined && param.addMKeyDataToMultiSelect)
		                                    || (param.loadGridDataToMultiSelect != undefined && param.loadGridDataToMultiSelect));
		if(delimeter == undefined || delimeter == null || delimeter == '') {
			delimeter = ' '; //No I18N
		}

        if(addCustDataToMultiSelect) {
            var elementId = $(element).attr('id');
            $('#'+elementId).find('.dropDownBox .dropDownList ul').empty();
        }

		var arr = [];
		if(Array.isArray(val)) {
			arr = val;
		}
		else {
			arr = val.toString().trim().split(delimeter).filter(function (s) {
				return s.trim() !== "";
			});
		}

		var replace = false;
		for(var i = 0; i < arr.length; i++) {
			var chk = $(element).find('input[type="checkbox"][data-name="' + arr[i] + '"]');

			if($(chk).length == 0 && param != undefined && addCustDataToMultiSelect) {
				addCustomDataToMultiSelect(element, arr[i], fromDetailsPage);
				continue;
			}

			if($(chk).length == 0 && replaceWithTextBox) {
				replace = true;
				break;
			}

			$(chk).prop('checked', true);
			$(chk).trigger('change');
		}
		if(replace) {
			$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + arr.toString() + "'/>"))
		}
	} else {
		var key = $(element).find('input[type="checkbox"]').first().attr('data-key');
		var ds = val.datasource;
		if(ds != undefined) {
			var found = false;
			$(element).find('input[type="checkbox"][data-ds-name="' + ds + '"]').each(function() {
				if($(this).next().text() == val[key]) {
					$(this).prop('checked', true);
					$(this).trigger('change');
					found = true;
					return false;
				}
			});
			if(!found && replaceWithTextBox) {
				$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + val[key] + "'/>"))
			}
		} else {
			if(key) {
				var found = false;
				$(element).find('input[type="checkbox"]').each(function() {
					if($(this).next().text() == val[key]) {
						$(this).prop('checked', true);
						$(this).trigger('change');
						found = true;
						return false;
					}
				});
				if(!found && replaceWithTextBox) {
					$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + val[key] + "'/>"))
				}
			} else {
				var chk = $(element).find('input[type="checkbox"][data-name="' + val + '"]');
				if($(chk).length == 0 && replaceWithTextBox) {
					$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + val + "'/>"))
				} else {
					$(chk).prop('checked', true);
					$(chk).trigger('change');
				}
			}	
		}
	}
}

function addCustomDataToMultiSelect(element, value, checked) {
	var elementId = $(element).attr('id');
	checked = checked || false;
	waitForElement(element, function(){// No I18N
		var list = $('#'+elementId).find('.dropDownBox .dropDownList ul');
		if($(list).find('li.group.custom').length == 0) {
			var customGroup = document.createElement('li'); //No I18N
			$(customGroup).addClass('group custom');
			$(customGroup).text(Ember.I18n.t('webclient.ncm.restapi.configlet.execute.customValues',this)); //No I18N
			$(list).append(customGroup);
		}
		var li = document.createElement('li'); //No I18N
		var div1 = document.createElement('div'); //No I18N
		$(div1).addClass('opmCheckBox'); //No I18N

		var div2 = document.createElement('div'); //No I18N
		var input = document.createElement('input'); //No I18N
		$(input).attr('type', 'checkbox');//No I18N
		$(input).attr('data-name', value);
		$(input).attr('id', value);

		var label = document.createElement('label'); //No I18N
		$(label).text(value);

		$(div2).append(input);
		$(div2).append(label);
		$(div1).append(div2);
		$(li).append(div1);
		$(list).append(li);

		$(input).on('change', function() {
			multiselectLiOnChange(element, this);
		});
		setTimeout(function () {
			$(input).prop('checked', checked);
			$(input).trigger('change');
		}, 500);
	});
}

function checkRestNullCondition(condition, response, checkUndefined) {
	var keyArr = condition.key.split(',');
	var parentJSON = response;
	for(var j = 0; j < keyArr.length; j++) {
		if((checkUndefined && parentJSON[keyArr[j]] != undefined) || (!checkUndefined && parentJSON[keyArr[j]] == undefined)) {
			return null;
		}
		parentJSON = parentJSON[keyArr[j]];
	}
	return parentJSON;
}

function handleExistNonExistConditions(conditions, paramElement, response, conditionKey, selector, lastSelector, parentElement, prefix) {
	var existConditions = conditions[conditionKey];
	var checkUndefined = conditionKey != 'exist'; //No I18N
	if(conditions.loopthrough) {
		for(var i = 0; i < parentElement.length; i++) {
			var processed = false;
			var element = $(selector).find(lastSelector + '_' + i).find('#' + $(paramElement).attr('id')).first();
			if(prefix) {
				element = $(prefix).find(lastSelector + '_' + i).find('#' + $(paramElement).attr('id')).first();
			}
			for(var j = 0; j < existConditions.length; j++) {
				var condition = existConditions[j];
				var selectThis = checkRestNullCondition(condition, parentElement[i], checkUndefined);
				if((selectThis != null && selectThis != undefined) || checkUndefined) {
					var value = condition.value;
					elementToBeProcessed = element;
					if($(element).length > 0) {
						renderRESTElementForEdit($(element), value);
					}
					processed = true;
					break;
				}
			}
			if(!processed && conditions.elseValue) {
				if($(element).length > 0) {
					renderRESTElementForEdit($(element), conditions.elseValue);
				}
			}
		}
		return true;
	} else {
		for(var i = 0; i < existConditions.length; i++) {
			var condition = existConditions[i];
			var selectThis = checkRestNullCondition(condition, response, checkUndefined);
			if((selectThis != null && selectThis != undefined) || checkUndefined) {
				renderRESTElementForEdit(paramElement, condition.value);
				return true;
			}
		}
	}
	return false;
}

function handleEqualityConditions(conditions, paramElement, response, conditionKey, selector, lastSelector, parentElement) {
	var equalityConditions = conditions[conditionKey];
	var checkEqual = conditionKey == 'equal'; //No I18N
	for(var i = 0; i < equalityConditions.length; i++) {
		var condition = equalityConditions[i];
		condition.value = condition.value == 'NCM_EMPTY_STRING' ? "" : condition.value; 
		var checkElement = checkRestNullCondition(condition, response);
		if(checkElement != null) {
			if((checkEqual && checkElement == condition.value) || (!checkEqual && checkElement != condition.value)) {
				renderRESTElementForEdit(paramElement, condition.set);
				return true;
			}
		}
	}
	return false;
}

function handleCustomNullConditions(conditions, paramElement, response, prefix, param) {
	if(conditions) {
		conditions = conditions.replace(new RegExp("'", "g"), "\"");
		conditions = JSON.parse(conditions);
	}
	var selector = ''; // No I18N
	var lastSelector = ''; // No I18N
	var parentElement = response;
	if(conditions.loopthrough) {
		var loopthrough = conditions.loopthrough.split(',');
		for(var i = 0; i < loopthrough.length; i++) {
			if(parentElement[loopthrough[i]] == undefined) {
				return false;
			}
			parentElement = parentElement[loopthrough[i]];
			selector += ' #' + loopthrough[i];
			lastSelector = '#' + loopthrough[i];
		}
		selector = selector.trim();
	}
	
	if(conditions.exist) {
		if(handleExistNonExistConditions(conditions, paramElement, response, 'exist', selector, lastSelector, parentElement, prefix)) { //No I18N
			return true;
		} 
	}
	if(conditions.doesntExist) {
		if(handleExistNonExistConditions(conditions, paramElement, response, 'doesntExist', selector, lastSelector, parentElement, prefix)) { //No I18N
			return true;
		} 
	}
	if(conditions.get) {
		var getElement = conditions.get;
		if(conditions.loopthrough) {
			for(var i = 0; i < parentElement.length; i++) {
				var obj = parentElement[i];
				var value = obj[getElement];
				var element = $(selector).find(lastSelector + '_' + i).find('#' + $(paramElement).attr('id')).first();
				if($(element).length > 0) {
					renderRESTElementForEdit($(element), value);
				}
			}
			return true;
		} else {
			renderRESTElementForEdit($(paramElement), response[getElement]);
			return true;
		}
	}
	if(conditions.equal) {
		if(handleEqualityConditions(conditions, paramElement, response, 'equal', selector, lastSelector, parentElement)) { //No I18N
			return true;
		}
	}
	if(conditions.notEq) {
		if(handleEqualityConditions(conditions, paramElement, response, 'notEq', selector, lastSelector, parentElement)) { //No I18N
			return true;
		}
	}
	if(conditions.elseValue) {
		renderRESTElementForEdit(paramElement, conditions.elseValue);
		return true;
	}
	
	if(conditions.fromRange) {
		var condition = conditions.fromRange;
		var keyElement = condition.key;
		var keyValue = response[keyElement];
		if(keyValue) {
			var values = keyValue.split("-");
			if(values.length == 2) {
				var value = values[condition.halfIndex];
				renderRESTElementForEdit(paramElement, value);
			} else if(values.length == 1) {
				var value = values[0];
				renderRESTElementForEdit(paramElement, value);
			}
		} else {
			removeExistingData($(paramElement), param);
		}
	}
	return false;
}

function handleOptionFilter(ele, filter, response) {
	filter = filter.replace(new RegExp("'", "g"), "\"");
	filter = JSON.parse(filter);
	if(filter.hideOnCondition) {
		var conditions = filter.hideOnCondition;
		for(var i = 0; i < conditions.length; i++) {
			var cond = conditions[i];
			var requireElse = true;
			if(cond.condition.eq) {
				var equalities = cond.condition.eq.split(',');
				var param = $(ele).attr('id');
				if(cond.condition.param) {
					param = cond.condition.param;
				}
				for(var j = 0; j < equalities.length; j++) {
					var equality = equalities[j];
					equality = (equality == 'NCM_EMPTY_STRING') ? "" : equality;
					if(response[param] == equality) {
						requireElse = false;
						var options = cond.options.split(',');
						for(var k = 0; k < options.length; k++) {
							$(ele).children('option[value="' + options[k] + '"]').remove();
						}
						break;
					} 
				}
			}
			if(requireElse && cond["else"]) {
				var options = cond["else"].split(',');
				for(var j = 0; j < options.length; j++) {
					$(ele).children('option[value="' + options[j] + '"]').remove();
				}
			}
		}
	}
}

function renderRESTNullParamForEdit(param, response, dependencyKey, prefix, ancestors) {
	var paramElement = $('#' + param.paramName);
	if(prefix != undefined) {
		paramElement = $(prefix).find('#' + param.paramName);
	}
	
	if(param.optionfilter) {
		handleOptionFilter(paramElement, param.optionfilter, response);
	}
	
	if(param.paramType == "NULL_PARAM" || param.CUSTOM_NULL_HANDLING) { //No I18N
		if(param.CUSTOM_NULL_HANDLING) {
			if(handleCustomNullConditions(param.CUSTOM_NULL_HANDLING, paramElement, response, prefix, param)) {
				return;
			}
		}
		var rawDependency = param[dependencyKey];
		if(rawDependency) {
			rawDependency = rawDependency.replace(new RegExp("'", "g"), "\"");
			var dependency = JSON.parse(rawDependency);
			var parentJSON = response;
			if(ancestors) {
				var ancestorArray = ancestors.split(',');
				for(var i = 0; i < ancestorArray.length; i++) {
					if(!parentJSON[ancestorArray[i]]) {
						removeExistingData($(paramElement), param);
						return;
					}
					parentJSON = parentJSON[ancestorArray[i]];
				}
			}
			var valueSet = false;
			for(var key in dependency) {
				if(dependency[key].show) {
					var showArray = dependency[key].show;
					var selectThis = true;
					for(var i = 0; i < showArray.length; i++) {
						if(parentJSON[showArray[i]] == undefined) {
							selectThis = false;
							break;
						}
					}
					if(selectThis) {
						renderRESTElementForEdit(paramElement, key);
						valueSet = true;
						break;
					}
				}
			}
			if(!valueSet) {
				removeExistingData($(paramElement), param);
			}
		} else if(response[param.paramName]) {
			removeExistingData(paramElement, param);
			renderRESTElementForEdit(paramElement, response[param.paramName]);
		}
	} 
	
	if(param.children) {
		var parent = param.paramName;
		if(ancestors) {
			parent = ancestors + "," + parent;
		}
		for(var i = 0; i < param.children.length; i++) {
			var child = param.children[i];
			if(child.isUserInput) {
				if(child.paramType == "NULL_PARAM" || child.children || child.CUSTOM_NULL_HANDLING) { //No I18N
					renderRESTNullParamForEdit(child, response, dependencyKey, paramElement, parent);
				}
			}
		}
	}
}

function removeExistingData(element, param, parent) {
	var defaultValue = null;
	if(param && param.defaultValue) {
		defaultValue = param.defaultValue;
	}
	if(parent) {
		element = $(parent).find(element);
	}
	if($(element).is('input:text') || $(element).is('input[type="number"]') || $(element).is('input[type="password"]') || $(element).is('textarea')) {
		if(defaultValue != null) {
			$(element).val("");
			return;
		}
		$(element).val("");
		return;
	}
	if($(element).is('select')) {
		var disabled = false;
		if($(element).prop("disabled")) {
			disabled = true;
			$(element).prop('disabled', false);
		}
		if(defaultValue == null) {
			defaultValue = $(element).find('option:first').attr('value');
		}
		if($(element).is(':visible')) {
			$(element).select2("trigger", "select", {
			    data: { id: defaultValue }
			});
		}
		if($(element).prop("disabled")) {
			$(element).prop('disabled', true);
		}
		return;
	}
	if($(element).hasClass('credentialBox')) {
		var disabledEle = $(element).find('input[type="checkbox"]:disabled');
		var disabled = false;
		if($(disabledEle).length > 0) {
			disabled = true;
			$(disabledEle).prop('disabled', false);
		}
		if($(element).is(':visible')) {
			$(element).find('input[type="checkbox"]:checked').click();
		}
		if(disabled) {
			$(disabledEle).prop('disabled', true);
		}
		return;
	}
	if($(element).hasClass('btnGroup')) {
		var disabled = false;
		if($(element).css('pointerEvents') == 'none') {
			disabled = true;
			$(element).css({'pointerEvents':'auto'});
		}
		if(defaultValue != null) {
			$(element).find('.opmBtn[data-value="' + defaultValue + '"]').click();
			if(disabled) {
				$(element).css({'pointerEvents':'none'});
			}
			return;
		}
		if($(element).is(':visible')) {
			$(element).find('.opmBtn:first').click();
		}
		if(disabled) {
			$(element).css({'pointerEvents':'none'});
		}
		return;
	}
	if($(element).hasClass('RESTCOLOR')) {
		$(element).find('input.rest-color').val("");
		$(element).find('.emptySpace').css('background-color', '#f0f0f0');
		return;
	}
	if($(element).find('.tags_textbox').length > 0) {
		$(element).find('.tags_textbox em').remove();
		return;
	}
	if(param.children) {
		for(var i = 0; i < param.children.length; i++) {
			var child = param.children[i];
			if(child.isUserInput) {
				if(child.paramType != "NULL_PARAM" && !child.CUSTOM_NULL_HANDLING) { //No I18N
					removeExistingData("#" + child.paramName, child, element); 
				}
			}
		}
	}
}

function preProcessRenderingData(value, processor) {
	switch(processor.key) {
		case "split":
			if(typeof value === "string" && !value.trim().startsWith('[')) {
				value = value.split(processor.value);
			}
		break;
		case "loopthrough":
			var loopthrough = processor.value.split(',');
			var parentElement = value;
			for(var i = 0; i < loopthrough.length; i++) {
				if(parentElement[loopthrough[i]] == undefined) {
					break;
				}
				parentElement = parentElement[loopthrough[i]];
			}
			value = parentElement;
		break;
	}
	return value;
}

function renderRESTElementForEdit(element, value, replaceWithTextBox, param, fromDetailsPage) {
	if(param && param.renderPreProcess) {
		var preProcess = param.renderPreProcess;
		preProcess = preProcess.replace(new RegExp("'", "g"), "\"");
		preProcess = JSON.parse(preProcess);
		for(var i = 0; i < preProcess.length; i++) {
			value = preProcessRenderingData(value, preProcess[i]);
		}
	}
	if($(element).is('input:text') || $(element).is('input[type="number"]') || $(element).is('input[type="password"]') || $(element).is('textarea')) {
		$(element).val(value);
	} else if($(element).hasClass('tags_textbox')) {
		// Element is directly the tags_textbox - populate em tags from array or string //No I18N
		$(element).find('em').remove();
		var tagValues = Array.isArray(value) ? value : value.split(' ');
		for(var i = 0; i < tagValues.length; i++) {
			var emTag = document.createElement('em'); //No I18N
			$(emTag).text(tagValues[i]);
			$(emTag).attr('title', tagValues[i]);
			$(element).append(emTag);
		}
	} else if($(element).is(':checkbox')) {
		var disabled = false;
		if($(element).prop("disabled")) {
			disabled = true;
			$(element).prop('disabled', false);
		}
		$(element).prop('checked', $(element).attr('data-true') == ""+value);
		$(element).trigger('change');
		if(disabled) {
			$(element).prop('disabled', true);
		}
	} else if($(element).is('select')) {
		var disabled = false;
		if($(element).prop("disabled")) {
			disabled = true;
			$(element).prop('disabled', false);
		}
		if(typeof value === 'object' && value !== null) {
			var key = $(element).find('option').first().attr('data-key');
			var ds = value.datasource;
			if(ds != undefined) {
				var option = $(element).find('option[data-ds-name="' + ds + '"][value="' + value[key] + '"]');
				if($(option).length == 0) {
					if($(element).attr('data-custom') !== 'false' || $(element).attr('data-custom') !== undefined) {
						addCustomValueToSelect($(element), value);
					} else if(replaceWithTextBox) {
						$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + value[key] + "'/>"));
					}
				} else {
					$(option).prop('selected', true);	
				}
			} else {
				var option = $(element).find('option[value="' + value[key] + '"]');
				if($(option).length == 0) {
					if($(element).attr('data-custom') !== 'false' || $(element).attr('data-custom') !== undefined) {
						addCustomValueToSelect($(element), value);
					} else if(replaceWithTextBox) {
						$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + value[key] + "'/>"));
					}
				} else {
					$(option).prop('selected', true);	
				}
			}
		} else {
			var option = $(element).find('option[value="' + value + '"]');
			if($(option).length == 0) {
				if($(element).attr('data-custom') !== 'false' || $(element).attr('data-custom') !== undefined) {
					addCustomValueToSelect($(element), value);
				} else if(replaceWithTextBox) {
					$(element).replaceWith($("<input type='text' id='" + $(element).attr("id") + "' readonly value='" + value + "'/>"));
				}
			} else {
				$(option).prop('selected', true);	
			}
		}
		if ($(element).data('select2')) {
			$(element).select2("destroy");
		}
		applySelect2ToRestElements(element);
		$(element).trigger('change');
		if(disabled) {
			$(element).prop('disabled', true);
		}
	} else if($(element).hasClass('btnGroup')) {
		var checkInterval = setInterval(function() {
			if($(element).is(':visible')) {
				$(element).find('.opmBtn').each(function() {
					if($(this).attr('data-value') == value) {
						var disabled = false;
						if($(this).css('pointerEvents') == 'none') {
							disabled = true;
							$(this).css({'pointerEvents':'auto'});
						}
						$(this).click();
						if(disabled) {
							$(this).css({'pointerEvents':'none'});
						}
						return false;
					}
				});
				clearInterval(checkInterval);
			}
		}, 100);
	} else if($(element).hasClass('credentialBox')) {
		var disabled = false;
		if($(element).find('input[type="checkbox"]:disabled').length > 0) {
			$(element).find('input[type="checkbox"]').prop('disabled', false);
			disabled = true;
		}
		$(element).find('input[type="checkbox"]:checked').trigger('click');
		if($(element).attr('data-type') == 'MULTISELECT') {//No I18N
			selectMultiselectOptionsForRESTElement(element, value, replaceWithTextBox, param, fromDetailsPage);
		} else {
			for(var i = 0; i < value.length; i++) {
				selectMultiselectOptionsForRESTElement(element, value[i], replaceWithTextBox, param, fromDetailsPage);
			}
		}
		if(disabled){
			$(element).find('input[type="checkbox"]').prop('disabled', true);
		}
	} else if($(element).hasClass('RESTCOLOR')){
		var selectedColor = $(element).find('.csColorList li[cscolorvalue="' + value + '"]');
		if($(selectedColor).length == 0) {
			$(element).find('input.rest-color').val("");
			$(element).find('.emptySpace').css('background-color', '#f0f0f0');
		} else {
			$(selectedColor).click();
		}
	} else if($(element).hasClass('ncmNatEnableDisableBtn')){
		var disabled = false;
		if($(element).css('pointerEvents') == 'none') {
			disabled = true;
			$(element).css({'pointerEvents':'auto'});
		}
		"" + value == $(element).attr('data-true') ? $(element).addClass('enable') : $(element).removeClass('enable');
		if($(element).is(":visible")) {
			$(element).trigger('change');
		}
		if(disabled) {
			$(element).css({'pointerEvents':'none'});
		}
	} else if($(element).hasClass('opmFormCol')){
		$(element).children('.ncmRestElementSubForm').not(':first').remove();
		var id = $(element).attr('id');

		if(Array.isArray(value)) {
			$(element).find('.tags_textbox em').remove();
			// For TAG type, always populate tags_textbox directly from array values //No I18N
			if(param && param.dataType == 'TAG' && $(element).find('.tags_textbox').length > 0) { //No I18N
				var tagBox = $(element).find('.tags_textbox');
				for(var i = 0; i < value.length; i++) {
					var em = document.createElement('em'); //No I18N
					$(em).text(value[i]);
					$(em).attr('title', value[i]);
					$(tagBox).append(em);
				}
			} else {
				for(var i = 0; i < value.length; i++) {
					if($(element).find('.ncmRestElementSubForm').length > 0) {
					if(i > 0) {
						$(element).find('.ncmRestElementSubForm').first().find('.add_icon').trigger('click');
					}
					var ele = $(element).find('#' + id + '_' + i);
					if($(ele).length > 0) {
						var obj = value[i];
						if(typeof obj == 'object') {
							for(var key in obj) {
								if(key.startsWith('@')) {
									continue;
								}
								var el = $(ele).find('#' + key);
								if($(el).length > 0) {
									renderRESTElementForEdit(el, obj[key], replaceWithTextBox);
								}
							} 
						}
					}
				} else {
					var obj = value[i];
					var el = $(element).find('.tags_textbox');
					if($(el).length > 0) {
						var em = document.createElement('em');
						$(em).text(obj);
						$(em).attr('title', obj);
						$(el).append(em);
					} else {
						if($(element).hasClass('selBox')) {
							el = $(element).find('select');
							var tempOption = $(el).find('option[value="' + value + '"]');
							if($(tempOption).length == 0 && replaceWithTextBox) {
								
							} else {
								$(tempOption).prop('selected', true)
								$(el).select2("destroy");
								applySelect2ToRestElements(el);
								$(el).trigger('change');
							}
						}
					}
				}
			}
			}
		} else {
			if(typeof value === "string") {
				try {
					value = JSON.parse(value);
				} catch(e) {
					
				}
			}
			for(var key in value) {
				if(key.startsWith('@')) {
					continue;
				}
				var el = $(element).find('#' + key);
				if($(el).length > 0) {
					renderRESTElementForEdit(el, value[key], replaceWithTextBox);
				}
			}
		}
	}
}

OPMClient.NcmRestApiComponent = Ember.Component.extend({
	valid: false,
	templateName: "components/ncm-rest-api", //No I18N
	connParams: {},
	selectedParams:[],
    multiVendor:false,
    hasNonRestDevices:false,
    multipleResources: false,
	didInsertElement: function() {
		this._super();
		var _self = this;
//		var resourceIds = this.get('resourceIDs');
//		if(resourceIds == undefined || resourceIds == null) {
//			return;
//		}
        var isViewOnly = this.get('isViewOnly');

		var resourceIds = getCredentialResourceIDs();
		var data = {};
		data.resourceIds = JSON.stringify(resourceIds);
		if(isViewOnly !== undefined && isViewOnly === true){
		    data.isViewOnly = true;
		    data.restTemplateId = OPMClient.NCMInventoryRestAPIController.restTemplateId;
        }
		if(resourceIds !== undefined && resourceIds.length > 0){
			for(var i=0;i<resourceIds.length;i++){
				if(isNaN(resourceIds[i])){
					return;
				}
			}
		}
		var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/ncmconfiglets/getRestAPICredentials', data); // No I18N
        if(response && response.multiVendor) {
            this.set("multiVendor", true);
            return;
        }

        if(!response || !response.REST_API_SUPPORTED || response.REST_API_SUPPORTED === "false") {
			return;
		}

        if(response.hasNonRestDevices) {
            this.set("hasNonRestDevices", true);
        }

        if(response.multipleResources) {
            this.set("multipleResources", true);
        }

        this.set("valid", true);
		this.set("connParams",response.PARAMS);
		this.set("paramValues", response.REST_PARAM_VALUES);

		setTimeout(function() {
			_self.send('addDependencyListeners');
			_self.send('addDefaultValues');
			if(response.CHECK_REST_API) {
				$('#useRestAPI').prop('checked', true);
				$('#useRestAPI').trigger('change');
			}
			initializeRESTComponents($('#restAPIDiv'), true);
			$("select.select2").each(function() {
				if(!$(this).hasClass('select2-hidden-accessible')) {
					$(this).select2();
				}
			});
			_self.send('addHelpForRemoteHost');
			_self.send('renderUIForEdit');
		}, 500);
	},
	actions: {
		useRestAPIToggle: function() {
			if($('#useRestAPI').is(':checked')) {
				$('#restAPIParams').show();
			} else {
				$('#restAPIParams').hide();
			}
		}, addHelpForRemoteHost: function() {
		    var currentHost = $("#RemoteHost").val();
		    if(currentHost && currentHost.indexOf(":") == -1) {
                var row = $('#restAPIDiv').find("#RemoteHost").closest(".opmFormRow");
                var ele = document.createElement("div");
                var p = document.createElement('p');
                $(p).addClass('restartMsg withoutIcon');
                $(p).html(Ember.I18n.t("webclient.ncm.restapi.remotehost.info", {param0: currentHost}));
                $(p).css({"max-width": "200px","top": "21px"});
                $(ele).append(p);
                $(row).append(ele);
		    }
		}, addDefaultValues: function() {
			var _self = this;
			var connParams = _self.get('connParams');
			connParams.forEach(function(param) {
				var paramElement = $('#' + param.paramName);
				if(param.default_Value && param.default_Value != "") {
					if(param.dataType == 'OPTION') {
						$(paramElement).find('option[value="--"]').remove();
						$(paramElement).find('option[value="' + param.default_Value + '"]').prop('selected', true);
						$(paramElement).trigger('change');
					} else if(param.dataType == 'SWITCH') {
						$(paramElement).find('.opmBtn').each(function() {
							if($(this).attr('data-value') == param.default_Value) {
								$(this).siblings().removeClass('active');
								$(this).addClass('active');
								return false;
							}
						});
					} else if(param.dataType == 'STATUS') {
						if(param.default_Value == $(paramElement).attr('data-true')) {
							$(paramElement).addClass('enable');
						}
//						$(paramElement).prop('checked', (param.default_Value == $(paramElement).attr('data-true')));
						$(paramElement).trigger('change');
					} else {
						$(paramElement).val(param.default_Value);
					}
				}
			});
		}, addDependencyListeners: function() {
			var _self = this;
			var connParams = _self.get('connParams');
			connParams.forEach(function(param) {
				if(param.dependency || param.children) {
					addDependencyToRESTElement(param, "dependency"); //No I18N
				}
			});
		}, renderUIForEdit: function() {
			var _self = this;
			var paramValues = _self.get('paramValues');
			for(var key in paramValues) {
				var ele = $('#' + key);
				if($(ele).length > 0) {
					renderRESTElementForEdit(ele, paramValues[key]);
				}
			}
		}
	}, dataObserver: function() {
		this.rerender();
	}.observes('resourceIDs')
});

OPMClient.NcmControllerCredentialsComponent = Ember.Component.extend({
	templateName: "components/ncm-controller-credentials", //No I18N
	params: {},
	didInsertElement: function() {
		this._super();
		var _self = this;
		var connParams = _self.get('connParams');
        if(!connParams || connParams.length == 0) {
            return;
        }
		setTimeout(function() {
			_self.send('addDependencyListeners');
			_self.send('addDefaultValues');
			initializeRESTComponents($('#restAPIDiv'), true);
			$("select.select2").each(function() {
				if(!$(this).hasClass('select2-hidden-accessible')) {
					$(this).select2();
				}
			});
			_self.send('renderUIForEdit');
		}, 500);
	},
	actions: {
		addDefaultValues: function() {
			var _self = this;
			var connParams = _self.get('connParams');
			connParams.forEach(function(param) {
				var paramElement = $('#' + param.paramName);
				if(param.defaultValue && param.defaultValue != "") {
					if(param.dataType == 'OPTION') {
						$(paramElement).find('option[value="--"]').remove();
						$(paramElement).find('option[value="' + param.defaultValue + '"]').prop('selected', true);
						$(paramElement).trigger('change');
					} else if(param.dataType == 'SWITCH') {
						$(paramElement).find('.opmBtn').each(function() {
							if($(this).attr('data-value') == param.defaultValue) {
								$(this).siblings().removeClass('active');
								$(this).addClass('active');
								return false;
							}
						});
					} else if(param.dataType == 'STATUS') {
						if(param.defaultValue == $(paramElement).attr('data-true')) {
							$(paramElement).addClass('enable');
						}
//						$(paramElement).prop('checked', (param.default_Value == $(paramElement).attr('data-true')));
						$(paramElement).trigger('change');
					} else {
						$(paramElement).val(param.defaultValue);
					}
				}
			});
		}, addDependencyListeners: function() {
			var _self = this;
			var connParams = _self.get('connParams');
			connParams.forEach(function(param) {
				if(param.dependency || param.children) {
					addDependencyToRESTElement(param, "dependency"); //No I18N
				}
			});
		}, renderUIForEdit: function() {
			var _self = this;
			var paramValues = _self.get('credentials');
			for(var key in paramValues) {
				var ele = $('#' + key);
				if($(ele).length > 0) {
					renderRESTElementForEdit(ele, paramValues[key]);
				}
			}
		}
	}, dataObserver: function() {
		this.rerender();
	}.observes('connParams')
});

function showHideRestElements(showArray, hideArray, prefix) {
	if(showArray != undefined) {
		showArray.forEach(function(element) {
			if(prefix == undefined) {
				$('#' + element).closest('.opmFormRow').show();
				setRestColumnWidth($('#' + element).closest('.opmFormRow'));
			} else {
				$(prefix).find('#' + element).closest('.opmFormRow').show();
				setRestColumnWidth($(prefix).find('#' + element).closest('.opmFormRow'));
			}
		});
		showArray.forEach(function(element) {
			if(prefix == undefined) {
				if($('#' + element).is(":visible")) {
					$('#' + element).trigger('change');
				}
			} else {
				if($(prefix).find('#' + element).is(":visible")) {
					$(prefix).find('#' + element).trigger('change');
				}
			}
		});
	}
	if(hideArray != undefined) {
		hideArray.forEach(function(element) {
			if(prefix == undefined) {
				$('#' + element).closest('.opmFormRow').hide();
			} else {
				$(prefix).find('#' + element).closest('.opmFormRow').hide();
			}
		});
	}
}

function addDependencyToRESTElement(param, dependencyKey, prefix) {
	var rawDependency = param[dependencyKey];
	var paramElement = $('#' + param.paramName);
	if(prefix != undefined) {
		paramElement = $(prefix).find('#' + param.paramName);
	}
	if(rawDependency) {
		rawDependency = rawDependency.replace(new RegExp("'", "g"), "\"");
		var dependency = JSON.parse(rawDependency);
		if($(paramElement).is(":checkbox")) {
			var enableObject = dependency[$(paramElement).attr('data-true')];
			var disableObject = dependency[$(paramElement).attr('data-false')];
			var showArray = [];
			var hideArray = [];
			if(enableObject || disableObject) {
                if(enableObject.hasOwnProperty('show')) {
                    showArray = enableObject.show;
                }
                if(enableObject.hasOwnProperty('hide')) {
                    hideArray = enableObject.hide;
                }
                $(paramElement).on('change', function() {
                    var subForm = $(this).closest('.ncmRestElementSubForm.opmFormgroup');
                    if(subForm.length > 0) {
                        prefix = subForm;
                    }
                    if($(this).is(':checked')) {
                        showHideRestElements(showArray, hideArray, prefix);
                    } else {
                        showHideRestElements(hideArray, showArray, prefix);
                    }
                });
                setTimeout(function() {
                    if($(paramElement).is(":visible")) {
                        $(paramElement).trigger('change');
                    }
                }, 800);
			}
		} else if($(paramElement).hasClass("ncmNatEnableDisableBtn")) {
			var enableObject = dependency[$(paramElement).attr('data-true')];
			var disableObject = dependency[$(paramElement).attr('data-false')];
			var showArray = [];
			var hideArray = [];
			if(enableObject || disableObject) {
                if(enableObject.hasOwnProperty('show')) {
                    showArray = enableObject.show;
                }
                if(enableObject.hasOwnProperty('hide')) {
                    hideArray = enableObject.hide;
                }
                $(paramElement).on('change', function() {
                    var subForm = $(this).closest('.ncmRestElementSubForm.opmFormgroup');
                    if(subForm.length > 0) {
                        prefix = subForm;
                    }
                    if($(paramElement).hasClass("enable")) {
                        showHideRestElements(showArray, hideArray, prefix);
                    } else {
                        showHideRestElements(hideArray, showArray, prefix);
                    }
                });
                setTimeout(function() {
                    if($(paramElement).is(":visible")) {
                        $(paramElement).trigger('change');
                    }
                }, 800);
			}
		} else if($(paramElement).is("select")) {
			var val = $(paramElement).val();
			if(val == '--') {
				$(paramElement).find('option[value="--"]').remove();
				$(paramElement).find('option').first().prop('selected', true);
			}
			$(paramElement).on('change', function() {
				var selectedValue = $(this).val();
				var subForm = $(this).closest('.ncmRestElementSubForm.opmFormgroup');
				if(subForm.length > 0) {
					prefix = subForm;
				}
				if(dependency.conditionalValues) {
					var conditions = dependency.conditionalValues;
					for(var i = 0; i < conditions.length; i++) {
						var condition = conditions[i];
						if(condition.contains) {
							var isValid = selectedValue.indexOf(condition.contains) != -1;
							if(condition.checkName == 'true') {
								isValid = $(this).find('option[value="' + selectedValue + '"]').text().indexOf(condition.contains) != -1;
							}
							if(isValid) {
								selectedValue = condition.value;
								break;
							}
						}
						if(condition.customData) {
							var id = $(this).find('option[value="' + selectedValue + '"]').closest('optGroup').attr('id');
							if(id && id.includes('customGroup')) {
								selectedValue = condition.customData;
								break;
							}
						}
						if(condition.is) {
							var values = condition.is.split(',');
							if(values.contains(selectedValue)) {
								break;
							} 
						}
						var elseString = "else"; //No I18N
						if(condition[elseString]) {
							selectedValue = condition[elseString];
							break;
						}
					}
				}
				addDependencyForSelectedValue(dependency, selectedValue, prefix);
			});
			setTimeout(function() {
				if($(paramElement).is(":visible")) {
					$(paramElement).trigger('change');
				}
			}, 500);
		} else if($(paramElement).hasClass('btnGroup')) {
			$(paramElement).find('.opmBtn').on('click', function() {
				var selectedValue = $(this).attr('data-value');
				var subForm = $(this).closest('.ncmRestElementSubForm.opmFormgroup');
				if(subForm.length > 0) {
					prefix = subForm;
				}
				addDependencyForSelectedValue(dependency, selectedValue, prefix);
			});
			if($(paramElement).find('.opmBtn.active').length == 0) {
				$(paramElement).find('.opmBtn:first').addClass('active');
			}
			setTimeout(function() {
				var checkInterval = setInterval(function() {
					if($(paramElement).is(':visible')) {
						$(paramElement).find('.opmBtn.active').click();
						clearInterval(checkInterval);
					}
				}, 100);
			}, 500);
		}
		if($(paramElement).is("input:text")) {
            if(dependency.methodCall) {
                if(OPMClient.NCMRestAPIDependencyMethods.hasOwnProperty(dependency.methodCall)) {
                    $(paramElement).off('keyup').on('keyup', function() {
                        OPMClient.NCMRestAPIDependencyMethods[dependency.methodCall]();
                    });
                }
            }
        } else if(dependency.methodCall && OPMClient.NCMRestAPIDependencyMethods.hasOwnProperty(dependency.methodCall)){
            var trigger = 'change';
            if($(paramElement).hasClass('btnGroup')) {
                trigger = 'click';
            }
            if($(paramElement).hasClass('credentialBox')) {
                $(paramElement).find('.dropDownList ul li input[type="checkbox"]').on(trigger, function() {
                    OPMClient.NCMRestAPIDependencyMethods[dependency.methodCall]();
                });
            } else {
                $(paramElement).on(trigger, function() {
                    OPMClient.NCMRestAPIDependencyMethods[dependency.methodCall]();
                });
            }
        }
	}
	if(param.children) {
		for(var i = 0; i < param.children.length; i++) {
			var child = param.children[i];
			if(child.isUserInput) {
				if(child[dependencyKey] || child.children) {
					addDependencyToRESTElement(child, dependencyKey, paramElement);
				}
			}
		}
	}
}

function addDependencyForSelectedValue(dependency, selectedValue, prefix){
	if(dependency[selectedValue] != undefined) {
		var object = dependency[selectedValue];
		var showArray = [];
		var hideArray = [];
		if(object.hasOwnProperty('show')) {
			showArray = object.show;
		}
		if(object.hasOwnProperty('hide')) {
			hideArray = object.hide;
		}
		showHideRestElements(showArray, hideArray, prefix);
		
		if(object.val) {
			var valuesToBeSet = object.val;
			for(var key in valuesToBeSet) {
				var ele = $('#' + key);
				if($(ele).length > 0) {
					renderRESTElementForEdit(ele, valuesToBeSet[key]);
				}
			}
		}
	}
}

OPMClient.NcmDevicegroupBarDetailsComponent = Ember.Component.extend({
	templateName: "components/ncm-devicegroup-bar-details",
	showGroup: false,
	showBar: false,
	showPie: false,
	groupIndex : -1,
	reloadDGroup:false,
	didInsertElement:function() {
		var dGroup = this.get('dGroupInfo');
		var self = this;
		this.groupIndex = dGroup.id;
		NcmDGroupComponentArray[dGroup.id] = self;
		if(dGroup.drawType == 'pie') {
			self.setProperties({'showPie': true, 'showGroup': true, 'dGroup' : dGroup});
			var currentBarWidth =  $('#BarHolderSubnets').width();
			currentBarWidth = currentBarWidth / 3;
			if(currentBarWidth <= 500) {
				currentBarWidth = 500;
			} else if(currentBarWidth >= 600) {
				currentBarWidth = 600;
			}
			var chartHeight = (currentBarWidth - 200) / 2;
			if(currentBarWidth > 400) {
				$('.deviceGroupList .groupStatusCount > div > div').height(chartHeight);
			}
			$.ajax({
				type: 'GET', //No I18N
				url: window.OPM.apiUrlPattern + "/ncmdevice/listDeviceGroupDetails?dGroupId="+dGroup.id,//No I18N
				async: true,//No I18N
				data: { "advancedFilters": JSON.stringify(OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects)}, //No I18N
				success: function(responseData){
					if(responseData.isSuccess != true) {
						var array_element = responseData.dGroup;
						$("#dGroup_"+array_element.id+" .groupName").attr("data-count", "( " + array_element.deviceCount +" ) ");
						var arraObj={
						    "placeholder":[],//No I18N
						    "chartobj":[]//No I18N
						};
						var columns = [
							{
								"dataindex": 0,
								"columnname": Ember.I18n.t("jsp.commonstr.Status",this),
								"datatype": "ordinal"
							},
							{
								"dataindex": 1,
								"columnname": Ember.I18n.t("webclient.general.Devices",this),
								"datatype": "numeric"
							}
						];
						
						var legendVal = { //No I18N
							"colors":array_element.colors,//NO I18N
							"enabled": "false" //No I18N
						};
						
						var pltOptionsVal = {
							"pie": {
								"gradients": {
								},
								"datalabels": {
									"show": false,
									"innerLabel": {
										"show": true,
										"showAs": "{{val(1)}}",
										"fontSize": 12,
										fontColor:'#000000'
									}
								},
								strokeWidth:"0.3",
								outerPadding:"0",
								maxRadius:"250"
							}
						};
						
						var events = {
							"click"	: function (event, chartdata, chartobject){
								OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusType=chartdata.data[2].value;
								OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusTabType=chartdata.data[3].value;
								OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusString=OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusStrings[chartdata.data[2].value];
								OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusTabs=OPMClient.NCMInventoryDGroupDetailsController[chartdata.data[2].value];
								OPMClient.NCMInventoryDGroupDetailsController.dGroupName=$(event.target).closest('.SingleBar.deviceGroupList').attr('data-dgname');
								OPMClient.NCMInventoryDGroupDetailsController.dGroupId=$(event.target).closest('.SingleBar.deviceGroupList').attr('data-dgid');
								location.href=location.href+"/NCMDGroupStatus";
							}
						};
						
						var chartObj = {
							id:"StartupConflictDiv_"+array_element.id,//No I18N
							type:'pie', //dial, bar,area,line,pie //No I18N
							subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
							customClass:"opm_pie",//No I18N
							jsonData:(array_element.deviceCount > 0)? array_element.startupConflict.data:[],
							height:chartHeight,
							columns:columns,
							events: events,
							"legend": legendVal,
							"plotoptions": pltOptionsVal
						};
						var mappingobj={};
						arraObj.chartobj.push(chartObj);
						arraObj.placeholder.push("StartupConflictDiv_"+array_element.id); //No I18N
						
						var chartObj1 = {
							id:"BackupStatusDiv_"+array_element.id,//No I18N
							type:'pie', //dial, bar,area,line,pie //No I18N
							subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
							customClass:"opm_pie",//No I18N
							jsonData:(array_element.deviceCount > 0)? array_element.backupData.data:[],
							height:chartHeight,
							columns:columns,
							events: events,
							"legend": legendVal,
							"plotoptions": pltOptionsVal
						};
						var mappingobj={};
						arraObj.chartobj.push(chartObj1);
						arraObj.placeholder.push("BackupStatusDiv_"+array_element.id); //No I18N
						
						var chartObj2 = {
							id:"ComplianceStatusDiv_"+array_element.id,//No I18N
							type:'pie', //dial, bar,area,line,pie //No I18N
							subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
							customClass:"opm_pie",//No I18N
							jsonData:(array_element.deviceCount > 0)? array_element.compliance.data:[],
							height:chartHeight,
							columns:columns,
							events: events,
							"legend": legendVal,
							"plotoptions": pltOptionsVal
						};
						var mappingobj={};
						arraObj.chartobj.push(chartObj2);
						arraObj.placeholder.push("ComplianceStatusDiv_"+array_element.id); //No I18N
						
						var chartObj3 = {
							id:"BaselineConflictDiv_"+array_element.id,//No I18N
							type:'pie', //dial, bar,area,line,pie //No I18N
							subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
							customClass:"opm_pie",//No I18N
							jsonData:(array_element.deviceCount > 0)? array_element.baselineConflict.data:[],
							height:chartHeight,
							columns:columns,
							events: events,
							"legend": legendVal,
							"plotoptions": pltOptionsVal
						};
						
						var mappingobj={};
						arraObj.chartobj.push(chartObj3);
						arraObj.placeholder.push("BaselineConflictDiv_"+array_element.id); //No I18N
						ncmZChart(arraObj);
						if(dGroup.id == 1 || dGroup.name == 'All Devices Group') {
							$("#dGroup_"+dGroup.id+" .icon-configedit").hide();
						}
					} else {
						var	cls = "errorMsg"; //No I18N
						opm_infoMsgs(cls, responseData.statusMsg); //No I18N
					}
				}
			});
		} else {
			var responseData = opm_ajaxGetResponse(eeClientReqToProbe(window.OPM.apiUrlPattern + '/ncmdevice/listDeviceGroupDetails?dGroupId='+dGroup.id)); //No I18N
			if(responseData.isSuccess != true) {
				var array_element = responseData.dGroup;
				var bars = new Array();
				var info = new Array();
				var graph = new Array();
				var total = 0;
				var seveirty = [5, 1, 2];
				for (var index = 0; index < array_element.backupData.data.length; index++) {
					var element = array_element.backupData.data[index];
					info.push({type:element[2], tab:element[3],text:element[0], value: element[1]});
					total = total + element[1];
				}
				
				for (var index = 0; index < array_element.backupData.data.length; index++) {
					var element = array_element.backupData.data[index];
					graph.push({type:element[2], tab:element[3], severity:'severity_'+ seveirty[index], percentage: (element[1] / total) * 100 });
				}
				bars.push({title:Ember.I18n.t("ncm.config.backup.status",this), info: info, graph: graph});
				
				var info = new Array();
				var graph = new Array();
				for (var index = 0; index < array_element.compliance.data.length; index++) {
					var element = array_element.compliance.data[index];
					info.push({type:element[2], tab:element[3],text:element[0], value: element[1]});
					graph.push({type:element[2], tab:element[3],severity:'severity_'+ seveirty[index], percentage: (element[1] / total) * 100 });
				}
				
				bars.push({title:Ember.I18n.t("jsp.commonstr.ComplianceStatus",this), info: info, graph: graph});
				
				var info = new Array();
				var graph = new Array();
				for (var index = 0; index < array_element.startupConflict.data.length; index++) {
					var element = array_element.startupConflict.data[index];
					info.push({type:element[2], tab:element[3],text:element[0], value: element[1]});
					graph.push({type:element[2], tab:element[3],severity:'severity_'+ seveirty[index], percentage: (element[1] / total) * 100 });
				}
				bars.push({title:Ember.I18n.t("dashboard.name.startuprunning",this), info: info, graph: graph});
				
				var info = new Array();
				var graph = new Array();
				for (var index = 0; index < array_element.baselineConflict.data.length; index++) {
					var element = array_element.baselineConflict.data[index];
					info.push({type:element[2], tab:element[3],text:element[0], value: element[1]});
					graph.push({type:element[2], tab:element[3],severity:'severity_'+ seveirty[index], percentage: (element[1] / total) * 100 });
				}
				bars.push({title:Ember.I18n.t("dashboard.name.baserunning",this), info: info, graph: graph});
				var isgeneralDeviceGroup = true;
				if(dGroup.id == 1 || dGroup.name == 'All Devices Group') {
					isgeneralDeviceGroup = false;
				}
				array_element.bars = bars;
				self.setProperties({'isgeneralDeviceGroup': isgeneralDeviceGroup, 'showBar': true, 'showGroup': true, 'dGroup' : array_element});
			} else {
				var	cls = "errorMsg"; //No I18N
				opm_infoMsgs(cls, responseData.statusMsg); //No I18N
			}
		}
		if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected){
			setTimeout(function(){
				$('.ifCentral').hide();
			},200);
		}
		if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
			setTimeout(function(){
				$(".hideInProbeSelectedMSPCentral").remove();
			}, 300);
		}
	},
	reloadDGroupObserver: function(){
	  	this.dGroupInfo.reloadDGroup=false;
	  	this.rerender();
	}.observes('dGroupInfo.reloadDGroup'),
	actions:
	{
		selectBarType: function(type, tab, dGroupName, dGroupId) {
	  		OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusType=type;
			OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusTabType=tab;
			OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusString=OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusStrings[type];
			OPMClient.NCMInventoryDGroupDetailsController.dGroupStatusTabs=OPMClient.NCMInventoryDGroupDetailsController[type];
			OPMClient.NCMInventoryDGroupDetailsController.dGroupName=dGroupName;
			OPMClient.NCMInventoryDGroupDetailsController.dGroupId=dGroupId;
			location.href=location.href+"/NCMDGroupStatus";
		},
		edit: function(dGroupId, dGroupName) {
			if(dGroupId != 1 && dGroupName != 'All Devices Group') {
				OPMClient.InventoryDeviceDetailsController.deviceName = dGroupId;
				location.href=location.href+'/NcmConfigDeviceGroupEdit';
			}
		},
		refresh: function(dGroupId) {
			NcmDGroupComponentArray[dGroupId].set("dGroupInfo.reloadDGroup", true);
		},
		schedule: function(dGroupId) {
			OPMClient.Inventory.ncmInSchedule('Configuration Backup', dGroupId); //No I18N
		},
		drillDown: function(dGroupId, dGroupName) {
			var ajaxRequestUrl = window.OPM.apiUrlPattern + "/ncmdevice/listDeviceGroupDetails?dGroupId="+dGroupId; //No I18N
			$.ajax({
				type: 'GET', //No I18N
				url: ajaxRequestUrl,
				async: true,//No I18N
				data: { "advancedFilters": JSON.stringify(OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects)}, //No I18N
				success: function(responseData){
					if(responseData.isSuccess != true) {
						var array_element = responseData.dGroup;
						if(array_element.deviceCount > 0) {
							//location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDGroup/"+encodeURIComponent(dGroupId+' '+dGroupName);
							location.href= window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/DGroup/DeviceGroupDetails/" + dGroupId + "/" + encodeURIComponent(dGroupName) + "/Devices"; // No I18N
						} else {
							opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.api.listdevices.notfound'));
						}
					}
				}
			});
		},
		deleteGroup: function(dGroupId, dGroupName) {
			if(!window.OPM.isAuthorized || window.OPM.isNCMPowerUser) {
				var isPrivateGroup = OPMClient.Inventory.isPrivateDeviceGroup(dGroupId);
				if(!isPrivateGroup) {
					opm_infoMsgs('errorMsg', Ember.I18n.t('ncm.devicegroup.delete.public.auth')); //No I18N
					return;
				}
			}
			if(dGroupId != 1 && dGroupName != 'All Devices Group') {
				var selRowIds = new Array();
				selRowIds.push(dGroupId);
				var confirmCallBack = function() {
					var data = {
				
					};
					data.DEVICE_GROUP_ID = JSON.stringify(selRowIds);
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmdevice/deleteDeviceGroup',data);//No I18N

					var cls="successMsg"; //No I18N
					if (response.isSuccess)
					{
						OPMClient.Inventory.updateConfigTabCount();
						NcmDGroupComponentArray[this.groupIndex]=null;
						var self = this;
						self.destroy();
					  	delete NcmDGroupComponentArray[this.groupIndex];
					}
					else
					{
						cls="errorMsg"; //No I18N
					}
					opm_infoMsgs(cls, response.statusMsg); //No I18N
				};
				
				var confirmBody = Ember.I18n.t("ncm.views.DO_YOU_WANT_DELETE_DGROUP",this); //No I18N
				ncmConfirm(null, confirmBody, 400, confirmCallBack);
			}
		},
		openDeviceGroup: function(dGroupId, dGroupName,isReport, isWidget) {
		    OPMClient.Inventory.openDeviceGroupOptions(dGroupId, dGroupName,isReport, isWidget);
		}
	},
	willDestroyElement: function(){
	  	var snapIndex = this.groupIndex;
	  	if(NcmDGroupComponentArray[snapIndex]!==undefined){
	  		NcmDGroupComponentArray[snapIndex]=null;
		  	delete NcmDGroupComponentArray[snapIndex];
	  	}
		$('#'+this.elementId).find('*').remove();
	}
});

//OPMClient.NcmCmpPolicyDetailsComponent = Ember.Component.extend({
//	templateName: "components/ncm-cmp-policy-details",
//	showPolicy: false,
//	hasAssociation: false,
//	policyIndex : -1,
//	reloadPolicy:false,
//	complaintperc:0,
//	Violationperc:0,
//	notavailableperc:0,
//	policyName:"",
//	didInsertElement:function() {
//		var policy = this.get('policyInfo');
//		var self = this;
//		self.setProperties({"showPolicy":true,"showContent":policy.showRenderContent});
//		this.policyIndex = policy.id;
//		this.policyName = policy.name;
//		NcmComplianceComponentArray[policy.id] = self;
//		$.ajax({
//			type: 'GET', //No I18N
//			url: window.OPM.apiUrlPattern + "/ncmcompliance/getPolicyDistribution?policyId="+policy.id,//No I18N
//			async: true,//No I18N
//			self:self,
//			success: function(responseData){
//				responseData.id=policy.id;
//				responseData.name=policy.name;
//				responseData.isStandard=policy.isStandard;
//				responseData.description=(policy.description.length == 0 || policy.description.endsWith('.'))?policy.description:policy.description+'.';
//				responseData.associatedTag=policy.associatedTag;
//				responseData.showNewTag=policy.showNewTag;
//				var compliantPercentage = 0;
//				var hasAssociationlocal = false;
//				if(responseData.TOTAL_DEVICE_COUNT != 0) {
//					hasAssociationlocal = true;
//					responseData.compliantPercentage = Math.round( ( responseData.COMPLIANT_DEVICE_COUNT / responseData.TOTAL_DEVICE_COUNT ) * 100);
//					responseData.violationPercentage = Math.round( ( responseData.VIOLATION_DEVICE_COUNT / responseData.TOTAL_DEVICE_COUNT ) * 100);
//					responseData.datanaPercentage = Math.round( ( responseData.DATANOTAVA_DEVICE_COUNT / responseData.TOTAL_DEVICE_COUNT ) * 100);
//				} else {
//					responseData.compliantPercentage = 0;
//					responseData.violationPercentage = 0;
//					responseData.datanaPercentage = 0;
//
//					responseData.DATANOTAVA_DEVICE_COUNT=0;
//					responseData.COMPLIANT_DEVICE_COUNT=0;
//					responseData.VIOLATION_DEVICE_COUNT=0;
//				}
//				if(responseData.TOTAL_DEVICE_COUNT != 0 && responseData.TOTAL_DEVICE_COUNT == responseData.COMPLIANT_DEVICE_COUNT) {
//					responseData.recommendation = Ember.I18n.t('webclient.ncm.compliance.TotallyCompliant', this);
//					responseData.compliantClass="cmpsummaryInfo-status3";
//				} else if(responseData.TOTAL_DEVICE_COUNT != 0) {
//					responseData.compliantClass="cmpsummaryInfo-status1";
//					responseData.recommendation = Ember.I18n.t('webclient.ncm.compliance.makesureRecemand', this);
//				} else {
//					responseData.compliantClass="cmpsummaryInfo-status2";
//					responseData.recommendation = Ember.I18n.t('webclient.reports.view.nodata', this);
//				}
//
//				responseData.shortdescription1 = Ember.I18n.t('webclient.ncm.compliance.shortDesc1', {param1: policy.configType}, this);
//				responseData.shortdescription2 = Ember.I18n.t('webclient.ncm.compliance.shortDesc2', {param2: policy.createdby, param3: policy.lastmodifiedby}, this);
//
//				self.setProperties({"showPolicy":true,"showContent":true, "policy":responseData, "hasAssociation": hasAssociationlocal});
//				if(hasAssociationlocal) {
//					setTimeout(function(){
//						var arraObj={
//						    "placeholder":[],//No I18N
//						    "chartobj":[]//No I18N
//						};
//						var columns = [
//							{
//								"dataindex": 0,
//								"columnname": Ember.I18n.t("jsp.commonstr.Status",this),
//								"datatype": "ordinal"
//							},
//							{
//								"dataindex": 1,
//								"columnname": Ember.I18n.t("webclient.general.Devices",this),
//								"datatype": "numeric"
//							}
//						];
//
//						var legendVal = { //No I18N
//							"enabled": "false" //No I18N
//						};
//
//						var pltOptionsVal = {
//							"pie": {
//								"innerRadius": "50%",
//								"datalabels": {
//									"show": false,
//									"innerLabel": {
//										"show": false,
//										"fontSize": 12,
//										"fontColor":'#000000'
//									}
//								},
//								strokeWidth:"0.3",
//								outerPadding:"0"
//							}
//						};
//						var legendVal = { //No I18N
//							"colors":["#46BB7D","#F1F1F1","#F1F1F1"],//NO I18N
//							"enabled": false //No I18N
//						};
//						var chartObj = {
//							id:"ComplianceStatusDiv_"+policy.id,//No I18N
//							type:'pie', //dial, bar,area,line,pie //No I18N
//							subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
//							customClass:"opm_pie",//No I18N
//							jsonData:[
//								[
//								Ember.I18n.t('dashboard.name.complaint',this),
//								responseData.COMPLIANT_DEVICE_COUNT,
//								"#46BB7D"
//								],
//								[
//								Ember.I18n.t('jsp.commonstr.Violation',this)+" & "+Ember.I18n.t('webclient.general.notavailable',this),
//								responseData.VIOLATION_DEVICE_COUNT + responseData.DATANOTAVA_DEVICE_COUNT,
//								"#FFFFFF"
//								]
//							],
//							height:170,
//							columns:columns,
//							"legend": legendVal,
//		//						events: events,
//							"plotoptions": pltOptionsVal
//						};
//						var mappingobj={};
//						arraObj.chartobj.push(chartObj);
//						arraObj.placeholder.push("ComplianceStatusDiv_"+policy.id); //No I18N
//						ncmZChart(arraObj);
//					},500);
//				}
//				setTimeout(function(){
//					if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
//						$('.hideInProbeSelectedMSPCentral').remove();
//					}
//				}, 500);
//			}
//		});
//	},
//	reloadPolicyObserver: function(){
//	  	this.policyInfo.reloadPolicy=false;
//	  	this.policyInfo.showRenderContent=true;
//	  	this.rerender();
//	}.observes('policyInfo.reloadPolicy'),
//	actions:{
//		edit: function(policyId) {
//			OPMClient.NCMInventoryComplianceNewController.policyId = policyId;
//			if(window.OPM.isOPM || window.OPM.isNFA){
//                redirectList('ConfigMgmt','NCMEditCompliancePolicy');
//			}
//			else{
//			    location.href= window.OPM.apiclientUrl+"NCMCompliance/AllPolicies/Add/"+policyId; // No I18N
//			}
//		},
//		refresh: function(policyId) {
//			NcmComplianceComponentArray[policyId].set("policyInfo.reloadPolicy", true);
//		},
//		associateDevices: function(policyId) {
//			OPMClient.NCMInventoryComplianceNewController.isAssocaite=true;
//			OPMClient.NCMInventoryComplianceNewController.policyId = policyId;
//            if(window.OPM.isOPM || window.OPM.isNFA){
//                redirectList('ConfigMgmt','NCMEditCompliancePolicy');
//			}
//            else{
//			    location.href= window.OPM.apiclientUrl+"NCMCompliance/AllPolicies/Add/"+policyId; // No I18N
//			}
//		},
//		adhocTest: function(policyId) {
//			if(window.OPM.isOPM || window.OPM.isNFA){
//                location.href= window.OPM.apiclientUrl+"Inventory/List/Ncm/Compliance/Policies/AdhocTestSlide/"+policyId; // No I18N
//			}
//			else{
//			    location.href= window.OPM.apiclientUrl+"NCMCompliance/AllPolicies/AdhocTestSlide/"+policyId; // No I18N
//			}
//		},
//		viewStatus: function(tabName) {
//			OPMClient.NCMInventoryComplianceNewController.policyStatusTab=tabName;
//			OPMClient.NCMInventoryComplianceNewController.policyId=this.policyIndex;
//			OPMClient.NCMInventoryComplianceNewController.policyName=this.policyName;
//			location.href=location.href+"/PolicyStatus";
//		},
//		generateReport: function() {
//			ncmusrsts1("policy_widget_exportpdf");// No I18n
//			var url = window.OPM.apiUrlPattern + "/ncmreports/NCMReportPDFGenerator?CUSTOMIZE_DATA_VIEWNAME=Policy_ComplianceReport&COMPPOLICY_ID="+this.policyIndex+"&REP_CRI=ALL_RULES";
//			url = appendEEProbeIdForUnifiedConsoleView(url);
//			location.href=appendNCMProbeDetails(url);
//		},
//		drillDown: function() {
//			if(window.OPM.isOPM || window.OPM.isNFA){
//		        location.href= window.OPM.apiclientUrl+"Inventory/List/Ncm/Compliance/Policies/Details/"+this.policyIndex+"/DeviceCompliance"; // No I18N
//		    }
//			else{
//			    location.href= window.OPM.apiclientUrl+"NCMCompliance/AllPolicies/Details/"+this.policyIndex+"/DeviceCompliance"; // No I18N
//			}
//		},
//		deletePolicy: function(policyId) {
//			var self = this;
//			var selRowIds = new Array();
//			selRowIds.push(policyId);
//			var self = this;
//			var confirmCallBack = function() {
//				var data = {
//
//				};
//				data.COMP_POLICYIDS = JSON.stringify(selRowIds);
//				var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/deleteCompPolicy',data);//No I18N
//				var cls="successMsg"; //No I18N
//				if (response.isSuccess)
//				{
//					NcmComplianceComponentArray[this.policyIndex]=null;
//					self.destroy();
//				  	delete NcmComplianceComponentArray[this.policyIndex];
//				  	if(window.OPM.isNFA || window.OPM.isOPM){
//                        OPMClient.NCMCompliance.updateComplianceOpmCount("Compliance", "policiesCount"); //No I18N
//					}
////				  	else{
////                        OPMClient.NCMCompliance.updateComplianceTabCount("policy", "policiesCount");//No I18N
////					}
//				}
//				else
//				{
//					cls="errorMsg"; //No I18N
//				}
//				opm_infoMsgs(cls, response.statusMsg);
//			};
//			var confirmBody = Ember.I18n.t("js.commonstr.ComplianceModelAlert3",this); //No I18N
//			ncmConfirm(null, confirmBody, 400, confirmCallBack);
//		},
//		runComplianceCheck: function(policyId) {
//			var params = "";
//			var selRowIds = new Array();
//			selRowIds.push(policyId);
//			params = '?COMPPOLICY_IDS='+JSON.stringify(selRowIds);//No I18N
//			var ajaxRequestUrl = window.OPM.apiUrlPattern + '/v2/ncmcompliance/exeComplianceCheck'+params; //No I18N
//			$.ajax({
//				url: ajaxRequestUrl,
//				dataType: 'json',//No I18N
//				type: 'POST',//No I18N
//				success: function(jsonData) {
//					var cls="errorMsg"; //No I18N
//					if (jsonData.isSuccess)
//					{
//						cls="successMsg"; //No I18N
//					}
//					opm_infoMsgs(cls, jsonData.statusMsg); //No I18N
//					NcmComplianceComponentArray[policyId].set("policyInfo.reloadPolicy", true);
//				}
//			});
//		}
//	},
//	willDestroyElement: function(){
//	  	var policyIndex = this.policyIndex;
//	  	if(NcmComplianceComponentArray[policyIndex]!==undefined){
//	  		NcmComplianceComponentArray[policyIndex]=null;
//		  	delete NcmComplianceComponentArray[policyIndex];
//	  	}
//		$('#'+this.elementId).find('*').remove();
//	}
//});

OPMClient.NcmCmpPolicyStatusComponent = Ember.Component.extend({
	templateName: "components/ncm-cmp-policy-status",
	reloadPolicyStatus:false,
	policyId: -1,
	policyName: '',
	selectedTab:'',
	complainceStatus:[
    	{"tabName":Ember.I18n.t('webclient.common.compliant',this),"tabType":"Compliant", "tab":"Compliant", "cssclass":"active"},//No I18N
    	{"tabName":Ember.I18n.t('jsp.commonstr.Violation',this),"tabType":"Violation", "tab":"Violation", "cssclass":""},//No I18N
    	{"tabName":Ember.I18n.t('webclient.general.notavailable',this),"tabType":"notavailable", "tab":"notavailable", "cssclass":""}//No I18N
	],
	didInsertElement:function() {
		if(this.selectedTab == '') {
			this.selectedTab = OPMClient.NCMInventoryComplianceNewController.policyStatusTab;
			this.policyId = OPMClient.NCMInventoryComplianceNewController.policyId;
			this.policyName = OPMClient.NCMInventoryComplianceNewController.policyName;
		}
		$("#NCMPolicyStatusDiv .list a").removeClass('active');
		$("#NCMPolicyStatusDiv a."+this.selectedTab).addClass('active');
		OPMClient.NCMInventoryComplianceNewController.reloadPolicyStatus(this.selectedTab, this.policyId);
	},
	reloadPolicyStatusObserver: function(){
	  	this.reloadPolicyStatus=false;
	  	this.rerender();
	}.observes('reloadPolicyStatus'),
	actions:{
		changeTab: function(tabname) {
			this.selectedTab=tabname;
			this.set("reloadPolicyStatus", true);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmAllVulnDetailsComponent = Ember.Component.extend({
    templateName: "components/ncm-all-vuln-details",//No I18N
    className : '',
    vulnDetails : '',
    isGridView : false,
	isInvPage : true,
	searchEnabled : true,
    didInsertElement : function () {
    	this.set('isGridView',OPMClient.NCMFirmVulnAllVulnController.isGridView);//No I18N
    	this.set('isInvPage',OPMClient.NCMFirmVulnAllVulnController.isInv);//No I18N
    	this.set('searchEnabled',OPMClient.NCMFirmVulnAllVulnController.searchEnabled);//No I18N
		OPMClient.NCMFirmVulnAllVulnController.componentDet = this;
    },
	dataObserver : function(){
    	if(OPMClient.NCMFirmVulnAllVulnController.isVulnSearch === false)
		{
            this.rerender();
		}
	}.observes('vulnDetails'),//No I18N
    actions:{
        redirectCveDet : function (cveid) {
        	if(this.isInvPage === true || !window.OPM.isNCM)
			{
				if(!window.OPM.userPermissions.ncmFirmwareVulnerabilityRead) {
					return;
				}
				if(location.href.includes('FirmwareVulnerabilityCveReport')){//No I18N
				    updateCveDetSlide(cveid);
				}
				else{
                    OPMClient.NCMFirmwareVulnerability.redirectToCveDetails(cveid,true);
				}
			}
			else{
                updateCveDetSlide(cveid);
			}
        },
        showExposedDevices : function (vulid) {
            OPMClient.NCMFirmwareVulnerability.showExposedDeviceDetGrid(vulid);
        },
        showLessData : function (vulid) {
            OPMClient.NCMFirmwareVulnerability.showLessToggle(vulid);
        },
        toggleRefLinks : function(vulid){
            var reportDiv = $('#reportId_'+vulid).find('.linkText');
            if(reportDiv.hasClass('truncate')){
                reportDiv.removeClass('truncate');
                $('#reportId_'+vulid).find('.opmBtn').text(Ember.I18n.t('webclient.ncm.fv.data.showless.links',this));
             }
             else{
                reportDiv.addClass('truncate');
                $('#reportId_'+vulid).find('.opmBtn').text(Ember.I18n.t('webclient.ncm.fv.data.showmore.links',this));
             }
         }
    },
    willDestroyElement: function(){
    	// OPMClient.NCMFirmVulnAllVulnController.deleteData();
        $('#'+this.elementId).find('*').remove();
    }
});


//IgnoreI18N_End
OPMClient.OpmConfigDiffComponent = Ember.Component.extend({
	templateName: "components/opm-config-diff",
	showPage:true,
	didInsertElement: function(){
		//realigning widget.
		var self = this;
		var currentWidgetData = this.widgetData;
		var jsonData = this.get('widgetData.apiData');
			if(jsonData!==null && self!==undefined && self!==null){
				var totalC = 0;
				if(jsonData.startupRunningDiff != null) {
					/*var funtionParams = '"'+jsonData.startupRunningDiff.LEFT_RESOURCE_NAME+'","'+jsonData.startupRunningDiff.LEFT_FILE_TYPE+'","'+jsonData.startupRunningDiff.LEFT_VERSION_NO+'","'+jsonData.startupRunningDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
						jsonData.startupRunningDiff.LEFT_CONFIG_ID+'","'+jsonData.startupRunningDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.startupRunningDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
						jsonData.startupRunningDiff.RIGHT_VERSION_NO+'","'+jsonData.startupRunningDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.startupRunningDiff.RIGHT_CONFIG_ID+'"'; // No I18N
					jsonData.startupRunningDiff.addedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");";
					jsonData.startupRunningDiff.modifiedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Modified\");";
					jsonData.startupRunningDiff.deletedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Deleted\");";*/
					totalC++;
				}
				if(jsonData.baselineRunningDiff != null) {
					/*var funtionParams = '"'+jsonData.baselineRunningDiff.LEFT_RESOURCE_NAME+'","'+jsonData.baselineRunningDiff.LEFT_FILE_TYPE+'","'+jsonData.baselineRunningDiff.LEFT_VERSION_NO+'","'+jsonData.baselineRunningDiff.LEFT_CONFIG_TYPE+'","'+ // No I18N
						jsonData.baselineRunningDiff.LEFT_CONFIG_ID+'","'+jsonData.baselineRunningDiff.RIGHT_RESOURCE_NAME+'","'+jsonData.baselineRunningDiff.RIGHT_FILE_TYPE+'","'+ // No I18N
						jsonData.baselineRunningDiff.RIGHT_VERSION_NO+'","'+jsonData.baselineRunningDiff.RIGHT_CONFIG_TYPE+'","'+jsonData.baselineRunningDiff.RIGHT_CONFIG_ID+'"'; // No I18N
					jsonData.baselineRunningDiff.addedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Added\");";
					jsonData.baselineRunningDiff.modifiedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Modified\");";
					jsonData.baselineRunningDiff.deletedOnclick = "OPMClient.InventoryNCMActionController.openCompareTo("+funtionParams+",\"Deleted\");";*/
					totalC++;
				}
				if(totalC>0) {
					var gridH = $('.diffdetailsWidget').height();
					var cellCount = Math.ceil((gridH)/(self.snapshotObj.snapDetails.yScale+2));
					if(window.OPM.isNewSnapshotPage){
						cellCount = Math.ceil((gridH)/18);
					}
					self.set('widgetData.sizey',cellCount);
					if(this.snapshotObj.snapType!=="FlowDevice") { //NO I18N
						self.set("widgetData.header",false); //NO I18N
					}
					self.set('widgetData.noData',false);//NO I18N
					self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); // NO i18N
					self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);
				}
				else{
					self.set('showPage',false);
					if(self.get('widgetData.ondemandWidget')){
						self.set('widgetData.noData',false);// NO i18N
					}else{
						self.set('widgetData.noData',true);// NO i18N
					}
					self.set('widgetData.header',true);//NO I18N
					//window.OPM.snapgridstack.pushWidget(el,null,null);
				}
				self.set('widgetData.apiData',jsonData);
			}
			else{
				if(self!==undefined && self!==null){
					self.set('showPage',false);
					if(self.get('widgetData.ondemandWidget')){
						self.set('widgetData.noData',false);// NO i18N
					}else{
						self.set('widgetData.noData',true);// NO i18N
					}
					self.set('widgetData.header',true);//NO I18N
				}
			}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	},
	actions:
	{
		openCompareTo:function(lDevice, lfileType, lVersionNo, lConfig, lVersionid, rDevice, rfileType, rVersionNo, rConfig, rVersionid, selected, isBaseline)
		{
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(lVersionid, rVersionid, selected);
			//OPMClient.InventoryNCMActionController.openCompareTo(lDevice, lfileType, lVersionNo, lConfig, lVersionid, rDevice, rfileType, rVersionNo, rConfig, rVersionid, selected, isBaseline);
		}
	}
});
OPMClient.OpmConfigSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-config-summary",
	showGrid:false,
	gridData:{},
	configSummaryStyle:'padding-top:30px!important',//No I18N
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(Object.keys(jsonData).length!=0 && jsonData!==null && jsonData.error===undefined && self!==undefined && self!==null){
			var bStatus=jsonData.BackupStatus;
			var compCritical=jsonData.CriticalCount;
			var compMajor=jsonData.MajorCount;
			var comptrouble=jsonData.WarningCount;
			var eolStatus=jsonData.ENDOFSALEDATE;
			var runningconfigVersion=jsonData.Running.versionId;
			var runningconfigFile=jsonData.Running.versionNo;
			var baselineconfigVersion=jsonData.RunningBaseline.versionId;
			var baselineconfigFile=jsonData.RunningBaseline.versionNo;
			var startupBaselineconfigVersion=jsonData.StartupBaseline.versionId;
			var startupBaselineconfigFile=jsonData.StartupBaseline.versionNo;
			var startupconfigVersion=jsonData.Startup.versionId;
			var startupconfigFile=jsonData.Startup.versionNo;
			
			var colNames = [
				'',
				''
			];
			
			var colModel =	[
				{ name: 'FIELD', index:'FIELD'}, //No I18N
				{ name: 'VALUE', index:'VALUE'} //No I18N
			];
			var gridData = new Array();
			var objectRow = {
					
			};
			var bLabel = '';
			var color = '';
			if(bStatus==='SUCCESS'){//No I18N
				bLabel=Ember.I18n.t('fwa.compliance.compSuccessMsg',this);//No I18N
				bLabel = "<i class='icon-status5'></i>&nbsp;"+bLabel;//No I18N
			} else if(bStatus==='FAILURE') {
				bLabel=Ember.I18n.t('ncm.config.backup.failed',this);//No I18N
				bLabel = "<i class='icon-status1'></i>&nbsp;"+bLabel;	//No I18N
			} else {
				bLabel=Ember.I18n.t('ncm.Util.GraphUtil.Not_Backed_Up',this);//No I18N
				bLabel = "<i class='icon-status3'></i>&nbsp;"+bLabel;	//No I18N
			}
			objectRow.FIELD=Ember.I18n.t("ncm.config.backup.status", this); //No I18N	
			objectRow.VALUE="<div>"+bLabel+"</div>"; 
			gridData.push(objectRow);
			
			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("dashboard.name.compliancestatus", this); //No I18N	
			var complianceText = '';
			if(compCritical===0 && compMajor===0 && comptrouble===0){
				if(bStatus != 'SUCCESS') {
					complianceText = "<i class='icon-status3'></i>&nbsp;"+Ember.I18n.t('jsp.commonstr.ComplianceData',this);//No I18N
					objectRow.VALUE="<div>"+complianceText+"</div>";
					gridData.push(objectRow);
				} else {
					complianceText = "<i class='icon-status5'></i>&nbsp;"+Ember.I18n.t('webclient.common.compliant',this);//No I18N
					objectRow.VALUE="<div>"+complianceText+"</div>";
					gridData.push(objectRow);
				}
			} else {
				if(compCritical>0){
					complianceText=complianceText+'<i class="icon-status1" style="float:none !important" title="'+Ember.I18n.t('webclient.admin.alarmesc.critical',this)+'"></i>&nbsp;'+compCritical+"&nbsp;";//No I18N
				}
				if(compMajor>0){
					complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('ncm.complinace.major',this)+"' class='icon-status2'></i>&nbsp;"+compMajor+"&nbsp;";//No I18N
				}
				if(comptrouble>0){
					complianceText=complianceText+"<i style='float:none !important;' title='"+Ember.I18n.t('webclient.admin.syslogrules.warning',this)+"' class='icon-status3'></i>&nbsp;"+comptrouble+"&nbsp;";//No I18N
				}
				objectRow.VALUE="<div>"+complianceText+"</div>";
				gridData.push(objectRow);
			}
			
			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("ncm.device.eol.status", this); //No I18N	
			var eolLabel=eolStatus;
			objectRow.VALUE="<div>"+eolLabel+"</div>";
			gridData.push(objectRow);
			
			var runnningSt = 'N/A'; //No I18N
			if(runningconfigVersion!==undefined){
				runnningSt = runningconfigFile;
			}
			
			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("ncm.device.running.config", this); //No I18N	
			objectRow.VALUE="<div>"+runnningSt+"</div>";
			gridData.push(objectRow);
			
			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("ncm.device.running.baseline", this); //No I18N	
			objectRow.VALUE="<div>"+baselineconfigFile+"</div>";
			gridData.push(objectRow);

			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("ncm.device.sartup.config", this); //No I18N	
			objectRow.VALUE="<div>"+startupconfigFile+"</div>";
			gridData.push(objectRow);
			
			objectRow = {
					
			};
			objectRow.FIELD=Ember.I18n.t("ncm.device.startup.baseline", this); //No I18N	
			objectRow.VALUE="<div>"+startupBaselineconfigFile+"</div>";
			gridData.push(objectRow);
			var gridCallBack =  function(gridID){
				$('#'+gridID).closest('.opm_jqGridUI').addClass('opm_jqGridUIBorder');
			};
			var sendObj = {};
			sendObj.gridId = "configSummaryDetails";
			sendObj.pagerId = "";
			sendObj.data = gridData;
			sendObj.defaultOptions = {autoencode:false};
			sendObj.colModels = colModel;
			sendObj.colNames = colNames;
			sendObj.captionTitle = "";
			sendObj.gridNavigator = "";
			sendObj.onSelectFunction = 'opm_Config_Summary';
			sendObj.page = "";
			sendObj.gridCallBack=gridCallBack;
			self.setProperties({'showGrid':true,'gridData':sendObj});
			self.set('widgetData.sizey',10);//NO I18N
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',15);//NO I18N
				self.set('configSummaryStyle','padding-top:10px!important');//NO I18N
			}
			if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
				this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
				this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			}
		}
		else{
			if(self!==undefined && self!==null){
				self.set('showGrid',false);
			}
		}
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmCommonSummaryComponent = Ember.Component.extend({
	apiData:{},
	didInsertElement: function(){
		var jsonData = this.widgetData.apiData;
		var self = this;
		var isWidgetPosReload = false;
		if(self.snapshotObj !== undefined && self.snapshotObj.snapType === "MonitoringDevice")
		{
			self.set('widgetData.sizey',12);//No I18N
			isWidgetPosReload = true;
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
                 self.set('adjustedHeight',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
			}
		}
		OPMClient.InventoryDeviceDetailsController.set("isDeviceNotMonitored",false); //No I18n
		OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",false); //No I18n
		OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",false); //No I18n
		if(!window.OPM.isCentralServer && self.snapshotObj.isDevicePingable === "false")
		{
			
				OPMClient.InventoryDeviceDetailsController.set("isDeviceNotMonitored",true); //No I18n
				//$("#snapShotSummaryDetails").css("top","25px"); //No I18n
				//$("#devSummaryList").css("top","25px");//No I18n
				//self.set('widgetData.sizey',14);//No I18N
				//isWidgetPosReload = true;
				if(window.OPM.isNewSnapshotPage){
					self.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
                     self.set('adjustedHeight',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
				}
		}
		if(!window.OPM.isCentralServer && self.snapshotObj.type === "Unknown" && self.snapshotObj.vendorName === "Unknown" && self.snapshotObj.isDevicePingable === "true")
		{
			
				OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",true); //No I18n
				OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
				//$("#snapShotSummaryDetails").css("top","25px"); //No I18n
				//$("#devSummaryList").css("top","25px");//No I18n
				//self.set('widgetData.sizey',17);//No I18N
				//isWidgetPosReload = true;
				if(window.OPM.isNewSnapshotPage){
					self.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
                     self.set('adjustedHeight',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
				}
			
		}

		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" && OPMClient.InventoryDeviceDetailsController.isDeviceNotMonitored) 		   {
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_NOTMONITORED"});//No I18N
		}

		if((OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" && OPMClient.InventoryDeviceDetailsController.isUnknownDevice) &&  !OPMClient.InventoryDeviceDetailsController.isDeviceNotMonitored && !self.snapshotObj.isSNMP) {
			OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_UNKNOWN"});//No I18N
		}		
		
		if(!window.OPM.isCentralServer && (OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" && self.snapshotObj.showCredentialNotAssociatedMsg !== undefined && self.snapshotObj.showCredentialNotAssociatedMsg === "true")) {//No I18N

				if (!OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring) {

					OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
					OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_NO_CREDENTIAL"});//No I18N
				}
			
		}
		if(!window.OPM.isCentralServer && OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice") {//No I18N
			if (!OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring) {
					if(self.snapshotObj.isVcenterFromAutoDiscovery!== undefined && self.snapshotObj.isVcenterFromAutoDiscovery)
					{
						OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
						OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_AUTODISCOVERY_VCENTER"});//No I18N
					}
					else if(self.snapshotObj.isHyperVFromAutoDiscovery!== undefined && self.snapshotObj.isHyperVFromAutoDiscovery)
					{
						OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
						OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_AUTODISCOVERY_HYPERV"});//No I18N
					}
					// else if(self.snapshotObj.isNutanixFromAutoDiscovery!== undefined && self.snapshotObj.isNutanixFromAutoDiscovery)
					// {
					// 	OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",true); //No I18n
					// 	OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_AUTODISCOVERY_NUTANIX"});//No I18N
					// }
				}
		}

		/*if(!window.OPM.isOPMLiteEdition && !window.OPM.isCentralServer && (OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" && (self.snapshotObj.type === "Unknown" || self.snapshotObj.category === "Unknown")) && self.snapshotObj.isSNMP) {
				OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_SYNC_DT"});//No I18N
		}*/
		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.hardwareInfo && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ipmiDetails && !OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ISHWMONITORED){
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_IPMI_PAGE"});//No I18N
		}

		if(!window.OPM.isCentralServer && self.snapshotObj.statusPollEnabled !== undefined && !self.snapshotObj.statusPollEnabled) 
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
		if(OPMClient.InventoryDeviceDetailsController.isPollerDevSnapshot)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{});//No I18N
		}

		if(isWidgetPosReload)
		{
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		OPMClient.InventoryDeviceDetailsController.isNCMDevice = false;
		if(jsonData != null && jsonData.ncmdetails != null) {
			if(jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE == undefined || jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE != true) {
				OPMClient.InventoryDeviceDetailsController.isNCMDevice = true;
				OPMClient.InventoryDeviceDetailsController.isNCMValidCredentials = jsonData.ncmdetails.CredentialValidity;
				OPMClient.InventoryDeviceDetailsController.isNCMSNMPCredentials = jsonData.ncmdetails.PROTOCOL.indexOf('SNMP') != -1;
				OPMClient.InventoryDeviceDetailsController.RESOURCEID = jsonData.ncmdetails.ncmDeviceID;
			}
		}
		// var currentWidgetData = this.widgetData;
		// var self = this;
		// var callBackFunc = function(jsonData){
		// 	if(jsonData.opmdetails.UpLinkDependency!==undefined && jsonData.opmdetails.UpLinkDependency!=="None"){
		// 		jsonData.showDependentLink=true;
		// 	}
		// 	var ncmDataAvailable = jsonData.ncmdetails != null && (jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE == null || jsonData.ncmdetails.SUMMARY_NOT_AVAILABLE != true);
		// 	if(ncmDataAvailable){
		// 		jsonData.ncmDataAvailable=true;
		// 	}
		// 	jsonData.deviceBasicDetails=deviceBasicDetails;
		// 	jsonData.changePasswordClick = "changeDevicePasswordDetails('"+jsonData.opmdetails.DNSName+"');";
		// 	jsonData.snapid = currentWidgetData.snapid;
		// 	self.set('apiData',jsonData);
		// };
		// opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
		if(window.OPM.showCustomFieldsInSummaryWidget)
         {
             var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getDeviceNotes',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
             var data = {name:OPMClient.InventoryDeviceDetailsController.deviceName};
             var response = opm_ajaxGetResponse(url,data);
             if(response!==undefined && response.length>0)
             {
                 self.set("customFieldValues",response);//No I18N
             }
         }
     },
     customFieldValuesObserver:function(){
         Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
             var adjustedHeight = 17;//No I18N
             if(adjustedHeight!==undefined){
                 adjustedHeight = snapHeightCalculation[17]-50;//No I18N
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar({//No I18N
                     axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
                 });
             }
         });
     }.observes('customFieldValues'),//No I18N
     actions:{
         summaryEdit: function(snapObj){
             redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
         },
         loadAppendUrl:function(url){
             loadAppendUrl(url);
         }
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		closeMessageInfoDetails();
		OPMClient.InventoryDeviceDetailsController.set("isDeviceNotMonitored",false); //No I18n
		OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",false); //No I18n
		OPMClient.InventoryDeviceDetailsController.set("showUnknownCredentialPage",false); //No I18n
		OPMClient.InventoryDeviceDetailsController.set("autoDiscoverCredentialType",""); //No I18n
		$('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
	}
});
OPMClient.OpmBackupSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-backup-summary",
	jsonData:{},
	showPage:false,
	holderId:'',
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		self.set('holderId','perfGraph1'+currentWidgetData.id);
		var reload=false;
		var shortSummary = false;
		var jsonData = this.get('widgetData.apiData');
		if(Object.keys(jsonData).length>0 && jsonData!==null && jsonData.error===undefined && self!==undefined && self!==null){
			for (var indexgr = 0; indexgr < jsonData.dayBackupList.length; indexgr++) {
				jsonData.dayBackupList[indexgr].perfGraphId="perfGraph_"+indexgr+"_"+currentWidgetData.id;
				if(jsonData.dayBackupList[indexgr].dayMap.status==="success"){
					jsonData.dayBackupList[indexgr].dayMap.showSuccess=true;
				}
				else if(jsonData.dayBackupList[indexgr].dayMap.status==="failure"){
					jsonData.dayBackupList[indexgr].dayMap.showFailure=true;
				}
				jsonData.dayBackupList[indexgr].dayMap.dataset[0].yaxiscolumnorder = jsonData.dataset[0].yaxiscolumnorder;
				var chartObj = {
					id:"perfGraph_"+indexgr+"_"+currentWidgetData.id, //No I18N
					type:'line', //No I18N
					subType: "step-after", //No I18N
					jsonData:jsonData.dayBackupList[indexgr].dayMap.dataset,
					series:"multi", //No I18N
					height:50,
					width: '65%',
					columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:Ember.I18n.t('NFAWidget.Time', this),columnname_2:Ember.I18n.t('webclient.common.operationstatus', this),timeFormat:'hours',//No I18N
						"format": {//No I18N
						    "customFormat": OPMClient.InventorySnapshotUIController.backupSummaryFormat //No I18N	
						}
					}, 
					"legend": { //No I18N	
						"enabled": "false" //No I18N	
					},
					"axes": { //No I18N	
						"rotated": false, //No I18N	
						"xaxis": { //No I18N	
							"show": "false" //No I18N
						},
						"yaxis": [ //No I18N	
							{
								"show": "false" //No I18N
							}
						]
					},
					chart:{stacked:true},
					"noDataHandler": { //No I18N
						"imageUrl": null, //No I18N
						"text": Ember.I18n.t("webclient.dials.nodata", this) //No I18N
					}
				};
				chartObj.classNames=['dwcenter'];
				jsonData.dayBackupList[indexgr].chartObj=chartObj;
			}
			var chartObj = {
				id:"perfGraph1"+currentWidgetData.id, //No I18N
				type:'area', //No I18N
				jsonData:jsonData.dataset,
				series:"multi", //No I18N
				height:200,
				columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Day",columnname_2:"Count", columnname_3: "Status", timeFormat:'lastweek'}, //No I18N
				legend : {
					"colors":["#46BB7D","#FA5B5A"],//No I18N
					"colorBox": { //No I18N 
			            "shape": "circle", //No I18N
			            "strokeOpacity": 1 //No I18N
			        },
			        "fontFamily": "'LatoRegular'", //No I18N
			        "fontSize": 16, //No I18N
					"hAlign": "center", //No I18N
					"vAlign": "bottom" //No I18N
				},
				"axes": { //No I18N	
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"label": { //No I18N	
							"text": "" //No I18N	
						}
					},
					"yaxis": [ //No I18N	
						{
							"label": { //No I18N	
								"text": jsonData.yaxis //No I18N	
							}
						}
					]
				},
				chart:{stacked:true},
				"noDataHandler": { //No I18N
					"imageUrl": null, //No I18N
					"text": Ember.I18n.t("webclient.dials.nodata", this) //No I18N
				}
			};
			jsonData.chartObj=chartObj;
			self.setProperties({showPage:true,jsonData:jsonData}); 
			self.set('widgetData.sizey',23);//NO I18N 
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',36);//NO I18N 
			}
			self.set('widgetData.noData',false);// NO i18N
			if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			}
		}
		else{
			if(self!==undefined && self!==null){
				//self.set('showPage',false);
				if(self.get('widgetData.ondemandWidget')){
					self.set('widgetData.noData',false);// NO i18N
				}else{
					self.set('widgetData.noData',true);// NO i18N
				}

			}
		}
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmChangeTrendComponent = Ember.Component.extend({
	templateName: "components/opm-change-trend",
	jsonData:{},
	showPage:false,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(Object.keys(jsonData).length>0 && jsonData!==null && jsonData.error===undefined && self!==undefined && self!==null){
			for (var index = 0; index < jsonData.dataset.length; index++) {
				var array_element = jsonData.dataset[index];
				if(array_element.seriesname.indexOf(".") != -1) {
					array_element.seriesname=Ember.I18n.t(array_element.seriesname, this);
				}
			}
			var chartObj = {
				id : 'perfGraph1' + currentWidgetData.id, //No I18N
				type : 'bar', //No I18N
				jsonData : jsonData.dataset,
				subType: "smootharea", //No I18N	
				series : "multi", //No I18N
				height : 375,
				columns : {
					datatype_1 : 'time', //No I18N
					datatype_2 : 'numeric', //No I18N
					columnname_1 : "Date", //No I18N	
					columnname_2 : Ember.I18n.t("dashboard.name.ncmchanges", this), //No I18N
					timeFormat: "Datewise" //No I18N	
				},
				legend : {
					"colors":["#46BB7D","#FA5B5A"],//No I18N
					"colorBox": { //No I18N
			            "shape": "circle", //No I18N
			            "strokeOpacity": 1 //No I18N
			        },
			        "fontFamily": "'LatoRegular'", //No I18N
			        "fontSize": 16, //No I18N
//								        "itemHeight": "30",
					"hAlign": "center", //No I18N
					"vAlign": "bottom" //No I18N
				},
				"axes": { //No I18N	
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"label": { //No I18N	
							"text": "" //No I18N	
						},
						"ticklabel": { //No I18N	
							"rotation": 90 //No I18N	
						}
					},
					"yaxis": [ //No I18N	
						{
							"label": { //No I18N	
								"text": jsonData.yaxis //No I18N	
							}
						}
					]
				},
				chart : {
					stacked : true
				}
			};
			jsonData.chartObj = chartObj;
			self.setProperties({showPage:true,jsonData:jsonData}); 
			self.set('widgetData.noData',false); // NO i18N
			self.set('widgetData.sizey',13);//NO I18N
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',23);//NO I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			}
			if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			}
		}
		else{
			if(self!==undefined && self!==null){
				//self.set('showPage',false);
				if(self.get('widgetData.ondemandWidget')){
					self.set('widgetData.noData',false);// NO i18N
				}else{
					self.set('widgetData.noData',true);// NO i18N
				}
			}
		}
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmNCMDeviceSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-device-summary",
	didInsertElement:function() {
		var deviceSumaaryData = this.get('widgetData').apiData;
		if(deviceSumaaryData.devDetails.LastOperationStatus == 'FAILURE') {
			populateDevResponse("#COMMAND_RESPONSE_TABLE", deviceSumaaryData.lastOperationDetails.COMMAND_RESPONSE); //No I18N
		} else if(deviceSumaaryData.devDetails.LastOperationStatus == 'INPROGRESS') { //No I18N
			setTimeout(function(){
				refreshLastOperationStatus();
			},3000);
		}
		
		OPMClient.InventoryDeviceDetailsController.isNCMDevice = true;
		OPMClient.InventoryDeviceDetailsController.isNCMValidCredentials = deviceSumaaryData.devDetails.CredentialValidity;
		OPMClient.InventoryDeviceDetailsController.isNCMSNMPCredentials = deviceSumaaryData.devDetails.PROTOCOL.indexOf('SNMP') != -1;
		OPMClient.InventoryDeviceDetailsController.ipAddress=deviceSumaaryData.devDetails.IPAddress;
		opm_customTooltip();
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

function ncm_browseActions() {
	$('.opmDeviceBrowseBtn').click(function(){
		if(!$(this).hasClass('active')){
			$(this).addClass('active');//No I18N
			$('#opmDeviceBrowseList').css({display:'block'}).animate({opacity:'1',top:'30px'},300);//No I18N
		}else{
			$(this).removeClass('active');//No I18N
			$('#opmDeviceBrowseList').css({display:'none',opacity:'0',top:'0'});//No I18N
		}
	});

	$('body').click(function(e){
		opmDeviceBrowseBtn =$('.opmDeviceBrowseBtn');
		if(opmDeviceBrowseBtn.hasClass('active')){
			if(!$(e.target).closest('.opmDeviceBrowseBtn').length){
				$('.opmDeviceBrowseBtn').removeClass('active');//No I18N
				$('#opmDeviceBrowseList').css({display:'none',opacity:'0',top:'0'});//No I18N
			}
		}
	});
}

OPMClient.OpmNcmDeviceDetailsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-device-details-summary",
	classNames:['com_NcmDeviceDetailsSummary'],
	didInsertElement:function() {
		if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
			$('i.popoutImg, .Options.multipleDevices.actions .scheduleReport, .Options.multipleDevices.actions .icon-more, .Options.multipleDevices.actions .icon-trash').hide();
		}
		var self = this;
		var gridCallBack = function(gridID,paramsObj){
			var heightLeft = $('#ncmDeviceSummaryLeftDiv').height();
			var heightRight = $('#ncmDeviceSummaryRightDiv').height();
			var summaryHeight = (heightLeft > heightRight)?heightLeft:heightRight;
			var cellCount = Math.floor((summaryHeight+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			if(cellCount <= 20) {
				cellCount = 20;
			}
			paramsObj.self.set('widgetData.sizey',cellCount); // No i18n
		};
		var defaultOptions = {
			multiselect: false,
			searchOption: true
		};
		defaultOptions.gridCallBack = gridCallBack;
		defaultOptions.gridCallBackParams={self:self};
		if(OPMClient.InventoryDeviceDetailsController.RESOURCEID == null) {
			var widgetData = this.get('widgetData');
			if(widgetData && widgetData.apiData) {
				OPMClient.InventoryDeviceDetailsController.RESOURCEID = widgetData.apiData.RESOOURCEID;
			}
		}
		
		populateRemoteApiClientGrid("NCMDevChangeList", "&deviceId="+OPMClient.InventoryDeviceDetailsController.RESOURCEID, "#NCMDevChangeListPager", "Snap_Changes", defaultOptions); //No I18N
		terminalActions();
		opm_tooltip();
		ncm_browseActions();
		if(OPMClient.ApplicationController.isAuthorized) {
			$("#ncmSnapshotSummaryDTUpdate").show();
			$("#ncmSnapshotSummaryDTSelBox").val($("#ncmSnapshotSummaryDTSelBox option[data-displayName='"+this.get('widgetData.apiData.devDetails.DeviceTemplateName')+"']").val());
			$("#ncmSnapshotSummaryDTSelBox").select2();
			$("#ncmSnapshotSummaryDTUpdate").hide();
		}
	},
	willDestroyElement:function() {
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	},
	actions:
	{
		openDiffcompareTo:function(leftVersion, rightversion, isBaselineRunning, header)
		{
			//OPMClient.InventoryNCMActionController.openDiffcompareTo(leftVersion, rightversion, isBaselineRunning, header);
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(leftVersion, rightversion);
		},
		redirectToSnapshot:function(type, devName) {
			redirectToSnapshot(type, devName);
		},
		openExternalLink: function(type){
			window.open(type+'://'+this.get('widgetData.apiData.devDetails.IPAddress'), '_blank');
		},
		copyDeviceProp: function(devicePropType){
			var msg, text = "";
			if(devicePropType === 'IPAddress') {
				msg = Ember.I18n.t("webclient.common.text.copyclip", {param0: Ember.I18n.t("webclient.map.view.ipaddress")}); //No I18n
				text = this.get('widgetData.apiData.devDetails.IPAddress');
			} else if(devicePropType === 'Hostname') { //No I18n
				msg = Ember.I18n.t("webclient.common.text.copyclip", {param0: Ember.I18n.t("webclient.fault.addnotes.device_name")}); //No I18n
				text = this.get('widgetData.apiData.devDetails.HostName');
			} else {
				msg = Ember.I18n.t("webclient.common.text.copyclip", {param0: "[NA]"}); //No I18n
				text = "[NA]"; // No I18N
			}
			$('#copyDevicePropInput').val(text);
			$('#copyDevicePropInput').show();
			opm_CopyToClipBoard("#copyDevicePropInput"); //No I18n
			$('#copyDevicePropInput').hide();
			opm_infoMsgs('successMsg', msg); //No I18N
		}
	}
});

OPMClient.OpmNcmDeviceDetailsSummary2Component = Ember.Component.extend({
	templateName: "components/opm-ncm-device-details-summary-2", //No I18N
	classNames:['com_NcmDeviceDetailsSummary'],
	didInsertElement:function() {
		var self = this;
		var gridCallBack = function(gridID,paramsObj){
			var heightLeft = $('#ncmDeviceSummaryLeftDiv').height();
			var heightRight = $('#ncmDeviceSummaryRightDiv').height();
			var summaryHeight = (heightLeft > heightRight)?heightLeft:heightRight;
			var cellCount = Math.floor((summaryHeight+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			if(cellCount <= 20) {
				cellCount = 20;
			}
			paramsObj.self.set('widgetData.sizey',cellCount); // No i18n
		};
		var defaultOptions = {
			multiselect: false,
			searchOption: true
		};
		defaultOptions.gridCallBack = gridCallBack;
		defaultOptions.gridCallBackParams={self:self};
		if(OPMClient.InventoryDeviceDetailsController.RESOURCEID == null) {
			var widgetData = this.get('widgetData');
			if(widgetData && widgetData.apiData) {
				OPMClient.InventoryDeviceDetailsController.RESOURCEID = widgetData.apiData.RESOOURCEID;
			}
		}
		populateRemoteApiClientGrid("DEDevDrafts", "&RESOURCEID="+OPMClient.InventoryDeviceDetailsController.RESOURCEID, "#DEDevDraftsPager", "Snap_Drafts", defaultOptions); //No I18N
	},
	willDestroyElement:function() {
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	},
	actions:
	{
		openDiffcompareTo:function(leftVersion, rightversion, isBaselineRunning, header)
		{
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(leftVersion, rightversion);
		},
		redirectToSnapshot:function(type, devName) {
			redirectToSnapshot(type, devName);
		}
	}
});

OPMClient.OpmNCMDeviceHardwareSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-device-hardware-summary",//No I18N
	didInsertElement:function() {
		opm_customTooltip();
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNcmDeviceHardwareDetailsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-device-hardware-details-summary",
	didInsertElement:function() {
		var self = this;
		var summaryHeight = $('#ncmDeviceHWSummaryLeftDiv').height();
		var cellCount = Math.floor((summaryHeight+10)/(self.snapshotObj.snapDetails.yScale+10));
		self.set('widgetData.sizey',cellCount); // No i18n
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmConflictStatusComponent = Ember.Component.extend({
	templateName: "components/opm-conflict-status",
	showGrid:false,
	didInsertElement:function() {
		var jsonData = this.get('widgetData').apiData;
		var snapDetailstype = this.get('widgetData').type;
		var ComplianceStatus = snapDetailstype == "ComplianceStatus";
		var self = this;
		var colorArray = new Array();
		var multiData = new Array();
		var colNames = [
			'',
			(ComplianceStatus)?Ember.I18n.t("jsp.commonstr.ComplianceStatus",this):Ember.I18n.t("widget.name.current.confifConflictstatus",this), //No I18N	
			'',
			'',
			Ember.I18n.t("jsp.commonstr.DeviceCount",this) //No I18N	
		];

		var colModel =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];

		var gridData1 = new Array();
		var total = 0;
		if(ComplianceStatus) {
			total = jsonData.Violation + jsonData.Comp_Data_Not_Available + jsonData.Compliant;
		} else {
			if(jsonData.Conflict != undefined || jsonData.ConflictNA != undefined || jsonData.Unchanged != undefined) {
				total = jsonData.Conflict + jsonData.ConflictNA + jsonData.Unchanged;
			}
		}
		var obj = {};
		var firsval1 = (ComplianceStatus)?"jsp.commonstr.DevicesWithViolations":"ncm.acd.Startup-Running_Conflict"; // No I18N
		var firsval2 = (ComplianceStatus)?jsonData.Violation:jsonData.Conflict;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100)) + " %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA5B5A";//No I18N
		colorArray.push(obj.colorBar);
		gridData1.push(obj);

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		//colorArray.push(obj.colorBar);


		obj = {};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.CompliantDevices":"js.commonstr.DashBoardWithoutStartupRunningconflict"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Compliant:jsonData.Unchanged;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#46BB7D";//No I18N
		colorArray.push(obj.colorBar);
		gridData1.push(obj);

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);

		obj = {};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.ComplianceData":"jsp.commonstr.DevicesNotBackedUp"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Comp_Data_Not_Available:jsonData.ConflictNA;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA7100";
		colorArray.push(obj.colorBar);
		gridData1.push(obj);

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);

		var gridCallBack = function(gridID,paramsObj){
			var gridH = $('#gbox_'+gridID.replace('#','')).height()+300;
			var cellCount = Math.ceil((gridH)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			paramsObj.self.set('widgetData.sizey',cellCount);
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);
		};

		var sendObj = {};
		sendObj.gridId = 'opm_App_Legend'+this.get('widgetData').id;//No I18N
		sendObj.data = gridData1;
		sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',pagination:false,minRowsPerPage:11};//No I18N
		sendObj.colModels = colModel;
		sendObj.colNames = colNames;
		sendObj.onSelectFunction = 'opm_App_Legend';//No I18N

		sendObj.defaultOptions.gridCallBack = gridCallBack;
		sendObj.defaultOptions.gridCallBackParams={self:self};

		self.setProperties({'showGrid':true,'gridData':sendObj});

		var type = 'pie';
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		graphParams.columns={datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Status",this),columnname_2:Ember.I18n.t("webclient.general.Devices",this),suffix:"%",timeFormat:'hours'};//No I18N
		graphParams.colorArray=colorArray;
		self.set('graphParams',graphParams);
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmComplianceStatusComponent = Ember.Component.extend({
	templateName: "components/opm-compliance-status",
	showGrid:false,
	didInsertElement:function() {
		var jsonData = this.get('widgetData').apiData;
		var snapDetailstype = this.get('widgetData').type;
		var self = this;
		var ComplianceStatus = snapDetailstype == "ComplianceStatus";//NO I18N
		var colNames = [
			'',
			(ComplianceStatus)?Ember.I18n.t("jsp.commonstr.ComplianceStatus",this):Ember.I18n.t("widget.name.current.confifConflictstatus",this), //No I18N	
			'',
			'',
			Ember.I18n.t("jsp.commonstr.DeviceCount",this) //No I18N	
		];
		
		var colModel =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		var colorArray = new Array();

		var total = 0;
		if(ComplianceStatus) {
			total = jsonData.Violation + jsonData.Comp_Data_Not_Available + jsonData.Compliant;
		} else {
			if(jsonData.Conflict != undefined || jsonData.ConflictNA != undefined || jsonData.Unchanged != undefined) {
				total = jsonData.Conflict + jsonData.ConflictNA + jsonData.Unchanged;
			}
		}
		
		var obj = {
				
		};
		var firsval1 = (ComplianceStatus)?"jsp.commonstr.DevicesWithViolations":"ncm.acd.Startup-Running_Conflict"; // No I18N
		var firsval2 = (ComplianceStatus)?jsonData.Violation:jsonData.Conflict;
		
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100)) + " %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA5B5A";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.CompliantDevices":"js.commonstr.DashBoardWithoutStartupRunningconflict"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Compliant:jsonData.Unchanged;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#46BB7D";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = (ComplianceStatus)?"jsp.commonstr.ComplianceData":"jsp.commonstr.DevicesNotBackedUp"; // No I18N
		firsval2 = (ComplianceStatus)?jsonData.Comp_Data_Not_Available:jsonData.ConflictNA;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=(total == 0)?0:Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=((total == 0)?0:Math.floor((firsval2/total)*100))+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA7100";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push((total == 0)?0:Math.floor((firsval2/total)*100));
		multiData.push(arr);
		colorArray.push(obj.colorBar);

		var gridCallBack = function(gridID,paramsObj){
			var gridH = $('#gbox_'+gridID.replace('#','')).height()+300;
			var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			paramsObj.self.set('widgetData.sizey',cellCount);
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);
		};
		var sendObj = {};
		sendObj.gridId = 'opm_App_Legend'+this.get('widgetData').id;//No I18N
		sendObj.data = gridData1;
		sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',pagination:false,minRowsPerPage:11};//No I18N
		sendObj.colModels = colModel;
		sendObj.colNames = colNames;
		sendObj.onSelectFunction = 'opm_App_Legend';//No I18N

		sendObj.defaultOptions.gridCallBack = gridCallBack;
		sendObj.defaultOptions.gridCallBackParams={self:self};

		self.setProperties({'showGrid':true,'gridData':sendObj});
		var type = 'pie';
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		graphParams.colorArray=colorArray;
		graphParams.columns={datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Status",this),columnname_2:Ember.I18n.t("webclient.general.Devices",this),suffix:"%",timeFormat:'hours'};//No I18N
		self.set('graphParams',graphParams);
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmPolicySummaryComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",
	showGrid:false,
	didInsertElement:function() {
		var self = this;
		var jsonData = this.get('widgetData').apiData;
		var colNames1 = [
			'',
			Ember.I18n.t("jsp.commonstr.Status",this), //No I18N
			'',
			'',
			Ember.I18n.t("jsp.commonstr.DeviceCount",this) //No I18N
		];

		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: ncmAppPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];

		var multiData = new Array();
		var gridData1 = new Array();
		var total = jsonData.TOTAL_DEVICE_COUNT;
		var colorArray = new Array();

		var obj = {};
		var firsval1 = "jsp.commonstr.CompliantDevices"; // No I18N
		var firsval2 = jsonData.COMPLIANT_DEVICE_COUNT;
		var perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[0];
		gridData1.push(obj);

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(firsval2);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[0]);
		}

		obj = {};
		firsval1 = "jsp.commonstr.ViolatedDevices"; // No I18N
		firsval2 = jsonData.VIOLATION_DEVICE_COUNT;
		perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[1];
		gridData1.push(obj);

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(firsval2);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[1]);
		}

		obj = {};
		firsval1 = "jsp.commonstr.ComplianceData"; // No I18N
		firsval2 = jsonData.DATANOTAVA_DEVICE_COUNT;
		perTon = (firsval2 > 0)?Math.floor((firsval2/total)*100):0;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=perTon;
		obj.PERCENTAGE=perTon+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar=jsonData.Color[2];
		gridData1.push(obj);

		var sendObj = {};
		sendObj.gridId = 'opm_App_Legend'+this.get('widgetData').id;//No I18N
		sendObj.data = gridData1;
		sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',pagination:false,minRowsPerPage:11};//No I18N
		sendObj.colModels = colModel1;
		sendObj.colNames = colNames1;
		sendObj.onSelectFunction = 'opm_App_Legend';//No I18N
		self.setProperties({'showGrid':true,'gridData':sendObj});

		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
		arr.push(firsval2);
		if(firsval2 > 0) {
			multiData.push(arr);
			colorArray.push(jsonData.Color[2]);
		}

		var type = 'pie';
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("jsp.commonstr.Status",this),columnname_2:Ember.I18n.t("webclient.general.Devices",this),timeFormat:'hours'};//No I18N
		graphParams.colorArray=colorArray;
		self.set('graphParams',graphParams);
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDraftSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-draft-summary",
	didInsertElement:function() {
		$(".timeFilterList").hide();
	},
	willDestroyElement:function() {
		$(".timeFilterList").show();
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmNcmDraftDetailsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-draft-details-summary",
	didInsertElement:function() {
		var jsonData = this.get('widgetData.apiData');
		OPMClient.InventoryDeviceDetailsController.hostId=jsonData.RESOURCEID;
		OPMClient.InventoryDeviceDetailsController.hostName=jsonData.RESOURCENAME;
		OPMClient.InventoryDeviceDetailsController.versionNumber =jsonData.VERSION;
		/** $('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		}); **/
	},
	willDestroyElement:function() {
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
		OPMClient.InventoryDeviceDetailsController.hostId = null;
	}
});

OPMClient.OpmNcmDraftDiffSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-draft-diff-summary",
	showPage:true,
	didInsertElement:function() {
		//realigning widget.
		var self = this;
		// var gridH = $('.diffdetailsWidget').height()+30;
		// var cellCount = Math.ceil((gridH+10)/(self.snapshotObj.snapDetails.yScale+2));
		// self.set('widgetData.sizey',cellCount);
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);
		var currentWidgetData = this.widgetData;
		var jsonData = this.get('widgetData.apiData');
		if(jsonData!==null && self!==undefined && self!==null){
			var totalC = 0;
			if(jsonData.baseVersionDiff != null) {
				self.set('showPage',true); // no i18n
			} else{
				self.set('widgetData.apiData.baseVersionDiff',{}); //No I18N
				self.set('widgetData.apiData.baseVersionDiff.addedCount',0); //No I18N
				self.set('widgetData.apiData.baseVersionDiff.modifiedCount',0); //No I18N
				self.set('widgetData.apiData.baseVersionDiff.deltedCount',0); //No I18N
				self.set('showPage',true);//No I18N
			}
			self.set('widgetData.apiData',jsonData);
		}
		else{
			if(self!==undefined && self!==null){
				self.set('widgetData.apiData.baseVersionDiff.addedCount',0);//No I18N
				self.set('widgetData.apiData.baseVersionDiff.modifiedCount',0);//No I18N
				self.set('widgetData.apiData.baseVersionDiff.deltedCount',0);//No I18N
				self.set('showPage',true);//No I18N
			}
		}
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	},
	actions:
	{
		openCompareTo:function(lDevice, lfileType, lVersionNo, lConfig, lVersionid, rDevice, rfileType, rVersionNo, rConfig, rVersionid, selected)
		{
			OPMClient.InventoryDeviceDetailsController.LEFT_CONFIG_TYPE = lfileType;
			OPMClient.InventoryDeviceDetailsController.RIGHT_CONFIG_TYPE = rfileType;
			OPMClient.InventoryDeviceDetailsController.LEFT_RESOURCE = OPMClient.InventoryDeviceDetailsController.hostId;
			OPMClient.InventoryDeviceDetailsController.RIGHT_RESOURCE = OPMClient.InventoryDeviceDetailsController.hostId;
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(lVersionid, rVersionid, selected);
			//OPMClient.InventoryNCMActionController.openCompareTo(lDevice, lfileType, lVersionNo, lConfig, lVersionid, rDevice, rfileType, rVersionNo, rConfig, rVersionid, selected);
		}
	}
});
//IgnoreI18N_Start
OPMClient.NcmAssociateTagComponent = Ember.Component.extend({
	templateName: "components/ncm-associate-tag",
	showTag: false,
	reloadTagsList: false,
	didInsertElement:function() {
		var self = this;
		self.set('isTaggedUser', window.OPM.isTaggedUser);
		if(window.OPM.isTaggedUser){
			self.set('tagselected', 'true');
			self.set('tagName', window.OPM.ncmUserTagName);
		} else if(self.get('hideTemp') != undefined && self.get('hideTemp') != '') {
			self.set('tagselected', 'true');
			self.set('noTag', 'true');
		} else if(self.get('selTag') != undefined && self.get('selTag') != '') {
			self.set('tagselected', 'true');
			self.set('tagName', self.get('selTag'));
		} else if(!window.OPM.isAuthorized || window.OPM.isNCMPowerUser){
			self.set('tagselected', 'true');
			self.set('noTag', 'true');
		}else {
			var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmtags/tagsList'; //No I18N
			var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);//No I18N
			self.set('tagNames',jsonData.tags);
			self.set('customColName1',jsonData.customColName1);
			self.set('customColName2',jsonData.customColName2);
			self.set('customColName3',jsonData.customColName3);
			OPMClient.SettingsNCMConfigController.configletTags = jsonData.tags;
		}
		self.set('showTag',true);//No I18N
		OPMClient.SettingsNCMConfigController.ncmTagsSelComp = self;
	},
	actions:{
		openNewTag: function() {
			$('#newTagSaveDiv').css('display','block');
		},
		cancelNewTag: function() {
			$('#newTagSaveDiv').css('display','none');
		},
		saveNewTag: function() {
			OPMClient.Settings.saveTag(false, true);
		}
	},
	reloadTagsListObserver: function(){
	  	this.reloadTagsList=false;
	  	this.rerender();
	}.observes('reloadTagsList'), // No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

function changeSelectTagOption() {
	var tagSelType = $("input[name='tagsType']:checked").val();//No I18N
	if (tagSelType == "allTags"){
		$('#selectTagsDiv').hide();
	}else {
		$('#selectTagsDiv').show();
		if(!$("#TAG_NAME").hasClass('select2-hidden-accessible')) {
			$("#TAG_NAME").select2();
		}
	}
	return true;
}
//IgnoreI18N_End

OPMClient.OpmNcmDraftCommandSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-draft-command-summary",
	didInsertElement:function() {
		var self = this;
		if(self.snapshotObj.shortSummary){
			self.set('widgetData.sizey',20); //No I18N
		}
		else{
			//$('#configContentSnapshot').elastic();
			$('#configContentSnapshot').css("height","600px");
			$('#configContentSnapshot').css("overflow-y","auto"); //No I18N
			self.set('widgetData.sizey',-1); //No I18N
		}
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);
		opm_toggleConfigContent("configContentSnapshot", "configToggleSnapshot"); //No I18N
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmVersionSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-version-summary",
	didInsertElement:function() {
		/* $('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		}); */
		var jsonData = this.get('widgetData.apiData');
		OPMClient.InventoryDeviceDetailsController.configFileType=jsonData.FileType;
		OPMClient.InventoryDeviceDetailsController.versionNumber=jsonData.VersionNo;
		OPMClient.InventoryDeviceDetailsController.hostName=jsonData.HostName;
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNcmChangeDiffSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-change-diff-summary",
	showPage: false,
	didInsertElement: function() {
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		var versionId = jsonData && jsonData.versionId;
		if (!versionId) {
			self.set('showPage', false); //No I18N
			self.set('snapshotObj.currentCount', self.get('snapshotObj.currentCount') + 2); //No I18N
			return;
		}
		// Load diff counts separately so content renders first without waiting for diff computation
		var diffUrl = window.OPM.apiUrlPattern + '/ncmconfig/getConfigFileVersionDiff?versionId=' + versionId; //No I18N
		$.ajax({
			url: diffUrl,
			type: 'GET', //No I18N
			dataType: 'json', //No I18N
			success: function(diffData) {
				if (self.isDestroyed || self.isDestroying) { return; }
				var totalC = 0;
				if(diffData.baselineDiff==null && diffData.prevDiff==null){
				   if(diffData.nonTextFile!=null && diffData.nonTextFile==true){
                      self.set('nonTextFile',true); //No I18N
                   }else if(diffData.fileSizeExceedsLimit!=null && diffData.fileSizeExceedsLimit==true){
                      self.set('fileSizeExceedsLimit',true); //No I18N
                   }
				}else{
                    if (diffData.baselineDiff != null) {
                        if (diffData.baselineDiff.addedCount > 0 || diffData.baselineDiff.modifiedCount > 0 || diffData.baselineDiff.deltedCount > 0) {
                            totalC++;
                            self.set('showBaselinePage', true); //No I18N
                        } else {
                            self.set('showBaselinePage', false); //No I18N
                        }
                    }
                    if (diffData.prevDiff != null) {
                        if (diffData.prevDiff.addedCount > 0 || diffData.prevDiff.modifiedCount > 0 || diffData.prevDiff.deltedCount > 0) {
                            totalC++;
                            self.set('showPrevPage', true); //No I18N
                        } else {
                            self.set('showPrevPage', false); //No I18N
                        }
                    }
                    self.set('showPage', totalC > 0); //No I18N
                    // Merge diff result into apiData so the template bindings resolve correctly
                    jsonData.baselineDiff = diffData.baselineDiff;
                    jsonData.prevDiff = diffData.prevDiff;
				}
				self.set('widgetData.apiData', jsonData); //No I18N
				self.set('snapshotObj.currentCount', self.get('snapshotObj.currentCount') + 2); //No I18N
			},
			error: function() {
				if (self.isDestroyed || self.isDestroying) { return; }
				self.set('showPage', false); //No I18N
				self.set('snapshotObj.currentCount', self.get('snapshotObj.currentCount') + 2); //No I18N
			}
		});
	},
	willDestroyElement: function() {
		$('#'+this.elementId).find('*').remove();
	},
	actions: {
		openCompareTo: function(lDevice, lfileType, lVersionNo, lConfig, lVersionid, rDevice, rfileType, rVersionNo, rConfig, rVersionid, selected, isBaseline) {
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(lVersionid, rVersionid, selected);
		}
	}
});


OPMClient.OpmConfigFileSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ncm-config-summary",
	showGraph:false,
	didInsertElement:function() {
		var self = this;
		var graphParams = {};
		var apiResponse = this.get('widgetData').apiData;
		graphParams.id = 'PerfGraph'+this.get('widgetData').id;
		graphParams.data = apiResponse.dataset;
		graphParams.yAxis = apiResponse.yaxis;
		graphParams.colors = ["#46BB7D","#FA5B5A"]; // No i18n
		graphParams.graphType = 'bar';//No I18N
		self.setProperties({'showGraph':true,'graphParams':graphParams});
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmSnapshotHeaderComponent = Ember.Component.extend({
	templateName: "components/ncm-snapshot-header", //NO I18N
	reloadNCMHeader: false,
	didInsertElement:function(){
		if(window.OPM.isOPM) {
			//BreadCrumbs for OPM
			var showBreadcrumb = false;
			var backButtonUrl = "";
			var data = OPMClient.InventoryDeviceDetailsController.get('ncmBreadcrumbData'); // No i18n
			if (data && data.length > 0) {
				data.forEach(function(item) {
					item.set ? item.set('isLast', false) : item.isLast = false; // No i18n
				});
				var lastItem = data[data.length - 1];
				if (lastItem.set) {
					lastItem.set('isLast', true); // No i18n
				} else {
					lastItem.isLast = true;
				}
				if(data.length > 1){
					showBreadcrumb = true;
					if(data[data.length - 2]!==undefined && data[data.length - 2].location!==undefined) {
						backButtonUrl = data[data.length - 2].location;
					}
				}
			}
			this.set('showBreadcrumb', showBreadcrumb); // No i18n
			this.set('backButtonUrl', backButtonUrl); // No i18n
		}
		this.set('contents',OPMClient.InventoryDeviceDetailsController.ncmBreadcrumbData); //NO I18N
		var self = this;
		OPMClient.InventoryDeviceDetailsController.ncmBreadcrumbComp = self;
	},
	reloadNCMHeaderObserver: function(){
	  	this.reloadNCMHeader=false;
	  	this.rerender();
	}.observes('reloadNCMHeader'), // No I18N
	willDestroyElement: function() {
	}
});

OPMClient.OpmResPolicySummaryComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",
	showGrid:false,
	didInsertElement:function() {
		var self = this;
		var jsonData = this.get('widgetData').apiData;
		
		var colNames1 = [
			'',
			Ember.I18n.t("webclient.map.filemonitor.alarmseverity",this), //No I18N	
			'',
			'',
			Ember.I18n.t("webclient.common.widgets.eventcount",this) //No I18N	
		];

		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:ncmDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: ncmAppPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50}, //No I18N
			{ name: 'TRAFFIC', index: 'TRAFFIC', sortable: false}// No I18N
		];

		var multiData = new Array();
		var gridData1 = new Array();
		var total = jsonData.Major+jsonData.Critical+jsonData.Warning+jsonData.Success;
		var colorArray = new Array();

		var obj = {
				
		};
		var firsval1 = "ncm.complinace.major"; // No I18N
		var firsval2 = jsonData.Major;

		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA7100";//NO I18N

		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this));
//		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
//		arr.push(Math.floor((firsval2/total)*100));
		arr.push(firsval2);
		colorArray.push(obj.colorBar);
		multiData.push(arr);

		obj = {
				
		};
		firsval1 = "webclient.admin.threshold.Critical"; // No I18N
		firsval2 = jsonData.Critical;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FA5B5A";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this));
//		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
//		arr.push(Math.floor((firsval2/total)*100));
		arr.push(firsval2);
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = "webclient.admin.eventlogrules.warning"; // No I18N
		firsval2 = jsonData.Warning;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#FCA966";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this));
//		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
//		arr.push(Math.floor((firsval2/total)*100));
		arr.push(firsval2);
		multiData.push(arr);
		colorArray.push(obj.colorBar);
		obj = {
				
		};
		firsval1 = "webclient.common.compliant"; // No I18N
		firsval2 = jsonData.Success;
		obj.APP=Ember.I18n.t(firsval1,this);
		obj.CHART=Math.floor((firsval2/total)*100);
		obj.PERCENTAGE=Math.floor((firsval2/total)*100)+" %";
		obj.TRAFFIC=firsval2;
		obj.colorBar="#46BB7D";//NO I18N
		gridData1.push(obj);
		var arr = new Array();
		arr.push(Ember.I18n.t(firsval1,this));
//		arr.push(Ember.I18n.t(firsval1,this)+" : "+firsval2);
//		arr.push(Math.floor((firsval2/total)*100));
		arr.push(firsval2);
		multiData.push(arr);
		colorArray.push(obj.colorBar);

		var sendObj = {};
		sendObj.gridId = 'opm_App_Legend'+this.get('widgetData').id;//No I18N
		sendObj.data = gridData1;
		sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',pagination:false,minRowsPerPage:11};//No I18N
		sendObj.colModels = colModel1;
		sendObj.colNames = colNames1;
		sendObj.onSelectFunction = 'opm_App_Legend';//No I18N
		self.setProperties({'showGrid':true,'gridData':sendObj});

		var type = 'pie';
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		graphParams.colorArray=colorArray;
//		graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("webclient.map.filemonitor.alarmseverity", this),columnname_2:Ember.I18n.t("jsp.commonstr.Status",this),suffix:"%",timeFormat:'hours'};//No I18N
		graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("webclient.map.filemonitor.alarmseverity", this),columnname_2:Ember.I18n.t("webclient.settings.devicegrp.count",this),timeFormat:'hours'};//No I18N

		self.set('graphParams',graphParams);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmAddOnTopBandComponent = Ember.Component.extend({
	templateName:"components/add-on-promotion-details",//No I18N
	classNames:["width100"],
	didInsertElement:function() {
		var jsonData = this.widgetData.apiData;
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/ncmsettings/isAddOnLicenseEnabled",{productName:jsonData.productName}); //NO I18N
		var imageName = jsonData.productName.toLowerCase();
		if(jsonData.productName==="NFA") { //NO I18N
			if(response.isNFAEnabled && !jsonData.isNFADevice) {
				this.set("showAddNFADeviceBand",true); //NO I18N
				this.set("showNFAExportFlowProbeMessage", (window.OPM.isCentralServer || window.OPM.isMSPAllCustomerOrAllProbeSelected)); //NO I18N
			}
		}else if(jsonData.productName==="FWA") { //NO I18N
			if(response.isFWAEnabled && !jsonData.isFWADevice) {
				this.set("showAddFWADeviceBand",true); //NO I18N
			}
		}else if(jsonData.productName==="NCM") { //NO I18N
			if(!window.OPM.isAuthorized) {
				this.set("showNCMOperatorBand",true); //NO I18N
			}else if(!response.isNCMEnabled && !response.showEnableAddOnLic) {
				this.set("showEnableNCMBand",true); //NO I18N
			}else if(!jsonData.isNCMDevice) {
				if(window.OPM.userPermissions.adminAccess && !window.OPM.userPermissions.ncmRestricted) {
					this.set("showAddNCMDeviceBand",true); //NO I18N
				} else {
					this.set("showNCMOperatorBand",true); //NO I18N
				}
			}else if(!jsonData.isDeviceManagedInNCM) {
				if(window.OPM.userPermissions.ncmDevMgmtWrite) {
					this.set("showNCMManageDeviceBand",true); //NO I18N
				}
				else {
					this.set("showNCMOperatorBand",true); //NO I18N
				}
			}
		}
		if(this.widgetData.name==="nfancm.promotion.top.band") { //NO I18N
			imageName="nfa_ncm"; //NO I18N
		}
		if(this.widgetData.desc==="webclient.snapshot.flowanalysis"){//NO I18N
			imageName="nfa_accesspoint"; //NO I18N
		}
		if(response.showEnableAddOnLic) {
			$("[target='addon-popup-position']").show(); //NO I18N
		}else {
			$("[target='addon-popup-position']").hide(); //NO I18N
		}
		ncmusrsts1("snap_"+imageName+"_tab");// No I18n
		this.set("sampleDataImgLoc","/apiclient/fluidicv2/img/"+imageName+"_sample_data.png"); //NO I18N
		this.set("widgetData.sizey",500); //NO I18N
	},
	actions:{
		nfaExportFlow:function() {
			ncmusrsts1("snap_opm_nfa_exportflow");// No I18n
			OPMClient.SettingsNFAExportFlowController.set("ipAddress",this.snapshotObj.ipAddress); //NO I18N
			opmGlobalRoute.transitionTo("Settings.Discovery.ExportFlow"); //NO I18N
		},
		fwaRedirectAction:function(type) {
			if(type == "discover"){
				OPMClient.SettingsFWADiscoverController.set("ipAddress",this.snapshotObj.ipAddress); //NO I18N
			}
			OPMClient.Reports.redirectFWAAddonpage(type);
		}
	},
	willDestroyElement: function() {
		$("[target='addon-popup-position']").hide(); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

//IgnoreI18N_Start
OPMClient.NcmMultiSelectComponent = Ember.Component.extend({
	component_id: "device",
	left_header: Ember.I18n.t('webclient.Available'),
	right_header: Ember.I18n.t('webclient.Selected'),
	not_selected_list : [],
	selected_list : [],
	didInsertElement : function() {
	    $('.srch').find('input').each(function(index,input){
            $(input).off('keyup').on('keyup',function(){
                var str = $(input).val();
                var divId = $(input).attr('id');
                divId = divId.replace("srch_",""); //No I18N
                changeNCMSelectList(str,divId);
            });
        });
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('not_selected_list'), //No I18N
	actions:{
	    changeNCMSelectList  : function(str,divId) {
            changeNCMSelectList(str,divId);
        },
        right_to_left : function(){
            var right_selected_list = $("#selected_list_"+this.component_id+" :selected:visible");
            $('#not_selected_list_'+this.component_id).append(right_selected_list);
            $("#selected_list_"+this.component_id+" :selected:visible").remove();
        },
        left_to_right : function(){
            var left_selected_list = $("#not_selected_list_"+this.component_id+" :selected:visible");
            $('#selected_list_'+this.component_id).append(left_selected_list);
            $("#not_selected_list_"+this.component_id+" :selected:visible").remove();
        }
    },
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmMultiSelectOrderComponent = Ember.Component.extend({
	component_id: "column",
	left_header: Ember.I18n.t('webclient.Available'),
	right_header: Ember.I18n.t('webclient.Selected'),
	not_selected_list : [],
	selected_list : [],
	didInsertElement : function() {
	    if(this.component_id == null) {
	        this.component_id = "column";
	    }
	    $('.DevicesSearchBox input').each(function(index,input){
            $(input).off('keyup').on('keyup',function(){
                var str = $(input).val();
                var divId = $(input).attr('id');
                divId = divId.replace("srch_",""); //No I18N
                changeNCMSelectList(str,divId);
            });
        });
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('not_selected'), //No I18N
	actions:{
	    changeNCMSelectList  : function(str,divId) {
            changeNCMSelectList(str,divId);
        },
        right_to_left : function(){
            var leftSelectedList = $("#selected_list_"+this.component_id+" :selected:visible");

			var selected = this.get('selected_list');
			var availableColumns = this.get('not_selected_list');

			$(leftSelectedList).each(function() {
				index = (selected).map(function(e){return e.id;}).indexOf($(this).attr('value'));
				availableColumns.pushObject(selected[index])
				selected.splice(index,1);
			});

			this.set('selected_list',selected);//No I18N
			this.set('not_selected_list',availableColumns);//No I18N

            $("#selected_list_"+this.component_id+" :selected:visible").remove();
        },
        left_to_right : function(){
            var rightSelectedList = $("#not_selected_list_"+this.component_id+" :selected:visible");

			var selected = this.get('selected_list');
			var availableColumns = this.get('not_selected_list');

			$(rightSelectedList).each(function () {
				index = (availableColumns).map(function(e){return e.id;}).indexOf($(this).attr('value'));
				selected.pushObject(availableColumns[index])
				availableColumns.splice(index,1);
			});

			this.set('selected_list',selected);//No I18N
			this.set('not_selected_list',availableColumns);//No I18N

            $("#not_selected_list_"+this.component_id+" :selected:visible").remove();
        },
		moveUp: function() {
			var selected_column_list = this.get('selected_list');

			var selectedOption = $("#selected_list_"+this.component_id+" option:selected");
			var lastElement = $(selectedOption).last();
			var lastIndex = $(lastElement).index();
			var firstIndex = $(selectedOption).index();
			if(firstIndex == 0){
				return;
			}

			var selLength= selectedOption.length;
			if(selLength != ((lastIndex-firstIndex)+1)){
				return;
			} else {
				var next = firstIndex;
				var flag = true;
				$(selectedOption).each(function () {
					var idx = ($(this).index());
					if(next != idx){
						flag = false;
						return false;
					}
					next++;
				});
				if(flag){
					var temp = selected_column_list[firstIndex - 1];
					selected_column_list.removeAt(firstIndex - 1,1);
					selected_column_list.insertAt(lastIndex,temp);

					this.set('selected_list',selected_column_list);//No I18N
				} else{
					return;
				}
			}
		},
		moveDown: function(){
			var selected_column_list = this.get('selected_list');

			var selectedOption = $("#selected_list_"+this.component_id+" option:selected");
			var lastElement = $(selectedOption).last();
			var lastIndex = $(lastElement).index();
			var firstIndex = $(selectedOption).index();

			if(lastIndex == (selected_column_list.length-1)){
				return;
			}
			var selLength= selectedOption.length;
			if(selLength!=((lastIndex-firstIndex)+1)){
				return;
			} else {
				var next = firstIndex;
				var flag = true;
				$(selectedOption).each(function () {
					var idx = ($(this).index())
					if(next != idx){
						flag = false;
					}
					next++;
				});
				if(flag){
					var temp = selected_column_list[lastIndex + 1];
					selected_column_list.removeAt(lastIndex + 1,1);
					selected_column_list.insertAt(firstIndex,temp);
					this.set('selected_list',selected_column_list);//No I18N
				}else{
					return;
				}
			}
		}
    },
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmFilterCriteriaComponent = Ember.Component.extend({
	filter_id : null, //No I18N
	filter_type : 'device', //No I18N
	selected_ids : null,
	criteria_expression : "",
	criteria_list : null,
	all_criteria_columns : null,
	all_devices : null,
	all_device_groups : null,
	all_tags : null,
	not_selected_devices : null,
	not_selected_device_groups : null,
	not_selected_tags : null,
	selected_devices : null,
	selected_device_groups : null,
	selected_tags : null,
	refresh : false,
	load : false,
	editFilterDetails: false,
	supported_tabs : [{id: "device", name: Ember.I18n.t('webclient.ncm.advReport.devices',this), content_id: "device_tab"},{id: "device_group", name: Ember.I18n.t('webclient.network.devicegroups',this), content_id: "device_group_tab"},{id: "criteria", name: Ember.I18n.t('webclient.ncm.advReport.dynamicCriteria',this), content_id: "criteria_tab"}],
	selected_tab : 'device', // No I18N
	tabList : [],
	didInsertElement : function(){
	    if(this.filter_type == null || this.filter_type == undefined) {
	        this.filter_type = 'device';
	    }

		if(this.editFilterDetails) {
			this.filter_id = "";
		}

        if(this.isDynamicFilterHide) {
            this.supported_tabs.removeObject(this.supported_tabs.findBy('id', 'criteria'));
        }
		var data = { 'filter_id': this.filter_id, 'filter_type' : (this.filter_type || "").toLowerCase()} //No I18N
		var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
		var jsonData = opm_ajaxGetResponse(url,data);
		if(jsonData.filter_id != undefined) {
			OPMClient.ReportsDetailsController.ncmAdvReportFilterID = jsonData.filter_id;
		}
        if(jsonData.isSuccess) {
            this.selected_tab = jsonData.filter_type;
            if(this.selected_tab == 'device') {
                this.set('all_devices', jsonData.all_devices);
                this.set('not_selected_devices', jsonData.not_selected_devices);
                // deleted or out-of-scope devices come back without a name
                this.set('selected_devices', (jsonData.selected_devices || []).filter(function(device) { return device.name; }));
            } else if(this.selected_tab == 'device_group') {
                this.set('all_device_groups', jsonData.all_device_groups);
                this.set('not_selected_device_groups', jsonData.not_selected_device_groups);
                this.set('selected_device_groups', (jsonData.selected_device_groups || []).filter(function(group) { return group.name; }));
            } else if(this.selected_tab == 'tags') {
                this.set('all_tags', jsonData.all_tags);
                this.set('not_selected_tags', jsonData.not_selected_tags);
                this.set('selected_tags', jsonData.selected_tags);
            } else if(this.selected_tab == 'criteria') {
				var criteria_columns = new Array();
				criteria_columns = jsonData.all_criteria_columns;
                //this.set('criteria_expression', jsonData.criteria_expression);
                //this.set('criteria_list', jsonData.criteria_list);
                this.set('all_criteria_columns', jsonData.all_criteria_columns);

				OPMClient.NCMComponentController.ncmDynamicCriteriaOptions = (jsonData.criteria_list != undefined) ? jsonData : null;

				var options_list_map = new Map();
				criteria_columns.forEach(function(columns) {
					if(columns.options_list !== undefined) {
						options_list_map.set(columns.id,columns.options_list)//No I18N
					}
				});
				OPMClient.NCMComponentController.ncmAdvReportOptions = options_list_map;
            }
            this.set('load',true); //No I18N
        }
	},
	rerenderComponent :function(){
		this.refresh = false;
		this.rerender();
	}.observes('refresh'), //No I18N
	actions:{
		selectTab : function(selected_tab){
			this.editFilterDetails = (OPMClient.ReportsDetailsController.isEditAdvReport ? true : false);
		    this.filter_type=selected_tab;
		    this.selected_tab=selected_tab;
			$('#'+selected_tab).addClass('active');
			$('#'+selected_tab).siblings('li').removeClass('active');
			$('#'+selected_tab+'_tab').addClass('active');
			$('#'+selected_tab+'_tab').siblings('div').removeClass('active');
            if(selected_tab == 'device') {
                if(this.all_devices == null) {
                    this.set('refresh',true); //No I18N
//                    var data = { 'filter_id': this.filter_id, 'filter_type' : selected_tab} //No I18N
//                    var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
//                    var jsonData = opm_ajaxGetResponse(url,data);
//                    if(jsonData.isSuccess) {
//                        this.set('all_devices', jsonData.all_devices);
//                        this.set('not_selected_devices', jsonData.not_selected_devices);
//                        this.set('selected_devices', jsonData.selected_devices);
//
//                    }
                }
            } else if(selected_tab == 'device_group') {
                if(this.all_device_groups == null) {
                    this.set('refresh',true); //No I18N
//                    var data = { 'filter_id': this.filter_id, 'filter_type' : selected_tab} //No I18N
//                    var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
//                    var jsonData = opm_ajaxGetResponse(url,data);
//                    if(jsonData.isSuccess) {
//                        this.set('all_device_groups', jsonData.all_device_groups);
//                        this.set('not_selected_device_groups', jsonData.not_selected_device_groups);
//                        this.set('selected_device_groups', jsonData.selected_device_groups);
//                        this.set('refresh',true); //No I18N
//                    }
                }
            } else if(selected_tab == 'tags') {
                if(this.all_tags == null) {
                    this.set('refresh',true); //No I18N
//                    var data = { 'filter_id': this.filter_id, 'filter_type' : selected_tab} //No I18N
//                    var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
//                    var jsonData = opm_ajaxGetResponse(url,data);
//                    if(jsonData.isSuccess) {
//                        this.set('all_tags', jsonData.all_tags);
//                        this.set('not_selected_tags', jsonData.not_selected_tags);
//                        this.set('selected_tags', jsonData.selected_tags);
//                        this.set('refresh',true); //No I18N
//                    }
                }
            } else if(selected_tab == 'criteria' && this.all_criteria_columns == null) {
                this.set('refresh',true); //No I18N
//                var data = { 'filter_id': this.filter_id, 'filter_type' : selected_tab} //No I18N
//                var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
//                var jsonData = opm_ajaxGetResponse(url,data);
//                if(jsonData.isSuccess) {
//                    this.set('criteria_expression', jsonData.criteria_expression);
//                    this.set('criteria_list', jsonData.criteria_list);
//                    this.set('all_criteria_columns', jsonData.all_criteria_columns);
//                    this.set('refresh',true); //No I18N
//                }
            }
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmDynamicCriteriaComponent = Ember.Component.extend({
	all_criteria_columns: [],
	options_list: [],
	eoSaleSupportConditions: [
        {key: "webclient.admin.traps.equals", value: "EQUAL"},//No I18N
        {key: "webclient.admin.traps.notequals", value: "NOT_EQUAL"}//No I18N
    ],
	allConditions:[
	    {key: "webclient.admin.traps.equals", value: "EQUAL"}, //No I18N
        {key: "webclient.admin.traps.notequals", value: "NOT_EQUAL"}, //No I18N
        {key: "webclient.map.foldermonitor.select.filterfilecontains", value: "LIKE"}, //No I18N
        {key: "webclient.admin.traps.notcontains", value: "NOT_LIKE"}, //No I18N
        {key: "fwa.search.starts.with", value: "STARTS_WITH"}, //No I18N
        {key: "fwa.search.ends.with", value: "ENDS_WITH"} //No I18N
    ],

	didInsertElement : function() {
		var _self = this;

		$("#ncmDynamicCriteria .btnPlus").off('click').on('click', function() {
			var currentForm = $(this).closest(".reportCriteria.w-91");
			_self.send("addCriteria", currentForm); //No I18N
		});

		$("#ncmDynamicCriteria .deleteBtn").off('click').on('click', function() {
			var currentForm = $(this).closest(".reportCriteria.w-91");
			$(currentForm).remove();
			_self.send("reArrangeCriteria"); //No I18N
			_self.send("createCriteriaPattern"); //No I18N
		});
        $("#ncmDynamicCriteria .reportCriteria__andOr").find("input[type='radio']").off("change").on("change", function() {
            var currentForm = $(this).closest(".reportCriteria.w-91");
            _self.send("createCriteriaPattern"); //No I18N
        });

		$("#ncmDynamicCriteria .select2.criteria_columns").off("change").on("change", function() {
			_self.send("paramSelectionChanged", this); //No I18N
		});
		$("#ncmDynamicCriteria .select2.condition").off("change").on("change", function() {
			var paramSelect = $(this).closest(".reportCriteria.w-91").find(".select2.criteria_columns");
			_self.send("paramSelectionChanged", paramSelect, true); //No I18N
		});

        $("#ncmDynamicCriteria .select2.criteria_columns").trigger("change");
		var criterias = $("#ncmDynamicCriteria .reportCriteria.w-91");
		if(criterias.length == 1) {
		    $(criterias[0]).find(".reportCriteria__andOr").find("input[type='radio']").attr('name', "andqd1");
		    $(criterias[0]).find(".reportCriteria__andOr").find("input[type='radio'][value='AND']").prop('checked',"checked");
			$(criterias[0]).find(".deleteBtn").parent().hide();
			$(criterias[0]).find(".reportCriteria__andOr").hide(); //No I18N
		}
		$("#ncmDynamicCriteria .select2").select2();
		_self.send("createCriteriaPattern"); //No I18N
		if(OPMClient.NCMComponentController.ncmDynamicCriteriaOptions) {
			OPMClient.NCMComponentController.isEdit = true;
            _self.send('renderExistingCriterias', OPMClient.NCMComponentController.ncmDynamicCriteriaOptions); //No I18N
            OPMClient.NCMComponentController.isEdit = false;
		}
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('all_criteria_columns'), //No I18N
	actions:{
		addCriteria: function(currentForm, isEdit) {
			var _self = this;
			if(isEdit != undefined && isEdit == true) {
				var lastForm  = $("#ncmDynamicCriteria .reportCriteria.w-91.lastForm");
				currentForm = (lastForm.length > 0) ? lastForm : $("#ncmDynamicCriteria .reportCriteria.w-91");
			}

			$(currentForm).find('.select2').each(function() {
				if($(this).hasClass('select2-hidden-accessible')) {
					$(this).select2('destroy');
				}
			});
			$(currentForm).find(".deleteBtn").parent().show();
			$(currentForm).find(".reportCriteria__andOr").show();
			var newForm = $(currentForm).clone(true);
			$(newForm).find(".reportCriteria__no").find('span').text($(".reportCriteria.w-91").length + 1);
			$(newForm).find("input.criteriaValue").val("");
			$(currentForm).find('.select2').each(function() {
				if(!$(this).hasClass('select2-hidden-accessible')) {
					$(this).select2({minimumResultsForSearch: 0});
				}
			});
			var andOrBtnLength = $('input[type="radio"][name^="andqd"][value="AND"]').length;
            for(var i=2;i<=andOrBtnLength+1;i++){
              var andOrName = "andqd"+i;
              if($('input[type="radio"][name="'+andOrName+'"').length ==0){
                $(newForm).find(".reportCriteria__andOr").find("input[type='radio']").attr('name', andOrName);
              }
            }
			$(newForm).find(".deleteBtn").parent().show();
			$(newForm).find(".reportCriteria__andOr").show(); //No I18N
			$(newForm).find(".reportCriteria__andOr").find("input:radio").removeAttr("checked");
			$(newForm).find(".reportCriteria__andOr").find("input[type='radio'][value='AND']").prop('checked', "checked");
			$(newForm).find(".select2").select2({minimumResultsForSearch: 0});
			$(newForm).find("select.criteria_columns").trigger("change");
			$(newForm).insertAfter(currentForm);
			_self.send("reArrangeCriteria"); //No I18N
			_self.send("createCriteriaPattern"); //No I18N
		},
		reArrangeCriteria: function() {
			var criterias = $("#ncmDynamicCriteria .reportCriteria.w-91");
			if(criterias.length == 1) {
				$(criterias[0]).find(".reportCriteria__no").find('span').text(1);
				$(criterias[0]).find(".reportCriteria__andOr").find("input[type='radio']").attr('name', "andqd1");
				$(criterias[0]).find(".deleteBtn").parent().hide();
				$(criterias[0]).find(".reportCriteria__andOr").hide(); //No I18N
				$(criterias[0]).addClass("lastForm"); //No I18N
			}
			else {
				for(var i = 1; i <= criterias.length; i++) {
					var criteria = criterias[i-1];
					if($(criteria).hasClass("lastForm")){
					    $(criteria).removeClass("lastForm"); //No I18N
					}
					if(i == criterias.length){
						$(criteria).addClass("lastForm"); //No I18N
						$(criteria).find(".reportCriteria__andOr").hide(); //No I18N
					}
					$(criteria).find(".reportCriteria__no").find('span').text(i);
					var andOrNameId = "andqd" + i;
                    $(criteria).find(".reportCriteria__andOr").attr('id', andOrNameId); //No I18N
				}
			}
		},
		createCriteriaPattern: function() {
			var criterias = $("#ncmDynamicCriteria .reportCriteria.w-91");
			var pattern = "";
			for(var i = 0; i < criterias.length; i++) {
				var criteria = criterias[i];
				var operators = $(criteria).find(".reportCriteria__andOr");
				if(i > 0) {
					pattern += " ";
				}

				pattern += (i + 1);

				if(i > 0) {
					pattern = "(" + pattern + ")";
				}
				if($(operators).length > 0 && (i != (criterias.length - 1))) {
					pattern += " " + $(criteria).find("#andqd"+(i+1)).find("input[type='radio']:checked").val();
				}
			}
			$("#criteriaPattern").val(pattern);
		},
		paramSelectionChanged: function(paramSelect, fromCond) {
			var selectedValue = $(paramSelect).val();
			if(selectedValue){
			var options_list = new Map();
			options_list = OPMClient.NCMComponentController.ncmAdvReportOptions;
			var parent = $(paramSelect).closest(".reportCriteria.w-91");
			var conditionSelect = $(parent).find(".select2.condition");
            if (selectedValue === "eo_sale" || selectedValue === "eo_support") {
                conditionSelect.find("option").each(function() {
                    var v = $(this).attr("value");  //No I18N
                    if (v !== "EQUAL" && v !== "NOT_EQUAL") {
                        $(this).remove();
                    }
                });
            }
			var selected_column = $(parent).find(".select2.criteria_columns");
			var condition_type = selected_column.find('option:selected').attr('condition-type');
			if(condition_type === 'BOOLEAN' || condition_type === 'COMPLIANCE_STATUS' || condition_type === 'BASELINE_CONFLICT' || condition_type === 'SYSLOG_STATUS'){
			    $(parent).find("#condition .select2").find('option[value=EQUAL]').prop('selected',true);
			    $(parent).find("#condition .select2").select2();
			    $(parent).find("#condition .select2").attr('disabled',true);
			}
			else{
			    $(parent).find("#condition .select2").attr('disabled',false);
			}
			var selectedCondition = $(conditionSelect).val();
			var optionsList = options_list.get(selectedValue);
			var optionsSelBox = $(paramSelect).closest(".reportCriteria.w-91").find("#optionValue");
			var criteriaValue = $(paramSelect).closest(".reportCriteria.w-91").find("#criteriaValue");
			if(!OPMClient.NCMComponentController.isEdit){
                 $(criteriaValue).find(".criteriaValue").val('');
            }
			if(optionsList != undefined && (selectedCondition == "EQUAL" || selectedCondition == "NOT_EQUAL")) {
				$(optionsSelBox).show();
				$(criteriaValue).hide();
			}
			else {
				$(optionsSelBox).hide();
				$(criteriaValue).show();
			}
			var optionsSelect = $(paramSelect).closest(".reportCriteria.w-91").find(".select2.options_list");
			$(optionsSelect).empty();
			$.each(optionsList, function(i,options) {
				$(optionsSelect).append($("<option></option>").attr("value", options.option_key).text(options.option_value));  //No I18N
            });
			if(!fromCond) {
				if($(this).hasClass('select2-hidden-accessible')) {
					$(conditionSelect).select2('destroy').select2({minimumResultsForSearch: 0});
				} else {
					$(conditionSelect).select2({minimumResultsForSearch: 0});
				}
				$(conditionSelect).find("option").first().attr("selected", true); //No I18N
			}
			}

		}, renderExistingCriterias: function(criteriaOptions) {
			var _self = this;
			var criteriaDetails = criteriaOptions.criteria_list;
			for(var i = 0; i < criteriaDetails.length; i++) {
				var criteria = criteriaDetails[i];
				if(i > 0) {
                    _self.send("addCriteria", null,true); //No I18N
                }
                _self.send("rendorCriteriaValues", criteria, i); //No I18N
			}
			var criteria_expression = criteriaOptions.criteria_expression;
			$("#criteriaPattern").val(criteria_expression);
		}, rendorCriteriaValues: function(criteria, i) {
			var criEle = $("#ncmDynamicCriteria .reportCriteria.w-91").eq(i);
			$(criEle).find('select.criteria_columns').val(criteria.column_id);
			$(criEle).find('select.criteria_columns').trigger('change');
			$(criEle).find('select.condition').val(criteria.condition);
			$(criEle).find('select.criteria_columns').trigger('change');
			var valEle = $(criEle).find('.criteriaValue');
			$(valEle).val(criteria.value);
			if(!(criteria.condition == "EQUAL" || criteria.condition == "NOT_EQUAL")){
			    $(criEle).find("#criteriaValue").show();
                $(criEle).find("#optionValue").hide();
			}
			$(criEle).find('input[type="radio"][name^="andqd"][value="' + criteria.comparator.toUpperCase() + '"]').prop('checked', true);
			$(criEle).find('input[type="radio"][name^="andqd"][value="' + criteria.comparator.toUpperCase() + '"]').trigger('change');
		}
    },
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

//IgnoreI18N_End
OPMClient.NcmDeviceSelectorsComponent = Ember.Component.extend({
	pageName : 'DG', //No I18N
	typeId : 'new', //No I18N
	data : null,
	refresh : false,
	load : false,
	activeTab : 'Device Group', // No I18N
	tabList : [],
	didInsertElement : function(){
		var typeController = null;
		if(OPMClient.SettingsTabController.NCMInventoryScheduleType == 'Custom Template'){
			this.pageName = 'Configlet'; // No I18N
		}

		if(this.pageName == 'DG'){
			typeController = OPMClient.InventoryDeviceDetailsController.deviceName;
			if(!/^\d*$/.test(typeController)){
				typeController='new'; //No I18N
			}
		}else if(this.pageName === 'Schedule' || this.pageName === 'Configlet' || this.pageName === 'ScheduleProbeCustomerSelection'){ //No I18N
			typeController = OPMClient.SettingsNCMConfigController.scheduleId;
		}else if(this.pageName == 'CustomReports'){ //No I18N
			typeController = OPMClient.ReportsDetailsController.ncmCustomReportId;
		}else if(this.pageName == 'ChangeNotification'){ //No I18N
			typeController = OPMClient.SettingsNCMConfigController.notifId;
		}else if(this.pageName == 'Policies'){ //No I18N
			typeController = OPMClient.NCMInventoryComplianceNewController.policyId;
		}
		if(typeController !== undefined && typeController != null && typeController != ''){
			this.set('typeId',typeController); //No I18N
		}
		var data = {'pageName': this.pageName, //No I18N
					'operationId' : this.typeId //No I18N
					}
		var url = window.OPM.apiUrlPattern + "/v2/ncmdevice/getNCMDeviceSelectionDetails";//No I18N
		var jsonData = opm_ajaxGetResponse(url,data);
		if(this.pageName == 'Schedule' || this.pageName == 'Configlet'){
			if(this.typeId == 'new'){
				var dgSelectList=[{'hostName':Ember.I18n.t('webclient.admin.schedulereports.devicegroupselect'),'id':-1}];//No I18N
				jsonData.allDG.forEach(function(dgParam) {
					dgSelectList.push(dgParam);
					});
				jsonData.allDG=dgSelectList;				
			}
		}

		if(this.pageName == 'Schedule') {
			var totalDeviceCount = 0;
			if(jsonData.unSelectedDevices != undefined) {
				totalDeviceCount = jsonData.unSelectedDevices.length;
			}
			if(jsonData.selectedDevices != undefined) {
				totalDeviceCount = totalDeviceCount + jsonData.selectedDevices.length;
			}
			if(totalDeviceCount < 500) {
				$("#threadInfoRow").hide(); 
			}
			
		}

		if(OPMClient.SettingsTabController.NCMInventorySchedulePageFrom == 'Inventory' || OPMClient.SettingsTabController.NCMInventorySchedulePageFrom == 'Devices') {
			var selRowsId =OPMClient.SettingsTabController.NCMInventoryScheduleSelectedDevice;
			var selectedDevices = new Array();
			for (var index = 0; index < jsonData.unSelectedDevices.length; index++) {
				var id = JSON.stringify(jsonData.unSelectedDevices[index].id);
				if(selRowsId.indexOf(id) != -1) {
					selectedDevices.push(jsonData.unSelectedDevices[index]);
					jsonData.unSelectedDevices.splice(index, 1);
					index--;
				}
			}
			jsonData.selectedDevices = selectedDevices;
			jsonData.selectDevicesBy="Devices"; //No I18N
		}else if(OPMClient.SettingsTabController.NCMInventorySchedulePageFrom == 'DGroup' || OPMClient.SettingsTabController.NCMInventorySchedulePageFrom == 'DGroupGrid'){ // No I18N
			var selRowsId = OPMClient.SettingsTabController.NCMInventoryScheduleSelectedDGroup;
			jsonData.dg_id = selRowsId;
			jsonData.selectDevicesBy="Device Group"; //No I18N
		}
		
		this.set('data',jsonData); //No I18N
		this.set('tabList',jsonData.tabDetails); //No I18N
		this.set('load',true); //No I18N
		activeTab = jsonData.selectDevicesBy == undefined && jsonData.selectDevicesBy == null ? 'Device Group' : jsonData.selectDevicesBy; // No I18N
		this.set('activeTab',activeTab); //No I18N
		OPMClient.SettingsNCMConfigController.QUERYID = jsonData.QUERYID;
		if (this.pageName === 'Schedule') {
			// Device selection might be altered based on policy selection,
			// So storing device selection here to restore it later
			var backupMap = {};
			backupMap.allDG = this.data.allDG;
			backupMap.dg_id = this.data.dg_id;
			backupMap.unSelectedDevices = this.data.unSelectedDevices;
			if (this.data.selectedDevices) {
				backupMap.selectedDevices = this.data.selectedDevices;
			}
			OPMClient.NCMCompliancePolicyController.set('schedDeviceSelectionBackup', backupMap); //No I18N
		}
		OPMClient.NCMComponentController.ncmDeviceSelectionComponent = this;
	},
	rerenderComponent :function(){	
		this.refresh = false;
		this.rerender();
	}.observes('refresh'), //No I18N
	actions:{
		selectTab : function(tabContentId){
			$('#'+tabContentId).addClass('active');
			$('#'+tabContentId).siblings('li').removeClass('active');
			$('#'+tabContentId+'Content').addClass('active');
			$('#'+tabContentId+'Content').siblings('div').removeClass('active');
			if(tabContentId == 'devicesTab'){
				OPMClient.NCMComponentController.deviceSelector.set('unSelected',this.data.unSelectedDevices); //No I18N
				OPMClient.NCMComponentController.deviceSelector.set('selected',this.data.selectedDevices); //No I18N
				OPMClient.NCMComponentController.deviceSelector.set('selectionType','Devices'); //No I18N
			}else if(tabContentId == 'deviceGroupTab'){ //No I18N
				if(this.pageName == 'Schedule' || this.pageName == 'Configlet'){ // DropDown
					OPMClient.NCMComponentController.deviceGroupSelector.set('allDetails',this.data.allDG); //No I18N
					OPMClient.NCMComponentController.deviceGroupSelector.set('selected',this.data.dg_id); //No I18N
					OPMClient.NCMComponentController.deviceGroupSelector.set('selectionType','DG'); //No I18N
				}else{
					OPMClient.NCMComponentController.deviceGroupSelector.set('unSelected',this.data.unSelectedDG); //No I18N
					OPMClient.NCMComponentController.deviceGroupSelector.set('selected',this.data.selectedDG); //No I18N
					OPMClient.NCMComponentController.deviceGroupSelector.set('selectionType','DG'); //No I18N
				}
			} else if (tabContentId === 'customersTab') { //No I18N
				OPMClient.NCMComponentController.customerSelector.set('unSelected',this.data.unSelectedCustomers);//No I18N
				OPMClient.NCMComponentController.customerSelector.set('selected',this.data.selectedCustomers);//No I18N
				OPMClient.NCMComponentController.customerSelector.set('selectionType','Customers'); //No I18N
			} else if (tabContentId === 'probesTab') {//No I18N
				OPMClient.NCMComponentController.probeSelector.set('unSelected',this.data.unSelectedProbes);//No I18N
				OPMClient.NCMComponentController.probeSelector.set('selected',this.data.selectedProbes);//No I18N
				OPMClient.NCMComponentController.probeSelector.set('selectionType','Probes'); //No I18N
			} else if(tabContentId == 'criteriaTab'){ //No I18N
				//var criteria_list = [{"Dummy":"Dummy"}]; //No I18N
				var criteriaDetails = null;
				if(this.data.criteriaDetails !== undefined && this.data.criteriaDetails != null){
					criteriaDetails = this.data.criteriaDetails;
				}
				OPMClient.NCMComponentController.criteriaDeviceSelector.set('criteriaDetails',criteriaDetails); //No I18N
				OPMClient.NCMComponentController.criteriaDeviceSelector.set('parameter',this.data.parameter); //No I18N
				OPMClient.NCMComponentController.criteriaDeviceSelector.set('condition',this.data.condition); //No I18N
			}
			updateDevSelBasedOnCompCheckTask();
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		if (this.pageName === 'Schedule') {
			OPMClient.NCMCompliancePolicyController.set('schedDeviceSelectionBackup', null);// No I18N
		}
	}
});

OPMClient.NcmSingleSelectionComponent = Ember.Component.extend({
	selectionType : "DG", //No I18N
	length : false,
	data : null,
	allDetails : [],
	selected : null,
	didInsertElement : function(){
		OPMClient.NCMComponentController.deviceGroupSelector = this;
		$('.select2').select2();
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('allDetails'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmMultiSelectionComponent = Ember.Component.extend({
	selectionType : "Devices", //No I18N
	length : false,
	data : null,
	unSelected : [],
	selected : [],

	didInsertElement : function(){
		if(this.selectionType == "Devices"){
			OPMClient.NCMComponentController.deviceSelector = this;
		} else if (this.selectionType === "Customers") {//No I18N
			OPMClient.NCMComponentController.customerSelector = this;
		} else if (this.selectionType === "Probes") {//No I18N
			OPMClient.NCMComponentController.probeSelector = this;
		} else {
			OPMClient.NCMComponentController.deviceGroupSelector = this;
		}
		unSelectedDeviceSize = this.unSelected !== undefined && this.unSelected !== null ? Object.keys(this.unSelected).length : 0;
		selectedDeviceSize = this.selected !== undefined && this.selected !== null ? Object.keys(this.selected).length : 0;
		
		this.set('length',unSelectedDeviceSize + selectedDeviceSize); //No I18N
		$('.srch').find('input').each(function(index,input){
            $(input).off('keyup').on('keyup',function(){
                var str = $(input).val();
                var divId = $(input).attr('id');
                divId = divId.replace("srch_",""); //No I18N
                changeNCMSelectList(str,divId);
            });
		});
	},
	actions : {
		right_to_left : function(selType){
            var right_selected_list = $("#selected_"+selType+" :selected:visible"); //No I18N
            $('#unSelected_'+selType).append(right_selected_list); //No I18N
            $("#selected_"+selType+" :selected:visible").remove(); //No I18N
        },
        left_to_right : function(selType){
            var left_selected_list = $("#unSelected_"+selType+" :selected:visible"); //No I18N
            $('#selected_'+selType).append(left_selected_list); //No I18N
            $("#unSelected_"+selType+" :selected:visible").remove(); //No I18N
        }
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('unSelected'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

/* unused code
OPMClient.NcmSelectionBoxComponent = Ember.Component.extend({
	templateName: "components/ncm-selection-box", // No I18N
	didInsertElement : function(){
	},
	willDestroyElement: function(){
	}
});
*/

OPMClient.NcmDeviceCriteriaComponent = Ember.Component.extend({
	comparator : null,
	condition : null,
	parameter : null,
	criteriaDetails : null,
	didInsertElement : function(){
	    var _self = this;
		$('#criteriaTabContent').css('padding-right','10px');
		OPMClient.NCMComponentController.criteriaDeviceSelector = this;
		var criteriaDetails = this.criteriaDetails;
		var parameterMap = this.parameter;
        var conditionMap = this.condition;
        OPMClient.SettingsNCMConfigController.parameterMap=parameterMap;
        OPMClient.SettingsNCMConfigController.conditionMap=conditionMap;
        var paramObj={
        		
        };
        $.each(OPMClient.SettingsNCMConfigController.parameterMap, function(indx,condObj)
		{
        	var key=condObj.Key;
			var value=condObj.Value;
			paramObj[key]=value;
		});
    	var conditionObj={
        		
        };
        $.each(OPMClient.SettingsNCMConfigController.conditionMap, function(indx,condObj)
		{
        	var key=condObj.Key;
			var value=condObj.Value;
			conditionObj[key]=value;
		});
        OPMClient.SettingsNCMConfigController.parameterMap=paramObj;
        OPMClient.SettingsNCMConfigController.conditionMap=conditionObj;
		if(criteriaDetails != null){	        
			var children = $("#CriteriaTable > div");
			for (int1 = 0; int1 < children.length; int1++) 
	    	{	
				var arrayEl = $(children[int1]);
				var cri = criteriaDetails[int1];
				if(cri.Condition == 'IP_RANGE') {
					continue;
				}
	        		
				if(cri.Field != 'RESOURCEID' && cri.Field != 'DEVICE_GROUP_ID'){
					arrayEl.find("select[name='parameter']").val(cri.Field).trigger('change'); // No I18N
					arrayEl.find("select[name='condition']").val(cri.Condition).trigger('change'); // No I18N
					arrayEl.find("select[name='comparator']").val(cri.Comparator).trigger('change'); // No I18N
				}
    			var arry = ['MANAGED','BACKUP_STATUS','ISCONFLICT','BASELINE_ISCONFLICT','COMPLIANCE_STATUS']; // No i18n
    		    if(arry.indexOf(cri.Field) != -1) {
	        		arrayEl.find('.paternDivs').hide();
	        		arrayEl.find("#conditionDiv").hide();
	        		arrayEl.find("#"+cri.Field+"_patterDiv").show();
	        		arrayEl.find("select[name='"+cri.Field+"_pattern']").val(cri.Value.toString()).trigger('change');// No I18N
    		    } else {
	        		arrayEl.find("#conditionDiv").show();
	        		arrayEl.find("#pattern").val(cri.Value).trigger('change'); // No I18N
		   		}
			}
		}
		$('.select2[name="parameter"]').off('change').on('change', function(event) {
              _self.send('changeParam', event.target); //No I18N
        });
		$('.select2').select2();
	},
	actions : {
        changeParam : function(selectElem){
            var index = $(selectElem).attr('data-index'); //No I18N
            OPMClient.NCMComplianceRuleController.dGroupparamChange(selectElem,index);
        }
    },
	rerenderComponent :function(){
		this.rerender();
	}.observes('criteriaDetails') //No I18N
});

OPMClient.NcmFileImportComponent = Ember.Component.extend({
	didInsertElement : function(){
	}
});

OPMClient.NcmDeviceFilterComponent = Ember.Component.extend({
	filter : null,
	filterValue : null,
	didInsertElement : function(){
		OPMClient.NCMComponentController.ncmDeviceFilter = this;
		if(this.filterValue == null || this.filterValue == undefined){
			if(OPMClient.NCMComponentController.ncmDeviceFilterValue != null){
				this.set('filterValue', OPMClient.NCMComponentController.ncmDeviceFilterValue); //No I18N
			}
		}
		
		if(this.filterValue == undefined || this.filterValue == null || this.filterValue == 'All Devices'|| this.filterValue == ' Devices'){
			$('#'+this.filter+'_selectDevicesDiv').hide();
		} else {
			if(OPMClient.SettingsTabController.NCMInventorySchedulePageFrom != null && OPMClient.SettingsTabController.NCMInventoryScheduleType != 'Custom Template'){
				$('#'+this.filter+'_selectDevicesDiv').hide();
			}else{
				if(this.filterValue.length > 24 ){
					$('#'+this.filter+'_selectFilterbtnDiv').css('height', '45px');
				}else{
					$('#'+this.filter+'_selectFilterbtnDiv').css('height', '35px');
				}
				$('#'+this.filter+'_selectDevicesDiv').show();
			}
		}
	},
	actions : {
	    changeDevicesOnFilter : function(filter){
	        if(filter == 'vendor'){
            		changeDevicesVendor();
            	}
	    }
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('filterValue'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmGridComponent = Ember.Component.extend({
	templateName:"components/ncm-grid",//No I18N
	gridId: null,
	chkBoxColWidth: 3,
	dragColWidth: 1,
	gridOptions: {
		hideCheckBox: false,
		allowDragAndDrop: false,
		allowMultiSelect: true,
		showRowMoveButtons: false
	},
	didInsertElement : function(){
		var _self = this;
		var gridData = _self.get('gridData');
		if(!gridData.gridOptions) {
			gridData.gridOptions = this.gridOptions;
		} else {
			for(var key in this.gridOptions) {
				if(gridData.gridOptions.hasOwnProperty(key)) {
					continue;
				}
				gridData.gridOptions[key] = this.gridOptions[key];
			}
		}
		if(gridData && !gridData.renderWithExistingData ) {
			$.ajax({
				url : gridData.gridURL,
				type : 'GET',// No I18N
				dataType : 'json',// No I18N
				success : function(jsonData) {
					_self.gridId = jsonData.gridId;
	            	var headers = jsonData.headers;
					var rows = jsonData.rows;
					
					// Re-Calculate ColumnWidth Starts
					if(gridData.gridOptions) {
						var reduceBy = 0;
						if(!gridData.gridOptions.hideCheckBox) {
							reduceBy += _self.chkBoxColWidth;
						}
						if(gridData.gridOptions.allowDragAndDrop) {
							reduceBy += _self.dragColWidth;
						}
						if(gridData.gridOptions.showRowMoveButtons) {
							reduceBy += _self.dragColWidth;
						}
						
						if(reduceBy > 0) {
							for(var j = 0; headers && j < headers.length; j++) {
								var header = headers[j];
								if(!header.width) {
									header.width = ((100 - reduceBy) / gridData.colCount);
								}
								header.width = ((100 - reduceBy) * header.width) / 100;
								headers[j] = header;
							}
							jsonData.headers = headers;
						}
					}
					// Re-Calculate ColumnWidth Ends
					
					if(rows && headers) {
						for(var j = 0; j < headers.length; j++) {
							var header = headers[j];
							for(var i = 0; i < rows.length; i++) {
								var row = rows[i];
								if(header.formatter != undefined && header.formatter != null && header.formatter != "") {
									row[header.name] = window[header.formatter](row[header.name], row);
									jsonData.rows[i]=row;
								}
							} 
						}
						gridData.data = jsonData;
						gridData.renderWithExistingData = true;
						_self.set('gridData', gridData); //No I18N
						_self.rerender();
					}
				}
			});
		} else {
			gridData.renderWithExistingData = false;
			_self.set('gridData', gridData); //No I18N
			if(gridData.data) {
				this.gridId = gridData.data.gridId;
			}
		}
		_self.send('addEvents', gridData); //No I18N
		if(gridData && gridData.gridOptions && gridData.gridOptions.gridPos) {
			var pos = gridData.gridOptions.gridPos;
			for(var key in pos) {
				var css = {};
				css[key] = pos[key] + "px"; // No I18N
				$('.NFA_scheduleReports').css(css);	
			}
		} 
	},
	actions: {
		addEvents: function(gridData) {
			var _self = this;
			var data = gridData ? gridData.data : undefined;
			if(data && data.gridId) {
				var gridId = data.gridId;
				$('#' + gridId).off('reloadCustomGrid').on('reloadCustomGrid', function() {
					_self.rerender();
				});
				
				$('#' + gridId).off('getGridRow').on('getGridRow', function(event, rowId) {
					if(data.rows) {
						for(var i = 0; i< data.rows.length; i++) {
							if(data.rows[i].id == rowId) {
								return data.rows[i];
							}
						}
					}
				});
				
				$('#' + gridId).off('getSelectedRowIds').on('getSelectedRowIds', function(event, rowId) {
					var rows = [];
					if(!gridData.gridOptions.hideCheckBox) {
						$('#' + gridId).find('.staticTable__row:not(.headerRow)').each(function() {
							var chk = $(this).find(".staticTable__col.chkBox").find("input.cbox");
							if($(chk).is(":checked")) {
								rows.push($(this).attr("id"));
							}
						});	
					}
					return rows;
				});
				
				$('#' + gridId).find('.staticTable__row:not(.headerRow)').find(".staticTable__col:not(.chkBox, .dragBtn)").off('click').on('click', function() { //No I18N
					_self.send('onSelect', this); //No I18N
				});
				
				if(gridData.gridOptions && gridData.gridOptions.allowDragAndDrop) {
					$('#' + gridId).find('.staticTable__row:not(.headerRow)').draggable({ //No I18N
						helper: function() {
							$('.staticTable__row.draggedRow').removeClass('draggedRow'); //No I18N
							$(this).addClass('draggedRow');
							var container = $('<div/>').attr('id', 'draggingContainer');
						    $(container).append($(this).clone().removeClass("draggedRow"));
							$(container).addClass("draggingRow");
						    return container;
						}
					});
					
					$('#' + gridId).find('.staticTable__row').droppable({ //No I18N
						hoverClass: "highlight", //No I18N
						drop: function (event, ui) {
							var dropTarget = event.target;
							if(dropTarget && $(dropTarget).hasClass('staticTable__row')) {
								if($(dropTarget).closest(".staticTable").length > 0 && $(dropTarget).closest(".staticTable").attr("id") == gridId) {
									var droppedRow = ui.draggable;
									$(droppedRow).insertAfter(dropTarget);
									$('.staticTable__row.draggedRow').removeClass('draggedRow'); //No I18N
									if(gridData.gridOptions.showSaveBtnOnDrag == false) {
										_self.send("onDrag"); // No I18N
									} else {
										$('#' + gridId).parent().find('#dragSaveDiv').slideDown(400);
									}
								}
							}
						}
					});
				}
				
				if(gridData.gridOptions && gridData.gridOptions.showRowMoveButtons) {
					$('#' + gridId).find(".staticTable__col.dragBtn").find(".moveUp, .moveDown").off("click").on("click", function() { //No I18N
						var row = $(this).closest(".staticTable__row");
						if($(this).hasClass("moveUp")) {
							$(row).insertBefore($(row).prev());
						} else {
							$(row).insertAfter($(row).next());
						}
					});
					$('#' + gridId).parent().find('#dragSaveDiv').slideDown(400);
				}
				
				if(!(gridData.gridOptions.hideCheckBox)) {
					$('#' + gridId).find(".staticTable__col.chkBox").find("input.cbox").off('change').on('change', function() { //No I18N
						if($(this).closest('.staticTable__row').hasClass('headerRow')) {
							var rowCheckboxes = $('#' + gridId).find(".staticTable__col.chkBox").find("input.cbox").not(this);
							var notChecked = $(rowCheckboxes).not(":checked").length;
							if(notChecked > 0) {
								$(rowCheckboxes).prop("checked", true);
							} else {
								$(rowCheckboxes).prop("checked", false);
							}
						} else {
							if(!gridData.gridOptions.allowMultiSelect) {
								if($(this).is(":checked")) {
									var otherCheckboxes = $('#' + gridId).find(".staticTable__col.chkBox").find("input.cbox:checked").not(this);
									$(otherCheckboxes).prop("checked", false);	
								}
							}
						}
					});
				}
			}
		},
		onSelect: function(col) {
			var _self = this;
			var gridData = _self.get('gridData');
			
			var gridOptions = gridData.gridOptions;
			if(gridOptions && gridOptions.onSelect) {
				var data = gridData.data;
				var gridId = data.gridId;
				var rowId = $(col).closest(".staticTable__row").attr("id");
				var colName = $(col).attr("name");
				var rowData = $('#' + gridId).triggerHandler('getGridRow', rowId);
				var onSelectFunction = gridOptions.onSelect;
				
				if(onSelectFunction == 'NCMCredRule') {
					if(window.OPM.userPermissions.ncmConfigAutomationWrite) {
						if(colName != 'ACTION') {
							var parentURL = (location.href.indexOf("NCMConfigAutomation") > -1) ? "NCMConfigAutomation" : "Settings/NcmConfig"; // No I18N
							location.href = window.OPM.apiclientUrl + parentURL + "/CredentialRule/AllRules/Edit/" + rowId; // No I18N
						}
					}
				}
			}
		},
		onDrag: function() {
			$('#' + this.gridId).parent().find('#dragSaveDiv').slideUp(400);
			var _self = this;
			var gridData = _self.get('gridData');
			var gridOptions = gridData.gridOptions;
			var gridId = this.gridId;
			
			if(gridOptions && gridOptions.onSelect) {
				var data = gridData.data;
				gridId = data.gridId;
				var onDragFunction = gridOptions.onDrag;
				
				if(onDragFunction == 'NCMCredRule') {
					var orderNo = 1;
					var ruleOrder = {};
					$("#" + gridId).find('.staticTable__row:not(.headerRow)').each(function() {
						var rowId = $(this).attr('id');
						ruleOrder[rowId] = orderNo;
						orderNo++;
					});
					
					var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmtags/ruleReorder'; //No I18N
					$.ajax({
						url : ajaxRequestUrl,
						type : 'POST',// No I18N
						dataType : 'json',// No I18N
						data: {ruleOrder : JSON.stringify(ruleOrder)},
						async: false,
						success : function(jsonData) {
							var cls = 'errorMsg'; //No I18n
			            	if(jsonData.isSuccess) {
								cls = 'successMsg'; //No I18n
								$('#CredentialRules').trigger('reloadCustomGrid');
							} 
							opm_infoMsgs(cls, jsonData.statusMsg); //No I18N
						}
					});
				}
			}
		},
		dragCancel: function() {
			$('#' + this.gridId).parent().find('#dragSaveDiv').slideUp(400);
			this.rerender();			
		}
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('gridData.gridURL') //No I18N
});

OPMClient.NcmDeviceCriteriaNewComponent = Ember.Component.extend({
	init: function() {
				this._super();
				this.set('criteriaData', null);//No I18N
				this.set('params', [//No I18N
					{key: "webclient.common.intro.Hostname", value: "RESOURCENAME"},//No I18N
					{key: "opstor.inventory.ipaddress", value: "ADDRESS"},//No I18N
					{key: "ncm.acd.Vendor", value: "VENDORNAME"},//No I18N
					{key: "jsp.report.customreports.devicetemplate", value: "DEVICE_TEMPLATE"},//No I18N
					{key: "webclient.common.series", value: "SERIES"},//No I18N
					{key: "webclient.snapshot.hardware.model", value: "MODEL"},//No I18N
					{key: "webclient.snapshot.hardware.osversion", value: "OSVERSION"}//No I18N
				]);
				this.set('conditions', [//No I18N
					{key: "webclient.admin.traps.equals", value: "EQUAL"},//No I18N
					{key: "webclient.admin.traps.notequals", value: "NOT_EQUAL"},//No I18N
					{key: "webclient.map.foldermonitor.select.filterfilecontains", value: "LIKE"},//No I18N
					{key: "webclient.admin.traps.notcontains", value: "NOT_LIKE"},//No I18N
					{key: "fwa.search.starts.with", value: "STARTS_WITH"},//No I18N
					{key: "fwa.search.ends.with", value: "ENDS_WITH"},//No I18N
					{key: "webclient.layer.discovery.iprange", value: "IP_RANGE"}//No I18N
				]);
				this.set('vendors', []);//No I18N
				this.set('templates', []);//No I18N

				var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/vendorList?IS_PRERENDER=true';//No I18N
				var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        		if(jsonData != null && jsonData.Vendor) {
        			this.set("vendors", jsonData.Vendor); //No I18N
        		}

        		var customColumn1 = jsonData.COLUMN_NAME1;
        		var customColumn2 = jsonData.COLUMN_NAME2;
        		var customColumn3 = jsonData.COLUMN_NAME3;
				this.set('customColumns', [//No I18N
					{key: customColumn1, value: "COLUMNVALUE1"},//No I18N
					{key: customColumn2, value: "COLUMNVALUE2"},//No I18N
					{key: customColumn3, value: "COLUMNVALUE3"}//No I18N
				]);
	},
	didInsertElement : function(){
		ajaxRequestUrl = window.OPM.apiUrlPattern + '/v2/ncmdevice/deviceTemplates'; //No I18N
		var jsonData = opm_ajaxGetResponse(ajaxRequestUrl); //No I18N
		if(jsonData != null && jsonData.rows) {
			var arr = [];
			for(var i = 0; i < jsonData.rows.length; i++) {
				var row = jsonData.rows[i];
				arr.push(row.DISPLAYNAME);
			}
			this.set("templates", arr.sort()); //No I18N
		}
		
		var _self = this;
		$(".btnPlus").off('click').on('click', function() {
			_self.send("addCriteria"); //No I18N
		});
		$(".select2.param").off("change").on("change", function() {
			_self.send("paramSelectionChanged", this); //No I18N
		});
		$(".select2.condition").off("change").on("change", function() {
			var paramSelect = $(this).closest(".reportCriteria.w-91").find(".select2.param");
			_self.send("paramSelectionChanged", paramSelect, true); //No I18N
		});
		
		setTimeout(function() {
			$(".select2.param").trigger("change");
		}, 500);
		_self.send("createCriteriaPattern"); //No I18N
		var queryId = _self.get('queryId'); //No I18N
		if(!isNaN(queryId)) {
			var data = {'pageName': this.pageName, //No I18N
					'operationId' : queryId //No I18N
					}
			var url = window.OPM.apiUrlPattern + "/v2/ncmdevice/getNCMDeviceSelectionDetails";//No I18N
			var jsonData = opm_ajaxGetResponse(url,data);
			if(jsonData.criteriaDetails) {
				var interval = setInterval(function() {
					if($('.deviceTypeCol select').first().find("option").length > 0) {
						_self.send('renderExistingCriterias', jsonData.criteriaDetails); //No I18N
						clearInterval(interval);	
					}
				}, 100);
			}
		}
	},
	actions: {
		addCriteria: function() {
			var _self = this;
			var addBtn = $(".btnPlus");
			var currForm = $(addBtn).closest(".reportCriteria.w-91");
			
			$(currForm).find('.select2').each(function() {
				if($(this).hasClass('select2-hidden-accessible')) {
					$(this).select2('destroy');
				}
			});
			var newForm = $(currForm).clone(true);
			$(currForm).find('.select2').each(function() {
				if(!$(this).hasClass('select2-hidden-accessible')) {
					$(this).select2({minimumResultsForSearch: 0});
				}
			});
			
			$(addBtn).parent().remove();
			$(newForm).find(".reportCriteria__no").find('span').text($(".reportCriteria.w-91").length + 1);
			
			$(newForm).find("input.criValue").val("");
			
			var andOrBtn = $("#andOrBtn").clone(true);
			$(andOrBtn).removeAttr("id");
			$(andOrBtn).show();
			$(andOrBtn).find("input[type='radio']").off("change").on("change", function() {
				_self.send("createCriteriaPattern"); //No I18N
			});
			$(andOrBtn).find("input[type='radio'][value='AND']").prop('checked', true);
			$(andOrBtn).find("input[type='radio']").attr('name', "andqd" + $(".reportCriteria.w-91").length);
			
			var deleteBtn = $("#delCriteriaBtn").clone(true);
			$(deleteBtn).removeAttr("id");
			$(deleteBtn).show();
			$(deleteBtn).off('click').on('click', function() {
				$(currForm).remove();
				_self.send("reArrangeCriteria"); //No I18N
				_self.send("createCriteriaPattern"); //No I18N
			});
			
			$(currForm).find(".opmFormRow.column3.rightBtn1").append(deleteBtn);
			$(currForm).append(andOrBtn);
			
			$(newForm).find(".select2").select2({minimumResultsForSearch: 0});
			
			$(newForm).find("select.param").trigger("change");
			
			$(newForm).insertAfter(currForm)
			
			_self.send("createCriteriaPattern"); //No I18N
		}, reArrangeCriteria: function() {
			var criterias = $(".reportCriteria.w-91");
			for(var i = 0; i < criterias.length; i++) {
				var criteria = criterias[i];
				$(criteria).find(".reportCriteria__no").find('span').text(i + 1);
				$(criteria).find(".reportCriteria__andOr").find("input[type='radio']").attr('name', "andqd" + (i + 1)); //No I18N
			}
		}, paramSelectionChanged: function(paramSelect, fromCond) {
			var selectedValue = $(paramSelect).val();
			var parent = $(paramSelect).closest(".reportCriteria.w-91");
			var conditionSelect = $(parent).find(".select2.condition");
			var option = $(conditionSelect).find("option[value='IP_RANGE']");
			
			var selectedCondition = $(conditionSelect).val();
			if(!fromCond) {
				if(selectedValue == "ADDRESS") {
					$(option).prop('disabled', false);
					if($(this).hasClass('select2-hidden-accessible')) {
						$(conditionSelect).select2('destroy').select2({minimumResultsForSearch: 0});
					} else {
						$(conditionSelect).select2({minimumResultsForSearch: 0});
					}
				} else {
					$(option).prop('disabled', true);
					if($(this).hasClass('select2-hidden-accessible')) {
						$(conditionSelect).select2('destroy').select2({minimumResultsForSearch: 0});
					} else {
						$(conditionSelect).select2({minimumResultsForSearch: 0});
					}
					$(conditionSelect).find("option").first().prop("selected", true); //No I18N
				}
			}
			
			$(parent).find('.valueCol').hide();
			$(parent).find('.vendorCol').hide();
			$(parent).find('.deviceTypeCol').hide();
			$(parent).find('.valueCol').find('input').attr('placeholder', Ember.I18n.t("jsp.commonstr.Value")); //No I18N
			
			if(selectedValue == "VENDORNAME" && (selectedCondition == "EQUAL" || selectedCondition == "NOT_EQUAL")) {
				$(parent).find('.vendorCol').show();
			} else if(selectedValue == "DEVICE_TEMPLATE" && (selectedCondition == "EQUAL" || selectedCondition == "NOT_EQUAL")) { //No I18N
				$(parent).find('.deviceTypeCol').show();
			} else if(selectedValue == "ADDRESS" && selectedCondition == "IP_RANGE") { //No I18N
				$(parent).find('.valueCol').show();
				$(parent).find('.valueCol').find('input').attr('placeholder', Ember.I18n.t("webclient.discovery.startip") + " - " + Ember.I18n.t("webclient.discovery.endip")); //No I18N
			} else {
				$(parent).find('.valueCol').show();
			} 
		}, createCriteriaPattern: function() {
			var criterias = $(".reportCriteria.w-91");
			var pattern = "";
			for(var i = 0; i < criterias.length; i++) {
				var criteria = criterias[i];
				var operators = $(criteria).find(".reportCriteria__andOr");
				
				if(i > 0) {
					pattern += " ";
				}
				
				pattern += (i + 1);
				
				if(i > 0) {
					pattern = "(" + pattern + ")";
				}
				
				if($(operators).length > 0) {
					pattern += " " + $(criteria).find(".reportCriteria__andOr").find("input[name='andqd" + (i + 1) + "']:checked").val();
				}
				
			}
			$("#criPattern").val(pattern);
		}, renderExistingCriterias: function(criteriaDetails) {
			var _self = this;
			
			for(var i = 0; i < criteriaDetails.length; i++) {
				var criteria = criteriaDetails[i];
				if(i > 0) {
					_self.send("addCriteria"); //No I18N
				}
				
				_self.send("rendorCriteriaValues", criteria, i); //No I18N
			}
		}, 
		rendorCriteriaValues: function(criteria, i) {
			setTimeout(function() {
				var criEle = $(".reportCriteria.w-91").eq(i);
				$(criEle).find('select.param').val(criteria.Field);
				$(criEle).find('select.param').trigger('change');
				$(criEle).find('select.condition').val(criteria.Condition);
				$(criEle).find('select.condition').trigger('change');
				
				var valEle = $(criEle).find('.criValue:visible');
				
				$(valEle).val(criteria.Value);
				if($(valEle).is('select')) {
					try {
						$(valEle).select2({minimumResultsForSearch: 0});
					} catch(e) {}
				}	
				
				if(i > 0) {
					$(criEle).prev().find('input[type="radio"][name^="andqd"][value="' + criteria.Comparator.toUpperCase() + '"]').prop('checked', true);
					$(criEle).prev().find('input[type="radio"][name^="andqd"][value="' + criteria.Comparator.toUpperCase() + '"]').trigger('change');
				}
			}, 500);
		}
	},
	rerenderComponent :function(){
		this.rerender();
	}.observes('queryId') //No I18N
});
OPMClient.NCMSCPPasswordChangeComponent = Ember.Component.extend({
	templateName: "components/NCM-SCP-Password-Change", // No I18N
	didInsertElement: function () {
	    if(window.OPM.isOPUtils || window.OPM.isMSPCentral || window.OPM.isCentralServer || OPMClient.ApplicationController.isNFACentralServer || (window.OPM.isFWADE && window.OPM.isFWAServer)){
	        OPMClient.ApplicationController.set("scpPwdChangeRequire",false);// No I18N
	        toShowGettingStartedPageInAzure();
	        return;
	    }
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getSCPDetails'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        if(!(this.get('isNcmSettings') !== undefined && this.get('isNcmSettings') === true) && jsonData.isSCPPWDChangeNeed !== undefined && jsonData.isSCPPWDChangeNeed === false){
            OPMClient.ApplicationController.set("scpPwdChangeRequire",false);// No I18N
            toShowGettingStartedPageInAzure();
             return;
        }
		$('html.horizontalView #header,html.horizontalView #nav,html #opmAlertInfoSec .opmziabot').css("pointer-events","none");// No I18N
		$("html.horizontalView #header .licensePopup,html.horizontalView #header .opmAdvancedSettingsContainer").css("pointer-events","all");// No I18N
		$(".settingsHdr").css("pointer-events","none");// No I18N
		$("aside").css("pointer-events","none");// No I18N
	    $('#scpNewPass').focus(function () {
            $('#scpPwdDiv .passwordHelpInfo').addClass('active');
        });
        $('#scpNewPass').keypress(function () {
            $('#scpPwdDiv .passwordHelpInfo').addClass('active');
        });
        var scpUserName = jsonData.scp_username;
        this.set("scpUserName",scpUserName);//No I18N
        setTimeout(function(){
            $('.changeScpPwdCnt').css('top','0px');
        },300);
	},
	actions:{
        updateScpPwd : function(){
            var fieldsToValidate = {'empty':['scpNewPass','confirmPass'],'matchPassword':{'scpNewPass':'confirmPass'}};//No I18N
            var isValid = opm_validateFields(fieldsToValidate);
            if(isValid){
                var newPassword = $("#scpNewPass").val();//No I18N
                var retypePassword = $("#confirmPass").val();//No I18N
                var scpUserName = this.get("scpUserName");
                if (isValidPwd(newPassword, scpUserName,5,100,true).result !== true || newPassword === scpUserName) {
                     $('#scpNewPass').css({'border-color':'#f00'});
                     return false;
                }
                var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/updateSCPDetails'; //No I18N
                var data = {scp_password: newPassword};
                var response = opm_ajaxPostRequest(ajaxRequestUrl, data);
                var	cls = "errorMsg"; //No I18N
                var message = ""; //No I18N
                if(response.isSuccess){
                    cls = "successMsg"; //No I18N
                    message = response.statusMsg;
                }
                if(response.result !== undefined && response.result.message !== undefined ){
                    cls = "successMsg"; //No I18N
                    message = response.result.message;
                }
                else{
                    message = response.statusMsg;
                }
                opm_infoMsgs(cls,message);
                var self = this;
                if(cls === 'successMsg'){
                    OPMClient.ApplicationController.set('scpPwdChangeRequire',false);//No I18N
                    if(this.get('isNcmSettings') !== undefined && this.get('isNcmSettings') === true){
                        self.set('showScpPwdChange',false);//No I18N
                        self.set('isScpPwdChanged',true);//No I18N
                        setTimeout(function(){
                            OPMClient.Settings.NCMGetServerSettings();
                            $('input[id="SCPStart"]').prop('checked',true);
                        },100);
                    }
                    toShowGettingStartedPageInAzure();
                }
           }
        }
	},
    keyUp: function (e) {
        if ($('#scpNewPass').is(':focus')) {
            var password = $("#scpNewPass").val();
            var scpUserName = this.get("scpUserName");
            var result = isValidPwd(password, scpUserName,5,100,true);
            if(scpUserName === password && password != ""){
                result.usrPwdEql = true;
            }
            passwordCheck('#scpPwdDiv', result); //No I18N
            if(result.emptyCheck===true && result.usrPwdEql===false && result.minLen==true && result.specialChar==true && result.upperChar==true && result.lowerChar==true){
                $('#scpPwdDiv .passwordHelpInfo').removeClass('active');
            }
        }
    },
	willDestroyElement: function(){
        $("html.horizontalView #header,html #opmAlertInfoSec .opmziabot").css("pointer-events","");// No I18N
		$("html.horizontalView #nav").css("pointer-events","");// No I18N
		$(".settingsHdr").css("pointer-events","");// No I18N
		$("aside").css("pointer-events","");// No I18N
	}
});

OPMClient.NcmReportDashCountComponent = Ember.Component.extend({
	templateName: "components/Ncm-Report-Dash-Count", // No I18N
	didInsertElement: function () {
	},
	willDestroyElement: function(){

	}
});

OPMClient.NcmReportFilterComponent = Ember.Component.extend({
	templateName: "components/Ncm-Report-Filter", // No I18N
	didInsertElement: function () {
		$('#DEVICEGROUPS').select2();
	},
	willDestroyElement: function(){

	}
});

OPMClient.NcmReportGridComponent = Ember.Component.extend({
	templateName: "components/Ncm-Report-Grid", // No I18N
	didInsertElement: function () {
		OPMClient.NCMReport.refreshReportGridData('all');// No I18n
	},
	willDestroyElement: function(){

	}
});

OPMClient.NcmTimeFilterComponent = Ember.Component.extend({
    timeDurationInfo:{
         isDefault : true,
         selection : 'last_7_days'//No I18N
    },
    isFilterMandatory:true,
	didInsertElement: function () {
        var _self = this;
        _self.send('initialRender',this.get('timeDurationInfo'));//NO I18N
        $('#ncmTimeFilter .date-range-select').off("click");
        $('#ncmTimeFilter .date-range-select').on('click','.selectBox',function(){
            if($('#ncmTimeFilter .date-range-select').hasClass('active')){
                _self.send('updateData');//NO I18N
                $('#ncmTimeFilter .date-range-select').removeClass('active');
            }
            else{
                $('#ncmTimeFilter .date-range-select').addClass('active');
            }
        });
	},
	actions: {
	    initialRender : function(timeDuration){ // call updateTimeFilterSel based on the input
            this.send('clearCustomTimeSel')//NO I18N
            $( "#once_startat_fv" ).datepicker({ dateFormat: 'yy-mm-dd'});//No I18N
            $( "#once_endat_fv" ).datepicker({ dateFormat: 'yy-mm-dd'});//No I18N
	        $("input[name='timeperiods'][value="+timeDuration.selection+"]").prop("checked", true);//No
            this.send('updateTimeFilterSel');//NO I18N
	    },
	    updateData : function(){ // time period and apply filter icon should call this, respective css handling and applyFilter will be called from here
            var _self = this;
            var selectedTime = $("input[name='timeperiods']:checked").val();//No I18N
            if(selectedTime == 'custom'){
                _self.send('updateSelectedTimeText');//NO I18N
                if(!$('#ncmTimeFilter .custom-date').is(":visible")){
                    $('#ncmTimeFilter .custom-date').show();
                }
                else{
                    if($('#once_startat_fv').val() !== '' && $('#once_endat_fv').val() !== ''){ // start or end value should not be empty
                        _self.send('updateTimeFilterSel');//NO I18N
                    }
                    else{
                        _self.send('initialRender',_self.get('timeDurationInfo'));//NO I18N
                        _self.send('applyFilter');//NO I18N
                    }
                }
            }
            else{
                _self.send('applyFilter');//NO I18N
                _self.send('clearCustomTimeSel')//NO I18N
                _self.send('updateTimeFilterSel');//NO I18N
            }
	    },
	    clearCustomTimeSel : function(){
	        $('#ncmTimeFilter .custom-date').hide();
            $('#once_startat_fv').val('');
            $('#once_endat_fv').val('');
            $('#once_startat_fv').removeClass('validateField error');
            $('#once_endat_fv').removeClass('validateField error')
	    },
	    applyFilter : function(custom){ // invoke the respective parent call to update the time filter,
            var selectedTime = $("input[name='timeperiods']:checked").val();//No I18N
            var isValid = true;
            if(selectedTime == 'custom'){
                var fields = {'empty':['once_startat_fv','once_endat_fv']};//No I18N
                isValid = opm_validateFields(fields);
            }

            if(isValid){
                if(custom){
                    this.send('updateTimeFilterSel');//NO I18N
                }
                $('#ncmTimeFilter .date-range-select').removeClass('active');
                var timeDuration = OPMClient.NCMFirmwareVulnerability.getTimeFilterSelected();
                if($("input[name='timeperiods']:checked").attr('initial-value') == 'true' && (!custom || (timeDuration.period && $('#once_startat_fv').attr('initial-value') == timeDuration.period.fromTime && $('#once_endat_fv').attr('initial-value') == timeDuration.period.toTime))){
                    return;
                }
                if(custom && timeDuration.period && timeDuration.period.fromTime && timeDuration.period.toTime){
                    $('#once_startat_fv').attr('initial-value',timeDuration.period.fromTime);
                    $('#once_endat_fv').attr('initial-value',timeDuration.period.toTime);
                }
                $("input[name='timeperiods'][initial-value='true']").attr('initial-value','false');
                $("input[name='timeperiods']:checked").attr('initial-value','true');
                this.sendAction('action',timeDuration);
            }
	    },
	    updateTimeFilterSel : function(){ // Update the text and select the select Box value
	        this.send('updateSelectedTimeText');//NO I18N
	        var selectedTime = $("input[name='timeperiods']:checked").val();//No I18N
            if(selectedTime == 'custom'){
                if($('#once_startat_fv').val() === '' && $('#once_endat_fv').val() === ''){
                    this.send('initialRender',this.get('timeDurationInfo'));//NO I18N
                    return;
                }
                var timeVal = getYYYYMMDDDate(new Date($('#once_startat_fv').val())) + ' - ' + getYYYYMMDDDate(new Date($('#once_endat_fv').val()));
                $('#ncmTimeFilter .text-grey').text(timeVal);
            }
            else{
                $('#ncmTimeFilter .text-grey').text('');
            }
	    },
	    updateSelectedTimeText : function(){
	        var selectedTimeText = '';
            var selectedTime = $("input[name='timeperiods']:checked").val();//No I18N
            if(selectedTime === 'selectTime'){
                selectedTimeText = Ember.I18n.t("webclient.ncm.select.time.range", this);//NO I18N
            }
            else{
                selectedTimeText = $("input[name='timeperiods']:checked").siblings('label').text();//NO I18N
            }
            $('#ncmFilterSelectedTime').text(selectedTimeText); // No I18N
	    }
	},
	willDestroyElement: function(){

	}
});


OPMClient.NcmShowMessageComponent = Ember.Component.extend({
    msgInfo : ""
});


OPMClient.NcmCompBlockCriteriaComponent = Ember.Component.extend({
    blockCriteriaData:'',
    blockConditionSelBox : [{condition: Ember.I18n.t("jsp.commonstr.None",this), value: "0"}, //No I18N
                            {condition: Ember.I18n.t("jsp.commonstr.Shouldcontain",this), value: "80"}, //No I18N
                            {condition: Ember.I18n.t("jsp.commonstr.ShouldNotcontain",this), value: "90"}], //No I18N

	didInsertElement : function() {
		var _self = this;
        if(this.get('blockCriteriaData') !== undefined && this.get('blockCriteriaData').length>0){
            _self.send("renderExistingBlockCriteria",this.get('blockCriteriaData')); //No I18N
        }
		$(".parentBlockCondition").off('click').on('change', function() {
		    var criteriaChildren = $("#block-criteria-table > div");
		    if(criteriaChildren.length == 1 && $(".parentBlockCondition").find(":selected").val() !='0'){
		        $("#block-criteria-table .parentBlockConditionValue").css("display","block");
		        $("#block-criteria-table .parentBlockConditionBtn").css("display","block");
		        $("#block-criteria-table .parentBlockComparator").css("display","block");
		    }
		    if($(".parentBlockCondition").find(":selected").val() =='0'){
		        $('.childBlockRows').remove();
		        $("#block-criteria-table .blockConditionValue").val("");
		        $("#block-criteria-table .parentBlockConditionValue").css("display","none");
                $("#block-criteria-table .parentBlockConditionBtn").css("display","none");
                $("#block-criteria-table .parentBlockComparator").css("display","none");
		    }
        });

		$("#block-criteria-table .opmBtnAddIcon").off('click').on('click', function() {
			var currentForm = $(this).closest(".opmFormRow");
			_self.send("addBlockCriteria", currentForm); //No I18N
		});
		$("#block-criteria-table .opmBtnRemoveIcon").off('click').on('click', function() {
			var currentForm = $(this).closest(".childBlockRows");
			$(currentForm).remove();
			_self.send("reArrangeBlockCriteria"); //No I18N
		});
		$("#block-criteria-table .select2").select2();
	},
	actions:{
		addBlockCriteria: function(currentForm,criteria) {
		    var _self = this;
			$(currentForm).find('.select2').each(function() {
                if($(this).hasClass('select2-hidden-accessible')) {
                    $(this).select2('destroy');
                }
            });
            var newForm = $(currentForm).clone(true);
            $(currentForm).find('.select2').each(function() {
                if(!$(this).hasClass('select2-hidden-accessible')) {
                    $(this).select2({minimumResultsForSearch: 0});
                }
            });
            $(newForm).find(".select2").select2({minimumResultsForSearch: 0});
			$(newForm).addClass('childBlockRows').removeClass('parentBlockRow');
			$(newForm).find(".parentBlockCondition option[value='0']").remove();
			$(newForm).find(".parentBlockCondition").removeClass("parentBlockCondition");
			$(newForm).find(".parentBlockConditionValue").removeClass("parentBlockConditionValue");
			$(newForm).find(".parentBlockConditionBtn").remove(".parentBlockConditionBtn");
			$(newForm).find(".parentBlockConditionBtn").remove(".parentBlockComparator");
			$(newForm).find(".blockAddDelBtn").css("display","block");
			$(newForm).find(".parentBlockComparator").find(".select2").removeAttr("disabled"); //No I18N
			$(newForm).find(".parentBlockComparator option[value='NA']").remove();
			$(newForm).find(".parentBlockComparator").css("display","block");
			if(criteria!=undefined){
			    $(newForm).find(".blockCondition").val(criteria.Condition);
			    $(newForm).find(".blockConditionValue").val(criteria.Pattern);
			    $(newForm).find(".parentBlockComparator").find(".select2").val(criteria.Operator);
			    $(newForm).insertAfter($("#block-criteria-table .opmFormRow:last-child"));
			}
			else{
			    $(newForm).find(".blockConditionValue").val("");
			    $(newForm).insertAfter(currentForm);
			}
			_self.send("reArrangeBlockCriteria"); //No I18N
		},
		reArrangeBlockCriteria: function() {
		    var criteriaChildren = $("#block-criteria-table > div");
            for(var i = 0; i < criteriaChildren.length; i++) {
                var criteria = criteriaChildren[i];
                var blockConditionId = "BLOCK_CONDITION" + String(i+1); //No I18N
                var blockConditionValueId = "BLOCK_CONDITION_VALUE" + String(i+1); //No I18N
                $(criteria).find(".blockCondition").attr('id', blockConditionId); //No I18N
                $(criteria).find(".blockConditionValue").attr('id', blockConditionValueId); //No I18N
            }
            $("#block-criteria-table .select2").select2();
        },
        renderExistingBlockCriteria: function(blockCriteriaList){
              var _self = this;
              $("#block-criteria-table .parentBlockConditionValue").css("display","block");
              $("#block-criteria-table .parentBlockConditionBtn").css("display","block");
              $("#block-criteria-table .parentBlockComparator").css("display","block");
              $("#BLOCK_CONDITION1").val(blockCriteriaList[0].Condition);
              $("#BLOCK_CONDITION_VALUE1").val(blockCriteriaList[0].Pattern);
              var currentForm = $(".parentBlockRow");
              for(var i = 1; i < blockCriteriaList.length; i++) {
                  var criteria = blockCriteriaList[i];
                  _self.send("addBlockCriteria",currentForm, criteria); //No I18N
              }
        }
    }
});

OPMClient.NcmDtConfigurationsV2Component = Ember.Component.extend({
	templateName: "settings/ncm-dt-configurations-v2", // No I18N
	didInsertElement: function () {
	},
	willDestroyElement: function(){

	}
});

OPMClient.NcmAddConfigurationV2Component = Ember.Component.extend({
	templateName: "settings/ncm-add-configuration-v2", // No I18N
	didInsertElement: function () {
	},
	willDestroyElement: function(){

	}
});

/*OPMClient.NcmFilterPillsComponent = Ember.Component.extend({
	templateName: "components/ncm-filter-pills", // No I18N
	pageName: "Integrations",	//No I18N
	filter_pills : [{"name": "All", "id": "all", "isHide": true}], //No I18N
	filter_array: [],
	didInsertElement : function() {
		var _self = this;
		var filter_pills = [];
		filter_pills.pushObject({"name": "All", "id": "all", "isHide": true});	//No I18N
		var tabs_list = [];

		if(this.pageName == "Integrations") {
			tabs_list.pushObject({"category":"HelpDesk", "heading":"ServiceDesk Plus", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link": "https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-sdp-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PMP", "img":"/apiclient/fluidicv2/img/addOn/2-serviceDesk.png", "isEdit": false});//No I18N
			tabs_list.pushObject({"category":"HelpDesk", "heading":"ServiceDesk Plus Cloud", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link":"https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-sdp-on-demand-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PMP", "img":"/apiclient/fluidicv2/img/addOn/1-now.png", "isEdit":false});//No I18N
			tabs_list.pushObject({"category":"HelpDesk", "heading":"ServiceNow", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link": "https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-servicenow-with-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PMP", "img":"/apiclient/fluidicv2/img/addOn/2-serviceDesk.png", "isEdit":false});//No I18N
			tabs_list.pushObject({"category":"HelpDesk", "heading":"PagerDuty", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link":"https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-servicenow-with-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PMP", "img":"/apiclient/fluidicv2/img/addOn/1-now.png", "isEdit":false});//No I18N

    		filter_pills.pushObject({"name": "HelpDesk", "id": "helpdesk", "tabs_list": tabs_list, "isHide": false});//No I18N

			tabs_list = [];
			tabs_list.pushObject({"category": "Password Manager", "heading": "Password Manager Pro", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link":"https://www.manageengine.com/network-configuration-manager/kb/how-to/configure-pmp-server.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PMP", "img":"/apiclient/fluidicv2/img/addOn/2-serviceDesk.png", "isEdit":false});//No I18N
			tabs_list.pushObject({"category": "Password Manager", "heading": "PAM360", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link":"https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-sdp-on-demand-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/PAM360", "img":"/apiclient/fluidicv2/img/addOn/1-now.png", "isEdit":false});//No I18N
			tabs_list.pushObject({"category": "Password Manager", "heading": "CyberArk", "description":Ember.I18n.t("webclient.opm.tpi.addonsummary.ncm.sdp"), "help_link":"https://www.manageengine.com/network-configuration-manager/kb/how-to/integrate-servicenow-with-ncm.html?utm_source=inproduct", "route":"#/Settings/NcmConfig/Integration/CyberArk", "img":"/apiclient/fluidicv2/img/addOn/2-serviceDesk.png", "isEdit":false});//No I18N

			filter_pills.pushObject({"name": "Password Manager", "id": "passwordmanager", "tabs_list": tabs_list, "isHide": false});//No I18N
			//Object.assign(filter_pills.find(pills => pills.id === "helpdesk"), {addon_tabs : addon_tabs});
		}

		_self.set('filter_pills',filter_pills);	//No I18N

		setTimeout(function () {
			$('#filterPills #all').addClass('active');

			$('#filterPills .filter-pills .pill').off('click').on('click', function() {
				var filter_pills = _self.get("filter_pills");
				var tab_id = $(this).attr("id");
				var filter_pills_length = filter_pills.length;
				var filter_arr = _self.get("filter_array");

				if(tab_id !== "all") {
					$('#filterPills #all').removeClass('active');

					if($(this).hasClass('active')) {
						$(this).removeClass('active');

						var index = filter_arr.indexOf(tab_id);
						if(index > -1) {
							filter_arr.splice(index, 1);
						}
					} else {
						$(this).addClass('active');
						filter_arr.push(tab_id);
					}

					//tabs_list = (filter_arr.length >= 1) ? tabs_list.filter(tabs => (filter_arr.includes(tabs.id))) : tabs_list;

					if(filter_arr.length == 0 || (filter_arr.length == (filter_pills_length - 1))) {
						filter_arr = [];

						$(this).removeClass('active');
						$(this).siblings('li').removeClass('active');
						$('#filterPills #all').addClass('active');
					}
				}
				else {
					filter_arr = [];
					$(this).siblings('li').removeClass('active');
					$(this).addClass('active');
				}


				/*for(var i = 0; i < filter_pills.length; i++) {
					var filter_pill = filter_pills[i];
					if(filter_arr.length == 0) {
						filter_pill.isHide = false;
					}
					else {
						if(!filter_arr.includes(filter_pill.id)) {
							filter_pill.isHide = true;
							//Object.assign(filter_pills.find(pills => pills.id === filter_pill.id), {isHide : true});
						}
						else {
							filter_pill.isHide = false;
						}
					}
				}
				filter_pills.forEach(function(filter_pill) {
					if(filter_arr.length == 0) {
						filter_pill.isHide = false;
					}
					else {
						if(!filter_arr.includes(filter_pill.id)) {
							filter_pill.isHide = true;
							//Object.assign(filter_pills.find(pills => pills.id === filter_pill.id), {isHide : true});
						}
						else {
							filter_pill.isHide = false;
						}
					}
				});

				_self.set("filter_array", filter_arr);	//No I18N
				_self.set('filter_pills', filter_pills);	//No I18N
			});
		}, 100);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});*/

OPMClient.NcmFilterPillsComponent = Ember.Component.extend({
	templateName: "components/ncm-filter-pills", // No I18N
	pageName: "",	//No I18N
	filter_pills_tags : [],
	filter_pills_summary: [],
	seperate_categories_list:[],
	showOPMCIT:false,
	didInsertElement : function() {
		var _self = this;
		var final_tag_list = [{id:"All", name: "All"}];	//No I18N
		var tag_list = [];
		var tab_summary = [];
		var filter_array = [];

		if(this.pageName === "Integrations") {
			tag_list = OPMClient.SettingsTabController.get('tpi_tag_list').slice();	//No I18N
			tab_summary = OPMClient.SettingsTabController.get('tpi_addOn_list').slice();	//No I18N
		}

		final_tag_list = final_tag_list.concat(tag_list);
		_self.set('filter_pills_tags', final_tag_list);	//No I18N
		_self.set('show_pills_tags', final_tag_list.length>2);	//No I18N

		var seperate_categories_map = new Map();
		var categories_list = new Array();
		var seperate_categories = getTPISeparateCategories();

		for(var i = 0; i < tab_summary.length; i++) {

			var tab_object = tab_summary[i];
			var tagName = tab_object.tagName;
			var tab_array = [];
			if(seperate_categories.includes(tagName)) {
				if(seperate_categories_map.has(tagName)) {
					tab_array = seperate_categories_map.get(tagName);
				}

				tab_array.push(tab_object);
				if(!tab_object.isHide) {
					seperate_categories_map.set(tagName, tab_array);
				}
				tab_summary.splice(i,1);
				i--;
			}
		}
		seperate_categories_map.forEach(function(value, key) {
			var final_category_object = {};
			final_category_object["id"] = key;
			final_category_object["tabs_list"] = value;
			if(value.length && value[0].filterTag){
				final_category_object.filterTag = value[0].filterTag;
			}
		 	categories_list.push(final_category_object);
		})
		if(!window.OPM.isNCM && categories_list.length < 2){
			_self.set('showOPMCIT',true);	//No I18N
		}
		_self.set('filter_pills_summary', tab_summary);	//No I18N
		_self.set('seperate_categories_list', categories_list);	//No I18N


		setTimeout(function () {
			$('#filterPills #All').addClass('active');

			$('#filterPills .filter-pills .pill').off('click').on('click', function() {
				if($(this).hasClass('rounded')) {
					return;
				}

				var copy_tab_summary = OPMClient.SettingsTabController.get('tpi_addOn_list').slice();
				var copy_category_summary = [];
				var all_selected = false;
				var tab_id = $(this).attr("id");
				if(tab_id !== "All") {
					$('#filterPills #All').removeClass('active');

					if($(this).hasClass('active')) {
						$(this).removeClass('active');

						var index = filter_array.indexOf(tab_id);
						if(index > -1) {
							filter_array.splice(index, 1);
						}
					} else {
						$(this).addClass('active');
						filter_array.push(tab_id);
					}

					//copy_tab_summary = (filter_array.length >= 1) ? copy_tab_summary.filter(tags => filter_array.includes(tags.tagName)) : copy_tab_summary;

					if(filter_array.length == 0 || (filter_array.length == (final_tag_list.length - 1))) {
						all_selected = true;
					}
					else {
						var copy_filter_array = filter_array.slice();

						if(filter_array.includes(Ember.I18n.t("webclient.pam.pwdmanager.title"))) {

							copy_category_summary = categories_list.slice();
							copy_category_summary =  copy_category_summary.filter(function(tab_data) {
					        	return tab_data.id === Ember.I18n.t("webclient.pam.pwdmanager.title");
					    	});

							var index = copy_filter_array.indexOf(Ember.I18n.t("webclient.pam.pwdmanager.title"));
							if(index > -1) {
								copy_filter_array.splice(index, 1);
							}
						}

						copy_tab_summary = copy_tab_summary.filter(function(tab_data) {
				        	if(copy_filter_array.includes(tab_data.tagName)) { return true; }
				        	if(tab_data.additionalTagNames != null && Array.isArray(tab_data.additionalTagNames)) {
				        		for(var a = 0; a < tab_data.additionalTagNames.length; a++) {
				        			if(copy_filter_array.includes(tab_data.additionalTagNames[a])) { return true; }
				        		}
				        	}
				        	return false;
				    	});
						_self.set('showOPMCIT',false);//No I18N
						_self.set('filter_pills_summary', copy_tab_summary);	//No I18N
						_self.set('seperate_categories_list', copy_category_summary);	//No I18N
					}
				}
				else {
					all_selected = true;
				}

				if(all_selected) {
					filter_array = [];

					$(this).removeClass('active');
					$(this).siblings('li').removeClass('active');
					$('#filterPills #All').addClass('active');

					_self.set('filter_pills_summary', tab_summary);	//No I18N
					_self.set('seperate_categories_list', categories_list);	//No I18N
					if(!window.OPM.isNCM && categories_list.length < 2){
						_self.set('showOPMCIT',true);//No I18N
					}

				}

			});
		}, 100)
	},
	actions: {
		closeNewTag: function(pageName,msgId)
		{
			opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser',{pageName:pageName,msgId:msgId}); //No I18n
			if(window.OPM.isAuthorized && !window.OPM.isCustomer)
			{
				getNewFeatureList();
			}
		},
		configureAction: function(tagName, header, pageName, contentID) {
			if(pageName !== undefined && contentID !== undefined) {
				opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser',{pageName:pageName,msgId: contentID}); //No I18n
				if(window.OPM.isAuthorized && !window.OPM.isCustomer)	{
					getNewFeatureList();
				}
			}

			if(tagName === Ember.I18n.t("webclient.pam.pwdmanager.title") && OPMClient.PAMSettingsController.pamConfigured && (header != Ember.I18n.t("webclient.PasswordSync"))) {
				opmAlertPopUp("", Ember.I18n.t("webclient.pam.configure.alert",{ param0:  OPMClient.PAMSettingsController.pamHeader, param1:  header}, this),500); //NO I18N
			}

		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmHrzSchedule1Component = Ember.Component.extend({
	templateName: "components/ncm-hrz-schedule1", // No I18N
	pageName: "Integrations",	//No I18N
	moduleName: "PAM",	//No I18N
	didInsertElement : function() {
		var ajaxRequestUrl = "";
		$("#horizontal_schedule1 .accordion1__nav").removeClass("active");

		$("#horizontal_schedule1 .accordion1__nav").off().on('click', function() {
			if($(this).hasClass('active')) {
				$("#horizontal_schedule1 .accordion1__nav").removeClass("active");
				$('#horizontal_schedule1 .accordion1__cont').css({display:'none'});
			}
			else {
				$("#horizontal_schedule1 .accordion1__nav").addClass("active");
				$('#horizontal_schedule1 .accordion1__cont').css({display:'block'});
			}
		});

		$('#horizontal_schedule1 #daily_schedule').on('change', function() {
			$("#weeks_div").hide();
			$("#days_div").hide();
		});

		$('#horizontal_schedule1 #weekly_schedule').on('change', function() {
			$("#weeks_div").show();
			$("#days_div").hide();
		});

		$('#horizontal_schedule1 #monthly_schedule').on('change', function() {
			$("#days_div").show();
			$("#weeks_div").hide();
		});

		$("#weeks_option").select2();
		$("#days_option").select2();
		$("#hours_option").select2();
		$("#minutes_option").select2();

		if(this.pageName == "Integrations" && this.moduleName === "PAM") {
			ajaxRequestUrl = window.OPM.apiUrlPattern + '/pam/getSchedule'; //No I18N
		}

		var response = opm_ajaxGetResponse(ajaxRequestUrl);

		if(response.isSuccess) {
			var repeat_frequency = response.repeat_frequency;

			$("#hours_option").val(response.time_hrs);
			$("#hours_option").trigger('change');

			$("#minutes_option").val(response.time_mins);
			$("#minutes_option").trigger('change');

			if(repeat_frequency === "weekly") {
				$("#weeks_option").val(response.day_of_week);
				$("#weeks_option").trigger('change');
			}
			else if(repeat_frequency === "monthly") {
				$("#days_option").val(response.day_of_month);
				$("#days_option").trigger('change');
			}

			$('#horizontal_schedule1 #'+ repeat_frequency +'_schedule').prop('checked', true);
			$('#horizontal_schedule1 #'+ repeat_frequency +'_schedule').change();

			$("#horizontal_schedule1 .accordion1__nav").click();
		}
		else {
			$('#horizontal_schedule1 #daily_schedule').prop('checked', true);
			$('#horizontal_schedule1 #daily_schedule').change();
		}
	},
	actions: {
		save_schedule: function() {
			OPMClient.Settings.SavePAMSchedule();
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmHrzSchedule2Component = Ember.Component.extend({
	templateName: "components/ncm-hrz-schedule2", // No I18N
	pageName: "Integrations",	//No I18N
	moduleName: "PAM",	//No I18N
	didInsertElement : function() {
		var ajaxRequestUrl = "";
		$('#horizontal_schedule2 .accordion1__cont').css({display:'block'});

		$('#horizontal_schedule2 #disable_schedule').on('change', function() {
			$("#weeks_div").hide();
			$("#days_div").hide();
			$("#executeAtLabel").hide();
			$("#hours_div").hide();
			$("#repeat_hours_div").hide();
			$("#failureMailNotif").hide();
		});

		/*$('#horizontal_schedule2 #hourly_schedule').on('change', function() {
			$("#weeks_div").hide();
			$("#days_div").hide();

			$("#executeAtLabel").show();
			$("#hours_div").show();
			$("#repeat_hours_div").show();
		});*/

		$('#horizontal_schedule2 #daily_schedule').on('change', function() {
			$("#weeks_div").hide();
			$("#days_div").hide();
			$("#repeat_hours_div").hide();

			$("#executeAtLabel").show();
			$("#hours_div").show();
			$("#failureMailNotif").show();
		});

		$('#horizontal_schedule2 #weekly_schedule').on('change', function() {
			$("#days_div").hide();
			$("#repeat_hours_div").hide();

			$("#weeks_div").show();
			$("#executeAtLabel").show();
			$("#hours_div").show();
			$("#failureMailNotif").show();
		});

		$('#horizontal_schedule2 #monthly_schedule').on('change', function() {
			$("#weeks_div").hide();
			$("#repeat_hours_div").hide();

			$("#days_div").show();
			$("#executeAtLabel").show();
			$("#hours_div").show();
			$("#failureMailNotif").show();
		});

		$("#days_option").select2();
		$("#hours_option").select2();
		$("#weeks_option").select2();
		$("#minutes_option").select2();
		$("#repeat_hours_option").select2();

		if(this.pageName == "Integrations" && this.moduleName === "PAM") {
			ajaxRequestUrl = window.OPM.apiUrlPattern + '/pam/getSchedule'; //No I18N
		}

		var response = opm_ajaxGetResponse(ajaxRequestUrl);

		if(response.isSuccess && response.admin_status === "enabled") {
			var repeat_frequency = response.repeat_frequency;

			$("#hours_option").val(response.time_hrs);
			$("#hours_option").trigger('change');

			$("#minutes_option").val(response.time_mins);
			$("#minutes_option").trigger('change');

			if(repeat_frequency === "weekly") {
				$("#weeks_option").val(response.day_of_week);
				$("#weeks_option").trigger('change');
			}
			else if(repeat_frequency === "monthly") {
				$("#days_option").val(response.day_of_month);
				$("#days_option").trigger('change');
			}

			$('#horizontal_schedule2 #'+ repeat_frequency +'_schedule').prop('checked', true);
			$('#horizontal_schedule2 #'+ repeat_frequency +'_schedule').change();

			if(response.connectionFailureMailAddress !== undefined && response.connectionFailureMailAddress !== '') {
			    $("#connection_mail_address").val(response.connectionFailureMailAddress);
			}

			$("#horizontal_schedule2 .accordion1__nav").click();
		}
		else {
			$('#horizontal_schedule2 #disable_schedule').prop('checked', true);
			$('#horizontal_schedule2 #disable_schedule').change();
		}
	},
	actions: {
		save_schedule: function() {
			OPMClient.Settings.SavePAMSchedule();
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NcmDropDown1Component = Ember.Component.extend({
	templateName: "components/ncm-drop-down1", // No I18N
	pageName: "",
	dropDownValues: [],
	didInsertElement : function() {
		var _self = this;
		var pageName = this.pageName;

		var componentID = _self.get("id");
		setTimeout(function () {
			$("#"+componentID).find('.propertiesDropdown__icon.helpbox__webhook').off('click').on('click', function() {
				var valueList = new Array();

				var groupList = $(this).parent().find(".propertiesDropdown__groupList");
				if($(this).hasClass('active')) {
					$(this).removeClass('active');
					groupList.hide();
				} else {
					$(this).addClass('active');

					if(pageName == "Credentials") {
					    resourceID = getCredentialResourceIDs();
					    if(resourceID != null && resourceID.length == 1) {
					        valueList = getPAMUsersList(resourceID[0]);
					    }

					}
					_self.set('dropDownValues', valueList);	//No I18N
					groupList.show();
				}
			});
		},300);
	},
	actions: {
		selectValue: function(componentID, value) {
			var _self = this;
			$('#'+componentID).find('.input_box').val(value);
			$("#"+componentID).find('.propertiesDropdown__groupList').hide();

			if(_self.get("pageName") === "Credentials") {
				enableOrDisableDiv(componentID, true);
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

//ignorei18n_start
OPMClient.NCMEmulatorComponent = Ember.Component.extend({
	templateName: "components/NCM-Emulator", // No I18
	sendingData : false, // This will be true while sending data to server.
	idleTimeout : 120, // timeout to close the terminal emulator. Default 120 seconds idle timeout
	refreshInterval : 300, // Refresh interval from client to send data to server. 300 milliseconds by default
	isIE : window.browserName == 'ie',
	isChrome : window.browserName == 'chrome',
	isSafari : window.browserName == 'safari',
	isOpera : window.browserName == 'opera',
	isFirefox : window.browserName == 'firefox',
	timeout : -1,
	terminalWSId : '',
	RESOURCEID : '',
	ipAddress : '',
	keysPressed : new Array(),
	didInsertElement: function () {
        var data = {};
        data.RESOURCEID = this.get('RESOURCEID');
        data.wsId = sessionStorage.getItem("wsId");
		var deviceType = this.deviceType;
		var terminalCredDataMap = this.data;
		for(var key in terminalCredDataMap) {
			if(terminalCredDataMap.hasOwnProperty(key)) {
				data[key] = terminalCredDataMap[key];
			}
		}
		if(deviceType && !data.hasOwnProperty('deviceType')) {
			data.deviceType = deviceType;
		}
        var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/ncmdevice/terminal', data); // No I18N
        if(response != null && response.isSuccess == true) {
            this.set('terminalWSId', response.terminalWSId);
            this.set('ipAddress', response.ipAddress);
        } else {
            // show the error message and close the session.
			opm_infoMsgs("errorMsg", response.statusMsg);
			//location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+data.RESOURCEID; //No I18N
			window.history.back();
			return;
        }

		// Dragging Ignored
		$(this.element).on('dragstart', function(e) {
			e.preventDefault();
		});

		// Pasting Handled
		var self = this;
		$(this.element).on('paste', function(e) {
			var clipboardData = e.originalEvent.clipboardData || window.clipboardData;
			// Block if clipboard contains any non-text item (like image, rich text, other data types)
			if (clipboardData && clipboardData.items) {
				for (var index = 0; index < clipboardData.items.length; index++) {
					var currItem = clipboardData.items[index];
					if (currItem.kind !== "string" || (currItem.type && currItem.type.indexOf("text") !== 0)) {
						opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.emulator.onlyPlainTextPasteAllowed")); // No I18N
						e.preventDefault();
						return;
					}
				}
			}
			var pastedData = clipboardData.getData('Text');
			if(pastedData.length > 5000){
				opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.emulator.maxPasteLenExceeded")); // No I18N
		        e.preventDefault();
		        return;
			}
			self.send('handlePaste', pastedData, e);
		});
	},
	actions:{
		handlePaste: function(pastedData, event) {
			var _self = this;
			var keysPressed = _self.get('keysPressed');
			// Push each character as a key event
			for (var i = 0; i < pastedData.length; i++) {
				var currChar = pastedData[i];
				var keyData = {
					ctrl: false,
					shift: false,
					alt: false,
					keyCode: -1,
					key: currChar
				};
				keysPressed.unshift(keyData);
			}
			_self.send('sendData');
			// This is to avoid the browser's default paste behavior which might not be compatible with terminal emulation
			event.preventDefault();
		},
        sendData : function () {
            var _self = this;
            var refreshInterval = _self.get('refreshInterval');
            var sendingData = _self.get('sendingData');
            if(sendingData == false) {
                Em.run.later(function(){
                    var sendingDataLatest = _self.get('sendingData');
                    if(sendingDataLatest == false) {
                        _self.set('sendingData', true);
                        var keysPressed = _self.get('keysPressed');
                        var keySequence = new Array();
                        while(keysPressed.length>0) {
                            keySequence.push(keysPressed.pop());
                        }
                        _self.set('sendingData', false);
                        if(keySequence.length > 0) {
                            var data = {};
                            data.keysPressed = JSON.stringify(keySequence);
                            data.terminalWSId = _self.get('terminalWSId');
                            var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/ncmdevice/terminalKeyPress', data); // No I18N
                        }
                    }
                }, refreshInterval);
            }
        },
        keypressed : function(ev) {
            // ascii keys. Empty for non ascii keys
            var k="";

            // Key Code is -1 for ascii keys
            var kc;
            if (ev.keyCode) {
                kc=ev.keyCode;
            }

            // skip for alt ctrl shift
            if(kc == 17 || kc == 18 || kc == 225) {
                return true;
            }

            var ctrl = ev.ctrlKey;
            var alt = ev.altKey;
            var shift = ev.shiftKey;

            // alt
            if(alt) {
                if(kc == 9 || (this.get('isFirefox') == true && kc == 192)) {
                    return true;
                }
                else if (kc>=65 && kc<=90) {
                        kc+=32;
                }
                else if (kc>=97 && kc<=122) {
                        k=String.fromCharCode(27)+String.fromCharCode(kc);
                }
            } else if(ctrl)  {// ctrl
                if(kc == 9) {
                    return true;
                }
                else if (kc>=65 && kc<=90) {
                    k=String.fromCharCode(kc-64); // Ctrl-a..z
                }
                else if (kc>=97 && kc<=122) { k=String.fromCharCode(kc-96); } // Ctrl-A..Z
                else if (kc==54) { k=String.fromCharCode(30); } // Ctrl-^
                else if (kc==109) { k=String.fromCharCode(31); } // Ctrl-_
                else if (kc==219) { k=String.fromCharCode(27); } // Ctrl-[
                else if (kc==220) { k=String.fromCharCode(28); } // Ctrl-\
                else if (kc==221) { k=String.fromCharCode(29); } // Ctrl-]
                else if (kc==219) { k=String.fromCharCode(29); } // Ctrl-]
                else if (kc==219) { k=String.fromCharCode(0);  } // Ctrl-@
                else if (kc==91) { k=String.fromCharCode(27); } // Ctrl-[
                else if (kc==93) { k=String.fromCharCode(29); } // Ctrl-]
                else if (kc==47) { k=String.fromCharCode(31);  } // Ctrl-`
                else if (kc==96) { k=String.fromCharCode(30);  } // Ctrl-`
                else if (kc==92) { k=String.fromCharCode(28);  } // Ctrl-`
                if(k.length > 0) {
                    kc = -1;
                    ctrl = false;
                }
            } else {
                if(kc == 13) {
                    kc = 10;
                } else if(kc>=37 && kc<=40){ // Arrow keys send as key code
					k=ev.key;
				} else if(kc != 8 && kc != 9) { // Send backspace and tab as non ascii
                    k=ev.key;
                    kc = -1;
                }
            }

            if(kc >= 0 || k.length > 0) {
                var keyData = {};
                keyData.ctrl=ctrl;
                keyData.shift=shift;
                keyData.alt=alt;
                keyData.keyCode=kc;
                if(k != '') {
                    keyData.key=k;
                }
                var _self = this;
                var keysPressed = _self.get('keysPressed');
                keysPressed.unshift(keyData);
                _self.send('sendData');
            }
        },
        exit : function() {
            var _self = this;
            var data = {};
            data.terminalWSId = _self.get('terminalWSId');
            opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/ncmdevice/terminalExit', data); // No I18N
        },
		switchToSpark: function() {
			var terminalData = getNCMTerminalSettings();
			if(terminalData.isNCMSGEnabled){
				window.history.back();
				window.open("/apiclient/ember/sshTerminal.jsp?protocol=SSH&resourceID="+this.get('RESOURCEID')+"&deviceType="+OPMClient.SettingsTabController.terminalDeviceType+"&isNCMTerminal=true&width="+window.innerWidth+"&height="+window.innerHeight);
			} else {
				opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.sparkNotEnabled")); //No I18N
			}
		},
		copyAllToClipboard: function() {
			var element = document.getElementById('autofocus_id');
			if (element) {
				var textArea = document.createElement("textarea");
				textArea.value = element.textContent;
				textArea.id = "copyEmulatorContent"; //No I18N
				document.body.appendChild(textArea);
				opm_CopyToClipBoard("#copyEmulatorContent"); //No I18n
				document.body.removeChild(textArea);
				opm_infoMsgs("successMsg", Ember.I18n.t('webclient.restapi.copy.success')); //No I18N
			}
		}
	},
    keyPress: function (ev) {
        var _self = this;
        _self.send('keypressed', ev);
        ev.cancelBubble=true;
        if (ev.stopPropagation) {
            ev.stopPropagation();
        }
        if (ev.preventDefault) {
            ev.preventDefault();
        }
        return false;
    },
    keyDown: function (ev) {
		// Prevent keypress when text is selected
		var selection = window.getSelection();
		if (selection && selection.toString().length > 0) {
			// Allow copy (Ctrl+C) when text is selected
			if (ev.ctrlKey && (ev.key === "c" || ev.key === "C" || ev.keyCode === 67)) {
				return true;
			}
			// Block all other keys when text is selected
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
		// Disable Ctrl+S
		if (ev.ctrlKey && (ev.key === "s" || ev.key === "S" || ev.keyCode === 83)) {
			var _self = this;
            _self.send('keypressed', ev);
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
		// Disable Delete key (46) and left/right arrow keys (37, 39)
		if(ev.keyCode == 46 || ev.keyCode == 37 || ev.keyCode == 39) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
        if(ev.keyCode == 9 || ev.keyCode == 8 || ev.keyCode == 191 || (ev.keyCode >= 37 && ev.keyCode <= 40)) {
            var _self = this;
            _self.send('keypressed', ev);
            ev.cancelBubble=true;
            if (ev.stopPropagation) {
                ev.stopPropagation();
            }
            if (ev.preventDefault) {
                ev.preventDefault();
            }
            return false;
        }
        // Disable Shortcuts for Shift + alphabets
        if (ev.shiftKey && ((ev.keyCode >= 65 && ev.keyCode <= 90) || (ev.keyCode >= 97 && ev.keyCode <= 122))) {
            var _self = this;
            _self.send('keypressed', ev);
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
        return true;
    },
	willDestroyElement: function(){
	    var _self = this;
        var data = {};
        data.terminalWSId = _self.get('terminalWSId');
        opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/ncmdevice/terminalExit', data); // No I18N
		$('#'+this.elementId).find('*').remove();
	}
});//ignorei18n_end

OPMClient.NcmSelectorsComponent=Ember.Component.extend({
	templateName: "components/ncm-selectors", // No I18N
	value : null,
	label : null,
	type : null,
	didInsertElement: function () {
		$(this).find(".select2").select2();
		var _self = this;

		var current_val = this.value;
		var current_type = this.type;

		setTimeout(function() {
		// Regex selection & Multiple Selection
		$('.single-selectionFieldsCustomComponents , .multi-selectionFieldsCustomComponents').each(function() {
			$(this).focus();
			var selectComp = this;
			var $elem = $(this).find(".selectInputComponent , .inputComponent-icon");
			if($(this).hasClass('multi-selectionFieldsCustomComponents') && $(this).hasClass('multiselect')){
				var count = $(this).find('.selectedFieldsBox > ul').children().length;
				var value = count+" "+Ember.I18n.t('ncm.proconfiglet.param.selectvalue.added',this); //No I18N
				$elem.val(value);
			}
			//console.log("inside .single-selectionFieldsCustomComponents , .multi-selectionFieldsCustomComponents");
			$elem.off("click").on("click", function() {//No I18N
				_self.send('toggleSelectComponentList', this); //No I18N
			});

			$(this).children().focusout(function(event){
				event.stopPropagation();
			});
			$(this).focusout(function(event) {
				if(!$(this).is(event.relatedTarget) && $(this).has(event.relatedTarget).length === 0) {
					$(this).find('.singleListComponent:not(.d-none) , .multisingleListComponent:not(.d-none)').addClass('d-none');
					$(this).find('.inputComponent.active').removeClass('active');
					$(this).find('.multiFielderrorMsg').addClass('d-none');
				}
			});

			/*$(document).mouseup(function (e) {
				console.log('this : '+this);
	            var divElement= $(selectComp);
	            console.log('divElement : '+divElement)
	            console.log('!divElement.is(e.target) : '+!divElement.is(e.target)+" ,divElement.has(e.target).length === 0"+divElement.has(e.target).length);
	            if(!divElement.is(e.target) && divElement.has(e.target).length === 0) {
	            	$(this).find('.singleListComponent:not(.d-none) , .multisingleListComponent:not(.d-none)').addClass('d-none');
					$(this).find('.inputComponent.active').removeClass('active');
	            }
	        });*/
		});

		// Add regex slide show
		$('.addValueBtn').off("click").on("click", function(event) {
			$(this).closest('ul').siblings('.singleValuesComponent').removeClass('d-none');
		});
		//Cancel regex addition
		$('.flex.end > .btn-grey').off("click").on("click", function(event) {
				$component = $(this).closest('.singleValuesComponent').addClass('d-none');
				//$component.addClass('d-none');
		});
		// Add regex
		$('.flex.end > .addRegexBtn').each(function(){
			$(this).off("click").on("click", function() {
				_self.send('addValueToList',$(this).closest('.singleValuesComponent')); //No I18N
			});
		});

		//Select regex

		$('.singleListComponent').find('ul li:not(".addValueBtn")').each(function(){
			$(this).off("click").on("click", function() {
				_self.send("selectFromList",this); // No I18N
			});
		});

		$('.opmBtn.done').each(function(){
			$(this).off("click").on("click", function() {
				var isAdded = true;
				var _object = this;
				var $inputcomponent = $(this).closest('.inputComponent');
				var $selectField = $inputcomponent.find('.selectedFieldsBox');
				$selectField.find('input').each(function(){
					if($(this).val() == undefined || $(this).val() == ''){
						isAdded = false;
						validateFocus($(this),"empty",null,null,null); //No I18N
					}
				});
				if(isAdded){
					var $select_inputcomponent = $inputcomponent.find('.selectInputComponent');
					var current_value = $select_inputcomponent.val();
					current_value = current_value.replace("Add","Edit");
					$select_inputcomponent.val(current_value)
					$(this).closest('.multisingleListComponent').addClass('d-none');
				}
			});
		});
		//Delete all chooses selected values
		$('.deleteAll.deleteSelected').each(function(){
			$(this).off("click").on("click", function() {
				$(this).closest('.multisingleListComponent').find('.multiFielderrorMsg').removeClass('d-none');
			});
		});

		$('.multiFielderrorMsg').each(function(){
			$(this).find('.deleteAllValues').off("click").on("click", function() {
				_self.send('deleteAllMultiselectValues',this); //No I18N
			});
			$(this).find('.keepAllValues').off("click").on("click", function() {
				$(this).parents('.multisingleListComponent').find('.multiFielderrorMsg').addClass('d-none');
			});
		});


		//Delete chooses selected values
		$('.close.deleteSelected').each(function(){
			$(this).off("click").on("click", function() {
				_self.send('removeSelectElem',$(this).parent()); //No I18N
			});
		});

		$('.close.hide').each(function(){
			$(this).off("click").on("click", function() {
				$(this).parents('.multisingleListComponent').addClass('d-none');
			});
		});
		$('.addAvailableDeviceIcon').each(function(){
			$(this).off("click").on("click", function() {
				$(this).parents('.multiSelectBox4').siblings('.addToAvailList').removeClass('d-none');
			});
		});

		$('.opmBtn.addSelectionValues').each(function(){
			$(this).off("click").on("click", function() {
				_self.send('addValuesToSelectList',this); //No I18N
			});
		});

		$('.searchHoverComponent').each(function(){
			$(this).off('keyup').on('keyup',function(){
				_self.send('searchFromSelectValues',this); //No I18N
			});
		});

		$('.searchBtn').each(function(){
			$(this).off("click").on("click", function() {
				var $parent = $(this).parent();
				$parent.toggleClass('searchOpen');//No I18N
				});
			});
		$('.DevicesSearchBox').each(function(){
			$(this).off('keyup').on('keyup',function(){
				_self.send('searchFromExecutionValues',this); //No I18N
			});
		});

		},100);

	},
	actions:{
		deleteAllMultiselectValues : function(param){
			var $selectedField = $(param).parents('.multisingleListComponent').find('.selectedFieldsBox'); //No I18N
			$selectedField.addClass('no-data-available');
			if($selectedField.find('p').length == 0){
				var para = document.createElement('p');
				$(para).text(Ember.I18n.t('webclient.reports.view.nodata',this)); //No I18N
				$selectedField.append(para);
			}
			$selectedField.find('ul').empty(); //No I18N
			$(param).parents('.inputComponent').find('.selectInputComponent').val('0 '+Ember.I18n.t('ncm.proconfiglet.param.selectvalue.added',this));//No I18N
			$(param).parents('.multiFielderrorMsg').addClass('d-none');
		},
		removeSelectElem :function($target_elem){
			var $ulElem = $target_elem.parent('ul'); //No I18N
			$target_elem.remove();
			var itemLen = $ulElem.find('li').length;
			$ulElem.parents('.inputComponent').find('.selectInputComponent').val(itemLen+' '+Ember.I18n.t('ncm.proconfiglet.param.selectvalue.added',this));//No I18N
			if($ulElem.find('li').length == 0){
				var $selectedField = $ulElem.parent('.selectedFieldsBox') //No I18N
				$selectedField.addClass('no-data-available');
				var para = document.createElement('p');
				$(para).text(Ember.I18n.t('webclient.reports.view.nodata',this)); //No I18N
				$selectedField.append(para);
			}
		},
		searchFromSelectValues : function(search_elem){
			var search_val = $(search_elem).find('input').val();
			var $selectElem = $(search_elem).parent().siblings('.selectedFieldsBox');
			$selectElem.find('ul > li').each(function(){
				var list_value = $(this).text();
				if(list_value.toLowerCase().indexOf(search_val.toLowerCase()) >= 0) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		},
		searchFromExecutionValues : function(search_elem){
			var search_val = $(search_elem).find('input').val();
			var $selectElem = $(search_elem).siblings('select');
			$selectElem.find('option').each(function(){
				var list_value = $(this).text();
				if(list_value.toLowerCase().indexOf(search_val.toLowerCase()) >= 0) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		},
		addToAvailableList : function(param_name){
			if(!opm_validateFields({'empty':['addToAvail_'+param_name+'_name','addToAvail_'+param_name+'_value']})){
				return;
			}
			var name = $('#addToAvail_'+param_name+'_name').val();
			var value = $('#addToAvail_'+param_name+'_value').val();

			$avail_list = $('#available_list_'+param_name);

			var iserroralert = false;
			$avail_list.find('option').each(function(){
				if($(this).val() == value){
					opm_infoMsgs("errorMsg", Ember.I18n.t('ncm.proconfiglet.param.value.duplicate',this));//No I18N
					iserroralert = true;
					return;
				}
				if($(this).text() == name){
					opm_infoMsgs("errorMsg", Ember.I18n.t('ncm.proconfiglet.param.name.duplicate',this));//No I18N
					iserroralert = true;
					return;
				}
			});
			if(iserroralert){
				return;
			}

			var option = document.createElement('option');
			$(option).val(value);
			$(option).text(name);

			$avail_list.append(option);
			$('#addToAvail_'+param_name+'_name').val("");
			$('#addToAvail_'+param_name+'_value').val("");
			$('#addToAvail_'+param_name+'_name').parents('.addToAvailList').addClass('d-none');

		},
		changeBoolanValues : function(key,values){

			$param = $('#'+key+'_id input')

			$.each(values,function(index, value){
				if($param.is(":checked") && value.name=="Yes"){
					$param.val(value.value);
				}else if(!($param.is(":checked")) && value.name=="No"){
					$param.val(value.value);
				}
			});
		},
		changeOptionValues : function(key,values){

			$param = $('#'+key+'_id input')
			current_val = $param.val();

			$.each(values,function(index, value){
				if(current_val == "on" && index == 1){
					$param.val(value.value);
				}else if(current_val == "off" && index == 0){ // No I18N
					$param.val(value.value);
				}else if(value.value != current_val){
					$param.val(value.value);
				}
			});
		},
		moveToRight : function(dataname){
			var right_selected_list = $("#available_list_"+dataname+" :selected");
            $('#selected_list_'+dataname).append(right_selected_list);
            $("#available_list_"+dataname+" :selected").remove();
        },
        moveToLeft : function(dataname){
        	var left_selected_list = $("#selected_list_"+dataname+" :selected");
            $('#available_list_'+dataname).append(left_selected_list);
            $("#selected_list_"+dataname+" :selected").remove();
        },
		selectFromList : function(param){
			$(param).siblings().removeClass('active')
			$(param).addClass('active')
			var text = $(param).text();
			var value = $(param).val();
			var title = $(param).attr('title');

			$parent = $(param).closest('.singleListComponent');
			$input = $parent.siblings('input'); //No I18N

			$input.val(text);
			$input.attr('data-id',value); //No I18N
			$input.attr('title',title); //No I18N

			$parent.addClass('d-none');
		},
		toggleSelectComponentList : function(param){

			var paramId = $(param).parent().parent().attr('id'); //No I18N

			$(".inputComponent").parent(":not(#"+paramId+")").each( function () {
				$(this).find('.singleListComponent:not(.d-none) , .multisingleListComponent:not(.d-none)').addClass('d-none');
				$(this).find('.inputComponent.active').removeClass('active');
			});

			$(param).siblings('.singleListComponent , .multisingleListComponent').toggleClass('d-none');
			$(param).parent('.inputComponent').toggleClass('active');
		},
		focusoutComponents : function(param){
			$(param).find('.singleListComponent:not(.d-none) , .multisingleListComponent:not(.d-none)').addClass('d-none');
			$(param).find('.inputComponent.active').removeClass('active');
		},
		addValueToList:function($param){
			var _self = this;
			var regex_value = $param.find('.regex').val();
			if(regex_value == undefined || regex_value == ""){
				 validateFocus($param.find('.regex'), "empty", null, null, null);//No I18N
				 return;
			}else{
				try{
					new RegExp(regex_value);
				}catch(e){
					validateFocus($param.find('.regex'), "regexpattern", null, null, null);//No I18N
					 return;
				}
			}
			var regex_name = $param.find('.displayName').val();
			if(regex_name == undefined || regex_name == ""){
				 validateFocus($param.find('.displayName'), "empty", null, null, null);//No I18N
				 return;
			}
			var data = {};
			data.value = regex_value;
			data.displayname = regex_name;

			var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmconfiglets/addNCMRegex'; //No I18N

			var jsonData = opm_ajaxPostRequest(ajaxRequestUrl,data)
			var cls="errorMsg"; //No I18N
			var msg = "";
			if(jsonData.isSuccess) {
				cls="successMsg"; //No I18N
				msg = jsonData.statusMsg;

				$('.addValueBtn').each(function(){

					var li = document.createElement('li'); //No I18N

					$(li).attr("title",regex_value); //No I18N
					$(li).val(jsonData.regexid);
					$(li).text(regex_name);

					$(li).off("click").on("click", function() {
						_self.send("selectFromList",li); // No I18N
					});

					$(li).insertBefore($(this));
				});

			} else if(jsonData.error !== undefined) {
				msg = jsonData.error.message;
        	} else {
        		msg = jsonData.statusMsg;
        	}
			if(cls=="errorMsg"){
				opm_infoMsgs(cls, msg);
				return;
			}
			//Empty the value
			$param.find('.displayName').val("");
			$param.find('.regex').val("");

			$param.addClass('d-none');
		},
		addValuesToSelectList :function(param){
			var _self=this;
			$param = $(param).parent('.addSelectionField-box');
			var key = $param.find('.key').val();
			var value = $param.find('.value').val();
			var $selectionField = $param.siblings('.selectedFieldsBox'); //No I18N
			//var $newList = $param.siblings('.selectedFieldsBox').find("ul > li:last").clone();

			var isReturn = false;
			if(key == undefined || key == ''){
				validateFocus($param.find('.key'),"empty",null,null,null);//No I18N
				isReturn=true;
			}
			if(value == undefined || value == ''){
				validateFocus($param.find('.value'),"empty",null,null,null);//No I18N
				isReturn = true;
			}
            $selectionField.find("li .added_Fields").each(function(){
        		var addedVal=$(this).text().split(':');
            	if(addedVal.length==2){
                	if(addedVal[0].trim() == key.trim()){
                    	opm_infoMsgs("errorMsg", "Error while adding to the list.Same value is found already");//No I18N
                        isReturn = true;
                	}
                   if(addedVal[1].trim() == value.trim()){
                       opm_infoMsgs("errorMsg", "Error while adding to the list.Same name is found already");//No I18N
                       isReturn = true;
                   }
            	}
            });
			if(isReturn){
				return;
			}
			var li = document.createElement('li');

			var div = document.createElement('div');
			$(div).addClass('added_Fields');
			$(div).text(key+' : '+value);

			var i = document.createElement('i');
			$(i).addClass('close deleteSelected')
			$(i).html('&times;');// No I18N


			$(i).off("click").on("click", function() {
				_self.send("removeSelectElem",$(li)); //No I18N
			});

			$(li).append(div)
			$(li).append(i);

			if($selectionField.hasClass('no-data-available')){
				$selectionField.removeClass('no-data-available');
				$selectionField.find('p').remove();
			}
			$selectionField.find("ul").append(li);
			var liCount = $selectionField.find("ul > li").length;
			$(param).parents('.inputComponent').find('.selectInputComponent').val(liCount+' '+Ember.I18n.t('ncm.proconfiglet.param.selectvalue.added',this));//No I18N

			$param.find('.key').val("");
			$param.find('.value').val("");
		}
	},
	willDestroyElement: function(){
	}
});

OPMClient.NcmConfigletParamsComponent = Ember.Component.extend({
	templateName: "components/ncm-configlet-params", // No I18N
	refresh:false,
	variables : {},
	show : false,
	didInsertElement: function () {
		var _self = this;
		OPMClient.NCMComponentController.ncmConfigletParamComponent = _self;

		if(this.variables != undefined){
			$('#paramhelp').show();
			var count = Object.keys(this.variables).length;
			if(count > 0){
				if(this.variables.custom_variables == undefined || this.variables.custom_variables == '' || this.variables.custom_variables <= 0){
					$('#predefinedVariables').removeClass('mt-50');
				}
			}else{
				$('#paramhelp').hide();
			}
		}else{
			$('#paramhelp').hide();
		}
		$("#configletParams .select2").select2();
	},
	actions:{
		openHelpPage : function(){
			slideIn(11);
			$('#configletParamHelp').show();
		},
		closeHelpPage : function(){
			slideOut(11);
			$('#configletParamHelp').hide();
		},
		resetvalues : function(){
			var variables = OPMClient.NCMConfigAutomationModel.proConfigletVariableList(true);
			if(variables.isSuccess){
				OPMClient.NCMComponentController.ncmConfigletParamComponent.set("variables",variables); //No I18N
				OPMClient.NCMComponentController.ncmConfigletParamComponent.set("refresh",true); //No I18N
			}else{
				opm_infoMsgs(cls, Ember.I18n.t('ncm.proconfiglet.param.reset',this)); //No I18N
			}
		},
		changeParamType : function(param_name){
			var newType = $('#'+param_name+'_type').val();
			$('#'+param_name+'_hidden input[type="checkbox"]').prop('checked', false);
			var variablesJson = this.variables;
			var _self = this;
			$.each(this.variables.custom_variables, function(id, val){
				if(val.name == param_name){
					Ember.set(val,'default_values' , null); //No I18N
					Ember.set(val,'selection_values', null); //No I18N
					Ember.set(val,'type',newType); //No I18N
				}
			});
		}
	},
	rerenderComponent: function(){
	  	this.refresh=false;
	  	//this.show = true;
	  	this.rerender();
	}.observes('refresh'), //No I18N
	willDestroyElement: function(){

	}
});

OPMClient.NcmconfigletExecutionParamsComponent = Ember.Component.extend({
	templateName: "components/ncmconfiglet-execution-params", // No I18N
	refresh:false,
	variables : {},
	didInsertElement: function () {
		var _self = this;
		OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent = _self;
		$("#proconfiglet_execution_param .select2").select2();
	},
	rerenderComponent: function(){
		this.refresh=false;
		this.rerender();
	}.observes('refresh'), //No I18N
	willDestroyElement: function(){

	}
});

OPMClient.NcmTestcredResponseComponent = Ember.Component.extend({
    templateName: "components/ncm-testcred-response", // No I18N
    credResponse : [],
    rerenderflag : false,
    didInsertElement: function(){
        OPMClient.NCMComponentController.ncmTestCredResponseComponent = this;
    },
    responseObserver : Ember.observer('rerenderflag',function(){//NO I18N
        var credResponse = this.credResponse;
         if(Array.isArray(credResponse) && credResponse.length > 0){
                var commandResponseArray = [];
                for(var i = 0; i<credResponse.length; i++){
                    var commRespObj = {};
                    var response = credResponse[i];
                    if(response != undefined && response != null && response.length > 0){
                        response = response.split("\n");
                    }
                    commRespObj.response = response
                    var command = "";
                    if(++i < credResponse.length){
                        command = credResponse[i];
                        if(command != undefined && command.indexOf("LOGGED_INTO_ENABLE_MODE") >= 0) // No I18N
                        {
                            command = Ember.I18n.t("jsp.credential.TestCredentialView.EnteredIntoThe", this); // No I18N
                        }
                    }
                    commRespObj.command = command
                    commandResponseArray.push(commRespObj);
                }
                this.set('credResponse',commandResponseArray);//NO I18N
                this.rerenderflag = false;
         }
    })
});

OPMClient.NcmFirmVulnPatchTreeComponent = Ember.Component.extend({
    templateName: "components/ncm-firm-vuln-patch-tree", //No I18N
    columns: {},
    selectedPatches: [],
    processedColumns: [],
    scrollPositions: {},
    vendor: '',//No I18N
    product: '',//No I18N
    currVersion: '',
    latestPatch: '',//No I18N
    hostName: '',
    cveId: '',
    isFirstPatchIdRender: true,
    isValidPatchRender: false,
    hasColumns: true,

    didInsertElement: function() {
        this.preRender();
        this.processColumnsContent();
    },

    preRender: function() {
        var columns = {};
        if(this.idType === 'patchId') { //No I18N
            var patchIdDetails = OPMClient.NCMFirmwareVulnerabilityPatchDetailsController.patchDetails[this.idValue];
            columns = this.loadPatchData(this.idType, this.idValue, 0, patchIdDetails.vendor, patchIdDetails.osType, patchIdDetails.version);
            this.set('cveId', patchIdDetails.cveId); //No I18N
        }
        else{
            columns = this.loadPatchData(this.idType, this.idValue, 0);
        }
        this.set('columns', columns);//No I18N
        this.set('isFirstPatchIdRender', false); //No I18N
    },

    loadPatchData: function(idType, id, columnIndex, vendor, osType, patchVersion) {
        try{
            this.toggleLoader(true);
            var columns = this.get('columns');//No I18N
            if (Object.keys(columns).length === 0) {
                var initialColumnIndex = 1;
                var data = this.fetchPatchData(idType, id, initialColumnIndex, vendor, osType, patchVersion);
                this.processSeverityForPatches(data.patches, 'column' + initialColumnIndex); //No I18N
                var newColumns = {};
                newColumns['column' + initialColumnIndex] = data.patches;  //No I18N
                this.set('hasColumns', Object.keys(data.patches).length !== 0);//No I18N
                if(this.get('isFirstPatchIdRender')) {//No I18N
                    this.set('hostName', data.HOSTNAME);//No I18N
                    this.set('currVersion', data.osversion);//No I18N
                    if(idType === 'resourceId') { //No I18N
                        this.set('latestPatch', data.LATEST_PATCH);//No I18N
                        this.set('vendor', data.vendor); //No I18N
                        this.set('product', data.product); //No I18N
                    }
                }
                this.toggleLoader(false);
                return newColumns;
            }
            else if(!patchVersion){
                this.toggleLoader(false);
                return columns;
            }
            else {
                var nextColumnName = 'column' + (columnIndex + 1);  //No I18N
                var updatedColumns = jQuery.extend(true, {},this.get('columns')); //No I18N
                if (updatedColumns[nextColumnName]) {
                    if (updatedColumns[nextColumnName][id]) {
                        this.toggleLoader(false);
                        return columns;
                    } else {
                        var data = this.fetchPatchData(idType, id, columnIndex + 1, vendor, osType, patchVersion);
                        if (Object.keys(data.patches).length > 0) {
                            this.processSeverityForPatches(data.patches, nextColumnName);
                            updatedColumns[nextColumnName][id] = data.patches[id];
                            this.toggleLoader(false);
                            return updatedColumns;
                        }
                    }
                }
                else {
                    var data = this.fetchPatchData(idType, id, columnIndex + 1, vendor, osType, patchVersion);
                    if (Object.keys(data.patches).length > 0) {
                        this.processSeverityForPatches(data.patches, nextColumnName);
                        updatedColumns[nextColumnName] = {};
                        updatedColumns[nextColumnName][id] = data.patches[id];
                        this.toggleLoader(false);
                        return updatedColumns;
                    }
                }
            }
        }
        catch(e){
            this.toggleLoader(false);
        }
    },

    toggleLoader: function(show) {
        if (show) {
            $('.tree-view__patch-loading').css('display', 'flex'); //No I18N
        } else {
            $('.tree-view__patch-loading').css('display', 'none'); //No I18N
        }
    },

    processSeverityForPatches: function(currPatches, columnName) {
        var _self = this;
        var idCounter = 0;
        Object.keys(currPatches).forEach(function(key){
            var patches = currPatches[key];
            if(Array.isArray(patches)){
                patches.forEach(function(patch){
                    patch.severityClass = _self.getSeverityClass(patch.SEVERITY);
                    idCounter++;
                    patch.uniqueId = 'uid_' + columnName +  '_' + idCounter; //No I18N
                });
            }
        });
    },

    getSeverityClass: function(severity){
        if(severity === 4){
            return "status-1";//No I18N
        }
        else if(severity === 3){
            return "status-2"; //No I18N
        }
        else if(severity === 2){
            return "status-3"; //No I18N
        }
        else if(severity === 1){
        return "status-4"; //No I18N
        }
        return "";//No I18N
    },

    fetchPatchData: function(idType, id, colIndex, vendor, osType, patchVersion) {
        var apiUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getPatchTreeDetails'; //No I18N
        var params = [];
        if (id){
            params.push('id=' + encodeURIComponent(id));//No I18N
        }
        if (idType) {
            params.push('idType=' + encodeURIComponent(idType));//No I18N
            if (idType === 'patchId') {//No I18N
                params.push('vendor=' + encodeURIComponent(vendor));//No I18N
                params.push('osType=' + encodeURIComponent(osType));//No I18N
                params.push('patchVersion=' + encodeURIComponent(patchVersion));//No I18N
                if(this.get('isFirstPatchIdRender')){
                    params.push('rsId='+ encodeURIComponent(this.rsId));//No I18N
                }
            }
        }
        if (params.length) {
            apiUrl += '?' + params.join('&');//No I18N
        }
        return opm_ajaxGetResponse(apiUrl);
    },

    isShowPatch: function() {
        return this.get('idType') === 'resourceId' && this.get('latestPatch') !== 'NA'; //No I18N
    }.property('idType', 'latestPatch'), //No I18N

    rsIdHeader: function() {
      return Ember.I18n.t('webclient.ncm.firmvuln.patchTree.rsIdHeader', { param0: this.get('currVersion') }); //No I18N
    }.property('currVersion'), //No I18N

    patchHeader: function() {
      return Ember.I18n.t('webclient.ncm.firmvuln.patchTree.patchHeader', { param0: this.get('currVersion') }); //No I18N
    }.property('currVersion'), //No I18N

    willDestroyElement: function() {
        this._super();
        $('.tree-view__column ul li .tree-view-patch-cont').off('click.patchTree');  //No I18N
        $('.tree-view__column ul').off('scroll.patchTree');  //No I18N
        $('.scrollUp, .scrollDown').off('click.scrollHandler'); //No I18N
    },

    visibleColumns: ['column1'],  //No I18N

    updatePatchSelection: function(patch, selectedUniqueIdMap) {
      patch.isSelected = selectedUniqueIdMap[patch.uniqueId] ? true : false;
      return patch;
    },

    getColumnsContent: function() {
        var _self = this;
        var result = {};
        var columns = this.get('columns');  //No I18N
        var selectedPatches = this.get('selectedPatches');  //No I18N
        var selectedUniqueIdMap = {};
        if (selectedPatches && selectedPatches.length > 0) {
            selectedPatches.forEach(function(patch) {
                if (patch && patch.uniqueId) {
                    selectedUniqueIdMap[patch.uniqueId] = true;
                }
            });
        }

        if (!columns || !Object.keys(columns).length) {
            return result;
        }

        if (columns.column1) {
            result.column1 = [];
            Object.keys(columns.column1).forEach(function(patchId) {
                var patchArray = columns.column1[patchId];
                if (Array.isArray(patchArray)) {
                    patchArray.forEach(function(patch) {
                        patch.isSelected = selectedUniqueIdMap[patch.uniqueId] ? true : false;
                    });
                    result.column1 = result.column1.concat(patchArray);
                }
            });
        } else {
            result.column1 = [];
        }

        var patchMapFunction = function(patch) {
            return _self.updatePatchSelection(patch, selectedUniqueIdMap);
        }

        for (var i = 0; i < selectedPatches.length; i++) {
            var columnName = "column" + (i + 2);  //No I18N
            var patchId = selectedPatches[i].PATCH_ID;
            if (columns[columnName]) {
                result[columnName] = [];
                if (patchId && columns[columnName][patchId]) {
                    var patchData = columns[columnName][patchId];
                    if (Array.isArray(patchData)) {
                        result[columnName] = patchData.map(patchMapFunction);
                    }
                }
            }
        }
        return result;
    },

    saveScrollPositions: function() {
        var scrollPositions = {};
        $('.tree-view__column ul').each(function(index) {  //No I18N
            var columnIndex = index + 1;
            var columnName = 'column' + columnIndex;  //No I18N
            scrollPositions[columnName] = $(this).scrollTop();
        });
        this.set('scrollPositions', scrollPositions);//No I18N
    },

    restoreScrollPositions: function() {
        var scrollPositions = this.get('scrollPositions');  //No I18N
        var visibleColumns = this.get('visibleColumns');    //No I18N
        var selectedPatches = this.get('selectedPatches');  //No I18N
        var columnsContent = this.getColumnsContent();

        $('.tree-view__column ul').each(function(index) {   //No I18N
            var columnIndex = index + 1;
            var columnName = 'column' + columnIndex;    //No I18N
            if (columnName === 'column1' && columnsContent.column1 && columnsContent.column1.length > 0) {
                if (scrollPositions[columnName]) {
                    $(this).scrollTop(scrollPositions[columnName]);
                }
            }
            else if (columnIndex <= selectedPatches.length + 1) {
                var patchIndex = columnIndex - 1;
                if (patchIndex >= 0 && selectedPatches[patchIndex] &&
                    columnsContent[columnName] && columnsContent[columnName].length > 0) {
                    if (scrollPositions[columnName]) {
                        $(this).scrollTop(scrollPositions[columnName]);
                    }
                }
            }
        });
        if (selectedPatches.length > 0) {
            this.updateConnectionLines();
        }
    },

    processColumnsContent:  function() {
        this.saveScrollPositions();
        var processed = [];
        var columnsContent = this.getColumnsContent();
        var visibleColumns = this.get('visibleColumns');  //No I18N
        visibleColumns.forEach(function(columnName) {
            processed.push({
                name: columnName,
                patches: columnsContent[columnName] || []
            });
        });
        this.set('processedColumns', processed);  //No I18N
        var _self = this;
        setTimeout(function() {
            _self.setupUI();
        }, 1);
    },

    setupUI: function() {
        this.reattachEventHandlers();
        this.restoreScrollPositions();
        this.setupScrollHandlers();
    },

    clearSelectionsAfterColumn: function(columnNum) {
        var columnsContent = this.getColumnsContent();
        Object.keys(columnsContent).forEach(function(columnName) {
            var colNum = parseInt(columnName.replace(/\D/g, ''), 10);  //No I18N

            if (colNum > columnNum) {
                var columnContent = columnsContent[columnName];
                if (columnContent) {
                    columnContent.forEach(function(patch) {
                        patch.isSelected = false;
                    });
                }
            }
        });
    },

    updateConnectionLines: function() {
        $('.tree-view__column').each(function(index, column) {  //No I18N
            if ($(column).find('.active').length && $(column).next('.tree-view__column').length) {  //No I18N
                var activeElement = $(column).find('.active');  //No I18N
                var activeOffsetTop = activeElement.find('.tree-view__patch-h-line').offset().top;  //No I18N

                $(column).next('.tree-view__column').find('li').each(function(i, element) {  //No I18N
                    var nextOffsetTop = $(element).find('.tree-view__patch-h-line').offset().top;  //No I18N
                    var heightLine;
                    var cssProps = {};

                    if (activeOffsetTop > nextOffsetTop) {
                        heightLine = activeOffsetTop - nextOffsetTop + 2;
                        cssProps = { 'top': '50%', 'height': heightLine + 'px', 'bottom': 'auto' };  //No I18N
                    } else {
                        heightLine = nextOffsetTop - activeOffsetTop + 2;
                        cssProps = { 'bottom': 'calc(50% - 2px)', 'height': heightLine + 'px', 'top': 'auto' };  //No I18N
                    }
                    var heilightLine = $(element).find('.tree-view__heilight-line');  //No I18N
                    heilightLine.css(cssProps);
                });
            }
        });
    },

    setupScrollHandlers: function() {
        var _self = this;
        $('.scrollUp, .scrollDown').off('click.scrollHandler'); //No I18N

        $('.scrollUp').on('click.scrollHandler', function () { //No I18N
            var $list = $(this).next('ul'); //No I18N
            var $items = $list.find('li'); //No I18N
            var scrollTop = $list.scrollTop();

            var targetItem = null;
            $items.each(function (index) {
                var $item = $(this);
                var itemTop = $item.position().top;
                var itemHeight = $item.outerHeight();

                if (itemTop >= -itemHeight / 2) {
                    if (index > 0) {
                        targetItem = $items.eq(index - 1);
                    }
                    return false;
                }
            });

            if (targetItem && targetItem.length) {
                var scrollTo = targetItem.position().top + scrollTop;
                $list.animate({ scrollTop: scrollTo }, 300);
            }
        });

        $('.scrollDown').on('click.scrollHandler', function () { //No I18N
            var $list = $(this).prev('ul'); //No I18N
            var $items = $list.find('li'); //No I18N
            var scrollTop = $list.scrollTop();

            var targetItem = null;
            $items.each(function (index) {
                var $item = $(this);
                var itemTop = $item.position().top;
                var itemHeight = $item.outerHeight();

                if (itemTop >= 0) {
                    if (index < $items.length - 1) {
                        targetItem = $items.eq(index + 1);
                    }
                    return false;
                }
            });

            if (targetItem && targetItem.length) {
                var scrollTo = targetItem.position().top + scrollTop;
                $list.animate({ scrollTop: scrollTo }, 300);
            }
        });
    },



    actions: {
        selectPatch: function(patch, columnIndex) {
            var _self = this;
            this.toggleLoader(true);
            setTimeout(function() {
                var columnIndexNumber = parseInt(columnIndex.replace(/\D/g, ''), 10);  //No I18N
                var currentColumnContent = _self.getColumnsContent()['column' + columnIndexNumber];  //No I18N

                _self.clearSelectionsAfterColumn(columnIndexNumber);
                if (currentColumnContent) {
                    currentColumnContent.forEach(function(item) {
                        item.isSelected = false;
                    });
                }
                patch.isSelected = true;

                var selectedPatches = _self.get('selectedPatches').slice(0, columnIndexNumber - 1);  //No I18N
                selectedPatches.push(patch);
                var updatedColumnsData = _self.loadPatchData("patchId", patch.PATCH_ID || "", columnIndexNumber, patch.vendor, patch.osType, patch.patchVersion);  //No I18N
                _self.set('columns', updatedColumnsData);  //No I18N
                _self.set('selectedPatches', selectedPatches);  //No I18N
                var visibleColumns = ['column1'];  //No I18N
                for (var i = 2; i <= columnIndexNumber + 1; i++) {
                    var columnName = 'column' + i;  //No I18N
                    var columns = _self.get('columns');  //No I18N
                    if (columns && columns[columnName]) {
                        if(i == columnIndexNumber+1){
                            if(patch.PATCH_ID && columns[columnName][patch.PATCH_ID]){
                                visibleColumns.push(columnName);
                            }
                        }
                        else{
                            visibleColumns.push(columnName);
                        }
                    }
                }
                _self.set('visibleColumns', visibleColumns);  //No I18N
                _self.processColumnsContent();

                setTimeout(function() {
                    _self.updateConnectionLines();
                    setTimeout(function() {
                        _self.toggleLoader(false);
                    },400);
                }, 100);
            }, 50);
        },
        showLatestPatchVuln: function() {
            this.set('columns', {}); //No I18N
            this.set('selectedPatches', []); //No I18N
            this.set('processedColumns', []); //No I18N
            this.set('scrollPositions', {}); //No I18N
            this.set('visibleColumns', ['column1']); //No I18N
            var latestPatch = this.get('latestPatch'); //No I18N
            if (latestPatch) {
                var columns = this.loadPatchData('patchId', 1, 0,this.vendor, this.product, latestPatch); //No I18N
                this.set('columns', columns); //No I18N
                this.processColumnsContent();
            }
        },
        showDeviceVuln: function() {
            this.set('columns', {}); //No I18N
            this.set('selectedPatches', []); //No I18N
            this.set('processedColumns', []); //No I18N
            this.set('scrollPositions', {}); //No I18N
            this.set('visibleColumns', ['column1']); //No I18N
            var columns = this.loadPatchData('resourceId', this.idValue, 0); //No I18N
            this.set('columns', columns); //No I18N
            this.processColumnsContent();

        },
        showLatestPatch: function() {
            location.href=location.href + "/LatestPatch";//No I18N
        }
    },


    reattachEventHandlers: function() {
        var _self = this;
        $('.tree-view__column ul').off('scroll.patchTree');  //No I18N
        $('.tree-view__column ul').on('scroll.patchTree', function() {  //No I18N
            _self.updateConnectionLines();
        });
    }
});

OPMClient.NcmRuleItemsComponent = Ember.Component.extend({
    data:false,
    title:Ember.I18n.t('ncm.complianceiq.rules.create.title'), // NO I18N
    groups: null,
    toShiftCells : 2,
    uniqueIds : [],
    showDetails : false,
    flowDetails : {},
    ruleDetails : {},
    variables : [],
    initialVariableValues : [],
    scrollPosition : {
        x : 0,
        y : 0
    },
    firstReload : true,
    rerendering : false,
    isWorkflowDraw : false,
    ruleItemSelectionList : [],
    newlyAddedGroup : false,
    staticData : {}, // to store all the static api response and to avoid making api call each time
    popupInfo : false,
    linkedNodeDataCache : {}, // to store the linked node data
    groupInfoCache : {}, // to store the group info data
    completeDepthCache : {}, // to store the depth of loop cache
    init : function() {
		this._super();
		this.set('staticData', {}); // NO I18N
        if(!this.variables){
           this.variables = [];
        }
        else{
            this.initialVariableValues = jQuery.extend(true, [],this.variables);
        }
        this.flowDetails = {};
        if(!this.groups || this.groups.length == 0){
            var startItem = this.createWorkflowStartGroup(false, 0, 0);
            this.set('groups', [startItem]);
        }
        else {
            if(this.flowName){
                this.set('title', this.flowName); // NO I18N
            }
            this.flowDetails.name = this.flowName;
            this.flowDetails.description = this.flowDescription;
            this.flowDetails.filterId = this.filterId;
            this.flowDetails.isManualReviewRequired = this.isManualReviewRequired;
            this.drawWorkflow(this.groups);
        }
    },
    didInsertElement : function() {
        this._super();
        ncmMaxScreen(true);
        this.setLoopPosition();
        if(this.firstReload){ // this is to align the lines properly on hard refresh of the page
            var __self = this;
            this.firstReload = false;
            setTimeout(function(){
                __self.reload();
            },100);
        }
        else{
            this.scrollScreen();
            document.addEventListener('click', this.ruleItemListClose);
        }
		this.iterateEachItemAndUpdateVariableUsage();

    },
    ruleItemListClose : function(event){
        $('.complaince-flow-error').hide();
        var ruleItemList = document.getElementById('ruleItemList');
        if (ruleItemList && !ruleItemList.contains(event.target)) {
            ruleItemList.style.visibility = '';
            ruleItemList.style.transition = '';
            ruleItemList.style.display = 'none';
        }
    },
    scrollScreen : function(){
        var scrollContainer = document.querySelector('.complaince-container'); //NO I18N
        if(scrollContainer){
            scrollContainer.scrollLeft = this.scrollPosition.x;
            scrollContainer.scrollTop = this.scrollPosition.y;
        }
        this.loadZoomScale();
    },
    captureScrollPos : function(direction){
        var scrollContainer = document.querySelector('.complaince-container'); //NO I18N
        if(scrollContainer){
            this.scrollPosition.x = scrollContainer.scrollLeft;
            this.scrollPosition.y = scrollContainer.scrollTop;
        }
    },
    loadZoomScale : function(){
        var flowEle = $('.settingsContent').find('.complaince-flow-element-group');
        if(flowEle && flowEle.get(0)){
            flowEle.get(0).style.transform = 'scale('+this.zoomScale+')'; // NO I18N
        }
        var __self = this;
        setTimeout(function(){
            var scrollDiv = document.querySelector(".scrollDiv"); // NO I18N
            if(scrollDiv){
                scrollDiv.style.width = 0 + 'px';
                var toUpdateWid = document.querySelector(".complaince-container").scrollWidth; // NO I18N
                if(window.screen.width < (toUpdateWid)){
                    scrollDiv.style.width = toUpdateWid + 40 + 'px';
                }
                scrollDiv.style.height = 0 + 'px';
                var toUpdateHeight = document.querySelector(".complaince-flow-element-group").scrollHeight * __self.zoomScale; // NO I18N
                if((window.screen.height / 2) < (toUpdateHeight)){
                    scrollDiv.style.height = toUpdateHeight + 145 + 'px'; // 145 represents the height of the btn group and to have the bottom gap
                }
            }
        },10);
    },
	getAllVariablesUsed: function(){
        return OPMClient.NCMComplianceUtilController.getAllVariablesUsed(this);
    },
	iterateEachItemAndUpdateVariableUsage : function(isValidate){
		OPMClient.NCMComplianceUtilController.iterateEachItemAndUpdateVariableUsage(this, isValidate, true);
	},
    validateFlow : function(){
		var errorMsg = Ember.I18n.t('ncm.complianceiq.errormsg1'); // NO I18N
        var findNodeId = function(groupInfo, findStr){
            for(var j = 0; j < groupInfo.nodes.length; j++){
                if(groupInfo.nodes[j].nodeType.indexOf(findStr) > -1){
                    return groupInfo.nodes[j].id;
                }
            }
            return false;
        };
        var isValidateSuccess = true;
        var loadError = function(nodeId){
            if(nodeId){
				OPMClient.NCMComplianceRulesController.set('flowNodeError', errorMsg); // NO I18N
                // $('#'+nodeId+' .complaince-flow-error').css('display','block');
				OPMClient.NCMComplianceRulesController.set('errorNodeId', false); // NO I18N
				OPMClient.NCMComplianceRulesController.set('errorNodeId', nodeId); // NO I18N
                isValidateSuccess = false;
				setTimeout(function(){
				    if($('#'+ nodeId+' #floatingPopupEle') && $('#'+ nodeId+' #floatingPopupEle')[0]){
				        $('#'+ nodeId+' #floatingPopupEle')[0].classList.remove('hide'); // NO I18N
				    }
				    else{
				        OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg', Ember.I18n.t('ncm.complianceiq.rule.flow.error.incomplete_item')); // NO I18N
				        $('#'+nodeId+' .complaince-flow-error').css('display','block');
				    }
				}, 100);
            }
        }.bind(this);

		try{
			this.iterateEachItemAndUpdateVariableUsage(true);
		}
		catch(error){
			if(error.code == 'variable_not_enclosed' || error.code == 'variable_condition_error'){
				OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg', error.message); // NO I18N
				errorMsg = error.message;
				loadError(error.groupId);
				return false;
			}
		}
        for(var i = 0; i < this.groups.length; i++){
			errorMsg = Ember.I18n.t('ncm.complianceiq.errormsg1'); // NO I18N
            var group = JSON.parse(JSON.stringify(this.groups[i]));
            if(group.operation.type == 'START'){
                if(!group.trueLink){
                    nodeId = findNodeId(group, 'plus'); // NO I18N
                    loadError(nodeId);
					return false;
                }
            }
            else if(group.operation.type == 'CONDITION' || group.operation.type == 'BLOCK' || isNCMFlowLoop(group.operation.type)){
                var nodeId = false;
                if(!group.trueLink){
                    nodeId = findNodeId(group, isNCMFlowLoop(group.operation.type) ? 'mid-plus' : 'true'); // NO I18N
                    loadError(nodeId);
					return false;
                }
                if(!group.falseLink){
                    nodeId = findNodeId(group, isNCMFlowLoop(group.operation.type) ? 'bottom-plus' : 'false'); // NO I18N
                    loadError(nodeId);
					return false;
                }
                try{
                    if(!isNCMFlowLoop(group.operation.type)){
                         ncmValidateInputField(group.operation.details.name);
                    }
                    this.validateCriteria(group.operation.details.criteria);
                    if(group.operation.type == 'BLOCK'){
                        if(group.operation.details.contentType == 'TEXT'){
                            ncmValidateInputField(group.operation.details.startBlock);
                        }
                        else if(group.operation.details.contentType == 'XML'){
                            ncmValidateInputField(group.operation.details.xPath);
                        }
                    }
                }
                catch(error){
                    loadError(group.id);
					return false;
                }
            }
			else if(group.operation.type == 'VIOLATION'){
				// Validate that all variables used in violation message/remediation are defined
				var allUsedVariables = [];
				errorMsg = Ember.I18n.t('ncm.complianceiq.errormsg1'); // NO I18N
				OPMClient.NCMComplianceRulesController.set('flowNodeError', Ember.I18n.t('ncm.complianceiq.errormsg1')); // NO I18N
				try {
					allUsedVariables.push(getVariablesFromContent(group.operation.details.violationMessage));
					allUsedVariables.push(getVariablesFromContent(group.operation.details.remediationProcedure));
					var remediationConfigletVariablesMap = group.operation.details.remediationConfigletVariablesMap;
					if(remediationConfigletVariablesMap){
						for (var key in remediationConfigletVariablesMap) {
							allUsedVariables.push(getVariablesFromContent(remediationConfigletVariablesMap[key]));
						}
					}
					allUsedVariables = allUsedVariables.flat();
					for (var k = 0; k < allUsedVariables.length; k++) {
						var isDeclared = false;
						for (var j = 0; j < this.variables.length; j++) {
							if(this.variables[j].name == allUsedVariables[k]) {
								isDeclared = true;
								break;
							}
						}
						if(!isDeclared) {
							errorMsg = Ember.I18n.t('ncm.complianceiq.rule.flow.variable.usage.alert.not_defined', {param0: allUsedVariables[k]}); // NO I18N
							OPMClient.NCMComplianceRulesController.set('flowNodeError', errorMsg); // NO I18N
							loadError(group.id);
							return false;
						}
					}
				} catch (error) {
					loadError(group.id);
					return false;
				}
			}
        }
		if(isValidateSuccess){
			OPMClient.NCMComplianceRulesController.set('flowNodeError', false); // NO I18N
		}
        return isValidateSuccess;
    },
    validateCriteria : function(criteria){
        if(!criteria || !criteria.criteriaList){
            return;
        }
        var criteriaList = criteria.criteriaList;
        for(var index = 0; index < criteriaList.length; index++){
            ncmValidateInputField(criteriaList[index].pattern);
        }
        if(criteriaList.length > 1){
            ncmValidateInputField(criteria.criteriaExpression);
        }
    },
    actions: {
        addNewNode : function(nodeType){
            var element = document.getElementById('ruleItemList'); // NO I18N
            var info = JSON.parse(element.dataset.info);
            this.send('addNode', info.cellId, nodeType, info.loopItemId) //NO I18N
        },
        addNode : function(cellId, selectedNodeType, loopItemId) {
            var cellProps = this.findCellPropsById(cellId);
            var direction = this.getDirection(cellProps);
			this.groupListSnap = jQuery.extend(true, [], this.get('groups'));
			var connectMiddleItemToTrue = true;
			if(this.isMiddlePlus){
				var __self = this;
				var proceed = function (){
					__self.addNewGroup(false, cellProps, direction, selectedNodeType, loopItemId, connectMiddleItemToTrue);
				}
				var setFalse = function (){
					connectMiddleItemToTrue = false;
					proceed();
				}
				var confirmText = Ember.I18n.t('ncm.complianceiq.confirm.mid_node.link', this); // NO I18N
				var trueText = Ember.I18n.t('ncm.complianceiq.confirm.mid_node.true.link', this); // NO I18N
				var falseText = Ember.I18n.t('ncm.complianceiq.confirm.mid_node.false.link', this); // NO I18N
				if(selectedNodeType === 'LOOP' || selectedNodeType === 'PROCESS'){ // NO I18N
					// confirmText = 'Please confirm the linked items should be wrapped inside a ' + selectedNodeType.toLowerCase(); // NO I18N
					confirmText = Ember.I18n.t('ncm.complianceiq.confirm.mid_node.wrap.link', {param0 : selectedNodeType.toLowerCase()}); // NO I18N
					trueText = 'YES'; // NO I18N
					falseText = 'NO'; // NO I18N
				}
				ncmConfirmDialog(confirmText, proceed, setFalse, trueText, falseText);
			}
			else{
				this.addNewGroup(false, cellProps, direction, selectedNodeType, loopItemId);
			}
        },
        saveFlow : function(){
            var isValidateSuccess = this.validateFlow();
            if(isValidateSuccess){
                this.flowDetails.isRule = true;
                this.set('showDetails',this.flowDetails); // NO I18N
            }
			this.disableMarkAsPublicMsg();
        },
		workFlowDetailsCompInstance: function(workFlowDetailsCompInstance) {
			this.set('workFlowDetailsCompInstance', workFlowDetailsCompInstance); // NO I18N
		},
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        closeDetails:function(param){
            this.closeDetailsPage();
        },
        saveRule:function(ruleInfo){
            this.closeDetailsPage();
            this.removeStylesAndPositions(this.groups);
            ruleInfo.criteriaType = 'FLOW'; // NO I18N
            ruleInfo.items = JSON.stringify(this.groups);

            if(!ruleInfo.remediationProcedure || ruleInfo.remediationProcedure == '[NA]'){
                delete ruleInfo.remediationProcedure;
            }
			var allUsedVariables = this.getAllVariablesUsed();
            if(this.variables && this.variables.length > 0){
                var copyVariables = [];
                var showVariableDeleteMsg = false;
                for(var i = 0; i < this.variables.length; i++){
                    var copyVariableObj = jQuery.extend(true, {}, this.variables[i]);
//					if(copyVariableObj.hasOwnProperty('createdBy')){
//						delete copyVariableObj.createdBy;
//					}
//					if(copyVariableObj.hasOwnProperty('userAdded')){
//						delete copyVariableObj.userAdded;
//					}
//					if(copyVariableObj.hasOwnProperty('isUsed')){
//						delete copyVariableObj.isUsed;
//					}
                    if(!copyVariableObj.isGlobal && !allUsedVariables.includes(copyVariableObj.name)){
                        showVariableDeleteMsg = true;
                        continue;
                    }
                    else{
                        var tVarObj = {
                            id : copyVariableObj.id,
                            variableType : copyVariableObj.variableType,
                            name : copyVariableObj.name,
                            displayName : copyVariableObj.displayName,
                            description : copyVariableObj.description,
                            isGlobal : copyVariableObj.isGlobal,
                            isUsed : copyVariableObj.isUsed,
                            value : copyVariableObj.value
                        }
                        copyVariables.push(tVarObj);
                    }
                }
                var __self = this;
                var loadSaveDataApi = function() {
                    ruleInfo.variables = JSON.stringify(copyVariables);
                    __self.sendAction('action', ruleInfo); // Sending data to route declared action
                }
                if(showVariableDeleteMsg){
					ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.delete.confirm', this), loadSaveDataApi, false, Ember.I18n.t('webclient.opm.confirm.ok',this), false); // NO I18N
                }
                else{
                    loadSaveDataApi();
                }
            }
            else{
                delete ruleInfo.variables;
                this.sendAction('action', ruleInfo); // Sending data to route declared action
            }
        },
        closeRule:function(param){
            this.closeDetailsPage();
        },
        cancelDetails:function(groupId){
			if(this.isMiddlePlus){
				this.groups = jQuery.extend(true, [], this.groupListSnap);
			}
            else if(this.newlyAddedGroup && this.newlyAddedGroup == groupId){
                this.send('deleteGroup',groupId); // NO I18N
            }
            this.closeDetailsPage();
        },
        saveGroupInfo: function(groupId, updatedResult){
            this.newlyAddedGroup = false;
            for(var i=0; i < this.groups.length; i++){
                if(this.groups[i].id == groupId){
                    if(updatedResult.scope){
                        this.groups[i].scope.type = updatedResult.scope.type;
                        this.groups[i].scope.details = updatedResult.scope.details;
                    }
                    if(updatedResult.operation){
                        this.groups[i].operation.type = updatedResult.operation.type;
                        this.groups[i].operation.details = updatedResult.operation.details;
                    }
                    break;
                }
            }
            this.closeDetailsPage();
        },
        back : function(){
            if(this.templates){
                this.set('templates', false); // NO I18N
            }
            else{
                window.history.back();
            }
        },
        deleteGroup : function(groupId){
            this.set('popupInfo', false); // NO I18N
            var linkedGroups = this.findAllLinkedNodesByGrpId(groupId);
            var copyGroups = [];
            for(var i = 0; i < this.groups.length; i++){
                if(!linkedGroups.includes(this.groups[i].id)){
                    copyGroups.push(this.groups[i]);
                }
            }

            for(var i = 0; i < this.groups.length; i++){
                if(this.groups[i].trueLink == groupId){
                    this.groups[i].trueLink = false;
                    break;
                }
                else if(this.groups[i].falseLink == groupId){
                    this.groups[i].falseLink = false;
                    break;
                }
            }
            this.drawWorkflow(copyGroups);
            try{
                var removeUnused = function(allVariablesInRule, list){
                    var copy = [];
                    for(var j = 0; j < list.length; j++){
                        var eachVariable = list[j];
                        if(allVariablesInRule.includes(eachVariable.name) || eachVariable.isGlobal){
                            copy.push(eachVariable);
                        }
                        else if(!eachVariable.isGlobal){
                            continue;
                        }
                    }
                    return copy;
                }.bind(this);
                copyVariables = removeUnused(this.getAllVariablesUsed(), jQuery.extend(true, [], this.variables));
                if(copyVariables){
                    copyVariables.sort(function(a,b){return (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0);});
                    this.set('variables', copyVariables); // NO I18N
                }
            }
            catch(error){}
        },
        editGroup : function(groupId){
            this.set('popupInfo', false); // NO I18N
            this.collectDetails(groupId);
        },
        zoomIn : function(){
            if(this.zoomScale < 2.0){
                this.zoomScale += 0.1;
                this.loadZoomScale();
            }
        },
        zoomOut : function(){
            if(this.zoomScale > 0.11){
                this.zoomScale -= 0.1;
                this.loadZoomScale();
            }
        },
        refreshPage : function(){
            this.scrollPosition.x = 0;
            this.scrollPosition.y = 0;
            this.zoomScale = 1;
            this.scrollScreen();
            this.drawWorkflow(this.groups);
        },
        updateRuleItemList : function(cellId, position){
            var list = [];
            var cellProps = this.findCellPropsById(cellId);
            var groupInfo = this.findGrpInfoByGrpIdInCache(cellProps.groupId);
            var defaultCss = 'flex flex-middle-align gap-xs'; // NO I18N
            var disableCss = ' btn-disabled noPointerEvents'; // NO I18N
            var conditionObj = {type : 'CONDITION', css : defaultCss}; // NO I18N
            var blockObj = {type : 'BLOCK', css : defaultCss}; // NO I18N
            var loopObj = {type : 'LOOP', css : defaultCss}; // NO I18N
            var complianceObj = {type : 'COMPLIANT', css : defaultCss}; // NO I18N
            var violationObj = {type : 'VIOLATION', css : defaultCss}; // NO I18N
            var notRequiredObj = {type : 'NOT_REQUIRED', css : defaultCss}; // NO I18N
            var endObj = {type : 'END', css : defaultCss}; // NO I18N
            var processObj = {type : 'PROCESS', css : defaultCss}; // NO I18N

            var isBlockFound = groupInfo.operation.type == 'BLOCK' && cellProps.nodeType.indexOf('true-line') > -1;
            if(!(groupInfo.operation.type == 'START' || groupInfo.operation.type == 'CONDITION' || isNCMFlowLoop(groupInfo.operation.type) || groupInfo.operation.type == 'BLOCK')){
                conditionObj.css += disableCss;
                blockObj.css += disableCss;
            }
            if(!(groupInfo.operation.type == 'BLOCK' && isBlockFound)){
                loopObj.css += disableCss;
            }
            if(!(groupInfo.operation.type == 'CONDITION' || groupInfo.operation.type == 'BLOCK')){
                complianceObj.css += disableCss;
                violationObj.css += disableCss;
                notRequiredObj.css += disableCss;
            }
            if(!(isNCMFlowLoop(groupInfo.operation.type) && cellProps.nodeType == "loop-bottom-plus")){
                endObj.css += disableCss;
            }

            var resultCount = 0;
            if(groupInfo.trueLink){
                resultCount++;
            }
            if(groupInfo.falseLink){
                resultCount++;
            }
            if(resultCount < 2){
				var linkedId = groupInfo.trueLink || groupInfo.falseLink;
				var linkedType = null;

				if (linkedId) {
					var gi = this.findGroupInfoByGrpId(linkedId);
					if (gi && gi.operation) {
						linkedType = gi.operation.type;
					}
				}

				function addDisableCss(obj) {
					if (obj.css.indexOf('noPointerEvents') === -1) {
						obj.css += disableCss;
					}
				}

				if (linkedType === 'COMPLIANT') { // NO I18N
					addDisableCss(complianceObj);
				} else if (linkedType === 'VIOLATION') { // NO I18N
					addDisableCss(violationObj);
				} else if (linkedType === 'NOT_REQUIRED') { // NO I18N
					addDisableCss(notRequiredObj);
				}
            }
			var isMiddlePlus = position && position === 'middle'; // NO I18N
			if(isMiddlePlus){
				complianceObj.css += disableCss;
				violationObj.css += disableCss;
				notRequiredObj.css += disableCss;
				endObj.css += disableCss;

				if (cellProps) {
					if (cellProps.nodeType.indexOf('true') !== -1 || cellProps.nodeType.indexOf('line-down-plus') !== -1 || cellProps.nodeType.indexOf('loop-mid-plus') !== -1) {
						if (groupInfo.trueLink) {
							var findTrueNode = this.findGroupInfoByGrpId(groupInfo.trueLink);
							if (findTrueNode && findTrueNode.operation && findTrueNode.operation.type) {
								var items = getComplianceResultItems();
								items.push('LOOP'); // NO I18N
								items.push('END'); // NO I18N
								if (items && items.indexOf(findTrueNode.operation.type) !== -1) {
									processObj.css += disableCss;
									loopObj.css += disableCss;
								}
							}
						}
					} else if (cellProps.nodeType.indexOf('false') !== -1 || cellProps.nodeType.indexOf('loop-bottom-plus') !== -1) {
						if (groupInfo.falseLink) {
							var findFalseNode = this.findGroupInfoByGrpId(groupInfo.falseLink);
							if (findFalseNode && findFalseNode.operation && findFalseNode.operation.type) {
								var items = getComplianceResultItems();
								items.push('LOOP'); // NO I18N
								items.push('END'); // NO I18N
								if (items && items.indexOf(findFalseNode.operation.type) !== -1) {
									processObj.css += disableCss;
									loopObj.css += disableCss;
								}
							}
						}
					}
				}
			}
			this.isMiddlePlus = isMiddlePlus;
            list.push(conditionObj);
            list.push(blockObj);
            list.push(loopObj);
            list.push(complianceObj);
            list.push(violationObj);
            list.push(notRequiredObj);
            list.push(endObj);
            list.push(processObj);
            this.set('ruleItemSelectionList', list); //NO I18N
        },
        showTemplates : function(){
            this.set('templates',true); // NO I18N
        },
        loadSampleRule : function(ruleId){
            var ruleData = OPMClient.NCMComplianceRulesController.getRuleData(ruleId, true);

            this.set('templates', false); // NO I18N
            this.set('staticData', {}); // NO I18N
            this.variables = ruleData.variables ? ruleData.variables : [];
            this.flowDetails = {};
            this.set('groups', ruleData.groups); // NO I18N
            this.flowName = '';
            this.flowDescription = '';
            this.filterId = false;
            this.isManualReviewRequired = false;
            if(!this.groups || this.groups.length == 0){
                var startItem = this.createWorkflowStartGroup(false, 0, 0);
                this.set('groups', [startItem]);
            }
            else {
                if(this.flowName){
                    this.set('title', this.flowName); // NO I18N
                }
                this.flowDetails.name = this.flowName;
                this.flowDetails.description = this.flowDescription;
                this.flowDetails.filterId = this.filterId;
                this.flowDetails.isManualReviewRequired = this.isManualReviewRequired;
                this.drawWorkflow(this.groups);
            }
        }
    },
	disableMarkAsPublicMsg: function() {
		if ((!this.isStandard && ncmIsProbeOrProbeSelected() && this.isDistributed) || (this.isPublic && this.ruleId)) {
			waitForElement("#markAsPublic", function () {//No I18N
				var checkBoxDiv = document.querySelector('input[name="markAsPublic"]'); // NO I18N
				if (checkBoxDiv) {
					var parentDiv = checkBoxDiv.closest('div.opmFormRow'); // NO I18N
					if (parentDiv) {
						parentDiv.classList.add('disabledBlock'); // NO I18N
					}
				}
			});
		}
	},
    closeDetailsPage : function(){
        this.set('showDetails', false); // NO I18N
        this.newlyAddedGroup = false;
        this.reload();
    },
    removeStylesAndPositions : function(){
        var tempCopyArr = [];
        for(var i = 0; i < this.groups.length; i++){
            var group = JSON.parse(JSON.stringify(this.groups[i]));
            delete group.parentId;
            delete group.nodes;
            delete group.position;
            delete group.loopItemId;
            delete group.style;
            delete group.isFalseMidPlusEnabled;
            delete group.isTrueMidPlusEnabled;
            tempCopyArr.push(group);
        }
        this.groups = tempCopyArr;
    },
    drawWorkflow : function(groupsList){ // it will redraw the workflow by using the links, row,col and styles are not needed.
        this.set('linkedNodeDataCache', {});// NO I18N
        this.set('completeDepthCache', {});// NO I18N
        this.set('groupInfoCache', {});// NO I18N
        this.isWorkflowDraw = true;
        var startItem = this.findStartGroup(groupsList);
        if(!startItem){
            return;
        }
        var newStartItem = this.createWorkflowStartGroup(startItem.id, 0, 0);
        this.set('groups', [newStartItem]);

        var findGrpInfoFromCopyData = function(grpId){
            for(var i = 0; i < groupsList.length; i++){
                if(groupsList[i].id == grpId){
                    return groupsList[i];
                }
            }
            return false;
        }.bind(this);

        var getLinkNodeProps = function(grpId, isTrueLink){
            for(var i = 0; i < this.groups.length; i++){
                if(this.groups[i].id == grpId){
                    var groupInfo = this.groups[i];
                    if(groupInfo.operation.type == 'START'){
                        return groupInfo.nodes[1];
                    }
                    else if (groupInfo.operation.type == 'CONDITION' || groupInfo.operation.type == 'BLOCK'){
                        if(isTrueLink){
                            return groupInfo.nodes[2];
                        }
                        else{
                            return groupInfo.nodes[1];
                        }
                    }
                    else if(isNCMFlowLoop(groupInfo.operation.type)){
                        if(isTrueLink){
                            return groupInfo.nodes[1];
                        }
                        else{
                            return groupInfo.nodes[2];
                        }
                    }
                }
            }
            return false;
        }.bind(this);

        var linkedGroups = [];
        // traverse all groups recursively
        var traverseAllElements = function(groupId, loopItemId) {
            var group = findGrpInfoFromCopyData(groupId);
            if (group && !linkedGroups.includes(groupId)) {
                linkedGroups.push(groupId);
                if(isNCMFlowLoop(group.operation.type)){
                    loopItemId = group.id;
                }
                if(group.trueLink){
                    var newGroupInfo = findGrpInfoFromCopyData(group.trueLink);
                    this.addNewGroup(group.trueLink, getLinkNodeProps(group.id, true), "bottom", newGroupInfo.operation.type, loopItemId); // NO I18N
                    traverseAllElements(group.trueLink, loopItemId);
                }
                if(group.falseLink){
                    var direction = "right"; // NO I18N
                    if(isNCMFlowLoop(group.operation.type)){direction = "bottom";}
                    var newGroupInfo = findGrpInfoFromCopyData(group.falseLink);
                    this.addNewGroup(group.falseLink, getLinkNodeProps(group.id, false), direction, newGroupInfo.operation.type, loopItemId);
                    traverseAllElements(group.falseLink, loopItemId);
                }
            }
        }.bind(this);

        traverseAllElements(newStartItem.id, false);

		var isMidPlusRestrict = function (tGroupInfp){
			if(tGroupInfp && tGroupInfp.operation && (tGroupInfp.operation.type === 'END' || tGroupInfp.operation.type === 'COMPLIANT' || tGroupInfp.operation.type === 'NOT_REQUIRED')){
				return true;
			}
			return false;
		};
        for(var i = 0; i < this.groups.length; i++){
            var copyData = findGrpInfoFromCopyData(this.groups[i].id);
            if(copyData.scope){
                this.groups[i].scope = copyData.scope;
            }
            if(copyData.operation){
                this.groups[i].operation = copyData.operation;
				if(copyData.trueLink){
					this.groups[i].isTrueMidPlusEnabled = !isMidPlusRestrict(findGrpInfoFromCopyData(copyData.trueLink));
				}
				if(copyData.falseLink){
					this.groups[i].isFalseMidPlusEnabled = !isMidPlusRestrict(findGrpInfoFromCopyData(copyData.falseLink));
				}
			}
        }

        this.updateLoopBottomPlusIndexesForAll();
        this.isWorkflowDraw = false;
        this.rerender();
        this.scrollScreen();
    },
    findStartGroup : function(groupsList){
        for(var i = 0; i < groupsList.length; i++){
            if(groupsList[i].operation.type == 'START'){
                return groupsList[i];
            }
        }
    },
    addNewGroup : function(newItemId, cellProps, direction, selectedNodeType, loopItemId, connectMiddleItemToTrue){
        var row = cellProps.position.row;
        var col = cellProps.position.col;
        var newItem;
        if(selectedNodeType == 'LOOP'){
            var freshAdd = !newItemId;
            newItem = this.createLoopGroup(newItemId, row, col, cellProps.id);
            if(freshAdd){
                var endGroupItem = this.createEndGroup(false, row + 4, col, newItem.nodes[2].id);
                this.get('groups').pushObject(endGroupItem);
                newItem.falseLink = endGroupItem.id;
            }
        }
        else if(selectedNodeType == 'PROCESS'){
            newItem = this.createProcessGroup(newItemId, row, col, cellProps.id);
        }
        else if(selectedNodeType == 'BLOCK'){
            newItem = this.createBlockGroup(newItemId, row, col, cellProps.id);
        }
        else if(getComplianceResultItems().includes(selectedNodeType)){
            newItem = this.createResultGroup(newItemId, row, col, cellProps.id, selectedNodeType);
        }
        else if(selectedNodeType == 'CONDITION'){
            newItem = this.createConditionGroup(newItemId, row, col, cellProps.id);
        }
        else{
            newItem = this.createEndGroup(newItemId, row, col, cellProps.id);
        }
        if(loopItemId){
            newItem.loopItemId = loopItemId;
        }
        if(!newItemId){
            this.newlyAddedGroup = newItem.id;
        }
        if(cellProps){
            var thisGroupInfo = this.findGroupInfoByGrpId(cellProps.groupId);
            if(cellProps.nodeType == 'loop-bottom-plus'){ // replacing plus is not needed, handled in handlebar
				if(thisGroupInfo.falseLink && this.isMiddlePlus){
					if(connectMiddleItemToTrue){
						newItem.trueLink = thisGroupInfo.falseLink;
					}
					else{
						newItem.falseLink = thisGroupInfo.falseLink;
					}
				}
                thisGroupInfo.falseLink = newItem.id;
            }
            if (cellProps.nodeType == 'true-line-plus' || cellProps.nodeType == 'false-line-plus' || cellProps.nodeType == 'line-down-plus' || cellProps.nodeType == 'loop-mid-plus') {
                // Update nodeType to 'linked' for the children in the same item
                if(direction == 'right'){
					if(thisGroupInfo.falseLink && this.isMiddlePlus){
						if(connectMiddleItemToTrue){
							newItem.trueLink = thisGroupInfo.falseLink;
						}
						else{
							newItem.falseLink = thisGroupInfo.falseLink;
						}
					}
                    thisGroupInfo.falseLink = newItem.id;
                }
                else{
					if(thisGroupInfo.trueLink && this.isMiddlePlus){
						if(connectMiddleItemToTrue){
							newItem.trueLink = thisGroupInfo.trueLink;
						}
						else{
							newItem.falseLink = thisGroupInfo.trueLink;
						}
					}
                    thisGroupInfo.trueLink = newItem.id;
                }
            }
            // if(loopItemId){
            //     var loopItemGroupInfo = this.findGroupInfoByGrpId(loopItemId);
            // }
            this.get('groups').pushObject(newItem);
            if(direction && !getNcmFlowEdgeItems().includes(selectedNodeType) && cellProps.nodeType != 'loop-mid-plus' && cellProps.nodeType != 'loop-bottom-plus'){
                this.shiftNodesRight( direction == 'bottom' ? cellProps.position.col + (this.toShiftCells -1) : cellProps.position.col, direction == 'bottom' ? this.toShiftCells - 1 : this.toShiftCells, newItem); // NO I18N
            }
        }
        this.captureScrollPos();
        if(!newItemId && (!isNCMFlowLoop(newItem.operation.type) && (!getNcmFlowEdgeItems().includes(newItem.operation.type) || newItem.operation.type == 'VIOLATION'))){
            this.collectDetails(newItem.id);
        }
        else{
            this.reload();
        }

    },

    findLinkedGroupsWithBlockFilter : function(tGroupId){
        var linkedGroups = [];

        // finding all linked groups recursively
        var findLinkedGroups = function(groupId) {
            var group = this.findGroupInfoByGrpId(groupId);
            if (group && !linkedGroups.includes(groupId)) {
                linkedGroups.push(groupId);
                if (group.operation.type === 'CONDITION' || group.operation.type === 'BLOCK') {
                    if (group.trueLink) {
                        findLinkedGroups(group.trueLink);
                    }
                    if (group.falseLink && group.operation.type != 'BLOCK') {
                        findLinkedGroups(group.falseLink);
                    }
                } else if (isNCMFlowLoop(group.operation.type)) {
                    var loopedGroups = this.findAllLinkedNodesByGrpIdRecursively(group.trueLink);
                    for (var i = 0; i < loopedGroups.length; i++) {
                        findLinkedGroups(loopedGroups[i]);
                    }
                    if (group.falseLink) {
                        findLinkedGroups(group.falseLink);
                    }
                }
            }
        }.bind(this); // binds the current component data, else it will refer a new instance.
        findLinkedGroups(tGroupId);
        return linkedGroups;
    },

    checkBlockInputIsNeeded : function(targetGrpId){
        var checkTargetPresence = function(baseGroupId){
            var linkedGroups = this.findLinkedGroupsWithBlockFilter(baseGroupId);
            for(var i = 0; i < linkedGroups.length; i++){
                if(linkedGroups[i] == targetGrpId && baseGroupId != targetGrpId){
                    return true;
                }
            }
            return false;
        }.bind(this);

        var traversedGroups = [];
        var groupsList = jQuery.extend(true,[],  this.groups);
        var targetPresent = false;
        var traverseAllElements = function(tGroupId) {
            var groupT = this.findGroupInfoByGrpId(tGroupId);
            if (groupT && !traversedGroups.includes(tGroupId)) {
                traversedGroups.push(tGroupId);
                if(groupT.operation.type == 'BLOCK'){ // NO I18N
                    if(checkTargetPresence(tGroupId)){
                        targetPresent = true;
                        return;
                    }
                }
                if(groupT.trueLink){
                    traverseAllElements(groupT.trueLink);
                }
                if(groupT.falseLink){
                    traverseAllElements(groupT.falseLink);
                }
            }
        }.bind(this);
        traverseAllElements(this.findStartGroup(this.groups).id);
        return targetPresent;
    },
    collectDetails : function(groupId){
        this.captureScrollPos();
        var tempGrpInfo = jQuery.extend(true, {},this.findGroupInfoByGrpId(groupId));

        var groupsList = jQuery.extend(true,[],  this.groups);
        var findGrpInfoFromCopyData = function(grpId){
            for(var m = 0; m < groupsList.length; m++){
                if(groupsList[m].id == grpId){
                    return groupsList[m];
                }
            }
            return false;
        };

        tempGrpInfo.showBlockScope = this.checkBlockInputIsNeeded(groupId);
        this.set('showDetails', tempGrpInfo); // NO I18N
    },
    drawLoopRightLine : function(loopGrpId, updatedLoops){
        if(updatedLoops.includes(loopGrpId)){
            return;
        }
        updatedLoops.push(loopGrpId);
        // Finding the right edge element
        var traversedGroups = [];
        var traverseAllElements = function(groupId) {
            var group = this.findGroupInfoByGrpId(groupId);
            if(group && !traversedGroups.includes(group)){
                traversedGroups.push(group);
                if(isNCMFlowLoop(group.operation.type)){
                    var loopedGroups = this.findAllLinkedNodesByGrpId(group.trueLink);
                    for (var i = 0; i < loopedGroups.length; i++) {
                        traverseAllElements(loopedGroups[i]);
                    }
                    if (group.falseLink) {
                        traverseAllElements(group.falseLink);
                    }
                }
            }
        }.bind(this); // binds the current component data, else it will refer a new instance.

        var currentGroupInfo = this.findGroupInfoByGrpId(loopGrpId);
        var loopedGroups = this.findAllLinkedNodesByGrpId(currentGroupInfo.trueLink);
        // traverse only the groups inside loop, afterLoop checking for current grp is not needed, only for children are needed, handled in traverseAllElements
        for (var i = 0; i < loopedGroups.length; i++) {
            traverseAllElements(loopedGroups[i]);
        }

        var maxRightValue = 0;
        for(var m=0; m< traversedGroups.length; m++){
            var group = traversedGroups[m];
            var currRightEdgeValue = 0;
            if(group.operation.type == 'CONDITION' || group.operation.type == 'BLOCK'){
                for(var j = 0; j < group.nodes.length; j++){
                    if(group.falseLink){
                        currRightEdgeValue = document.getElementById(group.falseLink).getBoundingClientRect().right;
                        if(getNcmFlowEdgeItems().includes(this.findGroupInfoByGrpId(group.falseLink).operation.type)){ // handling if the false edge element is type of RESULT
                            currRightEdgeValue = currRightEdgeValue - 38;
                        }
                        if(currRightEdgeValue > maxRightValue){
                            maxRightValue = currRightEdgeValue;
                        }
                        break;
                    }
                    else {
                        if(group.nodes[j].nodeType == 'false-line-plus'){
                            currRightEdgeValue = document.getElementById(group.nodes[j].id).getBoundingClientRect().right;
                            if(currRightEdgeValue > maxRightValue){
                                maxRightValue = currRightEdgeValue;
                            }
                            break;
                        }
                    }
                }
            }
            else if(isNCMFlowLoop(group.operation.type)){
                this.drawLoopRightLine(group.id, updatedLoops);
                currRightEdgeValue = document.getElementById(group.id).closest('.complaince-flow-element-group').getBoundingClientRect().right; //NO I18N
                if(currRightEdgeValue > maxRightValue){
                    maxRightValue = currRightEdgeValue;
                }
            }
        }
        if(currentGroupInfo.trueLink){
            currentGroupInfo.style.width = maxRightValue - (currentGroupInfo.style.left) + 16;
        }
        else{
            currentGroupInfo.style.width = 357.5;
        }
        document.getElementById(currentGroupInfo.id).closest('.complaince-flow-element-group').style.width = currentGroupInfo.style.width + 'px';
    },
    drawLoopLine : function(loopGrpId, updatedLoops){
        var groupInfo = this.findGroupInfoByGrpId(loopGrpId);
        var loopedGroups = this.findAllLinkedNodesByGrpId(groupInfo.trueLink);
        for(var i=0; i < loopedGroups.length; i++){
            var currIndexGrpInfo = this.findGroupInfoByGrpId(loopedGroups[i]);
            if(isNCMFlowLoop(currIndexGrpInfo.operation.type)){
                updatedLoops.push(this.drawLoopLine(currIndexGrpInfo.id, updatedLoops));
            }
        }
        if(isNCMFlowLoop(groupInfo.operation.type)){
            groupInfo.style.height = 185;
            groupInfo.style.width = 357.5;
            if(groupInfo.trueLink){
                for(var j = 0; j < groupInfo.nodes.length; j++){
                    if(groupInfo.nodes[j].nodeType == 'loop-mid-plus'){
                        groupInfo.nodes[j].style.height = (((groupInfo.nodes[j].position.row - groupInfo.position.row) - 1) * 75) - 40;
                        document.getElementById(groupInfo.nodes[j].id).style.height = groupInfo.nodes[j].style.height + 'px';
                    }
                    else if(groupInfo.nodes[j].nodeType == 'loop-bottom-plus'){
                        if(groupInfo.falseLink){
                            groupInfo.nodes[j].style.height = this.findGroupInfoByGrpId(groupInfo.falseLink).style.top - groupInfo.style.top - 37;
                            document.getElementById(groupInfo.nodes[j].id).style.height = groupInfo.nodes[j].style.height + 'px';
                        }
                        else{
                            var lRow = groupInfo.nodes[j].position.row - groupInfo.position.row;
                            groupInfo.nodes[j].style.height = (lRow * (50) + (((lRow - 2) / 2) * 34)) - 37;
                            document.getElementById(groupInfo.nodes[j].id).style.height = groupInfo.nodes[j].style.height + 'px';
                        }
                        if((groupInfo.nodes[j].style.height - 12) > groupInfo.style.height){
                            groupInfo.style.height = groupInfo.nodes[j].style.height - 12; // change this if loop height needs to corrected, to 22
                        }
                    }
                }
            }
            document.getElementById(groupInfo.id).closest('.complaince-flow-element-group').style.height = groupInfo.style.height + 'px';
        }
        return groupInfo.id;
    },
    setLoopPosition : function() {
        var updatedLoops = [];
        var updatedRightEdges = [];
        for(var groupIndex = 0; groupIndex < this.groups.length; groupIndex++){
            if(isNCMFlowLoop(this.groups[groupIndex].operation.type)){
                if(!updatedLoops.contains(this.groups[groupIndex].id)){
                    this.drawLoopLine(this.groups[groupIndex].id, updatedLoops);
                }
                if(!updatedRightEdges.contains(this.groups[groupIndex].id)){
                    this.drawLoopRightLine(this.groups[groupIndex].id, updatedRightEdges);
                }
            }
        }
    },
    updateLoopBottomPlusIndexesForAll : function(){
        this.set('completeDepthCache', {});// NO I18N
        for(var i = 0; i < this.groups.length; i++){
            this.updateLoopBottomPlusIndexes(this.groups[i]);
        }
    },
    updateLoopBottomPlusIndexes : function(groupInfo){
        if(isNCMFlowLoop(groupInfo.operation.type)){
            var loopInsideDepth = this.findDepthOfInsideLoop(groupInfo.id);
            for (var j = 0; j < groupInfo.nodes.length; j++) {
                var node = groupInfo.nodes[j];
                if (node.nodeType == 'loop-bottom-plus' && (node.position.row < (loopInsideDepth + 2))) {
                    var shiftNeeds = (loopInsideDepth + 2) - node.position.row;
                    node.position.row = loopInsideDepth + 2;
                    // shift to bottom is done here.
                    if(groupInfo.falseLink){
                        this.shiftNodesBottom(groupInfo.falseLink, shiftNeeds);
                    }
                }
            }
        }
    },
    findDepthOfInsideLoop : function(loopItemId){
        var loopItemGroupInfo = this.findGrpInfoByGrpIdInCache(loopItemId);
        var maxDepth = loopItemGroupInfo.position.row + 2;
        var loopedGroups = this.findAllLinkedNodesByGrpId(loopItemGroupInfo.trueLink);
        for(var i =0; i < loopedGroups.length; i++){
            var currGrpInfo = this.findGrpInfoByGrpIdInCache(loopedGroups[i]);
            if(currGrpInfo.operation.type == 'CONDITION' || currGrpInfo.operation.type == 'BLOCK'){
                for (var j = 0; j < currGrpInfo.nodes.length; j++) {
                    var node = currGrpInfo.nodes[j];
                    if (node.position.row > maxDepth) {
                        maxDepth = node.position.row;
                    }
                }
            }
            else if(isNCMFlowLoop(currGrpInfo.operation.type)){
                var currentLoopDepth = this.findCompleteDepthOfLoop(currGrpInfo.id);
                if(currentLoopDepth > maxDepth){
                    maxDepth = currentLoopDepth;
                }
            }
        }
        return maxDepth;
    },
    findCompleteDepthOfLoop : function(loopGrpId){
        if(this.completeDepthCache[loopGrpId]){
            return this.completeDepthCache[loopGrpId];
        }
        var completeDepth = this.findCompleteDepthOfLoopRecursively(loopGrpId);
        this.completeDepthCache[loopGrpId] = completeDepth; // caching the data for future use
        return completeDepth;
    },
    findCompleteDepthOfLoopRecursively : function(loopGrpId){
        var loopGrpInfo = this.findGrpInfoByGrpIdInCache(loopGrpId);
        this.updateLoopBottomPlusIndexes(loopGrpInfo);
        if(isNCMFlowLoop(loopGrpInfo.operation.type)){
            if(!loopGrpInfo.falseLink){
                return this.findDepthOfInsideLoop(loopGrpId) + 2;
            }
            else{
                var maxDepth = this.findGrpInfoByGrpIdInCache(loopGrpId).position.row;
                if(loopGrpInfo.falseLink){
                    var afterLoopGroupsList = this.findAllLinkedNodesByGrpId(loopGrpInfo.falseLink)
                    for (var i = 0; i < afterLoopGroupsList.length; i++) {
                        var afterLoopEachGrpInfo = this.findGrpInfoByGrpIdInCache(afterLoopGroupsList[i]);
                        if(afterLoopEachGrpInfo.operation.type == 'CONDITION' || afterLoopEachGrpInfo.operation.type == 'BLOCK'){
                            for (var j = 0; j < afterLoopEachGrpInfo.nodes.length; j++) {
                                var node = afterLoopEachGrpInfo.nodes[j];
                                if (node.position.row > maxDepth) {
                                    maxDepth = node.position.row;
                                }
                            }
                        }
                        else if(isNCMFlowLoop(afterLoopEachGrpInfo.operation.type)){
                            var currentLoopDepth = this.findCompleteDepthOfLoop(afterLoopEachGrpInfo.id);
                            if(currentLoopDepth > maxDepth){
                                maxDepth = currentLoopDepth;
                            }
                        }
                        else if (getNcmFlowEdgeItems().includes(afterLoopEachGrpInfo.operation.type)){
                            if((afterLoopEachGrpInfo.position.row) > maxDepth){
                                maxDepth = afterLoopEachGrpInfo.position.row;
                            }
                        }
                    }
                }
                return maxDepth;
            }
        }

    },
    findGrpInfoByGrpIdInCache : function(id) {
        if(this.groupInfoCache[id]){
            return this.groupInfoCache[id];
        }
        var groupInfo = this.findGroupInfoByGrpId(id);
        if(groupInfo){
            this.groupInfoCache[id] = groupInfo; // caching the data for future use
        }
        return groupInfo;
    },
    findGroupInfoByGrpId : function(id) {
        var groups = this.get('groups');
        for(var index = 0; index < groups.length; index++){
            if(groups[index].id == id){
                return groups[index];
            }
        }
    },
    findAllLinkedNodesByGrpId : function(grpId){
        if(this.linkedNodeDataCache[grpId]){
            return this.linkedNodeDataCache[grpId];
        }
        else{
            var linkedNodeData = this.findAllLinkedNodesByGrpIdRecursively(grpId);
            this.linkedNodeDataCache[grpId] = linkedNodeData; // caching the data for future use
            return linkedNodeData;
        }
    },
    findAllLinkedNodesByGrpIdRecursively : function(grpId){
        var linkedGroups = [];

        // finding all linked groups recursively
        var findLinkedGroups = function(groupId) {
            var group = this.findGroupInfoByGrpId(groupId);
            if (group && !linkedGroups.includes(groupId)) {
                linkedGroups.push(groupId);
                if (group.operation.type === 'CONDITION' || group.operation.type === 'BLOCK') {
                    if (group.trueLink) {
                        findLinkedGroups(group.trueLink);
                    }
                    if (group.falseLink) {
                        findLinkedGroups(group.falseLink);
                    }
                } else if (isNCMFlowLoop(group.operation.type)) {
                    var loopedGroups = this.findAllLinkedNodesByGrpIdRecursively(group.trueLink);
                    for (var i = 0; i < loopedGroups.length; i++) {
                        findLinkedGroups(loopedGroups[i]);
                    }
                    if (group.falseLink) {
                        findLinkedGroups(group.falseLink);
                    }
                }
            }
        }.bind(this); // binds the current component data, else it will refer a new instance.

        findLinkedGroups(grpId);
        return linkedGroups;
    },
    shiftNodesRight: function(startCol, shiftAmount, newGroup) {
        var groups = this.get('groups');
        var allLayerInfo = this.getAllLayersInfo();
        var startLayerInfo = allLayerInfo[0];

        var findLayerLevelForAGroup = function(levels, groupId){
            for(var i=0; i < allLayerInfo.length; i++){
                if(allLayerInfo[i].layerGroups.includes(groupId) && !levels.includes(allLayerInfo[i].layerId)){
                    levels.push(allLayerInfo[i].layerId);
                    findLayerLevelForAGroup(levels, allLayerInfo[i].layerId);
                }
            }
        }.bind(this);

        var newGrpLevels = [];
        findLayerLevelForAGroup(newGrpLevels, newGroup.id);
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            if(group.id == newGroup.id){ // Newly added group not needed to be shifted
                continue;
            }

            var shiftedGroups = [];
            var shiftedNodes = [];

            // Handling of top level groups and nodes. If a group is shifted all the senior children and parents needs to be shifted.
            if(newGroup.loopItemId && !startLayerInfo.layerGroups.includes(newGroup.id)){
                var canShiftByRows = (group.position.col >= startCol && group.position.row < newGroup.position.row);

                var currGrpLevels = [];
                findLayerLevelForAGroup(currGrpLevels, group.id);

                var topLevelShift = true;
                if(!startLayerInfo.layerGroups.includes(group.id)){
                    for(var m = 0; m < currGrpLevels.length; m++){
                        if(!newGrpLevels.includes(currGrpLevels[m]) && currGrpLevels[m]!=group.id){
                            topLevelShift = false;
                        }
                    }
                }
                if(topLevelShift){
                    if (group.position.col >= startCol && group.position.row <= newGroup.position.row) {
                        this.shiftUnique(shiftedGroups, group, shiftAmount);
                        if(isNCMFlowLoop(group.operation.type)){
                            this.shiftAllRight(this.findAllLinkedNodesByGrpId(group.trueLink), shiftAmount, shiftedGroups, shiftedNodes);
                            this.shiftAllRight(this.findAllLinkedNodesByGrpId(group.falseLink), shiftAmount, shiftedGroups, shiftedNodes);
                        }
                    }
                    for (var j = 0; j < group.nodes.length; j++) {
                        var node = group.nodes[j];
                        if (node.position.col >= startCol && node.position.row <= newGroup.position.row) {
                            this.shiftUnique(shiftedNodes, node, shiftAmount);
                        }
                    }
                }
            }

            // check to shift only same level groups
            var sameLayerGroups = this.getSameLayerGroups(allLayerInfo, newGroup);// loop handling
            if(!sameLayerGroups.includes(group.id)){
                continue;
            }

            var shiftGroup = false;// actual shift of layer level groups
            if (group.position.col >= startCol) {
                shiftGroup = true;
                this.shiftUnique(shiftedGroups, group, shiftAmount);
            }
            for (var j = 0; j < group.nodes.length; j++) {
                var node = group.nodes[j];
                if (shiftGroup || (node.position.col >= startCol)) {
                    this.shiftUnique(shiftedNodes, node, shiftAmount);
                }
            }

            if(shiftGroup){ // if shifting group is loop then shift all the looped children, not looped children are considered in layer level itself
                if(isNCMFlowLoop(group.operation.type)){
                    this.shiftAllRight(this.findAllLinkedNodesByGrpId(group.trueLink), shiftAmount, shiftedGroups, shiftedNodes);
                }
            }
        }
        this.updateNodeIndexes();
        this.shrinkEdges();
    },
    updateNodeIndexes : function(){
        for(var i = 0; i < this.groups.length; i++){
            var group = this.groups[i];
            if(group.operation.type == 'CONDITION' || group.operation.type == 'BLOCK'){
                if(group.trueLink){
                    group.nodes[2].position.col = this.findGroupInfoByGrpId(group.trueLink).position.col;
                }
                if(group.falseLink){
                    group.nodes[1].position.col = this.findGroupInfoByGrpId(group.falseLink).position.col;
                }
            }
        }
    },
    shiftUnique : function(shiftedIds, node, shiftAmount){
        if(!shiftedIds.includes(node.id)){
            node.position.col += shiftAmount;
            shiftedIds.push(node.id);
        }
    },
    shiftAllRight : function(groupsList, shiftAmount, shiftedGroups, shiftedNodes){
        for(var i = 0; i < groupsList.length; i++){
            var group = this.findGroupInfoByGrpId(groupsList[i]);
            this.shiftUnique(shiftedGroups, group, shiftAmount);
            for (var j = 0; j < group.nodes.length; j++) {
                var node = group.nodes[j];
                this.shiftUnique(shiftedNodes, node, shiftAmount);
            }
        }
    },
    getSameLayerGroups : function(allLayerInfo, newGroup){
        var layerId = this.findLayer(allLayerInfo, newGroup);
        for(var i=0; i < allLayerInfo.length; i++){
            if(allLayerInfo[i].layerId == layerId){
                return allLayerInfo[i].layerGroups;
            }
        }
    },
    findLayer : function(allLayerInfo, newGroup){
        var newGroupLayerId = -1;
        for(var i=0; i < allLayerInfo.length; i++){
            var eachLayerGroups = allLayerInfo[i].layerGroups;
            for(var j = 0; j < eachLayerGroups.length; j++){
                if(eachLayerGroups[j] == newGroup.id){
                    newGroupLayerId = allLayerInfo[i].layerId;
                    return newGroupLayerId;
                }
            }
        }
    },
    getAllLayersInfo : function(){
        var layers = this.getLayers();
        var allLayers = [];
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            var eachLayer = {};
            eachLayer.layerId = layer;
            eachLayer.layerGroups = this.getParticularLayerGroups(layer);
            allLayers.push(eachLayer);
        }
        return allLayers;
    },
    getParticularLayerGroups : function(layerGroupId){
        var layerGroups = [];
        layerGroups.push(layerGroupId);
        var group = this.findGrpInfoByGrpIdInCache(layerGroupId);
        var firstLink = group.trueLink;
        var findTopLinkedGroups = function(groupId) {
            var group = this.findGrpInfoByGrpIdInCache(groupId);
            if (group && !layerGroups.includes(groupId)) {
                layerGroups.push(groupId);
                if (group.operation.type === 'CONDITION' || group.operation.type === 'BLOCK') {
                    if (group.trueLink) {
                        findTopLinkedGroups(group.trueLink);
                    }
                    if (group.falseLink) {
                        findTopLinkedGroups(group.falseLink);
                    }
                } else if (isNCMFlowLoop(group.operation.type)) { // only groups outside the loop is considered, inside are another layer.
					findTopLinkedGroups(group.falseLink);
                } else if (group.operation.type === 'START') {
                     findTopLinkedGroups(group.trueLink);
                }// no handling needed for results.
            }
        }.bind(this); // binds the current component data, else it will refer a new instance.

        if(firstLink){
            findTopLinkedGroups(firstLink);
        }

        return layerGroups;

    },
    getLayers : function(){
        var layers = [];
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].operation.type == 'START'){
                layers.push(this.groups[i].id);
            }
            else if(isNCMFlowLoop(this.groups[i].operation.type)){
                layers.push(this.groups[i].id);
            }
        }
        return layers;
    },
    shrinkEdges : function(){ // to shrink the edge group which is shifted multiple times.
        var getMarkedColumns = function(){
            var markedColumns = [];
            for (var i = 0; i < this.groups.length; i++) {
                var group = this.groups[i];
                if(isNCMFlowLoop(group.operation.type) && !group.trueLink){
                    if(!markedColumns.includes(group.position.col + 1)){
                        markedColumns.push(group.position.col + 1);
                    }
                }
                if(!markedColumns.includes(group.position.col)){
                    markedColumns.push(group.position.col);
                }
                for (var j = 0; j < group.nodes.length; j++) {
                    var node = group.nodes[j];
                    if(!markedColumns.includes(node.position.col)){
                        markedColumns.push(node.position.col);
                    }
                }
            }
            for(var i = 0; i < markedColumns.length; i++){
                for( var j = i + 1; j < markedColumns.length; j++){
                    if(markedColumns[i] > markedColumns[j]){
                        var t = markedColumns[i];
                        markedColumns[i] = markedColumns[j];
                        markedColumns[j] = t;
                    }
                }
            }
            return markedColumns;
        }.bind(this);
        var shrinkEdgeGroups = function(groupId){
            var markedColumns = getMarkedColumns();
            var groupInfo = this.findGroupInfoByGrpId(groupId);
            var currGrpColIndex = markedColumns.indexOf(groupInfo.position.col);
            if(currGrpColIndex > 1 && (markedColumns[currGrpColIndex] - markedColumns[currGrpColIndex-1]) > 2){
                groupInfo.position.col = groupInfo.position.col - 1;
                return true;
            }
            for (var j = 0; j < groupInfo.nodes.length; j++) {
                var node = groupInfo.nodes[j];
                var currNodeColIndex = markedColumns.indexOf(node.position.col);
                if(currNodeColIndex > 1 && node.nodeType.indexOf('false') > -1 && (markedColumns[currNodeColIndex] - markedColumns[currNodeColIndex-1]) > 2){
                    if(node.position.col - groupInfo.position.col > 3){
                        node.position.col = node.position.col - 1;
                        return true;
                    }
                }
            }
            return false;
        }.bind(this);
        for (var i = 0; i < this.groups.length; i++) {
            var group = this.groups[i];
            if(shrinkEdgeGroups(group.id)){
                i = 0;
            }
        }
    },
    shiftNodesBottom: function(groupId, numberOfShifts) {
        var shiftAmount = numberOfShifts;
        var groups = this.get('groups');
        var linkedGroups = [];

        linkedGroups = this.findAllLinkedNodesByGrpId(groupId);

        var startRow = this.findGroupInfoByGrpId(groupId).position.row;

        // Shift nodes and group positions of linked groups
        for (var i = 0; i < linkedGroups.length; i++) {
            var group = this.findGroupInfoByGrpId(linkedGroups[i]);
            for (var j = 0; j < group.nodes.length; j++) {
                var node = group.nodes[j];
                if (node.position.row >= startRow) {
                    node.position.row += shiftAmount;
                }
            }

            if (group.position.row >= startRow) {
                group.position.row += shiftAmount;
            }
        }
    },
    getDirection : function(cellProps){
        if(cellProps.nodeType == 'loop-bottom-plus' || cellProps.nodeType == 'line-down-plus'){
            return 'bottom'; // NO I18N
        }
        var leadNode = this.findLeadNodeByGroupId(cellProps.groupId);
        if((cellProps.nodeType == 'false-line-plus' || cellProps.nodeType == 'true-line-plus') && leadNode){
            if(leadNode.position.row == cellProps.position.row){
                return 'right'; // NO I18N
            }
            else if(leadNode.position.col == cellProps.position.col){
                return 'bottom'; // NO I18N
            }
        }
    },
    findLeadNodeByGroupId : function(groupId){
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].id == groupId){
                for(var index = 0; index < this.groups[i].nodes.length; index++){
                    if(this.groups[i].nodes[index].id == groupId){
                        return this.groups[i].nodes[index];
                    }
                }
            }
        }
    },
    findCellPropsById : function(id){
        for (var i = 0; i < this.groups.length; i++) {
            for(var index = 0; index < this.groups[i].nodes.length; index++){
                if (this.groups[i].nodes[index].id == id) {
                    return this.groups[i].nodes[index];
                }
            }
        }
    },
    generateUniqueId : function() {
        var genId =  Date.now() + '' + Math.floor(Math.random() * 1000); // NO I18N
        while(this.uniqueIds.contains(genId)){
            genId = Date.now() + '' + Math.floor(Math.random() * 1000); // NO I18N
        }
        genId = parseInt(genId);
        this.uniqueIds.push(genId);
        return genId;
    },
    reload : function() {
        if(this.isWorkflowDraw){
            return;
        }
        this.rerendering = true;
        this.removeStylesAndPositions();
        this.drawWorkflow(this.groups);
        this.rerendering = false;
    },
    createNode : function(id, nodeType, row, col, groupId) {
        if(!id){
            id = this.generateUniqueId();
        }
        return {
            id : id,
            nodeType: nodeType,
            style : {},
            position: { row : row, col : col },
            groupId: groupId
        };
    },
    createGroupObject : function(type){
        return {
            id: false,
            trueLink : false,
            falseLink : false,
            operation : {
                type : type,
                details : {}
            },
            scope : {
                type : false,
                details : {}
            },
            style : {}
        };
    },
    createResultGroup : function(id, row, col, parentId, resultType) {
        leadNode = this.createNode(id, resultType, row, col);
        var groupId = leadNode.id;
        leadNode.groupId = groupId;

        var result = this.createGroupObject(resultType);
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
           leadNode
       ];
       return result;
    },
    createEndGroup : function(id, row, col, parentId){
        leadNode = this.createNode(id, 'END', row, col); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;

        var result = this.createGroupObject('END'); // NO I18N
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
            leadNode
        ];
        return result;
    },
    createConditionGroup : function(id, row, col, parentId) {
        var baseRow = row;
        var baseCol = col;
        leadNode = this.createNode(id, 'CONDITION', baseRow, baseCol); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;
        var falseLineNode = this.createNode(false, 'false-line-plus', baseRow, baseCol + 2, groupId); // NO I18N
        falseLineNode.style ={
          left : 209,
          top : 15,
          width : 250
        }

        var trueLineNode = this.createNode(false, 'true-line-plus', baseRow + 2, baseCol, groupId); // NO I18N
        trueLineNode.style ={
            left : 100,
            top : 37,
            width : 0
        }

        var result = this.createGroupObject('CONDITION'); // NO I18N
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
           leadNode,
           falseLineNode,
           trueLineNode
       ];
        return result;
    },
    createBlockGroup : function(id, row, col, parentId) {
        var baseRow = row;
        var baseCol = col;
        leadNode = this.createNode(id, 'BLOCK', baseRow, baseCol); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;
        var falseLineNode = this.createNode(false, 'false-line-plus', baseRow, baseCol + 2, groupId); // NO I18N
        falseLineNode.style ={
            left : 209,
            top : 15,
            width : 250
        }

        var trueLineNode = this.createNode(false, 'true-line-plus', baseRow + 2, baseCol, groupId); // NO I18N
        trueLineNode.style ={
            left : 100,
            top : 37,
            width : 0
        }

        var result = this.createGroupObject('BLOCK'); // NO I18N
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
            leadNode,
            falseLineNode,
            trueLineNode
        ];
        return result;
    },
    createLoopGroup : function(id, row, col, parentId) {
        var baseRow = row;
        var baseCol = col;
        leadNode = this.createNode(id, 'LOOP', baseRow, baseCol); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;

        var loopMidPlus = this.createNode(false, 'loop-mid-plus', baseRow + 2, baseCol, groupId); // NO I18N
        var loopBottomPlus = this.createNode(false, 'loop-bottom-plus', baseRow + 4, baseCol, groupId); // NO I18N

        var result = this.createGroupObject('LOOP'); // NO I18N
        result.operation.details.name = 'LOOP'; // NO I18N
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
            leadNode,
            loopMidPlus,
            loopBottomPlus
        ];
        return result;
    },
    createProcessGroup : function(id, row, col, parentId) {
        var baseRow = row;
        var baseCol = col;
        leadNode = this.createNode(id, 'PROCESS', baseRow, baseCol); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;

        var loopMidPlus = this.createNode(false, 'loop-mid-plus', baseRow + 2, baseCol, groupId); // NO I18N
        var loopBottomPlus = this.createNode(false, 'loop-bottom-plus', baseRow + 4, baseCol, groupId); // NO I18N

        var result = this.createGroupObject('PROCESS'); // NO I18N
        result.operation.details.name = 'PROCESS'; // NO I18N
        result.parentId = parentId;
        result.id = groupId;
        result.position = { row : row, col : col };
		result.isFalseMidPlusEnabled = false;
        result.nodes = [
            leadNode,
            loopMidPlus,
            loopBottomPlus
        ];
        return result;
    },
    createWorkflowStartGroup : function(id, row, col) {
        var baseRow = row;
        var baseCol = col;
        leadNode = this.createNode(id, 'START', baseRow, baseCol); // NO I18N
        var groupId = leadNode.id;
        leadNode.groupId = groupId;
        var result = this.createGroupObject('START'); // NO I18N
        result.parentId = -1;
        result.id = groupId;
        result.position = { row : row, col : col };
        result.nodes = [
            leadNode,
            this.createNode(false, 'line-down-plus', baseRow + 2, baseCol, groupId) // NO I18N
        ];
        return result;
    },
	willDestroyElement: function(){
	    if(!this.rerendering){
    	    ncmRevertMaxScreen();
	        $('#'+this.elementId).find('*').remove();
            document.removeEventListener('click', this.ruleItemListClose);
	    }
	}
});
OPMClient.NcmWorkflowNodeGroupComponent = Ember.Component.extend({
    nodeSize: { width: 219, height: 50 },
    cellProps : '',
    willInsertElement : function(){
        this._super();
        this.populatePositions();
        this.setLinePos();
    },
    didInsertElement : function() {
        this._super();
        this.setPosition();

    },
    actions: {
        childActions:function(functionName,param1, param2) {
            this.sendAction('action',functionName, param1, param2);
        },
        updateRuleItemList:function(cellId, position){
            this.sendAction('action','updateRuleItemList', cellId, position); // NO I18N
        }
    },
    populatePositions : function() {
        this.cellProps = this.groupInfo.nodes[0];
        var left = this.cellProps.position.col * (this.nodeSize.width);
        var top = this.cellProps.position.row * (this.get('nodeSize').height);
        if(this.groupInfo.position.row > 0){
            top = this.groupInfo.position.row * (this.get('nodeSize').height) + (((this.groupInfo.position.row - 2) / 2) * 34);
        }
        if(getNcmFlowEdgeItems().includes(this.groupInfo.operation.type) && (this.isFalseMappedGroup(this.groupInfo.id))){
            left = left - 48 + 14;
        }
        this.groupInfo.style.left = left;
        this.groupInfo.style.top = top;
    },
    isFalseMappedGroup : function(groupId){
        for (var i = 0; i < this.groups.length; i++) {
            var falseLink = this.groups[i].falseLink;
            if(falseLink && falseLink == groupId && (!isNCMFlowLoop(this.groups[i].operation.type))){
                return true;
            }
        }
        return false;
    },
    setPosition : function() {
        var element = this.element.closest('.complaince-flow-element-group'); // NO I18N
        if(element){
            element.style.left = this.groupInfo.style.left  + 'px';
            element.style.top = this.groupInfo.style.top  + 'px';
            if(this.groupInfo.style.height){
                element.style.height = this.groupInfo.style.height  + 'px';
            }
            if(this.groupInfo.style.width){
                element.style.width = this.groupInfo.style.width  + 'px';
            }
        }
    },
    setLinePos : function() {
        for(var index = 0; index < this.groupInfo.nodes.length; index++){
            var eachNodeProps = this.groupInfo.nodes[index];
            var left = eachNodeProps.position.col * (this.nodeSize.width);
            var top = eachNodeProps.position.row * (this.get('nodeSize').height);
            var calCol = eachNodeProps.position.col - this.groupInfo.position.col;
            var calRow = eachNodeProps.position.row - this.groupInfo.position.row;
            var currNodeType = eachNodeProps.nodeType;
            if(currNodeType){
                if(currNodeType.indexOf('line') > 0){
                    if(this.isSameRow(eachNodeProps)){
                        if(this.groupInfo.falseLink){
                            var falseLineNodeDetails = this.findDetailsById(this.groupInfo.falseLink);
                            if(getNcmFlowEdgeItems().includes(falseLineNodeDetails.nodeType)){
                                var calWidth = (((falseLineNodeDetails.position.col - this.groupInfo.position.col) - 1) * this.nodeSize.width)  - 34;
                            }
                            else{
                                var falseLineNodeGroupDetails = this.findGroupDetailsById(this.groupInfo.falseLink);
                                var calWidth = (((falseLineNodeGroupDetails.position.col - this.groupInfo.position.col) - 1) * this.nodeSize.width);
                            }
                        }
                        else if(eachNodeProps.nodeType.indexOf('false-line') > -1){
                            var calWidth = (calCol -1 ) * this.nodeSize.width;
                        }
                        eachNodeProps.style.width = calWidth + 14;
                    }
                }
            }
        }
    },
    findGroupDetailsById : function(id){
        for (var i = 0; i < this.groups.length; i++) {
            for(var index = 0; index < this.groups[i].nodes.length; index++){
                if (this.groups[i].nodes[index].id == id) {
                    return this.groups[i];
                }
            }
        }
    },
    findDetailsById : function(id){
        for (var i = 0; i < this.groups.length; i++) {
            for(var index = 0; index < this.groups[i].nodes.length; index++){
                if (this.groups[i].nodes[index].id == id) {
                    return this.groups[i].nodes[index];
                }
            }
        }
    },
    isSameRow : function(cellProps){
        return this.groupInfo.position.row == cellProps.position.row;
    },
    willDestroyElement: function(){
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmWorkflowNodeComponent = Ember.Component.extend({
    nodeSize: { width: 219, height: 47 },
    lineSize: 20,
    cellProps : '',
    left : 0,
    top : 0,
    itemName : '',
    init : function(){
        this._super();
        this.set('itemName', this.groupInfo.operation.details.name); // NO I18N
    },
    didInsertElement : function() {
		this._super();
        this.setPosition();
        var closeAllPopups = function(notCloseId){
            var popups = document.querySelectorAll('#floatingPopupEle'); // NO I18N
            for(var i =0; i < popups.length; i++){
                if(popups[i].parentElement.parentElement.id != notCloseId && !popups[i].matches(':hover') && popups[i].className.indexOf('hide') == -1){
                    popups[i].classList.add('hide');
                }
            }
        };
		closeAllPopups();
        var __self = this;
        var cellId = this.cellProps.id;
        if(this.cellProps.nodeType == 'CONDITION' || this.cellProps.nodeType == 'BLOCK' || this.cellProps.nodeType == 'VIOLATION'){
            $('#' + cellId).off().hover(
                function () {
                    closeAllPopups(cellId);
                    __self.childComponentInstance.rerender();
					$('#' + __self.childComponentInstance.elementId + ' #floatingPopupEle').removeClass('hide'); // NO I18N
                    // __self.childComponentInstance.classNames.removeObject('hide'); // NO I18N
                },
                function () {
                    function checkPopup() {
                        var popupEle = $('#' + cellId + ' #floatingPopupEle'); // NO I18N
                        if(popupEle && popupEle.length > 0){
                            if (!(popupEle[0].matches(':hover') || $('#' + cellId)[0].matches(':hover'))) {
                                // __self.childComponentInstance.classNames.addObject('hide'); // NO I18N
								popupEle.addClass('hide'); // NO I18N
                            } else {
                                setTimeout(checkPopup, 1000);
                            }
                        }
                    }
                    setTimeout(checkPopup, 1000);
                }
            );
        }
        else{
            $('#'+this.cellProps.id).off().hover(
            function () {
                if(__self.cellProps.nodeType.indexOf('line') < 0){
                    closeAllPopups();
                }
            });
        }
        if(this.cellProps.nodeType == 'LOOP' || this.cellProps.nodeType == 'PROCESS'){
            if(!this.groupInfo.operation.details.name || this.groupInfo.operation.details.name == ''){
                this.set('collectNameValue', true); // NO I18N
                this.element.querySelector('.complaince-container .complaince-flow-element').classList.add('hover'); // NO I18N
            }
        }
    },
    setPosition : function(){
        var currNodeType = this.cellProps.nodeType;
        if(currNodeType){
            if(currNodeType.indexOf('line') > 0){
                var element = this.element.querySelector('.complaince-flow-line'); // NO I18N
                element.style.width = this.cellProps.style.width  + 'px';
            }
            else if(currNodeType.indexOf('loop-bottom') > -1 && this.cellProps.style.height){
                var element = this.element.querySelector('.complaince-flow-line'); // NO I18N
                element.style.height = this.cellProps.style.height + 'px';
            }
        }
    },
    actions: {
        childComponentInstance: function(child) {
            if(!this.childComponentInstance){
                this.set('childComponentInstance', child); // NO I18N
            }
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        deleteGroup : function(){
            var __self = this;
            var confirmCallBack = function() {
            	__self.sendAction('action', 'deleteGroup', __self.cellProps.id);// its a groupId actually
            }
            var confirmBody = Ember.I18n.t('ncm.complianceiq.rule.flow.item.delete.confirm'); // NO I18N
            ncmConfirm(null, confirmBody, 400, confirmCallBack);
        },
        editGroup : function(){
            if(this.cellProps.nodeType == 'LOOP' || this.cellProps.nodeType == 'PROCESS'){
                this.set('collectNameValue', true); // NO I18N
            }
            else{
                this.sendAction('action', 'editGroup', this.cellProps.id);// its a groupId actually
            }
        },
        saveNameValue : function(eleId){
            try{
                var currElement = document.getElementById(eleId);
                if (currElement) {
                    var parentEle = currElement.parentElement;
                    var input = parentEle.querySelector('input'); // NO I18N
                    ncmValidateInputField(this.itemName,'#'+input.id);
                }
                this.groupInfo.operation.details.name = this.itemName;
                this.set('collectNameValue', false); // NO I18N
                this.element.querySelector('.complaince-container .complaince-flow-element').classList.remove('hover'); // NO I18N
            }
            catch(error){}
        },
        closeCollectNameValue : function(){
            this.set('collectNameValue', false); // NO I18N
            this.element.querySelector('.complaince-container .complaince-flow-element').classList.remove('hover'); // NO I18N
        },
        showNodeList : function(position){
            var element = document.getElementById('ruleItemList'); // NO I18N
            element.style.visibility = 'hidden'; // NO I18N
            element.style.transition = 'none'; // NO I18N
            element.style.display = 'none'; // NO I18N

            this.sendAction('action', 'updateRuleItemList', this.cellProps.id, position);
            var loopItemId = false;
            if(this.cellProps.nodeType == 'loop-mid-plus'){
                loopItemId = this.groupInfo.id;
            }
            else if(this.cellProps.nodeType == 'loop-bottom-plus'){
                loopItemId = this.groupInfo.id;
            }
            else if (this.groupInfo.loopItemId){
                loopItemId = this.groupInfo.loopItemId;
            }

            element.dataset.info = JSON.stringify({
                cellId : this.cellProps.id,
                loopItemId : loopItemId
            });
            try{
                var plusItem = document.getElementById(this.cellProps.id).querySelector('.complaince-flow-add'); //NO I18N
                var plusItemPositionData = plusItem.getBoundingClientRect();
                var scrollContainer = document.querySelector('.complaince-container'); //NO I18N
                var containerPositionData = scrollContainer.getBoundingClientRect();
                var plusItemTop = plusItemPositionData.top - containerPositionData.top + scrollContainer.scrollTop;
                var plusItemBottom = plusItemPositionData.bottom - containerPositionData.top + scrollContainer.scrollTop;
                var plusItemLeft = plusItemPositionData.left - containerPositionData.left + scrollContainer.scrollLeft;
                var plusItemRight = plusItemPositionData.right - containerPositionData.left + scrollContainer.scrollLeft;

                var top = plusItemBottom;
                var left = plusItemRight + 10;

                var __self = this;

                setTimeout(function(){
					var elementHeight = 344; // height of $('#ruleItemList'), its hidden by default, so we can use static value

					var elementWidth = element.offsetWidth || __self.nodeSize.width;
                    var visibleBottom = scrollContainer.scrollTop + scrollContainer.clientHeight;
                    var visibleRight = scrollContainer.scrollLeft + scrollContainer.clientWidth;

                    if((left + elementWidth) > visibleRight){
                        // if it crosses the visible area on right side we will show it in left of plus
                        left = plusItemLeft - elementWidth - 10;
                    }

                    if((top + elementHeight) > visibleBottom){
                        // if it crosses the screen on bottom side we will show it in top of plus
                        top = plusItemTop - elementHeight;
                    }
                    element.style.top = top + 'px';
                    element.style.left = left + 'px';
                    element.offsetHeight;
                    element.style.visibility = '';
                    element.style.display = 'block';
					element.style.transition = '';
                },10);
            }
            catch(error){
                this.sendAction('action', 'refreshPage');
            }
        }
    },
    willDestroyElement: function(){
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmWorkflowDetailsComponent = Ember.Component.extend({
    collectCommandsList : false,
    header : '',
    saveBtnTitle : '',
    // this stores each edited values, used when variable is edited in certain screen and clicks cancel, we will retrieve the original value from this. initalVariableValues is not used for this purpose.
    originalVariables : [],
    variables : false,
    enableRulePlatform : false,
    enableManualReview : false,
    variableOptions : {},
    commandTemplateVariableUsageNoteMsg : false,
    result : {
        scope : {
            details : {}
        },
        operation : {
            details : {}
        }
    },
    init : function(){
        this._super();
        if(!this.details.isRule){
            this.result.scope = this.details.scope;
            this.result.operation = this.details.operation;
        }
        this.variables.sort(function(a,b){return (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0);});
        this.updateHeadersAndActions();
        if(this.details.filterId){
            this.enableRulePlatform = true;
        }
        if(this.details.isManualReviewRequired){
            this.enableManualReview = true;
        }
        this.createCopy();
        if(this.isStandard || (ncmIsProbeOrProbeSelected() && this.isDistributed)){
            this.set('editNotAllowed', true); // NO I18N
        }
		this.updateMarkAsPublic();
    },
    createCopy : function(){
        for(var index = 0; index < this.variables.length; index++){
            if(!this.variables[index].variableType){
                this.variables[index].variableType = 'USER_INPUT';
            }
        }
        this.originalVariables = jQuery.extend(true, [],this.variables);
    },
    didInsertElement : function() {
		this._super();
		$('.select2').select2();
        $('#flowCommandsList .opmFormHolder').addClass('pr-xlg pb-100');
        document.addEventListener('click', this.validateClassRemover);
		this.sendAction('action', 'workFlowDetailsCompInstance', this);
    },
	updateMarkAsPublic: function () {
		if (!this.isStandard) {
			this.set('showMarkAsPublicCheckbox', true);//No I18N
			if (ncmIsProbeOrProbeSelected() && this.isDistributed) {
				this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.ruleDistributed.msg', this)); // NO I18N
			} else {
				this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.rule.msg', this)); // NO I18N
			}
		} else {
			this.set('showMarkAsPublicCheckbox', false);//No I18N
		}
	},
    validateClassRemover : function(event){
        try{
            if((event.target.className && event.target.className.indexOf('validatingButton') > 0) || (event.target.parentElement && event.target.parentElement.className && event.target.parentElement.className.indexOf('validatingButton') > 0)){
                return;
            }
            var validatedItem = $('.validateField.error');
            validatedItem.removeClass('error');
            $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
        }
        catch(error){}
    },
    getRuleInfoFromUI : function(){
        ncmValidateInputField(this.details.name, '#ruleNameField'); // NO I18N
        return {
            ruleName : this.details.name,
            ruleDescription : this.details.description
        }
    },
	iterateEachItemAndUpdateVariableUsage : function(isValidate){
		OPMClient.NCMComplianceUtilController.iterateEachItemAndUpdateVariableUsage(this, isValidate);
	},
    actions: {
        childComponentInstance: function(child) {
            this.set('childComponentInstance', child); // NO I18N
            if(this.details.operation.type == 'BLOCK' || this.details.operation.type == 'CONDITION'){
            	this.variableOptions.childComponentInstance = child;
                this.variableOptions.type = this.details.operation.type;
            }
            else{
                this.variableOptions = false;
            }
        },
        rulePlatformInstance : function(child){
            this.set('rulePlatformInstance', child); // NO I18N
        },
        violationInstance : function(child){
            this.set('violationInstance', child); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        patternVariableUpdate : function(criteriaList){
             if(criteriaList){
                var currentVariables = this.getPatternVariables(criteriaList);
                this.updateDataToVariable(currentVariables);
            }
        },
        commandsListInstance: function(child) {
            this.set('commandsListInstance', child); // NO I18N
        },
        commandTemplateTestInstance: function(child) {
            this.set('commandTemplateTestInstance', child); // NO I18N
        },
        blockInputVariableUpdate : function(input){
            var parsedVariables = getVariablesFromContent(input);
            this.updateDataToVariable(parsedVariables);
        },
        createNewTemplate : function(element){
            element.style.display = 'none';
            $('#flowCommandsList').css('display', 'block');
            $('.flowRule_helpcard_variables').addClass('flowCommandDetails');
            this.set('viewCommandTemplate', false); // NO I18N
            $('.testCommandTemplate').show();
            this.collectCommandsList = element;
			this.set('markAsPublicMap', OPMClient.NCMComplianceTemplatesController.getMarkAsPublicDetails(true, false, false, true)); // NO I18N
            this.set('commandTemplateDetails', false); // No I18N
            $('#commandTemplateInfoMsg').show();
            this.updateHeadersAndActions();
            this.populateCommandTemplateVariableUsageNoteMsg();
        },
        viewTemplate : function(element){
            element.style.display = 'none';
            $('#flowCommandsList').css('display', 'block');
            $('.flowRule_helpcard_variables').addClass('flowCommandDetails');
            this.collectCommandsList = element;
            this.set('viewCommandTemplate', true); // NO I18N
            var commandTemplateDetails = OPMClient.NCMComplianceTemplatesController.loadTemplateDetails(this.childComponentInstance.scopeInstance.selectedCommand);
            commandTemplateDetails.templateId = this.childComponentInstance.scopeInstance.selectedCommand;
            if(commandTemplateDetails.isStandard){
                this.set('showCmdTemplateNoteMessage', Ember.I18n.t('ncm.complianceiq.ee.dist.edit.command_template.not_allowed.standard.msg')); // NO I18N
            }
			this.set('markAsPublicMap', OPMClient.NCMComplianceTemplatesController.getMarkAsPublicDetails(false, commandTemplateDetails.isPublic, commandTemplateDetails.isDistributed, true)); // No I18N
            this.set('commandTemplateDetails', commandTemplateDetails); // No I18N
            $('#commandTemplateInfoMsg').show();
            $('.saveBtn').hide();
            $('.testCommandTemplate').show();
            this.updateHeadersAndActions();
            this.populateCommandTemplateVariableUsageNoteMsg();
        },
        testCommandTemplate : function(){
            if(this.commandsListInstance){
                try{
					if(this.commandTemplateTestInstance){
						this.commandTemplateTestInstance.set('showContent', false); // NO I18N
						this.commandTemplateTestInstance.set('configContent', false); // NO I18N
						this.commandTemplateTestInstance.set('errorMsg', false); // NO I18N
					}
                    OPMClient.NCMComplianceTemplatesController.testDetails = {};
                    if(this.commandTemplateDetails && this.commandTemplateDetails.templateId){
                        OPMClient.NCMComplianceTemplatesController.testDetails.templateId = this.commandTemplateDetails.templateId;
                    }
                    else{
                        OPMClient.NCMComplianceTemplatesController.testDetails.commands = this.commandsListInstance.saveData();
                    }
                    slideInWithId('templateTestView'); // NO I18N
                    $('.flowCommandDetails').find('.slide-overlay').remove();
                }
                catch(error){}
            }
        },
        cancel : function(){
            $('.saveBtn').show();
            if(this.collectCommandsList){
                this.hideCommandTemplatePage();
            }
            else{
                this.set('variables',jQuery.extend(true, [],this.originalVariables)); //NO I18N
                this.sendAction('action', this.isRule ? 'closeRule' : 'cancelDetails',this.details.id);
            }
        },
        save : function(){
            try{
                if(this.collectCommandsList){ // Command template page information's handling
                    if(this.commandsListInstance){
                        try{
                            var result = this.commandsListInstance.saveData();
                            OPMClient.NCMComplianceTemplatesController.updateCommandTemplate(this.commandsListInstance.templateName, this.commandsListInstance.templateDesc, this.templateId, false, result);
                            this.hideCommandTemplatePage();
                            if(this.childComponentInstance && this.childComponentInstance.scopeInstance){
                                this.childComponentInstance.scopeInstance.getCommandTemplates(this.commandsListInstance.templateName);
                            }
                        }
                        catch(error){}
                    }
                }
                else if(this.details.isRule){ // Rule level information's handling
                    var result = this.getRuleInfoFromUI();
                    if(!this.enableRulePlatform){
                        if(result.rulePlatform){
                            delete result.rulePlatform;
                        }
                    }
                    else if(this.rulePlatformInstance){
                        result.rulePlatform = JSON.stringify(this.rulePlatformInstance.saveData());
                    }
                    result.isManualReviewRequired = this.enableManualReview;
					if (this.isPublic) {
						result.markAsPublic = true;
					}
                    this.sendAction('action', 'saveRule', result);
                }
                else{// Item|Group page information's handling

                    var childIns = this.childComponentInstance;
                    if(this.violationInstance){
                        childIns = this.violationInstance;
                    }
                    if(childIns){
                        $('.variables-card .error-tooltip').hide();
						var copyVariables = jQuery.extend(true, [],this.variables);
                        for(var index = 0; index < copyVariables.length; index++){ // Validating variable values
                            try{
								// copyVariables[index].isTemp = false;
                                ncmValidateInputField(copyVariables[index].value);
                            }
                            catch(error){
                                $('.variables-card .error-tooltip').show();
                                return;
                            };
                        }
						this.set('variables', copyVariables); // NO I18N
                        var childResult = {};
                        if(this.violationInstance){
                            childResult.operation = {
                                type : 'VIOLATION', // NO I18N
                                details : childIns.saveData()
                            }
                        }
                        else{
							this.iterateEachItemAndUpdateVariableUsage();
                            childResult = childIns.saveData(true,false);
                        }

						if(this.getUnusedVariables().length > 0){
							var okCallBack = function() {
								this.removeUnusedVariables(jQuery.extend(true, [],this.variables));
								this.sendAction('action', 'saveGroupInfo', this.details.id, childResult);
							}.bind(this);
							ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.delete.confirm', this), okCallBack, false, Ember.I18n.t('webclient.opm.confirm.ok',this), false); // NO I18N
						}
						else{
							this.sendAction('action', 'saveGroupInfo', this.details.id, childResult);
						}
					}
				}
            }
            catch(error){
				// console.error('Error while saving details: ', error);
			}
        },
        updateEnableRulePlatform : function(){
            this.set('enableRulePlatform', !this.enableRulePlatform); // NO I18N
        },
        updateManualReview : function(){
            this.set('enableManualReview', !this.enableManualReview); // NO I18N
        },
        addNewVariable : function(variableObj){
            var tVar = jQuery.extend(true, [],this.variables);
            tVar.push(variableObj);
            this.set('variables', tVar); // NO I18N
        },
        saveVariableOnly : function(variablesList){
            var variableInfo = {};
            variableInfo.ruleId = this.ruleId;
            var updatedVariables = [];
            for(var index = 0; index < variablesList.length; index++){
                var tVarObj = {
                    id : variablesList[index].id,
                    displayName : variablesList[index].displayName,
                    description : variablesList[index].description,
                    value : variablesList[index].value,
                    variableType : variablesList[index].variableType,
                    isGlobal : variablesList[index].isGlobal
                }
                updatedVariables.push(tVarObj);
            }
            variableInfo.variables = JSON.stringify(updatedVariables);;
            var response = ncmReplaceParamsAndMakeApi("/ncmcompliance/updateRuleVariable",variableInfo); // NO I18N
            if(response.isSuccess){
                opm_infoMsgs("successMsg", response.msg); // No I18N
            }
            else if(response !== undefined && response.error !== undefined) {
                opm_infoMsgs("errorMsg", response.error.message);//No I18N
            }
            else{
                opm_infoMsgs("errorMsg", response.msg); // No I18N
            }
        },
        deleteVariable : function(variableId){
			var __self = this;
			var variableObj = this.variables.find(function(variable) {
				return variable.id == variableId;
			});
			if(!variableObj){
				return;
			}
			if(this.getAllVariablesUsed().includes(variableObj.name)){
				OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('ncm.complianceiq.rule.flow.variable.delete.alert')); // NO I18N
				return;
			}
			var okCallBack = function(){
				var tVar = jQuery.extend(true, [],__self.variables);
				for(var i = 0; i < tVar.length; i++){
					if(tVar[i].id == variableId){
						tVar.splice(i, 1);
						break;
					}
				}
				__self.set('variables', tVar); // NO I18N
			};
			ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm_delete'), okCallBack, false, Ember.I18n.t('webclient.opm.confirm.ok',this), Ember.I18n.t("webclient.action.Cancel")); // NO I18N
        },
		markAsPublic: function () {
			this.set('isPublic', !this.isPublic);//NO I18N
			var __self = this;
			setTimeout(function () {
				$('input[name=markAsPublic]').prop('checked', __self.isPublic);
			}, 10);
		}
    },
	getAllVariablesUsed: function(){
        return OPMClient.NCMComplianceUtilController.getAllVariablesUsed(this, true);
    },
	getPatternVariables : function(criteriaList){
        return OPMClient.NCMComplianceUtilController.getPatternVariables(criteriaList);
    },
	iterateEachItemAndUpdateVariableUsage : function(isValidate){
		OPMClient.NCMComplianceUtilController.iterateEachItemAndUpdateVariableUsage(this, isValidate, false);
	},
	populateCommandTemplateVariableUsageNoteMsg : function(){
        var variableName = '$VARIABLE_NAME'; // NO I18N
        if(this.variables && this.variables.length > 0){
            variableName = this.variables[0].name;
        }
        this.set('commandTemplateVariableUsageNoteMsg', Ember.I18n.t('ncm.complianceiq.command_template.rule.variable_use.note2', {param0 : variableName})); // NO I18N
	},
    hideCommandTemplatePage: function(){
        $('#flowCommandsList').css('display', 'none');
        this.set('showCmdTemplateNoteMessage', false); // NO I18N
        $('.flowRule_helpcard_variables').removeClass('flowCommandDetails');
        $('.testCommandTemplate').hide();
        this.set('viewCommandTemplate', false); // NO I18N
		this.set('markAsPublicMap', false); // NO I18N
        this.set('commandTemplateDetails', false); // NO I18N
        $('#commandTemplateInfoMsg').hide();
        this.collectCommandsList.style.display = 'block';
        this.collectCommandsList = false;
        if(this.staticData){ // Clearing old commandTemplates in staticData to get the latest
            this.set('staticData.commandTemplates', false);  // NO I18N
        }
        this.commandsListInstance.rerender();
        this.updateHeadersAndActions();
    },
    updateDataToVariable:function(currentVariables){
        if(currentVariables){
            var isNewVariable = function(variableName, list){
                for(var j = 0; j < list.length; j++){
                    var eachVariable = list[j];
                    if(eachVariable.name == variableName){
                        return false;
                    }
                }
                return true;
            }.bind(this);
            var copyVariables = [];
			var currentUsedVariables = this.getAllVariablesUsed();
			for(var i = 0; i < this.variables.length; i++){
				var eachVariable = this.variables[i];
				if(eachVariable.isGlobal || currentUsedVariables.includes(eachVariable.name) || currentVariables.includes(eachVariable.name) || eachVariable.userAdded){
					copyVariables.push(eachVariable);
				}
			}
            for(var i = 0; i < currentVariables.length; i++){
                if(isNewVariable(currentVariables[i], this.variables) && isNewVariable(currentVariables[i], copyVariables)){
                    changeDetected = true;
                    var dataToPush = this.getInitialVariableValue(currentVariables[i]);
                    if(!dataToPush){
                        dataToPush = ncmCreateComplianceVariable(currentVariables[i]);
                    }
                    copyVariables.push(dataToPush);
                }
            }
            if(copyVariables){
                // this.removeUnusedVariables(copyVariables);
				copyVariables.sort(function(a,b){return (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0);});
            	this.set('variables', copyVariables); // NO I18N
            }
			this.iterateEachItemAndUpdateVariableUsage();
        }
    },
    getInitialVariableValue : function(variableName){
        for(var i = 0; i < this.originalVariables.length; i++){
            if(this.originalVariables[i].name == variableName){
                return this.originalVariables[i];
            }
        }
        return false;
    },
    removeUnusedVariables : function(copyVariables){
        var removeUnused = function(allVariablesInRule, list){
            var copy = [];
            for(var j = 0; j < list.length; j++){
                var eachVariable = list[j];
                if(allVariablesInRule.includes(eachVariable.name) || eachVariable.isGlobal){
                    copy.push(eachVariable);
                }
                else if(!eachVariable.isGlobal){
                    continue;
                }
                // else if(!eachVariable.isTemp){
                //     copy.push(eachVariable);
                // }
            }
            return copy;
        }.bind(this);
        copyVariables = removeUnused(this.getAllVariablesUsed(), copyVariables);
        if(copyVariables){
            copyVariables.sort(function(a,b){return (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0);});
            this.set('variables', copyVariables); // NO I18N
        }
    },
	getUnusedVariables : function(){
		// Returns an array of variables that are not used in the rule
		var allUsedNames = this.getAllVariablesUsed();
		return (this.variables || []).filter(function(variable) {
			// Ignore global variables
			if (variable.isGlobal) {
			    return false;
			}
			// If not found in used names, it's unused
			return !allUsedNames.includes(variable.name);
		});
	},
    // getUnusedVariablesTemporary : function(){
	// 	var copyVariables = jQuery.extend(true, [],this.variables);
    //     var removeUnused = function(allVariablesInRule, list){
    //         var copy = [];
    //         for(var j = 0; j < list.length; j++){
    //             var eachVariable = list[j];
    //             eachVariable.isUsed = false;
    //             if(allVariablesInRule.includes(eachVariable.name)){
    //                 eachVariable.isUsed = true;
    //                 copy.push(eachVariable);
    //             }
    //             else if(!eachVariable.isGlobal){
    //                 continue;
    //             }
    //             else if(!eachVariable.isTemp){
    //                 copy.push(eachVariable);
    //             }
    //         }
    //         return copy;
    //     }.bind(this);
    //     copyVariables = removeUnused(this.getAllVariablesUsed(), copyVariables);
    //     var unusedVariables = [];
	// 	var tVariables = jQuery.extend(true, [],this.variables);
	// 	for(var i = 0; i < tVariables.length; i++){
	// 		var isUsed = false;
	// 		if(tVariables[i].isGlobal || tVariables[i].isTemp){
	// 			continue; // No need to check global or temp variables
	// 		}
	// 		for(var j = 0; j < copyVariables.length; j++){
	// 			if(tVariables[i].name == copyVariables[j].name){
	// 				isUsed = true;
	// 				break;
	// 			}
	// 		}
	// 		if(!isUsed){
	// 			unusedVariables.push(tVariables[i]);
	// 		}
	// 	}
	// 	return unusedVariables;
    // },
    updateHeadersAndActions : function(){
        var saveBtnTitle = Ember.I18n.t('ncm.complianceiq.rules.save_details'); // NO I18N
        var header = Ember.I18n.t('ncm.complianceiq.rules.details.title'); // NO I18N
        if(this.collectCommandsList){
            if(this.viewCommandTemplate){
                header = Ember.I18n.t('ncm.complianceiq.rules.command_template.view.title'); // NO I18N
            }
            else{
                header = Ember.I18n.t('ncm.complianceiq.rules.command_template.create.title'); // NO I18N
            }
        }
        else if(this.details.isRule){
            saveBtnTitle = Ember.I18n.t('ncm.complianceiq.rules.save'); // NO I18N
        }
        else if(this.details.operation.type == 'BLOCK'){
            header = Ember.I18n.t('ncm.complianceiq.rule.block.add.title'); // NO I18N
        }
        else if(this.details.operation.type == 'CONDITION'){
            header = Ember.I18n.t('ncm.complianceiq.rule.condition.add.title'); // NO I18N
            saveBtnTitle = Ember.I18n.t('ncm.complianceiq.rule.condition.save'); // NO I18N
        }
        else if(this.details.operation.type == 'VIOLATION'){
            header = Ember.I18n.t('ncm.complianceiq.rule.violation.add.title'); // NO I18N
        }
        this.set('saveBtnTitle', saveBtnTitle); // NO I18N
        this.set('header', header); // NO I18N
    },
    willDestroyElement: function(){
        document.removeEventListener('click', this.validateClassRemover);
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmRulePopupInfoComponent = Ember.Component.extend({
    classNames: [''], // NO I18N
    remediationConfigletSelected : false,
    scopeDisplayName : false,
    init : function(){
        this._super();
        this.loadRemediationDetails();
        if(this.popupInfo && this.popupInfo.scope && this.popupInfo.scope.type){
            this.scopeDisplayName = OPMClient.NCMComplianceUtilController.getScopeDisplayName(this.popupInfo.scope.type);
        }
    },
    loadRemediationDetails : function(){
        if(!window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite){
            return
        }
        if(this.popupInfo && this.popupInfo.operation.type == 'VIOLATION' && this.popupInfo.operation.details.remediationConfiglet != 0){
            var remediationConfiglets = [];
            if(this.staticData && this.staticData.remediationConfiglets){
                remediationConfiglets = this.staticData.remediationConfiglets;
            }
            else{
                var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/listAllConfiglets?HIDE_PROG_CONFIGLET=false'; //No I18N
                var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
                var configlets = jsonData.rows;
                remediationConfiglets.push({
                    key : -1,
                    value : 'none' // NO I18N
                });
				remediationConfiglets = remediationConfiglets.concat(
					configlets.map(function(v) {
						return {
							key: v.id,
							value: v.cell[1]
						};
					})
				);
                if(this.staticData){
                    this.set('staticData.remediationConfiglets', remediationConfiglets); // NO I18N
                }
            }
            this.loadConfigletName(remediationConfiglets, this.popupInfo.operation.details.remediationConfiglet);
        }
    }.observes('popupInfo.operation.details.remediationConfiglet'), // NO I18N
    loadConfigletName : function(remediationConfiglets, configletId){
        for(var i = 0; i < remediationConfiglets.length; i++){
            if(remediationConfiglets[i].key == configletId){
                this.set('remediationConfigletSelected', remediationConfiglets[i].value);
            }
        }
    },
	didInsertElement: function () {
		this._super();
        this.sendAction('action', 'childComponentInstance', this);
        if(this.popupInfo && this.popupInfo.operation && this.popupInfo.operation.details){
            var tDetails = this.popupInfo.operation.details;
            if(this.popupInfo.operation.type == 'VIOLATION' && ((!tDetails.violationMessage || tDetails.violationMessage == '') && (!tDetails.remediationProcedure || tDetails.remediationProcedure == ''))){
                if(!window.OPM.userPermissions.ncmDevMgmtWrite || (!tDetails.remediationConfiglet || tDetails.remediationConfiglet < 1)){
                    $('#'+this.elementId).addClass('hide'); // NO I18N
                    return;
                }
            }
        }
		this.updatePos();
	},
	updatePos : function () {
		var element = this.element.children[0].closest('.floating-popup');
		if(element){
            var left = this.popupInfo.style.left;
            var top = this.popupInfo.style.top + 50;
            var scrollContainer = document.querySelector('.complaince-container'); //NO I18N
            var containerPositionData = scrollContainer.getBoundingClientRect();
            if((left + 500) > containerPositionData.right){
                left = left - 500 + 216;
            }
            if((left + 500) > containerPositionData.right){
                left = left - 500 + 280;
            }

            if(scrollContainer.scrollLeft > left){
                left = left + 216;
            }
            var popupHeight = $('#'+this.popupInfo.id+' .floating-popup').height();
            if((top + popupHeight + 55 - scrollContainer.scrollTop) > containerPositionData.height){
                top = top - popupHeight - 55; // Moving to top, 55 represents the gap the between popup and the element
            }

            if(scrollContainer.scrollTop > (top + 55)){
                top = top + 50 + popupHeight;
            }
            top = top - 15;
		    element.style.left = left  + 'px';
            element.style.top = top  + 'px';
		}
	},
	updatePosListener : function() {
		var __self = this;
		if(!OPMClient.NCMComplianceRulesController.errorNodeId || OPMClient.NCMComplianceRulesController.errorNodeId != this.popupInfo.id){
			return;
		}
		var element = false;
		// Retry to find the element in case it is not available immediately after insertion
		var retryCount = 0;
		var checkElement = function() {
			element = __self.element.children[0].closest('.floating-popup');
			retryCount++;
			if (element) {
				__self.updatePos();
			} else if (retryCount < 10) {
				setTimeout(checkElement, 100); // Retry after 100ms
			}
		}
		setTimeout(checkElement, 100);
	}.observes('OPMClient.NCMComplianceRulesController.errorNodeId'),//No I18N
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmWorkflowConditionDetailsComponent = Ember.Component.extend({
    name : '',
    contentType : 'TEXT', // NO I18N
    xPath : '',
    init : function(){
        this._super();
        this.createCopy();
    },
    didInsertElement : function() {
		this._super();
		$('.select2').select2();
        this.sendAction('action', 'childComponentInstance', this);
        if(!this.contentType){
            this.contentType = 'TEXT'; // NO I18N
        }
        $("input[name=contentType][value="+this.contentType+"]").prop("checked",true);
        var __self = this;
        $('input[type="radio"][name="contentType"]').off('click').on('click', function(e){
            __self.set('contentType', $('input[name=contentType]:checked').val()); // NO I18N
        });
    },
    createCopy : function(){
        this.name = this.name1; // getting name1 as input instead of populating data from groupProps is to improve reusability of this component
        this.xPath = this.xPath1;
    },
    saveData:function(isValidate, updateInput){
        if(isValidate == undefined){
            isValidate = true; // we will validate by default. Pass false to skip
        }
        if(isValidate){
            ncmValidateInputField(this.name, '#nameField'); // NO I18N
            if(this.contentType == 'XML'){ // NO I18N
                ncmValidateInputField(this.xPath, '#xPath'); // NO I18N
            }
        }
        var result = jQuery.extend(true, {},this.groupProps);
        if(this.criteriaListInstance){
            var selCriteria = this.criteriaListInstance.saveData(isValidate);
            result.operation.details.criteria = selCriteria;
        }
        result.operation.details.name = this.name;
        result.operation.details.xPath = this.xPath;
        if(this.scopeInstance){
            result.scope = this.scopeInstance.saveData(isValidate).scope;
        }
        result.operation.details.contentType = $('input[name=contentType]:checked').val();
        return result;
    },
    actions: {
        criteriaListInstance: function(child) {
          this.set('criteriaListInstance', child); // NO I18N
        },
        scopeInstance: function(child) {
          this.set('scopeInstance', child); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        createNewTemplate : function(){
            this.sendAction('action', 'createNewTemplate', this.element);
        },
        viewTemplate : function(){
            this.sendAction('action', 'viewTemplate', this.element);
        },
        patternVariableUpdate : function(criteriaList){
            this.sendAction('action', 'patternVariableUpdate', criteriaList);
        }
    }
});
OPMClient.NcmWorkflowScopeSelectionComponent = Ember.Component.extend({
    defaultScopes : [],
    devicePropsList : [],
    derivedVariablesList : [],
    commandsList : false,
    selectedScope : false,
    selectedCommand : false,
    selectedField : false,
    selectedVariable : false,
    resultCopy : {},
    init : function(){
        this._super();
        this.createCopy();
        this.populateDefaultDerivedVariables();
        this.populateDefaultScopes();
        if(this.selectedScope == "COMMAND_OUTPUT"){
            this.scopeUpdated();
        }
        if(this.selectedScope == "DEVICE_PROPS"){
            this.populateDefaultDeviceProps();
        }
    },
    createCopy : function(){
        this.selectedScope = this.groupProps.scope.type;
        if(this.groupProps.scope.details){
            this.selectedCommand = this.groupProps.scope.details.commandTemplatedId;
            this.selectedField = this.groupProps.scope.details.selectedField;
        }
        this.resultCopy = jQuery.extend(true, {},this.groupProps);
    },
    didInsertElement : function() {
		this._super();
		$('.select2').select2();
        this.sendAction('action', 'scopeInstance', this);
    },
    saveData:function(){
        this.resultCopy.scope.type = this.selectedScope;
        if(!this.resultCopy.scope.details){
            this.resultCopy.scope.details = {};
        }
        if(this.selectedScope == 'COMMAND_OUTPUT'){
            if(this.selectedCommand == 0){
                throw new Error('command not selected'); // NO I18N
            }
            this.resultCopy.scope.details.commandTemplatedId = this.selectedCommand;
        }
        if(this.selectedScope == 'DEVICE_PROPS'){
            this.resultCopy.scope.details.selectedField = this.selectedField;
        }
        if(this.selectedScope == 'VARIABLES'){
            this.resultCopy.scope.details.selectedVariable = this.selectedVariable;
        }
        return this.resultCopy;
    },
    actions : {
        createNewTemplate : function(){
            this.sendAction('action', 'createNewTemplate');
        },
        viewTemplate : function(){
            this.sendAction('action', 'viewTemplate');
        }
    },
    populateDefaultScopes : function(){
        if(this.defaultScopes.length > 0){
            this.defaultScopes = [];
        }
        if(this.groupProps.showBlockScope){
            this.defaultScopes.push(
                {
                    key : 'BLOCK_OUTPUT', // NO I18N
                    value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('BLOCK_OUTPUT') // NO I18N
                }
            );
        }
        this.defaultScopes.push(
            {
                key : 'RUNNING', // NO I18N
                value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('RUNNING') // NO I18N
            },
            {
                key : 'STARTUP', // NO I18N
                value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('STARTUP') // NO I18N
            },
            {
                key : 'COMMAND_OUTPUT', // NO I18N
                value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('COMMAND_OUTPUT') // NO I18N
            }
        );
        if(this.groupProps.operation.type == 'CONDITION'){
            this.defaultScopes.push(
                {
                    key : 'DEVICE_PROPS', // NO I18N
                    value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('DEVICE_PROPS') // NO I18N
                }
            );
        }
        if(this.derivedVariablesList.length > 0){
            this.defaultScopes.push(
                {
                    key : 'VARIABLES', // NO I18N
                    value : OPMClient.NCMComplianceUtilController.getScopeDisplayName('VARIABLES') // NO I18N
                }
            );
        }
        if(!this.selectedScope){
            this.selectedScope = this.defaultScopes[0].key; // Assigning first id of defaultScopes list by default.
        }
    },
    populateDefaultDeviceProps : function(){
        if(this.devicePropsList.length > 0){
            return;
        }
        if(this.staticData && this.staticData.devicePropsList){
            this.set('devicePropsList', this.staticData.devicePropsList); // NO I18N
            return;
        }
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getFlowScopeDeviceFields'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        if(jsonData.isSuccess && jsonData.columnsList && jsonData.columnsList.length > 0){
            this.set('devicePropsList', jsonData.columnsList); // NO I18N
            if(this.staticData){
                this.set('staticData.devicePropsList', this.devicePropsList); // NO I18N
            }
        }
        if(!this.selectedField){
            this.selectedField = this.devicePropsList[0].id; // Assigning first id of devicePropsList list by default.
        }
    },
    populateDefaultDerivedVariables : function(){
        if(this.derivedVariablesList.length > 0){
            this.derivedVariablesList = [];
        }
        if(this.variables){
            var copyVariables = jQuery.extend(true, [],this.variables);
            for(var i = 0; i < copyVariables.length; i++){
                var variable = copyVariables[i];
                if(variable.variableType == 'DERIVED'){
                    this.derivedVariablesList.push({
                        value : variable.name
                    });
                }
            }
        }
        if(!this.selectedVariable && this.derivedVariablesList.length > 0){
            this.selectedVariable = this.derivedVariablesList[0].value; // Assigning first id of derivedVariablesList list by default.
        }
    },
    getCommandTemplates : function(selectedName){
        var list = [];
        if(this.staticData && this.staticData.commandTemplates){
            list = this.staticData.commandTemplates;
        }
        else{
            var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getCommandTemplates'; //No I18N
            var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
            list = jsonData.rows;
//            if(this.staticData){
//                this.set('staticData.commandTemplates', list); // NO I18N
//            }
        }

        var templateDetails = [];
        if(list && list.length > 0){
            for(var i = 0; i < list.length; i++){
                templateDetails.push(
                    {
                        key : list[i].id,
                        label : list[i].TEMPLATE_NAME
                    }
                );
                if(selectedName == list[i].TEMPLATE_NAME){
                    this.set('selectedCommand',list[i].id);
                }
            }
            if(list.length > 0 && !this.selectedCommand){
                this.selectedCommand = list[0].id; // Assigning first id of command template list by default.
            }
            this.set('showCommandViewIcon', true); // NO I18N
        }
        else{
            templateDetails.push(
                {
                    key : '-1', // NO I18N
                    label : 'Not Available' // NO I18N
                }
            );
            this.set('showCommandViewIcon', false); // NO I18N
        }
        this.set('commandsList',templateDetails); // NO I18N
    },
    scopeUpdated : function(){
        if(this.selectedScope){
            var selectedScopeObj = {
                type : this.selectedScope
            }
            if(this.selectedScope == 'COMMAND_OUTPUT'){
                this.getCommandTemplates();
            }
            else if(this.selectedScope == 'DEVICE_PROPS'){
                this.populateDefaultDeviceProps();
            }
        }
    }.observes('selectedScope') // NO I18N
});
OPMClient.NcmWorkflowBlockDetailsComponent = Ember.Component.extend({
//    outputType : false,
    name : '',
    startBlock : '',
    xPath : '',
    endBlock : '',
    parseType : false,
    indentation : false,
    useIndentation : false,
    parseTypeSingle : false,
    contentType : 'TEXT', // NO I18N
    endBlockNeeded : true,
    enableBlockIdentificationCriteria : false,
	initialVariables : [],
    init : function(){
        this._super();
        this.createCopy();
        if(this.groupProps.operation.details.criteria && this.groupProps.operation.details.criteria.criteriaList && this.groupProps.operation.details.criteria.criteriaList.length > 0){
            this.set('enableBlockIdentificationCriteria', true); // NO I18N
        }
        if(!this.contentType){
            this.contentType = 'TEXT'; // NO I18N
        }
    },
    didInsertElement : function() {
		this._super();
		$('.select2').select2();
		this.populateSelections();
		this.sendAction('action', 'childComponentInstance', this);
		var __self = this;
        $('input[type="radio"][name="parseType"]').off('click').on('click', function(e){
            __self.set('parseTypeSingle', $('input[name=parseType]:checked').val()=='SINGLE'); // NO I18N
        });
        $('input[type="radio"][name="contentType"]').off('click').on('click', function(e){
            __self.set('contentType', $('input[name=contentType]:checked').val()); // NO I18N
		   Ember.run.scheduleOnce('afterRender', __self, function() { //NO I18N
                __self.populateSelections();
            });
        });
        $("input[name=enableBlockIdentificationCriteria]").prop("checked",this.enableBlockIdentificationCriteria);
    },
    createCopy : function(){
        this.name = this.name1;
        this.startBlock = this.startBlock1;
        this.xPath = this.xPath1;
        this.endBlock = this.endBlock1;
		this.initialVariables = jQuery.extend(true, [],this.variables);
    },
    populateSelections: function(){
        if(!this.parseType){
            this.parseType = 'MULTI'; // NO I18N
        }
        $("input[name=parseType][value="+this.parseType+"]").prop("checked",true);
        $("input[name=contentType][value="+this.contentType+"]").prop("checked",true);
        $("input[name=indentation][value="+this.indentation+"]").prop("checked",true);
        this.set('parseTypeSingle', this.parseType == 'SINGLE'); // NO I18N
        if(this.indentation){
            this.set('useIndentation', true); // Avoid binding the variables here. // NO I18N
            $("input[name=useIndentation]").prop("checked",true);
        }
    },
    saveData : function(isValidate, forHelp){
        if(isValidate == undefined){
            isValidate = true; // we will validate by default. Pass false to skip
        }
        if(isValidate){
            ncmValidateInputField(this.name, '#nameField'); // NO I18N
            if(this.contentType == 'TEXT'){ // NO I18N
                ncmValidateInputField(this.startBlock, '#startBlock'); // NO I18N
            }
            else if(this.contentType == 'XML'){ // NO I18N
                ncmValidateInputField(this.xPath, '#xPath'); // NO I18N
            }
        }
        var result = jQuery.extend(true, {},this.groupProps);
		result.operation.details = {};
		var callBackContent = '';
		var callBackVariableName = '';
		var __self = this;
		var okCallBackStartBlockUpdate = function(){
			__self.set('startBlock',ncmEnsureVariableParentheses(callBackContent, callBackVariableName)); // NO I18N
		};
		var okCallBackEndBlockUpdate = function(){
			__self.set('endBlock',ncmEnsureVariableParentheses(callBackContent, callBackVariableName)); // NO I18N
		};
		var ensureVariablesAreEnclosed = function () {
			var variableCopy = jQuery.extend(true, [],__self.variables);
			for (var i = 0; i < variableCopy.length; i++) {
				// var addedVariable = variableCopy[i];
				if (variableCopy[i].variableType == 'DERIVED' && (!variableCopy[i].createdBy || (variableCopy[i].createdBy.id == __self.groupProps.id))) {
					if (ncmCheckContains(__self.startBlock, variableCopy[i].name)) {
						var needToEnclose = !ncmIsVariableProperlyEnclosed(__self.startBlock, variableCopy[i].name);
						if(needToEnclose){
							if(forHelp){
								result.operation.details.startBlock = ncmEnsureVariableParentheses(__self.startBlock, variableCopy[i].name);
							}
							else if(isValidate){
								callBackContent = __self.startBlock;
								callBackVariableName = variableCopy[i].name;
								ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 : variableCopy[i].name}, this), okCallBackStartBlockUpdate, false, Ember.I18n.t('webclient.opm.confirm.ok',this), Ember.I18n.t("webclient.action.Cancel")); // NO I18N
								throw new Error(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 : variableCopy[i].name}, this)); // NO I18N
							}
						}
					}
					if (__self.endBlock && ncmCheckContains(__self.endBlock, variableCopy[i].name)) {
						var needToEnclose = !ncmIsVariableProperlyEnclosed(__self.endBlock, variableCopy[i].name);
						if(needToEnclose){
							if(forHelp){
								result.operation.details.endBlock = ncmEnsureVariableParentheses(__self.endBlock, variableCopy[i].name);
							}
							else if(isValidate){
								callBackContent = __self.endBlock;
								callBackVariableName = variableCopy[i].name;
								ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 : variableCopy[i].name}, this), okCallBackEndBlockUpdate, false, Ember.I18n.t('webclient.opm.confirm.ok',this), Ember.I18n.t("webclient.action.Cancel")); // NO I18N
								throw new Error(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 : variableCopy[i].name}, this)); // NO I18N
							}
						}
					}
				}
			}
			// if(variableUpdate){
			// 	__self.set('variables', variableCopy);
			// }
		};

		var selectedContentType = $('input[name=contentType]:checked').val();
		if(selectedContentType == 'TEXT'){ // NO I18N
            this.xPath = '';
		    ensureVariablesAreEnclosed();
        }
        else if(selectedContentType == 'XML'){ // NO I18N
            this.startBlock = '';
            this.endBlock = '';
            $("input[name=indentation]").prop("checked",false);
            $("input[name=parseType][value=MULTI]").prop("checked",true);
        }

		var selCriteria = false;

		var startBlockT = this.startBlock;
		var xPathT = this.xPath;
		var endBlockT = this.endBlock;
		if(forHelp){
			if(result.operation.details.startBlock){
				startBlockT = result.operation.details.startBlock;
			}
			if(result.operation.details.endBlock){
				endBlockT = result.operation.details.endBlock;
			}
		}

        result.operation.details = {
            name : this.name,
            startBlock : startBlockT,
            xPath : xPathT,
            endBlock : endBlockT,
            parseType : $('input[name=parseType]:checked').val(),
            contentType : $('input[name=contentType]:checked').val(),
            indentation : $("input[name=useIndentation]").prop("checked")
        }
        if(!this.enableBlockIdentificationCriteria){
            delete result.operation.details.criteria;
        }
        else if(this.criteriaListInstance){
            if(!selCriteria){
                selCriteria = this.criteriaListInstance.saveData(isValidate, forHelp);
            }
            result.operation.details.criteria = selCriteria;
        }
        if(this.scopeInstance){
            result.scope = this.scopeInstance.saveData(isValidate, forHelp).scope;
        }
        return result;

    },
    actions: {
        criteriaListInstance: function(child) {
            this.set('criteriaListInstance', child); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        scopeInstance: function(child) {
          this.set('scopeInstance', child); // NO I18N
        },
        updateCriteria: function(updatedCriteria){
            this.sendAction('action', 'updateCriteria', updatedCriteria)
        },
        createNewTemplate : function(){
            this.sendAction('action', 'createNewTemplate', this.element);
        },
        viewTemplate : function(){
            this.sendAction('action', 'viewTemplate', this.element);
        },
        patternVariableUpdate : function(criteriaList){
            this.sendAction('action', 'patternVariableUpdate', criteriaList);
        },
        updateEnableBlockIdentificationCriteria : function(){
            this.set('enableBlockIdentificationCriteria', !this.enableBlockIdentificationCriteria); // NO I18N
            var __self = this;
            setTimeout(function(){
                $('input[name=enableBlockIdentificationCriteria]').prop('checked',__self.enableBlockIdentificationCriteria);
            },10);
        },
        updateIndentation : function(){
            this.set('useIndentation', !this.useIndentation); // NO I18N
            var __self = this;
            setTimeout(function(){
                $('input[name=useIndentation]').prop('checked',__self.useIndentation);
            },10);
        }
    },
    updateStartBlockToVariable:function(e){
        this.sendAction('action', 'blockInputVariableUpdate', this.startBlock);
    }.observes('startBlock'), // NO I18N
    updateEndBlockToVariable:function(e){
        this.sendAction('action', 'blockInputVariableUpdate', this.endBlock);
    }.observes('endBlock'), // NO I18N
    updateEndBlockNeeded:function(e){
        if(this.parseTypeSingle){
            this.set('endBlockNeeded', false); // NO I18N
        }
        else{
            if(!this.useIndentation){
                this.set('endBlockNeeded', true); // NO I18N
            }
        }
    }.observes('parseTypeSingle'), // NO I18N
    updateEndBlockNeeded2:function(e){
        if(this.useIndentation){
            this.set('endBlockNeeded', false); // NO I18N
        }
        else{
            if(!this.parseTypeSingle){
                this.set('endBlockNeeded', true); // NO I18N
            }
        }
    }.observes('useIndentation') // NO I18N
});
OPMClient.NcmWorkflowViolationDetailsComponent = Ember.Component.extend({
    violationSeverity : false,
    remediationConfiglets : [],
    remediationConfigletSelected : false,
    remediationConfigletVariables : [],
    remediationConfigletContent : false,
    violationMessage : '',
    remediationProcedure : '',
    enableAutoRemediate : false,
    variableSelDropDownList : [],
    init : function(){
        this._super();
        this.createCopy();
        this.loadConfiglets();
        if(this.isAutoRemediate){
            this.enableAutoRemediate = true;
        }
        if(this.remediationConfigletSelected > 0){
            this.configletSelected();
        }
    },
    createCopy : function(){
        this.violationMessage1 = this.violationMessage;
        this.remediationProcedure1 = this.remediationProcedure;
        if(this.remediationConfiglet){
            var tArr = [];
            this.remediationConfigletSelected = this.remediationConfiglet;
            if(this.remediationConfigletVariablesMap){
                var tMap = this.remediationConfigletVariablesMap;
                for(var name in tMap){
                    tArr.push({
                        name : name,
                        value : tMap[name]
                    });
                }
                this.set('remediationConfigletVariables',tArr); // NO I18N
            }
        }
    },
    populateSeverity : function(){
        if(!this.violationSeverity){
            this.violationSeverity = 'CRITICAL'; // NO I18N
        }
        $("input[name=violationSeverity][value="+this.violationSeverity+"]").prop("checked",true);
    },
    saveData : function(){
        var variableMap = {};
		var allUsedVariables = [];
        if(this.remediationConfigletVariables){
            var callBackFunc = function(){
//                opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.complianceiq.rules.violation.auto_remediate.msg')); // NO I18N
                OPMClient.NCMComplianceUtilController.loadMsgAndClear('infoMsg', Ember.I18n.t('ncm.complianceiq.rules.violation.auto_remediate.msg')); // NO I18N
            };
            for(var i = 0; i < this.remediationConfigletVariables.length; i++){
                var configletVariableValue = $('#configletvalue_'+i).val(); // NO I18N
                if(this.enableAutoRemediate){
                    ncmValidateInputField(configletVariableValue, '#configletvalue_'+i+' input', callBackFunc); // NO I18N
                }
                variableMap[this.remediationConfigletVariables[i].name] = configletVariableValue;
				allUsedVariables.push(getVariablesFromContent(configletVariableValue));
            }
        }
		allUsedVariables.push(getVariablesFromContent(this.violationMessage1));
		allUsedVariables.push(getVariablesFromContent(this.remediationProcedure1));
		allUsedVariables = allUsedVariables.flat();
		var variablesInRule = this.variablesList;
		var compileError = false;
		if(allUsedVariables && allUsedVariables.length > 0){
			for(var i = 0; i < allUsedVariables.length; i++){
				var variableUsed = false;
				for(var j = 0; j < variablesInRule.length; j++){
					if(allUsedVariables[i] == variablesInRule[j].name){
						variableUsed = true;
						break;
					}
				}
				if(!variableUsed){
					compileError = true;
					break;
				}
			}
		}


        var result = {
            violationSeverity : $('input[name=violationSeverity]:checked').val(),
            violationMessage : this.violationMessage1,
            remediationProcedure : this.remediationProcedure1,
            remediationConfigletVariablesMap : variableMap,
            isAutoRemediate : this.enableAutoRemediate
        }
        if(this.remediationConfigletSelected){
            result.remediationConfiglet = this.remediationConfigletSelected;
        }
        return result;
    },
    didInsertElement : function() {
		this._super();
		this.populateSeverity();
		this.sendAction('action', 'violationInstance', this);
        document.addEventListener('click', this.dropDownSelClassRemover);
    },
    dropDownSelClassRemover : function(event){
        try{
            if(event.target.id && event.target.id.indexOf('configletvalue_') == 0){
                return;
            }
            for(var i = 0; i < document.getElementsByClassName('violationInfo').length; i++){
                $('#configletvalue_'+i+'_dropdown').hide();
            }
        }
        catch(error){}
    },
    hideDropdown : function(e){
        for(var i = 0; i < this.remediationConfigletVariables.length; i++){
            $('#configletvalue_'+i+'_dropdown').hide();
        }
    },
    actions:{
        updateAutoRemediate : function(){
            this.set('enableAutoRemediate', !this.enableAutoRemediate); // NO I18N
        },
        configletVariableSel : function(index){
            if(this.type == 'v1'){
                return;
            }
            this.hideDropdown();
            $('#configletvalue_'+index+'_dropdown').show();
        },
        selectValueFromList : function(configletVariable, value){
            this.hideDropdown();
            configletVariable.value = value;
            var copyData = jQuery.extend(true, [],this.remediationConfigletVariables);
            this.set('remediationConfigletVariables',copyData); // NO I18N
        }
    },
    configletSelected : function(){
        if(this.type == 'v1'){
            return;
        }
        if(!window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite){
            return;
        }
        if(this.remediationConfigletSelected > 0){
            var configletData = OPMClient.NCMComplianceRulesController.getConfigletDetails(this.remediationConfigletSelected);
            if(configletData){
                var configletVariables = configletData.variables;
                if(configletVariables && configletVariables.length > 0){
                    var localVariables = [];
                    var copyValues = jQuery.extend(true, [],this.remediationConfigletVariables);
                    for(var i = 0; i < configletVariables.length; i++){
                        var variableData = {
                            name : configletVariables[i].name,
                            value : ''
                        };
                        for(var j = 0; j < copyValues.length; j++){
                            if(copyValues[j].name == variableData.name){
                                variableData.value = copyValues[j].value;
                                break;
                            }
                        }
                        variableData.displayName = configletVariables[i].displayName ? configletVariables[i].displayName : configletVariables[i].name;
                        localVariables.push(variableData);
                    }
                    this.set('remediationConfigletVariables',localVariables); // NO I18N
                }
                else{
                    this.set('remediationConfigletVariables',false); // NO I18N
                }
                if(configletData.templateContent){
                    this.set('remediationConfigletContent',configletData.templateContent); // NO I18N
                } else{
                    this.set('remediationConfigletContent',false); // NO I18N
                }
            }
        }
        else{
            this.set('remediationConfigletVariables',false); // NO I18N
            this.set('remediationConfigletContent',false); // NO I18N
        }
    }.observes('remediationConfigletSelected'), // NO I18N
    loadConfiglets : function(){
        if(!window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite){
            return;
        }
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/listAllConfiglets?HIDE_PROG_CONFIGLET=false'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        var configlets = jsonData.rows;
        this.remediationConfiglets = [];
        this.remediationConfiglets.push({
            key : -1,
            value : 'none' // NO I18N
        });
        for(var i = 0; i < configlets.length; i++){
            this.remediationConfiglets.push(
                {
                    key : configlets[i].id,
                    value : configlets[i].cell[1]
                }
            );
        }
    },
    willDestroyElement: function(){
        document.removeEventListener('click', this.dropDownSelClassRemover);
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmConfigCriteriaListComponent = Ember.Component.extend({
    notifyVariableUpdate : false, // send as true if the parent need pattern update notification
    criteriaList:false,
    updateParent: true,
    defaultCounts : [],
    deleteDisabled : false,
    defaultConditions : [],
    criteriaExpression : '',
    defaultCriteria : {
        id : 1,
        condition : 'SHOULD_CONTAIN', // NO I18N
        count : -1,
        pattern : '',
        operator : 'AND' // NO I18N
    },
    init : function(){
        this._super();
        this.createCopy();
		this.populateEmptyCriteria();
		this.populateDefaultCounts();
		this.populateDefaultConditions();
		this.refreshSequenceValuesOnly();
		this.updateCriteriaExpression();
		this.updateOperatorAndDeleteOptions(this.criteriaList);
    },
    createCopy : function(){
        if(this.criteria1){
            this.criteriaList = jQuery.extend(true, [],this.criteria1.criteriaList);
            if(this.criteria1.criteriaExpression){
                this.criteriaExpression = this.criteria1.criteriaExpression;
            }
        }
    },
    didInsertElement : function() {
		this._super();
		this.updateStyles();
		this.sendAction('action', 'criteriaListInstance', this);
		OPMClient.NCMComplianceUtilController.testIns = this;
		var __self = this;
		var textUpdateListener = function(event){
            if (event.target.tagName === 'TEXTAREA') { // NO I18N
                setTimeout(function() {
                    __self.updatePatternDataToVariable();
                },10);
              }
        };
		var elem = document.getElementById(this.elementId);
        elem.removeEventListener('input', textUpdateListener);
        elem.addEventListener('input', textUpdateListener);
    },
    saveData : function(isValidate, forHelp){
        if(isValidate == undefined){ // we will validate by default. Pass false to skip
            isValidate = true;
        }
        if(isValidate){
            this.validateCriteriaList();
            ncmValidateInputField(this.criteriaExpression, '#criteriaExpression'); // NO I18N
        }
        var tArr = jQuery.extend(true, [],this.criteriaList);
        for(var i = 0; i < tArr.length; i++){
            var tObj = tArr[i];
            delete tObj.uniqueId;
        }
		var __self = this;
		if(this.variables && this.variables.length > 0){
			var callBackContent = '';
			var callBackVariableName = '';
			var callBackVariableIndex = -1;
            var okCallBack = function(){
                tArr[callBackVariableIndex].pattern = ncmEnsureVariableParentheses(callBackContent, callBackVariableName);
                __self.set('criteriaList', tArr); // NO I18N
            };
            var ensureVariablesAreEnclosed = function (forHelp) {
                for (var i = 0; i < __self.variables.length; i++) {
                    var variableObj = __self.variables[i];
                    if (variableObj.variableType == 'DERIVED' && (!variableObj.createdBy || (variableObj.createdBy.id == __self.additionalHelpProp))) {
                        if(variableObj.createdBy){
							if(variableObj.createdBy.startBlock || variableObj.createdBy.endBlock){
								continue; // Skip the variables created by block start or end
							}
						}
						for (var j = 0; j < tArr.length; j++) {
                            var criteria = tArr[j];
                            if (criteria.pattern && ncmCheckContains(criteria.pattern, variableObj.name)) {
								if(!(criteria.condition == 'SHOULD_MATCH' || criteria.condition == 'SHOULD_NOT_MATCH') && isValidate){ // NO I18N
									ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.usage.alert.match', {param0 :variableObj.name}), false, false, Ember.I18n.t('webclient.action.ok',this), Ember.I18n.t("webclient.action.Cancel")); // NO I18N
									throw new Error(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.usage.alert.match', {param0 :variableObj.name})); // NO I18N
								}
								var needToEnclose = !ncmIsVariableProperlyEnclosed(criteria.pattern, variableObj.name);
								if(needToEnclose){
									if(!forHelp && isValidate){
										callBackContent = criteria.pattern;
										callBackVariableName = variableObj.name;
										callBackVariableIndex = j;
										ncmConfirmDialog(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 :variableObj.name}, this), okCallBack, false, Ember.I18n.t('webclient.opm.confirm.ok',this), Ember.I18n.t("webclient.action.Cancel")); // NO I18N
										throw new Error(Ember.I18n.t('ncm.complianceiq.rule.flow.variable.confirm.perform_enclose_auto', {param0 :variableObj.name}, this)); // NO I18N
									}
								}
							}
                        }
                    }
                }
            };
            ensureVariablesAreEnclosed(forHelp);
		}

        return {
             criteriaList : tArr,
             criteriaExpression : this.criteriaExpression
        };
    },
    updateStyles : function(){
        setTimeout(function(){
            $('.select2').select2();
        }, 0 );
    },
    populateDefaultConditions : function(){
        if(this.defaultConditions.length > 0){
            return;
        }
        this.defaultConditions.push(
            {
                key : 'SHOULD_CONTAIN', // NO I18N
                value : Ember.I18n.t('jsp.commonstr.Shouldcontain') // NO I18N
            },
            {
                key : 'SHOULD_NOT_CONTAIN', // NO I18N
                value : Ember.I18n.t('jsp.commonstr.ShouldNotcontain') // NO I18N
            },
            {
                key : 'SHOULD_MATCH', // NO I18N
                value : Ember.I18n.t('ncm.complianceiq.rule.condition.type1') // NO I18N
            },
            {
                key : 'SHOULD_NOT_MATCH', // NO I18N
                value : Ember.I18n.t('ncm.complianceiq.rule.condition.type2') // NO I18N
            },
            {
                key : 'EQUALS', // NO I18N
                value : Ember.I18n.t('webclient.equals') // NO I18N
            },
            {
                key : 'NOT_EQUALS', // NO I18N
                value : Ember.I18n.t('webclient.not.equals') // NO I18N
            },
            {
                key : 'SHOULD_CONTAIN_EXACT_SET', // NO I18N
                value : Ember.I18n.t('jsp.commonstr.ShouldContainExact') // NO I18N
            },
            {
                key : 'SHOULD_CONTAIN_ONLY', // NO I18N
                value : Ember.I18n.t('ncm.complianceiq.condition.should_contain_only') // NO I18N
            }
        );
    },
    populateDefaultCounts : function(){
        if(this.defaultCounts.length > 0){
            return;
        }
        this.defaultCounts.push({
            key : -1,
            value : Ember.I18n.t('any') // NO I18N
        });
        for(var ctr = 1; ctr <= 50; ctr++){
            this.defaultCounts.push(
                {
                    key : ctr,
                    value : ctr
                }
            );
        }
    },
    populateEmptyCriteria : function(){
        if(!this.criteriaList || this.criteriaList.length == 0){
            this.criteriaList = [];
            var copyObj = Object.assign({}, this.defaultCriteria);
            copyObj.operator = false;
            this.criteriaList.pushObject(copyObj);
        }
    },
    refreshSequenceValuesOnly : function(){
        var tArr = jQuery.extend(true, [],this.criteriaList);
        for(var index = 0; index < tArr.length; index++){
            tArr[index].uniqueId = this.elementId + '_' + (index + 1);
            tArr[index].id = (index + 1);
        }
        this.set('criteriaList', tArr); // NO I18N
    },
    refreshSequenceValues : function(){
        this.refreshSequenceValuesOnly();
        this.rerender();
    },
    validateCriteriaList: function(){
        for(var index = 0; index < this.criteriaList.length; index++){
            var uniqueId = this.elementId + '_' + (this.criteriaList[index].id);
            ncmValidateInputField(this.criteriaList[index].pattern, 'textarea[id='+uniqueId +']'); // NO I18N
        }
    },
    actions: {
        add : function(id){
            try{
                var index = id-1;
                this.validateCriteriaList();

                var copyObj = Object.assign({}, this.defaultCriteria);
                var tempCopyArr = JSON.parse(JSON.stringify(this.criteriaList));

                tempCopyArr.insertAt(index + 1, copyObj);

                this.updateCriteriaList(tempCopyArr);
                this.refreshSequenceValues();
                this.updateStyles();
            }
            catch(error){}
        },
        remove : function(id){
            var index = id-1;
            var tempCopyArr = JSON.parse(JSON.stringify(this.criteriaList));
            tempCopyArr.removeAt(index);
            this.updateCriteriaList(tempCopyArr);
            this.refreshSequenceValues();
        },
        toggleOperator : function(id){
            var index = id-1;
            var operator = this.criteriaList[index].operator;
            if(operator == 'AND'){
                this.criteriaList[index].operator = 'OR';
            }
            else{
                this.criteriaList[index].operator = 'AND';
            }
            var tempCopyArr = JSON.parse(JSON.stringify(this.criteriaList));
            this.updateCriteriaList(tempCopyArr);
            this.refreshSequenceValues();
        }
    },
    updateCriteriaExpression : function(forceUpdate){
        if(this.criteriaExpression && this.criteriaExpression.trim().length > 0 && !forceUpdate){
            return;
        }
        var pattern = "";
        for(var i = 0; i < this.criteriaList.length; i++) {
            var criteria = this.criteriaList[i];
            if(i > 0) {
                pattern += " ";
            }
            pattern += (i + 1);
            if(i > 0) {
                pattern = "(" + pattern + ")";
            }
            if((i != (this.criteriaList.length - 1))) {
                var operator = criteria.operator;
                if(operator != 'OR'){
                    operator = 'AND'; // NO I18N
                }
                pattern += " " + operator;
            }
        }
        this.set('criteriaExpression', pattern); // NO I18N
    },
    updateCriteriaList:function(tempCopyArr){
        this.updateParent = false;
        this.updateOperatorAndDeleteOptions(tempCopyArr);
        this.set('criteriaList',tempCopyArr); // NO I18N
		this.updateCriteriaExpression(true);
        this.updateParent = true;
        this.updatePatternDataToVariable();
    },
    updateOperatorAndDeleteOptions:function(criteriaList){
        for(var i = 0; i < criteriaList.length; i++){
            if(!criteriaList[i].operator){
                criteriaList[i].operator = 'AND';
            }
        }
        this.deleteDisabled = !(criteriaList.length > 1);
        criteriaList[criteriaList.length-1].operator = false;
    },
    updatePatternDataToVariable:function(e){
        if(!this.notifyVariableUpdate){
            return;
        }
        if(this.updateParent){
            this.sendAction('action', 'patternVariableUpdate', this.criteriaList);
        }
    }
});
OPMClient.NcmWorkflowVariablesComponent = Ember.Component.extend({
    emptyVariables : false,
    loadSingleVariableObj : {},
    loadSingleVariable : false,
    addNew : false,
    init : function(){
        this._super();
        this.createCopy();
        this.loadSingleVariableObj = ncmCreateComplianceVariable();
    },
    didInsertElement : function() {
        this._super();
        if(!this.variables || this.variables.length == 0){
            this.set('emptyVariables', true); // NO I18N
        }
        $('.variables-card .error-tooltip').hide();
    },
    refreshVariables : function(){
        this.set('emptyVariables', !this.variables || this.variables.length == 0); // NO I18N
        this.createCopy();
    }.observes('variables'), // NO I18N
    createCopy : function(){
        var copyData = jQuery.extend(true, [],this.variables);
        this.set('copyVariables', copyData); // NO I18N
    },
    actions : {
        copyVariableName : function(value){
            // Create new element
            var el = document.createElement('textarea');
            // Set value (string to be copied)
            el.value = value;
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
            // opm_infoMsgs('successMsg', 'Name copied successfully'); //No I18N
			OPMClient.NCMComplianceUtilController.loadMsgAndClear('successMsg', Ember.I18n.t('webclient.restapi.copy.success')); // NO I18N
        },
        cancel : function(){
            var copyData = jQuery.extend(true, [],this.variables);
            this.set('copyVariables', copyData); // NO I18N
            this.close();
        },
        saveVariableOnly : function(){
            try{
                $('.variables-card .error-tooltip').hide();
                for(var i = 0; i < this.copyVariables.length; i++){
                    ncmValidateInputField(this.copyVariables[i].value, $('#'+this.copyVariables[i].id + ' .validateField'));
                    if(this.copyVariables[i].variableType != 'USER_INPUT'){
                        this.copyVariables[i].isGlobal = false;
                    }
                }
                this.sendAction('action', 'saveVariableOnly', jQuery.extend(true, [],this.copyVariables));
                this.set('variables', this.copyVariables); // NO I18N
                this.createCopy();
                this.close();
            }
            catch(error){}
        },
        save : function(){
            try{
                $('.variables-card .error-tooltip').hide();
                if(this.loadSingleVariable && this.addNew){
                    ncmValidateInputField(this.loadSingleVariableObj.name, $('#'+this.loadSingleVariableObj.id + ' .variableName'));
                    ncmValidateInputField(this.loadSingleVariableObj.value, $('#'+this.loadSingleVariableObj.id + ' .validateField'));
                    this.loadSingleVariableObj.name = '$' + this.loadSingleVariableObj.name;
                    this.loadSingleVariableObj.variableType = $("#"+ this.loadSingleVariableObj.id).find('input[name='+this.loadSingleVariableObj.id+']:checked').val();
                    this.sendAction('action', 'addNewVariable', this.loadSingleVariableObj);
                    this.createCopy();
                }
                else{
                    for(var i = 0; i < this.copyVariables.length; i++){
                        ncmValidateInputField(this.copyVariables[i].value, $('#'+this.copyVariables[i].id + ' .validateField'));
                        if(this.copyVariables[i].variableType != 'USER_INPUT'){
                            this.copyVariables[i].isGlobal = false;
                        }
                    }
                    this.set('variables', this.copyVariables); // NO I18N
                }
                this.copyVariables.sort(function(a,b){return (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0);});
                this.close();
            }
            catch(error){}
        },
        collectVariableValue : function(variableId){
            $('#variableInput').css('display','block');
            slideInWithId('variableInput'); // NO I18N
            if(variableId){
                this.set('loadSingleVariable', true); // NO I18N
                for(var i = 0; i < this.copyVariables.length; i++){
                    if(this.copyVariables[i].id == variableId){
                        this.set('loadSingleVariableObj', this.copyVariables[i]); // NO I18N
                        break;
                    }
                }
            }
        },
        addVariable : function(){
            $('#variableInput').css('display','block');
            slideInWithId('variableInput'); // NO I18N
            this.set('loadSingleVariable', true); // NO I18N
            this.set('addNew', true); // NO I18N
            var tObj = ncmCreateComplianceVariable('');
            // tObj.isTemp = false;
			tObj.userAdded = true;
            this.set('loadSingleVariableObj', tObj); // NO I18N
        },
		deleteVariable : function(variableId){
			this.close();
			this.sendAction('action', 'deleteVariable', variableId);
		},
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        }
    },
    close : function(){
        this.set('addNew', false); // NO I18N
        if(this.loadSingleVariable){
            this.set('loadSingleVariable', false); // NO I18N
        }
        slideOutWithId('variableInput'); // NO I18N
        $('#variableInput').css('display','none');
    }
});
OPMClient.NcmWorkflowVariableComponent = Ember.Component.extend({
    isUserInput : true,
    globalOption : false,
    showDefaultHelp : true,
    showDerivedHelpCard : false,
    isGlobal : false,
    helpContent : {},
    init : function(){
        this._super();
        this.globalOption = this.variable.variableType == 'USER_INPUT'; // NO I18N
        this.showDerivedHelpCard = this.variable.variableType != 'USER_INPUT'; // NO I18N
        for(var i = 0; i < this.initialVariableValues.length; i++){
            if(this.initialVariableValues[i].id == this.variable.id){
                this.isGlobal = this.initialVariableValues[i].isGlobal;
                break;
            }
        }
        this.updateHelpDynamicContent();
        if(this.addNew){
            this.showDerivedHelpCard = true;
        }
    },
	// variableValueUpdate : function(){
	// 	if(this.variable.variableType != 'USER_INPUT'){
	// 		this.updateHelpDynamicContent();
	// 	}
	// }.observes('variable.value'), // NO I18N
    updateHelpDynamicContent : function(){
		if(!this.variable || !this.variable.value || this.variable.variableType == 'USER_INPUT'){
			this.showDerivedHelpCard = false;
			return;
		}
		this.set('showDefaultHelp', true); // NO I18N
		var currentVariableName = this.variable.name;
        if(this.pageOptions){
			var variableObj = {};
			variableObj[currentVariableName] = this.variable.value;
			if(this.localTempVariables && this.localTempVariables.length > 0){
				for(var i = 0; i < this.localTempVariables.length; i++){
					if(currentVariableName != this.localTempVariables[i].name){
						variableObj[this.localTempVariables[i].name] = this.localTempVariables[i].value;
					}
				}
			}
			var result = false;
			if(this.pageOptions.type == 'BLOCK' && this.pageOptions.childComponentInstance){
				var blockDetails = this.pageOptions.childComponentInstance.saveData(false, true).operation.details;
				if(blockDetails.startBlock && ncmCheckContains(blockDetails.startBlock, currentVariableName)){
					result = this.generateParseFromConfigHelp(blockDetails.startBlock,blockDetails.endBlock,blockDetails.indentation,blockDetails.parseType == 'SINGLE',variableObj); // NO I18N
				}
				else {
					if(blockDetails.endBlock && ncmCheckContains(blockDetails.endBlock, currentVariableName)){
						result = this.generateParseFromConfigHelp(blockDetails.startBlock,blockDetails.endBlock,blockDetails.indentation,blockDetails.parseType == 'SINGLE',variableObj); // NO I18N
					}
					else {
						if(blockDetails.criteria && blockDetails.criteria.criteriaList && blockDetails.criteria.criteriaList.length > 0){
							var criteriaList = blockDetails.criteria.criteriaList;
							for(var i = 0; i < criteriaList.length; i++){
								if(criteriaList[i].pattern && ncmCheckContains(criteriaList[i].pattern, currentVariableName)){
									result = this.generateParseFromConfigHelp(criteriaList[i].pattern, null, false, true, variableObj);
									break;
								}
							}
						}
					}
				}
			}
			else if(this.pageOptions.type == 'CONDITION' && this.variable.createdBy && this.variable.createdBy.content){
				var inputContent = this.variable.createdBy.content;
				result = this.generateParseFromConfigHelp(inputContent,false,false,false,variableObj);

			}
			if(result && result.sampleConfigArr && result.sampleConfigArr.length > 0 && result.descriptionParts.content &&  result.descriptionParts.content.length > 0){
				var tHelpContent = {
					sampleConfig : result.sampleConfigArr,
					capturedValues : result.descriptionParts.content
				}
				this.set('helpContent', tHelpContent); // NO I18N
				this.set('showDefaultHelp', false); // NO I18N
			}
        }
    }.observes('variable.value'), // NO I18N
    didInsertElement : function() {
        this._super();
        $("#"+ this.variable.id).find("input[name="+this.variable.id+"][value="+this.variable.variableType+"]").prop("checked",true);
//        if(this.variable.isGlobal){
//            $("#"+ this.variable.id).find("input[name=markVariableGlobal]").prop("checked",true);
//        }
        var __self = this;
        $('input[type="radio"][name='+__self.variable.id+']').off('click').on('click', function(e){
            __self.variable.variableType = $("#"+ __self.variable.id).find('input[name='+__self.variable.id+']:checked').val()
            __self.set('globalOption', __self.variable.variableType == 'USER_INPUT'); // NO I18N
            __self.set('showDerivedHelpCard', __self.variable.variableType != 'USER_INPUT'); // NO I18N
        });
        if(this.isGlobal || this.isStandard){
            $('.globalMark').addClass('disabledBlock'); // NO I18N
            $('.variableTypeRow').addClass('disabledBlock'); // NO I18N
        }
        if(this.isStandard){
            this.set('enableVariableSaveOnly', true); // NO I18N
            $('.deleteVariableDisable').addClass('disabledBlock'); // NO I18N
        }
		// document.querySelector('#variableValueEle input').addEventListener('mouseleave', this.variableValueUpdate.bind(this));
    },
    actions : {
        updateVariableGlobal : function(){
            if(this.isGlobal){
                return;
            }
            this.set('variable.isGlobal', !this.variable.isGlobal); // NO I18N
            var __self = this;
//            setTimeout(function(){
//                $('#'+__self.elementId+' input[name=markVariableGlobal]').prop('checked', __self.variable.isGlobal);
//            },10);
        },
        deleteVariable : function(){
			this.sendAction('action', 'deleteVariable', this.variable.id); // NO I18N
        }
    },

	/**
	 * Dynamically generates a help content object for "Parse from Config".
	 * Returns an object suitable for Handlebars rendering.
	 *
	 * @param {string} startBlock - The block start pattern (e.g. "^snmp-server host DMVPN ($HOST)").
	 * @param {string} [endBlock] - The block end pattern (optional).
	 * @param {boolean} useIndentation - Whether indentation is used.
	 * @param {boolean} singleLineBlock - Whether it's a single-line block.
	 * @param {Object} [variableRegexMap] - Map of variable names to regex patterns (optional).
	 * @returns {{title: string, description: string}} Object with 'title' and 'description' for Handlebars rendering.
	 */
	generateParseFromConfigHelp : function(startBlock, endBlock, useIndentation, singleLineBlock, variableRegexMap) {
		if (!variableRegexMap){
			variableRegexMap = {};
		}

		for(var key in variableRegexMap) {
			startBlock = ncmEnsureVariableParentheses(startBlock, key); // Ensure variables are enclosed in parentheses
		}

		// Extract variable names in order
		var varPattern = /\((\$\w+)\)/g;
		var vars = [];
		var match;
		while ((match = varPattern.exec(startBlock)) !== null) {
			vars.push(match[1]);
		}

		// Generate sample value per variable
		// Helper to get regex string for a variable
		function getSampleValue(regexStr, seed) {
			// Sample data sets
			var sampleIPs = [
				'192.168.1.1', '10.0.0.1', '172.16.0.254', '172.20.10.2', '10.10.10.10', '8.8.8.8'// NO I18N
			];
			var resourceNames = [
				'loopback0', 'mgmt', 'vlan10', 'edge', 'trunk', 'uplink',// NO I18N
				'ospf1', 'routerB', 'switchX', 'public', 'private',// NO I18N
				'guest', 'interface', 'admin', 'backup', 'core',// NO I18N
				'eth0', 'fa0/1', 'g0/0/1', 'WAN', 'LAN'// NO I18N
			];
			var sampleIntegers = [
				'10', '192', '255', '1', '100', '42', '77',// NO I18N
				'888', '654', '23', '99', '0'// NO I18N
			];
			// var sampleChars = [
			// 	'A', 'x', '_', '7', 'Z', 'q', 'M', '2', 'b', 'D'
			// ];
			var sampleWhitespace = [' ', '\t', '\n'];
			var sampleNonWhitespace = ['A', 'Z', '7', 'b', '_', '1']; // NO I18N
			var sampleWordChars = ['a', 'B', '3', '_', 'f', 'X']; // NO I18N
			var sampleDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

			// Pick deterministic value from array
			function pick(arr, i) {
				return arr[(seed + i) % arr.length];
			}

			// Indexes per token type
			var ipIndex = 0, resIndex = 0, intIndex = 0, wordIndex = 0;
			var anyIndex = 0, charIndex = 0, wsIndex = 0, nwsIndex = 0, digitIndex = 0;

			// Helper for quantifiers {n}, {n,}, {n,m}
			function handleQuantifier(token, min, max) {
				var count = Math.max(min, 1);
				var result = '';
				var i;
				for (i = 0; i < count; i++) {
					if (token === '\\d') {
						result += pick(sampleDigits, digitIndex++);
					}
					else if (token === '\\w') {
						result += pick(sampleWordChars, wordIndex++);
					}
					else if (token === '\\s') {
						result += pick(sampleWhitespace, wsIndex++);
					}
					else if (token === '\\S') {
						result += pick(sampleNonWhitespace, nwsIndex++);
					}
					else if (token === '.') {
						result += pick(resourceNames.concat(sampleIPs), anyIndex++).charAt(0);
					}
					else {
						result += token.replace('\\', '');
					}
				}
				return result;
			}

			// Remove start/end anchors
			var sample = regexStr
				.replace(/^\^/, '')
				.replace(/\$$/, '');

			// Handle character sets [up|down|admin] and [abc]
			sample = sample.replace(/\[([^\]]+)\]/g, function(_, vals) {
				var options = vals.indexOf('|') !== -1 ? vals.split('|') : vals.split('');
				return options[seed % options.length];
			});

			// Handle escaped literal parentheses/brackets/braces
			sample = sample
				.replace(/\\\(/g, '(')
				.replace(/\\\)/g, ')')
				.replace(/\\\[/g, '[')
				.replace(/\\\]/g, ']')
				.replace(/\\\{/g, '{')
				.replace(/\\\}/g, '}');

			// Handle .* (replace with mix of IPs and resource names, as preferred)
			sample = sample.replace(/\.\*/g, function() {
				var ips = [pick(sampleIPs, ipIndex++), pick(sampleIPs, ipIndex++), pick(sampleIPs, ipIndex++)];
				var res = [pick(resourceNames, resIndex++), pick(resourceNames, resIndex++), pick(resourceNames, resIndex++)];
				return ips.concat(res).join(' ');
			});

			// Handle .+ (replace with a single resource name or IP)
			sample = sample.replace(/\.\+/g, function() {
				return pick(resourceNames.concat(sampleIPs), anyIndex++);
			});

			// Handle explicit quantifiers {n}, {n,}, {n,m}
			sample = sample.replace(/(\\[dwsS\.])\{(\d+),?(\d*)\}/g, function(_, token, min, max) {
				min = parseInt(min, 10);
				max = max ? parseInt(max, 10) : min;
				return handleQuantifier(token, min, max);
			});

			// Handle word tokens
			sample = sample
				.replace(/\\w\+/g, function() { return pick(resourceNames, wordIndex++); })
				.replace(/\\w\*/g, function() { return pick(resourceNames, wordIndex++); })
				.replace(/\\w/g, function() { return pick(sampleWordChars, wordIndex++); });

			// Handle digit tokens
			sample = sample
				.replace(/\\d\+/g, function() { return pick(sampleIntegers, intIndex++); })
				.replace(/\\d\*/g, function() { return pick(sampleIntegers, intIndex++); })
				.replace(/\\d/g, function() { return pick(sampleDigits, digitIndex++); });

			// Handle whitespace tokens
			sample = sample
				.replace(/\\s\+/g, '    ')
				.replace(/\\s\*/g, ' ')
				.replace(/\\s/g, function() { return pick(sampleWhitespace, wsIndex++); });

			// Handle non-whitespace tokens
			sample = sample
				.replace(/\\S\+/g, function() { return pick(resourceNames, resIndex++); })
				.replace(/\\S\*/g, function() { return pick(resourceNames, resIndex++); })
				.replace(/\\S/g, function() { return pick(sampleNonWhitespace, nwsIndex++); });

			// Handle dot tokens (escaped literal dot)
	//		sample = sample.replace(/\\\./g, '.');

	//		// Handle dot tokens (single any character)
	//		sample = sample.replace(/\./g, function() {
	//			return pick(resourceNames.concat(sampleIPs), anyIndex++).charAt(0);
	//		});

			// Remove redundant escapes
			sample = sample.replace(/\\\\/g, '\\');

			return sample;
		}

		// Only one block per requirement
		var sampleSet = [];
		for (var i = 0; i < vars.length; i++) {
			var regexStr = variableRegexMap[vars[i]] || "\\S+";
			sampleSet.push(getSampleValue(regexStr, i));
		}

		// Compose sample config lines
		var configArr = [];
		var line = startBlock.replace(/\^/, "");
		// Convert regex whitespace to actual spaces
		line = line.replace(/\\s\+/g, '    ').replace(/\\s\*/g, ' ').replace(/\\s/g, ' ');
		for (var j = 0; j < vars.length; j++) {
			line = line.replace("(" + vars[j] + ")", sampleSet[j]);
		}
		configArr.push(line);
		if (!singleLineBlock) {
			if (useIndentation) {
				configArr.push(" description Sample block");// NO I18N
				configArr.push(" option1 value1");// NO I18N
			} else {
				configArr.push("description Sample block");// NO I18N
				configArr.push("option1 value1");// NO I18N
			}
			if (endBlock) {
				configArr.push(endBlock);
			}
		}

		// Captured values as JSON
		var captured_value_json = {};
		for (var k = 0; k < vars.length; k++) {
			captured_value_json[vars[k]] = sampleSet[k];
		}

		// Structured description breakdown
		var descriptionParts = {
            content: (function() {
                var arr = [];
                for (var p = 0; p < vars.length; p++) {
                    var constructedObj = { name: vars[p], value: captured_value_json[vars[p]] };
                    if(p == vars.length - 1) {
                        constructedObj.last = true;
                    }
                    arr.push(constructedObj);
                }
                return arr;
            })()
		};

		return {
			sampleConfigArr: configArr,
			descriptionParts: descriptionParts
		};
	},
    willDestroyElement: function(){
		// document.querySelector('#variableValueEle input').removeEventListener('mouseleave', this.variableValueUpdate);
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmCommandTemplateComponent = Ember.Component.extend({
    templateId : false,
    init : function(){
        this._super();
        if(this.templateDetails && this.templateDetails.isStandard){
            this.set('editNotAllowed', true); // NO I18N
            this.set('showNoteMessage', Ember.I18n.t('ncm.complianceiq.ee.dist.edit.command_template.not_allowed.standard.msg')); // NO I18N
//            this.set('editDisableMsg', Ember.I18n.t('ncm.complianceiq.ee.dist.edit.command_template.not_allowed.standard.msg')); // NO I18N
        }
        if(ncmIsProbeOrProbeSelected() && this.templateDetails && this.templateDetails.isDistributed){
            this.set('editNotAllowed', true); // NO I18N
            this.set('showNoteMessage', Ember.I18n.t('ncm.complianceiq.ee.dist.edit.command_template.not_allowed.msg')); // NO I18N
//            this.set('editDisableMsg', Ember.I18n.t('ncm.complianceiq.ee.dist.edit.command_template.not_allowed.msg')); // NO I18N
        }
		this.updateMarkAsPublic();
    },
	updateMarkAsPublic: function () {
		this.set('markAsPublicMap', OPMClient.NCMComplianceTemplatesController.getMarkAsPublicDetails(!this.templateId, this.templateDetails && this.templateDetails.isPublic, this.templateDetails && this.templateDetails.isDistributed, this.templateDetails && this.templateDetails.isStandard));//No I18N
	},
	actions : {
	    save : function(){
            if(this.commandsListInstance){
                try{
                    var result = this.commandsListInstance.saveData();
                    if((!result || result.length == 0) && (this.commandsListInstance.templateDesc == this.commandsListInstance.templateDescCopy) && (this.commandsListInstance.isPublic == this.commandsListInstance.isPublicCopy)){
                        // opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.NCM.Privacy.Settings.noChangeMsg')); //No I18N
						OPMClient.NCMComplianceUtilController.loadMsgAndClear('infoMsg', Ember.I18n.t('webclient.NCM.Privacy.Settings.noChangeMsg')); // NO I18N
                    }
                    else{
                        OPMClient.NCMComplianceTemplatesController.updateCommandTemplate(this.commandsListInstance.templateName, this.commandsListInstance.templateDesc, this.templateId, this.commandsListInstance.isPublic, result);
                    }
                    window.history.back();
                }
                catch(error){}
            }
	    },
	    test : function(){
	        if(this.commandsListInstance){
                try{
                    var isAdd = !this.templateId;
                    var result = this.commandsListInstance.getUiDataWithoutUpdateOperation();
                    if(!result || result.length == 0){
                        OPMClient.NCMComplianceTemplatesController.testDetails.templateId = this.templateId;
                    }
                    else{
                        OPMClient.NCMComplianceTemplatesController.testDetails.commands = result;
                    }
                    if(isAdd){
                        location.href = OPMClient.NCMComplianceListController.baseUrl +"/CommandTemplates/Add/Test"; // NO I18N
                    }
                    else{
                        location.href = OPMClient.NCMComplianceListController.baseUrl +"/CommandTemplates/Edit/"+this.templateId+"/Test"; // NO I18N
                    }
                }
                catch(error){}
	        }
	    },
        commandsListInstance: function(child) {
            this.set('commandsListInstance', child); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        }
	},
	willDestroyElement: function(){
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmDeviceCommandsListComponent = Ember.Component.extend({
    templateName : '',
    templateDesc : '',
    templateDescCopy : '',
	isPublicCopy : false,
    executionGroupId : '',
    copyArr : [],
    deletedArr : [],
    showResponseSelectionUI : true,
    results : [],
    deleteDisabled : false,
    responseSelId : 0,
    rowObj : {
        id : 0,
        sequenceId : 0,
        recordId : '',
        interactionId : '',
        command : '',
        prompt : '',
        timeout : '20000',
        messageSuffix : '${LF}', // NO I18N
        promptActionId : '<-- Not Needed -->', //NO I18N
        responseSelection : false,
        isNewRow : true
    },
    rowsArr : [],
    promptActionIds : [
        {
           PROMPTACTIONID : '<-- Not Needed -->' //NO I18N
        }
    ],
    lineFeed : [
        {
            key:'${LF}', // No I18N
            value:'LF' // No I18N
        },
        {
            key:'${CR}', // No I18N
            value:'CR' // No I18N
        },
        {
            key:'${CRLF}', // No I18N
            value:'CRLF' // No I18N
        }
    ],
    init : function(){
        this._super();
        this.copyArr = JSON.parse(JSON.stringify(this.rowsArr));
        this.templateDescCopy = this.templateDesc;
        this.deleteDisabled = !(this.rowsArr.length > 1);
		this.isPublic = this.markAsPublicMap && this.markAsPublicMap.isPublic;
		this.isPublicCopy = this.isPublic;
		this.updateMarkAsPublic();
    },
	didInsertElement: function () {
		this._super();
        this.set('deletedArr', []); //NO I18N
        this.set('results', []); //NO I18N
        if(!this.templateId){
            this.clearData();
        }
        else{
            $(".toDisable").prop('disabled',true);
        }
	    if(this.get('rowsArr') && this.get('rowsArr').length > 0){
	        for(var index = 0; index < this.rowsArr.length; index++){
                if(this.rowsArr[index].responseSelection){
                    this.responseSelId = this.rowsArr[index].id;
                    break;
                }
            }
	    }
	    else{
	        var copyObj = Object.assign({}, this.rowObj);
            copyObj.responseSelection = true;
            this.rowsArr.pushObject(copyObj);
	    }
	    if(this.promptActionIds.length == 1){
	        var promptActionIds = [];
	        if(this.staticData && this.staticData.promptActionIds){
	            promptActionIds = this.staticData.promptActionIds;
	        }
	        else{
                var responseData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ncmconfiglets/getPromptActionIds'); //No I18N
                if(responseData.isSuccess && responseData.promptActionIds) {
                    promptActionIds = this.promptActionIds.concat(responseData.promptActionIds.slice(0, -1));
                    if(this.staticData){
                        this.set('staticData.promptActionIds', promptActionIds); // NO I18N
                    }
                }
	        }
            this.set('promptActionIds', promptActionIds); // NO I18N
	    }
	    if(this.hideActions){
            var tableBody = this.element.querySelector('.opmFormHolder') // NO I18N
            if (tableBody) {
              var rows = tableBody.querySelectorAll('select'); // NO I18N
              for (var i = 0; i < rows.length; i++) {
                  rows[i].disabled = true;
              }
              rows = tableBody.querySelectorAll('input'); // NO I18N
              for (var i = 0; i < rows.length; i++) {
                  rows[i].disabled = true;
              }
            }
        }
	    this.send("updateSelectBox"); //No I18N
	    this.sendAction('action', 'commandsListInstance', this);
		this.disableMarkAsPublicMsg();
	},
	updateMarkAsPublic: function () {
		if (this.markAsPublicMap) {
			this.set('showMarkAsPublicCheckbox', this.markAsPublicMap.showMarkAsPublicCheckbox);//No I18N
			this.set('noteMsgMarkAsPublic', this.markAsPublicMap.noteMsg);//No I18N
			this.set('isPublic', this.markAsPublicMap.isPublic);//No I18N
		} else {
			this.set('showMarkAsPublicCheckbox', false);//No I18N
		}
	},
	disableMarkAsPublicMsg: function() {
		if ((!this.isStandard && ncmIsProbeOrProbeSelected() && this.isDistributed) || (this.isPublic && this.templateId)) {
			waitForElement("#markAsPublic", function () {//No I18N
				var checkBoxDiv = document.querySelector('input[name="markAsPublic"]'); // NO I18N
				if (checkBoxDiv) {
					var parentDiv = checkBoxDiv.closest('div.opmFormRow'); // NO I18N
					if (parentDiv) {
						parentDiv.classList.add('disabledBlock'); // NO I18N
					}
				}
			});
		}
	},
    saveData : function(){ // Throws error
        ncmValidateInputField(this.templateName, $('#commandTemplateName'));
        var rowsArrLen = this.rowsArr.length;
        var oldDataArrLen = this.copyArr.length;
        this.results = [];
        for(var i = 0; i < rowsArrLen; i++){
            var eachRowObj = this.rowsArr[i];
            var fieldId = $('#'+$("#commandTemplatesTable tr:nth-child("+(i+1)+")").attr("indexid")+'_inputRow').find('.cliCommandtext');
            ncmValidateInputField(eachRowObj.command, fieldId);
            if(eachRowObj.id == this.responseSelId){
                eachRowObj.responseSelection = true;
            }
            else{
                eachRowObj.responseSelection = false;
            }
            if(eachRowObj.promptActionId == '<-- Not Needed -->'){
                eachRowObj.promptActionId = 'NA'; //NO I18N
            }
            if(eachRowObj.isNewRow){ //row ADD handling
                var tempObj = Object.assign({}, eachRowObj);
                delete tempObj.isNewRow;
                delete tempObj.id;
                tempObj.operation = 'add'; //NO I18N
                this.results.pushObject(tempObj);
                continue;
            }
            for(var j = 0; j < oldDataArrLen; j++){ //row UPDATE handling
                var tempFinObj = {};
                var tempOldDataObj = this.copyArr[j];
                if(eachRowObj.id == tempOldDataObj.id){
                    var changeFound = false;
                    var keysToCheck = ['sequenceId', 'command', 'prompt', 'timeout', 'promptActionId', 'messageSuffix']; // NO I18N
                    for(var k = 0; k < keysToCheck.length; k++){
                        var key = keysToCheck[k];
                        if (eachRowObj[key] !== tempOldDataObj[key]) {
                            tempFinObj[key] = eachRowObj[key];
                            changeFound = true;
                        }
                    }
                    if(eachRowObj.responseSelection && !tempOldDataObj.responseSelection){
                        tempFinObj.responseSelection = true;
                        changeFound = true;
                    }
                    if(changeFound){
                        tempFinObj.operation = 'update'; // NO I18N
                        tempFinObj.recordId = eachRowObj.recordId;
                        tempFinObj.interactionId = eachRowObj.interactionId;
						tempFinObj.sequenceId = eachRowObj.sequenceId;
						delete tempFinObj.messageSuffixProvided;
                        this.results.pushObject(tempFinObj);
                    }
                    break;
                }
            }
        }
        if(this.deletedArr.length > 0){ // row DELETE handling
            this.results = this.results.concat(this.deletedArr);
        }
        return this.results;
    },
    getUiDataWithoutUpdateOperation : function(){ // Throws error
        var rowsArrLen = this.rowsArr.length;
        var oldDataArrLen = this.copyArr.length;
        this.results = [];
        for(var i = 0; i < rowsArrLen; i++){
            var eachRowObj = this.rowsArr[i];
            var fieldId = $('#'+$("#commandTemplatesTable tr:nth-child("+(i+1)+")").attr("indexid")+'_inputRow').find('.cliCommandtext');
            ncmValidateInputField(eachRowObj.command, fieldId);
            if(eachRowObj.id == this.responseSelId){
                eachRowObj.responseSelection = true;
            }
            else{
                eachRowObj.responseSelection = false;
            }
            if(eachRowObj.promptActionId == '<-- Not Needed -->'){
                eachRowObj.promptActionId = 'NA'; //NO I18N
            }
            var tempObj = Object.assign({}, eachRowObj);
            delete tempObj.isNewRow;
            delete tempObj.id;
			delete tempObj.messageSuffixProvided;
            tempObj.operation = 'add'; //NO I18N
            tempObj.recordId = '';
            tempObj.interactionId = '';
            this.results.pushObject(tempObj);
        }
        return this.results;
    },
    actions:{
        addRow : function (row, index) {
            try{
                for(var index = 0; index < this.rowsArr.length; index++){
                    ncmValidateInputField(this.rowsArr[index].command, $('#'+index+'_inputRow').find('.cliCommandtext'));
                }
                var copyObj = Object.assign({}, this.rowObj);
                var elementIndex = this.rowsArr.indexOf(row);
                var tempCopyArr = JSON.parse(JSON.stringify(this.rowsArr));
                var sequenceId = this.rowsArr[elementIndex].sequenceId + 1;
                for(var index = elementIndex+1; index < this.rowsArr.length; index++){
                    tempCopyArr[index].sequenceId++ ;
                }
                copyObj.id = new Date().getTime();
                copyObj.sequenceId = sequenceId;
                this.set('rowsArr',tempCopyArr); // NO I18N
                this.rowsArr.insertAt(elementIndex + 1, copyObj);
                this.send("updateSelectBox"); //No I18N
                this.set('deleteDisabled', !(this.rowsArr.length > 1)); // NO I18N
            }
            catch(error){}
        },
        deleteRow : function (row) {
            this.rowsArr.removeObject(row);
            if(this.responseSelId == row.id){
                this.responseSelId = this.rowsArr[0].id;
                var tempCopyArr = JSON.parse(JSON.stringify(this.rowsArr));
                tempCopyArr[0].responseSelection = true;
                this.set('rowsArr',tempCopyArr);
            }
            if(!row.isNewRow){
                var obj = {
                    recordId : row.recordId,
                    operation : 'delete',
                    interactionId : row.interactionId
                }
                this.deletedArr.push(obj);
            }
            this.set('deleteDisabled', !(this.rowsArr.length > 1)); // NO I18N
        },
        handleResponseSel : function(rowId){
            this.set('responseSelId', rowId);
        },
        cancel : function(){
            this.clearData();
        },
        updateSelectBox : function(){
            setTimeout(function () {
                $('.msgSuffix select').select2();
                $('.promptActionId select').select2();
            }, 10);
        },
		markAsPublic: function () {
			this.set('isPublic', !this.isPublic);//NO I18N
			var __self = this;
			setTimeout(function () {
				$('input[name=markAsPublic]').prop('checked', __self.isPublic);
			}, 10);
		}
    },
    clearData : function(){
        this.set('rowsArr', []); //NO I18N
        this.rowsArr.clear();
        this.set('executionGroupId', ''); //NO I18N
        this.set('templateName', ''); //NO I18N
        this.set('templateDesc', ''); //NO I18N
        this.set('copyArr', []); //NO I18N
        this.set('deletedArr', []); //NO I18N
        this.set('showResponseSelectionUI', true); //NO I18N
        this.set('results', []); //NO I18N
        this.set('responseSelId', 0); //NO I18N
    },
	willDestroyElement: function(){
	    this._super();
	    this.clearData();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmDynamicCriteriaNewComponent = Ember.Component.extend({
     // used to change the handlebar html based on design, still the internal logic will be same for all.
    type : 'v1', // NO I18N
    page : false, // used to filter the columns list based on feature page. For compliance rule platform only few is needed.
    filterId : false,
    dataArr : [],
    filterType : 'criteria', // NO I18N
    allCriteriaColumns: [],
    optionsList: [],
    criteriaExpression : '',
    deleteDisabled : false,
    defaultCriteria : {
        id : 1,
        column_id : false,
        comparator : 'AND', // NO I18N
        condition : 'EQUAL', // NO I18N
        value : '',
        uniqueId : this.elementId + '_1' // NO I18N
    },
    conditions:[{value: Ember.I18n.t("webclient.admin.traps.equals"), key: "EQUAL"}, //No I18N
                {value: Ember.I18n.t("webclient.admin.traps.notequals"), key: "NOT_EQUAL"}, //No I18N
                {value: Ember.I18n.t("webclient.map.foldermonitor.select.filterfilecontains"), key: "LIKE"}, //No I18N
                {value: Ember.I18n.t("webclient.admin.traps.notcontains"), key: "NOT_LIKE"}, //No I18N
                {value: Ember.I18n.t("fwa.search.starts.with"), key: "STARTS_WITH"}, //No I18N
                {value: Ember.I18n.t("fwa.search.ends.with"), key: "ENDS_WITH"}], //No I18N

    init : function(){
        this._super();
//        this.clearData();
        if(!this.dataArr){
            this.dataArr = [];
        }
        else{
            this.refreshSequenceValues();
        }
        this.populateValues();
        this.updateOperatorAndDeleteOptions();
//        if(this.inputCriteriaList){
//            this.updateDataArr(this.inputCriteriaList);
//        }
    },
	didInsertElement: function () {
		this._super();
		this.sendAction('action', 'rulePlatformInstance', this);
        this.updateCriteriaExpression();
	},
    saveData : function(validate){
        if(validate == undefined || validate == true){
            this.validateList();
        }
        var result = {
            criteriaList : this.getDataArrAsParam(),
            criteriaExpression : this.criteriaExpression
        }
        return result;
    },
    validateList: function(startIndex){
        var index = (startIndex || startIndex > -1) ? startIndex : (this.skipValidation ? 1 : 0);
        for(; index < this.dataArr.length; index++){
            var eleId = this.dataArr[index].uniqueId;
            if(eleId){
                while(!document.getElementById(eleId)){
                    continue;
                }
                ncmValidateInputField(this.dataArr[index].value, '#'+eleId); // NO I18N
            }
        }
    },
    actions:{
        add : function (elementIndex) {
            try{
                this.validateList(0);
                this.dataArr.insertAt(elementIndex + 1, jQuery.extend(true, {},this.defaultCriteria));
                this.criteriaExpression = '';
                this.refreshSequenceValues();
            }
            catch(error){}
        },
        remove : function (elementIndex) {
            this.dataArr.removeAt(elementIndex);
            this.criteriaExpression = '';
            this.refreshSequenceValues();
        },
        toggleOperator : function(id){
            var index = id-1;
            var comparator = this.dataArr[index].comparator;
            this.criteriaExpression = '';
            if(comparator == 'AND'){
                this.dataArr[index].comparator = 'OR';
            }
            else{
                this.dataArr[index].comparator = 'AND';
            }
            this.refreshSequenceValues();
        }
    },
    updateOperatorAndDeleteOptions:function(){
        for(var i = 0; i < this.dataArr.length; i++){
            if(!this.dataArr[i].comparator){
                this.dataArr[i].comparator = 'AND';
            }
        }
        this.deleteDisabled = !(this.dataArr.length > 1);
        if(this.dataArr.length > 0){
            this.dataArr[this.dataArr.length-1].comparator = false;
        }
    },
    refreshSequenceValues : function(){
        for(var index = 0; index < this.dataArr.length; index++){
            this.dataArr[index].uniqueId = this.elementId + '_' + index + 1;
            this.dataArr[index].id = index + 1;
        }
        this.updateOperatorAndDeleteOptions();
        var tData = JSON.parse(JSON.stringify(this.dataArr));
        this.set('dataArr', []); // NO I18N
        this.set('dataArr', tData); // NO I18N
        this.updateCriteriaExpression();
    },
    updateCriteriaExpression : function(){
        if(this.criteriaExpression && this.criteriaExpression.trim().length > 0){
            return;
        }
        var pattern = "";
        for(var i = 0; i < this.dataArr.length; i++) {
            var criteria = this.dataArr[i];
            if(i > 0) {
                pattern += " ";
            }
            pattern += (i + 1);
            if(i > 0) {
                pattern = "(" + pattern + ")";
            }
            if((i != (this.dataArr.length - 1))) {
                pattern += " " + criteria.comparator;
            }
        }
        this.set('criteriaExpression', pattern); // NO I18N
    },
    populateValues : function(){
        if(this.allCriteriaColumns && this.allCriteriaColumns.length == 0){
            var data = {'filter_type' : this.filterType} //No I18N
            if(this.filterId){
                data.filter_id = this.filterId;
            }
            if(this.page){
                data.page = this.page;
            }
            var url = window.OPM.apiUrlPattern + "/ncmclient/getFilterDetails";//No I18N
            var jsonData = opm_ajaxGetResponse(url,data);
            if(jsonData.isSuccess){
                this.defaultCriteria.column_id = jsonData.all_criteria_columns[0].id;
                if(!(this.dataArr && this.dataArr.length > 0)){
                    if(jsonData.criteria_list && jsonData.criteria_list.length > 0){
                        this.updateDataArr(jsonData.criteria_list);
                        this.criteriaExpression = jsonData.criteria_expression;
                    }
                    else{
                        this.dataArr.push(jQuery.extend(true, {},this.defaultCriteria));
                    }
                }
                this.allCriteriaColumns = jsonData.all_criteria_columns;
            }
        }
    },
//    updateInput : function(){
//        this.updateDataArr(this.inputCriteriaList);
//    }.observes('inputCriteriaList'), // NO I18N
    updateDataArr : function(responseArr){
        var tArr = [];
        for(var i = 0; i < responseArr.length; i++){
            var eachObj = responseArr[i];
            var newObj = {
                column_id : eachObj.column_id,
                comparator : eachObj.comparator,
                condition : eachObj.condition,
                value : eachObj.value
            }
            tArr.push(newObj);
        }
        this.dataArr = tArr;
        this.refreshSequenceValues();
    },
    getDataArrAsParam : function(){
        var tArr = [];
        this.dataArr[this.dataArr.length-1].comparator = 'AND'; // NO I18N
        for(var i = 0; i < this.dataArr.length; i++){
            var eachObj = this.dataArr[i];
            var newObj = {
                column_id : eachObj.column_id,
                comparator : eachObj.comparator,
                condition : eachObj.condition,
                value : eachObj.value
            }
            tArr.push(newObj);
        }
        return tArr;
    },
    clearData : function(){
        this.dataArr.clear();
    },
	willDestroyElement: function(){ // dont call clearData here, on rerender it will clear it
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmCompRuleSimpleComponent = Ember.Component.extend({
    isRuleInfo : false,
    origInput : {},
    defaultSimpleConditions : [],
    defaultAdvConditions : [],
    defaultCounts : [],
    hideBlockInfo : false,
    resultId : false,
    selectedTab : {},
    validateData : false,
    init : function(){
        this._super();
        this.origInput = jQuery.extend(true, {},this.input);
        this.populateInputs();
        this.populateAdvDefaultConditions();
        if(!this.enableBlockIdentificationCriteria){
            this.set('hideBlockInfo', true); // NO I18N
        }
        if(this.isStandard || (ncmIsProbeOrProbeSelected() && this.isDistributed)){
            this.set('editNotAllowed', true); // NO I18N
        }
		this.updateMarkAsPublic();
    },
	didInsertElement: function () {
		this._super();
		setTimeout(function() {
		    ncmMaxScreen(false);
        },10);
        this.populateCriteriaType();
        this.populateCheckBoxFields();
        $('.select2').select2();
        this.setHeight(false);

	},
	updateMarkAsPublic: function () {
		if (!this.isStandard) {
			this.set('showMarkAsPublicCheckbox', true);//No I18N
			if (ncmIsProbeOrProbeSelected() && this.isDistributed) {
				this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.ruleDistributed.msg', this)); // NO I18N
			} else {
				this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.rule.msg', this)); // NO I18N
			}
		} else {
			this.set('showMarkAsPublicCheckbox', false);//No I18N
		}
	},
	disableMarkAsPublicMsg: function() {
		if ((!this.isStandard && ncmIsProbeOrProbeSelected() && this.isDistributed) || (this.isPublic && this.input && this.input.ruleId)) {
			waitForElement("#markAsPublic", function () {//No I18N
				var checkBoxDiv = document.querySelector('input[name="markAsPublic"]'); // NO I18N
				if (checkBoxDiv) {
					var parentDiv = checkBoxDiv.closest('div.opmFormRow'); // NO I18N
					if (parentDiv) {
						parentDiv.classList.add('disabledBlock'); // NO I18N
					}
				}
			});
		}
	},
	populateCheckBoxFields : function(){
		$("input[name=parseType][value="+this.input.parseType+"]").prop("checked",true);
        $("input[name=enableBlockIdentificationCriteria]").prop("checked",this.enableBlockIdentificationCriteria);
	},
	populateCheckBoxFieldsWithDelay : function(){
		var __self = this;
		setTimeout(function(){
		    __self.populateCheckBoxFields();
		}, 1000);
	}.observes('validateData'), // NO I18N
	populateInputs : function(){
	    if(!this.input){
	        this.input = {};
        }
        if(!this.input.parseType){
            this.input.parseType = 'MULTI'; // NO I18N
        }
		this.populateSimpleDefaultConditions();
		this.populateDefaultCounts();
		if(this.input.blockCriteria && this.input.blockCriteria.criteriaList && this.input.blockCriteria.criteriaList.length > 0){
		    this.enableBlockIdentificationCriteria = true;
		}
	},
	populateSimpleDefaultConditions : function(){
	    if(this.defaultSimpleConditions.length > 0){
            return;
        }
        this.defaultSimpleConditions.push(
            {
                key : 'SHOULD_CONTAIN_ALL_LINES', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_CONTAIN_ALL_LINES') // NO I18N
            },
            {
                key : 'SHOULD_NOT_CONTAIN_ANY', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_NOT_CONTAIN_ANY') // NO I18N
            },
            {
                key : 'SHOULD_CONTAIN_EXACT_SET', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_CONTAIN_EXACT_SET') // NO I18N
            },
            {
                key : 'SHOULD_NOT_CONTAIN_EXACT_SET', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_NOT_CONTAIN_EXACT_SET') // NO I18N
            },
            {
                key : 'SHOULD_CONTAIN_ONLY', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_CONTAIN_ONLY') // NO I18N
            }
        );
	},
	populateAdvDefaultConditions : function(){
	    if(this.defaultAdvConditions.length > 0){
            return;
        }
        this.defaultAdvConditions.push(
            {
                key : 'SHOULD_CONTAIN', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_CONTAIN') // NO I18N
            },
            {
                key : 'SHOULD_NOT_CONTAIN', // NO I18N
                value : OPMClient.NCMComplianceUtilController.formatWithI18n('SHOULD_NOT_CONTAIN') // NO I18N
            }
        );
	},
    populateDefaultCounts : function(){
        if(this.defaultCounts.length > 0){
            return;
        }
        this.defaultCounts.push({
            key : '-1', // NO I18N
            value : Ember.I18n.t("any") // NO I18N
        });
        for(var ctr = 1; ctr <= 50; ctr++){
            this.defaultCounts.push(
                {
                    key : ctr,
                    value : ctr
                }
            );
        }
    },
	populateCriteriaType : function(){
	    if(!this.input.criteriaType){
            this.set('input.criteriaType', 'SIMPLE'); // NO I18N
        }
        this.updateTabSelection(this.input.criteriaType);
	},
	updateTabSelection : function(selectedTab){
	    $('.tabStatic li').siblings('li').removeClass('active');
        var _selectedTab = {};
        if(selectedTab == 'SIMPLE'){
            _selectedTab.SIMPLE = true;
        }
        else if(selectedTab == 'ADVANCED'){;
            _selectedTab.ADVANCED = true;
        }
        else if(selectedTab == 'ADVANCEDBLOCKCRITERIA'){
            _selectedTab.ADVANCEDBLOCKCRITERIA = true;
        }
        this.set('selectedTab', _selectedTab); // NO I18N
	},
	loadUiSelections : function(){
        if(this.input.criteriaType == 'SIMPLE'){
            ncmValidateInputField(this.input.criteria.pattern, '#simplePattern'); // NO I18N
        }
        else if(this.input.criteriaType == 'ADVANCED'){
            if(this.criteriaListInstance){
                this.input.criteria = this.criteriaListInstance.saveData();
            }
        }
        else if(this.input.criteriaType == 'ADVANCEDBLOCKCRITERIA'){
            ncmValidateInputField(this.input.startBlock, '#startBlock'); // NO I18N
            if(this.criteriaListInstance){
                this.input.criteria = this.criteriaListInstance.saveData();
            }
            if(this.blockIdentificationInstance && this.enableBlockIdentificationCriteria){
                this.input.blockCriteria = this.blockIdentificationInstance.saveData();
            }
            this.input.parseType = $('input[name=parseType]:checked').val();
        }
        return this.input;
	},
	getUiSelections : function(){
	    var result = {};
        result.criteriaType = this.input.criteriaType;
        if (this.input.criteriaType == 'SIMPLE') {
            if (this.input.criteria) {
                var criteria = {};
                criteria.condition = this.input.criteria.condition;
                criteria.count = this.input.criteria.count;
                criteria.pattern = this.input.criteria.pattern;
                result.simpleCriteria = JSON.stringify(criteria);
            }
        }
        else{
            if(this.criteriaListInstance){
                this.input.criteria = this.criteriaListInstance.saveData(false);
                result.criteria = JSON.stringify(this.input.criteria);
            }
            if (this.input.criteriaType === 'ADVANCEDBLOCKCRITERIA') {
                if (this.enableBlockIdentificationCriteria && this.blockIdentificationInstance) {
                    this.input.blockCriteria = this.blockIdentificationInstance.saveData(false);
                    result.blockCriteria = JSON.stringify(this.input.blockCriteria);
                }
                result.startBlock = this.input.startBlock;
                result.endBlock = this.input.endBlock;
                result.parseType = this.input.parseType;
            }
        }
        return result;
	},
    actions:{
        blockIdentificationAction : function(functionName, param1, param2){
            if(functionName == 'criteriaListInstance'){
                this.set('blockIdentificationInstance', param1); // NO I18N
            }
        },
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        criteriaListInstance: function(child) {
            this.set('criteriaListInstance', child); // NO I18N
        },
        violationInstance: function(child) {
            this.set('violationInstance', child); // NO I18N
        },
        updateEnableBlockIdentificationCriteria : function(){
            this.set('enableBlockIdentificationCriteria', !this.enableBlockIdentificationCriteria); // NO I18N
            if(this.enableBlockIdentificationCriteria){
                this.set('hideBlockInfo', false); // NO I18N
            }
            var __self = this;
            setTimeout(function(){
                $('input[name=enableBlockIdentificationCriteria]').prop('checked',__self.enableBlockIdentificationCriteria);
            },10);
        },
        changeCriteriaType : function(selectedCriteria){
            this.updateTabSelection(selectedCriteria);
            if(selectedCriteria == 'SIMPLE'){
                this.input.criteria = this.origInput.criteria;
            }
            else{
                if(this.criteriaListInstance){
                    this.input.criteria = this.criteriaListInstance.saveData(false);
                }
                if(this.blockIdentificationInstance){
                    this.input.blockCriteria = this.blockIdentificationInstance.saveData(false);
                }
            }
            this.set('input.criteriaType', selectedCriteria); // NO I18N
            var __self = this;
            setTimeout(function(){
                if(selectedCriteria == 'ADVANCEDBLOCKCRITERIA'){
                    __self.populateCheckBoxFields();
                }
                else{
                    if(!__self.enableBlockIdentificationCriteria){
                        __self.set('hideBlockInfo', true); // NO I18N
                    }
                }
            },0);
        },
        cancel : function(){
            if (location.href.indexOf('/Policies/EditRule') != -1) {
                window.history.back();
            } else {
                location.href=  OPMClient.NCMComplianceListController.baseUrl+"/ListRules/All"; // NO I18N
            }
        },
        validateNew : function(){
            try{
                var validate = {};
                validate.data = this.getUiSelections();
                this.loadUiSelections();
                this.set('validateData', validate); // NO I18N
            }
            catch(error){}
        },
        next : function(){
            try{
                this.loadUiSelections();
                this.set('isRuleInfo', true); // NO I18N
                this.setHeight(true);
				this.disableMarkAsPublicMsg();
            }
            catch(error){}
        },
        back : function(){
            this.set('isRuleInfo', false); // NO I18N
            this.setHeight(false);
            var __self = this;
            var selectedTab = this.input.criteriaType;
            setTimeout(function(){
                __self.populateCheckBoxFields();
                __self.updateTabSelection(selectedTab);
            },0)
        },
        save : function(){
            try{
                ncmValidateInputField(this.input.ruleName, '#ruleNameField'); // NO I18N
                var result = this.getUiSelections();
                if(this.violationInstance){
                    var violationResult = this.violationInstance.saveData();
                    result.violationSeverity = violationResult.violationSeverity;
                    if(violationResult.remediationConfiglet){
                        result.remediationConfiglet = violationResult.remediationConfiglet;
                    }
                    result.remediationProcedure = violationResult.remediationProcedure;
                }
                result.ruleName = this.input.ruleName;
                result.ruleDescription = this.input.ruleDescription;
				if (this.isPublic) {
					result.markAsPublic = true;
				}
                this.sendAction('action', result); // Sending data to route declared action
            }
            catch(error){}
        },
		markAsPublic: function () {
			this.set('isPublic', !this.isPublic);//NO I18N
			var __self = this;
			setTimeout(function () {
				$('input[name=markAsPublic]').prop('checked', __self.isPublic);
			}, 10);
		}
    },
    setHeight : function(isRule){
        if(isRule){
            $(this.element).find('.opmFormHolder').removeClass('top250');
            $(this.element).find('.opmFormHolder').addClass('top190');
        }
        else{
            $(this.element).find('.opmFormHolder').addClass('top250');
            $(this.element).find('.opmFormHolder').removeClass('top190');
        }
    },
    updateChange: function(field, resultObject){
        var newData = this.input[field];
        if(newData != this.origInput[field]){
            resultObject[field] = newData;
        }
    },
	willDestroyElement: function(){
	    this._super();
	    ncmRevertMaxScreen();
	}
});
OPMClient.NcmRuleResultFilterComponent = Ember.Component.extend({
    init : function(){
        this._super();
        this.preRender();
    },
    didInsertElement : function(){
        this._super();
    },
    preRender : function(){
        if(!this.selectedFilter){
            this.set('selectedFilter', 'All'); // NO I18N
        }
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        updateComplianceResult : function(selectedResult){
            this.set('selectedFilter', selectedResult); // NO I18N
        }
    },
    willDestroyElement : function(){
    }
});
OPMClient.NcmRuleResultComponent = Ember.Component.extend({
    isLocalReRender : false,
    isBlockView : false,
    currLayerData : false,
    isExpandAll : false,
    isExpandAllBlock : true,
    layerDataArr : [],
    breadCrumbData : [],
    pagingData : {},
    filterList : [],
    selectedFilter : 'All', // NO I18N
	complianceStatusList : [],
	selectedStatusForManualReview : false,
	isSnapView : false,
    init : function(){
		this._super();
		var complianceResultItems = getComplianceResultItems();
		if(this.isManualReviewRequired){
			if(complianceResultItems && complianceResultItems.length > 0){
				this.complianceStatusList = [];
				for(var i = 0; i < complianceResultItems.length; i++){
					var item = complianceResultItems[i];
					this.complianceStatusList.push({'key' : item,'value' : item}); // NO I18N
				}
			}
			if(this.complianceStatus){
				this.selectedStatusForManualReview = this.complianceStatus;
				if(this.complianceStatus == 'ATTENTION'){
					this.selectedStatusForManualReview = this.complianceStatus;
					this.complianceStatusList.push({'key' : this.complianceStatus,'value' : this.complianceStatus}); // NO I18N
				}
			}
		}
		if(this.data && this.data.rulePlatformFilter == 'true'){ // NO I18N
		    this.set('showRuleFilterError', this.data.message); // NO I18N
		}

		if(this.isRemediationView){
            this.selectedFilter = 'Violation'; // NO I18N
        }
		this.layerDataArr.clear();
        this.layerDataArr.push(this.data);
		this.loadCurrLayerData();
		this.pagingData = ncmGetNewBlockPagingData();
		this.filterList = [
		    {
		        'name' : 'All' // NO I18N
		    },
		    {
                'name' : 'Compliant' // NO I18N
            },
            {
                'name' : 'Violation' // NO I18N
            }
		];
    },
	didInsertElement: function () {
		this._super();
        if(!this.disableMaxScreen){
		    ncmMaxScreen(true);
		}
        OPMClient.NCMComplianceRulesController.set('resultData', this.layerDataArr); // NO I18N
        this.loadBreadCrumbData();
		if(window.OPM.isOPM || window.OPM.isNFA){
		    $(this.element).find('#complaince-rules-result-container').addClass('compliance-result-opm');
		    $(this.element).find('#complaince-rules-result-container .header').addClass('mh-46');
		}
		this.set('isSnapView', location.href.indexOf('/Inventory/Snapshot') > 0); // NO I18N
	},
	loadCurrLayerData : function(){
	    this.currLayerData = this.layerDataArr[this.layerDataArr.length - 1];
	    if(this.currLayerData && this.currLayerData.pagingData){
	        this.pagingData = this.currLayerData.pagingData;
	    }
	    else{
		    this.pagingData = ncmGetNewBlockPagingData();
	    }
        this.set('isExpandAllBlock', true); // NO I18N
        if(this.currLayerData && this.currLayerData.type == 'LOOP'){
            this.set('isExpandAllBlock', false); // NO I18N
        }
	    this.isLocalReRender = true;
	    this.rerender();
	    this.isLocalReRender = false;
	},
    loadBreadCrumbData : function(){
        var tempBreadCrumbData = [];
        var pushData = function(title, isLast){
            var tempObj = {
                'name' : title // NO I18N
            }
            if(!isLast){
                tempObj.showArrow = true;
            }
            tempBreadCrumbData.push(tempObj);
        }
        if(this.layerDataArr && this.layerDataArr.length > 1){
            pushData(this.ruleName);
            var layerDataLen = this.layerDataArr.length;
            for(var i = 1; i < layerDataLen; i++){
                var tData = this.layerDataArr[i];
                if(tData.type == 'LOOP'){
                    var tempTitle = (tData.itemDetails && tData.itemDetails.operation && tData.itemDetails.operation.details && tData.itemDetails.operation.details.name)
                        ? tData.itemDetails.operation.details.name
                        : 'Loop list'; // NO I18N
                    if(i < layerDataLen-1){
                        tempTitle = tempTitle + this.layerDataArr[i+1].blockIndex;
                    }
                    pushData(tempTitle, i == layerDataLen-1);
                }
                else{
                    pushData(tData.itemDetails.operation.details.name, i == layerDataLen-1);
                }
            }
        }
        else{
            pushData(this.ruleName, true);
        }
        this.set('breadCrumbData', tempBreadCrumbData); // NO I18N
        setTimeout(function(){
            var titleDivs = $('#complaince-rules-result-container .breadcrumb-item .dropdown-label div');
            if(titleDivs && titleDivs.length > 0){
                titleDivs[titleDivs.length-1].style.fontFamily = 'LatoBold'; // NO I18N
            }
        },0);
    },
    refreshFilterData : function(){
        this.currLayerData.pagingData = ncmGetNewBlockPagingData();
        this.loadCurrLayerData();
    }.observes('selectedFilter'), // NO I18N
    updateManualReviewStatus : function(){
        if(this.selectedStatusForManualReview && this.selectedStatusForManualReview != 'ATTENTION'){ // NO I18N
			OPMClient.NCMCompliance.updateRuleComplianceStatus(this.ruleId, this.policyId, this.resourceId, this.complianceStatus, this.selectedStatusForManualReview);
			var complianceResultItems = getComplianceResultItems();
			var complianceStatusListTemp = complianceResultItems.map(function(item) {
				return { key: item, value: item };
			});
			this.set('complianceStatusList', complianceStatusListTemp); // NO I18N
		}
    }.observes('selectedStatusForManualReview'), // NO I18N
	actions:{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        blockInstance : function(child){
            this.set('blockInstance', child); // NO I18N
        },
        loadBlockDetails: function(param){
            if(param){
                param.pagingData = jQuery.extend(true, {}, ncmGetNewBlockPagingData());
                if(param.filter){
                    this.selectedFilter = param.filter;
                    delete param.filter;
                }
                else{
                    this.selectedFilter = 'All'; // NO I18N
                }
                this.layerDataArr.push(param);
                this.loadCurrLayerData();
            }
        },
        changeViewByIndex : function(index){
            if(!index && index != 0){
                return;
            }
            if(this.isRemediationView){
                this.selectedFilter = 'Violation'; // NO I18N
            }
            var len = this.layerDataArr.length;
            if(len > 1){
                var copyData = this.layerDataArr.slice(0,index+1);
                this.set('layerDataArr', copyData); // NO I18N
                this.loadCurrLayerData();
            }
        },
	    back : function(){
	        window.history.back();
	        waitForElement('#deviceNameSearch', function(){// No I18N
	            if (location.href.indexOf('NCMCompliance/Policies') != -1 && location.href.indexOf('BulkRemediate') == -1) {
	                try {
	                    if (OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceNameBackup) {
                            var input = document.getElementById('deviceNameSearch');
                            input.value = OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceNameBackup;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            OPMClient.NCMCompliancePolicyController.headerCompInstance.send('deviceNameSearchAction');
                        } else {
	                        OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                        }
	                } catch (e) {}
	            }
	            else if(location.href.indexOf('BulkRemediate') > -1 && OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance){
	                OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.closeRuleResultView();
	            }
	        });
	    },
	    expandAll : function(){
	        this.set('isExpandAllBlock', !this.isExpandAllBlock); // NO I18N
	    },
        showPage : function(pageNumber){
            this.set('pagingData.currPageNum', pageNumber); // NO I18N
            var __self = this;
            setTimeout(function(){
                if(__self.blockInstance){
                    __self.blockInstance.populateData();
                }
            },0);
        },
        changePageSize : function(pageSize){
            this.set('pagingData.currPageSize', pageSize); // NO I18N
            this.set('pagingData.currPageNum', 1); // NO I18N
            if(this.blockInstance){
                this.blockInstance.populateData();
            }
        },
        executeConfiglet : function(){
            var remediationDataTemp = this.get('remediationData'); // NO I18N
            var localVariables = remediationDataTemp.localVariables;
            try{
                var variables = {};
                var VAR_NAMES = new Array();
                if(localVariables){
                    for(var i = 0; i < localVariables.length; i++){
                        ncmValidateInputField(localVariables[i].value, '#configletvalue_'+i+' input'); // NO I18N
                        variables[localVariables[i].name] = localVariables[i].value;
                        VAR_NAMES.push(localVariables[i].name);
                    }
                }
                var selDev = new Array();
                selDev.push(this.resourceId);
                var data = {
                    TEMPLATE_ID : remediationDataTemp.remediationConfiglet,
                    BACKUP_BEFORE_TEMPLATE : remediationDataTemp.BACKUP_BEFORE_TEMPLATE,
					BACKUP_AFTER_TEMPLATE : remediationDataTemp.BACKUP_AFTER_TEMPLATE,
                    VARIABLES : JSON.stringify(variables),
                    VAR_NAME : JSON.stringify(VAR_NAMES),
                    EXEC_TYPE : 'REMEDIATION_'+remediationDataTemp.remediationConfiglet, // NO I18N
                    ComponentSelection : 'SpecificDevice', // NO I18N
                    SELECTEDDEVICES : JSON.stringify(selDev),
                    ruleId : this.ruleId,
                    policyId : this.policyId
                };
				// ncmValidateInputField(this.remediationLabel, '#remediationLabel'); // NO I18N
				if (this.remediationLabel) {
					data.remediationLabel = this.remediationLabel;
				}
                if(remediationDataTemp.additionalProps){
                    data.uniqueId = remediationDataTemp.additionalProps.uniqueId;
                    data.itemId = remediationDataTemp.additionalProps.itemId;
                }
                if(this.resultId){
                    data.resultId = this.resultId;
                }
                var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/execConfiglet'; // NO I18N
                opm_ajaxPostMethod(ajaxRequestUrl,data,{callback: function(jsonData){
                    var	cls = "errorMsg"; //No I18N
                    var msg = "";
                    if(jsonData.isSuccess) {
                        msg = jsonData.statusMsg;
                        cls = "successMsg"; //No I18N
                        if(remediationDataTemp.additionalProps && remediationDataTemp.additionalProps.emberId){
                            $('#' + remediationDataTemp.additionalProps.emberId + ' .accordion-inner .right-align').text(Ember.I18n.t('ncm.complianceiq.result.remediation_executed_success')); // NO I18N
                        }
                        ncmusrsts1("remediate_device_compliance"); //NO I18N
                    }
                    else if(jsonData.error !== undefined){
                        msg = jsonData.error.message;
                        cls = "errorMsg";	 //No I18N
                    } else {
                        cls = "errorMsg";	 //No I18N
                        msg = jsonData.statusMsg;
                    }
                    // opm_infoMsgs(cls, msg);
					OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls, msg);
                    slideOutWithId('remediationSlide'); // NO I18N
                    $('#remediationSlide').css('display','none');
                    $('#commandOutputDetails').css('display','none');
                }, otpPageType: "dialog"});//NO I18N
            }
            catch(error){}
        },
        cancelRemediation : function(){
            slideOutWithId('remediationSlide'); // NO I18N
            $('#remediationSlide').css('display','none');
        },
        applyRemediation : function(data){
            var remediationData = {
                remediationConfiglet : data.remediationConfiglet,
                remediationConfigletRunTimeParams : data.remediationConfigletRunTimeParams
            };
            var configletData = OPMClient.NCMComplianceRulesController.getConfigletDetails(remediationData.remediationConfiglet);
            if(configletData){
                var configletVariables = configletData.variables;
                if(configletVariables && configletVariables.length > 0){
                    var localVariables = [];
                    for(var i = 0; i < configletVariables.length; i++){
                        var variableData = {};
                        variableData.name = configletVariables[i].name;
                        variableData.value = remediationData.remediationConfigletRunTimeParams[configletVariables[i].name] ? remediationData.remediationConfigletRunTimeParams[configletVariables[i].name] : '';
                        variableData.displayName = configletVariables[i].displayName ? configletVariables[i].displayName : configletVariables[i].name;
                        localVariables.push(variableData);
                    }
                    remediationData.localVariables = localVariables;
                }
                remediationData.name = configletData.templateName;
                remediationData.desc = configletData.templateDesc;
                remediationData.type = configletData.templateType;
                remediationData.additionalProps = {
                    uniqueId : data.uniqueId,
                    itemId : data.itemId,
                    emberId : data.emberId
                }
				remediationData.BACKUP_BEFORE_TEMPLATE = configletData.BACKUP_BEFORE_TEMPLATE;
				remediationData.BACKUP_AFTER_TEMPLATE = configletData.BACKUP_AFTER_TEMPLATE;
                this.set('remediationData', remediationData); // NO I18N
                slideInWithId('remediationSlide'); // NO I18N
                $('#remediationSlide').css('display','block');
                if(location.href.indexOf('Reports/NCM/CustomReportDetails') != -1){
                    this.element.querySelector('.slideContentContainer').style.width = '700px'; // NO I18N
                }
            }
        },
        showXpathResult: function(data){
            slideInWithId('xPathResultDetails'); // NO I18N
            $('#xPathResultDetails').css('display','block');
            this.set('xPathResultData', data.xPathResult); // NO I18N
        },
        closeXpathResult: function(){
            slideOutWithId('xPathResultDetails'); // NO I18N
            $('#xPathResultDetails').css('display','none');
            this.set('xPathResultData', ''); // NO I18N
        },
        showCommandResult : function(data){
            slideInWithId('commandOutputDetails'); // NO I18N
            $('#commandOutputDetails').css('display','block');
            if(location.href.indexOf('Reports/NCM/CustomReportDetails') != -1){
                this.element.querySelector('#commandOutputDetails .slideContentContainer').style.width = '700px'; // NO I18N
            }
            var url = window.OPM.apiUrlPattern + "/ncmcompliance/getRuleCommandOutputResult?itemId="+data.itemDetails.id;//No I18N
            if(data.uniqueId){
                url += '&uniqueId='+ data.uniqueId; // NO I18N
            }
            if(this.resultId){
                url += '&resultId='+ this.resultId; // NO I18N
            }
            if(this.ruleId){
                url += '&ruleId='+ this.ruleId; // NO I18N
            }
            if(this.resourceId){
                url += '&resourceId='+ this.resourceId; // NO I18N
            }
            var jsonData = opm_ajaxGetResponse(url);
            if(jsonData.isSuccess){
                if(jsonData.commandOutput && jsonData.commandOutput.length > 0){
                    this.set('commandResponseArr', jsonData.commandOutput.split('\n')); // NO I18N
                    this.set('commandTemplateArr', jsonData.commandsList); // NO I18N
                    this.set('commandTemplateName', jsonData.templateName); // NO I18N
                    this.set('commandTemplateDesc', jsonData.templateDesc); // NO I18N
                }
            }
        },
        closeCommandResult : function(){
            slideOutWithId('commandOutputDetails'); // NO I18N
            $('#commandOutputDetails').css('display','none');
        },
		viewRule : function(ruleId){
			if(ruleId){
				OPMClient.NCMComplianceRulesController.set('isRuleViewOnly', true); // NO I18N
				location.href = OPMClient.NCMComplianceListController.baseUrl + '/Policies/EditRule/' + ruleId; // NO I18N
			}
		}
	},
	willDestroyElement: function(){
	    this._super();
//	    if(!this.isLocalReRender){
//	        OPMClient.NCMComplianceListController.clearComplianceResult(this.resultId);
//	    }
        $('#'+this.elementId).find('*').remove();
        if(!(this.isAdhocTest || this.disableMaxScreen)){
            ncmRevertMaxScreen();
        }
	}
});
OPMClient.NcmRuleResultContainerComponent = Ember.Component.extend({
    init : function(){
        this._super();
    },
    actions : {
        childActions:function(functionName,param1, param2) {
            this.sendAction('action', functionName, param1);
        }
    },
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmRuleResultEachContainerComponent = Ember.Component.extend({
	classNames:["rules-result-item"], // NO I18N
	scopeTitle : '',
	remediationAvailable : false,
	remediationAppliedNow : false,
    finalResult : false,
    init : function(){
        this._super();
        if(this.data.type == 'BLOCK'){ // to show success or failure in left path
            if(this.data.metaInfo && this.data.metaInfo.blockCount > 0){
                this.finalResult = true;
            }
        } else if(this.data.type == 'CONDITION'){
            this.finalResult = this.data.result.finalResult;
        } else if(this.data.type == 'VIOLATION'){
            this.remediationAvailable = this.data.remediationConfiglet && this.data.remediationConfiglet > 0;
        } else if (this.data.type === 'LOOP') {
			this.finalResult = this.data.metaInfo && this.data.metaInfo.finalResult && this.data.metaInfo.finalResult !== 'VIOLATION'; // NO I18N
		}

		if (this.data.remediationProcedure){
			this.set('remediationProcedureLines', this.data.remediationProcedure.split('\n')); // NO I18N
		}
		if (this.data.violationMessage){
			this.set('violationMessageLines', this.data.violationMessage.split('\n')); // NO I18N
		}

        if(this.data.itemDetails && this.data.itemDetails.scope.type){
            this.scopeTitle = OPMClient.NCMComplianceUtilController.getScopeDisplayName(this.data.itemDetails.scope.type);
        }
    },
    didInsertElement : function(){
        this._super();
        this.set('remediationAppliedNow', false); // NO I18N
        if(this.isRemediationView && this.data.type == 'VIOLATION'){
            this.isExpandAllBlock = true;
        }
        if(this.isExpandAllBlock){
            this.set('isMinimalView', false); // NO I18N
        }
        if(this.data.type == 'COMPLIANT' || this.data.type == 'VIOLATION' || this.data.type == 'NOT_REQUIRED'){
            var classNameToAdd = 'status_compliant_block'; // NO I18N
            if(this.data.type == 'VIOLATION'){
                classNameToAdd = 'status_violation_block'; // NO I18N
            }
            if(this.data.type == 'NOT_REQUIRED'){
                classNameToAdd = 'status_not_required_block'; // NO I18N
            }
            $(this.element).find('.rules-result-icon').addClass(classNameToAdd);
        }
    },
    actions:{
        showBlockList : function(blockData, filter){
            blockData.blockIndex = this.blockIndex;
            blockData.uniqueId = this.uniqueId;
            if(filter){
                blockData.filter = filter;
            }
            this.sendAction('action','loadBlockDetails',blockData);
        },
        toggleMiniView : function(){
            this.set('isMinimalView', !this.isMinimalView); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.sendAction('action', functionName, param1);
        },
        applyRemediation : function(data){
            if(this.uniqueId){
                data.uniqueId = this.uniqueId;
            }
            data.emberId = this.elementId;
            this.sendAction('action', 'applyRemediation', data);
        },
        showCommandResult : function(data){
            var tData = jQuery.extend(true, {}, data);
            if(!tData.uniqueId && this.uniqueId){
                tData.uniqueId = this.uniqueId;
            }
            this.sendAction('action', 'showCommandResult', tData);
        },
        showXpathResult : function(data){
            var tData = jQuery.extend(true, {}, data);
            if(!tData.uniqueId && this.uniqueId){
                tData.uniqueId = this.uniqueId;
            }
            this.sendAction('action', 'showXpathResult', tData);
        }
    },
    expandBlock : function(){
        this.set('isMinimalView', !this.isExpandAllBlock); // NO I18N
    }.observes('isExpandAllBlock'), // NO I18N
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmRuleResultBlockComponent = Ember.Component.extend({
    blockArr : [],
    eachBlockIns : [],
    init : function(){
        this._super();
        this.eachBlockIns = [];
        if(!this.data || this.data.type == 'BLOCK' || this.data.type == 'LOOP'){
            this.populateData();
        }
        if(this.ruleType == 'ADVANCEDBLOCKCRITERIA'){
            this.populateData();
            this.set('data', { // NO I18N
                type : 'ADVANCEDBLOCKCRITERIA' // NO I18N
            });
        }
    },
    didInsertElement : function(){
        this._super();
		this.sendAction('action', 'blockInstance', this);
    },
    populateData : function(){
        var __self = this;
        if(this.isValidate){
            var apiData = {
                resultId : this.resultId,
                criteriaType : this.ruleType,
                pageNo : this.pagingData.currPageNum,
                viewsPerPage : this.pagingData.currPageSize
            }
            var jsonData = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/ncmcompliance/exeValidateRule",apiData);//NO I18N
        }
        else{
            var url = window.OPM.apiUrlPattern + "/ncmcompliance/getRuleResult?pageNo="+__self.pagingData.currPageNum+"&viewsPerPage="+__self.pagingData.currPageSize;//NO I18N
            if(this.data && this.data.itemDetails && this.data.itemDetails.id){
                url += '&itemId='+ this.data.itemDetails.id; // NO I18N
            }
            if(this.data && this.data.uniqueId){
                url += '&uniqueId='+ this.data.uniqueId; // NO I18N
            }
            if(this.resultId){
                url += '&resultId='+ this.resultId; // NO I18N
            }
            if(this.ruleId){
                url += '&ruleId='+ this.ruleId; // NO I18N
            }
            if(this.resourceId){
                url += '&resourceId='+ this.resourceId; // NO I18N
            }
            if(this.selectedFilter){
                url += '&complianceResult='+ this.selectedFilter; // NO I18N
            }
            var jsonData = OPMClient.NCMComplianceUtilController.getRuleResultModel(url);
        }
        if(jsonData.isSuccess){
            var updatedList = [];
            var startCounter = ((__self.pagingData.currPageNum - 1) * __self.pagingData.currPageSize) + 1;
            if(jsonData.list){
                for(var i = 0; i < jsonData.list.length; i++){
                    var tData;
                    tData = jsonData.list[i];
                    tData.index = startCounter++;
                    updatedList.push(tData);
                }
                __self.set('blockArr', updatedList); // NO I18N
            }
            __self.set('pagingData.totalRecords', jsonData.totalRecords); // NO I18N
            this.updatePaging();

            if(!this.resultId){
                this.set('resultId', jsonData.resultId); // NO I18N
            }
        }
    },
    updatePaging : function(){
        var totalPages = Math.floor((this.pagingData.totalRecords / this.pagingData.currPageSize)) + (this.pagingData.totalRecords % this.pagingData.currPageSize === 0 ? 0 : 1);
        var i = 1;
        var arr = [];
        arr.push(i);
        i++;
        while(i <= totalPages){
            arr.push(i);
            i++;
        }
        this.set('pagingData.pages',arr);//No I18N
        var startCount = (this.pagingData.totalRecords == 0)? 0 : ((this.pagingData.currPageNum - 1) * this.pagingData.currPageSize) + 1;
        this.set('pagingData.fromCount', startCount);//No I18N
        var endCount = startCount + this.pagingData.currPageSize -1;
        if(endCount > this.pagingData.totalRecords){
            endCount = this.pagingData.totalRecords;
        }
        this.set('pagingData.toCount',endCount);//No I18N
    },
    actions : {
        childActions:function(functionName,param1, param2) {
            if(functionName == 'eachBlockInstance'){ // Checking whether the function is to store the child instance, else pushing to parent call.
                this.send(functionName, param1, param2);
            }
            else{
                this.sendAction('action', functionName, param1);
            }
        }
    },
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmRuleResultEachBlockComponent = Ember.Component.extend({
    classNames:["rules-result-item", "noBeforeAfter"], // NO I18N
    configArr : [],
    blockSuccess : false,
    isExpandAllManuallyUpdated : false,
    init : function(){
        this._super();
        if(this.type != 'PROCESS'){
            this.populateContentInfo();
        }
        else{
            this.classNames = this.classNames.filter(function(cls) { return cls !== 'noBeforeAfter'; }); // NO I18N
        }
        if(this.type == 'LOOP' || this.type === 'PROCESS'){
            this.populateBlockMetaData();
        }
    },
    populateContentInfo : function(){
        var content = this.data;
        if(this.type == 'LOOP'){
            content = this.data.inputBlockInfo.content;
        }
        this.set('configArr', content.split('\n')); // NO I18N
    },
    populateBlockMetaData : function(){
        this.blockSuccess = (this.data.consolidatedResult && this.data.consolidatedResult !== 'VIOLATION') || (this.data.metaInfo && this.data.metaInfo.finalResult && this.data.metaInfo.finalResult !== 'VIOLATION'); // NO I18N
    },
    didInsertElement : function(){
        this._super();
    },
    actions : {
        toggleMiniView : function(){
            this.set('isMinimalView', !this.isMinimalView); // NO I18N
        },
        childActions:function(functionName,param1, param2) {
            this.sendAction('action', functionName, param1);
        }
    },
    expandBlock : function(){
        this.set('isMinimalView', !this.isExpandAllBlock); // NO I18N
        if(this.type == 'LOOP' && !this.isExpandAllManuallyUpdated){
            this.set('isMinimalView', false); // NO I18N
            this.isExpandAllManuallyUpdated = true;
        }
    }.observes('isExpandAllBlock'), // NO I18N
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmRuleBasicResultComponent = Ember.Component.extend({
    pagingData : {},
    simpleResultLines : [],
    filterList : [],
    selectedFilter : 'All', // NO I18N
    simpleRuleCriteriaTitle : '',
    init : function(){
        this._super();
        this.pagingData = jQuery.extend(true, {}, ncmGetNewBlockPagingData());
        this.simpleResultLines = [];
        if(this.ruleType == 'SIMPLE' && this.complianceStatus != 'ATTENTION'){
            var __self = this;
            var addLines = function(lines, present){
                for(var i = 0; i < lines.length; i++){
                    var configs = lines[i].split('\n');
                    for(var j = 0; j < configs.length; j++){
                        __self.simpleResultLines.push({
                            present : present,
                            content : configs[j]
                        });
                    }
                }
            }
            var failedLinesKeys = Object.keys(this.data.failureLines);
            addLines(failedLinesKeys, false);
            var successLinesKeys = Object.keys(this.data.successLines);
            addLines(successLinesKeys, true);
            if(this.criteria && this.criteria.condition){
                this.simpleRuleCriteriaTitle = OPMClient.NCMComplianceUtilController.formatWithI18n(this.criteria.condition);
            }
        }
        if(this.remediationConfiglet && this.remediationConfiglet > 0){
            this.remediationAvailable = true;
        }
		this.filterList = [
		    {
		        'name' : 'All' // NO I18N
		    },
		    {
                'name' : 'Compliant' // NO I18N
            },
            {
                'name' : 'Violation' // NO I18N
            }
		];
    },
    refreshFilterData : function(){
        this.pagingData = jQuery.extend(true, {}, ncmGetNewBlockPagingData());
	    this.rerender();
    }.observes('selectedFilter'), // NO I18N
    didInsertElement : function(){
        this._super();
        if(!this.disableMaxScreen){
            ncmMaxScreen(!this.isValidate);
            ncmMaxScreen(false);
		}
		if(window.OPM.isOPM || window.OPM.isNFA){
		    $(this.element).find('#complaince-rules-result-container').addClass('compliance-result-opm');
		    $(this.element).find('#complaince-rules-result-container .header').addClass('mh-46');
		}
    },
    actions : {
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
	    back : function(){
            this.set('pagingData', jQuery.extend(true, {}, ncmGetNewBlockPagingData())); // NO I18N
	        if(this.blockList){
                this.set('blockList', false); // NO I18N
	        }
            else{
                window.history.back();
            }
	        waitForElement('#deviceNameSearch', function(){//No I18N
	            if (location.href.indexOf('NCMCompliance/Policies') != -1 && location.href.indexOf('BulkRemediate') == -1) {
	                try {
	                    if (OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceNameBackup) {
                            var input = document.getElementById('deviceNameSearch');
                            input.value = OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceNameBackup;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            OPMClient.NCMCompliancePolicyController.headerCompInstance.send('deviceNameSearchAction');
                        } else {
	                        OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                        }
	                } catch (e) {}
	            }
	            else if(location.href.indexOf('BulkRemediate') > -1 && OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance){
	                OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.closeRuleResultView();
	            }
	        });
	    },
        blockInstance : function(child){
            this.set('blockInstance', child); // NO I18N
        },
	    showBlockList : function(){
            this.set('blockList', true); // NO I18N
	    },
        showPage : function(pageNumber){
            this.set('pagingData.currPageNum', pageNumber); // NO I18N
            var __self = this;
            setTimeout(function(){
                if(__self.blockInstance){
                    __self.blockInstance.populateData();
                }
            },0);
        },
        changePageSize : function(pageSize){
            this.set('pagingData.currPageSize', pageSize); // NO I18N
            this.set('pagingData.currPageNum', 1); // NO I18N
            if(this.blockInstance){
                this.blockInstance.populateData();
            }
        },
        applyRemediation : function(){
            var remediationData = {
                remediationConfiglet : this.remediationConfiglet
            };
            var configletData = OPMClient.NCMComplianceRulesController.getConfigletDetails(this.remediationConfiglet);
            if(configletData){
                var configletVariables = configletData.variables;
                if(configletVariables && configletVariables.length > 0){
                    var localVariables = [];
                    for(var i = 0; i < configletVariables.length; i++){
                        var variableData = {};
                        variableData.name = configletVariables[i].name;
                        variableData.value = '';
                        variableData.displayName = configletVariables[i].displayName ? configletVariables[i].displayName : configletVariables[i].name;
                        localVariables.push(variableData);
                    }
                    remediationData.localVariables = localVariables;
                }
                remediationData.name = configletData.templateName;
                remediationData.desc = configletData.templateDesc;
                remediationData.type = configletData.templateType;
				remediationData.BACKUP_BEFORE_TEMPLATE = configletData.BACKUP_BEFORE_TEMPLATE;
				remediationData.BACKUP_AFTER_TEMPLATE = configletData.BACKUP_AFTER_TEMPLATE;
                this.set('remediationData', remediationData); // NO I18N
                slideInWithId('remediationSlide'); // NO I18N
                $('#remediationSlide').css('display','block');
                if(location.href.indexOf('Reports/NCM/CustomReportDetails') != -1){
                    this.element.querySelector('.slideContentContainer').style.width = '700px'; // NO I18N
                }
            }
        },
        executeConfiglet : function(){
            try{
                var __self = this;
                var variables = {};
                var VAR_NAMES = new Array();
                var remediationDataTemp = this.get('remediationData');
                var localVariables = remediationDataTemp.localVariables;
                if(localVariables){
                    for(var i = 0; i < localVariables.length; i++){
                        ncmValidateInputField(localVariables[i].value, '#configletvalue_'+i+' input'); // NO I18N
                        variables[localVariables[i].name] = localVariables[i].value;
                        VAR_NAMES.push(localVariables[i].name);
                    }
                }
                var selDev = new Array();
                selDev.push(this.resourceId);
                var data = {
                    TEMPLATE_ID : remediationDataTemp.remediationConfiglet,
                    BACKUP_BEFORE_TEMPLATE : remediationDataTemp.BACKUP_BEFORE_TEMPLATE,
					BACKUP_AFTER_TEMPLATE : remediationDataTemp.BACKUP_AFTER_TEMPLATE,
                    VARIABLES : JSON.stringify(variables),
                    VAR_NAME : JSON.stringify(VAR_NAMES),
                    EXEC_TYPE : 'REMEDIATION_'+remediationDataTemp.remediationConfiglet, // NO I18N
                    ComponentSelection : 'SpecificDevice', // NO I18N
                    SELECTEDDEVICES : JSON.stringify(selDev),
                    ruleId : this.ruleId,
                    policyId : this.policyId
                };
				// ncmValidateInputField(this.remediationLabel, '#remediationLabel'); // NO I18N
				if (this.remediationLabel){
                    data.remediationLabel = this.remediationLabel;
                }
                if(this.resultId){
                    data.resultId = this.resultId;
                }
                var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/execConfiglet'; // NO I18N
                opm_ajaxPostMethod(ajaxRequestUrl,data,{callback: function(jsonData){
                    var	cls = "errorMsg"; //No I18N
                    var msg = "";
                    if(jsonData.isSuccess) {
                        msg = jsonData.statusMsg;
                        cls = "successMsg"; //No I18N
                        $('#' + __self.elementId + ' .opmFormCol .right-align').text(Ember.I18n.t('ncm.complianceiq.result.remediation_executed_success')); // NO I18N
                        ncmusrsts1("remediate_device_compliance"); //NO I18N
                    }
                    else if(jsonData.error !== undefined){
                        msg = jsonData.error.message;
                        cls = "errorMsg";	 //No I18N
                    } else {
                        cls = "errorMsg";	 //No I18N
                        msg = jsonData.statusMsg;
                    }
                    // opm_infoMsgs(cls, msg);
					OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls, msg);
                    slideOutWithId('remediationSlide'); // NO I18N
                    $('#remediationSlide').css('display','none');
                    $('#commandOutputDetails').css('display','none');
                }, otpPageType: "dialog"});//NO I18N
            }
            catch(error){}
        },
        cancelRemediation : function(){
            slideOutWithId('remediationSlide'); // NO I18N
            $('#remediationSlide').css('display','none');
        }
    },
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
        if(!this.isValidate){
           if(!(this.isAdhocTest || this.disableMaxScreen)){
               ncmRevertMaxScreen();
           }
        }
	}
});
OPMClient.NcmRuleValidateComponent = Ember.Component.extend({
	templateName: "components/ncm-rule-validate",//No I18N
    pagingData : {},
    resultId : false,
    init : function(){
        this._super();
        this.pagingData = jQuery.extend(true, {}, ncmGetNewBlockPagingData());
    },
    didInsertElement : function(){
        this._super();
		if(window.OPM.isOPM || window.OPM.isNFA){
		    $(this.element).find('#complaince-rules-result-container').addClass('compliance-result-opm');
		    $(this.element).find('#complaince-rules-result-container .header').addClass('mh-46');
		}
    },
    actions : {
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        validate : function(){
            var apiData = jQuery.extend(true, {},this.validateData.data);
            apiData.content = this.configContent;
            var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/ncmcompliance/exeValidateRule",apiData);//No I18N
            if(response.isSuccess){
                var result = {};
                if(this.validateData.data.criteriaType == 'ADVANCED'){
                    result = response.result;
                }
                else if (this.validateData.data.criteriaType == 'ADVANCEDBLOCKCRITERIA'){
                    result = {
                        totalRecords : response.totalRecords
                    }
                    if(this.validateData.data.blockCriteria){
                        result.blockCriteriaList = JSON.parse(this.validateData.data.blockCriteria).criteriaList;
                    }
                }
                this.set('resultId', response.resultId); // NO I18N
                this.set('resultView', result); // NO I18N
                this.set('ruleType', this.validateData.data.criteriaType); // NO I18N
                // opm_infoMsgs("successMsg", Ember.I18n.t('ncm.complianceiq.rules.basic.validate.success.msg')); // No I18N?
				OPMClient.NCMComplianceUtilController.loadMsgAndClear('successMsg', Ember.I18n.t('ncm.complianceiq.rules.basic.validate.success.msg')); // NO I18N
            }
            else{
                // opm_infoMsgs("errorMsg", response.errorMsg); // No I18N
				OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg', response.error.message); // NO I18N
            }
        },
        blockInstance : function(child){
            this.set('blockInstance', child); // NO I18N
        },
        showPage : function(pageNumber){
            this.set('pagingData.currPageNum', pageNumber); // NO I18N
            var __self = this;
            setTimeout(function(){
                if(__self.blockInstance){
                    __self.blockInstance.populateData();
                }
            },0);
        },
        changePageSize : function(pageSize){
            this.set('pagingData.currPageSize', pageSize); // NO I18N
            this.set('pagingData.currPageNum', 1); // NO I18N
            if(this.blockInstance){
                this.blockInstance.populateData();
            }
        },
	    showBlockList : function(){
            this.set('blockList', true); // NO I18N
	    },
	    back : function(){
            this.set('pagingData', jQuery.extend(true, {}, ncmGetNewBlockPagingData())); // NO I18N
	        if(this.blockList){
                this.set('blockList', false); // NO I18N
	        }
            else{
                var __self = this;
                setTimeout(function(){
                    __self.set('validateData', false); // NO I18N
                },200);
            }
	    },
        cancel : function(){
            var __self = this;
            setTimeout(function(){
                __self.set('validateData', false); // NO I18N
            },200);
        }
    },
	willDestroyElement: function(){
	    this._super();
        OPMClient.NCMComplianceListController.clearComplianceResult(this.resultId);
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmRuleResultSimpleGridComponent = Ember.Component.extend({
   init : function(){
        this._super();
        if(this.isResult == undefined){
            this.isResult = true
        }
   }
});
OPMClient.NcmComplianceAdhocTestComponent = Ember.Component.extend({
	headerVal : Ember.I18n.t('ncm.complianceiq.check.adhoc.title'), // NO I18N

    resourceSelectionType : 'DEVICES', // NO I18N
    contentSelectionType : 'TEXT', // NO I18N

    availableRuleList : [],
    selectedRuleList : [],

    availableRuleGroupList : [],
    selectedRuleGroupList : [],

    availablePolicyList : [],
    selectedPolicyList : [],

    availableDeviceList : [],
    selectedDeviceList : [],
    selectedDeviceIds : [],

    availableDgList : [],
    selectedDg : false,

    pagingData : {},
    apiUrl : false,
    showLoader : false,

    selectBoxLeftLabelRule : Ember.I18n.t('jsp.commonstr.rulesnotselected'), // NO I18N
    selectBoxRightLabelRule : Ember.I18n.t('jsp.commonstr.rulesselected'), // NO I18N
    selectBoxLeftLabelRuleGroup : Ember.I18n.t('jsp.commonstr.ruleGsnotselected'), // NO I18N
    selectBoxRightLabelRuleGroup : Ember.I18n.t('jsp.commonstr.ruleGsselected'), // NO I18N
    selectBoxLeftLabelPolicy : Ember.I18n.t('jsp.commonstr.policiesnotselected'), // NO I18N
    selectBoxRightLabelPolicy : Ember.I18n.t('jsp.commonstr.policiesselected'), // NO I18N
    selectBoxLeftLabelDevices : Ember.I18n.t('jsp.commonstr.devicesnotselected'), // NO I18N
    selectBoxRightLabelDevices : Ember.I18n.t('jsp.commonstr.devicesselected'), // NO I18N

    init : function(){
        this._super();
        this.preRender();
		this.pagingData = ncmGetNewBlockPagingData();
		this.pagingData.pageSizeArr = [10, 20, 30];
		if(this.offlineCheck){
		    this.apiUrl = window.OPM.apiUrlPattern + "/ncmcompliance/runOfflineCheck"; //NO I18N
			this.headerVal = Ember.I18n.t('ncm.complianceiq.check.offline'); // NO I18N
		}
		else{
		    this.apiUrl = window.OPM.apiUrlPattern + "/ncmcompliance/getAdhocResult"; //NO I18N
		}
    },
    didInsertElement : function(){
        this._super();
        ncmMaxScreen();
        if(this.isDraftTest && OPMClient.InventoryDeviceDetailsController.checkComplianceResultData){
            var apiData = {
                TYPE : 'POLICY' // NO I18N
            }
            if(OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.DRAFT_ID){
                apiData.DRAFT_ID = OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.DRAFT_ID;
            }
            else if(OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.VERSION_ID){
                apiData.VERSION_ID = OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.VERSION_ID;
            }
            if(OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.SELECTION_TYPE != 'ASSIGNED'){
                apiData.COMPPOLICY_ID = OPMClient.InventoryDeviceDetailsController.checkComplianceResultData.POLICY_ID;
            }
            this.getResultAndLoad(apiData);
        }
        else{
            this.loadInputsSelections();
        }
		if(window.OPM.isOPM || window.OPM.isNFA){
		    $(this.element).find('#complaince-rules-result-container').addClass('compliance-result-opm');
		    $(this.element).find('#complaince-rules-result-container .header').addClass('mh-46');
		}
    },
    getResultAndLoad : function(apiData, formData){
        var jsonData = {};
        var __self = this;
        this.set('showLoader', true); // NO I18N
        var processResult = function(jsonData){
            if(jsonData.isSuccess){
				__self.set('headerVal', Ember.I18n.t('jsp.commonstr.Result')); // NO I18N
                OPMClient.NCMComplianceUtilController.loadMsgAndClear('successMsg',jsonData.statusMsg); // NO I18N
                __self.set('showLoader', false); // NO I18N
                if(jsonData.resultId){
                    __self.set('resultId', jsonData.resultId); // NO I18N
                }
                __self.loadResult(jsonData.result);
                __self.set('pagingData.totalRecords', jsonData.totalRecords); // NO I18N
                __self.updatePaging();
            }
            else if (jsonData.error && jsonData.error.message) {
                opm_infoMsgs("errorMsg", jsonData.error.message);//No I18N
                window.history.back();
            }
        }
        var ajaxReqObj = {
            url: this.apiUrl,
            type: 'POST', // NO I18N
            async:true,
            data: apiData,
            beforeSend: function(XMLHttpRequest,settings) {
                appendCollectorDetails(XMLHttpRequest,settings);
                appendFWACollectorDetails(XMLHttpRequest,settings);
                appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
            },
            success: function(jsonData) {
                processResult(jsonData);
            }
        };
        if(this.offlineCheck && formData){
            ajaxReqObj.cache = false;
            ajaxReqObj.processData = false;
            ajaxReqObj.contentType = false;
            ajaxReqObj.data = formData;
        }
        $.ajax(ajaxReqObj);
    },
    preRender : function(){
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/v2/ncmcompliance/getAdhocTestPreRenders'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        if(jsonData.isSuccess){
            this.loadDevices(jsonData.UnselectedHostSortedMap);
            this.loadDgs(jsonData.DG_INFO);
            if(this.pageType == 'RULE'){
                this.selectedRuleIds = jQuery.extend(true, [],this.selectedIds);
                this.loadRules(jsonData.rules);
            }
            else if(this.pageType == 'RULEGROUP'){
                this.selectedRuleGroupIds = jQuery.extend(true, [],this.selectedIds);
                this.loadRuleGroups(jsonData.ruleGroups);
            }
            else if(this.pageType == 'POLICY'){
                this.selectedPolicyIds = jQuery.extend(true, [],this.selectedIds);
                this.loadPolicies(jsonData.policies);
            }
        }
    },
    loadInputsSelections : function(){
        var __self = this;
        $("input[name=resourceSelection][value="+this.resourceSelectionType+"]").prop("checked",true);
        $('input[type="radio"][name="resourceSelection"]').off('click').on('click', function(e){
            __self.set('resourceSelectionType', $('input[name=resourceSelection]:checked').val()); // NO I18N
        });

        $("input[name=contentSelection][value="+this.contentSelectionType+"]").prop("checked",true);
        $('input[type="radio"][name="contentSelection"]').off('click').on('click', function(e){
            __self.set('contentSelectionType', $('input[name=contentSelection]:checked').val()); // NO I18N
        });
    },
    actions : {
        back : function(){
            if(location.href.indexOf('Inventory/Snapshot/ConfigDraft') != -1 || location.href.indexOf('Inventory/Snapshot/ConfigChange') != -1){
                location.href=  location.href.replace('/ComplianceResult',''); // NO I18N
            }
            else{
                window.history.back();
            }
        },
        test : function(){
            try{
                OPMClient.NCMCompliance.showEmptyDataImgTextButton();
                var apiData = {
                    resourceSelectionType : this.resourceSelectionType
                }
                if(this.resourceSelectionType == 'DEVICES'){
                    if(this.selectedDeviceIds == '' || this.selectedDeviceIds.length == 0){
                        OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('webclient.admin.scheduledt.selectdevices')); //NO I18N
                        return;
                    }
                    apiData.selectedDeviceIds = JSON.stringify(this.selectedDeviceIds);
                }
                else if(this.resourceSelectionType == 'DEVICEGROUP'){
                    apiData.DEVICEGROUPSELECTION = this.selectedDg;
                }
                else{
                    return;
                }
                if(this.pageType){
                    var validInput = true;
                    if(this.pageType == 'RULE'){
                        if(this.selectedIds){
                            if(this.selectedIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('ncm.name.selectRule')); //NO I18N
                                return;
                            }
                            apiData.selectedRuleIds = JSON.stringify(this.selectedIds);
                        }
                        else{
                            if(this.selectedRuleIds == '' || this.selectedRuleIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('ncm.name.selectRule')); //NO I18N
                                return;
                            }
                            apiData.selectedRuleIds = JSON.stringify(this.selectedRuleIds);
                        }
                    }
                    else if(this.pageType == 'RULEGROUP'){
                        if(this.selectedIds){
                            if(this.selectedIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('ncm.name.selectRG')); //NO I18N
                                return;
                            }
                            apiData.selectedRuleGroupIds = JSON.stringify(this.selectedIds);
                        }
                        else{
                            if(this.selectedRuleGroupIds == '' || this.selectedRuleGroupIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('ncm.name.selectRG')); //NO I18N
                                return;
                            }
                            apiData.selectedRuleGroupIds = JSON.stringify(this.selectedRuleGroupIds);
                        }
                    }
                    else if(this.pageType == 'POLICY'){
                        if(this.selectedIds){
                            if(this.selectedIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('webclient.Select.Policy')); //NO I18N
                                return;
                            }
                            apiData.selectedPolicyIds = JSON.stringify(this.selectedIds);
                        }
                        else{
                            if(this.selectedPolicyIds == '' || this.selectedPolicyIds.length == 0){
                                OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg',Ember.I18n.t('webclient.Select.Policy')); //NO I18N
                                return;
                            }
                            apiData.selectedPolicyIds = JSON.stringify(this.selectedPolicyIds);
                        }
                    }
                    else{
                        validInput = false;
                    }
                    if(validInput){
                        apiData.TYPE = this.pageType;
                    }
                }
                if(this.offlineCheck){
                    apiData.contentSelectionType = this.contentSelectionType;
                    if(this.contentSelectionType == 'FILE'){
                        var filename = document.getElementById('configFile');//No I18N
                        var file=filename.files[0];
                        if(file==undefined){
                            alert(Ember.I18n.t('ncm.complianceiq.adhoc.select_valid_test_file.errorMsg')); //NO I18N
                            return;
                        }
                        else{
                            var fileName=file.name;
                            if(!(fileName.endsWith('.txt') || fileName.endsWith('.xml'))){//No I18N
                            alert(Ember.I18n.t('ncm.complianceiq.adhoc.select_valid_test_file.errorMsg')); //NO I18N
                                return;
                            }
                            var formData = new FormData();
                            formData.set('file',file,'config.txt'); //No I18N
                            for (var key in apiData){
                                formData.set(key, apiData[key]);
                            }
                        }
                    }
                    else if(this.contentSelectionType == 'TEXT'){
                        ncmValidateInputField(this.configContent, '#configContent'); //NO I18N
                        apiData.content = this.configContent;
                    }
                }
                this.getResultAndLoad(apiData, formData);
            }
            catch(error){}
        },
        cancel : function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            window.history.back();
        },
        showPage : function(pageNumber){
            this.set('pagingData.currPageNum', pageNumber); // NO I18N
            this.loadCacheData();
        },
        changePageSize : function(pageSize){
            this.set('pagingData.currPageSize', pageSize); // NO I18N
            this.set('pagingData.currPageNum', 1); // NO I18N
            this.loadCacheData();
        }
    },
    updatePaging : function(){
        var totalPages = Math.floor((this.pagingData.totalRecords / this.pagingData.currPageSize)) + (this.pagingData.totalRecords % this.pagingData.currPageSize === 0 ? 0 : 1);
        var i = 1;
        var arr = [];
        arr.push(i);
        i++;
        while(i <= totalPages){
            arr.push(i);
            i++;
        }
        this.set('pagingData.pages',arr);//No I18N
        var startCount = (this.pagingData.totalRecords == 0)? 0 : ((this.pagingData.currPageNum - 1) * this.pagingData.currPageSize) + 1;
        this.set('pagingData.fromCount', startCount);//No I18N
        var endCount = startCount + this.pagingData.currPageSize -1;
        if(endCount > this.pagingData.totalRecords){
            endCount = this.pagingData.totalRecords;
        }
        this.set('pagingData.toCount',endCount);//No I18N
    },
    setGridPaging: function(pageSize){
        var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridRowsCount?GRID_ID=ComplianceAdhocRuleResult&GRID_PAGE_SIZE='+pageSize;//No I18N
        var jsonData = opm_ajaxPostRequest(url);
    },
    loadResult: function(list){
        this.setGridPaging(10);
        var viewList = [];
        for(var i = 0; i < list.length; i++){
            var tArr = [];
            tArr.push(list[i]);
            i++;
            if(i < list.length){
                tArr.push(list[i]);
            }
            viewList.push(tArr);
        }
        this.set('resultView', viewList); // NO I18N
        $(this.element).find('.main-content').addClass('grey-bg');
        $(this.element).find('.main-content').addClass('adhoc_chart_result');
    },
    loadCacheData : function(){
        var apiData = {
            pageNo : this.pagingData.currPageNum,
            viewsPerPage : this.pagingData.currPageSize,
            resultId : this.resultId
        };
        jsonData = opm_ajaxPostRequest(this.apiUrl,apiData);
        if(jsonData.isSuccess){
            this.loadResult(jsonData.result);
            this.updatePaging();
        }
    },
    pushDataToList: function(list, id, name){
        list.push({
                'name' : name, // NO I18N
                'ID' : id // NO I18N
            }
        );
    },
    loadRules : function(rules){
        if(rules){
            this.availableRuleList = [];
            this.selectedRuleList = [];
            var __self = this;
            Object.keys(rules).forEach(function(id) {
                if(__self.selectedRuleIds.includes(String(id))){
                    __self.pushDataToList(__self.selectedRuleList, id, rules[id]);
                }
                else{
                    __self.pushDataToList(__self.availableRuleList, id, rules[id]);
                }
            });
        }
    },
    loadRuleGroups : function(ruleGroups){
        if(ruleGroups){
            this.availableRuleGroupList = [];
            this.selectedRuleGroupList = [];
            var __self = this;
            Object.keys(ruleGroups).forEach(function(id) {
                if(__self.selectedRuleGroupIds.map(String).includes(String(id))){
                    __self.pushDataToList(__self.selectedRuleGroupList, id, ruleGroups[id]);
                }
                else{
                    __self.pushDataToList(__self.availableRuleGroupList, id, ruleGroups[id]);
                }
            });
        }
    },
    loadPolicies : function(policies){
        if(policies){
            this.availablePolicyList = [];
            this.selectedPolicyList = [];
            var __self = this;
            Object.keys(policies).forEach(function(id) {
                if(__self.selectedPolicyIds.map(String).includes(String(id))){
                    __self.pushDataToList(__self.selectedPolicyList, id, policies[id]);
                }
                else{
                    __self.pushDataToList(__self.availablePolicyList, id, policies[id]);
                }
            });
        }
    },
    loadDevices : function(devices){
        if(devices){
            this.availableDeviceList = [];
            for(var i = 0; i < devices.length; i++){
                this.pushDataToList(this.availableDeviceList, devices[i].id, devices[i].hostName);
            }
        }
    },
    loadDgs : function(dgs){
        if(dgs){
            this.availableDgList = [];
            for (var key in dgs){
                if(!this.selectedDg){
                    this.selectedDg = key;
                }
                this.pushDataToList(this.availableDgList, key, dgs[key]);
            }
        }
    },
    willDestroyElement: function(){
        this._super();
        this.set('selectedIds', []); // NO I18N
        OPMClient.NCMComplianceListController.clearComplianceResult(this.resultId);
        $('#'+this.elementId).find('*').remove();
        ncmMaxScreen(true);
    }
});
OPMClient.NcmSimpleDonutChartComponent = Ember.Component.extend({
    dataMap : false,
    dataArr : [],
    init : function(){
        this._super();
        this.preRender();
    },
    preRender : function(){
        var getPercentage = function(totalCount, count){
            if (totalCount === 0) {
                return 0;
            }
            return Math.floor((parseInt(count) / parseInt(totalCount)) * 100);
        };
        var totalCount = this.dataMap.compliantCount + this.dataMap.violationCount + this.dataMap.attentionCount;
        if (this.dataMap) {
            this.dataArr = [];
            var compliantPercentage = getPercentage(totalCount, this.dataMap.compliantCount);
            var violationPercentage = getPercentage(totalCount, this.dataMap.violationCount);
            var attentionPercentage = getPercentage(totalCount, this.dataMap.attentionCount);
            this.dataArr.push(
                [
                    [compliantPercentage, 'Compliant ' + compliantPercentage + '%'], // NO I18N
                    [violationPercentage, 'Violation ' + violationPercentage + '%'], // NO I18N
                    [attentionPercentage, 'Attention ' + attentionPercentage + '%'] // NO I18N
                ]
            );
        }
    },
    didInsertElement : function(){
        this._super();
        var divId = this.elementId;
        var data = [{
            "type": "pie", // NO I18N
            "data": this.dataArr // NO I18N
        }];
        var arraObj = {
            "placeholder": [], // No I18N
            "chartobj": [] // No I18N
        };
        var columns = [{
            "dataindex": 0, // NO I18N
            "columnname": "Status", // NO I18N
            "datatype": "ordinal" // NO I18N
        }, {
            "dataindex": 1, // NO I18N
            "columnname": "Status" // NO I18N
        }];
        var legendVal = {
            "layout": "horizontal", // NO I18N
            "vAlign": "center", // NO I18N
            "marginLeft": 5, // NO I18N
            "fontSize" : 14, // NO I18N
            "shapes": "circle", // NO I18N
            "colors": [ // NO I18N
                "#38b04c", // NO I18N
                "#be2b2f", // NO I18N
                "#f2cc0e" // NO I18N
            ],
            "maxWidth" : "100%", // NO I18N
            "colorBox" : { // NO I18N
                "size": 10 // NO I18N
            },
            "maxHeight": "100%", // NO I18N
            "itemHoverStyle": { // NO I18N
              "fontColor": "#646464", // NO I18N
              "showOnDataHover": true // NO I18N
              //"backgroundColor": "rgba(255,0,0,0.1)" // NO I18N
            },
            "colorPallete": { // NO I18N
                "type": "multicolor", // NO I18N
                "options": { // NO I18N
                    "multicolor": "countries" // NO I18N
                }
            },
            "title": { // NO I18N
                "show": false // NO I18N
            }
        };
        var canvasVal = {
            "title": { // NO I18N
                "text": "Simple donut" // NO I18N
            }
        };
        var plotoptions = {
            "pie": { // NO I18N
                "innerRadius": "50%", // NO I18N
                "outerPadding": 0, // NO I18N
                "sliceOutHeight" : 0, // NO I18N
                "events": { // NO I18N
                    "mousemove": function(e) { // NO I18N
                        e.allowDefault = true
                    },
                    "mouseout": function(e) { // NO I18N
                        e.allowDefault = true
                    }
                }
            }
        };
        var chartObj = {
            id: divId,
            "majortooltip": {//No I18N
//                "backgroundColor": "#000000",//No I18N
//                "maxWidth": "100%", //NO I18N
                "enabled": false // NO I18N
            },
            type: 'pie', // No I18N
            "jsonData": data, // No I18N
            height: 50,
            width: '400px', // NO I18N
            fontSize: 19,
            margin: 0,
            columns: columns,
            "legend": legendVal, // No I18N
            "axes": { // NO I18N
                "x": [1], // NO I18N
                "y": [ // NO I18N
                    [0, 1]
                ],
                "tooltip": [1] // NO I18N
            },
            "canvas": canvasVal, // No I18N
            "plotoptions": plotoptions, // No I18N
            "series": 'multi' // No I18N
        };
        var mappingobj={};
        arraObj.chartobj.push(chartObj);
        arraObj.placeholder.push(divId);
        ncmZChart(arraObj);
    },
    willDestroyElement : function(){
    }
});
OPMClient.NcmAdhocPagerGridComponent = Ember.Component.extend({
    tableName : '',
    tablePager : '',
    init : function(){
        this._super();
        this.preRender();
    },
    preRender : function(){
        this.tableName = 'ComplianceAdhocResultTable_'+this.dataMap.resourceId; // NO I18N
        this.tablePager = 'ComplianceAdhocResultPager_'+this.dataMap.resourceId; // NO I18N
    },
    didInsertElement : function(){
        this._super();
        var defOpts = {
            multiselect: false,
            searchOption: true,
            minRowsPerPage: 10,
            rowList : [10,25]
        };
        var params = "&resourceId="+this.dataMap.resourceId; // NO I18N
        if(this.resultId){
            params += "&resultId="+this.resultId; // NO I18N
            defOpts.resultId = this.resultId;
        }
        populateRemoteGridDuplicateId(this.tableName, "ComplianceAdhocRuleResult", params, "#"+this.tablePager, "ComplianceAdhocRuleResult", defOpts); //No I18N
    },
    willDestroyElement : function(){
    }
});
OPMClient.NcmCompliancePolicyComponent = Ember.Component.extend({
    sideBarHover : false,
    selectedFilterArr : false,
    compStatusFilter: 'All',//NO I18N
    violationSevFilter: 'All',//NO I18N
	complianceRunningStatus: 'All', //NO I18N
	complianceCheckComplete: false,
    init : function(){
        this._super();
        this.preRender();
    },
    didInsertElement : function(){
        this._super();
        if (sessionStorage.getItem('ncmPolicySelectedItem') && sessionStorage.getItem('ncmPolicySelectedItemId')) {
//            this.preRender();
            OPMClient.NCMCompliancePolicyController.selectedItem = sessionStorage.getItem('ncmPolicySelectedItem');//NO I18N
            OPMClient.NCMCompliancePolicyController.selectedItemId = sessionStorage.getItem('ncmPolicySelectedItemId');//NO I18N
            this.updateControllerVariables(OPMClient.NCMCompliancePolicyController.selectedItem);
            this.setHeaderContent();
            this.setGridDataContent();
            this.emptyDataCheckChanges();
        }
        OPMClient.NCMCompliancePolicyController.policyCompInstance = this;
        document.addEventListener('mousemove', this.treeNodeMoreActionClose);
        document.addEventListener('wheel', this.hideActionIconOnScroll);
        document.addEventListener('click', this.ruleResultEditDropdownHandler); // NO I18N

        this.updateScreenWidth();
        window.addEventListener('resize', this.gridFooterFixToBottom);
    },
    gridFooterFixToBottom: function(){
        setTimeout(function() {
            var mainTableBody = $('div.ui-jqgrid-bdiv').filter(function() {
                return this.classList.length === 1;
            });
            if (mainTableBody.length) {
                var topAvailHeight = $('.ui-jqgrid-hdiv')[0].getBoundingClientRect().bottom;
                var pagerHeight = $('.ui-jqgrid-pager')[0].getBoundingClientRect().height + 16; // 16 is added for padding adjustments
                var finalHeight = window.innerHeight - topAvailHeight - pagerHeight;
                mainTableBody.css('height', finalHeight); // NO I18N
            }
        }, 100);
    },
    ruleResultEditDropdownHandler: function(event){
        var onClickVal = event.target.getAttribute('onclick');
        try {
            var isFromEdit = (onClickVal && onClickVal.includes("'" + OPMClient.NCMComplianceUtilController.ruleStatusEditDivId + "'")) || false; // NO I18N
            if (!isFromEdit && OPMClient.NCMComplianceUtilController.ruleStatusEditDivId){
                OPMClient.NCMCompliance.closeOpenRuleStatus();
                OPMClient.NCMComplianceUtilController.ruleStatusEditDivId = null;
            }
        } catch(e) {}
    },
    updateScreenWidth : function(targetClass) {
        var allClasses = ['close_side_panel', 'maximize_side_panel']; // NO I18N
        $('.ncm-policies-page').removeClass(allClasses.join(' '));
        if(targetClass) {
            $('.ncm-policies-page').addClass(targetClass);
        }
    },
    preRender : function(){
        if (sessionStorage.getItem('ncmPolicySelectedItem') && sessionStorage.getItem('ncmPolicySelectedItemId')) {
            OPMClient.NCMCompliancePolicyController.selectedItem = sessionStorage.getItem('ncmPolicySelectedItem');//NO I18N
            OPMClient.NCMCompliancePolicyController.selectedItemId = sessionStorage.getItem('ncmPolicySelectedItemId');//NO I18N
            this.updateControllerVariables(OPMClient.NCMCompliancePolicyController.selectedItem);
        }
        this.setNcmTreeData();
        this.setHeaderContent();
        this.setMetadataContent();
        this.setGridDataContent();
        this.emptyDataCheckChanges();
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        saveTreeCompInstance: function(instance){
            if(instance){
                this.set('treeCompInstance', instance);//No I18N
            }
        },
        saveHeaderCompInstance: function(instance){
            if(instance){
                this.set('headerCompInstance', instance);//No I18N
            }
        },
        saveGridCompInstance: function(instance){
            if(instance){
                this.set('gridCompInstance', instance);//No I18N
            }
        },
        selectNodeAction: function(node){
            this.selectNodeAction(node);
        },
//        doubleClickNodeAction: function(event){
//            this.doubleClickNodeAction(event);
//        },
        selectNodeActionWithNodeId: function(nodeId){
            var node = this.getNodeData(nodeId);
            this.selectNodeAction(node);
            /*var parents = node.parents;
            for (var i=0; i<parents.length; i++){
                if (parents[i] !== '#'){
                    this.openNodeAction(parents[i]);
                }
            }*/
        },
        selectSameNodeAgainAction: function(node){
            this.selectSameNodeAgainAction(node);
        },
        hoverNodeAction: function(node){
            this.hoverNodeAction(node);
        },
        dehoverNodeAction: function(node){
            this.dehoverNodeAction(node);
        },
        openNodeAction: function(){
            this.openNodeAction();
        },
        closeNodeAction: function(){
            this.closeNodeAction();
        },
        selectHeaderAction: function(id){
            this.selectNodeAction(this.getNodeData(id));
        },
		showBulkRemediation : function (){
		    var url = window.OPM.apiUrlPattern + '/ncmcompliance/checkComplianceStatus?policyId='+OPMClient.NCMCompliancePolicyController.getPolicyId(); // NO I18N
            var jsonData = opm_ajaxGetResponse(url);
            if (jsonData.isSuccess) {
                var msgKey = jsonData.isRemediationInProgress ? 'ncm.complianceiq.remediation.progress.info_msg' : // NO I18N
                jsonData.isComplianceCheckInProgress ? 'ncm.complianceiq.check.progress.info_msg' : null; // NO I18N
                if (msgKey) {
                    OPMClient.NCMComplianceUtilController.loadMsgAndClear('errorMsg', Ember.I18n.t(msgKey)); // NO I18N
                    return;
                }
            }
            location.href = OPMClient.NCMComplianceListController.baseUrl + '/Policies/BulkRemediate'; // NO I18N

		},
        compStatusFilterAction: function(status){
            this.gridCompInstance.set('compStatusFilter', status);//No I18N
            this.gridCompInstance.loadGrid();
        },
        violationSevFilterAction: function(severity){
            this.gridCompInstance.set('violationSevFilter', severity);//No I18N
            this.gridCompInstance.loadGrid();
        },
		complianceRunningStatusAction: function(runningStatus){
            this.gridCompInstance.set('complianceRunningStatus', runningStatus); //NO I18N
            this.gridCompInstance.loadGrid();
        },
        openCloseSidePanel: function(){
            this.openCloseSidePanelAction();
        },
        minMaxSidePanel: function(){
            this.minMaxSidePanelAction();
        },
        expandCollapse: function(){
            this.expandCollapseAction();
        },
        wrapAnchorWithDivAction: function(){
            this.wrapAnchorWithDiv();
        },
        removeFilter : function(filterName){
            var sevEle = $('#violationSev_'+filterName);
            if(sevEle && sevEle.length > 0){
                sevEle.removeClass('selected');
            }
            else if($('#compStatus_'+filterName)){
                $('#compStatus_'+filterName).removeClass('selected');
            }
            this.updateSelectedFilterArr();
            this.gridCompInstance.loadGrid();
        },
		toggleSearchIconAction: function() {
			this.gridCompInstance.toggleSearchIcon();
		}
    },
    emptyDataCheckChanges: function(){
        var selectedNodeData = this.getNodeData(OPMClient.NCMCompliancePolicyController.selectedItemId);
        var emptyFavGroup = selectedNodeData.id === 'policyGroup_FAVOURITE' && selectedNodeData.children.length == 0;
        var noDataItem = OPMClient.NCMCompliancePolicyController.selectedItem !== 'policyGroup' && !selectedNodeData.data.isCompCheckDone && !selectedNodeData.data.isCompCheckInProgress;//No I18N
        var loadEmptyData = emptyFavGroup || noDataItem;

        if (loadEmptyData) {
            this.set('loadEmptyData', true);//No I18N
            if (emptyFavGroup) {
                this.set('imageRequired', true);//No I18N
                this.set('imageSource', '/apiclient/fluidicv2/img/favorite-no-data.svg');//No I18N
                this.set('imageText', 'favourite no data'); // No I18N
                this.set('mainText', Ember.I18n.t("ncm.complianceiq.policy.favourites.empty", this));//No I18N
                this.set('subText', Ember.I18n.t("ncm.complianceiq.policy.favourites.addmsg", this));//No I18N
                this.set('enableButton', false); // No I18N
            } else {
                this.set('imageRequired', false);//No I18N
                if (selectedNodeData.data.isDeviceAssociated) {
                    /*this.set('imageSource', '/apiclient/fluidicv2/img/run-compliance-policy.svg');//No I18N
                    this.set('imageText', 'No data available'); // No I18N*/
                    this.set('mainText', Ember.I18n.t("ncm.complianceiq.policy.compcheck.not.done", this));//No I18N
                    this.set('subText', Ember.I18n.t("ncm.complianceiq.policy.compcheck.not.done.msg",this));//No I18N
                    this.set('enableButton', window.OPM.userPermissions.ncmComplianceWrite); // No I18N
                    this.set('buttonText', Ember.I18n.t("ncm.mid.runCheckCompliance",this)); // No I18N
                    var onClickFun;
                    var selectedItemId = OPMClient.NCMCompliancePolicyController.selectedItemId;
                    var policyId = OPMClient.NCMCompliancePolicyController.selectedPolicyId;
                    if (OPMClient.NCMCompliancePolicyController.selectedItem === 'policy') {
                        onClickFun = 'OPMClient.NCMCompliancePolicyController.runComplianceCheck("'+policyId+'","'+selectedItemId+'","false");'; // No I18N
                    } else {
                        var rgId = OPMClient.NCMCompliancePolicyController.selectedRuleGroupId;
                        if (OPMClient.NCMCompliancePolicyController.selectedItem === 'ruleGroup') {
                            onClickFun = 'OPMClient.NCMComplianceRuleGroupController.runComplianceCheck("'+policyId+'","'+rgId+'","'+selectedItemId+'");'; // No I18N
                        } else if (OPMClient.NCMCompliancePolicyController.selectedItem === 'rule') { // No I18N
                            var ruleId = OPMClient.NCMCompliancePolicyController.selectedRuleId;
                            onClickFun = 'OPMClient.NCMComplianceRulesController.runComplianceCheck("'+policyId+'","'+ruleId+'","false","'+selectedItemId+'");'; // No I18N
                        }
                    }
                    this.set('buttonOnClick', onClickFun); // No I18N
                } else {
                    /*this.set('imageSource', '/apiclient/fluidicv2/img/associate-devices.svg');//No I18N
                    this.set('imageText', 'No data available'); // No I18N*/
                    this.set('mainText', Ember.I18n.t("ncm.complianceiq.policy.no.device.associated", this));//No I18N
                    this.set('subText', Ember.I18n.t("ncm.complianceiq.policy.no.device.associated.msg", this));//No I18N
                    this.set('enableButton', window.OPM.userPermissions.ncmComplianceWrite); // No I18N
                    if (this.enableButton) {
                        this.set('buttonText', Ember.I18n.t("ncm.complianceiq.policy.no.device.associated.button.text", this)); // No I18N
                        this.set('buttonOnClick', 'OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation("'+OPMClient.NCMCompliancePolicyController.selectedPolicyId+'");'); // No I18N
                    }
                }
            }
        }
        else {
            this.set('loadEmptyData', false);//No I18N
        }
    },
    expandCollapseAction: function(){
        if(!this.expanded){
            this.set('expanded', true);//No I18N
//            $('#ncmCompliancePolicyTree').jstree('open_all');
//            Opening the nodes batch by batch to avoid performance issue and UI hang
            var tree = $('#ncmCompliancePolicyTree').jstree(true);
            var allNodes = tree.get_json('#', {flat: true});
            var disabledNodeIds = [];
            for (var i=0; i<allNodes.length; i++){
                if(allNodes[i].data && allNodes[i].data.isDisabled){
                    disabledNodeIds.push(allNodes[i].id);
                }
            }
            var index = 0;
            var __self = this;
            var openNodesByBatch = function(){
                for (var i=0; i<20 && index < allNodes.length; i++, index++){
                    if(!disabledNodeIds.includes(allNodes[index].id)) {
                        tree.open_node(allNodes[index].id);
                    }
                }
                OPMClient.NCMCompliance.pushIconToTree();
                if(index < allNodes.length && __self.expanded){
                    setTimeout(openNodesByBatch, 100);
                }
            }
            openNodesByBatch();
            var emElement = this.treeCompInstance.element.querySelector("#expandCollapse");//No I18N
            emElement.setAttribute('title', Ember.I18n.t("nfa.security.collapse.all", this)); // No I18N
            var useElement = emElement.querySelector('svg use');//No I18N
            useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/apiclient/fluidicv2/img/sprite-opm.svg#close-all');//No I18N
        }
        else{
            this.set('expanded', false);//No I18N
            $('#ncmCompliancePolicyTree').jstree('close_all');
            var emElement = this.treeCompInstance.element.querySelector("#expandCollapse");//No I18N
            emElement.setAttribute('title', Ember.I18n.t("nfa.security.expand.all", this)); // No I18N
            var useElement = emElement.querySelector('svg use');//No I18N
            useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/apiclient/fluidicv2/img/sprite-opm.svg#expand-all');//No I18N
        }
    },
    openCloseSidePanelAction: function(){
        /*var gridWidthDiff = this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").getBoundingClientRect().width;//No I18N*/
        if(!this.sidePanelClosed) {
            this.set('sidePanelClosed', true);//No I18N
            this.treeCompInstance.element.style.width = "10px";
            this.updateScreenWidth('close_side_panel'); // NO I18N
            this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.display = "none";
            this.treeCompInstance.set('openCloseText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.open", this));//No I18N
            this.treeCompInstance.set('minMaxText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.maximize", this));//No I18N
            /*this.liElementChanges("openCloseSidePanel", "SidebarSimple", "Open side panel");//No I18N
            this.liElementChanges("minMaxSidePanel", "SidebarSplitHorizontal", "Maximize side panel");//No I18N*/
        }
        else {
            this.set('sidePanelClosed', false);//No I18N
            this.treeCompInstance.element.style.width = "250px";
            this.updateScreenWidth();
            this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.display = "block";
            this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.width = "250px";
            this.treeCompInstance.element.querySelector("#expandCollapse").style.left = "220px";
            this.treeCompInstance.set('openCloseText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.close", this));//No I18N
            /*this.liElementChanges("openCloseSidePanel", "SidebarSimple", "Close side panel");//No I18N*/
            this.treeCompInstance.updateAnchorWidth();
        }
        /*gridWidthDiff = gridWidthDiff - this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").getBoundingClientRect().width;//No I18N*/
        this.updateGridWidthForSidePanelResizeChanges();
    },
    minMaxSidePanelAction: function(){
        var gridWidthDiff = this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").getBoundingClientRect().width;//No I18N
        this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.display = "block";
        this.treeCompInstance.set('openCloseText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.close", this));//No I18N
        /*this.liElementChanges("openCloseSidePanel", "SidebarSimple", "Close side panel");//No I18N*/
        if(gridWidthDiff < 500){
            this.treeCompInstance.element.style.width = "500px";
            this.updateScreenWidth('maximize_side_panel'); // NO I18N
            this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.width = "500px";
            this.treeCompInstance.element.querySelector("#expandCollapse").style.left = "470px";
            this.treeCompInstance.set('minMaxText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.minimize", this));//No I18N
            /*this.liElementChanges("minMaxSidePanel", "SidebarSplitHorizontal", "Minimize side panel");//No I18N*/
        }
        else{
            this.treeCompInstance.element.style.width = "250px";
            this.updateScreenWidth();
            this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").style.width = "250px";
            this.treeCompInstance.element.querySelector("#expandCollapse").style.left = "220px";
            this.treeCompInstance.set('minMaxText', Ember.I18n.t("ncm.complianceiq.policytree.sidebar.maximize", this));//No I18N
            /*this.liElementChanges("minMaxSidePanel", "SidebarSplitHorizontal", "Maximize side panel");//No I18N*/
        }
        this.treeCompInstance.updateAnchorWidth();
        /*gridWidthDiff = gridWidthDiff - this.treeCompInstance.element.querySelector(".overflow_policies_sidebar").getBoundingClientRect().width;//No I18N*/
        this.updateGridWidthForSidePanelResizeChanges();
    },
    updateGridWidthForSidePanelResizeChanges: function(widthToChange){
        /*console.log("Width to change :: "+widthToChange);
        console.log("Current grid width :: "+this.gridCompInstance.element.getBoundingClientRect().width);
        if(this.gridCompInstance && this.gridCompInstance.tableName){
            console.log("Before :: "+this.gridCompInstance.element.getBoundingClientRect().width);
            var newWidth = this.gridCompInstance.element.getBoundingClientRect().width + widthToChange;
            console.log("New width :: "+newWidth);
            $('#'+this.gridCompInstance.tableName).jqGrid('setGridWidth', newWidth, false);
            console.log("After :: "+this.gridCompInstance.element.getBoundingClientRect().width);
        }*/
//        this.gridCompInstance.rerender();
        if(this.gridCompInstance && this.gridCompInstance.tableName){
            $('#'+this.gridCompInstance.tableName).jqGrid('setGridWidth', 1);
            $('#'+this.gridCompInstance.tableName).jqGrid('setGridWidth', $('.policies-content .opm_jqGridUI').width());
        }
    },
    setNcmTreeData: function(){
        this.set('ncmTreeData', OPMClient.NCMCompliance.getCompTreeData());//No I18N
    },
    wrapAnchorWithDiv: function() { // wrapping the jstree generated anchor tags with divs to fix the css issues. No user input will be rendered in anchor tags.
        var __self = this;
        var wrapAnchor = function(anchorElement) {
            var anchorId = anchorElement.id;
            var newDiv = document.createElement('div');
            newDiv.id = 'wrapAnchorDiv';
            while (anchorElement.attributes.length > 0) {
                newDiv.setAttribute(anchorElement.attributes[0].name, anchorElement.attributes[0].value);
                anchorElement.removeAttribute(anchorElement.attributes[0].name);
            }
            newDiv.innerHTML = anchorElement.innerHTML;
            anchorElement.innerHTML = "";
            anchorElement.parentNode.replaceChild(newDiv, anchorElement);
            newDiv.dataset.href = anchorElement.href;
            newDiv.dataset.target = anchorElement.target;

            var newAnchor = document.createElement('a');
            newAnchor.href = newDiv.dataset.href;
            newAnchor.target = newDiv.dataset.target;
            newAnchor.innerHTML = newDiv.innerHTML;
            var isFav = __self.getNodeData(anchorId.slice(0,-7)).data.isFavourite;
            if (anchorId === 'policyGroup_FAVOURITE_anchor' || isFav) {
                var svgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");//No I18N
                var useEle = document.createElementNS("http://www.w3.org/2000/svg", "use");//No I18N
                useEle.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/apiclient/fluidicv2/img/sprite-opm.svg#"+'star');//No I18N
                svgEle.setAttribute('class', 'svgIcon size14');
                svgEle.setAttribute('fill', '#F2CC0E');
                svgEle.appendChild(useEle);// No user input used - Used for wrapping the anchor tag with div to fix the css issues.
                newAnchor.insertBefore(svgEle, newAnchor.lastChild);
            }
            newDiv.innerHTML = "";
            newDiv.appendChild(newAnchor);// No user input used - Used for wrapping the anchor tag with div to fix the css issues.
        }
        var anchorTags = document.querySelectorAll('a.jstree-anchor');//No I18N
        for (var i = 0; i < anchorTags.length; i++) {
            var anchorTag = anchorTags[i];
            wrapAnchor(anchorTag);
        }
        setTimeout(function(){
            var disabledDivs = document.querySelectorAll('div.jstree-disabled');//No I18N
            for (var i = 0; i < disabledDivs.length; i++) {
                var liEle = disabledDivs[i].firstElementChild.closest('li');
                if (liEle && !liEle.classList.contains('policy_jstree_disabled')) {
                    liEle.classList.add('policy_jstree_disabled');//No I18N
                }
            }
        }, 10);
    },
    setHeaderContent: function(){
        var tempArr = [];
        var selectedItem = OPMClient.NCMCompliancePolicyController.selectedItem;
//        var compStatusMap = { 'COMPLIANT': ' status_compliant','NOT_REQUIRED': ' status_not_required', 'VIOLATION': ' status_violation', 'ATTENTION': ' status_attention', 'COMP_CHECK_NOT_DONE': ' status_no_data' };//No I18N
        var compStatusMap = OPMClient.NCMComplianceUtilController.compStatusColorMap;
//        var selectNodeIdSplit = OPMClient.NCMCompliancePolicyController.selectedItemId.split('_');
        var nodeData = this.getNodeData(OPMClient.NCMCompliancePolicyController.selectedItemId);
        var parentNodes = nodeData.parents;
        if(selectedItem === 'policyGroup'){
            if (this.treeCompInstance) {
                tempArr.push({'displayName': nodeData.text, 'title': nodeData.text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[nodeData.data.complianceState] });
            } else {
                tempArr.push({'displayName': this.ncmTreeData[1].text, 'title': this.ncmTreeData[1].text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[this.ncmTreeData[1].data.complianceState] });
            }
        }
        else if(selectedItem === 'policy'){
            var policyGroupNodeData = this.getNodeData(parentNodes[0]);
            tempArr.push({'displayName':policyGroupNodeData.text, 'title': policyGroupNodeData.text, 'id': policyGroupNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[policyGroupNodeData.data.complianceState]});
            tempArr.push({'displayName': nodeData.text, 'title': nodeData.text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-duo', 'svgClass': compStatusMap[nodeData.data.complianceState]});
        }
        else if(selectedItem === 'ruleGroup'){
            var policyGroupNodeData = this.getNodeData(parentNodes[parentNodes.length-2]);
            var policyNodeData = this.getNodeData(parentNodes[parentNodes.length-3]);
            tempArr.push({'displayName':policyGroupNodeData.text, 'title': policyGroupNodeData.text, 'id': policyGroupNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[policyGroupNodeData.data.complianceState]});
            tempArr.push({'displayName':policyNodeData.text, 'title': policyNodeData.text, 'id': policyNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-duo', 'svgClass': compStatusMap[policyNodeData.data.complianceState]});
            tempArr.push({'displayName': nodeData.text, 'title': nodeData.text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#rule-group-duo', 'svgClass': compStatusMap[nodeData.data.complianceState]});
        }
        else if(selectedItem === 'rule'){
            if (parentNodes.length > 3) {
                var policyGroupNodeData = this.getNodeData(parentNodes[parentNodes.length-2]);
                var policyNodeData = this.getNodeData(parentNodes[parentNodes.length-3]);
                var ruleGroupNodeData = this.getNodeData(parentNodes[parentNodes.length-4]);
                tempArr.push({'displayName':policyGroupNodeData.text, 'title': policyGroupNodeData.text, 'id': policyGroupNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[policyGroupNodeData.data.complianceState]});
                tempArr.push({'displayName':policyNodeData.text, 'title': policyNodeData.text, 'id': policyNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-duo', 'svgClass': compStatusMap[policyNodeData.data.complianceState]});
                tempArr.push({'displayName':ruleGroupNodeData.text, 'title': ruleGroupNodeData.text, 'id': ruleGroupNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#rule-group-duo', 'svgClass': compStatusMap[ruleGroupNodeData.data.complianceState]});
                tempArr.push({'displayName': nodeData.text, 'title': nodeData.text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliant-duo', 'svgClass': compStatusMap[nodeData.data.complianceState]});
            }
            else{
                var policyGroupNodeData = this.getNodeData(parentNodes[parentNodes.length-2]);
                var policyNodeData = this.getNodeData(parentNodes[parentNodes.length-3]);
                tempArr.push({'displayName':policyGroupNodeData.text, 'title': policyGroupNodeData.text, 'id': policyGroupNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-group-duo', 'svgClass': compStatusMap[policyGroupNodeData.data.complianceState]});
                tempArr.push({'displayName':policyNodeData.text, 'title': policyNodeData.text, 'id': policyNodeData.id, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#policy-duo', 'svgClass': compStatusMap[policyNodeData.data.complianceState]});
                tempArr.push({'displayName': nodeData.text, 'title': nodeData.text, 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliant-duo', 'svgClass': compStatusMap[nodeData.data.complianceState]});
            }
        }
        tempArr = this.setStyleForHeaderItems(tempArr);
        var tempMap = {};
        tempMap.headerContent = tempArr;
        tempMap.policyMoreActions = this.updateNodeActionsInHeader(selectedItem);
        if(['policyGroup', 'rule'].includes(selectedItem)){
            tempMap.gridColChooser = true;
            tempMap.gridColChooserOnClick = this.gridColChooserAction(selectedItem);
        } else {
            tempMap.gridColChooser = false;
        }
        tempMap.showExportOptions = ['policy'].includes(selectedItem);
        tempMap.showRunningStatusFilter = ['policy'].includes(selectedItem) && this.showRunningStatusFilterFromRes;
        tempMap.showBulkRemediation = ['policy'].includes(selectedItem) && !ncmIsCentral() && !this.hideBulkRemediationFromRes;
        tempMap.showSearch = ['policy', 'ruleGroup'].includes(selectedItem); // No I18N
		tempMap.showStaticSearch = !tempMap.showSearch;
        this.set('headerData', tempMap);//No I18N
    },
    setStyleForHeaderItems: function(headerArray){
        try{
            var calcActPixelSize = function(displayName){
                var spanEle = document.createElement('span');
                spanEle.textContent = displayName;
                document.body.appendChild(spanEle); // No user input used
                var spanWidth = spanEle.offsetWidth;
                document.body.removeChild(spanEle); // No user input used
                return spanWidth;
            };
//            var totalAvailWidth = Math.round(document.querySelector('.compliance_header').getBoundingClientRect().width * 0.83);// NO I18N
            var sideBarWidth = Math.ceil(document.querySelector('.policies-sidebar').getBoundingClientRect().width);//No I18N
            var actionsWidth = Math.ceil(document.querySelector('.compliance_header_actions').getBoundingClientRect().width);//No I18N
            var totalAvailWidth = window.outerWidth - sideBarWidth - actionsWidth;
            var availWidthPerItem = Math.ceil(totalAvailWidth / headerArray.length);
            var style;
            for(var i=0; i<headerArray.length; i++){
//                var actPixelSize = (headerArray[i].displayName.length + 4) * 10;
                var actPixelSize = calcActPixelSize(headerArray[i].displayName);
//                console.log("Actual pixel size for "+headerArray[i].displayName+" :: "+actPixelSize);
                if (actPixelSize < availWidthPerItem) {
                    style = 'max-width:'+(actPixelSize + 100)+'px;';// NO I18N
                    totalAvailWidth -= (actPixelSize + 100);
                    availWidthPerItem = Math.ceil(totalAvailWidth / (headerArray.length - (i+1)));
                }
                else{
                    style = 'max-width:'+(availWidthPerItem - 100)+'px;';// NO I18N
                    totalAvailWidth -= (availWidthPerItem - 100);
                }
                headerArray[i].style = style;
            }
        } catch(e) {
        }
        return headerArray;
    },
    setMetadataContent: function(){
        var metaDataContent = [];
        if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policyGroup'){
            var temp = OPMClient.NCMCompliance.getPolicyGroupMetaData();
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfPoliciesViolated", this), 'count' : temp.noOfPoliciesViolated, 'percentage' : temp.noOfPoliciesViolatedPercent, 'style':'--progress:'+temp.noOfPoliciesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfDevicesViolated", this), 'count' : temp.noOfDevicesViolated, 'percentage' : temp.noOfDevicesViolatedPercent, 'style':'--progress:'+temp.noOfDevicesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalPoliciesViolated", this), 'count' : temp.noOfCriticalPoliciesViolated, 'percentage' : temp.noOfCriticalPoliciesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalPoliciesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalDevicesViolated", this), 'count' : temp.noOfCriticalDevicesViolated, 'percentage' : temp.noOfCriticalDevicesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalDevicesViolatedPercent});
        }
        else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policy'){
            var temp = OPMClient.NCMCompliance.getPolicyMetaData();
            var showBulkRem = temp.showBulkRemediation;

            if (this.headerData) {
                this.set('headerData.showBulkRemediation', showBulkRem ? !ncmIsCentral() : false); //NO I18N
                this.set('headerData.showRunningStatusFilter', temp.complianceCheckInProgress); //NO I18N
            }
            this.set('hideBulkRemediationFromRes', !showBulkRem); //NO I18N
            this.set('showRunningStatusFilterFromRes', temp.complianceCheckInProgress); //NO I18N
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfRulesViolated", this), 'count' : temp.noOfRulesViolated, 'percentage' : temp.noOfRulesViolatedPercent, 'style':'--progress:'+temp.noOfRulesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfDevicesViolated", this), 'count' : temp.noOfDevicesViolated, 'percentage' : temp.noOfDevicesViolatedPercent, 'style':'--progress:'+temp.noOfDevicesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalRulesViolated", this), 'count' : temp.noOfCriticalRulesViolated, 'percentage' : temp.noOfCriticalRulesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalRulesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalDevicesViolated", this), 'count' : temp.noOfCriticalDevicesViolated, 'percentage' : temp.noOfCriticalDevicesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalDevicesViolatedPercent});
        }
        else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'ruleGroup'){
            var temp = OPMClient.NCMCompliance.getRuleGroupMetaData();
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfRulesViolated", this), 'count' : temp.noOfRulesViolated, 'percentage' : temp.noOfRulesViolatedPercent, 'style':'--progress:'+temp.noOfRulesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfDevicesViolated", this), 'count' : temp.noOfDevicesViolated, 'percentage' : temp.noOfDevicesViolatedPercent, 'style':'--progress:'+temp.noOfDevicesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalRulesViolated", this), 'count' : temp.noOfCriticalRulesViolated, 'percentage' : temp.noOfCriticalRulesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalRulesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfCriticalDevicesViolated", this), 'count' : temp.noOfCriticalDevicesViolated, 'percentage' : temp.noOfCriticalDevicesViolatedPercent, 'style':'--progress:'+temp.noOfCriticalDevicesViolatedPercent});
        }
        else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'rule'){
            var temp = OPMClient.NCMCompliance.getRuleMetaData();
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfDevicesCompliant", this), 'count' : temp.noOfDevicesCompliant, 'percentage' : temp.noOfDevicesCompliantPercent, 'style':'--progress:'+temp.noOfDevicesCompliantPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfDevicesViolated", this), 'count' : temp.noOfDevicesViolated, 'percentage' : temp.noOfDevicesViolatedPercent, 'style':'--progress:'+temp.noOfDevicesViolatedPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfSuccessfulRemediation", this), 'count' : temp.noOfSuccessfulRemediation, 'percentage' : temp.noOfSuccessfulRemediationPercent, 'style':'--progress:'+temp.noOfSuccessfulRemediationPercent});
            metaDataContent.push({ 'header' : Ember.I18n.t("ncm.complianceiq.policy.header.noOfPendingRemediation", this), 'count' : temp.noOfPendingRemediation, 'percentage' : temp.noOfPendingRemediationPercent, 'style':'--progress:'+temp.noOfPendingRemediationPercent});
        }
        this.set('metaDataContent', metaDataContent);//No I18N
    },
    setGridDataContent: function(){
        var gridDataContent = '';
        if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policyGroup'){
            gridDataContent = {'gridTableName' : 'NcmCompliancePolicyGroupResult', 'gridTablePager' : 'NcmCompliancePolicyGroupResultPager'};//No I18N
        }
        else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policy'){
            gridDataContent = {'gridTableName' : 'NcmCompliancePolicyResult', 'gridTablePager' : 'NcmCompliancePolicyResultPager'};//No I18N
        }
        else if (OPMClient.NCMCompliancePolicyController.selectedItem === 'ruleGroup'){
            gridDataContent = {'gridTableName' : 'NcmComplianceRuleGroupResult', 'gridTablePager' : 'NcmComplianceRuleGroupResultPager'};//No I18N
        }
        else if(OPMClient.NCMCompliancePolicyController.selectedItem === 'rule'){
            gridDataContent = {'gridTableName' : 'NcmComplianceRuleResult', 'gridTablePager' : 'NcmComplianceRuleResultPager'};//No I18N
        }
        this.set('gridDataContent', gridDataContent);//No I18N
    },
    selectNodeAction : function(node){
        ncmusrsts1("view_policy_tree");// NO I18N
        var id = node.id;
        var idSplit = id.split("_");
        var selectedItem = idSplit[idSplit.length-2];
        var parents = node.parents;

        OPMClient.NCMCompliancePolicyController.selectedItem = selectedItem;
        OPMClient.NCMCompliancePolicyController.selectedItemId = id;

        this.updateControllerVariables(selectedItem);

        this.setHeaderContent();
        this.setMetadataContent();
        this.setGridDataContent();
        this.emptyDataCheckChanges();

        this.updateSelectedStyleForNode(id);
//        this.setNodePathColor(id,color);
        this.openNode(id);
        var parents = node.parents;
        for (var i=0; i<parents.length; i++){
            if (parents[i] !== '#'){
                this.openNode(parents[i]);
            }
        }
        var children = node.children;
        for (var i=0; i<children.length; i++){
            this.closeNode(children[i]);
        }
        OPMClient.NCMCompliance.pushIconToTree();
        this.updateSelectedFilterArr();
        sessionStorage.setItem('ncmPolicySelectedItemId', id);//No I18N
        sessionStorage.setItem('ncmPolicySelectedItem', selectedItem);//No I18N

        if(this.loadEmptyData){
            return;
        }
        if(this.gridCompInstance){
            try {
                this.gridCompInstance.set('tableName', this.gridDataContent.gridTableName);//No I18N
                this.gridCompInstance.set('tablePager', this.gridDataContent.gridTablePager);//No I18N
                this.gridCompInstance.rerender();
            } catch(e) {}
        }
    },
    updateSelectedStyleForNode: function(nodeId){
        try {
            setTimeout(function(){
                $('.jstree-clicked').removeClass('jstree-clicked');
                $('#'+nodeId+'_anchor').addClass('jstree-clicked');
            }, 100);
        } catch(e) {}
    },
    updateControllerVariables: function(selectedItem){
        if (selectedItem === 'policyGroup'){
            OPMClient.NCMCompliancePolicyController.selectedPolicyGroupName = OPMClient.NCMCompliancePolicyController.getPolicyStandard();
        }
        else if (selectedItem === 'policy'){//No I18N
            OPMClient.NCMCompliancePolicyController.selectedPolicyGroupName = OPMClient.NCMCompliancePolicyController.getPolicyStandard();
            OPMClient.NCMCompliancePolicyController.selectedPolicyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
        }
        else if (selectedItem === 'ruleGroup'){//No I18N
            OPMClient.NCMCompliancePolicyController.selectedPolicyGroupName = OPMClient.NCMCompliancePolicyController.getPolicyStandard();
            OPMClient.NCMCompliancePolicyController.selectedPolicyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
            OPMClient.NCMCompliancePolicyController.selectedRuleGroupId = OPMClient.NCMCompliancePolicyController.getRGId();
        }
        else if (selectedItem === 'rule'){//No I18N
            OPMClient.NCMCompliancePolicyController.selectedPolicyGroupName = OPMClient.NCMCompliancePolicyController.getPolicyStandard();
            OPMClient.NCMCompliancePolicyController.selectedPolicyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
            if (OPMClient.NCMCompliancePolicyController.selectedItemId.split("_").length == 6){
                OPMClient.NCMCompliancePolicyController.selectedRuleGroupId = '-1';
            }
            else{
                OPMClient.NCMCompliancePolicyController.selectedRuleGroupId = OPMClient.NCMCompliancePolicyController.getRGId();
            }
            OPMClient.NCMCompliancePolicyController.selectedRuleId = OPMClient.NCMCompliancePolicyController.getRuleId();
        }
    },
    selectSameNodeAgainAction: function(node){
        var tree = $('#ncmCompliancePolicyTree').jstree(true);
        var id = node.id;
        if(tree.is_open(id)){
            tree.close_node(id);
        }
        else {
            this.openNode(id);
            var parents = node.parents;
            for (var i=0; i<parents.length; i++){
                if (parents[i] !== '#'){
                    this.openNode(parents[i]);
                }
            }
            var children = node.children;
            for (var i=0; i<children.length; i++){
                this.closeNode(children[i]);
            }
        }
    },
    updateNodeActionsInHeader: function(selectedItem){
        var tempArr = [];
        var selectedItemId = OPMClient.NCMCompliancePolicyController.selectedItemId;
        var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
        var id = OPMClient.NCMCompliancePolicyController.getSelectItemId();
        var nodeData = this.getNodeData(selectedItemId);
        var isNodeDisabled = nodeData.data.isDisabled;
        var isStandard = nodeData.data.isStandard;
        var isRestricted = nodeData.data.isRestricted;
        if(selectedItem === 'policyGroup'){
            if(window.OPM.userPermissions.ncmComplianceWrite) {
                tempArr.push({'displayName': Ember.I18n.t("ncm.mid.runCheckCompliance",this), 'onclick':'OPMClient.NCMCompliancePolicyController.runComplianceCheck(false,null,"true")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                tempArr.push({'displayName': Ember.I18n.t("webclient.clone.rules", this), 'onclick':'OPMClient.NCMCompliancePolicyController.clonePolicies()', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                tempArr.push({'displayName': Ember.I18n.t("webclient.action.delete", this), 'onclick':'OPMClient.NCMCompliancePolicyController.deletePolicy(false)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                tempArr.push({'displayName': Ember.I18n.t("webclient.action.enable", this), 'onclick':'OPMClient.NCMCompliancePolicyController.enableDisablePolicyGroup("true")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                tempArr.push({'displayName': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclick':'OPMClient.NCMCompliancePolicyController.enableDisablePolicyGroup("false")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                tempArr.push({'displayName': Ember.I18n.t("webclient.maptab.import", this), 'onclick':'OPMClient.NCMCompliancePolicyController.loadPolicyImport()' , 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#download'});//No I18N
//                tempArr.push({'displayName': Ember.I18n.t("jsp.commonstr.Export", this), 'onclick':'OPMClient.NCMCompliancePolicyController.exportPolicy()' , 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Export-01'});//No I18N
            }
        }
        else if(selectedItem === 'policy'){
            if (!isNodeDisabled) {
                var isFav = nodeData.data.isFavourite;
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("ncm.mid.runCheckCompliance",this), 'onclick':'OPMClient.NCMCompliancePolicyController.runComplianceCheck("'+id+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                    tempArr.push({'displayName': Ember.I18n.t("ncm.name.associatedevices", this), 'onclick':'OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#associate-devices'});//No I18N
                    tempArr.push({'displayName': Ember.I18n.t("webclient.title.edit", this), 'onclick':'OPMClient.NCMCompliancePolicyController.loadPolicyEdit("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    tempArr.push({'displayName': isFav? Ember.I18n.t("webclient.reports.removefavourite", this) : Ember.I18n.t("webclient.opm.common.markasfavourite", this), 'onclick':'OPMClient.NCMCompliance.addRemovePolicyAsFav("'+nodeData.id+'",'+isFav+')' , 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#star-o'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclick':'OPMClient.NCMCompliancePolicyController.runAdhocCheck("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclick':'OPMClient.NCMCompliancePolicyController.runOfflineCheck("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof nodeData.text !== 'function' ? nodeData.text.replace(/\s*\(\d+\)$/, '') : '';// No I18N
                    if (!isRestricted) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.clone.rules", this), 'onclick':'OPMClient.NCMCompliancePolicyController.clonePolicies("'+id+'","'+ replacedText +'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    if (!isStandard) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.action.delete", this), 'onclick':'OPMClient.NCMCompliancePolicyController.deletePolicy("'+id+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
                    if(!ncmIsCentral()){
                        tempArr.push({'displayName':  Ember.I18n.t("ncm.complianceiq.check.stop", this), 'onclick':'OPMClient.NCMCompliancePolicyController.stopComplianceCheck("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                    }
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("webclient.action.enable", this), 'onclick':'OPMClient.NCMCompliancePolicyController.enableDisablePolicy("'+id+'","'+isNodeDisabled+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        else if(selectedItem === 'ruleGroup'){
            if (!isNodeDisabled) {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("ncm.mid.runCheckCompliance",this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.runComplianceCheck("'+policyId+'","'+id+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.runAdhocCheck("'+id+'",true)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.runOfflineCheck("'+id+'",true)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof nodeData.text !== 'function' ? nodeData.text.replace(/\s*\(\d+\)$/, '') : ''; // No I18N
                    tempArr.push({'displayName': Ember.I18n.t("associate", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.loadRuleGroupAssociation("'+id+'","Policies")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#associate-file'});//No I18N
                    if (!isRestricted) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.clone.rules", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.cloneRuleGroups("Policies","'+id+'","'+ replacedText +'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    tempArr.push({'displayName': Ember.I18n.t("webclient.title.edit", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.loadRuleGroupEdit("'+id+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    if (!isStandard) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.action.delete", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.deleteRuleGroup("'+id+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
//                    tempArr.push({'displayName': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.enableDisableRuleGroup("'+id+'","'+isNodeDisabled+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("webclient.action.enable", this), 'onclick':'OPMClient.NCMComplianceRuleGroupController.enableDisableRuleGroup("'+id+'","'+isNodeDisabled+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        else if(selectedItem === 'rule'){
            if (!isNodeDisabled) {
                var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("ncm.mid.runCheckCompliance",this), 'onclick':'OPMClient.NCMComplianceRulesController.runComplianceCheck("'+policyId+'","'+id+'","true","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Funnel'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclick':'OPMClient.NCMComplianceRulesController.runAdhocCheck("'+id+'",true)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'displayName': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclick':'OPMClient.NCMComplianceRulesController.runOfflineCheck("'+id+'",true)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof nodeData.text !== 'function' ? nodeData.text.replace(/\s*\(\d+\)$/, '') : ''; // No I18N
                    tempArr.push({'displayName': Ember.I18n.t("associate", this), 'onclick':'OPMClient.NCMComplianceRulesController.loadRuleAssociation("'+id+'","Policies")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#associate-file'});//No I18N
                    if (!isRestricted) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.clone.rules", this), 'onclick':'OPMClient.NCMComplianceRulesController.cloneRules("Policies","'+id+'","'+ replacedText +'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    tempArr.push({'displayName': Ember.I18n.t("webclient.title.edit", this), 'onclick':'OPMClient.NCMComplianceRulesController.loadRuleEdit("'+id+'",true)', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    if (!isStandard) {
                        tempArr.push({'displayName': Ember.I18n.t("webclient.action.delete", this), 'onclick':'OPMClient.NCMComplianceRulesController.deleteRules("'+id+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
//                    tempArr.push({'displayName': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclick':'OPMClient.NCMComplianceRulesController.enableDisableRule("'+id+'","'+isNodeDisabled+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'displayName': Ember.I18n.t("webclient.action.enable", this), 'onclick':'OPMClient.NCMComplianceRulesController.enableDisableRule("'+id+'","'+isNodeDisabled+'","'+selectedItemId+'")', 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
//        this.set('policyMoreActions', tempArr);//No I18N
        return tempArr;
    },
    gridColChooserAction: function(selectedItem){
        var tempMap = {'policyGroup':'NcmCompliancePolicyGroupResult', 'policy':'NcmCompliancePolicyResult', 'ruleGroup':'NcmComplianceRuleGroupResult', 'rule':'NcmComplianceRuleResult'};//No I18N
//        this.set('gridColChooserOnClick', 'OPMClient.NCMComplianceListController.openColChooser(\''+ tempMap[selectedItem] +'\')');//No I18N
        return 'OPMClient.NCMComplianceListController.openColChooser(\''+ tempMap[selectedItem] +'\')'; //No I18N
    },
    openNode: function(nodeId) {
        $('#ncmCompliancePolicyTree').jstree('open_node', nodeId);
    },
    openNodeAction: function() {
        this.wrapAnchorWithDiv();
        OPMClient.NCMCompliance.pushIconToTree();
        var __self = this;
        setTimeout(function(){
            __self.treeCompInstance.updateAnchorWidth();
        }, 200);
    },
    closeNode: function(nodeId) {
        $('#ncmCompliancePolicyTree').jstree('close_node', nodeId);
    },
    closeNodeAction: function() {
        var __self = this;
        setTimeout(function(){
            __self.treeCompInstance.updateAnchorWidthForCloseNode();
        }, 500);
    },
    hoverNodeAction: function(node){
        var __self = this;
        var id = node.id;
        var idSplit = id.split("_");
        var hoveredItem = idSplit[idSplit.length-2];
        __self.updateNodeActionsInTree(hoveredItem, id);

        var anchorTag = document.querySelector('#'+node.id).querySelector("a");//No I18N
        var anchorTagText = $(anchorTag).text();
        var isDivAddedAlready = function(element, tagName, className){
            var children = element.children;
            if(children){
                for(var i = 0; i < children.length; i++){
                    if(children[i].tagName === tagName && children[i].className === className){
                        return true;
                    }
                }
            }
            return false;
        }
        // Removing anchor text and replacing it with a text span element for CSS issue fixes - Commenting this code as it is not required anymore
        /*var anchorChildNodes = anchorTag.childNodes;
        for (var i=0; i<anchorChildNodes.length; i++){
            if (anchorChildNodes[i].nodeType === Node.TEXT_NODE) {
                anchorChildNodes[i].remove();
                break;
            }
        }

        var spanElement = document.createElement('span');
        spanElement.setAttribute('class', 'nodeTextSpanClass');
        spanElement.textContent = anchorTagText;
        if (!isDivAddedAlready(anchorTag, 'SPAN', 'nodeTextSpanClass')) {
            anchorTag.appendChild(spanElement);// No user input used - Used for text rendering in jstree
        }*/

		// var countSpanEle = document.createElement('span');
		// countSpanEle.setAttribute('class', 'tree_compliance_badge');
		// countSpanEle.textContent = 10;
		// if (!isDivAddedAlready(anchorTag, 'SPAN', 'tree_compliance_badge')) {
		// 	anchorTag.appendChild(countSpanEle);
		// }

        if ((anchorTag.nextElementSibling && anchorTag.nextElementSibling.classList.contains('sidebar_more_icon'))) {
            anchorTag.nextElementSibling.remove();
        }

        var nodeActionMenuDiv = document.createElement('div');
        var actionMenuIconDiv = document.createElement('div');
        var svgEle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');//No I18N
        var useEle = document.createElementNS('http://www.w3.org/2000/svg', 'use');//No I18N
        useEle.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/apiclient/fluidicv2/img/sprite-opm.svg#DotsThreeVertical');//No I18N
        svgEle.setAttribute('class', 'svgIcon size16');
        svgEle.appendChild(useEle);// No user input used - Used for icon rendering in jstree
        actionMenuIconDiv.appendChild(svgEle);// No user input used - Used for icon rendering in jstree
        actionMenuIconDiv.setAttribute('class', 'opmBtn whiteBg inline-flex flex-center rounded m-none noMinWd p-sm ht_28');
        nodeActionMenuDiv.setAttribute('class', 'dropdown_menu_main_container hover');
        nodeActionMenuDiv.appendChild(actionMenuIconDiv);// No user input used - Used for icon rendering in jstree

        var treeHeight = document.querySelector('.jsTreeType1').offsetHeight; //No I18N
        var treeScrollHeight = document.querySelector('.jsTreeType1').scrollHeight;//No I18N

        var favIconMoreIconWrappedDiv = document.createElement('div');
        favIconMoreIconWrappedDiv.style.position = 'fixed';
        favIconMoreIconWrappedDiv.style.zIndex = '99999';
        favIconMoreIconWrappedDiv.style.left = ($('.ncm-policies-page .overflow_policies_sidebar').outerWidth() - ((treeScrollHeight + 10) > treeHeight ? 52 : 46)) + 'px';
        favIconMoreIconWrappedDiv.style.top = (anchorTag.getBoundingClientRect().top + 2) + 'px';
        favIconMoreIconWrappedDiv.setAttribute('class', 'sidebar_more_icon');
        favIconMoreIconWrappedDiv.appendChild(nodeActionMenuDiv);// No user input used - Used for icon rendering in jstree

        favIconMoreIconWrappedDiv.addEventListener('mouseenter', function(event){
            sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'true');//No I18N
        });
        favIconMoreIconWrappedDiv.addEventListener('mouseleave', function(event){
            sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'false');//No I18N
        });

        anchorTag.addEventListener('mouseenter', function(event){
            sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'false');//No I18N
        });
        anchorTag.addEventListener('mouseleave', function(event){
            sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'true');//No I18N
        });
        if(OPMClient.NCMCompliancePolicyController.treeNodeMoreAction.length <= 0 || (idSplit.length === 2 && node.children.length < 1)) {
            favIconMoreIconWrappedDiv.style.display = 'none'; // No I18N
        }
        anchorTag.insertAdjacentElement('afterend', favIconMoreIconWrappedDiv);//No I18N

        anchorTag.setAttribute('title', anchorTagText);
        anchorTag.setAttribute('class', 'policy_item_hover');

        $('#ncmCompTreeMoreAction').hide();
        $('.sidebar_more_icon').on('mouseenter', function() {
            var top = $(this).offset().top;
            __self.set('sideBarHover', true);//No I18N
            $('#ncmCompTreeMoreAction').show();
            var anchorTagDOMRect = anchorTag.getBoundingClientRect();
            var anchorTagTop = anchorTagDOMRect.top;
            var anchorTagBottom = anchorTagDOMRect.bottom;
            var element = document.getElementById('ncmCompTreeMoreAction'); // NO I18N
            var availHeight = window.innerHeight - anchorTagBottom;
            var actionMenuHeight = $('#ncmCompTreeMoreAction .dropdown_menu_content_container').height() + 8; // 8 is added for padding correction
            if (availHeight < actionMenuHeight) {
                element.style.top = (anchorTagTop - actionMenuHeight + anchorTagDOMRect.height + 4) + 'px'; // top correction done
                element.style.bottom = 'unset'; // No I18N
            } else {
                element.style.top = anchorTagTop - 4 + 'px';
                element.style.bottom = 'unset'; // No I18N
            }
            element.style.position = 'fixed';
            var treeContainerDiv = document.querySelector('.compliance_overflow_sidebar'); //No I18N
            var verticalScroll = false, horizontalScroll = false;
            if (treeContainerDiv) {
                verticalScroll = treeContainerDiv.scrollHeight > treeContainerDiv.clientHeight;
                horizontalScroll = treeContainerDiv.scrollWidth > treeContainerDiv.clientWidth;
            }
            element.style.left = Math.ceil(treeContainerDiv.getBoundingClientRect().right - ((verticalScroll || (!verticalScroll && !horizontalScroll)) ? 5 : 0)) + 'px'; // correction done to push action list close to action menu
        });
        $('.sidebar_more_icon').on('mouseleave', function(event) {
            __self.set('sideBarHover', false);//No I18N
        });
        /*$('#ncmCompTreeMoreAction').on('mouseenter', function() {
            var anchorTag = document.querySelector('#'+node.id+'_anchor').querySelector("a");//No I18N
            console.log('anchorTag', document.querySelector('#'+node.id+'_anchor'));
            if(!anchorTag.getAttribute('class').includes('policy_item_hover')){
                anchorTag.setAttribute('class', 'policy_item_hover');
            }
        });*/
        $('#ncmCompTreeMoreAction').on('mouseleave', function() {
            $('#ncmCompTreeMoreAction').hide();
            var anchorDiv = document.querySelector('#'+node.id+'_anchor');
            if(anchorDiv){
                var anchorTag = anchorDiv.querySelector("a");//No I18N
                if(anchorTag && anchorTag.getAttribute('class') && anchorTag.getAttribute('class').indexOf('policy_item_hover') > -1){
                    anchorTag.setAttribute('class', '');
                }
            }
        });
        $('#ncmCompTreeMoreAction').on('click', function(event) {
            $('#ncmCompTreeMoreAction').hide();
        });
    },
    treeNodeMoreActionClose : function(event){
        var ncmCompTreeMoreAction = document.getElementById('ncmCompTreeMoreAction');
        if(!ncmCompTreeMoreAction.contains(event.target)){
            setTimeout(function() {
                var isHovered = ncmCompTreeMoreAction && ncmCompTreeMoreAction.matches(':hover'); // NO I18N
                if (!isHovered && (OPMClient.NCMCompliancePolicyController.policyCompInstance && !OPMClient.NCMCompliancePolicyController.policyCompInstance.sideBarHover)) {
                    $('#ncmCompTreeMoreAction').hide();
                }
            }, 1000);
        }

        setTimeout(function() {
            var mainMenuContainer = $("#policyGroupGridActions");
            if (mainMenuContainer.length > 0 && !mainMenuContainer.is(":hover") && !OPMClient.NCMComplianceUtilController.showMoreActionMenuForGrid) {
                mainMenuContainer.hide();
            }
        },1000);
    },
    hideActionIconOnScroll: function(event) {
        if (!event.shiftKey) {
            var moreActionEle = $('.sidebar_more_icon');
            if (moreActionEle) {
                moreActionEle.hide();
            }
        }
    },
    updateNodeActionsInTree: function(hoveredItem, itemId){
        OPMClient.NCMCompliancePolicyController.set('treeNodeMoreAction', []);//No I18N
        var id = OPMClient.NCMCompliancePolicyController.getSelectItemId(itemId);
        var hoveredNodeData = this.getNodeData(itemId);
        var isStandard = hoveredNodeData.data.isStandard;
        var isNodeDisabled = hoveredNodeData.data.isDisabled;
        var isRestricted = hoveredNodeData.data.isRestricted;
        var tempArr = [];
        if (hoveredItem === 'policyGroup'){
            var children = hoveredNodeData.children;
            var policyIds = "";
            for (var i=0; i<children.length; i++){
                var tempSplitArr = children[i].split("_");
                if (i < children.length - 1) {
                    policyIds += '"' + tempSplitArr[tempSplitArr.length-1] + '"' + ",";//No I18N
                } else {
                    policyIds += '"' + tempSplitArr[tempSplitArr.length-1] + '"';//No I18N
                }
            }
            if(!isNodeDisabled) {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("ncm.mid.runCheckCompliance", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.runComplianceCheck(['+policyIds+'])', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("webclient.action.enable", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.enablePolicyGroup(['+policyIds+'])', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        else if (hoveredItem === 'policy'){
            if (!isNodeDisabled) {
                var isFav = hoveredNodeData.data.isFavourite;
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("ncm.mid.runCheckCompliance", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.runComplianceCheck("'+id+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                    tempArr.push({'name': Ember.I18n.t("ncm.name.associatedevices", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.loadPolicyDeviceAssociation("'+id+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#associate-devices'});//No I18N
                    tempArr.push({'name': Ember.I18n.t("webclient.title.edit", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.loadPolicyEdit("'+id+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    tempArr.push({'name': isFav ? Ember.I18n.t("webclient.reports.removefavourite", this) : Ember.I18n.t("webclient.opm.common.markasfavourite", this), 'onclickFunc': 'OPMClient.NCMCompliance.addRemovePolicyAsFav("'+itemId+'",'+isFav+')', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#star-o'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.runAdhocCheck("'+id+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.runOfflineCheck("'+id+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof hoveredNodeData.text !== 'function' ? hoveredNodeData.text.replace(/\s*\(\d+\)$/, '') : ''; // No I18N
                    if (!isRestricted) {
                        tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.policy.clone", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.clonePolicies("'+id+'","'+ replacedText +'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    if (!isStandard) {
                        tempArr.push({'name': Ember.I18n.t("webclient.title.delete", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.deletePolicy("'+id+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.enableDisablePolicy("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Enable", this), 'onclickFunc': 'OPMClient.NCMCompliancePolicyController.enableDisablePolicy("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        else if (hoveredItem === 'ruleGroup'){
            if (!isNodeDisabled) {
                var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId(itemId);
                if(window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'name': Ember.I18n.t("ncm.mid.runCheckCompliance", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.runComplianceCheck("'+policyId+'","'+id+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.runAdhocCheck("'+id+'",true)', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.runOfflineCheck("'+id+'",true)', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof hoveredNodeData.text !== 'function' ? hoveredNodeData.text.replace(/\s*\(\d+\)$/, '') : ''; // No I18N
                    tempArr.push({'name': Ember.I18n.t("associate", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.loadRuleGroupAssociation("'+id+'","Policies")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#associate-file'});//No I18N
                    if (!isRestricted) {
                        tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.rulegroup.clone", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.cloneRuleGroups("Policies","'+id+'","'+ replacedText +'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    tempArr.push({'name': Ember.I18n.t("webclient.title.edit", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.loadRuleGroupEdit("'+id+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    if (!isStandard) {
                        tempArr.push({'name': Ember.I18n.t("webclient.title.delete", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.deleteRuleGroup("'+id+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.enableDisableRuleGroup("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Enable", this), 'onclickFunc': 'OPMClient.NCMComplianceRuleGroupController.enableDisableRuleGroup("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        else if (hoveredItem === 'rule'){
            if (!isNodeDisabled) {
                var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId(itemId);
                if(window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'name': Ember.I18n.t("ncm.mid.runCheckCompliance", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.runComplianceCheck("'+policyId+'","'+id+'","false","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#compliance-check'});//No I18N
                }
                if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.adhoc.title", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.runAdhocCheck("'+id+'",true)', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc'});//No I18N
                    tempArr.push({'name': Ember.I18n.t("ncm.complianceiq.check.offline", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.runOfflineCheck("'+id+'",true)', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#file-offline'});//No I18N
                }
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    var replacedText = typeof hoveredNodeData.text !== 'function' ? hoveredNodeData.text.replace(/\s*\(\d+\)$/, '') : ''; // No I18N
                    tempArr.push({'name': Ember.I18n.t("associate", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.loadRuleAssociation("'+id+'","Policies")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#associate-file'});//No I18N
                    if (!isRestricted) {
                        tempArr.push({'name': Ember.I18n.t("js.commonstr.cloneRule", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.cloneRules("Policies","'+id+'","'+ replacedText +'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy'});//No I18N
                    }
                    tempArr.push({'name': Ember.I18n.t("webclient.title.edit", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.loadRuleEdit("'+id+'",true)', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#edit-pencil'});//No I18N
                    if (!isStandard) {
                        tempArr.push({'name': Ember.I18n.t("webclient.title.delete", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.deleteRules("'+id+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#Trash'});//No I18N
                    }
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Disable", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.enableDisableRule("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#disabled'});//No I18N
                }
            } else {
                if(window.OPM.userPermissions.ncmComplianceWrite) {
                    tempArr.push({'name': Ember.I18n.t("jsp.commonstr.Enable", this), 'onclickFunc': 'OPMClient.NCMComplianceRulesController.enableDisableRule("'+id+'","'+isNodeDisabled+'","'+itemId+'")', 'icon': '/apiclient/fluidicv2/img/sprite-opm.svg#enable-disable'});//No I18N
                }
            }
        }
        OPMClient.NCMCompliancePolicyController.set('treeNodeMoreAction', tempArr);//No I18N
    },
    dehoverNodeAction: function(node){
        var nodeElement = document.querySelector('#'+node.id);//No I18N
        var anchorTag = nodeElement.querySelector("a");//No I18N
        if ((anchorTag.nextElementSibling && anchorTag.nextElementSibling.classList.contains('sidebar_more_icon'))) {
            anchorTag.nextElementSibling.remove(); // Remove the existing element
            setTimeout(function(){
                var treeMoreActionEle = document.getElementById('ncmCompTreeMoreAction');
                var isMoreActionHovered = treeMoreActionEle && treeMoreActionEle.matches(':hover'); // NO I18N
                if(!isMoreActionHovered){
                    anchorTag.setAttribute('class', '');
                }
            }, 10);
            anchorTag.removeEventListener('mouseenter', function(event){
                sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'false');//No I18N
            });
            anchorTag.removeEventListener('mouseleave', function(event){
                sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'true');//No I18N
            });
        }
        anchorTag.removeAttribute('title');
    },
    getNodeData: function(nodeId){
        return $('#ncmCompliancePolicyTree').jstree('get_node', nodeId);
    },
    updateSelectedFilterArr: function(){
        if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policyGroup' || OPMClient.NCMCompliancePolicyController.selectedItem === 'rule'){
            this.set('selectedFilterArr', false); // NO I18N
            return;
        }
        this.set('compStatusFilter', OPMClient.NCMCompliance.getDeviceCompStatus()); // NO I18N
        this.set('violationSevFilter',OPMClient.NCMCompliance.getDeviceCompSeverity()); // NO I18N
        var compStatusFilterArr = this.compStatusFilter.split(',');//NO I18N
        var violationSevFilterArr = this.violationSevFilter.split(',');//NO I18N
        var selectedFilterArr = [];
        if (compStatusFilterArr && compStatusFilterArr.length > 0) {
            for (var i = 0; i < compStatusFilterArr.length; i++) {
                if(compStatusFilterArr[i] === 'All') { // NO I18N
                    continue;
                }
                selectedFilterArr.push({
                    value : compStatusFilterArr[i],
                    displayName : OPMClient.NCMComplianceUtilController.formatWithI18n(compStatusFilterArr[i])
                });
            }
        }
        if (violationSevFilterArr && violationSevFilterArr.length > 0) {
            for (var j = 0; j < violationSevFilterArr.length; j++) {
                if(violationSevFilterArr[j] === 'All') { // NO I18N
                    continue;
                }
                selectedFilterArr.push({
                    value : violationSevFilterArr[j],
                    displayName : OPMClient.NCMComplianceUtilController.formatWithI18n(violationSevFilterArr[j])
                });
            }
        }
        this.set('selectedFilterArr', selectedFilterArr.length == 0 ? false : selectedFilterArr); // NO I18N
    }.observes('compStatusFilter', 'violationSevFilter'), // NO I18N
    willDestroyElement: function(){
        window.removeEventListener('resize', this.gridFooterFixToBottom);
        document.removeEventListener('mousemove', this.treeNodeMoreActionClose);
        document.removeEventListener('wheel', this.hideActionIconOnScroll);
        document.removeEventListener('click', this.ruleResultEditDropdownHandler);
    }
});
OPMClient.NcmPolicyTreeComponent = Ember.Component.extend({
    sideBarHover: false,
    treeData: null,
    classNames:["policies-sidebar"],//No I18N
    openCloseText: Ember.I18n.t("ncm.complianceiq.policytree.sidebar.close", this),//No I18N
    openCloseIcon: '/apiclient/fluidicv2/img/sprite-opm.svg#SidebarSimple',//No I18N
    minMaxText: Ember.I18n.t("ncm.complianceiq.policytree.sidebar.maximize", this),//No I18N
    minMaxIcon: '/apiclient/fluidicv2/img/sprite-opm.svg#SidebarSplitHorizontal',//No I18N
    init : function(){
        this._super();
    },
    didInsertElement : function(){
        this._super();
        var __self = this;
        try{
            $('#ncmCompliancePolicyTree').jstree('destroy');
        } catch(error){}
        $('#ncmCompliancePolicyTree')
        .on('ready.jstree', function (e, data){
        })
        .on('loading.jstree', function(){
        })
        .on('loaded.jstree', function(){
            // TODO: connecting line color changes based on comp status here
        })
        .on('state_ready.jstree', function(e, data){
        })
        .on('state_save.jstree', function(e, data){
        })
        .on('state_load.jstree', function(e, data){
        })
        .on('disable_node.jstree', function(e, data){
        })
        .on('enable_node.jstree', function(e, data){
        })
        .on('hover_node.jstree', function(e, data){
            __self.sendAction('action', 'hoverNodeAction', data.node);
        })
        .on('dehover_node.jstree', function(e, data){
            __self.sendAction('action', 'dehoverNodeAction', data.node);
        })
        .on('check_node.jstree', function(e, data){
        })
        .on('uncheck_node.jstree', function(e, data){
        })
        .on('copy_node.jstree', function(e, data){
        })
        .on('move_node.jstree', function(e, data){
        })
        .on('rename_node.jstree', function(e, data){
        })
        .on('create_node.jstree', function(e, data){
        })
        .on('delete_node.jstree', function(e, data){
        })
        .on('open_node.jstree', function(e, data){
            __self.sendAction('action', 'openNodeAction');
            __self.set('currentTreeState', $('#ncmCompliancePolicyTree').jstree(true).get_state());//No I18N
        })
        .on('close_node.jstree', function(e, data){
            __self.sendAction('action', 'closeNodeAction');
            __self.set('currentTreeState', $('#ncmCompliancePolicyTree').jstree(true).get_state());//No I18N
        })
        .on('search.jstree', function(e, data){
        })
        .on('search_complete.jstree', function(e, data){
        })
        .on('clear_search.jstree', function(){
        })
        .on('check_all.jstree', function(){
        })
        .on('uncheck_all.jstree', function(){
        })
        .on('dnd_start.jstree', function(e, data){
        })
        .on('dnd_move.jstree', function(e, data){
        })
        .on('dnd_open.jstree', function(e, data){
        })
        .on('dnd_stop.jstree', function(e, data){
        })
        .on('select_node.jstree', function(e, data){
            if (sessionStorage.getItem('ncmPolicyNodeActionsHovered') === 'true') {
//                sessionStorage.setItem('ncmPolicyNodeActionsHovered', 'false');//No I18N
                return;
            }
            if(data.node.id !== OPMClient.NCMCompliancePolicyController.selectedItemId){
                __self.sendAction('action', 'selectNodeAction', data.node);
//                __self.updateAnchorWidth();
            }
            else{
                __self.sendAction('action', 'selectSameNodeAgainAction', data.node);
            }
            __self.set('currentTreeState', $('#ncmCompliancePolicyTree').jstree(true).get_state());//No I18N
        })
        .on('deselect_node.jstree', function(e, data){
            __self.set('currentTreeState', $('#ncmCompliancePolicyTree').jstree(true).get_state());//No I18N
        })
        .on('deselect_all.jstree', function(e, data){
        })
        .on('dblclick.jstree', function (e) {
//            __self.sendAction('action', 'doubleClickNodeAction', e);
        })
        .on('before_open.jstree', function(e, data){
            /*if (data.node.state.disabled) {
                console.log('disabled');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }*/
        })
        .on('show_contextmenu.jstree', function(e, data){
        })
        .on('redraw.jstree', function(e, data){
        })
        .on('destroy.jstree', function(e, data){
        })
        .on('refresh.jstree', function(e, data){
        })
        .jstree({
                'core':{//No I18N
                    'data': __self.ncmTreeData//No I18N
                },
                'plugins': [/*'contextmenu' ,*/'search','sort'],//No I18N
                'search': {//No I18N
                    'case_sensitive': false,//No I18N
                    'show_only_matches': true,//No I18N
                    'search_leaves_only': false,//No I18N
                    'fuzzy': false//No I18N
                },
                sort: function (a, b) {
                    var tree = $('#ncmCompliancePolicyTree').jstree(true);//No I18N
                    var nodeA = tree.get_node(a);
                    var nodeB = tree.get_node(b);
                    var getSortRank = function(node) {
                        return node.id === 'policyGroup_FAVOURITE' ? 0 : node.id === 'policyGroup_ALL' ? 1 : node.id === 'policyGroup_CUSTOM' ? 2 : 3; // Favourites, All, Custom, Others
                    };
                    var rankA = getSortRank(nodeA);
                    var rankB = getSortRank(nodeB);
                    if (rankA !== rankB) {
                        return rankA - rankB;
                    }
//                    if (nodeA.id === 'policyGroup_FAVOURITE') { return -1 };
//                    if (nodeB.id === 'policyGroup_FAVOURITE') { return 1 };
                    var valA = nodeA.data.isDisabled;
                    var valB = nodeB.data.isDisabled;
                    if (valA && !valB) { return 1 };
                    if (!valA && valB) { return -1 };
                    /*var textA = nodeA.text.toLowerCase();
                    var textB = nodeB.text.toLowerCase();
                    if (textA < textB) { return -1 };
                    if (textA > textB) { return 1 };*/
                }
                /*,
                contextmenu: {
                    items: function(node){
                        return {
                            "action1": {//No I18N
                                "label": "Test Action",//No I18N
                                "action": function(){//No I18N
                                    alert("Test Action");//No I18N
                                }
                            }
                        };
                    }
                }*/
        });

        OPMClient.NCMCompliance.pushIconToTree();
        document.querySelector('.policies-sidebar').addEventListener('click', OPMClient.NCMCompliance.pushIconToTree());//No I18N
//        document.querySelector('#ncmPolicyTreeSearch').addEventListener('input', this.searchTree);//No I18N
        var searchTimeout;
        $('#ncmPolicyTreeSearch').on('input', function () {
            try {
                clearTimeout(searchTimeout);
            } catch (e) {}
            var searchText = this.value.trim();
            searchTimeout = setTimeout(function(){
                if (searchText.length > 0) {
                    __self.searchTree();
                } else {
                    __self.clearSearch();
                }
            }, 2000);
        });
        this.sendAction('action', 'saveTreeCompInstance', this);
        this.sendAction('action', 'wrapAnchorWithDivAction');
        __self.updateAnchorWidth();
        try {
            var nodeId = sessionStorage.getItem('ncmPolicySelectedItemId');//No I18N
            var selItem = sessionStorage.getItem('ncmPolicySelectedItem');//No I18N
            if (nodeId && selItem) {
                $('#ncmCompliancePolicyTree').jstree('select_node', nodeId);
            }
        } catch(e) {}
        this.sideBarMenuHoverChanges();
        document.addEventListener('mousemove', this.sideBarMenuClose);
        OPMClient.NCMCompliancePolicyController.treeCompInstance = this;
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        expandCollapse: function(){
            this.sendAction('action', 'expandCollapse');
        },
        openCloseSidePanel: function(){
            this.sendAction('action', 'openCloseSidePanel');
        },
        minMaxSidePanel: function(){
            this.sendAction('action', 'minMaxSidePanel');
        },
        clearSearchAction: function(){
            this.clearSearch(true, true);
        }
    },
    getSavedState: function(){
        return this.currentTreeState;
    },
    getCurrentState: function(){
        return $('#ncmCompliancePolicyTree').jstree(true).get_state();
    },
    setTreeState: function(state){
        var tree = $('#ncmCompliancePolicyTree').jstree(true);
        tree.set_state(state);
    },
    sideBarMenuHoverChanges: function(){
        var __self = this;
        var sideBarMenu = document.querySelector('.sidebar_expand_collapse_menu'); // No I18N
        $(sideBarMenu).hover(
            function() {
                var contentMenu = sideBarMenu.querySelector('.collapse_menu_content'); // No I18N
                if (contentMenu) {
                    __self.sideBarHover = true;
                    contentMenu.style.display = 'block';
                }
            },
            function() {
                __self.sideBarHover = false;
            }
        );
    },
    sideBarMenuClose: function(event){
        var contentMenu = document.querySelector('.collapse_menu_content'); // No I18N
        if (!contentMenu.contains(event.target)) {
            setTimeout(function() {
                var isHovered = contentMenu && contentMenu.matches(':hover'); // NO I18N
                if (!isHovered && (OPMClient.NCMCompliancePolicyController.treeCompInstance && !OPMClient.NCMCompliancePolicyController.treeCompInstance.sideBarHover)) {
                    contentMenu.style.display = 'none';
                }
            }, 200);
        }
    },
    searchTree: function(){
//        $('#ncmCompliancePolicyTree').jstree('search', $('#ncmPolicyTreeSearch').val());

        this.clearSearch(false, false);
        this.set('searchInProgress', true); // No I18N
        var __self = this;

        var searchDiv = $(".tree_search_close");
        if(searchDiv) {
            if(!searchDiv[0].classList.contains('search_active')){
                searchDiv[0].classList.add('search_active');//No I18N
            }
        }

        var searchText = $('#ncmPolicyTreeSearch').val();
        var batchSize = 10;
        var tree = $('#ncmCompliancePolicyTree').jstree(true);
//        tree.clear_search();
        var allNodes = tree.get_json('#', { flat: true });
        var matchedNodes = allNodes.filter(function(node){
            return node.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        });

        this.set('treeData', tree.settings.core.data); // No I18N

        this.treeDataChangesForSearch(matchedNodes);

        var tempNodeIdSet = new Set();
        var index = 0;
        function processBatch() {
            for (var i = 0; i < batchSize && index < matchedNodes.length; i++, index++) {
                /*var nodeId = matchedNodes[index].id;
                tree.open_node(tree.get_parent(nodeId));*/
                var nodeData = tree.get_node(matchedNodes[index].id);
                var parents = nodeData.parents;
                for (var j = parents.length - 1; j >= 0; j--) {
                    var parentId = parents[j];
                    var parentData = tree.get_node(parentId);
                    if (parentId !== '#' && !parentData.data.isDisabled) { // No I18N
                        tree.open_node(parentId);
                    }
                }
                tempNodeIdSet.add(matchedNodes[index].id);
                /*tree.search(matchedNodes[index].text);*/
            }
            for (var j = 0, arr = Array.from(tempNodeIdSet); j < arr.length; j++) {
                var nodeEle = document.getElementById(arr[j] + '_anchor'); // No I18N
                if (nodeEle) {
                    nodeEle.classList.add('jstree-search');//No I18N
                }
            }
            tempNodeIdSet = new Set();
            OPMClient.NCMCompliancePolicyController.policyCompInstance.wrapAnchorWithDiv();
            OPMClient.NCMCompliance.pushIconToTree();
            if (index < matchedNodes.length && __self.searchInProgress) {
                setTimeout(processBatch, 100);
            }
        }
        processBatch();
    },
    clearSearch: function(clearSearchText, closeAllNodes){
        this.set('searchInProgress', false); // No I18N
        var searchDiv = $(".tree_search_close");
        if(searchDiv) {
            if(searchDiv[0].classList.contains('search_active')){
                searchDiv[0].classList.remove('search_active');//No I18N
            }
        }
        if (clearSearchText) {
            var searchTextInput = $('#ncmPolicyTreeSearch');
            if (searchTextInput) {
                searchTextInput.val('');
            }
        }
        if(this.treeData) {
            this.updateTreeData(this.treeData);
            OPMClient.NCMCompliancePolicyController.policyCompInstance.wrapAnchorWithDiv();
            OPMClient.NCMCompliance.pushIconToTree();
        }
        var tree = $('#ncmCompliancePolicyTree').jstree(true);
        var allNodes = tree.get_json('#', { flat: true });
        var matchedNodes = allNodes.filter(function(node){
            var nodeElement = document.getElementById(node.id + '_anchor');
            return nodeElement && nodeElement.classList.contains('jstree-search');//No I18N
        });
        for (var i = 0; i < matchedNodes.length; i++) {
            var nodeEle = document.getElementById(matchedNodes[i].id + '_anchor'); // No I18N
            nodeEle.classList.remove('jstree-search');//No I18N
        }
        /*for (var i = 0; i < matchedNodes.length; i++) {
            tree.close_node(tree.get_parent(matchedNodes[i].id));
        }*/
//        for (var i = 0; i < allNodes.length; i++) {
//            var node = allNodes[i];
//            if (node.state.opened) {
//                tree.close_node(node.id);
//            }
//        }
         if(closeAllNodes) {
             setTimeout(function() {
                $('#ncmCompliancePolicyTree').jstree('close_all');
             }, 1000);
         }
    },
    treeDataChangesForSearch: function(matchedNodes) {
        var tree = $('#ncmCompliancePolicyTree').jstree(true);

        var allRequiredNodeIds = new Set();
        matchedNodes.forEach(function(node) {
            allRequiredNodeIds.add(node.id);
            var parents = tree.get_node(node.id).parents;
            parents.forEach(function(parentId) {
                if(parentId !== '#') {
                    allRequiredNodeIds.add(parentId);
                }
            });
        });

        var filteredTreeFlatData = tree.get_json('#', { flat: true }).filter(function(node) { return allRequiredNodeIds.has(node.id); });//No I18N

        function flatToNestedTree(flatNodes) {
            var nodeMap = {};
            var roots = [];
            // Map all nodes by id
            flatNodes.forEach(function(node) {
                var id = node.id, text = node.text, data = node.data, state = node.state;
                var filteredNode = { id: id, text: text, data: data, children: [] };
                if (state !== undefined) { filteredNode.state = state; }
                nodeMap[id] = filteredNode;
            });
            // Link children to parents
            flatNodes.forEach(function(node) {
                var parentId = node.parent;
                if (parentId && parentId !== "#" && nodeMap[parentId]) {
                    nodeMap[parentId].children.push(nodeMap[node.id]);
                } else {
                    roots.push(nodeMap[node.id]);
                }
            });
            return roots;
        }
        this.updateTreeData(flatToNestedTree(filteredTreeFlatData));
    },
    updateTreeData: function(newDataArray){
        var ncmPolicyTree = $('#ncmCompliancePolicyTree').jstree(true);
        ncmPolicyTree.settings.core.data = newDataArray;
        ncmPolicyTree.refresh();
    },
    updateAnchorWidth: function(manualWidth){
        var anchorTags = document.querySelectorAll('.jstree-anchor'); // No I18N
        if (manualWidth) {
            for (var i = 0; i < anchorTags.length; i++) {
                var anchorTag = anchorTags[i].firstElementChild;
                if (anchorTag) {
                    anchorTag.setAttribute('style', 'width: ' + manualWidth + 'px !important;'); // No I18N
                }
            }
        } else {
            var maxDepth = 0;
            for (var i = 0; i < anchorTags.length; i++) {
                var anchorTag = anchorTags[i];
                if (anchorTag) {
                    var anchorDepth = anchorTag.getAttribute('aria-level'); // No I18N
                    if (anchorDepth && parseInt(anchorDepth) > maxDepth) {
                        maxDepth = parseInt(anchorDepth);
                    }
                }
            }
            var currentScrollWidth = $('.overflow_policies_sidebar')[0].getBoundingClientRect().width; // No I18N
            for (var i = 0; i < anchorTags.length; i++) {
                var anchorTag = anchorTags[i].firstElementChild;
                if (anchorTag) {
                    var anchorDepth = anchorTags[i].getAttribute('aria-level'); // No I18N
                    var finalWidthToSet = currentScrollWidth + ((maxDepth - anchorDepth) * 20) - 50; // 50 reduced for correction
                    anchorTag.setAttribute('style', 'width: ' + finalWidthToSet + 'px !important;'); // No I18N
                }
            }
        }
    },
    updateAnchorWidthForCloseNode: function(){
        var anchorTags = document.querySelectorAll('.jstree-anchor'); // No I18N
        for (var i = 0; i < anchorTags.length; i++) {
            var anchorTag = anchorTags[i].firstElementChild;
            if (anchorTag) {
                anchorTag.style.width = '100px'; // No I18N
            }
        }
        this.updateAnchorWidth();
    },
    willDestroyElement: function(){
        OPMClient.NCMCompliancePolicyController.selectedPolicyGroupName = 'ALL';//No I18N
        OPMClient.NCMCompliancePolicyController.selectedPolicyId = '-1';
        OPMClient.NCMCompliancePolicyController.selectedRuleGroupId = '-1';
        OPMClient.NCMCompliancePolicyController.selectedRuleId = '-1';
        document.removeEventListener('click', OPMClient.NCMCompliance.pushIconToTree());//No I18N
        document.removeEventListener('mousemove', this.sideBarMenuClose);
        this.treeData = null;
    }
});
OPMClient.NcmPolicyHeaderComponent = Ember.Component.extend({
    classNames:["compliance_header", "heightAuto", "p-none"],//No I18N
    searchDeviceName: null,
    init : function(){
        this._super();
    },
    didInsertElement : function(){
        this._super();
        this.sendAction('action', 'saveHeaderCompInstance', this);
        OPMClient.NCMCompliancePolicyController.headerCompInstance = this;
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
		showBulkRemediation : function (){
			this.sendAction('action', 'showBulkRemediation');
		},
        selectHeaderAction: function(id){
            this.sendAction('action', 'selectHeaderAction', id);
        },
        compStatusFilterAction: function(status){
            var selectedStatus = OPMClient.NCMCompliance.getDeviceCompStatus(status);
            this.sendAction('action', 'compStatusFilterAction', selectedStatus);
        },
        violationSevFilterAction: function(severity){
            var selectedSev = OPMClient.NCMCompliance.getDeviceCompSeverity(severity);
            this.sendAction('action', 'violationSevFilterAction', selectedSev);
        },
		complianceRunningStatusAction: function(runningStatus){
			var allDiv = $('#compRunningStatus_All');
			var runningDiv = $('#compRunningStatus_Running');

			if (runningStatus === 'ALL') { // NO I18N
				allDiv.addClass('selected');
				runningDiv.removeClass('selected');
			} else if (runningStatus === 'RUNNING') { // NO I18N
				runningDiv.addClass('selected');
				allDiv.removeClass('selected');
			}
            this.sendAction('action', 'complianceRunningStatusAction', runningStatus);
        },
        deviceNameSearchAction: function(){
            var searchEMDiv = $('.policies_deviceName_search em');
            if($(searchEMDiv).parent().hasClass('active')){
                $(searchEMDiv).parent().removeClass('active');
                $(searchEMDiv).siblings('input').width(20);
                $(searchEMDiv).siblings('input').prop('readOnly', true);
                $('#deviceNameSearch').val('');
                this.removeSearchListener();
            } else {
                $(searchEMDiv).parent().addClass('active');
                $(searchEMDiv).siblings('input').width(300);
                $(searchEMDiv).siblings('input').prop('readOnly', false);
                this.addSearchListener();
            }
        },
		toggleSearchIconAction: function () {
			this.sendAction('action', 'toggleSearchIconAction');
		}
    },
    onClickCloseSearch: function(event) {
        var searchDiv = document.querySelector('.policies_deviceName_search');//No I18N
        if (searchDiv) {
            if (!searchDiv.contains(event.target)) {
                var searchEMDiv = $('.policies_deviceName_search em');
                if($(searchEMDiv).parent().hasClass('active')){
                    $(searchEMDiv).parent().removeClass('active');
                    $(searchEMDiv).siblings('input').width(20);
                    $(searchEMDiv).siblings('input').prop('readOnly', true);
                    $('#deviceNameSearch').val('');
                    OPMClient.NCMCompliancePolicyController.headerCompInstance.set('searchDeviceName', null); // NO I18N
                    OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                }
            }
        }
    },
    addSearchListener: function(){
        document.addEventListener('click', this.onClickCloseSearch);
        var searchTimeout;
        $('#deviceNameSearch').on('input', function () {
            try {
                clearTimeout(searchTimeout);
            } catch (e) {}
            var searchText = this.value.trim();
            searchTimeout = setTimeout(function(){
                if (searchText.length > 0) {
                    OPMClient.NCMCompliancePolicyController.headerCompInstance.set('searchDeviceName', searchText); // NO I18N
                    OPMClient.NCMCompliancePolicyController.headerCompInstance.set('searchDeviceNameBackup', searchText); // NO I18N
                    OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                } else {
                    OPMClient.NCMCompliancePolicyController.headerCompInstance.set('searchDeviceName', null); // NO I18N
                    OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                }
            }, 1000);
        });
    },
    removeSearchListener: function(){
        document.removeEventListener('click', this.onClickCloseSearch);
        OPMClient.NCMCompliancePolicyController.headerCompInstance.set('searchDeviceName', null); // NO I18N
        OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
    },
    willDestroyElement: function(){
        document.removeEventListener('click', this.onClickCloseSearch);
    }
});
OPMClient.NcmPolicyMetadataComponent = Ember.Component.extend({ classNames:["policies-overview", "heightAuto"] });//NO I18N
OPMClient.NcmPolicyGridComponent = Ember.Component.extend({
    classNames:["opmFormHolder"/*, "overflow-auto"*/, "overflow-auto-fix"],//No I18N
    init : function(){
        this._super();
        this.preRender();
    },
    didInsertElement : function(){
        this._super();
        /*this.element.style.height = "calc(100vh - 300px)";*/
        if (location.href.indexOf('BulkRemediate') == -1) { // No I18N
            this.loadGrid(this.compStatusFilter || 'All', this.violationSevFilter || 'All');//No I18N
        }
        try{
            OPMClient.NCMCompliance.getDeviceCompStatus(this.compStatusFilter);
            OPMClient.NCMCompliance.getDeviceCompSeverity(this.violationSevFilter);
        } catch(e) {}
        this.sendAction('action', 'saveGridCompInstance', this);
        OPMClient.NCMCompliancePolicyController.gridCompInstance = this;
    },
    preRender : function(){
        this.set('tablePager', this.gridDataContent.gridTablePager);//No I18N
        this.set('tableName', this.gridDataContent.gridTableName);//No I18N
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        }
    },
    loadGrid : function(compStatus, violationSev){
        var __self = this;
        setTimeout(function(){
            var gridName = '#' + __self.tableName;
            $(gridName).jqGrid('GridUnload');//No I18N
            var selItem = OPMClient.NCMCompliancePolicyController.selectedItem;
//            var selectNodeIdSplit = OPMClient.NCMCompliancePolicyController.selectedItemId.split('_');
            var colModelUrl;
            var colModelUrlParamStr;
            var defaultOptions = {};
            if (selItem === 'policyGroup' || selItem === 'rule') {
                __self.set('staticGrid', true);//No I18N
                defaultOptions = { multiselect: true, searchOption: true, showSearchIcon: true };
                var gridCallBack = function(){
                    $('#'+__self.tableName+'_colChooserIndex').attr('style', 'display:none !important;');
					if(document.querySelector("#gview_"+__self.tableName+" > div.ui-jqgrid-bdiv > div")){
						document.querySelector("#gview_"+__self.tableName+" > div.ui-jqgrid-bdiv > div").classList.add('policy_group_scroll_fix');//NO I18N
						$('#'+__self.tableName+'_searchIndex').attr('style', 'display:none !important;');
					}
					if(selItem === 'policyGroup') {
					    __self.policyResultMetaInfoHandling();
					    __self.policyGroupGridActionsHandling();
					    __self.policyDisableHandling();
					    __self.titleHandlingForPercentageTd();
					    __self.policyGroupDescriptionHandling();
					}
                }
                defaultOptions.gridCallBack = gridCallBack;
                defaultOptions.fixFooterToBottom = true;
                defaultOptions.removeGridPagerActions = true;
                defaultOptions.selectTreeNodeOnGridClick = function(nodeId) {
                    __self.sendAction('action', 'selectNodeActionWithNodeId', nodeId);
                }
                if (selItem === 'policyGroup') {
                    colModelUrlParamStr = '&POLICY_STANDARD=' + OPMClient.NCMCompliancePolicyController.getPolicyStandard();//No I18N
                } else {
                    colModelUrlParamStr = '&POLICY_ID=' + OPMClient.NCMCompliancePolicyController.getPolicyId() + '&RULE_ID=' + OPMClient.NCMCompliancePolicyController.getRuleId();//No I18N
                }
                populateRemoteGridDuplicateId(__self.tableName, __self.tableName, colModelUrlParamStr, "#"+__self.tablePager, __self.tableName, defaultOptions); //No I18N
            }
            else {
                try {
                    __self.set('staticGrid', false);//No I18N
                } catch(e) {}
                var gridWidth = $('.policies-content .opm_jqGridUI').width();//No I18N
                defaultOptions = { multiselect: false, searchOption: false, showSearchIcon: false, widthOfTable: gridWidth /*shrinkToFit:false, nullColumnIndex:0*/};
                if (selItem === 'policy') {
                    colModelUrl = '/ncmcompliance/getColModelForPolicy';//No I18N
                    colModelUrlParamStr = '?POLICY_ID=' + OPMClient.NCMCompliancePolicyController.getPolicyId();//No I18N
                } else {
                    colModelUrl = '/ncmcompliance/getColModelForRuleGroup';//No I18N
                    colModelUrlParamStr = '?POLICY_ID=' + OPMClient.NCMCompliancePolicyController.getPolicyId() + '&RULE_GROUP_ID=' + OPMClient.NCMCompliancePolicyController.getRGId();//No I18N
                }
                if (compStatus || violationSev) {
                    if (compStatus) {
                        __self.compStatusFilter = compStatus;
                        colModelUrlParamStr += '&COMP_STATUS=' + compStatus;//No I18N
                    }
                    if (violationSev) {
                        __self.violationSevFilter = violationSev;
                        colModelUrlParamStr += '&SEVERITY=' + violationSev;//No I18N
                    }
                } else {
                    if(__self.compStatusFilter) {
                        colModelUrlParamStr += '&COMP_STATUS=' + __self.compStatusFilter;//No I18N
                    }
                    if(__self.violationSevFilter) {
                        colModelUrlParamStr += '&SEVERITY=' + __self.violationSevFilter;//No I18N
                    }
                }
				if(__self.complianceRunningStatus === 'RUNNING'){
					colModelUrlParamStr += '&FILTER_RUNNING=true'; // NO I18N
				}
                if (OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceName) {
                    defaultOptions.additionalParams = '&DEVICE_NAME=' + OPMClient.NCMCompliancePolicyController.headerCompInstance.searchDeviceName; //No I18N
                }
				defaultOptions.gridCallBack = function () {
				    setTimeout(function(){
				        $(" .jqg-first-row-header").css('visibility','collapse');
                        $(gridName).jqGrid('setGridWidth', 1);
                        $(gridName).jqGrid('setGridWidth', gridWidth);
                        if($(gridName).width() < (gridWidth+1)){
                            if(document.querySelector("#gview_"+__self.tableName+" > div.ui-jqgrid-bdiv > div")){
                                document.querySelector("#gview_"+__self.tableName+" > div.ui-jqgrid-bdiv > div").classList.add('policy_group_scroll_fix');//No I18N
                            }
                        }

//                        var columnsToUpdate = $('.frozen-div thead .jqg-second-row-header th');
//                        if(columnsToUpdate){
//                            for(var i = 0; i < columnsToUpdate.length; i++){
//                                columnsToUpdate[i].style.top = '-20px';
//                                columnsToUpdate[i].style.position = 'relative';
//                            }
//                        }
//                        $(gridName).jqGrid('setFrozenColumns');
				     },10);
				     __self.policyResultMetaInfoHandling();
				     __self.headerWrapHandling();
				     __self.titleHandlingForPercentageTd();
				};
				defaultOptions.fixFooterToBottom = true;
				defaultOptions.removeGridPagerActions = true;
//				defaultOptions.lazyLoading = true;
//				defaultOptions.lazyLoadingParams = { pageNo : 1, recordsPerPage : 10 };
//				defaultOptions.minRowsPerPage = 25;
				defaultOptions.gridview = true;
				defaultOptions.rowList = [10,25,50,100,500,1000];
//				defaultOptions.grouping  = false;
				defaultOptions.setWidth  = false;
				defaultOptions.shrinkToFit  = false;
				defaultOptions.gridviewVal  = true;
                populateNcmDynamicGrid(__self.tableName, __self.tableName, colModelUrlParamStr.replace('?','&'), "#"+__self.tablePager, __self.tableName, defaultOptions, colModelUrl, colModelUrlParamStr); //No I18N
//                setTimeout(function(){
//                    $(gridName).jqGrid('setFrozenColumns');
//                }, 1000);
//                $(gridName).jqGrid("setFrozenColumns");
//                $(gridName).trigger('reloadGrid');
            }
        },100);
    },
	toggleSearchIcon: function() {
		var gridTable = '#gview_' + this.tableName; // No I18N
		var isVisible = $(gridTable+" .ui-search-toolbar").is(':visible');
		ncmToggleSearch(!isVisible, gridTable);
	},
    // Policy meta info related positioning changes
    policyResultMetaInfoHandling: function() {
        var __self = this;
        var colNo = __self.tableName == 'NcmCompliancePolicyGroupResult' ? 6 : 2;// NO I18N
        $("#"+__self.tableName).find("tr.jqgrow").each(function () {
            var hoveredCell = $(this).children("td").eq(colNo);
            hoveredCell.hover(
                function () {

                    $(this).on('click', function(e){
                        $("#policyGroupResultMetaInfo")[0].classList.remove('active');//No I18N
                    });

                    var trParent = hoveredCell.closest("tr");//No I18N
                    var rowId = trParent[0].getAttribute('id');
                    var rowData = $('#'+__self.tableName).jqGrid('getRowData', rowId);
                    var result = __self.tableName == 'NcmCompliancePolicyGroupResult' ? rowData.Result : rowData['Total Rule Result']; // NO I18N
                    var percentageVals = (result.match(/(\d+)%/g) || []).slice(0, 4).map(function(s){return s.replace('%', '')});
                    __self.updateCompliancePercentageData(rowId, percentageVals);
                    var clientRect = this.getBoundingClientRect();
                    var prevTdClientRect = $(this).prev('td')[0].getBoundingClientRect();

                    var mainMenuContainer = $("#policyGroupResultMetaInfo");
                    if(mainMenuContainer.length > 0 && result.includes('multistep_progress_bar_with_legends')) {
                        var mainMenuContainerDiv = mainMenuContainer[0];
                        if(!mainMenuContainerDiv.classList.contains('active')) {
                            mainMenuContainerDiv.classList.add('active');//No I18N
                            mainMenuContainerDiv.style.position = 'fixed';//No I18N
                            if (__self.tableName == 'NcmCompliancePolicyGroupResult') {
                                mainMenuContainerDiv.style.left = Math.ceil(clientRect.left) + 15 + 'px';//No I18N
                            } else {
                                mainMenuContainerDiv.style.left = Math.ceil(prevTdClientRect.right) + 15 + 'px';//No I18N
                            }
                            var availHeight = Math.ceil(window.innerHeight - Math.ceil(clientRect.bottom))-28;
                            var containerHeight = Math.ceil(mainMenuContainer.children('div')[0].getBoundingClientRect().height);
                            if (availHeight > containerHeight) {
                                mainMenuContainerDiv.style.top = Math.ceil(clientRect.bottom) + 'px';//No I18N
                            } else {
                                mainMenuContainerDiv.style.top = Math.ceil(clientRect.top) - containerHeight + 'px';//No I18N
                            }
                        }
                    }
                },
                function () {
                    var mainMenuContainer = $("#policyGroupResultMetaInfo");
                    if(mainMenuContainer.length > 0) {
                        var mainMenuContainerDiv = mainMenuContainer[0];
                        if(mainMenuContainerDiv.classList.contains('active')) {
                            mainMenuContainerDiv.classList.remove('active');//No I18N
                            mainMenuContainerDiv.style.position = 'unset';// No I18N
                            mainMenuContainerDiv.style.left = 'unset';// No I18N
                            mainMenuContainerDiv.style.top = 'unset';// No I18N
                        }
                    }
                }
            );
        });
    },
    // Policy action Hover related changes
    policyGroupGridActionsHandling: function() {
        var __self = this;
        $("#"+__self.tableName).find("tr.jqgrow").each(function () {
            var hoveredCell = $(this).children("td").eq(8).find('#actionMenuLi');
            hoveredCell.hover(
                function () {
                    try {
                        OPMClient.NCMComplianceUtilController.set('showMoreActionMenuForGrid', true); // NO I18N
                        var trParent = hoveredCell.closest("tr"); //No I18N
                        var rowId = trParent[0].getAttribute('id');
                        var rowData = $('#'+__self.tableName).jqGrid('getRowData', rowId);
                        __self.updatePolicyGroupGridActions(rowData.id, rowData.COMPPOLICY_NAME, rowData.isDisabled, rowData.POLICY_STANDARD, rowData.isRestricted);
                        var clientRect = $(this).closest('td')[0].getBoundingClientRect();

                        var position = hoveredCell.length ? hoveredCell[0].getBoundingClientRect() : null;

                        var mainMenuContainer = $("#policyGroupGridActions");
                        mainMenuContainer.css('display', 'block'); // NO I18N

                        setTimeout(function() {
                            var containerDiv = mainMenuContainer.children('div')[0];
                            var containerClientRect = containerDiv.getBoundingClientRect();
                            var availHeight = Math.ceil(window.innerHeight - Math.ceil(clientRect.bottom)) - 40;
                            var containerHeight = Math.ceil(containerClientRect.height);
                            if (availHeight > containerHeight) {
                                mainMenuContainer.css('top', position.top - 4 + 'px'); // NO I18N
                            } else {
                                mainMenuContainer.css('top', position.top - containerClientRect.height + position.height + 8  + 'px'); // NO I18N
                            }
                            mainMenuContainer.css('position', 'fixed'); // NO I18N
                            mainMenuContainer.css('left', Math.ceil(position.left) - Math.ceil(containerClientRect.width) + 'px'); // NO I18N
                        },1);
                    } catch (e) {}
                },
                function () {
                    OPMClient.NCMComplianceUtilController.set('showMoreActionMenuForGrid', false); // NO I18N
                }
            );
        });
    },
    // Policy disable handling in policyGroup grid
    policyDisableHandling: function(){
        $("#"+this.tableName).find("tr.jqgrow").each(function () {
            var tdElements = $(this).children("td");
            var rowData = $('#NcmCompliancePolicyGroupResult').jqGrid('getRowData', $(this)[0].getAttribute('id'));
            if (rowData.isDisabled === 'true') {
                for (var i = 0; i < tdElements.length; i++) {
                    if (i !== 8 && i !== 0){ // Checkbox and Action column exclusion
                        var tdElement = $(tdElements[i]);
                        tdElement[0].classList = ['disabledBlock'];
                    }
                }
            }
        });
    },
    // Policy grids header name wrap related changes
    headerWrapHandling: function(){
        var $grid = $('#'+this.tableName);
        var $headers = $grid.closest(".ui-jqgrid").find(".ui-jqgrid-htable th > div");// NO I18N
        $headers.each(function(){
            var div = this;
            for (var i = 0; i < div.childNodes.length; i++) {
                var node = div.childNodes[i];
                if (node.nodeName === '#text' && node.nodeValue.trim() !== "") {
                    var text = node.nodeValue;
                    var wrapperDiv = document.createElement("div");
                    wrapperDiv.className = "ncm-policy-grid-header-restrict";
                    wrapperDiv.textContent = text;
                    wrapperDiv.setAttribute("title", text);
                    div.insertBefore(wrapperDiv, node);
                    div.removeChild(node);
                    break;
                }
            }
        });
    },
    ruleResultUpdaterHandling: function(divId, compResult, isManualReviewRequired, onClickUpdateRuleStatus) {
        var statusMap = {
            'COMPLIANT': { icon: '/apiclient/fluidicv2/img/sprite-opm.svg#compliant-duo', svgClass: 'svgIcon size20 status_compliant', key: 'ncm.complianceiq.mark.as.compliant', label: 'COMPLIANT' }, // No I18N
            'VIOLATION': { icon: '/apiclient/fluidicv2/img/sprite-opm.svg#violation-duo', svgClass: 'svgIcon size20 status_violation', key: 'ncm.complianceiq.mark.as.violation', label: 'VIOLATION' }, // No I18N
            'NOT_APPLICABLE': { icon: '/apiclient/fluidicv2/img/sprite-opm.svg#not-applicable-duo-new', svgClass: 'svgIcon size20 status_not_applicable', key: 'ncm.complianceiq.mark.as.notApplicable', label: 'NOT_APPLICABLE' }, // No I18N
            'APPLICABLE': { icon: '/apiclient/fluidicv2/img/sprite-opm.svg#check-circle-duotone', svgClass: 'svgIcon size20 status_applicable', key: 'ncm.complianceiq.mark.as.applicable', label: 'APPLICABLE' } // No I18N
        };

        var dropdownOptions = [];
        if(!['NOT_APPLICABLE', 'APPLICABLE'].includes(compResult)) {
            if(isManualReviewRequired){
                var listedStatuses = ['COMPLIANT', 'VIOLATION', 'NOT_APPLICABLE']; // No I18N
                for (var i = 0; i < listedStatuses.length; i++) {
                    var status = statusMap[listedStatuses[i]];
                    if(listedStatuses[i] !== compResult){
                        dropdownOptions.push({
                            value: listedStatuses[i],
                            title: Ember.I18n.t(status.key, this),
                            svgClass: status.svgClass,
                            icon: status.icon,
                            label: status.label
                        });
                    }
                }
            } else {
                var status = statusMap.NOT_APPLICABLE;
                dropdownOptions.push({
                    value: 'NOT_APPLICABLE', // No I18N
                    title: Ember.I18n.t(status.key, this),
                    svgClass: status.svgClass,
                    icon: status.icon,
                    label: status.label
                });
            }
        } else if (compResult === 'NOT_APPLICABLE') { // No I18N
            var status = statusMap.APPLICABLE;
            dropdownOptions.push({
                value: 'APPLICABLE', // No I18N
                title: Ember.I18n.t(status.key, this),
                svgClass: status.svgClass,
                icon: status.icon,
                label: status.label
            });
        }

        if (dropdownOptions.length === 0) {
            OPMClient.NCMCompliancePolicyController.set('ruleResultUpdaterParams', null);//No I18N
        } else {
            var ruleResultUpdaterParams = {};
            ruleResultUpdaterParams.divId = divId;
            ruleResultUpdaterParams.onClickStatusDropdown = 'OPMClient.NCMCompliance.closeOpenRuleStatus()';//No I18N
            ruleResultUpdaterParams.onClickUpdateRuleStatus = onClickUpdateRuleStatus;
            ruleResultUpdaterParams.dropdownOptions = dropdownOptions;
            OPMClient.NCMCompliancePolicyController.set('ruleResultUpdaterParams', ruleResultUpdaterParams);//No I18N
        }
    },
    titleHandlingForPercentageTd: function(){
        var divs = document.querySelectorAll('div[id^="compCheckResult_"]');// No I18N
        for (var i = 0; i < divs.length; i++) {
            var div = divs[i];
            var td = div.parentElement;
            if (td && td.tagName.toLowerCase() === 'td') {
                td.setAttribute('title', '');
            }
        }
    },
    // Description handling - 2 lines + ellipsis
    policyGroupDescriptionHandling: function(){
        document.querySelectorAll('td[aria-describedby="NcmCompliancePolicyGroupResult_DESCRIPTION"]').forEach(function(td) {
            var text = td.textContent.trim();
            td.textContent = '';
            var div = document.createElement('div');
            div.className = 'truncate_two_lines';
            div.textContent = text;
            td.appendChild(div); // Appending the description that is already present into a div for CSS fixing
        });
    },
    updateCompliancePercentageData: function(rowId, percentageVals){
        if(percentageVals) {
            OPMClient.NCMCompliancePolicyController.set('policyResultMetaInfo', {}); // No I18N
            var tempMap = {};
            tempMap.id = 'compCheckResultMenuContainer_' + rowId;
            tempMap.compliantPercent = percentageVals[0];
            tempMap.violationPercent = percentageVals[1];
            tempMap.notRequiredPercent = percentageVals[2];
            tempMap.attentionPercent = percentageVals[3];
            OPMClient.NCMCompliancePolicyController.set('policyResultMetaInfo', tempMap);//No I18N
        }
    },
    updatePolicyGroupGridActions: function(id, policyName, isDisabled, policyStandard, isRestricted){
        OPMClient.NCMCompliancePolicyController.set('policyGroupGridActionList', []);//No I18N
        var tempList = [];
        if(!ncmIsCentral() && window.OPM.userPermissions.ncmComplianceWrite){
            tempList.push({ 'text' : Ember.I18n.t('ncm.complianceiq.check.adhoc.title', this), 'icon' : '/apiclient/fluidicv2/img/sprite-opm.svg#run-adhoc', 'onclickFunc' : 'OPMClient.NCMCompliancePolicyController.runAdhocCheck(' + id + ')'});//No I18N
            tempList.push({ 'text' : Ember.I18n.t('ncm.complianceiq.check.offline', this), 'icon' : '/apiclient/fluidicv2/img/sprite-opm.svg#file-offline', 'onclickFunc' : 'OPMClient.NCMCompliancePolicyController.runOfflineCheck(' + id + ')'});//No I18N
        }
        if(window.OPM.userPermissions.ncmComplianceWrite) {
            if (!isRestricted || isRestricted !== 'true') {
                tempList.push({ 'text' : Ember.I18n.t('ncm.complianceiq.policy.clone', this), 'icon' : '/apiclient/fluidicv2/img/sprite-opm.svg#clone-copy', 'onclickFunc' : 'OPMClient.NCMCompliancePolicyController.clonePolicies(' + id + ',"' + policyName + '")'});//No I18N
            }
            if (policyStandard === 'CUSTOM') {
                tempList.push({ 'text' : Ember.I18n.t('webclient.action.delete', this), 'icon' : '/apiclient/fluidicv2/img/sprite-opm.svg#Trash', 'onclickFunc' : 'OPMClient.NCMCompliancePolicyController.deletePolicy(' + id + ')'});//No I18N
            }
            tempList.push({ 'text' : Ember.I18n.t('jsp.commonstr.Disable', this), 'icon' : '/apiclient/fluidicv2/img/sprite-opm.svg#disabled', 'onclickFunc' : 'OPMClient.NCMCompliancePolicyController.enableDisablePolicy(' + id + ',' + isDisabled + ')'});//No I18N
            tempList.push({ 'text': Ember.I18n.t("jsp.commonstr.Export", this), 'icon':'/apiclient/fluidicv2/img/sprite-opm.svg#Export-01', 'onclickFunc':'OPMClient.NCMCompliancePolicyController.exportPolicy('+ id +')'});//No I18N
        }
        OPMClient.NCMCompliancePolicyController.set('policyGroupGridActionList', tempList);//No I18N
    },
    refreshGrid: function(){
		if (OPMClient.NcmCompliancePolicyComponent.complianceCheckComplete) {
			OPMClient.NcmCompliancePolicyComponent.complianceCheckComplete = false;
			this.complianceRunningStatus = false;
		}
        $('#' + this.tableName).jqGrid('GridUnload');//No I18N
        this.loadGrid(this.compStatusFilter, this.violationSevFilter);
    },
    willDestroyElement : function(){
        this.compStatusFilter = null;
        this.violationSevFilter = null;
        this.complianceRunningStatus = null;
    }
});
OPMClient.NcmPolicyDeviceAssociateComponent = Ember.Component.extend({
    showDgNote : false,
    selectedTab : {
        DEVICES : true
    },
    init : function(){
        this._super();
        this.preRender();
        if (window.OPM.isValidEEInstallation) {
            if (ncmIsProbeOrProbeSelected()) {
                this.showDgNote = true;
            } else if (ncmIsCentral() && window.OPM.isMSPCentral) {
                if (!(sessionStorage.getItem("selectedCustomerID") === "-1" && sessionStorage.getItem("selectedRegionID") === "-1")) {
                    this.showDgNote = true;
                }
            }
        }
    },
    preRender : function(){
        if(this.criteriaAssociationDetails){
            if(this.criteriaAssociationDetails.criteriaExpression){
                this.set('criteriaExpression', this.criteriaAssociationDetails.criteriaExpression);//No I18N
            }
            if(this.criteriaAssociationDetails.criteriaList){
                this.set('criteriaList', this.criteriaAssociationDetails.criteriaList);//No I18N
            }
        }
        this.updateTabSelection(this.getToSelectTab());
    },
    didInsertElement : function(){
        this._super();
	    this.sendAction('action', this.instanceActionName, this);
	    this.activeTabChange(Object.keys(this.selectedTab)[0]);
    },
    saveData : function(validate){
        var result = {};
        if(this.rulePlatformInstance){
            this.updateTabSelection('CUSTOM_CRITERIA');//NO I18N
            try{
                var __self = this;
                var criteriaData = __self.rulePlatformInstance.saveData(validate);
                result.criteriaExpression = criteriaData.criteriaExpression;
                result.criteriaList = criteriaData.criteriaList;
            }
            catch(e){
                throw e;
            }
        }
        return result;
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        changeAssociationType : function(tabType){
            this.updateTabSelection(tabType);
        },
        rulePlatformInstance : function(child){
            //console.log('rulePlatformInstance child', child);
            this.set('rulePlatformInstance', child); // NO I18N
        }
    },
    getToSelectTab : function(){
        var toSelectTab = 'DEVICES'; //NO I18N
        if (this.selectedDeviceIds && this.selectedDeviceIds.length > 0) {
            toSelectTab = 'DEVICES'; //NO I18N
        } else if (this.selectedDeviceGroupIds && this.selectedDeviceGroupIds.length > 0) {
            toSelectTab = 'DEVICE_GROUPS'; //NO I18N
        } else if (this.criteriaAssociationDetails && this.criteriaAssociationDetails.criteriaExpression && this.criteriaAssociationDetails.criteriaList && this.criteriaAssociationDetails.criteriaList.length > 0) {
            toSelectTab = 'CUSTOM_CRITERIA'; //NO I18N
        }
        return toSelectTab;
    },
    updateTabSelection : function(tabType){
        var tempSelectedTab = {};
        tempSelectedTab[tabType] = true;
        this.set('selectedTab', tempSelectedTab); // NO I18N
        if(tabType == 'DEVICES'){
            this.set('selectBoxLeftLabel', Ember.I18n.t("webclient.general.availabledevices", this)); // No I18N
            this.set('selectBoxRightLabel', Ember.I18n.t("webclient.general.selecteddevices", this)); // No I18N
        }
        else if(tabType == 'DEVICE_GROUPS'){
            this.set('selectBoxLeftLabel', Ember.I18n.t("jsp.commonstr.deviceGsnotselected", this)); // No I18N
            this.set('selectBoxRightLabel', Ember.I18n.t("jsp.commonstr.deviceGsselected", this)); // No I18N
        }
        this.activeTabChange(tabType);
    },
    activeTabChange : function(tabType){
        $('.deviceSection').hide();
        $('.deviceGroupSection').hide();
        $('.dynamicCriteriaSection').hide();
        if(tabType == 'DEVICES'){
            $('.deviceSection').show();
        }
        else if(tabType == 'DEVICE_GROUPS'){
            $('.deviceGroupSection').show();
        }
        else if(tabType == 'CUSTOM_CRITERIA'){
            $('.dynamicCriteriaSection').show();
        }
    },
    willDestroyElement : function(){
    }
});
OPMClient.NcmPolicyAddEditComponent = Ember.Component.extend({
//    classNames:["opmFormHolder", "overflow-auto"],//No I18N


    availableRuleList : [],
    selectedRuleList : [],
    selectedRuleIds : [],

    availableRuleGroupList : [],
    selectedRuleGroupList : [],
    selectedRuleGroupIds : [],

    availableDeviceList : [],
    selectedDeviceList : [],
    selectedDeviceIds : [],

    availableDeviceGroupList : [],
    selectedDeviceGroupList : [],
    selectedDeviceGroupIds : [],

    autoRemediateAvailableDeviceList : [],
    autoRemediateSelectedDeviceList : [],
    autoRemediateSelectedDeviceIds : [],

    autoRemediateAvailableDeviceGroupList : [],
    autoRemediateSelectedDeviceGroupList : [],
    autoRemediateSelectedDeviceGroupIds : [],

    /*deviceCriteriaBackup: {'deviceCriList' : [], 'deviceCriExpression' : ''}, // No I18N
    deviceCriList : [],
    deviceCriExpression : '',

    autoRemCriteriaBackup: {'autoRemCriList' : [], 'autoRemCriExpression' : ''}, // No I18N
    autoRemCriList: [],
    autoRemCriExpression: '',*/

    allowedDeviceIds: [],
    allowedDeviceGroupIds: [],

    selectedTab : {},
    filterType : 'device',// No I18N
    enableAutoRemediationCriteria : false,
    showSaveButton: true,
    disableRuleAssociation: false,

    noteMsgInPolicyDetails : Ember.I18n.t('ncm.complianceiq.standard.policyRG.edit.not.allowed.msg', this), // NO I18N
    noteMsgForRuleGroupDisable : Ember.I18n.t('ncm.complianceiq.standard.policyRG.edit.not.allowed.msg', this), // NO I18N
	noteMsgPolicyDistributionProbe : Ember.I18n.t('ncm.complianceiq.ee.dist.distribute_to_all.msg', this), // NO I18N
	noteMsgMarkAsPublic: Ember.I18n.t('ncm.complianceiq.mark_as_public.policy.msg', this), // NO I18N

    init : function(){
        this._super();
        this.preRender();
        this.loadUiData();
        this.updateNoteMsg();
		this.updateMarkAsPublic();
    },
    didInsertElement : function(){
        this._super();
        this.element.querySelector(".opmFormHolder").style.height = "calc(100vh - 235px)"; // No I18N
        this.updateRuleAssociationBtn();
		this.disableMarkAsPublicMsg();
//        ncmMaxScreen(true);
    },
    preRender : function(){
        this.setDefaultData();
    },
    updateRuleAssociationBtn : function(){
        if(this.disableRuleAssociation){
            setTimeout(function(){
                document.querySelectorAll('.opmFormRow.nonEditableField').forEach(function(el) { // NO I18N
                  el.classList.add('disabledBlock'); // NO I18N
                });
                document.querySelectorAll('.ruleAssociation .moveRightBtn, .ruleAssociation .moveLeftBtn').forEach(function(el) { // NO I18N
                  el.classList.add('disabledBlock'); // NO I18N
                });
                var input = document.querySelector('input[name="distributeToAll"]'); // NO I18N
                if (input) {
                    $('input[name="distributeToAll"]').prop('checked', true);
                    var parentDiv = input.closest('div.opmFormRow'); // NO I18N
                    if (parentDiv) {
                        parentDiv.classList.add('disabledBlock'); // NO I18N
                    }
                }
            }, 10);
        }
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        deviceAssociationInstance: function(child) {
            this.set('deviceAssociationInstance', child); // NO I18N
        },
        autoRemDeviceAssociationInstance: function(child) {
            this.set('autoRemDeviceAssociationInstance', child); // NO I18N
        },
        /*rulePlatformInstance: function(instance){
            if(instance){
                if(this.associatePage) {
                    if (!this.customCriteriaInstance) {
                        this.set('customCriteriaInstance', instance);// No I18N
                    } else {
                        this.set('deviceCriExpression', this.deviceCriteriaBackup.deviceCriExpression);//No I18N
                        this.set('deviceCriList', this.deviceCriteriaBackup.deviceCriList);//No I18N
                    }
                }
                if(this.savePage) {
                    if (!this.autoRemCustomCriteriaInstance) {
                        this.set('autoRemCustomCriteriaInstance', instance);// No I18N
                    } else {
                        this.set('autoRemCriExpression', this.autoRemCriteriaBackup.autoRemCriExpression);//No I18N
                        this.set('autoRemCriList', this.autoRemCriteriaBackup.autoRemCriList);//No I18N
                    }
                }
            }
        },*/
        cancel: function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            if (this.addEditPolicy) {
                if(OPMClient.NCMCompliancePolicyController.isDeviceAssociation) {
                    OPMClient.NCMCompliancePolicyController.isDeviceAssociation = false;
                }
                if(OPMClient.NCMCompliancePolicyController.policyEditFromPage === "DASHBOARD"){
                    OPMClient.NCMCompliancePolicyController.policyEditFromPage = "POLICY";//No I18N
                }
                window.history.back();
            }
            else if (this.addEditRuleGroup) {
                if (OPMClient.NCMCompliancePolicyController.ruleGroupEditFromPage === "DASHBOARD") {
                    OPMClient.NCMCompliancePolicyController.ruleGroupEditFromPage = "RULE_GROUP";//No I18N
                    window.history.back();
                } else if (location.href.indexOf("Policies") > -1) {
                    location.href = OPMClient.NCMComplianceListController.baseUrl+"/Policies"; // NO I18N
                } else {
                    location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListGroups/All"; // NO I18N
                }
            }
        },
        next: function(){
            try{
                if(OPMClient.NCMCompliancePolicyController.isDeviceAssociation) {
                    OPMClient.NCMCompliancePolicyController.isDeviceAssociation = false;
                }
                if(this.associatePage && this.deviceAssociationInstance){
                    this.set('criteriaAssociationDetails', this.deviceAssociationInstance.saveData(true)); // NO I18N
                }
                this.saveEditedData();
                if (this.validateSelectedData()) {
                    if (this.addEditPolicy) {
                        this.set('associatePage', !this.associatePage);//No I18N
                        this.set('savePage', !this.associatePage);//No I18N
                        if (this.associatePage || this.savePage) {
                            this.set('firstPage', false);//No I18N
                            if (this.savePage) {
                                this.set('secondPage', false);//No I18N
                                this.set('thirdPage', true);//No I18N
                                this.updateAllowedDeviceDeviceGroupList();
                                this.setDataForAutoRemSelection();
								this.updateDistributionMsg();
                                if(this.selectedAction === 'edit'){
                                    if(this.isStandard){
                                        if(this.policyEditBackupInstance){
                                            if(this.checkIfStandardPolicyEdited(this.policyEditBackupInstance)){
                                                this.set('showSaveButton', false);//No I18N
                                            }
                                        }
                                    } else {
                                        this.set('showSaveButton', true);//No I18N
                                    }
                                }
                            }
                            else {
                                this.set('secondPage', true);//No I18N
                            }
                        }
                    }
                    else {
                        this.set('savePage', true);//No I18N
                    }
                    this.loadUiData();
                }
            }
            catch(e){}
        },
        back: function(){
            if(OPMClient.NCMCompliancePolicyController.isDeviceAssociation) {
                OPMClient.NCMCompliancePolicyController.isDeviceAssociation = false;
            }
            if(this.deviceAssociationInstance && this.associatePage){
                this.set('criteriaAssociationDetails', this.deviceAssociationInstance.saveData(false)); // NO I18N
            }
            if (this.autoRemDeviceAssociationInstance && this.savePage) {
                this.set('autoRemCriteriaAssociationDetails', this.autoRemDeviceAssociationInstance.saveData(false)); // NO I18N
            }
            this.saveEditedData();
            if (this.addEditPolicy) {
                if (this.associatePage) {
                    this.set('savePage', false);//No I18N
                    this.set('associatePage', false);//No I18N
                }
                else if (this.savePage) {
                    this.set('associatePage', true);//No I18N
                    this.set('savePage', false);//No I18N
                    this.set('showSaveButton', true);//No I18N
                }
                this.set('thirdPage', false);//No I18N
                if (!this.savePage && !this.associatePage) {
                    this.set('secondPage', false);//No I18N
                    this.set('firstPage', true);//No I18N
					this.disableMarkAsPublicMsg();
                }
                else if (!this.savePage) {
                    this.set('firstPage', false);//No I18N
                    this.set('secondPage', true);//No I18N
                }
            }
            this.loadUiData();
        },
        save: function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            if(OPMClient.NCMCompliancePolicyController.isDeviceAssociation) {
                OPMClient.NCMCompliancePolicyController.isDeviceAssociation = false;
            }
            if (!this.validateSelectedData()) {
                return;
            }
            if (this.addEditPolicy) {
                this.saveEditedData();
                var data = {};
                if(!this.policyName) {
                    OPMClient.NCMComplianceUtilController.loadMsgAndClear("errorMsg", Ember.I18n.t("js.commonstr.validPolicyNameAlert",this)); //No I18N
                    return;
                }
                data.POLICY_NAME = this.policyName;
                if(this.selItemId !== "New") {
                    data.POLICY_ID = this.selItemId;
                }
                if(this.policyDescription && this.policyDescription !== '[NA]'){
                    data.POLICY_DESCRIPTION = this.policyDescription;
                }
                data.CONFIG_TYPE = this.configType;
                data.COMP_CRITERIA = this.violationCriteria;
                if(this.selectedRuleGroupIds.length <= 0 && this.selectedRuleIds.length <= 0) {
                    OPMClient.NCMComplianceUtilController.loadMsgAndClear("errorMsg", Ember.I18n.t("ncm.complianceiq.select.one.rg.or.rule",this)); //No I18N
                    return;
                }
                data.ASSIGNED_RG_IDS = JSON.stringify(this.selectedRuleGroupIds);
                data.ASSIGNED_RULE_IDS = JSON.stringify(this.selectedRuleIds);
                data.RUN_COMP_CHECK_STATUS = this.runComplianceCheck;
                if (this.selectedDeviceIds && this.selectedDeviceIds.length > 0) {
                    data.ASSIGNED_DEVICE_IDS = JSON.stringify(this.selectedDeviceIds);
                }
                if (this.selectedDeviceGroupIds && this.selectedDeviceGroupIds.length > 0) {
                    data.ASSIGNED_DG_IDS = JSON.stringify(this.selectedDeviceGroupIds);
                }
                try {
                    if(this.deviceAssociationInstance){
                        var criteriaData = this.deviceAssociationInstance.criteriaAssociationDetails;
                        if (criteriaData && criteriaData.criteriaList && criteriaData.criteriaList.length > 0 && criteriaData.criteriaExpression) {
                            data.CRITERIA_EXPRESSION = criteriaData.criteriaExpression;
                            data.CRITERIA_LIST = JSON.stringify(criteriaData.criteriaList);
                        }
                    }
                } catch(e) {}
                if(this.distributeToAll){
                    data.distributeToAll = this.distributeToAll;
                }
				if (this.isPublic) {
                    data.markAsPublic = true;
                }
                data.AUTO_REM_ENABLED = this.enableAutoRemediationCriteria;
                if (this.enableAutoRemediationCriteria) {
                    if (this.autoRemediateSelectedDeviceIds && this.autoRemediateSelectedDeviceIds.length > 0) {
                        data.AUTO_REM_ASSIGNED_DEVICE_IDS = JSON.stringify(this.autoRemediateSelectedDeviceIds);
                    }
                    if (this.autoRemediateSelectedDeviceGroupIds && this.autoRemediateSelectedDeviceGroupIds.length > 0) {
                        data.AUTO_REM_ASSIGNED_DG_IDS = JSON.stringify(this.autoRemediateSelectedDeviceGroupIds);
                    }
                    try {
                        if(this.autoRemCriteriaAssociationDetails){
                            var criteriaData = this.autoRemCriteriaAssociationDetails;
                            if (criteriaData && criteriaData.criteriaList && criteriaData.criteriaList.length > 0 && criteriaData.criteriaExpression) {
                                data.AUTO_REM_CRITERIA_EXPRESSION = criteriaData.criteriaExpression;
                                data.AUTO_REM_CRITERIA_LIST = JSON.stringify(criteriaData.criteriaList);
                            }
                        }
                    } catch(e) {}
                }
                this.savePolicy(data);
            }
            else if (this.addEditRuleGroup) {
                this.saveEditedData();
                var data = {};
                data.RULEGROUP_NAME = this.ruleGroupName;
                if(this.selItemId !== "New"){
                    data.COMPRULEGROUP_ID = this.selItemId;
                }
                if(this.ruleGroupDescription && this.ruleGroupDescription !== '[NA]'){
                    data.RULEGROUP_DESCR = this.ruleGroupDescription;
                }
                if(this.selectedRuleGroupIds.length <= 0 && this.selectedRuleIds.length <= 0) {
                    OPMClient.NCMComplianceUtilController.loadMsgAndClear("errorMsg",Ember.I18n.t("ncm.complianceiq.select.one.rg.or.rule",this));  //No I18N
                    return;
                }
				if (this.isPublic) {
					data.markAsPublic = true;
				}
                data.ASSOC_RULEGROUP_ID = JSON.stringify(this.selectedRuleGroupIds);
                data.COMPRULE_ID = JSON.stringify(this.selectedRuleIds);
                this.saveRuleGroup(data);
            }
        },
        changeAssociationType: function(associationType){
            this.updateTabSelection(associationType);
        },
        updateEnableAutoRemediationCriteria: function(){
            this.set('enableAutoRemediationCriteria', !this.enableAutoRemediationCriteria);//No I18N
            var __self = this;
            setTimeout(function(){
                $('input[name=enableAutoRemediationCriteria]').prop('checked',__self.enableAutoRemediationCriteria);
            },10);
        },
        distributeToAll: function(){
            this.set('distributeToAll', !this.distributeToAll);//NO I18N
            var __self = this;
            setTimeout(function(){
                $('input[name=distributeToAll]').prop('checked',__self.distributeToAll);
            },10);
        },
		markAsPublic: function () {
			this.set('isPublic', !this.isPublic);//NO I18N
			var __self = this;
			setTimeout(function () {
				$('input[name=markAsPublic]').prop('checked', __self.isPublic);
			}, 10);
		}
    },
    updateNoteMsg: function(){
        if(this.isStandard || (ncmIsProbeOrProbeSelected() && this.isDistributed)){
            this.set('disableRuleAssociation', true);//NO I18N
            this.set('showRestrictedNoteMsg', true);//NO I18N
        }
        if(ncmIsProbeOrProbeSelected() && !this.isStandard && this.isDistributed){
            this.set('showRestrictedNoteMsg', true);//NO I18N
			if (this.selectedItem === 'Policy') {
				this.noteMsgInPolicyDetails = Ember.I18n.t('ncm.complianceiq.ee.dist.edit.policy.not_allowed.msg'); // NO I18N
			} else if (this.selectedItem === 'RuleGroup') {//No I18N
				this.noteMsgForRuleGroupDisable = Ember.I18n.t('ncm.complianceiq.ee.dist.edit.rule_group.not_allowed.msg', this); // NO I18N
			}
        }
    },
	updateMarkAsPublic: function () {
		if (!this.isStandard) {
			this.set('showMarkAsPublicCheckbox', true);//No I18N
			var probeDistributed = ncmIsProbeOrProbeSelected() && this.isDistributed;
			if (this.addEditPolicy) {
				if (probeDistributed) {
					this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.policyDistributed.msg', this)); // NO I18N
				} else {
					this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.policy.msg', this)); // NO I18N
				}
			} else {
				if (probeDistributed) {
					this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.ruleGroupDistributed.msg', this)); // NO I18N
				} else {
					this.set('noteMsgMarkAsPublic', Ember.I18n.t('ncm.complianceiq.mark_as_public.ruleGroup.msg', this)); // NO I18N
				}
			}
		} else {
			this.set('showMarkAsPublicCheckbox', false);//No I18N
		}
	},
	disableMarkAsPublicMsg: function() {
		if ((!this.isStandard && ncmIsProbeOrProbeSelected() && this.isDistributed) || (this.isPublic && this.selectedAction === 'edit')) {
			waitForElement("#markAsPublic", function () {//No I18N
				var checkBoxDiv = document.querySelector('input[name="markAsPublic"]'); // NO I18N
				if (checkBoxDiv) {
					var parentDiv = checkBoxDiv.closest('div.opmFormRow'); // NO I18N
					if (parentDiv) {
						parentDiv.classList.add('disabledBlock'); // NO I18N
					}
				}
			});
		}
	},
    saveRuleGroup: function(data){
        var response = ncmReplaceParamsAndMakeApi("/v2/ncmcompliance/addRuleGroup",data); //NO I18N
        var	cls = "errorMsg"; //No I18N
        var msg = response.statusMsg;
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            $('#ComplianceAllRuleGroupsV2List').trigger('reloadGrid');
        } else {
            if (response.error && response.error.message) {
                msg = response.error.message;
            }
        }
        window.history.back();
        OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,msg);
    },
    savePolicy: function(data){
        var response = ncmReplaceParamsAndMakeApi("/v2/ncmcompliance/addCompPolicy",data); //NO I18N
        var	cls = "errorMsg"; //No I18N
        var msg = response.statusMsg;
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            /*OPMClient.NCMCompliance.refreshPolicyTree(OPMClient.NCMCompliance.getCompTreeData());*/
            OPMClient.NCMCompliancePolicyController.treeCompInstance.updateTreeData(OPMClient.NCMCompliance.getCompTreeData());
            OPMClient.NCMCompliance.pushIconToTree();
            OPMClient.NCMCompliancePolicyController.policyCompInstance.wrapAnchorWithDiv();
            OPMClient.NCMCompliance.refreshDataForSelectItem(OPMClient.NCMCompliancePolicyController.selectedItemId, 100);
        } else {
            if (response.error && response.error.message) {
                msg = response.error.message;
            }
        }
        window.history.back();
        OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,msg);
    },
    checkIfStandardPolicyEdited: function(policyEditBackupInstance){
        if(policyEditBackupInstance){
            if(policyEditBackupInstance.policyName !== this.policyName){
                return true;
            }
            if(policyEditBackupInstance.policyDescription !== this.policyDescription){
                return true;
            }
            if(policyEditBackupInstance.selectedRuleGroupIds.slice().sort().join() !== this.selectedRuleGroupIds.slice().sort().join()){
                return true;
            }
            if(policyEditBackupInstance.selectedRuleIds.slice().sort().join() !== this.selectedRuleIds.slice().sort().join()){
                return true;
            }
        }
        return false;
    },
    updateAllowedDeviceDeviceGroupList: function(){
        this.set('allowedDeviceList', this.selectedDeviceList || []); //No I18N
        this.set('allowedDeviceGroupList', this.selectedDeviceGroupList || []); //No I18N
    },
    setDataForAutoRemSelection: function(){
        this.updateAutoRemDevicesList();
        this.updateAutoRemDeviceGroupsList();
    },
	updateDistributionMsg: function(){
		var updateMsg = false, updateMsgForRestrictedAssociation = false;
		if (this.nonDistributedDeviceGroups && this.selectedDeviceGroupIds) {
			for (var dg=0; dg < this.nonDistributedDeviceGroups.length; dg++) {
				if (this.selectedDeviceGroupIds.indexOf(String(this.nonDistributedDeviceGroups[dg])) !== -1) {
					updateMsg = true;
					break;
				}
			}
		}
		if (this.restrictedRuleGroupIds && this.selectedRuleGroupIds) {
			for (var rg=0; rg < this.restrictedRuleGroupIds.length; rg++) {
				if (this.selectedRuleGroupIds.indexOf(String(this.restrictedRuleGroupIds[rg])) !== -1) {
					updateMsg = true;
					updateMsgForRestrictedAssociation = true;
					break;
				}
			}
			for (var rg=0; rg < this.selectedRuleGroupIds.length; rg++) {
				if (this.rgToHasRestrictedChildRGMap && this.rgToHasRestrictedChildRGMap[String(this.selectedRuleGroupIds[rg])] === true) {
					updateMsg = true;
					updateMsgForRestrictedAssociation = true;
					break;
				}
			}
		}
		if (this.restrictedRuleIds && this.selectedRuleIds) {
			for (var r=0; r < this.restrictedRuleIds.length; r++) {
				if (this.selectedRuleIds.indexOf(String(this.restrictedRuleIds[r])) !== -1) {
					updateMsg = true;
					updateMsgForRestrictedAssociation = true;
					break;
				}
			}
		}
		if (updateMsg) {
			if (updateMsg) {
				this.set('noteMsgPolicyDistributionProbe', Ember.I18n.t('ncm.complianceiq.ee.dist.distribution_not_allowed.msg', this)); // NO I18N
			} else if (updateMsgForRestrictedAssociation) {
				this.set('noteMsgPolicyDistributionProbe', Ember.I18n.t('ncm.complianceiq.ee.dist.distribution_not_allowed.restricted.msg', this)); // NO I18N
			}
			this.set('distributeToAll', false);//No I18N
			waitForElement("#distributeToAllProbes",function (){//No I18N
				var checkBoxDiv = document.querySelector('input[name="distributeToAll"]'); // NO I18N
				if (checkBoxDiv) {
					$('input[name="distributeToAll"]').prop('checked', false);
					var parentDiv = checkBoxDiv.closest('div.opmFormRow'); // NO I18N
					if (parentDiv) {
						parentDiv.classList.add('disabledBlock'); // NO I18N
					}
				}
			});
		} else {
			this.set('noteMsgPolicyDistributionProbe', Ember.I18n.t('ncm.complianceiq.ee.dist.distribute_to_all.msg', this)); // NO I18N
		}
	},
    updateAutoRemDevicesList: function(){
        var selectList = [];
        var availList = [];
        if (this.allowedDeviceList && this.allowedDeviceList.length > 0) {
            for (var i = 0; i < this.allowedDeviceList.length; i++) {
                var itemMap = this.allowedDeviceList[i];
                var isPresent = false;
                if (this.autoRemediateSelectedDeviceList && this.autoRemediateSelectedDeviceList.length > 0) {
                    for (var j = 0; j < this.autoRemediateSelectedDeviceList.length; j++) {
                        if (this.autoRemediateSelectedDeviceList[j].ID == itemMap.ID) {
                            isPresent = true;
                            break;
                        }
                    }
                    if (isPresent) {
                        selectList.push(itemMap);
                    }
                    else {
                        availList.push(itemMap);
                    }
                } else {
                    availList = this.allowedDeviceList;
                    break;
                }
            }
        } else {
            selectList = this.autoRemediateSelectedDeviceList;
            availList = this.availableDeviceList.filter(function(device) {
                return !selectList.some(function(selected) { return selected.ID === device.ID; });
            });
        }
        this.set('autoRemediateSelectedDeviceList', selectList); //No I18N
        this.set('autoRemediateSelectedDeviceIds', this.getAutoRemSelectedDevicesIds()); //No I18N
        this.set('autoRemediateAvailableDeviceList', availList); //No I18N
    },
    getAutoRemSelectedDevicesIds: function(){
        var toRetList = [];
        if (this.autoRemediateSelectedDeviceList) {
            for (var i = 0; i < this.autoRemediateSelectedDeviceList.length; i++) {
                toRetList.push(this.autoRemediateSelectedDeviceList[i].ID);
            }
        }
        return toRetList;
    },
    updateAutoRemDeviceGroupsList: function(){
        /*var selectList = [];
        var availList = [];
        if (this.allowedDeviceGroupList && this.allowedDeviceGroupList.length > 0) {
            for (var i = 0; i < this.allowedDeviceGroupList.length; i++) {
                var itemMap = this.allowedDeviceGroupList[i];
                var isPresent = false;
                if (this.autoRemediateSelectedDeviceGroupList && this.autoRemediateSelectedDeviceGroupList.length > 0) {
                    for (var j = 0; j < this.autoRemediateSelectedDeviceGroupList.length; j++) {
                        if (this.autoRemediateSelectedDeviceGroupList[j].ID == itemMap.ID) {
                            isPresent = true;
                            break;
                        }
                    }
                    if (isPresent) {
                        selectList.push(itemMap);
                    }
                    else {
                        availList.push(itemMap);
                    }
                } else {
                    availList = this.allowedDeviceGroupList;
                    break;
                }
            }
        } else {
            selectList = this.autoRemediateSelectedDeviceGroupList;
            availList = this.availableDeviceGroupList.filter(function(deviceGroup) {
                return !selectList.some(function(selected) { return selected.ID === deviceGroup.ID; });
            });
        }
        this.set('autoRemediateSelectedDeviceGroupList', selectList); //No I18N
        this.set('autoRemediateSelectedDeviceGroupIds', this.getAutoRemSelectedDeviceGroupsIds()); //No I18N
        this.set('autoRemediateAvailableDeviceGroupList', availList); //No I18N*/
        var tempList = this.availableDeviceGroupList.concat(this.selectedDeviceGroupList);
        var __self = this;
        this.set('autoRemediateAvailableDeviceGroupList', tempList.filter(function(group){ //No I18N
                return !__self.autoRemediateSelectedDeviceGroupList.some(function(sel) { return sel.ID === group.ID; });
            }).sort(function(a, b) { return a.name.localeCompare(b.name); })
        );
    },
    getAutoRemSelectedDeviceGroupsIds: function(){
        var toRetList = [];
        if (this.autoRemediateSelectedDeviceGroupList) {
            for (var i = 0; i < this.autoRemediateSelectedDeviceGroupList; i++) {
                toRetList.push(this.autoRemediateSelectedDeviceGroupList[i].ID);
            }
        }
        return toRetList;
    },
	updateTabSelection: function(selectedTab){
//	    this.saveEditedData();

//        if (this.selectedTab.CUSTOM_CRITERIA && this.customCriteriaInstance) {
//            try {
//                var deviceCriSavedData = this.customCriteriaInstance.saveData();
//                this.deviceCriteriaBackup.deviceCriExpression = deviceCriSavedData.criteriaExpression;
//                this.deviceCriteriaBackup.deviceCriList = deviceCriSavedData.criteriaList;
//            } catch (e) {}
//        }
	    $('.tabStatic li').siblings('li').removeClass('active');
        var _selectedTab = {};
        this.filterType = selectedTab;
        if(selectedTab == 'device'){
            _selectedTab.DEVICES = true;
            this.set('selectBoxLeftLabel', Ember.I18n.t("webclient.general.availabledevices", this)); // No I18N
            this.set('selectBoxRightLabel', Ember.I18n.t("webclient.general.selecteddevices", this)); // No I18N
        }
        else if(selectedTab == 'device_group'){
            _selectedTab.DEVICE_GROUPS = true;
            this.set('selectBoxLeftLabel', Ember.I18n.t("jsp.commonstr.deviceGsnotselected", this)); // No I18N
            this.set('selectBoxRightLabel', Ember.I18n.t("jsp.commonstr.deviceGsselected", this)); // No I18N
        }
        else if(selectedTab == 'criteria'){
            _selectedTab.CUSTOM_CRITERIA = true;
        }
        this.set('selectedTab', _selectedTab); // NO I18N
//        this.loadUiData();
	},
    setDefaultData: function(){
        this.clearData();
        if (this.selectedItem === 'Policy') {
            var jsonData = OPMClient.NCMCompliancePolicyController.compliancePolicyPreRenders();
            if (this.isDeviceAssociation) {
                this.set('associatePage', true);//No I18N
                this.set('savePage', false);//No I18N
                this.set('secondPage', true);//No I18N
            } else {
                this.set('associatePage', false);//No I18N
                this.set('savePage', false);//No I18N
                this.set('firstPage', true);//No I18N
            }
            this.set('addEditPolicy', true);//No I18N
            var associationType = 'device';// No I18N
            if (this.selectedAction === 'add') {
                this.set('configType', jsonData.policyDetails.configType);// NO I18N
                this.set('violationCriteria', jsonData.policyDetails.violationCriteria);// NO I18N
                this.set('isRestricted', jsonData.policyDetails.isRestricted);// NO I18N
                this.set('availableDeviceGroupList', jsonData.availableResourceDetails.availableDeviceGroupList);// No I18N
                this.set('availableDeviceList',  jsonData.availableResourceDetails.availableDeviceList);// No I18N
                this.set('availableRuleGroupList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.availableRuleGroupList));// No I18N
                this.set('availableRuleList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.availableRuleList));// No I18N
            }
            else if (this.selectedAction === 'edit') {
                if (jsonData.resourceAssociationDetails) {
                    if (jsonData.resourceAssociationDetails.deviceAssociationDetails) {
                        associationType = 'device';// No I18N
                    } else if (jsonData.resourceAssociationDetails.deviceGroupAssociationDetails) {
                        associationType = 'device_group';// No I18N
                    } else if (jsonData.resourceAssociationDetails.criteriaAssociationDetails) {
                        associationType = 'criteria';// No I18N
                    }
                }
                this.set('isPolicyEdit', true);//No I18N
                this.set('policyName', jsonData.policyDetails.policyName);//No I18N
                this.set('policyDescription', jsonData.policyDetails.policyDesc);//No I18N
                this.set('configType', jsonData.policyDetails.configType);//No I18N
                this.set('violationCriteria', jsonData.policyDetails.violationCriteria);//No I18N
                this.set('isStandard', jsonData.policyDetails.isStandard);//No I18N
                this.set('isDistributed', jsonData.policyDetails.isDistributed);//No I18N
                this.set('isRestricted', jsonData.policyDetails.isRestricted);//No I18N
                this.set('isDisabled', jsonData.policyDetails.isDisabled);//No I18N
				this.set('isPublic', jsonData.policyDetails.isPublic);//No I18N
                this.set('availableRuleGroupList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.availableRuleGroupList));// No I18N
                this.set('selectedRuleGroupList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.selectedRuleGroupList));// No I18N
                this.set('selectedRuleGroupIds', jsonData.ruleGroupRuleAssociationDetails.selectedRuleGroupIds);// No I18N
                this.set('availableRuleList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.availableRuleList));// No I18N
                this.set('selectedRuleList', this.sortByName(jsonData.ruleGroupRuleAssociationDetails.selectedRuleList));// No I18N
                this.set('selectedRuleIds', jsonData.ruleGroupRuleAssociationDetails.selectedRuleIds);// No I18N
                this.set('availableDeviceGroupList', jsonData.availableResourceDetails.availableDeviceGroupList);// No I18N
                this.set('availableDeviceList',  jsonData.availableResourceDetails.availableDeviceList);// No I18N
                if(jsonData.policyDetails.autoRemediate){
                    this.send('updateEnableAutoRemediationCriteria');// No I18N
                }
                if (jsonData.resourceAssociationDetails.deviceAssociationDetails) {
                    var deviceAssociationDetails = jsonData.resourceAssociationDetails.deviceAssociationDetails;
                    this.set('selectedDeviceIds', deviceAssociationDetails.selectedDeviceIds);//No I18N
                    this.set('selectedDeviceList', deviceAssociationDetails.selectedDeviceList);//No I18N
                }
                if (jsonData.resourceAssociationDetails.deviceGroupAssociationDetails) {
                    var deviceGroupAssociationDetails = jsonData.resourceAssociationDetails.deviceGroupAssociationDetails;
                    this.set('selectedDeviceGroupIds', deviceGroupAssociationDetails.selectedDeviceGroupIds);//No I18N
                    this.set('selectedDeviceGroupList', deviceGroupAssociationDetails.selectedDeviceGroupList);//No I18N
                }
                if (jsonData.resourceAssociationDetails.criteriaAssociationDetails) {
                    var criteriaAssociationDetails = jsonData.resourceAssociationDetails.criteriaAssociationDetails;
                    /*this.set('deviceCriExpression', criteriaAssociationDetails.criteriaExpression);//No I18N
                    this.set('deviceCriList', criteriaAssociationDetails.criteriaList);//No I18N
                    this.set('filterId', criteriaAssociationDetails.criteriaFilterId);// No I18N
                    this.set('filterIdForComp', this.filterId);// No I18N*/
                    this.set('criteriaAssociationDetails', criteriaAssociationDetails);// No I18N
                }
                if (jsonData.autoRemResourceAssociationDetails.deviceAssociationDetails) {
                    var deviceAssociationDetails = jsonData.autoRemResourceAssociationDetails.deviceAssociationDetails;
                    this.set('autoRemediateSelectedDeviceIds', deviceAssociationDetails.selectedDeviceIds);//No I18N
                    this.set('autoRemediateSelectedDeviceList', deviceAssociationDetails.selectedDeviceList);//No I18N
                    this.set('autoRemediateAvailableDeviceList', deviceAssociationDetails.availableDeviceList);//No I18N
                }
                if (jsonData.autoRemResourceAssociationDetails.deviceGroupAssociationDetails) {
                    var deviceGroupAssociationDetails = jsonData.autoRemResourceAssociationDetails.deviceGroupAssociationDetails;
                    this.set('autoRemediateSelectedDeviceGroupIds', deviceGroupAssociationDetails.selectedDeviceGroupIds);//No I18N
                    this.set('autoRemediateSelectedDeviceGroupList', deviceGroupAssociationDetails.selectedDeviceGroupList);//No I18N
                    this.set('autoRemediateAvailableDeviceGroupList', deviceGroupAssociationDetails.availableDeviceGroupList);//No I18N
                }
                if (jsonData.autoRemResourceAssociationDetails.criteriaAssociationDetails) {
                    var criteriaAssociationDetails = jsonData.autoRemResourceAssociationDetails.criteriaAssociationDetails;
                    /*this.set('autoRemCriteriaExpression', criteriaAssociationDetails.criteriaExpression);//No I18N
                    this.set('autoRemCriteriaList', criteriaAssociationDetails.criteriaList);//No I18N
                    this.set('autoRemFilterId', criteriaAssociationDetails.criteriaFilterId);// No I18N
                    this.set('autoRemFilterIdForComp', this.autoRemFilterId);// No I18N*/
                    this.set('autoRemCriteriaAssociationDetails', criteriaAssociationDetails);// No I18N
                }
                var tempData = {};
                tempData.policyName = this.policyName;
                tempData.policyDescription = this.policyDescription;
                tempData.selectedRuleGroupIds = this.selectedRuleGroupIds;
                tempData.selectedRuleIds = this.selectedRuleIds;
                this.set('policyEditBackupInstance', tempData);//No I18N
            }
			if (jsonData.availableResourceDetails && jsonData.availableResourceDetails.nonDistributedDeviceGroupList) {
				this.set('nonDistributedDeviceGroups', jsonData.availableResourceDetails.nonDistributedDeviceGroupList);//No I18N
			}
			if (jsonData.ruleGroupRuleAssociationDetails) {
				this.set('restrictedRuleGroupIds', jsonData.ruleGroupRuleAssociationDetails.restrictedRuleGroupIds || []);//No I18N
				this.set('restrictedRuleIds', jsonData.ruleGroupRuleAssociationDetails.restrictedRuleIds || []);//No I18N
				this.set('rgToHasRestrictedChildRGMap', jsonData.ruleGroupRuleAssociationDetails.rgToHasRestrictedChildRGMap || {});//No I18N
			}
            this.updateTabSelection(associationType);
            // this.set('showRestrictedNoteMsg', jsonData.showRestrictedNoteMsg); //No I18N
        }
        else if (this.selectedItem === 'RuleGroup') {
            var jsonData = OPMClient.NCMComplianceRuleGroupController.complianceRGPreRenders();
            this.set('savePage', true);//No I18N
            this.set('addEditRuleGroup', true);//No I18N
            if (this.selectedAction === 'edit') {
                this.set('ruleGroupName', jsonData.ruleGroupName);//No I18N
                this.set('ruleGroupDescription', jsonData.ruleGroupDesc);//No I18N
                this.set('isRuleGroupEdit', true);//No I18N
                this.set('isStandard', jsonData.isStandard);//No I18N
            }
            this.set('selectedRuleGroupIds', jsonData.RuleGroups);//No I18N
            this.set('selectedRuleIds', jsonData.Rules);//No I18N
            this.loadRuleGroups(this.availableRuleGroupList, jsonData.remainingRGs);
            this.loadRuleGroups(this.selectedRuleGroupList, jsonData.selectedRGs);
            this.loadRules(this.availableRuleList, jsonData.remainingRules);
            this.loadRules(this.selectedRuleList, jsonData.selectedRules);
            this.set('isDistributed', jsonData.isDistributed);//No I18N
            this.set('showSaveButton', !(this.isStandard || (ncmIsProbeOrProbeSelected() && this.isDistributed)));//No I18N
            this.sortByName(this.availableRuleGroupList);
            this.sortByName(this.selectedRuleGroupList);
            this.sortByName(this.availableRuleList);
            this.sortByName(this.selectedRuleList);
            this.set('isRestricted', jsonData.isRestricted);//No I18N
			this.set('isPublic', jsonData.isPublic);//No I18N
            // this.set('showRestrictedNoteMsg', jsonData.showRestrictedNoteMsg); //No I18N
        }
    },
    sortByName: function(data) {
        data.sort(function(a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
        return data;
    },
    saveEditedData: function(){
        if (this.addEditPolicy) {
            if (!this.savePage && !this.associatePage) {
                try {
                    this.set('policyName', this.element.querySelector('input[id = policyNameField]').value);//No I18N
                    this.set('policyDescription', this.element.querySelector('textarea[id = policyDescriptionField]').value);//No I18N
                    this.set('configType', this.element.querySelector('input[name = configurationType]:checked').value);//No I18N
                    this.set('violationCriteria', this.element.querySelector('input[name = policyViolationCriteria]:checked').value);//No I18N
					this.set('isPublic', this.element.querySelector('input[name = markAsPublic]').checked);//No I18N
                } catch (e) {}
            }
            else if (this.associatePage) {
                /*if (this.filterType === 'criteria') {
                    try {
                        var deviceCriSavedData = this.customCriteriaInstance.saveData();
                        this.deviceCriteriaBackup.deviceCriExpression = deviceCriSavedData.criteriaExpression;
                        this.deviceCriteriaBackup.deviceCriList = deviceCriSavedData.criteriaList;
                    } catch (e) {}
                }*/
                if (window.OPM.userPermissions.ncmComplianceWrite) {
                    this.set('runComplianceCheck', this.element.querySelector('input[name = runComplianceCheck]').checked);//No I18N
                }
            }
            /*else if (this.savePage) {
                if (this.filterType === 'criteria') {
                    try {
                        var autoRemCriSavedData = this.customCriteriaInstance.saveData();
                        this.autoRemCriteriaBackup.autoRemCriExpression = autoRemCriSavedData.criteriaExpression;
                        this.autoRemCriteriaBackup.autoRemCriList = autoRemCriSavedData.criteriaList;
                    } catch (e) {}
                }
            }*/
        }
        else if (this.addEditRuleGroup) {
            this.set('ruleGroupName', this.element.querySelector('input[id = ruleGroupNameField]').value);//No I18N
            this.set('ruleGroupDescription', this.element.querySelector('textarea[id = ruleGroupDescriptionField]').value);//No I18N
			this.set('isPublic', this.element.querySelector('input[name = markAsPublic]').checked);//No I18N
        }
    },
    validateSelectedData: function(){
        if (this.addEditPolicy) {
            if (!this.savePage && !this.associatePage) {
                try {
                    ncmValidateInputField(this.policyName, '#policyNameField');//No I18N
                } catch(e) { return false; }
                if ((!this.selectedRuleGroupIds || this.selectedRuleGroupIds.length < 1) && (!this.selectedRuleIds || this.selectedRuleIds.length < 1)) {
                    OPMClient.NCMComplianceUtilController.loadMsgAndClear("infoMsg", Ember.I18n.t("ncm.complianceiq.select.one.rg.or.rule",this)); //No I18N
                    return false;
                }
            }
            else if (this.associatePage) {
                /*if (this.filterType === 'device') {
                    if (!this.selectedDeviceIds || this.selectedDeviceIds.length < 1) {
                        opm_infoMsgs("infoMsg", Ember.I18n.t("Select at least one Device",this)); //No I18N
                        return false;
                    }
                }
                else if (this.filterType === 'device_group') {
                    if (!this.selectedDeviceGroupIds || this.selectedDeviceGroupIds.length < 1) {
                        opm_infoMsgs("infoMsg", Ember.I18n.t("Select at least one Device Group",this)); //No I18N
                        return false;
                    }
                }*/
                /*if (this.filterType === 'criteria') {
                    try {
                        this.customCriteriaInstance.saveData();
                    } catch(e) { return false; }
                }*/
            }
            else if (this.savePage) {
                if (this.enableAutoRemediationCriteria) {
                    /*if (this.filterType === 'device') {
                        if ((this.selectedDeviceIds && this.selectedDeviceIds.length > 1) && (!this.autoRemediateSelectedDeviceIds || this.autoRemediateSelectedDeviceIds.length < 1)) {
                            OPMClient.NCMComplianceUtilController.loadMsgAndClear("infoMsg", Ember.I18n.t("ncm.complianceiq.autoRem.select.one.device",this)); //No I18N
                            return false;
                        }
                    }
                    else if (this.filterType === 'device_group') {
                        if ((this.selectedDeviceGroupIds && this.selectedDeviceGroupIds.length > 1) && (!this.autoRemediateSelectedDeviceGroupIds || this.autoRemediateSelectedDeviceGroupIds.length < 1)) {
                            OPMClient.NCMComplianceUtilController.loadMsgAndClear("infoMsg", Ember.I18n.t("ncm.complianceiq.autoRem.select.one.deviceGroup",this)); //No I18N
                            return false;
                        }
                    }*/
                    /*if (this.filterType === 'criteria') {
                        try {
                            this.customCriteriaInstance.saveData();
                        } catch(e) { return false; }
                    }*/
                    try {
                        this.set('autoRemCriteriaAssociationDetails', this.autoRemDeviceAssociationInstance.saveData(true)); // NO I18N
                    } catch(e) { return false; }
                }
            }
        }
        else {
            try {
                ncmValidateInputField(this.ruleGroupName, '#ruleGroupNameField');//No I18N
            } catch(e) { return false; }
        }
        return true;
    },
    loadUiData : function(){
        if (this.addEditPolicy) {
            if (!this.savePage && !this.associatePage) {
                if (this.configType === 'RUNNING') {
                    this.set('RUNNING', true);// NO I18N
                }
                else {
                    this.set('STARTUP', true);// NO I18N
                }
                if (this.violationCriteria === 'ANY_FAILURE') {
                    this.set('ANY_FAILURE', true);// NO I18N
                }
                else {
                    this.set('CRITICAL_MAJOR_FAILURE', true);// NO I18N
                }
                this.set('selectBoxLeftLabelRG', Ember.I18n.t("jsp.commonstr.ruleGsnotselected", this)); // No I18N
                this.set('selectBoxRightLabelRG', Ember.I18n.t("jsp.commonstr.ruleGsselected", this)); // No I18N
                this.set('selectBoxLeftLabelRule', Ember.I18n.t("jsp.commonstr.rulesnotselected", this)); // No I18N
                this.set('selectBoxRightLabelRule', Ember.I18n.t("jsp.commonstr.rulesselected", this)); // No I18N
            }
            else if (this.associatePage) {
                if (this.runComplianceCheck) {
                    this.set('runComplianceCheck', true);// NO I18N
                }
                /*if (this.filterType === 'criteria') {
                    this.set('deviceCriExpression', this.deviceCriteriaBackup.deviceCriExpression);//No I18N
                    this.set('deviceCriList', this.deviceCriteriaBackup.deviceCriList);//No I18N
                }*/
            }
            /*else if (this.savePage) {
                if (this.filterType === 'criteria') {
                    this.set('autoRemCriExpression', this.autoRemCriteriaBackup.autoRemCriExpression);//No I18N
                    this.set('autoRemCriList', this.autoRemCriteriaBackup.autoRemCriList);//No I18N
                }
            }*/
        } else if (this.addEditRuleGroup) {
            this.set('selectBoxLeftLabelRG', Ember.I18n.t("jsp.commonstr.ruleGsnotselected", this)); // No I18N
            this.set('selectBoxRightLabelRG', Ember.I18n.t("jsp.commonstr.ruleGsselected", this)); // No I18N
            this.set('selectBoxLeftLabelRule', Ember.I18n.t("jsp.commonstr.rulesnotselected", this)); // No I18N
            this.set('selectBoxRightLabelRule', Ember.I18n.t("jsp.commonstr.rulesselected", this)); // No I18N
        }
        this.updateRuleAssociationBtn();
    },
    pushDataToList : function(list, id, name){
        list.push({
                'name' : name, // NO I18N
                'ID' : id // NO I18N
            }
        );
    },
    loadRuleGroups : function(list, ruleGroups){
        if (ruleGroups){
            for(var i = 0; i < ruleGroups.length; i++){
                this.pushDataToList(list, ruleGroups[i].rgId, ruleGroups[i].rgName);
            }
        }
    },
    loadRules : function(list, rules){
        if (rules){
            for(var i = 0; i < rules.length; i++){
                this.pushDataToList(list, rules[i].ruleId, rules[i].ruleName);
            }
        }
    },
    /*loadDeviceGroups : function(list, deviceGroups){
        if (deviceGroups){
            for(var i = 0; i < deviceGroups.length; i++){
                this.pushDataToList(list, deviceGroups[i].id, deviceGroups[i].Name);
            }
        }
    },
    loadDevices : function(list, devices){
        if (devices){
            for(var i = 0; i < devices.length; i++){
                this.pushDataToList(list, devices[i].id, devices[i].Name);
            }
        }
    },
    loadIds : function(list, idsList){
        if (idsList){
            for(var i = 0; i < idsList.length; i++){
                list.push(idsList[i].ID);
            }
        }
    },*/
    clearData: function(){
        this.set('availableRuleList', []);//No I18N
        this.set('selectedRuleList', []);//No I18N
        this.set('selectedRuleIds', []);//No I18N

        this.set('availableRuleGroupList', []);//No I18N
        this.set('selectedRuleGroupList', []);//No I18N
        this.set('selectedRuleGroupIds', []);//No I18N

        this.set('availableDeviceList', []);//No I18N
        this.set('selectedDeviceList', []);//No I18N
        this.set('selectedDeviceIds', []);//No I18N

        this.set('availableDeviceGroupList', []);//No I18N
        this.set('selectedDeviceGroupList', []);//No I18N
        this.set('selectedDeviceGroupIds', []);//No I18N

        this.set('autoRemediateAvailableDeviceList', []);//No I18N
        this.set('autoRemediateSelectedDeviceList', []);//No I18N
        this.set('autoRemediateSelectedDeviceIds', []);//No I18N

        this.set('autoRemediateAvailableDeviceGroupList', []);//No I18N
        this.set('autoRemediateSelectedDeviceGroupList', []);//No I18N
        this.set('autoRemediateSelectedDeviceGroupIds', []);//No I18N
    },
    willDestroyElement : function(){
        this._super();
//        ncmRevertMaxScreen();
    }
});
OPMClient.NcmPolicyAssociateComponent = Ember.Component.extend({
    availablePolicyList : [],
    selectedPolicyList : [],
    selectedPolicyIds : [],

    availableRuleGroupList : [],
    selectedRuleGroupList : [],
    selectedRuleGroupIds : [],

    associationNoteMsg : Ember.I18n.t("ncm.compliance.association.note.msg", this), // No I18N

    init : function(){
        this._super();
        this.preRender();
        if(ncmIsProbeOrProbeSelected() && this.isDistributed){
            this.set('disableAssociation', true);//NO I18N
        }
    },
    didInsertElement : function(){
        this._super();
        this.element.querySelector(".opmFormHolder").style.height = "calc(100vh - 235px)"; // No I18N
//        ncmMaxScreen(true);
    },
    preRender : function(){
        this.setDefaultData();
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        cancel: function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            if (this.fromPage == 'Policies') {
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/Policies"; // NO I18N
            } else if (this.fromPage == 'ListGroups') {// NO I18N
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListGroups/All"; // NO I18N
            } else if (this.fromPage == 'ListRules') {// NO I18N
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListRules/All"; // NO I18N
            }
        },
        save: function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            var data = {};
            data.SELECTED_POLICY_IDS = JSON.stringify(this.selectedPolicyIds);
            data.SELECTED_RG_IDS = JSON.stringify(this.selectedRuleGroupIds);
            if (this.selectedItem == 'RuleGroup') {
                data.RULE_GROUP_ID = this.selItemId;
                OPMClient.NCMCompliance.updateRuleGroupAssociation(data);
            }
            else if (this.selectedItem == 'Rule') {
                data.RULE_ID = this.selItemId;
                OPMClient.NCMCompliance.updateRuleAssociation(data);
            }
        }
    },
    setDefaultData: function(){
        var jsonData = {};
        if (this.selectedItem == 'RuleGroup') {
            jsonData = OPMClient.NCMCompliance.getRuleGroupAssociationData(this.selItemId);
        } else if (this.selectedItem == 'Rule') {// NO I18N
            jsonData = OPMClient.NCMCompliance.getRuleAssociationData(this.selItemId);
        }
        this.set('availablePolicyList', jsonData.availablePolicies);// NO I18N
        this.set('selectedPolicyList', jsonData.associatedPolicies);// NO I18N
        this.set('selectedPolicyIds', jsonData.associatedPolicyIds);// NO I18N
        this.set('availableRuleGroupList', jsonData.availableRuleGroups);// NO I18N
        this.set('selectedRuleGroupList', jsonData.associatedRuleGroups);// NO I18N
        this.set('selectedRuleGroupIds', jsonData.associatedRgIds);// NO I18N
        this.set('selectBoxLeftLabelRG', Ember.I18n.t("jsp.commonstr.ruleGsnotselected", this)); // No I18N
        this.set('selectBoxRightLabelRG', Ember.I18n.t("jsp.compliance.associated.rulegroups", this)); // No I18N
        this.set('selectBoxLeftLabelPolicy', Ember.I18n.t("jsp.commonstr.policiesnotselected", this)); // No I18N
        this.set('selectBoxRightLabelPolicy', Ember.I18n.t("jsp.compliance.associated.policies", this)); // No I18N
        this.set('isDistributed', jsonData.isDistributed); // NO I18N
        this.set('isRestricted', jsonData.isRestricted); // NO I18N
        // this.set('showRestrictedNoteMsg', jsonData.showRestrictedNoteMsg); //No I18N
        // this.updateNoteMsg();
    },
    // updateNoteMsg: function(){
    //     if (this.showRestrictedNoteMsg) {
    //         if (this.isRestricted) {
    //             this.set('associationNoteMsg', Ember.I18n.t("ncm.compliance.association.restricted.note.msg", this)); // No I18N
    //         } else {
    //             this.set('associationNoteMsg', Ember.I18n.t("ncm.compliance.association.non_restricted.note.msg", this)); // No I18N
    //         }
    //     }
    // },
    clearData: function(){
        this.set('availablePolicyList', []);// NO I18N
        this.set('selectedPolicyList', []);// NO I18N
        this.set('selectedPolicyIds', []);// NO I18N
        this.set('availableRuleGroupList', []);// NO I18N
        this.set('selectedRuleGroupList', []);// NO I18N
        this.set('selectedRuleGroupIds', []);// NO I18N
    },
    willDestroyElement : function(){
        this._super();
        this.clearData();
//        ncmRevertMaxScreen();
    }
});
OPMClient.NcmPolicyCloneComponent = Ember.Component.extend({
    idNameMap : [],
    cloneObjectArr : [],
    init : function(){
        this._super();
        this.preRender();
    },
    didInsertElement : function(){
        this._super();
        this.element.querySelector(".opmFormHolder").style.height = "calc(100vh - 235px)"; // No I18N
    },
    preRender : function(){
        this.setDefaultData();
        this.cloneObjectArr = [];
        for(var i=0; i<this.idNameMap.length; i++) {
            this.cloneObjectArr.push({
                id: this.idNameMap[i].id,
                existingName: this.idNameMap[i].name,
                newName:''
            })
        }
    },
    actions :{
        childActions:function(functionName,param1, param2) {
            this.send(functionName, param1, param2);
        },
        cancel: function(){
            OPMClient.NCMCompliance.showEmptyDataImgTextButton();
            if (this.fromPage == 'Policies') {
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/Policies"; // NO I18N
            } else if (this.fromPage == 'ListGroups') {// NO I18N
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListGroups/All"; // NO I18N
            } else if (this.fromPage == 'ListRules') {// NO I18N
                location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListRules/All"; // NO I18N
            }
        },
        save: function(){
            if (this.validateSelectedData()) {
                OPMClient.NCMCompliance.showEmptyDataImgTextButton();
                if (this.selectedItem == 'Rule') {
                    this.saveRuleClone();
                }
                else if (this.selectedItem == 'RuleGroup') {
                    this.saveRuleGroupClone();
                }
                else if (this.selectedItem == 'Policy') {
                    this.savePolicyClone();
                }
                OPMClient.NCMCompliance.refreshPolicyTree(OPMClient.NCMCompliance.getCompTreeData());
            }
        }
    },
    setDefaultData: function(){
        var tempArr = [];
        if (this.selectedItem == 'Rule') {
            this.set('pageTitle', Ember.I18n.t("js.commonstr.cloneRule", this));// NO I18N
            this.set('leftColName', Ember.I18n.t("ncm.complianceiq.clone.rule.existing.name", this));// NO I18N
            this.set('rightColName', Ember.I18n.t("jsp.commonstr.Compliance.NewRuleName", this));// NO I18N
            tempArr = this.getRuleDataArr();
        } else if (this.selectedItem == 'RuleGroup') {// NO I18N
            this.set('pageTitle', Ember.I18n.t("ncm.complianceiq.rulegroup.clone", this));// NO I18N
            this.set('leftColName', Ember.I18n.t("ncm.complianceiq.clone.ruleGroup.existing.name", this));// NO I18N
            this.set('rightColName', Ember.I18n.t("ncm.complianceiq.clone.ruleGroup.new.name", this));// NO I18N
            tempArr = this.getRuleGroupDataArr();
        } else if (this.selectedItem == 'Policy') {// NO I18N
            this.set('pageTitle', Ember.I18n.t("ncm.complianceiq.policy.clone", this));// NO I18N
            this.set('leftColName', Ember.I18n.t("ncm.complianceiq.clone.policy.existing.name", this));// NO I18N
            this.set('rightColName', Ember.I18n.t("ncm.complianceiq.clone.policy.new.name", this));// NO I18N
            tempArr = this.getPolicyDataArr();
        }
        this.set('idNameMap', tempArr);// NO I18N
    },
    getRuleDataArr: function(){
        var toRetList = [];
        OPMClient.NCMComplianceRulesController.cloneRulesMap.forEach(function(value, key){
            var tempMap = {};
            tempMap.id = 'NEW_RULE_'+value.id;// NO I18N
            tempMap.name = value.name;
            toRetList.push(tempMap);
        });
        return toRetList;
    },
    getRuleGroupDataArr: function(){
        var toRetList = [];
        OPMClient.NCMComplianceRuleGroupController.cloneRuleGroupsMap.forEach(function(value, key){
            var tempMap = {};
            tempMap.id = 'NEW_RG_'+value.id;// NO I18N
            tempMap.name = value.name;
            toRetList.push(tempMap);
        });
        return toRetList;
    },
    getPolicyDataArr: function(){
        var toRetList = [];
        OPMClient.NCMCompliancePolicyController.clonePoliciesMap.forEach(function(value, key){
            var tempMap = {};
            tempMap.id = 'NEW_POLICY_'+value.id;// NO I18N
            tempMap.name = value.name;
            toRetList.push(tempMap);
        });
        return toRetList;
    },
    saveRuleClone: function(){
        var dataArr = this.getDataArrFromIdNameMap();
        var data = {};
        data.OLD_ID_NEW_NAME_MAP = JSON.stringify(dataArr);
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/cloneRule',data)//No I18N
        var	cls = "errorMsg"; //No I18N
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            window.history.back();
        }
        if(response.statusMsg){
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.statusMsg);
        } else {
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.error.message);
        }
        $('#ComplianceAllRulesV2List').delay(1000).trigger('reloadGrid'); //No I18N
    },
    saveRuleGroupClone: function(){
        var dataArr = this.getDataArrFromIdNameMap();
        var data = {};
        data.OLD_ID_NEW_NAME_MAP = JSON.stringify(dataArr);
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/cloneRuleGroup',data)//No I18N
        var	cls = "errorMsg"; //No I18N
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            window.history.back();
        }
        if(response.statusMsg){
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.statusMsg);
        } else {
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.error.message);
        }
        $('#ComplianceAllRuleGroupsV2List').delay(1000).trigger('reloadGrid'); //No I18N
    },
    savePolicyClone: function(){
        var dataArr = this.getDataArrFromIdNameMap();
        var data = {};
        data.OLD_ID_NEW_NAME_MAP = JSON.stringify(dataArr);
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/clonePolicy',data)//No I18N
        var	cls = "errorMsg"; //No I18N
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            window.history.back();
        }
        if(response.statusMsg){
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.statusMsg);
        } else {
            OPMClient.NCMComplianceUtilController.loadMsgAndClear(cls,response.error.message);
        }
        $('#NcmCompliancePolicyGroupResult').delay(1000).trigger('reloadGrid'); //No I18N
    },
    getDataArrFromIdNameMap: function(){
        var toRetList = [];
        for (var i = 0; i < this.cloneObjectArr.length; i++) {
            toRetList.push({
                'id' : this.cloneObjectArr[i].id.split('_')[2],// Indexing used here to fetch the id of existing item - Policy/RuleGroup/Rule
                'newName' : $('#'+this.cloneObjectArr[i].id).val()// NO I18N
            });
        }
        return toRetList;
    },
    validateSelectedData: function(){
        for (var i = 0; i < this.cloneObjectArr.length; i++) {
            try{
                ncmValidateInputField(this.cloneObjectArr[i].newName, '#'+this.cloneObjectArr[i].id);
            } catch(e) {return false;}
            if (this.cloneObjectArr[i].newName === this.cloneObjectArr[i].name) {
                validateFocus('#'+this.cloneObjectArr[i].id,'','','','Same as existing name');
                return false;
            }
        }
        return true;
    },
    clearData: function(){
        this.set('idNameMap', []);// NO I18N
    },
    willDestroyElement : function(){
        this._super();
        this.clearData();
    }
});
OPMClient.NcmComplianceCmdTemplateTestComponent = Ember.Component.extend({
	templateName: "components/ncm-compliance-cmd-template-test", //No I18N
	devicesList : [],
	selectedDevice : false,
	configContent : '',
	templateVariables : [],
    init : function(){
        this._super();
        this.populateDevicesList();
        if(this.devicesList.length > 0){
            this.selectedDevice = this.devicesList[0].key;
        }
        this.loadVariableInfos();
    },
    didInsertElement : function(){
        $('#'+this.elementId+' .select2').select2();
	    this.sendAction('action', 'commandTemplateTestInstance', this);
        if($('.slide-overlay').length > 1 && $(this.element).find('.slide-overlay')){
            $(this.element).find('.slide-overlay').remove();
        }
    },
    loadVariableInfos: function(){
        var variableInfoList = [];
        var __self = this;
        var addVariableForRender = function(variableName, index){
            variableInfoList.push({
                name : variableName,
                value : '',
                uniqueId : (__self.elementId + '_' + index+1)
            })
        };
        if(OPMClient.NCMComplianceTemplatesController.testDetails){
            if(OPMClient.NCMComplianceTemplatesController.testDetails.commands){
                var variables = this.parsedVariablesFromCommands(OPMClient.NCMComplianceTemplatesController.testDetails.commands);
                for(var i = 0; i < variables.length; i++){
                    addVariableForRender(variables[i], i);
                }
            }
            else if(OPMClient.NCMComplianceTemplatesController.testDetails.templateId){
                var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getTemplateVariables'; //No I18N
                var data = {
                    templateId : OPMClient.NCMComplianceTemplatesController.testDetails.templateId
                }
                var jsonData = opm_ajaxGetResponse(ajaxRequestUrl, data);
                if(jsonData.isSuccess && jsonData.variables){
                    var variables = jsonData.variables;
                    for(var i = 0; i < variables.length; i++){
                        addVariableForRender('$'+variables[i], i);
                    }
                }
            }
        }
        this.set('templateVariables', variableInfoList); // NO I18N
    },
    parsedVariablesFromCommands: function(commands){
        var variables = [];
        if(commands){
            for(var i = 0; i < commands.length; i++){
                var commandVariables = getVariablesFromContent(commands[i].command);
                if(commandVariables && commandVariables.length > 0){
                    for(var j = 0; j < commandVariables.length; j++){
                        if(!variables.includes(commandVariables[j])){
                            variables.push(commandVariables[j]);
                        }
                    }
                }
            }
        }
        return variables;
    },
    actions : {
        test : function(){
            var __self = this;
            try{
                var data = {};
                data.resourceId = this.selectedDevice;
                if(this.templateVariables.length > 0){
                    var variables = {};
                    for(var i = 0; i < this.templateVariables.length; i++){
                        var key = this.templateVariables[i].name.substring(1);
                        ncmValidateInputField(this.templateVariables[i].value, '#'+this.templateVariables[i].uniqueId);
                        variables[key] = this.templateVariables[i].value;
                    }
                    data.variables = JSON.stringify(variables);
                }
                this.set('showLoading', true); // NO I18N
                if(OPMClient.NCMComplianceTemplatesController.testDetails){
                    if(OPMClient.NCMComplianceTemplatesController.testDetails.commands){
                        data.commands = JSON.stringify(OPMClient.NCMComplianceTemplatesController.testDetails.commands);
                    }
                    else if(OPMClient.NCMComplianceTemplatesController.testDetails.templateId){
                        data.templateId = OPMClient.NCMComplianceTemplatesController.testDetails.templateId;
                    }
                }
                setTimeout(function(){
    //                var url = window.OPM.apiUrlPattern + '/ncmcompliance/getSampleRules'; //NO I18N
    //                var jsonData = opm_ajaxGetResponse(url, data);
                    var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/testCommandTemplate'; //NO I18N
                    $.ajax({
                        url: ajaxRequestUrl,
                        dataType: 'json',//No I18N
                        type: 'POST',//No I18N
                        async: true,
                        data : data,
                        success: function(jsonData) {
                            __self.set('showLoading', false); // NO I18N
                            if(jsonData.isSuccess){
                                __self.set('showContent', true); // NO I18N
                                __self.set('configContent', jsonData.content); // NO I18N
                            }
                            else if(jsonData.error !== undefined) {
                                opm_infoMsgs("errorMsg", jsonData.error.message);//No I18N
                            }
                            else{
                                __self.set('errorMsg', jsonData.statusMsg); // NO I18N
                            }
                        }
                    });
                },100);
            }
            catch(e){}
        },
        cancel : function(){
            if(location.href.indexOf('Compliance/ListRules') != -1){
                slideOutWithId('templateTestView'); // NO I18N
            }
            else{
                window.history.back();
            }
        }
    },
    populateDevicesList : function(){
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getDevicesListForCmdTemplates'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        if(jsonData.isSuccess && jsonData.resourceList){
            this.devicesList = jsonData.resourceList;
        }
    },
    willDestroyElement : function(){
        this.set('showContent', false); // NO I18N
        this.set('configContent', false); // NO I18N
        this.set('errorMsg', false); // NO I18N
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.NcmWorkflowTemplatesComponent = Ember.Component.extend({
    sampleRules : [],
    selectedRule : {},
    init : function(){
        this._super();
        this.loadSamples();
    },
    didInsertElement : function(){
        this._super();
    },
    loadSamples : function(){
        var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/getSampleRules'; //No I18N
        var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
        if(jsonData.isSuccess && jsonData.sampleRules){
            this.set('sampleRules', jsonData.sampleRules); // NO I18N
        }
    },
    actions : {
        childActions:function(functionName,param) {
            this.sendAction('action',functionName, param);
        },
        viewTemplate: function(ruleId){
            this.set('popup', true); // NO I18N
            for(var i = 0; i < this.sampleRules.length; i++){
                if(this.sampleRules[i].ruleId == ruleId){
                    this.set('selectedRule', this.sampleRules[i]); // NO I18N
                    break;
                }
            }
        },
        loadRule : function(ruleId){
            this.set('popup', false); // NO I18N
            this.sendAction('action','loadSampleRule', ruleId); // NO I18N
            ncmusrsts1("use_flow_rule_template");// NO I18N
        },
        closePopup : function(){
            this.set('popup', false); // NO I18N
        }
    },
	willDestroyElement: function(){
	    this._super();
        $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.NcmFlowRuleIconComponent = Ember.Component.extend({
    classNames: ['flow_icon_block','flex'], // NO I18N
    init : function(){
        this._super();
        if(this.type){
            this.type = this.type.toUpperCase();
            if(this.noFlex){
                this.classNames = ['flow_icon_block']; // NO I18N
            }
            if(this.type == 'COMPLIANT'){
                this.classNames.push('status_compliant');
            }
            else if(this.type == 'VIOLATION'){
                this.classNames.push('status_violation');
            }
            else if(this.type == 'NOT_REQUIRED'){
                this.classNames.push('status_not_required');
            }
            else if(this.type == 'ATTENTION'){
                this.classNames.push('status_attention');
            }
        }

    },
    didInsertElement : function(){
        this._super();
        if(!this.iconSize){
            this.iconSize = 'size20'; // NO I18N
        }
        $(this.element).find('em').addClass(this.iconSize);
        if(this.svgClass){
            $(this.element).find('svg').addClass(this.svgClass);
        }
    }

});
OPMClient.NcmComplianceTemplateMailComponent = Ember.Component.extend({
    templateName : '',
    mailContent : '',
    didInsertElement : function(){
        this._super();
        if($('.slide-overlay').length > 1 && $(this.element).find('.slide-overlay')){
            $(this.element).find('.slide-overlay').remove();
        }
        if($('#commandTemplateName').val()){
            this.set('templateName', $('#commandTemplateName').val()); // NO I18N
        }
        if(location.href.indexOf('CommandTemplates') != -1){
            $(this.element).find('.slideScrollHeightFix').addClass('pl-none pr-none'); // NO I18N
        }
    },
    actions : {
        cancel : function(){
            slideOutWithId('templateMailPreview'); //NO I18N
        },
        sendMail : function(){
            var apiData = {
                templateName : this.templateName,
                content : this.mailContent
            };
            var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/requestCommandTemplateUpdate', apiData);//No I18N
            var cls = "errorMsg";//NO I18N
            if(response.isSuccess) {
                cls = "successMsg"; //NO I18N
                opm_infoMsgs(cls,response.msg);
            }
            else if(response.error !== undefined) {
                message = response.error.message;
                opm_infoMsgs(cls,message);
            }
            else {
                opm_infoMsgs(cls,response.msg);
            }
        }
    }
});

// AWARE OF EXCEPTION BEFORE USING | RECOMMENDED TRY CATCH
function ncmValidateInputField(data, id, callBackFunc){
    if(!data || data == '' || data.trim() == ''){
        if(id){
            validateFocus(id);
        }
        if(callBackFunc){
            callBackFunc();
        }
        throw new Error('Invalid input'); // NO I18N
    }
}
function isNCMFlowLoop(input){
    return input == 'LOOP' || input == 'PROCESS'; // NO I18N
}
function getComplianceResultItems(){
    var list = [];
    list.push('COMPLIANT');
    list.push('VIOLATION');
    list.push('NOT_REQUIRED');
    return list;
}
function getNcmFlowEdgeItems(){
    var list = getComplianceResultItems();
    list.push('END');
    return list;
}
function changeSelectPolicyOption() {
	var policySelectionType = $("input[name='policySelectionType']:checked").val();//No I18N
	if (policySelectionType == "allPolicy"){
		$('#selectPolicyDiv').hide();
	}else {
		$('#selectPolicyDiv').show();
	}
	return true;
}
function ncmGetNewBlockPagingData(){
    var pagingData = {
        currPageSize : 10,
        totalPages : '',
        pageSizeArr : [10, 20, 50, 100],
        currPageNum : 1,
        pageNumArr : [],
        totalRecords : -1
    }
    return pagingData;
}
function ncmCreateComplianceVariable(name){
//    if(!name || name == ''){
//        name = '$';
//    }
    var returnObj = {
        id : Date.now() + '' + Math.floor(Math.random() * 1000),
        name : name,
        displayName : '',
        description : '',
        value : '',
        isGlobal : false,
        // isTemp : true,
        variableType : 'DERIVED' // NO I18N
    }
    // returnObj.isUsed = name?true:false;
    if(name){
        returnObj.value = '\\S+'; // NO I18N
    }
    return returnObj;
}
function ncmMaxScreen(checkBand){
    if(checkBand){
        if(!$('html.horizontalView').hasClass('hideMainTopBand')){
            $('html.horizontalView').addClass("hideMainTopBand");//No I18N
        }
    }
    if(document.querySelector('.settingsCnt') && !document.querySelector('.settingsCnt').classList.contains('top-0')){
        var nfaCheck = window.OPM.isNFAOldView && $('.topNews') && $('.topNews').length > 0 && $('.topNews').is(':visible');
        if(!nfaCheck){
            $('.settingsCnt').addClass('top-0');
        }
    }
    if((window.OPM.isOPM || window.OPM.isNFA) && document.querySelector('.settingsCnt')){
        var nfaCheck = window.OPM.isNFAOldView && $('.topNews') && $('.topNews').length > 0 && $('.topNews').is(':visible');
        if(!nfaCheck){
            document.querySelector('.settingsCnt').style.top = 0;
        }
    }
}
function ncmRevertMaxScreen(){
    $('html.horizontalView').removeClass("hideMainTopBand");//No I18N
    $('.settingsCnt').removeClass('top-0');
    if(window.OPM.isOPM || window.OPM.isNFA){
        $('.settingsCnt').attr('style','top:35px !important');
    }
}
//function getVariablesFromContent(pattern){
//    var variables = [];
//    if(!pattern){
//        return variables;
//    }
//    var pushResult = function(startIndex, endIndex){
//        var slicedContent = pattern.slice(startIndex, endIndex);
//        if(slicedContent && slicedContent.length > 1){
//            variables.push(slicedContent);
//        }
//    }.bind(this);
//    var variableStart = -1;
//    for(var i = 0; i < pattern.length; i++){
//        if(pattern[i] == '$'){
//            variableStart = i;
//        }
//        else if(variableStart > -1 ){
//            if (pattern[i] == ' ' || (pattern[i] == ')' && pattern[variableStart-1] == '(' && (variableStart+1 != i))){
//                pushResult(variableStart, i);
//                variableStart = -1;
//            }
//            else if(i == pattern.length-1 && variableStart+1 < pattern.length){
//                pushResult(variableStart, i+1);
//                variableStart = -1;
//            }
//        }
//    }
//    return variables;
//}
OPMClient.NcmConfigSearchRowsComponent = Ember.Component.extend({
    templateName: 'components/ncm-config-search-rows', //No I18N

    rows: null,

    init: function () {
        this._super();
        this.set('rows', Ember.A([Ember.Object.create({ index: 0, operator: 'OR', condition: 'contains', value: '' })])); //No I18N
    },

    didInsertElement: function () {
        this.$('.select2').select2(); //No I18N
    },

    actions: {
        addRow: function () {
            var nextIndex = this.get('rows.length'); //No I18N
            this.get('rows').pushObject(Ember.Object.create({ index: nextIndex, operator: 'AND', condition: 'contains', value: '' })); //No I18N
            Ember.run.scheduleOnce('afterRender', this, function () { //No I18N
                this.$('.config-search__row:last .select2').select2(); //No I18N
            });
        },
        removeRow: function (row) {
            if (this.get('rows.length') > 1) {
                this.get('rows').removeObject(row);
            }
        },
        changeOperator: function (row) {
            if (row) {
                // Toggle between AND and OR
                row.set('operator', row.get('operator') === 'AND' ? 'OR' : 'AND'); //No I18N
            }
        }
    }
});

OPMClient.NcmConfigSearchComponent = Ember.Component.extend({
    templateName: 'components/ncm-config-search', //No I18N
    showExpandBtn: false,

    init: function () {
        this._super();
        var data = OPMClient.ApplicationController.probeList;

        OPMClient.NCMComponentController.ncmConfigSearchComponent = this;
        if(data !== undefined && data.length > 0){
            var probeFilter = [{
                id: -1,
                name: Ember.I18n.t('webclient.ncmee.probeSelector.collectiveData.title') // No I18N
            }];

            for (var i = 0; i < data.length; i++) {
                probeFilter.push({
                    id: data[i].NAME,
                    name: data[i].DISPLAYNAME
                });
            }
            OPMClient.NCMInventoryConfigSearchController.set('probeFilter', probeFilter); //No I18N
        }
        this.set('showProbeList', (probeFilter !== undefined && probeFilter.length > 0)); //No I18N
    },
    actions: {
        closeSearch: function () {
            OPMClient.NCMInventoryConfigSearchController.closeSearch();
        },
        search: function () {
            if(OPMClient.NCMInventoryConfigSearchController.search()){
                this.set('showExpandBtn', true); //No I18N
                if($('.config-search__expand-btn').hasClass('collapse')){ //No I18N
                    $('.config-search__expand-btn').removeClass('collapse'); //No I18N
                }
                $('#configSearchContainer').hide(); //No I18N
            }else{
                this.set('showExpandBtn', false); //No I18N
                $('#configSearchContainer').show(); //No I18N
            }
        },
        stopSearch: function () {
            this.set('showExpandBtn', false);//No I18N

            //$('#configSearchContainer').show(); //No I18N
            OPMClient.NCMInventoryConfigSearchController.stopSearch();
        },
        searchAgain: function () {
            OPMClient.NCMInventoryConfigSearchController.setProperties({isSearchCompleted: false, isSearchInProgress: false});
            this.set('showExpandBtn', false);//No I18N
            if($('#configSearchContainer').is(':visible')){ //No I18N
                this.send('search'); //No I18N
                this.$().find('#configSearchContainer .config-search__search-btn').show(); //No I18N
            }else{
                $('#configSearchContainer').show(); //No I18N
                // Use component.$() for scoped DOM queries
                this.$().find('.config-search__search-btn').show(); //No I18N
            }
        },
        toggleConditions: function () {
            var $expandBtn = this.$('.config-search__expand-btn'); //No I18N
            $expandBtn.toggleClass('collapse'); //No I18N
            $('#configSearchContainer').toggle(); //No I18N
            var showCondition = $('#configSearchContainer').is(':visible'); //No I18N
            if (showCondition) {
                // Fixed: Use component.$ for scoped queries instead of global $
                this.$().find('#configSearchContainer .config-search__search-btn').hide(); //No I18N
            }
        }
    },
    willDestroyElement : function () {
        $(window).off('resize.ncmConfigSearch', this._onWindowResize); //No I18N
        if (this._resizeDebounce) {
            clearTimeout(this._resizeDebounce);
            this._resizeDebounce = null;
        }
        var ctrl = OPMClient.NCMInventoryConfigSearchController;
        if (ctrl.get('isSearchInProgress')) {
            ctrl.stopSearch();
        }
        ctrl.resetSearchState();
    }
});

OPMClient.MultiselectDropdownComponent = Ember.Component.extend({
    templateName: 'components/multiselect-dropdown', //No I18N

    selectedData: function () {
        var records = this.get('data');
        if (!records) {
            return [];
        }
        return records.filter(function (item) {
            return item.selected;
        });
    }.property('data.@each.selected'),//No I18N

    didInsertElement: function () {
        var _self = this;
        var $component = this.$();

        // Toggle dropdown on input area click=
        $component.find('.filter-btn').on('click', function (e) {
            $component.find('.multiselect-dropdown-container').toggleClass('active'); //No I18N
            e.stopPropagation();
        });

        //Toggle AND or OR in Condition
        $component.find('.config-search__operator').on('click', function (e) {
            var newValue = $(this).text() === 'AND' ? 'OR' : 'AND'; //No I18N
            $(this).text(newValue);
            e.stopPropagation();
        });

        // Close dropdown when clicking outside
        $(document).on('click.multiselect-dropdown-' + _self.get('elementId'), function (e) { //No I18N
            if (!$component.is(e.target) && $component.has(e.target).length === 0) {
                $component.find('.multiselect-dropdown-container').removeClass('active'); //No I18N
            }
        });

        // Live search filter
        $component.find('.multiselect-dropdown__search-input').on('keyup', function () { //No I18N
            var searchText = $(this).val().toLowerCase();
            $component.find('.multiselect-dropdown ul li').each(function () {
                var labelText = $(this).find('label').text().toLowerCase();
                $(this).toggle(labelText.indexOf(searchText) > -1);
            });
        });

        // Select all
        $component.find('.selectAllComponent').on('click', function (e) { //No I18N
            e.preventDefault();
            var records = _self.get('data');
            if (records) {
                records.forEach(function (item) {
                    Ember.set(item, 'selected', true); //No I18N
                });
            }
            _self._syncSelectAllVisibility();
        });

        // Deselect all
        $component.find('.deselectAllComponent').on('click', function (e) { //No I18N
            e.preventDefault();
            var records = _self.get('data');
            if (records) {
                records.forEach(function (item) {
                    Ember.set(item, 'selected', false); //No I18N
                });
            }
            _self._syncSelectAllVisibility();
        });

        this._syncSelectAllVisibility();
    },

    _syncSelectAllVisibility: function () {
        var records = this.get('data');
        var $component = this.$();
        if (!records || !$component) {
            return;
        }
        var allSelected = records.length > 0 && records.every(function (item) {
            return item.selected;
        });
        if (allSelected) {
            $component.find('.selectAllComponent').hide();
            $component.find('.deselectAllComponent').show();
        } else {
            $component.find('.selectAllComponent').show();
            $component.find('.deselectAllComponent').hide();
        }
    },

    selectionObserver: function () {
        this._syncSelectAllVisibility();
    }.observes('data.@each.selected'),//No I18N

    willDestroyElement: function () {
        $(document).off('click.multiselect-dropdown-' + this.get('elementId')); //No I18N
    },

    actions: {
        deSelect: function (item) {
            Ember.set(item, 'selected', false); //No I18N
        },
        update: function (item) {
            Ember.set(item, 'selected', !item.selected); //No I18N
            this._syncSelectAllVisibility();
        }
    }
});

function getVariablesFromContent(pattern) {
    if (!pattern) {
        return [];
    }
    // Match $ followed by one or more word characters, even if there are two $$
    var regex = /\$+\w+/g;
    var matches = pattern.match(regex);
    return matches ? matches : [];
}
function ncmEnsureVariableParentheses(line, variable) {
	if(!line || !variable){
		return line;
	}
	var index = line.indexOf(variable);
	if (index === -1) {
		return line; // Variable not found
	}

	var beforeChar = line[index - 1];
	var afterChar = line[index + variable.length];

	var hasOpenParen = beforeChar === '(';
	var hasCloseParen = afterChar === ')';

	var start = line.slice(0, index);
	var middle = variable;
	var end = line.slice(index + variable.length);

	if (!hasOpenParen) {
		start += '(';
	}

	if (!hasCloseParen) {
		middle += ')';
	}

	return start + middle + end;
}

function ncmIsVariableProperlyEnclosed(line, variable) {
	if(!ncmCheckContains(line, variable)){
		return false;
	}
	var index = line.indexOf(variable);
	if (index === -1) {
		return false;
	}
	var beforeChar = line[index - 1];
	var afterChar = line[index + variable.length];
	return beforeChar === '(' && afterChar === ')';
}
function ncmCheckContains(input, presentValue){
	if(!input || !presentValue){
		return false;
	}
	var matchIndex = input.indexOf(presentValue);
	return matchIndex !== -1 && ((matchIndex + presentValue.length) <= input.length);
}

//## NCM Notification Profile / Change Management related components starts ##
OPMClient.NcmRollbackTemplateComponent = Ember.Component.extend({
    templateName: "ncm-rollback-template", //No I18N

    initDefaults: function () {
        var rollbackModeList = [
            { name: "Running", value: "Running" }, //NO I18N
            { name: "Startup", value: "Startup" }, //NO I18N
            { name: "Both", value: "Both" } //NO I18N
        ];
        this.set("model.rollbackModeList", rollbackModeList); //NO I18N

        if (this.model.task === "Add") { //NO I18N
            this.set("model.templateName", ""); //NO I18N
            this.set("model.rollbackPrevVersion", true);//NO I18N
            this.set("model.rollbackBaseline", false);//NO I18N
            this.set("model.rollbackConfigType", "PREVIOUS"); //NO I18N
        }
    }.on("init"), //NO I18N
    actions: {
        selectRollbackType: function(type) {
            var isPrevious = (type === "PREVIOUS"); //NO I18N
            var isBaseline = (type === "BASELINE"); //NO I18N

            this.set("model.rollbackPrevVersion", isPrevious); //NO I18N
            this.set("model.rollbackBaseline", isBaseline); //NO I18N
            this.set("model.rollbackConfigType", (isPrevious || isBaseline) ? type : null); //NO I18N
        }
    },
    didInsertElement: function () {
        // optional
    },
    willDestroyElement: function () {
        $("#" + this.elementId).find("*").remove(); //NO I18N
    }
});

OPMClient.NcmAlarmTemplateComponent = Ember.Component.extend({
    templateName: "ncm-alarm-template", //No I18N

    initDefaults: function () {
        var alarmSeverityList = [
            { name: Ember.I18n.t("webclient.ncm.clientserver.config.severity.Critical"), value: "1" }, //NO I18N
            { name: Ember.I18n.t("webclient.ncm.clientserver.config.severity.Trouble"), value: "2" }, //NO I18N
            { name: Ember.I18n.t("webclient.ncm.clientserver.config.severity.Attention"), value: "3" }, //NO I18N
            { name: Ember.I18n.t("webclient.ncm.clientserver.config.severity.ServiceDown"), value: "4" } //NO I18N
        ];
        this.set("model.ncmAlarmSeverityList", alarmSeverityList); //NO I18N
        if (!this.model.ncmAlarmSeverity) {
            this.set("model.ncmAlarmSeverity", "2"); //NO I18N
        }
    }.on("init"), //NO I18N
    willDestroyElement: function () {
        $("#" + this.elementId).find("*").remove(); //NO I18N
    }
});
//## NCM Notification Profile / Change Management related components ends   ##//## NCM Notification Profile / Change Management related components ends   ##
