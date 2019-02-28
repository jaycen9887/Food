# MentoringPOT
Javascript, NodeJS, ExpressJS, Kafka

This repo pulls a Menu from Kafka - "Menu" topic (Zookeeper and Kafka servers need to be started on server or local machine before running this) 

Once an order is sent it will produce this to the Kafka topic "Orders" which will be consumed by the "Chefs" (/chefs route)

This is just a testing project to work with Kafka and Zookeeper

