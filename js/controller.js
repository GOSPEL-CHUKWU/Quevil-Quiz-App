//buttons
const playBtn = document.querySelector('.play-button');
const highScoreBtn = document.querySelector('.high-score-button');
const closeBtn = document.querySelector('.close');
const startBtn = document.querySelector('.start-button');
const restartBtn = document.querySelector('.restart');
const playAgainBtn = document.querySelector('.play-again');
const goHomeBtn = document.querySelector('.go-home');
const saveBtn = document.querySelector('.save');

//Start page
const signIn = document.querySelector('.sign-in');
const start = document.querySelector('.container');

//Highscore page
const highScore = document.querySelector('.high-score');
const highScoreContainer = document.querySelector('.high-score-container');
const highScoreGoHome = document.querySelector('.high-score-go-home');
const emptyMessage = document.querySelector('.empty');

//username and amount of question input page
const input = document.querySelector('.input-container');
const overlay = document.querySelector('.overlay');
const userName = document.querySelector('#user-name');
const amountOfQuestion = document.querySelector('#amount-of-question');
const usernameError = document.querySelector('.user-error');
const amtOfQuestionError = document.querySelector('.amt-error');

//question and answer page
const questionSection = document.querySelector('.question-section');
const questionNumber = document.querySelector('.question-number');
const progressBar = document.querySelector('.progress-bar');
const question = document.querySelector('.question');
const scoreNumber = document.querySelector('.score');
const choices = Array.from(document.getElementsByClassName('choice'));

//endpage
const endSection = document.querySelector('.end-section');
const endScoreNumber = document.querySelector('.end-score');

let HIGH_SCORE = 0;
let score = 0;
let correctAnswerAmount = 0;
let questionAmount = 0;
let currentQuestion = {};
let allQuestions = [];
let canAnswer = false;
let username = '';
const highscoreValues = JSON.parse(localStorage.getItem('highscore')) || [];

////
///
//Fetching the questions
const fetchingAPI = async function (url) {
  const response = await fetch(url);
  const result = await response.json();
  const datas = await result;
  const quiz = datas.map(data => {
    // data.incorrectAnswers
    const result = {
      question: data.question,
      id: data.id,
    };
    const answers = [...data.incorrectAnswers];
    result.answer = Math.floor(Math.random() * 4 + 1);
    answers.splice(result.answer - 1, 0, data.correctAnswer);
    answers.forEach((answer, index) => {
      result['answer' + (index + 1)] = answer;
    });
    return result;
  });
  return quiz;
};

////
///
// Function for adding and removing the hidden class
const addOrRemove = function (html, option, property) {
  if (option === true) html.classList.add(`${property}`);
  if (option === false) html.classList.remove(`${property}`);
};

////
///
//Create New Question
const getNewQuestion = () => {
  if (allQuestions.length === 0 && questionAmount >= +amountOfQuestion.value) {
    addOrRemove(questionSection, true, 'hidden');
    addOrRemove(endSection, false, 'hidden');
    return;
  }
  questionAmount++;
  questionNumber.innerText = `Question ${questionAmount}/${amountOfQuestion.value}`;

  //increase progress bar
  progressBar.style.width = `${
    (questionAmount / +amountOfQuestion.value) * 100
  }%`;

  // if (allQuestions.length < amountOfQuestion.value) amountOfQuestion.value = 5;

  //new question
  const questionIndex = Math.floor(Math.random() * allQuestions.length);
  currentQuestion = allQuestions[questionIndex];
  question.innerText = currentQuestion.question;

  choices.forEach(choice => {
    const number = choice.dataset['number'];
    choice.innerText = currentQuestion['answer' + number];
  });

  allQuestions.splice(questionIndex, 1);

  canAnswer = true;
};

////
///
// Get New Question
choices.forEach(choice => {
  choice.addEventListener('click', e => {
    if (!canAnswer) return;

    canAnswer = false;
    const targetSelectedAnswer = e.target;
    const selectedAnswer = +targetSelectedAnswer.dataset['number'];

    // currentQuestion.answer === selectedAnswer?

    const classToApply = takenInClass => {
      //show correct/incorrect answer
      addOrRemove(targetSelectedAnswer, true, `${takenInClass}`);
      addOrRemove(targetSelectedAnswer, false, 'btn');

      //remove correct,incorrect answer and show next question
      setTimeout(() => {
        addOrRemove(targetSelectedAnswer, false, `${takenInClass}`);
        addOrRemove(targetSelectedAnswer, true, 'btn');

        getNewQuestion();
      }, 500);
    };

    if (currentQuestion.answer === selectedAnswer) {
      correctAnswerAmount++;
      classToApply('correct');
      score = Math.floor((correctAnswerAmount / +amountOfQuestion.value) * 100);
      scoreNumber.innerText = `Score: ${score}% of 100%`;
      endScoreNumber.innerText = `Score: ${score}% of 100%`;
    } else {
      classToApply('incorrect');

      choices.forEach(choice => {
        if (currentQuestion.answer === +choice.dataset['number']) {
          //show correct answer
          addOrRemove(choice, true, 'correct');
          addOrRemove(choice, false, 'btn');

          //remove correct answer
          setTimeout(() => {
            addOrRemove(choice, false, 'correct');
            addOrRemove(choice, true, 'btn');
          }, 500);
        }
      });
    }
    HIGH_SCORE = score;
  });
});

