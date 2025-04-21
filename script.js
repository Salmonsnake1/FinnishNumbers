let max = 1000001; // can we remove these somehow
let min = 0; // can we remove these somehow
let ranNum = 0; // sets the ranNum
let caseChoice = "nominative"; // ensures nominative first
let wordAnswer = ""; // ready for user input
let count = 0; // ready to track user progress
let streak = 0;
let cases = {}; // for my json file
let numView = true;

const genButton = document.getElementById("genButton");
const inputForm = document.getElementById("form");
const switchButton = document.getElementById("switchButton");
const radioButtons = document.querySelectorAll('input[name="ranges"]');
const customInputs = document.getElementById('customRangeInputs');
const input = document.getElementById("input");

// Event listeners


input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();

    const inputValue = document.getElementById("input").value;

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

    checkAnswer();
    genRanNum();
  }
});

input.addEventListener("input", function () {
  this.style.height = "auto";       // Reset height
  this.style.height = this.scrollHeight + "px"; // Set to full height
});

// makes sure customMin can not go outside range
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

// makes sure customMax can not go outside range
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

// deals with the visual of custom.
radioButtons.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.value === 'custom') {
      customInputs.classList.remove('visually-hidden');
    } else {
      customInputs.classList.add('visually-hidden');
    }
  });
});
// generating new number
genButton.addEventListener("click", function(event) {
    genRanNum();
});

// switching between text and number
switchButton.addEventListener("click", function(event) {
  switchRan();
});

// starting script
startProg();

// starts the program and ensures json is loaded first
async function startProg() {
  await loadCases();     
  genRanNum();                
}

// loading my json file
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

// this changes the range values to match the selected
document.querySelectorAll('input[name="ranges"]').forEach((input) => {
    input.addEventListener('change', (e) => {
        const radioValue = e.target.value;

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

// this changes the cases
document.querySelectorAll('input[name="cases"]').forEach((input) => {
  input.addEventListener('change', (e) => {
      caseChoice = e.target.value;
      genRanNum();
      console.log(caseChoice);
      console.log(wordAnswer);
  });
});

// this deals with the custom range - need to error catch, add event listeners so it does it correctly when selected etc
document.getElementById("customRangeInputs").addEventListener("change", () => {
    const customMin = parseInt(document.getElementById("customMin").value, 10);
    const customMax = parseInt(document.getElementById("customMax").value, 10);

    rangeChange(customMin, customMax);
    genRanNum();
});

// sets the range based on what is selected from the choices in list
function rangeChange(lowest, highest) {
    min = lowest;
    max = highest;
}

// this generates a random number that is inclusive to both min and max. Need to think about let max and min and about doing it another way
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

// converts number into word form to check against user input
function defineAnswer() {
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

// creates the word form for the hundreds
// could add error check like if case not found for hundreds, tens, ones etc, could see if thousands need the same
// could split the functions down like could have a get tens function, a get teens function, a get ones function
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

// creates word form for thousands
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

// checks the user answer against correct answer, checks if its string or number and updates count accordingly
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

// switching button so switches to word or number, and this in turn is checked by the input
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

// function for setting case for joining numbers
function joinNumCaseSwitch() {
    return (caseChoice === "nominative") ? "partitive" : caseChoice;
}

// function for switching the margin if text
function checkTextOrNum() {
  const numBox = document.getElementById("numBox");

  if (isNaN(numBox.textContent)) {
    numBox.classList.add("textBox");
  } else {
    numBox.classList.remove("textBox");
  }
}
