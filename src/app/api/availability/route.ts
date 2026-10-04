import type { NextRequest } from "next/server";
import { getAvailability, parseDurationParam } from "@/server/booking/availability";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const serviceId = params.get("serviceId") ?? "";
    const date = params.get("date") ?? "";
    const durationMinutes = parseDurationParam(params.get("duration"));
    const slots = await getAvailability(serviceId, date, new Date(), { durationMinutes });
    return jsonResponse({ date, slots });
  } catch (error) {
    return errorResponse(error);
  }
}
