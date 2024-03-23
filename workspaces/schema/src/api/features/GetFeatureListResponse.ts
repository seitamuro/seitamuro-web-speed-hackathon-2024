import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

import { book, feature } from '../../models';

export const GetFeatureListResponseSchema = createSelectSchema(feature)
  .pick({
    id: true,
  })
  .extend({
    book: createSelectSchema(book).pick({
      id: true,
    }),
  })
  .array();

export type GetFeatureListResponse = z.infer<typeof GetFeatureListResponseSchema>;
