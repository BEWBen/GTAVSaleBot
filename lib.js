const arrayMove = require('array-move');

const state = require('./state');

const handleError = (msg, error) => {
    msg.reply(`A general error occured when processing the message \`${msg}\`\n${error}`);
    throw error;
    return false;
};

const listQueues = () => {
    if (state.queues.length === 0) {
        return 'There are no sale queues set up';
    }
    return '\n' + state.queues.map((queue) => queue.renderList()).join('\n');
};

const findQueue = (queue_name) => {
    return state.queues.find(({ name }) => name.toLowerCase() == queue_name.toLowerCase());
}

const getQueue = (queue_name) => {
    let queue = findQueue(queue_name);
    if (!queue) {
        queue = new Queue(queue_name);
        state.queues.push(queue);
    }
    return queue;
};

const cleanQueues = () => {
    state.queues = state.queues.filter((queue) => queue.length() > 0);
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

    has(name) {
        return this.list.indexOf(name) >= 0;
    }

    length() {
        return this.list.length;
    }

    add(name) {
        return this.list.push(name);
    }

    del(name) {
        this.list = this.list.filter((n) => n !== name);
    }

    shift() {
        return this.list.shift();
    }

    move(posFrom, posTo) {
        this.list = arrayMove(this.list, posFrom, posTo);
    }
};

module.exports = {
    listQueues, getQueue, handleError, cleanQueues
};