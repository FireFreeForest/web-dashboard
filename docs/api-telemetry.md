# API Contract - Telemetry

Dokumen ini adalah kontrak API untuk kebutuhan frontend: data terbaru dan riwayat telemetri lingkungan serta api/asap. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Seluruh endpoint pada dokumen ini dapat diakses oleh semua role: `admin`, `petugas`, dan `viewer`.

## Konvensi

### Header

| Header | Wajib | Keterangan |
| --- | --- | --- |
| `Authorization: Bearer <access_token>` | Ya | Access token user yang sedang login |
| `X-Request-ID` | Tidak | Jika dikirim, akan dikembalikan di response header |

Endpoint telemetri tidak menerima request body, sehingga `Content-Type` tidak diperlukan.

### Format Response

Response sukses selalu dibungkus `data`:

```json
{
  "data": {}
}
```

Response daftar (riwayat) menambahkan `meta`:

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

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-17T03:20:00Z`.

### Path Parameter `deviceID`

`deviceID` pada path adalah **kode device**, bukan UUID internal. Contoh: `FFF-ABCDEFGH`.

Kode device mengikuti pola `A-Za-z0-9._-` dengan panjang 3–64 karakter.

Di dalam response, field `device_id` pada baris telemetri adalah **UUID internal device**, berbeda dengan kode device pada path. Gunakan `data.device.device_id` dari endpoint terbaru atau daftar device bila frontend membutuhkan kode device.

## Tipe Data

```ts
type DeviceStatus = "online" | "offline";

type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN";

