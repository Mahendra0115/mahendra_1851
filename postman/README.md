# mahendra_1851 API Postman Testing Guide

Ye README Postman mein API test karne ke liye numbered order mein hai.

## Import files

Postman mein ye dono files import karein:

- `postman/mahendra_1851.postman_collection.json`
- `postman/mahendra_1851.local.postman_environment.json`

Import ke baad environment dropdown se `mahendra_1851 Local` select karein.

## Run project

```bash
npm install
npm run migration:run
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

1. `01 Health / 01 GET /`
2. `02 Auth / 02 POST /users/login - Seed Admin Login`
3. `03 Admin Users / 03 POST /users/admin/users - Create User`
4. `02 Auth / 04 POST /users/login - Brand Login`
5. `04 Admin Brands / 05 POST /brands - Create Brand`
6. `04 Admin Brands / 06 GET /brands - List All Brands`
7. `04 Admin Brands / 07 PATCH /brands/:id - Update Brand`
8. `04 Admin Brands / 08 DELETE /brands/:id - Delete Brand`

---

### 01. Health Check

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

### 02. Seed Admin Login

Admin token protected admin APIs ke liye required hai.

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

Note: Postman automatically `adminAccessToken` environment variable mein save karega.

---

### 03. Admin Create User

Only `ADMIN` role token can access it.

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

Expected output mein password return nahi hota.

---

### 04. Brand Login

Admin-created brand user login ke liye.

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}"
}
```

Note: Ye token normal brand user ka token hai, admin token nahi.

---

### 05. Admin Create Brand

Only `ADMIN` role token can create brand.

```http
POST {{baseUrl}}/brands
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "{{brandName}}",
  "description": "{{brandDescription}}",
  "logoUrl": "{{brandLogoUrl}}"
}
```

Expected output:

```json
{
  "id": 1,
  "name": "Nike",
  "description": "Sportswear brand",
  "logoUrl": "https://example.com/nike-logo.png",
  "createdById": 1,
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

Note: Postman automatically `brandId` environment variable mein save karega.

---

### 06. Admin List All Brands

```http
GET {{baseUrl}}/brands
Authorization: Bearer {{adminAccessToken}}
```

Expected output:

```json
[
  {
    "id": 1,
    "name": "Nike",
    "description": "Sportswear brand",
    "logoUrl": "https://example.com/nike-logo.png",
    "createdById": 1,
    "createdAt": "2026-05-11T10:00:00.000Z",
    "updatedAt": "2026-05-11T10:00:00.000Z"
  }
]
```

---

### 07. Admin Update Brand

```http
PATCH {{baseUrl}}/brands/{{brandId}}
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "{{updatedBrandName}}",
  "description": "{{updatedBrandDescription}}",
  "logoUrl": "{{updatedBrandLogoUrl}}"
}
```

---

### 08. Admin Delete Brand

```http
DELETE {{baseUrl}}/brands/{{brandId}}
Authorization: Bearer {{adminAccessToken}}
```

Expected output:

```json
{
  "message": "Brand deleted successfully"
}
```

## Important notes

- `{{baseUrl}}` default value: `http://localhost:3000`
- `{{accessToken}}` admin-created brand user login ke baad auto-save hota hai.
- `{{adminAccessToken}}` admin login ke baad auto-save hota hai.
- `{{brandId}}` create brand ke baad auto-save hota hai.
- Admin-only APIs normal brand token se run karne par `403 Forbidden` return karengi.
- Migration run karna required hai because `synchronize` false hai.
