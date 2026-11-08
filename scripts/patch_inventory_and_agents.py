import os

# -------------------------------------------------------------
# 1. Update 05_views_config_reports_settings.js with Live Agents Table
# -------------------------------------------------------------
path_05 = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/05_views_config_reports_settings.js'
with open(path_05, 'r', encoding='utf-8') as f:
    code_05 = f.read()

# Locate the Agents subtab section
old_agents_section = """            <!-- Enrollment Token -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Agent Enrollment Authentication Token</div>
              <div style="display: flex; gap: 10px;">
                <input type="text" value="OPM-CENTRAL-AUTH-TOKEN-9281-GA-129203" readonly style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 12px; background: #fff;">
                <button id="opm-copy-token-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Copy Token</button>
              </div>
            </div>
          </div>"""

new_agents_section = """            <!-- Enrollment Token -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Agent Enrollment Authentication Token (Mutual TLS / HMAC-SHA256)</div>
              <div style="display: flex; gap: 10px;">
                <input type="text" id="opm-enrollment-token-input" value="OPM-CENTRAL-AUTH-TOKEN-9281-GA-129203" readonly style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 12px; background: #fff;">
                <button id="opm-copy-token-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Copy Token</button>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">One-Line Shell Quick Deployment: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">curl -sSL http://localhost:8060/downloads/install.sh | bash</code></div>
            </div>

            <!-- Connected Monitoring Agents Table -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #ffffff;">
              <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Connected Monitoring Agents (Live Heartbeats)</span>
                  <span style="font-size: 11px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 3px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #16a34a; display: inline-block;"></span>
                    1 Agent Active
                  </span>
                </div>
                <div style="font-size: 11px; color: #64748b;">Heartbeat interval: 5 seconds</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">Agent ID</th>
                    <th style="padding: 10px 14px;">Hostname / OS</th>
                    <th style="padding: 10px 14px;">Platform Architecture</th>
                    <th style="padding: 10px 14px;">Assigned Probe</th>
                    <th style="padding: 10px 14px;">CPU / RAM</th>
                    <th style="padding: 10px 14px;">Status</th>
                    <th style="padding: 10px 14px; text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0f172a;">AGT-DARWIN-1-D52F</td>
                    <td style="padding: 10px 14px;">
                      <div style="font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 6px;">
                        Hussnains-MacBook-Air.local
                        <span style="font-size: 9px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 2px; border: 1px solid #cbd5e1;">MACOS HOST</span>
                      </div>
                      <div style="font-size: 11px; color: #64748b;">OpManager Universal Agent v12.9.203</div>
                    </td>
                    <td style="padding: 10px 14px; font-family: monospace; font-size: 11px; color: #334155;">darwin (arm64 / Apple Silicon)</td>
                    <td style="padding: 10px 14px;">
                      <span style="font-size: 11px; color: #0284c7; background: #f0f9ff; padding: 2px 6px; border-radius: 3px; font-weight: 600;">
                        New York Data Center (Probe 1)
                      </span>
                    </td>
                    <td style="padding: 10px 14px;">
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 11px; font-weight: 700; color: #dc2626;">CPU: 90.0% (18 Cores)</span>
                        <span style="font-size: 11px; color: #475569;">RAM: 97.5% (16 GB)</span>
                      </div>
                    </td>
                    <td style="padding: 10px 14px;">
                      <span style="display: inline-flex; align-items: center; gap: 5px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 3px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
                        Online (2s ago)
                      </span>
                    </td>
                    <td style="padding: 10px 14px; text-align: right;">
                      <button id="opm-agent-test-telemetry-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                        Poll Metrics
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>"""

if old_agents_section in code_05:
    code_05 = code_05.replace(old_agents_section, new_agents_section)
    with open(path_05, 'w', encoding='utf-8') as f:
        f.write(code_05)
    print("✓ Successfully injected Connected Monitoring Agents table into 05_views_config_reports_settings.js")
else:
    print("Warning: old_agents_section not found in 05 module")
