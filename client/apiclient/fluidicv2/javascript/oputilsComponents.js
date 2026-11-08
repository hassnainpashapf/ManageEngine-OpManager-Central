OPMClient.OpmIPAMDHCPSummaryForecastComponent = Ember.Component.extend({
	templateName: "components/ipam-dhcp-summary-forecast", //No I18N
	classNames: ['com_IPAMDHCPSummaryForecast'],

	forecastChartId: function() {
		return 'perfGraph_dhcp_forecast_' + this.get('widgetData.id'); //No I18N
	}.property('widgetData.id'), //No I18N

	didInsertElement: function() {
		var chartId = this.get('forecastChartId');
		var apiData = this.get('widgetData.apiData');
		handleSelect2AutoClose(['.DIA-Content'], 'attach');//No I18N
		Ember.run.later(function() {
			//A DHCP server can have multiple forecast-enabled scopes, so use the multi-series renderer
			var period = (apiData && apiData.period) || 'Today';//No I18N
			opm_plotDHCPScopeForecastChart(chartId, apiData, Ember.I18n.t('opu.ipam.forecasting.dhcp.lease.usage'), period); //No I18N
		}, 300);
		this.set('widgetData.hideExpand',true);//No I18N
	},

	willDestroyElement: function() {
		$('#' + this.elementId).find('*').remove();
		handleSelect2AutoClose(['.DIA-Content'], 'detach');//No I18N
	}
});

OPMClient.OpmIPAMDHCPSummaryComponent = Ember.Component.extend({
	templateName: "components/dhcp-summary-details",//NO I18N
	classNames:['com_IPAMDHCPSummary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMDHCPSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summary',{});//NO I18N
		self.set('dialArr',[]);//NO I18N

		//Constructing IPAM DHCP Summary
		var summary = {};
		var info = jsonData.rows[0];
		var isDHCPForecastEnabled = false;
		if(info && info.isdhcpforecastenabled !== undefined && info.isdhcpforecastenabled !== null) {
			isDHCPForecastEnabled = (info.isdhcpforecastenabled === true || (info.isdhcpforecastenabled + "").toLowerCase() === "true");//No I18N
		}
		OPMClient.InventoryOpUtilsController.set('isDHCPForecastEnabled', isDHCPForecastEnabled);//No I18N
		summary.dhcpAddr = info['dhcp-server-address']
		summary.serverType = info['server-type']//No I18N
		summary.totalipcount = info['total-ips-count']
		if(info['mac-address'] == undefined){
			summary.macaddress = "-";
		}else{
			summary.macaddress = info['mac-address']//No I18N
		}
		summary.leasedipcount = info['leased-ips-count']
		if(info['ip-to-dns'] == undefined || info['ip-to-dns'] == ''){
			summary.iptodns = "-";
		}else{
			summary.iptodns = info['ip-to-dns']
		}
		summary.reservedipscount = info['reserved-ips-count']
		summary.totalscopescount = info['total-scopes-count']
		summary.availipsforlease = info['availble-ips-for-lease']
		summary.authenticitystatus = info.authenticity_val
		summary.wid=self.widgetData.id;
		summary.dhcpServerID = info['dhcp-server-id']; //No I18N
		summary.scanstatus = info['scan-status'];
		summary.serverTypeInt = info['server-type-int']; //No I18N
		if(info['last-scan-time'] == undefined || info['last-scan-time'] == ''){
			summary.lastscantime = "-";
		}else{
			summary.lastscantime = info['last-scan-time']//No I18N
		}
		summary.configId=self.widgetData.id;
		summary.statusint = info['scan-status-int'];//No I18N
		summary.statusCheck = false;
		if(summary.statusint == "1" || summary.statusint == "2" || summary.statusint == "4" || summary.statusint == "5"){
		  summary.statusCheck = true
		}
		if(summary != undefined && summary.serverTypeInt == 1 && ((summary.totalscopescount <= 0 || summary.totalscopescount == '-') || (summary.totalscopescount > 0 && status == '3'))){
			self.set('widgetData.sizey',19); //No I18N
			$(".alertDHCP").css("display","block");
		}else{
			self.set('widgetData.sizey',12); //No I18N
			$(".alertDHCP").css("display","none");
		}
		self.set('summary',summary);//NO I18N
		//Constructing Dial
		var temp = {};
		var dialDetails = getFormattedDialDetails(info['leased-ips-percentage']);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'leasedIps';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'leasedIps';//NO I18N
		temp.dialColor = "#fa5b5a";	//No I18N
		temp.iconTitle = Ember.I18n.t("opu.ipam.dhcp.LEASED_IPS", this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		var dialDetails = getFormattedDialDetails(info['reserved-ips-percentage']);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'reservedIps';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'reservedIps';//NO I18N
		temp.dialColor = "#faad5a";	//No I18N
		temp.iconTitle = Ember.I18n.t("opu.ipam.dhcp.RESERVED_IPS", this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		var dialDetails = getFormattedDialDetails(info['avail-ips-for-leased-percentage']);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'availableIps';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'availableIps';//NO I18N
		temp.dialColor = "#46bb7d";	//No I18N
		temp.iconTitle = Ember.I18n.t("opu.ipam.dhcp.AVAILABLE_IPS_FOR_LEASE", this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	},
	actions:{
		DeleteDHCP:function(dhcpaddr){
			var cbmethod = function(response){
		        if(response.status === "Failure"){
		            opm_infoMsgs("errorMsg",response.message); //No I18N
		        }else{
		            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
		            opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
		            redirectToSnapshot("DHCPSummary", "GROUP_3");//No I18N
		        }
		    }
		    if(confirm(Ember.I18n.t('js.common.DeleteAlert1',this))){
				var url =window.OPM.apiUrlPattern + "/ipam/deleteDHCPServers";//NO I18N
        		opm_ajaxPostRequestWithMsg(url, {"ServerAddress":dhcpaddr}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
		    }
		},
		scanDHCP:function(configId,wid){
			scanDHCP(undefined,undefined,configId,wid);
		},
		modifyAuthenticity:function(dhcpServerID, wid){
			editDHCPAuthenticity(wid, dhcpServerID);
		}
	}
});

OPMClient.OpmIPAMDNSSummaryComponent = Ember.Component.extend({
	templateName: "components/dns-summary-details", //NO I18N
	classNames: ['com_IPAMDNSSummary'],
	didInsertElement: function () {
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis: 'y',// NO I18N
			scrollButtons: { enable: true },
			theme: 'light-thick',// NO I18N
			scrollbarPosition: 'outside',// NO I18N
			setHeight: $('.com_IPAMDNSSummary .DIGmCustomScroll').closest('.grid-stack-item').height() - 70,
			advanced: { updateOnContentResize: false, updateOnImageLoad: false }
		});
		var jsonData = this.get('widgetData.apiData'); //NO I18N
		var self = this;
		self.set('summary', {}); //NO I18N
		self.set('dialArr', []); //NO I18N

		// Constructing IPAM DNS Summary
		var summary = {};
		if (jsonData && Array.isArray(jsonData.rows) && jsonData.rows.length > 0){
			var info = jsonData.rows[0];
			summary.dnsAddr = info.DNSServerAddress;
			summary.serverType = info.DNSServerType;
			summary.serverTypeInt = info['dns-server-type-int']; //No I18N
			summary.isAws = (summary.serverTypeInt === '2' || summary.serverTypeInt === 2); //No I18N
			summary.isGcp = (summary.serverTypeInt === '3' || summary.serverTypeInt === 3); //No I18N
			summary.isAwsOrGcp = summary.isAws || summary.isGcp;
			summary.dnsServerId = info.DNSServerID;
			if(info['ip-to-dns'] == undefined || info['ip-to-dns'] == ''){
	            summary.iptodns = "-";
	        }else{
	            summary.iptodns = info['ip-to-dns']//No I18N
	        }
			if (info.LastScanTime == undefined || info.LastScanTime == '') {
				summary.lastscantime = "-";
			} else {
				summary.lastscantime = info.LastScanTime;
			}
			if(info['mac-address'] == undefined){
				summary.macaddress = "-";
			}else{
				summary.macaddress = info['mac-address']//No I18N
			}
			summary.configId = self.widgetData.id;
			summary.statusint = info.ScanStatus;
			summary.statusCheck = false;
			if (summary.statusint == "1" || summary.statusint == "2" || summary.statusint == "4" || summary.statusint == "5") {
				summary.statusCheck = true;
			}
			summary.totalzonescount = info.TotalZones;
			var url = window.OPM.apiUrlPattern + '/ipam/getCountForDNSSummary?dnsServerId=' + info.DNSServerID ; //NO I18N
			if(window.OPM.isCentralServer){
	            url = oputilsAppendProbeID(url);
	        }
	        summary.primary = 0;
	        summary.secondary = 0;
	        summary.stub = 0;
	        summary.publiczone = 0;
	        summary.privatezone = 0;
	        summary.forwarding = 0;
	        summary.peering = 0;
	        summary.reverse = 0;
			var response = opm_ajaxGetResponse(url);
			if(response!=undefined && response.status == "Success"){
			    var availability = [];
			    $.each(response.result, function(i,obj){
	                availability.push({title:obj.Label,value:parseInt(obj.Count),status:obj.Status});
	                if (summary.isGcp) {
	                    if (obj.Label === "Public") {//NO I18N
	                        summary.publiczone = parseInt(obj.Count);
	                    } else if (obj.Label === "Private") {//NO I18N
	                        summary.privatezone = parseInt(obj.Count);
	                    } else if (obj.Label === "Forwarding") {//NO I18N
	                        summary.forwarding = parseInt(obj.Count);
	                    } else if (obj.Label === "Peering") {//NO I18N
	                        summary.peering = parseInt(obj.Count);
	                    } else if (obj.Label === "Reverse") {//NO I18N
	                        summary.reverse = parseInt(obj.Count);
	                    }
	                } else if (summary.isAws) {
	                    if (obj.Label === "Public") {//NO I18N
	                        summary.publiczone = parseInt(obj.Count);
	                    } else if (obj.Label === "Private") {//NO I18N
	                        summary.privatezone = parseInt(obj.Count);
	                    }
	                } else {
	                    if (obj.Label === "Primary") {//NO I18N
	                        summary.primary = parseInt(obj.Count);
	                    } else if (obj.Label === "Secondary") {//NO I18N
	                        summary.secondary = parseInt(obj.Count);
	                    } else if (obj.Label === "Stub") {//NO I18N
	                        summary.stub = parseInt(obj.Count);
	                    }
	                }
	            });
			    var dnsChartColors = summary.isGcp ? ['#fa5b5a','#46bb7d','#faad5a','#5DA5DA','#e8de65'] : ipamSeverityColors;//No I18N
			OpUtilsDialGraph(availability,dnsChartColors,Ember.I18n.t("opu.ipam.ZONES.total",this),"DNSCOUNTCHART");//No I18N
			}
			self.set('summary', summary); //NO I18N
		}
	},
	willDestroyElement: function () {
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#' + this.elementId).find('*').remove();
	},
	actions: {
		DeleteDNS: function (dhcpaddr) {
			if (confirm(Ember.I18n.t('js.common.DeleteAlert1', this))) {
				var url = window.OPM.apiUrlPattern + "/ipam/deleteDNSServers"; //NO I18N
				opm_ajaxPostRequestWithMsg(url,{"DNSServerAddress":dhcpaddr},Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),{callback: function(response){//No I18N
					if (response.status === "Failure") {
						opm_infoMsgs("errorMsg", response.message); //No I18N
					} else {
						OPMClient.Inventory.getIPAMSPMTreeView("IPAM"); //NO I18N
						opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.DNS_DELETED',this)); //No I18N
						redirectToSnapshot("DNSSummary", "GROUP_5"); //No I18N
					}
				},otpPageType: 'slide'});//NO I18N
			}
		},
		scanDNS: function (configId, wid) {
			scanDNS(undefined, undefined, configId, wid);
		},
		modifyDNSServerAddress: function (dnsServerId, dnsAddr, wid) {
			editDNSServerAddressInWidget(wid, dnsServerId, dnsAddr);
		}
	}
});


