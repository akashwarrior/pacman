"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-black/80 backdrop-blur-xl border-white/10 text-white",
          title: "text-white font-medium",
          description: "text-white/70",
          actionButton: "bg-cyan-500 text-white",
          cancelButton: "bg-white/10 text-white",
          success: "border-green-500/30",
          error: "border-cyan-500/30",
          info: "border-cyan-500/30",
          warning: "border-cyan-500/30",
        },
      }}
      {...props}
    />
  );
}
