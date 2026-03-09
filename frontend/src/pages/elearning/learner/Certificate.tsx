/**
 * Certificate - Generate and download completion certificate
 */
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download,
  Share2,
  Award,
  Mail,
  Twitter,
  Linkedin,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useELearning } from '@/contexts/ELearningContext';

interface CertificateProps {
  sessionId: string;
  learnerName: string;
  score: number;
  completionDate: string;
  onClose?: () => void;
}

export default function Certificate({
  sessionId,
  learnerName,
  score,
  completionDate,
  onClose,
}: CertificateProps) {
  const { state } = useELearning();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const template = state.certificateTemplate;

  // Determine level based on score
  const getLevel = (): string => {
    if (score >= 95) return 'Advanced';
    if (score >= 85) return 'Intermediate';
    return 'Basic';
  };

  const level = getLevel();

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    try {
      // Capture certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `SIPper-Certificate-${learnerName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = (platform: 'email' | 'twitter' | 'linkedin') => {
    const text = `I just completed the SIP E-Learning course with a score of ${score}%! 🎓`;
    const url = window.location.href;

    switch (platform) {
      case 'email':
        window.open(
          `mailto:?subject=SIP Course Completion Certificate&body=${encodeURIComponent(
            text + '\n\n' + url
          )}`
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`
        );
        break;
    }

    setShowShareMenu(false);
  };

  return (
    <div className="space-y-8">
      {/* Certificate Preview */}
      <Card className="overflow-hidden">
        <div
          ref={certificateRef}
          className="relative p-12 bg-gradient-to-br from-white via-teal-50 to-cyan-50"
          style={{
            minHeight: '600px',
            fontFamily: template.styling.fontFamily,
          }}
        >
          {/* Decorative Border */}
          <div
            className="absolute inset-4 border-8 rounded-lg"
            style={{
              borderColor: template.styling.primaryColor,
              opacity: 0.3,
            }}
          />
          <div
            className="absolute inset-6 border-2 rounded-lg"
            style={{
              borderColor: template.styling.secondaryColor,
              opacity: 0.5,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: template.styling.secondaryColor }}
              >
                <Award className="h-10 w-10 text-white" />
              </div>
              <h1
                className="text-5xl font-bold"
                style={{ color: template.styling.primaryColor }}
              >
                Certificate of Completion
              </h1>
              <p className="text-gray-600 text-lg">
                This is to certify that
              </p>
            </div>

            {/* Learner Name */}
            <div className="py-4 border-b-2 border-gray-300 w-96">
              <p
                className="text-4xl font-bold"
                style={{ color: template.styling.primaryColor }}
              >
                {learnerName}
              </p>
            </div>

            {/* Course Info */}
            <div className="space-y-3">
              <p className="text-gray-700 text-lg">
                has successfully completed the
              </p>
              <p className="text-3xl font-bold text-gray-900">
                SIP Protocol E-Learning Course
              </p>
              <p className="text-gray-600">
                {level} Level
              </p>
            </div>

            {/* Score & Date */}
            {template.fields.includeScore && (
              <div className="flex gap-8 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Final Score</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: template.styling.secondaryColor }}
                  >
                    {Math.round(score)}%
                  </p>
                </div>
                {template.fields.includeDate && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {new Date(completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Message */}
            {template.fields.customMessage && (
              <p className="text-gray-600 italic max-w-2xl">
                {template.fields.customMessage}
              </p>
            )}

            {/* Signature */}
            {template.fields.includeInstructorSignature && (
              <div className="mt-8 pt-6 border-t border-gray-300 w-96">
                <div className="text-center space-y-1">
                  <div className="h-12 flex items-center justify-center">
                    <div className="w-48 border-t-2 border-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Instructor Signature
                  </p>
                  <p className="text-xs text-gray-500">SIPper E-Learning</p>
                </div>
              </div>
            )}

            {/* Badge */}
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full border border-green-300">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  Verified Completion
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>

        <div className="relative">
          <Button
            onClick={() => setShowShareMenu(!showShareMenu)}
            variant="outline"
            className="border-teal-300 text-teal-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {showShareMenu && (
            <Card className="absolute top-full mt-2 right-0 p-2 shadow-lg z-20 min-w-[160px]">
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Email</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Linkedin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">LinkedIn</span>
              </button>
            </Card>
          )}
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
