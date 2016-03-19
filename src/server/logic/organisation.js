import {Organisation} from '@hoist/model';
import slugify from 'slug';
import errors from '@hoist/errors';
export function create({
  personal = false,
  name,
  slug = null
}) {
  return Promise
    .resolve(slugify(slug || name))
    .then((slug) => {
      return Organisation
        .countAsync({slug: slug})
        .then((slugColisions) => {
          if (slugColisions > 0) {
            throw new errors.HoistError('an organisaiton with that slug already exists');
          }
        })
        .then(() => {
          return new Organisation({personal, name, slug}).saveAsync();
        });
    });

}
