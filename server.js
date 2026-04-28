const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scan", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let score = 100;
    let issues = [];

    // Check title
    if (!$("title").text()) {
      issues.push("Missing title tag");
      score -= 15;
    }

    // Check meta description
    if (!$('meta[name="description"]').attr("content")) {
      issues.push("Missing meta description");
      score -= 15;
    }

    // Check H1
    if ($("h1").length === 0) {
      issues.push("No H1 tag found");
      score -= 15;
    }

    // Check images without alt
    $("img").each((i, el) => {
      if (!$(el).attr("alt")) {
        issues.push("Image missing alt text");
        score -= 5;
      }
    });

    score = Math.max(score, 0);

    res.json({
      score,
      issues,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to scan website" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
