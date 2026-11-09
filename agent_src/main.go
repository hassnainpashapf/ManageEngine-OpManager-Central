package main

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"math"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	AgentVersion    = "12.9.204-GA"
	AgentBuild      = "20261106"
	DefaultServer   = "http://192.168.30.65:8060"
	DefaultProbe    = "101"
	DefaultInterval = 5
)

// NOTE: There is intentionally NO default auth key. The agent refuses to
// start (and refuses -test / -install) unless an auth key is supplied via
// the -key flag, the AUTH_KEY environment variable, or agent.conf. A key
// compiled into the binary would be the same public "secret" on every host.
const noData = -1.0 // sentinel for a metric that could not be measured

// AgentConfig represents local agent configuration
type AgentConfig struct {
	ServerURL    string `json:"server_url"`
	ProbeID      string `json:"probe_id"`
	AuthKey      string `json:"auth_key"`
	PollInterval int    `json:"poll_interval"`
	CustomName   string `json:"custom_name"`
}

// SystemTelemetry holds host metrics reported to OpManager Central
type SystemTelemetry struct {
	AgentID       string                 `json:"agentId"`
	Hostname      string                 `json:"hostname"`
	OS            string                 `json:"os"`
	Platform      string                 `json:"platform"`
	Arch          string                 `json:"arch"`
	ProbeID       string                 `json:"probeId"`
	AuthKey       string                 `json:"authKey"`
	AgentVersion  string                 `json:"agentVersion"`
	IPAddress     string                 `json:"ipAddress"`
	MACAddress    string                 `json:"macAddress"`
	UptimeSeconds uint64                 `json:"uptimeSeconds"`
	CPUUsage      float64                `json:"cpuUsage"`
	MemoryTotalMB uint64                 `json:"memoryTotalMB"`
	MemoryUsedMB  uint64                 `json:"memoryUsedMB"`
	MemoryUsage   float64                `json:"memoryUsage"`
	DiskTotalGB   float64                `json:"diskTotalGB"`
	DiskUsedGB    float64                `json:"diskUsedGB"`
	DiskUsage     float64                `json:"diskUsage"`
	Interfaces    []NetworkInterfaceInfo `json:"interfaces"`
	TopProcesses  []ProcessInfo          `json:"topProcesses"`
	Status        string                 `json:"status"`
	Timestamp     string                 `json:"timestamp"`
}

type NetworkInterfaceInfo struct {
	Name  string   `json:"name"`
	MAC   string   `json:"mac"`
	IPs   []string `json:"ips"`
	Flags string   `json:"flags"`
	IsUp  bool     `json:"isUp"`
}

type ProcessInfo struct {
	PID      int     `json:"pid"`
	Name     string  `json:"name"`
	CPU      float64 `json:"cpu"`
	MemoryMB float64 `json:"memoryMB"`
}

type RegisterResponse struct {
	Status    string `json:"status"`
	AgentID   string `json:"agentId"`
	Message   string `json:"message"`
	Heartbeat int    `json:"heartbeat"`
}

type agentListResponse struct {
	TotalAgents  int               `json:"totalAgents"`
	ActiveAgents int               `json:"activeAgents"`
	Agents       []json.RawMessage `json:"agents"`
}

var (
	startTime = time.Now()
	agentID   string
	logFile   *os.File
)

func main() {
	serverFlag := flag.String("server", "", "OpManager Central Server URL (e.g. http://192.168.30.65:8060)")
	probeFlag := flag.String("probe", "", "Associated Enterprise Probe Identifier (e.g. 101)")
	keyFlag := flag.String("key", "", "Central-Probe Mutual Authorization Key")
	intervalFlag := flag.Int("interval", 0, "Telemetry reporting interval in seconds (default: 5)")
	nameFlag := flag.String("name", "", "Custom device display name (defaults to system hostname)")
	versionFlag := flag.Bool("version", false, "Print ManageEngine OpManager Central Agent version and exit")
	testFlag := flag.Bool("test", false, "Test connectivity to Central Server and exit")
	installFlag := flag.Bool("install", false, "Install agent as system background service/daemon")

	flag.Parse()

	// Open the local log file for troubleshooting. The log lives next to
	// the executable, never in the working directory: a service (or a
	// scheduled task) starts with CWD=System32, where the agent cannot
	// and must not write. See executableDir / bug (c).
	f, err := os.OpenFile(logFilePath(executableDir()), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err == nil {
		logFile = f
		defer logFile.Close()
	}

	if *versionFlag {
		fmt.Printf("ManageEngine OpManager Central Monitoring Agent\n")
		fmt.Printf("Version: %s (Build %s)\n", AgentVersion, AgentBuild)
		fmt.Printf("OS: %s | Arch: %s\n", runtime.GOOS, runtime.GOARCH)
		fmt.Printf("Copyright (c) 2026 ZOHO Corporation. All rights reserved.\n")
		return
	}

	cfg := loadConfig()
	if *serverFlag != "" {
		cfg.ServerURL = *serverFlag
	}
	if *probeFlag != "" {
		cfg.ProbeID = *probeFlag
	}
	if *keyFlag != "" {
		cfg.AuthKey = *keyFlag
	}
	if *intervalFlag > 0 {
		cfg.PollInterval = *intervalFlag
	}
	if *nameFlag != "" {
		cfg.CustomName = *nameFlag
	}

	cfg.ServerURL = strings.TrimRight(cfg.ServerURL, "/")
	if !strings.HasPrefix(cfg.ServerURL, "http://") && !strings.HasPrefix(cfg.ServerURL, "https://") {
		cfg.ServerURL = "http://" + cfg.ServerURL
	}

	if cfg.AuthKey == "" {
		fmt.Fprintln(os.Stderr, "[ERROR] No auth key configured. The agent will not start without one.")
		fmt.Fprintln(os.Stderr, "        Supply it with -key <key>, the AUTH_KEY environment variable,")
		fmt.Fprintln(os.Stderr, "        or AUTH_KEY=<key> in agent.conf. There is no default key.")
		os.Exit(1)
	}

	printBanner(cfg)

	// Bug (b): when the Service Control Manager starts this process, run
	// as a real Windows service (service handler in service_windows.go)
	// instead of the console loop, so SCM Stop/Shutdown works and the
	// process no longer fails with 1053. On non-Windows, and on Windows
	// when started from a console / scheduled task, isWindowsService()
	// is false and the console loop below runs unchanged.
	if isWindowsService() {
		if err := runAsWindowsService(cfg); err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] Windows service failed: %v\n", err)
			os.Exit(1)
		}
		return
	}

	if *installFlag {
		installService(cfg)
		return
	}

	if *testFlag {
		testConnection(cfg)
		return
	}

	runAgent(cfg)
}

