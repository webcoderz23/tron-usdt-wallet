import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the SendTronUSDT component with no SSR
const SendTronUSDT = dynamic(() => import('../components/SendTronUSDT'), { ssr: false });

export default function Home() {
  return (
    <div>
      <Head>
        <title>Transfer USDT TRX Trust Wallet</title>
        <meta name="description" content="Securely transfer USDT on TRON Network" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SendTronUSDT />
    </div>
  );
} 