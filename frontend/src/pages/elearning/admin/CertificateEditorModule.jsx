/**
 * Certificate Editor Module - A3
 * Admin interface for designing certificate templates with live preview
 */
import { useState, useEffect } from 'react';
import { Award, Save, RotateCcw, Printer, Upload, Download } from 'lucide-react';
import { useELearning } from '@/contexts/ELearningContext';
import { useToast } from '@/hooks/use-toast';

const BORDER_STYLES = [
  { id: 'classic', name: 'Classic', pattern: 'double' },
  { id: 'minimal', name: 'Minimal', pattern: 'solid' },
  { id: 'technical', name: 'Technical', pattern: 'dashed' },
  { id: 'telecom-grid', name: 'Telecom Grid', pattern: 'grid' },
];

const COLOR_SCHEMES = [
  { id: 'dark-navy', name: 'Dark Navy', primary: '#0F172A', secondary: '#1E40AF', accent: '#60A5FA' },
  { id: 'white-formal', name: 'White Formal', primary: '#000000', secondary: '#374151', accent: '#D1D5DB' },
  { id: 'teal-accent', name: 'Teal Accent', primary: '#115E59', secondary: '#14B8A6', accent: '#5EEAD4' },
  { id: 'custom', name: 'Custom', primary: '#7C3AED', secondary: '#A78BFA', accent: '#DDD6FE' },
];

const DEFAULT_TEMPLATE = {
  title: 'Certificate of Completion',
  subtitle: 'This is to certify that',
  orgName: 'SIP Training Academy',
  authorityLine: 'Has successfully completed the',
  signatures: [
    { name: 'John Doe', title: 'Director of Training' },
    { name: 'Jane Smith', title: 'Chief Instructor' },
  ],
  certIdPrefix: 'SIP-CERT-',
  verificationUrl: 'https://verify.siptraining.com',
  logo: null,
  borderStyle: 'classic',
  colorScheme: 'dark-navy',
  customColors: { primary: '#7C3AED', secondary: '#A78BFA', accent: '#DDD6FE' },
  footer: 'Accredited by International SIP Consortium',
  showScore: true,
  showDate: true,
  showCertId: true,
};

