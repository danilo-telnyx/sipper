/**
 * Certificates Page - View earned certificates
 */
import { useState, useEffect } from 'react';
import { Award, Download } from 'lucide-react';
import { getMyCertificates, downloadCertificate, Certificate } from '@/services/elearningService';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await getMyCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId: string) => {
    try {
      await downloadCertificate(certId);
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h2>
          <p className="text-gray-600 mb-6">
            Complete courses and pass exams to earn certificates!
          </p>
          <a
            href="/elearning/courses"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Courses
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
        <p className="text-gray-600">
          You have earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-lg shadow p-6 border-2 border-yellow-400">
            <div className="flex items-start justify-between mb-4">
              <Award className="h-12 w-12 text-yellow-500" />
              <span className="text-xs text-gray-500">
                {new Date(cert.issued_at).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {cert.course_title || 'SIP Certificate'}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Level: <span className="font-semibold">{cert.course_level?.toUpperCase()}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Certificate #: <span className="font-mono text-xs">{cert.certificate_number}</span>
            </p>
            
            <button
              onClick={() => handleDownload(cert.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
