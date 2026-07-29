let provider = null;

export function setProvider(p) { provider = p; }

export function getData() {
  if (!provider) throw new Error("Data provider not initialized. Call setProvider() first.");
  return provider;
}
