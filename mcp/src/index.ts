#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerHaTools } from "./tools/ha.js";
import { registerOmarchyTools } from "./tools/omarchy.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "hearth",
    version: "0.1.0",
  });

  registerHaTools(server);
  registerOmarchyTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});

