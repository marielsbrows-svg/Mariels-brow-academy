import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, RotateCcw, Lock } from 'lucide-react';
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
  lang?: string;
}

const TXT = {
  EN: { passedTitle: 'Quiz Passed', passedNote: 'You’ve already passed this quiz. Continue to the next lesson!', maxTitle: 'Maximum Attempts Reached', maxNote: 'You’ve used all 3 attempts. Please review the lesson material and contact support if you need help.', congrats: 'Congratulations', youPassed: 'You passed the quiz', notYet: 'Not Quite Yet', review: 'Review the material and try again', score: 'Your Score', required: 'Required', left: 'Attempts Left', correct: 'Correct:', unlocking: 'Unlocking next lesson...', retake: 'Retake Quiz', attemptsLeft: 'attempts left', quiz: 'Lesson Quiz', question: 'Question', of: 'of', next: 'Next Question', submit: 'Submit Quiz' },
  ES: { passedTitle: 'Prueba aprobada', passedNote: 'Ya aprobaste esta prueba. ¡Continúa con la siguiente lección!', maxTitle: 'Llegaste al máximo de intentos', maxNote: 'Usaste los 3 intentos. Repasa el material de la lección y escríbenos si necesitas ayuda.', congrats: '¡Felicidades!', youPassed: 'Aprobaste la prueba', notYet: 'Todavía no', review: 'Repasa el material e inténtalo de nuevo', score: 'Tu puntaje', required: 'Requerido', left: 'Intentos restantes', correct: 'Correcta:', unlocking: 'Desbloqueando la siguiente lección...', retake: 'Repetir la prueba', attemptsLeft: 'intentos restantes', quiz: 'Prueba de la lección', question: 'Pregunta', of: 'de', next: 'Siguiente pregunta', submit: 'Enviar prueba' },
};

const PASS_SCORE = 80;
const MAX_ATTEMPTS = 3;
const HEAD = { fontFamily: "'Horizon', 'Arial Black', Arial, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '0', lineHeight: 1.1 };

export const QuizComponent = ({ lessonId, onPass, lang = 'EN' }: QuizComponentProps) => {
  const T = (lang || '').toUpperCase() === 'ES' ? TXT.ES : TXT.EN;
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
        <div className="w-6 h-6 border-2 border-stone-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  // Already passed
  if (alreadyPassed && !submitted) {
    return (
      <div className="bg-white p-8 text-center border border-stone-200">
        <CheckCircle className="w-10 h-10 text-[#191a1e] mx-auto mb-4" />
        <h3 className="text-2xl text-[#191a1e] mb-2" style={HEAD}>{T.passedTitle}</h3>
        <p className="text-xs text-stone-500 tracking-wide">{T.passedNote}</p>
      </div>
    );
  }

  // Max attempts reached without passing
  if (attempts >= MAX_ATTEMPTS && !passed && !submitted) {
    return (
      <div className="bg-white p-8 text-center border border-stone-200">
        <Lock className="w-10 h-10 text-stone-400 mx-auto mb-4" />
        <h3 className="text-2xl text-[#191a1e] mb-2" style={HEAD}>{T.maxTitle}</h3>
        <p className="text-xs text-stone-500 tracking-wide max-w-xs mx-auto">
          {T.maxNote}
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
        className="bg-white border border-stone-200 overflow-hidden"
      >
        <div className={`p-8 text-center ${passed ? 'bg-[#191a1e]' : 'bg-stone-100'}`}>
          {passed ? (
            <>
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-3xl text-white mb-2" style={HEAD}>{T.congrats}</h3>
              <p className="text-white/60 text-sm">{T.youPassed}</p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-3xl text-[#191a1e] mb-2" style={HEAD}>{T.notYet}</h3>
              <p className="text-stone-500 text-sm">{T.review}</p>
            </>
          )}
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-200">
            <div className="text-center flex-1">
              <div className="text-5xl text-[#191a1e] mb-1" style={HEAD}>{score}%</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-stone-400">{T.score}</div>
            </div>
            <div className="w-px h-12 bg-stone-200" />
            <div className="text-center flex-1">
              <div className="text-5xl text-[#191a1e] mb-1" style={HEAD}>{PASS_SCORE}%</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-stone-400">{T.required}</div>
            </div>
            <div className="w-px h-12 bg-stone-200" />
            <div className="text-center flex-1">
              <div className="text-5xl text-[#191a1e] mb-1" style={HEAD}>{Math.max(0, MAX_ATTEMPTS - (attempts + 1))}</div>
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-stone-400">{T.left}</div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {questions.map((q, i) => {
              const studentAnswer = answers[q.id];
              const isCorrect = studentAnswer === q.correct_answer;
              return (
                <div key={q.id} className={`p-4 border ${isCorrect ? 'border-stone-200 bg-stone-50' : 'border-red-100 bg-red-50/50'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-[#191a1e] flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs text-[#191a1e] mb-1">{i + 1}. {q.question}</p>
                      {!isCorrect && (
                        <p className="text-[0.6rem] text-stone-500">
                          {T.correct} <span className="text-[#191a1e] font-medium">{q[`option_${q.correct_answer.toLowerCase()}` as keyof Question]}</span>
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
              <p className="text-xs text-stone-400 tracking-wide mb-4">{T.unlocking}</p>
              <div className="w-8 h-8 border-2 border-stone-200 border-t-black rounded-full animate-spin mx-auto" />
            </div>
          ) : attempts + 1 < MAX_ATTEMPTS && (
            <button onClick={retakeQuiz} className="flex items-center justify-center gap-2 w-full py-4 border border-[#191a1e] text-[#191a1e] text-[0.62rem] tracking-[0.2em] uppercase hover:bg-[#191a1e] hover:text-white transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
              {T.retake} ({MAX_ATTEMPTS - (attempts + 1)} {T.attemptsLeft})
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
    <div className="bg-white border border-stone-200 overflow-hidden">
      <div className="bg-[#191a1e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-white/20" />
          <span className="text-[0.55rem] tracking-[0.2em] uppercase text-white/40">{T.quiz}</span>
        </div>
        <span className="text-[0.55rem] tracking-[0.15em] uppercase text-white/30">{T.question} {currentQ + 1} {T.of} {questions.length}</span>
      </div>

      <div className="h-0.5 bg-stone-200">
        <div className="h-full bg-[#191a1e] transition-all duration-500" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <h3 className="text-xl text-[#191a1e] mb-6 leading-relaxed" style={HEAD}>
              {question.question}
            </h3>

            <div className="space-y-3 mb-8">
              {options.map(({ key, text }) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left p-4 border transition-all flex items-center gap-4 ${selected === key ? 'border-[#191a1e] bg-[#191a1e] text-white' : 'border-stone-200 bg-stone-50 hover:border-stone-400 text-[#191a1e]'}`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center text-[0.65rem] font-medium flex-shrink-0 border transition-all ${selected === key ? 'border-white/30 text-white' : 'border-stone-300 text-stone-500'}`}>{key}</span>
                  <span className="text-sm leading-relaxed">{text}</span>
                </button>
              ))}
            </div>

            <button onClick={handleNext} disabled={!selected} className="flex items-center justify-center gap-2 w-full py-4 bg-[#191a1e] text-white text-[0.62rem] tracking-[0.2em] uppercase hover:opacity-80 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {currentQ < questions.length - 1 ? T.next : T.submit}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
