'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Image as ImageIcon,
  FileText,
  Settings,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Team',
    href: '/admin/team',
    icon: Users,
  },
  {
    title: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    title: 'Gallery',
    href: '/admin/gallery',
    icon: ImageIcon,
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: ImageIcon,
  },
  {
    title: 'Visual Editor',
    href: '/admin/visual-editor',
    icon: ImageIcon,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed top-0 left-0 h-full bg-black border-r border-zinc-800 z-50",
          isCollapsed ? "w-16" : "w-64"
        )}
        animate={{ width: isCollapsed ? 64 : 256 }}
      >
        {/* Logo */}
        <div className="p-4">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold">Admin Panel</span>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors",
                pathname === item.href && "text-white bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && (
                <span>{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-0 right-0 p-4">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && (
                <span className="ml-3">Back to Site</span>
              )}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 bg-black border-b border-zinc-800 flex items-center gap-4 z-40">
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-semibold">Admin Dashboard</span>
      </div>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64",
        "pt-20 lg:pt-0"
      )}>
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
} 