class GnomesayCommand {
    constructor(henta) {
        this.name = "гном";
        this.aliases = [ 'сказать' ];
        this.description = "гном сказал";
        this.type = "main";
        this.arguments = {
            text: { name: "текст", type: "string", optional: true }
        };
        this.emoji = '💭';
    }

    handler(ctx) {
        if (!ctx.params.text)
            return ctx.answer("🙎‍♂️ Гном ничего не сказал. Молчит, кот помойный..", { sendName: false })
        ctx.answer(`🗣 Гном сказал: "${ctx.params.text}"`, { sendName: false });
    }
}

module.exports = GnomesayCommand;
