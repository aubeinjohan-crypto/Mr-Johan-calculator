
/* ==========================================
   MR JOHAN SCIENTIFIC CALCULATOR
   Complete JavaScript
   Version 1.0
========================================== */


/* ==========================================
   1. SELECT HTML ELEMENTS
========================================== */

const display = document.getElementById("display");

const previousExpression = document.getElementById("previousExpression");

const calculationStatus = document.getElementById("calculationStatus");

const memoryIndicator = document.getElementById("memoryIndicator");

const historyPanel = document.getElementById("historyPanel");

const historyList = document.getElementById("historyList");

const historyToggle = document.getElementById("historyToggle");

const themeToggle = document.getElementById("themeToggle");

const angleToggle = document.getElementById("angleToggle");

const scientificToggle = document.getElementById("scientificToggle");

const scientificSection = document.getElementById("scientificSection");

const copyResult = document.getElementById("copyResult");

const clearHistoryButton = document.getElementById("clearHistory");


/* ==========================================
   2. CALCULATOR STATE
========================================== */

let expression = "";

let memory = 0;

let angleMode = "DEG";

let justCalculated = false;

let calculationHistory = [];

const MAX_HISTORY = 50;

const STORAGE_KEYS = {
    history: "mrJohanCalculatorHistory",
    theme: "mrJohanCalculatorTheme",
    memory: "mrJohanCalculatorMemory",
    angle: "mrJohanCalculatorAngle"
};


/* ==========================================
   3. LOAD SAVED SETTINGS
========================================== */

function loadSavedSettings() {

    try {

        const savedHistory = localStorage.getItem(
            STORAGE_KEYS.history
        );

        const savedTheme = localStorage.getItem(
            STORAGE_KEYS.theme
        );

        const savedMemory = localStorage.getItem(
            STORAGE_KEYS.memory
        );

        const savedAngle = localStorage.getItem(
            STORAGE_KEYS.angle
        );


        if (savedHistory) {

            const parsedHistory = JSON.parse(savedHistory);

            if (Array.isArray(parsedHistory)) {

                calculationHistory = parsedHistory.slice(
                    0,
                    MAX_HISTORY
                );

            }

        }


        if (savedTheme === "light") {

            document.body.classList.add("light-theme");

            themeToggle.textContent = "☾";

        } else {

            themeToggle.textContent = "☀";

        }


        if (savedMemory !== null) {

            const parsedMemory = Number(savedMemory);

            if (Number.isFinite(parsedMemory)) {

                memory = parsedMemory;

            }

        }


        if (savedAngle === "RAD") {

            angleMode = "RAD";

        }


    } catch (error) {

        console.warn("Unable to load saved settings:", error);

    }


    angleToggle.textContent = angleMode;

    updateDisplay();

    updateMemoryIndicator();

    renderHistory();

}


/* ==========================================
   4. DISPLAY MANAGEMENT
========================================== */

function updateDisplay() {

    display.value = expression || "0";

    calculationStatus.textContent = "Ready";

}


function updateStatus(message) {

    calculationStatus.textContent = message;

}


function showError(message) {

    display.value = "Error";

    previousExpression.textContent = message;

    calculationStatus.textContent = "Error";

}


function resetDisplay() {

    expression = "";

    justCalculated = false;

    previousExpression.textContent = "Ready to calculate";

    updateDisplay();

}


function formatNumber(number) {

    if (!Number.isFinite(number)) {

        throw new Error("Math error");

    }

    if (Object.is(number, -0)) {

        number = 0;

    }

    if (Math.abs(number) < 1e-14) {

        number = 0;

    }

    return Number(number.toPrecision(12)).toString();

}


/* ==========================================
   5. SAVE SETTINGS
========================================== */

function saveSetting(key, value) {

    try {

        localStorage.setItem(key, String(value));

    } catch (error) {

        console.warn("Unable to save setting:", error);

    }

}


function saveHistory() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.history,
            JSON.stringify(calculationHistory)
        );

    } catch (error) {

        console.warn("Unable to save history:", error);

    }

}


/* ==========================================
   6. NUMBER INPUT
========================================== */

