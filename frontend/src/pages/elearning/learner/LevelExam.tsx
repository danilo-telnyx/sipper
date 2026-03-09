/**
 * Level Exam Component - End-of-level assessments
 * Tests comprehension of all sections within a level
 */
import { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useELearning } from '@/contexts/ELearningContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LevelExamProps {
  sessionId: string;
  levelId: string;
  onComplete: (passed: boolean, score: number) => void;
  onCancel: () => void;
}

export default function LevelExam({
  sessionId,
  levelId,
  onComplete,
  onCancel,
}: LevelExamProps) {
  const { state, dispatch, getSectionsByLevel, getQuestionsBySection } = useELearning();
  
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const levelName = levelId.charAt(0).toUpperCase() + levelId.slice(1);
  const passingScore = levelId === 'basic' ? 70 : levelId === 'intermediate' ? 75 : 80;
  const questionCount = levelId === 'basic' ? 10 : levelId === 'intermediate' ? 15 : 20;

  // Initialize exam questions
  useEffect(() => {
    const levelSections = getSectionsByLevel(levelId);
    const allQuestions: any[] = [];

    // Collect all questions from sections in this level
    levelSections.forEach(section => {
      const sectionQuestions = getQuestionsBySection(section.id);
      allQuestions.push(...sectionQuestions);
    });

    // Randomly select questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);
    
    setExamQuestions(selected);
  }, [levelId, questionCount]);

  // Timer
  useEffect(() => {
    if (showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    examQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / examQuestions.length) * 100);
    const hasPassed = percentage >= passingScore;

    setScore(percentage);
    setPassed(hasPassed);
    setShowResults(true);

    // Update session with level exam result
    dispatch({
      type: 'COMPLETE_LEVEL_EXAM',
      payload: {
        sessionId,
        level: levelId as 'basic' | 'intermediate' | 'advanced',
        score: percentage,
      },
    });
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(1800);
    setShowResults(false);
    setScore(0);
    setPassed(false);

    // Re-shuffle questions
    const shuffled = examQuestions.sort(() => 0.5 - Math.random());
    setExamQuestions([...shuffled]);
  };

  const handleFinish = () => {
    onComplete(passed, score);
  };

  if (examQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Preparing your {levelName} level exam questions.</p>
        </Card>
      </div>
    );
  }

  // Results View
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-8">
        <Card className="p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            {passed ? (
              <>
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Congratulations! 🎉
                </h1>
                <p className="text-lg text-gray-600">
                  You passed the {levelName} Level Exam!
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Almost There!
                </h1>
                <p className="text-lg text-gray-600">
                  You need {passingScore}% to pass. Keep practicing!
                </p>
              </>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Your Score</span>
              <span className={cn(
                "text-2xl font-bold",
                passed ? "text-green-600" : "text-red-600"
              )}>
                {score}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Passing Score</span>
              <span className="text-xl font-semibold text-gray-900">
                {passingScore}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Correct Answers</span>
              <span className="text-xl font-semibold text-gray-900">
                {Math.round((score / 100) * examQuestions.length)} / {examQuestions.length}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            {!passed && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Exam
              </Button>
            )}
            <Button
              onClick={handleFinish}
              className={cn(
                "flex-1",
                passed 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  : "bg-gray-600 hover:bg-gray-700"
              )}
            >
              {passed ? (
                <>
                  Continue Learning
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Review Material'
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exam View
  const currentQuestion = examQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {levelName} Level Exam
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {examQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5" />
                <span className={cn(
                  "font-mono text-lg font-semibold",
                  timeRemaining < 300 && "text-red-600"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>{answeredCount} of {examQuestions.length} answered</span>
            <span>Passing score: {passingScore}%</span>
          </div>
        </Card>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <Badge className="mb-4 bg-teal-100 text-teal-800">
              {currentQuestion.difficulty.toUpperCase()}
            </Badge>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option: string, index: number) => {
              const isSelected = answers[currentQuestionIndex] === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      isSelected
                        ? "border-teal-500 bg-teal-500"
                        : "border-gray-300"
                    )}>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })}

            {currentQuestion.type === 'true_false' && (
              <>
                {['True', 'False'].map(option => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? "border-teal-500 bg-teal-500"
                            : "border-gray-300"
                        )}>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-gray-900 font-semibold">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-teal-300"
          >
            Previous
          </Button>

          {currentQuestionIndex === examQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < examQuestions.length}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Award className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              Next Question
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Answer Status Grid */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Answer Status</h3>
          <div className="grid grid-cols-10 gap-2">
            {examQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  "aspect-square rounded flex items-center justify-center text-sm font-semibold transition-all",
                  index === currentQuestionIndex
                    ? "bg-teal-500 text-white ring-2 ring-teal-300"
                    : answers[index]
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Badge component (if not already imported)
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
      {children}
    </span>
  );
}
