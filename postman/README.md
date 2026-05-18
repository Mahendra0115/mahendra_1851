# mahendra_1851 API Postman Testing Guide

This README provides the correct numbered order for testing APIs in Postman.

## Import Files

Import the following files into Postman:

- `postman/mahendra_1851.postman_collection.json`
- `postman/mahendra_1851.local.postman_environment.json`

After importing, select the `mahendra_1851 Local` environment from the environment dropdown.

## Run Project

```bash
npm install
npm run migration:run
npm run start:dev
```

Default base URL:

```text
http://localhost:3000
```

A default admin user is automatically seeded when the application starts:

```text
Email: admin@email.com
Password: admin
Role: ADMIN
```

## Test Order

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
11. `11 PATCH /brands/me - Brand Self Profile Update`
12. `12 PATCH /brands/:id/profile - Admin Update Any Brand Profile`
13. `13 PATCH /brands/:id/profile - Unauthorized Brand Access Test`
14. `14 POST /users/admin/users - Task 5 Create Author User`
15. `15 POST /users/login - Task 5 Author Login`
16. `16 POST /brands/:id/authors - Assign Author To Brand`
17. `17 GET /brands/:id/authors - List Brand Authors`
18. `18 POST /articles - Brand Create Article`
19. `19 GET /articles - Brand List Own Brand Articles`
20. `20 PATCH /articles/:id - Brand Update Article`
21. `21 POST /articles - Author Create Article`
22. `22 GET /articles - Author List Own Articles`
23. `23 PATCH /articles/:id - Author Update Own Article`
24. `24 DELETE /articles/:id - Author Delete Own Article`
25. `25 DELETE /brands/:id/authors/:authorId - Remove Author From Brand`

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

Admin token is required for protected admin APIs.

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

Note:

- The admin user's `brandId` should be `null`
- Postman automatically saves the token into `adminAccessToken`

---

### 03. Admin Create Brand

Only `ADMIN` role users can create brands.

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

Note:

- Postman automatically saves the generated `brandId`

---

### 04. Admin Create Brand User

Only `ADMIN` role users can create brand users.

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "email": "{{brandEmail}}",
  "password": "{{brandPassword}}",
  "fullName": "{{brandFullName}}",
  "role": "BRAND",
  "brandId": {{brandId}}
}
```

Expected behavior:

- Password is not returned in the response
- Brand credentials email is automatically sent

---

### 05. Brand Login

Brand users can log in using their own credentials.

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

Note:

- This generates a normal brand user token
- Postman automatically saves the token into `accessToken`

---

### 06. Admin Create User

Only `ADMIN` role users can access this endpoint.

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

Expected behavior:

- Password is not returned in the response

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

Expected behavior:

- Brand status should be updated to `APPROVED`

---

### 10. Admin Delete Brand

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

---

### 11. Brand Self Profile Update

A logged-in `BRAND` user can update only their own profile details.

```http
PATCH {{baseUrl}}/brands/me
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Updated Brand Name",
  "description": "Updated by brand user",
  "logoUrl": "https://logo.com/new-logo.png",
  "password": "newpassword123"
}
```

Supported fields:

- `name`
- `description`
- `logoUrl`
- `email`
- `password`
- `fullName`

Expected behavior:

- Brand users can update only their own profiles
- Passwords are automatically hashed
- Duplicate email validation is enabled

---

### 12. Admin Update Any Brand Profile

A logged-in `ADMIN` user can update any brand profile.

```http
PATCH {{baseUrl}}/brands/{{brandId}}/profile
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json

{
  "name": "Admin Updated Brand",
  "description": "Updated by admin"
}
```

Expected behavior:

- Admin users can update any brand profile
- This endpoint is protected by authorization guards

---

### 13. Unauthorized Brand Access Test

A `BRAND` user should not be able to update another brand’s profile.

```http
PATCH {{baseUrl}}/brands/999/profile
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Unauthorized Update"
}
```

Expected output:

```text
403 Forbidden
```

Expected behavior:

- Brand users cannot update another brand’s profile
- Ownership validation is properly enforced

---

## Task 5 APIs

Important:

- Run migration before testing: `npm run migration:run`
- For Task 5 flow, run setup requests `02`, `03`, `04`, `05`, `14`, `15`, then run `16` to `25`
- Skip `10 DELETE /brands/:id` until the end, because Task 5 needs the brand to exist

### 14. Task 5 Create Author User

```http
POST {{baseUrl}}/users/admin/users
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "email": "{{authorEmail}}",
  "password": "{{authorPassword}}",
  "fullName": "{{authorFullName}}",
  "role": "AUTHOR"
}
```

Expected output:

```json
{
  "id": 3,
  "email": "bob.author@example.com",
  "role": "AUTHOR",
  "brandId": null,
  "fullName": "Bob Author"
}
```

Postman saves `authorId`.

---

### 15. Task 5 Author Login

```http
POST {{baseUrl}}/users/login
Content-Type: application/json
```

Body:

```json
{
  "email": "{{authorEmail}}",
  "password": "{{authorPassword}}"
}
```

Expected output:

```json
{
  "accessToken": "AUTHOR_JWT_TOKEN",
  "user": {
    "id": 3,
    "email": "bob.author@example.com",
    "role": "AUTHOR",
    "brandId": null
  }
}
```

Postman saves `authorAccessToken`.

---

### 16. Assign Author To Brand

```http
POST {{baseUrl}}/brands/{{brandId}}/authors
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "authorId": {{authorId}}
}
```

Expected output:

```json
{
  "id": 1,
  "brandId": 1,
  "authorId": 3,
  "createdAt": "..."
}
```

---

### 17. List Brand Authors

```http
GET {{baseUrl}}/brands/{{brandId}}/authors
Authorization: Bearer {{adminAccessToken}}
```

Expected output:

```json
[
  {
    "id": 1,
    "brandId": 1,
    "authorId": 3,
    "author": {
      "id": 3,
      "email": "bob.author@example.com",
      "role": "AUTHOR",
      "brandId": null,
      "fullName": "Bob Author"
    }
  }
]
```

---

### 18. Brand Create Article

```http
POST {{baseUrl}}/articles
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Body:

