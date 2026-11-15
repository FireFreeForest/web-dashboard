# API Contract - Push Notification (FCM)

Dokumen ini adalah kontrak API untuk kebutuhan frontend terkait registrasi token Firebase Cloud Messaging (FCM). Semua endpoint berada di bawah base URL:

```
/api/v1
```

Seluruh endpoint pada dokumen ini dapat diakses oleh semua role (`admin`, `petugas`, `viewer`) selama memiliki Bearer access token.

Fitur push terdiri dari **2 endpoint**:

| Method | Path | Keterangan |
| --- | --- | --- |
| `POST` | `/push/tokens` | Daftarkan/perbarui token FCM milik user yang login |
| `DELETE` | `/push/tokens/{token}` | Hapus token FCM milik user yang login |

Endpoint ini hanya mengelola token. Pengiriman notifikasi dilakukan otomatis oleh worker backend saat event dibuat (lihat bagian [Payload Notifikasi](#payload-notifikasi)).

## Konvensi

### Header

| Header                                 | Wajib                      | Keterangan                                    |
| -------------------------------------- | -------------------------- | --------------------------------------------- |
| `Content-Type: application/json`       | Ya, untuk request ber-body |                                               |
| `Authorization: Bearer <access_token>` | Ya                         | Wajib memakai access token user yang valid    |
| `X-Request-ID`                         | Tidak                      | Jika dikirim, akan dikembalikan di response header |

### Format Response

Kedua endpoint mengembalikan `204 No Content` tanpa body. Tidak ada envelope `data`.

Response error selalu berbentuk:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "token FCM wajib diisi"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
interface RegisterPushTokenInput {
  token: string; // token FCM dari Firebase SDK, bukan access token JWT
  platform?: string; // default "android"; disimpan sebagai metadata
}

type NotificationType = "fire_reminder" | "fire_escalation";

// Semua nilai FCM data berupa string.
interface EventPushData {
  event_id: string; // UUID event
  device_id: string; // kode unik device, contoh FFF-KTG-001
  device_name: string;
  event_type: EventType; // lihat api-events.md
  severity: Severity; // "error" | "warning" | "critical"
  triggered_at: string; // RFC3339 UTC
  notification_type?: NotificationType; // hanya untuk push pengingat/eskalasi
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

## Endpoint

### 1. Daftarkan Token FCM

```
POST /push/tokens
```

Autentikasi: Bearer access token (semua role).

Token di-`upsert` berdasarkan nilai `token` (kolom `token` unik secara global). Jika token yang sama didaftarkan lagi:

- `user_id` dan `platform` diperbarui menjadi nilai dari request terbaru.
- `last_used_at` diperbarui ke waktu request.
- `created_at` tetap.

Artinya satu token perangkat hanya boleh dimiliki satu user pada satu waktu. Jika user lain login di perangkat yang sama lalu mendaftarkan token yang sama, kepemilikan token berpindah ke user tersebut.

Panggil endpoint ini setiap kali aplikasi mendapat token FCM baru (termasuk saat token di-refresh oleh Firebase) atau setelah login berhasil.

#### Request Body

| Field      | Tipe   | Wajib | Keterangan                                                            |
| ---------- | ------ | ----- | --------------------------------------------------------------------- |
| `token`    | string | Ya    | Token FCM. Di-trim oleh backend; string kosong ditolak               |
| `platform` | string | Tidak | Default `android`; di-trim dan di-lowercase. Tidak ada validasi enum   |

```json
{
  "token": "dGhpcy1pcy1hbi1leGFtcGxlLWZjbS10b2tlbjphcGE5MS1hYmNkZWY",
  "platform": "android"
}
```

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code             | Keterangan                                             |
| ------ | ---------------- | ------------------------------------------------------ |
| `400`  | `invalid_request` | Body bukan JSON valid atau `token` kosong/tidak dikirim |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada                       |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa              |
| `500`  | `internal_error` | Kesalahan server                                       |

---

### 2. Hapus Token FCM

```
DELETE /push/tokens/{token}
```

Autentikasi: Bearer access token (semua role).

Menghapus token milik user yang sedang login. Jika token tidak ada atau dimiliki user lain, backend tetap mengembalikan `204` (operasi bersifat idempoten, tidak membocorkan kepemilikan token).

Panggil endpoint ini saat logout, saat Firebase memberi token baru, atau saat user menonaktifkan notifikasi.

#### Path Parameter

| Field   | Tipe   | Wajib | Keterangan                                            |
| ------- | ------ | ----- | ----------------------------------------------------- |
| `token` | string | Ya    | Token FCM yang ingin dihapus. URL-encode bila perlu   |

Contoh:

```
DELETE /push/tokens/dGhpcy1pcy1hbi1leGFtcGxlLWZjbS10b2tlbjphcGE5MS1hYmNkZWY
```

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code             | Keterangan                          |
| ------ | ---------------- | ----------------------------------- |
| `400`  | `invalid_request` | `token` pada path kosong            |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada    |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `500`  | `internal_error` | Kesalahan server                    |

## Payload Notifikasi

Notifikasi dikirim worker ke semua token milik user aktif dengan role `admin` dan `petugas`. Token milik `viewer` tidak menerima push. `platform` tidak dipakai untuk memfilter penerima.

Pesan FCM berisi `notification` (title + body) dan `data`:

```json
{
  "notification": {
    "title": "DARURAT: Kebakaran terdeteksi",
    "body": "Api terdeteksi di Ketapang Ridge Station (FFF-KTG-001). Pompa air diaktifkan otomatis."
  },
  "data": {
    "event_id": "5b1f0f0e-7a1c-4d6e-8b2a-9c3d4e5f6071",
    "device_id": "FFF-KTG-001",
    "device_name": "Ketapang Ridge Station",
    "event_type": "FIRE_DETECTED",
    "severity": "critical",
    "triggered_at": "2026-11-15T03:20:00Z"
  }
}
```

Push pengingat/eskalasi kebakaran yang belum diakui menambahkan `notification_type`:

```json
{
  "notification_type": "fire_escalation"
}
```

Nilai yang mungkin: `fire_reminder` (belum diakui 2 menit) dan `fire_escalation` (belum ditangani 5 menit).

### Channel dan Sound Android

| Event                                                        | Channel                | Sound               |
| ------------------------------------------------------------ | ---------------------- | ------------------- |
| `FIRE_DETECTED`                                              | `fire_alerts_fire`     | `notif_fire`        |
| `SMOKE_DETECTED`, `TEMPERATURE_HIGH`, `SOIL_DRY`             | `fire_alerts_warning`  | `notif_smoke`       |
| `SENSOR_ERROR`, `DEVICE_OFFLINE`                             | `fire_alerts_error`    | `notif_sensor_error`|

Prioritas Android: `high`.

### Filter Pengiriman di Backend

Notifikasi hanya dikirim jika FCM aktif di server (kredensial service account tersedia). Event juga difilter oleh:

- `FCM_MIN_SEVERITY` (`error` < `warning` < `critical`).
- `FCM_EVENT_TYPES` (allowlist tipe event; kosong berarti semua event valid).

Token yang ditolak FCM sebagai tidak valid (`UNREGISTERED`, `INVALID_ARGUMENT`, atau HTTP `404`) otomatis dihapus backend. Frontend tidak perlu menghapus manual.

## Matriks Permission

| Aksi                        | admin | petugas | viewer |
| --------------------------- | :---: | :-----: | :----: |
| Daftarkan token FCM         |  Ya   |   Ya    |   Ya   |
| Hapus token FCM             |  Ya   |   Ya    |   Ya   |
| Menerima push event         |  Ya   |   Ya    | Tidak  |

## Catatan untuk Frontend

- `token` di sini adalah token FCM dari Firebase SDK (`FirebaseMessaging.getInstance().getToken()` di Android atau `getToken(messaging, { vapidKey })` di web), bukan access token JWT backend.
- Daftarkan token setelah login berhasil dan setiap kali token Firebase berubah. Hapus token saat logout.
- Registrasi bersifat idempoten/upsert; aman dipanggil berulang dengan token yang sama.
- Satu token hanya terikat ke satu user. Pastikan token dihapus atau didaftarkan ulang saat berganti akun di perangkat yang sama.
- Respons sukses tidak berisi body (`204`); jangan mencoba parse JSON pada respons sukses.
- `device_id` pada `data` notifikasi adalah kode unik device (contoh `FFF-KTG-001`), bukan UUID internal.
- `event_id` adalah UUID; gunakan untuk membuka detail event lewat `GET /events/{eventID}`.
- Push bersifat best-effort. Jadikan daftar event (`GET /events`) sebagai sumber kebenaran, bukan notifikasi.
- Jika notifikasi tidak diterima, penyebab umum: FCM belum dikonfigurasi di backend, token belum terdaftar, role user `viewer`, event di bawah `FCM_MIN_SEVERITY`, atau event tidak ada di `FCM_EVENT_TYPES`.
- Role yang tersedia: `admin`, `petugas`, `viewer`.
