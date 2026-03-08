/**
 * SIP Test Builder E2E Tests
 * Sprint 5: Integration & Polish
 */

import { test, expect } from '@playwright/test'

test.describe('SIP Test Builder', () => {
  test('should display SIP test builder page', async ({ page }) => {
    await page.goto('/sip-test-builder')
    await expect(page.locator('h1')).toContainText('Enhanced SIP Testing')
  })

  test('should select SIP methods', async ({ page }) => {
    await page.goto('/sip-test-builder')
    
    // Test method selector
    await page.click('text=INVITE')
    await expect(page.locator('.ring-2.ring-primary:has-text("INVITE")')).toBeVisible()
    
    await page.click('text=REGISTER')
    await expect(page.locator('.ring-2.ring-primary:has-text("REGISTER")')).toBeVisible()
  })

  test('should toggle authentication', async ({ page }) => {
    await page.goto('/sip-test-builder')
    
    const authToggle = page.locator('input[type="checkbox"]#auth-toggle')
    await authToggle.click()
    
    // Username and password fields should appear
    await expect(page.locator('label:has-text("Username")')).toBeVisible()
    await expect(page.locator('label:has-text("Password")')).toBeVisible()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.goto('/sip-test-builder')
    
    // With empty fields, validation errors should show
    await page.waitForTimeout(500)
    await expect(page.locator('text=From User is required')).toBeVisible()
  })

  test('should display method-specific forms', async ({ page }) => {
    await page.goto('/sip-test-builder')
    
    // Select INVITE - should show SDP editor
    await page.click('text=INVITE')
    await page.waitForTimeout(500)
    await expect(page.locator('text=SDP Body')).toBeVisible()
    
    // Select REFER - should show REFER builder
    await page.click('text=REFER')
    await page.waitForTimeout(500)
    await expect(page.locator('text=Refer-To')).toBeVisible()
  })
})

test.describe('Flow Visualization', () => {
  test('should display flow visualization demo', async ({ page }) => {
    await page.goto('/flow-visualization')
    await expect(page.locator('h1')).toContainText('Flow Visualization Demo')
  })

  test('should display SIP flow diagram', async ({ page }) => {
    await page.goto('/flow-visualization')
    await expect(page.locator('text=SIP Message Flow')).toBeVisible()
    await expect(page.locator('text=Client')).toBeVisible()
    await expect(page.locator('text=Server')).toBeVisible()
  })

  test('should expand/collapse message details', async ({ page }) => {
    await page.goto('/flow-visualization')
    
    // Click on a message badge to expand
    await page.click('button:has-text("INVITE")').first()
    await page.waitForTimeout(300)
    await expect(page.locator('text=Headers')).toBeVisible()
    
    // Click again to collapse
    await page.click('button:has-text("INVITE")').first()
    await page.waitForTimeout(300)
  })

  test('should use zoom controls', async ({ page }) => {
    await page.goto('/flow-visualization')
    
    // Zoom in
    await page.click('button[title="Zoom in"]')
    await expect(page.locator('text=110%')).toBeVisible()
    
    // Zoom out
    await page.click('button[title="Zoom out"]')
    await page.click('button[title="Zoom out"]')
    await expect(page.locator('text=90%')).toBeVisible()
    
    // Reset
    await page.click('button:has-text("Reset")')
    await expect(page.locator('text=100%')).toBeVisible()
  })

  test('should toggle fullscreen mode', async ({ page }) => {
    await page.goto('/flow-visualization')
    
    await page.click('button[title="Fullscreen"]')
    await expect(page.locator('.fixed.inset-4')).toBeVisible()
    
    await page.click('button[title="Exit fullscreen"]')
  })

  test('should simulate real-time flow', async ({ page }) => {
    await page.goto('/flow-visualization')
    
    await page.click('button:has-text("Simulate Real-Time")')
    await expect(page.locator('text=Live')).toBeVisible()
    
    // Wait for simulation to complete
    await page.waitForTimeout(12000)
    await expect(page.locator('text=Live')).not.toBeVisible()
  })
})
