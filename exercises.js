/*
  Session 9 Lab — Part 2: exercises for the GLOBO site
  Made by: Maria Cuadrado and Adriana Acebal

  Loaded from index.html and login.html. Everything prints to the
  browser console (F12) — it does not change the page.
*/

// ---------------------------------------------------------------------
// FizzBuzz — print 1..n. Multiples of 3 become "Fizz",
// multiples of 5 become "Buzz", multiples of both become "FizzBuzz".
// ---------------------------------------------------------------------
function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    // Check 15 first: a multiple of both would otherwise stop at "Fizz"
    if (i % 15 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

// ---------------------------------------------------------------------
// findMax — return the largest value in the array, with a plain loop
// (no Math.max). An empty array has no largest value, so we return
// undefined: returning 0 or -Infinity would invent a value that is not
// in the array.
// ---------------------------------------------------------------------
function findMax(numbers) {
  if (numbers.length === 0) {
    return undefined;
  }
  // Start from the first element, not 0, so all-negative arrays work
  let max = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}

// ---------------------------------------------------------------------
// isPalindrome — true if str reads the same backwards, ignoring case,
// spaces, and punctuation.
// ---------------------------------------------------------------------
function isPalindrome(str) {
  // Keep only letters and digits, all in lower case
  let cleaned = "";
  for (const ch of str.toLowerCase()) {
    if ((ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9")) {
      cleaned = cleaned + ch;
    }
  }
  // Compare from both ends towards the middle
  for (let i = 0; i < cleaned.length / 2; i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------
// Arrow refactor of isPalindrome — same behavior, different syntax.
// ---------------------------------------------------------------------
const isPalindromeArrow = (str) => {
  let cleaned = "";
  for (const ch of str.toLowerCase()) {
    if ((ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9")) {
      cleaned = cleaned + ch;
    }
  }
  for (let i = 0; i < cleaned.length / 2; i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) {
      return false;
    }
  }
  return true;
};

// ---------------------------------------------------------------------
// validateEmail — a basic shape check: no spaces, one "@" with text
// before it, and a "." after the "@" with text on both sides.
// ---------------------------------------------------------------------
function validateEmail(email) {
  if (email.includes(" ")) {
    return false;
  }
  const parts = email.split("@");
  if (parts.length !== 2) {
    return false; // no "@" at all, or more than one
  }
  const beforeAt = parts[0];
  const afterAt = parts[1];
  if (beforeAt.length === 0) {
    return false;
  }
  const dot = afterAt.indexOf(".");
  // dot > 0: text before the dot; dot < length - 1: text after it
  return dot > 0 && dot < afterAt.length - 1;
}

// ---------------------------------------------------------------------
// validatePassword — at least 8 characters, with at least one letter
// AND at least one digit.
// ---------------------------------------------------------------------
function validatePassword(password) {
  if (password.length < 8) {
    return false;
  }
  let hasLetter = false;
  let hasDigit = false;
  for (const ch of password.toLowerCase()) {
    if (ch >= "a" && ch <= "z") {
      hasLetter = true;
    } else if (ch >= "0" && ch <= "9") {
      hasDigit = true;
    }
  }
  return hasLetter && hasDigit;
}

// ---------------------------------------------------------------------
// validateLoginForm — combine the two checks. Returns
//   { valid: true,  errors: [] }            when both pass, or
//   { valid: false, errors: ["...", ...] }  listing what failed.
// ---------------------------------------------------------------------
function validateLoginForm(email, password) {
  const errors = [];
  if (!validateEmail(email)) {
    errors.push("Please enter a valid email address (like name@example.com).");
  }
  if (!validatePassword(password)) {
    errors.push("The password needs at least 8 characters, with letters and numbers.");
  }
  return { valid: errors.length === 0, errors: errors };
}

// =====================================================================
// TESTS — console.assert prints nothing when a check passes.
// =====================================================================

// FizzBuzz prints, so verify by eye: fizzBuzz(15) must produce
// 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
fizzBuzz(15);

console.assert(findMax([3, 7, 2, 9, 1]) === 9, "findMax basic");
console.assert(findMax([-5, -2, -9]) === -2, "findMax negatives");
console.assert(findMax([]) === undefined, "findMax empty");

console.assert(isPalindrome("racecar") === true, "isPalindrome basic");
console.assert(isPalindrome("A man, a plan, a canal: Panama") === true, "isPalindrome punctuation");
console.assert(isPalindrome("hello") === false, "isPalindrome false case");

console.assert(isPalindromeArrow("racecar") === true, "isPalindromeArrow basic");
console.assert(isPalindromeArrow("A man, a plan, a canal: Panama") === true, "isPalindromeArrow punctuation");
console.assert(isPalindromeArrow("hello") === false, "isPalindromeArrow false case");

console.assert(validateEmail("fan@riverside.fc") === true, "email valid");
console.assert(validateEmail("fan@riversidefc") === false, "email needs a dot");
console.assert(validateEmail("fanriverside.fc") === false, "email needs an @");

console.assert(validatePassword("Season2026") === true, "password ok");
console.assert(validatePassword("short1") === false, "password too short");
console.assert(validatePassword("allletters") === false, "password needs a digit");

console.assert(validateLoginForm("fan@riverside.fc", "Season2026").valid === true, "form valid");
console.assert(validateLoginForm("nope", "x").errors.length === 2, "form reports both errors");

// =====================================================================
// REAL DATA FROM OUR SITE — latitudes of the 8 GLOBO restaurants on
// the search.html map (same order as the list there). The biggest
// latitude is the restaurant furthest north in Madrid.
// =====================================================================
const globoRestaurants = [
  "Burger King Chamartín",
  "Burger King Tetuán",
  "Burger King Cuatro Caminos",
  "McDonald's Gran Vía",
  "McDonald's Princesa",
  "McDonald's Chamberí",
  "McDonald's Atocha",
  "McDonald's Montecarmelo",
];
const globoLatitudes = [
  40.4721547, 40.4606115, 40.4582009, 40.4217486,
  40.4250027, 40.4323068, 40.4096453, 40.5014306,
];

const northernmostLatitude = findMax(globoLatitudes);
const northernmostName = globoRestaurants[globoLatitudes.indexOf(northernmostLatitude)];
console.log("Northernmost GLOBO restaurant: " + northernmostName + " (lat " + northernmostLatitude + ")");
