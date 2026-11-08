const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');

class Database {
  constructor() {
    this._saveTimer = null;
    this.data = this.initData();
  }

  initData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.devices && parsed.probes) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[DB] Existing db.json read error, falling back to seed.json:', e.message);
    }

    try {
      const seedRaw = fs.readFileSync(SEED_FILE, 'utf-8');
      const seedData = JSON.parse(seedRaw);
      // Persist initial copy to db.json
      fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
      return seedData;
    } catch (e) {
      console.error('[DB] Critical error loading seed.json:', e.message);
      return {
        central: { status: 'Online', managedProbesCount: 0, totalDevicesCount: 0 },
        probes: [],
        devices: [],
        alarms: [],
        credentials: [],
        discoveryProfiles: [],
        ccmConfigurations: []
      };
    }
  }

  save() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
    }
    this._saveTimer = setTimeout(() => {
      this.saveSync();
    }, 300);
  }

  saveSync() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save db.json:', err.message);
    }
  }

  // Central info
  getCentral() {
    return this.data.central;
  }

  updateCentral(updateData) {
    this.data.central = { ...this.data.central, ...updateData };
    this.save();
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
    this.save();
    return newProbe;
  }

  syncProbe(id) {
    const probe = this.getProbeById(id);
    if (!probe) return null;
    probe.lastSync = 'Just now';
    probe.lastSyncTime = Date.now();
    probe.syncStatus = 'Synchronized';
    probe.status = 'Online';
    this.save();
    return probe;
  }

  deleteProbe(id) {
    const probeId = Number(id);
    const idx = this.data.probes.findIndex(p => p.id === probeId);
    if (idx !== -1) {
      const removed = this.data.probes.splice(idx, 1)[0];
      this.data.devices = this.data.devices.filter(d => d.probeId !== probeId);
      this.data.alarms = this.data.alarms.filter(a => a.probeId !== probeId);
      this.data.central.managedProbesCount = this.data.probes.length;
      this.data.central.totalDevicesCount = this.data.devices.length;
      this.save();
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
      cpu: deviceData.cpu !== undefined ? Number(deviceData.cpu) : Math.floor(Math.random() * 40) + 15,
      memory: deviceData.memory !== undefined ? Number(deviceData.memory) : Math.floor(Math.random() * 40) + 25,
      disk: deviceData.disk !== undefined ? Number(deviceData.disk) : Math.floor(Math.random() * 40) + 20,
      temperature: 30,
      fansStatus: 'OK',
      powerStatus: 'OK',
      snmpVersion: deviceData.snmpVersion || 'v2c',
      snmpPort: 161,
      lastPolled: 'Just now',
      isAgentMonitored: Boolean(deviceData.isAgentMonitored),
      interfaces: deviceData.interfaces || [
        { name: 'eth0', alias: 'Primary Management Port', type: 'ethernetCsmacd', speed: '1 Gbps', status: 'Up', inTraffic: 45.0, outTraffic: 60.0, inUtil: 4.5, outUtil: 6.0, errors: 0 }
      ]
    };
    this.data.devices.push(newDevice);
    probe.devicesCount++;
    this.data.central.totalDevicesCount = this.data.devices.length;
    this.save();
    return newDevice;
  }

  updateDevice(id, updateData) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    Object.assign(device, updateData);
    this.save();
    return device;
  }

  deleteDevice(id) {
    const idx = this.data.devices.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) {
      const removed = this.data.devices.splice(idx, 1)[0];
      const probe = this.getProbeById(removed.probeId);
      if (probe && probe.devicesCount > 0) probe.devicesCount--;
      this.data.alarms = this.data.alarms.filter(a => String(a.deviceId) !== String(id));
      this.data.central.totalDevicesCount = this.data.devices.length;
      this.save();
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

  addAlarm(alarmData) {
    const newId = `alm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newAlarm = {
      id: newId,
      alarmId: newId,
      deviceId: alarmData.deviceId || null,
      device: alarmData.device || alarmData.deviceName || 'System',
      deviceName: alarmData.deviceName || alarmData.device || 'System',
      ip: alarmData.ip || '10.0.0.1',
      severity: alarmData.severity || 'Critical',
      message: alarmData.message || 'Threshold alert detected',
      entity: alarmData.entity || 'System Health',
      category: alarmData.category || 'Server',
      probe: alarmData.probe || alarmData.probeName || 'Central',
      probeName: alarmData.probeName || alarmData.probe || 'Central',
      probeId: alarmData.probeId || 1,
      timestamp: Date.now(),
      lastOccurred: 'Just now',
      acknowledged: false,
      who: 'Unacknowledged',
      notes: alarmData.notes || ''
    };
    this.data.alarms.unshift(newAlarm);
    const probe = this.getProbeById(newAlarm.probeId);
    if (probe) probe.activeAlarms++;
    this.save();
    return newAlarm;
  }

  acknowledgeAlarm(id, user = 'admin@opmanager') {
    const alarm = this.data.alarms.find(a => a.id === id || a.alarmId === id);
    if (alarm) {
      alarm.acknowledged = true;
      alarm.ackUser = user;
      alarm.who = user;
      this.save();
      return alarm;
    }
    return null;
  }

  clearAlarm(id) {
    const idx = this.data.alarms.findIndex(a => a.id === id || a.alarmId === id);
    if (idx !== -1) {
      const cleared = this.data.alarms.splice(idx, 1)[0];
      const probe = this.getProbeById(cleared.probeId);
      if (probe && probe.activeAlarms > 0) probe.activeAlarms--;
      this.save();
      return cleared;
    }
    return null;
  }

  deleteAlarm(id) {
    return this.clearAlarm(id);
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
    this.save();
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
    this.save();
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
      this.save();
      return config;
    }
    return null;
  }
}

module.exports = new Database();
