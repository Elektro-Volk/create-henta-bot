const Sequelize = require('sequelize');

class NicknamesPlugin {
    init(henta) {
        henta.getPlugin('common/users').addModelField('nickName', { type: Sequelize.STRING, allowNull: false, defaultValue: '' });
        henta.hookManager.add("users_new", obj => obj['nickName'] = obj['firstName']);

        henta.hookManager.add("bot_answer", ctx => {
            const sendNameConfig = ctx.getConfigValue('send_name');
            if ((ctx.sendName != false && sendNameConfig) || ctx.sendName && ctx.response.message != '')
                ctx.response.message = `${ctx.user.nickName}, ${ctx.response.message}`;
        });
    }
}

module.exports = NicknamesPlugin;
