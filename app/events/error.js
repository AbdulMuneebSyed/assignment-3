"use client";

export default function Error({ error, reset }) {
  return (
    <div className="card">
      <h2 className="text-xl font-black mb-2">Something went wrong</h2>
      <p className="text-ink/70 mb-3">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button className="neo-btn" onClick={() => reset?.()}>
        Try again
      </button>
    </div>
  );
}
