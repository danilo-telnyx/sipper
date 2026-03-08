/**
 * Help System Types
 * Sprint 3: Help System (v0.5.0)
 */

export interface HelpContent {
  title: string
  description: string
  category?: string
  guide: GuideSection[]
  examples: CodeExample[]
  rfcs: RFCReference[]
  troubleshooting: TroubleshootingItem[]
}

export interface GuideSection {
  heading: string
  content: string
  steps?: string[]
}

export interface CodeExample {
  title: string
  description: string
  language: 'javascript' | 'typescript' | 'python' | 'json' | 'sip' | 'shell'
  code: string
}

export interface RFCReference {
  number: string
  title: string
  section?: string
  url: string
  description: string
}

export interface TroubleshootingItem {
  problem: string
  solution: string
  relatedRFC?: string
}
