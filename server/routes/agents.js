const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../services/db');

// In-memory registered agents store
const registeredAgents = new Map();

// ManageEngine OpManager Server Configuration for Windows/macOS/Linux Agents
const serverInfoData = {
  PrimaryHostServer: "192.168.30.65",
  PrimaryServerIP: "192.168.30.65",
  PrimaryServerPort: "8060",
  ServerProtocol: "http",
  SecondaryHostServer: "",
  SecondaryServerIP: "",
  SecondaryServerPort: "",
  SecondaryServerProtocol: "",
  DR_PrimaryHostServer: "",
  DR_PrimaryServerIP: "",
  DR_SecondaryHostServer: "",
  DR_SecondaryServerIP: "",
  NATPort1: "8060",
  NATPort2: "",
  ServerName: "192.168.30.65",
  ServerPort: "8060",
  ServerIp: "192.168.30.65",
  Port: "8060",
  Protocol: "http",
  customerid: "OPM_ENTERPRISE_KEY_129203",
  CustomerId: "OPM_ENTERPRISE_KEY_129203",
  AuthKey: "ee-probe-101-central-key",
  ProbeName: "Central-Probe-01",
  ProbeId: "101"
};

// 1. Direct Server Info Configuration Endpoints (read by OpManagerAgent.exe)
router.get([
  '/OPMAgentServerInfo.json',
  '/downloads/OPMAgentServerInfo.json',
  '/agents/OPMAgentServerInfo.json',
  '/api/agent/serverinfo',
  '/agent/serverinfo',
  '/servlets/AgentServerInfo'
], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json(serverInfoData);
});

// 2. ManageEngine OpManager Agent Registration Servlets
router.all(['/servlets/RegisterAgent', '/servlets/AgentRegisterServlet'], (req, res) => {
  let body = req.body || {};
  if (typeof body === 'string') {
    try { 
      body = JSON.parse(body); 
    } catch(e) {
      try {
        const q = new URLSearchParams(body);
        body = Object.fromEntries(q.entries());
      } catch(e2) {
        body = {};
      }
    }
  }

  const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
  const agentIP = body.ipAddress || body.ip || body.IP_ADDRESS || clientIP;
  const agentId = body.agentId || body.AGENT_ID || body.agent_id || `AGT-${Date.now()}`;
  const hostname = body.hostname || body.HOSTNAME || body.computerName || body.COMPUTER_NAME || body.hostName || `Windows-Host-${agentIP.replace(/\./g, '-')}`;
  const os = (body.os || body.osName || body.OS_NAME || 'windows').toLowerCase();
  const platform = body.platform || body.osVersion || body.OS_VERSION || (os.includes('win') ? 'Windows 10/11 / Server 2022' : 'Linux x86_64');
  const probeId = Number(body.probeId || body.PROBE_ID || 101);

  const agentRecord = {
    agentId,
    hostname,
    displayName: `${hostname} (${os.includes('win') ? 'Windows Host' : 'Linux Host'})`,
    os: os.includes('win') ? 'windows' : (os.includes('darwin') ? 'darwin' : 'linux'),
    platform,
    arch: 'x64',
    probeId,
    ip: agentIP,
    version: body.agentVersion || body.AGENT_VERSION || '12.9.203-GA',
    status: 'Online',
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    metrics: {
      cpu: 18.5,
      memory: 45.2,
      disk: 42.0
    }
  };

  registeredAgents.set(agentId, agentRecord);

  // Auto add / update device in Central Inventory
  let dev = db.getDevices().find(d => d.ip === agentIP || d.name === hostname);
  if (!dev) {
    dev = db.addDevice({
      name: hostname,
      displayName: `${hostname} (${os.includes('win') ? 'Windows Workstation/Server' : 'Remote Host'})`,
      ip: agentIP,
      category: 'Servers',
      type: os.includes('win') ? 'Windows Server' : 'Linux Node',
      vendor: os.includes('win') ? 'Microsoft Corp.' : 'Linux Foundation',
      os: platform,
      probeId,
      snmpVersion: 'Agent-Direct',
      isAgentMonitored: true,
      cpu: 18,
      memory: 45,
      disk: 42,
      responseTime: 12,
      availability: '100%',
      status: 'Clear'
    });
  } else {
    dev.status = 'Clear';
    dev.isAgentMonitored = true;
    dev.lastPolled = 'Just now';
    db.save();
  }

  console.log(`[OpManager Agent Servlet] Successfully registered ${hostname} (${clientIP}) via /servlets/RegisterAgent`);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    message: 'Agent registered successfully',
    agentId,
    heartbeatInterval: 30,
    probeId,
    deviceId: dev ? dev.id : 1
  });
});

// 3. ManageEngine Periodic Telemetry & Heartbeat Servlets
router.all(['/servlets/DataAgentHandlerServlet', '/servlets/StatusUpdateServlet'], (req, res) => {
  let body = req.body || {};
  if (typeof body === 'string') {
    try { 
      body = JSON.parse(body); 
    } catch(e) {
      try {
        const q = new URLSearchParams(body);
        body = Object.fromEntries(q.entries());
      } catch(e2) {
        body = {};
      }
    }
  }

  const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
  const agentId = body.agentId || body.AGENT_ID || 'AGT-DEFAULT';
  const hostname = body.hostname || body.HOSTNAME || body.computerName || `Windows-Host-${clientIP}`;
  
  let agent = registeredAgents.get(agentId);
  if (!agent) {
    agent = {
      agentId,
      hostname,
      status: 'Online',
      registeredAt: new Date().toISOString()
    };
    registeredAgents.set(agentId, agent);
  }

  const cpu = parseFloat(body.cpu || body.cpuUsage || body.CPU || 21.0);
  const mem = parseFloat(body.memory || body.memoryUsage || body.MEMORY || 46.5);
  const disk = parseFloat(body.disk || body.diskUsage || body.DISK || 43.0);

  agent.status = 'Online';
  agent.lastHeartbeat = new Date().toISOString();
  agent.metrics = { cpu, memory: mem, disk };

  const dev = db.getDevices().find(d => d.ip === clientIP || d.name === hostname);
  if (dev) {
    dev.cpu = Math.round(cpu);
    dev.memory = Math.round(mem);
    dev.disk = Math.round(disk);
    dev.lastPolled = 'Just now';
    dev.status = 'Clear';
    dev.isAgentMonitored = true;
    db.save();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    ack: true,
    timestamp: new Date().toISOString()
  });
});

// 4. ManageEngine Actions, File Collection, & Downloads Servlets
router.all(['/servlets/AgentActionServlet', '/servlets/FileCollector', '/servlets/AgentDownloadServlet'], (req, res) => {
  if (req.path.includes('AgentDownloadServlet')) {
    return res.redirect('/downloads/OpManagerAgent-Windows-x64.zip');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    actions: [],
    message: 'Servlet request acknowledged'
  });
});

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
