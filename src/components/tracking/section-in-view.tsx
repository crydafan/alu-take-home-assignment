"use client";

import { useEffect, useRef } from "react";
import type { EventType } from "@/lib/events";
import { useTracking } from "./tracking-provider";

/**
 * Fires `eventType` (once per passport view) when the wrapped section first
 * scrolls into view. Used for the care / supply-chain / cross-sell sections.
 */
export function SectionInView({
  eventType,
  children,
  className,
}: {
  eventType: EventType;
  children: React.ReactNode;
  className?: string;
}) {
  const { trackOnce } = useTracking();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackOnce(eventType);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eventType, trackOnce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
