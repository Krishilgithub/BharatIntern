import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// For now, return mock extracted text
		// In production, you would use libraries like pdf-parse or pdf2pic
		const mockText = `
      John Doe
      Software Developer
      john.doe@email.com | (555) 123-4567 | San Francisco, CA
      
      PROFESSIONAL SUMMARY
      Experienced software developer with 5+ years in full-stack development.
      Skilled in React, Node.js, Python, and cloud technologies.
      
      EXPERIENCE
      Senior Frontend Developer | Tech Solutions Inc. | 2021-2024
      • Developed responsive web applications using React and TypeScript
      • Improved application performance by 40% through optimization
      • Led a team of 3 junior developers on multiple projects
      • Collaborated with UX/UI designers to implement pixel-perfect designs
      
      Frontend Developer | StartupXYZ | 2019-2021
      • Built dynamic websites using JavaScript, HTML5, and CSS3
      • Integrated REST APIs and third-party services
      • Maintained 95% test coverage across all frontend components
      
      EDUCATION
      Bachelor of Science in Computer Science
      University of California, Berkeley | 2019
      
      SKILLS
      Programming: JavaScript, TypeScript, Python, Java
      Frontend: React, Vue.js, HTML5, CSS3, SASS
      Backend: Node.js, Express.js, Django, Flask
      Database: PostgreSQL, MongoDB, Redis
      Cloud: AWS, Docker, Kubernetes
      Tools: Git, Jest, Webpack, CI/CD
      
      CERTIFICATIONS
      • AWS Certified Developer Associate (2023)
      • Google Cloud Professional Developer (2022)
      • React Professional Certification (2021)
    `;

		return NextResponse.json({
			text: mockText.trim(),
			filename: file.name,
			size: file.size,
		});
	} catch (error) {
		console.error("PDF extraction error:", error);
		return NextResponse.json(
			{ error: "Failed to extract text from PDF" },
			{ status: 500 }
		);
	}
}
