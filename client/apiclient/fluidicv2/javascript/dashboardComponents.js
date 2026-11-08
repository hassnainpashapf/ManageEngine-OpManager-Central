



var OpmDashwidgetComponentArray = [];

OPMClient.DashboardGlobalFilterOptionsComponent = Ember.Component.extend({
	templateName: "components/dashboard-global-filter-options",//No I18N
	classNames: ['dashboard-global-filter','pr-sm', 'pl-sm', 'mt-sm'],
	filterOptions: [],
	targetObject: null, // Will be set by the parent
	_groupOptionsLoaded: false,
	
	didInsertElement: function(){
		if(!this.get("filterOptions") || this.get("filterOptions").length === 0) {
			this.initializeDefaultFilters();
		}
		Ember.run.next(this, function() {
			this.$('select.select2').not('.lazy-select2').select2(); //No I18N
		});
		this.loadGroupOptionsAsync();
	},
	
	initializeDefaultFilters: function() {
		var defaultFilters = [];
		
		if(window.OPM.isOPM && !window.OPM.userPermissions.bvRestricted && !window.OPM.probeRestrictedAllProbeSelected && !['NFA', 'NCM', 'FWA', 'OPUTILS', 'DPI'].includes(OPMClient.HomeDetailsController.dashboardType)) {
			defaultFilters.push(Ember.Object.create({
				key: "globalLogicalGroup", //No I18N
				label: Ember.I18n.t("webclient.settings.groups", this), //No I18N
				options: [],
				selectedValue: "",
				id: "dashboardFilter_globalLogicalGroup", //No I18N
				useLazySelect2: true
			}));
		}
		
		defaultFilters.push(Ember.Object.create({
			key: "globalPeriod", //No I18N
			label: Ember.I18n.t("webclient.auditreport.period", this), //No I18N
			options: this.getTimePeriodOptions(),
			selectedValue: "",
			id: "dashboardFilter_globalPeriod"
		}));
		
		this.set("filterOptions", defaultFilters); //No I18N
	},
	
	loadGroupOptionsAsync: function() {
		if (this.get('_groupOptionsLoaded')) {
			return;
		}
		var filterOptions = this.get('filterOptions') || []; //No I18N
		var hasLazyFilter = filterOptions.some(function(f) { return f.useLazySelect2; });
		if (!hasLazyFilter) {
			return;
		}
		var self = this;
		opm_ajaxGetResponseWithMsg(
			window.OPM.apiUrlPattern + '/admin/listGroupsbasedType?groupType=devicesAndInterfacesAndGroups', //No I18N
			{}, '', //No I18N
			function(jsonData) {
				if (self.isDestroyed || self.isDestroying) { return; }
				var combined = [];
				if (jsonData && jsonData.error === undefined && jsonData.result === undefined && Object.keys(jsonData).length) {
					$.each(jsonData, function(key, value) {
						var sep = key.lastIndexOf('-'); //No I18N
						var id = (sep !== -1 && sep < key.length - 1) ? key.substring(sep + 1) : key;
						combined.push({ id: id, text: value });
					});
				}
				self.set('_groupOptionsLoaded', true); //No I18N
				Ember.run.next(self, function() {
					if (this.isDestroyed || this.isDestroying) { return; }
					var $groupEl = this.$('select.lazy-select2'); //No I18N
					$groupEl.select2({
						lazyLoadingClient: true,
						data: combined,
						placeholder: Ember.I18n.t('webclient.Select'), //No I18N
						allowClear: true
					});
					$groupEl.on('change', function() { //No I18N
						var val = $(this).val() || ''; //No I18N
						var filterOptions = self.get('filterOptions'); //No I18N
						for (var i = 0; i < filterOptions.length; i++) {
							if (filterOptions[i].get('key') === 'globalLogicalGroup') { //No I18N
								Ember.set(filterOptions[i], 'selectedValue', val); //No I18N
								break;
							}
						}
					});
				});
			}
		);
	},
	
	getTimePeriodOptions: function() {
		var dashboardType = OPMClient.HomeDetailsController.dashboardType;
		var dashboardName = OPMClient.HomeDetailsController.dashboardName;
		var opmOptions = [
			{label:Ember.I18n.t('webclient.fault.alarmlist.filter.onehour'),value:'onehour'},//No I18N
			{label:Ember.I18n.t('webclient.fault.alarmlist.filter.twohours'),value:'twohours'},//No I18N
			{label:Ember.I18n.t('webclient.fault.alarmlist.filter.fourhours'),value:'fourhours'},//No I18N
			{label:Ember.I18n.t('webclient.fault.alarmlist.filter.sixhours'),value:'sixhours'},//No I18N
			{label:Ember.I18n.t('webclient.fault.alarmlist.filter.eighthours'),value:'eighthours'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.last12hrs'),value:'twelvehours'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.last24hrs'),value:'twfourhours'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.today'),value:'Today',selected:true},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.yesterday'),value:'Yesterday'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.thisweek'),value:'thisweek'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.lastweek'),value:'lastweek'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.last7days'),value:'Last_7_Days'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.last30days'),value:'Last_30_Days'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.thismonth'),value:'thismonth'},//No I18N
			{label:Ember.I18n.t('webclient.reports.timeframe.lastmonth'),value:'Last_Month'}//No I18N
		];
		// System Performance: full OPM list; central view excludes last week and the last 3 long-range options
		if (dashboardName === 'dashboard.name.systemPerformancedashboard') {
			var isCentralView = window.OPM.isEECentralSelected || ncmIsCentral() || OPMClient.ApplicationController.isMSPCentralSelected;
			return isCentralView ? opmOptions.slice(0, -3).filter(function(o) { return o.value !== 'lastweek'; }) : opmOptions; //No I18N
		}
		// FWA: matched to EditWidgets fwaWidgetTimeWindow dropdown, using OPM value strings
		if (window.OPM.isFWA || dashboardType === "FWA") {
			return [
				{label:Ember.I18n.t('webclient.reports.timeframe.today'),value:'Today',selected:true},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.last24hrs'),value:'twfourhours'},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.last7days'),value:'Last_7_Days'},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.last30days'),value:'Last_30_Days'}//No I18N
			];
		}
		// NFA: matched to EditWidgets nfaWidgetTimeWindow dropdown, using OPM value strings
		// dashboardType 'NCM' exists in NFA product too — NCM dashboard falls through to full OPM list
		if((window.OPM.isNFA || dashboardType === "NFA") && dashboardType !== 'NCM') { //No I18N
			return [
				{label:Ember.I18n.t('webclient.fault.alarmlist.filter.onehour'),value:'onehour'},//No I18N
				{label:Ember.I18n.t('webclient.fault.alarmlist.filter.sixhours'),value:'sixhours'},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.last24hrs'),value:'twfourhours'},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.today'),value:'Today',selected:true},//No I18N
				{label:Ember.I18n.t('webclient.reports.timeframe.yesterday'),value:'Yesterday'}//No I18N
			];
		}
		return opmOptions;
	},
	
	actions: {
		applyFilter: function() {
			$(".OpMAlertMsg").remove(); //No I18N
			var selectedFilters = {};
			var filterOptions = this.get("filterOptions"); //No I18N
			
			if(!filterOptions) {
				return;
			}
			var atleastOneFilterSelected = false;
			for(var i = 0; i < filterOptions.length; i++) {
				var field = filterOptions[i];
				if(field.selectedValue) {
					atleastOneFilterSelected = true;
					break;
				}
			}
			
			if(!atleastOneFilterSelected) {
				opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.fwa.filter.delete.select")); //No I18N
				return;
			}

			for(var i = 0; i < filterOptions.length; i++) {
				var filter = filterOptions[i];
				var value = filter.get("selectedValue"); //No I18N
				if(value && value !== "") {
					selectedFilters[filter.get("key")] = value; //No I18N
				}
			}
			
			// Store global filter values for widgets to access (single source of truth)
			window.dashboardGlobalFilterValues = selectedFilters; //No I18N
			
			// Notify the controller directly about filter application
			var targetView = this.get('targetObject') || this.get('parentView');
			if(targetView && targetView.get && targetView.get('controller')) {
				targetView.get('controller').send("handleApplyFilter", selectedFilters); //No I18N
			}
		},
		
		resetFilter: function() {
			var self = this;
			var filterOptions = this.get("filterOptions"); //No I18N
			
			for(var i = 0; i < filterOptions.length; i++) {
				Ember.set(filterOptions[i], "selectedValue", ""); //No I18N
			}
			
			// Trigger UI update for select dropdowns
			Ember.run.next(this, function() {
				this.$('select.select2').not('.lazy-select2').select2(''); //No I18N
				this.$('select.lazy-select2').val(null).trigger('change'); //No I18N
			});
			
			window.dashboardGlobalFilterValues = null; //No I18N
			
			var targetView = this.get('targetObject') || this.get('parentView');
			if(targetView && targetView.get && targetView.get('controller')) {
				targetView.get('controller').send("handleResetFilter"); //No I18N
			}
		},
		
		closeFilter: function() {
			// Call the controller action directly
			var targetView = this.get('targetObject') || this.get('parentView');
			if(targetView && targetView.get && targetView.get('controller')) {
				targetView.get('controller').send("handleCloseFilter"); //No I18N
			}
		}
	},
	
	willDestroyElement: function(){
		var $lazyEl = this.$('select.lazy-select2'); //No I18N
		if ($lazyEl.length) {
			$lazyEl.off('change'); //No I18N
			if ($lazyEl.data('select2')) { //No I18N
				$lazyEl.select2('destroy'); //No I18N
			}
		}
	}
});

