const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { QuickDB } = require("quick.db");
const port = process.env.PORT || 8080;
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const upgrades = require("./upgrades.json");

const accountDB = new QuickDB({ filePath: "./databases/accountDB.sqlite" });
const gamesDB = new QuickDB({ filePath: "./databases/accountDB.sqlite" });
let lastClickTimes = {};

server.listen(port, () => {
	console.log("Server listening at port %d", port);
});

app.use(express.static(path.join(__dirname, "public")));
var testlobby = {
	mouse: {},
	user: {},
	game: {
		title: "Guy Slapperss",
		moneyname: "Slaps",
		emoji: "🧔🏿‍♂️",
		money: 0,
		clickdamage: 1,
	},
	upgrades: [],
};
io.on("connection", (socket) => {
	socket.on("idlogin", async (accountid) => {
		var account = await accountDB.get(`user_${accountid}`);
		if (!account) return socket.emit("loginevent", { success: false, redirect: "/account" });
		if (account.disabled) return socket.emit("loginevent", { success: false });
		if (!account.profile) return socket.emit("loginevent", { success: false, message: "noprofile" });
		socket.emit("loginevent", { success: true, message: account, redirect: "/lobby" });
	});

	socket.on("login", async (email, password) => {
		if (!email || !password) {
			return socket.emit("loginevent", { success: false, message: "You must fill out the required boxes." });
		}
		const allaccs = await accountDB.all();

		for (const value of allaccs) {
			var acc = value.value;

			if (acc.email === email && acc.password === password) {
				if (!acc.profile) {
					socket.emit("loginevent", { success: false, message: "noprofile" });
				} else {
					return socket.emit("loginevent", { success: true, message: acc, redirect: "/" });
				}
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

		accountDB.set(`user_${accountdata.id}`, accountdata);

		socket.emit("loginevent", {
			success: true,
			message: accountdata,
			redirect: "../",
		});
	});

	socket.on("setprofile", async (accountid, profile) => {
		var useraccount = await accountDB.get(`user_${accountid}`);
		if (!useraccount) return socket.emit("loginevent", { success: false, redirect: "/account" });
		try {
			if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(profile)) {
				throw new Error("Invalid Base64 image format.");
			}

			const base64Data = profile.split(",")[1];
			const imgBuffer = Buffer.from(base64Data, "base64");

			await sharp(imgBuffer).metadata();

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

	socket.on("joinroom", async (userid, room) => {
		try {
			var account = await accountDB.get(`user_${userid}`);
			if (!account) return;
			await socket.join(room);
			//if (account.lobby == room) return io.to(account.lobby).emit("data", testlobby);
			/* - */
			if (!testlobby.members) testlobby.members = [];
			testlobby.members.push(userid);
			/* - */
			account.lobby = room;
			await accountDB.set(`user_${userid}`, account);
			io.to(account.lobby).emit("data", testlobby);
		} catch (e) {
			console.error(e);
		}
	});

	socket.on("click", async (userid, data) => {
		const currentTime = Date.now();

		if (!lastClickTimes[userid]) {
			lastClickTimes[userid] = 0;
		}

		const maxCPS = 13; // Maximum clicks per second
		const delay = Math.floor(1000 / maxCPS); // Calculate delay in milliseconds

		if (currentTime - lastClickTimes[userid] < delay) return; // Apply the delay
		lastClickTimes[userid] = currentTime;

		var account = await accountDB.get(`user_${userid}`);
		if (!account) return;
		if (!account.lobby) return;

		var cp = 1;
		var cm = 1;
		testlobby.upgrades.forEach((i) => {
			if (i.clickdamage) cp = cp + i.clickdamage * i.owned;
			if (i.clickmulti) cm = cm + i.clickmulti * i.owned;
		});

		testlobby.game.money = (testlobby.game.money || 0) + Math.abs(cp * cm);
		// Prepare send data
		var senddata = {
			mouse: {
				x: data.mouse.x,
				y: data.mouse.y,
			},
			user: {
				name: account.username,
				discriminator: account.discriminator,
				profile: account.profile || "default_profile_image_url", // Your default profile image URL
			},
			game: {
				title: testlobby.game.title || "Game Title",
				moneyname: testlobby.game.moneyname || "Currency",
				emoji: testlobby.game.emoji || "💰",
				money: testlobby.game.money || 0,
				didclick: true,
			},
			upgrades: [],
		};

		// Get all owned upgrades
		var ownedUpgrades = testlobby.upgrades.map((upg) => ({
			...upg,
			owned: upg.owned || 0,
		}));

		// Find the next available upgrade that hasn't been purchased yet
		var nextUpgrade = upgrades.find((upg) => !testlobby.upgrades.some((owned) => owned.name === upg.name));

		// Combine owned upgrades and the next available upgrade to show
		var viewablesupgrades = [...ownedUpgrades];
		if (nextUpgrade) {
			viewablesupgrades.push({ ...nextUpgrade, owned: 0 });
		}

		senddata.upgrades = viewablesupgrades;

		// Emit the data to all clients in the lobby
		io.to(account.lobby).emit("data", senddata);
	});

	socket.on("buyanupgrade", async (accountid, item) => {
		// Fetch the account data using the account ID
		var account = await accountDB.get(`user_${accountid}`);
		if (!account) return; // Exit if the account is not found

		// Find the upgrade item based on the name passed
		let upgrade = upgrades.find((i) => i.name == item);
		if (!upgrade) return; // Exit if the upgrade is not found

		// Get the current balance of the lobby
		var balance = testlobby.game.money;

		// Calculate the price with an increase for each owned upgrade
		var existingUpgrade = testlobby.upgrades.find((t) => t.name == item);
		var itemprice = upgrade.price * Math.pow(1.1, existingUpgrade?.owned || 0);

		// Check if the lobby has enough money to purchase the upgrade
		if (balance >= itemprice) {
			// Deduct the item price from the lobby balance
			balance -= itemprice;
			testlobby.game.money = balance; // Update the lobby's balance

			// Increment the owned count if the upgrade already exists, or add it to the upgrades list
			if (existingUpgrade) {
				existingUpgrade.owned++;
				existingUpgrade.price = upgrade.price * Math.pow(1.1, existingUpgrade.owned);
			} else {
				testlobby.upgrades.push({ ...upgrade, owned: 1, price: upgrade.price * Math.pow(1.1, 1) });
			}

			// Recalculate available upgrades
			var ownedUpgrades = testlobby.upgrades.map((upg) => ({
				...upg,
				owned: upg.owned || 0,
			}));

			// Find the next available upgrade that hasn't been purchased yet
			var nextUpgrade = upgrades.find((upg) => !testlobby.upgrades.some((owned) => owned.name === upg.name));

			// Combine owned upgrades and the next available upgrade to show
			var viewablesupgrades = [...ownedUpgrades];
			if (nextUpgrade) {
				viewablesupgrades.push({ ...nextUpgrade, owned: 0 });
			}

			// Send the updated lobby data to all clients in the lobby, including the recalculated upgrades
			io.to(account.lobby).emit("data", {
				...testlobby,
				upgrades: viewablesupgrades, // Include the recalculated upgrades
			});
		}
	});
});
