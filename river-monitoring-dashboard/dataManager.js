const apiUrl = 'http://127.0.0.1:3001';


let chart = null;


document.addEventListener("DOMContentLoaded", function () {


    const xValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    chart = new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: "green",
                fill: true
            }]
        },
        options: {
            legend: { display: false }
        }
    });




    let setter = document.querySelector(".setter");
    setter.addEventListener('input', function () {
        let data = { mode: 'M', position: document.querySelector(".setter").value };
        sendRequest(data);
        fetchData();
    });

    document.querySelector(".auto").addEventListener("click", function () {
        let data = { mode: 'A', position: document.querySelector(".setter").value };
        sendRequest(data);
        fetchData();
    });

    document.querySelector(".man").addEventListener("click", function () {
        let data = { mode: 'M', position: document.querySelector(".setter").value };
        sendRequest(data);
        fetchData();
    });


    fetchDataLoop();
});

function fetchDataLoop() {
    fetchData();
    setTimeout(function () {
        fetchDataLoop();
    }, 350);
}

function fetchData() {
    fetch(apiUrl)
        .then(response => {
            // Check if the request was successful (status code 200)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON data
            return response.json();
        })
        .then(data => {
            // Handle the JSON data
            console.log(data);
            let setter = document.querySelector(".setter");

            if (data.mode === "AUTO") {
                document.querySelector(".auto").classList.add("active");
                document.querySelector(".man").classList.remove("active");

            } else {
                document.querySelector(".auto").classList.remove("active");
                document.querySelector(".man").classList.add("active");
            }


            setter.value = data.position;
            document.querySelector(".position").innerHTML = data.position + "%";

            let fill = document.querySelector(".fill");
            data.level = Math.round(data.level);
            data.level = data.level < 0 ? 0 : data.level;
            fill.style.height = data.level + "%";
            fill.innerHTML = data.level;
            const currentDate = new Date();
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            if (chart.data.labels[chart.data.labels.length - 1] !== `${hours}:${minutes}:${seconds}`) {
                // Add new data point
                const newDataPoint = data.level;
                chart.data.datasets[0].data.push(newDataPoint);
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
                chart.data.labels.push(`${hours}:${minutes}:${seconds}`);
                // Update the chart
                chart.update();
            }
            let stateTitle = document.querySelector(".currentstate");
            let color = "green";
            if (data.mode === "MANUAL") {
                stateTitle.innerHTML = "Manual";
                color = "green";
            }
            else switch (data.state) {
                case "ALARM_TOO_LOW":
                    color = "lightblue";
                    stateTitle.innerHTML = "Alarm too low!";
                    break;
                case "NORMAL":
                    color = "green";
                    stateTitle.innerHTML = "Normal";

                    break;
                case "PRE_ALARM_TOO_HIGH":
                    color = "lightgreen";
                    stateTitle.innerHTML = "Pre alarm too high";
                    break;
                case "ALARM_TOO_HIGH":
                    color = "orange";
                    stateTitle.innerHTML = "Alarm too high!";

                    break;
                case "ALARM_TOO_HIGH_CRITIC":
                    color = "red";
                    stateTitle.innerHTML = "Alarm too high critic!";
                    break;
            }
            stateTitle.style.color = color;
            document.querySelector(".fill").style.backgroundColor = color;

        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching data:', error);
        });

}


function sendRequest(postData) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('POST request successful:', data);
        })
        .catch(error => {
            console.error('Error making POST request:', error);
        });
}