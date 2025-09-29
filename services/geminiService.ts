import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { VideoPrompt } from '../types.ts';

let ai: GoogleGenerativeAI | null = null;

const getApiKey = (): string | null => {
  try {
    console.log('Checking for API key...');
    const fromEnv = (process.env.API_KEY as string) || (process.env.GEMINI_API_KEY as string);
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem('GEMINI_API_KEY') : null;
    console.log('Environment key available:', !!fromEnv);
    console.log('LocalStorage key available:', !!fromStorage);
    const finalKey = fromEnv || fromStorage;
    console.log('Final key available:', !!finalKey);
    return finalKey;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

const getBaseUrl = (): string | undefined => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('GEMINI_BASE_URL') || undefined : undefined;
  } catch (error) {
    console.error('Error getting base URL:', error);
    return undefined;
  }
};

const getAI = (): GoogleGenerativeAI => {
  console.log('Initializing Google Generative AI...');
  const key = getApiKey();
  if (!key) {
    console.error('No API key found');
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY at build time or save it in localStorage under 'GEMINI_API_KEY'.");
  }
  
  console.log('Creating GoogleGenerativeAI instance...');
  const baseUrl = getBaseUrl();
  // Always create a new instance to ensure we use the latest API key from localStorage
  // Note: Custom base URLs are not officially supported by Google Generative AI SDK
  if (baseUrl) {
    console.log('Custom base URL provided, but not supported by official Gemini SDK:', baseUrl);
  }
  ai = new GoogleGenerativeAI(key);
  console.log('GoogleGenerativeAI instance created successfully');
  return ai;
};

const promptsSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'A short, descriptive title for this prompt variation (e.g., "Cinematic Drone Shot").'
      },
      prompt: {
        type: SchemaType.STRING,
        description: 'The full, detailed video prompt text, combining all elements into a coherent paragraph.'
      }
    },
    required: ['title', 'prompt']
  }
};

const promptToJsonSchema = {
    type: SchemaType.OBJECT,
    properties: {
        scene_description: {
            type: SchemaType.STRING,
            description: 'A detailed summary of the main scene, setting, and environment.'
        },
        visual_style: {
            type: SchemaType.STRING,
            description: 'The overall visual style or aesthetic (e.g., Cinematic, Anime, Vintage Film).'
        },
        protagonist_action: {
            type: SchemaType.STRING,
            description: 'The primary action the main character is performing.'
        },
        camera_angle: {
            type: SchemaType.STRING,
            description: 'The camera angle used for the shot (e.g., Wide Shot, Low-Angle Shot).'
        },
        camera_movement: {
            type: SchemaType.STRING,
            description: 'The movement of the camera during the shot (e.g., Static, Pan Left, Dolly In).'
        },
        lighting_details: {
            type: SchemaType.STRING,
            description: 'A description of the lighting setup and mood.'
        },
        additional_keywords: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING
            },
            description: 'Any other relevant keywords or tags from the prompt.'
        }
    },
    required: ['scene_description', 'visual_style', 'protagonist_action', 'camera_angle', 'camera_movement', 'lighting_details']
};


interface PromptGenerationParams {
    scene: string;
    style: string;
    protagonistAction: string;
    cameraAngle: string;
    cameraMovement: string;
    lighting: string;
    isNsfw: boolean;
    cameraDevice?: string;
}

interface CaptionGenerationParams {
    imageData: string; // base64 string without the 'data:mime/type;base64,' prefix
    mimeType: string;
}

