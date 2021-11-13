import 'regenerator-runtime/runtime';
import './css/index.css';

//dotenv with path fix
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

//OpenWeather API Key
const API_KEY = process.env.API_KEY;

//Default City of Lethbridge
let CITY = "Lethbridge";

//Define HTML Variables
let menuToggleButton = document.querySelector('.menu_container');
let searchForm = document.getElementById('mobileSearch');
let alertBox = document.querySelector('.alert');
let bannerMessage = document.querySelector('.alertInner p');
let closeButton = document.querySelector('.closeBtn')
let toggleSwitch = document.querySelector('.dark input[type="checkbox"]');
let currentTheme = localStorage.getItem('theme');
let title = document.querySelector(".title");
let searchInput = document.querySelector('.searchInput');
let searchFormM = document.getElementById("searchFormM");
let getLocationButton = document.querySelector(".getLocation button");
let getSpinner = document.querySelector(".lds-ring");

//Searchform Event Listener
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  CITY = e.target[0].value; //Set City var
  getWeather(); //Get Weather
  searchInput.value = ''; //Clear Search Input
  searchFormM.classList.toggle("menu_dropdown"); //Close Dropdown
  menuToggleButton.classList.toggle("change");
})

//Dropdownn Button Event Listener
menuToggleButton.addEventListener("click", function(e) {
  menuToggleButton.classList.toggle("change");
})

//Mobile Dropdown Event Listener
menuToggleButton.addEventListener('click', function(event) {
  event.preventDefault();
  searchFormM.classList.toggle("menu_dropdown")
});

//Geolocation Button Event Listener
getLocationButton.addEventListener('click', getLocation);

//Theme Switching Toggle Event Listener
toggleSwitch.addEventListener('change', switchTheme, false);

//Error Message Banner
function alertBanner(alertMessage) {
  alertBox.classList.add("alertOpen");
  bannerMessage.innerText = alertMessage;

  //Close Banner
  setTimeout(function() {
    alertBox.classList.remove("alertOpen");
  }, 5000)
}

//Error Message Close Button
closeButton.addEventListener('click', () => {
  alertBox.classList.remove("alertOpen");
})

//Convert degrees to wind direction
function degToCompass(num) {
  var val = Math.floor((num / 22.5) + 0.5);
  var arr = ["n", "nne", "ne", "ene", "e", "ese", "se", "sse", "s", "ssw", "sw", "wsw", "w", "wnw", "nw", "nnw"];
  return arr[(val % 16)];
}

//Last Update Timestamp. Probably should have used a library
function timestampToDate(timestamp) {
  let date = new Date(timestamp * 1000);
  let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let weekday = weekdays[date.getDay()];
  let months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
  let month = months[date.getMonth()];
  let year = date.getFullYear();
  let time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  let dateTime = {month: month, year: year, weekday: weekday, date: date.getDate(), time: time};

  console.log(dateTime);
  return dateTime;
}

//Dark-Light Theme Switching
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }    
}

//Check for theme preference in Local Storage
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);

  //Check Theme Switch if Dark
  if (currentTheme === 'dark') {
      toggleSwitch.checked = true;
  }
}

//Hide Loading Spinner
getSpinner.style.display = "none";

async function getLocation() {
  console.log("Waiting...");
  getLocationButton.style.display = "none";
  getSpinner.style.display = "inline-block";

  await navigator.geolocation.getCurrentPosition(function (position) {
    getWeather(position.coords);
    getLocationButton.style.display = "inline-block";
    getSpinner.style.display = "none";
  },
  function (error) {
      console.log("The Locator was denied. :(")
      getLocationButton.style.display = "inline-block";
    getSpinner.style.display = "none";
    alertBanner("Location Services are Disabled");
  })
}

async function getWeather(f) {
  let url = "";

  if (f){
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${f.latitude}&lon=${f.longitude}&units=metric&appid=${API_KEY}`
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`;
  }

  let response = await fetch(url);

  if (response.ok) {

    // if HTTP-status is 200-299 get body response
    let json = await response.json();
    title.innerText = json.name;
    let currentDate = timestampToDate(json.dt);

    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`;
    document.querySelector(".titleDate").innerText = `${currentDate.weekday}, ${currentDate.month} ${currentDate.date}`;
    document.getElementById("arrow").style.transform = `rotate(${json.wind.deg-180}deg)`;
    document.getElementById("windSpeed").innerHTML= `<p>Wind ${((json.wind.speed*18)/5).toFixed(2)} km/h</p>`;
    document.getElementById("windGust").innerHTML= `<p>Gusts ${((json.wind.gust*18)/5).toFixed(2)} km/h</p>`;
    document.getElementById("temperature").innerHTML= `<p>${Math.round(json.main.temp)}<sup>&#8451</sup></p>`;
    document.getElementById("windDirection").innerHTML= `<p>${degToCompass(json.wind.deg)}</p>`;
    document.getElementById("weather-desc").innerHTML= `<p>${json.weather[0].description}</p>`;
    document.getElementById("date").innerHTML= `<p>Last Updated: ${currentDate.month} ${currentDate.date} - ${currentDate.year} at ${currentDate.time}</p>`;
    document.getElementById("coords").innerHTML= `<p>Lat: ${json.coord.lat.toFixed(2)} Lng: ${json.coord.lon.toFixed(2)}</p>`;

  } else {
    console.log("HTTP-Error: " + response.status);
    document.querySelector('.title').innerText = "Please Try Again";
    document.getElementById("coords").innerHTML= ``;
    alertBanner("City not found");

  }
}

getWeather();