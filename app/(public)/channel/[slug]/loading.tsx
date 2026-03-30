export default function Loading() {
  return (
    <div className="animate-pulse px-4 pt-4 flex flex-col gap-4">
      <div className="w-full h-[224px] bg-surface-secondary rounded-lg" />
      <div className="flex gap-4 mt-4">
        <div className="w-[160px] h-[160px] bg-surface-secondary rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 flex-1 pt-2">
          <div className="h-8 bg-surface-secondary rounded w-48" />
          <div className="h-4 bg-surface-secondary rounded w-32" />
          <div className="h-10 bg-surface-secondary rounded w-28 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[211px] bg-surface-secondary rounded-lg" />
        ))}
      </div>
    </div>
  )
}
