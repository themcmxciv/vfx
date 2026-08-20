import { AcpClient } from "../runtime/acp-client.js";
import { createSession } from "../runtime/session.js";
import { configFromEnvironment } from "../config/config.js";
import { OpenAiCompatibleProvider } from "../providers/openai-compatible.js";
import { ProviderRegistry } from "../providers/registry.js";
import { FX_UPSTREAM_SHA, PROTOCOL_VERSION, VFX_VERSION } from "../version.js";

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "help") usage();
else if (command === "--version") version();
else if (command === "login") {
  console.log("VFX does not require a Vercel account.\n\nConfigure a model provider with environment variables.");
} else if (command === "provider" && args[0] === "list") providerList();
else if (command === "doctor") await doctor();
else if (command === "ask") await ask(args.join(" "));
else usage(1);

function usage(code = 0) {
  console[code ? "error" : "log"]("Usage: vfx <ask|provider list|doctor|--version>");
  process.exit(code);
}

function version() {
  console.log(`VFX ${VFX_VERSION}\nFX Engine local\nFX Upstream ${FX_UPSTREAM_SHA.slice(0, 7)}\nProtocol ${PROTOCOL_VERSION}`);
}

function registry() {
  const config = configFromEnvironment();
  const providers = new ProviderRegistry();
  const settings = config.providers["openai-compatible"];
  providers.add(new OpenAiCompatibleProvider({
    baseUrl: settings.baseUrl,
    model: settings.model ?? "",
    apiKey: process.env.OPENAI_API_KEY,
  }));
  return { config, providers };
}

function providerList() {
  for (const provider of registry().providers.list()) console.log(`${provider.id}\t${provider.name}`);
}

async function doctor() {
  const { config, providers } = registry();
  const provider = providers.get(config.provider);
  const status = await provider.validate();
  console.log(`VFX ${VFX_VERSION}\nFX Upstream ${FX_UPSTREAM_SHA.slice(0, 7)}\nProvider ${provider.id}: ${status.ok ? "OK" : status.message ?? "unavailable"}`);
}

async function ask(text) {
  if (!text) usage(1);
  const client = await AcpClient.start();
  const session = await createSession(client, (event) => {
    if (event.method === "session/update") process.stdout.write(`${JSON.stringify(event.params)}\n`);
  });
  try {
    await session.prompt(text);
  } finally {
    await session.close();
  }
}