const socket = io();

socket.emit("idlogin", localStorage.getItem("accountid"));

socket.emit("joinroom", localStorage.getItem("accountid"), "testlobby");

socket.on("loginevent", async (data) => {
	if (data.success) {
		console.log("yay!");
	} else if (!data.success) {
		if (data.redirect) {
			location.href = data.redirect;
		}
	}
});

document.addEventListener("DOMContentLoaded", () => {
	const clickerbox = document.querySelector(".clickerinvis");

	clickerbox.addEventListener("click", (event) => {
		socket.emit("click", localStorage.getItem("accountid"), {
			mouse: {
				x: (event.clientX - clickerbox.offsetLeft) / clickerbox.clientWidth,
				y: (event.clientY - clickerbox.offsetTop) / clickerbox.clientWidth,
			},
		});
	});
});

socket.on("clicked", async (data) => {
	const clickerbox = document.querySelector(".clickerinvis");

	const x = data.mouse.x * clickerbox.clientWidth + clickerbox.offsetLeft;
	const y = data.mouse.y * clickerbox.clientWidth + clickerbox.offsetTop;
	makeclick(x, y, data.user.profile);

	document.getElementById("saycookieammount").innerHTML = `${data.game.money} ${data.game.moneyname}`;
	document.getElementById("gametitle").innerHTML = data.game.title;
	document.getElementById("clickeremoji").innerHTML = data.game.emoji;
	twemoji.parse(document.body, { base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/", folder: "svg", ext: ".svg" });
});