interface Device {
  id: string;
  device_id: string;
  name: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  status: DeviceStatus;
  firmware_version: string;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface EnvironmentTelemetry {
  id: number;
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number;
  recorded_at: string;
  received_at: string;
}

interface FireTelemetry {
  id: number;
  device_id: string;
  flame_detected: boolean;
  flame_level?: number | null;
  smoke_level: number;
  pump: boolean;
  buzzer: boolean;
  recorded_at: string;
  received_at: string;
}

interface LatestTelemetry {
  device: Device;
  environment: EnvironmentTelemetry | null;
  fire: FireTelemetry | null;
  risk_level: RiskLevel;
}

interface EnvironmentAggregatePoint {
  bucket_start: string;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number;
  sample_count: number;
}

interface FireAggregatePoint {
  bucket_start: string;
  flame_level: number | null;
  smoke_level: number;
  flame_detected_ratio: number;
  pump_on_ratio: number;
  buzzer_on_ratio: number;
  sample_count: number;
}

interface EnvironmentAggregate {
  device_id: string;
  from: string;
  to: string;
  interval_minutes: number;
  bucket_timezone: "Asia/Jakarta";
  points: EnvironmentAggregatePoint[];
}

interface FireAggregate {
  device_id: string;
  from: string;
  to: string;
  interval_minutes: number;
  bucket_timezone: "Asia/Jakarta";
  points: FireAggregatePoint[];
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

Catatan tipe data:

- `temperature` dan `humidity` bernilai `null` bila sensor DHT11 gagal membaca.
- `flame_level` dapat dihilangkan dari response bila tidak tersedia.
- `soil_moisture` adalah nilai ADC mentah `0–1023`, bukan persen.
- `smoke_level` adalah nilai ADC mentah `0–1023`, bukan persen.
- `recorded_at` adalah waktu pencatatan dari device. `received_at` adalah waktu data diterima backend.
- Rasio pada agregat api/asap bernilai `0..1`.

## Endpoint

### 1. Telemetri Terbaru

```
GET /devices/{deviceID}/telemetry/latest
```

Autentikasi: Bearer access token.

Mengembalikan detail device, sampel telemetri lingkungan terbaru, sampel telemetri api/asap terbaru, dan level risiko terkini.

#### Path Parameter

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `deviceID` | string | Ya | Kode device, contoh `FFF-ABCDEFGH` |

#### Response `200 OK`

```json
{
  "data": {
    "device": {
      "id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "device_id": "FFF-ABCDEFGH",
      "name": "Pos Pantau Sebanggau",
      "location_name": "Sebanggau, Palangka Raya",
      "latitude": -2.208,
      "longitude": 113.916,
      "status": "online",
      "firmware_version": "1.2.0",
      "last_seen_at": "2026-11-17T03:20:00Z",
      "created_at": "2026-11-01T08:00:00Z",
      "updated_at": "2026-11-17T03:20:00Z"
    },
    "environment": {
      "id": 10231,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "temperature": 28.4,
      "humidity": 64.2,
      "soil_moisture": 614,
      "recorded_at": "2026-11-17T03:20:00Z",
      "received_at": "2026-11-17T03:20:02Z"
    },
    "fire": {
      "id": 8821,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "flame_detected": false,
      "flame_level": 120,
      "smoke_level": 180,
      "pump": false,
      "buzzer": false,
      "recorded_at": "2026-11-17T03:20:00Z",
      "received_at": "2026-11-17T03:20:02Z"
    },
    "risk_level": "NORMAL"
  }
}
```

#### Perilaku

- `environment` bernilai `null` jika device belum pernah mengirim telemetri lingkungan.
- `fire` bernilai `null` jika device belum pernah mengirim telemetri api/asap.
- `risk_level` dihitung dari evaluasi telemetri terakhir. Nilainya `UNKNOWN` bila belum ada evaluasi risiko atau cache risiko sudah tidak tersedia.
- Endpoint tetap dapat mengembalikan sampel terakhir meskipun device sedang `offline`. Periksa `device.status` dan `device.last_seen_at` untuk menentukan kesegaran data.
- Nilai telemetri terbaru dapat berasal dari cache backend. Jika cache tidak tersedia, backend memakai sampel terakhir dari database.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 2. Riwayat Telemetri Lingkungan

```
GET /devices/{deviceID}/telemetry/environment
```

Autentikasi: Bearer access token.

Mengembalikan riwayat sampel telemetri lingkungan dengan urutan `recorded_at` menurun (terbaru lebih dulu).

#### Path Parameter

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `deviceID` | string | Ya | Kode device, contoh `FFF-ABCDEFGH` |

#### Query Parameter

| Field | Tipe | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `from` | string (RFC3339) | Tidak | - | Batas awal `recorded_at`, inklusif |
| `to` | string (RFC3339) | Tidak | - | Batas akhir `recorded_at`, inklusif |
| `page` | integer | Tidak | `1` | Halaman, minimal 1 |
| `per_page` | integer | Tidak | `20` | Jumlah per halaman, minimal 1, maksimal 100 |

Nilai `page` dan `per_page` di luar batas dinormalkan: `page < 1` menjadi 1, `per_page < 1` menjadi 20, `per_page > 100` menjadi 100. Nilai non-angka memakai default.

Jika `from` atau `to` tidak dikirim, batas tersebut diabaikan. Jika `from` lebih besar dari `to`, response berisi daftar kosong (tidak ada validasi tambahan).

#### Contoh Request

```
GET /devices/FFF-ABCDEFGH/telemetry/environment?from=2026-11-17T00:00:00Z&to=2026-11-17T06:00:00Z&page=1&per_page=20
```

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 10231,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "temperature": 28.4,
      "humidity": 64.2,
      "soil_moisture": 614,
      "recorded_at": "2026-11-17T03:20:00Z",
      "received_at": "2026-11-17T03:20:02Z"
    },
    {
      "id": 10230,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "temperature": 28.1,
      "humidity": 65.0,
      "soil_moisture": 620,
      "recorded_at": "2026-11-17T03:15:00Z",
      "received_at": "2026-11-17T03:15:02Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2
  }
}
```

#### Perilaku

- `meta.total` adalah jumlah seluruh sampel yang cocok dengan filter `from`/`to`, bukan jumlah pada halaman saat ini.
- Data diurutkan `recorded_at DESC`. Belum ada parameter urutan custom.
- `data` bernilai `[]` bila tidak ada sampel pada rentang tersebut.
- `device_id` pada setiap baris adalah UUID internal device, bukan kode device.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_time` | `from` atau `to` tidak kosong tetapi bukan RFC3339 |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 3. Riwayat Telemetri Api/Asap

```
GET /devices/{deviceID}/telemetry/fire
```

Autentikasi: Bearer access token.

Mengembalikan riwayat sampel telemetri api/asap dengan urutan `recorded_at` menurun (terbaru lebih dulu).

#### Path Parameter

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `deviceID` | string | Ya | Kode device, contoh `FFF-ABCDEFGH` |

#### Query Parameter

| Field | Tipe | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `from` | string (RFC3339) | Tidak | - | Batas awal `recorded_at`, inklusif |
| `to` | string (RFC3339) | Tidak | - | Batas akhir `recorded_at`, inklusif |
| `page` | integer | Tidak | `1` | Halaman, minimal 1 |
| `per_page` | integer | Tidak | `20` | Jumlah per halaman, minimal 1, maksimal 100 |

Aturan normalisasi dan filter sama dengan riwayat telemetri lingkungan.

#### Contoh Request

