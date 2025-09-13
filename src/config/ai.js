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
          "HTTP-Referer": process.env.HTTP_REFERER || "http://localhost:3000",
        },
      },
    };

    // Default model limits (approximate)
    this.modelLimits = {
      "anthropic/claude-3.5-sonnet": 200000,
      "gpt-4o-mini": 128000,
      "gpt-4o": 128000,
    };
  }

  // Utility: estimate token count (roughly 4 chars ≈ 1 token for English text)
  estimateTokens(text) {
    return Math.ceil((text || "").length / 4);
  }

  async generateResponse(question, context, options = {}) {
    const {
      model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
      temperature = 0.7,
      systemPrompt = "You are an AI that helps summarize and answer questions about PDF documents using provided content. Be concise and cite page numbers if known.",
    } = options;

    try {
      // Development-friendly fallback: if no API key is configured
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        const preview = (context || "").slice(0, 600).trim();
        const answer = `OPENROUTER_API_KEY is not configured. Mock response:\n\nQuestion: ${question}\n\nContext preview:\n${preview}`;
        return {
          answer,
          citations: this.extractCitations(answer),
          model: "mock/local",
          usage: null,
        };
      }

      // Estimate input tokens
      const inputText = `${systemPrompt} ${context.slice(
        0,
        12000
      )} ${question}`;
      const inputTokens = this.estimateTokens(inputText);

      // Get model max context length
      const maxContext = this.modelLimits[model] || 8000; // fallback if unknown

      // Leave buffer to avoid errors
      const reserve = 1000;
      const safeMaxTokens = Math.max(1, maxContext - inputTokens - reserve);

      console.log(`🔢 Input tokens: ${inputTokens}`);
      console.log(`🛡️ Safe max_tokens: ${safeMaxTokens}`);

      const response = await axios.post(
        `${this.providers.openrouter.baseURL}/chat/completions`,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Use this context to answer the question:\n\n${context.slice(
                0,
                12000
              )}\n\nQuestion: ${question}`,
            },
          ],
          max_tokens: safeMaxTokens,
          temperature,
        },
        {
          headers: {
            ...this.providers.openrouter.headers,
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000, // 30 sec
        }
      );

      const answer = response.data.choices[0].message.content;

      return {
        answer,
        citations: this.extractCitations(answer),
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
   */
  extractCitations(text) {
    const pageRegex = /page (\d+)/gi;
    const citations = [...text.matchAll(pageRegex)].map((match) =>
      parseInt(match[1])
    );
    return [...new Set(citations)];
  }

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
