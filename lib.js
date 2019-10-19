const arrayMove = require('array-move');

const queues = require('./state');

const handleError = (msg, error) => {
    msg.reply(`A general error occured when processing the message "${msg}"\n${error}`);
    return false;
};

const listQueues = () => {
    if (queues.length === 0) {
        return 'There are no sale queues set up';
    }
    return queues.map((queue) => queue.list()).join('\n');
};

const getQueue = (queue_name) => {
    queue_name = queue_name.toLowerCase();
    const queue = queues.find(({ name }) => name == queue_name);
    if (!queue) {
        const queue = new Queue(queue_name);
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

    list() {
        const names = this.list.reduce((all, name, idx) => `${all}\n${idx + 1}. ${name}`, '');
        return `Queue "${this.name}":${names}`;
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