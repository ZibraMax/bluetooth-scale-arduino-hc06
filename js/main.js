const text = document.getElementById("value");
const button = document.getElementById("bton");
const buttonTare = document.getElementById("tare");
const buttonRestart = document.getElementById("buttonRestart");
const buttonStop = document.getElementById("buttonStop");
class LineBreakTransformer {
	constructor() {
		this.chunks = "";
	}
	transform(chunk, controller) {
		this.chunks += chunk;
		const lines = this.chunks.split("\r\n");
		this.chunks = lines.pop();
		lines.forEach((line) => controller.enqueue(line));
	}
	flush(controller) {
		controller.enqueue(this.chunks);
	}
}

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
};
const layout_vel = {
	title: "Flow vs time",
	xaxis: {
		title: "Time [s]",
	},
	yaxis: {
		title: "Flow [g/s]",
	},
};
Plotly.newPlot("mass", [dataMass], layout_mass);
Plotly.newPlot("flow", [dataFlow], layout_vel);

button.addEventListener("click", async () => {
	text.innerHTML = "Loading!";
	const port = await navigator.serial.requestPort();
	await port.open({ baudRate: 9600 });
	const textDecoder = new TextDecoderStream();
	const textEncoder = new TextEncoderStream();
	const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
	const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
	const reader = textDecoder.readable
		.pipeThrough(new TransformStream(new LineBreakTransformer()))
		.getReader();
	const writer = textEncoder.writable.getWriter();
	await writer.write("k");
	await writer.write("t");
	let connected = true;

	buttonRestart.addEventListener("click", async () => {
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
	buttonTare.addEventListener("click", async () => {
		writer.write("t");
	});
	buttonStop.addEventListener("click", async () => {
		connected = false;
		reader.cancel();
		await readableStreamClosed.catch(() => {
			/* Ignore the error */
		});

		writer.close();
		await writableStreamClosed;

		await port.close();
	});
	while (connected) {
		const { value, done } = await reader.read();
		if (done) {
			reader.releaseLock();
			break;
		}
		if (!value.includes("#")) {
			let datos = value.split("//");
			let tiempo = parseFloat(datos[0]) / 1000.0;
			let masa = parseFloat(datos[1]);
			let velocidad = parseFloat(datos[2]);
			let n_datos = parseInt(datos[3]);
			text.innerHTML = masa + " g";

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
		} else {
			text.innerHTML = value;
		}
	}
});
