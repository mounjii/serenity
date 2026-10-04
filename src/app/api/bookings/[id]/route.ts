import type { NextRequest } from "next/server";
import { getPublicBooking } from "@/server/booking/public-booking";
import { errorResponse, jsonResponse, notFound } from "@/server/errors";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  try {
    const { id } = await ctx.params;
    const booking = await getPublicBooking(id);
    if (!booking) throw notFound("Reservation not found.");
    return jsonResponse({ booking });
  } catch (error) {
    return errorResponse(error);
  }
}
