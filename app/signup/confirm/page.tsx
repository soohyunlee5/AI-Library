import Link from "next/link";

export default function ConfirmSignUp() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <main className="flex flex-col justify-center items-center border p-4 w-full max-w-md shadow-lg bg-white">
                A confirmation link was sent to your registered email address.
                Please confirm your email to activate your account.
                <Link href="/" className="border text-center font-medium text-base text-white bg-[#383838] py-2.5 w-full mt-5 rounded-[8px] border-[#383838] transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#575757] hover:border-[#575757]">Return</Link>
            </main>
        </div>
    );
}
