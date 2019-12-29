const lib = require('./lib');
const state = require('./state');

const HELP = `
\`\`\`GTAV Sale Queue Bot

$help or $h                This help.
$help <command>            Detailed help for any command.
$list                      List all sales.

Adding names:
$add MC1                   Add yourself to queue called "MC1". Creates the queue if it doesn't exist.
$a cars                    Add yourself to queue called "cars".
$add MC2 steve             Add Steve to queue called "MC2".

Removing names:
$delTop MC1 or $dt MC1     Remove the top name from queue called "MC1".
$del MC2 or $d MC2         Remove YOUR name from queue called "MC2".

Making changes to the order of the queue:
$move mc 4 2              Move name at position 4 to position 2. Postion 2 becomes 3 etc.
$m mc 1 2                 Swap names at first and second positions.
$m mc 5                   Move the name at fifth position to the top of the queue.

Written by Dreen <@dreen#1006> for BEWB crew!
\`\`\``;

/**
 * Command definition objects:
 * name - internal name
 * invokes - list of phrases to activate this command
 * arguments - list of argument definition objects
 * 
 * Argument definition objects:
 * name - internal name
 * required - optional boolean, defaults to false
 * default - optional function (receives the parsed command) or a constant value
 * help - help text displayed with $help <command> or if wrongly used
 **/
// TODO if you @ someone, it takes their ID, should get nickname somehow
const getUsername = (cmd) => cmd.message.member.nickname || cmd.message.member.displayName;
const renderName = (name, cmd) => name === cmd.message.member.displayName ? 'you' : `\`${name}\``;
module.exports = [{
    // displaying help
    name: 'help',
    invokes: ['help', 'h'],
    arguments: [{name: 'command', help: 'Display detailed help for a command. Optional, full help displayed otherwise'}],
    handler: (cmd, args) => {
        if (args.command) {
            const usage = state.usageStore[args.command.toLowerCase()];
            cmd.message.reply(usage ? `Usage:\n${usage}` : `Unknown command: ${args.command}`);
            return;
        }
        cmd.message.reply(HELP);
    }
}, {
    // listing sales
    name: 'list',
    invokes: ['list', 'l'],
    handler: (cmd) => cmd.message.reply(lib.listQueues()),
}, {
    // adding names
    name: 'add',
    invokes: ['add', 'a'],
    arguments: [
        {name: 'queue_name', required: true, help: 'Queue name - required'},
        {name: 'user_name', help: 'User name - optional (defaults to your name)', default: getUsername},
    ],
    handler: (cmd, args) => {
        queue = lib.getQueue(args.queue_name);
        if (!queue) return;

        let user_name = args.user_name;
        // if the username is a mention, convert that to member nickname
        // we are assuming a mere presence of exacly one mention means that its used for user_name
        // its possible this may have unforseen problems and will need a lot more checks
        if (cmd.message.mentions.members.size === 1 || cmd.message.mentions.users.size === 1) {
            user_name = cmd.message.mentions.members.first().nickname;
            if (!user_name) {
                user_name = cmd.message.mentions.users.first().username;
            }
        }

        if (queue.has(user_name.toLowerCase())) {
            cmd.message.reply(`Name \`${user_name}\` is already present in the queue`);
            return;
        }
        const pos = queue.add(user_name);
        cmd.message.reply(`I added ${renderName(user_name, cmd)} to the bottom of \`${queue.name}\` queue, at position \`${pos}\``);
    }
}, {
    // removing names from top of the list
    name: 'delTop',
    invokes: ['delTop', 'dt'],
    arguments: [{name: 'queue_name', required: true, help: 'Queue name - required'}],
    handler: (cmd, args) => {
        const queue = lib.findQueue(args.queue_name);
        if (!queue) {
            cmd.message.reply(`Queue \`${args.queue_name}\` does not exist`);
            return;
        }
        const name = queue.shift();
        cmd.message.reply(`I removed ${renderName(name, cmd)} from the top of \`${queue.name}\` queue`);
    }
}, {
    // removing own name from any place in the queue
    name: 'del',
    invokes: ['del', 'd', 'rm'],
    arguments: [{name: 'queue_name', required: true, help: 'Queue name - required'}],
    handler: (cmd, args) => {
        const queue = lib.getQueue(args.queue_name);
        const name = getUsername(cmd);
        if (!queue.has(name)) {
            cmd.message.reply('Your name is not in that queue.');
            return;
        }
        queue.del(name);
        cmd.message.reply(`I removed you from \`${queue.name}\` queue`);
    }
}, {
    // moving names within the queue
    name: 'move',
    invokes: ['move', 'm', 'mv'],
    arguments: [
        {name: 'queue_name', required: true, help: 'Queue name - required'},
        {name: 'posFrom', required: true, help: 'Position of the name to be moved - required'},
        {name: 'posTo', required: false, default: 1, help: 'Position to move the name to - optional, defaults to the top'},
    ],
    handler: (cmd, args) => {
        args.posFrom = parseInt(args.posFrom);
        args.posTo = parseInt(args.posTo);
        const queue = lib.findQueue(args.queue_name);
        if (!queue) {
            cmd.message.reply(`Queue \`${args.queue_name}\` does not exist`);
            return;
        } else if (args.posFrom === args.posTo || args.posFrom < 1 || args.posTo < 1 ||
                args.posFrom > queue.length() || args.posTo > queue.length()) {
            cmd.message.reply('Invalid positions for move, make sure to inspect the queue with `$list`. See also: `$help move`');
            return;
        }
        queue.move(args.posFrom - 1, args.posTo - 1);
        cmd.message.reply('Move successful');
    }
}];