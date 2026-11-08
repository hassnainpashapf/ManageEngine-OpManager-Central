const express = require('express');
const router = express.Router();
const db = require('../services/db');

// OpManager Standard API: list devices with optional probe/category/status filters
router.get(['/device/listDevices', '/device/list', '/api/json/device/list', '/api/devices'], (req, res) => {
  const { probeId, category, status, search } = req.query;
  let devices = db.getDevices(probeId, category, status);

  if (search) {
    const q = search.toLowerCase();
    devices = devices.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.displayName.toLowerCase().includes(q) ||
      d.ip.includes(q) ||
      d.vendor.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  }

  res.json({
    status: 'success',
    total: devices.length,
    devices
  });
});

// Device Summary / Details
router.get(['/device/getDeviceSummary', '/device/getDeviceDetails', '/api/json/device/getDeviceDetails', '/api/devices/:id'], (req, res) => {
  const deviceId = req.query.deviceId || req.params.id;
  const device = db.getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ status: 'error', message: `Device ${deviceId} not found` });
  }

  // Also include device active alarms
  const deviceAlarms = db.getAlarms(null).filter(a => a.deviceId === device.id);

  res.json({
    status: 'success',
    device,
    deviceSummary: {
      name: device.name,
      ipAddress: device.ip,
      category: device.category,
      type: device.type,
      vendor: device.vendor,
      osVersion: device.osVersion || 'Enterprise Release',
      serialNumber: device.serial || 'ME-SNMP-9281',
      status: device.status,
      availability: device.availability || '99.98%',
      cpuUtilization: device.cpu,
      memoryUtilization: device.memory,
      diskUtilization: device.disk || 38.5,
      responseTime: device.responseTime || 12,
      lastPolled: device.lastPolled || 'Just now',
      assignedProbe: device.probeName,
      probeId: device.probeId,
      interfacesCount: (device.interfaces || []).length || 3
    },
    activeAlarms: deviceAlarms
  });
});

// List Interfaces for a Device
router.get(['/device/listInterfaces', '/api/json/device/listInterfaces', '/device/:id/interfaces', '/api/devices/:id/interfaces'], (req, res) => {
  const deviceId = req.query.deviceId || req.params.id;
  const dev = db.getDeviceById(deviceId) || db.getDevices()[0];
  if (!dev) {
    return res.json({
      status: 'success',
      deviceId: null,
      deviceName: 'No Devices',
      total: 0,
      interfaces: []
    });
  }
  const interfaces = dev.interfaces || [
    { name: 'GigabitEthernet0/0/1', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 340.5, outTraffic: 290.2, inPercent: 34.0, outPercent: 29.0, errors: 0 },
    { name: 'GigabitEthernet0/0/2', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 512.0, outTraffic: 480.0, inPercent: 51.2, outPercent: 48.0, errors: 0 },
    { name: 'TenGigabitEthernet1/0/1', admin: 'UP', oper: 'UP', speed: '10 Gbps', inTraffic: 1420.0, outTraffic: 1100.0, inPercent: 14.2, outPercent: 11.0, errors: 0 }
  ];
  res.json({
    status: 'success',
    deviceId: dev.id,
    deviceName: dev.name,
    total: interfaces.length,
    interfaces
  });
});

// Live Ping Response
router.get(['/device/getPingResponse', '/api/json/device/getPingResponse'], (req, res) => {
  const ip = req.query.ip || '10.40.1.1';
  res.json({
    status: 'success',
    ip,
    packetLoss: '0%',
    packetsTransmitted: 4,
    packetsReceived: 4,
    minRtt: 10,
    avgRtt: 12,
    maxRtt: 15,
    ttl: 64,
    output: `Reply from ${ip}: bytes=32 time=12ms TTL=64\nReply from ${ip}: bytes=32 time=11ms TTL=64\nReply from ${ip}: bytes=32 time=13ms TTL=64\nReply from ${ip}: bytes=32 time=12ms TTL=64\n\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 10ms, Maximum = 15ms, Average = 12ms`
  });
});

