const socket = io();

var userdata = null;

socket.emit("idlogin", localStorage.getItem("accountid"));

socket.on("loginevent", async (data) => {
	if (data.success) {
		userdata = data.message;

		const usericonbox = document.createElement("div");
		usericonbox.classList = "usericonbox";
		usericonbox.setAttribute("id", data.username);

		makeauser({ name: userdata.username, profile: userdata.profile, role: "Lobby Creator" });

		const usericonprofile = document.createElement("img");
		usericonprofile.classList = "usericonprofile";
		usericonprofile.setAttribute("src", userdata.profile);
		usericonprofile.setAttribute("title", userdata.username + " (you)");

		const usericon = document.createElement("div");
		usericon.style.background = "#00ff00";
		usericon.classList = "usericon";

		document.getElementById("useronlinelist").appendChild(usericonbox);
		usericonbox.appendChild(usericonprofile);
		usericonbox.appendChild(usericon);
		/*


				<div class="usericonbox">
					<image class="usericonprofile" src="/logos/Small.png"></image>
					<div class="usericon"></div>
				</div>

				*/
	} else if (!data.success) {
		if (data.redirect) {
			location.href = data.redirect;
		}
	}
});

function makeauser(i) {
	document.querySelector(".upgrade-area").innerHTML = "";
	const upgradeBox = document.createElement("div");
	upgradeBox.classList.add("upgrade-box");
	upgradeBox.onclick = function () {
		kickuser(i.name);
	};

	const upgradeEmoji = document.createElement("img");
	upgradeEmoji.classList.add("upgrade-emoji");
	upgradeEmoji.setAttribute("src", i.profile);
	upgradeBox.appendChild(upgradeEmoji);

	const upgradeTitle = document.createElement("div");
	upgradeTitle.classList.add("upgrade-title");
	upgradeTitle.textContent = i.name.toUpperCase();
	upgradeBox.appendChild(upgradeTitle);

	const upgradeInfo = document.createElement("div");
	upgradeInfo.classList.add("upgrade-info");
	upgradeInfo.textContent = i.role;
	upgradeBox.appendChild(upgradeInfo);

	const upgradeDetails = document.createElement("div");
	upgradeDetails.classList.add("upgrade-details");
	upgradeDetails.textContent = i.info;
	upgradeBox.appendChild(upgradeDetails);

	document.querySelector(".upgrade-area").appendChild(upgradeBox);
}

function pushdatatoserver() {
	socket.emit("makelobby", localStorage.getItem("accountid"), lobbyinfo);
}
