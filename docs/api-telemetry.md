# API Contract - Telemetry

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait data telemetri lingkungan dan api/asap. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Seluruh endpoint pada dokumen ini dapat diakses oleh semua role (`admin`, `petugas`, `viewer`) selama memiliki Bearer access token.

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
    "code": "invalid_time",
    "message": "Format waktu 'from' harus RFC3339"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN";

interface EnvironmentTelemetry {
  id: number;
  device_id: string; // UUID internal, bukan kode device_id
  temperature: number | null; // 0..60, hilang saat sensor DHT11 error
  humidity: number | null; // 0..100, hilang saat sensor DHT11 error
  soil_moisture: number; // 0..1023 (nilai mentah ADC)
  recorded_at: string;
  received_at: string;
}

interface FireTelemetry {
  id: number;
  device_id: string; // UUID internal, bukan kode device_id
  flame_detected: boolean;
  flame_level: number | null; // 0..1023 (nilai mentah ADC, opsional)
  smoke_level: number; // 0..1023 (nilai mentah sensor MQ-2)
  pump: boolean;
  buzzer: boolean;
  recorded_at: string;
  received_at: string;
}

interface LatestTelemetry {
  device: Device; // lihat api-devices.md
  environment: EnvironmentTelemetry | null;
  fire: FireTelemetry | null;
  risk_level: RiskLevel;
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

## Endpoint

### 1. Telemetri Terbaru

```
GET /devices/{deviceID}/telemetry/latest
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`), bukan UUID internal.

Mengembalikan telemetri lingkungan dan api/asap terbaru beserta tingkat risiko yang dihitung. Tidak ter-paginasi (satu objek per device).

#### Response `200 OK`

```json
{
  "data": {
    "device": {
      "id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "device_id": "FFF-KTG-001",
      "name": "Ketapang Ridge Station",
      "location_name": "Ketapang, Kalimantan Barat",
      "latitude": -1.84,
      "longitude": 109.98,
      "status": "online",
      "firmware_version": "1.2.0",
      "last_seen_at": "2026-11-15T03:20:00Z",
      "created_at": "2026-11-01T08:00:00Z",
      "updated_at": "2026-11-01T08:00:00Z"
    },
    "environment": {
      "id": 12345,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "temperature": 30.2,
      "humidity": 78.0,
      "soil_moisture": 540,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    "fire": {
      "id": 12346,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "flame_detected": false,
      "flame_level": 12,
      "smoke_level": 8,
      "pump": false,
      "buzzer": false,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    "risk_level": "NORMAL"
  }
}
```

`environment` dan `fire` bisa `null` jika belum ada telemetri. `risk_level` bernilai `UNKNOWN` saat data risiko belum tersedia.

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Device tidak ditemukan                    |
| `500`  | `internal_error` | Kesalahan server                          |

---

### 2. Riwayat Telemetri Lingkungan

```
GET /devices/{deviceID}/telemetry/environment
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

Mengembalikan riwayat telemetri lingkungan ter-paginasi, diurutkan `recorded_at` menurun (terbaru lebih dulu).

#### Query Parameters

| Field      | Tipe    | Wajib | Default | Keterangan                                          |
| ---------- | ------- | ----- | ------- | --------------------------------------------------- |
| `from`     | string  | Tidak | -       | Batas bawah `recorded_at`, format RFC3339 (inklusif) |
| `to`       | string  | Tidak | -       | Batas atas `recorded_at`, format RFC3339 (inklusif)  |
| `page`     | integer | Tidak | `1`     | Halaman, minimal 1                                  |
| `per_page` | integer | Tidak | `20`    | Jumlah per halaman, minimal 1, maksimal 100         |

Nilai `page < 1` menjadi 1, `per_page < 1` menjadi 20, `per_page > 100` menjadi 100.

Contoh: `GET /devices/FFF-KTG-001/telemetry/environment?from=2026-11-15T00%3A00%3A00Z&per_page=50`

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 12345,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "temperature": 30.2,
      "humidity": 78.0,
      "soil_moisture": 540,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    {
      "id": 12344,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "temperature": 30.0,
      "humidity": 77.5,
      "soil_moisture": 542,
      "recorded_at": "2026-11-15T03:15:00Z",
      "received_at": "2026-11-15T03:15:01Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2
  }
}
```

`temperature` dan `humidity` bisa `null` saat sensor DHT11 error.

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `400`  | `invalid_time`   | Format waktu `from` atau `to` tidak RFC3339 |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Device tidak ditemukan                    |
| `500`  | `internal_error` | Kesalahan server                          |

---

### 3. Riwayat Telemetri Api/Asap

```
GET /devices/{deviceID}/telemetry/fire
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

Mengembalikan riwayat telemetri api/asap ter-paginasi, diurutkan `recorded_at` menurun (terbaru lebih dulu).

#### Query Parameters

| Field      | Tipe    | Wajib | Default | Keterangan                                          |
| ---------- | ------- | ----- | ------- | --------------------------------------------------- |
| `from`     | string  | Tidak | -       | Batas bawah `recorded_at`, format RFC3339 (inklusif) |
| `to`       | string  | Tidak | -       | Batas atas `recorded_at`, format RFC3339 (inklusif)  |
| `page`     | integer | Tidak | `1`     | Halaman, minimal 1                                  |
| `per_page` | integer | Tidak | `20`    | Jumlah per halaman, minimal 1, maksimal 100         |

Nilai `page < 1` menjadi 1, `per_page < 1` menjadi 20, `per_page > 100` menjadi 100.

Contoh: `GET /devices/FFF-KTG-001/telemetry/fire?from=2026-11-15T00%3A00%3A00Z&to=2026-11-16T00%3A00%3A00Z`

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 12346,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "flame_detected": false,
      "flame_level": 12,
      "smoke_level": 8,
      "pump": false,
      "buzzer": false,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    {
      "id": 12345,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "flame_detected": false,
      "flame_level": null,
      "smoke_level": 9,
      "pump": false,
      "buzzer": false,
      "recorded_at": "2026-11-15T03:15:00Z",
      "received_at": "2026-11-15T03:15:01Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2
  }
}
```

`flame_level` bisa `null` (opsional).

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `400`  | `invalid_time`   | Format waktu `from` atau `to` tidak RFC3339 |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Device tidak ditemukan                    |
| `500`  | `internal_error` | Kesalahan server                          |

## Catatan untuk Frontend

- `device_id` pada telemetri merujuk ke UUID internal device, bukan kode `device_id`. Gunakan kode unik `deviceID` (contoh `FFF-KTG-001`) sebagai path parameter.
- `temperature` dan `humidity` bisa `null` saat sensor DHT11 error; `flame_level` juga `null` bila tidak tersedia.
- `risk_level` bernilai `UNKNOWN` saat data risiko belum ada (belum ada telemetri).
- Endpoint `latest` mengembalikan satu objek (tanpa `meta`), sedangkan `environment` dan `fire` mengembalikan list ter-paginasi dengan `meta`.
- Riwayat diurutkan `recorded_at` menurun (data terbaru di halaman pertama).
- Filter `from`/`to` bersifat inklusif dan memakai `recorded_at` (waktu terekam oleh perangkat), bukan `received_at` (waktu diterima server).
- Saat mengirim `from`/`to` di query string, encode titik dua (`:`) sebagai `%3A`; format harus RFC3339 UTC, contoh `2026-11-15T03:20:00Z`.
- Role yang tersedia: `admin`, `petugas`, `viewer`. Semua role dapat membaca telemetri.
