//go:build !windows

package main

import "errors"

// isWindowsService is always false off Windows: there is no Service
// Control Manager, so the agent always runs its console / daemon loop.
func isWindowsService() bool {
	return false
}

// runAsWindowsService is unreachable off Windows (main() only calls it
// when isWindowsService() is true); it exists so main.go compiles on
// every platform.
func runAsWindowsService(cfg AgentConfig) error {
	return errors.New("Windows services are not supported on this platform")
}
