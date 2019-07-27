const fs = require("fs");
const chalk = require('chalk');

class BotcmdPlugin {
	constructor(henta) {
		this.henta = henta;
		this.commands = [];
		this.failed = [];
		this.argTypes = {};
		this.aliases = {};
	}

	init(henta) {
		this.addArgumentType('integer', data => parseInt(data.arg));
		this.addArgumentType('positive_integer', data => {
			const value = parseInt(data.arg);
			data.ctx.assert(value > 0, data.message || "число должно быть позитивным");
			return value;
		});

		this.addArgumentType('negative_integer', data => {
			const value = parseInt(data.arg);
			data.ctx.assert(value < 0, data.message || "число должно быть негативным");
			return value;
		});

		this.addArgumentType('string', data => {
			const words = data.ctx.msg.text.split(' ');
			words.splice(0, data.index + 1);
			return words.join(' ');
		});

		henta.getPlugin('common/bot').addHandler(this.handler.bind(this));
	}

	start(henta) {
	    this.loadCommands(`${henta.botdir}/src/commands`);
	    this.henta.log(`Загружено ${Object.keys(this.commands).length} команд.`);
		if (this.failed.length > 0)
			this.henta.warning(`Не загрузились: ${this.failed}.`);
	}

	loadCommands(dir) {
		const paths = fs.readdirSync(dir);
		for (const path of paths) {
			if (fs.lstatSync(`${dir}/${path}`).isDirectory()) {
				this.loadCommands(`${dir}/${path}`);
				continue;
			}

			try {
				const commandClass = require(`${dir}/${path}`);
				const commandInstance = new commandClass(this.henta);
				this.commands[commandInstance.name] = commandInstance;
				if (commandInstance.aliases)
					commandInstance.aliases.forEach(i => this.aliases[i] = commandInstance);
			}
			catch(e) {
				this.henta.error(`Ошибка в команде ${chalk.white(path)}:\n${e.stack}`);
				this.failed.push(path);
			}
		}
	}

	async handler(ctx, next) {
		if (!ctx.msg.text || (ctx.msg.text == '' && !ctx.msg.payload.botcmd) || ctx.answered)
		    return await next();

		const text = ctx.msg.payload && ctx.msg.payload.botcmd ? ctx.msg.payload.botcmd : ctx.msg.text;
		const args = text.split(" ");
		const cmd = this.commands[args[0].toLowerCase()] || this.aliases[args[0].toLowerCase()];

		if (!cmd) return await next();

		// Фу, говнокод и копипаста
		const cmdSettings = { argsOffset: 0, handler: cmd.handler.bind(cmd), arguments: cmd.arguments, name: cmd.name };
		if (args[1] && cmd.subcommands && cmd.subcommands[args[1].toLowerCase()]) {
			const scmd = cmd.subcommands[args[1].toLowerCase()];
			cmdSettings.argsOffset = 1;
			cmdSettings.handler = scmd.handler.bind(cmd);
			cmdSettings.arguments = scmd.arguments;
			cmdSettings.name += ` ${args[1].toLowerCase()}`;
		}

		ctx.args = args;
		ctx.params = await this.parseParams(ctx, cmdSettings.argsOffset, cmdSettings.arguments, cmdSettings.name);
		await cmdSettings.handler(ctx);

		await next();
	}

	useError(ctx, args, cmdName) {
		const useText = args.map(v => v.optional ? "["+v.name+"]" : "<"+v.name+">").join(' ');
		ctx.error([ "📟 Вы неправильно ввели команду.", `➤ ${cmdName} ${useText}` ]);
	}

	//================== Argument parser ================\\
	addArgumentType(typeName, data) {
		if (this.argTypes[typeName]) throw `$typeName уже существует.`;
		this.argTypes[typeName] = data;
	}

	async parseParams(ctx, cmdArgsOffset, args, cmdName) {
		if (!args) return {};

		const argumentsKeys = Object.keys(args);
		const argumentsValues = Object.values(args);

		if (argumentsValues.filter(p => !p.optional).length > ctx.args.length - 1 - cmdArgsOffset)
			this.useError(ctx, argumentsValues, cmdName);

		const params = {};
		for (let i = 0; i < ctx.args.length - cmdArgsOffset - 1; i++) {
			if(!argumentsValues[i]) break;

			const result = this.argTypes[argumentsValues[i].type]({ ctx, index: i + cmdArgsOffset, arg: ctx.args[i + cmdArgsOffset + 1] });
			if (!result) this.useError(ctx, argumentsValues, cmdName);
			params[argumentsKeys[i]] = result;
		}

		return params;
	}
}

module.exports = BotcmdPlugin;
