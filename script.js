/* 1 - Note that here there is no separation into different files, e.g. services, ...!
 * I've a repo (https://github.com/abdelgrib/Candrafts/tree/master/03_client_web_react/src) where I separate things a bit better.
 * 2 - It would have been interesting to implement the component pattern (and for data I'm using global not scoped variable).
 */

window.__state = {
  questions: [],
  currentQuestion: {
    category: "",
    difficulty: "",
    title: "",
    answers: [],
    correctAnswer: "",
  },
  timeInSeconds: 20,
  timeRemaining: 0
};

const fetchQuestions = async number => {
  const url = `https://opentdb.com/api.php?amount=${number}&difficulty=medium&type=multiple`;
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.log(error);
    return [];
  }

  /* Here 'expected errors' are not handled for fetch API.
   * See gists TypeScript : https://gist.github.com/abdelgrib/853db27c0a3970169f9d1d63a6943c9b or JavaScript.
   */
};

const mapQuestions = response => {
  if (!response && !response.results) 
    return [];

  const questions = response.results.map((result) => {
    return {
      category: result.category,
      difficulty: result.difficulty,
      title: result.question,
      answers: [...result.incorrect_answers, result.correct_answer],
      correctAnswer: result.correct_answer,
    };
  });

  return questions;
};

const selectQuestion = () => {
  const index = Math.floor(Math.random() * 5);

  if (!__state.questions || !__state.questions.length) 
    return {};

  return __state.questions[index];
};

const setupNextQuestion = () => {
  clearInterval(__state.timeRemaining);
  let countDownDate = new Date();
  countDownDate.setSeconds(countDownDate.getSeconds() + __state.timeInSeconds);
  __state.currentQuestion = selectQuestion();
  displayQuestion(countDownDate);
}

/* events, lifecycle */
window.onload = async () => {
  const response = await fetchQuestions(5);
  __state.questions = mapQuestions(response);
  setupNextQuestion();
};

const handleAnswerClick = answer => {
  const currentQuestion = __state.currentQuestion;
  displayAnswer(currentQuestion.correctAnswer === answer);
};

const handleNextQuestionClick = () => {
  setupNextQuestion();
};

/* template */
const displayQuestion = (countDownDate) => {
  const currentQuestion = __state.currentQuestion;
  if (!currentQuestion) 
    return;
  let questionDiv = document.getElementById("question");
  let answerDiv = document.getElementById("correct_answer");
  questionDiv.hidden = false;
  answerDiv.hidden = true;
  questionDiv.querySelector("p.category > span").innerHTML = currentQuestion.category;
  questionDiv.querySelector("p.difficulty > span").innerHTML = currentQuestion.difficulty;
  questionDiv.querySelector("h2.title > span").innerHTML = currentQuestion.title;
  let answersLIs = "";
  currentQuestion.answers.forEach((answer) => {
    answersLIs += `<li onclick="handleAnswerClick('${answer}')">${answer}</li>`;
  });
  questionDiv.querySelector("ul.answers").innerHTML = answersLIs;


  displayCountDown(countDownDate);
};

const displayAnswer = (isRight) => {
  let questionDiv = document.getElementById("question");
  let answerDiv = document.getElementById("correct_answer");
  questionDiv.hidden = true;
  answerDiv.innerHTML = isRight
    ? "<p>Well done, right answer!</p>"
    : "<p>Sorry, wrong answer!</p>";
  answerDiv.hidden = false;
};

const displayCountDown = (countDownDate) => {
  const element = document.querySelector('p.count_down > span');
  element.innerHTML = '';
  __state.timeRemaining = setInterval(() => {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    element.innerHTML = `${seconds + 1}`;
    if (distance < 0) {
      clearInterval(__state.timeRemaining);
      displayAnswer(false);
    }
  }, 1000);
};
