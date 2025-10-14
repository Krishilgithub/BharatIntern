// Database Setup Component
// Add this to your app temporarily to create the database tables

import { useState } from "react";
import { supabase } from "../services/resumeDatabase";

export default function DatabaseSetup() {
	const [status, setStatus] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const createTables = async () => {
		setIsCreating(true);
		setStatus("Creating tables...");

		try {
			// Create main resume_analyses table
			const { error: resumeTableError } = await supabase.rpc("exec_sql", {
				sql: `
                CREATE TABLE IF NOT EXISTS public.resume_analyses (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID NOT NULL,
                    filename TEXT NOT NULL,
                    file_type TEXT,
                    file_size INTEGER,
                    extracted_text TEXT,
                    overall_score INTEGER,
                    analysis_data JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `,
			});

			if (resumeTableError) {
				console.error("Resume table error:", resumeTableError);
			}

			// Create extracted_skills table
			await supabase.rpc("exec_sql", {
				sql: `
                CREATE TABLE IF NOT EXISTS public.extracted_skills (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
                    skill_name TEXT NOT NULL,
                    confidence INTEGER,
                    category TEXT,
                    level TEXT,
                    years_experience INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `,
			});

			// Create other tables...
			await supabase.rpc("exec_sql", {
				sql: `
                CREATE TABLE IF NOT EXISTS public.resume_improvements (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
                    section TEXT NOT NULL,
                    priority TEXT,
                    suggestion TEXT NOT NULL,
                    impact TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `,
			});

			await supabase.rpc("exec_sql", {
				sql: `
                CREATE TABLE IF NOT EXISTS public.career_suggestions (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
                    job_title TEXT NOT NULL,
                    match_percentage INTEGER,
                    reason TEXT,
                    salary_range TEXT,
                    skills_needed TEXT[],
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `,
			});

			await supabase.rpc("exec_sql", {
				sql: `
                CREATE TABLE IF NOT EXISTS public.ats_compatibility (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
                    score INTEGER NOT NULL,
                    issues JSONB,
                    recommendations TEXT[],
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `,
			});

			setStatus("✅ Tables created successfully!");
		} catch (error) {
			console.error("Database setup error:", error);
			setStatus(`❌ Error: ${error.message}`);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg m-4">
			<h3 className="text-lg font-bold text-yellow-800 mb-4">
				Database Setup Required
			</h3>
			<p className="text-yellow-700 mb-4">
				The resume analyzer needs database tables to be created.
			</p>
			<button
				onClick={createTables}
				disabled={isCreating}
				className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
			>
				{isCreating ? "Creating Tables..." : "Create Database Tables"}
			</button>
			{status && <p className="mt-4 p-2 bg-white rounded border">{status}</p>}
		</div>
	);
}
