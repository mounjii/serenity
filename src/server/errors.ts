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
  | "CANNOT_CONFIRM"
  | "CONFIRMATION_EXPIRED"
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

/** Maps any thrown value to a status and the uniform error body. Internal details are only logged. */
export function describeError(error: unknown): { status: number; body: ApiErrorBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) } },
    };
  }
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: { error: { code: "INVALID_INPUT", message: "Some fields are invalid.", fields: zodFieldErrors(error) } },
    };
  }
  console.error("[server] unexpected error", error);
  return { status: 500, body: { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } } };
}

export function errorResponse(error: unknown): Response {
  const { status, body } = describeError(error);
  return jsonResponse(body, status);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw invalidInput("The request body must be valid JSON.");
  }
}
