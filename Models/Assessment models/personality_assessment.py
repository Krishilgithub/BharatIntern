import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from llm_provider import get_chat_model

# Load environment variables
load_dotenv()

model = get_chat_model()

# Output parser
parser = StrOutputParser()

# Prompt template for personality assessment
personality_assessment_template = """
You are an expert psychologist specializing in personality assessments. Generate a comprehensive personality assessment with {num_questions} questions based on the Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism).

Assessment Focus: {assessment_focus}
Job Role Context: {job_role}

Requirements:
1. Create questions that assess different aspects of personality
2. Include questions about work preferences, social interactions, and decision-making
3. Make questions relevant to {job_role} and {assessment_focus}
4. Use a mix of scenario-based and direct questions
5. Ensure questions are clear and easy to understand
6. Include questions about:
   - Work environment preferences
   - Team collaboration style
   - Stress management
   - Learning and growth mindset
   - Communication style
   - Leadership tendencies

Format each question as:
Q{{number}}. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

Make questions engaging and relevant to professional development and career success.
"""

personality_assessment_prompt = PromptTemplate(
    input_variables=["num_questions", "assessment_focus", "job_role"],
    template=personality_assessment_template
)

def generate_personality_assessment(num_questions: int = 10, assessment_focus: str = "Work Style", job_role: str = "Professional") -> dict:
    print(f"🔄 Generating {num_questions} personality assessment questions ({assessment_focus}) for {job_role}")
    
    try:
        if model:
            # Try AI generation first
            try:
                prompt = personality_assessment_prompt.format(
                    num_questions=num_questions,
                    assessment_focus=assessment_focus,
                    job_role=job_role
                )
                result = model.invoke(prompt)
                
                print("✅ AI personality assessment generated successfully!")
                
                return {
                    "questions": result.content,
                    "source": "openrouter_ai",
                    "num_questions": num_questions,
                    "assessment_focus": assessment_focus,
                    "job_role": job_role,
                    "status": "success"
                }
            except Exception as ai_error:
                print(f"❌ AI generation failed: {ai_error}")
                print("🔄 Falling back to predefined questions...")
        else:
            print("⚠️ No model available, using fallback questions...")
        
        # Fallback response with sample personality questions
        fallback_questions = {
                "Work Style": {
                    "questions": """Q1. When working on a project, I prefer to:
A) Plan everything in detail before starting
B) Start immediately and figure things out as I go
C) Collaborate with others to brainstorm ideas
D) Research best practices and follow established methods

Q2. In a team meeting, I typically:
A) Take charge and lead the discussion
B) Listen carefully and contribute when asked
C) Share my ideas enthusiastically
D) Focus on practical solutions and next steps

Q3. When faced with a challenging problem, I:
A) Analyze it from multiple angles before acting
B) Trust my instincts and make quick decisions
C) Discuss it with colleagues to get different perspectives
D) Look for proven solutions and best practices

Q4. I prefer work environments that are:
A) Structured with clear processes and guidelines
B) Flexible and allow for creative freedom
C) Collaborative and team-oriented
D) Fast-paced with variety and new challenges

Q5. When receiving feedback, I:
A) Appreciate detailed, constructive criticism
B) Prefer positive reinforcement and encouragement
C) Value honest, direct communication
D) Focus on actionable improvements

Q6. In stressful situations, I:
A) Stay calm and focus on problem-solving
B) Seek support from others
C) Use it as motivation to perform better
D) Take time to process before responding

Q7. I learn best when:
A) I can study materials independently
B) I can practice hands-on
C) I can discuss concepts with others
D) I can see real-world applications

Q8. When making decisions, I rely most on:
A) Logical analysis and data
B) Intuition and gut feelings
C) Input from trusted colleagues
D) Past experiences and proven methods

Q9. I prefer to work:
A) Independently with clear objectives
B) In a supportive team environment
C) With diverse groups of people
D) On challenging, innovative projects

Q10. My ideal work schedule would be:
A) Consistent hours with predictable routine
B) Flexible hours based on my energy levels
C) Collaborative hours with team availability
D) Varied hours depending on project needs""",
                    "traits": ["Conscientiousness", "Extraversion", "Openness", "Agreeableness", "Neuroticism"]
                },
                "Leadership Style": {
                    "questions": """Q1. When leading a team, I prefer to:
A) Set clear goals and monitor progress closely
B) Empower team members to make decisions
C) Build strong relationships and trust
D) Encourage innovation and creative thinking

Q2. In conflict situations, I typically:
A) Address issues directly and find quick solutions
B) Listen to all perspectives before deciding
C) Focus on maintaining harmony and relationships
D) Look for creative win-win solutions

Q3. I motivate others by:
A) Setting clear expectations and providing structure
B) Recognizing achievements and providing encouragement
C) Building personal connections and trust
D) Challenging them with new opportunities

Q4. When delegating tasks, I:
A) Provide detailed instructions and checkpoints
B) Give autonomy and trust their judgment
C) Ensure they feel supported and valued
D) Encourage them to find their own approach

Q5. I prefer to make decisions by:
A) Analyzing data and considering all options
B) Trusting my instincts and experience
C) Consulting with key stakeholders
D) Exploring innovative possibilities

Q6. In team meetings, I:
A) Keep discussions focused and efficient
B) Encourage participation from everyone
C) Build consensus and agreement
D) Stimulate creative thinking and new ideas

Q7. When someone makes a mistake, I:
A) Address it immediately and find solutions
B) Provide constructive feedback and support
C) Focus on learning and growth
D) Look for the positive lessons learned

Q8. I prefer to lead by:
A) Setting a strong example of hard work
B) Building relationships and trust
C) Encouraging collaboration and teamwork
D) Inspiring with vision and innovation

Q9. My communication style is:
A) Direct and to the point
B) Warm and relationship-focused
C) Collaborative and inclusive
D) Enthusiastic and inspiring

Q10. I measure success by:
A) Achieving concrete results and goals
B) Building strong, lasting relationships
C) Creating positive team dynamics
D) Driving innovation and growth""",
                    "traits": ["Leadership", "Communication", "Decision-making", "Team Building", "Innovation"]
                },
                "Communication Style": {
                    "questions": """Q1. When presenting information, I prefer to:
A) Use clear, structured formats with data
B) Tell stories and use examples
C) Encourage discussion and interaction
D) Use visuals and creative elements

Q2. In group discussions, I typically:
A) Listen carefully and speak when I have something valuable to add
B) Actively participate and share my thoughts
C) Ensure everyone has a chance to contribute
D) Bring up new ideas and perspectives

Q3. When giving feedback, I:
A) Focus on specific behaviors and outcomes
B) Use encouraging and supportive language
C) Consider the person's feelings and context
D) Provide constructive suggestions for improvement

Q4. I prefer to communicate through:
A) Written documents and detailed emails
B) Face-to-face conversations and meetings
C) Collaborative platforms and group discussions
D) Visual presentations and creative formats

Q5. When someone disagrees with me, I:
A) Present logical arguments and evidence
B) Listen to their perspective and find common ground
C) Focus on understanding their point of view
D) Look for creative solutions that satisfy both parties

Q6. I express my ideas best by:
A) Organizing them logically and systematically
B) Sharing personal experiences and stories
C) Engaging others in discussion and dialogue
D) Using metaphors and creative analogies

Q7. In difficult conversations, I:
A) Address issues directly and honestly
B) Approach them with empathy and care
C) Focus on finding mutually beneficial solutions
D) Use humor and positive framing

Q8. I prefer to receive information:
A) In written form with clear structure
B) Through personal conversations and stories
C) In interactive discussions and Q&A sessions
D) Through visual presentations and examples

Q9. When explaining complex topics, I:
A) Break them down into logical steps
B) Use relatable examples and analogies
C) Encourage questions and discussion
D) Use visual aids and creative methods

Q10. My communication goal is usually to:
A) Convey information clearly and accurately
B) Build relationships and understanding
C) Facilitate collaboration and teamwork
D) Inspire and motivate others""",
                    "traits": ["Communication", "Listening", "Feedback", "Presentation", "Conflict Resolution"]
                }
            }
        
        # Create structured fallback questions that can be properly sliced
        all_questions = [
            {
                "id": 1,
                "text": "When working on a project, I prefer to:",
                "options": ["Plan everything in detail before starting", "Start immediately and figure things out as I go", "Collaborate with others to brainstorm ideas", "Research best practices and follow established methods"],
                "trait": "Conscientiousness"
            },
            {
                "id": 2,
                "text": "In a team meeting, I typically:",
                "options": ["Take charge and lead the discussion", "Listen carefully and contribute when asked", "Share my ideas enthusiastically", "Focus on practical solutions and next steps"],
                "trait": "Extraversion"
            },
            {
                "id": 3,
                "text": "When faced with a challenging problem, I:",
                "options": ["Analyze it from multiple angles before acting", "Trust my instincts and make quick decisions", "Discuss it with colleagues to get different perspectives", "Look for proven solutions and best practices"],
                "trait": "Openness"
            },
            {
                "id": 4,
                "text": "I prefer work environments that are:",
                "options": ["Structured with clear processes and guidelines", "Flexible and allow for creative freedom", "Collaborative and team-oriented", "Fast-paced with variety and new challenges"],
                "trait": "Agreeableness"
            },
            {
                "id": 5,
                "text": "When receiving feedback, I:",
                "options": ["Appreciate detailed, constructive criticism", "Prefer positive reinforcement and encouragement", "Value honest, direct communication", "Focus on actionable improvements"],
                "trait": "Neuroticism"
            },
            {
                "id": 6,
                "text": "In stressful situations, I:",
                "options": ["Stay calm and focus on problem-solving", "Seek support from others", "Use it as motivation to perform better", "Take time to process before responding"],
                "trait": "Neuroticism"
            },
            {
                "id": 7,
                "text": "I learn best when:",
                "options": ["I can study materials independently", "I can practice hands-on", "I can discuss concepts with others", "I can see real-world applications"],
                "trait": "Openness"
            },
            {
                "id": 8,
                "text": "When making decisions, I rely most on:",
                "options": ["Logical analysis and data", "Intuition and gut feelings", "Input from trusted colleagues", "Past experiences and proven methods"],
                "trait": "Conscientiousness"
            },
            {
                "id": 9,
                "text": "I prefer to work:",
                "options": ["Independently with clear objectives", "In a supportive team environment", "With diverse groups of people", "On challenging, innovative projects"],
                "trait": "Extraversion"
            },
            {
                "id": 10,
                "text": "My ideal work schedule would be:",
                "options": ["Consistent hours with predictable routine", "Flexible hours based on my energy levels", "Collaborative hours with team availability", "Varied hours depending on project needs"],
                "trait": "Agreeableness"
            },
            {
                "id": 11,
                "text": "When leading a team, I prefer to:",
                "options": ["Set clear goals and monitor progress closely", "Empower team members to make decisions", "Build strong relationships and trust", "Encourage innovation and creative thinking"],
                "trait": "Leadership"
            },
            {
                "id": 12,
                "text": "When presenting information, I prefer to:",
                "options": ["Use clear, structured formats with data", "Tell stories and use examples", "Encourage discussion and interaction", "Use visuals and creative elements"],
                "trait": "Communication"
            }
        ]
        
        # Filter questions based on assessment focus if needed
        if assessment_focus == "Leadership Style":
            filtered_questions = [q for q in all_questions if q["trait"] in ["Leadership", "Extraversion", "Conscientiousness", "Agreeableness"]]
        elif assessment_focus == "Communication Style":
            filtered_questions = [q for q in all_questions if q["trait"] in ["Communication", "Extraversion", "Agreeableness", "Openness"]]
        else:  # Work Style or default
            filtered_questions = all_questions
        
        # Select only the requested number of questions
        selected_questions = filtered_questions[:min(num_questions, len(filtered_questions))]
        
        # Format for frontend consumption
        formatted_questions = []
        for i, q in enumerate(selected_questions, 1):
            formatted_questions.append(f"Q{i}. {q['text']}\nA) {q['options'][0]}\nB) {q['options'][1]}\nC) {q['options'][2]}\nD) {q['options'][3]}")
        
        return {
            "questions": "\n\n".join(formatted_questions),
            "source": "fallback",
            "num_questions": len(selected_questions),
            "assessment_focus": assessment_focus,
            "job_role": job_role,
            "status": "success"
        }
    except Exception as e:
        return {
            "error": f"Error generating personality assessment: {str(e)}",
            "status": "error"
        }

if __name__ == "__main__":
    result = generate_personality_assessment(10, "Work Style", "Software Engineer")
    print(result) 