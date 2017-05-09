declare var java: any;
declare var CACurrentMediaTime: any;
declare var __startCPUProfiler: any;
declare var __stopCPUProfiler: any;

export let ENABLE_PROFILING = true;

let anyGlobal = <any>global;

export function time(): number {
    if (!ENABLE_PROFILING) {
        return;
    }

    if (anyGlobal.android) {
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    } else {
        return CACurrentMediaTime() * 1000;
    }
}

interface TimerInfo {
    totalTime: number;
    lastTime?: number;
    count: number;
    currentStart: number;
}

if (!anyGlobal.timers) {
    anyGlobal.timers = new Map<string, TimerInfo>();
}
export function start(name: string): void {
    if (!ENABLE_PROFILING) {
        return;
    }

    let info: TimerInfo;
    if (anyGlobal.timers.has(name)) {
        info = anyGlobal.timers.get(name);
        if (info.currentStart !== 0) {
            throw new Error(`Timer already started: ${name}`);
        }
        info.currentStart = time();
    } else {
        info = {
            totalTime: 0,
            count: 0,
            currentStart: time()
        };
        anyGlobal.timers.set(name, info);
    }
}

export function pause(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    let info = pauseInternal(name);
    console.log(`---- [${name}] PAUSE last: ${info.lastTime} total: ${info.totalTime} count: ${info.count}`);
}

export function stop(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    let info = pauseInternal(name);
    console.log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);

    anyGlobal.timers.delete(name);
}

function pauseInternal(name: string): TimerInfo {
    let info = anyGlobal.timers.get(name);
    if (!info) {
        throw new Error(`No timer started: ${name}`);
    }

    info.lastTime = Math.round(time() - info.currentStart);
    info.totalTime += info.lastTime;
    info.count++;
    info.currentStart = 0;

    return info;
}

export function startCPUProfile(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    if (anyGlobal.android) {
        __startCPUProfiler(name);
    }
}

export function stopCPUProfile(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    if (anyGlobal.android) {
        __stopCPUProfiler(name);
    }
}
export var ENABLE_PROFILING = true;

var log = function(text) {
    var line = document.createElement('p');
    line.innerHTML = text;
    var logContainer = document.getElementById('log');
    logContainer.appendChild(line);
}

export function time(): number {
    if (!ENABLE_PROFILING) {
        return;
    }

    return performance.now();
}

interface TimerInfo {
    totalTime: number;
    lastTime?: number;
    count: number;
    currentStart: number;
}

var timers = new Map<string, TimerInfo>();
export function start(name: string): void {
    if (!ENABLE_PROFILING) {
        return;
    }
    console.time(name);

    var info: TimerInfo;
    if (timers.has(name)) {
        info = timers.get(name);
        if (info.currentStart != 0) {
            throw new Error(`Timer already started: ${name}`);
        }
        info.currentStart = time();
    }
    else {
        info = {
            totalTime: 0,
            count: 0,
            currentStart: time()
        };
        timers.set(name, info);
    }
}

export function pause(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    var info = pauseInternal(name);
    log(`---- [${name}] PAUSE last: ${info.lastTime} total: ${info.totalTime} count: ${info.count}`);
}

export function stop(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }
    console.timeEnd(name);

    var info = pauseInternal(name);
    log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);

    timers.delete(name);
}

function pauseInternal(name: string): TimerInfo {
    var info = timers.get(name);
    if (!info) {
        throw new Error(`No timer started: ${name}`);
    }

    info.lastTime = Math.round(time() - info.currentStart);
    info.totalTime += info.lastTime;
    info.count++;
    info.currentStart = 0;

    return info;
}

export function startCPUProfile(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    if (global.android) {
        __startCPUProfiler(name);
    }
}

export function stopCPUProfile(name: string) {
    if (!ENABLE_PROFILING) {
        return;
    }

    if (global.android) {
        __stopCPUProfiler(name);
    }
}
