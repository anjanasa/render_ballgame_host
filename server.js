require("dotenv").config();
const io = require("socket.io")(process.env.APP_PORT, {
  cors: {
    origin: process.env.CORS_ORIGINE,
  },
});
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

const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS if you're making requests from a different origin

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.MYSQL_DB, // Adjust according to your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});
var bid_array = [];
var sockId = 0;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  sockId = socket.id;
  console.log(sockId);
  io.to(socket.id).emit("connected", sockId);
  socket.on("login", (username, password, id) => {
    console.log("user login ", username, password, id);
    userLogin(username, password, socket.id);
  });

  /*get bid request and check user balance then approve trade*/
  socket.on(
    "bid",
    (
      sellDigit,
      SellCategory,
      defaultStake,
      Serial,
      user_name,
      balance,
      bet_history,
      profit_loss_history,
      socketId
    ) => {
      /*check user balance before placing bid*/

      db.query(
        "SELECT * FROM lottery_game_users WHERE user_name = ? AND Serial = ?",
        [user_name, Serial],
        (err, result) => {
          if (err) {
            console.error("Error logging in:", err);
            return;
          }
          if (result.length > 0) {
            console.log("balance fetch succsesfull");
            let socketId = socket.id;
            bid_array.push({
              sellDigit,
              SellCategory,
              defaultStake,
              Serial,
              user_name,
              balance,
              bet_history,
              profit_loss_history,
              socketId,
            });
            io.to(socket.id).emit("bid", "bid places succsesfully");
            userBetiingHistory.push({ name: user_name, bet: defaultStake });
            if (userBetiingHistory.length > 0) {
              userBetiingHistory.shift();
            }
            io.emit("guserdata", userBetiingHistory);
            console.log("bid places succsesfully");
            console.log({
              sellDigit,
              SellCategory,
              defaultStake,
              Serial,
              user_name,
              balance,
              socketId,
            });
            io.to(socketId).emit("login", "Login successful", result);
          } else {
            console.log("Login failed");
            io.to(socketId).emit("login", "Login failed");
          }
        }
      );
    }
  );
});
function userLogin(user_name, password, socketId) {
  db.query(
    "SELECT * FROM lottery_game_users WHERE user_name = ? AND password = ?",
    [user_name, password],
    (err, result) => {
      if (err) {
        console.error("Error logging in:", err);
        return;
      }
      if (result.length > 0) {
        console.log("Login successful");
        io.to(socketId).emit("login", "Login successful", result);
      } else {
        console.log("Login failed");
        io.to(socketId).emit("login", "Login failed");
      }
    }
  );
}

async function startCountdownLoop() {
  const firstStageDuration = 20; // Duration for the first countdown stage in seconds
  const secondStageDuration = 3; // Duration for the second countdown stage in seconds

  while (true) {
    // Infinite loop
    // First countdown stage from firstStageDuration to 0
    for (let i = firstStageDuration; i >= 0; i--) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000); // Wait 1 second between updates
      });
      io.emit("current state", i, "bs");
      if (i === 0) {
        //console.log('selecting start');
        bidCal(bid_array);
      }
    }

    // Immediately start post-countdown updates after the first countdown ends
    for (let i = secondStageDuration; i >= 0; i--) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000); // Wait 1 second between updates
      });

      io.emit("current state", i, "ss");
      if (i === 0) {
        //console.log('bidding start');
        profit_loss_cal(bid_array);
        bid_array = [];
        digitarray.push(choosenDigit);
        longDigitArray.push(choosenDigit);
        if (digitarray.length > 10) {
          digitarray.shift();
        }
        if (longDigitArray.length > 100) {
          longDigitArray.shift();
        }
        io.emit("digit array", digitarray);
        io.emit("long digit array", longDigitArray);
      }
    }
  }
}
startCountdownLoop();

var choosenDigit = 0;
var digitarray = [];
var longDigitArray = [
  5, 7, 8, 6, 2, 3, 4, 7, 8, 7, 9, 2, 3, 4, 9, 7, 9, 2, 3, 4, 8, 6, 2, 8, 6, 5,
  6, 4, 8, 6, 3, 2, 5, 3, 4, 8, 3, 1, 3, 3, 5, 8, 7, 2, 6, 4, 7, 1, 2, 6, 7, 8,
  9, 6, 5, 3, 2, 1, 4, 7, 8, 5, 2, 3, 1, 5, 4, 7, 8, 5, 4, 1, 3, 2, 9, 7, 6, 5,
  4, 2, 3, 9, 8, 6, 7, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1,
];

