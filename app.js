const express = require("express");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;

// change this to your name if you like
const YOUR_NAME = "Sajan";

/** -------------- helpers -------------- **/

// Callback-style simulated API
function simulateApiCallCb(value, cb, shouldFail = false) {
  setTimeout(() => {
    if (shouldFail) return cb(new Error("Simulated API error"));
    cb(null, { id: value, name: YOUR_NAME });
  }, 1000);
}

// Promise-based simulated API
function simulateApiCallPromise(value, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) return reject(new Error("Simulated API error"));
      resolve({ id: value, name: YOUR_NAME });
    }, 1000);
  });
}

// Async/await wraps the Promise
async function simulateApiCallAsync(value, shouldFail = false) {
  return simulateApiCallPromise(value, shouldFail);
}

// Delay utility
function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** -------------- routes -------------- **/

// 1) /callback  — uses callbacks + setTimeout, 1s delay
app.get("/callback", (req, res, next) => {
  const fail = ["1", "true"].includes((req.query.fail || "").toLowerCase());
  simulateApiCallCb(1, (err, data) => {
    if (err) return next(err);
    res.json({ via: "callback", data });
  }, fail);
});

// 2) /promise  — wraps same logic in a Promise
app.get("/promise", (req, res, next) => {
  const fail = ["1", "true"].includes((req.query.fail || "").toLowerCase());
  simulateApiCallPromise(2, fail)
    .then((data) => res.json({ via: "promise", data }))
    .catch(next);
});

// 3) /async  — rewritten with async/await
app.get("/async", async (req, res, next) => {
  try {
    const fail = ["1", "true"].includes((req.query.fail || "").toLowerCase());
    const data = await simulateApiCallAsync(3, fail);
    res.json({ via: "async/await", data });
  } catch (err) {
    next(err);
  }
});

// 4) /file  — use fs.promises to read a file asynchronously
app.get("/file", async (req, res, next) => {
  try {
    const contents = await fs.readFile("./data/sample.txt", "utf8");
    res.json({ file: "data/sample.txt", contents });
  } catch (err) {
    next(err);
  }
});

// 5) /chain  — chain multiple steps using simulateDelay(ms)
app.get("/chain", async (req, res, next) => {
  try {
    const steps = [];
    await simulateDelay(300);
    steps.push("Login complete");
    await simulateDelay(300);
    steps.push("Fetched user data");
    await simulateDelay(300);
    steps.push("Rendered UI");
    res.json({ steps });
  } catch (err) {
    next(err);
  }
});

/** -------------- error handler -------------- **/
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
    tip: "Append ?fail=1 to any endpoint to see error handling."
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
