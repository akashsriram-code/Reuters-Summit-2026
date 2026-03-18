type LoadingSpinnerProps = {
  label?: string;
};

export default function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-white/70">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-reuters-red" />
      <span>{label}</span>
    </div>
  );
}
