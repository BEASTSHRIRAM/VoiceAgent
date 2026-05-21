# Security Checklist Before Pushing to GitHub

## 🚨 CRITICAL: Secrets Management

### ✅ Before Committing:

- [ ] **Never commit `.env.local` files**
  - These contain API keys and secrets
  - Add to `.gitignore` immediately
  
- [ ] **Check for hardcoded secrets in code**
  ```bash
  # Search for common patterns
  grep -r "sk-proj-" .
  grep -r "LIVEKIT_API_KEY" .
  grep -r "OPENAI_API_KEY" .
  ```

- [ ] **Use `.env.example` for documentation**
  - Shows what variables are needed
  - Never include actual values
  - Commit this file to repo

- [ ] **Verify `.gitignore` is correct**
  ```
  .env.local
  .env
  .env.*.local
  ```

### ✅ If Secrets Were Already Exposed:

1. **Immediately revoke all exposed keys:**
   - LiveKit: https://dashboard.livekit.io → Regenerate API keys
   - OpenAI: https://platform.openai.com/account/api-keys → Delete key
   - Convex: https://dashboard.convex.dev → Check security

2. **Remove from Git history:**
   ```bash
   git rm --cached Roy/.env.local
   git rm --cached hospital-dashboard/.env.local
   git commit -m "Remove .env.local files"
   git push
   ```

3. **Clean Git history (if needed):**
   ```bash
   # Use BFG Repo-Cleaner or git-filter-branch
   # This is more complex - only if secrets were pushed
   ```

---

## 🔍 Code Security Review

### ✅ Check These Files:

- [ ] **Roy/src/agent.py**
  - ✓ No hardcoded API keys
  - ✓ Uses `os.getenv()` for secrets
  - ✓ Proper error handling

- [ ] **hospital-dashboard/app/api/livekit-token/route.ts**
  - ✓ No hardcoded secrets
  - ✓ Uses `process.env` for server-side secrets
  - ✓ Validates input parameters

- [ ] **hospital-dashboard/app/voice/page.tsx**
  - ✓ No hardcoded secrets
  - ✓ Uses `process.env.NEXT_PUBLIC_*` for public URLs only
  - ✓ No sensitive data in client code

### ✅ Environment Variables Best Practices:

**Server-side (Backend/API Routes):**
```typescript
// ✓ CORRECT - No NEXT_PUBLIC_ prefix
LIVEKIT_API_SECRET=secret_value
OPENAI_API_KEY=sk-...

// ✗ WRONG - Would expose to client
NEXT_PUBLIC_LIVEKIT_API_SECRET=secret_value
```

**Client-side (Frontend):**
```typescript
// ✓ CORRECT - Public URLs only
NEXT_PUBLIC_LIVEKIT_URL=wss://...
NEXT_PUBLIC_CONVEX_URL=https://...

// ✗ WRONG - Never expose secrets
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

---

## 📋 Pre-Push Checklist

### Before `git push`:

- [ ] `.gitignore` includes `.env.local`
- [ ] `.env.example` files exist and are committed
- [ ] No `.env.local` files in git status
- [ ] No hardcoded API keys in code
- [ ] No secrets in comments
- [ ] No secrets in console.log statements
- [ ] All environment variables use `os.getenv()` or `process.env`
- [ ] Server-side secrets don't have `NEXT_PUBLIC_` prefix
- [ ] Client-side variables have `NEXT_PUBLIC_` prefix

### Verify with Git:

```bash
# Check what will be committed
git status

# Search for secrets in staged files
git diff --cached | grep -i "api_key\|secret\|sk-proj"

# Check entire repo for secrets
grep -r "sk-proj-" . --exclude-dir=.git
grep -r "LIVEKIT_API_SECRET" . --exclude-dir=.git
```

---

## 🔐 After Pushing

### Monitor for Exposure:

1. **GitHub Secret Scanning**
   - GitHub automatically scans for exposed secrets
   - Check Settings → Security & analysis
   - If found, revoke immediately

2. **Third-party Services**
   - GitGuardian: https://www.gitguardian.com
   - TruffleHog: https://github.com/trufflesecurity/trufflehog
   - Snyk: https://snyk.io

3. **Set up pre-commit hooks:**
   ```bash
   # Install pre-commit
   pip install pre-commit
   
   # Create .pre-commit-config.yaml
   repos:
     - repo: https://github.com/Yelp/detect-secrets
       rev: v1.4.0
       hooks:
         - id: detect-secrets
   
   # Install hooks
   pre-commit install
   ```

---

## 📚 Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App: Config](https://12factor.net/config)
- [Detect Secrets](https://github.com/Yelp/detect-secrets)

---

## ✅ Status

- [ ] All secrets removed from code
- [ ] `.gitignore` configured
- [ ] `.env.example` files created
- [ ] Ready to push to GitHub

**Last Updated:** May 2026  
**Status:** Ready for Public Repository ✅
