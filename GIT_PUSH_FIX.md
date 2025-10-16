# Fix Git Push Protection - API Key in History

## The Problem
GitHub detected your Perplexity API key in commit `b8aa202` in these files:
- INTEGRATION_COMPLETE.md:32
- PERPLEXITY_INTEGRATION.md:24
- PERPLEXITY_ONLY_INTEGRATION.md:106
- QUICKSTART_PERPLEXITY.md:28

Even though we removed it in the latest commit, it still exists in Git history.

## Solution Options

### Option 1: Force Push with Rewritten History (Recommended for personal repos)

```powershell
# Interactive rebase to edit the commit
git rebase -i HEAD~2

# When the editor opens, change 'pick' to 'edit' for commit b8aa202
# Save and close

# Now remove the API keys
node remove-api-keys.js

# Stage the changes
git add INTEGRATION_COMPLETE.md PERPLEXITY_INTEGRATION.md PERPLEXITY_ONLY_INTEGRATION.md QUICKSTART_PERPLEXITY.md

# Amend the commit
git commit --amend --no-edit

# Continue the rebase
git rebase --continue

# Force push (this rewrites history)
git push --force origin master
```

### Option 2: Simpler - Use GitHub's Secret Bypass (Easier)

1. Click this link: https://github.com/Krishilgithub/BharatIntern/security/secret-scanning/unblock-secret/348iiVowrujSYwsdYw5oLLBA3hC
2. GitHub will ask you to confirm that you want to allow this secret
3. Then you can push normally

**Note**: After using this option, you should still rotate (change) your API key for security.

### Option 3: Reset and Create New Commits (Cleanest)

```powershell
# Reset to the commit before the API key was added
git reset --soft 13dfb24

# Now make a new commit without the API key
git add .
git commit -m "feat: Add Perplexity AI integration without exposing API key"

# Force push
git push --force origin master
```

## Recommendation

For this case, I recommend **Option 3** - it's the cleanest and safest approach.

Would you like me to execute Option 3 for you?
