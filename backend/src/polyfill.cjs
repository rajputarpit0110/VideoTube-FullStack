const buffer = require('node:buffer');
if (!buffer.SlowBuffer) {
    buffer.SlowBuffer = buffer.Buffer;
}

