async function generateOutfit() {
  const music = document.getElementById("bgMusic");

  // Se è la prima volta che l'utente clicca, configuriamo e facciamo partire la playlist
  if (!isPlaylistInitialized) {
    setupPlaylist();
    isPlaylistInitialized = true; // Impedisce di far ripartire la canzone da capo al prossimo click
    
    music.play().catch(error => {
       console.log("Riproduzione bloccata dal browser fino al click effettivo:", error);
    });
  } else {
    // Se la playlist era già partita ma magari era in pausa, riprendi il play
    if (music.paused) {
      music.play().catch(() => {});
    }
  }

  const selectedGod = document.getElementById("godSelect").value;
  const response = await fetch("data.json");
  const data = await response.json();
  const godData = data.gods[selectedGod];

  // Mostra UI base
  document.getElementById("result").style.display = "block";
  document.getElementById("godName").innerText = godData.name;

  // === LOGICA PER MOSTRARE LE IMMAGINI ===
  const itemsContainer = document.getElementById("items");
  itemsContainer.innerHTML = ""; // Svuota i vecchi risultati

  // Array ordinato come nel tuo data.json
  const keys = ["top", "bottom", "accessory", "shoes"];

  keys.forEach((key) => {
    const itemData = godData.outfit[key];

    // Creiamo il box principale
    const itemBox = document.createElement("div");
    itemBox.className = "item-box";

    // Se c'è l'immagine, la aggiungiamo prima del testo
    if (itemData.image && itemData.image !== "") {
      const img = document.createElement("img");
      img.src = itemData.image;
      img.alt = itemData.name;
      img.className = "item-img";
      itemBox.appendChild(img);
    }

    // Aggiungiamo le info del testo
    const info = document.createElement("div");
    info.className = "item-info";
    info.innerHTML = `<b>${key.toUpperCase()}</b> ${itemData.name}`;

    itemBox.appendChild(info);
    itemsContainer.appendChild(itemBox);
  });

  const aiAdviceElement = document.getElementById("aiAdvice");
  aiAdviceElement.innerText = "Chiedendo consiglio allo stylist...";

  try {
    // ⚠️ CAMBIATO: Ora punta al server live su Render invece che a localhost
    // Sostituisci l'URL qui sotto con quello reale che ti dà Render!
    const renderUrl = "https://mythology-fits.onrender.com";

    const aiResponse = await fetch(renderUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        god: godData.name,
        outfitDetails: godData.outfit,
      }),
    });

    const result = await aiResponse.json();
    
    // 💡 MIGLIORATO: Usa innerHTML per renderizzare eventuali link formattati dall'IA
    aiAdviceElement.innerHTML = result.text; 
    
  } catch (error) {
    console.error("Errore di connessione al backend:", error);
    aiAdviceElement.innerText =
      "Lo stylist si sta prendendo una pausa (il server si sta svegliando o è offline). Riprova tra un minuto!";
  }
}
// 1. Definiamo la lista delle canzoni (i percorsi relativi)
const playlist = [
  "./audio/INTRO (La Bella Vita) - Instrumental.mp3",
  "./audio/No Bad Grades.mp3",
  "./audio/Wagwan - Central Cee (Remix) @prod.kx1.mp3"
];

let currentTrackIndex = 0; // Traccia di partenza (la prima)
let isPlaylistInitialized = false; // Serve per non resettare la canzone a ogni click

// 2. Funzione per configurare il lettore e gestire il passaggio automatico
function setupPlaylist() {
  const music = document.getElementById("bgMusic");

  // Sceglie la prima canzone a caso
  currentTrackIndex = Math.floor(Math.random() * playlist.length);
  changeTrack(currentTrackIndex);

  // Quando il brano finisce, ne seleziona un altro senza ripetere lo stesso
  music.onended = function() {
    let nextTrackIndex;
    do {
      nextTrackIndex = Math.floor(Math.random() * playlist.length);
    } while (nextTrackIndex === currentTrackIndex && playlist.length > 1);

    currentTrackIndex = nextTrackIndex; 
    changeTrack(currentTrackIndex);
    music.play().catch(err => console.log("Errore riproduzione casuale:", err));
  };

  // ⏱️ Mostra la durata totale corretta non appena il file viene agganciato
  music.onloadedmetadata = function() {
    updatePlayerTime(music.currentTime, music.duration);
  };

  // 🔄 AGGIORNAMENTO DINAMICO DELLA BARRA E DEL TEMPO MENTRE SUONA
  music.ontimeupdate = function() {
    if (music.duration) {
      // Calcola la percentuale di avanzamento della barra
      const percentage = (music.currentTime / music.duration) * 100;
      const progressBar = document.getElementById("playerProgress");
      if (progressBar) progressBar.style.width = percentage + "%";

      // Aggiorna il testo del timer
      updatePlayerTime(music.currentTime, music.duration);
    }
  };
}

// Funzione interna per formattare i numeri del timer (es. 0:05 / 2:42)
function updatePlayerTime(current, duration) {
  const currentMin = Math.floor(current / 60);
  const currentSec = Math.floor(current % 60).toString().padStart(2, '0');
  
  // Se duration non è ancora pronta, mettiamo 0:00 provvisorio
  const durMin = duration ? Math.floor(duration / 60) : 0;
  const durSec = duration ? Math.floor(duration % 60).toString().padStart(2, '0') : "00";

  const timeElement = document.getElementById("playerTime");
  if (timeElement) {
    timeElement.innerText = `${currentMin}:${currentSec} / ${durMin}:${durSec}`;
  }
}

// Funzione di supporto per cambiare traccia e pulire il titolo dal percorso del file
function changeTrack(index) {
  const music = document.getElementById("bgMusic");
  music.src = playlist[index];

  // Prende il nome del file (es: "audio/No Bad Grades.mp3") e isola solo il titolo "No Bad Grades"
  const fullPath = playlist[index];
  const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
  const cleanTitle = fileName.replace('.mp3', '');

  // Aggiorna il titolo nel widget HTML
  const titleElement = document.getElementById("playerTitle");
  if (titleElement) {
    titleElement.innerText = cleanTitle;
  }
}
