const socket = io();
var accountid = localStorage.getItem("accountid");

function load() {
	socket.emit("idlogin", accountid);
}

socket.on("loginevent", async (data) => {
	if (data.success) {
		console.log("yay!");
		location.href = data.redirect;
		document.body.innerHTML = "Welcome " + data.message.username + "#" + data.message.discriminator;
	} else if (!data.success) {
		console.log("uht oh :(");
		if (data.message == "noprofile") return openPopup();
		if (data.redirect) {
			location.href = data.redirect;
		} else {
			alert(data.message);
		}
	}
});

function openPopup() {
	document.getElementById("profilePopup").style.display = "flex";
}

function closePopup() {
	document.getElementById("profilePopup").style.display = "none";
}

function submitImage() {
	const imageUrl = document.getElementById("imageUrl").value;
	const imageFile = document.getElementById("imageFile").files[0];

	if (imageUrl) {
		fetch(imageUrl)
			.then((response) => response.blob())
			.then((blob) => convertBlobToBase64(blob));
	} else if (imageFile) {
		const reader = new FileReader();
		reader.onload = () => {
			const base64String = reader.result;
			socket.emit("setprofile", accountid, base64String);
		};
		reader.readAsDataURL(imageFile);
	}
}

function convertBlobToBase64(blob) {
	const reader = new FileReader();
	reader.onload = () => {
		const base64String = reader.result;
		socket.emit("setprofile", accountid, base64String);
	};
	reader.readAsDataURL(blob);
}

openPopup();
