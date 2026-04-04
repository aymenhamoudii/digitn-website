import { test, expect } from '@playwright/test'

test.describe('Auth protection', () => {
  test('redirects unauthenticated user from /app to login', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('redirects unauthenticated user from /admin to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('marketing page loads for unauthenticated user', async ({ page }) => {
    await page.goto('/')
    // Check for page title or key content
    const title = await page.title()
    expect(title).toBeTruthy()
  })
})

test.describe('Public pages', () => {
  test('home page is accessible', async ({ page }) => {
    await page.goto('/')
    const status = page.url()
    expect(status).toContain('localhost')
  })

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/auth/login')
    const url = page.url()
    expect(url).toContain('/auth/login')
  })

  test('can navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signup')
    const url = page.url()
    expect(url).toContain('/auth/signup')
  })
})

test.describe('Protected routes - unauthenticated', () => {
  test('/app/chat redirects to login', async ({ page }) => {
    await page.goto('/app/chat')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('/app/projects redirects to login', async ({ page }) => {
    await page.goto('/app/projects')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('/admin redirects to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('/admin/users redirects to login', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('/admin/models redirects to login', async ({ page }) => {
    await page.goto('/admin/models')
    await expect(page).toHaveURL(/auth\/login/)
  })
})
