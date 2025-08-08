import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "../hooks/use-toast";
import { Settings } from "lucide-react";

const LS_KEY = "GEMINI_API_KEY";

const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(LS_KEY) || "";
      setApiKey(existing);
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      window.localStorage.setItem(LS_KEY, apiKey.trim());
      toast({ title: "Saved", description: "Gemini API key stored locally." });
      setOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not save API key.", variant: "destructive" });
    }
  };

  const handleClear = () => {
    try {
      window.localStorage.removeItem(LS_KEY);
      setApiKey("");
      toast({ title: "Cleared", description: "Gemini API key removed." });
      setOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not clear API key.", variant: "destructive" });
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
          <DialogDescription>Manage your API configuration</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="Paste your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              aria-label="Gemini API Key"
            />
            <p className="text-xs text-muted-foreground">
              Stored in your browser only (localStorage). Not sent to our servers.
            </p>
          </div>
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
