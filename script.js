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

  // Carichiamo la prima traccia
  music.src = playlist[currentTrackIndex];

  // Evento automatico: quando la canzone FINISCE, passa alla prossima
  music.onended = function() {
    let nextTrackIndex;
    // Pesca un numero a caso finché non è diverso da quello appena riprodotto
    do {
      nextTrackIndex = Math.floor(Math.random() * playlist.length);
    } while (nextTrackIndex === currentTrackIndex && playlist.length > 1);

    currentTrackIndex = nextTrackIndex;
    music.src = playlist[currentTrackIndex]; // Cambia la sorgente
    music.play().catch(err => console.log("Errore cambio traccia automatico:", err));
    console.log(`🎵 Ora in riproduzione: ${playlist[currentTrackIndex]}`);
  };
}
