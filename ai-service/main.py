from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ai_logic import ai_logic

app = FastAPI(
    title="AI Math Service",
    description="Microservice for Math Question Generation and Evaluation",
    version="1.0.0"
)

class GenerateRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    question_type: str = "open"
    count: int = 1

class EvaluateRequest(BaseModel):
    question_id: Optional[str] = None
    user_answer: str
    expected_answer: str
    question_type: str
    tolerance: Optional[float] = 0

@app.post("/generate")
async def generate_question(req: GenerateRequest):
    try:
        return ai_logic.generate_question(req.topic, req.difficulty, req.question_type, req.count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    try:
        return ai_logic.evaluate_answer(req.user_answer, req.expected_answer, req.question_type, req.tolerance)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
