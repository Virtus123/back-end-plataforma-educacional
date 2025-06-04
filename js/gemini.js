// Using fetch instead of the Google Generative AI library
const API_KEY = 'AIzaSyDW5pE-R2ekGZodhsHvMBaYeXsg-2oebmE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Função para gerar perguntas usando o Gemini
async function generateQuestions(subject, level) {
    try {
        console.log('Iniciando geração de questões com Gemini API');

        // Traduzir nível para português para melhor contexto
        const nivelTraduzido = {
            'beginner': 'iniciante',
            'intermediate': 'intermediário',
            'advanced': 'avançado'
        }[level] || level;

        const prompt = `Você é um professor experiente criando questões de múltipla escolha.
        Gere exatamente 10 questões de ${subject} para alunos de nível ${nivelTraduzido}, primeiro ano do ensino médio. 
        As questões devem estar em português brasileiro e adequadas para estudantes deste nível.
        
        IMPORTANTE: Sua resposta deve ser SOMENTE um objeto JSON válido no formato abaixo, sem nenhum texto antes ou depois:

        {
            "questions": [
                {
                    "question": "A pergunta vai aqui?",
                    "options": [
                        "A) Primeira opção",
                        "B) Segunda opção",
                        "C) Terceira opção",
                        "D) Quarta opção"
                    ],
                    "correct_answer": "A",
                    "explanation": "Explicação curta de por que esta é a resposta correta"
                }
            ]
        }`;

        console.log('Enviando prompt para Gemini API');
        
        // Configuração do payload para o modelo gemini-2.0-flash
        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };
        
        console.log('Payload sendo enviado:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta da API:', errorText);
            throw new Error(`API Error: ${errorText}`);
        }

        const data = await response.json();
        console.log('Resposta completa da Gemini API:', JSON.stringify(data, null, 2));

        // Verifica se temos uma resposta válida
        if (!data.candidates || !data.candidates[0]) {
            console.error('Sem candidatos na resposta:', data);
            throw new Error('API não retornou respostas válidas');
        }

        // Extrai o texto da resposta
        const candidate = data.candidates[0];
        const text = candidate.content?.parts?.[0]?.text;

        if (!text) {
            console.error('Resposta não contém texto:', candidate);
            throw new Error('Resposta não contém texto');
        }

        // Log do texto recebido
        console.log('Texto bruto recebido da API:', text);

        // Tenta limpar o texto removendo qualquer coisa antes ou depois do JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Nenhum JSON válido encontrado no texto:', text);
            throw new Error('Nenhum JSON válido encontrado na resposta');
        }

        const cleanJson = jsonMatch[0];
        console.log('JSON extraído:', cleanJson);
        
        try {
            const questions = JSON.parse(cleanJson);
            if (!questions.questions || !Array.isArray(questions.questions)) {
                console.error('JSON não contém array de questões:', questions);
                throw new Error('Formato de resposta inválido da API Gemini');
            }
            console.log(`Questões geradas com sucesso: ${questions.questions.length}`);
            return questions.questions;
        } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', text);
            throw new Error('Formato de resposta inválido da API Gemini');
        }
    } catch (error) {
        console.error('Erro ao gerar questões:', error);
        throw error;
    }
}

module.exports = { generateQuestions };
