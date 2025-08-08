# WAN 2.2 - BRKN AI Prompt Generator

A powerful AI-powered prompt generation tool built with React, TypeScript, and Google's Gemini AI. Generate creative prompts for various content types including images, videos, JSON data, and more.

## 🚀 Features

- **Multi-format Prompt Generation**: Create prompts for images, videos, clapperboard scenes, JSON data, and custom formats
- **AI-Powered Suggestions**: Leverages Google Gemini AI for intelligent prompt generation
- **Interactive UI**: Modern, responsive interface built with Radix UI components
- **Real-time Generation**: Fast and efficient prompt creation with loading states
- **Customizable Settings**: Configurable AI parameters and preferences
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **AI Integration**: Google Generative AI (Gemini)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js (v18 or higher)
- Bun package manager
- Google Gemini API Key

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

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── icons/          # Custom icon components
│   ├── Header.tsx      # App header
│   ├── Footer.tsx      # App footer
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Main page
│   └── NotFound.tsx    # 404 page
├── services/           # API services
│   └── geminiService.ts # Gemini AI integration
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### API Configuration

The app uses Google's Gemini AI API. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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