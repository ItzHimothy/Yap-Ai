require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

/* ================= CONFIG ================= */

const PREFIX = "!ask";
const ALLOWED_GUILD_ID = "1465718425765679135";

/* ========================================== */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ================= OPENAI ================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= READY ================= */

client.once("ready", async () => {
  console.log(`🤖 YapAI logged in as ${client.user.tag}`);

  // Lock bot to your server
  for (const guild of client.guilds.cache.values()) {
    if (guild.id !== ALLOWED_GUILD_ID) {
      await guild.leave().catch(() => {});
    }
  }
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
      return message.reply("❌ Ask me something.\nExample: `!ask Can you help me build a website?`");
    }

    await message.channel.sendTyping();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are YapAI, a friendly AI assistant for the Yap Sites Discord server. " +
            "You help users with websites, Discord bots, pricing, ideas, and general support. " +
            "You are professional, helpful, and clear."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.6,
      max_tokens: 400
    });

    const reply = completion.choices[0].message.content;

    await message.reply(reply.length > 1900 ? reply.slice(0, 1900) + "…" : reply);

  } catch (err) {
    console.error("AI Error:", err);
    message.reply("⚠️ I had trouble answering that. Try again.");
  }
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);
