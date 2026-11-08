/**
 * Device Snapshot Open Framework Components
 * 
 * Provides modular components for device monitoring interfaces with:
 * - Dynamic tab management (main tabs + sub-tabs)  
 * - Widget grid positioning with automatic layout
 * - Route-based navigation integration
 * - Real-time content updates and observer management
 * - Rate limiting protection against UI chaos
 */

// Core framework component that orchestrates all device snapshot functionality
OPMClient.DeviceSnapshotFrameworkComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-framework", //No I18N
	tagName: 'section',//No I18N
	classNames: ['DI-Accordion'], //No I18N
	showHeader: true,
	showContent: true,
	snapshotObj: null,
	activeTabId: null,
	activeMainTabId: null,
	currentWidgetData: [],
	useOutlet: false,
	outletName: null,
	routeName: null,
	originalSnapshotRoute: 'Inventory.Device.index',//No I18N
	
	// Grid layout constants
	GRID_MAX_COLUMN: 9,        // Maximum column position (gs-x1 to gs-x9)
	GRID_MIN_WIDTH: 2,         // Minimum widget width
	GRID_MAX_WIDTH: 10,        // Maximum widget width
	GRID_MAX_POSITION: 11,     // Max column + min width (9 + 2 = 11)
	
	// Timing constants (in milliseconds)
	DELAY_FRAMEWORK_REINIT: 50,          // Delay after framework reset before initializing tabs
	DELAY_TAB_CHANGE_DEBOUNCE: 50,       // Debounce delay for tab change observer
	DELAY_HEIGHT_BATCH_DEBOUNCE: 250,    // Debounce delay for batching height updates
	DELAY_GRID_RECALC_DEBOUNCE: 0,       // Debounce delay for grid recalculation (immediate)
	
	// Rate limiter constants
	RATE_LIMIT_TAB_CHANGE: { maxCalls: 5, windowMs: 1000 },    // Tab change: 5 calls per 1 second
	RATE_LIMIT_GRID_SCHEDULE: { maxCalls: 10, windowMs: 3000 }, // Grid schedule: 10 calls per 3 seconds
	RATE_LIMIT_GRID_RECALC: { maxCalls: 10, windowMs: 3000 },   // Grid recalc: 10 calls per 3 seconds
	
	// Maps specific tabs to Ember routes for seamless navigation
	// When these tabs are selected, framework switches to route-based rendering
	tabRouteConfig: {
		'tab-monitors': {//No I18N
			routeName: 'Inventory.Device.Monitors.index', //No I18N
			outletName: 'deviceSnapshotMonitors' //No I18N
		},
		'tab-gpu-dashboard': {//No I18N
			routeName: 'Inventory.Device.GpuDashboard.index', //No I18N
			outletName: 'deviceSnapshotGpuDashboard'  //No I18N
		}
	},
	
	snapConfigData: function() {
		var snapshotObj = this.get('snapshotObj');
		return snapshotObj ? snapshotObj.snapConfigData : null;
	}.property('snapshotObj.snapConfigData'), //No I18N
	
	tabDefinitions: function() {
		var snapConfigData = this.get('snapConfigData');
		return snapConfigData ? snapConfigData.tabDefinitions : [];
	}.property('snapConfigData'), //No I18N
	
	isChildTabsAvailable: function() {
		var snapConfigData = this.get('snapConfigData');
		return snapConfigData ? snapConfigData.isChildTabsAvailable : false;
	}.property('snapConfigData'), //No I18N
	
	/**
	 * Unified rate limiter prevents observer chaos and infinite loops
	 * @param {string} key - Unique identifier for rate limiting context
	 * @param {number} maxCalls - Maximum allowed calls per time window  
	 * @param {number} timeWindowMs - Time window in milliseconds
	 * @returns {boolean} true if rate limited (call should be ignored)
	 */
	isRateLimited: function(key, maxCalls, timeWindowMs) {
		timeWindowMs = timeWindowMs || 3000; // Default: 3 second window
		maxCalls = maxCalls || 5; // Default: 5 calls maximum
		
		var now = Date.now();
		var limiterKey = '_rateLimiter_' + key; //No I18n
		var limiter = this[limiterKey] || { count: 0, lastReset: now };
		
		// Reset counter if time window has passed
		if (now - limiter.lastReset > timeWindowMs) {
			limiter.count = 1;
			limiter.lastReset = now;
		} else {
			limiter.count++;
		}
		
		this[limiterKey] = limiter;
		
		// Return true if rate limited (exceeded max calls)
		return limiter.count > maxCalls;
	},
	
	didInsertElement: function() {
		var self = this;
		Ember.run.next(function() {
			self.checkIfOnSubRoute();
			self.initializeActiveTabs();
		});
	},
	
	/**
	 * Cleanup when component is destroyed to prevent memory leaks
	 * Cancels pending debounces and clears internal state
	 */
	willDestroyElement: function() {
		// Cancel any pending debounce timers to prevent memory leaks
		Ember.run.cancel(this._activeTabDebounce);
		Ember.run.cancel(this._batchHeightDebounce);
		
		// Clear internal state flags
		this._lastProcessedTabKey = null;
		this._currentlyProcessingTab = null;
		this._isLoadingWidgets = false;
		this._batchingPropertyChanges = false;
		
		// Clear rate limiter cache (optional, helps with long-running sessions)
		for (var key in this) {
			if (this.hasOwnProperty(key) && key.indexOf('_rateLimiter_') === 0) {
				delete this[key];
			}
		}
	},
	
	snapshotObjObserver: function() {
		this.reinitializeFramework();
	}.observes('snapshotObj'), //No I18N
	
	/**
	 * Complete framework reset when snapshot data changes
	 * Ensures clean state before loading new device configuration
	 */
	reinitializeFramework: function() {
		var self = this;
		Ember.run(function() {
			self.set('activeTabId', null); //No I18N
			self.set('activeMainTabId', null); //No I18N
			self.set('currentWidgetData', []); //No I18N
			self.set('useOutlet', false); //No I18N
			self.set('outletName', null); //No I18N
			self.set('routeName', null); //No I18N
			// Clear internal processing locks
			self._lastProcessedTabKey = null;
			self._currentlyProcessingTab = null;
		});
		// Show framework content in case it was hidden
		self.showFrameworkContent();
		// Now initialize fresh tabs with a slight delay to ensure state is cleared
		Ember.run.later(function() {
			self.initializeActiveTabs();
		}, self.DELAY_FRAMEWORK_REINIT);
	},
	
	checkIfOnSubRoute: function() {
		var currentPath = OPMClient.ApplicationController.currentPath;
		var originalRoute = this.get('originalSnapshotRoute');
		
		if (currentPath && currentPath !== originalRoute) {
			var tabRouteConfig = this.get('tabRouteConfig');
			for (var tabId in tabRouteConfig) {
				var routeConfig = tabRouteConfig[tabId];
				if (routeConfig && routeConfig.routeName && currentPath === routeConfig.routeName) {
					this.set('useOutlet', true);//No I18N
					this.set('outletName', routeConfig.outletName);//No I18N
					this.set('routeName', routeConfig.routeName);//No I18N
					
					// Batch property changes to prevent observer triggers
					var self = this;
					var mainTabId = this.findMainTabForSubTab(tabId);
					Ember.run(function() {
						if (mainTabId) {
							self.set('activeMainTabId', mainTabId);//No I18N
						}
						self.set('activeTabId', tabId); //No I18N
					});
					
					this.hideFrameworkContent();
					return;
				}
			}
		}
	},
	
	findMainTabForSubTab: function(subTabId) {
		var snapConfigData = this.get('snapConfigData');
		if (!snapConfigData || !snapConfigData.tabDefinitions) { return null; }
		
		var tabDefinitions = snapConfigData.tabDefinitions;
		for (var i = 0; i < tabDefinitions.length; i++) {
			var mainTab = tabDefinitions[i];
			
			if (mainTab.subTabs) {
				// Check if this main tab contains the sub-tab
				for (var j = 0; j < mainTab.subTabs.length; j++) {
					if (mainTab.subTabs[j].tabIdentifier === subTabId) {
						return mainTab.tabIdentifier;
					}
				}
			} else if (mainTab.tabIdentifier === subTabId) {
				// This is a direct main tab (no sub-tabs)
				return mainTab.tabIdentifier;
			}
		}
		return null;
	},
	
	initializeActiveTabs: function() {
		var snapConfigData = this.get('snapConfigData');
		if (!snapConfigData || !this.validateTabDefinitions(snapConfigData.tabDefinitions)) {
			return;
		}

		// Set default tabs when not in outlet mode and no active tab is set
		var useOutlet = this.get('useOutlet');
		var activeTabId = this.get('activeTabId');
		
		if (!useOutlet && !activeTabId) {
			this.setDefaultActiveTabs(snapConfigData);
		}
		
		if (snapConfigData.isChildTabsAvailable) {
			$(".deviceSlideContent.snapshotMonitor.deviceSlideDivIn-full").addClass("ndmFwSnapshotMonitor"); //No I18n
			$("#PageContent").addClass("ndmFwMainTabsPresent"); //No I18n
			if(snapConfigData.tabDefinitions && snapConfigData.tabDefinitions.length > 5) {
				$(".ndmSnapTabList").addClass("flexible"); //No I18n
			} else {
				$(".ndmSnapTabList").removeClass("flexible"); //No I18n
			}
		} else {
			$("#PageContent").removeClass("ndmFwMainTabsPresent"); //No I18n
			$(".deviceSlideContent.snapshotMonitor.deviceSlideDivIn-full").removeClass("ndmFwSnapshotMonitor"); //No I18n
		}
	},
	
	// Validate tab definitions exist and have content
	validateTabDefinitions: function(tabDefinitions) {
		return tabDefinitions && tabDefinitions.length > 0;
	},
	
	// Set default active tabs based on configuration
	setDefaultActiveTabs: function(snapConfigData) {
		var tabDefinitions = snapConfigData.tabDefinitions;
		var firstTab = tabDefinitions[0];
		
		// Batch property changes to prevent multiple observer triggers
		this._batchingPropertyChanges = true;
		
		var self = this;
		Ember.run(function() {
			if (snapConfigData.isChildTabsAvailable) {
				self.set('activeMainTabId', firstTab.tabIdentifier); //No I18N
				
				var activeSubTabId = (firstTab.subTabs && firstTab.subTabs.length > 0) 
					? firstTab.subTabs[0].tabIdentifier 
					: firstTab.tabIdentifier;
				self.set('activeTabId', activeSubTabId); //No I18N
			} else {
				self.set('activeTabId', firstTab.tabIdentifier); //No I18N
			}
		});
		
		// Re-enable observer and manually trigger tab change logic once
		this._batchingPropertyChanges = false;
		Ember.run.next(function() {
			self.activeTabChanged();
		});
	},
	
	// Utility methods for tab management - DRY implementation
	findTabDefinition: function(tabId) {
		var tabDefinitions = this.get('tabDefinitions');
		if (!tabDefinitions) { return null; }
		
		return this.searchTabDefinitions(tabDefinitions, tabId);
	},
	
	searchTabDefinitions: function(tabDefinitions, targetTabId) {
		for (var i = 0; i < tabDefinitions.length; i++) {
			var mainTab = tabDefinitions[i];
			
			// Check main tab
			if (mainTab.tabIdentifier === targetTabId) {
				return mainTab;
			}
			
			// Check sub-tabs if they exist
			if (mainTab.subTabs) {
				for (var j = 0; j < mainTab.subTabs.length; j++) {
					var subTab = mainTab.subTabs[j];
					if (subTab.tabIdentifier === targetTabId) {
						return subTab;
					}
				}
			}
		}
		return null;
	},
	
	// Centralized active state management
	updateActiveStates: function(activeTabId, activeMainTabId) {
		// Use current values if not provided
		activeTabId = activeTabId || this.get('activeTabId');
		activeMainTabId = activeMainTabId || this.get('activeMainTabId');
		
		var tabDefinitions = this.get('tabDefinitions');
		if (!tabDefinitions) { return; }
		
		tabDefinitions.forEach(function(mainTab) {
			Ember.set(mainTab, 'isActiveMainTab', mainTab.tabIdentifier === activeMainTabId); //No I18N
			
			if (mainTab.subTabs) {
				mainTab.subTabs.forEach(function(subTab) {
					Ember.set(subTab, 'isActive', subTab.tabIdentifier === activeTabId); //No I18N
				});
			} else {
				Ember.set(mainTab, 'isActive', mainTab.tabIdentifier === activeTabId); //No I18N
			}
		});
	},
	
	// Check and update sub-tabs class based on current active tab
	updateSubTabsClass: function() {
		var activeMainTabId = this.get('activeMainTabId');
		var hasSubTabs = false;
		
		// Check if the current active main tab has sub-tabs
		if (activeMainTabId) {
			var activeMainTab = this.findTabDefinition(activeMainTabId);
			if (activeMainTab && activeMainTab.subTabs && activeMainTab.subTabs.length > 0) {
				hasSubTabs = true;
			}
		}
		
		// Apply or remove the class based on sub-tabs presence
		if (hasSubTabs) {
			$("#PageContent").addClass("ndmFwSubTabsPresent"); //No I18n
		} else {
			$("#PageContent").removeClass("ndmFwSubTabsPresent"); //No I18n
		}
	},
	
	// Batch widget data updates to reduce observer chaos
	loadWidgetDataForActiveTab: function() {
		var activeTabId = this.get('activeTabId');
		if (!activeTabId) { 
			return; 
		}
		
		// Set loading flag to prevent height observer chaos during initial load
		this._isLoadingWidgets = true;
		
		// Skip widget loading if we're in outlet mode (direct sub-route access)
		var useOutlet = this.get('useOutlet');
		if (useOutlet) {
			// Batch property change to prevent observer chaos
			var self = this;
			Ember.run(function() {
				self.set('currentWidgetData', []); //No I18N
				// Clear loading flag immediately - no widgets to load in outlet mode
				self._isLoadingWidgets = false;
			});
			return;
		}
		
		var matchedLayout = this.findLayoutForTab(activeTabId);
		
		if (matchedLayout && matchedLayout.widgetData) {
			var transformedWidgets = this.transformWidgetData(matchedLayout.widgetData);
			
			// Batch property change to prevent observer chaos
			var self = this;
			Ember.run(function() {
				self.set('currentWidgetData', transformedWidgets); //No I18N
				
				// Clear loading flag IMMEDIATELY after widgets are loaded
				// Don't delay this - we want height observer to work as soon as widgets start loading data
				self._isLoadingWidgets = false;
			});
			
			// Schedule grid recalculation once after data is loaded
			this.scheduleGridRecalculation();
		} else {
			// Batch property change to prevent observer chaos
			var self = this;
			Ember.run(function() {
				self.set('currentWidgetData', []); //No I18N
				// Clear loading flag immediately - no widgets to load
				self._isLoadingWidgets = false;
			});
		}
	},
	
	// Helper to find layout definition for a tab
	findLayoutForTab: function(activeTabId) {
		var snapConfigData = this.get('snapConfigData');
		if (!snapConfigData || !snapConfigData.layoutDefinitions) {
			return null;
		}
		
		for (var i = 0; i < snapConfigData.layoutDefinitions.length; i++) {
			var layout = snapConfigData.layoutDefinitions[i];
			if (layout.tabIdentifier === activeTabId) {
				return layout;
			}
		}
		return null;
	},
	
	// Centralized grid recalculation scheduling
	scheduleGridRecalculation: function() {
		// Don't schedule grid recalculation if no widgets exist
		var currentWidgetData = this.get('currentWidgetData');
		if (!currentWidgetData || currentWidgetData.length === 0) {
			return;
		}
		
		// Use unified rate limiter
		var limit = this.RATE_LIMIT_GRID_SCHEDULE;
		if (this.isRateLimited('gridSchedule', limit.maxCalls, limit.windowMs)) {
			return;
		}
		
		var self = this;
		// Simplified: Just use debounce without scheduleOnce wrapper (immediate execution)
		Ember.run.debounce(self, self.recalculateGridPositions, this.DELAY_GRID_RECALC_DEBOUNCE);
	},
	
	/**
	 * Transforms raw widget data from server into grid-ready format
	 * Handles positioning calculations, size conversions, and property mapping
	 * @param {Array} widgetDataArray - Raw widget configurations from API
	 * @returns {Array} Grid-compatible widget objects with calculated positions
	 */
	transformWidgetData: function(widgetDataArray) {
		var transformedWidgets = [];
		
		var sortedWidgets = widgetDataArray.slice().sort(function(a, b) {
			if (a.row !== b.row) {
				return a.row - b.row;
			}
			return a.column - b.column;
		});
		
		for (var i = 0; i < sortedWidgets.length; i++) {
			var widget = sortedWidgets[i];
			var specifiedRow = widget.row || 1;
			var specifiedColumn = widget.column || 1;
			
			// Calculate actual column position based on previous widgets in same row
			var actualColumn = this.calculateColumnPosition(widget, sortedWidgets, i);
			
			// Calculate actual row position based on previous widgets in overlapping columns
			var actualRow = this.calculateRowPosition(widget, transformedWidgets, actualColumn);
			
			var widgetWidth = this.convertWidthToGridSize(widget.width);
			var widgetHeight = this.convertHeightToGridSize(widget.height, widget);
			
			var transformedWidget = Object.assign({}, widget, {
				widgetElementID: 'widget-element-' + widget.widgetId + '-' + i, //No I18N
				contentElementID: 'content-' + widget.widgetId, //No I18N
				indexCount: i,
				colNum: actualColumn,
				rowNum: actualRow,
				sizex: widgetWidth,
				sizey: widgetHeight, // Internal height tracking
				displayHeight: widgetHeight, // Template display height (breaks observer chain)
				widgetIdentifierStr: widget.widgetIdentifierStr,
				gridClassName: 'grid-stack-item', //No I18N
				expandView: false,
				widgetType: widget.widgetType,
				hideHeader: this.shouldHideWidgetHeader(widget.widgetIdentifierStr), // Dynamic header visibility
				apiData: {},
				headerInfo: {},
				snapshotData:{},
				apiurl: "",
				originalRow: specifiedRow,
				originalColumn: specifiedColumn
			});
			transformedWidgets.push(transformedWidget);
		}
		
		return transformedWidgets;
	},
	
	// Utility to determine if a widget should hide its header
	shouldHideWidgetHeader: function(widgetIdentifierStr) {
		var hideHeaderWidgets = [
			'widget-devsummary', // Summary widget should hide header //No I18n
			'widget-recentAlarms'//No I18n
			// Add more widget types here as needed
		];

		// Return true if this widget type should hide header
		return hideHeaderWidgets.indexOf(widgetIdentifierStr) !== -1;
	},
	
	/**
	 * Sequential column positioning within the same logical row
	 * Maintains server-provided row grouping while placing widgets sequentially by column
	 * Respects grid constraints: max column 9, min width 2
	 * @param {Object} currentWidget - Widget being positioned
	 * @param {Array} allWidgets - All widgets sorted by row/column
	 * @param {number} currentIndex - Current widget's index in sorted array
	 * @returns {number} Calculated column position (1-based)
	 */
	calculateColumnPosition: function(currentWidget, allWidgets, currentIndex) {
		var currentRow = currentWidget.row || 1;
		var currentColumn = 1; // Start from column 1 for each row
		
		// Find all widgets in the same logical row that come before this widget
		for (var i = 0; i < currentIndex; i++) {
			var widget = allWidgets[i];
			if (widget.row === currentRow) {
				// Calculate width ensuring minimum width
				var widgetWidth = Math.max(this.convertWidthToGridSize(widget.width), this.GRID_MIN_WIDTH);
				
				// Check if placing this widget would exceed grid limits
				if (currentColumn + widgetWidth > this.GRID_MAX_POSITION) {
					// Cannot fit in current row, will need to wrap to next row
					break;
				}
				
				// Move to next available column after this widget
				currentColumn += widgetWidth;
			}
		}
		
		// Ensure the current widget respects grid width constraints
		var currentWidgetWidth = Math.max(this.convertWidthToGridSize(currentWidget.width), this.GRID_MIN_WIDTH);
		if (currentColumn + currentWidgetWidth > this.GRID_MAX_POSITION) {
			// Widget exceeds grid width, wrap to next row starting at column 1
			currentColumn = 1;
		}
		
		return currentColumn;
	},
	
	/**
	 * Row position calculation preserving server-provided row grouping
	 * Widgets from same logical row stay together, only move down due to height overlaps
	 * @param {Object} currentWidget - Widget being positioned  
	 * @param {Array} transformedWidgets - Previously positioned widgets
	 * @param {number} actualColumn - Widget's calculated column position
	 * @returns {number} Safe row position that avoids overlaps
	 */
	calculateRowPosition: function(currentWidget, transformedWidgets, actualColumn) {
		var specifiedRow = currentWidget.row || 1;
		var widgetWidth = Math.max(this.convertWidthToGridSize(currentWidget.width), this.GRID_MIN_WIDTH);
		var currentColumnEnd = actualColumn + widgetWidth - 1;
		
		// Start with the server-provided row number
		var targetRow = specifiedRow;
		
		// Special case: If actualColumn is 1 and we have other widgets from same logical row,
		// it means this widget couldn't fit horizontally and needs to move to next available row
		if (actualColumn === 1) {
			var sameRowWidgets = [];
			for (var j = 0; j < transformedWidgets.length; j++) {
				var widget = transformedWidgets[j];
				if (widget.originalRow === specifiedRow) {
					sameRowWidgets.push(widget);
				}
			}
			
			if (sameRowWidgets.length > 0) {
				// Find the maximum row end of widgets from the same logical row
				var maxRowEnd = 0;
				for (var k = 0; k < sameRowWidgets.length; k++) {
					var rowEnd = sameRowWidgets[k].rowNum + sameRowWidgets[k].sizey - 1;
					maxRowEnd = Math.max(maxRowEnd, rowEnd);
				}
				targetRow = maxRowEnd + 1;
			}
		}
		
		// Check for height-based overlaps with existing widgets
		for (var i = 0; i < transformedWidgets.length; i++) {
			var existingWidget = transformedWidgets[i];
			var existingColumnStart = existingWidget.colNum;
			var existingColumnEnd = existingWidget.colNum + existingWidget.sizex - 1;
			
			// Check if there's a column overlap
			var hasColumnOverlap = !(currentColumnEnd < existingColumnStart || actualColumn > existingColumnEnd);
			
			if (hasColumnOverlap) {
				var existingRowEnd = existingWidget.rowNum + existingWidget.sizey - 1;
				
				// Only move down if there's actual height overlap, preserve same-row grouping
				if (targetRow <= existingRowEnd) {
					targetRow = existingRowEnd + 1;
				}
			}
		}
		
		return targetRow;
	},
	
	convertWidthToGridSize: function(width) {
		if (!width) { 
			return Math.max(5, this.GRID_MIN_WIDTH); // Default width with minimum constraint
		}
		
		if (typeof width === 'string' && width.indexOf('%') !== -1) {
			var percentage = parseInt(width.replace('%', ''));
			var gridSize = Math.floor((percentage / 100) * this.GRID_MAX_WIDTH); // Use max width for calculation
			return Math.max(gridSize, this.GRID_MIN_WIDTH); // Apply minimum width constraint
		}
		
		return Math.max(5, this.GRID_MIN_WIDTH); // Default with minimum constraint
	},
	
	convertHeightToGridSize: function(height, widget) {
		// If a specific height is provided, use it
		if (height && height > 0) {
			return height;
		}
		// Initial height assumptions for specific widget types
		if (widget && widget.widgetIdentifierStr) {
			switch (widget.widgetIdentifierStr) {
				case 'widget-devsummary': //No I18N
					return 16; // Summary widget initial height
				default:
					return 8; // Default height for unknown widgets
			}
		}
		
		// Fallback to default height
		return 8;
	},
	
	/**
	 * Central tab change handler with multiple layers of protection
	 * Guards against observer loops, duplicate processing, and navigation conflicts
	 */
	activeTabChanged: function() {
		// Layer 1: Rate limiting guards against excessive rapid calls
		var limit = this.RATE_LIMIT_TAB_CHANGE;
		if (this.isRateLimited('activeTabChanged', limit.maxCalls, limit.windowMs)) {
			return;
		}
		
		// Layer 2: Skip execution during batch property updates
		if (this._batchingPropertyChanges) {
			return;
		}
		
		var self = this;
		var activeTabId = this.get('activeTabId');
		var activeMainTabId = this.get('activeMainTabId');
		
		if (!activeTabId) { 
			return; 
		}
		
		// Only execute the logic once per unique tab combination
		var currentTabKey = activeTabId + '|' + activeMainTabId;
		if (this._lastProcessedTabKey === currentTabKey) {
			return;
		}
		this._lastProcessedTabKey = currentTabKey;
		
		// Cancel any pending debounced calls to prevent double execution
		Ember.run.cancel(this._activeTabDebounce);
		
		this._activeTabDebounce = Ember.run.debounce(this, function() {
			self.updateActiveStates(activeTabId, activeMainTabId);
			self.updateSubTabsClass();
			self.loadWidgetDataForActiveTab();
			self.handleTabSwitch(activeTabId);
		}, this.DELAY_TAB_CHANGE_DEBOUNCE);
	}.observes('activeTabId', 'activeMainTabId'), //No I18N
	
	/**
	 * Batch height change collector - prevents immediate DOM updates
	 * Collects all sizey changes and batches them into displayHeight updates
	 */
	batchHeightUpdates: function() {
		// Skip during initial widget loading phase
		if (this._isLoadingWidgets) {
			return;
		}
		
		// No widgets = no height changes possible
		var currentWidgetData = this.get('currentWidgetData');
		if (!currentWidgetData || currentWidgetData.length === 0) {
			return;
		}
		
		var self = this;
		
		// Use debounced batch update. The logic will be inside the debounce.
		Ember.run.cancel(this._batchHeightDebounce);
		
		this._batchHeightDebounce = Ember.run.debounce(this, function() {
			// Get the most current widget data right before applying changes
			var currentWidgetData = self.get('currentWidgetData');
			if (!currentWidgetData || currentWidgetData.length === 0) {
				return;
			}

			// Collect the FINAL height changes after the 250ms wait
			var heightChanges = [];
			currentWidgetData.forEach(function(widget) {
				if (widget.sizey !== widget.displayHeight) {
					heightChanges.push({
						widget: widget,
						newHeight: widget.sizey
					});
				}
			});

			// Apply the fresh set of height changes
			if (heightChanges.length > 0) {
				self.applyBatchedHeightChanges(heightChanges);
			}
		}, this.DELAY_HEIGHT_BATCH_DEBOUNCE);
	}.observes('currentWidgetData.@each.sizey'), //No I18N
	
	/**
	 * Apply all collected height changes at once
	 * Updates displayHeight property AND DOM attribute, then triggers single grid recalculation
	 */
	applyBatchedHeightChanges: function(heightChanges) {
		if (!heightChanges || heightChanges.length === 0) {
			return;
		}
		
		var self = this;
		
		// Batch all displayHeight updates in a single run loop
		Ember.run(function() {
			heightChanges.forEach(function(change) {
				// Safety: Check widget still exists
				if (!change.widget || !change.widget.widgetElementID) {
					return;
				}
				
				// Update the displayHeight property
				Ember.set(change.widget, 'displayHeight', change.newHeight); //No I18n
			});
		});
		
		// Immediate grid recalculation (no need for run.next delay)
		self.scheduleGridRecalculation();
	},
	
	// Utility methods for outlet support - consolidated route management
	shouldTabUseOutlet: function(tabDefinition) {
		if (!tabDefinition) { return false; }
		var tabRouteConfig = this.get('tabRouteConfig');
		return !!(tabRouteConfig && tabRouteConfig[tabDefinition.tabIdentifier]);
	},
	
	getOutletName: function(tabDefinition) {
		return this.getRouteProperty(tabDefinition, 'outletName') ||  //No I18N
			   tabDefinition.tabIdentifier.replace('tab-', '') + 'Outlet'; //No I18N
	},
	
	getRouteName: function(tabDefinition) {
		return this.getRouteProperty(tabDefinition, 'routeName') ||  //No I18N
			   tabDefinition.tabIdentifier.replace('tab-', ''); //No I18N
	},
	
	// Helper to get route properties with fallback
	getRouteProperty: function(tabDefinition, propertyName) {
		if (!tabDefinition) { return null; }
		
		var tabRouteConfig = this.get('tabRouteConfig');
		var routeConfig = tabRouteConfig && tabRouteConfig[tabDefinition.tabIdentifier];
		
		return routeConfig && routeConfig[propertyName];
	},
	
	// Centralized navigation utility
	navigateToRoute: function(routeName) {
		if (typeof opm_transitionToTheRoute === 'function') {
			opm_transitionToTheRoute(routeName);
		} else {
			var router = this.get('router') || (this.container && this.container.lookup('router:main')); //No I18N
			if (router && router.transitionTo) {
				router.transitionTo(routeName);
			}
		}
	},
	
	// Centralized content visibility management
	toggleFrameworkContent: function(show) {
		var $element = $(this.element);
		if ($element.length) {
			var $content = $element.find('.device-snapshot-content');
			if ($content.length) {
				show ? $content.show() : $content.hide();
			}
		}
	},
	
	hideFrameworkContent: function() {
		this.toggleFrameworkContent(false);
	},

	showFrameworkContent: function() {
		this.toggleFrameworkContent(true);
	},
	
	/**
	 * Tab switch handler manages outlet-based vs widget-based rendering
	 * Coordinates navigation, content visibility, and data loading based on tab type
	 */
	handleTabSwitch: function(activeTabId) {
		// Skip redundant processing if already handling this tab
		if (this._currentlyProcessingTab === activeTabId) {
			return;
		}
		
		// Clear any previous processing flag and set current
		this._currentlyProcessingTab = activeTabId;
		
		var self = this;
		Ember.run.next(function() {
			// Clear the processing flag after this run loop
			self._currentlyProcessingTab = null;
		});
		
		var tabDefinition = this.findTabDefinition(activeTabId);
		var shouldUseOutlet = this.shouldTabUseOutlet(tabDefinition);
		
		if (shouldUseOutlet) {
			// Set outlet properties
			this.set('useOutlet', true); //No I18N
			this.set('outletName', this.getOutletName(tabDefinition)); //No I18N
			this.set('routeName', this.getRouteName(tabDefinition)); //No I18N
			this.set('currentWidgetData', []); //No I18N
			
			// Navigate to the route if specified
			var routeName = this.get('routeName');
			if (routeName) {
				this.navigateToRoute(routeName);
			}
			
			// Hide the framework content since route will render in main outlet
			this.hideFrameworkContent();
		} else {
			// Check if we're switching from a route-based tab to a widget-based tab
			var wasUsingOutlet = this.get('useOutlet');
			
			// Reset outlet properties first
			this.set('useOutlet', false); //No I18N
			this.set('outletName', null); //No I18N
			this.set('routeName', null); //No I18N
			
			// When switching from route-based to widget-based tab, navigate back to clear sub-route
			if (wasUsingOutlet) {
				var originalRoute = this.get('originalSnapshotRoute');
				this.navigateToRoute(originalRoute);
				
				// Show content and ensure widget data loads for route-to-widget transition
				this.showFrameworkContent();
				
				// Force widget data loading after outlet state is reset to prevent empty tab
				var self = this;
				Ember.run.next(function() {
					self.loadWidgetDataForActiveTab();
				});
			} else {
				// Show the framework content immediately if not coming from route
				this.showFrameworkContent();
			}
		}
	},
	
	actions: {
		selectMainTab: function(mainTab) {
			var newActiveTabId;
			if (mainTab.subTabs && mainTab.subTabs.length > 0) {
				newActiveTabId = mainTab.subTabs[0].tabIdentifier;
			} else {
				newActiveTabId = mainTab.tabIdentifier;
			}
			
			// Batch property changes to avoid triggering observers multiple times
			this._batchingPropertyChanges = true;
			
			// Batch property changes to prevent multiple observer triggers
			var self = this;
			Ember.run(function() {
				self.set('activeMainTabId', mainTab.tabIdentifier); //No I18N
				self.set('activeTabId', newActiveTabId); //No I18N
			});
			
			// Re-enable observer and manually trigger tab change logic once
			this._batchingPropertyChanges = false;
			Ember.run.next(function() {
				self.activeTabChanged();
			});
			
			this.sendAction('onMainTabChange', mainTab.tabIdentifier);
		},

		changeSnapTab: function(subTabId) {
			this.set('activeTabId', subTabId); //No I18N
			this.sendAction('onSubTabChange', subTabId);
		}
	},
	
	// Grid position recalculation
	recalculateGridPositions: function() {
		var currentWidgetData = this.get('currentWidgetData');
		if (!currentWidgetData || currentWidgetData.length === 0) {
			return;
		}
		
		// Use unified rate limiter
		var limit = this.RATE_LIMIT_GRID_RECALC;
		if (this.isRateLimited('gridRecalc', limit.maxCalls, limit.windowMs)) {
			return;
		}
		
		var sortedWidgets = currentWidgetData.slice().sort(function(a, b) {
			if (a.originalRow !== b.originalRow) {
				return a.originalRow - b.originalRow;
			}
			return a.originalColumn - b.originalColumn;
		});
		
		var recalculatedWidgets = [];
		
		// Batch property changes to prevent observer triggers
		Ember.run(function() {
			for (var i = 0; i < sortedWidgets.length; i++) {
				var widget = sortedWidgets[i];
				
				// Calculate new row position based on current heights to prevent overlaps
				var newRow = this.calculateRowPositionForWidget(widget, recalculatedWidgets);
				if (newRow !== widget.rowNum) {
					Ember.set(widget, 'rowNum', newRow); //NO I18n
				}
				
				recalculatedWidgets.push(widget);
			}
		}.bind(this));
	},
	
	calculateRowPositionForWidget: function(widget, previousWidgets) {
		var specifiedRow = widget.originalRow;
		var widgetColumn = widget.colNum;
		var widgetWidth = widget.sizex;
		var currentColumnEnd = widgetColumn + widgetWidth - 1;
		
		var maxRowNeeded = specifiedRow;
		
		for (var i = 0; i < previousWidgets.length; i++) {
			var existingWidget = previousWidgets[i];
			var existingColumnStart = existingWidget.colNum;
			var existingColumnEnd = existingWidget.colNum + existingWidget.sizex - 1;
			var existingRowEnd = existingWidget.rowNum + existingWidget.sizey - 1;
			
			var hasColumnOverlap = !(currentColumnEnd < existingColumnStart || widgetColumn > existingColumnEnd);
			
			if (hasColumnOverlap) {
				var neededRow = existingRowEnd + 1;
				maxRowNeeded = Math.max(maxRowNeeded, neededRow);
			}
		}
		
		return maxRowNeeded;
	}
});

