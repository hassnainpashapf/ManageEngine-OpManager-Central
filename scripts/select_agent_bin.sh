#!/bin/sh
# select_agent_bin — print the host-monitoring agent binary path for this host.
#
# The agent is a native Go binary; the wrong platform build cannot run:
#   Darwin arm64  -> agent_dist/macos/OpManagerAgent-arm64 (Mach-O arm64)
#   Darwin x86_64 -> agent_dist/macos/OpManagerAgent-amd64 (Mach-O x86_64)
#   Linux (any)   -> agent_src/OpManagerAgent (ELF)
#   anything else -> agent_src/OpManagerAgent (Linux ELF fallback)
#
# Sourced (not executed) by the start scripts so both pick the same binary
# from one place. Paths are relative to the repository root; callers cd there
# before sourcing, or resolve against their own ROOT_DIR/DIR.
select_agent_bin() {
  case "$(uname -s)" in
    Darwin)
      case "$(uname -m)" in
        arm64)  printf '%s\n' "./agent_dist/macos/OpManagerAgent-arm64" ;;
        x86_64) printf '%s\n' "./agent_dist/macos/OpManagerAgent-amd64" ;;
        *)      printf '%s\n' "./agent_dist/macos/OpManagerAgent-arm64" ;;
      esac
      ;;
    *)
      printf '%s\n' "./agent_src/OpManagerAgent"
      ;;
  esac
}
