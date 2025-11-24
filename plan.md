# RoomieRules - Development Plan

## 🎯 Project Goal
Build a fully functional MVP of RoomieRules that runs locally in Xcode Simulator using modern web technologies.

## 🛠️ Technology Stack

### Frontend & Framework
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend & Database
- **Supabase** for backend services (auth + database)
- **Alternative**: In-memory SQLite with better-sqlite3 (if Supabase setup takes too long)
- **Next.js API Routes** for custom business logic

### Mobile Development
- **Responsive web app** optimized for mobile viewports
- **PWA capabilities** for native-like experience
- **iOS Safari** compatibility for Xcode Simulator

### Authentication
- **Supabase Auth** (email/password)
- **Alternative**: Simple JWT with in-memory storage

## 📱 Mobile-First Considerations

### Design Approach
- **Mobile-first responsive design** with Tailwind breakpoints
- **Touch-friendly UI** with adequate tap targets (44px minimum)
- **Native-like navigation** patterns for iOS
- **Bottom navigation** for primary actions
- **Full-height layouts** optimized for mobile screens

### iOS Simulator Compatibility
- **Viewport meta tag** configuration for proper scaling
- **Safe area handling** for notched devices
- **Touch gestures** and swipe interactions
- **iOS-specific styling** adjustments

### Performance Optimization
- **Code splitting** with Next.js automatic optimization
- **Image optimization** with Next.js Image component
- **Minimal bundle size** to ensure fast loading on mobile
- **Offline capability** considerations for PWA

## 🗄️ Database Strategy

### Option 1: Supabase (Recommended)
**Advantages:**
- Real-time subscriptions for live updates
- Built-in authentication
- Row Level Security (RLS) for data protection
- Hosted solution with minimal setup

**Database Schema:**
- Use Supabase dashboard to create tables
- Enable RLS policies for user isolation
- Set up foreign key relationships
- Configure auth policies

### Option 2: In-Memory SQLite (Fallback)
**Advantages:**
- Faster initial setup
- No external dependencies
- Local development friendly

**Implementation:**
- Use better-sqlite3 for Node.js compatibility
- Store database file in project root
- Reset data on server restart (acceptable for MVP)

## 🏗️ Project Structure

