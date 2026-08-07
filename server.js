import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


// Gemini setup
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// Test route
app.get("/", (req, res) => {
    res.send("WorkFit Gemini Server is running.");
});


// Generate fitness plan
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

            model: "gemini-3.5-flash",

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



// Start server
app.listen(PORT, () => {

    console.log(`WorkFit server running at http://localhost:${PORT}`);

});