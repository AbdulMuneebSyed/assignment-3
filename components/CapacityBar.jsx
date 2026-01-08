export default function CapacityBar({ taken = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(100, Math.round((taken / total) * 100)) : 0;
  return (
    <div className="neo-capacity">
      <div className="neo-capacity-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
