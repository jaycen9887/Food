# MentoringPOT

Javascript, NodeJS, ExpressJS, Kafka

This repo pulls a Menu from Kafka - "Menu" topic (Zookeeper and Kafka servers need to be started on server or local machine before running this) 

Once an order is sent it will produce this to the Kafka topic "Orders" which will be consumed by the "Chefs" (/chefs route)

This is just a testing project to work with Kafka and Zookeeper

NOTE: In order to connect to MONGODB database create a file inside the CONFIG folder called "database.js" and export your specific database connection string. 

For example if you are using MLAB the file would look like the below. 

module.exports = {
    'url': 'mongodb://{username}:{password}@ds217864.mlab.com:17864/{database}'
}