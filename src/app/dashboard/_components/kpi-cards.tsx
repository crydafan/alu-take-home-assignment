"use client";

import {
  DollarCircleIcon,
  ShoppingBagCheckIcon,
  UserMultiple02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@/components/ui/card";
import type { Kpis } from "@/lib/analytics";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const tiles = [
    {
      label: "Passport views",
      value: kpis.views.toLocaleString(),
      icon: ViewIcon,
    },
    {
      label: "Unique visitors",
      value: kpis.uniqueVisitors.toLocaleString(),
      icon: UserMultiple02Icon,
    },
    {
      label: "Conversions",
      value: kpis.conversions.toLocaleString(),
      icon: ShoppingBagCheckIcon,
    },
    {
      label: "Revenue",
      value: currency.format(kpis.revenue),
      icon: DollarCircleIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label} size="sm" className="py-0">
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t.label}
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground">
                {t.value}
              </p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon icon={t.icon} size={16} />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
