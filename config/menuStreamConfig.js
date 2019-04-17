const streamOptions = {
  kafkaHost: "127.0.0.1:9092",
  //kafkaHost: "192.168.1.98:9092",
  groupId: "Menu-Group",
  options: {
    fromOffset: "latest",
    autoCommit: true
  }
};

module.exports = streamOptions;
