const genButton = document.getElementById("genButton");
const inputForm = document.getElementById("form");
const switchButton = document.getElementById("switchButton");
const radioButtons = document.querySelectorAll('input[name="ranges"]');
const customInputs = document.getElementById('customRangeInputs');
const input = document.getElementById("input");


let max = 100; // initial max range 
let min = 0; // initial min range
let ranNum = 0; // stores current generated nmber
let caseChoice = "nominative"; // default grammatical case
let wordAnswer = ""; // correct answer in text
let count = 0; // current streak
let streak = 0; // highest streak
let cases = {}; // holds case data from JSON 
let numView = true; // number is shown when true, word when false

// Event listeners
// Enter in input textArea
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();

    const inputValue = document.getElementById("input").value;

    // validates answer and returns corresponding error message. numView wants a text answer, !numView wants a number answer
    if (inputValue === "") {
      checkAnswer();
      return;
    }
    if (numView && !isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    if (!numView && isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    // checks answer correctness and generates a new number
    checkAnswer();
    genRanNum();
  }
});
// Resets input field size after submitting answer
input.addEventListener("input", function () {
  this.style.height = "auto";      
  this.style.height = this.scrollHeight + "px"; 
});

// Prevents customMin going out range limits (0-1000000)
document.getElementById("customMin").addEventListener('input', function () {
  let customMin = this.value.trim();
  
  customMin = customMin.replace(/^0+/, '');

  if (customMin === '') {
    this.value = '0';
    return; 
  }

  customMin = parseInt(customMin, 10);
  const customMax = parseInt(document.getElementById("customMax").value, 10);

  if (customMin < 0) {
      this.value = '0';
  } else if (customMin > 1000000) {
      this.value = '1000000';
  } else if (customMin > customMax) {
      this.value = customMax.toString(); 
  } else {
      this.value = customMin.toString();
  }
});

// Prevents customMax going out range limits (0-1000000)
document.getElementById("customMax").addEventListener('input', function () {
  let customMax = this.value.trim(); 
  
  customMax = customMax.replace(/^0+/, '');

  if (customMax === '') {
    this.value = '0';
    return;
  }

  customMax = parseInt(customMax, 10);
  const customMin = parseInt(document.getElementById("customMin").value, 10);

  if (customMax < 0) {
      this.value = '0';
  } else if (customMax > 1000000) {
      this.value = '1000000';
  } else if (customMax < customMin) {
      this.value = customMin.toString();
  } else {
      this.value = customMax.toString();
  }
});

// Makes min max fields visible when custom range selected
radioButtons.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.value === 'custom') {
      customInputs.classList.remove('visually-hidden');
    } else {
      customInputs.classList.add('visually-hidden');
    }
  });
});

// Generates a new number when gen button clicked
genButton.addEventListener("click", function(event) {
    genRanNum();
});

// Toggles between digit and word view of the number
switchButton.addEventListener("click", function(event) {
  switchRan();
});

// Updates range values to match custom selected
document.getElementById("customRangeInputs").addEventListener("change", () => {
  const customMin = parseInt(document.getElementById("customMin").value, 10);
  const customMax = parseInt(document.getElementById("customMax").value, 10);

  rangeChange(customMin, customMax);
  genRanNum();
});

//querySelectors
// Range values update accordingly based on range selection
document.querySelectorAll('input[name="ranges"]').forEach((input) => {
  input.addEventListener('change', (e) => {
      const radioValue = e.target.value;
      // Ensures on custom select 1 and 10 is default
      if (radioValue === "custom") {
        rangeChange(1, 10);
        document.getElementById("customMin").value = 1;
        document.getElementById("customMax").value = 10;
        genRanNum();

      } else {
      const [minVal, maxVal] = e.target.value.split('-').map(Number);
      rangeChange(minVal, maxVal);
      genRanNum();
      }
  });
});

// Updates case based on selection
document.querySelectorAll('input[name="cases"]').forEach((input) => {
input.addEventListener('change', (e) => {
    caseChoice = e.target.value;
    genRanNum();
    console.log(caseChoice);
    console.log(wordAnswer);
});
});

// Starts the program
startProg();

//Functions
// Ensures json file loads first then generates a number.
async function startProg() {
  await loadCases();     
  genRanNum();                
}

// Loading json file to cases
async function loadCases() {
  try {
    const response = await fetch('./cases.json');
    cases = await response.json();
    console.log("Cases data loaded:", cases);
  } catch (error) {
    console.error("Error loading cases:", error);
    document.getElementById("countBox").textContent = "Error loading cases, please try to reload";
  }
}



// Sets new range for num generation based on user selection
function rangeChange(lowest, highest) {
    min = lowest;
    max = highest;
}

// Generates a random number based on min max ranges, they are inclusive.
function genRanNum() {
    if (isNaN(min) || isNaN(max)) {
      console.error("Min and max range are not valid numbers");
      document.getElementById("countBox").textContent = "Incorrect ranges selected, either adjust custom range or reload page";
      return;
    }

    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    ranNum = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
    
    defineAnswer();

    console.log(ranNum);

    if (numView) {
      document.getElementById("numBox").textContent = ranNum; 
    } else {
      document.getElementById("numBox").textContent = wordAnswer; 
    }

    document.getElementById("input").focus();
    
}

