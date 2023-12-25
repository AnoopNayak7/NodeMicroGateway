'use strict';

const pem = require('pem');
const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, '../config/key.pem');
const certPath = path.resolve(__dirname, '../config/cert.pem');

const checkServiceKey = (cb) => {
    try {
        fs.statSync(keyPath);
        const serviceKey = fs.readFileSync(keyPath)
        cb(null, serviceKey)
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log("Create the service key 'config/key.pem'");
            pem.createPrivateKey(2048, (err, keyData) => {
                if (err) {
                    cb(err)
                } else {
                    fs.writeFile(keyPath, keyData.key, (err) => {
                        cb(err, err || { newKey: true, keyData: keyData.key });
                    })
                }
            })
        } else {
            cb(err);
        }
    }
}

const createCertificate = (keyData, cb) => {
    console.log("createCertificate", keyData, cb);
    pem.createCertificate({ serviceKey: keyData }, (err, certResult) => {
        if (err) {
            cb(err)
        } else {
            fs.writeFile(certPath, certResult.certificate, cb)
        }
    })
}

const createCertificateCB = (err) => {
    if (err) {
        console.log("Error when creating the cert file 'config/cert.pem': " + err);
        process.exit(1);
    }
}

checkServiceKey((err, result) => {
    if (err) {
        console.log("Error when checking/creating the service key file 'config/key.pem': " + err);
        process.exit(1);
    }
    let certFileExist = false;
    try {
        fs.statSync(certPath);
        certFileExist = true;
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.log("Error when checking the cert file 'config/cert.pem': " + err);
            process.exit(1);
        }
    }
    if (certFileExist) {
        if (result.newKey) {
            console.log("Recreate the cert file 'config/cert.pem'");
            createCertificate(result.keyData, createCertificateCB);
        }
    } else {
        console.log("Create the cert file 'config/cert.pem'");
        createCertificate(result.keyData, createCertificateCB);
    }
})
