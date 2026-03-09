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
  const { state, dispatch } = useELearning();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>('content');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => {
    // Create or retrieve session
    const existingSessionId = Object.keys(state.learnerSessions)[0];
    if (existingSessionId) {
      return existingSessionId;
    }

    // Create new session
    const newSessionId = `session-${Date.now()}`;
    dispatch({
      type: 'CREATE_SESSION',
      payload: {
        id: newSessionId,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        currentSectionId: null,
        completedSections: [],
        answers: {},
        score: 0,
        progress: 0,
      },
    });
    return newSessionId;
  });

  const session = state.learnerSessions[sessionId];
  const sections = state.courseData.sections.sort((a, b) => a.order - b.order);
  const currentSection = currentSectionId
    ? sections.find((s) => s.id === currentSectionId)
    : null;

  // Auto-select first section on mount
  useEffect(() => {
    if (!currentSectionId && sections.length > 0) {
      setCurrentSectionId(sections[0].id);
      dispatch({
        type: 'UPDATE_SESSION',
        payload: {
          id: sessionId,
          updates: {
            currentSectionId: sections[0].id,
          },
        },
      });
    }
  }, [sections, currentSectionId, sessionId, dispatch]);

  const handleSectionSelect = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentView('content');
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        id: sessionId,
        updates: {
          currentSectionId: sectionId,
        },
      },
    });
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed) {
      // Move to next section
      const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        setCurrentSectionId(nextSection.id);
        setCurrentView('content');
      } else {
        setCurrentView('content');
      }
    } else {
      // Stay on current section to review
      setCurrentView('content');
    }
  };

  const handleStartFinalTest = () => {
    setCurrentView('final-test');
  };

  const handleFinalTestComplete = (passed: boolean, score: number) => {
    if (passed) {
      setCurrentView('certificate');
    } else {
      setCurrentView('content');
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSectionId(prevSection.id);
    }
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSectionId(nextSection.id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/elearning');
  };

  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sections.length - 1;
  const isQuizCompleted = session?.completedSections.includes(currentSectionId || '') || false;

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
          } fixed lg:relative lg:translate-x-0 z-30 w-80 bg-white border-r border-teal-200 shadow-lg lg:shadow-none h-full transition-transform duration-300`}
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
            </div>

            {/* Learner Sidebar Content */}
            <LearnerSidebar
              sessionId={sessionId}
              currentSectionId={currentSectionId}
              onSectionSelect={handleSectionSelect}
              onFinalTestClick={handleStartFinalTest}
            />

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
          <div className="h-full">
            {/* Content View */}
            {currentView === 'content' && currentSection && (
              <ContentViewer
                section={currentSection}
                onPrevious={handlePreviousSection}
                onNext={handleNextSection}
                onStartQuiz={handleStartQuiz}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                isQuizCompleted={isQuizCompleted}
              />
            )}

            {/* Quiz View */}
            {currentView === 'quiz' && currentSectionId && (
              <div className="p-8">
                <SectionQuiz
                  sectionId={currentSectionId}
                  sessionId={sessionId}
                  onComplete={handleQuizComplete}
                  onClose={() => setCurrentView('content')}
                />
              </div>
            )}

            {/* Final Test Modal */}
            {currentView === 'final-test' && (
              <FinalTest
                sessionId={sessionId}
                onComplete={handleFinalTestComplete}
                onCancel={() => setCurrentView('content')}
              />
            )}

            {/* Certificate View */}
            {currentView === 'certificate' && (
              <div className="p-8">
                <div className="max-w-5xl mx-auto">
                  <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Your Certificate
                  </h1>
                  <Certificate
                    sessionId={sessionId}
                    learnerName="Learner" // Would come from user context in production
                    score={session?.score || 0}
                    completionDate={new Date().toISOString()}
                    onClose={() => setCurrentView('content')}
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!currentSection && currentView === 'content' && (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <GraduationCap className="h-16 w-16 text-teal-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    No Course Content Available
                  </h2>
                  <p className="text-gray-600">
                    Course sections will appear here once they're added by your instructor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