// Header component: Renders main tabs and sub-tabs based on configuration
OPMClient.DeviceSnapshotHeaderComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-header", //No I18N
	classNames: ['device-snapshot-header'], //No I18N
	tabDefinitions: null,
	isChildTabsAvailable: false,
	activeMainTabId: null,
	activeTabId: null,
	snapConfigData: null,
	selectMainTab: null,
	changeSnapTab: null,
	
	currentActiveMainTab: function() {
		var activeMainTabId = this.get('activeMainTabId');
		var snapConfigData = this.get('snapConfigData');
		
		if (!activeMainTabId || !snapConfigData || !snapConfigData.tabDefinitions) {
			return null;
		}
		
		for (var i = 0; i < snapConfigData.tabDefinitions.length; i++) {
			if (snapConfigData.tabDefinitions[i].tabIdentifier === activeMainTabId) {
				return snapConfigData.tabDefinitions[i];
			}
		}
		return null;
	}.property('activeMainTabId', 'snapConfigData'), //No I18N
	
	actions: {
		selectMainTab: function(mainTab) {
			this.sendAction('selectMainTab', mainTab);
		},
		
		changeSnapTab: function(subTabId) {
			this.sendAction('changeSnapTab', subTabId);
		}
	}
});

// Content area: Renders widget grid or outlet-based routes
OPMClient.DeviceSnapshotContentComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-content", //No I18N
	classNames: ['device-snapshot-content'], //No I18N
	currentWidgetData: null,
	useOutlet: false,
	outletName: null,
	
	actions: {
		handleWidgetAction: function(action, widgetData) {
			this.sendAction('onWidgetAction', action, widgetData);
		}
	}
});

