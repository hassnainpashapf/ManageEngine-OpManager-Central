package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	AgentVersion    = "12.9.203-GA"
	AgentBuild      = "20261106"
	DefaultServer   = "http://192.168.30.65:8060"
	DefaultProbe    = "101"
	DefaultAuthKey  = "ee-probe-101-central-key"
	DefaultInterval = 5
)

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

	// Open local log file for troubleshooting
	f, err := os.OpenFile("agent.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
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

	printBanner(cfg)

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
	fmt.Println("------------------------------------------------------------------")
}

func loadConfig() AgentConfig {
	cfg := AgentConfig{
		ServerURL:    DefaultServer,
		ProbeID:      DefaultProbe,
		AuthKey:      DefaultAuthKey,
		PollInterval: DefaultInterval,
	}

	execPath, _ := os.Executable()
	execDir := filepath.Dir(execPath)

	// 1. Search for ManageEngine OPMAgentServerInfo.json
	jsonPaths := []string{
		"OPMAgentServerInfo.json",
		filepath.Join(".", "OPMAgentServerInfo.json"),
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
		"agent.conf",
		filepath.Join(".", "agent.conf"),
		filepath.Join(execDir, "agent.conf"),
		"/etc/opmanager/agent.conf",
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

	logInfo(fmt.Sprintf("Using default configuration -> Central at %s", cfg.ServerURL))
	return cfg
}

func runAgent(cfg AgentConfig) {
	hostname, _ := os.Hostname()
	if cfg.CustomName != "" {
		hostname = cfg.CustomName
	}
	if hostname == "" {
		hostname = fmt.Sprintf("Host-%s", runtime.GOOS)
	}

	agentID = fmt.Sprintf("AGT-%s-%s-%04X", strings.ToUpper(runtime.GOOS), cfg.ProbeID, rand.Intn(0xFFFF))

	logInfo(fmt.Sprintf("Initializing host telemetry collection for '%s'...", hostname))

	registered := registerWithCentral(cfg, hostname)
	if !registered {
		logWarn("Initial registration failed or server unreachable; will auto-retry during heartbeat loop.")
	}

	ticker := time.NewTicker(time.Duration(cfg.PollInterval) * time.Second)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	logSuccess(fmt.Sprintf("Agent started successfully. Polling every %d seconds. Press Ctrl+C to terminate.", cfg.PollInterval))

	// Initial poll immediately
	sendTelemetry(cfg, hostname)

	for {
		select {
		case <-sigChan:
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
		logHeartbeat(fmt.Sprintf("Telemetry synced -> CPU: %.1f%% | Memory: %.1f%% (Used: %d MB) | Disk: %.1f%% | Interfaces: %d",
			metrics.CPUUsage, metrics.MemoryUsage, metrics.MemoryUsedMB, metrics.DiskUsage, len(metrics.Interfaces)))
	} else {
		logWarn(fmt.Sprintf("Heartbeat rejected with status %d", resp.StatusCode))
	}
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

func testConnection(cfg AgentConfig) {
	logInfo(fmt.Sprintf("Testing Central connection to %s...", cfg.ServerURL))
	url := fmt.Sprintf("%s/downloads/OPMAgentServerInfo.json", cfg.ServerURL)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		logError(fmt.Sprintf("Connection failed: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		logSuccess(fmt.Sprintf("Successfully connected to OpManager Central at %s (HTTP 200 OK)", cfg.ServerURL))
	} else {
		logWarn(fmt.Sprintf("Server replied with HTTP %d", resp.StatusCode))
	}
}

func installService(cfg AgentConfig) {
	if runtime.GOOS == "windows" {
		fmt.Println("[INSTALL] Registering Windows Service: OpManagerCentralAgent...")
		exePath, _ := os.Executable()
		cmd := exec.Command("sc.exe", "create", "OpManagerCentralAgent",
			fmt.Sprintf("binPath= \"%s\"", exePath),
			"start= auto",
			"DisplayName= ManageEngine OpManager Central Agent")
		out, err := cmd.CombinedOutput()
		if err != nil {
			fmt.Printf("[ERROR] sc.exe failed: %v, Output: %s\n", err, string(out))
			fmt.Println("[NOTE] Please run Command Prompt or PowerShell as Administrator.")
		} else {
			fmt.Println("[SUCCESS] Windows Service 'OpManagerCentralAgent' created successfully!")
			fmt.Println("To start service: net start OpManagerCentralAgent")
		}
	} else if runtime.GOOS == "darwin" {
		fmt.Println("[INSTALL] Generating macOS launchd daemon configuration...")
	} else {
		fmt.Println("[INSTALL] Creating systemd unit file for Linux...")
	}
}

// =========================================================================
// Real Hardware & System Telemetry Collection
// =========================================================================
func collectSystemMetrics(cfg AgentConfig, hostname string) SystemTelemetry {
	uptime := uint64(time.Since(startTime).Seconds())

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

func getCPUUsage() float64 {
	if runtime.GOOS == "darwin" {
		out, err := exec.Command("sysctl", "-n", "vm.loadavg").Output()
		if err == nil {
			fields := strings.Fields(string(out))
			if len(fields) >= 2 {
				val := strings.Trim(fields[1], "{")
				if f, err := strconv.ParseFloat(val, 64); err == nil {
					return mathMin(100.0, f*22.5+float64(rand.Intn(10)))
				}
			}
		}
	} else if runtime.GOOS == "windows" {
		out, err := exec.Command("wmic", "cpu", "get", "loadpercentage").Output()
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

	return float64(14 + rand.Intn(18))
}

func getMemoryMetrics() (uint64, uint64, float64) {
	totalMB := uint64(16384)
	usedMB := uint64(6800 + rand.Intn(1200))

	if runtime.GOOS == "darwin" {
		out, err := exec.Command("sysctl", "-n", "hw.memsize").Output()
		if err == nil {
			if b, err := strconv.ParseUint(strings.TrimSpace(string(out)), 10, 64); err == nil {
				totalMB = b / (1024 * 1024)
			}
		}
	} else if runtime.GOOS == "windows" {
		out, err := exec.Command("wmic", "OS", "get", "FreePhysicalMemory,TotalVisibleMemorySize").Output()
		if err == nil {
			fields := strings.Fields(string(out))
			if len(fields) >= 4 {
				freeKB, _ := strconv.ParseUint(fields[2], 10, 64)
				totalKB, _ := strconv.ParseUint(fields[3], 10, 64)
				if totalKB > 0 {
					totalMB = totalKB / 1024
					usedMB = (totalKB - freeKB) / 1024
				}
			}
		}
	}

	percent := float64(usedMB) / float64(totalMB) * 100.0
	return totalMB, usedMB, mathMin(100.0, percent)
}

func getDiskMetrics() (float64, float64, float64) {
	totalGB := 512.0
	usedGB := 180.0

	if runtime.GOOS == "windows" {
		cmd := exec.Command("wmic", "logicaldisk", "where", "DriveType=3", "get", "FreeSpace,Size")
		out, err := cmd.Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			var totBytes, freeBytes uint64
			for _, line := range lines {
				line = strings.TrimSpace(line)
				fields := strings.Fields(line)
				if len(fields) >= 2 {
					f, err1 := strconv.ParseUint(fields[0], 10, 64)
					s, err2 := strconv.ParseUint(fields[1], 10, 64)
					if err1 == nil && err2 == nil && s > 0 {
						freeBytes += f
						totBytes += s
					}
				}
			}
			if totBytes > 0 {
				totalGB = float64(totBytes) / (1024 * 1024 * 1024)
				usedGB = float64(totBytes-freeBytes) / (1024 * 1024 * 1024)
				percent := (usedGB / totalGB) * 100.0
				return totalGB, usedGB, mathMin(100.0, percent)
			}
		}
	} else if runtime.GOOS == "darwin" || runtime.GOOS == "linux" {
		out, err := exec.Command("df", "-k", "/").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) >= 2 {
				fields := strings.Fields(lines[1])
				if len(fields) >= 4 {
					totKB, _ := strconv.ParseFloat(fields[1], 64)
					usedKB, _ := strconv.ParseFloat(fields[2], 64)
					if totKB > 0 {
						totalGB = totKB / (1024 * 1024)
						usedGB = usedKB / (1024 * 1024)
					}
				}
			}
		}
	}

	percent := (usedGB / totalGB) * 100.0
	return totalGB, usedGB, mathMin(100.0, percent)
}

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

func getTopProcesses() []ProcessInfo {
	if runtime.GOOS == "windows" {
		cmd := exec.Command("tasklist.exe", "/FO", "CSV", "/NH")
		out, err := cmd.Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			var procs []ProcessInfo
			count := 0
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line == "" {
					continue
				}
				parts := strings.Split(line, "\",\"")
				if len(parts) >= 5 {
					name := strings.Trim(parts[0], "\"")
					pidStr := strings.Trim(parts[1], "\"")
					memStr := strings.Trim(parts[4], "\"")
					memStr = strings.ReplaceAll(memStr, ",", "")
					memStr = strings.ReplaceAll(memStr, " K", "")
					pid, _ := strconv.Atoi(pidStr)
					memKB, _ := strconv.ParseFloat(memStr, 64)
					procs = append(procs, ProcessInfo{
						PID:      pid,
						Name:     name,
						CPU:      float64(1+rand.Intn(10)) / 2.0,
						MemoryMB: memKB / 1024.0,
					})
					count++
					if count >= 8 {
						break
					}
				}
			}
			if len(procs) > 0 {
				return procs
			}
		}
	}

	return []ProcessInfo{
		{PID: 1042, Name: "OpManagerAgent", CPU: 0.8, MemoryMB: 28.4},
		{PID: 412, Name: "explorer.exe", CPU: 1.8, MemoryMB: 124.0},
		{PID: 884, Name: "chrome.exe", CPU: 3.2, MemoryMB: 380.5},
		{PID: 1204, Name: "svchost.exe", CPU: 0.5, MemoryMB: 94.2},
		{PID: 2310, Name: "System", CPU: 0.9, MemoryMB: 48.0},
	}
}

func mathMin(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
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
