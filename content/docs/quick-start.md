# Quick Start Guide

Get started with Weather Shield in just a few minutes. This guide will walk you through the basics of setting up your account and monitoring your first project site.

## Step 1: Create Your Account

1. Visit the [sign up page](/sign-up)
2. Enter your email and password
3. Verify your email address

## Step 2: Add Your First Project Site

1. Navigate to the map
2. Open the sidebar on the top left
3. Click "Add New Site"
4. Enter the site details:
   - Site name
   - Location (address or coordinates)
   - Project type

## Step 3: Configure Weather Alerts

Set up your notification preferences:

```typescript
// Example alert configuration
{
  "windSpeed": {
    "threshold": 20, // mph
    "notify": ["email", "sms"]
  },
  "precipitation": {
    "threshold": 0.5, // inches/hour
    "notify": ["email"]
  }
}
```

## Step 4: Monitor Your Site

Your site is now set up and being monitored! You can:

- View real-time weather conditions
- Check the risk assessment dashboard
- Set up additional alert rules
- Generate weather reports

## Next Steps

- [Configure additional sites](/docs/site-management)
- [Set up team members](/docs/team-management)
- [Customize risk thresholds](/docs/risk-assessment)
- [Integrate with your tools](/docs/api/authentication) 