// Widget container: Manages collection of individual widgets with grid layout
OPMClient.DeviceSnapshotWidgetListComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-widget-list", //No I18N
	classNames: ['device-snapshot-widget-list'], //No I18N
	currentWidgetData: null,
	snapshotObj: null,
	didInsertElement: function() {
		moreActions();
		browseActions();
		opm_tooltip();
		handleMessageFramework(this);
	},
	actions: {
		handleWidgetAction: function(action, widgetData) {
			this.sendAction('onWidgetAction', action, widgetData);
		}
	}
});

/**
 * Individual Widget Component
 * Handles single widget rendering, API data loading, and user interactions
 * Supports expand/collapse, reload, search, and custom child component rendering
 */
OPMClient.DeviceSnapshotWidgetComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-widget", //No I18N
	classNames: ['overflowHidden'], //No I18N
	additionalProps: null,
	snapIndex: null,
	userPermissions: null,
	widgetSpinnerID: null,
	
	init: function() {
		this._super();
		// Set elementId to widgetIdentifierStr during initialization
		var widgetData = this.get('widgetData');
		if (widgetData && widgetData.widgetIdentifierStr) {
			this.set('elementId', widgetData.widgetIdentifierStr);//No I18N
		}
	},
	
	didInsertElement: function() {
		this.loadWidgetApiData();
	},
	
	/**
	 * Cleanup when widget component is destroyed
	 * Prevents memory leaks from loading flags
	 */
	willDestroyElement: function() {
		// Clear loading flag to prevent memory leaks
		this._isLoadingApiData = false;
	},
	
	/**
	 * Widget API data loader with duplicate call protection
	 * Fetches widget-specific data from server and handles empty/error responses
	 */
	loadWidgetApiData: function() {
		// Guard against simultaneous API calls for the same widget
		if (this._isLoadingApiData) {
			return;
		}
		
		var self = this;
		var currentWidgetData = this.get('widgetData');
		var snapshotObj = this.get('snapshotObj');
		var moId = snapshotObj ? snapshotObj.moID : null;
		var widgetId = currentWidgetData.widgetId || currentWidgetData.id;
		
		if (!moId || !widgetId) {
			return;
		}
		
		// Set loading flag to prevent duplicate calls
		this._isLoadingApiData = true;
		
		var apiUrl = window.OPM.apiUrlPattern + "/snapconfig/getSnapWidgetData?moId=" + moId + "&widgetId=" + widgetId; //No I18N
		if(this.widgetData && this.widgetData.eeProbeIdNeeded && this.snapshotObj && this.snapshotObj.probeID) {
			apiUrl = eeClientReqToProbe(apiUrl, this.snapshotObj.probeID);
		}
		opm_ajaxGetResponseWithMsg(apiUrl,'','', function(apiData) {
			apiData = apiData || {};
			// Set no-data flag for empty responses to prevent blank widgets
			var isNodata = (typeof apiData === 'object' && !apiData.error && Object.keys(apiData).length === 0);//No I18N
			if (currentWidgetData.widgetType === 'KeyValue' && isNodata) {
				apiData = {noData: true};
			}
			//Add the widget Identifier here incase if separate no data handling done in component
			var noDataExceptions = ['widget-customFields'];//No I18N
			if(currentWidgetData.widgetType === 'Grid' && !noDataExceptions.includes(currentWidgetData.widgetIdentifierStr) && (isNodata || (apiData.rowData && apiData.rowData.length === 0))) {
				apiData = {noData: true};
			}
			
			self.set('widgetData.apiData', apiData); //No I18N
			self.set("dataReceived", true);//No I18n
			// Clear loading flag after completion
			self._isLoadingApiData = false;
		})
	},
	
	childComponentName: function() {
		// Check if widget has API error first
		var widgetData = this.get('widgetData');
		if (widgetData && widgetData.apiData && (widgetData.apiData.error || widgetData.apiData.noData)) {
			return 'OPMClient.DeviceSnapshotWidgetErrorComponent'; //No I18N
		}
		
		var widgetType = (widgetData && (widgetData.widgetType || widgetData.type)) || 'DashNoData'; //No I18N
		return 'OPMClient.Opm' + widgetType + 'Component'; //No I18N
	}.property('widgetData.widgetType', 'widgetData.type', 'widgetData.apiData.error'), //No I18N
	
	hasValidComponent: function() {
		var widgetData = this.get('widgetData');
		
		// Error component is always valid
		if (widgetData && widgetData.apiData && (widgetData.apiData.error || widgetData.apiData.noData)) {
			return true;
		}
		
		var widgetType = (widgetData && (widgetData.widgetType || widgetData.type)) || 'DashNoData'; //No I18N
		var componentName = 'Opm' + widgetType + 'Component'; //No I18N
		return OPMClient[componentName] !== undefined;
	}.property('widgetData.widgetType', 'widgetData.type', 'widgetData.apiData.error'), //No I18N

	actions: {
		reloadWidget: function() {
			// Set loading state and reload immediately using run loop
			this.set('dataReceived', false);//No I18N
			
			var self = this;
			Ember.run.next(function() {
				self.loadWidgetApiData();
			});
		},
		expandWidget: function() {
			var $element = $(this.element);
			var $gridStackItem = $element.closest('.grid-stack-item'); //No I18n
			
			if ($gridStackItem.length === 0) {
				return;
			}
			
			var expandClasses = 'dashboardWidgetExpandView expandViewGraphTable';//No I18N
			var isExpanded = $gridStackItem.hasClass('dashboardWidgetExpandView'); //No I18N

			if (isExpanded) {
				$gridStackItem.removeClass(expandClasses);
				this.set('widgetData.expandView', false); //No I18n
				this.set("isExpanded", false); //No I18n
			} else {
				$gridStackItem.addClass(expandClasses);
				this.set('widgetData.expandView', true); //No I18N
				this.set("isExpanded", true); //No I18n
			}
			var self = this;
			Ember.run.scheduleOnce('afterRender', function() { //No I18N
				self.send('reloadWidget');//No I18N
			});
		},
		searchTable: function() {
			searchDevInterface(this.get("widgetData").widgetId,this.get("widgetData"));
		},
		navigateToRoute: function(routeName) {
			opm_transitionToTheRoute(routeName);
		},
		childActions: function(functionType) {
			if (functionType === 'reload') { //No I18n
				this.send('reloadWidget'); //No I18n
			} else if (functionType === 'expand') { //No I18n
				this.send('expandWidget'); //No I18n
			}
		}
	}
});

