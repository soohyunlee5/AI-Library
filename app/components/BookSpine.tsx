import type { DragEvent } from "react";

type BookSpineProps = {
    book: {
        id: string,
        title: string,
        author?: string
    },
    onDelete: () => void,
    onToggle: () => void,
    isSelected: boolean,
    onDragStart: (e: DragEvent<HTMLDivElement>) => void,
    onDragOver: (e: DragEvent<HTMLDivElement>) => void,
    onDragEnd: (e: DragEvent<HTMLDivElement>) => void,
    onDrop: (e: DragEvent<HTMLDivElement>) => void,
    draggable: boolean
};

export default function BookSpine({ book, onDelete, onToggle, isSelected, onDragStart, onDragOver, onDragEnd, onDrop, draggable }: BookSpineProps) {
    return (
        <div data-book-id={book.id} onClick={onToggle} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDrop={onDrop} draggable={draggable} className={`flex items-center border w-[68em] h-[5em] mx-auto mt-3 cursor-pointer transform transition-transform duration-400 ease-in-out hover:-translate-x-6 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}>
            <input 
                type="checkbox"
                className="sr-only"   
                checked={isSelected}
                onChange={onToggle}
                aria-label="Select book"
            />
            <div className="flex-1 m-5">
                {book.title} {book.author}
            </div>
            <button onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }} className="border border-red-600 py-2.5 px-4 rounded-[8px] text-sm transition-colors text-red-600 hover:bg-red-100 m-5">
                Delete
            </button>
        </div>
    );
}
