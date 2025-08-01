import { signOut } from "next-auth/react";
import { User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  user?: User;
  compact?: boolean;
}

export function UserDropdown({ user, compact = false }: UserDropdownProps) {
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative flex items-center transition-all duration-200 gap-2",
            compact ? "h-10 w-10 p-0" : "h-9 px-2",
            "hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]"
          )}
        >
          <Avatar className={cn(
            "border border-[#f5f5f7]/10",
            compact ? "h-7 w-7" : "h-6 w-6"
          )}>
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-[#f5f5f7] leading-none">
                  {user.name}
                </span>
                <span className="text-xs text-[#f5f5f7]/50 leading-none mt-1">
                  {user.email}
                </span>
          </div>
              <ChevronDown className="h-4 w-4 text-[#f5f5f7]/50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#1c1d20] border-[#f5f5f7]/10"
      >
        <DropdownMenuLabel className="text-xs text-[#f5f5f7]/50">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#f5f5f7]/10" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="text-xs text-[#f5f5f7]/70 hover:text-[#f5f5f7] focus:text-[#f5f5f7] focus:bg-[#f5f5f7]/5"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 