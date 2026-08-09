import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WalletProvider } from '@/context/WalletContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'OyeBunny Food App — Reward & Wallet Prototype',
  description: 'Food delivery application prototype for testing SuperApp Reward and Wallet microservice APIs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <AuthProvider>
          <CartProvider>
            <WalletProvider>
              <Navbar />
              <main style={styles.main}>{children}</main>
            </WalletProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f7fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#2d3748',
    minHeight: '100vh',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px 60px 16px',
  },
};
