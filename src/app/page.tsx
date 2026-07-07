import {
  Analytics01Icon,
  ArrowRight01Icon,
  ShirtIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { PASSPORT_IDS } from "@/lib/events";

export default function Home() {
  const samplePassport = PASSPORT_IDS[0];

  const links = [
    {
      href: `/product?id=${samplePassport}`,
      icon: ShirtIcon,
      title: "Digital Product Passport",
      description:
        "The public page a customer reaches by scanning the garment's QR code.",
    },
    {
      href: "/dashboard",
      icon: Analytics01Icon,
      title: "Analytics dashboard",
      description:
        "How the five passports are performing — engagement, conversions and revenue.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Loom Collective
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
        Digital Product Passport prototype
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A public passport page for The Serpentine Knit Top with post-purchase
        actions, Redis-backed event tracking, and an analytics dashboard.
      </p>

      <div className="mt-8 grid gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <HugeiconsIcon icon={l.icon} size={20} />
            </span>
            <div className="flex-1">
              <p className="font-medium text-foreground">{l.title}</p>
              <p className="text-sm text-muted-foreground">{l.description}</p>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
