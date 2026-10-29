"use client";

import { MailIcon, MapPinIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usedSlots } from "@/lib/exchange";
import { addPartner, updatePartner, useDb } from "@/lib/store";
import type { Partner } from "@/lib/types";

type Draft = Omit<Partner, "id"> & { id?: string };
const blank: Draft = { name: "", city: "", type: "", contact: "", capacity: 5 };

export function Partners({ onAssign }: { onAssign: (partnerId: string) => void }) {
  const db = useDb();
  const [edit, setEdit] = useState<Draft | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => setEdit(blank)}><PlusIcon /> Add partner</Button></div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {db.partners.map((p) => {
          const used = usedSlots(db, p.id);
          const placed = db.exchanges.filter((x) => x.partnerId === p.id && x.status !== "cancelled" && x.status !== "returned");
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div><CardTitle>{p.name}</CardTitle><CardDescription className="mt-1 flex items-center gap-1"><MapPinIcon className="size-3" />{p.city} · {p.type}</CardDescription></div>
                  <Button size="icon-sm" variant="ghost" aria-label={`Edit ${p.name}`} onClick={() => setEdit(p)}><PencilIcon /></Button>
                </div>
              </CardHeader>
              <div className="space-y-3 px-6 pb-6">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Capacity</span><span className="font-semibold">{used}/{p.capacity} · {Math.max(p.capacity - used, 0)} free</span></div>
                  <Progress value={Math.min(100, (used / p.capacity) * 100)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {placed.length ? placed.map((x) => db.workers.find((w) => w.id === x.workerId)?.name).join(", ") : "No one placed yet"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => onAssign(p.id)} disabled={used >= p.capacity}>Assign workers</Button>
                  {p.contact && <Button size="sm" variant="outline" nativeButton={false} render={<a href={`mailto:${p.contact}`} />}><MailIcon /> Contact</Button>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit partner" : "Add partner"}</DialogTitle></DialogHeader>
          {edit && (
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              if (edit.id) updatePartner(edit.id, edit);
              else addPartner(edit);
              toast.success("Partner saved");
              setEdit(null);
            }}>
              <div className="space-y-2"><Label htmlFor="pn">Company</Label><Input id="pn" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="pc">City, country</Label><Input id="pc" required value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="pt">Type</Label><Input id="pt" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="pcap">Capacity</Label><Input id="pcap" type="number" min={1} value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: +e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="pe">Contact email</Label><Input id="pe" type="email" value={edit.contact} onChange={(e) => setEdit({ ...edit, contact: e.target.value })} /></div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
