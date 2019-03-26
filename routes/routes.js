const kafka = require('kafka-node');
const { KafkaStreams } = require('kafka-streams');

//set up Menu stream
const menuStreamsConfig = require('../config/menuStreamConfig.js');
const menuStreams = new KafkaStreams(menuStreamsConfig);
const menuStream = menuStreams.getKStream("Menu");

//set up Order Stream
const orderStreamsConfig = require('../config/orderStreamConfig.js');
const orderStreams = new KafkaStreams(orderStreamsConfig);
const orderStream = orderStreams.getKStream('Orders');

//pull kafka configuration file
const kafkaConfig = require('../config/kafka');

//create menu client
const menuClient = new kafka.KafkaClient(kafkaConfig);
const orderClient = new kafka.KafkaClient(kafkaConfig);

//Producers
const Producer = kafka.Producer;
const menuProducer = new Producer(menuClient);
const orderProducer = new Producer(orderClient);

//Consumers
const menuConsumerOptions = require('../config/menuConsumerOptions.js');
const orderConsumerOptions = require('../config/orderConsumerOptions');
const Consumer = kafka.Consumer;
let menuConsumer = new Consumer(menuClient, [{topic: 'Menu'}], menuConsumerOptions);
const orderConsumer = new Consumer(orderClient, [{topic: 'Order'}], orderConsumerOptions);
//const offset = new kafka.Offset(client);

//Payloads
const orderPayload = require('../config/orderPayload');
const menuPayLoad = require('../config/menuPayload');

//create arrays to hold values
let messageValues = [];
let orderValues = [];

let menuValues = {};

//errors
let error = false;
let confirmMessage = "";

let updateMenu = (payload, producerCB) => {
    confirmMessage = "";

    menuProducer.send(payload, producerCB);  
}

//connect to the producers
menuProducer.connect();
orderProducer.connect();

//listen for errors - producers
menuProducer.on('error', (err) => {
    console.log("Menu Producer Error: " + err);
});

orderProducer.on('error', (err) => {
    console.log("Order Producer Error: " + err);
});

//When producers are ready send payload to topic
menuProducer.on('ready', () => {
    menuProducer.send([menuPayLoad], (err, data) => {
        if(err){
            console.log(err);
        }
        console.log(data);
    });

    //console.log("Menu Producer Ready");
}); 
orderProducer.on('ready', () => {
    //console.log("Order Producer Ready");
});

/* consumer.on('message', (message) => {
    //console.log(message.value);
    messageValues.push(message.value);
}); */

/* chefConsumer.on('message', (message) => {
    orderValues.push(message.value);
    console.log(message.value);
}); */

//listen for stream messages
menuStream.forEach(message => {
    let buf = message.value;
    //console.log(message);
    messageValues.push(buf.toString());
    //updateMenuObject(message);
});

orderStream.forEach(message => {
    let buf = message.value;
    console.log(buf);
    orderValues.push(buf.toString());
});

//start streams
menuStream.start().then(_ => {
    setTimeout(menuStreams.closeAll.bind(menuStreams), 100);
});

orderStream.start().then(_ => {
    setTimeout(orderStreams.closeAll.bind(orderStreams), 100);
});

let updateMenuCategory = "";
let item = [];
let currentIndex;

const isEmpty = (obj) => {
    for(let key in obj){
        if(obj.hasOwnProperty(key)){
            return false;
        } 
    }
    return true;
}

const updateMenuObject = (message) => {
    let currentValue;
    let timestamp = message.timestamp;
    let value = message.value.toString();
    if(menuValues[timestamp] == undefined){
        //if timestamp doesn't exists add it and continue
        menuValues[timestamp] = {};
    } 
    currentValue = menuValues[timestamp];
    //check if value is a category
    switch(value){
        case "Appetizers":
            //set updateMenuCategory
            updateMenuCategory = "Appetizers";
            break;
        case "Lunch":
            //set updateMenuCategory
            updateMenuCategory = "Lunch";
            break;
        case "Dinner":
            //set updateMenuCategory
            updateMenuCategory = "Dinner";
            break;
        case "Sides":
            //set updateMenuCategory
            updateMenuCategory = "Sides";
            break;
        case "Drinks":
            //set updateMenuCategory
            updateMenuCategory = "Drinks";
            break;
        default:
            let currentCategory;

            //check if category exists
            if(currentValue[updateMenuCategory] == undefined){
                currentValue[updateMenuCategory] = {};
            } else {
                currentCategory = currentValue[updateMenuCategory];
            }

            //console.log(item.length);

            

            switch(item.length){
                case 3: 
                    //push item to category
                    //console.log("3: " + value);
                    //get current item key
                    console.log(isEmpty(currentCategory));
                    if(isEmpty(currentCategory)) {
                        //console.log("EMPTY");
                        currentIndex = 0;
                    } else {
                        let i = Object.keys(currentCategory);
                        currentIndex = (parseInt(i[i.length - 1])) + 1;
                        console.log(currentIndex);
                    }
                    
                    currentCategory[currentIndex] = item;
                    //console.log(menuValues);
                    //clear item array
                    item = [];

                    //push current value to item array
                    item.push(value);
                    break;
                case 2: 
                    //push current value to item array
                    item.push(value);
                    //console.log("2: " + value);
                    break;
                case 1: 
                    //push current value to item array
                    //console.log("1: " + value);
                    item.push(value);
                    break;
                case 0:
                    //console.log("0: " + value);
                    item.push(value);
                    break;
            }

    }

    //console.log(currentValue);
}



module.exports = (app) => {
    
    app.get('/', (req, res) => {
        //console.log(messageValues);
        //console.log(Object.keys(menuValues));
        /* let keys = Object.keys(menuValues);
        for(let i = 0; i < keys.length; i++){
            //console.log(Object.keys(menuValues[keys[i]]));
            let keysKeys = Object.keys(menuValues[keys[i]]);
            //console.log(keysKeys);
            for(let j = 0; j < keysKeys.length; j++){
                //console.log(Object.keys(menuValues[keysKeys]));
                //console.log(keysKeys[j]);
                console.log(Object.keys(menuValues[keys[i]][keysKeys[j]]));
            }
        } */

        if(confirmMessage != ""){
            res.render('consumer', {menuItems: messageValues, confirmMessage: confirmMessage});
        } else {
            res.render('consumer', {menuItems: messageValues});
        }
       
    });

    app.get('/chefs', (req, res) => {

        res.render('chefs');
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

        /* console.log("*********************");
        console.log(menu);
        console.log("*********************");
        console.log(order); */
       
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

        menuProducer.send(newMenu, (err, data) => {
            if(err){
                console.log(err);
            }
        });

        orderProducer.send(newOrder, (err, data) => {
            if(err){
                console.log(err);
            }

            //console.log(data);
        });

        //console.log(orderValues);
        res.render('orderSubmit', {order: order});
    });
}