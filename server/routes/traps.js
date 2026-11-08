const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine SNMP Traps Dataset
const SNMP_TRAPS = [
  {
    id: 'TRAP-10892',
    trapOid: '.1.3.6.1.6.3.1.1.5.3 (linkDown)',
    trapName: 'linkDown',
    sourceIp: '10.10.0.1',
    deviceName: 'CORE-SW-01',
    probeName: 'US-East-Central-Probe',
    enterprise: 'iso.org.dod.internet.snmpV2.snmpModules.snmpMIB',
    severity: 'Critical',
    time: '2 mins ago',
    varbinds: [
      { oid: '.1.3.6.1.2.1.2.2.1.1.24', name: 'ifIndex.24', value: '24' },
      { oid: '.1.3.6.1.2.1.2.2.1.2.24', name: 'ifDescr.24', value: 'TenGigabitEthernet1/0/24' },
      { oid: '.1.3.6.1.2.1.2.2.1.8.24', name: 'ifOperStatus.24', value: 'down(2)' }
    ]
  },
  {
    id: 'TRAP-10891',
    trapOid: '.1.3.6.1.4.1.9.9.13.3.0.2 (ciscoEnvMonTemperatureWarning)',
    trapName: 'ciscoEnvMonTemperatureWarning',
    sourceIp: '10.20.0.1',
    deviceName: 'DIST-SW-02',
    probeName: 'US-East-Central-Probe',
    enterprise: 'ciscoEnvMonMIBNotificationPrefix',
    severity: 'Trouble',
    time: '14 mins ago',
    varbinds: [
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3.1', name: 'ciscoEnvMonTemperatureValue.1', value: '58 °C' },
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.6.1', name: 'ciscoEnvMonTemperatureState.1', value: 'warning(2)' }
    ]
  },
  {
    id: 'TRAP-10890',
    trapOid: '.1.3.6.1.6.3.1.1.5.5 (authenticationFailure)',
    trapName: 'authenticationFailure',
    sourceIp: '192.168.10.254',
    deviceName: 'FW-DMZ-01',
    probeName: 'APAC-Tokyo-Probe-03',
    enterprise: 'snmpTraps',
    severity: 'Attention',
    time: '32 mins ago',
    varbinds: [
      { oid: '.1.3.6.1.2.1.11.30.0', name: 'snmpInBadCommunityNames.0', value: '14 attempts from 192.168.10.88' }
    ]
  },
  {
    id: 'TRAP-10889',
    trapOid: '.1.3.6.1.2.1.15.0.2 (bgpPeerDown)',
    trapName: 'bgpPeerDown',
    sourceIp: '10.0.0.1',
    deviceName: 'CORE-RTR-01',
    probeName: 'US-East-Central-Probe',
    enterprise: 'bgpTraps',
    severity: 'Critical',
    time: '1 hour ago',
    varbinds: [
      { oid: '.1.3.6.1.2.1.15.3.1.14.10.254.1.1', name: 'bgpPeerLastError', value: '06 04 (Cease - Administrative Reset)' }
    ]
  },
  {
    id: 'TRAP-10888',
    trapOid: '.1.3.6.1.6.3.1.1.5.4 (linkUp)',
    trapName: 'linkUp',
    sourceIp: '10.30.0.1',
    deviceName: 'ACCESS-SW-03',
    probeName: 'EMEA-London-Probe-02',
    enterprise: 'snmpTraps',
    severity: 'Clear',
    time: '2 hours ago',
    varbinds: [
      { oid: '.1.3.6.1.2.1.2.2.1.1.12', name: 'ifIndex.12', value: '12' },
      { oid: '.1.3.6.1.2.1.2.2.1.8.12', name: 'ifOperStatus.12', value: 'up(1)' }
    ]
  }
];

// Authentic ManageEngine Syslog Dataset
const SYSLOG_MESSAGES = [
  {
    id: 'LOG-5501',
    time: new Date(Date.now() - 60000).toLocaleTimeString(),
    host: 'CORE-RTR-01',
    ip: '10.0.0.1',
    probe: 'US-East-Central-Probe',
    facility: 'LOCAL7',
    severity: 'CRITICAL',
    message: '%BGP-5-ADJCHANGE: neighbor 10.254.1.1 Down BGP Notification sent (Cease)'
  },
  {
    id: 'LOG-5502',
    time: new Date(Date.now() - 180000).toLocaleTimeString(),
    host: 'DIST-SW-02',
    ip: '10.20.0.1',
    probe: 'US-East-Central-Probe',
    facility: 'LOCAL7',
    severity: 'WARNING',
    message: '%ENVMON-4-ENV_WARN: Chassis intake thermal sensor reached 58 C threshold'
  },
  {
    id: 'LOG-5503',
    time: new Date(Date.now() - 420000).toLocaleTimeString(),
    host: 'FW-DMZ-01',
    ip: '192.168.10.254',
    probe: 'APAC-Tokyo-Probe-03',
    facility: 'AUTH',
    severity: 'ALERT',
    message: '%SEC-3-BRUTE_FORCE: Multiple failed SSH attempts on port 22 from 192.168.10.88'
  },
  {
    id: 'LOG-5504',
    time: new Date(Date.now() - 720000).toLocaleTimeString(),
    host: 'SRV-DC-01',
    ip: '10.10.100.10',
    probe: 'US-East-Central-Probe',
    facility: 'SYSTEM',
    severity: 'INFORMATIONAL',
    message: 'Microsoft-Windows-Security-Auditing: Event ID 4624 (Successful User Logon: DOMAIN\\sysops)'
  },
  {
    id: 'LOG-5505',
    time: new Date(Date.now() - 1200000).toLocaleTimeString(),
    host: 'ACCESS-SW-03',
    ip: '10.30.0.1',
    probe: 'EMEA-London-Probe-02',
    facility: 'LOCAL7',
    severity: 'NOTICE',
    message: '%LINK-3-UPDOWN: Interface GigabitEthernet0/12, changed state to up'
  }
];

router.get('/api/traps/list', (req, res) => {
  res.json({
    status: 'success',
    total: SNMP_TRAPS.length,
    traps: SNMP_TRAPS
  });
});

router.get('/api/syslog/list', (req, res) => {
  res.json({
    status: 'success',
    total: SYSLOG_MESSAGES.length,
    messages: SYSLOG_MESSAGES
  });
});

module.exports = router;