# Approach & Key Decisions

## Problem Understanding
The scheduling system must intelligently match **families** (who request care) with **providers** (who have varying skills, availability, and preferences).  

The main challenges are:  
- Families may demand **consistency** (same provider across the request period) or accept different providers.  
- Providers have **availability slots** (daytime, overnight, 24/7), **weekly hour limits**, and **time off**.  
- Providers cannot be **double-booked**.  
- The system must handle **day ranges** (multi-day requests) and return meaningful **suggestions** to admins.  

I designed the solution as a **deterministic, rule-based algorithm** with a scoring system layered on top of strict filtering.

---

## Scheduler Algorithm

### Step 1: Gather Candidates
- Fetch all **active providers** from the database.  
- Loop through each provider and evaluate them against the request.  

### Step 2: Apply Hard Filters (elimination rules)
These are **non-negotiable constraints** — if a provider fails any, they are skipped:
1. **Specialty filter**  
   - Provider must include the requested `care_type` in their specialties.  
   - If not matched, the provider is skipped immediately.  

2. **Availability filter**  
   - Compare the request’s `start_time` and `end_time` against the provider’s availability slots for the matching `dayOfWeek`.  
   - If the request interval doesn’t fit inside any availability slot, the provider is skipped.  

3. **Time-off filter**  
   - If the request date falls within any of the provider’s `timeOffs`, skip them.  

4. **Weekly hour filter**  
   - Calculate provider’s total assigned hours in the same week (`calculateWeeklyHours`).  
   - If adding this request’s hours exceeds `maxWeeklyHours`, skip.  

5. **Conflict filter**  
   - Check if the provider already has another assignment overlapping with this request (`checkConflict`).  
   - If yes, skip.  

### Step 3: Scoring (soft ranking)
For providers who pass all hard filters:  
- **Specialty match bonus**: +40  
- **Availability satisfied**: +20  
- **Within weekly limit**: +15  
- **Consistency bonus**: +25 if family requested consistency AND provider has worked with them before.  
- **Rating bonus**:  
  - +20 if rating ≥ 4.8  
  - +15 if rating ≥ 4.5  
  - +10 if rating ≥ 4.0  

### Step 4: Sort & Return
- Sort providers by `score` descending.  
- Return as `suggestions`.  

### Modes:
- **Consistent Mode**: If family requested consistency, return a **single ranked list** of providers who can cover the request.  
- **Per-Day Mode**: If no consistency requested, expand the request into individual days and return **suggestions per day**.  

---

## Assumptions Made
To simplify and focus on the core scheduling logic, I made the following assumptions:  

1. **Specialty is mandatory**  
   - Providers must explicitly list the specialty (`doula`, `lactation`, `newborn`, `nurse`) to be considered. No fuzzy matching.  

2. **Shift windows must fully cover request times**  
   - Example: A provider with availability `08:00–16:00` can cover a request `10:00–14:00`.  
   - Partial overlap is not allowed.  

3. **Time-off blocks the entire day**  
   - If a provider has `timeOff` covering a request’s date, they are considered unavailable for the whole day.  

4. **Weekly hours are strictly enforced**  
   - Providers cannot exceed their `maxWeeklyHours`.  
   - `minWeeklyHours` is informational — not enforced for skipping.  

5. **Conflict detection**  
   - A provider cannot handle overlapping requests. Even 1-minute overlap = conflict.  

6. **Consistency logic**  
   - If a family has `consistentProvider: true`, the algorithm boosts providers who previously worked with that family.  
   - However, if no past assignment exists, the system still returns the top-ranked matches.  

7. **Scoring is additive and deterministic**  
   - No randomness. The highest-scoring provider is always ranked first.  

8. **Per-day expansion is limited**  
   - For multi-day requests without consistency, suggestions are generated per day.  
   - But the algorithm still tends to reuse the same provider if they are available across multiple days.  

---

## Example
For a request:  
- **Family**: Johnsons (Seattle)  
- **Care type**: Doula  
- **Dates**: Sept 2–6, 10am–2pm (daytime, 4h/day)  
- **Consistency required**: true  

The scheduler:  
1. Eliminates all non-doula providers.  
2. Evaluates available doulas:  
   - Doula Anna (daytime) passes, +75 score.  
   - Doula Maria (overnight)  skipped, wrong shift.  
   - 24/7 Bob (doula specialty)  passes, +60 score.  
3. Sorts them → returns Anna and Bob as suggestions.  

---

## Why This Works
- **Reliability:** By using strict hard filters, no provider is assigned outside their real constraints.  
- **Flexibility:** Scoring allows differentiating between multiple valid candidates.  
- **Extensibility:** New rules (geo-distance, gender/language preference, etc.) can be added easily.  
- **Transparency:** Debug logs clearly explain why each provider was skipped or scored.  

---

## Future Enhancements
- Add **geo-distance filtering** using lat/long.  
- Support **provider capacity** (handling multiple families per shift).  
- Smarter **per-day grouping** to avoid assigning too many different providers.  
- Add **preference weighting** (e.g., family strongly prefers female providers).  