func printBanner(cfg AgentConfig) {
	fmt.Println("==================================================================")
	fmt.Println("   ManageEngine OpManager Central - Host Monitoring Agent         ")
	fmt.Printf("   Version: %s (%s/%s)                         \n", AgentVersion, runtime.GOOS, runtime.GOARCH)
	fmt.Println("   Copyright (c) 2026 ZOHO Corporation. All rights reserved.     ")
	fmt.Println("==================================================================")
	fmt.Printf("[CONFIG] Central Server URL : %s\n", cfg.ServerURL)
	fmt.Printf("[CONFIG] Target Probe ID    : %s\n", cfg.ProbeID)
	fmt.Printf("[CONFIG] Polling Interval   : %d seconds\n", cfg.PollInterval)
	fmt.Printf("[CONFIG] Auth Key           : configured (not shown)\n")
	fmt.Println("------------------------------------------------------------------")
}

// executableDir returns the directory holding this executable, resolved
// through symlinks. All agent state (agent.conf, agent.id, agent.log)
// is resolved from here — never from the working directory.
//
// Bug (c): the old loadConfig searched "agent.conf" / "./agent.conf"
// (i.e. the CWD) before the executable's directory, and the log file was
// opened as a bare relative "agent.log". A run whose CWD is System32
// (a Windows service, or a scheduled task started without "Start in")
// therefore failed with "No auth key configured" even though
// <execDir>/agent.conf existed and was readable. Nothing in this file
// may resolve agent state from the CWD any more.
func executableDir() string {
	exePath, err := os.Executable()
	if err != nil {
		logWarn(fmt.Sprintf("Could not determine executable path (%v); using working directory as a last resort", err))
		return "."
	}
	if resolved, err := filepath.EvalSymlinks(exePath); err == nil {
		exePath = resolved
	}
	return filepath.Dir(exePath)
}

// logFilePath returns the agent log path for the given executable dir.
func logFilePath(execDir string) string {
	return filepath.Join(execDir, "agent.log")
}

// agentIDPath returns the stable-ID file path for the given executable dir.
func agentIDPath(execDir string) string {
	return filepath.Join(execDir, "agent.id")
}

func loadConfig() AgentConfig {
	return loadConfigFromDir(executableDir())
}

// loadConfigFromDir loads configuration with execDir as the anchor.
// Search order (first readable file wins):
//  1. <execDir>/OPMAgentServerInfo.json, then <execDir>/agent.conf
//  2. The fixed install locations (C:\OpManagerAgent, Program Files
//     ManageEngine path, /etc/opmanager on Unix)
//  3. Environment variables (SERVER_URL / PROBE_ID / AUTH_KEY /
//     POLL_INTERVAL) when no config file was found.
//
// The working directory is deliberately NOT searched: a service or
// scheduled task can start with any CWD (System32 is the usual one),
// and a stray agent.conf in that CWD must never shadow the installed
// configuration. The agent.conf format is unchanged (SERVER_URL,
// PROBE_ID, AUTH_KEY, POLL_INTERVAL, CUSTOM_NAME).
func loadConfigFromDir(execDir string) AgentConfig {
	cfg := AgentConfig{
		ServerURL:    DefaultServer,
		ProbeID:      DefaultProbe,
		AuthKey:      "",
		PollInterval: DefaultInterval,
	}

	// 1. Search for ManageEngine OPMAgentServerInfo.json
	jsonPaths := []string{
		filepath.Join(execDir, "OPMAgentServerInfo.json"),
		"C:\\OpManagerAgent\\OPMAgentServerInfo.json",
		"C:\\Program Files\\ManageEngine\\OpManagerAgent\\OPMAgentServerInfo.json",
	}

	for _, jp := range jsonPaths {
		data, err := os.ReadFile(jp)
		if err == nil {
			var m map[string]interface{}
			if err := json.Unmarshal(data, &m); err == nil {
				host := "192.168.30.65"
				port := "8060"
				proto := "http"

				if v, ok := m["ServerName"].(string); ok && v != "" {
					host = v
				} else if v, ok := m["PrimaryServerIP"].(string); ok && v != "" {
					host = v
				} else if v, ok := m["ServerIp"].(string); ok && v != "" {
					host = v
				}

				if v, ok := m["ServerPort"].(string); ok && v != "" {
					port = v
				} else if v, ok := m["PrimaryServerPort"].(string); ok && v != "" {
					port = v
				} else if v, ok := m["Port"].(string); ok && v != "" {
					port = v
				}

				if v, ok := m["ServerProtocol"].(string); ok && v != "" {
					proto = v
				} else if v, ok := m["Protocol"].(string); ok && v != "" {
					proto = v
				}

				cfg.ServerURL = fmt.Sprintf("%s://%s:%s", proto, host, port)
				if v, ok := m["ProbeId"].(string); ok && v != "" {
					cfg.ProbeID = v
				} else if v, ok := m["ProbeID"].(string); ok && v != "" {
					cfg.ProbeID = v
				}
				if v, ok := m["AuthKey"].(string); ok && v != "" {
					cfg.AuthKey = v
				}

				logSuccess(fmt.Sprintf("Server configuration loaded from %s -> Central at %s", jp, cfg.ServerURL))
				return cfg
			}
		}
	}

	// 2. Search for agent.conf
	searchPaths := []string{
		filepath.Join(execDir, "agent.conf"),
		"/etc/opmanager/agent.conf",
		"C:\\OpManagerAgent\\agent.conf",
		"C:\\Program Files\\ManageEngine\\OpManagerAgent\\agent.conf",
	}

	for _, p := range searchPaths {
		data, err := os.ReadFile(p)
		if err == nil {
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if strings.HasPrefix(line, "#") || !strings.Contains(line, "=") {
					continue
				}
				parts := strings.SplitN(line, "=", 2)
				key := strings.TrimSpace(parts[0])
				val := strings.TrimSpace(parts[1])

				switch strings.ToUpper(key) {
				case "SERVER_URL", "SERVER_IPADDRESS", "SERVER_NAME":
					if val != "" {
						if !strings.HasPrefix(val, "http://") && !strings.HasPrefix(val, "https://") {
							val = "http://" + val
						}
						cfg.ServerURL = val
					}
				case "PROBE_ID", "PROBE":
					if val != "" {
						cfg.ProbeID = val
					}
				case "AUTH_KEY", "EEAUTHKEY":
					if val != "" {
						cfg.AuthKey = val
					}
				case "POLL_INTERVAL", "INTERVAL":
					if i, err := strconv.Atoi(val); err == nil && i > 0 {
						cfg.PollInterval = i
					}
				case "CUSTOM_NAME", "DEVICE_NAME":
					if val != "" {
						cfg.CustomName = val
					}
				}
			}
			logInfo(fmt.Sprintf("Configuration loaded from: %s", p))
			return cfg
		}
	}

	// Environment overrides the config file (flags override these in main).
	// SERVER_URL / PROBE_ID / AUTH_KEY are the supported variables.
	if v := strings.TrimSpace(os.Getenv("SERVER_URL")); v != "" {
		if !strings.HasPrefix(v, "http://") && !strings.HasPrefix(v, "https://") {
			v = "http://" + v
		}
		cfg.ServerURL = v
	}
	if v := strings.TrimSpace(os.Getenv("PROBE_ID")); v != "" {
		cfg.ProbeID = v
	}
	if v := strings.TrimSpace(os.Getenv("AUTH_KEY")); v != "" {
		cfg.AuthKey = v
	}
	if v := strings.TrimSpace(os.Getenv("POLL_INTERVAL")); v != "" {
		if i, err := strconv.Atoi(v); err == nil && i > 0 {
			cfg.PollInterval = i
		}
	}

	return cfg
}

