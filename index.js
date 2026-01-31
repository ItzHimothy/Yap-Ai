require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

/* ================= CONFIG ================= */

const PREFIX = "!ask";
const ALLOWED_GUILD_ID = "1465718425765679135"; // YOUR SERVER ID

/* ========================================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= READY ================= */

client.once("ready", () => {
  console.log(`🤖 YapAI logged in as ${client.user.tag}`);
});

/* ================= MESSAGE HANDLER ================= */

client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;
    if (message.guild.id !== ALLOWED_GUILD_ID) return;
    if (message.author.bot) return;

    if (!message.content.toLowerCase().startsWith(PREFIX)) return;

    const question = message.content.slice(PREFIX.length).trim();
    if (!question) {
      return message.reply("❌ Ask me something.\nExample: `!ask how much is a website?`");
    }

    await message.channel.sendTyping();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are YapAI, a friendly AI assistant for the Yap Sites Discord server. " +
            "You help users with websites, Discord bots, pricing, ideas, and support. " +
            "Be clear, professional, and helpful."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    let reply = completion.choices[0].message.content;

    // Discord safety limit
    if (reply.length > 1900) {
      reply = reply.slice(0, 1900) + "...";
    }

    await message.reply(reply);

  } catch (err) {
    console.error("AI ERROR:", err);
    message.reply("⚠️ I had trouble answering that. Try again.");
  }
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);
