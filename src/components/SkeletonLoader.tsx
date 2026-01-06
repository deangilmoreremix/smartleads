export function CampaignCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-700/50 rounded-lg p-4">
            <div className="h-8 bg-slate-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-12"></div>
          </div>
        ))}
      </div>
      <div className="mt-6 h-10 bg-slate-700 rounded-lg"></div>
    </div>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-slate-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-slate-700 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
      <div className="mt-4 flex items-center space-x-3">
        <div className="flex-1 h-10 bg-slate-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
        <div className="w-5 h-5 bg-slate-700 rounded"></div>
      </div>
      <div className="h-8 bg-slate-700 rounded w-20 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-24"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between animate-pulse">
      <div className="flex-1">
        <div className="h-5 bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
    </div>
  );
}
