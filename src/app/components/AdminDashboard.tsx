import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, BookOpen, TrendingUp, Plus, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CourseManagement } from './CourseManagement';

export const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'submissions'>('courses');
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    fetchSubmissions();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [studentsRes, paymentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats({
        totalStudents: studentsRes.count || 0,
        totalRevenue,
        totalCourses: coursesRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          *,
          assignments (
            title,
            max_score,
            lessons (
              title
            )
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="font-serif italic text-5xl text-charcoal mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-mocha-dark">
            Manage courses, students, and academy performance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {loading ? '...' : stats.totalStudents}
                </div>
                <div className="text-sm text-mocha-dark">Total Students</div>
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
                <DollarSign className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
                </div>
                <div className="text-sm text-mocha-dark">Total Revenue</div>
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
                <BookOpen className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {loading ? '...' : stats.totalCourses}
                </div>
                <div className="text-sm text-mocha-dark">Total Courses</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-mocha" />
              </div>
              <div>
                <div className="text-3xl font-serif text-charcoal">
                  {loading ? '...' : stats.totalEnrollments}
                </div>
                <div className="text-sm text-mocha-dark">Enrollments</div>
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
              Course Management
              {activeTab === 'courses' && (
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
              Student Submissions
              {activeTab === 'submissions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mocha"></div>
              )}
            </button>
          </div>

          {/* Course Management Tab */}
          {activeTab === 'courses' && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CourseManagement />
            </motion.div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div>
              <h2 className="font-serif text-3xl text-charcoal mb-6">Student Submissions</h2>
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-xl text-charcoal mb-1">
                            {submission.assignments?.title || 'Unknown Assignment'}
                          </h3>
                          <p className="text-sm text-mocha-dark">
                            Lesson: {submission.assignments?.lessons?.title || 'Unknown Lesson'}
                          </p>
                          <p className="text-sm text-mocha-dark mt-1">
                            Student: {submission.profiles?.full_name || submission.profiles?.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-mocha-dark mt-1">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          {submission.status === 'graded' ? (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Graded
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      {submission.submission_text && (
                        <div className="bg-cream rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-charcoal mb-2">Written Response:</p>
                          <p className="text-sm text-charcoal whitespace-pre-wrap">
                            {submission.submission_text}
                          </p>
                        </div>
                      )}

                      {submission.file_url && (
                        <div className="bg-cream rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-charcoal mb-2">Submitted File:</p>
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mocha hover:text-mocha-dark flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View/Download File
                          </a>
                        </div>
                      )}

                      {submission.status === 'graded' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-sm text-green-800 font-medium mb-2">
                            Score: {submission.score}/{submission.assignments?.max_score}
                          </div>
                          {submission.feedback && (
                            <div className="text-sm text-green-700">
                              Feedback: {submission.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-mocha/30" />
                  <h3 className="font-serif text-2xl text-charcoal mb-3">
                    No Submissions Yet
                  </h3>
                  <p className="text-mocha-dark">
                    Student assignment submissions will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
