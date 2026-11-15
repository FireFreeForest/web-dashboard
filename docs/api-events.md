# API Contract - Events

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait event risiko (deteksi api, asap, suhu, dan lain-lain). Semua endpoint berada di bawah base URL:

```
/api/v1
```

Endpoint pembacaan (`GET`) dapat diakses semua role. `acknowledge` hanya untuk `admin` dan `petugas`. `resolve` **khusus `petugas`** (admin tidak termasuk).

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

Response list menambahkan `meta`:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 0
  }
}
```

Response error selalu berbentuk:

```json
{
  "error": {
    "code": "invalid_state",
    "message": "Event tidak berada pada status active"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type EventType =
  | "FIRE_DETECTED"
  | "SMOKE_DETECTED"
  | "TEMPERATURE_HIGH"
  | "SOIL_DRY"
  | "DEVICE_OFFLINE"
  | "SENSOR_ERROR";

type Severity = "error" | "warning" | "critical";

type EventStatus = "active" | "acknowledged" | "resolved";

interface Event {
  id: string; // UUID
  device_id: string; // UUID internal device, bukan kode device_id
  event_type: EventType;
  severity: Severity;
  source: string;
  message: string;
  status: EventStatus;
  metadata: Record<string, unknown> | null; // object opsional
  triggered_at: string;
  acknowledged_by: string | null; // UUID user yang acknowledge
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface ListMeta {
  page: number;
  per_page: number;
  total: number;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

Catatan: `Event` tidak memiliki field `updated_at`. `metadata`, `acknowledged_by`, `acknowledged_at`, dan `resolved_at` bisa `null` atau tidak muncul.

## Endpoint

### 1. Daftar Event

```
GET /events
```

Autentikasi: Bearer access token (semua role).

Mengembalikan daftar event ter-paginasi, diurutkan `triggered_at` menurun (terbaru lebih dulu).

#### Query Parameters

| Field        | Tipe    | Wajib | Keterangan                                                |
| ------------ | ------- | ----- | --------------------------------------------------------- |
| `severity`   | string  | Tidak | `error`, `warning`, atau `critical`                       |
| `status`     | string  | Tidak | `active`, `acknowledged`, atau `resolved`                 |
| `event_type` | string  | Tidak | Salah satu nilai `EventType`                              |
| `device_id`  | string  | Tidak | Kode unik device (contoh `FFF-KTG-001`)                   |
| `from`       | string  | Tidak | Batas bawah `triggered_at`, RFC3339 (inklusif)            |
| `to`         | string  | Tidak | Batas atas `triggered_at`, RFC3339 (inklusif)             |
| `page`       | integer | Tidak | Halaman (default `1`)                                     |
| `per_page`   | integer | Tidak | Jumlah per halaman (default `20`, maksimal `100`)         |

Jika `device_id` diberikan tetapi tidak ditemukan, response `404 not_found`.

Contoh: `GET /events?status=active&severity=critical&page=1&per_page=20`

#### Response `200 OK`

```json
{
  "data": [
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
      "acknowledged_by": null,
      "acknowledged_at": null,
      "resolved_at": null,
      "created_at": "2026-11-15T03:20:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

#### Error

| Status | Code             | Keterangan                                     |
| ------ | ---------------- | ---------------------------------------------- |
| `400`  | `invalid_time`   | Format waktu `from` atau `to` tidak RFC3339    |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada               |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa      |
| `404`  | `not_found`      | `device_id` pada filter tidak ditemukan        |
| `500`  | `internal_error` | Kesalahan server                               |

---

### 2. Detail Event

```
GET /events/{eventID}
```

Autentikasi: Bearer access token (semua role).

`eventID` adalah UUID internal event (bukan `event_type` atau nama lain).

#### Response `200 OK`

```json
{
  "data": {
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
    "acknowledged_by": null,
    "acknowledged_at": null,
    "resolved_at": null,
    "created_at": "2026-11-15T03:20:00Z"
  }
}
```

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `400`  | `invalid_id`     | `eventID` bukan UUID valid                |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Event tidak ditemukan                     |
| `500`  | `internal_error` | Kesalahan server                          |

---

### 3. Acknowledge Event

```
POST /events/{eventID}/acknowledge
```

Autentikasi: Bearer access token, role `admin` atau `petugas`.

`eventID` adalah UUID internal event.

Menandai event sebagai `acknowledged`. Hanya bisa dilakukan saat status `active`. Tidak ada request body.

#### Response `200 OK`

Mengembalikan event yang sudah diperbarui (`status` menjadi `acknowledged`, `acknowledged_by` dan `acknowledged_at` terisi).

```json
{
  "data": {
    "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
    "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "event_type": "FIRE_DETECTED",
    "severity": "critical",
    "source": "flame_sensor",
    "message": "Api terdeteksi di area pantauan",
    "status": "acknowledged",
    "metadata": {
      "flame_level": 900,
      "smoke_level": 180
    },
    "triggered_at": "2026-11-15T03:20:00Z",
    "acknowledged_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
    "acknowledged_at": "2026-11-15T03:25:00Z",
    "resolved_at": null,
    "created_at": "2026-11-15T03:20:00Z"
  }
}
```

#### Error

| Status | Code             | Keterangan                                            |
| ------ | ---------------- | ----------------------------------------------------- |
| `400`  | `invalid_id`     | `eventID` bukan UUID valid                            |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada                      |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa             |
| `403`  | `forbidden`      | Role bukan `admin`/`petugas`                          |
| `404`  | `not_found`      | Event tidak ditemukan                                 |
| `409`  | `invalid_state`  | Event tidak berstatus `active` (sudah diproses)       |
| `500`  | `internal_error` | Kesalahan server                                      |

---

### 4. Resolve Event

```
POST /events/{eventID}/resolve
```

Autentikasi: Bearer access token, **khusus role `petugas`** (admin tidak termasuk).

`eventID` adalah UUID internal event.

Menutup event (`status` menjadi `resolved`). Tidak ada request body.

#### Response `200 OK`

Mengembalikan event yang sudah diperbarui (`status` menjadi `resolved`, `resolved_at` terisi).

```json
{
  "data": {
    "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
    "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "event_type": "FIRE_DETECTED",
    "severity": "critical",
    "source": "flame_sensor",
    "message": "Api terdeteksi di area pantauan",
    "status": "resolved",
    "metadata": {
      "flame_level": 900,
      "smoke_level": 180
    },
    "triggered_at": "2026-11-15T03:20:00Z",
    "acknowledged_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
    "acknowledged_at": "2026-11-15T03:25:00Z",
    "resolved_at": "2026-11-15T03:40:00Z",
    "created_at": "2026-11-15T03:20:00Z"
  }
}
```

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `400`  | `invalid_id`     | `eventID` bukan UUID valid                |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `403`  | `forbidden`      | Role bukan `petugas`                      |
| `404`  | `not_found`      | Event tidak ditemukan                     |
| `409`  | `invalid_state`  | Event sudah `resolved` atau tidak bisa di-resolve |
| `500`  | `internal_error` | Kesalahan server                          |

## Matriks Permission

| Aksi                        | admin | petugas | viewer |
| --------------------------- | :---: | :-----: | :----: |
| Lihat daftar & detail event |  Ya   |   Ya    |   Ya   |
| Acknowledge event           |  Ya   |   Ya    | Tidak  |
| Resolve event               | Tidak |   Ya    | Tidak  |

## Catatan untuk Frontend

- `id` event adalah UUID; gunakan `eventID` = `id` sebagai path parameter (berbeda dengan device/command yang memakai kode unik).
- `device_id` pada event merujuk ke UUID internal device. Saat memfilter daftar event, gunakan kode unik `device_id` (contoh `FFF-KTG-001`) sebagai query param — backend akan menerjemahkannya.
- `metadata` adalah object bebas (JSON) dan bisa `null`/tidak muncul; isinya bergantung pada `event_type`.
- Alur status: `active` → `acknowledged` → `resolved`. `acknowledge` hanya dari `active`; `resolve` dari `active` atau `acknowledged`.
- Event aktif bisa otomatis di-`resolve` oleh backend saat kondisi kembali normal.
- Filter `from`/`to` memakai `triggered_at` (inklusif), bukan `created_at`/`received_at`.
- `event_type` diterima case-insensitive (backend menormalisasi ke uppercase); `severity` dan `status` dinormalisasi ke lowercase.
- Daftar event diurutkan `triggered_at` menurun (terbaru di halaman pertama).
- Role `resolve` khusus `petugas` (admin mendapat `403`). Perhatikan saat menampilkan tombol aksi berdasarkan role.
