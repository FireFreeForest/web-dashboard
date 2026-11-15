import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ComputerIcon,
  GlobeIcon,
  MapIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"

import {
  useMapMode,
  type MapMode,
} from "@/components/providers/map-mode-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/settings")({
  staticData: { crumb: "Settings" },
  component: SettingsPage,
})

type ThemeValue = "system" | "light" | "dark"

const THEME_OPTIONS: {
  value: ThemeValue
  label: string
  description: string
  icon: IconSvgElement
}[] = [
  {
    value: "system",
    label: "System",
    description: "Match your device",
    icon: ComputerIcon,
  },
  {
    value: "light",
    label: "Light",
    description: "Always light",
    icon: Sun03Icon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always dark",
    icon: Moon02Icon,
  },
]

const MAP_MODE_OPTIONS: {
  value: MapMode
  label: string
  description: string
  icon: IconSvgElement
}[] = [
  {
    value: "flat",
    label: "Flat",
    description: "Standard 2D map",
    icon: MapIcon,
  },
  {
    value: "globe",
    label: "Globe",
    description: "3D globe view",
    icon: GlobeIcon,
  },
]

function OptionButton({
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  label: string
  description: string
  icon: IconSvgElement
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={selected}
      variant="outline"
      onClick={onSelect}
      className={cn(
        "h-auto flex-col items-start gap-1.5 rounded-xl p-4 text-left whitespace-normal",
        selected &&
          "border-primary/40 bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10"
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <HugeiconsIcon icon={icon} strokeWidth={2} />
        {label}
      </span>
      <span className="text-xs font-normal text-muted-foreground">
        {description}
      </span>
    </Button>
  )
}

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { mapMode, setMapMode } = useMapMode()

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Personalize the look and feel of your dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-8 md:col-span-2">
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Choose the color theme used across the dashboard.
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Theme"
              className="grid gap-3 sm:grid-cols-3"
            >
              {THEME_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  icon={option.icon}
                  selected={theme === option.value}
                  onSelect={() => setTheme(option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Map Mode</h3>
              <p className="text-sm text-muted-foreground">
                Choose how the dashboard map is rendered.
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Map mode"
              className="grid gap-3 sm:grid-cols-2"
            >
              {MAP_MODE_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  icon={option.icon}
                  selected={mapMode === option.value}
                  onSelect={() => setMapMode(option.value)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
