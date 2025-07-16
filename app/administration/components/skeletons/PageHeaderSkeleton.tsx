// app/administration/components/skeletons/PageHeaderSkeleton.tsx
export function PageHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="w-1/3 h-9 bg-gray-200 rounded-md dark:bg-dark-surface animate-pulse"></div>
            <div className="w-40 h-10 bg-gray-200 rounded-lg dark:bg-dark-surface animate-pulse"></div>
        </div>
    );
}