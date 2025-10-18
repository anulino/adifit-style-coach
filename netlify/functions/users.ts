import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { storage } from "../../server/storage";
import { insertUserProfileSchema } from "../../shared/schema";

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
    if (event.httpMethod === "POST" && event.path === "/.netlify/functions/users") {
      const body = JSON.parse(event.body || "{}");
      const validatedData = insertUserProfileSchema.parse(body);
      const user = await storage.createUserProfile(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    if (event.httpMethod === "GET" && event.path.includes("/users/")) {
      const pathParts = event.path.split("/");
      const userId = pathParts[pathParts.length - 1];
      const user = await storage.getUserProfile(userId);
      
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "User not found" })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (error: any) {
    console.error("Error in users function:", error);
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
