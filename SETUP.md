# DIGITN Website - Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Google Analytics ID and Meta Pixel ID

3. **Update site configuration:**
   - Edit `src/config/site.ts` with your actual contact information
   - Update phone number, email, and social media links

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Configuration

### Analytics Setup

1. **Google Analytics 4:**
   - Create a GA4 property at https://analytics.google.com
   - Copy your Measurement ID (G-XXXXXXXXXX)
   - Add to `src/config/site.ts` in `analytics.googleAnalyticsId`

2. **Meta Pixel:**
   - Create a pixel at https://business.facebook.com
   - Copy your Pixel ID
   - Add to `src/config/site.ts` in `analytics.metaPixelId`

### Email Contact Form

The contact form currently logs submissions. To enable email sending:

1. **Option 1: Resend (Recommended)**
   ```bash
   npm install resend
   ```
   - Sign up at https://resend.com
   - Get your API key
   - Add to `.env.local`: `RESEND_API_KEY=re_xxxxxxxxxxxx`
   - Uncomment the Resend code in `src/app/api/contact/route.ts`

2. **Option 2: SendGrid, Mailgun, or other email service**
   - Install the appropriate SDK
   - Update `src/app/api/contact/route.ts` with your provider's code

### SEO Optimization

1. **Add Open Graph image:**
   - Create a 1200x630px image
   - Save as `public/og-image.jpg`

2. **Google Search Console:**
   - Verify your site at https://search.google.com/search-console
   - Add verification code to `src/app/layout.tsx` in metadata.verification.google

3. **Submit sitemap:**
   - After deployment, submit `https://yourdomain.com/sitemap.xml` to Google Search Console

## Features Implemented

✅ Comprehensive SEO metadata (Open Graph, Twitter Cards, JSON-LD)
✅ Google Analytics 4 & Meta Pixel integration
✅ Contact form with email & WhatsApp options
✅ Centralized configuration (phone, email, social links)
✅ Dynamic sitemap.xml & robots.txt
✅ Custom 404 page
✅ Favicon & app icons (auto-generated from logo)
✅ Trust signals & social proof
✅ Portfolio with visual placeholders
✅ Mobile-optimized responsive design
✅ Accessibility improvements (ARIA labels)
✅ Performance optimizations (lazy loading)

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the 'out' folder
```

### Custom Server
```bash
npm run build
npm start
```

## Customization

- **Colors:** Edit `src/app/globals.css` CSS variables
- **Content:** Edit `src/app/page.tsx` for all sections
- **Logo:** The |D logo is generated dynamically in the navbar
- **Contact info:** Update `src/config/site.ts`

## Support

For issues or questions, contact: contact@digitn.tn
