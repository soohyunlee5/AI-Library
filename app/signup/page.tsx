import SignUpForm from "./SignUpForm";
import Header from "../components/Header";

export default function SignUp() {

    return(
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex items-center justify-center flex-1">
                <SignUpForm />
            </div>
        </div>
    )
}
