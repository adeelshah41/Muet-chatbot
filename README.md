---

## 💻 Setup Instructions for MuetBot

Follow these steps to set up and run the MuetBot project on your local machine:

---

### ✅ 1. Clone the Repository

```bash
git clone https://github.com/adeelshah41/Muet-chatbot.git
cd Muet-chatbot
```

---

### 🐍 2. Create and Activate a Virtual Environment

#### On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

#### On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 📦 3. Install Required Libraries

```bash
pip install -r requirements.txt
```

Make sure `requirements.txt` is present in the root directory. You can generate one using:

```bash
pip freeze > requirements.txt
```

---

### 🔐 4. Create a `.env` File

Create a `.env` file in the root directory to store your API keys and other secrets.

#### Example `.env`:

```
OPENAI_API_KEY=your_openai_api_key (you can leave it empty)
MONGODB_URI=your mongodb connection string
HUGGINGFACEHUB_ACCESS_TOKEN=your huggingface access token id
GROQ_API_KEY= your groq api key
```

> Never commit your `.env` file to GitHub!

---

### 🚀 5. Run the Application

```bash
python main.py
```

Or if you’re using FastAPI with Uvicorn:

```bash
uvicorn main:app --reload
```

---

### 📄 Additional Tips

* If you face a `ModuleNotFoundError`, make sure you're inside the virtual environment and the required libraries are installed.
* Add `.env`, `__pycache__/`, and `venv/` to your `.gitignore` file to keep your repo clean.

---

