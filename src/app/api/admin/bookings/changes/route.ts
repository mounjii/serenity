import type { NextRequest } from "next/server";
import { listBookingChanges } from "@/server/admin/changes";
import { getAdminAccess } from "@/server/auth/access";
import { requireAdmin } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { businessRule, errorResponse, invalidInput, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const access = await getAdminAccess(session.username);
    if (!access.owner && !access.areas.includes("bookings") && !access.areas.includes("dashboard")) {
      throw businessRule("INVALID_INPUT", "You do not have access to this.");
    }
    await sweepExpiredBookings();
    const raw = request.nextUrl.searchParams.get("since");
    const since = raw ? new Date(raw) : null;
    if (!since || Number.isNaN(since.getTime())) throw invalidInput("since must be an ISO date-time.");
    return jsonResponse(await listBookingChanges(since));
  } catch (error) {
    return errorResponse(error);
  }
}
