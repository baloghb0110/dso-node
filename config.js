const ps = require('ps-node');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data.json');

let commandArgs = require(dataFilePath);

const extractValueFromCommandLine = (commandLine, parameter) => {
    let parts = commandLine.split(' ');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === parameter && i + 1 < parts.length) {
            return parts[i + 1];
        }
    }
    return null;
}

exports.getProcessDetailsAndUpdateArgs = () => {
    return new Promise((resolve, reject) => {
        ps.lookup({
            command: 'dro_client64.exe',
        }, (err, resultList) => {
            if (err) reject(err);

            if (resultList.length > 0) {
                const process = resultList[0];
                let commandLine = process.arguments.join(' ');

                commandArgs.accid = extractValueFromCommandLine(commandLine, '-accid') || commandArgs.accid;
                commandArgs.sid = extractValueFromCommandLine(commandLine, '-sid') || commandArgs.sid;
                commandArgs.rootkey = extractValueFromCommandLine(commandLine, '-rootkey') || commandArgs.rootkey;
                commandArgs.bica = extractValueFromCommandLine(commandLine, '-bica') || commandArgs.bica;
                commandArgs.ip = extractValueFromCommandLine(commandLine, '-ip') || commandArgs.ip;
                commandArgs.cdnurl = extractValueFromCommandLine(commandLine, '-cdnurl') || commandArgs.cdnurl;
                commandArgs.rooturl = extractValueFromCommandLine(commandLine, '-rooturl') || commandArgs.rooturl;

                fs.writeFileSync(dataFilePath, JSON.stringify(commandArgs, null, 4));
                
                console.log(`Updated values:`);
                console.log(`accid: ${commandArgs.accid}`);
                console.log(`sid: ${commandArgs.sid}`);
                console.log(`rootkey: ${commandArgs.rootkey}`);
                console.log(`bica: ${commandArgs.bica}`);
                console.log(`ip: ${commandArgs.ip}`);
                console.log(`cdnurl: ${commandArgs.cdnurl}`);
                console.log(`rooturl: ${commandArgs.rooturl}`);
            }
            resolve();
        });
    });
}

exports.commandArgs = commandArgs;