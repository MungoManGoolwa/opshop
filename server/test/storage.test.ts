import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { DatabaseStorage } from '../storage'
import type { UpsertUser, User } from '@shared/schema'

// Mock the database module
jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

import { db } from '../db'

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    storage = new DatabaseStorage()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('User Operations', () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      accountType: 'seller',
      isActive: true,
      maxListings: 10,
      useDefaultMaxListings: true,
      commissionRate: '10.00',
      profileImageUrl: null,
      phone: null,
      address: null,
      city: null,
      state: null,
      postcode: null,
      country: 'Australia',
      suburb: null,
      latitude: null,
      longitude: null,
      bio: null,
      businessName: null,
      abn: null,
      isVerified: false,
      shopExpiryDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should get user by id', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockUser]),
      }
      mockDb.select.mockReturnValue(mockQuery as any)

      const result = await storage.getUser('test-user-id')

      expect(result).toEqual(mockUser)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should return undefined for non-existent user', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      }
      mockDb.select.mockReturnValue(mockQuery as any)

      const result = await storage.getUser('non-existent-id')

      expect(result).toBeUndefined()
    })

    it('should upsert user successfully', async () => {
      const userData: UpsertUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      }
      mockDb.insert.mockReturnValue(mockQuery as any)

      const result = await storage.upsertUser(userData)

      expect(result).toEqual(mockUser)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(mockQuery.onConflictDoUpdate).toHaveBeenCalled()
    })

    it('should get user by email', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockUser]),
      }
      mockDb.select.mockReturnValue(mockQuery as any)

      const result = await storage.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
    })

    it('should update user role', async () => {
      const updatedUser = { ...mockUser, role: 'admin' as const }
      
      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      }
      mockDb.update.mockReturnValue(mockQuery as any)

      const result = await storage.updateUserRole('test-user-id', 'admin')

      expect(result).toEqual(updatedUser)
      expect(mockQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
          updatedAt: expect.any(Date),
        })
      )
    })

    it('should throw error when updating non-existent user', async () => {
      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      }
      mockDb.update.mockReturnValue(mockQuery as any)

      await expect(storage.updateUserRole('non-existent-id', 'admin'))
        .rejects.toThrow('User with id non-existent-id not found')
    })
  })

  describe('User Statistics', () => {
    it('should get user stats', async () => {
      const mockStats = {
        totalListings: 5,
        totalSales: 3,
        totalPurchases: 2,
        storeCreditBalance: 100.50,
        totalEarned: 250.00,
        totalSpent: 150.00,
        totalCommissions: 25.00,
        activeBuybackOffers: 1,
        totalViews: 150,
        memberSince: new Date('2023-01-01'),
      }

      // Mock multiple queries that getUserStats might make
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([mockStats]),
      }
      
      mockDb.select.mockReturnValue(mockQuery as any)

      const result = await storage.getUserStats('test-user-id')

      expect(result).toEqual(mockStats)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should handle empty user stats', async () => {
      const emptyStats = {
        totalListings: 0,
        totalSales: 0,
        totalPurchases: 0,
        storeCreditBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        totalCommissions: 0,
        activeBuybackOffers: 0,
        totalViews: 0,
        memberSince: null,
      }

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([emptyStats]),
      }
      
      mockDb.select.mockReturnValue(mockQuery as any)

      const result = await storage.getUserStats('new-user-id')

      expect(result).toEqual(emptyStats)
    })
  })
})