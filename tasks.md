# RoomieRules - Tasks Checklist

## 📋 Implementation Progress

### Foundation Tasks
- [x] **T001: Initialize Next.js Project** ✅ *Completed Nov 24, 2025*
  - Create new Next.js 14 project with TypeScript and App Router
  - Install dependencies: tailwindcss, lucide-react, clsx, @types/node
  - Configure tsconfig.json and next.config.js for development

- [x] **T002: Setup Database Schema** ✅ *Completed Nov 24, 2025*
  - Create in-memory SQLite database with better-sqlite3
  - Define tables: users, houses, bills, bill_payments, house_rules
  - Create database initialization script with proper foreign keys and indexes

- [x] **T003: Configure Tailwind & Layout** ✅ *Completed Nov 24, 2025*
  - Setup Tailwind CSS with mobile-first configuration
  - Create root layout.tsx with basic HTML structure
  - Add viewport meta tags for mobile and global CSS imports

### Authentication System
- [x] **T004: Create User Authentication System** ✅ *Completed Nov 24, 2025*
  - Implement basic email/password auth with JWT
  - Create login/register API routes (/api/auth/login, /api/auth/register, /api/auth/me)
  - Hash passwords with bcrypt and return JWT tokens

- [x] **T005: Build Auth Pages & Context** ✅ *Completed Nov 24, 2025*
  - Create login and register page components with forms
  - Implement AuthContext with React Context for user state management
  - Add protected route wrapper component for authenticated pages

### House Management
- [ ] **T006: Create House Management Models**
  - Build database models and API routes for houses
  - Implement /api/houses (POST create, GET user's house) and /api/houses/join (POST join by code)
  - Generate unique 6-character house codes

- [ ] **T007: Build Host House Creation**
  - Create house creation page (/house/create) for hosts only
  - Include form for house name and bank account number
  - Auto-generate house code and display it for sharing with roommates

- [ ] **T008: Build Roommate House Joining**
  - Create house joining page (/house/join) for roommates
  - Simple form with house code input field
  - Validate code exists and add user to house with roommate role

### Bill Management System
- [ ] **T009: Create Bill Models & API**
  - Build bill CRUD API routes: /api/bills (GET list, POST create), /api/bills/[id] (GET detail, PUT update, DELETE remove)
  - Include bill type validation (housing bills only for hosts)

- [ ] **T010: Implement Auto-Split Logic**
  - Create housing bill auto-split functionality
  - When host creates housing bill, automatically calculate equal splits among all house members
  - Create bill_payments records for each roommate

- [ ] **T011: Build Bill Creation Form**
  - Create bill creation page (/bills/create) with form fields: title, description, amount, type, due_date
  - Show different bill types based on user role (hosts see all types, roommates exclude housing)

- [ ] **T012: Create Bills List Page**
  - Build bills listing page (/bills) showing all house bills
  - Display bill cards with title, amount, type, status, and due date
  - Include filter buttons for bill types and status

- [ ] **T013: Build Bill Detail & Payment View**
  - Create individual bill detail page (/bills/[id]) showing full bill info
  - Show payment status for each member and host's bank account for housing bills
  - Display who has paid/pending

### Payment System
- [ ] **T014: Implement Receipt Upload System**
  - Create payment API routes: /api/payments/[billId]/pay (POST mark paid with receipt)
  - Implement simple file upload to local /uploads directory or store as base64 data URL for fake upload

- [ ] **T015: Build Payment Management Page**
  - Create payments page (/payments) showing user's payment obligations
  - List bills owed with amounts, due dates, and upload receipt functionality
  - Show payment history and status

### UI & User Experience
- [ ] **T016: Create Main Dashboard**
  - Build main dashboard page (/) showing bills summary: total owed, recent bills, payment status overview
  - Include quick action buttons for creating bills and viewing payments

- [ ] **T017: Add Navigation & Layout**
  - Create mobile-friendly navigation component with bottom tab bar or hamburger menu
  - Include navigation links: Dashboard, Bills, Payments, House, Logout
  - Add page headers and back buttons

- [ ] **T018: Style Mobile-First UI**
  - Apply Tailwind CSS styling for mobile-first responsive design
  - Style all forms, buttons, cards, and navigation for touch-friendly interaction
  - Ensure 44px minimum touch targets

- [ ] **T019: Add Basic Validation & Error Handling**
  - Add form validation for all input forms using browser validation or simple JavaScript checks
  - Implement basic error handling for API calls with user-friendly error messages and loading states

### Testing & Integration
- [ ] **T020: Test Complete User Flows**
  - Test end-to-end workflows: Host creates house and housing bill → Roommate joins house and sees split amount → Roommate uploads receipt → Host sees payment status
  - Fix any critical bugs

---

## 📊 Progress Summary
- **Total Tasks**: 20
- **Completed**: 5
- **In Progress**: 0
- **Remaining**: 15

## 🎯 Current Sprint Focus
Authentication system completed! Next up: T006-T008 House Management

---

## ✅ Task Completion Template
When completing a task, update the status using this format:
```
- [x] **T001: Initialize Next.js Project** ✅ *Completed [Date]*
```

## 🚧 Notes & Issues

### T001-T003 Implementation Notes (Nov 24, 2025)
- ✅ Next.js 14 with App Router successfully initialized
- ✅ SQLite database schema created with proper foreign keys and indexes
- ✅ Mobile-first Tailwind CSS configuration completed
- ✅ Touch-friendly UI components and utilities added
- ✅ Development server running on http://localhost:3001
- 📦 Dependencies installed: better-sqlite3, bcryptjs, jsonwebtoken, lucide-react, clsx
- 🎨 Custom CSS classes for mobile-optimized buttons, forms, and navigation
- 📱 iOS Safari compatible viewport and meta tags configured

### T004-T005 Implementation Notes (Nov 24, 2025)
- ✅ JWT-based authentication system implemented with bcrypt password hashing
- ✅ Three API routes: /api/auth/login, /api/auth/register, /api/auth/me
- ✅ AuthContext with React Context provides user state management
- ✅ ProtectedRoute component guards authenticated pages
- ✅ Login page with email/password form and password visibility toggle
- ✅ Register page with role selection (host/roommate) and form validation
- ✅ Dashboard page shows user info and next steps based on role
- 🔒 Secure authentication flow: register → auto-login → dashboard redirect
- 📱 Mobile-optimized forms with touch-friendly inputs and proper validation
