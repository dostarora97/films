const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Path to the version file within the assets directory
const versionFilePath = path.join(__dirname, 'src/assets/version.json');

// Execute the git command to get the current commit hash
const gitCommitHash = childProcess.execSync('git rev-parse HEAD').toString().trim();

// Create the version object
const versionObject = {
  hash: gitCommitHash,
  timestamp: Date.now().toString() // Optionally add a timestamp
};

// Write the version object to the file
fs.writeFileSync(versionFilePath, JSON.stringify(versionObject, null, 2));

console.log(`Version file generated: ${versionFilePath}`);
