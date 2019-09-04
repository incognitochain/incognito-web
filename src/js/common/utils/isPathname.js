export default (pathname) => {
  if (typeof window === 'object') {
    let path = window.location.pathname || '';
    path = path.replace('.html', '');

    return path === pathname
  }
}