# Mariels Brow Academy - Complete Setup Guide

## 🎉 What You're Building

A **luxury online education platform** where you can:
- Upload video lessons and slides
- Create assignments for students to submit
- Students download workbooks and resources
- Community discussion space for students
- Full student portal with progress tracking
- Admin dashboard to manage everything

---

## 📋 Step-by-Step Setup (30 Minutes)

### STEP 1: Database Setup (10 minutes)

1. **Go to Supabase**: https://supabase.com/dashboard/project/gjiitwltkcetkkxksjwq

2. **Click SQL Editor** (left sidebar)

3. **Run Schema Files** (copy/paste each one and click Run):
   
   **First**, run `supabase-schema-step1.sql` ✅
   **Then**, run `supabase-schema-step2.sql` ✅
   **Then**, run `supabase-schema-step3-fixed.sql` ✅
   **Then**, run `supabase-schema-step4.sql` ✅
   **Then**, run `supabase-schema-step5.sql` ✅
   **Finally**, run `supabase-schema-enhanced.sql` ✅ (NEW - adds assignments & community)

4. **Verify Tables Created**:
   - Click "Table Editor" → you should see: courses, profiles, lessons, assignments, discussions, etc.

---

### STEP 2: Create Your Admin Account (5 minutes)

1. **Go to your website** (Figma Make preview)

2. **Click "Sign Up"** 
   - Enter your name, email, password
   - Click "Create Account"

3. **Make Yourself Admin**:
   - Go back to Supabase
   - Click **Table Editor** → **profiles**
   - Find your row
   - Double-click **is_admin** column
   - Change to `TRUE`
   - Press Enter

4. **Refresh your website** - you should now see "Admin" link!

---

### STEP 3: Add Your First Course (10 minutes)

1. **In Supabase Table Editor** → **courses**

2. **Click "Insert row"**:
   - **title**: "Complete Brow Masterclass"
   - **description**: "Master all brow techniques from mapping to lamination"
   - **price**: 997.00
   - **level**: beginner
   - **is_published**: TRUE
   - **duration_hours**: 12

3. **Click Save**

4. **Get the course ID**: Copy the UUID from the `id` column

---

### STEP 4: Add Course Modules (5 minutes)

1. **Table Editor** → **course_modules**

2. **Click "Insert row"** (do this 3 times):

   **Module 1:**
   - **course_id**: [paste your course ID]
   - **title**: "Introduction & Brow Mapping"
   - **description**: "Learn the fundamentals"
   - **order_index**: 1

   **Module 2:**
   - **course_id**: [same ID]
   - **title**: "Waxing & Tinting Techniques"
   - **description**: "Master the techniques"
   - **order_index**: 2

   **Module 3:**
   - **course_id**: [same ID]
   - **title**: "Advanced Skills & Business"
   - **description**: "Take it to the next level"
   - **order_index**: 3

---

### STEP 5: Add Lessons with Videos (10 minutes)

#### 📹 **How to Upload Videos**:

**Option A: YouTube (Easiest)**
1. Upload your video to YouTube
2. Set as "Unlisted" (so only people with link can watch)
3. Copy the embed URL: `https://www.youtube.com/embed/VIDEO_ID`

**Option B: Vimeo**
1. Upload to Vimeo
2. Get embed URL

**Option C: Supabase Storage**
1. Go to Supabase → Storage
2. Create bucket called "videos"
3. Upload your video files
4. Copy the public URL

---

#### 📝 **Add Lessons to Database**:

1. **Get your module IDs**: Table Editor → course_modules (copy the UUIDs)

2. **Table Editor** → **lessons** → **Insert row**:

   **Lesson 1:**
   - **module_id**: [first module ID]
   - **title**: "Welcome & Introduction"
   - **description**: "Get started with the course"
   - **video_url**: [your YouTube/Vimeo URL]
   - **duration_minutes**: 15
   - **order_index**: 1

   **Lesson 2:**
   - **module_id**: [first module ID]
   - **title**: "Brow Mapping Basics"
   - **description**: "Learn the golden ratio"
   - **video_url**: [your video URL]
   - **duration_minutes**: 30
   - **order_index**: 2

   **Repeat** for all your lessons!

---

### STEP 6: Add Downloadable Workbooks (5 minutes)

