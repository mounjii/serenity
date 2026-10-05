import type { NextRequest } from "next/server";
import { listBookingChanges } from "@/server/admin/changes";
import { requireAdmin } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { errorResponse, invalidInput, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await sweepExpiredBookings();
    const raw = request.nextUrl.searchParams.get("since");
    const since = raw ? new Date(raw) : null;
    if (!since || Number.isNaN(since.getTime())) throw invalidInput("since must be an ISO date-time.");
    return jsonResponse(await listBookingChanges(since));
  } catch (error) {
    return errorResponse(error);
  }
}
