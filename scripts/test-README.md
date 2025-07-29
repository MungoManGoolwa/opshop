# Testing Suite for Opshop Online

This directory contains comprehensive testing scripts and configurations for unit tests, integration tests, and end-to-end testing using Jest, Vitest, and Playwright.

## Testing Stack Overview

### Unit Testing
- **Frontend**: Vitest + React Testing Library + jsdom
- **Backend**: Jest + Supertest for API testing
- **Coverage**: Built-in coverage reporting for both frontend and backend

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Features**: Visual testing, network mocking, parallel execution

## Available Test Scripts

### 🧪 Unit Tests (`test-unit.js`)
Runs all unit tests for both client and server code.

```bash
# Run all unit tests
node scripts/test-unit.js

# Run with coverage reporting
node scripts/test-unit.js --coverage

# Run in watch mode (client tests only)
node scripts/test-unit.js --watch

# Run with verbose output
node scripts/test-unit.js --verbose
```

**What it tests:**
- React components and hooks
- Utility functions and helpers
- Server APIs and business logic
- Database operations and storage layer

### 🎭 End-to-End Tests (`test-e2e.js`)
Runs Playwright tests across multiple browsers to test complete user workflows.

```bash
# Run all E2E tests
node scripts/test-e2e.js

# Run with visible browser (for debugging)
node scripts/test-e2e.js --headed

# Run in debug mode (step-by-step)
node scripts/test-e2e.js --debug

# Run specific browser only
node scripts/test-e2e.js --project=chromium

# Run with limited workers (for slower machines)
node scripts/test-e2e.js --workers=1
```

**What it tests:**
- Complete user registration and login flows
- Product browsing and search functionality
- Shopping cart and checkout processes
- Admin panel operations
- Mobile responsiveness
- Cross-browser compatibility

### 🚀 Complete Test Suite (`test-all.js`)
Runs the entire testing pipeline including unit and E2E tests.

```bash
# Run complete test suite
node scripts/test-all.js

# Run with coverage reporting
node scripts/test-all.js --coverage

# Skip E2E tests for faster execution
node scripts/test-all.js --skip-e2e

# Run in fast mode (fewer browsers, single worker)
node scripts/test-all.js --fast
```

## Test Configuration Files

### Frontend Tests (Vitest)
- **Config**: `vitest.config.ts`
- **Setup**: `client/src/test/setup.ts`
- **Test Pattern**: `**/*.test.{ts,tsx}`

### Backend Tests (Jest)
- **Config**: `jest.config.js`
- **Setup**: `server/test/setup.ts`
- **Test Pattern**: `**/*.test.ts`

### E2E Tests (Playwright)
- **Config**: `playwright.config.ts`
- **Test Directory**: `e2e/`
- **Test Pattern**: `**/*.spec.ts`

## Writing Tests

### Frontend Component Tests
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    render(<MyComponent />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Backend API Tests
```typescript
import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import { app } from '../app'

describe('API Endpoints', () => {
  it('should return user data', async () => {
    const response = await request(app)
      .get('/api/users/123')
      .expect(200)
    
    expect(response.body).toHaveProperty('id', '123')
    expect(response.body.email).toHaveValidEmail()
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('user can complete checkout', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="login-button"]')
  
  // Complete login flow
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('[type="submit"]')
  
  // Add product to cart and checkout
  await page.goto('/products/123')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="checkout"]')
  
  await expect(page.locator('.success-message')).toBeVisible()
})
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: node scripts/test-unit.js --coverage
      - run: node scripts/test-e2e.js
      
      - uses: actions/upload-artifact@v3
        with:
          name: coverage-reports
          path: coverage/
```

## Test Data Management

### Database Setup
Tests use a separate test database to avoid conflicts:
- **Environment**: `NODE_ENV=test`
- **Database**: `TEST_DATABASE_URL` or fallback test DB
- **Isolation**: Each test suite runs in isolation

### Mock Data
- **Frontend**: Mock API responses using Vitest mocks
- **Backend**: Use test fixtures and factories
- **E2E**: Seed database with consistent test data

## Debugging Tests

### Unit Test Debugging
```bash
# Run specific test file
npx vitest run src/components/Button.test.tsx

# Debug with browser DevTools
npx vitest --ui

# Watch mode for development
npx vitest --watch
```

### E2E Test Debugging
```bash
# Run with visible browser
node scripts/test-e2e.js --headed

# Debug mode (step-by-step)
node scripts/test-e2e.js --debug

# Visual test runner UI
npx playwright test --ui

# Generate screenshots
npx playwright test --screenshot=only-on-failure
```

## Coverage Reports

### Frontend Coverage
- **HTML Report**: `coverage/index.html`
- **Text Output**: Console during test execution
- **Threshold**: 80% coverage recommended

### Backend Coverage
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info`
- **JSON Format**: `coverage/coverage-final.json`

## Performance Testing

### Load Testing (Future Enhancement)
Consider adding tools like:
- **Artillery** for API load testing
- **Lighthouse CI** for performance regression testing
- **Bundle Analyzer** for frontend performance monitoring

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests focused and independent
- Use setup/teardown hooks for common test preparation

### Test Data
- Use factories or fixtures for consistent test data
- Clean up test data after each test
- Use realistic but safe test data (no real user information)

### Assertions
- Be specific with assertions
- Test both positive and negative cases
- Include edge cases and error conditions
- Verify both functionality and user experience

### Maintenance
- Update tests when features change
- Remove obsolete tests
- Keep test dependencies up to date
- Monitor test execution time and optimize slow tests

## Troubleshooting

### Common Issues
- **Timeouts**: Increase timeout values in config files
- **Flaky Tests**: Add proper wait conditions and retry logic
- **Database Issues**: Check test database connection and permissions
- **Browser Issues**: Update Playwright browsers with `npx playwright install`

### Getting Help
- Check test output and error messages carefully
- Use debugging flags for detailed information
- Review test setup files for configuration issues
- Ensure all dependencies are properly installed