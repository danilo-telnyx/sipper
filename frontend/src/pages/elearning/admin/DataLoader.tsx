/**
 * Data Loader Component
 * Loads sample course data into ELearningAdminContext on mount
 */
import { useEffect, useState } from 'react';
import { useELearningAdmin } from '@/contexts/ELearningAdminContext';
import {
  completeSections,
  completeQuestions
} from '@/data/completeContent';
import { Loader2 } from 'lucide-react';

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const {
    sections,
    setSections,
    questions,
    setQuestions,
    updateFinalTestConfig,
    setBranchingRules,
    updateSectionQuizConfig
  } = useELearningAdmin();
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Only load if data is empty
    if (sections.length === 0 && questions.length === 0) {
      console.log('📚 Loading COMPLETE course data (PRODUCTION)...');
      
      // Load ALL 15 sections
      setSections(completeSections);
      
      // Load ALL 105+ questions
      setQuestions(completeQuestions);
      
      // Generate section quiz configs (3 questions per section, pass threshold 2)
      completeSections.forEach(section => {
        const sectionQuestions = completeQuestions
          .filter(q => q.section_id === section.id)
          .slice(0, 3)
          .map(q => q.id);
        
        if (sectionQuestions.length > 0) {
          updateSectionQuizConfig(section.id, {
            section_id: section.id,
            pass_threshold: 2,
            allow_retries: true,
            max_retries: 3,
            active_questions: sectionQuestions,
            pool_questions: []
          });
        }
      });
      
      // Load final test config
      updateFinalTestConfig({
        course_id: 'course-sip-101',
        pass_threshold: 70,
        time_limit_minutes: 60,
        questions_count: 30,
        coverage_guarantee: true,
        randomize: true
      });
      
      // Load branching rules (default: pass=proceed, fail=retry)
      const defaultRules = completeSections.map((section, index) => ({
        section_id: section.id,
        quiz_number: 1,
        score_threshold: 2,
        on_pass: { type: 'proceed' as const },
        on_fail: { type: 'retry' as const }
      }));
      setBranchingRules(defaultRules);
      
      console.log('✅ COMPLETE data loaded successfully (PRODUCTION)');
      console.log(`   - ${completeSections.length} sections (ALL 15)`);
      console.log(`   - ${completeQuestions.length} questions (105+)`);
      console.log(`   - ${completeSections.length} quiz configs`);
      console.log(`   - ${defaultRules.length} branching rules`);
      
      setTimeout(() => setLoading(false), 500);
    } else {
      setLoading(false);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading complete course data...</p>
          <p className="text-sm text-gray-500 mt-2">15 sections • 105+ questions</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
