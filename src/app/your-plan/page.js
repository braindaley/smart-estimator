'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import LoanQualificationEnhanced from '@/components/LoanQualificationEnhanced';

export default function LoanQualificationPage() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Generate or retrieve user ID
    // In a real app, this would come from authentication
    const existingUserId = localStorage.getItem('loan_user_id');
    if (existingUserId) {
      setUserId(existingUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('loan_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  const handleQualificationComplete = (results) => {
    console.log('Qualification completed:', results);
    // You can handle the results here, such as:
    // - Saving to a database
    // - Redirecting to an application page
    // - Showing additional options
  };


  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <LoanQualificationEnhanced
            userId={userId}
            onComplete={handleQualificationComplete}
          />
        </div>
      </main>
    </div>
  );
}

