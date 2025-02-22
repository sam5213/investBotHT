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
        document.getElementById('start-button').addEventListener('click', () => this.startQuiz());
	    
        await this.loadQuestions();
        this.initMainButton();
    }

    initMainButton() {
        Telegram.WebApp.MainButton
            .setParams({ 
                color: '#3CB371',
                is_visible: false,
                text_color: '#ffffff'
            })
            .onClick(() => this.sendResults());
    }

    async loadQuestions() {
        try {
            const response = await fetch('./questions.json');
            this.questions = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
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
        const selected = this.questions[this.currentQuestion].options[index];
        const correct = this.questions[this.currentQuestion].answer;
        
        this.userAnswers.push({ selected, correct });
        this.results.push(selected === correct);

        if (this.currentQuestion < this.questions.length - 1) {
            setTimeout(() => {
                this.currentQuestion++;
                this.showQuestion();
            }, 500);
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        document.getElementById('quiz').classList.remove('active');
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('results-page').style.display = 'block';
        Telegram.WebApp.MainButton
            .setText('Отправить результаты')
            .show();
	this.displayResultsChart();
	this.initSocialButtons();
    }

    sendResults() {
        const resultsToSend = this.userAnswers.map((answer, index) => 
            `Вопрос ${index + 1}: Выбрано "${answer.selected}", правильный ответ: "${answer.correct}"`
        ).join('\n');

        const dataToSend = {
            resultsToSend: resultsToSend,
            close_button: false
        };

        Telegram.WebApp.sendData(JSON.stringify(dataToSend), { 
            disable_auto_closing: true 
        });

        Telegram.WebApp.MainButton.hide();
        //this.initSocialButtons();
    }

    initSocialButtons() {
        document.getElementById("share-whatsapp").addEventListener("click", () => this.shareOnPlatform('whatsapp'));
        document.getElementById("share-telegram").addEventListener("click", () => this.shareOnPlatform('telegram'));
        document.getElementById("share-vk").addEventListener("click", () => this.shareOnPlatform('vk'));
    }

    displayResultsChart() {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        this.correctAnswersCount = this.results.filter(Boolean).length;
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
                    y: { beginAtZero: true, ticks: { color: 'white' } },
                    x: { ticks: { color: 'white' } }
                },
                plugins: {
                    legend: { labels: { color: 'white' } }
                }
            },
	        plugins: [ChartDataLabels]
        });
        
        document.getElementById('resultsChart').style.display = 'block';
    }

    shareOnPlatform(platform) {
        const message = `Мой результат: ${this.correctAnswersCount}/${this.questions.length}! Пройди квиз в @investHT_bot`;
        const urls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent('https://t.me/investHT_bot')}&text=${encodeURIComponent(message)}`,
            vk: `https://vk.com/share.php?url=${encodeURIComponent('https://t.me/investHT_bot')}&title=${encodeURIComponent(message)}`
        };
        
        window.open(urls[platform], '_blank', "width=auto,height=auto");
	this.sendResults();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});
