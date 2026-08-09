export const metadata = {
  title: 'Reward & Wallet Admin Panel',
  description: 'Admin dashboard for the reward and wallet microservices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f4f5f7', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
