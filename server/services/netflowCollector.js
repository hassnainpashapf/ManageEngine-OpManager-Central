'use strict';
/**
 * OpManager Central — Real UDP Port 2055 NetFlow v5 / NetFlow v9 / IPFIX Collector.
 *
 * Binds UDP socket on process.env.OPM_NETFLOW_PORT || 2055 to ingest genuine
 * flow export packets from routers, switches, firewalls (e.g. pfSense softflowd,
 * Cisco IOS/NX-OS NetFlow, MikroTik Traffic Flow) and persists records in SQLite.
 * Nothing is ever fabricated when no external exporter sends datagrams.
 */

const dgram = require('node:dgram');
const store = require('./store');

const NETFLOW_PORT = Number(process.env.OPM_NETFLOW_PORT) || 2055;

// NetFlow v9 / IPFIX standard information element IDs (RFC 3954 / RFC 7012)
const NF_FIELD = {
  IN_BYTES: 1,
  IN_PKTS: 2,
  PROTOCOL: 4,
  L4_SRC_PORT: 7,
  IPV4_SRC_ADDR: 8,
  L4_DST_PORT: 11,
  IPV4_DST_ADDR: 12,
};

const APP_PORT_MAP = {
  20: 'FTP-Data',
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  67: 'DHCP',
  68: 'DHCP',
  80: 'HTTP',
  110: 'POP3',
  123: 'NTP',
  143: 'IMAP',
  161: 'SNMP',
  162: 'SNMP-Trap',
  389: 'LDAP',
  443: 'HTTPS / TLS',
  445: 'SMB / CIFS',
  465: 'SMTPS',
  514: 'Syslog',
  587: 'SMTP-Submission',
  636: 'LDAPS',
  993: 'IMAPS',
  1433: 'MS-SQL',
  1521: 'Oracle',
  2055: 'NetFlow',
  3306: 'MySQL',
  3389: 'RDP',
  5060: 'SIP / VoIP',
  5432: 'PostgreSQL',
  6379: 'Redis',
  8006: 'Proxmox VE',
  8060: 'OpManager Central',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
  9090: 'Prometheus / Web',
  9200: 'Elasticsearch',
};

const templateCache = new Map();

const state = {
  port: NETFLOW_PORT,
  bound: false,
  error: null,
  startedAt: null,
  packetsReceived: 0,
  flowsIngested: 0,
  bytesIngested: 0,
  lastReceivedAt: null,
  exporters: {},
};

let socket = null;
let started = false;

function ipv4FromBuf(buf, offset) {
  if (offset + 4 > buf.length) return null;
  return `${buf[offset]}.${buf[offset + 1]}.${buf[offset + 2]}.${buf[offset + 3]}`;
}

function readUIntBEVar(buf, offset, len) {
  if (len <= 0 || offset + len > buf.length) return 0;
  let val = 0;
  for (let i = 0; i < len; i++) {
    val = val * 256 + buf[offset + i];
  }
  return val;
}

function resolveAppName(srcPort, dstPort, protocol) {
  if (protocol === 1) return 'ICMP';
  if (protocol === 2) return 'IGMP';
  if (protocol === 47) return 'GRE';
  if (protocol === 50) return 'ESP / IPsec';
  if (protocol === 89) return 'OSPF';
  const protoTag = protocol === 6 ? 'TCP' : protocol === 17 ? 'UDP' : `Proto-${protocol || '?'}`;
  if (dstPort && APP_PORT_MAP[dstPort]) return `${APP_PORT_MAP[dstPort]} (${protoTag}/${dstPort})`;
  if (srcPort && APP_PORT_MAP[srcPort]) return `${APP_PORT_MAP[srcPort]} (${protoTag}/${srcPort})`;
  const chosenPort = dstPort && dstPort < 49152 ? dstPort : srcPort;
  return chosenPort ? `${protoTag}/${chosenPort}` : protoTag;
}

