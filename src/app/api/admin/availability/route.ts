import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAvailability } from "@/server/booking/availability";
import { getDaySchedule } from "@/server/booking/schedule";
import { getDb } from "@/server/db";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
    const date = request.nextUrl.searchParams.get("date") ?? "";
    const slots = await getAvailability(serviceId, date, new Date(), { ignoreLeadRules: true });
    const closed = slots.length === 0 && (await getDaySchedule(getDb(), date)) === null;
    return jsonResponse({ date, closed, slots });
  } catch (error) {
    return errorResponse(error);
  }
}
