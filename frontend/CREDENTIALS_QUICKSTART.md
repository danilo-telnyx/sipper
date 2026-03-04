# SIP Credentials Manager - Quick Start Guide

## 🎯 For Developers

### Component Structure
```
src/
├── pages/
│   └── CredentialsPage.tsx          # Main page with grid/list view
├── components/
│   └── credentials/
│       ├── CredentialForm.tsx        # Add/Edit form with validation
│       ├── CredentialList.tsx        # Table view with search/sort/filter
│       ├── CredentialCard.tsx        # Grid card view
│       └── TestConnectionButton.tsx  # Connection testing
└── services/
    └── api.ts                        # API client (credentialsApi)
```

### Import Components
```typescript
import { CredentialsPage } from '@/pages/CredentialsPage'
import {
  CredentialForm,
  CredentialList,
  CredentialCard,
  TestConnectionButton,
} from '@/components/credentials'
```

### Usage Examples

#### 1. Using the Form Component
```typescript
import { CredentialForm } from '@/components/credentials'

function MyComponent() {
  const handleSubmit = (data) => {
    console.log('Submitted:', data)
    // API call here
  }

  return (
    <CredentialForm
      credential={existingCredential} // Optional for edit
      onSubmit={handleSubmit}
      onCancel={() => setOpen(false)}
      isSubmitting={false}
    />
  )
}
```

#### 2. Using the List Component
```typescript
import { CredentialList } from '@/components/credentials'

function MyComponent() {
  const credentials = [...] // Fetch from API

  return (
    <CredentialList
      credentials={credentials}
      onEdit={(cred) => handleEdit(cred)}
      onDelete={(id) => handleDelete(id)}
      canEdit={true}
      canDelete={true}
    />
  )
}
```

#### 3. Using the Test Button
```typescript
import { TestConnectionButton } from '@/components/credentials'

function MyComponent() {
  return (
    <TestConnectionButton
      credential={credential}
      variant="outline"
      size="sm"
      showLatency={true}
    />
  )
}
```

### API Calls
```typescript
import { credentialsApi } from '@/services/api'

// List all
const { data } = await credentialsApi.list()

// Create
const newCred = await credentialsApi.create({
  name: 'My SIP Account',
  username: '1234567890',
  password: 'secret',
  domain: 'sip.example.com',
  port: 5060,
  transport: 'UDP'
})

// Update
await credentialsApi.update(credId, partialData)

// Delete
await credentialsApi.delete(credId)

// Test
await credentialsApi.test(credId)
```

### RBAC (Permissions)
```typescript
import { useAuthStore } from '@/store/auth'

function MyComponent() {
  const { user } = useAuthStore()
  
  const canEdit = user?.role === 'admin' || user?.role === 'org-admin'
  const canDelete = user?.role === 'admin' || user?.role === 'org-admin'
  
  return <CredentialList canEdit={canEdit} canDelete={canDelete} />
}
```

## 🎨 For UI/UX Designers

