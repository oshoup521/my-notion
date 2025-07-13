# Custom Domain Setup Guide
## Domain: taskflow.oshoupadhyay.in

### Prerequisites
- Vercel project deployed successfully
- Access to your domain registrar's DNS settings
- Domain: oshoupadhyay.in (with subdomain: taskflow)

### DNS Configuration Steps

#### Option 1: CNAME Record (Recommended)
1. **Login to your domain registrar** (where oshoupadhyay.in is registered)
2. **Navigate to DNS Management**
3. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: taskflow
   Target/Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

#### Option 2: A Record (Alternative)
If CNAME doesn't work, use A record:
```
Type: A
Name: taskflow
Value: 76.76.19.61
TTL: 3600
```

### Vercel Configuration

#### 1. Add Domain in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `my-notion-frontend`
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `taskflow.oshoupadhyay.in`
6. Click **"Add"**

#### 2. Verify Domain
- Vercel will show the DNS configuration needed
- Wait for DNS propagation (5-60 minutes)
- Vercel will automatically verify and provision SSL

### Testing
1. **DNS Propagation Check:**
   ```bash
   nslookup taskflow.oshoupadhyay.in
   ```
   Should return Vercel's IP addresses

2. **Website Access:**
   - HTTP: `http://taskflow.oshoupadhyay.in` (should redirect to HTTPS)
   - HTTPS: `https://taskflow.oshoupadhyay.in` (final URL)

3. **API Connectivity:**
   - Open browser console on your domain
   - Check that API calls to backend work
   - No CORS errors should appear

### Troubleshooting

#### Common Issues:
1. **DNS not propagating:**
   - Wait longer (up to 48 hours max)
   - Check with different DNS lookup tools
   - Clear your browser/system DNS cache

2. **SSL Certificate issues:**
   - Vercel auto-provisions SSL (Let's Encrypt)
   - Usually takes 5-10 minutes after DNS verification
   - Check Vercel dashboard for certificate status

3. **CORS errors:**
   - Backend has been updated to allow your custom domain
   - Redeploy backend if needed

4. **404 on custom domain:**
   - Check that domain is properly added in Vercel
   - Verify DNS records are correct
   - Ensure project is properly deployed

### DNS Propagation Timeline
- **Immediate**: Changes made in DNS panel
- **5-15 minutes**: Most global DNS servers updated
- **1-24 hours**: Full worldwide propagation
- **48 hours**: Maximum propagation time

### Post-Setup Checklist
- [ ] DNS records added correctly
- [ ] Domain added in Vercel dashboard
- [ ] DNS propagation completed
- [ ] SSL certificate issued (automatic)
- [ ] Website accessible via custom domain
- [ ] All application features working
- [ ] API calls successful
- [ ] No CORS errors
- [ ] Mobile responsiveness working

### Support
- **Vercel Docs**: https://vercel.com/docs/concepts/projects/custom-domains
- **DNS Help**: Contact your domain registrar
- **Vercel Support**: Available in dashboard for paid plans

### Your URLs
- **Custom Domain**: https://taskflow.oshoupadhyay.in
- **Vercel Default**: https://my-notion-frontend.vercel.app
- **Backend API**: https://my-notion-plc9.onrender.com
