"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login } from "@/lib/auth";
import type { Role } from "@/lib/types";

const demo: Record<Role, { email: string; password: string }> = {
  student: { email: "student@melia.al", password: "student123" },
  admin: { email: "admin@melia.al", password: "admin123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const user = await login(email, password, role);
    setBusy(false);
    if (!user) return toast.error("Wrong email, password or account type");
    toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
    router.push(role === "admin" ? "/admin" : "/student");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Log in</h1>
        <p className="mt-2 text-muted-foreground">Choose your account type to continue.</p>
      </div>
      <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
        <TabsList className="w-full">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="admin">Administrator</TabsTrigger>
        </TabsList>
      </Tabs>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="h-10 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
        <Button
          type="button" variant="outline" className="h-10 w-full"
          onClick={() => { setEmail(demo[role].email); setPassword(demo[role].password); }}
        >
          Fill demo {role} credentials
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">Register</Link>
      </p>
    </div>
  );
}
