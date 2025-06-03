const express = require('express');
const cors = require('cors');
const path = require('path');
const dbOperations = require('./js/database.server.js');

const app = express();
const port = 3000;

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configuração do CORS - DEVE VIR ANTES DAS ROTAS
app.use(cors());
app.use(express.json());

// Rotas da API - DEVEM VIR ANTES DO STATIC
const apiRouter = express.Router();

apiRouter.get('/questions/:subject/:level', async (req, res) => {
    try {
        const { subject, level } = req.params;
        console.log('Gerando questões para:', { subject, level });

        // Importar a função generateQuestions do Gemini
        const { generateQuestions } = require('./js/gemini.js');
        
        // Gerar questões usando o Gemini
        const questions = await generateQuestions(subject, level);
        
        console.log('Enviando questões:', questions.length);
        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        console.error('Erro ao gerar questões:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

apiRouter.post('/register', async (req, res) => {
    try {
        const userId = await dbOperations.registerUser(req.body);
        res.json({ success: true, userId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbOperations.loginUser(email, password);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/progress', async (req, res) => {
    try {
        const { userId, subject, level, score } = req.body;
        const progressId = await dbOperations.saveProgress(userId, subject, level, score);
        res.json({ success: true, progressId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/progress/:userId', async (req, res) => {
    try {
        const progress = await dbOperations.getProgress(req.params.userId);
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Montar as rotas da API com prefixo /api
app.use('/api', apiRouter);

// Servir arquivos estáticos - DEVE VIR DEPOIS DAS ROTAS DA API
app.use(express.static(__dirname));

// Rota padrão para servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('\nRotas disponíveis:');
    console.log('- GET  /api/questions/:subject/:level');
    console.log('- POST /api/register');
    console.log('- POST /api/login');
    console.log('- POST /api/progress');
    console.log('- GET  /api/progress/:userId');
});
