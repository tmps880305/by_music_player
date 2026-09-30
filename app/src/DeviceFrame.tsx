import type { ReactNode } from 'react';

// On iOS/Android the real safe-area insets apply, so there is nothing to simulate.
export default function DeviceFrame({ children }: { children: ReactNode; statusBar: 'light' | 'dark' }) {
  return <>{children}</>;
}
