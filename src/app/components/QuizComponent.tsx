import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

interface QuizComponentProps {
  lessonId: string;
  onPass: () => void;
}

const PASS_SCORE = 80;
const MAX_ATTEMPTS = 3;

export const QuizComponent = ({ lessonId, onPass }: QuizComponentProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchQuestions();
      await checkAttempts();
      setInitialized(true);
    };
    init();
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

  const checkAttempts = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setAttempts(data.length);
        const hasPassed = data.some(a => a.passed);
        if (hasPassed) {
          setAlreadyPassed(true);
          // Don't call onPass() here — only call it when they actually complete the quiz
        }
      }
    } catch (error) {
      console.error('Error checking attempts:', error);
    }
  };

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [questions[currentQ].id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    const correct = questions.filter(q => finalAnswers[q.id] === q.correct_answer).length;
    const scorePercent = Math.round((correct / questions.length) * 100);
    const didPass = scorePercent >= PASS_SCORE;

    setScore(scorePercent);
    setPassed(didPass);
    setSubmitted(true);

    try {
      await supabase.from('quiz_attempts').insert({
        user_id: user?.id,
        lesson_id: lessonId,
        score: scorePercent,
        passed: didPass,
        attempt_number: attempts + 1,
        answers: finalAnswers,
      });

      if (didPass) {
        setAlreadyPassed(true);
        // Only call onPass when they actually pass the quiz right now
        setTimeout(() => onPass(), 2000);
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const retakeQuiz = () => {
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setAttempts(prev => prev + 1);
  };

  if (loading || !initialized) {
    return (
      <div className="bg-white p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin" />
      </div>
    );
  }

  // No questions — don't show quiz at all
  if (questions.length === 0) return null;

  // Already passed
  if (alreadyPassed && !submitted) {
    return (
      <div className="bg-white p-8 text-center border border-mocha/15">
        <CheckCircle className="w-10 h-10 text-mocha mx-auto mb-4" />
        <h3
          className="text-2xl text-charcoal font-light italic mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Quiz Passed!
        </h3>
        <p className="text-xs text-mocha/50 tracking-wide">You've already passed this quiz. Continue to the next lesson!</p>
      </div>
    );
  }

  // Max attempts reached without passing
  if (attempts >= MAX_ATTEMPTS && !passed && !submitted) {
    return (
      <div className="bg-white p-8 text-center border border-mocha/15">
        <Lock className="w-10 h-10 text-mocha/30 mx-auto mb-4" />
        <h3
          className="text-2xl text-charcoal font-light italic mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Maximum Attempts Reached
        </h3>
        <p className="text-xs text-mocha/50 tracking-wide max-w-xs mx-auto">
          You've used all 3 attempts. Please review the lesson material and contact support if you need help.
        </p>
      </div>
    );
  }

  // Results screen
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-mocha/15 overflow-hidden"
      >
        <div className={`p-8 text-center ${passed ? 'bg-charcoal' : 'bg-linen'}`}>
          {passed ? (
            <>
              <CheckCircle className="w-12 h-12 text-cream mx-auto mb-4" />
              <h3 className="text-3xl text-cream font-light italic mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Congratulations!</h3>
              <p className="text-cream/60 text-sm">You passed the quiz</p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-mocha/50 mx-auto mb-4" />
              <h3 className="text-3xl text-charcoal font-light italic mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Not Quite Yet</h3>
              <p className="text-mocha/60 text-sm">Review the material and try again</p>
            </>
          )}
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-mocha/10">
            <div className="text-center flex-1">
              <div className="text-5xl text-charcoal font-light mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{score}%</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/40">Your Score</div>
            </div>
            <div className="w-px h-12 bg-mocha/10" />
            <div className="text-center flex-1">
              <div className="text-5xl text-charcoal font-light mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{PASS_SCORE}%</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/40">Required</div>
            </div>
            <div className="w-px h-12 bg-mocha/10" />
            <div className="text-center flex-1">
              <div className="text-5xl text-charcoal font-light mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{Math.max(0, MAX_ATTEMPTS - (attempts + 1))}</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/40">Attempts Left</div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {questions.map((q, i) => {
              const studentAnswer = answers[q.id];
              const isCorrect = studentAnswer === q.correct_answer;
              return (
                <div key={q.id} className={`p-4 border ${isCorrect ? 'border-mocha/20 bg-linen' : 'border-red-100 bg-red-50/50'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-mocha flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs text-charcoal mb-1">{i + 1}. {q.question}</p>
                      {!isCorrect && (
                        <p className="text-[0.6rem] text-mocha/60">
                          Correct: <span className="text-charcoal font-medium">{q[`option_${q.correct_answer.toLowerCase()}` as keyof Question]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {passed ? (
            <div className="text-center">
              <p className="text-xs text-mocha/40 tracking-wide mb-4">Unlocking next lesson...</p>
              <div className="w-8 h-8 border-2 border-mocha/20 border-t-mocha rounded-full animate-spin mx-auto" />
            </div>
          ) : attempts + 1 < MAX_ATTEMPTS && (
            <button onClick={retakeQuiz} className="flex items-center justify-center gap-2 w-full py-4 border border-charcoal text-charcoal text-[0.62rem] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-cream transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz ({MAX_ATTEMPTS - (attempts + 1)} attempts left)
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Quiz questions
  const question = questions[currentQ];
  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  return (
    <div className="bg-white border border-mocha/15 overflow-hidden">
      <div className="bg-charcoal px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-cream/20" />
          <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/40">Lesson Quiz</span>
        </div>
        <span className="text-[0.55rem] tracking-[0.15em] uppercase text-cream/30">Question {currentQ + 1} of {questions.length}</span>
      </div>

      <div className="h-0.5 bg-mocha/10">
        <div className="h-full bg-charcoal transition-all duration-500" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <h3 className="text-xl text-charcoal font-light mb-6 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
              {question.question}
            </h3>

            <div className="space-y-3 mb-8">
              {options.map(({ key, text }) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left p-4 border transition-all flex items-center gap-4 ${selected === key ? 'border-charcoal bg-charcoal text-cream' : 'border-mocha/15 bg-cream hover:border-mocha/40 text-charcoal'}`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center text-[0.65rem] font-medium flex-shrink-0 border transition-all ${selected === key ? 'border-cream/30 text-cream' : 'border-mocha/20 text-mocha/50'}`}>{key}</span>
                  <span className="text-sm leading-relaxed">{text}</span>
                </button>
              ))}
            </div>

            <button onClick={handleNext} disabled={!selected} className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {currentQ < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