function inputNumber(number) {

    if (justCalculated) {

        expression = "";

        justCalculated = false;

        previousExpression.textContent = "New calculation";

    }

    expression += number;

    updateDisplay();

}


function inputDecimal() {

    if (justCalculated) {

        expression = "";

        justCalculated = false;

    }

    const lastPart = expression.split(/[+\-*/^()]/).pop();

    if (lastPart.includes(".")) {

        return;

    }

    if (expression === "" || /[+\-*/^(]$/.test(expression)) {

        expression += "0";

    }

    expression += ".";

    updateDisplay();

}


/* ==========================================
   7. OPERATOR INPUT
========================================== */

function inputOperator(operator) {

    if (expression === "" && operator !== "-") {

        return;

    }

    if (justCalculated) {

        justCalculated = false;

    }

    const lastCharacter = expression.slice(-1);

    if (/[+\-*/^]$/.test(lastCharacter)) {

        expression = expression.slice(0, -1);

    }

    if (expression === "" && operator === "-") {

        expression = "-";

    } else {

        expression += operator;

    }

    updateDisplay();

}


function inputParenthesis(value) {

    if (justCalculated && value === "(") {

        expression = "";

        justCalculated = false;

    }

    if (value === "(") {

        if (/[0-9)eπ]$/.test(expression)) {

            expression += "*";

        }

        expression += "(";

    } else {

        expression += ")";

    }

    updateDisplay();

}


/* ==========================================
   8. DELETE AND CLEAR
========================================== */

function deleteLast() {

    if (justCalculated) {

        resetDisplay();

        return;

    }

    expression = expression.slice(0, -1);

    updateDisplay();

}


function clearAll() {

    expression = "";

    justCalculated = false;

    previousExpression.textContent = "Ready to calculate";

    updateDisplay();

    updateStatus("Cleared");

}


/* ==========================================
   9. SIGN CHANGE
========================================== */

function changeSign() {

    if (!expression) {

        expression = "-";

    } else {

        expression = `-(${expression})`;

    }

    justCalculated = false;

    updateDisplay();

}


/* ==========================================
   10. CONSTANTS
========================================== */

function insertConstant(value) {

    if (justCalculated) {

        expression = "";

        justCalculated = false;

    }

    if (/[0-9.)]$/.test(expression)) {

        expression += "*";

    }

    if (value === "pi") {

        expression += "π";

    } else if (value === "e") {

        expression += "e";

    }

    updateDisplay();

}


/* ==========================================
   11. SAFE MATHEMATICAL EXPRESSION PARSER

   This parser does not use eval() or
   Function() to execute expressions.
========================================== */

const FUNCTIONS = {

    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,

    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,

    log: Math.log10,
    ln: Math.log,

    sqrt: Math.sqrt,
    abs: Math.abs,

    exp: Math.exp

};


function toRadians(value) {

    return angleMode === "DEG"
        ? value * Math.PI / 180
        : value;

}


function fromRadians(value) {

    return angleMode === "DEG"
        ? value * 180 / Math.PI
        : value;

}


/* TOKENIZER */

