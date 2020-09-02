const { ipcRenderer } = require('electron');
const path = require('path');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const memory = osu.mem;
const os = osu.os;

let cpuOverload
let alertFrequency

ipcRenderer.on('settings:get', (event, settings) => {
    cpuOverload = settings.cpuOverload;
    alertFrequency = settings.alertFrequency;
})


//Runs every two seconds
setInterval(() => {
    //CPU Usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info + '%';
        document.getElementById('cpu-progress').style.width = info + '%';

        if(info >= cpuOverload){
            document.getElementById('cpu-progress').style.background = 'red';
        }
        else {
            document.getElementById('cpu-progress').style.background = '#30c88b';
        }

        //checks overload
        if(info >= cpuOverload && runNotify(alertFrequency)){
            notifyUser({
                title: 'CPU Overload',
                body: `CPU is over ${cpuOverload} %`
            })
            localStorage.setItem('lastNotify', +new Date());            
        }
    })

    //CPU Space left
    cpu.free().then(info => {
        document.getElementById('cpu-free').innerText = info + '%'
    })

    //uptime
    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime());
}, 2000)


//Set model
document.getElementById('cpu-model').innerText = cpu.model();

//computer name
document.getElementById('comp-name').innerText = os.hostname();

//os
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`

//Total memory
memory.info().then(info => {
    document.getElementById('mem-total').innerText = info.totalMemMb + " Mega Bytes"
})


//Show days, hours, mins, sec
function secondsToDhms(seconds){
    seconds = +seconds;
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${days} days, ${hours} hours, ${mins} minutes, ${s} seconds`
}

//sends notification
function notifyUser(options){
    new Notification(options.title,options)
}

//check how much time has passed since last notification
function runNotify(frequency){
    if(localStorage.getItem('lastNotify') === null){
        //Storage timestamp
        localStorage.setItem('lastNotify', +new Date());
        return true;
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
    const now = new Date();
    const diffTime = Math.abs(now - notifyTime);
    const minutesPassed  = Math.ceil(diffTime / (1000 * 60));

    if(minutesPassed > frequency){
        return true;
    }
    else {
        return false;
    }
}