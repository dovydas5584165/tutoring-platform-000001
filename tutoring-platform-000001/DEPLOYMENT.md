# Deployment Guide - Vercel

## Required Environment Variables

Before deploying to Vercel, you need to set these environment variables in your Vercel dashboard:

### Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_connection_string
DIRECT_URL=your_supabase_direct_connection_string
```

### Stripe Payment
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (get this from Stripe Dashboard after setting webhook)
NEXT_PUBLIC_USE_STRIPE_WEBHOOKS=true
```

### Email (SMTP)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### NextAuth.js
```
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

### Optional
```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
ALLOW_DEV_REFUND_SIMULATION=false (set to true only for development)
```

## Deployment Steps

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all the variables listed above

3. **Configure Stripe Webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret and add it to Vercel env vars

4. **Update Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Test the Deployment:**
   - Visit your Vercel URL
   - Test booking flow
   - Test payment processing
   - Check email delivery

## Important Notes

- Make sure to use **production** Stripe keys for live deployment
- Set up proper domain in Vercel for professional appearance
- Configure email provider properly (Gmail App Password recommended)
- Test webhook delivery in Stripe Dashboard
- Monitor logs in Vercel dashboard for any issues

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Stripe webhook configured and working
- [ ] Email sending working
- [ ] Database connection working
- [ ] Payment flow working end-to-end
- [ ] Tutor and student emails being sent
- [ ] Refund system working