OPMClient.OpmIPAMSubnetSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-subnet-summary",//NO I18N
	classNames:['com_IPAMSubnetSummary widgetCustomScrollBar'],
	didInsertElement: function(){
		// $('.DIGmCustomScroll > div').mCustomScrollbar({
		// 	axis:'y',scrollButtons:{enable:false},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMSubnetSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		// });
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		var isForecastWidget = ((this.get('widgetData.paramURL') || '').indexOf('widget=FORECAST') !== -1);//No I18N
		self.set('isForecastWidget', isForecastWidget);//No I18N
		self.set('summary',{});//NO I18N
		self.set('dialArr',[]);//NO I18N
		self.set('countArr',[]);//NO I18N

		//Constructing IPAM Subnet Summary
		var summary = {};
		var info = jsonData.rows[0];
		var isSubnetForecastEnabled = false;
		if(info && info.isforecastenabled !== undefined && info.isforecastenabled !== null) {
			isSubnetForecastEnabled = (info.isforecastenabled === true || (info.isforecastenabled + "").toLowerCase() === "true");//No I18N
		}
		OPMClient.InventoryOpUtilsController.set('isSubnetForecastEnabled', isSubnetForecastEnabled);//No I18N
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.address = info['subnet-address'];
		summary.name = info['subnet-name'];
		summary.mask = info['subnet-mask'];
		summary.size = info['subnet-size'];
		summary.percentage = info.usedPercentage+'  % ';
		summary.lastscantime = info['last-scan-time'];
		summary.desc = info['subnet-description'];
		summary.vlanname = info['vlan-name'];//NO I18N
		summary.location = info.location;
		summary.scanstatus = info['scan-status'];//NO I18N
		summary.statusint = info['scan-status-int'];//No I18N
	    summary.statusCheck = false;
		if(summary.statusint == "1" || summary.statusint == "2" || summary.statusint == "4"){
		  summary.statusCheck = true
		}
		summary.opucustomcolums =showOpUtilsCustomColumnNames("SubnetLevelCustomField",info);//NO I18N
		summary.wid=self.widgetData.id;
		summary.subnetid=info.subnetid;
		updateSubnetSummaryStatus(summary.statusint);
		self.set('summary',summary);//NO I18N
		if(isForecastWidget){
			return;
		}

		var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?subnetId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=AVAILABILITY';//No I18N
		if(window.OPM.isCentralServer){
			url = oputilsAppendProbeID(url);
        }
		
		var sendObj = {};
        var type = 'pie';//No I18N
        var graphParams = {};
        graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
        $.getJSON(url,function(response)
		{
	        if(response!=undefined){
	        	graphParams.data = response.result;
	        }
	        graphParams.type = type; // application or protocol
	        graphParams.graphType = 'pie';//No I18N
	        graphParams.fontSize=13;
	        graphParams.hAlign="center";//No I18N
	        graphParams.vAlign="bottom";//No I18N
	        graphParams.legendEnabled = true;
	        graphParams.notContentLeft = true;
	        graphParams.isOpUtilsPie = true;
	        graphParams.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];//No I18N
	        graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
	        graphParams.plot={
						"events" : {//NO I18N
							"click" : function(event, data, chartObj){//No I18N
								OPMClient.InventoryOpUtilsController.set("isBargraph",false);//No I18N
								var filter=(data.data[2].value)
								var deviceName=OPMClient.InventoryDeviceDetailsController.deviceName;
								location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/IPs/"+filter+"/"+deviceName; //No I18N						
							}
						}
					};
	        self.set('graphParams',graphParams);//No I18N
	    });

        var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?subnetId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=DNS';//No I18N
        if(window.OPM.isCentralServer){
			url = oputilsAppendProbeID(url);
        }
		
		var sendObj = {};
        var type = 'pie';//No I18N
        var chartData = {};
        chartData.id = 'perfGraph2'+this.get('widgetData').id;//No I18N
        $.getJSON(url,function(response)
		{
	        if(response!=undefined){
	        	chartData.data = response.result;
	        }
	        chartData.type = type; // application or protocol
	        chartData.graphType = 'pie';//No I18N
	        chartData.legendEnabled = true;
	        chartData.fontSize=13;
	        chartData.hAlign="center";//No I18N
	        chartData.vAlign="bottom";//No I18N
	        chartData.notContentLeft = true;
	        chartData.isOpUtilsPie = true;
	        // chartData.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];//No I18N
	        chartData.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
	        self.set('chartData',chartData);//No I18N
	        var array_element = [
	        						{'key':'DNS','value':Ember.I18n.t('opu.views.DNS_STATUS',this),'selected':true},//No I18N
	        						{'key':'RESERVATION','value':Ember.I18n.t('opu.ipam.dhcp.RESERVED_IPS',this)},//No I18N
	        						{'key':'AUTHENTICITY','value':Ember.I18n.t('opu.views.AUTHENTICITY_STATUS',this)},//No I18N
	        						{'key':'NICTYPE','value':Ember.I18n.t('opu.views.NIC_TYPE',this)},//No I18N
	        						{'key':'DEVICETYPE','value':Ember.I18n.t('opu.views.DEVICE_TYPE',this)},//No I18N
	        						{'key':'ADSTATUS','value':Ember.I18n.t('opu.ipam.AD_STATUS',this)}//No I18N
	        					]
	        self.set('array_element',array_element);//No I18N
	        self.set('chartData',chartData);//No I18N
	        if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
	            self.set('widgetData.sizey',11); //No I18N
	            self.set('widgetData.noData',false); //No I18N
	            if(graphParams.data.length<=0){
	                //self.set('widgetData.sizey',2); //No I18N
	                self.set('widgetData.noData',true); //No I18N
	            }
	            //self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
	           // self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	        }
	        $('.select2').select2();
			// $("#subnetSummary").mCustomScrollbar();
			$(".grid-stack").removeClass("ipamGrid");//No I18N
		});
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.SubnetSummaryDetailsComponent=Ember.Component.extend({
	templateName: "components/subnet-summary-details",//No I18N
	classNames:[''],
	didInsertElement: function(){
		var self = this;
		var summary = self.get('summary');
	},
    actions:{
		chartStatus:function(deviceName) {
			var self = this;
			var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?subnetId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart='+($("#chartStatus").val());//No I18N
			var response = opm_ajaxGetResponse(url);//No I18N
			var sendObj = {};
	        var type = 'pie';//No I18N
	        var chartData = self.chartData;//No I18N
	        chartData.data = response.result;
	        self.set('chartData',chartData);//No I18N
	        opm_loadPieGraph(chartData);
		},
		modifySubnet:function(subnetId,wid){
			EditSubnet(subnetId,wid);
		},
		DeleteSubnet:function(subnetid,wid){
			var url = window.OPM.apiUrlPattern + "/ipam/deleteSubnets";//No I18N
		    var paramsdata = {}; 
	        paramsdata.NETID=subnetid;
	        if(!confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
	            return false;
	        }
	        var callback = function (response) {
	        	if(response.status==="Failure"){
	        	    opm_infoMsgs("errorMsg",response.message); //No I18N
	        	}else{
			        redirectToSnapshot('IPAMSubnetGroupSummary', 'GROUP_0');//No I18N 
			        OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N 
			        opm_infoMsgs("successMsg",Ember.I18n.t("opu.ipam.SUBNET_DELETED",this)); //No I18N
				}
			}
	    	opm_ajaxPostRequestWithMsg(url, paramsdata, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), callback);//No I18N
		}
	}
});

OPMClient.OpmIPAMSubnetSummaryForecastComponent = Ember.Component.extend({
	templateName: "components/ipam-subnet-summary-forecast", //No I18N
	classNames: ['com_IPAMSubnetSummaryForecast'],

	forecastChartId: function() {
		return 'perfGraph_subnet_forecast_' + this.get('widgetData.id'); //No I18N
	}.property('widgetData.id'), //No I18N

	didInsertElement: function() {
		handleSelect2AutoClose(['.DIA-Content'], 'attach');//No I18N
		var chartId = this.get('forecastChartId');
		var apiData = this.get('widgetData.apiData');
		Ember.run.later(function() {
			var period = (apiData && apiData.period) || 'Today';//No I18N
			opm_plotForecastChartZChart(chartId, apiData, Ember.I18n.t('opu.ipam.forecasting.subnet.ip.usage'), period); //No I18N
		}, 300);
		this.set('widgetData.hideExpand',true);//No I18N
	},

	willDestroyElement: function() {
		$('#' + this.elementId).find('*').remove();
		handleSelect2AutoClose(['.DIA-Content'], 'detach');//No I18N
	}
});

