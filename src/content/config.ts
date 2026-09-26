import { defineCollection, z } from 'astro:content';

const faultCodesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    brand: z.string(), // e.g., 'Daikin', 'O General', 'Voltas'
    date: z.date(),
  }),
});

const recentProjectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(), // e.g., 'Makarpura GIDC', 'Alkapuri'
    serviceType: z.string(), // e.g., 'Industrial Chiller', 'Inverter PCB'
    date: z.date(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'fault-codes': faultCodesCollection,
  'recent-projects': recentProjectsCollection,
};
