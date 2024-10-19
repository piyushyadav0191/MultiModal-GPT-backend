import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY= process.env.GROQ_API_KEY;

export const groq = new Groq({apiKey: GROQ_API_KEY});