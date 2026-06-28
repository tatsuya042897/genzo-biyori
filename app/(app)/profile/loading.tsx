export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-[#E8E0D8] rounded" />
          <div className="h-5 w-24 bg-[#E8E0D8] rounded" />
          <div className="h-4 w-12 bg-[#E8E0D8] rounded" />
        </div>
      </header>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-[#E8E0D8] flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-5 w-32 bg-[#E8E0D8] rounded" />
            <div className="h-3.5 w-48 bg-[#E8E0D8] rounded" />
          </div>
        </div>
        <div className="flex gap-6 mb-8">
          <div className="h-8 w-16 bg-[#E8E0D8] rounded" />
          <div className="h-8 w-16 bg-[#E8E0D8] rounded" />
        </div>
        <div className="h-4 w-24 bg-[#E8E0D8] rounded mb-3" />
        <div className="h-40 w-full bg-[#E8E0D8] rounded-2xl mb-8" />
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#E8E0D8]" />
          ))}
        </div>
      </div>
    </div>
  )
}
