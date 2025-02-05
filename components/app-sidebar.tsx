  "use client"

  import type * as React from "react"
  import { Album, ImageIcon, LayoutGrid, Settings, Upload, Star, Pin, LogIn } from "lucide-react"
  import Link from "next/link"

  import { NavMain } from "./nav-main"
  import { NavUser } from "./nav-user"
  import { TeamSwitcher } from "./team-switcher"
  import { NavAdmin } from "./nav-admin"
  import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, SidebarFooter } from "./ui/sidebar"
  import { Button } from "./ui/button"
  import { ThemeToggle } from "./theme-toggle"

  const data = {
    user: {
      name: "Admin",
      email: "admin@example.com",
      avatar: "CN",
    },
    teams: [
      {
        name: "Admin",
        logo: Star,
      },
      {
        name: "Staff",
        logo: Pin,
      },
    ],
    navMain: [
      {
        title: "Collections",
        url: "/gallery",
        icon: LayoutGrid,
        items: [
          {
            title: "Plastic Surgery",
            url: "/gallery/plastic-surgery",
            items: [
              { title: "Face", url: "/gallery/plastic-surgery/face" },
              { title: "Eyelids", url: "/gallery/plastic-surgery/eyelids" },
              { title: "Ears", url: "/gallery/plastic-surgery/ears" },
              { title: "Nose", url: "/gallery/plastic-surgery/nose" },
              { title: "Neck", url: "/gallery/plastic-surgery/neck" },
              { title: "Breast Augmentation", url: "/gallery/plastic-surgery/breast-augmentation" },
              { title: "Breast Lift", url: "/gallery/plastic-surgery/breast-lift" },
              { title: "Breast Reduction", url: "/gallery/plastic-surgery/breast-reduction" },
              { title: "Breast Revision", url: "/gallery/plastic-surgery/breast-revision" },
              { title: "Breast Nipple Areolar Complex", url: "/gallery/plastic-surgery/breast-nipple-areolar-complex" },
              { title: "Abdominoplasty", url: "/gallery/plastic-surgery/abdominoplasty" },
              { title: "Mini Abdominoplasty", url: "/gallery/plastic-surgery/mini-abdominoplasty" },
              { title: "Liposuction", url: "/gallery/plastic-surgery/liposuction" },
              { title: "Arm Lift", url: "/gallery/plastic-surgery/arm-lift" },
              { title: "Thigh Lift", url: "/gallery/plastic-surgery/thigh-lift" },
            ],
          },
          {
            title: "Emsculpt",
            url: "/gallery/emsculpt",
            items: [
              { title: "Abdomen", url: "/gallery/emsculpt/abdomen" },
              { title: "Buttocks", url: "/gallery/emsculpt/buttocks" },
              { title: "Arms", url: "/gallery/emsculpt/arms" },
              { title: "Calves", url: "/gallery/emsculpt/calves" },
            ],
          },
          {
            title: "SylfirmX",
            url: "/gallery/sylfirmx",
          },
          {
            title: "Facials",
            url: "/gallery/facials",
          },
        ],
      },
    ],
    admin: [
      {
        name: "Collections",
        url: "/admin/collections",
        icon: LayoutGrid,
      },
      {
        name: "Albums",
        url: "/admin/albums",
        icon: Album,
      },
      {
        name: "Cases",
        url: "/admin/cases",
        icon: ImageIcon,
      },
      {
        name: "Upload",
        url: "/admin/upload",
        icon: Upload,
      },
      {
        name: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  }

  interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    isAdminPage?: boolean
  }

  export function AppSidebar({ isAdminPage = true, ...props }: AppSidebarProps) {
    return (
      <Sidebar className="border-r bg-background" collapsible="icon" {...props}>
        <SidebarHeader className="border-b px-2 py-2">
          {isAdminPage ? (
            <TeamSwitcher teams={data.teams} />
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <svg className="w-full h-8 md:h-10 lg:h-12" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                <rect
                  width="98"
                  height="48"
                  x="1"
                  y="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <text
                  x="50"
                  y="30"
                  fontFamily="Arial"
                  fontSize="16"
                  className="text-foreground"
                  fill="currentColor"
                  textAnchor="middle"
                >
                  Logo
                </text>
              </svg>
            </Link>
          )}
        </SidebarHeader>
        <SidebarContent>
          <div className="group-data-[collapsed=true]:hidden">
            <NavMain items={data.navMain} />
            {isAdminPage && <NavAdmin items={data.admin} />}
          </div>
          <div className="hidden group-data-[collapsed=true]:block">
            {data.navMain.map((item) => (
              <Link key={item.title} href={item.url} className="flex items-center justify-center p-2 hover:bg-white/5 rounded-lg">
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            {isAdminPage && data.admin.map((item) => (
              <Link key={item.name} href={item.url} className="flex items-center justify-center p-2 hover:bg-white/5 rounded-lg">
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t">
          {isAdminPage ? (
            <div className="p-2 space-y-2">
              <NavUser user={data.user} />
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login / Create Account
                </Link>
              </Button>
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            </div>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }
