const express = require('express');
const router = express.Router();

const WORKFLOWS = [
  {
    id: 'WF-001',
    name: 'Auto-Remediate High CPU on Critical Server',
    status: 'Active',
    trigger: 'Alarm: CPU Utilization > 90% for 5 mins',
    scope: 'All Windows & Linux Servers',
    lastExecuted: '12 minutes ago',
    executionCount: 24,
    steps: [
      { order: 1, action: 'Check Top Process by CPU via WMI/SSH', target: 'Triggered Host' },
      { order: 2, action: 'Restart Associated Windows Service / Process', target: 'spoolsv.exe / httpd' },
      { order: 3, action: 'Log Audit Trail in Central NOC & Dispatch Email', target: 'NOC On-Call Team' }
    ]
  },
  {
    id: 'WF-002',
    name: 'Central Probe Failover & Re-sync',
    status: 'Active',
    trigger: 'Probe Status: Heartbeat Missed > 60 seconds',
    scope: 'All Distributed Probes',
    lastExecuted: '2 hours ago',
    executionCount: 5,
    steps: [
      { order: 1, action: 'Send Diagnostic ICMP & TCP Ping from Central', target: 'Probe Host IP' },
      { order: 2, action: 'Trigger Failover Heartbeat Ping to Standby Probe', target: 'Secondary Poller' },
      { order: 3, action: 'Generate Critical Alarm in Central Console', target: 'Alarm System' }
    ]
  },
  {
    id: 'WF-003',
    name: 'Switch Port Security Auto-Lockout',
    status: 'Active',
    trigger: 'SNMP Trap: Port Security Violation (MAC Flap)',
    scope: 'All Cisco Access Switches',
    lastExecuted: '1 day ago',
    executionCount: 8,
    steps: [
      { order: 1, action: 'Execute CLI: shutdown interface', target: 'Switch Port Mapper' },
      { order: 2, action: 'Take Configuration Snapshot via NCM', target: 'CCM Archive' },
      { order: 3, action: 'Notify SecOps Team with Port & MAC details', target: 'Security Operations' }
    ]
  }
];

router.get('/api/workflows/list', (req, res) => {
  res.json({
    status: 'success',
    workflows: WORKFLOWS
  });
});

router.post('/api/workflows/execute', (req, res) => {
  const { workflowId } = req.body;
  const wf = WORKFLOWS.find(w => w.id === workflowId) || WORKFLOWS[0];

  res.json({
    status: 'success',
    message: `Workflow "${wf.name}" executed successfully across target infrastructure.`,
    executedAt: new Date().toISOString(),
    logs: [
      `[${new Date().toLocaleTimeString()}] Trigger matched: ${wf.trigger}`,
      `[${new Date().toLocaleTimeString()}] Step 1 complete: ${wf.steps[0].action}`,
      `[${new Date().toLocaleTimeString()}] Step 2 complete: ${wf.steps[1].action}`,
      `[${new Date().toLocaleTimeString()}] Step 3 complete: ${wf.steps[2].action}`,
      `[${new Date().toLocaleTimeString()}] Workflow execution completed with Exit Code 0 (Success)`
    ]
  });
});

module.exports = router;