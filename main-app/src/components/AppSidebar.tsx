import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  Package,
  Sparkles,
  Archive,
  ShoppingCart,
  Camera,
  BarChart3,
  TrendingUp,
  MessageCircle,
  Users,
  DollarSign,
  Settings,
  ChevronRight,
  ChevronDown,
  List,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/artist", icon: Home },
  {
    title: "My Listings",
    url: "/artist/listings",
    icon: Package,
  },
  {
    title: "Studio & Listings",
    icon: List,
    children: [
      { title: "AI Listing Generator", url: "/artist/ai-listing-generator", icon: Sparkles },
      { title: "Inventory Management", url: "/artist/inventory-management", icon: Archive },
      { title: "Order Dashboard", url: "/artist/order-dashboard", icon: ShoppingCart },
      { title: "My Digital Workshop", url: "/artist/digital-workshop", icon: Camera },
    ]
  },
  {
    title: "Business & Growth",
    icon: BarChart3,
    children: [
      { title: "Sales & Traffic Analytics", url: "/artist/sales-analytics", icon: BarChart3 },
      { title: "AI Trend Spotter", url: "/artist/ai-trend-spotter", icon: TrendingUp },
    ]
  },
  {
    title: "Community & Commissions",
    icon: Users,
    children: [
      { title: "Buyer-Artisan Messenger", url: "/artist/messenger", icon: MessageCircle },
      { title: "Collaboration Finder", url: "/artist/collaboration-finder", icon: Users },
    ]
  },
  {
    title: "Finance & Payouts",
    icon: DollarSign,
    children: [
      { title: "Earnings Dashboard", url: "/artist/earnings-dashboard", icon: DollarSign },
      { title: "Payout Settings", url: "/artist/payout-settings", icon: Settings },
    ]
  },
  // 👇 THIS LINK IS CRITICAL
  { title: "Profile Settings", url: "/artist/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const isGroupExpanded = (title: string) => expandedGroups.includes(title)
  const isActive = (path: string) => location.pathname === path

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-border bg-background`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-primary">Artisan AI</h1>
              <p className="text-xs text-muted-foreground">Professional Dashboard</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleGroup(item.title)}
                    className="w-full justify-between hover:bg-muted text-foreground"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </div>
                    {!collapsed && (
                      isGroupExpanded(item.title) ?
                        <ChevronDown className="w-4 h-4" /> :
                        <ChevronRight className="w-4 h-4" />
                    )}
                  </SidebarMenuButton>

                  {!collapsed && isGroupExpanded(item.title) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <SidebarMenuButton key={child.title} asChild>
                          <NavLink
                            to={child.url}
                            className={`flex items-center py-2 px-3 rounded-md text-sm transition-colors ${isActive(child.url)
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-foreground hover:bg-muted"
                              }`}
                          >
                            <child.icon className="w-4 h-4 mr-3" />
                            {child.title}
                          </NavLink>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className={`flex items-center py-2 px-3 rounded-md text-sm transition-colors ${isActive(item.url)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}