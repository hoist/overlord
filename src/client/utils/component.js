export function loadPage(pageName) {
  return (location, callback) => {
    switch (pageName) {
      case 'login_page':
        require.ensure([], function (require) {
          callback(null, require(`../pages/login_page`).Component);
        });
        break;
      case 'dashboard_page':
        require.ensure([], function (require) {
          callback(null, require(`../pages/dashboard_page`).Component);
        });
        break;
      default:
        break;
    }
  }
}
