function readCookie(key) {
  var result;
  return (result = new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)").exec(
    document.cookie
  ))
    ? result[1]
    : null;
}

export default readCookie;
