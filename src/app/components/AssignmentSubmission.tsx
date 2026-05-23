import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  max_score: number;
}

interface Submission {
  id: string;
  submission_text: string;
  file_url: string | null;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded' | 'resubmit';
}

export const AssignmentSubmission = ({ lessonId }: { lessonId: string }) => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [lessonId]);

  const fetchAssignment = async () => {
    try {
      // Get assignment
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (assignmentData) {
        setAssignment(assignmentData);

        // Get existing submission
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentData.id)
          .eq('user_id', user?.id)
          .single();

        if (submissionData) {
          setSubmission(submissionData);
          setSubmissionText(submissionData.submission_text || '');
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignment) return;

    setUploading(true);
    try {
      let fileUrl = null;

      // Upload file if provided
      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        const fileName = `${user.id}-${assignment.id}-${Date.now()}.${fileExt}`;
        const filePath = `assignments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, submissionFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);

        fileUrl = data.publicUrl;
      }

      const { error } = await supabase.from('submissions').upsert({
        assignment_id: assignment.id,
        user_id: user.id,
        submission_text: submissionText,
        file_url: fileUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert('Assignment submitted successfully!');
      setSubmissionText('');
      setSubmissionFile(null);
      fetchAssignment();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-mocha/10 rounded-full flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-mocha" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-2xl text-charcoal mb-2">
            {assignment.title}
          </h3>
          <p className="text-mocha-dark mb-4">{assignment.description}</p>
          {assignment.due_date && (
            <div className="text-sm text-mocha-dark">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {submission?.status === 'graded' ? (
        <div className="bg-mocha/10 border border-mocha/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-mocha" />
            <h4 className="font-medium text-charcoal">Assignment Graded</h4>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-mocha-dark">Score:</span>
              <div className="text-2xl font-serif text-charcoal">
                {submission.score}/{assignment.max_score}
              </div>
            </div>
            {submission.feedback && (
              <div>
                <span className="text-sm text-mocha-dark block mb-2">
                  Instructor Feedback:
                </span>
                <div className="bg-cream rounded-lg p-4 text-mocha-dark">
                  {submission.feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : submission?.status === 'submitted' ? (
        <div className="bg-linen border border-mocha/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-6 h-6 text-mocha" />
            <h4 className="font-medium text-charcoal">Submission Received</h4>
          </div>
          <p className="text-mocha-dark mb-4">
            Your assignment has been submitted and is awaiting review.
          </p>

          {submission.submission_text && (
            <div className="bg-white rounded-lg p-4 mb-3">
              <p className="text-sm text-charcoal whitespace-pre-wrap">
                {submission.submission_text}
              </p>
            </div>
          )}

          {submission.file_url && (
            <div className="bg-white rounded-lg p-4 mb-3">
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mocha hover:text-mocha-dark flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Submitted File
              </a>
            </div>
          )}

          <div className="text-sm text-mocha-dark">
            Submitted: {new Date(submission.submitted_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Written Response (Optional)
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha resize-none"
              placeholder="Enter your assignment response here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Upload File (PDF, Photo, or Video)
            </label>
            <div className="border-2 border-dashed border-mocha/30 rounded-lg p-6 text-center hover:border-mocha/50 transition-colors">
              <input
                type="file"
                accept="image/*,video/*,.pdf"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                className="hidden"
                id={`file-upload-${assignment.id}`}
              />
              <label
                htmlFor={`file-upload-${assignment.id}`}
                className="cursor-pointer"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-mocha" />
                <p className="text-mocha-dark mb-1">
                  {submissionFile
                    ? submissionFile.name
                    : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-mocha-dark">
                  PDF, PNG, JPG, MP4 (max 100MB)
                </p>
              </label>
            </div>
          </div>

          <div className="bg-linen border border-mocha/20 rounded-lg p-4">
            <p className="text-sm text-mocha-dark">
              💡 You can submit a written response, upload a file, or both. At least one is required.
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || (!submissionText.trim() && !submissionFile)}
            className="px-6 py-3 bg-mocha text-white rounded-full hover:bg-mocha-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </motion.div>
  );
};
