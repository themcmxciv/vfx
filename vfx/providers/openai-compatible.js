export class OpenAiCompatibleProvider {
  id = "openai-compatible";
  name = "OpenAI-compatible";

  constructor(options) {
    this.options = options;
  }

  async validate() {
    try {
      await this.models();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: String(error) };
    }
  }

  async models() {
    const response = await fetch(new URL("models", slash(this.options.baseUrl)), {
      headers: this.headers(),
    });
    if (!response.ok) throw new Error(`Model listing failed: HTTP ${response.status}`);
    const body = await response.json();
    return (body.data ?? []).map(({ id }) => ({ id }));
  }

  async *stream(request, signal) {
    const response = await fetch(new URL("chat/completions", slash(this.options.baseUrl)), {
      method: "POST",
      headers: { ...this.headers(), "content-type": "application/json" },
      signal,
      body: JSON.stringify({ ...request, model: request.model || this.options.model, stream: true }),
    });
    if (!response.ok || !response.body) throw new Error(`Chat request failed: HTTP ${response.status}`);
    for await (const chunk of response.body.pipeThrough(new TextDecoderStream())) {
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          yield { type: "delta", data: JSON.parse(line.slice(6)) };
        }
      }
    }
  }

  headers() {
    return this.options.apiKey ? { authorization: `Bearer ${this.options.apiKey}` } : {};
  }
}

function slash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}