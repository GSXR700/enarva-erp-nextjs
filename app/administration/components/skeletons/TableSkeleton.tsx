// app/administration/components/skeletons/TableSkeleton.tsx
export function TableSkeleton({ headers }: { headers: string[] }) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-dark-border">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="animate-pulse">
                                {headers.map((_, colIndex) => (
                                    <td key={colIndex} className="p-4">
                                        <div className="h-4 bg-gray-200 rounded-md dark:bg-dark-surface"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}