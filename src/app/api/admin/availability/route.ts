import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getTimeGrid, parseDurationParam } from "@/server/booking/availability";
import { getDaySchedule } from "@/server/booking/schedule";
import { getDb } from "@/server/db";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
    const date = request.nextUrl.searchParams.get("date") ?? "";
    const durationMinutes = parseDurationParam(request.nextUrl.searchParams.get("duration"));
    const times = await getTimeGrid(serviceId, date, new Date(), { ignoreLeadRules: true, durationMinutes });
    const slots = times.filter((t) => t.available).map(({ time, startAt }) => ({ time, startAt }));
    const closed = times.length === 0 && (await getDaySchedule(getDb(), date)) === null;
    return jsonResponse({ date, closed, slots, times });
  } catch (error) {
    return errorResponse(error);
  }
}
