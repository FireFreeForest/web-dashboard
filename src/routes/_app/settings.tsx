import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ComputerIcon,
  GlobeIcon,
  MapIcon,
  Moon02Icon,
  Notification01Icon,
  PaintBrush01Icon,
  Sun03Icon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons"

import {
  useMapMode,
  type MapMode,
} from "@/components/providers/map-mode-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { PushNotificationSettings } from "@/components/push/push-notification-settings"
import { RealtimeConnectionSettings } from "@/components/realtime/realtime-connection-settings"
import { RealtimeTicketSettings } from "@/components/realtime/realtime-ticket-settings"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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

const OPTION_ITEM_CLASS =
  "h-auto min-h-0 w-full min-w-0 flex-col items-start justify-start gap-1 rounded-xl p-3 text-left whitespace-normal aria-pressed:border-primary/40 aria-pressed:bg-primary/5 aria-pressed:ring-2 aria-pressed:ring-primary/20 aria-pressed:hover:bg-primary/10"

function OptionContent({
  label,
  description,
  icon,
}: {
  label: string
  description: string
  icon: IconSvgElement
}) {
  return (
    <>
      <span className="flex items-center gap-2 text-sm font-medium">
        <HugeiconsIcon icon={icon} strokeWidth={2} />
        {label}
      </span>
      <span className="text-xs font-normal text-muted-foreground">
        {description}
      </span>
    </>
  )
}

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { mapMode, setMapMode } = useMapMode()

  const handleThemeChange = (value: string[]) => {
    const next = value[0]

    if (next === "system" || next === "light" || next === "dark") {
      setTheme(next)
    }
  }

  const handleMapModeChange = (value: string[]) => {
    const next = value[0]

    if (next === "flat" || next === "globe") {
      setMapMode(next)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
      <Tabs defaultValue="appearance" className="flex flex-col gap-3">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage appearance, notifications, and realtime connection.
            </p>
          </div>
          <TabsList className="grid w-full grid-cols-3 sm:w-fit">
            <TabsTrigger
              value="appearance"
              className="px-1 text-xs sm:px-2 sm:text-sm"
            >
              <HugeiconsIcon
                icon={PaintBrush01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="px-1 text-xs sm:px-2 sm:text-sm"
            >
              <HugeiconsIcon
                icon={Notification01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="realtime"
              className="px-1 text-xs sm:px-2 sm:text-sm"
            >
              <HugeiconsIcon
                icon={Wifi01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Realtime
            </TabsTrigger>
          </TabsList>
        </header>

        <TabsContent
          value="appearance"
          keepMounted
          className="flex flex-col gap-3"
        >
          <Card size="sm">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose the color theme used across the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet className="min-w-0">
                <FieldLegend className="sr-only">Theme</FieldLegend>
                <ToggleGroup
                  value={[theme]}
                  onValueChange={handleThemeChange}
                  variant="outline"
                  spacing={3}
                  className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
                >
                  {THEME_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className={OPTION_ITEM_CLASS}
                    >
                      <OptionContent
                        label={option.label}
                        description={option.description}
                        icon={option.icon}
                      />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Map mode</CardTitle>
              <CardDescription>
                Choose how the dashboard map is rendered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet className="min-w-0">
                <FieldLegend className="sr-only">Map mode</FieldLegend>
                <ToggleGroup
                  value={[mapMode]}
                  onValueChange={handleMapModeChange}
                  variant="outline"
                  spacing={3}
                  className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {MAP_MODE_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className={OPTION_ITEM_CLASS}
                    >
                      <OptionContent
                        label={option.label}
                        description={option.description}
                        icon={option.icon}
                      />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          keepMounted
          className="flex flex-col gap-3"
        >
          <Card size="sm">
            <CardHeader>
              <CardTitle>Push notifications</CardTitle>
              <CardDescription>
                Daftarkan token Firebase Cloud Messaging (FCM) perangkat ini
                agar menerima notifikasi event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="realtime"
          keepMounted
          className="flex flex-col gap-3"
        >
          <Card size="sm">
            <CardHeader>
              <CardTitle>WebSocket connection</CardTitle>
              <CardDescription>
                Koneksi realtime terbuka otomatis setelah login. Tiket dibuat
                ulang setiap kali koneksi terputus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealtimeConnectionSettings />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Ticket inspector</CardTitle>
              <CardDescription>
                Utilitas manual untuk memeriksa tiket. Koneksi realtime utama
                membuat tiket sendiri secara otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealtimeTicketSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
