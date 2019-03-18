const kafka = require('kafka-node');

const kafkaConfig = require('../config/kafka');
//const chefConsumerConfig = require('../config/orderConsumer');

//create client
const client = new kafka.KafkaClient(kafkaConfig);
const chefClient = new kafka.KafkaClient(kafkaConfig);
//Producer
const Producer = kafka.Producer;
const producer = new Producer(client);
const chefProducer = new Producer(chefClient);
const admin = new kafka.Admin(client);

//Consumer

const consumerOptions = {
    groupId: 'Menu-Group',
    autoCommit: true,
    encoding: 'utf8',
}

const chefOptions = {
    groupId: 'Order-Group',
    autoCommit: true,
    encoding: 'utf-8'
}

const chefPayload = {
    topic: 'Order',
    partition: 0
}
const Consumer = kafka.Consumer;
let consumer = new Consumer(client, [{topic: 'Menu'}], consumerOptions);
const chefConsumer = new Consumer(chefClient, [{topic: 'Order'}], chefOptions);
const offset = new kafka.Offset(client);

/* const consumerInit = () => {
    
    offset.fetchLatestOffsets(['Menu'], (err, offsets) => {
        if(err){
            console.log(err);
        }
        console.log(offsets['Menu'][0]);
        let consumerPayload = {
            topic: 'Menu',
            offset: (offsets['Menu'][0]),
            partition: 0
        }

        consumer = new Consumer(client, [consumerPayload], consumerOptions);

        //console.log(consumer);

        consumer.connect();

        consumer.on('error', (err) => {
            console.log("Consumer Error: " + err);
        });

        //consumer listens for messages
        messageValues = [];
        let tempMessageValues = [];
        consumer.on('message', (message) => {
            //console.log("Menu: ", message)
            tempMessageValues.push(message.value);
            //refresh page
            messageValues = tempMessageValues;
        });



    });


} */ 

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

let updateMenu = (payload, producerCB) => {
    confirmMessage = "";

    producer.send(payload, producerCB);

   // consumerInit();
   
}

producer.connect();
chefProducer.connect();

//chefConsumer.connect();

//listen for errors - producer
producer.on('error', (err) => {
    console.log("Producer Error: " + err);
});

/* chefProducer.on('ready', () => {

}); */
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

    //consumerInit();
    producer.send(menuPayLoad, (err, data) => {
        if(err){
            console.log(err);
        }
    });

    chefConsumer.on('error', (err) => {
        console.log('Chef Consumer Error: ', err);
    });
}); 

consumer.on('message', (message) => {
    //console.log(message.value);
    messageValues.push(message.value);
});

chefConsumer.on('message', (message) => {
    orderValues.push(message.value);
    console.log(message.value);
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
                confirmMessage = "Error updating Menu: " + error;
            } else {
                confirmMessage = "Menu Successfully Updated";
            }
        });
        
        if(error){
            res.render('consumer', {menuItems: messageValues, error: confirmMessage});
        } else {
            
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

        chefProducer.send(newOrder, (err, data) => {
            if(err){
                console.log(err);
            }

            //console.log(data);
        });

        //console.log(orderValues);
        res.render('orderSubmit', {order: order});
    });
}