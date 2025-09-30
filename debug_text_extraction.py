import os
import sys
sys.path.append('c:\\Users\\Krishil Agrawal\\Desktop\\Hackathons\\SIH Hackathon\\BharatIntern\\backend')

from models.internship_resume_analyzer import extract_resume_text, analyze_internship_resume

# Create a simple test text file
test_file_path = "test_resume.txt"
test_content = """John Doe
Computer Science Student
Email: john.doe@email.com
Phone: (555) 123-4567

EDUCATION:
Bachelor of Technology in Computer Science
XYZ University, 2024
CGPA: 8.5/10.0

SKILLS:
- Programming Languages: Python, Java, JavaScript
- Web Technologies: HTML, CSS, React, Node.js
- Databases: MySQL, MongoDB
- Tools: Git, Docker, VS Code

PROJECTS:
1. E-commerce Website
   - Built using React and Node.js
   - Implemented user authentication and payment gateway
   - Technologies: React, Express, MongoDB

2. Data Analysis Dashboard
   - Created interactive visualizations using Python
   - Technologies: Python, Pandas, Matplotlib

EXPERIENCE:
Software Development Intern
ABC Company (Summer 2023)
- Developed web applications using React
- Collaborated with team of 5 developers
- Implemented responsive UI components
"""

# Write test file
with open(test_file_path, 'w', encoding='utf-8') as f:
    f.write(test_content)

print(f"✅Test file created: {test_file_path}")
print(f"📁 File exists: {os.path.exists(test_file_path)}")
print(f"📏 File size: {os.path.getsize(test_file_path)} bytes")

# Test text extraction
print("\n🔍 Testing text extraction...")
extracted_text = extract_resume_text(test_file_path)
print(f"📄 Extracted text length: {len(extracted_text) if extracted_text else 0}")
print(f"📝 Extracted text preview: {extracted_text[:200] if extracted_text else 'None'}")

if extracted_text:
    print("\n🎯 Testing resume analysis...")
    result = analyze_internship_resume(extracted_text)
    print(f"✅ Analysis result: {result.get('success', False)}")
    print(f"📊 Result keys: {list(result.keys())}")
else:
    print("❌ Text extraction failed")

# Cleanup
if os.path.exists(test_file_path):
    os.remove(test_file_path)
    print(f"🧹 Cleaned up test file")