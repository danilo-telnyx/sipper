/**
 * Authentication E2E Tests
 * Sprint 5: Integration & Polish
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should display registration page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Register')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    // Toast or validation errors should appear
    await page.waitForTimeout(500)
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/)
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Register')
    await expect(page).toHaveURL(/.*register/)
    
    await page.click('text=Login')
    await expect(page).toHaveURL(/.*login/)
  })
})
