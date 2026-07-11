import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Upload, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Video, Save, X } from 'lucide-react';
import { QuizBuilder } from './QuizBuilder';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  order_index: number;
}

interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  resource_type: string;
}

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
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<string | null>(null);
  const [selectedLessonForResource, setSelectedLessonForResource] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [quizBuilderLesson, setQuizBuilderLesson] = useState<{id: string, title: string} | null>(null);
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: null as File | null,
  });

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    video: null as File | null,
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    file: null as File | null,
    resource_type: 'pdf',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCourses(data);
  };

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    if (data) setModules(data);
  };

  const fetchLessons = async (moduleId: string) => {
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });
    if (lessonsData) setLessons(lessonsData);

    // Fetch resources for all lessons in this module
    const { data: resourcesData } = await supabase
      .from('lesson_resources')
      .select('*')
      .in('lesson_id', lessonsData?.map(l => l.id) || []);
    if (resourcesData) setResources(resourcesData);
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log('Uploading file to:', filePath);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      const { data } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let thumbnailUrl = editingCourse?.thumbnail_url || '';
      if (courseForm.thumbnail) {
        thumbnailUrl = await uploadFile(courseForm.thumbnail, 'thumbnails');
      }

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            title: courseForm.title,
            description: courseForm.description,
            price: 697,
            thumbnail_url: thumbnailUrl,
          })
          .eq('id', editingCourse.id);

        if (error) throw error;
      } else {
        // Create new course
        const { error } = await supabase.from('courses').insert({
          title: courseForm.title,
          description: courseForm.description,
          price: 697,
          thumbnail_url: thumbnailUrl,
          is_published: true,
        });

        if (error) throw error;
      }

      setCourseForm({ title: '', description: '', price: '', thumbnail: null });
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    } finally {
      setUploading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      thumbnail: null,
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all modules, lessons, and resources.')) {
      return;
    }

    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      if (selectedCourse === courseId) {
        setSelectedCourse(null);
      }
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons and resources.')) {
      return;
    }

    try {
      const { error } = await supabase.from('course_modules').delete().eq('id', moduleId);
      if (error) throw error;

      if (selectedCourse) fetchModules(selectedCourse);
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Error deleting module');
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;

      fetchLessons(moduleId);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting lesson');
    }
  };

  const handleDeleteResource = async (resourceId: string, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const { error } = await supabase.from('lesson_resources').delete().eq('id', resourceId);
      if (error) throw error;

      fetchLessons(moduleId);
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setUploading(true);
    try {
      const { error } = await supabase.from('course_modules').insert({
        course_id: selectedCourse,
        title: moduleForm.title,
        description: moduleForm.description,
        order_index: modules.length,
      });

      if (error) throw error;

      setModuleForm({ title: '', description: '' });
      setShowModuleForm(false);
      fetchModules(selectedCourse);
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error creating module');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleForLesson) return;

    setUploading(true);
    try {
      let videoUrl = null;
      if (lessonForm.video) {
        console.log('Uploading video:', lessonForm.video.name);
        videoUrl = await uploadFile(lessonForm.video, `videos/${selectedModuleForLesson}`);
        console.log('Video uploaded successfully:', videoUrl);
      }

      const moduleLessons = lessons.filter(l => l.module_id === selectedModuleForLesson);

      console.log('Creating lesson in database...');
      const { error } = await supabase.from('lessons').insert({
        module_id: selectedModuleForLesson,
        title: lessonForm.title,
        description: lessonForm.description,
        video_url: videoUrl,
        duration: parseInt(lessonForm.duration),
        order_index: moduleLessons.length,
      });

      if (error) throw error;

      setLessonForm({ title: '', description: '', duration: '', video: null });
      setShowLessonForm(false);
      const savedModuleId = selectedModuleForLesson;
      setSelectedModuleForLesson(null);
      fetchLessons(savedModuleId);
      alert('Lesson created successfully! You can now add PDF slides/resources to it.');
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      alert(`Error creating lesson: ${error.message || 'Unknown error'}\n\nCheck the browser console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonForResource || !resourceForm.file) return;

    setUploading(true);
    try {
      const fileUrl = await uploadFile(
        resourceForm.file,
        `resources/${selectedLessonForResource}`
      );

      const { error } = await supabase.from('lesson_resources').insert({
        lesson_id: selectedLessonForResource,
        title: resourceForm.title,
        file_url: fileUrl,
        resource_type: resourceForm.resource_type,
      });

      if (error) throw error;

      setResourceForm({ title: '', file: null, resource_type: 'pdf' });
      setSelectedLessonForResource(null);

      // Refetch resources
      const lesson = lessons.find(l => l.id === selectedLessonForResource);
      if (lesson) fetchLessons(lesson.module_id);
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Error uploading resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    {quizBuilderLesson && (
  <QuizBuilder
    lessonId={quizBuilderLesson.id}
    lessonTitle={quizBuilderLesson.title}
    onClose={() => setQuizBuilderLesson(null)}
  />
)}    <div className="space-y-8">
      {/* Course Creation */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl text-charcoal">Courses</h2>
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Course
          </button>
        </div>

        {showCourseForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleCreateCourse}
            className="bg-linen p-6 rounded-xl mb-6 space-y-4"
          >
            <h3 className="font-medium text-charcoal mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Course Title</label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
              <textarea
                required
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Thumbnail Image {editingCourse && '(leave empty to keep current)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
              />
              {editingCourse?.thumbnail_url && (
                <div className="mt-2">
                  <img
                    src={editingCourse.thumbnail_url}
                    alt="Current thumbnail"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-mocha-dark mt-1">Current thumbnail</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50"
              >
                {uploading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(null);
                  setCourseForm({ title: '', description: '', price: '', thumbnail: null });
                }}
                className="px-6 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCourse === course.id
                  ? 'border-mocha bg-mocha/5'
                  : 'border-mocha/20 hover:border-mocha/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setSelectedCourse(course.id)}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="font-medium text-charcoal">{course.title}</h3>
                  <p className="text-sm text-mocha-dark">${course.price}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    className="p-2 text-mocha hover:bg-mocha/10 rounded transition-colors"
                    title="Edit course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module & Lesson Management */}
      {selectedCourse && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl text-charcoal">Modules & Lessons</h2>
            <button
              onClick={() => setShowModuleForm(!showModuleForm)}
              className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Module
            </button>
          </div>

          {showModuleForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCreateModule}
              className="bg-linen p-6 rounded-xl mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                <textarea
                  required
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Creating...' : 'Create Module'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModuleForm(false)}
                  className="px-6 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-mocha/20 rounded-xl overflow-hidden">
                <div className="p-4 bg-linen flex items-center justify-between hover:bg-linen/80 transition-colors">
                  <div
                    onClick={() => {
                      setExpandedModule(expandedModule === module.id ? null : module.id);
                      if (expandedModule !== module.id) fetchLessons(module.id);
                    }}
                    className="flex-1 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-charcoal">{module.title}</h3>
                      <p className="text-sm text-mocha-dark">{module.description}</p>
                    </div>
                    {expandedModule === module.id ? (
                      <ChevronUp className="w-5 h-5 text-mocha" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-mocha" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(module.id);
                    }}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {expandedModule === module.id && (
                  <div className="p-4 space-y-4">
                    <button
                      onClick={() => {
                        setSelectedModuleForLesson(module.id);
                        setShowLessonForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-charcoal text-cream hover:bg-mocha transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </button>

                    {showLessonForm && selectedModuleForLesson === module.id && (
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleCreateLesson}
                        className="bg-cream p-4 rounded-lg space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">Lesson Title</label>
                          <input
                            type="text"
                            required
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
                          <textarea
                            required
                            value={lessonForm.description}
                            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">Duration (in minutes)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g., 15"
                            min="1"
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                            className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                          />
                          <p className="text-xs text-mocha-dark mt-1">Enter number only (e.g., 15 for 15 minutes)</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">Video File (optional)</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setLessonForm({ ...lessonForm, video: e.target.files?.[0] || null })}
                            className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                          />
                          <p className="text-xs text-mocha-dark mt-1">You can add a video now or upload PDF slides only</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50 text-sm"
                          >
                            {uploading ? 'Uploading...' : 'Create Lesson'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLessonForm(false);
                              setSelectedModuleForLesson(null);
                            }}
                            className="px-4 py-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {lessons
                      .filter((l) => l.module_id === module.id)
                      .map((lesson) => (
                        <div key={lesson.id} className="bg-cream p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-charcoal flex items-center gap-2">
                                {lesson.video_url ? (
                                  <Video className="w-4 h-4 text-mocha" />
                                ) : (
                                  <FileText className="w-4 h-4 text-mocha" />
                                )}
                                {lesson.title}
                              </h4>
                              <p className="text-sm text-mocha-dark">
                                {lesson.duration} minutes
                                {!lesson.video_url && ' • PDF/Slides only'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedLessonForResource(lesson.id)}
                                className="text-sm px-3 py-1 bg-mocha text-cream hover:bg-mocha-dark transition-colors rounded flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add PDF/Resource
                                <button
  onClick={() => setQuizBuilderLesson({ id: lesson.id, title: lesson.title })}
  className="text-sm px-3 py-1 bg-charcoal text-cream hover:bg-mocha transition-colors rounded flex items-center gap-1"
>
  <Plus className="w-3 h-3" />
  Add Quiz
</button>                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete lesson"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {selectedLessonForResource === lesson.id && (
                            <motion.form
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onSubmit={handleUploadResource}
                              className="mt-3 p-3 bg-white rounded-lg space-y-3 border border-mocha/20"
                            >
                              <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Resource Title</label>
                                <input
                                  type="text"
                                  required
                                  value={resourceForm.title}
                                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                  className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Type</label>
                                <select
                                  value={resourceForm.resource_type}
                                  onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                                  className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                                >
                                  <option value="slides">Slides (viewable in course)</option>
                                  <option value="workbook">Workbook (downloadable)</option>
                                  <option value="pdf">PDF Resource (downloadable)</option>
                                </select>
                                <p className="text-xs text-mocha-dark mt-1">
                                  {resourceForm.resource_type === 'slides'
                                    ? 'Students will view these slides in the lesson with navigation'
                                    : 'Students can download this file'}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">File</label>
                                <input
                                  type="file"
                                  required
                                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                                  onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })}
                                  className="w-full px-3 py-2 border border-mocha/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha text-sm"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={uploading}
                                  className="px-4 py-2 bg-charcoal text-cream hover:bg-mocha transition-colors disabled:opacity-50 text-sm"
                                >
                                  {uploading ? 'Uploading...' : 'Upload Resource'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedLessonForResource(null)}
                                  className="px-4 py-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </motion.form>
                          )}

                          {resources
                            .filter((r) => r.lesson_id === lesson.id)
                            .map((resource) => (
                              <div
                                key={resource.id}
                                className="mt-2 p-2 bg-linen rounded flex items-center justify-between gap-2 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-mocha" />
                                  <span className="text-charcoal">{resource.title}</span>
                                  <span className="text-xs text-mocha-dark">({resource.resource_type})</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteResource(resource.id, module.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete resource"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
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
