/**
 * Flow Export Component
 * Export SIP flow diagram to PNG/SVG
 */

import { useState } from 'react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Download, FileImage, FileCode } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import type { SIPFlowData } from './types'

interface FlowExportProps {
  data: SIPFlowData
  onExport?: (format: 'png' | 'svg') => void
}

export function FlowExport({ data, onExport }: FlowExportProps) {
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
        a.download = `sip-flow-${data.testId}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: 'Export successful',
          description: `Flow data exported as JSON.`,
        })
      } else {
        // PNG/SVG export would require html2canvas or similar library
        // For now, notify that it's not implemented
        toast({
          title: 'Export to image',
          description: `${format.toUpperCase()} export will be available soon. Use JSON export for now.`,
          variant: 'default',
        })
        
        if (onExport) {
          onExport(format)
        }
      }
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export flow diagram.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
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
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as PNG (Soon)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('svg')}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as SVG (Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
