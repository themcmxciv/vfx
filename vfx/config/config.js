export function configFromEnvironment() {
  return {
    provider: process.env.VFX_PROVIDER ?? "openai-compatible",
    model: process.env.VFX_MODEL,
    providers: {
      "openai-compatible": {
        baseUrl: process.env.VFX_OPENAI_BASE_URL ?? "http://127.0.0.1:11434/v1",
        model: process.env.VFX_MODEL,
      },
    },
  };
}