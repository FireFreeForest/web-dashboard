# API Contract - Realtime (WebSocket)

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait pembaruan data realtime (telemetri, event, risiko, status device, dan command) melalui WebSocket. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Fitur realtime memiliki **satu endpoint koneksi** (`GET /ws`). Karena browser tidak dapat mengirim header `Authorization` pada handshake WebSocket, backend menyediakan **endpoint bantu** `POST /realtime/ticket` untuk menukar Bearer access token menjadi tiket berumur pendek.

| Method | Path | Keterangan |
| --- | --- | --- |
| `POST` | `/realtime/ticket` | Buat tiket WebSocket sekali pakai (60 detik) |
| `GET` | `/ws?ticket=...` | Buka koneksi WebSocket |

Seluruh role (`admin`, `petugas`, `viewer`) dapat membuat tiket dan membuka koneksi. Backend tidak memfilter pesan berdasarkan role.

## Konvensi

### Header

| Header                                 | Wajib                               | Keterangan                                            |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `Authorization: Bearer <access_token>` | Ya, hanya untuk `POST /realtime/ticket` | Wajib memakai access token user yang valid        |
| `Content-Type: application/json`       | Tidak                               | Tiket tidak memerlukan request body                   |
| `Origin`                               | Tidak                               | Jika dikirim, harus termasuk origin yang diizinkan    |
| `X-Request-ID`                         | Tidak                               | Jika dikirim, akan dikembalikan di response header    |

Koneksi WebSocket **tidak** memakai header `Authorization`. Autentikasi dilakukan lewat query `ticket`.

### Format Response HTTP

Response sukses endpoint tiket dibungkus `data`:

```json
{
  "data": {}
}
```

Response error selalu berbentuk:

```json
{
  "error": {
    "code": "invalid_ticket",
    "message": "Tiket WebSocket tidak valid atau kedaluwarsa"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`. Nilai `ts` dari Go dapat menyertakan fraksi detik, contoh `2026-11-15T03:20:00.123456Z`.

### Format Pesan WebSocket

Setelah handshake berhasil, seluruh pesan dari server berupa **satu JSON object per frame teks** (bukan dibungkus `data`, bukan array). Format umum:

```json
{
  "type": "telemetry.fire",
  "device_id": "FFF-KTG-001",
  "data": {},
  "ts": "2026-11-15T03:20:00Z"
}
```

Aturan envelope:

- `type` selalu ada.
- `device_id` dan `data` dapat tidak muncul (`omitempty`) jika kosong.
- `ts` selalu diisi backend untuk pesan yang dipublikasikan; pesan `connected` tidak memiliki `ts`.
- Error tidak dikirim sebagai JSON setelah koneksi terbuka. Jika terjadi masalah, server menutup koneksi WebSocket.

## Tipe Data

