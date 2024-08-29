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

socket.on("data", async (data) => {
	const clickerbox = document.querySelector(".clickerinvis");

	if (data.game.didclick) {
		const x = data.mouse.x * clickerbox.clientWidth + clickerbox.offsetLeft;
		const y = data.mouse.y * clickerbox.clientWidth + clickerbox.offsetTop;
		makeclick(x, y, data.user.profile);
	}

	// Show the available upgrades to buy
	if (data.upgrades) {
		console.log(data.upgrades);
		document.querySelector(".upgrade-area").innerHTML = "";

		data.upgrades.forEach((i) => {
			const upgradeBox = document.createElement("div");
			upgradeBox.classList.add("upgrade-box");
			upgradeBox.onclick = function () {
				buyupgrade(i.name);
			};

			const upgradeEmoji = document.createElement("div");
			upgradeEmoji.classList.add("upgrade-emoji");
			upgradeEmoji.textContent = i.emoji;
			upgradeBox.appendChild(upgradeEmoji);

			const upgradeTitle = document.createElement("div");
			upgradeTitle.classList.add("upgrade-title");
			upgradeTitle.textContent = i.name.toUpperCase();
			upgradeBox.appendChild(upgradeTitle);

			const upgradeInfo = document.createElement("div");
			upgradeInfo.classList.add("upgrade-info");
			upgradeInfo.textContent = `${i.price.toFixed(2)}$ (${i.owned || 0} OWNED)`;
			upgradeBox.appendChild(upgradeInfo);

			const upgradeDetails = document.createElement("div");
			upgradeDetails.classList.add("upgrade-details");
			upgradeDetails.textContent = i.info;
			upgradeBox.appendChild(upgradeDetails);

			document.querySelector(".upgrade-area").appendChild(upgradeBox);
		});
		document.querySelector(".owned-area").innerHTML = "";

		data.upgrades.forEach((i) => {
			if (i.owned == 0) return;

			const upgradeBox = document.createElement("div");
			upgradeBox.classList.add("owned-box");

			const upgradeEmoji = document.createElement("div");
			upgradeEmoji.classList.add("owned-emoji");
			upgradeEmoji.textContent = i.emoji;
			upgradeBox.appendChild(upgradeEmoji);

			const upgradeTitle = document.createElement("div");
			upgradeTitle.classList.add("owned-title");
			upgradeTitle.textContent = i.name.toUpperCase();
			upgradeBox.appendChild(upgradeTitle);

			const upgradeInfo = document.createElement("div");
			upgradeInfo.classList.add("owned-info");
			var infotoshowhere = "Woops!";
			if (i.clickdamage) infotoshowhere = `+${(i.clickdamage * i.owned).toFixed(2)} CLICK DAMAGE`;
			if (i.clickmulti) infotoshowhere = `${(i.clickmulti * i.owned).toFixed(2)} CLICK MULTIPLIER`;
			upgradeInfo.textContent = infotoshowhere;
			upgradeBox.appendChild(upgradeInfo);

			const upgradeDetails = document.createElement("div");
			upgradeDetails.classList.add("owned-details");
			upgradeDetails.textContent = i.info;
			upgradeBox.appendChild(upgradeDetails);

			document.querySelector(".owned-area").appendChild(upgradeBox);
		});
	}

	document.getElementById("saycookieammount").innerHTML = `${data.game.money.toFixed(2)} ${data.game.moneyname}`;
	document.getElementById("gametitle").innerHTML = data.game.title;
	document.getElementById("clickeremoji").innerHTML = data.game.emoji;
	twemoji.parse(document.body, { base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/", folder: "svg", ext: ".svg" });
});

function buyupgrade(thethingtoupgrade) {
	socket.emit("buyanupgrade", localStorage.getItem("accountid"), thethingtoupgrade);
}
let lastClickTimes = {};
