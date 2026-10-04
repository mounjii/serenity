import { createBooking } from "@/server/booking/create-booking";
import { errorResponse, jsonResponse, readJsonBody } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const result = await createBooking(body, { source: "ONLINE" });
    const { booking } = result;
    return jsonResponse(
      {
        id: booking.id,
        serviceName: booking.serviceName,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        priceCents: booking.priceCents,
      },
      result.kind === "existing" ? 200 : 201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
