import {SessionActions, OrganisationActions, ApplicationActions} from '../../actions';

export function requireAuth(store, nextState, replaceState, callback) {
  const state = store.getState();
  if (!(state.session && state.session.isValid)) {
    replaceState({
      nextPathname: nextState.location.pathname
    }, '/login');
  }
  callback();
};
export function logout(store, nextState, replaceState, callback) {
  let logout = SessionActions.logout(() => {
    replaceState({}, '/');
    callback();
  });
  store.dispatch(logout);
};

export function redirectToDefaultRoute(store, nextState, replaceState, callback) {
  const state = store.getState();
  if (!(state.session && state.session.isValid)) {
    replaceState({
      nextPathname: nextState.location.pathname
    }, '/login');

  } else if (!(state.organisation && state.organisation.name)) {
    replaceState({}, '/organisation/create');
  } else if (!(state.application && state.application.name)) {
    replaceState({}, `/${state.organisation.slug}/application/create`);
  } else {
    replaceState({}, `/${state.organisation.slug}/${state.application.slug}/`);
  }
  callback();
};

export function redirectToDefaultRouteIfLoggedIn(store, nextState, replaceState, callback) {
  const state = store.getState();
  if (state.session && state.session.isValid) {
    let path = "/";
    if (nextState.nextPathname) {
      path = nextState.nextPathname;
    }
    replaceState({}, path);
  }
  callback();
};
export function setOrganisation(store, nextState, replaceState, callback) {
  let organisationSlug = nextState.params.organisationSlug;
  const state = store.getState();
  if (organisationSlug != state.organisation.slug) {
    store.dispatch(OrganisationActions.switchOrganisation(organisationSlug, (success) => {
      if (!success) {
        replaceState({}, '/');
      }
      callback();
    }));
  } else {
    callback();
  }

}
export function setApplication(store, nextState, replaceState, callback) {
  let applicationSlug = nextState.params.applicationSlug;
  const state = store.getState();
  if (applicationSlug != state.application.slug) {
    store.dispatch(ApplicationActions.switchApplication(applicationSlug, (success) => {
      if (!success) {
        replaceState({}, '/');
      }
      callback();
    }));
  } else {
    callback();
  }
}
