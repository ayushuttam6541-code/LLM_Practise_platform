export class RuleBasedEvaluator {
    name = 'rule-based';
    async evaluate(submission, problem) {
        const criteria = [];
        // 1. Requirement Understanding
        criteria.push(this.evaluateRequirements(submission, problem));
        // 2. Class Responsibilities
        criteria.push(this.evaluateClassResponsibilities(submission, problem));
        // 3. Coupling & Cohesion
        criteria.push(this.evaluateCouplingCohesion(submission, problem));
        // 4. Encapsulation & Interfaces
        criteria.push(this.evaluateInterfaces(submission, problem));
        // 5. Abstraction / Patterns
        criteria.push(this.evaluatePatterns(submission, problem));
        // 6. Extensibility
        criteria.push(this.evaluateExtensibility(submission, problem));
        // 7. Edge Cases & Testability
        criteria.push(this.evaluateEdgeCases(submission, problem));
        // 8. Explanation Quality
        criteria.push(this.evaluateExplanationQuality(submission, problem));
        // Calculate overall score (average of criteria scaled to 100)
        const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
        const overallScore = Math.round((totalScore / (criteria.length * 10)) * 100);
        // Identify what went well and what to improve
        const whatWentWell = [];
        const whatToImprove = [];
        criteria.forEach(c => {
            if (c.score >= 8) {
                whatWentWell.push(`${c.criterion}: ${c.evidence.slice(0, 100)}... demonstrates strong design thinking.`);
            }
            else if (c.score <= 6) {
                whatToImprove.push(`${c.criterion}: ${c.concern}`);
            }
        });
        if (whatWentWell.length === 0) {
            whatWentWell.push('Core domain problem was addressed with a structured submission.');
        }
        if (whatToImprove.length === 0) {
            whatToImprove.push('Consider formalizing design with sequence diagrams or state machine charts.');
        }
        const suggestedNextStep = overallScore >= 80
            ? 'Great work! Try refactoring this design into clean executable code or explore the Hard difficulty Elevator or Splitwise problems.'
            : 'Review the Class Responsibilities and Interface suggestions above, then use "Retry" to submit an updated iteration.';
        const overallSummary = `Evaluated submission for "${problem.title}". Achieved an overall architectural quality score of ${overallScore}/100 based on the 8 LLD rubric dimensions.`;
        return {
            overallSummary,
            overallScore,
            whatWentWell: whatWentWell.slice(0, 3),
            whatToImprove: whatToImprove.slice(0, 3),
            suggestedNextStep,
            criteria,
            evaluatorUsed: 'rule-based'
        };
    }
    extractSnippet(text, maxLen = 120) {
        const clean = (text || '').replace(/\s+/g, ' ').trim();
        if (!clean)
            return 'No explicit content provided.';
        return clean.length <= maxLen ? clean : clean.slice(0, maxLen) + '...';
    }
    evaluateRequirements(submission, problem) {
        const text = (submission.requirements + ' ' + submission.assumptions).toLowerCase();
        const snippet = this.extractSnippet(submission.requirements || submission.assumptions);
        // Check for problem-specific keywords
        let matchCount = 0;
        const keywordsMap = {
            'parking-lot': ['spot', 'vehicle', 'ticket', 'floor', 'gate', 'fee', 'entry', 'exit'],
            'vending-machine': ['item', 'inventory', 'coin', 'cash', 'money', 'dispense', 'change', 'state'],
            'library-management': ['book', 'catalog', 'member', 'borrow', 'return', 'fine', 'isbn', 'loan'],
            'elevator-system': ['floor', 'car', 'elevator', 'request', 'dispatch', 'direction', 'door', 'capacity'],
            'splitwise': ['user', 'expense', 'group', 'split', 'balance', 'owe', 'settle', 'percent', 'equal']
        };
        const keywords = keywordsMap[problem.id] || ['system', 'user', 'data'];
        for (const kw of keywords) {
            if (text.includes(kw))
                matchCount++;
        }
        const ratio = matchCount / keywords.length;
        let score = 5;
        let concern = '';
        let suggestion = '';
        if (ratio >= 0.6) {
            score = 9;
            concern = 'Minor ambiguity around scale constraints or edge scenarios.';
            suggestion = 'Explicitly state non-functional latency and throughput assumptions (e.g., QPS during peak hours).';
        }
        else if (ratio >= 0.35) {
            score = 7;
            concern = 'Some core requirements are mentioned, but critical domain constraints appear unstated.';
            suggestion = 'Enumerate both happy path functional requirements and non-functional assumptions explicitly.';
        }
        else {
            score = 5;
            concern = 'Requirements section misses several critical domain entities for this problem.';
            suggestion = `Ensure you address core requirements such as ${keywords.slice(0, 4).join(', ')}.`;
        }
        return {
            criterion: 'Requirement Understanding',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'high'
        };
    }
    evaluateClassResponsibilities(submission, problem) {
        const text = submission.classes;
        const lower = text.toLowerCase();
        const snippet = this.extractSnippet(text);
        // Check for God class tendencies or healthy decomposition
        const hasGodClass = ((lower.includes('parkinglot') && (lower.includes('calculatefee') || lower.includes('pricing') || lower.includes('processpayment'))) ||
            (lower.includes('vendingmachine') && (lower.includes('inventory') && lower.includes('payment') && lower.includes('dispense'))));
        const classMatches = text.match(/\b(class|interface)\s+([A-Za-z0-9_]+)/gi) || [];
        const classCount = classMatches.length;
        let score = 7;
        let concern = '';
        let suggestion = '';
        if (hasGodClass) {
            score = 6;
            concern = 'One class appears to bear multiple responsibilities that may change for different reasons (violating SRP).';
            suggestion = 'Segregate state management from business rules (e.g., delegate pricing or payment to dedicated strategy/service objects).';
        }
        else if (classCount >= 4) {
            score = 9;
            concern = 'Ensure controller classes do not turn into anemic domain models.';
            suggestion = 'Keep domain behaviors encapsulated inside the entity rather than pulling all logic into external managers.';
        }
        else if (classCount >= 2) {
            score = 7;
            concern = 'Class decomposition is somewhat limited; additional helper models may be required.';
            suggestion = 'Break down higher-level workflows into discrete domain entities with single responsibilities.';
        }
        else {
            score = 5;
            concern = 'Class definitions and their specific responsibilities are unclear or overly unified.';
            suggestion = 'Define explicit classes with "Responsibility:" bullets detailing what each model does and does not do.';
        }
        return {
            criterion: 'Class Responsibilities',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'high'
        };
    }
    evaluateCouplingCohesion(submission, problem) {
        const text = (submission.relationships + ' ' + submission.classes).toLowerCase();
        const snippet = this.extractSnippet(submission.relationships || submission.classes);
        const mentionsComposition = text.includes('composition') || text.includes('has-a') || text.includes('contains') || text.includes('aggregat');
        const mentionsInheritance = text.includes('extends') || text.includes('inheritance') || text.includes('is-a') || text.includes('subclass');
        let score = 7;
        let concern = '';
        let suggestion = '';
        if (mentionsComposition && mentionsInheritance) {
            score = 9;
            concern = 'Watch for deep inheritance hierarchies which can become brittle.';
            suggestion = 'Favor composition over inheritance for behavioral variations.';
        }
        else if (mentionsComposition || mentionsInheritance) {
            score = 8;
            concern = 'Relationships are partially specified; relationship cardinalities (1:1, 1:N, M:N) should be explicit.';
            suggestion = 'Specify exact cardinalities and dependency injection directions between interacting components.';
        }
        else {
            score = 6;
            concern = 'Coupling and composition between classes are not clearly delineated.';
            suggestion = 'Document explicit associations (e.g., ParkingLot has many ParkingFloors; Ticket references ParkingSpot).';
        }
        return {
            criterion: 'Coupling & Cohesion',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'medium'
        };
    }
    evaluateInterfaces(submission, problem) {
        const text = (submission.classes + ' ' + submission.relationships).toLowerCase();
        const snippet = this.extractSnippet(submission.classes);
        const hasInterface = text.includes('interface') || text.includes('abstract class') || text.includes('implements');
        let score = 7;
        let concern = '';
        let suggestion = '';
        if (hasInterface) {
            score = 9;
            concern = 'Ensure interfaces follow Interface Segregation Principle (ISP) and avoid bloated method signatures.';
            suggestion = 'Keep interfaces focused on single contracts (e.g., PaymentProcessor, SpotAllocationStrategy).';
        }
        else {
            score = 6;
            concern = 'No explicit interfaces or abstract contracts defined, leading to hard couplings to concrete classes.';
            suggestion = 'Introduce interfaces for components that vary (e.g., PricingStrategy, PaymentGateway, or DispatchAlgorithm).';
        }
        return {
            criterion: 'Encapsulation & Interfaces',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'high'
        };
    }
    evaluatePatterns(submission, problem) {
        const fullText = (submission.classes + ' ' + submission.reasoning + ' ' + submission.extensibility).toLowerCase();
        const snippet = this.extractSnippet(submission.reasoning || submission.classes);
        const patterns = ['strategy', 'factory', 'state', 'observer', 'singleton', 'command', 'decorator', 'template'];
        const detectedPatterns = patterns.filter(p => fullText.includes(p));
        let score = 6;
        let concern = '';
        let suggestion = '';
        if (detectedPatterns.length >= 2) {
            score = 9;
            concern = 'Avoid over-engineering patterns where simple polymorphism or function parameters suffice.';
            suggestion = `Good identification of ${detectedPatterns.join(', ')}. Ensure they solve actual variance requirements without unnecessary overhead.`;
        }
        else if (detectedPatterns.length === 1) {
            score = 8;
            concern = 'Only a single pattern utilized; consider other variation points.';
            suggestion = `Utilized ${detectedPatterns[0]}. Consider if a Factory or Observer pattern would further decouple creation or event notifications.`;
        }
        else {
            score = 6;
            concern = 'No standard design patterns explicitly identified to handle behavioral or creational variance.';
            suggestion = 'Apply classic GoF patterns (e.g., Strategy pattern for pricing/dispatch, State pattern for machine/elevator lifecycles).';
        }
        return {
            criterion: 'Abstraction / Patterns',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'high'
        };
    }
    evaluateExtensibility(submission, problem) {
        const text = (submission.extensibility || '').toLowerCase();
        const snippet = this.extractSnippet(submission.extensibility);
        const hasExtensibility = submission.extensibility && submission.extensibility.trim().length > 30;
        const mentionsOCP = text.includes('open') || text.includes('closed') || text.includes('new ') || text.includes('pluggable') || text.includes('future');
        let score = 6;
        let concern = '';
        let suggestion = '';
        if (hasExtensibility && mentionsOCP) {
            score = 9;
            concern = 'Ensure configuration or dependency injection wiring supports these extensions seamlessly at runtime.';
            suggestion = 'Document how a developer would add a new variant without modifying existing core classes.';
        }
        else if (hasExtensibility) {
            score = 7;
            concern = 'Extensibility is discussed briefly but lacking specific modification points.';
            suggestion = 'Detail what steps are needed when adding a new vehicle type, payment provider, or pricing rule.';
        }
        else {
            score = 5;
            concern = 'Extensibility considerations are minimal or missing.';
            suggestion = 'Explain how the system complies with the Open/Closed Principle when business requirements expand.';
        }
        return {
            criterion: 'Extensibility',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'medium'
        };
    }
    evaluateEdgeCases(submission, problem) {
        const text = (submission.edgeCases || '').toLowerCase();
        const snippet = this.extractSnippet(submission.edgeCases);
        const mentionsConcurrency = text.includes('concurren') || text.includes('race') || text.includes('thread') || text.includes('lock') || text.includes('sync');
        const mentionsCapacity = text.includes('full') || text.includes('empty') || text.includes('exhaust') || text.includes('zero') || text.includes('overflow');
        let score = 6;
        let concern = '';
        let suggestion = '';
        if (mentionsConcurrency && mentionsCapacity) {
            score = 9;
            concern = 'Ensure locking strategy does not introduce bottleneck contention or deadlock scenarios.';
            suggestion = 'Consider optimistic concurrency control or granular spot-level/floor-level locks rather than global locks.';
        }
        else if (mentionsConcurrency || mentionsCapacity) {
            score = 8;
            concern = 'Addresses state edge cases, but concurrency or race condition safety needs more attention.';
            suggestion = 'Address concurrent access scenarios (e.g., two cars entering simultaneously attempting to take the last available spot).';
        }
        else if (submission.edgeCases && submission.edgeCases.trim().length > 20) {
            score = 7;
            concern = 'Edge cases are touched upon but high-concurrency race conditions are omitted.';
            suggestion = 'Identify multi-threading edge cases, hardware sensor failures, or transaction timeout scenarios.';
        }
        else {
            score = 5;
            concern = 'Edge cases and testability were barely addressed.';
            suggestion = 'List at least 3 edge cases: capacity boundaries, concurrent access, and hardware/network failure recoveries.';
        }
        return {
            criterion: 'Edge Cases & Testability',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'high'
        };
    }
    evaluateExplanationQuality(submission, problem) {
        const text = submission.reasoning || '';
        const snippet = this.extractSnippet(text);
        const length = text.trim().length;
        const hasStructure = text.includes('- ') || text.includes('* ') || text.includes('1.') || text.includes('\n');
        let score = 7;
        let concern = '';
        let suggestion = '';
        if (length > 100 && hasStructure) {
            score = 9;
            concern = 'Reasoning is articulate. Keep diagrams or flow traces as next enhancement.';
            suggestion = 'Consider adding a short step-by-step sequence trace for the primary happy path scenario.';
        }
        else if (length > 50) {
            score = 7;
            concern = 'Reasoning covers the "what" but could more clearly explain the "why" behind design trade-offs.';
            suggestion = 'Explain why alternative architectures were discarded in favor of your chosen approach.';
        }
        else {
            score = 5;
            concern = 'Explanation is terse and provides little insight into trade-off considerations.';
            suggestion = 'Provide thorough reasoning explaining your choice of patterns, data structures, and trade-offs.';
        }
        return {
            criterion: 'Explanation Quality',
            score,
            evidence: snippet,
            concern,
            suggestion,
            confidence: 'medium'
        };
    }
}
