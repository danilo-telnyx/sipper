/**
 * Learner Dashboard Module - A4
 * Admin dashboard for tracking learner progress with detailed analytics
 */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Eye, 
  Unlock, 
  RotateCcw, 
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from 'lucide-react';
import { useELearning } from '@/contexts/ELearningContext';
import { useToast } from '@/hooks/use-toast';

// Mock learner data - In production, this would come from API
const MOCK_LEARNERS = [
  {
    id: 'l1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    startedAt: '2026-02-15T10:00:00Z',
    lastActive: '2026-03-08T16:30:00Z',
    level: 'intermediate',
    sectionsComplete: 8,
    totalSections: 12,
    currentSection: 'SIP Registrations',
    quizScores: [80, 90, 75, 85],
    finalTestScore: null,
    certificateId: null,
  },
  {
    id: 'l2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    startedAt: '2026-03-01T09:00:00Z',
    lastActive: '2026-03-09T11:00:00Z',
    level: 'basic',
    sectionsComplete: 12,
    totalSections: 12,
    currentSection: 'Completed',
    quizScores: [95, 88, 92, 90],
    finalTestScore: 94,
    certificateId: 'CERT-2026-001',
  },
  {
    id: 'l3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    startedAt: '2026-02-20T14:00:00Z',
    lastActive: '2026-03-07T13:00:00Z',
    level: 'advanced',
    sectionsComplete: 5,
    totalSections: 15,
    currentSection: 'SIP Security',
    quizScores: [70, 65, 72],
    finalTestScore: null,
    certificateId: null,
  },
  {
    id: 'l4',
    name: 'David Wilson',
    email: 'david@example.com',
    startedAt: '2026-03-05T08:00:00Z',
    lastActive: '2026-03-05T10:00:00Z',
    level: 'basic',
    sectionsComplete: 2,
    totalSections: 12,
    currentSection: 'SIP Messages',
    quizScores: [60, 55],
    finalTestScore: null,
    certificateId: null,
  },
  {
    id: 'l5',
    name: 'Emma Brown',
    email: 'emma@example.com',
    startedAt: '2026-02-10T11:00:00Z',
    lastActive: '2026-03-09T09:00:00Z',
    level: 'intermediate',
    sectionsComplete: 12,
    totalSections: 12,
    currentSection: 'Completed',
    quizScores: [88, 85, 90, 87],
    finalTestScore: 89,
    certificateId: 'CERT-2026-002',
  },
];

