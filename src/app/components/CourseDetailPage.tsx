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
.mba-cd .disp,.mba-cd .display{overflow-wrap:break-word;}
@media (max-width:640px){.mba-cd h1.disp,.mba-cd h1.display{font-size:clamp(24px,7.4vw,40px)!important;}.mba-cd h2.disp,.mba-cd h2.display{font-size:clamp(17px,5.2vw,28px)!important;}.mba-cd h3.disp,.mba-cd h3.display{font-size:clamp(16px,5vw,22px)!important;}.mba-cd .grid-cols-3:not(.cards){grid-template-columns:1fr!important;}}
.mba-cd h1,.mba-cd h2,.mba-cd h3,.mba-cd h4,.mba-cd p,.mba-cd label,.mba-cd input,.mba-cd textarea,.mba-cd select,.mba-cd button{font-family:inherit;}
.mba-cd{background:#f5f4f1;font-family:'Anonymous Pro','Courier New',monospace;font-weight:400;color:#191a1e;-webkit-font-smoothing:antialiased;}
.mba-cd .disp{font-family:'Horizon','Arial Black',Arial,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0;line-height:1.08;line-height:0.98;}
`;

// Struck-through "regular" price shown above the founding price.
// Set to 0 to hide, or update when the price rises.
const ANCHOR_PRICE = 297;

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

  // The free class lives on its own interactive page now
  const freeClassPage = (c: any) => ((c?.language || '').toUpperCase() === 'ES' ? '/free-class-es.html' : '/free-class.html');
  const isFreeCourse = !!course && (!course.price || course.price === 0);
  useEffect(() => {
    if (isFreeCourse) window.location.replace(freeClassPage(course));
  }, [isFreeCourse]);

  const handleEnroll = async () => {
    window.location.href = 'https://buy.stripe.com/8x25kD94m6Khe0cfcAd7q00';
  };

  if (loading) {
    return (
      <div className="mba-cd min-h-screen bg-[#f5f4f1] flex items-center justify-center">
        <style>{DISP_CSS}</style>
        <div className="w-8 h-8 border-2 border-stone-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mba-cd min-h-screen bg-[#f5f4f1] flex items-center justify-center">
        <style>{DISP_CSS}</style>
        <div className="text-center">
          <h1 className="disp text-2xl text-[#191a1e] mb-6">Course Not Found</h1>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#191a1e] text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mba-cd min-h-screen bg-[#f5f4f1] pt-24 pb-20">
      <style>{DISP_CSS}</style>
      <div className="max-w-7xl mx-auto px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 text-[0.58rem] tracking-[0.2em] uppercase text-stone-400">
          <Link to="/courses" className="hover:text-[#191a1e] transition-colors">Courses</Link>
          <span>—</span>
          <span className="text-[#191a1e]">{course.title}</span>
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
                <div className="w-5 h-px bg-stone-400" />
                <span className="text-[0.58rem] tracking-[0.25em] uppercase text-stone-500">
                  Signature Program
                </span>
              </div>

              <h1 className="disp text-3xl md:text-4xl text-[#191a1e] leading-none mb-6">
                {course.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-stone-200">
                {course.level && (
                  <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-stone-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    {course.level}
                  </div>
                )}
                {course.duration_hours && (
                  <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration_hours} Hours
                  </div>
                )}
                <div className="flex items-center gap-2 text-[0.6rem] tracking-widest uppercase text-stone-500">
                  <Award className="w-3.5 h-3.5" />
                  Certificate Included
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed mb-12">
                {course.description}
              </p>

              {/* Curriculum */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-5 h-px bg-stone-400" />
                  <span className="text-[0.58rem] tracking-[0.25em] uppercase text-stone-500">
                    Course Curriculum
                  </span>
                </div>

                <h2 className="disp text-2xl text-[#191a1e] mb-8">
                  What You'll Learn
                </h2>

                <div className="space-y-px bg-stone-200">
                  {modules.length > 0 ? (
                    modules.map((module, index) => (
                      <div key={module.id} className="bg-white p-6 flex items-start gap-5">
                        <div className="w-8 h-8 border border-stone-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {isEnrolled ? (
                            <Play className="w-3.5 h-3.5 text-[#191a1e]" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-[0.58rem] tracking-[0.15em] uppercase text-stone-400 mb-1">
                            Module {index + 1}
                          </div>
                          <h3 className="text-sm font-medium text-[#191a1e] mb-1">{module.title}</h3>
                          <p className="text-xs text-stone-600 leading-relaxed">{module.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-12 text-center">
                      <p className="text-xs text-stone-400 tracking-widest uppercase">Curriculum coming soon</p>
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
              <div className="border border-stone-200 bg-white">

                {isEnrolled ? (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-200">
                      <CheckCircle className="w-5 h-5 text-[#191a1e]" />
                      <div>
                        <div className="text-[0.6rem] tracking-[0.15em] uppercase text-[#191a1e] font-medium">Enrolled</div>
                        <div className="text-xs text-stone-500 mt-0.5">You have full access</div>
                      </div>
                    </div>
                    <button
                      onClick={() => (isFreeCourse ? window.location.assign(freeClassPage(course)) : navigate(`/learn/${course.id}`))}
                      className="w-full py-4 bg-[#191a1e] text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all"
                    >
                      Continue Learning
                    </button>
                  </div>
                ) : (
                  <div className="p-8">
                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-stone-200">
                      {ANCHOR_PRICE > course.price && (
                        <div className="text-stone-400 line-through text-xl mb-1">${ANCHOR_PRICE}</div>
                      )}
                      <div className="disp text-3xl text-[#191a1e] mb-1">
                        ${course.price}
                      </div>
                      <div className="text-[0.55rem] tracking-widest uppercase text-stone-400">
                        Founding price · going up soon
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleEnroll}
                      disabled={purchasing}
                      className="w-full py-4 bg-[#191a1e] text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                    >
                      {purchasing ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Enroll Now'
                      )}
                    </button>

                    {/* BNPL */}
                    <div className="text-center mb-6">
                      <div className="text-[0.55rem] tracking-widest uppercase text-stone-400 mb-2">
                        Pay later with
                      </div>
                      <div className="flex justify-center gap-2">
                        {['Klarna', 'Afterpay', 'Affirm'].map((m) => (
                          <span key={m} className="px-2.5 py-1 border border-stone-200 text-[0.52rem] tracking-wide text-stone-500">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="border-t border-stone-200 pt-6 space-y-3">
                      {[
                        'Lifetime access to all materials',
                        'Certificate of completion',
                        'Downloadable resources',
                        'Community access',
                        'Mobile & desktop access',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="text-[#191a1e] text-xs">—</span>
                          <span className="text-xs text-stone-600">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 pt-6 border-t border-stone-200 flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[0.6rem] text-stone-500 leading-relaxed">
                        All sales are final. This is a digital program and is non-refundable.
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
