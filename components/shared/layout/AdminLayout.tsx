"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ImageIcon, 
  NewspaperIcon, 
  UsersIcon, 
  FolderIcon,
  HomeIcon,
  SettingsIcon 
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Media', href: '/admin/media', icon: ImageIcon },
    { name: 'Gallery', href: '/admin/gallery', icon: FolderIcon },
    { name: 'Articles', href: '/admin/articles', icon: NewspaperIcon },
    { name: 'Team', href: '/admin/team', icon: UsersIcon },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];
  
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/">
            <h1 className="text-xl font-bold">Allure MD Admin</h1>
          </Link>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
} 