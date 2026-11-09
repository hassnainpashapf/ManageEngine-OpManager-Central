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
    const idx = this.data.probes.findIndex(p => p.id === probeId || String(p.id) === String(id));
    if (idx !== -1) {
      const removed = this.data.probes.splice(idx, 1)[0];
      this.data.devices = this.data.devices.filter(d => d.probeId !== probeId && String(d.probeId) !== String(id));
      this.data.alarms = this.data.alarms.filter(a => a.probeId !== probeId && String(a.probeId) !== String(id));
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
      mac: deviceData.mac || null,
      os: deviceData.os || 'Linux / Embedded',
      status: deviceData.status || 'Clear',
      availability: 100.0,
      responseTime: deviceData.responseTime !== undefined ? deviceData.responseTime : null,
      packetLoss: 0,
      cpu: deviceData.cpu !== undefined ? (deviceData.cpu === null ? null : Number(deviceData.cpu)) : Math.floor(Math.random() * 40) + 15,
      memory: deviceData.memory !== undefined ? (deviceData.memory === null ? null : Number(deviceData.memory)) : Math.floor(Math.random() * 40) + 25,
      disk: deviceData.disk !== undefined ? (deviceData.disk === null ? null : Number(deviceData.disk)) : Math.floor(Math.random() * 40) + 20,
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
      password: cred.password || '',
      enablePassword: cred.enablePassword || '',
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

  // NCM real config backups (SSH-retrieved running-config snapshots)
  addNcmBackup(deviceId, configText, meta = {}) {
    this.data.ncmBackups = this.data.ncmBackups || [];
    const entry = {
      id: `bkp_${Date.now()}`,
      deviceId: String(deviceId),
      configText,
      lineCount: configText.split(/\r?\n/).length,
      byteSize: Buffer.byteLength(configText, 'utf8'),
      takenAt: Date.now(),
      ...meta
    };
    this.data.ncmBackups.unshift(entry);
    this.data.ncmBackups = this.data.ncmBackups.slice(0, 500);
    this.save();
    return entry;
  }

  getNcmBackups(deviceId) {
    this.data.ncmBackups = this.data.ncmBackups || [];
    return this.data.ncmBackups.filter(b => b.deviceId === String(deviceId)).sort((a, b) => b.takenAt - a.takenAt);
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

  // Device Templates Catalog (AdventNet Library - 11,420 Templates)
  getTemplates() {
    if (this._templatesCache && this._templatesCache.length > 0) {
      return this._templatesCache;
    }
    const tmplFile = path.join(DATA_DIR, 'templates.json');
    if (fs.existsSync(tmplFile)) {
      try {
        this._templatesCache = JSON.parse(fs.readFileSync(tmplFile, 'utf8'));
        return this._templatesCache;
      } catch (e) {
        console.error('[DB] Error loading templates.json:', e.message);
      }
    }
    if (!this.data.templates || this.data.templates.length === 0) {
      this.data.templates = [
        { id: 'cisco-cat-9500', name: 'Cisco Catalyst 9500-48Y4C', category: 'Switch', vendor: 'Cisco', oid: '.1.3.6.1.4.1.9.1.2520', monitors: 'CPU 5s, RAM Buffer, Temp, 48x Port Stats', poll: '300s', cliCommands: 'show version\nshow running-config\nshow interfaces status' },
        { id: 'cisco-asr-9006', name: 'Cisco ASR 9006 Core Aggregator', category: 'Router', vendor: 'Cisco', oid: '.1.3.6.1.4.1.9.1.1890', monitors: 'Route Processor CPU, Dual PSUs, BGP Peers', poll: '300s', cliCommands: 'show version\nshow platform\nshow bgp summary' },
        { id: 'paloalto-pa-5250', name: 'Palo Alto PA-5250 Next-Gen FW', category: 'Firewall', vendor: 'Palo Alto', oid: '.1.3.6.1.4.1.25461.2.3.43', monitors: 'Active Sessions, Threat Drops, Data Plane CPU', poll: '180s', cliCommands: 'show system info\nshow running resource-monitor' },
        { id: 'dell-pe-r750', name: 'Dell PowerEdge R750 Rack Server', category: 'Server', vendor: 'Dell EMC', oid: '.1.3.6.1.4.1.674.10892.5', monitors: 'iDRAC Health, CPU Load, Physical Disk Arrays', poll: '300s', cliCommands: 'racadm getsysinfo\nracadm storage get pdisks' },
        { id: 'fortinet-fg-600e', name: 'Fortinet FortiGate 600E Enterprise', category: 'Firewall', vendor: 'Fortinet', oid: '.1.3.6.1.4.1.12356.101.1', monitors: 'FortiOS Memory, IPS Drop Rate, VPN Tunnels', poll: '180s', cliCommands: 'get system status\nget system performance status' },
        { id: 'netapp-aff-a400', name: 'NetApp AFF A400 NVMe Storage', category: 'Storage', vendor: 'NetApp', oid: '.1.3.6.1.4.1.789.2.1', monitors: 'Volume IOPS, Read/Write Latency, NVRAM Battery', poll: '300s', cliCommands: 'system node show\nstorage aggregate show' },
        { id: 'juniper-mx960', name: 'Juniper MX960 3D Universal Edge', category: 'Router', vendor: 'Juniper', oid: '.1.3.6.1.4.1.2636.1.1.1.2.1', monitors: 'Routing Engine CPU, Ambient Temp, FPC Linecards', poll: '300s', cliCommands: 'show version\nshow chassis hardware' },
        { id: 'arista-7150', name: 'Arista 7150 Network Switch', category: 'Switch', vendor: 'Arista', oid: '.1.3.6.1.4.1.30065.1.3011', monitors: 'Switch Fabric CPU, Fan Trays, 10G/40G SFP Stats', poll: '300s', cliCommands: 'show version\nshow inventory' },
        { id: 'cisco-isr-4451', name: 'Cisco ISR 4451-X Gateway', category: 'Router', vendor: 'Cisco', oid: '.1.3.6.1.4.1.9.1.1861', monitors: 'DSP Health, WAN Throughput, NAT Sessions', poll: '300s', cliCommands: 'show version\nshow ip interface brief' },
        { id: 'hpe-dl380-g10', name: 'HPE ProLiant DL380 Gen10', category: 'Server', vendor: 'HPE', oid: '.1.3.6.1.4.1.232.9.4.10', monitors: 'iLO 5 Health, Smart Array RAID, Thermal Zones', poll: '300s', cliCommands: 'show system\nshow server status' },
        { id: 'pure-flasharray-x70', name: 'Pure Storage FlashArray//X70', category: 'Storage', vendor: 'Pure Storage', oid: '.1.3.6.1.4.1.40482', monitors: 'Array Latency, Compression Ratio, Flash Module Health', poll: '300s', cliCommands: 'purearray list' },
        { id: 'cisco-cat-9800', name: 'Cisco Catalyst 9800-CL Wireless Controller', category: 'Wireless', vendor: 'Cisco', oid: '.1.3.6.1.4.1.9.1.2721', monitors: 'Associated APs, Client Density, RF Interference, Rogue SSIDs', poll: '180s', cliCommands: 'show ap summary\nshow wireless client summary' },
        { id: 'aruba-ap-555', name: 'Aruba AP-555 Wi-Fi 6 Access Point', category: 'Wireless', vendor: 'Aruba', oid: '.1.3.6.1.4.1.14823.1.2.89', monitors: 'Radio 2.4/5GHz Load, Channel Busy%, AirWave Metrics', poll: '180s', cliCommands: 'show ap active' },
        { id: 'checkpoint-quantum-6600', name: 'Check Point Quantum 6600', category: 'Firewall', vendor: 'Check Point', oid: '.1.3.6.1.4.1.2620.1.1', monitors: 'SecureXL State, CoreXL Dispatch, Threat Emulation Rate', poll: '180s', cliCommands: 'cpstat os\ncpstat fw' }
      ];
      this.save();
    }
    this._templatesCache = this.data.templates;
    return this._templatesCache;
  }

  addTemplate(tmplData) {
    const templates = this.getTemplates();
    const newTmpl = {
      id: tmplData.id || 'tmpl-' + Date.now(),
      name: tmplData.name || 'Custom Device Template',
      category: tmplData.category || 'Switch',
      vendor: tmplData.vendor || 'Generic',
      oid: tmplData.oid || '.1.3.6.1.4.1.9.1',
      monitors: tmplData.monitors || 'CPU Utilization, Memory Buffer, Temperature',
      poll: tmplData.poll || '300s',
      cliCommands: tmplData.cliCommands || 'show version\nshow running-config'
    };
    templates.push(newTmpl);
    this.save();
    return newTmpl;
  }

  updateTemplate(id, tmplData) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === id || t.name === id);
    if (tmpl) {
      Object.assign(tmpl, tmplData);
      this.save();
      return tmpl;
    }
    return null;
  }

  applyTemplate(tmplId, deviceIds = []) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === tmplId || t.name === tmplId);
    if (!tmpl) return { applied: 0, message: 'Template not found' };
    let count = 0;
    deviceIds.forEach(devId => {
      const dev = this.getDeviceById(devId);
      if (dev) {
        dev.template = tmpl.name;
        dev.monitors = tmpl.monitors;
        dev.pollInterval = tmpl.poll;
        count++;
      }
    });
    if (count > 0) this.save();
    return { applied: count, template: tmpl.name };
  }
}

module.exports = new Database();
