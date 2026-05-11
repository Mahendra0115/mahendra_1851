# mahendra_1851 API Postman Testing Guide

Ye README Postman mein API test karne ke liye simple format mein hai.

## Import files

Postman mein ye dono files import karein:

- `postman/mahendra_1851.postman_collection.json`
- `postman/mahendra_1851.local.postman_environment.json`

Import ke baad environment dropdown se `mahendra_1851 Local` select karein.

## Run project

```bash
npm install
npm run start:dev
```

Default base URL:

```text
http://localhost:3000
```

Default admin user app start hone par automatically create hota hai:

```text
Email: admin@email.com
Password: admin
Role: ADMIN
```

## Test order

1. `Health / GET /`
2. `Auth / POST /users/signup - Brand Signup`
3. `Auth / POST /users/login - Brand Login`
4. `Auth / POST /users/login - Seed Admin Login`
5. `Admin / POST /users/admin/users - Create User`

---

### 1. Health Check

Tests backend server is running or not.

```http
GET {{baseUrl}}/
```

Body:

```text
No body required.
```

Expected output:

```text
Hello World!
```

---

### 2. Brand Signup

Creates a normal `BRAND` user. This API saves user data in database and returns JWT token.

```http
POST {{baseUrl}}/users/signup
Content-Type: application/json
```

Body:

```json
{
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}",
  "fullName": "{{brandFullName}}"
}
```

Example body:

```json
{
  "email": "brand1@example.com",
  "password": "brand1234",
  "fullName": "Brand User"
}
```

Expected output:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "brand1@example.com",
    "role": "BRAND",
    "fullName": "Brand User",
    "createdAt": "2026-05-11T10:00:00.000Z",
    "updatedAt": "2026-05-11T10:00:00.000Z"
  }
}
```

Note: Postman automatically `accessToken` environment variable mein save karega.

---

### 3. Brand Login

Tests login for already created `BRAND` user. If email and password are correct, API returns JWT token.

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}"
}
```

Example body:

```json
{
  "email": "brand1@example.com",
  "password": "brand1234"
}
```

Expected output:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "brand1@example.com",
    "role": "BRAND",
    "fullName": "Brand User",
    "createdAt": "2026-05-11T10:00:00.000Z",
    "updatedAt": "2026-05-11T10:00:00.000Z"
  }
}
```

Note: Ye token normal brand user ka token hai, admin token nahi.

---

### 4. Seed Admin Login

Tests login for default admin user. Admin token protected admin APIs ke liye required hai.

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}
```

Example body:

```json
{
  "email": "admin@email.com",
  "password": "admin"
}
```

Expected output:

```json
{
  "accessToken": "admin-jwt-token-here",
  "user": {
    "id": 2,
    "email": "admin@email.com",
    "role": "ADMIN",
    "fullName": "Admin",
    "createdAt": "2026-05-11T10:00:00.000Z",
    "updatedAt": "2026-05-11T10:00:00.000Z"
  }
}
```

Note: Postman automatically `adminAccessToken` environment variable mein save karega.

---

### 5. Admin Create User

Creates a new user by admin. This API is protected. Only `ADMIN` role token can access it.

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}",
  "fullName": "{{newUserFullName}}",
  "role": "{{newUserRole}}"
}
```

Example body:

```json
{
  "email": "created-by-admin@example.com",
  "password": "user1234",
  "fullName": "Created By Admin",
  "role": "BRAND"
}
```

Expected output:

```json
{
  "id": 3,
  "email": "created-by-admin@example.com",
  "role": "BRAND",
  "fullName": "Created By Admin",
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

Note: Password response mein return nahi hota. `role` value `ADMIN` ya `BRAND` ho sakti hai.

---

### 6. Duplicate Email - Error Case

Tests duplicate email. Same email se signup ya admin create user dobara call karne par user create nahi hoga.

```http
POST {{baseUrl}}/users/signup
Content-Type: application/json
```

Body:

```json
{
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}",
  "fullName": "{{brandFullName}}"
}
```

Expected output:

```json
{
  "message": "Email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### 7. Wrong Login - Error Case

Tests wrong email or password. Login should fail and token should not be generated.

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "wrong@example.com",
  "password": "wrongpass"
}
```

Expected output:

```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### 8. Admin Create User Without Token - Error Case

Tests protected admin API without token. User should not be created.

```http
POST {{baseUrl}}/users/admin/users
Content-Type: application/json
```

Body:

```json
{
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}",
  "fullName": "{{newUserFullName}}",
  "role": "{{newUserRole}}"
}
```

Expected output:

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 9. Admin Create User With Brand Token - Error Case

Tests admin API using normal brand token. User should not be created because brand user is not admin.

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Body:

```json
{
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}",
  "fullName": "{{newUserFullName}}",
  "role": "{{newUserRole}}"
}
```

Expected output:

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

## Important notes

- `{{baseUrl}}` default value: `http://localhost:3000`
- `{{accessToken}}` brand signup/login ke baad auto-save hota hai.
- `{{adminAccessToken}}` admin login ke baad auto-save hota hai.
- Duplicate email aaye to environment mein email value change karke request dobara run karein.
- Valid role values: `ADMIN`, `BRAND`
