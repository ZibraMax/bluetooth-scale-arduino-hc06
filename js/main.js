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

button.addEventListener("click", () => {
	let offsetTime = 0;
	text.innerHTML = "Loading!";
	try {
		terminal.connect().then(() => {
			console.log(terminal.getDeviceName() + " is connected!");
			terminal.send("t");
			terminal.send("k");
			terminal.send("s");

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
					writer.write("k");
					writer.write("t");
				} catch (error) {}
				dataMass.x = [0];
				dataMass.y = [0];
				dataFlow.x = [0];
				dataFlow.y = [0];
				Plotly.redraw("mass");
				Plotly.redraw("flow");
			});
			buttonTare.addEventListener("click", () => {
				writer.write("t");
			});
			buttonStop.addEventListener("click", () => {
				terminal.send("t");
				terminal.send("k");
				if (!paused) {
					terminal.send("p");
					paused = true;
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
				connected = false;
				terminal.disconnect();
			});

			terminal.receive = function (value) {
				if (!value.includes("#")) {
					if (!paused) {
						let datos = value.split("//");
						let tiempo = parseFloat(datos[0]) / 1000.0;
						let masa = parseFloat(datos[1]);
						let velocidad = parseFloat(datos[2]);
						let n_datos = parseInt(datos[3]);
						text.innerHTML = masa + " g";
						textTime.innerHTML = tiempo + " s";

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