```ts
type RealtimeEventType =
  | "connected"
  | "telemetry.environment"
  | "telemetry.fire"
  | "event.created"
  | "event.updated"
  | "event.resolved"
  | "risk.updated"
  | "device.status"
  | "command.issued"
  | "command.ack"
  | "command.timeout";

type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT";

type Severity = "error" | "warning" | "critical";

type EventType =
  | "FIRE_DETECTED"
  | "SMOKE_DETECTED"
  | "TEMPERATURE_HIGH"
  | "SOIL_DRY"
  | "DEVICE_OFFLINE"
  | "SENSOR_ERROR";

type EventStatus = "active" | "acknowledged" | "resolved";

type DeviceStatus = "online" | "offline";

type CommandStatus = "pending" | "sent" | "success" | "failed" | "timeout";

type CommandAction = "SET_PUMP";

type CommandOrigin = "manual" | "system";

interface EnvironmentTelemetry {
  id: number;
  device_id: string; // UUID internal, bukan kode device_id
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number; // 0..1023 (nilai mentah ADC)
  recorded_at: string;
  received_at: string;
}

interface FireTelemetry {
  id: number;
  device_id: string; // UUID internal, bukan kode device_id
  flame_detected: boolean;
  flame_level: number | null;
  smoke_level: number; // 0..1023
  pump: boolean;
  buzzer: boolean;
  recorded_at: string;
  received_at: string;
}

interface Event {
  id: string; // UUID event
  device_id: string; // UUID internal device, bukan kode device_id
  event_type: EventType;
  severity: Severity;
  source: string;
  message: string;
  status: EventStatus;
  metadata?: Record<string, unknown> | null;
  triggered_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

interface TelemetryEnvironmentData {
  telemetry: EnvironmentTelemetry;
  device_id: string; // kode device, contoh FFF-KTG-001
}

interface TelemetryFireData {
  telemetry: FireTelemetry;
  device_id: string; // kode device
}

interface EventData {
  event: Event;
  device_id: string; // kode device
}

interface RiskUpdatedData {
  level: RiskLevel;
}

interface DeviceStatusData {
  status: DeviceStatus;
  online: boolean;
  last_seen_at?: string; // dikirim saat device kembali online
}

interface CommandIssuedData {
  command_id: string;
  action: CommandAction;
  origin: CommandOrigin;
  status: CommandStatus; // biasanya "pending"
  payload: Record<string, unknown>; // contoh: { state: true, duration: 30 }
}

interface CommandAckData {
  command_id: string;
  status: CommandStatus; // "success" atau "failed"
  message: string;
  device_id: string; // kode device
}

interface CommandTimeoutData {
  command_id: string;
}

interface RealtimeEnvelope<T = unknown> {
  type: RealtimeEventType;
  device_id?: string;
  data?: T;
  ts?: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

## Endpoint

### 1. Buat Tiket WebSocket

```
POST /realtime/ticket
```

Autentikasi: Bearer access token (semua role).

Tidak ada request body. Backend membuat tiket acak 32 byte (64 karakter hex), menyimpannya di Redis selama **60 detik**, lalu mengembalikannya.

Tiket bersifat **sekali pakai** dan **langsung dihapus saat dipakai** untuk membuka koneksi WebSocket. Jika koneksi gagal atau terputus, frontend harus meminta tiket baru.

#### Response `200 OK`

```json
{
  "data": {
    "ticket": "8f14e45fceea167a5a36dedd4bea2543d4f0e5b6c7a89012ab34cd56ef789012",
    "expires_in": 60
  }
}
```

| Field        | Tipe   | Keterangan                                  |
| ------------ | ------ | ------------------------------------------- |
| `ticket`     | string | Tiket untuk query `GET /ws`                 |
| `expires_in` | number | Masa berlaku tiket dalam detik (`60`)       |

#### Error

| Status | Code             | Keterangan                                     |
| ------ | ---------------- | ---------------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada               |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa      |
| `500`  | `internal_error` | Kesalahan server (termasuk gagal membuat tiket) |

---

### 2. Buka Koneksi WebSocket

```
GET /ws?ticket={ticket}&device_id={device_id}
```

Autentikasi: query `ticket` (bukan Bearer).

Gunakan skema `ws://` untuk HTTP dan `wss://` untuk HTTPS. Contoh:

```
ws://localhost:8080/api/v1/ws?ticket=8f14e45fceea167a5a36dedd4bea2543d4f0e5b6c7a89012ab34cd56ef789012
wss://api.domain.com/api/v1/ws?ticket=<ticket>&device_id=FFF-KTG-001
```

#### Query Parameter

| Field       | Tipe   | Wajib | Keterangan                                                           |
| ----------- | ------ | ----- | -------------------------------------------------------------------- |
| `ticket`    | string | Ya    | Tiket dari `POST /realtime/ticket`                                   |
| `device_id` | string | Tidak | Filter kode device. Jika kosong, klien menerima semua device          |

Aturan filter `device_id`:

- Pesan hanya diteruskan jika `device_id` pada envelope sama dengan filter.
- Jika envelope tidak memiliki `device_id`, pesan tetap diteruskan.
- Filter memakai **kode device** (contoh `FFF-KTG-001`), bukan UUID internal.
- Perhatian: `command.timeout` mengirim UUID internal pada `device_id` envelope, sehingga bisa tidak cocok dengan filter kode device.

