
import React, { useState, useCallback, FormEvent, useRef, useEffect } from 'react';
import { generatePrompts, generateCaptionFromImage, getActiveProvider as getActiveLLMProvider, setActiveProvider as setActiveLLMProvider, getApiKey as getStoredApiKey, setApiKey as storeApiKey, clearApiKey as removeApiKey, PROVIDERS, type LLMProvider } from './services/llm/router.ts';
import { VideoPrompt } from './types.ts';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import PromptCard from './components/PromptCard.tsx';
import Loader from './components/Loader.tsx';
import ImageIcon from './components/icons/ImageIcon.tsx';
import { Input } from './src/components/ui/input';
import { Label } from './src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './src/components/ui/card';
import { MultiSelect, MultiSelectOption } from './src/components/ui/multi-select';

const lightingOptions = [
  // 🌅 Natural & Environmental Light
  'Golden Hour',
  'Blue Hour (cool twilight tones)',
  'Bright Daylight',
  'Overcast / Diffused Natural Light',
  'Cloudy Soft Light',
  'Dappled Sunlight (through leaves or patterns)',
  'Moonlight',
  'Candlelight',
  'Firelight / Campfire glow',
  'Neon',
  
  // 🎭 Cinematic & Dramatic Styles
  'Moody',
  'Dramatic Shadows',
  'Chiaroscuro',
  'Low-Key Lighting',
  'High-Key Lighting',
  'Volumetric Lighting (light beams, atmospheric haze)',
  'Rim Light',
  'Backlight',
  'Silhouette Lighting',
  'Edge Lighting',
  'Practical Lighting (visible lamps, signs in frame)',
  
  // 💡 Studio & Controlled Lighting
  'Soft Key Light',
  'Hard Light',
  'Top Light',
  'Underlighting',
  'Butterfly Lighting (Paramount style)',
  'Rembrandt Lighting (triangle cheek light)',
  'Split Lighting (half face lit)',
  'Clamshell Lighting (beauty portrait setup)',
  'Three-Point Lighting',
  'Ring Light Glow',
  'Fill Light Bounce',
  'Spotlight Isolation',
];

const styleOptions = [
    'Cinematic (CGI)',
    'Anime',
    'Manga',
    'Comic book / Graphic novel',
    'Digital painting',
    'Matte painting',
    'Fantasy illustration',
    'Concept art',
    'Pixar-style 3D',
    'Claymation / Stop-motion CGI',
    'Low-poly',
    'Isometric art',
    'Surrealist illustration',
    'Minimalist vector art',
    'Cel-shaded 3D',
    'Steampunk art',
    'Vaporwave / Synthwave aesthetic',
    'Cyberpunk',
    'Retro arcade pixel art',
    'Cinematic (photographic)',
    'Documentary',
    'Film noir',
    'Street photography',
    'Portrait photography',
    'Editorial fashion',
    'Studio lighting',
    'Natural light',
    'Macro photography',
    'Sports/action photography',
    'Architectural photography',
    'Landscape / nature photography',
    'Black & white',
    'Sepia tone',
    'HDR (High Dynamic Range)',
    'Polaroid / instant film look',
    'Vintage film (35mm, 16mm)',
    'Overexposed / light leak aesthetic',
    'Underwater photography',
    'Night photography / low light',
];
const protagonistActionOptions = [
  // 🚶 Movement & Body Position
  'Walking away from camera',
  'Walking toward camera',
  'Running',
  'Sprinting',
  'Sitting down',
  'Standing still',
  'Kneeling',
  'Lying down (on back, side, or stomach)',
  'Crouching',
  'Leaning against a wall or object',
  'Balancing on a narrow surface',
  'Stretching',

  // 💃 Expressive / Performance Actions
  'Dancing',
  'Jumping with joy',
  'Spinning / twirling',
  'Striking a pose',
  'Gesturing dramatically',
  'Clapping hands',
  'Bowing',
  'Mimicking / acting out a role',

  // 🗣 Interaction with Camera & Audience
  'Looking directly at the camera',
  'Looking away thoughtfully',
  'Turning their back',
  'Peeking over shoulder',
  'Winking',
  'Blowing a kiss',
  'Pointing at the camera',
  'Narrating or speaking to viewer',

  // 🪞 Object & Environment Interaction
  'Looking at themself in a mirror',
  'Interacting with an object (holding, using, inspecting)',
  'Touching a surface (wall, table, tree)',
  'Reading a book or paper',
  'Drinking from a cup/bottle',
  'Opening or closing a door',
  'Picking something up from the ground',
  'Throwing an object',
  'Carrying a bag, box, or tool',

  // 😊 Emotional Expression
  'Crying',
  'Laughing',
  'Smiling warmly',
  'Frowning',
  'Shouting / yelling',
  'Whispering',
  'Sighing',
  'Showing surprise (hands to mouth, wide eyes)',
  'Showing fear (backing away, covering face)',

  // ⚔️ Physical Action & Sports
  'Fighting (hand-to-hand or with weapon)',
  'Practicing martial arts',
  'Running obstacle course',
  'Climbing (wall, ladder, tree)',
  'Driving a car',
  'Riding a skateboard',
  'Riding a bicycle',
  'Riding a horse',
  'Swimming',
  'Surfing',
  'Skiing or snowboarding',
  'Throwing a ball',
  'Lifting weights',

  // 🌍 Exploration & Environment Engagement
  'Exploring the environment',
  'Inspecting surroundings',
  'Hiking through nature',
  'Walking in the rain',
  'Looking at the sky or stars',
  'Following a trail',
  'Entering a building',
  'Searching for something',
  'Digging or uncovering an object',

  // 🧩 Everyday Activities (from previous list)
  'Typing on a keyboard',
  'Talking on the phone',
  'Painting on a canvas',
  'Playing a guitar',
  'Cooking a meal',
  'Eating a meal',
  'Working out',
  'Meditating',
  'Singing',
];

