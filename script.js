let voices = [], isPaused = false, synth = window.speechSynthesis;

document.addEventListener("DOMContentLoaded", () => {
  const textBox = document.getElementById("textBox");
  const voiceSelect = document.getElementById("voiceSelect");
  const fontSelect = document.getElementById("fontSelect");
  const speedRange = document.getElementById("speedRange");
  const themeToggle = document.getElementById("themeToggle");
  const pauseBtn = document.getElementById("pauseBtn");
  const saveBtn = document.getElementById("saveBtn");
  const search = document.getElementById("search");
  const docList = document.getElementById("docList");
  const gearBtn = document.getElementById("gearBtn");
  const noteBtn = document.getElementById("noteBtn");

  function populateVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = voices.map(v => `<option>${v.name}</option>`).join('');
  }
  synth.onvoiceschanged = populateVoices;
  populateVoices();

  fontSelect.innerHTML = ["Arial","Times New Roman","Courier New","Verdana"]
    .map(f => `<option>${f}</option>`).join('');

  pauseBtn.onclick = () => {
    isPaused ? synth.resume() : synth.pause();
    pauseBtn.textContent = isPaused ? "⏸️" : "▶️";
    isPaused = !isPaused;
  };

  saveBtn.onclick = () => {
    const name = prompt("Enter document name:");
    const color = prompt("Color (red/blue/green/yellow):", "lightgray");
    if (!name) return;
    localStorage.setItem(`doc_${name}`, JSON.stringify({ text: textBox.value, color }));
    refreshDocList();
  };

  search.oninput = refreshDocList;

  function refreshDocList() {
    docList.innerHTML = '';
    const term = search.value.toLowerCase();
    for (let key in localStorage) {
      if (key.startsWith("doc_")) {
        const name = key.slice(4);
        if (!name.toLowerCase().includes(term)) continue;
        const doc = JSON.parse(localStorage[key]);
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.style.background = doc.color || "lightgray";
        btn.onclick = () => textBox.value = doc.text;
        docList.appendChild(btn);
      }
    }
  }
  refreshDocList();

  gearBtn.onclick = () => document.getElementById("settingsPanel").classList.toggle("hidden");
  themeToggle.onclick = () => document.body.classList.toggle("dark-mode");

  fontSelect.onchange = () => textBox.style.fontFamily = fontSelect.value;

  noteBtn.onclick = () => {
    const sel = textBox.value.substring(textBox.selectionStart, textBox.selectionEnd);
    if (!sel) return alert("Select text first to add a note.");
    const note = prompt(`Add note for: "${sel}"`);
    if (note) alert(`🔖 Note: "${note}"`);
  };

  textBox.oninput = highlightCurrent = () => {
    if (synth.speaking && !isPaused) {
      const sel = textBox.selectionStart;
      textBox.setSelectionRange(sel, sel);
    }
  };

  function speakText() {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(textBox.value);
    utter.voice = voices.find(v => v.name === voiceSelect.value);
    utter.rate = parseFloat(speedRange.value);
    utter.onboundary = e => {
      textBox.setSelectionRange(e.charIndex, e.charIndex + 1);
      textBox.focus();
    };
    synth.speak(utter);
  }

  textBox.addEventListener("dblclick", speakText);
});