function parseV5(buf, exporterIp, receivedAt) {
  if (buf.length < 24) return [];
  const count = buf.readUInt16BE(2);
  const maxPossible = Math.floor((buf.length - 24) / 48);
  const n = Math.min(count, maxPossible, 60);
  const out = [];
  for (let i = 0; i < n; i++) {
    const off = 24 + i * 48;
    const srcIp = ipv4FromBuf(buf, off + 0);
    const dstIp = ipv4FromBuf(buf, off + 4);
    const packets = buf.readUInt32BE(off + 16);
    const bytes = buf.readUInt32BE(off + 20);
    const srcPort = buf.readUInt16BE(off + 32);
    const dstPort = buf.readUInt16BE(off + 34);
    const protocol = buf[off + 38];
    out.push({
      exporter_ip: exporterIp,
      version: 'NetFlow v5',
      src_ip: srcIp,
      dst_ip: dstIp,
      src_port: srcPort,
      dst_port: dstPort,
      protocol,
      app_name: resolveAppName(srcPort, dstPort, protocol),
      bytes,
      packets,
      received_at: receivedAt,
    });
  }
  return out;
}

function decodeTemplatedRecord(buf, offset, template) {
  let cursor = offset;
  let srcIp = null;
  let dstIp = null;
  let srcPort = null;
  let dstPort = null;
  let protocol = null;
  let bytes = 0;
  let packets = 0;
  for (const field of template.fields) {
    if (cursor + field.length > buf.length) return null;
    if (field.type === NF_FIELD.IPV4_SRC_ADDR && field.length === 4) srcIp = ipv4FromBuf(buf, cursor);
    else if (field.type === NF_FIELD.IPV4_DST_ADDR && field.length === 4) dstIp = ipv4FromBuf(buf, cursor);
    else if (field.type === NF_FIELD.L4_SRC_PORT && field.length <= 4) srcPort = readUIntBEVar(buf, cursor, field.length);
    else if (field.type === NF_FIELD.L4_DST_PORT && field.length <= 4) dstPort = readUIntBEVar(buf, cursor, field.length);
    else if (field.type === NF_FIELD.PROTOCOL && field.length <= 4) protocol = readUIntBEVar(buf, cursor, field.length);
    else if (field.type === NF_FIELD.IN_BYTES && field.length <= 8) bytes = readUIntBEVar(buf, cursor, field.length);
    else if (field.type === NF_FIELD.IN_PKTS && field.length <= 8) packets = readUIntBEVar(buf, cursor, field.length);
    cursor += field.length;
  }
  return { srcIp, dstIp, srcPort, dstPort, protocol, bytes, packets };
}

function parseV9OrIpfix(buf, versionNum, exporterIp, receivedAt) {
  const isIpfix = versionNum === 10;
  const headerLen = isIpfix ? 16 : 20;
  if (buf.length < headerLen) return [];
  const sourceId = buf.readUInt32BE(isIpfix ? 12 : 16);
  const templateFlowsetId = isIpfix ? 2 : 0;
  const verLabel = isIpfix ? 'IPFIX' : 'NetFlow v9';

  const out = [];
  let offset = headerLen;
  while (offset + 4 <= buf.length) {
    const flowsetId = buf.readUInt16BE(offset);
    const flowsetLen = buf.readUInt16BE(offset + 2);
    if (flowsetLen < 4 || offset + flowsetLen > buf.length) break;

    if (flowsetId === templateFlowsetId) {
      let tOff = offset + 4;
      const tEnd = offset + flowsetLen;
      while (tOff + 4 <= tEnd) {
        const templateId = buf.readUInt16BE(tOff);
        const fieldCount = buf.readUInt16BE(tOff + 2);
        tOff += 4;
        if (tOff + fieldCount * 4 > tEnd) break;
        const fields = [];
        let recordLength = 0;
        for (let i = 0; i < fieldCount; i++) {
          const type = buf.readUInt16BE(tOff) & 0x7fff;
          const length = buf.readUInt16BE(tOff + 2);
          fields.push({ type, length });
          recordLength += length;
          tOff += 4;
          if (buf[tOff - 4] & 0x80 && tOff + 4 <= tEnd) tOff += 4; // IPFIX enterprise PEN
        }
        if (recordLength > 0) {
          templateCache.set(`${exporterIp}:${sourceId}:${templateId}`, { recordLength, fields });
        }
      }
    } else if (flowsetId >= 256) {
      const tpl = templateCache.get(`${exporterIp}:${sourceId}:${flowsetId}`);
      if (tpl && tpl.recordLength > 0) {
        let rOff = offset + 4;
        const rEnd = offset + flowsetLen;
        while (rOff + tpl.recordLength <= rEnd && out.length < 200) {
          const rec = decodeTemplatedRecord(buf, rOff, tpl);
          if (rec && (rec.srcIp || rec.dstIp)) {
            out.push({
              exporter_ip: exporterIp,
              version: verLabel,
              src_ip: rec.srcIp,
              dst_ip: rec.dstIp,
              src_port: rec.srcPort,
              dst_port: rec.dstPort,
              protocol: rec.protocol,
              app_name: resolveAppName(rec.srcPort, rec.dstPort, rec.protocol),
              bytes: rec.bytes,
              packets: rec.packets,
              received_at: receivedAt,
            });
          }
          rOff += tpl.recordLength;
        }
      }
    }
    offset += flowsetLen;
  }
  return out;
}

