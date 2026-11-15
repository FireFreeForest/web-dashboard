# API Contract - Dashboard

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait ringkasan agregat dashboard (jumlah device, tingkat risiko, event aktif, dan event terbaru). Semua endpoint berada di bawah base URL:

```
/api/v1
```

Endpoint pada dokumen ini dapat diakses semua role (`admin`, `petugas`, `viewer`) selama memiliki Bearer access token.

## Konvensi

### Header

| Header                                 | Wajib                      | Keterangan                                    |
| -------------------------------------- | -------------------------- | --------------------------------------------- |
| `Content-Type: application/json`       | Ya, untuk request ber-body |                                               |
| `Authorization: Bearer <access_token>` | Ya                         | Wajib memakai access token user yang valid    |

### Format Response

Response sukses selalu dibungkus `data`:

```json
{
  "data": {}
}
```

Response error selalu berbentuk:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Token autentikasi diperlukan"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN";

type EventType =
  | "FIRE_DETECTED"
  | "SMOKE_DETECTED"
  | "TEMPERATURE_HIGH"
  | "SOIL_DRY"
  | "DEVICE_OFFLINE"
  | "SENSOR_ERROR";

type Severity = "error" | "warning" | "critical";

type EventStatus = "active" | "acknowledged" | "resolved";

interface DashboardSummary {
  devices: {
    total: number;
    online: number;
    offline: number;
  };
  risk: {
    counts: Record<RiskLevel, number>;
  };
  active_events: {
    total: number;
    by_severity: Record<Severity, number>;
  };
  recent_events: Event[];
}

interface Event {
  id: string; // UUID
  device_id: string; // UUID internal device, bukan kode device_id
  event_type: EventType;
  severity: Severity;
  source: string;
  message: string;
  status: EventStatus;
  metadata?: Record<string, unknown>; // object opsional, biasanya {} atau berisi detail sensor
  triggered_at: string;
  acknowledged_by?: string; // UUID user yang acknowledge, tidak muncul jika null
  acknowledged_at?: string; // tidak muncul jika null
  resolved_at?: string; // tidak muncul jika null
  created_at: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

Catatan: objek `Event` pada `recent_events` memakai aturan serialisasi yang sama dengan endpoint `/events`. Field yang nilainya `null` (`acknowledged_by`, `acknowledged_at`, `resolved_at`) tidak disertakan, sedangkan `metadata` dapat berupa object kosong atau berisi detail sesuai `event_type`.

## Endpoint

### 1. Ringkasan Dashboard

```
GET /dashboard/summary
```

Autentikasi: Bearer access token (semua role).

Mengembalikan satu objek ringkasan agregat. Tidak ada query parameter, tidak ter-paginasi, dan tidak memiliki `meta`.

Ringkasan yang dikembalikan:

- `devices`: jumlah seluruh device beserta status `online`/`offline`. Nilai `total` = `online` + `offline`.
- `risk.counts`: jumlah device per tingkat risiko terkini (`NORMAL`, `WASPADA`, `BAHAYA`, `DARURAT`, `UNKNOWN`). Kelima key selalu ada. Device yang belum memiliki data risiko dihitung sebagai `UNKNOWN`.
- `active_events`: jumlah event yang masih terbuka, yaitu event berstatus `active` **atau** `acknowledged`, dipecah per `severity`. Ketiga key (`error`, `warning`, `critical`) selalu ada.
- `recent_events`: maksimal 5 event terbaru dari semua status, diurutkan `triggered_at` menurun (terbaru lebih dulu).

#### Response `200 OK`

```json
{
  "data": {
    "devices": {
      "total": 12,
      "online": 9,
      "offline": 3
    },
    "risk": {
      "counts": {
        "NORMAL": 7,
        "WASPADA": 2,
        "BAHAYA": 1,
        "DARURAT": 1,
        "UNKNOWN": 1
      }
    },
    "active_events": {
      "total": 3,
      "by_severity": {
        "error": 0,
        "warning": 2,
        "critical": 1
      }
    },
    "recent_events": [
      {
        "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
        "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
        "event_type": "FIRE_DETECTED",
        "severity": "critical",
        "source": "flame_sensor",
        "message": "Api terdeteksi di area pantauan",
        "status": "active",
        "metadata": {
          "flame_level": 900,
          "smoke_level": 180
        },
        "triggered_at": "2026-11-15T03:20:00Z",
        "created_at": "2026-11-15T03:20:00Z"
      },
      {
        "id": "5a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
        "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
        "event_type": "SMOKE_DETECTED",
        "severity": "warning",
        "source": "mq2_sensor",
        "message": "Asap terdeteksi di area pantauan",
        "status": "acknowledged",
        "metadata": {
          "smoke_level": 210
        },
        "triggered_at": "2026-11-15T03:10:00Z",
        "acknowledged_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
        "acknowledged_at": "2026-11-15T03:12:00Z",
        "created_at": "2026-11-15T03:10:00Z"
      }
    ]
  }
}
```

`recent_events` dapat berupa array kosong (`[]`) bila belum ada event. `metadata`, `acknowledged_by`, `acknowledged_at`, dan `resolved_at` bisa tidak muncul.

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `500`  | `internal_error` | Kesalahan server                          |

## Matriks Permission

| Aksi                              | admin | petugas | viewer |
| --------------------------------- | :---: | :-----: | :----: |
| Melihat ringkasan dashboard       |  Ya   |   Ya    |   Ya   |

## Catatan untuk Frontend

- `devices.total` dihitung dari seluruh device yang terdaftar; `online` dan `offline` berasal dari status device saat ini.
- `risk.counts` selalu memiliki kelima key. `UNKNOWN` berarti device belum memiliki data risiko (misalnya belum pernah mengirim telemetri), bukan berarti device offline.
- Nilai risiko dihitung dari maksimal 1000 device terlama (`created_at` menaik). Jika jumlah device melebihi 1000, total `risk.counts` bisa lebih kecil dari `devices.total`.
- `active_events` menghitung event berstatus `active` **dan** `acknowledged`; event `resolved` tidak termasuk. Jangan menyamakan `active_events.total` dengan jumlah event berstatus `active` saja.
- `recent_events` maksimal 5 item dan mencakup semua status. Untuk daftar lengkap, gunakan endpoint `/events` (lihat `api-events.md`).
- `device_id` pada `recent_events` adalah UUID internal device, bukan kode unik `device_id` (contoh `FFF-KTG-001`).
- Field event yang bernilai `null` tidak disertakan pada response; gunakan pengecekan opsional saat membaca `acknowledged_by`, `acknowledged_at`, dan `resolved_at`.
- `metadata` adalah object bebas dan bisa `{}`; isinya bergantung pada `event_type`.
- Semua role dapat mengakses endpoint ini; tidak ada aksi tulis pada fitur dashboard.
