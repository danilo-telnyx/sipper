/**
 * E-Learning Admin Context - Shared state for admin modules
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SIPBlock {
  id: string;
  content: string;
}

export interface Callout {
  id: string;
  type: 'tip' | 'mistake' | 'rfc' | 'info';
  content: string;
}

export interface LadderDiagram {
  id: string;
  lines: string[];
}

export interface SectionContent {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  is_published: boolean;
  sip_blocks?: SIPBlock[];
  callouts?: Callout[];
  ladder_diagrams?: LadderDiagram[];
  key_takeaways?: string[];
}

export interface QuizQuestion {
  id: string;
  section_id?: string;
  question_text: string;
  question_type: 'mcq-4' | 'true-false' | 'trace';
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  is_active: boolean;
  is_in_final_bank: boolean;
}

export interface SectionQuizConfig {
  section_id: string;
  pass_threshold: number;
  allow_retries: boolean;
  max_retries?: number;
  active_questions: string[]; // question IDs
  pool_questions: string[]; // question IDs
}

export interface FinalTestConfig {
  course_id: string;
  pass_threshold: number;
  time_limit_minutes?: number;
  questions_count: number;
  coverage_guarantee: boolean;
  randomize: boolean;
}

export interface BranchAction {
  type: 'proceed' | 'skip' | 'unlock-bonus' | 'award-badge' | 'show-message' | 'retry' | 'remediation' | 'block';
  target?: string;
  message?: string;
  badge?: string;
}

export interface BranchingRule {
  section_id: string;
  quiz_number: number;
  score_threshold: number; // 0, 1, 2, 3
  on_pass: BranchAction;
  on_fail: BranchAction;
}

interface ELearningAdminContextType {
  // Content Editor State
  sections: SectionContent[];
  selectedSection: SectionContent | null;
  setSections: (sections: SectionContent[]) => void;
  selectSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<SectionContent>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  saveSection: (sectionId: string) => Promise<void>;
  
  // Quiz Manager State
  questions: QuizQuestion[];
  sectionQuizConfigs: SectionQuizConfig[];
  finalTestConfig: FinalTestConfig | null;
  setQuestions: (questions: QuizQuestion[]) => void;
  addQuestion: (question: Omit<QuizQuestion, 'id'>) => void;
  updateQuestion: (questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (sectionId: string, fromIndex: number, toIndex: number) => void;
  toggleQuestionActive: (questionId: string) => void;
  toggleQuestionInBank: (questionId: string) => void;
  updateSectionQuizConfig: (sectionId: string, config: Partial<SectionQuizConfig>) => void;
  updateFinalTestConfig: (config: Partial<FinalTestConfig>) => void;
  
  // Branching Flow State
  branchingRules: BranchingRule[];
  setBranchingRules: (rules: BranchingRule[]) => void;
  updateBranchingRule: (sectionId: string, updates: Partial<BranchingRule>) => void;
  resetBranchingFlow: () => void;
  saveBranchingFlow: () => Promise<void>;
}

const ELearningAdminContext = createContext<ELearningAdminContextType | undefined>(undefined);

export function ELearningAdminProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Content Editor State
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionContent | null>(null);
  
  // Quiz Manager State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sectionQuizConfigs, setSectionQuizConfigs] = useState<SectionQuizConfig[]>([]);
  const [finalTestConfig, setFinalTestConfig] = useState<FinalTestConfig | null>(null);
  
  // Branching Flow State
  const [branchingRules, setBranchingRules] = useState<BranchingRule[]>([]);
  
  // Content Editor Methods
  const selectSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    setSelectedSection(section || null);
  }, [sections]);
  
  const updateSection = useCallback((sectionId: string, updates: Partial<SectionContent>) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    ));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedSection]);
  
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const newSections = [...prev];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      return newSections.map((s, idx) => ({ ...s, order: idx }));
    });
  }, []);
  
  const saveSection = useCallback(async (sectionId: string) => {
    try {
      // TODO: API call to save section
      toast({
        title: 'Section saved',
        description: 'Section content has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save section',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  // Quiz Manager Methods
  const addQuestion = useCallback((question: Omit<QuizQuestion, 'id'>) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setQuestions(prev => [...prev, newQuestion]);
    toast({
      title: 'Question added',
      description: 'New question has been created.',
    });
  }, [toast]);
  
  const updateQuestion = useCallback((questionId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  }, []);
  
  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({
      title: 'Question deleted',
      description: 'Question has been removed.',
    });
  }, [toast]);
  
  const reorderQuestions = useCallback((sectionId: string, fromIndex: number, toIndex: number) => {
    setQuestions(prev => {
      const sectionQuestions = prev.filter(q => q.section_id === sectionId);
      const otherQuestions = prev.filter(q => q.section_id !== sectionId);
      const [moved] = sectionQuestions.splice(fromIndex, 1);
      sectionQuestions.splice(toIndex, 0, moved);
      return [...otherQuestions, ...sectionQuestions];
    });
  }, []);
  
  const toggleQuestionActive = useCallback((questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, is_active: !q.is_active } : q
    ));
  }, []);
  
  const toggleQuestionInBank = useCallback((questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, is_in_final_bank: !q.is_in_final_bank } : q
    ));
  }, []);
  
  const updateSectionQuizConfig = useCallback((sectionId: string, config: Partial<SectionQuizConfig>) => {
    setSectionQuizConfigs(prev => {
      const existing = prev.find(c => c.section_id === sectionId);
      if (existing) {
        return prev.map(c => c.section_id === sectionId ? { ...c, ...config } : c);
      } else {
        return [...prev, { section_id: sectionId, ...config } as SectionQuizConfig];
      }
    });
  }, []);
  
  const updateFinalTestConfig = useCallback((config: Partial<FinalTestConfig>) => {
    setFinalTestConfig(prev => prev ? { ...prev, ...config } : config as FinalTestConfig);
  }, []);
  
  // Branching Flow Methods
  const updateBranchingRule = useCallback((sectionId: string, updates: Partial<BranchingRule>) => {
    setBranchingRules(prev => {
      const existing = prev.find(r => r.section_id === sectionId);
      if (existing) {
        return prev.map(r => r.section_id === sectionId ? { ...r, ...updates } : r);
      } else {
        return [...prev, { section_id: sectionId, ...updates } as BranchingRule];
      }
    });
  }, []);
  
  const resetBranchingFlow = useCallback(() => {
    setBranchingRules([]);
    toast({
      title: 'Flow reset',
      description: 'Branching flow has been reset to default.',
    });
  }, [toast]);
  
  const saveBranchingFlow = useCallback(async () => {
    try {
      // TODO: API call to save branching flow
      toast({
        title: 'Flow saved',
        description: 'Branching flow has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save branching flow',
        variant: 'destructive',
      });
    }
  }, [branchingRules, toast]);
  
  const value: ELearningAdminContextType = {
    sections,
    selectedSection,
    setSections,
    selectSection,
    updateSection,
    reorderSections,
    saveSection,
    
    questions,
    sectionQuizConfigs,
    finalTestConfig,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    toggleQuestionActive,
    toggleQuestionInBank,
    updateSectionQuizConfig,
    updateFinalTestConfig,
    
    branchingRules,
    setBranchingRules,
    updateBranchingRule,
    resetBranchingFlow,
    saveBranchingFlow,
  };
  
  return (
    <ELearningAdminContext.Provider value={value}>
      {children}
    </ELearningAdminContext.Provider>
  );
}

export function useELearningAdmin() {
  const context = useContext(ELearningAdminContext);
  if (!context) {
    throw new Error('useELearningAdmin must be used within ELearningAdminProvider');
  }
  return context;
}
