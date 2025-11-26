import { FormEvent } from "react"

type MetadataFormProps = {
    onSubmit: (payload: { title: string, author?: string }) => void,
    onCancel: () => void,
    pendingBook: { id: string, fileName: string }
};

export default function MetadataForm({ onSubmit, onCancel, pendingBook }: MetadataFormProps) {
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        if (!title) {
            return;
        }
        const author = String(formData.get("author") ?? "").trim() || undefined;
        onSubmit({title, author})
    }

    return (
        <main className="flex flex-col justify-center items-center border p-4 w-full max-w-md bg-white">
            <button type="button" onClick={onCancel} className="self-end">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rounded-[8px]">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#0F1729"></path> 
                    </g>
                </svg>
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col items-center w-full px-5">
                <h1 className="py-5 text-xl font-medium">Uploaded Book: {pendingBook.fileName}</h1>

                <label htmlFor="title" className="self-start pb-1 font-semibold">
                    Title:
                </label>
                <input type="text" id="title" name="title" placeholder="Title" required className="mb-5 border rounded-[3px] p-3 w-full bg-white" />
                
                <label htmlFor="author" className="self-start pb-1 font-semibold">
                    Author(s):
                </label>
                <input type="text" id="author" name="author" placeholder="Author(s) (optional)" className="mb-5 border rounded-[3px] p-3 w-full bg-white" />

                <button type="submit" className="border text-center font-medium mb-7 text-base text-white bg-[#383838] py-2.5 w-full mt-5 rounded-[8px] border-[#383838] transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#575757] hover:border-[#575757]">
                    Confirm
                </button>
            </form>
        </main>
    );
}
