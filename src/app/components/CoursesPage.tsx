import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
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
  language: 'EN' | 'ES';
}

const DISP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-courses{font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;}
.mba-courses .disp{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.02em;line-height:0.95;}
`;

export const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'EN' | 'ES'>('ALL');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('language', { ascending: true })
        .order('created_at', { ascending: true });
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

  const filteredCourses = courses.filter(c =>
    filter === 'ALL' ? true : c.language === filter
  );

  const enCourses = filteredCourses.filter(c => c.language === 'EN');
  const esCourses = filteredCourses.filter(c => c.language === 'ES');

  const CourseCard = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={course.thumbnail_url || getDefaultImage(index)}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Language Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 text-[0.52rem] tracking-[0.15em] uppercase font-semibold text-white ${
          course.language === 'EN' ? 'bg-black' : 'bg-neutral-500'
        }`}>
          {course.language}
        </div>

        {/* Level Badge */}
        {course.level && (
          <div className="absolute top-3 right-3 bg-white px-2.5 py-1 text-[0.52rem] tracking-[0.15em] uppercase text-black">
            {course.level}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8">
        <h3 className="disp text-2xl text-black mb-3">
          {course.title}
        </h3>

        <p className="text-xs text-neutral-600 leading-relaxed mb-6 line-clamp-3">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
          {course.duration_hours && (
            <div className="flex items-center gap-1.5 text-[0.6rem] tracking-widest uppercase text-neutral-400">
              <Clock className="w-3 h-3" />
              {course.duration_hours}h
            </div>
          )}
          <div className="text-[0.6rem] tracking-widest uppercase text-neutral-400">
            Lifetime Access
          </div>
          <div className="text-[0.6rem] tracking-widest uppercase text-neutral-400">
            {course.language === 'EN' ? 'English' : 'Español'}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <div>
            <div className="disp text-3xl text-black">
              ${course.price}
            </div>
            <div className="text-[0.55rem] tracking-widest uppercase text-neutral-400 mt-0.5">
              Klarna · Afterpay · Affirm
            </div>
          </div>
          <Link
            to={`/course/${course.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[0.58rem] tracking-[0.15em] uppercase hover:opacity-80 transition-opacity duration-300"
          >
            {course.language === 'ES' ? 'Ver Curso' : 'View Course'}
          </Link>
        </div>
      </div>
    </motion.div>
  );

  const SectionDivider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-[0.6rem] tracking-[0.25em] uppercase text-neutral-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );

  return (
    <div className="mba-courses min-h-screen bg-white pt-24">
      <style>{DISP_CSS}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 py-20 border-b border-neutral-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-neutral-400" />
            <span className="text-[0.58rem] tracking-[0.3em] uppercase text-neutral-400">
              Mariels Brow Academy
            </span>
          </div>
          <h1 className="disp text-6xl md:text-7xl text-black mb-6">
            Our Courses
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg leading-relaxed">
            Professional brow certification programs available in English and Spanish. Lifetime access included with every course.
          </p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-8 py-8 flex items-center gap-3 border-b border-neutral-200">
        <span className="text-[0.58rem] tracking-[0.2em] uppercase text-neutral-400 mr-2">Filter:</span>
        {[
          { key: 'ALL', label: 'All Courses' },
          { key: 'EN', label: 'English' },
          { key: 'ES', label: 'Español' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-5 py-2 text-[0.62rem] tracking-[0.15em] uppercase transition-all ${
              filter === key
                ? 'bg-black text-white'
                : 'border border-neutral-300 text-neutral-500 hover:border-black hover:text-black'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[0.58rem] tracking-wide text-neutral-400">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
        </span>
      </div>

      {/* Courses */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-32">
            <div className="disp text-3xl text-black mb-4">
              No Courses Found
            </div>
            <p className="text-sm text-neutral-500 tracking-wide">
              {filter === 'ES' ? 'Los cursos en español estarán disponibles pronto.' : 'Courses coming soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">

            {/* English Courses */}
            {(filter === 'ALL' || filter === 'EN') && enCourses.length > 0 && (
              <div>
                {filter === 'ALL' && <SectionDivider label="English Programs" />}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200">
                  {enCourses.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Spanish Courses */}
            {(filter === 'ALL' || filter === 'ES') && esCourses.length > 0 && (
              <div>
                {filter === 'ALL' && <SectionDivider label="Programas en Español" />}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200">
                  {esCourses.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
