class PhoneCommand {
    constructor(henta) {
        this.name = "телефон";
        this.aliases = [ 'мобильник', 'фага' ];
        this.description = "телефон с поиском";
        this.type = "main";
        this.subcommands = {
            ['поиск']: { handler: this.searchHandler.bind(this), arguments: { q: { name: "текст", type: "string" } } },
            ['поезд']: { handler: this.trainHandler.bind(this) },
            ['шипка']: { handler: this.throwErrorHandler.bind(this) }
        };
        this.emoji = '📱';

        this.words = [
            'бяки', 'макаки', 'машинки', 'картинки', 'иринки', 'мандаринки', 'макс'
        ]
    }

    trainHandler(ctx) {
        ctx.answer(`🚂🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃`);
    }

    throwErrorHandler(ctx) {
        ctx.etogotutnet(`HA-HA-HA`);
    }

    searchHandler(ctx) {
        console.log(ctx.params.q)
        ctx.answer([
            `📱 Вы нашли: ${this.words.filter(i => i.includes(ctx.params.q)).join(', ')}`,
            `\nПопробуйте 'телефон поезд' :)`
        ], { sendName: false });
    }

    handler(ctx) {
        ctx.answer([
            `📱 У вас в телефоне есть: ${this.words.join(', ')}`,
            `\nПопробуйте 'телефон поиск <текст>' :)`
        ], { sendName: false });
    }
}

module.exports = PhoneCommand;
