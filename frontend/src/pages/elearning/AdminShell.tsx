/**
 * Admin Shell - Purple-themed admin panel with tab navigation
 * Complete isolation from learner mode
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  FileText,
  Award,
  LogOut,
  GitBranch,
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentEditorModule from './admin/ContentEditorModule';
import QuizManagerModule from './admin/QuizManagerModule';
import BranchingFlowBuilder from './admin/BranchingFlowBuilder';

type AdminTab = 'content' | 'quizzes' | 'branching' | 'learners' | 'analytics' | 'certificates' | 'settings';

export default function AdminShell() {
  const navigate = useNavigate();
  const { logout } = useRole();
  const [activeTab, setActiveTab] = useState<AdminTab>('content');

  const handleLogout = () => {
    logout();
    navigate('/elearning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-white border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">E-Learning Management</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)}>
          <TabsList className="grid grid-cols-7 w-full mb-8 bg-white/50 backdrop-blur">
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="branching"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Branching
            </TabsTrigger>
            <TabsTrigger
              value="learners"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Learners
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Content Editor Tab */}
          <TabsContent value="content" className="mt-0">
            <ContentEditorModule />
          </TabsContent>

          {/* Quiz Manager Tab */}
          <TabsContent value="quizzes" className="mt-0">
            <QuizManagerModule />
          </TabsContent>

          {/* Branching Flow Builder Tab */}
          <TabsContent value="branching" className="mt-0">
            <BranchingFlowBuilder />
          </TabsContent>

          {/* Learners Tab */}
          <TabsContent value="learners">
            <Card className="p-6 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Learner Sessions</h2>
                  <p className="text-gray-600 mt-1">Track learner progress and activity</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">
                    👥 View all learner sessions, progress tracking, and completion status
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Learner tracking dashboard will be implemented by Agent 4
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="p-6 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                  <p className="text-gray-600 mt-1">Course performance and insights</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">0%</p>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Avg. Score</p>
                  <p className="text-3xl font-bold text-purple-600">-</p>
                </Card>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-500">
                  Advanced analytics and reporting will be implemented by Agent 4
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <Card className="p-6 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Certificate Templates</h2>
                  <p className="text-gray-600 mt-1">Customize certificate design</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">
                    🏆 Design certificate layout, fields, and styling
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Certificate customization will be implemented by Agent 4
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6 border-purple-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                <p className="text-gray-600 mt-1">Configure platform preferences</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Security</h3>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Admin PIN</p>
                        <p className="text-sm text-gray-600">Change admin authentication PIN</p>
                      </div>
                      <Button variant="outline" className="border-purple-300">
                        Change PIN
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform</h3>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-500">
                      Additional platform settings will be added as features are implemented
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
