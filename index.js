const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client();
const parser  = require('discord-command-parser');

const lib = require('./lib');
const state = require('./state');
const command_definitions = require('./commands');

const { BOT_TOKEN, GUILD_ID, PREFIX, LOG_MSGS } = process.env;

// create command handlers and assign them to each invoke phrase
commands = new Discord.Collection();
command_definitions.forEach(cmdDef => {
    cmdDef.arguments = cmdDef.arguments || [];
    const usageArgsShort = cmdDef.arguments.map((argDef) => argDef.required === true ? argDef.name : `[${argDef.name}]`).join(' ');
    const usageArgsLong = cmdDef.arguments.map((argDef) => `\`${argDef.name}\` - ${argDef.help}`).join('\n');
    const usage = cmdDef.invokes.map((inv) => `\`$${inv} ${usageArgsShort}\``).join('\n') + `\nArguments:\n${usageArgsLong}`;
    cmdDef._handle = (cmd) => {
        const args = {};
        for (let i=0; i<cmdDef.arguments.length; i++) {
            const argDef = cmdDef.arguments[i];
            if (typeof cmd.arguments[i] === 'undefined') {
                if (argDef.required === true) {
                    cmd.message.reply(`Not enough arguments. Usage:\n${usage}`);
                    return;
                } else {
                    args[argDef.name] = (typeof argDef.default === 'function') ? argDef.default(cmd) : argDef.default;
                }
            } else {
                args[argDef.name] = cmd.arguments[i];
            }
        }
        cmdDef.handler(cmd, args);
    };
    cmdDef.invokes.forEach((invoke) => {
        commands.set(invoke.toLowerCase(), cmdDef);
        state.usageStore[invoke.toLowerCase()] = usage;
    });
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', (error) => {
    console.error('Socket error occured:', error);
});

client.on('message', (msg) => {
    try {
        // remove empty queues
        lib.cleanQueues();

        if (LOG_MSGS) {
            // dont log msgs from the bot itself
            if (client.user.id != msg.author.id) {
                const logEntry = JSON.stringify(createLogEntry(msg));
                console.log(`MSG: ${logEntry}`);
            }
        }

        // parse the message, ignore non-commands
        const parsed = parser.parse(msg, PREFIX, {
            allowBots: false,
            allowSelf: false,
        });
        if (!parsed.success) return;

        // ignore messages not sent via correct channels, if specified
        if ((msg.channel.type != 'text') ||
            (GUILD_ID && msg.channel.guild.id != GUILD_ID)) {
            msg.reply('This bot is not accessible from here.');
            return;
        }

        // handle the command
        const command = commands.get(parsed.command.toLowerCase());
        if (!command) {
            msg.reply(`I don't understand \`${msg}\``);
            return;
        }
        command._handle(parsed);
    } catch (error) {
        lib.handleError(msg, error);
    }
});

client.login(BOT_TOKEN);


function createLogEntry(msg) {
    let {author, channel, content, createdAt, guild, member, mentions} = msg;
    // const mentions = TODO
    return {
        guild: {id: guild.id, name: guild.name},
        channel: {id: channel.id, name: channel.name, type: channel.type},
        user: {id: author.id, tag: author.tag, username: author.username, nickname: member.nickname},
        msg: {type: msg.type, createdAt, content},
        time: new Date(),
    }
}
