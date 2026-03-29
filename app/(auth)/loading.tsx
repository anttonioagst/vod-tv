export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col gap-4 w-full p-[16px]">
      <div className="h-8 bg-surface-secondary rounded w-48" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-[285px] bg-surface-secondary rounded-lg" />
        <div className="h-[285px] bg-surface-secondary rounded-lg" />
        <div className="h-[285px] bg-surface-secondary rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="h-[211px] bg-surface-secondary rounded-lg" />
        <div className="h-[211px] bg-surface-secondary rounded-lg" />
        <div className="h-[211px] bg-surface-secondary rounded-lg" />
        <div className="h-[211px] bg-surface-secondary rounded-lg" />
      </div>
    </div>
  )
}
