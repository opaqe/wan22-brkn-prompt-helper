
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

const lightingOptions = [
    'Golden Hour', 'Neon', 'Moody', 'Bright Daylight', 'Dramatic Shadows', 
    'Rim Light', 'Soft Key Light', 'Hard Light', 'Backlight', 
    'Three-Point Lighting', 'High-Key Lighting', 'Low-Key Lighting', 
    'Chiaroscuro', 'Volumetric Lighting', 'Top Light', 'Underlighting'
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
    'Standing still', 'Walking towards camera', 'Walking away from camera', 'Running', 'Sitting down',
    'Looking at themself in a mirror', 'Dancing', 'Jumping with joy', 'Turning their back', 'Looking directly at the camera',
    'Interacting with an object', 'Crying', 'Laughing', 'Fighting', 'Exploring the environment', 'Driving a car',
    'Riding a skateboard', 'Riding a bicycle', 'Riding a horse', 'Swimming', 'Typing on a keyboard', 'Talking on the phone',
    'Reading a book', 'Opening a door', 'Painting on a canvas', 'Playing a guitar', 'Cooking a meal',
    'Eating a meal', 'Working out', 'Meditating', 'Singing',
];

// NSFW 18+ Options
const nsfwStyleOptions = [
    'Erotic', 'Sensual', 'Intimate Portrait', 'Dark Fantasy', 'Provocative', 
    'Boudoir', 'Taboo', 'Gritty Realism', 'Film Noir', 'Neo-Noir', 'Arthouse',
    'Baroque', 'Giallo', 'Soft-focus Dream'
];
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
    'Static', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out',
    'Dolly In', 'Dolly Out', 'Truck Left', 'Truck Right', 'Crane Up', 'Crane Down',
    'Handheld', 'Drone Shot', 'Tracking Shot', 'Roll Clockwise', 'Roll Counter-Clockwise'
];

const App: React.FC = () => {
  const [scene, setScene] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [protagonistAction, setProtagonistAction] = useState<string>('');
  const [cameraAngle, setCameraAngle] = useState<string>('');
  const [cameraMovement, setCameraMovement] = useState<string>('');
  const [lighting, setLighting] = useState<string[]>([]);
  
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isCaptioning, setIsCaptioning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    const styleWords = countWords(style);
    const actionWords = countWords(protagonistAction);
    const angleWords = countWords(cameraAngle);
    const movementWords = countWords(cameraMovement);
    const lightingWords = countWords(lighting.join(' '));

    const totalWords = sceneWords + styleWords + actionWords + angleWords + movementWords + lightingWords;
    setWordCount(totalWords);

  }, [scene, style, protagonistAction, cameraAngle, cameraMovement, lighting]);

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
        setStyle('');
        setProtagonistAction('');
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
          const caption = await generateCaptionFromImage({
              imageData: base64Data,
              mimeType: imageFile.type,
          });
          setScene(caption);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred during captioning.');
      } finally {
          setIsCaptioning(false);
      }
  };

  const handleLightingChange = (option: string) => {
    setLighting(prev => 
        prev.includes(option) 
            ? prev.filter(item => item !== option) 
            : [...prev, option]
    );
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
        style, 
        protagonistAction, 
        cameraAngle, 
        cameraMovement, 
        lighting: lighting.join(', '),
        isNsfw: isNsfwMode 
      });
      setPrompts(generatedPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [scene, style, protagonistAction, cameraAngle, cameraMovement, lighting, loading, isNsfwMode]);

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
  
  const currentStyleOptions = isNsfwMode ? nsfwStyleOptions : styleOptions;
  const currentProtagonistActionOptions = isNsfwMode ? nsfwProtagonistActionOptions : protagonistActionOptions;

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="scene" className={formLabelClass}>
                  Scene Description
                </label>
                <textarea
                  id="scene"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  placeholder="e.g., A robot exploring a futuristic city at night"
                  className={formTextareaClass}
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
                <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className={formSelectClass} disabled={loading}>
                  <option value="">None</option>
                  {currentStyleOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="protagonistAction" className={formLabelClass}>Protagonist Action</label>
                <select id="protagonistAction" value={protagonistAction} onChange={(e) => setProtagonistAction(e.target.value)} className={formSelectClass} disabled={loading}>
                  <option value="">None</option>
                  {currentProtagonistActionOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cameraAngle" className={formLabelClass}>Camera Angle</label>
                <select id="cameraAngle" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} className={formSelectClass} disabled={loading}>
                  <option value="">None</option>
                  {cameraAngleOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cameraMovement" className={formLabelClass}>Camera Movement</label>
                <select id="cameraMovement" value={cameraMovement} onChange={(e) => setCameraMovement(e.target.value)} className={formSelectClass} disabled={loading}>
                   <option value="">None</option>
                   {cameraMovementOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className={formLabelClass}>Lighting</label>
                <p className="text-xs text-zinc-400 mb-3">
                  Select one or more. e.g., Soft key light, harsh rim light in warmer tones, and a purple top light.
                </p>
                <div className="flex flex-wrap gap-2">
                  {lightingOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleLightingChange(option)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 ${
                        lighting.includes(option)
                          ? 'bg-red-500 text-white font-semibold shadow'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
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