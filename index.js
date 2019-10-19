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

client.on('message', (msg) => {
    try {
        lib.cleanQueues();
        const parsed = parser.parse(msg, prefix);
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
                const name = (parsed.arguments.length == 2) ? parsed.arguments[1] : msg.author.username;
                const queue_name = parsed.arguments[0];
                const queue = lib.getQueue(queue_name);
                if (!queue) return;
                queue.add(name);
                msg.reply(`I added ${name} to the bottom of ${queue.name} queue`);
                break;

            case 'del': 
            case 'd':
                queue = lib.getQueue(parsed.arguments[0]);
                const name = queue.shift();
                msg.reply(`I removed ${name} from the top of ${queue.name} queue`);
                break;

            case 'jump': 
            case 'j':
                const name = (parsed.arguments.length == 2) ? parsed.arguments[1] : msg.author.username;
                queue = lib.getQueue(parsed.arguments[0]);
                if (!queue.jump(name)) {
                    msg.reply('Not possible');
                } else {
                    msg.reply(`I moved ${name} to the top of ${queue.name} queue`);
                }
                break;

            default:
                msg.reply(`I don't understand "${msg}"`);
                break;
        };
    } catch (error) {
        lib.handleError(msg);
    }
});

client.login(process.env.BOT_TOKEN);
