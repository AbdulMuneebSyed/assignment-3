export default function SkeletonEventCard() {
  return (
    <div className="neo-shadow relative overflow-hidden min-h-[320px] flex flex-col border-4 border-black rounded-[24px] bg-paper animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,194,255,0.08)] via-[rgba(255,90,95,0.08)] to-transparent" />
      <div className="relative h-full flex flex-col">
        <div className="h-36 w-full bg-gradient-to-r from-[#ffeeda] via-[#fff8ef] to-[#ffeeda] border-b-4 border-black" />
        <div className="p-4 space-y-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 w-3/4">
              <div className="h-5 w-28 bg-[#ffd166] border-2 border-black rounded-lg" />
              <div className="h-6 w-5/6 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
              <div className="h-4 w-1/2 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-[#fff8ef] border-2 border-black rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
            <div className="h-4 w-5/6 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
            <div className="h-4 w-2/3 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border-4 px-3 py-4 bg-[#fff8ef] border-black">
              <div className="h-3 w-16 bg-[#ffeeda] border border-black rounded" />
              <div className="h-5 w-20 mt-2 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
            </div>
            <div className="rounded-2xl border-4 px-3 py-4 bg-[#fff8ef] border-black">
              <div className="h-3 w-16 bg-[#ffeeda] border border-black rounded" />
              <div className="h-5 w-16 mt-2 bg-[#ffeeda] border-2 border-dashed border-black rounded-lg" />
            </div>
          </div>

          <div className="h-4 w-full bg-[#ffd166] border-2 border-black rounded-xl" />

          <div className="mt-auto h-10 w-32 bg-[#fff8ef] border-3 border-black rounded-xl" />
        </div>
      </div>
    </div>
  );
}