```
GET /devices/FFF-ABCDEFGH/telemetry/fire?from=2026-11-17T00:00:00Z&to=2026-11-17T06:00:00Z&page=1&per_page=20
```

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 8821,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "flame_detected": false,
      "flame_level": 120,
      "smoke_level": 180,
      "pump": false,
      "buzzer": false,
      "recorded_at": "2026-11-17T03:20:00Z",
      "received_at": "2026-11-17T03:20:02Z"
    },
    {
      "id": 8820,
      "device_id": "d8f1c2a4-6b3e-4f7a-9c21-5e8d0b7a1f34",
      "flame_detected": true,
      "flame_level": 760,
      "smoke_level": 540,
      "pump": true,
      "buzzer": true,
      "recorded_at": "2026-11-17T03:15:00Z",
      "received_at": "2026-11-17T03:15:02Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2
  }
}
```

#### Perilaku

- `meta.total` adalah jumlah seluruh sampel yang cocok dengan filter `from`/`to`.
- Data diurutkan `recorded_at DESC`.
- `data` bernilai `[]` bila tidak ada sampel pada rentang tersebut.
- `flame_level` dapat tidak ada pada response bila nilainya tidak tersedia.
- `smoke_level` adalah nilai ADC mentah `0–1023`, bukan persen.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_time` | `from` atau `to` tidak kosong tetapi bukan RFC3339 |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 4. Agregat Telemetri Lingkungan

```
GET /devices/{deviceID}/telemetry/environment/aggregate
```

Autentikasi: Bearer access token.

Mengelompokkan sampel telemetri lingkungan ke bucket interval menit dan mengembalikan rata-rata `temperature`, `humidity`, serta `soil_moisture`.

#### Path Parameter

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `deviceID` | string | Ya | Kode device, contoh `FFF-ABCDEFGH` |

#### Query Parameter

| Field | Tipe | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `from` | string (RFC3339) | Ya | - | Awal rentang, inklusif |
| `to` | string (RFC3339) | Ya | - | Akhir rentang, eksklusif |
| `interval` | integer | Tidak | `5` | Lebar bucket dalam menit, `1–1440` |

Batas validasi:

- `from` harus lebih awal dari `to`.
- Rentang maksimal 90 hari.
- Jumlah bucket maksimal 5000. Perbesar `interval` bila melebihi batas.
- Nilai `interval` non-angka atau di luar `1–1440` menghasilkan `422`.

#### Contoh Request

```
GET /devices/FFF-ABCDEFGH/telemetry/environment/aggregate?from=2026-11-17T00:00:00Z&to=2026-11-17T00:10:00Z&interval=5
```

#### Response `200 OK`

```json
{
  "data": {
    "device_id": "FFF-ABCDEFGH",
    "from": "2026-11-17T00:00:00Z",
    "to": "2026-11-17T00:10:00Z",
    "interval_minutes": 5,
    "bucket_timezone": "Asia/Jakarta",
    "points": [
      {
        "bucket_start": "2026-11-17T00:00:00Z",
        "temperature": 27.8,
        "humidity": 65.5,
        "soil_moisture": 610.5,
        "sample_count": 6
      },
      {
        "bucket_start": "2026-11-17T00:05:00Z",
        "temperature": 28.2,
        "humidity": 64.8,
        "soil_moisture": 604.0,
        "sample_count": 6
      }
    ]
  }
}
```

#### Perilaku

