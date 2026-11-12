import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Lock } from 'lucide-react';
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
.mba-courses .disp,.mba-courses .display{overflow-wrap:break-word;}
@media (max-width:640px){.mba-courses h1.disp,.mba-courses h1.display{font-size:clamp(24px,7.4vw,40px)!important;}.mba-courses h2.disp,.mba-courses h2.display{font-size:clamp(17px,5.2vw,28px)!important;}.mba-courses h3.disp,.mba-courses h3.display{font-size:clamp(16px,5vw,22px)!important;}.mba-courses .grid-cols-3:not(.cards){grid-template-columns:1fr!important;}}
.mba-courses h1,.mba-courses h2,.mba-courses h3,.mba-courses h4,.mba-courses p,.mba-courses label,.mba-courses input,.mba-courses textarea,.mba-courses select,.mba-courses button{font-family:inherit;}
.mba-courses .cards>*{border:1px solid #dedbd6;border-left:3px solid #191a1e;background:#fff;}
.mba-courses{background:#f5f4f1;font-family:'Anonymous Pro','Courier New',monospace;font-weight:400;color:#191a1e;-webkit-font-smoothing:antialiased;}
.mba-courses .disp{font-family:'Horizon','Arial Black',Arial,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0;line-height:1.08;line-height:0.95;}
`;

// Struck-through "regular" price shown next to the founding price.
// 0 = no strikethrough. Set to 97 only if you genuinely raise the price after the founding window.
const ANCHOR_PRICE = 0;

// Doors open for paid courses. Edit this if the hour changes.
const LAUNCH_DATE = new Date('2026-09-24T00:00:00-04:00');

// Before LAUNCH_DATE, paid courses are hidden from this page completely.
// Flip to false if you'd rather tease them as locked "Opens Sept 24" cards.
const HIDE_PAID_UNTIL_LAUNCH = true;

export const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'EN' | 'ES'>('ALL');

  // Re-evaluated on mount; paid courses unlock at LAUNCH_DATE.
  const doorsOpen = new Date() >= LAUNCH_DATE;

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

  // Hide paid courses until the doors open.
  const visibleCourses = courses.filter(c => {
    const isFree = !c.price || c.price === 0;
    if (isFree || doorsOpen) return true;
    return !HIDE_PAID_UNTIL_LAUNCH;
  });

  const filteredCourses = visibleCourses.filter(c =>
    filter === 'ALL' ? true : c.language === filter
  );

  const enCourses = filteredCourses.filter(c => c.language === 'EN');
  const esCourses = filteredCourses.filter(c => c.language === 'ES');

  const CourseCard = ({ course, index }: { course: Course; index: number }) => {
    const isFree = !course.price || course.price === 0;
    const isLocked = !isFree && !doorsOpen;

    return (
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
            course.language === 'EN' ? 'bg-[#191a1e]' : 'bg-stone-500'
          }`}>
            {course.language}
          </div>

          {/* Free / Level Badge */}
          {isFree ? (
            <div className="absolute top-3 right-3 bg-white px-2.5 py-1 text-[0.52rem] tracking-[0.15em] uppercase text-[#191a1e]">
              Free
            </div>
          ) : course.level ? (
            <div className="absolute top-3 right-3 bg-white px-2.5 py-1 text-[0.52rem] tracking-[0.15em] uppercase text-[#191a1e]">
              {course.level}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-8">
          <h3 className="disp text-xl text-[#191a1e] mb-3">
            {course.title}
          </h3>

          <p className="text-xs text-stone-600 leading-relaxed mb-6 line-clamp-3">
            {course.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-200">
            {course.duration_hours && (
              <div className="flex items-center gap-1.5 text-[0.6rem] tracking-widest uppercase text-stone-400">
                <Clock className="w-3 h-3" />
                {course.duration_hours}h
              </div>
            )}
            <div className="text-[0.6rem] tracking-widest uppercase text-stone-400">
              {isFree ? 'Limited Time' : 'Lifetime Access'}
            </div>
            <div className="text-[0.6rem] tracking-widest uppercase text-stone-400">
              {course.language === 'EN' ? 'English' : 'Español'}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-end justify-between">
            <div>
              {isFree ? (
                <>
                  <div className="disp text-2xl text-[#191a1e]">Free</div>
                  <div className="text-[0.55rem] tracking-widest uppercase text-stone-400 mt-0.5">
                    Available for a limited time
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    {ANCHOR_PRICE > course.price && (
                      <span className="text-stone-400 line-through text-lg">${ANCHOR_PRICE}</span>
                    )}
                    <span className="disp text-2xl text-[#191a1e]">${course.price}</span>
                  </div>
                  <div className="text-[0.55rem] tracking-widest uppercase text-stone-400 mt-0.5">
                    {isLocked ? 'Founding price · September 24' : 'Founding price · going up soon'}
                  </div>
                </>
              )}
            </div>

            {isLocked ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-400 text-[0.58rem] tracking-[0.15em] uppercase cursor-default">
                <Lock className="w-3 h-3" />
                {course.language === 'ES' ? 'Abre Sept 24' : 'Opens Sept 24'}
              </div>
            ) : (
              <Link
                to={`/course/${course.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#191a1e] text-white text-[0.58rem] tracking-[0.15em] uppercase hover:opacity-80 transition-opacity duration-300"
              >
                {isFree
                  ? (course.language === 'ES' ? 'Empezar Gratis' : 'Start Free')
                  : (course.language === 'ES' ? 'Ver Curso' : 'View Course')}
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const SectionDivider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  );

  return (
    <div className="mba-courses min-h-screen bg-[#f5f4f1] pt-24">
      <style>{DISP_CSS}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 py-20 border-b border-stone-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-stone-400" />
            <span className="text-[0.58rem] tracking-[0.3em] uppercase text-stone-400">
              Mariels Brow Academy
            </span>
          </div>
          <h1 className="disp text-4xl md:text-5xl text-[#191a1e] mb-6">
            Our Courses
          </h1>
          <p className="text-sm text-stone-600 max-w-lg leading-relaxed">
            Professional brow certification programs available in English and Spanish. Lifetime access included with every paid course.
          </p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-8 py-8 flex items-center gap-3 border-b border-stone-200">
        <span className="text-[0.58rem] tracking-[0.2em] uppercase text-stone-400 mr-2">Filter:</span>
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
                ? 'bg-[#191a1e] text-white'
                : 'border border-stone-300 text-stone-500 hover:border-[#191a1e] hover:text-[#191a1e]'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[0.58rem] tracking-wide text-stone-400">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
        </span>
      </div>

      {/* Courses */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-32">
            <div className="disp text-2xl text-[#191a1e] mb-4">
              No Courses Found
            </div>
            <p className="text-sm text-stone-500 tracking-wide">
              {filter === 'ES' ? 'Los cursos en español estarán disponibles pronto.' : 'Courses coming soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">

            {/* English Courses */}
            {(filter === 'ALL' || filter === 'EN') && enCourses.length > 0 && (
              <div>
                {filter === 'ALL' && <SectionDivider label="English Programs" />}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 cards">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 cards">
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
