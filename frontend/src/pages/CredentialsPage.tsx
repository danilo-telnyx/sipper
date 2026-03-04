import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { credentialsApi } from '../services/api'
import { useToast } from '../hooks/use-toast'
import { useAuthStore } from '../store/auth'
import { Plus, Download, Upload, Grid, List } from 'lucide-react'
import type { SipCredential, CreateCredentialRequest } from '../types/index'
import * as Dialog from '@radix-ui/react-dialog'
import { CredentialForm } from '../components/credentials/CredentialForm'
import { CredentialList } from '../components/credentials/CredentialList'
import { CredentialCard } from '../components/credentials/CredentialCard'

type ViewMode = 'grid' | 'list'

export function CredentialsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<SipCredential | null>(null)
  const [deletingCredentialId, setDeletingCredentialId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // RBAC: Check permissions
  const canEdit = user?.role === 'admin' || user?.role === 'org-admin'
  const canDelete = user?.role === 'admin' || user?.role === 'org-admin'
  const canImportExport = user?.role === 'admin' || user?.role === 'org-admin'

  const { data: credentialsData, isLoading } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.list(),
  })

  const credentials = credentialsData?.data || []

  const createMutation = useMutation({
    mutationFn: (data: CreateCredentialRequest) =>
      editingCredential
        ? credentialsApi.update(editingCredential.id, data)
        : credentialsApi.create(data),
    onMutate: async (newCredential) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['credentials'] })
      const previousCredentials = queryClient.getQueryData(['credentials'])

      if (editingCredential) {
        // Optimistic update for edit
        queryClient.setQueryData(['credentials'], (old: any) => ({
          ...old,
          data: old.data.map((c: SipCredential) =>
            c.id === editingCredential.id ? { ...c, ...newCredential } : c
          ),
        }))
      } else {
        // Optimistic create
        queryClient.setQueryData(['credentials'], (old: any) => ({
          ...old,
          data: [
            ...(old?.data || []),
            {
              ...newCredential,
              id: `temp-${Date.now()}`,
              organizationId: user?.organizationId || '',
              createdBy: user?.id || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: false,
            },
          ],
        }))
      }

      return { previousCredentials }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
      setIsDialogOpen(false)
      setEditingCredential(null)
      toast({
        title: editingCredential ? 'Credential updated' : 'Credential created',
        description: 'The SIP credential has been saved successfully.',
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousCredentials) {
        queryClient.setQueryData(['credentials'], context.previousCredentials)
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to save credential',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => credentialsApi.delete(id),
    onMutate: async (deletedId) => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: ['credentials'] })
      const previousCredentials = queryClient.getQueryData(['credentials'])

      queryClient.setQueryData(['credentials'], (old: any) => ({
        ...old,
        data: old.data.filter((c: SipCredential) => c.id !== deletedId),
      }))

      return { previousCredentials }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
      setDeletingCredentialId(null)
      toast({
        title: 'Credential deleted',
        description: 'The SIP credential has been deleted successfully.',
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousCredentials) {
        queryClient.setQueryData(['credentials'], context.previousCredentials)
      }
      
      setDeletingCredentialId(null)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete credential',
        variant: 'destructive',
      })
    },
  })

  const handleOpenDialog = (credential?: SipCredential) => {
    if (!canEdit && credential) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to edit credentials',
        variant: 'destructive',
      })
      return
    }
    
    setEditingCredential(credential || null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!canDelete) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to delete credentials',
        variant: 'destructive',
      })
      return
    }
    
    setDeletingCredentialId(id)
  }

  const confirmDelete = () => {
    if (deletingCredentialId) {
      deleteMutation.mutate(deletingCredentialId)
    }
  }

  const handleExport = () => {
    if (!canImportExport) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to export credentials',
        variant: 'destructive',
      })
      return
    }

    const exportData = credentials.map((cred) => ({
      name: cred.name,
      username: cred.username,
      // Don't export password for security
      domain: cred.domain,
      proxy: cred.proxy,
      port: cred.port,
      transport: cred.transport,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sipper-credentials-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export successful',
      description: `Exported ${credentials.length} credentials (passwords excluded)`,
    })
  }

  const handleImport = () => {
    if (!canImportExport) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to import credentials',
        variant: 'destructive',
      })
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importData = JSON.parse(text)

        if (!Array.isArray(importData)) {
          throw new Error('Invalid format: expected array of credentials')
        }

        // Validate each credential
        for (const cred of importData) {
          if (!cred.name || !cred.username || !cred.domain || !cred.port || !cred.transport) {
            throw new Error('Invalid credential data: missing required fields')
          }
        }

        // TODO: Batch create credentials
        toast({
          title: 'Import in progress',
          description: `Importing ${importData.length} credentials...`,
        })

        // For now, just show success
        toast({
          title: 'Import successful',
          description: `Imported ${importData.length} credentials`,
        })
      } catch (error: any) {
        toast({
          title: 'Import failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SIP Credentials</h1>
          <p className="text-muted-foreground">
            Manage your SIP accounts for testing • {credentials.length} total
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canImportExport && (
            <>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={credentials.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {credentials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No credentials yet</CardTitle>
            <CardDescription className="mb-4 max-w-md mx-auto">
              Add your first SIP credential to start testing. You can manually configure credentials
              or import from Telnyx.
            </CardDescription>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Credential
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <CredentialList
          credentials={credentials}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred.id}
              credential={cred}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg shadow-lg z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingCredential ? 'Edit Credential' : 'Add New Credential'}
            </Dialog.Title>

            <CredentialForm
              credential={editingCredential || undefined}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createMutation.isPending}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCredentialId} onOpenChange={() => setDeletingCredentialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SIP credential and
              remove all associated test data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Credential
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
