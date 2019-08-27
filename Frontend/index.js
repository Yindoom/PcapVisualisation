function readinput() {
    let input = document.getElementById('fileInput').files[0];

    console.log('Input read, name of file is ' + input.name);
    let formData = fileAsFormdata(input);

    sendRequest(formData);
}

function fileAsFormdata(file) {
    const formData = new FormData();
    filetype = file.name.split(".")[1];
    console.log(filetype);
    formData.append('filetype', filetype);
    formData.append('pcap-file', file, 'test');
    console.log('Data appended as form');
    return formData;
}

function sendRequest(file) {
    console.log('sending file');
    fetch('http://localhost:5000/pcap', {

        method: 'POST',

        body: file
    }).then(function (response) {
        return response.text();
    }).then(function (data) {
        console.log('GET STUFF');
        console.log(data);
        showDataOnPage(data);
    })
}

function showDataOnPage(json) {
    debugger;
    let data = JSON.parse(json);
    let addresses = data['addresses'];
    let packetsValues = Object.values(data['packets']);
    let packetsKeys = Object.keys(data['packets']);
    console.log(valArr);
    plotPoints()
}

