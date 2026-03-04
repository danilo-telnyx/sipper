import { useState, useMemo } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Search, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, SortAsc, SortDesc } from 'lucide-react'
import { TestConnectionButton } from './TestConnectionButton'
import { formatDate } from '../../lib/utils'
import type { SipCredential } from '../../types/index'

interface CredentialListProps {
  credentials: SipCredential[]
  onEdit: (credential: SipCredential) => void
  onDelete: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

type SortField = 'name' | 'username' | 'domain' | 'status' | 'lastTested'
type SortDirection = 'asc' | 'desc'

export function CredentialList({
  credentials,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: CredentialListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'error'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatus = (cred: SipCredential): 'active' | 'inactive' | 'error' => {
    if (cred.isActive) return 'active'
    if (cred.lastTestedAt) return 'error'
    return 'inactive'
  }

  const filteredAndSortedCredentials = useMemo(() => {
    let filtered = credentials

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (cred) =>
          cred.name.toLowerCase().includes(query) ||
          cred.username.toLowerCase().includes(query) ||
          cred.domain.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((cred) => getStatus(cred) === filterStatus)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareResult = 0

      switch (sortField) {
        case 'name':
          compareResult = a.name.localeCompare(b.name)
          break
        case 'username':
          compareResult = a.username.localeCompare(b.username)
          break
        case 'domain':
          compareResult = a.domain.localeCompare(b.domain)
          break
        case 'status':
          compareResult = getStatus(a).localeCompare(getStatus(b))
          break
        case 'lastTested':
          const dateA = a.lastTestedAt ? new Date(a.lastTestedAt).getTime() : 0
          const dateB = b.lastTestedAt ? new Date(b.lastTestedAt).getTime() : 0
          compareResult = dateA - dateB
          break
      }

      return sortDirection === 'asc' ? compareResult : -compareResult
    })

    return sorted
  }, [credentials, searchQuery, filterStatus, sortField, sortDirection])

  const getStatusBadge = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3" />
            Inactive
          </Badge>
        )
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4 inline ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 inline ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search credentials by name, username, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
          >
            Inactive
          </Button>
          <Button
            variant={filterStatus === 'error' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('error')}
          >
            Error
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedCredentials.length} of {credentials.length} credentials
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon field="name" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('username')}
                >
                  Username <SortIcon field="username" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('domain')}
                >
                  Domain <SortIcon field="domain" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Server</th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCredentials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery || filterStatus !== 'all'
                      ? 'No credentials match your filters'
                      : 'No credentials yet'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedCredentials.map((cred) => (
                  <tr
                    key={cred.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{cred.name}</div>
                        {cred.lastTestedAt && (
                          <div className="text-xs text-muted-foreground">
                            Tested {formatDate(cred.lastTestedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{cred.username}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{cred.domain}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-mono">{cred.port}</div>
                        <div className="text-xs text-muted-foreground">{cred.transport}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(getStatus(cred))}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <TestConnectionButton
                          credential={cred}
                          variant="ghost"
                          size="sm"
                          showLatency={false}
                        />
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(cred)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(cred.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