function tokenize(input) {

    const tokens = [];

    let position = 0;

    while (position < input.length) {

        const remaining = input.slice(position);

        const character = input[position];


        if (/\s/.test(character)) {

            position++;

            continue;

        }


        // Numbers, including decimal and scientific notation

        const numberMatch = remaining.match(
            /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i
        );

        if (numberMatch) {

            tokens.push({
                type: "number",
                value: Number(numberMatch[0])
            });

            position += numberMatch[0].length;

            continue;

        }


        // Mathematical constants

        if (character === "π" || character === "e") {

            tokens.push({
                type: "constant",
                value: character
            });

            position++;

            continue;

        }


        // Function names

        const functionMatch = remaining.match(
            /^[a-z]+/i
        );

        if (functionMatch) {

            const name = functionMatch[0].toLowerCase();

            if (!(name in FUNCTIONS)) {

                throw new Error("Unknown function: " + name);

            }

            tokens.push({
                type: "function",
                value: name
            });

            position += functionMatch[0].length;

            continue;

        }


        // Operators and parentheses

        if ("+-*/^()!%".includes(character)) {

            tokens.push({
                type: "symbol",
                value: character
            });

            position++;

            continue;

        }


        throw new Error("Invalid character: " + character);

    }


    // Add implicit multiplication.
    // Example: 2π becomes 2 * π.

    const result = [];

    for (let i = 0; i < tokens.length; i++) {

        const current = tokens[i];

        const previous = result[result.length - 1];

        if (previous) {

            const previousEndsValue =
                previous.type === "number" ||
                previous.type === "constant" ||
                previous.value === ")" ||
                previous.value === "!" ||
                previous.value === "%";

            const currentStartsValue =
                current.type === "number" ||
                current.type === "constant" ||
                current.type === "function" ||
                current.value === "(";

            if (previousEndsValue && currentStartsValue) {

                result.push({
                    type: "symbol",
                    value: "*"
                });

            }

        }

        result.push(current);

    }

    return result;

}


/* ==========================================
   12. MATHEMATICAL PARSER
========================================== */

function parseExpression(tokens) {

    let position = 0;


    function peek() {

        return tokens[position];

    }


    function consume(value) {

        const token = peek();

        if (token && token.value === value) {

            position++;

            return true;

        }

        return false;

    }


    function requireFinite(value) {

        if (!Number.isFinite(value)) {

            throw new Error("Math error");

        }

        return value;

    }


    // ADDITION AND SUBTRACTION

    function parseAddition() {

        let value = parseMultiplication();

        while (true) {

            if (consume("+")) {

                value += parseMultiplication();

            } else if (consume("-")) {

                value -= parseMultiplication();

            } else {

                break;

            }

            requireFinite(value);

        }

        return value;

    }


    // MULTIPLICATION AND DIVISION

    function parseMultiplication() {

        let value = parseUnary();

        while (true) {

            if (consume("*")) {

                value *= parseUnary();

            } else if (consume("/")) {

                const divisor = parseUnary();

                if (divisor === 0) {

                    throw new Error("Cannot divide by zero");

                }

                value /= divisor;

            } else {

                break;

            }

            requireFinite(value);

        }

        return value;

    }


    // POSITIVE AND NEGATIVE VALUES

    function parseUnary() {

        if (consume("+")) {

            return parseUnary();

        }

        if (consume("-")) {

            return -parseUnary();

        }

        return parsePower();

    }


    // POWERS

    function parsePower() {

        let value = parsePostfix();

        if (consume("^")) {

            value = Math.pow(value, parseUnary());

            requireFinite(value);

        }

        return value;

    }


    // FACTORIAL AND PERCENTAGE

    function parsePostfix() {

        let value = parsePrimary();

        while (true) {

            if (consume("%")) {

                value /= 100;

            } else if (consume("!")) {

                value = factorial(value);

            } else {

                break;

            }

            requireFinite(value);

        }

        return value;

    }


    // NUMBERS, CONSTANTS, FUNCTIONS AND PARENTHESES

    function parsePrimary() {

        const token = peek();

        if (!token) {

            throw new Error("Incomplete expression");

        }


        // Number

        if (token.type === "number") {

            position++;

            return token.value;

        }


        // Constants

        if (token.type === "constant") {

            position++;

            return token.value === "π"
                ? Math.PI
                : Math.E;

        }


        // Parentheses

        if (consume("(")) {

            const value = parseAddition();

            if (!consume(")")) {

                throw new Error("Missing closing parenthesis");

            }

            return value;

        }


        // Functions

        if (token.type === "function") {

            position++;

            const name = token.value;

            if (!consume("(")) {

                throw new Error("Function requires parentheses");

            }

            const argument = parseAddition();

            if (!consume(")")) {

                throw new Error("Missing closing parenthesis");

            }

            let result;


            if (name === "sin") {

                result = Math.sin(toRadians(argument));

            } else if (name === "cos") {

                result = Math.cos(toRadians(argument));

            } else if (name === "tan") {

                const angle = toRadians(argument);

                if (Math.abs(Math.cos(angle)) < 1e-12) {

                    throw new Error("Tangent is undefined");

                }

                result = Math.tan(angle);

            } else if (name === "asin") {

                result = fromRadians(Math.asin(argument));

            } else if (name === "acos") {

                result = fromRadians(Math.acos(argument));

            } else if (name === "atan") {

                result = fromRadians(Math.atan(argument));

            } else {

                result = FUNCTIONS[name](argument);

            }

            return requireFinite(result);

        }


        throw new Error("Invalid mathematical expression");

    }


    const result = parseAddition();


    if (position !== tokens.length) {

        throw new Error("Invalid expression");

    }


    return requireFinite(result);

}


