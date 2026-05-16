export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      <input
        className={`focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-coral">{error}</span> : null}
    </label>
  );
}
