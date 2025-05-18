class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || {};
        this.currentUser = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        // Обробка кнопки входу
        loginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                alert('Введіть логін та пароль');
                return;
            }

            if (!this.users[username]) {
                // Новий користувач
                this.users[username] = {
                    password: password,
                    recentFiles: [],
                    recentPatterns: [],
                    recentMessages: []
                };
                this.saveUsers();
            } else if (this.users[username].password !== password) {
                alert('Невірний пароль');
                return;
            }

            this.currentUser = {
                username: username,
                recentFiles: this.users[username].recentFiles,
                recentPatterns: this.users[username].recentPatterns,
                recentMessages: this.users[username].recentMessages
            };

            // Оновлюємо UI
            document.getElementById('user-name').textContent = username;
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('auth-section').classList.remove('auth-centered');
            document.getElementById('main-section').classList.remove('hidden');

            // Очищаємо поля
            usernameInput.value = '';
            passwordInput.value = '';
        });

        // Обробка кнопки виходу
        logoutBtn.addEventListener('click', () => this.logout());

        // Обробка Enter в полі пароля
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    logout() {
        this.currentUser = null;
        
        // Оновлюємо UI
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('auth-section').classList.add('auth-centered');
        document.getElementById('main-section').classList.add('hidden');
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    updateUserHistory(type, item) {
        if (!this.currentUser) return;

        const username = this.currentUser.username;
        let list;

        switch (type) {
            case 'file':
                list = this.users[username].recentFiles;
                this.currentUser.recentFiles = list;
                break;
            case 'pattern':
                list = this.users[username].recentPatterns;
                this.currentUser.recentPatterns = list;
                break;
            case 'messageHidden':
            case 'messageExtracted':
                list = this.users[username].recentMessages;
                this.currentUser.recentMessages = list;
                break;
        }

        if (list) {
            // Додаємо новий елемент на початок списку
            list.unshift(item);
            // Обмежуємо список 5 останніми елементами
            if (list.length > 5) {
                list.pop();
            }
            this.saveUsers();
        }
    }
}

const auth = new Auth(); 