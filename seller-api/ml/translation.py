from googletrans import Translator

translator = Translator()

def translate_to_en(text: str, src_lang: str = "ta") -> str:
    try:
        result = translator.translate(text, src=src_lang, dest="en")
        return result.text
    except:
        return text  # Fallback