OPMClient.OpmIPAMPortSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-port-summary",
	classNames:['com_IPAMPortSummary'],
	didInsertElement: function(){
		$("#inventoryGridStyle").addClass("grid-stack-overflow-visible"); //NO I18N
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMPortSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		opm_customTooltip();
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summaryArr',{});
		var info = jsonData.result[0];
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		var summaryArr = {};
		summaryArr.portifindex = info['connected-port-ifindex'];
		summaryArr.switchport = info['connected-switch-port'];
		summaryArr.ifname = info['connected-port-ifname'];
		summaryArr.portspeed = info['connected-port-speed'];
		summaryArr.portifdesc = info['connected-port-ifdesc'];
		summaryArr.portifalias = info['connected-port-ifalias'];
		summaryArr.portiftype = info['connected-port-iftype'];
		summaryArr.portifmtu = info['connected-port-ifmtu'];
		summaryArr.loggedonuser = info['logged-on-user'];//NO I18N
		summaryArr.opstatus = info['operational-status'];
		summaryArr.adminstatus = info['admin-status'];
		summaryArr.adminstatusint = info['admin-status-int']; //NO I18N
		summaryArr.adminstatusicon = (info['admin-status-int']===1 || info['admin-status-int']==="1")?"statusUpIcon":"statusDownIcon";//No I18N
		summaryArr.connip = info['connected-ip'];
		summaryArr.designation = info['designation'];
		summaryArr.location = info['location'];
		summaryArr.phoneNo = info['phone-number'];//No I18N
		summaryArr.email = info['email-id'];//No I18N
		if (info && "consumed-power" in info){
			summaryArr.consumedPower = info['consumed-power'];//No I18N
			summaryArr.availablePower = info['available-power'];//No I18N
			summaryArr.maxPower = info['max-power'];//No I18N
			summaryArr.isPoe = true;
		}else{
			summaryArr.isPoe = false;
		}
		var macaddress = info['connected-mac'];//NO I18N
		var stackedportcount = jsonData.stackedPortCount;
		var portLengend = info.portrowlegend;
		summaryArr.connmac1="";
		if(macaddress != undefined && macaddress !== ""){
			var maclist = macaddress.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.connmac1=maclist[0];
			}
		}
		var alliplist = info['connected-ip'];//NO I18N
		summaryArr.connip1="";
		if(alliplist != undefined && alliplist !== ""){
			var alliplistArr = alliplist.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.connip1=alliplistArr[0];
			}
		}
		summaryArr.connmac = macaddress;
		summaryArr.conndns = info['connected-dns'];
		var alldnslist = info['connected-dns'];//NO I18N
		summaryArr.conndns1="";
		if(alldnslist != undefined && alldnslist !== ""){
			var alldnslistArr = alldnslist.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.conndns1=alldnslistArr[0];
			}
		}
		summaryArr.devtype = info['device-type'];
		var alldevTypeList = info['device-type'];//NO I18N
		summaryArr.devtype1="";
		if(alldevTypeList != undefined && alldevTypeList !== ""){
			var alldevTypeArr = alldevTypeList.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.devtype1=alldevTypeArr[0];
			}
		}
		summaryArr.scanstatus = info['scan-status'];
		summaryArr.vlan = info.vlan;
		var allVlanList = info.vlan;
		summaryArr.vlan1="";
		if(allVlanList != undefined && allVlanList !== ""){
			var allVlanArr = allVlanList.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.vlan1=allVlanArr[0];
			}
		}
		summaryArr.vlanname = info['vlan-name'];
		var allVlanNameList = info['vlan-name']; //No I18N
		summaryArr.vlanname1="";
		if(allVlanNameList != undefined && allVlanNameList !== ""){
			var allVlanNameArr = allVlanNameList.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.vlanname1=allVlanNameArr[0];
			}
		}
		summaryArr.vendor = info['connected-device-type'];//NO I18N
		var allVendorlist = info['connected-device-type']; //No I18N
		summaryArr.vendor1="";
		if(allVendorlist != undefined && allVendorlist !== ""){
			var allVendorArr = allVendorlist.split(",");
			if(portLengend != undefined && portLengend == "spmStackedPort"){
				summaryArr.vendor1=allVendorArr[0];
			}
		}
		summaryArr.opstatusIcon=(info['operational-status-int']===1 || info['operational-status-int']==="1")?"statusUpIcon":"statusDownIcon";//No I18N
		var status = info['scan-status-int'];//No I18N
		var classColor="iconStatusColor iconStatusRed";//No I18N
	    if(status === "2"){
	        classColor = "iconStatusColor iconStatusYellow";//NO I18N
	    }else if(status === "3"){
	        classColor = "iconStatusColor iconStatusBlue";//NO I18N
	    }else if(status === "5"){
	        classColor = "iconStatusColor iconStatusGreen";//NO I18N
	    }
	    summaryArr.icon=classColor;
		var loc = info['port-location'];//No I18N
		if(loc === "" || loc === undefined){
			loc="--";//No I18N
		}
		summaryArr.portloc = loc;
		summaryArr.opucustomcolums=showOpUtilsCustomColumnNames("SPMPortLevelCustomField",info);//NO I18N

		summaryArr.descportifindex = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descswitchport = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descifname = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportspeed = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportifdesc = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportifalias = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportiftype = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descloggedOnUser=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descportifmtu = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descconnip = Ember.I18n.t('opu.readkb.ConnectedIP',this);//No I18N
		summaryArr.descconnmac = Ember.I18n.t('opu.readkb.ConnectedMAC',this);//No I18N
		summaryArr.descdevtype = Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descportloc = Ember.I18n.t('opu.readkb.SysName',this);//No I18N
		summaryArr.descconndns = Ember.I18n.t('opu.readkb.IPDNS',this);//No I18N

		self.set('summaryArr',summaryArr);
		self.set('widgetData.sizey',12+(summaryArr.opucustomcolums.length));//NO I18N
		$(".grid-stack").removeClass("ipamGrid");//No I18N
		if(OPMClient.InventoryOpUtilsController.isPortSnapFromOPMSwitch){
			OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
			OPMClient.InventoryOpUtilsController.set("isPortSnapFromOPMSwitch",false);//NO I18N
		}
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
		$("#inventoryGridStyle").removeClass("grid-stack-overflow-visible"); //NO I18N
	}
});
OPMClient.OpmIPAMSwitchSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-switch-summary",
	classNames:['com_IPAMSwitchSummary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMSwitchSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summary',{});//NO I18N
		self.set('countArr',[]);//NO I18N
		self.set('dialArr',[]);//NO I18N

		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		var summary = {};
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('isV6Summary',true);//NO I18N
		self.set('summary',{});//NO I18N
		self.set('dialArr',[]);//NO I18N

		//Constructing IPAM Subnet Summary
		var summary = {};
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.ipaddress = info['ip-address'];
		summary.iptodns = info['ip-to-dns'];//No I18N
		var pollUsingIp = info['poll-using'];//No I18N
		if(pollUsingIp == "IP"){
		    summary.pollUsingIp = Ember.I18n.t('opu.views.IP_ADDRESS',this);//No I18N
		}
		else{
            summary.pollUsingIp = Ember.I18n.t('opu.views.DNS_NAME',this);//No I18N
		}
		summary.sysloc = info['system-location'];
		summary.switchtype = info['switch-type'];
		summary.maxPower = info['max-power'];//No I18N
		if((summary.maxPower <= 0 || summary.maxPower === undefined)){
			summary.maxPower = Ember.I18n.t('webclient.devices.snapshot.NA',this);//No I18N
		}
		summary.consumedPower = info['consumed-power'];//No I18N
		if((summary.consumedPower <= 0 || summary.consumedPower === undefined)){
			summary.consumedPower = Ember.I18n.t('webclient.devices.snapshot.NA',this);//No I18N
		}
		summary.isPoe=info.isPoESwitch;
		self.set('isPoESwitch', info.isPoESwitch);//No I18N
		summary.availablePower = info['available-power'];//No I18N
		if((summary.availablePower <= 0 || summary.availablePower === undefined)){
			summary.availablePower = Ember.I18n.t('webclient.devices.snapshot.NA',this);//No I18N
		}
		summary.sysdesc = info['system-description'];
		summary.sysuptime = info['sysuptime-original'];
		summary.scanstatus = info['scan-status'];
		summary.lastscantime = info['last-scan-time'];
		summary.subnetip = info['subnet-address'];
		summary.macaddress = info['mac-address'];
		summary.sysname = info['system-name'];
		summary.model = info.model;
		summary.osVersion = info.osVersion;
		summary.credentialName = info.credentialname;
		summary.serialNumber = info['serial-number'];//No I18N
		summary.switchName = info['switch-name'];//NO I18N
		summary.displayName = info['display-name'];//NO I18N
		summary.configId = info['config-id'];//NO I18N
		summary.usedCount = info['used-count'];//NO I18N
		summary.availableCount = info['available-count'];//NO I18N
		summary.vlanCount = info['vlan-count'];//NO I18N
		summary.totalCount = info['total-count'];//NO I18N
		summary.transientCount = info['transient-count'];//NO I18N
		summary.wid=self.widgetData.id;
		summary.opucustomcolums =showOpUtilsCustomColumnNames("SPMSwitchLevelCustomField",info);//NO I18N
		OPMClient.InventoryOpUtilsController.isPoESwitch=info.isPoESwitch;
		var status = info['scan-status-int'];//No I18N
	    updateSwitchSummaryStatus(status);
		self.set('summary',summary);
		if(OPMClient.InventoryOpUtilsController.isPoESwitch){
			$('#ipamSwitchSummary').css('width', '33.33%');
			$('#switchAvailabilitySummary').css('width', '33.33%');
			$('#poeSummary').css('width', '33.33%');
		}
        $.getJSON(window.OPM.apiUrlPattern + '/spm/getSPMSummaryCharts?switchIP='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=AVAILABILITY',function(jsonData)  //No I18N
        {         
            OPMClient.InventoryOpUtilsController.subFilterObj=jsonData.result;
            var availability = []
            $.each(jsonData.result, function(i,obj)
            {
                var label = obj[0]; 
    			var value = obj[1]; 
    			var status = obj[2];
    			if(status === "available"){//No I18N
    				status = 5;
    			}else if(status === "used"){//No I18N
    				status = 1;
    			}else if(status === "transient"){//No I18N
    				status = 2;
    			}
                availability.push({title:label,value:value,status:status});
            });
            OpUtilsDialGraph(availability,ipamSeverityColors,'Total Ports','MainSeverityChart-II');//No I18N 
        });
        if(OPMClient.InventoryOpUtilsController.isPoESwitch){
        	$("#poeSummary").css("display","block");
        	$.getJSON(window.OPM.apiUrlPattern + '/spm/getSPMSummaryCharts?switchIP='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=POEENABLED',function(jsonData)  //No I18N
        	{         
	            var order = {
				    "Consumed Power": 1,//No I18N
				    "Maximum Power": 2,//No I18N
				    "Available Power": 3//No I18N
				};

	            var powerStats = [];
	            $.each(jsonData.result, function(i,obj)
	            {
	                var label = obj[0]; 
	    			var value = obj[1] + "<em class='bold fs16'>"+Ember.I18n.t('opu.views.watts',this)+"</em>"; 
	    			var status = obj[2];
	                powerStats.push({title:label,value:value,status:status});
	            });

	            powerStats.sort(function(a, b) {
				    return order[a.title] - order[b.title];
				});
	            Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			        OpUtilsDialGraph(powerStats,ipamSeverityColors,Ember.I18n.t('opu.views.CONSUMED_POWER',this),'MainSeverityChart-III');//No I18N
			        opm_setLabels('MainSeverityChart-III',OPMClient.InventoryOpUtilsController.consumedSwitchPower,Ember.I18n.t('opu.views.CONSUMED_POWER',this));//No I18N
			    });
        	});
        }
		
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	},
	actions:{
		modifySwitch:function(switchName,wid){
			editSwitch(switchName,wid);
		},
		DeleteSwitch:function(configId,wid){
			var cbmethod = function(response){
		        if(response.status === "Failure"){
		            opm_infoMsgs("errorMsg",response.message); //No I18N
		        }else{
		            OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
		            opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
		            redirectToSnapshot("IPAMSwitchGroup", "SPMGROUP_0");//No I18N 
		        }
		    }
		    if(confirm(Ember.I18n.t('opu.spm.DELETE_CONFORMATION',this))){
		        var url =window.OPM.apiUrlPattern + "/spm/deleteSwitches";//NO I18N
		        opm_ajaxPostRequestWithMsg(url, {"configID":configId}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
		    }
		},
		scanSwitch:function(configId,wid){
			scanSwitch(configId,wid);
		}
	}
})
OPMClient.OpmIPSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-ip-summary",
	classNames:['com_IPSummary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		opm_customTooltip();
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summaryArr',{});
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		var summaryArr = {};
		summaryArr.ipaddress = info['ip-address'];
		summaryArr.macaddress = info['mac-address'];
		summaryArr.iptodns = info['ip-to-dns'];
		summaryArr.dnstoip = info['dns-to-ip'];
		summaryArr.loggedonuser = info['logged-on-user'];//NO I18N
		summaryArr.status = info.status;
		summaryArr.devType = info['device-type'];
		summaryArr.reservedStatus = info['reserved-status'];
		summaryArr.dnsstatus = info['dns-status'];
		summaryArr.tag = info['asset-tag'];
		summaryArr.lastalivetime = info['last-alive-time'];
		summaryArr.lastscantime = info['last-scan-time'];
		summaryArr.sysName = info['system-name'];
		summaryArr.nictype = info['nic-type'];
		summaryArr.sysDesc = info['system-description'];
		summaryArr.aliasName = info['alias-name'];
		summaryArr.location = info.location;
		summaryArr.connSwitch = info['connected-switch'];
		summaryArr.connSwitchDisplayName = info['display-name']; //NO I18N
		summaryArr.isPortTrunkMAC=info.isPortTrunkMAC;
		summaryArr.connPort = info['connected-switch-port'];
		summaryArr.portIfIndex = info['connected-port-ifindex'];
		summaryArr.connPortIfName = info['connected-port-ifname'];
		summaryArr.portIfAlias = info['connected-port-ifalias'];
		summaryArr.portSpeed = info['connected-port-speed'];
		summaryArr.authenticity = info.authenticity;
		summaryArr.addomain=info['ad-domain-name'];//NO I18N
		summaryArr.scopename=info.scopename;
		summaryArr.cdkey=info['dc-Key'];//NO I18N
		summaryArr.serialnumber=info['serial-number'];//NO I18N
		summaryArr.iftype=info['connected-port-iftype'];//NO I18N
		summaryArr.sysname=info['system-name'];//NO I18N
		summaryArr.ifmtu=info['connected-port-ifmtu'];//NO I18N
		summaryArr.duplex=info['connected-port-duplex'];//NO I18n
		summaryArr.modifiedby=info['modified-by'];//NO I18n
		summaryArr.owner=info.owner;
		summaryArr.dhcpled=info['dhcp-lease-expiry-date'];//NO I18n
		summaryArr.dhcpRStatus=info['dhcp-reserved-status'];//NO I18n
		summaryArr.changetime=info['change-time'];//NO I18n
		summaryArr.phoneNo=info['phone-number'];//No I18N
		summaryArr.designation=info['designation'];//No I18N
		summaryArr.email=info['email-id'];//No I18N
		summaryArr.ipType = info['ip-type'];//No I18N
		summaryArr.ipTypeInt = info['ip-type-int'];//No I18N
		summaryArr.dhcpServerName = info['dhcp-server-address'];//No I18N
		summaryArr.dhcpScopeName = info['dhcp-scope-address'];//No I18N
		summaryArr.descmacaddress = Ember.I18n.t('opu.readkb.ConnectedMAC',this);//No I18N
		summaryArr.desciptodns = Ember.I18n.t('opu.readkb.IPDNS',this);//No I18N
		summaryArr.descdnstoip = Ember.I18n.t('opu.readkb.IPDNS',this);//No I18N
		summaryArr.descdevType = Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.desctag = Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descsysName = Ember.I18n.t('opu.readkb.SysName',this);//No I18N
		summaryArr.descsysDesc = Ember.I18n.t('opu.readkb.SysName',this);//No I18N
		summaryArr.desclocation = Ember.I18n.t('opu.readkb.SysName',this);//No I18N
		summaryArr.descportIfIndex = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportIfAlias = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descportSpeed = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descserialnumber=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.desciftype=Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descsysname=Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descifmtu=Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descduplex=Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descdhcpRStatus=Ember.I18n.t('opu.readkb.DHCPReservedstatus',this);//No I18N
		summaryArr.descaddomain=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descscopename=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descloggedOnUser=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.desccdkey=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descconnSwitch = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descconnPort = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descconnPortIfName = Ember.I18n.t('opu.readkb.IfIndex',this);//No I18N
		summaryArr.descdhcpled=Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N
		summaryArr.descchangetime = Ember.I18n.t('opu.views.LAST_CHANGE_TIME',this);//No I18N
		summaryArr.descauthenticity = Ember.I18n.t('opu.readkb.ADDomain',this);//No I18N

		summaryArr.opucustomcolums =showOpUtilsCustomColumnNames("IPAMIPLevelCustomField",info);//NO I18N
		self.set('summaryArr',summaryArr);
		OPMClient.ApplicationController.set("helpCardPageName","OpUtilsIPAM");//NO I18N
		self.set('widgetData.sizey',20+(summaryArr.opucustomcolums.length)+7);//NO I18N
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmPortDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-spm-switch",
	classNames:['width100'],
	didInsertElement: function(){
		var self = this;
		var jsonData = (this.get('widgetData.apiData'));
		if(jsonData.result.length!=0 && jsonData.isEnabledOpUtils === undefined)
		{
			$("#switchsnapshotContainerSample").hide();
			$(".opuSampleDataText1").css("display","none");
			self.set('widgetData.noData',false);
			self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?16:12);//NO I18N
			if(self.widgetData.name === "webclient.opm.meraki.msportsview"){
				drawMerakiSwitchPort(jsonData);
			}else{
				drawSPMSwitchPort(jsonData);
			}
			if(window.OPM.isOPM && !window.OPM.isEvalUser && !isIPAMAddonLicenseEnabled() && !window.OPM.isOPMPLUS){
				$('[target="addon-popup-position"]').show();
			}
		}
		else
		{
			self.set('widgetData.noData',true);
			self.set('widgetData.sizey',2);
			if (jsonData.isEnabledOpUtils !== undefined){
				displayAddonPopupIn(2000,false);
	    		self.set('widgetData.noData',false);//NO I18N
				self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?16:10);//NO I18N
		        $("#switchsnapshotContainerSample").show();
		        $(".opuSampleDataText1").css("display","block");
		        $("#Dia-Content").removeClass("DIA-Content").addClass("DIA-Content portsSampledata");
		        $(".sampleDataOverlay").css("display","block");
		        var oputilsipamurl = "https://www.manageengine.com/products/oputils/ip-address-manager.html";//NO I18N
		        OPMClient.InventoryOpUtilsController.set("spmsampleDescription",Ember.String.htmlSafe(Ember.I18n.t("opu.spm.port.sample_data_desc_new",{ipamurl:oputilsipamurl})));//NO I18N
		        if(window.OPM.isOPM){
		        	if(window.OPM.isEvalUser && !window.OPM.isOPUPlug){
		        		$("#switchsnapshotContainerSample").show();
		        		OPMClient.InventoryOpUtilsController.set("spmsampleDescription",Ember.String.htmlSafe(Ember.I18n.t("opu.spm.port.sample_data_desc_new",{ipamurl:oputilsipamurl})));//NO I18N
		        	}else if(window.OPM.isEvalUser && window.OPM.isOPUPlug){
		        		OPMClient.InventoryOpUtilsController.set("spmsampleDescription",Ember.String.htmlSafe(Ember.I18n.t("opu.spm.port.nfa.sample_data_desc1",{param0:jsonData.input.switchIP})));//NO I18N
		        	}
		        	if((jsonData.isEnabledOpUtils.toLowerCase()=="true" && window.OPM.isOPUPlug)){
		        		if(window.OPM.userPermissions.spmWrite){
			        		OPMClient.InventoryOpUtilsController.set("spmsampleDescription",Ember.String.htmlSafe(Ember.I18n.t("opu.spm.port.nfa.sample_data_desc1",{param0:jsonData.input.switchIP})));//NO I18N
			        	}
		        	}
		        	else if(!window.OPM.isEvalUser && !isIPAMAddonLicenseEnabled() && !window.OPM.isOPMPLUS){
		        		OPMClient.InventoryOpUtilsController.set("spmsampleDescription",Ember.I18n.t("opu.msgbd.IPAM_OPM_ADDON_NOT_ENABLED"));//NO I18N
		        	}
		        }
		    }
			else if((self.widgetData.name==="ipam.ports.view" || self.widgetData.name==="spm.ports.view")  && jsonData.isShowAllInterface!=undefined && jsonData.isShowAllInterface=="false"){
				$("#opu_enable_all_interface_portview").show();
				self.set('widgetData.sizey',7); //No I18N
				if(self.widgetData.name==="spm.ports.view"){
				self.set('widgetData.sizey',10); //No I18N
				}
			}
		}
		self.set('widgetData.hideExpand',true);//No I18N
		//if(self.get('widgetData.reloadWidget'))
		{
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
		}
	},
	willDestroyElement: function(){
        closeAddonPopupifExist();
		OPMClient.InventoryDeviceDetailsController.set('showAddOnPopup',false);//NO I18N
		$('#'+this.elementId).find('.DIGG-Charts.DIGG-Time').remove();
		$('#'+this.elementId).find('*').remove();
		$("#Dia-Content").removeClass("DIA-Content portsSampledata").addClass("DIA-Content");
		$(".sampleDataOverlay").css("display","none");
		$(".opuSampleDataText1").css("display","none");
	},
	actions:{
		opuEnableInterfacesAndScan: function(){
			opuEnableInterfacesAndScan(this.widgetData.id);
		}
	}
});
OPMClient.OpmSpmSwitchComponent = Ember.Component.extend({
	classNames:['width100'],
	didInsertElement: function(){
		var ipAddress = this.get('ipAddress');
		if(ipAddress!==undefined){
			drawSPMSwitchPortDetails(ipAddress);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('.DIGG-Charts.DIGG-Time').remove();
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmIPAMPingSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-ping-summary",//NO I18N
	classNames:['com_IPAMPingSummary'],//NO I18N
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMPingSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});

		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summary',{});//NO I18N
		self.set('dialArr',[]);//NO I18N
		// self.set('countArr',[]);//NO I18N
		//Constructing IPAM Ping Summary
		var summary = {};
		var info = jsonData.result[0];
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.address = info['ip-address'];//NO I18N
		summary.dnsname = info['ip-to-dns'];//NO I18N
		summary.status = info.status;
		summary.lastresponetime = info['response-time'];//NO I18N
		summary.lastupdatedtime = info['last-updated-time'];//NO I18N
		summary.monitorstatus = info['monitoring-status'];//NO I18N
		summary.sysname = info['system-name'];//NO I18N
		self.set('summary',summary);//NO I18N

		var temp = {};
		var dialDetails = getFormattedDialDetails(info.healthyPercentage);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'healthy_div';//NO I18N
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'healthy_div';//NO I18N
		temp.dialColor = "#46bb7d";	//No I18N
		temp.iconTitle = Ember.I18n.t('opu.common.HEALTHY',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		dialDetails = getFormattedDialDetails(info.warningPercentage);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'warning_div';//NO I18N
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'warning_div';//NO I18N
		temp.dialColor = "#faad5a";	//No I18N
		temp.iconTitle = Ember.I18n.t('jsp.compliance.AddCompRule.Warning',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		dialDetails = getFormattedDialDetails(info.criticalPercentage);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'critical_div';//NO I18N
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'critical_div';//NO I18N
		temp.dialColor = "#fa5b5a";	//No I18N
		temp.iconTitle = Ember.I18n.t('jsp.commonstr.Critical',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmIPAMSubnetV6SummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-v6subnet-summary",//NO I18N
	classNames:['com_IPAMSubnetV6Summary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMSubnetV6Summary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('isV6Summary',true);//NO I18N
		self.set('summary',{});//NO I18N
		self.set('dialArr',[]);//NO I18N

		//Constructing IPAM Subnet Summary
		var summary = {};
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.address = info['subnet-address']; //No I18N
		summary.name = info['subnet-name'];//No I18N
		summary.totalip = info['total-ips-count'];//No I18N
		summary.usage = info.usedPercentage+'  % ';//No I18N
		summary.startip = info['start-ip'];//No I18N
		summary.endip = info['end-ip'];//No I18N
		summary.desc = info['subnet-description'];//No I18N
		summary.dispName = info['subnet-name'];//No I18N
		summary.dispDesc = info['subnet-description'];//No I18N
		summary.wid=self.widgetData.id;
		self.set('summary',summary);//NO I18N//No I18N

		var url = window.OPM.apiUrlPattern + '/ipam/getIPV6SiteAvailablityStatus?subnetId='+OPMClient.InventoryDeviceDetailsController.deviceName;//No I18N
		//var response = opm_ajaxGetResponse(url);//No I18N
		if(window.OPM.isCentralServer){
			url = eeClientReqToProbe(url,OPMClient.InventoryOpUtilsController.selectedprobeid);
		}
		
		var sendObj = {};
        var type = 'pie';//No I18N
        var graphParams = {};
        graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		$.getJSON(url,function(response)
		{
	        graphParams.data = response.result;
	        graphParams.type = type; // application or protocol
	        graphParams.graphType = 'pie';//No I18N
	        graphParams.fontSize=13;
	        graphParams.hAlign="center";//No I18N
	        graphParams.vAlign="bottom";//No I18N
	        graphParams.legendEnabled = true;
	        graphParams.notContentLeft = true;
	        graphParams.isOpUtilsPie = true;
	        graphParams.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];//No I18N
	        graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
	        self.set('graphParams',graphParams);//No I18N
	    });
	}
});

OPMClient.V6subnetSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/v6subnet-summary-details",//NO I18N
	classNames:[''],
	didInsertElement: function(){
	},
	actions:{
		oputilsIpV6SnapshotActions:function(pg,wid){
			OPMClient.InventoryOpUtilsController.widgetId=wid;
        	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/OPUSnapAction/"+pg; //No I18N 
        }
	}
})

