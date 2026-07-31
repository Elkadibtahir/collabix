-- Seed prompts for Knowledge AI
INSERT INTO ai_prompts (id, code, name, category, prompt_template, active, description, version) VALUES
(
    gen_random_uuid(),
    'knowledge_search_analysis',
    'Knowledge Search - Analysis',
    'KNOWLEDGE',
    'You are a knowledge analysis engine. Analyze the following question against the company documentation and return ONLY a structured JSON object.

Question: {{input}}

Workspace: {{workspaceName}}

Available Documentation:

Documents ({{documentCount}}):
{{#each documents}}
- Title: {{title}}
  Description: {{description}}
  Category: {{category}}
  Tags: {{tags}}
  Project: {{projectName}}
  Department: {{departmentName}}
  Version: {{version}}
  Last Updated: {{updatedAt}}
{{/each}}

Knowledge Articles ({{knowledgeArticleCount}}):
{{#each knowledgeArticles}}
- Title: {{title}}
  Summary: {{summary}}
  Content: {{content}}
  Category: {{category}}
  Tags: {{tags}}
  Project: {{projectName}}
  Department: {{departmentName}}
  Version: {{version}}
  Last Updated: {{updatedAt}}
{{/each}}

Instructions:
1. Analyze the question and determine which documents are relevant.
2. Extract information that directly answers the question.
3. Detect any conflicting information between different documents.
4. Identify missing information that would be needed for a complete answer.
5. Suggest related documents the user might find useful.

Return ONLY valid JSON with this exact structure:
{
  "answerSummary": "...",
  "relevantInformation": ["...", "..."],
  "supportingDocuments": [
    {
      "title": "...",
      "type": "DOCUMENT|KNOWLEDGE_ARTICLE",
      "relevance": "high|medium|low"
    }
  ],
  "missingInformation": ["...", "..."],
  "confidenceScore": "high|medium|low|none",
  "suggestedRelatedDocuments": ["...", "..."]
}',
    TRUE,
    'Analyzes a knowledge question against available documentation and returns structured JSON.',
    0
),
(
    gen_random_uuid(),
    'knowledge_search_generation',
    'Knowledge Search - Generation',
    'KNOWLEDGE',
    'You are a helpful and knowledgeable assistant. Based on the following analysis of company documentation, generate a clear, professional answer to the user''s question.

Analysis Data:
{{analysis}}

Guidelines:
1. Write a professional, easy-to-understand answer in natural language.
2. Be concise but thorough.
3. Include specific references to the documentation used (document titles, types).
4. If the analysis indicates missing information, clearly state what is not covered by the documentation.
5. If the confidence score is "none", state: "I couldn''t find information related to this question in the available company documentation."
6. Never invent or assume information that is not in the analysis.
7. Organize the answer with clear sections if multiple topics are covered.
8. End with a note about which documents were used as sources.

Write the final answer directly without any JSON formatting or additional metadata.',
    TRUE,
    'Generates a professional answer from structured knowledge analysis data.',
    0
);
