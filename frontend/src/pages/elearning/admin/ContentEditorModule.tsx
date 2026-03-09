/**
 * Content Editor Module - A1
 * Edit course sections with rich content, SIP blocks, callouts, ladder diagrams, and key takeaways
 */
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Eye, Save, Plus, GripVertical, AlertCircle, Info, Lightbulb, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useELearningAdmin } from '@/contexts/ELearningAdminContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function ContentEditorModule() {
  const {
    sections,
    selectedSection,
    selectSection,
    updateSection,
    reorderSections,
    saveSection,
  } = useELearningAdmin();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);
  const [sipModalOpen, setSipModalOpen] = useState(false);
  const [calloutModalOpen, setCalloutModalOpen] = useState(false);
  const [ladderModalOpen, setLadderModalOpen] = useState(false);
  const [newSipContent, setNewSipContent] = useState('');
  const [newCalloutType, setNewCalloutType] = useState<'tip' | 'mistake' | 'rfc' | 'info'>('tip');
  const [newCalloutContent, setNewCalloutContent] = useState('');
  const [newLadderInput, setNewLadderInput] = useState('');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderSections(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };
  
  const handleSave = async () => {
    if (selectedSection) {
      await saveSection(selectedSection.id);
    }
  };
  
  const addSIPBlock = () => {
    if (!selectedSection || !newSipContent.trim()) return;
    const newBlock = {
      id: `sip_${Date.now()}`,
      content: newSipContent,
    };
    updateSection(selectedSection.id, {
      sip_blocks: [...(selectedSection.sip_blocks || []), newBlock],
    });
    setNewSipContent('');
    setSipModalOpen(false);
  };
  
  const addCallout = () => {
    if (!selectedSection || !newCalloutContent.trim()) return;
    const newCallout = {
      id: `callout_${Date.now()}`,
      type: newCalloutType,
      content: newCalloutContent,
    };
    updateSection(selectedSection.id, {
      callouts: [...(selectedSection.callouts || []), newCallout],
    });
    setNewCalloutContent('');
    setCalloutModalOpen(false);
  };
  
  const addLadderDiagram = () => {
    if (!selectedSection || !newLadderInput.trim()) return;
    const lines = newLadderInput.split('\n').filter(l => l.trim());
    const newDiagram = {
      id: `ladder_${Date.now()}`,
      lines,
    };
    updateSection(selectedSection.id, {
      ladder_diagrams: [...(selectedSection.ladder_diagrams || []), newDiagram],
    });
    setNewLadderInput('');
    setLadderModalOpen(false);
  };
  
  const addKeyTakeaway = () => {
    if (!selectedSection || !newTakeaway.trim()) return;
    updateSection(selectedSection.id, {
      key_takeaways: [...(selectedSection.key_takeaways || []), newTakeaway],
    });
    setNewTakeaway('');
  };
  
  const removeKeyTakeaway = (index: number) => {
    if (!selectedSection) return;
    const newTakeaways = [...(selectedSection.key_takeaways || [])];
    newTakeaways.splice(index, 1);
    updateSection(selectedSection.id, { key_takeaways: newTakeaways });
  };
  
  const calloutIcons = {
    tip: <Lightbulb className="h-5 w-5" />,
    mistake: <XCircle className="h-5 w-5" />,
    rfc: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };
  
  const calloutColors = {
    tip: 'bg-green-50 border-green-300 text-green-900',
    mistake: 'bg-red-50 border-red-300 text-red-900',
    rfc: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* Left Panel - Section Tree */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Sections</h2>
        <div className="space-y-1">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`border rounded-lg ${
                selectedSection?.id === section.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 p-3">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex-shrink-0"
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => selectSection(section.id)}
                  className="flex-1 text-left font-medium text-sm"
                >
                  {section.title}
                </button>
                <Switch
                  checked={section.is_published}
                  onCheckedChange={(checked) =>
                    updateSection(section.id, { is_published: checked })
                  }
                />
              </div>
              
              {expandedSections.has(section.id) && (
                <div className="px-10 pb-3 text-sm text-gray-600">
                  <div className="line-clamp-2">{section.content.substring(0, 100)}...</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Panel - Content Editor */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 overflow-y-auto">
        {selectedSection ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <Input
                value={selectedSection.title}
                onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                className="text-xl font-bold flex-1 mr-4"
                placeholder="Section Title"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Section
                </Button>
              </div>
            </div>
            
            {/* Main Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              {previewMode ? (
                <div className="prose max-w-none border rounded-lg p-4 bg-gray-50">
                  <ReactMarkdown>{selectedSection.content}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={selectedSection.content}
                  onChange={(e) => updateSection(selectedSection.id, { content: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Write your content in Markdown..."
                />
              )}
            </div>
            
            {/* Toolbar */}
            <div className="flex gap-2 mb-6 pb-6 border-b">
              <Dialog open={sipModalOpen} onOpenChange={setSipModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SIP Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert SIP Block</DialogTitle>
                    <DialogDescription>
                      Add a SIP protocol example or code block
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={newSipContent}
                    onChange={(e) => setNewSipContent(e.target.value)}
                    rows={8}
                    placeholder="INVITE sip:user@example.com SIP/2.0..."
                    className="font-mono"
                  />
                  <Button onClick={addSIPBlock} className="bg-purple-600 hover:bg-purple-700">
                    Insert
                  </Button>
                </DialogContent>
              </Dialog>
              
              <Dialog open={calloutModalOpen} onOpenChange={setCalloutModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Callout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Callout</DialogTitle>
                    <DialogDescription>
                      Add a highlighted tip, warning, or info box
                    </DialogDescription>
                  </DialogHeader>
                  <Select value={newCalloutType} onValueChange={(v: any) => setNewCalloutType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tip">💡 Tip</SelectItem>
                      <SelectItem value="mistake">❌ Common Mistake</SelectItem>
                      <SelectItem value="rfc">📋 RFC Reference</SelectItem>
                      <SelectItem value="info">ℹ️ Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={newCalloutContent}
                    onChange={(e) => setNewCalloutContent(e.target.value)}
                    rows={4}
                    placeholder="Enter callout content..."
                  />
                  <Button onClick={addCallout} className="bg-purple-600 hover:bg-purple-700">
                    Insert
                  </Button>
                </DialogContent>
              </Dialog>
              
              <Dialog open={ladderModalOpen} onOpenChange={setLadderModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ladder Diagram
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Ladder Diagram</DialogTitle>
                    <DialogDescription>
                      Enter the diagram lines (one per line)
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={newLadderInput}
                    onChange={(e) => setNewLadderInput(e.target.value)}
                    rows={8}
                    placeholder="Alice -> Bob: INVITE&#10;Bob -> Alice: 180 Ringing&#10;Bob -> Alice: 200 OK"
                    className="font-mono"
                  />
                  <Button onClick={addLadderDiagram} className="bg-purple-600 hover:bg-purple-700">
                    Insert
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Inserted Elements Preview */}
            {selectedSection.sip_blocks && selectedSection.sip_blocks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">SIP Blocks</h3>
                {selectedSection.sip_blocks.map((block) => (
                  <pre key={block.id} className="bg-gray-900 text-green-400 p-4 rounded-lg mb-2 overflow-x-auto text-sm">
                    {block.content}
                  </pre>
                ))}
              </div>
            )}
            
            {selectedSection.callouts && selectedSection.callouts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Callouts</h3>
                {selectedSection.callouts.map((callout) => (
                  <div
                    key={callout.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg mb-2 ${calloutColors[callout.type]}`}
                  >
                    {calloutIcons[callout.type]}
                    <div className="flex-1">{callout.content}</div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedSection.ladder_diagrams && selectedSection.ladder_diagrams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Ladder Diagrams</h3>
                {selectedSection.ladder_diagrams.map((diagram) => (
                  <pre key={diagram.id} className="bg-blue-50 p-4 border border-blue-300 rounded-lg mb-2 font-mono text-sm">
                    {diagram.lines.join('\n')}
                  </pre>
                ))}
              </div>
            )}
            
            {/* Key Takeaways */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Takeaways</h3>
              <div className="space-y-2 mb-3">
                {selectedSection.key_takeaways?.map((takeaway, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 p-2 bg-purple-50 border border-purple-200 rounded">
                      {takeaway}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyTakeaway(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTakeaway}
                  onChange={(e) => setNewTakeaway(e.target.value)}
                  placeholder="Add a key takeaway..."
                  onKeyDown={(e) => e.key === 'Enter' && addKeyTakeaway()}
                />
                <Button onClick={addKeyTakeaway} className="bg-purple-600 hover:bg-purple-700">
                  Add
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Select a section to start editing
          </div>
        )}
      </div>
    </div>
  );
}
