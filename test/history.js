(() => { 
    window.api.send("loadHistory");
    window.api.receive("sendHistory", (data) => {
        console.log(data)

        const container = document.getElementById("main") 

        data.history.forEach(text => {
            let paragraphElement = document.createElement('p');
            paragraphElement.innerHTML = text;
            container.appendChild(paragraphElement);
        });
        
    })
    console.log("hi")
 })()