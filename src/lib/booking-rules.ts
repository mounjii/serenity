import type { CountryCode } from "libphonenumber-js";

export const TIMEZONE = "Africa/Casablanca";
export const CURRENCY = "MAD";
export const DEFAULT_PHONE_COUNTRY: CountryCode = "MA";
export const DEFAULT_PHONE_PREFIX = "+212";

/** Start times every half hour, so 90-minute sessions never leave an unbookable gap. */
export const SLOT_STEP_MINUTES = 30;
/** Minutes of each session kept for changing and resetting the room (already inside the booked duration). */
export const SETTLE_MINUTES = 10;
/** The pause between guests is part of the booked duration, so nothing extra is blocked after a session. */
export const BUFFER_MINUTES = 0;
export const MIN_LEAD_MINUTES = 120;
export const MAX_DAYS_AHEAD = 30;

export const CUSTOMER_NAME_MIN = 2;
export const CUSTOMER_NAME_MAX = 80;
export const NOTE_MAX = 500;
