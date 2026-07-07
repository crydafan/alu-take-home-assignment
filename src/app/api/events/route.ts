import { NextResponse } from "next/server";
import {
  type DppEvent,
  type EventMetadata,
  isValidEventType,
  isValidRepairIssue,
  resolveRevenue,
} from "@/lib/events";
import { readAllEvents } from "@/lib/read-events";
import { EVENTS_KEY, redis } from "@/lib/redis";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { passportId, eventType, sessionId, metadata } = (body ?? {}) as {
    passportId?: unknown;
    eventType?: unknown;
    sessionId?: unknown;
    metadata?: unknown;
  };

  if (typeof passportId !== "string" || !passportId) {
    return NextResponse.json({ error: "Missing passportId" }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  if (!isValidEventType(eventType)) {
    return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
  }

  const meta =
    metadata && typeof metadata === "object"
      ? (metadata as EventMetadata)
      : undefined;

  // Repair events must carry a non-empty list of valid issue slugs.
  if (eventType === "repair_requested") {
    const issues = meta?.issues;
    if (
      !Array.isArray(issues) ||
      issues.length === 0 ||
      !issues.every(isValidRepairIssue)
    ) {
      return NextResponse.json(
        { error: "repair_requested requires metadata.issues (valid enum)" },
        { status: 400 },
      );
    }
  }

  const event: DppEvent = {
    id: crypto.randomUUID(),
    passportId,
    eventType,
    timestamp: Date.now(),
    sessionId,
    ...(meta ? { metadata: meta } : {}),
  };

  // Revenue is resolved server-side and never trusted from the client.
  const revenue = resolveRevenue(eventType, meta);
  if (revenue !== undefined) event.revenue = revenue;

  await redis.rpush(EVENTS_KEY, JSON.stringify(event));

  return NextResponse.json(event, { status: 201 });
}

export async function GET() {
  const events = await readAllEvents();
  return NextResponse.json(events);
}
