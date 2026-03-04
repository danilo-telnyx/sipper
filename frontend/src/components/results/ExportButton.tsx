import { useState } from 'react'
import { Button } from '../ui/button'
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TestResult } from '../../types/index'
import { exportToJSON, exportToCSV, exportToPDF } from '../../utils/exportResults'
import { useToast } from '../../hooks/use-toast'

interface ExportButtonProps {
  testResult: TestResult
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportButton({ testResult, variant = 'outline', size = 'default' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      let filename: string

      switch (format) {
        case 'json':
          filename = exportToJSON(testResult)
          break
        case 'csv':
          filename = exportToCSV(testResult)
          break
        case 'pdf':
          filename = await exportToPDF(testResult)
          break
      }

      toast({
        title: 'Export successful',
        description: `Test results exported as ${filename}`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export test results. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 focus:bg-gray-100 outline-none"
            onSelect={() => handleExport('json')}
          >
            <FileJson className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium">JSON</div>
              <div className="text-xs text-muted-foreground">
                Raw data with all details
              </div>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 focus:bg-gray-100 outline-none"
            onSelect={() => handleExport('csv')}
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="font-medium">CSV</div>
              <div className="text-xs text-muted-foreground">
                Tabular format for analysis
              </div>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 focus:bg-gray-100 outline-none"
            onSelect={() => handleExport('pdf')}
          >
            <FileText className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <div className="font-medium">PDF Report</div>
              <div className="text-xs text-muted-foreground">
                Formatted printable report
              </div>
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