// NSFW 18+ Options
const nsfwStyleGroups = [
  {
    label: '💫 Soft & Suggestive',
    options: [
      'Sensual',
      'Intimate Portrait',
      'Boudoir',
      'Soft-focus Dream',
      'Romantic Glow',
      'Suggestive Tease',
      'Lingerie Editorial',
      'Playful Pin-up',
      'Voyeuristic Glimpse',
    ],
  },
  {
    label: '🔥 Erotic & Provocative',
    options: [
      'Erotic',
      'Provocative',
      'Dark Fantasy',
      'Arthouse Erotic',
      'Taboo',
      'Fetish Fashion',
      'Striptease Moment',
      'Erotic Dance',
      'Body Worship',
      'Teasing Reveal',
    ],
  },
  {
    label: '🎭 Stylized Erotic Genres',
    options: [
      'Gritty Realism',
      'Film Noir Erotic',
      'Neo-Noir Erotic',
      'Baroque Sensuality',
      'Giallo Erotic Horror',
      'FemDom Focus',
      'Submissive Perspective',
      'Roleplay Scenario (nurse, teacher, maid, etc.)',
    ],
  },
] as const;
const nsfwProtagonistActionOptions = [
    'Giving a blowjob', 'Slowly undressing', 'Lounging on a bed leg spread', 'Sharing an intense, intimate gaze',
    'Whispering a secret', 'Caressing their own skin','Caressing her pussy', 'A passionate kiss', 'lying on her back legs spread', 'On all fours'
    ,'Fingering her pussy', 'Sqatting over dildo', 'Squatting over penis', 'Penis in vagina','Penis in anus','Doggystyle','Fucked from behind','cumshot on face', 
    'Leaning against a rain-streaked window', 'Cumshot in ass', 'Facial cumshot', 'Handjob', 'Facefucked' 
    ,'Deepthroat', 'Applying perfume to their neck', 
    'Lighting a cigarette in a dark room', "Squating", 
];


const cameraAngleOptions = [
    'Wide Shot', 'Extreme Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up',
    'Low-Angle Shot', 'High-Angle Shot', 'Dutch Angle', 'Over-the-Shoulder Shot',
    'First-Person View (FPV)', "Bird's-Eye View", "Worm's-Eye View"
];

const cameraMovementOptions = [
  'Locked-off tripod shot',
  'Static wide shot',
  'Static close-up',
  "Static overhead / bird's-eye view",
  "Static low angle / worm's-eye view",
  'Static Dutch tilt (angled horizon)',
  'Symmetrical frontal shot',

  'Slow push-in (dolly in)',
  'Slow pull-out (dolly out)',
  'Steadicam tracking forward',
  'Steadicam tracking backward',
  'Side-to-side tracking (dolly left/right)',
  'Slow crane up (revealing)',
  'Crane down to subject',
  'Push-in + tilt up combo',
  'Orbiting shot (circular movement around subject)',
  'Parallax tracking (foreground/background shift)',
  'Slow truck + pan',
  'Lateral slider movement',
  'Following handheld shot',
  'Low tracking shot along ground',
  'Pedestal rise or drop',

  'Handheld shaky cam (documentary style)',
  'Smooth gimbal movement',
  'Whip pan (fast blur transition)',
  'Rack focus during movement',
  'Slow 360° rotation around subject',
  'Vertigo shot / dolly zoom (Hitchcock effect)',
  'Over-the-shoulder tracking shot',
  'POV walking shot',
  'POV falling shot (camera tilts and drops)',
  'First-person “headcam” movement',
  'Overhead drone pull-away',
  'Drone fly-through (narrow space)',
  'Underwater tracking',
  'Long take / continuous uncut shot',
];

