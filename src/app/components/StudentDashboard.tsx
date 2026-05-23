import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Award, Clock, Play, CheckCircle, Download, FileText, Upload } from 'lucide-react';
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
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_hours
          )
        `)
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
      // Get all lessons from enrolled courses
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user?.id);

      if (!enrollmentsData || enrollmentsData.length === 0) return;

      const courseIds = enrollmentsData.map(e => e.course_id);

      // Get modules from these courses
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('id, course_id')
        .in('course_id', courseIds);

      if (!modulesData || modulesData.length === 0) return;

      const moduleIds = modulesData.map(m => m.id);

      // Get lessons from these modules
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, title, module_id')
        .in('module_id', moduleIds);

      if (!lessonsData || lessonsData.length === 0) return;

      const lessonIds = lessonsData.map(l => l.id);

      // Get workbooks from these lessons
      const { data: resourcesData } = await supabase
        .from('lesson_resources')
        .select('id, title, file_url, lesson_id, resource_type')
        .in('lesson_id', lessonIds)
        .eq('resource_type', 'workbook');

      if (resourcesData) {
        const workbooksWithDetails = resourcesData.map(resource => {
          const lesson = lessonsData.find(l => l.id === resource.lesson_id);
          const module = modulesData.find(m => m.id === lesson?.module_id);
          return {
            id: resource.id,
            title: resource.title,
            file_url: resource.file_url,
            lesson_title: lesson?.title || 'Unknown Lesson',
            course_title: 'Course', // You can enhance this with course title lookup
          };
        });
        setWorkbooks(workbooksWithDetails);
      }
    } catch (error) {
      console.error('Error fetching workbooks:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      // Get all assignments from enrolled courses
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user?.id);

      if (!enrollmentsData || enrollmentsData.length === 0) return;

      const courseIds = enrollmentsData.map(e => e.course_id);

      // Get modules
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('id, course_id')
        .in('course_id', courseIds);

      if (!modulesData) return;

      const moduleIds = modulesData.map(m => m.id);

      // Get lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, title, module_id')
        .in('module_id', moduleIds);

      if (!lessonsData) return;

      const lessonIds = lessonsData.map(l => l.id);

      // Get assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('id, lesson_id, title, max_score')
        .in('lesson_id', lessonIds);

      if (assignmentsData) {
        // Get submissions for these assignments
        const assignmentIds = assignmentsData.map(a => a.id);
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('assignment_id, status, score, file_url, submission_text')
          .in('assignment_id', assignmentIds)
          .eq('user_id', user?.id);

        const assignmentsWithStatus = assignmentsData.map(assignment => {
          const lesson = lessonsData.find(l => l.id === assignment.lesson_id);
          const module = modulesData.find(m => m.id === lesson?.module_id);
          const submission = submissionsData?.find(s => s.assignment_id === assignment.id);

          return {
            id: assignment.id,
            title: assignment.title,
            lesson_title: lesson?.title || 'Unknown Lesson',
            course_title: 'Course',
            submission_status: submission ? submission.status : 'not_submitted',
            score: submission?.score,
            max_score: assignment.max_score,
            lesson_id: assignment.lesson_id,
            course_id: module?.course_id || '',
            file_url: submission?.file_url,
            submission_text: submission?.submission_text,
          };
        });

        setAssignments(assignmentsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const getDefaultImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
    ];
    return `${images[index % images.length]}?w=600`;
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="font-serif italic text-5xl text-charcoal mb-2">
            Welcome back, {profile?.full_name || 'Student'}
          </h1>
          <p className="text-xl text-mocha-dark">
            Continue your journey to brow mastery
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {enrollments.length}
                </div>
                <div className="text-sm text-mocha-dark">Enrolled Courses</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {enrollments.filter(e => e.completed_at).length}
                </div>
                <div className="text-sm text-mocha-dark">Completed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {enrollments.filter(e => e.completed_at).length}
                </div>
                <div className="text-sm text-mocha-dark">Certificates</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 border-b border-mocha/20 mb-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'courses'
                  ? 'text-charcoal'
                  : 'text-mocha-dark hover:text-charcoal'
              }`}
            >
              My Courses
              {activeTab === 'courses' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mocha"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('workbooks')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'workbooks'
                  ? 'text-charcoal'
                  : 'text-mocha-dark hover:text-charcoal'
              }`}
            >
              Workbooks
              {activeTab === 'workbooks' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mocha"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'submissions'
                  ? 'text-charcoal'
                  : 'text-mocha-dark hover:text-charcoal'
              }`}
            >
              Submissions
              {activeTab === 'submissions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mocha"></div>
              )}
            </button>
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <h2 className="font-serif text-3xl text-charcoal mb-6">My Courses</h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={enrollment.courses.thumbnail_url || getDefaultImage(index)}
                      alt={enrollment.courses.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link
                        to={`/learn/${enrollment.course_id}`}
                        className="px-6 py-3 bg-white text-mocha rounded-full font-medium flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Continue Learning
                      </Link>
                    </div>
                    {enrollment.completed_at && (
                      <div className="absolute top-4 right-4 bg-mocha text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-xl text-charcoal mb-2">
                      {enrollment.courses.title}
                    </h3>
                    <p className="text-sm text-mocha-dark line-clamp-2 mb-4">
                      {enrollment.courses.description}
                    </p>

                    {enrollment.courses.duration_hours && (
                      <div className="flex items-center gap-2 text-sm text-mocha-dark mb-4">
                        <Clock className="w-4 h-4" />
                        {enrollment.courses.duration_hours} hours
                      </div>
                    )}

                    <Link
                      to={`/learn/${enrollment.course_id}`}
                      className="block w-full text-center px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors"
                    >
                      {enrollment.completed_at ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-mocha/30" />
              <h3 className="font-serif text-2xl text-charcoal mb-3">
                No Courses Yet
              </h3>
              <p className="text-mocha-dark mb-6">
                Start your journey by enrolling in your first course
              </p>
              <Link
                to="/courses"
                className="inline-block px-8 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          )}
            </div>
          )}

          {/* Workbooks Tab */}
          {activeTab === 'workbooks' && (
            <div>
              <h2 className="font-serif text-3xl text-charcoal mb-6">My Workbooks</h2>
              {workbooks.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workbooks.map((workbook) => (
                    <div
                      key={workbook.id}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="w-14 h-14 bg-mocha/10 rounded-xl flex items-center justify-center mb-4">
                        <Download className="w-7 h-7 text-mocha" />
                      </div>
                      <h3 className="font-serif text-xl text-charcoal mb-2">
                        {workbook.title}
                      </h3>
                      <p className="text-sm text-mocha-dark mb-4">
                        {workbook.lesson_title}
                      </p>
                      <a
                        href={workbook.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="block w-full text-center px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                  <Download className="w-16 h-16 mx-auto mb-4 text-mocha/30" />
                  <h3 className="font-serif text-2xl text-charcoal mb-3">
                    No Workbooks Yet
                  </h3>
                  <p className="text-mocha-dark">
                    Workbooks will appear here as you progress through your courses
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div>
              <h2 className="font-serif text-3xl text-charcoal mb-6">Submit Your Work</h2>

              {/* Upload Form */}
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h3 className="font-serif text-2xl text-charcoal mb-4">Upload Assignment</h3>
                <p className="text-mocha-dark mb-6">
                  Upload your completed work (workbooks, photos, videos) for instructor review
                </p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!uploadFile || !selectedAssignment) {
                    alert('Please select an assignment and upload a file');
                    return;
                  }

                  setUploading(true);
                  try {
                    // Upload file
                    const fileExt = uploadFile.name.split('.').pop();
                    const fileName = `${user?.id}-${selectedAssignment}-${Date.now()}.${fileExt}`;
                    const filePath = `assignments/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                      .from('course-materials')
                      .upload(filePath, uploadFile);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                      .from('course-materials')
                      .getPublicUrl(filePath);

                    // Create submission
                    const { error } = await supabase.from('submissions').upsert({
                      assignment_id: selectedAssignment,
                      user_id: user?.id,
                      submission_text: uploadText,
                      file_url: data.publicUrl,
                      status: 'submitted',
                      submitted_at: new Date().toISOString(),
                    });

                    if (error) throw error;

                    alert('Work submitted successfully!');
                    setUploadFile(null);
                    setUploadText('');
                    setSelectedAssignment('');
                    fetchAssignments();
                  } catch (error) {
                    console.error('Error submitting work:', error);
                    alert('Error submitting work. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }} className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Select Assignment
                    </label>
                    <select
                      value={selectedAssignment}
                      onChange={(e) => setSelectedAssignment(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
                    >
                      <option value="">Choose an assignment...</option>
                      {assignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.title} - {assignment.lesson_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Upload Your Work (Required)
                    </label>
                    <div className="border-2 border-dashed border-mocha/30 rounded-lg p-8 text-center hover:border-mocha/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*,video/*,.pdf"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="submission-file-upload"
                        required
                      />
                      <label htmlFor="submission-file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-mocha" />
                        <p className="text-charcoal font-medium mb-1">
                          {uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-mocha-dark">
                          PDF, Images (PNG, JPG), or Videos (MP4) - Max 100MB
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha resize-none"
                      placeholder="Add any notes or comments about your submission..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !uploadFile || !selectedAssignment}
                    className="w-full px-8 py-4 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium"
                  >
                    <Upload className="w-6 h-6" />
                    {uploading ? 'Submitting...' : 'Submit Work'}
                  </button>
                </form>
              </div>

              {/* Previous Submissions */}
              <div>
                <h3 className="font-serif text-2xl text-charcoal mb-4">My Submissions</h3>
                {assignments.filter(a => a.submission_status !== 'not_submitted').length > 0 ? (
                  <div className="space-y-4">
                    {assignments
                      .filter(a => a.submission_status !== 'not_submitted')
                      .map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg text-charcoal">
                                {assignment.title}
                              </h4>
                              <p className="text-sm text-mocha-dark">
                                {assignment.lesson_title}
                              </p>
                            </div>
                            <div>
                              {assignment.submission_status === 'graded' ? (
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Graded
                                </span>
                              ) : (
                                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  Submitted
                                </span>
                              )}
                            </div>
                          </div>

                          {assignment.file_url && (
                            <a
                              href={assignment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-mocha hover:text-mocha-dark mb-3"
                            >
                              <FileText className="w-4 h-4" />
                              View Submitted File
                            </a>
                          )}

                          {assignment.submission_status === 'graded' && assignment.score !== undefined && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                              <p className="text-green-800 font-medium">
                                Score: {assignment.score}/{assignment.max_score}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-mocha/30" />
                    <h4 className="font-serif text-xl text-charcoal mb-2">
                      No Submissions Yet
                    </h4>
                    <p className="text-mocha-dark">
                      Upload your completed work using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
