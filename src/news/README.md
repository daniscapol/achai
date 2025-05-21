# AI News Feature

This directory contains the data and scripts for the AI News feature of the MCP Marketplace website.

## Overview

The AI News feature provides users with up-to-date information about the latest developments in the AI world, focusing on:

- New model releases (Claude, GPT, Gemini, Llama, etc.)
- Research breakthroughs and papers
- Business developments (funding, acquisitions, etc.)
- Application innovations
- Safety and ethics discussions

## Automation Architecture

The news are automatically updated through a combination of:

1. **Data Collection**: Scripts that monitor AI company blogs, arXiv, and other news sources
2. **Content Generation**: Using OpenAI's API to generate summaries, extract tags, and categorize articles
3. **GitHub Actions**: Scheduled workflow that runs the updater script daily

## Files in this Directory

- `news_data.json`: The primary data store for news articles
- `news_updater.js`: Script for automatically updating the news database
- `README.md`: This documentation file

## How the Automation Works

1. The GitHub Actions workflow in `.github/workflows/update-news.yml` runs on a schedule (daily at 6 AM UTC)
2. It executes the `news_updater.js` script, which:
   - Fetches the latest news from various sources
   - Generates summaries using OpenAI's API
   - Extracts relevant tags and categories
   - Updates the `news_data.json` file
3. The changes are committed and pushed automatically
4. The website displays the updated news to users

## Manual Updates

To manually add a news article:

1. Edit the `news_data.json` file
2. Add a new article object at the beginning of the array
3. Ensure the article has all required fields (see structure below)
4. If needed, add an image to `/public/assets/news-images/`

## Article Structure

Each article in the JSON file follows this structure:

```json
{
  "id": "unique-article-id",
  "title": "Article Title",
  "summary": "A concise summary of the article...",
  "date": "YYYY-MM-DD",
  "source": "Source Name",
  "source_url": "https://source.com",
  "image_url": "/assets/news-images/image.jpg",
  "category": "Category Name",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "full_article_url": "https://source.com/full-article"
}
```

## Setting Up the OpenAI API Key

For the news automation to work, you need to set up the OpenAI API key as a GitHub secret:

1. Go to your repository's Settings
2. Click on Secrets > Actions
3. Add a new repository secret named `OPENAI_API_KEY`
4. Enter your OpenAI API key as the value

**IMPORTANT: Never commit API keys directly to the repository.**

## Further Development

Future plans for the news feature include:

- Adding more diverse news sources
- Implementing image generation for news articles
- Creating a dedicated RSS feed for the news
- Adding user interaction features (comments, favorites)
- Implementing a news search API endpoint