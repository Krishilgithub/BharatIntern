import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from llm_provider import get_chat_model
import json
import random
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize LangChain model for technical assessment
print("🔄 Initializing LangChain model for technical assessment...")
model = get_chat_model()
parser = StrOutputParser()

if model:
    print("✅ LangChain model initialized for technical assessment")
else:
    print("❌ Failed to initialize LangChain model for technical assessment")

# Internship-specific technical assessment template
internship_technical_template = """
You are an expert technical interviewer for internship positions. Generate {num_questions} technical questions for {internship_role} internship with {difficulty} difficulty level.

Focus on internship-relevant technical areas:
1. Programming fundamentals (variables, loops, functions)
2. Basic data structures (arrays, lists, dictionaries)
3. Simple algorithms and problem-solving
4. Version control basics (Git)
5. Web development basics (HTML, CSS, JavaScript)
6. Database fundamentals (SQL basics)
7. Software development concepts
8. Best practices for beginners

For {difficulty} difficulty:
- Easy: Basic concepts, fundamental knowledge suitable for beginners
- Moderate: Intermediate complexity, practical application for interns
- Hard: Advanced concepts but still appropriate for strong interns

Format each question as:
Q{{number}}. [Technical question relevant to internships]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation suitable for learning]

Make questions practical and relevant to {internship_role} internship level.
"""

internship_technical_prompt = PromptTemplate(
    input_variables=["internship_role", "num_questions", "difficulty"],
    template=internship_technical_template
)

def generate_internship_technical_assessment(internship_role: str = "Software Development", 
                                           num_questions: int = 10, 
                                           difficulty: str = "moderate") -> dict:
    """Generate technical assessment questions for internship positions using LangChain with HuggingFace"""
    print(f"🎯 Starting technical assessment generation for {internship_role} internship")
    print(f"📊 Parameters: {num_questions} questions, {difficulty} difficulty")
    
    try:
        if model:
            print(f"✅ Using LangChain model: {type(model).__name__}")
            print(f"🤖 Model details: {getattr(model, 'model_name', 'unknown')}")
            
            # Create LangChain chain and generate questions
            chain = internship_technical_prompt | model | parser
            
            print("🤖 Invoking LangChain model with HuggingFace for technical questions...")
            print(f"🔍 Request details: role={internship_role}, questions={num_questions}, difficulty={difficulty}")
            
            response = chain.invoke({
                "internship_role": internship_role,
                "num_questions": num_questions,
                "difficulty": difficulty
            })
            
            print(f"✅ LangChain model response received: {len(response)} characters")
            print(f"📄 Response preview: {response[:400]}...")
            
            # Parse questions
            questions = parse_technical_questions(response)
            print(f"📝 Successfully parsed {len(questions)} questions from response")
            
            result = {
                "success": True,
                "source": "langchain_huggingface",
                "model_used": str(type(model).__name__),
                "model_name": getattr(model, 'model_name', 'unknown'),
                "role": internship_role,
                "difficulty": difficulty,
                "requested_questions": num_questions,
                "generated_questions": len(questions),
                "response_length": len(response),
                "questions": questions,
                "raw_response": response,
                "timestamp": datetime.now().isoformat()
            }
            
            print(f"✅ Technical assessment generated successfully using LangChain + HuggingFace")
            print(f"📈 Result summary: {len(questions)} questions generated for {internship_role}")
            return result
            
        else:
            print("⚠️ LangChain model not available, using fallback questions")
            return generate_fallback_technical_questions(internship_role, num_questions, difficulty)
            
    except Exception as e:
        print(f"❌ Error generating technical assessment: {e}")
        import traceback
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        print("🔄 Falling back to predefined questions")
        return generate_fallback_technical_questions(internship_role, num_questions, difficulty)

def parse_technical_questions(response: str) -> list:
    """Parse LLM response into structured question format"""
    questions = []
    
    try:
        # Split by question numbers
        question_blocks = response.split('Q')[1:]  # Skip first empty element
        
        for i, block in enumerate(question_blocks, 1):
            try:
                lines = block.strip().split('\n')
                
                # Extract question text
                question_line = lines[0] if lines else ""
                question_text = question_line.split('.', 1)[1].strip() if '.' in question_line else question_line
                
                # Extract options
                options = {}
                correct_answer = ""
                explanation = ""
                
                for line in lines[1:]:
                    line = line.strip()
                    if line.startswith(('A)', 'B)', 'C)', 'D)')):
                        option_key = line[0]
                        option_text = line[3:].strip()
                        options[option_key] = option_text
                    elif line.startswith('Correct Answer:'):
                        correct_answer = line.split(':')[1].strip()
                    elif line.startswith('Explanation:'):
                        explanation = line.split(':', 1)[1].strip()
                
                if question_text and len(options) >= 4:
                    questions.append({
                        "id": i,
                        "question": question_text,
                        "options": options,
                        "correct_answer": correct_answer,
                        "explanation": explanation
                    })
                    
            except Exception as e:
                print(f"Error parsing question {i}: {e}")
                continue
                
    except Exception as e:
        print(f"Error parsing questions: {e}")
    
    return questions

