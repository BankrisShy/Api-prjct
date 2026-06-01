async function generateOutfit() {
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
    const renderUrl = "https://IL_TUO_LINK_DI_RENDER.onrender.com/api/outfit";

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
