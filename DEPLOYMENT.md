# Deploying the TRON USDT Transfer App to Vercel

This guide provides step-by-step instructions for deploying the TRON USDT Transfer application to Vercel.

## Prerequisites

1. A GitHub account with the repository pushed to it
2. A Vercel account (sign up at https://vercel.com)
3. Your TRON wallet private key for the admin wallet

## Step 1: Prepare Your Repository

Ensure your code is properly pushed to GitHub and all necessary files are included:

- All source code files
- package.json with the correct dependencies
- vercel.json configuration (if applicable)

## Step 2: Set Up Vercel CLI (Optional)

If you want to deploy from your local machine:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
vercel
```

## Step 3: Deploy from Vercel Dashboard

1. Log in to your Vercel account
2. Click "Import Project" or "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

## Step 4: Configure Environment Variables

In the Vercel dashboard, add the following environment variables:

1. `ADMIN_TRON_PRIVATE_KEY`: Your TRON wallet private key
2. `TRONGRID_API_KEY`: Your TronGrid API key (if you have one)

## Step 5: Set Custom Domain

1. In the Vercel dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add "transfer-usdt-trx-trust-wallet.vercel.app" as your domain
4. Follow the verification steps if needed

## Step 6: Deploy Production Build

If you're using the CLI:
```bash
vercel --prod
```

If using the dashboard, click "Deploy" to initiate the production deployment.

## Step 7: Verify Deployment

1. Check that your site is accessible at the provided URL
2. Test the application functionality:
   - Connect a TRON wallet
   - Check balances
   - Ensure transaction history works

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel build logs for any errors
2. Ensure all environment variables are set correctly
3. Verify that your TRON wallet has sufficient TRX for gas fees
4. Check network configuration is set to TRON Mainnet
5. Verify TronWeb is loading correctly on the client side

## Additional Notes

- For security reasons, never commit your private keys to the repository
- Consider using Vercel's preview deployments for testing changes before production
- Implement proper monitoring and error logging for production deployments 