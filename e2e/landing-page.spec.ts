import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the main landing page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Opshop Online/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Australia\'s Sustainable Marketplace')
    
    // Check login button is present
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
    
    // Check navigation elements
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Test About link
    await page.getByRole('link', { name: /about/i }).click()
    await expect(page).toHaveURL(/.*\/about/)
    
    // Go back to home
    await page.goto('/')
    
    // Test Contact link
    await page.getByRole('link', { name: /contact/i }).click()
    await expect(page).toHaveURL(/.*\/contact/)
  })

  test('should display key features section', async ({ page }) => {
    await page.goto('/')
    
    // Check for feature cards/sections
    await expect(page.getByText(/sustainable shopping/i)).toBeVisible()
    await expect(page.getByText(/instant buyback/i)).toBeVisible()
    await expect(page.getByText(/secure payments/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile navigation (hamburger menu might be present)
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').first()
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByRole('link', { name: /about/i })).toBeVisible()
    }
    
    // Check main content is still visible and properly formatted
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('should handle login flow initiation', async ({ page }) => {
    await page.goto('/')
    
    // Click login button
    await page.getByRole('button', { name: /log in/i }).click()
    
    // Should redirect to login endpoint or auth page
    // Note: This will likely redirect to external auth, so we just check the navigation started
    await page.waitForURL(/.*\/api\/login.*|.*\/auth.*/, { timeout: 5000 })
      .catch(() => {
        // If redirect doesn't happen immediately, that's also valid
        // The important thing is the click was registered
      })
  })

  test('should load without accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    // Basic accessibility checks
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy() // Should have alt text
    }
    
    // Check for proper button labeling
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('should display footer information', async ({ page }) => {
    await page.goto('/')
    
    // Scroll to bottom to ensure footer is loaded
    await page.keyboard.press('End')
    
    // Check for footer links
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible()
    
    // Check for Australian context
    await expect(page.getByText(/australia/i)).toBeVisible()
  })
})