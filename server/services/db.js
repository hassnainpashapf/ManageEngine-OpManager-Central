const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/seed.json');

class Database {
  constructor() {
    this.data = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  }

  // Central info
  getCentral() {
    return this.data.central;
  }

  // Probes
  getProbes() {
    return this.data.probes;
  }

  getProbeById(id) {
    if (!id) return null;
    const probeId = Number(id);
    return this.data.probes.find(p => p.id === probeId || String(p.id) === String(id) || p.name === id);
  }

  addProbe(probeData) {
    const newId = Math.max(...this.data.probes.map(p => p.id), 100) + 1;
    const newProbe = {
      id: newId,
      name: probeData.name || `Probe-${newId}`,
      displayName: probeData.displayName || probeData.name,
      location: probeData.location || 'Remote Site',
      ip: probeData.ip || '127.0.0.1',
      port: Number(probeData.port) || 8060,
      status: 'Online',
      version: '12.9.203',
      build: 129203,
      latency: Math.floor(Math.random() * 40) + 10,
      devicesCount: 0,
      monitorsCount: 0,
      activeAlarms: 0,
      lastSync: 'Just now',
      lastSyncTime: Date.now(),
      syncStatus: 'Synchronized',
      authKey: `ee-probe-${newId}-auth-key`,
      cpu: 18,
      memory: 32,
      disk: 25,
      flowEnabled: false,
      ncmEnabled: false
    };
    this.data.probes.push(newProbe);
    this.data.central.managedProbesCount = this.data.probes.length;
    return newProbe;
  }

  syncProbe(id) {
    const probe = this.getProbeById(id);
    if (!probe) return null;
    probe.lastSync = 'Just now';
    probe.lastSyncTime = Date.now();
    probe.syncStatus = 'Synchronized';
    probe.status = 'Online';
    return probe;
  }

  deleteProbe(id) {
    const probeId = Number(id);
    const idx = this.data.probes.findIndex(p => p.id === probeId);
    if (idx !== -1) {
      const removed = this.data.probes.splice(idx, 1)[0];
      // remove or reassign devices associated
      this.data.devices = this.data.devices.filter(d => d.probeId !== probeId);
      this.data.alarms = this.data.alarms.filter(a => a.probeId !== probeId);
      this.data.central.managedProbesCount = this.data.probes.length;
      this.data.central.totalDevicesCount = this.data.devices.length;
      return removed;
    }
    return null;
  }

