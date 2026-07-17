export function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-1 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-priority-critical' : 'text-text-primary'}`}>
        {value}
      </p>
    </div>
  )
}
