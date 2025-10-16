const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/pages/candidate/ResumeAnalyzer.js', 'utf8');

// Replace the error check
content = content.replace(
  'error.message.includes("formatting_score")',
  '(error.message.includes("formatting_score") || error.message.includes("ats_score"))'
);

// Write it back
fs.writeFileSync('src/pages/candidate/ResumeAnalyzer.js', content);

console.log('✅ Fixed error check to include ats_score');
