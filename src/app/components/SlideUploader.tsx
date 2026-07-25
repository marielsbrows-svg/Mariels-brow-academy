import { useState, useEffect } from 'react';
import { Upload, Loader, CheckCircle, Trash2, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import JSZip from 'jszip';

interface Slide {
  slide_number: number;
  image_url: string;
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

  useEffect(() => {
    fetchSlides();
  }, [lessonId]);

  const fetchSlides = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lesson_slides')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('slide_number');
    setSlides(data || []);
    setLoading(false);
  };

  const handleZipUpload = async (file: File) => {
    setUploading(true);
    setProgress('Reading ZIP file...');
    try {
      const zip = await JSZip.loadAsync(file);

      // Get all PNG/JPG files and sort them naturally
      const imageFiles = Object.keys(zip.files)
        .filter(name => {
          const lower = name.toLowerCase();
          return (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
            && !zip.files[name].dir
            && !name.startsWith('__MACOSX');
        })
        .sort((a, b) => {
          // Natural sort by filename
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

      // Delete existing slides for this lesson
      await supabase.from('lesson_slides').delete().eq('lesson_id', lessonId);

      // Upload each image
      for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const slideNum = i + 1;
        setProgress(`Uploading slide ${slideNum} of ${imageFiles.length}...`);

        const blob = await zip.files[fileName].async('blob');
        const ext = fileName.split('.').pop() || 'png';
        const path = `slides/${lessonId}/slide-${slideNum}.${ext}`;

        // Delete old file if exists
        await supabase.storage.from('course-materials').remove([path]);

        // Upload new file
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(path, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('course-materials')
          .getPublicUrl(path);

        // Save to database
        await supabase.from('lesson_slides').upsert({
          lesson_id: lessonId,
          slide_number: slideNum,
          image_url: urlData.publicUrl,
        });
      }

      setProgress('All slides uploaded successfully!');
      await fetchSlides();
      setTimeout(() => setProgress(''), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSlide = async (slideNum: number) => {
    if (!confirm(`Delete slide ${slideNum}?`)) return;
    await supabase.from('lesson_slides').delete()
      .eq('lesson_id', lessonId)
      .eq('slide_number', slideNum);
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
          Slide Images — {slides.length} slides
        </span>
        {slides.length > 0 && (
          <button onClick={handleDeleteAll} className="text-[0.55rem] text-red-400 hover:text-red-600 tracking-wide uppercase">
            Delete All
          </button>
        )}
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* Upload Zone */}
        <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed cursor-pointer transition-all rounded ${
          uploading ? 'border-mocha/20 bg-linen cursor-not-allowed' : 'border-mocha/30 hover:border-charcoal hover:bg-cream/50'
        }`}>
          {uploading ? (
            <>
              <Loader className="w-6 h-6 text-mocha animate-spin" />
              <span className="text-xs text-mocha text-center">{progress}</span>
            </>
          ) : progress ? (
            <>
              <CheckCircle className="w-6 h-6 text-mocha" />
              <span className="text-xs text-mocha text-center">{progress}</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-mocha/40" />
              <div className="text-center">
                <p className="text-xs text-charcoal font-medium">Upload ZIP of PNG slides</p>
                <p className="text-[0.6rem] text-mocha/40 mt-1">Download from Canva as PNG → All pages → ZIP</p>
                <p className="text-[0.6rem] text-mocha/40">Slides will be sorted automatically by filename</p>
              </div>
            </>
          )}
          <input
            type="file"
            accept=".zip"
            className="hidden"
            disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleZipUpload(f); e.target.value = ''; }}
          />
        </label>

        {/* Slide Previews */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader className="w-5 h-5 text-mocha animate-spin" />
          </div>
        ) : slides.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {slides.map(slide => (
              <div key={slide.slide_number} className="relative group">
                <img
                  src={slide.image_url}
                  alt={`Slide ${slide.slide_number}`}
                  className="w-full aspect-video object-cover rounded border border-mocha/10"
                />
                <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded">
                  <span className="text-[0.5rem] text-white">{slide.slide_number}</span>
                </div>
                <button
                  onClick={() => handleDeleteSlide(slide.slide_number)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-mocha/30">
            <Image className="w-4 h-4" />
            <span className="text-xs">No slides uploaded yet</span>
          </div>
        )}
      </div>
    </div>
  );
};
