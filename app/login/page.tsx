import LogInForm from "./LogInForm";
import Header from "../components/Header";

export default function LogIn() {

    return(
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex items-center justify-center flex-1">
                <LogInForm />
            </div>
        </div>
    )
}
