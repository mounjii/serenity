import { manualProvider, mockProvider } from "./mock-provider";
import { metaProvider } from "./meta-provider";
import type { WhatsAppProvider } from "./types";

const providers: Record<string, WhatsAppProvider> = {
  mock: mockProvider,
  manual: manualProvider,
  meta: metaProvider,
};

/** Selected with WHATSAPP_PROVIDER ("mock", "manual" or "meta"); anything else is a configuration error. */
export function getWhatsAppProvider(): WhatsAppProvider {
  const raw = process.env.WHATSAPP_PROVIDER?.trim();
  if (!raw) throw new Error('WHATSAPP_PROVIDER is not set. Supported values: "mock", "manual", "meta".');
  const provider = providers[raw.toLowerCase()];
  if (!provider) {
    throw new Error(`Unknown WHATSAPP_PROVIDER "${raw}". Supported values: ${Object.keys(providers).map((p) => `"${p}"`).join(", ")}.`);
  }
  return provider;
}

/**
 * mock: nothing is sent; the admin can simulate the client's reply.
 * manual: nothing is sent; client and admin use pre-written wa.me links from their own WhatsApp (free).
 * meta: messages go out automatically through the WhatsApp Business Cloud API (paid per message).
 */
export type WhatsAppMode = "mock" | "manual" | "meta";

export function getWhatsAppMode(): WhatsAppMode {
  const raw = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  return raw === "meta" ? "meta" : raw === "manual" ? "manual" : "mock";
}

/** In mock mode nothing reaches the customer, so the admin can simulate their reply. */
export function isMockWhatsApp(): boolean {
  return getWhatsAppMode() === "mock";
}

export type { WhatsAppMessage, WhatsAppProvider, WhatsAppTemplate } from "./types";
