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

<<<<<<< task3-add-brand-status
1. `01 GET / - Health`
2. `02 POST /users/login - Seed Admin Login`
3. `03 POST /brands - Create Brand`
4. `04 POST /users/admin/users - Create Brand User`
5. `05 POST /users/login - Brand Login`
6. `06 POST /users/admin/users - Create User`
7. `07 GET /brands - List All Brands`
8. `08 PATCH /brands/:id - Update Brand`
9. `09 PATCH /brands/:id/status - Update Brand Status`
10. `10 DELETE /brands/:id - Delete Brand`
=======
1. `01 Health / 01 GET /`
2. `02 Auth / 02 POST /users/login - Seed Admin Login`
3. `03 Admin Users / 03 POST /users/admin/users - Create User`
4. `02 Auth / 04 POST /users/login - Brand Login`
5. `04 Admin Brands / 05 POST /brands - Create Brand`
6. `04 Admin Brands / 06 GET /brands - List All Brands`
7. `04 Admin Brands / 07 PATCH /brands/:id - Update Brand`
8. `04 Admin Brands / 08 DELETE /brands/:id - Delete Brand`
>>>>>>> main

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
<<<<<<< task3-add-brand-status

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

Note: Response me admin user ka `brandId` null aana chahiye. Postman automatically `adminAccessToken` environment variable mein save karega.

---

### 03. Admin Create Brand

Only `ADMIN` role token can create brand.
=======
>>>>>>> main

```http
POST {{baseUrl}}/brands
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
<<<<<<< task3-add-brand-status
  "name": "{{brandName}}",
  "description": "{{brandDescription}}",
  "logoUrl": "{{brandLogoUrl}}"
}
```

Note: Postman automatically `brandId` environment variable mein save karega.

---

### 04. Admin Create Brand User

Only `ADMIN` role token can create brand user.
=======
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}
```

Note: Postman automatically `adminAccessToken` environment variable mein save karega.

---

### 03. Admin Create User

Only `ADMIN` role token can access it.
>>>>>>> main

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
<<<<<<< task3-add-brand-status
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}",
  "fullName": "{{brandFullName}}",
  "role": "BRAND",
  "brandId": {{brandId}}
=======
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}",
  "fullName": "{{newUserFullName}}",
  "role": "{{newUserRole}}"
>>>>>>> main
}
```

Expected output mein password return nahi hota.

---

<<<<<<< task3-add-brand-status
### 05. Brand Login
=======
### 04. Brand Login

Admin-created brand user login ke liye.
>>>>>>> main

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
<<<<<<< task3-add-brand-status
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}"
=======
  "email": "{{newUserEmail}}",
  "password": "{{newUserPassword}}"
>>>>>>> main
}
```

Note: Ye token normal brand user ka token hai, admin token nahi.

---

<<<<<<< task3-add-brand-status
### 06. Admin Create User
=======
### 05. Admin Create Brand
>>>>>>> main

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
  "role": "{{newUserRole}}",
  "brandId": {{brandId}}
}
```

Expected output mein password return nahi hota.

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

<<<<<<< task3-add-brand-status
### 09. Admin Update Brand Status

```http
PATCH {{baseUrl}}/brands/{{brandId}}/status
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "status": "APPROVED"
}
```

Expected output mein brand ka `status` `APPROVED` return hoga.

---

### 10. Admin Delete Brand
=======
### 08. Admin Delete Brand
>>>>>>> main

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
<<<<<<< task3-add-brand-status
- `{{accessToken}}` brand login ke baad auto-save hota hai.
=======
- `{{accessToken}}` admin-created brand user login ke baad auto-save hota hai.
>>>>>>> main
- `{{adminAccessToken}}` admin login ke baad auto-save hota hai.
- `{{brandId}}` create brand ke baad auto-save hota hai.
- Admin-only APIs normal brand token se run karne par `403 Forbidden` return karengi.
- Migration run karna required hai because `synchronize` false hai.
