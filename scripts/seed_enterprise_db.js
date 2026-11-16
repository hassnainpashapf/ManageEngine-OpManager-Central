'use strict';
/**
 * seed_enterprise_db.js
 * Comprehensive realistic enterprise network data seeder for OpManager Central.
 * Seeds Probes, Devices, Interfaces, Metrics, Alarms, Discovery Rules, NCM Configs, Credentials, and Racks.
 */
const path = require('path');
const store = require('../server/services/store');

function seedDatabase() {
  console.log('[SEED] Checking database state...');
  
  // 1. Probe
  let probes = store.listProbes();
  let centralProbe = probes.find(p => p.name === 'Central Site Probe' || p.id === 101);
  if (!centralProbe) {
    console.log('[SEED] Creating Central Site Probe...');
    centralProbe = store.createProbe({
      name: 'Central Site Probe',
      ip: '192.168.30.65',
      auth_key_hash: 'probe-secret-key-hash-corp-01',
      status: 'Online'
    });
  }
  const probeId = centralProbe.id;
  console.log(`[SEED] Using Probe ID: ${probeId} (${centralProbe.name})`);

  // 2. Devices
  const enterpriseDevices = [
    {
      ip: '192.168.30.1',
      hostname: 'SW-CORE-01',
      sys_name: 'SW-CORE-01.corp.internal',
      sys_descr: 'Cisco IOS Software, Catalyst L3 Switch Software (CAT9K_LITE_IOSXE), Version 17.9.4a, RELEASE SOFTWARE (fc2)',
      sys_object_id: '.1.3.6.1.4.1.9.1.2520',
      vendor: 'Cisco Systems',
      model: 'Managed Cisco Catalyst 9300 L3 Switch (v2c)',
      category: 'Switches',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Critical',
      cpu_pct: 19,
      mem_used_pct: 52,
      uptime_ticks: 362880000,
      response_ms: 2,
      last_polled_at: Date.now() - 30000
    },
    {
      ip: '192.168.30.254',
      hostname: 'PVE-HOST-01',
      sys_name: 'pve-node-01.corp.internal',
      sys_descr: 'Linux pve-node-01 6.8.12-1-pve #1 SMP PREEMPT_DYNAMIC Proxmox 8.2-7 x86_64 Dell PowerEdge R750',
      sys_object_id: '.1.3.6.1.4.1.674.10892.5',
      vendor: 'Dell EMC',
      model: 'Dell PowerEdge R750 Proxmox Hypervisor',
      category: 'Servers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 14,
      mem_used_pct: 30,
      uptime_ticks: 368920000,
      response_ms: 1,
      last_polled_at: Date.now() - 45000
    },
    {
      ip: '192.168.30.15',
      hostname: 'FW-FORTI-01',
      sys_name: 'FW-FORTI-100F.corp.internal',
      sys_descr: 'Fortinet FortiGate 100F v7.4.3,build2573,240208 (GA.F)',
      sys_object_id: '.1.3.6.1.4.1.12356.101.1',
      vendor: 'Fortinet',
      model: 'Fortinet FortiGate 100F Enterprise Firewall',
      category: 'Firewalls',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Attention',
      cpu_pct: 28,
      mem_used_pct: 62,
      uptime_ticks: 182400000,
      response_ms: 3,
      last_polled_at: Date.now() - 20000
    },
    {
      ip: '192.168.30.77',
      hostname: 'WIN-HOST-01',
      sys_name: 'WIN-DC-AD01.corp.internal',
      sys_descr: 'Hardware: Intel64 Family 6 Model 85 Stepping 7 AT/AT COMPATIBLE - Software: Windows Server 2022 Datacenter Version 21H2 (Build 20348.2461)',
      sys_object_id: '.1.3.6.1.4.1.311.1.1.3.1.2',
      vendor: 'Microsoft',
      model: 'Windows Server 2022 Domain Controller',
      category: 'Servers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Trouble',
      cpu_pct: 42,
      mem_used_pct: 88,
      uptime_ticks: 259200000,
      response_ms: 2,
      last_polled_at: Date.now() - 60000
    },
    {
      ip: '192.168.30.65',
      hostname: 'OPMANAGER-CENTRAL',
      sys_name: 'opmanager-central.corp.internal',
      sys_descr: 'Linux opmanager-central 6.8.12-1-pve #1 SMP PREEMPT_DYNAMIC Proxmox Debian 12 (bookworm)',
      sys_object_id: '.1.3.6.1.4.1.8072.3.2.10',
      vendor: 'Linux / Embedded',
      model: 'ManageEngine OpManager Central Enterprise Node',
      category: 'Servers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 6,
      mem_used_pct: 28,
      uptime_ticks: 691200000,
      response_ms: 1,
      last_polled_at: Date.now() - 10000
    },
    {
      ip: '192.168.30.10',
      hostname: 'RTR-EDGE-01',
      sys_name: 'RTR-EDGE-01.corp.internal',
      sys_descr: 'Cisco IOS Software, ISR Software (X86_64_LINUX_IOSD-UNIVERSALK9-M), Version 17.6.3a, RELEASE SOFTWARE (fc1)',
      sys_object_id: '.1.3.6.1.4.1.9.1.1861',
      vendor: 'Cisco Systems',
      model: 'Cisco ISR 4451-X Enterprise Gateway',
      category: 'Routers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 24,
      mem_used_pct: 46,
      uptime_ticks: 483840000,
      response_ms: 4,
      last_polled_at: Date.now() - 35000
    },
    {
      ip: '192.168.30.2',
      hostname: 'SW-ACCESS-02',
      sys_name: 'SW-ACC-02.corp.internal',
      sys_descr: 'Cisco IOS Software, C2960X Software (C2960X-UNIVERSALK9-M), Version 15.2(7)E4, RELEASE SOFTWARE (fc1)',
      sys_object_id: '.1.3.6.1.4.1.9.1.1208',
      vendor: 'Cisco Systems',
      model: 'Cisco Catalyst 2960X-48FPS-L PoE Switch',
      category: 'Switches',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 16,
      mem_used_pct: 38,
      uptime_ticks: 414720000,
      response_ms: 2,
      last_polled_at: Date.now() - 50000
    },
    {
      ip: '192.168.30.20',
      hostname: 'WLC-CORP-01',
      sys_name: 'WLC-CORP-01.corp.internal',
      sys_descr: 'Cisco IOS XE Software, Catalyst 9800-CL Wireless Controller Software, Version 17.9.3',
      sys_object_id: '.1.3.6.1.4.1.9.1.2721',
      vendor: 'Cisco Systems',
      model: 'Cisco Catalyst 9800-CL Wireless Controller',
      category: 'Wireless',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 22,
      mem_used_pct: 48,
      uptime_ticks: 298080000,
      response_ms: 3,
      last_polled_at: Date.now() - 40000
    },
    {
      ip: '192.168.30.21',
      hostname: 'AP-CAMPUS-01',
      sys_name: 'AP-CAMPUS-01.corp.internal',
      sys_descr: 'Aruba AP-555 Wi-Fi 6 (802.11ax) Campus Access Point, ArubaOS 8.10.0.8',
      sys_object_id: '.1.3.6.1.4.1.14823.1.2.89',
      vendor: 'Aruba Networks',
      model: 'Aruba AP-555 Wi-Fi 6 Access Point',
      category: 'Wireless',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 18,
      mem_used_pct: 35,
      uptime_ticks: 198720000,
      response_ms: 2,
      last_polled_at: Date.now() - 30000
    },
    {
      ip: '192.168.30.85',
      hostname: 'SAN-ARRAY-01',
      sys_name: 'pure-flasharray-01.corp.internal',
      sys_descr: 'Pure Storage Purity//FA 6.4.7 FlashArray//X70 NVMe SAN Storage Controller',
      sys_object_id: '.1.3.6.1.4.1.40482',
      vendor: 'Pure Storage',
      model: 'Pure Storage FlashArray//X70 NVMe SAN',
      category: 'Storage',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 25,
      mem_used_pct: 46,
      uptime_ticks: 518400000,
      response_ms: 2,
      last_polled_at: Date.now() - 25000
    },
    {
      ip: '192.168.30.25',
      hostname: 'DB-SRV-PG01',
      sys_name: 'db-pg-cluster.corp.internal',
      sys_descr: 'Linux db-pg-cluster 5.15.0-105-generic #115-Ubuntu SMP x86_64 PostgreSQL 16.2',
      sys_object_id: '.1.3.6.1.4.1.8072.3.2.10',
      vendor: 'Linux / Embedded',
      model: 'Enterprise PostgreSQL Cluster Database Server',
      category: 'Servers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 34,
      mem_used_pct: 68,
      uptime_ticks: 311040000,
      response_ms: 1,
      last_polled_at: Date.now() - 15000
    },
    {
      ip: '192.168.30.50',
      hostname: 'APP-SRV-PROD',
      sys_name: 'app-srv-prod.corp.internal',
      sys_descr: 'Linux app-srv-prod 5.15.0-105-generic #115-Ubuntu SMP x86_64 Node.js / Docker Runtime',
      sys_object_id: '.1.3.6.1.4.1.8072.3.2.10',
      vendor: 'Linux / Embedded',
      model: 'Production Application Microservices Host',
      category: 'Servers',
      snmp_community: 'public',
      snmp_version: 'v2c',
      probe_id: probeId,
      managed: 1,
      status: 'Clear',
      cpu_pct: 21,
      mem_used_pct: 54,
      uptime_ticks: 276480000,
      response_ms: 2,
      last_polled_at: Date.now() - 20000
    }
  ];

  const createdDeviceMap = {};
  for (const dev of enterpriseDevices) {
    let existing = store.getDeviceByIp(dev.ip);
    if (!existing) {
      existing = store.createDevice(dev);
      console.log(`[SEED] Created device: ${dev.hostname} (${dev.ip}) -> ID ${existing.id}`);
    } else {
      store.updateDevice(existing.id, dev);
      console.log(`[SEED] Updated device: ${dev.hostname} (${dev.ip}) -> ID ${existing.id}`);
    }
    createdDeviceMap[dev.hostname] = existing;

    // Seed interfaces
    const ifaces = [];
    if (dev.category === 'Switches') {
      ifaces.push(
        { if_index: 1, name: 'GigabitEthernet0/1', descr: 'Uplink Trunk to FortiGate FW-FORTI-01', speed_bps: 1000000000, admin_status: 1, oper_status: dev.status === 'Critical' ? 2 : 1, in_bps: 161200000, out_bps: 143600000, in_errors: dev.status === 'Critical' ? 42 : 0, out_errors: 0 },
        { if_index: 2, name: 'GigabitEthernet0/2', descr: 'Trunk to Proxmox VE Hypervisor PVE-HOST-01', speed_bps: 10000000000, admin_status: 1, oper_status: 1, in_bps: 450000000, out_bps: 380000000, in_errors: 0, out_errors: 0 },
        { if_index: 3, name: 'GigabitEthernet0/3', descr: 'Trunk to Access Switch SW-ACCESS-02', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 89000000, out_bps: 65000000, in_errors: 0, out_errors: 0 },
        { if_index: 4, name: 'GigabitEthernet0/4', descr: 'Storage 10G iSCSI Link to SAN-ARRAY-01', speed_bps: 10000000000, admin_status: 1, oper_status: 1, in_bps: 620000000, out_bps: 540000000, in_errors: 0, out_errors: 0 }
      );
    } else if (dev.category === 'Firewalls') {
      ifaces.push(
        { if_index: 1, name: 'port1 (WAN1)', descr: 'Primary ISP Gateway 500M Fiber', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 142000000, out_bps: 118000000, in_errors: 0, out_errors: 0 },
        { if_index: 2, name: 'port2 (LAN)', descr: 'Internal Core LAN 192.168.30.254/24', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 280000000, out_bps: 240000000, in_errors: 0, out_errors: 0 },
        { if_index: 3, name: 'port3 (DMZ)', descr: 'DMZ Segment 192.168.30.65/24', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 45000000, out_bps: 32000000, in_errors: 0, out_errors: 0 }
      );
    } else if (dev.category === 'Routers') {
      ifaces.push(
        { if_index: 1, name: 'GigabitEthernet0/0/0', descr: 'WAN Primary MPLS Link', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 98000000, out_bps: 84000000, in_errors: 0, out_errors: 0 },
        { if_index: 2, name: 'GigabitEthernet0/0/1', descr: 'LAN Gateway Interface', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 135000000, out_bps: 110000000, in_errors: 0, out_errors: 0 }
      );
    } else {
      ifaces.push(
        { if_index: 1, name: dev.ip === '192.168.30.254' ? 'vmbr0' : 'eth0', descr: 'Primary Network Interface', speed_bps: 1000000000, admin_status: 1, oper_status: 1, in_bps: 54000000, out_bps: 42000000, in_errors: 0, out_errors: 0 }
      );
    }
    store.replaceInterfaces(existing.id, ifaces);

    // Seed availability metrics
    const now = Date.now();
    for (let h = 0; h < 24; h++) {
      store.insertMetric(existing.id, {
        cpu_pct: dev.cpu_pct + Math.round((Math.sin(h) * 5)),
        mem_used_pct: dev.mem_used_pct,
        response_ms: dev.status === 'Critical' && h < 2 ? null : dev.response_ms,
        ts: now - (h * 3600000)
      });
    }
  }

  // 3. Alarms
  console.log('[SEED] Seeding active alarms...');
  const activeAlarms = [
    {
      device_id: createdDeviceMap['SW-CORE-01'] ? createdDeviceMap['SW-CORE-01'].id : 1,
      source: 'snmp-poller',
      severity: 'critical',
      message: 'Interface GigabitEthernet0/1 operational status is DOWN (Link failure on uplink trunk to FortiGate)',
      entity: 'GigabitEthernet0/1',
      status: 'active',
      raised_at: Date.now() - 3600000
    },
    {
      device_id: createdDeviceMap['WIN-HOST-01'] ? createdDeviceMap['WIN-HOST-01'].id : 4,
      source: 'wmi-monitor',
      severity: 'trouble',
      message: 'Host memory utilization is 88.4% (Threshold: 85%) in sqlservr.exe process',
      entity: 'Memory Utilization',
      status: 'acknowledged',
      raised_at: Date.now() - 7200000
    },
    {
      device_id: createdDeviceMap['FW-FORTI-01'] ? createdDeviceMap['FW-FORTI-01'].id : 3,
      source: 'fortios-syslog',
      severity: 'attention',
      message: 'SSL-VPN Concurrent user threshold reached 85% capacity (Peak workforce traffic)',
      entity: 'SSL-VPN Gateway',
      status: 'active',
      raised_at: Date.now() - 14400000
    },
    {
      device_id: createdDeviceMap['PVE-HOST-01'] ? createdDeviceMap['PVE-HOST-01'].id : 2,
      source: 'pve-agent',
      severity: 'clear',
      message: 'Hypervisor CPU load normalized to 14.2% following VM live-migration',
      entity: 'CPU Utilization',
      status: 'cleared',
      raised_at: Date.now() - 1800000
    }
  ];

  for (const alm of activeAlarms) {
    try {
      store.raiseAlarm(alm);
    } catch (e) {
      // Alarm might already exist
    }
  }

  // 4. Discovery Rules
  console.log('[SEED] Seeding corporate auto-discovery rules...');
  const rules = store.listDiscoveryRules();
  if (!rules || rules.length === 0) {
    store.createDiscoveryRule({
      range: '192.168.30.1-192.168.30.254',
      probe_id: probeId,
      schedule: 'Every 15 mins'
    });
    store.createDiscoveryRule({
      range: '10.0.10.1-10.0.10.254',
      probe_id: probeId,
      schedule: 'Daily at 02:00 AM'
    });
    store.createDiscoveryRule({
      range: '172.16.20.1-172.16.20.254',
      probe_id: probeId,
      schedule: 'Every 6 hours'
    });
    console.log('[SEED] Created 3 Corporate Auto-Discovery CIDR rules.');
  }

  // 5. NCM Configurations
  console.log('[SEED] Seeding NCM configurations...');
  const ciscoCore = createdDeviceMap['SW-CORE-01'];
  if (ciscoCore) {
    const runningConfig = `!
version 17.9
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname SW-CORE-01
!
boot-start-marker
boot-end-marker
!
vrf definition Mgmt-vrf
 !
 address-family ipv4
 exit-address-family
!
enable secret 9 $9$v8sH6Nf4gR...
!
ip routing
ip domain name corp.internal
!
interface GigabitEthernet0/1
 description Uplink Trunk to FortiGate FW-FORTI-01
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40
 spanning-tree portfast trunk
!
interface GigabitEthernet0/2
 description Trunk to Proxmox VE Hypervisor PVE-HOST-01
 switchport mode trunk
 switchport trunk allowed vlan all
!
interface Vlan30
 description Core Management Network
 ip address 192.168.30.1 255.255.255.0
 no shutdown
!
snmp-server community public RO
snmp-server host 192.168.30.65 version 2c public
snmp-server enable traps
!
line con 0
 stopbits 1
line vty 0 4
 transport input ssh
 login local
!
end`;

    const startupConfig = runningConfig.replace('version 17.9', 'version 17.9\n! Startup configuration synchronized');
    store.saveConfig(ciscoCore.id, 'running', runningConfig);
    store.saveConfig(ciscoCore.id, 'startup', startupConfig);
    console.log('[SEED] Saved NCM running and startup configs for SW-CORE-01');
  }

  const fortiFw = createdDeviceMap['FW-FORTI-01'];
  if (fortiFw) {
    const fortiConfig = `#config-version=FG100F-7.4.3-build2573:opmode=0:vdom=root:user=admin
#conf_file_ver=2573
#buildno=2573
#global_vdom=1
config system global
    set hostname "FW-FORTI-01"
    set timezone 55
end
config system interface
    edit "port1"
        set vdom "root"
        set ip 203.0.113.2 255.255.255.248
        set allowaccess ping https ssh
        set type physical
        set role wan
    next
    edit "port2"
        set vdom "root"
        set ip 192.168.30.254 255.255.255.0
        set allowaccess ping https ssh fabric
        set type physical
        set role lan
    next
end
config firewall policy
    edit 1
        set name "LAN_to_WAN_Internet"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "192.168.30.0/24"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end`;
    store.saveConfig(fortiFw.id, 'running', fortiConfig);
    store.saveConfig(fortiFw.id, 'startup', fortiConfig);
    console.log('[SEED] Saved NCM configs for FW-FORTI-01');
  }

  // 6. Racks
  const racks = store.listRacks();
  if (!racks || racks.length === 0) {
    store.createRack({
      name: 'Datacenter Rack 01 (Core Network & Hypervisor)',
      height_u: 42,
      location: 'Primary Datacenter - Row B',
      notes: 'Contains Cisco Catalyst 9300 Core, FortiGate 100F, Dell R750 Proxmox, and PureStorage SAN.'
    });
    console.log('[SEED] Created Datacenter Rack 01');
  }

  console.log('[SEED] Database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
