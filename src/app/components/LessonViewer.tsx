import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SlideViewer } from './SlideViewer';
import { QuizComponent } from './QuizComponent';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface ContentItem { n?: string; t: string; d: string; note?: string }
interface ContentSection {
  k?: string; t?: string; s?: string; p?: string;
  items?: ContentItem[]; list?: string[];
  table?: { head: string[]; rows: string[][] };
  callout?: string; outro?: string; quote?: string;
}
interface LessonContent { tagline?: string; sections: ContentSection[] }

interface Resource { id: string; title: string; file_url: string; file_type: string | null; resource_type: string }
interface Lesson {
  id: string; module_id: string; title: string; description: string;
  video_url: string | null; duration: number | null; order_index: number;
  content?: LessonContent | null;
  resources?: Resource[];
  progress?: { completed: boolean; last_position_seconds: number };
}
interface Module { id: string; title: string; order_index: number; lessons: Lesson[] }
interface Course { id: string; title: string; language?: string }

// ─────────────────────────────────────────────────────────────
// Styles: same look as the free class (paper, ink, Horizon + Anonymous Pro)
// ─────────────────────────────────────────────────────────────
const CSS = `
.mba-course{--ink:#191a1e;--paper:#f5f4f1;--card:#fff;--panel:#eae7e1;--line:#dedbd6;--line2:#cfcac2;--muted:#847f76;--soft:#5f5b55;--ease:cubic-bezier(.2,.8,.2,1);
  --display:'Horizon','Arial Black',Arial,sans-serif;--mono:'Anonymous Pro','Courier New',monospace;
  background:var(--paper);color:var(--ink);font-family:var(--mono);min-height:100vh;padding-top:77px;-webkit-font-smoothing:antialiased;}
.mba-course *{box-sizing:border-box;}
.mba-course button{font-family:inherit;}
.mba-course h1,.mba-course h2,.mba-course h3,.mba-course h4,.mba-course p,.mba-course label{font-family:var(--mono);}
.mba-course .quizwrap *{font-family:var(--mono)!important;}
.mba-course .quizwrap h3{text-transform:none!important;letter-spacing:0!important;font-weight:700!important;font-size:18px!important;line-height:1.45!important;}
.mba-course .quizwrap > div{border:1px solid var(--line)!important;border-left:3px solid var(--ink)!important;}
.mba-course .disp{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:0;line-height:1.08;}
.mba-course .kick{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
.mba-course a:focus-visible,.mba-course button:focus-visible{outline:2px solid var(--ink);outline-offset:3px;}

.mba-course .wrap{display:flex;align-items:flex-start;}

/* sidebar */
.mba-course .side{position:sticky;top:77px;width:340px;flex-shrink:0;height:calc(100vh - 77px);overflow-y:auto;border-right:1px solid var(--line);background:var(--paper);}
.mba-course .side-head{padding:22px 22px 20px;border-bottom:1px solid var(--line);}
.mba-course .back{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-decoration:none;}
.mba-course .back:hover{color:var(--ink);}
.mba-course .side-title{font-size:17px;margin:16px 0 0;}
.mba-course .bar{height:3px;background:var(--line);margin-top:16px;}
.mba-course .bar i{display:block;height:100%;background:var(--ink);transition:width .6s var(--ease);}
.mba-course .bar-label{margin-top:8px;font-size:11px;letter-spacing:.1em;color:var(--muted);}
.mba-course .mod{border-bottom:1px solid var(--line);}
.mba-course .mod-btn{width:100%;display:grid;grid-template-columns:1fr auto 18px;gap:10px;align-items:center;padding:16px 22px;background:none;border:0;text-align:left;cursor:pointer;color:var(--ink);}
.mba-course .mod-btn:hover{background:var(--panel);}
.mba-course .mod-num{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
.mba-course .mod-name{display:block;font-family:var(--display);text-transform:uppercase;font-size:13px;line-height:1.2;}
.mba-course .mod-count{font-size:11px;color:var(--muted);}
.mba-course .chev{width:18px;height:18px;transition:transform .25s var(--ease);}
.mba-course .mod.open .chev{transform:rotate(180deg);}
.mba-course .les{list-style:none;margin:0;padding:0 0 10px;}
.mba-course .les-btn{width:100%;display:grid;grid-template-columns:20px 1fr;gap:12px;align-items:start;padding:11px 22px 11px 19px;background:none;border:0;border-left:3px solid transparent;text-align:left;cursor:pointer;color:var(--soft);}
.mba-course .les-btn:hover{background:var(--panel);color:var(--ink);}
.mba-course .les-btn.cur{background:var(--card);border-left-color:var(--ink);color:var(--ink);}
.mba-course .les-t{display:block;font-size:13px;line-height:1.4;}
.mba-course .les-btn.cur .les-t{font-weight:700;}
.mba-course .les-d{display:block;margin-top:3px;font-size:11px;color:var(--muted);}
.mba-course .dot{width:16px;height:16px;margin-top:1px;border:1px solid var(--line2);border-radius:50%;display:grid;place-items:center;background:var(--card);}
.mba-course .dot.done{background:var(--ink);border-color:var(--ink);color:#fff;font-size:10px;}

/* main */
.mba-course .main{flex:1;min-width:0;}
.mba-course .page{max-width:900px;margin:0 auto;padding:40px clamp(16px,4vw,48px) 60px;}
.mba-course .crumb{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;}
.mba-course .l-title{font-size:clamp(26px,3.4vw,42px);margin:14px 0 0;}
.mba-course .tagline{margin:14px 0 0;font-size:16px;line-height:1.6;color:var(--soft);}
.mba-course .desc{margin:12px 0 0;font-size:14px;line-height:1.75;color:var(--muted);max-width:62ch;}
.mba-course .meta{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:22px;padding-top:20px;border-top:1px solid var(--line);}
.mba-course .meta span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}

.mba-course .listen{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line2);background:var(--card);color:var(--ink);font:700 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;}
.mba-course .listen:hover,.mba-course .listen.on{background:var(--ink);border-color:var(--ink);color:#fff;}

.mba-course .sec{margin-top:22px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--ink);padding:clamp(22px,3.4vw,36px);}
.mba-course .sec-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.mba-course .sec-t{font-size:clamp(20px,2.3vw,28px);margin:14px 0 0;}
.mba-course .sec-s{display:block;color:var(--muted);font-size:.72em;margin-top:6px;}
.mba-course .sec-p{margin:16px 0 0;font-size:15px;line-height:1.75;color:#3d3a36;max-width:66ch;}
.mba-course .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:22px;}
.mba-course .card{background:#f9f8f4;border:1px solid var(--line);padding:18px 18px 20px;}
.mba-course .card h4{margin:0;font-size:15px;line-height:1.35;font-weight:700;}
.mba-course .card p{margin:8px 0 0;font-size:13.5px;line-height:1.7;color:var(--soft);}
.mba-course .rows{margin-top:22px;border-top:1px solid var(--line);}
.mba-course .row{display:grid;grid-template-columns:72px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid var(--line);}
.mba-course .row-n{font-family:var(--display);font-size:20px;line-height:1;color:var(--muted);padding-top:2px;}
.mba-course .row-n.small{font-family:var(--mono);font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding-top:4px;}
.mba-course .row h4{margin:0;font-size:15px;line-height:1.35;font-weight:700;}
.mba-course .row p{margin:6px 0 0;font-size:14px;line-height:1.7;color:var(--soft);}
.mba-course .note{display:block;margin-top:8px;font-size:12.5px;line-height:1.6;color:var(--muted);}
.mba-course .checks{list-style:none;margin:20px 0 0;padding:0;}
.mba-course .checks li{display:flex;gap:12px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.6;}
.mba-course .checks li::before{content:'◉';font-size:12px;}
.mba-course .tbl{margin-top:22px;overflow-x:auto;}
.mba-course table{width:100%;min-width:520px;border-collapse:collapse;font-size:13.5px;}
.mba-course th{text-align:left;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:400;padding:0 12px 10px 0;border-bottom:1px solid var(--ink);}
.mba-course td{padding:12px 12px 12px 0;border-bottom:1px solid var(--line);color:var(--soft);}
.mba-course td:first-child{color:var(--ink);font-weight:700;}
.mba-course .callout{margin-top:22px;background:var(--ink);color:#fff;padding:14px 18px;font-size:14px;line-height:1.6;}
.mba-course .outro{margin:20px 0 0;font-size:14.5px;line-height:1.75;color:#3d3a36;max-width:66ch;}

.mba-course .quote{margin-top:22px;background:var(--ink);color:#fff;padding:clamp(28px,5vw,56px);}
.mba-course .quote p{margin:0;font-family:var(--display);text-transform:uppercase;font-size:clamp(18px,2.4vw,28px);line-height:1.25;}
.mba-course .quote .by{display:block;margin-top:20px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#bdb7ad;}
.mba-course .quote .listen{background:transparent;color:#fff;border-color:rgba(255,255,255,.35);margin-top:20px;}
.mba-course .quote .listen:hover,.mba-course .quote .listen.on{background:#fff;color:var(--ink);}

.mba-course .blk{margin-top:36px;}
.mba-course .blk-h{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.mba-course .video{aspect-ratio:16/9;background:#000;}
.mba-course .video iframe,.mba-course .video video{width:100%;height:100%;border:0;display:block;}
.mba-course .files a{display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--card);border:1px solid var(--line);margin-top:8px;color:var(--ink);text-decoration:none;}
.mba-course .files a:hover{border-color:var(--ink);}
.mba-course .files b{flex:1;font-size:14px;}
.mba-course .files span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}

.mba-course .next{margin-top:36px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;background:var(--panel);border:1px solid var(--line);padding:clamp(20px,3vw,30px);}
.mba-course .next h4{margin:8px 0 0;font-size:clamp(16px,1.8vw,20px);}
.mba-course .next p{margin:8px 0 0;font-size:13.5px;line-height:1.65;color:var(--soft);}
.mba-course .btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:50px;padding:14px 20px;background:var(--ink);color:#fff;border:1px solid var(--ink);border-radius:2px;font:700 12px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-decoration:none;white-space:nowrap;}
.mba-course .btn:hover{filter:brightness(1.25);}
.mba-course .btn.ghost{background:var(--card);color:var(--ink);border-color:var(--line2);}
.mba-course .btn.ghost:hover{border-color:var(--ink);filter:none;}
.mba-course .btn:disabled{opacity:.35;cursor:default;}
.mba-course .done-row{margin-top:36px;text-align:center;background:var(--card);border:1px solid var(--line);padding:28px 20px;}
.mba-course .done-row h4{margin:0 0 16px;font-size:18px;}
.mba-course .pn{display:flex;justify-content:space-between;gap:16px;margin-top:36px;padding-top:22px;border-top:1px solid var(--line2);}
.mba-course .pn button{background:none;border:0;padding:0;cursor:pointer;color:var(--ink);text-align:left;max-width:46%;}
.mba-course .pn button:last-child{text-align:right;}
.mba-course .pn button:disabled{opacity:.3;cursor:default;}
.mba-course .pn small{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.mba-course .pn b{display:block;margin-top:6px;font-size:14px;line-height:1.4;}

.mba-course .celebrate{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(245,244,241,.86);pointer-events:none;animation:mbaFade .3s ease both;}
.mba-course .celebrate div{background:var(--ink);color:#fff;padding:22px 30px;font-family:var(--display);text-transform:uppercase;font-size:22px;animation:mbaPop .5s var(--ease) both;}
@keyframes mbaFade{from{opacity:0}to{opacity:1}}
@keyframes mbaPop{0%{transform:scale(.8);opacity:0}100%{transform:none;opacity:1}}
@keyframes mbaUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.mba-course .page>*{animation:mbaUp .6s var(--ease) both;}

/* mobile */
.mba-course .mtop,.mba-course .mbar,.mba-course .sheet,.mba-course .shade{display:none;}
@media (max-width:1023px){
  .mba-course{padding-top:63px;}
  .mba-course .side{display:none;}
  .mba-course .mtop{display:block;position:sticky;top:63px;z-index:20;background:var(--paper);border-bottom:1px solid var(--line);}
  .mba-course .mtop-row{display:flex;align-items:center;gap:12px;padding:12px 16px;}
  .mba-course .mtop-row b{flex:1;min-width:0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .mba-course .mtop-row span{font-size:11px;color:var(--muted);}
  .mba-course .mtop .bar{margin:0;}
  .mba-course .page{padding:26px 16px 120px;}
  .mba-course .grid{grid-template-columns:1fr;}
  .mba-course .row{grid-template-columns:52px 1fr;}
  .mba-course .next{grid-template-columns:1fr;}
  .mba-course .next .btn{width:100%;}
  .mba-course .pn{display:none;}
  .mba-course .mbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:30;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));background:var(--paper);border-top:1px solid var(--line);}
  .mba-course .mbar button{height:48px;border:1px solid var(--line2);background:var(--card);color:var(--ink);font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}
  .mba-course .mbar .sq{width:52px;flex-shrink:0;font-size:18px;}
  .mba-course .mbar .mid{flex:1;}
  .mba-course .mbar .go{background:var(--ink);color:#fff;border-color:var(--ink);}
  .mba-course .mbar button:disabled{opacity:.3;}
  .mba-course .shade{display:block;position:fixed;inset:0;z-index:40;background:rgba(25,26,30,.35);opacity:0;pointer-events:none;transition:opacity .25s;}
  .mba-course .shade.show{opacity:1;pointer-events:auto;}
  .mba-course .sheet{display:flex;flex-direction:column;position:fixed;left:0;right:0;bottom:0;z-index:50;max-height:80vh;background:var(--paper);border-top:1px solid var(--line2);transform:translateY(102%);transition:transform .3s var(--ease);padding-bottom:env(safe-area-inset-bottom,0px);}
  .mba-course .sheet.show{transform:none;}
  .mba-course .sheet-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line);}
  .mba-course .sheet-h b{font-family:var(--display);text-transform:uppercase;font-size:15px;}
  .mba-course .sheet-h button{background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:var(--ink);}
  .mba-course .sheet-b{overflow-y:auto;}
}
@media (prefers-reduced-motion:reduce){.mba-course *{animation:none!important;transition:none!important;}}
`;

