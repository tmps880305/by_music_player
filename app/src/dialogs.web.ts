import type { AlertButton } from 'react-native';
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (window.confirm([title, message].filter(Boolean).join('\n\n'))) buttons?.find(b => b.style !== 'cancel')?.onPress?.();
  },
};
