import { Scraper } from "@the-convocation/twitter-scraper";
import dotenv from "dotenv";
dotenv.config();


// Utility function: returns true if there's a word > 50 chars
function hasVeryLongWord(text) {
  if (!text) return false;
  return text.split(/\s+/).some((word) => word.length > 32);
}

async function main() {
  // 1) Create a new scraper
  const scraper = new Scraper();

  // 2) Log in if your list is private, or skip if public (Guest mode might work for public)
  //    This example logs in with username/password. You could also set cookies if you prefer.
  // 2) Log in using environmental variables for username and password
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;
  await scraper.login(
    username,
    password,
    email
  );

  // 3) The ID of the Twitter list you want to monitor
  //    e.g. "1736495155002106192" or whatever ID you have
  const listId = "1876760665194418286";

  // Keep track of tweets we've already processed
  const seenTweetIds = new Set();

  // Function to fetch the latest tweets and process them
  async function fetchAndCheckTweets() {
    try {
      // Fetch up to 50 of the newest tweets from this list
      const { tweets } = await scraper.fetchListTweets(listId, 50);

      for (const tweet of tweets) {
        // If we've already seen this tweet before, skip
        if (tweet.id && seenTweetIds.has(tweet.id)) {
          continue;
        }

        // Mark as seen
        if (tweet.id) {
          seenTweetIds.add(tweet.id);
        }

        // Check if this tweet has a word > 50 characters
        if (hasVeryLongWord(tweet.text)) {
          console.log("---- Found a tweet with an extremely long word! ----");
          console.log(`User: @${tweet.username}`);
          console.log(`Tweet ID: ${tweet.id}`);
          console.log(`Link: ${tweet.permanentUrl}`);
          console.log(`Text: ${tweet.text}`);
          // Add any desired notification, logging, or DB storage
        }
      }
    } catch (err) {
      console.error("Error fetching or processing list tweets:", err);
    }
  }

  // Polling approach: run `fetchAndCheckTweets()` every 60 seconds
  // Polling approach: run `fetchAndCheckTweets()` every 30 minutes (30 * 60 * 1000 ms)
  const refreshIntervalMs = 30 * 60 * 1000;
  setInterval(fetchAndCheckTweets, refreshIntervalMs);
//   setInterval(fetchAndCheckTweets, 60_000);

  // Call it once at startup
  await fetchAndCheckTweets();

  console.log("Monitoring list tweets for super-long words...");
}

main().catch(console.error);