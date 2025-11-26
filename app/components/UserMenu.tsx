"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type UserMenuProps = {
    user: User,
}

export default function UserMenu({ user }: UserMenuProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!isOpen) { return; }

            if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen])

    function toggle() {
        setIsOpen(prevIsOpen => !prevIsOpen);
    }

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsOpen(false);
        router.push("/login");
    }

    return (
        <div ref={menuRef} className="flex gap-5 relative">
            <span>Hello, <span className="font-bold">{user.email}</span></span>
            <button type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls="user-menu" onClick={toggle} className="cursor-pointer">
                <span data-popover-target="menu">
                    <svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rounded-[8px]">
                        <path d="M4 18L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </span>
            </button>
            <ul
                role="menu"
                id="user-menu"
                aria-hidden={!isOpen}
                data-popover="menu"
                data-popover-placement="bottom"
                className={`absolute border right-0 top-full mt-2 min-w-[8rem] rounded-[8px] origin-top-right transform transition-all duration-150 ease-out ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
            >
                <li role="menuitem"><button onClick={handleSignOut} className="block w-full p-3 rounded-[8px] text-slate-800 text-sm bg-slate-100 transition-all hover:bg-[#383838] hover:text-white focus:bg-[#575757] active:bg-[#575757]">Log Out</button></li>
            </ul>
        </div>
    );
}
