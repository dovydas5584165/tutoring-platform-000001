# Stripe Payment Integration Setup Guide

This guide will help you set up the secure Stripe payment system for your tutoring platform.

## Features Implemented

✅ **Secure Payment Processing**
- Stripe Elements for secure card input
- PCI DSS compliant payment handling
- Support for various payment methods

✅ **Complete Booking Flow**
- Client selects tutor and time slot
- Secure payment processing via Stripe
- Automatic email invoice generation
- Tutor confirmation workflow

✅ **Automated Refund System**
- Instant refunds when tutor cancels
- Automatic email notifications
- Freed time slots for rebooking

✅ **Email Notifications**
- Invoice emails with booking details
- Cancellation emails with refund information
- Professional HTML email templates

## Environment Setup

### 1. Create Environment File

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (using Gmail SMTP as example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (if not already present)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account verification process

2. **Get API Keys**
   - Navigate to Developers → API keys in your Stripe Dashboard
   - Copy your Publishable key and Secret key
   - Use test keys for development (they start with `pk_test_` and `sk_test_`)

3. **Set up Webhooks**
   - Go to Developers → Webhooks in your Stripe Dashboard
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
   - For local development, use ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - Select these events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret (starts with `whsec_`)

### 3. Email Configuration

#### Using Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

#### Using Other Email Providers:
Update the `EMAIL_HOST` and `EMAIL_PORT` in your `.env.local` file:

```bash
# For Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587

# For Yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

### 4. Database Migration

The database schema has been updated to support payments. Run:

```bash
npx prisma db push
```

## Testing the Payment System

### 1. Test Cards

Use these test card numbers in development:

```
Successful Payment:
4242 4242 4242 4242

Declined Payment:
4000 0000 0000 0002

Requires Authentication:
4000 0025 0000 3155
```

Use any future expiry date and any 3-digit CVC.

### 2. Testing Flow

1. **Book a Lesson**
   - Select a tutor and time slot
   - Fill in student information
   - Complete booking (redirects to payment page)

2. **Make Payment**
   - Use test card details
   - Complete payment (redirects to success page)
   - Check email for invoice

3. **Tutor Confirmation**
   - Log in as tutor
   - See notification for new booking
   - Accept or decline the booking

4. **Test Cancellation**
   - Tutor declines booking
   - Automatic refund processed
   - Student receives cancellation email

## Production Deployment

### 1. Switch to Live Keys

Replace test keys with live keys in production:
- `pk_live_...` for publishable key
- `sk_live_...` for secret key

### 2. Webhook Endpoint

Update your webhook endpoint to point to your production domain:
```
https://yourdomain.com/api/webhooks/stripe
```

### 3. Security Considerations

- Never expose secret keys in client-side code
- Always validate webhook signatures
- Use HTTPS in production
- Implement proper error handling
- Log payment events for audit purposes

## File Structure

```
├── app/
│   ├── api/
│   │   ├── create-payment-intent/route.ts    # Creates Stripe payment intents
│   │   ├── cancel-booking/route.ts           # Handles cancellations and refunds
│   │   └── webhooks/stripe/route.ts          # Processes Stripe webhooks
│   ├── payment/page.tsx                      # Payment page with Stripe Elements
│   └── payment-success/page.tsx              # Payment confirmation page
├── components/
│   └── CheckoutForm.tsx                      # Stripe payment form component
├── lib/
│   ├── stripe.ts                             # Stripe configuration
│   └── email.ts                              # Email utilities and templates
└── prisma/
    └── schema.prisma                         # Updated database schema
```

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL is accessible
   - Verify webhook is configured for correct events

2. **Email Not Sending**
   - Check email credentials
   - Verify SMTP settings
   - Check spam folder
   - Enable "Less secure app access" if using Gmail without App Password

3. **Payment Intent Creation Failed**
   - Verify Stripe secret key is correct
   - Check booking exists in database
   - Ensure amount is valid (minimum 50 cents for EUR)

4. **Refund Failed**
   - Check payment was successful before attempting refund
   - Verify payment intent ID exists
   - Ensure sufficient time has passed since payment

### Development Tips

1. **Use Stripe CLI for local webhook testing**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Monitor Stripe Dashboard**:
   - Check Events tab for webhook delivery
   - Review Payments tab for transaction status
   - Use Logs tab for debugging

3. **Test Different Scenarios**:
   - Successful payments
   - Failed payments
   - Refunds
   - Webhook failures

## Support

For issues with this implementation:
1. Check the Stripe Dashboard for payment status
2. Review server logs for error messages
3. Verify environment variables are set correctly
4. Test webhook endpoints with Stripe CLI

For Stripe-specific issues, refer to the [Stripe Documentation](https://stripe.com/docs). 