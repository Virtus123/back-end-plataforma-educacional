// Integração com a API do Google Gemini para gerar questões
async function generateQuestions(subject, level) {
    // Aqui você implementaria a integração com a API do Gemini
    // Por enquanto, retornaremos questões de exemplo
    return [
        {
            question: "Exemplo de pergunta 1?",
            options: ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
            correct_answer: "A"
        },
        // ... mais questões
    ];
}

let currentQuestions = [];
let currentQuestion = 0;
let userAnswers = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    updateUserInfo();

    const subject = sessionStorage.getItem('selectedSubject');
    const level = sessionStorage.getItem('selectedLevel');

    if (!subject || !level) {
        window.location.href = 'dashboard.html';
        return;
    }

    document.getElementById('quizTitle').textContent = `Quiz de ${subject} - Nível ${level}`;

    try {
        // Mostrar loading
        document.getElementById('questionContainer').innerHTML = '<div class="loading">Carregando questões...</div>';

        // Buscar questões da API
        const response = await fetch(`http://localhost:3000/api/questions/${encodeURIComponent(subject)}/${encodeURIComponent(level)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status da resposta:', response.status);
        console.log('URL da requisição:', response.url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta do servidor:', errorText);
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.success || !Array.isArray(data.questions)) {
            throw new Error('Formato de resposta inválido');
        }

        currentQuestions = data.questions;
        
        if (currentQuestions.length === 0) {
            throw new Error('Nenhuma questão foi gerada');
        }

        displayCurrentQuestion();
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        document.getElementById('questionContainer').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar questões: ${error.message}</p>
                <p class="error-details">Tente novamente em alguns instantes.</p>
                <button onclick="window.location.reload()">Tentar Novamente</button>
                <button onclick="window.location.href='subjects.html'">Voltar para Matérias</button>
            </div>
        `;
    }
});

function displayCurrentQuestion() {
    const container = document.getElementById('questionContainer');
    const question = currentQuestions[currentQuestion];

    container.innerHTML = `
        <div class="question-header">
            <h3>Questão ${currentQuestion + 1} de ${currentQuestions.length}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${((currentQuestion + 1) / currentQuestions.length) * 100}%"></div>
            </div>
        </div>
        <div class="question">
            <p>${question.question}</p>
            <div class="options">
                ${question.options.map((option, index) => `
                    <label class="option ${userAnswers[currentQuestion] === option[0] ? 'selected' : ''}">
                        <input type="radio" name="answer" value="${option[0]}" ${userAnswers[currentQuestion] === option[0] ? 'checked' : ''}>
                        ${option}
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="navigation-buttons">
            ${currentQuestion > 0 ? '<button onclick="previousQuestion()">Anterior</button>' : ''}
            ${currentQuestion < currentQuestions.length - 1 
                ? '<button onclick="nextQuestion()">Próxima</button>' 
                : '<button onclick="submitQuiz()">Finalizar</button>'}
        </div>
    `;

    // Adicionar evento para as opções
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.addEventListener('change', (e) => {
            userAnswers[currentQuestion] = e.target.value;
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            e.target.parentElement.classList.add('selected');
        });
    });
}

function nextQuestion() {
    if (currentQuestion < currentQuestions.length - 1) {
        currentQuestion++;
        displayCurrentQuestion();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayCurrentQuestion();
    }
}

async function submitQuiz() {
    // Verificar se todas as questões foram respondidas
    if (userAnswers.length < currentQuestions.length) {
        const missing = currentQuestions.length - userAnswers.filter(Boolean).length;
        alert(`Faltam ${missing} questão(ões) para responder!`);
        return;
    }

    const user = JSON.parse(sessionStorage.getItem('user'));
    const subject = sessionStorage.getItem('selectedSubject');
    const level = sessionStorage.getItem('selectedLevel');

    let score = 0;
    const results = currentQuestions.map((q, index) => {
        const isCorrect = userAnswers[index] === q.correct_answer;
        if (isCorrect) score++;
        return {
            question: q.question,
            userAnswer: userAnswers[index],
            correctAnswer: q.correct_answer,
            isCorrect,
            explanation: q.explanation
        };
    });

    const finalScore = (score / currentQuestions.length) * 10;

    try {
        await dbOperations.saveProgress(user.id, subject, level, finalScore);
        
        // Mostrar resultados
        const container = document.getElementById('questionContainer');
        container.innerHTML = `
            <div class="quiz-results">
                <h2>Resultado Final</h2>
                <p class="final-score">Sua pontuação: ${finalScore.toFixed(1)}/10</p>
                <p>Você acertou ${score} de ${currentQuestions.length} questões</p>
                
                <div class="results-details">
                    ${results.map((r, i) => `
                        <div class="result-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                            <h4>Questão ${i + 1}</h4>
                            <p>${r.question}</p>
                            <p>Sua resposta: ${r.userAnswer}</p>
                            <p>Resposta correta: ${r.correctAnswer}</p>
                            <p class="explanation">${r.explanation}</p>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="window.location.href='dashboard.html'">Voltar ao Dashboard</button>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        alert('Erro ao salvar progresso');
    }
}
