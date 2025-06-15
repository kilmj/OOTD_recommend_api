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


  const { region, allergy } = req.body;
  if (!region || !allergy) {
    return res.status(400).json({ error: "지역명과 알레르기 입력이 필요합니다." });
  }

  
  try{
    const today = new Date().toISOString().slice(0,10);
    const prompt =`
    
    지역명: ${region}
    오늘 날짜: ${today}
    알레르기 종류: ${allergy}

    해당지역의 날씨와 알레르기를 고려하여 옷차림과 마실 음료를 추천해줘.`;

    const result = await ai.models.generateContent({
      model:"gemini-2.0-flash",
      contents:prompt,
      config:{
        systemInstruction:
        "오늘날짜와 해당지역의 최고기온, 최저기온, 비가 올 확률을 먼저 제시하세요.상의, 하의, 신발 조합을 총 3가지로 추천하되, 많은 사람들이 가지고 있을 옷들을 위주로 조합하여 성별에 상관없이 입을 수 있게 날씨에 맞게 옷을 추천하세요. 마지막에는 오늘의 패션아이템 한가지를 덧붙여 주세요. 추가적으로 한줄 내려서 [오늘의 추천음료] 말머리를 달고 날씨를 고려하여 마실 음료를 추천해주세요. 메가커피,컴포즈 커피의 메뉴를 활용하여 추천하세요. 단, 사용자가 입력한 알레르기를 보고 해당 재로가 들어간 음료를 제외하고 추천하세요."
      },
    });

    res.status(200).json({answer:result.text});
  } catch(err){
    console.error(err);
    res.status(500).json({error:"Gemini API 오류발생"});
  }

  function formatAIResponseText(text) {
  // 1. 이중 별표를 <strong>으로
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 2. ## 헤더 → <h3>
  text = text.replace(/^## (.*)$/gm, "<h3>$1</h3>");

  // 3. # 단일 헤더 → <h4>
  text = text.replace(/^# (.*)$/gm, "<h4>$1</h4>");

  // 4. [오늘의 추천음료] → 섹션 강조
  text = text.replace(/\[오늘의 추천음료\]/g, "<h4>🥤 오늘의 추천 음료</h4>");

  // 5. 줄바꿈 → <br> (단, 중복 <br>은 한번만)
  text = text.replace(/\n{2,}/g, "</p><p>"); // 문단 분리
  text = "<p>" + text.replace(/\n/g, "<br>") + "</p>"; // 일반 줄바꿈

  return text;
}

}
