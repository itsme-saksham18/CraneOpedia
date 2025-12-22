const grid = document.getElementById("favoritesGrid");

async function loadFavorites() {
    const res = await fetch("/favorites");
    const data = await res.json();

    grid.innerHTML = "";

    if (!data.cranes.length) {
        grid.innerHTML = "<p>No favorites added yet.</p>";
        return;
    }

    data.cranes.forEach(crane => {
        const card = document.createElement("div");
        card.className = "crane-card";

        card.innerHTML = `
            <img src="${crane.image}" alt="${crane.model}">
            <div class="crane-content">
                <h3>${crane.model}</h3>
                <div class="crane-meta">
                    ${crane.type} • ${crane.max_load_capacity}
                </div>

                <div class="card-actions">
                    <button class="btn-ar" onclick="viewAR('${crane.ar_link}')">
                        View AR
                    </button>
                    <button class="btn-remove" onclick="removeFavorite('${crane._id}')">
                        Remove
                    </button>
                    <button class="btn-details" onclick="window.location.href='/cranes/page/${crane._id}'">
                        Details
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

async function removeFavorite(id) {
    await fetch(`/favorites/remove/${id}`, { method: "POST" });
    loadFavorites();
}

function viewAR(link) {
    window.open(`/ar-viewer?model=${encodeURIComponent(link)}`, "_blank");
}

loadFavorites();
