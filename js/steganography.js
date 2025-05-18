class Steganography {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const hideMessageBtn = document.getElementById('hide-message-btn');
        const extractMessageBtn = document.getElementById('extract-message-btn');

        hideMessageBtn.addEventListener('click', () => this.hideMessage());
        extractMessageBtn.addEventListener('click', () => this.extractMessage());
    }

    hideMessage() {
        if (!bmpProcessor.currentFile) {
            alert('Спочатку виберіть BMP файл!');
            return;
        }

        const message = document.getElementById('message').value;
        if (!message) {
            alert('Введіть повідомлення для приховування!');
            return;
        }

        const imageData = bmpProcessor.resultCtx.getImageData(
            0, 0, 
            bmpProcessor.resultCanvas.width, 
            bmpProcessor.resultCanvas.height
        );
        const data = imageData.data;

        // Конвертуємо повідомлення в бінарний формат
        const binaryMessage = this.textToBinary(message + '\0'); // '\0' як маркер кінця повідомлення
        let binaryIndex = 0;

        // Перевіряємо, чи вистачає місця для повідомлення
        if (binaryMessage.length > data.length / 4) {
            alert('Повідомлення занадто довге для цього зображення!');
            return;
        }

        // Вбудовуємо кожен біт повідомлення в молодший біт кожного байту кольору
        for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
            // Модифікуємо тільки синій канал для мінімальної помітності
            data[i + 2] = (data[i + 2] & 0xFE) | parseInt(binaryMessage[binaryIndex]);
            binaryIndex++;
        }

        bmpProcessor.resultCtx.putImageData(imageData, 0, 0);
        auth.updateUserHistory('messageHidden', message);
        this.updateRecentMessages();
    }

    extractMessage() {
        if (!bmpProcessor.currentFile) {
            alert('Спочатку виберіть BMP файл!');
            return;
        }

        const imageData = bmpProcessor.resultCtx.getImageData(
            0, 0, 
            bmpProcessor.resultCanvas.width, 
            bmpProcessor.resultCanvas.height
        );
        const data = imageData.data;
        let binaryMessage = '';

        // Витягуємо молодші біти з синього каналу
        for (let i = 0; i < data.length; i += 4) {
            binaryMessage += (data[i + 2] & 0x01).toString();
        }

        // Конвертуємо бінарні дані назад у текст
        const message = this.binaryToText(binaryMessage);
        
        // Шукаємо маркер кінця повідомлення
        const endIndex = message.indexOf('\0');
        if (endIndex !== -1) {
            const extractedMessage = message.substring(0, endIndex);
            document.getElementById('message').value = extractedMessage;
            auth.updateUserHistory('messageExtracted', extractedMessage);
            this.updateRecentMessages();
        } else {
            alert('Повідомлення не знайдено!');
        }
    }

    textToBinary(text) {
        let binary = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            binary += charCode.toString(2).padStart(8, '0');
        }
        return binary;
    }

    binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            if (byte.length < 8) break;
            text += String.fromCharCode(parseInt(byte, 2));
        }
        return text;
    }

    updateRecentMessages() {
        const recentMessages = document.getElementById('recent-messages');
        if (!auth.currentUser) return;

        recentMessages.innerHTML = '<h4>Останні повідомлення:</h4>' +
            auth.currentUser.recentMessages.map(msg => 
                `<div>${msg}</div>`
            ).join('');
    }
}

const steganography = new Steganography(); 