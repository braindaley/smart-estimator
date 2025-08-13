'use client';

import { useReadinessToolLink } from '@/hooks/useReadinessToolLink';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ReadinessToolLinkProps {
  children: ReactNode;
  className?: string;
}

export function ReadinessToolLink({ children, className }: ReadinessToolLinkProps) {
  const href = useReadinessToolLink();
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}