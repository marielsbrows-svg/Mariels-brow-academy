import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, Download, Menu, MessageSquare, ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SlideViewer } from './SlideViewer';
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

const DISP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-lesson{font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;}
.mba-lesson .disp{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.02em;line-height:0.98;}
`;

// ── Audio Player Component ──────────────────────────────────────────────────
const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black border border-white/10 p-5">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => { if (audioRef.current) { setCurrentTime(audioRef.current.currentTime); setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); } }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-4 h-px bg-white/20" />
        <span className="text-[0.55rem] tracking-[0.2em] uppercase text-white/30">Lesson Voiceover</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors flex-shrink-0">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="h-1 bg-white/10 cursor-pointer relative" onClick={handleSeek}>
            <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[0.52rem] text-white/30">{formatTime(currentTime)}</span>
            <span className="text-[0.52rem] text-white/30">{formatTime(duration)}</span>
          </div>
        </div>
        <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-[0.55rem] text-white/20 tracking-wide mt-3">
        Play the voiceover while clicking through the slides above
      </p>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
export const LessonViewer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleQuizPass = async (lessonId: string) => {
    await markLessonComplete(lessonId);
    setTimeout(() => {
      const next = getNextLesson();
      if (next) setCurrentLesson(next);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="mba-lesson min-h-screen bg-black flex items-center justify-center">
        <style>{DISP_CSS}</style>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const allLessons = modules.flatMap((m) => m.lessons);
  const total = allLessons.length;
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const completedCount = allLessons.filter((l) => l.progress?.completed).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  const LessonList = ({ onPick }: { onPick?: () => void }) => (
    <div className="p-4">
      {modules.map((module) => (
        <div key={module.id} className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-3 h-px bg-white/20" />
            <h3 className="text-[0.52rem] tracking-[0.2em] uppercase text-white/30">{module.title}</h3>
          </div>
          <div className="space-y-0.5">
            {module.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => { setCurrentLesson(lesson); onPick?.(); }}
                className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                  currentLesson?.id === lesson.id
                    ? 'bg-white/10 border-l-2 border-white'
                    : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {lesson.progress?.completed
                    ? <CheckCircle className="w-4 h-4 text-white/60" />
                    : <div className="w-4 h-4 border border-white/20 rounded-full" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 truncate leading-relaxed">{lesson.title}</div>
                  {lesson.duration && (
                    <div className="text-[0.52rem] tracking-wide text-white/30 mt-0.5">{lesson.duration} min</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mba-lesson min-h-screen bg-black text-white pt-20">
      <style>{DISP_CSS}</style>

      {/* MOBILE top bar + progress */}
      <div className="lg:hidden sticky top-20 z-20 bg-black border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="text-white/40"><ArrowLeft className="w-4 h-4" /></Link>
          <span className="flex-1 text-sm text-white/80 truncate">{currentLesson?.title}</span>
          <span className="text-[0.6rem] tracking-[0.15em] text-white/40">{total ? currentIndex + 1 : 0} / {total}</span>
        </div>
        <div className="h-[3px] bg-white/10">
          <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex lg:h-[calc(100vh-80px)]">

        {/* DESKTOP / iPad SIDEBAR */}
        <aside className="hidden lg:block w-[320px] flex-shrink-0 bg-black border-r border-white/10 overflow-y-auto">
          <div className="p-6 border-b border-white/10">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-[0.58rem] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors mb-5">
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <h2 className="disp text-xl text-white leading-tight">{course?.title}</h2>
            <div className="mt-4 h-[3px] bg-white/10">
              <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-[0.55rem] tracking-[0.15em] uppercase text-white/30">{pct}% complete</div>
          </div>
          <LessonList />
        </aside>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-4xl mx-auto space-y-6 pb-28 lg:pb-10">
            {currentLesson ? (
              <>
                {/* Lesson Info */}
                <div className="bg-white text-black p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-px bg-neutral-400" />
                    <span className="text-[0.55rem] tracking-[0.2em] uppercase text-neutral-500">Current Lesson</span>
                  </div>
                  <h2 className="disp text-2xl lg:text-3xl text-black mb-4">{currentLesson.title}</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{currentLesson.description}</p>
                </div>

                {/* 1 — Slides */}
                <SlideViewer
                  lessonId={currentLesson.id}
                  onComplete={() => setSlidesCompleted(true)}
                />

                {/* Voiceover (audio, if separate) */}
                {currentLesson.resources?.some(r => r.resource_type === 'audio') && (
                  <AudioPlayer
                    src={currentLesson.resources.find(r => r.resource_type === 'audio')!.file_url}
                  />
                )}

                {/* 2 — Video */}
                {currentLesson.video_url && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-px bg-white/20" />
                      <span className="text-[0.55rem] tracking-[0.2em] uppercase text-white/30">Watch the Demo</span>
                    </div>
                    <div className="aspect-video bg-black overflow-hidden">
                      {currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                        <iframe
                          src={currentLesson.video_url
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/')
                            .replace('youtube.com/embed/', 'youtube.com/embed/')
                            + '?rel=0&modestbranding=1'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : currentLesson.video_url.includes('vimeo.com') ? (
                        <iframe
                          src={currentLesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={currentLesson.video_url} controls className="w-full h-full" />
                      )}
                    </div>
                  </div>
                )}

                {/* Downloads & links */}
                {currentLesson.resources && currentLesson.resources.filter(r => !['slides', 'audio'].includes(r.resource_type)).length > 0 && (
                  <div className="bg-white text-black p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-4 h-px bg-neutral-400" />
                      <span className="text-[0.55rem] tracking-[0.2em] uppercase text-neutral-500">Materials</span>
                    </div>
                    <div className="space-y-2">
                      {currentLesson.resources.filter(r => !['slides', 'audio'].includes(r.resource_type)).map((resource) => (
                        <a key={resource.id} href={resource.file_url} target="_blank" rel="noopener noreferrer" download
                          className="flex items-center gap-4 p-4 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100 transition-all group">
                          <div className="w-9 h-9 border border-neutral-300 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                            <Download className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-black">{resource.title}</div>
                            <div className="text-[0.55rem] tracking-wide text-neutral-400 uppercase mt-0.5">
                              {resource.resource_type === 'workbook' ? 'Workbook' : 'Resource'}
                            </div>
                          </div>
                          <span className="text-[0.58rem] tracking-[0.15em] uppercase text-neutral-400">Open</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3 — Quiz */}
                <QuizComponent
                  key={currentLesson.id}
                  lessonId={currentLesson.id}
                  onPass={() => handleQuizPass(currentLesson.id)}
                />

                {/* Community */}
                <div className="bg-white text-black p-6 lg:p-8 text-center">
                  <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="disp text-2xl text-black mb-2">Join the Discussion</h3>
                  <p className="text-xs text-neutral-500 tracking-wide mb-6">Connect with fellow students and share insights</p>
                  <Link to={`/community/${courseId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[0.58rem] tracking-[0.15em] uppercase hover:opacity-80 transition-all">
                    Go to Community
                  </Link>
                </div>

                {/* Mark Complete */}
                {!currentLesson.progress?.completed && (
                  <div className="bg-white text-black p-6 lg:p-8 text-center">
                    <h4 className="disp text-xl text-black mb-5">Finished this lesson?</h4>
                    <button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[0.6rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark as Complete
                    </button>
                  </div>
                )}

                {/* DESKTOP prev / next */}
                <div className="hidden lg:flex justify-between items-center pt-4 border-t border-white/10">
                  <button
                    onClick={() => { const prev = getPreviousLesson(); if (prev) setCurrentLesson(prev); }}
                    disabled={!getPreviousLesson()}
                    className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white/60 text-[0.58rem] tracking-[0.15em] uppercase hover:border-white/40 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    onClick={() => { const next = getNextLesson(); if (next) setCurrentLesson(next); }}
                    disabled={!getNextLesson()}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[0.58rem] tracking-[0.15em] uppercase hover:bg-neutral-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-xs text-white/30 tracking-widest uppercase">No lessons available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE bottom nav: Prev · Lessons · Next */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-black border-t border-white/10 px-3 py-3 flex items-center gap-2" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => { const prev = getPreviousLesson(); if (prev) setCurrentLesson(prev); }}
          disabled={!getPreviousLesson()}
          aria-label="Previous lesson"
          className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/[0.06] flex items-center justify-center disabled:opacity-25"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-1 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center gap-2 text-white text-xs tracking-[0.05em]"
        >
          <Menu className="w-4 h-4" /> Lessons
        </button>
        <button
          onClick={() => { const next = getNextLesson(); if (next) setCurrentLesson(next); }}
          disabled={!getNextLesson()}
          aria-label="Next lesson"
          className="w-12 h-12 flex-shrink-0 rounded-xl bg-white flex items-center justify-center disabled:opacity-25"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* MOBILE lessons sheet */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/60" />
      )}
      <div className={`lg:hidden fixed left-0 right-0 bottom-0 z-40 max-h-[78vh] bg-[#141414] rounded-t-2xl flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="pt-3 pb-1 flex justify-center"><span className="w-10 h-1 rounded-full bg-white/25" /></div>
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/10">
          <span className="text-sm text-white font-medium tracking-wide">Lessons</span>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close" className="text-white/50">
            <ChevronLeft className="w-4 h-4 rotate-90" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          <LessonList onPick={() => setSidebarOpen(false)} />
        </div>
      </div>

    </div>
  );
};
