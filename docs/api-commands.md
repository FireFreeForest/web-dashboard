# API Contract - Commands

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait perintah (command) pompa air. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Endpoint pembacaan (`GET`) dapat diakses semua role. Pengiriman command (`POST`) hanya untuk role `admin` dan `petugas`.

## Konvensi

### Header

| Header                                 | Wajib                      | Keterangan                                          |
| -------------------------------------- | -------------------------- | --------------------------------------------------- |
| `Content-Type: application/json`       | Ya, untuk request ber-body |                                                     |
| `Authorization: Bearer <access_token>` | Ya                         | Wajib memakai access token user yang valid          |
| `Idempotency-Key`                      | Tidak                      | Hanya untuk `POST /devices/{deviceID}/commands`     |

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
    "code": "idempotency_in_progress",
    "message": "Permintaan dengan Idempotency-Key yang sama sedang diproses"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type CommandAction = "SET_PUMP" | "GET_ALL_TELEMETRY";

type CommandStatus = "pending" | "sent" | "success" | "failed" | "timeout";

type CommandOrigin = "manual" | "system" | "mcp";

interface CommandPayload {
  state?: boolean; // SET_PUMP: true = nyalakan pompa, false = matikan
  duration?: number; // SET_PUMP: detik; 0 saat state = false
}

interface Command {
  id: string; // UUID internal
  command_id: string; // kode unik command (untuk lookup detail)
  device_id: string; // UUID internal device, bukan kode device_id
  action: CommandAction;
  payload: CommandPayload;
  origin: CommandOrigin; // "manual" (dari dashboard), "system" (auto pump), atau "mcp" (agen MCP)
  status: CommandStatus;
  issued_by: string | null; // UUID user/actor yang mengirim (null untuk system)
  issued_at: string;
  sent_at: string | null;
  acked_at: string | null;
  ack_message: string;
  created_at: string;
  updated_at: string;
}

interface IssueCommandInput {
  action: "SET_PUMP";
  payload: {
    state: boolean;
    duration?: number; // detik; default 30, maksimal mengikuti konfigurasi (default 300)
  };
}