////
///
//Start Game
const startGame = async function () {
  if (!userName.value || !amountOfQuestion.value) {
    //username
    !userName.value
      ? addOrRemove(usernameError, false, 'hidden')
      : addOrRemove(usernameError, true, 'hidden');

    //amount of questions
    if (!amountOfQuestion.value) {
      amtOfQuestionError.innerText = `No Input`;
      addOrRemove(amtOfQuestionError, false, 'hidden');
    } else addOrRemove(amtOfQuestionError, true, 'hidden');
  } else if (userName.value && amountOfQuestion.value) {
    const allData = await fetchingAPI(
      'https://the-trivia-api.com/api/questions?categories=general_knowledge,film_and_tv,food_and_drink,arts_and_literature,geography,history,music,science,society_and_culture,sport_and_leisure&limit=50&difficulty=hard'
    );
    //guard clause for request above amount of questions
    if (+amountOfQuestion.value > allData.length) {
      amtOfQuestionError.innerText = `Above ${allData.length}`;
      addOrRemove(amtOfQuestionError, false, 'hidden');

      addOrRemove(usernameError, true, 'hidden');
      return;
    }

    username = userName.value;
    scoreNumber.innerText = `score: ${score}% of 100%`;
    endScoreNumber.innerText = `score: ${score}% of 100%`;
    addOrRemove(amtOfQuestionError, true, 'hidden');
    addOrRemove(start, true, 'hidden');
    addOrRemove(input, true, 'hidden');

    addOrRemove(questionSection, false, 'hidden');

    // const questions = allData.map(data => {});
    allQuestions = [...allData];
    allQuestions.splice(+amountOfQuestion.value, allQuestions.length);

    getNewQuestion();
  }
};

////
///
//Event Listeners
playBtn.addEventListener(
  'click',
  addOrRemove.bind(null, input, false, 'hidden')
);
closeBtn.addEventListener(
  'click',
  addOrRemove.bind(null, input, true, 'hidden')
);
overlay.addEventListener(
  'click',
  addOrRemove.bind(null, input, true, 'hidden')
);
startBtn.addEventListener('click', startGame);

const init = () => {
  score = 0;
  correctAnswerAmount = 0;
  questionAmount = 0;
  currentQuestion = {};
  allQuestions = [];
  canAnswer = false;
  progressBar.style.width = '0';
};

//Restart and Play again buttons
const restartBtns = [playAgainBtn, restartBtn];
restartBtns.forEach(restart => {
  restart.addEventListener('click', function () {
    progressBar.style.width = '0';
    init();
    startGame();
    addOrRemove(endSection, true, 'hidden');
  });
});

//Go Home button
const goHomeBtns = [goHomeBtn, highScoreGoHome];
goHomeBtns.forEach(goHomeBtn => {
  goHomeBtn.addEventListener('click', function () {
    init();
    userName.value = '';
    amountOfQuestion.value = '';

    goHomeBtns[0] === goHomeBtn
      ? addOrRemove(endSection, true, 'hidden')
      : addOrRemove(highScore, true, 'hidden');
    addOrRemove(start, false, 'hidden');
  });
});

//Save button
saveBtn.addEventListener('click', function () {
  highScoreContainer.innerText = '';
  score = 0;
  addOrRemove(endSection, true, 'hidden');
  addOrRemove(highScore, false, 'hidden');
  if (highScoreContainer.innerText === 'No Current Highscore')
    addOrRemove(emptyMessage, true, 'hidden');

  highscoreValues.push({
    username,
    HIGH_SCORE,
    amountOfQuestion: +amountOfQuestion.value,
    singularOrPlural: +amountOfQuestion.value > 1 ? 'questions' : 'question',
  });
  localStorage.setItem('highscore', JSON.stringify(highscoreValues));

  highscoreValues.map(highscoreValue => {
    const html = `
        <div class="single-high-score">
        <h2 class="user-name">${highscoreValue.username}:</h2>
        <h2 class="user-score">${highscoreValue.HIGH_SCORE}% of ${highscoreValue.amountOfQuestion} ${highscoreValue.singularOrPlural}</h2>
        <h2 class="remove">remove</h2>
      </div>`;

    highScoreContainer.insertAdjacentHTML('beforeend', html);
  });

  const remove = document.getElementsByClassName('remove');
  removeHighscoreFromLocalStorage(remove);
});

//HighScore button
highScoreBtn.addEventListener('click', function () {
  addOrRemove(start, true, 'hidden');
  addOrRemove(highScore, false, 'hidden');
  if (
    highScoreContainer.innerText === 'No Current Highscore' &&
    highscoreValues.length !== 0
  ) {
    addOrRemove(emptyMessage, true, 'hidden');

    highscoreValues.map(highscoreValue => {
      const html = `
        <div class="single-high-score">
        <h2 class="user-name">${highscoreValue.username}:</h2>
        <h2 class="user-score">${highscoreValue.HIGH_SCORE}% of ${highscoreValue.amountOfQuestion} ${highscoreValue.singularOrPlural}</h2>
        <h2 class="remove">remove</h2>
      </div>`;

      highScoreContainer.insertAdjacentHTML('beforeend', html);
    });
  }

  highScoreContainer.innerText === 'No Current Highscore' &&
  highscoreValues.length === 0
    ? addOrRemove(emptyMessage, false, 'hidden')
    : null;

  const remove = document.getElementsByClassName('remove');
  removeHighscoreFromLocalStorage(remove);
});

const removeHighscoreFromLocalStorage = property => {
  //remove highscore
  const removes = Array.from(property);
  removes.forEach((remove, i) => {
    remove.addEventListener('click', function (e) {
      //delete item
      const item = e.target;
      item.parentElement.remove();
      highscoreValues.splice(i, 1);

      //add item to localstorage
      localStorage.setItem('highscore', JSON.stringify(highscoreValues));

      highScoreContainer.innerText === '' && highscoreValues.length === 0
        ? addOrRemove(emptyMessage, false, 'hidden')
        : null;
    });
  });
};
