const chalk = require('chalk');
const Sequelize = require('sequelize');
const { MsgParams } = require("./msgParams");

class UsersPlugin {
    constructor(henta) {
        this.henta = henta;
        this.userModel = { vkId: Sequelize.INTEGER, firstName: Sequelize.STRING, lastName: Sequelize.STRING };
        this.prototype = {};
        this.cache = {};
    }

    init(henta) {
        this.addMethod('getFullName', (self) => `${self.firstName} ${self.lastName}`);
        this.addMethod('getUrl', (self) => `vk.com/id${self.vkId}`);
        this.addMethod('send', (self, data) => {
            henta.vk.api.messages.send(henta.getPlugin('common/msgParams').create(data).build(self.vkId));
        });
    }

    async start(henta) {
        const dbPlugin = henta.getPlugin('common/db');
        this.User = dbPlugin.define('user', this.userModel, { timestamps: false });
        await dbPlugin.safeSync(this.User);
    }

    async findByVkid(vkId) {
        return await this.User.findOne({ where: {vkId} });
    }

    async getByVkid(vkId) {
        let user = this.cache[vkId] || await this.findByVkid(vkId);

        if (user == undefined) {
            const vkUser = await this.henta.vk.api.users.get({ user_ids: vkId });

            // Create user
            user = new this.User({ vkId, firstName: vkUser[0].first_name, lastName: vkUser[0].last_name });
            await this.henta.hookManager.runOut("users_new", user);
            this.henta.log(`Новый пользователь: ${user.firstName} ${user.lastName} (id${user.vkId})`);
        }

        Object.assign(Object.getPrototypeOf(user), this.prototype);

        this.cache[vkId] = user;
        return user;
    }

    addMethod(methodName, func) {
        this.prototype[methodName] = function(...args) { return func(this, ...args) };
    }

    addModelField(fieldName, data) {
        if (this.userModel[fieldName])
            throw new Error(`Поле "${chalk.white(fieldName)}" уже занято`);

        this.userModel[fieldName] = data;
    }
}

module.exports = UsersPlugin;
