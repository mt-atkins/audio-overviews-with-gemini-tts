from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import random
import PyPDF2
import tempfile
import os
import io
import base64
import mimetypes
import struct
from google import genai
from google.genai import types
import uuid
from dotenv import load_dotenv
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="NotebookLM-style PDF to Audio API", description="Multi-speaker conversational PDF to audio using Gemini 2.5")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Available voice options (from Gemini API supported voices)
AVAILABLE_VOICES = [
    "zephyr",       # Warm, analytical voice
    "puck",         # Enthusiastic, explanatory voice
    "alnilam",      # Clear, professional voice
    "charon",       # Deep, authoritative voice
    "fenrir",       # Strong, confident voice
    "leda",         # Gentle, engaging voice
    "aoede",        # Melodic, pleasant voice
    "callirrhoe",   # Smooth, conversational voice
]

# Default speaker names pool
DEFAULT_SPEAKER_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
    "Blake", "Sage", "Drew", "Parker", "Emery", "Rowan", "Finley", "Hayden"
]

# Tone presets
TONE_PRESETS = {
    "conversational": {
        "name": "Conversational",
        "description": "Natural, friendly discussion",
        "prompt_addition": "Make this conversation natural and friendly, like two colleagues discussing the topic over coffee."
    },
    "educational": {
        "name": "Educational", 
        "description": "Informative, teacher-student style",
        "prompt_addition": "Make this an educational discussion where one speaker teaches and the other asks clarifying questions like an engaged student."
    },
    "analytical": {
        "name": "Analytical",
        "description": "Deep dive, research-focused",
        "prompt_addition": "Make this an analytical deep-dive conversation, focusing on key insights, implications, and detailed analysis of the content."
    },
    "debate": {
        "name": "Debate",
        "description": "Respectful disagreement and discussion",
        "prompt_addition": "Create a respectful debate format where speakers present different perspectives and challenge each other's viewpoints constructively."
    },
    "interview": {
        "name": "Interview",
        "description": "Professional interview style",
        "prompt_addition": "Format this as a professional interview where one speaker asks thoughtful questions and the other provides detailed, expert responses."
    },
    "casual": {
        "name": "Casual",
        "description": "Relaxed, informal chat",
        "prompt_addition": "Keep this very casual and relaxed, like two friends chatting about an interesting topic they just discovered."
    }
}

class SpeakerConfig(BaseModel):
    name: str
    voice: str

class AudioGenerationRequest(BaseModel):
    speaker1: Optional[SpeakerConfig] = None
    speaker2: Optional[SpeakerConfig] = None
    tone: Optional[str] = "conversational"

