const fs = require('fs');
const path = require('path');

function createDirectoryAsync(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(directoryPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
                reject(err);
            } else {
                console.log('Directory created successfully.');
                resolve();
            }
        });
    });
}

function moveFileAsync(source, destination) {
    return new Promise((resolve, reject) => {
        source.mv(destination, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteDirectoryRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const filePath = path.join(dirPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                // Recursively delete subdirectories
                deleteDirectoryRecursive(filePath);
            } else {
                // Delete files within the directory
                fs.unlinkSync(filePath);
            }
        });
        // Remove the empty directory
        fs.rmdirSync(dirPath);
    }
}

module.exports = {
    createDirectoryAsync,
    moveFileAsync,
    deleteDirectoryRecursive,
};