const db = require('./db');
const netprobe = require('./netprobe');

class NetworkPoller {
  constructor() {
    this.timer = null;
    this.listeners = [];
    this.tickCount = 0;
    this.busy = false;
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  start(intervalMs = 10000) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.pollCycle();
    }, intervalMs);
    console.log(`[OpManager Poller] Live ICMP/SNMP polling engine active (interval: ${intervalMs}ms)`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pollCycle() {
    if (this.busy) return; // avoid overlapping cycles when probes are slower than the interval
    this.busy = true;
    try {
      await this.runCycle();
    } finally {
      this.busy = false;
    }
  }

  async runCycle() {
    const devices = db.data.devices || [];
    const updatedDevices = [];

    await netprobe.mapWithConcurrency(devices, 16, async (device) => {
      // Real host agent reports its own metrics directly; don't override them.
      if (device.isAgentMonitored) {
        device.lastPolled = 'Just now';
        updatedDevices.push({
          id: device.id,
          cpu: device.cpu,
          memory: device.memory,
          disk: device.disk,
          responseTime: device.responseTime || 2,
          status: device.status || 'Clear'
        });
        return;
      }

      if (!device.ip) return;

      const reach = await netprobe.checkReachable(device.ip);
      device.lastPolled = 'Just now';

      if (!reach.reachable) {
        device.status = 'Down';
        device.responseTime = null;
        updatedDevices.push({ id: device.id, cpu: device.cpu, memory: device.memory, responseTime: null, status: device.status });
        return;
      }

      device.responseTime = reach.rttMs;
      if (device.status === 'Down') device.status = 'Clear';

      const community = device.snmpCommunity || 'public';
      const snmp = await netprobe.snmpProbe(device.ip, community, device.snmpVersion);
      if (snmp) {
        if (snmp.cpu !== null && snmp.cpu !== undefined) device.cpu = snmp.cpu;
        if (snmp.memory !== null && snmp.memory !== undefined) device.memory = snmp.memory;
        device.snmpReachable = true;
      } else {
        device.snmpReachable = false;
      }

      updatedDevices.push({
        id: device.id,
        cpu: device.cpu,
        memory: device.memory,
        responseTime: device.responseTime,
        status: device.status
      });
    });

    this.tickCount++;

    // Persist a real alarm on every genuine Clear->Down transition, and clear
    // it again on a real Down->Clear transition, instead of re-toasting every
    // tick while a device merely stays down.
    updatedDevices.forEach(d => {
      const prevStatus = this.lastStatus ? this.lastStatus[d.id] : undefined;
      if (d.status === 'Down' && prevStatus !== 'Down') {
        const device = db.getDeviceById(d.id);
        if (device) {
          const alarm = db.addAlarm({
            deviceId: device.id,
            device: device.name,
            deviceName: device.name,
            ip: device.ip,
            severity: 'Critical',
            message: `${device.name} (${device.ip}) is not responding to ICMP/TCP probes`,
            entity: 'Availability Monitor',
            category: device.category || 'Server',
            probe: device.probeName || 'Central Site Probe',
            probeName: device.probeName || 'Central Site Probe',
            probeId: device.probeId || 101
          });
          this.openAlarmByDevice = this.openAlarmByDevice || {};
          this.openAlarmByDevice[device.id] = alarm.id;
          this.listeners.forEach(fn => fn({ type: 'ALARM_TOAST', alarm: { ...alarm, time: 'Just now', timestamp: 'Just now', technician: 'Unacknowledged' } }));
        }
      } else if (d.status !== 'Down' && prevStatus === 'Down') {
        const openId = this.openAlarmByDevice && this.openAlarmByDevice[d.id];
        if (openId) {
          db.clearAlarm(openId);
          delete this.openAlarmByDevice[d.id];
        }
      }
    });

    this.lastStatus = this.lastStatus || {};
    updatedDevices.forEach(d => { this.lastStatus[d.id] = d.status; });

    const payload = {
      type: 'METRIC_TICK',
      timestamp: Date.now(),
      devices: updatedDevices,
      totalAlarms: (db.data.alarms || []).length
    };

    this.listeners.forEach(fn => fn(payload));
  }
}

module.exports = new NetworkPoller();
