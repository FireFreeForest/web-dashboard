# API Contract - User Management

Dokumen ini adalah kontrak API untuk kebutuhan manajemen user dan role. Semua endpoint berada di bawah base URL:

```
/api/v1
```

Seluruh endpoint pada dokumen ini hanya dapat diakses oleh user dengan role `admin`.

## Konvensi

### Header

| Header                                 | Wajib                      | Keterangan                                         |
| -------------------------------------- | -------------------------- | -------------------------------------------------- |
| `Content-Type: application/json`       | Ya, untuk request ber-body |                                                    |
| `Authorization: Bearer <access_token>` | Ya                         | Wajib memakai access token milik user `admin`      |
| `X-Request-ID`                         | Tidak                      | Jika dikirim, akan dikembalikan di response header |

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
    "code": "validation_error",
    "message": "validation error: role must be admin, petugas, or viewer"
  }
}
```

Format waktu memakai RFC 3339 / ISO 8601 dalam UTC, contoh `2026-11-15T03:20:00Z`.

## Tipe Data

```ts
type UserRole = "admin" | "petugas" | "viewer"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ListMeta {
  page: number
  per_page: number
  total: number
}

interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}
```

`password_hash` tidak pernah dikembalikan oleh API.

## Role

Role bersifat statis. Tidak ada endpoint untuk membuat, mengubah, atau menghapus daftar role. Nilai yang valid hanya:

| Role      | Keterangan                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `admin`   | Akses penuh, termasuk manajemen user dan device.                           |
| `petugas` | Operasional lapangan: kirim command pompa, acknowledge, dan resolve event. |
| `viewer`  | Hanya membaca data (device, telemetry, event, dashboard).                  |

Nilai role divalidasi di dua lapis: `domain.ValidRole` pada service dan constraint `CHECK (role IN ('admin', 'petugas', 'viewer'))` pada tabel `users`.

### Matriks Permission

| Kemampuan                                          | admin | petugas | viewer |
| -------------------------------------------------- | :---: | :-----: | :----: |
| Login, refresh, logout, profil sendiri             |  Ya   |   Ya    |   Ya   |
| Lihat device, telemetry, command, event, dashboard |  Ya   |   Ya    |   Ya   |
| Registrasi / hapus push token FCM                  |  Ya   |   Ya    |   Ya   |
| Kirim command pompa (`POST /devices/:id/commands`) |  Ya   |   Ya    | Tidak  |
| Acknowledge event (`POST /events/:id/acknowledge`) |  Ya   |   Ya    | Tidak  |
| Resolve event (`POST /events/:id/resolve`)         | Tidak |   Ya    | Tidak  |
| Tambah / ubah / hapus device                       |  Ya   |  Tidak  | Tidak  |
| Daftar / tambah / ubah user                        |  Ya   |  Tidak  | Tidak  |

Catatan: `POST /events/:id/resolve` saat ini hanya mengizinkan role `petugas`; `admin` tidak termasuk. Role pada access token dibaca saat request, sehingga perubahan role berlaku pada login/refresh berikutnya.

## Endpoint

### 1. Daftar User

```
GET /users
```

Autentikasi: Bearer access token, role `admin`.

#### Query Parameter

| Field      | Tipe    | Wajib | Default | Keterangan                                  |
| ---------- | ------- | ----- | ------- | ------------------------------------------- |
| `page`     | integer | Tidak | `1`     | Halaman, minimal 1                          |
| `per_page` | integer | Tidak | `20`    | Jumlah per halaman, minimal 1, maksimal 100 |

Nilai di luar batas akan dinormalkan: `page < 1` menjadi 1, `per_page < 1` menjadi 20, `per_page > 100` menjadi 100. Nilai non-angka memakai default.

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": "3f1c9c2e-6f4a-4c1c-9a0f-1b2c3d4e5f60",
      "email": "admin@fff.local",
      "name": "Administrator",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-11-01T08:00:00Z",
      "updated_at": "2026-11-01T08:00:00Z"
    },
    {
      "id": "8a7b6c5d-4e3f-4a2b-9c1d-0e9f8a7b6c5d",
      "email": "petugas@fff.local",
      "name": "Petugas Pos 1",
      "role": "petugas",
      "is_active": true,
      "created_at": "2026-11-02T09:30:00Z",
      "updated_at": "2026-11-02T09:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2
  }
}
```

Data diurutkan `created_at` menaik. Belum ada filter berdasarkan role, status, atau pencarian.

#### Error

| Status | Code             | Keterangan                                |
| ------ | ---------------- | ----------------------------------------- |
| `401`  | `unauthorized`   | Header `Authorization` tidak ada          |
| `401`  | `invalid_token`  | Access token tidak valid atau kedaluwarsa |
| `403`  | `forbidden`      | Role bukan `admin`                        |
| `500`  | `internal_error` | Kesalahan server                          |

---

### 2. Tambah User

```
POST /users
```

Autentikasi: Bearer access token, role `admin`.

#### Request Body

| Field      | Tipe           | Wajib | Keterangan                                                |
| ---------- | -------------- | ----- | --------------------------------------------------------- |
| `email`    | string (email) | Ya    | Disimpan dalam huruf kecil; harus unik (case-insensitive) |
| `password` | string         | Ya    | Minimal 8 karakter                                        |
| `name`     | string         | Tidak | Di-trim; boleh kosong                                     |
| `role`     | string         | Tidak | `admin`, `petugas`, atau `viewer`; default `viewer`       |

