# Postman API Testing

Import these two files into Postman:

- `day-1-auth.postman_collection.json`
- `day-1-local.postman_environment.json`

Select the `Mahendra 1851 - Local` environment before running requests.

Required API test flow:

1. Start PostgreSQL and the NestJS app.
2. Run `01 - Signup Brand User`.
3. Run `02 - Login Admin`.
4. Login response ka `accessToken` copy karke environment variable `adminAccessToken` me paste karo.
5. Run `03 - Admin Creates Brand User`.
6. Run `04 - Admin Creates Admin User`.

Simple API reference:

| No. | API | Body | Response |
| --- | --- | --- | --- |
| 01 | `POST /users/signup` | `email`, `password`, `fullName` | `accessToken` and `user` |
| 02 | `POST /users/login` | `email`, `password` | `accessToken` and `user` |
| 03 | `POST /users/admin/users` | `email`, `password`, `fullName`, `role: BRAND` | created user JSON |
| 04 | `POST /users/admin/users` | `email`, `password`, `fullName`, `role: ADMIN` | created user JSON |

## APIs

### 1. Brand Signup

Creates a brand user account.

```http
POST {{baseUrl}}/users/signup
```

Body:

```json
{
  "fullName": "Brand User",
  "email": "brand@example.com",
  "password": "brand123"
}
```

Response:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "brand@example.com",
    "role": "BRAND",
    "fullName": "Brand User",
    "createdAt": "date-time",
    "updatedAt": "date-time"
  }
}
```

### 2. Admin Login

Logs in the seeded admin user.

```http
POST {{baseUrl}}/users/login
```

Body:

```json
{
  "email": "admin@email.com",
  "password": "admin"
}
```

Response:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "admin@email.com",
    "role": "ADMIN",
    "fullName": "Admin",
    "createdAt": "date-time",
    "updatedAt": "date-time"
  }
}
```

### 3. Admin Creates Brand User

Creates a brand user from an admin account.

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
```

Body:

```json
{
  "fullName": "Admin Created Brand",
  "email": "admin-created-brand@example.com",
  "password": "brand123",
  "role": "BRAND"
}
```

Response:

```json
{
  "id": 2,
  "email": "admin-created-brand@example.com",
  "role": "BRAND",
  "fullName": "Admin Created Brand",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### 4. Admin Creates Admin User

Creates another admin user from an admin account.

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
```

Body:

```json
{
  "fullName": "Admin Created Admin",
  "email": "admin-created-admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

Response:

```json
{
  "id": 3,
  "email": "admin-created-admin@example.com",
  "role": "ADMIN",
  "fullName": "Admin Created Admin",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

## Seeded Admin

The seeded admin credentials are:

- Email: `admin@email.com`
- Password: `admin`