/* ==========================================
   13. FACTORIAL FUNCTION
========================================== */

function factorial(number) {

    if (number < 0) {

        throw new Error("Negative factorial is undefined");

    }

    if (!Number.isInteger(number)) {

        throw new Error("Factorial requires a whole number");

    }

    if (number > 170) {

        throw new Error("Factorial is too large");

    }

    let result = 1;

    for (let i = 2; i <= number; i++) {

        result *= i;

    }

    return result;

}


/* ==========================================
   14. CALCULATE RESULT
========================================== */

function calculate() {

    if (!expression.trim()) {

        return;

    }

    const originalExpression = expression;

    try {

        const tokens = tokenize(expression);

        const result = parseExpression(tokens);

        const formattedResult = formatNumber(result);


        previousExpression.textContent =
            originalExpression + " =";


        expression = formattedResult;

        justCalculated = true;

        updateDisplay();

        updateStatus("Calculation successful");


        addToHistory(
            originalExpression,
            formattedResult
        );


    } catch (error) {

        showError(error.message || "Invalid calculation");

        console.error("Calculator error:", error);

    }

}


/* ==========================================
   15. APPLY SCIENTIFIC FUNCTIONS
========================================== */

function applyFunction(name) {

    if (!expression) {

        if (["square", "factorial", "reciprocal", "postfix"].includes(name)) {

            return;

        }

        expression = name + "(";

        justCalculated = false;

        updateDisplay();

        return;

    }


    try {

        const tokens = tokenize(expression);

        const result = parseExpression(tokens);

        let newResult;


        switch (name) {

            case "square":

                newResult = Math.pow(result, 2);

                break;


            case "sqrt":

                newResult = Math.sqrt(result);

                break;


            case "factorial":

                newResult = factorial(result);

                break;


            case "abs":

                newResult = Math.abs(result);

                break;


            case "reciprocal":

                if (result === 0) {

                    throw new Error("Cannot divide by zero");

                }

                newResult = 1 / result;

                break;


            case "exp":

                newResult = Math.exp(result);

                break;


            case "sin":

                newResult = Math.sin(toRadians(result));

                break;


            case "cos":

                newResult = Math.cos(toRadians(result));

                break;


            case "tan":

                if (Math.abs(Math.cos(toRadians(result))) < 1e-12) {

                    throw new Error("Tangent is undefined");

                }

                newResult = Math.tan(toRadians(result));

                break;


            case "asin":

                newResult = fromRadians(Math.asin(result));

                break;


            case "acos":

                newResult = fromRadians(Math.acos(result));

                break;


            case "atan":

                newResult = fromRadians(Math.atan(result));

                break;


            case "log":

                newResult = Math.log10(result);

                break;


            case "ln":

                newResult = Math.log(result);

                break;


            default:

                throw new Error("Unknown mathematical function");

        }


        expression = formatNumber(newResult);

        justCalculated = true;

        previousExpression.textContent =
            name + "(" + formatNumber(result) + ")";

        updateDisplay();

        updateStatus("Function applied");


    } catch (error) {

        showError(error.message);

    }

}


/* ==========================================
   16. PERCENTAGE
========================================== */

