import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, TrendingUp, CheckCircle } from 'lucide-react';
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

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return 'bg-mocha/10 text-mocha';
      case 'intermediate':
        return 'bg-mocha-dark/10 text-mocha-dark';
      case 'advanced':
        return 'bg-charcoal/10 text-charcoal';
      default:
        return 'bg-linen text-mocha-dark';
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
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif italic text-6xl text-charcoal mb-4">
            Our Courses
          </h1>
          <p className="text-xl text-mocha-dark max-w-2xl mx-auto">
            Choose the perfect course to launch or elevate your brow artistry career
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={course.thumbnail_url || getDefaultImage(index)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {course.level && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-2xl text-charcoal mb-3">
                    {course.title}
                  </h3>
                  <p className="text-mocha-dark leading-relaxed mb-6 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 mb-6 text-sm text-mocha-dark">
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration_hours}h
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Professional
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif text-3xl text-charcoal">
                        ${course.price}
                      </div>
                      <div className="text-sm text-mocha-dark">or payment plans</div>
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors shadow-lg hover:shadow-xl"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-mocha-dark text-xl">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
