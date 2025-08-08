import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "../hooks/use-toast";
import { Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const ACTIVE_PROVIDER_KEY = 'LLM_PROVIDER';

const KEYS = {
  gemini: 'GEMINI_API_KEY',
  qwen: 'QWEN_API_KEY',
  ollamaBase: 'OLLAMA_BASE_URL',
  ollamaModel: 'OLLAMA_MODEL',
} as const;

type Provider = 'gemini' | 'qwen' | 'ollama';

const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>('gemini');

  // Fields
  const [geminiKey, setGeminiKey] = useState("");
  const [qwenKey, setQwenKey] = useState("");
  const [ollamaBase, setOllamaBase] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5-vl:32b");

  useEffect(() => {
    try {
      const p = (window.localStorage.getItem(ACTIVE_PROVIDER_KEY) as Provider) || 'gemini';
      setProvider(p);
      setGeminiKey(window.localStorage.getItem(KEYS.gemini) || "");
      setQwenKey(window.localStorage.getItem(KEYS.qwen) || "");
      setOllamaBase(window.localStorage.getItem(KEYS.ollamaBase) || "http://localhost:11434");
      setOllamaModel(window.localStorage.getItem(KEYS.ollamaModel) || "qwen2.5-vl:32b");
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      window.localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
      if (provider === 'gemini') {
        window.localStorage.setItem(KEYS.gemini, geminiKey.trim());
        toast({ title: "Saved", description: "Gemini API key stored locally." });
      } else if (provider === 'qwen') {
        window.localStorage.setItem(KEYS.qwen, qwenKey.trim());
        toast({ title: "Saved", description: "Qwen (DashScope) API key stored locally." });
      } else if (provider === 'ollama') {
        window.localStorage.setItem(KEYS.ollamaBase, ollamaBase.trim());
        window.localStorage.setItem(KEYS.ollamaModel, ollamaModel.trim());
        toast({ title: "Saved", description: "Ollama base URL and model stored locally." });
      }
      setOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    }
  };

  const handleClear = () => {
    try {
      if (provider === 'gemini') {
        window.localStorage.removeItem(KEYS.gemini);
        setGeminiKey("");
      } else if (provider === 'qwen') {
        window.localStorage.removeItem(KEYS.qwen);
        setQwenKey("");
      } else if (provider === 'ollama') {
        window.localStorage.removeItem(KEYS.ollamaBase);
        window.localStorage.removeItem(KEYS.ollamaModel);
        setOllamaBase("http://localhost:11434");
        setOllamaModel("qwen2.5-vl:32b");
      }
      toast({ title: "Cleared", description: "Provider credentials cleared." });
      setOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not clear settings.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Open settings"
          className="fixed bottom-4 right-4 shadow-md"
        >
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Choose provider and manage credentials</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="qwen">Qwen (DashScope)</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Active provider is stored locally and used immediately.</p>
          </div>

          {provider === 'gemini' && (
            <div className="grid gap-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="Paste your Gemini API key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                aria-label="Gemini API Key"
              />
            </div>
          )}

          {provider === 'qwen' && (
            <div className="grid gap-2">
              <Label htmlFor="qwen-key">Qwen (DashScope) API Key</Label>
              <Input
                id="qwen-key"
                type="password"
                placeholder="Paste your DashScope API key"
                value={qwenKey}
                onChange={(e) => setQwenKey(e.target.value)}
                aria-label="Qwen (DashScope) API Key"
              />
              <p className="text-xs text-muted-foreground">Uses OpenAI-compatible endpoint at dashscope.aliyuncs.com.</p>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="ollama-base">Ollama Base URL</Label>
                <Input
                  id="ollama-base"
                  placeholder="http://localhost:11434"
                  value={ollamaBase}
                  onChange={(e) => setOllamaBase(e.target.value)}
                  aria-label="Ollama Base URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ollama-model">Ollama Model</Label>
                <Input
                  id="ollama-model"
                  placeholder="qwen2.5-vl:32b"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  aria-label="Ollama Model"
                />
                <p className="text-xs text-muted-foreground">Ensure the model is pulled (e.g., `ollama run qwen2.5-vl:32b`).</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClear}>Clear</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