const cameraDeviceGroups = [
  {
    label: '📱 Cell Phone Styles',
    options: [
      'iPhone 15 Pro Max (48MP, cinematic mode)',
      'iPhone 14 Pro (natural HDR look)',
      'iPhone 11 (softer colors, less dynamic range)',
      'Google Pixel 8 Pro (computational photography sharpness)',
      'Google Pixel 6 (contrasty HDR+)',
      'Samsung Galaxy S24 Ultra (200MP detail, saturated colors)',
      'Samsung Galaxy S10 (early AI processing look)',
      'Nokia Lumia 1020 (oversized sensor vintage mobile look)',
      'Motorola Razr V3 (low-res, 2000s flip-phone aesthetic)',
      'Early 2010s Android (grainy, overexposed night shots)'
    ],
  },
  {
    label: '🎞 Analog / Film Cameras',
    options: [
      'Polaroid SX-70 (instant film, warm soft focus)',
      'Polaroid 600 (classic 80s/90s instant film look)',
      '35mm Kodak Gold 200 (warm consumer film)',
      '35mm Fuji Superia 400 (cooler tones, grainy)',
      '35mm Ilford HP5 (black & white, high contrast)',
      '120mm Medium Format Hasselblad 500C/M (rich tonal range)',
      'Super 8mm film camera (grainy motion, vintage warmth)',
      '16mm film (documentary/indie look)',
      'Large format 4x5 camera (razor sharp, shallow depth of field)',
      'Lomography Diana F+ (plastic lens, dreamy vignetting)'
    ],
  },
  {
    label: '🎥 High-End Digital Cinema Cameras',
    options: [
      'ARRI Alexa 35 (cinema-grade dynamic range) + Master Prime lens',
      'ARRI Alexa Mini LF + Cooke Anamorphic/i lens (cinematic flares, oval bokeh)',
      'RED Komodo 6K + Canon CN-E cine lens (crisp, clinical detail)',
      'RED V-Raptor 8K VV + Sigma Cine Prime (hyper-detailed large format)',
      'Sony Venice 2 + Zeiss Supreme Prime (film-like smoothness)',
      'Canon C300 Mark III + Canon L-Series zoom (docu-style versatility)',
      'Blackmagic URSA Mini Pro 12K + Tokina Vista Prime (ultra-high-res clarity)',
      'Panasonic Varicam LT + Fujinon Cabrio zoom (broadcast cinematic look)',
      'Leica SL2-S + Leica Noctilux (luxury photography aesthetic)',
      'Hasselblad X2D 100C + XCD 80mm f/1.9 (medium-format depth)'
    ],
  },
] as const;