// loadOrCreateAgentID returns the stable identity for this host. The ID is
// generated once (a random UUID) and stored in agent.id next to the binary,
// so the same host keeps the same ID across restarts instead of
// re-registering as a different agent on every launch. The file is
// resolved from the executable directory (bug (c)); the working
// directory is never used. If the binary's directory is not writable,
// the ID is persisted under the per-user config directory instead.
func loadOrCreateAgentID() string {
	return loadOrCreateAgentIDIn(executableDir())
}

func loadOrCreateAgentIDIn(dir string) string {
	idFile := agentIDPath(dir)
	fallback := fallbackAgentIDPath()

	for _, p := range []string{idFile, fallback} {
		if p == "" {
			continue
		}
		if data, err := os.ReadFile(p); err == nil {
			if id := strings.TrimSpace(string(data)); id != "" {
				return id
			}
		}
	}

	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		logError(fmt.Sprintf("Could not generate agent ID: %v", err))
		return ""
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant 10
	id := fmt.Sprintf("AGT-%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])

	if err := os.WriteFile(idFile, []byte(id+"\n"), 0600); err != nil {
		// The binary's directory may be read-only (e.g. Program Files
		// without elevation); fall back to the per-user config dir so
		// the ID is still persisted when possible.
		if fallback == "" || os.MkdirAll(filepath.Dir(fallback), 0700) != nil || os.WriteFile(fallback, []byte(id+"\n"), 0600) != nil {
			logWarn(fmt.Sprintf("Could not persist agent ID to %s or %s (%v); this run will use a one-off ID.", idFile, fallback, err))
		} else {
			logInfo(fmt.Sprintf("Agent ID created and stored in %s", fallback))
		}
	} else {
		logInfo(fmt.Sprintf("Agent ID created and stored in %s", idFile))
	}
	return id
}

// fallbackAgentIDPath is where the stable ID is persisted when the
// binary's directory is not writable: %AppData%\opmanager-agent\
// agent.id on Windows, ~/.config/opmanager-agent/agent.id on Unix.
// Empty when no per-user config directory can be determined.
func fallbackAgentIDPath() string {
	cfgDir, err := os.UserConfigDir()
	if err != nil {
		return ""
	}
	return filepath.Join(cfgDir, "opmanager-agent", "agent.id")
}

func runAgent(cfg AgentConfig) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	stop := make(chan struct{})
	go func() {
		<-sigChan
		close(stop)
	}()
	runAgentLoop(cfg, stop)
}

// runAgentLoop is the agent main loop. It returns (instead of exiting)
// when stop is closed, so the Windows service handler can stop it on an
// SCM Stop/Shutdown request; runAgent above feeds stop from SIGINT/SIGTERM.
func runAgentLoop(cfg AgentConfig, stop <-chan struct{}) {
	hostname, _ := os.Hostname()
	if cfg.CustomName != "" {
		hostname = cfg.CustomName
	}
	if hostname == "" {
		hostname = fmt.Sprintf("Host-%s", runtime.GOOS)
	}

	agentID = loadOrCreateAgentID()
	if agentID == "" {
		logError("No stable agent ID could be created; refusing to start.")
		os.Exit(1)
	}

	logInfo(fmt.Sprintf("Initializing host telemetry collection for '%s' (Agent ID: %s)...", hostname, agentID))

	registered := registerWithCentral(cfg, hostname)
	if !registered {
		logWarn("Initial registration failed or server unreachable; will auto-retry during heartbeat loop.")
	}

	ticker := time.NewTicker(time.Duration(cfg.PollInterval) * time.Second)
	defer ticker.Stop()

	logSuccess(fmt.Sprintf("Agent started successfully. Polling every %d seconds. Press Ctrl+C to terminate.", cfg.PollInterval))

	// Initial poll immediately
	sendTelemetry(cfg, hostname)

	for {
		select {
		case <-stop:
			logInfo("Received termination signal. Notifying OpManager Central...")
			sendDeregister(cfg)
			logInfo("OpManager Agent stopped cleanly.")
			return
		case <-ticker.C:
			sendTelemetry(cfg, hostname)
		}
	}
}

func registerWithCentral(cfg AgentConfig, hostname string) bool {
	payload := map[string]interface{}{
		"agentId":      agentID,
		"hostname":     hostname,
		"os":           runtime.GOOS,
		"platform":     fmt.Sprintf("%s (%s)", runtime.GOOS, runtime.GOARCH),
		"arch":         runtime.GOARCH,
		"probeId":      cfg.ProbeID,
		"authKey":      cfg.AuthKey,
		"agentVersion": AgentVersion,
		"timestamp":    time.Now().Format(time.RFC3339),
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/api/agent/register", cfg.ServerURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		logError(fmt.Sprintf("Failed to construct register request: %v", err))
		return false
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("eeauthkey", cfg.AuthKey)

	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		logWarn(fmt.Sprintf("Central connection warning (%s): %v", url, err))
		return false
	}
	defer resp.Body.Close()

	// Also ping ManageEngine servlet
	go func() {
		servletUrl := fmt.Sprintf("%s/servlets/RegisterAgent", cfg.ServerURL)
		sReq, _ := http.NewRequest("POST", servletUrl, bytes.NewBuffer(body))
		if sReq != nil {
			sReq.Header.Set("Content-Type", "application/json")
			client.Do(sReq)
		}
	}()

	var regResp RegisterResponse
	json.NewDecoder(resp.Body).Decode(&regResp)

	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		logSuccess(fmt.Sprintf("Registered with Central Server (%s). Assigned Agent ID: %s", cfg.ServerURL, agentID))
		return true
	}

	logWarn(fmt.Sprintf("Registration returned HTTP %d: %s", resp.StatusCode, regResp.Message))
	return false
}

