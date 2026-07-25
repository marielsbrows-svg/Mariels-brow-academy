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
  const [numPages, setNumPages] = useState(totalSlides);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Get page count from PDF using PDF.js
  useEffect(() => {
    setLoaded(false);
    setCurrentSlide(1);
    const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';
    const load = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      lib.getDocument(slideUrl).promise.then((pdf: any) => {
        setNumPages(pdf.numPages);
        setLoaded(true);
      }).catch(() => setLoaded(true));
    };
    if ((window as any).pdfjsLib) {
      load();
    } else {
      const script = document.createElement('script');
      script.src = `${PDFJS_CDN}/pdf.min.js`;
      script.onload = load;
      document.head.appendChild(script);
    }
  }, [slideUrl]);

  // Fetch audio per slide
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

  const iframeSrc = `${slideUrl}#page=${currentSlide}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  const SlideFrame = ({ height = '500px' }: { height?: string }) => (
    <div className="relative w-full bg-white overflow-hidden" style={{ height }}>
      <iframe
        key={`${slideUrl}-${currentSlide}`}
        src={iframeSrc}
        className="w-full h-full border-0"
        title={`Slide ${currentSlide}`}
      />
      {/* Slide counter */}
      <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 pointer-events-none">
        <span className="text-[0.52rem] tracking-[0.15em] uppercase text-white/80">{currentSlide} / {numPages}</span>
      </div>
      {/* Audio bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        {audioUrl ? (
          <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => {
              if (!audioRef.current) return;
              if (playing) { audioRef.current.pause(); setPlaying(false); }
              else { audioRef.current.play(); setPlaying(true); }
            }} className="w-9 h-9 bg-white text-charcoal flex items-center justify-center hover:bg-cream transition-colors flex-shrink-0 rounded-full shadow-lg">
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <div className="flex-1 pointer-events-auto cursor-pointer" onClick={e => {
              if (!audioRef.current || !audioDuration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
            }}>
              <div className="h-1 bg-white/20"><div className="h-full bg-white transition-all" style={{ width: `${audioProgress}%` }} /></div>
            </div>
            <button onClick={() => { if (!audioRef.current) return; audioRef.current.muted = !muted; setMuted(!muted); }}
              className="text-white/50 hover:text-white transition-colors flex-shrink-0 pointer-events-auto">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-30 pointer-events-none">
            <Volume2 className="w-3.5 h-3.5 text-white" />
            <span className="text-[0.52rem] text-white tracking-wide">No voiceover for this slide</span>
          </div>
        )}
      </div>
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
            <button onClick={() => setIsFullscreen(true)} className="p-1.5 text-cream/30 hover:text-cream transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <SlideFrame height="520px" />
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
            <div className="flex-1 overflow-hidden">
              <SlideFrame height="100%" />
            </div>
            <NavBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
