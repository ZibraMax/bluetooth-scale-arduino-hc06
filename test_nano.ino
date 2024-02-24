
#include "HX711.h"
HX711 scale;
#include <SoftwareSerial.h>
SoftwareSerial hc06(2, 3);

// 1. HX711 circuit wiring
#define LOADCELL_DOUT_PIN 5
#define LOADCELL_SCK_PIN 4
#define LOADCELL_DIVIDER -1005

int delaytime = 250;
float last = 0;
unsigned long starttime = millis();
unsigned long start_timer = millis();
float promedio = 0.0;
int cantidad = 0;

void setup()
{
  Serial.begin(9600);
  hc06.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  Serial.println("Balanza inicializada!");
  hc06.println("#Balanza inicializada!");
  scale.set_scale(LOADCELL_DIVIDER);
  scale.tare();
  Serial.println("Balanza lista!");
  hc06.println("#Balanza lista!");
}

void tarar()
{
  Serial.println("Tarando...");
  hc06.println("#Tarando...");
  scale.tare();
  reset();
}

void reset()
{
  starttime = millis();
  promedio = 0.0;
  cantidad = 0;
}

void manipulateInput(int input)
{
  if (input == (int)'t' || input == (int)'T')
  {
    tarar();
  }
  else if (input == (int)'+')
  {
    delaytime += 100;
    reset();
    Serial.println("Delay: " + String(((float)delaytime) / 1000));
    hc06.println("#Delay: " + String(((float)delaytime) / 1000));
  }
  else if (input == (int)'-')
  {
    delaytime -= 100;
    reset();
    Serial.println("Delay: " + String(((float)delaytime) / 1000));
    hc06.println("#Delay: " + String(((float)delaytime) / 1000));
  }
  else if (input == (int) 'k')
  {
    start_timer = millis();
    Serial.println("Timer en 0!");
  }
}

void loop()
{
  cantidad++;
  float actual = scale.get_units();
  promedio += (actual - promedio) / cantidad;

  unsigned long endtime = millis();
  unsigned long duration_timer = endtime - start_timer;
  unsigned long duration = endtime - starttime;
  if (duration >= delaytime)
  {
    starttime = endtime;

    float vel = (promedio - last) / ((float)duration) * 1000;
    last = promedio;
    if (abs(promedio) < 0.1)
    {
      promedio = 0;
      vel = 0;
    }

    String msg1 = String(promedio, 1) + " g. " + String(vel, 1) + " g/s. " + String(cantidad) + " mediciones.";
    String msg2 = String(duration_timer)+"//"+ String(promedio, 1) + "//" + String(vel, 1) + "//" + String(cantidad) + "//";
    Serial.println(msg1);
    hc06.println(msg2);
    reset();
  }
  if (Serial.available())
  {
    manipulateInput(Serial.read());
  }
  if (hc06.available())
  {
    int btmsg = hc06.read();
    manipulateInput(btmsg);
  }
}