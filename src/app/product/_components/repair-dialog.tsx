"use client";

import { CheckmarkCircle02Icon, WrenchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { useTracking } from "@/components/tracking/tracking-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPAIR_ISSUE_SLUG } from "@/lib/events";

export function RepairDialog({ issues }: { issues: string[] }) {
  const { track } = useTracking();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const slugs = selected
      .map((label) => REPAIR_ISSUE_SLUG[label])
      .filter(Boolean);
    const trimmed = comment.trim();
    track("repair_requested", {
      metadata: { issues: slugs, ...(trimmed ? { comment: trimmed } : {}) },
    });
    setSubmitted(true);
  }

  function reset() {
    setSelected([]);
    setComment("");
    setSubmitted(false);
  }

  function toggle(issue: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, issue] : prev.filter((i) => i !== issue),
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset once the closing animation has run.
      window.setTimeout(reset, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="lg" className="w-full" />}>
        <HugeiconsIcon icon={WrenchIcon} />
        Request a repair
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />
            </span>
            <DialogTitle>Repair request sent</DialogTitle>
            <DialogDescription className="max-w-xs">
              Thanks — our repair team will email you within two working days
              with next steps and a prepaid shipping label.
            </DialogDescription>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Request a repair</DialogTitle>
              <DialogDescription>
                Tell us what needs mending on your Serpentine Knit Top. Select
                all that apply.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="mt-4 grid gap-3">
              {issues.map((issue) => {
                const id = `issue-${issue.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <div key={issue} className="flex items-center gap-2.5">
                    <Checkbox
                      id={id}
                      checked={selected.includes(issue)}
                      onCheckedChange={(checked) =>
                        toggle(issue, checked === true)
                      }
                    />
                    <Label htmlFor={id} className="font-normal">
                      {issue}
                    </Label>
                  </div>
                );
              })}
            </fieldset>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="repair-comment" className="font-normal">
                Comment{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="repair-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any details that would help our menders."
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose render={<Button variant="outline" />}>
                Close
              </DialogClose>
              <Button type="submit" disabled={selected.length === 0}>
                Submit request
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
