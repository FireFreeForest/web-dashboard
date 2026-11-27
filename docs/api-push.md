# API Contract - Push Notification (FCM)

Dokumen ini adalah kontrak API untuk kebutuhan frontend: registrasi dan penghapusan token Firebase Cloud Messaging (FCM) agar perangkat menerima push notification event. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Seluruh endpoint pada dokumen ini dapat diakses oleh semua role: `admin`, `petugas`, dan `viewer`.

## Konvensi

### Header

| Header                                 | Wajib                      | Keterangan                                         |
| -------------------------------------- | -------------------------- | -------------------------------------------------- |
| `Content-Type: application/json`       | Ya, untuk request ber-body |                                                    |
| `Authorization: Bearer <access_token>` | Ya                         | Access token user yang sedang login                |
| `X-Request-ID`                         | Tidak                      | Jika dikirim, akan dikembalikan di response header |

### Format Response

Endpoint pada dokumen ini tidak mengembalikan body pada response sukses:

```
204 No Content
```

Response error selalu berbentuk:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "token FCM wajib diisi"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-20T03:20:00Z`.

## Tipe Data

```ts
// Nilai bebas; disimpan dalam huruf kecil. Default "android" bila kosong.
type PushPlatform = "android" | "ios" | "web" | string;

interface RegisterPushTokenRequest {
  token: string;      // token FCM dari Firebase, BUKAN access token JWT
  platform?: PushPlatform;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

`token` di sini adalah FCM registration token yang diperoleh dari SDK Firebase, bukan access token JWT dan bukan refresh token. Token ini hanya bisa didapat dari aplikasi yang terhubung ke project Firebase yang sama dengan backend.

## Endpoint

### 1. Daftarkan Token FCM

```
POST /push/tokens
```

Autentikasi: Bearer access token, semua role.

Token bersifat unik secara global. Mendaftarkan token yang sudah ada akan memperbarui data (upsert), bukan membuat duplikat: `user_id`, `platform`, dan `last_used_at` milik token tersebut akan diperbarui ke user yang sedang login.

#### Request Body

| Field      | Tipe   | Wajib | Keterangan                                                         |
| ---------- | ------ | ----- | ------------------------------------------------------------------ |
| `token`    | string | Ya    | Token FCM; di-trim; tidak boleh kosong                             |
| `platform` | string | Tidak | Nama platform, disimpan huruf kecil; default `android` bila kosong |

```json
{
  "token": "fcm_registration_token_dari_firebase",
  "platform": "android"
}
```

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code              | Keterangan                                |
| ------ | ----------------- | ----------------------------------------- |
| `400`  | `invalid_request` | Body tidak valid atau `token` kosong      |
| `401`  | `unauthorized`    | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`   | Access token tidak valid atau kedaluwarsa |
| `500`  | `internal_error`  | Kesalahan server                          |

---

### 2. Hapus Token FCM

```
DELETE /push/tokens/{token}
```

Autentikasi: Bearer access token, semua role.

Menghapus token milik user yang sedang login. Operasi bersifat idempotent: endpoint tetap mengembalikan `204` meskipun token tidak ditemukan atau sudah terhapus.

#### Path Parameter

| Field   | Tipe   | Wajib | Keterangan                                |
| ------- | ------ | ----- | ----------------------------------------- |
| `token` | string | Ya    | Token FCM yang ingin dihapus (bukan UUID) |

Nilai `token` pada path harus di-URL-encode karena umumnya berisi karakter seperti `:` dan `-`. Contoh:

```
DELETE /api/v1/push/tokens/fcm_registration_token_dari_firebase
DELETE /api/v1/push/tokens/fcm%3Aregistration%3Atoken
```

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code              | Keterangan                                |
| ------ | ----------------- | ----------------------------------------- |
| `400`  | `invalid_request` | Parameter `token` kosong                  |
| `401`  | `unauthorized`    | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`   | Access token tidak valid atau kedaluwarsa |
| `500`  | `internal_error`  | Kesalahan server                          |

## Catatan untuk Frontend

- Peroleh token dari SDK Firebase:
  - Android: `FirebaseMessaging.getInstance().getToken()`.
  - Web: `getToken(messaging, { vapidKey: "..." })`.
- Panggil `POST /push/tokens` setelah user login dan setiap kali token FCM berubah (FCM dapat merotasi token). Backend memperbarui data token yang sudah ada, jadi aman memanggil ulang.
- Panggil `DELETE /push/tokens/{token}` saat user logout atau mematikan notifikasi pada perangkat tersebut, agar push event tidak dikirim ke perangkat yang bukan lagi milik user.
- Token yang sudah tidak valid di sisi Firebase akan dibersihkan otomatis oleh backend ketika pengiriman push gagal.
- Token yang terdaftar untuk user `viewer` saat ini tidak menerima push event; notifikasi hanya dikirim ke user `admin` dan `petugas` yang aktif.
- Push event hanya dikirim untuk tipe event yang diizinkan konfigurasi backend (`FCM_EVENT_TYPES`, default mencakup `FIRE_DETECTED`, `SMOKE_DETECTED`, `TEMPERATURE_HIGH`, `SOIL_DRY`, `DEVICE_OFFLINE`, `SENSOR_ERROR`, `LOW_BATTERY`) dan memenuhi minimal severity (`FCM_MIN_SEVERITY`).
- Backend hanya mengirim notifikasi jika integrasi FCM aktif (service account terpasang). Tanpa itu, registrasi token tetap berhasil, tetapi tidak ada push yang dikirim.
