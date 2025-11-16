# ServiceHub Frontend

Modern React/Next.js frontend for ServiceHub - Multi-service digital distribution platform.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Authentication**: JWT with HttpOnly Cookies

## 🏗️ Project Structure
```
servicehub-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   ├── dashboard/page.tsx    # Dashboard (protected)
│   │   └── layout.tsx            # Root layout
│   ├── components/               # Reusable components
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── lib/
│   │   └── api.ts                # Axios configuration
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── utils/                    # Utility functions
├── public/                       # Static assets
└── package.json
```

## 🔒 Authentication System

- **Secure**: JWT tokens stored in HttpOnly cookies
- **XSS Protection**: Cookies inaccessible to JavaScript
- **Auto-refresh**: Automatic token refresh on expiry
- **Role-based**: Support for Customer, Provider, Admin roles

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/servicehub-frontend.git
cd servicehub-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

Visit: http://localhost:3000

## 🌐 API Integration

Backend: https://github.com/YOUR_USERNAME/servicehub-backend

### API Endpoints Used:
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/users/register/` - User registration
- `GET /api/users/me/` - Get current user

## 📱 Pages

### Landing Page (/)
- Features showcase
- Call-to-action sections
- Responsive design

### Login Page (/login)
- Split-screen design
- Password visibility toggle
- Remember me option
- Social login UI (ready for integration)

### Register Page (/register)
- Multi-step validation
- Password strength indicator
- Role selection (Customer/Provider)
- Terms & conditions agreement
- Real-time error feedback

### Dashboard (/dashboard)
- Protected route
- User profile display
- Logout functionality

## 🎨 Features

- ✅ Secure HttpOnly cookie authentication
- ✅ Responsive design (mobile-first)
- ✅ Form validation with error messages
- ✅ Loading states and animations
- ✅ Toast notifications
- ✅ Auto-redirect based on auth state
- ✅ Password strength indicator
- ✅ Professional UI/UX
- ✅ TypeScript for type safety
- ✅ Automatic token refresh

## 🚧 Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔐 Security Features

- HttpOnly cookies (XSS protection)
- CSRF protection with SameSite cookies
- Secure password validation
- Input sanitization
- Protected routes
- Automatic logout on token expiry

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a portfolio project. Feedback and suggestions welcome!

## 📧 Contact

Built by Venugopal Reddy Kallam as part of a full-stack portfolio project.
```