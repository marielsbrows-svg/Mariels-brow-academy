-- Step 3: Create Security Policies (Fixed Version)
-- Run this after Step 2 completes successfully

-- Drop existing policies if they exist (in case of retry)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are created on signup" ON profiles;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Modules viewable by enrolled students and admins" ON course_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON course_modules;
DROP POLICY IF EXISTS "Lessons viewable by enrolled students via modules" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Resources viewable by enrolled students" ON lesson_resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON lesson_resources;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can enroll themselves" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can view their own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Published testimonials viewable by everyone" ON testimonials;
DROP POLICY IF EXISTS "Users can create testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are created on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone" ON courses FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Course modules policies
CREATE POLICY "Modules viewable by enrolled students and admins" ON course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) OR
  EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = course_modules.course_id)
);
CREATE POLICY "Admins can manage modules" ON course_modules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Lessons policies
CREATE POLICY "Lessons viewable by enrolled students via modules" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) OR
  EXISTS (
    SELECT 1 FROM enrollments e
    INNER JOIN course_modules m ON m.course_id = e.course_id
    WHERE e.user_id = auth.uid() AND m.id = lessons.module_id
  )
);
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Lesson resources policies
CREATE POLICY "Resources viewable by enrolled students" ON lesson_resources FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) OR
  EXISTS (
    SELECT 1 FROM enrollments e
    INNER JOIN course_modules m ON m.course_id = e.course_id
    INNER JOIN lessons l ON l.module_id = m.id
    WHERE e.user_id = auth.uid() AND l.id = lesson_resources.lesson_id
  )
);
CREATE POLICY "Admins can manage resources" ON lesson_resources FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Lesson progress policies
CREATE POLICY "Users can view their own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Testimonials policies
CREATE POLICY "Published testimonials viewable by everyone" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Users can create testimonials" ON testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