### Next.js App Router Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── bills/
│   │   ├── payments/
│   │   ├── rules/
│   │   └── house/
│   ├── api/
│   │   ├── auth/
│   │   ├── bills/
│   │   ├── houses/
│   │   ├── payments/
│   │   └── upload/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── features/
├── lib/
│   ├── supabase/
│   ├── types/
│   ├── utils/
│   └── validations/
└── hooks/
```

## 🚀 Development Phases

### Phase 1: Project Foundation (30 minutes)
**Setup & Configuration**
- Initialize Next.js 14 project with TypeScript
- Configure Tailwind CSS with mobile-first approach
- Set up Supabase project and connection
- Configure environment variables
- Create basic layout and navigation structure

**Mobile Optimization Setup**
- Configure viewport and meta tags
- Set up touch-friendly base styles
- Implement responsive navigation
- Test basic layout in browser dev tools mobile view

### Phase 2: Authentication System (45 minutes)
**User Management**
- Implement Supabase Auth integration
- Create login/register forms with validation
- Set up protected route middleware
- Handle authentication state management
- Create user context for role management

**Database Setup**
- Create users table with role field
- Set up Row Level Security policies
- Test user registration and login flow
- Implement logout functionality

### Phase 3: House Management (30 minutes)
**House Creation & Joining**
- Create house creation form (Host only)
- Implement house code generation logic
- Build house joining interface (Roommate)
- Set up house member listing
- Handle house-based data isolation

**API Development**
- Create house CRUD API routes
- Implement house code validation
- Add member management endpoints
- Test house creation and joining flow

### Phase 4: Bill Management System (60 minutes)
**Bill CRUD Operations**
- Create bill creation form with type selection
- Implement bill listing with filtering
- Build bill detail view
- Handle bill permissions (housing bills = host only)
- Add bill editing and deletion

**Auto-Split Logic**
- Implement housing bill auto-split calculation
- Create bill payment records for roommates
- Handle equal distribution among house members
- Display split amounts clearly in UI

**Mobile Bill Interface**
- Design touch-friendly bill cards
- Implement swipe actions for quick operations
- Create floating action button for bill creation
- Optimize form layouts for mobile input

### Phase 5: Payment System (45 minutes)
**Payment Tracking**
- Create payment obligation dashboard
- Implement payment status tracking
- Build receipt upload functionality
- Display host bank account information
- Handle payment history

**File Upload**
- Set up file upload API route
- Implement image compression for mobile
- Create camera/gallery selection (web)
- Handle file storage (local or Supabase Storage)

**Mobile Payment UX**
- Design payment cards with clear CTAs
- Implement photo upload with preview
- Create payment confirmation flows
- Add visual payment status indicators

### Phase 6: Dashboard & Navigation (30 minutes)
**Main Dashboard**
- Create bills summary view
- Display total owed amounts
- Show recent activity
- Add quick action buttons

**Mobile Navigation**
- Implement bottom tab navigation
- Create slide-out menu for secondary actions
- Add badge notifications for pending payments
- Optimize navigation for thumb-friendly use

### Phase 7: Mobile Testing & Optimization (20 minutes)
**Xcode Simulator Testing**
- Test app in iOS Safari simulator
- Verify touch interactions work correctly
- Check responsive design on various screen sizes
- Test form inputs and file uploads
- Validate navigation and user flows

**Performance & UX**
- Optimize loading states
- Add proper error handling
- Implement offline indicators
- Test PWA installation prompt

## 📱 Mobile-Specific Features

### PWA Configuration
- Create manifest.json for app installation
- Set up service worker for offline capability
- Add app icons for iOS home screen
- Configure splash screen

### iOS-Specific Optimizations
- Handle safe area insets
- Optimize for iPhone notch designs
- Configure status bar styling
- Test with iOS-specific gestures

### Touch Interactions
- Implement pull-to-refresh
- Add haptic feedback simulation
- Create swipe gestures for navigation
- Optimize button sizes for touch

## 🔄 Data Flow Architecture

### Real-time Updates (Supabase)
- Set up real-time subscriptions for bills
- Handle live payment status updates
- Implement optimistic UI updates
- Manage connection state

### State Management
- Use React Context for global state
- Implement optimistic updates
- Handle offline state management
- Create proper loading states

## 🧪 Testing Strategy

### Manual Testing Checklist
- **Host workflow**: Create house → Create bills → View payments
- **Roommate workflow**: Join house → View bills → Upload receipts
- **Mobile interactions**: Touch, swipe, form inputs
- **Responsive design**: Various screen sizes and orientations
- **Cross-browser**: Safari, Chrome mobile views

### Xcode Simulator Testing
- Test on iPhone 15 Pro simulator
- Verify landscape/portrait orientations
- Check form inputs and file uploads
- Test navigation and deep linking
- Validate PWA installation flow

## ⚡ Quick Wins & Shortcuts

### Development Speed Optimizations
- Use Tailwind UI components for rapid prototyping
- Implement simple in-memory auth if Supabase setup is slow
- Use mock data initially, then connect real database
- Focus on happy path flows first
- Skip advanced error handling for MVP

### Mobile Development Shortcuts
- Use CSS transforms for smooth animations
- Implement simple loading spinners
- Use browser file input instead of custom camera interface
- Focus on portrait orientation primarily
- Use system fonts for better performance

## 🚫 MVP Limitations

### Intentional Scope Restrictions
- No real-time notifications (just page refresh)
- No offline data synchronization
- No advanced file management
- No multi-house support per user
- No complex validation or error recovery
- No automated testing suite

### Mobile Limitations
- Web-based only (no native app store deployment)
- Basic PWA features only
- Limited offline functionality
- Simple file upload (no camera API integration)
- No push notifications

## 📊 Success Metrics

### Functional Validation
- Host can create house and all bill types
- Roommates can join house and create non-housing bills
- Housing bills automatically split among all members
- Payment receipts can be uploaded successfully
- All data persists correctly between sessions

### Mobile Experience Validation
- App loads and functions properly in Xcode Simulator
- Touch interactions work smoothly
- Forms are easy to use on mobile keyboards
- Navigation is intuitive and thumb-friendly
- App feels responsive and native-like

### Technical Validation
- Next.js app builds without errors
- TypeScript compilation successful
- All API routes function correctly
- Database operations work reliably
- File uploads process successfully

---

*This plan is designed for rapid MVP development with modern web technologies, optimized for mobile use and tested in Xcode Simulator within the 3-hour timeframe.*
