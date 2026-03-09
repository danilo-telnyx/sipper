/**
 * Quiz Manager Module - A2
 * Manage section quizzes, final test bank, and pass/fail rules
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { useELearningAdmin, QuizQuestion } from '@/contexts/ELearningAdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuestionEditor from './QuestionEditor';

export default function QuizManagerModule() {
  const {
    sections,
    questions,
    sectionQuizConfigs,
    finalTestConfig,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleQuestionActive,
    toggleQuestionInBank,
    updateSectionQuizConfig,
    updateFinalTestConfig,
  } = useELearningAdmin();
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  
  const handleAddQuestion = (sectionId?: string) => {
    setEditingQuestion(undefined);
    setSelectedSectionId(sectionId || '');
    setEditorOpen(true);
  };
  
  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setSelectedSectionId(question.section_id || '');
    setEditorOpen(true);
  };
  
  const handleSaveQuestion = (questionData: Omit<QuizQuestion, 'id'>) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }
  };
  
  const getSectionQuestions = (sectionId: string) => {
    return questions.filter(q => q.section_id === sectionId);
  };
  
  const getActiveQuestions = (sectionId: string) => {
    return questions.filter(q => q.section_id === sectionId && q.is_active);
  };
  
  const getPoolQuestions = (sectionId: string) => {
    return questions.filter(q => q.section_id === sectionId && !q.is_active);
  };
  
  const getSectionConfig = (sectionId: string) => {
    return sectionQuizConfigs.find(c => c.section_id === sectionId) || {
      section_id: sectionId,
      pass_threshold: 2,
      allow_retries: true,
      max_retries: 3,
      active_questions: [],
      pool_questions: [],
    };
  };
  
  const getFilteredBankQuestions = () => {
    return questions.filter(q => {
      if (!q.is_in_final_bank) return false;
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      if (filterType !== 'all' && q.question_type !== filterType) return false;
      if (filterSection !== 'all' && q.section_id !== filterSection) return false;
      return true;
    });
  };
  
  const difficultyColors = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <Tabs defaultValue="section-quizzes" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
          <TabsTrigger value="section-quizzes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
            Section Quizzes
          </TabsTrigger>
          <TabsTrigger value="final-bank" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
            Final Test Bank
          </TabsTrigger>
          <TabsTrigger value="branching" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
            Branching Flow
          </TabsTrigger>
        </TabsList>
        
        {/* Section Quizzes Tab */}
        <TabsContent value="section-quizzes" className="p-6">
          <div className="space-y-6">
            {sections.map((section) => {
              const config = getSectionConfig(section.id);
              const activeQs = getActiveQuestions(section.id);
              const poolQs = getPoolQuestions(section.id);
              
              return (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <Button
                      size="sm"
                      onClick={() => handleAddQuestion(section.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  
                  {/* Pass Rules */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pass Threshold
                      </label>
                      <Select
                        value={config.pass_threshold.toString()}
                        onValueChange={(v) => updateSectionQuizConfig(section.id, { pass_threshold: parseInt(v) })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1/3 correct</SelectItem>
                          <SelectItem value="2">2/3 correct</SelectItem>
                          <SelectItem value="3">3/3 correct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.allow_retries}
                        onCheckedChange={(checked) => updateSectionQuizConfig(section.id, { allow_retries: checked })}
                      />
                      <label className="text-sm text-gray-700">Allow Retries</label>
                    </div>
                    {config.allow_retries && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Max Retries
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={config.max_retries}
                          onChange={(e) => updateSectionQuizConfig(section.id, { max_retries: parseInt(e.target.value) })}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Active Questions */}
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Active Questions ({activeQs.length}/3)
                    </h4>
                    {activeQs.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                        No active questions
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeQs.map((q) => (
                          <div key={q.id} className="flex items-center gap-2 p-2 border rounded bg-green-50">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{q.question_text}</div>
                              <div className="text-xs text-gray-500">
                                {q.question_type} • {q.difficulty}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(q)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestionActive(q.id)}
                            >
                              Move to Pool
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Pool Questions */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Backup Pool ({poolQs.length})
                    </h4>
                    {poolQs.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                        No pool questions
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {poolQs.map((q) => (
                          <div key={q.id} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{q.question_text}</div>
                              <div className="text-xs text-gray-500">
                                {q.question_type} • {q.difficulty}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(q)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestionActive(q.id)}
                              disabled={activeQs.length >= 3}
                            >
                              Set Active
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Final Test Bank Tab */}
        <TabsContent value="final-bank" className="p-6">
          <div className="space-y-6">
            {/* Settings */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Test Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pass Threshold (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={finalTestConfig?.pass_threshold || 70}
                    onChange={(e) => updateFinalTestConfig({ pass_threshold: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={finalTestConfig?.time_limit_minutes || 60}
                    onChange={(e) => updateFinalTestConfig({ time_limit_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions Count
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={finalTestConfig?.questions_count || 20}
                    onChange={(e) => updateFinalTestConfig({ questions_count: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={finalTestConfig?.coverage_guarantee || false}
                      onCheckedChange={(checked) => updateFinalTestConfig({ coverage_guarantee: checked })}
                    />
                    <label className="text-sm text-gray-700">Guarantee Section Coverage</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={finalTestConfig?.randomize || true}
                      onCheckedChange={(checked) => updateFinalTestConfig({ randomize: checked })}
                    />
                    <label className="text-sm text-gray-700">Randomize Questions</label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Sample Test
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq-4">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="trace">Trace Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => handleAddQuestion()}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Final Test Question
              </Button>
            </div>
            
            {/* Question Bank Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>In Bank</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredBankQuestions().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No questions in final test bank
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredBankQuestions().map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Switch
                            checked={q.is_in_final_bank}
                            onCheckedChange={() => toggleQuestionInBank(q.id)}
                          />
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">{q.question_text}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {q.question_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded ${difficultyColors[q.difficulty]}`}>
                            {q.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {sections.find(s => s.id === q.section_id)?.title || 'Final Only'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{q.topic || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(q)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        {/* Branching Flow Tab */}
        <TabsContent value="branching" className="p-6">
          <div className="text-center py-12 text-gray-500">
            Branching Flow Builder will be implemented in BranchingFlowBuilder.tsx
          </div>
        </TabsContent>
      </Tabs>
      
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editingQuestion}
        sectionId={selectedSectionId}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