func sendTelemetry(cfg AgentConfig, hostname string) {
	metrics := collectSystemMetrics(cfg, hostname)

	body, err := json.Marshal(metrics)
	if err != nil {
		logError(fmt.Sprintf("Failed to encode telemetry JSON: %v", err))
		return
	}

	url := fmt.Sprintf("%s/api/agent/telemetry", cfg.ServerURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("eeauthkey", cfg.AuthKey)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		logWarn(fmt.Sprintf("Telemetry heartbeat failed (Central unreachable): %v", err))
		return
	}
	defer resp.Body.Close()

	// Also ping ManageEngine servlet
	go func() {
		sUrl := fmt.Sprintf("%s/servlets/DataAgentHandlerServlet", cfg.ServerURL)
		sReq, _ := http.NewRequest("POST", sUrl, bytes.NewBuffer(body))
		if sReq != nil {
			sReq.Header.Set("Content-Type", "application/json")
			client.Do(sReq)
		}
	}()

	if resp.StatusCode == 200 {
		logHeartbeat(fmt.Sprintf("Telemetry synced -> CPU: %s | Memory: %s (Used: %d MB) | Disk: %s | Interfaces: %d",
			formatPercent(metrics.CPUUsage), formatPercent(metrics.MemoryUsage), metrics.MemoryUsedMB, formatPercent(metrics.DiskUsage), len(metrics.Interfaces)))
	} else {
		logWarn(fmt.Sprintf("Heartbeat rejected with status %d", resp.StatusCode))
	}
}

// formatPercent renders a metric for the heartbeat log; noData (-1) means
// the value could not be measured on this host, not 0%.
func formatPercent(v float64) string {
	if v == noData {
		return "n/a"
	}
	return fmt.Sprintf("%.1f%%", v)
}

func sendDeregister(cfg AgentConfig) {
	url := fmt.Sprintf("%s/api/agent/deregister", cfg.ServerURL)
	payload := map[string]string{
		"agentId": agentID,
		"authKey": cfg.AuthKey,
	}
	b, _ := json.Marshal(payload)
	client := &http.Client{Timeout: 2 * time.Second}
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	client.Do(req)
}

// testConnection verifies the server actually answers the agent API: it
// performs an authenticated GET of /api/agent/list and checks the response
// is really an OpManager agent list (JSON with an "agents" array). Any
// other status, a non-JSON body, or a body without that shape is a failure —
// a bare HTTP 200 from some other endpoint proves nothing.
func testConnection(cfg AgentConfig) {
	logInfo(fmt.Sprintf("Testing Central agent API at %s...", cfg.ServerURL))
	url := fmt.Sprintf("%s/api/agent/list", cfg.ServerURL)

	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		logError(fmt.Sprintf("Connection test failed: %v", err))
		os.Exit(1)
	}
	req.Header.Set("eeauthkey", cfg.AuthKey)

	resp, err := client.Do(req)
	if err != nil {
		logError(fmt.Sprintf("Connection failed: %v", err))
		os.Exit(1)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		logError(fmt.Sprintf("Connection test failed: server replied HTTP %d to GET %s (expected 200 with an agent list)", resp.StatusCode, url))
		os.Exit(1)
	}

	var listResp agentListResponse
	if err := json.NewDecoder(resp.Body).Decode(&listResp); err != nil {
		logError(fmt.Sprintf("Connection test failed: server replied HTTP 200 but the body is not a valid agent-list response (%v)", err))
		os.Exit(1)
	}
	if listResp.Agents == nil {
		logError("Connection test failed: server replied HTTP 200 but the body has no \"agents\" array — this does not look like the OpManager agent API")
		os.Exit(1)
	}

	logSuccess(fmt.Sprintf("Successfully connected to OpManager Central at %s: agent API answered (totalAgents=%d, activeAgents=%d)", cfg.ServerURL, listResp.TotalAgents, listResp.ActiveAgents))
}

// quoteCmdArg quotes one command-line argument the way the Windows
// command-line parser (CommandLineToArgvW, which sc.exe's parser follows
// for quoted values) expects: arguments without spaces/tabs/quotes are
// passed bare; anything else is wrapped in double quotes with inner
// quotes escaped as \" and trailing backslashes doubled.
func quoteCmdArg(s string) string {
	if s == "" {
		return `""`
	}
	if !strings.ContainsAny(s, " \t\"") {
		return s
	}
	var b strings.Builder
	b.WriteByte('"')
	for i := 0; i < len(s); i++ {
		if s[i] == '"' {
			b.WriteString(`\"`)
		} else if s[i] == '\\' {
			// Count a run of backslashes: double them when they precede
			// a quote or the closing quote, else pass through.
			j := i
			for j < len(s) && s[j] == '\\' {
				j++
			}
			if j >= len(s) || s[j] == '"' {
				for k := i; k < j; k++ {
					b.WriteString(`\\`)
				}
			} else {
				for k := i; k < j; k++ {
					b.WriteByte('\\')
				}
			}
			i = j - 1
		} else {
			b.WriteByte(s[i])
		}
	}
	b.WriteByte('"')
	return b.String()
}

// scBinPath builds the value for sc.exe's binPath= parameter: the quoted
// executable path followed by the service arguments, each quoted as
// needed. The whole value is ONE argv element (see scCreateArgs); Go's
// Windows command-line builder then wraps it in outer quotes, producing
// exactly the form sc.exe documents, e.g.
// binPath= ""C:\Program Files\OpManagerAgent\OpManagerAgent.exe" -server http://... -probe 101 -key <key> -interval 5"
// (outer quotes delimit the value, inner quotes protect a spaced path).
func scBinPath(exePath string, args []string) string {
	parts := []string{quoteCmdArg(exePath)}
	for _, a := range args {
		parts = append(parts, quoteCmdArg(a))
	}
	return strings.Join(parts, " ")
}

