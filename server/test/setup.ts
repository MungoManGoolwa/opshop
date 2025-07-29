import { jest } from '@jest/globals'

// Setup environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/opshop_test'
process.env.SESSION_SECRET = 'test-session-secret-for-testing-only'

// Mock environment variables that might not be set in test
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'test-anthropic-key'
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123'
process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test-paypal-client-id'
process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test-paypal-secret'

// Increase timeout for database operations
jest.setTimeout(30000)

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Mock console.error but allow important errors through
  console.error = jest.fn((message: string, ...args: any[]) => {
    if (typeof message === 'string' && (
      message.includes('Warning:') ||
      message.includes('ReactDOM.render')
    )) {
      return // Suppress React warnings
    }
    originalConsoleError(message, ...args)
  })

  console.warn = jest.fn((message: string, ...args: any[]) => {
    if (typeof message === 'string' && message.includes('Warning:')) {
      return // Suppress React warnings
    }
    originalConsoleWarn(message, ...args)
  })
})

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  
  // Clear all mocks
  jest.clearAllMocks()
})

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R
      toHaveValidEmail(): R
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidDate(received: any) {
    const isValid = received instanceof Date && !isNaN(received.getTime())
    return {
      message: () => `expected ${received} to be a valid Date`,
      pass: isValid,
    }
  },
  
  toHaveValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(received)
    return {
      message: () => `expected ${received} to be a valid email address`,
      pass: isValid,
    }
  },
})