function applyPercentage() {

    if (!expression) {

        return;

    }

    if (/[+\-*/^(]$/.test(expression)) {

        return;

    }

    if (justCalculated) {

        justCalculated = false;

    }

    expression += "%";

    updateDisplay();

}


/* ==========================================
   17. MEMORY FUNCTIONS
========================================== */

function getCurrentValue() {

    if (!expression) {

        return 0;

    }

    const tokens = tokenize(expression);

    return parseExpression(tokens);

}


function updateMemoryIndicator() {

    if (memory === 0) {

        memoryIndicator.textContent = "MEM: OFF";

    } else {

        memoryIndicator.textContent = "MEM: " + formatNumber(memory);

    }

}


function memoryClear() {

    memory = 0;

    saveSetting(STORAGE_KEYS.memory, memory);

    updateMemoryIndicator();

    updateStatus("Memory cleared");

}


function memoryRecall() {

    expression += formatNumber(memory);

    justCalculated = false;

    updateDisplay();

    updateStatus("Memory recalled");

}


function memoryAdd() {

    try {

        memory += getCurrentValue();

        saveSetting(STORAGE_KEYS.memory, memory);

        updateMemoryIndicator();

        updateStatus("Added to memory");

    } catch (error) {

        showError(error.message);

    }

}


function memorySubtract() {

    try {

        memory -= getCurrentValue();

        saveSetting(STORAGE_KEYS.memory, memory);

        updateMemoryIndicator();

        updateStatus("Subtracted from memory");

    } catch (error) {

        showError(error.message);

    }

}


function memoryStore() {

    try {

        memory = getCurrentValue();

        saveSetting(STORAGE_KEYS.memory, memory);

        updateMemoryIndicator();

        updateStatus("Value saved to memory");

    } catch (error) {

        showError(error.message);

    }

}


/* ==========================================
   18. CALCULATION HISTORY
========================================== */

function addToHistory(original, result) {

    const item = {

        expression: original,

        result: result,

        date: new Date().toISOString()

    };


    calculationHistory.unshift(item);

    calculationHistory = calculationHistory.slice(
        0,
        MAX_HISTORY
    );

    saveHistory();

    renderHistory();

}


function renderHistory() {

    historyList.replaceChildren();


    if (calculationHistory.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-history";


        const icon = document.createElement("span");

        icon.textContent = "◷";


        const message = document.createElement("p");

        message.textContent = "No calculations yet";


        empty.append(icon, message);

        historyList.appendChild(empty);

        return;

    }


    calculationHistory.forEach((item, index) => {

        const historyItem = document.createElement("div");

        historyItem.className = "history-item";

        historyItem.tabIndex = 0;

        historyItem.setAttribute("role", "button");

        historyItem.setAttribute(
            "aria-label",
            "Load calculation " + item.expression
        );


        const expressionElement = document.createElement("span");

        expressionElement.className = "history-expression";

        expressionElement.textContent = item.expression + " =";


        const resultElement = document.createElement("span");

        resultElement.className = "history-result";

        resultElement.textContent = item.result;


        historyItem.append(
            expressionElement,
            resultElement
        );


        function loadHistoryItem() {

            expression = item.result;

            justCalculated = true;

            previousExpression.textContent =
                item.expression + " =";

            updateDisplay();

            updateStatus("History item loaded");

        }


        historyItem.addEventListener(
            "click",
            loadHistoryItem
        );


        historyItem.addEventListener("keydown", (event) => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                loadHistoryItem();

            }

        });


        historyList.appendChild(historyItem);

    });

}


function clearHistory() {

    calculationHistory = [];

    saveHistory();

    renderHistory();

    updateStatus("History cleared");

}


/* ==========================================
   19. HISTORY PANEL TOGGLE
========================================== */

historyToggle.addEventListener("click", () => {

    historyPanel.classList.toggle("show");

});


/* ==========================================
   20. DARK AND LIGHT THEMES
========================================== */

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-theme");


    const isLight = document.body.classList.contains(
        "light-theme"
    );


    if (isLight) {

        themeToggle.textContent = "☾";

        saveSetting(STORAGE_KEYS.theme, "light");

    } else {

        themeToggle.textContent = "☀";

        saveSetting(STORAGE_KEYS.theme, "dark");

    }

});


/* ==========================================
   21. DEGREE AND RADIAN MODE
========================================== */

