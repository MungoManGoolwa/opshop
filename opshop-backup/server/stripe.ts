import Stripe from 'stripe';
import { Request, Response } from 'express';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, currency = 'aud', orderId, productId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId?.toString() || '',
        productId: productId?.toString() || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error: any) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      message: error.message 
    });
  }
}

export async function createRefund(req: Request, res: Response) {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason: reason || 'requested_by_customer',
    });

    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (error: any) {
    console.error('Stripe refund error:', error);
    res.status(500).json({ 
      error: 'Failed to create refund',
      message: error.message 
    });
  }
}

export { stripe };