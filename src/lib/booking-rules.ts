import type { CountryCode } from "libphonenumber-js";

export const TIMEZONE = "Africa/Casablanca";
export const CURRENCY = "MAD";
export const DEFAULT_PHONE_COUNTRY: CountryCode = "MA";
export const DEFAULT_PHONE_PREFIX = "+212";

export const SLOT_STEP_MINUTES = 15;
/** Rest kept free after every session before the next guest can start. */
export const BUFFER_MINUTES = 15;
export const MIN_LEAD_MINUTES = 120;
export const MAX_DAYS_AHEAD = 30;
/** An online booking waits this long for the customer's WhatsApp confirmation... */
export const CONFIRMATION_WINDOW_MINUTES = 120;
/** ...but never closer to the session than this; then it is cancelled and the slot is freed. */
export const CONFIRMATION_CUTOFF_BEFORE_START_MINUTES = 60;

export const CUSTOMER_NAME_MIN = 2;
export const CUSTOMER_NAME_MAX = 80;
export const NOTE_MAX = 500;
