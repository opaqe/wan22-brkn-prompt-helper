# WAN 2.2 - BRKN AI Prompt Generator

A powerful AI-powered prompt generation tool built with React, TypeScript, and Google's Gemini AI. Generate creative prompts for various content types including images, videos, JSON data, and more.

## 🚀 Features

- **Multi-format Prompt Generation**: Create prompts for images, videos, clapperboard scenes, JSON data, and custom formats
- **Multi-Select Dropdowns**: Choose multiple options for Style, NSFW Style, Actions, Camera Angles, Movements, and Lighting
- **Enhanced AI Caption Generation**: Advanced physical description prompting for protagonist-focused images with detailed physicality guidance
- **Provider-agnostic LLM selection**: Choose between Google Gemini, OpenAI, Anthropic, Stability AI, and Perplexity directly in the app
- **AI-Powered Suggestions**: Intelligent prompt generation powered by your selected provider (Gemini by default)
- **Interactive UI**: Modern, responsive interface built with Radix UI components
- **Real-time Generation**: Fast and efficient prompt creation with loading states
- **Customizable Settings**: Configurable AI parameters and preferences
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **LLM Integration**: Multi-provider router (Gemini, Qwen, Ollama, LM Studio, OpenAI, Anthropic, Stability AI, Perplexity)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: Bun

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org)
- **Package Manager**: npm (included with Node.js) or [Bun](https://bun.sh) (optional, faster)
- **Operating System**: Windows 10/11, macOS, or Linux
- **API Key**: At least one supported LLM provider (see configuration section below)

### Windows Users
The provided batch files (`install-windows.bat` and `start-ui.bat`) are compatible with:
- Windows 10 (all versions)
- Windows 11 (all versions)
- Both Command Prompt and PowerShell environments
- Systems with or without ANSI color support

## 🚀 Recent Updates

### Version 2.3.0 - Three-Part Generation System & Enhanced Prompting

**🎯 Three-Part Prompt Generation:**
- **Progressive Building** - Generates prompts in three stages to avoid token limits and improve quality
  - Part 1: Caption & Character (Subject + Scene descriptions)
  - Part 2: Action & Scene Dynamics (Motion details)
  - Part 3: Camera & Cinematography (Final prompts with camera work)
- **Visual Feedback** - Progress bar and step indicators show generation status
- **Better Quality** - More focused AI attention on each aspect of the prompt

**✨ WAN 2.2 Structure Compliance:**
- **Proper Structure** - Follows official WAN 2.2 framework: [Subject] + [Scene] + [Motion] + [Camera Work] + [Visual Style/Lighting]
- **Normal Mode** - Optimized for standard cinematic video generation
- **NSFW Mode** - Action-focused with explicit, anatomically precise descriptions
- **No Euphemisms** - NSFW mode uses proper terminology and detailed physical interactions

**🤖 Enhanced AI Instructions:**
- **Action Priority** - NSFW mode emphasizes detailed action descriptions with specific body parts, movements, and positions
- **Explicit Clarity** - Uses anatomically correct terms and explicit verbs for NSFW content
- **Provider Support** - All providers (Gemini, Qwen, Ollama, LM Studio) support the new system

**🎨 Previous Features (v2.2.1):**
- Multi-Select Dropdowns for all creative controls
- Enhanced AI Caption Generation with physical descriptions
- Updated Gemini Model (`gemini-2.5-flash`)
- Improved JSON parsing across all providers

### Version 2.2 - Multi-Provider Support & Enhanced Windows Compatibility

**🤖 New AI Providers:**
- **LM Studio** - Full local API support for any loaded model
- **Enhanced Gemini** - Optional custom base URL configuration  
- **Improved Qwen** - Configurable DashScope endpoint
- **Better Ollama** - Enhanced local server configuration

**🔧 Enhanced Windows Compatibility:**
- **Improved Batch Files** - Better error handling and Windows 10/11 support
- **ANSI Color Support** - Automatic fallback for older systems
- **Robust Detection** - Enhanced package manager and dependency checking
- **Better Error Messages** - More helpful troubleshooting information

**⚙️ Configuration Improvements:**
- All providers now support custom local addresses
- Secure localStorage for all settings
- Enhanced settings UI with provider-specific fields
- Comprehensive setup documentation

## 🚀 Quick Start

### Windows Users (Easy Install)

For Windows users, we provide convenient batch files for easy setup:

1. **Clone the repository**
   ```bash
   git clone https://github.com/NUVoize/wan22-brkn-prompt-helper.git
   cd wan22-brkn-prompt-helper
   ```

2. **Run the Windows installer**
   ```bash
   install-windows.bat
   ```
   This will:
   - Check prerequisites (Node.js, npm/Bun)
   - Install dependencies automatically
   - Offer to start the development server
   - Open the app in your browser

3. **Start the app later (optional)**
   ```bash
   start-ui.bat
   ```

### Manual Installation (All Platforms)

1. **Clone the repository**
   ```bash
   git clone https://github.com/NUVoize/wan22-brkn-prompt-helper.git
   cd wan22-brkn-prompt-helper
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

5. **Select provider and add your API key**
   In the app, click the gear icon (Settings) → choose your LLM provider → paste your API key → Save.
   Keys are stored securely in your browser's localStorage; no .env is required for normal use.

## 📁 Project Structure

```
services/                    # LLM provider services (root-level)
├── llm/router.ts           # Provider-agnostic LLM router
├── geminiService.ts        # Google Gemini AI integration
└── providers/              # Additional provider implementations
    ├── qwenService.ts      # Qwen (DashScope) integration
    ├── ollamaService.ts    # Ollama local integration  
    └── lmStudioService.ts  # LM Studio local integration

src/
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/UI components
│   │   ├── multi-select.tsx  # Multi-select dropdown component
│   │   └── ...          # Other UI components
│   ├── icons/           # Custom icon components
│   ├── Header.tsx       # App header
│   ├── Footer.tsx       # App footer
│   ├── SettingsDialog.tsx  # Settings configuration
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Main page with prompt generation
│   └── NotFound.tsx     # 404 page
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities
├── hooks/               # Custom React hooks
└── styles/              # Global styles
```

## 🔧 Configuration

### LLM Providers & API Keys

This app supports multiple providers via the in-app Settings dialog:

#### **Google Gemini** (Recommended)
- **API Key**: Get from [Google AI Studio](https://ai.google.dev/gemini-api/docs/get-started)
- **Custom Base URL**: Optional (leave empty for default Google endpoint)
- **Models**: Uses `gemini-2.5-flash` for optimal performance and enhanced multimodal capabilities
- **Google Cloud console**: [API key management](https://console.cloud.google.com/apis/credentials)

#### **Qwen (DashScope)**
- **API Key**: Get from [Alibaba Cloud DashScope](https://dashscope.aliyuncs.com/)
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1` (configurable)
- **Models**: Uses `qwen2.5-vl-32b-instruct`

#### **Ollama (Local)**
- **Base URL**: `http://localhost:11434` (default, configurable)
- **Model**: `qwen2.5-vl:32b` (configurable)  
- **Setup**: Install [Ollama](https://ollama.ai/) and run: `ollama pull qwen2.5-vl:32b`

#### **LM Studio (Local)** ✨ New!
- **Base URL**: `http://localhost:1234` (default, configurable)
- **Model**: Any loaded vision-capable model (configurable)
- **Setup**: Install [LM Studio](https://lmstudio.ai/), load a model, and start the local server

#### **Other Providers** (Framework Ready)
- OpenAI: [API key creation](https://platform.openai.com/api-keys) | [Docs](https://platform.openai.com/docs)
- Anthropic (Claude): [Console](https://console.anthropic.com/) | [Docs](https://docs.anthropic.com/)  
- Stability AI: [Account & keys](https://platform.stability.ai/account/keys) | [Docs](https://platform.stability.ai/docs)
- Perplexity AI: [Perplexity Labs](https://www.perplexity.ai/pro) | [API docs](https://docs.perplexity.ai/)

*Note: Non-Gemini/Qwen/Ollama/LMStudio providers may fall back to Gemini until direct integrations are enabled.*

### How keys are stored

- Open Settings (gear icon) → choose a Provider → paste your API key/configure URLs → Save.
- Keys and settings are stored in localStorage under:
  - `GEMINI_API_KEY`, `GEMINI_BASE_URL` (optional)
  - `QWEN_API_KEY`, `QWEN_BASE_URL`
  - `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
  - `LM_STUDIO_BASE_URL` (default: `http://localhost:1234`), `LM_STUDIO_MODEL`
  - Plus keys for other providers: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
- The active provider is stored under `LLM_PROVIDER`.

All settings are stored securely in your browser's localStorage - no .env files needed!

## 🎨 Available Prompt Types

- **🖼️ Image Prompts**: Generate descriptive prompts for image creation
- **🎬 Video Prompts**: Create prompts for video content generation
- **🎞️ Clapperboard**: Generate film/video scene descriptions
- **📄 JSON Data**: Create structured data prompts
- **💡 Custom Ideas**: General-purpose creative prompts

## 🚀 Build Commands

```bash
# Development server
bun run dev

# Production build
bun run build

# Development build
bun run build:dev

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 🌐 Deployment

This project is configured for deployment on Vercel and other modern hosting platforms.

1. **Build the project**
   ```bash
   bun run build
   ```

2. **Deploy to your preferred platform**
   - Vercel: Connect your GitHub repository
   - Netlify: Upload the `dist` folder
   - Other platforms: Use the generated `dist` folder

## 🔧 Development

### Adding New Prompt Types

1. Create an icon component in `src/components/icons/`
2. Add the prompt type to the main interface
3. Update the Gemini service to handle the new type
4. Test the integration

### Styling Guidelines

- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Maintain accessibility standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 🛡️ Usage Policy (Personal Use Only)

This software is provided for non-commercial use only. You may use, copy, and modify it solely for personal, educational, research, or internal evaluation purposes.

Prohibited uses include, without limitation:
- Any form of commercial use, monetization, or profit-generating activity
- Offering the software or its outputs as part of a paid product, service, SaaS, or API
- Charging for access, hosting paid instances, reselling, sublicensing, or bundling in commercial offerings
- Advertising-supported distribution or any use intended to derive revenue

Commercial licensing:
- For any commercial use, you must obtain prior written permission and a commercial license from BRKN.TRIB.
- Contact: brkn.trib@gmail.com or via GitHub to request permission.

Compliance note: This policy is enforced by the project’s license.

## 📄 License

This project is licensed under the PolyForm Noncommercial License 1.0.0. Commercial use requires a separate license from BRKN.TRIB. See the LICENSE file for full terms.


## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/NUVoize/wan22-brkn-prompt-helper/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for the AI capabilities
- [Radix UI](https://www.radix-ui.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide](https://lucide.dev/) for the beautiful icons

---

Made with ❤️ by the BRKN team