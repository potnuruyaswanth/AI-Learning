import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD1KxmprDNU0RRUtoSNtun8CteYQY3WUf0';

// Initialize the new Gemini AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Using gemini-2.5-flash - the latest model
const MODEL_NAME = 'gemini-2.5-flash';

// Log the API key being used (first few chars only for debugging)
console.log(`Gemini initialized with API key starting with: ${GEMINI_API_KEY.substring(0, 10)}...`);

export interface SummaryResult {
  summary: string;
  wordCount: number;
}

export interface BulletPointsResult {
  bulletPoints: string[];
  totalPoints: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  totalQuestions: number;
}

// Summarize file content
export async function summarizeContent(content: string): Promise<SummaryResult> {
  const prompt = `Please provide a comprehensive summary of the following text. The summary should capture the main ideas, key points, and overall theme of the content. Keep it concise but informative.

Text to summarize:
${content}

Provide your response as a clear, well-structured summary.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const summary = response.text || '';
    
    return {
      summary,
      wordCount: summary.split(/\s+/).length
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

// Generate bullet points
export async function generateBulletPoints(content: string, maxPoints: number = 10): Promise<BulletPointsResult> {
  const prompt = `Analyze the following text and extract the most important points as bullet points. 
Provide up to ${maxPoints} key bullet points that capture the essential information.
Each bullet point should be clear, concise, and self-contained.

Text to analyze:
${content}

Format your response as a JSON array of strings, where each string is a bullet point.
Example: ["Point 1", "Point 2", "Point 3"]

Only respond with the JSON array, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    // Parse the JSON response
    let bulletPoints: string[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bulletPoints = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines if JSON parsing fails
        bulletPoints = text.split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }
    } catch {
      // Fallback parsing
      bulletPoints = text.split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    
    return {
      bulletPoints: bulletPoints.slice(0, maxPoints),
      totalPoints: bulletPoints.length
    };
  } catch (error) {
    console.error('Error generating bullet points:', error);
    throw new Error('Failed to generate bullet points');
  }
}

// Extract key insights
export interface KeyInsightsResult {
  insights: string[];
  mainTheme: string;
  targetAudience: string;
}

export async function extractKeyInsights(content: string): Promise<KeyInsightsResult> {
  const prompt = `Analyze the following text and extract key insights.

Text:
${content}

Provide your response in the following JSON format:
{
  "insights": ["Insight 1", "Insight 2", "Insight 3", "Insight 4", "Insight 5"],
  "mainTheme": "The main theme or topic of the content",
  "targetAudience": "Who would benefit most from this content"
}

Provide 5-7 meaningful insights that go beyond just summarizing - offer deeper analysis and implications.
Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse insights');
  } catch (error) {
    console.error('Error extracting insights:', error);
    throw new Error('Failed to extract key insights');
  }
}

// Generate flashcards for studying
export interface Flashcard {
  front: string;
  back: string;
  category: string;
}

export interface FlashcardsResult {
  flashcards: Flashcard[];
  totalCards: number;
}

export async function generateFlashcards(content: string, numberOfCards: number = 10): Promise<FlashcardsResult> {
  const prompt = `Create ${numberOfCards} flashcards for studying the following content.

Text:
${content}

Generate flashcards in the following JSON format:
{
  "flashcards": [
    {
      "front": "Question or term on front of card",
      "back": "Answer or definition on back of card",
      "category": "Category like 'Definition', 'Concept', 'Fact', 'Application'"
    }
  ]
}

Rules:
1. Create cards that help with memorization and understanding
2. Mix different types: definitions, concepts, facts, and applications
3. Keep front concise, back can be more detailed
4. Make cards that are useful for active recall

Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        flashcards: data.flashcards.slice(0, numberOfCards),
        totalCards: data.flashcards.length
      };
    }
    throw new Error('Failed to parse flashcards');
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
}

// Extract key terms and glossary
export interface GlossaryTerm {
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
}

export interface GlossaryResult {
  terms: GlossaryTerm[];
  totalTerms: number;
}

export async function extractGlossary(content: string): Promise<GlossaryResult> {
  const prompt = `Extract important terms and create a glossary from the following text.

Text:
${content}

Generate a glossary in the following JSON format:
{
  "terms": [
    {
      "term": "The term or concept",
      "definition": "Clear, concise definition",
      "importance": "high" or "medium" or "low"
    }
  ]
}

Rules:
1. Identify key terms, concepts, and jargon
2. Provide clear, understandable definitions
3. Rate importance based on how central the term is to understanding the content
4. Include 8-15 terms

Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        terms: data.terms,
        totalTerms: data.terms.length
      };
    }
    throw new Error('Failed to parse glossary');
  } catch (error) {
    console.error('Error extracting glossary:', error);
    throw new Error('Failed to extract glossary');
  }
}

// Generate related topics for further learning
export interface RelatedTopic {
  topic: string;
  relevance: string;
  searchQuery: string;
}

export interface RelatedTopicsResult {
  topics: RelatedTopic[];
  prerequisites: string[];
  advancedTopics: string[];
}

export async function suggestRelatedTopics(content: string): Promise<RelatedTopicsResult> {
  const prompt = `Based on the following text, suggest related topics for further learning.

Text:
${content}

Generate suggestions in the following JSON format:
{
  "topics": [
    {
      "topic": "Related topic name",
      "relevance": "Why this topic is related",
      "searchQuery": "Suggested search query to learn more"
    }
  ],
  "prerequisites": ["Topic 1 to learn before", "Topic 2 to learn before"],
  "advancedTopics": ["Advanced topic 1", "Advanced topic 2"]
}

Provide:
- 5-8 related topics
- 2-4 prerequisite topics (what to learn first)
- 2-4 advanced topics (what to learn next)

Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse related topics');
  } catch (error) {
    console.error('Error suggesting related topics:', error);
    throw new Error('Failed to suggest related topics');
  }
}

// Ask a question about the content
export interface QAResult {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  relevantQuotes: string[];
}

export async function askQuestion(content: string, question: string): Promise<QAResult> {
  const prompt = `Answer the following question based on the provided text.

Text:
${content}

Question: ${question}

Provide your response in the following JSON format:
{
  "answer": "Your detailed answer to the question",
  "confidence": "high" or "medium" or "low" (based on how well the text supports the answer),
  "relevantQuotes": ["Quote 1 from text", "Quote 2 from text"]
}

Rules:
1. Only answer based on information in the provided text
2. If the answer cannot be found in the text, say so
3. Include relevant quotes that support your answer
4. Be thorough but concise

Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse answer');
  } catch (error) {
    console.error('Error answering question:', error);
    throw new Error('Failed to answer question');
  }
}

// Generate quiz questions
export async function generateQuiz(content: string, numberOfQuestions: number = 5): Promise<QuizResult> {
  const prompt = `Based on the following text, create ${numberOfQuestions} multiple choice quiz questions to test understanding of the content.

Text:
${content}

Generate questions in the following JSON format:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ]
}

Rules:
1. Each question should have exactly 4 options
2. correctAnswer is the index (0-3) of the correct option
3. Questions should test comprehension, not trivial details
4. Make sure all questions are answerable from the provided text
5. Provide clear explanations

Only respond with the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const text = (response.text || '').trim();
    
    // Parse the JSON response
    let quizData: { questions: QuizQuestion[] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing quiz response:', parseError);
      throw new Error('Failed to parse quiz questions');
    }
    
    // Validate and clean the quiz data
    const validQuestions = quizData.questions
      .filter(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3
      )
      .slice(0, numberOfQuestions);
    
    return {
      questions: validQuestions,
      totalQuestions: validQuestions.length
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
}
