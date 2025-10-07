"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart,
  Bell,
  Calendar,
  ClipboardCheck,
  Home,
  LogOut,
  Megaphone,
  Menu,
  Music,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { IsezeranoLogo } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  const allNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home, roles: ['ADMIN', 'SECRETARY', 'DISCIPLINARIAN', 'SINGER'] },
    { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone, roles: ['ADMIN', 'SECRETARY', 'SINGER'] },
    { href: "/dashboard/schedule", label: "Schedule", icon: Calendar, roles: ['ADMIN', 'SECRETARY', 'SINGER'] },
    { href: "/dashboard/attendance", label: "Take Attendance", icon: ClipboardCheck, roles: ['ADMIN', 'DISCIPLINARIAN'] },
    { href: "/dashboard/my-attendance", label: "My Attendance", icon: ClipboardCheck, roles: ['SINGER'] },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart, roles: ['ADMIN', 'SECRETARY', 'DISCIPLINARIAN'] },
    { href: "/dashboard/users", label: "User Management", icon: Users, roles: ['ADMIN'] },
  ];

  const navItems = allNavItems.filter(item => user?.role && item.roles.includes(user.role));


  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="loader">Loading...</div>
        </div>
    );
  }

  const getActiveClasses = (href: string) => {
    if (href === "/dashboard" && pathname !== "/dashboard") {
      return "text-muted-foreground";
    }
    if (pathname.startsWith(href)) {
      return "bg-accent text-accent-foreground";
    }
    return "text-muted-foreground";
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <IsezeranoLogo className="h-8 w-8" />
              <span className="font-headline text-lg">Isezerano CMS</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${getActiveClasses(item.href)}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <IsezeranoLogo className="h-8 w-8" />
                  <span className="sr-only">Isezerano CMS</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${getActiveClasses(item.href)}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Image
                  src={user?.profileImage || `https://picsum.photos/seed/${user?.id}/40/40`}
                  width={40}
                  height={40}
                  alt="User avatar"
                  className="rounded-full object-cover"
                  data-ai-hint="person portrait"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.firstName} {user?.lastName}
                <p className="text-xs text-muted-foreground font-normal">{user?.role}</p>
                </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/dashboard/notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
