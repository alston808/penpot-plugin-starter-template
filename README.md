# Penpot AI Layout Generator

🎨 **Generate multi-layout design variations from text prompts using AI**

This Penpot plugin uses OpenRouter to power AI-driven layout generation, allowing you to create multiple design variations from simple text descriptions. The plugin features a beautiful dark glass interface with rainbow accents and provides both free and paid AI model options.

## ✨ Features

- **AI-Powered Layout Generation**: Generate multiple layout variations from text prompts
- **Multiple AI Models**: Choose from free models (Claude 3 Haiku, Llama, etc.) or paid models (GPT-4o, Claude 3.5 Sonnet, etc.)
- **Dark Glass UI**: Beautiful interface with rainbow gradient backgrounds and glassmorphism effects
- **Frame Integration**: Apply generated layouts directly to selected Penpot frames
- **Settings Persistence**: API keys and model preferences are saved locally
- **Responsive Design**: Works seamlessly in Penpot's plugin panel

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js with npm
- Git
- A Penpot account
- An OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd penpot-plugin
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```

4. **Load in Penpot:**
   - Open Penpot and press `Ctrl + Alt + P` to open Plugin Manager
   - Enter manifest URL: `http://localhost:4400/manifest.json`
   - Install and use the plugin

## ⚙️ Configuration

### API Key Setup

1. Get your API key from [OpenRouter](https://openrouter.ai/keys)
2. Open the plugin's settings panel (click "⚙️ Settings")
3. Enter your API key in the "OpenRouter API Key" field
4. The key is stored locally in your browser

### Model Selection

Choose between **Free** and **Paid** models:

**Free Models:**
- Claude 3 Haiku (Anthropic)
- Llama 3.2 3B (Meta)
- WizardLM-2 8x22B (Microsoft)
- Gemma 7B (Google)

**Paid Models:**
- Claude 3.5 Sonnet (Anthropic)
- GPT-4o (OpenAI)
- GPT-4o Mini (OpenAI)
- Claude 3 Opus (Anthropic)
- Gemini Pro (Google)

## 📖 Usage

1. **Select a Frame:** Choose a target frame from your Penpot design
2. **Enter Prompt:** Describe the layout you want (e.g., "A modern dashboard with sidebar, header, and content area")
3. **Configure Settings:** Set your API key and choose an AI model
4. **Generate:** Click "Generate Layouts" to create variations
5. **Apply:** Review the generated layouts and click "Apply Layout" on your favorite

## 🛠️ Development

### Project Structure

```
penpot-plugin/
├── index.html          # Main UI layout
├── src/
│   ├── main.ts         # Frontend logic and UI interactions
│   ├── plugin.ts       # Penpot API integration and AI calls
│   └── style.css       # Dark glass theme with rainbow accents
├── public/
│   └── manifest.json   # Plugin metadata and permissions
└── package.json        # Dependencies and scripts
```

### Key Technologies

- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Penpot Plugin API**: Integration with Penpot
- **OpenRouter API**: AI model access
- **CSS Glassmorphism**: Modern UI effects

### Building for Production

```bash
bun run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🚀 Deployment

### Cloudflare Pages Deployment

This plugin is configured for easy deployment on Cloudflare Pages:

#### Option 1: Direct Upload
```bash
bun run build
# Then upload the `dist/` folder to Cloudflare Pages dashboard
```

#### Option 2: Using Wrangler CLI
```bash
bun add -g wrangler
bun run deploy
```

#### Option 3: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### Manual Deployment

For other hosting providers, simply upload the contents of the `dist/` folder to your web server. Ensure your server supports:

- Serving static files
- Proper CORS headers (configured in `_headers`)
- HTTPS (required for Penpot plugins)

### Plugin Installation URL

After deployment, your plugin will be available at:
```
https://your-domain.pages.dev/manifest.json
```

Load this URL in Penpot's Plugin Manager (Ctrl+Alt+P).

## 🔧 API Permissions

The plugin requires these Penpot permissions:
- `content:read` - Read design content
- `content:write` - Create and modify design elements
- `library:read` - Access design libraries
- `library:write` - Modify design libraries

## 🎨 UI Features

- **Rainbow Gradient Background**: Animated background with full spectrum colors
- **Glassmorphism Effects**: Translucent panels with backdrop blur
- **Responsive Design**: Adapts to plugin panel size
- **Theme Support**: Automatically matches Penpot's light/dark theme
- **Smooth Animations**: Hover effects and loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Penpot
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

**Plugin not loading?**
- Ensure the dev server is running on port 4400
- Check that the manifest URL is correct in Plugin Manager
- Verify all dependencies are installed

**AI generation failing?**
- Confirm your OpenRouter API key is valid
- Check your internet connection
- Try switching to a different AI model

**Layouts not applying?**
- Ensure you have a frame selected
- Check that the target frame exists and is accessible
- Try refreshing the plugin

## 📚 Resources

- [Penpot Plugin Documentation](https://help.penpot.app/plugins/)
- [Penpot Plugin Samples](https://github.com/penpot/penpot-plugins-samples)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Penpot Community](https://community.penpot.app/)
