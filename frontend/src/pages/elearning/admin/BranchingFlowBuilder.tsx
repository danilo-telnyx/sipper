/**
 * Branching Flow Builder Module - A3
 * Visual flow diagram builder for quiz branching logic
 */
import { useState, useRef, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Award
} from 'lucide-react';
import { useELearningAdmin, BranchingRule } from '@/contexts/ELearningAdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FlowNode {
  id: string;
  type: 'section' | 'quiz' | 'condition' | 'final' | 'action';
  label: string;
  x: number;
  y: number;
  sectionId?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label: 'pass' | 'fail' | '';
  color: string;
}

export default function BranchingFlowBuilder() {
  const {
    sections,
    branchingRules,
    updateBranchingRule,
    resetBranchingFlow,
    saveBranchingFlow,
  } = useELearningAdmin();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedRule, setSelectedRule] = useState<BranchingRule | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  
  // Initialize nodes from sections
  useEffect(() => {
    if (sections.length > 0 && nodes.length === 0) {
      const initialNodes: FlowNode[] = sections.map((section, index) => ({
        id: `section-${section.id}`,
        type: 'section',
        label: section.title,
        x: 100,
        y: 100 + (index * 120),
        sectionId: section.id,
      }));
      
      // Add final test node
      initialNodes.push({
        id: 'final-test',
        type: 'final',
        label: 'Final Test',
        x: 500,
        y: 100 + (sections.length * 120),
      });
      
      setNodes(initialNodes);
      generateEdgesFromRules();
    }
  }, [sections]);
  
  // Generate edges from branching rules
  const generateEdgesFromRules = () => {
    const newEdges: FlowEdge[] = [];
    
    branchingRules.forEach(rule => {
      const sectionNode = `section-${rule.section_id}`;
      
      // Pass edge
      if (rule.on_pass.type === 'proceed' && rule.on_pass.target) {
        newEdges.push({
          from: sectionNode,
          to: rule.on_pass.target,
          label: 'pass',
          color: '#10B981',
        });
      }
      
      // Fail edge
      if (rule.on_fail.type === 'retry') {
        newEdges.push({
          from: sectionNode,
          to: sectionNode,
          label: 'fail',
          color: '#EF4444',
        });
      } else if (rule.on_fail.target) {
        newEdges.push({
          from: sectionNode,
          to: rule.on_fail.target,
          label: 'fail',
          color: '#EF4444',
        });
      }
    });
    
    setEdges(newEdges);
  };
  
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const rule = branchingRules.find(r => r.section_id === sectionId);
    setSelectedRule(rule || null);
  };
  
  const handleUpdateRule = (field: string, value: any) => {
    if (!selectedSectionId) return;
    
    const currentRule = branchingRules.find(r => r.section_id === selectedSectionId) || {
      section_id: selectedSectionId,
      quiz_number: 1,
      score_threshold: 2,
      on_pass: { type: 'proceed' as const },
      on_fail: { type: 'retry' as const },
    };
    
    const updates: Partial<BranchingRule> = {
      ...currentRule,
      [field]: value,
    };
    
    updateBranchingRule(selectedSectionId, updates);
    generateEdgesFromRules();
  };
  
  const handleSave = async () => {
    await saveBranchingFlow();
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the branching flow to default?')) {
      resetBranchingFlow();
      generateEdgesFromRules();
    }
  };
  
  const handleExport = () => {
    const exportData = {
      rules: branchingRules,
      nodes,
      edges,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'branching-flow.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    try {
      const data = JSON.parse(importJson);
      if (data.rules && Array.isArray(data.rules)) {
        // TODO: Import rules into context
        setImportDialogOpen(false);
        setImportJson('');
      }
    } catch (error) {
      alert('Invalid JSON format');
    }
  };
  
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'section':
        return <BookOpen className="h-5 w-5" />;
      case 'quiz':
        return <FileText className="h-5 w-5" />;
      case 'final':
        return <Award className="h-5 w-5" />;
      case 'action':
        return <GitBranch className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'section':
        return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'quiz':
        return 'bg-yellow-100 border-yellow-400 text-yellow-900';
      case 'condition':
        return 'bg-green-100 border-green-400 text-green-900';
      case 'final':
        return 'bg-red-100 border-red-400 text-red-900';
      case 'action':
        return 'bg-purple-100 border-purple-400 text-purple-900';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-900';
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Left Panel - Flow Configuration */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Section Rules</h3>
            <Select value={selectedSectionId} onValueChange={handleSelectSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedSectionId && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Pass Threshold
                </label>
                <Select
                  value={selectedRule?.score_threshold.toString() || '2'}
                  onValueChange={(v) => handleUpdateRule('score_threshold', parseInt(v))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0/3 (any score)</SelectItem>
                    <SelectItem value="1">1/3 correct</SelectItem>
                    <SelectItem value="2">2/3 correct</SelectItem>
                    <SelectItem value="3">3/3 correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <CheckCircle className="inline h-3 w-3 mr-1 text-green-600" />
                  On Pass
                </label>
                <div className="space-y-2">
                  <Select
                    value={selectedRule?.on_pass.type || 'proceed'}
                    onValueChange={(v) => handleUpdateRule('on_pass', { 
                      ...selectedRule?.on_pass,
                      type: v 
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proceed">Proceed to next</SelectItem>
                      <SelectItem value="skip">Skip section</SelectItem>
                      <SelectItem value="unlock-bonus">Unlock bonus</SelectItem>
                      <SelectItem value="award-badge">Award badge</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedRule?.on_pass.type === 'award-badge' && (
                    <Input
                      placeholder="Badge name"
                      value={selectedRule.on_pass.badge || ''}
                      onChange={(e) => handleUpdateRule('on_pass', {
                        ...selectedRule.on_pass,
                        badge: e.target.value
                      })}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <XCircle className="inline h-3 w-3 mr-1 text-red-600" />
                  On Fail
                </label>
                <div className="space-y-2">
                  <Select
                    value={selectedRule?.on_fail.type || 'retry'}
                    onValueChange={(v) => handleUpdateRule('on_fail', {
                      ...selectedRule?.on_fail,
                      type: v
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retry">Allow retry</SelectItem>
                      <SelectItem value="remediation">Show remediation</SelectItem>
                      <SelectItem value="block">Block progression</SelectItem>
                      <SelectItem value="show-message">Show message</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedRule?.on_fail.type === 'show-message' && (
                    <Input
                      placeholder="Message text"
                      value={selectedRule.on_fail.message || ''}
                      onChange={(e) => handleUpdateRule('on_fail', {
                        ...selectedRule.on_fail,
                        message: e.target.value
                      })}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t space-y-2">
            <Button
              onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Flow
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Branching Flow</DialogTitle>
                  <DialogDescription>
                    Paste the JSON configuration below
                  </DialogDescription>
                </DialogHeader>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  rows={10}
                  className="w-full p-3 border rounded font-mono text-sm"
                  placeholder='{"rules": [...], "nodes": [...], "edges": [...]}'
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} className="bg-purple-600 hover:bg-purple-700">
                    Import
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Visual Flow Diagram */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Flow Diagram</h2>
            <p className="text-sm text-gray-600">Visual representation of quiz branching logic</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>Section</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>Quiz</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>Final Test</span>
            </div>
          </div>
        </div>
        
        <div
          ref={canvasRef}
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[600px] bg-gray-50"
        >
          {/* SVG for edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;
              
              const x1 = fromNode.x + 100;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x;
              const y2 = toNode.y + 30;
              
              return (
                <g key={index}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={edge.color}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 5}
                    fill={edge.color}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
            
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
              </marker>
            </defs>
          </svg>
          
          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute border-2 rounded-lg p-3 cursor-pointer transition-all ${getNodeColor(node.type)} ${
                selectedSectionId && node.sectionId === selectedSectionId
                  ? 'ring-2 ring-purple-600 ring-offset-2'
                  : ''
              }`}
              style={{
                left: node.x,
                top: node.y,
                minWidth: '200px',
              }}
              onClick={() => node.sectionId && handleSelectSection(node.sectionId)}
            >
              <div className="flex items-center gap-2">
                {getNodeIcon(node.type)}
                <div className="flex-1">
                  <div className="font-semibold text-sm">{node.label}</div>
                  <div className="text-xs opacity-75">{node.type}</div>
                </div>
              </div>
            </div>
          ))}
          
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sections available</p>
                <p className="text-sm">Add sections to build the flow</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Flow Logic Summary</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Pass:</strong> Learner scores ≥ threshold → proceeds to next section</li>
            <li>• <strong>Fail:</strong> Learner scores &lt; threshold → retry or remediation</li>
            <li>• <strong>Final Test:</strong> Available after all sections completed</li>
            <li>• Click on a section node to configure its branching rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