export default function LearnerDashboardModule() {
  const { state } = useELearning();
  const { toast } = useToast();
  
  const [learners, setLearners] = useState(MOCK_LEARNERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('lastActive');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedLearner, setExpandedLearner] = useState(null);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = learners.length;
    const active = learners.filter(l => {
      const daysSinceActive = (Date.now() - new Date(l.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7;
    }).length;
    const completed = learners.filter(l => l.sectionsComplete === l.totalSections).length;
    const certified = learners.filter(l => l.certificateId).length;

    // Most failed section (mock calculation)
    const sectionFailures = {
      'SIP Headers': 12,
      'SIP Security': 8,
      'SDP Negotiation': 6,
      'SIP Proxying': 5,
    };
    const mostFailedSection = Object.entries(sectionFailures).sort((a, b) => b[1] - a[1])[0];

    // Average score
    const allScores = learners.flatMap(l => l.quizScores);
    const avgScore = allScores.length > 0 
      ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)
      : 0;

    return {
      total,
      active,
      activePercent: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
      completed,
      completedPercent: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      certified,
      certifiedPercent: total > 0 ? ((certified / total) * 100).toFixed(1) : 0,
      mostFailedSection: mostFailedSection ? `${mostFailedSection[0]} (${mostFailedSection[1]} fails)` : 'N/A',
      avgScore,
    };
  }, [learners]);

  // Filter and sort learners
  const filteredLearners = useMemo(() => {
    let filtered = learners.filter(learner => {
      const matchesSearch = learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          learner.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || learner.level === filterLevel;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && learner.sectionsComplete < learner.totalSections) ||
                           (filterStatus === 'completed' && learner.sectionsComplete === learner.totalSections) ||
                           (filterStatus === 'certified' && learner.certificateId);
      return matchesSearch && matchesLevel && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'startedAt':
          aVal = new Date(a.startedAt).getTime();
          bVal = new Date(b.startedAt).getTime();
          break;
        case 'lastActive':
          aVal = new Date(a.lastActive).getTime();
          bVal = new Date(b.lastActive).getTime();
          break;
        case 'progress':
          aVal = a.sectionsComplete / a.totalSections;
          bVal = b.sectionsComplete / b.totalSections;
          break;
        case 'avgScore':
          aVal = a.quizScores.reduce((sum, s) => sum + s, 0) / a.quizScores.length;
          bVal = b.quizScores.reduce((sum, s) => sum + s, 0) / b.quizScores.length;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [learners, searchTerm, filterLevel, filterStatus, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleUnlockSection = (learnerId, sectionId) => {
    toast({
      title: 'Section Unlocked',
      description: `Section unlocked for learner.`,
    });
  };

  const handleResetFinalTest = (learnerId) => {
    toast({
      title: 'Final Test Reset',
      description: `Final test has been reset for learner.`,
    });
  };

  const handleResetProgress = (learnerId) => {
    if (confirm('Are you sure you want to reset all progress for this learner?')) {
      toast({
        title: 'Progress Reset',
        description: `All progress has been reset.`,
        variant: 'destructive',
      });
    }
  };

  const handleReissueCertificate = (learnerId) => {
    toast({
      title: 'Certificate Reissued',
      description: `A new certificate has been generated.`,
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(learners, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learner-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: 'Learner data has been downloaded as JSON.',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-purple-600" />
      : <ChevronDown className="h-4 w-4 text-purple-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Learner Progress Dashboard</h1>
          </div>
          <p className="text-purple-100">Monitor learner activity, progress, and performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Total Enrolled</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Active (7d)</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-green-600">{stats.activePercent}%</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Completed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-blue-600">{stats.completedPercent}%</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Certified</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.certified}</p>
            <p className="text-xs text-yellow-600">{stats.certifiedPercent}%</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Most Failed</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 mt-2">{stats.mostFailedSection}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Avg Score</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="certified">Certified</option>
              </select>

              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Learners Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 border-b-2 border-purple-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-purple-600"
                    >
                      Learner Name
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('startedAt')}
                      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-purple-600"
                    >
                      Started
                      <SortIcon field="startedAt" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastActive')}
                      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-purple-600"
                    >
                      Last Active
                      <SortIcon field="lastActive" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('progress')}
                      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-purple-600"
                    >
                      Progress
                      <SortIcon field="progress" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Section</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('avgScore')}
                      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-purple-600"
                    >
                      Quiz Avg
                      <SortIcon field="avgScore" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Final Test</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Certificate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLearners.map((learner) => {
                  const progressPercent = (learner.sectionsComplete / learner.totalSections * 100).toFixed(0);
                  const avgQuizScore = learner.quizScores.length > 0
                    ? (learner.quizScores.reduce((sum, s) => sum + s, 0) / learner.quizScores.length).toFixed(1)
                    : 'N/A';
                  const isExpanded = expandedLearner === learner.id;

                  return (
                    <React.Fragment key={learner.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{learner.name}</p>
                            <p className="text-xs text-gray-500">{learner.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(learner.startedAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(learner.lastActive)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 capitalize">
                            {learner.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(progressPercent)}`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">{progressPercent}%</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {learner.sectionsComplete}/{learner.totalSections} sections
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{learner.currentSection}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{avgQuizScore}%</td>
                        <td className="px-4 py-3">
                          {learner.finalTestScore !== null ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              learner.finalTestScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {learner.finalTestScore}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not taken</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {learner.certificateId ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                              ✓ Issued
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedLearner(isExpanded ? null : learner.id)}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="10" className="px-4 py-4 bg-purple-50">
                            <div className="space-y-4">
                              <h3 className="font-bold text-gray-900 mb-3">Detailed Information</h3>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Quiz Scores</p>
                                  <div className="flex gap-2">
                                    {learner.quizScores.map((score, idx) => (
                                      <span
                                        key={idx}
                                        className={`px-2 py-1 text-xs font-semibold rounded ${
                                          score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                      >
                                        Q{idx + 1}: {score}%
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Certificate ID</p>
                                  <p className="text-sm font-mono text-gray-900">{learner.certificateId || 'N/A'}</p>
                                </div>

                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Enrollment Duration</p>
                                  <p className="text-sm text-gray-900">
                                    {Math.ceil((new Date() - new Date(learner.startedAt)) / (1000 * 60 * 60 * 24))} days
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-3 border-t border-purple-200">
                                <button
                                  onClick={() => handleUnlockSection(learner.id)}
                                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                  <Unlock className="h-4 w-4" />
                                  Unlock Section
                                </button>

                                {learner.finalTestScore !== null && (
                                  <button
                                    onClick={() => handleResetFinalTest(learner.id)}
                                    className="px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset Final Test
                                  </button>
                                )}

                                <button
                                  onClick={() => handleResetProgress(learner.id)}
                                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Reset Progress
                                </button>

                                {learner.certificateId && (
                                  <button
                                    onClick={() => handleReissueCertificate(learner.id)}
                                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                                  >
                                    <Award className="h-4 w-4" />
                                    Reissue Certificate
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLearners.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No learners match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
