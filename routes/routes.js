const kafka = require('kafka-node');

const kafkaConfig = require('../config/kafka');
const ProducerStream = require('../config/producerStream');
/* const ConsumerGroupStream = require('../config/consumerGroupStream');
const resultProducer = new ProducerStream(); */

const menuConsumerConfig = require('../config/menuConsumer');
const chefConsumerConfig = require('../config/orderConsumer');

//create client
const client = new kafka.KafkaClient(kafkaConfig);
/* let offset = new kafka.Offset(client); */
//Producer
const Producer = kafka.Producer;
const producer = new Producer(client);
const admin = new kafka.Admin(client);

//Consumer
const consumerPayload  = {
    topic: 'Menu',
    offset: 0,
    partition: 0
}

const chefPayload = {
    topic: 'Order',
    partition: 0
}
const Consumer = kafka.Consumer;
const consumer = new Consumer(client, [consumerPayload], menuConsumerConfig);
const chefConsumer = new Consumer(client, [chefPayload], chefConsumerConfig);
/* const consumerGroup = new ConsumerGroupStream(menuConsumerConfig, "Menu");
const Transform = require('stream').Transform; */


//Create a payload to send to topic
const menuPayLoad = [
    {
        topic: 'Menu', 
        messages: [ 'Appetizers', 'Cheese Fries', '5.99', 'Quantity: 5', 'Onion Rings', '4.99', 'Quantity: 6', 'Lunch', 'Grilled Chicken Alfredo', '11.99', 'Quantity: 3', 'Dinner', 'Double Bacon Burger', '12.99', 'Quantity: 10', 'Sides', 'Fries', '3.99', 'Quantity: 5', 'Drinks', 'Tea', '2.99', 'Quantity: 8'], 
        timestamp: Date.now()
    }
];

let messageValues = [];
let orderValues = [];

let error = false;
let confirmMessage = "";
let wait = true;

let updateMenu = (payload, producerCB) => {
    //error = false;
    confirmMessage = "";
    //wait = true;
    //let newMessageValues = [];
    messageValues = [];

    //console.log("Getting Ready to produce!!");

    producer.send(payload, producerCB);

    //console.log("Getting ready to consume");

    //consumer.on('message', (message) => {
      //  wait = false;
       // messageValues.push(message.value);
   // });

   
}

//connect producer
producer.connect();

//connect consumer
consumer.connect();
chefConsumer.connect();

//listen for errors - producer
producer.on('error', (err) => {
    console.log("Producer Error: " + err);
});

//When producer is ready send payload to topic
producer.on('ready', () => {
    //list topics
    let menuExists = false;
    admin.listTopics((err, res) => {
        for(let topic in res[1].metadata){
            //console.log(topic);
            //check if topic exists or not
            if(topic === "Menu"){
                menuExists = true;
            }
        }
    });

    if(!menuExists){
        producer.createTopics(['Menu'], true, (err,data) => {
        if(err){
            console.log(err);
        } 
        });
    }

    producer.send(menuPayLoad, (err, data) => {
        if(err){
            console.log(err);
        }
    });

    consumer.on('error', (err) => {
        console.log("Consumer Error: " + err);
    });

    chefConsumer.on('error', (err) => {
        console.log('Chef Consumer Error: ', err);
    });

    //consumer listens for messages
    consumer.on('message', (message) => {
        //console.log("Menu: ", message)
        messageValues.push(message.value);
        //refresh page
    });

    chefConsumer.on('message', (message) => {
        orderValues.push("Order", message);
        //console.log(message);
    });



});   

let order;

module.exports = (app) => {
    
    app.get('/', (req, res) => {

        if(confirmMessage != ""){
            res.render('consumer', {menuItems: messageValues, confirmMessage: confirmMessage});
        } else {
            res.render('consumer', {menuItems: messageValues});
        }
       
    });

    app.get('/revieworder', (req, res) => {
        let orderAr = req.query.order;

        res.render('reviewOrder', {order: orderAr});
    });

    app.get('/admin/updateMenu', (req, res) => {
        
        res.render('updateMenu', {menuItems: messageValues});
    });

    app.get('/menusubmit', (req, res) => {
        let menu = req.query.newMenu.split(',');

        const newMenuPayLoad = [
            {
                topic: 'Menu', 
                messages: menu,
                timestamp: Date.now()
            }
        ];

        updateMenu(newMenuPayLoad, (err, data) => {
            if(err){
                error = true;
                wait = false;
                confirmMessage = "Error updating Menu: " + error;
            } else {
                error = false;
                wait = false;
                confirmMessage = "Menu Successfully Updated";
            }
        });
        
        if(error){
           
            res.render('consumer', {menuItems: messageValues, error: confirmMessage});
            //res.redirect('/admin/updateMenu?newMenu='+newMessageValues + "&message=" + message);
        } else {
           
            //res.render('consumer', {menuItems: mv, message: message});
            res.redirect("/");
        }
        
    });

    app.get('/ordersubmit', (req, res) => {
        let order = req.query.order;
        let menu = req.query.menu;
       
        let newMenu = [
            {
                topic: 'Menu', 
                messages: menu,
                timestamp: Date.now()
            }
        ];

        let newOrder = [
            {
                topic: 'Order',
                messages: order,
                timestamp: Date.now()
            }
        ];

        producer.send(newMenu, (err, data) => {
            if(err){
                console.log(err);
            }
        });

        producer.send(newOrder, (err, data) => {
            if(err){
                console.log(err);
            }
        });
        console.log(orderValues);
        res.render('orderSubmit', {order: order});
    });
}