OPMClient.InterfaceMultiselectComponent = Ember.Component.extend({
    devices: [],
    visibleDevices: [],
    page: 1,
    filters: {},
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
    selectedDevicesMap: {},
    startIndex: 0,
    totalHeight: function () {
        var estimatedTotal = this.get('noMoreData') ? this.get('devices.length') : this.get('devices.length') + 20;
        return estimatedTotal * this.get('itemHeight');
    }.property('devices.length', 'itemHeight', 'noMoreData'), //NO I18N

    totalScrollStyle: function () {
        return 'height: ' + this.get('totalHeight') + 'px; position: relative;'; //NO I18N
    }.property('totalHeight'), //NO I18N

    visibleItemCount: function () {
        return Math.ceil(this.get('viewportHeight') / this.get('itemHeight')) + (this.get('bufferSize') * 2);
    }.property('viewportHeight', 'itemHeight', 'bufferSize'), //NO I18N

  
    calculateVisibleDevices: function () {
        var devices = this.get('devices');
        var startIndex = this.get('startIndex');
        var visibleCount = this.get('visibleItemCount');
        var start = Math.max(0, startIndex - this.get('bufferSize'));
        var end = Math.min(devices.length, startIndex + visibleCount + this.get('bufferSize'));
        var selectedMap = this.get('selectedDevicesMap');
        var selectedCount = Array.isArray(selectedMap) ? selectedMap.length : Object.keys(selectedMap).length;
        start = Math.max(0, Math.min(start, start - selectedCount));
        end = Math.min(devices.length, Math.max(end, end + selectedCount));
        var self = this;
        var selectedDevices = [];
        var visibleSlice = devices.slice(start, end).map(function (device, index) {
            return device;
        }, this);
        for (var key in selectedMap) {
            if (selectedMap.hasOwnProperty(key)) {
                var device = selectedMap[key];
                var isVisible = visibleSlice.some(function (visibleDevice) {
                    if(visibleDevice.id === device.id){
                        visibleDevice.selected = true;
                    }
                    return visibleDevice.id === device.id;
                });
                if (!isVisible) {
                    selectedDevices.push(device);
                }
            }
        }
        function applyItemStyle(devices, offset) {
            devices.forEach(function(device, index) {
              device.itemStyle = 'position: absolute; top: ' + ((start + index + offset) * self.get('itemHeight')) + 'px; width: 100%;'; //NO I18N
            });
          }
          
          if (!self.get('isSearching')) {
            applyItemStyle(selectedDevices, 0); 
            applyItemStyle(visibleSlice, selectedDevices.length); 
          } else {
            applyItemStyle(visibleSlice, 0); 
            selectedDevices = [];
            //applyItemStyle(selectedDevices, visibleSlice.length); 
          }
        // $.each(selectedDevices, function(index, device) {
        //     device.itemStyle = 'position: absolute; top: ' + ((start +index) * self.get('itemHeight')) + 'px; width: 100%;'; //NO I18N
        // });
        // visibleSlice.map(function (device, index) {
        //     device.itemStyle = 'position: absolute; top: ' + ((start + index+selectedDevices.length) * self.get('itemHeight')) + 'px; width: 100%;'; //NO I18N
        //     return device;
        // }, this);
    
       
    
        var result = selectedDevices.concat(visibleSlice);
      //   console.log("totalDevices:", devices.length);
      // console.log("visibleCount:", visibleCount);
      // console.log("start:", start);
      // console.log("end:", end);
        return result;
    },
    

    updateVisibleDevices: function () {
        if (!this.get('isSearching')) {
            this.set('visibleDevices', this.calculateVisibleDevices()); //NO I18N
        } 
    }.observes('devices.@each', 'startIndex', 'selectedDevicesMap'), //NO I18N

    fetchDevices: function () {
        if (this.get('isFetching') || this.get('noMoreData')) {
            return;
        }
        this.set('isFetching', true); //NO I18N
        var self = this;
        var url = window.OPM.apiUrlPattern + '/device/listInterfaces'; //NO I18N
        var params = {
            isFluidic: true,
            _search: this.get('isSearching'),
            nd: new Date().getTime(),
            rows: 100,
            page: this.get('page'),
            sortByColumn: 'interfaceDisplayName', //NO I18N
            sortByType: 'desc' //NO I18N
        };
        if (this.get('isSearching')) {
            params.filters = JSON.stringify(this.get('filters'));
        }
        var uniqueId = "";
        $.ajax({
            url: url,
            data: params,
            dataType: 'json', //NO I18N
            success: function (response) {
                response = response.rows;
                $("#" + uniqueId).remove();
                if (response && response.length > 0) {
                    if (response.length === 0) {
                        self.set('noMoreData', true); //NO I18N
                    } else {
                        var existingDevices = self.get('devices');
                        
                        if (self.get('isSearching')) {
                            self.set('visibleDevices', response); //NO I18N
                            $("#InterfaceList").scrollTop(0);

                            self.set('visibleDevices', response); //NO I18N
                            self.set('devices', response); //NO I18N
                            $("#IWDeviceList").scrollTop(0);
                        
                            var data = self.get('selectedDevicesMap');
                            for (var key in data) {
                                if (data.hasOwnProperty(key)) {
                                    response.forEach(function(device) {
                                        if (key == device.id) {
                                            device.selected = true;
                                        }
                                    });
                                }
                            }
                        } else {
                            var newDevices = response.filter(function (device) {
                                return !existingDevices.some(function (existingDevice) {
                                    return existingDevice.id === device.id;
                                });
                            });
                            self.set('devices', existingDevices.concat(newDevices)); //NO I18N
                        }
                        if (response.length < params.rows) {
                            self.set('noMoreData', true); //NO I18N
                        }
                    }
                } else {
                    self.set('noMoreData', true); //NO I18N
                }
                if (self.get('isSearching')) {
                    self.set('visibleDevices', response); //NO I18N
                    $("#InterfaceList").scrollTop(0);

                }
                    
            },
            error: function () {
                alert('Error fetching devices.'); //NO I18N
            },
            complete: function () {
                self.set('isFetching', false); //NO I18N
            }
        });
    },

    didInsertElement: function () {
        this._super();
        this.setProperties({
            isSearching: false,
            filters: {},
            devices: [],
            visibleDevices: [],
            page: 1,
            selectedDevices: [],
            selectedDevicesMap: {},
            selectedCount: 0,
            noMoreData: false,
            startIndex: 0,
            isInitialized: true
        });
        this.fetchDevices();
        var self = this;
        Ember.run.schedule("afterRender", function() { //No I18n
            setTimeout(function() {
                EditGraphicalWidget.populateDeviceList(self);
            }, 100);
          });
        var scrollHandler = function () {
            Ember.run.debounce(self, function () {
                var $list = self.$('#InterfaceList');
                if (!$list.length) {
                    return;
                }
                var scrollTop = $list.scrollTop();
                var newStartIndex = Math.floor(scrollTop / self.get('itemHeight'));
                if (newStartIndex !== self.get('startIndex')) {
                    self.set('startIndex', newStartIndex); //NO I18N
                }
                var listHeight = $list.height();
                var scrollHeight = $list[0].scrollHeight;
                var scrollBottom = scrollTop + listHeight;
                var remainingScroll = scrollHeight - scrollBottom;
                var searchTerm = self.get('searchTerm');
                this.set('isSearching' , searchTerm.length !=0 )//NO I18N
                if (!self.get('noMoreData') && !self.get('isFetching')) {
                    self.incrementProperty('page'); //NO I18N
                    self.fetchDevices();
                }
            }, 50);
        };
        this.$('#InterfaceList').on('scroll', scrollHandler);
        this.$('#searchDevice').on('input', function (event) {
            var searchValue = event.target.value.trim();
            self.set('searchTerm', searchValue); //NO I18N
            if (searchValue) {
                self.setProperties({
                    isSearching: true,
                    page: 1,
                    noMoreData: false
                });
                Ember.run.debounce(self, self.searchDevices, 300);
            } else {
                self.setProperties({
                    isSearching: false,
                    filters: {},
                    page: 1,
                    noMoreData: false
                });
                self.set('devices', []); //NO I18N
                self.fetchDevices();
            }
        });
        setupCredentialBoxEvents(this, 'IWInterfaceListDiv', 'visibleDevices', 'InterfaceList'); //NO I18N
    },

    willDestroyElement: function () {
        this._super();
        this.$('#InterfaceList').off('scroll');
        this.$('#searchDevice').off('input');
        $(document).off('#IWInterfaceListDiv .credentialBox');
        this.setProperties({
            isSearching: false,
            filters: {},
            devices: [],
            visibleDevices: [],
            page: 1,
            selectedDevices: [],
            selectedDevicesMap: {},
            selectedCount: 0,
            isInitialized: true
        });
    },

    searchDevices: function () {
        if (this.get('isSearching')) {
            this.set('filters', { //NO I18N
                groupOp: 'AND', //NO I18N
                rules: [
                    {
                        field: 'interfaceDisplayName', //NO I18N
                        op: 'cn', //NO I18N
                        data: this.get('searchTerm')
                    }
                ]
            });
            this.setProperties({
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

    actions: {
        toggleDeviceSelection: function (device) {
            var selectedMap = this.get('selectedDevicesMap');
            var newState = !device.selected;
            Ember.set(device, 'selected', newState); //NO I18N
            if (newState) {
                selectedMap[device.id] = device;
            } else {
                delete selectedMap[device.id];
            }
            this.updateSelectedDevices();
            this.sendAction('onInterfaceSelectionChanged', Object.values(this.selectedDevicesMap));
        }
    }
});
