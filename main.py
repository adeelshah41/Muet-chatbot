from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnablePassthrough, RunnableLambda
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import FileChatMessageHistory
from langchain_community.embeddings import HuggingFaceEmbeddings
from pymongo import MongoClient
from sysprompt import prompt
from datetime import datetime
import json
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI=os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client["Muet_chatbot"]
history_collection = db["chat_history"]

model = ChatGroq(
    model='llama3-8b-8192', # Choose your desired Groq model
    temperature=0.0         # fully deterministic
)
parser=StrOutputParser()

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


# Load A VECTOR STORE

vector_store1 = FAISS.load_local("vectorstore_Mehran3", 
                                 embeddings,
                                 allow_dangerous_deserialization=True  )




# Create a RETRIEVER

retriever =vector_store1.as_retriever(search_type="similarity",search_kwargs={'k':4})

# MEMORY SETUP (Persistent)
history_file = "chat_history.json"
chat_history = FileChatMessageHistory(history_file)
memory = ConversationBufferMemory(
    memory_key="chat_history",
    chat_memory=chat_history,
    return_messages=True
)

def format_chat_history(messages):
    formatted = []
    for msg in messages:
        role = msg.type.capitalize()
        content = msg.content
        formatted.append(f"{role}: {content}")
    return "\n".join(formatted)

def format_docs(retrieved_docs):
  context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
  return context_text

# def dual_retriever_merge(question):
#     docs1 = retriever.invoke(question)

#     return format_docs(docs1)
def dual_retriever_merge(question):
    docs1 = retriever.invoke(question)

    # 👇 Debug: print the top 4 retrieved chunks
    print("\n[Retrieved Chunks]")
    for i, doc in enumerate(docs1):
        print(f"\nChunk {i+1}:\n{doc.page_content}\n")

    return format_docs(docs1)

parallel_chain = RunnableParallel({
    'context': RunnableLambda(dual_retriever_merge),
    'question': RunnablePassthrough()
})

inject_history = RunnableLambda(lambda inputs: {
    **inputs,
    "chat_history": format_chat_history(memory.chat_memory.messages)
})


main_chain= parallel_chain | inject_history | prompt | model | parser

print("Mehran Bot Assistant (type 'exit' to quit)\n")
while True:
    question = input("You: ")
    if question.lower() in ["exit", "quit"]:
        break

    
    raw_output = main_chain.invoke(question)

    # ✅ Parse result object
    try:
        result_obj = json.loads(raw_output) if isinstance(raw_output, str) else raw_output
    except json.JSONDecodeError:
        result_obj = {"answer": raw_output}
    memory.chat_memory.add_user_message(question)
    memory.chat_memory.add_ai_message(result_obj['answer'])
    print("Bot:", result_obj)

    user_msg = {
        "role": "user",
        "message": question,
        "timestamp": datetime.now()
    }
    bot_msg = {
        "role": "assistant",
        "message": result_obj,
        "timestamp": datetime.now()
    }


    history_collection.insert_many([user_msg, bot_msg])

