'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto mb-6">
                Manage system configurations and mappings
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Plaid Mapping Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Plaid Mapping</h2>
                </div>
                
                <p className="text-sm text-gray-600">
                  Configure and manage the mapping between Plaid transaction categories and Deal Sheet fields.
                </p>
                
                <div className="pt-2">
                  <Link href="/admin/plaid">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Manage Plaid Mappings
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Program Calculator Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Program Calculator Settings</h2>
                </div>

                <p className="text-sm text-gray-600">
                  Settings to update logic for the program calculator.
                </p>

                <div className="pt-2">
                  <Link href="/admin/program-calculator">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Program Calculator Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Equifax Industry Codes Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Equifax Industry Codes</h2>
                </div>

                <p className="text-sm text-gray-600">
                  Configure which industry types are included in debt settlement programs.
                </p>

                <div className="pt-2">
                  <Link href="/admin/equifax-codes">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Manage Industry Codes
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Deal Sheet Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Deal Sheet</h2>
                </div>

                <p className="text-sm text-gray-600">
                  View and manage deal sheet information for client plans.
                </p>

                <div className="pt-2">
                  <Link href="/your-plan/deal-sheet">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      View Deal Sheet
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}