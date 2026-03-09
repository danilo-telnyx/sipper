/**
 * E-Learning Data Export/Import Utilities
 */

/**
 * Export full course state to JSON
 * @param {Object} state - ELearning context state
 * @param {Object} settings - Settings from SettingsModule
 * @returns {Object} Complete exportable data structure
 */
export function exportCourseData(state, settings = {}) {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      courseTitle: settings.courseTitle || 'SIP Protocol Training',
      courseVersion: settings.courseVersion || '1.0.0',
      courseStatus: settings.courseStatus || 'published',
    },
    settings,
    courseData: {
      sections: state.courseData.sections || [],
      levels: state.courseData.levels || [],
      questionBank: state.courseData.questionBank || [],
    },
    learnerSessions: state.learnerSessions || {},
    branchingRules: state.branchingRules || {},
    certificateTemplate: state.certificateTemplate || null,
  };
}

/**
 * Validate imported JSON data structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateImportData(data) {
  const errors = [];

  if (!data.version) {
    errors.push('Missing version field');
  }

  if (!data.courseData) {
    errors.push('Missing courseData field');
  } else {
    if (!Array.isArray(data.courseData.sections)) {
      errors.push('courseData.sections must be an array');
    }
    if (!Array.isArray(data.courseData.levels)) {
      errors.push('courseData.levels must be an array');
    }
    if (!Array.isArray(data.courseData.questionBank)) {
      errors.push('courseData.questionBank must be an array');
    }
  }

  if (data.learnerSessions && typeof data.learnerSessions !== 'object') {
    errors.push('learnerSessions must be an object');
  }

  if (data.branchingRules && typeof data.branchingRules !== 'object') {
    errors.push('branchingRules must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Download JSON data as a file
 * @param {Object} data - Data to export
 * @param {string} filename - Output filename (without extension)
 */
export function downloadJSON(data, filename = 'sipper-elearning-export') {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Apply imported data to context via dispatch
 * @param {Object} data - Validated import data
 * @param {Function} dispatch - ELearning context dispatch function
 * @param {Function} setSettings - Settings state setter (optional)
 */
export function applyImportData(data, dispatch, setSettings = null) {
  // Apply settings
  if (data.settings && setSettings) {
    setSettings(data.settings);
    localStorage.setItem('elearning_settings', JSON.stringify(data.settings));
  }

  // Apply course data
  if (data.courseData) {
    dispatch({
      type: 'SET_COURSE_DATA',
      payload: {
        sections: data.courseData.sections || [],
        levels: data.courseData.levels || [],
        questionBank: data.courseData.questionBank || [],
      },
    });
  }

  // Apply learner sessions
  if (data.learnerSessions) {
    Object.values(data.learnerSessions).forEach(session => {
      dispatch({
        type: 'CREATE_SESSION',
        payload: session,
      });
    });
  }

  // Apply branching rules
  if (data.branchingRules) {
    Object.values(data.branchingRules).forEach(rule => {
      dispatch({
        type: 'ADD_BRANCHING_RULE',
        payload: rule,
      });
    });
  }

  // Apply certificate template
  if (data.certificateTemplate) {
    dispatch({
      type: 'UPDATE_CERTIFICATE_TEMPLATE',
      payload: data.certificateTemplate,
    });
  }
}

/**
 * Generate sample export data (for testing)
 */
export function generateSampleExport() {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      courseTitle: 'Sample SIP Course',
      courseVersion: '1.0.0',
      courseStatus: 'draft',
    },
    settings: {
      courseTitle: 'Sample SIP Course',
      courseVersion: '1.0.0',
      courseStatus: 'draft',
      adminPin: '1234',
      masteryGating: true,
      allowRevisitCompleted: true,
      showQuizExplanations: 'fail',
      welcomeMessage: 'Welcome to the course!',
      completionMessage: 'Congratulations!',
    },
    courseData: {
      sections: [
        {
          id: 's1',
          title: 'Introduction to SIP',
          content: 'Sample content',
          order: 1,
          levelId: 'basic',
        },
      ],
      levels: [
        { id: 'basic', name: 'basic', description: 'Beginner Level', order: 1 },
        { id: 'intermediate', name: 'intermediate', description: 'Intermediate Level', order: 2 },
        { id: 'advanced', name: 'advanced', description: 'Advanced Level', order: 3 },
      ],
      questionBank: [
        {
          id: 'q1',
          text: 'What does SIP stand for?',
          type: 'multiple_choice',
          options: ['Session Initiation Protocol', 'Simple Internet Protocol', 'Secure IP', 'None'],
          correctAnswer: 'Session Initiation Protocol',
          levelId: 'basic',
          difficulty: 'easy',
        },
      ],
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
  };
}
