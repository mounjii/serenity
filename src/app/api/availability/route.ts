import type { NextRequest } from "next/server";
import { getTimeGrid, parseDurationParam } from "@/server/booking/availability";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    await sweepExpiredBookings();
    const params = request.nextUrl.searchParams;
    const serviceId = params.get("serviceId") ?? "";
    const date = params.get("date") ?? "";
    const durationMinutes = parseDurationParam(params.get("duration"));
    const times = await getTimeGrid(serviceId, date, new Date(), { durationMinutes });
    const slots = times.filter((t) => t.available).map(({ time, startAt }) => ({ time, startAt }));
    return jsonResponse({ date, slots, times });
  } catch (error) {
    return errorResponse(error);
  }
}
