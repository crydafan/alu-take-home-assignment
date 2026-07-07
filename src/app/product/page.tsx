import {
  BadgeDollarSignIcon,
  DropletIcon,
  FastWindIcon,
  GlobeIcon,
  HashtagIcon,
  LeafIcon,
  Location01Icon,
  RecycleIcon,
  RepairIcon,
  ShirtIcon,
  ShoppingBagAddIcon,
  SunIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import { SectionInView } from "@/components/tracking/section-in-view";
import { TrackedButton } from "@/components/tracking/tracked-button";
import { TrackingProvider } from "@/components/tracking/tracking-provider";
import { Card } from "@/components/ui/card";
import { isValidPassportId } from "@/lib/events";
import { cn } from "@/lib/utils";
import { RepairDialog } from "./_components/repair-dialog";
import { product } from "./lib/mockup";

export const metadata: Metadata = {
  title: `${product.name} - ${product.brand}`,
  description: `${product.name} in ${product.color}. ${product.description.slice(0, 120)}`,
};

const careIcons: Record<string, typeof DropletIcon> = {
  "Machine wash cold": DropletIcon,
  "Line dry": FastWindIcon,
  "Do not tumble dry": SunIcon,
};

function SectionHeading({
  icon,
  children,
}: {
  icon?: typeof LeafIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      {icon && (
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} size={16} />
        </div>
      )}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {children}
      </h2>
    </div>
  );
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; id?: string }>;
}) {
  const { id } = await searchParams;
  const passportId = id?.trim();

  if (!passportId || !isValidPassportId(passportId)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={ShirtIcon} size={28} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          Could not find product
        </h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          This passport link is invalid.
        </p>
      </div>
    );
  }

  return (
    <TrackingProvider passportId={passportId}>
      <div className="min-h-dvh bg-background">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8">
          {/* Image */}
          <div className="aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted shadow-xs">
            <Image
              src={product.image}
              alt={product.name}
              width={800}
              height={1000}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
                <HugeiconsIcon icon={HashtagIcon} size={10} />
                {product.sku}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[0.65rem] text-muted-foreground">
                ID: {passportId.slice(0, 8)}…
              </span>
            </div>

            {/* Identity */}
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {product.brand}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.color}
            </p>

            <div className="my-5 h-px bg-border" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-foreground">
                ${product.price}
              </span>
            </div>
          </div>
        </section>

        {/* Details grid */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <SectionHeading icon={LeafIcon}>Materials</SectionHeading>
                <div className="space-y-3">
                  {product.materials.map((mat) => (
                    <Card key={mat.label} size="sm" className="py-0">
                      <div className="p-4">
                        <p className="text-sm font-medium text-foreground">
                          {mat.label}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {mat.detail}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <SectionInView eventType="care_section_opened">
                <SectionHeading icon={DropletIcon}>
                  Care Instructions
                </SectionHeading>
                <div className="space-y-3">
                  {product.care.map((item) => {
                    const Icon = careIcons[item.label] ?? DropletIcon;
                    return (
                      <Card key={item.label} size="sm" className="py-0">
                        <div className="flex items-start gap-3 p-4">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <HugeiconsIcon icon={Icon} size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.label}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </SectionInView>
            </div>
          </div>
        </section>

        {/* Supply Chain */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionHeading icon={GlobeIcon}>
              The Garment&rsquo;s Journey
            </SectionHeading>

            <SectionInView eventType="supply_chain_viewed" className="relative">
              {/* Connecting line */}
              <div className="absolute left-2.75 top-2 h-[calc(100%-1.5rem)] w-px bg-border md:left-1/2 md:-translate-x-px" />

              <ol className="space-y-8">
                {product.supplyChain.map((step, idx) => (
                  <li
                    key={step.step}
                    className="relative flex flex-col gap-2 md:flex-row md:items-start"
                  >
                    {/* Step number badge */}
                    <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground md:absolute md:left-1/2 md:-translate-x-1/2">
                      {idx + 1}
                    </div>

                    {/* Content card -- alternating sides */}
                    <Card
                      size="sm"
                      className={cn(
                        "ml-8 py-0 md:ml-0 md:w-[calc(50%-2rem)]",
                        idx % 2 === 0 ? "md:mr-auto" : "md:ml-auto",
                      )}
                    >
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground">
                          {step.step}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <HugeiconsIcon icon={Location01Icon} size={12} />
                          {step.location}
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>
            </SectionInView>
          </div>
        </section>

        {/* Cross-sell */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionHeading icon={ShoppingBagAddIcon}>
              Complete the Look
            </SectionHeading>

            <SectionInView
              eventType="crosssell_section_viewed"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {product.crossSell.map((item) => (
                <Card
                  key={item.name}
                  size="sm"
                  className="group flex flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="aspect-4/3 w-full overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-sm font-semibold text-foreground">
                        ${item.price}
                      </span>
                      <TrackedButton
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        eventType="crosssell_purchase_clicked"
                        metadata={{ productId: item.id }}
                      >
                        <HugeiconsIcon icon={ShoppingBagAddIcon} size={14} />
                        Add
                      </TrackedButton>
                    </div>
                  </div>
                </Card>
              ))}
            </SectionInView>
          </div>
        </section>

        {/* End of Life */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Repair */}
              <Card size="sm" className="py-0">
                <div className="p-6">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={RepairIcon} size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Request a Repair
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    We&rsquo;ll fix loose threads, snags, or seam issues free of
                    charge. Submit a request and we&rsquo;ll send you a prepaid
                    shipping label.
                  </p>
                  <div className="mt-4">
                    <RepairDialog issues={product.repairIssues} />
                  </div>
                </div>
              </Card>

              {/* Resale */}
              <Card size="sm" className="py-0">
                <div className="p-6">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={BadgeDollarSignIcon} size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Resell This Item
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    List your pre-loved garments on our circular marketplace.
                    Earn store credit when it sells.
                  </p>
                  <TrackedButton
                    className="mt-4 w-full gap-1.5"
                    variant="secondary"
                    eventType="resale_clicked"
                  >
                    <HugeiconsIcon icon={RecycleIcon} size={14} />
                    Resell This Item
                  </TrackedButton>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </TrackingProvider>
  );
}
