"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

export default function LogInForm() {
    const supabase = createClient();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function logIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        try {
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "").trim();

            if (!email || !password) {
                alert("Email and password are required")
                return;
            }

            const supabaseSignIn = await supabase.auth.signInWithPassword({ email, password });
            if (supabaseSignIn.error) {
                alert(supabaseSignIn.error.message);
                return;
            }

            router.push("/");
            router.refresh();

        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <main className="flex flex-col justify-center items-center border p-4 w-full max-w-md shadow-lg bg-white">
            <form onSubmit={logIn} className="flex flex-col items-center w-full px-5">
                <h1 className="py-8 text-2xl font-semibold">Log In</h1>
                <label htmlFor="email" className="self-start pb-1 font-semibold">
                    Email:
                </label>
                <input id="email" name="email" type="email" placeholder="Email" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />
                
                <label className="self-start pb-1 font-semibold">
                    Password:
                </label>
                <input id="password" name="password" type="password" placeholder="Password" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />

                <button disabled={isSubmitting} className="border text-center font-medium mb-7 text-base text-white bg-[#383838] py-2.5 w-full mt-5 rounded-[8px] border-[#383838] transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#575757] hover:border-[#575757]">
                    {isSubmitting ? "Logging in..." : "Log In"}
                </button>
                <p>
                    Don't have an account? <Link href="/signup" className="font-semibold underline">Sign Up</Link>
                </p>
            </form>
        </main>
    )
}
