# RoomieRules - MVP Specification

## 🎯 Project Overview

**RoomieRules** is a minimal mobile-web application platform for roommate bill management and house rules coordination. The system supports two user roles (Host and Roommate) with a focus on shared bill splitting, particularly housing bills that auto-distribute equally among all roommates.

**Target Implementation Time:** 3 hours
**Core Problem:** Simplified roommate expense sharing with automatic housing bill distribution

---

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend:** React (Create React App) with Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** SQLite (for simplicity)
- **Authentication:** Simple JWT-based email/password
- **File Storage:** Local filesystem for receipts

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │───▶│   Express API   │───▶│   SQLite DB     │
│   (Frontend)    │    │   (Backend)     │    │   (Data)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    Tailwind CSS            JWT Auth              Local Files
    Minimal UI             REST APIs            (Receipts)
```

---

## 📊 Data Models

### 1. Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('host', 'roommate') DEFAULT 'roommate',
  house_id INTEGER,
  bank_account VARCHAR(50), -- Only for hosts
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (house_id) REFERENCES houses(id)
);
```

### 2. Houses
```sql
CREATE TABLE houses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  house_code VARCHAR(10) UNIQUE NOT NULL, -- For roommates to join
  host_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id)
);
```

### 3. Bills
```sql
CREATE TABLE bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('housing', 'grocery', 'eat-out', 'other') NOT NULL,
  house_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  split_amount DECIMAL(10,2), -- Auto-calculated for housing bills
  due_date DATE,
  status ENUM('active', 'closed') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 4. Bill Payments
```sql
CREATE TABLE bill_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount_owed DECIMAL(10,2) NOT NULL,
  receipt_url VARCHAR(500),
  status ENUM('pending', 'paid') DEFAULT 'pending',
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5. House Rules (Optional/Minimal)
```sql
CREATE TABLE house_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  house_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🛣️ API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### House Management
- `POST /api/houses` - Create house (Host only)
- `POST /api/houses/join` - Join house by code (Roommate)
- `GET /api/houses/my` - Get user's house info
- `GET /api/houses/:id/members` - Get house members

### Bill Management
- `GET /api/bills` - Get all bills for user's house
- `POST /api/bills` - Create new bill
- `GET /api/bills/:id` - Get specific bill details
- `PUT /api/bills/:id` - Update bill (Creator only)
- `DELETE /api/bills/:id` - Delete bill (Creator only)

### Payment Management
- `GET /api/payments/my` - Get user's payment obligations
- `POST /api/payments/:billId/pay` - Mark payment and upload receipt
- `GET /api/payments/:billId` - Get payment status for a bill

### File Upload
- `POST /api/upload/receipt` - Upload payment receipt

### House Rules (Minimal)
- `GET /api/rules` - Get house rules
- `POST /api/rules` - Create new rule
- `DELETE /api/rules/:id` - Delete rule

---

## 🎨 Frontend Components

### 1. Authentication Pages
- **LoginPage** (`/login`)
  - Email/password form
  - Link to register
- **RegisterPage** (`/register`)
  - Registration form with role selection

### 2. House Setup
- **CreateHousePage** (`/create-house`) - Host only
  - House name input, generates house code
- **JoinHousePage** (`/join-house`) - Roommate only
  - House code input

### 3. Main Dashboard
- **DashboardPage** (`/dashboard`)
  - Bills summary (total owed, paid/unpaid)
  - Quick actions (create bill, view payments)
  - Recent activity

### 4. Bill Management
- **BillListPage** (`/bills`)
  - List all house bills
  - Filter by type, status
- **CreateBillPage** (`/bills/create`)
  - Bill creation form
  - Type selection (housing bills restricted to hosts)
- **BillDetailPage** (`/bills/:id`)
  - Bill details and payment status
  - Payment upload for roommates

### 5. Payment Management
- **MyPaymentsPage** (`/payments`)
  - User's payment obligations
  - Upload receipt functionality
  - Payment history

### 6. House Rules (Minimal)
- **RulesPage** (`/rules`)
  - Simple list of house rules
  - Add/remove functionality

### 7. Shared Components
- **Header** - Navigation with user info and logout
- **ProtectedRoute** - Route guard for authenticated users
- **LoadingSpinner** - Simple loading indicator
- **Modal** - Reusable modal component

---

## 🔄 User Workflows

### Host Workflow
1. **Setup:**
   - Register as Host
   - Create house → Get house code
   - Share code with roommates

2. **Bill Management:**
   - Create housing bills (auto-splits among all roommates)
   - Create other bills (grocery, etc.)
   - View payment status from roommates

3. **Payment Tracking:**
   - See who has paid/pending
   - Access uploaded receipts

### Roommate Workflow
1. **Setup:**
   - Register as Roommate
   - Join house using code

2. **Bill Interaction:**
   - View assigned bills and amounts owed
   - See host's bank account for housing bills
   - Create non-housing bills

3. **Payment Process:**
   - Pay bills externally (bank transfer)
   - Upload payment receipts
   - Track payment history

---

## ⚡ Key Business Logic

### Housing Bill Auto-Split
```javascript
// When host creates housing bill
function createHousingBill(billData, houseId) {
  const houseMembers = await getHouseMemberCount(houseId);
  const splitAmount = billData.amount / houseMembers;
  
  // Create bill
  const bill = await createBill({
    ...billData,
    type: 'housing',
    split_amount: splitAmount
  });
  
  // Create payment records for each member
  const members = await getHouseMembers(houseId);
  for (const member of members) {
    await createBillPayment({
      bill_id: bill.id,
      user_id: member.id,
      amount_owed: splitAmount,
      status: 'pending'
    });
  }
}
```

### Payment Receipt Upload
```javascript
function uploadPaymentReceipt(billId, userId, receiptFile) {
  // Save file locally
  const filename = `receipt_${billId}_${userId}_${Date.now()}`;
  const filepath = await saveFile(receiptFile, filename);
  
  // Update payment record
  await updateBillPayment(billId, userId, {
    receipt_url: filepath,
    status: 'paid',
    paid_at: new Date()
  });
}
```

---

## 🔒 PDPA Compliance Notes

### Data Collection
- **Minimal collection:** Only name, email, phone, bank account (host only)
- **Purpose:** Essential for bill sharing and payment coordination
- **No unnecessary data:** No analytics, tracking, or personal preferences

### Data Storage
- **Local storage:** All data stored locally in SQLite
- **No third-party services:** Receipts stored on local filesystem
- **Access control:** Users only see their house data

### Data Usage
- **Functional only:** Data used solely for app functionality
- **No sharing:** No data shared with external parties
- **User control:** Users can delete their accounts and data

---

## 📝 Implementation Notes

### Simplifications for MVP
1. **No real-time updates** - Simple page refreshes
2. **Basic file upload** - Local storage only
3. **Simple validation** - Client-side basic validation
4. **No email notifications** - Manual coordination
5. **Single house per user** - No multi-house support

### Future Enhancements (Out of Scope)
- Push notifications
- Payment integration (Stripe, PayPal)
- Advanced bill splitting (unequal shares)
- Mobile app (React Native)
- Real-time chat
- Bill approval workflows
- Analytics dashboard

### Development Priorities
1. **Core functionality first** - Bills and payments
2. **Simple UI** - Functional over beautiful
3. **Happy path focus** - Minimal error handling
4. **Manual testing** - No automated tests for MVP

---

## 🎯 Success Criteria

### Functional Requirements
- [x] Host can create house and bills (including housing bills)
- [x] Roommates can join house and create non-housing bills
- [x] Housing bills auto-split equally among all roommates
- [x] Roommates can upload payment receipts
- [x] Users can view their payment obligations and history
- [x] Host's bank account visible for housing bill payments

### Technical Requirements
- [x] Responsive web interface
- [x] JWT-based authentication
- [x] RESTful API design
- [x] SQLite data persistence
- [x] Basic PDPA compliance

### User Experience
- [x] Simple registration and house setup flow
- [x] Clear bill and payment status visibility
- [x] Easy receipt upload process
- [x] Intuitive navigation between features

---

*This specification is designed for rapid development and can be fully implemented within the 3-hour timeframe by focusing on core functionality and minimal UI design.*