interface RefreshTelemetryInput {
  action: "GET_ALL_TELEMETRY";
  payload?: Record<string, never>; // boleh kosong
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

### 1. Riwayat Command Device

```
GET /devices/{deviceID}/commands
```

Autentikasi: Bearer access token (semua role).

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`), bukan UUID internal.

Mengembalikan riwayat command milik device ter-paginasi, diurutkan `issued_at` menurun (terbaru lebih dulu).

#### Query Parameters

| Field      | Tipe    | Wajib | Default | Keterangan                          |
| ---------- | ------- | ----- | ------- | ----------------------------------- |
| `page`     | integer | Tidak | `1`     | Halaman, minimal 1                  |
| `per_page` | integer | Tidak | `20`    | Jumlah per halaman, minimal 1, maksimal 100 |

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": "9e8d7c6b-5a4f-4c3d-8e2f-0a1b2c3d4e5f",
      "command_id": "cmd-20261115-AB12",
      "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
      "action": "SET_PUMP",
      "payload": {
        "state": true,
        "duration": 30
      },
      "origin": "manual",
      "status": "success",
      "issued_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
      "issued_at": "2026-11-15T03:20:00Z",
      "sent_at": "2026-11-15T03:20:01Z",
      "acked_at": "2026-11-15T03:20:03Z",
      "ack_message": "Pump activated",
      "created_at": "2026-11-15T03:20:00Z",
      "updated_at": "2026-11-15T03:20:03Z"
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

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Device tidak ditemukan                    |
| `500`  | `internal_error` | Kesalahan server                          |

---

### 2. Kirim Command Pompa

```
POST /devices/{deviceID}/commands
```

Autentikasi: Bearer access token, role `admin` atau `petugas`.

`deviceID` adalah kode unik device (contoh `FFF-KTG-001`).

Mengirim perintah ke device. Tersedia dua action:

- `SET_PUMP` menyalakan/mematikan pompa (wajib `payload.state`).
- `GET_ALL_TELEMETRY` meminta perangkat segera mempublikasikan seluruh telemetri terbaru (tidak butuh payload).

Command disimpan lalu dipublikasikan ke MQTT secara asinkron (outbox). Status awal `pending`, lalu berubah menjadi `sent`, `success`, `failed`, atau `timeout`.

#### Header Idempotency-Key (opsional)

Kunci unik per user untuk mencegah command ganda, disimpan selama 24 jam.

- Jika kunci sudah pernah selesai diproses, response `200 OK` mengembalikan command yang sama.
- Jika kunci masih diproses, response `409` dengan kode `idempotency_in_progress`.

#### Request Body

| Field                  | Tipe    | Wajib | Keterangan                                          |
| ---------------------- | ------- | ----- | --------------------------------------------------- |
| `action`               | string  | Ya    | `SET_PUMP` atau `GET_ALL_TELEMETRY`                 |
| `payload.state`        | boolean | Ya untuk `SET_PUMP` | `true` nyalakan pompa, `false` matikan |
| `payload.duration`     | integer | Tidak | Detik (1..maksimal); default 30; diabaikan jika `state=false` |

`GET_ALL_TELEMETRY` tidak memerlukan payload; jika dikirim, payload diabaikan.

```json
{
  "action": "SET_PUMP",
  "payload": {
    "state": true,
    "duration": 30
  }
}
```

```json
{
  "action": "GET_ALL_TELEMETRY"
}
```

#### Response `202 Accepted`

```json
{
  "data": {
    "id": "9e8d7c6b-5a4f-4c3d-8e2f-0a1b2c3d4e5f",
    "command_id": "cmd-20261115-AB12",
    "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "action": "SET_PUMP",
    "payload": {
      "state": true,
      "duration": 30
    },
    "origin": "manual",
    "status": "pending",
    "issued_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
    "issued_at": "2026-11-15T03:20:00Z",
    "sent_at": null,
    "acked_at": null,
    "ack_message": "",
    "created_at": "2026-11-15T03:20:00Z",
    "updated_at": "2026-11-15T03:20:00Z"
  }
}
```

#### Error

| Status | Code                     | Keterangan                                                    |
| ------ | ------------------------ | ------------------------------------------------------------- |
| `400`  | `invalid_request`        | `action` atau `payload.state` kosong/tidak valid              |
| `401`  | `unauthorized`           | Header `Authorization` tidak ada                              |
| `401`  | `invalid_token`          | Access token tidak valid atau kedaluwarsa                     |
| `403`  | `forbidden`              | Role bukan `admin`/`petugas`                                  |
| `404`  | `not_found`              | Device tidak ditemukan                                        |
| `409`  | `idempotency_in_progress` | `Idempotency-Key` yang sama sedang diproses                   |
| `422`  | `validation_error`       | `action` tidak dikenal, `payload.state` tidak ada untuk `SET_PUMP`, atau `duration` di luar batas |
| `500`  | `internal_error`         | Kesalahan server                                              |

---

### 3. Detail Command

```
GET /commands/{commandID}
```

Autentikasi: Bearer access token (semua role).

`commandID` adalah kode unik command (contoh `cmd-20261115-AB12`), bukan UUID internal `id`.

#### Response `200 OK`

```json
{
  "data": {
    "id": "9e8d7c6b-5a4f-4c3d-8e2f-0a1b2c3d4e5f",
    "command_id": "cmd-20261115-AB12",
    "device_id": "1c2d3e4f-5a6b-4c1c-9a0f-1b2c3d4e5f60",
    "action": "SET_PUMP",
    "payload": {
      "state": true,
      "duration": 30
    },
    "origin": "manual",
    "status": "success",
    "issued_by": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
    "issued_at": "2026-11-15T03:20:00Z",
    "sent_at": "2026-11-15T03:20:01Z",
    "acked_at": "2026-11-15T03:20:03Z",
    "ack_message": "Pump activated",
    "created_at": "2026-11-15T03:20:00Z",
    "updated_at": "2026-11-15T03:20:03Z"
  }
}
```

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `404`  | `not_found`      | Command tidak ditemukan                   |
| `500`  | `internal_error` | Kesalahan server                          |

## Catatan untuk Frontend

- `command_id` (kode unik, contoh `cmd-20261115-AB12`) berbeda dengan `id` (UUID internal). Endpoint detail memakai `commandID` = `command_id`.
- `device_id` pada command merujuk ke UUID internal device, bukan kode `device_id`. Untuk riwayat command gunakan kode unik `deviceID` sebagai path parameter.
- `payload` untuk `SET_PUMP` selalu berbentuk `{ state: boolean, duration: number }`. Untuk `GET_ALL_TELEMETRY`, `payload` kosong (`{}`).
- `duration` diabaikan (menjadi `0`) saat `state=false`. Batas atas `duration` mengikuti konfigurasi server (`AUTO_PUMP_MAX_DURATION`, default 300 detik).
- Command bersifat asinkron: `POST` mengembalikan `202` dengan status `pending`. Status berlanjut (`sent` → `success`/`failed`/`timeout`) diperbarui lewat worker; pantau lewat WebSocket (`command.issued`, `command.ack`, `command.timeout`) atau polling detail command.
- `GET_ALL_TELEMETRY` dipakai untuk memaksa perangkat mempublikasikan ulang seluruh telemetri (environment, fire, device). Backend juga memakainya secara internal sebelum membuat event agar snapshot metadata segar; perangkat membalas dengan `command.ack` setelah semua telemetri terkirim.
- Untuk mencegah command ganda akibat klik berulang, kirim header `Idempotency-Key` yang unik per aksi user.
- `issued_by` bisa `null` untuk command yang dibuat otomatis oleh sistem (`origin: "system"`). `origin` juga bisa `mcp` untuk command dari agen MCP.
- Role yang tersedia: `admin`, `petugas`, `viewer`. `POST` command hanya untuk `admin`/`petugas`; `GET` untuk semua role.
