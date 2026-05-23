# Mariels Brow Academy

A luxury online education platform for professional brow artistry training.

## 🌟 Features

- ✨ Luxury design with premium animations
- 👤 User authentication (signup/login)
- 📚 Course catalog and enrollment system
- 🎥 Video lesson player with progress tracking
- 📊 Student dashboard
- 🔐 Admin dashboard for course management
- 💳 Payment integration (Stripe, Klarna, Afterpay)
- 📱 Fully responsive mobile design
- 🎨 Brand colors: Cream, Linen, Mocha, Charcoal, Chrome

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account
- (Optional) Stripe account for payments

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

3. Run database schema:
- Open Supabase SQL Editor
- Copy/paste contents of `supabase-schema.sql`
- Run the query

4. Start development server:
```bash
pnpm run dev
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Vercel with custom domain setup.

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── HomePage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── LessonViewer.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   └── App.tsx              # Main app with routing
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── supabase.ts          # Supabase client
└── styles/
    ├── fonts.css            # Font imports
    └── theme.css            # Theme & colors

```

## 🎨 Brand Design System

### Colors
- **Cream**: `#FAF7F2` - Background
- **Linen**: `#EBE3D5` - Secondary background
- **Mocha**: `#8B7355` - Primary brand color
- **Charcoal**: `#1A1A1A` - Text
- **Chrome**: `#C0C0C0` - Accents

### Typography
- **Serif**: Cormorant (headings, elegant script)
- **Sans**: Inter (body text, clean modern)

## 🗄️ Database Schema

See `supabase-schema.sql` for complete schema including:
- Users & Profiles
- Courses & Modules
- Lessons & Resources
- Enrollments & Progress
- Payments & Testimonials

## 🔒 Security

- Row Level Security (RLS) enabled
- Admin-only access controls
- Secure authentication via Supabase
- Environment variables for sensitive keys

## 💳 Payment Integration

Supports:
- Stripe (credit/debit cards)
- Klarna (installments)
- Afterpay (pay later)
- Affirm (payment plans)
- Apple Pay & Google Pay

## 📚 Documentation

- **SETUP.md** - Initial setup guide
- **DEPLOYMENT.md** - Deployment instructions
- **supabase-schema.sql** - Database schema

## 🆘 Support

For issues:
1. Check Supabase dashboard for database errors
2. Review browser console for client errors
3. Verify environment variables are set correctly

## 📄 License

Private - All rights reserved to Mariels Brow Academy

---

Built with ❤️ using React, Tailwind CSS, Supabase, and Stripe
