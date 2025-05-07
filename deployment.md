# Deployment Guide for Laundrolyzer

This guide will walk you through deploying the Laundrolyzer application to Vercel, even if you have no coding experience.

## Step 1: Create a GitHub Repository

1. Sign up or log in to [GitHub](https://github.com).
2. Click the "+" icon in the top-right corner and select "New repository".
3. Name your repository (e.g., "laundrolyzer").
4. Set it to "Public" or "Private" (your choice).
5. Click "Create repository".

## Step 2: Upload Your Code to GitHub

### Option 1: Using GitHub Web Interface (Easiest for beginners)

1. In your new GitHub repository, click "Add file" and then "Upload files".
2. Upload all the files and folders from your project.
3. Click "Commit changes".

### Option 2: Using GitHub Desktop (Alternative for beginners)

1. Download [GitHub Desktop](https://desktop.github.com/).
2. Log in with your GitHub account.
3. Clone your new repository to your computer.
4. Copy all your project files into the repository folder.
5. In GitHub Desktop, you'll see all the changes. Add a commit message like "Initial commit".
6. Click "Commit to main".
7. Click "Push origin" to upload your files to GitHub.

## Step 3: Sign Up for Vercel

1. Go to [Vercel](https://vercel.com).
2. Sign up using your GitHub account.

## Step 4: Deploy Your Application

1. After signing in to Vercel, click "Add New..." and then "Project".
2. Vercel will show you a list of your GitHub repositories. Select your "laundrolyzer" repository.
3. In the configuration step:
   - Framework Preset: Select "Next.js"
   - Root Directory: Leave as default (should be /)
   - Build Command: Leave as default
   - Output Directory: Leave as default
   - Environment Variables: Add the following:
     - Name: `FIRECRAWL_API_KEY`, Value: your Firecrawl API key
     - Name: `OPENAI_API_KEY`, Value: your OpenAI API key
     - Name: `OPENAI_ASSISTANT_ID`, Value: your OpenAI Assistant ID
4. Click "Deploy".

## Step 5: Set Up Vercel KV (Database)

1. After deployment completes, go to your project dashboard in Vercel.
2. Click on the "Storage" tab.
3. Click "Connect" next to KV Database.
4. Follow the setup instructions provided by Vercel:
   - Click "Create" to create a new KV database
   - Select the closest region to your users
   - Give it a name (e.g., "laundrolyzer-kv")
   - Click "Create & Continue"
5. Vercel will automatically add the KV environment variables to your project.
6. Click "Redeploy" to apply the new environment variables.

## Step 6: Test Your Deployed Application

1. After redeployment, click on the "Visit" button to see your live application.
2. Test the following features:
   - Submitting a URL to scrape
   - Viewing the scraped content
   - Analyzing the business listing
   - Downloading a PDF report

## Troubleshooting

If you encounter issues:

1. Check the "Deployments" tab in your Vercel project to view build logs.
2. Ensure your API keys are correctly set up in the environment variables.
3. Make sure the Vercel KV database is properly connected.

## Updating Your Application

If you need to make changes to your application:

1. Make the changes to your local code files.
2. Update your GitHub repository with the new code (using the same method as in Step 2).
3. Vercel will automatically detect the changes and redeploy your application.

## Getting API Keys

### Firecrawl API Key

1. Sign up at [Firecrawl](https://firecrawl.dev/).
2. Navigate to your dashboard.
3. Find and copy your API key.

### OpenAI API Key and Assistant

1. Sign up at [OpenAI](https://platform.openai.com/).
2. Go to your API keys section.
3. Create a new API key and copy it.

### Creating an OpenAI Assistant

1. Go to the [OpenAI platform](https://platform.openai.com/).
2. Navigate to "Assistants" in the left sidebar.
3. Click "Create" to create a new assistant.
4. Configure your assistant:
   - Name: "Business Listing Analyzer" (or your preferred name)
   - Instructions: "You are a business analyst specializing in evaluating business listings. Analyze business listings and provide a detailed report that includes: Overview of the business, Key strengths, Considerations and potential concerns, Recommendation, and Next steps for a potential buyer. Format your analysis in Markdown with appropriate headers, bullet points, and sections."
   - Model: Select GPT-4 or the latest available model
   - Tools: You can enable retrieval and code interpretation if needed
5. Click "Create".
6. Copy the Assistant ID from the assistant details page.