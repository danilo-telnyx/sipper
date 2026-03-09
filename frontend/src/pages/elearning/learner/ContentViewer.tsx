/**
 * Content Viewer - Markdown renderer with SIP message examples and callouts
 */
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  AlertCircle,
  Info,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Section } from '@/contexts/ELearningContext';

interface Callout {
  type: 'tip' | 'warning' | 'info';
  text: string;
}

interface ContentViewerProps {
  section: Section;
  onPrevious?: () => void;
  onNext?: () => void;
  onStartQuiz: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isQuizCompleted: boolean;
}

export default function ContentViewer({
  section,
  onPrevious,
  onNext,
  onStartQuiz,
  hasPrevious,
  hasNext,
  isQuizCompleted,
}: ContentViewerProps) {
  // Extract callouts from section metadata (mock for now)
  const callouts: Callout[] = [
    // These would come from section data in production
    // { type: 'tip', text: 'SIP uses Request/Response model similar to HTTP' },
  ];

  const CalloutComponent = ({ type, text }: Callout) => {
    const config = {
      tip: {
        icon: Lightbulb,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon_color: 'text-blue-600',
        text_color: 'text-blue-900',
      },
      warning: {
        icon: AlertCircle,
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon_color: 'text-yellow-600',
        text_color: 'text-yellow-900',
      },
      info: {
        icon: Info,
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        icon_color: 'text-teal-600',
        text_color: 'text-teal-900',
      },
    };

    const { icon: Icon, bg, border, icon_color, text_color } = config[type];

    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border-l-4 my-4',
          bg,
          border
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', icon_color)} />
        <p className={cn('text-sm', text_color)}>{text}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {section.title}
          </h1>
          <div className="h-1 w-20 bg-teal-500 rounded-full mb-8" />

          {/* Markdown Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';

                  // Special handling for SIP messages
                  const isSipMessage =
                    language === 'sip' ||
                    String(children).includes('INVITE sip:') ||
                    String(children).includes('SIP/2.0');

                  return !inline ? (
                    <div className="my-6">
                      {isSipMessage && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono rounded-t-lg border-b border-gray-700">
                          <span>SIP Message Example</span>
                        </div>
                      )}
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={isSipMessage ? 'http' : language}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: isSipMessage
                            ? '0 0 0.5rem 0.5rem'
                            : '0.5rem',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      className="px-1.5 py-0.5 bg-gray-100 text-teal-700 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a: ({ node, children, href, ...props }: any) => {
                  // Special handling for RFC references
                  const isRFC = href?.includes('rfc') || href?.includes('RFC');
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-teal-600 hover:text-teal-700 underline',
                        isRFC && 'font-semibold'
                      )}
                      {...props}
                    >
                      {children}
                      {isRFC && (
                        <span className="ml-1 text-xs align-super">RFC</span>
                      )}
                    </a>
                  );
                },
                h1: ({ node, children, ...props }: any) => (
                  <h1
                    className="text-2xl font-bold text-gray-900 mt-8 mb-4"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ node, children, ...props }: any) => (
                  <h2
                    className="text-xl font-bold text-gray-900 mt-6 mb-3"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ node, children, ...props }: any) => (
                  <h3
                    className="text-lg font-semibold text-gray-900 mt-4 mb-2"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ node, children, ...props }: any) => (
                  <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ node, children, ...props }: any) => (
                  <ul className="list-disc list-inside space-y-2 mb-4" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ node, children, ...props }: any) => (
                  <ol
                    className="list-decimal list-inside space-y-2 mb-4"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>

          {/* Callouts */}
          {callouts.map((callout, index) => (
            <CalloutComponent key={index} {...callout} />
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-200 bg-white px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Section
          </Button>

          {/* Quiz Button */}
          <Button
            onClick={onStartQuiz}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            {isQuizCompleted ? 'Review Quiz' : 'Start Quiz'}
          </Button>

          {/* Next Button */}
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            Next Section
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
