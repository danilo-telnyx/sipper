/**
 * Data Loader Component
 * Loads sample course data into ELearningAdminContext on mount
 */
import { useEffect, useState } from 'react';
import { useELearningAdmin } from '@/contexts/ELearningAdminContext';
import {
  sampleSections,
  sampleQuestions,
  sampleSectionQuizConfigs,
  sampleFinalTestConfig,
  sampleBranchingRules
} from '@/data/sampleCourseData';
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
      console.log('📚 Loading sample course data...');
      
      // Load sections
      setSections(sampleSections);
      
      // Load questions
      setQuestions(sampleQuestions);
      
      // Load section quiz configs
      sampleSectionQuizConfigs.forEach(config => {
        updateSectionQuizConfig(config.section_id, config);
      });
      
      // Load final test config
      if (sampleFinalTestConfig) {
        updateFinalTestConfig(sampleFinalTestConfig);
      }
      
      // Load branching rules
      setBranchingRules(sampleBranchingRules);
      
      console.log('✅ Sample data loaded successfully');
      console.log(`   - ${sampleSections.length} sections`);
      console.log(`   - ${sampleQuestions.length} questions`);
      console.log(`   - ${sampleSectionQuizConfigs.length} quiz configs`);
      console.log(`   - ${sampleBranchingRules.length} branching rules`);
      
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
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
