export const metadata = {
  title: 'Loan Qualification Check - Smart Estimator',
  description: 'Check if you qualify for a loan in minutes. Get instant approval decisions and personalized rates based on your financial situation. No credit check required.',
  keywords: 'loan qualification, instant approval, no credit check, personal loan, financial analysis',
  openGraph: {
    title: 'Loan Qualification Check',
    description: 'Check if you qualify for a loan in minutes with no impact on your credit score.',
    type: 'website',
    url: '/your-plan',
    siteName: 'Smart Estimator',
    images: [
      {
        url: '/og-your-plan.png',
        width: 1200,
        height: 630,
        alt: 'Loan Qualification Check',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loan Qualification Check',
    description: 'Check if you qualify for a loan in minutes with no impact on your credit score.',
    images: ['/og-your-plan.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/your-plan',
  },
};

export default function LoanQualificationLayout({ children }) {
  return children;
}