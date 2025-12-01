import { GoogleGenAI } from "@google/genai";
import { ViewMode, UserInput, GenerationRequest, ScenarioData, OutlineTemplate } from "./types";

const SYSTEM_INSTRUCTION = `
你是一位生活在1920年代纽约的所谓“通灵侦探”兼通俗小说作家，正在协助一位“守秘人”创作《克苏鲁的呼唤》(COC) 跑团模组。
风格：H.P. 洛夫克拉夫特式的宇宙恐怖、黑色电影(Film Noir)的冷硬派、以及《纽约客》式的尖酸刻薄。

重要指示：
1. 请根据用户的请求生成特定的模组内容。
2. 尽可能使用 **JSON格式** 返回数据，以便工具可以直接填入档案卡。
3. 如果无法使用JSON，请使用结构清晰的 Markdown。
4. 语言：简体中文。但专有名词保留英文注释。
`;

const getPromptByView = (view: ViewMode, input: string, context?: ScenarioData): string => {
  const contextStr = context ? JSON.stringify({
    title: context.outline.title,
    template: context.outline.template,
    truth: context.outline.truth,
    summary: `${context.outline.act1} ${context.outline.act2} ${context.outline.act3}`,
  }) : "";

  switch (view) {
    case ViewMode.OUTLINE:
      return `
      请根据以下灵感，使用模版【${context?.outline.template || '默认'}】构思一个COC模组大纲：
      "${input}"
      
      请严格以 **纯 JSON 格式** 返回，结构如下：
      {
        "title": "模组标题",
        "truth": "核心真相（守秘人专用）",
        "act1": "第一部分",
        "act2": "第二部分",
        "act3": "第三部分",
        "act4": "第四部分（可选）",
        "faq": "守秘人常见问题Q&A：列出3-5个玩家可能提出的刁钻问题或意外行动，并给出建议的应对方式。"
      }
      `;
    case ViewMode.TIMELINE:
      if (input.includes("AUTO_UPDATE")) {
        return `
        基于大纲：${contextStr}
        
        请自动推演时间轴，包含以下内容：
        1. **背景阴谋事件**：发生在调查员抵达前。
        2. **模组预期流程**：调查员抵达后的关键节点。
        3. **结局分支**：至少设计3个结局分支（如Good End, Bad End, True End）。
        
        请严格以 **纯 JSON 格式** 返回数组，结局必须包含 type="ending" 和 endingCondition 字段：
        [
          {
            "date": "10年前 / 192X年X月",
            "title": "背景事件：邪教诞生",
            "content": "简述",
            "type": "background",
            "eventLocation": "地点",
            "eventPeople": "关键人物",
            "eventResults": "直接导致了... 间接影响了...",
            "obtainableClues": "相关线索/物品"
          },
          {
            "date": "游戏开始时",
            "title": "调查员抵达",
            "content": "调查员介入点",
            "type": "scenario",
            "isInterventionPoint": true
          },
          {
            "date": "第一天夜里",
            "title": "第一次袭击",
            "content": "简述",
            "type": "scenario",
            "prerequisites": "触发条件（如：调查员进入书房）",
            "readAloud": "环境描写...",
            "sceneDetails": "详细剧本...",
            "sceneFlow": "1. 发现尸体 -> 2. 检定侦查 -> 3. 遭遇怪物",
            "sceneObjective": "获得关键日记"
          },
          {
            "date": "结局",
            "title": "结局A：全员生还",
            "content": "调查员成功阻止了仪式...",
            "type": "ending",
            "endingCondition": "达成条件：在午夜前摧毁祭坛...",
            "endingDescription": "详细的结局描述，描述调查员逃出生天的过程和后续影响..."
          }
        ]
        `;
      }
      return `
      设计一个时间轴事件："${input}"
      JSON返回格式（根据这是背景事件还是玩家游玩场景选择字段）：
      {
        "date": "时间",
        "title": "标题",
        "content": "简述",
        "type": "background" 或 "scenario",
        "eventLocation": "...",
        "eventResults": "...",
        "obtainableClues": "...",
        "prerequisites": "...",
        "readAloud": "...",
        "sceneDetails": "...",
        "sceneFlow": "...",
        "sceneObjective": "..."
      }
      `;
    case ViewMode.MAP:
      if (input.includes("AUTO_CREATE")) {
        return `
        基于大纲：${contextStr}
        设计 5-8 个关键地点。
        JSON数组：
        [{ "name": "...", "x": 20, "y": 30, "description": "...", "npcs": ["..."] }]
        `;
      }
      return `设计一个地点 "${input}"。返回JSON: { "name": "...", "x": 50, "y": 50, "description": "...", "npcs": [] }`;
    case ViewMode.CHARACTERS:
      if (input.includes("AUTO_CREATE")) {
        return `
        基于大纲：${contextStr}
        设计所有关键角色。请设计至少 8-10 名角色，务必包含：
        1. 盟友/线人
        2. 反派/邪教徒
        3. 受害者
        4. 关键目击者
        5. 拥有特殊功能的NPC
        
        JSON数组：
        [{ "name": "...", "age": "...", "occupation": "...", "description": "...", "personality": "...", "belief": "...", "backstory": "...", "goal": "...", "actionStyle": "...", "skills": "...", "secret": "..." }]
        `;
      }
      return `设计角色 "${input}"。返回JSON Character对象。`;
    case ViewMode.ITEMS:
      if (input.includes("AUTO_CREATE")) {
         return `
         基于大纲：${contextStr}
         请设计关键物品，确保包含多样化的种类。
         请生成至少 10 个物品，需覆盖以下类型：
         - Clue (线索/纸条/残渣)
         - Weapon (武器)
         - Tool (工具/装备)
         - Artifact (古物/魔法物品)
         - Document (书籍/日记/文件)
         
         JSON数组: 
         [{ "name": "...", "type": "Clue" 或 "Weapon" 或 "Tool" 或 "Artifact" 或 "Document", "description": "...", "attributes": "...", "owner": "...", "foundLocation": "..." }]
         `;
      }
      return `设计物品 "${input}"。返回JSON Item对象。`;
    case ViewMode.SCENES:
      return `
      扩写场景 "${input}"。
      
      如果这是背景往事，返回JSON：
      {
         "type": "background",
         "eventLocation": "...",
         "eventPeople": "...",
         "eventResults": "直接结果... 间接结果...",
         "obtainableClues": "..."
      }
      
      如果这是游玩场景，返回JSON：
      {
         "type": "scenario",
         "prerequisites": "触发条件...",
         "readAloud": "宣读文本...",
         "sceneDetails": "详细剧本...",
         "sceneFlow": "流程步骤...",
         "sceneObjective": "场景目的..."
      }
      `;
    default:
      return input;
  }
};

export const generateContent = async (
  request: GenerationRequest
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview"; 

  const prompt = getPromptByView(request.viewMode, request.userInput.prompt, request.context);
  
  const fullPrompt = `
  ${prompt}
  
  额外风格要求：
  - 语气风格：${request.userInput.tone}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85,
        responseMimeType: "application/json"
      },
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("群星的位置不对 (API Error).");
  }
};