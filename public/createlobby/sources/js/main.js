var tempcookieammount = 44;
var lobbyopen = false;

var lobbyinfo = {
	public: false,
	joincode: null,
	title: "Idle Together",
	subtitle: "Clicks",
	emoji: "🍪",
};

const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}\u{1FC00}-\u{1FCFF}\u{1FD00}-\u{1FDFF}\u{1FE00}-\u{1FEFF}\u{1FF00}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{303D}\u{3297}\u{3299}\u{2049}\u{203C}\u{25AA}-\u{25AB}\u{25FB}-\u{25FE}\u{2B1B}-\u{2B1C}\u{1F201}-\u{1F20F}\u{1F233}-\u{1F23A}]+$/u;

function fitText(element, kompressor = 1) {
	const resizeText = () => {
		const parentWidth = element.parentElement.clientWidth;
		const parentHeight = element.parentElement.clientHeight;

		const newFontSize = Math.min(parentWidth / (kompressor * 10), parentHeight) * 0.9;

		element.style.fontSize = newFontSize + "px";
		element.style.lineHeight = newFontSize + "px"; // Ensures the text vertically centers within the line height
	};

	resizeText();

	window.addEventListener("resize", resizeText);
}

document.addEventListener("DOMContentLoaded", function () {
	const idlegroupname = document.querySelector(".idlegroupname span");
	fitText(idlegroupname, 0.75); // Adjust the compression factor as needed
	const idlemoneyamount = document.querySelector(".idlemoneyamount span");
	fitText(idlemoneyamount, 1); // Adjust the compression factor as needed
});

function load() {
	twemoji.parse(document.body, { base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/", folder: "svg", ext: ".svg" });
}
const audioSrc = "./sources/extra/Clding.wav"; // Replace with your audio file path
const audioCache = [];

const clicker = document.querySelector(".clicker");
let isShake1 = true; // Track which animation is currently applied
const newShakeClass = isShake1 ? "shake2" : "shake1";

function makeclick(x, y, profile) {
	tempcookieammount = tempcookieammount + 1;
	updatesubtitletext();
	try {
		if (!profile) profile = "./";
		if (!x) x = -1000;
		if (!y) y = -1000;
		const div = document.createElement("img");
		div.style.position = "absolute";
		div.style.width = "2vw";
		div.style.height = "2vw";
		//div.style.backgroundColor = "red"; // Change color as needed
		div.style.left = `calc(${x}px - 1vw)`;
		div.style.top = `calc(${y}px - 1vw)`;
		div.setAttribute("src", profile);
		div.classList = "animgoingaway";

		// Append the div to the body
		document.body.appendChild(div);

		div.addEventListener(
			"animationend",
			() => {
				div.remove();
			},
			{ once: true }
		);

		isShake1 = !isShake1; // Toggle the animation state
		const newShakeClass = isShake1 ? "shake1" : "shake2"; // Determine the new class

		// Remove both shake classes before adding the new one
		clicker.classList.remove("shake1", "shake2");
		clicker.classList.add(newShakeClass);

		clicker.addEventListener(
			"animationend",
			() => {
				clicker.classList.remove(newShakeClass); // Remove the class when the animation ends
			},
			{ once: true } // Ensure the event listener is only triggered once per click
		);
		const audio = new Audio(audioSrc);
		audioCache.push(audio); // Keep reference to prevent garbage collection
		audio.play();

		audio.addEventListener("ended", () => {
			const index = audioCache.indexOf(audio);
			if (index > -1) {
				audioCache.splice(index, 1);
			}
		});
	} catch (e) {
		return 0;
	}
}
var lastValidEmoji = "🍪";

function updatetitletext() {
	document.getElementById("gametitle").innerHTML = document.getElementById("titleinputbox").value;
	lobbyinfo.title = document.getElementById("titleinputbox").value;
	pushdatatoserver();
}
function updatesubtitletext() {
	document.getElementById("saycookieammount").innerHTML = tempcookieammount + " " + document.getElementById("subtitleinputbox").value;
	lobbyinfo.subtitle = document.getElementById("subtitleinputbox").value;
	pushdatatoserver();
}

function updateLobbyStatus() {
	if (lobbyopen) {
		lobbyopen = false;
		document.getElementById("showlobbystatus").innerHTML = "Private";
	} else {
		lobbyopen = true;
		document.getElementById("showlobbystatus").innerHTML = "Public";
	}
	lobbyinfo.public = lobbyopen;
	pushdatatoserver();
}

function updatelobbycodet() {
	lobbyinfo.joincode = document.getElementById("codeinputbox").value;
	pushdatatoserver();
}

function updateemoji() {
	var text = document.getElementById("emojiinputbox").value;
	console.log(isSingleEmoji(text.trim()));
	const trimmedValue = text.trim();

	// Check if the input is a single valid emoji
	if (isSingleEmoji(trimmedValue)) {
		lastValidEmoji = trimmedValue; // Update last valid emoji
	} else {
		text = lastValidEmoji; // Restore the last valid emoji
	}
	console.log(text);
	document.getElementById("clickeremoji").innerHTML = text;
	if (document.getElementById("emojiinputbox").value.length >= 2) document.getElementById("emojiinputbox").value = text;

	lobbyinfo.emoji = text;
	pushdatatoserver();
	load();
}

const clickerbox = document.querySelector(".clickerinvis");

clickerbox.addEventListener("click", (event) => {
	makeclick();
});

function isSingleEmoji(input) {
	const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
	const segments = [...segmenter.segment(input.trim())];
	// Check if there's exactly one grapheme and it's an emoji
	return segments.length === 1 && /^\p{Extended_Pictographic}$/u.test(segments[0].segment);
}
