"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import type { EventMetadata, EventType } from "@/lib/events";
import { track as sendTrack } from "@/lib/track";

type TrackingContextValue = {
  passportId: string;
  track: (eventType: EventType, extra?: { metadata?: EventMetadata }) => void;
  /** Fires at most once per mount (per passport view) for the given event type. */
  trackOnce: (
    eventType: EventType,
    extra?: { metadata?: EventMetadata },
  ) => void;
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    throw new Error("useTracking must be used within a <TrackingProvider>");
  }
  return ctx;
}

export function TrackingProvider({
  passportId,
  children,
}: {
  passportId: string;
  children: React.ReactNode;
}) {
  const fired = useRef<Set<string>>(new Set());
  const viewed = useRef(false);

  const track = useCallback(
    (eventType: EventType, extra?: { metadata?: EventMetadata }) => {
      sendTrack(passportId, eventType, extra);
    },
    [passportId],
  );

  const trackOnce = useCallback(
    (eventType: EventType, extra?: { metadata?: EventMetadata }) => {
      if (fired.current.has(eventType)) return;
      fired.current.add(eventType);
      sendTrack(passportId, eventType, extra);
    },
    [passportId],
  );

  useEffect(() => {
    // Guard against React StrictMode's double-invoke in development.
    if (viewed.current) return;
    viewed.current = true;
    track("passport_viewed");
  }, [track]);

  return (
    <TrackingContext.Provider value={{ passportId, track, trackOnce }}>
      {children}
    </TrackingContext.Provider>
  );
}
