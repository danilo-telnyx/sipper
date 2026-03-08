/**
 * Help System E2E Tests
 * Sprint 5: Integration & Polish
 */

import { test, expect } from '@playwright/test'

test.describe('Help System', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume we can access the app without auth for help testing
    // In production, you'd need to login first
    await page.goto('/login')
  })

  test('should toggle help panel with ? key', async ({ page }) => {
    await page.keyboard.press('?')
    await expect(page.locator('aside[aria-label="Help panel"]')).toBeVisible()
    
    await page.keyboard.press('Escape')
    await expect(page.locator('aside[aria-label="Help panel"]')).not.toBeVisible()
  })

  test('should toggle help panel with button click', async ({ page }) => {
    await page.click('button[aria-label="Toggle help panel"]')
    await expect(page.locator('aside[aria-label="Help panel"]')).toBeVisible()
    
    await page.click('button[aria-label="Close help panel"]')
    await expect(page.locator('aside[aria-label="Help panel"]')).not.toBeVisible()
  })

  test('should switch between help tabs', async ({ page }) => {
    await page.keyboard.press('?')
    
    await page.click('button:has-text("Examples")')
    await expect(page.locator('text=Code Examples')).toBeVisible()
    
    await page.click('button:has-text("RFCs")')
    await expect(page.locator('text=RFC')).toBeVisible()
    
    await page.click('button:has-text("Troubleshooting")')
    await expect(page.locator('text=Problem')).toBeVisible()
  })
})

test.describe('Documentation Page', () => {
  test('should navigate to documentation', async ({ page }) => {
    await page.goto('/documentation')
    await expect(page.locator('h1')).toContainText('Documentation')
  })

  test('should display version information', async ({ page }) => {
    await page.goto('/documentation')
    await expect(page.locator('text=Version Information')).toBeVisible()
    await expect(page.locator('text=Frontend')).toBeVisible()
    await expect(page.locator('text=Backend')).toBeVisible()
  })

  test('should switch between documentation tabs', async ({ page }) => {
    await page.goto('/documentation')
    
    await page.click('button:has-text("Workflows")')
    await expect(page.locator('text=Registration Flow')).toBeVisible()
    
    await page.click('button:has-text("API")')
    await expect(page.locator('text=API Endpoints')).toBeVisible()
    
    await page.click('button:has-text("Security")')
    await expect(page.locator('text=Authentication')).toBeVisible()
  })

  test('should display sprint history', async ({ page }) => {
    await page.goto('/documentation')
    await page.click('button:has-text("Features")')
    await expect(page.locator('text=Sprint History')).toBeVisible()
    await expect(page.locator('text=v0.3.0')).toBeVisible()
  })
})
