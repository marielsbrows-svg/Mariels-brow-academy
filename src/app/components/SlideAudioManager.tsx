import { useState, useEffect, useCallback } from 'react';
import { Upload, CheckCircle, Loader, Trash2, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SlideAudio {
  slide_number: number;
  audio_url: string | null;
}

interface SlideAudioManagerProps {
  lessonId: string;
  slideUrl: string;
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

export const SlideAudioManager = ({ lessonId, slideUrl }: SlideAudioManagerProps) => {
  const [numSlides, setNumSlides] = useState(0);
  const [slideAudio, setSlideAudio] = useState<SlideAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const getPdfJs = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) { resolve((window as any).pdfjsLib); return; }
      const script = document.createElement('script');
      script.src = `${PDFJS_CDN}/pdf.min.js`;
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        resolve((window as any).pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Get page count from PDF
        const pdfjsLib = await getPdfJs();
        const pdf = await pdfjsLib.getDocument({ url: slideUrl }).promise;
        const pages = pdf.numPages;
        setNumSlides(pages);

        // Fetch existing audio
        const { data } = await supabase.from('slide_audio').select('slide_number, audio_url').eq('lesson_id', lessonId);
        const audioMap = data || [];
        const slides: SlideAudio[] = Array.from({ length: pages }, (_, i) => ({
          slide_number: i + 1,
          audio_url: audioMap.find(a => a.slide_number === i + 1)?.audio_url || null,
        }));
        setSlideAudio(slides);
      } catch (err) {
        console.error('Error loading slides:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [lessonId, slideUrl]);

  const handleUpload = async (slideNum: number, file: File) => {
    setUploading(slideNum);
    try {
      const ext = file.name.split('.').pop();
      const path = `slide-audio/${lessonId}/slide-${slideNum}.${ext}`;
      await supabase.storage.from('course-materials').upload(path, file, { upsert: true });
      const { data } = supabase.storage.from('course-materials').getPublicUrl(path);
      await supabase.from('slide_audio').upsert({ lesson_id: lessonId, slide_number: slideNum, audio_url: data.publicUrl });
      setSlideAudio(prev => prev.map(s => s.slide_number === slideNum ? { ...s, audio_url: data.publicUrl } : s));
      setSuccess(slideNum);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (slideNum: number) => {
    if (!confirm(`Delete audio for slide ${slideNum}?`)) return;
    await supabase.from('slide_audio').delete().eq('lesson_id', lessonId).eq('slide_number', slideNum);
    setSlideAudio(prev => prev.map(s => s.slide_number === slideNum ? { ...s, audio_url: null } : s));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-3">
        <Loader className="w-4 h-4 text-mocha animate-spin" />
        <span className="text-xs text-mocha/50">Detecting slides...</span>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-mocha/15 rounded-lg overflow-hidden">
      <div className="bg-linen px-4 py-2.5 border-b border-mocha/10">
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 font-medium">
          Slide Voiceovers — {numSlides} slides detected
        </span>
      </div>
      <div className="divide-y divide-mocha/08">
        {slideAudio.map((slide) => (
          <div key={slide.slide_number} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-cream/50 transition-colors">
            {/* Slide number */}
            <div className="w-16 flex-shrink-0">
              <span className="text-[0.6rem] tracking-widest uppercase text-mocha/40">Slide {slide.slide_number}</span>
            </div>

            {/* Status */}
            <div className="flex-1">
              {slide.audio_url ? (
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-mocha" />
                  <span className="text-[0.6rem] text-mocha/60 tracking-wide">Audio uploaded</span>
                </div>
              ) : (
                <span className="text-[0.6rem] text-mocha/30 tracking-wide">No audio</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {success === slide.slide_number ? (
                <div className="flex items-center gap-1 text-mocha">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[0.58rem] tracking-wide">Saved!</span>
                </div>
              ) : uploading === slide.slide_number ? (
                <div className="flex items-center gap-1 text-mocha/50">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[0.58rem] tracking-wide">Uploading...</span>
                </div>
              ) : (
                <label className="flex items-center gap-1 px-3 py-1.5 bg-charcoal text-cream text-[0.58rem] tracking-wide uppercase cursor-pointer hover:bg-mocha transition-colors rounded">
                  <Upload className="w-3 h-3" />
                  {slide.audio_url ? 'Replace' : 'Upload'}
                  <input type="file" accept="audio/*,.mp3,.m4a,.wav" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(slide.slide_number, f); }} />
                </label>
              )}
              {slide.audio_url && uploading !== slide.slide_number && (
                <button onClick={() => handleDelete(slide.slide_number)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
