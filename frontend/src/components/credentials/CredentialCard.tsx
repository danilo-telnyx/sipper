import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Edit, Trash2, Copy, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { TestConnectionButton } from './TestConnectionButton'
import { formatDate } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'
import type { SipCredential } from '../../types/index'

interface CredentialCardProps {
  credential: SipCredential
  onEdit: (credential: SipCredential) => void
  onDelete: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function CredentialCard({
  credential,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: CredentialCardProps) {
  const { toast } = useToast()

  const getStatusBadge = () => {
    if (credential.isActive) {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      )
    }
    
    if (credential.lastTestedAt) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-800">
        <AlertTriangle className="h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
  }

  const getTransportColor = (transport: string) => {
    switch (transport) {
      case 'TLS':
        return 'text-green-600'
      case 'TCP':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              {credential.name}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{credential.domain}</span>
              <button
                onClick={() => copyToClipboard(credential.domain, 'Domain')}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <Copy className="h-3 w-3" />
              </button>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credential Details */}
        <div className="text-sm space-y-2 border rounded-md p-3 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Username:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{credential.username}</span>
              <button
                onClick={() => copyToClipboard(credential.username, 'Username')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Server:</span>
            <span className="font-mono">{credential.domain}:{credential.port}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transport:</span>
            <Badge variant="outline" className={getTransportColor(credential.transport)}>
              {credential.transport}
            </Badge>
          </div>

          {credential.proxy && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Proxy:</span>
              <span className="font-mono text-xs">{credential.proxy}</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDate(credential.createdAt)}</span>
          </div>
          {credential.lastTestedAt && (
            <div className="flex justify-between">
              <span>Last tested:</span>
              <span>{formatDate(credential.lastTestedAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <TestConnectionButton credential={credential} variant="outline" size="sm" />
          
          <div className="flex-1" />

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(credential)}
              className="gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(credential.id)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