@app.post("/pdf-to-notebooklm-audio")
async def pdf_to_notebooklm_audio(
    file: UploadFile = File(...),
    speaker1_name: Optional[str] = Form(None),
    speaker1_voice: Optional[str] = Form(None),
    speaker2_name: Optional[str] = Form(None),
    speaker2_voice: Optional[str] = Form(None),
    tone: Optional[str] = Form("conversational")
):
    start_time = time.time()
    logger.info(f"Starting PDF to audio conversion for file: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Validate tone preset
    if tone not in TONE_PRESETS:
        tone = "conversational"  # fallback to default
    
    # Generate default speaker configurations if not provided
    speaker1_config, speaker2_config = generate_speaker_configs(
        speaker1_name, speaker1_voice, speaker2_name, speaker2_voice
    )
    
    logger.info(f"Using speakers: {speaker1_config.name} ({speaker1_config.voice}) and {speaker2_config.name} ({speaker2_config.voice})")
    logger.info(f"Using tone preset: {tone}")
    
    # Read PDF content
    logger.info("Reading PDF content...")
    pdf_content = await file.read()
    pdf_size = len(pdf_content) / 1024 / 1024  # MB
    logger.info(f"PDF size: {pdf_size:.1f} MB")
    
    pdf_text = extract_text_from_pdf(pdf_content)
    text_length = len(pdf_text)
    logger.info(f"Extracted {text_length} characters from PDF")
    
    if not pdf_text.strip():
        logger.error("No text found in PDF")
        raise HTTPException(status_code=400, detail="No text found in PDF")
    
    # Generate conversational audio using Gemini 2.5 TTS
    logger.info("Starting conversational audio generation...")
    audio_file_path = await generate_conversational_audio(
        pdf_text, speaker1_config, speaker2_config, tone
    )
    
    total_time = time.time() - start_time
    logger.info(f"Audio generation completed in {total_time:.1f} seconds")
    
    return FileResponse(
        audio_file_path,
        media_type="audio/wav",
        filename="notebooklm_style_overview.wav"
    )

def generate_speaker_configs(
    speaker1_name: Optional[str],
    speaker1_voice: Optional[str], 
    speaker2_name: Optional[str],
    speaker2_voice: Optional[str]
) -> tuple[SpeakerConfig, SpeakerConfig]:
    """Generate speaker configurations with defaults if not provided"""
    
    # Generate random default names if not provided
    available_names = DEFAULT_SPEAKER_NAMES.copy()
    random.shuffle(available_names)
    
    # Speaker 1 configuration
    if not speaker1_name:
        speaker1_name = available_names.pop()
    if not speaker1_voice or speaker1_voice not in AVAILABLE_VOICES:
        speaker1_voice = "zephyr"  # Default analytical voice
        
    # Speaker 2 configuration  
    if not speaker2_name:
        # Ensure different name from speaker 1
        speaker2_name = next((name for name in available_names if name != speaker1_name), "Jordan")
    if not speaker2_voice or speaker2_voice not in AVAILABLE_VOICES:
        speaker2_voice = "puck"  # Default enthusiastic voice
        
    speaker1_config = SpeakerConfig(name=speaker1_name, voice=speaker1_voice)
    speaker2_config = SpeakerConfig(name=speaker2_name, voice=speaker2_voice)
    
    return speaker1_config, speaker2_config

def extract_text_from_pdf(pdf_content: bytes) -> str:
    text = ""
    pdf_file = io.BytesIO(pdf_content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    
    return text

async def generate_conversation_script(
    client: genai.Client, 
    pdf_text: str, 
    speaker1_config: SpeakerConfig, 
    speaker2_config: SpeakerConfig, 
    tone: str
) -> str:
    """Generate conversational script using regular Gemini"""
    logger.info("Generating conversation script...")
    start_time = time.time()
    
    conversation_prompt = create_conversation_prompt(
        pdf_text, speaker1_config, speaker2_config, tone
    )
    
    # Use regular Gemini model for text generation
    model = "gemini-1.5-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=conversation_prompt),
            ],
        ),
    ]
    
    config = types.GenerateContentConfig(temperature=0.8)
    
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=config,
    )
    
    script_time = time.time() - start_time
    script_length = len(response.text)
    logger.info(f"Generated {script_length} character script in {script_time:.1f}s")
    
    return response.text

async def generate_conversational_audio(
    pdf_text: str, 
    speaker1_config: SpeakerConfig, 
    speaker2_config: SpeakerConfig, 
    tone: str
) -> str:
    """Generate NotebookLM-style conversational audio using Gemini 2.5 native TTS"""
    
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # Step 1: Generate conversational script using regular Gemini
    conversation_script = await generate_conversation_script(
        client, pdf_text, speaker1_config, speaker2_config, tone
    )
    
    # Step 2: Convert script to audio using Gemini 2.5 TTS
    logger.info("Converting script to multi-speaker audio...")
    tts_start_time = time.time()
    
    model = "gemini-2.5-pro-preview-tts"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"Read this conversational script aloud with the specified speakers:\n\n{conversation_script}"),
            ],
        ),
    ]
    
    # Configure multi-speaker TTS with custom speaker configurations
    generate_content_config = types.GenerateContentConfig(
        temperature=0.8,  # Slightly creative but consistent
        response_modalities=["audio"],
        speech_config=types.SpeechConfig(
            multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                speaker_voice_configs=[
                    types.SpeakerVoiceConfig(
                        speaker=speaker1_config.name,
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=speaker1_config.voice
                            )
                        ),
                    ),
                    types.SpeakerVoiceConfig(
                        speaker=speaker2_config.name,
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=speaker2_config.voice
                            )
                        ),
                    ),
                ]
            ),
        ),
    )
    
    # Generate and save audio
    temp_dir = tempfile.gettempdir()
    output_filename = f"notebooklm_audio_{uuid.uuid4()}.wav"
    output_path = os.path.join(temp_dir, output_filename)
    
    file_index = 0
    audio_chunks = []
    
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.candidates is None
            or chunk.candidates[0].content is None
            or chunk.candidates[0].content.parts is None
        ):
            continue
            
        if (chunk.candidates[0].content.parts[0].inline_data and 
            chunk.candidates[0].content.parts[0].inline_data.data):
            
            inline_data = chunk.candidates[0].content.parts[0].inline_data
            data_buffer = inline_data.data
            
            # Convert to WAV if needed
            if inline_data.mime_type != "audio/wav":
                data_buffer = convert_to_wav(inline_data.data, inline_data.mime_type)
            
            audio_chunks.append(data_buffer)
        else:
            # Print any text responses for debugging
            if hasattr(chunk, 'text') and chunk.text:
                print(f"Generated text: {chunk.text}")
    
    # Combine all audio chunks
    if audio_chunks:
        combined_audio = b''.join(audio_chunks)
        with open(output_path, 'wb') as f:
            f.write(combined_audio)
        
        tts_time = time.time() - tts_start_time
        audio_size = len(combined_audio) / 1024 / 1024  # MB
        logger.info(f"TTS completed in {tts_time:.1f}s, generated {audio_size:.1f}MB audio")
        logger.info(f"Audio saved to: {output_path}")
        
        return output_path
    else:
        logger.error("No audio chunks generated")
        raise HTTPException(status_code=500, detail="No audio generated")