// Converts number into word form
function defineAnswer() {
  // checks for above million because can expand up to million million later potentially
  if (ranNum >= 1000000) {
    wordAnswer = cases[ranNum][caseChoice] 
    console.log(wordAnswer);
    return;
  }

  if (ranNum >= 1000) {
    wordAnswer = getThousands(ranNum);
    console.log(wordAnswer);
    return;
  }

  if (ranNum >= 0) {
    wordAnswer = getHundreds(ranNum);
    console.log(wordAnswer);
    return;
  }
}

// Converts the number to word for the hundreds, tens and ones.
function getHundreds(number) {
  let hundreds = Math.floor(number / 100);
  let tens = Math.floor((number % 100) / 10);
  let ones = number % 10;
  let tenshunsCase = joinNumCaseSwitch();

  let numParts = [];

  if (number === 100) {
    numParts.push(cases[100][caseChoice]);
  } else if (number === 0 ) {
    numParts.push(cases[0][caseChoice]);
  } else {
    if (hundreds === 1) {
      numParts.push(cases[100][caseChoice]);
    } else if (hundreds > 1) {
      numParts.push(cases[hundreds][caseChoice] + cases[100][tenshunsCase]);
    }
  
    if (tens === 1 && ones === 0) {
      numParts.push(cases[10][caseChoice]);
    } else {
      if (tens === 1 && ones > 0) {
        numParts.push(cases[ones][caseChoice] + "toista");
        return numParts.join("");
      } else if (tens > 1) {
      numParts.push(cases[tens][caseChoice] + cases[10][tenshunsCase]);
      }

      if (ones > 0) {
        numParts.push(cases[ones][caseChoice]);
      } 
    }
  }

  return numParts.join("");
}

// Converts the number to word for thousands and getHundreds added from above if needed.
function getThousands(number) {
  let thousands = Math.floor(number / 1000);
  let hundreds = number % 1000;
  let thousCase = joinNumCaseSwitch();

  let numParts = [];

  if (thousands === 1) {
    numParts.push(cases[1000][caseChoice]);
  } else {
    numParts.push(getHundreds(thousands) + cases[1000][thousCase]);
  }

  if (hundreds > 0) {
    numParts.push(getHundreds(hundreds));
  }

  return numParts.join("");
}

// Checks user answer against correct answer so either number in digit or word form
function checkAnswer() {
  const answer = document.getElementById("input").value.trim().toLowerCase();
  let correctAns = false;
  let shownAns = "";
  console.log(answer);
  console.log(wordAnswer);

  if (!answer) {
    document.getElementById("countBox").textContent = "Please enter an answer!"
    return;
  }

  if (numView) {
    if (!/^[a-zA-ZåäöÅÄÖ\s-]+$/.test(answer)) {
      document.getElementById("countBox").textContent = "Please enter only text!";
      document.getElementById("input").focus();
      return;
    }
    correctAns = (answer === wordAnswer);
    shownAns = wordAnswer;
  } else {
    if (isNaN(answer)) {
      document.getElementById("countBox").textContent = "Please enter only digits!";
      document.getElementById("input").focus();
      return;
    }
    correctAns = (parseInt(answer) === ranNum);
    shownAns = ranNum;
  }

  if (correctAns) {
    count++;
    streak++;
    document.getElementById("countBox").textContent = "Current Streak: " + count;
    document.getElementById("input").value = "";
    return;
  } else {
    document.getElementById("countBox").textContent = "That was incorrect you wrote " + "'" + answer + "'" + ". The correct answer was " + "'" + shownAns + "'.";
  }

  if (count > streak) {
    streak = count;
  }
  document.getElementById("streakBox").textContent = "Highest Streak: " + streak;
  document.getElementById("input").value = "";
  document.getElementById("input").style.height = "auto";
  document.getElementById("input").rows = 1;
  count = 0;
}

// Switches between number and text display
function switchRan() {
  genRanNum();
  
  document.getElementById("input").value = "";

  numView = !numView;

  document.getElementById("numBox").textContent = numView ? ranNum : wordAnswer;
  content = document.getElementById("numBox").textContent;

  if (content.toString().length > 37) {
    document.getElementById("numBox").style.fontSize = "16px";
  } else {
    document.getElementById("numBox").style.fontSize = "48px";
  }

  document.getElementById("switchButton").textContent = numView ? "Switch to Text" : "Switch to Number";
  checkTextOrNum();
}

// Ensures "connecting" numbers like ten, hundred, thousand are in partitive when the overall case is nominative, otherwise matching case.
function joinNumCaseSwitch() {
    return (caseChoice === "nominative") ? "partitive" : caseChoice;
}

// Adds .textBox styling if the number is displayed as text - margin-left. Temporary fix for readability.
function checkTextOrNum() {
  const numBox = document.getElementById("numBox");

  if (isNaN(numBox.textContent)) {
    numBox.classList.add("textBox");
  } else {
    numBox.classList.remove("textBox");
  }
}
