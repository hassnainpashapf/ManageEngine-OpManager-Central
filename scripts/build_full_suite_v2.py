#!/usr/bin/env python3
"""
ManageEngine OpManager Central (Version 12.9.203 GA Build 129203)
Comprehensive Enterprise Suite Builder v2
"""
import os

target_path = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js"

print("Building 100% authentic ManageEngine OpManager Central suite v2...")

with open('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/build_full_suite.py', 'r', encoding='utf-8') as f:
    orig_lines = f.readlines()

# Extract Part 2: Modals (lines 260 to 1670)
modals_chunk = "".join(orig_lines[260:1670])

builder_file = open(target_path, "w", encoding="utf-8")

# Write Header, State, Helpers
builder_file.write(r'''/**
 * ManageEngine OpManager Central (Version 12.9.203 GA Build 129203)
 * 100% Authentic Enterprise Suite for Zoho ITOM Ember Framework
 * Features:
 * - Pixel-perfect ManageEngine OpManager Central branding, logo & probe selector
 * - Authentic top navigation with Zoho ITOM Forest Green (#1d824e) active styling
 * - All 7 main tabs + all subtabs fully implemented with enterprise interactivity
 * - Master 5-tab Device Snapshot drawer with live SVG dials, sensor telemetry & CLI
 * - Dynamic Alarms View (Table Grid & List View modes, severity dials, Zia RCA drawer)
 * - 3D Rack elevation (42U EIA-310), Datacenter Floor plan & Layer 2 STP topology
 * - NCM Baseline vs Running diff viewer with working "Save Running to Startup"
 * - Live agent downloads (OpManagerAgent.exe & OpManagerAgent.dmg)
 * - Auto-refresh ticker countdown and real-time telemetry poller
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
    selectedAlarmCheckboxes: {},
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

  // Ensure Overlay Container
  function ensureOverlayContainer() {
    let container = document.getElementById('opm-custom-suite-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'opm-custom-suite-container';
      container.style.cssText = 'width: 100%; min-height: calc(100vh - 88px); background: #f4f6f9; display: block; overflow-x: hidden;';
      const pageContainer = document.querySelector('.page-container');
      if (pageContainer && pageContainer.parentNode) {
        pageContainer.parentNode.insertBefore(container, pageContainer);
      } else {
        const header = document.getElementById('main-header');
        if (header && header.parentNode) {
          header.parentNode.insertBefore(container, header.nextSibling);
        } else {
          document.body.appendChild(container);
        }
      }
    }
    return container;
  }

  // Route Resolver
  function resolveTabFromHash() {
    const hash = window.location.hash || '#/dashboard';
    const lower = hash.toLowerCase();
    if (lower.includes('inventory') || lower.includes('/device') || lower.includes('/interface')) return 'inventory';
    if (lower.includes('alarm')) return 'alarms';
    if (lower.includes('map') || lower.includes('businessview') || lower.includes('rack') || lower.includes('floor')) return 'maps';
    if (lower.includes('configuration') || lower.includes('ncm') || lower.includes('compliance')) return 'configuration';
    if (lower.includes('report')) return 'reports';
    if (lower.includes('setting') || lower.includes('admin') || lower.includes('probe')) return 'settings';
    return 'dashboard';
  }

  // Enforce Zoho Green on Active Tab
  function syncHeaderTabs(activeTab) {
    const tabMap = {
      'dashboard': 'Dashboard',
      'inventory': 'Inventory',
      'alarms': 'Alarms',
      'maps': 'Maps',
      'configuration': 'Configuration',
      'reports': 'Reports',
      'settings': 'Settings'
    };
    const targetName = (tabMap[activeTab] || 'Dashboard').toLowerCase();

    // Select all nav links and list items in main header
    const navLinks = document.querySelectorAll('#main-header #main-nav ul li a, #main-header #main-nav ul li, #main-header .tab-container .tab-item');
    navLinks.forEach(el => {
      const nameSpan = el.querySelector('.menu-name') || el;
      const text = (nameSpan.innerText || el.innerText || '').trim().toLowerCase();
      
      const isTarget = text.startsWith(targetName) ||
        (targetName === 'dashboard' && text.includes('dashboard')) ||
        (targetName === 'inventory' && text.includes('inventory')) ||
        (targetName === 'alarms' && text.includes('alarm')) ||
        (targetName === 'maps' && text.includes('map')) ||
        (targetName === 'configuration' && text.includes('configuration')) ||
        (targetName === 'reports' && text.includes('report')) ||
        (targetName === 'settings' && text.includes('setting'));

      if (isTarget) {
        if (el.tagName === 'A' || el.classList.contains('nav-link')) {
          el.classList.add('active');
          el.style.setProperty('background-color', '#1d824e', 'important');
          el.style.setProperty('color', '#ffffff', 'important');
          el.style.setProperty('border-radius', '4px', 'important');
          el.style.setProperty('font-weight', '600', 'important');
          if (nameSpan && nameSpan !== el) nameSpan.style.setProperty('color', '#ffffff', 'important');
        } else if (el.tagName === 'LI') {
          el.classList.add('active-menu');
          const link = el.querySelector('a.nav-link');
          if (link) {
            link.classList.add('active');
            link.style.setProperty('background-color', '#1d824e', 'important');
            link.style.setProperty('color', '#ffffff', 'important');
            link.style.setProperty('border-radius', '4px', 'important');
            link.style.setProperty('font-weight', '600', 'important');
          }
        }
      } else {
        if (el.tagName === 'A' || el.classList.contains('nav-link')) {
          el.classList.remove('active');
          el.style.removeProperty('background-color');
          el.style.removeProperty('border-radius');
          el.style.removeProperty('font-weight');
          el.style.setProperty('color', '#cbd5e1', 'important');
          if (nameSpan && nameSpan !== el) nameSpan.style.removeProperty('color');
        } else if (el.tagName === 'LI') {
          el.classList.remove('active-menu');
          const link = el.querySelector('a.nav-link');
          if (link) {
            link.classList.remove('active');
            link.style.removeProperty('background-color');
            link.style.removeProperty('border-radius');
            link.style.removeProperty('font-weight');
            link.style.setProperty('color', '#cbd5e1', 'important');
          }
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
      'Switches': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="m6 12 3-3m0 6-3-3m12 0-3-3m0 6 3-3"/></svg>`,
      'Routers': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m8 12 4-4 4 4m-4-4v8"/></svg>`,
      'Firewalls': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'Servers': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
      'Wireless': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>`,
      'Storage': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
    };
    return icons[cat] || icons['Switches'];
  }
''')

# Write Modals chunk
builder_file.write(modals_chunk)
builder_file.close()

print("Part 1 & 2 appended.")
