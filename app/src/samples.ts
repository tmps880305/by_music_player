import { Asset } from 'expo-asset';
import type { DocumentPickerAsset } from 'expo-document-picker';

// Royalty-free tones bundled with the app so new users (and App Review) can try playback without their own MP3s.
const samples = [
  { name: '範例歌曲 1.mp3', module: require('../assets/samples/sample-1.mp3') },
  { name: '範例歌曲 2.mp3', module: require('../assets/samples/sample-2.mp3') },
];

// Resolves the bundled files to local URIs shaped like picker results, so they go through the normal import path.
export function sampleAssets(): Promise<DocumentPickerAsset[]> {
  return Promise.all(samples.map(async ({ name, module }) => {
    const asset = await Asset.fromModule(module).downloadAsync();
    return { name, uri: asset.localUri ?? asset.uri, lastModified: 0 };
  }));
}
