import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, BookOpen, TrendingUp, FileText, CheckCircle, ArrowRight } from 'lucide-react';
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
    if (!isAdmin) { navigate('/dashboard'); return; }
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
      setStats({ totalStudents: studentsRes.count || 0, totalRevenue, totalCourses: coursesRes.count || 0, totalEnrollments: enrollmentsRes.count || 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('submissions')
        .select(`*, assignments (title, max_score, lessons (title)), profiles (full_name, email)`)
        .order('submitted_at', { ascending: false });
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  if (!isAdmin) return null;

  const statCards = [
    { icon: Users, value: stats.totalStudents, label: 'Total Students', format: (v: number) => v.toString() },
    { icon: DollarSign, value: stats.totalRevenue, label: 'Total Revenue', format: (v: number) => `$${v.toLocaleString()}` },
    { icon: BookOpen, value: stats.totalCourses, label: 'Total Courses', format: (v: number) => v.toString() },
    { icon: TrendingUp, value: stats.totalEnrollments, label: 'Enrollments', format: (v: number) => v.toString() },
  ];

  const tabs = [
    { key: 'courses', label: 'Course Management' },
    { key: 'submissions', label: 'Student Submissions' },
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
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Admin Portal</span>
          </div>
          <h1
            className="text-5xl md:text-6xl text-charcoal font-light leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Admin <span className="italic">Dashboard</span>
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-mocha/10 mb-16">
          {statCards.map(({ icon: Icon, value, label, format }, i) => (
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
                  {loading ? '—' : format(value)}
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
                activeTab === tab.key ? 'text-charcoal' : 'text-mocha/40 hover:text-mocha/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-px bg-charcoal" />}
            </button>
          ))}
        </div>

        {/* ── COURSE MANAGEMENT TAB ── */}
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CourseManagement />
          </motion.div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === 'submissions' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-5 h-px bg-mocha/40" />
              <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Student Submissions</span>
            </div>

            {submissions.length > 0 ? (
              <div className="space-y-px bg-mocha/10">
                {submissions.map((submission) => (
                  <div key={submission.id} className="bg-white p-8">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-mocha/08">
                      <div>
                        <h3
                          className="text-xl text-charcoal font-light mb-1"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {submission.assignments?.title || 'Unknown Assignment'}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs text-mocha/50 tracking-wide">
                            Lesson: {submission.assignments?.lessons?.title || 'Unknown'}
                          </p>
                          <p className="text-xs text-mocha/50 tracking-wide">
                            Student: {submission.profiles?.full_name || submission.profiles?.email || 'Unknown'}
                          </p>
                          <p className="text-[0.55rem] text-mocha/30 tracking-wide uppercase">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[0.52rem] tracking-[0.15em] uppercase flex-shrink-0 ${
                        submission.status === 'graded'
                          ? 'bg-charcoal text-cream'
                          : 'border border-mocha/20 text-mocha/60'
                      }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                      </span>
                    </div>

                    {/* Written Response */}
                    {submission.submission_text && (
                      <div className="bg-cream px-5 py-4 mb-4">
                        <p className="text-[0.58rem] tracking-[0.15em] uppercase text-mocha/50 mb-2">Written Response</p>
                        <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                          {submission.submission_text}
                        </p>
                      </div>
                    )}

                    {/* File */}
                    {submission.file_url && (
                      <div className="mb-4">
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[0.6rem] tracking-[0.15em] uppercase text-mocha hover:text-charcoal transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Submitted File
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Grade */}
                    {submission.status === 'graded' && (
                      <div className="flex items-center gap-3 pt-4 border-t border-mocha/08">
                        <CheckCircle className="w-4 h-4 text-mocha" />
                        <span className="text-xs text-charcoal">
                          Score: {submission.score}/{submission.assignments?.max_score}
                        </span>
                        {submission.feedback && (
                          <span className="text-xs text-mocha/60">· {submission.feedback}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-mocha/15 bg-white p-16 text-center">
                <FileText className="w-10 h-10 mx-auto mb-5 text-mocha/20" />
                <h3
                  className="text-2xl text-charcoal font-light italic mb-3"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  No Submissions Yet
                </h3>
                <p className="text-xs text-mocha/50 tracking-wide">
                  Student assignment submissions will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
