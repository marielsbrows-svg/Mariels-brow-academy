# Mariels Brow Academy - Setup Instructions

Welcome to your luxury online education platform! This guide will help you get everything set up.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env` file in the root directory with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Run the query to create all tables and security policies

### 3. Create Admin Account

After the database is set up:

1. Sign up for an account through the website
2. In Supabase, go to Table Editor → `profiles`
3. Find your profile and set `is_admin` to `TRUE`
4. You now have admin access!

## 📚 Adding Courses

### Option 1: Using Supabase Dashboard

1. **Add a Course**
   - Go to Table Editor → `courses`
   - Click "Insert row"
   - Fill in: title, description, price, level, is_published
   - Upload thumbnail to Supabase Storage and add URL

2. **Create Modules**
   - Go to `course_modules` table
   - Add modules with proper `course_id` and `order_index`

3. **Add Lessons**
   - Go to `lessons` table
   - Add lessons with `module_id`, video URL, and `order_index`

4. **Upload Resources**
   - Go to `lesson_resources` table
   - Add PDFs/workbooks with `lesson_id` and file URLs

### Option 2: Sample Data

The SQL schema includes 3 sample courses. You can modify or delete these.

## 💳 Payment Setup

### Stripe Integration

1. Get your Stripe keys from [stripe.com/dashboard](https://dashboard.stripe.com)
2. Add `VITE_STRIPE_PUBLISHABLE_KEY` to your `.env` file
3. For production, implement webhook handlers for payment confirmation

### Payment Methods Supported

- Stripe (credit/debit cards)
- Klarna (installments)
- Afterpay (installments)
- Affirm (payment plans)
- Apple Pay
- Google Pay

## 🎥 Video Hosting

### Recommended Platforms

1. **Vimeo Pro** - Best for course videos
   - Privacy controls
   - No branding
   - Reliable streaming

2. **Supabase Storage** - For smaller videos
   - Direct integration
   - Cost-effective

3. **AWS S3 + CloudFront** - Enterprise solution
   - Scalable
   - Fast delivery

## 📧 Email Setup (Optional)

For automated emails, integrate with:
- SendGrid
- Mailgun
- Postmark

Add email triggers in Supabase for:
- Welcome emails
- Purchase confirmations
- Course enrollment
- Password reset

## 🎨 Customization

### Brand Colors

The luxury color palette is defined in `/src/styles/theme.css`:
- Cream: `#FAF7F2`
- Linen: `#EBE3D5`
- Mocha: `#8B7355`
- Charcoal: `#1A1A1A`
- Chrome: `#C0C0C0`

### Typography

- Serif (script/headings): Cormorant
- Sans-serif (body): Inter

Change fonts in `/src/styles/fonts.css`

## 🔐 Security Notes

⚠️ **Important**: This platform is built for prototyping and demonstration.

For production use:
- Implement proper payment webhooks
- Add email verification
- Set up SSL certificates
- Configure CORS policies
- Add rate limiting
- Implement content security policies
- Use environment-specific configs

## 📱 Features Included

✅ User authentication (signup/login)  
✅ Course catalog with filtering  
✅ Secure enrollment system  
✅ Video lesson player  
✅ Progress tracking  
✅ Resource downloads  
✅ Student dashboard  
✅ Admin dashboard  
✅ Payment integration  
✅ Mobile responsive design  
✅ Luxury animations  

## 🆘 Troubleshooting

### "Table does not exist" error
- Run the SQL schema file in Supabase

### Can't access admin dashboard
- Set `is_admin = TRUE` in your profile

### Videos not loading
- Check video URLs are publicly accessible
- Verify CORS settings if using external hosting

### Authentication errors
- Verify `.env` file has correct Supabase credentials
- Check Supabase authentication is enabled

## 📞 Support

For platform issues or questions:
- Check the Supabase dashboard for database errors
- Review browser console for client-side errors
- Verify all environment variables are set

## 🎯 Next Steps

1. ✅ Run database schema
2. ✅ Create admin account
3. ✅ Add your first course
4. ✅ Upload course modules and lessons
5. ✅ Configure Stripe
6. ✅ Test enrollment flow
7. ✅ Customize branding
8. ✅ Launch your academy!

---

Built with ❤️ for Mariels Brow Academy
