# Buyback Limits System Documentation

## Overview

The Buyback Limits System provides administrators with comprehensive control over instant buyback offers by setting configurable monthly limits and automatic decline functionality when limits are exceeded.

## Features

### Admin-Configurable Settings
- **Monthly Item Limit**: Maximum number of items a user can submit for buyback per month
- **Maximum Price Per Item**: Maximum buyback offer price allowed per individual item
- **System Toggle**: Enable/disable the entire limits system

### Automatic Decline Functionality
When users exceed configured limits, the system automatically:
1. Creates an "auto_declined" offer record for tracking
2. Records the specific decline reason
3. Returns "monthly limits exceed" error message to user
4. Prevents further processing of the buyback request

## Database Schema

### buybackLimitsSettings Table
- `id`: Primary key
- `maxItemsPerMonth`: Integer (default: 2)
- `maxPricePerItem`: Decimal (default: 200.00)
- `isActive`: Boolean (default: true)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### buybackOffers Table Enhancement
- Added `declineReason`: Text field for automatic decline explanations
- Enhanced `status` enum to include `auto_declined`

## API Endpoints

### GET /api/admin/buyback-limits
Returns current buyback limits settings.

### PUT /api/admin/buyback-limits
Updates buyback limits settings with validation:
- `maxItemsPerMonth`: 1-50 items
- `maxPricePerItem`: $1.00-$10,000.00
- `isActive`: Boolean

## Admin Interface

Located at `/admin/buyback-limits`, the interface provides:
- Real-time configuration of monthly limits
- Maximum price per item settings
- System enable/disable toggle
- Visual feedback for setting changes
- Input validation and error handling

## Business Logic

### Limit Checking Process
1. **Pre-AI Evaluation**: Check if user has reached monthly item limit
2. **Post-AI Evaluation**: Check if calculated offer price exceeds maximum price limit
3. **Automatic Decline**: Create declined offer record when limits exceeded
4. **Error Response**: Return appropriate error message to user

### Default Settings
- **Maximum Items Per Month**: 2 items
- **Maximum Price Per Item**: $200.00
- **System Status**: Active

### Decline Reasons
- **Monthly Limit**: "Monthly limits exceeded. You have reached the maximum of X items per month."
- **Price Limit**: "Price limit exceeded. Offer price ($X) exceeds maximum allowed price of $Y per item."

## Integration Points

### Buyback Service
- `createBuybackOffer()`: Enhanced with limits validation
- Automatic decline record creation
- Error throwing with user-friendly messages

### Storage Layer
- `getUserMonthlyBuybackCount()`: Tracks user's monthly submissions
- `getBuybackLimitsSettings()`: Retrieves current limit configuration

### Admin Dashboard
- Navigation integration with buyback limits management
- Icon: Hash (#) symbol for limits identification

## Error Handling

### User-Facing Errors
- Clear, actionable error messages
- Specific limit information included
- No technical jargon or system details

### System Logging
- All declined offers logged with reasons
- Audit trail for administrative actions
- Performance metrics tracking

## Security Considerations

- Admin-only access to limits configuration
- Input validation on all settings
- Audit logging for all administrative changes
- Protection against abuse through rate limiting

## Monitoring

### Key Metrics
- Auto-decline rate by reason
- Monthly limit utilization
- Price limit trigger frequency
- System performance impact

### Alerts
- High decline rates
- Limit configuration changes
- System performance degradation

## Future Enhancements

### Potential Features
- Category-specific limits
- Dynamic limits based on user history
- Seasonal limit adjustments
- Advanced analytics dashboard
- Email notifications for declined offers

### Integration Opportunities
- User dashboard limit visibility
- Predictive limit suggestions
- Integration with fraud detection
- Advanced reporting capabilities