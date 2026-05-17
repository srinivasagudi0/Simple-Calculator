const display = document.getElementById("display");
const historyList = document.getElementById("history");
const operators = ["+", "-", "*", "/"];
let shouldResetDisplay = false;
let history = [];

function setDisplay(value) {
  display.value = value || "0";
}

function getExpression() {
  return display.value === "0" ? "" : display.value;
}

function appendValue(value) {
  if (shouldResetDisplay && !operators.includes(value)) {
    setDisplay("");
    shouldResetDisplay = false;
  }

  const expression = getExpression();
  const lastChar = expression.slice(-1);

  if (operators.includes(value)) {
    shouldResetDisplay = false;
    if (!expression && value !== "-") return;
    if (operators.includes(lastChar)) {
      setDisplay(expression.slice(0, -1) + value);
      return;
    }
  }

  if (value === "." && currentNumber().includes(".")) return;

  setDisplay(expression + value);
}

function currentNumber() {
  return getExpression().split(/[+\-*/]/).pop();
}

function clearDisplay() {
  setDisplay("0");
  shouldResetDisplay = false;
}

function backspace() {
  if (shouldResetDisplay) {
    clearDisplay();
    return;
  }

  setDisplay(getExpression().slice(0, -1));
}

function toggleSign() {
  const expression = getExpression();
  const match = expression.match(/(-?\d+\.?\d*)$/);
  if (!match) return;

  const number = match[0];
  const flipped = number.startsWith("-") ? number.slice(1) : `-${number}`;
  setDisplay(expression.slice(0, match.index) + flipped);
}

function percent() {
  const expression = getExpression();
  const match = expression.match(/(\d+\.?\d*)$/);
  if (!match) return;

  const value = Number(match[0]) / 100;
  setDisplay(expression.slice(0, match.index) + trimNumber(value));
}

function calculate() {
  const expression = getExpression();
  if (!expression || operators.includes(expression.slice(-1))) return;

  try {
    const cleaned = expression.replace(/×/g, "*").replace(/÷/g, "/");
    if (!/^[\d+\-*/.()\s]+$/.test(cleaned)) throw new Error("Invalid expression");

    const result = Function(`"use strict"; return (${cleaned})`)();
    if (!Number.isFinite(result)) throw new Error("Invalid result");

    const finalValue = trimNumber(result);
    setDisplay(finalValue);
    addHistory(expression, finalValue);
    shouldResetDisplay = true;
  } catch {
    setDisplay("Error");
    shouldResetDisplay = true;
  }
}

function trimNumber(value) {
  return Number.parseFloat(Number(value).toFixed(10)).toString();
}

function addHistory(expression, result) {
  history.unshift({ expression, result });
  history = history.slice(0, 4);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  history.forEach((item) => {
    const row = document.createElement("li");
    row.innerHTML = `<span>${item.expression}</span><strong>${item.result}</strong>`;
    historyList.appendChild(row);
  });
}

document.querySelector(".calculator").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, action } = button.dataset;
  if (value) appendValue(value);
  if (action === "clear") clearDisplay();
  if (action === "backspace") backspace();
  if (action === "toggle-sign") toggleSign();
  if (action === "percent") percent();
  if (action === "calculate") calculate();
  if (action === "clear-history") {
    history = [];
    renderHistory();
  }
});

document.addEventListener("keydown", (event) => {
  if (/[\d+\-*/.]/.test(event.key)) appendValue(event.key);
  if (event.key === "Enter" || event.key === "=") calculate();
  if (event.key === "Backspace") backspace();
  if (event.key === "Escape") clearDisplay();
});
