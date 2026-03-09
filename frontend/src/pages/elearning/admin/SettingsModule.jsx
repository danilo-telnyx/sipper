/**
 * Settings Module - A5
 * Global course settings with JSON export/import
 */
import { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Lock, 
  Unlock,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useELearning } from '@/contexts/ELearningContext';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SETTINGS = {
  courseTitle: 'SIP Protocol Training',
  courseVersion: '1.0.0',
  courseStatus: 'published',
  adminPin: '1234',
  masteryGating: true,
  allowRevisitCompleted: true,
  showQuizExplanations: 'fail',
  welcomeMessage: 'Welcome to the SIP Protocol Training Course!\n\nThis comprehensive course will guide you through the fundamentals of Session Initiation Protocol (SIP), from basic concepts to advanced implementations.\n\nComplete all sections, pass quizzes, and earn your certificate!',
  completionMessage: 'Congratulations on completing the SIP Protocol Training!\n\nYou have demonstrated mastery of SIP concepts and are ready to apply your knowledge in real-world scenarios.\n\nYour certificate is now available for download.',
};

export default function SettingsModule() {
  const { state, dispatch } = useELearning();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showPinInput, setShowPinInput] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings (in production, from API or context)
  useEffect(() => {
    // Mock: In production, load from backend or context
    const savedSettings = localStorage.getItem('elearning_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage (in production, save to backend)
    localStorage.setItem('elearning_settings', JSON.stringify(settings));
    setHasUnsavedChanges(false);

    toast({
      title: 'Settings Saved',
      description: 'Course settings have been updated successfully.',
    });
  };

  const handleChangePIN = () => {
    if (newPin.length < 4) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be at least 4 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: 'PIN Mismatch',
        description: 'PIN and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    setSettings(prev => ({ ...prev, adminPin: newPin }));
    setNewPin('');
    setConfirmPin('');
    setShowPinInput(false);
    setHasUnsavedChanges(true);

    toast({
      title: 'PIN Changed',
      description: 'Admin PIN has been updated. Remember to save settings.',
    });
  };

  const handleExportData = () => {
    // Gather full state for export
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      courseData: {
        sections: state.courseData.sections,
        levels: state.courseData.levels,
        questionBank: state.courseData.questionBank,
      },
      learnerSessions: state.learnerSessions,
      branchingRules: state.branchingRules,
      certificateTemplate: state.certificateTemplate,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sipper-elearning-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: 'Full course data exported successfully.',
    });
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Validate structure
        if (!importedData.version || !importedData.courseData) {
          throw new Error('Invalid data format');
        }

        // Confirm before replacing
        if (!confirm('⚠️ WARNING: This will replace ALL current data.\n\nAre you sure you want to proceed?')) {
          return;
        }

        // Restore settings
        if (importedData.settings) {
          setSettings(importedData.settings);
          localStorage.setItem('elearning_settings', JSON.stringify(importedData.settings));
        }

        // Restore course data
        if (importedData.courseData) {
          dispatch({
            type: 'SET_COURSE_DATA',
            payload: {
              sections: importedData.courseData.sections || [],
              levels: importedData.courseData.levels || state.courseData.levels,
              questionBank: importedData.courseData.questionBank || [],
            },
          });
        }

        // Restore learner sessions
        if (importedData.learnerSessions) {
          Object.entries(importedData.learnerSessions).forEach(([id, session]) => {
            dispatch({
              type: 'CREATE_SESSION',
              payload: session,
            });
          });
        }

        // Restore branching rules
        if (importedData.branchingRules) {
          Object.values(importedData.branchingRules).forEach(rule => {
            dispatch({
              type: 'ADD_BRANCHING_RULE',
              payload: rule,
            });
          });
        }

        // Restore certificate template
        if (importedData.certificateTemplate) {
          dispatch({
            type: 'UPDATE_CERTIFICATE_TEMPLATE',
            payload: importedData.certificateTemplate,
          });
        }

        setHasUnsavedChanges(false);

        toast({
          title: 'Data Imported',
          description: `Successfully imported course data from ${new Date(importedData.exportedAt).toLocaleString()}`,
        });
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: 'Import Failed',
          description: error.message || 'Invalid JSON file or corrupted data.',
          variant: 'destructive',
        });
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status]} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Global Course Settings</h1>
          </div>
          <p className="text-purple-100">Configure course behavior and global options</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Unsaved Changes</p>
              <p className="text-sm text-yellow-700">You have unsaved changes. Click "Save Settings" to apply them.</p>
            </div>
          </div>
        )}

        {/* Course Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Course Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                value={settings.courseTitle}
                onChange={(e) => handleChange('courseTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={settings.courseVersion}
                  onChange={(e) => handleChange('courseVersion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.courseStatus}
                    onChange={(e) => handleChange('courseStatus', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <StatusBadge status={settings.courseStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Security Settings
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Admin PIN</label>
                <button
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  {showPinInput ? 'Cancel' : 'Change PIN'}
                </button>
              </div>

              {showPinInput ? (
                <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">New PIN</label>
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new PIN (min 4 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm PIN</label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new PIN"
                    />
                  </div>
                  <button
                    onClick={handleChangePIN}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Update PIN
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>PIN is set (****)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Learning Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.masteryGating}
                onChange={(e) => handleChange('masteryGating', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-700">Mastery Gating</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Learners must complete previous sections before advancing
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRevisitCompleted}
                onChange={(e) => handleChange('allowRevisitCompleted', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-700">Allow Revisit Completed Sections</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Learners can go back to review completed content
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Quiz Explanations
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="explanations"
                    value="always"
                    checked={settings.showQuizExplanations === 'always'}
                    onChange={(e) => handleChange('showQuizExplanations', e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Always (after every answer)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="explanations"
                    value="fail"
                    checked={settings.showQuizExplanations === 'fail'}
                    onChange={(e) => handleChange('showQuizExplanations', e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">On Fail Only (incorrect answers only)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="explanations"
                    value="never"
                    checked={settings.showQuizExplanations === 'never'}
                    onChange={(e) => handleChange('showQuizExplanations', e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Never (no explanations shown)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Course Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Course Messages
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                placeholder="Enter welcome message shown to learners at course start..."
              />
              <p className="text-xs text-gray-500 mt-1">Shown when learners first access the course</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Message
              </label>
              <textarea
                value={settings.completionMessage}
                onChange={(e) => handleChange('completionMessage', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                placeholder="Enter completion message shown after earning certificate..."
              />
              <p className="text-xs text-gray-500 mt-1">Shown when learner completes course and earns certificate</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <Download className="h-5 w-5" />
                Export Course Data JSON
              </button>

              <button
                onClick={handleImportData}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <Upload className="h-5 w-5" />
                Import Course Data JSON
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Data Export/Import</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Export includes all settings, sections, questions, learner sessions, and branching rules</li>
                  <li>Import will <strong>replace all current data</strong> — backup first!</li>
                  <li>Use for course backup, migration, or version control</li>
                </ul>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md transition ${
              hasUnsavedChanges
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {hasUnsavedChanges ? (
              <>
                <Save className="h-5 w-5" />
                Save Settings
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Settings Saved
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
