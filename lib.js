const arrayMove = require('array-move');

let queues = require('./state');

const handleError = (msg, error) => {
    msg.reply(`A general error occured when processing the message \`${msg}\`\n${error}`);
    return false;
};

const listQueues = () => {
    if (queues.length === 0) {
        return 'There are no sale queues set up';
    }
    return '\n' + queues.map((queue) => queue.renderList()).join('\n');
};

const getQueue = (queue_name) => {
    let queue = queues.find(({ name }) => name.toLowerCase() == queue_name.toLowerCase());
    if (!queue) {
        queue = new Queue(queue_name);
        queues.push(queue);
    }
    return queue;
};

const cleanQueues = () => {
    queues = queues.filter((queue) => queue.length() > 0);
};

class Queue {
    constructor(name, creator) {
        this.list = [];
        this.name = name;
        this.created_at = new Date();
    }

    renderList() {
        const names = this.list.reduce((all, name, idx) => `${all}\n${idx + 1}. ${name}`, '');
        return `\nQueue \`${this.name}\`:\`\`\`${names}\`\`\``;
    }

    length() {
        return this.list.length;
    }

    add(name) {
        this.list.push(name);
    }

    shift() {
        return this.list.shift();
    }

    jump(name) {
        const pos  = this.list.indexOf(name);
        if (pos <= 0) {
            return false;
        }
        this.list = arrayMove(this.list, pos, 0);
        return true;
    }
};

module.exports = {
    listQueues, getQueue, handleError, cleanQueues
};