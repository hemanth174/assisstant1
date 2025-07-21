from flask import Flask, render_template, request, jsonify, session
import datetime
import wikipedia
import pyjokes
import pytz
import holidays  # Import the holidays library
from urllib.parse import quote
from flask_session import Session
from dateutil.parser import parse, ParserError
from datetime import timedelta


app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

def process_command(command):
    """Processes the voice command and returns a response object."""
    command = command.lower()
    response_data = {"text": "", "action_url": ""}
    ist = pytz.timezone('Asia/Kolkata')
    if "play" in command:
        song = command.replace("play", "").strip()
        youtube_url = f"https://www.youtube.com/results?search_query={quote(song)}"
        response_data["text"] = f"Sure, playing {song} on YouTube for you."
        response_data["action_url"] = youtube_url

    # elif "time" in command:
    #     time = datetime.datetime.now().strftime('%I:%M %p')
    #     response_data["text"] = f"It’s {time} ⏰"

    elif "time" in command:
        ist = pytz.timezone('Asia/Kolkata')
        time = datetime.datetime.now(ist).strftime('%I:%M %p')
        response_data["text"] = f"It’s {time}⏰"

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

    elif "date" in command or "day is" in command:
        try:
            target_date = None
            if "tomorrow" in command:
                target_date = datetime.datetime.now(ist).date() + timedelta(days=1)
            elif "yesterday" in command:
                target_date = datetime.datetime.now(ist).date() - timedelta(days=1)
            else:
                
                target_date = parse(command, fuzzy=True).date()

           
            in_holidays = holidays.country_holidays('IN')
            date_str = target_date.strftime("%A, %B %d, %Y")
            festival = in_holidays.get(target_date)
            
           
            prefix = "is"
            if target_date == datetime.datetime.now(ist).date():
                prefix = "is" 
            elif target_date > datetime.datetime.now(ist).date():
                prefix = "will be" 
            else:
                prefix = "was"

            if festival:
                response_data["text"] = f"{target_date.strftime('%B %d')} {prefix} {date_str}, and it's also {festival}! 🎉"
            else:
                response_data["text"] = f"That day {prefix} {date_str}."

        except ParserError:
            # Handle cases where no valid date is found in the command
            response_data["text"] = "I'm sorry, I couldn't figure out which date you mean. Please try saying the full date."


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