```json
{
  "title": "{{articleTitle}}",
  "content": "{{articleContent}}"
}
```

Expected output:

```json
{
  "id": 1,
  "title": "Nike New Launch",
  "content": "Nike launched a new product.",
  "brandId": 1,
  "authorId": 2,
  "createdAt": "...",
  "updatedAt": "..."
}
```

Postman saves `articleId`.

---

### 19. Brand List Own Brand Articles

```http
GET {{baseUrl}}/articles
Authorization: Bearer {{accessToken}}
```

Expected output:

```json
[
  {
    "id": 1,
    "title": "Nike New Launch",
    "content": "Nike launched a new product.",
    "brandId": 1,
    "authorId": 2
  }
]
```

---

### 20. Brand Update Article

```http
PATCH {{baseUrl}}/articles/{{articleId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Body:

```json
{
  "title": "{{updatedArticleTitle}}",
  "content": "{{updatedArticleContent}}"
}
```

Expected output:

```json
{
  "id": 1,
  "title": "Nike Updated Launch",
  "content": "Updated by brand user.",
  "brandId": 1,
  "authorId": 2
}
```

---

### 21. Author Create Article

```http
POST {{baseUrl}}/articles
Authorization: Bearer {{authorAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "title": "{{authorArticleTitle}}",
  "content": "{{authorArticleContent}}",
  "brandId": {{brandId}}
}
```

Expected output:

```json
{
  "id": 2,
  "title": "Bob Article",
  "content": "This article is written by Bob for Nike.",
  "brandId": 1,
  "authorId": 3,
  "createdAt": "...",
  "updatedAt": "..."
}
```

Postman saves `authorArticleId`.

---

### 22. Author List Own Articles

```http
GET {{baseUrl}}/articles
Authorization: Bearer {{authorAccessToken}}
```

Expected output:

```json
[
  {
    "id": 2,
    "title": "Bob Article",
    "content": "This article is written by Bob for Nike.",
    "brandId": 1,
    "authorId": 3
  }
]
```

---

### 23. Author Update Own Article

```http
PATCH {{baseUrl}}/articles/{{authorArticleId}}
Authorization: Bearer {{authorAccessToken}}
Content-Type: application/json
```

Body:

```json
{
  "title": "{{updatedAuthorArticleTitle}}",
  "content": "{{updatedAuthorArticleContent}}"
}
```

Expected output:

```json
{
  "id": 2,
  "title": "Bob Updated Article",
  "content": "Bob updated his own article.",
  "brandId": 1,
  "authorId": 3
}
```

---

### 24. Author Delete Own Article

```http
DELETE {{baseUrl}}/articles/{{authorArticleId}}
Authorization: Bearer {{authorAccessToken}}
```

Expected output:

```json
{
  "message": "Article deleted successfully"
}
```

---

### 25. Remove Author From Brand

```http
DELETE {{baseUrl}}/brands/{{brandId}}/authors/{{authorId}}
Authorization: Bearer {{adminAccessToken}}
```

Expected output:

```json
{
  "message": "Author removed from brand successfully"
}
```

---

## Important Notes

- `{{baseUrl}}` default value: `http://localhost:3000`
- `{{accessToken}}` is automatically saved after brand login
- `{{adminAccessToken}}` is automatically saved after admin login
- `{{authorAccessToken}}` is automatically saved after author login
- `{{brandId}}` is automatically saved after brand creation
- `{{articleId}}` and `{{authorArticleId}}` are automatically saved after article creation
- Admin-only APIs return `403 Forbidden` for normal brand users
- Running migrations is required because `synchronize` is set to `false`
- Brand user credentials are automatically emailed during creation
- Mail service is configured using `@nestjs-modules/mailer` and `nodemailer`
- Local JSON transport is used if SMTP is not configured
