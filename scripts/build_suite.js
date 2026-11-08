const fs = require('fs');
const path = require('path');

const targetPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js';

const parts = [];

// ==========================================
// PART 1: HEADER & STATE
// ==========================================
parts.push(`/**
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
      maps: 'business',
      configuration: 'compliance',
      reports: 'summary',
      settings: 'probes'
    },
    selectedProbe: 'all',
    inventoryFilter: 'all',
    searchQuery: '',
    autoRefreshInterval: 30,
    addedWidgets: [],
    configDriftFixed: false,
    selectedAlarm: null,
    selectedDeviceCheckboxCount: 0,
    alarmsSeverityFilter: 'all',
    alarmsViewMode: 'list', // 'list' or 'table'
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
      { id: 1, name: 'New York Data Center', ip: '10.10.0.1', status: 'Online', latency: 12, devicesCount: 4, alarmsCount: 2, syncStatus: 'Synchronized', lastSync: '2s ago', location: 'New York, US - Equinix NY4', commPort: 8060, flag: 'US' },
      { id: 2, name: 'London Branch Office', ip: '10.20.0.1', status: 'Online', latency: 28, devicesCount: 4, alarmsCount: 1, syncStatus: 'Synchronized', lastSync: '3s ago', location: 'London, UK - Telehouse North', commPort: 8060, flag: 'UK' },
      { id: 3, name: 'Singapore Cloud VPC', ip: '10.30.0.1', status: 'Online', latency: 45, devicesCount: 4, alarmsCount: 0, syncStatus: 'Synchronized', lastSync: '1s ago', location: 'Singapore - Equinix SG1', commPort: 8060, flag: 'SG' },
      { id: 4, name: 'Dubai Campus Core', ip: '10.40.0.1', status: 'Online', latency: 18, devicesCount: 4, alarmsCount: 4, syncStatus: 'Synchronized', lastSync: 'Just now', location: 'Dubai, UAE - DIC Datacenter', commPort: 8060, flag: 'AE' }
    ],
    alarms: [
      { id: 'alm_801', device: 'DXB-CORE-SW-01', severity: 'Critical', message: 'CPU utilization exceeded Critical threshold (>90%): Current is 93.4%. Memory is 94.1%. Fan 2 RPM warning reported.', entity: 'CPU & Memory Threshold', category: 'Switch', probe: 'Dubai Campus Probe', probeId: 4, time: '2 mins ago', technician: 'Unacknowledged', lastNote: 'Spike observed during scheduled automated backup flow.' },
      { id: 'alm_802', device: 'DXB-CORE-SW-01', severity: 'Critical', message: 'FortyGigabitEthernet1/0/48 link status is DOWN (Core Uplink to Edge)', entity: 'Interface FortyGigabitEthernet1/0/48', category: 'Switch', probe: 'Dubai Campus Probe', probeId: 4, time: '3 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_803', device: 'NY-DB-PROD-SQL', severity: 'Trouble', message: 'Disk partition /var/lib/postgresql is 91.2% full (Threshold: 85%)', entity: 'Disk Volume /var/lib/postgresql', category: 'Server', probe: 'New York DC Probe', probeId: 1, time: '4 mins ago', technician: 'admin@opmanager', lastNote: 'DBA team notified to archive old audit tables.' },
      { id: 'alm_804', device: 'DXB-ARUBA-WLC-01', severity: 'Trouble', message: 'Average response time high (74 ms), 2% packet loss detected between Dubai Probe and Controller', entity: 'Ping Response Time', category: 'Wireless', probe: 'Dubai Campus Probe', probeId: 4, time: '5 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_805', device: 'NY-PA-FW-01', severity: 'Attention', message: 'Interface ethernet1/1 (WAN Untrust) bandwidth utilization at 78.4% (Threshold: 75%)', entity: 'Interface ethernet1/1', category: 'Firewall', probe: 'New York DC Probe', probeId: 1, time: '6 mins ago', technician: 'Unacknowledged', lastNote: '-' },
      { id: 'alm_806', device: 'LON-DIST-SW-01', severity: 'Attention', message: 'Memory utilization at 82.1% (Threshold: 80%). LSASS process active consumption.', entity: 'System Memory', category: 'Switch', probe: 'London Branch Probe', probeId: 2, time: '8 mins ago', technician: 'johndoe', lastNote: 'Investigating morning domain synchronization traffic.' },
      { id: 'alm_807', device: 'DXB-APC-UPS-01', severity: 'Attention', message: 'UPS Battery Runtime below 45 minutes (Current: 42 mins, Load: 58%).', entity: 'Battery Health Monitor', category: 'Storage', probe: 'Dubai Campus Probe', probeId: 4, time: '10 mins ago', technician: 'Unacknowledged', lastNote: '-' }
    ],
    topInterfaces: [
      { name: 'FortyGigabitEthernet1/0/48 (Core Uplink)', device: 'DXB-CORE-SW-01', speed: '40 Gbps', inTraffic: 1840, outTraffic: 1280, inPercent: 78.5, outPercent: 62.0, status: 'DOWN' },
      { name: 'TenGigE0/0/0/0 (Spine Aggregation)', device: 'NY-CORE-RTR-01', speed: '10 Gbps', inTraffic: 1200, outTraffic: 980, inPercent: 64.2, outPercent: 52.4, status: 'UP' },
      { name: 'Ethernet1/1 (Fabric Interconnect)', device: 'NY-NEXUS-SW-01', speed: '25 Gbps', inTraffic: 1450, outTraffic: 1100, inPercent: 58.0, outPercent: 44.0, status: 'UP' },
      { name: 'ethernet1/1 (WAN Untrust Transit)', device: 'NY-PA-FW-01', speed: '40 Gbps', inTraffic: 2400, outTraffic: 1890, inPercent: 78.4, outPercent: 61.2, status: 'UP' },
      { name: 'eth0 (Primary Public Database)', device: 'NY-DB-PROD-SQL', speed: '10 Gbps', inTraffic: 820, outTraffic: 760, inPercent: 82.0, outPercent: 76.0, status: 'UP' },
      { name: 'ge-0/0/0 (IPSec VPN Hub Link)', device: 'SG-VPNGW-RTR-01', speed: '10 Gbps', inTraffic: 580, outTraffic: 520, inPercent: 58.0, outPercent: 52.0, status: 'UP' },
      { name: 'A1-Trunk1 (Building Aggregation)', device: 'LON-DIST-SW-01', speed: '10 Gbps', inTraffic: 540, outTraffic: 480, inPercent: 54.0, outPercent: 48.0, status: 'UP' },
      { name: 'port1 (Corporate Internet Transit)', device: 'LON-FTNT-FW-01', speed: '10 Gbps', inTraffic: 620, outTraffic: 510, inPercent: 62.0, outPercent: 51.0, status: 'UP' },
      { name: 'Ethernet1 (Spine-Leaf Fabric)', device: 'SG-LEAF-SW-01', speed: '25 Gbps', inTraffic: 720, outTraffic: 690, inPercent: 28.8, outPercent: 27.6, status: 'UP' },
      { name: 'ens3 (Ingress K8s Gateway)', device: 'SG-K8S-MSTR-01', speed: '10 Gbps', inTraffic: 410, outTraffic: 390, inPercent: 41.0, outPercent: 39.0, status: 'UP' }
    ],
    diskVolumes: [
      { partition: '/var/lib/postgresql', device: 'NY-DB-PROD-SQL', total: '500 GB', used: '456 GB', free: '44 GB', percent: 91.2, status: 'Trouble' },
      { partition: 'C:\\\\ (System OS)', device: 'LON-MAIL-EXCH-01', total: '250 GB', used: '155 GB', free: '95 GB', percent: 62.0, status: 'Clear' },
      { partition: '/ (Root Volume)', device: 'SG-K8S-MSTR-01', total: '200 GB', used: '96 GB', free: '104 GB', percent: 48.0, status: 'Clear' },
      { partition: 'D:\\\\Data (Postgres Arch)', device: 'NY-DB-PROD-SQL', total: '1.2 TB', used: '912 GB', free: '288 GB', percent: 76.0, status: 'Attention' }
    ]
  };
`);

fs.writeFileSync('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/build_suite.js', parts.join('\n'));
console.log('Part 1 saved.');