def create_conversation_prompt(
    pdf_text: str, 
    speaker1_config: SpeakerConfig, 
    speaker2_config: SpeakerConfig, 
    tone: str
) -> str:
    """Create a prompt for NotebookLM-style conversation"""
    
    # Truncate text to fit within context limits
    max_text_length = 4000
    if len(pdf_text) > max_text_length:
        pdf_text = pdf_text[:max_text_length] + "..."
    
    # Get tone-specific instruction
    tone_instruction = TONE_PRESETS.get(tone, TONE_PRESETS["conversational"])["prompt_addition"]
    
    prompt = f"""Create a 2-3 minute podcast conversation between {speaker1_config.name} and {speaker2_config.name} about this document. Make it natural and engaging.

{speaker1_config.name}: Curious, asks questions
{speaker2_config.name}: Enthusiastic, explains clearly

{tone_instruction}

Keep it conversational with natural reactions. Format with speaker labels:

{speaker1_config.name}: [speech]
{speaker2_config.name}: [speech]

Document content:
{pdf_text}

Start the conversation:"""
    
    return prompt

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    """Convert audio data to WAV format"""
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",          # ChunkID
        chunk_size,       # ChunkSize
        b"WAVE",          # Format
        b"fmt ",          # Subchunk1ID
        16,               # Subchunk1Size (16 for PCM)
        1,                # AudioFormat (1 for PCM)
        num_channels,     # NumChannels
        sample_rate,      # SampleRate
        byte_rate,        # ByteRate
        block_align,      # BlockAlign
        bits_per_sample,  # BitsPerSample
        b"data",          # Subchunk2ID
        data_size         # Subchunk2Size
    )
    return header + audio_data

def parse_audio_mime_type(mime_type: str) -> dict[str, int]:
    """Parse audio parameters from MIME type"""
    bits_per_sample = 16
    rate = 24000

    parts = mime_type.split(";")
    for param in parts:
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate_str = param.split("=", 1)[1]
                rate = int(rate_str)
            except (ValueError, IndexError):
                pass
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except (ValueError, IndexError):
                pass

    return {"bits_per_sample": bits_per_sample, "rate": rate}

def cleanup_file(file_path: str):
    def cleanup():
        if os.path.exists(file_path):
            os.remove(file_path)
    return cleanup

@app.get("/")
async def root():
    return {
        "message": "NotebookLM-style PDF to Audio API using Gemini 2.5 native TTS",
        "endpoint": "/pdf-to-notebooklm-audio",
        "features": [
            "Multi-speaker conversational audio",
            "Custom speaker names and voices",
            "Multiple tone presets",
            "Natural dialogue with realistic voices",
            "Professional podcast-style delivery",
            "Powered by Gemini 2.5 native TTS"
        ]
    }

@app.get("/voices")
async def get_available_voices():
    """Get list of available voice options"""
    return {
        "voices": AVAILABLE_VOICES,
        "default_voice1": "zephyr",
        "default_voice2": "puck"
    }

@app.get("/tones")
async def get_tone_presets():
    """Get list of available tone presets"""
    return {
        "tones": {
            tone_key: {
                "name": tone_data["name"],
                "description": tone_data["description"]
            }
            for tone_key, tone_data in TONE_PRESETS.items()
        },
        "default": "conversational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)