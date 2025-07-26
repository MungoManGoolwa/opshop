// Email notification service for buyback offers
// In production, this would integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For development, we'll log the email instead of actually sending it
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        preview: options.html.substring(0, 100) + '...'
      });

      // In production, replace this with actual email service:
      /*
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
            subject: options.subject,
          }],
          from: { email: 'noreply@opshop.online', name: 'Opshop Online' },
          content: [{
            type: 'text/html',
            value: options.html,
          }],
        }),
      });
      return response.ok;
      */

      return true; // Simulate successful email sending
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  generateBuybackOfferEmail(
    userName: string,
    itemTitle: string,
    estimatedValue: number,
    offerAmount: number,
    offerId: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buyback Offer - Opshop Online</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .offer-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .price { font-size: 28px; font-weight: bold; color: #10b981; }
          .item-details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
          .button:hover { background: #059669; }
          .button.secondary { background: #6b7280; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .expires { color: #ef4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Buyback Offer Ready!</h1>
            <p>We've evaluated your item and made you an offer</p>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>Great news! We've completed our AI-powered evaluation of your item and we're ready to make you an instant buyback offer.</p>
            
            <div class="offer-box">
              <div class="item-details">
                <strong>Item:</strong> ${itemTitle}<br>
                <strong>Estimated Market Value:</strong> $${estimatedValue.toFixed(2)}
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <div>Our Instant Buyback Offer:</div>
                <div class="price">$${offerAmount.toFixed(2)}</div>
                <div style="color: #6b7280; font-size: 14px;">
                  (50% of estimated market value as store credit)
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://opshop.online/instant-buyback" class="button">
                Accept Offer
              </a>
              <a href="https://opshop.online/instant-buyback" class="button secondary">
                View Details
              </a>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong class="expires">⏰ Offer expires in 24 hours</strong><br>
              <small>This offer is valid until tomorrow at the same time. Don't miss out!</small>
            </div>
            
            <h3>Why choose our buyback service?</h3>
            <ul>
              <li>✅ Instant evaluation using advanced AI technology</li>
              <li>✅ Fair market-based pricing</li>
              <li>✅ Immediate store credit to shop sustainable fashion</li>
              <li>✅ Help reduce waste and support the circular economy</li>
            </ul>
            
            <p>If you have any questions about this offer, feel free to reply to this email or contact our support team.</p>
            
            <p>Thank you for choosing Opshop Online for your sustainable shopping needs!</p>
            
            <p>Best regards,<br>
            The Opshop Online Team</p>
          </div>
          
          <div class="footer">
            <p>
              Opshop Online - Australia's Sustainable Marketplace<br>
              <a href="https://opshop.online">opshop.online</a> | 
              <a href="mailto:support@opshop.online">support@opshop.online</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af;">
              This email was sent regarding offer #${offerId}. 
              If you didn't request this evaluation, please contact us immediately.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBuybackOfferNotification(
    userEmail: string,
    userName: string,
    itemTitle: string,
    estimatedValue: number,
    offerAmount: number,
    offerId: number
  ): Promise<boolean> {
    const html = this.generateBuybackOfferEmail(
      userName,
      itemTitle,
      estimatedValue,
      offerAmount,
      offerId
    );

    return await this.sendEmail({
      to: userEmail,
      subject: `💰 Buyback Offer Ready: $${offerAmount.toFixed(2)} for ${itemTitle}`,
      html,
    });
  }
}

export const emailService = new EmailService();