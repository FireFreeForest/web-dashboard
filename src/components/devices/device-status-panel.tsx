import { RiskLevelPill } from "@/components/telemetry/risk-level-pill"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeviceStatus } from "@/features/devices/queries"
import { cn } from "@/lib/utils"

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-2">
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] leading-none text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function BooleanPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground"
        )}
      />
      {label}
    </span>
  )
}

export function DeviceStatusPanel({ deviceId }: { deviceId: string }) {
  const { data, isPending, isError } = useDeviceStatus(deviceId)

  if (isPending) {
    return <Skeleton className="h-24 rounded-xl" />
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Status dan telemetri tidak tersedia.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Tingkat Risiko</span>
        <RiskLevelPill level={data.risk_level} />
      </div>

      {data.environment ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Lingkungan
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Metric
              label="Suhu"
              value={
                data.environment.temperature != null
                  ? `${data.environment.temperature.toFixed(1)}°C`
                  : "—"
              }
            />
            <Metric
              label="Kelembapan"
              value={
                data.environment.humidity != null
                  ? `${data.environment.humidity}%`
                  : "—"
              }
            />
            <Metric
              label="Kelembapan Tanah"
              value={String(data.environment.soil_moisture)}
            />
          </div>
        </div>
      ) : null}

      {data.fire ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Api & Asap
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Metric
              label="Api"
              value={data.fire.flame_detected ? "Terdeteksi" : "Aman"}
            />
            <Metric
              label="Level Api"
              value={
                data.fire.flame_level != null
                  ? String(data.fire.flame_level)
                  : "—"
              }
            />
            <Metric label="Level Asap" value={String(data.fire.smoke_level)} />
          </div>
          <div className="flex items-center gap-2">
            <BooleanPill label="Pompa" active={data.fire.pump} />
            <BooleanPill label="Buzzer" active={data.fire.buzzer} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
