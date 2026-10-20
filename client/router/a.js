import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject('router')
@observer
class RouterLink extends Component {
  render() {
    const { router, common, activeClassName, className, onClick, children, to, path, ...otherProps } = this.props;
    otherProps.href = router.createHref({ pathname: to });

    let cls = className || '';
    if ((router.location.pathname === to && activeClassName) || (path === router.match.name)) cls = (cls ? cls + ' ' : '') + activeClassName;

    otherProps.onClick = function navigate(e) {
      if (e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      if (typeof onClick === 'function') {
        onClick(e);
      }

      router.push(to);
      window.scrollTo(0, 0);
    };
    return <a children={children} className={cls} {...otherProps} />;
  }
}
export default RouterLink
