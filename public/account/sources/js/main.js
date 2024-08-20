const socket = io();

var mode;

function login() {
	mode = 1;
	var email = document.getElementById("loggmail").value;
	var password = document.getElementById("logpassword").value;

	console.log(email + "   " + password);
	socket.emit("login", email, password);
}

function register() {
	mode = 2;
	var username = document.getElementById("regusername").value;
	var discriminator = document.getElementById("regdiscrim").value;
	var email = document.getElementById("reggmail").value;
	var password = document.getElementById("regpassword").value;

	console.log(username + "#" + discriminator + "    " + email + "   " + password);
	socket.emit("register", username, discriminator, email, password);
}

socket.on("loginevent", async (data) => {
	if (data.success) {
		console.log("yay!");
		console.log(data.message);
		localStorage.setItem("accountid", data.message.id);
		location.href = data.redirect;
	} else if (!data.success) {
		if (data.message) {
			if (mode == 1) {
				document.getElementById("logtext").innerHTML = data.message;
				document.getElementById("logtext").classList.add("errorMsg");
			}
			if (mode == 2) {
				document.getElementById("regtext").innerHTML = data.message;
				document.getElementById("regtext").classList.add("errorMsg");
			}
		}
		console.log("uht oh :(");
		if (data.redirect) {
			console.log(data.redirect);
			location.href = data.redirect;
		}
	}
});
