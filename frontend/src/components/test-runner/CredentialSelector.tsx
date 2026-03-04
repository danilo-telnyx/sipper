import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SipCredential } from '@/types'

interface CredentialSelectorProps {
  credentials: SipCredential[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
}

export function CredentialSelector({
  credentials,
  selectedId,
  onSelect,
  disabled = false,
}: CredentialSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCredentials = credentials.filter((cred) =>
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select Credential</CardTitle>
        <CardDescription>
          Choose a SIP credential to test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No credentials match your search' : 'No credentials available'}
            </div>
          ) : (
            filteredCredentials.map((cred) => (
              <div
                key={cred.id}
                onClick={() => !disabled && onSelect(cred.id)}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedId === cred.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-primary/50 hover:bg-accent'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cred.name}</span>
                      {cred.isActive ? (
                        <Badge variant="success" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cred.username}@{cred.domain}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Transport: {cred.transport}</span>
                      <span>Port: {cred.port}</span>
                      {cred.lastTestedAt && (
                        <span>Last tested: {new Date(cred.lastTestedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
