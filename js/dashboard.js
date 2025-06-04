// Carregar progresso do usuário ao entrar no dashboard
document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    updateUserInfo();

    if (user) {
        try {
            const progress = await dbOperations.getProgress(user.id);
            updateChallengeCards(progress);
        } catch (error) {
            console.error('Erro ao carregar progresso:', error);
        }
    }
});

// Atualizar cards de desafio com base no progresso
function updateChallengeCards(progress) {
    const subjects = ['matematica', 'portugues', 'ciencias', 'historia', 'geografia'];
    const levels = ['beginner', 'intermediate', 'advanced'];

    subjects.forEach(subject => {
        const subjectProgress = progress.filter(p => p.subject === subject);
        
        levels.forEach((level, index) => {
            const button = document.querySelector(`#${level}Card button`);
            if (index === 0 || (subjectProgress.some(p => p.level === levels[index - 1] && p.score >= 7))) {
                button.disabled = false;
            }
        });
    });
}

// Selecionar matéria
function selectSubject(subject) {
    sessionStorage.setItem('selectedSubject', subject);
    window.location.href = 'select-level.html';
}
