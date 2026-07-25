import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Loader, Play, Pause, Volume2, VolumeX, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SlideViewerProps {
  slideUrl: string;
  lessonId: string;
  totalSlides?: number;
  onComplete?: () => void;
  adminMode?: boolean;
}

export const SlideViewer = ({ slideUrl, lessonId, totalSlides, onComplete, adminMode = false }: SlideViewerProps) => {
  const { isAdmin } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [numPages, setNumPages] = useState(totalSlides || 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      loadPDF(pdfjsLib);
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [slideUrl]);

  const loadPDF = async (pdfjsLib: any) => {
    try {
      setLoading(true);
      const pdf = await pdfjsLib.getDocument(slideUrl).promise;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setCurrentSlide(1);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdfRef.current || !canvas) return;
    if (renderTaskRef.current) renderTaskRef.current.cancel();
    try {
      const page = await pdfRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = { canvasContext: context, viewport };
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') console.error('Error rendering page:', err);
    }
  };

  useEffect(() => {
    if (!loading && pdfRef.current) {
      renderPage(currentSlide, isFullscreen ? fullCanvasRef.current : canvasRef.current);
    }
  }, [currentSlide, loading, isFullscreen]);

  // Load audio for current slide
  useEffect(() => {
    fetchSlideAudio(currentSlide);
    // Stop playing when slide changes
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      setAudioProgress(0);
    }
    setUploadSuccess(false);
  }, [currentSlide, lessonId]);

  const fetchSlideAudio = async (slideNum: number) => {
    setAudioLoading(true);
    setAudioUrl(null);
    try {
      const { data } = await supabase
        .from('slide_audio')
        .select('audio_url')
        .eq('lesson_id', lessonId)
        .eq('slide_number', slideNum)
        .single();
      if (data) setAudioUrl(data.audio_url);
    } catch {
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleUploadAudio = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `slide-audio/${lessonId}/slide-${currentSlide}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('course-materials').getPublicUrl(fileName);
      await supabase.from('slide_audio').upsert({
        lesson_id: lessonId,
        slide_number: currentSlide,
        audio_url: data.publicUrl,
      });
      setAudioUrl(data.publicUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading audio:', err);
      alert('Error uploading audio. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleNext = () => {
    if (currentSlide < numPages) {
      setCurrentSlide(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) setCurrentSlide(prev => prev - 1);
  };

  const SlideContent = ({ canvasReference }: { canvasReference: React.RefObject<HTMLCanvasElement> }) => (
    <div className="relative bg-charcoal" style={{ minHeight: '400px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-cream/40 animate-spin" />
            <span className="text-[0.6rem] tracking-widest uppercase text-cream/30">Loading slides...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <p className="text-cream/40 text-sm">Unable to load slides. Please try again.</p>
        </div>
      )}
      <canvas ref={canvasReference} className="w-full h-auto block" style={{ display: loading || error ? 'none' : 'block' }} />

      {/* Slide counter */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5">
          <span className="text-[0.55rem] tracking-[0.15em] uppercase text-cream/50">
            {currentSlide} / {numPages}
          </span>
        </div>
      )}

      {/* Audio Player Overlay on slide */}
      {!loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/90 to-transparent p-4">
          {audioUrl ? (
            <div className="flex items-center gap-3">
              {/* Play/Pause button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-cream text-charcoal flex items-center justify-center hover:bg-linen transition-colors flex-shrink-0 rounded-full shadow-lg"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Progress bar */}
              <div className="flex-1">
                <div
                  className="h-1 bg-white/20 cursor-pointer"
                  onClick={(e) => {
                    if (!audioRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
                  }}
                >
                  <div className="h-full bg-cream transition-all" style={{ width: `${audioProgress}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[0.5rem] text-cream/40">
                    {Math.floor((audioRef.current?.currentTime || 0) / 60)}:{String(Math.floor((audioRef.current?.currentTime || 0) % 60)).padStart(2, '0')}
                  </span>
                  <span className="text-[0.5rem] text-cream/40">
                    {Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Mute */}
              <button onClick={() => { if (audioRef.current) { audioRef.current.muted = !muted; setMuted(!muted); } }} className="text-cream/50 hover:text-cream transition-colors">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          ) : audioLoading ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 text-cream/30 animate-spin" />
              <span className="text-[0.55rem] text-cream/30 tracking-wide">Loading audio...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cream/20" />
              <span className="text-[0.55rem] text-cream/20 tracking-wide">No voiceover for this slide</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Upload Button */}
      {(isAdmin || adminMode) && !loading && !error && (
        <div className="absolute top-4 left-4">
          <label className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-[0.55rem] tracking-wide uppercase transition-all ${
            uploadSuccess ? 'bg-mocha text-cream' : 'bg-charcoal/80 text-cream/60 hover:text-cream hover:bg-charcoal'
          }`}>
            {uploading ? (
              <><Loader className="w-3 h-3 animate-spin" /> Uploading...</>
            ) : uploadSuccess ? (
              <>✓ Uploaded!</>
            ) : (
              <><Upload className="w-3 h-3" /> {audioUrl ? 'Replace Audio' : 'Upload Audio'}</>
            )}
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              className="hidden"
              onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadAudio(file); }}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }}
          onLoadedMetadata={() => { if (audioRef.current) setAudioDuration(audioRef.current.duration); }}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Regular View */}
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
          <SlideContent canvasReference={canvasRef} />

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 bg-charcoal border-t border-white/08">
            <button onClick={handlePrevious} disabled={currentSlide === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(numPages, 10) }).map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i + 1)}
                  className={`h-1.5 rounded-full transition-all ${currentSlide === i + 1 ? 'bg-cream w-4' : 'bg-cream/20 w-1.5'}`} />
              ))}
              {numPages > 10 && <span className="text-cream/30 text-xs">+{numPages - 10}</span>}
            </div>
            <button onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all">
              {currentSlide < numPages ? <>Next <ChevronRight className="w-3.5 h-3.5" /></> : <>Continue <ChevronRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen View */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/08 flex-shrink-0">
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
              <button onClick={() => setIsFullscreen(false)} className="p-2 text-cream/40 hover:text-cream transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center p-8">
              <div className="w-full max-w-5xl">
                <SlideContent canvasReference={fullCanvasRef} />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/08 flex-shrink-0">
              <button onClick={handlePrevious} disabled={currentSlide === 1}
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
