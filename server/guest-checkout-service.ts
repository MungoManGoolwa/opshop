import { nanoid } from 'nanoid';
import { storage } from './storage';

export class GuestCheckoutService {
  // Generate a unique session ID for guest users
  static generateGuestSessionId(): string {
    return nanoid(32); // Generate a 32-character unique ID
  }

  // Get or create guest session ID from request headers or cookies
  static getGuestSessionId(req: any): string {
    // Try to get session ID from X-Guest-Session header
    let sessionId = req.headers['x-guest-session'];
    
    // If not found, generate a new one
    if (!sessionId) {
      sessionId = this.generateGuestSessionId();
    }
    
    return sessionId;
  }

  // Set guest session ID in response headers
  static setGuestSessionId(res: any, sessionId: string): void {
    res.setHeader('X-Guest-Session', sessionId);
  }

  // Convert guest cart to user cart when user logs in
  static async convertGuestCartToUserCart(guestSessionId: string, userId: string): Promise<void> {
    try {
      const guestCartItems = await storage.getGuestCartItems(guestSessionId);
      
      // Add each guest cart item to user's cart
      for (const item of guestCartItems) {
        await storage.addToCart({
          userId,
          productId: item.product.id,
          quantity: item.quantity,
        });
      }
      
      // Clear guest cart after conversion
      await storage.clearGuestCart(guestSessionId);
    } catch (error) {
      console.error('Error converting guest cart to user cart:', error);
      throw error;
    }
  }

  // Create guest order with customer information
  static async createGuestOrder(orderData: {
    sessionId: string;
    productId: number;
    sellerId: string;
    totalAmount: string;
    shippingCost: string;
    paymentGateway: string;
    paymentIntentId?: string;
    shippingAddress: any;
    guestEmail: string;
    guestName: string;
    guestPhone?: string;
    notes?: string;
  }) {
    const orderId = `guest-${nanoid(16)}`;
    
    const order = await storage.createOrder({
      orderId,
      buyerId: null, // No user ID for guest orders
      sellerId: orderData.sellerId,
      productId: orderData.productId,
      totalAmount: orderData.totalAmount,
      shippingCost: orderData.shippingCost,
      paymentGateway: orderData.paymentGateway,
      paymentIntentId: orderData.paymentIntentId,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingAddress: orderData.shippingAddress,
      isGuestOrder: true,
      guestEmail: orderData.guestEmail,
      guestName: orderData.guestName,
      guestPhone: orderData.guestPhone,
      notes: orderData.notes,
    });

    // Clear the specific item from guest cart
    await storage.removeFromGuestCart(orderData.sessionId, orderData.productId);
    
    return order;
  }

  // Cleanup expired guest sessions (run as scheduled task)
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await storage.cleanupExpiredGuestCarts();
      console.log('Guest cart cleanup completed');
    } catch (error) {
      console.error('Error cleaning up expired guest carts:', error);
    }
  }

  // Get guest cart count for display purposes
  static async getGuestCartCount(sessionId: string): Promise<number> {
    try {
      const cartItems = await storage.getGuestCartItems(sessionId);
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting guest cart count:', error);
      return 0;
    }
  }
}

export const guestCheckoutService = new GuestCheckoutService();