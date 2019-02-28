let order = [];

if(document.getElementById('consumer') != null){
    let reviewButton = document.getElementById('order-submit');
    
    //on button press
    reviewButton.onclick = () => {
        //grab input values
        let inputs = document.getElementsByTagName('input');
        for(let i = 0; i < inputs.length; i++){
            if(inputs[i].value == ""){
                order.push(['0', inputs[i].id, inputs[i].max, inputs[i].min, inputs[i].name]);
                //console.log('0: ', inputs[i].id );
            } else {
                order.push([inputs[i].value, inputs[i].id, inputs[i].max, inputs[i].min, inputs[i].name]);
                //console.log(inputs[i].value + ": " + inputs[i].id);
            }
        }
        console.log(order);
        //window.location.href = '/revieworder/?order=' + order.join(',');
    }
}

const init = () => {

    console.log("LOADED");
        let form = document.getElementById('review-order');

        //create inputs for order review form
        console.log(order.length);
        for(let o = 0; o < order.length; o++){
            console.log("HELLOOOOOO");
            let input = document.createElement('input');
            input.value = order[o][0];
            input.id = order[o][1];
            input.max = order[o][2];
            input.min = order[o][3];
            form.appendChild(input);
            console.log("Input added");
            /*if(i == (order.length - 1)){
                
            }*/
        }

        //create submit button
        let submitButon = document.createElement('input');
        submitButon.type = 'submit';
        submitButon.value = 'Submit Order';

        //add submit button to form
        form.appendChild(submitButon);
}

if(document.getElementById('review') != null){
    //create a form
    let body = document.getElementsByTagName('body');
}

