import type { NextRequest } from "next/server";
import { getAvailability } from "@/server/booking/availability";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
    const date = request.nextUrl.searchParams.get("date") ?? "";
    const slots = await getAvailability(serviceId, date);
    return jsonResponse({ date, slots });
  } catch (error) {
    return errorResponse(error);
  }
}
