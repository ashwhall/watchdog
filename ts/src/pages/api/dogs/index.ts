import { NextApiRequest, NextApiResponse } from 'next';
import { getDogs, createDog } from '../../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const dogs = await getDogs();
      return res.status(200).json(dogs);
    }

    if (req.method === 'POST') {
      const { name, breed, postUrl, imageUrl, description } = req.body;

      if (!name || !breed || !postUrl || !imageUrl || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDog = await createDog({
        name,
        breed,
        postUrl,
        imageUrl,
        description,
        scrapedAt: new Date(),
      });

      return res.status(201).json(newDog[0]);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
