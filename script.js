const overPercentage = {
  0: 0.05,
  1: 0.09,
  2: 0.2,
  3: 0.4,
  4: 0.6,
  5: 0.95,
  6: 1.4,
  7: 2.1,
  8: 8.0,
  9: 0.0,
};
const underPercentage = {
  0: 0.0,
  1: 8.0,
  2: 2.1,
  3: 1.4,
  4: 0.95,
  5: 0.6,
  6: 0.4,
  7: 0.2,
  8: 0.09,
  9: 0.05,
};
// Payout percentages for MATCHES and DIFFERS
const matchesPayout = 8; // Adjust this to your desired MATCHES payout
const differsPayout = 0.05; // Adjust this to your desired DIFFERS payout

const socket = io("http://localhost:3000");
var loggedUser = "null";
var bitStatus = "none";
var selectedNumber = 2;
var selectedCategory = "OVER";
var currunt_stake = 100;
var digitHis = [];
var logged = false;
var chDigit = 0;
var longdigit = [
  5, 7, 8, 6, 2, 3, 4, 7, 8, 7, 9, 2, 3, 4, 9, 7, 9, 2, 3, 4, 8, 6, 2, 8, 6, 5,
  6, 4, 8, 6, 3, 2, 5, 3, 4, 8, 3, 1, 3, 3, 5, 8, 7, 2, 6, 4, 7, 1, 2, 6, 7, 8,
  9, 6, 5, 3, 2, 1, 4, 7, 8, 5, 2, 3, 1, 5, 4, 7, 8, 5, 4, 1, 3, 2, 9, 7, 6, 5,
  4, 2, 3, 9, 8, 6, 7, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1,
];
var DigitSC100Tick = [];

var numberImgArray = [
  {
    number: 0,
    img: "/assests/numbers/0.png",
  },
  {
    number: 1,
    img: "/assests/numbers/1.png",
  },
  {
    number: 2,
    img: "/assests/numbers/2.png",
  },
  {
    number: 3,
    img: "/assests/numbers/3.png",
  },
  {
    number: 4,
    img: "/assests/numbers/4.png",
  },
  {
    number: 5,
    img: "/assests/numbers/5.png",
  },
  {
    number: 6,
    img: "/assests/numbers/6.png",
  },
  {
    number: 7,
    img: "/assests/numbers/7.png",
  },
  {
    number: 8,
    img: "/assests/numbers/8.png",
  },
  {
    number: 9,
    img: "/assests/numbers/9.png",
  },
];
var wonnumberImgArrayOld = [
  {
    number: 0,
    img: "/assests/wonnumber/0.png",
  },
  {
    number: 1,
    img: "/assests/wonnumber/1.png",
  },
  {
    number: 2,
    img: "/assests/wonnumber/2.png",
  },
  {
    number: 3,
    img: "/assests/wonnumber/3.png",
  },
  {
    number: 4,
    img: "/assests/wonnumber/4.png",
  },
  {
    number: 5,
    img: "/assests/wonnumber/5.png",
  },
  {
    number: 6,
    img: "/assests/wonnumber/6.png",
  },
  {
    number: 7,
    img: "/assests/wonnumber/7.png",
  },
  {
    number: 8,
    img: "/assests/wonnumber/8.png",
  },
  {
    number: 9,
    img: "/assests/wonnumber/9.png",
  },
];
var wonnumberImgArray = [
  {
    number: 0,
    img: "/assests/number_gifs/0.gif",
  },
  {
    number: 1,
    img: "/assests/number_gifs/1.gif",
  },
  {
    number: 2,
    img: "/assests/number_gifs/2.gif",
  },
  {
    number: 3,
    img: "/assests/number_gifs/3.gif",
  },
  {
    number: 4,
    img: "/assests/number_gifs/4.gif",
  },
  {
    number: 5,
    img: "/assests/number_gifs/5.gif",
  },
  {
    number: 6,
    img: "/assests/number_gifs/6.gif",
  },
  {
    number: 7,
    img: "/assests/number_gifs/7.gif",
  },
  {
    number: 8,
    img: "/assests/number_gifs/8.gif",
  },
  {
    number: 9,
    img: "/assests/number_gifs/9.gif",
  },
];

