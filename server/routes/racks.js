const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Racks dataset
const RACKS = [
  {
    id: 'RACK-NYC-01',
    name: 'NYC-DC-Core-Rack-01',
    datacenter: 'Primary Data Center (New York)',
    probeId: '1',
    probeName: 'US-East-Central-Probe',
    totalUnits: 42,
    temperature: '24.5 °C',
    powerDraw: '3.4 kW',
    usedUnits: 14,
    units: [
      {
        startU: 40,
        heightU: 2,
        deviceId: '1',
        deviceName: 'CORE-RTR-01',
        type: 'Cisco ASR 1001-X Router',
        category: 'Router',
        image: '/images/racks/front/Cisco-Switch-1U.png',
        status: 'Clear',
        cpu: 28,
        temp: '34°C',
        power: '350W'
      },
      {
        startU: 38,
        heightU: 1,
        deviceId: '2',
        deviceName: 'DIST-SW-01',
        type: 'Cisco Catalyst 3850 48P',
        category: 'Switch',
        image: '/images/racks/front/Cisco-Switch-1U.png',
        status: 'Clear',
        cpu: 31,
        temp: '32°C',
        power: '220W'
      },
      {
        startU: 36,
        heightU: 1,
        deviceId: '3',
        deviceName: 'DIST-SW-02',
        type: 'Cisco Catalyst 3850 48P',
        category: 'Switch',
        image: '/images/racks/front/Cisco-Switch-1U.png',
        status: 'Trouble',
        cpu: 78,
        temp: '41°C',
        power: '240W'
      },
      {
        startU: 30,
        heightU: 2,
        deviceId: '4',
        deviceName: 'SRV-DC-01',
        type: 'Dell PowerEdge R740 (Active Directory)',
        category: 'Server',
        image: '/images/racks/front/DellServer_1U.png',
        status: 'Clear',
        cpu: 24,
        temp: '28°C',
        power: '480W'
      },
      {
        startU: 26,
        heightU: 2,
        deviceId: '5',
        deviceName: 'SRV-APP-01',
        type: 'HP ProLiant DL380 Gen10',
        category: 'Server',
        image: '/images/racks/front/HP-Server-1U.png',
        status: 'Critical',
        cpu: 96,
        temp: '58°C',
        power: '520W'
      },
      {
        startU: 20,
        heightU: 2,
        deviceId: '6',
        deviceName: 'ESXI-HOST-01',
        type: 'VMware ESXi Enterprise Cluster Node',
        category: 'Server',
        image: '/images/racks/front/VMware-Server-1U.png',
        status: 'Clear',
        cpu: 44,
        temp: '29°C',
        power: '450W'
      },
      {
        startU: 1,
        heightU: 4,
        deviceId: '7',
        deviceName: 'UPS-RACK-01',
        type: 'APC Symmetra LX 16kVA N+1',
        category: 'UPS',
        image: '/images/deviceicons/GenericUps.png',
        status: 'Clear',
        cpu: 12,
        temp: '26°C',
        power: '3.4 kW (46% Load)'
      }
    ]
  },
  {
    id: 'RACK-LON-02',
    name: 'LON-Colo-Rack-02',
    datacenter: 'Equinix LD4 (London Colocation)',
    probeId: '2',
    probeName: 'EMEA-London-Probe-02',
    totalUnits: 42,
    temperature: '21.8 °C',
    powerDraw: '2.8 kW',
    usedUnits: 10,
    units: [
      {
        startU: 40,
        heightU: 2,
        deviceId: '8',
        deviceName: 'LON-EDGE-RTR-01',
        type: 'Juniper MX204 Universal Routing',
        category: 'Router',
        image: '/images/racks/front/Cisco-Switch-1U.png',
        status: 'Clear',
        cpu: 19,
        temp: '31°C',
        power: '280W'
      },
      {
        startU: 35,
        heightU: 2,
        deviceId: '9',
        deviceName: 'LON-SAN-SRV-01',
        type: 'Dell EMC PowerEdge R650',
        category: 'Server',
        image: '/images/racks/front/DellServer_1U.png',
        status: 'Trouble',
        cpu: 82,
        temp: '37°C',
        power: '490W'
      },
      {
        startU: 28,
        heightU: 2,
        deviceId: '10',
        deviceName: 'LON-VMW-02',
        type: 'HP ProLiant DL360 Gen10',
        category: 'Server',
        image: '/images/racks/front/HP-Server-1U.png',
        status: 'Clear',
        cpu: 35,
        temp: '27°C',
        power: '410W'
      },
      {
        startU: 1,
        heightU: 4,
        deviceId: '11',
        deviceName: 'UPS-LON-01',
        type: 'Eaton 9PX 11kVA High Density',
        category: 'UPS',
        image: '/images/deviceicons/GenericUps.png',
        status: 'Clear',
        cpu: 10,
        temp: '22°C',
        power: '2.8 kW (38% Load)'
      }
    ]
  }
];

// GET /api/racks/list
router.get('/api/racks/list', (req, res) => {
  const { probeId } = req.query;
  let list = RACKS;
  if (probeId && probeId !== 'all') {
    list = list.filter(r => r.probeId === String(probeId));
  }
  res.json({
    status: 'success',
    racks: list
  });
});

module.exports = router;