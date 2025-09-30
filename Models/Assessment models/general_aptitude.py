import os
from dotenv import load_dotenv
from llm_provider import get_chat_model

# Load environment variables
load_dotenv()

# Get the model
model = get_chat_model()

def generate_aptitude_mcqs(job_role: str = "Software Engineer", num_questions: int = 10, difficulty: str = "moderate") -> dict:
    """
    Generate aptitude MCQ questions using OpenRouter API.
    Falls back to predefined questions if API fails.
    """
    try:
        if model:
            print(f"🔄 Generating {num_questions} aptitude questions for {job_role} ({difficulty} difficulty)")
            
            prompt = f"""Create {num_questions} multiple-choice aptitude questions for a {job_role} position with {difficulty} difficulty.

Cover these areas:
1. Logical reasoning
2. Numerical ability  
3. Verbal reasoning
4. Problem-solving
5. Critical thinking

For {difficulty} difficulty:
- Easy: Basic concepts, straightforward questions
- Moderate: Intermediate complexity, some analytical thinking required
- Hard: Advanced concepts, complex problem-solving required

Format each question exactly as:
Q1. [Question text]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

Q2. [Question text]
A) [Option A]
B) [Option B]
C) [Option C] 
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

Continue this format for all {num_questions} questions."""

            # Generate questions using the model
            response = model.invoke(prompt)
            
            if response and hasattr(response, 'content'):
                content = response.content
            elif isinstance(response, str):
                content = response
            else:
                content = str(response)
            
            print("✅ AI questions generated successfully!")
            
            return {
                "questions": content,
                "job_role": job_role,
                "total_questions": num_questions,
                "difficulty": difficulty,
                "status": "success",
                "source": "openrouter_ai"
            }
        else:
            print("⚠️  Model not available, using fallback questions")
            return get_fallback_questions(job_role, num_questions, difficulty)
            
    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        return {
            "error": f"Error generating aptitude questions: {str(e)}",
            "status": "error"
        }

def get_fallback_questions(job_role: str, num_questions: int, difficulty: str) -> dict:
    """Provide fallback questions when AI model is not available."""
    
    fallback_questions = [
        {
            "question": "If a train travels 120 km in 2 hours, what is its speed in km/h?",
            "options": ["40", "60", "80", "100"],
            "correct_answer": "60",
            "explanation": "Speed = Distance/Time = 120/2 = 60 km/h"
        },
        {
            "question": "Which number comes next: 2, 4, 8, 16, __?",
            "options": ["24", "32", "30", "28"],
            "correct_answer": "32",
            "explanation": "Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32"
        },
        {
            "question": "If all Roses are Flowers and some Flowers are Red, then:",
            "options": ["All Roses are Red", "Some Roses are Red", "No Roses are Red", "Cannot be determined"],
            "correct_answer": "Cannot be determined",
            "explanation": "We know Roses are Flowers, but we don't know if the Red Flowers include Roses"
        },
        {
            "question": "A company's revenue increased by 20% from 2022 to 2023. If revenue in 2022 was $100,000, what was the revenue in 2023?",
            "options": ["$110,000", "$120,000", "$130,000", "$140,000"],
            "correct_answer": "$120,000",
            "explanation": "20% increase = 100,000 × 1.20 = $120,000"
        },
        {
            "question": "Which word is most similar to 'Eloquent'?",
            "options": ["Quiet", "Articulate", "Simple", "Rude"],
            "correct_answer": "Articulate",
            "explanation": "Eloquent means fluent or persuasive in speech, similar to articulate"
        }
    ]
    
    return {
        "questions": fallback_questions[:min(num_questions, len(fallback_questions))],
        "job_role": job_role,
        "total_questions": min(num_questions, len(fallback_questions)),
        "difficulty": difficulty,
        "status": "fallback",
        "source": "predefined"
    }

if __name__ == "__main__":
    # Test the function
    result = generate_aptitude_mcqs("Software Engineer", 2, "moderate")
    print("\n" + "="*50)
    print("TEST RESULT:")
    print("="*50)
    print(f"Status: {result.get('status')}")
    print(f"Source: {result.get('source')}")
    print(f"Job Role: {result.get('job_role')}")
    print(f"Questions: {result.get('total_questions')}")
    print("="*50)