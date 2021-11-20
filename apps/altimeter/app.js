// Display air pressure and temperature sensor readings

var updateInterval = 1000;
var displayAltitude = true;
var displayTemperature = true;
var displayPressure = true;
var intervalId = 0;
var menuDisplayed = false;

var menu = {
  "" : {
    "title" : "-- Altimeter settings --"
  },
  "Altitude" : {
    value : displayAltitude,
    format : v => v?"On":"Off",
    onchange : v => { displayAltitude = v; }
  },
  "Temperature" : {
    value : displayTemperature,
    format : v => v?"On":"Off",
    onchange : v => { displayTemperature = v; }
  },
  "Pressure" : {
    value : displayPressure,
    format : v => v?"On":"Off",
    onchange : v => { displayPressure = v; }
  },
  "Interval / s" : {
    value : updateInterval / 1000,
    min:1, max:10, step:1,
    onchange : v => { updateInterval=1000 * v; }
  },
  "Exit" : function() { showReadingsDisplay(); },
};

function init() {
  Bangle.setBarometerPower(1, "altimeter");
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  showReadingsDisplay();
}

function drawInfoLines(line_num, quantity, unit, value) {
  g.setFont("12x20").setFontAlign(0, 0);
  g.drawString(quantity + " / " + unit, 88, line_num * 50 + 35);
  g.setFont("Vector:25");
  g.drawString(value.toFixed(1), 88, line_num * 50 + 60);
}

function updateReadingsDisplay() {
  Bangle.getPressure().then(data => {
    g.reset().clearRect(Bangle.appRect);
    var lineNum = 0;
    if (displayAltitude) {
        drawInfoLines(lineNum, "Altitude", "m", data.altitude);
        lineNum = lineNum + 1;
    }
    if (displayTemperature) {
        drawInfoLines(lineNum, "Temperature", "°C", data.temperature);
        lineNum = lineNum + 1;
    }
    if (displayPressure) {
        drawInfoLines(lineNum, "Pressure", "mbar", data.pressure);
        lineNum = lineNum + 1;
    }
  });
}

function showReadingsDisplay() {
  menuDisplayed = false;
  updateReadingsDisplay();
  if (!intervalId) {
      intervalId = setInterval(updateReadingsDisplay, updateInterval);
  }
}

function showMenu() {
  if (!menuDisplayed) {
    clearInterval(intervalId);
    intervalId = 0;
    menuDisplayed = true;
    E.showMenu(menu);
  }
}

init();

Bangle.on("swipe", dir => {
    if (dir != 0) {
        showMenu();
    }
});
