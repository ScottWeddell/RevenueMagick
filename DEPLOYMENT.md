# Revenue Magick Frontend Deployment Guide

## Vercel Deployment

This guide covers deploying the Revenue Magick frontend to Vercel with comprehensive fallback data support.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code should be in a GitHub repository
3. **Node.js 18+**: For local development and building

### Deployment Steps

#### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

#### 2. Configure Build Settings

**Framework Preset**: Vite
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

#### 3. Environment Variables

Set the following environment variables in Vercel:

```
VITE_API_URL=https://your-backend-url.com/api/v1
NODE_ENV=production
```

*Note: The frontend will automatically use fallback data when deployed, so the backend URL is optional for demo purposes.*

#### 4. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Build the application
- Deploy to a global CDN

### Features in Production

#### Automatic Fallback Data

The frontend automatically detects when it's running in production and uses comprehensive fallback data:

- **Dashboard**: Complete metrics and intelligence modules
- **Customer Intelligence**: Sample customer profiles and segments
- **Behavioral Signals**: Mock behavioral data and patterns
- **Revenue Strategist**: Strategic recommendations and simulations
- **Ad Intelligence**: Sample campaign data

#### Demo Mode Indicators

When using fallback data, the interface shows:
- 🎯 **Demo Mode** indicators
- Sample data notifications
- Full functionality demonstration

#### Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Vite's built-in optimizations
- **CDN Delivery**: Global edge network via Vercel
- **Caching**: Aggressive caching for static assets

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Fallback Data System

The fallback data system ensures the application works perfectly without a backend:

#### Data Coverage
- ✅ Dashboard metrics and KPIs
- ✅ Customer profiles and segments
- ✅ Behavioral signals and patterns
- ✅ Revenue strategist recommendations
- ✅ Ad campaign performance data
- ✅ Neuromind Profile™ distributions

#### Smart Detection
- Automatically detects production environment
- Falls back gracefully on API failures
- Maintains full UI functionality
- Preserves user experience

### Monitoring and Analytics

#### Built-in Monitoring
- Console logging for debugging
- Error boundary protection
- Performance monitoring ready
- User interaction tracking ready

#### Vercel Analytics
Enable Vercel Analytics for:
- Page view tracking
- Performance metrics
- User engagement data
- Core Web Vitals

### Custom Domain Setup

1. **Add Domain**: In Vercel dashboard, go to Project Settings > Domains
2. **Configure DNS**: Point your domain to Vercel's nameservers
3. **SSL Certificate**: Automatically provisioned by Vercel
4. **Redirects**: Configure in `vercel.json` if needed

### Troubleshooting

#### Common Issues

**Build Failures**
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Review build logs for specific errors

**Routing Issues**
- Ensure `vercel.json` is configured for SPA routing
- Check that all routes are properly defined

**API Connection**
- Verify environment variables are set
- Check CORS configuration if using external APIs
- Fallback data will be used automatically if APIs fail

#### Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Test locally with `npm run build && npm run preview`

### Security Considerations

- **Environment Variables**: Never commit sensitive data
- **API Keys**: Use Vercel's secure environment variables
- **CORS**: Configure properly for production domains
- **Content Security Policy**: Consider implementing CSP headers

### Performance Best Practices

- **Image Optimization**: Use Vercel's image optimization
- **Bundle Analysis**: Use `npm run build -- --analyze`
- **Lighthouse Audits**: Regular performance testing
- **Core Web Vitals**: Monitor and optimize

---

## Production URL

Once deployed, your Revenue Magick dashboard will be available at:
`https://your-project-name.vercel.app`

The application will automatically run in demo mode with comprehensive fallback data, showcasing all Revenue Magick capabilities without requiring a backend connection. 