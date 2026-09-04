import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function requireHaConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.HA_URL?.replace(/\/+$/, "");
  const token = process.env.HA_TOKEN;
  if (!baseUrl || !token) {
    throw new Error(
      "Home Assistant is not configured. Set HA_URL and HA_TOKEN in the environment (token is never logged)."
    );
  }
  return { baseUrl, token };
}

async function haFetch(path: string, init?: RequestInit): Promise<unknown> {
  const { baseUrl, token } = requireHaConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Home Assistant HTTP ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function registerHaTools(server: McpServer): void {
  server.tool(
    "ha_list_entities",
    "List Home Assistant states (entity_id, state, and key attributes). Requires HA_URL and HA_TOKEN.",
    {
      domain: z
        .string()
        .optional()
        .describe("Optional domain filter, e.g. light, sensor, binary_sensor"),
    },
    async ({ domain }) => {
      try {
        const states = (await haFetch("/api/states")) as Array<{
          entity_id: string;
          state: string;
          attributes?: Record<string, unknown>;
        }>;
        const filtered = domain
          ? states.filter((s) => s.entity_id.startsWith(`${domain}.`))
          : states;
        const slim = filtered.map((s) => ({
          entity_id: s.entity_id,
          state: s.state,
          friendly_name: s.attributes?.friendly_name,
        }));
        return {
          content: [{ type: "text" as const, text: JSON.stringify(slim, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: message }], isError: true };
      }
    }
  );

  server.tool(
    "ha_get_state",
    "Get a single Home Assistant entity state. Requires HA_URL and HA_TOKEN.",
    {
      entity_id: z.string().describe("Entity id, e.g. light.kitchen"),
    },
    async ({ entity_id }) => {
      try {
        const state = await haFetch(`/api/states/${encodeURIComponent(entity_id)}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(state, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: message }], isError: true };
      }
    }
  );

  server.tool(
    "ha_call_service",
    "Call a Home Assistant service. Confirm with the user before locks, covers, garage, or alarms. Requires HA_URL and HA_TOKEN.",
    {
      domain: z.string().describe("Service domain, e.g. light"),
      service: z.string().describe("Service name, e.g. turn_on"),
      entity_id: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .describe("Optional entity_id or list"),
      data: z
        .record(z.unknown())
        .optional()
        .describe("Additional service data fields"),
    },
    async ({ domain, service, entity_id, data }) => {
      try {
        const body: Record<string, unknown> = { ...(data ?? {}) };
        if (entity_id !== undefined) body.entity_id = entity_id;
        const result = await haFetch(`/api/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return {
          content: [{
            type: "text" as const,
            text: result == null ? "OK (no content)" : JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: message }], isError: true };
      }
    }
  );
}
