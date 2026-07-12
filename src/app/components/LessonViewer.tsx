import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, Download, Menu, MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SlideViewer } from './SlideViewer';
import { AIAssistant } from './AIAssistant';
import { QuizComponent } from './QuizComponent';

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string | null;
  duration: number | null;
  order_index: number;
  resources?: Resource[];
  progress?: {
    completed: boolean;
    last_position_seconds: number;
  };
}

interface Resource {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  resource_type: string;
}

interface Course {
  id: string;
  title: string;
}

export const LessonViewer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slidesCompleted, setSlidesCompleted] = useState(false);

  useEffect(() => {
    if (courseId && user) fetchCourseContent();
  }, [courseId, user]);

  useEffect(() => {
    setSlidesCompleted(false);
  }, [currentLesson?.id]);

  const fetchCourseContent = async () => {
    try {
      const { data: courseData } = await supabase.from('courses').select('id, title').eq('id', courseId).single();
      setCourse(courseData);

      const { data: modulesData } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true });

      if (modulesData) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessonsData } = await supabase.from('lessons').select('*').eq('module_id', module.id).order('order_index', { ascending: true });
            const lessonsWithProgress = await Promise.all(
              (lessonsData || []).map(async (lesson) => {
                const { data: progressData } = await supabase.from('lesson_progress').select('completed, last_position_seconds').eq('user_id', user?.id).eq('lesson_id', lesson.id).single();
                const { data: resourcesData } = await supabase.from('lesson_resources').select('*').eq('lesson_id', lesson.id);
                return {
                  ...lesson,
                  progress: progressData || { completed: false, last_position_seconds: 0 },
                  resources: resourcesData || [],
                };
              })
            );
            return { ...module, lessons: lessonsWithProgress };
          })
        );
        setModules(modulesWithLessons);
        if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
          setCurrentLesson(modulesWithLessons[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;
    try {
      await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setModules(prev => prev.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, progress: { ...lesson.progress!, completed: true } }
            : lesson
        ),
      })));
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    for (let i = 0; i < modules.length; i++) {
      const lessonIndex = modules[i].lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex !== -1) {
        if (lessonIndex < modules[i].lessons.length - 1) return modules[i].lessons[lessonIndex + 1];
        if (i < modules.length - 1 && modules[i + 1].lessons.length > 0) return modules[i + 1].lessons[0];
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    for (let i = 0; i < modules.length; i++) {
      const lessonIndex = modules[i].lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex !== -1) {
        if (lessonIndex > 0) return modules[i].lessons[lessonIndex - 1];
        if (i > 0 && modules[i - 1].lessons.length > 0) return modules[i - 1].lessons[modules[i - 1].lessons.length - 1];
      }
    }
    return null;
  };

  // Called when quiz is passed — marks lesson complete and moves to next lesson
  const handleQuizPass = async (lessonId: string) => {
    await markLessonComplete(lessonId);
    setTimeout(() => {
      const next = getNextLesson();
      if (next) setCurrentLesson(next);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cream/20 border-t-cream rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream pt-20">
      <div className="flex h-[calc(100vh-80px)]">

        {/* SIDEBAR */}
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 320 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-charcoal border-r border-white/08 overflow-hidden flex-shrink-0"
        >
          <div className="w-[320px] h-full overflow-y-auto">
            <div className="p-6 border-b border-white/08">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-[0.58rem] tracking-[0.2em] uppercase text-cream/30 hover:text-cream/60 transition-colors mb-5">
                <ArrowLeft className="w-3 h-3" /> Dashboard
              </Link>
              <h2 className="text-xl text-cream font-light leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {course?.title}
              </h2>
            </div>

            <div className="p-4">
              {modules.map((module) => (
                <div key={module.id} className="mb-8">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-3 h-px bg-cream/20" />
                    <h3 className="text-[0.52rem] tracking-[0.2em] uppercase text-cream/30">{module.title}</h3>
                  </div>
                  <div className="space-y-0.5">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                          currentLesson?.id === lesson.id
                            ? 'bg-white/10 border-l-2 border-cream'
                            : 'hover:bg-white/05 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {lesson.progress?.completed
                            ? <CheckCircle className="w-4 h-4 text-cream/60" />
                            : <div className="w-4 h-4 border border-cream/20 rounded-full" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cream/70 truncate leading-relaxed">{lesson.title}</div>
                          {lesson.duration && (
                            <div className="text-[0.52rem] tracking-wide text-cream/30 mt-0.5">{lesson.duration} min</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-charcoal border-b border-white/08 px-6 py-4 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/05 transition-colors">
              <Menu className="w-4 h-4 text-cream/50" />
            </button>
            <h1 className="text-sm text-cream/70 flex-1 truncate">{currentLesson?.title}</h1>
          </div>

          <div className="p-8 max-w-4xl">
            {currentLesson ? (
              <div className="space-y-6">

                {/* Lesson Info */}
                <div className="bg-white text-charcoal p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-px bg-mocha/40" />
                    <span className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/50">Current Lesson</span>
                  </div>
                  <h2 className="text-3xl text-charcoal font-light mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-mocha-dark leading-relaxed">{currentLesson.description}</p>
                  {currentLesson.resources?.some(r => r.resource_type === 'slides') && !slidesCompleted && (
                    <div className="mt-4 px-4 py-3 border border-mocha/15 bg-linen text-xs text-mocha-dark">
                      Review the slides below, then continue to the video lesson
                    </div>
                  )}
                </div>

                {/* Slides */}
                {currentLesson.resources?.some(r => r.resource_type === 'slides') && !slidesCompleted && (
                  <SlideViewer
                    slideUrl={currentLesson.resources.find(r => r.resource_type === 'slides')!.file_url}
                    onComplete={() => setSlidesCompleted(true)}
                  />
                )}

                {/* Workbooks */}
                {currentLesson.resources && currentLesson.resources.filter(r => r.resource_type !== 'slides').length > 0 && (
                  <div className="bg-white text-charcoal p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-4 h-px bg-mocha/40" />
                      <span className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/50">Materials</span>
                    </div>
                    <h3 className="text-2xl text-charcoal font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Workbooks & <span className="italic">Resources</span>
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.resources.filter(r => r.resource_type !== 'slides').map((resource) => (
                        <a key={resource.id} href={resource.file_url} target="_blank" rel="noopener noreferrer" download
                          className="flex items-center gap-4 p-4 border border-mocha/10 hover:border-mocha/30 hover:bg-linen transition-all group">
                          <div className="w-9 h-9 border border-mocha/20 flex items-center justify-center group-hover:bg-charcoal group-hover:border-charcoal transition-all">
                            <Download className="w-3.5 h-3.5 text-mocha group-hover:text-cream" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-charcoal">{resource.title}</div>
                            <div className="text-[0.55rem] tracking-wide text-mocha/40 uppercase mt-0.5">
                              {resource.resource_type === 'workbook' ? 'Workbook' : 'Resource'}
                            </div>
                          </div>
                          <span className="text-[0.58rem] tracking-[0.15em] uppercase text-mocha/40">Download →</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {currentLesson.video_url && (slidesCompleted || !currentLesson.resources?.some(r => r.resource_type === 'slides')) && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-px bg-cream/20" />
                      <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Video Lesson</span>
                    </div>
                    <div className="aspect-video bg-black overflow-hidden">
                      <video src={currentLesson.video_url} controls className="w-full h-full" />
                    </div>
                  </div>
                )}

                {/* Quiz — key prop forces remount when lesson changes */}
                <QuizComponent
                  key={currentLesson.id}
                  lessonId={currentLesson.id}
                  onPass={() => handleQuizPass(currentLesson.id)}
                />

                {/* Community */}
                <div className="bg-white text-charcoal p-8 text-center">
                  <div className="w-10 h-10 border border-mocha/20 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-4 h-4 text-mocha" />
                  </div>
                  <h3 className="text-2xl text-charcoal font-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Join the <span className="italic">Discussion</span>
                  </h3>
                  <p className="text-xs text-mocha/50 tracking-wide mb-6">Connect with fellow students and share insights</p>
                  <Link to={`/community/${courseId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:bg-mocha transition-all">
                    Go to Community
                  </Link>
                </div>

                {/* Mark Complete */}
                {!currentLesson.progress?.completed && (
                  <div className="bg-white text-charcoal p-8 text-center">
                    <h4 className="text-xl text-charcoal font-light mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Finished this lesson?
                    </h4>
                    <button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-cream text-[0.6rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark as Complete
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-white/08">
                  <button
                    onClick={() => { const prev = getPreviousLesson(); if (prev) setCurrentLesson(prev); }}
                    disabled={!getPreviousLesson()}
                    className="flex items-center gap-2 px-6 py-3 border border-cream/20 text-cream/60 text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 hover:text-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    onClick={() => { const next = getNextLesson(); if (next) setCurrentLesson(next); }}
                    disabled={!getNextLesson()}
                    className="flex items-center gap-2 px-6 py-3 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-xs text-cream/30 tracking-widest uppercase">No lessons available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
};
