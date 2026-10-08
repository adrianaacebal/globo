/*
  Starter file for Session 9 Lab — Part 1 (The Challenge Circuit)
  Web Application Programming (G247) · CUNEF Escuela Politécnica Superior

  Week 3 · Session 9 · Practice (AF2) · Pair work 

  This is NOT a copy-paste drill. Five different mini-challenges, and each
  one FORCES a specific function syntax — you will never write the same
  body twice. Do NOT rename the functions and do NOT change their
  signatures — the auto-check at the bottom calls them by name. You only
  write (or fix) the bodies.
  

  GRADE YOURSELF, OFTEN: run this file with the VS Code Code Runner
  button, or `node starter_functions.js`, or runner.html in the browser.
  It prints a PASS/FAIL report per challenge. Keep running it after every
  change until the required score is complete. See section 3.4 of the
  brief for what the report means.
*/

// =====================================================================
// 0. THE SIX IDEAS YOU NEED FIRST
//    (Session 8 recap + the GeeksforGeeks reference:
//     https://www.geeksforgeeks.org/javascript/functions-in-javascript/)
// =====================================================================
// 1. PARAMETER vs ARGUMENT
//    A parameter is the placeholder in the definition: greet(name).
//    An argument is the real value you pass at call time: greet("Ana").
//
// 2. FUNCTION DECLARATION
//    function square(n) { return n * n; }
//    Hoisted — callable anywhere in the file, even before its definition.
//
// 3. FUNCTION EXPRESSION
//    const square = function (n) { return n * n; };
//    A function stored in a variable — it exists only once that line runs.
//
// 4. ARROW FUNCTION (ES6)
//    const square = (n) => n * n;
//    Shorter syntax; no own `this`. Perfect for every exercise here.
//
// 5. DEFAULT PARAMETERS
//    function greet(name = "friend") { ... }
//    When no argument is passed, the default value is used instead.
//
// 6. THE RETURN STATEMENT
//    return sends a value back to the caller AND stops the function.
//    A function with no return statement returns undefined.
// =====================================================================

// ---------------------------------------------------------------------
// CHALLENGE 1 — isPrime (function declaration — this syntax is mandatory)
//   Return true if n is a prime number, false otherwise.
//   Rules: any number less than 2 (including 0, negatives) is NOT prime.
//   Twist: one early return in the middle of a loop beats ten ifs.
//   Hint: you only need to test divisors from 2 up to Math.sqrt(n).
// ---------------------------------------------------------------------

function isPrime(n) {
  
}

// ---------------------------------------------------------------------
// CHALLENGE 2 — countVowels (function expression — this syntax is mandatory)
//   Return how many vowels (a, e, i, o, u) a text contains.
//   Twist: "AEIOU" has 5 too — upper and lower case both count.
//   Hints: for...of walks a string one character at a time;
//          "aeiou".includes(ch) is true when ch is a vowel;
//          text.toLowerCase() normalizes the case first.
// ---------------------------------------------------------------------

const countVowels = function (text) {
  // TODO: write the body.
};

// ---------------------------------------------------------------------
// CHALLENGE 3 — findLongestWord (arrow function — this syntax is mandatory)
//   Return the longest word in the array.
//   Rules: an empty array returns "" (the empty string). When two words
//   tie, the FIRST one wins.
//   Twist: it is findMax from your notes — but comparing .length instead
//   of the values themselves.
// ---------------------------------------------------------------------

const findLongestWord = (words) => {
  // TODO: write the body.
};

// ---------------------------------------------------------------------
// CHALLENGE 4 — applyDiscount (arrow function + DEFAULT PARAMETER)
//   applyDiscount(price)            -> price minus 10% (the default)
//   applyDiscount(price, percent)   -> price minus percent%
//   Twist: money never shows more than 2 decimals. Round the final
//   price to cents: Math.round(value * 100) / 100
//   (applyDiscount(19.99, 15) must be 16.99 — not 16.9915.)
// ---------------------------------------------------------------------

const applyDiscount = (price, discountPercent = 10) => {
  // TODO: write the body.
};

// ---------------------------------------------------------------------
// CHALLENGE 5 — BUG HUNT (two functions already written — badly)
//   These two look finished but fail their tests. Find each bug and fix
//   it with AT MOST two line-edits per function. Do NOT rewrite them —
//   reading someone else's broken code is the skill being trained.
//   No hint given, on purpose. The FAIL report tells you what is wrong.
// ---------------------------------------------------------------------

function sumTo(n) {
  // Should return 1 + 2 + ... + n  (sumTo(4) -> 10)
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total = total + i;
    return total;
  }
}

function countdown(n) {
  // Should return [n, n-1, ..., 2, 1]  (countdown(3) -> [3, 2, 1])
  const out = [];
  for (let i = n; i > 1; i--) {
    out.push(i);
  }
  return out;
}

