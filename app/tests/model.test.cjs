const { test } = require('node:test');
const assert = require('node:assert/strict');
const { removeTrack, toggleTrack, moveTrack, parseLibrary } = require('../src/model.ts');
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
test('reordering preserves membership and handles boundaries', () => {
 const p = library().playlists[0];
 assert.deepEqual(moveTrack(p, 1, -1).trackIds, ['b', 'a']);
 assert.deepEqual(moveTrack(p, 0, -1).trackIds, ['a', 'b']);
 assert.deepEqual(moveTrack(p, 1, 1).trackIds, ['a', 'b']);
});
test('library round trip preserves playlist order', () => {
 const data = library(); data.playlists[0] = moveTrack(data.playlists[0], 0, 1);
 assert.deepEqual(parseLibrary(JSON.stringify(data)), data);
});
test('invalid stored data is rejected instead of silently clearing user data', () => {
 assert.throws(() => parseLibrary('{'));
 const bad = library(); bad.playlists[0].trackIds.push('missing'); assert.throws(() => parseLibrary(JSON.stringify(bad)));
 const path = library(); path.tracks[0].fileName = '../other.mp3'; assert.throws(() => parseLibrary(JSON.stringify(path)));
 const duplicate = library(); duplicate.playlists[0].trackIds.push('a'); assert.throws(() => parseLibrary(JSON.stringify(duplicate)));
});
