// Test Supabase Connection
// Run this in your browser console after setting up the database tables

async function testSupabaseConnection() {
	console.log("🧪 Testing Supabase Connection...");

	// Check environment variables
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	console.log("📍 Supabase URL:", supabaseUrl);
	console.log("🔑 Supabase Key present:", !!supabaseKey);

	if (!supabaseUrl || !supabaseKey) {
		console.error("❌ Missing Supabase environment variables!");
		console.log("Add these to your .env.local file:");
		console.log(
			"NEXT_PUBLIC_SUPABASE_URL=https://kqijjfivbwudbvkykgyo.supabase.co"
		);
		console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here");
		return;
	}

	try {
		// Test basic connection
		const response = await fetch(`${supabaseUrl}/rest/v1/`, {
			headers: {
				apikey: supabaseKey,
				Authorization: `Bearer ${supabaseKey}`,
			},
		});

		if (response.ok) {
			console.log("✅ Supabase connection working!");
		} else {
			console.error(
				"❌ Supabase connection failed:",
				response.status,
				response.statusText
			);
		}

		// Test table access
		const tablesResponse = await fetch(
			`${supabaseUrl}/rest/v1/resume_analyses?select=id&limit=1`,
			{
				headers: {
					apikey: supabaseKey,
					Authorization: `Bearer ${supabaseKey}`,
				},
			}
		);

		if (tablesResponse.ok) {
			console.log("✅ resume_analyses table accessible!");
		} else {
			console.error("❌ Tables not accessible:", tablesResponse.status);
			console.log(
				"💡 Make sure you ran the setup_tables.sql script in Supabase!"
			);
		}
	} catch (error) {
		console.error("❌ Connection test failed:", error);
	}
}

// Run the test
testSupabaseConnection();
