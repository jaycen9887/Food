module.exports = {
    kafkaHost: '127.0.0.1:9092',
    groupId: 'Menu-Group',
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    asyncPush: false,
    id: 'menuConsumer',
    fromOffset: 'latest',
};

//Encoding and KeyEncoding is for if set to 'buffer' valuse will be returned as raw buffer types.