socket.on("connected", (message) => {});
socket.on("login", (data, result, id) => {
  if (data == "Login successful") {
    let gameDiv = document.getElementById("gameDiv");
    gameDiv.style.display = "flex";
    document.getElementById("loginDiv").style.display = "none";
    loggedUser = result[0];
    saveLogin(result[0]);
    let balance = document.getElementById("balance");
    let currBal = loggedUser.balance.toFixed(2);
    balance.innerHTML = currBal;
    if (logged == false) {
      notification("Login successful <br> Welcome " + loggedUser.user_name);
      logged = true;
    }
  }
  if (data == "Login failed") {
    errorShow();
    async function errorShow() {
      //basic creatation
      let loginError = document.getElementById("loginError");
      loginError.style.display = "flex";
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Remove the div from the body
      loginError.style.display = "none";
    }
  }
});
const pBidBtntext = document.getElementById("stratBtnText");
socket.on("current state", (i, data) => {
  let StBnner = document.getElementById("status-bar");
  st = data;

  if (st == "bs") {
    if (i <= 10) {
      StBnner.classList.add("statusBarnormal");
      if (loggedUser != "null") {
        tick.play();
      }
    } else {
      StBnner.classList.remove("statusBarnormal");
    }

    StBnner.innerHTML = "Waiting For Bids : " + i;
  } else if (st == "ss") {
    bitStatus = "none";
    StBnner.innerHTML = "Waiting For Result : " + i;
    if (i == 3) {
      StBnner.classList.add("statusBarnormal");
    }
    if (i == 0) {
      pBidBtntext.innerHTML = "START";
      pBidBtntext.style.pointerEvents = "all";
      wonlossShow();
    }
  }
});
async function wonlossShow() {
  if (loggedUser != "null") {
    intro.play();
  }
  const userenterdata = document.getElementById("userenterdata");
  userenterdata.style.display = "none";
  const results_container = document.getElementById("results_container");
  results_container.style.display = "flex";
  const wonNumberShow = document.getElementById("wonNumberShow");
  wonNumberShow.innerHTML = `
       <img src="${wonnumberImgArray[chDigit].img}" alt="" class="full-screen-img">
    `;

  await new Promise((resolve) => setTimeout(resolve, 5000));
  results_container.style.display = "none";
}

socket.on("won loss", (msg, amount) => {
  const userenterdata = document.getElementById("userenterdata");
  userenterdata.style.display = "flex";
  userenterdata.innerHTML = `
                <div>EXPECTED PROFIT : ${amount.toFixed(2)}</div>
                <div>RESULT : ${msg}</div>
    `;
});
socket.on("guserdata", (array) => {
  const currunt_trade_container = document.getElementById(
    "currunt-trade-container"
  );
  currunt_trade_container.innerHTML = "";
  for (let i = 0; i < array.length; i++) {
    const user = array[i];
    let subDiv = document.createElement("div");
    subDiv.innerHTML = `
            <div>${user.name + " :"}</div>
            <div>${user.bet.toFixed(2)}</div></div>
        `;
    if (user.name == loggedUser.user_name) {
      subDiv.classList.add("trade-item-my");
    } else {
      subDiv.classList.add("trade-item");
    }
    currunt_trade_container.appendChild(subDiv);
  }
});
socket.on("update user data", (data, array) => {
  if (data == "update") {
    socket.emit("user data update", socket.id, loggedUser.user_id);
  }
  if (data == "updated") {
    loggedUser = array;

    show_updated_user_data(loggedUser);
    function show_updated_user_data(array) {
      let balance = document.getElementById("balance");
      let currBal = array.balance.toFixed(2);
      balance.innerHTML = currBal;
    }
  }
});
socket.on("bid", (msg) => {
  if (msg == "bid places succsesfully") {
    bitStatus = "bid placed";
    start.play();
    notification("Bid places succsesfully");
  }
});
socket.on("choosen digit", (digit) => {
  chDigit = digit;
  digitHis.push(digit);
  if (digitHis.length > 6) {
    digitHis.shift();
  }
  const his_numbers_container = document.getElementById(
    "his-numbers-container"
  );
  his_numbers_container.innerHTML = "";
  for (let i = 0; i < digitHis.length; i++) {
    const digit = digitHis[i];
    let subDiv = document.createElement("div");
    subDiv.innerHTML = `
            <div>${digit}</div>
        `;
    his_numbers_container.appendChild(subDiv);
  }
});
socket.on("long digit array", (longarray) => {
  longdigit = longarray;
});

