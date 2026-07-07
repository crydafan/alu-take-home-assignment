import "server-only";
import type { DppEvent } from "@/lib/events";
import { EVENTS_KEY, redis } from "@/lib/redis";

/** Reads the full event log from Redis, newest-last (insertion order). */
export async function readAllEvents(): Promise<DppEvent[]> {
  const raw = await redis.lrange<string | DppEvent>(EVENTS_KEY, 0, -1);
  return raw.map((e) =>
    typeof e === "string" ? (JSON.parse(e) as DppEvent) : e,
  );
}
