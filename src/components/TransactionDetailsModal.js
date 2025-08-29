'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/plaid-mapping';

export default function TransactionDetailsModal({ 
  isOpen, 
  onClose, 
  fieldName, 
  transactions = [], 
  totalAmount = 0 
}) {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{fieldName}</h2>
              <p className="text-gray-600">
                Total: {formatCurrency(totalAmount)} from {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={onClose}
              className="ml-4"
            >
              Close
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions found for this field.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <Card key={transaction.transaction_id || index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {transaction.name || transaction.merchant_name || 'Unknown Transaction'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(transaction.date)}
                      </p>
                      {transaction.account_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Account: {transaction.account_id}
                        </p>
                      )}
                      {transaction.personal_finance_category && (
                        <p className="text-xs text-blue-600 mt-1">
                          Category: {transaction.personal_finance_category.primary} → {transaction.personal_finance_category.detailed}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg">
                        {formatCurrency(transaction.mappedAmount || Math.abs(transaction.amount))}
                      </p>
                      {transaction.iso_currency_code && (
                        <p className="text-xs text-gray-500">
                          {transaction.iso_currency_code}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {transaction.location && transaction.location.address && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 {transaction.location.address}, {transaction.location.city}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}