import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SlideViewerProps {
  slideUrl: string;
  totalSlides?: number;
  onComplete?: () => void;
}

export const SlideViewer = ({ slideUrl, totalSlides = 1, onComplete }: SlideViewerProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const SlideCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
      {/* PDF Viewer with Navigation Inside */}
      <div className="aspect-[4/3] bg-gray-100 relative group" style={{ minHeight: '600px' }}>
        <iframe
          src={`${slideUrl}#page=${currentSlide}&toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full"
          title={`Slide ${currentSlide}`}
        />

        {/* Slide Counter - Top Right */}
        <div className="absolute top-4 right-4 bg-charcoal/90 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="text-xs text-white/70">Slide</div>
          <div className="text-lg font-medium">
            {currentSlide} / {totalSlides}
          </div>
        </div>

        {/* Navigation Buttons - Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/90 via-charcoal/70 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 1}
              className="flex items-center gap-2 px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors shadow-lg backdrop-blur-sm"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors shadow-lg"
            >
              {currentSlide < totalSlides ? (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue to Video
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Regular View */}
      {!isFullscreen && <SlideCard />}

      {/* Fullscreen View */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal flex items-center justify-center p-6"
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-w-7xl">
              <SlideCard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
