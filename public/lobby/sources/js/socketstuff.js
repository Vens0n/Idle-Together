const socket = io();

var userdata = null;

socket.emit("idlogin", localStorage.getItem("accountid"));

socket.on("loginevent", async (data) => {
	if (data.success) {
		userdata = data.message;
	} else if (!data.success) {
		if (data.redirect) {
			location.href = data.redirect;
		}
	}
});

socket.on("lobbyupdate", async (lobbyinfo) => {
	console.log("I got this btw");
	console.log(lobbyinfo.lobby.owner.username + lobbyinfo.lobby.owner.discriminator);
	createLobbyElement({
		id: lobbyinfo.lobby.owner.username + lobbyinfo.lobby.owner.discriminator,
		lobbyName: lobbyinfo.lobby.title,
		creatorUsername: lobbyinfo.lobby.owner.username,
		creatorProfileImage: lobbyinfo.lobby.owner.profile,
		currentPlayers: lobbyinfo.lobby.playercount,
		maxPlayers: 6,
	});
});

console.log("I got this btw");
