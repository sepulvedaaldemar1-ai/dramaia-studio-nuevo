const {askGemini,sendError}=require("./_gemini");
module.exports=async function(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Usa POST."});
 try{const {story,sceneCount=6}=req.body||{};if(typeof story!=="string"||story.trim().length<10)return res.status(400).json({error:"Pega o genera primero una historia."});
 const count=Math.max(3,Math.min(10,Number(sceneCount)||6));
 const prompt=`Eres director de cine y artista de storyboard de minidramas verticales 9:16. Convierte la historia en exactamente ${count} escenas consecutivas. Mantén nombres, aspecto, ropa y localizaciones consistentes. Cada prompt visual describe encuadre, iluminación, emoción y acción. No incluyas letras dentro de las imágenes. HISTORIA: ${story.trim().slice(0,10000)}. Devuelve solo JSON con shots: arreglo de objetos title, action, prompt.`;
 const result=await askGemini(prompt);if(!Array.isArray(result?.shots)||!result.shots.length)return res.status(502).json({error:"Gemini no devolvió una lista de escenas válida."});return res.status(200).json({shots:result.shots.slice(0,count)});
 }catch(e){console.error("generate-storyboard:",e.message);return sendError(res,e)}
};