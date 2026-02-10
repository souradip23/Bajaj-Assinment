import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

app.use(express.json({ limit: "10kb" }));

const EMAIL = process.env.OFFICIAL_EMAIL;


const fibonacciSeries = (n) => {
  if (!Number.isInteger(n) || n < 0) throw new Error("Invalid Fibonacci input");
  let series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return n === 1 ? [0] : series.slice(0, n);
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const lcm = (arr) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
};

const hcf = (arr) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  return arr.reduce((a, b) => gcd(a, b));
};



app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});



app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacciSeries(body.fibonacci);
        break;

      case "prime":
        if (!Array.isArray(body.prime)) throw new Error("Invalid prime input");
        data = body.prime.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body.lcm)) throw new Error("Invalid LCM input");
        data = lcm(body.lcm);
        break;

      case "hcf":
        if (!Array.isArray(body.hcf)) throw new Error("Invalid HCF input");
        data = hcf(body.hcf);
        break;

      case "AI":
        if (typeof body.AI !== "string") throw new Error("Invalid AI input");

        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: body.AI }] }]
            })
          }
        );

        const aiData = await aiResponse.json();
        data =
          aiData?.candidates?.[0]?.content?.parts?.[0]?.text
            ?.split(" ")[0] || "Unknown";
        break;

      default:
        return res.status(400).json({
          is_success: false,
          error: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });
  } catch (error) {
    res.status(500).json({
      is_success: false,
      error: error.message
    });
  }
});

/* ------------------ Server ------------------ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
