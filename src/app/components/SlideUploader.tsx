import { useState, useEffect } from 'react';
import { Upload, Loader, CheckCircle, Trash2, Image, Mic, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import JSZip from 'jszip';

interface Slide {
  slide_number: number;
  image_url: string;
  audio_url?: string | null;
}

interface SlideUploaderProps {
  lessonId: string;
  lessonTitle: string;
}

export const SlideUploader = ({ lessonId, lessonTitle }: SlideUploaderProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingAudio, setUploadingAudio] = useState<number | null>(null);
  const [audioSuccess, setAudioSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchSlides();
  }, [lessonId]);

  const fetchSlides = async () => {
    setLoading(true);
    const [{ data: slideData }, { data: audioData }] = await Promise.all([
      supabase.from('lesson_slides').select('*').eq('lesson_id', lessonId).order('slide_number'),
      supabase.from('slide_audio').select('*').eq('lesson_id', lessonId),
    ]);

    const combined = (slideData || []).map(slide => ({
      ...slide,
      audio_url: audioData?.find(a => a.slide_number === slide.slide_number)?.audio_url || null,
    }));

    setSlides(combined);
    setLoading(false);
  };

  const handleZipUpload = async (file: File) => {
    setUploading(true);
    setProgress('Reading ZIP file...');
    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles = Object.keys(zip.files)
        .filter(name => {
          const lower = name.toLowerCase();
          return (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
            && !zip.files[name].dir && !name.startsWith('__MACOSX');
        })
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB || a.localeCompare(b);
        });

      if (imageFiles.length === 0) {
        alert('No PNG or JPG images found in the ZIP file.');
        setUploading(false);
        return;
      }

      setProgress(`Found ${imageFiles.length} slides. Uploading...`);
      await supabase.from('lesson_slides').delete().eq('lesson_id', lessonId);

      for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const slideNum = i + 1;
        setProgress(`Uploading slide ${slideNum} of ${imageFiles.length}...`);
        const blob = await zip.files[fileName].async('blob');
        const ext = fileName.split('.').pop() || 'png';
        const path = `slides/${lessonId}/slide-${slideNum}.${ext}`;
        await supabase.storage.from('course-materials').upload(path, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: true });
        const { data: urlData } = supabase.storage.from('course-materials').getPublicUrl(path);
        await supabase.from('lesson_slides').upsert({ lesson_id: lessonId, slide_number: slideNum, image_url: urlData.publicUrl });
      }

      setProgress(`✓ ${imageFiles.length} slides uploaded!`);
      await fetchSlides();
      setTimeout(() => setProgress(''), 3000);
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (slideNum: number, file: File) => {
    setUploadingAudio(slideNum);
    try {
      const ext = file.name.split('.').pop();
      const path = `slide-audio/${lessonId}/slide-${slideNum}.${ext}`;
      await supabase.storage.from('course-materials').upload(path, file, { upsert: true });
      const { data } = supabase.storage.from('course-materials').getPublicUrl(path);
      await supabase.from('slide_audio').upsert({ lesson_id: lessonId, slide_number: slideNum, audio_url: data.publicUrl });
      setAudioSuccess(slideNum);
      setTimeout(() => setAudioSuccess(null), 3000);
      await fetchSlides();
    } catch (err) {
      alert('Audio upload failed. Please try again.');
    } finally {
      setUploadingAudio(null);
    }
  };

  const handleDeleteAudio = async (slideNum: number) => {
    await supabase.from('slide_audio').delete().eq('lesson_id', lessonId).eq('slide_number', slideNum);
    fetchSlides();
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL slides for this lesson?')) return;
    await supabase.from('lesson_slides').delete().eq('lesson_id', lessonId);
    setSlides([]);
  };

  return (
    <div className="mt-3 border border-mocha/15 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-linen px-4 py-2.5 border-b border-mocha/10 flex items-center justify-between">
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 font-medium">
          Slides & Voiceovers — {slides.length} slides
        </span>
        {slides.length > 0 && (
          <button onClick={handleDeleteAll} className="text-[0.55rem] text-red-400 hover:text-red-600 tracking-wide uppercase">
            Delete All Slides
          </button>
        )}
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* ZIP Upload */}
        <label className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed cursor-pointer transition-all rounded ${
          uploading ? 'border-mocha/20 bg-linen cursor-not-allowed' : 'border-mocha/30 hover:border-charcoal hover:bg-cream/50'
        }`}>
          {uploading ? (
            <><Loader className="w-5 h-5 text-mocha animate-spin" /><span className="text-xs text-mocha text-center">{progress}</span></>
          ) : progress ? (
            <><CheckCircle className="w-5 h-5 text-mocha" /><span className="text-xs text-mocha text-center">{progress}</span></>
          ) : (
            <>
              <Upload className="w-5 h-5 text-mocha/40" />
              <div className="text-center">
                <p className="text-xs text-charcoal font-medium">Upload ZIP of PNG slides</p>
                <p className="text-[0.58rem] text-mocha/40 mt-0.5">Canva → Share → Download → PNG → All pages</p>
              </div>
            </>
          )}
          <input type="file" accept=".zip" className="hidden" disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleZipUpload(f); e.target.value = ''; }} />
        </label>

        {/* Slides with audio upload */}
        {loading ? (
          <div className="flex justify-center py-4"><Loader className="w-5 h-5 text-mocha animate-spin" /></div>
        ) : slides.length > 0 ? (
          <div className="space-y-2">
            {slides.map(slide => (
              <div key={slide.slide_number} className="flex items-center gap-3 p-2 border border-mocha/10 rounded bg-cream/30">
                {/* Thumbnail */}
                <img src={slide.image_url} alt={`Slide ${slide.slide_number}`}
                  className="w-16 h-10 object-cover rounded border border-mocha/10 flex-shrink-0" />

                {/* Slide number */}
                <div className="w-12 flex-shrink-0">
                  <span className="text-[0.6rem] tracking-widest uppercase text-mocha/50">Slide {slide.slide_number}</span>
                </div>

                {/* Audio status */}
                <div className="flex-1">
                  {slide.audio_url ? (
                    <div className="flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-mocha" />
                      <span className="text-[0.58rem] text-mocha/60">Voiceover uploaded</span>
                    </div>
                  ) : (
                    <span className="text-[0.58rem] text-mocha/30">No voiceover</span>
                  )}
                </div>

                {/* Audio upload button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {audioSuccess === slide.slide_number ? (
                    <div className="flex items-center gap-1 text-mocha">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-[0.55rem]">Saved!</span>
                    </div>
                  ) : uploadingAudio === slide.slide_number ? (
                    <Loader className="w-3.5 h-3.5 text-mocha animate-spin" />
                  ) : (
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-charcoal text-cream text-[0.55rem] tracking-wide uppercase cursor-pointer hover:bg-mocha transition-colors rounded">
                      <Mic className="w-2.5 h-2.5" />
                      {slide.audio_url ? 'Replace' : 'Add Voice'}
                      <input type="file" accept="audio/*,.mp3,.m4a,.wav" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(slide.slide_number, f); }} />
                    </label>
                  )}
                  {slide.audio_url && uploadingAudio !== slide.slide_number && (
                    <button onClick={() => handleDeleteAudio(slide.slide_number)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-mocha/30">
            <Image className="w-4 h-4" />
            <span className="text-xs">Upload a ZIP to add slides</span>
          </div>
        )}
      </div>
    </div>
  );
};
