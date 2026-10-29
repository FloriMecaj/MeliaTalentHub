import Link from "next/link";
import { SessionNotice } from "@/components/site/session-notice";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-amber-400/30 blur-3xl" />
        <Link href="/" className="relative text-lg font-bold">Meliá Talent Hub</Link>
        <div className="relative max-w-md space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-balance">
            Excellence knows no season.
          </h2>
          <p className="text-sky-50/90">
            Seasonal jobs become 12-month careers. Get matched, get invited back, and move between
            Meliá and partner hotels all year.
          </p>
        </div>
        <p className="relative text-xs text-sky-100/80">Built for Innovation Bootcamp Albania.</p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <div className="lg:hidden"><Logo /></div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-lg space-y-6">
            <SessionNotice />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
