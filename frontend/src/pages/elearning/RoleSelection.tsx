/**
 * Role Selection Page
 * Entry point for dual-persona e-learning system
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, User, BookOpen } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setRole, authenticateAdmin } = useRole();
  const { user } = useAuth();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'org-admin';

  // Auto-redirect non-admin users to learner view
  useEffect(() => {
    if (user && !isAdmin) {
      setRole('learner');
      navigate('/elearning/learner');
    }
  }, [user, isAdmin, setRole, navigate]);

  const handleStartLearning = () => {
    setRole('learner');
    navigate('/elearning/learner');
  };

  const handleAdminLogin = () => {
    setShowAdminDialog(true);
    setError('');
    setPin('');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = authenticateAdmin(pin);
    
    if (isValid) {
      setShowAdminDialog(false);
      navigate('/elearning/admin');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Sipper E-Learning Platform
          </h1>
          <p className="text-lg text-gray-600">
            Choose your learning path
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className={`grid ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'} gap-8`}>
          {/* Learner Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-teal-500 cursor-pointer">
            <div className="p-8" onClick={handleStartLearning}>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-6 bg-teal-100 rounded-full group-hover:bg-teal-500 transition-colors duration-300">
                  <User className="h-12 w-12 text-teal-600 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Start Learning
                  </h2>
                  <p className="text-gray-600">
                    Begin your educational journey with interactive courses and personalized learning paths
                  </p>
                </div>

                <div className="w-full pt-4">
                  <ul className="space-y-3 text-sm text-gray-600 text-left">
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>15 structured sections across 3 levels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Interactive quizzes and assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Earn certificates upon completion</span>
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  size="lg"
                >
                  Enter as Learner
                </Button>
              </div>
            </div>
          </Card>

          {/* Admin Card - Only visible to admins */}
          {isAdmin && (
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-500 cursor-pointer">
            <div className="p-8" onClick={handleAdminLogin}>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-6 bg-purple-100 rounded-full group-hover:bg-purple-500 transition-colors duration-300">
                  <Shield className="h-12 w-12 text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Admin Panel
                  </h2>
                  <p className="text-gray-600">
                    Manage courses, track progress, and configure the learning platform
                  </p>
                </div>

                <div className="w-full pt-4">
                  <ul className="space-y-3 text-sm text-gray-600 text-left">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>Create and edit course content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>Manage question banks and assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>Track learner progress and analytics</span>
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  Admin Login
                </Button>
              </div>
            </div>
          </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Sipper • Advanced E-Learning Platform</p>
        </div>
      </div>

      {/* Admin PIN Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Admin Authentication
            </DialogTitle>
            <DialogDescription>
              Enter your admin PIN to access the admin panel
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Admin PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="font-mono"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdminDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Login
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">Default PIN:</p>
            <code className="bg-white px-2 py-1 rounded border">SIPPER-ADMIN</code>
            <p className="mt-2 text-gray-500">
              (For demo purposes. In production, use secure authentication.)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