#### Handshake

Saat koneksi berhasil, server langsung mengirim pesan pembuka:

```json
{
  "type": "connected"
}
```

Origin browser divalidasi backend. Origin kosong (klien non-browser) diizinkan. Jika origin tidak diizinkan, handshake ditolak (umumnya `403 Forbidden`).

#### Error Handshake

| Status | Code             | Keterangan                                              |
| ------ | ---------------- | ------------------------------------------------------- |
| `401`  | `unauthorized`   | Query `ticket` tidak ada                                 |
| `401`  | `invalid_ticket` | Tiket tidak valid, sudah dipakai, atau kedaluwarsa      |
| `403`  | -                | Origin tidak diizinkan (handshake ditolak oleh upgrader) |
| `500`  | `internal_error` | Kesalahan server                                        |

#### Heartbeat dan Batas Koneksi

- Server mengirim WebSocket **ping** setiap 30 detik.
- Klien harus membalas **pong** dalam 60 detik; browser menangani ini otomatis.
- Server tidak memproses pesan dari klien. Pesan masuk hanya dibaca dan diabaikan.
- Ukuran maksimum pesan masuk dari klien 4096 byte.
- Pesan untuk klien lambat akan dibuang jika buffer penuh. Koneksi dapat ditutup jika write gagal atau server berhenti.

## Jenis Pesan

| `type`                   | Kapan dikirim                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `connected`              | Segera setelah koneksi WebSocket berhasil dibuka                     |
| `telemetry.environment`  | Worker menerima dan menyimpan telemetri lingkungan                   |
| `telemetry.fire`         | Worker menerima dan menyimpan telemetri api/asap                     |
| `event.created`          | Risk engine membuat event baru                                       |
| `event.updated`          | Event di-`acknowledge` oleh `admin`/`petugas`                        |
| `event.resolved`         | Event di-`resolve` manual atau otomatis saat kondisi normal kembali  |
| `risk.updated`           | Tingkat risiko device berubah                                        |
| `device.status`          | Device pertama kali terlihat online atau ditandai offline            |
| `command.issued`         | Command baru dibuat (manual atau auto pump)                          |
| `command.ack`            | Device mengirim acknowledgement command (`success`/`failed`)         |
| `command.timeout`        | Command `pending`/`sent` melewati batas waktu dan menjadi `timeout`  |

### `connected`

```json
{
  "type": "connected"
}
```

Tidak memiliki `device_id`, `data`, maupun `ts`.

### `telemetry.environment`

```json
{
  "type": "telemetry.environment",
  "device_id": "FFF-KTG-001",
  "data": {
    "telemetry": {
      "id": 12345,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "temperature": 30.2,
      "humidity": 78.0,
      "soil_moisture": 640,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:20:01Z"
}
```

`data.device_id` adalah kode device. `data.telemetry.device_id` adalah UUID internal.

### `telemetry.fire`

```json
{
  "type": "telemetry.fire",
  "device_id": "FFF-KTG-001",
  "data": {
    "telemetry": {
      "id": 98765,
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "flame_detected": true,
      "flame_level": 900,
      "smoke_level": 180,
      "pump": true,
      "buzzer": true,
      "recorded_at": "2026-11-15T03:20:00Z",
      "received_at": "2026-11-15T03:20:01Z"
    },
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:20:01Z"
}
```

### `event.created`

```json
{
  "type": "event.created",
  "device_id": "FFF-KTG-001",
  "data": {
    "event": {
      "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "event_type": "FIRE_DETECTED",
      "severity": "critical",
      "source": "flame_sensor",
      "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
      "status": "active",
      "metadata": {
        "flame_level": 900,
        "smoke_level": 180
      },
      "triggered_at": "2026-11-15T03:20:00Z",
      "created_at": "2026-11-15T03:20:00Z"
    },
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:20:00Z"
}
```

