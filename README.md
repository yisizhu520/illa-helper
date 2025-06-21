# Immersive Language Learning Assistant

<div align="center">
<img src="public/icon/128.png" width="100" height="100"  />
</div>
<div align="center">

![Version](https://img.shields.io/github/package-json/v/your-username/immersive-language-learning-assistant?color=blue)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Status](https://img.shields.io/badge/status-beta-orange)
![Built with WXT](https://img.shields.io/badge/built%20with-WXT-blue)

</div>

> A browser extension based on the "comprehensible input" theory to help you learn languages naturally while browsing the web.



English doc | [中文文档](./README_ZH.md)

## ✨ Core Philosophy

We firmly believe that the best way to learn a language is through extensive exposure to "comprehensible input," the famous **"i+1"** theory. This means content should be slightly above your current level—challenging but not incomprehensible. This extension aims to turn the entire internet into your personalized language learning material by intelligently replacing selected words with their translations in your target language, allowing you to naturally improve your vocabulary and language intuition while immersed in reading.

**🎯 Project Highlights**: Features a complete pronunciation learning ecosystem with phonetic notation, AI-powered definitions, dual TTS support, and interactive tooltips for a comprehensive learning experience from vocabulary translation to pronunciation mastery.

> 📚 **Complete Documentation**: See [Architecture & Features Guide](./ARCHITECTURE_AND_FEATURES.md) for technical architecture, API reference, development guide, and troubleshooting.

## 🚀 Features

### 🎯 Core Translation Engine
- **Intelligent Language Detection**: AI automatically identifies webpage source language, no need for users to manually specify language type
- **Intelligent Text Processing**: Uses AI large language models to analyze webpage content and intelligently select vocabulary suitable for user proficiency levels
- **Precise Replacement Control**: Precisely control translation ratio (1%-100%) with character-based calculation support
- **Context Awareness**: Considers context and user level to select the most appropriate translation vocabulary
- **Multi-language Support**: Supports 20+ languages intelligent translation (English, Japanese, Korean, French, German, Spanish, Russian, Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Turkish, Greek, etc.) **theoretically limited by AI model capabilities**.

### 🔊 Pronunciation Learning Ecosystem ⭐
- **Interactive Pronunciation Tooltips**: Hover over translated words to view phonetics, AI definitions, and pronunciation features
- **Dual-layer Learning Experience**: Phrases display interactive word lists, click individual words for detailed information
- **Multi-TTS Service Support**: Integrates Youdao TTS and Web Speech API, supports British/American pronunciation switching
- **Smart Phonetic Retrieval**: Automatically retrieves Dictionary API phonetic data with performance-optimized caching
- **AI Definition Explanations**: Real-time AI-generated Chinese definitions for more accurate understanding

### 🎨 Rich Visual Experience
- **7 Translation Styles**: Default, subtle, bold, italic, underlined, highlighted, learning mode (blur effect)
- **Learning Mode**: Translation words initially displayed blurred, clarified on hover to enhance memory
- **Glow Animation**: Gentle hint effects when new translated words appear, non-intrusive to reading
- **Responsive Design**: Auto-adapts to dark/light themes with intelligent tooltip positioning

### ⚙️ Highly Configurable
- **Smart Multi-language Mode**: Users only need to select target language, AI automatically detects source language and translates
- **User Level Adaptation**: 5 levels from beginner to advanced with AI-intelligent vocabulary difficulty adjustment
- **Trigger Modes**: Supports automatic trigger (process on page load) and manual trigger
- **Original Text Display Control**: Choose to show, hide, or learning mode display of translated original text
- **Paragraph Length Control**: Customize maximum text length for AI single processing
- **Pronunciation Feature Toggle**: Independent control of pronunciation tooltip functionality

### 🔌 Open API Integration
- **OpenAI API Compatible**: Supports any AI service compatible with OpenAI format (ChatGPT, Claude, domestic large models, etc.)
- **Flexible Configuration**: Customize API Key, Endpoint, model name, Temperature parameters
- **Smart Prompts**: Dynamically generate optimal prompts based on translation direction and user level
- **Error Handling**: Comprehensive API error handling and retry mechanisms

### 🚀 Performance & Optimization
- **Smart Caching**: Multi-level caching strategy for translation results, phonetic data, and TTS audio
- **Incremental Processing**: Only processes new content, avoiding duplicate translations
- **DOM Safety**: Uses Range API to ensure DOM structure integrity
- **Memory Management**: Timely cleanup of listeners and optimized memory usage

### 💻 Modern Technical Architecture
- **Tech Stack**: Vue 3 + TypeScript + WXT Framework
- **Modular Design**: High cohesion, low coupling modular architecture, easy to maintain and extend
- **Provider Pattern**: Plugin-based API service architecture, supports easy addition of new services
- **Cross-browser Compatibility**: Supports Chrome, Edge, Firefox, partial support for Safari

## 🌐 Browser Compatibility

This extension is built with [Web Extension API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) and [WXT](https://wxt.dev/), supporting the following browsers:

| Browser | Support Status | Notes |
|---------|----------------|-------|
| Chrome  | ✅ Fully Supported | Recommended environment, all features available |
| Edge    | ✅ Fully Supported | Chromium-based, full compatibility |
| Firefox | ✅ Supported | Core features normal, some TTS limitations |
| Safari  | ⚠️ Partially Supported | Requires additional configuration, see below |

## ⚡ Performance Features

### 🚀 Smart Caching System
- **Translation Results**: Smart caching based on content and settings, avoiding duplicate API calls
- **Phonetic Data**: 24-hour TTL local caching for improved response speed
- **TTS Audio**: Memory-level caching, no need to regenerate audio for the same word

### 🔄 Incremental Processing Mechanism
- **DOM Monitoring**: Only processes new content, avoiding duplicate translations
- **Debounce Optimization**: Smart delayed processing for dynamic content changes
- **Range API**: Precise DOM operations maintaining page structure integrity

### 📊 Performance Metrics
- **Translation Response Time**: < 2 seconds (400-character text)
- **Pronunciation Tooltip**: < 500ms response time
- **Memory Usage**: < 50MB stable operation
- **API Success Rate**: > 95% stable and reliable

> **Note**: Safari may require additional configuration steps, see [Safari Extension Guide](#safari-extension-installation).

## 📸 Feature Showcase

### 🎬 Dynamic Demo
<div align="center">
  <img src="images/Demo.gif" alt="Complete demonstration of immersive language learning assistant" style="max-width:80%; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1)"/>
  <p><i>🎯 Complete Demo: One-stop immersive experience from smart translation to pronunciation learning</i></p>
</div>

### 🎨 Theme Adaptation
<div style="width:100%" align="center">
  <img src="images/home-dark.png" alt="Dark theme translation effects" style="width:30%; margin:5px; border-radius:6px"/>
  <img src="images/home-dark1.png" alt="Dark theme variant" style="width:30%; margin:5px; border-radius:6px"/>
  <img src="images/home-light.png" alt="Light theme translation effects" style="width:30%; margin:5px; border-radius:6px"/>
  <p><i>🌗 Theme Adaptation: Smart dark/light theme switching with modern visual experience</i></p>
</div>

### 🌍 Multi-language Learning Scenarios
<div style="width:100%" align="center">
  <img src="images/cn-test.png" alt="Chinese learning scenario" style="width:45%; margin:5px; border-radius:6px"/>
  <img src="images/en-test.png" alt="English learning scenario" style="width:45%; margin:5px; border-radius:6px"/>
  <br/>
  <img src="images/jp-test.png" alt="Japanese learning scenario" style="width:45%; margin:5px; border-radius:6px"/>
  <img src="images/k-test.png" alt="Korean learning scenario" style="width:45%; margin:5px; border-radius:6px"/>
  <p><i>🧠 Smart Multi-language: AI automatic detection and translation for 20+ languages, covering mainstream learning languages including Chinese, English, Japanese, Korean, etc.</i></p>
</div>

## 📂 Project Architecture

### 🏗️ Overall Architecture

```
Immersive Language Learning Assistant
├── 🎯 Core Engine
│   ├── Smart Text Processing System (TextProcessor)
│   ├── AI Translation Service (ApiService)
│   └── Caching & Performance Optimization
├── 🔊 Pronunciation Ecosystem ⭐
│   ├── Phonetic Retrieval (Dictionary API)
│   ├── Speech Synthesis (Youdao TTS + Web Speech)
│   ├── Interactive Tooltips (TooltipRenderer)
│   └── AI Definition Explanations
├── 🎨 User Interface Layer
│   ├── Vue 3 Popup Settings Interface
│   ├── Dynamic Style Management (StyleManager)
│   └── Responsive Tooltip System
└── 🔧 Infrastructure
    ├── Cross-device Configuration Sync (StorageManager)
    ├── Extension Messaging System
    └── Cross-browser Compatibility Layer
```

### 📁 Directory Structure

```
.
├── .output/              # WXT build output directory
├── entrypoints/          # Extension entry points
│   ├── background.ts     # Background service (config validation, notification management)
│   ├── content.ts        # Content script (core translation logic)
│   └── popup/            # Vue 3 popup interface
│       ├── App.vue       # Main interface component
│       └── index.html    # Popup page
├── src/modules/          # Core functional modules
│   ├── pronunciation/    # 🔊 Pronunciation system module
│   │   ├── phonetic/     # Phonetic retrieval services
│   │   ├── tts/          # Speech synthesis services
│   │   ├── translation/  # AI translation integration
│   │   ├── services/     # Pronunciation service coordinator
│   │   ├── ui/           # Tooltip UI components
│   │   ├── utils/        # Utility function library
│   │   └── types/        # Type definitions
│   ├── apiService.ts     # AI translation API service
│   ├── textProcessor.ts  # Smart text processor
│   ├── textReplacer.ts   # Text replacement engine
│   ├── styleManager.ts   # Style manager
│   ├── storageManager.ts # Configuration storage management
│   ├── languageManager.ts# Multi-language support
│   ├── promptManager.ts  # AI prompt management
│   ├── messaging.ts      # Messaging system
│   └── types.ts          # Core type definitions
├── public/               # Static resources
│   ├── icon/             # Extension icons (16-128px)
│   └── warning.png       # Notification icon
├── docs/                 # 📚 Project documentation
│   └── ARCHITECTURE_AND_FEATURES.md  # Detailed technical documentation
├── .env.example          # Environment variable template
├── wxt.config.ts         # WXT framework configuration
└── package.json          # Project dependency configuration
```

### 🔧 Core Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern WebExtension development framework
- **Frontend**: Vue 3 + TypeScript + Vite
- **Build**: ESLint + Prettier + TypeScript compilation
- **API Integration**: OpenAI compatible interface + Dictionary API + Youdao TTS
- **Architecture Patterns**: Provider pattern + Modular design + Event-driven

> 📖 **Detailed Documentation**: [Architecture & Features Guide](./ARCHITECTURE_AND_FEATURES.md) - Contains complete technical architecture, API reference, and development guide

## 🛠️ Installation & Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://nodejs.org/)

### 2. Installation

1.  **Clone the repository:**
    
    ```bash
    git clone https://github.com/xiao-zaiyi/illa-helper.git
    cd illa-helper
    ```
    
2.  **Install dependencies:**
    
    ```bash
    npm install
    ```
    
> **Tip**: If you just want to use this extension without participating in development, please go directly to the [Releases](https://github.com/xiao-zaiyi/illa-helper/releases) page to download the latest packaged version.

### 3. Configuration

The project manages local development environment configuration through `.env` files.

1.  **Create .env file:**
    Copy the `.env.example` file to create your own local configuration file.
    ```bash
    cp .env.example .env
    ```

2.  **Edit configuration:**
    Open the newly created `.env` file. At minimum, you need to provide a valid API Key for the translation function to work properly.
    ```env
    VITE_WXT_DEFAULT_API_KEY="sk-your-real-api-key"
    # You can also override other default settings here
    VITE_WXT_DEFAULT_API_ENDPOINT="https://xxxxx/api/v1/chat/completions"
    VITE_WXT_DEFAULT_MODEL="gpt-4"
    VITE_WXT_DEFAULT_TEMPERATURE="0.2"
    ```
    > **Note**: The `.env` file has been added to `.gitignore`, so your keys won't be accidentally committed.

### 4. Run Development Environment

Execute the following commands, WXT will start the development server and package the extension for you.

```bash
npm run build 
npm run zip
```

### 5. Load the Extension

1.  Open your browser (Chrome, Edge, Firefox, etc.).
2.  Go to the extension management page (usually `chrome://extensions` or `edge://extensions`).
3.  Turn on **"Developer mode"**.
4.  Click **"Load unpacked"**.
5.  In the file selection window that appears, select the `.output/chrome-mv3/illa-helper-xx.zip` in the project root directory (or the corresponding folder for your browser).
6.  Done! You should now see the extension icon in your browser toolbar.

## ❓ FAQ

### Why do I need to provide an API key?

This extension uses AI technology for intelligent text translation, which requires an API service. You can use OpenAI's API key or any third-party service that's compatible with OpenAI's API format.

### How does the pronunciation feature work?

Our pronunciation system is a core feature providing a complete learning experience:
- **Phonetic Display**: Automatically retrieves Dictionary API phonetic data
- **AI Definitions**: Real-time AI-generated Chinese definition explanations
- **Dual TTS Support**: Youdao TTS (high quality) + Web Speech API (backup)
- **Interactive Tooltips**: Hover to view, supports British/American pronunciation switching
- **Phrase Learning**: Each word in phrases can be independently viewed and pronounced

### How to use Smart Multi-language Mode?

Smart multi-language mode is our new feature, easy to use:
1. **Select Translation Mode**: Choose "🧠 Smart Multi-language Mode" in settings
2. **Select Target Language**: Choose your learning language from 20+ supported languages
3. **Start Browsing**: AI automatically detects webpage language and translates to your target language
4. **No Additional Configuration**: System automatically handles different language webpage content

### Will the extension collect my browsing data?

No. This extension processes all webpage content locally and only sends text fragments that need translation to your configured API service. Pronunciation data is also cached locally to protect your privacy.

### Can I control the translation ratio?

Yes. The extension provides precise translation control:
- **Language Level**: 5 levels from beginner to advanced with AI-adjusted vocabulary difficulty
- **Replacement Ratio**: 1%-100% precise control with character-based calculation
- **Original Text Display**: Choose to show, hide, or learning mode (blur effects)
- **Smart Adaptation**: In smart mode, system automatically optimizes translation strategy based on detected language

### How to install on Safari? <a id="safari-extension-installation"></a>

Safari requires additional steps to package Web Extensions as Safari extensions. Please refer to [Apple's developer documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari).

## 🤝 Contributing

We welcome contributions of all kinds! Whether reporting bugs, suggesting new features, or directly contributing code.

### How to Contribute

1. **Submit Issues**
   - Use GitHub Issues to report bugs or suggest features
   - Clearly describe the problem or suggestion details
   - If it's a bug, please provide reproduction steps and environment information

2. **Contribute Code**
   - **Fork** this repository
   - Create a new branch (`git checkout -b feature/your-amazing-feature`)
   - Write and test your code
   - Ensure code follows the project's coding standards
   - Commit your changes (`git commit -m 'Add some amazing feature'`)
   - Push your branch to the remote repository (`git push origin feature/your-amazing-feature`)
   - Create a **Pull Request**

3. **Improve Documentation**
   - Documentation improvements are equally important to the project
   - Can fix typos, improve explanations, or add examples

### Development Guidelines

- **Architecture Principles**: Follow Provider pattern and modular design
- **Code Standards**: TypeScript strict mode, ESLint + Prettier formatting
- **Testing Requirements**: Ensure new features work properly on multiple browsers and websites
- **Performance Considerations**: Pay attention to DOM operation efficiency and memory management
- **API Compatibility**: Maintain backward compatibility with existing API interfaces

> 📖 **Detailed Development Guide**: See [Architecture & Features Guide](./ARCHITECTURE_AND_FEATURES.md) for complete development environment setup, code structure explanations, and best practices.

## 📜 License

This project is open-sourced under the [MIT License](./LICENSE). You are free to use, modify, and distribute this code, including for commercial purposes.