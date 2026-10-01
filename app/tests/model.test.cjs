const { test } = require('node:test');
const assert = require('node:assert/strict');
const { removeTrack, toggleTrack, reorderTrack, reorderPlaylists, parseLibrary } = require('../src/model.ts');
const library = () => ({ version: 1, tracks: ['a', 'b'].map(id => ({ id, name: id, fileName: id + '.mp3', size: 100 })), playlists: [{ id: 'p', name: '清單', trackIds: ['a', 'b'] }, { id: 'q', name: '另一份', trackIds: ['a'] }] });
test('deleting a library track removes all playlist references without mutating input', () => {
 const original = library(); const result = removeTrack(original, 'a');
 assert.deepEqual(result.tracks.map(t => t.id), ['b']);
 assert.deepEqual(result.playlists.map(p => p.trackIds), [['b'], []]);
 assert.equal(original.tracks.length, 2);
});
test('playlist membership toggles without deleting library tracks', () => {
 const original = library(); const p = toggleTrack(original.playlists[0], 'a');
 assert.deepEqual(p.trackIds, ['b']); assert.deepEqual(toggleTrack(p, 'a').trackIds, ['b', 'a']);
 assert.equal(original.tracks.length, 2);
});
test('reordering moves a song and shifts the ones in between', () => {
 const p = { id: 'p', name: '清單', trackIds: ['a', 'b', 'c', 'd'] };
 assert.deepEqual(reorderTrack(p, 0, 2).trackIds, ['b', 'c', 'a', 'd']);
 assert.deepEqual(reorderTrack(p, 3, 1).trackIds, ['a', 'd', 'b', 'c']);
 assert.deepEqual(reorderTrack(p, 1, 1).trackIds, ['a', 'b', 'c', 'd']);
 assert.deepEqual(reorderTrack(p, -1, 2).trackIds, ['a', 'b', 'c', 'd']);
 assert.deepEqual(reorderTrack(p, 0, 4).trackIds, ['a', 'b', 'c', 'd']);
 assert.deepEqual(p.trackIds, ['a', 'b', 'c', 'd']);
});
test('playlists reorder without touching their songs or the input', () => {
 const original = library(); const result = reorderPlaylists(original, 1, 0);
 assert.deepEqual(result.playlists.map(p => p.id), ['q', 'p']);
 assert.deepEqual(result.playlists.map(p => p.trackIds), [['a'], ['a', 'b']]);
 assert.equal(reorderPlaylists(original, 0, 5), original);
 assert.deepEqual(original.playlists.map(p => p.id), ['p', 'q']);
});
test('library round trip preserves playlist order', () => {
 const data = library(); data.playlists[0] = reorderTrack(data.playlists[0], 0, 1);
 assert.deepEqual(parseLibrary(JSON.stringify(data)), data);
});
test('invalid stored data is rejected instead of silently clearing user data', () => {
 assert.throws(() => parseLibrary('{'));
 const bad = library(); bad.playlists[0].trackIds.push('missing'); assert.throws(() => parseLibrary(JSON.stringify(bad)));
 const path = library(); path.tracks[0].fileName = '../other.mp3'; assert.throws(() => parseLibrary(JSON.stringify(path)));
 const duplicate = library(); duplicate.playlists[0].trackIds.push('a'); assert.throws(() => parseLibrary(JSON.stringify(duplicate)));
});
