# API Contract - Module Event

Dokumen ini adalah kontrak API modul **Event** untuk tim frontend. Sumber kebenaran utama tetap [OpenAPI spec](../api/openapi.yaml) yang dapat dibuka interaktif di `/docs` (Swagger UI).

- **Base URL:** `/api/v1`
- **Autentikasi:** semua endpoint wajib header `Authorization: Bearer <access_token>`
- **Content-Type:** `application/json`
- **Format waktu:** RFC3339 / ISO 8601 UTC, mis. `2026-11-21T08:30:00Z`

## Ringkasan Endpoint

| Method | Path | Akses | Deskripsi |
|---|---|---|---|
| GET | `/events` | semua role | Daftar event (dengan filter & pagination) |
| GET | `/events/:eventID` | semua role | Detail event + preview linimasa |
| GET | `/events/:eventID/timeline` | semua role | Linimasa lengkap event |
| POST | `/events/:eventID/acknowledge` | `admin`, `petugas` | Tandai event sedang ditangani |
| POST | `/events/:eventID/resolve` | `petugas` | Tutup / selesaikan event |

Role yang dikenal: `admin`, `petugas`, `viewer`. `viewer` hanya boleh membaca (GET).

## Envelope Respons

Semua respons sukses memakai envelope berikut.

**Objek tunggal:**

```json
{ "data": { } }
```