/**/
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", () => {
  const username = document.getElementById("usernameInput").value; // Get the value of the username input
  const password = document.getElementById("passwordInput").value; // Get the value of the password input
  socket.emit("login", username, password, socket.id); // Emit the login event with the user credentials
});
/*catbtn click*/
const catbtns = document.querySelectorAll(".catbtns");
catbtns.forEach((catbtn) => {
  catbtn.addEventListener("click", () => {
    click.play();
    selectedCategory = catbtn.innerHTML;
    const cat = catbtn.innerHTML;
    for (let i = 0; i < catbtns.length; i++) {
      const element = catbtns[i];
      element.classList.remove("catbtns_selected");
    }
    catbtn.classList.add("catbtns_selected");
    digitConfig();
  });
});

/*start button click*/
const startBtn = document.getElementById("stratBtnText");
startBtn.addEventListener("click", () => {
  /*check user balance before placing bid*/
  if (loggedUser.balance >= currunt_stake && bitStatus == "none") {
    //bitStatus = "bid placed";
    startBtn.innerHTML = "WAIT";
    startBtn.style.pointerEvents = "none";
    startBtn.style.display = "flex";
    let currBal = (loggedUser.balance - currunt_stake).toFixed(2);
    let balance = document.getElementById("balance");
    balance.innerHTML = currBal;
    socket.emit(
      "bid",
      selectedNumber,
      selectedCategory,
      currunt_stake,
      loggedUser.Serial,
      loggedUser.user_name,
      loggedUser.balance,
      loggedUser.bet_history,
      loggedUser.profit_loss_history,
      socket.id
    );
  }
});

/*histry btn click */
const btnConfig = document.querySelectorAll(".btnConfig");
btnConfig.forEach((btnConfig) => {
  btnConfig.addEventListener("click", () => {
    click.play();
    if (btnConfig.attributes.name.value == "history") {
      const tradeHisContainer = document.getElementById("tradeHisContainer");
      tradeHisContainer.style.height = "82vh";
      tradeHisContainer.style.display = "flex";
      tradeHisContainer.innerHTML = `
            <div id="title">Betting Log History <div class="close">X</div></div>
            <div id="tradeHisScroll">
                <div id="tradeHisData">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Bet</th>
                                <th>Status</th>
                                <th>P/L</th>
                                <th>E:Profit</th>
                            </tr>
                        </thead>
                        <tbody id="hisTable">
                        </tbody>
                    </table>
                </div>
            </div>
            `;
      var convertedPLH = JSON.parse(loggedUser.profit_loss_history);

      const hisTable = document.getElementById("hisTable");
      hisTable.innerHTML = "";
      const title = document.getElementById("title");
      title.innerHTML =
        'Betting Log History <div class="close" onclick="closehis()" >X</div>';

      if (convertedPLH.length === 0) {
        hisTable.innerHTML = `<tr><td colspan="5">No betting history found.</td></tr>`;
        return;
      }

      let rows = "";
      for (let i = 0; i < convertedPLH.length; i++) {
        const element = convertedPLH[i];
        rows += `
                    <tr>
                        <td class="date">${element.date}</td>
                        <td>${element.betAmount}</td>
                        <td>${element.plStatus}</td>
                        <td>${element.plAmount}</td>
                        <td>${element.epProfit}</td>
                    </tr>`;
      }
      hisTable.innerHTML = rows;
    }
    if (btnConfig.attributes.name.value == "wallet") {
      // Add functionality for the "wallet" section here
    }
    if (btnConfig.attributes.name.value == "chart") {
      const tradeHisContainer = document.getElementById("tradeHisContainer");
      tradeHisContainer.style.display = "flex";
      let subdiv = document.createElement("div");
      tradeHisContainer.innerHTML = `<div id="title">Won Digit History <div class="close" onclick="closehis()" >X</div></div>`;
      subdiv.id = "digitstatusContainerin";
      tradeHisContainer.appendChild(subdiv);
      charConfig();
      digitStatusChartUpdate();
    }
  });
});

