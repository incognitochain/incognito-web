export default (pathname) => {
  if (typeof window === 'object') {
    let path = window.location.pathname || '';
    path = path.replace('.html', '');
    pathname = pathname.replace('.html', '');

    return path === pathname
  }
}