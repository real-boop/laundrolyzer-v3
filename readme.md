# Laundrolyzer

A web application for scraping and analyzing business listings.

## Features

- Scrape business listings from websites
- Display scraped content in a clean format
- Analyze business listings with AI
- Generate PDF reports

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- A GitHub account
- A Vercel account
- Firecrawl API key
- OpenAI API key

### Local Development Setup

1. Clone this repository:
   ```bash
   git clone <your-repository-url>
   cd laundrolyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env.local` file at the root of the project with your API keys:
   ```
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Deploying to Vercel

1. Push your code to a GitHub repository.

2. Sign up or log in to [Vercel](https://vercel.com).

3. Click "Import Project" and select your GitHub repository.

4. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add the environment variables:
     - `FIRECRAWL_API_KEY`: Your Firecrawl API key
     - `OPENAI_API_KEY`: Your OpenAI API key

5. Click "Deploy".

6. After deployment, set up Vercel KV:
   - Go to your project in the Vercel dashboard
   - Navigate to "Storage"
   - Click "Create" and select "KV Database"
   - Follow the setup instructions to create a KV database
   - Vercel will automatically add the necessary environment variables

## Technologies Used

- Next.js
- Tailwind CSS
- Vercel KV for storage
- Firecrawl for web scraping
- OpenAI for analysis
- Framer Motion for animations
- jsPDF for PDF generation