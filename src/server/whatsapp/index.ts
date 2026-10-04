import { mockProvider } from "./mock-provider";
import type { WhatsAppProvider } from "./types";

const providers: Record<string, WhatsAppProvider> = {
  mock: mockProvider,
};

/** Selected with WHATSAPP_PROVIDER. Only "mock" exists for now; anything else is a configuration error. */
export function getWhatsAppProvider(): WhatsAppProvider {
  const raw = process.env.WHATSAPP_PROVIDER?.trim();
  if (!raw) throw new Error('WHATSAPP_PROVIDER is not set. Supported values: "mock".');
  const provider = providers[raw.toLowerCase()];
  if (!provider) {
    throw new Error(`Unknown WHATSAPP_PROVIDER "${raw}". Supported values: ${Object.keys(providers).map((p) => `"${p}"`).join(", ")}.`);
  }
  return provider;
}

export type { WhatsAppMessage, WhatsAppProvider, WhatsAppTemplate } from "./types";
