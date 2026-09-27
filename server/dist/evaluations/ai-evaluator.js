import { GoogleGenAI, Type } from '@google/genai';
import { RuleBasedEvaluator } from './rule-based-evaluator.js';
import { RUBRIC_CRITERIA } from '../shared/types.js';
import { config } from '../config.js';
export class AIEvaluator {
    name = 'gemini-ai';
    fallbackEvaluator = new RuleBasedEvaluator();
    async evaluate(submission, problem) {
        if (!config.geminiApiKey) {
            console.warn('[AIEvaluator] No GEMINI_API_KEY provided. Falling back to RuleBasedEvaluator.');
            const res = await this.fallbackEvaluator.evaluate(submission, problem);
            return { ...res, evaluatorUsed: 'fallback' };
        }
        try {
            const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
            const prompt = `
You are a Staff Software Engineer and System Design Interviewer evaluating a candidate's Low-Level Design (LLD) submission.

PROBLEM:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Requirements:
${problem.requirements.map(r => '- ' + r).join('\n')}
Constraints:
${problem.constraints.map(c => '- ' + c).join('\n')}

CANDIDATE'S SUBMISSION:
[Requirements Identified]
${submission.requirements || 'N/A'}

[Assumptions]
${submission.assumptions || 'N/A'}

[Classes & Interfaces]
${submission.classes || 'N/A'}

[Relationships]
${submission.relationships || 'N/A'}

[Design Reasoning]
${submission.reasoning || 'N/A'}

[Extensibility Considerations]
${submission.extensibility || 'N/A'}

[Edge Cases & Testability]
${submission.edgeCases || 'N/A'}

EVALUATION INSTRUCTIONS:
Evaluate the candidate's design rigorously against the standard 8 LLD rubric dimensions:
1. Requirement Understanding
2. Class Responsibilities
3. Coupling & Cohesion
4. Encapsulation & Interfaces
5. Abstraction / Patterns
6. Extensibility
7. Edge Cases & Testability
8. Explanation Quality

CRITICAL REQUIREMENTS:
- For EVERY criterion, you MUST cite concrete textual "evidence" directly quoted or specifically referenced from the candidate's submission.
- Highlight specific architectural "concern" (e.g. God Object, tight coupling, missing abstraction, concurrency risk).
- Provide actionable, concrete "suggestion" for improvement.
- Set score between 1 and 10.
- Set confidence to "high", "medium", or "low".
- Calculate an overall score between 0 and 100.
- Provide a summary, 2-3 points for what went well, 2-3 points for what to improve, and a suggested next step.
`;
            const response = await ai.models.generateContent({
                model: config.geminiModel || 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            overallSummary: { type: Type.STRING },
                            overallScore: { type: Type.NUMBER },
                            whatWentWell: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            whatToImprove: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            suggestedNextStep: { type: Type.STRING },
                            criteria: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        criterion: { type: Type.STRING },
                                        score: { type: Type.NUMBER },
                                        evidence: { type: Type.STRING },
                                        concern: { type: Type.STRING },
                                        suggestion: { type: Type.STRING },
                                        confidence: { type: Type.STRING }
                                    },
                                    required: ['criterion', 'score', 'evidence', 'concern', 'suggestion', 'confidence']
                                }
                            }
                        },
                        required: ['overallSummary', 'overallScore', 'whatWentWell', 'whatToImprove', 'suggestedNextStep', 'criteria']
                    }
                }
            });
            const text = response.text;
            if (!text) {
                throw new Error('Empty response received from Gemini model.');
            }
            const parsed = JSON.parse(text);
            // Validate criteria returned
            const validCriteria = RUBRIC_CRITERIA.map(expectedCriterion => {
                const found = parsed.criteria?.find((c) => c.criterion?.toLowerCase() === expectedCriterion.toLowerCase());
                if (found) {
                    return {
                        criterion: expectedCriterion,
                        score: Math.min(10, Math.max(1, Math.round(Number(found.score) || 6))),
                        evidence: found.evidence || 'Reference found in submission.',
                        concern: found.concern || 'Ensure adherence to design principles.',
                        suggestion: found.suggestion || 'Review object responsibilities.',
                        confidence: (['high', 'medium', 'low'].includes(found.confidence) ? found.confidence : 'medium')
                    };
                }
                else {
                    return {
                        criterion: expectedCriterion,
                        score: 6,
                        evidence: 'Addressed in overall submission.',
                        concern: 'Aspect could be more thoroughly elaborated.',
                        suggestion: 'Explicitly delineate this dimension in the design.',
                        confidence: 'medium'
                    };
                }
            });
            return {
                overallSummary: parsed.overallSummary || `Evaluated submission for ${problem.title}.`,
                overallScore: Math.min(100, Math.max(0, Math.round(Number(parsed.overallScore) || 70))),
                whatWentWell: Array.isArray(parsed.whatWentWell) && parsed.whatWentWell.length > 0
                    ? parsed.whatWentWell
                    : ['Good structured solution.'],
                whatToImprove: Array.isArray(parsed.whatToImprove) && parsed.whatToImprove.length > 0
                    ? parsed.whatToImprove
                    : ['Review edge cases and extensibility.'],
                suggestedNextStep: parsed.suggestedNextStep || 'Try refactoring and retrying this problem.',
                criteria: validCriteria,
                evaluatorUsed: 'gemini-ai'
            };
        }
        catch (err) {
            console.error('[AIEvaluator] Error during Gemini evaluation, falling back to RuleBasedEvaluator:', err?.message || err);
            const res = await this.fallbackEvaluator.evaluate(submission, problem);
            return { ...res, evaluatorUsed: 'fallback' };
        }
    }
}
