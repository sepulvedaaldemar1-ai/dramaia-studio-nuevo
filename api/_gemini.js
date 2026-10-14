const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
async function askGemini(prompt) {
 const key=process.env.GEMINI_API_KEY;
 if(!key){const e=new Error("Falta GEMINI_API_KEY en Vercel > Settings > Environment Variables.");e.status=500;throw e;}
 let r;
 try{r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.8,responseMimeType:"application/json"}}),signal:AbortSignal.timeout(50000)})}
 catch(e){const x=new Error("No se pudo conectar con Gemini: "+(e.message||"error de red"));x.status=502;throw x}
 const raw=await r.text();let d={};try{d=JSON.parse(raw)}catch{}
 if(!r.ok){const e=new Error(String(d?.error?.message||raw||"Gemini devolvió un error").slice(0,500));e.status=r.status===429?429:502;e.providerStatus=r.status;throw e}
 const t=d?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n");if(!t){const e=new Error("Gemini no devolvió texto.");e.status=502;throw e}
 try{return JSON.parse(t.replace(/^```(?:json)?\\s*/i,"").replace(/\\s*```$/,""))}catch{const e=new Error("Gemini respondió con JSON no válido.");e.status=502;throw e}
}
function sendError(res,e){return res.status(e.status||502).json({error:e.message||"No se pudo generar.",...(e.providerStatus?{providerStatus:e.providerStatus}:{})})}
module.exports={askGemini,sendError};
