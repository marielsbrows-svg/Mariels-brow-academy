import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

interface SlideViewerProps {
  slideUrl: string;
  lessonId: string;
  totalSlides?: number;
  onComplete?: () => void;
}

export const SlideViewer = ({ slideUrl, lessonId, totalSlides = 1, onComplete }: SlideViewerProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalPages, setTotalPages] = useState(totalSlides);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Load PDF.js and the PDF document
  useEffect(() => {
    const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    const WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const loadPDF = async (pdfjsLib: any) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      const doc = await pdfjsLib.getDocument(slideUrl).promise;
      pdfDocRef.current = doc;
      setTotalPages(doc.numPages);
      setCurrentSlide(1);
    };

    if ((window as any).pdfjsLib) {
      loadPDF((window as any).pdfjsLib);
    } else {
      const existing = document.getElementById('pdfjs-script');
      if (existing) {
        existing.addEventListener('load', () => loadPDF((window as any).pdfjsLib));
      } else {
        const script = document.createElement('script');
        script.id = 'pdfjs-script';
        script.src = PDFJS_SRC;
        script.onload = () => loadPDF((window as any).pdfjsLib);
        document.head.appendChild(script);
      }
    }
  }, [slideUrl]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDocRef.current) return;

    const renderPage = async (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
      }
      const page = await pdfDocRef.current.getPage(currentSlide);
      const scale = canvas.parentElement ? canvas.parentElement.clientWidth / page.getViewport({ scale: 1 }).width : 1;
      const viewport = page.getViewport({ scale: Math.max(scale, 0.5) * 1.5 });
canvas.style.width = '100%';
canvas.style.height = 'auto';
      const ctx = canvas.getContext('2d')!;
      renderTaskRef.current = page.render({ canvasContext: ctx, viewport });
      try { await renderTaskRef.current.promise; } catch {}
    };

    const target = isFullscreen ? fullCanvasRef.current : canvasRef.current;
    // Use setTimeout to ensure canvas is in the DOM
    const timer = setTimeout(() => renderPage(target), 100);
    return () => clearTimeout(timer);
  }, [currentSlide, totalPages, isFullscreen]);

  // Load audio for current slide
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); setAudioProgress(0); }
    setAudioUrl(null);
    supabase.from('slide_audio').select('audio_url')
      .eq('lesson_id', lessonId)
      .eq('slide_number', currentSlide)
      .single()
      .then(({ data }) => { if (data?.audio_url) setAudioUrl(data.audio_url); });
  }, [currentSlide, lessonId]);

  const goNext = () => {
    if (currentSlide < totalPages) setCurrentSlide(n => n + 1);
    else onComplete?.();
  };

  const goPrev = () => { if (currentSlide > 1) setCurrentSlide(n => n - 1); };

  const Dots = () => (
    <div className="flex gap-1.5">
      {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
        <button key={i} onClick={() => setCurrentSlide(i + 1)}
          className={`h-1.5 rounded-full transition-all ${currentSlide === i + 1 ? 'bg-cream w-4' : 'bg-cream/20 w-1.5'}`} />
      ))}
      {totalPages > 10 && <span className="text-cream/30 text-xs">+{totalPages - 10}</span>}
    </div>
  );

  const AudioPlayer = () => audioUrl ? (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => {
          if (!audioRef.current) return;
          if (playing) { audioRef.current.pause(); setPlaying(false); }
          else { audioRef.current.play(); setPlaying(true); }
        }} className="w-9 h-9 bg-white text-charcoal rounded-full flex items-center justify-center hover:bg-cream flex-shrink-0">
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>
        <div className="flex-1 h-1 bg-white/20 cursor-pointer" onClick={e => {
          if (!audioRef.current || !audioDuration) return;
          const r = e.currentTarget.getBoundingClientRect();
          audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * audioDuration;
        }}>
          <div className="h-full bg-white" style={{ width: `${audioProgress}%` }} />
        </div>
        <button onClick={() => { if (audioRef.current) { audioRef.current.muted = !muted; setMuted(m => !m); } }}
          className="text-white/50 hover:text-white flex-shrink-0">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  ) : (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
      <div className="flex items-center gap-2 opacity-30">
        <Volume2 className="w-3 h-3 text-white" />
        <span className="text-[0.5rem] text-white tracking-wide">No voiceover for this slide</span>
      </div>
    </div>
  );

  return (
    <>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl}
          onTimeUpdate={() => { if (audioRef.current) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0); }}
          onLoadedMetadata={() => { if (audioRef.current) setAudioDuration(audioRef.current.duration); }}
          onEnded={() => setPlaying(false)} />
      )}

      {/* Normal view */}
      {!isFullscreen && (
        <div className="border border-white/08 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-charcoal border-b border-white/08">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-cream/20" />
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
            </div>
            <button onClick={() => setIsFullscreen(true)} className="p-1.5 text-cream/30 hover:text-cream">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas */}
          <div className="relative bg-white w-full">
            <canvas ref={canvasRef} className="w-full block" />
            <div className="absolute top-2 right-2 bg-black/50 px-2 py-1">
              <span className="text-[0.5rem] text-white/70 tracking-widest">{currentSlide} / {totalPages}</span>
            </div>
            <AudioPlayer />
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between px-6 py-4 bg-charcoal border-t border-white/08">
            <button onClick={goPrev} disabled={currentSlide === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 disabled:opacity-20 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <Dots />
            <button onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen">
              {currentSlide < totalPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/08 flex-shrink-0">
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
              <button onClick={() => setIsFullscreen(false)} className="p-2 text-cream/40 hover:text-cream">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl">
                <canvas ref={fullCanvasRef} className="w-full block" />
                <AudioPlayer />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/08 flex-shrink-0">
              <button onClick={goPrev} disabled={currentSlide === 1}
                className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 disabled:opacity-20 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <Dots />
              <button onClick={goNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen">
                {currentSlide < totalPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
