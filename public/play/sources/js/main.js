var clicknim = 0;
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
}
