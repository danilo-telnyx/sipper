/**
 * E-Learning Context - Global State Management
 * Manages course data, learner sessions, branching rules, and certificates
 */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { completeSections, completeQuestions } from '@/data/completeContent';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
  levelId: string;
}

export interface Level {
  id: string;
  name: 'basic' | 'intermediate' | 'advanced';
  description: string;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'open_ended';
  options?: string[];
  correctAnswer?: string;
  levelId: string;
  sectionId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearnerSession {
  id: string;
  startedAt: string;
  lastActivityAt: string;
  currentSectionId: string | null;
  completedSections: string[];
  answers: Record<string, string>; // questionId -> answer
  score: number;
  progress: number; // 0-100
}

export interface BranchingRule {
  id: string;
  condition: {
    type: 'score' | 'section_complete' | 'question_answer';
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
  action: {
    type: 'skip_section' | 'show_content' | 'unlock_level' | 'show_message';
    target: string;
  };
}

export interface CertificateTemplate {
  layout: 'classic' | 'modern' | 'minimal';
  fields: {
    includeScore: boolean;
    includeDate: boolean;
    includeInstructorSignature: boolean;
    customMessage?: string;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface ELearningState {
  courseData: {
    sections: Section[];
    levels: Level[];
    questionBank: Question[];
  };
  learnerSessions: Record<string, LearnerSession>;
  branchingRules: Record<string, BranchingRule>;
  certificateTemplate: CertificateTemplate;
  loading: boolean;
  error: string | null;
}

// ========================================
// ACTION TYPES
// ========================================

type ELearningAction =
  | { type: 'SET_COURSE_DATA'; payload: { sections: Section[]; levels: Level[]; questionBank: Question[] } }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<Question> } }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'CREATE_SESSION'; payload: LearnerSession }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<LearnerSession> } }
  | { type: 'COMPLETE_SECTION'; payload: { sessionId: string; sectionId: string } }
  | { type: 'SUBMIT_ANSWER'; payload: { sessionId: string; questionId: string; answer: string } }
  | { type: 'ADD_BRANCHING_RULE'; payload: BranchingRule }
  | { type: 'UPDATE_BRANCHING_RULE'; payload: { id: string; updates: Partial<BranchingRule> } }
  | { type: 'DELETE_BRANCHING_RULE'; payload: string }
  | { type: 'UPDATE_CERTIFICATE_TEMPLATE'; payload: Partial<CertificateTemplate> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// ========================================
// INITIAL STATE
// ========================================

const initialState: ELearningState = {
  courseData: {
    sections: [],
    levels: [
      { id: 'basic', name: 'basic', description: 'Beginner Level', order: 1 },
      { id: 'intermediate', name: 'intermediate', description: 'Intermediate Level', order: 2 },
      { id: 'advanced', name: 'advanced', description: 'Advanced Level', order: 3 },
    ],
    questionBank: [],
  },
  learnerSessions: {},
  branchingRules: {},
  certificateTemplate: {
    layout: 'classic',
    fields: {
      includeScore: true,
      includeDate: true,
      includeInstructorSignature: true,
    },
    styling: {
      primaryColor: '#7C3AED',
      secondaryColor: '#00D4AA',
      fontFamily: 'Inter',
    },
  },
  loading: false,
  error: null,
};

// ========================================
// REDUCER
// ========================================

function elearningReducer(state: ELearningState, action: ELearningAction): ELearningState {
  switch (action.type) {
    case 'SET_COURSE_DATA':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          ...action.payload,
        },
      };

    case 'ADD_SECTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          sections: [...state.courseData.sections, action.payload],
        },
      };

    case 'UPDATE_SECTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          sections: state.courseData.sections.map((section) =>
            section.id === action.payload.id
              ? { ...section, ...action.payload.updates }
              : section
          ),
        },
      };

    case 'DELETE_SECTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          sections: state.courseData.sections.filter((s) => s.id !== action.payload),
        },
      };

    case 'ADD_QUESTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          questionBank: [...state.courseData.questionBank, action.payload],
        },
      };

    case 'UPDATE_QUESTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          questionBank: state.courseData.questionBank.map((q) =>
            q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
          ),
        },
      };

    case 'DELETE_QUESTION':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          questionBank: state.courseData.questionBank.filter((q) => q.id !== action.payload),
        },
      };

    case 'CREATE_SESSION':
      return {
        ...state,
        learnerSessions: {
          ...state.learnerSessions,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        learnerSessions: {
          ...state.learnerSessions,
          [action.payload.id]: {
            ...state.learnerSessions[action.payload.id],
            ...action.payload.updates,
            lastActivityAt: new Date().toISOString(),
          },
        },
      };

    case 'COMPLETE_SECTION': {
      const session = state.learnerSessions[action.payload.sessionId];
      const completedSections = [...session.completedSections, action.payload.sectionId];
      const totalSections = state.courseData.sections.length;
      const progress = (completedSections.length / totalSections) * 100;

      return {
        ...state,
        learnerSessions: {
          ...state.learnerSessions,
          [action.payload.sessionId]: {
            ...session,
            completedSections,
            progress,
            lastActivityAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'SUBMIT_ANSWER':
      return {
        ...state,
        learnerSessions: {
          ...state.learnerSessions,
          [action.payload.sessionId]: {
            ...state.learnerSessions[action.payload.sessionId],
            answers: {
              ...state.learnerSessions[action.payload.sessionId].answers,
              [action.payload.questionId]: action.payload.answer,
            },
            lastActivityAt: new Date().toISOString(),
          },
        },
      };

    case 'ADD_BRANCHING_RULE':
      return {
        ...state,
        branchingRules: {
          ...state.branchingRules,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_BRANCHING_RULE':
      return {
        ...state,
        branchingRules: {
          ...state.branchingRules,
          [action.payload.id]: {
            ...state.branchingRules[action.payload.id],
            ...action.payload.updates,
          },
        },
      };

    case 'DELETE_BRANCHING_RULE': {
      const { [action.payload]: removed, ...rest } = state.branchingRules;
      return {
        ...state,
        branchingRules: rest,
      };
    }

    case 'UPDATE_CERTIFICATE_TEMPLATE':
      return {
        ...state,
        certificateTemplate: {
          ...state.certificateTemplate,
          ...action.payload,
        },
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ========================================
// CONTEXT
// ========================================

interface ELearningContextValue {
  state: ELearningState;
  dispatch: React.Dispatch<ELearningAction>;
  
  // Helper functions
  getSectionsByLevel: (levelId: string) => Section[];
  getQuestionsBySection: (sectionId: string) => Question[];
  getSessionProgress: (sessionId: string) => number;
  evaluateBranchingRules: (sessionId: string) => BranchingRule[];
}

const ELearningContext = createContext<ELearningContextValue | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface ELearningProviderProps {
  children: ReactNode;
}

export function ELearningProvider({ children }: ELearningProviderProps) {
  const [state, dispatch] = useReducer(elearningReducer, initialState);

  // Initialize course data on mount
  useEffect(() => {
    if (state.courseData.sections.length === 0) {
      // Map SectionContent to Section format
      const mappedSections: Section[] = completeSections.map((section, index) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: section.order || index + 1,
        levelId: section.course_id || 'basic', // Map course_id to levelId
      }));

      // Map QuizQuestion to Question format
      const mappedQuestions: Question[] = completeQuestions
        .filter(q => q.is_active) // Only active questions
        .map(q => ({
          id: q.id,
          text: q.question_text,
          type: q.question_type.startsWith('mcq') ? 'multiple_choice' : 
                q.question_type === 'true-false' ? 'true_false' : 'open_ended',
          options: q.options,
          correctAnswer: q.correct_answer,
          levelId: 'basic', // Default to basic, could be derived from section
          sectionId: q.section_id,
          difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        }));

      dispatch({
        type: 'SET_COURSE_DATA',
        payload: {
          sections: mappedSections,
          levels: initialState.courseData.levels,
          questionBank: mappedQuestions,
        },
      });
    }
  }, []); // Run only once on mount

  // Helper functions
  const getSectionsByLevel = (levelId: string): Section[] => {
    return state.courseData.sections.filter((s) => s.levelId === levelId);
  };

  const getQuestionsBySection = (sectionId: string): Question[] => {
    return state.courseData.questionBank.filter((q) => q.sectionId === sectionId);
  };

  const getSessionProgress = (sessionId: string): number => {
    return state.learnerSessions[sessionId]?.progress || 0;
  };

  const evaluateBranchingRules = (sessionId: string): BranchingRule[] => {
    const session = state.learnerSessions[sessionId];
    if (!session) return [];

    return Object.values(state.branchingRules).filter((rule) => {
      switch (rule.condition.type) {
        case 'score':
          return evaluateCondition(session.score, rule.condition.operator, rule.condition.value);
        case 'section_complete':
          return session.completedSections.includes(rule.condition.value);
        case 'question_answer':
          return session.answers[rule.condition.value] !== undefined;
        default:
          return false;
      }
    });
  };

  const evaluateCondition = (actual: any, operator: string, expected: any): boolean => {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'contains':
        return String(actual).includes(expected);
      default:
        return false;
    }
  };

  const value: ELearningContextValue = {
    state,
    dispatch,
    getSectionsByLevel,
    getQuestionsBySection,
    getSessionProgress,
    evaluateBranchingRules,
  };

  return <ELearningContext.Provider value={value}>{children}</ELearningContext.Provider>;
}

// ========================================
// HOOK
// ========================================

export function useELearning() {
  const context = useContext(ELearningContext);
  if (context === undefined) {
    throw new Error('useELearning must be used within an ELearningProvider');
  }
  return context;
}
