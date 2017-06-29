const util = require('util');
const Transform = require('stream').Transform;

const INIT_STATE = 1;
const BUFFERING_STATE = 2;
const PASSTHROUGH_STATE = 3;
const METADATA_BLOCK_SIZE = 16;

const _parseMetadata = metadata => {
  console.log('_parseMetadata called with metadata:');
  console.log(metadata);

  const data = Buffer.isBuffer(metadata) ? metadata.toString('utf8') : metadata || '';
  const result = {};

  console.log('var data is: ');
  console.log(data);
  console.log('var data after replace and split is: ');
  console.log(data.replace(/\0*$/, '').split(';'));

  data.replace(/\0*$/, '').split(';').forEach(item => {
    item = item.split(/\=['"]/);
    console.log('item after split is: ');
    console.log(item);
    result[item[0]] = String(item[1]).replace(/['"]$/, '');
    console.log('result became: ');
    console.log(result);
  });

  console.log('_parseMetadata returned________\n\n');
  return result;
};

const _trampoline = function (fn) {
  return function () {
    let result = fn.apply(this, arguments);
    while (typeof result === 'function') result = result();
    return result;
  };
};

const _processData = (stream, chunk, done) => {
  stream._bytesLeft -= chunk.length;
  console.log('_processData called with chunk: ');
  console.log(chunk);

  if (stream._currentState === BUFFERING_STATE) {
    console.log('Stream state is buffering, pushing this chunk in stream._buffers');
    stream._buffers.push(chunk);
    stream._buffersLength += chunk.length;
  } else if (stream._currentState === PASSTHROUGH_STATE) {
    console.log('Stream state is passthrough, pushing this buffer in stream');
    stream.push(chunk);
  }

  if (stream._bytesLeft === 0) {
    console.log('stream._bytesLeft is 0');
    const cb = stream._callback;
    console.log('stream callback is ');
    console.log(cb);

    if (cb && stream._currentState === BUFFERING_STATE && stream._buffers.length > 1) {
      chunk = Buffer.concat(stream._buffers, stream._buffersLength);
      console.log('stream has callback, is in buffering state & _buffersLength > 1 so, chunk became ' + chunk);
    } else if (stream._currentState !== BUFFERING_STATE) {
      console.log('stream is not in buffering state, making chunk = null');
      chunk = null;
    }

    stream._currentState = INIT_STATE;
    stream._callback = null;
    stream._buffers.splice(0);
    stream._buffersLength = 0;

    console.log('Made stream to init state and cb.call(stream, chunk)');
    cb.call(stream, chunk);
  }
  console.log('_processData returned________\n\n');
  return done;
};

const _onData = _trampoline((stream, chunk, done) => {
  if (chunk.length <= stream._bytesLeft) {
    return () => _processData(stream, chunk, done);
  } else {
    return () => {
      const buffer = chunk.slice(0, stream._bytesLeft);

      return _processData(stream, buffer, error => {
        if (error) return done(error);
        if (chunk.length > buffer.length) {
          return () => _onData(stream, chunk.slice(buffer.length), done);
        }
      });
    };
  }
});

class StreamReader extends Transform {
  constructor(icyMetaInt) {
    super();

    // How many bytes left to read
    this._bytesLeft = 0;

    // Current state of reader, what the reader should do with received bytes
    this._currentState = INIT_STATE;

    // Callback for the next chunk
    this._callback = null;

    // Array of collected Buffers
    this._buffers = [];

    // How many bytes already read
    this._buffersLength = 0;

    // icy-metaint number from radio response
    this._icyMetaInt = +icyMetaInt;

    this._passthrough(this._icyMetaInt, this._onMetaSectionStart);
  }

  _bytes(length, cb) {
    this._bytesLeft = length;
    this._currentState = BUFFERING_STATE;
    this._callback = cb;
    return this;
  }

  _passthrough(length, cb) {
    this._bytesLeft = length;
    this._currentState = PASSTHROUGH_STATE;
    this._callback = cb;
    return this;
  }

  _transform(chunk, encoding, done) {
    _onData(this, chunk, done);
  }

  _onMetaSectionStart() {
    this._bytes(1, this._onMetaSectionLengthByte);
  }

  _onMetaSectionLengthByte(chunk) {
    const length = chunk[0] * METADATA_BLOCK_SIZE;

    if (length > 0) {
      this._bytes(length, this._onMetaData);
    } else {
      this._passthrough(this._icyMetaInt, this._onMetaSectionStart);
    }
  }

  _onMetaData(chunk) {
    this.emit('metadata', _parseMetadata(chunk));
    this._passthrough(this._icyMetaInt, this._onMetaSectionStart);
  }
}

module.exports = StreamReader;