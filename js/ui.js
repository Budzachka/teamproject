class UI {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const helpBtn = document.getElementById('help-btn');
        const aboutBtn = document.getElementById('about-btn');
        const exitBtn = document.getElementById('exit-btn');
        const closeModalBtn = document.querySelector('.close');

        helpBtn.addEventListener('click', () => this.showHelp());
        aboutBtn.addEventListener('click', () => this.showAbout());
        exitBtn.addEventListener('click', () => this.exit());
        closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    showModal(content) {
        try {
            const modal = document.getElementById('modal');
            const modalText = document.getElementById('modal-text');
            if (!modal || !modalText) {
                throw new Error('Модальне вікно не знайдено');
            }
            modalText.innerHTML = content;
            modal.classList.remove('hidden');

            // Додаємо обробку клавіші Escape
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            // Додаємо обробку кліку поза модальним вікном
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        } catch (error) {
            console.error('Помилка відображення модального вікна:', error);
        }
    }

    closeModal() {
        try {
            const modal = document.getElementById('modal');
            if (!modal) {
                throw new Error('Модальне вікно не знайдено');
            }
            modal.classList.add('hidden');
        } catch (error) {
            console.error('Помилка закриття модального вікна:', error);
        }
    }

    exit() {
        if (confirm('Ви дійсно бажаєте вийти?')) {
            auth.logout();
        }
    }

    showAbout() {
        const content = `
            <h2>Про програму</h2>
            <p>BMP Редактор - це веб-додаток для роботи з BMP зображеннями, який дозволяє:</p>
            <ul>
                <li>Створювати нові BMP зображення на основі існуючих</li>
                <li>Застосовувати різні візерунки та кольорові схеми</li>
                <li>Приховувати та витягувати текстові повідомлення з зображень</li>
                <li>Зберігати історію роботи для кожного користувача</li>
            </ul>
            <p>Версія: 1.0.0</p>
        `;
        this.showModal(content);
    }

    showHelp() {
        const content = `
            <h2>Інструкція користувача</h2>
            <h3>Робота з зображеннями:</h3>
            <ol>
                <li>Увійдіть в систему або зареєструйтесь</li>
                <li>Натисніть "Відкрити BMP файл" та виберіть файл формату .bmp</li>
                <li>Виберіть тип візерунку та кольорову схему</li>
                <li>Натисніть "Створити" для створення нового зображення</li>
                <li>Збережіть результат кнопкою "Зберегти"</li>
            </ol>
            <h3>Приховування повідомлень:</h3>
            <ol>
                <li>Відкрийте BMP файл</li>
                <li>Введіть повідомлення в текстове поле</li>
                <li>Натисніть "Приховати"</li>
                <li>Збережіть результат</li>
            </ol>
            <h3>Витягування повідомлень:</h3>
            <ol>
                <li>Відкрийте BMP файл з прихованим повідомленням</li>
                <li>Натисніть "Витягти"</li>
                <li>Повідомлення з'явиться в текстовому полі</li>
            </ol>
        `;
        this.showModal(content);
    }
}

const ui = new UI(); 