```json
{
  "email": "petugas2@fff.local",
  "password": "rahasia12345",
  "name": "Petugas Pos 2",
  "role": "petugas"
}
```

User baru selalu dibuat dengan `is_active: true`.

#### Response `201 Created`

```json
{
  "data": {
    "id": "c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
    "email": "petugas2@fff.local",
    "name": "Petugas Pos 2",
    "role": "petugas",
    "is_active": true,
    "created_at": "2026-11-15T03:20:00Z",
    "updated_at": "2026-11-15T03:20:00Z"
  }
}
```

#### Error

| Status | Code               | Keterangan                                                                  |
| ------ | ------------------ | --------------------------------------------------------------------------- |
| `400`  | `invalid_request`  | Body tidak valid, email kosong/tidak valid, atau password kosong            |
| `401`  | `unauthorized`     | Header `Authorization` tidak ada                                            |
| `401`  | `invalid_token`    | Access token tidak valid atau kedaluwarsa                                   |
| `403`  | `forbidden`        | Role bukan `admin`                                                          |
| `409`  | `duplicate_email`  | Email sudah terdaftar                                                       |
| `422`  | `validation_error` | Email tidak valid, password kurang dari 8 karakter, atau role tidak dikenal |
| `500`  | `internal_error`   | Kesalahan server                                                            |

Pesan `422` berisi teks validasi apa adanya, contoh `validation error: password must be at least 8 characters`.

---

### 3. Ubah User

```
PATCH /users/{userID}
```

Autentikasi: Bearer access token, role `admin`.

#### Path Parameter

| Field    | Tipe          | Wajib | Keterangan          |
| -------- | ------------- | ----- | ------------------- |
| `userID` | string (uuid) | Ya    | ID user yang diubah |

#### Request Body

Semua field opsional, tetapi minimal satu field harus diisi.

| Field       | Tipe    | Wajib | Keterangan                                                           |
| ----------- | ------- | ----- | -------------------------------------------------------------------- |
| `name`      | string  | Tidak | Di-trim; boleh kosong                                                |
| `role`      | string  | Tidak | `admin`, `petugas`, atau `viewer`                                    |
| `is_active` | boolean | Tidak | `false` untuk menonaktifkan akun                                     |
| `password`  | string  | Tidak | Minimal 8 karakter; string kosong diabaikan (password tidak berubah) |

```json
{
  "role": "viewer",
  "is_active": false
}
```

`email` tidak dapat diubah lewat endpoint ini.

#### Response `200 OK`

```json
{
  "data": {
    "id": "c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
    "email": "petugas2@fff.local",
    "name": "Petugas Pos 2",
    "role": "viewer",
    "is_active": false,
    "created_at": "2026-11-15T03:20:00Z",
    "updated_at": "2026-11-15T03:25:00Z"
  }
}
```

`updated_at` selalu diperbarui saat ada perubahan.

#### Error

| Status | Code               | Keterangan                                                                         |
| ------ | ------------------ | ---------------------------------------------------------------------------------- |
| `400`  | `invalid_id`       | `userID` bukan UUID valid                                                          |
| `400`  | `invalid_request`  | Body tidak valid                                                                   |
| `401`  | `unauthorized`     | Header `Authorization` tidak ada                                                   |
| `401`  | `invalid_token`    | Access token tidak valid atau kedaluwarsa                                          |
| `403`  | `forbidden`        | Role bukan `admin`                                                                 |
| `404`  | `not_found`        | User tidak ditemukan                                                               |
| `422`  | `validation_error` | Tidak ada field yang diisi, role tidak valid, atau password kurang dari 8 karakter |
| `500`  | `internal_error`   | Kesalahan server                                                                   |

## Catatan Perilaku

- Belum tersedia endpoint `GET /users/{userID}` dan `DELETE /users/{userID}`. Detail user hanya bisa dilihat lewat daftar, dan user tidak bisa dihapus (gunakan `is_active: false` untuk menonaktifkan).
- Menonaktifkan user tidak mencabut refresh token yang masih aktif dan middleware autentikasi tidak memeriksa `is_active`. Sesi lama tetap berjalan sampai access token kedaluwarsa; login dan refresh berikutnya akan mengembalikan `403 account_inactive`.
- Belum ada proteksi khusus agar admin tidak menonaktifkan dirinya sendiri atau menonaktifkan admin terakhir.
- Mengubah `role` user lain langsung memengaruhi akses setelah user tersebut login atau refresh token (role dibaca dari access token).
- Role `admin` wajib disimpan minimal satu agar manajemen user tetap bisa diakses.
- Semua aksi create dan update user dicatat pada audit log dengan aksi `user.create` dan `user.update`.

## Contoh Alur Frontend

1. `POST /users` untuk membuat user baru dengan role awal.
2. `GET /users` untuk menampilkan daftar user dan status aktifnya.
3. `PATCH /users/{userID}` dengan `{"role": "petugas"}` untuk menaikkan akses.
4. `PATCH /users/{userID}` dengan `{"is_active": false}` untuk menonaktifkan user yang tidak lagi bertugas.
