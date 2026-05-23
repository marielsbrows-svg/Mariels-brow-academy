import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare, Send, Pin, Users, TrendingUp } from 'lucide-react';
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
  _count?: number;
}

export const CommunityPage = () => {
  const { courseId } = useParams();
  const { user, profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

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
        course_id: courseId,
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

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="font-serif italic text-5xl text-charcoal mb-2">
            Community Discussion
          </h1>
          <p className="text-xl text-mocha-dark">
            Connect with fellow students, share insights, and ask questions
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-mocha" />
            <div className="text-2xl font-serif text-charcoal">
              {discussions.length}
            </div>
            <div className="text-sm text-mocha-dark">Discussions</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-mocha" />
            <div className="text-2xl font-serif text-charcoal">Active</div>
            <div className="text-sm text-mocha-dark">Community</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-mocha" />
            <div className="text-2xl font-serif text-charcoal">Growing</div>
            <div className="text-sm text-mocha-dark">Engagement</div>
          </div>
        </div>

        {/* Create New Discussion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-lg mb-8"
        >
          <h2 className="font-serif text-2xl text-charcoal mb-4">
            Start a Discussion
          </h2>
          <form onSubmit={createDiscussion} className="space-y-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Discussion title..."
              className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
              required
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              rows={4}
              className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha resize-none"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {creating ? 'Posting...' : 'Post Discussion'}
            </button>
          </form>
        </motion.div>

        {/* Discussions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
            </div>
          ) : discussions.length > 0 ? (
            discussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/community/${courseId}/discussion/${discussion.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-mocha" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                          {discussion.is_pinned && (
                            <Pin className="w-5 h-5 text-mocha" />
                          )}
                          {discussion.title}
                        </h3>
                      </div>
                      <p className="text-mocha-dark line-clamp-2 mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-mocha-dark">
                        <div>
                          By {discussion.profiles?.full_name || 'Student'} •{' '}
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-mocha/30" />
              <h3 className="font-serif text-2xl text-charcoal mb-3">
                No Discussions Yet
              </h3>
              <p className="text-mocha-dark">
                Be the first to start a conversation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
