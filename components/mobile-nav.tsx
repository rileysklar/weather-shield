'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Menu, LogIn, UserPlus, X } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('Button clicked');
    setIsOpen(!isOpen);
  };

  console.log('Rendering MobileNav, isOpen:', isOpen);

  return (
    <div className="flex sm:hidden items-center justify-between p-4 border-b">
      <div className="flex-1 text-center">
        <span className="text-xl black-ops">Weather Shield</span>
      </div>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClick}
            className="z-50 relative w-10 h-10 flex items-center justify-center"
          >
            <Menu className={`h-5 w-5 absolute transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
            <X className={`h-5 w-5 absolute transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[200px] p-4 z-50"
        >
          <div className="flex flex-col gap-4">
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Documentation
              </Button>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
            <div className="flex items-center text-sm">
              <ThemeSwitcher />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}