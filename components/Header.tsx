'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, LogOut, LogIn, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme(); // Correctly destructuring theme and setTheme
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    console.log("🚀 ~ file: Header.tsx:49 ~ Header ~ session:", session);
  }, [session]);

  const isActive = (path: string) =>
    pathname === path ? 'text-[#000000] dark:text-[#ffffff]' : 'text-[#09090b99] dark:text-[#d0d0d0]';

  return (
    <div className="header sticky flex items-center w-full h-[56px] shadow-sm dark:shadow-[#bbbbbb] dark:shadow-sm justify-between px-[40px] bg-white dark:bg-black transition-colors">
      <div className="headerLeft h-full flex items-center">
        <div className="w-[100px] h-[56px] text-[24px] font-bold items-center justify-center flex text-black dark:text-white">
          SpeakUp
        </div>
      </div>
      <div className="headerNav flex items-center gap-8">
        <div className={`navItem cursor-pointer hover:text-[#000000]  dark:hover:text-[#ffffff] ${isActive('/')}`}>
          <Link href="/">Home</Link>
        </div>
        {session?.user && (
          <>
            <div className={`navItem cursor-pointer hover:text-[#000000]  dark:hover:text-[#ffffff] ${isActive('/dashboard')}`}>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className={`navItem cursor-pointer hover:text-[#000000]  dark:hover:text-[#ffffff] ${isActive('/issues')}`}>
              <Link href="/issues">Issues</Link>
            </div>
          </>
        )}
      </div>
      <div className="headerRight h-full flex items-center">
        <div className="headerRightLabel h-full flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {session?.user && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{session?.user?.name}</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>{session?.user?.oid}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
              <DropdownMenuSeparator />
              {session ? (
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              ) : (
                <Link href="/login">
                  <DropdownMenuItem>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log In</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default Header;