### `event.updated`

Dikirim setelah `POST /events/{eventID}/acknowledge`. Bentuk `data` sama dengan `event.created`, dengan `event.status` menjadi `acknowledged` dan `acknowledged_at`/`acknowledged_by` terisi.

```json
{
  "type": "event.updated",
  "device_id": "FFF-KTG-001",
  "data": {
    "event": {
      "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "event_type": "FIRE_DETECTED",
      "severity": "critical",
      "source": "flame_sensor",
      "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
      "status": "acknowledged",
      "triggered_at": "2026-11-15T03:20:00Z",
      "acknowledged_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
      "acknowledged_at": "2026-11-15T03:25:00Z",
      "created_at": "2026-11-15T03:20:00Z"
    },
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:25:00Z"
}
```

### `event.resolved`

Dikirim setelah `POST /events/{eventID}/resolve` atau saat backend otomatis menutup event karena kondisi kembali normal.

```json
{
  "type": "event.resolved",
  "device_id": "FFF-KTG-001",
  "data": {
    "event": {
      "id": "4e3f2a1b-9c8d-4e7f-8a2b-3c4d5e6f7a8b",
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "event_type": "FIRE_DETECTED",
      "severity": "critical",
      "source": "flame_sensor",
      "message": "Potensi kebakaran terdeteksi: api terbaca oleh flame sensor.",
      "status": "resolved",
      "triggered_at": "2026-11-15T03:20:00Z",
      "acknowledged_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
      "acknowledged_at": "2026-11-15T03:25:00Z",
      "resolved_at": "2026-11-15T03:40:00Z",
      "created_at": "2026-11-15T03:20:00Z"
    },
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:40:00Z"
}
```

### `risk.updated`

```json
{
  "type": "risk.updated",
  "device_id": "FFF-KTG-001",
  "data": {
    "level": "DARURAT"
  },
  "ts": "2026-11-15T03:20:01Z"
}
```

Nilai `level`: `NORMAL`, `WASPADA`, `BAHAYA`, atau `DARURAT`. Pesan hanya dikirim ketika level berubah.

### `device.status`

Saat device kembali online:

```json
{
  "type": "device.status",
  "device_id": "FFF-KTG-001",
  "data": {
    "status": "online",
    "online": true,
    "last_seen_at": "2026-11-15T03:20:00Z"
  },
  "ts": "2026-11-15T03:20:00Z"
}
```

Saat device ditandai offline oleh sweeper:

```json
{
  "type": "device.status",
  "device_id": "FFF-KTG-001",
  "data": {
    "status": "offline",
    "online": false
  },
  "ts": "2026-11-15T03:21:00Z"
}
```

Pesan online hanya dikirim pada transisi offline menjadi online, bukan pada setiap telemetri. Device yang baru terdaftar otomatis dapat mengirim `online` tanpa `last_seen_at`.

### `command.issued`

```json
{
  "type": "command.issued",
  "device_id": "FFF-KTG-001",
  "data": {
    "command_id": "cmd-20261115-0001",
    "action": "SET_PUMP",
    "origin": "manual",
    "status": "pending",
    "payload": {
      "state": true,
      "duration": 30
    }
  },
  "ts": "2026-11-15T03:22:00Z"
}
```

`origin` bernilai `manual` (dipicu user) atau `system` (auto pump). `payload` mengikuti action, saat ini `SET_PUMP` memakai `state` (boolean) dan `duration` (detik).

### `command.ack`

```json
{
  "type": "command.ack",
  "device_id": "FFF-KTG-001",
  "data": {
    "command_id": "cmd-20261115-0001",
    "status": "success",
    "message": "pump activated",
    "device_id": "FFF-KTG-001"
  },
  "ts": "2026-11-15T03:22:05Z"
}
```

`status` pada pesan ini hanya `success` atau `failed`.

### `command.timeout`

```json
{
  "type": "command.timeout",
  "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
  "data": {
    "command_id": "cmd-20261115-0001"
  },
  "ts": "2026-11-15T03:23:00Z"
}
```

