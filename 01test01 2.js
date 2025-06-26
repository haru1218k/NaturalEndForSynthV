function getClientInfo() {
  return {
    name: "自然な語尾をつけるスクリプト",
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

  
  var vowelRatioAsked = false;
  var consonantRatioAsked = false;
  var vowelRatio = 0.85;
  var consonantRatio = 0.9;

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
      // 母音ノートの処理
      if (!vowelRatioAsked) {
        var inputRatio = SV.showInputBox(
          "母音ノートの分割比率設定",
          "比率を入力",
          "0.85"
        );
        if (inputRatio === undefined) {
          SV.finish();
          return;
        }
        inputRatio = parseFloat(inputRatio);
        if (isNaN(inputRatio) || inputRatio <= 0 || inputRatio >= 1) {
          SV.showMessageBox("エラー", "やり直してください");
          SV.finish();
          return;
        }
        vowelRatio = inputRatio;
        vowelRatioAsked = true;
      }
      separateANote(note, group, vowelRatio);
    } else if (
      KSTHConsonants.some(function (v) {
        return note.getLyrics().endsWith(v);
      })
    ) {
      // 子音ノートの処理
      if (!consonantRatioAsked) {
        var inputRatio = SV.showInputBox(
          "子音ノートの分割比率",
          "比率を入力",
          "0.9"
        );
        if (inputRatio === undefined) {
          SV.finish();
          return;
        }
        inputRatio = parseFloat(inputRatio);
        if (isNaN(inputRatio) || inputRatio <= 0 || inputRatio >= 1) {
          SV.showMessageBox("エラー", "やり直してください");
          SV.finish();
          return;
        }
        consonantRatio = inputRatio;
        consonantRatioAsked = true;
      }
      separateKSTHNote(note, group, consonantRatio);
    }
  }

  SV.finish();
}

function isVowel(symbol) {
  var vowels = ["a", "i", "u", "e", "o", "A", "I", "U", "E", "O"];
  return vowels.includes(symbol);
}

function separateANote(note, group, ratio) {
  var noteInfo = getNoteInfo(note);
  var fullLyric = noteInfo.lyrics;

  if (fullLyric.length <= 1) return;

  var firstLyric = fullLyric.slice(0, -1);
  var secondLyric = fullLyric.slice(-1);

  var originalDuration = noteInfo.duration;
  var firstLyricDuration = Math.floor(originalDuration * ratio);
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

function separateKSTHNote(note, group, ratio) {
  var noteInfo = getNoteInfo(note);
  var fullLyric = noteInfo.lyrics;

  if (fullLyric.length <= 1) return;

  var firstLyric = fullLyric.slice(0, -1);
  var secondLyric = fullLyric.slice(-1);

  var originalDuration = noteInfo.duration;
  var firstLyricDuration = Math.floor(originalDuration * ratio);
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
