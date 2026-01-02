"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftNavLinkProps {
  className?: string;
}

export default function DraftNavLink({ className }: DraftNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === "/drafts";

  return (
    <Link
      href="/drafts"
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
    >
      <FileText className="w-4 h-4" />
      임시저장
    </Link>
  );
}
