/**
 * Contextual Help Panel
 * Sprint 3: Help System (v0.5.0)
 * Collapsible right-side panel with context-aware help content
 */

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X, BookOpen, Code, FileText, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { HelpTabs } from './HelpTabs'
import { getHelpContent } from './helpContent'
import type { HelpContent } from './types'

interface ContextualHelpPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ContextualHelpPanel({ isOpen, onClose }: ContextualHelpPanelProps) {
  const location = useLocation()
  const [content, setContent] = useState<HelpContent | null>(null)

  useEffect(() => {
    // Detect context based on current route
    const helpContent = getHelpContent(location.pathname)
    setContent(helpContent)
  }, [location.pathname])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Help Panel */}
      <aside
        className={`
          fixed right-0 top-0 bottom-0 z-50
          w-full sm:w-[400px] lg:w-[450px]
          bg-background border-l shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto
        `}
        aria-label="Help panel"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b z-10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Help & Documentation</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close help panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {content ? (
            <>
              {/* Page Title */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{content.title}</CardTitle>
                      <CardDescription>{content.description}</CardDescription>
                    </div>
                    {content.category && (
                      <Badge variant="outline">{content.category}</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Tabbed Content */}
              <HelpTabs content={content} />
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No help content available for this page.</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="https://datatracker.ietf.org/doc/html/rfc3261"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                RFC 3261 (SIP Protocol)
              </a>
              <a
                href="https://datatracker.ietf.org/doc/html/rfc3515"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                RFC 3515 (REFER Method)
              </a>
              <a
                href="https://datatracker.ietf.org/doc/html/rfc7865"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                RFC 7865 (Session Recording)
              </a>
              <a
                href="https://github.com/danilo-telnyx/sipper"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Code className="h-4 w-4" />
                GitHub Repository
              </a>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Toggle Help</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">?</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Close Help</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">ESC</kbd>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </>
  )
}
