import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,x-booth-secret,stripe-signature",
};

export function corsJson(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init.headers,
    },
  });
}

export function corsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function jsonError(message: string, status = 400) {
  return corsJson({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 400);
  }

  if (error instanceof Error) {
    return jsonError(error.message, 500);
  }

  return jsonError("Unexpected error", 500);
}
