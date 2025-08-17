"use client";

import { usePathname } from "next/navigation";
import {
  Wallet,
  Settings,
  LogOut,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  WalletWatcherProvider,
  useWalletWatcher,
} from "@/hooks/use-wallet-watcher";
import Link from "next/link";
import { cn } from "@/lib/utils";

function NavLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useWalletWatcher();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">Wallet Watcher</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
             <NavLink href="/dashboard" icon={LayoutGrid}>Dashboard</NavLink>
             <NavLink href="/dashboard/transactions" icon={List}>Transactions</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.username}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.country}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <div className="md:hidden">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/dashboard/transactions" className="w-full">
                      <List className="mr-2 h-4 w-4" />
                      Transactions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletWatcherProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </WalletWatcherProvider>
  );
}
