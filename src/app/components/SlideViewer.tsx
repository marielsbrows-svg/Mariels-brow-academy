import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SlideViewerProps {
  slideUrl: string;
  totalSlides?: number;
  onComplete?: () => void;
}

export const SlideViewer = ({ slideUrl, totalSlides, onComplete }: SlideViewerProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [numPages, setNumPages] = useState(totalSlides || 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF.js from CDN
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
    return () => {
      document.head.removeChild(script);
    };
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
      console.error('Error loading PDF:', err);
      setError(true);
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdfRef.current || !canvas) return;

    // Cancel any existing render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

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
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  };

  useEffect(() => {
    if (!loading && pdfRef.current) {
      renderPage(currentSlide, isFullscreen ? fullCanvasRef.current : canvasRef.current);
    }
  }, [currentSlide, loading, isFullscreen]);

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

      {/* Canvas renders the PDF page */}
      <canvas
        ref={canvasReference}
        className="w-full h-auto block"
        style={{ display: loading || error ? 'none' : 'block' }}
      />

      {/* Slide counter */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5">
          <span className="text-[0.55rem] tracking-[0.15em] uppercase text-cream/50">
            {currentSlide} / {numPages}
          </span>
        </div>
      )}
    </div>
  );

  const Navigation = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={`flex items-center justify-between px-6 py-4 bg-charcoal border-t border-white/08 ${fullscreen ? 'absolute bottom-0 left-0 right-0' : ''}`}>
      <button
        onClick={handlePrevious}
        disabled={currentSlide === 1}
        className="flex items-center gap-2 px-5 py-2.5 border border-cream/20 text-cream text-[0.58rem] tracking-[0.15em] uppercase hover:border-cream/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Previous
      </button>

      {/* Slide dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: Math.min(numPages, 10) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i + 1)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              currentSlide === i + 1 ? 'bg-cream w-4' : 'bg-cream/20'
            }`}
          />
        ))}
        {numPages > 10 && (
          <span className="text-cream/30 text-xs">+{numPages - 10}</span>
        )}
      </div>

      <button
        onClick={handleNext}
        className="flex items-center gap-2 px-5 py-2.5 bg-cream text-charcoal text-[0.58rem] tracking-[0.15em] uppercase hover:bg-linen transition-all"
      >
        {currentSlide < numPages ? (
          <>Next <ChevronRight className="w-3.5 h-3.5" /></>
        ) : (
          <>Continue <ChevronRight className="w-3.5 h-3.5" /></>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Regular View */}
      {!isFullscreen && (
        <div className="overflow-hidden border border-white/08">
          <div className="flex items-center justify-between px-6 py-3 bg-charcoal border-b border-white/08">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-cream/20" />
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-cream/30 hover:text-cream transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <SlideContent canvasReference={canvasRef} />
          <Navigation />
        </div>
      )}

      {/* Fullscreen View */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/08 flex-shrink-0">
              <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30">Course Slides</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-cream/40 hover:text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fullscreen Slide */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-8">
              <div className="w-full max-w-5xl">
                <SlideContent canvasReference={fullCanvasRef} />
              </div>
            </div>

            <Navigation fullscreen />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
