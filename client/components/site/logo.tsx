import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-bold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-amber-400 text-sm font-extrabold text-white">
        M
      </span>
      <span>
        Meliá <span className="text-muted-foreground font-medium">Talent Hub</span>
      </span>
    </Link>
  );
}
