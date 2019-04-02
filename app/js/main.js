let order = [];
let update = false;
const socket = io();

if (document.getElementById("consumer") != null) {
  let reviewButton = document.getElementById("order-submit");

  //on button press
  reviewButton.onclick = () => {
    //grab input values
    let inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
      let type = "";
      switch (inputs[i].alt) {
        case "apps-list":
          type = "Appetizers";
          break;
        case "dinner-list":
          type = "Dinner";
          break;
        case "lunch-list":
          type = "Lunch";
          break;
        case "sides-list":
          type = "Sides";
          break;
        case "drinks-list":
          type = "Drinks";
          break;
      }
      if (inputs[i].value == "") {
        order.push([
          "0",
          inputs[i].id,
          inputs[i].max,
          inputs[i].min,
          inputs[i].name,
          type
        ]);
        //console.log('0: ', inputs[i].id );
      } else {
        order.push([
          inputs[i].value,
          inputs[i].id,
          inputs[i].max,
          inputs[i].min,
          inputs[i].name,
          type
        ]);
        //console.log(inputs[i].value + ": " + inputs[i].id);
      }
    }
    //console.log(order);
    window.location.href = "/revieworder?order=" + order;
  };
}

if (document.getElementById("review") != null) {
  //create a form
}

if (document.getElementById("updateMenu") != null) {
  let subButton = document.getElementById("save-menu");
  let newMenu = [];
  subButton.onclick = () => {
    //get information
    let menuInputs = document.getElementsByTagName("input");
    for (let m = 0; m < menuInputs.length; m++) {
      if (m % 3 == 0) {
        //console.log(type);
        switch (menuInputs[m].alt) {
          case "Appetizers":
            newMenu.push("Appetizers");
            break;
          case "Lunch":
            newMenu.push("Lunch");
            break;
          case "Dinner":
            newMenu.push("Dinner");
            break;
          case "Sides":
            newMenu.push("Sides");
            break;
          case "Drinks":
            newMenu.push("Drinks");
            break;
        }

        let item = menuInputs[m].value;
        let price = menuInputs[m + 1].value;
        let quant = menuInputs[m + 2].value;

        newMenu.push(item);
        newMenu.push(price);
        newMenu.push("Quantity: " + quant);

        //console.log("Item: ", item);
        //console.log("Price: ", price);
        //console.log("Quantity: ", quant);
      }
    }

    //console.log(newMenu);

    window.location.href = "/menusubmit?newMenu=" + newMenu;
  };
}
