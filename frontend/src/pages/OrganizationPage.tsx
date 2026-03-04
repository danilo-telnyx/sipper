import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { organizationApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import { useToast } from '../hooks/use-toast'
import { Building2, Save } from 'lucide-react'
import { formatDate } from '../lib/utils'
import type { Organization } from '../types/index'
import * as Switch from '@radix-ui/react-switch'

export function OrganizationPage() {
  const currentUser = useAuthStore((state) => state.user)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get(),
  })

  const organization = orgData?.data

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Organization>) => organizationApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      setIsEditing(false)
      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: Partial<Organization> = {
      name: formData.get('name') as string,
      settings: {
        allowPublicTests: formData.get('allowPublicTests') === 'on',
        retentionDays: parseInt(formData.get('retentionDays') as string),
        notificationEmail: formData.get('notificationEmail') as string,
      },
    }
    updateMutation.mutate(data)
  }

  // Only org-admins can see this page
  if (currentUser?.role !== 'org-admin' && currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading organization...</div>
  }

  if (!organization) {
    return <div className="text-center py-12">Organization not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization configuration
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
        )}
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Organization ID</div>
              <div className="font-mono text-sm">{organization.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Plan</div>
              <div className="font-medium capitalize">{organization.plan}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div>{formatDate(organization.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Max Users</div>
              <div>{organization.maxUsers}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Max Credentials</div>
              <div>{organization.maxCredentials}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Configure organization-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                required
                disabled={!isEditing}
                defaultValue={organization.name}
                placeholder="My Organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                name="notificationEmail"
                type="email"
                required
                disabled={!isEditing}
                defaultValue={organization.settings.notificationEmail}
                placeholder="notifications@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Email address for important organization notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentionDays">Test Data Retention (Days)</Label>
              <Input
                id="retentionDays"
                name="retentionDays"
                type="number"
                min="1"
                max="365"
                required
                disabled={!isEditing}
                defaultValue={organization.settings.retentionDays}
              />
              <p className="text-xs text-muted-foreground">
                Number of days to retain test results before automatic deletion
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowPublicTests">Allow Public Tests</Label>
                <div className="text-sm text-muted-foreground">
                  Allow tests to be shared publicly via link
                </div>
              </div>
              <Switch.Root
                id="allowPublicTests"
                name="allowPublicTests"
                disabled={!isEditing}
                defaultChecked={organization.settings.allowPublicTests}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-primary disabled:opacity-50"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Plan Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Limits</CardTitle>
          <CardDescription>
            Current usage and limits for your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Users</span>
                <span className="font-medium">
                  {/* This would come from actual usage data */}
                  - / {organization.maxUsers}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: '0%' }} // Would be calculated from actual data
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Credentials</span>
                <span className="font-medium">
                  - / {organization.maxCredentials}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: '0%' }} // Would be calculated from actual data
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need to upgrade your plan? Contact support for enterprise options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
