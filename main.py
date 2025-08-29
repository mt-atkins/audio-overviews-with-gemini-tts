from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
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

@app.post("/pdf-to-notebooklm-audio")
async def pdf_to_notebooklm_audio(file: UploadFile = File(...)):
    start_time = time.time()
    logger.info(f"Starting PDF to audio conversion for file: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
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
    audio_file_path = await generate_conversational_audio(pdf_text)
    
    total_time = time.time() - start_time
    logger.info(f"Audio generation completed in {total_time:.1f} seconds")
    
    return FileResponse(
        audio_file_path,
        media_type="audio/wav",
        filename="notebooklm_style_overview.wav"
    )

def extract_text_from_pdf(pdf_content: bytes) -> str:
    text = ""
    pdf_file = io.BytesIO(pdf_content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    
    return text

async def generate_conversation_script(client: genai.Client, pdf_text: str) -> str:
    """Generate conversational script using regular Gemini"""
    logger.info("Generating conversation script...")
    start_time = time.time()
    
    conversation_prompt = create_conversation_prompt(pdf_text)
    
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

async def generate_conversational_audio(pdf_text: str) -> str:
    """Generate NotebookLM-style conversational audio using Gemini 2.5 native TTS"""
    
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # Step 1: Generate conversational script using regular Gemini
    conversation_script = await generate_conversation_script(client, pdf_text)
    
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
    
    # Configure multi-speaker TTS
    generate_content_config = types.GenerateContentConfig(
        temperature=0.8,  # Slightly creative but consistent
        response_modalities=["audio"],
        speech_config=types.SpeechConfig(
            multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                speaker_voice_configs=[
                    types.SpeakerVoiceConfig(
                        speaker="Alex",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Zephyr"  # Warm, analytical voice
                            )
                        ),
                    ),
                    types.SpeakerVoiceConfig(
                        speaker="Jordan",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Puck"  # Enthusiastic, explanatory voice
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

def create_conversation_prompt(pdf_text: str) -> str:
    """Create a prompt for NotebookLM-style conversation"""
    
    # Truncate text to fit within context limits
    max_text_length = 4000
    if len(pdf_text) > max_text_length:
        pdf_text = pdf_text[:max_text_length] + "..."
    
    prompt = f"""Create a 2-3 minute podcast conversation between Alex and Jordan about this document. Make it natural and engaging.

Alex: Curious, asks questions
Jordan: Enthusiastic, explains clearly

Keep it conversational with natural reactions. Format with speaker labels:

Alex: [speech]
Jordan: [speech]

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
            "Natural dialogue with realistic voices",
            "Professional podcast-style delivery",
            "Powered by Gemini 2.5 native TTS"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)