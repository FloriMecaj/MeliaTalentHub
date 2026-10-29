import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="grid w-full gap-10 px-6 py-14 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Meliá Hotel: Excellence Knows No Season. Zero-friction talent acquisition for Gen Z and a
            12-month retained workforce.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Product</p>
          <Link href="/features" className="block text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/impact" className="block text-muted-foreground hover:text-foreground">Impact & ROI</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Platform</p>
          <Link href="/register" className="block text-muted-foreground hover:text-foreground">Create account</Link>
          <Link href="/login" className="block text-muted-foreground hover:text-foreground">Log in</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Demo access</p>
          <p className="text-muted-foreground">admin@melia.al / admin123</p>
          <p className="text-muted-foreground">student@melia.al / student123</p>
        </div>
      </div>
      <div className="border-t px-6 py-5 text-xs text-muted-foreground lg:px-12">
        Built for Innovation Bootcamp Albania. All rights reserved.
      </div>
    </footer>
  );
}
