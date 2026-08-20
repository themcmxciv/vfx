export async function createSession(client, onEvent) {
  if (onEvent) client.onEvent(onEvent);
  const result = await client.sessionNew();
  return {
    id: result.sessionId,
    async prompt(text) {
      await client.sessionPrompt(result.sessionId, text);
    },
    async cancel() {
      await client.sessionCancel(result.sessionId);
    },
    async close() {
      await client.close();
    },
  };
}