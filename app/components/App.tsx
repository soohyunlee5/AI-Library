import Header from "./Header";
import Bookshelf from "./Bookshelf";

export default function App() {
    return (
        <main className="flex flex-col gap-5">
            <Header />
            <Bookshelf />
        </main>
    );
}