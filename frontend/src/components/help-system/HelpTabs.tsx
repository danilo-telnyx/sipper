/**
 * Help Tabs Component
 * Tabbed interface for Guide, Examples, RFCs, Troubleshooting
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Copy, Check, ExternalLink, AlertCircle, BookOpen, Code, FileText, Wrench } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import type { HelpContent } from './types'

interface HelpTabsProps {
  content: HelpContent
}

type TabType = 'guide' | 'examples' | 'rfcs' | 'troubleshooting'

export function HelpTabs({ content }: HelpTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guide')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopyCode = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(title)
      toast({
        title: 'Copied to clipboard',
        description: `${title} copied successfully.`,
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      })
    }
  }

  const tabs = [
    { id: 'guide', label: 'Guide', icon: BookOpen, count: content.guide.length },
    { id: 'examples', label: 'Examples', icon: Code, count: content.examples.length },
    { id: 'rfcs', label: 'RFCs', icon: FileText, count: content.rfcs.length },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench, count: content.troubleshooting.length },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap
                ${isActive
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <>
            {content.guide.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{section.heading}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {section.content}
                  </p>
                  {section.steps && (
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {section.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <>
            {content.examples.map((example, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{example.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {example.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {example.language}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono">
                      <code>{example.code}</code>
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode(example.code, example.title)}
                    >
                      {copiedCode === example.title ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {content.examples.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No code examples available.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* RFCs Tab */}
        {activeTab === 'rfcs' && (
          <>
            {content.rfcs.map((rfc, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        RFC {rfc.number} - {rfc.title}
                      </CardTitle>
                      {rfc.section && (
                        <CardDescription className="text-sm mt-1">
                          Section: {rfc.section}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{rfc.description}</p>
                  <a
                    href={rfc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Read full RFC
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
            {content.rfcs.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No RFC references available.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Troubleshooting Tab */}
        {activeTab === 'troubleshooting' && (
          <>
            {content.troubleshooting.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.problem}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Solution:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {item.solution}
                    </p>
                  </div>
                  {item.relatedRFC && (
                    <Badge variant="outline" className="text-xs">
                      Related: {item.relatedRFC}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
            {content.troubleshooting.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No troubleshooting tips available.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
