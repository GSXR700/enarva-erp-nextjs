// app/administration/missions/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Skeleton for Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="h-9 w-64 bg-gray-200 rounded-md dark:bg-dark-surface"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-md dark:bg-dark-surface mt-2"></div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-40 h-10 bg-gray-200 rounded-lg dark:bg-dark-surface"></div>
        </div>
      </div>

      {/* Skeleton for Main Content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
            <div className="h-48 bg-white rounded-lg shadow-md dark:bg-dark-container p-6"></div>
            <div className="h-64 bg-white rounded-lg shadow-md dark:bg-dark-container p-6"></div>
        </div>
        <div className="col-span-1">
             <div className="h-80 bg-white rounded-lg shadow-md dark:bg-dark-container p-6"></div>
        </div>
      </div>
    </div>
  );
}