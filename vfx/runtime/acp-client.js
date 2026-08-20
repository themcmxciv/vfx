import { FxProcess } from "./fx-process.js";

export class AcpClient {
  #pending = new Map();
  #nextId = 1;
  #events = new Set();

  constructor(process) {
    this.process = process;
    void this.read();
  }

  static async start(enginePath) {
    const client = new AcpClient(new FxProcess(enginePath));
    await client.request("initialize", { protocolVersion: 1, clientCapabilities: {} });
    return client;
  }

  onEvent(listener) {
    this.#events.add(listener);
    return () => this.#events.delete(listener);
  }

  request(method, params = {}) {
    const id = this.#nextId++;
    const message = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.process.child.stdin.write(message, (error) => {
        if (!error) return;
        this.#pending.delete(id);
        reject(error);
      });
    });
  }

  sessionNew(params = {}) {
    return this.request("session/new", params);
  }

  sessionLoad(sessionId) {
    return this.request("session/load", { sessionId });
  }

  sessionPrompt(sessionId, text) {
    return this.request("session/prompt", {
      sessionId,
      prompt: [{ type: "text", text }],
    });
  }

  sessionCancel(sessionId) {
    return this.request("session/cancel", { sessionId });
  }

  async close() {
    for (const pending of this.#pending.values()) pending.reject(new Error("ACP client closed"));
    this.#pending.clear();
    this.process.child.stdin.end();
    await this.process.close();
  }

  async read() {
    let buffered = "";
    try {
      for await (const chunk of this.process.child.stdout) {
        buffered += chunk.toString();
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";
        for (const line of lines) this.dispatch(line);
      }
    } finally {
      const detail = await this.process.stderr;
      for (const pending of this.#pending.values()) {
        pending.reject(new Error(detail || "FX ACP process exited"));
      }
      this.#pending.clear();
    }
  }

  dispatch(line) {
    if (!line.trim()) return;
    const message = JSON.parse(line);
    if (typeof message.id === "number") {
      const pending = this.#pending.get(message.id);
      if (!pending) return;
      this.#pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    if (message.method) {
      for (const listener of this.#events) listener({ method: message.method, params: message.params });
    }
  }
}