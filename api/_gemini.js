
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function askGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    const error = new Error(
      "Falta GEMINI_API_KEY en Vercel > Settings > Environment Variables."
    );
    error.status = 500;
    throw error;
  }

  let lastError;

  // Tres intentos para recuperarse de errores temporales.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(18000)
        }
      );

      const raw = await response.text();
      let data = {};

      try {
        data = JSON.parse(raw);
      } catch {}

      if (!response.ok) {
        const error = new Error(
          String(
            data?.error?.message ||
            raw ||
            "Gemini devolvió un error"
          ).slice(0, 500)
        );

        error.status = response.status === 429 ? 429 : 502;
        error.providerStatus = response.status;

        // Reintentar errores temporales.
        if (
          [408, 429, 500, 502, 503, 504].includes(response.status) &&
          attempt < 2
        ) {
          lastError = error;
          await sleep(1000 * (attempt + 1));
          continue;
        }

        if (response.status === 503) {
          error.message =
            "Gemini está temporalmente saturado (503). Espera un minuto e inténtalo otra vez.";
        }

        throw error;
      }

      const output = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n");

      if (!output) {
        const error = new Error("Gemini no devolvió texto.");
        error.status = 502;
        throw error;
      }

      try {
        const clean = output
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");

        return JSON.parse(clean);
      } catch {
        const error = new Error(
          "Gemini respondió con JSON no válido. Intenta generar de nuevo."
        );
        error.status = 502;
        throw error;
      }
    } catch (error) {
      // Los errores recibidos directamente de Gemini ya están clasificados.
      if (error.providerStatus) {
        throw error;
      }

      if (
        error.name === "TimeoutError" ||
        error.name === "AbortError"
      ) {
        lastError = new Error(
          "Gemini tardó demasiado en responder."
        );
        lastError.status = 504;
      } else {
        lastError = error;
        lastError.status = lastError.status || 502;
      }

      if (attempt < 2) {
        await sleep(1000 * (attempt + 1));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ||
    new Error("Gemini no pudo completar la solicitud. Inténtalo más tarde.");
}

function sendError(res, error) {
  return res.status(error.status || 502).json({
    error: error.message || "No se pudo generar.",
    ...(error.providerStatus
      ? { providerStatus: error.providerStatus }
      : {})
  });
}

module.exports = { askGemini, sendError };
