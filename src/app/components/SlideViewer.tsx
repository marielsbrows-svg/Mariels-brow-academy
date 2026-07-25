import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Loader, Play, Pause, Volume2, VolumeX, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SlideViewerProps {
  slideUrl: string;
  lessonId: string;
  totalSlides?: number;
  onComplete?: () => void;
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

export const SlideViewer = ({ slideUrl, lessonId, onComplete }: SlideViewerProps) => {
  const { isAdmin } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const renderingRef = useRef(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const getPdfJs = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = `${PDFJS_CDN}/pdf.min.js`;
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        resolve(lib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setCurrentSlide(1);

    getPdfJs()
      .then(async (pdfjsLib) => {
        if (cancelled) return;
        try {
          const pdf = await pdfjsLib.getDocument({ url: slideUrl, cMapUrl: `${PDFJS_CDN}/cmaps/`, cMapPacked: true }).promise;
          if (cancelled) return;
          pdfRef.current = pdf;
          setNumPages(pdf.numPages);
          setLoading(false);
        } catch (err) {
          console.error('PDF load error:', err);
          if (!cancelled) setError(true);
          if (!cancelled) setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slideUrl]);

  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdfRef.current || !canvas || renderingRef.current) return;
    renderingRef.current = true;
    try {
      const page = await pdfRef.current.getPage(pageNum);
      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale * window.devicePixelRatio });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerWidth * (viewport.height / viewport.width)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') console.error('Render error:', err);
    } finally {
      renderingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!loading && pdfRef.current) {
      const canvas = isFullscreen ? fullCanvasRef.current : canvasRef.current;
      renderPage(currentSlide, canvas);
    }
  }, [currentSlide, loading, isFullscreen, renderPage]);

  // Audio per slide
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); setAudioProgress(0); }
    setAudioUrl(null);
    setUploadSuccess(false);
    supabase.from('slide_audio').select('audio_url').eq('lesson_id', lessonId).eq('slide_number', currentSlide).single()
      .then(({ data }) => { if (data) setAudioUrl(data.audio_url); });
  }, [currentSlide, lessonId]);

  const handleUploadAudio = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `slide-audio/${lessonId}/slide-${currentSlide}.${ext}`;
      await supabase.storage.from('course-materials').upload(path, file, { upsert: true });
      const { data } = supabase.storage.from('course-materials').getPublicUrl(path);
      await supabase.from('slide_audio').upsert({ lesson_id: lessonId, slide_number: currentSlide, audio_url: data.publicUrl });
      setAudioUrl(data.publicUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) { alert('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const handleNext = () => {
    if (currentSlide < numPages) setCurrentSlide(p => p + 1);
    else if (onComplete) onComplete();
  };

  const SlideCanvas = ({ ref: canvasReference }: { ref: React.RefObject<HTMLCanvasElement> }) => (
    <div className="relative w-full bg-white" style={{ minHeight: 300 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-7 h-7 text-cream/40 animate-spin" />
            <span className="text-[0.6rem] tracking-widest uppercase text-cream/30">Loading slides...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <p className="text-cream/40 text-sm">Unable to load slides.</p>
        </div>
      )}
      <canvas ref={canvasReference} className="w-full block" style={{ display: loading || error ? 'none' : 'block' }} />

      {/* Slide counter */}
      {!loading && !error && (
        <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1">
          <span className="text-[0.52rem] tracking-[0.15em] uppercase text-white/70">{currentSlide} / {numPages}</span>
        </div>
      )}

      {/* Admin upload button */}
      {isAdmin && !loading && !error && (
        <div className="absolute top-3 left-3">
          <label className={`flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer text-[0.52rem] tracking-wide uppercase transition-all ${
            uploadSuccess ? 'bg-mocha text-cream' : 'bg-black/60 text-white/60 hover:text-white'
          }`}>
            {uploading ? <><Loader className="w-3 h-3 animate-spin" /> Uploading...</>
              : uploadSuccess ? <>✓ Saved!</>
              : <><Upload className="w-3 h-3" /> {audioUrl ? 'Replace Audio' : 'Upload Audio'} (Slide {currentSlide})</>}
            <input type="file" accept="audio/*,.mp3,.m4a,.wav" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadAudio(f); }} disabled={uploading} />
          </label>
        </div>
      )}

      {/* Audio player at bottom of slide */}
      {!loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {audioUrl ? (
            <div className="flex items-center gap-3">
              <button onClick={() => {
                if (!audioRef.current) return;
                if (playing) { audioRef.current.pause(); setPlaying(false); }
                else { audioRef.current.play(); setPlaying(true); }
              }} className="w-9 h-9 bg-white text-charcoal flex items-center justify-center hover:bg-cream transition-colors flex-shrink-0 rounded-full">
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <div className="flex-1 cursor-pointer" onClick={e => {
                if (!audioRef.current || !audioDuration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
              }}>
                <div className="h-1 bg-white/20 relative">
                  <div className="h-full bg-white transition-all" style={{ width: `${audioProgress}%` }} />
                </div>
              </div>
              <button onClick={() => {
                if (!audioRef.current) return;
                audioRef.current.muted = !muted; setMuted(!muted);
              }} className="text-white/50 hover:text-white transition-colors flex-shrink-0">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 opacity-40">
              <Volume2 className="w-3.5 h-3.5 text-white" />
              <span className="text-[0.52rem] text-white tracking-wide">No voiceover for this slide</span>
            </div>
          )}
        </div>
      )}
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
            <button onClick={() => setIsFullscreen(true)} className="p-1.5 text-cream/30 hover:text-cream transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <SlideCanvas ref={canvasRef} />

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
            </div>
            <button onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all">
              {currentSlide < numPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
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
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <div className="w-full max-w-5xl">
                <SlideCanvas ref={fullCanvasRef} />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/08 flex-shrink-0">
              <button onClick={() => currentSlide > 1 && setCurrentSlide(p => p - 1)} disabled={currentSlide === 1}
                className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(numPages, 10) }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i + 1)}
                    className={`h-1.5 rounded-full transition-all ${currentSlide === i + 1 ? 'bg-cream w-4' : 'bg-cream/20 w-1.5'}`} />
                ))}
              </div>
              <button onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all">
                {currentSlide < numPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
