# PDF to Audio API

A FastAPI application that converts PDF documents to audio overviews using Gemini AI and text-to-speech, similar to Google NotebookLM.

## Setup

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

2. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Usage

1. Start the server with uv:
```bash
uv run --with fastapi --with uvicorn --with python-multipart --with PyPDF2 --with google-generativeai --with gtts --with python-dotenv uvicorn main:app --host 0.0.0.0 --port 8000
```

2. Upload a PDF to get an audio overview:
```bash
curl -X POST "http://localhost:8000/pdf-to-notebooklm-audio" \                                                 
       -F "file=@<path-to-your-pdf-file>" \
       --output <output-file-name>.wav
```

## API Endpoints

- `GET /` - Health check
- `POST /pdf-to-notebooklm-audio` - Upload PDF and get audio overview

## Features

- PDF text extraction
- AI-powered content summarization using Gemini
- Text-to-speech conversion
- Temporary file cleanup
- Error handling for invalid files