/*function bidCal(array) {
    console.log("bid cal");
    if (array.length == 0) {
    console.log('no bid');
    function getRandomNumber() {
    return Math.floor(Math.random() * 10); // Generates a number between 0 and 9
    }
    choosenDigit = getRandomNumber();
    //io.emit("choosen digit", choosenDigit);
    console.log("digit cheesen by random");
    }else{
    function calculateNextWinningDigit(bids) {

    let minPayoutDigit = null;
    let minTotalPayout = Infinity;
    let payoutLog = {}; // To store payouts for each digit

    // Analyze each digit (0-9) as a potential outcome
    for (let potentialDigit = 0; potentialDigit <= 9; potentialDigit++) {
    let totalPayout = 0;

    // Initialize the log for this digit
    payoutLog[potentialDigit] = { OVER: 0, UNDER: 0, MATCHES: 0, DIFFERS: 0, totalPayout: 0 };

    // Calculate payouts based on each bid and add them to totalPayout
    bids.forEach(bid => {
    const { sellDigit, SellCategory, defaultStake } = bid;
    const stake = parseFloat(defaultStake);

    switch (SellCategory) {
    case "OVER":
    if (potentialDigit > sellDigit) {
    const payout = overPercentage[sellDigit] * stake;
    totalPayout += payout;
    payoutLog[potentialDigit].OVER += payout;
    }
    break;

    case "UNDER":
    if (potentialDigit < sellDigit) {
    const payout = underPercentage[sellDigit] * stake;
    totalPayout += payout;
    payoutLog[potentialDigit].UNDER += payout;
    }
    break;

    case "MATCHES":
    if (potentialDigit === sellDigit) {
    const payout = matchesPayout * stake;
    totalPayout += payout;
    payoutLog[potentialDigit].MATCHES += payout;
    }
    break;

    case "DIFFERS":
    if (potentialDigit !== sellDigit) {
    const payout = differsPayout * stake;
    totalPayout += payout;
    payoutLog[potentialDigit].DIFFERS += payout;
    }
    break;
    }
    });

    // Store total payout for the potential digit
    payoutLog[potentialDigit].totalPayout = totalPayout;

    // Check if this digit is more profitable for the platform
    if (totalPayout < minTotalPayout) {
    minTotalPayout = totalPayout;
    minPayoutDigit = potentialDigit;
    }
    }

    // Log each digit's payout structure for debugging
    //console.log("Payout Analysis:", JSON.stringify(payoutLog, null, 2));

    // Return the most profitable digit
    return minPayoutDigit;
    }
    const nextWinningDigit = calculateNextWinningDigit(array);
    console.log("Next winning digit:", nextWinningDigit);
    choosenDigit = nextWinningDigit;

    }
    io.emit("choosen digit", choosenDigit);
    console.log("digit cheesen by algo : ", choosenDigit);
  }*/

