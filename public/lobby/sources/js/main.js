function load() {
	console.log("Hello World!");
}

function createLobbyElement({ id, lobbyName, creatorUsername, creatorProfileImage, currentPlayers, maxPlayers }) {
	// Find the container
	const lobbiesContainer = document.querySelector(".lobbies");
	if (!lobbiesContainer) {
		console.error("No element with class 'lobbies' found.");
		return;
	}

	// Create the main lobby container
	const lobbyDiv = document.createElement("div");
	lobbyDiv.className = "lobby";
	lobbyDiv.setAttribute("id", id);

	// Create leftside div
	const leftsideDiv = document.createElement("div");
	leftsideDiv.className = "leftside";

	// Lobby name section
	const lobbyNameDiv = document.createElement("div");
	lobbyNameDiv.className = "lobbyName";

	const lobbyNameP = document.createElement("p");
	lobbyNameP.textContent = "Lobby Name:";
	const lobbyNameH1 = document.createElement("h1");
	lobbyNameH1.className = "LobbyName";
	lobbyNameH1.textContent = lobbyName;

	lobbyNameDiv.appendChild(lobbyNameP);
	lobbyNameDiv.appendChild(lobbyNameH1);

	// Lobby creator section
	const lobbyCreatorDiv = document.createElement("div");
	lobbyCreatorDiv.className = "lobbyCreator";

	const creatorP = document.createElement("p");
	creatorP.textContent = "By:";
	const creatorImg = document.createElement("img");
	creatorImg.src = creatorProfileImage;
	creatorImg.alt = creatorUsername;
	const creatorNameP = document.createElement("p");
	creatorNameP.textContent = creatorUsername;

	lobbyCreatorDiv.appendChild(creatorP);
	lobbyCreatorDiv.appendChild(creatorImg);
	lobbyCreatorDiv.appendChild(creatorNameP);

	// Append sections to leftside
	leftsideDiv.appendChild(lobbyNameDiv);
	leftsideDiv.appendChild(lobbyCreatorDiv);

	// Create rightside div
	const rightsideDiv = document.createElement("div");
	rightsideDiv.className = "rightside";

	const playersH1 = document.createElement("h1");
	playersH1.className = "players";

	const playersP = document.createElement("p");
	playersP.textContent = "Players:";
	const playersText = document.createTextNode(`${currentPlayers}/${maxPlayers}`);

	playersH1.appendChild(playersP);
	playersH1.appendChild(playersText);

	const selectButton = document.createElement("button");
	selectButton.textContent = "Select Lobby";

	rightsideDiv.appendChild(playersH1);
	rightsideDiv.appendChild(selectButton);

	// Append leftside and rightside to the main lobby container
	lobbyDiv.appendChild(leftsideDiv);
	lobbyDiv.appendChild(rightsideDiv);

	// Add the lobby to the lobbies container

	var existinglobby = document.getElementById(id); //document.getElementById(id);

	if (!existinglobby) {
		lobbiesContainer.appendChild(lobbyDiv);
	} else {
		existinglobby.innerHTML = lobbyDiv.innerHTML;
	}
}
