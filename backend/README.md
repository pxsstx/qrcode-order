# QR Code Order API

Backend API for QR Code Order Management System built with Hono and Bun.

## 🚀 Getting Started

### Prerequisites

- Bun runtime
- PostgreSQL database

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bunx prisma migrate dev

# Start development server
bun run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/qrcode_order"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
```

## 📚 API Documentation

Base URL: `http://localhost:3001/api/v1`

### Authentication

The API uses JWT tokens for authentication. Tokens are stored in HTTP-only cookies for security.

**Headers:**

```
Authorization: Bearer <token>
```

**Cookie:**

```
token=<jwt-token>
```

---

## 🔐 Authentication Routes (`/api/v1/auth`)

### Register

**POST** `/api/v1/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STAFF",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Login

**POST** `/api/v1/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "ADMIN"
    }
  }
}
```

**Note:** Token is automatically set in HTTP-only cookie.

---

### Get Current User

**GET** `/api/v1/auth/me`

Get authenticated user's profile.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Update Profile

**PATCH** `/api/v1/auth/me`

Update authenticated user's profile.

**Authentication:** Required

**Request Body:**

```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "role": "MANAGER"
}
```

**Note:** Only ADMIN and MANAGER can change roles.

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "new_username",
    "email": "newemail@example.com",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Change Password

**PATCH** `/api/v1/auth/change-password`

Change authenticated user's password.

**Authentication:** Required

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Logout

**POST** `/api/v1/auth/logout`

Logout and clear authentication token.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 👥 User Management Routes (`/api/v1/users`)

### Get All Users

**GET** `/api/v1/users`

Get list of all users with optional filters.

**Authentication:** ADMIN only

**Query Parameters:**

- `role` - Filter by role (ADMIN, MANAGER, STAFF)
- `active` - Filter by active status (true/false)

**Example:** `/api/v1/users?role=STAFF&active=true`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get User by ID

**GET** `/api/v1/users/:id`

Get specific user details.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Create User

**POST** `/api/v1/users`

Create a new user.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "STAFF"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "new_user",
    "email": "newuser@example.com",
    "role": "STAFF",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Update User

**PUT** `/api/v1/users/:id`

Update user details.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "username": "updated_user",
  "email": "updated@example.com",
  "role": "MANAGER",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "username": "updated_user",
    "email": "updated@example.com",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

---

### Delete User

**DELETE** `/api/v1/users/:id`

Delete a user.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## 🍽️ Menu Routes (`/api/v1/menus`)

### Get All Menus

**GET** `/api/v1/menus`

Get list of all menu items.

**Authentication:** Public

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Burger",
      "description": "Delicious beef burger",
      "price": 10.99,
      "category": "MAIN",
      "isAvailable": true,
      "imageUrl": "https://example.com/burger.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Menu by ID

**GET** `/api/v1/menus/:id`

Get specific menu item details.

**Authentication:** Public

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Burger",
    "description": "Delicious beef burger",
    "price": 10.99,
    "category": "MAIN",
    "isAvailable": true,
    "imageUrl": "https://example.com/burger.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Create Menu Item

**POST** `/api/v1/menus`

Create a new menu item.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "name": "Pizza",
  "description": "Delicious pizza",
  "price": 15.99,
  "category": "MAIN",
  "imageUrl": "https://example.com/pizza.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 2,
    "name": "Pizza",
    "description": "Delicious pizza",
    "price": 15.99,
    "category": "MAIN",
    "isAvailable": true,
    "imageUrl": "https://example.com/pizza.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Update Menu Item

**PUT** `/api/v1/menus/:id`

Update menu item details.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "name": "Updated Pizza",
  "description": "Updated description",
  "price": 16.99,
  "category": "MAIN",
  "isAvailable": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "id": 2,
    "name": "Updated Pizza",
    "description": "Updated description",
    "price": 16.99,
    "category": "MAIN",
    "isAvailable": true,
    "imageUrl": "https://example.com/pizza.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

---

### Delete Menu Item

**DELETE** `/api/v1/menus/:id`

Delete a menu item.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "message": "Menu item deleted successfully",
  "data": null
}
```

