# API Contract - Devices

Dokumen ini adalah kontrak API untuk kebutuhan frontend. Semua endpoint berada di bawah base URL:

```
/api/v1
```

## Konvensi

### Header

| Header | Wajib | Keterangan |
| --- | --- | --- |
| `Content-Type: application/json` | Ya, untuk request ber-body | |
| `Authorization: Bearer <access_token>` | Ya, pada endpoint terproteksi | |

### Format Response

Response sukses selalu dibungkus `data`:

```json
{
  "data": {}
}
```

Response list dibungkus `data` dan disertai `meta` (pagination):

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
    "code": "not_found",
    "message": "Device tidak ditemukan"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type DeviceStatus = "online" | "offline";

interface Device {
  id: string; // UUID internal
  device_id: string; // kode unik device (3-64 char, [A-Za-z0-9._-])
  name: string;
  location_name: string;
  latitude: number | null; // -90..90
  longitude: number | null; // -180..180
  status: DeviceStatus;
  firmware_version: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

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

type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN";

interface DeviceStatusDetail {
  device: Device;
  status: DeviceStatus;
  last_seen_at: string | null;
  environment: EnvironmentTelemetry | null;
  fire: FireTelemetry | null;
  risk_level: RiskLevel;
  server_time: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

## Endpoint

### 1. Daftar Device

```
GET /devices
```

Autentikasi: Bearer access token (semua role).

#### Query Parameters

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `page` | integer | Tidak | Halaman (default `1`) |
| `per_page` | integer | Tidak | Jumlah per halaman (default `20`, maksimal `100`) |

#### Response `200 OK`

```json
{
  "data": [
    {
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

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `500` | `internal_error` | Kesalahan server |

---

### 2. Tambah Device

```
POST /devices
```

Autentikasi: Bearer access token (khusus `admin`).

#### Request Body

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `device_id` | string | Tidak | Kode unik, pola `^[A-Za-z0-9._-]{3,64}$`. Jika kosong, backend membuat ID otomatis berformat `FFF-XXXXXXXX` |
| `name` | string | Tidak | Nama device |
| `location_name` | string | Tidak | Nama lokasi |
| `latitude` | number | Tidak | -90 sampai 90 |
| `longitude` | number | Tidak | -180 sampai 180 |
| `firmware_version` | string | Tidak | Versi firmware |

```json
{
  "device_id": "FFF-KTG-001",
  "name": "Ketapang Ridge Station",
  "location_name": "Ketapang, Kalimantan Barat",
  "latitude": -1.84,
  "longitude": 109.98,
  "firmware_version": "1.2.0"
}
```

#### Response `201 Created`

```json
{
  "data": {
    "id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "device_id": "FFF-KTG-001",
    "name": "Ketapang Ridge Station",
    "location_name": "Ketapang, Kalimantan Barat",
    "latitude": -1.84,
    "longitude": 109.98,
    "status": "offline",
    "firmware_version": "1.2.0",
    "last_seen_at": null,
    "created_at": "2026-11-15T08:00:00Z",
    "updated_at": "2026-11-15T08:00:00Z"
  }
}
```

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_request` | Payload device tidak valid |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `403` | `forbidden` | Role tidak memiliki akses |
| `409` | `duplicate_device` | `device_id` sudah terdaftar |
| `422` | `validation_error` | `device_id`, `latitude`, atau `longitude` tidak valid |
| `500` | `internal_error` | Kesalahan server |

---

### 3. Detail Device

```
GET /devices/{deviceID}
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`), bukan UUID internal.

#### Response `200 OK`

```json
{
  "data": {
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
  }
}
```

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 4. Ubah Device

```
PATCH /devices/{deviceID}
```

Autentikasi: Bearer access token (khusus `admin`).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

#### Request Body

Semua field opsional, minimal satu field terisi.

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `name` | string | Tidak | Nama device |
| `location_name` | string | Tidak | Nama lokasi |
| `latitude` | number | Tidak | -90 sampai 90 |
| `longitude` | number | Tidak | -180 sampai 180 |
| `firmware_version` | string | Tidak | Versi firmware |

```json
{
  "name": "Ketapang Ridge Station Updated",
  "firmware_version": "1.3.0"
}
```

#### Response `200 OK`

```json
{
  "data": {
    "id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "device_id": "FFF-KTG-001",
    "name": "Ketapang Ridge Station Updated",
    "location_name": "Ketapang, Kalimantan Barat",
    "latitude": -1.84,
    "longitude": 109.98,
    "status": "online",
    "firmware_version": "1.3.0",
    "last_seen_at": "2026-11-15T03:20:00Z",
    "created_at": "2026-11-01T08:00:00Z",
    "updated_at": "2026-11-15T08:30:00Z"
  }
}
```

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_request` | Payload device tidak valid |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `403` | `forbidden` | Role tidak memiliki akses |
| `404` | `not_found` | Device tidak ditemukan |
| `422` | `validation_error` | Tidak ada field yang diubah atau `latitude`/`longitude` tidak valid |
| `500` | `internal_error` | Kesalahan server |

---

### 5. Hapus Device

```
DELETE /devices/{deviceID}
```

Autentikasi: Bearer access token (khusus `admin`).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `403` | `forbidden` | Role tidak memiliki akses |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 6. Status & Telemetri Terbaru Device

```
GET /devices/{deviceID}/status
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

Mengembalikan status device beserta telemetri lingkungan dan api/asap terbaru, serta tingkat risiko yang dihitung.

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
    "status": "online",
    "last_seen_at": "2026-11-15T03:20:00Z",
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
    "risk_level": "NORMAL",
    "server_time": "2026-11-15T03:20:05Z"
  }
}
```

`environment` dan `fire` bisa `null` jika belum ada telemetri.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

## Catatan untuk Frontend

- `device_id` (kode unik, misal `FFF-KTG-001`) berbeda dengan `id` (UUID internal). Endpoint CRUD memakai `deviceID` = kode unik sebagai path parameter.
- `latitude`, `longitude`, dan `last_seen_at` bernilai `null` atau bisa tidak muncul pada response (field nullable).
- Pada telemetri, `device_id` merujuk ke UUID internal device, bukan kode `device_id`.
- `temperature` dan `humidity` bisa `null` saat sensor DHT11 error.
- `risk_level` bernilai `UNKNOWN` saat data risiko belum tersedia (belum ada telemetri).
- List device ter-paginasi: gunakan `page` dan `per_page`; baca `meta.total` untuk total data.
- Role yang tersedia: `admin`, `petugas`, `viewer`. Endpoint tulis device (POST/PATCH/DELETE) hanya untuk `admin`.
