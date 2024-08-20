const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { QuickDB } = require("quick.db");
const port = process.env.PORT || 8080;
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const accountDB = new QuickDB({ filePath: "./databases/accountDB.sqlite" });
const gamesDB = new QuickDB({ filePath: "./databases/accountDB.sqlite" });

server.listen(port, () => {
	console.log("Server listening at port %d", port);
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
	socket.on("idlogin", async (accountid) => {
		var account = await accountDB.get(`user_${accountid}`);
		if (!account) return socket.emit("loginevent", { success: false, redirect: "/account" });
		if (account.disabled) return socket.emit("loginevent", { success: false });
		socket.emit("loginevent", { success: true, message: account, redirect: "/lobby" });
		console.log(account);
	});

	socket.on("login", async (email, password) => {
		if (!email || !password) {
			return socket.emit("loginevent", { success: false, message: "You must fill out the required boxes." });
		}
		const allaccs = await accountDB.all();

		for (const value of allaccs) {
			var acc = value.value;
			if (acc.email === email && acc.password === password) {
				if (!acc.profile) return socket.emit("loginevent", { success: false, message: "noprofile" });
				return socket.emit("loginevent", { success: true, message: acc, redirect: "/lobby" });
			}
		}
	});

	socket.on("register", async (username, discriminator, email, password) => {
		if (!username || !discriminator || !email || !password) {
			return socket.emit("loginevent", { success: false, message: "You must fill out the required boxes." });
		}

		if (discriminator.length != 4) {
			return socket.emit("loginevent", { success: false, message: "Your Discriminator must be 4 numbers long." });
		}

		if (isNaN(discriminator)) {
			return socket.emit("loginevent", { success: false, message: "Your Discriminator must only include numbers." });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return socket.emit("loginevent", { success: false, message: "Your Email must be a proper Email." });
		}

		const allaccs = await accountDB.all();

		for (const value of allaccs) {
			var acc = value.value;
			if (acc.username + "#" + acc.discriminator === username + "#" + discriminator) {
				return socket.emit("loginevent", { success: false, message: username + "#" + discriminator + " is taken." });
			}
			if (acc.email === email) {
				return socket.emit("loginevent", { success: false, message: "Email is already in use, please login." });
			}
		}

		var accountdata = {
			id: uuidv4(),
			username: username,
			discriminator: discriminator,
			email: email,
			password: password,
			valid: true,
			creationdate: Date.now(),
			lobby: null,
		};
		console.log(`Just made ${username}#${discriminator}'s account!`);
		accountDB.set(`user_${accountdata.id}`, accountdata);

		socket.emit("loginevent", {
			success: true,
			message: accountdata,
			redirect: "../",
		});
	});

	socket.on("setprofile", async (accountid, profile) => {
		try {
			if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(profile)) {
				throw new Error("Invalid Base64 image format.");
			}

			const base64Data = profile.split(",")[1];
			const imgBuffer = Buffer.from(base64Data, "base64");

			await sharp(imgBuffer).metadata();
			console.log("Image is valid");

			var useraccount = await accountDB.get(`user_${accountid}`);

			if (!useraccount.profile) useraccount.profile = profile;
			await accountDB.set(`user_${accountid}`, useraccount);

			socket.emit("loginevent", { success: true, message: useraccount, redirect: "/lobby" });
		} catch (err) {
			console.error("Invalid image data:", err.message);
		}
	});

	/*
    ███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
    █░░░░░░░░░░░░░░░░███░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░██████████░░░░░░████░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░██░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█
    █░░▄▀▄▀▄▀▄▀▄▀▄▀░░███░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░░░░░░░░░░░░░▄▀░░████░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█
    █░░▄▀░░░░░░░░▄▀░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀░░████░░▄▀░░░░░░░░░░█░░░░░░▄▀░░░░░░█░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░░░░░█░░▄▀░░░░░░░░░░█
    █░░▄▀░░████░░▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░▄▀░░░░░░▄▀░░████░░▄▀░░█████████████░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░█████████░░▄▀░░█████████
    █░░▄▀░░░░░░░░▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░██░░▄▀░░████░░▄▀░░░░░░░░░░█████░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░░░░░█░░▄▀░░░░░░░░░░█
    █░░▄▀▄▀▄▀▄▀▄▀▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░██░░▄▀░░████░░▄▀▄▀▄▀▄▀▄▀░░█████░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█
    █░░▄▀░░░░░░▄▀░░░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░░░░░██░░▄▀░░████░░░░░░░░░░▄▀░░█████░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░░░░░█░░▄▀░░░░░░░░░░█
    █░░▄▀░░██░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██████████░░▄▀░░████████████░░▄▀░░█████░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░█████████░░▄▀░░█████████
    █░░▄▀░░██░░▄▀░░░░░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░██████████░░▄▀░░████░░░░░░░░░░▄▀░░█████░░▄▀░░█████░░▄▀░░░░░░▄▀░░█░░▄▀░░█████████░░▄▀░░█████████
    █░░▄▀░░██░░▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░██████████░░▄▀░░████░░▄▀▄▀▄▀▄▀▄▀░░█████░░▄▀░░█████░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░█████████░░▄▀░░█████████
    █░░░░░░██░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░██████████░░░░░░████░░░░░░░░░░░░░░█████░░░░░░█████░░░░░░░░░░░░░░█░░░░░░█████████░░░░░░█████████
    ███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
    */
	var testlobby = {
		mouse: {},
		user: {},
		game: {
			title: "Guy Slapperss",
			moneyname: "Slaps",
			emoji: "🧔🏿‍♂️",
			money: 0,
			clickdamage: 12,
		},
	};
	socket.on("joinroom", async (userid, room) => {
		try {
			var account = await accountDB.get(`user_${userid}`);
			if (!account) return;
			await socket.join(room);
			//if (account.lobby == room) return console.loeg("User already in room");
			/* - */
			if (!testlobby.members) testlobby.members = [];
			testlobby.members.push(userid);
			/* - */
			account.lobby = room;
			console.log("Put user in a room");
			await accountDB.set(`user_${userid}`, account);
		} catch (e) {
			console.error(e);
		}
	});

	socket.on("click", async (userid, data) => {
		var account = await accountDB.get(`user_${userid}`);
		if (!account) return;
		if (!account.lobby) return;

		testlobby.game.money = (testlobby.game.money || 0) + (testlobby.game.clickdamage || 1);

		var senddata = {
			mouse: {
				x: data.mouse.x,
				y: data.mouse.y,
			},
			user: {
				name: account.username,
				discriminator: account.discriminator,
				profile: account.profile || "https://media.discordapp.net/attachments/1271602492894871562/1273450402913976422/4071df9097bfdfdabb3583ebdfb0c2f8.jpg?ex=66bea89b&is=66bd571b&hm=5b2944dd2e4267264b4c35d5ae23bef75e66c96fb0c296274bff954953830f37&=&format=webp&width=627&height=554",
			},
			game: {
				title: testlobby.game.title || "9/11 Time",
				moneyname: testlobby.game.moneyname || "Crashes",
				emoji: testlobby.game.emoji || "✈️",
				money: testlobby.game.money || 0,
			},
		};

		io.to(account.lobby).emit("clicked", senddata);
	});
});
