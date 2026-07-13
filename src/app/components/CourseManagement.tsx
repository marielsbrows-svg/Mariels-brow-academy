import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Video, Save, X, Eye } from 'lucide-react';
import { QuizBuilder } from './QuizBuilder';
import { supabase } from '../../lib/supabase';

interface Course { id: string; title: string; description: string; price: number; thumbnail_url: string; }
interface Module { id: string; course_id: string; title: string; description: string; order_index: number; }
interface Lesson { id: string; module_id: string; title: string; description: string; video_url: string; duration: number; order_index: number; }
interface Resource { id: string; lesson_id: string; title: string; file_url: string; resource_type: string; }
interface QuizQuestion { id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; }
interface QuizAttempt { id: string; user_id: string; score: number; passed: boolean; attempt_number: number; answers: Record<string, string>; created_at: string; profiles?: { full_name: string; email: string; }; }

export const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<string | null>(null);
  const [selectedLessonForResource, setSelectedLessonForResource] = useState<string | null>(null);
  const [quizBuilderLesson, setQuizBuilderLesson] = useState<{ id: string; title: string } | null>(null);
  const [viewingQuizLesson, setViewingQuizLesson] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [viewingAttempts, setViewingAttempts] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: null as File | null });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', duration: '', video: null as File | null });
  const [resourceForm, setResourceForm] = useState({ title: '', file: null as File | null, resource_type: 'pdf' });

  const inputClass = 'w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm';

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchModules(selectedCourse); }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
    if (data) setCourses(data);
  };

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
    if (data) setModules(data);
  };

  const fetchLessons = async (moduleId: string) => {
    const { data: lessonsData } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index', { ascending: true });
    if (lessonsData) setLessons(prev => {
      const otherLessons = prev.filter(l => l.module_id !== moduleId);
      return [...otherLessons, ...lessonsData];
    });
    const { data: resourcesData } = await supabase.from('lesson_resources').select('*').in('lesson_id', lessonsData?.map(l => l.id) || []);
    if (resourcesData) setResources(prev => {
      const lessonIds = lessonsData?.map(l => l.id) || [];
      const otherResources = prev.filter(r => !lessonIds.includes(r.lesson_id));
      return [...otherResources, ...resourcesData];
    });
  };

  const fetchQuizData = async (lessonId: string) => {
    const { data: questions } = await supabase.from('quiz_questions').select('*').eq('lesson_id', lessonId).order('order_index');
    const { data: attempts } = await supabase.from('quiz_attempts').select('*, profiles(full_name, email)').eq('lesson_id', lessonId).order('created_at', { ascending: false });
    setQuizQuestions(questions || []);
    setQuizAttempts(attempts || []);
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    const { error } = await supabase.storage.from('course-materials').upload(filePath, file);
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from('course-materials').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let thumbnailUrl = editingCourse?.thumbnail_url || '';
      if (courseForm.thumbnail) thumbnailUrl = await uploadFile(courseForm.thumbnail, 'thumbnails');
      if (editingCourse) {
        await supabase.from('courses').update({ title: courseForm.title, description: courseForm.description, thumbnail_url: thumbnailUrl }).eq('id', editingCourse.id);
      } else {
        await supabase.from('courses').insert({ title: courseForm.title, description: courseForm.description, price: 697, thumbnail_url: thumbnailUrl, is_published: true });
      }
      setCourseForm({ title: '', description: '', thumbnail: null });
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) { alert('Error saving course'); }
    finally { setUploading(false); }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course and all its content?')) return;
    await supabase.from('courses').delete().eq('id', courseId);
    if (selectedCourse === courseId) setSelectedCourse(null);
    fetchCourses();
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingModule) {
        await supabase.from('course_modules').update({ title: moduleForm.title, description: moduleForm.description }).eq('id', editingModule.id);
      } else {
        await supabase.from('course_modules').insert({ course_id: selectedCourse, title: moduleForm.title, description: moduleForm.description, order_index: modules.length });
      }
      setModuleForm({ title: '', description: '' });
      setShowModuleForm(false);
      setEditingModule(null);
      if (selectedCourse) fetchModules(selectedCourse);
    } catch (error) { alert('Error saving module'); }
    finally { setUploading(false); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    await supabase.from('course_modules').delete().eq('id', moduleId);
    if (selectedCourse) fetchModules(selectedCourse);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let videoUrl = editingLesson?.video_url || null;
      if (lessonForm.video) videoUrl = await uploadFile(lessonForm.video, `videos/${selectedModuleForLesson || editingLesson?.module_id}`);
      if (editingLesson) {
        await supabase.from('lessons').update({ title: lessonForm.title, description: lessonForm.description, duration: parseInt(lessonForm.duration), video_url: videoUrl }).eq('id', editingLesson.id);
        fetchLessons(editingLesson.module_id);
      } else {
        const moduleLessons = lessons.filter(l => l.module_id === selectedModuleForLesson);
        await supabase.from('lessons').insert({ module_id: selectedModuleForLesson, title: lessonForm.title, description: lessonForm.description, video_url: videoUrl, duration: parseInt(lessonForm.duration), order_index: moduleLessons.length });
        if (selectedModuleForLesson) fetchLessons(selectedModuleForLesson);
      }
      setLessonForm({ title: '', description: '', duration: '', video: null });
      setShowLessonForm(false);
      setEditingLesson(null);
      setSelectedModuleForLesson(null);
    } catch (error: any) { alert(`Error saving lesson: ${error.message}`); }
    finally { setUploading(false); }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm('Delete this lesson?')) return;
    await supabase.from('lessons').delete().eq('id', lessonId);
    fetchLessons(moduleId);
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingResource) {
        const updates: any = { title: resourceForm.title, resource_type: resourceForm.resource_type };
        if (resourceForm.file) updates.file_url = await uploadFile(resourceForm.file, `resources/${editingResource.lesson_id}`);
        await supabase.from('lesson_resources').update(updates).eq('id', editingResource.id);
        const lesson = lessons.find(l => l.id === editingResource.lesson_id);
        if (lesson) fetchLessons(lesson.module_id);
      } else {
        if (!selectedLessonForResource || !resourceForm.file) return;
        const fileUrl = await uploadFile(resourceForm.file, `resources/${selectedLessonForResource}`);
        await supabase.from('lesson_resources').insert({ lesson_id: selectedLessonForResource, title: resourceForm.title, file_url: fileUrl, resource_type: resourceForm.resource_type });
        const lesson = lessons.find(l => l.id === selectedLessonForResource);
        if (lesson) fetchLessons(lesson.module_id);
      }
      setResourceForm({ title: '', file: null, resource_type: 'pdf' });
      setSelectedLessonForResource(null);
      setEditingResource(null);
    } catch (error) { alert('Error saving resource'); }
    finally { setUploading(false); }
  };

  const handleDeleteResource = async (resourceId: string, moduleId: string) => {
    if (!confirm('Delete this resource?')) return;
    await supabase.from('lesson_resources').delete().eq('id', resourceId);
    fetchLessons(moduleId);
  };

  const handleDeleteQuestion = async (questionId: string, lessonId: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('quiz_questions').delete().eq('id', questionId);
    fetchQuizData(lessonId);
  };

  const handleResetAttempts = async (lessonId: string, userId: string) => {
    if (!confirm("Reset this student's quiz attempts?")) return;
    await supabase.from('quiz_attempts').delete().eq('lesson_id', lessonId).eq('user_id', userId);
    fetchQuizData(lessonId);
  };

  return (
    <div className="space-y-8">

      {quizBuilderLesson && (
        <QuizBuilder
          lessonId={quizBuilderLesson.id}
          lessonTitle={quizBuilderLesson.title}
          onClose={() => { setQuizBuilderLesson(null); if (viewingQuizLesson) fetchQuizData(viewingQuizLesson); }}
        />
      )}

      {viewingQuizLesson && (
        <div className="fixed inset-0 bg-charcoal/80 z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-charcoal px-8 py-5 flex items-center justify-between sticky top-0">
              <h2 className="text-xl text-cream font-light italic" style={{ fontFamily: 'Playfair Display, serif' }}>Quiz Overview</h2>
              <button onClick={() => setViewingQuizLesson(null)} className="text-cream/40 hover:text-cream">✕</button>
            </div>
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-charcoal">Questions ({quizQuestions.length})</h3>
                  <button onClick={() => setQuizBuilderLesson({ id: viewingQuizLesson, title: 'Quiz' })} className="flex items-center gap-1 px-3 py-1.5 bg-charcoal text-cream text-xs hover:bg-mocha transition-colors">
                    <Plus className="w-3 h-3" /> Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {quizQuestions.map((q, i) => (
                    <div key={q.id} className="border border-mocha/15 p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-sm text-charcoal"><span className="text-mocha/40 mr-2">{i + 1}.</span>{q.question}</p>
                        <button onClick={() => handleDeleteQuestion(q.id, viewingQuizLesson)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['a', 'b', 'c', 'd'].map(opt => (
                          <div key={opt} className={`px-3 py-1.5 text-xs flex items-center gap-2 ${q.correct_answer === opt.toUpperCase() ? 'bg-charcoal text-cream' : 'bg-cream text-mocha/60'}`}>
                            <span className="font-medium">{opt.toUpperCase()}.</span>
                            {q[`option_${opt}` as keyof QuizQuestion]}
                            {q.correct_answer === opt.toUpperCase() && <span className="ml-auto">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizQuestions.length === 0 && <p className="text-xs text-mocha/40 text-center py-4">No questions yet</p>}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-charcoal mb-4">Student Attempts ({quizAttempts.length})</h3>
                <div className="space-y-3">
                  {quizAttempts.map(attempt => (
                    <div key={attempt.id} className="border border-mocha/15 p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-charcoal">{attempt.profiles?.full_name || 'Student'}</p>
                          <p className="text-xs text-mocha/50">{attempt.profiles?.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 ${attempt.passed ? 'bg-charcoal text-cream' : 'bg-red-100 text-red-600'}`}>
                              {attempt.passed ? 'Passed' : 'Failed'} — {attempt.score}%
                            </span>
                            <span className="text-xs text-mocha/40">Attempt #{attempt.attempt_number}</span>
                            <span className="text-xs text-mocha/40">{new Date(attempt.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setViewingAttempts(viewingAttempts === attempt.id ? null : attempt.id)} className="text-xs px-2 py-1 border border-mocha/20 text-mocha hover:bg-mocha hover:text-cream transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Answers
                          </button>
                          <button onClick={() => handleResetAttempts(viewingQuizLesson, attempt.user_id)} className="text-xs px-2 py-1 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Reset</button>
                        </div>
                      </div>
                      {viewingAttempts === attempt.id && attempt.answers && (
                        <div className="mt-3 space-y-2 border-t border-mocha/10 pt-3">
                          {quizQuestions.map((q, i) => {
                            const studentAnswer = attempt.answers[q.id];
                            const isCorrect = studentAnswer === q.correct_answer;
                            return (
                              <div key={q.id} className={`p-3 text-xs ${isCorrect ? 'bg-linen' : 'bg-red-50'}`}>
                                <p className="text-charcoal mb-1">{i + 1}. {q.question}</p>
                                <p className={isCorrect ? 'text-mocha' : 'text-red-500'}>
                                  Student answered: <span className="font-medium">{q[`option_${studentAnswer?.toLowerCase()}` as keyof QuizQuestion] || 'No answer'}</span>
                                  {!isCorrect && <span className="text-mocha ml-2">· Correct: {q[`option_${q.correct_answer.toLowerCase()}` as keyof QuizQuestion]}</span>}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {quizAttempts.length === 0 && <p className="text-xs text-mocha/40 text-center py-4">No attempts yet</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSES */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl text-charcoal">Courses</h2>
          <button onClick={() => { setEditingCourse(null); setCourseForm({ title: '', description: '', thumbnail: null }); setShowCourseForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors">
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {showCourseForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSaveCourse} className="bg-linen p-6 rounded-xl mb-6 space-y-4">
            <h3 className="font-medium text-charcoal">{editingCourse ? 'Edit Course' : 'New Course'}</h3>
            <div><label className="block text-sm font-medium text-charcoal mb-2">Title</label><input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-2">Description</label><textarea required value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows={4} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-2">Thumbnail {editingCourse && '(leave empty to keep current)'}</label><input type="file" accept="image/*" onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.files?.[0] || null })} className={inputClass} /></div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50"><Save className="w-4 h-4" />{uploading ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="p-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </motion.form>
        )}

        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className={`p-4 rounded-xl border-2 transition-all ${selectedCourse === course.id ? 'border-mocha bg-mocha/5' : 'border-mocha/20 hover:border-mocha/40'}`}>
              <div className="flex items-center justify-between">
                <div onClick={() => setSelectedCourse(course.id)} className="flex-1 cursor-pointer">
                  <h3 className="font-medium text-charcoal">{course.title}</h3>
                  <p className="text-xs text-mocha-dark line-clamp-1">{course.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); setEditingCourse(course); setCourseForm({ title: course.title, description: course.description, thumbnail: null }); setShowCourseForm(true); }} className="p-2 text-mocha hover:bg-mocha/10 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODULES & LESSONS */}
      {selectedCourse && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl text-charcoal">Modules & Lessons</h2>
            <button onClick={() => { setEditingModule(null); setModuleForm({ title: '', description: '' }); setShowModuleForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors">
              <Plus className="w-4 h-4" /> New Module
            </button>
          </div>

          {showModuleForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSaveModule} className="bg-linen p-6 rounded-xl mb-6 space-y-4">
              <h3 className="font-medium text-charcoal">{editingModule ? 'Edit Module' : 'New Module'}</h3>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Title</label><input type="text" required value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Description</label><textarea required value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} rows={3} className={inputClass} /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50"><Save className="w-4 h-4" />{uploading ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowModuleForm(false); setEditingModule(null); }} className="p-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </motion.form>
          )}

          {showLessonForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSaveLesson} className="bg-linen p-6 rounded-xl mb-6 space-y-4">
              <h3 className="font-medium text-charcoal">{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h3>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Title</label><input type="text" required value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Description</label><textarea required value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} rows={3} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Duration (minutes)</label><input type="number" required min="1" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-charcoal mb-2">Video File {editingLesson && '(leave empty to keep current)'}</label><input type="file" accept="video/*" onChange={e => setLessonForm({ ...lessonForm, video: e.target.files?.[0] || null })} className={inputClass} /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50"><Save className="w-4 h-4" />{uploading ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowLessonForm(false); setEditingLesson(null); setSelectedModuleForLesson(null); }} className="p-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {modules.map(module => (
              <div key={module.id} className="border border-mocha/20 rounded-xl overflow-hidden">
                <div className="p-4 bg-linen flex items-center justify-between">
                  <div onClick={() => { setExpandedModule(expandedModule === module.id ? null : module.id); if (expandedModule !== module.id) fetchLessons(module.id); }} className="flex-1 cursor-pointer flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-charcoal">{module.title}</h3>
                      <p className="text-sm text-mocha-dark">{module.description}</p>
                    </div>
                    {expandedModule === module.id ? <ChevronUp className="w-5 h-5 text-mocha" /> : <ChevronDown className="w-5 h-5 text-mocha" />}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={e => { e.stopPropagation(); setEditingModule(module); setModuleForm({ title: module.title, description: module.description }); setShowModuleForm(true); }} className="p-2 text-mocha hover:bg-mocha/10 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteModule(module.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {expandedModule === module.id && (
                  <div className="p-4 space-y-4">
                    <button onClick={() => { setEditingLesson(null); setLessonForm({ title: '', description: '', duration: '', video: null }); setSelectedModuleForLesson(module.id); setShowLessonForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-charcoal text-cream hover:bg-mocha transition-colors text-sm">
                      <Plus className="w-4 h-4" /> Add Lesson
                    </button>

                    {lessons.filter(l => l.module_id === module.id).map(lesson => (
                      <div key={lesson.id} className="bg-cream p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-charcoal flex items-center gap-2">
                              {lesson.video_url ? <Video className="w-4 h-4 text-mocha" /> : <FileText className="w-4 h-4 text-mocha" />}
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-mocha-dark mt-0.5">{lesson.duration} min{!lesson.video_url && ' • Slides only'}</p>
                          </div>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            <button onClick={() => { setEditingLesson(lesson); setLessonForm({ title: lesson.title, description: lesson.description, duration: lesson.duration?.toString() || '', video: null }); setShowLessonForm(true); }} className="text-xs px-2.5 py-1 border border-mocha/20 text-mocha hover:bg-mocha hover:text-cream transition-colors rounded flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => { setSelectedLessonForResource(lesson.id); setEditingResource(null); setResourceForm({ title: '', file: null, resource_type: 'pdf' }); }} className="text-xs px-2.5 py-1 bg-mocha text-cream hover:bg-mocha-dark transition-colors rounded flex items-center gap-1">
                              <Plus className="w-3 h-3" /> PDF
                            </button>
                            <button onClick={() => setQuizBuilderLesson({ id: lesson.id, title: lesson.title })} className="text-xs px-2.5 py-1 bg-charcoal text-cream hover:bg-mocha transition-colors rounded flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Quiz
                            </button>
                            <button onClick={() => { setViewingQuizLesson(lesson.id); fetchQuizData(lesson.id); }} className="text-xs px-2.5 py-1 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors rounded flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View Quiz
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id, module.id)} className="text-xs px-2.5 py-1 border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {(selectedLessonForResource === lesson.id || editingResource?.lesson_id === lesson.id) && (
                          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUploadResource} className="mt-3 p-3 bg-white rounded-lg space-y-3 border border-mocha/20">
                            <h5 className="text-sm font-medium text-charcoal">{editingResource ? 'Edit Resource' : 'Add Resource'}</h5>
                            <div><label className="block text-xs font-medium text-charcoal mb-1">Title</label><input type="text" required value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className={inputClass} /></div>
                            <div>
                              <label className="block text-xs font-medium text-charcoal mb-1">Type</label>
                              <select value={resourceForm.resource_type} onChange={e => setResourceForm({ ...resourceForm, resource_type: e.target.value })} className={inputClass}>
                                <option value="slides">Slides (viewable)</option>
                                <option value="audio">Voiceover Audio</option>
                                <option value="workbook">Workbook (downloadable)</option>
                                <option value="audio">Voiceover Audio</option>
                                <option value="pdf">PDF (downloadable)</option>
                                <option value="audio">Voiceover Audio</option>
                              </select>
                            </div>
                            <div><label className="block text-xs font-medium text-charcoal mb-1">File {editingResource && '(leave empty to keep current)'}</label><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })} className={inputClass} /></div>
                            <div className="flex gap-2">
                              <button type="submit" disabled={uploading} className="px-4 py-2 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50 text-sm">{uploading ? 'Saving...' : 'Save'}</button>
                              <button type="button" onClick={() => { setSelectedLessonForResource(null); setEditingResource(null); setResourceForm({ title: '', file: null, resource_type: 'pdf' }); }} className="px-4 py-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors text-sm">Cancel</button>
                            </div>
                          </motion.form>
                        )}

                        {resources.filter(r => r.lesson_id === lesson.id).map(resource => (
                          <div key={resource.id} className="mt-2 p-2 bg-linen rounded flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-mocha" />
                              <span className="text-charcoal">{resource.title}</span>
                              <span className="text-xs text-mocha-dark">({resource.resource_type})</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingResource(resource); setResourceForm({ title: resource.title, file: null, resource_type: resource.resource_type }); setSelectedLessonForResource(null); }} className="p-1 text-mocha hover:bg-mocha/10 rounded"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => handleDeleteResource(resource.id, module.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