OPMClient.OpmIPAMSubnetV6IPSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ipam-v6IpAddress-summary",//NO I18N
	classNames:['com_IPAMSubnetV6IPSummary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPAMSubnetV6IPSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('ipSummary',{});//NO I18N
		self.set('dnsSummary',{});//NO I18N

		//Constructing IPAM Subnet Summary
		var ipSummary = {};
		var info = jsonData.result;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		ipSummary.address = info['compressed-format']; //No I18N
		ipSummary.status = info.status;
		ipSummary.scanTime = info['last-scan-time'];//No I18N
		ipSummary.macaddress = info['mac-address'];//No I18N
		ipSummary.aliasname = info['alias-name'];//No I18N
		ipSummary.addtype = info['address-type'];//No I18N
		self.set('ipSummary',ipSummary);//NO I18N//No I18N

		var dnsSummary = {};
		dnsSummary.dnsstatus = info['dns-status']; //No I18N
		dnsSummary.iptodns = info.dnsname;
		dnsSummary.dnstoip = info['dns-to-ip'];//No I18N
		dnsSummary.dnsname = info.dnsname;
		self.set('dnsSummary',dnsSummary);//NO I18N//No I18N
	}
});

OPMClient.OpmOpuPieChartComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",//No I18N
    showGrid:false,
    didInsertElement:function() {
    	var self = this;
        var jsonData = this.get('widgetData').apiData;
 
        var pushData = null;
        if(jsonData.avilability!==undefined && jsonData.avilability != null) {
            pushData = jsonData.avilability[0];
        }else if(jsonData.result !== undefined && jsonData.result != null){
            pushData = jsonData.result;
        } else {
            pushData = jsonData;
        }
        
        var multiData = new Array();
        var gridData1 = new Array();
        if (pushData != null) {
            for (var indexx = 0; indexx < Object.keys(pushData).length; indexx++) {
                var obj = {
                        
                };
                var array_element = pushData[Object.keys(pushData)[indexx]];
                multiData.push(array_element);
            }
        }
 
        var sendObj = {};
        var type = 'pie';//No I18N
        var graphParams = {};
        graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
        graphParams.data = multiData;
        graphParams.type = type; // application or protocol
        graphParams.graphType = 'pie';//No I18N
        graphParams.hAlign="center";//No I18N
        graphParams.vAlign="bottom";//No I18N
        graphParams.legendEnabled = true;
        graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
        self.set('graphParams',graphParams);//No I18N
        // self.set('widgetData.header',false);//NO I18N
        if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
            self.set('widgetData.sizey',13); //No I18N
            self.set('widgetData.noData',false); //No I18N
            if(graphParams.data.length<=0){
                self.set('widgetData.sizey',2); //No I18N
                self.set('widgetData.noData',true); //No I18N
            }
            self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
            self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
        }
        self.set('widgetData.hideExpand',true);//No I18N
        graphParams.isOpUtilsPie = true; // increased pie legent text..
    },
    willDestroyElement:function() {
        $('#'+this.elementId).find('*').remove();
    }
});

OPMClient.OpmOpuBoundPieChartComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",//No I18N
	showGrid:false,
	didInsertElement:function() {
		var self = this;
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		self.set('widgetData.hideExpand',true);//No I18N
		if(this.get('widgetData.name')==="opu.ipam.status"){
			self.set('widgetData.isOPUHeader',true);//No I18N
			if(this.get('widgetData.paramURL')=="" || this.get('widgetData.paramURL')==undefined){
				self.set('widgetData.chartHeader',Ember.I18n.t('opu.views.DNS_STATUS',this));//No I18N
			}else{
				var chartName = this.get('widgetData.paramURL');//NO I18N
				var chart = chartName.split('=')[1];
				var chartHeader = "";
				if(chart!="Availability"){
					if(chart=="DNS"){
						chartHeader=Ember.I18n.t("opu.views.DNS_STATUS",this);//No I18N
					}else if(chart=="RESERVATION"){//No I18N
						chartHeader=Ember.I18n.t("opu.ipam.dhcp.RESERVED_IPS",this);//No I18N
					}else if(chart=="AUTHENTICITY"){//No I18N
						chartHeader=Ember.I18n.t("opu.views.AUTHENTICITY_STATUS",this);//No I18N
					}else if(chart=="NICTYPE"){//No I18N
						chartHeader=Ember.I18n.t("opu.views.NIC_TYPE",this);//No I18N
					}else if(chart=="DEVICETYPE"){//No I18N
						chartHeader=Ember.I18n.t("opu.views.DEVICE_TYPE",this);//No I18N
					}else if(chart=="ADSTATUS"){//No I18N
						chartHeader=Ember.I18n.t("opu.ipam.AD_STATUS",this);//No I18N
					}
					self.set('widgetData.chartHeader',chartHeader);//No I18N
				}
			}
			
		}
		var pushData = null;
		if(jsonData.avilability!==undefined && jsonData.avilability != null) {
			pushData = jsonData.avilability[0];
		}else if(jsonData.result !== undefined && jsonData.result != null){
			pushData = jsonData.result;
		} else {
			pushData = jsonData;
		}
		
		var multiData = new Array();
		var gridData1 = new Array();
		if (pushData != null) {
			for (var indexx = 0; indexx < Object.keys(pushData).length; indexx++) {
				var obj = {
						
				};
				var array_element = pushData[Object.keys(pushData)[indexx]];
				multiData.push(array_element);
			}
		}

		var sendObj = {};
		var type = 'pie';//No I18N
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		graphParams.subType = 'boundBox';//No I18N
		graphParams.innerLabel = false;//No I18N
		graphParams.legendEnabled = true;
		graphParams.hAlign = "center";//No I18N
 		graphParams.vAlign = "bottom";//No I18N
 		graphParams.datalabels = {
				"handleOverlapping": true,//No I18N
				"show": true,//No I18N
				"boundBox": {//No I18N
					"strokeColor": null,//No I18N
					"show": true,//No I18N
					"radius": 8,//No I18N
					"padding": 9,//No I18N
					"hook": {//No I18N
						"enabled": true,//No I18N
						"width": 8//No I18N
					}
				}
			},
		graphParams.fontSize=13,
		graphParams.label= ["{{val(0)}} = {{val(1)}}"],//No I18N
		graphParams.color= ["#ee5656","#46bb7d","#faad5a","#3099d0"],
		graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
		self.set('graphParams',graphParams);//No I18N
		if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
			self.set('widgetData.sizey',11); //No I18N
			self.set('widgetData.noData',false); //No I18N
			if(graphParams.data.length<=0){
				self.set('widgetData.sizey',2); //No I18N
				self.set('widgetData.noData',true); //No I18N
			}
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
		}
		// graphParams.isOpUtilsPie = true; // increased pie legent text..
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmIPAMGroupSummaryComponent = Ember.Component.extend({
	templateName: "components/ipam-group-summary",//NO I18N
	classNames:['com_IPAMGroupSummary'],
	didInsertElement: function(){
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summary',{});//NO I18N
		var summary = {};
		var info = jsonData;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.isSupernet = false;
		if(OPMClient.InventoryDeviceDetailsController.deviceName.indexOf("SUPERNET") !== -1){
			var subnetDetails = info.rows[0];
			summary.text = Ember.I18n.t('opu.ipam.SUPERNET_DETAILS',this);//NO I18N
			summary.supernetName = subnetDetails.supernetName;
			summary.supernetAddress = subnetDetails["supernetAddress-cidr"];//NO I18N
			summary.description = subnetDetails.description;
			summary.addedTime = subnetDetails["added-time"];//NO I18N
			summary.startIP = subnetDetails.startIP;
			summary.endIP = subnetDetails.endIP;
			summary.isSupernet = true;
		}
		summary.totalip = info['totalCount'];
		summary.reservedIps = info['reserved-count'];//No I18N
		//******
		summary.totalsubnets = info['subnet-count'];
		summary.usedPercentage = info['percentage'];
		summary.reverseLookup = info['reverse-lookup-failed-count'];
		summary.forwardLookup = info['forward-lookup-failed-count'];
		summary.ipMismatch = info['ip-mismatch-count'];
		self.set('summary',summary);//NO I18N
		self.set('widgetData.hideExpand',true);//NO I18N

		var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?groupId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=AVAILABILITY';//No I18N
		if(window.OPM.isCentralServer){
			url = oputilsAppendProbeID(url);
		}
		var sendObj = {};
        var type = 'pie';//No I18N
        var graphParams = {};
        graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
        $.getJSON(url,function(response)
		{
	        if(response!=undefined){
	        	graphParams.data = response.result;
	        }
	        graphParams.plot={
						"events" : {//NO I18N
							"click" : function(event, data, chartObj){//No I18N
								OPMClient.InventoryOpUtilsController.set("isBargraph",false);//No I18N
								var filter=(data.data[2].value)
			                   	var deviceName=OPMClient.InventoryDeviceDetailsController.deviceName;
								location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/IPs/"+filter+"/"+deviceName; //No I18N						
							}
						}
					};
	        graphParams.type = type; // application or protocol
	        graphParams.graphType = 'pie';//No I18N
	        graphParams.fontSize=13;
	        graphParams.hAlign="center";//No I18N
	        graphParams.vAlign="bottom";//No I18N
	        graphParams.legendEnabled = true;
	        graphParams.notContentLeft = true;
	        graphParams.isOpUtilsPie = true;
	        graphParams.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];
	        graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
	        self.set('graphParams',graphParams);//No I18N
    	});
        var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?groupId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=DNS';//No I18N
        if(window.OPM.isCentralServer){
			url = oputilsAppendProbeID(url);
		}
		var sendObj = {};
        var type = 'pie';//No I18N
        var chartData = {};
        chartData.id = 'perfGraph2'+this.get('widgetData').id;//No I18N
        $.getJSON(url,function(response)
		{
	        if(response!=undefined){
	        	chartData.data = response.result;
	        }
	        chartData.type = type; // application or protocol
	        chartData.graphType = 'pie';//No I18N
	        chartData.hAlign="center";//No I18N
	        chartData.vAlign="bottom";//No I18N
	        chartData.legendEnabled = true;
	        chartData.fontSize=13;
	        chartData.notContentLeft = true;
	        chartData.isOpUtilsPie = true;
			// chartData.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];
	        chartData.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
	        self.set('chartData',chartData);//No I18N
	        var array_element = [
	        						{'key':'DNS','value':Ember.I18n.t('opu.views.DNS_STATUS',this),'selected':true},
	        						{'key':'RESERVATION','value':Ember.I18n.t('opu.ipam.dhcp.RESERVED_IPS',this)},
	        						{'key':'AUTHENTICITY','value':Ember.I18n.t('opu.views.AUTHENTICITY_STATUS',this)},
	        						{'key':'NICTYPE','value':Ember.I18n.t('opu.views.NIC_TYPE',this)},
	        						{'key':'DEVICETYPE','value':Ember.I18n.t('opu.views.DEVICE_TYPE',this)},
	        						{'key':'ADSTATUS','value':Ember.I18n.t('opu.ipam.AD_STATUS',this)}
	        					]
	        self.set('array_element',array_element);//No I18N
	        self.set('chartData',chartData);//No I18N
	        if(self.get('widgetData.reloadWidget')!==undefined && self.get('widgetData.reloadWidget')===true){
	            self.set('widgetData.sizey',11); //No I18N
	            self.set('widgetData.noData',false); //No I18N
	            if(graphParams.data.length<=0){
	                self.set('widgetData.sizey',2); //No I18N
	                self.set('widgetData.noData',true); //No I18N
	            }
	            self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
	            self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	        }
	        $('.select2').select2();
    	});
	},
    actions:{
		chartStatus:function(deviceName) {
			var self = this;
			var url = window.OPM.apiUrlPattern + '/ipam/getIPAMSummaryCharts?groupId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart='+($("#chartStatus").val());//No I18N
			if(window.OPM.isCentralServer){
				url = oputilsAppendProbeID(url);
			}
			$.getJSON(url,function(response)
			{
				var sendObj = {};
		        var type = 'pie';//No I18N
		        var chartData = self.chartData;//No I18N
		        chartData.data = response.result;
		        self.set('chartData',chartData);//No I18N
		        opm_loadPieGraph(chartData);
		    });
		},editSupernet:function(){
			var url = window.OPM.apiUrlPattern + '/ipam/getSupernetDetails?supernetId='+OPMClient.InventoryDeviceDetailsController.deviceName;//No I18N
			var subnetdetails = opm_ajaxGetResponse(url);
			OPMClient.InventoryOpUtilsController.supernetDetails=subnetdetails.rows[0];
			if(window.OPM.currentView.name==="Inventory.Device.index"){
				location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditSupernet"; //No I18N
			}else{
				redirectList('OpUtils','EditSupernet');//No I18N
			}
		},deleteSupernet:function(){
			if(confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUPERNET_CONFORM",this))){
				opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/ipam/deleteSupernet", {"supernetId":OPMClient.InventoryDeviceDetailsController.deviceName});//No I18N
				$("#oputree").jstree("select_node","GROUP_0");//No I18N
				if(window.OPM.currentView.name==="Inventory.Device.index"){
					reloadSnapshotPage();
				}
			}
		}
	}
});

