# Small Bluetooth coffe scale app using arduino, HX711, and HC06/HM10 module.

## Limitations

HM10 module is a BL4 bluettoth 4.0 device. The WebBluetooth API is not avaliable on iOS devices.

HC06 module is a classical bluettoth 2.0 device. The WebSerial API is only avaliable in desktop devices. This demo doesn't work in andorid or iOS devices.

## Usage/Tutorial

Load the arduino sketch (`test_nano.ino`) to your board. You can change the pin numbers!
For this demo I used a non-arduino nano board (atmega232), a HX711 load cell amplifier, HM10 bluetooth module, and a [_very cheap scale_](https://www.amazon.com/-/es/B%C3%A1scula-alimentos-recargable-b%C3%A1scula-multifunci%C3%B3n/dp/B0CC97WVSX/ref=sr_1_34?__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3SF2GHS5C2R07&dib=eyJ2IjoiMSJ9.zGUXd8z3Su-lS9XpP42SSy_4Z4H9VrmT5VCSyUBOcNrYYHvclzNhneapiG4iOCmpW2M-xsnl7H3q930PvSHdRCE4MKJf4vpRR99dE1BCKBbE_Yat3YV7jtu6k02gWicnRNsnGG7eZsBJ-ZiY8epnAj5LZJvfm5jguETcofVINkZuoH0sj_8pdsN6hYk1Tin070hXtZOcnTUbQIedCraFEKRSoCMCdiGv8V72H6zFbGrD6io5OrwN9QlVTDXziwB0m3MznYBjs7I-tq_WYgdQEvhKocvWJ48Be-KEj8ZeBQQ.uij0hBXu4wb2jwRwOCE931b9D45blZg11tQjSZfgoDE&dib_tag=se&keywords=kitchen%2Bscale&qid=1708815984&sprefix=kitchenscale%2Caps%2C201&sr=8-34&th=1). With a couple of holes and silicone the boards can be attached inside the body of the scale.

If you use the HC06 module, use the `index_hc06.html`. For pairing the HC06 module with windows follow these extra steps:

1. Go to Bluetooth Devices > Devices
2. There is an option called Bluetooth devices discovery set in default, change that to advanced.
3. Click add device then Bluetooth and the HC06 shoud appear.

After that, the bluetooth device will be avaliable on the webpage.

The app shows plots for both mass and flow. This data is usefull for making tasty espresso!!!