// Test Credentials
router.post(['/device/testCredential', '/api/json/device/testCredential'], (req, res) => {
  const { ip, credentialType, community, username } = req.body;
  res.json({
    status: 'success',
    message: `SNMP Credential validation passed for ${ip || 'target node'} (RFC 1213-MIB responded OK).`,
    result: 'SUCCESS',
    latencyMs: 14
  });
});

// Set Managed / Unmanaged
router.post(['/device/setManaged', '/api/json/device/setManaged'], (req, res) => {
  const { deviceId, managed } = req.body;
  res.json({
    status: 'success',
    message: `Management state updated for device ${deviceId || 'selected nodes'}: ${managed ? 'Managed' : 'Unmanaged'}`
  });
});

// Availability Graph Data
router.get(['/device/getAvailabilityGraphData', '/api/json/device/getAvailabilityGraphData'], (req, res) => {
  const data = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 3600 * 1000).toISOString(),
      availability: 100.0,
      downtimeMinutes: 0
    });
  }
  res.json({
    status: 'success',
    overallAvailability: 99.98,
    history: data
  });
});

// Performance Monitor Details
router.get(['/device/getPerformanceMonitorDetails', '/api/json/device/getPerformanceMonitorDetails'], (req, res) => {
  const deviceId = req.query.deviceId || 1;
  const dev = db.getDeviceById(deviceId) || db.getDevices()[0];
  if (!dev) {
    return res.json({
      status: 'success',
      deviceId: null,
      deviceName: 'No Devices',
      monitors: []
    });
  }
  res.json({
    status: 'success',
    deviceId: dev.id,
    deviceName: dev.name,
    monitors: [
      { name: 'CPU Utilization', current: dev.cpu, unit: '%', threshold: 90, status: dev.cpu > 90 ? 'Critical' : 'Clear' },
      { name: 'Memory Utilization', current: dev.memory, unit: '%', threshold: 85, status: dev.memory > 85 ? 'Trouble' : 'Clear' },
      { name: 'Interface Inbound Bandwidth', current: '1.42 Gbps', unit: 'Gbps', threshold: '5.0 Gbps', status: 'Clear' },
      { name: 'ICMP Latency', current: dev.responseTime || 12, unit: 'ms', threshold: 50, status: 'Clear' }
    ]
  });
});

// Add Device
router.post(['/api/json/device/add', '/api/devices'], (req, res) => {
  const { ip, name, category, probeId } = req.body;
  if (!ip) {
    return res.status(400).json({ status: 'error', message: 'Device IP is required' });
  }
  const newDevice = db.addDevice(req.body);
  res.status(201).json({
    status: 'success',
    message: `Device ${newDevice.name} (${newDevice.ip}) added and assigned to ${newDevice.probeName}`,
    device: newDevice
  });
});

// Delete Device
router.post(['/api/json/device/delete', '/api/devices/:id/delete'], (req, res) => {
  const deviceId = req.body.deviceId || req.params.id;
  const deleted = db.deleteDevice(deviceId);
  if (!deleted) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  res.json({
    status: 'success',
    message: `Device ${deleted.name} removed from inventory`,
    deleted
  });
});

// Poll Device Immediately (Manual / Live SNMP Trigger)
router.post(['/api/json/device/pollNow', '/api/devices/:id/poll-now'], (req, res) => {
  const deviceId = req.body.deviceId || req.query.deviceId || req.params.id;
  const dev = db.getDeviceById(deviceId);
  if (!dev) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }

  // Simulate instant SNMP / ICMP fetch
  dev.responseTime = Math.floor(Math.random() * 15) + 8;
  dev.cpu = Math.min(98, Math.max(8, Math.round(dev.cpu + (Math.random() - 0.5) * 6)));
  dev.memory = Math.min(95, Math.max(15, Math.round(dev.memory + (Math.random() - 0.5) * 4)));
  dev.lastPolled = 'Just now';

  res.json({
    status: 'success',
    message: `Device ${dev.name} (${dev.ip}) polled successfully via ${dev.probeName || 'Dallas-Probe-01'} (SNMP v2c OK, Latency: ${dev.responseTime}ms)`,
    device: dev,
    polledAt: new Date().toISOString()
  });
});

