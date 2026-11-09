package main

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

// ---------------------------------------------------------------------------
// Bug (a): sc.exe create argv
// ---------------------------------------------------------------------------

func TestScCreateArgs_NoSpacesInExePath(t *testing.T) {
	cfg := AgentConfig{
		ServerURL:    "http://192.168.30.65:8060",
		ProbeID:      "101",
		AuthKey:      "test-key-123",
		PollInterval: 5,
	}
	got := scCreateArgs(`C:\OpManagerAgent\OpManagerAgent.exe`, serviceArgs(cfg))
	want := []string{
		"create", "OpManagerCentralAgent",
		// "binPath=" and its value are SEPARATE argv elements: sc.exe
		// requires a space after `=` and parses the value as the next
		// token. The old code merged them into one element
		// ("binPath= \"C:\...\" ..."), which Go quoted as a single blob
		// and sc.exe rejected with exit 1639 ("Invalid start=").
		"binPath=", `C:\OpManagerAgent\OpManagerAgent.exe -server http://192.168.30.65:8060 -probe 101 -key test-key-123 -interval 5`,
		"start=", "auto",
		"DisplayName=", "ManageEngine OpManager Central Agent",
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("scCreateArgs =\n%#v\nwant\n%#v", got, want)
	}
	// Regression guard: no element may contain a "name= value" pair.
	for _, a := range got {
		if strings.HasPrefix(a, "binPath= ") || strings.HasPrefix(a, "start= ") || strings.HasPrefix(a, "DisplayName= ") {
			t.Fatalf("argv element still merges parameter and value: %q", a)
		}
	}
}

func TestScCreateArgs_SpacedExePath(t *testing.T) {
	cfg := AgentConfig{
		ServerURL:    "http://192.168.30.65:8060",
		ProbeID:      "101",
		AuthKey:      "test-key-123",
		PollInterval: 5,
	}
	got := scCreateArgs(`C:\Program Files\OpManagerAgent\OpManagerAgent.exe`, serviceArgs(cfg))
	wantBinPath := `"C:\Program Files\OpManagerAgent\OpManagerAgent.exe" -server http://192.168.30.65:8060 -probe 101 -key test-key-123 -interval 5`
	if len(got) != 8 || got[2] != "binPath=" || got[3] != wantBinPath {
		t.Fatalf("scCreateArgs (spaced path) =\n%#v\nwant binPath value %q", got, wantBinPath)
	}
}

func TestScBinPath_QuotesOnlyWhenNeeded(t *testing.T) {
	if got := scBinPath(`C:\OpManagerAgent\OpManagerAgent.exe`, []string{"-server", "http://x:8060"}); got != `C:\OpManagerAgent\OpManagerAgent.exe -server http://x:8060` {
		t.Fatalf("scBinPath bare = %q", got)
	}
	// A value with a space (e.g. a display name / path) must be quoted.
	if got := scBinPath(`C:\a\b.exe`, []string{"-name", "My Host"}); got != `C:\a\b.exe -name "My Host"` {
		t.Fatalf("scBinPath spaced arg = %q", got)
	}
}

