# Cryptocurrency Transfer Application

This application allows users to send USDT on the TRON Network (TRC-20).

## Setup

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
Create a `.env.local` file in the root directory with the following content:
```
ADMIN_TRON_PRIVATE_KEY=your_private_key_here
TRONGRID_API_KEY=your_api_key_here
```

3. Run the development server:
```
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

This project is configured for deployment on Vercel with the domain name "transfer-usdt-trx-trust-wallet".

1. Install the Vercel CLI:
```
npm install -g vercel
```

2. Login to Vercel:
```
vercel login
```

3. Deploy to Vercel:
```
vercel
```

4. To deploy to production:
```
vercel --prod
```

5. Configure the custom domain "transfer-usdt-trx-trust-wallet.vercel.app" in the Vercel dashboard.

## TRON Network Configuration

- Network Name: TRON Mainnet
- RPC URL: https://api.trongrid.io
- Currency Symbol: TRX
- Block Explorer: https://tronscan.org/
- USDT Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
- Admin Wallet Address: TKDvQCKLzbK3QPsWJWLopUMS8UfpN3oEy6

## Project Structure

- `/api` - API endpoints
  - `/admin/tronWallet.js` - Returns the admin TRON wallet address
  - `/transactions/sendTronGasFees.js` - Sends TRX gas fees to a user's wallet
  - `/transactions/store.js` - Stores transaction data
- `/components` - React components
  - `/SendTronUSDT.js` - Main component for sending USDT on TRON
- `/pages` - Next.js pages
  - `/_app.js` - Next.js app configuration
  - `/index.js` - Main page
  - `/transactions.js` - Transaction history page
- `/styles` - CSS styles
  - `/globals.css` - Global styles
- `/data` - Data storage directory
  - `/transactions.json` - Transaction data

## API Endpoints

### GET `/api/admin/tronWallet`
Returns the admin TRON wallet address.

### POST `/api/transactions/sendTronGasFees`
Sends TRX gas fees to a user's wallet.

Request body:
```json
{
  "userAddress": "T...",
  "amount": "30000000"
}
```

### POST `/api/transactions/store`
Stores transaction data.

Request body:
```json
{
  "userAddress": "T...",
  "amount": "100",
  "txHash": "...",
  "currency": "USDT",
  "network": "TRON"
}
```

## Security Considerations

- In production, store private keys in environment variables or a secure key management system.
- Implement proper authentication and authorization for API endpoints.
- Consider using a database instead of file storage for transaction data.
- Add rate limiting to prevent abuse.
- Implement HTTPS to secure data transmission.
- Add input validation to prevent injection attacks.

## Production Deployment

For production deployment, consider the following:

1. Use a proper database like MongoDB or PostgreSQL instead of file storage.
2. Set up proper environment variables on your hosting platform.
3. Use a secure key management system for private keys.
4. Implement authentication and authorization for API endpoints.
5. Add rate limiting to prevent abuse.
6. Use HTTPS to secure data transmission.
7. Configure proper CORS settings to prevent unauthorized access. 