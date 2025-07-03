/* eslint-disable */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCircleIcon,
  ChartBarIcon,
  LinkIcon,
  UsersIcon,
  Cog6ToothIcon,
  FunnelIcon,
  HeartIcon,
  SparklesIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  items?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Lista de rotas protegidas onde a navegação deve aparecer
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/security',
    '/profile'
  ];

  // Só mostrar navegação em rotas protegidas
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
  if (!isProtectedRoute) {
    return null;
  }

  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: ChartBarIcon,
          description: 'Visão geral'
        },
        {
          href: '/dashboard/security',
          label: 'Segurança',
          icon: ShieldCheckIcon,
          description: 'Gerenciar segurança',
          items: [
            {
              href: '/dashboard/security',
              label: 'Acronis',
              icon: ShieldCheckIcon,
              description: 'Gerenciar Acronis'
            },
            {
              href: '/dashboard/security/bitdefender',
              label: 'Bitdefender',
              icon: ShieldCheckIcon,
              description: 'Gerenciar Bitdefender'
            }
          ]
        }
      ]
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
                  "w-full h-9 flex items-center px-2.5 transition-all duration-200 gap-2.5 rounded-lg group",
                  pathname === item.href 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-400 hover:bg-zinc-800/50",
                  isSubItem && "pl-8",
                  className
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] stroke-[1.5] flex-shrink-0 transition-colors duration-200",
                  pathname === item.href ? "text-white" : "text-zinc-400"
                )} />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap transition-colors duration-200",
                  pathname === item.href ? "text-white" : "text-zinc-400"
                )}>
                  {item.label}
                </span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="hidden lg:block">
            <p>{item.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {item.items?.map((subItem) => (
        <NavItemComponent key={subItem.href} item={subItem} isSubItem={true} />
      ))}
    </>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
      {title}
    </h3>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-52 transition-all duration-300 border-r border-zinc-800/50 bg-black shadow-[1px_0_5px_rgba(0,0,0,0.2)] hidden lg:block z-40">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center justify-center px-4 border-b border-zinc-800/50 bg-zinc-900/50">
            <Link href="/" className="flex items-center">
              <div className="relative w-24 h-8">
                <Image
                  src="/logo.png"
                  alt="MED1 Logo"
                  fill
                  className="object-contain brightness-[2.5] contrast-125 invert"
                  priority
                />
              </div>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-6 px-2">
              {navSections.map((section) => (
                <div key={section.title}>
                  <SectionTitle title={section.title} />
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItemComponent key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
          <Separator className="bg-zinc-800/50" />
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-zinc-800/50 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.2)] z-40 lg:hidden">
        <div className="h-full px-4 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-20 h-7">
              <Image
                src="/logo.png"
                alt="MED1 Logo"
                fill
                className="object-contain brightness-[2.5] contrast-125 invert"
                priority
              />
            </div>
          </Link>
          <div className="absolute right-4">
            <Link href="/profile">
              <Avatar className="h-8 w-8 ring-1 ring-zinc-800 bg-zinc-900">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session.user.name || "Profile"} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-zinc-900">
                    <UserCircleIcon className="h-5 w-5 text-zinc-400" />
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800/50 bg-black shadow-[0_-1px_5px_rgba(0,0,0,0.2)] z-50 lg:hidden">
        <div className="py-1.5 px-2">
          <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
            {navSections.flatMap(section => section.items).map((item) => (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 flex items-center justify-center transition-colors rounded-lg",
                    pathname === item.href 
                      ? "bg-zinc-800 text-white shadow-sm" 
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] stroke-[1.5]",
                    pathname === item.href ? "text-white" : "text-zinc-400"
                  )} />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-52 flex-shrink-0" />
    </>
  );
} 