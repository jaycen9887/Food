const kafka = require('kafka-node');

const kafkaConfig = require('../config/kafka');

const menuConsumerConfig = require('../config/menuConsumer');

//create client
const client = new kafka.KafkaClient(kafkaConfig);
//Producer
const Producer = kafka.Producer;
const producer = new Producer(client);

//Consumer
const consumerPayload  = {
    topic: 'Menu',
    partition: 0
}
const Consumer = kafka.Consumer;
const consumer = new Consumer(client, [consumerPayload], menuConsumerConfig);

//Create a payload to send to topic
const menuPayLoad = [
    {
        topic: 'Menu', 
        messages: [ 'Appetizers', 'Cheese Fries', '5.99', 'Quantity: 5', 'Onion Rings', '4.99', 'Quantity: 6', 'Lunch', 'Grilled Chicken Alfredo', '11.99', 'Quantity: 3', 'Dinner', 'Double Bacon Burger', '12.99', 'Quantity: 10', 'Sides', 'Fries', '3.99', 'Quantity: 5', 'Drinks', 'Tea', '2.99', 'Quantity: 8'], 
        timestamp: Date.now()
    }
]

let kmessages = [];

//connect producer
producer.connect();

//connect consumer
consumer.connect();

//listen for errors - producer
producer.on('error', (err) => {
    console.log("Producer Error: " + err);
});

//When producer is ready send payload to topic
producer.on('ready', () => {
    producer.send(menuPayLoad, (err, data) => {
        if(err){
            console.log(err);
        }

        //console.log(data);
    });

    consumer.on('error', (err) => {
        console.log("Consumer Error: " + err);
    });

    //consumer listens for messages
    consumer.on('message', (message) => {
        kmessages.push(message.value);
        //refresh page
    });

});   


let order;

module.exports = (app, jsonParser, urlencodedParser) => {
    
    app.get('/', (req, res) => {
        res.render('consumer', {menuItems: kmessages});
    });

    app.get('/revieworder/?order', (req, res) => {
        let orderAr = req.query.order.join(',');
        console.log(orderAr);

        res.render('reviewOrder', {order: orderAr});
    });
}