const storage = {
  set(key, value) {
    localStorage.setItem(key, value);
  },
  get(key) {
    return localStorage.getItem(key);
  },
  setMultiple(data) {
    Object.entries(data).map(([key, value]) => {
      this.set(key, value);
    });
  }
};

export default storage;