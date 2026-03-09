/**
 * Section Quiz - Interactive quiz with immediate feedback and retry logic
 */
import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useELearning } from '@/contexts/ELearningContext';
import { cn } from '@/lib/utils';
import type { Question } from '@/contexts/ELearningContext';

interface SectionQuizProps {
  sectionId: string;
  sessionId: string;
  onComplete: (passed: boolean, score: number) => void;
  onClose: () => void;
}

const PASS_THRESHOLD = 80; // 80% to pass

export default function SectionQuiz({
  sectionId,
  sessionId,
  onComplete,
  onClose,
}: SectionQuizProps) {
  const { state, getQuestionsBySection, dispatch } = useELearning();
  
  const questions = getQuestionsBySection(sectionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
  }, [currentQuestionIndex]);

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Save answer
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        sessionId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      },
    });

    // Store answer for scoring
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score
      const correctCount = Object.keys(answers).filter(
        (idx) => answers[parseInt(idx)] === questions[parseInt(idx)].correctAnswer
      ).length + (isCorrect ? 1 : 0);

      const score = (correctCount / questions.length) * 100;
      const passed = score >= PASS_THRESHOLD;

      setShowResults(true);

      // Dispatch completion if passed
      if (passed) {
        dispatch({
          type: 'COMPLETE_SECTION',
          payload: { sessionId, sectionId },
        });
      }

      setTimeout(() => {
        onComplete(passed, score);
      }, 3000);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setAnswers({});
    setShowResults(false);
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Quiz Available
        </h3>
        <p className="text-gray-600 mb-4">
          This section doesn't have any quiz questions yet.
        </p>
        <Button onClick={onClose} variant="outline">
          Back to Content
        </Button>
      </Card>
    );
  }

  if (showResults) {
    const correctCount = Object.keys(answers).filter(
      (idx) => answers[parseInt(idx)] === questions[parseInt(idx)].correctAnswer
    ).length + (isCorrect ? 1 : 0);
    const score = (correctCount / questions.length) * 100;
    const passed = score >= PASS_THRESHOLD;

    return (
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div
          className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
            passed ? 'bg-green-100' : 'bg-red-100'
          )}
        >
          {passed ? (
            <Trophy className="h-10 w-10 text-green-600" />
          ) : (
            <XCircle className="h-10 w-10 text-red-600" />
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {passed ? 'Congratulations!' : 'Not Quite There'}
        </h2>

        <p className="text-gray-600 mb-6">
          {passed
            ? 'You passed the quiz! You can move to the next section.'
            : `You need ${PASS_THRESHOLD}% to pass. Review the content and try again.`}
        </p>

        <div className="mb-8">
          <div className="text-5xl font-bold text-teal-600 mb-2">
            {Math.round(score)}%
          </div>
          <p className="text-gray-600">
            {correctCount} out of {questions.length} correct
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {!passed && (
            <Button
              onClick={handleRestartQuiz}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Quiz
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            {passed ? 'Continue Learning' : 'Review Content'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-8 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.text}
        </h3>

        {/* Answer Options */}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          disabled={showFeedback}
          className="space-y-3"
        >
          {currentQuestion.options?.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                selectedAnswer === option && !showFeedback
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300',
                showFeedback &&
                  option === currentQuestion.correctAnswer &&
                  'border-green-500 bg-green-50',
                showFeedback &&
                  option === selectedAnswer &&
                  option !== currentQuestion.correctAnswer &&
                  'border-red-500 bg-red-50'
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

              {/* Feedback Icons */}
              {showFeedback && option === currentQuestion.correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
              {showFeedback &&
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
            </div>
          ))}
        </RadioGroup>

        {/* Feedback Message */}
        {showFeedback && (
          <div
            className={cn(
              'mt-6 p-4 rounded-lg border-l-4',
              isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            )}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={cn(
                    'font-semibold mb-1',
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  )}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                <p
                  className={cn(
                    'text-sm',
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  )}
                >
                  {isCorrect
                    ? 'Great job! Click Next to continue.'
                    : `The correct answer is: ${currentQuestion.correctAnswer}. You can retry this question or move on.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onClose}>
          Exit Quiz
        </Button>

        <div className="flex gap-3">
          {showFeedback && !isCorrect && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-teal-300 text-teal-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Question
            </Button>
          )}

          {showFeedback ? (
            <Button
              onClick={handleNext}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {isLastQuestion ? 'View Results' : 'Next Question'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-teal-500 hover:bg-teal-600"
            >
              Submit Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
