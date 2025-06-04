// Verificar se usuário está autenticado
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user && !window.location.href.includes('index.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'index.html';
    }
    return user ? JSON.parse(user) : null;
}

// Atualizar informações do usuário na interface
function updateUserInfo() {
    const userInfoElement = document.getElementById('userInfo');
    const user = checkAuth();
    if (userInfoElement && user) {
        userInfoElement.innerHTML = `
            <p>Olá, ${user.name}</p>
            <p>Escola: ${user.school} | Turma: ${user.class}</p>
        `;
    }
}

// API Operations
const dbOperations = {
    // Register new user
    registerUser: async (userData) => {
        try {
            const response = await fetch('https://back-end-plataforma-educacional.onrender.com/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.userId;
        } catch (error) {
            throw error;
        }
    },

    // Login user
    loginUser: async (email, password) => {
        try {
            const response = await fetch('https://back-end-plataforma-educacional.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.user;
        } catch (error) {
            throw error;
        }
    },

    // Save progress
    saveProgress: async (userId, subject, level, score) => {
        try {
            const response = await fetch('https://back-end-plataforma-educacional.onrender.com/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, subject, level, score })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.progressId;
        } catch (error) {
            throw error;
        }
    },

    // Get user progress
    getProgress: async (userId) => {
        try {
            const response = await fetch(`https://back-end-plataforma-educacional.onrender.com/api/progress/${userId}`);
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.progress;
        } catch (error) {
            throw error;
        }
    }
};

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const user = await dbOperations.loginUser(email, password);
        if (user) {
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            alert('Email ou senha inválidos');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login');
    }
});

// Register form handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        age: document.getElementById('registerAge').value,
        gender: document.getElementById('registerGender').value,
        school: document.getElementById('registerSchool').value,
        class: document.getElementById('registerClass').value,
        shift: document.getElementById('registerShift').value
    };

    try {
        const userId = await dbOperations.registerUser(userData);
        if (userId) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        alert('Erro ao realizar cadastro');
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}
