import type { EventMetadata, EventType } from "@/lib/events";

const SESSION_KEY = "dpp_session_id";

/** Random session id, created on first passport view and persisted in localStorage. */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Fire-and-forget event send. `revenue`/`timestamp`/`id` are stamped server-side;
 * the client only supplies passportId, eventType, sessionId, and optional metadata.
 */
export function track(
  passportId: string,
  eventType: EventType,
  extra?: { metadata?: EventMetadata },
): void {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passportId, eventType, sessionId, ...extra }),
    keepalive: true, // survive navigation right after a click / on mount
  }).catch(() => {
    // Analytics is best-effort; never surface errors to the visitor.
  });
}
