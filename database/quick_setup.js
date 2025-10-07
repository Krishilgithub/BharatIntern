// Quick Database Setup Script
// Run this in your browser console to create tables programmatically

async function createSupabaseTables() {
	console.log("🔧 Creating Supabase tables...");

	const supabaseUrl =
		process.env.NEXT_PUBLIC_SUPABASE_URL ||
		"https://kqijjfivbwudbvkykgyo.supabase.co";
	const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaWpqZml2Ynd1ZGJ2a3lrZ3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDA5NjAsImV4cCI6MjA3MzQxNjk2MH0.JW3Or03UFI0T0dDkloXHQ3yhpx-V3A7g4tQDi66uFCo";

	if (!supabaseKey) {
		console.error("❌ Supabase anon key not found!");
		return;
	}

	const sqlStatements = [
		// Create resume_analyses table
		`CREATE TABLE IF NOT EXISTS public.resume_analyses (
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
        );`,

		// Create extracted_skills table
		`CREATE TABLE IF NOT EXISTS public.extracted_skills (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
            skill_name TEXT NOT NULL,
            confidence INTEGER,
            category TEXT,
            level TEXT,
            years_experience INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

		// Create resume_improvements table
		`CREATE TABLE IF NOT EXISTS public.resume_improvements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
            section TEXT NOT NULL,
            priority TEXT,
            suggestion TEXT NOT NULL,
            impact TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

		// Create career_suggestions table
		`CREATE TABLE IF NOT EXISTS public.career_suggestions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
            job_title TEXT NOT NULL,
            match_percentage INTEGER,
            reason TEXT,
            salary_range TEXT,
            skills_needed TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

		// Create ats_compatibility table
		`CREATE TABLE IF NOT EXISTS public.ats_compatibility (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
            score INTEGER NOT NULL,
            issues JSONB,
            recommendations TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
	];

	// Enable RLS and create basic policies
	const rlsStatements = [
		"ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;",
		"ALTER TABLE public.extracted_skills ENABLE ROW LEVEL SECURITY;",
		"ALTER TABLE public.resume_improvements ENABLE ROW LEVEL SECURITY;",
		"ALTER TABLE public.career_suggestions ENABLE ROW LEVEL SECURITY;",
		"ALTER TABLE public.ats_compatibility ENABLE ROW LEVEL SECURITY;",

		`CREATE POLICY "Users can manage their own analyses" ON public.resume_analyses
            FOR ALL USING (auth.uid() = user_id);`,

		`CREATE POLICY "Users can manage related skills" ON public.extracted_skills
            FOR ALL USING (EXISTS (
                SELECT 1 FROM public.resume_analyses 
                WHERE id = analysis_id AND user_id = auth.uid()
            ));`,

		`CREATE POLICY "Users can manage related improvements" ON public.resume_improvements
            FOR ALL USING (EXISTS (
                SELECT 1 FROM public.resume_analyses 
                WHERE id = analysis_id AND user_id = auth.uid()
            ));`,

		`CREATE POLICY "Users can manage related career suggestions" ON public.career_suggestions
            FOR ALL USING (EXISTS (
                SELECT 1 FROM public.resume_analyses 
                WHERE id = analysis_id AND user_id = auth.uid()
            ));`,

		`CREATE POLICY "Users can manage related ATS compatibility" ON public.ats_compatibility
            FOR ALL USING (EXISTS (
                SELECT 1 FROM public.resume_analyses 
                WHERE id = analysis_id AND user_id = auth.uid()
            ));`,
	];

	try {
		// Execute table creation statements
		for (const sql of sqlStatements) {
			console.log("📝 Executing:", sql.substring(0, 50) + "...");

			const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
				method: "POST",
				headers: {
					apikey: supabaseKey,
					Authorization: `Bearer ${supabaseKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ sql }),
			});

			if (!response.ok) {
				console.warn("⚠️ SQL statement may have failed:", response.status);
			}
		}

		console.log("✅ Database tables creation attempted!");
		console.log(
			"💡 If this method doesn't work, you must use the Supabase SQL Editor."
		);

		// Test table access
		const testResponse = await fetch(
			`${supabaseUrl}/rest/v1/resume_analyses?select=id&limit=1`,
			{
				headers: {
					apikey: supabaseKey,
					Authorization: `Bearer ${supabaseKey}`,
				},
			}
		);

		if (testResponse.ok) {
			console.log("✅ Tables are now accessible!");
		} else {
			console.error(
				"❌ Tables still not accessible. Use Supabase SQL Editor method."
			);
		}
	} catch (error) {
		console.error("❌ Database setup failed:", error);
		console.log("💡 Please use the Supabase SQL Editor method instead.");
	}
}

// Run the setup
createSupabaseTables();
