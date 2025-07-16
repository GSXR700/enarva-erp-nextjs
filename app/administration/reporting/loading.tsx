export default function ReportingLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-48 bg-gray-200 dark:bg-dark-container rounded animate-pulse" />
      </div>
      
      <div className="space-y-4">
        {/* Filtres */}
        <div className="h-20 bg-gray-200 dark:bg-dark-container rounded-lg animate-pulse" />
        
        {/* Tableau */}
        <div className="space-y-2">
          <div className="h-12 bg-gray-200 dark:bg-dark-container rounded-lg animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-dark-container rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
