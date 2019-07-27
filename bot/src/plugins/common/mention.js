class MentionPlugin {
    constructor(henta) {
        this.mentions = henta.getConfigValue('mentions');
        this.groupId = henta.getConfigValue('vk_groupid');

        this.regexp = new RegExp(`\\[club${this.groupId}\\|.+]`, 'g');
    }

    init(henta) {
        henta.log(`К вашему боту можно будет обращаться через: ${this.mentions}`);
        henta.hookManager.add("bot_check", this.checkMessage.bind(this));
    }

    checkMessage(ctx) {
        const body = ctx.msg.text ? ctx.msg.text.toLowerCase() : '';

        if (ctx.msg.text) {
            for (let i in this.mentions) {
                if (!body.startsWith(this.mentions[i])) continue;

                ctx.msg.text = ctx.msg.text.substring(this.mentions[i].length);
                this.clear(ctx.msg);
                return true;
            }
        }

        if (ctx.msg.peer_id < 2000000000
                || body.match(this.regexp)
                || (ctx.msg.fwd_messages[0] && ctx.msg.fwd_messages[0].from_id == -this.groupId)
                || (ctx.msg.reply_message && ctx.msg.reply_message.from_id == -this.groupId)) {
            this.clear(ctx.msg);
            return true;
        }

        return false;
    }

    clear(msg) {
        if (!msg.text) return;

        msg.text = msg.text.replace(this.regexp, '');
        while (msg.text.startsWith(' ') || msg.text.startsWith(','))
        	msg.text = msg.text.substring(1);
    }
}

module.exports = MentionPlugin;
