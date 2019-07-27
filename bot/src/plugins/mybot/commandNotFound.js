class CommandNotFoundPlugin {
    constructor(henta) {
        this.henta = henta;
    }

    init(henta) {
        henta.getPlugin('common/bot').addHandler(this.handler.bind(this));
    }

    async handler(ctx, next) {
        await next();
        if (ctx.answered) return;

        ctx.sendName = false;
    	ctx.answer({
            message: [
                "⌨ Похоже, команда не найдена.",
                "\nВведите 'помощь' для просмотра списка команд."
            ],

            keyboard: ctx.keyboard().oneTime(true).textButton({ label: '❔ Помощь', payload: { botcmd: 'помощь' } })
        });
    }
}

module.exports = CommandNotFoundPlugin;
