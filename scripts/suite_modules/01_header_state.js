/**
 * ManageEngine OpManager Central (Version 12.9.203 GA Build 129203)
 * Authentic Enterprise Suite for Zoho ITOM Ember Framework
 * 100% Identical Replica: Official Logo, Multi-Tab Device Snapshot,
 * Rich Enterprise Dashboard Widgets, Inventory Bulk Actions & Pagination,
 * Alarms Severity Dials, 3D Rack & STP Maps, NCM Diff Viewer & Agent Downloads.
 */
(function() {
  'use strict';

  // --- GLOBAL STATE ---
  const state = {
    currentTab: 'dashboard',
    subTabs: {
      dashboard: 'overview',
      inventory: 'devices',
      alarms: 'active',
      maps: 'business',
      configuration: 'compliance',
      reports: 'sla',
      settings: 'probes'
    },
    selectedProbe: 'all',
    inventoryFilter: 'all',
    searchQuery: '',
    autoRefreshInterval: 30,
    autoRefreshCountdown: 30,
    addedWidgets: [],
    configDriftFixed: false,
    selectedAlarm: null,
    selectedDeviceCheckboxCount: 0,
    alarmsSeverityFilter: 'all',
    alarmsCategoryFilter: 'all',
    alarmsViewMode: 'list',
    nocDarkMode: false,
    syncCountdown: 15,
    devices: [
      { id: 1, name: 'DXB-CORE-SW-01', ip: '10.40.1.1', category: 'Switches', type: 'Cisco Catalyst 9500-48Y4C', vendor: 'Cisco Systems', probe: 'Dubai Campus Core', probeId: 4, status: 'Critical', cpu: 93.4, memory: 94.1, disk: 42.0, temp: 48, responseTime: 18, availability: '98.5%', serial: 'FCW2349L09X', osVersion: 'Cisco IOS-XE 17.09.04a', lastBackup: '2 hours ago', interfaces: [
        { name: 'TenGigabitEthernet1/0/1', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 420.5, outTraffic: 380.2, errors: 0 },
        { name: 'TenGigabitEthernet1/0/2', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 390.1, outTraffic: 310.4, errors: 0 },
        { name: 'FortyGigabitEthernet1/0/48', admin: 'UP', oper: 'DOWN', speed: '40 Gbps', inTraffic: 0.0, outTraffic: 0.0, errors: 14 }
      ]},
      { id: 2, name: 'NY-DB-PROD-SQL', ip: '10.10.3.50', category: 'Servers', type: 'Dell PowerEdge R750 (PostgreSQL Cluster)', vendor: 'Dell Enterprise', probe: 'New York Data Center', probeId: 1, status: 'Trouble', cpu: 79.2, memory: 81.0, disk: 91.2, temp: 24, responseTime: 12, availability: '99.8%', serial: '8K2M193', osVersion: 'Red Hat Enterprise Linux 9.2', lastBackup: '1 hour ago', interfaces: [
        { name: 'eth0 (Public)', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 820.4, outTraffic: 760.1, errors: 0 },
        { name: 'eth1 (Storage Heartbeat)', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 120.0, outTraffic: 115.3, errors: 0 }
      ]},
      { id: 3, name: 'DXB-ARUBA-WLC-01', ip: '10.40.2.10', category: 'Wireless', type: 'Aruba 7210 Mobility Controller', vendor: 'Aruba Networks', probe: 'Dubai Campus Core', probeId: 4, status: 'Trouble', cpu: 62.1, memory: 58.4, disk: 28.0, temp: 36, responseTime: 74, availability: '99.4%', serial: 'CN9388102', osVersion: 'ArubaOS 8.10.0.7', lastBackup: '4 hours ago', interfaces: [
        { name: 'GE0/0/0', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 110.2, outTraffic: 94.5, errors: 2 },
        { name: 'GE0/0/1', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 95.0, outTraffic: 88.2, errors: 0 }
      ]},
      { id: 4, name: 'NY-PA-FW-01', ip: '10.10.0.1', category: 'Firewalls', type: 'Palo Alto PA-5250 Next-Gen FW', vendor: 'Palo Alto Networks', probe: 'New York Data Center', probeId: 1, status: 'Attention', cpu: 52.8, memory: 61.2, disk: 34.0, temp: 31, responseTime: 11, availability: '99.9%', serial: '012901004822', osVersion: 'PAN-OS 10.2.6', lastBackup: 'Yesterday', interfaces: [
        { name: 'ethernet1/1 (WAN Untrust)', admin: 'UP', oper: 'UP', speed: '40 Gbps', inTraffic: 2400.0, outTraffic: 1890.0, errors: 0 },
        { name: 'ethernet1/2 (LAN Trust)', admin: 'UP', oper: 'UP', speed: '40 Gbps', inTraffic: 1890.0, outTraffic: 2400.0, errors: 0 }
      ]},
      { id: 5, name: 'DXB-APC-UPS-01', ip: '10.40.9.5', category: 'Storage', type: 'Schneider Galaxy 3500 40kVA UPS', vendor: 'Schneider / APC', probe: 'Dubai Campus Core', probeId: 4, status: 'Attention', cpu: 18.0, memory: 22.0, disk: 10.0, temp: 32, responseTime: 19, availability: '99.9%', serial: 'APC8392109', osVersion: 'AOS v6.9.6', lastBackup: '3 days ago', interfaces: [
        { name: 'Management Card Interface', admin: 'UP', oper: 'UP', speed: '100 Mbps', inTraffic: 0.8, outTraffic: 1.2, errors: 0 }
      ]},
      { id: 6, name: 'LON-DIST-SW-01', ip: '10.20.1.2', category: 'Switches', type: 'HP ProCurve 5406R zl2 Switch', vendor: 'HP Enterprise', probe: 'London Branch Office', probeId: 2, status: 'Attention', cpu: 64.5, memory: 82.1, disk: 38.0, temp: 35, responseTime: 29, availability: '99.7%', serial: 'SG48291039', osVersion: 'HP ArubaOS-S 16.10', lastBackup: '5 hours ago', interfaces: [
        { name: 'A1-Trunk1', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 540.0, outTraffic: 480.0, errors: 0 }
      ]},
      { id: 7, name: 'NY-CORE-RTR-01', ip: '10.10.1.1', category: 'Routers', type: 'Cisco ASR 9006 Core Aggregation', vendor: 'Cisco Systems', probe: 'New York Data Center', probeId: 1, status: 'Clear', cpu: 44.2, memory: 55.4, disk: 30.0, temp: 28, responseTime: 10, availability: '100.0%', serial: 'FOX1938201', osVersion: 'Cisco IOS-XR 7.3.2', lastBackup: '6 hours ago', interfaces: [
        { name: 'TenGigE0/0/0/0', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 1200.0, outTraffic: 980.0, errors: 0 }
      ]},
      { id: 8, name: 'NY-NEXUS-SW-01', ip: '10.10.2.1', category: 'Switches', type: 'Cisco Nexus 93180YC-FX', vendor: 'Cisco Systems', probe: 'New York Data Center', probeId: 1, status: 'Clear', cpu: 38.0, memory: 46.5, disk: 25.0, temp: 26, responseTime: 12, availability: '100.0%', serial: 'SAL2019481', osVersion: 'Cisco NX-OS 9.3(8)', lastBackup: '12 hours ago', interfaces: [
        { name: 'Ethernet1/1', admin: 'UP', oper: 'UP', speed: '25 Gbps', inTraffic: 1450.0, outTraffic: 1100.0, errors: 0 }
      ]},
      { id: 9, name: 'LON-CORE-RTR-01', ip: '10.20.1.1', category: 'Routers', type: 'Cisco ISR 4451-X Security Router', vendor: 'Cisco Systems', probe: 'London Branch Office', probeId: 2, status: 'Clear', cpu: 36.4, memory: 42.0, disk: 22.0, temp: 29, responseTime: 28, availability: '100.0%', serial: 'FOC2019381', osVersion: 'Cisco IOS-XE 17.06.01', lastBackup: '18 hours ago', interfaces: [
        { name: 'GigabitEthernet0/0/0', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 480.0, outTraffic: 420.0, errors: 0 }
      ]},
      { id: 10, name: 'LON-FTNT-FW-01', ip: '10.20.0.1', category: 'Firewalls', type: 'Fortinet FortiGate 600E', vendor: 'Fortinet', probe: 'London Branch Office', probeId: 2, status: 'Clear', cpu: 41.2, memory: 52.0, disk: 29.0, temp: 31, responseTime: 27, availability: '100.0%', serial: 'FG600E190281', osVersion: 'FortiOS 7.2.4', lastBackup: '1 day ago', interfaces: [
        { name: 'port1 (WAN)', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 620.0, outTraffic: 510.0, errors: 0 }
      ]},
      { id: 11, name: 'LON-MAIL-EXCH-01', ip: '10.20.3.10', category: 'Servers', type: 'VMware ESXi 8.0 Cluster (Exchange)', vendor: 'VMware Inc', probe: 'London Branch Office', probeId: 2, status: 'Clear', cpu: 39.5, memory: 58.0, disk: 64.0, temp: 23, responseTime: 30, availability: '100.0%', serial: 'VMW-LON-001', osVersion: 'VMware ESXi 8.0 Update 1', lastBackup: '4 hours ago', interfaces: [
        { name: 'vmnic0', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 310.0, outTraffic: 290.0, errors: 0 }
      ]},
      { id: 12, name: 'SG-VPNGW-RTR-01', ip: '10.30.1.1', category: 'Routers', type: 'Juniper MX204 3D Edge Router', vendor: 'Juniper Networks', probe: 'Singapore Cloud VPC', probeId: 3, status: 'Clear', cpu: 28.5, memory: 38.0, disk: 20.0, temp: 25, responseTime: 44, availability: '100.0%', serial: 'JN19284019', osVersion: 'Junos OS 21.4R2', lastBackup: '2 days ago', interfaces: [
        { name: 'ge-0/0/0', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 580.0, outTraffic: 520.0, errors: 0 }
      ]},
      { id: 13, name: 'SG-LEAF-SW-01', ip: '10.30.2.1', category: 'Switches', type: 'Arista 7050SX3-48YC8 Leaf', vendor: 'Arista Networks', probe: 'Singapore Cloud VPC', probeId: 3, status: 'Clear', cpu: 32.0, memory: 44.0, disk: 22.0, temp: 27, responseTime: 46, availability: '100.0%', serial: 'JPE1928401', osVersion: 'Arista EOS 4.28.1F', lastBackup: '1 day ago', interfaces: [
        { name: 'Ethernet1', admin: 'UP', oper: 'UP', speed: '25 Gbps', inTraffic: 720.0, outTraffic: 690.0, errors: 0 }
      ]},
      { id: 14, name: 'SG-K8S-MSTR-01', ip: '10.30.4.10', category: 'Servers', type: 'Ubuntu 22.04 LTS (K8s Control Plane)', vendor: 'Canonical', probe: 'Singapore Cloud VPC', probeId: 3, status: 'Clear', cpu: 46.0, memory: 62.0, disk: 48.0, temp: 22, responseTime: 45, availability: '100.0%', serial: 'K8S-SG-01', osVersion: 'Ubuntu 22.04.2 LTS / K8s v1.27', lastBackup: '3 hours ago', interfaces: [
        { name: 'ens3', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 410.0, outTraffic: 390.0, errors: 0 }
      ]},
      { id: 15, name: 'SG-APP-SRV-01', ip: '10.30.4.20', category: 'Servers', type: 'Ubuntu 22.04 LTS (API Gateway Cluster)', vendor: 'Canonical', probe: 'Singapore Cloud VPC', probeId: 3, status: 'Clear', cpu: 48.1, memory: 54.0, disk: 44.0, temp: 22, responseTime: 45, availability: '100.0%', serial: 'K8S-SG-02', osVersion: 'Ubuntu 22.04.2 LTS', lastBackup: '5 hours ago', interfaces: [
        { name: 'ens3', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 490.0, outTraffic: 440.0, errors: 0 }
      ]},
      { id: 16, name: 'DXB-EDGE-RTR-01', ip: '10.40.1.254', category: 'Routers', type: 'Cisco ASR 1001-X WAN Gateway', vendor: 'Cisco Systems', probe: 'Dubai Campus Core', probeId: 4, status: 'Clear', cpu: 32.8, memory: 41.5, disk: 26.0, temp: 34, responseTime: 17, availability: '100.0%', serial: 'FXS19284019', osVersion: 'Cisco IOS-XE 17.03.04', lastBackup: '1 day ago', interfaces: [
        { name: 'GigabitEthernet0/0/0', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 310.0, outTraffic: 290.0, errors: 0 }
      ]}
    ],
    probes: [
      { id: 1, name: 'New York Data Center', ip: '10.10.0.1', status: 'Online', latency: 12, devices: 4, devicesCount: 4, alarms: 2, alarmsCount: 2, syncStatus: 'Synchronized', lastSync: '2s ago', location: 'New York, US - Equinix NY4', commPort: 8060, flag: 'US' },
      { id: 2, name: 'London Branch Office', ip: '10.20.0.1', status: 'Online', latency: 28, devices: 4, devicesCount: 4, alarms: 1, alarmsCount: 1, syncStatus: 'Synchronized', lastSync: '3s ago', location: 'London, UK - Telehouse North', commPort: 8060, flag: 'UK' },
      { id: 3, name: 'Singapore Cloud VPC', ip: '10.30.0.1', status: 'Online', latency: 45, devices: 4, devicesCount: 4, alarms: 0, alarmsCount: 0, syncStatus: 'Synchronized', lastSync: '1s ago', location: 'Singapore - Equinix SG1', commPort: 8060, flag: 'SG' },
      { id: 4, name: 'Dubai Campus Core', ip: '10.40.0.1', status: 'Online', latency: 18, devices: 4, devicesCount: 4, alarms: 4, alarmsCount: 4, syncStatus: 'Synchronized', lastSync: 'Just now', location: 'Dubai, UAE - DIC Datacenter', commPort: 8060, flag: 'AE' }
    ],
    alarms: [
      { id: 'alm_801', device: 'DXB-CORE-SW-01', ip: '10.40.1.1', severity: 'Critical', message: 'CPU utilization exceeded Critical threshold (>90%): Current is 93.4%. Memory is 94.1%. Fan 2 RPM warning reported.', entity: 'CPU & Memory Threshold', category: 'Switch', probe: 'Dubai Campus Core', probeId: 4, time: '2 mins ago', technician: 'Unacknowledged', lastNote: 'Spike observed during scheduled automated backup flow.' },
      { id: 'alm_802', device: 'DXB-CORE-SW-01', ip: '10.40.1.1', severity: 'Critical', message: 'FortyGigabitEthernet1/0/48 link status is DOWN (Core Uplink to Edge)', entity: 'Interface FortyGigabitEthernet1/0/48', category: 'Switch', probe: 'Dubai Campus Core', probeId: 4, time: '3 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_803', device: 'NY-DB-PROD-SQL', ip: '10.10.3.50', severity: 'Trouble', message: 'Disk partition /var/lib/postgresql is 91.2% full (Threshold: 85%)', entity: 'Disk Volume /var/lib/postgresql', category: 'Server', probe: 'New York Data Center', probeId: 1, time: '4 mins ago', technician: 'admin@opmanager', lastNote: 'DBA team notified to archive old audit tables.' },
      { id: 'alm_804', device: 'DXB-ARUBA-WLC-01', ip: '10.40.2.10', severity: 'Trouble', message: 'Average response time high (74 ms), 2% packet loss detected between Dubai Probe and Controller', entity: 'Ping Response Time', category: 'Wireless', probe: 'Dubai Campus Core', probeId: 4, time: '5 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_805', device: 'NY-PA-FW-01', ip: '10.10.0.1', severity: 'Attention', message: 'Interface ethernet1/1 (WAN Untrust) bandwidth utilization at 78.4% (Threshold: 75%)', entity: 'Interface ethernet1/1', category: 'Firewall', probe: 'New York Data Center', probeId: 1, time: '6 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_806', device: 'LON-DIST-SW-01', ip: '10.20.1.2', severity: 'Attention', message: 'Memory utilization at 82.1% (Threshold: 80%). LSASS process active consumption.', entity: 'System Memory', category: 'Switch', probe: 'London Branch Office', probeId: 2, time: '8 mins ago', technician: 'johndoe', lastNote: 'Investigating morning domain synchronization traffic.' },
      { id: 'alm_807', device: 'DXB-APC-UPS-01', ip: '10.40.9.5', severity: 'Attention', message: 'UPS Battery Runtime below 45 minutes (Current: 42 mins, Load: 58%).', entity: 'Battery Health Monitor', category: 'Storage', probe: 'Dubai Campus Core', probeId: 4, time: '10 mins ago', technician: 'Unacknowledged', lastNote: '-' }
    ],
    topInterfaces: [
      { name: 'FortyGigabitEthernet1/0/48 (Core Uplink)', device: 'DXB-CORE-SW-01', probe: 'Dubai Campus Core', speed: '40 Gbps', inTraffic: 1840, outTraffic: 1280, inPercent: 78.5, outPercent: 62.0, status: 'DOWN', errors: 14 },
      { name: 'TenGigE0/0/0/0 (Spine Aggregation)', device: 'NY-CORE-RTR-01', probe: 'New York Data Center', speed: '10 Gbps', inTraffic: 1200, outTraffic: 980, inPercent: 64.2, outPercent: 52.4, status: 'UP', errors: 0 },
      { name: 'Ethernet1/1 (Fabric Interconnect)', device: 'NY-NEXUS-SW-01', probe: 'New York Data Center', speed: '25 Gbps', inTraffic: 1450, outTraffic: 1100, inPercent: 58.0, outPercent: 44.0, status: 'UP', errors: 0 },
      { name: 'ethernet1/1 (WAN Untrust Transit)', device: 'NY-PA-FW-01', probe: 'New York Data Center', speed: '40 Gbps', inTraffic: 2400, outTraffic: 1890, inPercent: 78.4, outPercent: 61.2, status: 'UP', errors: 0 },
      { name: 'eth0 (Primary Public Database)', device: 'NY-DB-PROD-SQL', probe: 'New York Data Center', speed: '10 Gbps', inTraffic: 820, outTraffic: 760, inPercent: 82.0, outPercent: 76.0, status: 'UP', errors: 0 },
      { name: 'ge-0/0/0 (IPSec VPN Hub Link)', device: 'SG-VPNGW-RTR-01', probe: 'Singapore Cloud VPC', speed: '10 Gbps', inTraffic: 580, outTraffic: 520, inPercent: 58.0, outPercent: 52.0, status: 'UP', errors: 0 },
      { name: 'A1-Trunk1 (Building Aggregation)', device: 'LON-DIST-SW-01', probe: 'London Branch Office', speed: '10 Gbps', inTraffic: 540, outTraffic: 480, inPercent: 54.0, outPercent: 48.0, status: 'UP', errors: 0 },
      { name: 'port1 (Corporate Internet Transit)', device: 'LON-FTNT-FW-01', probe: 'London Branch Office', speed: '10 Gbps', inTraffic: 620, outTraffic: 510, inPercent: 62.0, outPercent: 51.0, status: 'UP', errors: 0 },
      { name: 'Ethernet1 (Spine-Leaf Fabric)', device: 'SG-LEAF-SW-01', probe: 'Singapore Cloud VPC', speed: '25 Gbps', inTraffic: 720, outTraffic: 690, inPercent: 28.8, outPercent: 27.6, status: 'UP', errors: 0 },
      { name: 'ens3 (Ingress K8s Gateway)', device: 'SG-K8S-MSTR-01', probe: 'Singapore Cloud VPC', speed: '10 Gbps', inTraffic: 410, outTraffic: 390, inPercent: 41.0, outPercent: 39.0, status: 'UP', errors: 0 }
    ],
    diskVolumes: [
      { partition: '/var/lib/postgresql', device: 'NY-DB-PROD-SQL', total: '500 GB', used: '456 GB', free: '44 GB', percent: 91.2, status: 'Trouble' },
      { partition: 'C:\\ (System OS)', device: 'LON-MAIL-EXCH-01', total: '250 GB', used: '155 GB', free: '95 GB', percent: 62.0, status: 'Clear' },
      { partition: '/ (Root Volume)', device: 'SG-K8S-MSTR-01', total: '200 GB', used: '96 GB', free: '104 GB', percent: 48.0, status: 'Clear' },
      { partition: 'D:\\Data (Postgres Arch)', device: 'NY-DB-PROD-SQL', total: '1.2 TB', used: '912 GB', free: '288 GB', percent: 76.0, status: 'Attention' }
    ]
  };
  state.interfaces = state.topInterfaces;

  // Helper Toast Notification
  function showToast(message, type = 'success') {
    let toast = document.getElementById('opm-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'opm-live-toast';
      toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 100000; padding: 12px 20px; border-radius: 4px; font-family: Roboto, -apple-system, sans-serif; font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 8px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);';
      document.body.appendChild(toast);
    }
    if (type === 'success') {
      toast.style.background = '#15803d';
      toast.style.color = '#ffffff';
      toast.innerHTML = '<span style="font-size: 15px;">✓</span> ' + message;
    } else {
      toast.style.background = '#b91c1c';
      toast.style.color = '#ffffff';
      toast.innerHTML = '<span style="font-size: 15px;">⚠</span> ' + message;
    }
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3200);
  }

  // Ensure Global Reset Styles (Eliminates fluidicv2 50px body padding & bg-1.jpg texture)
  function ensureGlobalStyles() {
    if (!document.getElementById('opm-fluidicv3-reset')) {
      const style = document.createElement('style');
      style.id = 'opm-fluidicv3-reset';
      style.textContent = `
        html, body, body.NavText, body.NavHovered {
          margin: 0 !important;
          padding: 0 !important;
          background: #f4f6f9 !important;
          background-image: none !important;
          width: 100% !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
        }
        #header, #nav, #PageSideBar, #main-nav .sub-main-nav,
        .web-alarm-notification, .notification-popup, .alarm-popup-container {
          display: none !important;
        }
        #main-header {
          margin: 0 !important;
          width: 100% !important;
        }
        #main-header .logo-section .relative,
        #main-header #main-nav .main-nav > ul > li > a.nav-link .submenu-icon,
        #main-header #main-nav .main-nav > ul > li > a.nav-link::after,
        #main-header #main-nav > ul > li > a.nav-link .submenu-icon,
        #main-header #main-nav > ul > li > a.nav-link::after {
          display: none !important;
        }
        #main-header #main-nav .main-nav > ul > li > a.nav-link,
        #main-header #main-nav > ul > li > a.nav-link {
          padding: 0.65rem 1.25rem !important;
        }
        .opm-widget-card {
          border-radius: 3px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important;
        }
        .opm-widget-card > div:first-child {
          background: #f5f5f5 !important;
          border-bottom: 1px solid #e8e8e8 !important;
          padding: 10px 14px !important;
        }
        @keyframes opmPacketFlow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        
        /* NOC Wallboard Dark Theme */
        body.opm-noc-dark,
        body.opm-noc-dark #opm-custom-suite-container {
          background: #090d16 !important;
          color: #e2e8f0 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar {
          background: #0d1322 !important;
          border-color: #1e293b !important;
          color: #94a3b8 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar a {
          color: #38bdf8 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar span {
          color: #94a3b8 !important;
        }
        body.opm-noc-dark #opm-live-server-clock {
          color: #cbd5e1 !important;
        }
        body.opm-noc-dark .opm-widget-card {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #e2e8f0 !important;
        }
        body.opm-noc-dark .opm-widget-card > div:first-child {
          background: #162032 !important;
          border-color: #1f2937 !important;
          color: #f8fafc !important;
        }
        body.opm-noc-dark table thead tr {
          background: #162032 !important;
          color: #94a3b8 !important;
        }
        body.opm-noc-dark table tbody tr {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #cbd5e1 !important;
        }
        body.opm-noc-dark table tbody tr:hover {
          background: #1e293b !important;
        }
        body.opm-noc-dark div[style*="background: #ffffff"],
        body.opm-noc-dark div[style*="background: rgb(255, 255, 255)"],
        body.opm-noc-dark div[style*="background:#ffffff"] {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #cbd5e1 !important;
        }

        .opm-packet-flow {
          animation: opmPacketFlow 1s linear infinite !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
    const uiLib = document.querySelector('.ember-ui-library');
    if (uiLib && !uiLib.classList.contains('itom-theme')) {
      uiLib.classList.add('itom-theme');
    }
    if (document.body) {
      document.body.style.setProperty('padding', '0px', 'important');
      document.body.style.setProperty('margin', '0px', 'important');
      document.body.style.setProperty('background', '#f4f6f9', 'important');
      document.body.style.setProperty('background-image', 'none', 'important');
    }
  }

  // Ensure Overlay Container (placed cleanly beneath #main-header)
  function ensureOverlayContainer() {
    ensureGlobalStyles();
    syncHeaderTabs(state.currentTab);
    let container = document.getElementById('opm-custom-suite-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'opm-custom-suite-container';
      container.style.cssText = 'width: 100%; min-height: calc(100vh - 88px); padding-bottom: 28px; background: #f4f6f9; display: block; overflow-x: hidden;';
    }

    // Ensure Authentic ManageEngine Fixed Bottom Status Bar (24px Footer)
    let statusBar = document.getElementById('opm-bottom-status-bar');
    if (!statusBar && document.body) {
      statusBar = document.createElement('div');
      statusBar.id = 'opm-bottom-status-bar';
      statusBar.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; height: 24px; background: #212121; border-top: 1px solid #334155; color: #cbd5e1; z-index: 9990; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; box-sizing: border-box; font-family: Lato, Roboto, sans-serif; font-size: 11px;';
      statusBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 5px; color: #ffffff; font-weight: 700;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #49bd80; display: inline-block;"></span>
            ManageEngine OpManager Central v12.9.203 (Build 129203 • 64-Bit)
          </span>
          <span style="color: #475569;">|</span>
          <span>Central Server: <strong style="color: #49bd80;">Primary Active (10.0.0.10:8060)</strong></span>
          <span style="color: #475569;">|</span>
          <span>Remote Probes: <strong style="color: #38bdf8;">4 / 4 Online</strong></span>
          <span style="color: #475569;">|</span>
          <span>Monitored Assets: <strong>16 Devices • 48 Interfaces</strong></span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span id="opm-footer-zia-btn" style="cursor: pointer; color: #a78bfa; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" title="Launch Ask Zia AI Assistant">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Ask Zia AI
          </span>
          <span style="color: #475569;">•</span>
          <span id="opm-footer-mib-btn" style="cursor: pointer; color: #cbd5e1;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">SNMP MIB Browser</span>
          <span style="color: #475569;">•</span>
          <a href="/noc" target="_blank" style="color: #cbd5e1; text-decoration: none;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">NOC Wallboard ↗</a>
          <span style="color: #475569;">•</span>
          <a href="/apiclient/fluidicv3/itom/pages/log-viewer.html?file=opmanager_server.log" target="_blank" style="color: #cbd5e1; text-decoration: none;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">Log Viewer ↗</a>
          <span style="color: #475569;">•</span>
          <span id="opm-footer-logs-btn" style="cursor: pointer; color: #cbd5e1;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">Support &amp; Logs</span>
          <span style="color: #475569;">|</span>
          <span style="color: #49bd80; font-weight: 600;">● Live Telemetry Socket</span>
        </div>
      `;
      document.body.appendChild(statusBar);
      const fZia = statusBar.querySelector('#opm-footer-zia-btn');
      if (fZia) fZia.onclick = () => { if (typeof showZiaAssistantModal === 'function') showZiaAssistantModal(); };
      const fMib = statusBar.querySelector('#opm-footer-mib-btn');
      if (fMib) fMib.onclick = () => { if (typeof showNetworkToolsModal === 'function') showNetworkToolsModal(null, 'mib'); };
      const fLogs = statusBar.querySelector('#opm-footer-logs-btn');
      if (fLogs) fLogs.onclick = () => { state.subTabs.settings = 'support'; window.location.hash = '#/settings'; };
    }

    const pageContainer = document.querySelector('.page-container');
    if (pageContainer && pageContainer.parentNode) {
      if (container.parentNode !== pageContainer.parentNode || container.nextSibling !== pageContainer) {
        pageContainer.parentNode.insertBefore(container, pageContainer);
      }
      pageContainer.style.display = 'none';
    } else {
      const header = document.getElementById('main-header');
      if (header && header.parentNode) {
        if (container.parentNode !== header.parentNode || container.previousSibling !== header) {
          header.parentNode.insertBefore(container, header.nextSibling);
        }
      } else if (!container.parentNode) {
        document.body.appendChild(container);
      }
    }
    return container;
  }

  
  // --- AUTHENTIC BREADCRUMBS, SERVER CLOCK & NOC DARK THEME ENGINE ---
  let clockInterval = null;
  function initClockAndTimers() {
    if (clockInterval) return;
    const updateTime = () => {
      const clockEl = document.getElementById('opm-live-server-clock');
      if (clockEl) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const dateStr = `${pad(now.getUTCDate())}-${months[now.getUTCMonth()]}-${now.getUTCFullYear()}`;
        const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
        clockEl.innerText = `UTC ${dateStr} ${timeStr}`;
      }
      const syncEl = document.getElementById('opm-live-sync-countdown');
      if (syncEl) {
        if (typeof state.syncCountdown === 'undefined' || isNaN(state.syncCountdown)) state.syncCountdown = 15;
        state.syncCountdown--;
        if (state.syncCountdown <= 0) {
          state.syncCountdown = 15;
          syncEl.style.color = '#16a34a';
          setTimeout(() => { if (syncEl) syncEl.style.color = '#0284c7'; }, 800);
        }
        syncEl.innerText = state.syncCountdown + 's';
      }
    };
    updateTime();
    clockInterval = setInterval(updateTime, 1000);
  }

  function applyNocDarkTheme(isDark) {
    if (isDark) {
      document.body.classList.add('opm-noc-dark');
      const toggleBtn = document.getElementById('opm-subnav-theme-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<span>☀️</span> <span>Fluidic Light</span>';
        toggleBtn.style.background = '#49bd80';
        toggleBtn.style.color = '#ffffff';
        toggleBtn.style.borderColor = '#3ca66d';
      }
    } else {
      document.body.classList.remove('opm-noc-dark');
      const toggleBtn = document.getElementById('opm-subnav-theme-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<span>🌙</span> <span>NOC Dark</span>';
        toggleBtn.style.background = '#1e293b';
        toggleBtn.style.color = '#f8fafc';
        toggleBtn.style.borderColor = '#334155';
      }
    }
  }

  function toggleNocDarkMode(force) {
    state.nocDarkMode = typeof force === 'boolean' ? force : !state.nocDarkMode;
    try {
      localStorage.setItem('opm_noc_dark_mode', state.nocDarkMode ? 'true' : 'false');
    } catch (e) {}
    applyNocDarkTheme(state.nocDarkMode);
    showToast(state.nocDarkMode ? 'NOC Dark Operations Theme enabled.' : 'Fluidic v3 Light Theme enabled.');
  }

  function ensureSubnavBreadcrumbsBar() {
    let bar = document.getElementById('opm-header-subnav-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'opm-header-subnav-bar';
      bar.style.cssText = 'width: 100%; height: 38px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; box-sizing: border-box; font-family: Roboto, -apple-system, sans-serif; font-size: 12px; z-index: 100; transition: background 0.2s, border 0.2s;';
      bar.innerHTML = `
        <div id="opm-breadcrumbs-container" style="display: flex; align-items: center; gap: 8px;">
          <a href="#/dashboard" style="color: #0070e0; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <span style="color: #94a3b8;">›</span>
          <span id="opm-crumb-tab" style="color: #475569; font-weight: 600; text-transform: capitalize;">Dashboard</span>
          <span id="opm-crumb-separator" style="color: #94a3b8; display: none;">›</span>
          <span id="opm-crumb-subtab" style="color: #0f172a; font-weight: 700; text-transform: capitalize; display: none;"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-family: monospace;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e;"></span>
            <span id="opm-live-server-clock">UTC Server Time</span>
          </div>
          <span style="color: #cbd5e1;">|</span>
          <span style="color: #64748b;" title="Probe Telemetry Sync Heartbeat">Sync in: <strong id="opm-live-sync-countdown" style="color: #0284c7;">15s</strong></span>
          <span style="color: #cbd5e1;">|</span>
          <span style="color: #cbd5e1;">|</span>
          <button id="opm-subnav-sound-toggle" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; color: #334155; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Toggle Critical Alarm Sound Chimes">
            <span id="opm-sound-icon">🔊</span> <span id="opm-sound-text">Chime: ON</span>
          </button>
          <button id="opm-subnav-search-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; color: #334155; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Quick Omnibox Search">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Quick Search <kbd style="background: #e2e8f0; border-radius: 2px; padding: 1px 4px; font-size: 9px; font-family: monospace;">Ctrl+K</kbd>
          </button>
          <span style="color: #cbd5e1;">|</span>
          <button id="opm-subnav-theme-toggle" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Toggle High-Contrast NOC Dark Theme">
            <span id="opm-theme-icon">🌙</span> <span id="opm-theme-text">NOC Dark</span>
          </button>
        </div>
      `;
            const soundBtn = bar.querySelector('#opm-subnav-sound-toggle');
      if (soundBtn) {
        const updateSoundUi = () => {
          const isEnabled = localStorage.getItem('opm_sound_enabled') !== 'false';
          const icon = soundBtn.querySelector('#opm-sound-icon');
          const text = soundBtn.querySelector('#opm-sound-text');
          if (icon && text) {
            icon.innerText = isEnabled ? '🔊' : '🔇';
            text.innerText = isEnabled ? 'Chime: ON' : 'Chime: OFF';
            soundBtn.style.color = isEnabled ? '#166534' : '#64748b';
            soundBtn.style.background = isEnabled ? '#f0fdf4' : '#f8fafc';
          }
        };
        updateSoundUi();
        soundBtn.onclick = () => {
          const current = localStorage.getItem('opm_sound_enabled') !== 'false';
          localStorage.setItem('opm_sound_enabled', current ? 'false' : 'true');
          updateSoundUi();
          if (!current && typeof playAlarmChime === 'function') {
            playAlarmChime();
          }
          showToast(current ? 'Critical alarm audio chimes muted.' : 'Audio alarm chime enabled (880Hz / 1175Hz).');
        };
      }
      const searchBtn = bar.querySelector('#opm-subnav-search-btn');
      if (searchBtn) {
        searchBtn.onclick = () => {
          if (typeof showGlobalSearchModal === 'function') showGlobalSearchModal();
        };
      }
      const themeBtn = bar.querySelector('#opm-subnav-theme-toggle');
      if (themeBtn) {
        themeBtn.onclick = () => {
          toggleNocDarkMode();
        };
      }
    }

    const header = document.getElementById('main-header');
    if (header && header.parentNode) {
      if (bar.parentNode !== header.parentNode || bar.previousSibling !== header) {
        header.parentNode.insertBefore(bar, header.nextSibling);
      }
    } else if (!bar.parentNode && document.body) {
      document.body.appendChild(bar);
    }
    return bar;
  }

  function updateBreadcrumbs(tab, subtab) {
    ensureSubnavBreadcrumbsBar();
    initClockAndTimers();
    const tabEl = document.getElementById('opm-crumb-tab');
    const sepEl = document.getElementById('opm-crumb-separator');
    const subtabEl = document.getElementById('opm-crumb-subtab');
    if (!tabEl) return;

    const titles = {
      'dashboard': 'Dashboard',
      'inventory': 'Inventory',
      'alarms': 'Alarms',
      'maps': 'Maps & Topologies',
      'configuration': 'Configuration (NCM)',
      'reports': 'Reports',
      'settings': 'Settings & Administration'
    };
    tabEl.innerText = titles[tab] || tab;

    if (subtab && subtab !== 'overview' && subtab !== 'devices' && subtab !== 'active' && subtab !== 'business' && subtab !== 'compliance' && subtab !== 'sla' && subtab !== 'probes') {
      const subTitles = {
        'noc': 'NOC Wallboard Carousel',
        'interfaces': 'Network Interfaces',
        'virtualization': 'Virtualization & Hypervisors',
        'firewall_rules': 'Firewall Rules & Policies',
        'storage': 'Storage Systems',
        'all': 'All Historical Alarms',
        'eventlog': 'Windows Event Logs',
        'syslog': 'Syslog Monitor',
        'traps': 'SNMP Trap Viewer',
        'layer2': 'Layer-2 STP Topology',
        'rack': '3D 42U Data Center Rack',
        'floor': '3D Datacenter Floor Plan',
        'world': 'Global Probes WAN World Map',
        'changes': 'Configuration Drift & Backups',
        'baseline': 'Golden Baseline Rules',
        'firmware': 'Firmware & Vulnerability Management',
        'executive': 'Executive Health Summary',
        'bandwidth': '95th Percentile Bandwidth',
        'audit': 'NCM Audit & Drift Report',
        'users': 'User Management & RBAC',
        'discovery': 'Network Discovery Profiles',
        'templates': 'Device Templates (SNMP/CLI)',
        'mail': 'Mail Server (SMTP)',
        'sms': 'SMS & Webhook Gateways',
        'ha': 'High Availability (Failsafe)',
        'license': 'License Management',
        'support': 'Support & Diagnostic Logs'
      };
      if (sepEl) sepEl.style.display = 'inline';
      if (subtabEl) {
        subtabEl.style.display = 'inline';
        subtabEl.innerText = subTitles[subtab] || subtab.replace(/_/g, ' ');
      }
    } else {
      if (sepEl) sepEl.style.display = 'none';
      if (subtabEl) subtabEl.style.display = 'none';
    }
  }


  // Route Resolver
  function resolveTabFromHash() {
    const hash = window.location.hash || '#/dashboard';
    const lower = hash.toLowerCase();
    // Prioritize Settings explicitly so #/settings always resolves to settings view
    if (lower.startsWith('#/settings') || lower === '#/settings' || lower.includes('/settings') || lower.includes('setting') || lower.includes('admin') || lower.includes('probe')) {
      return 'settings';
    }
    if (lower.includes('inventory') || lower.includes('/device') || lower.includes('/interface')) return 'inventory';
    if (lower.includes('alarm')) return 'alarms';
    if (lower.includes('map') || lower.includes('businessview') || lower.includes('rack') || lower.includes('floor')) return 'maps';
    if (lower.includes('configuration') || lower.includes('ncm') || lower.includes('compliance')) return 'configuration';
    if (lower.includes('report')) return 'reports';
    return 'dashboard';
  }

  // Enforce ManageEngine Emerald Green (#49bd80) on Active Tab
  function syncHeaderTabs(activeTab) {
    const tabMap = {
      'dashboard': 'dashboard',
      'inventory': 'inventory',
      'alarms': 'alarm',
      'maps': 'map',
      'configuration': 'configuration',
      'reports': 'report',
      'settings': 'setting'
    };
    const targetKey = tabMap[activeTab] || 'dashboard';

    // First clear all active classes and inline backgrounds across all nav elements
    const allNavElements = document.querySelectorAll('#main-header #main-nav li, #main-header #main-nav a');
    allNavElements.forEach(el => {
      el.classList.remove('active', 'active-menu');
      if (el.closest('.dropdown-nav')) return;
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border-radius', '0px', 'important');
      if (el.tagName === 'A' || el.classList.contains('nav-link')) {
        el.style.removeProperty('font-weight');
        el.style.setProperty('color', '#e2e8f0', 'important');
        const span = el.querySelector('.menu-name');
        if (span) {
          span.style.setProperty('color', '#e2e8f0', 'important');
          span.style.setProperty('background', 'transparent', 'important');
        }
      }
    });

    // Now highlight ONLY the matching top-level tab with uniform #49bd80 emerald green
    const topLinks = document.querySelectorAll('#main-header #main-nav .main-nav > ul > li > a.nav-link, #main-header #main-nav > ul > li > a.nav-link');
    let matched = false;
    topLinks.forEach(link => {
      if (matched) return;
      const nameSpan = link.querySelector('.menu-name') || link;
      const text = (nameSpan.innerText || link.innerText || '').trim().toLowerCase();
      if (text.includes(targetKey)) {
        matched = true;
        link.classList.add('active');
        link.style.setProperty('background', '#49bd80', 'important');
        link.style.setProperty('background-color', '#49bd80', 'important');
        link.style.setProperty('color', '#ffffff', 'important');
        link.style.setProperty('border-radius', '0px', 'important');
        link.style.setProperty('font-weight', '600', 'important');
        if (nameSpan && nameSpan !== link) {
          nameSpan.style.setProperty('color', '#ffffff', 'important');
          nameSpan.style.setProperty('background', 'transparent', 'important');
        }
        if (link.parentElement && link.parentElement.tagName === 'LI') {
          link.parentElement.classList.add('active-menu');
          link.parentElement.style.setProperty('background', '#49bd80', 'important');
          link.parentElement.style.setProperty('background-color', '#49bd80', 'important');
        }
      }
    });
  }

  // SVG Helper Badges
  function getStatusBadge(status) {
    const colors = {
      'Critical': { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
      'Trouble': { bg: '#ffedd5', text: '#9a3412', dot: '#ea580c' },
      'Attention': { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
      'Clear': { bg: '#dcfce7', text: '#166534', dot: '#16a34a' }
    };
    const c = colors[status] || colors['Clear'];
    return `<span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600; font-size: 11px; padding: 2px 7px; border-radius: 3px; background: ${c.bg}; color: ${c.text};"><span style="width: 7px; height: 7px; border-radius: 50%; background: ${c.dot};"></span>${status}</span>`;
  }

  function getVendorBadge(vendor) {
    const map = {
      'Cisco Systems': { text: 'CISCO', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
      'Dell Enterprise': { text: 'DELL', bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
      'Palo Alto Networks': { text: 'PALO ALTO', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
      'Aruba Networks': { text: 'ARUBA', bg: '#fffbeb', color: '#b45309', border: '#fef3c7' },
      'HP Enterprise': { text: 'HP', bg: '#ecfeff', color: '#0e7490', border: '#cffafe' },
      'Fortinet': { text: 'FORTINET', bg: '#fef2f2', color: '#b91c1c', border: '#fee2e2' },
      'VMware Inc': { text: 'VMWARE', bg: '#f8fafc', color: '#334155', border: '#cbd5e1' },
      'Juniper Networks': { text: 'JUNIPER', bg: '#f0fdf4', color: '#15803d', border: '#dcfce7' },
      'Arista Networks': { text: 'ARISTA', bg: '#f1f5f9', color: '#1e293b', border: '#cbd5e1' },
      'Canonical': { text: 'LINUX', bg: '#fff1f2', color: '#be123c', border: '#ffe4e6' },
      'Schneider / APC': { text: 'APC', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
    };
    const b = map[vendor] || { text: 'GENERIC', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    return `<span style="display: inline-block; font-size: 9px; font-weight: 700; background: ${b.bg}; color: ${b.color}; border: 1px solid ${b.border}; padding: 1px 5px; border-radius: 2px; vertical-align: middle; letter-spacing: 0.3px;">${b.text}</span>`;
  }

  function getCategoryIcon(cat) {
    const icons = {
      'Switches': `<img src="/images/businessView/peripherals/lan-connecter.svg" alt="Switch" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#0070e0\\' stroke-width=\\'2\\'><rect x=\\'2\\' y=\\'6\\' width=\\'20\\' height=\\'12\\' rx=\\'2\\'/></svg>'" />`,
      'Routers': `<img src="/images/businessView/peripherals/Router.svg" alt="Router" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#0284c7\\' stroke-width=\\'2\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/></svg>'" />`,
      'Firewalls': `<img src="/images/businessView/peripherals/FireWall.svg" alt="Firewall" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#ea580c\\' stroke-width=\\'2\\'><path d=\\'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\\'/></svg>'" />`,
      'Servers': `<img src="/images/businessView/peripherals/Server.svg" alt="Server" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#16a34a\\' stroke-width=\\'2\\'><rect x=\\'2\\' y=\\'2\\' width=\\'20\\' height=\\'8\\' rx=\\'2\\'/></svg>'" />`,
      'Wireless': `<img src="/images/businessView/peripherals/Cloud.svg" alt="Wireless" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#ca8a04\\' stroke-width=\\'2\\'><path d=\\'M5 12.55a11 11 0 0 1 14.08 0\\'/></svg>'" />`,
      'Storage': `<img src="/images/businessView/peripherals/Rack.svg" alt="Storage" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#9333ea\\' stroke-width=\\'2\\'><ellipse cx=\\'12\\' cy=\\'5\\' rx=\\'9\\' ry=\\'3\\'/></svg>'" />`
    };
    return icons[cat] || icons['Switches'];
  }

  function getDeviceTypeIcon(type, category, size = 18) {
    const t = (type || '').toLowerCase();
    const c = (category || '').toLowerCase();
    let imgName = 'server.png';
    if (t.includes('cisco catalyst') || t.includes('3550') || t.includes('catalyst')) imgName = 'cisco_catalyst_3550.png';
    else if (c.includes('switch') || t.includes('switch') || t.includes('nexus') || t.includes('arista')) imgName = 'switch.png';
    else if (c.includes('router') || t.includes('router') || t.includes('asr') || t.includes('mx') || t.includes('3945')) imgName = 'router.png';
    else if (c.includes('firewall') || t.includes('firewall') || t.includes('palo alto') || t.includes('fortigate') || t.includes('asa')) imgName = 'firewall.png';
    else if (t.includes('windows') || t.includes('win')) imgName = 'windows.png';
    else if (t.includes('linux') || t.includes('ubuntu') || t.includes('rhel') || t.includes('centos') || t.includes('debian')) imgName = 'linux.png';
    else if (t.includes('esx') || t.includes('vmware') || t.includes('vcenter')) imgName = 'esx.png';
    else if (c.includes('storage') || t.includes('san') || t.includes('nas') || t.includes('netapp') || t.includes('dell emc')) imgName = 'storage.png';
    else if (c.includes('power') || c.includes('ups') || t.includes('ups') || t.includes('apc') || t.includes('schneider')) imgName = 'ups.png';
    else if (c.includes('wireless') || t.includes('ap') || t.includes('meraki') || t.includes('wifi') || t.includes('aruba')) imgName = 'wireless.png';
    else if (t.includes('f5') || t.includes('load balancer') || t.includes('citrix') || t.includes('netscaler')) imgName = 'loadbalancer.png';
    else if (t.includes('printer')) imgName = 'printer.png';

    return `<img src="/images/deviceicons/${imgName}" alt="${type || 'Device'}" style="width: ${size}px; height: ${size}px; vertical-align: middle; display: inline-block; object-fit: contain;" onerror="this.src='/images/deviceicons/server.png'" />`;
  }

  // --- OFFICIAL ZOHO ITOM SVG SPEEDOMETER GAUGE ---
  function createSpeedometerGauge(pct, label, deviceName, ip, size = 150) {
    const p = Math.max(0, Math.min(100, pct));
    const cx = 75, cy = 68, r = 48;
    const startAngle = -120, sweep = 240;
    const currentAngle = startAngle + (p / 100) * sweep;

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startDeg, endDeg) {
      const start = polarToCartesian(x, y, radius, endDeg);
      const end = polarToCartesian(x, y, radius, startDeg);
      const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
      return ['M', start.x.toFixed(1), start.y.toFixed(1), 'A', radius, radius, 0, largeArcFlag, 0, end.x.toFixed(1), end.y.toFixed(1)].join(' ');
    }

    const trackD = describeArc(cx, cy, r, -120, 120);
    const valueD = p > 0 ? describeArc(cx, cy, r, -120, Math.min(119.9, currentAngle)) : '';

    const color = p >= 85 ? '#dc2626' : (p >= 70 ? '#ea580c' : (p >= 50 ? '#ca8a04' : '#16a34a'));
    const needleTip = polarToCartesian(cx, cy, r - 6, currentAngle);

    return `
      <div style="display: flex; flex-direction: column; align-items: center; width: ${size}px; padding: 6px; box-sizing: border-box;">
        <svg width="${size}" height="${Math.round(size * 0.75)}" viewBox="0 0 150 115" style="overflow: visible;">
          <!-- Gauge Track -->
          <path d="${trackD}" fill="none" stroke="#e2e8f0" stroke-width="10" stroke-linecap="round" />
          <!-- Ticks -->
          <text x="24" y="92" font-size="7.5" fill="#94a3b8" font-family="monospace">0</text>
          <text x="75" y="14" font-size="7.5" fill="#94a3b8" font-family="monospace" text-anchor="middle">50</text>
          <text x="126" y="92" font-size="7.5" fill="#94a3b8" font-family="monospace" text-anchor="end">100</text>
          <!-- Filled Arc -->
          ${valueD ? `<path d="${valueD}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" />` : ''}
          <!-- Needle Pivot Base -->
          <circle cx="${cx}" cy="${cy}" r="6" fill="#1e293b" />
          <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" />
          <!-- Needle Pointer -->
          <line x1="${cx}" y1="${cy}" x2="${needleTip.x.toFixed(1)}" y2="${needleTip.y.toFixed(1)}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
          <!-- Value Text -->
          <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="Lato, sans-serif" font-size="16" font-weight="800" fill="#0f172a">${p.toFixed(1)}%</text>
          <!-- Metric Label -->
          <text x="${cx}" y="${cy + 35}" text-anchor="middle" font-family="Lato, sans-serif" font-size="10" font-weight="600" fill="#64748b">${label}</text>
        </svg>
        <div style="text-align: center; margin-top: -2px; max-width: 100%;">
          <div style="font-size: 11px; font-weight: 700; color: #0070e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${deviceName}">${deviceName}</div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">${ip}</div>
        </div>
      </div>
    `;
  }

  // --- OFFICIAL ZOHO ITOM SVG DONUT CHART ---
  function createDonutChart(slices, total, size = 150) {
    const cx = size / 2, cy = size / 2, r = (size / 2) - 15;
    const circumference = 2 * Math.PI * r;
    let accumulatedOffset = 0;

    let paths = '';
    slices.forEach(s => {
      const fraction = total > 0 ? (s.count / total) : 0;
      const strokeLength = fraction * circumference;
      const strokeDash = `${strokeLength.toFixed(1)} ${(circumference - strokeLength).toFixed(1)}`;
      const strokeOffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      if (s.count > 0) {
        paths += `
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent"
            stroke="${s.color}" stroke-width="16"
            stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeOffset.toFixed(1)}"
            transform="rotate(-90 ${cx} ${cy})" style="transition: all 0.3s;" />
        `;
      }
    });

    return `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent" stroke="#f1f5f9" stroke-width="16" />
          ${paths}
        </svg>
        <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1;">${total}</span>
          <span style="font-size: 9px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">ALARMS</span>
        </div>
      </div>
    `;
  }

  // --- OFFICIAL ZOHO ITOM SVG SPARKLINE ---
  function createSparkline(data, width = 100, height = 26, strokeColor = '#0070e0') {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const fillD = `M 2,${height} L ${points} L ${width - 2},${height} Z`;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible; display: inline-block; vertical-align: middle;">
        <path d="${fillD}" fill="${strokeColor}" fill-opacity="0.12" />
        <polyline points="${points}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }
