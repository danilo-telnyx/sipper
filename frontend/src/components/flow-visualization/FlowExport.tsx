/**
 * Flow Export Component
 * Export SIP flow diagram to PNG/SVG/JSON
 */

import { useState } from 'react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Download, FileImage, FileCode } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import html2canvas from 'html2canvas'
import type { SIPFlowData } from './types'

interface FlowExportProps {
  data: SIPFlowData
  diagramRef?: React.RefObject<HTMLDivElement>
  onExport?: (format: 'png' | 'svg' | 'json') => void
}

export function FlowExport({ data, diagramRef, onExport }: FlowExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'png' | 'svg' | 'json') => {
    setIsExporting(true)
    
    try {
      if (format === 'json') {
        // Export as JSON
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sip-flow-${data.testId || 'export'}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: 'Export successful',
          description: `Flow data exported as JSON.`,
        })
      } else if (format === 'png' && diagramRef?.current) {
        // Export as PNG using html2canvas
        const canvas = await html2canvas(diagramRef.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true
        })
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sip-flow-${data.testId || 'export'}.png`
            a.click()
            URL.revokeObjectURL(url)
            
            toast({
              title: 'Export successful',
              description: `Flow diagram exported as PNG.`,
            })
          }
        })
      } else if (format === 'svg' && diagramRef?.current) {
        // Export as SVG by serializing the DOM
        const svgData = await exportToSVG(diagramRef.current, data)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sip-flow-${data.testId || 'export'}.svg`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: 'Export successful',
          description: `Flow diagram exported as SVG.`,
        })
      } else if (!diagramRef?.current) {
        toast({
          title: 'Export failed',
          description: 'Diagram element not found. Please try again.',
          variant: 'destructive',
        })
      }
      
      if (onExport) {
        onExport(format)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export failed',
        description: 'Could not export flow diagram. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Export diagram to SVG format
   */
  async function exportToSVG(element: HTMLElement, flowData: SIPFlowData): Promise<string> {
    const bbox = element.getBoundingClientRect()
    const width = bbox.width
    const height = bbox.height
    
    // Create SVG with embedded HTML as foreignObject
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    svg.setAttribute('xmlns', svgNS)
    
    // Clone the element and get computed styles
    const clone = element.cloneNode(true) as HTMLElement
    const foreignObject = document.createElementNS(svgNS, 'foreignObject')
    foreignObject.setAttribute('x', '0')
    foreignObject.setAttribute('y', '0')
    foreignObject.setAttribute('width', String(width))
    foreignObject.setAttribute('height', String(height))
    
    // Embed styles inline
    inlineStyles(clone)
    
    foreignObject.appendChild(clone)
    svg.appendChild(foreignObject)
    
    // Serialize to string
    const serializer = new XMLSerializer()
    return serializer.serializeToString(svg)
  }

  /**
   * Inline all CSS styles to make SVG standalone
   */
  function inlineStyles(element: HTMLElement) {
    const allElements = [element, ...Array.from(element.querySelectorAll('*'))]
    
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(el)
        const styleString = Array.from(computedStyle)
          .filter(key => computedStyle.getPropertyValue(key)) // Only non-empty values
          .map(key => `${key}:${computedStyle.getPropertyValue(key)}`)
          .join(';')
        
        el.setAttribute('style', styleString)
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isExporting || data.messages.length === 0}
          title="Export diagram"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileCode className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('png')} disabled={!diagramRef?.current}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('svg')} disabled={!diagramRef?.current}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
