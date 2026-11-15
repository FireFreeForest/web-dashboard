# API Contract - Auth

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
| `X-Request-ID` | Tidak | Jika dikirim, akan dikembalikan di response header |

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
    "code": "invalid_credentials",
    "message": "Email atau password salah"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type UserRole = "admin" | "petugas" | "viewer";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  access_expires_at: string;
  refresh_expires_at: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

## Endpoint

### 1. Login

```
POST /auth/login
```

Autentikasi: publik.

Rate limit: 10 request per menit per IP. Jika terlampaui, response `429` menyertakan header `Retry-After` (detik).

#### Request Body

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `email` | string (email) | Ya | Email user |
| `password` | string | Ya | Password user |

```json
{
  "email": "admin@fff.local",
  "password": "admin12345"
}
```

#### Response `200 OK`

```json
{
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "9f8c2a7e...",
      "token_type": "Bearer",
      "access_expires_at": "2026-11-15T03:35:00Z",
      "refresh_expires_at": "2026-11-22T03:20:00Z"
    },
    "user": {
      "id": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
      "email": "admin@fff.local",
      "name": "Administrator",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-11-01T08:00:00Z",
      "updated_at": "2026-11-01T08:00:00Z"
    }
  }
}
```

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_request` | Email/password tidak valid atau kosong |
| `401` | `invalid_credentials` | Email atau password salah |
| `403` | `account_inactive` | Akun tidak aktif |
| `429` | `rate_limited` | Terlalu banyak percobaan login |
| `500` | `internal_error` | Kesalahan server |

---

### 2. Refresh Token

```
POST /auth/refresh
```

Autentikasi: publik (menggunakan `refresh_token`).

Refresh token dirotasi: response mengembalikan pasangan token baru. Simpan `refresh_token` terbaru dan buang yang lama. Jika token lama dipakai ulang, seluruh sesi user dicabut.

#### Request Body

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `refresh_token` | string | Ya | Refresh token terbaru |

```json
{
  "refresh_token": "9f8c2a7e..."
}
```

#### Response `200 OK`

```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "c1d2e3f4...",
    "token_type": "Bearer",
    "access_expires_at": "2026-11-15T03:50:00Z",
    "refresh_expires_at": "2026-11-22T03:35:00Z"
  }
}
```

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `400` | `invalid_request` | `refresh_token` kosong |
| `401` | `invalid_token` | Token tidak valid, tidak dikenal, atau kedaluwarsa |
| `401` | `token_reuse` | Token sudah pernah dipakai; semua sesi dicabut, user harus login ulang |
| `403` | `account_inactive` | Akun tidak aktif |

---

### 3. Profil User Saat Ini

```
GET /auth/me
```

Autentikasi: Bearer access token.

#### Response `200 OK`

```json
{
  "data": {
    "id": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
    "email": "admin@fff.local",
    "name": "Administrator",
    "role": "admin",
    "is_active": true,
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
| `404` | `not_found` | User tidak ditemukan |
| `500` | `internal_error` | Kesalahan server |

---

### 4. Logout

```
POST /auth/logout
```

Autentikasi: Bearer access token.

Body opsional. Jika `refresh_token` dikirim dan valid untuk user tersebut, token dicabut. Endpoint tetap mengembalikan `204` meskipun refresh token tidak valid.

#### Request Body (opsional)

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `refresh_token` | string | Tidak | Refresh token yang ingin dicabut |

```json
{
  "refresh_token": "c1d2e3f4..."
}
```

#### Response `204 No Content`

Tanpa body.

#### Error

| Status | Code | Keterangan |
| --- | --- | --- |
| `401` | `unauthorized` | Header `Authorization` tidak ada |
| `401` | `invalid_token` | Access token tidak valid atau kedaluwarsa |

## Catatan untuk Frontend

- Simpan `access_token` dan `refresh_token` dari response login.
- Kirim `access_token` pada header `Authorization: Bearer <access_token>`.
- Saat menerima `401 invalid_token` dari endpoint terproteksi, panggil `POST /auth/refresh` satu kali, lalu ulangi request dengan access token baru.
- Jika refresh mengembalikan `401 token_reuse`, hapus semua token dan arahkan user ke halaman login.
- Jika menerima `403 account_inactive`, hentikan sesi dan tampilkan pesan akun tidak aktif.
- Jika login mengembalikan `429`, baca header `Retry-After` sebelum mencoba lagi.
- Role yang tersedia: `admin`, `petugas`, `viewer`.