Perhatian: pada `command.timeout`, `device_id` di envelope berisi **UUID internal device**, bukan kode device. Gunakan `data.command_id` untuk mencocokkan dengan daftar command.

## Contoh Alur

```bash
# 1. Minta tiket
curl -X POST http://localhost:8080/api/v1/realtime/ticket \
  -H "Authorization: Bearer $TOKEN"

# 2. Buka koneksi (contoh dengan wscat)
wscat -c "ws://localhost:8080/api/v1/ws?ticket=$TICKET&device_id=FFF-KTG-001"
```

Alur frontend yang disarankan:

1. Setelah login, panggil `POST /realtime/ticket`.
2. Buka `ws`/`wss` ke `/ws?ticket=...`. Jangan menambahkan header `Authorization`.
3. Tunggu pesan `connected` sebagai penanda koneksi siap.
4. Proses envelope berdasarkan `type`.
5. Saat koneksi terputus, minta tiket baru lalu reconnect dengan backoff.
6. Setelah reconnect, muat ulang data lewat REST untuk mengejar pesan yang terlewat.

## Matriks Permission

| Aksi                          | admin | petugas | viewer |
| ----------------------------- | :---: | :-----: | :----: |
| Membuat tiket WebSocket       |  Ya   |   Ya    |   Ya   |
| Membuka koneksi WebSocket     |  Ya   |   Ya    |   Ya   |
| Menerima seluruh pesan realtime | Ya  |   Ya    |   Ya   |

## Catatan untuk Frontend

- Tiket berlaku 60 detik dan hanya bisa dipakai sekali. Jangan menyimpan atau memakai ulang tiket.
- Gunakan `wss://` di production/HTTPS. Tiket tetap ada di URL, jadi jaga agar tidak tercatat di log yang tidak aman.
- WebSocket bersifat **best-effort tanpa replay**. Redis Pub/Sub tidak menyimpan riwayat; pesan saat klien terputus hilang. Setelah reconnect, panggil ulang endpoint REST terkait (`/devices`, `/events`, `/dashboard/summary`, `/devices/{deviceID}/telemetry/latest`).
- Tidak ada field ID pesan atau sequence. Gunakan `event.id` untuk deduplikasi event; telemetri dapat memakai `telemetry.id`.
- `type` memakai dot-case lowercase, sedangkan `event_type` memakai uppercase (contoh `FIRE_DETECTED`).
- Perbedaan `device_id`: envelope dan `data.device_id` berisi **kode device** (contoh `FFF-KTG-001`), sedangkan `event.device_id` dan `telemetry.device_id` berisi **UUID internal**. Pengecualian: `command.timeout` memakai UUID internal pada envelope.
- `ts` adalah waktu publish event dalam UTC dan dapat memiliki fraksi detik. Parse dengan parser ISO 8601/RFC 3339.
- `data` tidak ada pada pesan `connected`. Untuk tipe lain, `data` berisi payload sesuai tabel di atas.
- Pesan dari klien diabaikan server. Tidak ada mekanisme subscribe/unsubscribe per topik selain query `device_id` saat handshake.
- Filter `device_id` bersifat opsional. Untuk dashboard global, jangan kirim filter agar semua device diterima.
- Role `viewer` tetap menerima seluruh pesan realtime. Sembunyikan aksi tulis di UI sesuai role, bukan mengandalkan filter pesan.
- `event.updated` dikirim saat acknowledge, `event.resolved` saat resolve manual maupun otomatis. Perbarui state event berdasarkan `event.id`, bukan menambahkan baris baru.
- `device.status` tidak dikirim pada setiap heartbeat, hanya pada perubahan status. Tetap andalkan data awal dari REST.
- Command dapat berasal dari user (`manual`) atau backend (`system`, auto pump). Tampilkan asal command jika diperlukan.
- Jika tiket ditolak (`invalid_ticket`), jangan retry dengan tiket yang sama; buat tiket baru.
