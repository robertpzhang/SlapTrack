import logo from './logo_slapTrack.png';
import './App.css';
import gif_logo from './Abduction.gif'

var bluetoothDevice;
var batteryLevelCharacteristic;
var value_array = [];
var time_array = [];
var ROM = 0;
// const fs = require('fs');
// var file_path = '../data/result.json'

function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
  connectDeviceAndCacheCharacteristics()
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

function requestDevice() {
  console.log('Requesting any Bluetooth Device...');
  return navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service']})
  .then(device => {
    bluetoothDevice = device;
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
  });
}

function connectDeviceAndCacheCharacteristics() {
  if (bluetoothDevice.gatt.connected && batteryLevelCharacteristic) {
    return Promise.resolve();
  }
  // console.log('Connecting to GATT Server...');
  return bluetoothDevice.gatt.connect()
  .then(server => {
    // console.log('Getting Battery Service...');
    return server.getPrimaryService('battery_service');
  })
  .then(service => {
    // console.log('Getting Battery Level Characteristic...');
    return service.getCharacteristic('battery_level');
  }).then(characteristic => {
    // characteristic.addEventListener('characteristicvaluechanged',
    //                               handleBatteryLevelChanged);
    return characteristic.readValue();
  })
  .then(value => {
    value_array.push(value.getUint8(0));
    time_array.push(Date.now());
    console.log(`Roll Value: ${value.getUint8(0)}`);
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function shoulder_measure(){
  time_array = [];
  value_array = [];
  ROM = 0;
  var startTime = Date.now();
  while ((Date.now() - startTime) < 8000) {  // run this loop for 8 seconds
    await connectDeviceAndCacheCharacteristics();
    await sleep(30);  // delay 0.03 seconds
  }
  var adjusted_time = time_array.map(function(num) {
      return num - startTime;
  });
  console.log(value_array);
  console.log(adjusted_time);
  var median = require('filters').median;
  var processed_array = median(value_array, 5);
  ROM = Math.max(...processed_array) - Math.min(...processed_array);
  // update ROM
  console.log(ROM);
  document.getElementById('para').innerHTML = "Shoulder Abduction ROM: " + ROM + " degrees.";
  return ROM;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <button onClick = {requestDevice } className="btn">Connect Device</button>

        <div className="wrapper">
          <button onClick = {shoulder_measure } className="btn">Shoulder Abduction</button>
              <div className="divider"/>
          <button onClick = {connectDeviceAndCacheCharacteristics } className="btn">Shoulder Extension</button>
        </div>
        <img src={gif_logo} className="GIF" alt="logo"/>
        <h4 id="para" className="ROMDATA">ROM: {ROM} degrees.</h4>

        <a
          className="App-link"
          href="https://docs.google.com/presentation/d/18V2qHaqix8ZzVZGRTTbWefeuGQ7xGQZivM-YHZGvRYA/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about SlapTrack
        </a>
      </header>
    </div>
  );
}

export default App;
