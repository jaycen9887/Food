let order = [];
let update = false;

if(document.getElementById('consumer') != null){
    update = false;
    
    setTimeout(() => {
        if(update){
            window.location = "/";
        }
    }, 3000);

    let reviewButton = document.getElementById('order-submit');
    
    //on button press
    reviewButton.onclick = () => {
        //grab input values
        let inputs = document.getElementsByTagName('input');
        for(let i = 0; i < inputs.length; i++){
            let type = "";
            switch(inputs[i].alt){
                case 'apps-list':
                    type = 'Appetizers';
                    break;
                case 'dinner-list':
                    type = "Dinner";
                    break;
                case 'lunch-list':
                    type = "Lunch";
                    break;
                case 'sides-list':
                    type = 'Sides';
                    break;
                case 'drinks-list':
                    type = "Drinks";
                    break;
            }
            if(inputs[i].value == ""){
                order.push(['0', inputs[i].id, inputs[i].max, inputs[i].min, inputs[i].name, type]);
                //console.log('0: ', inputs[i].id );
            } else {
                order.push([inputs[i].value, inputs[i].id, inputs[i].max, inputs[i].min, inputs[i].name, type]);
                //console.log(inputs[i].value + ": " + inputs[i].id);
            }
        }
        //console.log(order);
        window.location.href = '/revieworder?order=' + order;
    }
}

if(document.getElementById('review') != null){
    //create a form
    let submitButton = document.getElementById('order-submit');
    let menu = [];
    let order = [];
    let orderSubtotal = document.getElementById('subtotal').innerText;
    let orderTotal = document.getElementById('total').innerText;

    submitButton.onclick = () => {
        let inputs = document.getElementsByTagName('input');
        for(let i = 0; i < inputs.length; i++){
            //console.log(inputs[i]);
            let type = inputs[i].alt;
            switch(type){
                case "Appetizers":
                    menu.push('Appetizers');
                    break;
                case "Lunch":
                    menu.push('Lunch');
                    break;
                case "Dinner":
                    menu.push('Dinner');
                    break;
                case "Sides":
                    menu.push('Sides');
                    break;
                case "Drinks":
                    menu.push('Drinks');
                    break;
            }

            menu.push(inputs[i].id);
            menu.push(inputs[i].name);
            menu.push(inputs[i].max - inputs[i].value);
        

            if(inputs[i].value != 0){
                order.push([inputs[i].value, inputs[i].id, orderSubtotal, orderTotal]);
            }
        }
        update = true;
        window.location.href = '/ordersubmit?order=' + order + "&menu=" + menu;
    };
}



if(document.getElementById('updateMenu') != null){
    let subButton = document.getElementById('save-menu');
    let newMenu = [];
    subButton.onclick = () => {
        //get information 
        let menuInputs = document.getElementsByTagName('input');
        for(let m = 0; m < menuInputs.length; m++){
            if(m % 3 == 0){
                //console.log(type);
                switch(menuInputs[m].alt){
                    case "Appetizers":
                        newMenu.push('Appetizers');
                        break;
                    case "Lunch":
                        newMenu.push('Lunch');
                        break;
                    case "Dinner":
                        newMenu.push('Dinner');
                        break;
                    case "Sides":
                        newMenu.push('Sides');
                        break;
                    case "Drinks":
                        newMenu.push('Drinks');
                        break;
                }

                let item = menuInputs[m].value;
                let price = menuInputs[m + 1].value;
                let quant = menuInputs[m + 2].value;

                newMenu.push(item);
                newMenu.push(price);
                newMenu.push("Quantity: " + quant);
            }
        }

        console.log(newMenu);
            
        window.location.href = '/menusubmit?newMenu=' + newMenu;
    }
}

if(document.getElementById('chefs')){
    //grab all order-container divs
    let orders = document.getElementsByClassName('order-container');
    let selected;

    document.onkeydown = (e) => {
        
        if(e.keyCode == 38){
            // if up key is pressed
            for(let i = 0; i < orders.length; i++){
                if(orders[i].classList.contains("selected") && i != 0){
                    //remove 'selected' class from current 
                    orders[i].classList.remove('selected');
                    //give the element above this current one the class 'selected'
                    orders[i - 1].classList.add('selected');
                }
            }

        } else if(e.keyCode == 40){
            //if down key is pressed
            for(let j = 0; j < orders.length; j++){
                if(orders[j].classList.contains('selected') && j != (orders.length - 1)){
                     //remove 'selected' class from current 
                     orders[j].classList.remove('selected');
                     //give the element belo this current one the class 'selected'
                     orders[j + 1].classList.add('selected');
                }
            }
        } else if(e.keyCode == 13){
            //if enter key is pressed
            console.log(orders);
            for(let i = 0; i < orders.length; i++){
                //if item is selected
                if(orders[i].classList.contains('selected')){
                    //remove element
                    orders[i].parentNode.removeChild(orders[i]);
                    //grab information and push to newOrders array to post
                    let newOrders=[];
                    /* let xhr = new XMLHttpRequest();
                    xhr.open("POST", "/updateOrders", true);
                    xhr.setRequestHeader('Content-Type', "application/json");
                    xhr.send(JSON.stringify({orders: newOrders})); */
                    if(orders.length > 0){
                        orders[i].classList.add('selected');
                    } 
                }
            }
        }
    }
}