func TestQuoteCmdArg(t *testing.T) {
	cases := []struct{ in, want string }{
		{`C:\OpManagerAgent\OpManagerAgent.exe`, `C:\OpManagerAgent\OpManagerAgent.exe`},
		{`C:\Program Files\app.exe`, `"C:\Program Files\app.exe"`},
		{``, `""`},
		{`a"b`, `"a\"b"`},
		{`C:\path with\`, `"C:\path with\\"`},
	}
	for _, c := range cases {
		if got := quoteCmdArg(c.in); got != c.want {
			t.Errorf("quoteCmdArg(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

// chdir changes the working directory for the duration of the test
// (t.Chdir needs Go 1.24; this agent builds with Go 1.22).
func chdir(t *testing.T, dir string) {
	t.Helper()
	old, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(old) })
}

// ---------------------------------------------------------------------------
// Bug (c): config / agent.id resolution must not depend on the CWD
// ---------------------------------------------------------------------------

func TestLoadConfigFromDir_IgnoresCWD(t *testing.T) {
	execDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(execDir, "agent.conf"), []byte(
		"SERVER_URL=http://10.0.0.9:8060\nPROBE_ID=777\nAUTH_KEY=exec-dir-key\nPOLL_INTERVAL=7\nCUSTOM_NAME=ExecDirHost\n"), 0600); err != nil {
		t.Fatal(err)
	}

	// A decoy agent.conf in the working directory with DIFFERENT values:
	// the old code read "agent.conf" (CWD) first and would have used this.
	cwd := t.TempDir()
	if err := os.WriteFile(filepath.Join(cwd, "agent.conf"), []byte(
		"SERVER_URL=http://192.0.2.1:8060\nPROBE_ID=999\nAUTH_KEY=decoy-key\nPOLL_INTERVAL=99\n"), 0600); err != nil {
		t.Fatal(err)
	}
	chdir(t, cwd)

	// Env must not leak in either (file wins over env by design).
	t.Setenv("SERVER_URL", "http://192.0.2.2:8060")
	t.Setenv("AUTH_KEY", "env-key")

	cfg := loadConfigFromDir(execDir)
	if cfg.ServerURL != "http://10.0.0.9:8060" {
		t.Errorf("ServerURL = %q, want exec-dir value", cfg.ServerURL)
	}
	if cfg.ProbeID != "777" {
		t.Errorf("ProbeID = %q, want 777", cfg.ProbeID)
	}
	if cfg.AuthKey != "exec-dir-key" {
		t.Errorf("AuthKey = %q, want exec-dir value (CWD decoy / env must not win)", cfg.AuthKey)
	}
	if cfg.PollInterval != 7 {
		t.Errorf("PollInterval = %d, want 7", cfg.PollInterval)
	}
	if cfg.CustomName != "ExecDirHost" {
		t.Errorf("CustomName = %q, want ExecDirHost", cfg.CustomName)
	}
}

func TestLoadConfigFromDir_NoFileFallsBackToEnv(t *testing.T) {
	execDir := t.TempDir()
	chdir(t, t.TempDir())
	t.Setenv("SERVER_URL", "http://10.1.2.3:8060")
	t.Setenv("PROBE_ID", "4242")
	t.Setenv("AUTH_KEY", "env-only-key")
	t.Setenv("POLL_INTERVAL", "11")

	cfg := loadConfigFromDir(execDir)
	if cfg.ServerURL != "http://10.1.2.3:8060" || cfg.ProbeID != "4242" || cfg.AuthKey != "env-only-key" || cfg.PollInterval != 11 {
		t.Errorf("env fallback config = %+v", cfg)
	}
}

func TestLoadOrCreateAgentIDIn_StableAcrossCWD(t *testing.T) {
	execDir := t.TempDir()
	id1 := loadOrCreateAgentIDIn(execDir)
	if id1 == "" || !strings.HasPrefix(id1, "AGT-") {
		t.Fatalf("first ID = %q", id1)
	}
	if _, err := os.Stat(filepath.Join(execDir, "agent.id")); err != nil {
		t.Fatalf("agent.id was not created next to the executable dir: %v", err)
	}

	// From a different CWD, the same exec dir must yield the same ID —
	// and no agent.id may appear in the CWD.
	cwd := t.TempDir()
	chdir(t, cwd)
	id2 := loadOrCreateAgentIDIn(execDir)
	if id2 != id1 {
		t.Fatalf("second ID = %q, want %q", id2, id1)
	}
	if _, err := os.Stat(filepath.Join(cwd, "agent.id")); !os.IsNotExist(err) {
		t.Fatalf("agent.id leaked into the working directory")
	}
}

func TestLogFilePath_IsExecDirBased(t *testing.T) {
	if got := logFilePath(`/opt/opmanager`); got != `/opt/opmanager/agent.log` {
		t.Fatalf("logFilePath = %q", got)
	}
}
