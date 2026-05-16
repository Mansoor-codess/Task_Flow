export default function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-forest text-white hover:bg-forest/90",
    secondary: "bg-white text-ink border border-ink/10 hover:bg-mint/40",
    danger: "bg-coral text-white hover:bg-coral/90",
    ghost: "text-forest hover:bg-mint/50"
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
