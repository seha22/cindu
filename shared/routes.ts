import { z } from 'zod';
import { insertProgramSchema, programs, insertDonationSchema, donations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  programs: {
    list: {
      method: 'GET' as const,
      path: '/api/programs' as const,
      responses: {
        200: z.array(z.custom<typeof programs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/programs/:id' as const,
      responses: {
        200: z.custom<typeof programs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/programs' as const,
      input: insertProgramSchema,
      responses: {
        201: z.custom<typeof programs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  donations: {
    list: {
      method: 'GET' as const,
      path: '/api/donations' as const,
      responses: {
        200: z.array(z.custom<typeof donations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/donations' as const,
      input: insertDonationSchema,
      responses: {
        201: z.custom<typeof donations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
