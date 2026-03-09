/**
 * Learner Sidebar - Section navigation tree with progress tracking
 */
import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Award,
} from 'lucide-react';
import { useELearning } from '@/contexts/ELearningContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LearnerSidebarProps {
  sessionId: string;
  currentSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onFinalTestClick: () => void;
}

export default function LearnerSidebar({
  sessionId,
  currentSectionId,
  onSectionSelect,
  onFinalTestClick,
}: LearnerSidebarProps) {
  const { state, getSectionsByLevel } = useELearning();
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(
    new Set(['basic'])
  );

  const session = state.learnerSessions[sessionId];
  const completedSections = session?.completedSections || [];
  const progress = session?.progress || 0;

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) {
        next.delete(levelId);
      } else {
        next.add(levelId);
      }
      return next;
    });
  };

  const getSectionStatus = (
    sectionId: string
  ): 'completed' | 'current' | 'locked' => {
    if (completedSections.includes(sectionId)) return 'completed';
    if (sectionId === currentSectionId) return 'current';
    return 'locked';
  };

  const getQuizStatus = (sectionId: string): string => {
    const status = getSectionStatus(sectionId);
    if (status === 'completed') return 'passed';
    if (status === 'current') return 'in-progress';
    if (status === 'locked') return 'locked';
    return 'not-started';
  };

  const allSectionsCompleted =
    completedSections.length === state.courseData.sections.length;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="p-4 border-b border-teal-200 bg-teal-50">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Course Progress</span>
            <span className="font-bold text-teal-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-600">
            {completedSections.length} of {state.courseData.sections.length}{' '}
            sections completed
          </p>
        </div>
      </div>

      {/* Section Tree */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.courseData.levels.map((level) => {
          const sections = getSectionsByLevel(level.id);
          const isExpanded = expandedLevels.has(level.id);

          return (
            <div key={level.id} className="space-y-2">
              {/* Level Header */}
              <button
                onClick={() => toggleLevel(level.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-teal-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-teal-600" />
                )}
                <span className="font-semibold text-teal-900 capitalize">
                  {level.name}
                </span>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-teal-200 text-teal-800"
                >
                  {sections.length}
                </Badge>
              </button>

              {/* Sections List */}
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {sections.map((section) => {
                    const status = getSectionStatus(section.id);
                    const quizStatus = getQuizStatus(section.id);
                    const isCurrent = section.id === currentSectionId;
                    const isLocked = status === 'locked';

                    return (
                      <button
                        key={section.id}
                        onClick={() => !isLocked && onSectionSelect(section.id)}
                        disabled={isLocked}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-all',
                          isCurrent &&
                            'bg-teal-500 text-white shadow-md',
                          !isCurrent &&
                            status === 'completed' &&
                            'bg-green-50 hover:bg-green-100',
                          !isCurrent &&
                            status === 'locked' &&
                            'opacity-50 cursor-not-allowed',
                          !isCurrent &&
                            status !== 'completed' &&
                            status !== 'locked' &&
                            'hover:bg-gray-100'
                        )}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {status === 'completed' && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {status === 'current' && (
                            <PlayCircle
                              className={cn(
                                'h-5 w-5',
                                isCurrent ? 'text-white' : 'text-teal-600'
                              )}
                            />
                          )}
                          {status === 'locked' && (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {/* Section Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              isCurrent && 'text-white',
                              !isCurrent && 'text-gray-900'
                            )}
                          >
                            {section.title}
                          </p>

                          {/* Quiz Status Badge */}
                          {quizStatus && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'mt-1 text-xs',
                                quizStatus === 'passed' &&
                                  'bg-green-100 text-green-800 border-green-300',
                                quizStatus === 'in-progress' &&
                                  'bg-yellow-100 text-yellow-800 border-yellow-300',
                                quizStatus === 'not-started' &&
                                  'bg-gray-100 text-gray-600 border-gray-300',
                                quizStatus === 'locked' &&
                                  'bg-gray-50 text-gray-400 border-gray-200'
                              )}
                            >
                              {quizStatus === 'passed' && 'Quiz Passed'}
                              {quizStatus === 'in-progress' && 'In Progress'}
                              {quizStatus === 'not-started' && 'Not Started'}
                              {quizStatus === 'locked' && 'Locked'}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Test Button */}
      <div className="p-4 border-t border-teal-200">
        <Button
          onClick={onFinalTestClick}
          disabled={!allSectionsCompleted}
          className={cn(
            'w-full',
            allSectionsCompleted
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          <Award className="h-5 w-5 mr-2" />
          {allSectionsCompleted ? 'Start Final Test' : 'Complete All Sections'}
        </Button>
        {!allSectionsCompleted && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Complete all sections to unlock
          </p>
        )}
      </div>
    </div>
  );
}