function parseNetFlowPacket(buf, remoteIp) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return [];
  const exporterIp = String(remoteIp || '0.0.0.0').replace(/^::ffff:/, '');
  const version = buf.readUInt16BE(0);
  const receivedAt = Date.now();
  if (version === 5) return parseV5(buf, exporterIp, receivedAt);
  if (version === 9 || version === 10) return parseV9OrIpfix(buf, version, exporterIp, receivedAt);
  return [];
}

function handleDatagram(msg, rinfo) {
  const exporterIp = String((rinfo && rinfo.address) || '0.0.0.0').replace(/^::ffff:/, '');
  const nowTs = Date.now();
  state.packetsReceived += 1;
  state.lastReceivedAt = nowTs;

  const records = parseNetFlowPacket(msg, exporterIp);
  let bytesSum = 0;
  for (const r of records) bytesSum += r.bytes || 0;

  if (!state.exporters[exporterIp]) {
    state.exporters[exporterIp] = {
      ip: exporterIp,
      packets: 0,
      flows: 0,
      bytes: 0,
      version: records[0]?.version || 'UDP Datagrams',
      lastSeenAt: nowTs,
    };
  }
  state.exporters[exporterIp].packets += 1;
  state.exporters[exporterIp].flows += records.length;
  state.exporters[exporterIp].bytes += bytesSum;
  state.exporters[exporterIp].lastSeenAt = nowTs;
  if (records[0]?.version) state.exporters[exporterIp].version = records[0].version;

  if (records.length > 0 && typeof store.saveFlowBatch === 'function') {
    try {
      store.saveFlowBatch(records);
      state.flowsIngested += records.length;
      state.bytesIngested += bytesSum;
    } catch (err) {
      console.error('[NetFlow] Failed storing flow batch:', err.message);
    }
  }
}

function start() {
  if (started) return getStatus();
  started = true;
  state.startedAt = Date.now();
  try {
    socket = dgram.createSocket('udp4');
    socket.on('error', (err) => {
      state.bound = false;
      state.error = err.code || err.message;
      console.warn(`[NetFlow] UDP/${NETFLOW_PORT} listener error (${state.error}). NetFlow collection disabled.`);
      try { socket.close(); } catch (e) {}
    });
    socket.on('message', handleDatagram);
    socket.bind(NETFLOW_PORT, '0.0.0.0', () => {
      state.bound = true;
      state.error = null;
      console.log(`[NetFlow] Collector listening for NetFlow v5/v9 & IPFIX on UDP port ${NETFLOW_PORT}`);
    });
  } catch (err) {
    state.bound = false;
    state.error = err.message;
    console.warn(`[NetFlow] Failed to bind UDP/${NETFLOW_PORT}:`, err.message);
  }
  return getStatus();
}

function stop() {
  if (socket) {
    try { socket.close(); } catch (e) {}
    socket = null;
  }
  state.bound = false;
  started = false;
}

function getStatus() {
  return {
    port: state.port,
    bound: state.bound,
    error: state.error,
    startedAt: state.startedAt,
    packetsReceived: state.packetsReceived,
    flowsIngested: state.flowsIngested,
    bytesIngested: state.bytesIngested,
    lastReceivedAt: state.lastReceivedAt,
    exporters: Object.values(state.exporters),
  };
}

module.exports = {
  start,
  stop,
  getStatus,
  parseNetFlowPacket,
  NETFLOW_PORT,
};
