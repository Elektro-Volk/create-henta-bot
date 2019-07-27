class TestCommand {
    constructor(henta) {
        this.henta = henta;
        this.name = "тест";
        this.description = "быстрая проверка бота";
        this.type = "other";
        this.emoji = '✅';
    }

    handler(ctx) {
        ctx.answer("бот работает.");
    }
}

module.exports = TestCommand;
