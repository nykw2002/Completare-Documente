from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from agents import process_documents
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Document Processing API"}

@app.post("/process")
async def process_uploaded_documents(
    files: list[UploadFile] = File(...),
    instructions: str = Form(...)
):
    documents = []
    for file in files:
        content = await file.read()
        encoded_content = base64.b64encode(content).decode('utf-8')
        documents.append({
            "name": file.filename,
            "content": encoded_content
        })
    
    result = process_documents(documents, instructions)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)