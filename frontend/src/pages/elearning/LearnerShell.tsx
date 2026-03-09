/**
 * Learner Shell - Integrated learner interface with all components
 * Complete isolation from admin mode - zero admin controls visible
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useELearning } from '@/contexts/ELearningContext';
import { Button } from '@/components/ui/button';

// Learner components
import LearnerSidebar from './learner/LearnerSidebar';
import ContentViewer from './learner/ContentViewer';
import SectionQuiz from './learner/SectionQuiz';
import FinalTest from './learner/FinalTest';
import Certificate from './learner/Certificate';

type View = 'content' | 'quiz' | 'final-test' | 'certificate';

export default function LearnerShell() {
  const navigate = useNavigate();
  const { logout } = useRole();
  const { state } = useELearning();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'courses' | 'progress' | 'certificates'>('courses');

  // Mock learner data - will be replaced with real session data
  const mockProgress = {
    completedSections: 3,
    totalSections: 15,
    currentLevel: 'basic',
    score: 85,
  };

  const progressPercentage = (mockProgress.completedSections / mockProgress.totalSections) * 100;

  const handleLogout = () => {
    logout();
    navigate('/elearning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-teal-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-teal-600"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-gray-900">My Learning</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-teal-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:relative lg:translate-x-0 z-30 w-64 bg-white border-r border-teal-200 shadow-lg lg:shadow-none h-full transition-transform duration-300`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-teal-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">My Learning</h2>
                  <p className="text-xs text-gray-500">Student Portal</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-teal-600">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{mockProgress.completedSections}/{mockProgress.totalSections} sections</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => setActiveView('courses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'courses'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-700 hover:bg-teal-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">My Courses</span>
              </button>

              <button
                onClick={() => setActiveView('progress')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'progress'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-700 hover:bg-teal-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">My Progress</span>
              </button>

              <button
                onClick={() => setActiveView('certificates')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'certificates'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-700 hover:bg-teal-50'
                }`}
              >
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Certificates</span>
              </button>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-teal-200">
              <Button
                variant="outline"
                className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit Learning
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Courses View */}
            {activeView === 'courses' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Courses
                  </h1>
                  <p className="text-gray-600">
                    Continue your learning journey
                  </p>
                </div>

                {/* Current Level Badge */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 mb-1">Current Level</p>
                      <h3 className="text-2xl font-bold capitalize">{mockProgress.currentLevel}</h3>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full">
                      <Award className="h-8 w-8" />
                    </div>
                  </div>
                </Card>

                {/* Course Sections */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Sections</h2>
                  
                  {state.courseData.sections.length === 0 ? (
                    <Card className="p-8 text-center border-teal-200">
                      <BookOpen className="h-12 w-12 text-teal-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No courses available yet</p>
                      <p className="text-sm text-gray-500">
                        Course content will be added by your instructor
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {state.courseData.sections.slice(0, 5).map((section, index) => (
                        <Card
                          key={section.id}
                          className="p-5 hover:shadow-lg transition-shadow border-teal-200 cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-teal-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {section.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {section.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  15 min
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Not started
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress View */}
            {activeView === 'progress' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Progress
                  </h1>
                  <p className="text-gray-600">
                    Track your learning achievements
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="p-6 border-teal-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      </div>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockProgress.completedSections}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">of {mockProgress.totalSections} sections</p>
                  </Card>

                  <Card className="p-6 border-teal-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-teal-600" />
                      </div>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockProgress.score}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">across all assessments</p>
                  </Card>

                  <Card className="p-6 border-teal-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Award className="h-5 w-5 text-teal-600" />
                      </div>
                      <p className="text-sm text-gray-600">Current Level</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 capitalize">
                      {mockProgress.currentLevel}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Keep learning to advance</p>
                  </Card>
                </div>

                <Card className="p-6 border-teal-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Learning Progress
                  </h3>
                  <Progress value={progressPercentage} className="h-3 mb-4" />
                  <p className="text-sm text-gray-600">
                    You've completed {Math.round(progressPercentage)}% of the course
                  </p>
                </Card>
              </div>
            )}

            {/* Certificates View */}
            {activeView === 'certificates' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Certificates
                  </h1>
                  <p className="text-gray-600">
                    Your earned achievements
                  </p>
                </div>

                <Card className="p-12 text-center border-teal-200">
                  <Trophy className="h-16 w-16 text-teal-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No certificates earned yet</p>
                  <p className="text-sm text-gray-500">
                    Complete courses to earn certificates
                  </p>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
