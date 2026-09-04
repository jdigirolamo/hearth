import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const HYPRCTL_ALLOW = new Set([
  "version",
  "workspaces",
  "clients",
  "activewindow",
  "monitors",
]);

const OMARCHY_BINARIES = [
  "hyprctl",
  "playerctl",
  "brightnessctl",
  "omarchy-launch",
];

async function which(bin: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("which", [bin]);
    const path = stdout.trim();
    return path || null;
  } catch {
    return null;
  }
}

async function ensureHyprctl(): Promise<string> {
  const path = await which("hyprctl");
  if (!path) {
    throw new Error(
      "Not on Omarchy (or Hyprland tools missing): hyprctl not found on PATH."
    );
  }
  return path;
}

export function registerOmarchyTools(server: McpServer): void {
  server.tool(
    "omarchy_hyprctl",
    "Run an allowlisted hyprctl query (version, workspaces, clients, activewindow, monitors). Lock requires confirm=true.",
    {
      command: z
        .string()
        .describe("Allowlisted hyprctl subcommand, e.g. workspaces"),
      confirm: z
        .boolean()
        .optional()
        .describe("Required true to run lock (not otherwise allowlisted)"),
    },
    async ({ command, confirm }) => {
      try {
        const cmd = command.trim();
        if (cmd === "lock" || cmd.startsWith("lock ")) {
          if (!confirm) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Refusing to lock without confirm=true. Session lock can disrupt the user.",
                },
              ],
              isError: true,
            };
          }
        } else if (!HYPRCTL_ALLOW.has(cmd)) {
          return {
            content: [
              {
                type: "text" as const,
                text:
                  "Command not allowlisted. Allowed: " +
                  [...HYPRCTL_ALLOW].join(", ") +
                  ". Lock requires confirm=true.",
              },
            ],
            isError: true,
          };
        }

        const hyprctl = await ensureHyprctl();
        const args = cmd === "lock" || cmd.startsWith("lock ") ? ["dispatch", "exec", "hyprlock"] : ["-j", cmd];
        const { stdout, stderr } = await execFileAsync(hyprctl, args, {
          timeout: 10_000,
          maxBuffer: 2 * 1024 * 1024,
        });
        const text = (stdout || stderr || "(no output)").trim();
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: message }], isError: true };
      }
    }
  );

  server.tool(
    "omarchy_system",
    "Report Omarchy/Hyprland host info or check whether expected binaries exist on PATH.",
    {
      action: z.enum(["info", "check"]).describe("info = summary; check = binary presence"),
    },
    async ({ action }) => {
      try {
        const found: Record<string, string | null> = {};
        for (const bin of OMARCHY_BINARIES) {
          found[bin] = await which(bin);
        }
        const onOmarchy = Boolean(found.hyprctl);
        if (!onOmarchy) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Not on Omarchy: hyprctl missing. Binary check: " + JSON.stringify(found, null, 2),
              },
            ],
            isError: true,
          };
        }

        if (action === "check") {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ onOmarchy, binaries: found }, null, 2) }],
          };
        }

        let version = "";
        try {
          const hyprctl = found.hyprctl as string;
          const { stdout } = await execFileAsync(hyprctl, ["version"], { timeout: 5000 });
          version = stdout.trim();
        } catch (err) {
          version = err instanceof Error ? err.message : String(err);
        }

        const payload = {
          onOmarchy: true,
          hyprctl_version: version,
          binaries: found,
          note: "Hearth MCP queries only; no desktop daemon in this slice.",
        };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: message }], isError: true };
      }
    }
  );
}

