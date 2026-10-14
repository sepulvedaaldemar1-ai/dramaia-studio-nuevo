const {askGemini,sendError}=require("./_gemini");
module.exports=async function(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Usa POST."});
 try{const {idea,genre="Drama romántico",duration=1}=req.body||{};
 if(typeof idea!=="string"||idea.trim().length<5)return res.status(400).json({error:"Escribe una idea de al menos 5 caracteres."});
 const prompt=`Eres guionista de minidramas verticales. Escribe en español una historia original del género ${genre}, para un capítulo de aproximadamente ${duration} minuto(s). Idea: ${idea.trim().slice(0,3000)}. Devuelve solo JSON con title, logline, characters (array de objetos name, age, description, motivation), synopsis, script y endingHook. La historia debe ser emocional, visual, con inicio rápido y gancho final.`;
 const story=await askGemini(prompt);if(!story||!story.title||!story.script)return res.status(502).json({error:"Faltan campos esenciales en la historia generada."});return res.status(200).json({story});
 }catch(e){console.error("generate-story:",e.message);return sendError(res,e)}
};