"use client";

import { Button } from "@/components/ui/button";
import type { EventMetadata, EventType } from "@/lib/events";
import { useTracking } from "./tracking-provider";

type TrackedButtonProps = React.ComponentProps<typeof Button> & {
  eventType: EventType;
  metadata?: EventMetadata;
};

/** A shadcn Button that fires an analytics event on click. */
export function TrackedButton({
  eventType,
  metadata,
  onClick,
  ...props
}: TrackedButtonProps) {
  const { track } = useTracking();

  return (
    <Button
      {...props}
      onClick={(event) => {
        track(eventType, metadata ? { metadata } : undefined);
        onClick?.(event);
      }}
    />
  );
}
