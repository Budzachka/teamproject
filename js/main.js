document.addEventListener('DOMContentLoaded', () => {
    // Перевіряємо наявність всіх необхідних елементів
    const requiredElements = [
        'login-form',
        'source-canvas',
        'result-canvas',
        'pattern-select',
        'color-scheme',
        'message',
        'recent-files',
        'recent-patterns',
        'recent-messages'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('Відсутні необхідні елементи:', missingElements);
        return;
    }

    // Показуємо форму входу при завантаженні
    document.getElementById('login-form').classList.remove('hidden');

    // Встановлюємо розміри canvas за замовчуванням
    const defaultSize = 400;
    bmpProcessor.sourceCanvas.width = defaultSize;
    bmpProcessor.sourceCanvas.height = defaultSize;
    bmpProcessor.resultCanvas.width = defaultSize;
    bmpProcessor.resultCanvas.height = defaultSize;

    // Очищаємо canvas
    bmpProcessor.sourceCtx.fillStyle = '#ffffff';
    bmpProcessor.sourceCtx.fillRect(0, 0, defaultSize, defaultSize);
    bmpProcessor.resultCtx.fillStyle = '#ffffff';
    bmpProcessor.resultCtx.fillRect(0, 0, defaultSize, defaultSize);
}); 