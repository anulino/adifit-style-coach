import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { storage } from "../../server/storage";
import { generateVirtualTryOn } from "../../server/gemini";
import { suggestedLooks } from "../../shared/mockData";

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
    if (event.httpMethod === "POST" && event.path === "/.netlify/functions/virtual-tryon") {
      const body = JSON.parse(event.body || "{}");
      const { userId, lookId, userPhotoBase64 } = body;
      
      if (!userPhotoBase64) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "User photo is required" })
        };
      }

      const look = suggestedLooks.find(l => l.id === lookId);
      if (!look) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Look not found" })
        };
      }

      const outfitDescription = `${look.shoes.name}, ${look.clothes.name}, ${look.accessories.name}`;
      
      const imageBase64 = await generateVirtualTryOn(
        userPhotoBase64,
        outfitDescription,
        look.name
      );
      
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      const tryOnResult = await storage.createTryOnResult({
        userId,
        lookId: look.id,
        lookName: look.name,
        imageUrl,
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tryOnResult)
      };
    }

    if (event.httpMethod === "POST" && event.path.includes("/virtual-tryon/batch")) {
      const body = JSON.parse(event.body || "{}");
      const { userId, userPhotoBase64 } = body;
      
      if (!userPhotoBase64) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "User photo is required" })
        };
      }

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "User ID is required" })
        };
      }

      const results = [];
      
      for (const look of suggestedLooks) {
        try {
          const outfitDescription = `${look.shoes.name}, ${look.clothes.name}, ${look.accessories.name}`;
          
          const imageBase64 = await generateVirtualTryOn(
            userPhotoBase64,
            outfitDescription,
            look.name
          );
          
          const imageUrl = `data:image/png;base64,${imageBase64}`;
          
          const tryOnResult = await storage.createTryOnResult({
            userId,
            lookId: look.id,
            lookName: look.name,
            imageUrl,
          });
          
          results.push(tryOnResult);
        } catch (error) {
          console.error(`Error generating try-on for ${look.name}:`, error);
        }
      }
      
      if (results.length === 0) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to generate any virtual try-on images" })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results)
      };
    }

    if (event.httpMethod === "GET" && event.path.includes("/try-on-results/user/")) {
      const pathParts = event.path.split("/");
      const userId = pathParts[pathParts.length - 1];
      const results = await storage.getTryOnResultsByUserId(userId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (error: any) {
    console.error("Error in virtual-tryon function:", error);
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({ error: error.message || "Failed to generate virtual try-on" })
    };
  }
};
