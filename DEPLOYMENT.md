# Deploy Mariels Brow Academy to Vercel

Follow these steps to deploy your academy to marielsbrowacademy.com

## Step 1: Download Your Project

1. Download all the code from this Figma Make project to your computer
2. Extract the ZIP file to a folder

## Step 2: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com)
2. Click "Sign up" and create a free account

## Step 3: Create a New Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it: `mariels-brow-academy`
3. Keep it **Private** (recommended)
4. Click "Create repository"
5. **Don't** add README, .gitignore, or license (we already have these)

## Step 4: Upload Code to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Download [GitHub Desktop](https://desktop.github.com)
2. Sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Browse to your project folder
5. Click "Publish repository"

### Option B: Using Command Line

Open Terminal/Command Prompt in your project folder:

```bash
git init
git add .
git commit -m "Initial commit - Mariels Brow Academy"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mariels-brow-academy.git
git push -u origin main
```

(Replace YOUR-USERNAME with your GitHub username)

## Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Import Project"
5. Find `mariels-brow-academy` and click "Import"
6. **Important:** Before clicking "Deploy", add environment variables:

### Add Environment Variables:

Click "Environment Variables" and add these 3 variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://gjiitwltkcetkkxksjwq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_GQKMr9RZlRL7zyPPsiz31A_Df0Yowdr` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_placeholder` (update later with real key) |

7. Click "Deploy"
8. Wait 2-3 minutes for deployment to complete ✨

## Step 6: Connect Your Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Type `marielsbrowacademy.com` and click "Add"
4. Vercel will show you DNS records to add

### Update DNS at Your Domain Registrar:

Go to where you bought marielsbrowacademy.com (GoDaddy, Namecheap, etc.):

**Add these DNS records:**

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

5. Wait 5-60 minutes for DNS to propagate
6. Your site will be live at marielsbrowacademy.com! 🎉

## Step 7: Enable SSL (Automatic)

Vercel automatically adds FREE SSL certificates. Your site will be:
- ✅ https://marielsbrowacademy.com
- ✅ Fully secure with padlock icon

## Updating Your Site Later

Whenever you make changes:

1. Make changes in your local code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Updated course content"
   git push
   ```
3. Vercel automatically deploys updates in 2 minutes! 🚀

## Troubleshooting

**Site not loading?**
- Check DNS settings are correct
- Wait up to 24 hours for DNS propagation
- Verify environment variables are set in Vercel

**Build errors?**
- Check that all environment variables are added
- Look at build logs in Vercel dashboard

**Need help?**
- Vercel has excellent support docs
- Check deployment logs for errors

---

## Next Steps After Deployment

1. ✅ Test signup/login on your live site
2. ✅ Create your admin account
3. ✅ Set `is_admin = TRUE` in Supabase
4. ✅ Add real Stripe keys when ready to accept payments
5. ✅ Add your course content
6. ✅ Share marielsbrowacademy.com with the world! 🌎
