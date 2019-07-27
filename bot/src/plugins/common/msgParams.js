class MsgParamsClass {
    constructor(msg, ctx) {
        if (typeof msg == "string")
            Object.assign(this, { message: msg });
        else
            Object.assign(this, Array.isArray(msg) ? { message: msg.join('\n') } : msg);

        this.message = this.message || '';
        if (Array.isArray(this.message)) this.message = this.message.join('\n');
    };

    addLine(text) {
        this.message = this.message != '' ? `${this.message}\n${text}` : text;
    }

    addLines(lines) {
        lines.map(item => this.addLine(item));
    }

    build(peerId) {
        this.peer_id = peerId;
        return this
    }
}

class MsgParamsPlugin {
    constructor(henta) {

    }

    create(data, ctx) {
        if (data instanceof MsgParamsClass)
            return data;

        return new MsgParamsClass(data, ctx);
    }
}

module.exports = MsgParamsPlugin;
