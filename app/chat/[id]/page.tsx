import Header from "../../components/Header";
import ChatUI from "../../components/ChatUI";

export default async function Chat({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ids?: string }>;
}) {
    const { id: chatId } = await params;
    const { ids: idsParam } = (await searchParams) ?? {};
    const docIds = typeof idsParam === "string" && idsParam.length > 0 ? idsParam.split(",") : [chatId];

    return (
        <main className="flex flex-col min-h-screen">
            <Header />
            <ChatUI chatId={chatId} docIds={docIds} />
        </main>
    )
}
