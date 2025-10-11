/**
 * GenAI Service
 * 
 * This service handles all GenAI operations for:
 * - Application analysis and scoring
 * - Document summarization
 * - Student data insights
 * - Future AI-powered features
 */

import { OpenAIClient } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';

class GenAIService {
  constructor() {
    // Azure OpenAI configuration from environment variables
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;
    
    // Initialize OpenAI client
    if (this.endpoint && this.apiKey) {
      this.client = new OpenAIClient(this.endpoint, new AzureKeyCredential(this.apiKey));
    } else {
      console.warn('⚠️  Azure OpenAI not configured - GenAI features will be limited');
      this.client = null;
    }
  }

  /**
   * Analyze application quality and provide scoring
   * @param {Object} applicationData - Student application data
   * @returns {Promise<Object>} Analysis results with score and feedback
   */
  async analyzeApplication(applicationData) {
    if (!this.client) {
      return this.getFallbackAnalysis(applicationData);
    }

    try {
      const { gpa, course, department, name, email } = applicationData;
      
      const prompt = `
        Analyze this college application:
        
        Student: ${name} (${email})
        Course: ${course}
        Department: ${department}
        GPA: ${gpa}
        
        Please provide:
        1. Application quality score (1-10)
        2. Strengths and weaknesses
        3. Recommendations for improvement
        4. Overall assessment
        
        Format your response as JSON with fields: score, strengths, weaknesses, recommendations, assessment.
      `;

      const result = await this.client.getCompletions(this.deploymentId, prompt, {
        maxTokens: 500,
        temperature: 0.7
      });

      const response = result.choices[0]?.text?.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, return structured response
        return {
          score: this.extractScore(response),
          strengths: this.extractStrengths(response),
          weaknesses: this.extractWeaknesses(response),
          recommendations: this.extractRecommendations(response),
          assessment: response,
          source: 'azure-openai'
        };
      }
    } catch (error) {
      console.error('❌ Error analyzing application:', error);
      return this.getFallbackAnalysis(applicationData);
    }
  }

  /**
   * Summarize PDF document content
   * @param {string} pdfText - Extracted text from PDF
   * @returns {Promise<string>} Document summary
   */
  async summarizeDocument(pdfText) {
    if (!this.client) {
      return this.getFallbackSummary(pdfText);
    }

    try {
      const prompt = `
        Summarize the following document content in 2-3 sentences for admin preview:
        
        ${pdfText.substring(0, 2000)} // Limit text length
        
        Focus on key information relevant to college application.
      `;

      const result = await this.client.getCompletions(this.deploymentId, prompt, {
        maxTokens: 200,
        temperature: 0.5
      });

      return result.choices[0]?.text?.trim() || 'No summary available';
    } catch (error) {
      console.error('❌ Error summarizing document:', error);
      return this.getFallbackSummary(pdfText);
    }
  }

  /**
   * Generate insights from student data
   * @param {Array} applications - Array of application data
   * @returns {Promise<Object>} Data insights and trends
   */
  async generateInsights(applications) {
    if (!this.client || applications.length === 0) {
      return this.getFallbackInsights(applications);
    }

    try {
      const dataSummary = this.prepareDataSummary(applications);
      
      const prompt = `
        Analyze the following college application data and provide insights:
        
        ${JSON.stringify(dataSummary, null, 2)}
        
        Please provide:
        1. Key trends and patterns
        2. Department popularity analysis
        3. GPA distribution insights
        4. Recommendations for admissions process
        
        Format as JSON with fields: trends, departmentAnalysis, gpaInsights, recommendations.
      `;

      const result = await this.client.getCompletions(this.deploymentId, prompt, {
        maxTokens: 800,
        temperature: 0.6
      });

      const response = result.choices[0]?.text?.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          trends: 'Data analysis in progress',
          departmentAnalysis: 'Department analysis unavailable',
          gpaInsights: 'GPA insights unavailable',
          recommendations: response,
          source: 'azure-openai'
        };
      }
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      return this.getFallbackInsights(applications);
    }
  }

  /**
   * Score application quality (legacy method for backward compatibility)
   * @param {Object} params - Scoring parameters
   * @returns {Promise<Object>} Score and feedback
   */
  async scoreApplicationQuality({ gpa, course, department }) {
    const applicationData = { gpa, course, department, name: 'Student', email: 'student@example.com' };
    const analysis = await this.analyzeApplication(applicationData);
    
    return {
      score: analysis.score,
      feedback: analysis.assessment,
      source: analysis.source || 'fallback'
    };
  }

  /**
   * Fallback analysis when GenAI is not available
   * @param {Object} applicationData - Application data
   * @returns {Object} Basic analysis
   */
  getFallbackAnalysis(applicationData) {
    const { gpa, course, department } = applicationData;
    const gpaNum = parseFloat(gpa) || 0;
    
    let score = 5;
    let assessment = 'Basic analysis available';
    
    if (gpaNum >= 3.5) {
      score = 8;
      assessment = 'Strong academic performance';
    } else if (gpaNum >= 3.0) {
      score = 6;
      assessment = 'Good academic performance';
    } else {
      score = 4;
      assessment = 'Academic performance needs improvement';
    }
    
    return {
      score,
      strengths: ['Application submitted successfully'],
      weaknesses: ['Detailed analysis unavailable'],
      recommendations: ['Consider improving academic performance'],
      assessment,
      source: 'fallback'
    };
  }

  /**
   * Fallback summary when GenAI is not available
   * @param {string} pdfText - PDF text
   * @returns {string} Basic summary
   */
  getFallbackSummary(pdfText) {
    const words = pdfText.split(' ').slice(0, 20).join(' ');
    return `Document preview: ${words}... (Full analysis requires Azure OpenAI configuration)`;
  }

  /**
   * Fallback insights when GenAI is not available
   * @param {Array} applications - Application data
   * @returns {Object} Basic insights
   */
  getFallbackInsights(applications) {
    const totalApplications = applications.length;
    const departments = [...new Set(applications.map(app => app.department))];
    const avgGpa = applications.reduce((sum, app) => sum + (parseFloat(app.gpa) || 0), 0) / totalApplications;
    
    return {
      trends: `${totalApplications} applications received`,
      departmentAnalysis: `Applications across ${departments.length} departments`,
      gpaInsights: `Average GPA: ${avgGpa.toFixed(2)}`,
      recommendations: 'Consider implementing Azure OpenAI for detailed insights',
      source: 'fallback'
    };
  }

  /**
   * Prepare data summary for analysis
   * @param {Array} applications - Application data
   * @returns {Object} Summarized data
   */
  prepareDataSummary(applications) {
    const departments = {};
    const gpaRange = { high: 0, medium: 0, low: 0 };
    
    applications.forEach(app => {
      // Department analysis
      departments[app.department] = (departments[app.department] || 0) + 1;
      
      // GPA analysis
      const gpa = parseFloat(app.gpa) || 0;
      if (gpa >= 3.5) gpaRange.high++;
      else if (gpa >= 3.0) gpaRange.medium++;
      else gpaRange.low++;
    });
    
    return {
      totalApplications: applications.length,
      departments,
      gpaDistribution: gpaRange,
      dateRange: {
        earliest: applications[0]?.created_at,
        latest: applications[applications.length - 1]?.created_at
      }
    };
  }

  /**
   * Extract score from text response
   * @param {string} text - Response text
   * @returns {number} Extracted score
   */
  extractScore(text) {
    const scoreMatch = text.match(/score[:\s]*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 5;
  }

  /**
   * Extract strengths from text response
   * @param {string} text - Response text
   * @returns {Array} Extracted strengths
   */
  extractStrengths(text) {
    const strengthsMatch = text.match(/strengths?[:\s]*([^.]+)/i);
    return strengthsMatch ? [strengthsMatch[1].trim()] : ['Analysis in progress'];
  }

  /**
   * Extract weaknesses from text response
   * @param {string} text - Response text
   * @returns {Array} Extracted weaknesses
   */
  extractWeaknesses(text) {
    const weaknessesMatch = text.match(/weaknesses?[:\s]*([^.]+)/i);
    return weaknessesMatch ? [weaknessesMatch[1].trim()] : ['Analysis in progress'];
  }

  /**
   * Extract recommendations from text response
   * @param {string} text - Response text
   * @returns {Array} Extracted recommendations
   */
  extractRecommendations(text) {
    const recommendationsMatch = text.match(/recommendations?[:\s]*([^.]+)/i);
    return recommendationsMatch ? [recommendationsMatch[1].trim()] : ['Analysis in progress'];
  }

  /**
   * Test GenAI service connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    if (!this.client) {
      return false;
    }
    
    try {
      await this.client.getCompletions(this.deploymentId, 'Test connection', {
        maxTokens: 10
      });
      return true;
    } catch (error) {
      console.error('❌ GenAI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new GenAIService();
