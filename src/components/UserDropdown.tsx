import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { User } from "next-auth";

interface UserDropdownProps {
  user: User | null | undefined;
}

export function UserDropdown({ user }: UserDropdownProps) {
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-[#f5f5f7]/5 p-2 rounded-lg transition-all duration-200">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="truncate">
            <p className="text-sm font-medium text-[#f5f5f7] truncate">
              {user?.name}
            </p>
            <p className="text-xs text-[#f5f5f7]/70 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-zinc-300">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
            <UserCircleIcon className="h-4 w-4 mr-2" />
            Perfil
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Configurações
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-400/10 focus:bg-red-400/10"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 