export const generateCaptionFromImage = async (params: CaptionGenerationParams): Promise<string[]> => {
    try {
        const { imageData, mimeType } = params;

        const prompt = "Analyze this image and produce exactly 3 rich, distinct caption options (1–2 sentences each) describing the objects, attributes, relationships, and overall composition. Return only a JSON array of strings.";

        const model = getAI().getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                temperature: 0.7,
            }
        });

        const response = await model.generateContent([
            { inlineData: { data: imageData, mimeType } },
            prompt
        ]);

        const jsonText = response.response.text().trim();
        const captions = JSON.parse(jsonText);

        if (!Array.isArray(captions)) {
            throw new Error("API did not return an array of captions.");
        }

        return captions as string[];

    } catch (error) {
        console.error("Error generating caption from image:", error);
        let errorMessage = "Failed to generate caption from image. The API returned an unexpected response.";
        if (error instanceof Error) {
            errorMessage = `Failed to generate caption from image: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

export const transformPromptToJson = async (promptText: string): Promise<object> => {
    try {
        const prompt = `Analyze the following video prompt text and break it down into a structured JSON object. Extract the core components based on the provided schema.

Video Prompt: "${promptText}"`;
        
        const model = getAI().getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: promptToJsonSchema,
                temperature: 0.1,
            }
        });
        const response = await model.generateContent(prompt);

        const jsonText = response.response.text().trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error transforming prompt to JSON:", error);
        let errorMessage = "Failed to transform prompt to JSON. The API returned an unexpected response.";
        if (error instanceof Error) {
            errorMessage = `Failed to transform prompt to JSON: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

export const generatePrompts = async (params: PromptGenerationParams): Promise<VideoPrompt[]> => {
  try {
    const { scene, style, protagonistAction, cameraAngle, cameraMovement, lighting, isNsfw, cameraDevice } = params;
    
    const examples = `**Example 1 (Narrative with Camera Action):** "A little girl, lost in the city and separated from her parents in New York's Times Square, looks up. The camera tilts up, following her gaze. Starting from the ground, it slowly reveals the massive, glittering, and dizzying skyscrapers and billboards, powerfully emphasizing her smallness and helplessness in a vast world."

**Example 2 (Stylized Shot Description):** "Fashion magazine, motion blur, handheld camera, a close-up photo of a group of 18-year-old hippie goths at a warehouse party, horror movie style, cinematic, hyper-realistic, photorealistic."

**Example 3 (Juxtaposition with Camera Movement):** "A display window on a commercial street in a bustling city. The camera moves to the left, slowly panning across the window of a luxury store, which contains glamorous mannequins and expensive merchandise. The camera continues to the left, moving away from the window to reveal a homeless person in ragged clothes, shivering in the corner of an adjacent alley."

**Example 4 (Detailed Character Shot):** "soft lighting, low contrast lighting, medium shot, daylight, backlighting, clean single shot.In a full, eye-level shot, a Caucasian man is lying on the floor. He is wearing a white T-shirt and blue jeans, and has curly, fluffy hair. His legs are crossed, with one hand resting on his stomach while the other is playing with a necklace. Next to him, there is a green plant, and on the floor, there is also a pen and some other items. In the background, there are white walls with a patterned design, and the man is leaning against a black and white cushion."`;

    const nsfwSystemInstruction = `You are a master visual storyteller and cinematographer with expertise in adult, 18+ themes. Your task is to generate 3 distinct and highly descriptive video prompts for an adult audience, suitable for advanced AI video generation. The prompts can be erotic, sensual, or explore mature, provocative themes.

While the themes are mature, you must adhere to safety guidelines. Do not generate content that is illegal, hateful, depicts non-consensual acts, or graphic violence. Focus on artistic, cinematic, and evocative descriptions that are suggestive and tasteful rather than explicit.`;

    const sfwSystemInstruction = `You are a master visual storyteller and cinematographer. Your task is to generate 3 distinct and highly descriptive video prompts suitable for advanced AI video generation models like Sora, Runway, or Pika.`;
    
    const wordCountLimiter = "IMPORTANT: Each generated prompt description must be between 80 and 120 words. Do not exceed 140 words under any circumstances."

    const systemInstruction = isNsfw ? nsfwSystemInstruction : sfwSystemInstruction;

    const prompt = `${systemInstruction}

${wordCountLimiter}

Follow the style of these examples, where camera work is seamlessly integrated into a narrative description:

${examples}

Now, using the following criteria, generate 3 new variations. For each variation:
1.  Write a detailed, paragraph-long prompt.
2.  **Crucially, weave the specified camera angle and movement directly into the narrative.** Describe what the camera *does* as part of the action, rather than just listing it as a tag.
3.  Combine all elements into a cohesive and evocative scene.
4.  Provide a short, creative title that captures the essence of the shot.

**Criteria for Generation:**
- **Main Scene:** "${scene}"
- **Visual Style:** "${style}"
- **Protagonist Action:** "${protagonistAction}"
- **Camera Angle:** "${cameraAngle}"
- **Camera Movement:** "${cameraMovement}"
- **Camera/Device:** "${cameraDevice ?? ''}"
- **Lighting:** "${lighting}"`;

    const model = getAI().getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: promptsSchema,
        temperature: isNsfw ? 0.9 : 0.8,
      }
    });
    const response = await model.generateContent(prompt);

    const jsonText = response.response.text().trim();
    const generatedPrompts = JSON.parse(jsonText);
    
    if (!Array.isArray(generatedPrompts)) {
        throw new Error("API did not return an array of prompts.");
    }

    return generatedPrompts as VideoPrompt[];

  } catch (error) {
    console.error("Error generating prompts:", error);
    let errorMessage = "Failed to generate prompts. The API returned an unexpected response.";
    if (error instanceof Error) {
        errorMessage = `Failed to generate prompts: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};