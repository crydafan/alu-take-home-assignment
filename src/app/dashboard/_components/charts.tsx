"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type {
  FunnelStage,
  IssueCount,
  RevenueByAction,
  SectionEngagement,
  TrendPoint,
} from "@/lib/analytics";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm" className="py-0">
      <div className="border-b p-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function RevenueByActionChart({ data }: { data: RevenueByAction[] }) {
  const config: ChartConfig = {
    revenue: { label: "Revenue" },
  };
  return (
    <ChartCard
      title="Revenue by action type"
      subtitle="Repair · resale · cross-sell"
    >
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="action"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => currency.format(Number(v))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => currency.format(Number(value))}
              />
            }
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={d.key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function RepairIssuesChart({ data }: { data: IssueCount[] }) {
  const config: ChartConfig = { count: { label: "Requests" } };
  return (
    <ChartCard
      title="Most common repair issues"
      subtitle="Across all repair requests"
    >
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4} fill="var(--chart-1)" />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function SectionEngagementChart({
  data,
}: {
  data: SectionEngagement[];
}) {
  const config: ChartConfig = { count: { label: "Opens" } };
  return (
    <ChartCard
      title="Section engagement"
      subtitle="Which sections visitors open most"
    >
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="section"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={d.section}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function ViewsTrendChart({ data }: { data: TrendPoint[] }) {
  const config: ChartConfig = {
    views: { label: "Views", color: "var(--chart-1)" },
    conversions: { label: "Conversions", color: "var(--chart-4)" },
  };
  return (
    <ChartCard title="Activity over time" subtitle="Last 14 days">
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
          <defs>
            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.6} />
              <stop
                offset="95%"
                stopColor="var(--chart-1)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.6} />
              <stop
                offset="95%"
                stopColor="var(--chart-4)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="views"
            type="monotone"
            stroke="var(--chart-1)"
            fill="url(#fillViews)"
            strokeWidth={2}
          />
          <Area
            dataKey="conversions"
            type="monotone"
            stroke="var(--chart-4)"
            fill="url(#fillConversions)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  return (
    <ChartCard
      title="Conversion funnel"
      subtitle="Sessions: viewed → engaged → converted"
    >
      <div className="space-y-3 py-2">
        {data.map((stage, i) => (
          <div key={stage.stage}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{stage.stage}</span>
              <span className="text-muted-foreground">
                {stage.sessions.toLocaleString()}
                <span className="ml-1.5 tabular-nums">
                  ({Math.round(stage.pct)}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(stage.pct, 2)}%`,
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