**Daftar (dengan pagination):**

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 42
  }
}
```

**Error:**

```json
{
  "error": {
    "code": "not_found",
    "message": "Event tidak ditemukan"
  }
}
```

---

## 1. GET `/events`

Daftar event, diurutkan `triggered_at` **descending** (terbaru dulu).

### Query Parameters

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `event_type` | string | - | Filter tipe event. Case-insensitive (client boleh kirim lowercase, server meng-uppercase). Lihat enum di bawah. |
| `severity` | string | - | `error` \| `warning` \| `critical` |
| `status` | string | - | `active` \| `acknowledged` \| `resolved` |
| `device_id` | string | - | **Kode perangkat** (mis. `FFF-A1B2C3D4`), bukan UUID internal. |
| `from` | string (RFC3339) | - | Batas bawah `triggered_at` (inklusif) |
| `to` | string (RFC3339) | - | Batas atas `triggered_at` (inklusif) |
| `page` | integer | `1` | Minimal `1`. Nilai tidak valid diabaikan. |
| `per_page` | integer | `20` | Maksimal `100`. Nilai tidak valid diabaikan. |

Enum `event_type`: `FIRE_DETECTED`, `SMOKE_DETECTED`, `TEMPERATURE_HIGH`, `SOIL_DRY`, `DEVICE_OFFLINE`, `SENSOR_ERROR`, `LOW_BATTERY`.

### Contoh Request

```
GET /api/v1/events?status=active&severity=critical&from=2026-11-01T00:00:00Z&page=1&per_page=20
Authorization: Bearer <access_token>
```

### Contoh Respons `200`

```json
{
  "data": [
    {
      "id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
      "device_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "device": {
        "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        "device_id": "FFF-A1B2C3D4",
        "name": "Blok A - Pos 1",
        "location_name": "Hutan Blok A",
        "latitude": -6.2,
        "longitude": 106.8,
        "status": "online",
        "firmware_version": "1.2.0",
        "last_seen_at": "2026-11-21T08:29:50Z",
        "online_since": "2026-11-21T06:00:00Z",
        "uptime_seconds": 8990,
        "created_at": "2026-10-01T00:00:00Z",
        "updated_at": "2026-11-21T08:29:50Z"
      },
      "event_type": "FIRE_DETECTED",
      "severity": "critical",
      "source": "flame_sensor",
      "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
      "status": "active",
      "metadata": {
        "temperature": 32.5,
        "humidity": 60,
        "soil_moisture": 850,
        "flame_detected": true,
        "flame_level": 120,
        "smoke_level": 180,
        "pump": false,
        "battery_percentage": 18,
        "battery_voltage": 3.45,
        "metadata_source": "command",
        "captured_at": "2026-11-21T08:30:00Z"
      },
      "triggered_at": "2026-11-21T08:30:00Z",
      "acknowledged_by": null,
      "acknowledged_at": null,
      "resolved_by": null,
      "resolved_at": null,
      "created_at": "2026-11-21T08:30:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 1 }
}
```

### Error

| Status | code | Kapan |
|---|---|---|
| `400` | `invalid_time` | `from` atau `to` bukan RFC3339 |
| `401` | `unauthorized` / `invalid_token` | Token tidak ada / tidak valid / kedaluwarsa |
| `404` | `not_found` | `device_id` pada filter tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

## 2. GET `/events/:eventID`

Detail satu event beserta **preview linimasa** (maksimal 5 entri terakhir, urut kronologis lama → baru).

### Path Parameter

| Parameter | Tipe | Keterangan |
|---|---|---|
| `eventID` | UUID | UUID internal event. Bukan valid → `400 invalid_id`. |

### Contoh Respons `200`

Respons adalah objek `Event` dengan tambahan `timeline_preview`, `timeline_total`, `timeline_has_more`:

```json
{
  "data": {
    "id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
    "device_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "device": { "...": "objek Device lengkap" },
    "event_type": "FIRE_DETECTED",
    "severity": "critical",
    "source": "flame_sensor",
    "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
    "status": "acknowledged",
    "metadata": {
      "temperature": 32.5,
      "humidity": 60,
      "soil_moisture": 850,
      "flame_detected": true,
      "flame_level": 120,
      "smoke_level": 180,
      "pump": false
    },
    "triggered_at": "2026-11-21T08:30:00Z",
    "acknowledged_by": "11111111-2222-3333-4444-555555555555",
    "acknowledged_at": "2026-11-21T08:31:10Z",
    "resolved_by": null,
    "resolved_at": null,
    "created_at": "2026-11-21T08:30:00Z",
    "timeline_preview": [
      {
        "id": 1,
        "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
        "kind": "CREATED",
        "title": "Api Terdeteksi",
        "description": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
        "level": "critical",
        "actor": { "type": "system", "name": "Sistem" },
        "metadata": { "event_type": "FIRE_DETECTED", "severity": "critical", "source": "flame_sensor", "status": "active" },
        "occurred_at": "2026-11-21T08:30:00Z"
      },
      {
        "id": 2,
        "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
        "kind": "NOTIFICATION",
        "title": "Peringatan Dikirim",
        "description": "Peringatan berhasil dikirim ke 3 perangkat.",
        "outcome": "sent",
        "level": "info",
        "actor": { "type": "system", "name": "Sistem" },
        "metadata": { "notification_type": "event", "channel": "fire_alerts_fire", "recipient_count": 3, "sent_count": 3, "invalid_count": 0, "reason": "delivered" },
        "occurred_at": "2026-11-21T08:30:01Z"
      },
      {
        "id": 5,
        "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
        "kind": "ACKNOWLEDGED",
        "title": "Event Ditangani",
        "description": "Budi menandai event sebagai ditangani.",
        "level": "success",
        "actor": {
          "type": "user",
          "id": "11111111-2222-3333-4444-555555555555",
          "name": "Budi",
          "role": "petugas"
        },
        "metadata": { "from_status": "active", "to_status": "acknowledged" },
        "occurred_at": "2026-11-21T08:31:10Z"
      }
    ],
    "timeline_total": 3,
    "timeline_has_more": false
  }
}
```

Catatan penting:
- `timeline_preview` **hanya sebagian** (maks 5 terakhir, sudah diurutkan naik). Untuk riwayat penuh gunakan endpoint timeline.
- `timeline_has_more = true` berarti masih ada entri lebih lama di luar preview.
- `timeline_total` adalah jumlah seluruh entri linimasa event tersebut.

### Error

| Status | code | Kapan |
|---|---|---|
| `400` | `invalid_id` | `eventID` bukan UUID valid |
| `404` | `not_found` | Event tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

## 3. GET `/events/:eventID/timeline`

Linimasa lengkap event, diurutkan **kronologis lama → baru** (`occurred_at ASC`). Cocok untuk halaman riwayat/detail dengan list penuh.

### Path Parameter

| Parameter | Tipe | Keterangan |
|---|---|---|
| `eventID` | UUID | UUID internal event |

### Query Parameters

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `include` | string | `all` | `all` atau `important`. `important` menyembunyikan entri notifikasi/reminder/eskalasi yang ber-`outcome = skipped`. Lihat tabel di bawah. |
| `page` | integer | `1` | Minimal `1` |
| `per_page` | integer | `20` | Maksimal `100` |

#### `include=important` vs `include=all`

`important` hanya membuang entri dengan **`kind` ∈ {`NOTIFICATION`, `REMINDER`, `ESCALATION`} DAN `outcome = "skipped"`**. Semua entri lain tetap tampil.

| Entri linimasa | `include=all` | `include=important` |
|---|---|---|
| `CREATED` | tampil | tampil |
| `ACKNOWLEDGED` | tampil | tampil |
| `RESOLVED` / `AUTO_RESOLVED` | tampil | tampil |
| `NOTIFICATION`/`REMINDER`/`ESCALATION` dengan outcome `sent`/`partial`/`failed` | tampil | tampil |
| `NOTIFICATION`/`REMINDER`/`ESCALATION` dengan outcome **`skipped`** | tampil | **disembunyikan** |

`outcome = skipped` berarti percobaan kirim yang **tidak jadi dilakukan** (FCM tidak aktif, severity di bawah ambang, tipe event difilter, atau tidak ada token penerima) — bukan kegagalan delivery sungguhan.

> Catatan: `timeline_preview` pada `GET /events/:eventID` dan `timeline_total` **tidak** memakai filter ini. `timeline_total` selalu dihitung dengan `include=all`. Jadi jika frontend menampilkan `include=important`, angka total di header detail bisa berbeda dengan jumlah entri yang ditampilkan.

### Contoh Request

```
GET /api/v1/events/6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c/timeline?include=all&page=1&per_page=50
Authorization: Bearer <access_token>
```

### Contoh Respons `200` (`include=all`)

Pada `include=all`, entri `skipped` tetap tampil. Jika memakai `include=important`, entri dengan `id: 2` di bawah tidak akan dikembalikan (lihat tabel perbandingan di atas).

```json
{
  "data": [
    {
      "id": 1,
      "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
      "kind": "CREATED",
      "title": "Api Terdeteksi",
      "description": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
      "level": "critical",
      "actor": { "type": "system", "name": "Sistem" },
      "metadata": { "event_type": "FIRE_DETECTED", "severity": "critical", "source": "flame_sensor", "status": "active" },
      "occurred_at": "2026-11-21T08:30:00Z"
    },
    {
      "id": 2,
      "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
      "kind": "NOTIFICATION",
      "title": "Peringatan Dilewati",
      "description": "Peringatan dilewati karena tidak ada token penerima.",
      "outcome": "skipped",
      "level": "warning",
      "actor": { "type": "system", "name": "Sistem" },
      "metadata": { "reason": "no_recipients" },
      "occurred_at": "2026-11-21T08:30:01Z"
    },
    {
      "id": 5,
      "event_id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
      "kind": "ACKNOWLEDGED",
      "title": "Event Ditangani",
      "description": "Budi menandai event sebagai ditangani.",
      "level": "success",
      "actor": {
        "type": "user",
        "id": "11111111-2222-3333-4444-555555555555",
        "name": "Budi",
        "role": "petugas"
      },
      "metadata": { "from_status": "active", "to_status": "acknowledged" },
      "occurred_at": "2026-11-21T08:31:10Z"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 3 }
}
```

### Error

| Status | code | Kapan |
|---|---|---|
| `400` | `invalid_id` | `eventID` bukan UUID valid |
| `401` | `unauthorized` / `invalid_token` | Token tidak ada / tidak valid |
| `404` | `not_found` | Event tidak ditemukan |
| `422` | `validation_error` | Nilai `include` selain `all` / `important` |
| `500` | `internal_error` | Kesalahan server |

---

## 4. POST `/events/:eventID/acknowledge`

Menandai event sebagai **sedang ditangani** (`active` → `acknowledged`). Hanya untuk role `admin` dan `petugas`.

Tidak ada request body. User yang menekan aksi diambil dari token dan dicatat sebagai `acknowledged_by`, serta menghasilkan entri linimasa `ACKNOWLEDGED`.

### Aturan State

- Event harus berstatus `active`.
- Jika event sudah `acknowledged` atau `resolved` → `409 invalid_state`.
- Jika ada pengguna lain lebih dulu mengubah status (race condition) → `409 invalid_state`.

### Contoh Request

```
POST /api/v1/events/6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c/acknowledge
Authorization: Bearer <access_token>
```

### Contoh Respons `200`

```json
{
  "data": {
    "id": "6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c",
    "device_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "device": { "...": "objek Device lengkap" },
    "event_type": "FIRE_DETECTED",
    "severity": "critical",
    "source": "flame_sensor",
    "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
    "status": "acknowledged",
    "metadata": {
      "temperature": 32.5,
      "humidity": 60,
      "soil_moisture": 850,
      "flame_detected": true,
      "flame_level": 120,
      "smoke_level": 180,
      "pump": false
    },
    "triggered_at": "2026-11-21T08:30:00Z",
    "acknowledged_by": "11111111-2222-3333-4444-555555555555",
    "acknowledged_at": "2026-11-21T08:31:10Z",
    "resolved_by": null,
    "resolved_at": null,
    "created_at": "2026-11-21T08:30:00Z"
  }
}
```

### Error

| Status | code | Kapan |
|---|---|---|
| `400` | `invalid_id` | `eventID` bukan UUID valid |
| `401` | `unauthorized` / `invalid_token` | Token tidak ada / tidak valid |
| `403` | `forbidden` | Role `viewer` mencoba acknowledge |
| `404` | `not_found` | Event tidak ditemukan |
| `409` | `invalid_state` | Event tidak berstatus `active` / sudah diproses |
| `500` | `internal_error` | Kesalahan server |

---

## 5. POST `/events/:eventID/resolve`

Menutup event (`active`/`acknowledged` → `resolved`). Hanya untuk role `petugas`.

Tidak ada request body. User dari token dicatat sebagai `resolved_by`, dan dibuat entri linimasa `RESOLVED`.

### Aturan State

- Event boleh berada di `active` atau `acknowledged`.
- Jika sudah `resolved` → `409 invalid_state`.

### Contoh Request

```
POST /api/v1/events/6c3a7d9e-6f0b-4b1a-9c62-0a1d2e3f4b5c/resolve
Authorization: Bearer <access_token>
```

### Contoh Respons `200`

Sama dengan bentuk respons acknowledge, dengan `status: "resolved"` serta `resolved_by` dan `resolved_at` terisi.

### Error

| Status | code | Kapan |
|---|---|---|
| `400` | `invalid_id` | `eventID` bukan UUID valid |
| `401` | `unauthorized` / `invalid_token` | Token tidak ada / tidak valid |
| `403` | `forbidden` | Role selain `petugas` (termasuk `admin`) mencoba resolve |
| `404` | `not_found` | Event tidak ditemukan |
| `409` | `invalid_state` | Event sudah `resolved` / tidak dapat di-resolve |
| `500` | `internal_error` | Kesalahan server |

---

## Acknowledge vs Resolve

Dua aksi ini berbeda maknanya. Jangan gunakan keduanya secara bergantian.

| | **Acknowledge** (`POST /acknowledge`) | **Resolve** (`POST /resolve`) |
|---|---|---|
| Arti | "Sedang ditangani" / dikonfirmasi | "Selesai" / kasus ditutup |
| Role | `admin`, `petugas` | **hanya `petugas`** (admin tidak boleh) |
| Transisi status | `active` → `acknowledged` | `active`/`acknowledged` → `resolved` |
| Field yang diisi | `acknowledged_by`, `acknowledged_at` | `resolved_by`, `resolved_at` |
| Entri linimasa | `ACKNOWLEDGED` | `RESOLVED` |
| Efek notifikasi | **menghentikan** reminder/eskalasi FCM berulang (worker hanya memproses event `status = active`) | menutup event permanen |
| Auto-resolve sistem | masih mungkin terjadi (sistem menutup `active` maupun `acknowledged`) | tidak berlaku lagi |
| Bisa diulang | tidak; selain `active` → `409 invalid_state` | tidak; sudah `resolved` → `409 invalid_state` |

Ringkasnya: **acknowledge = "sudah ada yang menangani"** (event tetap terbuka), **resolve = "event ditutup"**.

Selain lewat API, event juga bisa ditutup oleh sistem (tanpa aksi pengguna):

- **Auto-resolve kondisi normal** → entri `AUTO_RESOLVED`, `reason: "condition_normal"`, aktor `system`, `resolved_by = null`.
- **Device kembali online** (untuk `DEVICE_OFFLINE`) → juga auto-resolve.
- **Baterai kembali normal** (untuk `LOW_BATTERY`, persentase ≥ ambang) → juga auto-resolve.

---

## Skema Data

### Event

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | string (uuid) | tidak | UUID internal event |
| `device_id` | string (uuid) | tidak | **UUID internal device**. Kode perangkat ada di `device.device_id`. |
| `device` | object `Device` | ya (di list/detail selalu disertakan) | Data device lengkap |
| `event_type` | string enum | tidak | `FIRE_DETECTED`, `SMOKE_DETECTED`, `TEMPERATURE_HIGH`, `SOIL_DRY`, `DEVICE_OFFLINE`, `SENSOR_ERROR`, `LOW_BATTERY` |
| `severity` | string enum | tidak | `error`, `warning`, `critical` |
| `source` | string | tidak | Sumber/pemicu event. **Bukan enum** — bisa berisi nilai bebas dari device. Lihat [Referensi nilai `source`](#referensi-nilai-source). |
| `message` | string | tidak | Deskripsi singkat event |
| `status` | string enum | tidak | `active`, `acknowledged`, `resolved` |
| `metadata` | object | tidak | Snapshot telemetri saat event dipicu (bisa `{}`). Lihat [Metadata](#metadata). |
| `triggered_at` | string (date-time) | tidak | Waktu event terpicu |
| `acknowledged_by` | string (uuid) | ya | User yang acknowledge |
| `acknowledged_at` | string (date-time) | ya | Waktu acknowledge |
| `resolved_by` | string (uuid) | ya | User yang resolve (null untuk auto-resolve sistem) |
| `resolved_at` | string (date-time) | ya | Waktu resolve |
| `created_at` | string (date-time) | tidak | Waktu record dibuat |

### EventTimeline

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | integer (int64) | tidak | ID entri linimasa (auto-increment) |
| `event_id` | string (uuid) | tidak | UUID event terkait |
| `kind` | string enum | tidak | `CREATED`, `NOTIFICATION`, `REMINDER`, `ESCALATION`, `ACKNOWLEDGED`, `RESOLVED`, `AUTO_RESOLVED` |
| `title` | string | tidak | Judul singkat entri |
| `description` | string | tidak | Penjelasan entri (berasal dari kolom `message` di DB) |
| `outcome` | string enum | ya | `sent`, `partial`, `failed`, `skipped` (khusus kind notifikasi/reminder/eskalasi) |
| `level` | string enum | tidak | `info`, `success`, `warning`, `error`, `critical`, `muted` |
| `actor` | object | tidak | Pelaku perubahan (lihat di bawah) |
| `metadata` | object | tidak | Metadata kontekstual per `kind` (bisa `{}` atau key tidak lengkap). Lihat [Metadata](#metadata). |
| `occurred_at` | string (date-time) | tidak | Waktu kejadian, dasar urutan linimasa |

### EventTimelineActor

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `type` | string enum | tidak | `system` (deteksi/notifikasi/auto-resolve) atau `user` (acknowledge/resolve) |
| `id` | string (uuid) | ya | UUID user; null/omit untuk `system` |
| `name` | string | tidak | Nama aktor (`Sistem` untuk system) |
| `role` | string enum | ya | `admin`, `petugas`, `viewer`; omit untuk `system` |

### Device (field yang dipakai frontend event)

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | string (uuid) | tidak | UUID internal |
| `device_id` | string | tidak | Kode perangkat, mis. `FFF-A1B2C3D4` |
| `name` | string | tidak | Nama device |
| `location_name` | string | tidak | Nama lokasi |
| `latitude` | number | ya | Koordinat |
| `longitude` | number | ya | Koordinat |
| `status` | string enum | tidak | `online`, `offline` |
| `firmware_version` | string | tidak | Versi firmware |
| `last_seen_at` | string (date-time) | ya | Terakhir terlihat |
| `online_since` | string (date-time) | ya | Sejak kapan online |
| `uptime_seconds` | integer (int64) | tidak | Uptime; `0` saat offline |
| `created_at` | string (date-time) | tidak | Dibuat |
| `updated_at` | string (date-time) | tidak | Diubah |

### Meta Pagination

| Field | Tipe | Keterangan |
|---|---|---|
| `page` | integer | Halaman saat ini |
| `per_page` | integer | Jumlah per halaman |
| `total` | integer (int64) | Total item sesuai filter |

### Error

| Field | Tipe | Keterangan |
|---|---|---|
| `error.code` | string | Kode error mesin (mis. `invalid_state`) |
| `error.message` | string | Pesan error untuk ditampilkan ke pengguna (Bahasa Indonesia) |

---

## Referensi nilai `source`

Field `source` disimpan sebagai `text` bebas di database (tanpa constraint). Nilainya berasal dari tiga kelompok:

### 1. Dibuat backend saat evaluasi kondisi (deterministik)

| `source` | `event_type` | Asal | Label readable yang disarankan |
|---|---|---|---|
| `flame_sensor` | `FIRE_DETECTED` | Risk engine, flame sensor | Sensor Api |
| `mq2_sensor` | `SMOKE_DETECTED` | Risk engine, sensor asap/gas | Sensor Asap (MQ-2) |
| `dht11` | `TEMPERATURE_HIGH` | Risk engine, sensor suhu | Sensor Suhu (DHT11) |
| `soil_sensor` | `SOIL_DRY` | Risk engine, sensor tanah | Sensor Kelembapan Tanah |
| `device_battery` | `LOW_BATTERY` | Risk engine, telemetri perangkat | Baterai Perangkat |
| `heartbeat` | `DEVICE_OFFLINE` | Sweeper heartbeat | Heartbeat Perangkat |

### 2. `SENSOR_ERROR` dari validasi payload backend (kode penyebab, bukan nama sensor)

| `source` | Arti | Label readable yang disarankan |
|---|---|---|
| `payload_decode` | Payload MQTT bukan JSON valid | Payload Tidak Valid |
| `device_id_mismatch` | `device_id` payload ≠ topik MQTT | ID Perangkat Tidak Cocok |
| `payload_incomplete` | Field sensor wajib tidak ada | Data Sensor Tidak Lengkap |
| `value_out_of_range` | Nilai sensor di luar rentang | Nilai Sensor Tidak Valid |
| `invalid_event_type` | `event_type` dari device tak dikenal | Tipe Event Tidak Dikenal |

### 3. Passthrough dari perangkat (bebas / tidak bisa dipetakan pasti)

Event kiriman device (MQTT `/event`) memakai `source` apa adanya dari payload. Jika device tidak mengirim `source`, backend mengisi `"device"`.

Konsekuensinya:
- Pasangan `(event_type, source)` **tidak selalu tetap**. Contoh: `SENSOR_ERROR` bisa ber-`source` `dht11` (dilaporkan device) atau `payload_decode` (validasi backend).
- `source` bisa berupa string bebas, kosong (`""` untuk data lama), atau `"device"`.

### Contoh mapping frontend (TypeScript)

Gunakan fallback berlapis: `source` → `event_type` → label generik. Jangan pernah menampilkan `source` mentah ke pengguna.

```ts
const SOURCE_LABELS: Record<string, string> = {
  flame_sensor: "Sensor Api",
  mq2_sensor: "Sensor Asap (MQ-2)",
  dht11: "Sensor Suhu (DHT11)",
  soil_sensor: "Sensor Kelembapan Tanah",
  device_battery: "Baterai Perangkat",
  heartbeat: "Heartbeat Perangkat",
  payload_decode: "Payload Tidak Valid",
  device_id_mismatch: "ID Perangkat Tidak Cocok",
  payload_incomplete: "Data Sensor Tidak Lengkap",
  value_out_of_range: "Nilai Sensor Tidak Valid",
  invalid_event_type: "Tipe Event Tidak Dikenal",
  device: "Perangkat",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  FIRE_DETECTED: "Api Terdeteksi",
  SMOKE_DETECTED: "Asap Terdeteksi",
  TEMPERATURE_HIGH: "Suhu Tinggi",
  SOIL_DRY: "Tanah Kering",
  DEVICE_OFFLINE: "Perangkat Offline",
  SENSOR_ERROR: "Error Sensor",
  LOW_BATTERY: "Baterai Lemah",
};

export function sourceLabel(event: {
  source?: string | null;
  event_type: string;
}): string {
  const src = (event.source ?? "").trim().toLowerCase();
  if (src && SOURCE_LABELS[src]) return SOURCE_LABELS[src];
  return EVENT_TYPE_LABELS[event.event_type] ?? "Sumber Tidak Diketahui";
}
```

> Nilai `source` juga tersedia di `timeline.metadata.source` pada entri `CREATED`.

---

## Metadata

Ada **dua metadata terpisah**: `event.metadata` dan `timeline[].metadata`. Isi dan aturannya berbeda.

### A. `event.metadata` — snapshot telemetri saat event dipicu

Berisi snapshot gabungan dari telemetri lingkungan, api/asap, dan perangkat (baterai/WiFi). Key yang tidak tersedia akan dihilangkan.

| Key | Tipe | Syarat muncul |
|---|---|---|
| `temperature` | number | Ada data environment dan `temperature` tidak `null` |
| `humidity` | number | Ada data environment dan `humidity` tidak `null` |
| `soil_moisture` | number | Ada data environment. **ADC mentah `0–1024`**, bukan persen |
| `flame_detected` | boolean | Ada data fire |
| `flame_level` | number | Ada data fire dan `flame_level` tidak `null` |
| `smoke_level` | number | Ada data fire. **ADC mentah `0–1024`**, bukan persen |
| `pump` | boolean | Ada data fire |
| `firmware_version` | string | Ada data perangkat dan tidak kosong |
| `wifi_rssi` | number | Ada data perangkat dan `wifi_rssi` tidak `null` |
| `battery_voltage` | number | Ada data perangkat dan `battery_voltage` tidak `null` |
| `battery_percentage` | number | Ada data perangkat dan `battery_percentage` tidak `null` |
| `metadata_source` | string | Selalu ada. `command` bila snapshot didahului `GET_ALL_TELEMETRY` yang di-ack, `cache` bila memakai cache terakhir |
| `captured_at` | string (date-time) | Selalu ada. Waktu snapshot diambil |
| `command_id` | string | Ada bila refresh telemetri (`GET_ALL_TELEMETRY`) dikirim |

Field telemetri yang **tidak** masuk metadata: `buzzer`, `id`, `device_id`, `recorded_at`, `received_at`, `sample_count`.

Kapan berisi vs `{}`:

| Sumber event | `event.metadata` |
|---|---|
| `FIRE_DETECTED`, `SMOKE_DETECTED`, `TEMPERATURE_HIGH`, `SOIL_DRY`, `LOW_BATTERY` (evaluasi kondisi backend) | Berisi snapshot di atas (subset sesuai ketersediaan) |
| `DEVICE_OFFLINE` (sweeper heartbeat) | `{ "metadata_source": "cache", "captured_at": ... }` (perangkat offline tidak bisa ditanya) |
| `SENSOR_ERROR` (validasi payload backend) | Snapshot dengan `metadata_source` `command`/`cache` |
| Event kiriman device via MQTT `/event` | Snapshot dengan `metadata_source` `command`/`cache` |

Catatan penting:
- Metadata bersifat **immutable** — tidak berubah setelah event dibuat.
- Sebelum membuat event, backend mengirim `GET_ALL_TELEMETRY` dan menunggu ack perangkat (maksimal `TELEMETRY_REFRESH_TIMEOUT`, default 5 detik) agar snapshot segar; bila ack tidak datang, metadata memakai cache terakhir dan `metadata_source` bernilai `cache`. Refresh dibatasi per device (`TELEMETRY_REFRESH_THROTTLE`, default 30 detik).
- Nilainya adalah **"state terakhir yang diketahui"** dari cache (`ff:latest:<device>`, TTL 48 jam). Gunakan sebagai konteks indikatif, bukan bukti nilai saat trigger.
- Metadata selalu ada sebagai objek, bukan `null`. Minimal berisi `metadata_source` dan `captured_at`; key telemetri lain muncul bila datanya tersedia.

### B. `timeline[].metadata` — konteks per entri linimasa

Isinya bergantung pada `kind`:

| `kind` | Key yang mungkin ada |
|---|---|
| `CREATED` | `event_type`, `severity`, `source`, `status` |
| `NOTIFICATION` | `notification_type: "event"`, `channel`, `recipient_count`, `sent_count`, `invalid_count`, `reason`, (`error` bila gagal) |
| `REMINDER` / `ESCALATION` | `notification_type: "fire_reminder"` atau `"fire_escalation"`, `channel`, `recipient_count`, `sent_count`, `invalid_count`, `reason`, (`error`) |
| `REMINDER`/`ESCALATION` hasil backfill migrasi | `historical: true`, `notification_type` (tanpa `channel`/`count`) |
| `ACKNOWLEDGED` | `from_status`, `to_status` |
| `RESOLVED` | `from_status`, `to_status`, `reason: "manual"` |
| `AUTO_RESOLVED` | `from_status`, `to_status`, `reason: "condition_normal"`, `event_type` |

Nilai `reason` pada entri notifikasi:

| `reason` | Terkait `outcome` | Arti |
|---|---|---|
| `delivered` | `sent` | Terkirim ke semua penerima |
| `partial_delivery` | `partial` | Terkirim sebagian |
| `send_failed` | `failed` | Gagal kirim setelah ada percobaan |
| `no_delivery` | `failed` | Tidak ada yang terkirim |
| `fcm_disabled` | `skipped` | FCM tidak aktif |
| `severity_below_min` | `skipped` | Severity di bawah `FCM_MIN_SEVERITY` |
| `event_type_filtered` | `skipped` | `event_type` tidak ada di `FCM_EVENT_TYPES` |
| `no_recipients` | `skipped` | Tidak ada token penerima |

Nilai `channel`: `fire_alerts_fire` (FIRE_DETECTED), `fire_alerts_warning` (default), `fire_alerts_error` (SENSOR_ERROR/DEVICE_OFFLINE).

Catatan:
- **Key tidak selalu lengkap.** Pada jalur `skipped` karena FCM mati / tidak ada token, metadata bisa hanya berisi `{ "reason": "..." }` tanpa `channel`/`recipient_count`.
- `error` hanya ada jika pengiriman gagal (dipotong maks 500 karakter).
- Untuk data lama hasil backfill migrasi, entri reminder/eskalasi hanya punya `historical: true` dan `notification_type`.

### Contoh membaca metadata dengan aman (TypeScript)

```ts
type EventMetadata = {
  temperature?: number;
  humidity?: number;
  soil_moisture?: number;
  flame_detected?: boolean;
  flame_level?: number;
  smoke_level?: number;
  pump?: boolean;
  firmware_version?: string;
  wifi_rssi?: number;
  battery_voltage?: number;
  battery_percentage?: number;
  metadata_source?: "command" | "cache";
  captured_at?: string;
  command_id?: string;
};

export function hasTelemetry(meta: EventMetadata | null | undefined): boolean {
  return !!meta && Object.keys(meta).length > 0;
}

export function formatTemperature(meta: EventMetadata | null | undefined): string {
  return meta?.temperature != null ? `${meta.temperature}°C` : "-";
}

export function adcToPercent(raw: number | undefined): string {
  if (raw == null) return "-";
  return `${Math.round((raw / 1024) * 100)}%`;
}

export function formatBattery(meta: EventMetadata | null | undefined): string {
  return meta?.battery_percentage != null ? `${meta.battery_percentage}%` : "-";
}
```

---

## Referensi Kode Error

| Code | HTTP umum | Arti |
|---|---|---|
| `invalid_id` | 400 | UUID path tidak valid |
| `invalid_time` | 400 | Parameter `from`/`to` bukan RFC3339 |
| `unauthorized` | 401 | Header Authorization tidak ada |
| `invalid_token` | 401 | Token tidak valid / kedaluwarsa / role token rusak |
| `forbidden` | 403 | Role tidak punya akses aksi |
| `not_found` | 404 | Event (atau device pada filter) tidak ditemukan |
| `invalid_state` | 409 | Transisi status tidak valid (sudah di-ack/sudah resolved/race) |
| `validation_error` | 422 | Nilai query tidak valid (mis. `include`) |
| `internal_error` | 500 | Kesalahan server |

---

## Realtime (WebSocket)

Frontend sebaiknya tidak melakukan polling untuk pembaruan status event. Perubahan event dipublikasikan lewat WebSocket (lihat README bagian Realtime).

Tipe pesan terkait event:

| Type | Kapan |
|---|---|
| `event.created` | Event baru dibuat oleh sistem |
| `event.updated` | Event di-acknowledge oleh pengguna |
| `event.resolved` | Event di-resolve pengguna atau auto-resolve sistem |

Bentuk payload:

```json
{
  "type": "event.created",
  "device_id": "FFF-A1B2C3D4",
  "data": {
    "event": { "...": "objek Event lengkap termasuk device" },
    "device_id": "FFF-A1B2C3D4"
  },
  "ts": "2026-11-21T08:30:00Z"
}
```

Catatan:
- `data.event` memakai bentuk yang sama dengan response REST, termasuk objek `device` lengkap.
- Pada auto-resolve, `resolved_by` bernilai `null` dan linimasa mencatat entri `AUTO_RESOLVED` dengan aktor `system`.

---

## Alur Frontend yang Disarankan

1. **Daftar event:** `GET /events` dengan filter default (`status=active`) untuk papan monitoring; gunakan `event_type`/`severity` untuk tab filter.
2. **Buka detail:** `GET /events/:eventID` untuk header + preview linimasa.
3. **Riwayat penuh:** jika `timeline_has_more`, panggil `GET /events/:eventID/timeline?include=important&page=1&per_page=50` (atau `include=all` untuk audit lengkap). Ingat `meta.total` di sini mengikuti `include` yang dipakai, sedangkan `timeline_total` di detail selalu `all`.
4. **Tampilan:** label sumber pakai `sourceLabel(event)` (fallback `event_type`); angka `soil_moisture`/`smoke_level` adalah ADC mentah — konversi ke persen bila perlu. Jangan asumsikan `event.metadata` selalu terisi.
5. **Aksi:**
   - `admin`/`petugas` → tampilkan tombol **Tangani** (acknowledge) hanya saat `status === "active"`. Acknowledge menghentikan pengingat FCM berulang tetapi event tetap terbuka.
   - `petugas` → tampilkan tombol **Selesaikan** (resolve) saat `status` `active` atau `acknowledged`.
   - Tangani `409 invalid_state` dengan memuat ulang detail event (status mungkin sudah diubah pengguna lain).
6. **Realtime:** berlangganan `event.created`/`event.updated`/`event.resolved` untuk memperbarui list, badge, dan linimasa tanpa refresh manual.

Dokumentasi interaktif lengkap: `/docs` (Swagger UI).
