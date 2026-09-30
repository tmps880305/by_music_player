import { StyleSheet } from 'react-native';

export const colors = {
  background: '#101A19',
  surface: '#1B2A26',
  border: '#40524A',
  text: '#F2F5EF',
  muted: '#A4B6AF',
  label: '#8BCAB3',
  placeholder: '#8DA69B',
  accent: '#C1E4A5',
  danger: '#FFB4A9',
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 18, paddingTop: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  // Pulls the 44pt tap target left so the chevron lines up with the content edge. The icon font sits its
  // glyph ~1pt higher than the heading's letters, so nudge it down to line up with the text visually.
  backIcon: { marginLeft: -14, marginRight: -4, transform: [{ translateY: 1 }] },
  // includeFontPadding (Android only) adds space above the glyphs and pushes the title below icons beside it.
  heading: { color: colors.text, fontSize: 27, fontWeight: '700', marginVertical: 8, includeFontPadding: false },
  label: { color: colors.label, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.text, fontSize: 17, fontWeight: '600' },
  muted: { color: colors.muted, fontSize: 12, marginTop: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 10, minHeight: 44 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, paddingVertical: 4 },
  input: { borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, color: colors.text, marginVertical: 5, minHeight: 44 },
  list: { padding: 18, paddingBottom: 12 },
  item: { backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 10 },
  active: { borderColor: colors.accent, borderWidth: 1 },
  player: { paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  error: { color: colors.danger, marginVertical: 6 },
});
