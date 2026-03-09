/**
 * Question Editor Component
 * Reusable form for creating and editing quiz questions
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuizQuestion } from '@/contexts/ELearningAdminContext';

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: QuizQuestion;
  sectionId?: string;
  onSave: (question: Omit<QuizQuestion, 'id'>) => void;
}

export default function QuestionEditor({
  open,
  onOpenChange,
  question,
  sectionId,
  onSave,
}: QuestionEditorProps) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'mcq-4' | 'true-false' | 'trace'>('mcq-4');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState('');
  
  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setQuestionType(question.question_type);
      setOptions(question.options);
      setCorrectAnswer(question.correct_answer);
      setExplanation(question.explanation || '');
      setDifficulty(question.difficulty);
      setTopic(question.topic || '');
    } else {
      resetForm();
    }
  }, [question, open]);
  
  const resetForm = () => {
    setQuestionText('');
    setQuestionType('mcq-4');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setExplanation('');
    setDifficulty('medium');
    setTopic('');
  };
  
  const handleTypeChange = (type: 'mcq-4' | 'true-false' | 'trace') => {
    setQuestionType(type);
    if (type === 'true-false') {
      setOptions(['True', 'False']);
    } else if (type === 'trace') {
      setOptions(['']);
    } else {
      setOptions(['', '', '', '']);
    }
    setCorrectAnswer('');
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const addOption = () => {
    setOptions([...options, '']);
  };
  
  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const handleSave = () => {
    const newQuestion: Omit<QuizQuestion, 'id'> = {
      section_id: sectionId,
      question_text: questionText,
      question_type: questionType,
      options,
      correct_answer: correctAnswer,
      explanation: explanation || undefined,
      difficulty,
      topic: topic || undefined,
      is_active: question?.is_active ?? true,
      is_in_final_bank: question?.is_in_final_bank ?? false,
    };
    onSave(newQuestion);
    onOpenChange(false);
    resetForm();
  };
  
  const isValid = 
    questionText.trim() &&
    options.every(o => o.trim()) &&
    correctAnswer.trim();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Create New Question'}</DialogTitle>
          <DialogDescription>
            Configure the question details, options, and correct answer
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Enter the question..."
            />
          </div>
          
          {/* Question Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <Select value={questionType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq-4">Multiple Choice (4 options)</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="trace">SIP Trace Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic (optional)
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., SIP Registration, Authentication, etc."
            />
          </div>
          
          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options *
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                    disabled={questionType === 'true-false'}
                  />
                  {questionType === 'mcq-4' && options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {questionType === 'mcq-4' && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                Add Option
              </Button>
            )}
          </div>
          
          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            {questionType === 'trace' ? (
              <Textarea
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                rows={3}
                placeholder="Enter the correct trace analysis or expected pattern..."
              />
            ) : (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option, index) => (
                    <SelectItem key={index} value={option} disabled={!option.trim()}>
                      {String.fromCharCode(65 + index)}. {option || '(empty)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (optional)
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {question ? 'Update' : 'Create'} Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
