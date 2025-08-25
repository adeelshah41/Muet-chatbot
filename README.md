```markdown
# 🎓 Mehran University AI Assistant

An AI-powered chatbot built with **FastAPI**, **LangChain**, **OpenAI**, and **FAISS**, designed to help students and staff at Mehran University get quick answers to their queries related to admissions, courses, campus facilities, and more.  

The project features:
- 💻 **Backend**: FastAPI, LangChain, MongoDB, FAISS
- 🎨 **Frontend**: HTML, CSS, JavaScript
- 🧠 **RAG pipeline**: Retrieval-Augmented Generation over university documents
- 🗂️ **Memory**: Persistent chat history with MongoDB + local storage

---

## 📂 Project Structure

```

muet-chatbot/
│
├── backend/
│   ├── main2.py        # FastAPI server( backend code can be checked but not connected to frontend)
|   ├── main.py         # works with the backend but some responses are not right 
│   └── sysprompt.py    # System prompt for chatbot
│
├── frontend/
│   ├── index.html      # Chat UI
│   ├── style.css       # Styling
│   └── script.js       # Frontend logic (auth + chat)
│
├── requirements.txt    # Dependencies
└── README.md           # Project guide

````

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/adeel41/muet-chatbot.git
cd muet-chatbot/backend
````

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows
```

### 3️⃣ Install Requirements

```bash
pip install -r requirements.txt
```

### 4️⃣ Environment Variables

Create a `.env` file inside `backend/` with:

```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://localhost:27017
```

### 5️⃣ Add Vectorstore

Download the **vectorstore folder** from this Drive link:
👉 [Vectorstore Download](https://drive.google.com/drive/folders/1ukJDLEg63ed1NsJyX4ofJBzpo4CoJCpu)

Place it inside the backend folder as:

```
backend/vectorstore_Mehran/
```

### 6️⃣ Run the Backend

From inside the `backend/` folder:

```bash
uvicorn main2:app --reload
```

The API will start at:
👉 `http://127.0.0.1:8000`

### 7️⃣ Run the Frontend

Simply open `frontend/index.html` in your browser.
(Or serve it using VS Code Live Server / any static server if needed.)

---

## 🚀 Features

* User **authentication** (register/login with MongoDB).
* **Chatbot** powered by GPT with RAG on Mehran University data.
* Stores **chat history** in MongoDB for persistence.
* **Voice input** support using browser speech recognition.
* Clean **frontend UI** with suggestions and chat history.

---

## 🧩 API Endpoints

| Endpoint    | Method | Description                         |
| ----------- | ------ | ----------------------------------- |
| `/register` | POST   | Register a new user                 |
| `/login`    | POST   | Login with email & password         |
| `/chat`     | POST   | Send a question and get AI response |

Example chat request:

```json
POST /chat
{
  "question": "What are the admission requirements?"
}
```

Response:

```json
{
  "answer": "For undergraduate programs, you need FSc/A-Level with 60%...",
  "references": ["document1", "document2"]
}
```

---

## 📌 Notes

* Make sure MongoDB is running locally or update the `MONGODB_URI` in `.env`.
* Vectorstore must be downloaded separately (see Drive link above).
* In production, update CORS and secure credentials.

---

## 👨‍💻 Author

Developed by **Muhammad Adeel Shah Reffai** (Computer Systems Engineering, MUET).

```

---

👉 Do you want me to also include **screenshots/demo section** (with placeholders) in the README so your GitHub looks more appealing?
```
