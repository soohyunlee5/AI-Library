"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

export default function SignUpForm() {
    const supabase = createClient();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function signUp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        try {
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "").trim();
            const passwordConfirmation = String(formData.get("confirmation") ?? "").trim();

            if (!email || !password) {
                alert("Email and password are required");
                return;
            }

            if (password !== passwordConfirmation) {
                alert("Check if password match");
                return;
            }

            const supabaseSignUp = await supabase.auth.signUp({ email, password });

            if (supabaseSignUp.error) {
                alert(supabaseSignUp.error.message);
                return;
            }

            if (!supabaseSignUp.data.session) {
                router.push("/signup/confirm");
                router.refresh();
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
            <form onSubmit={signUp} className="flex flex-col items-center w-full px-5">
                <h1 className="py-8 text-2xl font-semibold">Sign Up</h1>
                <label htmlFor="email" className="self-start pb-1 font-semibold">
                    Email:
                </label>
                <input id="email" name="email" type="email" placeholder="Email" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />
                
                <label className="self-start pb-1 font-semibold">
                    Password:
                </label>
                <input id="password" name="password" type="password" placeholder="Password" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />

                <label className="self-start pb-1 font-semibold">
                    Confirm Password:
                </label>
                <input id="confirmation" name="confirmation" type="password" placeholder="Password" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />

                <button disabled={isSubmitting} className="border text-center font-medium mb-7 text-base text-white bg-[#383838] py-2.5 w-full mt-5 rounded-[8px] border-[#383838] transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#575757] hover:border-[#575757]">
                    {isSubmitting ? "Signing in..." : "Sign Up"}
                </button>
                <p>
                    Already have an account? <Link href="/login" className="font-semibold underline">Log In</Link>
                </p>
            </form>
        </main>
    )
}
