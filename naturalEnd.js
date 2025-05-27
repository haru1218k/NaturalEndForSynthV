function getClientInfo() {
  return {
    name: "無声化、母音語尾補助スクリプト",
    category: "Note",
    author: "Haru",
    VersionNumber: 1,
    minEditorVersion: 65537,
  };
}

function main() {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var group = SV.getMainEditor().getCurrentGroup().getTarget();

  for (var i = 0; i < selectedNotes.length; i++) {
    var note = selectedNotes[i];
    var vowels = ["あ", "い", "う", "え", "お"];
    var KSTHConsonants = [
      "か",
      "き",
      "く",
      "け",
      "こ",
      "さ",
      "し",
      "す",
      "せ",
      "そ",
      "た",
      "ち",
      "つ",
      "て",
      "と",
      "は",
      "ひ",
      "ふ",
      "へ",
      "ほ",
      "ま",
      "み",
    ];
    if (
      vowels.some(function (v) {
        return note.getLyrics().endsWith(v);
      })
    ) {
      separateANote(note, group);
    } else if (
      KSTHConsonants.some(function (v) {
        return note.getLyrics().endsWith(v);
      })
    ) {
      separateKSTHNote(note, group);
    }
  }

  SV.finish();
}

function isVowel(symbol) {
  // 日本語の母音（例：a, i, u, e, o）に対応（ROMAJIベース）
  var vowels = ["a", "i", "u", "e", "o", "A", "I", "U", "E", "O"];
  return vowels.includes(symbol);
}

function separateANote(note, group) {
  var noteInfo = getNoteInfo(note);
  var fullLyric = noteInfo.lyrics;

  if (fullLyric.length <= 1) return;

  var firstLyric = fullLyric.slice(0, -1);
  var secondLyric = fullLyric.slice(-1);

  var originalDuration = noteInfo.duration;
  var firstLyricDuration = Math.floor(originalDuration * 0.75);
  var secondLyricDuration = originalDuration - firstLyricDuration;

  note.setLyrics(firstLyric);
  note.setDuration(firstLyricDuration);

  var newNote = createNote(
    note.getPitch(),
    secondLyric,
    note.getOnset() + firstLyricDuration,
    secondLyricDuration
  );

  group.addNote(newNote);
}

function separateKSTHNote(note, group) {
  var noteInfo = getNoteInfo(note);
  var fullLyric = noteInfo.lyrics;

  if (fullLyric.length <= 1) return;

  var firstLyric = fullLyric.slice(0, -1);
  var secondLyric = fullLyric.slice(-1);

  var originalDuration = noteInfo.duration;
  var firstLyricDuration = Math.floor(originalDuration * 0.9);
  var secondLyricDuration = originalDuration - firstLyricDuration;

  note.setLyrics(firstLyric);
  note.setDuration(firstLyricDuration);

  var newNote = createNote(
    note.getPitch(),
    secondLyric,
    note.getOnset() + firstLyricDuration,
    secondLyricDuration
  );

  group.addNote(newNote);
}

function getNoteInfo(note) {
  return {
    lyrics: note.getLyrics(),
    duration: note.getDuration(),
    pitch: note.getPitch(),
  };
}

function createNote(pitch, lyrics, onset, duration) {
  var note = SV.create("Note");
  note.setPitch(pitch);
  note.setLyrics(lyrics);
  note.setTimeRange(onset, duration);
  return note;
}
