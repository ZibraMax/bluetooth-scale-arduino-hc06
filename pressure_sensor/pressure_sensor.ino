int analogPinV2 = A2;
int analogPinV4 = A4;

float vS = 5.0;
int delayTime = 500;

float convertInputToVoltage(int inpt)
{
	float inptdouble = (float)inpt;
	return 5.0 / 1023.0 * inptdouble; // tambien podría ser float voltage = ((float) rawADC  + 0.5 ) / 1024.0 * 5.0;
}
float convertVoltageToPressure(float vO)
{
	float pressure_kPa = (vO - 0.04) / (0.09 * vS);
	return pressure_kPa;
}

float convertInputToPressure(int inpt)
{
	float vO = convertInputToVoltage(inpt);
	float pressure_kPa = convertVoltageToPressure(vO);
	return pressure_kPa;
}

void setup()
{
	pinMode(analogPinV2, INPUT);
	pinMode(analogPinV4, INPUT);
	Serial.begin(9600);
}

void loop()
{
	int V2 = analogRead(analogPinV2); // read the input pin
	int V4 = analogRead(analogPinV4); // read the input pin
	int input_signal = V2 - V4;
	float voltage = convertInputToVoltage(input_signal);
	float pressure = convertVoltageToPressure(voltage);
	Serial.println("P: " + String(pressure) + ", V: " + String(voltage) + ", A: " + String(input_signal) + ", V2: " + String(V2) + ", V4: " + String(V4)); // debug value
	delay(delayTime);
}