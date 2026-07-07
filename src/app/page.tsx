import { Analytics01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { PASSPORT_IDS, passportLabel, passportShort } from "@/lib/events";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Loom Collective
      </p> */}
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
        Digital Product Passport prototype
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Each QR code below is printed on the care label of one physical
        Serpentine Knit Top. Scan one with your phone to open that unit&rsquo;s
        passport.
      </p>

      <Link
        href="/dashboard"
        className="group mt-6 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <HugeiconsIcon icon={Analytics01Icon} size={18} />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-foreground">
            Analytics dashboard
          </span>
          <span className="block text-sm text-muted-foreground">
            How the five passports are performing
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wider text-foreground">
        Passport QR codes
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PASSPORT_IDS.map((id, index) => (
          <Link
            key={id}
            href={`/product?id=${id}`}
            className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="w-full overflow-hidden rounded-lg bg-white">
              <Image
                src={`/qr/qr-code-${index}.png`}
                alt={`QR code for ${passportLabel(id)}`}
                width={240}
                height={240}
                className="h-auto w-full"
              />
            </div>
            <span className="mt-3 text-sm font-medium text-foreground">
              {passportLabel(id)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {passportShort(id)}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
