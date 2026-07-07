"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PassportFilter, PassportRow } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PassportTable({
  rows,
  selected,
  onSelect,
}: {
  rows: PassportRow[];
  selected: PassportFilter;
  onSelect: (id: PassportFilter) => void;
}) {
  return (
    <Card size="sm" className="py-0">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Per-passport performance
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Each row is one physical unit. Click a row to focus the dashboard on
          it.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Care</TableHead>
              <TableHead className="text-right">Supply</TableHead>
              <TableHead className="text-right">Cross-sell</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.passportId}
                onClick={() =>
                  onSelect(selected === r.passportId ? "all" : r.passportId)
                }
                className={cn(
                  "cursor-pointer",
                  selected === r.passportId && "bg-muted/60",
                )}
              >
                <TableCell>
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {r.short}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.views}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.uniqueVisitors}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.careOpened}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.supplyViewed}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.crosssellViewed}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-foreground">
                  {r.conversions}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-foreground">
                  {currency.format(r.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
