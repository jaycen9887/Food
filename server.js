const express = require("express");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { origins: "*:*" });
const port = process.env.port || 3000;

const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");

const kafka = require("kafka-node");
const { KafkaStreams } = require("kafka-streams");

//configuration
const kafkaConfig = require("./config/kafka");
const menuStreamConfig = require("./config/menuStreamConfig.js");
const orderStreamConfig = require("./config/orderStreamConfig.js");

//create menu client
const menuClient = new kafka.KafkaClient(kafkaConfig);
const orderClient = new kafka.KafkaClient(kafkaConfig);

//Producers
const Producer = kafka.Producer;
const menuProducer = new Producer(menuClient);
const orderProducer = new Producer(menuClient);

//Stream
const menuTopic = "Menu";
const orderTopic = "Order";

const menuStreams = new KafkaStreams(menuStreamConfig);
const orderStreams = new KafkaStreams(orderStreamConfig);

const menuStream = menuStreams.getKStream(menuTopic);
const orderStream = orderStreams.getKStream(orderTopic);

//Database Connection
const configDB = require("./config/database.js");
MongoClient.connect(configDB.url, { useNewUrlParser: true }, () => {
  console.log("DATABASE CONNECTION SUCCESSFUL");
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + "/app"));
app.set("view engine", "ejs");

//require("./routes/routes.js")(app, io);

http.listen(port, () => console.log("App listening on port: " + port));

menuStream.forEach(message => formatMenu(message));
menuStream.start().then(
  () => {
    console.info("Menu stream started");
  },
  error => {
    console.error("Menu stream failed to start: " + error);
  }
);

orderStream.forEach(message => formatOrder(message));
orderStream.start().then(
  () => {
    console.info("Order stream started");
  },
  error => {
    console.error("Order stream failed to start: " + error);
  }
);

//Payloads
const orderPayLoad = require("./config/orderPayload");
const menuPayLoad = require("./config/menuPayload");

//create arrays to hold values
/* let messageValues = []; */
let menu = [];
let order = [];

let menuUpdated = false;
let orderUpdated = false;

//format Message values and push to menu array
const formatMenu = message => {
  //console.log("FORMATTING MENU");
  let timestamp = message.timestamp;
  //console.log(message);
  let value = message.value.toString();
  //console.log(menu[menu.length - 1]);
  if (menu.length == 0) {
    let ob = {};
    ob[timestamp] = [];
    menu.push(ob);
  } else if (Object.keys(menu[menu.length - 1])[0] != timestamp) {
    let ob = {};
    ob[timestamp] = [];
    menu.push(ob);
  }

  menu[menu.length - 1][timestamp].push(value);
  menuUpdated = true;
};

const formatOrder = message => {
  //console.log("ORDER RECEIVED");
  let timestamp = message.timestamp;
  let value = message.value.toString();
  if (order.length == 0) {
    let ob = {};
    ob[timestamp] = [];
    order.push(ob);
  } else if (Object.keys(order[order.length - 1])[0] != timestamp) {
    let ob = {};
    ob[timestamp] = [];
    order.push(ob);
  }

  order[order.length - 1][timestamp].push(value);
  orderUpdated = true;
};

//connect producers
menuProducer.connect();
orderProducer.connect();

//listen for errors - producers
menuProducer.on("error", err => {
  console.error("Menu Producer Error: " + err);
});

orderProducer.on("error", err => {
  console.error("Order Producer Error: " + err);
});

//producers - ready
menuProducer.on("ready", () => {
  menuProducer.send([menuPayLoad], (err, data) => {
    if (err) {
      console.error(err);
    }
  });
});
orderProducer.on("ready", () => {});

io.on("connection", socket => {
  console.log("SOCKET CONNECTED");
  socket.on("chat message", msg => {
    //console.log("MESSAGE Received");
    let temp = msg.split("+");
    let sentMenu = JSON.parse(temp[0]);
    let sentOrder = JSON.parse(temp[1]);
    //msg = JSON.parse(msg);

    //console.log(sentMenu);

    io.emit("chat message", msg);
  });
});

app.get("/", (req, res) => {
  let currentMenu = menu[menu.length - 1];
  let timestamp = Object.keys(currentMenu)[0];
  currentMenu = currentMenu[timestamp];

  res.render("consumer", { menuItems: currentMenu });
});

app.get("/chefs", (req, res) => {
  if (req.query.ordersRemaining) {
    const newOrderPayLoad = [
      {
        topic: "Order",
        messages: req.query.ordersRemaining,
        timestamp: Date.now()
      }
    ];
    //console.log(req.query.ordersRemaining);

    orderProducer.send([newOrderPayLoad], (err, data) => {
      if (err) {
        console.error(err);
      }
    });
  }

  res.render("chefs", { orders: JSON.stringify(order) });
});

app.get("/revieworder", (req, res) => {
  let orderAr = req.query.order;

  res.render("reviewOrder", { order: orderAr });
});

app.get("/admin/updateMenu", (req, res) => {
  res.render("updateMenu", { menuItems: menu });
});

app.get("/menusubmit", (req, res) => {
  let menu = req.query.newMenu.split(",");

  const newMenuPayLoad = [
    {
      topic: "Menu",
      messages: menu,
      timestamp: Date.now()
    }
  ];

  updateMenu(newMenuPayLoad, (err, data) => {
    if (err) {
      confirmMessage = "Error updating Menu: " + error;
    } else {
      confirmMessage = "Menu Successfully Updated";
    }
  });

  if (error) {
    res.render("consumer", { menuItems: menu, error: confirmMessage });
  } else {
    res.redirect("/");
  }
});

app.get("/ordersubmit", (req, res) => {
  let order = req.query.order;
  let menu = req.query.menu;

  let newMenu = [
    {
      topic: "Menu",
      messages: menu,
      timestamp: Date.now()
    }
  ];

  let newOrder = [
    {
      topic: "Order",
      messages: order,
      timestamp: Date.now()
    }
  ];

  menuProducer.send(newMenu, (err, data) => {
    if (err) {
      console.error(err);
    }
  });

  orderProducer.send(newOrder, (err, data) => {
    if (err) {
      console.error(err);
    }

    //console.log(data);
  });

  //console.log(orderValues);
  res.render("orderSubmit", { order: order });
});
