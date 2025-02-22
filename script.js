class Quiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.currentQuestion = 0;
        this.answers = [];
        this.results = [];
        this.userAnswers = [];
        this.questions = [];
	this.correctAnswersCount = 0;
	this.incorrectAnswersCount = 0;  
        this.init();
    }

    async init() {
        // Welcome page
        document.getElementById('start-button').addEventListener('click', () => this.startQuiz());
	document.getElementById('finish-button').addEventListener('click', () => this.sendResults());

        // Загрузка вопросов из JSON-файла
        await this.loadQuestions();
    }

    async loadQuestions() {
        try {
            const response = await fetch('./questions.json');
            if (!response.ok) {
                throw new Error('Сеть ответила с ошибкой: ' + response.status);
            }
            this.questions = await response.json(); // Присваиваем загруженные данные переменной questions
        } catch (error) {
            console.error('Произошла ошибка при загрузке вопросов:', error);
        }
    }

    startQuiz() {
        document.getElementById('welcome-page').classList.remove('active');
        document.getElementById('welcome-page').style.display = 'none';
        document.getElementById('quiz').classList.add('active');
	document.getElementById('quiz').style.display = 'block';
        this.showQuestion();
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('question').innerText = question.question;

        const optionsGrid = document.getElementById('options');
        optionsGrid.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.innerText = option;

            optionButton.addEventListener('click', () => this.selectAnswer(index));
            optionsGrid.appendChild(optionButton);
        });
    }

    selectAnswer(index) {
        this.answers[this.currentQuestion] = index;

        const selected = this.questions[this.currentQuestion].options[index];
        const correct = this.questions[this.currentQuestion].answer;
        this.userAnswers.push({ selected, correct });
	this.results.push(selected === correct);

        // Move to next question after a short delay
        if (this.currentQuestion < this.questions.length - 1) {
            setTimeout(() => {
                this.currentQuestion++;
                this.showQuestion();
            }, 500);
        } else {
	    this.finishQuiz()
	}
    }


    finishQuiz() {
        document.getElementById('quiz').classList.remove('active');
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('finish-page').style.display = 'block';	
    }

    sendResults() {
        const resultsToSend = this.userAnswers.map((answer, index) => {
            return `Вопрос ${index + 1}: Выбран "${answer.selected}", дефолтный ответ: "${answer.correct}"`;
        }).join('\n');
    
        // Форматируем данные в JSON
	const dataToSend = {
	    resultsToSend: resultsToSend,
	    close_button: false
	};

        document.getElementById('finish-page').style.display = 'none';
        document.getElementById('results-page').style.display = 'block';	
	this.displayResultsChart();

	document.getElementById("share-whatsapp").addEventListener("click", () => this.shareOnPlatform.call(this, 'whatsapp'));
	document.getElementById("share-telegram").addEventListener("click", () => this.shareOnPlatform.call(this, 'telegram'));
	document.getElementById("share-vk").addEventListener("click", () => this.shareOnPlatform.call(this, 'vk'));	

	 const dataToSendString = JSON.stringify(dataToSend);

	// Отправляем данные в бот
	if (Telegram.WebApp.isExpanded) {
    	    Telegram.WebApp.sendData(dataToSendString, { disable_auto_closing: true });
	} else {
    	    Telegram.WebApp.expand(); // Разворачиваем, если не развернуто
	    Telegram.WebApp.sendData(dataToSendString, { disable_auto_closing: true });
	}
    }
	
    displayResultsChart() {
	const ctx = document.getElementById('resultsChart').getContext('2d');
	this.correctAnswersCount = this.results.filter(result => result).length;
	this.incorrectAnswersCount = this.results.length - this.correctAnswersCount;
	
	const chart = new Chart(ctx, {
	type: 'bar',
	data: {
	    labels: ['Правильные', 'Неправильные'],
		datasets: [{
		    label: 'Результаты квиза',
		    data: [this.correctAnswersCount, this.incorrectAnswersCount],
		    backgroundColor: ['#3CB371', '#CD5C5C'],
		}]
	    },
	    options: {
		scales: {
		    y: {
			beginAtZero: true,
			ticks: {
			    color: 'white'
		    	}
		    },
		    x: {
			ticks: {
			    color: 'white'
		    	}
		    }
		},
		plugins: {
		    legend: {
		    	labels: {
			    color: 'white'
		    	}
		    }
		}
	    },
	    plugins: [ChartDataLabels]
	});
	
	document.getElementById('resultsChart').style.display = 'block';
    }

    shareOnPlatform(platform) {
	const url = "https://t.me/investHT_bot";
	const message = `Мой результат в квизе ${this.correctAnswersCount} из ${this.questions.length}! Проверь тоже свои силы в @investHT_bot.`;
	let shareLink;
	
	switch (platform) {
	case 'whatsapp':
	    shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
	    break;
	case 'telegram':
	    shareLink = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
	    break;
	case 'vk':
	    shareLink = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(message)}`;
	    break;
	default:
	    console.error('Unsupported platform');
	    return;
	}
	
	window.open(shareLink, "_blank", "width=auto,height=auto");
    }

}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});