---

### Toggle Menu Availability

**PATCH** `/api/v1/menus/:id/toggle`

Toggle menu item availability.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "message": "Menu availability toggled successfully",
  "data": {
    "id": 1,
    "name": "Burger",
    "isAvailable": false
  }
}
```

---

## 📋 Order Routes (`/api/v1/orders`)

### Create Order

**POST** `/api/v1/orders`

Create a new order.

**Authentication:** Public (for QR code orders)

**Request Body:**

```json
{
  "tableId": 1,
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "tableId": 1,
    "status": "PENDING",
    "total": 21.98,
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "quantity": 2,
        "price": 10.99,
        "specialInstructions": "No onions"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Orders

**GET** `/api/v1/orders`

Get list of all orders.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableId": 1,
      "status": "PENDING",
      "total": 21.98,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Order by ID

**GET** `/api/v1/orders/:id`

Get specific order details.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableId": 1,
    "status": "PENDING",
    "total": 21.98,
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "quantity": 2,
        "price": 10.99,
        "specialInstructions": "No onions"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get Orders by Table

**GET** `/api/v1/orders/table/:tableId`

Get all orders for a specific table.

**Authentication:** Public

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableId": 1,
      "status": "PENDING",
      "total": 21.98,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Update Order Status

**PATCH** `/api/v1/orders/:id/status`

Update order status.

**Authentication:** Required

**Request Body:**

```json
{
  "status": "PREPARING"
}
```

**Valid Statuses:** PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED

**Response:**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "PREPARING"
  }
}
```

---

### Delete Order

**DELETE** `/api/v1/orders/:id`

Delete an order.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": null
}
```

---

## 🪑 Table Routes (`/api/v1/tables`)

### Get All Tables

**GET** `/api/v1/tables`

Get list of all tables.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "number": "T-001",
      "capacity": 4,
      "isOccupied": false,
      "qrCode": "https://example.com/qr/table-1",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Table by ID

**GET** `/api/v1/tables/:id`

Get specific table details.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "number": "T-001",
    "capacity": 4,
    "isOccupied": false,
    "qrCode": "https://example.com/qr/table-1",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Create Table

**POST** `/api/v1/tables`

Create a new table.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "number": "T-002",
  "capacity": 6
}
```

**Response:**

```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "id": 2,
    "number": "T-002",
    "capacity": 6,
    "isOccupied": false,
    "qrCode": "https://example.com/qr/table-2",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Update Table

**PUT** `/api/v1/tables/:id`

Update table details.

**Authentication:** ADMIN only

**Request Body:**

```json
{
  "number": "T-002-UPDATED",
  "capacity": 8,
  "isOccupied": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Table updated successfully",
  "data": {
    "id": 2,
    "number": "T-002-UPDATED",
    "capacity": 8,
    "isOccupied": true,
    "qrCode": "https://example.com/qr/table-2",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

---

### Delete Table

**DELETE** `/api/v1/tables/:id`

Delete a table.

**Authentication:** ADMIN only

**Response:**

```json
{
  "success": true,
  "message": "Table deleted successfully",
  "data": null
}
```

---

### Toggle Table Occupancy

**PATCH** `/api/v1/tables/:id/toggle`

Toggle table occupied status.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Table occupancy toggled successfully",
  "data": {
    "id": 1,
    "number": "T-001",
    "isOccupied": true
  }
}
```

---

## 🔒 User Roles

The system supports three user roles:

- **ADMIN** - Full system access
- **MANAGER** - Can manage users and content
- **STAFF** - Basic operational access

## 📝 Response Format

All API responses follow this format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description"
}
```

## 🚨 Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## 🛠️ Development

```bash
# Run database migrations
bunx prisma migrate dev

# Generate Prisma client
bunx prisma generate

# Start development server with hot reload
bun run dev

# Build for production
bun run build
```

## 📦 Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (HTTP-only cookies)
- **Password Hashing:** bcrypt

## 📄 License

MIT