- Rentang data yang diagregasi adalah `recorded_at >= from` dan `recorded_at < to`.
- `points` diurutkan `bucket_start` menaik.
- Bucket tanpa sampel tidak dikembalikan.
- Bucket disejajarkan ke WIB (`Asia/Jakarta`), tetapi `bucket_start`, `from`, dan `to` dikirim dalam UTC.
- Bucket `2026-11-17T00:00:00Z` mencakup sampel dengan `recorded_at >= 2026-11-17T00:00:00Z` dan `< 2026-11-17T00:05:00Z`.
- `temperature` dan `humidity` bernilai `null` bila seluruh sampel pada bucket bernilai `null`.
- `soil_moisture` adalah rata-rata ADC mentah `0–1023`, bukan persen.
- `sample_count` adalah jumlah sampel pada bucket.
- Response agregat tidak memakai pagination dan tidak memiliki `meta`.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_time` | `from` atau `to` bukan RFC3339 |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `422` | `validation_error` | `from`/`to` kosong, rentang tidak valid, interval tidak valid, rentang lebih dari 90 hari, atau bucket lebih dari 5000 |
| `500` | `internal_error` | Kesalahan server |

Pesan `422` yang mungkin diterima:

- `from dan to wajib diisi`
- `from harus lebih awal dari to`
- `interval harus antara 1 dan 1440 menit`
- `Rentang waktu maksimal 90 hari`
- `Jumlah bucket maksimal 5000; perbesar interval`

---

### 5. Agregat Telemetri Api/Asap

```
GET /devices/{deviceID}/telemetry/fire/aggregate
```

Autentikasi: Bearer access token.

Mengelompokkan sampel telemetri api/asap ke bucket interval menit dan mengembalikan rata-rata level api/asap, rasio api terdeteksi, serta rasio pompa dan buzzer aktif.

#### Path Parameter

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `deviceID` | string | Ya | Kode device, contoh `FFF-ABCDEFGH` |

#### Query Parameter

| Field | Tipe | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `from` | string (RFC3339) | Ya | - | Awal rentang, inklusif |
| `to` | string (RFC3339) | Ya | - | Akhir rentang, eksklusif |
| `interval` | integer | Tidak | `5` | Lebar bucket dalam menit, `1–1440` |

Batas validasi sama dengan agregat lingkungan: rentang maksimal 90 hari, maksimal 5000 bucket, dan `from` harus lebih awal dari `to`.

#### Contoh Request

```
GET /devices/FFF-ABCDEFGH/telemetry/fire/aggregate?from=2026-11-17T00:00:00Z&to=2026-11-17T00:10:00Z&interval=5
```

#### Response `200 OK`

```json
{
  "data": {
    "device_id": "FFF-ABCDEFGH",
    "from": "2026-11-17T00:00:00Z",
    "to": "2026-11-17T00:10:00Z",
    "interval_minutes": 5,
    "bucket_timezone": "Asia/Jakarta",
    "points": [
      {
        "bucket_start": "2026-11-17T00:00:00Z",
        "flame_level": 180.5,
        "smoke_level": 220.0,
        "flame_detected_ratio": 0,
        "pump_on_ratio": 0,
        "buzzer_on_ratio": 0,
        "sample_count": 6
      },
      {
        "bucket_start": "2026-11-17T00:05:00Z",
        "flame_level": 640.0,
        "smoke_level": 510.0,
        "flame_detected_ratio": 0.5,
        "pump_on_ratio": 0.5,
        "buzzer_on_ratio": 0.5,
        "sample_count": 6
      }
    ]
  }
}
```

#### Perilaku

- Rentang data yang diagregasi adalah `recorded_at >= from` dan `recorded_at < to`.
- `points` diurutkan `bucket_start` menaik.
- Bucket tanpa sampel tidak dikembalikan.
- Bucket disejajarkan ke WIB (`Asia/Jakarta`), tetapi `bucket_start`, `from`, dan `to` dikirim dalam UTC.
- `flame_level` bernilai `null` bila seluruh sampel pada bucket tidak memiliki `flame_level`.
- `smoke_level` adalah rata-rata ADC mentah `0–1023`, bukan persen.
- `flame_detected_ratio`, `pump_on_ratio`, dan `buzzer_on_ratio` bernilai `0..1`. Nilai `0.5` berarti kondisi aktif pada setengah sampel di bucket tersebut.
- `sample_count` adalah jumlah sampel pada bucket.
- Response agregat tidak memakai pagination dan tidak memiliki `meta`.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_time` | `from` atau `to` bukan RFC3339 |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |
| `404` | `not_found` | Device tidak ditemukan |
| `422` | `validation_error` | `from`/`to` kosong, rentang tidak valid, interval tidak valid, rentang lebih dari 90 hari, atau bucket lebih dari 5000 |
| `500` | `internal_error` | Kesalahan server |

Pesan `422` sama dengan agregat lingkungan.

## Catatan untuk Frontend

- Gunakan `GET /devices/{deviceID}/telemetry/latest` untuk memuat kondisi awal node atau detail node.
- Gunakan endpoint riwayat untuk tabel/daftar sampel mentah, dan endpoint agregat untuk grafik time-series agar jumlah titik terkontrol.
- Selalu tangani `environment: null`, `fire: null`, `temperature: null`, `humidity: null`, dan `flame_level` yang tidak ada.
- Gunakan `recorded_at` sebagai sumbu waktu grafik. `received_at` hanya untuk audit keterlambatan pengiriman.
- Semua timestamp dalam UTC. Konversi ke WIB (`Asia/Jakarta`) di sisi UI bila diperlukan.
- `risk_level` dapat bernilai `UNKNOWN`; tampilkan sebagai status belum diketahui, bukan `NORMAL`.
- Data terbaru dapat berasal dari sampel lama. Cek `device.status` dan `device.last_seen_at` sebelum menampilkan indikator "real-time".
- Path memakai kode device (`FFF-ABCDEFGH`), sedangkan `device_id` pada baris telemetri adalah UUID internal.
- `soil_moisture` dan `smoke_level` adalah nilai ADC mentah. Jangan menampilkannya sebagai persen tanpa kalibrasi eksplisit.