### Design System
- **Colors:**
  - Active: Green (#10B981)
  - Error: Red (#EF4444)
  - Inactive: Gray (#6B7280)
  - Warning: Yellow (#F59E0B)

- **Typography:**
  - Headings: Font size 24px, bold
  - Body: Font size 14px, regular
  - Monospace (for credentials): Font family monospace

- **Spacing:**
  - Page padding: 24px
  - Card gap: 16px
  - Form field spacing: 16px

### Component States
| Component | States | Visual Feedback |
|-----------|--------|-----------------|
| Credential Card | Default, Hover, Active, Error | Shadow, border, badge color |
| Test Button | Default, Loading, Success, Error | Spinner, badge, toast |
| Form Fields | Default, Focus, Error, Disabled | Border color, error message |
| Table Rows | Default, Hover, Selected | Background color |

## 🧪 For QA / Testing

### Manual Test Cases

#### TC1: Add Credential
1. Click "Add Credential"
2. Fill name: "Test Account"
3. Fill username: "12345"
4. Fill password: "secret"
5. Fill domain: "sip.test.com"
6. Select transport: UDP
7. Click "Add Credential"
8. **Expected:** Success toast, credential appears in list

#### TC2: Form Validation
1. Click "Add Credential"
2. Leave name empty
3. Click "Add Credential"
4. **Expected:** Error message "Name is required"
5. Enter name with 1 character
6. **Expected:** Error "Name must be at least 2 characters"
7. Enter invalid domain: "!!!"
8. **Expected:** Error "Invalid domain format"
9. Enter port: 99999
10. **Expected:** Error "Port must be between 1 and 65535"

#### TC3: Test Connection
1. Select a credential
2. Click "Test" button
3. **Expected:** 
   - Button shows loading spinner
   - After 1-2s, shows success/error badge
   - Toast notification appears
   - Latency displayed (if success)

#### TC4: Delete Confirmation
1. Click delete icon on credential
2. **Expected:** Confirmation dialog appears
3. Click "Cancel"
4. **Expected:** Dialog closes, credential still exists
5. Click delete icon again
6. Click "Delete Credential"
7. **Expected:** Credential removed, success toast

#### TC5: Search/Filter
1. Add 5 credentials with different names
2. Type "Test" in search bar
3. **Expected:** Only credentials with "Test" in name/username/domain show
4. Click "Active" filter
5. **Expected:** Only active credentials show
6. Clear search
7. **Expected:** All credentials show again

#### TC6: Import/Export
1. Click "Export" button
2. **Expected:** JSON file downloads, filename has date
3. Open file, verify structure
4. Click "Import" button
5. Select valid JSON file
6. **Expected:** Success toast, credentials imported
7. Try importing invalid JSON
8. **Expected:** Error toast with clear message

#### TC7: RBAC Permissions
1. Login as `user` role
2. **Expected:** Can view, cannot edit/delete/import/export
3. Try clicking edit
4. **Expected:** "Permission denied" toast
5. Login as `admin` role
6. **Expected:** All actions available

#### TC8: Optimistic Updates
1. Disconnect network (airplane mode)
2. Click "Add Credential"
3. Fill form and submit
4. **Expected:** 
   - Credential appears immediately
   - After network timeout, rollback occurs
   - Error toast appears
   - Credential disappears

#### TC9: Responsive Design
1. Open on mobile (375px width)
2. **Expected:** Grid becomes single column
3. Search bar full width
4. Buttons stack vertically
5. Table scrolls horizontally
6. Modal takes full screen

#### TC10: Keyboard Navigation
1. Tab through page
2. **Expected:** Focus indicators visible
3. Press "Enter" on "Add Credential"
4. **Expected:** Modal opens
5. Tab through form fields
6. Press "Escape"
7. **Expected:** Modal closes

### Automation Test Ideas
```javascript
// Cypress example
describe('Credentials Manager', () => {
  it('should add a credential', () => {
    cy.visit('/credentials')
    cy.contains('Add Credential').click()
    cy.get('[name="name"]').type('Test Account')
    cy.get('[name="username"]').type('12345')
    cy.get('[name="password"]').type('secret')
    cy.get('[name="domain"]').type('sip.test.com')
    cy.get('button[type="submit"]').click()
    cy.contains('Credential created').should('be.visible')
    cy.contains('Test Account').should('be.visible')
  })
})
```

## 📊 For Product Managers

### Feature Metrics to Track
- **Adoption:**
  - Number of credentials added per organization
  - Daily/weekly active users
  - Time to first credential creation

- **Usage:**
  - Most common transport type (UDP/TCP/TLS)
  - Test connection usage (% of credentials tested)
  - Edit/delete frequency

- **Performance:**
  - Average form completion time
  - Test connection success rate
  - Page load time

- **Errors:**
  - Form validation errors (by field)
  - API failures (by endpoint)
  - User-reported issues

### User Flows
1. **First-time user:** Empty state → Add credential → Test → Success
2. **Power user:** Import JSON → Bulk test all → Export results
3. **Admin:** CRUD operations → RBAC enforcement → Audit log

### Success Criteria
- ✅ 95%+ form completion rate
- ✅ <3s page load time
- ✅ <2s test connection response
- ✅ Zero data loss on error
- ✅ 100% RBAC enforcement

---

**Questions?** See `CREDENTIALS_FEATURE.md` for full documentation.
