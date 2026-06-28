export default function TimelineLoading() {
  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 text-center border-b border-[#E8E0D8]/60">
        <div className="h-7 w-28 bg-[#E8E0D8] rounded mx-auto animate-pulse" />
      </header>
      <div className="sticky top-[61px] bg-background/95 backdrop-blur-sm z-30 border-b border-[#E8E0D8]/60">
        <div className="max-w-lg mx-auto flex">
          <div className="flex-1 py-3 flex justify-center">
            <div className="h-4 w-20 bg-[#E8E0D8] rounded animate-pulse" />
          </div>
          <div className="flex-1 py-3 flex justify-center">
            <div className="h-4 w-28 bg-[#E8E0D8] rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square w-full bg-[#E8E0D8]" />
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E8E0D8]" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-[#E8E0D8] rounded" />
                <div className="h-3 w-16 bg-[#E8E0D8] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
