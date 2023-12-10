const { spawn, exec } = require('child_process');
const Utilities = require('./Utilities');

class ProcessHandler {
    constructor(commandPath, args) {
        this.commandPath = commandPath;
        this.args = args;
    }

    spawnProcess() {
        const commandArgs = [];
        for (let [key, value] of Object.entries(this.args)) {
            commandArgs.push(`-${key}`, value);
        }

        //console.log(`Attempting to spawn process: ${this.commandPath} with arguments: ${commandArgs.join(' ')}`);

        let childProcess;
        try {
            childProcess = spawn(this.commandPath, commandArgs);
            console.log(`Spawned process with PID: ${childProcess.pid}`);

            this.setProcessPriority(childProcess.pid, 'RealTime');
        } catch (error) {
            console.error(`Failed to spawn process: ${error.message}`);
            return;
        }

        this.setupProcessListeners(childProcess);
    }

    setupProcessListeners(childProcess) {
        let stdoutBuffer = '';
        childProcess.stdout.on('data', (data) => {
            stdoutBuffer += data;
            this.processOutputBuffer(stdoutBuffer, console.log);
        });

        let stderrBuffer = '';
        childProcess.stderr.on('data', (data) => {
            stderrBuffer += data;
            this.processOutputBuffer(stderrBuffer, console.error, 'stderr: ');
        });

        childProcess.on('exit', (code, signal) => {
            console.log(`Child process exited with code ${code} and signal ${signal}`);
            this.logRemainingBuffer(stdoutBuffer, stderrBuffer);
        });

        childProcess.on('disconnect', () => {
            console.log('Child process disconnected');
        });

        childProcess.on('message', (message) => {
            console.log(`Received message from child process: ${message}`);
        });

        childProcess.on('error', (error) => {
            console.error(`Process error: ${error.message}`);
        });
    }

    processOutputBuffer(buffer, logFunction, prefix = '') {
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (!Utilities.shouldFilterOut(line)) {
                logFunction(prefix + line);
            }
        }
    }

    logRemainingBuffer(stdoutBuffer, stderrBuffer) {
        if (stdoutBuffer && !Utilities.shouldFilterOut(stdoutBuffer)) {
            console.log(`Remaining stdout: ${stdoutBuffer}`);
        }
        if (stderrBuffer && !Utilities.shouldFilterOut(stderrBuffer)) {
            console.error(`Remaining stderr: ${stderrBuffer}`);
        }
    }

    setProcessPriority(pid, priorityClass) {
        const validPriorityClasses = ['Normal', 'Idle', 'High', 'RealTime', 'BelowNormal', 'AboveNormal'];
        if (!validPriorityClasses.includes(priorityClass)) {
            console.error(`Invalid process priority class: ${priorityClass}. Must be one of ${validPriorityClasses.join(', ')}`);
            return;
        }
    
        const command = `powershell -Command "$process = Get-Process -Id ${pid}; $process.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::${priorityClass}"`;
    
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to set process priority: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error in setting process priority: ${stderr}`);
                return;
            }
            console.log(`Process priority set to ${priorityClass}`);
        });
    }
}

module.exports = ProcessHandler;
