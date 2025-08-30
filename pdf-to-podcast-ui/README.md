# PDF to Podcast Web UI

A modern, responsive web application that transforms PDF documents into engaging podcast-style conversations using AI. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### Core Functionality
- **Drag & Drop Upload**: Intuitive file upload with visual feedback
- **Real-time Processing**: Live progress tracking through 5 stages
- **Audio Player**: Full-featured player with speed control, seeking, and volume
- **Mobile Responsive**: Seamless experience across all devices
- **Error Handling**: Comprehensive error states and user feedback

### User Experience
- **Clean Design**: Minimalist interface inspired by Linear and Notion
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Loading States**: Skeleton screens and progress indicators
- **File Management**: Download and share generated audio files

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PDF to Podcast API running on `http://localhost:8000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

### Environment Configuration

Create a `.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
```

## 🎯 User Journey

### 1. Upload Phase
- Drag and drop or click to upload PDF files (max 10MB)
- Real-time validation with helpful error messages
- File preview with size and name display

### 2. Processing Phase
5 clear processing stages with progress tracking:
- **Upload**: File transfer to server
- **Text Extraction**: Document analysis
- **Script Generation**: AI conversation creation  
- **Audio Creation**: Multi-speaker voice synthesis
- **Finalizing**: Audio file preparation

### 3. Playback Phase
- Professional audio player with waveform visualization
- Full playback controls (play/pause, skip, speed, volume)
- Download and share functionality

## 🏗️ Architecture

### Component Structure
```
src/
├── components/          # React components
├── hooks/              # Custom hooks
├── stores/             # Zustand state management
├── types/              # TypeScript definitions
└── utils/              # API utilities
```

### Key Technologies
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Dropzone** for file uploads

## 📱 Responsive Design

- **Mobile**: Touch-optimized controls, single column
- **Tablet**: Enhanced layout with larger controls
- **Desktop**: Full feature set with keyboard shortcuts

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production

### `npm run eject`
Ejects from Create React App (one-way operation)

## 📄 License

Built using Create React App. See [CRA documentation](https://facebook.github.io/create-react-app/docs/getting-started) for more details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
