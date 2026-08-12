import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Get the current folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// Serve HTML, CSS, JavaScript, and images
app.use(express.static(__dirname));

// ==============================
// GEMINI SETUP
// ==============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ==============================
// HOME PAGE
// ==============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ==============================
// GENERATE FITNESS PLAN
// ==============================

app.post("/generate-plan", async (req, res) => {

    try {

        const {
            age,
            height,
            weight,
            sex,
            goal,
            schedule
        } = req.body;

        const prompt = `
You are an expert personal trainer and nutrition coach.

Create a personalized fitness and meal plan.

User Information:

Age: ${age}
Height: ${height} inches
Weight: ${weight} lbs
Sex: ${sex}
Goal: ${goal}

Schedule:
${schedule}

Create:

1. Weekly Workout Plan:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

2. Meal Plan:

- Breakfast
- Lunch
- Dinner
- Snacks

3. Meal Prep:

- Best day to meal prep
- Foods to prepare
- Storage tips

Rules:

- Make it realistic
- Match workouts to the user's schedule
- Focus on consistency
- Avoid extreme diets
- Make the plan detailed but easy to follow
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            plan: response.text
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        res.status(500).json({
            error: error.message
        });

    }

});

// ==============================
// VERCEL
// ==============================

export default app;
