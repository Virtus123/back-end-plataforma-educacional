// Exportação para PDF
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const progressContainer = document.getElementById('progressContainer');
            if (!progressContainer) return;
            const { jsPDF } = window.jspdf;
            exportBtn.disabled = true;
            exportBtn.textContent = 'Gerando PDF...';
            try {
                // Usa html2canvas para capturar a tabela
                const canvas = await html2canvas(progressContainer);
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'landscape' });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                // Ajusta a imagem para caber na página
                const imgProps = pdf.getImageProperties(imgData);
                let pdfWidth = pageWidth;
                let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                if (pdfHeight > pageHeight) {
                    pdfHeight = pageHeight;
                    pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
                }
                pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
                pdf.save('progresso_aluno.pdf');
            } catch (e) {
                alert('Erro ao exportar PDF.');
            }
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Exportar PDF';
        });
    }
});
// Exibe o progresso do aluno na tela de progresso

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    updateUserInfo();
    if (!user) return;

    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '<p>Carregando progresso...</p>';

    try {
        const progress = await dbOperations.getProgress(user.id);
        if (!progress || progress.length === 0) {
            progressContainer.innerHTML = '<p>Nenhum progresso registrado ainda.</p>';
            return;
        }

        let html = `<table class="progress-table">
            <thead>
                <tr>
                    <th>Matéria</th>
                    <th>Nível</th>
                    <th>Pontuação</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>`;
        for (const p of progress) {
            html += `<tr>
                <td>${capitalize(p.subject)}</td>
                <td>${traduzirNivel(p.level)}</td>
                <td>${p.score}</td>
                <td>${new Date(p.completed_at).toLocaleString('pt-BR')}</td>
            </tr>`;
        }
        html += '</tbody></table>';
        progressContainer.innerHTML = html;
    } catch (error) {
        progressContainer.innerHTML = '<p>Erro ao carregar progresso.</p>';
    }
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function traduzirNivel(level) {
    if (level === 'beginner') return 'Iniciante';
    if (level === 'intermediate') return 'Intermediário';
    if (level === 'advanced') return 'Avançado';
    return level;
}
