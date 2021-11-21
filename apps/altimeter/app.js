// Display air pressure and temperature sensor readings

const unitConverters = {
  "altitude": {"m": v => v, "ft": v => 3.28 * v},
  "temperature": {"°C": v => v, "°F": v => (v * 1.8) + 32},
  "pressure": {"mbar": v => v, "inHg": v => v * 0.0295}
};
const quantities = Object.keys(unitConverters);

var quantitySettings = {
  "altitude": {"display": true, "unitIndex": 0},
  "temperature": {"display": true, "unitIndex": 0},
  "pressure": {"display": true, "unitIndex": 0}
};

var updateInterval = 1000;
var intervalId = 0;
var menuDisplayed = false;


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function init() {
  Bangle.setBarometerPower(1, "altimeter");
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  showReadings();
}

function drawInfoLines(lineNum, quantity, unit, value) {
  g.setFont("12x20").setFontAlign(0, 0);
  g.drawString(quantity + " / " + unit, 88, lineNum * 50 + 35);
  g.setFont("Vector:25");
  g.drawString(value.toFixed(1), 88, lineNum * 50 + 60);
}

function updateReadings() {
  Bangle.getPressure().then(data => {
    g.reset().clearRect(Bangle.appRect);
    let lineNum = 0;
    for (let quantity of quantities) {
      let settings = quantitySettings[quantity]; 
      if (settings.display) {
        let unit = Object.keys(unitConverters[quantity])[settings.unitIndex];
        drawInfoLines(
          lineNum,
          capitalize(quantity),
          unit, 
          unitConverters[quantity][unit](data[quantity])
        );
        lineNum++;
      }
    }
  });
}

function showReadings() {
  menuDisplayed = false;
  updateReadings();
  if (!intervalId) {
      intervalId = setInterval(updateReadings, updateInterval);
  }
}

const settingsMenu = {
  "": {
    "title" : "-- Altimeter settings --"
  },
  "Altitude": () => { showQuantitySettingsMenu("altitude"); },
  "Temperature": () => { showQuantitySettingsMenu("temperature"); },
  "Pressure": () => { showQuantitySettingsMenu("pressure"); },
  "Interval / s": {
    value: updateInterval / 1000,
    min: 1, 
    max: 10, 
    step: 1,
    onchange : v => { updateInterval = 1000 * v; }
  },
  "Exit": showReadings,
};


function showSettingsMenu() {
  if (!menuDisplayed) {
    clearInterval(intervalId);
    intervalId = 0;
    menuDisplayed = true;
    E.showMenu(settingsMenu);
  }
}

function showQuantitySettingsMenu(quantity) {
  let settings = quantitySettings[quantity];
  let units = Object.keys(unitConverters[quantity]);
  let menu = {
    "": {
      "title" : "-- " + quantity + " --"
    },
    "Display": {
      value: settings.display,
      format: v => v ? "On" : "Off",
      onchange: v => { settings.display = v; }
    },
    "Unit": {
      value: settings.unitIndex,
      min: 0,
      max: 1,
      format: v => units[v],
      onchange: v => { settings.unitIndex = v; }
    },
    "Back": () => { E.showMenu(settingsMenu); }
  };
  E.showMenu(menu);
}


init();

Bangle.on("swipe", dir => {
    if (dir != 0) {
        showSettingsMenu();
    }
});
