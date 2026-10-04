export type WhatsAppTemplate = "booking_confirmed_customer" | "booking_new_owner" | "booking_cancelled_customer";

export type WhatsAppRecipient = "CUSTOMER" | "OWNER";

/** Rendered message. `params` maps 1:1 to the variables of the matching Meta-approved template. */
export type WhatsAppMessage = {
  bookingId: string;
  recipient: WhatsAppRecipient;
  /** E.164, e.g. +212612345678 */
  to: string;
  template: WhatsAppTemplate;
  params: Record<string, string>;
  text: string;
};

export type SendResult = { providerMessageId: string };

/**
 * A provider delivers one message and records it in NotificationLog with status SENT.
 * It throws on failure; the caller then records the attempt as FAILED.
 * A future Meta Cloud API provider (META_WA_TOKEN, META_WA_PHONE_NUMBER_ID) implements the same interface.
 */
export interface WhatsAppProvider {
  readonly name: string;
  send(message: WhatsAppMessage): Promise<SendResult>;
}
