from faster_whisper import WhisperModel
import io

model = WhisperModel("base", device="cpu")  # cpu for simplicity

def transcribe_audio(audio_bytes: bytes) -> str:
    try:
        segments, info = model.transcribe(io.BytesIO(audio_bytes), beam_size=5)
        text = " ".join(segment.text for segment in segments)
        return text.strip()
    except:
        return "Transcription failed"

