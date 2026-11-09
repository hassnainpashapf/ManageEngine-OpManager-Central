//go:build windows

package main

import (
	"fmt"
	"sync"

	"golang.org/x/sys/windows/svc"
)

// Bug (b): the agent previously had NO Windows service handler — it did
// not import golang.org/x/sys/windows/svc and never called
// svc.Run, so a service created for it (manually, or by -install)
// failed with error 1053 (service did not respond to the start or
// control request). This file is the service handler: when the Service
// Control Manager (SCM) starts the process, main() detects it via
// isWindowsService() and runs the agent loop under svc.Run, reporting
// StartPending / Running / StopPending and honouring Stop/Shutdown.
//
// Console / scheduled-task runs are unaffected: svc.IsWindowsService
// returns false when the process was not started by SCM, and main()
// runs the normal console loop instead.

// serviceName is the SCM service name, unchanged from the -install
// registration so existing installs keep working.
const serviceName = "OpManagerCentralAgent"

// isWindowsService reports whether this process was started by the
// Service Control Manager as a service.
func isWindowsService() bool {
	isService, err := svc.IsWindowsService()
	if err != nil {
		return false
	}
	return isService
}

// agentService implements svc.Handler: it runs the telemetry loop and
// stops it cleanly when SCM asks.
type agentService struct {
	cfg  AgentConfig
	once sync.Once
	stop chan struct{}
	done chan struct{}
}

func (s *agentService) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (svcSpecificEC bool, exitCode uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}
	s.stop = make(chan struct{})
	s.done = make(chan struct{})
	stopped := false
	go func() {
		runAgentLoop(s.cfg, s.stop)
		close(s.done)
	}()
	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}
	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				changes <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				changes <- svc.Status{State: svc.StopPending}
				s.once.Do(func() { close(s.stop) })
				<-s.done
				stopped = true
				return false, 0
			default:
				// Unknown control request: ignore it.
			}
		case <-s.done:
			// The agent loop exited on its own (it only does so on a
			// fatal error) — report that as a service-specific failure
			// so SCM does not treat a crash as a clean stop.
			if !stopped {
				return true, 1
			}
			return false, 0
		}
	}
}

// runAsWindowsService runs the agent as a Windows service under the SCM.
// It blocks until the service is stopped and returns nil on a clean stop.
func runAsWindowsService(cfg AgentConfig) error {
	if err := svc.Run(serviceName, &agentService{cfg: cfg}); err != nil {
		return fmt.Errorf("service %q failed: %w", serviceName, err)
	}
	return nil
}
