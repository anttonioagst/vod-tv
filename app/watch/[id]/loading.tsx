export default function Loading() {
  return (
    <div className="animate-pulse relative flex pt-4 px-4 gap-4 min-h-[800px]">
      <div className="flex-1 pr-[403px]">
        <div className="h-[800px] bg-surface-secondary rounded-lg" />
      </div>
      <div className="absolute right-4 top-4 w-[387px] flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[211px] bg-surface-secondary rounded-lg" />
        ))}
      </div>
    </div>
  )
}