angleToggle.addEventListener("click", () => {

    angleMode = angleMode === "DEG" ? "RAD" : "DEG";

    angleToggle.textContent = angleMode;

    saveSetting(STORAGE_KEYS.angle, angleMode);

    updateStatus("Angle mode: " + angleMode);

});


/* ==========================================
   22. SCIENTIFIC MODE TOGGLE
========================================== */

scientificToggle.addEventListener("click", () => {

    scientificSection.classList.toggle("collapsed");

    const isCollapsed = scientificSection.classList.contains(
        "collapsed"
    );

    scientificToggle.textContent = isCollapsed
        ? "SCI +"
        : "SCI";

});


/* ==========================================
   23. COPY RESULT
========================================== */

copyResult.addEventListener("click", async () => {

    const value = display.value;

    if (!value || value === "0" || value === "Error") {

        updateStatus("Nothing to copy");

        return;

    }

    try {

        await navigator.clipboard.writeText(value);

        updateStatus("Result copied!");

        copyResult.textContent = "✓";

        setTimeout(() => {

            copyResult.textContent = "▢";

        }, 1000);

    } catch (error) {

        updateStatus("Unable to copy result");

    }

});


/* ==========================================
   24. CLEAR HISTORY BUTTON
========================================== */

clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


/* ==========================================
   25. BUTTON CLICK EVENT HANDLING
========================================== */

document.querySelectorAll("[data-action]").forEach(button => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;

        const value = button.dataset.value;


        switch (action) {

            case "number":

                inputNumber(value);

                break;


            case "decimal":

                inputDecimal();

                break;


            case "operator":

                inputOperator(value);

                break;


            case "parenthesis":

                inputParenthesis(value);

                break;


            case "clear":

                clearAll();

                break;


            case "delete":

                deleteLast();

                break;


            case "sign":

                changeSign();

                break;


            case "calculate":

                calculate();

                break;


            case "constant":

                insertConstant(value);

                break;


            case "function":

                applyFunction(value);

                break;


            case "postfix":

                applyPercentage();

                break;


            case "memory-clear":

                memoryClear();

                break;


            case "memory-recall":

                memoryRecall();

                break;


            case "memory-add":

                memoryAdd();

                break;


            case "memory-subtract":

                memorySubtract();

                break;


            case "memory-store":

                memoryStore();

                break;

        }

    });

});


/* ==========================================
   26. KEYBOARD SUPPORT
========================================== */

document.addEventListener("keydown", (event) => {

    const key = event.key;


    // Ignore browser shortcuts and key combinations

    if (event.ctrlKey || event.metaKey || event.altKey) {

        return;

    }


    // Number input

    if (/^[0-9]$/.test(key)) {

        inputNumber(key);

        event.preventDefault();

        return;

    }


    // Decimal

    if (key === ".") {

        inputDecimal();

        event.preventDefault();

        return;

    }


    // Operators

    if (["+", "-", "*", "/", "^"].includes(key)) {

        inputOperator(key);

        event.preventDefault();

        return;

    }


    // Parentheses

    if (key === "(" || key === ")") {

        inputParenthesis(key);

        event.preventDefault();

        return;

    }


    // Percentage

    if (key === "%") {

        applyPercentage();

        event.preventDefault();

        return;

    }


    // Calculate

    if (key === "Enter" || key === "=") {

        calculate();

        event.preventDefault();

        return;

    }


    // Delete last character

    if (key === "Backspace") {

        deleteLast();

        event.preventDefault();

        return;

    }


    // Clear calculator

    if (key === "Escape" || key === "Delete") {

        clearAll();

        event.preventDefault();

        return;

    }

});


/* ==========================================
   27. INITIALIZE CALCULATOR
========================================== */

function initializeCalculator() {

    loadSavedSettings();

    updateDisplay();

    updateMemoryIndicator();

    renderHistory();

    console.log(
        "MR JOHAN Scientific Calculator is ready!"
    );

}


// Start calculator

initializeCalculator();


/* ==========================================
   END OF MR JOHAN SCIENTIFIC CALCULATOR
========================================== */
