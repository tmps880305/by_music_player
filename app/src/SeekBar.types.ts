export type SeekBarProps = { value: number; maximum: number; disabled: boolean; onPreview: (value: number) => void; onCommit: (value: number) => void; onCancel: () => void };
