"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterByPassport,
  funnel,
  kpis,
  type PassportFilter,
  perPassportRows,
  repairIssueCounts,
  revenueByAction,
  sectionEngagement,
  viewsOverTime,
} from "@/lib/analytics";
import type { DppEvent } from "@/lib/events";
import { PASSPORT_IDS, passportLabel } from "@/lib/events";
import {
  FunnelChart,
  RepairIssuesChart,
  RevenueByActionChart,
  SectionEngagementChart,
  ViewsTrendChart,
} from "./charts";
import { KpiCards } from "./kpi-cards";
import { PassportTable } from "./passport-table";

export function DashboardClient({ events }: { events: DppEvent[] }) {
  const [selected, setSelected] = useState<PassportFilter>("all");

  // Per-passport table always shows all five units; everything else is scoped.
  const rows = useMemo(() => perPassportRows(events), [events]);
  const scoped = useMemo(
    () => filterByPassport(events, selected),
    [events, selected],
  );

  const agg = useMemo(
    () => ({
      kpis: kpis(scoped),
      revenue: revenueByAction(scoped),
      issues: repairIssueCounts(scoped),
      sections: sectionEngagement(scoped),
      trend: viewsOverTime(scoped),
      funnel: funnel(scoped),
    }),
    [scoped],
  );

  const scopeLabel =
    selected === "all" ? "All passports" : passportLabel(selected);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={12} />
              Loom Collective
            </Link>
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Passport analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              The Serpentine Knit Top · showing {scopeLabel}
            </p>
          </div>

          <Select
            value={selected}
            onValueChange={(v) => setSelected(v as PassportFilter)}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue>
                {(value: string) =>
                  value === "all" ? "All passports" : passportLabel(value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All passports</SelectItem>
              {PASSPORT_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {passportLabel(id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <KpiCards kpis={agg.kpis} />

        <PassportTable rows={rows} selected={selected} onSelect={setSelected} />

        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueByActionChart data={agg.revenue} />
          <RepairIssuesChart data={agg.issues} />
          <SectionEngagementChart data={agg.sections} />
          <FunnelChart data={agg.funnel} />
          <div className="lg:col-span-2">
            <ViewsTrendChart data={agg.trend} />
          </div>
        </div>
      </main>
    </div>
  );
}