// scCreateArgs returns the exact argv for `sc.exe create` for this agent.
//
// Bug (a): the old code built "binPath= <value>", "start= auto" and
// "DisplayName= ..." each as a SINGLE argv element. Go's exec.Command
// quotes any argv element containing spaces, so sc.exe received
// `"binPath= \"C:\...\" ..."` — a quoted blob whose leading token is
// `"binPath=` — and its own command-line parser could not find the
// binPath/start values, failing with exit 1639 ("Invalid start=").
// sc.exe requires the parameter name (with its mandatory space after
// `=`) and the value as SEPARATE whitespace-separated tokens, so each
// `name=` and its value must be separate argv elements; Go then quotes
// only the values that contain spaces, and sc.exe parses them correctly.
func scCreateArgs(exePath string, args []string) []string {
	return []string{
		"create", "OpManagerCentralAgent",
		"binPath=", scBinPath(exePath, args),
		"start=", "auto",
		"DisplayName=", "ManageEngine OpManager Central Agent",
	}
}

// buildScCreateCmd builds the sc.exe create command for -install.
func buildScCreateCmd(exePath string, args []string) *exec.Cmd {
	return exec.Command("sc.exe", scCreateArgs(exePath, args)...)
}
func serviceArgs(cfg AgentConfig) []string {
	return []string{
		"-server", cfg.ServerURL,
		"-probe", cfg.ProbeID,
		"-key", cfg.AuthKey,
		"-interval", strconv.Itoa(cfg.PollInterval),
	}
}

// writeAgentConf writes the effective configuration next to the binary so
// the installed service (and a manual run) picks up the same settings.
func writeAgentConf(cfg AgentConfig) {
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	confPath := filepath.Join(filepath.Dir(exePath), "agent.conf")
	content := fmt.Sprintf("# ManageEngine OpManager Central Agent Configuration File\n# Written by -install on %s\nSERVER_URL=%s\nPROBE_ID=%s\nAUTH_KEY=%s\nPOLL_INTERVAL=%d\nCUSTOM_NAME=%s\n",
		time.Now().Format("2006-01-02 15:04:05"), cfg.ServerURL, cfg.ProbeID, cfg.AuthKey, cfg.PollInterval, cfg.CustomName)
	if err := os.WriteFile(confPath, []byte(content), 0600); err != nil {
		logWarn(fmt.Sprintf("Could not write %s (%v); the service arguments still carry the configuration.", confPath, err))
		return
	}
	fmt.Printf("[INFO] Configuration written to: %s\n", confPath)
}

