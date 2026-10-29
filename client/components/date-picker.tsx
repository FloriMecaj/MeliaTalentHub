"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** shadcn date picker. Value is an ISO date string (yyyy-MM-dd). */
export function DatePicker({
  id, value, onChange, minDate, placeholder = "Pick a date",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  placeholder?: string;
}) {
  const selected = value ? parseISO(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className="w-full justify-start px-2.5 font-normal data-[empty=true]:text-muted-foreground"
            data-empty={!selected}
          />
        }
      >
        <CalendarIcon />
        {selected ? format(selected, "PPP") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
          disabled={minDate ? { before: parseISO(minDate) } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
