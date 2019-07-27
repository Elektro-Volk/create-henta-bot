class HelpCommand {
    constructor(henta) {
        this.henta = henta;
        this.name = "помощь";
        this.aliases = [ 'команды', 'хелп' ];
        this.description = "список команд";
        this.type = "other";
        this.emoji = '❔';
    }

    handler(ctx) {
        const categories = {
            main: { title: "📓 Основные:" },
            other: { title: "🗂 Прочие:" }
        };

        const printCategory = (catName) => {
            const commands = Object.values(ctx.getPlugin('common/botcmd').commands).filter(i => i.type === catName);
            const printCommand = (cmd) => {
                const args = cmd.arguments ? Object.values(cmd.arguments) : null;
                const useText = args ? args.map(v => v.optional ? "["+v.name+"]" : "<"+v.name+">").join(' ') : '';
                return `⠀⠀${cmd.emoji || '🔵'} ${cmd.name} ${useText} - ${cmd.description}`;
            };

            return `${categories[catName].title}\n${commands.map(i => printCommand(i)).join('\n')}`
        };

        ctx.answer([
            "список команд бота:",
            `${Object.keys(categories).map(i => printCategory(i)).join('\n')}`
        ]);
    }
}

module.exports = HelpCommand;
