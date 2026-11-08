# ManageEngine OpManager Central (v12.9.203 GA Build 129203 Full-Stack Reconstruction)

[![ManageEngine OpManager](https://img.shields.io/badge/ManageEngine-OpManager%20Central%20v12.9.203-0070e0.svg?style=flat-square)](https://www.manageengine.com/network-monitoring/)
[![License: Proprietary Clean Room](https://img.shields.io/badge/Clean%20Room-Reconstruction-10b981.svg?style=flat-square)](#)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B%20%2F%2022%2B-green.svg?style=flat-square)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Parity-100%25%20Authentic%20GA-blueviolet.svg?style=flat-square)](#)

A high-fidelity, production-grade full-stack reconstruction of **ManageEngine OpManager Central 64-bit GA (v12.9.203 Build 129203)** — the enterprise distributed Network Management System (NMS), Network Configuration Management (NCM), NetFlow Analyzer, and IT Operations Management (ITOM) suite.

---

## 🏛️ Architecture Overview

OpManager Central operates on a distributed multi-tier Central-Probe architecture designed for multi-datacenter enterprise network visibility:

```
                          ┌─────────────────────────────────────────┐
                          │   OpManager Central Server (Port 8060)  │
                          │   - Centralized Configuration (CCM)     │
                          │   - Global Alarms Aggregation & Zia RCA │
                          │   - Master Device Inventory & Licensing │
                          │   - High Availability (HA) Failover     │
                          └───────────────────┬─────────────────────┘
                                              │ (eeauthkey WebSocket / HTTPS)
             ┌────────────────────────┬───────┴────────┬────────────────────────┐
             ▼                        ▼                ▼                        ▼
  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
  │   Probe 01: New York │ │   Probe 02: London   │ │  Probe 03: Singapore │ │   Probe 04: Dubai    │
  │   Enterprise Core DC │ │   EMEA Branch DC     │ │   APAC Cloud VPC     │ │   Regional Campus    │
  │   - SNMPv1/v2c/v3    │ │   - SNMPv1/v2c/v3    │ │   - Cloud VPC APIs   │ │   - Local Traps/MTR  │
  │   - Cisco NBAR2 Flow │ │   - SD-WAN Tunnels   │ │   - Synthetic Mon.   │ │   - BGP Peering      │
  └──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
             │                        │                        │                        │
  ┌──────────▼───────────┐ ┌──────────▼───────────┐ ┌──────────▼───────────┐ ┌──────────▼───────────┐
  │ Multi-Platform Agent │ │ Multi-Platform Agent │ │ Multi-Platform Agent │ │ Multi-Platform Agent │
  │ Windows (.exe/.zip)  │ │ macOS (.dmg/darwin)  │ │ Linux / Docker       │ │ Cisco / Junos / Palo │
  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 🚀 Key Implemented Modules & Parity Highlights

### 1. Unified ITOM Navigation & Fluidic v3 Interface (`#/dashboard`)
- **11 Modular Subtabs**: Overview, Summary, Network, Servers, Virtualization, Storage, NetFlow, NCM, Firewall, OpUtils, and NOC View.
- **Enterprise Widgets**: Infrastructure Health Matrix, Top Interfaces by Bandwidth, Top CPU & Memory Consumers, Alarms Severity Distribution, and WAN Latency Sparklines.
- **Global Probe Scope Switcher**: Switch instantly between *All Distributed Probes* or any individual geographic probe (New York, London, Singapore, Dubai).
- **Interactive Omnibox Quick Search (`Ctrl+K` / `/`)**: Multi-category instant search across Devices, IP Addresses, Active Alarms, and MAC addresses.

### 2. Multi-Vendor Device Inventory & Deep Inspector (`#/inventory`)
- **16 Core Infrastructure Nodes & 48 Interfaces**: Cisco ASR Routers, Nexus 9000 Switches, Dell PowerEdge R750 Servers, Palo Alto PA-5250 Firewalls, VMware ESXi Hypervisors, F5 BIG-IP Load Balancers, NetApp All-Flash SANs, and Ubiquiti Wireless APs.
- **Floating Bulk Operations Bar**: Multi-select devices for automated polling, credential updates, downtime scheduling, or mass export.
- **Device Snapshot Inspector**: Live interactive gauges (CPU, RAM, Disk, Temperature), power status, network interfaces table, and embedded diagnostic terminal (Ping, Traceroute, SNMP Walk).

### 3. Active Alarms, RCA & Maintenance Windows (`#/alarms`)
- **Real-Time Fault Management**: Critical (Red), Trouble (Orange), Attention (Yellow), Down (Purple), and Clear (Green) severity categorization.
- **ManageEngine Zia AI™ Root Cause Analysis (RCA)**: Multi-event causality engine with 98.8% ML confidence gauge, automated timeline tracking (NCM commit $\rightarrow$ BGP flap $\rightarrow$ WAN link saturation), downstream alarm deduplication, and automated one-click remediation rollback.
- **Schedule Downtime / Alarm Suppression**: Granular maintenance windows with options to suppress alarms, mute notifications (Email/SMS/Slack), suppress ServiceDesk Plus ticket auto-creation, and display maintenance icons.
- **Enterprise SNMP Trap Simulator**: Built-in UDP 162 trap injector with `IF-MIB::linkDown`, `BGP4-MIB::bgpEstablished`, and `CISCO-ENVMON` presets.

### 4. Interactive Topology, 42U Rack & 3D Floor Views (`#/maps`)
- **Dynamic Business Views (BV)**: Visual topological links showing status, bandwidth utilization, carrier metadata, and interactive link inspection.
- **42U EIA-310 Server Rack Elevation**: Front and rear elevation renderings showing precise rack unit occupancy (1U–4U), thermal heatmaps, and power draw.
- **3D Isometric Server Room Floor Plan**: Multi-row datacenter layout with interactive rack clusters and hot/cold aisle visualization.

### 5. Network Configuration Management (NCM) & Workflows (`#/configuration`)
- **Dual-Pane Side-by-Side Comparator**: Diff visualizer comparing Startup-Config (NVRAM) vs Running-Config (RAM) with color-coded syntax highlights.
- **Automated Policy Remediation Fixlet**: One-click SSH push to restore baseline configurations and remediate compliance drifts.
- **Visual Workflow Automation Designer**: Drag-and-drop orchestration canvas connecting triggers, decision nodes, and automated remediation actions.

### 6. Availability, SLA & Hardware Warranty Reports (`#/reports`)
- **Comprehensive Executive Reporting**: Availability & SLA compliance, Interface Performance, MTTR analysis, Hardware Lifecycle & Warranty status, and Operator Action Audit Logs.
- **Printable PDF Generator**: Formatted enterprise report generation ready for stakeholder distribution.

### 7. Authentic Settings & High Availability Console (`#/settings`)
- **17 Administration Subtabs**: Probes, Monitoring Agents, Discovery Rules, Credential Library, 11,000+ Device Templates, Notification Profiles, Mail/SMS, Proxy, and HA Failover.
- **High Availability (HA) Console**: Primary (Active) and Standby (Hot Standby) replication console with an interactive simulated role switchover engine.
- **Distributed Probe WAN Latency Mesh Matrix**: Real-time 4-way RTT matrix across global datacenters with parallel ping sweeps.

---

## 🌟 Advanced Enterprise Modules (Batch 3 & Batch 4)

| Feature | Protocol / Standard | Description |
|---|---|---|
| **ManageEngine NetPath™** | RFC 1393 / TraceTCP / MTR | 7-hop continuous path analyzer from DC to Cloud (Salesforce, O365, AWS, GCP) with latency and packet loss profiling. |
| **Hardware Health & IPMI 2.0** | IPMI 2.0 / iDRAC9 / iLO5 | 4-quadrant sensor grid for Dell PowerEdge: Dual redundant PSUs, 6x PWM fans, 5x temperature probes, and RAID 6 telemetry. |
| **BGP-4 Routing & AS Topology** | RFC 4271 / RFC 4893 | Autonomous System peering graph (AS65001 $\rightarrow$ AS3356 Lumen, AS13335 Cloudflare, AS15169 Google) with RFC 2918 Soft Clear. |
| **Cisco Catalyst SD-WAN Fabric** | Cisco vManage / BFD | 3-transport overlay monitoring (Biz-Internet DIA, MPLS, LTE) with dynamic application SLA path steering and brownout failover. |
| **Deep Packet Inspection (DPI)** | Cisco NBAR2 / L7 QoS | Full wire-speed Layer 7 flow classification (Teams, Zoom, Salesforce, P2P) with automated DSCP Scavenger rate-limiting. |
| **Network Detection & Response (NDR)**| TAXII 2.1 / STIX Feeds | Real-time behavioral threat matrix (SYN scans, DNS tunneling, Mirai C2 brute force) with automated Perimeter Firewall ACL push. |
| **OpUtils Switch Port Mapper (SPM)**| SNMP Bridge-MIB / RFC 1493 | 48-port switch port mapper with MAC, IP, VLAN, duplex state, and rogue device containment. |
| **Cisco IP SLA VoIP Telemetry** | ITU-T G.107 / E-Model | Real-time MOS score (4.38), latency, jitter distribution histogram, and RTP codec profiling. |
| **Storage Array Telemetry** | SMI-S / NetApp ONTAP | Multi-tier SAN LUN capacity, IOPS, read/write latency, and RAID rebuild status. |
| **SSL / TLS Certificate Inspector** | X.509 / PKI Hierarchy | Certificate expiration tracking, SHA-256 fingerprint, issuer chain, and cipher suite evaluation. |

---

## 💻 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.x or higher (v20+ recommended)
- `npm` v9.x or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/hassnainpasha/ManageEngine-OpManager-Central.git
cd ManageEngine-OpManager-Central
npm install
```

### 2. Start OpManager Central Server
```bash
npm start
# OR using the startup script:
./start.sh
```

The server will initialize on port **8060**:
- **Direct ITOM Web Console**: [http://localhost:8060/apiclient/fluidicv3/itom/index.html](http://localhost:8060/apiclient/fluidicv3/itom/index.html)
- **NOC Wallboard View**: [http://localhost:8060/noc](http://localhost:8060/noc)

### 3. Run Distributed Host Monitoring Agent
The repository includes multi-platform native monitoring agent binaries in `client/downloads/` and Go source code in `agent_src/`:

```bash
# macOS (Apple Silicon / Darwin)
./agent_src/OpManagerAgent -server http://localhost:8060 -probe 1 -interval 5

# Windows 64-bit
.\client\downloads\OpManagerAgent.exe -server http://localhost:8060 -probe 1 -interval 5
```

---

## 📂 Repository File Structure

```
├── client/                     # Client web assets & static application files
│   ├── apiclient/              # ManageEngine Fluidic v2 & v3 UI library, CSS, & bundle
│   │   ├── fluidicv2/          # Stylesheets, structure, and theme components
│   │   └── fluidicv3/itom/     # ITOM application assets & opmanager-suite.js
│   ├── downloads/              # Multi-platform agents (.exe, .dmg, .zip)
│   ├── images/                 # Vendor icons, device logos, and UI graphics
│   ├── itom.html               # Main ITOM Fluidic application bootstrap shell
│   └── login.html              # Authentic ManageEngine Central login screen
├── server/                     # Backend Express & WebSocket server
│   ├── index.js                # Server entry point, PNSHandler, and poller broadcast
│   ├── routes/                 # REST API endpoints (devices, alarms, probes, etc.)
│   └── services/               # In-memory database, simulation poller, and logger
├── agent_src/                  # Native multi-platform host monitoring agent source (Go)
│   ├── main.go                 # Telemetry collector (CPU, RAM, Disks, Networks)
│   └── build_all.py            # Cross-compilation script for Windows, macOS, and Linux
├── scripts/                    # Automation, modular architecture, and test runners
│   ├── suite_modules/          # 6 Clean modular JavaScript architecture files
│   │   ├── 01_header_state.js  # App state, probe switcher, breadcrumbs, and clock
│   │   ├── 02_branding_and_modals.js # 25+ Enterprise interactive modal dialogs
│   │   ├── 03_views_dashboard_inventory.js # Dashboard & Inventory view engines
│   │   ├── 04_views_alarms_maps.js # Alarms, RCA & Interactive Topology views
│   │   ├── 05_views_config_reports_settings.js # NCM, Reports & Settings views
│   │   └── 06_router_and_init.js # Hash routing, shortcuts, and global exports
│   ├── rebuild_bundle.js       # Monolithic bundle concatenator and syntax validator
│   └── run_ui_smoke_test.js    # Automated headless Chrome CDP smoke test suite
├── package.json                # Project dependencies & scripts
└── README.md                   # Complete architectural documentation
```

---

## 🔒 Clean Room Verification & License

This project is a clean-room architectural reconstruction and simulation suite created for educational, research, and technical evaluation purposes. All trademarks, service marks, and trade names are the property of their respective owners (ZOHO Corporation / ManageEngine).