export default function CertificateEditorModule() {
  const { state, dispatch } = useELearning();
  const { toast } = useToast();
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [logoPreview, setLogoPreview] = useState(null);

  // Load template from context on mount
  useEffect(() => {
    if (state.certificateTemplate) {
      const merged = {
        ...DEFAULT_TEMPLATE,
        ...state.certificateTemplate,
        borderStyle: state.certificateTemplate.layout || DEFAULT_TEMPLATE.borderStyle,
        colorScheme: state.certificateTemplate.styling?.primaryColor 
          ? 'custom' 
          : DEFAULT_TEMPLATE.colorScheme,
        customColors: state.certificateTemplate.styling || DEFAULT_TEMPLATE.customColors,
        showScore: state.certificateTemplate.fields?.includeScore ?? true,
        showDate: state.certificateTemplate.fields?.includeDate ?? true,
        showCertId: true,
      };
      setTemplate(merged);
    }
  }, [state.certificateTemplate]);

  const handleChange = (field, value) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureChange = (index, field, value) => {
    const newSignatures = [...template.signatures];
    newSignatures[index] = { ...newSignatures[index], [field]: value };
    setTemplate(prev => ({ ...prev, signatures: newSignatures }));
  };

  const addSignature = () => {
    setTemplate(prev => ({
      ...prev,
      signatures: [...prev.signatures, { name: '', title: '' }],
    }));
  };

  const removeSignature = (index) => {
    setTemplate(prev => ({
      ...prev,
      signatures: prev.signatures.filter((_, i) => i !== index),
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setLogoPreview(dataUrl);
        setTemplate(prev => ({ ...prev, logo: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSchemeChange = (schemeId) => {
    const scheme = COLOR_SCHEMES.find(s => s.id === schemeId);
    setTemplate(prev => ({
      ...prev,
      colorScheme: schemeId,
      customColors: scheme ? { primary: scheme.primary, secondary: scheme.secondary, accent: scheme.accent } : prev.customColors,
    }));
  };

  const handleCustomColorChange = (colorType, value) => {
    setTemplate(prev => ({
      ...prev,
      customColors: { ...prev.customColors, [colorType]: value },
    }));
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_CERTIFICATE_TEMPLATE',
      payload: {
        layout: template.borderStyle,
        fields: {
          includeScore: template.showScore,
          includeDate: template.showDate,
          includeInstructorSignature: template.signatures.length > 0,
          customMessage: template.footer,
        },
        styling: {
          primaryColor: template.customColors.primary,
          secondaryColor: template.customColors.secondary,
          fontFamily: 'Inter',
        },
      },
    });

    toast({
      title: 'Template Saved',
      description: 'Certificate template has been updated successfully.',
    });
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    setLogoPreview(null);
    toast({
      title: 'Template Reset',
      description: 'Certificate template reset to default.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getActiveColorScheme = () => {
    if (template.colorScheme === 'custom') {
      return template.customColors;
    }
    const scheme = COLOR_SCHEMES.find(s => s.id === template.colorScheme);
    return scheme ? { primary: scheme.primary, secondary: scheme.secondary, accent: scheme.accent } : template.customColors;
  };

  const activeColors = getActiveColorScheme();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Certificate Template Editor</h1>
          </div>
          <p className="text-purple-100">Design and customize certificate appearance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EDITOR PANEL */}
          <div className="space-y-6">
            {/* Basic Fields */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={template.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={template.subtitle}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={template.orgName}
                    onChange={(e) => handleChange('orgName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authority Line</label>
                  <input
                    type="text"
                    value={template.authorityLine}
                    onChange={(e) => handleChange('authorityLine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Has successfully completed the..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                  <textarea
                    value={template.footer}
                    onChange={(e) => handleChange('footer', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Signatures
              </h2>

              <div className="space-y-3">
                {template.signatures.map((sig, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) => handleSignatureChange(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={sig.title}
                        onChange={(e) => handleSignatureChange(index, 'title', e.target.value)}
                        placeholder="Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeSignature(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md mt-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSignature}
                  className="w-full px-4 py-2 text-purple-600 border-2 border-dashed border-purple-300 rounded-md hover:bg-purple-50"
                >
                  + Add Signature
                </button>
              </div>
            </div>

            {/* Design Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Design & Style
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BORDER_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => handleChange('borderStyle', style.id)}
                        className={`px-4 py-2 rounded-md border-2 transition ${
                          template.borderStyle === style.id
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {COLOR_SCHEMES.map(scheme => (
                      <button
                        key={scheme.id}
                        onClick={() => handleColorSchemeChange(scheme.id)}
                        className={`px-4 py-2 rounded-md border-2 transition flex items-center gap-2 ${
                          template.colorScheme === scheme.id
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        {scheme.name}
                      </button>
                    ))}
                  </div>

                  {template.colorScheme === 'custom' && (
                    <div className="space-y-2 mt-4 p-4 bg-purple-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700">Custom Colors</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Primary</label>
                          <input
                            type="color"
                            value={template.customColors.primary}
                            onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Secondary</label>
                          <input
                            type="color"
                            value={template.customColors.secondary}
                            onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Accent</label>
                          <input
                            type="color"
                            value={template.customColors.accent}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </label>
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain border rounded" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate ID Prefix</label>
                  <input
                    type="text"
                    value={template.certIdPrefix}
                    onChange={(e) => handleChange('certIdPrefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SIP-CERT-"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification URL</label>
                  <input
                    type="url"
                    value={template.verificationUrl}
                    onChange={(e) => handleChange('verificationUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://verify.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Display Options
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.showScore}
                    onChange={(e) => handleChange('showScore', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Learner Score</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.showDate}
                    onChange={(e) => handleChange('showDate', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Issue Date</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.showCertId}
                    onChange={(e) => handleChange('showCertId', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Certificate ID</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <Save className="h-5 w-5" />
                Save Template
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <Printer className="h-5 w-5" />
                Preview Print
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
            </div>
          </div>

          {/* LIVE PREVIEW PANEL */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Preview
              </h2>

              {/* Certificate Preview */}
              <div
                className="bg-white p-8 border-8 rounded-lg shadow-2xl"
                style={{
                  borderColor: activeColors.primary,
                  borderStyle: template.borderStyle === 'telecom-grid' ? 'solid' : BORDER_STYLES.find(s => s.id === template.borderStyle)?.pattern || 'double',
                  backgroundImage: template.borderStyle === 'telecom-grid' 
                    ? `linear-gradient(${activeColors.accent}22 1px, transparent 1px), linear-gradient(90deg, ${activeColors.accent}22 1px, transparent 1px)`
                    : 'none',
                  backgroundSize: template.borderStyle === 'telecom-grid' ? '20px 20px' : 'auto',
                }}
              >
                {/* Logo */}
                {logoPreview && (
                  <div className="flex justify-center mb-4">
                    <img src={logoPreview} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}

                {/* Title */}
                <h1
                  className="text-4xl font-bold text-center mb-2"
                  style={{ color: activeColors.primary }}
                >
                  {template.title}
                </h1>

                {/* Subtitle */}
                <p
                  className="text-center text-lg mb-6"
                  style={{ color: activeColors.secondary }}
                >
                  {template.subtitle}
                </p>

                {/* Learner Name (Sample) */}
                <div className="text-center mb-6">
                  <p
                    className="text-3xl font-bold mb-2"
                    style={{ color: activeColors.primary }}
                  >
                    [Learner Name]
                  </p>
                  <p className="text-sm text-gray-600">{template.authorityLine}</p>
                </div>

                {/* Course (Sample) */}
                <div className="text-center mb-6">
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: activeColors.secondary }}
                  >
                    [Course Title]
                  </p>
                  <p className="text-sm text-gray-500">Level: [Basic/Intermediate/Advanced]</p>
                </div>

                {/* Metadata */}
                <div className="flex justify-center gap-8 text-sm text-gray-600 mb-6">
                  {template.showDate && <p>Date: {new Date().toLocaleDateString()}</p>}
                  {template.showScore && <p>Score: 95%</p>}
                </div>

                {/* Signatures */}
                {template.signatures.length > 0 && (
                  <div className={`grid grid-cols-${Math.min(template.signatures.length, 3)} gap-6 mb-6`}>
                    {template.signatures.map((sig, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="border-t-2 pt-2 mb-1"
                          style={{ borderColor: activeColors.secondary }}
                        >
                          <p className="font-semibold text-sm">{sig.name || '[Name]'}</p>
                          <p className="text-xs text-gray-500">{sig.title || '[Title]'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Organization */}
                <p className="text-center text-lg font-semibold mb-4" style={{ color: activeColors.primary }}>
                  {template.orgName}
                </p>

                {/* Footer */}
                {template.footer && (
                  <p className="text-center text-xs text-gray-500 mb-4">{template.footer}</p>
                )}

                {/* Certificate ID */}
                {template.showCertId && (
                  <div className="text-center">
                    <p className="text-xs font-mono text-gray-400">
                      Certificate ID: {template.certIdPrefix}XXXXXX
                    </p>
                    {template.verificationUrl && (
                      <p className="text-xs text-gray-400 mt-1">
                        Verify at: {template.verificationUrl}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