OPMClient.OpmOpuBarGraphComponent = Ember.Component.extend({
	templateName: "components/opu-summary-bar-graph", //No I18N
	classNames:['width100'], //No I18N
	didInsertElement: function(){
		var self = this;
		var apiResponse = this.get('widgetData').apiData;
		if(apiResponse.status=="Success"){
			//if(self.snapshotObj.snapType=="IPAMSubnetGroupSummary"){
				apiResponse=apiResponse.result;
			//}
			if(apiResponse.graphData!==undefined && apiResponse.graphData.length!=0)
			{
				var graphParams = {};
				graphParams.id = 'PerfGraph'+this.get('widgetData').id;
				graphParams.data = apiResponse.graphData;
				graphParams.yAxis = apiResponse.yAxis;
				graphParams.graphType = 'bar';//No I18N
				graphParams.datatype_1 = 'ordinal';//No I18N
				graphParams.columnname_1="Subnet";//No I18N
				graphParams.columnname_2="IPs";//No I18N
				graphParams.isOputilsBarChart=true;
				graphParams.axes = { //No I18N	
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"label": { //No I18N	
							"text": "" //No I18N	
						},
						"ticklabel": { //No I18N	
							"rotation":-60
							//"alignMode": "rotate"//No I18N	
						}
					},
					"yaxis": [ //No I18N	
						{
							"label": { //No I18N	
								"text": "Count" //No I18N	
							}
						}
					]
				}
				if(self.snapshotObj.snapType=="IPAMSubnetGroupSummary"){
					graphParams.plot={
						"events" : {//NO I18N
							"cursor":"pointer",
							"click" : function(event, data, chartObj){//No I18N
								OPMClient.InventoryOpUtilsController.set("isBargraph",true);//No I18N
								var filter=(data.data[2].value);
								var subnetId=(data.data[3].value);
								location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/IPs/"+filter+"/"+subnetId; //No I18N						
							}
						}
					};
				}
				graphParams.colors = ["#ee5656","#faad5a","#46bb7d","#3099d0"],
				self.set('graphParams',graphParams); //No I18N
				self.set('widgetData.noData',false); //No I18N
			}
			else
			{
				self.set('widgetData.noData',true); //No I18N
				self.set('widgetData.sizey',2); //No I18N
				self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
				self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			}
			self.set('widgetData.hideExpand',true);//No I18N
			self.set('widgetData.pageCount',apiResponse.total);
			$(".grid-stack").removeClass("ipamGrid");//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});


OPMClient.OpuDatePickerComponent=Ember.Component.extend({
	templateName: "components/opu-date-picker",//NO I18N
	validTillDate:'',
	didInsertElement: function(){
		$('#rogueGuestValidPeriod').datepicker({dateFormat:'yy/mm/dd', minDate: new Date(parseInt(window.OPM.jyear),parseInt(window.OPM.jmon),parseInt(window.OPM.jday))});//No I18N
	},
	validTillDateObserver: function(){
		var data={};
		if(this.validTillDate!=undefined && this.validTillDate!=null){
			var gridID = ("opm_DeviceSnapList"+this.get('widgetData.id')) //No I18N
			var selDevice=getEmberSelectedRows(gridID,'resource-id');
			data.ID=selDevice;
        	var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/rogue/markAsGuest' ,data);//No I18N
        	if(rsp.status=="Success"){
        		opm_infoMsgs("successMsg",rsp.message);//No I18N
        	}else{
        		opm_infoMsgs("errorMsg",rsp.message);//No I18N
        	}
		}
	}.observes('validTillDate')
})

OPMClient.OpmDiscoveredV6SubnetComponent=Ember.Component.extend({
	templateName: "components/opu-discovered-v6Subnet",//NO I18N
	didInsertElement: function(){
		var self = this;
		var response = this.get('widgetData').apiData;
		var countArr;
		var summaryArr = {};
		if(response.result!=undefined){
			countArr=response.result;
			summaryArr.TOTAL_IPS = countArr[4][1];
			summaryArr.USED_IPS = countArr[0][1];
			summaryArr.TRANSIENT_IPS = countArr[1][1]
			summaryArr.AVAILABLE_IPS = countArr[2][1]
			summaryArr.NOT_SCANNED_IPS = countArr[3][1]
			self.set('summaryArr',summaryArr);
			countArr.pop();
		}
		if(summaryArr.TOTAL_IPS==0){
			countArr=[];
		}
		var type = 'pie';//No I18N
        var graphParams = {};
        graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
        graphParams.data = countArr;
        graphParams.type = type; // application or protocol
        graphParams.graphType = 'pie';//No I18N
        graphParams.fontSize=13;
        graphParams.hAlign="center";//No I18N
        graphParams.vAlign="bottom";//No I18N
        graphParams.legendEnabled = true;
        graphParams.notContentLeft = true;
        graphParams.isOpUtilsPie = true;
        graphParams.colorArray= ["#ee5656","#46bb7d","#faad5a","#3099d0"];//No I18N
        graphParams.columns = {datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Label",columnname_2:"Value",timeFormat:'hours'},//No I18N
        self.set('graphParams',graphParams);//No I18N
        self.set('widgetData.hideExpand',true);//No I18N
	}
})


OPMClient.OpmIPAMSwitchGroupSummaryComponent=Ember.Component.extend({
	templateName: "components/ipam-switch-group-summary",//NO I18N
	didInsertElement: function(){
		var jsonData = (this.get('widgetData.apiData'));//NO I18N
		var self = this;
		self.set('summary',{});//NO I18N
		var summary = {};
		var info = jsonData;
		OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=info;
		summary.switchCount = info['switch-count'];
		summary.totalPorts = info['total-count'];//No I18N
		summary.usedPorts = info['used-count'];
		summary.availablePorts = info['available-count'];
		summary.transientPorts = info['transient-count'];
		summary.excludePorts = info['exclude-port-count'];
		summary.portUsage = info.percentage;
		self.set('summary',summary);//NO I18N
		self.set('widgetData.hideExpand',true);//NO I18N
		
		$.getJSON(window.OPM.apiUrlPattern + '/spm/getSPMSummaryCharts?groupId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=AVAILABILITY',function(jsonData)  //No I18N
        {         
            OPMClient.InventoryOpUtilsController.subFilterObj=jsonData.result;
            var availability = []
            $.each(jsonData.result, function(i,obj)
            {
                var label = obj[0]; 
    			var value = obj[1]; 
    			var status = obj[2];
    			if(status === "available"){//No I18N
    				status = 5;
    			}else if(status === "used"){//No I18N
    				status = 1;
    			}else if(status === "transient"){//No I18N
    				status = 2;
    			}
                availability.push({title:label,value:value,status:status});
            });
            OpUtilsDialGraph(availability,ipamSeverityColors,'Total Ports','MainSeverityChart-4');//No I18N 
        });

        $.getJSON(window.OPM.apiUrlPattern + '/spm/getSPMSummaryCharts?groupId='+OPMClient.InventoryDeviceDetailsController.deviceName+'&chart=VENDORTYPE',function(jsonData)  //No I18N
        {         
            OPMClient.InventoryOpUtilsController.subFilterObj=jsonData.result;
            var availability = []
            $.each(jsonData.result, function(i,obj)
            {
                var label = obj[0]; 
    			var value = obj[1]; 
    			var status = obj[2];
                availability.push({title:label,value:value,status:status});
            });
            OPMClient.InventoryOpUtilsController.set('switchVendorData',availability);
            OpUtilsDialGraph(availability,ipamSeverityColors,Ember.I18n.t('webclient.map.totaldevices', this),'MainSeverityChart-5');//No I18N 
        });
	}
});

OPMClient.OpmOpuGridComponent = Ember.Component.extend({
	templateName: "components/opm-grid",
	didInsertElement: function(){
		OPMClient.InventoryOpUtilsController.viewType.mapView="Grid";//No I18N
		var self = this;
		var response = this.get('widgetData').apiData;
		var snapDetails = this.get('widgetData');
		var dObj={};
		var sortName="";
		var sortOrder="";
		if(self.get('widgetData.name') === "opu.ipam.dhcpscope"){
            opm_customTooltip();
        }
		var gridCallBack = function(gridID,paramsObj){
			$(".DIA-Content").unbind('scroll');//No I18N
			if(paramsObj!==undefined && paramsObj.self!=undefined){
				OPMClient.InventoryOpUtilsController.dnsOnSelectFunc = paramsObj.onSelectFunction;
				OPMClient.InventoryOpUtilsController.dnsPageMsg = paramsObj.self.snapshotObj.message;
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+14)/(paramsObj.self.snapshotObj.snapDetails.yScale+14));
				if(cellCount <= 6){
					cellCount=12;
				}
				cellCount=cellCount+9;
				if(OPMClient.InventoryDeviceDetailsController.subFilterType==="Switches"){
					cellCount=cellCount+8;
				}
				if(snapDetails.name === "ipam.switch.ports" && (OPMClient.InventoryDeviceDetailsController.inventorysnapType != "IPAMSwitchGroup" || OPMClient.InventoryDeviceDetailsController.inventorysnapType != "IPAMSwitch")){
					paramsObj.self.set('widgetData.sizey',$(window).height()+30);
					$("#inventoryGridStyle").addClass("fullWidth");
				}else{
					paramsObj.self.set('widgetData.sizey',cellCount);
				}
				if(paramsObj.self.get('widgetData.name') === "opu.ipam.dhcpscope"){
					opm_customTooltip();
				}
				opUtilsIPToolTip();
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);
			}
			var screenSize = $('html').width();
			if(screenSize <= 1600){
			    $('.ipamGrid .opm_jqGridUI').on('DOMMouseScroll mousewheel', '.ui-jqgrid-view', function(event) {//No I18N
					var delta = 0;
					 if (event.originalEvent.detail) {
						delta = -event.originalEvent.detail;  // Firefox
					} else if (event.originalEvent.wheelDelta) {
						delta = event.originalEvent.wheelDelta;  // Chrome, Safari, Edge
					} else if (event.originalEvent.deltaY) {
						delta = -event.originalEvent.deltaY;  // For modern browsers (Chrome, Safari, Firefox, etc.)
					}
					var navPosition = $('#nav').position();//No I18N
					var $this = $(this);
					var scrollTop = $this.scrollTop();
					// var scrollHeight = $this[0].scrollHeight;
					// var height = $this.height();
					// if (scrollTop + height >= scrollHeight) {
					// 	return;
					// }
					if (delta > 0) {
						if(scrollTop < navPosition.top){
							$('.opUtilsSnapShotPageAside .DI-Content').css({
								'height':'auto',
								'-webkit-transform':'translateY(0px)',
								'-ms-transform':'translateY(0px)',
								'transform':'translateY(0px)'
							});
							$('html').css({
								'height':'100%',
								'-webkit-transform':'translateY(0px)',
								'-ms-transform':'translateY(0px)',
								'transform':'translateY(0px)'
							});
							$('.DIA-Content').addClass("scrollHideMenu");//No I18N
						}
					} else if (delta < 0) {
						if(scrollTop > navPosition.top){
							$('.opUtilsSnapShotPageAside .DI-Content').css({
								'height':'-webkit-calc(100% + 40px)',
								'height':'calc(100% + 40px)',
								'-webkit-transform':'translateY(-76px)',
								'-ms-transform':'translateY(-76px)',
								'transform':'translateY(-76px)'
							});
							$('html').css({
								'height':'-webkit-calc(100% + ' + navPosition.top + 'px)',
								'height':'calc(100% + ' + navPosition.top + 'px)',
								'-webkit-transform':'translateY(-' + navPosition.top + 'px)',
								'-ms-transform':'translateY(-' + navPosition.top + 'px)',
								'transform':'translateY(-' + navPosition.top + 'px)'
							});
							$('.DIA-Content').removeClass("scrollHideMenu");//No I18N
						}
					}
				});
			}
		};
		var col = validateGridColumnDetails(snapDetails.snapshotData.colModelList,snapDetails.snapshotData.colNamesList)
		var defaultOptions={
				isSnapshotGrid: true,
				snapId: snapDetails.id,
				snapIndex:snapDetails.snapIndex
			};
		// defaultOptions.snapId=snapDetails.id;
		defaultOptions.minRowsPerPage = 50;
		defaultOptions.pagination = true;
		defaultOptions.gridCallBack=gridCallBack;
		defaultOptions.multiselect=true;
		defaultOptions.enableColChooser = false;
        defaultOptions.enableTopColChooser = false;
		self.set('widgetData.hideExpand',true);//No I18N
		defaultOptions.shrinkToFit=false;
		defaultOptions.autoWidth=true;
		defaultOptions.showAll = false;
		defaultOptions.showPagerColumnChooser=false;
		var url = opm_getSnapApiURL(this.get('widgetData'),this.get('snapshotObj'),this.get('additionalProps'));
		var id = snapDetails.gridTableId;
		if (OPMClient.InventoryOpUtilsController.dnsOnSelectFunc === "ipam_dnsList") {//No I18N
			getMicrosoftDNSServersList();
		}

		if(snapDetails.name ==="opu.ipam.DNS_Records" && OPMClient.InventoryOpUtilsController.dnsZoneFilterReload!=""){
            url+=OPMClient.InventoryOpUtilsController.dnsZoneFilterReload;
            OPMClient.InventoryOpUtilsController.set('dnsZoneFilterReload',"")
        }
		if(snapDetails.name ==="opu.ipam.dhcpipaddress" && OPMClient.InventoryOpUtilsController.dhcpFilterReload!=""){
            url+=OPMClient.InventoryOpUtilsController.dhcpFilterReload;
            OPMClient.InventoryOpUtilsController.set('dhcpFilterReload',"")
        }
		if(snapDetails.name ==="ipam.IPV6Group.subnetlist" || snapDetails.name ==="ipam.subnet.v6.ips" || snapDetails.name ==="ipam.group.ips" || snapDetails.name ==="ipam.IPV6.subnet.history" || snapDetails.name === "ipam.group.IPV6.history" || snapDetails.name === "ipam.group.v6.ips" ||snapDetails.name === "ipam.iphistory" || snapDetails.name === "ipam.subnet.ips" || snapDetails.name==="ipam.subnet.history" || snapDetails.name==="ipam.subnetlist" || snapDetails.name==="ipam.subnetlist2" ||snapDetails.name === "ipam.subnetlist1" ||snapDetails.name === "ipam.DHCPSummary"){//No I18N
			defaultOptions.shrinkToFit=false;
			defaultOptions.autoWidth=true;
		}
		if(snapDetails.name==="opu.ipam.dhcpipaddress" || snapDetails.name ==="opu.ipam.dhcpscope" || snapDetails.name==="opu.ipam.dhcp.macfilter"|| snapDetails.name ==="ipam.IPV6Group.subnetlist" || snapDetails.name==="ipam.subnet.global.v6" || snapDetails.name==="ipam.subnet.local.v6" || snapDetails.name==="ipam.group.ips" || snapDetails.name==="ipam.subnet.ips" || snapDetails.name==="ipam.subnet.alarms" || snapDetails.name==="ipam.subnet.history" ||snapDetails.name==="ipam.subnetlist" || snapDetails.name==="ipam.subnetlist1" || snapDetails.name==="ipam.subnetlist2" ||snapDetails.name === "ipam.iphistory" || snapDetails.name === "ipam.ipalerts" ||snapDetails.name ==="ipam.subnet.v6.ips" || snapDetails.name ==="ipam.IPV6.subnet.history" || snapDetails.name === "ipam.DiscoveredSubnets" || snapDetails.name === "ipam.group.IPV6.history" || snapDetails.name === "ipam.group.v6.ips"|| snapDetails.name==="opu.ipam.dhcp.policy" || snapDetails.name==="opu.ipam.dhcp.superscope"){
			defaultOptions.showAll = false;
		}
		if(snapDetails.name==="ipam.iphistory" || snapDetails.name==="ipam.subnet.history" || snapDetails.name==="ipam.subnet.global.v6" || snapDetails.name==="ipam.subnet.local.v6"){
			defaultOptions.multiselect = false;
		}
		if(snapDetails.name==="ipam.iphistory" ||snapDetails.name==="ipam.subnet.history"||snapDetails.name==="ipam.switch.list1" || snapDetails.name === "ipam.switch.ports" || snapDetails.name === "ipam.group.ips" || snapDetails.name === "ipam.subnet.ips" || snapDetails.name==="ipam.subnetlist" || snapDetails.name==="ipam.subnetlist1"||snapDetails.name==="opu.ipam.dhcpipaddress" || snapDetails.name==="opu.ipam.dhcp.macfilter"||snapDetails.name==="ipam.DHCPSummary"||snapDetails.name==="ipam.subnet.global.v6"||snapDetails.name==="ipam.subnet.local.v6"||snapDetails.name==="ipam.IPV6Group.subnetlist"|| snapDetails.name==="opu.ipam.dhcp.policy" || snapDetails.name==="opu.ipam.dhcp.superscope" || snapDetails.name==="opu.ipam.dhcpscope"){
			defaultOptions.minRowsPerPage = 50;
			defaultOptions.showAll = false;
			self.set('widgetData.hideExpand',true);//No I18N
			defaultOptions.pagination = true;
            defaultOptions.shrinkToFit = false;
            defaultOptions.showPagerColumnChooser=false;
            defaultOptions.snapId=snapDetails.snapid;
            defaultOptions.autoWidth=true;
			if(snapDetails.name !== "ipam.iphistory" && snapDetails.name !== "ipam.subnet.history" && snapDetails.name !== "opu.ipam.dhcp.superscope"){
				defaultOptions.enableColChooser = true;
				defaultOptions.enableTopColChooser = true;
			}
            defaultOptions.pagerId="#opm_DeviceSnapPager"+snapDetails.snapid;
            if(snapDetails.name==="ipam.switch.list1"){
            	sortName='switch-name';//No I18N
			}
			if(snapDetails.name === "ipam.switch.ports"){
				sortName='connected-port-ifindex';//No I18N
			}
			if(snapDetails.name === "ipam.subnet.ips"){
	            sortName='ip-address';//No I18N
			}
		}
		if(snapDetails.name==="ipam.iphistory" ||snapDetails.name==="ipam.subnet.history" || snapDetails.name==="ipam.ipalerts"||snapDetails.name=="ipam.subnet.alarms"||snapDetails.name=="ipam.switch.alarms"){
			sortName = "generated-time"; //No I18N
            sortOrder = "desc"; //No I18N
		}
		if(snapDetails.name=="ipam.switch.history"){
			sortName = "detected-time"; //No I18N
			sortOrder = "desc"; //No I18N
		}
		if(snapDetails.name==="ipam.subnetlist" || snapDetails.name==="ipam.subnetlist1"){
            defaultOptions.gridTableId = "OpUtils_Subnets";//No I18N
																																											//Value mismatch from server to client (5changed to 4) (0changed to 00 as API didnt accept 0 value)
            var oputilsScanStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";2:"+Ember.I18n.t('opu.common.SCANNED',true)+";1:"+Ember.I18n.t('opu.common.IN_PROGRESS',true)+";4:"+Ember.I18n.t('opu.common.WAITING_QUE',true)+";00:"+Ember.I18n.t('opu.common.NOT_STARTED',true);//NO I18N
			col.colModelList[5].searchoptions={value:oputilsScanStatus,defaultValue: ""}; //No I18n
			col.colModelList[4].search=false; //No I18n
			var forecastingStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";true:"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+";false:"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
			$.each(col.colModelList, function(i, colModelObj){
				if(colModelObj.name === "isforecastenabled"){
					col.colModelList[i].searchoptions={value:forecastingStatus,defaultValue: ""}; //No I18n
					return false;
				}
			});
			//adding custom columns
			var customColTable = "SubnetLevelCustomField";//NO I18N
            var customCols = getOpUtilsCustomColumns(customColTable);
            if(customCols.length>0){
	            $.each(customCols, function (i,col)
	            {
	                if(!(snapDetails.snapshotData.colNamesList.includes(col))){
		                snapDetails.snapshotData.colNamesList.push(col);
		                snapDetails.snapshotData.colModelList.push({name: col, index: col});
	            	}
	            });
	        }
		}

		if(snapDetails.name==="opu.ipam.dhcpipaddress"){
			defaultOptions.gridTableId = "OpUtils_DHCPIPaddress";//No I18N
		        var oputilsDHCPStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";false:"+Ember.I18n.t('opu.common.NOT_RESERVED',true)+";true:"+Ember.I18n.t('opu.ipam.dhcp.RESERVED_IPS',true);//NO I18N
                        var oputilsIPstatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opu.views.USED',true)+";2:"+Ember.I18n.t('opu.views.TRANSIENT',true)+";3:"+Ember.I18n.t('opu.views.AVAILABLE',true);//NO I18N
		        col.colModelList[5].searchoptions={value:oputilsIPstatus,defaultValue: ""}; //No I18n
                        col.colModelList[8].searchoptions={value:oputilsDHCPStatus,defaultValue: ""}; //No I18n
		}
		if(snapDetails.name==="opu.ipam.dhcp.macfilter"){
			defaultOptions.gridTableId = "OpUtils_DHCPFilters";//No I18N
		}
		if(snapDetails.name==="opu.ipam.dhcp.superscope"){
		    defaultOptions.multiselect = false;
			defaultOptions.gridTableId = "OpUtils_DHCPSuperscopes";//No I18N
			if(snapDetails.name==="opu.ipam.dhcp.superscope" && !window.OPM.userPermissions.ipamWrite){
                setHiddenColumn(col.colModelList,['actions'],true); //No I18n
            }
		}
        if(snapDetails.name==="opu.ipam.dhcp.policy"){
            defaultOptions.multiselect = false;
            defaultOptions.gridTableId = "OpUtils_DHCPPolicies";//No I18N
            var policyStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opstor.inventory.active',true)+";2:"+Ember.I18n.t('webclient.nfa.inventory.inactive',true);//NO I18N
            var policyAssign = ":"+Ember.I18n.t('opu.common.ALL', this)+";Scope:"+Ember.I18n.t('webclient.mailserver.oauth.scope',true)+";Global:"+Ember.I18n.t('webclient.nfa.global',true);//NO I18N
            col.colModelList[2].searchoptions={value:policyStatus,defaultValue: ""}; //No I18n
            col.colModelList[3].searchoptions={value:policyAssign,defaultValue: ""}; //No I18n
            if(snapDetails.name==="opu.ipam.dhcp.policy" && !window.OPM.userPermissions.ipamWrite){
                setHiddenColumn(col.colModelList,['actions'],true); //No I18n
            }
        }
		if(snapDetails.name==="ipam.DHCPSummary"){
			defaultOptions.gridTableId = "OpUtils_DHCPSummary";//No I18N
			var oputilsScanStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";2:"+Ember.I18n.t('opu.common.SCANNED',true)+";1:"+Ember.I18n.t('opu.common.IN_PROGRESS',true)+";3:"+Ember.I18n.t('ipsla.failed',true)+";4:"+Ember.I18n.t('opu.common.WAITING_QUE',true)+";5:"+Ember.I18n.t('opu.common.Apply_Credentials',true);//NO I18N
                        col.colModelList[11].searchoptions={value:oputilsScanStatus,defaultValue: ""}; //No I18n
			var oputilsAuthenticityStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('webclient.discovery.success.discovered',true)+";2:"+Ember.I18n.t('opu.common.TRUSTED',true)+";3:"+Ember.I18n.t('opu.tools.ROGUE',true);//NO I18N
			col.colModelList[13].searchoptions={value:oputilsAuthenticityStatus,defaultValue: ""}; //No I18n
		}
		if(snapDetails.name==="ipam.subnet.global.v6"){
			defaultOptions.gridTableId = "OpUtils_GlobalV6Subnets";//No I18N
		}
		if(snapDetails.name==="ipam.subnet.local.v6"){
			defaultOptions.gridTableId = "OpUtils_LocalV6Subnets";//No I18N
		}
		if(snapDetails.name==="ipam.IPV6Group.subnetlist"){
			defaultOptions.gridTableId = "OpUtils_IPV6Group_Subnets";//No I18N
		}
		// if(snapDetails.name==="ipam.iphistory"){
		// 	defaultOptions.gridTableId = "OpUtils_SubnetsGroup_History";//No I18N
		// }
		// if(snapDetails.name==="ipam.subnet.history"){
		// 	defaultOptions.gridTableId = "OpUtils_Subnets_History";//No I18N
		// }
		if(snapDetails.name === "ipam.group.ips" || snapDetails.name === "ipam.subnet.ips"){
			defaultOptions.pagerId="#opm_DeviceSnapPager"+snapDetails.snapid;
            defaultOptions.gridTableId = "OpUtils_IPs";//No I18N
            defaultOptions.enableColChooser = true;
            defaultOptions.showPagerColumnChooser=false;
            defaultOptions.snapId=snapDetails.snapid;
            defaultOptions.enableTopColChooser = true;
			var oputilsTypeStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opu.common.static',true)+";2:"+Ember.I18n.t('opu.common.dynamic',true);//NO I18N
            var oputilsIPstatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opu.views.USED',true)+";2:"+Ember.I18n.t('opu.views.TRANSIENT',true)+";3:"+Ember.I18n.t('opu.views.AVAILABLE',true);//NO I18N
            var oputilsIPDNSStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('webclient.devices.details.service.resalert',true)+";2:"+Ember.I18n.t('opu.chart.REVERSE_LOOKUP_FAILED',true)+";3:"+Ember.I18n.t('opu.chart.FORWARD_LOOKUP_FAILED',true)+";4:"+Ember.I18n.t('opu.chart.FORWARD_LOOKUP_MISMATCH',true)+";5:"+Ember.I18n.t('fwa.compliance.compSuccessMsg',true);//NO I18N
			var oputilsReservedIPstatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opu.common.NOT_RESERVED',true)+";3:"+Ember.I18n.t('opu.ipam.RESERVED_STATIC_IPs',true);//NO I18N
            var oputilsAuth = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('webclient.discovery.success.discovered',true)+";2:"+Ember.I18n.t('opu.common.TRUSTED',true)+";4:"+Ember.I18n.t('opu.common.GUEST',true)+";3:"+Ember.I18n.t('opu.tools.ROGUE',true);//NO I18N
        	var oputilsDHCPStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";false:"+Ember.I18n.t('opu.common.NOT_RESERVED',true)+";true:"+Ember.I18n.t('opu.ipam.dhcp.RESERVED_IPS',true);//NO I18N
			col.colModelList[3].searchoptions={value:oputilsTypeStatus,defaultValue: ""}; //No I18n
			col.colModelList[7].searchoptions={value:oputilsIPDNSStatus,defaultValue: ""}; //No I18n
            col.colModelList[9].searchoptions={value:oputilsIPstatus,defaultValue: ""}; //No I18n
            col.colModelList[8].searchoptions={value:oputilsReservedIPstatus,defaultValue: ""}; //No I18n
			col.colModelList[14].searchoptions={value:oputilsAuth,defaultValue: ""}; //No I18n
            col.colModelList[17].searchoptions={value:oputilsDHCPStatus,defaultValue: ""}; //No I18n
			// Hiding logged on user for Linux user.
			if(!window.OPM.isWindows){
				col.colModelList[13].hidden=true;
				col.colModelList[13].hidedlg=true;
			}
            //adding custom columns
			var customColTable = "IPAMIPLevelCustomField";//NO I18N
            var customCols = getOpUtilsCustomColumns(customColTable);
            if(customCols.length>0){
	            $.each(customCols, function (i,col)
	            {
	                if(!(snapDetails.snapshotData.colNamesList.includes(col))){
		                snapDetails.snapshotData.colNamesList.push(col);
		                snapDetails.snapshotData.colModelList.push({name: col, index: col});
	            	}
	            });
	        }
		}
		if(snapDetails.name==="opu.ipam.DNS_Zones"){
            var isAwsDns = false;
            var isGcpDns = false;
            try { isAwsDns = !!OPMClient.InventoryOpUtilsController.get('isAwsDnsServer'); } catch(e) {}//No I18N
            try { isGcpDns = !!OPMClient.InventoryOpUtilsController.get('isGcpDnsServer'); } catch(e) {}//No I18N

            var dnsZoneType;
            if(isAwsDns){
                dnsZoneType = ":"+Ember.I18n.t('opu.common.ALL', this)+";Public:"+Ember.I18n.t('webclient.slack.slackChannelsPublic',true)+";Private:"+Ember.I18n.t('webclient.common.private',true);//NO I18N
            } else if(isGcpDns){
                dnsZoneType = ":"+Ember.I18n.t('opu.common.ALL', this)+";Public:"+Ember.I18n.t('webclient.slack.slackChannelsPublic',true)+";Private:"+Ember.I18n.t('webclient.common.private',true)+";Forwarding:"+Ember.I18n.t('opu.ipam.forwarding',true)+";Peering:"+Ember.I18n.t('opu.dns.peering',true)+";ReverseLookup:"+Ember.I18n.t('opu.ipam.dns.reverse_lookup',true);//NO I18N
            } else {
                dnsZoneType = ":"+Ember.I18n.t('opu.common.ALL', this)+";Primary:"+Ember.I18n.t('webclient.Primary',true)+";Secondary:"+Ember.I18n.t('nfa.common.secondary',true)+";Stub:"+Ember.I18n.t('opu.dns.stub',true);//NO I18N
            }
            var dnsLookupType = ":"+Ember.I18n.t('opu.common.ALL', this)+";Forward:"+Ember.I18n.t('opu.ipam.dns.forward',true)+";Reverse:"+Ember.I18n.t('opu.ipam.dns.reverse',true);//NO I18N
            var dnsZoneStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";true:"+Ember.I18n.t('jsp.commonstr.Running',true)+";false:"+Ember.I18n.t('opu.ipam.dns.zone.paused',true);//NO I18N
            var dnsDynamicUpdate = ":"+Ember.I18n.t('opu.common.ALL', this)+";None:"+Ember.I18n.t('webclient.admin.devices.None',true)+";Secure:"+Ember.I18n.t('webclient.admin.settings.secrec.secure',true)+";NonsecureAndSecure:"+Ember.I18n.t('opu.ipam.dns.NonsecureAndSecure',true);//NO I18N
            setSearchOptionsByColName(col.colModelList, 'dns-zone-type', dnsZoneType);//No I18N
            setSearchOptionsByColName(col.colModelList, 'dns-zone-look-up-type', dnsLookupType);//No I18N
            setSearchOptionsByColName(col.colModelList, 'dns-zone-isactive', dnsZoneStatus);//No I18N
            setSearchOptionsByColName(col.colModelList, 'dns-zone-dynamic-update', dnsDynamicUpdate);//No I18N
            if(isAwsDns || isGcpDns){
                setHiddenColumn(col.colModelList, ['dns-zone-look-up-type', 'dns-zone-dynamic-update' , 'dns-zone-isactive'], true);//No I18N
            }
            if(!window.OPM.isOputilsDDIManagement){
                setHiddenColumn(col.colModelList, ['action'], true);//No I18N
            }
        }
        if(snapDetails.name==="opu.ipam.DNS_Records"){
            var isAwsDnsRec = false;
            var isGcpDnsRec = false;
            try { isAwsDnsRec = !!OPMClient.InventoryOpUtilsController.get('isAwsDnsServer'); } catch(e) {}//No I18N
            try { isGcpDnsRec = !!OPMClient.InventoryOpUtilsController.get('isGcpDnsServer'); } catch(e) {}//No I18N
            if(isAwsDnsRec || isGcpDnsRec){
                setHiddenColumn(col.colModelList, ['dns-record-timestamp'], true);//No I18N
            }
            if(!window.OPM.isOputilsDDIManagement){
                setHiddenColumn(col.colModelList, ['action'], true);//No I18N
            }
        }
		if(snapDetails.name === "opu.ipam.dhcpscope" && !window.OPM.isOputilsDDIManagement){
		    setHiddenColumn(col.colModelList, ['actions'], true);//No I18N
		}
        if(snapDetails.name==="opu.ipam.dhcp.superscope" && !window.OPM.isOputilsDDIManagement){
            col.colModelList[6].hidden=true;
            col.colModelList[6].hidedlg=true;
        }
		if(snapDetails.name === "ipam.switch.ports"){
            defaultOptions.gridTableId = "OpUtils_SnapShot_Ports";//No I18N

            //adding custom columns
			var customColTable = "SPMPortLevelCustomField";//NO I18N
            var customCols = getOpUtilsCustomColumns(customColTable);
            if(customCols.length>0){
	            $.each(customCols, function (i,col)
	            {
	                if(!(snapDetails.snapshotData.colNamesList.includes(col))){
		                snapDetails.snapshotData.colNamesList.push(col);
		                snapDetails.snapshotData.colModelList.push({name: col, index: col});
	            	}
	            });
	        }
            var oputilsPortstatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('opu.views.USED',true)+";3:"+Ember.I18n.t('opu.views.TRANSIENT',true)+";2:"+Ember.I18n.t('opu.views.AVAILABLE',true);//NO I18N
			var oputilsStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";1:"+Ember.I18n.t('webclient.devices.intftypes.up',true)+";2:"+Ember.I18n.t('webclient.devices.intftypes.down',true);//NO I18N
            setSearchOptionsByColName(col.colModelList, 'scan-status', oputilsPortstatus);//No I18N
            setSearchOptionsByColName(col.colModelList, 'operational-status', oputilsStatus);//No I18N
            setSearchOptionsByColName(col.colModelList, 'admin-status', oputilsStatus);//No I18N
			// Hiding logged on user for Linux user.
			if(!window.OPM.isWindows){
				col.colModelList[24].hidden=true;
				col.colModelList[24].hidedlg=true;
			}

			if(OPMClient.InventoryDeviceDetailsController != undefined && OPMClient.InventoryDeviceDetailsController.inventorysnapType != undefined && OPMClient.InventoryDeviceDetailsController.inventorysnapType != "" && OPMClient.InventoryDeviceDetailsController.inventorysnapType == 'MonitoringDevice'){
				getCredentials(false,true);
			}
		}
		if(snapDetails.name==="switch.list" || snapDetails.name==="ipam.switch.list1"){
			defaultOptions.gridTableId = "OpUtils_Switches";//No I18N
			var oputilsScanStatus = ":"+Ember.I18n.t('opu.common.ALL', this)+";2:"+Ember.I18n.t('opu.common.SCANNED',true)+";1:"+Ember.I18n.t('opu.common.IN_PROGRESS',true)+";6:"+Ember.I18n.t('opu.common.WAITING_QUE',true)+";3:"+Ember.I18n.t('ipsla.failed',true);//NO I18N
	        setSearchOptionsByColName(col.colModelList, 'scan-status', oputilsScanStatus);//No I18N
            //adding custom columns
			var customColTable = "SPMSwitchLevelCustomField";//NO I18N
            var customCols = getOpUtilsCustomColumns(customColTable);
            if(customCols.length>0){
	            $.each(customCols, function (i,col)
	            {
	                if(!(snapDetails.snapshotData.colNamesList.includes(col))){
		                snapDetails.snapshotData.colNamesList.push(col);
		                snapDetails.snapshotData.colModelList.push({name: col, index: col});
	            	}
	            });
	        }
		}
		if(snapDetails.name==="opu.ipam.DNS_SERVERS" ||snapDetails.name==="opu.ipam.DNS_Records" || snapDetails.name==="opu.ipam.DNS_Zones" || snapDetails.name==="opu.ipam.DNS_Alerts"){ //No I18N
            defaultOptions.multiselect=false;
        }
		defaultOptions.savePagination = true;
		if(defaultOptions.gridTableId == null){
			defaultOptions.gridTableId = snapDetails.name.replaceAll('.','_');
		}
		dObj = {
        	"id":"#opm_DeviceSnapList"+snapDetails.snapid,//No I18N
        	"gridId":"opm_DeviceSnapList"+snapDetails.snapid,//No I18N
            "apiUrl":url,//No I18N
            "colNamesList":col.colNamesList,//No I18N
            "colModelList":col.colModelList,//No I18N
            "pagerId":"opm_DeviceSnapPager"+snapDetails.snapid,//No I18N
            "defaultOptions":defaultOptions,
            "toggleSearch":true,//No I18N
            "onSelectFunction":snapDetails.snapshotData.onselectfunction,//No I18N
            "searchOption":true,//No I18N
            "shrinkToFit":false,//No I18N
            "toggleSearch":true,//No I18N
            "autoencode":true,//No I18N
            "self":self,
            "enableColChooser": defaultOptions.enableColChooser,
            "enableTopColChooser":defaultOptions.enableTopColChooser,
            "gridTableId":defaultOptions.gridTableId,
            "showPagerColumnChooser":defaultOptions.showPagerColumnChooser,
            "sortName":sortName?sortName:undefined,
			"sortOrder":sortOrder?sortOrder:"asc"
        };

        if(snapDetails.name === "ipam.subnet.ips" || snapDetails.name==="ipam.group.ips"){
			var markAs=([{value: '--', label: Ember.I18n.t('webclient.admin.re.selaction',this),group:""},//No I18N
					   {value: 'UnReserved', label: Ember.I18n.t('opu.common.NOT_RESERVED',this), group: Ember.I18n.t('opu.views.RESERVED_STATUS',this)},//No I18N
					   {value: 'Reserved', label: Ember.I18n.t('opu.ipam.RESERVED_STATICIP',this), group: Ember.I18n.t('opu.views.RESERVED_STATUS',this)}, //No I18N
					   {value: 'Used', label: Ember.I18n.t('opu.views.USED',this), group: Ember.I18n.t('opu.ipam.IP_AVAILABILITY',this)}, //No I18N
					   {value: 'Available', label: Ember.I18n.t('opu.views.AVAILABLE',this), group: Ember.I18n.t('opu.ipam.IP_AVAILABILITY',this)}, //No I18N
					   {value: 'Transient', label: Ember.I18n.t('opu.views.TRANSIENT',this), group: Ember.I18n.t('opu.ipam.IP_AVAILABILITY',this)},//No I18N
					   {value: 'Trusted', label: Ember.I18n.t('opu.common.TRUSTED',this), group: Ember.I18n.t('opu.views.AUTHENTICITY',this)}, //No I18N
					   {value: 'Rogue', label: Ember.I18n.t('opu.tools.ROGUE',this), group: Ember.I18n.t('opu.views.AUTHENTICITY',this)}, //No I18N
					   {value: 'Guest', label: Ember.I18n.t('opu.common.GUEST',this), group: Ember.I18n.t('opu.views.AUTHENTICITY',this)}]);//No I18N

			if (window.OPM.userPermissions.rougueDetectionWrite == undefined || (window.OPM.userPermissions!= undefined && window.OPM.userPermissions.rougueDetectionWrite == false) ) {
              var toRemove = { Trusted: true, Rogue: true, Guest: true };
              markAs = markAs.filter(function (opt) { return !toRemove[opt.value]; });
            }
			self.set('widgetData.markAs',[]) //No I18N
			self.set('widgetData.markAs',markAs) //No I18N

		}
        self.set('widgetData.gridDataArray',dObj);
        self.set('showGrid',true);
        if(snapDetails.name === "ipam.DiscoveredSubnets" && OPMClient.InventoryDeviceDetailsController.subnetCount === "0"){
        	self.set('showGrid',false);
        	self.set('showDiscoveredSubnetsKB',true);
        	$('#exportCSVIcon').parent().hide();
        }
		if((snapDetails.name==="opu.ipam.dhcp.macfilter" || snapDetails.name==="opu.ipam.dhcp.policy" || snapDetails.name==="opu.ipam.dhcp.superscope") && !window.OPM.isOputilsDDIManagement ){
			self.set('showGrid',false);
			self.set('showDHCPManagementLicenseError',true);
			$('#exportCSVIcon').parent().hide();
		}
        if(snapDetails.name === "opu.ipam.dhcpscope"){
            opm_customTooltip();
            defaultOptions.hideCSV=true;
            defaultOptions.hideExcel=true;
            defaultOptions.Search = false;
            defaultOptions.savePagination = true;
            defaultOptions.gridTableId = "OpUtils_DHCPScope";//No I18N
            var oputilsScopeState = ":"+Ember.I18n.t('opu.common.ALL', this)+";"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+";"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
            snapDetails.snapshotData.colModelList[6].searchoptions={value:oputilsScopeState,defaultValue: ""}; //No I18n
			var oputilsForecastState = ":"+Ember.I18n.t('opu.common.ALL', this)+";true:"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+";false:"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
			setSearchOptionsByColName(snapDetails.snapshotData.colModelList, 'isforecastenabled', oputilsForecastState);//No I18N
			var dhcpServerData = self.get('snapshotObj.rows')[0];
            if(dhcpServerData != undefined){
                var scopeCount = dhcpServerData['total-scopes-count']; //No I18N
                if(scopeCount == "0" || scopeCount == "" || scopeCount =="-"){
                    var dhcpServerType = dhcpServerData['server-type-int'];//No I18N
                    var dhcpScanStatus = dhcpServerData['scan-status-int'];//No I18N
                    if( dhcpServerType == 1 && dhcpScanStatus !== '5'){//No I18N
                        self.set('showGrid',false);
                        self.set('showScopeNoDataAlert',true); //No I18N
                        $('#exportCSVIcon').parent().hide();
                    }
                    else if(dhcpScanStatus === '5'){//No I18N
                        self.set('showGrid',false);
                        self.set('showAppliedCredentialsKB',true);//No I18N
                        $('#exportCSVIcon').parent().hide();
                    }
                }
            }
            if(OPMClient.InventoryOpUtilsController.dhcpServerTypeInt == null || OPMClient.InventoryOpUtilsController.dhcpServerTypeInt == undefined || OPMClient.InventoryOpUtilsController.dhcpServerTypeInt !== '1' || !window.OPM.userPermissions.ipamWrite){
                setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true); //No I18n
            }
            if(OPMClient.InventoryOpUtilsController.dhcpServerTypeInt !== '6' ){
                setHiddenColumn(snapDetails.snapshotData.colModelList,['dhcp-network'],true); //No I18n
            }
		}

        self.set('isOputilsGrid',true);
        self.set('isRemoteOputilsGrid',true);
       	self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);
		self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
		if(!this.get('snapshotObj.snapDetails.fullView')){
			self.set("opushowQuickLinks",false);
			if(OPMClient.InventoryDeviceDetailsController.pageName=="IPAM"){
				OPMClient.ApplicationController.set("helpCardPageName","OpUtilsIPAM");
			}else if(OPMClient.InventoryDeviceDetailsController.pageName=="SPM"){
				OPMClient.ApplicationController.set("helpCardPageName","OpUtilsSPM");
			}
			OPMClient.ApplicationController.set("showHelpCard",true);
		}else{
			$("#quicklinks").remove();
			self.set("opushowQuickLinks",false);
			OPMClient.ApplicationController.set("showHelpCard",false);
		}
		if(snapDetails.name==="ipam.switch.list1" || snapDetails.name === "ipam.switch.ports"){
        	self.set('isRemoteOputilsGrid',false);
        	// self.set("opushowQuickLinks",false);
        }
	},
	actions:
	{
	  	subChildActions: function(functionType, functionName)
	  	{
	  		this.sendAction('action',functionType,functionName);
	  	}
	},

	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		$("#inventoryGridStyle").removeClass("fullWidth");
		if (document.querySelector('.opUtilsSnapShotPageAside .DI-Content')) {
			$('.opUtilsSnapShotPageAside .DI-Content').css({
				'height':'auto',
				'-webkit-transform':'translateY(0px)',
				'-ms-transform':'translateY(0px)',
				'transform':'translateY(0px)'
			});
		}
	}
})


OPMClient.OpuSnapshotHeaderComponent = Ember.Component.extend({
	templateName: "components/opu-snapshot-header",
	didInsertElement: function(){

	},
	actions:
	{
	  	changeSnapshot: function()
	  	{
	  		redirectToSnapshot("IPAMSubnet",$("#subnetArray").val());
	  	}
	}
})