// Main tabs navigation: Renders primary tab buttons with icons and counts  
OPMClient.DeviceSnapshotMainTabsComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-main-tabs", //No I18N
	classNames: ['mainTabs wlcTabUl NutanixSnapshot'],
	tabDefinitions: null,
	selectMainTab: null,
	
	actions: {
		selectMainTab: function(mainTab) {
			this.sendAction('selectMainTab', mainTab);
		}
	}
});

// Sub-tabs navigation: Secondary tab list shown below main tabs
OPMClient.DeviceSnapshotSubTabsComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-sub-tabs", //No I18N
	classNames: ['device-snapshot-sub-tabs'], //No I18N
	tabDefinitions: null,
	changeSnapTab: null,
	
	actions: {
		changeSnapTab: function(subTabId) {
			this.sendAction('changeSnapTab', subTabId);
		}
	}
});

// Key-Value widget: Dynamic height adjustment based on data rows
OPMClient.OpmKeyValueComponent = Ember.Component.extend({
	templateName: "components/opm-key-value-component", //NO I18N
	didInsertElement: function() {
		var colData = this.get('widgetData.apiData') || [];
		var colDataLength = colData.length;
		var heightThreshold = colDataLength > 10 ? 16 : colDataLength + 5;
		
		this.set('widgetData.sizey', heightThreshold); //No I18N
		
		var self = this;
		var widgetElementID = self.widgetData.widgetElementID;
		var adjustedHeight = snapHeightCalculation[heightThreshold] - 70;//To compensate for header and padding
		
		Ember.run.schedule("afterRender", function() {//No I18N
			$('#' + widgetElementID + ' .DIGmCustomScroll > div').mCustomScrollbar({
				axis: 'y',//No I18N
				scrollButtons: { enable: true },
				theme: 'light-thick',//No I18N
				setHeight: adjustedHeight,
				scrollbarPosition: 'outside',//No I18N
				advanced: {
					updateOnContentResize: false,
					updateOnImageLoad: false
				}
			});
		});
	},

	actions: {
        redirectToParentDevice: function(deviceName) {
            location.href = window.OPM.apiclientUrl + "Inventory/Snapshot/MonitoringDevice/" + deviceName; //No I18N
        }
	}
});

/**
 * Widget Error Component
 * Displays error messages and provides retry functionality for failed widgets
 */
OPMClient.DeviceSnapshotWidgetErrorComponent = Ember.Component.extend({
	templateName: "components/device-snapshot-widget-error", //No I18N
	classNames: ['widget-error-container'], //No I18N
	
	actions: {
		reloadWidget: function() {
			// Send reload action to parent widget component
			this.sendAction('action', 'reload');
		}
	}
});

/**
 * Global utility function: External widget reload trigger
 * Allows other parts of the application to reload specific widgets by identifier
 * @param {string} widgetIdentifier - Unique widget identifier to reload
 * @returns {boolean} true if widget found and reload triggered, false otherwise
 */
function reloadNdmSnapFwWidget(widgetIdentifier) {
    var widget = Ember.View.views[widgetIdentifier];
    if (widget && typeof widget.send === 'function') {
        widget.send('reloadWidget');//No I18N
        return true;
    }
    return false;
}