import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBu6Aod3rvzR-ffJzVcl14_GtyiNpM7IiY"
const client = new GoogleGenerativeAI(API_KEY);
export const model = client.getGenerativeModel({model: "gemini-1.5-flash"});