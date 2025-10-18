import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const contentType = event.headers["content-type"] || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Expected multipart/form-data" })
      };
    }

    const boundary = contentType.split("boundary=")[1];
    if (!boundary || !event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No photo uploaded" })
      };
    }

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body);

    const parts = bodyBuffer.toString("binary").split(`--${boundary}`);
    let photoData = "";
    let mimeType = "image/jpeg";

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('name="photo"')) {
        const contentTypeMatch = part.match(/Content-Type: (.+)/);
        if (contentTypeMatch) {
          mimeType = contentTypeMatch[1].trim();
        }
        
        const dataStart = part.indexOf("\r\n\r\n") + 4;
        const dataEnd = part.lastIndexOf("\r\n");
        const binaryData = part.substring(dataStart, dataEnd);
        photoData = Buffer.from(binaryData, "binary").toString("base64");
        break;
      }
    }

    if (!photoData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No photo uploaded" })
      };
    }

    const photoUrl = `data:${mimeType};base64,${photoData}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ photoUrl })
    };
  } catch (error: any) {
    console.error("Error in upload-photo function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Failed to process photo" })
    };
  }
};
