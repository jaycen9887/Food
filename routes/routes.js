const kafka = require('kafka-node');

//Kafka setup
const Producer = kafka.Producer;
const client = new kafka.KafkaClient();
const producer = new Producer(client);
let KeyedMessage = kafka.KeyedMessage;
let km = new KeyedMessage('key', 'message');
let admin = new kafka.Admin(client);
//let Consumer = kafka.Consumer;
//let consumer = new Consumer(client);
let payloads = [
    {topic: 'Appetizers', messages: 'Cheese Fries 5.99'},
    {topic: 'Appetizers', messages: 'Jalapeno Popper 4.99'},
    {topic: 'Appetizers', messages: 'Boneless Wings 6.99'},
    {topic: 'Appetizers', messages: 'Onion Rings 5.99'},
    {topic: 'Appetizers', messages: 'Nachos 3.99'},
    {topic: 'Appetizers', messages: 'Cheese Curds 4.99'},
    {topic: 'Dinner', messages: 'Double Bacon Burger 10.99'},
    {topic: 'Dinner', messages: 'Steak Fajitas 11.99'},
    {topic: 'Dinner', messages: 'chicken Alfredo 10.99'},
    {topic: 'Dinner', messages: 'Lobster Tail 15.99'},
    {topic: 'Dinner', messages: 'Grilled Chicken Breast 12.99'},
    {topic: 'Dinner', messages: 'Fried Chicken Salad 10.99'},
    {topic: 'Lunch', messages: 'Endless Soup and Salad 7.99'},
    {topic: 'Lunch', messages: 'Endless Soup, Salad, Half Sandwhich 8.99'},
    {topic: 'Lunch', messages: 'Burger Sliders 7.99'},
    {topic: 'Lunch', messages: 'BLT Sandwhich 7.99'},
    {topic: 'Lunch', messages: 'Chicken Fajitas 7.99'},
    {topic: 'Lunch', messages: 'Chicken Bacon Avocado Sandwich 6.99'}
];

let topics = ["Stuff", "Breakfast", "Lunch", "Dinner", "Sides", "Drinks"];

module.exports = (app) => {
    app.get("/", (req, res) => {
        
        //consumer.removeTopics(['Appetizers', 'Breakfast', 'Lunch', 'Dinner', 'Sides', 'Drinks']);
        for(let i = 0; i < topics.length; i++){
            producer.createTopics([topics[i]], true, (err, data) => {
                if(err){
                    console.log(err);
                }
    
                //console.log(data);
            });
        }
        
        res.render('customer.ejs', {menu: []});
    });
    
    app.get("/customer", (req,res) => {
        let topicList = [];
        admin.listTopics((err, response) =>{
            for(let key in response[1].metadata){
                //console.log(key);
                for(let m = 0; m < topics.length; m++){
                    if(key == topics[m]){
                        topicList.push(key);
                    }
                }
                
            }

            for(let r = 0; r < topicList.length; r++){
                console.log(topicList[r]);
            }
           // console.log('Topics ', res);
           // console.log(res[1].metadata);
           res.render('customer.ejs', {menu: topicList});
        });
        
    });
    
    app.get("/chefs", (req, res) => {
        res.render('chefs.ejs');
    });
}