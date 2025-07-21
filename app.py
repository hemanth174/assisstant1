from flask import Flask, render_template, request, jsonify, session
import datetime
import wikipedia
import pyjokes
from urllib.parse import quote
from flask_session import Session
app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

def process_command(command):
    """Processes the voice command and returns a response object."""
    command = command.lower()
    response_data = {"text": "", "action_url": ""}

    if "play" in command:
        song = command.replace("play", "").strip()
        youtube_url = f"https://www.youtube.com/results?search_query={quote(song)}"
        response_data["text"] = f"Sure, playing {song} on YouTube for you."
        response_data["action_url"] = youtube_url

    elif "time" in command:
        time = datetime.datetime.now().strftime('%I:%M %p')
        response_data["text"] = f"It’s {time} ⏰"

    elif "who is" in command:
        person = command.replace("who is", "").strip()
        try:
            info = wikipedia.summary(person, sentences=1)
            response_data["text"] = info
        except Exception:
            response_data["text"] = "Sorry, I couldn’t find information about that person."

    elif "joke" in command:
        response_data["text"] = pyjokes.get_joke()

    elif "open chrome" in command or "open code" in command:
        response_data["text"] = "Sorry, for security reasons, I can't open applications from a web browser."

    elif "date" in command:
        date = datetime.datetime.now().strftime("%B %d, %Y")
        response_data["text"] = f"Today's date is {date}."

    elif command:
        response_data["text"] = "I heard you, but I don’t understand that yet 😅"

    else:
        response_data["text"] = "Sorry, I didn't catch that. Please try again."

    return response_data

@app.route("/")
def home():
    name = session.get('name', '')
    return render_template('index.html', name=name)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    command = data.get("command", "")
    response_data = process_command(command)
    return jsonify(response_data)
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "")
    session['name'] = name
    return jsonify({"name": name})
if __name__ == "__main__":
    app.run(debug=True)