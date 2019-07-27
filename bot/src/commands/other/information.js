class InformationCommand {
    constructor(henta) {
        this.henta = henta;
        this.name = "информация";
        this.description = "информация о проекте";
        this.type = "other";
        this.emoji = '📜';
    }

    handler(ctx) {
        ctx.answer([
            "💎 Тестовый бот:",
            `⚙ Работает на [hentavk|HENTA] ${ctx.henta.version}.`,
            `❔ По вопросам: hentajs.ru`,
            `👤 Разработал [theevolk|TheEVolk].`,
        ]);
    }
}

module.exports = InformationCommand;
