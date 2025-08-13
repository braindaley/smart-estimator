'use client';

import { useSmartEstimatorLink } from '@/hooks/useSmartEstimatorLink';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SmartEstimatorLinkProps {
  children: ReactNode;
  className?: string;
}

export function SmartEstimatorLink({ children, className }: SmartEstimatorLinkProps) {
  const href = useSmartEstimatorLink();
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}