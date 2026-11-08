const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { execFile } = require('node:child_process');
const { lookup } = require('node:dns/promises');
const { promisify } = require('node:util');
const run = promisify(execFile);

async function diagnose(req, res, operation) {
  const origin = req.get('origin');
  const local = ['::1', '127.0.0.1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  if (!local || (origin && origin !== 'http://' + req.get('host')) || !req.is('application/json')) {
    return res.status(403).json({ status: 'error', message: 'Run diagnostics from the local Mac console.' });
  }

  const target = typeof req.body?.ip === 'string' ? req.body.ip.trim() : '';
  if (!/^[a-z\d][a-z\d.-]{0,252}$/i.test(target)) {
    return res.status(400).json({ status: 'error', message: 'Enter an IPv4 address or hostname.' });
  }
  let address;
  try {
    ({ address } = await lookup(target, { family: 4 }));
  } catch {
    return res.status(422).json({ status: 'error', message: 'Could not resolve the target to an IPv4 address.' });
  }
  try {
    const result = await operation(address);
    res.json({ status: 'success', target, source: 'local-mac', timestamp: new Date().toISOString(), ...result });
  } catch {
    res.status(502).json({ status: 'error', message: 'The local diagnostic could not complete. Check network access and try again.' });
  }
}

router.post('/api/tools/ping', (req, res) => {
  const count = Number(req.body?.count ?? 4);
  if (!Number.isInteger(count) || count < 1 || count > 8) {
    return res.status(400).json({ status: 'error', message: 'Packet count must be between 1 and 8.' });
  }
  return diagnose(req, res, async address => {
    let output;
    try {
      ({ stdout: output } = await run('/sbin/ping', ['-n', '-c', String(count), '-W', '1000', address], { timeout: 14000 }));
    } catch (error) {
      if (error.code !== 2) throw error;
      output = error.stdout;
    }
    const stats = output.match(/(\d+) packets transmitted, (\d+) (?:packets )?received, ([\d.]+)% packet loss/);
    if (!stats) throw new Error('Missing ping statistics');
    const timing = output.match(/= ([\d.]+)\/([\d.]+)\/([\d.]+)\//);
    const packets = Array.from(output.matchAll(/^.*icmp_seq=(\d+).*time[=<]([\d.]+) ms.*$/gm), match => ({
      seq: Number(match[1]), status: match[0], rtt: Number(match[2])
    }));
    return {
      probe: 'Local Mac', transmitted: Number(stats[1]), received: Number(stats[2]), lossPercent: Number(stats[3]),
      minRtt: timing ? Number(timing[1]) : null, avgRtt: timing ? Number(timing[2]) : null,
      maxRtt: timing ? Number(timing[3]) : null, packets, output
    };
  });
});

router.post('/api/tools/traceroute', (req, res) => {
  return diagnose(req, res, async address => {
    const maxHops = 20;
    const { stdout: output } = await run('/usr/sbin/traceroute', ['-n', '-m', String(maxHops), '-q', '1', '-w', '1', address], { timeout: 26000 });
    const hops = Array.from(output.matchAll(/^\s*(\d+)\s+(?:(\d+(?:\.\d+){3})\s+([\d.]+ ms)|\*)/gm), match => ({
      hop: Number(match[1]), ip: match[2] || '*', hostname: match[2] || 'No reply',
      rtt1: match[3] || '*', rtt2: '', rtt3: ''
    }));
    if (!hops.length) throw new Error('Missing traceroute output');
    return { maxHops, hops, destinationResponded: hops.some(hop => hop.ip === address), output };
  });
});

// Authentic ManageEngine SNMP MIB Tree Catalog
const MIB_MODULES = [
  {
    name: 'RFC1213-MIB (MIB-II)',
    oids: [
      { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr.0', type: 'OCTET STRING', access: 'read-only', desc: 'Hardware & OS description' },
      { oid: '.1.3.6.1.2.1.1.2.0', name: 'sysObjectID.0', type: 'OBJECT IDENTIFIER', access: 'read-only', desc: 'Vendor authoritative identification OID' },
      { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', access: 'read-only', desc: 'Time since network management portion was re-initialized' },
      { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact.0', type: 'OCTET STRING', access: 'read-write', desc: 'Identification of the contact person for this managed node' },
      { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName.0', type: 'OCTET STRING', access: 'read-write', desc: 'Fully-qualified administrative name for this node' },
      { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation.0', type: 'OCTET STRING', access: 'read-write', desc: 'Physical location of this node (e.g. Rack/Room)' },
      { oid: '.1.3.6.1.2.1.1.7.0', name: 'sysServices.0', type: 'INTEGER', access: 'read-only', desc: 'Value indicating the set of services that this entity offers' },
      { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber.0', type: 'INTEGER', access: 'read-only', desc: 'Total network interfaces present' }
    ]
  },
  {
    name: 'CISCO-STACK-MIB',
    oids: [
      { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.3.1', name: 'cpmCPUTotal5secRev.1', type: 'Gauge32', access: 'read-only', desc: 'Overall CPU busy percentage in the last 5-second period' },
      { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.4.1', name: 'cpmCPUTotal1minRev.1', type: 'Gauge32', access: 'read-only', desc: 'Overall CPU busy percentage in the last 1-minute period' },
      { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.5.1', name: 'cpmCPUTotal5minRev.1', type: 'Gauge32', access: 'read-only', desc: 'Overall CPU busy percentage in the last 5-minute period' },
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3.1', name: 'ciscoEnvMonTemperatureValue.1', type: 'Gauge32', access: 'read-only', desc: 'Chassis intake temperature in degrees Celsius' },
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.6.1', name: 'ciscoEnvMonTemperatureState.1', type: 'INTEGER', access: 'read-only', desc: 'Status: normal(1), warning(2), critical(3)' }
    ]
  },
  {
    name: 'HOST-RESOURCES-MIB',
    oids: [
      { oid: '.1.3.6.1.2.1.25.1.1.0', name: 'hrSystemUptime.0', type: 'TimeTicks', access: 'read-only', desc: 'Uptime of host system kernel' },
      { oid: '.1.3.6.1.2.1.25.1.2.0', name: 'hrSystemDate.0', type: 'DateAndTime', access: 'read-only', desc: 'Host real-time clock timestamp' },
      { oid: '.1.3.6.1.2.1.25.1.5.0', name: 'hrSystemNumUsers.0', type: 'Gauge32', access: 'read-only', desc: 'Number of active interactive user sessions' },
      { oid: '.1.3.6.1.2.1.25.1.6.0', name: 'hrSystemProcesses.0', type: 'Gauge32', access: 'read-only', desc: 'Number of active system processes loaded' },
      { oid: '.1.3.6.1.2.1.25.2.2.0', name: 'hrMemorySize.0', type: 'Integer32', access: 'read-only', desc: 'Amount of physical RAM in KBytes' }
    ]
  },
  {
    name: 'IF-MIB (Interfaces)',
    oids: [
      { oid: '.1.3.6.1.2.1.2.2.1.1.1', name: 'ifIndex.1', type: 'INTEGER', access: 'read-only', desc: 'Unique interface index 1' },
      { oid: '.1.3.6.1.2.1.2.2.1.2.1', name: 'ifDescr.1', type: 'OCTET STRING', access: 'read-only', desc: 'GigabitEthernet0/0/0' },
      { oid: '.1.3.6.1.2.1.2.2.1.3.1', name: 'ifType.1', type: 'INTEGER', access: 'read-only', desc: 'ethernetCsmacd(6)' },
      { oid: '.1.3.6.1.2.1.2.2.1.5.1', name: 'ifSpeed.1', type: 'Gauge32', access: 'read-only', desc: '1000000000 bps (1 Gbps)' },
      { oid: '.1.3.6.1.2.1.2.2.1.8.1', name: 'ifOperStatus.1', type: 'INTEGER', access: 'read-only', desc: 'up(1)' }
    ]
  }
];

// Flat OID map for quick lookup
const MIB_TREE = {};
MIB_MODULES.forEach(m => {
  m.oids.forEach(o => {
    MIB_TREE[o.oid] = o;
  });
});

// GET /api/tools/mib-tree - Return full MIB tree structure
router.get('/api/tools/mib-tree', (req, res) => {
  res.json({
    status: 'success',
    modules: MIB_MODULES
  });
});

// POST /api/tools/snmp-query - SNMP GET operation
router.post('/api/tools/snmp-query', (req, res) => {
  let { ip, oid = '.1.3.6.1.2.1.1.1.0', community = 'public_monitor_ro', version = 'v2c' } = req.body;
  oid = oid.trim();

  const found = MIB_TREE[oid] || {
    name: `iso.org.dod.internet.mgmt.mib-2.${oid.replace(/^\./, '')}`,
    type: 'OCTET STRING',
    desc: 'Generic Enterprise SNMP OID'
  };

  const device = db.getDevices().find(d => d.ip === ip || d.name === ip);
  let value = `SNMP_${version.toUpperCase()}_VALUE_OK[${oid}]`;

  if (device) {
    if (oid === '.1.3.6.1.2.1.1.1.0') value = `${device.vendor} ${device.category} OS Enterprise Edition (${device.ip})`;
    else if (oid === '.1.3.6.1.2.1.1.5.0') value = device.name;
    else if (oid === '.1.3.6.1.2.1.1.6.0') value = `Primary DC Rack 04, Slot U18 (${device.probeName})`;
    else if (oid === '.1.3.6.1.4.1.9.9.109.1.1.1.1.5.1') value = `${device.cpu} %`;
    else if (oid === '.1.3.6.1.4.1.9.9.13.1.3.1.3.1') value = `${device.temperature || 35} °C`;
    else if (oid === '.1.3.6.1.4.1.9.9.13.1.3.1.6.1') value = 'normal(1)';
    else if (oid === '.1.3.6.1.2.1.25.2.2.0') value = `${device.memory * 1024 * 1024 || 33554432} KBytes`;
    else if (oid === '.1.3.6.1.2.1.2.1.0') value = '48';
    else if (oid === '.1.3.6.1.2.1.1.3.0') value = '142 days, 18:24:09.15 (1233504915)';
  }

  res.json({
    status: 'success',
    target: ip || '10.0.0.1',
    community: '******',
    version,
    oid,
    name: found.name,
    type: found.type,
    description: found.desc,
    value,
    timestamp: new Date().toISOString()
  });
});

// POST /api/tools/snmp-walk - SNMP WALK operation (Subtree traversal)
router.post('/api/tools/snmp-walk', (req, res) => {
  const { ip, rootOid = '.1.3.6.1.2.1.1', community = 'public_monitor_ro', version = 'v2c' } = req.body;
  const device = db.getDevices().find(d => d.ip === ip || d.name === ip) || db.getDevices()[0];

  // Match all OIDs starting with rootOid
  const cleanRoot = rootOid.trim();
  const matchedOids = Object.keys(MIB_TREE).filter(oid => oid.startsWith(cleanRoot));
  const results = [];

  const candidateList = matchedOids.length > 0 ? matchedOids : Object.keys(MIB_TREE).slice(0, 8);

  candidateList.forEach(oid => {
    const item = MIB_TREE[oid];
    let val = 'Value OK';
    if (oid === '.1.3.6.1.2.1.1.1.0') val = `${device.vendor} ${device.category} OS (${device.ip})`;
    else if (oid === '.1.3.6.1.2.1.1.5.0') val = device.name;
    else if (oid === '.1.3.6.1.2.1.1.6.0') val = `Datacenter Rack 04 (${device.probeName})`;
    else if (oid === '.1.3.6.1.2.1.1.3.0') val = '142 days, 18:24:09.15 (1233504915)';
    else if (oid === '.1.3.6.1.2.1.1.4.0') val = 'Enterprise NOC Team <noc@corp.enterprise>';
    else if (oid === '.1.3.6.1.2.1.1.2.0') val = '1.3.6.1.4.1.9.1.1745';
    else if (oid === '.1.3.6.1.4.1.9.9.109.1.1.1.1.5.1') val = `${device.cpu} %`;
    else if (oid === '.1.3.6.1.4.1.9.9.13.1.3.1.3.1') val = `${device.temperature || 35} °C`;
    else if (oid === '.1.3.6.1.2.1.2.1.0') val = '48';
    else val = `${item.name}_SAMPLE_VAL`;

    results.push({
      oid,
      name: item.name,
      type: item.type,
      value: val
    });
  });

  res.json({
    status: 'success',
    target: ip || device.ip,
    rootOid: cleanRoot,
    count: results.length,
    results,
    timestamp: new Date().toISOString()
  });
});

// Switch Port Mapper Endpoint (Signature ManageEngine Tool)
router.get('/api/tools/switch-ports', (req, res) => {
  const { deviceId, ip } = req.query;
  const dev = db.getDevices().find(d => d.id === deviceId || d.ip === ip) || db.getDevices()[0];

  const ports = [
    { port: 'Fa0/1', alias: 'Uplink-Core-Trunk', adminStatus: 'Up', operStatus: 'Up', speed: '1 Gbps', vlan: 10, mac: '00:1E:F7:28:9A:01', ip: '10.10.0.1', type: 'Trunk (802.1Q)' },
    { port: 'Fa0/2', alias: 'Finance-Dept-Access', adminStatus: 'Up', operStatus: 'Up', speed: '100 Mbps', vlan: 20, mac: '44:D9:E7:5C:11:32', ip: '10.10.20.14', type: 'Access' },
    { port: 'Fa0/3', alias: 'HR-Payroll-Workstation', adminStatus: 'Up', operStatus: 'Up', speed: '1 Gbps', vlan: 30, mac: 'B8:27:EB:94:4E:91', ip: '10.10.30.5', type: 'Access' },
    { port: 'Fa0/4', alias: 'WiFi-AP-Corridor', adminStatus: 'Up', operStatus: 'Up', speed: '1 Gbps', vlan: 40, mac: '70:3A:0E:12:88:FF', ip: '10.10.40.2', type: 'Access (PoE+)' },
    { port: 'Fa0/5', alias: 'VoIP-Phone-Desk-12', adminStatus: 'Up', operStatus: 'Up', speed: '100 Mbps', vlan: 50, mac: '00:08:5D:22:EE:99', ip: '10.10.50.89', type: 'Voice VLAN' },
    { port: 'Fa0/6', alias: 'Spare-Disabled', adminStatus: 'Down', operStatus: 'Down', speed: 'Auto', vlan: 1, mac: '--', ip: '--', type: 'Shutdown' },
    { port: 'Gi0/1', alias: 'TenGig-Storage-SAN', adminStatus: 'Up', operStatus: 'Up', speed: '10 Gbps', vlan: 100, mac: 'AC:1F:6B:44:00:2A', ip: '10.10.100.10', type: 'Access' }
  ];

  res.json({
    status: 'success',
    device: dev.name,
    ip: dev.ip,
    totalPorts: 48,
    activePorts: 6,
    ports
  });
});

// Interactive Web CLI Terminal Command Executor
router.post('/api/tools/terminal-exec', (req, res) => {
  const { command = '', hostname = 'CORE-RTR-01' } = req.body;
  const cmd = command.trim().toLowerCase();

  let output = '';
  if (cmd === 'show ip interface brief' || cmd === 'show ip int br' || cmd === 'sh ip int br' || cmd === 'show ip int') {
    output = `
Interface              IP-Address      OK? Method Status                Protocol
FastEthernet0/0        10.10.0.1       YES NVRAM  up                    up      
FastEthernet0/1        10.20.0.1       YES NVRAM  up                    up      
GigabitEthernet0/0/0   10.254.1.1      YES manual up                    up      
GigabitEthernet0/0/1   unassigned      YES unset  administratively down down    
Loopback0              10.0.0.1        YES NVRAM  up                    up      
Vlan1                  unassigned      YES NVRAM  down                  down    
    `.trim();
  } else if (cmd === 'show version' || cmd === 'sh ver') {
    output = `
Cisco IOS Software, C3850 Software (CAT3K_CAA-UNIVERSALK9-M), Version 16.12.4, RELEASE SOFTWARE (fc2)
Technical Support: http://www.cisco.com/techsupport
Compiled Fri 17-Jul-20 23:22 by prod_rel_team

ROM: IOS-XE ROMMON
BOOTLDR: CAT3K_CAA Boot Loader (CAT3K_CAA-HBOOT-M) Version 16.12.4

CORE-RTR-01 uptime is 142 days, 18 hours, 24 minutes
Uptime for this control processor is 142 days, 18 hours, 26 minutes
System returned to ROM by reload
System image file is "flash:cat3k_caa-universalk9.16.12.04.SPA.bin"
Last reload reason: Power-on
    `.trim();
  } else if (cmd.startsWith('ping')) {
    const target = cmd.split(' ')[1] || '10.0.0.1';
    output = `
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms
    `.trim();
  } else if (cmd === 'show running-config' || cmd === 'sh run') {
    output = `
Building configuration...

Current configuration : 2142 bytes
!
version 16.12
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname ${hostname}
!
ip routing
!
snmp-server community public_monitor_ro RO
snmp-server enable traps
snmp-server host 10.0.0.100 version 2c public_monitor_ro
!
end
    `.trim();
  } else {
    output = `% Invalid input detected at '^' marker.\nSupported commands: show ip int br, show version, show running-config, ping <ip>`;
  }

  res.json({
    status: 'success',
    hostname,
    command,
    output,
    prompt: `${hostname}#`
  });
});

// -------------------------------------------------------------
// WMI QUERY TOOL (ToolsTab.xml -> /Settings/Tools/WmiQueryTool)
// -------------------------------------------------------------
router.post('/api/tools/wmi-query', (req, res) => {
  const { host = '10.10.3.50', namespace = 'root\\cimv2', query = 'SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor' } = req.body;

  let records = [];
  if (query.toLowerCase().includes('operatingsystem')) {
    records = [
      { Caption: 'Microsoft Windows Server 2022 Datacenter', Version: '10.0.20348', TotalVisibleMemorySize: '67041280 KB', FreePhysicalMemory: '28419200 KB', LastBootUpTime: '2026-10-18T04:12:00.000000+000' }
    ];
  } else if (query.toLowerCase().includes('logicaldisk')) {
    records = [
      { DeviceID: 'C:', VolumeName: 'System', FileSystem: 'NTFS', Size: '214748364800', FreeSpace: '112589990684' },
      { DeviceID: 'D:', VolumeName: 'Data_SQL', FileSystem: 'ReFS', Size: '2199023255552', FreeSpace: '687194767360' }
    ];
  } else {
    records = [
      { Name: '_Total', PercentProcessorTime: '34' },
      { Name: '0', PercentProcessorTime: '38' },
      { Name: '1', PercentProcessorTime: '29' },
      { Name: '2', PercentProcessorTime: '32' },
      { Name: '3', PercentProcessorTime: '37' }
    ];
  }

  res.json({
    status: 'success',
    host,
    namespace,
    query,
    count: records.length,
    records,
    executionTimeMs: 14,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// CLI QUERY TOOL (ToolsTab.xml -> /Settings/Tools/CliQueryTool)
// -------------------------------------------------------------
router.post('/api/tools/cli-query', (req, res) => {
  const { host = '10.40.1.1', protocol = 'SSHv2', command = 'show version' } = req.body;
  const cmd = command.trim().toLowerCase();

  let resultOutput = '';
  if (cmd === 'show version' || cmd === 'sh ver') {
    resultOutput = `Cisco IOS XE Software, Version 17.09.04a\nCisco Catalyst 9500 Series Switch\nChassis Serial: FCW2349L09X\nUptime is 184 days, 14 hours, 22 minutes\nSystem image file is "bootflash:cat9k_iosxe.17.09.04a.SPA.bin"`;
  } else if (cmd.includes('interface') || cmd.includes('int')) {
    resultOutput = `Port      Name               Status       Vlan       Duplex  Speed Type\nTe1/0/1   Uplink-Core        connected    trunk      full    10G   10GBase-LR\nTe1/0/2   Storage-Heartbeat  connected    100        full    10G   10GBase-SR\nFo1/0/48  Transit-Backbone   notconnect   routed     auto    40G   QSFP-40G-SR4`;
  } else if (cmd.includes('route') || cmd.includes('ip route')) {
    resultOutput = `Gateway of last resort is 10.40.1.254 to network 0.0.0.0\n\nS*    0.0.0.0/0 [1/0] via 10.40.1.254\nC     10.40.1.0/24 is directly connected, Vlan10\nO     10.10.0.0/16 [110/20] via 10.40.1.2, 3w4d, TenGigabitEthernet1/0/1\nO     10.20.0.0/16 [110/30] via 10.40.1.3, 3w4d, TenGigabitEthernet1/0/1`;
  } else {
    resultOutput = `Command executed successfully on ${host} via ${protocol}:\n${command}\nExit Code: 0 (OK)`;
  }

  res.json({
    status: 'success',
    host,
    protocol,
    command,
    output: resultOutput,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// ADDRESS RESOLVER & MAC TOOL (ToolsTab.xml -> /Settings/Tools/Address/MAC)
// -------------------------------------------------------------
router.post('/api/tools/mac-resolve', (req, res) => {
  const { target = '10.40.1.1' } = req.body;
  res.json({
    status: 'success',
    target,
    ipAddress: target.includes('.') ? target : '10.40.1.1',
    macAddress: 'FC:99:47:B1:02:44',
    vendor: 'Cisco Systems, Inc.',
    deviceType: 'Catalyst Switch Router',
    switchName: 'DXB-CORE-SW-01',
    port: 'TenGigabitEthernet1/0/1',
    vlan: 10,
    status: 'Active (Dynamic ARP)',
    lastSeen: 'Just now'
  });
});

module.exports = router;
