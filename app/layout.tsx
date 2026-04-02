import './globals.css';
import MainNav from '@/components/main-nav';

export const metadata = {
  title: 'SLB Workers',
  description: 'Chấm công và tính chi phí nhân công theo dự án',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50">
        <MainNav />
        {children}
      </body>
    </html>
  );
}