// ---------------------------------------------------------------------
// STRETCH CHALLENGE (optional — boss level) — titleCase
//   Only attempt this when every REQUIRED test below is green.
//   Capitalize the first letter of every word and lowercase the rest:
//   titleCase("the kop stand") -> "The Kop Stand"
//   titleCase("OLD TRAFFORD")  -> "Old Trafford"
//   titleCase("")              -> ""
//   Any syntax you like. toLowerCase / split / join / slice are legal.
// ---------------------------------------------------------------------

function titleCase(sentence) {
  // TODO: optional — write the body.
}

// =====================================================================
// AUTO-CHECK — DO NOT EDIT ANYTHING BELOW THIS LINE.
//   The harness calls every function above and prints a report:
//     PASS  isPrime(2) -> true
//     FAIL  isPrime(25) -> false (5 x 5) — expected false, got true
//   Required: 26/26 (and 0 FAIL lines) = Part 1 done.
//   A crash instead of a report is also a failure — read the line number.
// =====================================================================

const __required = [];
const __stretch = [];

function check(label, actual, expected) {
  __required.push({
    label,
    ok: JSON.stringify(actual) === JSON.stringify(expected),
    expected,
    actual,
  });
}

function checkStretch(label, actual, expected) {
  __stretch.push({
    label,
    ok: JSON.stringify(actual) === JSON.stringify(expected),
    expected,
    actual,
  });
}

// Challenge 1 — isPrime
check("isPrime(2) -> true", isPrime(2), true);
check("isPrime(11) -> true", isPrime(11), true);
check("isPrime(9) -> false", isPrime(9), false);
check("isPrime(25) -> false (5 x 5)", isPrime(25), false);
check("isPrime(0) -> false (below 2)", isPrime(0), false);
check("isPrime(1) -> false (1 is not prime)", isPrime(1), false);
check("isPrime(-7) -> false (negatives)", isPrime(-7), false);

// Challenge 2 — countVowels
check('countVowels("hello") -> 2', countVowels("hello"), 2);
check('countVowels("AEIOU") -> 5 (case-insensitive)', countVowels("AEIOU"), 5);
check('countVowels("rhythm") -> 0', countVowels("rhythm"), 0);
check('countVowels("") -> 0', countVowels(""), 0);
check('countVowels("CUNEF Escuela") -> 6', countVowels("CUNEF Escuela"), 6);

// Challenge 3 — findLongestWord
check(
  "findLongestWord([Messi, Ronaldo, Bellingham])",
  findLongestWord(["Messi", "Ronaldo", "Bellingham"]),
  "Bellingham",
);
check("findLongestWord tie -> first ([goat, king])", findLongestWord(["goat", "king"]), "goat");
check("findLongestWord([]) -> empty string", findLongestWord([]), "");
check('findLongestWord(["a"]) -> "a"', findLongestWord(["a"]), "a");

// Challenge 4 — applyDiscount
check("applyDiscount(100) -> 90 (10% default)", applyDiscount(100), 90);
check("applyDiscount(80, 25) -> 60", applyDiscount(80, 25), 60);
check("applyDiscount(19.99, 15) -> 16.99 (rounded)", applyDiscount(19.99, 15), 16.99);
check("applyDiscount(20, 50) -> 10", applyDiscount(20, 50), 10);
check("applyDiscount(50, 0) -> 50", applyDiscount(50, 0), 50);

// Challenge 5 — bug hunt
check("sumTo(1) -> 1", sumTo(1), 1);
check("sumTo(4) -> 10", sumTo(4), 10);
check("sumTo(10) -> 55", sumTo(10), 55);
check("countdown(3) -> [3, 2, 1]", countdown(3), [3, 2, 1]);
check("countdown(1) -> [1]", countdown(1), [1]);

// Stretch — titleCase (optional)
checkStretch('titleCase("the kop stand")', titleCase("the kop stand"), "The Kop Stand");
checkStretch('titleCase("OLD TRAFFORD")', titleCase("OLD TRAFFORD"), "Old Trafford");
checkStretch('titleCase("")', titleCase(""), "");

// ---- Report ----
let reqPassed = 0;
for (const t of __required) {
  if (t.ok) {
    reqPassed++;
    console.log(`PASS  ${t.label}`);
  } else {
    console.error(`FAIL  ${t.label} — expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(t.actual)}`);
  }
}

let strPassed = 0;
if (__stretch.length > 0) {
  console.log("\nSTRETCH (optional — only fix this once the required tests are green):");
  for (const t of __stretch) {
    if (t.ok) {
      strPassed++;
      console.log(`PASS  ${t.label}`);
    } else {
      console.error(`FAIL  ${t.label} — expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(t.actual)}`);
    }
  }
}

console.log(`\nRequired: ${reqPassed}/${__required.length}   Stretch: ${strPassed}/${__stretch.length}`);
if (reqPassed === __required.length) {
  console.log("ALL REQUIRED TESTS PASS — Part 1 done. Explain declaration vs expression vs arrow to your partner, then move to Part 2 of the brief.");
} else {
  console.log("Read every FAIL line (expected vs got), fix that body, and run the file again.");
  if (typeof process !== "undefined") {
    process.exitCode = 1;
  }
}