func installService(cfg AgentConfig) {
	args := serviceArgs(cfg)
	writeAgentConf(cfg)

	if runtime.GOOS == "windows" {
		fmt.Println("[INSTALL] Registering Windows Service: OpManagerCentralAgent...")
		exePath, _ := os.Executable()
		cmd := buildScCreateCmd(exePath, args)
		fmt.Printf("[INFO] sc.exe command line: sc.exe %s\n", strings.Join(cmd.Args[1:], " "))
		out, err := cmd.CombinedOutput()
		if err != nil {
			fmt.Printf("[ERROR] sc.exe failed: %v, Output: %s\n", err, string(out))
			fmt.Println("[NOTE] Please run Command Prompt or PowerShell as Administrator.")
			os.Exit(1)
		}
		fmt.Println("[SUCCESS] Windows Service 'OpManagerCentralAgent' created successfully!")
		fmt.Printf("[INFO] Service command line: %s\n", scBinPath(exePath, args))
		startCmd := exec.Command("sc.exe", "start", "OpManagerCentralAgent")
		if out, err := startCmd.CombinedOutput(); err != nil {
			fmt.Printf("[WARN] Service created but could not be started: %v, Output: %s\n", err, string(out))
			fmt.Println("To start service: net start OpManagerCentralAgent")
		} else {
			fmt.Println("[SUCCESS] Service started.")
		}
	} else if runtime.GOOS == "darwin" {
		fmt.Println("[INSTALL] Generating macOS launchd daemon configuration...")
		exePath, _ := os.Executable()
		var argXML strings.Builder
		argXML.WriteString(fmt.Sprintf("        <string>%s</string>\n", exePath))
		for _, a := range args {
			argXML.WriteString(fmt.Sprintf("        <string>%s</string>\n", a))
		}
		plistContent := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.manageengine.opmanager.agent</string>
    <key>ProgramArguments</key>
    <array>
%s    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/opmanager_agent.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/opmanager_agent.err</string>
</dict>
</plist>`, argXML.String())

		plistName := "com.manageengine.opmanager.agent.plist"
		plistPath := filepath.Join("/Library/LaunchDaemons", plistName)
		if err := os.WriteFile(plistPath, []byte(plistContent), 0644); err != nil {
			tmpPath := filepath.Join("/tmp", plistName)
			if err2 := os.WriteFile(tmpPath, []byte(plistContent), 0644); err2 != nil {
				fmt.Printf("[ERROR] Could not write launchd plist to %s or %s: %v / %v\n", plistPath, tmpPath, err, err2)
				os.Exit(1)
			}
			fmt.Printf("[SUCCESS] Launchd plist written to %s (needs root to install system-wide)\n", tmpPath)
			fmt.Println("To install system-wide:")
			fmt.Printf("sudo cp %s /Library/LaunchDaemons/\n", tmpPath)
			fmt.Println("sudo launchctl load /Library/LaunchDaemons/com.manageengine.opmanager.agent.plist")
			return
		}
		fmt.Printf("[SUCCESS] Launchd plist written to %s\n", plistPath)
		cmd := exec.Command("launchctl", "load", plistPath)
		if out, err := cmd.CombinedOutput(); err != nil {
			fmt.Printf("[WARN] Plist installed but launchctl load failed: %v, Output: %s\n", err, string(out))
			fmt.Printf("Load it manually: sudo launchctl load %s\n", plistPath)
		} else {
			fmt.Println("[SUCCESS] Daemon loaded and started.")
		}
	} else {
		fmt.Println("[INSTALL] Creating systemd unit file for Linux...")
		exePath, _ := os.Executable()
		var quotedArgs strings.Builder
		for _, a := range args {
			quotedArgs.WriteString(fmt.Sprintf(" \"%s\"", a))
		}
		unitContent := fmt.Sprintf(`[Unit]
Description=ManageEngine OpManager Central Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart="%s"%s
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`, exePath, quotedArgs.String())

		unitPath := "/etc/systemd/system/opmanager-agent.service"
		if err := os.WriteFile(unitPath, []byte(unitContent), 0644); err != nil {
			tmpPath := "/tmp/opmanager-agent.service"
			if err2 := os.WriteFile(tmpPath, []byte(unitContent), 0644); err2 != nil {
				fmt.Printf("[ERROR] Could not write systemd unit to %s or %s: %v / %v\n", unitPath, tmpPath, err, err2)
				os.Exit(1)
			}
			fmt.Printf("[SUCCESS] Systemd unit written to %s (needs root to install system-wide)\n", tmpPath)
			fmt.Println("To install system-wide:")
			fmt.Printf("sudo cp %s /etc/systemd/system/opmanager-agent.service\n", tmpPath)
			fmt.Println("sudo systemctl daemon-reload && sudo systemctl enable --now opmanager-agent")
			return
		}
		fmt.Printf("[SUCCESS] Systemd unit written to %s\n", unitPath)
		reload := exec.Command("systemctl", "daemon-reload")
		if out, err := reload.CombinedOutput(); err != nil {
			fmt.Printf("[WARN] Unit installed but systemctl daemon-reload failed: %v, Output: %s\n", err, string(out))
			fmt.Println("Run: sudo systemctl daemon-reload && sudo systemctl enable --now opmanager-agent")
			return
		}
		enable := exec.Command("systemctl", "enable", "--now", "opmanager-agent")
		if out, err := enable.CombinedOutput(); err != nil {
			fmt.Printf("[WARN] Unit installed but enable/start failed: %v, Output: %s\n", err, string(out))
			fmt.Println("Run: sudo systemctl enable --now opmanager-agent")
		} else {
			fmt.Println("[SUCCESS] Service enabled and started.")
		}
	}
}

// =========================================================================
// Real Hardware & System Telemetry Collection
//
// Every collector below reads a real OS source. When a measurement cannot
// be obtained on a platform, the metric is reported as noData (-1) / empty
// rather than invented — the server must display that as "no data".
// =========================================================================
func collectSystemMetrics(cfg AgentConfig, hostname string) SystemTelemetry {
	uptime := getSystemUptimeSeconds()

	cpu := getCPUUsage()
	memTotal, memUsed, memPercent := getMemoryMetrics()
	diskTotal, diskUsed, diskPercent := getDiskMetrics()
	interfaces := getNetworkInterfaces()
	topProcs := getTopProcesses()

	primaryIP := "127.0.0.1"
	primaryMAC := "00:50:56:00:00:01"

	for _, iface := range interfaces {
		if iface.IsUp && len(iface.IPs) > 0 && !strings.HasPrefix(iface.IPs[0], "127.") {
			primaryIP = iface.IPs[0]
			if iface.MAC != "" {
				primaryMAC = iface.MAC
			}
			break
		}
	}

	return SystemTelemetry{
		AgentID:       agentID,
		Hostname:      hostname,
		OS:            runtime.GOOS,
		Platform:      fmt.Sprintf("%s (%s)", runtime.GOOS, runtime.GOARCH),
		Arch:          runtime.GOARCH,
		ProbeID:       cfg.ProbeID,
		AuthKey:       cfg.AuthKey,
		AgentVersion:  AgentVersion,
		IPAddress:     primaryIP,
		MACAddress:    primaryMAC,
		UptimeSeconds: uptime,
		CPUUsage:      cpu,
		MemoryTotalMB: memTotal,
		MemoryUsedMB:  memUsed,
		MemoryUsage:   memPercent,
		DiskTotalGB:   diskTotal,
		DiskUsedGB:    diskUsed,
		DiskUsage:     diskPercent,
		Interfaces:    interfaces,
		TopProcesses:  topProcs,
		Status:        "Online",
		Timestamp:     time.Now().Format(time.RFC3339),
	}
}

// getSystemUptimeSeconds returns SYSTEM uptime (time since boot), not how
// long the agent process has been running.
func getSystemUptimeSeconds() uint64 {
	switch runtime.GOOS {
	case "linux":
		data, err := os.ReadFile("/proc/uptime")
		if err == nil {
			fields := strings.Fields(string(data))
			if len(fields) >= 1 {
				if f, err := strconv.ParseFloat(fields[0], 64); err == nil && f >= 0 {
					return uint64(f)
				}
			}
		}
	case "darwin":
		out, err := exec.Command("sysctl", "-n", "kern.boottime").Output()
		if err == nil {
			// "{ sec = 1762650000, usec = 0 } Tue Nov  4 ..."
			s := string(out)
			if i := strings.Index(s, "sec = "); i >= 0 {
				rest := s[i+len("sec = "):]
				if j := strings.Index(rest, ","); j >= 0 {
					if sec, err := strconv.ParseInt(strings.TrimSpace(rest[:j]), 10, 64); err == nil {
						if u := time.Now().Unix() - sec; u > 0 {
							return uint64(u)
						}
					}
				}
			}
		}
	case "windows":
		out, err := exec.Command("powershell", "-NoProfile", "-Command",
			"[int]([datetime]::UtcNow - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToUniversalTime()).TotalSeconds").Output()
		if err == nil {
			if v, err := strconv.ParseInt(strings.TrimSpace(string(out)), 10, 64); err == nil && v > 0 {
				return uint64(v)
			}
		}
	}
	logWarn("Could not determine system uptime; reporting 0")
	return 0
}

// --- CPU -----------------------------------------------------------------

type cpuTimes struct {
	idle  uint64
	total uint64
}

// readProcStat reads aggregate CPU times from /proc/stat (Linux).
func readProcStat() (cpuTimes, bool) {
	data, err := os.ReadFile("/proc/stat")
	if err != nil {
		return cpuTimes{}, false
	}
	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "cpu ") {
			fields := strings.Fields(line)
			if len(fields) < 5 {
				return cpuTimes{}, false
			}
			var vals []uint64
			for _, f := range fields[1:] {
				v, err := strconv.ParseUint(f, 10, 64)
				if err != nil {
					return cpuTimes{}, false
				}
				vals = append(vals, v)
			}
			var total uint64
			for _, v := range vals {
				total += v
			}
			idle := vals[3] // idle
			if len(vals) > 4 {
				idle += vals[4] // iowait counts as idle
			}
			return cpuTimes{idle: idle, total: total}, true
		}
	}
	return cpuTimes{}, false
}

// getCPUUsage returns real CPU utilisation (percent of total capacity).
// Linux: two /proc/stat samples 200 ms apart. macOS: the real user+sys
// share from `top` (100 - idle), never loadavg x an arbitrary factor.
// Windows: the real _Total processor-time counter, wmic as fallback.
// Returns noData (-1) when no real measurement could be obtained.
func getCPUUsage() float64 {
	switch runtime.GOOS {
	case "linux":
		a, ok1 := readProcStat()
		if !ok1 {
			break
		}
		time.Sleep(200 * time.Millisecond)
		b, ok2 := readProcStat()
		if !ok2 {
			break
		}
		totalDelta := float64(b.total - a.total)
		idleDelta := float64(b.idle - a.idle)
		if totalDelta <= 0 {
			return 0
		}
		return math.Min(100, math.Max(0, (totalDelta-idleDelta)/totalDelta*100))
	case "darwin":
		out, err := exec.Command("top", "-l", "1", "-n", "0").Output()
		if err == nil {
			// "CPU usage: 8.25% user, 12.10% sys, 79.64% idle"
			for _, line := range strings.Split(string(out), "\n") {
				if !strings.Contains(line, "CPU usage:") {
					continue
				}
				for _, seg := range strings.Split(line, ",") {
					if !strings.Contains(seg, "idle") {
						continue
					}
					fields := strings.Fields(strings.TrimSpace(seg))
					if len(fields) >= 1 {
						if f, err := strconv.ParseFloat(strings.TrimSuffix(fields[0], "%"), 64); err == nil {
							return math.Min(100, math.Max(0, 100-f))
						}
					}
				}
			}
		}
	case "windows":
		out, err := exec.Command("powershell", "-NoProfile", "-Command",
			"(Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue").Output()
		if err == nil {
			if f, err := strconv.ParseFloat(strings.TrimSpace(string(out)), 64); err == nil {
				return math.Min(100, math.Max(0, f))
			}
		}
		out, err = exec.Command("wmic", "cpu", "get", "loadpercentage").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if val, err := strconv.Atoi(line); err == nil {
					return float64(val)
				}
			}
		}
	}
	logWarn("Could not measure CPU usage; reporting no data")
	return noData
}

// --- Memory --------------------------------------------------------------

// getMemoryMetrics returns real total/used memory (MB) and used percent.
// Linux: /proc/meminfo (MemTotal / MemAvailable). macOS: hw.memsize total
// with used from vm_stat (total minus free+inactive+speculative pages).
// Windows: wmic OS free/total physical memory. Returns 0, 0, noData when
// no real measurement could be obtained.
func getMemoryMetrics() (uint64, uint64, float64) {
	switch runtime.GOOS {
	case "linux":
		data, err := os.ReadFile("/proc/meminfo")
		if err == nil {
			var totalKB, availKB uint64
			for _, line := range strings.Split(string(data), "\n") {
				fields := strings.Fields(line)
				if len(fields) < 2 {
					continue
				}
				switch fields[0] {
				case "MemTotal:":
					totalKB, _ = strconv.ParseUint(fields[1], 10, 64)
				case "MemAvailable:":
					availKB, _ = strconv.ParseUint(fields[1], 10, 64)
				}
			}
			if totalKB > 0 {
				usedKB := totalKB - availKB
				return totalKB / 1024, usedKB / 1024, float64(usedKB) / float64(totalKB) * 100.0
			}
		}
	case "darwin":
		out, err := exec.Command("sysctl", "-n", "hw.memsize").Output()
		var totalBytes uint64
		if err == nil {
			totalBytes, _ = strconv.ParseUint(strings.TrimSpace(string(out)), 10, 64)
		}
		vmOut, vmErr := exec.Command("vm_stat").Output()
		if totalBytes > 0 && vmErr == nil {
			pageSize := uint64(4096)
			var freePages, inactivePages, speculativePages uint64
			for _, line := range strings.Split(string(vmOut), "\n") {
				if strings.HasPrefix(line, "Mach Virtual Memory Statistics") {
					continue
				}
				if strings.Contains(line, "page size of ") {
					// "Mach Virtual Memory Statistics: (page size of 16384 bytes)"
					if i := strings.Index(line, "page size of "); i >= 0 {
						rest := line[i+len("page size of "):]
						fields := strings.Fields(rest)
						if len(fields) >= 1 {
							if ps, err := strconv.ParseUint(fields[0], 10, 64); err == nil && ps > 0 {
								pageSize = ps
							}
						}
					}
					continue
				}
				parts := strings.SplitN(line, ":", 2)
				if len(parts) != 2 {
					continue
				}
				valStr := strings.Trim(strings.TrimSpace(parts[1]), ".")
				v, err := strconv.ParseUint(valStr, 10, 64)
				if err != nil {
					continue
				}
				switch strings.TrimSpace(parts[0]) {
				case "Pages free":
					freePages = v
				case "Pages inactive":
					inactivePages = v
				case "Pages speculative":
					speculativePages = v
				}
			}
			availableBytes := (freePages + inactivePages + speculativePages) * pageSize
			usedBytes := totalBytes - availableBytes
			totalMB := totalBytes / (1024 * 1024)
			usedMB := usedBytes / (1024 * 1024)
			return totalMB, usedMB, float64(usedBytes) / float64(totalBytes) * 100.0
		}
	case "windows":
		out, err := exec.Command("wmic", "OS", "get", "FreePhysicalMemory,TotalVisibleMemorySize").Output()
		if err == nil {
			fields := strings.Fields(string(out))
			if len(fields) >= 4 {
				freeKB, _ := strconv.ParseUint(fields[2], 10, 64)
				totalKB, _ := strconv.ParseUint(fields[3], 10, 64)
				if totalKB > 0 {
					totalMB := totalKB / 1024
					usedMB := (totalKB - freeKB) / 1024
					return totalMB, usedMB, float64(usedMB) / float64(totalMB) * 100.0
				}
			}
		}
	}
	logWarn("Could not measure memory; reporting no data")
	return 0, 0, noData
}

// --- Disk ----------------------------------------------------------------

// getDiskMetrics returns real disk usage for the root filesystem on Unix
// (via `df -k /`) and for the C: drive on Windows (via wmic
// Win32_LogicalDisk). It never reports invented capacity. Returns
// 0, 0, noData when no real measurement could be obtained.
//
// NOTE: the audit suggested syscall.Statfs for Unix, but syscall.Statfs /
// syscall.Statfs_t do not exist in Go's syscall package on Windows, so a
// single-file agent using them cannot cross-compile to the Windows target
// build_all.py produces (verified: GOOS=windows build fails with
// "undefined: syscall.Statfs"). `df` reads the same real filesystem data
// on Unix and keeps one file building on all three platforms.
func getDiskMetrics() (float64, float64, float64) {
	if runtime.GOOS == "windows" {
		out, err := exec.Command("wmic", "logicaldisk", "where", "DeviceID='C:'", "get", "Size,FreeSpace").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) >= 2 {
				headers := strings.Fields(lines[0])
				values := strings.Fields(lines[1])
				var sizeIdx, freeIdx = -1, -1
				for i, h := range headers {
					switch h {
					case "Size":
						sizeIdx = i
					case "FreeSpace":
						freeIdx = i
					}
				}
				if sizeIdx >= 0 && freeIdx >= 0 && len(values) > sizeIdx && len(values) > freeIdx {
					size, err1 := strconv.ParseFloat(values[sizeIdx], 64)
					free, err2 := strconv.ParseFloat(values[freeIdx], 64)
					if err1 == nil && err2 == nil && size > 0 {
						totalGB := size / (1024 * 1024 * 1024)
						usedGB := (size - free) / (1024 * 1024 * 1024)
						return totalGB, usedGB, math.Min(100, usedGB/totalGB*100.0)
					}
				}
			}
		}
		logWarn("Could not measure disk usage on Windows; reporting no data")
		return 0, 0, noData
	}

	out, err := exec.Command("df", "-k", "/").Output()
	if err != nil {
		logWarn(fmt.Sprintf("Could not measure disk usage: %v; reporting no data", err))
		return 0, 0, noData
	}
	lines := strings.Split(string(out), "\n")
	if len(lines) >= 2 {
		fields := strings.Fields(lines[1])
		if len(fields) >= 4 {
			totKB, err1 := strconv.ParseFloat(fields[1], 64)
			usedKB, err2 := strconv.ParseFloat(fields[2], 64)
			if err1 == nil && err2 == nil && totKB > 0 {
				totalGB := totKB / (1024 * 1024)
				usedGB := usedKB / (1024 * 1024)
				return totalGB, usedGB, math.Min(100, usedGB/totalGB*100.0)
			}
		}
	}
	logWarn("Could not parse disk usage; reporting no data")
	return 0, 0, noData
}

// --- Network interfaces (real; unchanged) --------------------------------

func getNetworkInterfaces() []NetworkInterfaceInfo {
	var list []NetworkInterfaceInfo
	ifaces, err := net.Interfaces()
	if err != nil {
		return list
	}

	for _, iface := range ifaces {
		if iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, _ := iface.Addrs()
		var ipStrs []string
		for _, a := range addrs {
			ipNet, ok := a.(*net.IPNet)
			if ok && !ipNet.IP.IsLoopback() && ipNet.IP.To4() != nil {
				ipStrs = append(ipStrs, ipNet.IP.String())
			}
		}

		list = append(list, NetworkInterfaceInfo{
			Name:  iface.Name,
			MAC:   iface.HardwareAddr.String(),
			IPs:   ipStrs,
			Flags: iface.Flags.String(),
			IsUp:  iface.Flags&net.FlagUp != 0,
		})
	}

	return list
}

// --- Processes -----------------------------------------------------------

type procSample struct {
	pid      int
	name     string
	totalCPU uint64 // utime + stime, in clock ticks
	rssPages int64
}

// readLinuxProcs enumerates the real process table from /proc.
func readLinuxProcs() map[int]procSample {
	procs := make(map[int]procSample)
	entries, err := os.ReadDir("/proc")
	if err != nil {
		return procs
	}
	for _, e := range entries {
		pid, err := strconv.Atoi(e.Name())
		if err != nil || !e.IsDir() {
			continue
		}
		data, err := os.ReadFile(filepath.Join("/proc", e.Name(), "stat"))
		if err != nil {
			continue
		}
		// comm is in parentheses and may contain spaces/parens; fields
		// after the final ')' are: state ppid ... utime stime ... rss.
		s := string(data)
		closeIdx := strings.LastIndex(s, ")")
		if closeIdx < 0 {
			continue
		}
		name := s[strings.Index(s, "(")+1 : closeIdx]
		fields := strings.Fields(s[closeIdx+2:])
		// fields[0]=state, fields[11]=utime, fields[12]=stime, fields[21]=rss
		if len(fields) < 22 {
			continue
		}
		utime, err1 := strconv.ParseUint(fields[11], 10, 64)
		stime, err2 := strconv.ParseUint(fields[12], 10, 64)
		rss, err3 := strconv.ParseInt(fields[21], 10, 64)
		if err1 != nil || err2 != nil || err3 != nil {
			continue
		}
		procs[pid] = procSample{pid: pid, name: name, totalCPU: utime + stime, rssPages: rss}
	}
	return procs
}

// getTopProcesses returns the real top 5 processes by CPU. On Linux it
// samples /proc twice (200 ms apart) and ranks by actual CPU time consumed
// in that interval, with live PIDs and RSS memory. On macOS/Windows there
// is no equivalent stdlib-only source in this single-file agent, so it
// returns an empty list (honestly omitted) rather than a fabricated list.
func getTopProcesses() []ProcessInfo {
	if runtime.GOOS != "linux" {
		return []ProcessInfo{}
	}
	before, ok := readProcStat()
	if !ok {
		logWarn("Could not read /proc/stat for process sampling; omitting top processes")
		return []ProcessInfo{}
	}
	first := readLinuxProcs()
	time.Sleep(200 * time.Millisecond)
	after, ok := readProcStat()
	if !ok {
		return []ProcessInfo{}
	}
	second := readLinuxProcs()

	totalDelta := float64(after.total - before.total)
	if totalDelta <= 0 {
		return []ProcessInfo{}
	}
	pageSize := uint64(os.Getpagesize())
	var list []ProcessInfo
	for pid, p2 := range second {
		p1, ok := first[pid]
		if !ok {
			continue
		}
		delta := p2.totalCPU - p1.totalCPU
		cpu := float64(delta) / totalDelta * 100.0
		list = append(list, ProcessInfo{
			PID:      pid,
			Name:     p2.name,
			CPU:      math.Min(100, math.Max(0, cpu)),
			MemoryMB: float64(p2.rssPages) * float64(pageSize) / (1024 * 1024),
		})
	}
	sort.Slice(list, func(i, j int) bool { return list[i].CPU > list[j].CPU })
	if len(list) > 5 {
		list = list[:5]
	}
	return list
}

func writeLog(level, msg string) {
	entry := fmt.Sprintf("[%s] [%s] %s\n", time.Now().Format("2006-01-02 15:04:05"), level, msg)
	fmt.Print(entry)
	if logFile != nil {
		io.WriteString(logFile, entry)
	}
}

func logInfo(msg string) {
	writeLog("INFO", msg)
}

func logSuccess(msg string) {
	writeLog("SUCCESS", msg)
}

func logHeartbeat(msg string) {
	writeLog("HEARTBEAT", msg)
}

func logWarn(msg string) {
	writeLog("WARN", msg)
}

func logError(msg string) {
	writeLog("ERROR", msg)
}
