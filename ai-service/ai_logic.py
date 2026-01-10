import logging
import json
import os
from langchain_community.llms import Ollama
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AIServiceLogic:
    def __init__(self):
        # Initialize LLM with Fallback logic
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        if groq_api_key:
            # Use Groq if API key is present (Production / Cloud)
            try:
                # Using Llama 3.3 70B Versatile which is the current recommended model on Groq
                self.llm = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", api_key=groq_api_key)
                logger.info("AIServiceLogic initialized with Groq (model=llama-3.3-70b-versatile)")
            except Exception as e:
                logger.error(f"Failed to initialize Groq: {e}. Falling back to Ollama.")
                self.llm = Ollama(model="llama3", base_url="http://localhost:11434")
        else:
            # Fallback to Ollama (Local Development)
            self.llm = Ollama(model="llama3", base_url="http://localhost:11434")
            logger.info("AIServiceLogic initialized with Ollama (model=llama3)")

    def generate_question(self, topic: str, difficulty: str, question_type: str, count: int = 1):
        logger.info(f"Generating {count} questions for topic={topic}, difficulty={difficulty}, type={question_type}")
        
        if count > 1:
            prompt_template = """
            You are a math teacher. Generate {count} distinct {difficulty} difficulty math questions about {topic}.
            The questions type is {question_type}.
            
            Return ONLY a valid JSON ARRAY of objects, where each object has the following fields:
            - content: The question text
            - expected_answer: The correct answer (string)
            - explanation: A step-by-step explanation
            - type: {question_type}
            - options: Array of 4 strings (REQUIRED if type is multiple_choice, otherwise empty array)
            
            Ensure the JSON is valid and strictly follows the format.
            Do not output any markdown formatting like ```json, just the raw JSON array.
            """
        else:
            prompt_template = """
            You are a math teacher. Generate a {difficulty} difficulty math question about {topic}.
            The question type is {question_type}.
            
            Return ONLY a valid JSON object with the following fields:
            - content: The question text
            - expected_answer: The correct answer
            - explanation: A step-by-step explanation
            - type: {question_type}
            - options: Array of 4 strings (REQUIRED if type is multiple_choice, otherwise empty array)
            
            Do not output any markdown formatting like ```json, just the raw JSON.
            """
        
        prompt = PromptTemplate(
            input_variables=["difficulty", "topic", "question_type", "count"],
            template=prompt_template
        )
        
        chain = prompt | self.llm
        
        try:
            # invoke method varies slightly between integrations, but LCEL standardizes it mostly.
            # ChatGroq returns a BaseMessage, Ollama returns a string.
            # We need to handle both content types.
            
            response = chain.invoke({
                "difficulty": difficulty,
                "topic": topic,
                "question_type": question_type,
                "count": count
            })
            
            # Extract content based on response type
            if hasattr(response, 'content'):
                raw_output = response.content # For ChatGroq / ChatOpenAI
            else:
                raw_output = str(response) # For Ollama (legacy)
            
            raw_output = raw_output.strip()
            logger.info(f"LLM Raw Output: {raw_output}")
            
            clean_output = raw_output.replace("```json", "").replace("```", "").strip()
            
            parsed_output = json.loads(clean_output)
            return parsed_output
            
        except Exception as e:
            logger.error(f"Error generating question: {e}")
            raise e

    def evaluate_answer(self, user_answer: str, expected_answer: str, question_type: str, tolerance: float = 0):
        logger.info(f"Evaluating answer: User={user_answer}, Expected={expected_answer}")
        
        prompt_template = """
        You are a math grader. Evaluate the student's answer.
        Question Type: {question_type}
        Expected Answer: {expected_answer}
        Student Answer: {user_answer}
        Tolerance (if numerical): {tolerance}
        
        Return ONLY a valid JSON object with:
        - score: 0 to 100 (integer)
        - feedback: Constructive feedback (string)
        - is_correct: boolean
        
        Do not output any markdown formatting like ```json, just the raw JSON.
        """
        
        prompt = PromptTemplate(
            input_variables=["question_type", "expected_answer", "user_answer", "tolerance"],
            template=prompt_template
        )
        
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "question_type": question_type,
                "expected_answer": expected_answer,
                "user_answer": user_answer,
                "tolerance": tolerance
            })
            
            if hasattr(response, 'content'):
                raw_output = response.content
            else:
                raw_output = str(response)
                
            raw_output = raw_output.strip()
            logger.info(f"LLM Evaluation Output: {raw_output}")
            
            clean_output = raw_output.replace("```json", "").replace("```", "").strip()
            parsed_output = json.loads(clean_output)
            return parsed_output
            
        except Exception as e:
            logger.error(f"Error evaluating answer: {e}")
            raise e

ai_logic = AIServiceLogic()
