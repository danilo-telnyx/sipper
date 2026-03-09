/**
 * E-Learning Admin Hub
 * Central dashboard for admin access to all modules
 */
import { useState } from 'react';
import { Award, Users, Settings, FileEdit, BarChart3, ShieldCheck } from 'lucide-react';
import { CertificateEditorModule, LearnerDashboardModule, SettingsModule } from './admin';

const ADMIN_MODULES = [
  {
    id: 'certificate',
    name: 'Certificate Editor',
    description: 'Design and customize certificate templates',
    icon: Award,
    color: 'yellow',
  },
  {
    id: 'dashboard',
    name: 'Learner Dashboard',
    description: 'Monitor progress and manage learners',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'settings',
    name: 'Course Settings',
    description: 'Configure global course settings',
    icon: Settings,
    color: 'purple',
  },
];

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Mock PIN check - in production, this would validate against backend
  const handlePinSubmit = (e) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('elearning_settings') 
      ? JSON.parse(localStorage.getItem('elearning_settings')).adminPin 
      : '1234';

    if (pinInput === savedPin) {
      setIsAuthorized(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  // Render active module
  if (isAuthorized && activeModule) {
    let ModuleComponent;
    switch (activeModule) {
      case 'certificate':
        ModuleComponent = CertificateEditorModule;
        break;
      case 'dashboard':
        ModuleComponent = LearnerDashboardModule;
        break;
      case 'settings':
        ModuleComponent = SettingsModule;
        break;
      default:
        ModuleComponent = null;
    }

    return (
      <div>
        {/* Back to Hub Button */}
        <div className="bg-white border-b shadow-sm px-6 py-3">
          <button
            onClick={() => setActiveModule(null)}
            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
          >
            ← Back to Admin Hub
          </button>
        </div>

        {ModuleComponent && <ModuleComponent />}
      </div>
    );
  }

  // PIN Entry Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your admin PIN to access management modules
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  pinError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••"
                maxLength={10}
                autoFocus
              />
              {pinError && (
                <p className="text-sm text-red-600 mt-2 text-center">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md"
            >
              Unlock Admin Panel
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Default PIN: 1234 (change in Settings)
          </p>
        </div>
      </div>
    );
  }

  // Admin Hub - Module Selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md text-white px-6 py-8 shadow-lg border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">E-Learning Admin Hub</h1>
              <p className="text-purple-100">Manage courses, learners, and settings</p>
            </div>
            <button
              onClick={() => setIsAuthorized(false)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-semibold"
            >
              Lock Panel
            </button>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ADMIN_MODULES.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
              blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
              purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            };

            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105 text-left"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorClasses[module.color]}`}>
                  <Icon className="h-8 w-8" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {module.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {module.description}
                </p>

                <div className="flex items-center text-purple-600 font-semibold text-sm">
                  Open Module →
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Total Learners</p>
              <p className="text-white text-3xl font-bold">24</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Active Courses</p>
              <p className="text-white text-3xl font-bold">3</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Certificates Issued</p>
              <p className="text-white text-3xl font-bold">18</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Completion Rate</p>
              <p className="text-white text-3xl font-bold">75%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
