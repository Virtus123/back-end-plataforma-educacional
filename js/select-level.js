// Carregar interface de níveis
// Exibe o nome da matéria selecionada, se desejar

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    updateUserInfo();

    const subject = sessionStorage.getItem('selectedSubject');
    if (!subject) {
        window.location.href = 'dashboard.html';
    }
});

function selectLevel(level) {
    sessionStorage.setItem('selectedLevel', level);
    window.location.href = 'quiz.html';
}