/*digit click*/
const digits = document.querySelectorAll(".digit");
digits[2].classList.add("digit_selected");
/*set default calsses to digits*/
for (let i = 0; i < digits.length; i++) {
  const element = digits[i];
  if (i >= 3) {
    element.classList.add("digit_won_range");
  }
  if (i <= 1) {
    element.classList.add("digit_loss_range");
  }
}
digits.forEach((digit) => {
  digit.addEventListener("click", () => {
    numselect.play();
    selectedNumber = digit.innerHTML;
    digitConfig();
  });
});
/*module functions*/
function digitConfig() {
  for (let j = 0; j < digits.length; j++) {
    const element = digits[j];
    element.classList.remove("digit_loss_range");
    element.classList.remove("digit_won_range");
    element.classList.remove("digit_selected");

    if (selectedNumber == element.innerHTML) {
      element.classList.add("digit_selected");
    }
    if (selectedCategory == "OVER") {
      if (j > selectedNumber) {
        element.classList.add("digit_won_range");
      }
      if (j < selectedNumber) {
        element.classList.add("digit_loss_range");
      }
    } else if (selectedCategory == "UNDER") {
      if (j < selectedNumber) {
        element.classList.add("digit_won_range");
      }
      if (j > selectedNumber) {
        element.classList.add("digit_loss_range");
      }
    } else if (selectedCategory == "MATCHES") {
      if (j != selectedNumber) {
        element.classList.add("digit_loss_range");
      }
    } else if (selectedCategory == "DIFFERS") {
      if (j != selectedNumber) {
        element.classList.add("digit_won_range");
      }
    }
    if (selectedCategory == "OVER" && selectedNumber == 9) {
      selectedNumber = 8;
      digits[8].classList.add("digit_selected");
    }
    if (selectedCategory == "UNDER" && selectedNumber == 0) {
      selectedNumber = 1;
      digits[1].classList.add("digit_selected");
      digits[0].classList.remove("digit_selected");
      digits[0].classList.add("digit_won_range");
    }
  }

  showReturn();
}
function saveLogin(result) {
  let db_login = JSON.parse(result.last_login);
  let array = db_login;
  array.push(getCurrentDateTime());
  let stringifyArray = JSON.stringify(array);
  socket.emit(
    "login Update",
    stringifyArray,
    loggedUser.user_id,
    loggedUser.user_name,
    socket.id
  );
}
function getCurrentDateTime() {
  var now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/*show return amounts according to category*/
function showReturn() {
  const return_show = document.getElementById("return_show");
  let returnAmount = 0;
  if (selectedCategory == "OVER") {
    returnAmount =
      currunt_stake + currunt_stake * overPercentage[selectedNumber];
  } else if (selectedCategory == "UNDER") {
    returnAmount =
      currunt_stake + currunt_stake * underPercentage[selectedNumber];
  } else if (selectedCategory == "MATCHES") {
    returnAmount = currunt_stake + currunt_stake * matchesPayout;
  } else if (selectedCategory == "DIFFERS") {
    returnAmount = currunt_stake + currunt_stake * differsPayout;
  }
  return_show.innerHTML = returnAmount;
}

/*notification*/
async function notification(text) {
  const notification = document.getElementById("notification");

  // Set the notification text
  notification.innerHTML = text;

  // Add the 'show' class to trigger the fade-in animation
  notification.classList.add("show");
  notification.style.display = "flex";

  // Wait for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Add the 'hide' class to trigger the fade-out animation
  notification.classList.remove("show");
  notification.classList.add("hide");

  // Wait for the fade-out animation to complete (0.5s duration)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Hide the notification after the animation
  notification.style.display = "none";
  notification.classList.remove("hide"); // Reset for next use
}
/*data his close*/
function closehis() {
  const tradeHisContainer = document.getElementById("tradeHisContainer");
  tradeHisContainer.style.display = "none";
}

/*stake config*/
const bidAmountInput = document.getElementById("bidAmountInput");
bidAmountInput.addEventListener("input", () => {
  currunt_stake = parseFloat(bidAmountInput.value);
  showReturn();
});

function charConfig() {
  digitStatusChart = new CanvasJS.Chart("digitstatusContainerin", {
    animationEnabled: true,
    animationDuration: 2000,
    theme: "dark2",
    backgroundColor: "#202529",
    axisX: {
      valueFormatString: "0",
      margin: -10,
      tickColor: "#ffbb00",
    },
    axisY: {
      gridColor: "#202529",
      margin: -15,
    },
    toolTip: {
      shared: true,
    },
    data: [
      {
        type: "column",
        name: "100Tick",
        showInLegend: true,
        yValueFormatString: "#.#%",
        dataPoints: DigitSC100Tick,
      },
    ],
  });
  digitStatusChart.render();
}

function digitStatusChartUpdate() {
  DigitSC100Tick = [];
  const raw100 = calculateDigitPercentage(longdigit, 100); // Using the last 100 digits

  for (let i = 0; i < raw100.length; i++) {
    const value = raw100[i];
    if (value === Math.max(...raw100)) {
      DigitSC100Tick.push({
        x: i,
        y: value,
        color: "green",
        indexLabel: value.toFixed(0) + "%",
      });
    } else if (value === Math.min(...raw100)) {
      DigitSC100Tick.push({
        x: i,
        y: value,
        color: "#ff5005",
        indexLabel: value.toFixed(0) + "%",
      });
    } else {
      DigitSC100Tick.push({
        x: i,
        y: value,
        color: "#161a1d",
        indexLabel: value.toFixed(0) + "%",
      });
    }
  }

  digitStatusChart.options.data[0].dataPoints = DigitSC100Tick;
  digitStatusChart.render();
}

function calculatePercentages(array) {
  // Initialize counters for each digit (0-9) with B, R, and N
  const counters = {
    B: Array(10).fill(0),
    R: Array(10).fill(0),
    N: Array(10).fill(0),
  };

  // Loop through each element in the array
  array.forEach((item) => {
    const letter = item.charAt(0); // Extracting B, R, or N
    const digit = parseInt(item.charAt(1)); // Extracting the digit

    if (!isNaN(digit)) {
      // Increment the counter for the corresponding letter and digit
      counters[letter][digit]++;
    }
  });

  // Calculate total count of each letter
  const totalCounts = {
    B: array.filter((item) => item.charAt(0) === "B").length,
    R: array.filter((item) => item.charAt(0) === "R").length,
    N: array.filter((item) => item.charAt(0) === "N").length,
  };

  // Calculate percentages
  const percentages = {
    B: counters["B"].map((count) => (count / totalCounts["B"]) * 100),
    R: counters["R"].map((count) => (count / totalCounts["R"]) * 100),
    N: counters["N"].map((count) => (count / totalCounts["N"]) * 100),
  };

  return percentages;
}

function calculateDigitPercentage(digitIntList, length) {
  // Get the last N points
  const lastNDigits = digitIntList.slice(-length);

  // Initialize an array to store the count of each digit
  const digitCounts = Array(10).fill(0);

  // Count the occurrences of each digit
  lastNDigits.forEach((digit) => {
    digitCounts[digit]++;
  });

  // Calculate the total count of digits
  const totalCount = lastNDigits.length;

  // Calculate the percentage of each digit
  const percentages = digitCounts.map((count) => (count / totalCount) * 100);

  return percentages;
}

let balls = [];
let animationInterval;

function createBalls() {
  const lotteryContainer = document.getElementById("lotteryContainer");
  lotteryContainer.innerHTML = ""; // Clear previous balls

  balls = []; // Reset balls array

  // Get the dimensions of the lottery container
  const containerWidth = lotteryContainer.offsetWidth;
  const containerHeight = lotteryContainer.offsetHeight;

  // Define the area around the center (focus area) to spawn the balls
  const focusAreaWidth = containerWidth / 1;
  const focusAreaHeight = containerHeight / 1;

  for (let i = 0; i < 10; i++) {
    const ball = document.createElement("div");
    ball.classList.add("balls", "showball");
    let choosenImg = numberImgArray[i];
    ball.innerHTML = `<img src="${choosenImg.img}" alt="" class="full-screen-numberimg">`;

    // Randomly position balls in a focus area around the center
    // Ensure balls are placed inside the div
    const randomX = Math.random() * (focusAreaWidth - 30) + containerWidth / 1; // Prevent going off the container
    const randomY =
      Math.random() * (focusAreaHeight - 30) + containerHeight / 1; // Prevent going off the container
    ball.style.left = `${randomX}px`;
    ball.style.top = `${randomY}px`;

    lotteryContainer.appendChild(ball);
    balls.push(ball);
  }
}

function animateBalls() {
  balls.forEach((ball) => {
    // Apply random movement to each ball
    const randomXSpeed = (Math.random() - 10) * 50; // Random speed for X axis
    const randomYSpeed = (Math.random() - 10) * 50; // Random speed for Y axis

    // Animation loop
    ball.style.animation = `ballAnimation ${
      Math.random() * 8 + 1
    }s linear infinite`;

    ball.style.setProperty("--randomX", `${randomXSpeed}px`);
    ball.style.setProperty("--randomY", `${randomYSpeed}px`);
  });
}

// Example of function calls to test the flow
createBalls();
animateBalls();

const results_close = document.getElementById("results_close");
results_close.addEventListener("click", () => {
  const results_container = document.getElementById("results_container");
  results_container.style.display = "none";
});

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  window.location.href = "index.html";
  loggedUser = null;
});

/*sound configuration*/
const click = new Howl({
  src: ["/assests/sound/buttonSounds/mouse-click-sound-233951.mp3"], // Replace with your sound file's URL
  autoplay: false,
  loop: false,
  volume: 1.0,
});

const numselect = new Howl({
  src: ["/assests/sound/buttonSounds/menu-selection-102220.mp3"], // Replace with your sound file's URL
  autoplay: false,
  loop: false,
  volume: 1.0,
});

const start = new Howl({
  src: ["/assests/sound/buttonSounds/menuselect4-36147.mp3"], // Replace with your sound file's URL
  autoplay: false,
  loop: false,
  volume: 1.0,
});

const tick = new Howl({
  src: ["/assests/sound/buttonSounds/beepd-86247.mp3"], // Replace with your sound file's URL
  autoplay: false,
  loop: false,
  volume: 1.0,
});

const intro = new Howl({
  src: ["/assests/sound/buttonSounds/intro-sound-180639.mp3"], // Replace with your sound file's URL
  autoplay: false,
  loop: false,
  volume: 1.0,
});
