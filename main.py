from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)  # allow requests from your extension


@app.route("/translate_code", methods=["POST"])
def translate_code():
    data = request.get_json()
    source_lang = data.get("source_language", "auto")
    target_lang = data.get("target_language", "Python")
    code = data.get("code", "")

    prompt = f"Convert this {source_lang} code to {target_lang}:\n\n{code}\n\nOnly output the translated code. Do not use any code block formatting like triple backticks or language identifiers."

    system_message = (
        f"You are a code translator. You will be provided code in one programming language "
        f"and you need to convert it as closely as possible to {target_lang}. "
        f"IMPORTANT: Only output the translated code itself. DO NOT add any code block formatting "
        f"like triple backticks (```), or any language identifiers like '{target_lang}'. Only output the translated code."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt},
            ],
        )
        translated_code = response.choices[0].message.content.strip()
        print(translated_code)
        return jsonify({"translated_code": translated_code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
