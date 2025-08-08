# WAN 2.2 - BRKN AI Prompt Generator

A powerful AI-powered prompt generation tool built with React, TypeScript, and Google's Gemini AI. Generate creative prompts for various content types including images, videos, JSON data, and more.

## 🚀 Features

- **Multi-format Prompt Generation**: Create prompts for images, videos, clapperboard scenes, JSON data, and custom formats
- **Provider-agnostic LLM selection**: Choose between Google Gemini, OpenAI, Anthropic, Stability AI, and Perplexity directly in the app
- **AI-Powered Suggestions**: Intelligent prompt generation powered by your selected provider (Gemini by default)
- **Interactive UI**: Modern, responsive interface built with Radix UI components
- **Real-time Generation**: Fast and efficient prompt creation with loading states
- **Customizable Settings**: Configurable AI parameters and preferences
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **LLM Integration**: Provider-agnostic router (Gemini, OpenAI, Anthropic, Stability AI, Perplexity)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js (v18 or higher)
- Bun package manager
- An API key for at least one supported LLM provider (see links below)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/NUVoize/wan22-brkn-prompt-helper.git
   cd wan22-brkn-prompt-helper
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

5. **Select provider and add your API key**
   In the app, click the gear icon (Settings) → choose your LLM provider → paste your API key → Save.
   Keys are stored securely in your browser's localStorage; no .env is required for normal use.

## 📁 Project Structure

```
services/               # LLM provider services (root-level)
├── llm/router.ts       # Provider-agnostic LLM router (select & store keys)
└── geminiService.ts    # Gemini AI integration

src/
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/UI components
│   ├── icons/           # Custom icon components
│   ├── Header.tsx       # App header
│   ├── Footer.tsx       # App footer
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Main page
│   └── NotFound.tsx     # 404 page
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities
├── hooks/               # Custom React hooks
└── styles/              # Global styles
```

## 🔧 Configuration

### LLM Providers & API Keys

This app supports multiple providers via the in-app Settings dialog:
- Google Gemini
  - API docs & key creation: https://ai.google.dev/gemini-api/docs/get-started
  - Google Cloud console (key management): https://console.cloud.google.com/apis/credentials
- OpenAI
  - API key creation: https://platform.openai.com/api-keys
  - Docs: https://platform.openai.com/docs
- Anthropic (Claude)
  - Sign up & get API key: https://console.anthropic.com/
  - Docs: https://docs.anthropic.com/
- Stability AI (Stable Diffusion, etc.)
  - Account & key creation: https://platform.stability.ai/account/keys
  - Docs: https://platform.stability.ai/docs
- Perplexity AI (API is limited, currently via Pro)
  - Sign up for Perplexity Labs: https://www.perplexity.ai/pro
  - API docs (currently closed beta): https://docs.perplexity.ai/

### How keys are stored

- Open Settings (gear icon) → choose a Provider → paste your API key → Save.
- Keys are stored in localStorage under:
  - `GEMINI_API_KEY`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `STABILITY_API_KEY`
  - `PERPLEXITY_API_KEY`
- The active provider is stored under `LLM_PROVIDER`.

Note: Non-Gemini providers may currently fall back to Gemini until their direct integrations are enabled (see `services/llm/router.ts`).

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