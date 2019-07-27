#!/usr/bin/env node
const menu = require('console-menu');
const readline = require('readline');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const Sequelize = require('sequelize');
const { VK } = require('vk-io');

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const doCommand = async (command, errMessage) => {
    const err = await new Promise((resolve, reject) => exec(command, resolve));
    if (err) {
        console.error(`😳  ${errMessage}:\n${err}`);
        process.exit(1);
    }
}

const gitIgnore = [
    '# Logs', 'logs', '*.log', 'npm-debug.log*', '*.lock',
    '# Dependency directories', 'package-lock.json', '/node_modules',
    '# Optional npm cache directory', '.npm', '.vscode', '.idea'
];

const deps = [ 'henta', 'middleware-io', 'sequelize' ];

const botDir = path.resolve(process.argv[2]);
console.log(botDir)

async function dquestion(str, def) {
    const response = await question(`${str} [${def}]: `);
    return response == '' ? def : response;
}

function question(str) {
    return new Promise(resolve => rl.question(str, resolve));
}

async function questionYN(str) {
    return await question(`${str}? [y/n] `) === 'y';
}

async function createVkBot() {
    console.log('🤖 Создаю бота ВКонтакте на HENTA...');
    await doCommand(`mkdir ${botDir} && cd ${botDir} && npm init -f`, "Ошибка инициализации");
    await fs.writeFileSync(`${botDir}/.gitignore`, gitIgnore.join('\n'), { encoding: 'utf-8' });
    console.log('📥  Устанавливаю зависимости..');
    await doCommand(`cd ${botDir} && npm install --save ${deps.join(' ')}`, "Ошибка npm");
    console.log('💾  Копирую исходный код для вашего бота..');
    await fs.copy(path.join(__dirname, '../bot'), `${botDir}`);
}

async function configBot() {
    const bd = await menu([
        { hotkey: '1', title: 'Postgresql (рекомендуется)', cmd: 'pg pg-hstore', dialect: 'postgres' },
        { hotkey: '2', title: 'Mysql', cmd: 'mysql2', dialect: 'mysql' },
        { hotkey: '3', title: 'MariaDB', cmd: 'mariadb', dialect: 'mariadb' },
        { hotkey: '4', title: 'Microsoft SQL Server', cmd: 'tedious', dialect: 'mssql' }
    ], { header: '📚  Какую базу данных использовать?' });

    if (!bd) return;

    await doCommand(`cd ${botDir} && npm install --save ${bd.cmd}`, "Ошибка npm");

    rl.close();
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (!rl.stdoutMuted) rl.output.write(stringToWrite);
    };

    const host = await dquestion("🖥  Введите адрес сервера с БД", 'localhost');
    const db = await dquestion("🗃 Введите имя базы данных (она должна быть создана)", 'db_hentabot');
    const login = await question("🙂  Введите логин: ");
    console.log("🔐  Введите пароль: ");
    rl.stdoutMuted = true;
    const password = await question("");
    rl.stdoutMuted = false;

    try {
        const sequelize = new Sequelize(db, login, password, { host: host, dialect: bd.dialect });
        await sequelize.authenticate();

        const privateConfigFile = require(`${botDir}/config_private.json`);
        privateConfigFile.database = {
            name: db,
            user: login,
            pass: password,
            options: {
                host: host,
                dialect: bd.dialect,
                logging: false,
                pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
                client_encoding: "UTF8",
                charset: "utf8mb4"
            }
        };

        fs.writeFileSync(`${botDir}/config_private.json`, JSON.stringify(privateConfigFile, null, '\t'));
        console.log('✔️ База данных успешно настроена.');
    }
    catch(e) {
        console.error(`😳  Произошла ошибка:\n${e.message}`);
        const r = await questionYN('🖋  Попробовать еще раз');
        if (r) configBot(); else process.exit(0);
    }

    configVK();
}

async function configVK() {
    console.log("⚙️  Получите токен сообщества с полным доступом и вставьте его сюда: ");
    rl.stdoutMuted = true;
    const token = await question("");
    rl.stdoutMuted = false;

    const vk = new VK({ token });

    let group = await question("🔗  Вставьте ссылку на это сообщество: ");
    if (group.includes('/')) group = group.split('/')[group.split('/').length - 1];

    try {
        const response = await vk.api.groups.getById({ group_id: group });
        await vk.api.groups.getLongPollServer({ group_id: response[0].id });

        const privateConfigFile = require(`${botDir}/config_private.json`);
        privateConfigFile.vk_token = token;
        fs.writeFileSync(`${botDir}/config_private.json`, JSON.stringify(privateConfigFile, null, '\t'));

        const configFile = require(`${botDir}/config.json`);
        configFile.vk_groupid = response[0].id;
        fs.writeFileSync(`${botDir}/config.json`, JSON.stringify(configFile, null, '\t'));
        console.log('✔️ VK API успешно подключен.');
    }
    catch(e) {
        console.error(`😳  Произошла ошибка:\n${e.message}`);
        const r = await questionYN('🖋  Попробовать еще раз');
        if (r) configVK(); else process.exit(0);
    }

    configMyProfile();
}

async function configMyProfile() {
    const myProfile = await question("👤  Вставьте ссылку на свой профиль: ");
    if (myProfile.includes('/')) myProfile = myProfile.split('/')[myProfile.split('/').length - 1];

    const privateConfigFile = require(`${botDir}/config_private.json`);
    const vk = new VK({ token: privateConfigFile.vk_token });

    try {
        const response = await vk.api.users.get({ user_ids: myProfile });

        const configFile = require(`${botDir}/config.json`);
        configFile.admin_id = response[0].id;
        fs.writeFileSync(`${botDir}/config.json`, JSON.stringify(configFile, null, '\t'));
        console.log('✔️ Ваш профиль успешно сохранён.');
    }
    catch(e) {
        console.error(`😳  Произошла ошибка:\n${e.message}`);
        const r = await questionYN('🖋  Попробовать еще раз');
        if (r) configMyProfile(); else process.exit(0);
    }

    console.log('🔨 Вы можете настроить бота более делально с помощью config.json и config_private.json');
    console.log('📲 Будем рады видеть вас на нашем форуме hentajs.ru');
    console.log('⚡️ Запустить бота можно командой: "node index.js"');
    process.exit(0);
}

createVkBot().then(() => questionYN('🔧  Давайте настроим бота').then(r => {if (r) configBot(); else process.exit(0) }));
