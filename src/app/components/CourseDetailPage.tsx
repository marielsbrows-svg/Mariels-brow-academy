import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Award, CheckCircle, Play, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';
import { loadStripe } from '@stripe/stripe-js';

// In production, load from env variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

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
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', id).single(),
        supabase.from('course_modules').select('*').eq('course_id', id).order('order_index'),
      ]);

      if (courseRes.error) throw courseRes.error;
      if (modulesRes.error) throw modulesRes.error;

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

      if (!error && data) {
        setIsEnrolled(true);
      }
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
      // Create enrollment (in real app, this would be after successful payment)
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: id,
        });

      if (enrollError) throw enrollError;

      // Record payment (mock for now)
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
      alert('Error enrolling in course. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-charcoal mb-4">Course Not Found</h1>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-mocha text-white rounded-full"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl">
                <ImageWithFallback
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <h1 className="font-serif italic text-5xl text-charcoal mb-4">
                {course.title}
              </h1>

              <div className="flex items-center gap-6 mb-8">
                {course.level && (
                  <span className="px-4 py-2 bg-mocha/10 text-mocha rounded-full text-sm uppercase tracking-wider">
                    {course.level}
                  </span>
                )}
                {course.duration_hours && (
                  <div className="flex items-center gap-2 text-mocha-dark">
                    <Clock className="w-5 h-5" />
                    {course.duration_hours} hours
                  </div>
                )}
                <div className="flex items-center gap-2 text-mocha-dark">
                  <Award className="w-5 h-5" />
                  Certificate included
                </div>
              </div>

              <p className="text-lg text-mocha-dark leading-relaxed mb-12">
                {course.description}
              </p>

              {/* Course Curriculum */}
              <div>
                <h2 className="font-serif text-3xl text-charcoal mb-6">
                  Course Curriculum
                </h2>

                <div className="space-y-4">
                  {modules.length > 0 ? (
                    modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="bg-white rounded-xl p-6 shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-mocha/10 rounded-full flex items-center justify-center flex-shrink-0">
                            {isEnrolled ? (
                              <Play className="w-5 h-5 text-mocha" />
                            ) : (
                              <Lock className="w-5 h-5 text-mocha-dark" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl text-charcoal mb-2">
                              Module {index + 1}: {module.title}
                            </h3>
                            <p className="text-mocha-dark">{module.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl p-8 text-center">
                      <p className="text-mocha-dark">Curriculum coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-2xl sticky top-24"
            >
              {isEnrolled ? (
                <>
                  <div className="bg-mocha/10 border border-mocha/20 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 text-mocha mb-2">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-medium">You're enrolled!</span>
                    </div>
                    <p className="text-sm text-mocha-dark">
                      Access all course materials and start learning
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full px-6 py-4 bg-mocha text-white rounded-full text-lg hover:bg-mocha-dark transition-colors shadow-lg hover:shadow-xl"
                  >
                    Go to Course
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="font-serif text-5xl text-charcoal mb-2">
                      ${course.price}
                    </div>
                    <p className="text-mocha-dark">One-time payment</p>
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={purchasing}
                    className="w-full px-6 py-4 bg-mocha text-white rounded-full text-lg hover:bg-mocha-dark transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 mb-4"
                  >
                    {purchasing ? 'Processing...' : 'Enroll Now'}
                  </button>

                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-center text-mocha-dark">
                      Payment plans available with:
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Klarna', 'Afterpay', 'Affirm'].map((method) => (
                        <span
                          key={method}
                          className="px-3 py-1 bg-linen rounded-full text-xs text-mocha-dark"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-3">
                    <div className="flex items-center gap-3 text-mocha-dark">
                      <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0" />
                      Lifetime access
                    </div>
                    <div className="flex items-center gap-3 text-mocha-dark">
                      <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0" />
                      Certificate of completion
                    </div>
                    <div className="flex items-center gap-3 text-mocha-dark">
                      <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0" />
                      Downloadable resources
                    </div>
                    <div className="flex items-center gap-3 text-mocha-dark">
                      <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0" />
                      Mobile & desktop access
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
