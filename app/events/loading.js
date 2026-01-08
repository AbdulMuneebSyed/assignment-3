export default function Loading() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-20" />
      ))}
    </div>
  );
}
