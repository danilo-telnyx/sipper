/**
 * E-Learning Courses List Page
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, Circle } from 'lucide-react';
import { listCourses, getMyProgress, Course, CourseProgress } from '@/services/elearningService';

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, progressData] = await Promise.all([
        listCourses(),
        getMyProgress(),
      ]);
      setCourses(coursesData);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForCourse = (courseId: string): CourseProgress | undefined => {
    return progress.find((p) => p.course_id === courseId);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SIP Training & Certification</h1>
        <p className="text-gray-600">
          Master Session Initiation Protocol through our comprehensive 3-level course system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const courseProgress = getProgressForCourse(course.id);
          const progressPercent = courseProgress?.progress_percentage || 0;
          const isCompleted = courseProgress?.certificate_id !== null;

          return (
            <Link
              key={course.id}
              to={`/elearning/courses/${course.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(
                      course.level
                    )}`}
                  >
                    {course.level.toUpperCase()}
                  </span>
                </div>
                {isCompleted && <Award className="h-6 w-6 text-yellow-500" />}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {course.description || 'No description available'}
              </p>

              {courseProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {courseProgress.completed_sections}/{courseProgress.total_sections} sections
                    </span>
                    {courseProgress.exam_passed ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Exam passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Circle className="h-4 w-4" />
                        Exam pending
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!courseProgress && (
                <div className="text-sm text-gray-500">
                  Click to start this course
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {progress.some((p) => p.certificate_id) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Certificates Earned</h3>
              <p className="text-sm text-gray-600">
                You have {progress.filter((p) => p.certificate_id).length} certificate(s).{' '}
                <Link to="/elearning/certificates" className="text-blue-600 hover:underline">
                  View all
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
