import config from 'config';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import {Application} from '@hoist/model';
import slugify from 'slug';

Promise.promisifyAll(fs);

export function getApplicationPath(application) {
  return Promise
    .resolve()
    .then(() => {
      if (!application.populated('organisation')) {
        return application
          .populate({path: 'organisation', select: 'slug'})
          .execPopulate()
      }
    })
    .then(() => {
      return path.join(config.get('Hoist.filePaths.deploys'), application.organisation.slug, application.slug, 'current');
    })
    .then((currentPath) => {
      if (fs.existsSync(currentPath)) {
        return fs.realpathAsync(currentPath);
      } else {
        return currentPath;
      }
    });
}
export function create({
  name,
  organisation,
  slug = null
}) {
  return Promise
    .resolve(slugify(slug || name))
    .then(slug => {
      return new Application({name, organisation, slug})
        .saveAsync();
    });
}
