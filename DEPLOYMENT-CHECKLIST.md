# 🚀 DIGITN Website - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Configuration
- [ ] Update `src/config/site.ts` with your actual information:
  - [ ] Phone number (currently: +216 52 335 899)
  - [ ] Email address (currently: contact@digitn.tn)
  - [ ] Website URL (currently: https://digitn.tn)
  - [ ] Social media links (Facebook, Instagram, LinkedIn)
  - [ ] Google Analytics ID (add your G-XXXXXXXXXX)
  - [ ] Meta Pixel ID (add your pixel ID)

### 2. Environment Variables
- [ ] Create `.env.local` file (copy from `.env.example`)
- [ ] Add Google Analytics ID: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
- [ ] Add Meta Pixel ID: `NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id`
- [ ] (Optional) Add email service API key: `RESEND_API_KEY=re_xxxxxxxxxxxx`

### 3. Content Review
- [ ] Review all text content in `src/app/page.tsx`
- [ ] Verify testimonials are appropriate
- [ ] Check portfolio projects match your work
- [ ] Confirm pricing is correct
- [ ] Update stats in Hero section if needed

### 4. Assets
- [ ] Create Open Graph image (1200x630px) and save as `public/og-image.jpg`
- [ ] (Optional) Add real project screenshots to replace emoji placeholders
- [ ] (Optional) Add client logos if available

### 5. Email Service Setup (Optional but Recommended)
- [ ] Sign up for Resend (https://resend.com) or another email service
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Uncomment email code in `src/app/api/contact/route.ts`
- [ ] Test contact form

### 6. Testing
- [ ] Test on desktop browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test contact form (both email and WhatsApp)
- [ ] Test all navigation links
- [ ] Test WhatsApp floating button
- [ ] Verify globe animation loads properly
- [ ] Check all sections scroll smoothly

### 7. Build & Deploy
```bash
# Test build locally
npm run build
npm start

# Visit http://localhost:3000 and test everything
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
```bash
npm install -g vercel
vercel login
vercel
```
- Follow prompts
- Add environment variables in Vercel dashboard
- Domain will be auto-assigned (can add custom domain later)

### Option 2: Netlify
```bash
npm run build
```
- Drag and drop the `.next` folder to Netlify
- Or connect GitHub repo for auto-deployment
- Add environment variables in Netlify dashboard

### Option 3: Custom VPS/Server
```bash
# On your server
git clone your-repo
cd digitn-pro
npm install
npm run build

# Use PM2 to keep it running
npm install -g pm2
pm2 start npm --name "digitn" -- start
pm2 save
pm2 startup
```

## 📊 Post-Deployment Tasks

### 1. Analytics Setup
- [ ] Verify Google Analytics is tracking (check Real-Time reports)
- [ ] Verify Meta Pixel is firing (use Meta Pixel Helper extension)
- [ ] Test conversion tracking (submit contact form, select plan)

### 2. SEO Setup
- [ ] Submit to Google Search Console
  - Add property: https://search.google.com/search-console
  - Verify ownership
  - Submit sitemap: `https://yourdomain.com/sitemap.xml`
- [ ] Submit to Bing Webmaster Tools
  - Add site: https://www.bing.com/webmasters
  - Submit sitemap
- [ ] Add verification codes to `src/app/layout.tsx` if needed

### 3. Social Media
- [ ] Test Open Graph preview on Facebook Debugger: https://developers.facebook.com/tools/debug/
- [ ] Test Twitter Card preview: https://cards-dev.twitter.com/validator
- [ ] Share on your social media channels

### 4. Performance Check
- [ ] Run Google PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Check mobile performance
- [ ] Verify Core Web Vitals are good

### 5. Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Monitor Google Analytics weekly
- [ ] Check contact form submissions regularly
- [ ] Review Search Console for errors

## 🎯 Quick Wins for More Clients

### Week 1
- [ ] Share website on all social media
- [ ] Add website to Google My Business
- [ ] Update email signature with website link
- [ ] Tell existing clients about new website

### Week 2-4
- [ ] Start collecting real testimonials from clients
- [ ] Take screenshots of completed projects
- [ ] Write first blog post (SEO content)
- [ ] Run small Facebook/Instagram ads campaign

### Month 2-3
- [ ] Add case studies with detailed results
- [ ] Create video testimonials
- [ ] Build backlinks (local directories, partnerships)
- [ ] Optimize based on analytics data

## 📞 Support & Maintenance

### Regular Tasks
- **Weekly:** Check analytics, respond to contact forms
- **Monthly:** Review SEO performance, update content
- **Quarterly:** Add new portfolio projects, refresh testimonials

### Updates Needed
- Update Node.js packages every 3 months:
  ```bash
  npm update
  npm audit fix
  ```

### Backup
- Keep regular backups of:
  - Source code (use Git)
  - Environment variables
  - Analytics data exports

## 🆘 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Contact Form Not Working
- Check API route is deployed: `https://yourdomain.com/api/contact`
- Verify environment variables are set
- Check browser console for errors

### Analytics Not Tracking
- Verify IDs are correct in `src/config/site.ts`
- Check browser console for errors
- Use browser extensions to verify (Google Analytics Debugger, Meta Pixel Helper)

### Globe Not Loading
- Check browser console for errors
- Verify data files are in `public/data/` folder
- Test on different browsers

## ✨ Success Metrics to Track

- **Traffic:** Unique visitors per month
- **Conversions:** Contact form submissions + WhatsApp clicks
- **SEO:** Google rankings for target keywords
- **Engagement:** Time on site, pages per session
- **Sources:** Where visitors come from (organic, social, direct)

---

## 🎉 You're Ready!

Your website now has:
- ✅ Professional design
- ✅ SEO optimization
- ✅ Analytics tracking
- ✅ Multiple contact methods
- ✅ Trust signals
- ✅ Mobile optimization
- ✅ Fast performance

**Next step:** Deploy and start getting clients! 🚀

For questions, refer to `SETUP.md` and `IMPROVEMENTS.md`
