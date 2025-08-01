/* eslint-disable */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocumentTextIcon, ChartBarIcon, ShieldCheckIcon, Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserDropdown } from "@/components/UserDropdown";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  items?: NavItem[];
}



export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  const navItems: NavItem[] = isAdmin ? [
        {
          href: '/dashboard',
      label: 'Dashboard',
          icon: ChartBarIcon,
      description: 'Visão geral do sistema'
          },
          {
            href: '/documents',
      label: 'Gerenciar Documentos',
            icon: DocumentTextIcon,
      description: 'Gerenciar todos os documentos'
          },
          {
            href: '/clients',
      label: 'Clientes',
            icon: UserGroupIcon,
      description: 'Gerenciar clientes'
    },
    {
      href: '/protection-dashboard',
      label: 'Proteção',
      icon: ShieldCheckIcon,
      description: 'Dashboard de proteção'
    },
    {
      href: '/settings',
      label: 'Configurações',
      icon: Cog6ToothIcon,
      description: 'Configurações do sistema'
      }
    ] : [
          {
            href: '/documents',
            label: 'Meus Documentos',
            icon: DocumentTextIcon,
            description: 'Visualizar documentos compartilhados'
          }
  ];

  const NavItemComponent = ({ item, className, isSubItem = false }: { item: NavItem, className?: string, isSubItem?: boolean }) => (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href} className="block">
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center justify-center transition-all duration-200 rounded-lg group",
                  "h-10 px-2",
                  pathname === item.href 
                    ? "bg-[#f5f5f7]/10 text-[#f5f5f7]" 
                    : "text-[#f5f5f7]/70 hover:bg-[#f5f5f7]/5 hover:text-[#f5f5f7]",
                  isSubItem && "pl-2",
                  className
                )}
              >
                <item.icon className={cn(
                  "stroke-[1.5] flex-shrink-0 transition-colors duration-200",
                  "h-5 w-5",
                  pathname === item.href ? "text-[#f5f5f7]" : "text-[#f5f5f7]/70"
                )} />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
            {item.description && <p className="text-xs text-[#f5f5f7]/70">{item.description}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {item.items?.map((subItem) => (
        <NavItemComponent key={subItem.href} item={subItem} isSubItem={true} />
      ))}
    </>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Separator className="my-2 bg-[#f5f5f7]/10" />
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 transition-all duration-300 border-r border-[#f5f5f7]/10 bg-[#1c1d20] shadow-[1px_0_5px_rgba(0,0,0,0.2)] hidden lg:block z-40 w-14">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center border-b border-[#f5f5f7]/10 bg-[#1c1d20] h-14 px-2">
            <Link href="/" className="flex items-center">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-6 px-1">
                  <div className="space-y-1">
                {navItems.map((item) => (
                      <NavItemComponent key={item.href} item={item} />
                    ))}
                  </div>
            </nav>
          </ScrollArea>
          <Separator className="bg-[#f5f5f7]/10" />
          <div className="flex items-center justify-center p-2">
            <UserDropdown user={session?.user} compact={true} />
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-[#f5f5f7]/10 bg-[#1c1d20] shadow-[0_1px_5px_rgba(0,0,0,0.2)] z-40 lg:hidden">
        <div className="h-full px-4 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </Link>
          <div className="absolute right-4">
            <UserDropdown user={session?.user} compact />
          </div>
        </div>
      </header>
    </>
  );
} 