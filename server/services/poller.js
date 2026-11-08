const db = require('./db');

class NetworkPoller {
  constructor() {
    this.timer = null;
    this.listeners = [];
    this.tickCount = 0;
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  start(intervalMs = 4000) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.pollCycle();
    }, intervalMs);
    console.log(`[OpManager Poller] Live polling engine active (interval: ${intervalMs}ms)`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  pollCycle() {
    const devices = db.data.devices;
    const updatedDevices = [];

    devices.forEach(device => {
      // Small realistic fluctuations
      const cpuDelta = (Math.random() - 0.5) * 4;
      const memDelta = (Math.random() - 0.5) * 2;
      const pingDelta = (Math.random() - 0.5) * 2;

      device.cpu = Math.min(99, Math.max(5, Math.round(device.cpu + cpuDelta)));
      device.memory = Math.min(99, Math.max(10, Math.round(device.memory + memDelta)));
      device.responseTime = Math.max(1, Math.round(device.responseTime + pingDelta));
      device.lastPolled = 'Just now';

      // Fluctuate interface bandwidth
      if (device.interfaces && device.interfaces.length > 0) {
        device.interfaces.forEach(intf => {
          const trafficVariance = (Math.random() - 0.5) * 15;
          intf.inTraffic = Math.max(0.5, Number((intf.inTraffic + trafficVariance).toFixed(1)));
          intf.outTraffic = Math.max(0.5, Number((intf.outTraffic + trafficVariance * 1.1).toFixed(1)));
        });
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

    // Notify listeners / WebSocket clients
    const payload = {
      type: 'METRIC_TICK',
      timestamp: Date.now(),
      devices: updatedDevices,
      totalAlarms: db.data.alarms.length
    };

    this.listeners.forEach(fn => fn(payload));

    // Periodic live alarm toast event (every ~20s)
    if (this.tickCount % 5 === 0 && db.data.alarms.length > 0) {
      const randomAlarm = db.data.alarms[Math.floor(Math.random() * db.data.alarms.length)];
      const toastPayload = {
        type: 'ALARM_TOAST',
        alarm: {
          id: randomAlarm.id,
          deviceId: randomAlarm.deviceId,
          device: randomAlarm.deviceName || randomAlarm.device || 'DXB-CORE-SW-01',
          deviceName: randomAlarm.deviceName || randomAlarm.device || 'DXB-CORE-SW-01',
          ip: randomAlarm.ip || '10.40.1.1',
          message: randomAlarm.message,
          severity: randomAlarm.severity,
          entity: randomAlarm.entity || randomAlarm.category || 'Threshold Monitor',
          category: randomAlarm.category || 'Switch',
          probe: randomAlarm.probeName || randomAlarm.probe || 'Dubai Campus Core',
          probeName: randomAlarm.probeName || randomAlarm.probe || 'Dubai Campus Core',
          time: 'Just now',
          timestamp: 'Just now',
          technician: 'Unacknowledged'
        }
      };
      this.listeners.forEach(fn => fn(toastPayload));
    }
  }
}

module.exports = new NetworkPoller();