// Test Active Monitors (Ping, SNMP, WMI, Ports)
router.get(['/api/json/device/testMonitors', '/api/devices/:id/test-monitors'], (req, res) => {
  const deviceId = req.query.deviceId || req.params.id;
  const dev = db.getDeviceById(deviceId);
  if (!dev) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }

  res.json({
    status: 'success',
    device: dev.name,
    ip: dev.ip,
    monitors: [
      { name: 'ICMP Ping Echo', protocol: 'ICMP', status: 'Success', roundTripMs: dev.responseTime || 12, packetLoss: '0%' },
      { name: 'SNMP RFC1213-MIB sysDescr', protocol: 'SNMP v2c', status: 'Success', roundTripMs: 16, value: `${dev.vendor} IOS Software, Version ${dev.osVersion || '16.12'}` },
      { name: 'HOST-RESOURCES-MIB hrProcessorLoad', protocol: 'SNMP v2c', status: 'Success', roundTripMs: 14, value: `${dev.cpu}%` },
      { name: 'HOST-RESOURCES-MIB hrStorageUsed', protocol: 'SNMP v2c', status: 'Success', roundTripMs: 18, value: `${dev.memory}% (${Math.round((dev.memory / 100) * 32)} GB / 32 GB)` },
      { name: 'IF-MIB ifOperStatus', protocol: 'SNMP v2c', status: 'Success', roundTripMs: 22, value: '3 / 3 interfaces operational UP' },
      { name: 'CISCO-ENVMON-MIB ciscoEnvMonTemperatureStatusValue', protocol: 'SNMP v2c', status: 'Success', roundTripMs: 20, value: `${dev.temperature || 34}°C (Normal)` }
    ]
  });
});

// Device categories summary
router.get('/api/json/device/categories', (req, res) => {
  const { probeId } = req.query;
  const devices = db.getDevices(probeId);
  const counts = {};
  devices.forEach(d => {
    counts[d.category] = (counts[d.category] || 0) + 1;
  });
  res.json({
    status: 'success',
    categories: counts
  });
});

// -------------------------------------------------------------
// VIRTUALIZATION INVENTORY (OPM/Virtualization.xml -> /Inventory/List/Virtualization/*)
// -------------------------------------------------------------
const VIRTUAL_MACHINES = [
  { id: 'VM-101', name: 'lon-exch-mbx-01', hypervisor: 'VMware ESXi 8.0', cluster: 'LON-CLUSTER-01', type: 'vmware', probe: 'London Branch Office', probeId: 2, guestOs: 'Windows Server 2022', vCpu: 8, vRamGB: 32, diskGB: 500, ip: '10.20.3.11', status: 'Running', cpuPct: 42.1, ramPct: 68.4, uptime: '124 days' },
  { id: 'VM-102', name: 'lon-exch-cas-01', hypervisor: 'VMware ESXi 8.0', cluster: 'LON-CLUSTER-01', type: 'vmware', probe: 'London Branch Office', probeId: 2, guestOs: 'Windows Server 2022', vCpu: 4, vRamGB: 16, diskGB: 120, ip: '10.20.3.12', status: 'Running', cpuPct: 28.5, ramPct: 54.0, uptime: '124 days' },
  { id: 'VM-103', name: 'pve-web-frontend-01', hypervisor: 'Proxmox VE 8.1', cluster: 'PVE-HA-CLUSTER', type: 'proxmox', probe: 'Dubai Campus Core', probeId: 4, guestOs: 'Debian 12 Bookworm', vCpu: 4, vRamGB: 8, diskGB: 80, ip: '10.40.5.10', status: 'Running', cpuPct: 18.2, ramPct: 41.5, uptime: '89 days' },
  { id: 'VM-104', name: 'pve-redis-cache-01', hypervisor: 'Proxmox VE 8.1', cluster: 'PVE-HA-CLUSTER', type: 'proxmox', probe: 'Dubai Campus Core', probeId: 4, guestOs: 'Debian 12 Bookworm', vCpu: 2, vRamGB: 4, diskGB: 40, ip: '10.40.5.11', status: 'Running', cpuPct: 9.4, ramPct: 32.0, uptime: '89 days' },
  { id: 'VM-105', name: 'ntnx-analytics-worker-01', hypervisor: 'Nutanix AHV', cluster: 'PRISM-CENTRAL-01', type: 'nutanix', probe: 'New York Data Center', probeId: 1, guestOs: 'Red Hat Enterprise Linux 9.2', vCpu: 16, vRamGB: 64, diskGB: 1200, ip: '10.10.8.20', status: 'Running', cpuPct: 64.8, ramPct: 78.1, uptime: '45 days' },
  { id: 'VM-106', name: 'k8s-pod-auth-api', hypervisor: 'Kubernetes Container', cluster: 'SG-K8S-MSTR-01', type: 'containers', probe: 'Singapore Cloud VPC', probeId: 3, guestOs: 'Alpine Linux (Container)', vCpu: 2, vRamGB: 4, diskGB: 20, ip: '10.30.4.15', status: 'Running', cpuPct: 12.0, ramPct: 24.5, uptime: '14 days' }
];