OPMClient.OpmDashboardArrayComponent = Ember.Component.extend({
	templateName: "components/opm-dashboard-array",//No I18N
	widgetsRenderedCount:0,
	dashboardLoader: false,
	lazyLoadScrollPercent: 75,
	lazyLoadSet: true,
	didInsertElement: function(){
		if(!this.get("widgetList")) {
			return;
		}
		var self = this;
		
		// Store current dashboard info in HomeDetailsController for comparison in willDestroyElement
		OPMClient.HomeDetailsController.loadedDashboardName = this.get('dashboardName') || OPMClient.HomeDetailsController.dashboardName || '';
		OPMClient.HomeDetailsController.loadedDashboardType = this.get('dashboardType') || OPMClient.HomeDetailsController.dashboardType || '';
		
		self.set("totalNoOfWidgets", self.get('widgetList').length); //No I18n
		var allWidgetsAlreadySaved = true;
		for (var i = 0; i < this.get("widgetList").length; i++) {
			if (!this.get("widgetList")[i].x  || !this.get("widgetList")[i].y) {
				allWidgetsAlreadySaved = false;
				break;
			}
		}
		this.set("allWidgetsAlreadySaved", allWidgetsAlreadySaved); //No I18n
		isChangeLayout = true;
		removeDashboardGridStack('#'+this.dashboardGridID);
		self.set("gridClass","grid-stack");//No I18N
		var options = {};
		var gridResize = window.OPM.userPermissions.dashboardWrite;
		var isCustomerViewSelected = window.OPM.isMSPCentral && window.OPM.selCustomerID != -1;
		if(isCustomerViewSelected || (window.OPM.isMSPCentral && window.OPM.mspUserType=="Customer" && OPMClient.HomeDetailsController.dashboardName == 'dashboard.name.mspdashboard') || (OPMClient.ApplicationController.isCentralServer && (["dashboard.name.nfaprobestats","NFADB.traffic","dashboard.name.nwconfig","dashboard.name.firewallsummary"].indexOf(OPMClient.HomeDetailsController.dashboardName)!==-1))){ //NO I18N
			gridResize = false;
		}
		if(gridResize){
			options = {column:self.totalCols,cellHeight:25,alwaysShowResizeHandle:false,animate:false,verticalMargin:10,draggable:{handle:'.opmGridTitle'},resizable:{handles:'e, se, s, sw, w'}};//No I18N
		}else{
			options = {column:self.totalCols,cellHeight:25,staticGrid:true,verticalMargin:10,animate:false};
		}
		var grid = GridStack.init(options,"#"+this.dashboardGridID);//No I18N
		self.set('widgetParamsList',[]);//No I18N
		self.set("graphWidgets",[]);//No I18N
		self.set("widgetIds",[]);//No I18N
		self.set("grid",grid);//No I18N
		if(self.widgetList!==undefined){
			var totalWidgets = self.widgetList.length;
			if(totalWidgets===0){
				$('.dashboardLoadingInfo').hide();//No I18N
			}
			self.set("totalWidgets",totalWidgets);//NO I18N
		}
		grid=null;

		/**********************************WIDGETS LOADING LOGIC********************************/
		//Initial Widgets Loading
		var initialWidgets = self.get('widgetList').splice(0,OPMClient.HomeDetailsController.dashboardLoadLimit);
		
		// Get global filter values from multiple sources
		var globalFilterValues = window.dashboardGlobalFilterValues;
		
		// Apply global filter values to initial widgets if available
		if(globalFilterValues) {
			for(var i = 0; i < initialWidgets.length; i++) {
				initialWidgets[i].filterValues = globalFilterValues;
			}
		}
		
		self.set('widgetParamsList', initialWidgets);//No I18N
		//LAZY LOADING FOR REST OF THE WIDGETS
		if(self.get("widgetList").length > 0) {
			var lazyLoadFunction = function() {
				self.currentWidgetsRendered = false;
				self.lazyLoadSet = false;
				var widgetsTobeLoaded = self.get('widgetList').splice(0,OPMClient.HomeDetailsController.dashboardLoadLimit);
				var gridRef = self.get("grid");
				
				// Get global filter values from multiple sources
				var globalFilterValues = window.dashboardGlobalFilterValues;
				
				for(var i =0; i < widgetsTobeLoaded.length; i ++) {
					var isCalcNeeded = widgetsTobeLoaded[i].x && widgetsTobeLoaded[i].y && !gridRef.isAreaEmpty(+widgetsTobeLoaded[i].x, +widgetsTobeLoaded[i].y); //If the widgets are rearranged manually, need to calculate the to be rendered next set of widgets.
					if(!widgetsTobeLoaded[i].x || !widgetsTobeLoaded[i].y || isCalcNeeded) {
						var keyWithLowestYValue = undefined;
						var lowestYValue = undefined;
						if(isCalcNeeded) {
							self.set("allWidgetsAlreadySaved", false); // Need to trigger save position again since calculation is happening again. //No I18n
							keyWithLowestYValue = widgetsTobeLoaded[i].x;
							lowestYValue = self.maxObj[keyWithLowestYValue].y;
						} else {
							for (var key in self.maxObj) {
								if(!keyWithLowestYValue) {
									keyWithLowestYValue = key;
									lowestYValue = self.maxObj[keyWithLowestYValue].y
								}
								if (self.maxObj.hasOwnProperty(key)) {
									if(self.maxObj[key].y < lowestYValue) {
										keyWithLowestYValue = key;
										lowestYValue = self.maxObj[key].y;
									}
								}
							}
						}
						widgetsTobeLoaded[i].x = keyWithLowestYValue;
						widgetsTobeLoaded[i].y = lowestYValue + self.maxObj[keyWithLowestYValue].h + 1;
					}
					var totalXOccupied = +widgetsTobeLoaded[i].x + +widgetsTobeLoaded[i].width;
					var xOffset = +widgetsTobeLoaded[i].x;
					while(xOffset < totalXOccupied) {
						self.maxObj[xOffset++] = {y: +(widgetsTobeLoaded[i].y), h: +(widgetsTobeLoaded[i].height), id: "li_" + widgetsTobeLoaded[i].id};
					}
					
					// Apply current filter values to lazy-loaded widgets
					if(globalFilterValues) {
						widgetsTobeLoaded[i].filterValues = globalFilterValues;
					}
				}
				self.get('widgetParamsList').pushObjects(widgetsTobeLoaded);//No I18N
				setTimeout(function() {
					Ember.run.schedule("afterRender", function() {//No I18N
						self.lazyLoadSet = true;
					})
				}, 1000) // This is to give slight buffer time so that there will be a delay to load next set of widgets.
			}
			var lazyLoadConditionFunction = function() {
				if((Math.ceil($("#dashboardScrollContainer").scrollTop()) + Math.ceil($("#dashboardScrollContainer").innerHeight())) >= (self.lazyLoadScrollPercent/100) * Math.ceil($("#dashboardScrollContainer")[0].scrollHeight)) {
					if(!self.currentWidgetsRendered || !self.lazyLoadSet) {
						return;
					}
					self.set("dashboardLoader", true); //No I18n
					lazyLoadFunction();
				}
			}
			setTimeout(function() {
				self.set("scheduleLoad", setInterval(function() { //No I18n
					lazyLoadConditionFunction();
				}, 500));
			}, 1000);
		}

        setTimeout(function () {
            $('.firmVulDashMenu').attr('style','width : 180px !important');//No I18N
        },100);
        if(OPMClient.NCMFirmwareVulnerability.isDashboard == true)
        {
            var timeDuration = {
                isDefault : true,
                selection : 'last_7_days'//No I18N
            };
            var TIME_DURATION = OPMClient.NCMFirmwareVulnerability.timeFilterClass(timeDuration);
            OPMClient.NCMFirmwareVulnerability.updateDashboardCount();
            $('.firmVulDashMenu .d_info').addClass('active');//No I18N
        }
        if(OPMClient.HomeDetailsController.SDNDash)
        {
        	self.set("SDNDetails",[]); //No I18n
			self.set("SDNDetails",this.getSDNInventoryDetails()); //No I18n			
        }
		setTimeout(function() {
			dragAndResizeEvents();
		})
    	//Setting sub-header when navigating different dashboard(s) and tab(s).
    	if(!OPMClient.ApplicationController.isNCM){//NCM having one more function call (setNCMSubHeaderActive) during navigating dashboard so it's excluded...
    		setDashboardSubTabHeader(self.dashName);
    	}
	},
	actions:{
		widgetsRenderedAction: function() {
			var self = this;
			this.widgetsRenderedCount++;
			if(this.widgetsRenderedCount >= this.get('widgetParamsList').length) {
				var max_xAttrs = Array.from($("#" + self.dashboardGridID).children(".grid-stack-item-content")).map(function(element) {
					return {x: $(element).attr("gs-x"), y: +$(element).attr("gs-y"), h: +$(element).attr("gs-h"), id: $(element).attr("id"), w: +$(element).attr("gs-w")};
				});
				self.maxObj = {}
        //To copy widget's total width to each of the x coordinate when more than 1
				var occupiedRemainingX = [];

				for(var i = 0; i < max_xAttrs.length; i++) {
					var totalXOccupied = +max_xAttrs[i].x + max_xAttrs[i].w;
					var xOffset = +max_xAttrs[i].x;
					while(xOffset < totalXOccupied) {
						occupiedRemainingX.push({x: xOffset++, y: +(max_xAttrs[i].y), h: +(max_xAttrs[i].h), id: "li_" + max_xAttrs[i].id});
					}
				}
				max_xAttrs = max_xAttrs.concat(occupiedRemainingX);
				for(var i =0; i < max_xAttrs.length; i ++) {
					if(!self.maxObj[max_xAttrs[i]] || self.maxObj[max_xAttrs[i]].y < max_xAttrs[i].y) {
						self.maxObj[max_xAttrs[i].x] = {y:max_xAttrs[i].y, h: max_xAttrs[i].h, id: max_xAttrs[i].id}
					}
				}
				self.currentWidgetsRendered = true;
				self.set("dashboardLoader", false); //No I18n
			}
			if(this.widgetsRenderedCount === this.get("totalNoOfWidgets")) {
				self.set("dashboardLoader", false); //No I18n
				if(this.get("scheduleLoad")) {
					clearTimeout(this.get("scheduleLoad"));
				}
				$('.dashboardLoadingInfo').hide();//No I18N
				isChangeLayout=true;
				if(!this.allWidgetsAlreadySaved && !$("body").hasClass("dashboardWidgetReArrangeSaveBtn")) {
					saveWidgetPosition(false);
				} 
			}
		}
	},
	getSDNInventoryDetails: function()
	{
		var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/v2/device/getSDNInventory'); //No I18n
		return jsonData;
	},
	willDestroyElement: function(){
		removeDashboardGridStack("#"+this.dashboardGridID);
		$('#'+this.elementId).find('*').remove();
		if(this.get("scheduleLoad")) {
			clearTimeout(this.get("scheduleLoad"));
		}
		
		// Only reset filter state when switching dashboards, not when refreshing same dashboard
		try {
			var homeController =  this.container.lookup('controller:Home');
			if(homeController) {			
				var previousDashboardName = OPMClient.HomeDetailsController.loadedDashboardName || '';
				var currentDashboardName = OPMClient.HomeDetailsController.dashboardName || '';
				
				// Only reset if switching to different dashboard (not refresh of same dashboard)
				var isDashboardSwitch = currentDashboardName !== previousDashboardName;
				
				if(isDashboardSwitch) {
					// Hide filter component (destroys it completely)
					homeController.set('showFilterComponent', false); //No I18N
					
					// Reset filter states
					homeController.set('isFilterVisible', false); //No I18N
					homeController.set('isFilterApplied', false); //No I18N  
					homeController.set('globalFilterValues', null); //No I18N
					
					// Clear global filter variables
					if(window.dashboardGlobalFilterValues) {
						window.dashboardGlobalFilterValues = null; //No I18N
					}
					
					// Remove filter CSS classes
					$('html').removeClass('dashboardFilterVisible'); //No I18N
					
					// Show filter component again after brief delay (recreates it with fresh state)
					Ember.run.later(function() {
						if(homeController && !homeController.get('isDestroyed')) {
							homeController.set('showFilterComponent', true); //No I18N
						}
					}, 100);
				}
			}
		} catch(e) {
		}
		
	}
});
OPMClient.OpmDashboardWidgetComponent = Ember.Component.extend({
	templateName: "components/opm-dashboard-widget",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetParams = self.widgetParams;
		if(!widgetParams.reloadWidget){
			self.grid.makeWidget('#'+widgetParams.gridStackId);//No I18N
		}
		var callBackFunc = function(jsonData) {
		    self.set('widgetAccess',true); //No I18N
			if(jsonData.error !== undefined || jsonData.result !== undefined)
			{
				var  unauthorizedError = ["UnAuthorized Widget", "UnAuthorized Filter", "UnAuthorized Devices"];//No I18N
				if(jsonData.error !== undefined && unauthorizedError.indexOf(jsonData.error.message) != -1){
					unauthorizedMessages = {
						"UnAuthorized Widget": "webclient.customwidget.unauthorizedWidget",//No I18N
						"UnAuthorized Filter": "webclient.dashboards.errorMsg.notauth",//No I18N
						"UnAuthorized Devices": "webclient.widgets.kpi.device.unauthorized"//No I18N
					};
					self.set('widgetAccess', false); //No I18N
					self.set('widgetLoading', false); //No I18N
					var widgetHolder = $('#widget_holder_'+widgetParams.id);
	                widgetHolder.find('i.icon-configedit').hide(); //No I18N
	                widgetHolder.find('i.icon-paste').hide(); //No I18N
	                widgetHolder.find('i.icon-configuration-file').hide(); //No I18N
	                widgetHolder.find('i.widget_expand').hide(); //No I18N
	                widgetHolder.find('i.widget_refresh').hide(); //No I18N
	                widgetParams.failureMsg=Ember.I18n.t(unauthorizedMessages[jsonData.error.message],this);
	                widgetParams.accessDenied=true;
					var childComponent = self.createChildView(OPMClient.OpmDashNoDataComponent,{widgetParams:widgetParams});
					childComponent.appendTo($('#widget'+widgetParams.id));
					$("#widget"+widgetParams.id).data("nodatacomp", true);
					Ember.run.schedule("afterRender", function() { //No I18n
						dashcallbackNew(widgetParams.id, self);
					});
				}
				else if(jsonData.error !== undefined && jsonData.error.message==="Access Denied"){
					self.set('widgetAccess', false); //No I18N
					self.set('widgetLoading', false); //No I18N
					var widgetHolder = $('#widget_holder_'+widgetParams.id);
	                widgetHolder.find('i.icon-configedit').hide(); //No I18N
	                widgetHolder.find('i.icon-paste').hide(); //No I18N
	                widgetHolder.find('i.icon-configuration-file').hide(); //No I18N
	                widgetHolder.find('i.widget_expand').hide(); //No I18N
	                widgetHolder.find('i.widget_refresh').hide(); //No I18N
	                widgetParams.failureMsg=Ember.I18n.t('webclient.customwidget.unaccessibleWidget',this);//No I18N
	                widgetParams.accessDenied=true;
					var childComponent = self.createChildView(OPMClient.OpmDashNoDataComponent,{widgetParams:widgetParams});
					childComponent.appendTo($('#widget'+widgetParams.id));
					$("#widget"+widgetParams.id).data("nodatacomp", true);
					Ember.run.schedule("afterRender", function() { //No I18n
						dashcallbackNew(widgetParams.id, self);
					});
				}else if((jsonData.result !== undefined && jsonData.result.message)) { //For widgets with no access due to the change in filter
					self.set('widgetAccess', true); //No I18N
					self.set('widgetLoading', false); //No I18N
					var widgetHolder = $('#widget_holder_'+widgetParams.id);
	                widgetHolder.find('i.icon-configedit').hide(); //No I18N
	                widgetHolder.find('i.icon-paste').hide(); //No I18N
					widgetHolder.find('i.widget_refresh').hide(); //No I18N
	                widgetParams.failureMsg=jsonData.result.message;
	                widgetParams.accessDenied=true;
					var childComponent = self.createChildView(OPMClient.OpmDashNoDataComponent,{widgetParams:widgetParams});
					childComponent.appendTo($('#widget'+widgetParams.id));
					OpmDashwidgetComponentArray[widgetParams.id]=childComponent;
					Ember.run.schedule("afterRender", function() { //No I18n
						$("#widget"+widgetParams.id).data("nodatacomp",true);
						dashcallbackNew(widgetParams.id, self);
					});
				}
				else{
			    self.set('widgetAccess', false); //No I18N
				self.set('widgetLoading', false); //No I18N
				self.set('errorMsg',jsonData.error.message); //No I18N
                $('#widget_holder_'+widgetParams.id).find('i.icon-configedit').hide(); //No I18N
                if(!window.OPM.userPermissions.dashboardWrite) {
             		$('#widget_holder_'+widgetParams.id).find('i.icon-trash').hide(); //No I18N
             	}
                $('#widget_holder_'+widgetParams.id).find('i.widget_expand').hide(); //No I18N
                $('#widget_holder_'+widgetParams.id).find('i.icon-paste').hide(); //No I18N
                $('#widget_holder_'+widgetParams.id).find('i.icon-configuration-file').hide(); //No I18N
				}
				return false;
		    }
			var jsonResponse = preModifyWidgetResponse(jsonData,this.currentWidget);
			
			if(jsonResponse!=undefined){
			  	this.currentWidget.apiData=jsonResponse;
				if(jsonResponse.WidgetType !== "Live"){
						this.currentWidget.apiRendered = true;
				}
			   /* if(jsonResponse.WidgetType === "customNetworkPath"){
					  jsonResponse.WidgetType = "NetworkPath";//No I18N
			   }*/
				for(var attrname in this.currentWidget) {
					widgetParams[attrname] = this.currentWidget[attrname]					
				}
				self.set('widgetParams.name', ''); //No I18n
				self.set('widgetParams.name', jsonResponse.WidgetName); //No I18n
 					//Once no access set it has to be reverted, else cause issue when refresh widget icon used
				self.set('widgetParams.accessDenied', false);//No I18n
			}				
			var childComponent;
			if((widgetParams.success && OPMClient['OpmDash'+widgetParams.apiData.WidgetType+'Component'] !== undefined) || widgetParams.apiData.WidgetType === "Live" || widgetParams.apiData.Name === "widget.apm.name.availabilityandhealthstatus") {
				childComponent = self.createChildView(OPMClient['OpmDash'+widgetParams.apiData.WidgetType+'Component'],{widgetParams:widgetParams,action:"childActions"}); //No I18N
				$("#widget"+widgetParams.id).data("nodatacomp", false);
			} else {
				childComponent = self.createChildView(OPMClient.OpmDashNoDataComponent,{widgetParams:widgetParams});
				$("#widget"+widgetParams.id).data("nodatacomp", true);
			}
			OpmDashwidgetComponentArray[widgetParams.id]=childComponent;
			if($('#widget'+widgetParams.id)!==undefined && $('#widget'+widgetParams.id).length>0){
				childComponent.appendTo($('#widget'+widgetParams.id)); 
				childComponent=null;
				$('#li_'+widgetParams.id).removeClass('ui-draggable-disabled ui-state-disabled ui-resizable-disabled');//No I18N
				Ember.run.schedule("afterRender", function() { //No I18n
					if($("#widget"+widgetParams.id + " span").hasClass("cctvNoDataWidget") ||  $("#widget_holder_"+widgetParams.id).data("nodatacomp")) { //Auto-inserting no data component to all widgets having NO DATA text inserted manually. //No I18n
						$("#widget"+widgetParams.id + " span[class='cctvNoDataWidget']").remove();//No I18n
						OpmDashwidgetComponentArray[widgetParams.id].destroy();
						childComponent = self.createChildView(OPMClient.OpmDashNoDataComponent,{widgetParams:widgetParams});
						OpmDashwidgetComponentArray[widgetParams.id] = childComponent;
						childComponent.appendTo($('#widget'+widgetParams.id)); 
						$("#widget"+widgetParams.id).data("nodatacomp", true);//No I18n
						if(widgetParams.widgetUniqueName==="webclient.zia.recommendations")//No I18N
						{
							$("#widget_holder_"+widgetParams.id+" .opmGridTitle").addClass("overflow-visible");//No I18n
							$("#widget_holder_"+widgetParams.id+" .opmGridTitle > div").addClass("overflow-visible");//No I18n
							$("#widget_holder_"+widgetParams.id+" #dashWidgetContent").css({'z-index':0});//No I18n
							$("#widget_holder_"+widgetParams.id+" .opm_widget_title .widget_name ").addClass("ziaHeader overflow-visible");//No I18n
						}
						childComponent = null;
					}
					if(widgetParams.type === "Tile" && widgetParams.apiData && widgetParams.apiData.WidgetAdditionalData && !($('#li_'+widgetParams.id).hasClass("dashboardWidgetExpandView") && cpWidgets.includes(widgetParams.widgetUniqueName))) { //No I18N
						// Text Color Change
						if(!widgetParams.apiData.WidgetAdditionalData.bgColor) {
							widgetParams.apiData.WidgetAdditionalData.bgColor = "FFFFFF"; //No I18N
						}
						addVariableCssTileWidget('#li_'+widgetParams.id + " .tile-widget", widgetParams.apiData.WidgetAdditionalData.bgColor); // No I18N
					}
					if(widgetParams.apiData.isKPIWidget !== undefined){
                        self.isKPIWidget = "true";
                    }
					dashcallbackNew(widgetParams.id, self);
				});
			}
			if(widgetParams.reloadWidget){
				widgetParams.reloadWidget=false;
			}
			$('#widgetSpinner_'+widgetParams.id).hide();
			self.set('widgetLoading', false); //No I18N
		};
		self.set('widgetLoading', true); //No I18N
		self.set('widgetSpinnerID', 'widgetSpinner_'+widgetParams.id); //No I18N
		setTimeout(function() {
			dashboardWidgetSuccessCall(widgetParams,self,callBackFunc);
		}, 200)
	},
	actions:{
		childActions: function(functionName){
			if(functionName==="reload"){
				this.widgetParams.reloadWidget=true;
				var widgetIndex = this.widgetParams.id;
			  	if(OpmDashwidgetComponentArray[widgetIndex]!==undefined && OpmDashwidgetComponentArray[widgetIndex]!==null){
			  		if(this.widgetParams.type != 'Live')
			  		{
			  			OpmDashwidgetComponentArray[widgetIndex].destroy();
				  		OpmDashwidgetComponentArray[widgetIndex]=null;
			  		}
				 	this.rerender();
			  	}
				else {
					// Component already destroyed or not initialized, just rerender
					this.rerender();
				}
			}
		}
	},
	reloadTriggerObserver: function(){
		this.widgetParams.reloadTrigger=false;
		this.widgetParams.reloadWidget=true;
		this.send('childActions', 'reload'); // No I18N
	}.observes('widgetParams.reloadTrigger'),//No I18N
	willDestroyElement: function(){
		var widgetIndex = this.widgetParams.id;
	  	if(OpmDashwidgetComponentArray[widgetIndex]!==undefined && OpmDashwidgetComponentArray[widgetIndex]!==null){
	  					  		if(this.widgetParams.type != 'Live')
	  					  		{
	  					  			OpmDashwidgetComponentArray[widgetIndex].destroy();
		  							OpmDashwidgetComponentArray[widgetIndex]=null;
		  							delete OpmDashwidgetComponentArray[widgetIndex];
		  									$('#'+this.elementId).find('*').remove();

	  					  		}
		  	
	  	}
	}
});
OPMClient.OpmDashNoDataComponent = Ember.Component.extend({
	templateName: "components/opm-dash-no-data",//No I18N
	didInsertElement: function(){
		var dispErrMsg = (this.widgetParams && this.widgetParams.failureMsg!=undefined)?this.widgetParams.failureMsg:Ember.I18n.t("webclient.reports.view.nodata",this);//No I18N
		if(this.widgetParams) {
			this.set('widgetParams.failureMsg',dispErrMsg);//No I18N
		}
		this.set("isCompactView", window.OPM.dashboardViewType === "compact"); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashTileSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-dash-tilesummary",//No I18N
	groupName: "",//No I18N
	totalCount: 0,
	totalTooltip: "",//No I18N
	statusBadges: null,
	severityBadges: null,
	gridDiv: null,
	tableID: null,
	pagerID: null,
	tileSummaryContentId: null,
	_activeFilter: null,
	filterLabel: "",//No I18N
	isSeverityPresent: true,
	logicalGroupType: "",//No I18N
	alarmSeverityIconMap: {
		1: "/apiclient/fluidicv2/img/sprite-opm.svg#status-1", //No I18N
		2: "/apiclient/fluidicv2/img/sprite-opm.svg#status-2", //No I18N
		3: "/apiclient/fluidicv2/img/sprite-opm.svg#status-3", //No I18N
		4: "/apiclient/fluidicv2/img/sprite-opm.svg#status-4", //No I18N
		5: "/apiclient/fluidicv2/img/sprite-opm.svg#status-5", //No I18N
		6: "/apiclient/fluidicv2/img/sprite-opm.svg#status-6" //No I18N
	},
	alarmSeverityCssMap: {
		1: "critical", //No I18N
		2: "trouble", //No I18N
		3: "attention", //No I18N
		4: "servicedown", //No I18N
		5: "clear", //No I18N
		6: "info" //No I18N
	},

	didInsertElement: function(){
		var apiData = this.widgetParams.apiData;
		var widgetData = apiData.WidgetData;
		var totalCount = widgetData.totalCount || 0;
		var availability = widgetData.availability || 0;
		var upCount = totalCount - availability;
		var widgetID = this.widgetParams.gridStackId;
		var gridDiv = widgetID + "_gridDiv"; //No I18N
		var tableID = widgetID + "_table"; //No I18N
		var pagerID = widgetID + "_pager"; //No I18N
		var tileSummaryContentId = widgetID + "_tileSummaryContent"; //No I18N

		this.set("gridDiv", gridDiv); //No I18N
		this.set("tableID", tableID); //No I18N
		this.set("pagerID", pagerID); //No I18N
		this.set("tileSummaryContentId", tileSummaryContentId); //No I18N
		this.set("_activeFilter", null); //No I18N

		$("#" + this.widgetParams.gridStackId).addClass("entityCount"); //No I18N

		var additionalData = apiData.WidgetAdditionalData || {};
		var isSeverityPresent = additionalData.isSeverityPresent !== false;
		this.set('isSeverityPresent', isSeverityPresent); //No I18N
		this.set('logicalGroupType', additionalData.logicalGroupType || ''); //No I18N
		this.set('widgetName', apiData.WidgetName || ''); //No I18N
		this.set('groupName', additionalData.logicalGroupName || ''); //No I18N
		this.set('groupDisplayLabel', additionalData.groupDisplayName || additionalData.logicalGroupName || ''); //No I18N
		this.set('logicalGroupId', additionalData.logicalGroupId || ''); //No I18N
		this.set('totalCount', totalCount); //No I18N
		this.set('totalTooltip', Ember.I18n.t("webclient.map.totaldevices") + ": " + totalCount); //No I18N

		// Build status badges from availability data
		var statusBadges = [];
		if (!isSeverityPresent || upCount > 0) {
			statusBadges.push({
				count: upCount,
				cssClass: "up", //No I18N
				iconHref: "/apiclient/fluidicv2/img/sprite-opm.svg#status-up", //No I18N
				tooltip: Ember.I18n.t("webclient.devices.intftypes.up") + ": " + upCount, //No I18N
				filterParams: { state: "1" }, //No I18N
				filterKey: "up" //No I18N
			});
		}
		if (!isSeverityPresent || availability > 0) {
			statusBadges.push({
				count: availability,
				cssClass: "down", //No I18N
				iconHref: "/apiclient/fluidicv2/img/sprite-opm.svg#status-down", //No I18N
				tooltip: Ember.I18n.t("webclient.devices.intftypes.down") + ": " + availability, //No I18N
				filterParams: { state: "2" }, //No I18N
				filterKey: "down" //No I18N
			});
		}
		this.set('statusBadges', statusBadges); //No I18N

		// Build severity badges from alarms array
		var severityBadges = [];
		var iconMap = this.get('alarmSeverityIconMap'); //No I18N
		var cssMap = this.get('alarmSeverityCssMap'); //No I18N
		var severityI18nMap = {
			1: Ember.I18n.t("webclient.map.view.critical"), //No I18N
			2: Ember.I18n.t("webclient.admin.threshold.Trouble"), //No I18N
			3: Ember.I18n.t("webclient.map.view.attention") //No I18N
		};
		var severityFilterMap = { 1: "1", 2: "2", 3: "3" }; //No I18N
		if (widgetData.alarms && widgetData.alarms.length > 0) {
			for (var i = 0; i < widgetData.alarms.length; i++) {
				var alarm = widgetData.alarms[i];
				var label = severityI18nMap[alarm.status] || alarm.text;
				severityBadges.push({
					count: alarm.count,
					cssClass: cssMap[alarm.status] || "info", //No I18N
					iconHref: iconMap[alarm.status] || iconMap[1],
					tooltip: label + ": " + alarm.count, //No I18N
					filterParams: severityFilterMap[alarm.status] ? { severity: severityFilterMap[alarm.status] } : {},
					filterKey: "severity_" + alarm.status //No I18N
				});
			}
		}
		this.set('severityBadges', severityBadges); //No I18N
		$("#widget_holder_" + this.widgetParams.id).addClass("tile-widget"); //No I18N

		var self = this;
		Ember.run.schedule("afterRender", function() { //No I18N
			$("#" + gridDiv).hide(); //No I18N
			// Wire the expand icon to behave like totalClicked
			var widgetId = self.widgetParams.id;
			$("#widget_holder_" + widgetId + " i.widget_expand").off("click.tileSummaryExpand").on("click.tileSummaryExpand", function(e) { //No I18N
				e.stopPropagation();
				var activeFilter = self.get('_activeFilter'); //No I18N
				if (activeFilter !== null) {
					// Something is already expanded — collapse it
					self._loadDeviceGrid({}, activeFilter, self.get('filterLabel')); //No I18N
				} else {
					var totalLabelKey = self.get('logicalGroupType') === 'Interfaces' ? 'webclient.devices.details.intf' : 'webclient.map.totaldevices'; //No I18N
					var label = Ember.I18n.t(totalLabelKey) + " - " + self.get('totalCount'); //No I18N
					self._loadDeviceGrid({}, "total", label); //No I18N
				}
			});
		});
	},
	_loadDeviceGrid: function(filterParams, filterKey, filterLabel) {
		// Delegate to interface grid when the widget's group type is Interfaces
    	if (this.get('logicalGroupType') === 'Interface(s)') { //No I18N
   			this._loadInterfaceGrid(filterParams, filterKey, filterLabel);
   			return;
   		}
		var self = this;
		var activeFilter = this.get('_activeFilter'); //No I18N
		var gridDiv = this.get('gridDiv'); //No I18N
		var tableID = this.get('tableID'); //No I18N
		var pagerID = this.get('pagerID'); //No I18N
		var tileSummaryContentId = this.get('tileSummaryContentId'); //No I18N
		var widgetID = this.widgetParams.gridStackId;
		var widgetId = this.widgetParams.id;

		// Toggle off if same filter clicked again
		if (activeFilter === filterKey) {
			this.set('_activeFilter', null); //No I18N
			this.set('filterLabel', ""); //No I18N
			$("#" + gridDiv).hide(); //No I18N
			$("#" + tileSummaryContentId).show(); //No I18N
			var widgetLiSelector = $("#li_" + widgetId); //No I18N
			if (widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
				widgetLiSelector.removeClass("dashboardWidgetExpandView"); //No I18N
				$("body").removeClass("widgetExpandView_temp"); //No I18N
			}
			// Restore original heights and hide title
			var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
			widgetHolder.css("height", ""); //No I18N
			widgetHolder.find(".content").css({"height": "", "overflow": ""}); //No I18N
			widgetHolder.find(".opm_widget_title, .widget_name").css("display", ""); //No I18N
			widgetHolder.css("overflow", ""); //No I18N
			widgetHolder.addClass("tile-widget"); //No I18N
			dashcallbackNew(widgetID);
			return;
		}

		this.set('_activeFilter', filterKey); //No I18N
		this.set('filterLabel', filterLabel || ""); //No I18N

		var groupName = this.get('groupName'); //No I18N
		var params = $.extend({}, filterParams);
		if (groupName) {
			params.groupName = groupName;
		}
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/v2/device/listDevices', params); //No I18N
		var deviceData = (response && response.rows) ? response.rows : (Array.isArray(response) ? response : []);

		var colNamesList = [Ember.I18n.t("webclient.devices.details.devicename"), Ember.I18n.t("webclient.devices.details.ipaddress"), Ember.I18n.t("webclient.admin.devices.DeviceType"), ""]; //No I18N
		var colModelList = [
			{ name: "displayName", index: "displayName", formatter: function(cellValue, options, rowdata) { //No I18N
				if (rowdata.deviceName) {
					return "<a onclick='redirectToDeviceSnapshot(\"" + escapeHtmlTags(rowdata.deviceName) + "\")' class='textBlue' style='cursor:pointer'>" + escapeHTML(cellValue) + "</a>"; //No I18N
				}
				return escapeHTML(cellValue);
			}},
			{ name: "ipaddress", index: "ipaddress", formatter: cellValueEscapeFormat }, //No I18N
			{ name: "type", index: "type", formatter: cellValueEscapeFormat }, //No I18N
			{ name: "deviceName", index: "deviceName", hidden: true, sortable: false } //No I18N
		];

		// Expand the widget before showing the grid
		var widgetLiSelector = $("#li_" + widgetId); //No I18N
		if (!widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
			widgetLiSelector.addClass("dashboardWidgetExpandView"); //No I18N
			$("body").addClass("widgetExpandView_temp"); //No I18N
		}

		// Fix heights for expanded view
		var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
		widgetHolder.css("height", "100%"); //No I18N
		widgetHolder.find(".content").css("height", "calc(100% - 40px)"); //No I18N
		widgetHolder.removeClass("tile-widget"); //No I18N

		// Override tile-widget CSS display:none on title elements
		widgetHolder.find(".opm_widget_title, .widget_name").css("display", "block"); //No I18N
		var titleText = this.get('groupDisplayLabel') || this.get('widgetName'); //No I18N
		widgetHolder.find(".widget_name").text(titleText); //No I18N

		$("#" + tileSummaryContentId).hide(); //No I18N
		$("#" + gridDiv).show(); //No I18N

		Ember.run.schedule("afterRender", function() { //No I18N
			if ($("#" + tableID)[0] && $("#" + tableID)[0].grid) { //No I18N
				$("#" + tableID).jqGrid('GridUnload'); //No I18N
			}
			opm_loadJQgridWithData("#" + tableID, deviceData, colNamesList, colModelList, "", "#" + pagerID); //No I18N
			var gridContainer = $("#" + tableID).closest('.opm_jqGridUI'); //No I18N
			gridContainer.css('width', '100%'); //No I18N
			$("#" + tableID).jqGrid('setGridWidth', gridContainer.width() - 30); //No I18N
			dashcallbackNew(widgetID);
		});
	},

	_loadInterfaceGrid: function(filterParams, filterKey, filterLabel) {
		var self = this;
		var activeFilter = this.get('_activeFilter'); //No I18N
		var gridDiv = this.get('gridDiv'); //No I18N
		var tableID = this.get('tableID'); //No I18N
		var pagerID = this.get('pagerID'); //No I18N
		var tileSummaryContentId = this.get('tileSummaryContentId'); //No I18N
		var widgetID = this.widgetParams.gridStackId;
		var widgetId = this.widgetParams.id;

		// Toggle off if same filter clicked again
		if (activeFilter === filterKey) {
			this.set('_activeFilter', null); //No I18N
			this.set('filterLabel', ""); //No I18N
			$("#" + gridDiv).hide(); //No I18N
			$("#" + tileSummaryContentId).show(); //No I18N
			var widgetLiSelector = $("#li_" + widgetId); //No I18N
			if (widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
				widgetLiSelector.removeClass("dashboardWidgetExpandView"); //No I18N
				$("body").removeClass("widgetExpandView_temp"); //No I18N
			}
			var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
			widgetHolder.css("height", ""); //No I18N
			widgetHolder.find(".content").css({"height": "", "overflow": ""}); //No I18N
			widgetHolder.find(".opm_widget_title, .widget_name").css("display", ""); //No I18N
			widgetHolder.css("overflow", ""); //No I18N
			widgetHolder.addClass("tile-widget"); //No I18N
			dashcallbackNew(widgetID);
			return;
		}

		this.set('_activeFilter', filterKey); //No I18N
		this.set('filterLabel', filterLabel || ""); //No I18N

		var groupName = this.get('groupName'); //No I18N
		var logicalGroupId = this.get('logicalGroupId'); //No I18N
		var params = $.extend({}, filterParams, { isFluidic: true, sortByColumn: 'interfaceDisplayName', rows: 100, page: 1 }); //No I18N
		if (logicalGroupId) {
			params.intfGroupID = logicalGroupId;
		} else if (groupName) {
			params.groupName = groupName;
		}
		// state cannot be sent directly — convert to jqGrid search filter on stateNum
		if (params.state !== undefined) {
			params.filters = JSON.stringify({ groupOp: "AND", rules: [{ field: "stateNum", op: "eq", data: params.state }] }); //No I18N
			delete params.state;
		}
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/listInterfaces', params); //No I18N
		var intfData = (response && response.rows) ? response.rows : (Array.isArray(response) ? response : []);

		var colNamesList = [
			Ember.I18n.t('webclient.devices.properties.DisplayName'), //No I18N
			Ember.I18n.t('webclient.devices.details.devicename'), //No I18N
			Ember.I18n.t('webclient.topo.ipAddress'), //No I18N
			Ember.I18n.t('webclient.devices.details.type'), //No I18N
			"", "" //No I18N
		];
		var colModelList = [
			{ name: 'interfaceDisplayName', index: 'interfaceDisplayName', formatter: function(cellValue, options, rowdata) { //No I18N
				if (rowdata.interfaceName) {
					return "<a onclick='redirectToInterfSnapshot(\"" + escapeHtmlTags(rowdata.interfaceName) + "\")' class='textBlue' style='cursor:pointer'>" + escapeHtmlTags(cellValue) + "</a>"; //No I18N
				}
				return escapeHtmlTags(cellValue);
			}},
			{ name: 'displayName', index: 'displayName', formatter: function(cellValue, options, rowdata) { //No I18N
				if (rowdata.deviceName) {
					return "<a onclick='redirectToDeviceSnapshot(\"" + escapeHtmlTags(rowdata.deviceName) + "\")' class='textBlue' style='cursor:pointer'>" + escapeHtmlTags(cellValue) + "</a>"; //No I18N
				}
				return escapeHtmlTags(cellValue);
			}},
			{ name: 'ipAddress', index: 'ipAddress', formatter: cellValueEscapeFormat }, //No I18N
			{ name: 'type', index: 'type', formatter: cellValueEscapeFormat }, //No I18N
			{ name: 'interfaceName', index: 'interfaceName', hidden: true, sortable: false }, //No I18N
			{ name: 'deviceName', index: 'deviceName', hidden: true, sortable: false } //No I18N
		];

		var widgetLiSelector = $("#li_" + widgetId); //No I18N
		if (!widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
			widgetLiSelector.addClass("dashboardWidgetExpandView"); //No I18N
			$("body").addClass("widgetExpandView_temp"); //No I18N
		}

		var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
		widgetHolder.css("height", "100%"); //No I18N
		widgetHolder.find(".content").css("height", "calc(100% - 40px)"); //No I18N
		widgetHolder.removeClass("tile-widget"); //No I18N
		widgetHolder.find(".opm_widget_title, .widget_name").css("display", "block"); //No I18N
		var titleText = this.get('groupDisplayLabel') || this.get('widgetName'); //No I18N
		widgetHolder.find(".widget_name").text(titleText); //No I18N

		$("#" + tileSummaryContentId).hide(); //No I18N
		$("#" + gridDiv).show(); //No I18N

		Ember.run.schedule("afterRender", function() { //No I18N
			if ($("#" + tableID)[0] && $("#" + tableID)[0].grid) { //No I18N
				$("#" + tableID).jqGrid('GridUnload'); //No I18N
			}
			opm_loadJQgridWithData("#" + tableID, intfData, colNamesList, colModelList, "", "#" + pagerID); //No I18N
			var gridContainer = $("#" + tableID).closest('.opm_jqGridUI'); //No I18N
			gridContainer.css('width', '100%'); //No I18N
			$("#" + tableID).jqGrid('setGridWidth', gridContainer.width() - 30); //No I18N
			dashcallbackNew(widgetID);
		});
	},
	loadAlarmsGrid: function(filterParams, filterKey, filterLabel) {
		var activeFilter = this.get('_activeFilter'); //No I18N
		var gridDiv = this.get('gridDiv'); //No I18N
		var tableID = this.get('tableID'); //No I18N
		var pagerID = this.get('pagerID'); //No I18N
		var tileSummaryContentId = this.get('tileSummaryContentId'); //No I18N
		var widgetID = this.widgetParams.gridStackId;
		var widgetId = this.widgetParams.id;

		// Toggle off if same filter clicked again
		if (activeFilter === filterKey) {
			this.set('_activeFilter', null); //No I18N
			this.set('filterLabel', ""); //No I18N
			$("#" + gridDiv).hide(); //No I18N
			$("#" + tileSummaryContentId).show(); //No I18N
			var widgetLiSelector = $("#li_" + widgetId); //No I18N
			if (widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
				widgetLiSelector.removeClass("dashboardWidgetExpandView"); //No I18N
				$("body").removeClass("widgetExpandView_temp"); //No I18N
			}
			var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
			widgetHolder.css("height", ""); //No I18N
			widgetHolder.find(".content").css({"height": "", "overflow": ""}); //No I18N
			widgetHolder.find(".opm_widget_title, .widget_name").css("display", ""); //No I18N
			widgetHolder.css("overflow", ""); //No I18N
			widgetHolder.addClass("tile-widget"); //No I18N
			dashcallbackNew(widgetID);
			return;
		}

		this.set('_activeFilter', filterKey); //No I18N
		this.set('filterLabel', filterLabel || ""); //No I18N

		var alarmListUrl = window.OPM.apiUrlPattern + '/alarm/listAlarms?isFluidic=true&isWebclient=true'; //No I18N
		var response = opm_ajaxGetResponse(alarmListUrl, filterParams || {});
		var alarmData = (response && response.rows) ? response.rows : (Array.isArray(response) ? response : []);

		var colNamesList = [Ember.I18n.t('webclient.fault.event.text', this), Ember.I18n.t('webclient.fault.details.properties.source', this), Ember.I18n.t('webclient.fault.alarm.category', this), Ember.I18n.t('webclient.fault.details.properties.severity', this), Ember.I18n.t('webclient.fault.details.properties.modttime', this), "", "", "", "", "", ""]; //No I18N
		var colModelList = [
			{ name: 'message', index: 'message', classes: "cursorPointer", formatter: function(cellValue, options, rowdata) { //No I18N
				if (rowdata.alarmId) {
					return "<a onclick='redirectToAlarm(\"" + rowdata.alarmId + "\")' class='textBlue' style='cursor:pointer'>" + escapeHtmlTags(cellValue) + "</a>"; //No I18N
				}
				return escapeHtmlTags(cellValue);
			}},
			{ name: 'displayName', index: 'displayName', hidden: false, classes: "cursorPointer", formatter: function(cellValue, options, rowdata) { //No I18N
				if (rowdata.deviceName) {
					return "<a onclick='redirectToDeviceSnapshot(\"" + escapeHtmlTags(rowdata.deviceName) + "\")' class='textBlue' style='cursor:pointer'>" + escapeHtmlTags(cellValue) + "</a>"; //No I18N
				}
				return escapeHtmlTags(cellValue);
			}},
			{ name: 'category', index: 'category', hidden: false, classes: "cursorPointer", formatter: escapeHtmlTags }, //No I18N
			{ name: 'statusStr', index: 'statusStr', hidden: false, classes: "cursorPointer", formatter: severityMSg, sorttype: function(cellValue, rowData) { return parseInt(rowData.statusNum, 10) || 0; } }, //No I18N
			{ name: 'modTime', index: 'modTime', hidden: false, search: false, classes: "cursorPointer", formatter: cellValueEscapeFormat, sorttype: function(cellValue, rowData) { return rowData.modTimeLong; } }, //No I18N
			{ name: 'statusNum', index: 'statusNum', hidden: true, hidedlg: true }, //No I18N
			{ name: 'modTimeLong', index: 'modTimeLong', hidden: true, hidedlg: true }, //No I18N
			{ name: 'eventtype', index: 'eventtype', hidden: true, hidedlg: true, formatter: escapeHtmlTags }, //No I18N
			{ name: 'alarmId', index: 'alarmId', hidden: true, hidedlg: true }, //No I18N
			{ name: 'deviceName', index: 'deviceName', hidden: true, hidedlg: true, formatter: escapeHtmlTags }, //No I18N
			{ name: 'entity', index: 'entity', hidden: true, hidedlg: true, formatter: escapeHtmlTags } //No I18N
		];

		var widgetLiSelector = $("#li_" + widgetId); //No I18N
		if (!widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
			widgetLiSelector.addClass("dashboardWidgetExpandView"); //No I18N
			$("body").addClass("widgetExpandView_temp"); //No I18N
		}

		var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
		widgetHolder.css("height", "100%"); //No I18N
		widgetHolder.find(".content").css("height", "calc(100% - 40px)"); //No I18N
		widgetHolder.removeClass("tile-widget"); //No I18N

		widgetHolder.find(".opm_widget_title, .widget_name").css("display", "block"); //No I18N
		var titleText = this.get('groupDisplayLabel') || this.get('widgetName'); //No I18N
		widgetHolder.find(".widget_name").text(titleText); //No I18N

		$("#" + tileSummaryContentId).hide(); //No I18N
		$("#" + gridDiv).show(); //No I18N

		Ember.run.schedule("afterRender", function() { //No I18N
			if ($("#" + tableID)[0] && $("#" + tableID)[0].grid) { //No I18N
				$("#" + tableID).jqGrid('GridUnload'); //No I18N
			}
			opm_loadJQgridWithData("#" + tableID, alarmData, colNamesList, colModelList, "", "#" + pagerID); //No I18N
			var gridContainer = $("#" + tableID).closest('.opm_jqGridUI'); //No I18N
			gridContainer.css('width', '100%'); //No I18N
			$("#" + tableID).jqGrid('setGridWidth', gridContainer.width() - 30); //No I18N
			dashcallbackNew(widgetID);
		});
	},
	actions: {
		totalClicked: function(groupName) {
			var isIntf = this.get('logicalGroupType') === 'Interface(s)'; //No I18N
			var labelText = isIntf ? Ember.I18n.t('opu.views.TOTAL') + " " + Ember.I18n.t('webclient.devices.details.intf') : Ember.I18n.t('webclient.map.totaldevices'); //No I18N
			var label = labelText + " - " + this.get('totalCount'); //No I18N
			this._loadDeviceGrid({}, "total", label); //No I18N
		},
		alarmBadgeClicked: function(badge) {
			var alarmParams = $.extend({}, (badge && badge.filterParams) ? badge.filterParams : {});
			// Use the stored logicalGroupId property (set in didInsertElement, same pattern as groupName for device grid)
			var logicalGroupId = this.get('logicalGroupId') || ""; //No I18N
			if (logicalGroupId !== "") {
				alarmParams.groupID = logicalGroupId;
			}
			this.loadAlarmsGrid(alarmParams, "alarm_" + (badge.filterKey || "unknown"), badge.tooltip || ""); //No I18N
		},
		badgeClicked: function(badge) {
			this._loadDeviceGrid(badge.filterParams || {}, badge.filterKey || "unknown", badge.tooltip || ""); //No I18N
		}

	},
	willDestroyElement: function(){
		$("#widget_holder_" + this.widgetParams.id + " i.widget_expand").off("click.tileSummaryExpand"); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashboardTitleComponent = Ember.Component.extend({
	templateName: "components/opm-dashboard-title",//No I18N
	classNames:['opm_widget_header'],
	//showHeaderTitle:true,
	didInsertElement: function(){
        $('.firmVulDashMenu').css('width','250px');//No I18N
		var self = this;
		var widgetParams = self.widgetParams;
		var subTitleClass = 'wid_subTitle';//No I18N
		if(widgetParams.nfaSubLink || widgetParams.fwaSubLink){
			subTitleClass = 'wid_subTitle linkTo';//No I18N
		}
		self.set('subTitleClass',subTitleClass);//No I18N
		if(window.OPM.isMSPCentral || window.OPM.userPermissions.intfGroupRestricted)
		{
			self.set('hideEmbedOption',true);	 //No I18N
		}
		if(window.isserver || widgetParams.widgetUniqueName==="widget.name.monitorView" || widgetParams.widgetUniqueName==="widget.name.interfaceView" || widgetParams.widgetUniqueName==="widget.name.liverecentalarms")
		{
			self.set('isEmbedOptionDisabled',true);	 //No I18N
		}		
		//self.set('widgetParams.isDeleteActionAllowed',true);//No I18N
		self.set('widgetParams.isDuplicateActionAllowed',true);//No I18N
		if(widgetParams.type==="CustomGraph" || widgetParams.type==="customInterface" || !self.isEditDashboard || (widgetParams.widgetUniqueName==="webclient.zia.recommendations" && self.isDefaultDashboard)) {//No I18N
			self.set('widgetParams.isDuplicateActionAllowed',false); //No I18N 
		}
		if(widgetParams.widgetUniqueName==="widget.apm.name.heatmap" || widgetParams.widgetUniqueName==="widget.apm.name.monitorstatus")//No I18N
		{
			if(widgetParams.apiData!==undefined && widgetParams.apiData.WidgetAdditionalData!==undefined)
			{
				var monitorStatus = (widgetParams.apiData.WidgetAdditionalData.apmMonitorType==="availability")?Ember.I18n.t("webclient.apm.widgets.availabilitymonitors",this):Ember.I18n.t("webclient.apm.widgets.healthmonitors",this);//No I18N
				$("#"+widgetParams.widgetHolderId+" .wid_subTitle").text(monitorStatus);//No I18N
			}
		}
		if(widgetParams.widgetUniqueName==="widget.name.overndisk")//No I18N
		{
			$("#"+widgetParams.widgetHolderId+" .wid_subTitle").text(Ember.I18n.t('widget.name.overndisk.desc',this));//No I18N
		}
		if(widgetParams.widgetUniqueName==="widget.name.cpw.topn")//No I18N
		{
			if(widgetParams.apiData!==undefined && widgetParams.apiData.WidgetAdditionalData!==undefined)
			{
				var cpwAddl = widgetParams.apiData.WidgetAdditionalData;
				var cpwValidPeriod = opmEnhancedGraphPeriods.filter(function(obj) { return obj.period === cpwAddl.tileFooter; })[0];
				var cpwPeriodText = cpwValidPeriod ? cpwValidPeriod.title : cpwAddl.tileFooter;
				var cpwSubTitle = [cpwPeriodText, cpwAddl.ruleName].filter(Boolean).join(" - ");//No I18N
				$("#"+widgetParams.widgetHolderId+" .wid_subTitle").text(cpwSubTitle);//No I18N
			}
		}
		// For Custom Widgets
		if(widgetParams.apiData!==undefined && widgetParams.apiData.CustomWidget===true) {
		     var widgetHolder = $('#widget_holder_'+widgetParams.id);
			 widgetHolder.find('i.icon-paste').hide(); //No I18N
			var isAdvancedWidget = widgetParams.apiData.GridWidget!==undefined && widgetParams.apiData.GridWidget.datasourceName === "Advanced Widget";
             if(isAdvancedWidget && widgetParams.apiData.GridWidget.isEdit!==true){
                widgetHolder.find('i.icon-configedit').hide(); //No I18N
             }
            if(widgetParams.apiData.WidgetType==="Tile") {
                widgetHolder.find('i.widget_expand').hide(); //No I18N
            }
        }
        // For KPI Tile Widget
        if(widgetParams.apiData!==undefined && widgetParams.apiData.isKPIWidget===true && widgetParams.apiData.isTileView===true) {
            self.set('widgetParams.isDuplicateActionAllowed',true);//No I18N
            self.set('isHideExpandIcon', true);//No I18N
        }
		self.set('isRealtimeWidget',OPMClient.HomeDetailsController.realtimeWidgetProps.realTimeWidgetUniqueNames.contains(widgetParams.widgetUniqueName));//No I18N
		if(widgetParams.apiData && widgetParams.apiData.WidgetAdditionalData && widgetParams.apiData.WidgetAdditionalData.allowEditDelete === false) {
			self.set("isHideEditCustomWidget", true); //No I18n
			self.set("isHideDeleteWidget", true); //No I18n
			self.set("widgetParams.isDuplicateActionAllowed", false); //No I18n
		}

		if(widgetParams.apiData!==undefined && widgetParams.apiData.WidgetAdditionalData!==undefined && widgetParams.apiData.WidgetAdditionalData.viewLogs === true) {
				var widgetHolder = $('#widget_holder_'+widgetParams.id);
			 	widgetHolder.find('i.icon-reportViewLog').show(); //No I18N
		}

		// if(widgetParams.apiData!==undefined && cpWidgets.indexOf("widget.name.cpw.overutilized")!==-1)
		// {
		// 	self.set("showHeaderTitle", false); //No I18n
		// }
		
		if(cpWidgets.indexOf(widgetParams.widgetUniqueName)!==-1 && OPMClient.HomeDetailsController.dashboardName === "webclient.capacityplanning")
		{
			self.set("isHideDeleteWidget", true); //No I18n
		}
		if(widgetParams.apiData !== undefined && (widgetParams.apiData.WidgetName==="HeatMap" && widgetParams.apiData.WidgetData !== undefined && widgetParams.apiData.WidgetData.isNFA === true && widgetParams.apiData.WidgetData.isUtilization === false)) {
			self.set("widgetParams.subTitle", ""); //No I18n
		}
		if(widgetParams.widgetUniqueName == "widget.name.spmsummaryheatmap" && widgetParams.apiData!=undefined){
                    if(widgetParams.apiData.WidgetAdditionalData != undefined){
                        $("#"+widgetParams.widgetHolderId+" .wid_subTitle").text(widgetParams.apiData.WidgetAdditionalData.displayName);
                    }
		}
                
	},
	widgetNameObserver: function() {
		if(this.get('widgetParams.name')) {
			this.rerender();
		}
	}.observes('widgetParams.name'), //No I18n
	actions:{
		nfaSubLinkRedirection:function(){
			if(this.widgetParams.nfaSubLink){
				nfa_getReportFromDashboardWidgets(this.widgetParams.apiData,'WidgetHeader');//No I18N
			}
		},
		fwaSubLinkRedirection:function(){
			if(this.widgetParams.fwaSubLink){
				fwa_RedirectToSnapshotPage(this.widgetParams.apiData,'WidgetHeader');//No I18N
			}
		},
		refreshWidget:function(){
			this.sendAction('action','reload');
		},
		viewLogs:function(){
			viewReportLogs(this.widgetParams.id);
		},
		embedWidget:function(){
			getEmbedResponse(this.widgetParams.id,false);
		},
		deleteWidget:function(){
			deleteWidget(this.widgetParams.id,this.isRealtimeWidget);
		},
		editWidget:function(){
			var self = this;
			var datasourceName = undefined;
			if(this.widgetParams.apiData!==undefined && this.widgetParams.apiData.GridWidget!==undefined){
				datasourceName = this.widgetParams.apiData.GridWidget.datasourceName;
			}
			if(datasourceName==="Advanced Widget"){//No I18N
				editCustomWidget(self.widgetParams.id,datasourceName);
			}else{
				if(this.widgetParams.apiData.CustomWidget) {
					OPMClient.HomeDetailsController.set("isEditCustomQueryWidget", true);//No I18N
				} else {
					OPMClient.HomeDetailsController.set("isEditCustomQueryWidget", false);//No I18N
				}
				Ember.run.schedule("afterRender", function(){//No I18N
					showEditWidget(self,self.widgetParams.id);
				})
			}

		},
		duplicateWidget:function(){
			if(this.isRealtimeWidget && !validateRealtimeWidgetsCount(1)){
				return false;
			}
			$('.duplicateWd').show();
			$('.editWd').hide();
			$('#wName').prop('disabled',false);
			showEditWidget(this,this.widgetParams.id);
		},
		expandWidget:function(){
			var id = this.widgetParams.id;
			var isWidgetExpand = $("#li_"+id).hasClass("dashboardWidgetExpandView");
			if(!isWidgetExpand)
			{
				$("#li_"+id).addClass("dashboardWidgetExpandView");
				$("body").addClass("widgetExpandView_temp");
			}
			else
			{
				$("#li_"+id).removeClass("dashboardWidgetExpandView");
				$("body").removeClass("widgetExpandView_temp");
			}
			this.sendAction('action','reload');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashBusinessViewComponent = Ember.Component.extend({
	templateName:"components/opm-dash-business-view",//No I18N
 	didInsertElement: function(){
 		//var self = this;
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		if(jsonData.WidgetForwardPage ==="sampleBusinessView")
		{
			this.set("loadSampleImage",true);//No I18N
			$('#widget_holder_'+widgetParams.id).addClass("helpTxtBvWidget");
			$('#widget_holder_'+widgetParams.id+' .wid_subTitle').text("");// No I18N
		}
		else
		{
			$('#widget_holder_'+widgetParams.id).removeClass("helpTxtBvWidget");
			var bvName = jsonData.WidgetData.mapName;
			var selBVName = (bvName).split("_bv")[0];
	    		$("#widget"+widgetParams.id).css({"height":"100%","overflow":"auto"});// No I18N
		    	$("#widget_holder_"+widgetParams.id+" .content #"+widgetParams.id).remove();
		    	var showLegend = false;
		    	var oldBvCheckURL = window.OPM.apiUrlPattern + '/businessview/checkIfOldBv?bvName='+encodeURIComponent(selBVName)+"_bview.netmap"; //No I18N
		    	if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.bvLegend !== undefined && jsonData.WidgetAdditionalData.bvLegend == "true")
		    	{	$("#widget"+widgetParams.id).parent().css({"bottom":"6px"});// No I18N;
		    		$("#"+widgetParams.BVID).css({"padding":"0 0 45px"});// No I18N;
		    		showLegend = true;
		    	}
		    	
				if(window.OPM.isEmbed) 
				{
					if(window.OPM.Embedtype === "cctv")
					{
						oldBvCheckURL = '/embedWidget?type=cctv&cctvID='+window.OPM.cctvID+'&authKey='+window.OPM.authKey+'&widgetID='+widgetParams.id+"&apiKey=EmbedView&methodCall=checkIfOldBv&bvName="+encodeURIComponent(selBVName)+"_bview.netmap"; //No I18N	
					}
					else
					{
		    			oldBvCheckURL = '/embedWidget?type='+window.OPM.Embedtype+'&widgetID='+widgetParams.id+'&authKey='+window.OPM.authKey+"&apiKey=EmbedView&methodCall=checkIfOldBv&bvName="+encodeURIComponent(selBVName)+"_bview.netmap"; //No I18N
					}
				}
			var oldBVJsonData = opm_ajaxGetRequest(oldBvCheckURL); 
			$("#widget"+widgetParams.id).attr("data-isOLDBV",oldBVJsonData.data.mapType); //No I18n
			if(oldBVJsonData.data.mapType !== undefined && oldBVJsonData.data.mapType === 'FlashBV')
			{
				$("#widget"+widgetParams.id).parent().css({"padding":"20px 0 0 0"});// No I18N;
				$("#"+widgetParams.BVID).removeAttr('style');//No I18N
			}
	    	else{
	    		$("#widget_holder_"+widgetParams.id).addClass('global-bv-map bv-widget-scroll-enabled');
	    		var isAvailabilityOnly = false;
	    		if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.heatMapType !== undefined && jsonData.WidgetAdditionalData.heatMapType === "availability")
	    		{
	    			isAvailabilityOnly = true;
	    		}
	    		loadBusinessViewNew(selBVName,widgetParams.BVID,true,false,showLegend,oldBVJsonData.data.mapType,isAvailabilityOnly);
	    	}
		}
 	},
 	willDestroyElement: function(){
 		// if(network!=undefined){
 		// 	network.destroy();
 		// 	network=null;
 		// }
 		var widgetParams = this.widgetParams;
 		clearBlinkTimerBv("bv_"+widgetParams.id);//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashPieGridComponent = Ember.Component.extend({
	templateName:"components/opm-dash-piegrid",//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashpieTableComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var dataArray = new Array();
		if(jsonData.WidgetData.data != undefined)
		{
			if(jsonData.WidgetData.data.data != undefined)
			{
				$.each(jsonData.WidgetData.data.data,function(key,value)
				{
					if(jsonData.Name === 'NFAWidget.DETopTrf'){
						dataArray.push([value[1]+" -- "+value[2],value[3],value[1]]); //NO I18N
					}else if(((jsonData.Name === 'webclient.dashboard.qos' || jsonData.WidgetData.ResolveDNS) && jsonData.WidgetData.devType !== 'Across') || (jsonData.Name === 'NFAWidget.trfc' && jsonData.WidgetData.devTypeText == 'Device') || (jsonData.Name == "webclient.snapshot.desc.controller" && (["SSIDGroup","AccessPointGroup","APMAC"].contains(jsonData.WidgetData.devType)) && (["wlc.apmacsnap.apps","wlc.apmacsnap.qos"].contains(jsonData.WidgetData.SnapWidgetName))) || (jsonData.Name === "NFAWidget.App" && jsonData.WidgetData.devTypeText === "layer7")) { //NO I18N
						dataArray.push([value[0]+" -- "+value[1],value[2],value[4],value[0]]); //NO I18N
					}else{
						dataArray.push([value[0]+" -- "+value[1],value[2],value[0],value[0]]); //NO I18N
					}
				});
			}
		}
		else if(jsonData.WidgetData !== undefined && jsonData.WidgetData.message === undefined)
		{
			$.each(jsonData.WidgetData,function(key,value)
			{
				dataArray.push([value[0]+" -- "+value[1],value[2],value[0]]); //No I18n
			});	
		}

		if(jsonData.WidgetData.message !== undefined || (jsonData.WidgetData.data == undefined && jsonData.WidgetData.message === undefined && window.OPM.isNFA))
		{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("widget.configure",this)+"</span>"); //No I18N
		}
		else if(dataArray.length === 0)
		{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18N
		}
		else
		{
			var graphParams = {};
	 		graphParams.id = "gwidget"+widgetParams.id;
	 		graphParams.wid = widgetParams.id;
	 		graphParams.graphData = dataArray;
	 		graphParams.graphType = "pie";//No I18N
	 		graphParams.x_axes = Ember.I18n.t('NFAWidget.Time',this);//No I18N
	 		graphParams.y_axes = Ember.I18n.t('webclient.devices.intftypes.value',this);//No I18N
	 		graphParams.tooltip = (jsonData.WidgetAdditionalData.Percentage !== undefined || jsonData.WidgetAdditionalData.Label !== undefined) ? [Ember.I18n.t('webclient.map.flash.label',this)+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}} ({{col(1)}})"] : [Ember.I18n.t('webclient.map.flash.label',this)+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}}"]//No I18N

	 		if(jsonData.WidgetForwardPage === 'NFAWidget') {
	 			graphParams.nfaReportFromWidget = true;
	 			graphParams.apiResponse = jsonData;
	 		}
	 		var wName=jsonData.Name;
	 		if(wName.indexOf("widget.name.firewallpolicy")>=0){
	 			graphParams.isFWAStdPolicy = true;
	 			graphParams.Name = jsonData.Name;
	 		}else if(wName == "widget.name.firewallsecurityevents"){//No I18N
	 			graphParams.isFWASecurityEvt = true;
	 		}
	 		this.set('graphParams',graphParams);//No I18N
		}
 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashPieChartComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		if(jsonData.WidgetData === undefined || jsonData.WidgetData.length === 0)
		{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18N
		}
		else
		{
			var graphParams = {};
	 		graphParams.id = "gwidget"+widgetParams.id;
	 		graphParams.graphType = "pie";//No I18N
	 		graphParams.graphData = jsonData.WidgetData;
	 		graphParams.x_axes = Ember.I18n.t('webclient.map.flash.label',this);//No I18N
	 		graphParams.y_axes = (jsonData.WidgetAdditionalData.Percentage == true)?Ember.I18n.t('nfa.perc',this):jsonData.WidgetAdditionalData.Label;//No I18N
	 		graphParams.suffix = (jsonData.Percentage == true)?"%":"";
	 		graphParams.color = (jsonData.WidgetAdditionalData.Color != undefined)?jsonData.WidgetAdditionalData.Color:availColors;
	 		graphParams.tooltip = (jsonData.WidgetAdditionalData.Percentage !== undefined || jsonData.WidgetAdditionalData.Label !== undefined) ? [Ember.I18n.t('webclient.map.flash.label',this)+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}} ({{col(1)}})"] : [Ember.I18n.t('webclient.map.flash.label',this)+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}}"]//No I18N
	 		graphParams.pieType = (jsonData.WidgetAdditionalData.pieType !== undefined) ? jsonData.WidgetAdditionalData.pieType : null;

	 		var wName=jsonData.Name;
        	if( wName == "widget.name.current.compliancestatus" || wName == "widget.name.backupcountstatus" || wName == "widget.name.current.confifConflictstatus" || wName == "widget.name.APClientCount" || wName=="widget.name.ssidclientcount")
        	{
				graphParams.isNCMWidgetDrillDownEvent = true;
				graphParams.Name = jsonData.Name;
        	}else if(wName==="widget.apm.name.monitorstatus")//No I18N
        	{
        		$("#widget"+widgetParams.id).addClass('pieChartType2');//No I18N
        		graphParams.tooltip = [Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+" : {{val(0)}}",Ember.I18n.t("webclient.devices.details.monitors",this)+" "+ Ember.I18n.t("webclient.common.widgets.eventcount",this)+" : {{val(1)}}"];//No I18N
        	}
        	if(wName=="widget.name.urlavail")
        	{
        		graphParams.legendShowAs = "{{val(0)}} ( {{val(1)}} )";//No I18N
        	}
			if(wName=="widget.name.ssidclientcount" || wName == "widget.name.APClientCount")
			{
				graphParams.chart = {
					stacked:true,
					plot: {
						plotoptions: {
							pie: {
								maxRadius : 500,
								outerPadding: 0
							}
						}
					},
					marginTop: 0,
					marginRight: 0,
					marginBottom: 0,
					marginLeft: 0
				}
				graphParams.legend = {
					"enabled":true,//No I18N
					"colors":graphParams.color,//No I18N
					"layout":"vertical",//No I18N
					"hAlign": "right",//No I18N
					"vAlign": "top",//No I18N
					"textOverflow":"wrap",//No I18N
					"fontSize":10,//No I18N
					"colorBox": {//No I18N
						"shape": "circle",//No I18N
						"strokeOpacity": 1//No I18N
					},
					"showAs":"{{val(0)}} ( {{val(1)}} )"//No I18N
				},
				graphParams.handleOverlapping = true;
				graphParams.fontSize = "10";
				graphParams.tooltip = [Ember.I18n.t('webclient.map.flash.label',this)+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}}"]//No I18N
			}
			if(wName == "widget.name.APClientCount") {
				graphParams.redirectToDeviceSnapshot = true;
			}
			if(window.OPM.dashboardViewType === "compact") {
				graphParams.customLegend = {
					layout: "vertical", //No I18N
					vAlign: "center", //No I18N
					maxWidth: "35%",
					maxHeight: "100%",
					colorBox: {
						"shape": "circle",//No I18N
						"strokeOpacity": 1,//No I18N
						"vAlign": "top"
					},
					fontSize: 12 //No I18n
				}
				graphParams.legendShowAs = function (d, i, chartObj) {
					var data = d[0];
					return '<tspan style="display:block; white-space: pre-wrap;">' + data + '<tspan>';
				}
				graphParams.height = 200;
				graphParams.customClass = "opm_pie"; //No I18N
				graphParams.chart = {
					stacked:true,
					plot: {
						plotoptions: {
							pie: {
								outerPadding: 0
							}
						}
					},
					marginTop: 0,
					marginRight: 0,
					marginBottom: 0,
					marginLeft: 0
				}
			}
			if(wName=="widget.name.ssidclientcount" || wName == "widget.name.APClientCount") {
				graphParams.customClass = "fullWidthWidget"; //No I18N
			}
        	this.set('graphParams',graphParams);//No I18N
		}
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashverticalBarTableComponent = Ember.Component.extend({
	templateName:"components/opm-dash-verticalbartable",//NO I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var datatype = "time";//No I18N
 		var colName3 = "";
 		if(jsonData.Name === 'widget.name.firewallprotocoltrafficreport')
        {
        	colName3=Ember.I18n.t("fwa.protocol.group.name",this);//No I18N
        	datatype = "ordinal";//No I18N
        }
        else if(jsonData.Name === 'widget.name.firewallsecurityoverview'){//No I18N
            colName3=Ember.I18n.t("webclient.admin.eventlog.configrule.eventtype",this);//No I18N
            datatype = "ordinal";//No I18N
        }
 		var graphParams = {};
 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
 		graphParams.graphData = jsonData.WidgetData.chartData;
 		graphParams.height = 250;
 		graphParams.datatype1 = datatype;
 		graphParams.x_axes = (jsonData.WidgetData.xyTitles !== undefined)?jsonData.WidgetData.xyTitles[0] : "";
 		graphParams.y_axes = (jsonData.WidgetData.xyTitles !== undefined)?jsonData.WidgetData.xyTitles[1] : "";
 		graphParams.timeFormat = (jsonData.Period !== undefined)?jsonData.Period:'hours';//No I18N
 		graphParams.legendEnabled = true;
 		graphParams.axesEnabled = true;
 		graphParams.tooltip = [0,1,2];
 		graphParams.columnname3 = colName3;
 		graphParams.innerLabel = false;
 		if(jsonData.Name === 'widget.name.firewallprotocoltrafficreport'){
 			graphParams.isFWAProtocoTrafficWidget = true;
 			graphParams.period = jsonData.Period;
 		}
 		if(jsonData.Name === 'widget.name.firewallsecurityoverview'){
 			graphParams.isFWASecurityTrafficWidget = true;
 		}
 		graphParams.graphType = "bar";//No I18N
 		this.set("graphParams",graphParams);//No I18N

 		var colNamesList = [];
		var colModelList = [];
		var defaultOptions = {};
		
		if(jsonData.Name == "widget.name.firewallsecurityoverview" && !window.OPM.showFWACompliance){
			
			var colModelList = jsonData.GridWidget.colModelList;
			for(i=0; i<colModelList.length; i++){
				if(colModelList[i].name=="fsecurity_ConfigChange_Count"){
					colModelList[i].hidden=true;
				}
			}
		}
		
		if(jsonData.GridWidget != undefined && jsonData.GridWidget.colModelList != undefined){
			for(var ij=0;ij<jsonData.GridWidget.colModelList.length;ij++){
				if(jsonData.GridWidget.colModelList[ij].sorttypefunction !== undefined){
					jsonData.GridWidget.colModelList[ij].sorttype = window[jsonData.GridWidget.colModelList[ij].sorttypefunction]; 
				}
			}
			colModelList = jsonData.GridWidget.colModelList;
		}
		if(jsonData.GridWidget != undefined && jsonData.GridWidget.colNamesList != undefined){
			colNamesList = jsonData.GridWidget.colNamesList;
		}	
		if(jsonData.WidgetData !== undefined && jsonData.WidgetData !== null && jsonData.WidgetData.tableData !== undefined && jsonData.WidgetData.tableData.length > 0)
		{
			if(jsonData.WidgetData.grouping != undefined && jsonData.WidgetData.grouping == true){
				defaultOptions = {"grouping":true,"groupingField":jsonData.WidgetData.groupingField}//No I18N
			}
			if(jsonData.WidgetData.subGrid != undefined && jsonData.WidgetData.subGrid == true){
				for(var ij=0;ij<jsonData.WidgetData.subGridColModelList.length;ij++){
					if(jsonData.WidgetData.subGridColModelList[ij].sorttypefunction !== undefined){
						jsonData.WidgetData.subGridColModelList[ij].sorttype = window[jsonData.WidgetData.subGridColModelList[ij].sorttypefunction]; 
					}
				}
//				jsonData.WidgetData.subGridColNameList.push("");
//				jsonData.WidgetData.subGridColModelList.push({ name: 'id', index: 'id',sortable:false,hidden:true});//No I18N
				defaultOptions = {"Data":jsonData.WidgetData.tableData,"subGrid":true,"colNamesList":jsonData.WidgetData.subGridColNameList,"colModelList":jsonData.WidgetData.subGridColModelList,"subGridFunction":"verticalBarGrid"}//No I18N
			}				
			defaultOptions.minRowsPerPage=25;
			var onselectFunction="";
			if(jsonData.Name === 'widget.name.firewallprotocoltrafficreport' || jsonData.Name === 'widget.name.firewallsecurityoverview')
         	{
				defaultOptions.timePeriod=jsonData.Period;
				defaultOptions.wName=jsonData.Name;
				onselectFunction="fwadevListWidget";//NO I18N
				if(jsonData.Name === 'widget.name.firewallprotocoltrafficreport'){
					defaultOptions.subGridOnselectFunction="fwadevListSubGridClick";//NO I18N
				}
         	}
         	defaultOptions.gridCallBack = function(gridTableIdAlone){	
				gridWidthAlignment(gridTableIdAlone);
			};
			opm_loadJQgridWithData("#"+widgetParams.id, jsonData.WidgetData.tableData, colNamesList, colModelList, "", "#widget_pager_"+widgetParams.id, onselectFunction,defaultOptions); //No I18N
		}
		else
		{
			$("#"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n

		}
 	},
	willDestroyElement: function(){
 		clearGridMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashSummaryBarComponent = Ember.Component.extend({
	templateName:"components/opm-dash-summarybar",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var self = this;
 		self.set('transientLabel',jsonData.WidgetData.legendData[1][0]);
 		self.set('transientData',jsonData.WidgetData.legendData[1][1]);
 		self.set('availableLabel',jsonData.WidgetData.legendData[2][0]);
 		self.set('availableData',jsonData.WidgetData.legendData[2][1]);
 		self.set('usedLabel',jsonData.WidgetData.legendData[0][0]);
 		self.set('usedData',jsonData.WidgetData.legendData[0][1]);
 		//self.set('availPieChartID','ipamAvailSum_PieChart_'+widgetParams.id);//No I18N

 		var graphParams={};
 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
 		graphParams.height = 280;
 		graphParams.graphType = "bar";//No I18N
 		graphParams.graphData = jsonData.WidgetData.barData;
 		graphParams.x_axes = Ember.I18n.t('opstor.inventory.status',this);//No I18N
 		graphParams.y_axes = Ember.I18n.t('webclient.availreport.chartlabel.availability',this);//No I18N
 		graphParams.color = ipamSeverityColors1;
 		self.set('graphParams',graphParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashCustomTextComponent = Ember.Component.extend({
	templateName:"components/opm-dash-customtext",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var apiData = widgetParams.apiData;
		if(apiData.WidgetAdditionalData.isConsentRequired !== false) {
			this.set('isConsentRequired', true);//No I18N
		} else {
			$("#gwidget"+widgetParams.id).html(widgetParams.apiData.WidgetData);//No I18N
			$("#widget"+widgetParams.id).css({"height":"100%","overflow":"hidden"});//No I18N
			if($("#widget"+widgetParams.id).find("iframe") !== undefined && $("#widget"+widgetParams.id).find("iframe").length == 1)
			{
				$($("#widget"+widgetParams.id).find("iframe")[0]).css({"width":"100%","height":"100%"}); //No I18N
			}
		}
	},
	actions : {
		showConsentDialog : function(){
			var self = this;
			var widgetParams = this.widgetParams;
			var apiData = widgetParams.apiData;		
			opmConfirm(Ember.I18n.t("webclient.dashboard.customHTML.headerMsg"),"<p class=\"mb-sm\">" + Ember.I18n.t("webclient.dashboard.customHTML.content", this) + "</p> <div class=\"box-container max-h-250px overflow-auto pre-line-imp\"> <div class=\"box-content\"> <code>"+ opm_escapeHTML(apiData.WidgetData) + "</code></div></div><p class=\"mb-sm mt-sm\"> " +  Ember.I18n.t("webclient.dashboard.customHTML.description") + "</p>",'',function() {//No I18n
				var url = window.OPM.apiUrlPattern + "/dashboard/updateConsentForWidget?widgetID="+widgetParams.id; //No I18n
				var resp = opm_ajaxPostRequest(url, {widgetUpdatedTime : apiData.WidgetAdditionalData.widgetUpdatedTime});
				if(resp.isSuccess) {
					self.set('isConsentRequired', false);//No I18N
					apiData.WidgetAdditionalData.isConsentRequired = false;
					self.set("widgetParams.apiData",apiData);//No I18N
					self.rerender();
				} else {
					showMessage(resp);
				}
			}, Ember.I18n.t("webclient.opm.tpi.responseTemplate.proceed"),"", Ember.I18n.t("webclient.admin.proxy.cancel"),"", "dialogStyle2", true, false, "", "", true); //No I18N
		}
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashDialComponent = Ember.Component.extend({
	templateName:"components/opm-dash-dial",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		var wName = jsonData.Name;
		//var self=this;
		var dialArr = [];
		if(OPMClient.ApplicationController.currentPath.indexOf("Home.Dashboard") > 0)
		{
			$.each(jsonData.WidgetData,function(i,ob)
			{
				var dialParams = {};
				dialParams.isRackDial = false;
				var val = parseFloat(ob.value);
				if(wName === "widget.name.rackcapacity")//No I18N
	     		{
	     			dialParams.isRackDial = true;
	     			dialParams.id = "opm_dial_svg_"+widgetParams.id+'_'+i;//No I18N
	     			dialParams.val = val;
	     			dialParams.unit = ob.unit;
	     			dialParams.displayName = ob.displayName;
	     		}
	     		else
		 		{
		 			dialParams.className = "SpeedoMeter";//No I18N
		 			dialParams.id = "opm_dial_svg_"+widgetParams.id+'_'+i;//No I18N
					dialParams.unit = ob.unit;
					dialParams.val = val;
					dialParams.displayName = ob.displayName;
		 			if(ob.unit === "%" || ob.unit === "Percentage")//No I18N
		 			{
		 				if(val > 100){
		 					dialParams.val = 100;
		 				}else if(val < 0){
		 					dialParams.val = 0;
		 				}else{
		 					if(wName==='widget.name.lastpolledcpu' || wName==='widget.name.lastpolleddisk' || wName==='widget.name.lastpolledmem'){//No I18N
		 						dialParams.className = "SpeedoMeter pointer";//No I18N
		 						dialParams.click = "redirectToSnapPerfGraph(&#39;'"+jsonData.WidgetAdditionalData.source+"'&#39;,&#39;'"+jsonData.WidgetAdditionalData.policyName+"'&#39;);";//No I18N
		 					}
		 				}
		 			}
				}
				dialArr.pushObject(dialParams);
			});
		}
		else
		{
			$.each(jsonData.WidgetData,function(i,ob)
			{
				if(wName === "widget.name.lastpolledbw" && ob.value === "NA")
				{
					ob.value = 0;
				}
				var dialParams = {};
				dialParams.isRackDial = false;
				dialParams.className = "SpeedoMeter";//No I18N
		 		dialParams.id = "opm_dial_svg_"+widgetParams.id+'_'+i;//No I18N
				dialParams.unit = ob.unit;
				dialParams.val = parseFloat(ob.value);
				dialParams.displayName = ob.displayName;
				dialArr.pushObject(dialParams);
			});
		}
		this.set('dialArr',dialArr);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashboardDrawdialComponent = Ember.Component.extend({
	templateName:"components/opm-dashboard-drawdial",//No I18N
	didInsertElement: function(){
		if(this.dialArr!=undefined){
			$.each(this.dialArr,function(i,k){
				opm_drawDialChart(k.id,k.val,'#76d284');//No I18N
			});
		}
	},
	dialObserver:function(){
		this.rerender();
	}.observes('dialArr'),//No I18N
	willDestroyElement: function(){
 		clearGraphMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashLayer2mapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-layer2map",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		//var self=this;
		var mapParams = {};
		mapParams.sampleImage = false;
		if(jsonData.WidgetData.image !== undefined)
		{
			mapParams.sampleImage = true;
			mapParams.link = window.OPM.apiclientUrl+'Settings/Discovery/Layer2Discovery';//No I18N
			mapParams.imgLink = jsonData.WidgetData.image;
			mapParams.imgWidth = $("#widget_holder_"+widgetParams.id).width();
		}
		else
		{
			if(jsonData.WidgetData.mapDetails === undefined)
			{
				$("#sliderBar").hide();
				$("#resizeDiv").hide();
				$("#resDiv").css('backgroundColor','##FF0000'); //No I18N
				$("#resDiv").html(Ember.I18n.t('webclient.api.layer2.mapping.notexist',this));//No I18N
			}
			$("[data-widgetid="+widgetParams.id+"]").show();
			//opm_selectedLayout(jsonData.WidgetData.layout);
			//var mapName = jsonData.WidgetData.mapDetails[0].mapName;
			//OPMClient.Layer2MapDetailsController.layer2MapId = mapName;
			OPMClient.Layer2MapDetailsController.set("layOut",jsonData.WidgetData.layout); //No I18N
			opm_selectedLayout();
		    $("#widget"+widgetParams.id).css("transform", "none");	//No I18N			
			drawLayer2Map(jsonData.WidgetData,"widget"+widgetParams.id,true); //No I18n
			calculateMapWidgetWidHt(widgetParams.id, $("#"+widgetParams.graphWidgetId).height(),$("#"+widgetParams.graphWidgetId).width());
		}
		this.set('mapParams',mapParams);//No I18N
	},
	willDestroyElement: function(){
		jsPlumb.remove(this.elementId);
 		clearGraphMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashTimeLineComponent = Ember.Component.extend({
	templateName:"components/opm-dash-timeline",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$('#li_'+widgetParams.id).attr('data-sizex', 4);
		$("#widget"+widgetParams.id).addClass('opmTimeLine');
		var timeLineParams={};
		timeLineParams.id = 'gwidget'+widgetParams.id;//NO I18N
		timeLineParams.data = jsonData.WidgetData;
		//var self = this;
		this.set('timeLineParams',timeLineParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashboardDrawTimelineComponent = Ember.Component.extend({
	templateName:"components/opm-dashboard-draw-timeline",//No I18N
	didInsertElement: function(){
		var timeLineParams = this.timeLineParams;
		if(timeLineParams!=undefined){
			opm_loadVoipPerformanceByLocation(timeLineParams.data,timeLineParams.id);
		}
	},
	timeLineObserver:function(){
		this.rerender();
	}.observes('timeLineParams'),//No I18N
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashFloorComponent = Ember.Component.extend({
	templateName:"components/opm-dash-linegraph",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		if(jsonData.WidgetData!=undefined && jsonData.WidgetData.floor !== undefined)
		{
			if(!window.OPM.isLoadThreeJS)
			{
	 			this.set("notSupportIE",true);//NO I18N
			}
			else
	 		{
	 			

				$("#widget"+widgetParams.id).css({"height":"100%"});
				$("#gwidget"+widgetParams.id).css({"height":"100%"});
				if(jsonData.WidgetData["2DView"] !== undefined && jsonData.WidgetData["2DView"] === "false") 
				{
					$("#widget"+widgetParams.id+" .opmMapPage").addClass("height-full").find(".mapContainer").addClass("block");
					$("#widget_holder_"+widgetParams.id+" .content").css({"overflow":"hidden"});//NO I18N
					trigger3D(jsonData.WidgetData.viewName,jsonData.WidgetData,"Perspective","true","gwidget"+widgetParams.id); //No I18N
				}
				else{
					loadRack2DView(jsonData.WidgetData,widgetParams.id);
				}
			}
		}

	},
	willDestroyElement: function(){
		//clearVariables(this.widgetParams.graphWidgetId);
		var floorData = $("#"+divId).data();
		if(floorData!==undefined){
			var floorObj = floorData.FloorObj;
			floorObj.cbObj = {};
			rackComponents = {};
			floorObj.racksObj = {};
			floorObj.pathsObj = {};
			floorObj.aislesObj = {};
			floorObj.wallsObj = {};
			floorObj.projector = new THREE.Projector();
			floorObj.barGraph = new THREE.Object3D();
			floorObj.statPlatform = new THREE.Object3D();
			OPMClient.FloorDetailsController.floorAnimateStart = true;	
		}
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashRackComponent = Ember.Component.extend({
	templateName:"components/opm-dash-rack",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		if(jsonData.WidgetData!=undefined){
			// if(OPMClient.HomeDetailsController.isExpand){
			// 	$("#widget"+widgetParams.id).css("height",($("#widget"+widgetParams.id).closest('.ember-view').height()-100)+"px");// No I18N
			// }else{
			 $("#widget"+widgetParams.id).css({"height":"100%"});
			 $("#widget"+widgetParams.id).css({"width":"100%"});
			//}
			$("#widget"+widgetParams.id).addClass("rackWidget");//No I18N
			var rackParams = {};
			rackParams.id = "rackTablewidget"+widgetParams.id;
			rackParams.rearId = "rackTablewidget"+widgetParams.id+"_rear";//No I18N
			rackParams.name = jsonData.WidgetData.name;
			rackParams.rackId = jsonData.WidgetData.rackId;
			rackParams.wid = widgetParams.id;
			this.set('rackParams',rackParams);//No I18N
		}else{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashboardDrawrackComponent = Ember.Component.extend({
	templateName:"components/opm-dashboard-drawrack",//No I18N
	didInsertElement: function(){
		var rackParams = this.rackParams;
		if(rackParams!=undefined){
			initViewRack(rackParams.rackId,rackParams.id,rackParams.wid);
		}
	},
	rackObserver:function(){
		this.rerender();
	}.observes('rackParams'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashGoogleMapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-googlemap",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		$("#widget"+widgetParams.id).css({"height":"100%"});// No I18N;
		
		var mapType = "ZohoMap";//No I18N
		if(widgetParams.apiData.WidgetData !== undefined && widgetParams.apiData.WidgetData.mapType !== undefined && widgetParams.apiData.WidgetData.mapType == "1")
		{
			var mapType = "GoogleMap";//No I18N
		}

		var gMapUrl = "/apiclient/ember/googleMap.jsp?widgetId="+widgetParams.id+"&mapType="+mapType; //No I18N
		if (window.OPM.isEmbed) {
			if (isEmbedCCTV) {
				gMapUrl = "/apiclient/ember/googleMap.jsp?type=cctv&cctvID=" + embed_cctvID + "&authKey=" + window.OPM.authKey + "&widgetId=" + widgetParams.id + "&isEmbed=true&mapType=" + mapType; //No I18N
			}
			else {
				gMapUrl = "/apiclient/ember/googleMap.jsp?type=widget&widgetId=" + embed_widgetID + "&authKey=" + window.OPM.authKey + "&isEmbed=true&mapType=" + mapType; //No I18N
			}
		}
		this.set('gMapUrl',gMapUrl);//No I18N
	},
	willDestroyElement: function(){
		if(typeof newMap !== 'undefined' && newMap)
		{
			newMap.clearMap();
		}
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashLiveComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var widgetHeight = 7;
 		if(jsonData.WidgetData !== undefined && jsonData.WidgetData.graphData !== undefined && jsonData.WidgetData.graphData.length>0)
 		{
	 		var graphParams={};
	 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
	 		graphParams.graphType = "line";//No I18N
	 		graphParams.graphData = jsonData.WidgetData.graphData;
	 		graphParams.height = 250;
			graphParams.x_axes = (jsonData.WidgetAdditionalData.xAxis!=undefined)?(jsonData.WidgetAdditionalData.xAxis):(Ember.I18n.t('webclient.reports.time',this));//No I18N
	 		graphParams.y_axes = (jsonData.WidgetAdditionalData.yAxis!=undefined)?(jsonData.WidgetAdditionalData.yAxis):(Ember.I18n.t('webclient.interface.units.bps',this));//NO I18N
	 		graphParams.timeFormat = 'HMS';//NO I18N
 			graphParams.saveWID = widgetParams.id;
 			graphParams.legendLayout = "horizontal";//No I18N
	 		graphParams.WidgetForwardPage = jsonData.WidgetForwardPage;
 			if(jsonData.WidgetData.consolidatedValues!=undefined){
	 			$.each(jsonData.WidgetData.graphData,function(key,objk)
				{
					var mma = jsonData.WidgetData.consolidatedValues[objk.seriesname];
					objk.seriesname = mma.seriesName+" - "+Ember.I18n.t('webclient.reports.tags.min',this)+" : "+mma.minVal+" "+Ember.I18n.t('webclient.reports.tags.max',this)+" : "+mma.maxVal+" "+Ember.I18n.t('webclient.reports.tags.avg',this)+" : "+mma.avgVal;
				});
 				graphParams.consolidatedValues = jsonData.WidgetData.consolidatedValues;
	 		}
	 		var maxRangeGraphs = ["widget.name.rtmem","widget.name.rtcpu","widget.name.rtbw"];//No I18N
 			if(maxRangeGraphs.indexOf(jsonData.Name)!==-1){
 				graphParams.maxRange=100;
 				graphParams.minRange=0;
 			}
	 		this.set('graphParams',graphParams);//No I18N
	 		widgetHeight = 15;
 		}else if(jsonData.WidgetData !== undefined && jsonData.WidgetData.imageName !== undefined)
 		{
 			opmWidget_RTGraphArr[widgetParams.id] = jsonData.WidgetData;
 			this.set('realTimeImageParams',"data:image;base64,"+jsonData.WidgetData.encodedImage);//No I18N
			widgetHeight = 17;
 		}
 		else
 		{
 			this.set('widgetParams.apiRendered',true);//NO I18N
 			this.set("noDataDiv",true);//NO I18N
 		}
 		setDashboardWidgetHeightManually(widgetParams.id,undefined,undefined,undefined,widgetHeight);
 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashBarGraphComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var graphParams={};
 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
 		graphParams.height = 375;
 		graphParams.graphType = "bar";//No I18N
 		graphParams.graphData = jsonData.WidgetData.dataset;
 		graphParams.subType = "smootharea";//No I18N
 		graphParams.datatype1 = 'time';//No I18N
 		graphParams.x_axes = "Date";//No I18N
 		graphParams.y_axes = Ember.I18n.t("dashboard.name.ncmchanges",this);//No I18N
 		graphParams.timeFormat = "Datewise";//No I18N
 		graphParams.legendEnabled=true;
 		graphParams.axesEnabled = true;
 		graphParams.hAlign = "center";//No I18N
 		graphParams.vAlign = "bottom";//No I18N
 		graphParams.color = ["#46BB7D","#FA5B5A"];//No I18N
 		this.set('graphParams',graphParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashGridSLAComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var datatype = "time";//No I18N
 		var wName = jsonData.Name;
        if(wName === 'widget.name.alarmsgraph' || wName === 'widget.name.serleastavail' || wName === 'widget.name.leastavail' || wName === 'widget.name.wanleastavail' || wName === 'widget.name.topminmaxcpu' || wName === 'widget.name.topminmaxmem'|| wName === 'widget.name.ipamTopTenScopesOccupied'){
        	datatype = "ordinal"//No I18N
        }
 		var graphParams={};
 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
 		graphParams.height = 250;
 		graphParams.graphType = "bar";//No I18N
 		graphParams.datatype1 = datatype;
 		graphParams.columnname3 = Ember.I18n.t('webclient.map.flash.label',this);//No I18N
 		graphParams.timeFormat = (jsonData.Period!==undefined)?jsonData.Period:'hours';//No I18N 		
 		graphParams.color = ipamSeverityColors1;
 		graphParams.axesEnabled = true;
 		graphParams.legendEnabled=true;
 		graphParams.tooltip = [0,1,2];
		if(wName === 'widget.name.ipamTopTenScopesOccupied'){
			graphParams.graphData = jsonData.WidgetData[0].chartData;
			graphParams.x_axes = jsonData.WidgetData[0].xyTitles[0];
			graphParams.y_axes = jsonData.WidgetData[0].xyTitles[1];
			graphParams.alignMode = "rotate"; //No I18N
			graphParams.ticklabel = {	
				"rotation": "auto",//No I18N
                "maxWidth": 75//No I18n
			}
			graphParams.tooltip = [0,1];
			if(graphParams.graphData == undefined || graphParams.graphData.length <= 0){
				$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
				return false;
			}
		}else{
			graphParams.graphData = jsonData.WidgetData.chartData;
			graphParams.x_axes = jsonData.WidgetData.xyTitles[0];
			graphParams.y_axes = jsonData.WidgetData.xyTitles[1];
		}
 		if(wName === 'widget.name.alarmsgraph'){
    		graphParams.color = statusColors;
    		graphParams.alignMode = "rotate"; //No I18N
    	}else if(wName === 'widget.name.seravaildist' || wName === "widget.name.wanavaildist" || wName === "widget.name.availdist"){//No I18N
    		graphParams.color = availDistColors;
    	}else if(wName === 'widget.name.ipamTopTenScopesOccupied'){//No I18N
			graphParams.color = availTopNColors;
		}else{
    		graphParams.color = averageAvailColors;
    	}
 		 var maxRangeGraphs = ["widget.name.serleastavail","widget.name.seravaildist","widget.name.wanleastavail","widget.name.seravgavail","widget.name.avgavail","widget.name.wanavgavail","widget.name.availdist","widget.name.wanavaildist","widget.name.leastavail"];//No I18N
 		 if(maxRangeGraphs.indexOf(jsonData.Name)!==-1){
 			 graphParams.maxRange=100;
 			 graphParams.minRange=0;
			graphParams.alignMode = "rotate"; //No I18N

 		 }
		if(wName === 'widget.name.topminmaxcpu' || wName === 'widget.name.topminmaxmem') {
			if(jsonData.WidgetData!=undefined && jsonData.WidgetData.chartData.length>0){
				graphParams.isRedirectDeviceName = true;
			}else{
				graphParams.isRedirectDeviceName = false;
				$("#widget"+this.widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
				return false;
			}
			graphParams.customClass = "fullWidthWidget";//No I18N
			graphParams.ticklabel = {	
				"rotation": "auto",//No I18N
                "maxWidth": 75//No I18n
			}
			graphParams.stacked = true;
			graphParams.color = availTopNColors;
			graphParams.maxRange=jsonData.WidgetAdditionalData.criticalValue + 20;
			graphParams.minRange=0;
			graphParams.tooltip = [0,1];
			graphParams.showThresholdLine = true;
			graphParams.thresholdLabel = ["Critical", "Attention"];//No I18N
			graphParams.thresholdValue = Object.values(jsonData.WidgetAdditionalData);
		}
 		this.set('graphParams',graphParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashPerformanceMetricsComponent = Ember.Component.extend({
	templateName: "components/opm-performance-metrics", //No I18N
	didInsertElement: function () {
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		var chartType = jsonData.WidgetData.chartType;
		var self = this;

		function processColFormatters(colNames, colModels) {
			for (var i = 0; i < colNames.length; i++) {
				var colModel = colModels[i];
				if (colModel && colModel.formatter && colModel.formatter.trim() !== "") {
					var tmpFunc = new Function("return " + colModel.formatter);//No I18N
					colModel.formatter = tmpFunc();
				}
			}
		}

		function getRoundedNumberFromData(widgetJson) {
		    var maxValue = Number.NEGATIVE_INFINITY;

		    var widgetData = widgetJson.WidgetData;
		    var chartDataArray = widgetData.chartData;

		    for (var i = 0; i < chartDataArray.length; i++) {
		        var seriesObj = chartDataArray[i];
		        var dataArray = seriesObj.data;

		        for (var j = 0; j < dataArray.length; j++) {
		            var entry = dataArray[j];
		            var value = entry[1];

		            if (value > maxValue) {
		                maxValue = value;
		            }
		        }
		    }

		    return roundUpPowerOf10(maxValue);
		}

		function roundUpPowerOf10(n) {
			if (n === 0) {
				return 1;
			}
			var power = Math.pow(10, Math.floor(Math.log10(n)));
			var halfPower = power / 2;
			if (n < halfPower) {
				return halfPower;
			} else {
				return Math.ceil(n / power) * power;
			}
		}

		if(chartType !== undefined && (chartType.trim() === "BAR_WITHOUT_TABLE") || (chartType.trim() === "LINE_WITHOUT_TABLE") || (chartType.trim() === "BAR") || (chartType.trim() === "LINE")) {//No I18N
			var self = Ember.ArrayController.create({ data: {} });
			var json_data = { graphData: jsonData.WidgetData.chartData };
			var x_axes = jsonData.WidgetData.xyTitles !== undefined ? jsonData.WidgetData.xyTitles[0] : "";
			var y_axes = jsonData.WidgetData.xyTitles !== undefined ? jsonData.WidgetData.xyTitles[1] : "";
			var datatype_1 = (chartType === "BAR") ? "ordinal" : "time"; // No I18N
			var datatype_2 = "numeric"; // No I18N
			var mychartObj = getZChartObject("widget" + widgetParams.id, "", x_axes, y_axes, null, getRoundedNumberFromData(jsonData), (jsonData.Period !== undefined ? jsonData.Period : "hours"), "", json_data, self, ""); // No I18N
			mychartObj.isPerformanceMetricWidget = true;
			mychartObj.columns = {
				datatype_1: datatype_1,
				datatype_2: datatype_2,
				columnname_1: x_axes,
				columnname_2: y_axes
			};
			mychartObj.height = 250;
		}

		switch (chartType) {
			case "BAR"://No I18N
					mychartObj.type = "bar";///No I18N
					zChart({ placeholder: [mychartObj.id], chartobj: [mychartObj] });
					mychartObj = {};
					break;
			case "BAR_WITHOUT_TABLE"://No I18N
					mychartObj.type = "bar";///No I18N
					zChart({ placeholder: [mychartObj.id], chartobj: [mychartObj] });
					mychartObj = {};
					break;
			case "TEXT"://No I18N
					this.set("chartData", jsonData.WidgetData.chartData); //No I18N
					this.set("Attribute", jsonData.WidgetData.Attribute); //No I18N
					this.set("isTextValue", true); //No I18N
					break;
			case "PERCENTAGE_BAR"://No I18N
					var colNames = jsonData.WidgetData.GridData.colNamesList || [];
					var colModels = jsonData.WidgetData.GridData.colModelList || [];
					processColFormatters(colNames, colModels);
					opm_loadJQgridWithData( "#" + widgetParams.id, jsonData.WidgetData.chartData, colNames, colModels, "", "#widget_pager_" + widgetParams.id, "widgetList", {} ); //No I18N
					break;
			case "DIAL"://No I18N
					var dialChartData = {};
					dialChartData.id = "dWidget" + widgetParams.id; //No I18N
					dialChartData.data = jsonData.WidgetData.chartData;
					this.set("dialChartData", dialChartData); //No I18N
					this.set("isDialChart", true); //No I18N
					break;
			case "TABULAR"://No I18N
					var colNames = jsonData.WidgetData.GridData.colNamesList || [];
					var colModels = jsonData.WidgetData.GridData.colModelList || [];
					processColFormatters(colNames, colModels);
					opm_loadJQgridWithData( "#" + widgetParams.id, jsonData.WidgetData.chartData, colNames, colModels, "", "#widget_pager_" + widgetParams.id, "widgetList", {} ); //No I18N
					break;
			case "LINE"://No I18N
					mychartObj.type = "line";///No I18N
					mychartObj.columns.timeFormat = "HMS";//No I18N
					zChart({ placeholder: [mychartObj.id], chartobj: [mychartObj] });
					mychartObj = {};
					break;
			case "LINE_WITHOUT_TABLE"://No I18N
					mychartObj.type = "line";///No I18N
					mychartObj.columns.timeFormat = "HMS";//No I18N
					zChart({ placeholder: [mychartObj.id], chartobj: [mychartObj] });
					mychartObj = {};
					break;
			default:
					break;
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
   	}
});

OPMClient.OpmDashDialChartComponent = Ember.Component.extend({
	templateName: "components/opm-dash-dial-chart", //NO I18N
	didInsertElement: function(){
		var dialChartData = this.dialChartData;
		drawDialChart(dialChartData);
	},
 	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashTopNComponent = Ember.Component.extend({
	templateName:"components/opm-dash-topn",//No I18N
	didInsertElement: function(){
		if(this.widgetParams.apiData.WidgetData!=undefined && this.widgetParams.apiData.WidgetData.length>0){
		constructHBarChartWidget(this);
		}else{
			$("#widget"+this.widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
		}
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashHbarchartComponent = Ember.Component.extend({
	templateName:"components/opm-dash-hbarchart",//No I18N
	didInsertElement: function(){
		if(this.dataParams!=undefined){
			var id = this.dataParams.id;
			$("#widget"+id).addClass("ut minMaxWidget");
			$("#widget"+id+' .utrow').each(function() {
			    $(this).css({width:$(this).data('value')+'%'});
			});
			opm_customTooltip();
		}
	},
	chartObserver:function(){
 		this.rerender();
 	}.observes('dataParams'),//No I18N
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashAPMHeatmapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-apm-heatmap",//No I18N
	didInsertElement: function(){
		var self = this;
		$("#widget"+this.get('widgetParams.id')).addClass('dashboardInventory');//No I18N
		var jsonData = this.get('widgetParams.apiData');//No I18N
		var dialObj = apm_contructObjDonutDial(jsonData);
		//morrisDonutChart(this.widgetParams.donutDialID,dialObj.list,dialObj.colors,Ember.I18n.t('webclient.devices.details.avail.total',this));//No I18N
		self.set('heatMapId','heatmap_'+this.get('widgetParams.id'));//No I18N
		var id = this.widgetParams.donutDialID;
		var severityArr = dialObj.list;
		var colors = dialObj.colors;
		var title = Ember.I18n.t('webclient.devices.details.avail.total',this);//No I18N
		var heatmapGroupName = "health";//No I18N
		var apmMonitorType = "HEALTHSEVERITY";//No I18N
		$("#"+id).data().nodata = false;//No I18N
	    if(!opm_setDummayDataDonut(severityArr))
	    {
	        severityArr = [{title:'No Data',value:1}];//No I18N
	        title = "No Data";//No I18N
	        colors = ["#7f7f7f"]//No I18N
	        $("#"+id).data().nodata = true;//No I18N
	    }
        $("#"+id).empty();
        var filterObj = {severity:[]};
        selectedSegments = [];
        var donut = Morris.Donut({
            element: id,
            data: severityArr,
            colors:colors,
            labelTxt:title,
            formatter: function (x) { return x}
          }).on('click', function(i, row){//No I18N
            if(row.value > 0)
            {
               var s = donut.segments[i];
              if(selectedSegments.length > 0)
              {
               
                var indx = opm_objectFindByKey(selectedSegments,'index',s.index);//No I18N
                if(indx === null)
                {
                    s.select(); 
                    selectedSegments.push(s);
                    filterObj.severity.push(row.status);
                }
                else{
                    s.deselect();
                    selectedSegments.splice(indx,1);
                    var _arr = filterObj.severity;
                    _arr.splice( $.inArray(row.status, _arr), 1 );
                    if(selectedSegments.length === 0)
                    {
                        filterObj.severity = [];
                    }
                }
              }
              else
              {
                filterObj.severity.push(row.status);
                s.select();
                selectedSegments.push(s);
                
              }
             var filterData = [];
             if(filterObj.severity.length===0)
             {
             	filterData = jsonData.WidgetData.List;
             }
             else
             {
             	var apmSeverityArr = [];
             	for(var i=0;i<filterObj.severity.length;i++)
             	{
             		if(!severityArr.contains(filterObj.severity[i]))
             		{
             			if(filterObj.severity[i]==='1' || filterObj.severity[i]==='7'){//No I18N
	             			apmSeverityArr.push('1');//No I18N
	             		}else if(filterObj.severity[i]==='2'){//No I18N
	             			apmSeverityArr.push('4');//No I18N
	             		}else if(filterObj.severity[i]==='3' || filterObj.severity[i]==='6'){//No I18N
	             			apmSeverityArr.push('5');//No I18N
	             		}else if(filterObj.severity[i]==='4'){//No I18N
	             			apmSeverityArr.push('-');//No I18N
	             		}else if(filterObj.severity[i]==='5'){//No I18N
	             			apmSeverityArr.push('8');//No I18N
	             		}
             		}
             	}
             	for(var i=0;i<jsonData.WidgetData.List.length;i++)
	             {
	             	if(apmSeverityArr.contains(jsonData.WidgetData.List[i][apmMonitorType])){
	             		filterData.push(jsonData.WidgetData.List[i]);

	             	}
	             }
             }
             self.set("heatMapWidgetData",filterData);//No I18N      
             Ember.run.schedule("afterRender",this,function() { //NO I18N
				opm_customTooltip();
			});  
            }
	    });
		if(jsonData!==undefined && jsonData.WidgetData!==undefined && jsonData.WidgetData.List!==undefined)
		{
			if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.apmMonitorType!==undefined){
				heatmapGroupName = jsonData.WidgetAdditionalData.apmMonitorType;
			}
			apmMonitorType = (heatmapGroupName==="health")?"HEALTHSEVERITY":"AVAILABILITYSEVERITY";//No I18N
			this.set("heatmapGroupName",heatmapGroupName);//No I18N
			// var mapParams = {};
			// mapParams.id = self.get('heatMapId');
			// mapParams.data = jsonData.WidgetData.List;
			// mapParams.name = jsonData.Name;
			// self.set('heatMapDetails',mapParams);//No I18N
			var heatMapDetailsParams = [];
			$.each(jsonData.WidgetData.List, function(i,obj)
	    	{
	    		var obj = jsonData.WidgetData.List[i];
	    		//console.log(window.OPM.severTimeZone);
	    		//console.log(moment.tz(new Date(obj.LAST_POLLED_TIME),window.OPM.severTimeZone).format('DD MMM YYYY HH:mm:ss A z')+" - "+obj.LAST_POLLED_TIME)
	    		var statusMsgTxt,statusTxt, isAvailabilityData;
	    		if(apmMonitorType==="HEALTHSEVERITY"){
	    			statusMsgTxt = obj.HEALTHMESSAGE;
	    			statusTxt = obj.HEALTHSTATUS;
	    			isAvailabilityData = false;
	    		}else{
	    			statusMsgTxt = obj.AVAILABILITYMESSAGE;
	    			statusTxt = obj.AVAILABILITYSTATUS;
	    			isAvailabilityData = true;
	    		}
	    		var formatterTime = (obj.LAST_POLLED_TIME==="NA")?"NA":moment.tz(new Date(Number(obj.LAST_POLLED_TIME)),window.OPM.severTimeZone).format('DD MMM YYYY HH:mm:ss A z');//No I18N
	    		obj.tooltipData = '{"'+Ember.I18n.t('webclient.map.name',this)+'":"'+escapeHtmlTags(obj.DISPLAYNAME)+'","'+Ember.I18n.t('webclient.map.type',this)+'":"'+obj.TYPE+'","'+Ember.I18n.t('webclient.fault.event.severity',this)+'":"'+statusTxt+'","'+Ember.I18n.t('webclient.alert.time.lastmodified',this)+'":"'+formatterTime+'","'+Ember.I18n.t('webclient.admin.traps.message',this)+'":"'+statusMsgTxt+'"}';//No I18N
				obj.datastatus = obj[apmMonitorType];
				var severityClass = isAvailabilityData?"apmSeverity_":"--fault-severity apmSeverity_";//No I18N
	            obj.className = "heatmapStatus apmHeatmapDiv opmToolTipDesc "+severityClass+obj[apmMonitorType]+" wid_"+self.get('heatMapId');//No I18N
				obj.divid = "HeatMapDiv_"+i;//NO I18N
				obj.onClickFunc = 'redirectToAPMMonitor(\''+obj.RESOURCEID+'\');';//No I18N
				heatMapDetailsParams.pushObject(obj);
	       	});
			//opm_loadHeatChart(mapParams,this);
			this.set("heatMapWidgetData",heatMapDetailsParams);//No I18N
			
			Ember.run.schedule("afterRender",this,function() { //NO I18N
				opm_customTooltip();
			});
		}
	},
 	willDestroyElement: function(){
 		clearMorrisElements(this.widgetParams.widgetSubID);
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashHeatmapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-heatmap",//No I18N
	showZDial:false,
	showGraph:true,
	isGroupHeatMap:false,
	isAvailabilityData: false,
 	didInsertElement: function(){
		var self = this;
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		
			
 		var isNFAWidget = Boolean(jsonData.WidgetData.isNFA)
 		self.set('isNFAWidget',isNFAWidget);//No I18N
 		self.set('severityChartId','MainSeverityChart-widget_'+widgetParams.id);//No I18N
 		self.set('heatMapId','heatmap_'+widgetParams.id);//No I18N
 		self.set('vBarChartId','inventoryVBarChart_widget_'+widgetParams.id);//No I18N
 		$("#widget"+widgetParams.id).addClass('dashboardInventory');//No I18N
 		if(!isNFAWidget && jsonData.WidgetAdditionalData.heatMapType === "Groups"){
		var treeData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/getDeviceTree?groupBy=group&pageName=groups"); //No I18n
			self.set('groupTree',treeData);//No I18N
			for(var i=0; i<treeData.length; i++){
					recursiveGroup(treeData[i],self);
			}
		}
		if(!isNFAWidget && jsonData.Name === "widget.name.wanip.siteHeatMap" && jsonData.WidgetAdditionalData.showLeafNode === "true"){
		var treeData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/getDeviceTree?groupBy=wanLinks"); //No I18n
			self.set('groupTree',treeData);//No I18N
			for(var i=0; i<treeData.length; i++){
					recursiveGroup(treeData[i],self);
			}
		}
		
 		var mapParams = {};
 		if(isNFAWidget) {
 			mapParams.isWLC = (jsonData.WidgetData.isWLC == true);
 			jsonData.Name = 'NFA_HeatMAP'; //No I18N
 			var filterParams = {};
			filterParams.id = "#inventoryVBarChart"; //No I18N
			filterParams.filterInfo = jsonData.WidgetData.Details;
			filterParams.filterInfo.widgetID = widgetParams.id;
			self.set('filterParams',filterParams); //No I18N
 		}else {
 			if(jsonData.WidgetData.Details !== undefined) {
				var params = {};
				params.id = 'inventoryVBarChart_widget_'+widgetParams.id;//No I18N
				params.details = jsonData.WidgetData.Details;
				params.widgetname = jsonData.Name;
				if(((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices") && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapType==="availability")){
					this.set('isAvailabilityData', true); //No I18N
		    		params.isOPMAvailabilityData = true;
		    		mapParams.isOPMAvailabilityData = true;
	    		}
		    	params.showLabelCount=true;
				self.set('polarChartDetails',params);//No I18N
				if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices") && jsonData.WidgetData.List!==undefined && jsonData.WidgetData.List.length>1000)//No I18N
                {
                     self.set('showDeviceCount',jsonData.WidgetData.List.length);//No I18N
                }
				if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.type==="Groups"){
					mapParams.groupByGroups = true;
					self.set('isGroupHeatMap',true);//No I18N
				}
				if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.heatMapType === "GroupMembers"){ //No I18N
					mapParams.groupByMembers = true;
				}
				var renderZChart = true;
				if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices" || jsonData.Name==="widget.name.wanip.wanipHeatMap" || jsonData.Name==="widget.name.wanip.siteHeatMap") && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapGraphType==="radial"){
		    		renderZChart = false;
		    	}
				if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices" || jsonData.Name==="widget.name.wanip.wanipHeatMap" || jsonData.Name==="widget.name.wanip.siteHeatMap") && renderZChart)
				{
					var totalData = [];
					var graphColor = [];
					var totalCount = 0;
					for(var i=0;i<jsonData.WidgetData.Details.length;i++)
					{
						var data = [];
						data.push((jsonData.WidgetData.Details[i].Label==="Unknown")?Ember.I18n.t("UnManaged",this):jsonData.WidgetData.Details[i].Label);//No I18N
						data.push(jsonData.WidgetData.Details[i].Count);
						data.push(jsonData.WidgetData.Details[i].Status);
						totalData.push(data);
						totalCount += jsonData.WidgetData.Details[i].Count;
						graphColor.push(params.isOPMAvailabilityData?availabiltyStatusColors[jsonData.WidgetData.Details[i].Status-1]:statusColors[jsonData.WidgetData.Details[i].Status-1]);
					}

					var graphParams = {};
			 		graphParams.id = "gwidget"+widgetParams.id;
			 		graphParams.graphType = "pie";//No I18N
			 		graphParams.graphData = totalData;
			 		graphParams.color = graphColor;
			 		graphParams.tooltip = ["{{val(0)}} ({{val(1)}})"];//No I18N
			 		graphParams.pieType = "simpleDonut";//No I18N
			 		graphParams.height=(totalData.length>6)?290:270;
			 		graphParams.margin=0;
			 		graphParams.legendShowAs="<label>{{val(0)}}</label> <span>{{val(1)}}</span>";//No I18N
			 		graphParams.notes= {
						"enabled": true,//No I18N
						"chartValues": [//No I18N
							{
								"x": "customAnnotationX2",//No I18N
								"y": "customAnnotationY2",//No I18N
								"type": "customNote",//No I18N
								"htmlEl": "customAnnotationHTML2",//No I18N
								"description": "",//No I18N
								"id": "heatmapNotes_"+widgetParams.id//No I18N
							}
						]
					};
					graphParams.legendEvents={
	                    "click": function(e, d, i, chartObj) {//No I18N
	                        if(chartObj.cache.filter===undefined){
	                        	chartObj.cache.filter = [];
	                        	chartObj.cache.filter.push(i);
	                        }else{
	                        	if(chartObj.cache.filter.contains(i)){
	                        		chartObj.cache.filter.removeObject(i);
	                        	}else{
	                        		chartObj.cache.filter.push(i);	
	                        	}
	                        }

	                        if(chartObj.cache.filter.length===totalData.length){
	                        	chartObj.cache.filter = [];
	                        }

	                        var url = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'; //No I18N
							var params  = {};
							params.widgetID = widgetParams.id;
							if(chartObj.cache.filter.length>0)
	                        {
	                        	var severityArr = [];
	                        	var severityCount = 0;
	                        	for(var i=0;i<chartObj.cache.filter.length;i++)
	                        	{
	                        		severityArr.push(totalData[chartObj.cache.filter[i]][2]);
	                        		severityCount += totalData[chartObj.cache.filter[i]][1];
	                        	}
	                        	params.severity = severityArr.toString();
	                        	$("#heatMapTotal_"+widgetParams.id).hide();//No I18N
	                        	$("#heatMapReset_"+widgetParams.id).show();//No I18N
	                        	$("#heatMapDeviceCount_"+widgetParams.id).text(severityCount);//No I18N
	                        }else{
	                        	$("#heatMapTotal_"+widgetParams.id).show();//No I18N
	                        	$("#heatMapReset_"+widgetParams.id).hide();//No I18N
	                        	$("#heatMapDeviceCount_"+widgetParams.id).text(totalCount);//No I18N
	                        }
							callbackGetWidgetData = function(jsonData) {      
							
									mapParams.id = widgetParams.id;
										mapParams.data = jsonData[widgetParams.id].WidgetData.List;
										mapParams.name = jsonData[widgetParams.id].Name;
										mapParams.isHieraricalGrp = false;
										mapParams.heatMapWidID = "deviceInfoToolTip_"+widgetParams.id; //No I18n
										if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatmapGraphLabel!==undefined) {
											mapParams.heatmapGraphLabel = jsonData.WidgetAdditionalData.heatmapGraphLabel;
										}
										if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.showHeatMapLabel!==undefined) {
											this.set("showHeatMapLabel",jsonData.WidgetAdditionalData.showHeatMapLabel ==="false"? false: true);//No I18N
											if(jsonData.WidgetAdditionalData.showHeatMapLabel !== "false") { 
												$("#widget"+widgetParams.id).removeClass('hideHeatChart');//No I18N
											} else {
												$("#widget"+widgetParams.id).addClass('hideHeatChart');//No I18N
											}
										} else {
											self.set("showHeatMapLabel", true);//No I18N
										}
										self.set('heatMapDetails',mapParams);//No I18N
										opm_loadHeatChart(mapParams,self);

				               // opm_loadHeatMap('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
				            	filterSeverity(graphParams.id, chartObj.cache.filter);
				            }
				            opm_getJSONcallback(url,callbackGetWidgetData,'',params); 
	                    }
	                };
					graphParams.events={
						"events" : {//NO I18N
							"click" : function(event, data, chartObj){//No I18N
								if(data!==undefined && data.point!==undefined){
									var url = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'; //No I18N
									var params  = {};
									params.widgetID = widgetParams.id;

									if(chartObj.cache.filter===undefined){
			                        	chartObj.cache.filter = [];
			                        	chartObj.cache.filter.push(data.itemIndex);
			                        }else{
			                        	if(chartObj.cache.filter.contains(data.itemIndex)){
			                        		chartObj.cache.filter.removeObject(data.itemIndex);
			                        	}else{
			                        		chartObj.cache.filter.push(data.itemIndex);	
			                        	}
			                        }

			                        if(chartObj.cache.filter.length===totalData.length){
			                        	chartObj.cache.filter = [];
			                        }

			                        if(chartObj.cache.filter.length>0)
			                        {
			                        	var severityArr = [];
			                        	var severityCount = 0;
			                        	for(var i=0;i<chartObj.cache.filter.length;i++)
			                        	{
			                        		severityArr.push(totalData[chartObj.cache.filter[i]][2]);
			                        		severityCount += totalData[chartObj.cache.filter[i]][1];
			                        	}
			                        	params.severity = severityArr.toString();
			                        	$("#heatMapTotal_"+widgetParams.id).hide();//No I18N
			                        	$("#heatMapReset_"+widgetParams.id).show();//No I18N
			                        	$("#heatMapDeviceCount_"+widgetParams.id).text(severityCount);//No I18N
			                        }else{
			                        	$("#heatMapTotal_"+widgetParams.id).show();//No I18N
			                        	$("#heatMapReset_"+widgetParams.id).hide();//No I18N
			                        	$("#heatMapDeviceCount_"+widgetParams.id).text(totalCount);//No I18N
			                        }
									callbackGetWidgetData = function(jsonData) {    
										mapParams.id = widgetParams.id;
										mapParams.data = jsonData[widgetParams.id].WidgetData.List;
										mapParams.name = jsonData[widgetParams.id].Name;
										mapParams.isHieraricalGrp = false;
										mapParams.heatMapWidID = "deviceInfoToolTip_"+widgetParams.id; //No I18n

										
										if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatmapGraphLabel!==undefined) {
											mapParams.heatmapGraphLabel = jsonData.WidgetAdditionalData.heatmapGraphLabel;
										}
										if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.showHeatMapLabel!==undefined) {
											this.set("showHeatMapLabel",jsonData.WidgetAdditionalData.showHeatMapLabel ==="false"? false: true);//No I18N
											if(jsonData.WidgetAdditionalData.showHeatMapLabel !== "false") { 
												$("#widget"+widgetParams.id).removeClass('hideHeatChart');//No I18N
											} else {
												$("#widget"+widgetParams.id).addClass('hideHeatChart');//No I18N
											}
										} else {
											self.set("showHeatMapLabel", true);//No I18N
										}
										self.set('heatMapDetails',mapParams);//No I18N
										opm_loadHeatChart(mapParams,self);
										filterSeverity(graphParams.id, chartObj.cache.filter);
										/*heatMapDetails.data = jsonData[widgetParams.id].WidgetData.List;
										self.set('heatMapDetails', heatMapDetails);
										self.notifyPropertyChange('heatMapDetails');				//self.set('heatMapDetails', Object.assign({}, self.get('heatMapDetails')));
									//	self.rerender();				//self.set('heatMapDetails',{self.heatMapDetails,data:jsonData[widgetParams.id].WidgetData.List});
										 //opm_loadHeatMap('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
										opm_loadHeatChart('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
										 filterSeverity(graphParams.id, chartObj.cache.filter); */
										}
						            opm_getJSONcallback(url,callbackGetWidgetData,'',params); 
								}
							}
						}
					};
					if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.wanip.siteHeatMap" || jsonData.Name === "widget.name.wanip.wanipHeatMap") && (jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapGraphType==="none")){ //No I18N

						this.set("showGraph", false); //No I18N
		    		}
					this.set("showZDial",true);//No I18N
		        	this.set('graphParams',graphParams);//No I18N
		        	$("#widget"+widgetParams.id).addClass('heatmapZChart');//No I18N
		        	if(totalData.length===1)
		        	{
		        		$("#widget"+widgetParams.id).addClass('singleData');//No I18N
		        	}
		        }
			}
 		}

 		if(jsonData.Name === "widget.name.spmsummaryheatmap" && jsonData.WidgetAdditionalData.switchAddress !== undefined){
            OPMClient.HomeDetailsController.spmheatmapswitchname=jsonData.WidgetAdditionalData.switchAddress;
		}else if(jsonData.Name === "widget.name.spmsummaryheatmap" && jsonData.WidgetAdditionalData.switchAddress === undefined){//No I18N
			$("#widget"+widgetParams.id).addClass("cctvNoDataWidget");
			$("#widget"+widgetParams.id).text(Ember.I18n.t("webclient.reports.view.nodata",this));	//No I18N
		}
		var deviceListData = jsonData.WidgetData.List;
		if(jsonData.WidgetData.isNFA === undefined && jsonData.WidgetAdditionalData.selectedDrillDownType === "1" && jsonData.WidgetAdditionalData.heatMapType === "Groups"){
			deviceListData = [];
			$.each(jsonData.WidgetData.List,function(k,listObj){
				$.each(treeData,function(i,obj){
					if(listObj.groupName === obj.groupName){
						listObj.ParentLevelGrp = true;
					}
				});
				deviceListData.push(listObj);
			});
		}
		var isWanSiteLeafNode = (jsonData.Name === "widget.name.wanip.siteHeatMap" && jsonData.WidgetAdditionalData.showLeafNode === "true"); //No I18N
		if(isWanSiteLeafNode) {
			mapParams.isWANIPParentView = true; 
			deviceListData = [];
			$.each(jsonData.WidgetData.List, function(k, listObj) {
				if(treeData && treeData.length > 0) {
					$.each(treeData, function(i, obj) {
						if(listObj.deviceName === obj.siteName) {
							listObj.ParentLevelGrp = true;
							// Ensure groupName is populated for the drill-down API call
							if(!listObj.groupName) {
								listObj.groupName = obj.groupName || obj.siteName || listObj.displayName; 
							}
						}
					});
				}
				deviceListData.push(listObj);
			});
		}
		mapParams.id = widgetParams.id;
		mapParams.data = deviceListData;
		mapParams.name = jsonData.Name;
		mapParams.isHieraricalGrp = (jsonData.WidgetData.isNFA === undefined && jsonData.WidgetAdditionalData.selectedDrillDownType === "1" && jsonData.WidgetAdditionalData.heatMapType === "Groups"); //No I18N
		mapParams.allEntitiesareUp = (jsonData.WidgetData.isNFA === undefined && jsonData.WidgetAdditionalData.allEntitiesAreUp !== undefined && jsonData.WidgetAdditionalData.allEntitiesAreUp === true);
		mapParams.heatMapWidID = "deviceInfoToolTip_"+widgetParams.id; //No I18n
		if(isWanSiteLeafNode) {
			mapParams.groupByWanLinks = true; 
			mapParams.isEnabledRedirection = true; 
			self.set('isWanLinkHeatMap', true); //No I18N
		}
		if(jsonData.Name === "widget.name.wanip.wanipHeatMap" || jsonData.Name === "widget.name.wanip.siteHeatMap") {
			mapParams.isOPMAvailabilityData = false; //No I18N - use fault severity colors for WANIP
		}
		if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatmapGraphLabel!==undefined) {
			mapParams.heatmapGraphLabel = jsonData.WidgetAdditionalData.heatmapGraphLabel;
		}
		if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.showHeatMapLabel!==undefined) {
			this.set("showHeatMapLabel",jsonData.WidgetAdditionalData.showHeatMapLabel ==="false"? false: true);//No I18N
			if(jsonData.WidgetAdditionalData.showHeatMapLabel !== "false") { 
				$("#widget"+widgetParams.id).removeClass('hideHeatChart');//No I18N
			} else {
				$("#widget"+widgetParams.id).addClass('hideHeatChart');//No I18N
			}
		} else {
			this.set("showHeatMapLabel", true);//No I18N
		}
		self.set('heatMapDetails',mapParams);//No I18N
		opm_loadHeatChart(mapParams,this);
 	},
 	actions: {
 		subChildActions:function(){
			this.sendAction('action','reload');
		}
		
 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashNfaheatmapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-nfaheatmap",//No I18N
	elemID: "inventoryVBarChart", //NO I18N
	initDefaults: function() {
        var filterParams = this.get("filterParams"); //NO I18N
        if (filterParams != undefined && filterParams.filterInfo != undefined) {
			this.set("elemID", "inventoryVBarChart" + filterParams.filterInfo.widgetID); //NO I18N
        }
    }.on("init"), //NO I18N
 	didInsertElement: function(){
 		var filterParams = this.filterParams;
 		if(filterParams!=undefined){
			OPMClient.InventoryDeviceDetailsController.invListFilterObjects = {};
			OPMClient.InventoryDeviceDetailsController.invMainFilterObjects = {};
 			nfa_setDevicePolarchartValues("#"+this.elemID,filterParams.filterInfo,nfa_dashHeatMapClickEvent); //NO I18N
 		}
 	},
 	actions:{
 		resetDeviceDial:function(){
 			this.sendAction('action','reload');
 		}
 	},
 	willDestroyElement: function(id,jsonData){
 		clearGraphMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashPolarchartComponent = Ember.Component.extend({
	templateName:"components/opm-dash-polarchart",//No I18N
 	didInsertElement: function(){
 		var chartParams = this.polarChartDetails;
 		var heatMapDetails = this.heatMapDetails;
		var clickEvent = undefined;
		if(chartParams!=undefined){
 			var options = {};
 			if(chartParams.showLabelCount!==undefined){
 				options.showLabelCount = chartParams.showLabelCount;
 			}
 			if(chartParams.isOPMAvailabilityData!==undefined){
 				options.isOPMAvailabilityData = chartParams.isOPMAvailabilityData;
 			}
			if(heatMapDetails !== undefined && heatMapDetails.isHieraricalGrp !== undefined && heatMapDetails.isHieraricalGrp)
 			{
				clickEvent = function(obj){
					return false;
				};
			}
				opm_setPolarchartValues('#'+chartParams.id,chartParams.details,clickEvent,options,this);
 		}
 	},
 	actions:{
 		resetDeviceDial:function(){
 			this.sendAction('action','reload');
 		}
 	},
 	chartObserver:function(){
		if(this.get('heatMapDetails.groupByGroups')===true || this.get('heatMapDetails.groupByWanLinks')===true){
		{
			var chartParams = this.polarChartDetails;
			if(chartParams!=undefined){
				var options = {};
				if(chartParams.showLabelCount!==undefined){
					options.showLabelCount = chartParams.showLabelCount;
				}
				if(chartParams.isOPMAvailabilityData!==undefined){
					options.isOPMAvailabilityData = chartParams.isOPMAvailabilityData;
				}
			   options.widgetname = chartParams.widgetname;
				opm_setPolarchartValues('#'+chartParams.id,chartParams.details,undefined,options,this);
			}
		}
	}
		this.rerender();

 	}.observes('polarChartDetails'),//No I18N
 	willDestroyElement: function(){
 		clearGraphMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashHeatchartComponent = Ember.Component.extend({
	templateName:"components/opm-dash-heatchart",//No I18N
	allEntitiesareUp:false,
 	didInsertElement: function(){
		if(this.heatMapDetails!=undefined){
			this.set('allEntitiesareUp',(this.heatMapDetails.allEntitiesAreUp !== undefined && this.heatMapDetails.allEntitiesAreUp === true? true:false)); //No I18N
			if(this.heatMapDetails.isHieraricalGrp === true && (this.heatMapDetails.groupByGroups || this.heatMapDetails.groupByWanLinks)){
				this.send('resetHeatMap');//No I18N
		   }
			if(this.heatMapDetails.groupByWanLinks) {
				var self = this;
				window.wanLinkHeatchartInstances = window.wanLinkHeatchartInstances || {}; 
				window.wanLinkHeatchartInstances[this.heatMapDetails.id] = this;
				if(!window.wanLinkParentSiteClick) {
					window.wanLinkParentSiteClick = function(widgetId, groupName) { 
						var comp = window.wanLinkHeatchartInstances && window.wanLinkHeatchartInstances[widgetId];
						if(comp && !comp.get('isDestroyed')) {
							comp.send('loadWanSiteChildren', groupName); //No I18N
						}
					};
				}
			}
			postHeatChartRenderer(this.heatMapDetails.id,this.heatMapDetails.isOPMAvailabilityData,this.heatMapDetails.heatmapGraphLabel);
		}
 	},
 	actions:{
 		OnclickFileMonitor:function(obj){
 			obj.fromDashboard = true;
 			obj.dashboardType = OPMClient.HomeDetailsController.dashboardType;
 			obj.dashboardName = OPMClient.HomeDetailsController.dashboardName;
 			OPMClient.DeviceMonitorsActionController.set('snapshotObj',obj);//No I18N
 			redirectToDeviceSnapshot(obj.deviceName,'Monitors/FileFolderGraph/'+obj.monType+'/'+obj.filemonitorid+'/'+encodeURIComponent(obj.monitorname));//No I18N
 		},
 		OnclickFolderMonitor:function(obj){
 			obj.fromDashboard = true;
 			obj.dashboardType = OPMClient.HomeDetailsController.dashboardType;
 			obj.dashboardName = OPMClient.HomeDetailsController.dashboardName;
 			OPMClient.DeviceMonitorsActionController.set('snapshotObj',obj);//No I18N
 			redirectToDeviceSnapshot(obj.deviceName,'Monitors/FileFolderGraph/'+obj.monType+'/'+obj.foldermonitorid+'/'+encodeURIComponent(obj.monitorname));//No I18N
 		},
		loadWanSiteChildren: function(groupName) {
			var self = this;
			var heatMapDetails = this.get('heatMapDetails'); //No I18N
			var widgetId = heatMapDetails.id;
			this.set('heatMapDetails.parentsData', (heatMapDetails.data ? heatMapDetails.data.slice() : [])); //No I18N
			this.set('heatMapDetails.selectedParent', groupName); //No I18N
			var url = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'; //No I18N
			var params = { widgetID: widgetId, groupName: groupName };
			opm_getJSONcallback(url, function(responseData) {
				var rawList = (responseData && responseData[widgetId] && responseData[widgetId].WidgetData && responseData[widgetId].WidgetData.List) ? responseData[widgetId].WidgetData.List : [];
				// Process raw child WANIP items to add the heatmap display properties
				// (mirrors opm_loadHeatChart logic for widget.name.wanip.wanipHeatMap)
				var childList = [];
				$.each(rawList, function(i, obj) {
					obj.tooltipData = '{"'+Ember.I18n.t('webclient.devices.details.devicename')+'":"'+escapeHtmlTags(obj.displayName)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.devices.details.ipaddress')+'":"'+(obj.ipAddress)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.opm.wanlinks.sitename')+'":"'+escapeHtmlTags(obj.siteName)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.topo.actions.deviceinfo.status')+'":"'+(obj.statusStr)+'",' //No I18N
						'"'+Ember.I18n.t('webclient.map.type')+'":"'+(obj.type)+'"}'; //No I18N
					obj.datastatus = obj.statusNum;
					obj.className = 'heatmapStatus opmToolTipDesc alignCenterTxt ' + severityClass + obj.statusNum + ' wid_' + heatMapDetails.id; //No I18N
					obj.divid = 'HeatMapDiv_' + i; //No I18N
					obj.siteMoName = obj.siteMoName || obj.deviceName;
					obj.onClickFunc = 'opm_hideHeatmapTooltip();window.isHeatMapClicked=true;redirectWanLinkSnapshot(\''+obj.deviceName+'\',\''+obj.siteMoName+'\'); setTimeout(function(){opm_resizeHeatmap();}, 0);'; //No I18N
					childList.push(obj);
				});
				// Switch to child WANIP view before updating data so the lazy heatmap renders the right branch
				self.set('heatMapDetails.isWANIPParentView', false); //No I18N
				self.set('heatMapDetails.data', childList); //No I18N
				self.set('heatMapDetails.interactiveView', true); //No I18N
				// chartObserver on OpmDashHeatchartComponent rerenders the lazy heatmap
				// which calls postHeatChartRenderer and opm_customTooltip internally
			}, '', params);
		},
		 resetHeatMap:function(){
			// For WAN site leaf-node: openWanSiteHeatMapInfo sets deviceData/interactiveView but never
			// changes heatMapDetails.data (parent sites). On reset, just clear child state.
			var isWanLinkChildView = !!(this.get('heatMapDetails.groupByWanLinks') && this.get('heatMapDetails.interactiveView')); //No I18N
			var parentSiteData = null;
			if(isWanLinkChildView) {
				this.set('heatMapDetails.deviceData', []); //No I18N
				this.set('heatMapDetails.ChildrenData', []); //No I18N
				this.set('heatMapDetails.isWANIPParentView', true); //No I18N
				var savedParents = this.get('heatMapDetails.parentsData') || []; //No I18N
				if(savedParents.length && savedParents[0].datastatus !== undefined) {
					// loadWanSiteChildren replaced data with child links — restore parent sites
					this.set('heatMapDetails.data', savedParents.slice()); //No I18N
					parentSiteData = savedParents;
				} else {
					// openWanSiteHeatMapInfo path — data was never replaced, still holds parent sites
					parentSiteData = this.get('heatMapDetails.data') || []; //No I18N
				}
			}
			this.set('heatMapDetails.interactiveView',false);//No I18N
			this.set("heatMapDetails.filterView",false);//No I18N
			this.set("heatMapDetails.parentsData",[]);//No I18N
			var self = this;
			var _parentSiteData = parentSiteData;
				setTimeout(function(){
					opm_customTooltip();
					try {
					var polarChartDetails = self.get('polarChartDetails');
					var id = self.get('heatMapDetails.id'); //No I18N
					if(!polarChartDetails || !polarChartDetails.details) { return; }
					var details = polarChartDetails.details;
					if(details[details.length-1].Status == 7)
					{
						details.pop();
						details.pop();
					}
					if(isWanLinkChildView && _parentSiteData) {
						// Count severity directly from parent site data to avoid Ember DOM-timing issues
						var severityCountMap = {};
						$.each(_parentSiteData, function(_idx, obj) {
							var s = String(obj.datastatus);
							severityCountMap[s] = (severityCountMap[s] || 0) + 1;
						});
						for (var i = 0; i < details.length; i++) {
							details[i].Count = severityCountMap[String(details[i].Status)] || 0;
						}
						var parentComp = window.widgetStore && window.widgetStore[id];
						if(parentComp) {
							var graphParams = parentComp.get('graphParams'); //No I18N
							if(graphParams && graphParams.graphData) {
								var newGraphData = [];
								for(var gi = 0; gi < graphParams.graphData.length; gi++) {
									var d = graphParams.graphData[gi];
									newGraphData.push([d[0], severityCountMap[String(d[2])] || 0, d[2]]);
								}
								graphParams.graphData = newGraphData;
								parentComp.set('graphParams', $.extend(true, {}, graphParams)); //No I18N
							}
						}
					} else {
						for (var i = 0; i < details.length; i++) {
							details[i].Count = parseInt($('#heatmap_' + id + ' div.severity_' + details[i].Status).length);
						}
					}
					polarChartDetails.details = details;
					self.set("polarChartDetails", $.extend(true,[],polarChartDetails));//No I18N
					} catch(e) {}
				},200);



		 }
 	},
 	chartObserver:function(){
 		this.rerender();
 		var obj ={};
 		var MonitorName,Status,filepath,DeviceName,folderpath,folderSize,FileCount,FileAge,FileSize,Note;
 		Note = Ember.I18n.t("webclient.advance.settings.note",this);//No I18N
 		if(this.heatMapDetails.name=='widget.name.fileheatmap')
 		{
 			$.each(this.heatMapDetails.data,function(key,value)
			{
				 obj ={};
				 MonitorName = Ember.I18n.t("webclient.common.appmanager.monitorname.text",this);//No I18N
				 Status = Ember.I18n.t("webclient.fault.event.severity",this);//No I18N
				 filepath = Ember.I18n.t("webclient.map.filemonitor.filepath",this);//No I18N
				 DeviceName = Ember.I18n.t("Alertmail.body5",this);//No I18N
				 FileAge = Ember.I18n.t("webclient.map.filemonitor.fileage",this);//No I18N
				 FileSize = Ember.I18n.t("fwa.setting.file.size",this);//No I18N
				obj[MonitorName] = value.monitorname;
				obj[Status] = value.statusStr;
				obj[filepath] = value.filepath;
				obj[DeviceName] = value.displayName;
 				if(value.FileExist !== "No")
 				{
 					obj[FileAge] = value.FileAge;
					obj[FileSize] = value.FileSize;
 				}
 				else
 				{
 					obj[Note] =Ember.I18n.t("webclient.map.filemonitor.select.filedoesnotexist",this);//No I18N
 				}
				value.tooltipData=JSON.stringify(obj);
			});
 		}
 		else if(this.heatMapDetails.name=='widget.name.folderheatmap')
 		{
 			$.each(this.heatMapDetails.data,function(key,value)
			{
 				obj ={};
 				MonitorName = Ember.I18n.t("webclient.common.appmanager.monitorname.text",this);//No I18N
				 Status = Ember.I18n.t("webclient.fault.event.severity",this);//No I18N
				 folderpath = Ember.I18n.t("webclient.map.filemonitor.folderpath",this);//No I18N
				 DeviceName = Ember.I18n.t("Alertmail.body5",this);//No I18N
				 folderSize = Ember.I18n.t("webclient.map.foldermonitor.foldersize",this);//No I18N
				 FileCount = Ember.I18n.t("webclient.map.foldermonitor.filecount",this);//No I18N
				obj[MonitorName] = value.monitorname;
				obj[Status] = value.statusStr;
				obj[folderpath] = value.folderpath;
				obj[DeviceName] = value.displayName;
 				if(value.FolderExist !== "No")
 				{
 					obj[folderSize] = value.FolderSize;
					obj[FileCount] = value.FileCount;
 				}
 				else
 				{
 					obj[Note] =Ember.I18n.t("webclient.map.filemonitor.select.folderdoesnotexist",this);//No I18N
 				}
				value.tooltipData=JSON.stringify(obj);
			});
 		}
 	}.observes('heatMapDetails'),//No I18N
 	willDestroyElement: function(){
		if(this.heatMapDetails && this.heatMapDetails.groupByWanLinks) {
			var widgetId = this.heatMapDetails.id;
			if(window.wanLinkHeatchartInstances && window.wanLinkHeatchartInstances[widgetId]) {
				delete window.wanLinkHeatchartInstances[widgetId];
			}
		}
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashOpmRemoteGridComponent = Ember.Component.extend({
	templateName:"components/opm-dash-grid", //NO I18N
	widgetClassName:"opm_jqGridUI",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var data = {};
 		if(jsonData.WidgetData.category !== undefined){
 			data.category = jsonData.WidgetData.category;
 		}
 		if(jsonData.WidgetData.bvName !== undefined){
 			data.bvName = jsonData.WidgetData.bvName;
 		}
 		if(jsonData.WidgetData.groupName !== undefined){
 			data.groupName = jsonData.WidgetData.groupName;
 		}
 		if(jsonData.WidgetAdditionalData.selectedMonType !== undefined){
 			data.selectedMonType = jsonData.WidgetAdditionalData.selectedMonType;
 		}
 		if(jsonData.WidgetAdditionalData.hideEmptyDevices !== undefined){
 			data.hideEmptyDevices = jsonData.WidgetAdditionalData.hideEmptyDevices;
 		}
		var onSelectFunction="",sortOrder="",sortName="";
 		switch(jsonData.Name)
 		{
 			case "widget.name.interfaceView"://No I18N
 				onSelectFunction="DevByIntfView";//No I18N
 				sortOrder="desc";//No I18N
 				sortName="interfaceCount";//No I18N
 				this.set("widgetClassName","opm_jqGridUI liveWidget");//No I18N
 				break;
			case "widget.name.monitorView"://No I18N
				onSelectFunction="DevByMonitorView"; //No I18N
				sortName="displayName";//No I18N
				sortOrder="asc";//No I18N
				this.set("widgetClassName","opm_jqGridUI liveWidgetMonView");//No I18N
				opmWidget_MonViewArr[widgetParams.id]=true;
 			 break;
 		}
 		var gridCallBack = function(wID){
			dashcallbackNew(wID);
       	}
 		var dObj = {
	        "id":"#"+widgetParams.id,//No I18N
	        "apiUrl":jsonData.WidgetData.apiUrl,//No I18N
	        "data":data,//No I18N
	        "colNamesList":jsonData.GridWidget.colNamesList,//No I18N
	        "colModelList":jsonData.GridWidget.colModelList,//No I18N
	        "pagerId":"#"+widgetParams.widgetPagerId,//No I18N
	        "rowNum":jsonData.WidgetData.showOnly,//No I18N
	        "sortType":sortOrder,//No I18N
	        "sortOrder":sortOrder,//No I18N
	        "sortName":sortName,//No I18N
	        "sortColName":sortName,//No I18N
	        "enableColChooser":false,//No I18N
	        "enableTopColChooser":false,//No I18N
	        "gridTableId":"#"+widgetParams.id,//No I18N
	        "onSelectFunction":onSelectFunction,//No I18N
	        "searchOption":false,//No I18N
			"toggleSearch":false,//No I18N
			"showPagerSearch":false,//No I18N
			"showPagerColumnChooser":false,//No I18N
			"defaultOptions":{"multiselect":false},//No I18N
			"rowList":[10,25,50,100,500],//No I18N
			"gridCallBack":gridCallBack//No I18N
        };
 		opm_loadJqGridBasedOnCount(dObj);
 	},
 	willDestroyElement: function(){
		clearGridMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashRemoteGridComponent = Ember.Component.extend({
	templateName:"components/opm-dash-grid", //NO I18N
	widgetClassName:"opm_jqGridUI",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var url = jsonData.WidgetData[0].apiUrl + "?jqgridLoad=true"; // No I18N
 		// Session-guarded apiUrl: the rows never arrive here, so route the fetch through /embedWidget.
 		if (window.OPM.isEmbed) {
 			var embedBase = '/embedWidget?type=' + window.OPM.Embedtype + '&widgetID=' + widgetParams.id + '&apiKey=EmbedView&authKey=' + window.OPM.authKey; //No I18N
 			if (window.OPM.Embedtype === 'cctv') { //No I18N
 				embedBase = '/embedWidget?type=cctv&cctvID=' + window.OPM.cctvID + '&widgetID=' + widgetParams.id + '&apiKey=EmbedView&authKey=' + window.OPM.authKey; //No I18N
 			}
 			url = embedBase + '&jqgridLoad=true&methodCall=' + jsonData.WidgetData[0].methodCall; //No I18N
 		}
 		//single static param
 		/*if(jsonData.WidgetData[0].id==="DEBackupScheduleList")
 		{
 			url=url+'&taskType=Configuration%20Backup';// No I18N
 		}*/
 		if(jsonData.WidgetData[0].id==="DEConfigsChangeAuthList"||jsonData.WidgetData[0].id==="DEConfigsChangeUnAuthList")
 		{
 			if(jsonData.WidgetData[0].id==="DEConfigsChangeAuthList")
 			{
 				url=url+'&advancedFilters='+encodeURIComponent('{"NCMVersion__CHANGE_TYPE":["0"]}');//No I18N
 			}
 			else
 			{
 				url=url+'&advancedFilters='+encodeURIComponent('{"NCMVersion__CHANGE_TYPE":["1"]}');//No I18N
 			}
 		}
 		var colModelList = jsonData.WidgetData[0].colModelList;
 		for(var i = 0; i < colModelList.length; i++)
 		{
 			var columnModel = colModelList[i];
 			if(columnModel.formatter != null && columnModel.formatter != "")
 			{
 				var tmpFunc = new Function('return '+columnModel.formatter);
 				columnModel.formatter = tmpFunc();
 			}
 		}
 		var defaultOptions={};
 		defaultOptions.rowNumNeeded =false;
 		defaultOptions.setWidth = false;
 		var onSelectFunctionName = "";//No I18N
 		switch(jsonData.WidgetData[0].id)
 		{
 		    case 'DEBackupsLastList'://No I18N
 				onSelectFunctionName='DEBackupsLastList';//No I18N
 		        break;
 		    case 'DEBackupsAllList'://No I18N
 				onSelectFunctionName='DEBackupsAllList';//No I18N
 		        break;
 		    case 'DEBackupScheduleList'://No I18N
 				onSelectFunctionName='DEBackupScheduleList';//No I18N
 		        break;
 		    case 'DEConflictsList'://No I18N
 				onSelectFunctionName='DEConflictsList';//No I18N
 		        break;
 		    case 'DEConflictsNAList'://No I18N
 				onSelectFunctionName='DEConflictsNAList';//No I18N
 		        break;
 		    case 'DEConfigsChangeList'://No I18N
 				onSelectFunctionName='DEConfigsChangeList';//No I18N
 		        break;
 		    case 'DEConfigsChangeAuthList'://No I18N
 				onSelectFunctionName='DEConfigsChangeAuthList';//No I18N
 		        break;
 		    case 'DEConfigsChangeUnAuthList'://No I18N
 				onSelectFunctionName='DEConfigsChangeUnAuthList';//No I18N	
 		        break;
 		    case 'DEResourcePoliciesStausTable'://No I18N
 				onSelectFunctionName='DEResourcePoliciesStausTable';//No I18N	
 		        break;
 		    case 'DECompliancePolicyList'://No I18N
 				onSelectFunctionName='DECompliancePolicyList';//No I18N
 		        break;
 		    case 'DEcomplianceRGroupsList'://No I18N
 				onSelectFunctionName='DEcomplianceRGroupsList';//No I18N
 		        break;
 		    case 'DEComplianceRulesList'://No I18N
 				onSelectFunctionName='DEComplianceRulesList';//No I18N
 		        break;      
 		    case 'DEEOLDevicesList'://No I18N
 				onSelectFunctionName='DEEOLDevicesList';//No I18N
 		        break;  
 		    case 'DEEOLNADeviceList'://No I18N
 				onSelectFunctionName='DEEOLNADeviceList';//No I18N
 		        break;  
 		    case 'DEBaseRunningConflictList'://No I18N
 				onSelectFunctionName='DEBaseRunningConflictList';//No I18N
 		        break;
 		    case 'DEBaseRunningConflictNAList'://No I18N
 				onSelectFunctionName='DEBaseRunningConflictNAList';//No I18N
 		        break;
 		    case 'DEPCIALLReviewsList'://No I18N
 				onSelectFunctionName='DEPCIALLReviewsList';//No I18N
 		        break;
 		    case 'DEPCIMyReviewsList'://No I18N
 				onSelectFunctionName='DEPCIMyReviewsList';//No I18N
 		        break;
            case 'FirmwareVulnerabilityDashBoard'://No I18N
                onSelectFunctionName='FirmwareVulnerabilityDashBoard';//No I18N
                defaultOptions.minRowsPerPage = 10;
                defaultOptions.rowList = [10,25,50,100,150,200,300,400,500,1000];
                defaultOptions.isSnapshotGrid=true;
                if(OPMClient.HomeDetailsController.dashboardType!=='NCM' || OPMClient.NCMFirmwareVulnerability.isDashboard === true)//No I18N
                {
                    url = url + '&SEVERITY=high';//No I18N
                }
                break;
            case 'FirmVulVersionDashGrid'://No I18N
                onSelectFunctionName='FirmVulVersionDashGrid';//No I18N
                break;
            case 'FirmVulDeviceDashGrid'://No I18N
                onSelectFunctionName='FirmVulDeviceDashGrid';//No I18N
                break;
 		    default:
 		    	onSelectFunctionName = "";//No I18N
 		}
        defaultOptions.gridCallBack = function(gridTableIdAlone){
            gridTableIdAlone = gridTableIdAlone.replace("#","");
            gridWidthAlignment(gridTableIdAlone);
        };
 		loadJQgridWithRemote("#"+widgetParams.id,url,jsonData.WidgetData[0].colNamesList, colModelList,"","#widget_pager_"+widgetParams.id,onSelectFunctionName,defaultOptions); //No I18N
 	},
 	willDestroyElement: function(){
		clearGridMemory('#'+this.elementId);
	}
});


OPMClient.OpmDashGridComponent = Ember.Component.extend({
	templateName:"components/opm-dash-grid", //NO I18N
	widgetClassName:"opm_jqGridUI",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var wName = jsonData.Name;
 		var colNamesList = [],colModelList = [];
 		var onSelectFunctionName;
 		var defaultOptionsForTable = {};
 		var self =this;
 		switch(jsonData.WidgetName)
 		{
 		    case 'widget.name.lastBackup'://No I18N
 				onSelectFunctionName='wlastBackup';//No I18N
 		        break;
 		    case 'widget.name.allBackup'://No I18N
 				onSelectFunctionName='wallBackup';//No I18N
 		        break;
 		    case 'widget.name.noConfigConflict'://No I18N
 				onSelectFunctionName='wnoConfigConflict';//No I18N
 		        break;
 		    case 'widget.name.ConfigConflict'://No I18N
 				onSelectFunctionName='wConfigConflict';//No I18N
 		        break;
 		    case 'widget.name.allConfigUnAuthChnage'://No I18N
 				onSelectFunctionName='wallConfigUnAuthChnage';//No I18N
 		        break;
 		    case 'widget.name.allConfigAuthChnage'://No I18N
 				onSelectFunctionName='wallConfigAuthChnage';//No I18N
 		        break;
 		    case 'widget.name.allConfigChnage'://No I18N
 				onSelectFunctionName='wallConfigChnage';//No I18N
 		        break;
 		    case 'widget.name.compStatDetails'://No I18N
 				onSelectFunctionName='wcompStatDetails';//No I18N
 		        break;
 		    default:
 		    	if(perfTopNWidgets.contains(wName)){
 		    		onSelectFunctionName = 'perfTopNWidget';//No I18N
 		    	}else{
 		    		onSelectFunctionName = 'widgetList';//No I18N
 		    	}
 		}
		switch(wName)
		{
			case "widget.name.devicesummary"://No I18N
				var newJson = [];
				if(Array.isArray(jsonData.WidgetData)){
					newJson = jsonData.WidgetData;
				}else{
				$.each(jsonData.WidgetData,function(key,value)
				{
					newJson.push({name:key,total:value.total,status:value.status,alerts:value.alerts,vendorId:value.vendorId,assocID:widgetParams.id});
				});
				}
				jsonData.WidgetData = newJson;
				defaultOptionsForTable.subGrid = true;
				defaultOptionsForTable.onSelectFunctionName = "DeviceSummaryWidget"; //No I18n
				defaultOptionsForTable.isDashboardWidget = true;
				jsonData.GridWidget.colModelList[0].width = "30";
				jsonData.GridWidget.colModelList[1].width = "80";
				jsonData.GridWidget.colModelList[2].width = "50";
				jsonData.GridWidget.colModelList[3].width = "50";
				break;
			case "widget.name.bvsummary"://No I18N
				defaultOptionsForTable.subGrid = true;
				defaultOptionsForTable.onSelectFunctionName = "BVSummary"; //No I18n
				defaultOptionsForTable.isDashboardWidget = true;
				jsonData.GridWidget.colModelList[0].width = "60";//No I18N
				break;
			case "widget.name.NutanixTopN"://No I18N
				if (jsonData.GridWidget.colNamesList[1].indexOf(jsonData.WidgetAdditionalData.graphUnit) == -1) {
					jsonData.GridWidget.colNamesList[1] += " ( " +jsonData.WidgetAdditionalData.graphUnit+" ) ";
					jsonData.GridWidget.colNamesList[2] += " ( " +jsonData.WidgetAdditionalData.graphUnit+" ) ";
					jsonData.GridWidget.colNamesList[3] += " ( " +jsonData.WidgetAdditionalData.graphUnit+" ) ";
				}
				break;
			case "widget.name.gpu.monitor"://No I18N
				if (jsonData.WidgetAdditionalData && jsonData.WidgetAdditionalData.graphUnit && jsonData.GridWidget.colNamesList[2].indexOf(jsonData.WidgetAdditionalData.graphUnit) == -1) {
					jsonData.GridWidget.colNamesList[2] = jsonData.GridWidget.colNamesList[2].replace(/\(.*\)/, "(" + jsonData.WidgetAdditionalData.graphUnit + ")");//No I18N
					jsonData.GridWidget.colNamesList[3] = jsonData.GridWidget.colNamesList[3].replace(/\(.*\)/, "(" + jsonData.WidgetAdditionalData.graphUnit + ")");//No I18N
					jsonData.GridWidget.colNamesList[4] = jsonData.GridWidget.colNamesList[4].replace(/\(.*\)/, "(" + jsonData.WidgetAdditionalData.graphUnit + ")");//No I18N
				}
				break;
			case "widget.name.infrasnap"://No I18N
				jsonData.GridWidget.colModelList[0].width = "30";
				onSelectFunctionName = "infrasnapWidget"; //No I18n
				$("#widget"+widgetParams.id).parent().addClass('infrasnapWidget');//No I18n
				var additionalParam = widgetParams.apiData.WidgetAdditionalData;
				if(additionalParam.isfilter){
					OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id] = {};
					if(additionalParam.groupName !== undefined){
						OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id].groupName = additionalParam.groupName;
					}else{
						OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id].bview = additionalParam.bview;
					}
					if(additionalParam.selectedSev){
						OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id].selectedSev = additionalParam.selectedSev;
					}
				}else if(!additionalParam.isfilter && OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id] !== undefined){
					delete OPMClient.HomeDetailsController.widgetAditnlDetails[widgetParams.id];
				}
				break;
			case "widget.name.lastpolledtraf"://No I18N
				jsonData.WidgetData = [jsonData.WidgetData];
				break;
			case "widget.name.syslogs"://No I18N
				jsonData.WidgetData = jsonData.WidgetData.List;
				break;
			case "widget.name.ncmconfigchanges"://No I18N
				onSelectFunctionName = "wncmconfigchanges"; //No I18n
				break;
			case "widget.name.ncmrecentbackup"://No I18N
				onSelectFunctionName = "wncmrecentbackup"; //No I18n
				break;
			case "widget.name.ncmcompliance"://No I18N
				onSelectFunctionName = "wncmcompliance"; //No I18n
				break;
			case "widget.name.ncmeolandannounced"://No I18N
				onSelectFunctionName = "wncmeolandannounced"; //No I18n
				break;
			case "widget.name.pending.configuploadreq"://No I18N
				onSelectFunctionName = "wncmpendingconfiguploadreq"; //No I18n
				break;
			case "widget.name.deviceresp"://No I18N
				jsonData.GridWidget.colNamesList[4] = jsonData.GridWidget.colNamesList[4]+"(ms)";//No I18n
				break;
			case "widget.name.firewalldevList"://No I18N
				onSelectFunctionName='fwadevListWidget';//No I18N
				break;
			case "widget.name.liverecentalarms"://No I18N
				this.set("widgetClassName","opm_jqGridUI liveWidgetRecentAlarms");//No I18N
				break;
			case "widget.name.alllogicalgroup": //No I18N
					defaultOptionsForTable.sortName = "availability";//No I18N
					defaultOptionsForTable.sortOrder = "asc";//No I18N
					var hideGrpAvailability = false;
					if((window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isShowGroupAvailCentral !== undefined && !window.OPM.isShowGroupAvailCentral) {
						hideGrpAvailability = true;
					}
					jsonData.GridWidget.colModelList[0].width = "10";
					jsonData.GridWidget.colModelList[1].width = "40";
					jsonData.GridWidget.colModelList[2].width = "50";	
					jsonData.GridWidget.colModelList[7].width = "32";
					jsonData.GridWidget.colModelList[8].width = "40";
					jsonData.GridWidget.colModelList[9].width = "40";
					jsonData.GridWidget.colModelList[8].hidden = hideGrpAvailability;
				break;
			case "widget.name.sitess"://No I18N
				onSelectFunctionName = "siteSnapshotWidget"; //No I18n
				break;	
			case "widget.name.devicetypesummary"://No I18N
				onSelectFunctionName = "deviceTypeSummaryWidget"; //No I18n
				break;
			case "widget.name.vendorsummary"://No I18N
				onSelectFunctionName = "vendorSummaryWidget"; //No I18n
				break;		
			case "widget.name.sitewisesummary"://No I18N
				onSelectFunctionName = "siteWiseSummaryWdiget"; //No I18n
				break;	
			case "widget.name.interfacesummary"://No I18N
				onSelectFunctionName = "interfaceSummaryWidget"; //No I18n
				break;	
			case "widget.name.appserversummary"://No I18N
				onSelectFunctionName = "appserverSummaryWidget"; //No I18n
				break;
			case "widget.name.virtualsummary"://No I18N
				onSelectFunctionName = "virtualVendorSummaryWidget"; //No I18n
				break;
			case "widget.name.vmossummary"://No I18N
				onSelectFunctionName = "vmosSummaryWidget"; //No I18n
				break;
			case "widget.name.severitysummary"://No I18N
				onSelectFunctionName = "severitySummaryWidget"; //No I18n
				break;
			case "widget.name.deviceAcrossProbe"://No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaDeviceWidget"; //No I18n
				}
				break;
			case "widget.name.alarmsbycategory"://No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaAlarmsbycategory"; //No I18n
				}
				break;
			case "widget.name.vpnstat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaVpnReport"; //No I18n
				}
				break;
			case "widget.name.securitystat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaSecurityReport"; //No I18n
				}
				break;
			case "widget.name.rulesstat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaRulesView"; //No I18n
				}
				break;
			case "widget.name.objstat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaObjView"; //No I18n
				}
				break;
			case "widget.name.configstat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaConfView"; //No I18n
				}
				break;
			case "widget.name.anomalystat": //No I18N
				if(window.OPM.isOPMEEUnifiedConsoleView){
					onSelectFunctionName = "fwaAnomalyView"; //No I18n
				}
				break;
				
			case "widget.name.ncmee.VendorDevicesSummary"://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmEEDevicesSummaryGrid");//No I18N
				onSelectFunctionName = "ncmVendorOnClick"; //No I18n
 		        break;	
			case "widget.name.ncmee.OSDevicesSummary"://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmEEDevicesSummaryGrid");//No I18N
				onSelectFunctionName = "ncmOsTypeOsVersionOnClick"; //No I18n
 		        break;	

			case "widget.name.ncmee.DeviceTypeDevicesSummary"://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmEEDevicesSummaryGrid");//No I18N
				onSelectFunctionName = "ncmDTOnClick"; //No I18n

 		        break;	
			case "widget.name.ncmee.SeriesModelDevicesSummary"://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmEEDevicesSummaryGrid");//No I18N
				onSelectFunctionName = "ncmSeriesModelOnClick"; //No I18n
 		        break;	

			case "widget.name.ncmee.ConfigBackupSummary"://No I18N
				onSelectFunctionName = "ncmConfigBackupSummaryOnClick"; //No I18n
 				this.set("widgetClassName","opm_jqGridUI ncmEEDevicesSummaryGrid");//No I18N
				break;	
				
			case 'widget.name.ncmee.ConfigurationConflictSummary'://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmconflictprogress");//No I18N
 		        break;
			case 'widget.name.ncmee.NetworkPolicyViolationSummary'://No I18N
 				this.set("widgetClassName","opm_jqGridUI ncmconflictprogress");//No I18N
 		        break;
			case "widget.name.recentalarms"://No I18N
 				this.set("widgetClassName","opm_jqGridUI themeOne no-strips opmLinkUnderLineNone");//No I18N
 		        break;
			case "widget.name.sdwan.sitefabric"://No I18N
				 defaultOptionsForTable.subGrid = true;
				 defaultOptionsForTable.onSelectFunctionName = "SDWANSitesDashBoardSelFn"; //No I18n
				 //defaultOptionsForTable.subGridFunction = "SDWANSitesVSChildListSubGrid";//No I18N
				 defaultOptionsForTable.isDashboardWidget = true;
				 jsonData.GridWidget.colModelList[0].width = "60";//No I18N
				 defaultOptionsForTable.colNamesList1 = [
					Ember.I18n.t('webclient.common.intro.Hostname',this),// No I18N
					Ember.I18n.t('webclient.topo.ipAddress',this),// No I18N
					Ember.I18n.t('opstor.inventory.smi.raid.component.hstate',this),// No I18N
					Ember.I18n.t('webclient.reports.devicestate',this),// No I18N
					Ember.I18n.t('webclient.storage.devicemodel',this),// No I18N
					'',
					''
				 ];
				 defaultOptionsForTable.colModelList1 = [
					{ name:"hostName", index:"hostName", classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
						if(rowdata.deviceMOName !== undefined) {
							return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> <a onclick='redirectToDeviceSnapshot(\""+rowdata.deviceMOName+"\")' class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a>";//No I18N
						}
						else{
							return cellValue;
						}
					}},
					{ name:"systemIP", index:"systemIP"},//No I18N
					{ name:"healthState", index:"healthState"},//No I18N
					{ name:"deviceState", index:"deviceState"},//No I18N
					{ name:"model", index:"model"},//No I18N
					{ name:"status", index:"status", hidden:"true"},//No I18N
					{ name:"deviceMOName", index:"deviceMOName", hidden:"true"}//No I18N
				 ];
				 break;
			case "webclient.snmp.tabular.widget": // No I18N
				var jqGridFormat = getTableOIDJqgridFormat(jsonData.WidgetData, "#" + widgetParams.id);
				if(!jsonData.GridWidget.colNamesList && !jsonData.GridWidget.colModelList) {
					jsonData.GridWidget = {
						colNamesList: jqGridFormat.colNames,
						colModelList: jqGridFormat.colModels
					}
					jsonData.WidgetData = jqGridFormat.colData;
				}
				
				defaultOptionsForTable.minRowsPerPage = jqGridFormat.defaultOptions.minRowsPerPage;
				defaultOptionsForTable.rowNum = jqGridFormat.defaultOptions.rowNum;
				defaultOptionsForTable.shrinkToFit = jqGridFormat.defaultOptions.shrinkToFit;
				defaultOptionsForTable.autoWidth = jqGridFormat.defaultOptions.autoWidth;
				break;
			case "NFADB.AI.topServices": //NO I18N
				colModelList = [
					{name: "hostName", index: "hostName", classes: "pointer underlineLink"}, //NO I18N
					{name: "avgNrt", index: "avgNrt", sorttype: nfa_customSort}, //NO I18N
					{name: "avgArt", index: "avgArt", sorttype: nfa_customSort}, //NO I18N
					{name: "bytes", index: "bytes", sorttype: nfa_customSort} //NO I18N
				];
				onSelectFunctionName = "dpi_dashboardWidget"; //NO I18N
				defaultOptionsForTable.onSelectParams = {dpiEngineID: jsonData.WidgetData.dpiEngineID, snapType: "DPILayer7", gridParam: "hostName"}; //NO I18N
				break;
		}

		if (jsonData.WidgetForwardPage.indexOf("IPSLATopCallPaths") >= 0){
				onSelectFunctionName = "IPSLATopCallPaths"; //No I18n
			}else if (jsonData.WidgetForwardPage.indexOf("WANLeast") >= 0){
				onSelectFunctionName = "WANLeast"; //No I18n
			}

		/*if(jsonData.GridWidget != undefined && jsonData.GridWidget.colModelList != undefined){
			colModelList = jsonData.GridWidget.colModelList;
		}
		if(jsonData.GridWidget != undefined && jsonData.GridWidget.colNamesList != undefined){
			colNamesList = jsonData.GridWidget.colNamesList;
		}
		var lenFlag=false;
		var isArrayType=true;
		if(jsonData.WidgetData!=undefined && jsonData.WidgetData.length>0){
			lenFlag=true;
		}
		if(typeof jsonData.WidgetData === "object" && jsonData.WidgetData.List!==undefined && Object.keys(jsonData.WidgetData.List).length > 0){
			lenFlag=true;
			isArrayType=false;
		}
		if(jsonData.WidgetData !== undefined && jsonData.WidgetData !== null && lenFlag)
		{
			for(var i = 0; i < colModelList.length; i++)
			{
				var columnModel = colModelList[i];
				if(columnModel.formatter != null && columnModel.formatter != "") {
					if (typeof columnModel.formatter != 'undefined') {
						var tmpFunc = new Function('return '+columnModel.formatter);
					    columnModel.formatter = tmpFunc();
					}
				}
				if(columnModel.hidden!=undefined && columnModel.hidden=="true"){
					columnModel.hidden = true;	
				}
			}
			defaultOptionsForTable.minRowsPerPage = 25;
			var gridData;
			if(isArrayType){
				gridData=jsonData.WidgetData;
			}
			else{
				gridData=jsonData.WidgetData.List;
			}
			opm_loadJQgridWithData("table[id="+widgetParams.id+"]",gridData,colNamesList,colModelList,"","#widget_pager_"+widgetParams.id,onSelectFunctionName,defaultOptionsForTable); //No I18N
			$("#widget_pager_"+widgetParams.id+"_left").hide();
		}
		else
		{
			$("#"+widgetParams.id).html(Ember.I18n.t("webclient.reports.view.nodata",this)); //No I18n
			// if(OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide") !=-1)
			// {
			// 	$("[data-widgetid="+widgetParams.id+"]").addClass("cctvNoDataWidget");
			// }
		}*/
		
		var gridData = $.extend(true,[],jsonData.WidgetData);
		if(jsonData.WidgetType === "Summary" && jsonData.Name == "widget.name.liverecentalarms" && gridData.List !== undefined && gridData.List.length >= 0)
			{
			colNamesList = jsonData.GridWidget.colNamesList;
			colModelList = jsonData.GridWidget.colModelList;
			gridData = gridData.List;
			colNamesList.push("");
			colModelList.push({name: "showHighlightMsg", width: 1, index: "showHighlightMsg",hidden:true,hidedlg:true});
			opm_loadJQgridWithData("#"+widgetParams.id,gridData, colNamesList, colModelList, "", "#widget_pager_"+widgetParams.id, onSelectFunctionName,defaultOptionsForTable); //No I18N
			$("#widget_pager_"+widgetParams.id+"_left").hide();
			if(jsonData.WidgetAdditionalData !== undefined)
			{
				if(jsonData.WidgetAdditionalData.category !== undefined)
				{
					$("#"+widgetParams.id).data("category",jsonData.WidgetAdditionalData.category);
				}
				if(jsonData.WidgetAdditionalData.severity !== undefined)
				{
					$("#"+widgetParams.id).data("severity",jsonData.WidgetAdditionalData.severity);
				}
			}
			return;
			}
		else if(jsonData.WidgetType === "Summary" && gridData.List !== undefined && gridData.List.length > 0)
			{
			colNamesList = jsonData.GridWidget.colNamesList;
			colModelList = jsonData.GridWidget.colModelList;
			gridData = gridData.List;
			}
		else if(jsonData.WidgetType === "NFASummary" && gridData.data !== undefined && gridData.data.data.length > 0)
		{
			colNamesList = gridData.columnList;
			colModelList = gridData.data.columnModelList;
			for(var i = 0; i < colModelList.length; i++)
			{
				var columnModel = colModelList[i];
				if(columnModel.formatter != null && columnModel.formatter != "") { //No I18N
					var tmpFunc = new Function('return '+columnModel.formatter); //No I18N
					columnModel.formatter = tmpFunc();
				}
			}
			gridData = gridData.data.data;
		}
		else if(jsonData.WidgetType === "Grid" && jsonData.Name == "widget.name.vendorAcrossProbe"){
			if(jsonData.WidgetAdditionalData.fwaGridWidget != undefined && jsonData.WidgetAdditionalData.fwaGridWidget.colModelList != undefined){
				colModelList = jsonData.WidgetAdditionalData.fwaGridWidget.colModelList;
			}
			if(jsonData.WidgetAdditionalData.fwaGridWidget != undefined && jsonData.WidgetAdditionalData.fwaGridWidget.colNameList != undefined){
				colNamesList = jsonData.WidgetAdditionalData.fwaGridWidget.colNameList;
			}
		}
		else if (jsonData.WidgetType === "NFAGraphTable") {
			gridData = jsonData.WidgetData.data && jsonData.WidgetData.data.data ? jsonData.WidgetData.data.data : [];
			var nfaColumnList = jQuery.extend([], jsonData.WidgetData.columnList);
			for(var i=0; i<nfaColumnList.length; i++){
				nfaColumnList[i] = Ember.I18n.t(nfaColumnList[i]);
			}
			colNamesList = nfaColumnList;
		}
		else
		{
			if(jsonData.GridWidget != undefined && jsonData.GridWidget.colModelList != undefined){
				colModelList = jsonData.GridWidget.colModelList;
			}
			if(jsonData.GridWidget != undefined && jsonData.GridWidget.colNamesList != undefined){
				colNamesList = jsonData.GridWidget.colNamesList;
			}	
		}
		if(jsonData.Name==="widget.apm.name.monitorgroupstreeview")//No I18N
		{
			onSelectFunctionName = "APM_v3MonitorsList";//No I18N
			defaultOptionsForTable.subGrid=true;
			defaultOptionsForTable.colNamesList = [Ember.I18n.t("webclient.widget.name",this),Ember.I18n.t("webclient.devices.intftypes.availability",this),Ember.I18n.t("Health",this),"",""];//No I18N
			defaultOptionsForTable.colModelList = [
			    {"name":"DISPLAYNAME","formatter":apmMonitorGroupsFormatter},//No I18N
			    {"name":"AVAILABILITYSEVERITY","formatter":setDefaultAPMStatusIcon},//No I18N
			    {"name":"HEALTHSEVERITY","formatter":setAPMStatusIcon},//No I18N
			    {"name":"RESOURCEID","hidden":true},//No I18N
			    {"name":"subGridStatus","hidden":true}//No I18N
			];
			defaultOptionsForTable.widgetID = widgetParams.id;
			defaultOptionsForTable.subGridFunction = "APMMonitorTreeViewSubGrid";//No I18N
			this.set("widgetClassName","opm_jqGridUI APMMonitorTreeViewGrid");//No I18N
		}
		if(jsonData.Name != "widget.name.idleVms")
		{
			if(jsonData.WidgetAdditionalData && jsonData.WidgetAdditionalData.graphUnit && jsonData.WidgetAdditionalData.virtualType)
			{
				var VirtualTypes = ["VMware","HyperV","Xen","All"];//No I18n
				var isVirtualWidget = VirtualTypes.indexOf(jsonData.WidgetAdditionalData.virtualType) != -1 ;
				if(isVirtualWidget)
				{
					if(colNamesList[1].indexOf("(") == -1 && colNamesList[1].indexOf(")") == -1)
					{
						colNamesList[1] = colNamesList[1] +" ( " +jsonData.WidgetAdditionalData.graphUnit+" ) ";
					}
				}
			}	
		}
		if(typeof gridData === "object" && gridData.List!==undefined && Object.keys(gridData.List).length > 0){
			gridData = gridData.List;
		}
		if(!window.OPM.userPermissions.reportsRead)
		{
			if(jsonData.Name === "widget.name.deviceDataCollectionLog" || jsonData.Name === "widget.name.monitorDataCollectionLog")
			{
				colNamesList.pop();
				colModelList.pop();
			}
		}

		if(jsonData.Name === "widget.name.deviceallintfbw" || jsonData.Name === "widget.name.topnbw" || jsonData.Name === "widget.name.overnbw" || perfTopNWidgets.contains(jsonData.Name)){
			$("#"+widgetParams.id).data().WidgetAdditionalData = jsonData.WidgetAdditionalData;
		}
		
		if(!window.OPM.isOPMEEUnifiedConsoleView && jsonData.WidgetType === "Grid" && (jsonData.Name == "widget.name.deviceAcrossProbe" || jsonData.Name == "widget.name.alarmsbycategory" || jsonData.Name == "widget.name.vpnstat" || jsonData.Name == "widget.name.securitystat" || jsonData.Name == "widget.name.rulesstat" || jsonData.Name == "widget.name.objstat" ||  jsonData.Name == "widget.name.configstat" ||  jsonData.Name == "widget.name.anomalystat")){
			
			if(colModelList != undefined && colModelList[1] != undefined && colModelList[1].classes == "pointer"){

				colModelList[1].classes = "";
			}
		}
		if((jsonData.Name === "widget.name.topnbw" || jsonData.Name === "widget.name.topntraf" || jsonData.Name === "widget.name.overntraf" || jsonData.Name === "widget.name.overnbw") && (window.OPM.isShowTrfficCols !== undefined && window.OPM.isShowTrfficCols)){
			setHiddenColumn(colModelList,['inSpeed','outSpeed'],false); //No I18n
		}


		if(jsonData.Name==="widget.name.sdwan.tunnelSummary" && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.columnsToHide!==undefined)
		{
			var columnsToHide=jsonData.WidgetAdditionalData.columnsToHide;
			colModelList=jsonData.GridWidget.colModelList;
			setHiddenColumn(colModelList,columnsToHide,true);
		}

		if(jsonData.Name==="widget.name.sdwan.sitefabric" && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.columnsToHide!==undefined)
		{
			var columnsToHide=jsonData.WidgetAdditionalData.columnsToHide;
			colModelList=jsonData.GridWidget.colModelList;
			setHiddenColumn(colModelList,columnsToHide,true);
		}
		if(widgetParams!==undefined && widgetParams.apiData!==undefined && widgetParams.apiData.Name==="widget.apm.name.availabilityandhealthstatus")
		{
			if(colModelList!==undefined && colModelList.length>0){
				colModelList[0].index = "DISPLAYNAME";//No I18N
			}
			/* The rows come from this second call, not the widget payload (APMWidgets.java only fills
			   reportData when getAPMMonitorData=true). Session-less, the product URL answers 200 with an
			   "apiKey is not available" error body, so the grid silently renders empty — route it through
			   /embedWidget instead, as homeModel.js does. wsId is omitted when null — this page has no
			   websocket, and ZSEC rejects an empty value with EMPTY_VALUE_NOT_ALLOWED. */
			var apmUrl = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData';//No I18N
			var apmData = {getAPMMonitorData:true,widgetID:widgetParams.id};
			if(window.OPM.isEmbed)
			{
				apmUrl = "/embedWidget";//No I18N
				apmData.type = window.OPM.Embedtype;
				apmData.authKey = window.OPM.authKey;
				apmData.apiKey = "EmbedView";//No I18N
				var apmWsId = sessionStorage.getItem("wsId"); if (apmWsId) { apmData.wsId = apmWsId; } //No I18N
				if(window.OPM.Embedtype === 'cctv'){//No I18N
					apmData.cctvID = window.OPM.cctvID;
				}
			}
			var dObj = {
		        "id":"#"+widgetParams.id,//No I18N
		        "apiUrl":apmUrl,//No I18N
		        "data":apmData,//No I18N
		        "colNamesList":colNamesList,//No I18N
		        "colModelList":colModelList,//No I18N
		        "pagerId":"#widget_pager_"+widgetParams.id,//No I18N
		        "sortType":"asc",//No I18N
		        "sortName":"DISPLAYNAME",//No I18N
		  		"rowNum":10,//No I18N
		  		"rowList":[10,25,50,100],//No I18N
		        "autoencode":true,//No I18N
		        "onSelectFunction":"APM_v3MonitorsList",//No I18N
		        "defaultOptions":{multiselect:false}//No I18N
	        };
	  		dObj.gridCallBack = function(gridTableIdAlone){	
				gridWidthAlignment(gridTableIdAlone);
				dashcallbackNew(widgetParams.id);
			};
	        	opm_loadJqGridBasedOnCount(dObj);
		}
		else
		{
			if(gridData !== undefined && gridData !== null && gridData.length > 0)
			{

				defaultOptionsForTable.minRowsPerPage = 25;
				if(cpWidgets.indexOf(jsonData.Name)!==-1){
					defaultOptionsForTable.minRowsPerPage = 10;
				}
				if(jsonData.CustomWidget) {
				    onSelectFunctionName="CustomWidget"; //No I18N
					var gridData = $.extend(true,[],jsonData.WidgetData);
					defaultOptionsForTable.rowList=[10,25,50];
					/* Dataset 1 comes from the widget payload; every later one is fetched from this URL,
					   which session-less answers 200 with an "apiKey is not available" error body — so the
					   extra rows silently never arrive. wsId omitted when null, as above. */
					var lazyUrl = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData';//No I18N
					var lazyParams = {widgetID:widgetParams.id};
					if(window.OPM.isEmbed)
					{
						lazyUrl = "/embedWidget";//No I18N
						lazyParams.type = window.OPM.Embedtype;
						lazyParams.authKey = window.OPM.authKey;
						lazyParams.apiKey = "EmbedView";//No I18N
						var lazyWsId = sessionStorage.getItem("wsId"); if (lazyWsId) { lazyParams.wsId = lazyWsId; } //No I18N
						if(window.OPM.Embedtype === 'cctv'){//No I18N
							lazyParams.cctvID = window.OPM.cctvID;
						}
					}
					defaultOptionsForTable.lazyLoadParams= {
						datasetIndex:1,
						data:[],
						page:0,
						fetchRows:1000,
						viewRecords:defaultOptionsForTable.minRowsPerPage,
						totalRecords:jsonData.WidgetData.length,
						isLazyReport:true,
						apiUrl:	lazyUrl,
						apiParams:lazyParams
					};
					defaultOptionsForTable.lazyLoadParams.totalPages = Math.ceil(defaultOptionsForTable.lazyLoadParams.totalRecords/defaultOptionsForTable.lazyLoadParams.viewRecords);
       				var totalDataset = Math.ceil(defaultOptionsForTable.lazyLoadParams.totalRecords/defaultOptionsForTable.lazyLoadParams.fetchRows);
       				defaultOptionsForTable.lazyLoadParams.totalDataset = totalDataset;
       				defaultOptionsForTable.lazyLoadParams.pagesPerDataset = Math.ceil(defaultOptionsForTable.lazyLoadParams.fetchRows/defaultOptionsForTable.lazyLoadParams.viewRecords);
       				defaultOptionsForTable.lazyLoadParams.data = gridData;
					defaultOptionsForTable.shrinkToFit=false;
                    if($('.widgetExpandView_temp').is(":visible"))
                    {
                        defaultOptionsForTable.shrinkToFit=true;
                    }

					defaultOptionsForTable.pagination=true;
					var responseData= JSON.parse(JSON.stringify(jsonData.GridWidget));
						if(responseData.headers!==undefined){
							colNamesList=[];
							colModelList=[];
							var map = {};
							 grpSetting = function (rowId, val, rawObject, cm) {//NO I18N
						  		var selectedPageCount = Number($('#widget_pager_'+widgetParams.id+'_center select').val());
						  		var remainder = rowId % selectedPageCount;
						        var result = ' style="display:none;"';//NO I18N
						        if(rawObject.groupingData){
							        var attr = rawObject.groupingData[cm.name];
							        if (attr && attr.rowspan) {
								         result = ' rowspan=' + '"' + attr.rowspan + '"';//NO I18N
							        	if(map[cm.name] !==undefined && map.handled !==undefined && !map.handled.includes(cm.name)){
							        		$("#widget"+widgetParams.id+" #"+ (rowId-remainder+1) +" [aria-describedby='widget"+widgetParams.id+"_"+cm.name+"']").attr("rowspan", remainder-1);//NO I18N
								        	map.handled.push(cm.name);
								        }
							        } else if(remainder == 1){
							        	result = ' rowspan=' + '"' + selectedPageCount + '"';//NO I18N
							        }
							        if(map[cm.name] == undefined){
							        	map[cm.name]=Object.keys(map).length;
								    }
						    	} else if (remainder == 1){
						  			result = ' rowspan=' + '"' + selectedPageCount + '"';//NO I18N
							        map.handled=[];
						    	}
						        return result;
						    };
							for( var i=0 ; i<responseData.headers.length; i++){
								var originalData=responseData.headers[i];
								responseData.headers[i] = escapeHTML(responseData.headers[i]);
								var row = {name : originalData+'', index : responseData.headers[i]+'',formatter:AdvancedRepFormatter};
								if(responseData.deviceNameIndex==i){
									row = {name : originalData+'', index : responseData.headers[i]+'',cellattr:addPointerClass};
								}
								row.sortable=false;
								if(responseData.groupByCount){
									if(i < Number(responseData.groupByCount)){
										row.cellattr = grpSetting;
									}
								}
								if(responseData.headers[i].indexOf('$-$')>-1) {//No I18N
									responseData.headers[i] = responseData.headers[i].split("$-$")[1]; //No I18N
								}
								colNamesList.push(responseData.headers[i]);
						        colModelList.push(row);
							}
						}
					    if(responseData.headerKeyVsTypeMap!==undefined)
					   	{
					   		for(var i=0;i<colModelList.length;i++)
					   		{
					   			var colNameToDataType = responseData.headerKeyVsTypeMap[colModelList[i].name];
					   			if(colNameToDataType!==undefined)
					   			{
					   				if([-7,-6,5,4,-5].indexOf(colNameToDataType)>-1){
					   					colModelList[i].sorttype = 'int';//No I18N
					   				}else if([6,8,2,3].indexOf(colNameToDataType)>-1){
					   					colModelList[i].sorttype = 'number';//No I18N
					   				}
					   				else if([1111].indexOf(colNameToDataType)>-1){
					   					colModelList[i].sorttype = opm_customSort;
					   				}
					   			}
					   		}
					   	}
					   	if(jsonData.WidgetData!==undefined && jsonData.WidgetData.length>0 && jsonData.WidgetData[0].moName!==undefined){
            				colNamesList.push('');
            				var row = {name : 'moName', index : 'moName', hidden:true };//NO I18N
            				colModelList.push(row);
        				}
						if(responseData.groupByCount && Number(responseData.groupByCount > 0)){
							colNamesList.push('');
							var row = {name : 'groupingData', index : 'groupingData', hidden:true, formatter:AdvancedRepFormatter};//NO I18N
							row.sortable=true;
							colModelList.push(row);
						}
				}
				defaultOptionsForTable.gridCallBack = function(gridTableIdAlone){
					gridWidthAlignment(gridTableIdAlone);
					if(jsonData.CustomWidget){
						if(jsonData.GridWidget!==undefined && jsonData.GridWidget.groupHeader!==undefined && jsonData.GridWidget.groupHeader.length>0){
						var groupHeader = JSON.parse(JSON.stringify(jsonData.GridWidget.groupHeader));
								$.each(groupHeader,function(key,val)
								{
									groupHeader[key].titleText = "<div align='center'>"+opm_escapeHTML(groupHeader[key].titleText)+"</div>";
								});
							$("#"+widgetParams.id).jqGrid("setGroupHeaders", { //NO I18N
        						useColSpanStyle: false,
	        		    			groupHeaders: groupHeader
        					});
	        					$("#gview_"+widgetParams.id+" .jqg-first-row-header").remove();//NO I18N
						}
						if($("#widget"+widgetParams.id+" .opm_jqGridUI").width() < $("#gbox_"+widgetParams.id).width()){
							$("#gbox_"+widgetParams.id).width($("#widget"+widgetParams.id+" .opm_jqGridUI").width()-5);
						}
						var width = $("#gbox_"+widgetParams.id).width();
						if($("#widget"+widgetParams.id+" .ui-jqgrid-htable").width() < width){
							$("#widget"+widgetParams.id+" .ui-jqgrid-htable"+",#widget"+widgetParams.id+" .ui-jqgrid-btable"+",#widget"+widgetParams.id+" .ui-jqgrid-hdiv"+",#widget"+widgetParams.id+" .ui-jqgrid-bdiv").width(width);
        			    }
						if($("#widget"+widgetParams.id+" .ui-jqgrid-hbox").width() > width){
							$("#widget"+widgetParams.id+" .ui-jqgrid-hbox").width(width);
						}
						if($("#widget_pager_"+widgetParams.id).width() > width){
							$("#widget_pager_"+widgetParams.id+",#gview_"+widgetParams.id).width(width);
						}
						dashcallbackNew(widgetParams.id);
        			}
				};
			if(window.OPM.isRMMEdition && jsonData.Name === "widget.name.probe.snapshot") {
				for(var i = 0; i < colModelList.length; i++) {
					var columnModel = colModelList[i];
					if(columnModel.name == "probe") {
						var tmpFunc = new Function('return probeNameTextFormat'); //No I18N
						columnModel.formatter = tmpFunc();
					}
				}
			}
				if(widgetParams.widgetUniqueName==="webclient.zia.recommendations")//No I18N
				{
					this.set("widgetClassName","opm_jqGridUI opmReportsGridview ziaWidget");//No I18N
					defaultOptionsForTable.searchOption=true;
					var showActionColumn = true;
					if(window.OPM.showWorkflow || (opm_hideSettings() && !opm_hideNTemplateLink())){
						showActionColumn = true;
					}else{
						showActionColumn = false;
					}
					if(colModelList[3]!==undefined && colModelList[3].name==="actions"){//No I18N
						colModelList[3].hidden = !showActionColumn;
					}
					onSelectFunctionName = "ziaWidget";//No I18N
					$("#widget_holder_"+widgetParams.id+" .opmGridTitle").addClass("overflow-visible");
					$("#widget_holder_"+widgetParams.id+" .opmGridTitle > div").addClass("overflow-visible");
					$("#widget_holder_"+widgetParams.id+" #dashWidgetContent").css({'z-index':0});
					$("#widget_holder_"+widgetParams.id+" .opm_widget_title .widget_name ").addClass("ziaHeader overflow-visible");
				}
				if(jsonData.Name == "webclient.snmp.tabular.widget") {//No I18N 
					defaultOptionsForTable.minRowsPerPage = 10
					defaultOptionsForTable.rowNum = 10
				}
				opm_loadJQgridWithData("#"+widgetParams.id,gridData, colNamesList, colModelList, "", "#widget_pager_"+widgetParams.id, onSelectFunctionName,defaultOptionsForTable); //No I18N
				$("#widget_pager_"+widgetParams.id+"_left").hide();
				var width = $("#gbox_"+widgetParams.id).width();
				if(jsonData.CustomWidget && $("#widget"+widgetParams.id+" .ui-jqgrid-htable").width() < width){
					$("#widget"+widgetParams.id+" .ui-jqgrid-htable").width(width);
					$("#widget"+widgetParams.id+" .ui-jqgrid-btable").width(width);
				}
				if(widgetParams.widgetUniqueName==="webclient.zia.recommendations")//No I18N
								{
									Ember.run.schedule("afterRender", function() {//No I18N
										$('.ziaForecastAlarm').each(function (k,v){//No I18N
										    if(Math.round($(v).find('h3').height() / parseFloat($(v).find('h3').css('line-height')))>1){//No I18N
										    	$(v).find('.ziaImpactColorCode').addClass("min-height-80");//No I18N
										    	$(v).find('.ziaRecommendColorCode').addClass("min-height-80");//No I18N
										    }
										    if(Math.round($(v).find('.ziaImpactColorCode p').height() / parseFloat($(v).find('.ziaImpactColorCode p').css('line-height')))>1){//No I18N
										    	$(v).find('.alarm-row').addClass("min-height-80");//No I18N
										    	$(v).find('.ziaRecommendColorCode').addClass("min-height-80");//No I18N
										    }
										    if(Math.round($(v).find('.ziaRecommendColorCode p').height() / parseFloat($(v).find('.ziaRecommendColorCode p').css('line-height')))>1){//No I18N
										    	$(v).find('.alarm-row').addClass("min-height-80");//No I18N
										    	$(v).find('.ziaImpactColorCode').addClass("min-height-80");//No I18N
										    }
										});
									});
								}
				if(cpWidgets.indexOf(jsonData.Name)!==-1)
				{
					//$("#"+widgetParams.id).setGridWidth($("#widget"+widgetParams.id).width());//No I18N
					
					if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.cpRuleProps!==undefined)
					{
						var cpRuleProps = jsonData.WidgetAdditionalData.cpRuleProps;
						var cpMap = {};
						for (var i=0;i<cpRuleProps.metrics.length;i++)
						{
						    var metric = cpRuleProps.metrics[i];
						    var consolidateValue = metric.monitorName;
						    if(metric.thresholdCondition==="1"){
						    	consolidateValue += " >";//No I18N
						    }else if(metric.thresholdCondition==="2"){
						    	consolidateValue += " < ";//No I18N
						    }else if(metric.thresholdCondition==="3"){
						    	consolidateValue += " >= ";//No I18N
						    }else if(metric.thresholdCondition==="4"){
						    	consolidateValue += " <= ";//No I18N
						    }
						    consolidateValue += " "+metric.thresholdValue;
						    cpMap[metric.thresholdId] = " ( "+consolidateValue+" ) ";//No I18N
						}
						var appliedRule = cpRuleProps.criteriaPattern.replace(/\d+/g, function(val)
						{
						    return cpMap[val] || val;
						});
						if(cpRuleProps.timeCondition!==undefined && cpRuleProps.timeThreshold!==undefined)
						{
							appliedRule += "in ";//No I18N
							if(cpRuleProps.timeCondition==="1"){//No I18N
						    	appliedRule += " > ";//No I18N
						    }else if(cpRuleProps.timeCondition==="2"){//No I18N
						    	appliedRule += " < ";//No I18N
						    }else if(cpRuleProps.timeCondition==="3"){//No I18N
						    	appliedRule += " >= ";//No I18N
						    }else if(cpRuleProps.timeCondition==="4"){//No I18N
						    	appliedRule += " <= ";//No I18N
						    }
						    appliedRule += cpRuleProps.timeThreshold + " Percentage of Time.";//No I18N
						}
						self.set("showCPRule",true);//No I18N
						self.set("appliedRule",appliedRule);//No I18N
						self.set("widgetClassName","opm_jqGridUI overflow-hidden");//No I18N
					}
				}
			}
			else
			{
				$("#"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n
			}
		}
 	},
 	willDestroyElement: function(){
		clearGridMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashNFATableComponent = Ember.Component.extend({
	templateName:"components/opm-dash-grid",//No I18N
	widgetClassName:"opm_jqGridUI",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		if(jsonData.WidgetData.data != undefined)
 		{
			if(jsonData.WidgetData.data.data != undefined)
			{
				var onSelectFunction="NFAWidget";//No I18N
				var nfaTableData = jsonData.WidgetData.data.data;
				var nfaColumnList = jQuery.extend([],jsonData.WidgetData.columnList);
				var isNFAProblemWidget = (nfaColumnList[0] == 'NFAWidget.problem')?true:false;
				for(var i = 0 ; i < nfaColumnList.length; i++){
					nfaColumnList[i] = Ember.I18n.t(nfaColumnList[i],this);
				}
				var colModelList=[],defaultOptionsForTable={},isAllCollSelected = isAllCollectorSelected();
				if(jsonData.Name === "NFADB.L4Apps" ){//No I18n
					colModelList = [{"name":"AppName","classes":"cursorPointer devHrefLink"},{"name":"vol"},{"name":"utilStr"}]; //No I18n
					onSelectFunction='nfaL4AppsDashWidget';//No I18n
				}else if(jsonData.Name === "NFAWidget.App"){//No I18n
					nfaColumnList.push('ID');
					colModelList = [{"name":"AppName"},{"name":"vol"},{"name":"utilStr"},{"name":"AppID","hidden":true}]; //No I18n
					if(!isAllCollSelected){
						colModelList[0].classes = "cursorPointer devHrefLink"; //No I18n 
						onSelectFunction = "nfaL7AppsDashWidget"; //No I18n
					}
				}else if(jsonData.Name === "NFAWidget.Services"){ //NO I18N
					nfaColumnList.push("ID"); //NO I18N
					colModelList = [{name: "AppName", classes: "cursorPointer devHrefLink"}, {name: "vol"}, {name: "utilStr"}, {name: "AppID", hidden: true}]; //NO I18N
					onSelectFunction = "nfaServicesDashWidget"; //NO I18N
				}else if(jsonData.Name === "NFAWidget.DETopIntf"){//No I18n
					colModelList = [{name:'2',index:'2',"formatter":setNFAIntfSnapFromTopIntfWidget},{name:'3',index:'3',"formatter":setNFAIntfSnapFromTopIntfWidget},{name:'4',index:'4'},{name:'5',index:'5'}]; //No I18n
				}else if(jsonData.Name === "NFAWidget.DETopDevices"){//No I18N
					colModelList = [{name:'1',index:'1',"formatter":setNFADevfSnapFromTopDevWidget},{name:'4',index:'4'},{name:'5',index:'5'}]; //No I18n
				}else if(jsonData.Name === "NFAWidget.trfc" && jsonData.WidgetData.devTypeText === "Across"){ //No I18N
					colModelList = [{name:'0',index:'0',"formatter":setNFADevSnapFromTopDevWidget},{name:'1',index:'1'},{name:'2',index:'2'}]; //No I18n
				}else if(jsonData.Name === "NFAWidget.trfc"){ //No I18N
					nfaColumnList.push('ID'); //No I18N
					colModelList = [{"name":0,'classes':'cursorPointer devHrefLink'},{"name":1},{"name":2},{"name":4,"hidden":true}]; //No I18n
					switch(jsonData.WidgetData.devTypeText){
						case 'Interface': nfaColumnList.push('IP'); //No I18N
								nfaColumnList.push('ID');//No I18N
								colModelList = [{"name":0,'classes':'cursorPointer devHrefLink'},{"name":1,'classes':'cursorPointer devHrefLink'},{"name":2},{"name":3},{"name":6,"hidden":true},{"name":5,"hidden":true},{"name":7,"hidden":true}]; //No I18n
								onSelectFunction='nfaDashBoardTrafficWidgetInterface';break; //No I18n
						case 'InterfaceGroup':onSelectFunction='nfaDashBoardTrafficWidgetIntfGrp';break; //No I18n
						case 'IPGroup':onSelectFunction='nfaDashBoardTrafficWidgetIPGrp';break; //No I18n
					}
					defaultOptionsForTable.drillDownWidgetName = jsonData.WidgetData.SnapWidgetName;
					defaultOptionsForTable.drillDownWidgetParams = {param:"Type",Type: jsonData.WidgetData.category}; //No I18n
				}
				else if(jsonData.WidgetAdditionalData.displayColumnsList !== null && jsonData.WidgetAdditionalData.displayColumnsList !== undefined)
				{	
					var colList = jsonData.WidgetAdditionalData.displayColumnsList;
					colModelList = new Array();
					for(var i = 0 ; i < colList.length ; i++){
						var col = (isNFAProblemWidget && i==0)?({"name" : colList.charAt(i),"formatter":setNFAProblemListLink}):({"name" : colList.charAt(i)}); //No I18n
						colModelList[i] = col;
					}
				}else if(jsonData.Name === "nfadb.collDetails") { //NO I18N
					nfaColumnList = [Ember.I18n.t("opu.views.NAME"),Ember.I18n.t("opu.views.STATUS"),Ember.I18n.t("webclient.reports.category.router"),Ember.I18n.t("NFAWidget.routVia"),Ember.I18n.t("webclient.collector.noofncmdevices"),Ember.I18n.t("webclient.license.ipslamonitors"),Ember.I18n.t("webclient.nfa.flowrate")]; //NO I18N 
					colModelList = [
						{ name:"name", 			index:"name",		formatter:setNFARedirectCollectorSnapshot}, //NO I18N 
						{ name:"collStatus", 	index:"collStatus",	formatter:setNFACollStatus}, //NO I18N
						{ name:"noOfRouter", 	index:"noOfRouter"}, //NO I18N
						{ name:"noOfIntf", 		index:"noOfIntf"}, //NO I18N
						{ name:"noOfNcmDevice",	index:"noOfNcmDevice"}, //NO I18N
						{ name:"noOfSlaMonitor",index:"noOfSlaMonitor"}, //NO I18N
						{ name:"flowRate", 		index:"flowRate"} //NO I18N
					];
				}else if(jsonData.Name === "NFAWidget.Conversation") { //NO I18N
					colModelList = [
						{ name:"0", index:"0", sorttype:nfa_IPV4Sorting}, //NO I18N 
						{ name:"1", index:"1", sorttype:nfa_IPV4Sorting}, //NO I18N
						{ name:"2", index:"2"}, //NO I18N
						{ name:"3", index:"3"}, //NO I18N
						{ name:"4", index:"4", sorttype:nfa_customSort} //NO I18N
					];
				}else if(jsonData.Name === "webclient.snapshot.desc.controller") { //NO I18N
					colModelList = [
						{ name:"1", index:"1"}, //NO I18N
						{ name:"5", index:"5"}, //NO I18N
						{ name:"0", index:"0"}, //NO I18N
						{ name:"2", index:"2"}, //NO I18N
						{ name:"3", index:"3"}, //NO I18N
						{ name:"8", index:"8", sorttype:nfa_customSort} //NO I18N
					];
				}else if(jsonData.Name === "NFA.dash.asview") { //NO I18N
					var noDrillDown = (!window.isASViewEnabled || (window.isserver && ["Interface","InterfaceGroup"].contains(jsonData.WidgetData.devType))); //NO I18N
					onSelectFunction = noDrillDown ? "" : "nfaDashBoardASViewWidget"; //NO I18N
					defaultOptionsForTable.collOpt = jsonData.WidgetData.collOpt;
					defaultOptionsForTable.timeFrame = jsonData.Period;
					defaultOptionsForTable.storeDefaultOptions=true;
					if(jsonData.WidgetData.category === "topas"){ //NO I18N
						colModelList = [
							{name: "asName", 		index:"asName", 	classes: noDrillDown ? "" : "pointer underlineLink"}, //NO I18N
							{name: "asNumber", 		index:"asNumber", 	hidden:true}, //NO I18N
							{name: "InTraffic", 	index:"InTraffic", 	sorttype:nfa_customSort}, //NO I18N
							{name: "OutTraffic", 	index:"OutTraffic", sorttype:nfa_customSort} //NO I18N
						];
					}else if(jsonData.WidgetData.category === "asconv"){ //NO I18N
						colModelList = [
							{name: "srcas", 	index:"srcas"}, //NO I18N
							{name: "dstas", 	index:"dstas"}, //NO I18N
							{name: "app", 		index:"app"}, //NO I18N
							{name: "dscp", 		index:"dscp"}, //NO I18N
							{name: "traffic", 	index:"traffic", sorttype:nfa_customSort} //NO I18N
						];
					}
				}else if(jsonData.Name==="NFAWidget.ProbeStats") { //NO I18N
					var gridObj = nfa_getGridDetailsForOPMEEProbeStatsWidgets(jsonData.WidgetName);
					nfaColumnList = gridObj.colNamesList;
					colModelList = gridObj.colModelList;
					onSelectFunction = gridObj.onSelectFunction;
				}else if(jsonData.Name==="NFADB.NST"){ //NO I18N
					colModelList = nfa_getNSTColumnModelList();
				}else if (jsonData.Name === "NFADB.AI.topUsers") { //NO I18N
					colModelList = [
						{name: "srcAddr", index: "srcAddr", classes: "pointer underlineLink"}, //NO I18N
						{name: "avgNrt", index: "avgNrt", sorttype: nfa_customSort}, //NO I18N
						{name: "avgArt", index: "avgArt", sorttype: nfa_customSort}, //NO I18N
						{name: "bytes", index: "bytes", sorttype: nfa_customSort} //NO I18N
					];
					onSelectFunction = "dpi_dashboardWidget"; //NO I18N
					defaultOptionsForTable.onSelectParams = {dpiEngineID: jsonData.WidgetData.dpiEngineID, snapType: "DPISource", gridParam: "srcAddr"}; //NO I18N
				}
				else {
					colModelList = [{"name":0},{"name":1},{"name":2},{"name":3}]; //NO I18N
				}

				if(jsonData !== null)
				{
					if(jsonData.WidgetData !== undefined && jsonData.WidgetData !== null && nfaTableData !== undefined && nfaTableData !== null)
					{
						defaultOptionsForTable.minRowsPerPage = 25;
						defaultOptionsForTable.timeFrame = jsonData.Period;
						defaultOptionsForTable.gridCallBack = function(gridTableIdAlone){	
							gridWidthAlignment(gridTableIdAlone);
						};
						$("#"+widgetParams.id).jqGrid('GridUnload');//No I18N
						opm_loadJQgridWithData("#"+widgetParams.id, nfaTableData , nfaColumnList, colModelList , "", "#widget_pager_"+widgetParams.id,onSelectFunction,defaultOptionsForTable); //No I18N
					}else{
						$("#"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n				
					}
				}
			}else{
				$("#"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n
			}
		}else if(jsonData.WidgetData.message !== undefined || jsonData.WidgetData.data === undefined){
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("widget.configure",this)+"</span>"); //No I18N
		}else{
			$("#"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n
		}
 	},
 	willDestroyElement: function(){
 		clearGridMemory('#'+this.elementId);
 	}
});

OPMClient.OpmDashTreeMapComponent = Ember.Component.extend({
	templateName:"components/opm-dash-draw-graph",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;

 		this.set("graphParams",{ id: "gwidget"+widgetParams.id});//No I18N
		
		var chartObj = constructTreeMapObj(jsonData);
		chartObj.id = "gwidget"+widgetParams.id;
		if(jsonData.Name == "widget.zia.dashboard.name.anomalies.top10.groups" || jsonData.Name == "widget.zia.dashboard.name.anomalies.top10.devices") {//No I18N
			chartObj.clickEvent = function(e, d) {
				e.allowDefault = true;
				var type = jsonData.Name == "widget.zia.dashboard.name.anomalies.top10.groups" ? "groups" : "devices"; //No I18N
				var id = d.data[0].value;
				redirectToAnomalyPage(id, type, jsonData.Period);
			}
		}
		Ember.run.schedule("afterRender", function() {//No I18N
			zChart({ 'placeholder': ["gwidget"+widgetParams.id], 'chartobj': [chartObj] });//No I18N
		});

 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});

OPMClient.OpmDashGraphAreaComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
 	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var height=300;
		var stacked=true;
		var intfWidgets = ["widget.name.lastntraf","widget.name.lastnerrdis","widget.name.lastnbw","widget.name.lastnhours.totalbytestransferred"];//No I18N
		if(jsonData.Name == "widget.name.firewallLiveTraffic" || jsonData.Name == "widget.name.firewallInterfaceLiveTraffic" || intfWidgets.indexOf(jsonData.Name) !== -1)
		{
			stacked=false;
			if($('#li_'+widgetParams.id).hasClass('dashboardWidgetExpandView')){
				height=450;
			}
		}
		if(jsonData.WidgetForwardPage == "sysPerfomance") {
			stacked = false;
		}
		var graphParams = {};
		var chart_type = "area";//No I18N
		if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.chartType !== undefined)
		{
			chart_type = jsonData.WidgetAdditionalData.chartType;	
			graphParams.legendEnabled = true;
 			graphParams.axesEnabled = true;
 			if(chart_type == "bar")
 			{
 				graphParams.datatype1 = "time";//No I18N
 			}
 		
		}
 		
 		if(intfWidgets.indexOf(jsonData.Name) !== -1)
 		{
 			graphParams.interfaceWidgets = true;//No I18N
 		}

 		graphParams.id = "gwidget"+widgetParams.id;
 		graphParams.graphType = chart_type;
 		graphParams.graphData = jsonData.WidgetData.chartData;
 		var isForecast = false;
 		if(jsonData.Name =="webclient.opm.reports.forecasttrend.name")
 		{
 			isForecast = true;
 			var mychartData = []
 			if(jsonData.WidgetData.error == undefined && Object.keys(jsonData.WidgetData).length !== 0)
 			{
 				var obj = {};
	 			obj.seriesname = jsonData.WidgetData.expectedDisplay
	 			obj.data = jsonData.WidgetData.forecastedValues;
	 			obj.plotoptions = {"mode":"monotone","dashStyle":"dotted","marker":{"enabled":false}};//No I18N
	 			mychartData.push(obj)
	 			if(jsonData.WidgetData.datacollectedValues)
	 			{
	 			 	obj = {};
	 			 	obj.seriesname = jsonData.WidgetData.datacollectedDisplay;
	 				obj.data = jsonData.WidgetData.datacollectedValues;
	 				obj.plotoptions = {"mode":"monotone","dashStyle":"solid","marker":{"enabled":false}};//No I18N
	 			 	mychartData.push(obj)
	 			}
	  			jsonData.WidgetData.xyTitles = [];
				jsonData.WidgetData.xyTitles[0] = jsonData.WidgetData.xAxis
				jsonData.WidgetData.xyTitles[1] = jsonData.WidgetData.yAxis
 			}
 			else
 			{
 				        	$("#widget"+widgetParams.id).addClass("cctvNoDataWidget");

 							$("#widget"+widgetParams.id).text(Ember.I18n.t("webclient.reports.view.nodata",this)); //No I18n

 				return;
 			}
 			graphParams.graphData = mychartData;
 			graphParams.graphType = "line";//No I18N

 		}
 		graphParams.height = height;
 		graphParams.stacked = stacked;
 		graphParams.x_axes = (jsonData.WidgetData.xyTitles !== undefined)?jsonData.WidgetData.xyTitles[0]:"";
 		graphParams.y_axes = (jsonData.WidgetData.xyTitles !== undefined)?jsonData.WidgetData.xyTitles[1]:"";
 		graphParams.timeFormat = jsonData.Period;
		if(jsonData.WidgetForwardPage == "sysPerfomance") {
			$.each(jsonData.WidgetData.consolidatedValues, function(key, value) {
				jsonData.WidgetData.consolidatedValues[key] = Object.fromEntries(Object.entries(jsonData.WidgetData.consolidatedValues[key]).filter(function(key1, value1){ return key1[0].indexOf("95th") == -1}));			
			});
			graphParams.WidgetForwardPage = jsonData.WidgetForwardPage;
			graphParams.consolidatedValues = (jsonData.WidgetData.consolidatedValues !== undefined)? jsonData.WidgetData.consolidatedValues : "";
		}
		graphParams.suffix = jsonData.WidgetData.suffix;
		if(jsonData.WidgetForwardPage === "sysPerfomance" && OPMClient.ApplicationController.isNFA){
			graphParams.isNFATimeSeriesGraph = true;
		}
		if(!isForecast && jsonData.WidgetData.xyTitles!==undefined && jsonData.WidgetData.xyTitles[1]!==undefined && (jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || jsonData.WidgetData.xyTitles[1].indexOf("%")!=-1)){//No I18N
			graphParams.maxRange=100;
			graphParams.minRange=0;
		}
		var th=null;
		if(anomalyWidgets.includes(jsonData.Name)){
			graphParams.graphData = [{data: jsonData.WidgetData.chartData ,seriesname: Ember.I18n.t("webclient.anomaly.yaxis.widget")}];//No I18N
			graphParams.x_axes_margin_bottom = 30;
			graphParams.subType = "smootharea";//No I18N
			graphParams.mode = "monotone";//No I18N
			graphParams.subTypeOptions = {
				strokeWidth : 2,
				fillColor : "#e9f6f0",//No I18N
				strokeColor: "#249c5e"//No I18N
			}
			graphParams.height = 200;
			graphParams.legendEnabled = false;
			graphParams.dataTypeObj = {
				1 : {
					numeric: {
						subfunction: "integer"//No I18N
					}
				}
			}
			graphParams.marginBottom = 30;
			graphParams.marginRight = 10;
			graphParams.hoveroptions = {
				"innerFillColor": "#249C5E",//No I18N
				"outerFillColor": "#249C5E",//No I18N
				"outerStrokeColor": "#249C5E",//No I18N
				"innerStrokeColor": "#249C5E"//No I18N
			}
		}
		if((jsonData.Name == "widget.name.firewallLiveTraffic" || jsonData.Name == "widget.name.firewallInterfaceLiveTraffic") && (jsonData.WidgetData != undefined && jsonData.WidgetData.message != undefined))
		{
        	$("#widget"+widgetParams.id).addClass("cctvNoDataWidget");
        	if(window.OPM.isFWAServer){
        		jsonData.WidgetData.message=Ember.I18n.t("fwa.dashboard.central.noData.msg"); //No I18N
        	}else{
        		jsonData.WidgetData.message='<a style="color:blue" onclick="showEditWidget('+th+','+this.widgetParams.id+')">'+Ember.I18n.t("webclient.title.edit")+'</a> '+Ember.I18n.t("fwa.dashboard.noData.msg"); //No I18N        		
        	}
			$("#widget"+widgetParams.id).html(jsonData.WidgetData.message); //No I18n
		}
		else
		{
			$("#widget"+widgetParams.id).removeClass("cctvNoDataWidget");
			this.set("graphParams",graphParams);//No I18N
		}	      
 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashCustomGraphComponent = Ember.Component.extend({
	templateName: "components/opm-dash-customgraph", //NO I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var graphArr = [];
		 //this.set("graphID","widget"+widgetParams.id);//No I18N
		 if(jsonData.WidgetData || jsonData.WidgetData.chartData) {
			$.each(jsonData.WidgetData.chartData,function(key,val){
				var yAxisText ;
				if(key === 'individualGraphs') {
					isTrafficUtil = val[0].policyName==='Traffic Utilization' || val[0].policyName==='All Traffic';
					yAxisText = val[0].yAxisText;
					val = val[0].graphs;
				}
				var graphParams = {};
				graphParams.id = "gwidget"+widgetParams.id;//No I18N
				graphParams.graphData = val;
				graphParams.height = 250;
				graphParams.x_axes = (jsonData.WidgetData.xyTitles!=undefined)?jsonData.WidgetData.xyTitles[0]:"";
				graphParams.y_axes = (jsonData.WidgetData.xyTitles!=undefined)?jsonData.WidgetData.xyTitles[1]:"";
				if((graphParams.y_axes===undefined || graphParams.y_axes === "" )&& yAxisText!==undefined) {
					graphParams.y_axes = yAxisText;
				}
				graphParams.graphType = "area";//No I18N
				if(jsonData.WidgetAdditionalData!==undefined){
					if(jsonData.WidgetAdditionalData.strokeWidth!==undefined) {
						graphParams.strokeWidth = jsonData.WidgetAdditionalData.strokeWidth;
					}
					if(jsonData.WidgetAdditionalData.chartType!==undefined) {
					graphParams.graphType = jsonData.WidgetAdditionalData.chartType;
					if(jsonData.WidgetAdditionalData.chartType==="bar"){//No I18N
						graphParams.legendEnabled = true;
 						graphParams.axesEnabled = true;
 						graphParams.stacked = false;
 						graphParams.datatype1 = "time";//No I18N

						}
					}
				}
				graphParams.timeFormat = (jsonData.Period!==undefined)?jsonData.Period:'hours';//No I18N
				if(val.length > 0 && val[0].seriesname !== undefined){
 					graphParams.tooltip = [Ember.I18n.t('webclient.general.time',this)+" : {{val(0)}}",Ember.I18n.t('webclient.widget.value',this)+" : {{val(1)}}"];//No I18N
	 				if(jsonData.WidgetAdditionalData.graphReportType==="Average" && key.indexOf(Ember.I18n.t("webclient.admin.archive.process"))===-1){
	            		graphParams.tooltip.push(Ember.I18n.t("webclient.widget.monitor",this)+" : {{val(3)}}");
			        	if(val[0].data[0]!==undefined && val[0].data[0].length >= 4){
			            	graphParams.tooltip.push(Ember.I18n.t("webclient.devices.details.instance",this)+" : {{val(4)}}");
			        	}
				    }else{
				        graphParams.tooltip.push(Ember.I18n.t("webclient.admin.notifications.source",this)+" : {{val(3)}}");
				        graphParams.tooltip.push(Ember.I18n.t("webclient.widget.monitor",this)+" : {{val(4)}}");
				        if(val[0].data[0]!==undefined && val[0].data[0].length >= 5){
				        	if(key.indexOf(Ember.I18n.t("webclient.admin.archive.process"))!==-1){
			                	graphParams.tooltip.push(Ember.I18n.t("webclient.topo.actions.deviceinfo.process",this)+" : {{val(5)}}");
			             	}else{
			                 graphParams.tooltip.push(Ember.I18n.t("webclient.devices.details.instance",this)+" : {{val(5)}}");
				        }
				    }
 				}
 				}
		 		if(jsonData.WidgetData.xyTitles!==undefined && jsonData.WidgetData.xyTitles[1]!==undefined && (jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || jsonData.WidgetData.xyTitles[1].indexOf("%")!=-1)){//No I18N
					graphParams.maxRange=100;
					graphParams.minRange=0;
				}
				graphParams.customWidget=true;
				graphArr.pushObject(graphParams);
			});
		 }
 		this.set('graphArr',graphArr);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashKpiGraphComponent = Ember.Component.extend({
	templateName: "components/opm-dash-kpigraph", //NO I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
		 var chartType = (jsonData.WidgetAdditionalData && jsonData.WidgetAdditionalData.chartType) || "area"; //NO I18N
 		var graphArr = [];
		 widgetParams.timeFormat = (jsonData.Period!==undefined)?jsonData.Period:'hours';//No I18N
this.set('selectedPeriod',widgetParams.timeFormat );//No I18N
		 //this.set("graphID","widget"+widgetParams.id);//No I18N
try{
	if(jsonData.WidgetData || jsonData.WidgetData.chartData) {
			response = jsonData.WidgetData.chartData;
			var isTileWidget = response.tileData !== undefined;
			if(isTileWidget)
			{
				var firstRow = response.tileData[0].rows[0]; // Get the first row object
				var key = response.tileData[0].headers[0]; // Get the first header key
				var tile = {
					title: response.tileData[0].title,
					value: firstRow[key] // Access the value using the key
				};
				this.set('tileData',tile); //NO I18N
				this.set('isTileWidget',isTileWidget); //NO I18N
				return;
			}
			var gridIndex = 0;
      var graphDetails = [];
      if (response.individualGraphs)
      {
        response.individualGraphs.forEach(function(graph)
        {
          graph.graphIndex = "KPI_Graph"+widgetParams.id;; //NO I18N
          graphDetails.push(graph);
        });
      }
      else
      {
        for (var mName in response)
        {
          if (response.hasOwnProperty(mName))
          {
            var graphs = [];
            if(jsonData.WidgetAdditionalData.graphReportType == 'Summary')
            {
				this.set('graphReportType',jsonData.WidgetAdditionalData.graphReportType) //NO I18N
              var transformedData = {};
              transformedData[mName] = [
                  {
                      "seriesname": response[mName].data[0][0] ,
                      "data":  response[mName].data,
                      "policyName": response[mName].policyName,
                      "yaxiscolumnorder": response[mName].yaxiscolumnorder,
                      "id": Math.random().toString(36).substr(2, 8) // Generate a random ID //NO I18N
                  }
              ];
              var mData = transformedData[mName];
            }
            else{
              mData = response[mName];
            }
            var monitorDetails = mName.split('-');
            graphDetails.push(
            {
              monitorName: monitorDetails[0],
              policyName: (mData[0] && mData[0].policyName),
              moIds: mData.deviceMOIDList || mData.intfList,
              yAxisText: monitorDetails[1] || (mData[0] && mData[0].unit) || '',
              graphIndex: widgetParams.id,
              graphs: mData,
			  xyTitles:jsonData.WidgetData.xyTitles,
			  widgetData:jsonData
            });
          }
        }
      }
graphDetails.graphIndex = "KPI_Graph"+widgetParams.id; //NO I18N
this.set('graphDetails', graphDetails); //NO I18N
this.set('chartType', chartType); //NO I18N

		 }
}
catch(e)
{
	$("#widget"+widgetParams.id).addClass("cctvNoDataWidget");
			$("#widget"+widgetParams.id).text(Ember.I18n.t("webclient.reports.view.nodata",this));	//No I18N
}
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashcustomInterfaceComponent = Ember.Component.extend({
	templateName: "components/opm-dash-custominterface", //NO I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		var graphArr = [];
		 //this.set("graphID","widget"+widgetParams.id);//No I18N
		 if(jsonData.WidgetData || jsonData.WidgetData.chartData) {
			$.each(jsonData.WidgetData.chartData,function(key,val){
				var yAxisText ;
				if(key === 'individualGraphs') {
					isTrafficUtil = val[0].policyName==='Traffic Utilization' || val[0].policyName==='All Traffic';
					yAxisText = val[0].yAxisText;
					val = val[0].graphs;
				}
				var graphParams = {};
				graphParams.id = "gwidget"+widgetParams.id;//No I18N
				graphParams.graphData = val;
				graphParams.height = 250;
				graphParams.x_axes = (jsonData.WidgetData.xyTitles!=undefined)?jsonData.WidgetData.xyTitles[0]:"";
				graphParams.y_axes = (jsonData.WidgetData.xyTitles!=undefined)?jsonData.WidgetData.xyTitles[1]:"";
				if((graphParams.y_axes===undefined || graphParams.y_axes === "" )&& yAxisText!==undefined) {
					graphParams.y_axes = yAxisText;
				}
				graphParams.graphType = "area";//No I18N
				if(jsonData.WidgetAdditionalData!==undefined){
					if(jsonData.WidgetAdditionalData.strokeWidth!==undefined) {
						graphParams.strokeWidth = jsonData.WidgetAdditionalData.strokeWidth;
					}
					if(jsonData.WidgetAdditionalData.chartType!==undefined) {
					graphParams.graphType = jsonData.WidgetAdditionalData.chartType;
					if(jsonData.WidgetAdditionalData.chartType==="bar"){//No I18N
						graphParams.legendEnabled = true;
 						graphParams.axesEnabled = true;
 						graphParams.stacked = false;
 						graphParams.datatype1 = "time";//No I18N

						}
					}
				}
				graphParams.timeFormat = (jsonData.Period!==undefined)?jsonData.Period:'hours';//No I18N
				if(val.length > 0 && val[0].seriesname !== undefined){
 					graphParams.tooltip = [Ember.I18n.t('webclient.general.time',this)+" : {{val(0)}}",Ember.I18n.t('webclient.widget.value',this)+" : {{val(1)}}"];//No I18N
	 				if(jsonData.WidgetAdditionalData.graphReportType==="Average" && key.indexOf(Ember.I18n.t("webclient.admin.archive.process"))===-1){
	            		graphParams.tooltip.push(Ember.I18n.t("webclient.widget.monitor",this)+" : {{val(3)}}");
			        	if(val[0].data[0]!==undefined && val[0].data[0].length >= 4){
			            	graphParams.tooltip.push(Ember.I18n.t("webclient.devices.details.instance",this)+" : {{val(4)}}");
			        	}
				    }else{
				        graphParams.tooltip.push(Ember.I18n.t("webclient.admin.notifications.source",this)+" : {{val(3)}}");
				        graphParams.tooltip.push(Ember.I18n.t("webclient.widget.monitor",this)+" : {{val(4)}}");
				        if(val[0].data[0]!==undefined && val[0].data[0].length >= 5){
				        	if(key.indexOf(Ember.I18n.t("webclient.admin.archive.process"))!==-1){
			                	graphParams.tooltip.push(Ember.I18n.t("webclient.topo.actions.deviceinfo.process",this)+" : {{val(5)}}");
			             	}else{
			                 graphParams.tooltip.push(Ember.I18n.t("webclient.devices.details.instance",this)+" : {{val(5)}}");
				        }
				    }
 				}
 				}
		 		if(jsonData.WidgetData.xyTitles!==undefined && jsonData.WidgetData.xyTitles[1]!==undefined && (jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || jsonData.WidgetData.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || jsonData.WidgetData.xyTitles[1].indexOf("%")!=-1)){//No I18N
					graphParams.maxRange=100;
					graphParams.minRange=0;
				}
				graphParams.customWidget=true;
				graphArr.pushObject(graphParams);
			});
		 }
 		this.set('graphArr',graphArr);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashDrawGraphComponent = Ember.Component.extend({
	templateName: "components/opm-dash-draw-graph", //NO I18N
	didInsertElement: function(){
		var graphParams = this.graphParams;
		if(graphParams!=undefined)
		{
			if(graphParams.graphType === "area"){//No I18N
				drawDashboardGraphArea(graphParams);
			}else if(graphParams.graphType === "bar"){//No I18N
				drawDashboardBarGraph(graphParams);
			}else if(graphParams.graphType === "pie"){//No I18N
				drawDashboardPieChart(graphParams);
			}else if(graphParams.graphType === "line"){//No I18N
				drawDashboardLineGraph(graphParams);
			}else if(graphParams.graphType === "scatter"){//No I18N
				drawDashboardScatterGraph(graphParams);
			}
		}
	},
	graphObserver:function(){
		this.rerender();
	}.observes('graphParams'),//No I18N
 	willDestroyElement: function(){
 		clearGraphMemory('#'+this.elementId);//No I18N
 	}
});
OPMClient.OpmDashlineGraphComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function(){
 		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
 		if(jsonData.WidgetData.data != undefined && jsonData.WidgetData.data.data != undefined)
		{
	 		var graphParams = {};
	 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
	 		graphParams.graphType = "area";//No I18N
	 		graphParams.graphData = jsonData.WidgetData.data.data;
	 		graphParams.height = 250;
	 		graphParams.stacked = true;
	 		graphParams.x_axes = Ember.I18n.t('NFAWidget.Time',this);//No I18N
	 		graphParams.y_axes = jsonData.WidgetData.data.yAxis;
	 		graphParams.timeFormat = jsonData.Period !== undefined? jsonData.Period : 'hours';//No I18N
			graphParams.tooltip = [0,1];
			if(jsonData.WidgetForwardPage === "NFAWidget") {//No I18N
			   	graphParams.isNFATimeSeriesGraph = true;
			   	graphParams.stacked = false;
			}
			switch(jsonData.Name) {
				case "NFADB.AI.trend": //NO I18N
					graphParams.y_axes = nfa_getYAxisString(jsonData.WidgetData.data.yAxis);
					break;
				case "NFADB.AI.responseTime": //NO I18N
					graphParams.y_axes = Ember.I18n.t("nfa.dpi.responsetime")+" ( "+jsonData.WidgetData.data.yAxis+" )"; //NO I18N
					break;
			}
			this.set("graphParams",graphParams);//No I18N
		}
		else if(jsonData.WidgetData.message !== undefined || jsonData.WidgetData.data === undefined)
		{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("widget.configure",this)+"</span>"); //No I18N
		}
		else{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
		}
 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashGridBarComponent = Ember.Component.extend({
	templateName: "components/opm-dash-gridbar", //NO I18N
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashNFASummaryComponent = Ember.Component.extend({
	templateName: "components/opm-dash-nfasummary", //NO I18N
	didInsertElement: function(){
		var jsonData = this.get('widgetParams.apiData');//No I18N
		var bySeverity = jsonData.WidgetData.data.details;
		var severityArr = [{title:nfaStatusAsTxt[0],value:bySeverity.Critical,status:"1"},
			{title:nfaStatusAsTxt[1],value:bySeverity.Major,status:"2"},
			{title:nfaStatusAsTxt[2],value:bySeverity.Warning,status:"3"}
		];
		morrisDonutChart(this.widgetParams.widgetSubID,severityArr,statusColors,Ember.I18n.t('webclient.Alarm',this));//No I18N
	},
	willDestroyElement: function(){
		clearMorrisElements(this.widgetParams.widgetSubID);
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-dash-summary", //NO I18N
	showFilterDial:true,
	didInsertElement: function(){
		var widgetParams = this.get('widgetParams'); //No I18n

		var jsonData = this.get('widgetParams.apiData');//No I18N
		if(jsonData!==undefined && jsonData.WidgetAdditionalData!==undefined && !jsonData.WidgetAdditionalData.dialHide)
		{
			this.set("morrisLegendID",this.widgetParams.morrisID+"_legend");//No I18N
			var dialObj = opm_contructObjDonutDial(jsonData.WidgetData.Details,jsonData.WidgetData.AckDetails);
			morrisDonutChart(this.widgetParams.morrisID,dialObj.list,dialObj.colors,Ember.I18n.t('webclient.Alarm',this));//No I18N
		}else{
			this.set("showFilterDial",false);//No I18N
		}
		if(OPMClient.HomeDetailsController.dashboardName === "webclient.capacityplanning" && jsonData.Name === "widget.name.recentalarms") {
			this.set("hideGridData", true); //No I18N
			if(!jsonData.WidgetData || (!jsonData.WidgetData.Details || Object.keys(jsonData.WidgetData.Details).length === 0) && (!jsonData.WidgetData.List || jsonData.WidgetData.List.length === 0)) {
				var widgetHolder = $("#widget_holder_"+widgetParams.id);
				widgetHolder.data("nodatacomp", true); //No I18N
			}
		}
	},
	willDestroyElement: function(){
 		clearMorrisElements(this.widgetParams.widgetSubID);
 		$('#'+this.elementId).find('*').remove();
 	}
});

OPMClient.OpmDashSummaryWithBarComponent = Ember.Component.extend({
	templateName: "components/opm-dash-summary", //NO I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var apiData = widgetParams.apiData
		var jsonData = apiData.WidgetData;
		this.set("id", "gwidget"+widgetParams.id); //No I18n
 		var graphParams={};
 		graphParams.id = "gwidget"+widgetParams.id;//No I18N
 		graphParams.height = 250;
 		graphParams.graphType = "bar";//No I18N
 		graphParams.graphData = jsonData.Details.chartData;
 		graphParams.subType = "smootharea";//No I18N
 		graphParams.x_axes = jsonData.Details.xyTitles && jsonData.Details.xyTitles[0] ? jsonData.Details.xyTitles[0] : Ember.I18n.t('webclient.general.time',this);//No I18N
 		graphParams.y_axes = jsonData.Details.xyTitles && jsonData.Details.xyTitles[1] ? jsonData.Details.xyTitles[1] : Ember.I18n.t('webclient.widget.value',this);//No I18N
 		graphParams.legendEnabled=true;
		graphParams.color = statusColors;
 		graphParams.axesEnabled = true;
 		graphParams.maxBandWidth = 50;
 		graphParams.levelMarker = {enabled: false};
 		graphParams.hAlign = "center";//No I18N
 		graphParams.vAlign = "bottom";//No I18N
 		this.set('graphParams',graphParams);//No I18N
		this.set("showGraphContainer", true); //No I18n
	},
	willDestroyElement: function(){
 	}
});

OPMClient.OpmDashHollowPieComponent = Ember.Component.extend({
	templateName: "components/opm-dash-hollowpie", //NO I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$("#widget"+widgetParams.id).css('z-index','9');//No I18N
		var lastCnt = 0;
		var chartArr = [];
		$.each(jsonData.WidgetData,function(i,value)
		{
			lastCnt = (fluidicv2[lastCnt]!==undefined)?lastCnt:0;
			value.style = 'background:'+fluidicv2[lastCnt];//No I18N
			lastCnt++;
			chartArr.pushObject(value);
		});
		var chartParams = {};
		if(jsonData.Name === "widget.name.topn.problemdevices.activecount") {
			chartParams.Name = jsonData.Name;
		}
		chartParams.id = 'MainSeverityChart-widget_'+widgetParams.id;//No I18N
		chartParams.data = jsonData.WidgetData;
		chartParams.chartArr = chartArr;
		this.set('chartParams',chartParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashNutanixHollowPieComponent = Ember.Component.extend({
	templateName: "components/opm-dash-nutanixhollowpie", //NO I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$("#widget"+widgetParams.id).css('z-index','9');//No I18N
		var lastCnt = 0;
		var chartArr = [];
		$.each(jsonData.WidgetData,function(i,value)
		{
			lastCnt = (fluidicv2[lastCnt]!==undefined)?lastCnt:0;
			value.style = 'background:'+fluidicv2[lastCnt];//No I18N
			lastCnt++;
			chartArr.pushObject(value);
		});
		var chartParams = {};
		chartParams.id = 'MainSeverityChart-widget_'+widgetParams.id;//No I18N
		chartParams.data = jsonData.WidgetData;
		chartParams.chartArr = chartArr;
		chartParams.Name = jsonData.Name;
		this.set('chartParams',chartParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashDrawNutanixHollowpieComponent = Ember.Component.extend({
	templateName: "components/opm-dash-draw-nutanixhollowpie", //NO I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		var chartParams =this.chartParams;
		if(chartParams!=undefined){
			var titleName = Ember.I18n.t('webclient.vimonitor.snapshot.totvms',this);//No I18N
			if(chartParams.Name!==undefined && chartParams.Name!=="" && chartParams.Name!== null && chartParams.Name === "widget.ups.dashboard.name.battery.summary") {
				titleName = Ember.I18n.t('widget.ups.dashboard.battery.summary.devices',this); //No I18N
				$(".nutanix").addClass("ups-battery-summary-wid"); //No I18N
			}
			morrisDonutChart(chartParams.id,chartParams.data,fluidicv2,titleName);
		}
	},
	chartObserver:function(){
		this.rerender();
	}.observes('chartParams'),//NO I18N
	willDestroyElement: function(){
 		clearMorrisElements(this.chartParams.id);
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashDrawHollowpieComponent = Ember.Component.extend({
	templateName: "components/opm-dash-draw-hollowpie", //NO I18N
	didInsertElement: function()
	{
		var chartParams =this.chartParams;
		if(chartParams!=undefined){
			if(chartParams.Name === "widget.name.topn.problemdevices.activecount") {
				$('.FilterChart').removeClass("ipamDialIcon");
				morrisDonutChart(chartParams.id,chartParams.data,fluidicv2,Ember.I18n.t('webclient.Alarm',this));//No I18N
			}
			else { 
				morrisDonutChart(chartParams.id,chartParams.data,fluidicv2,Ember.I18n.t('webclient.general.Devices',this));//No I18N
			}
		}
	},
	chartObserver:function(){
		this.rerender();
	}.observes('chartParams'),//NO I18N
	willDestroyElement: function(){
 		clearMorrisElements(this.chartParams.id);
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmDashGermsComponent = Ember.Component.extend({
	templateName:"components/opm-dash-germs",//No I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		$("#widget"+widgetParams.id).css('border','1px solid #e5e5e5');//No I18N
		var germsParams = {};
		germsParams.id = "widget"+widgetParams.id+"_innerDiv";//No I18N
		germsParams.data = widgetParams.apiData.WidgetData;
		germsParams.wID = widgetParams.id;
		this.set('germsParams',germsParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();//No I18N
 	}
});
OPMClient.OpmDashDrawGermsComponent = Ember.Component.extend({
	templateName:"components/opm-dash-draw-germs",//No I18N
	didInsertElement: function()
	{
		var germsParams = this.germsParams;
		if(germsParams!=undefined)
		{
			if(germsParams.data!=undefined){
			loadIPSLAHopByHopMap(germsParams.data,$('#'+germsParams.id),germsParams.wID);
			}else{
				$("#widget"+this.germsParams.wID).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>");//No I18N
			}
		}
	},
	germsObserver:function(){
		this.rerender();
	}.observes('germsParams'),//NO I18N
	willDestroyElement: function(){
		jsPlumb.remove(this.elementId);
 		$('#'+this.elementId).find('*').remove();//No I18N
 	}
});
OPMClient.OpmDashDeviceTreeComponent = Ember.Component.extend({
	templateName:"components/opm-dash-devicetree",//No I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		var wName=jsonData.Name;
		var treeParams = {};
		treeParams.isNCMTree = false;
		treeParams.isNFATree = false;
		if(wName === "widget.name.ncmdeviceslist")
		 {
		 		treeParams.isNCMTree = true;
				treeParams.data = jsonData.WidgetData;
			treeParams.id = widgetParams.id;
			treeParams.widgetPagerId = widgetParams.widgetPagerId;
		}
		else if(wName === "NFADB.DevSummary")
		{
				treeParams.isNFATree = true;
			 	var data = jsonData.WidgetData.chartData;
				var max = 0;
				treeParams.valueArr = [];
				$.each(data,function(i,val)
				{
					max = max < val.count ? val.count : max;
					treeParams.valueArr.pushObject(val);
			 	});
			 	treeParams.listID = 'list_'+widgetParams.id;//No I18N
			 	treeParams.id = "bvTreeView"+widgetParams.id;//No I18N
			 	treeParams.wid = widgetParams.id;
			 	treeParams.max = max;
			 	treeParams.data = jsonData.WidgetData.data;
		 	treeParams.widgetPagerId = widgetParams.widgetPagerId;
		}
		else if(wName === "widget.storage.treeview")
		{
			treeParams.id = "bvTreeView"+widgetParams.id;//No I18N
			var widgetUniqueId = "bvTreeView"+widgetParams.id; //No I18N
			$('#'+widgetUniqueId).empty();
			if(jsonData.WidgetData !== undefined && jsonData.WidgetData !== null && jsonData.WidgetData.length > 0) {
				setTimeout(function(){
					$.each(jsonData.WidgetData, function(i,val){
						$.each(jsonData.WidgetData[i].children,  function(j,childrenval){
							if (window.OPM.isNewStatusPropagation && childrenval.state !== undefined && typeof childrenval.state !== 'object') {
								childrenval.icon = '--fault-severity icon-status --dual-status status-' + childrenval.status + ' ' + opm_getStateCls(childrenval.state);//No I18N
							} else {
								childrenval.icon="--fault-severity icon-status"+childrenval.status; //No I18N
							}
							childrenval.text = escapeHTML(childrenval.text);
						})
					});
					$('#'+widgetUniqueId).on('changed.jstree', function (e, data) { //No I18N
						if(data!==undefined && data.node!==undefined){
							if(data.node.original.name!==undefined) {
								var href = window.OPM.apiclientUrl+'Inventory/Snapshot/MonitoringDevice/'+data.node.original.name; //No I18N
								$('#'+widgetUniqueId).jstree('destroy');
								document.location.href = href;
							}
						}
					})
					.jstree({
						'core' : { //No I18N
							'themes' : { 'responsive' : false }, //No I18N
							'data' : jsonData.WidgetData //No I18N
						},
						'plugins' : ['state','dnd','wholerow'] //No I18N
					}).on('loaded.jstree',function(e,data){//No I18N
						if(widgetParams.id!==undefined){
							setTimeout(function(){
								dashcallbackNew(widgetParams.id);
							},100);
						}
					}).on('open_node.jstree',function(e,data){//No I18N
						if(widgetParams.id!==undefined){
							setTimeout(function(){
								dashcallbackNew(widgetParams.id);
							},100);
						}
					}).on('close_node.jstree',function(e,data){//No I18N    
						if(widgetParams.id!==undefined){
							setTimeout(function(){
								dashcallbackNew(widgetParams.id);
							},100);
						}
					})
				},200);
			} else {
				$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18N
			}
		}
		else if(wName === "widget.name.treeView" && jsonData.WidgetData.length>0)
		{
			treeParams.isDeviceTree = true;
			treeParams.WidgetData = jsonData.WidgetData;
			treeParams.widgetId = widgetParams.id;
			treeParams.groupBy = jsonData.WidgetAdditionalData.groupBy;
		}
	 	else
	 	{
			$("#widget"+widgetParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n
		}
		this.set('treeParams',treeParams);//NO I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();//No I18N
 	}
});
OPMClient.OpmDashDrawDevicetreeComponent = Ember.Component.extend({
	templateName:"components/opm-dash-draw-devicetree",//No I18N
	didInsertElement: function()
	{
		var treeParams = this.treeParams;
		if(treeParams!=undefined)
		{
			if(treeParams.isNCMTree)
			{
				var colNamesList = ["TemplateID",Ember.I18n.t('ncm.acd.Device_Type',this),Ember.I18n.t('ncm.acd.Vendor',this),Ember.I18n.t('jsp.commonstr.OSTypes',this),Ember.I18n.t('pdf.Devices',this)]; //No I18n
				var colModelList = [
					{hidden: true, name: "TemplateID"}, //No I18n
				    {name: "DisplayName"}, //No I18n
	            	{name: "VendorName"}, //No I18n
	            	{name: "OSType"}, //No I18n
	            	{name: "ResourceCount"} //No I18n
	            ];
				var defaultOptionsForTable = {};
	 			if(treeParams.data !== undefined && treeParams.data !== null && treeParams.data.length > 0) {
	 				defaultOptionsForTable.minRowsPerPage = 25;
	 				defaultOptionsForTable.gridCallBack = function(gridTableIdAlone){	
						gridWidthAlignment(gridTableIdAlone);
					};
	 				opm_loadJQgridWithData("#"+treeParams.id,treeParams.data,colNamesList,colModelList,"","#widget_pager_"+treeParams.id,"",defaultOptionsForTable); //No I18N
					$("#widget_pager_"+treeParams.id+"_left").hide();
	 			} else {
	 				$("#widget"+treeParams.id).html("<span class='cctvNoDataWidget'>"+Ember.I18n.t("webclient.reports.view.nodata",this)+"</span>"); //No I18n 
                    }
			}
			else if(treeParams.isNFATree)
			{
				$("#"+treeParams.id).addClass('netFlowDeviceSummary');
				setTimeout(function(){
					$("#"+treeParams.id+'.netFlowDeviceSummary .graph .single .bar i:first-child').each(function(){
						var percent = $(this).data('value') * 100 / treeParams.max;
						$(this).css("height",percent+"%"); 
					});
				},100);
				var nfa_deviceFilter = [];
				$("#"+treeParams.id+'.netFlowDeviceSummary .graph .single').off('click');//No I18N
				$("#"+treeParams.id+'.netFlowDeviceSummary .graph .single').click(function()
				{
					var category = $(this).data('category');//No I18N
					if($(this).hasClass('active'))
					{
						$(this).removeClass('active');	
 						nfa_deviceFilter.splice( $.inArray(category, nfa_deviceFilter), 1);

					}
					else
					{
						$(this).addClass('active');
						nfa_deviceFilter.push(category);	
					}
					
					var dataParams = {};
					if(nfa_deviceFilter.length > 0)
					{
						dataParams.advancedFilters='{"NFADevices_Type":["'+nfa_deviceFilter.toString()+'"]}';//No I18N
					}
					dataParams.wsId=sessionStorage.getItem("wsId");//No I18N
					dataParams.widgetID = treeParams.wid;
					 $.getJSON(eeClientReqToProbe(window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'),dataParams,function(filterData)  //No I18N
					 {
					 	filterData = filterData[treeParams.wid];
						//nfa_deviceSummaryWidgetData('list_'+treeParams.wid,filterData.WidgetData.data);//No I18N
						loadDeviceTreeGrid(treeParams.wid,filterData.WidgetData.data,treeParams.widgetPagerId);
					 });
					 dashcallbackNew(treeParams.wid);
				});
				//nfa_deviceSummaryWidgetData('list_'+treeParams.wid,treeParams.data);//No I18N
				loadDeviceTreeGrid(treeParams.wid,treeParams.data,treeParams.widgetPagerId);
			}
		}
	},
	treeObserver:function(){
		this.rerender();
	}.observes('treeParams'),//No I18N
	willDestroyElement: function(){
		$("#"+this.treeParams.id+'.netFlowDeviceSummary .graph .single').off('click');//No I18N
		$('#'+this.treeParams.id).jstree('destroy');
 		clearGridMemory('#'+this.elementId);
	}
});
OPMClient.OpmDashAgeMatrixComponent = Ember.Component.extend({
    templateName:"components/opm-dash-agematrix",//No I18N
    didInsertElement: function(){
        var widgetParams = this.widgetParams;
        var jsonData = widgetParams.apiData;
        loadAgeMatrixFirmVul(jsonData.WidgetData);
        $('#ageMatrixContainer .d3container .canvas-component .svgarea .chartsubtitle').attr('style','display : none');
        $('#ageMatrixContainer .d3container .canvas-component .legendarea').attr('style','display : none');//No I18N
        $('#ageMatrixContainer .d3container .canvas-property').attr('style','display : none');
    },
    willDestroyElement: function(){
        $('#'+this.elementId).find('*').remove();
    }
});
OPMClient.OpmDashNetworkPathComponent = Ember.Component.extend({
	templateName:"components/opm-dash-networkpath",//No I18N
	didInsertElement: function(){
		$("#dashboardScrollContainer").addClass("npScrollEvent");//No I18N
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$("#widget"+widgetParams.id).css({"height":"100%"});// No I18N
		networkPathHopHopViewWidget(jsonData.WidgetData,"gwidget"+widgetParams.id,widgetParams.id);	// No I18N
		$("#dashboardScrollContainer.npScrollEvent").off().on( 'scroll', function(){//No I18N
		   removeNetworkPathLinkTooltip();
		});
	},
	willDestroyElement: function(){
		var widgetIndex = this.widgetParams.id;
		networkPathDestroy(np_widgetNetwork[widgetIndex]);
 		 $('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashcustomNetworkPathComponent = Ember.Component.extend({
	templateName:"components/opm-dash-networkpath",//No I18N
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$("#widget"+widgetParams.id).css({"height":"100%"});// No I18N
		networkPathHopHopViewWidget(jsonData.WidgetData,"gwidget"+widgetParams.id,widgetParams.id);	// No I18N
	},
	willDestroyElement: function(){
		var widgetIndex = this.widgetParams.id;
		networkPathDestroy(np_widgetNetwork[widgetIndex]);
 		 $('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDashOverallSummaryComponent = Ember.Component.extend({
	templateName:"components/opm-dash-overall-summary",//No I18N
	availability:0,
	problematicDevices:0,
	totalDevices:0,
	totalAlarmsCount:0,
	alarmDetails:[],
	alarmSeverityLabel:[],
	availClass:"alarm-status-wrap alarm-status-success",//No I18N
	availImgPath:"/apiclient/fluidicv2/img/sprite-opm.svg#status-up",//No I18N
	healthClass:"alarm-status-wrap alarm-status-success",//No I18N
	healthImgPath:"/apiclient/fluidicv2/img/sprite-opm.svg#tick-circle",//No I18N
	alarmSeverityText:["critical","trouble","attention","down","success","unknown","unmanaged"],//No I18N
	alarmsHdrText:Ember.I18n.t("webclient.devices.details.alarm",this),//No I18N
	// URL widget grid panel state
	urlGridDiv: null,
	urlTableID: null,
	urlPagerID: null,
	urlSummaryContentId: null,
	_urlActiveFilter: null,

	/* -----------------------------------------------------------------------
	 * loadUrlGrid: shows a jqGrid slide panel below the OverallSummary
	 * widget displaying the list of down or problematic URL monitors.
	 * Behaves identically to OpmDashTileSummaryComponent._loadDeviceGrid:
	 *   - clicking the same filter a second time collapses the grid.
	 *   - the widget expands to full height while the grid is visible.
	 * --------------------------------------------------------------------- */
	loadUrlGrid: function(urlList, filterKey, filterLabel) {
		var widgetID      = this.widgetParams.gridStackId;
		var widgetId      = this.widgetParams.id;
		var gridDiv       = this.get('urlGridDiv'); //No I18N
		var tableID       = this.get('urlTableID'); //No I18N
		var pagerID       = this.get('urlPagerID'); //No I18N
		var summaryId     = this.get('urlSummaryContentId'); //No I18N
		var gridData = Array.isArray(urlList) ? urlList : [];

		// Same message-link formatter used by loadAlarmsGrid — navigates to the
		// alarm details page for the row when an alarmId is present.
		var alarmLinkFormatter = function(cellValue, options, rowdata) {
			if (rowdata.alarmId) {
				return "<a onclick='redirectToAlarm(\"" + opm_escapeHTML(rowdata.alarmId) + "\")' class='textBlue' style='cursor:pointer'>" + opm_escapeHTML(cellValue) + "</a>"; //No I18N
			}
			return opm_escapeHTML(cellValue);
		};
		var parentNameFormatter = function(cellValue,options,rowdata) {
			if(rowdata.parentName !=="-"){//No I18N
				return "<a onclick='redirectToSnapshot(\"MonitoringDevice\",\"" + opm_escapeHTML(rowdata.moName)+ "\")' class='textBlue' style='cursor:pointer'>" + opm_escapeHTML(cellValue) + "</a>"; //No I18N
			}
			return opm_escapeHTML(rowdata.parentName);
		};

		// "total" filter has no message column, "down"/"trouble" filters show it.
		var colNamesList = [];
		var colModelList = [];
		if (filterKey !== "total") { //No I18N
			colNamesList.push(Ember.I18n.t('webclient.admin.alarmesc.message', this)); //No I18N
			colModelList.push({ name: 'message', index: 'message', width: 200, classes: "cursorPointer", formatter: alarmLinkFormatter }); //No I18N
		}
		colNamesList = colNamesList.concat([
			Ember.I18n.t('webclient.admin.url.urlname', this),                //No I18N
			Ember.I18n.t('webclient.admin.url.url', this),             //No I18N
			Ember.I18n.t('webclient.fault.event.severity', this),    //No I18N
			Ember.I18n.t('webclient.fault.alarm.category', this),             //No I18N
			Ember.I18n.t('webclient.devices.details.parentname', this),  //No I18N
			"",""					//hidden entity column
		]);
		colModelList = colModelList.concat([
			{ name: 'urlName', index: 'urlName', width: 150, formatter: redirectToURLSnapshot }, //No I18N
			{ name: 'url', index: 'url', width: 100, formatter: cellValueEscapeFormat }, //No I18N
			{ name: 'severity', index: 'severity', width: 50, formatter: problemsStatusColorIcon }, //No I18N
			{ name: 'category', index: 'category', width: 100, formatter: cellValueEscapeFormat }, //No I18N
			{ name: 'parentName', index: 'parentName', width: 150, formatter: parentNameFormatter }, //No I18N
			{ name: 'entity', index: 'entity', hidden: true, sortable: false }, //No I18N
			{ name: 'moName', index: 'moName', hidden: true, sortable: false } //No I18N
		]);

		// Expand the widget before showing the grid
		var widgetLiSelector = $("#li_" + widgetId); //No I18N
		if (!widgetLiSelector.hasClass("dashboardWidgetExpandView")) { //No I18N
			widgetLiSelector.addClass("dashboardWidgetExpandView"); //No I18N
			$("body").addClass("widgetExpandView_temp"); //No I18N
		}

		var widgetHolder = $("#widget_holder_" + widgetId); //No I18N
		widgetHolder.css("height", "100%"); //No I18N
		widgetHolder.find(".content").css("height", "calc(100% - 40px)"); //No I18N
		widgetHolder.find(".opm_widget_title, .widget_name").css("display", "block"); //No I18N
		widgetHolder.find(".widget_name").text(filterLabel || this.widgetParams.widgetUniqueName); //No I18N

		$("#" + summaryId).hide(); //No I18N
		$("#" + gridDiv).show(); //No I18N

		Ember.run.schedule("afterRender", function() { //No I18N
			if ($("#" + tableID)[0] && $("#" + tableID)[0].grid) { //No I18N
				$("#" + tableID).jqGrid('GridUnload'); //No I18N
			}
			opm_loadJQgridWithData("#" + tableID, gridData, colNamesList, colModelList, "", "#" + pagerID); //No I18N
			var gridContainer = $("#" + tableID).closest('.opm_jqGridUI'); //No I18N
			gridContainer.css('width', '100%'); //No I18N
			$("#" + tableID).jqGrid('setGridWidth', gridContainer.width() - 30); //No I18N
			dashcallbackNew(widgetID);
		});
	},

	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var widgetName = widgetParams.widgetUniqueName;
		if(widgetName === "widget.apm.name.availhealthalarm.summary"){//No I18N
			this.set('isAPM',true);//No I18N
			this.set('redirectionInventory' ,window.OPM.apiclientUrl+'Inventory/List/Summary/Applications');//No I18N
		}else if(widgetName === "widget.url.name.availhealthalarm.summary"){//No I18N
			this.set('isURL',true);//No I18N
			this.set('isAPM',false);//No I18N
			this.set('redirectionInventory' ,window.OPM.apiclientUrl+'Inventory/List/Summary/Url');//No I18N
			// Grid-panel container IDs used by loadUrlGrid / the template
			this.set('urlGridDiv',          widgetParams.gridStackId + "urlGridDiv");        //No I18N
			this.set('urlTableID',          widgetParams.gridStackId + "urlTable");          //No I18N
			this.set('urlPagerID',          widgetParams.gridStackId + "urlPager");          //No I18N
			this.set('urlSummaryContentId', widgetParams.gridStackId + "urlSummaryContent"); //No I18N
		}else{
			this.set('isAPM',false);//No I18N
			this.set('redirectionInventory' ,window.OPM.apiclientUrl+'Inventory/List/Summary/Devices');//No I18N
		}
		if(widgetParams!==undefined && widgetParams.apiData!==undefined && widgetParams.apiData.WidgetData!==undefined)
		{
			var widgetData = widgetParams.apiData.WidgetData;
			if(widgetData.totalCount!==undefined){
				this.set("totalDevices",widgetData.totalCount);//No I18N
			}
			if(widgetData.availability!==undefined){
				this.set("availability",widgetData.availability);//No I18N
				if(widgetData.availability>0){
					this.set("availClass","alarm-status-wrap alarm-status-danger");//No I18N
					this.set("availImgPath","/apiclient/fluidicv2/img/sprite-opm.svg#status-down");//No I18N
				}
			}
			if(widgetData.health!==undefined){
				this.set("problematicDevices",widgetData.health);//No I18N
				if(widgetData.health>0){
					this.set("healthClass","alarm-status-wrap alarm-status-danger");//No I18N
					this.set("healthImgPath","/apiclient/fluidicv2/img/sprite-opm.svg#close-circle");//No I18N
				}
			}
			if(widgetData.alarms!==undefined)
			{
				var alarmsCount = 0;
				for(var i=0;i<widgetData.alarms.length;i++)
				{
					alarmsCount += widgetData.alarms[i].count;
					widgetData.alarms[i].severity = this.get("alarmSeverityText")[widgetData.alarms[i].status-1];//No I18N
					widgetData.alarms[i].displayText = widgetData.alarms[i].text+" - "+widgetData.alarms[i].count;
				}
				var doReCalculate = false;
				var minDataParams = 0;
				var otherCount = 0;
				if(alarmsCount>0)
				{
					for(var i=0;i<widgetData.alarms.length;i++)
					{
						var widthPercentile = Number(((Number(widgetData.alarms[i].count)*100)/alarmsCount).toString().match(/^\d+(?:\.\d{0,2})?/));
						widgetData.alarms[i].width = widthPercentile;
						widgetData.alarms[i].widthPercentile = "width:"+widthPercentile+"%";//No I18N
						if(widthPercentile<10){
							doReCalculate = true;
							minDataParams++;
						}else{
							otherCount += widgetData.alarms[i].count;
						}
					}
				}
				if(doReCalculate)
				{
					for(var i=0;i<widgetData.alarms.length;i++)
					{
						if(widgetData.alarms[i].width>=10){
							var widthPercentile = Number(((Number(widgetData.alarms[i].count)*(100-(minDataParams*10)))/otherCount).toString().match(/^\d+(?:\.\d{0,2})?/));
							widgetData.alarms[i].width = widthPercentile;
							widgetData.alarms[i].widthPercentile = "width:"+widthPercentile+"%";//No I18N
						}else{
							widgetData.alarms[i].width = 10;
							widgetData.alarms[i].widthPercentile = "width:10%";//No I18N
						}
					}
				}
				this.set("totalAlarmsCount",alarmsCount);//No I18N
				if(alarmsCount===0){
					$("#"+this.elementId+" .alarm-status-chart .alarm-status-name").addClass("cursorDefault");//No I18N
				}
				var severityLabels = $.extend(true,[],widgetData.alarms);
				severityLabels.sort(function(a,b){return a.status-b.status;});
				this.set("alarmSeverityLabel",severityLabels);//No I18N
				widgetData.alarms.sort(function(a,b){return b.status-a.status;});
				this.set("alarmDetails",widgetData.alarms);//No I18N
				if(widgetData.alarms.length===5)
				{
					this.set("alarmsHdrText",Ember.I18n.t("widget.name.allalarm",this));//No I18N
				}else if(widgetData.alarms.length<=4)
				{
				if(widgetData.isSeverityClearEnabled!=="true"){
					this.set("alarmsHdrText",Ember.I18n.t("webclient.tab.activealarm",this));//No I18N
					}
				}
			}
			if($("#"+widgetParams.gridStackId).width()>1050){
				$("#"+widgetParams.gridStackId+" .alarm-status-summary-widget").addClass("large-widget");//No I18N
			}
			
		}
		this.set('redirectionAlarm', redirectToAlarmList("All", true));//No I18N
		this.set('loadingCompleted',true);//No I18N
	},
	actions:{
		/* ------------------------------------------------------------------
		 * showUrlGrid: called from the handlebars {{action}} when the user
		 * clicks "Down URLs", "Problematic URLs" or "Total URLs" tiles on the
		 * URL widget.
		 * filterType: "down" | "trouble" | "total"
		 * ----------------------------------------------------------------- */
		showUrlGrid: function(filterType) {
			var widgetData = this.get('widgetParams.apiData.WidgetData'); //No I18N
			var urlList = [];
			var label  = "";
			if (filterType === "down") { //No I18N
				urlList = (widgetData && widgetData.downUrlList) ? widgetData.downUrlList : [];
				label   = Ember.I18n.t('webclient.reports.createreport.urls', this) + " " + Ember.I18n.t('webclient.devices.intftypes.down', this) + " (" + urlList.length + ")"; //No I18N
			} else if (filterType === "trouble") { //No I18N
				urlList = (widgetData && widgetData.troubleUrlList) ? widgetData.troubleUrlList : [];
				label   = Ember.I18n.t('opm.sdn.widget.problematic', this) + " " + Ember.I18n.t('webclient.reports.createreport.urls', this) + " (" + urlList.length + ")"; //No I18N
			} else if (filterType === "total") { //No I18N
				urlList = (widgetData && widgetData.totalUrlList) ? widgetData.totalUrlList : [];
				label   = Ember.I18n.t('webclient.reports.createreport.urls', this) + " (" + urlList.length + ")"; //No I18N
			}
			this.loadUrlGrid(urlList, filterType, label);
		},
		redirectToDevicesListPage:function(showProblematicDevicesOnly,showDownDevicesOnly)
		{    
            var filterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.deviceFilterObj);
 			var widgetParams = this.widgetParams;
 			var widgetAdditionalData = this.get('widgetParams.apiData.WidgetAdditionalData');//No I18N

     		if(widgetParams.widgetUniqueName === "widget.apm.name.availhealthalarm.summary"){//No I18N
  			 	updateLocalStorageValue("opmSummary_Applications","selectedFilterView", "treeView"); //No I18N
  			 	updateLocalStorageValue("opmSummary_Applications","selectedTreeFilter", "category"); //No I18N
  			 	if(showDownDevicesOnly || showProblematicDevicesOnly){
  			 		filterObj.severity = [1];
  			 	}
  			 	localStorage.setItem('ApplicationsfilterObj',JSON.stringify(filterObj)); //No I18N
             	localStorage.removeItem("opm_mapView");//No I18N
  			 	return;
	  		}
	  		
	  		if(widgetParams.widgetUniqueName === "widget.url.name.availhealthalarm.summary"){//No I18N
				var urlFilterObj = OPMClient.InventoryDeviceDetailsController.urlsFilterObj;
			     urlFilterObj.availability = [];
			     urlFilterObj.isDial = urlFilterObj.isHBar = true;
	  			// URL widget - apply severity filters only
	  			if(showDownDevicesOnly){
	  				// Down URLs - filter by Service Down severity (4)
				     urlFilterObj.severity = [4];
	  			}else if(showProblematicDevicesOnly){
	  				// Problematic URLs - filter by Critical severity (1)
				     urlFilterObj.severity = [1];

	  			}
	  			localStorage.setItem('urlsFilterObj',JSON.stringify(urlFilterObj)); //No I18N
	  			localStorage.removeItem("opm_mapView");//No I18N
	  			return;
	  		}

             if(widgetAdditionalData!==undefined)
             {
                 if(widgetAdditionalData.category!==undefined && widgetAdditionalData.category!=="")
                 {
                     filterObj.category = [widgetAdditionalData.category];
                 }
                 if(widgetAdditionalData.logicalGroupMoID!==undefined && widgetAdditionalData.logicalGroupMoID!=="")
                 {
                     var groupNameArr = widgetAdditionalData.logicalGroupMoID.split("__");//No I18N
                     if(groupNameArr.length>0){
                         filterObj.group = [groupNameArr[0]];
                     }
                 }
                 if(widgetAdditionalData.bvMoName!==undefined && widgetAdditionalData.bvMoName!=="")
                 {
                     var bvNameArr = widgetAdditionalData.bvMoName.split("_");//No I18N
                     if(bvNameArr.length>0){
                         filterObj.bv = [bvNameArr[0]];
                     }
                 }
             }
             if(showProblematicDevicesOnly)
             {
                 filterObj.severity = [1,2,3,4];
             }
             else if(showDownDevicesOnly)
             {
                 filterObj.state = [2];
             }   
             localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
             localStorage.removeItem("opm_mapView");//No I18N
        },
        redirectToAlarmsListPage:function(status, isRedirect){
            var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
			var params = this.widgetParams;
            if(filterObj!==undefined)
            {
                filterObj.filterType = "severity";//No I18N
                filterObj.period = "all";//No I18N
                if(OPMClient.ApplicationController.isCentralServer){
                    filterObj.probeName="All Sites";//No I18N
                }
            }
            sessionStorage.removeItem('alarmPeriod');//No I18N
            OPMClient.AlarmDetailsController.alarmSelectedFilters = {};
            var alarmSelectedFilters = OPMClient.AlarmDetailsController.alarmSelectedFilters;
			var widgetAdditionalData = this.get('widgetParams.apiData.WidgetAdditionalData');//No I18N
			var widgetData = this.get('widgetParams.apiData.WidgetData');//No I18N
			if(widgetAdditionalData!==undefined)
			{
				if(widgetAdditionalData.category!==undefined && widgetAdditionalData.category!=="")
				{
			 		alarmSelectedFilters.category = [widgetAdditionalData.category];
				}
				// Only apply alertType filter for URL widget
				if(params.widgetUniqueName === "widget.url.name.availhealthalarm.summary" && widgetAdditionalData.alertType!==undefined && widgetAdditionalData.alertType!=="")//No I18N
				{
			 		alarmSelectedFilters.alertType = widgetAdditionalData.alertType;
				}
				if(params.widgetUniqueName === "widget.url.name.availhealthalarm.summary" && widgetAdditionalData.deviceName!==undefined && widgetAdditionalData.deviceName!=="")//No I18N
				{
			 		alarmSelectedFilters.deviceName = widgetAdditionalData.deviceName;
				}
				if(widgetAdditionalData.logicalGroupMoID!==undefined && widgetAdditionalData.logicalGroupMoID!=="")
				{
			     	alarmSelectedFilters.group = [widgetAdditionalData.logicalGroupMoID];
				}
				if(widgetAdditionalData.bviewMoID!==undefined && widgetAdditionalData.bviewMoID!=="")
				{
			    	alarmSelectedFilters.bv = [widgetAdditionalData.bviewMoID];
				}
				if(widgetAdditionalData.excludeAckAlarm === "true")
				{
					alarmSelectedFilters.isAcknowledge = false;
				}
				if(status!==undefined)
				{
			 		alarmSelectedFilters.severity = [];
			 		alarmSelectedFilters.severity.push(status+"");
				}
				else
				{
					if (widgetAdditionalData.severity) {
						alarmSelectedFilters.severity = widgetAdditionalData.severity.split(',').map(function(s) { return s.trim(); }).filter(Boolean); //No I18N
					}
				}
				sessionStorage.setItem('alarmRedirectFilters',JSON.stringify(alarmSelectedFilters));//No I18N
			}
			if(widgetData!==undefined && widgetData.alarms!==undefined && widgetData.alarms.length>0)
            {
				if(isRedirect) {
					redirectToAlarmList("All");//No I18N
				}
            }
        },
		redirectToSpecificAlarms:function(status){
			if(status===5){
				redirectToAlarmList("All");//No I18N
				setTimeout(function(){
					$('#BarHolderClear .SingleBar').click();//No I18N
				},100);
			}else{
				redirectToAlarmList("Active");//No I18N
				setTimeout(function(){
					var dialID;
					if(status===1){
						dialID = "CatCritical-A";//No I18N
					}else if(status===2){
						dialID = "CatTrouble-A";//No I18N
					}else if(status===3){
						dialID = "CatAttention-A";//No I18N
					}else if(status===4){
						dialID = "CatServiceDown-A";//No I18N
                    }else if(status===6){
                        dialID = "CatInfo-A";//No I18N
					}
					if(dialID!==undefined){
						clickRadialDialSeverity(undefined,dialID);
					}
				},100);
			}
		}
	},
	willDestroyElement: function(){
 		 $('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDashTileComponent = Ember.Component.extend({
	templateName:"components/opm-dash-tile",//No I18N
	count:0,
	label:"",
	description: Ember.I18n.t("webclient.common.nodata"),//No I18N
	customLabel: "",
	isKPIWidget: false,
	unit: "",
 	didInsertElement: function(){
		var apiData = this.widgetParams.apiData;
		var widgetID = this.widgetParams.gridStackId;
		var gridDiv = widgetID + "_gridDiv";//No I18N
		var tableID = widgetID + "_table"//No I18N
		var pagerID = widgetID + "_pager";//No I18N
		var tileID = widgetID + "_tile";//No I18N
		var self = this;
		this.set("pagerID", pagerID);//No I18N
		this.set("tableID", tableID);//No I18N
		this.set("tileID", tileID);//No I18N
		this.set("gridDiv", gridDiv);//No I18N
		this.set("widgetExpanded", false); //No I18n

		Ember.run.schedule("afterRender", function() {//No I18N
			$("#" + tileID).show();//No I18N
			$("#" + gridDiv).hide();//No I18N
		})
		$("#" + this.widgetParams.gridStackId).addClass("entityCount"); //No I18N
		if(OPMClient.HomeDetailsController.dashboardName == 'webclient.capacityplanning') {
			var gridInstance = Ember.View.views.dashboardArrayContainer.get("grid");
			gridInstance.update(widgetID, { noMove: true, locked: true, noResize: true});
			$("#" + widgetID + " .opm_widget_title").css({cursor: "default"});//No I18N
		}
		if(cpWidgets.includes(apiData.Name) || ["widget.zia.dashboard.name.anomalies.group.highest","widget.zia.dashboard.name.anomalies.device.highest","NFADB.AI.topService"].includes(apiData.Name)) {
			$("#" + widgetID + " .tile-widget__value").addClass("pointer"); //No I18n
		}
		//Show Grid related data if expanded
		if(cpWidgets.includes(apiData.Name) && $("#" + widgetID).hasClass("dashboardWidgetExpandView")) {//No I18N
			var gridColData = this.widgetParams.apiData.GridWidget;
			var colModelList = gridColData.colModelList;
			var colNamesList = gridColData.colNamesList;
			var gridData = this.widgetParams.apiData.WidgetData;
			
			for(var i = 0; i < colModelList.length; i++)
			{
				var columnModel = colModelList[i];
				if(columnModel.formatter != null && columnModel.formatter != "")
				{
					var tmpFunc = new Function('return '+columnModel.formatter);
					columnModel.formatter = tmpFunc();
				}
			}
			this.set("widgetExpanded", true); //No I18n
			Ember.run.schedule("afterRender", function() {//No I18N
				$("#" + tileID).hide();//No I18N
				$("#" + gridDiv).show();//No I18N
				opm_loadJQgridWithData("#" + tableID, gridData, colNamesList, colModelList, "", "#" + pagerID); //No I18N
				$("#" + tableID).jqGrid('setGridWidth', $("#" + tableID).closest('.opm_jqGridUI').width()-30); //No I18N
				dashcallbackNew(widgetID);
				if(apiData.WidgetAdditionalData && apiData.WidgetAdditionalData.cpRuleProps) {
					var appliedRule = returnAppliedRuleLabel(apiData.WidgetAdditionalData.cpRuleProps);
					self.set("customLabel", appliedRule); //No I18n
				}
			})
			return;
		}

		$("#" + "widget_holder_" + this.widgetParams.id).addClass("tile-widget");
		//Tile Customization part
		this.set("widgetTitle", apiData.WidgetName); // No I18N
		var tileHeader = Ember.I18n.t("webclient.common.nodata"); //NO I18n
		var tileFooter = "";
		if (apiData.WidgetData && apiData.WidgetAdditionalData) {
			if(apiData.WidgetAdditionalData.tileHeader !== undefined) {
				tileHeader = apiData.WidgetAdditionalData.tileHeader;
			}
			if(apiData.WidgetAdditionalData.tileFooter !== undefined) {
				var validTimePeriod = opmEnhancedGraphPeriods.filter(function(obj) { return obj.period === apiData.WidgetAdditionalData.tileFooter; })[0];
				tileFooter = validTimePeriod ? validTimePeriod.title : apiData.WidgetAdditionalData.tileFooter;
			}
			if(apiData.isKPIWidget !== undefined){
                this.set("isKPIWidget", true);//No I18N
                if(apiData.WidgetAdditionalData.tileUnit !== undefined) {
                    this.set("unit", apiData.WidgetAdditionalData.tileUnit);//No I18N
                }
            }
		}
		tileFooter = opm_composeTileFooter(tileFooter, apiData.WidgetAdditionalData ? apiData.WidgetAdditionalData.tileSubHeader : undefined);
		this.set("count", tileHeader); // No I18N
		this.set("label", apiData.WidgetName); // No I18N
		this.set("description", tileFooter);//No I18N
 	},
	actions: {
		expandEntityCount: function() {
			var apiData = this.widgetParams.apiData;
			if(!cpWidgets.includes(this.widgetParams.apiData.Name) && !["widget.zia.dashboard.name.anomalies.group.highest","widget.zia.dashboard.name.anomalies.device.highest","NFADB.AI.topService"].includes(this.widgetParams.apiData.Name)) {
				return;
			}
			if(cpWidgets.includes(this.widgetParams.apiData.Name)) {
				var widID = this.widgetParams.gridStackId;
				var widgetHeaderSelector = $("#" + widID + " .opm_widget_header");//No I18N
				var widgetHeaderId = widgetHeaderSelector.attr("id");//No I18N
				var widgetHeaderInstance = Ember.View.views[widgetHeaderId];
				widgetHeaderInstance.send("expandWidget");//No I18N
				return;
			}
			if(["widget.zia.dashboard.name.anomalies.group.highest","widget.zia.dashboard.name.anomalies.device.highest"].includes(this.widgetParams.apiData.Name)) {
				var id = apiData.WidgetData[0];
				var type = apiData.Name === "widget.zia.dashboard.name.anomalies.device.highest" ? "devices" : "groups"; //No I18N
				redirectToAnomalyPage(id, type, apiData.Period);
        return;
			}
			if (this.widgetParams.apiData.Name === "NFADB.AI.topService") {
				if (!apiData.WidgetData.data || !apiData.WidgetData.data.topService) {
					return;
				}
				OPMClient.InventoryDeviceDetailsController.gridRowData = {dpiEngineID: apiData.WidgetData.dpiEngineID};
				opmGlobalRoute.transitionTo("Inventory.Device.index", "DPILayer7", encodeURIComponent(this.count)); //NO I18N
			}
		}
	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();//No I18N
 	}
});


OPMClient.OpmDashTrendGraphComponent = Ember.Component.extend({
	templateName:"components/opm-dashpie-table",//No I18N
	didInsertElement: function() {
		var widgetParams = this.widgetParams;
 		var jsonData = widgetParams.apiData;
		if(jsonData.WidgetAdditionalData && (jsonData.WidgetAdditionalData.deviceDisplayName || jsonData.WidgetAdditionalData.interfaceDisplayName)) {
			$("#" + widgetParams.gridStackId + " .opm_widget_header .widget_name").text(Ember.I18n.t("webclient.dashboard.cp.trend", {deviceName: jsonData.WidgetAdditionalData.deviceDisplayName || jsonData.WidgetAdditionalData.interfaceDisplayName})); //No I18N
		}
 		if(jsonData.WidgetData && jsonData.WidgetData.length > 0)
		{
			var graphParams = returnTrendGraphParams(jsonData);
			graphParams.id = "gwidget"+widgetParams.id;//No I18N
			if(graphParams.customLabel) {
				this.set("customLabel", graphParams.customLabel);//No I18N
			}
			this.set("graphParams",graphParams);//No I18N
		} else {
			this.set("noDataDiv", true); //No I18n
		}
	}
})

OPMClient.OpmDashNFAGraphTableComponent = Ember.Component.extend({
	templateName: "components/opm-dash-summary", //NO I18N
	didInsertElement: function() {
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;

		// Graph data handling
		var graphParams = {
			id: "gwidget" + widgetParams.id, //NO I18N
			graphType: "line" //NO I18N
		};
		if (jsonData.Name === "NFADB.AI.topServices") {
			graphParams.graphType = "bar"; //NO I18N
			graphParams.rotated = true;
			graphParams.axesEnabled = true;
			graphParams.tooltip = [0, 1];
			var widgetData = (jsonData.WidgetData && jsonData.WidgetData.data) ? jsonData.WidgetData.data : {};
			graphParams.x_axes = widgetData.xyTitles ? widgetData.xyTitles[0] : ""; //NO I18N
			graphParams.y_axes = widgetData.xyTitles ? widgetData.xyTitles[1] : ""; //NO I18N
			graphParams.graphData = widgetData.graphData || [];
		}
		this.set("graphParams", graphParams); //NO I18N
		this.set("showGraphContainer", true); //NO I18N
	}
});

function returnTrendGraphParams(jsonData) {
	var graphParams = {};
	graphParams.graphType = "line";//No I18N
   	graphParams.graphData = jsonData.WidgetData;
	graphParams.height = 300;
	graphParams.stacked = false;
	graphParams.strokeWidth = 1;
	graphParams.x_axes = Ember.I18n.t('NFAWidget.Time',this);//No I18N
	graphParams.y_axes = Ember.I18n.t("webclient.support.thread.percentage") + "(%)"; //No I18n
	graphParams.timeFormat = jsonData.Period !== undefined? jsonData.Period : 'hours';//No I18N
   	graphParams.tooltip = [0,1];
	var appliedRule = ""
	if(jsonData.WidgetAdditionalData && jsonData.WidgetAdditionalData.cpRuleProps) {
		appliedRule = returnAppliedRuleLabel(jsonData.WidgetAdditionalData.cpRuleProps)
	}
	graphParams.customLegend = {
		"hAlign": "center",//No I18N
		"vAlign": "bottom",//No I18N
		"layout": "horizontal"//No I18N
	};
	graphParams.customLabel = appliedRule;
   return graphParams;
}

function returnAppliedRuleLabel(cpRuleProps) {
	var cpMap = {};
	for (var i=0;i<cpRuleProps.metrics.length;i++) {
		var metric = cpRuleProps.metrics[i];
		var consolidateValue = escapeHTML(metric.monitorName);
		if(metric.thresholdCondition==="1"){
			consolidateValue += " >";//No I18N
		}else if(metric.thresholdCondition==="2"){
			consolidateValue += " < ";//No I18N
		}else if(metric.thresholdCondition==="3"){
			consolidateValue += " >= ";//No I18N
		}else if(metric.thresholdCondition==="4"){
			consolidateValue += " <= ";//No I18N
		}
		consolidateValue += " "+escapeHTML(metric.thresholdValue);
		cpMap[metric.thresholdId] = " "+consolidateValue+" ";//No I18N
	}

	var appliedRule = cpRuleProps.criteriaPattern.replace(/\d+/g, function(val) {
		return cpMap[val] || val;
	});

	if(cpRuleProps.timeCondition!==undefined && cpRuleProps.timeThreshold!==undefined)
	{
		if(cpRuleProps.timeCondition==="1" || cpRuleProps.timeCondition==="3"){//No I18N
			appliedRule = Ember.I18n.t("webclient.dashboard.cp.trend.rulelabel.more", {ruleLabel: appliedRule, timeThreshold: cpRuleProps.timeThreshold});//No I18N
		}else if(cpRuleProps.timeCondition==="2" || cpRuleProps.timeCondition==="4"){//No I18N
			appliedRule =  Ember.I18n.t("webclient.dashboard.cp.trend.rulelabel.less", {ruleLabel: appliedRule, timeThreshold: cpRuleProps.timeThreshold});//No I18N
		}
	}
	return appliedRule;
}

OPMClient.OpmDashMapViewComponent = Ember.Component.extend({
	templateName:"components/opm-dash-mapview",//No I18N
 	didInsertElement: function(){
 		var self = this;
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
	//	$("#widget"+widgetParams.id).css({"height":"100%"});// No I18N	
		
	//	$("#gwidget"+widgetParams.id).css({"height":"100%"});// No I18N	
		var groupId = (jsonData.WidgetAdditionalData.groupName).split("-")[1];	
		groupsMapViewJSON(groupId,"Group",widgetParams.graphWidgetId,true,false,true);//No I18N	
	//	calculateMapWidgetWidHt(widgetParams.id, $("#"+widgetParams.graphWidgetId).height(),$("#"+widgetParams.graphWidgetId).width());

 	},
 	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDashLazyHeatmapComponent = Ember.Component.extend({
	templateName: "components/opm-dash-lazy-heatmap", // No I18N
	totalDevCount:0,
	maxLoadCount:500,
	loadedCount:0,
	objectDetails:[],
	isHieraricalGroup:false,
	isWANIPParentView:false,
	didInsertElement: function() {
		var widgetParams = this.heatMapObj;
		
		this.set('totalDevCount', widgetParams.data.length);//No I18N
		var self = this;
		var loadData = widgetParams.data || [];
		var maxLoad = this.maxLoadCount || 500;
		this.set('isHieraricalGroup', widgetParams.isHieraricalGrp);//No I18N
		this.set('isWANIPParentView', widgetParams.isWANIPParentView);//No I18N	
		this.set('objectDetails', loadData.slice(0, maxLoad));//No I18N
		this.set('loadedCount', Math.min(maxLoad, loadData.length));//No I18N

		function loadMoreDevices() {
			var currentCount = self.get('loadedCount');
			if (currentCount >= loadData.length) return;
			var nextCount = Math.min(currentCount + maxLoad, loadData.length);
			self.get('objectDetails').pushObjects(loadData.slice(currentCount, nextCount));
			self.set('loadedCount', nextCount);//No I18N
			setTimeout(function(){
				opm_customTooltip();
			},200);
		}

		// Attach scroll event to container
		Ember.run.scheduleOnce('afterRender', function() {//No I18N
			
			var $container = $('#'+self.elementId).closest('.heatMapWidgetScrollContainer, #heatMapWidgetScrollContainer');
			if ($container.length === 0) return;
			$container.off('scroll.lazyHeatmap').on('scroll.lazyHeatmap', function() {//No I18N
				var scrollTop = $container.scrollTop();
				var innerHeight = $container.innerHeight();
				var scrollHeight = $container[0].scrollHeight;
				// Load more when scrolled to 80% of the container
				if (scrollTop + innerHeight >= 0.8 * scrollHeight && self.get('loadedCount') < self.get('totalDevCount')) {
					loadMoreDevices();
				}
			});
		postHeatChartRenderer(self.heatMapObj.id,self.heatMapObj.isOPMAvailabilityData,self.heatMapObj.heatmapGraphLabel);

		});
	},
	willDestroyElement: function() {
	}
});

OPMClient.OpmDashOverallAvailsummaryComponent = Ember.Component.extend({
	templateName:"components/opm-dash-overall-availsummary",//No I18N
	siteAvailaability:0,
	problematicSites:0,
	totalSites:0,
	wanIPAvailaability:0,
	problematicWANIPs:0,
	totalWANIPs:0,
	siteAvailClass:"alarm-status-wrap alarm-status-success",//No I18N
	siteAvailImgPath:"/apiclient/fluidicv2/img/sprite-opm.svg#status-up",//No I18N
	wanIPavailClass:"alarm-status-wrap alarm-status-success",//No I18N
	wanIPImgPath:"/apiclient/fluidicv2/img/sprite-opm.svg#status-up",//No I18N
	showAlarmDetails:true,
	didInsertElement: function(){
		var widgetParams = this.widgetParams;
		var widgetName = widgetParams.widgetUniqueName;
		this.set('redirectionInventory' ,window.OPM.apiclientUrl+'Inventory/List/WAN/Overview/Links');//No I18N
		if(widgetParams!==undefined && widgetParams.apiData!==undefined && widgetParams.apiData.WidgetData!==undefined)
		{
			var siteData = widgetParams.apiData.WidgetData.siteAvailability;
			var wanIPData = widgetParams.apiData.WidgetData.wanAvailability;
			if(siteData.totalCount!==undefined){
				this.set("totalSites",siteData.totalCount);//No I18N
			}
			if(wanIPData.totalCount!==undefined){
				this.set("totalWANIPs",wanIPData.totalCount);//No I18N
			}
			if(siteData.downCount!==undefined){
				this.set("problematicSites",siteData.downCount);//No I18N
				if(siteData.downCount>0){
					this.set("siteAvailClass","alarm-status-wrap alarm-status-danger");//No I18N
					this.set("siteAvailImgPath","/apiclient/fluidicv2/img/sprite-opm.svg#status-down");//No I18N
				}
			}
			if(wanIPData.downCount!==undefined){
				this.set("problematicWANIPs",wanIPData.downCount);//No I18N
				if(wanIPData.downCount>0){
					this.set("wanIPavailClass","alarm-status-wrap alarm-status-danger");//No I18N
					this.set("wanIPImgPath","/apiclient/fluidicv2/img/sprite-opm.svg#status-down");//No I18N
				}
			}
			
			if($("#"+widgetParams.gridStackId).width()>1050){
				$("#"+widgetParams.gridStackId+" .alarm-status-summary-widget").addClass("large-widget");//No I18N
			}
		}
		this.set('loadingCompleted',true);//No I18N
	},
	actions:{
		loadWANIPListPage:function(withSeverity)
		{    
            var apiData = this.widgetParams.apiData.WidgetAdditionalData;
			var selectedSites = [];
			if(apiData !== undefined && apiData.selectedWANIPSites !== undefined && apiData.selectedWANIPSites !== "All"){
				$.each(apiData.selectedWANIPSites.split(","), function(index, value){
					selectedSites.push(value);
				});
			}
			opm_WANIPLinkCountWithFilter(selectedSites, withSeverity);
        },
        redirectToAlarmsListPage:function(status, isRedirect){
            var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
			var params = this.widgetParams;
            if(filterObj!==undefined)
            {
                filterObj.filterType = "severity";//No I18N
                filterObj.period = "all";//No I18N
                if(OPMClient.ApplicationController.isCentralServer){
                    filterObj.probeName= Ember.I18n.t("webclient.reports.allsites");//No I18N
                }
            }
            sessionStorage.removeItem('alarmPeriod');//No I18N
            OPMClient.AlarmDetailsController.alarmSelectedFilters = {};
            var alarmSelectedFilters = OPMClient.AlarmDetailsController.alarmSelectedFilters;
			var widgetAdditionalData = this.get('widgetParams.apiData.WidgetAdditionalData');//No I18N
			var widgetData = this.get('widgetParams.apiData.WidgetData');//No I18N
			if(widgetAdditionalData!==undefined)
			{
				if(widgetAdditionalData.category!==undefined && widgetAdditionalData.category!=="")
				{
			 		alarmSelectedFilters.category = [widgetAdditionalData.category];
				}
				if(widgetAdditionalData.logicalGroupMoID!==undefined && widgetAdditionalData.logicalGroupMoID!=="")
				{
			     	alarmSelectedFilters.group = [widgetAdditionalData.logicalGroupMoID];
				}
				if(widgetAdditionalData.bviewMoID!==undefined && widgetAdditionalData.bviewMoID!=="")
				{
			    	alarmSelectedFilters.bv = [widgetAdditionalData.bviewMoID];
				}
				if(status!==undefined)
				{
			 		alarmSelectedFilters.severity = [];
			 		alarmSelectedFilters.severity.push(status+"");
				}
				else
				{
                    if(widgetData!==undefined && widgetData.alarms!==undefined && widgetData.alarms.length>0)
                    {
                        alarmSelectedFilters.severity = [];
                        for(var i=0;i<widgetData.alarms.length;i++)
                        {
                            alarmSelectedFilters.severity.push(widgetData.alarms[i].status+"");
                        }
                    }
				}
			}
			if(widgetData!==undefined && widgetData.alarms!==undefined && widgetData.alarms.length>0)
            {
				if(isRedirect) {
					redirectToAlarmList("All");//No I18N
				}
            }
        },
		redirectToSpecificAlarms:function(status){
			if(status===5){
				redirectToAlarmList("All");//No I18N
				setTimeout(function(){
					$('#BarHolderClear .SingleBar').click();//No I18N
				},100);
			}else{
				redirectToAlarmList("Active");//No I18N
				setTimeout(function(){
					var dialID;
					if(status===1){
						dialID = "CatCritical-A";//No I18N
					}else if(status===2){
						dialID = "CatTrouble-A";//No I18N
					}else if(status===3){
						dialID = "CatAttention-A";//No I18N
					}else if(status===4){
						dialID = "CatServiceDown-A";//No I18N
                    }else if(status===6){
                        dialID = "CatInfo-A";//No I18N
					}
					if(dialID!==undefined){
						clickRadialDialSeverity(undefined,dialID);
					}
				},100);
			}
		}
	},
	willDestroyElement: function(){
 		 $('#'+this.elementId).find('*').remove();
	}
});
