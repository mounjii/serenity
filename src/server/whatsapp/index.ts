import { metaProvider } from "./meta-provider";
import { mockProvider } from "./mock-provider";
import type { WhatsAppProvider } from "./types";

const providers: Record<string, WhatsAppProvider> = {
  mock: mockProvider,
  meta: metaProvider,
};

/** Selected with WHATSAPP_PROVIDER ("mock" or "meta"); anything else is a configuration error. */
export function getWhatsAppProvider(): WhatsAppProvider {
  const raw = process.env.WHATSAPP_PROVIDER?.trim();
  if (!raw) throw new Error('WHATSAPP_PROVIDER is not set. Supported values: "mock", "meta".');
  const provider = providers[raw.toLowerCase()];
  if (!provider) {
    throw new Error(`Unknown WHATSAPP_PROVIDER "${raw}". Supported values: ${Object.keys(providers).map((p) => `"${p}"`).join(", ")}.`);
  }
  return provider;
}

/** In mock mode nothing reaches the customer, so the admin can simulate their reply. */
export function isMockWhatsApp(): boolean {
  return (process.env.WHATSAPP_PROVIDER?.trim().toLowerCase() ?? "") === "mock";
}

export type { WhatsAppMessage, WhatsAppProvider, WhatsAppTemplate } from "./types";
