const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client();
const parser  = require('discord-command-parser');

const lib = require('./lib');

const prefix = '$';
const HELP = `
\`\`\`GTAV Sale Queue Bot

$help               This help.
$list               List all sales.

Queues can have any name, for example:
$add MC1            Add yourself to queue called "MC1". Creates the queue if it doesn't exist.
$add cars           Add yourself to queue called "cars".
$add MC2 steve      Add Steve to queue called "MC2".

Removing names only works for the top name on the list:
$del MC2            Remove first name from queue called "MC2".

To make changes to a queue use the jump command:
$jump MC1           Move yourself to the top of "MC1" queue.
$jump MC2 steve     Move Steve to the top of "MC2" queue.

Written by Dreen <@dreen#1006> for BEWB crew!
\`\`\``;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', (error) => {
    console.error('Socker error occured:', error);
});

const renderName = (name, msg) => name === msg.author.username ? 'you' : `\`${name}\``;

client.on('message', (msg) => {
    try {
        lib.cleanQueues();
        const parsed = parser.parse(msg, prefix, {
            allowBots: false,
            allowSelf: false,
        });
        let name, queue_name, queue;
        if (!parsed.success) return;
        switch (parsed.command) {
            case 'help':
            case 'h':
                msg.reply(HELP);
                break;

            case 'list':
            case 'l':
                msg.reply(lib.listQueues());
                break;

            case 'add':
            case 'a':
                if (parsed.arguments.length < 1) {
                    msg.reply(`Not enough arguments. \`$add\` needs a queue name, and optionally the username.`)
                    break;
                }
                name = (parsed.arguments.length == 2) ? parsed.arguments[1] : msg.author.username;
                queue_name = parsed.arguments[0];
                queue = lib.getQueue(queue_name);
                if (!queue) return;
                const pos = queue.add(name);
                msg.reply(`I added ${renderName(name, msg)} to the bottom of \`${queue.name}\` queue, at position \`${pos}\``);
                break;

            case 'del': 
            case 'd':
                if (parsed.arguments.length < 1) {
                    msg.reply(`Not enough arguments. \`$del\` needs a queue name.`)
                    break;
                }
                queue = lib.getQueue(parsed.arguments[0]);
                name = queue.shift();
                msg.reply(`I removed \`${renderName(name, msg)}\` from the top of \`${queue.name}\` queue`);
                break;

            case 'jump': 
            case 'j':
                if (parsed.arguments.length < 1) {
                    msg.reply(`Not enough arguments. \`$jump\` needs a queue name, and optionally the username.`)
                    break;
                }
                name = (parsed.arguments.length == 2) ? parsed.arguments[1] : msg.author.username;
                queue = lib.getQueue(parsed.arguments[0]);
                if (!queue.jump(name)) {
                    msg.reply('Not possible');
                } else {
                    msg.reply(`I moved \`${renderName(name, msg)}\` to the top of \`${queue.name}\` queue`);
                }
                break;

            default:
                msg.reply(`I don't understand \`${msg}\``);
                break;
        };
    } catch (error) {
        lib.handleError(msg, error);
    }
});

client.login(process.env.BOT_TOKEN);
