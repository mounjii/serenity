import { getActiveServices } from "@/server/booking/services";
import { errorResponse, jsonResponse } from "@/server/errors";

export async function GET() {
  try {
    return jsonResponse({ services: await getActiveServices() });
  } catch (error) {
    return errorResponse(error);
  }
}
