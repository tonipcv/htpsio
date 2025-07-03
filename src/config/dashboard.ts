import {
  LayoutDashboard,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

export const dashboardConfig = {
  mainNav: [
    {
      title: "Documentação",
      href: "/docs",
    },
    {
      title: "Suporte",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Pipeline",
      href: "/dashboard/pipeline",
      icon: Workflow,
    },
    {
      title: "Segurança",
      icon: Shield,
      items: [
        {
          title: "Acronis",
          href: "/dashboard/security",
          icon: ShieldCheck,
        },
        {
          title: "Bitdefender",
          href: "/dashboard/security/bitdefender",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Usuários",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
}; 