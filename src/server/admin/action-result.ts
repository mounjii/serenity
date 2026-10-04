import { requireAdmin } from "@/server/auth/session";
import { describeError, type ApiErrorBody } from "@/server/errors";
import type { AdminBooking } from "./bookings";
import { DayHasBookingsError } from "./closed-days";

export type ActionError = ApiErrorBody["error"] & { status: number; bookings?: AdminBooking[] };
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

/** Re-checks the admin session (401 otherwise) and returns errors in the uniform format instead of throwing. */
export async function adminAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    return { ok: true, data: await fn() };
  } catch (error) {
    const { status, body } = describeError(error);
    return {
      ok: false,
      error: { ...body.error, status, ...(error instanceof DayHasBookingsError ? { bookings: error.bookings } : {}) },
    };
  }
}
