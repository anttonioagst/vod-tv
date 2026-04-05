export default function LiveBadge() {
  return (
    <div className="flex items-center gap-1 bg-red-500 text-white text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
      AO VIVO
    </div>
  )
}