/*bodcal random best and working*/
/*function bidCal(array) {
    console.log("Bid Calculation Initiated");
    
    if (array.length === 0) {
      console.log("No bids available, selecting a random digit.");
      
      function getRandomNumber() {
        return Math.floor(Math.random() * 10); // Generates a number between 0 and 9
      }
      
      choosenDigit = getRandomNumber();
      console.log("Digit chosen by random:", choosenDigit);
      
    } else {
        console.log("bids available, selecting a algo digit.");
      function calculateNextWinningDigit(bids) {
        let minTotalPayout = Infinity;
        let minPayoutDigits = []; // Store digits with the same minimum payout
        let payoutLog = {}; // To store payouts for each digit
  
        // Analyze each digit (0-9) as a potential outcome
        for (let potentialDigit = 0; potentialDigit <= 9; potentialDigit++) {
          let totalPayout = 0;
  
          // Initialize the log for this digit
          payoutLog[potentialDigit] = { OVER: 0, UNDER: 0, MATCHES: 0, DIFFERS: 0, totalPayout: 0 };
  
          // Calculate payouts based on each bid and add them to totalPayout
          bids.forEach(bid => {
            const { sellDigit, SellCategory, defaultStake } = bid;
            const stake = parseFloat(defaultStake);
  
            switch (SellCategory) {
              case "OVER":
                if (potentialDigit > sellDigit) {
                  const payout = overPercentage[sellDigit] * stake;
                  totalPayout += payout;
                  payoutLog[potentialDigit].OVER += payout;
                }
                break;
  
              case "UNDER":
                if (potentialDigit < sellDigit) {
                  const payout = underPercentage[sellDigit] * stake;
                  totalPayout += payout;
                  payoutLog[potentialDigit].UNDER += payout;
                }
                break;
  
              case "MATCHES":
                if (potentialDigit === sellDigit) {
                  const payout = matchesPayout * stake;
                  totalPayout += payout;
                  payoutLog[potentialDigit].MATCHES += payout;
                }
                break;
  
              case "DIFFERS":
                if (potentialDigit !== sellDigit) {
                  const payout = differsPayout * stake;
                  totalPayout += payout;
                  payoutLog[potentialDigit].DIFFERS += payout;
                }
                break;
            }
          });
  
          // Store total payout for the potential digit
          payoutLog[potentialDigit].totalPayout = totalPayout;
  
          // Update the minimum payout and track all equally profitable digits
          if (totalPayout < minTotalPayout) {
            minTotalPayout = totalPayout;
            minPayoutDigits = [potentialDigit];
          } else if (totalPayout === minTotalPayout) {
            minPayoutDigits.push(potentialDigit);
          }
        }
  
        // Log each digit's payout structure for debugging
        console.log("Payout Analysis:", JSON.stringify(payoutLog, null, 2));
  
        // Randomly select one digit among the most profitable ones
        const randomIndex = Math.floor(Math.random() * minPayoutDigits.length);
        return minPayoutDigits[randomIndex];
      }
  
      const nextWinningDigit = calculateNextWinningDigit(array);
      console.log("Next winning digit selected:", nextWinningDigit);
      choosenDigit = nextWinningDigit;
    }
  
    // Broadcast the chosen digit
    io.emit("choosen digit", choosenDigit);
    console.log("Digit chosen and broadcasted:", choosenDigit);
  }*/

/*v2 with profit payout track*/
let sessionMetrics = {
  totalBets: 0,
  totalPayouts: 0,
  profit: 0,
};

let allTimeMetrics = {
  totalBets: 0,
  totalPayouts: 0,
  profit: 0,
};

