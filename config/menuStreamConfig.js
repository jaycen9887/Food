const streamOptions = {
    kafkaHost: "localhost:9092",
    groupId: "Menu-Group",
    clientName: "Menu-Stream",
    workerPerPartition: 1,
    sessionTimeout: 8000,
    protocol: ["roundrobin"],
    fromOffset: "latest",
    fetchMaxBytes: 1024 * 1024,
    fetchMinBytes: 1,
    fetchMaxWaitMs: 10,
    heartbeatInterval: 250,
    retryMinTimeout: 250,
    autoCommit: true,
    autoCommitIntervalMs: 1000,
    requireAcks: 1,
    ackTimeoutMs: 100,
    partitionerType: 3
}

module.exports = streamOptions;