const App: React.FC = () => {
  const [scene, setScene] = useState<string>('');
  const [style, setStyle] = useState<string[]>([]);
  const [nsfwStyle, setNsfwStyle] = useState<string[]>([]);
  const [protagonistAction, setProtagonistAction] = useState<string[]>([]);
  const [cameraAngle, setCameraAngle] = useState<string[]>([]);
  const [cameraMovement, setCameraMovement] = useState<string[]>([]);
  const [cameraDevice, setCameraDevice] = useState<string[]>([]);
  const [lighting, setLighting] = useState<string[]>([]);
  
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isCaptioning, setIsCaptioning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<number | null>(null);
  const sceneTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [isNsfwMode, setIsNsfwMode] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [activeProvider, setActiveProviderState] = useState<LLMProvider>(getActiveLLMProvider());

  useEffect(() => {
    // Initialize active provider and its stored API key
    const provider = getActiveLLMProvider();
    setActiveProviderState(provider);
    const existingKey = getStoredApiKey(provider) || '';
    setApiKey(existingKey);
    setIsApiKeySet(!!existingKey);
  }, []);

  useEffect(() => {
    const countWords = (str: string): number => {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(Boolean).length;
    };

    const sceneWords = countWords(scene);
    const styleWords = countWords(style.join(' '));
    const nsfwStyleWords = countWords(nsfwStyle.join(' '));
    const actionWords = countWords(protagonistAction.join(' '));
    const angleWords = countWords(cameraAngle.join(' '));
    const movementWords = countWords(cameraMovement.join(' '));
    const deviceWords = countWords(cameraDevice.join(' '));
    const lightingWords = countWords(lighting.join(' '));

    const totalWords = sceneWords + styleWords + nsfwStyleWords + actionWords + angleWords + movementWords + deviceWords + lightingWords;
    setWordCount(totalWords);

  }, [scene, style, nsfwStyle, protagonistAction, cameraAngle, cameraMovement, cameraDevice, lighting]);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      storeApiKey(apiKey, activeProvider);
      setIsApiKeySet(true);
    }
  };

  const handleApiKeyClear = () => {
    removeApiKey(activeProvider);
    setApiKey('');
    setIsApiKeySet(false);
  };

  const handleToggleNsfwMode = () => {
    setIsNsfwMode(prev => {
        const newMode = !prev;
        // Reset fields to defaults for the new mode to avoid invalid combinations
        setStyle([]);
        setNsfwStyle([]);
        setProtagonistAction([]);
        // Clear previous results and errors
        setPrompts([]);
        setError(null);
        return newMode;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image size should not exceed 4MB.");
        return;
      }
      setImageFile(file);
      setCaptions([]);
      setSelectedCaptionIndex(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCaptionImage = async () => {
      if (!imageFile || !imageBase64) return;
      
      setIsCaptioning(true);
      setError(null);

      try {
          // The base64 string from FileReader includes the data URL prefix, which needs to be removed.
          const base64Data = imageBase64.split(',')[1];
          const results = await generateCaptionFromImage({
              imageData: base64Data,
              mimeType: imageFile.type,
          });
          setCaptions(results);
          setSelectedCaptionIndex(null);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred during captioning.');
      } finally {
          setIsCaptioning(false);
      }
  };

  const handleGeneratePrompts = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!scene.trim() || loading || lighting.length === 0 || !isApiKeySet) return;

    setLoading(true);
    setError(null);
    setPrompts([]);

    try {
      const generatedPrompts = await generatePrompts({ 
        scene, 
        style: [...style, ...nsfwStyle].filter(Boolean).join(', '), 
        protagonistAction: protagonistAction.join(', '), 
        cameraAngle: cameraAngle.join(', '), 
        cameraMovement: cameraMovement.join(', '), 
        lighting: lighting.join(', '),
        isNsfw: isNsfwMode,
        cameraDevice: cameraDevice.join(', '),
      });
      setPrompts(generatedPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [scene, style, nsfwStyle, protagonistAction, cameraAngle, cameraMovement, cameraDevice, lighting, loading, isNsfwMode]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-12">
          <Loader />
          <p className="mt-4 text-zinc-400">Crafting your video prompts...</p>
        </div>
      );
    }

    if (error && !loading && !isCaptioning) {
      return (
        <div className="mt-8 text-center bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      );
    }
    
    if (prompts.length > 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
          {prompts.map((p, index) => (
            <PromptCard key={index} prompt={p} />
          ))}
        </div>
      );
    }

    return (
        <div className="text-center mt-12 flex flex-col items-center">
            <h2 className="mt-4 text-2xl font-semibold text-zinc-200">Ready to create?</h2>
            <p className="text-zinc-400 mt-2">Describe a scene and select your options to generate video prompts.</p>
        </div>
    );
  };
  
  const getWordCountColor = (count: number): string => {
    if (count === 0) return 'text-zinc-500';
    if (count >= 80 && count <= 120) return 'text-green-400 font-semibold';
    return 'text-yellow-400 font-semibold';
  };

  const formLabelClass = "block mb-2 text-sm font-medium text-zinc-300";
  const formSelectClass = "w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-200";
  const formTextareaClass = "w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-200 min-h-[100px] text-base";
  const buttonClass = "flex items-center justify-center px-4 py-2 bg-zinc-700 text-white rounded-lg font-semibold hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500";
  
  // Convert arrays to MultiSelectOption format
  const currentProtagonistActionOptions = isNsfwMode ? nsfwProtagonistActionOptions : protagonistActionOptions;
  
  const styleMultiOptions: MultiSelectOption[] = styleOptions.map(opt => ({ value: opt, label: opt }));
  
  const nsfwStyleMultiOptions: MultiSelectOption[] = nsfwStyleGroups.flatMap(group => 
    group.options.map(opt => ({ value: opt, label: opt, group: group.label }))
  );
  
  const protagonistActionMultiOptions: MultiSelectOption[] = currentProtagonistActionOptions.map(opt => ({ value: opt, label: opt }));
  
  const cameraAngleMultiOptions: MultiSelectOption[] = cameraAngleOptions.map(opt => ({ value: opt, label: opt }));
  
  const cameraMovementMultiOptions: MultiSelectOption[] = cameraMovementOptions.map(opt => ({ value: opt, label: opt }));
  
  const cameraDeviceMultiOptions: MultiSelectOption[] = cameraDeviceGroups.flatMap(group => 
    group.options.map(opt => ({ value: opt, label: opt, group: group.label }))
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-zinc-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {!isApiKeySet && (
            <Card className="mb-6 border-blue-500/50 bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-blue-300">🔑 API Key Required</CardTitle>
                <CardDescription className="text-zinc-400">
                  Select your provider and enter its API key. Keys are stored locally in your browser. Note: only Google Gemini is used right now; others will be supported soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="provider" className="text-zinc-300">Provider</Label>
                  <select
                    id="provider"
                    value={activeProvider}
                    onChange={(e) => {
                      const p = e.target.value as LLMProvider;
                      setActiveProviderState(p);
                      setActiveLLMProvider(p);
                      const k = getStoredApiKey(p) || '';
                      setApiKey(k);
                      setIsApiKeySet(!!k);
                    }}
                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                  >
                    {Object.entries(PROVIDERS).map(([id, meta]) => (
                      <option key={id} value={id}>{meta.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="apiKey" className="text-zinc-300">{PROVIDERS[activeProvider].label} API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={activeProvider === 'gemini' ? 'AIza...' : activeProvider === 'openai' ? 'sk-...' : activeProvider === 'anthropic' ? 'sk-ant-...' : activeProvider === 'stability' ? 'sk-...' : 'pplx-...'}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApiKeySubmit}
                      disabled={!apiKey.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isApiKeySet && (
            <div className="mb-6 p-4 border border-green-500/50 bg-green-900/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-green-300 font-medium">API Key Set</span>
                <span className="text-zinc-400 text-sm">({apiKey.slice(0, 8)}...)</span>
              </div>
              <button
                type="button"
                onClick={handleApiKeyClear}
                className="px-3 py-1 bg-red-600/20 text-red-300 text-sm rounded hover:bg-red-600/30 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          <form onSubmit={handleGeneratePrompts} className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            
            <div className="mb-6 p-4 border border-red-500/50 bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-red-300">NSFW 18+ Mode</h3>
                        <p className="text-xs text-zinc-400">Toggle for mature and adult themes. Discretion is advised.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggleNsfwMode}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${isNsfwMode ? 'bg-red-600' : 'bg-zinc-600'}`}
                        aria-pressed={isNsfwMode}
                    >
                        <span className="sr-only">Toggle NSFW Mode</span>
                        <span
                            aria-hidden="true"
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isNsfwMode ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 mb-6">
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">Start with an Image (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                            disabled={loading || isCaptioning}
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className={`${buttonClass} w-full`} disabled={loading || isCaptioning}>
                            <ImageIcon className="w-5 h-5 mr-2"/>
                            Upload Image
                        </button>
                        {imageFile && <p className="text-xs text-zinc-400 mt-2">Selected: {imageFile.name}</p>}
                    </div>
                    <div>
                        {imageBase64 && (
                            <div className="space-y-3">
                                <img src={imageBase64} alt="Upload preview" className="w-full h-auto max-h-48 object-contain rounded-md border border-zinc-600"/>
                                <button type="button" onClick={handleCaptionImage} className={`${buttonClass} w-full bg-red-600 hover:bg-red-500`} disabled={!imageFile || isCaptioning || loading}>
                                    {isCaptioning ? (
                                        <>
                                            <Loader/> <span className="ml-2">Captioning...</span>
                                        </>
                                    ) : (
                                        'Generate Caption from Image'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                 {error && (isCaptioning || loading) && (
                    <div className="mt-4 text-center bg-red-900/50 border border-red-500 text-red-300 p-2 rounded-lg text-sm">
                        <p>{error}</p>
                    </div>
                )}
                {captions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-zinc-300 font-medium mb-3">Choose a caption</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {captions.map((cap, i) => (
                        <Card key={i} className={`border ${selectedCaptionIndex === i ? 'border-red-500' : 'border-zinc-700'} bg-zinc-900/40`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-zinc-200">Caption {i + 1}</CardTitle>
                            <CardDescription className="text-xs text-zinc-400">Click a button below</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="text-sm text-zinc-300 whitespace-pre-wrap">{cap}</div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className={`${buttonClass} flex-1 bg-red-600 hover:bg-red-500`}
                                onClick={() => {
                                  setScene(cap);
                                  setSelectedCaptionIndex(i);
                                  setTimeout(() => {
                                    if (sceneTextareaRef.current) {
                                      const el = sceneTextareaRef.current;
                                      el.style.height = 'auto';
                                      el.style.height = `${el.scrollHeight}px`;
                                      el.focus();
                                    }
                                  }, 0);
                                }}
                              >
                                Use this
                              </button>
                              <button
                                type="button"
                                className={`${buttonClass} flex-1`}
                                onClick={() => {
                                  setScene(prev => (prev ? `${prev} ${cap}` : cap));
                                  setSelectedCaptionIndex(i);
                                  setTimeout(() => {
                                    if (sceneTextareaRef.current) {
                                      const el = sceneTextareaRef.current;
                                      el.style.height = 'auto';
                                      el.style.height = `${el.scrollHeight}px`;
                                      el.focus();
                                    }
                                  }, 0);
                                }}
                              >
                                Append
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="scene" className={formLabelClass}>
                  Scene Description
                </label>
                <textarea
                  id="scene"
                  ref={sceneTextareaRef}
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                  placeholder="e.g., A robot exploring a futuristic city at night"
                  className={`${formTextareaClass} overflow-hidden`}
                  disabled={loading}
                  rows={4}
                  required
                />
                <div className="text-right text-sm mt-2 pr-1">
                    <span className={`${getWordCountColor(wordCount)} transition-colors duration-200`}>
                        Total Prompt Words: {wordCount}
                    </span>
                    <span className="text-zinc-500"> (Recommended: 80-120)</span>
                </div>
              </div>
              <div>
                <label htmlFor="style" className={formLabelClass}>Style</label>
                <MultiSelect
                  options={styleMultiOptions}
                  value={style}
                  onChange={setStyle}
                  placeholder="Select styles..."
                  disabled={loading}
                />
              </div>
              {isNsfwMode && (
                <div>
                  <label htmlFor="nsfwStyle" className={`${formLabelClass} text-red-300`}>NSFW Style</label>
                  <MultiSelect
                    options={nsfwStyleMultiOptions}
                    value={nsfwStyle}
                    onChange={setNsfwStyle}
                    placeholder="Select NSFW styles..."
                    disabled={loading}
                  />
                </div>
              )}
               <div>
                <label htmlFor="protagonistAction" className={formLabelClass}>Protagonist Action</label>
                <MultiSelect
                  options={protagonistActionMultiOptions}
                  value={protagonistAction}
                  onChange={setProtagonistAction}
                  placeholder="Select actions..."
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="cameraAngle" className={formLabelClass}>Camera Angle</label>
                <MultiSelect
                  options={cameraAngleMultiOptions}
                  value={cameraAngle}
                  onChange={setCameraAngle}
                  placeholder="Select camera angles..."
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="cameraMovement" className={formLabelClass}>Camera Movement</label>
                <MultiSelect
                  options={cameraMovementMultiOptions}
                  value={cameraMovement}
                  onChange={setCameraMovement}
                  placeholder="Select camera movements..."
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="cameraDevice" className={formLabelClass}>Camera/Device</label>
                <MultiSelect
                  options={cameraDeviceMultiOptions}
                  value={cameraDevice}
                  onChange={setCameraDevice}
                  placeholder="Select camera/device..."
                  disabled={loading}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={formLabelClass}>Lighting</label>
                <p className="text-xs text-zinc-400 mb-3">
                  Select one or more lighting options to set the mood and atmosphere.
                </p>
                <MultiSelect
                  options={lightingOptions.map(opt => ({ value: opt, label: opt }))}
                  value={lighting}
                  onChange={setLighting}
                  placeholder="Select lighting options..."
                  disabled={loading}
                  maxHeight="250px"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading || !scene.trim() || lighting.length === 0 || !isApiKeySet}
                  className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500"
                >
                  {!isApiKeySet ? 'Enter API Key to Generate' : 'Generate Prompts'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;