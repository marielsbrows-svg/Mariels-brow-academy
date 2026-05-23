import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, Download, Menu, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AssignmentSubmission } from './AssignmentSubmission';
import { SlideViewer } from './SlideViewer';
import { AIAssistant } from './AIAssistant';

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
    if (courseId && user) {
      fetchCourseContent();
    }
  }, [courseId, user]);

  useEffect(() => {
    // Reset slides completion when changing lessons
    setSlidesCompleted(false);
  }, [currentLesson?.id]);

  const fetchCourseContent = async () => {
    try {
      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single();

      setCourse(courseData);

      // Fetch modules with lessons
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesData) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index');

            // Fetch progress for each lesson
            const lessonsWithProgress = await Promise.all(
              (lessonsData || []).map(async (lesson) => {
                const { data: progressData } = await supabase
                  .from('lesson_progress')
                  .select('completed, last_position_seconds')
                  .eq('user_id', user?.id)
                  .eq('lesson_id', lesson.id)
                  .single();

                const { data: resourcesData } = await supabase
                  .from('lesson_resources')
                  .select('*')
                  .eq('lesson_id', lesson.id);

                return {
                  ...lesson,
                  progress: progressData || { completed: false, last_position_seconds: 0 },
                  resources: resourcesData || [],
                };
              })
            );

            return {
              ...module,
              lessons: lessonsWithProgress,
            };
          })
        );

        setModules(modulesWithLessons);

        // Set first lesson as current
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

      // Update local state
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
        // Next lesson in same module
        if (lessonIndex < modules[i].lessons.length - 1) {
          return modules[i].lessons[lessonIndex + 1];
        }
        // First lesson of next module
        if (i < modules.length - 1 && modules[i + 1].lessons.length > 0) {
          return modules[i + 1].lessons[0];
        }
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;

    for (let i = 0; i < modules.length; i++) {
      const lessonIndex = modules[i].lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex !== -1) {
        // Previous lesson in same module
        if (lessonIndex > 0) {
          return modules[i].lessons[lessonIndex - 1];
        }
        // Last lesson of previous module
        if (i > 0 && modules[i - 1].lessons.length > 0) {
          return modules[i - 1].lessons[modules[i - 1].lessons.length - 1];
        }
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-white pt-20">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 360 : 0 }}
          className="bg-charcoal border-r border-mocha/20 overflow-hidden"
        >
          <div className="w-[360px] h-screen overflow-y-auto pb-20">
            <div className="p-6 border-b border-mocha/20">
              <Link
                to="/dashboard"
                className="text-mocha hover:text-mocha-dark transition-colors text-sm mb-4 block"
              >
                ← Back to Dashboard
              </Link>
              <h2 className="font-serif text-2xl text-white">{course?.title}</h2>
            </div>

            <div className="p-4">
              {modules.map((module) => (
                <div key={module.id} className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-mocha-dark mb-3 px-2">
                    {module.title}
                  </h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-mocha text-white'
                            : 'hover:bg-mocha/10 text-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {lesson.progress?.completed ? (
                            <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-mocha/30 rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{lesson.title}</div>
                            {lesson.duration && (
                              <div className="text-xs text-white/50">
                                {lesson.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="sticky top-20 z-10 bg-charcoal border-b border-mocha/20 px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-mocha/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-medium flex-1">{currentLesson?.title}</h1>
          </div>

          <div className="p-6">
            {currentLesson ? (
              <>
                {/* Lesson Description - Shows First */}
                <div className="bg-white text-charcoal rounded-2xl p-8 mb-8">
                  <h2 className="font-serif text-3xl mb-4">{currentLesson.title}</h2>

                  <p className="text-mocha-dark leading-relaxed mb-6">
                    {currentLesson.description}
                  </p>

                  {/* Progress Indicator */}
                  {currentLesson.resources?.some(r => r.resource_type === 'slides') && !slidesCompleted && (
                    <div className="p-3 bg-mocha/10 border border-mocha/20 rounded-lg">
                      <p className="text-sm text-mocha-dark">
                        📊 Review the slides below, then continue to the video lesson
                      </p>
                    </div>
                  )}

                  {!currentLesson.video_url && !currentLesson.resources?.some(r => r.resource_type === 'slides') && (
                    <div className="p-3 bg-mocha/10 border border-mocha/20 rounded-lg">
                      <p className="text-sm text-mocha-dark">
                        📄 This lesson consists of downloadable materials. Review the resources below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Slides Viewer - Shows After Description */}
                {currentLesson.resources && currentLesson.resources.some(r => r.resource_type === 'slides') && !slidesCompleted && (
                  <div className="mb-8">
                    <SlideViewer
                      slideUrl={currentLesson.resources.find(r => r.resource_type === 'slides')!.file_url}
                      totalSlides={10}
                      onComplete={() => setSlidesCompleted(true)}
                    />
                  </div>
                )}

                {/* Downloadable Workbooks & Resources (shows right after slides) */}
                {currentLesson.resources && currentLesson.resources.filter(r => r.resource_type !== 'slides').length > 0 && !slidesCompleted && (
                  <div className="bg-white text-charcoal rounded-2xl p-8 mb-8">
                    <h3 className="font-serif text-2xl mb-4">📚 Workbooks & Resources</h3>
                    <p className="text-mocha-dark mb-6">
                      Download these materials to complete this lesson
                    </p>
                    <div className="space-y-3">
                      {currentLesson.resources
                        .filter(r => r.resource_type !== 'slides')
                        .map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center gap-4 p-5 bg-cream rounded-xl hover:bg-linen transition-all group"
                          >
                            <div className="w-14 h-14 bg-mocha/10 rounded-xl flex items-center justify-center group-hover:bg-mocha transition-all">
                              <Download className="w-7 h-7 text-mocha group-hover:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg text-charcoal">
                                {resource.title}
                              </div>
                              <div className="text-sm text-mocha-dark capitalize mt-1">
                                {resource.resource_type === 'workbook' ? '📝 Workbook' : '📄 Resource'}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-mocha">
                              Download →
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {/* Video Player - Shows After Slides */}
                {currentLesson.video_url && (slidesCompleted || !currentLesson.resources?.some(r => r.resource_type === 'slides')) && (
                  <div className="mb-8">
                    <h3 className="text-white text-xl mb-4 flex items-center gap-2">
                      📹 Video Lesson
                    </h3>
                    <div className="bg-black rounded-2xl overflow-hidden aspect-video">
                      <video
                        src={currentLesson.video_url}
                        controls
                        className="w-full h-full"
                        onEnded={() => markLessonComplete(currentLesson.id)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}

                {/* Community Link */}
                <div className="bg-white text-charcoal rounded-2xl p-8 mb-8">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-mocha" />
                    <h3 className="font-serif text-2xl text-charcoal mb-3">
                      Join the Discussion
                    </h3>
                    <p className="text-mocha-dark mb-6">
                      Connect with fellow students, ask questions, and share insights
                    </p>
                    <Link
                      to={`/community/${courseId}`}
                      className="inline-block px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors"
                    >
                      Go to Community
                    </Link>
                  </div>
                </div>

                {/* Mark as Complete */}
                {!currentLesson.progress?.completed && (
                  <div className="bg-white text-charcoal rounded-2xl p-8 mb-8 text-center">
                    <h4 className="font-serif text-xl text-charcoal mb-4">
                      Finished this lesson?
                    </h4>
                    <button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      className="px-8 py-4 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors flex items-center gap-2 mx-auto text-lg"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Mark as Complete
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      const prev = getPreviousLesson();
                      if (prev) setCurrentLesson(prev);
                    }}
                    disabled={!getPreviousLesson()}
                    className="px-6 py-3 bg-white text-charcoal rounded-full hover:bg-linen transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous Lesson
                  </button>

                  <button
                    onClick={() => {
                      const next = getNextLesson();
                      if (next) setCurrentLesson(next);
                    }}
                    disabled={!getNextLesson()}
                    className="px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next Lesson
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-white/50">
                <p>No lessons available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};
