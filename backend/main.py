from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from langchain_openai import OpenAIEmbeddings,ChatOpenAI
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import FileChatMessageHistory
from pymongo import MongoClient
from dotenv import load_dotenv
from sysprompt import prompt
import os
import json

load_dotenv()

# Set up
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client["Muet_chatbot"]
history_collection = db["chat_history"]

app = FastAPI()


# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model and components
# model = ChatGroq(model="llama3-8b-8192", temperature=0.0)

model =ChatOpenAI(
    model='gpt-4o',
    temperature=0.0 
)
parser = StrOutputParser()
# embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
embeddings = OpenAIEmbeddings(model='text-embedding-3-small')
vector_store = FAISS.load_local("vectorstore_Mehran", embeddings, allow_dangerous_deserialization=True)
retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={'k': 8})
history_file = "chat_history.json"
chat_history = FileChatMessageHistory(history_file)
memory = ConversationBufferMemory(memory_key="chat_history", chat_memory=chat_history, return_messages=True)

# Format helpers
def format_chat_history(messages):
    return "\n".join(f"{msg.type.capitalize()}: {msg.content}" for msg in messages)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def dual_retriever_merge(question):
    docs = retriever.invoke(question)
    return format_docs(docs)

# Chain
parallel_chain = RunnableParallel({
    'context': RunnableLambda(dual_retriever_merge),
    'question': RunnablePassthrough()
})
inject_history = RunnableLambda(lambda inputs: {
    **inputs,
    "chat_history": format_chat_history(memory.chat_memory.messages)
})
main_chain = parallel_chain | inject_history | prompt | model | parser

# Request schema
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(data: ChatRequest):
    question = data.message

    raw_output = main_chain.invoke(question)
    try:
        result_obj = json.loads(raw_output) if isinstance(raw_output, str) else raw_output
    except json.JSONDecodeError:
        result_obj = {"answer": raw_output}

    memory.chat_memory.add_user_message(question)
    memory.chat_memory.add_ai_message(result_obj['answer'])

    history_collection.insert_many([
        {"role": "user", "message": question, "timestamp": datetime.now()},
        {"role": "assistant", "message": result_obj['answer'], "timestamp": datetime.now()}
    ])

    return {"answer": result_obj['answer']}
