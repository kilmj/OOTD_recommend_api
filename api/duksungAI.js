import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

export default async function handler(req,res) {
  const allowedOrigin = "https://kilmj.github.io"

  res.setHeader("Access-Control-Allow-Origin",allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");

  if(req.method === "OPTIONS"){
    return res.status(200).end();
  }
  


  const{ region } = req.body;
  if (!region){
    return res.status(400).json({error:"지역명 입력이 필요합니다."});
  }

  // const region = "서울시 도붕구"
  

  try{
    const today = new Date().toISOString().slice(0,10);
    const prompt =`
    
    지역명: ${region}
    오늘 날짜: ${today}

    해당지역의 날씨를 고려하여 옷차림을 추천해줘.`
    
  ;

    const result = await ai.models.generateContent({
      model:"gemini-2.0-flash",
      contents:prompt,
      config:{
        systemInstruction:
        "오늘날짜와 해당지역의 최고기온, 최저기온, 비가 올 확률을 먼저 제시하세요.상의, 하의, 신발 조합을 총 3가지로 추천하되, 많은 사람들이 가지고 있을 옷들을 위주로 조합하여 성별에 상관없이 입을 수 있게 날씨에 맞게 옷을 추천하세요. 마지막에는 오늘의 패션아이템 한가지를 덧붙여 주세요."
      },
    });

    res.status(200).json({answer:result.text});
  } catch(err){
    console.error(err);
    res.status(500).json({error:"Gemini API 오류발생"});
  }

  
  
}