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
  // Underline under the current tab's text, inset by the text button's horizontal padding.
  tabUnderline: { position: 'absolute', left: 10, right: 10, bottom: 6, height: 1.5, borderRadius: 1, backgroundColor: colors.accent },
  outlineButton: { borderWidth: 1.5, borderColor: colors.accent, borderRadius: 10, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  filledButton: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  primaryAction: { alignSelf: 'flex-start', marginVertical: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  // Lines a trailing icon's glyph up with the content's right edge despite its 44pt tap target.
  trailingIcon: { marginRight: -4 },
  leadingIcon: { marginLeft: -4 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactButton: { minHeight: 38, paddingHorizontal: 16, borderRadius: 9 },
  // Onboarding hints (see CoachHint), laid out in the empty library's list area.
  // - To +: loopUpArrow (tip at x 90.5 of 110). The + centre is 19.5pt in from the list content's right edge
  //   (18 header padding - 4 trailingIcon + 47 / 2 - 18 list padding), so the box hugs the right edge; the list clips
  //   at its top, so the tip ends there. Its text is 70pt below the box.
  // - To 加入範例歌曲: riseLeftArrow (tip at (18, 9) of 64×80). The button is 16pt padding + six 14pt characters, so the
  //   gap between 加 and 入 is at x ≈ 30; the box at (12, 56) puts the tip there, 21pt below the button (y 6–44),
  //   The hint text sits just below the tail start (74, 134), placed so the tail aims at the gap between 擊 and 加
  //   (two 14pt characters in, x ≈ 77).
  coachArea: { minHeight: 176 },
  coachLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  coachText: { position: 'absolute', color: colors.accent, fontSize: 14, fontWeight: '600' },
  coachArrowToImport: { position: 'absolute', top: 0, right: 0 },
  coachTextToImport: { top: 70, right: 0 },
  coachArrowToAction: { position: 'absolute', top: 56, left: 12 },
  coachTextToAction: { top: 150, left: 49 },
  dialogBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 8 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, paddingVertical: 4 },
  input: { borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, color: colors.text, marginVertical: 5, minHeight: 44 },
  list: { padding: 18, paddingBottom: 12 },
  item: { backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 10 },
  // Card with tappable content on the left and a trailing icon; the smaller right padding lines the icon's glyph up with the card's 14pt padding.
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  active: { borderColor: colors.accent, borderWidth: 1 },
  player: { paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  error: { color: colors.danger, marginVertical: 6 },
});
