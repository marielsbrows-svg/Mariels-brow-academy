import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare, Send, Pin, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const CommunityPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      let query = supabase
        .from('discussions')
        .select(`*, profiles (full_name, avatar_url)`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (courseId) query = query.eq('course_id', courseId);

      const { data, error } = await query;
      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('discussions').insert({
        course_id: courseId || null,
        user_id: user.id,
        title: newTitle,
        content: newContent,
      });
      if (error) throw error;
      setNewTitle('');
      setNewContent('');
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setCreating(false);
    }
  };

  const inputClass = 'w-full px-4 py-3.5 bg-cream border border-mocha/20 text-charcoal text-sm outline-none focus:border-charcoal transition-colors placeholder:text-mocha/30';

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 pb-12 border-b border-mocha/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">
              Mariels Brow Academy
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl text-charcoal font-light leading-tight mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Community <span className="italic">Discussion</span>
          </h1>
          <p className="text-sm text-mocha-dark leading-relaxed max-w-lg">
            Connect with fellow students, share insights, and ask questions.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-mocha/10 mb-16">
          {[
            { icon: Users, value: discussions.length, label: 'Discussions' },
            { icon: MessageSquare, value: 'Active', label: 'Community' },
            { icon: TrendingUp, value: 'Growing', label: 'Engagement' },
          ].map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white px-8 py-6 flex items-center gap-5"
            >
              <div className="w-10 h-10 border border-mocha/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-mocha" />
              </div>
              <div>
                <div
                  className="text-2xl text-charcoal font-light"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {value}
                </div>
                <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/50 mt-0.5">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Discussion Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-mocha/15 bg-white p-10 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">New Discussion</span>
          </div>
          <h2
            className="text-3xl text-charcoal font-light mb-8"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Start a <span className="italic">Conversation</span>
          </h2>

          <form onSubmit={createDiscussion} className="space-y-5">
            <div>
              <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Discussion title..."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2">Message</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a conversation..."
                rows={5}
                className={inputClass + ' resize-none'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-8 py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all disabled:opacity-50"
            >
              {creating ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <><Send className="w-3.5 h-3.5" /> Post Discussion</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Discussions List */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">
              All Discussions
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin" />
            </div>
          ) : discussions.length > 0 ? (
            <div className="space-y-px bg-mocha/10">
              {discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 hover:bg-linen transition-colors group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-8 h-8 border border-mocha/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {discussion.is_pinned ? (
                        <Pin className="w-3.5 h-3.5 text-mocha" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-mocha/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3
                          className="text-lg text-charcoal font-light leading-tight"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {discussion.is_pinned && (
                            <span className="text-[0.5rem] tracking-[0.15em] uppercase text-mocha bg-mocha/10 px-2 py-0.5 mr-2 align-middle">
                              Pinned
                            </span>
                          )}
                          {discussion.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-mocha/20 group-hover:text-mocha/50 transition-colors flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-xs text-mocha-dark line-clamp-2 leading-relaxed mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-3 text-[0.55rem] tracking-[0.1em] uppercase text-mocha/40">
                        <span>{discussion.profiles?.full_name || 'Student'}</span>
                        <span>·</span>
                        <span>{new Date(discussion.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border border-mocha/15 bg-white p-16 text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-5 text-mocha/20" />
              <h3
                className="text-2xl text-charcoal font-light italic mb-3"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                No Discussions Yet
              </h3>
              <p className="text-xs text-mocha/50 tracking-wide">
                Be the first to start a conversation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
