/**
 * AI Service Configuration
 * Manages different AI providers and their configurations
 */

const axios = require("axios");

class AIService {
  constructor() {
    this.providers = {
      openrouter: {
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000" ||
            process.env.HTTP_REFERER ,
        },
      },
    };
  }

  async generateResponse(question, context, options = {}) {
    const {
      model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
      maxTokens = 2000,
      temperature = 0.7,
      systemPrompt = "You are an AI that helps summarize and answer questions about PDF documents using provided content. Be concise and cite page numbers if known.",
    } = options;

    try {
      // Development-friendly fallback: if no API key is configured, return a mock response
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        const preview = (context || "").slice(0, 600).trim();
        const answer = `OPENROUTER_API_KEY is not configured on the server. Returning a mock response for development.\n\nQuestion: ${question}\n\nContext preview (first 600 chars):\n${preview}`;
        return {
          answer,
          citations: this.extractCitations(answer),
          model: "mock/local",
          usage: null,
        };
      }

      const response = await axios.post(
        `${this.providers.openrouter.baseURL}/chat/completions`,
        {
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Use this context to answer the question:\n\n${context.slice(
                0,
                12000
              )}\n\nQuestion: ${question}`,
            },
          ],
          max_tokens: maxTokens,
          temperature,
        },
        {
          headers: {
            ...this.providers.openrouter.headers,
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const answer = response.data.choices[0].message.content;

      // Extract page citations
      const citations = this.extractCitations(answer);

      return {
        answer,
        citations,
        model,
        usage: response.data.usage || null,
      };
    } catch (error) {
      console.error("AI Service Error:", error.response?.data || error.message);
      throw new Error(
        `AI response failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Extract page citations from AI response
   * @param {string} text - AI response text
   * @returns {Array<number>} Array of page numbers
   */
  extractCitations(text) {
    const pageRegex = /page (\d+)/gi;
    const citations = [...text.matchAll(pageRegex)].map((match) =>
      parseInt(match[1])
    );
    return [...new Set(citations)]; // Remove duplicates
  }

  /**
   * Get available models (for future use)
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(
        `${this.providers.openrouter.baseURL}/models`,
        {
          headers: {
            ...this.providers.openrouter.headers,
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch models:", error.message);
      return [];
    }
  }

  /**
   * Validate API key
   * @returns {Promise<boolean>} Whether API key is valid
   */
  async validateAPIKey() {
    try {
      await this.getAvailableModels();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new AIService();
