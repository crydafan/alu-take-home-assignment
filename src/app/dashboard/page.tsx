import { Analytics01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { readAllEvents } from "@/lib/read-events";
import { DashboardClient } from "./_components/dashboard-client";

export const metadata: Metadata = {
  title: "Passport Analytics - Loom Collective",
  description:
    "Engagement, conversions and revenue across the five Serpentine Knit Top passports.",
};

// Always render fresh so new scans/clicks appear immediately.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const events = await readAllEvents();

  if (events.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={Analytics01Icon} size={28} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          No events yet
        </h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Run <code className="rounded bg-muted px-1.5 py-0.5">pnpm seed</code>{" "}
          to load demo data, or visit a passport page to generate events.
        </p>
      </div>
    );
  }

  return <DashboardClient events={events} />;
}