// Function to calculate bids and update metrics
function bidCal(array) {
  console.log("Bid Calculation Initiated");
  let totalSessionPayout = 0; // Initialize total payout for the session

  if (array.length === 0) {
    console.log("No bids available, selecting a random digit.");

    function getRandomNumber() {
      return Math.floor(Math.random() * 10); // Generates a number between 0 and 9
    }

    choosenDigit = getRandomNumber();
    console.log("Digit chosen by random:", choosenDigit);
  } else {
    console.log("Bids available, selecting a digit using the algorithm.");

    function calculateNextWinningDigit(bids) {
      let minTotalPayout = Infinity;
      let minPayoutDigits = []; // Store digits with the same minimum payout
      let payoutLog = {}; // To store payouts for each digit

      // Analyze each digit (0-9) as a potential outcome
      for (let potentialDigit = 0; potentialDigit <= 9; potentialDigit++) {
        let totalPayout = 0;

        // Calculate payouts based on each bid
        bids.forEach((bid) => {
          const { sellDigit, SellCategory, defaultStake } = bid;
          const stake = parseFloat(defaultStake);

          switch (SellCategory) {
            case "OVER":
              if (potentialDigit > sellDigit) {
                const payout = overPercentage[sellDigit] * stake;
                totalPayout += payout;
              }
              break;

            case "UNDER":
              if (potentialDigit < sellDigit) {
                const payout = underPercentage[sellDigit] * stake;
                totalPayout += payout;
              }
              break;

            case "MATCHES":
              if (potentialDigit === sellDigit) {
                const payout = matchesPayout * stake;
                totalPayout += payout;
              }
              break;

            case "DIFFERS":
              if (potentialDigit !== sellDigit) {
                const payout = differsPayout * stake;
                totalPayout += payout;
              }
              break;
          }
        });

        // Store payouts and find the digit(s) with the minimum payout
        if (totalPayout < minTotalPayout) {
          minTotalPayout = totalPayout;
          minPayoutDigits = [potentialDigit];
        } else if (totalPayout === minTotalPayout) {
          minPayoutDigits.push(potentialDigit);
        }
      }

      // Randomly select a digit among the most profitable ones
      const randomIndex = Math.floor(Math.random() * minPayoutDigits.length);
      return { selectedDigit: minPayoutDigits[randomIndex], minTotalPayout };
    }

    const { selectedDigit, minTotalPayout } = calculateNextWinningDigit(array);
    console.log("Next winning digit selected:", selectedDigit);
    choosenDigit = selectedDigit;

    // Update session payout
    totalSessionPayout = minTotalPayout;
    array.forEach((bid) => {
      const { defaultStake } = bid;
      sessionMetrics.totalBets += parseFloat(defaultStake); // Add stakes to total bets
    });

    sessionMetrics.totalPayouts += totalSessionPayout;
  }

  // Update session profit
  sessionMetrics.profit =
    sessionMetrics.totalBets - sessionMetrics.totalPayouts;

  // Update all-time metrics
  allTimeMetrics.totalBets += sessionMetrics.totalBets;
  allTimeMetrics.totalPayouts += sessionMetrics.totalPayouts;
  allTimeMetrics.profit =
    allTimeMetrics.totalBets - allTimeMetrics.totalPayouts;

  // Broadcast the chosen digit and metrics
  io.emit("choosen digit", choosenDigit);
  io.emit("session metrics", sessionMetrics);
  io.emit("all time metrics", allTimeMetrics);

  console.log("Digit chosen and broadcasted:", choosenDigit);
  console.log("Session Metrics:", sessionMetrics);
  console.log("All-Time Metrics:", allTimeMetrics);
}

function profit_loss_cal(array) {
  //console.log("profit_loss_cal", array[0].sockId);

  if (array.length != 0) {
    //console.log("profit_loss_cal", array[0]);
    //filler copy trades
    let dataaray = array;
    const lastObjectsBySerial = dataaray.reduce((acc, curr) => {
      // Check if the Serial already exists in the accumulator
      acc[curr.Serial] = curr; // Set the current object as the last for this Serial
      return acc;
    }, {});
    const result = Object.values(lastObjectsBySerial);

    //console.log("choosenDigit", choosenDigit);
    let data = [];
    for (let i = 0; i < result.length; i++) {
      const bid = result[i];
      //console.log("bid", bid);
      data.push({
        Serial: bid.Serial,
        SellCategory: bid.SellCategory,
        sellDigit: bid.sellDigit,
        defaultStake: bid.defaultStake,
        PL: "loss",
        curruntTimeDate: getCurrentDateTime(),
        payout: 0,
        user_name: bid.user_name,
        preBalance: bid.balance,
        afterBalance: 0,
        sockId: bid.socketId,
        bet_history: bid.bet_history,
        profit_loss_history: bid.profit_loss_history,
        epProfit: 0,
      });
      if (bid.SellCategory == "OVER") {
        if (bid.sellDigit < choosenDigit - 1) {
          // if won
          data[i].PL = "won";
          let overPercentageval = bid.sellDigit;
          let profit = bid.defaultStake * overPercentage[overPercentageval];
          data[i].payout = profit;
          data[i].afterBalance = bid.balance + profit;
        } else {
          // if loss
          data[i].PL = "loss";
          data[i].afterBalance = bid.balance - bid.defaultStake;
        }
        //epProfit
        let overPercentageval = bid.sellDigit;
        data[i].epProfit = bid.defaultStake * overPercentage[overPercentageval];
      }
      if (bid.SellCategory == "UNDER") {
        if (bid.sellDigit > choosenDigit + 1) {
          // if won
          data[i].PL = "won";
          let underPercentageval = bid.sellDigit;
          let profit = bid.defaultStake * underPercentage[underPercentageval];
          data[i].payout = profit;
          data[i].afterBalance = bid.balance + profit;
        } else {
          // if loss
          data[i].PL = "loss";
          data[i].afterBalance = bid.balance - bid.defaultStake;
        }
        let underPercentageval = bid.sellDigit;
        data[i].epProfit =
          bid.defaultStake * underPercentage[underPercentageval];
      }
      if (bid.SellCategory == "MATCHES") {
        if (bid.sellDigit == choosenDigit) {
          // if won
          data[i].PL = "won";
          let profit = bid.defaultStake * matchesPayout;
          data[i].payout = profit;
          data[i].afterBalance = bid.balance + profit;
        } else {
          // if loss
          data[i].PL = "loss";
          data[i].afterBalance = bid.balance - bid.defaultStake;
        }
        data[i].epProfit = bid.defaultStake * matchesPayout;
      }
      if (bid.SellCategory == "DIFFERS") {
        if (bid.sellDigit != choosenDigit) {
          // if won
          data[i].PL = "won";
          let profit = bid.defaultStake * differsPayout;
          data[i].payout = profit;
          data[i].afterBalance = bid.balance + profit;
        } else {
          // if loss
          data[i].PL = "loss";
          data[i].afterBalance = bid.balance - bid.defaultStake;
        }
        data[i].epProfit = bid.defaultStake * differsPayout;
      }
      // bet history store
      let bet_history = JSON.parse(bid.bet_history);
      bet_history.push({
        date: getCurrentDateTime(),
        betAmount: bid.defaultStake,
        predection: bid.sellDigit,
        direction: bid.SellCategory,
      });
      data[i].bet_history = JSON.stringify(bet_history);

      // profit loss history store
      let profit_loss_history = JSON.parse(bid.profit_loss_history);
      profit_loss_history.push({
        date: getCurrentDateTime(),
        betAmount: bid.defaultStake,
        plStatus: data[i].PL,
        plAmount: data[i].payout,
        epProfit: data[i].epProfit,
      });
      data[i].profit_loss_history = JSON.stringify(profit_loss_history);
    }
    //console.log("Prossed data",data);

    //send won loss Notifications to specific socket id
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      //console.log(element.sockId);
      io.to(element.sockId).emit("won loss", element.PL, element.epProfit);
    }
    saveTradeInfo_toDB_in_users(data);
  }

  //console.log("bid_array eertrtrtrtertert", bid_array);
}

