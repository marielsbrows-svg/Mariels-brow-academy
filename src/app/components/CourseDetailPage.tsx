import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Award, CheckCircle, Play, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  duration_hours: number | null;
  level: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

const DISP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-cd{font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;}
.mba-cd .disp{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.02em;line-height:0.98;}
`;

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
      if (user) checkEnrollment();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', id).single(),
        supabase.from('course_modules').select('*').eq('course_id', id).order('order_index'),
      ]);
      if (courseRes.error) throw courseRes.error;
      setCourse(courseRes.data);
      setModules(modulesRes.data || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();
      if (!error && data) setIsEnrolled(true);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/course/${id}` } });
      return;
    }
    setPurchasing(true);
    try {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: id });
      if (enrollError) throw enrollError;
      await supabase.from('payments').insert({
        user_id: user.id,
        course_id: id,
        amount: course?.price || 0,
        status: 'completed',
        payment_method: 'stripe',
      });
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="mba-cd min-h-screen bg-white flex items-center justify-center">
        <style>{DISP_CSS}</style>
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mba-cd min-h-screen bg-white flex items-center justify-center">
        <style>{DISP_CSS}</style>
        <div className="text-center">
          <h1 className="disp text-4xl text-black mb-6">Course Not Found</h1>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mba-cd min-h-screen bg-white pt-24 pb-20">
      <style>{DISP_CSS}</style>
      <div className="max-w-7xl mx-auto px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 text-[0.58rem] tracking-[0.2em] uppercase text-neutral-400">
          <Link to="/courses" className="hover:text-black transition-colors">Courses</Link>
          <span>—</span>
          <span className="text-black">{course.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Hero Image */}
              <div className="relative aspect-video overflow-hidden mb-10">
                <ImageWithFallback
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-px bg-neutral-400" />
                <span className="text-[0.58rem] tracking-[0.25em] uppercase text-neutral-500">
                  Signature Program
                </span>
              </div>

              <h1 className="disp text-5xl md:text-6xl text-black leading-none mb-6">
                {course.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-200">
                {course.level && (
                  <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    {course.level}
                  </div>
                )}
                {course.duration_hours && (
                  <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration_hours} Hours
                  </div>
                )}
                <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-neutral-500">
                  <Award className="w-3.5 h-3.5" />
                  Certificate Included
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 leading-relaxed mb-12">
                {course.description}
              </p>

              {/* Curriculum */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-5 h-px bg-neutral-400" />
                  <span className="text-[0.58rem] tracking-[0.25em] uppercase text-neutral-500">
                    Course Curriculum
                  </span>
                </div>

                <h2 className="disp text-3xl text-black mb-8">
                  What You'll Learn
                </h2>

                <div className="space-y-px bg-neutral-200">
                  {modules.length > 0 ? (
                    modules.map((module, index) => (
                      <div key={module.id} className="bg-white p-6 flex items-start gap-5">
                        <div className="w-8 h-8 border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {isEnrolled ? (
                            <Play className="w-3.5 h-3.5 text-black" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-[0.58rem] tracking-[0.15em] uppercase text-neutral-400 mb-1">
                            Module {index + 1}
                          </div>
                          <h3 className="text-sm font-medium text-black mb-1">{module.title}</h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">{module.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-12 text-center">
                      <p className="text-xs text-neutral-400 tracking-widest uppercase">Curriculum coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="border border-neutral-200 bg-white">

                {isEnrolled ? (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-200">
                      <CheckCircle className="w-5 h-5 text-black" />
                      <div>
                        <div className="text-[0.6rem] tracking-[0.15em] uppercase text-black font-medium">Enrolled</div>
                        <div className="text-xs text-neutral-500 mt-0.5">You have full access</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="w-full py-4 bg-black text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all"
                    >
                      Continue Learning
                    </button>
                  </div>
                ) : (
                  <div className="p-8">
                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                      <div className="disp text-5xl text-black mb-1">
                        ${course.price}
                      </div>
                      <div className="text-[0.55rem] tracking-widest uppercase text-neutral-400">
                        One-time payment
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleEnroll}
                      disabled={purchasing}
                      className="w-full py-4 bg-black text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                    >
                      {purchasing ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Enroll Now'
                      )}
                    </button>

                    {/* BNPL */}
                    <div className="text-center mb-6">
                      <div className="text-[0.55rem] tracking-widest uppercase text-neutral-400 mb-2">
                        Pay later with
                      </div>
                      <div className="flex justify-center gap-2">
                        {['Klarna', 'Afterpay', 'Affirm'].map((m) => (
                          <span key={m} className="px-2.5 py-1 border border-neutral-200 text-[0.52rem] tracking-wide text-neutral-500">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="border-t border-neutral-200 pt-6 space-y-3">
                      {[
                        'Lifetime access to all materials',
                        'Certificate of completion',
                        'Downloadable resources',
                        'Community access',
                        'Mobile & desktop access',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="text-black text-xs">—</span>
                          <span className="text-xs text-neutral-600">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 pt-6 border-t border-neutral-200 flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[0.6rem] text-neutral-500 leading-relaxed">
                        30-day money back guarantee. No questions asked.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
