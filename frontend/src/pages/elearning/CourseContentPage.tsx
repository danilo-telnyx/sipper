/**
 * Course Content Page - View sections and track progress
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCourse, getCourseProgress, markSectionComplete, CourseWithSections } from '@/services/elearningService';

export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseWithSections | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        getCourse(courseId!),
        getCourseProgress(courseId!),
      ]);
      setCourse(courseData);
      const completed = new Set(
        progressData.filter((p: any) => p.completed).map((p: any) => p.section_id)
      );
      setCompletedSections(completed);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSection = async () => {
    if (!course) return;
    const section = course.sections[currentSectionIndex];
    
    try {
      await markSectionComplete(section.id);
      setCompletedSections(new Set(completedSections).add(section.id));
      
      // Move to next section or quiz
      if (currentSectionIndex < course.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      } else {
        // Course completed, go to exam
        navigate(`/elearning/exam/${courseId}`);
      }
    } catch (error) {
      console.error('Failed to mark section complete:', error);
    }
  };

  const currentSection = course?.sections[currentSectionIndex];
  const isCompleted = currentSection ? completedSections.has(currentSection.id) : false;

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Sections list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">{course.title}</h3>
            <div className="space-y-2">
              {course.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                    index === currentSectionIndex
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {completedSections.has(section.id) ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentSection?.title}
                </h2>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    Completed
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {course.sections.length}
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <ReactMarkdown>{currentSection?.content || ''}</ReactMarkdown>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={handleCompleteSection}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                {currentSectionIndex === course.sections.length - 1 ? 'Complete & Take Exam' : 'Next Section'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