var userBetiingHistory = [];
async function generate_users() {
  while (true) {
    fetch("https://randomuser.me/api/")
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        // Access the user details from the API response
        const user = data.results[0];
        const fullName = `${user.name.first} ${user.name.last}`;
        const country = user.location.country;
        userBetiingHistory.push({
          name: user.name.first,
          bet: generateRandomValue(),
        });
        if (userBetiingHistory.length > 9) {
          userBetiingHistory.shift();
        }
        //console.log(`Name: ${fullName}, Country: ${country}`);
        io.emit("guserdata", userBetiingHistory);
      })
      .catch((error) => console.error("Error fetching user data:", error));
    // Wait for a random time between 1 to 10 seconds
    const delay = Math.floor(Math.random() * (10 - 1 + 1)) + 1; // Random delay between 1 and 10 seconds
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }
  function generateRandomValue() {
    return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
  }
}
// Start generating users
generate_users();
function getCurrentDateTime() {
  var now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  //console.log(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function saveTradeInfo_toDB_in_users(dataArray) {
  // Data to be updated
  const data = dataArray;

  // Generate the SQL update query with CASE statements
  const query = `
      UPDATE lottery_game_users
      SET
        balance = CASE Serial
          ${data
            .map((item) => `WHEN ${item.Serial} THEN ${item.afterBalance}`)
            .join(" ")}
        END,
        bet_history = CASE Serial
          ${data
            .map((item) => `WHEN ${item.Serial} THEN '${item.bet_history}'`)
            .join(" ")}
        END,
        profit_loss_history = CASE Serial
          ${data
            .map(
              (item) => `WHEN ${item.Serial} THEN '${item.profit_loss_history}'`
            )
            .join(" ")}
        END
      WHERE Serial IN (${data.map((item) => item.Serial).join(", ")});
    `;

  //console.log(query);

  // Execute the update query

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error updating data:", error);
      return;
    }
    console.log("Data updated successfully");
    //emit to client
    io.emit("update user data", "update", dataArray);
  });
}
