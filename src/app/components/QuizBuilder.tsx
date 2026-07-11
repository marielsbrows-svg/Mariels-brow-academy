import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

interface QuizBuilderProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export const QuizBuilder = ({ lessonId, lessonTitle, onClose }: QuizBuilderProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
  });

  useEffect(() => {
    fetchQuestions();
  }, [lessonId]);

  const fetchQuestions = async () => {
    try {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('quiz_questions').insert({
        lesson_id: lessonId,
        question: form.question,
        option_a: form.option_a,
        option_b: form.option_b,
        option_c: form.option_c,
        option_d: form.option_d,
        correct_answer: form.correct_answer,
        order_index: questions.length,
      });
      if (error) throw error;
      setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' });
      setShowForm(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await supabase.from('quiz_questions').delete().eq('id', id);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-charcoal transition-colors placeholder:text-mocha/30';
  const labelClass = 'block text-[0.58rem] tracking-[0.2em] uppercase text-mocha/60 mb-1.5';

  return (
    <div className="fixed inset-0 bg-charcoal/80 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-charcoal px-8 py-5 flex items-center justify-between sticky top-0">
          <div>
            <div className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/30 mb-1">Quiz Builder</div>
            <h2
              className="text-xl text-cream font-light italic"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {lessonTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cream/40 hover:text-cream transition-colors text-sm tracking-wide"
          >
            Close ✕
          </button>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-mocha/10">
            <div>
              <div
                className="text-3xl text-charcoal font-light"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {questions.length}
              </div>
              <div className="text-[0.55rem] tracking-[0.15em] uppercase text-mocha/40">Questions</div>
            </div>
            <div className="w-px h-8 bg-mocha/10" />
            <div>
              <div
                className="text-3xl text-charcoal font-light"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                80%
              </div>
              <div className="text-[0.55rem] tracking-[0.15em] uppercase text-mocha/40">Pass Score</div>
            </div>
            <div className="w-px h-8 bg-mocha/10" />
            <div>
              <div
                className="text-3xl text-charcoal font-light"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                3
              </div>
              <div className="text-[0.55rem] tracking-[0.15em] uppercase text-mocha/40">Max Attempts</div>
            </div>
          </div>

          {/* Existing Questions */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin" />
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-3 mb-6">
              {questions.map((q, i) => (
                <div key={q.id} className="border border-mocha/15 p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-sm text-charcoal flex-1">
                      <span className="text-mocha/40 mr-2">{i + 1}.</span>
                      {q.question}
                    </p>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div
                        key={opt}
                        className={`px-3 py-1.5 text-xs flex items-center gap-2 ${
                          q.correct_answer === opt.toUpperCase()
                            ? 'bg-charcoal text-cream'
                            : 'bg-cream text-mocha/60'
                        }`}
                      >
                        <span className="font-medium">{opt.toUpperCase()}.</span>
                        {q[`option_${opt}` as keyof Question]}
                        {q.correct_answer === opt.toUpperCase() && (
                          <span className="ml-auto text-[0.5rem] tracking-widest uppercase">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <p className="text-xs text-mocha/40 tracking-wide">No questions yet — add your first one below!</p>
            </div>
          )}

          {/* Add Question Form */}
          {showForm ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddQuestion}
              className="border border-mocha/15 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-px bg-mocha/30" />
                <span className="text-[0.58rem] tracking-[0.2em] uppercase text-mocha/50">New Question</span>
              </div>

              <div>
                <label className={labelClass}>Question</label>
                <textarea
                  required
                  rows={2}
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  className={inputClass + ' resize-none'}
                  placeholder="Enter your question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label className={labelClass}>Option {opt.toUpperCase()}</label>
                    <input
                      type="text"
                      required
                      value={form[`option_${opt}` as keyof typeof form]}
                      onChange={e => setForm({ ...form, [`option_${opt}`]: e.target.value })}
                      className={inputClass}
                      placeholder={`Option ${opt.toUpperCase()}...`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Correct Answer</label>
                <select
                  value={form.correct_answer}
                  onChange={e => setForm({ ...form, correct_answer: e.target.value })}
                  className={inputClass}
                >
                  <option value="A">A — {form.option_a || 'Option A'}</option>
                  <option value="B">B — {form.option_b || 'Option B'}</option>
                  <option value="C">C — {form.option_c || 'Option C'}</option>
                  <option value="D">D — {form.option_d || 'Option D'}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream text-[0.6rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : <><Plus className="w-3.5 h-3.5" /> Add Question</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-charcoal text-charcoal text-[0.6rem] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-cream transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              disabled={questions.length >= 5}
              className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-mocha/30 text-mocha/50 text-[0.6rem] tracking-[0.2em] uppercase hover:border-charcoal hover:text-charcoal transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              {questions.length >= 5 ? 'Maximum 5 questions reached' : 'Add Question'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
