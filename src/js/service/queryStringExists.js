export default key => {
    let rs;
    try {
      rs = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?](" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + ")(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    } catch (e) {
      console.error(e);
    }
  
    return !!rs;
  }