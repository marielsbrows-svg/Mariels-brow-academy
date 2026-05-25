import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ImageWithFallback } from './ImageWithFallback';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  duration_hours: number | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
}

export const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
    ];
    return `${images[index % images.length]}?w=800`;
  };

  return (
    <div className="min-h-screen bg-cream pt-24">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 py-20 border-b border-mocha/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.3em] uppercase text-mocha/50">
              Mariels Brow Academy
            </span>
          </div>
          <h1
            className="text-6xl md:text-7xl text-charcoal font-light leading-tight mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Our <span className="italic">Courses</span>
          </h1>
          <p className="text-sm text-mocha-dark max-w-lg leading-relaxed">
            Choose the perfect program to launch or elevate your brow artistry career. Lifetime access included with every course.
          </p>
        </motion.div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-32">
            <div
              className="text-3xl text-charcoal italic mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Coming Soon
            </div>
            <p className="text-sm text-mocha/60 tracking-wide">New courses are being prepared for you.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mocha/10">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={course.thumbnail_url || getDefaultImage(index)}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  {course.level && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-white px-2.5 py-1 text-[0.52rem] tracking-[0.15em] uppercase text-charcoal">
                        {course.level}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3
                    className="text-2xl text-charcoal font-light mb-3 leading-tight"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {course.title}
                  </h3>

                  <p className="text-xs text-mocha-dark leading-relaxed mb-6 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-mocha/08">
                    {course.duration_hours && (
                      <div className="flex items-center gap-1.5 text-[0.6rem] tracking-widest uppercase text-mocha/50">
                        <Clock className="w-3 h-3" />
                        {course.duration_hours}h
                      </div>
                    )}
                    <div className="text-[0.6rem] tracking-widest uppercase text-mocha/50">
                      Lifetime Access
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div
                        className="text-3xl text-charcoal font-light"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        ${course.price}
                      </div>
                      <div className="text-[0.55rem] tracking-widest uppercase text-mocha/40 mt-0.5">
                        Klarna · Afterpay · Affirm
                      </div>
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:bg-mocha transition-all duration-300"
                    >
                      View Course
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
