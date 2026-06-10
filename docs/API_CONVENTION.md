# API Convention – Voucher EC

## Base URL

- Dev: `http://localhost:3000/api`

---

## Response Envelope (mọi response đều bọc trong đây)

### Thành công – single object

```json
{ "success": true, "data": { ... } }
```

### Thành công – danh sách có phân trang

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1, "limit": 20,
    "total": 100, "totalPages": 5
  }
}
```

### Lỗi

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi thân thiện người dùng"
  }
}
```

---

## HTTP Status Codes

| Code | Dùng khi                                              |
| ---- | ----------------------------------------------------- |
| 200  | Thành công (GET, PUT, PATCH)                          |
| 201  | Tạo mới thành công (POST)                             |
| 400  | Input sai format hoặc thiếu field                     |
| 401  | Chưa đăng nhập / token hết hạn                        |
| 403  | Không có quyền (sai role)                             |
| 404  | Không tìm thấy                                        |
| 409  | Conflict (email trùng, hết hàng, code đã dùng)        |
| 422  | Vi phạm business rule (voucher hết hạn, bán vượt qty) |
| 500  | Lỗi server                                            |

---

## Error Codes chuẩn

| Code                  | Nghĩa                        |
| --------------------- | ---------------------------- |
| `VALIDATION_ERROR`    | Input sai                    |
| `UNAUTHORIZED`        | Chưa xác thực                |
| `FORBIDDEN`           | Không đủ quyền               |
| `NOT_FOUND`           | Không tìm thấy               |
| `CONFLICT`            | Trùng dữ liệu / hết số lượng |
| `BUSINESS_RULE_ERROR` | Vi phạm quy tắc nghiệp vụ    |
| `RATE_LIMIT`          | Quá nhiều request            |
| `INTERNAL_ERROR`      | Lỗi server                   |

---

## Authentication

```
Authorization: Bearer <access_token>
```

- Mọi route trừ `GET /api/vouchers` (public) đều cần token.
- **Voucher code chỉ xuất hiện trong response khi `order.status === 'PAID'`**.

---

## Route Prefix theo Role

```
/api/auth/*            → public (register, login, refresh, forgot-password)
/api/customer/*        → yêu cầu role: CUSTOMER
/api/partner/*         → yêu cầu role: PARTNER
/api/admin/*           → yêu cầu role: ADMIN
/api/vouchers          → public (search, detail — không có code)
```

---

## Pagination

Query params: `?page=1&limit=20`

- Default: `page=1`, `limit=20`
- Max limit: `100`
- **Tất cả GET trả danh sách phải có pagination — không exception.**

---

## Quy tắc đặt tên

| Loại            | Quy tắc    | Ví dụ                    |
| --------------- | ---------- | ------------------------ |
| Route           | kebab-case | `/voucher-codes`         |
| Query param     | camelCase  | `?partnerId=`            |
| JSON field      | camelCase  | `{ "salePrice": 50000 }` |
| File TypeScript | camelCase  | `voucher.service.ts`     |
