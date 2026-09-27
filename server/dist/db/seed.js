import { getDatabase } from './database.js';
export const SEED_PROBLEMS = [
    {
        id: 'parking-lot',
        title: 'Parking Lot',
        description: 'Design an automated multi-floor parking lot management system supporting multiple vehicle types, spot allocations, and flexible pricing strategies.',
        difficulty: 'Medium',
        practiceFocus: 'Object responsibilities, interface abstraction, pricing strategy patterns, and spot allocation state.',
        requirements: [
            'The parking lot has multiple floors, and each floor has multiple parking spots.',
            'Support distinct vehicle types: Motorcycle, Car, Bus/Truck.',
            'Parking spots must correspond to vehicle types: Small (motorcycles), Medium (compact/sedan cars), Large (buses/trucks).',
            'The system should automatically assign the closest available valid spot upon vehicle entry.',
            'A parking ticket must be issued upon entry containing spot number, entry timestamp, and ticket ID.',
            'Upon exit, the system calculates parking fees based on duration and vehicle type.',
            'Payment can be made via Cash or Credit Card, and the spot is immediately freed.'
        ],
        constraints: [
            'Single vehicle occupies single matching or larger spot (e.g., car cannot occupy small spot).',
            'Concurrent entry/exit gates must not assign the same spot twice (thread-safe allocation).',
            'Pricing strategy should be extensible (flat hourly rate, vehicle-tiered rate, peak hour surge).'
        ],
        exampleScenarios: [
            'Scenario 1: Car enters -> Entrance Gate finds nearest free Medium spot on Floor 1 -> Issues Ticket #101 -> Spot marked OCCUPIED.',
            'Scenario 2: Motorcycle enters when all Small spots are full -> System safely allocates available Medium spot as fallback.',
            'Scenario 3: Car exits after 2 hours 15 minutes -> Exit Gate calculates fee with HourlyPricingStrategy -> Payment completed -> Spot marked FREE.'
        ]
    },
    {
        id: 'vending-machine',
        title: 'Vending Machine',
        description: 'Design a state-driven vending machine that dispenses inventory items, validates currency, handles change calculations, and maintains consistency.',
        difficulty: 'Medium',
        practiceFocus: 'State design pattern, inventory tracking, transaction atomicity, and edge-case refund handling.',
        requirements: [
            'The machine holds multiple item racks, each with code (e.g., A1, B2), item details, price, and stock count.',
            'Accept currency in denominations of 1, 5, 10, 20, 50, and 100.',
            'Users select an item code and insert money.',
            'If inserted amount is sufficient and item is in stock, dispense item and return remaining change.',
            'Users can cancel the transaction anytime before dispensing to receive a full refund.',
            'Maintenance mode allows technicians to restock items and collect accumulated cash.'
        ],
        constraints: [
            'Must maintain state: IdleState, HasMoneyState, DispensingState, SoldOutState.',
            'Must not dispense item if change cannot be returned or item is out of stock.',
            'Change dispenser must use available coin/note denominations in the cash inventory.'
        ],
        exampleScenarios: [
            'Scenario 1: User selects B1 ($15) -> inserts $20 -> machine transitions to Dispensing -> dispenses item -> returns $5 change -> returns to Idle.',
            'Scenario 2: User inserts $10 -> presses Cancel -> machine transitions to Idle and refunds $10.',
            'Scenario 3: User selects item with 0 stock -> machine alerts "Sold Out" and rejects selection.'
        ]
    },
    {
        id: 'library-management',
        title: 'Library Management System',
        description: 'Design a comprehensive library system managing book catalogs, physical book copies, member borrowing limits, reservations, and overdue fines.',
        difficulty: 'Easy',
        practiceFocus: 'Entity modeling, separating catalog metadata from physical book items, search strategy, and business rule enforcement.',
        requirements: [
            'Manage book catalog: ISBN, Title, Author, Category, Publication Date.',
            'A book title can have multiple physical copies (BookItems), each with a unique barcode and status (Available, Loaned, Reserved, Lost).',
            'Members can register, borrow up to a maximum number of books (e.g., 5 books for 14 days), and return books.',
            'System calculates overdue fines for delayed returns ($1 per day).',
            'Members can reserve a book if all copies are currently loaned out.',
            'Search catalog by Title, Author, or ISBN.'
        ],
        constraints: [
            'A member cannot borrow more books if they have unpaid fines exceeding $10 or already reached max active loans.',
            'When a reserved book is returned, it should be marked as Reserved for the member who placed the reservation first (FIFO).'
        ],
        exampleScenarios: [
            'Scenario 1: Member searches for "Clean Code" -> finds 3 copies -> checks out Barcode #BC-01 -> due date set to 14 days from today.',
            'Scenario 2: Member returns book 3 days late -> system records $3 fine -> checkout blocked until fine is paid.'
        ]
    },
    {
        id: 'elevator-system',
        title: 'Elevator System',
        description: 'Design a multi-elevator controller for a high-rise building with smart dispatch algorithms, internal/external requests, and safety constraints.',
        difficulty: 'Hard',
        practiceFocus: 'Dispatching algorithm (LOOK/SCAN), elevator state representation, request scheduling, and concurrent direction changes.',
        requirements: [
            'Building has N floors and M elevator cars.',
            'Each car has capacity limit, current floor, current direction (UP, DOWN, IDLE), and door state (OPEN, CLOSED).',
            'External hall panels on each floor allow passengers to request an elevator (UP or DOWN button).',
            'Internal panels inside each car allow passengers to select destination floor numbers and emergency stop.',
            'Dispatcher coordinates cars to optimize wait time and travel time using a scheduling strategy.'
        ],
        constraints: [
            'Elevators must respect weight/capacity thresholds and not move while doors are open.',
            'Moving elevator should service requests in the same direction before reversing (e.g., LOOK / Elevator algorithm).',
            'Emergency stop immediately halts movement and alerts building security.'
        ],
        exampleScenarios: [
            'Scenario 1: Passenger presses UP on Floor 3 -> Dispatcher selects nearest car moving UP or nearest IDLE car.',
            'Scenario 2: Car reaches Floor 3 -> doors open -> passenger enters and presses Floor 8 -> car closes doors and continues UP.'
        ]
    },
    {
        id: 'splitwise',
        title: 'Splitwise (Expense Sharing)',
        description: 'Design an expense-sharing application supporting multi-user expenses, flexible split types (EQUAL, EXACT, PERCENT), group balances, and debt simplification.',
        difficulty: 'Hard',
        practiceFocus: 'Polymorphic split calculations, balance sheet ledger modeling, transaction invariants, and debt graph simplification.',
        requirements: [
            'Users can create accounts with name, email, and phone number.',
            'Users can create groups and add friends.',
            'Add expense within or outside a group with total amount, paid-by user, and split details.',
            'Support split types: EQUAL, EXACT amounts, and PERCENTAGES.',
            'Maintain pairwise balances: User A owes User B $X.',
            'Users can settle balances with direct payments.'
        ],
        constraints: [
            'Sum of exact split amounts must strictly equal total expense amount.',
            'Sum of percentages in PERCENT split must strictly equal 100%.',
            'Debt simplification algorithm to minimize total transaction count across group members is desired.'
        ],
        exampleScenarios: [
            'Scenario 1: Alice pays $60 for dinner with Bob and Charlie (EQUAL) -> Bob owes Alice $20, Charlie owes Alice $20.',
            'Scenario 2: Bob later pays $30 for cab with Alice (EQUAL) -> Net balance: Bob owes Alice $5, Charlie owes Alice $20.',
            'Scenario 3: Charlie settles $20 with Alice -> Charlie owes Alice $0.'
        ]
    }
];
export function seedDatabase(db = getDatabase()) {
    console.log('Seeding problems into SQLite database...');
    const insertProblem = db.prepare(`
    INSERT INTO problems (id, title, description, difficulty, practice_focus, requirements, constraints_text, example_scenarios, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      difficulty = excluded.difficulty,
      practice_focus = excluded.practice_focus,
      requirements = excluded.requirements,
      constraints_text = excluded.constraints_text,
      example_scenarios = excluded.example_scenarios
  `);
    const now = new Date().toISOString();
    for (const prob of SEED_PROBLEMS) {
        insertProblem.run(prob.id, prob.title, prob.description, prob.difficulty, prob.practiceFocus, JSON.stringify(prob.requirements), JSON.stringify(prob.constraints), JSON.stringify(prob.exampleScenarios), now);
    }
    console.log(`Successfully seeded ${SEED_PROBLEMS.length} problems.`);
}
// Execute if run directly
if (process.argv[1] && process.argv[1].includes('seed')) {
    seedDatabase();
    process.exit(0);
}
