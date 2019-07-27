const { compose } = require('middleware-io');

class UserError {
    constructor(ctx, data) {
        this.msg = ctx.getPlugin('common/msgParams').create(data);
    }
}

class BotPlugin {
    constructor(henta) {
        this.henta = henta;
        this.botHandlers = [];

        henta.hookManager.add("vk_message_new", this.processMessage.bind(this));
        henta.hookManager.add("plugin_common/users_start_end", async () => {
            this.admin = await henta.getPlugin('common/users').getByVkid(henta.getConfigValue('admin_id'));
        });
    }

    init(henta) {
        const ctxPlugin = henta.getPlugin('common/ctx');

        ctxPlugin.addMethod('answer', this.answer.bind(this));
        ctxPlugin.addMethod('assert', this.assert.bind(this));
        ctxPlugin.addMethod('error', this.error.bind(this));
    }

    start(henta) {
        this.botHandlers.sort((a, b) => b.priority - a.priority);
        this.handlersMiddleware = compose(this.botHandlers.map(i => i.handler));
    }

    addHandler(handler, priority = 500) {
        if (this.handlersMiddleware)
            throw new Error("Вы не можете добавлять обработчики после запуска плагина.");

        this.botHandlers.push({ handler, priority });
    }

    async processMessage(msg) {
        if (msg.from_id < 0) return; // Ignore group messages
        msg.payload = msg.payload ? JSON.parse(msg.payload) : null;

        const ctx = this.henta.getPlugin('common/ctx').create(msg);

        try {
            if (!await this.henta.hookManager.run("bot_check", ctx)) return;
            if (this.henta.getConfigValue('log_new_message'))
                this.henta.log(`${ctx.msg.from_id}: ${ctx.msg.text || '-'}`);

            ctx.user = await ctx.getPlugin('common/users').getByVkid(ctx.msg.from_id);
            if (!await this.henta.hookManager.run("bot_pre", ctx)) return;
            await this.handlersMiddleware(ctx, (ctx) => {});
            if (!await this.henta.hookManager.run("bot_post", ctx)) return;
            ctx.user.save();
        }
        catch(e) {
            if (e instanceof UserError) {
                if (!await this.henta.hookManager.run("bot_user_error", ctx)) return;
                ctx.answer(e.msg);
            }
            else {
                this.henta.error(`${e.stack}`);
                this.admin.send([`⚠ ${ctx.user.getUrl()}: ${msg.text}`, `\n${e.stack}`]);
                if (ctx.getConfigValue('user_error'))
                    ctx.send(ctx.getConfigValue('user_error'));
            }
        }
    }

    async answer(ctx, data, options = {}) {
        ctx.response = ctx.getPlugin('common/msgParams').create(data);
        Object.assign(ctx, options);
        if (!await this.henta.hookManager.run("bot_answer", ctx)) return;
        ctx.answered = ctx.send(ctx.response);
    }

    error(ctx, data) {
        throw new UserError(ctx, data);
    }

    assert(ctx, condition, data) {
        return condition || this.error(ctx, data);
    }
}


module.exports = BotPlugin;
