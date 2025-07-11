'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-[#1c1d20] border-r border-[#f5f5f7]/10">
      <div className="p-4">
        <h2 className="text-base font-medium text-[#f5f5f7] mb-6">KRX Security™</h2>
        
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-[#f5f5f7]/50 uppercase tracking-wider mb-2">Overview</h3>
          <Link 
            href="/dashboard"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-xs font-medium text-[#f5f5f7]/50 uppercase tracking-wider mb-2">Protection</h3>
          
          <Link 
            href="/dashboard/endpoint-protection"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/endpoint-protection") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            KRXShield™
          </Link>

          <Link 
            href="/dashboard/mobile-security"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/mobile-security") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            KRXMobile™
          </Link>

          <Link 
            href="/dashboard/email-security"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/email-security") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            KRXMail™
          </Link>

          <Link 
            href="/dashboard/cloud-protection"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/cloud-protection") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            KRXCloud™
          </Link>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-xs font-medium text-[#f5f5f7]/50 uppercase tracking-wider mb-2">Management</h3>
          
          <Link 
            href="/dashboard/settings"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/settings") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            Settings
          </Link>

          <Link 
            href="/dashboard/compliance"
            className={cn(
              "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
              isActive("/dashboard/compliance") 
                ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
            )}
          >
            Compliance
          </Link>
        </div>
      </div>
    </nav>
  );
} 