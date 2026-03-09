/**
 * Exam Page - Final 15-question exam
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import { getExamQuestions, submitExam, Question, ExamResult } from '@/services/elearningService';

export default function ExamPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) loadQuestions();
  }, [courseId]);

  const loadQuestions = async () => {
    try {
      const data = await getExamQuestions(courseId!);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const examResult = await submitExam(courseId!, answers);
      setResult(examResult);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading exam...</div>;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          {result.passed ? (
            <>
              <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-6">
                You passed the exam with {result.percentage.toFixed(1)}%
              </p>
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                <p className="text-green-800">
                  ✅ Score: {result.score}/{result.total_questions} correct
                </p>
                {result.certificate_id && (
                  <p className="text-green-800 mt-2">
                    🎓 Certificate issued! View in{' '}
                    <button
                      onClick={() => navigate('/elearning/certificates')}
                      className="underline font-semibold"
                    >
                      My Certificates
                    </button>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Not Quite There</h2>
              <p className="text-gray-600 mb-6">
                You scored {result.percentage.toFixed(1)}%. Need 70% to pass.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                <p className="text-red-800">
                  Score: {result.score}/{result.total_questions} correct
                </p>
                <p className="text-red-800 mt-2">
                  Review the course material and try again!
                </p>
              </div>
            </>
          )}
          <button
            onClick={() => navigate('/elearning/courses')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Exam - 15 Questions</h2>
        <p className="text-gray-600 mb-8">
          You need 70% (11/15) to pass and earn your certificate.
        </p>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border-b pb-6">
              <div className="font-semibold text-gray-900 mb-3">
                {index + 1}. {question.question_text}
              </div>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Answered: {Object.keys(answers).length}/{questions.length}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
