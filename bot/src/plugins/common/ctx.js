class CtxPlugin {
    constructor(henta) {
        this.henta = henta;
        this.ctxPrototype = { };
    }

    init(henta) {
        const msgParamsPlugin = henta.getPlugin('common/msgParams');

        this.addData('henta', henta);
        this.addData('vk', henta.vk);
        this.addMethod('getPlugin', (self, pluginName) => henta.getPlugin(pluginName));
        this.addMethod('getConfigValue', (self, field) => henta.getConfigValue(field));
        this.addMethod('getConfigPrivateValue', (self, field) => henta.getConfigPrivateValue(field));
        this.addMethod('keyboard', (self) => henta.vk.Keyboard.builder());
        this.addMethod('send', (self, data) => {
            return henta.vk.api.messages.send(msgParamsPlugin.create(data).build(self.msg.peer_id));
        });
    }

    addMethod(field, method) {
        this.addData(field, function(...args) { return method(this, ...args) });
    }

    addData(field, data) {
        this.ctxPrototype[field] = data;
    }

    create(msg) {
        const ctx = { msg };
        Object.setPrototypeOf(ctx, this.ctxPrototype);
        return ctx;
    }
}

module.exports = CtxPlugin;