// ─────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────
const PracticeEmbed = ({ src, title }: { src: string; title: string }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === 'mba-practice-height' && typeof e.data.height === 'number') {
        setHeight(Math.max(420, Math.ceil(e.data.height)));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const url = src + (src.includes('?') ? '&' : '?') + 'embed=1';
  return <iframe ref={frameRef} src={url} title={title} style={{ width: '100%', height, border: 0, display: 'block', background: '#fff' }} />;
};

const Chevron = () => (
  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
);

const videoEmbed = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.split('youtu.be/')[1]?.split(/[?&]/)[0] || url.split('v=')[1]?.split('&')[0] || url.split('/embed/')[1]?.split(/[?&]/)[0];
    return <iframe src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Lesson video" />;
  }
  if (url.includes('vimeo.com')) {
    return <iframe src={url.replace('vimeo.com/', 'player.vimeo.com/video/')} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Lesson video" />;
  }
  return <video src={url} controls playsInline />;
};

// "Module 2 — The Clean Map" → { num: "Module 02", name: "The Clean Map" }
const splitModule = (title: string) => {
  const m = title.match(/^(M[oó]dulo?|Module)\s*(\d+)\s*[—–\-:·]\s*(.+)$/i);
  if (!m) return { num: '', name: title };
  return { num: `${m[1]} ${m[2].padStart(2, '0')}`, name: m[3] };
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export const LessonViewer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [openMods, setOpenMods] = useState<Record<string, boolean>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audioMap, setAudioMap] = useState<Record<number, string>>({});
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { if (courseId && user) fetchCourseContent(); }, [courseId, user]);

  const fetchCourseContent = async () => {
    try {
      const { data: courseData } = await supabase.from('courses').select('id, title, language').eq('id', courseId).single();
      setCourse(courseData);
      const { data: modulesData } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
      if (modulesData) {
        const withLessons = await Promise.all(modulesData.map(async (module: any) => {
          const { data: lessonsData } = await supabase.from('lessons').select('*').eq('module_id', module.id).order('order_index', { ascending: true });
          const lessons = await Promise.all((lessonsData || []).map(async (lesson: any) => {
            const { data: progressData } = await supabase.from('lesson_progress').select('completed, last_position_seconds').eq('user_id', user?.id).eq('lesson_id', lesson.id).maybeSingle();
            const { data: resourcesData } = await supabase.from('lesson_resources').select('*').eq('lesson_id', lesson.id);
            return { ...lesson, progress: progressData || { completed: false, last_position_seconds: 0 }, resources: resourcesData || [] };
          }));
          return { ...module, lessons };
        }));
        setModules(withLessons);
        const all = withLessons.flatMap((m: Module) => m.lessons);
        const wanted = new URLSearchParams(window.location.search).get('lesson');
        const firstOpen = all.find((l: Lesson) => l.id === wanted) || all.find((l: Lesson) => !l.progress?.completed) || all[0];
        if (firstOpen) setCurrentLesson(firstOpen);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  // when the lesson changes: open its module, load its voiceovers, scroll to top, update the link
  useEffect(() => {
    if (!currentLesson) return;
    setOpenMods((o) => ({ ...o, [currentLesson.module_id]: true }));
    audioRef.current?.pause(); setPlaying(null); setAudioMap({});
    supabase.from('slide_audio').select('slide_number, audio_url').eq('lesson_id', currentLesson.id)
      .then(({ data }: any) => {
        const map: Record<number, string> = {};
        (data || []).forEach((r: any) => { if (r.audio_url) map[r.slide_number] = r.audio_url; });
        setAudioMap(map);
      });
    window.scrollTo({ top: 0 });
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('lesson', currentLesson.id);
      window.history.replaceState(null, '', u.toString());
    } catch { /* ignore */ }
  }, [currentLesson?.id]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const toggleAudio = (slide: number) => {
    const src = audioMap[slide];
    if (!src) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlaying(null);
    }
    const a = audioRef.current;
    if (playing === slide) { a.pause(); setPlaying(null); return; }
    a.src = src; a.currentTime = 0;
    a.play().then(() => setPlaying(slide)).catch(() => setPlaying(null));
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;
    try {
      await supabase.from('lesson_progress').upsert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() });
      setModules((prev) => prev.map((m) => ({ ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, progress: { ...l.progress!, completed: true } } : l) })));
      setCurrentLesson((c) => c && c.id === lessonId ? { ...c, progress: { ...c.progress!, completed: true } } : c);
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1500);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const idx = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  const total = allLessons.length;
  const doneCount = allLessons.filter((l) => l.progress?.completed).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const isES = (course?.language || '').toUpperCase() === 'ES';
  const go = (l: Lesson | null) => { if (l) { setCurrentLesson(l); setSheetOpen(false); } };

  const handleQuizPass = async (lessonId: string) => {
    await markLessonComplete(lessonId);
    setTimeout(() => go(nextLesson), 2500);
  };

  const L = isES ? {
    back: 'Panel', complete: 'completado', lesson: 'Lección', of: 'de', listen: 'Escuchar', pause: 'Pausa', intro: 'Escuchar la introducción',
    watch: 'Mira la demostración', practice: 'Práctica', materials: 'Materiales', open: 'Abrir', upNext: 'Siguiente lección', start: 'Empezar',
    finished: '¿Terminaste esta lección?', mark: 'Marcar como completada', prev: 'Anterior', next: 'Siguiente', lessons: 'Lecciones',
    celebrate: '¡Completada!', none: 'No hay lecciones disponibles', min: 'min', sections: 'secciones', courseDone: 'Terminaste el curso', dashboard: 'Ir al panel', quiz: 'Prueba',
  } : {
    back: 'Dashboard', complete: 'complete', lesson: 'Lesson', of: 'of', listen: 'Listen', pause: 'Pause', intro: 'Listen to the intro',
    watch: 'Watch the demo', practice: 'Practice', materials: 'Materials', open: 'Open', upNext: 'Up next', start: 'Start',
    finished: 'Finished this lesson?', mark: 'Mark as complete', prev: 'Previous', next: 'Next', lessons: 'Lessons',
    celebrate: 'Complete!', none: 'No lessons available', min: 'min', sections: 'sections', courseDone: 'You’ve reached the end of the course', dashboard: 'Go to dashboard', quiz: 'Quiz',
  };

  if (loading) {
    return (
      <div className="mba-course" style={{ display: 'grid', placeItems: 'center' }}>
        <style>{CSS}</style>
        <span className="kick">…</span>
      </div>
    );
  }

  const ListenBtn = ({ slide, label }: { slide: number; label?: string }) =>
    audioMap[slide] ? (
      <button type="button" className={`listen${playing === slide ? ' on' : ''}`} onClick={() => toggleAudio(slide)} aria-pressed={playing === slide}>
        {playing === slide ? `❚❚ ${L.pause}` : `▶ ${label || L.listen}`}
      </button>
    ) : null;

  const LessonList = () => (
    <nav aria-label={L.lessons}>
      {modules.map((m) => {
        const { num, name } = splitModule(m.title);
        const open = !!openMods[m.id];
        const done = m.lessons.filter((l) => l.progress?.completed).length;
        return (
          <div key={m.id} className={`mod${open ? ' open' : ''}`}>
            <button type="button" className="mod-btn" aria-expanded={open} onClick={() => setOpenMods((o) => ({ ...o, [m.id]: !open }))}>
              <span>
                {num && <span className="mod-num">{num}</span>}
                <span className="mod-name">{name}</span>
              </span>
              <span className="mod-count">{done}/{m.lessons.length}</span>
              <Chevron />
            </button>
            {open && (
              <ul className="les">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <button type="button" className={`les-btn${currentLesson?.id === l.id ? ' cur' : ''}`} onClick={() => go(l)} aria-current={currentLesson?.id === l.id ? 'page' : undefined}>
                      <span className={`dot${l.progress?.completed ? ' done' : ''}`}>{l.progress?.completed ? '✓' : ''}</span>
                      <span>
                        <span className="les-t">{l.title.trim()}</span>
                        {l.duration ? <span className="les-d">{l.duration} {L.min}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  const Section = ({ s, slide }: { s: ContentSection; slide: number }) => {
    if (s.quote) {
      return (
        <section className="quote">
          <p>{s.quote}</p>
          <span className="by">— Mariel</span>
          <ListenBtn slide={slide} />
        </section>
      );
    }
    const numbered = (s.items || []).some((i) => i.n);
    return (
      <section className="sec">
        <div className="sec-top">
          <span className="kick">{s.k}</span>
          <ListenBtn slide={slide} />
        </div>
        {s.t && <h3 className="disp sec-t">{s.t}{s.s && <span className="sec-s">{s.s}</span>}</h3>}
        {s.p && <p className="sec-p">{s.p}</p>}
        {s.items && s.items.length > 0 && (numbered ? (
          <div className="rows">
            {s.items.map((it, i) => (
              <div className="row" key={i}>
                <span className={`row-n${it.n && it.n.length > 5 ? ' small' : ''}`}>{it.n}</span>
                <div>
                  {it.t && <h4>{it.t}</h4>}
                  <p>{it.d}</p>
                  {it.note && <span className="note">{it.note}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid">
            {s.items.map((it, i) => (
              <div className="card" key={i}>
                <h4>{it.t}</h4>
                <p>{it.d}</p>
                {it.note && <span className="note">{it.note}</span>}
              </div>
            ))}
          </div>
        ))}
        {s.list && <ul className="checks">{s.list.map((x, i) => <li key={i}>{x}</li>)}</ul>}
        {s.table && (
          <div className="tbl">
            <table>
              <thead><tr>{s.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{s.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        {s.callout && <div className="callout">{s.callout}</div>}
        {s.outro && <p className="outro">{s.outro}</p>}
      </section>
    );
  };

  const cur = currentLesson;
  const curModule = modules.find((m) => m.id === cur?.module_id);
  const modInfo = curModule ? splitModule(curModule.title) : { num: '', name: '' };
  const content = cur?.content && Array.isArray(cur.content.sections) ? cur.content : null;
  const extraFiles = (cur?.resources || []).filter((r) => !['slides', 'audio', 'practice'].includes(r.resource_type));

  return (
    <div className="mba-course">
      <style>{CSS}</style>
      {justCompleted && <div className="celebrate" aria-live="polite"><div>{L.celebrate}</div></div>}

      {/* phone & small tablet: lesson bar */}
      <div className="mtop">
        <div className="mtop-row">
          <Link to="/dashboard" className="back" aria-label={L.back}>←</Link>
          <b>{cur?.title}</b>
          <span>{idx + 1} / {total}</span>
        </div>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="wrap">
        <aside className="side">
          <div className="side-head">
            <Link to="/dashboard" className="back">← {L.back}</Link>
            <h2 className="disp side-title">{course?.title}</h2>
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
            <div className="bar-label">{pct}% {L.complete} · {doneCount}/{total}</div>
          </div>
          <LessonList />
        </aside>

        <main className="main">
          {cur ? (
            <div className="page" key={cur.id}>
              <header>
                <div className="crumb">
                  <span className="kick">{modInfo.num ? `${modInfo.num} · ${modInfo.name}` : modInfo.name}</span>
                  <span className="kick">{L.lesson} {String(idx + 1).padStart(2, '0')} {L.of} {total}</span>
                </div>
                <h1 className="disp l-title">{cur.title.trim()}</h1>
                {content?.tagline && <p className="tagline">{content.tagline}</p>}
                {cur.description && <p className="desc">{cur.description}</p>}
                <div className="meta">
                  {cur.duration ? <span>{cur.duration} {L.min}</span> : null}
                  {content && <span>{content.sections.filter((s) => !s.quote).length} {L.sections}</span>}
                  {cur.video_url && <span>▶ {L.watch}</span>}
                  <ListenBtn slide={1} label={L.intro} />
                </div>
              </header>

              {content
                ? content.sections.map((s, i) => <Section key={i} s={s} slide={i + 2} />)
                : <div className="blk"><SlideViewer lessonId={cur.id} onComplete={() => {}} /></div>}

              {cur.video_url && (
                <div className="blk">
                  <div className="blk-h"><span className="kick">{L.watch}</span></div>
                  <div className="video">{videoEmbed(cur.video_url)}</div>
                </div>
              )}

              {(cur.resources || []).filter((r) => r.resource_type === 'practice').map((p) => (
                <div className="blk" key={p.id}>
                  <div className="blk-h"><span className="kick">{L.practice} · {p.title}</span></div>
                  <PracticeEmbed src={p.file_url} title={p.title} />
                </div>
              ))}

              {(cur.resources || []).filter((r) => r.resource_type === 'audio').map((a) => (
                <div className="blk" key={a.id}><audio src={a.file_url} controls style={{ width: '100%' }} /></div>
              ))}

              {extraFiles.length > 0 && (
                <div className="blk files">
                  <div className="blk-h"><span className="kick">{L.materials}</span></div>
                  {extraFiles.map((r) => (
                    <a key={r.id} href={r.file_url} target="_blank" rel="noopener noreferrer">
                      <b>{r.title}</b><span>{L.open} ↗</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="blk quizwrap">
                <QuizComponent key={cur.id} lessonId={cur.id} lang={isES ? 'ES' : 'EN'} onPass={() => handleQuizPass(cur.id)} />
              </div>

              {!cur.progress?.completed && (
                <div className="done-row">
                  <h4 className="disp">{L.finished}</h4>
                  <button type="button" className="btn" onClick={() => markLessonComplete(cur.id)}>✓ {L.mark}</button>
                </div>
              )}

              {nextLesson ? (
                <div className="next">
                  <div>
                    <span className="kick">{L.upNext} · {L.lesson} {String(idx + 2).padStart(2, '0')}</span>
                    <h4 className="disp">{nextLesson.title.trim()}</h4>
                    {nextLesson.content?.tagline && <p>{nextLesson.content.tagline}</p>}
                  </div>
                  <button type="button" className="btn" onClick={() => go(nextLesson)}>{L.start} →</button>
                </div>
              ) : (
                <div className="next">
                  <div><span className="kick">{course?.title}</span><h4 className="disp">{L.courseDone}</h4></div>
                  <Link to="/dashboard" className="btn">{L.dashboard} →</Link>
                </div>
              )}

              <div className="pn">
                <button type="button" onClick={() => go(prevLesson)} disabled={!prevLesson}>
                  <small>← {L.prev}</small><b>{prevLesson?.title.trim() || ''}</b>
                </button>
                <button type="button" onClick={() => go(nextLesson)} disabled={!nextLesson}>
                  <small>{L.next} →</small><b>{nextLesson?.title.trim() || ''}</b>
                </button>
              </div>
            </div>
          ) : (
            <div className="page"><p className="kick">{L.none}</p></div>
          )}
        </main>
      </div>

      {/* phone & small tablet: bottom bar + lessons sheet */}
      <div className="mbar">
        <button type="button" className="sq" onClick={() => go(prevLesson)} disabled={!prevLesson} aria-label={L.prev}>←</button>
        <button type="button" className="mid" onClick={() => setSheetOpen(true)}>☰ {L.lessons}</button>
        <button type="button" className="sq go" onClick={() => go(nextLesson)} disabled={!nextLesson} aria-label={L.next}>→</button>
      </div>
      <div className={`shade${sheetOpen ? ' show' : ''}`} onClick={() => setSheetOpen(false)} />
      <div className={`sheet${sheetOpen ? ' show' : ''}`} role="dialog" aria-label={L.lessons}>
        <div className="sheet-h"><b>{L.lessons}</b><button type="button" onClick={() => setSheetOpen(false)} aria-label="Close">×</button></div>
        <div className="sheet-b"><LessonList /></div>
      </div>
    </div>
  );
};
