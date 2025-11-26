# RoomieRules API Testing

## Prerequisites
1. Start your development server: `npm run dev`
2. Register as a HOST and get your JWT token from localStorage
3. Replace `YOUR_JWT_TOKEN` in the requests below

## API Endpoints Testing

### 1. POST /api/houses (Create House)
```http
POST http://localhost:3001/api/houses
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "My Awesome House",
  "bank_account": "1234567890"
}
```

### 2. GET /api/houses (Read House Information)
```http
GET http://localhost:3001/api/houses
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. PUT /api/houses (Update House Name)
```http
PUT http://localhost:3001/api/houses
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Updated House Name"
}
```

### 4. DELETE /api/houses (Delete House)
```http
DELETE http://localhost:3001/api/houses
Authorization: Bearer YOUR_JWT_TOKEN
```

## How to Get Your JWT Token

1. Open your app in browser: http://localhost:3001
2. Register as a HOST (not roommate)
3. Open browser DevTools (F12)
4. Go to Application/Storage tab
5. Look for `auth_token` in localStorage
6. Copy the token value

## Expected Response Formats

### POST Response (201 Created):
```json
{
  "success": true,
  "data": {
    "house": {
      "id": 1,
      "name": "My Awesome House",
      "house_code": "ABC123",
      "host_id": 1
    }
  }
}
```

### GET Response (200 OK):
```json
{
  "success": true,
  "data": {
    "house": {
      "id": 1,
      "name": "My Awesome House",
      "house_code": "ABC123",
      "host_id": 1,
      "member_count": 1,
      "is_host": true
    }
  }
}
```

### PUT Response (200 OK):
```json
{
  "success": true,
  "data": {
    "house": {
      "id": 1,
      "name": "Updated House Name",
      "house_code": "ABC123",
      "host_id": 1,
      "member_count": 1,
      "is_host": true
    }
  }
}
```

### DELETE Response (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "House deleted successfully"
  }
}
```
