import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaFrameContext, SafeAreaInsetsContext } from 'react-native-safe-area-context';

// Development-only iPhone 16 Pro preview (393×852 pt). Browsers report zero safe-area insets, so this
// supplies the insets iOS reports and draws the status bar, Dynamic Island and home indicator on top.
// Production web builds are unaffected; add ?device=off to the URL to turn it off while developing.
const device = { width: 393, height: 852, insets: { top: 59, bottom: 34, left: 0, right: 0 } };
const enabled = __DEV__ && new URLSearchParams(window.location.search).get('device') !== 'off';

export default function DeviceFrame({ children, statusBar }: { children: ReactNode; statusBar: 'light' | 'dark' }) {
  if (!enabled) return <>{children}</>;
  const ink = statusBar === 'light' ? '#FFFFFF' : '#000000';
  return (
    <View style={f.page}>
      <View style={f.phone}>
        <SafeAreaFrameContext.Provider value={{ x: 0, y: 0, width: device.width, height: device.height }}>
          <SafeAreaInsetsContext.Provider value={device.insets}>{children}</SafeAreaInsetsContext.Provider>
        </SafeAreaFrameContext.Provider>
        <View style={f.statusBar}>
          <Text style={[f.clock, { color: ink }]}>9:41</Text>
          <View style={f.island} />
          <View style={f.icons}>
            <Ionicons name="cellular" size={16} color={ink} />
            <Ionicons name="wifi" size={16} color={ink} />
            <Ionicons name="battery-full" size={22} color={ink} />
          </View>
        </View>
        <View style={[f.homeIndicator, { backgroundColor: ink }]} />
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A2A2E' },
  phone: { width: '100%', maxWidth: device.width, height: '100%', maxHeight: device.height, borderRadius: 55, overflow: 'hidden' },
  // Overlays ignore touches so the app underneath stays usable.
  statusBar: { pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, height: device.insets.top, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 36 },
  clock: { fontSize: 17, fontWeight: '600', width: 70 },
  island: { position: 'absolute', top: 11, left: '50%', marginLeft: -63, width: 126, height: 37, borderRadius: 18.5, backgroundColor: '#000000' },
  icons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, width: 70 },
  homeIndicator: { pointerEvents: 'none', position: 'absolute', bottom: 8, left: '50%', marginLeft: -67, width: 134, height: 5, borderRadius: 3 },
});