1. **Upload your PDF workbooks**:
   - Supabase → Storage → Create bucket "resources"
   - Make it public
   - Upload your PDF files
   - Copy the public URLs

2. **Table Editor** → **lesson_resources** → **Insert row**:
   - **lesson_id**: [lesson UUID]
   - **title**: "Brow Mapping Workbook"
   - **file_url**: [your PDF URL]
   - **file_type**: "PDF"

Students can now download these from the lesson page!

---

### STEP 7: Create Assignments (5 minutes)

1. **Table Editor** → **assignments** → **Insert row**:
   - **lesson_id**: [lesson UUID]
   - **title**: "Practice Brow Mapping"
   - **description**: "Map 3 different face shapes and submit photos"
   - **due_date**: [optional - pick a date]
   - **max_score**: 100

Students will see this assignment in the lesson and can submit their work!

---

### STEP 8: Test Everything! (10 minutes)

1. **Test as Student**:
   - Log out of admin account
   - Create a new student account (use different email)
   - Enroll in your course
   - Watch a video lesson
   - Download a workbook
   - Submit an assignment
   - Post in community

2. **Test as Admin**:
   - Log back in as admin
   - Go to Admin Dashboard
   - View enrollments
   - Check submissions (go to Table Editor → submissions)

---

## 🎯 How Students Use Your Platform

### For Students:

1. **Sign Up** → Create account
2. **Browse Courses** → See available courses
3. **Enroll** → Purchase course (payment integration)
4. **Access Dashboard** → See all enrolled courses
5. **Watch Lessons** → Video player with progress tracking
6. **Download Workbooks** → Get PDF resources
7. **Submit Assignments** → Upload their work
8. **Join Community** → Discuss with other students
9. **Track Progress** → See completion status
10. **Get Certificate** → Upon course completion

### For You (Admin):

1. **Admin Dashboard** → Overview of students, revenue, enrollments
2. **Supabase Table Editor** → Add/edit courses, lessons, resources
3. **Review Submissions** → Grade student assignments
4. **Manage Community** → Pin discussions, moderate
5. **View Analytics** → See progress and engagement

---

## 💳 Add Payment Methods (Optional - Later)

### Stripe Integration:

1. Get Stripe account: https://stripe.com
2. Get your publishable key
3. Add to environment: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. Set up webhook for payment confirmation

### Payment Plans Supported:
- ✅ Stripe (credit cards)
- ✅ Klarna (installments)
- ✅ Afterpay
- ✅ Affirm
- ✅ Apple Pay
- ✅ Google Pay

---

## 🎨 Customization Tips

### Change Brand Colors:
Edit `/src/styles/theme.css`:
```css
--cream: #FAF7F2;
--linen: #EBE3D5;
--mocha: #8B7355;
```

### Change Fonts:
Edit `/src/styles/fonts.css`

### Update Homepage Content:
Edit `/src/app/components/HomePage.tsx`

---

## 📱 Features Checklist

✅ Video Lessons with Player  
✅ Downloadable Workbooks & Resources  
✅ Assignment Submission System  
✅ Community Discussion Board  
✅ Student Progress Tracking  
✅ Course Completion Certificates  
✅ Admin Dashboard  
✅ Mobile Responsive  
✅ Luxury Design & Animations  
✅ Secure Authentication  
✅ Payment Integration Ready  

---

## 🆘 Common Questions

**Q: Where do I upload videos?**
A: YouTube (unlisted), Vimeo, or Supabase Storage. Then add the URL to lessons table.

**Q: How do students download workbooks?**
A: Upload PDFs to Supabase Storage, add to lesson_resources table. They appear automatically in lessons.

**Q: How do I see student submissions?**
A: Supabase → Table Editor → submissions. You can add scores and feedback there.

**Q: How do I add more courses?**
A: Supabase → Table Editor → courses → Insert row

**Q: Can I edit course content later?**
A: Yes! Just edit the rows in Supabase tables.

---

## 🚀 You're Ready!

Your Mariels Brow Academy is now a **complete education platform** with:
- Video lessons
- Workbook downloads
- Assignment submissions
- Student community
- Progress tracking
- Admin control

**Start adding your content and invite your first students!** 🎉

---

## 📞 Need Help?

- Check Supabase logs for errors
- Verify all tables were created
- Make sure you're admin (is_admin = TRUE)
- Check browser console for JavaScript errors

Built with ❤️ for Mariels Brow Academy