router.get(['/api/inventory/virtualization', '/inventory/virtualization'], (req, res) => {
  const { type = 'all', probeId } = req.query;
  let list = VIRTUAL_MACHINES;
  if (type !== 'all') {
    list = list.filter(v => v.type === type.toLowerCase());
  }
  if (probeId) {
    list = list.filter(v => v.probeId == probeId);
  }

  res.json({
    status: 'success',
    total: 84,
    vmsCount: list.length,
    vms: list,
    summary: {
      totalVMs: 84,
      totalVCPUs: 348,
      totalMemoryTB: 1.4,
      hypervisors: {
        vmware: 42,
        proxmox: 24,
        nutanix: 10,
        containers: 8
      }
    }
  });
});

// -------------------------------------------------------------
// FIREWALL POLICY RULES INVENTORY (FWA/secondaryLevelMenuTab.xml -> /Inventory/List/LogMgmt/Rulemgmt)
// -------------------------------------------------------------
const FIREWALL_RULES = [
  { id: 'RULE-01', name: 'Permit-HTTPS-Inbound', firewall: 'NY-PA-FW-01', probe: 'New York Data Center', srcZone: 'Untrust (WAN)', dstZone: 'DMZ', service: 'TCP/443', action: 'Permit', hits: 14820194, status: 'Active (Optimized)', shadowed: false },
  { id: 'RULE-02', name: 'Drop-Telnet-Inbound', firewall: 'NY-PA-FW-01', probe: 'New York Data Center', srcZone: 'Any', dstZone: 'Internal', service: 'TCP/23', action: 'Deny (Drop)', hits: 84920, status: 'Active (Security Best Practice)', shadowed: false },
  { id: 'RULE-18', name: 'Permit-Corporate-VPN', firewall: 'LON-FTNT-FW-01', probe: 'London Branch Office', srcZone: 'WAN', dstZone: 'Corporate-LAN', service: 'UDP/500,4500 (IPsec)', action: 'Permit', hits: 928410, status: 'Active', shadowed: false },
  { id: 'RULE-42', name: 'Permit-DMZ-Legacy', firewall: 'LON-FTNT-FW-01', probe: 'London Branch Office', srcZone: 'WAN', dstZone: 'DMZ', service: 'TCP/8080', action: 'Permit', hits: 0, status: 'Shadowed by Rule #18 (Zero Hits 90d)', shadowed: true },
  { id: 'RULE-64', name: 'Permit-BGP-Peer-Transit', firewall: 'DXB-CORE-SW-01', probe: 'Dubai Campus Core', srcZone: 'WAN-Transit', dstZone: 'Loopback0', service: 'TCP/179', action: 'Permit', hits: 489201, status: 'Active', shadowed: false }
];

router.get(['/api/inventory/firewall-rules', '/inventory/firewall-rules'], (req, res) => {
  res.json({
    status: 'success',
    totalRules: 142,
    rules: FIREWALL_RULES
  });
});

module.exports = router;
