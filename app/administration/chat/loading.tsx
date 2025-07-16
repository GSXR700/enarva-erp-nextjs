// app/administration/chat/loading.tsx
export default function ChatLoading() {
    return (
        <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-dark-container rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-1/3 border-r dark:border-dark-border flex flex-col">
                <div className="p-4 border-b dark:border-dark-border">
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-dark-surface rounded"></div>
                </div>
                <div className="flex-1 p-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-dark-surface">
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-dark-border rounded mb-2"></div>
                            <div className="h-3 w-full bg-gray-200 dark:bg-dark-border rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex items-center justify-center">
                <div className="h-16 w-16 bg-gray-200 dark:bg-dark-surface rounded-full"></div>
            </div>
        </div>
    )
}