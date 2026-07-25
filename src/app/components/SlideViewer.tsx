import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause, Volume2, VolumeX, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

interface SlideViewerProps {
  slideUrl: string;
  lessonId: string;
  totalSlides?: number;
  onComplete?: () => void;
}

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

export const SlideViewer = ({ slideUrl, lessonId, onComplete }: SlideViewerProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Load PDF.js and PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCurrentSlide(1);

    const initAndLoad = async (pdfjsLib: any) => {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument(slideUrl).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    };

    if ((window as any).pdfjsLib) {
      initAndLoad((window as any).pdfjsLib);
    } else {
      const s = document.createElement('script');
      s.src = `${PDFJS}/pdf.min.js`;
      s.onload = () => initAndLoad((window as any).pdfjsLib);
      document.head.appendChild(s);
    }
    return () => { cancelled = true; };
  }, [slideUrl]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current || !containerRef.current) return;
    if (isRenderingRef.current) {
      if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch {} }
    }
    isRenderingRef.current = true;
    try {
      const page = await pdfRef.current.getPage(pageNum);
      const containerWidth = containerRef.current.clientWidth || 600;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth / unscaledViewport.width) * 2;
      const viewport = page.getViewport({ scale });
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      renderTaskRef.current = page.render({ canvasContext: ctx, viewport });
      await renderTaskRef.current.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    } finally {
      isRenderingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!loading && pdfRef.current) {
      // Wait for container to be measured
      requestAnimationFrame(() => {
        requestAnimationFrame(() => renderPage(currentSlide));
      });
    }
  }, [currentSlide, loading, renderPage]);

  // Reset audio on slide change
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); setAudioProgress(0); }
    setAudioUrl(null);
    supabase.from('slide_audio').select('audio_url')
      .eq('lesson_id', lessonId).eq('slide_number', currentSlide).single()
      .then(({ data }) => { if (data) setAudioUrl(data.audio_url); });
  }, [currentSlide, lessonId]);

  const handleNext = () => {
    if (currentSlide < numPages) setCurrentSlide(p => p + 1);
    else if (onComplete) onComplete();
  };

  const AudioBar = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      {audioUrl ? (
        <div className="flex items-center gap-3">
          <button onClick={() => {
            if (!audioRef.current) return;
            if (playing) { audioRef.current.pause(); setPlaying(false); }
            else { audioRef.current.play(); setPlaying(true); }
          }} className="w-9 h-9 bg-white text-charcoal flex items-center justify-center hover:bg-cream transition-colors flex-shrink-0 rounded-full shadow-lg">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <div className="flex-1 cursor-pointer" onClick={e => {
            if (!audioRef.current || !audioDuration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
          }}>
            <div className="h-1 bg-white/20"><div className="h-full bg-white" style={{ width: `${audioProgress}%` }} /></div>
          </div>
          <button onClick={() => { if (!audioRef.current) return; audioRef.current.muted = !muted; setMuted(!muted); }}
            className="text-white/50 hover:text-white transition-colors flex-shrink-0">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 opacity-30">
          <Volume2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[0.52rem] text-white tracking-wide">No voiceover for this slide</span>
        </div>
      )}
    </div>
  );

  const NavBar = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-charcoal border-t border-white/08">
      <button onClick={() => currentSlide > 1 && setCurrentSlide(p => p - 1)} disabled={currentSlide === 1}
        className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
        <ChevronLeft className="w-3.5 h-3.5" /> Previous
      </button>
      <div className="flex gap-1.5">
        {Array.from({ length: Math.min(numPages, 10) }).map((_, i) => (
          <button key={i} onClick={() => setCurrentSlide(i + 1)}
            className={`h-1.5 rounded-full transition-all ${currentSlide === i + 1 ? 'bg-cream w-4' : 'bg-cream/20 w-1.5'}`} />
        ))}
        {numPages > 10 && <span className="text-cream/30 text-xs ml-1">+{numPages - 10}</span>}
      </div>
      <button onClick={handleNext}
        className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all">
        {currentSlide < numPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
      </button>
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

      {!isFullscreen && (
        <div className="overflow-hidden border border-white/08">
          <div className="flex items-center justify-between px-6 py-3 bg-charcoal border-b border-white/08">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-cream/20" />
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
            </div>
            <button onClick={() => setIsFullscreen(true)} className="p-1.5 text-cream/30 hover:text-cream">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div ref={containerRef} className="relative bg-white w-full min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-7 h-7 text-cream/40 animate-spin" />
                  <span className="text-[0.6rem] tracking-widest uppercase text-cream/30">Loading slides...</span>
                </div>
              </div>
            ) : (
              <>
                <canvas ref={canvasRef} className="w-full block" />
                <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1">
                  <span className="text-[0.52rem] tracking-[0.15em] uppercase text-white/80">{currentSlide} / {numPages}</span>
                </div>
                <AudioBar />
              </>
            )}
          </div>
          <NavBar />
        </div>
      )}

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
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <div className="w-full max-w-4xl relative">
                <canvas ref={canvasRef} className="w-full block" />
                <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1">
                  <span className="text-[0.52rem] tracking-[0.15em] uppercase text-white/80">{currentSlide} / {numPages}</span>
                </div>
                <AudioBar />
              </div>
            </div>
            <NavBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