def generate_fallback_technical_questions(role: str, num_questions: int, difficulty: str) -> dict:
    """Generate fallback technical questions when LangChain/LLM is unavailable"""
    print("⚠️ Using fallback technical questions - LangChain model not available")
    
    # Predefined questions for different roles and difficulties
    question_bank = {
        "Software Development": {
            "easy": [
                {
                    "question": "What is a variable in programming?",
                    "options": {
                        "A": "A fixed value that cannot be changed",
                        "B": "A storage location with an associated name that contains data",
                        "C": "A type of loop in programming",
                        "D": "A programming language"
                    },
                    "correct_answer": "B",
                    "explanation": "A variable is a storage location with a name that holds data which can be modified during program execution."
                },
                {
                    "question": "Which of the following is NOT a primitive data type in most programming languages?",
                    "options": {
                        "A": "Integer",
                        "B": "Boolean", 
                        "C": "Array",
                        "D": "Float"
                    },
                    "correct_answer": "C",
                    "explanation": "Array is a composite data type, while integer, boolean, and float are primitive data types."
                }
            ],
            "moderate": [
                {
                    "question": "What is the time complexity of searching an element in a sorted array using binary search?",
                    "options": {
                        "A": "O(n)",
                        "B": "O(log n)",
                        "C": "O(n²)",
                        "D": "O(1)"
                    },
                    "correct_answer": "B",
                    "explanation": "Binary search has O(log n) time complexity as it eliminates half of the search space in each step."
                }
            ]
        },
        "Data Science": {
            "easy": [
                {
                    "question": "What does SQL stand for?",
                    "options": {
                        "A": "Structured Query Language",
                        "B": "Simple Query Language", 
                        "C": "Standard Query Language",
                        "D": "System Query Language"
                    },
                    "correct_answer": "A",
                    "explanation": "SQL stands for Structured Query Language, used for managing relational databases."
                }
            ]
        }
    }
    
    # Get questions for the role and difficulty
    role_questions = question_bank.get(role, question_bank["Software Development"])
    difficulty_questions = role_questions.get(difficulty, role_questions.get("easy", []))
    
    # Randomly select questions
    selected_questions = random.sample(
        difficulty_questions, 
        min(num_questions, len(difficulty_questions))
    )
    
    # Add IDs
    for i, question in enumerate(selected_questions, 1):
        question["id"] = i
    
    return {
        "success": True,
        "source": "fallback",
        "model_used": "predefined_questions",
        "role": role,
        "difficulty": difficulty,
        "total_questions": len(selected_questions),
        "questions": selected_questions,
        "note": "This assessment uses predefined questions. For AI-generated questions, please ensure LangChain model is properly configured."
    }

def evaluate_technical_assessment(user_answers: dict, correct_answers: list) -> dict:
    """Evaluate user's technical assessment answers"""
    
    total_questions = len(correct_answers)
    correct_count = 0
    detailed_results = []
    
    for question in correct_answers:
        question_id = question["id"]
        user_answer = user_answers.get(str(question_id), "")
        correct_answer = question["correct_answer"]
        
        is_correct = user_answer.upper() == correct_answer.upper()
        if is_correct:
            correct_count += 1
            
        detailed_results.append({
            "question_id": question_id,
            "question": question["question"],
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": question.get("explanation", "")
        })
    
    percentage = (correct_count / total_questions) * 100
    
    # Determine performance level
    if percentage >= 80:
        level = "Excellent"
        feedback = "Outstanding technical knowledge! Ready for advanced internship roles."
    elif percentage >= 60:
        level = "Good" 
        feedback = "Good technical foundation. Some areas for improvement identified."
    elif percentage >= 40:
        level = "Fair"
        feedback = "Basic technical knowledge present. Focus on strengthening fundamentals."
    else:
        level = "Needs Improvement"
        feedback = "Significant gaps in technical knowledge. Recommend additional study and practice."
    
    return {
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "percentage": round(percentage, 2),
        "level": level,
        "feedback": feedback,
        "detailed_results": detailed_results
    }

# Test function
if __name__ == "__main__":
    # Test question generation
    result = generate_internship_technical_assessment(
        internship_role="Software Development",
        num_questions=5,
        difficulty="easy"
    )
    print(json.dumps(result, indent=2))