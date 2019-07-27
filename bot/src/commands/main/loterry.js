class LoterryCommand {
    constructor(henta) {
        this.name = "лотерея";
        this.aliases = [ 'лотка' ];
        this.description = "лотерея с числом";
        this.type = "main";
        this.arguments = {
            number: { name: "число", type: "positive_integer" }
        };
        this.emoji = '🔟';
    }

    handler(ctx) {
        ctx.assert(ctx.params.number <= 10, "число должно быть меньше нуля");
        const myNumber = Math.floor(Math.random() * 10);
        ctx.answer(`${myNumber == ctx.params.number ? '✅ Ты угадал!' : `Нет! Я загадал ${myNumber}.`}`, { sendName: false });
    }
}

module.exports = LoterryCommand;
