"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BarChart3IconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

function BarChart3Icon({ className, size = 28, ...props }: BarChart3IconProps) {
  return (
    <div className={cn(className)} {...props}>
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    </div>
  );
}

export { BarChart3Icon };
