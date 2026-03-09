/**
 * Final Test - Full-screen modal with timer and question navigator
 */
import { useState, useEffect } from 'react';
import {
  Clock,
  X,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useELearning } from '@/contexts/ELearningContext';
import { cn } from '@/lib/utils';
import type { Question } from '@/contexts/ELearningContext';

interface FinalTestProps {
  sessionId: string;
  onComplete: (passed: boolean, score: number) => void;
  onCancel: () => void;
}

const TEST_DURATION_MINUTES = 30;
const PASS_THRESHOLD = 80;
const QUESTIONS_COUNT = 15; // Random selection from test bank

export default function FinalTest({
  sessionId,
  onComplete,
  onCancel,
}: FinalTestProps) {
  const { state, dispatch } = useELearning();
  
  // Select random questions from test bank
  const [testQuestions] = useState<Question[]>(() => {
    const allQuestions = state.courseData.questionBank.filter(
      (q) => !q.sectionId // Final test questions don't belong to sections
    );
    // Shuffle and take first QUESTIONS_COUNT
    return allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(QUESTIONS_COUNT, allQuestions.length));
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION_MINUTES * 60); // in seconds
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = testQuestions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex] || '';

  // Timer countdown
  useEffect(() => {
    if (showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
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
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = () => {
    // Calculate score
    const correctCount = testQuestions.filter(
      (q, idx) => answers[idx] === q.correctAnswer
    ).length;

    const score = (correctCount / testQuestions.length) * 100;
    const passed = score >= PASS_THRESHOLD;

    setShowResults(true);

    // Dispatch test completion
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        id: sessionId,
        updates: {
          score,
          progress: 100,
        },
      },
    });

    setTimeout(() => {
      onComplete(passed, score);
    }, 5000);
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (testQuestions.length === 0) {
    return (
      <Dialog open onOpenChange={onCancel}>
        <DialogContent className="max-w-md">
          <Card className="p-8 text-center border-0">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Test Available
            </h3>
            <p className="text-gray-600 mb-4">
              The final test is not configured yet.
            </p>
            <Button onClick={onCancel} variant="outline">
              Close
            </Button>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  if (showResults) {
    const correctCount = testQuestions.filter(
      (q, idx) => answers[idx] === q.correctAnswer
    ).length;
    const score = (correctCount / testQuestions.length) * 100;
    const passed = score >= PASS_THRESHOLD;

    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <Card className="p-8 text-center border-0">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
                passed ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              {passed ? (
                <Trophy className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {passed ? 'Congratulations!' : 'Test Incomplete'}
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              {passed
                ? 'You passed the final test! You can now generate your certificate.'
                : `You need ${PASS_THRESHOLD}% to pass. You can retry after reviewing the course material.`}
            </p>

            <div className="mb-8">
              <div className="text-6xl font-bold text-teal-600 mb-3">
                {Math.round(score)}%
              </div>
              <p className="text-gray-600 text-lg">
                {correctCount} out of {testQuestions.length} correct
              </p>
            </div>

            {passed && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-teal-600" />
                  <p className="font-semibold text-teal-900">
                    Certificate Unlocked!
                  </p>
                </div>
                <p className="text-sm text-teal-700">
                  You can now generate and download your completion certificate
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!passed && (
                <Button
                  onClick={onCancel}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  Review Course
                </Button>
              )}
              {passed && (
                <Button
                  onClick={() => onComplete(true, score)}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  Generate Certificate
                </Button>
              )}
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <h2 className="text-xl font-bold">Final Assessment</h2>
            
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progress */}
              <div className="text-sm">
                {getAnsweredCount()} / {testQuestions.length} answered
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Question Navigator Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {testQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigate(index)}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all',
                      index === currentQuestionIndex &&
                        'bg-teal-500 text-white ring-2 ring-teal-600',
                      index !== currentQuestionIndex &&
                        answers[index] &&
                        'bg-green-100 text-green-800 border border-green-300',
                      index !== currentQuestionIndex &&
                        !answers[index] &&
                        'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300">
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  disabled={getAnsweredCount() < testQuestions.length}
                >
                  Submit Test
                </Button>
                {getAnsweredCount() < testQuestions.length && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Answer all questions first
                  </p>
                )}
              </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <div className="mb-4">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {testQuestions.length}
                  </span>
                </div>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {currentQuestion.text}
                  </h3>

                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={handleAnswerSelect}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                          selectedAnswer === option
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer font-medium text-gray-900"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleQuestionNavigate(Math.max(0, currentQuestionIndex - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleQuestionNavigate(
                        Math.min(testQuestions.length - 1, currentQuestionIndex + 1)
                      )
                    }
                    disabled={currentQuestionIndex === testQuestions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <Dialog open onOpenChange={setShowSubmitConfirm}>
          <DialogContent className="max-w-md">
            <Card className="p-6 border-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Submit Final Test?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit? You won't be able to change your
                answers after submission.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmitTest();
                  }}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  Submit Test
                </Button>
              </div>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
