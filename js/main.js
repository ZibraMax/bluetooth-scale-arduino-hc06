import { BluetoothTerminal } from "./BluetoothTerminal.js";

const text = document.getElementById("value");
const textTime = document.getElementById("valueTime");
const button = document.getElementById("bton");
const buttonTare = document.getElementById("tare");
const buttonRestart = document.getElementById("buttonRestart");
const buttonStop = document.getElementById("buttonStop");
const buttonDisconect = document.getElementById("buttonDisconect");
const buttonPause = document.getElementById("buttonPause");
const buttonDownload = document.getElementById("buttonDownload");

const dataMass = { x: [0], y: [0], mode: "lines", line: { shape: "spline" } };
const dataFlow = { x: [0], y: [0], mode: "lines", line: { shape: "spline" } };
const layout_mass = {
	title: "Mass vs time",
	xaxis: {
		title: "Time [s]",
	},
	yaxis: {
		title: "Mass [g]",
	},
	font: {
		family: "Space Mono, monospace",
	},
};
const layout_vel = {
	title: "Flow vs time",
	xaxis: {
		title: "Time [s]",
	},
	yaxis: {
		title: "Flow [g/s]",
	},
	font: {
		family: "Space Mono, monospace",
	},
};

const config = { responsive: true };
var paused = false;
Plotly.newPlot("mass", [dataMass], layout_mass, config);
Plotly.newPlot("flow", [dataFlow], layout_vel, config);

// Obtain configured instance.
let terminal = new BluetoothTerminal();

// Override `receive` method to handle incoming data as you want.
terminal.receive = function (data) {
	alert(data);
};

button.addEventListener("click", () => {
	try {
		terminal.connect().then(() => {
			alert(terminal.getDeviceName() + " is connected!");
			// Send something to the connected device.
			terminal.send("Simon says: Hello, world!");

			// Disconnect from the connected device.
			terminal.disconnect();
		});
	} catch (error) {
		alert(error.message);
	}
});
