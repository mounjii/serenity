export type WhatsAppTemplate =
  | "booking_request_customer"
  | "booking_confirmed_customer"
  | "booking_cancelled_customer"
  | "booking_expired_customer"
  | "booking_new_owner"
  | "booking_confirmed_owner"
  | "booking_cancelled_owner";

export type WhatsAppRecipient = "CUSTOMER" | "OWNER";

/** Quick-reply button. `payload` comes back in the webhook when the customer taps it. */
export type WhatsAppButton = { payload: string; title: string };

/**
 * Rendered message. `params` maps 1:1, in order, to the body variables of the matching Meta-approved
 * template; `buttons` map, in order, to its quick-reply buttons.
 */
export type WhatsAppMessage = {
  bookingId: string;
  recipient: WhatsAppRecipient;
  /** E.164, e.g. +212612345678 */
  to: string;
  template: WhatsAppTemplate;
  params: Record<string, string>;
  text: string;
  buttons?: WhatsAppButton[];
};

export type SendResult = { providerMessageId: string };

/**
 * A provider delivers one message and records it in NotificationLog with status SENT.
 * It throws on failure; the caller then records the attempt as FAILED.
 */
export interface WhatsAppProvider {
  readonly name: string;
  send(message: WhatsAppMessage): Promise<SendResult>;
}
