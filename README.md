# RoomieRules

A modern, mobile-first web application for managing roommate bills, expenses, and house rules. Built with Next.js 14, TypeScript, and SQLite.

## 🏠 Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- Role-based access (Host/Roommate)
- User registration and login

### 🏡 House Management
- Hosts can create houses with unique 6-digit codes
- Roommates can join houses using invite codes
- Automatic house member management

### 💳 Bill Management
- Create bills for different categories (Housing, Grocery, Eat Out, Other)
- Automatic bill splitting for housing expenses
- Bill status tracking (Active/Closed)
- Due date management

### 💰 Payment System
- Track individual payment obligations
- Upload payment receipts with image validation
- Payment status monitoring (Pending/Paid)
- Host bank account information for housing bills

### 📋 House Rules
- Hosts can create and manage house guidelines
- Roommates can view established rules
- Rule editing and deletion (Host only)

### 📊 Dashboard Analytics
- Monthly expense summaries
- Personal payment tracking
- Recent activity overview
- House statistics and insights

### 🔍 Search Functionality
- Global search across bills, payments, and members
- Filter by content type
- Mobile-optimized search interface

### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly 44px minimum target sizes
- Offline status indicator
- PWA-ready with proper viewport settings

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcryptjs
- **Icons**: Lucide React
- **File Uploads**: Native FormData with file validation
- **State Management**: React Context API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/RoomieRules.git
cd RoomieRules
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
JWT_SECRET=your-super-secure-jwt-secret-key-here
NODE_ENV=development
```

4. Initialize the database:
```bash
npm run db:init
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── bills/             # Bill management pages
│   ├── dashboard/         # User dashboard
│   ├── house/             # House creation/joining
│   ├── payments/          # Payment management
│   ├── rules/             # House rules
│   └── search/            # Global search
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── db.ts             # Database initialization
│   ├── models.ts         # Data access layer
│   ├── auth.ts           # Authentication utilities
│   └── types.ts          # TypeScript type definitions
└── styles/               # Global CSS styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables

Required environment variables for production:

```env
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
NODE_ENV=production
```

## 📱 Mobile App Features

RoomieRules is designed as a mobile-first Progressive Web App (PWA):

- **Responsive Design**: Optimized for all screen sizes
- **Touch Targets**: 44px minimum for accessibility
- **Offline Indicator**: Shows connection status
- **Fast Loading**: Optimized bundle sizes
- **Mobile Gestures**: Swipe and touch-friendly interactions

## 🔒 Security

- JWT tokens with secure secrets
- Password hashing with bcryptjs
- Input validation and sanitization
- File upload validation (type and size limits)
- SQL injection prevention with prepared statements

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Reinitialize database
   rm roomie-rules.db
   npm run db:init
   ```

2. **Port Already in Use**
   ```bash
   # Next.js will automatically try other ports
   # Or specify a port: npm run dev -- -p 3001
   ```

3. **File Upload Issues**
   ```bash
   # Ensure uploads directory exists
   mkdir -p public/uploads/receipts
   ```

### Logs

- Check browser console for client-side errors
- Check terminal/server logs for API errors
- Database file location: `./roomie-rules.db`

## 📄 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### House Management

- `POST /api/house` - Create new house (Host only)
- `POST /api/house/join` - Join existing house
- `GET /api/house/members` - Get house members

### Bill Management

- `GET /api/bills` - Get user's bills
- `POST /api/bills` - Create new bill
- `GET /api/bills/[id]` - Get bill details
- `PUT /api/bills/[id]` - Update bill (Creator only)

### Payment Management

- `GET /api/payments` - Get user's payments
- `PUT /api/payments/[id]` - Update payment with receipt

### Analytics & Search

- `GET /api/analytics` - Get dashboard analytics
- `GET /api/search` - Global search with filters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@roomierules.com or create an issue on GitHub.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Push notifications for bill reminders
- [ ] Integration with banking APIs
- [ ] Expense categorization with charts
- [ ] Multi-language support
- [ ] Native mobile apps (iOS/Android)

---

Made with ❤️ for roommates everywhere!
