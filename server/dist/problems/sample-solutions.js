export const SAMPLE_SOLUTIONS = {
    'parking-lot': {
        requirements: `1. Multi-floor parking lot with multiple gates and spot types (Small, Medium, Large).
2. Vehicles: Motorcycle (Small), Car (Medium), Bus/Truck (Large).
3. Automatic spot assignment to closest free spot upon entry.
4. Issue ticket with unique ID, spot number, and entry time.
5. Exit gate calculates fee using pluggable pricing strategy and processes payment.
6. Support real-time spot occupancy updates.`,
        assumptions: `1. Entry and exit gates operate concurrently across multiple threads.
2. Spot allocation follows nearest-to-gate heuristic.
3. Pricing is calculated in 1-hour increments with a grace period of 15 minutes.
4. Spot types: Small spots only fit motorcycles; Medium fits cars or motorcycles; Large fits all.`,
        classes: `Class: ParkingLot (Singleton)
Responsibility:
- Maintain collection of ParkingFloors and Gates
- Provide entry point for overall system queries

Class: ParkingFloor
Responsibility:
- Track floor number and active spots list
- Find first available spot matching VehicleType

Class: ParkingSpot (Abstract)
Responsibility:
- Hold spot ID, floor ID, SpotType, and isOccupied flag
- assignVehicle(Vehicle v), vacate()

Subclasses: SmallSpot, MediumSpot, LargeSpot

Class: Vehicle (Abstract)
Responsibility:
- Hold licensePlate and VehicleType
Subclasses: Motorcycle, Car, Bus

Class: ParkingTicket
Responsibility:
- Hold ticketId, vehicleNumber, spotId, entryTime, exitTime, feeCharged

Interface: PricingStrategy
Responsibility:
- calculateFee(ParkingTicket ticket, VehicleType vehicleType): number
Implementations: HourlyPricingStrategy, PeakHourSurgePricingStrategy

Interface: PaymentMethod
Responsibility:
- processPayment(amount: number): boolean
Implementations: CashPayment, CardPayment

Class: Gate (Abstract)
Subclass EntranceGate: issues ticket, allocates spot via AllocationStrategy
Subclass ExitGate: verifies ticket, delegates to PricingStrategy and PaymentMethod`,
        relationships: `1. ParkingLot HAS-A collection of ParkingFloor (1 : N, Composition).
2. ParkingFloor HAS-A collection of ParkingSpot (1 : N, Composition).
3. ParkingTicket REFERENCES ParkingSpot and Vehicle (1 : 1, Association).
4. ExitGate USES PricingStrategy (Strategy Pattern, Dependency Injection).
5. ExitGate USES PaymentMethod (Polymorphic Delegation).
6. SmallSpot, MediumSpot, LargeSpot EXTEND ParkingSpot (Inheritance).`,
        reasoning: `1. Separation of Concerns: ParkingLot delegates spot search to ParkingFloor, and exit calculation to PricingStrategy.
2. Strategy Pattern for Pricing: Parking rules vary heavily (night rates, weekend rates, electric vehicle discounts). Decoupling calculation from ExitGate prevents modifying gate logic when rates update (Open-Closed Principle).
3. Concurrency Safety: Spot allocation uses synchronized/lock guards at the ParkingFloor level so two gates do not assign the identical spot simultaneously.`,
        extensibility: `1. Adding new vehicle types (e.g. ElectricCar):
   - Add ElectricSpot extending ParkingSpot with an EV charging capability.
   - Create ElectricPricingStrategy implementing PricingStrategy.
2. Adding new payment methods (e.g. UPI, NFC):
   - Implement PaymentMethod interface without modifying ExitGate.
3. Adding display board observers:
   - Add DisplayBoard implementing an Observer pattern receiving spot state changes.`,
        edgeCases: `1. Parking Full: When no spots match vehicle type, EntranceGate displays "Full" and rejects ticket generation.
2. Concurrency Race Conditions: Two vehicles entering at Gate 1 and Gate 2 simultaneously for the last medium spot -> synchronize spot assignment via optimistic spot locking.
3. Ticket Loss: Support manual ticket regeneration via license plate lookup with maximum daily fee penalty.
4. System Crash / Recovery: Persistent ticket and spot status in SQLite database ensures recovery after restart.`
    },
    'vending-machine': {
        requirements: `1. Manage inventory racks with code, price, and item count.
2. Accept coins and cash notes (1, 5, 10, 20, 50, 100).
3. Dispense item when sufficient money is deposited and inventory is available.
4. Calculate and return change in valid denominations.
5. Provide refund when user cancels before dispensing.
6. Technician mode for restocking and cash collection.`,
        assumptions: `1. Single transaction at a time per machine.
2. Inventory rack has maximum capacity of 10 items.
3. Exact change can be returned if available in cash inventory; otherwise transaction is aborted before debiting.`,
        classes: `Class: VendingMachine
Responsibility:
- Context class holding currentState, Inventory, and CashDispenser
- setState(State s), insertMoney(), selectItem(), dispenseItem(), cancel()

Interface: VendingMachineState (State Pattern)
Responsibility:
- Handle insertCoin(), selectItem(), dispense(), refund()
Implementations:
- IdleState: Waiting for user action
- HasMoneyState: Money inserted, waiting for item selection or cancel
- DispensingState: Validated, dispensing item and change
- SoldOutState: Selected item unavailable

Class: Item
Responsibility:
- Holds itemId, name, price

Class: InventoryRack
Responsibility:
- Holds rackCode (e.g. A1), Item, and quantity

Class: CashDispenser
Responsibility:
- Tracks currency counts per denomination
- calculateChange(amountNeeded): Map<Denomination, count>`,
        relationships: `1. VendingMachine HAS-A VendingMachineState (State Pattern).
2. VendingMachine HAS-A Inventory (1 : 1, Composition).
3. Inventory HAS-A collection of InventoryRack (1 : N).
4. VendingMachine HAS-A CashDispenser (1 : 1).`,
        reasoning: `1. State Pattern eliminates complex conditional if-else ladders for machine workflows (inserting money while dispensing is prohibited by state).
2. Separate CashDispenser encapsulates greedy coin-change algorithm away from machine state.`,
        extensibility: `1. Digital payments (QR / Apple Pay) can be added by introducing a PaymentProcessor interface.
2. Promotional discounts can be plugged into the price calculation.`,
        edgeCases: `1. Insufficient change in cash box -> Refund inserted money, do not dispense item.
2. Item stuck in mechanical coil -> Sensor detection triggers auto-refund and marks rack as out-of-order.
3. Concurrent cancel button pressed while coin is in escrow -> State machine atomic lock ensures refund.`
    }
};
