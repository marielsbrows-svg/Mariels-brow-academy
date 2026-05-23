import { AlertCircle, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SetupNotice = () => {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-mocha text-white rounded-2xl shadow-2xl p-6 z-50 border-2 border-mocha-dark">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-2">Setup Required</h3>
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            To use authentication and course features, please configure your Supabase credentials in the environment variables.
          </p>
          <div className="space-y-2 text-xs">
            <div className="bg-white/10 rounded px-3 py-2 font-mono">
              VITE_SUPABASE_URL
            </div>
            <div className="bg-white/10 rounded px-3 py-2 font-mono">
              VITE_SUPABASE_ANON_KEY
            </div>
          </div>
          <a
            href="/SETUP.md"
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 text-sm hover:text-cream transition-colors"
          >
            View Setup Instructions
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