  // Devices
  getDevices(probeId = null, category = null, status = null) {
    let list = this.data.devices;
    if (probeId && probeId !== 'all') {
      const pId = Number(probeId);
      list = list.filter(d => d.probeId === pId);
    }
    if (category && category !== 'all') {
      list = list.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'all') {
      list = list.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getDeviceById(id) {
    if (!id) return null;
    const strId = String(id);
    return this.data.devices.find(d => d.id === strId || d.id === `dev_${strId}` || d.id.endsWith(`_${strId}`)) || (strId === '1' ? this.data.devices[0] : null);
  }

  addDevice(deviceData) {
    const newId = `dev_${Date.now()}`;
    const probe = this.getProbeById(deviceData.probeId) || this.data.probes[0];
    const newDevice = {
      id: newId,
      name: deviceData.name || `Device-${deviceData.ip}`,
      displayName: deviceData.displayName || deviceData.name,
      probeId: probe.id,
      probeName: probe.displayName,
      category: deviceData.category || 'Server',
      type: deviceData.type || 'Generic SNMP Device',
      vendor: deviceData.vendor || 'Generic',
      ip: deviceData.ip,
      mac: deviceData.mac || '00:50:56:00:00:01',
      os: deviceData.os || 'Linux / Embedded',
      status: 'Clear',
      availability: 100.0,
      responseTime: Math.floor(Math.random() * 20) + 2,
      packetLoss: 0,
      cpu: Math.floor(Math.random() * 40) + 15,
      memory: Math.floor(Math.random() * 40) + 25,
      disk: Math.floor(Math.random() * 40) + 20,
      temperature: 30,
      fansStatus: 'OK',
      powerStatus: 'OK',
      snmpVersion: deviceData.snmpVersion || 'v2c',
      snmpPort: 161,
      lastPolled: 'Just now',
      interfaces: [
        { name: 'eth0', alias: 'Primary Management Port', type: 'ethernetCsmacd', speed: '1 Gbps', status: 'Up', inTraffic: 45.0, outTraffic: 60.0, inUtil: 4.5, outUtil: 6.0, errors: 0 }
      ]
    };
    this.data.devices.push(newDevice);
    probe.devicesCount++;
    this.data.central.totalDevicesCount = this.data.devices.length;
    return newDevice;
  }

  deleteDevice(id) {
    const idx = this.data.devices.findIndex(d => d.id === id);
    if (idx !== -1) {
      const removed = this.data.devices.splice(idx, 1)[0];
      const probe = this.getProbeById(removed.probeId);
      if (probe && probe.devicesCount > 0) probe.devicesCount--;
      this.data.alarms = this.data.alarms.filter(a => a.deviceId !== id);
      this.data.central.totalDevicesCount = this.data.devices.length;
      return removed;
    }
    return null;
  }

  // Alarms
  getAlarms(probeId = null, severity = null) {
    let list = this.data.alarms;
    if (probeId && probeId !== 'all') {
      const pId = Number(probeId);
      list = list.filter(a => a.probeId === pId);
    }
    if (severity && severity !== 'all') {
      list = list.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
    }
    return list;
  }

  acknowledgeAlarm(id, user = 'admin@opmanager') {
    const alarm = this.data.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.acknowledged = true;
      alarm.ackUser = user;
      return alarm;
    }
    return null;
  }

  clearAlarm(id) {
    const idx = this.data.alarms.findIndex(a => a.id === id);
    if (idx !== -1) {
      const cleared = this.data.alarms.splice(idx, 1)[0];
      // update probe active alarms
      const probe = this.getProbeById(cleared.probeId);
      if (probe && probe.activeAlarms > 0) probe.activeAlarms--;
      return cleared;
    }
    return null;
  }

  // Credentials
  getCredentials() {
    return this.data.credentials;
  }

  addCredential(cred) {
    const newCred = {
      id: `cred_${Date.now()}`,
      name: cred.name,
      type: cred.type,
      userName: cred.userName || '',
      authProtocol: cred.authProtocol || '',
      privProtocol: cred.privProtocol || '',
      community: cred.community || '',
      domain: cred.domain || '',
      associatedDevices: 0
    };
    this.data.credentials.push(newCred);
    return newCred;
  }

  // Discovery
  getDiscoveryProfiles() {
    return this.data.discoveryProfiles;
  }

  addDiscoveryProfile(profile) {
    const probe = this.getProbeById(profile.probeId) || this.data.probes[0];
    const newProfile = {
      id: `disc_${Date.now()}`,
      name: profile.name,
      probeId: probe.id,
      probeName: probe.displayName,
      ipRange: profile.ipRange || '10.0.0.1 - 10.0.0.50',
      cidr: profile.cidr || '10.0.0.0/24',
      credentials: profile.credentials || ['Global-SNMPv2-Community'],
      schedule: profile.schedule || 'Manual',
      status: 'Ready',
      discoveredCount: 0,
      lastRun: 'Never'
    };
    this.data.discoveryProfiles.push(newProfile);
    return newProfile;
  }

  // CCM Configurations
  getCCMConfigurations() {
    return this.data.ccmConfigurations;
  }

  pushCCMConfig(configName, targetProbeId = 'all') {
    const config = this.data.ccmConfigurations.find(c => c.configName.toLowerCase() === configName.toLowerCase());
    if (config) {
      config.lastPushed = 'Just now';
      config.status = targetProbeId === 'all' 
        ? `Synced to ${this.data.probes.length}/${this.data.probes.length} Probes`
        : `Synced to 1 Probe (ID: ${targetProbeId})`;
      return config;
    }
    return null;
  }
}

module.exports = new Database();
