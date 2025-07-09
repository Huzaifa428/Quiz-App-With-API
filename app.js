const questionContainer = document.getElementById('questionContainer');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const timerEl = document.getElementById('timer');

    let questions = [];
    let currentQuestionIndex = 0;
    const answers = {};
    let timer;
    let timeLeft = 30;

    fetch('https://the-trivia-api.com/v2/questions?limit=5')
      .then(response => response.json())
      .then(data => {
        questions = data;
        showQuestion();
      })
      .catch(error => {
        questionContainer.innerHTML = "Failed to load questions.";
        console.error(error);
      });

    function showQuestion() {
      clearInterval(timer);
      timeLeft = 30;
      updateTimer();

      const q = questions[currentQuestionIndex];
      const allAnswers = [...q.incorrectAnswers, q.correctAnswer];
      shuffle(allAnswers);

      questionContainer.innerHTML = `
        <div class="question-text">${currentQuestionIndex + 1}. ${q.question.text}</div>
        ${allAnswers.map(answer => `
          <div class="option">
            <input type="radio" name="answer" value="${answer}" ${
              answers[currentQuestionIndex] === answer ? 'checked' : ''
            }> ${answer}
          </div>
        `).join('')}
      `;

      
      nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'inline-block' : 'none';
      submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';

 
      nextBtn.disabled = true;

    
      const options = document.querySelectorAll('input[name="answer"]');
      options.forEach(option => {
        option.addEventListener('change', () => {
          nextBtn.disabled = false;
        });

        if (answers[currentQuestionIndex]) {
          nextBtn.disabled = false;
        }
      });

      startTimer();
    }

    function startTimer() {
      timer = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
          clearInterval(timer);

          Swal.fire({
            title: "Time's up!",
            text: "This question was skipped.",
            icon: "warning",
            confirmButtonText: "OK"
          }).then(() => {
            if (currentQuestionIndex < questions.length - 1) {
              currentQuestionIndex++;
              showQuestion();
            } else {
              showQuestion();
            }
          });
        }
      }, 1000);
    }

    function updateTimer() {
      timerEl.textContent = `Time Left: ${timeLeft}s`;
    }

    nextBtn.addEventListener('click', () => {
      saveAnswer();
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
      }
    });

    submitBtn.addEventListener('click', () => {
      saveAnswer();
      clearInterval(timer);

      let score = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          score++;
        }
      });

      questionContainer.innerHTML = '';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'none';
      timerEl.style.display = 'none';

      Swal.fire({
        title: 'Quiz Completed!',
        text: `You got ${score} out of ${questions.length} correct.`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Restart Quiz',
        cancelButtonText: 'Close'
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
        }
      });
    });

    function saveAnswer() {
      const selected = document.querySelector('input[name="answer"]:checked');
      if (selected) {
        answers[currentQuestionIndex] = selected.value;
      }
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }