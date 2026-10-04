import { z } from "zod";

export type ErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "SLOT_TAKEN"
  | "SERVICE_UNAVAILABLE"
  | "CLOSED"
  | "OUTSIDE_OPENING_HOURS"
  | "INVALID_SLOT"
  | "TOO_SOON"
  | "TOO_FAR"
  | "NO_THERAPIST"
  | "CANNOT_CANCEL"
  | "CANNOT_COMPLETE"
  | "DAY_HAS_BOOKINGS"
  | "ALREADY_CLOSED"
  | "SERVER_BUSY"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const invalidInput = (message: string, fields?: Record<string, string>) =>
  new AppError(400, "INVALID_INPUT", message, fields);
export const notFound = (message = "Not found.") => new AppError(404, "NOT_FOUND", message);
export const unauthorized = () => new AppError(401, "UNAUTHORIZED", "You must be signed in.");
export const businessRule = (code: ErrorCode, message: string) => new AppError(422, code, message);

/** First message per field, keyed by the top-level field name. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export type ApiErrorBody = {
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
};

const NO_STORE = { "Cache-Control": "no-store" };

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: NO_STORE });
}

/** Turns any thrown value into the uniform API error format. Internal details are only logged. */
export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) },
    };
    return jsonResponse(body, error.status);
  }
  if (error instanceof z.ZodError) {
    const body: ApiErrorBody = {
      error: { code: "INVALID_INPUT", message: "Some fields are invalid.", fields: zodFieldErrors(error) },
    };
    return jsonResponse(body, 400);
  }
  console.error("[api] unexpected error", error);
  const body: ApiErrorBody = {
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  };
  return jsonResponse(body, 500);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw invalidInput("The request body must be valid JSON.");
  }
}
