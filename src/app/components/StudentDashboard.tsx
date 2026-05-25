import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Award, Clock, Play, CheckCircle, Download, FileText, Upload, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    duration_hours: number | null;
  };
}

interface Workbook {
  id: string;
  title: string;
  file_url: string;
  lesson_title: string;
  course_title: string;
}

interface Assignment {
  id: string;
  title: string;
  lesson_title: string;
  course_title: string;
  submission_status: 'not_submitted' | 'submitted' | 'graded';
  score?: number;
  max_score?: number;
  lesson_id: string;
  course_id: string;
  file_url?: string;
  submission_text?: string;
}

export const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'workbooks' | 'submissions'>('courses');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
      fetchWorkbooks();
      fetchAssignments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`*, courses (id, title, description, thumbnail_url, duration_hours)`)
        .eq('user_id', user?.id)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkbooks = async () => {
    try {
      const { data: enrollmentsData } = await supabase.from('enrollments').select('course_id').eq('user_id', user?.id);
      if (!enrollmentsData?.length) return;
      const courseIds = enrollmentsData.map(e => e.course_id);
      const { data: modulesData } = await supabase.from('course_modules').select('id, course_id').in('course_id', courseIds);
      if (!modulesData?.length) return;
      const moduleIds = modulesData.map(m => m.id);
      const { data: lessonsData } = await supabase.from('lessons').select('id, title, module_id').in('module_id', moduleIds);
      if (!lessonsData?.length) return;
      const lessonIds = lessonsData.map(l => l.id);
      const { data: resourcesData } = await supabase.from('lesson_resources').select('id, title, file_url, lesson_id, resource_type').in('lesson_id', lessonIds).eq('resource_type', 'workbook');
      if (resourcesData) {
        setWorkbooks(resourcesData.map(resource => {
          const lesson = lessonsData.find(l => l.id === resource.lesson_id);
          return { id: resource.id, title: resource.title, file_url: resource.file_url, lesson_title: lesson?.title || 'Unknown Lesson', course_title: 'Course' };
        }));
      }
    } catch (error) { console.error('Error fetching workbooks:', error); }
  };

  const fetchAssignments = async () => {
    try {
      const { data: enrollmentsData } = await supabase.from('enrollments').select('course_id').eq('user_id', user?.id);
      if (!enrollmentsData?.length) return;
      const courseIds = enrollmentsData.map(e => e.course_id);
      const { data: modulesData } = await supabase.from('course_modules').select('id, course_id').in('course_id', courseIds);
      if (!modulesData) return;
      const moduleIds = modulesData.map(m => m.id);
      const { data: lessonsData } = await supabase.from('lessons').select('id, title, module_id').in('module_id', moduleIds);
      if (!lessonsData) return;
      const lessonIds = lessonsData.map(l => l.id);
      const { data: assignmentsData } = await supabase.from('assignments').select('id, lesson_id, title, max_score').in('lesson_id', lessonIds);
      if (assignmentsData) {
        const assignmentIds = assignmentsData.map(a => a.id);
        const { data: submissionsData } = await supabase.from('submissions').select('assignment_id, status, score, file_url, submission_text').in('assignment_id', assignmentIds).eq('user_id', user?.id);
        setAssignments(assignmentsData.map(assignment => {
          const lesson = lessonsData.find(l => l.id === assignment.lesson_id);
          const module = modulesData.find(m => m.id === lesson?.module_id);
          const submission = submissionsData?.find(s => s.assignment_id === assignment.id);
          return { id: assignment.id, title: assignment.title, lesson_title: lesson?.title || 'Unknown Lesson', course_title: 'Course', submission_status: submission ? submission.status : 'not_submitted', score: submission?.score, max_score: assignment.max_score, lesson_id: assignment.lesson_id, course_id: module?.course_id || '', file_url: submission?.file_url, submission_text: submission?.submission_text };
        }));
      }
    } catch (error) { console.error('Error fetching assignments:', error); }
  };

  const getDefaultImage = (index: number) => {
    const images = ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'];
    return `${images[index % images.length]}?w=600`;
  };

  const tabs = [
    { key: 'courses', label: 'My Courses' },
    { key: 'workbooks', label: 'Workbooks' },
    { key: 'submissions', label: 'Submissions' },
  ] as const;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 pb-12 border-b border-mocha/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Student Portal</span>
          </div>
          <h1
            className="text-5xl md:text-6xl text-charcoal font-light leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Welcome back,{' '}
            <span className="italic">{profile?.full_name?.split(' ')[0] || 'Student'}</span>
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-mocha/10 mb-16">
          {[
            { icon: BookOpen, value: enrollments.length, label: 'Enrolled Courses' },
            { icon: CheckCircle, value: enrollments.filter(e => e.completed_at).length, label: 'Completed' },
            { icon: Award, value: enrollments.filter(e => e.completed_at).length, label: 'Certificates' },
          ].map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white px-8 py-6 flex items-center gap-5"
            >
              <div className="w-10 h-10 border border-mocha/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-mocha" />
              </div>
              <div>
                <div
                  className="text-3xl text-charcoal font-light"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {value}
                </div>
                <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/50 mt-0.5">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-mocha/10 mb-12">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-[0.6rem] tracking-[0.2em] uppercase transition-all relative ${
                activeTab === tab.key
                  ? 'text-charcoal'
                  : 'text-mocha/40 hover:text-mocha/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-charcoal" />
              )}
            </button>
          ))}
        </div>

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin" />
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mocha/10">
                {enrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white group"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={enrollment.courses.thumbnail_url || getDefaultImage(index)}
                        alt={enrollment.courses.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Link
                          to={`/learn/${enrollment.course_id}`}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white text-charcoal text-[0.58rem] tracking-[0.15em] uppercase"
                        >
                          <Play className="w-3 h-3" />
                          Continue
                        </Link>
                      </div>
                      {enrollment.completed_at && (
                        <div className="absolute top-3 right-3 bg-charcoal text-cream px-2.5 py-1 text-[0.5rem] tracking-[0.15em] uppercase flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Complete
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3
                        className="text-xl text-charcoal font-light mb-2"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {enrollment.courses.title}
                      </h3>
                      <p className="text-xs text-mocha-dark line-clamp-2 mb-5 leading-relaxed">
                        {enrollment.courses.description}
                      </p>
                      {enrollment.courses.duration_hours && (
                        <div className="flex items-center gap-1.5 text-[0.58rem] tracking-widest uppercase text-mocha/40 mb-5">
                          <Clock className="w-3 h-3" />
                          {enrollment.courses.duration_hours} Hours
                        </div>
                      )}
                      <Link
                        to={`/learn/${enrollment.course_id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-charcoal text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:bg-mocha transition-all"
                      >
                        {enrollment.completed_at ? 'Review Course' : 'Continue Learning'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border border-mocha/15 bg-white p-16 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-5 text-mocha/20" />
                <h3
                  className="text-2xl text-charcoal font-light italic mb-3"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  No Courses Yet
                </h3>
                <p className="text-xs text-mocha/50 tracking-wide mb-8">
                  Start your journey by enrolling in your first course
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-cream text-[0.6rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all"
                >
                  Browse Courses <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── WORKBOOKS TAB ── */}
        {activeTab === 'workbooks' && (
          <div>
            {workbooks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mocha/10">
                {workbooks.map((workbook) => (
                  <div key={workbook.id} className="bg-white p-8">
                    <div className="w-10 h-10 border border-mocha/20 flex items-center justify-center mb-5">
                      <Download className="w-4 h-4 text-mocha" />
                    </div>
                    <h3
                      className="text-xl text-charcoal font-light mb-2"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {workbook.title}
                    </h3>
                    <p className="text-xs text-mocha/50 tracking-wide mb-6">{workbook.lesson_title}</p>
                    <a
                      href={workbook.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:bg-mocha transition-all"
                    >
                      Download <Download className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-mocha/15 bg-white p-16 text-center">
                <Download className="w-10 h-10 mx-auto mb-5 text-mocha/20" />
                <h3
                  className="text-2xl text-charcoal font-light italic mb-3"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  No Workbooks Yet
                </h3>
                <p className="text-xs text-mocha/50 tracking-wide">
                  Workbooks will appear here as you progress through your courses
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === 'submissions' && (
          <div className="space-y-12">

            {/* Upload Form */}
            <div className="border border-mocha/15 bg-white p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-px bg-mocha/40" />
                <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Upload Assignment</span>
              </div>
              <h3
                className="text-3xl text-charcoal font-light mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Submit Your <span className="italic">Work</span>
              </h3>
              <p className="text-xs text-mocha/50 tracking-wide mb-8">
                Upload completed workbooks, photos, or videos for instructor review
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!uploadFile || !selectedAssignment) { alert('Please select an assignment and upload a file'); return; }
                setUploading(true);
                try {
                  const fileExt = uploadFile.name.split('.').pop();
                  const fileName = `${user?.id}-${selectedAssignment}-${Date.now()}.${fileExt}`;
                  const filePath = `assignments/${fileName}`;
                  const { error: uploadError } = await supabase.storage.from('course-materials').upload(filePath, uploadFile);
                  if (uploadError) throw uploadError;
                  const { data } = supabase.storage.from('course-materials').getPublicUrl(filePath);
                  const { error } = await supabase.from('submissions').upsert({ assignment_id: selectedAssignment, user_id: user?.id, submission_text: uploadText, file_url: data.publicUrl, status: 'submitted', submitted_at: new Date().toISOString() });
                  if (error) throw error;
                  alert('Work submitted successfully!');
                  setUploadFile(null); setUploadText(''); setSelectedAssignment('');
                  fetchAssignments();
                } catch (error) {
                  console.error('Error submitting work:', error);
                  alert('Error submitting work. Please try again.');
                } finally { setUploading(false); }
              }} className="space-y-6">

                <div>
                  <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2">Select Assignment</label>
                  <select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-charcoal transition-colors"
                  >
                    <option value="">Choose an assignment...</option>
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>{a.title} — {a.lesson_title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2">Upload File</label>
                  <div className="border border-dashed border-mocha/30 p-10 text-center hover:border-mocha/50 transition-colors">
                    <input type="file" accept="image/*,video/*,.pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="hidden" id="submission-file-upload" required />
                    <label htmlFor="submission-file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-mocha/30" />
                      <p className="text-xs text-charcoal mb-1">{uploadFile ? uploadFile.name : 'Click to upload'}</p>
                      <p className="text-[0.6rem] text-mocha/40 tracking-wide">PDF, Images, or Videos — Max 100MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2">Notes (Optional)</label>
                  <textarea
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3.5 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-charcoal transition-colors resize-none"
                    placeholder="Add any notes about your submission..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !uploadFile || !selectedAssignment}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all disabled:opacity-50"
                >
                  {uploading ? <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : <><Upload className="w-3.5 h-3.5" /> Submit Work</>}
                </button>
              </form>
            </div>

            {/* Previous Submissions */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-5 h-px bg-mocha/40" />
                <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Previous Submissions</span>
              </div>

              {assignments.filter(a => a.submission_status !== 'not_submitted').length > 0 ? (
                <div className="space-y-px bg-mocha/10">
                  {assignments.filter(a => a.submission_status !== 'not_submitted').map((assignment) => (
                    <div key={assignment.id} className="bg-white p-6 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-charcoal mb-1">{assignment.title}</h4>
                        <p className="text-xs text-mocha/50">{assignment.lesson_title}</p>
                        {assignment.file_url && (
                          <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-wide text-mocha hover:text-charcoal mt-2 transition-colors">
                            <FileText className="w-3 h-3" /> View File
                          </a>
                        )}
                        {assignment.submission_status === 'graded' && assignment.score !== undefined && (
                          <div className="mt-2 text-xs text-charcoal font-medium">Score: {assignment.score}/{assignment.max_score}</div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 text-[0.52rem] tracking-[0.15em] uppercase ${assignment.submission_status === 'graded' ? 'bg-charcoal text-cream' : 'border border-mocha/20 text-mocha/60'}`}>
                          {assignment.submission_status === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-mocha/15 bg-white p-12 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-mocha/20" />
                  <p className="text-xs text-mocha/40 tracking-widests uppercase">No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
