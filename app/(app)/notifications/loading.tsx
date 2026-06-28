export default function NotificationsLoading() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="h-5 w-12 bg-[#E8E0D8] rounded mx-auto" />
      </header>
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E0D8]/50">
            <div className="w-11 h-11 rounded-full bg-[#E8E0D8] flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-48 bg-[#E8E0D8] rounded" />
              <div className="h-3 w-20 bg-[#E8E0D8] rounded" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#E8E0D8] flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
