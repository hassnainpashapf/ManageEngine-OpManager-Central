OPMClient.DeviceMultiselectComponent = Ember.Component.extend(
{
  
  devices: [],
  visibleDevices: [],
  page: 1,
  filters:
  {},
  filterBy:null,
  searchTerm: '',
  tagName: '',
  isSearching: false,
  itemHeight: 30,
  bufferSize: 5,
  viewportHeight: 500,
  isFetching: false,
  noMoreData: false,
  selectedCount: 0,
  selectedDevices: [],
  selectedDevicesMap:
  {},
  startIndex: 0,
  debug: true,
  
  filterByObserver: Ember.observer('filterSelectByCustomerValue', function() {//NO I18N
    this.devices = [];
    this.visibleDevices = [];
    this.set('selectedDevicesMap',{})//NO I18N
    this.set('selectedDevices', []); //NO I18N
    this.set('selectedCount', 0); //NO I18N
    this.fetchDevices(true);
  }),
  totalHeight: function()
  {
    var estimatedTotal = this.get('noMoreData') ?
      this.get('devices.length') :
      this.get('devices.length') + 20;
    var height = estimatedTotal * this.get('itemHeight');
    return height;
  }.property('devices.length', 'itemHeight', 'noMoreData'), //NO I18N
  totalScrollStyle: function()
  {
    return 'height: ' + this.get('totalHeight') + 'px; position: relative;'; //NO I18N
  }.property('totalHeight'), //NO I18N
  visibleItemCount: function()
  {
    var count = Math.ceil(this.get('viewportHeight') / this.get('itemHeight')) + (this.get('bufferSize') * 2);
    return count;
  }.property('viewportHeight', 'itemHeight', 'bufferSize'), //NO I18N
  calculateVisibleDevices: function()
  {
    var devices = this.get('devices');
    var startIndex = this.get('startIndex');
    var visibleCount = this.get('visibleItemCount');
    var start = Math.max(0, startIndex - this.get('bufferSize'));
    var self = this
    var selectedDevices = [];
    var selectedMap = this.get('selectedDevicesMap') || [];
    var selectedCount = Array.isArray(selectedMap) ? selectedMap.length : Object.keys(selectedMap).length;
    var end = Math.min(devices.length, startIndex + visibleCount+ this.get('bufferSize'));
    var selectedCount = Array.isArray(selectedMap) ? selectedMap.length : Object.keys(selectedMap).length;
    start = Math.max(0, Math.min(start, start - selectedCount));
    end = Math.min(devices.length, Math.max(end, end + selectedCount));

    var visibleSlice = devices.slice(start, end).map(function(device, index)
    {
      return device;
    }, this);
    visibleSlice.sort(function(a, b) {
      if (a.selected === b.selected) {
          return 0;
      } else if (a.selected) {
          return -1;
      } else {
          return 1;
      }
  });

    for (var key in selectedMap)
    {
      if (selectedMap.hasOwnProperty(key))
      {
        var device = selectedMap[key];
        var isVisible = visibleSlice.some(function(visibleDevice)
        {
            if(visibleDevice.id == device.moid){
              visibleDevice.selected = true;
              for (var i = 0; i < visibleSlice.length; i++) {
                if (visibleSlice[i].id == visibleDevice.id) {
                    selectedElementindex = i;
                    break;
                }
              }
              if (selectedElementindex != -1) {
                var object = visibleSlice.splice(selectedElementindex, 1)[0]; 
                visibleSlice.unshift(object);                
              }
            }
          return visibleDevice.id == device.moid;
        });
        if (!isVisible)
        {
          selectedDevices.push(device);
        }
      }
    }

    function applyItemStyle(devices, offset)
    {
      devices.forEach(function(device, index)
      {
        device.itemStyle = 'position: absolute; top: ' + ((start + index + offset) * self.get('itemHeight')) + 'px; width: 100%;'; //NO I18N
      });
    }
    if (!self.get('isSearching'))
    {
      applyItemStyle(selectedDevices, 0);
      applyItemStyle(visibleSlice, selectedDevices.length);
    }
    else
    {
      applyItemStyle(visibleSlice, 0);
      selectedDevices = [];
      //applyItemStyle(selectedDevices, visibleSlice.length);
    }
    var result = selectedDevices.concat(visibleSlice);
    return result;
  },
  updateVisibleDevices: function()
  {
    if (!this.get('isSearching')) {
      this.set('visibleDevices', this.calculateVisibleDevices()); //NO I18N
    } 
  }.observes('devices.@each', 'startIndex', 'selectedDevicesMap'), //NO I18N
  fetchDevices: function(groupChanged)
  {
    var self = this;
    
    if (this.get('isFetching') || this.get('noMoreData') && !groupChanged)
    {
      return;
    }
    
    this.set('isFetching', true); //NO I18N
    var url = window.OPM.apiUrlPattern + '/device/listDevices'; //NO I18N
    var params = {
      isMapView: false,
      _search: this.get('isSearching'),
      nd: new Date().getTime(),
      rows: 9999,
      page: this.get('page'),
      sortByColumn: 'addedTime', //NO I18N
      sortByType: 'desc', //NO I18N
      filters: JSON.stringify(this.get('filters'))
    };
    var filterValue = this.get('filterSelectByCustomerValue');
    if(filterValue != "-1")
    {
      var filterBy = this.get('filterBy');
      if (filterBy == 'group')
      {
        filterBy = 'groupName'; //NO I18N
      }
      else if(filterBy == 'businessview')
      {
        filterBy = 'bvName'; //NO I18N
      }
      else if(filterBy == 'apps'){
        filterBy = 'app'; //No I18N
      }
      params[filterBy] = filterValue;
    }
    if(OPMClient.ApplicationController.isEECentralSelected)
      {
        if(this.get('selectedProbeID') !== -1)
        {
          params.eeProbeID = this.get('selectedProbeID'); //NO I18N
        }
      }
      if(OPMClient.ApplicationController.isMSPCentralSelected)
      {
        var $div = $('#filterSelectByCustomerValue');
        var selCustomerID = $div.attr('selcustomerid') || '-1'; //NO I18N
        var selRegionID = $div.attr('selregionid') || '-1'; //NO I18N
        url = url + "?selCustomerID="+selCustomerID //NO I18N
        url = url + "&regionID="+ selRegionID //NO I18N
      }
    $.ajax(
    {
      url: url,
      data: params,
      dataType: 'json', //NO I18N
      success: function(response)
      {
        response= response.length > 0 ? response:[];
        if (response && Array.isArray(response))
        {
          if (response.length === 0 && !self.get('isSearching'))
          {
            self.set('noMoreData', true); //NO I18N
          }
          else
          {
            var existingDevices = self.get('devices');
            var newDevices = response.filter(function(device)
            {
              return !existingDevices.some(function(existingDevice)
              {
                return existingDevice.moid === device.moid;
              });
            });
            if (self.get('isSearching')) {
              self.set('visibleDevices', response); //NO I18N
              self.set('devices', response); //NO I18N
              $("#IWDeviceList").scrollTop(0);
          
              var data = self.get('selectedDevicesMap');
              for (var key in data) {
                  if (data.hasOwnProperty(key)) {
                      response.forEach(function(device) {
                          if (key == device.moid) {
                              device.selected = true;
                          }
                      });
                  }
              }
          }
          
            else
            {
              self.set('devices', existingDevices.concat(newDevices)); //NO I18N
            }
            if (response.length < params.rows)
            {
              self.set('noMoreData', true); //NO I18N
            }
          }
        }
        else
        {
          self.set('noMoreData', true); //NO I18N
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {},
      complete: function()
      {
        self.set('isFetching', false); //NO I18N
      }
    });
  },
  didInsertElement: function()
  {
    this._super();
    var self = this;
    this.setProperties(
    {
      isSearching: false,
      filters:
      {},
      devices: [],
      visibleDevices: [],
      page: 1,
      selectedDevices: [],
      selectedDevicesMap:
      {},
      selectedCount: 0,
      noMoreData: false,
      startIndex: 0,
      isInitialized: true
    });
    Ember.run.schedule("afterRender", function()//No I18n
    { 
      setTimeout(function()
      {
        EditGraphicalWidget.populateDeviceList(self);
      }
      , 100);
    });
    this.fetchDevices();
    
    var scrollHandler = function()
    {
      Ember.run.debounce(self, function()
      {
        var $list = self.$('#IWDeviceList');
        if (!$list.length)
        {
          return;
        }
        var scrollTop = $list.scrollTop();
        var newStartIndex = Math.floor(scrollTop / self.get('itemHeight'));
        if (newStartIndex !== self.get('startIndex'))
        {
          self.set('startIndex', newStartIndex); //NO I18N
        }
        var listHeight = $list.height();
        var scrollHeight = $list[0].scrollHeight;
        var scrollBottom = scrollTop + listHeight;
        var remainingScroll = scrollHeight - scrollBottom;
        var searchTerm = self.get('searchTerm');
        this.set('isSearching' , searchTerm.length !=0 )//NO I18N
        if (!self.get('noMoreData') && !self.get('isFetching'))
        {
          self.incrementProperty('page'); //NO I18N
          self.fetchDevices();
        }
      }, 50);
    };
    this.$('#IWDeviceList').on('scroll', scrollHandler);
    this.$('#searchDevice').on('input', function(event)
    {
      var searchValue = event.target.value.trim();
      self.set('searchTerm', searchValue); //NO I18N
      if (searchValue)
      {
        self.setProperties(
        {
          isSearching: true,
          page: 1,
          noMoreData: false
        });
        Ember.run.debounce(self, self.searchDevices, 300);
      }
      else
      {
        self.setProperties(
        {
          isSearching: false,
          filters:
          {},
          page: 1,
          noMoreData: false
        });
        self.set('devices', []); //NO I18N
        self.fetchDevices();
      }
    });
    setupCredentialBoxEvents(this, 'IWDeviceListDiv', 'visibleDevices', 'IWDeviceList'); //NO I18N
  },
  willDestroyElement: function()
  {
    this._super();
    this.$('#IWDeviceList').off('scroll');
    this.$('#searchDevice').off('input');
    $(document).off('#IWDeviceListDiv .credentialBox');
    this.setProperties(
    {
      isSearching: false,
      filters:
      {},
      devices: [],
      visibleDevices: [],
      page: 1,
      selectedDevices: [],
      selectedDevicesMap:
      {},
      selectedCount: 0,
      isInitialized: true
    });
  },
  searchDevices: function()
  {
    if (this.get('isSearching'))
    {
      this.setProperties(
      {
        filters:
        {
          groupOp: 'AND', //NO I18N
          rules: [
          {
            field: 'displayName', //NO I18N
            op: 'cn', //NO I18N
            data: this.get('searchTerm')
          }]
        },
        page: 1
      });
      this.fetchDevices();
    }
  },
  updateSelectedDevices: function () {
    var selectedDevices = Object.values(this.selectedDevicesMap);
    var selectedMap = this.get('selectedDevicesMap');
    this.set('selectedDevices', selectedDevices); //NO I18N
    this.set('selectedCount', selectedDevices.length); //NO I18N
},
  actions:
  {
    toggleDeviceSelection: function(device)
    {
      var selectedMap = this.get('selectedDevicesMap');
      var newState = !device.selected;
      Ember.set(device, 'selected', newState); //NO I18N
      if (newState)
      {
        selectedMap[device.moid] = device;
      }
      else
      {
        delete selectedMap[device.moid];
      }
      this.updateSelectedDevices();
      this.sendAction('onDeviceSelectionChanged', Object.values(this.selectedDevicesMap));
    }
  }
});
OPMClient.InterfaceMonitorsComponent = Ember.Component.extend({
  tagName: '',
  selectedMonitors:[],
  selectedCount:0,
  elementId: 'iwinterfaceMonitors', //NO I18N
  didInsertElement: function () {
    var self = this;
    var monitorsList = getInterfaceMonitors();
    this.set('monitorsList', monitorsList); //NO I18N
    this.set('monitorSelectByCustomerValue', 'All_Traffic'); //NO I18N
    this.set('monitorSelectByCustomerLabel', Ember.I18n.t('webclient.intfmonitor.alltraffic',this) ); //NO I18N

    if (!window.isInterfaceMonitorBound) {
      window.isInterfaceMonitorBound =true;
      $(document).on("click.iw_monitorSelectByCustomerValue", "#iw_monitorSelectByCustomerValue", function () {
        var $credentialBox = $(this).parent('.select-with-radio-btn');
        if ($credentialBox.hasClass('active')) {
          $('#iwfilterBy  input[type="text"]').val('').trigger('input');
        }
        $credentialBox.toggleClass('active'); //NO I18N
      });
      $(document).on("mouseup.iw_monitorSelectByCustomerValue", function (e) {
        var $container = $("#iw_interfaceMonitorsDiv");
        var $credentialBox = $container.find('.credentialBox.select-with-radio-btn');
        if ($container[0] && !$container[0].contains(e.target) && $credentialBox.hasClass('active')) {
          $('.device-filer input[type="text"]').val('').trigger('input');
          $credentialBox.removeClass('active');
          var selectedMonitors = [];
          var monitorsList = self.get('monitorsList');
          for (var i = 0; i < monitorsList.length; i++) {
            if (monitorsList[i].selected) {
              selectedMonitors.push(monitorsList[i]);
            }
          }
          self.set('selectedMonitors', selectedMonitors); //NO I18N
        }
      });
    }
  },
  actions: {
    selectMonitor: function (monitor) {
      var selectedMonitors = [];
      var self = this;
      var monitorsList = this.get('monitorsList');
      for (var i = 0; i < monitorsList.length; i++) {
        if (monitorsList[i].policyName == monitor.policyName) {
          monitorsList[i].selected = !monitorsList[i].selected ;
        }
      }
      this.set('monitorsList', monitorsList); //NO I18N
      for (var i = 0; i < monitorsList.length; i++) {
        if (monitorsList[i].selected) {
          selectedMonitors.push(monitorsList[i]);
        }
      }
      self.set('selectedMonitors', selectedMonitors); //NO I18N
      self.set('selectedCount', selectedMonitors.length); //NO I18N
    },
    customizeAllTraffic:function() {
			var customMonitorList = [];
			$('#IWallTrafficCustomization input[type="checkbox"]').each(function(){
				if($(this).is(':checked')){
					customMonitorList.push($(this).val());
				}
			});
			if(customMonitorList.indexOf('AllTraffic') > -1) {
                $("#selectedSeriesType").val('AVG').select2().trigger('change'); //No I18N
                $("#selectedSeriesType").prop("disabled", true);
            } else if ($("#selectedSeriesType").prop("disabled")) {
                $("#selectedSeriesType").prop("disabled", false);
            }
            if(customMonitorList.length===0) {
                OPMClient.ReportsDetailsController.set('allTrafficCustomization','None'); // No I18N
            } else {
			    OPMClient.ReportsDetailsController.set('allTrafficCustomization',customMonitorList.join(',')); //No I18N
            }
		},
    setMonitorSelectByCustomer: function (value,label) {
      this.set('monitorSelectByCustomerValue', value); //NO I18N
      this.set('monitorSelectByCustomerLabel', Ember.I18n.t(label,this) ); //NO I18N
      if(value == "Choose_Monitors")
      {
        this.set('showMonitors',true)//NO I18N
        var monitorsList = this.get('monitorsList');
        $("#graphReportType").prop("disabled", false);
        for (var i = 0; i < monitorsList.length; i++) {
          monitorsList[i].selected = false; ;
        }
        this.set('selectedMonitors', []); //NO I18N
        this.set('monitorsList', monitorsList); //NO I18N
        this.set('selectedCount', this.get('selectedMonitors').length); //NO I18N
        this.set('monitorSelectByCustomerLabel', Ember.I18n.t(label,this) ); //NO I18N
        this.set('showAllTrafficOptions', false); //NO I18N
        if($("#selectedSeriesType").prop("disabled")) {
            $("#selectedSeriesType").prop("disabled", false);
        }
      }
      else
      {
        if(value == "All_Traffic") {
          this.set('showAllTrafficOptions', true); //NO I18N
          Ember.run.scheduleOnce('afterRender',function(){//No I18N
           if(OPMClient.ReportsDetailsController.allTrafficCustomization === undefined || OPMClient.ReportsDetailsController.allTrafficCustomization.length == 0) {
              $("#IWallTrafficCustomization").find("input[type='checkbox']").prop("checked", true); // No I18N
           } else {
              $("#IWallTrafficCustomization").find("input[type='checkbox']").prop("checked", false); // No I18N
              if(OPMClient.ReportsDetailsController.allTrafficCustomization.length > 0) {
                $("#IWallTrafficCustomization input[type='checkbox']").each(function() {
                  if(OPMClient.ReportsDetailsController.allTrafficCustomization.indexOf($(this).val()) > -1) {
                    $(this).prop("checked", true);
                  }
                });
              }
            }
          });
          if(OPMClient.ReportsDetailsController.allTrafficCustomization === undefined || OPMClient.ReportsDetailsController.allTrafficCustomization.length == 0 || OPMClient.ReportsDetailsController.allTrafficCustomization.indexOf('AllTraffic') > -1) {
            if(!$("#selectedSeriesType").prop("disabled")) {
                $("#selectedSeriesType").val('AVG').select2().trigger('change'); //No I18N
                $("#selectedSeriesType").prop("disabled", true);
            }
          } else if ($("#selectedSeriesType").prop("disabled")) {
                $("#selectedSeriesType").prop("disabled", false);
          }
        } else {
          this.set('showAllTrafficOptions', false); //NO I18N
          if($("#selectedSeriesType").prop("disabled")) {
            $("#selectedSeriesType").prop("disabled", false);
          }
        }
        this.set('showMonitors',false)//NO I18N
        this.set('selectedMonitors', []); //NO I18N
        this.set('selectedCount', 0); //NO I18N
        var monitorsList = this.get('monitorsList');
        $("#graphReportType").prop("disabled", true);
        for (var i = 0; i < monitorsList.length; i++) {
          monitorsList[i].selected = false;
        }
      }
    }
  },
  willDestroyElement: function () {
    this._super();
    $(document).off("click.iw_monitorSelectByCustomerValue");
    $(document).off("mouseup.iw_monitorSelectByCustomerValue");
    window.isInterfaceMonitorBound =false;
  }
});
OPMClient.DeviceFilterbyComponent = Ember.Component.extend({
  tagName: '',
  elementId: 'iwfilterBy', //NO I18N

  // Properties
  SelectedCategory: [],
  availableCategories: {},
  searchText: '',
  filterSelectByCustomerLabel:Ember.I18n.t('webclient.tab.alldevices',this), //NO I18N
  filterSelectByCustomerValue:-1,
  selectedFilter: 'category', //NO I18N
  keyUp:function(e){
    var self = this;
    var timeoutConst = self.get('timeoutConst');
        if(e.target.id === 'filterbyInputsearch'){
          if(timeoutConst){
            clearTimeout(timeoutConst);
          }
      timeoutConst = setTimeout(function(){
          self.searchFunction(e.target.value);
      },250);
      self.set('timeoutConst',timeoutConst);//No I18N
        }
    },
  // Search observer
  searchFunction: function (searchText) {
    var searchText = (searchText).toLowerCase();
    var available = this.get('availableCategories') || {};
    var key = this.get('selectedFilter');
    var original = available[key] || {};

    // Fallback to a simple loop for ES5 compatibility
  
    var allItems = [];
    if(key == 'Infrastructure View')
      {
        allItems.push({ key: -1, value: 'All Devices' });
      }
    else if(key == 'category'){
      allItems.push({key: -1, value: Ember.I18n.t('webclient.discovery.AllDevices',this)});
    }
    for (var k in original) {
      var val = original[k];
      if (original.hasOwnProperty(k)) {
        if(key == 'group'){
          allItems.push({ key: val.split("__")[1], value: val.split("__")[0] });
        }
        else{
          allItems.push({ key: val, value: val });
        }
      }
    }
    if (!searchText) {
      this.set('SelectedCategory', allItems); //NO I18N
      return;
    }

    // Filter based on search text
    var filtered = [];
    for (var i = 0; i < allItems.length; i++) {
      if ((allItems[i].value || '').toLowerCase().indexOf(searchText) > -1) {
        filtered.push(allItems[i]);
      }
    }

    this.set('SelectedCategory', filtered); //NO I18N
  },

  // Update selected category based on the selected filter
  updateSelectedCategory: function () {
    var available = this.get('availableCategories') || {};
    var key = this.get('selectedFilter') || 'category'; //NO I18N
    var selectedCategory = available[key] || {};
    var list = [];
    if(key == 'category')
    {
      list.push({ key: -1, value: 'All Devices' });
    }
    for(var i=0;i<selectedCategory.length;i++)
    {
      if(key == 'group')
      {
        list.push({ key: selectedCategory[i].split("__")[1], value: selectedCategory[i].split("__")[0] });
      }
      else
      {
        list.push({ key: selectedCategory[i], value: selectedCategory[i] });
      }
    }
    this.set('SelectedCategory', list); //NO I18N
    
  },
  mspProbeChange: function (probe) {
    var probeUrl = '&selCustomerID='+this.get('selCustomerID') +'&regionID='+probe.RegionID; //NO I18N
    var availableCategories = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/tab/getTabViewDetails?tabName=inventory'+probeUrl);//No I18N
    availableCategories = transformApiData(availableCategories);
    var filter = [{value:'category',label:Ember.I18n.t('webclient.common.widgets.category',this)},//No I18N
      {value:'vendor',label:Ember.I18n.t('webclient.devices.details.vendor',this)},//No I18N
      {value:'type',label:Ember.I18n.t('webclient.map.type',this)},//No I18N
      {value:'protocol',label:Ember.I18n.t('protocol',this)}//No I18N
    ];
    this.set('deviceFilter', filter); //NO I18N
    this.set('availableCategories', availableCategories); //NO I18N
    this.set('selectedFilter', 'category'); //NO I18N
    this.updateSelectedCategory();
    var self = this;
    setTimeout(function(){
      self.set('filterSelectByCustomerValue','-1'); //NO I18N
      var filterSelectByCustomerLabel = self.get('selCustomerLabel') +" / "+self.get('selregionLabel') +" / "+Ember.I18n.t('webclient.tab.alldevices',this)
      self.set('filterSelectByCustomerLabel',reorderFilterText(filterSelectByCustomerLabel)); //NO I18N
      $('[name="General"][value="-1"]').prop('checked', true);
    }, 100);
  },
  customerChange: function (customer) {
    if(customer.regionID != -1)
    {
      var probeUrl ='&selCustomerID='+customer.CustomerID+'&regionID=-1'; //NO I18N
      var mspProbeList = customer.ProbeInfo;
      mspProbeList = $.extend(true, [],mspProbeList);
      for(var i=0;i<mspProbeList.length;i++)
      {
        mspProbeList[i].selected = false;
      }
      var allprobes={};
      allprobes.RegionID = -1;
      allprobes.selected = true;
      allprobes.ProbeDisplayName = Ember.I18n.t('webclient.dashboard.allprobes',this); //NO I18N
      mspProbeList.unshift(allprobes);
      this.set('mspProbeList',mspProbeList);//NO I18N
      
      this.set('selregionID', allprobes.RegionID); //NO I18N
      this.set('selregionLabel', allprobes.ProbeDisplayName); //NO I18N
    }
    var availableCategories = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/tab/getTabViewDetails?tabName=inventory'+probeUrl);//No I18N
    availableCategories = transformApiData(availableCategories);
    var filter = [{value:'category',label:Ember.I18n.t('webclient.common.widgets.category',this)},//No I18N
      {value:'vendor',label:Ember.I18n.t('webclient.devices.details.vendor',this)},//No I18N
      {value:'type',label:Ember.I18n.t('webclient.map.type',this)},//No I18N
      {value:'protocol',label:Ember.I18n.t('protocol',this)}//No I18N
    ];
    this.set('deviceFilter', filter); //NO I18N
    this.set('availableCategories', availableCategories); //NO I18N
    this.set('selectedFilter', 'category'); //NO I18N
    this.updateSelectedCategory();
    var self = this;
    setTimeout(function(){
      self.set('filterSelectByCustomerValue','-1'); //NO I18N
      var filterSelectByCustomerLabel = self.get('selCustomerLabel') +" / "+self.get('selregionLabel') +" / "+Ember.I18n.t('webclient.tab.alldevices',this);
      self.set('filterSelectByCustomerLabel',reorderFilterText(filterSelectByCustomerLabel)); //NO I18N
      $('[name="General"][value="-1"]').prop('checked', true);
    }, 100);
  },
  probeChange: function (probe) {
    var probeUrl =probe.PROBEID == -1 ? '' : '&eeProbeID='+probe.PROBEID; //NO I18N
    var availableCategories = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/tab/getTabViewDetails?tabName=inventory'+probeUrl);//No I18N
    availableCategories = transformApiData(availableCategories);
    var filter = [{value:'category',label:Ember.I18n.t('webclient.common.widgets.category',this)},//No I18N
      {value:'businessview',label:Ember.I18n.t('webclient.admin.alarmescalation.Businessview',this)},//No I18N
      {value:'group',label:Ember.I18n.t('webclient.opm.groups',this)}, //NO I18N
      {value:'vendor',label:Ember.I18n.t('webclient.devices.details.vendor',this)},//No I18N
      {value:'type',label:Ember.I18n.t('webclient.map.type',this)},//No I18N
      {value:'protocol',label:Ember.I18n.t('protocol',this)},//No I18N
      {value:'apps',label:Ember.I18n.t('webclient.appmanager.applications',this)}//No I18N
    ];
    this.set('deviceFilter', filter); //NO I18N
    this.set('availableCategories', availableCategories); //NO I18N
    this.set('selectedFilter', 'category'); //NO I18N
    this.updateSelectedCategory();
    var self = this;

    setTimeout(function(){
      self.set('filterSelectByCustomerValue','-1'); //NO I18N
      $('[name="General"][value="-1"]').prop('checked', true);
    }, 100);
  },
  // Lifecycle hook
  didInsertElement: function () {
    url = window.OPM.apiUrlPattern + '/tab/getTabViewDetails?tabName=inventory';//No I18N
    if(OPMClient.ApplicationController.isEECentralSelected){
      var probeList = OPMClient.ApplicationController.probeList;
      probeList = $.extend(true, [],probeList);
      var allprobes={};
      allprobes.PROBEID = -1;
      allprobes.DISPLAYNAME = Ember.I18n.t('webclient.dashboard.allprobes',this); //NO I18N
      allprobes.selected = true;
      probeList.unshift(allprobes);
      this.set('selectedProbeID', allprobes.PROBEID); //NO I18N
      this.set('selectedProbeLabel', allprobes.DISPLAYNAME); //NO I18N
      this.set('probeList',probeList);//NO I18N
    }
    if(OPMClient.ApplicationController.isMSPCentralSelected)
    { 
      var customerList = OPMClient.ApplicationController.customerNameList;
      customerList = $.extend(true, [],customerList);
      var allcustomers={};
      allcustomers.CustomerID = -1;
      allcustomers.CustomerName =Ember.I18n.t('webclient.settings.customer.all',this); //NO I18N; //NO I18N
      allcustomers.selected = true;
      customerList.unshift(allcustomers);
      this.set('selCustomerID', allcustomers.CustomerID); //NO I18N
      this.set('selCustomerLabel', allcustomers.CustomerName); //NO I18N
      this.set('customerList',customerList);//NO I18N
      this.set('mspProbeList', []); //NO I18N
      this.set('selregionID', '-1'); //NO I18N
    }
    var availableCategories = opm_ajaxGetResponse(url);
    availableCategories = transformApiData(availableCategories);
    var filter = [{value:'category',label:Ember.I18n.t('webclient.common.widgets.category',this)},//No I18N
      {value:'vendor',label:Ember.I18n.t('webclient.devices.details.vendor',this)},//No I18N
      {value:'type',label:Ember.I18n.t('webclient.map.type',this)},//No I18N
      {value:'protocol',label:Ember.I18n.t('protocol',this)}//No I18N
    ];
    if(!window.OPM.isMSPCentral){
      filter.push({value:'businessview',label:Ember.I18n.t('webclient.admin.alarmescalation.Businessview',this)});//No I18N
      filter.push({value:'group',label:Ember.I18n.t('webclient.opm.groups',this)});//No I18N
    }
    if(!window.OPM.isMSPEdition && window.OPM.apmInstalled==="true"){
      filter.push({value:'apps',label:Ember.I18n.t('webclient.appmanager.applications',this)});//No I18N
    }
    this.set('deviceFilter', filter); //NO I18N
    this.set('availableCategories', availableCategories); //NO I18N
    this.set('selectedFilter', 'category'); //NO I18N
    this.updateSelectedCategory();
    var self = this;
    Ember.run.schedule("afterRender", function()//No I18n
    { 
      setupDeviceFilterEventHandler();
    });

  },

  // Actions
  actions: {
    selectFilter: function (key) {
      this.set('selectedFilter', key); //NO I18N
      this.updateSelectedCategory();
    },
    selectprobe: function (probe) {
      var probeList = this.get('probeList');
      for(var i=0;i<probeList.length;i++)
      {
        probeList[i].selected = false;
        if(probeList[i].PROBEID == probe.PROBEID)
        {
          probeList[i].selected = true;
        }
      }
      this.set('selectedProbeID', probe.PROBEID); //NO I18N
      this.set('selectedProbeLabel', probe.DISPLAYNAME); //NO I18N
      this.probeChange(probe);
    },
    selectCustomer: function (customer) {
      var customerList = this.get('customerList');
      for(var i=0;i<customerList.length;i++)
      {
        customerList[i].selected = false;
        if(customerList[i].CustomerID == customer.CustomerID)
        {
          customerList[i].selected = true;
        }
      }
      this.set('selCustomerID', customer.CustomerID); //NO I18N
      this.set('selCustomerLabel', customer.CustomerName); //NO I18N
      this.customerChange(customer); 
    },
    selectMspprobe: function (probe) {
      var mspProbeList = this.get('mspProbeList');
      for(var i=0;i<mspProbeList.length;i++)
      {
        mspProbeList[i].selected = false;
        if(mspProbeList[i].RegionID == probe.RegionID)
        {
          mspProbeList[i].selected = true;
        }
      }
      this.set('selregionID', probe.RegionID); //NO I18N
      this.set('selregionLabel', probe.ProbeDisplayName); //NO I18N
      this.mspProbeChange(probe);
    },
    setFilterSelectByCustomer:function(device)
    {
      var filter = [{value:'category',label:Ember.I18n.t('webclient.common.widgets.category',this)},//No I18N
        {value:'businessview',label:Ember.I18n.t('webclient.admin.alarmescalation.Businessview',this)},//No I18N
        {value:'group',label:Ember.I18n.t('webclient.opm.groups',this)}, //NO I18N
        {value:'vendor',label:Ember.I18n.t('webclient.devices.details.vendor',this)},//No I18N
        {value:'type',label:Ember.I18n.t('webclient.map.type',this)},//No I18N
        {value:'protocol',label:Ember.I18n.t('protocol',this)},//No I18N
        {value:'apps',label:Ember.I18n.t('webclient.appmanager.applications',this)}//No I18N
      ];
      if(this.get('selectedFilter') == 'businessview')
      {
        this.set('categoryLabel', "BV"); //NO I18N
      }
      else
      {
        for(var i=0;i<filter.length;i++)
          {
            if(filter[i].value == this.get('selectedFilter'))
            {
              this.set('categoryLabel', filter[i].label);
              break;
            }
          }
      }
      this.set('filterSelectByCustomerValue',device.key); //NO I18N
      var filterSelectByCustomerLabel = this.get('categoryLabel')+ " / " +device.value;
      if(OPMClient.ApplicationController.isEECentralSelected)
      {
        filterSelectByCustomerLabel = this.get('selectedProbeLabel') + " / " + filterSelectByCustomerLabel;
      }
      else if(OPMClient.ApplicationController.isMSPCentralSelected)
      {
        if(this.get('selregionLabel'))
        {
          filterSelectByCustomerLabel = this.get('selCustomerLabel') + " / " + this.get('selregionLabel') + " / " + filterSelectByCustomerLabel;
        }
        else
        {
          filterSelectByCustomerLabel = this.get('selCustomerLabel') + " / " + filterSelectByCustomerLabel;
        }
      }
      filterSelectByCustomerLabel = reorderFilterText(filterSelectByCustomerLabel)
      this.set('filterSelectByCustomerLabel',filterSelectByCustomerLabel); //NO I18N
    },
    handleKeyUp: function () 
    {
        var value = $('#filterbyInputsearch').val();
        var timeoutConst = this.get('timeoutConst');
        if (timeoutConst) {
          clearTimeout(timeoutConst);
        }
        var self = this;
        timeoutConst = setTimeout(function () {
          self.searchFunction(value);
        }, 250);
        this.set('timeoutConst', timeoutConst); //NO I18N
    },
    willDestroyElement: function()
    {
      this._super();
      $(document).off(
        "click.device-filer mouseup.device-filer " + //NO I18N
        "mouseup.iw_eefilter click.iw_eefilter " + //NO I18N
        "mouseup.iw_eefilter click.iw_eefilter " + //NO I18N
        "click.iw_msp_probefilter mouseup.iw_msp_probefilter" //NO I18N
      );
      window.isEEFilterBound = window.isDeviceFilerBound = window.isMSPCustomerFilterBound = window.isMSPProbeFilterBound = false;
    }
  }
});
function reorderFilterText(filterText) {
  return filterText.split(" / ").reverse().join(" / ");
}



function transformApiData(apiData) {
  var transformedData = {};

  Object.keys(apiData).forEach(function (mainKey) {
    var group = apiData[mainKey];

    if (Array.isArray(group)) {
      // If it's an array, check if it has elements and store the key
      transformedData[mainKey] = group.length ? [mainKey] : [];
    } else if (typeof group === "object" && group !== null) { //NO I18N
      // If it's an object, filter out subkeys that contain non-empty arrays
      var subKeys = Object.keys(group).filter(function (subKey) {
        return Array.isArray(group[subKey]) && group[subKey].length > 0;
      });
      transformedData[mainKey] = subKeys;
    } else {
      transformedData[mainKey] = [];
    }
  });
  var cleaned = {};
  
    Object.keys(transformedData).forEach(function (key) {
      var newKey = key.replace(/^by/, '').toLowerCase();
      cleaned[newKey] = transformedData[key];
    });
    return cleaned;
}
function setupDeviceFilterEventHandler()
{
  $('[name="General"][value="-1"]').prop('checked', true);
        if ( !window.isDeviceFilerBound ) {
            window.isDeviceFilerBound =true;
            $(document).on("click.device-filer", "#filterSelectByCustomerValue", function () {
              var $credentialBox = $(this).parent('');
              if ($credentialBox.hasClass('active')) {
                $('#iwfilterBy  input[type="text"]').val('').trigger('input');
              }
              $credentialBox.toggleClass('active'); //NO I18N
            });
            $(document).on("mouseup.device-filer", function (e) {
              var $container = $(".device-filer");
              var $credentialBox = $container.find('.device-filer__drop-down');
              
              if ($container[0] && !$container[0].contains(e.target) && $credentialBox.hasClass('active')) {
                $('.device-filer input[type="text"]').val('').trigger('input');
                $credentialBox.removeClass('active');
              }
            });
        }
        if(OPMClient.ApplicationController.isEECentralSelected)
        {
          if(!window.isEEFilterBound)
            {
              window.isEEFilterBound = true;
              $(document).on("click.iw_eefilter", "#iw_eefilter", function () {
                var $credentialBox = $(this).parent('');
                $credentialBox.toggleClass('active'); //NO I18N
              });
              $(document).on("mouseup.iw_eefilter", function (e) {
                var $container = $("#iw_eefilterDiv");
                var $credentialBox = $container.find('.default-select');
                if ($container[0] && !$container[0].contains(e.target) && $credentialBox.hasClass('active')) {
                  $credentialBox.removeClass('active');
                }
              });
            }
        }
        if(OPMClient.ApplicationController.isMSPCentralSelected)
        {
          if(!window.isMSPCustomerFilterBound)
          {
            window.isMSPCustomerFilterBound = true;
            $(document).on("click.iw_msp_customerfilter", "#iw_msp_customerfilter", function () {
              var $credentialBox = $(this).parent('');
              $credentialBox.toggleClass('active'); //NO I18N
            });
            $(document).on("mouseup.device-filer__probe-details", function (e) {
              var $container = $("#iw_msp_customerfilterDiv");
              var $credentialBox = $container.find('.default-select');
              if ($container[0] && !$container[0].contains(e.target) && $credentialBox.hasClass('active')) {
                $credentialBox.removeClass('active');
              }
            });
          }
          if(!window.isMSPProbeFilterBound)
            {
              window.isMSPProbeFilterBound = true;
              $(document).on("click.iw_msp_probefilter", "#iw_msp_probefilter", function () {
                var $credentialBox = $(this).parent('');
                $credentialBox.toggleClass('active'); //NO I18N
              });
              $(document).on("mouseup.device-filer__probe-details", function (e) {
                var $container = $("#iw_msp_probefilterDiv");
                var $credentialBox = $container.find('.default-select');
                if ($container[0] && !$container[0].contains(e.target) && $credentialBox.hasClass('active')) {
                  $credentialBox.removeClass('active');
                }
              });
            }
          }
}
    
  
