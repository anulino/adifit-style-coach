import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { storage } from "../../server/storage";
import { insertTrainingPlanSchema } from "../../shared/schema";
import { generateTrainingPlan } from "../../server/trainingGenerator";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    if (event.httpMethod === "POST" && event.path === "/.netlify/functions/training-plans") {
      const body = JSON.parse(event.body || "{}");
      const { userId, weekdays, startTime, duration, fitnessGoal } = body;
      
      const workouts = generateTrainingPlan(weekdays, startTime, duration, fitnessGoal);
      
      const planData = {
        userId,
        weekdays,
        startTime,
        duration,
        workouts,
      };
      
      const validatedData = insertTrainingPlanSchema.parse(planData);
      const plan = await storage.createTrainingPlan(validatedData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(plan)
      };
    }

    if (event.httpMethod === "GET" && event.path.includes("/training-plans/user/")) {
      const pathParts = event.path.split("/");
      const userId = pathParts[pathParts.length - 1];
      const plan = await storage.getTrainingPlanByUserId(userId);
      
      if (!plan) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Training plan not found" })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(plan)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (error: any) {
    console.error("Error in training-plans function:", error);
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
