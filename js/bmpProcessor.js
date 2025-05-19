class BmpProcessor {
    constructor() {
        this.sourceCanvas = document.getElementById('source-canvas');
        this.resultCanvas = document.getElementById('result-canvas');
        this.sourceCtx = this.sourceCanvas.getContext('2d');
        this.resultCtx = this.resultCanvas.getContext('2d');
        this.currentFile = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('file-input');
        const openFileBtn = document.getElementById('open-file-btn');
        const generateBtn = document.getElementById('generate-btn');
        const saveBtn = document.getElementById('save-btn');

        openFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        generateBtn.addEventListener('click', () => this.generatePattern());
        saveBtn.addEventListener('click', () => this.saveBMP());
    }

    async updateHistory() {
        try {
            const response = await fetch('/Home/PartialHistory', {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/html',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Отримуємо HTML-контент із відповіді
            const html = await response.text();

            // Вставляємо отриманий контент в #history-panel
            const historyPanel = document.getElementById('history-panel');
            historyPanel.innerHTML = html;
        } catch (error) {
            console.error('Error while updating history:', error);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Перевірка розміру файлу (максимум 10 МБ)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
        if (file.size > MAX_FILE_SIZE) {
            alert('Файл завеликий. Максимальний розмір: 10 МБ');
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.bmp')) {
            alert('Будь ласка, виберіть BMP файл!');
            return;
        }

        this.currentFile = file;
        const reader = new FileReader();
        
        // Додаємо відстеження прогресу
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                console.log(`Завантаження: ${progress}%`);
            }
        };
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.sourceCanvas.width = img.width;
                this.sourceCanvas.height = img.height;
                this.resultCanvas.width = img.width;
                this.resultCanvas.height = img.height;
                
                this.sourceCtx.drawImage(img, 0, 0);
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    generatePattern() {
        if (!this.currentFile) {
            alert('Спочатку виберіть BMP файл!');
            return;
        }

        const pattern = document.getElementById('pattern-select').value;
        const colorScheme = document.getElementById('color-scheme').value;

        const width = this.sourceCanvas.width;
        const height = this.sourceCanvas.height;
        const imageData = this.resultCtx.createImageData(width, height);

        switch (pattern) {
            case 'spiral':
                this.generateSpiralPattern(imageData, width, height, colorScheme);
                break;
            case 'wave':
                this.generateWavePattern(imageData, width, height, colorScheme);
                break;
            case 'mosaic':
                this.generateMosaicPattern(imageData, width, height, colorScheme);
                break;
        }

        this.resultCtx.putImageData(imageData, 0, 0);

        // Отримуємо зображення з source-canvas
        const originalCanvas = document.getElementById('source-canvas');
        const originalImageDataUrl = originalCanvas.toDataURL('image/png');

        // Зберігаємо параметри на сервер
        this.saveSettingsToServer(pattern, colorScheme, originalImageDataUrl);
    }

    saveSettingsToServer(pattern, colorScheme, originalImage) {
        // Передаємо дані в форматі Base64
        const imgDataUrl = this.resultCanvas.toDataURL('image/png');
        const secretMessage = document.getElementById('message').value;

        // Отримуємо поточний час з урахуванням часового поясу
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000; // конвертуємо хвилини в мілісекунди
        const localTime = new Date(now.getTime() - timezoneOffset);

        fetch('/Home/SaveSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lastBitMapAlgoritm: pattern,
                lastColorScheme: colorScheme,
                lastUpdateTime: localTime.toISOString(),
                secretMassege: secretMessage,
                originalImage: originalImage, // Передаємо оригінальне зображення (Base64)
                outPutImage: imgDataUrl,     // Передаємо результат (Base64)
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Не вдалося зберегти параметри.");
            }
            console.log("Параметри збережено успішно.");

            this.updateHistory();
        }).catch(error => {
            console.error("Помилка при збереженні параметрів:", error);
        });
    }

    generateSpiralPattern(imageData, width, height, colorScheme) {
        const centerX = width / 2;
        const centerY = height / 2;
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const spiral = (distance + angle * 10) % 50;
                const colors = this.getColorScheme(colorScheme, spiral / 50);

                data[index] = colors.r;     // R
                data[index + 1] = colors.g; // G
                data[index + 2] = colors.b; // B
                data[index + 3] = 255;      // A
            }
        }
    }

    generateWavePattern(imageData, width, height, colorScheme) {
        const data = imageData.data;
        const frequency = 0.05;
        const amplitude = 30;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const wave = Math.sin(x * frequency) * amplitude + 
                           Math.cos(y * frequency) * amplitude;
                const normalized = (wave + amplitude) / (amplitude * 2);
                
                const colors = this.getColorScheme(colorScheme, normalized);

                data[index] = colors.r;
                data[index + 1] = colors.g;
                data[index + 2] = colors.b;
                data[index + 3] = 255;
            }
        }
    }

    generateMosaicPattern(imageData, width, height, colorScheme) {
        const data = imageData.data;
        const tileSize = 20;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const tileX = Math.floor(x / tileSize);
                const tileY = Math.floor(y / tileSize);
                const normalized = ((tileX + tileY) % 2) / 1;
                
                const colors = this.getColorScheme(colorScheme, normalized);

                data[index] = colors.r;
                data[index + 1] = colors.g;
                data[index + 2] = colors.b;
                data[index + 3] = 255;
            }
        }
    }

    getColorScheme(scheme, value) {
        switch (scheme) {
            case 'scheme1': // Синьо-жовтий
                return {
                    r: Math.round(255 * value),
                    g: Math.round(255 * value),
                    b: Math.round(255 * (1 - value))
                };
            case 'scheme2': // Зелено-фіолетовий
                return {
                    r: Math.round(255 * (1 - value)),
                    g: Math.round(255 * value),
                    b: Math.round(255 * value)
                };
            case 'scheme3': // Червоно-синій
                return {
                    r: Math.round(255 * value),
                    g: 0,
                    b: Math.round(255 * (1 - value))
                };
        }
    }

    saveBMP() {
        if (!this.resultCanvas.width || !this.resultCanvas.height) {
            alert('Спочатку створіть зображення!');
            return;
        }

        try {
            // Створюємо унікальне ім'я файлу
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
            const filename = `result_${timestamp}.bmp`;

            // Створюємо та налаштовуємо посилання для завантаження
            const link = document.createElement('a');
            link.download = filename;
            link.href = this.resultCanvas.toDataURL('image/bmp');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            alert('Помилка при збереженні файлу: ' + error.message);
        }
    }
}

const bmpProcessor = new BmpProcessor(); 


document.addEventListener('DOMContentLoaded', () => {
    bmpProcessor.updateHistory(); // Викликаємо метод з екземпляра
});
