class ArrayQueue extends Array {
  put(value) {
    return this.push(value);
  }

  take() {
    return this.shift();
  }
}

export default ArrayQueue;
