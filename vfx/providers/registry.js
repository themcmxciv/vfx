export class ProviderRegistry {
  #providers = new Map();

  add(provider) {
    this.#providers.set(provider.id, provider);
  }

  get(id) {
    const provider = this.#providers.get(id);
    if (!provider) throw new Error(`Unknown provider: ${id}`);
    return provider;
  }

  list() {
    return [...this.#providers.values()];
  }
}