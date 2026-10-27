import {
  Activity,
  BriefcaseBusiness,
  LayoutDashboard,
  Rss,
  Tags,
  Upload,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
}

const navigationItems = [
  {
    title: 'List offers',
    url: '/jobs-list',
    icon: LayoutDashboard,
  },
  {
    title: 'Import offers',
    url: '/jobs-import',
    icon: Upload,
  },
  {
    title: 'RSS Sources',
    url: '/sources',
    icon: Rss,
  },
  {
    title: 'Keywords',
    url: '/keywords',
    icon: Tags,
  },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-12 items-center gap-3 px-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <BriefcaseBusiness className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold tracking-tight">Job Filter</p>
              <p className="text-xs text-muted-foreground">
                Job management
              </p>
            </div>
          </div>
        </SidebarHeader>

        <Separator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>

            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    render={<NavLink to={item.url} end />}
                >
                    <item.icon />
                    <span>{item.title}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <Activity className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium">Job Filter</p>
              <p className="text-xs text-muted-foreground">
                Panel personal
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-8">
          <SidebarTrigger aria-label="Abrir o cerrar menú lateral" />

          <Separator orientation="vertical" className="mr-2 h-4" />

          <div className="text-sm text-muted-foreground">
            Job Filter
          </div>
        </header>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}