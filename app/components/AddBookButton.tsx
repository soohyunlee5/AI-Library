import type { ChangeEvent, RefObject } from "react";

type AddBookButtonProps = {
    uploadFile: () => void,
    uploading: boolean,
    fileRef: RefObject<HTMLInputElement | null>,
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
};

export default function AddBookButton({ uploadFile, uploading, fileRef, handleFileChange }: AddBookButtonProps) {
    return (
        <div className="flex justify-center">
            <button
                className="border text-base py-2.5 px-4 rounded-[8px] border-[#383838] transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#383838] hover:text-white"
                onClick={uploadFile}
                disabled={uploading}
                aria-busy={uploading}>
                {uploading ? "Uploading..." : "Add Book"}
            </button>
            <input 
                className="sr-only"
                ref={fileRef}
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange} />
        </div>
    );
}
