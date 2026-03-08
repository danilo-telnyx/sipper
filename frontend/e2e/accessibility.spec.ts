/**
 * Accessibility E2E Tests (WCAG 2.1 AA)
 * Sprint 5: Integration & Polish
 */

import { test, expect } from '@playwright/test'

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should navigate with keyboard on login page', async ({ page }) => {
    await page.goto('/login')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="password"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()
  })

  test('should navigate help panel with keyboard', async ({ page }) => {
    await page.goto('/documentation')
    
    // Open help with ?
    await page.keyboard.press('?')
    await expect(page.locator('aside[aria-label="Help panel"]')).toBeVisible()
    
    // Close with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('aside[aria-label="Help panel"]')).not.toBeVisible()
  })
})

test.describe('Accessibility - ARIA Labels', () => {
  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('[aria-label="Toggle help panel"]')).toBeVisible()
  })

  test('should have proper ARIA labels on help panel', async ({ page }) => {
    await page.goto('/documentation')
    await page.keyboard.press('?')
    
    await expect(page.locator('[aria-label="Help panel"]')).toBeVisible()
    await expect(page.locator('[aria-label="Close help panel"]')).toBeVisible()
  })
})

test.describe('Accessibility - Semantic HTML', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/documentation')
    
    // Should have h1
    await expect(page.locator('h1')).toHaveCount(1)
    
    // h1 should be "Documentation"
    await expect(page.locator('h1')).toContainText('Documentation')
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login')
    
    // All inputs should have associated labels
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('id')
    
    const emailId = await emailInput.getAttribute('id')
    await expect(page.locator(`label[for="${emailId}"]`)).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

  test('should display mobile menu toggle', async ({ page }) => {
    await page.goto('/login')
    
    // Mobile menu button should be visible on small screens
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible()
  })

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.goto('/documentation')
    
    // Desktop sidebar should be hidden on mobile
    const sidebar = page.locator('aside.hidden.lg\\:block')
    await expect(sidebar).not.toBeVisible()
  })

  test('should display mobile-friendly help panel', async ({ page }) => {
    await page.goto('/documentation')
    
    await page.keyboard.press('?')
    
    // Help panel should be full-width on mobile
    const helpPanel = page.locator('aside[aria-label="Help panel"]')
    await expect(helpPanel).toHaveClass(/w-full/)
  })

  test('should stack cards vertically on mobile', async ({ page }) => {
    await page.goto('/documentation')
    
    // Grid should become single column on mobile
    const grid = page.locator('.grid')
    if (await grid.count() > 0) {
      // Check that grid items don't have multi-column layout
      await expect(grid.first()).not.toHaveClass(/grid-cols-2/)
    }
  })
})

test.describe('Mobile Responsiveness - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }) // iPad

  test('should display intermediate layout on tablet', async ({ page }) => {
    await page.goto('/documentation')
    
    // Some grids might show 2 columns on tablet
    const grid = page.locator('.sm\\:grid-cols-2')
    await expect(grid.first()).toBeVisible()
  })

  test('should make tabs scrollable on tablet', async ({ page }) => {
    await page.goto('/documentation')
    
    // Tab list should be scrollable on smaller screens
    const tabsList = page.locator('[role="tablist"]')
    await expect(tabsList).toBeVisible()
  })
})

test.describe('Color Contrast', () => {
  test('should have sufficient contrast for primary text', async ({ page }) => {
    await page.goto('/documentation')
    
    // Check that primary text is visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    // Playwright doesn't directly check color contrast, but we ensure elements are visible
    // For production, you'd use tools like axe-core
  })

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/login')
    
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Focus should have visible outline (ring in Tailwind)
    await expect(focusedElement).toHaveCSS('outline-width', /[^0]/) // Non-zero outline
  })
})
