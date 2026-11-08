const express = require('express');
const router = express.Router();
const db = require('../services/db');

// In-memory registered agents store
const registeredAgents = new Map();

// Register a new host agent (Windows / macOS / Linux)
router.post('/api/agent/register', (req, res) => {
  const { agentId, hostname, os, platform, arch, probeId, authKey, agentVersion } = req.body;

  if (!agentId || !hostname) {
    return res.status(400).json({ status: 'error', message: 'agentId and hostname are required' });
  }

  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const cleanIP = clientIP.replace('::ffff:', '');

  const agentRecord = {
    agentId,
    hostname,
    displayName: `${hostname} (${(os || 'OS').toUpperCase()} Agent)`,
    os: os || 'linux',
    platform: platform || `${os} (${arch})`,
    arch: arch || 'amd64',
    probeId: Number(probeId) || 101,
    ip: cleanIP,
    version: agentVersion || '12.9.203-GA',
    status: 'Online',
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    metrics: {
      cpu: 15.0,
      memory: 42.0,
      disk: 38.0
    }
  };

  registeredAgents.set(agentId, agentRecord);

  // Check if device already exists in devices list, otherwise auto-create
  let existingDev = db.getDevices().find(d => d.ip === cleanIP || d.name === hostname);
  if (!existingDev) {
    existingDev = db.addDevice({
      name: hostname,
      displayName: `${hostname} (${os === 'windows' ? 'Windows Server' : (os === 'darwin' ? 'macOS Host' : 'Linux Node')})`,
      ip: cleanIP,
      category: 'Server',
      type: `${(os || 'LINUX').toUpperCase()} Monitored Host`,
      vendor: os === 'darwin' ? 'Apple Inc.' : (os === 'windows' ? 'Microsoft Corp.' : 'Linux Foundation'),
      os: `${(os || 'Linux').toUpperCase()} ${arch || 'x64'}`,
      probeId: Number(probeId) || 101,
      snmpVersion: 'Agent-Direct',
      isAgentMonitored: true
    });
  } else {
    existingDev.status = 'Clear';
    existingDev.isAgentMonitored = true;
    db.save();
  }

  console.log(`[OpManager Agent] Host registered: ${hostname} [${agentId}] (OS: ${os}/${arch}) from ${cleanIP}`);

  res.status(200).json({
    status: 'success',
    agentId,
    message: `Host '${hostname}' successfully registered to Enterprise Central Inventory`,
    heartbeatInterval: 5,
    deviceId: existingDev.id
  });
});

// Receive live periodic telemetry from agent
router.post('/api/agent/telemetry', (req, res) => {
  const { agentId, hostname, cpuUsage, memoryUsage, diskUsage, uptimeSeconds, interfaces, topProcesses, ipAddress } = req.body;

  let agent = registeredAgents.get(agentId);
  if (!agent) {
    agent = {
      agentId: agentId || `AGT-${Date.now()}`,
      hostname: hostname || 'Remote-Host',
      status: 'Online',
      registeredAt: new Date().toISOString()
    };
    registeredAgents.set(agentId, agent);
  }

  agent.status = 'Online';
  agent.lastHeartbeat = new Date().toISOString();
  agent.metrics = {
    cpu: Number(cpuUsage !== undefined ? cpuUsage.toFixed(1) : 20.0),
    memory: Number(memoryUsage !== undefined ? memoryUsage.toFixed(1) : 45.0),
    disk: Number(diskUsage !== undefined ? diskUsage.toFixed(1) : 50.0),
    uptimeSeconds: uptimeSeconds || 0,
    interfacesCount: interfaces ? interfaces.length : 1
  };

  // Update corresponding device in database
  const dev = db.getDevices().find(d => d.name === hostname || (ipAddress && d.ip === ipAddress));
  if (dev) {
    dev.cpu = Math.round(agent.metrics.cpu);
    dev.memory = Math.round(agent.metrics.memory);
    dev.disk = Math.round(agent.metrics.disk);
    dev.lastPolled = 'Just now';
    dev.isAgentMonitored = true;
    dev.status = 'Clear';
    if (interfaces && Array.isArray(interfaces) && interfaces.length > 0) {
      dev.interfaces = interfaces.map(inf => ({
        name: inf.name || 'eth0',
        alias: inf.alias || inf.name || 'Interface',
        type: 'ethernetCsmacd',
        speed: inf.speed || '1 Gbps',
        status: inf.status || 'Up',
        inTraffic: inf.inTraffic || 12.0,
        outTraffic: inf.outTraffic || 18.0,
        inUtil: 1.2,
        outUtil: 1.8,
        errors: 0
      }));
    }
    if (topProcesses && Array.isArray(topProcesses)) {
      dev.topProcesses = topProcesses;
    }
    db.save();
  }

  res.json({
    status: 'success',
    ack: true,
    agentId,
    timestamp: new Date().toISOString()
  });
});

// List all active and registered agents
router.get(['/api/agent/list', '/api/agents'], (req, res) => {
  const list = Array.from(registeredAgents.values());
  res.json({
    status: 'success',
    totalAgents: list.length,
    activeAgents: list.filter(a => a.status === 'Online').length,
    agents: list
  });
});

// Deregister / Stop
router.post('/api/agent/deregister', (req, res) => {
  const { agentId } = req.body;
  if (agentId && registeredAgents.has(agentId)) {
    const a = registeredAgents.get(agentId);
    a.status = 'Offline';
    a.disconnectedAt = new Date().toISOString();
    console.log(`[OpManager Agent] Host offline: ${a.hostname} [${agentId}]`);
  }
  res.json({ status: 'success' });
});

// Agent downloads metadata
router.get('/api/agent/downloads', (req, res) => {
  res.json({
    status: 'success',
    version: '12.9.203-GA',
    build: '20261106',
    downloads: [
      {
        os: 'Windows',
        platform: 'Windows 64-bit (x86_64)',
        filename: 'OpManagerAgent.exe',
        url: '/downloads/OpManagerAgent.exe',
        archiveUrl: '/downloads/OpManagerAgent-Windows-x64.zip',
        type: 'Standalone Executable & Service Installer',
        instructions: 'Run OpManagerAgent.exe in Command Prompt/PowerShell or run install_service.bat as Administrator.'
      },
      {
        os: 'macOS',
        platform: 'macOS Universal (Apple Silicon & Intel)',
        filename: 'OpManagerAgent.dmg',
        url: '/downloads/OpManagerAgent.dmg',
        type: 'Apple Disk Image (DMG) & Application Bundle',
        instructions: 'Open OpManagerAgent.dmg, drag OpManagerAgent.app to Applications, or execute install_daemon.sh.'
      },
      {
        os: 'Linux',
        platform: 'Linux x86_64 & ARM64',
        filename: 'OpManagerAgent-linux.tar.gz',
        url: '/downloads/OpManagerAgent-linux.tar.gz',
        type: 'Binary & systemd Service Unit',
        instructions: 'Extract archive and run: sudo ./OpManagerAgent -server http://<central-host>:8060'
      }
    ]
  });
});

module.exports = router;
