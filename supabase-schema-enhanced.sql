-- Enhanced Mariels Brow Academy Database Schema
-- Run this SQL in your Supabase SQL Editor (after the original schema)

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('submitted', 'graded', 'resubmit')) DEFAULT 'submitted',
  UNIQUE(assignment_id, user_id)
);

-- Community discussions
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Enrolled students can view assignments" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    INNER JOIN course_modules m ON m.course_id = e.course_id
    INNER JOIN lessons l ON l.module_id = m.id
    WHERE e.user_id = auth.uid() AND l.id = assignments.lesson_id
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Submissions policies
CREATE POLICY "Students can view their own submissions" ON submissions FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update their own submissions" ON submissions FOR UPDATE USING (
  auth.uid() = user_id AND status = 'submitted'
);
CREATE POLICY "Admins can grade submissions" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Discussions policies
CREATE POLICY "Enrolled students can view discussions" ON discussions FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = discussions.course_id) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Enrolled students can create discussions" ON discussions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = discussions.course_id) AND
  auth.uid() = user_id
);
CREATE POLICY "Users can update their own discussions" ON discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all discussions" ON discussions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Discussion replies policies
CREATE POLICY "Students can view replies" ON discussion_replies FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM discussions d
    INNER JOIN enrollments e ON e.course_id = d.course_id
    WHERE d.id = discussion_replies.discussion_id AND e.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can create replies" ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON discussion_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage replies" ON discussion_replies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
