import { BluetoothTerminal } from "./BluetoothTerminal.js";

const text = document.getElementById("value");
const textDevice = document.getElementById("deviceInfo");
const textTime = document.getElementById("valueTime");
const button = document.getElementById("bton");
const buttonTare = document.getElementById("tare");
const buttonRestart = document.getElementById("buttonRestart");
const buttonStop = document.getElementById("buttonStop");
const buttonDisconect = document.getElementById("buttonDisconect");
const buttonPause = document.getElementById("buttonPause");
const buttonDownload = document.getElementById("buttonDownload");

function parseTime(time) {
	const minutes = Math.floor(time / 60);
	const seconds = time - minutes * 60;
	return minutes + ":" + Math.round(seconds);
}

function download(filename, text) {
	var element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(text)
	);
	element.setAttribute("download", filename);

	element.style.display = "none";
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

const dataMass = { x: [0], y: [0], mode: "lines", line: { shape: "spline" } };
const dataFlow = { x: [0], y: [0], mode: "lines", line: { shape: "spline" } };
const layout_mass = {
	xaxis: {
		title: "Time [s]",
	},
	yaxis: {
		title: "Mass [g]",
	},
	font: {
		family: "Space Mono, monospace",
	},
	margin: {
		t: 23,
		l: 40,
		r: 23,
		pad: 0,
	},
};
const layout_vel = {
	xaxis: {
		title: "Time [s]",
	},
	yaxis: {
		title: "Flow [g/s]",
	},
	font: {
		family: "Space Mono, monospace",
	},
	margin: {
		t: 23,
		l: 40,
		r: 23,
		pad: 0,
	},
};

const config = { responsive: true, displayModeBar: false };

let queries_static_plot = [
	"(max-width: 990px) and (orientation: portrait)",
	"(max-width: 1250px) and (orientation: landscape",
];
for (const querie of queries_static_plot) {
	var x = window.matchMedia(querie);
	if (x.matches) {
		config.staticPlot = true;
	}
}

var paused = false;
Plotly.newPlot("mass", [dataMass], layout_mass, config);
Plotly.newPlot("flow", [dataFlow], layout_vel, config);

// Obtain configured instance.
let terminal = new BluetoothTerminal();

// Override `receive` method to handle incoming data as you want.
let wakeLock = null;
const requestWakeLock = async () => {
	try {
		wakeLock = await navigator.wakeLock.request("screen");

		// listen for our release event
		wakeLock.addEventListener("release", () => {
			// if wake lock is released alter the UI accordingly
		});
	} catch (err) {
		// if wake lock request fails - usually system related, such as battery
	}
};

button.addEventListener("click", () => {
	let offsetTime = 0;
	text.innerHTML = "Loading!";
	try {
		terminal.connect().then(() => {
			console.log(terminal.getDeviceName() + " is connected!");
			terminal.send("tks");
			textDevice.innerHTML = "Connected to " + terminal.getDeviceName();
			try {
				requestWakeLock();
				console.log("Screen Wake Lock is active");
			} catch (err) {
				console.error(err);
			}

			let connected = true;
			buttonPause.addEventListener("click", () => {
				terminal.send("p");
				if (paused) {
					paused = false;
					buttonPause.innerHTML = "Pause";
				} else {
					paused = true;
					buttonPause.innerHTML = "Resume";
				}
			});
			buttonDownload.addEventListener("click", () => {
				download(
					`mass_${new Date().toJSON().slice(0, 19)}.json`.replaceAll(
						":",
						"-"
					),
					JSON.stringify(dataMass)
				);
				download(
					`flow_${new Date().toJSON().slice(0, 19)}.json`.replaceAll(
						":",
						"-"
					),
					JSON.stringify(dataFlow)
				);
			});

			buttonRestart.addEventListener("click", () => {
				try {
					terminal.send("kt");
				} catch (error) {}
				dataMass.x = [0];
				dataMass.y = [0];
				dataFlow.x = [0];
				dataFlow.y = [0];
				Plotly.redraw("mass");
				Plotly.redraw("flow");
			});
			buttonTare.addEventListener("click", () => {
				terminal.send("t");
			});
			buttonStop.addEventListener("click", () => {
				if (!paused) {
					terminal.send("tkp");
					paused = true;
				} else {
					terminal.send("tk");
				}
				dataMass.x = [0];
				dataMass.y = [0];
				dataFlow.x = [0];
				dataFlow.y = [0];
				Plotly.redraw("mass");
				Plotly.redraw("flow");

				textTime.innerHTML = "0 s";
				buttonPause.innerHTML = "Start!";
			});
			buttonDisconect.addEventListener("click", async () => {
				terminal.disconnect();
				if (wakeLock !== null) {
					wakeLock.release().then(() => {
						wakeLock = null;
						console.log("Wavelock disconeceted");
					});
				}
				textDevice.innerHTML = "Device disconected";
			});

			terminal.receive = function (value) {
				if (!value.includes("#")) {
					let datos = value.split("//");
					let tiempo = parseFloat(datos[0]) / 1000.0;
					let masa = parseFloat(datos[1]);
					let velocidad = parseFloat(datos[2]);
					let n_datos = parseInt(datos[3]);
					text.innerHTML = masa + " g";
					textTime.innerHTML = parseTime(tiempo);

					if (!paused) {
						if (tiempo < dataFlow.x[dataFlow.x.length - 1]) {
							dataMass.x = [0];
							dataMass.y = [0];
							dataFlow.x = [0];
							dataFlow.y = [0];
						}
						dataMass.x.push(tiempo);
						dataFlow.x.push(tiempo);
						dataMass.y.push(masa);
						dataFlow.y.push(velocidad);
						Plotly.redraw("mass");
						Plotly.redraw("flow");
					}
				} else {
					text.innerHTML = value;
				}
			};
		});
	} catch (error) {
		text.innerHTML = "Device disconected! Try again!";
	}
});
