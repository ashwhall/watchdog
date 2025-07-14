import { NextApiRequest, NextApiResponse } from 'next';
import { getDogById, updateDog, deleteDog } from '../../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const dogId = parseInt(id as string);

  if (isNaN(dogId)) {
    return res.status(400).json({ error: 'Invalid dog ID' });
  }

  try {
    if (req.method === 'GET') {
      const dog = await getDogById(dogId);
      if (dog.length === 0) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      return res.status(200).json(dog[0]);
    }

    if (req.method === 'PUT') {
      const { name, breed, postUrl, imageUrl, description } = req.body;
      const updatedDog = await updateDog(dogId, {
        name,
        breed,
        postUrl,
        imageUrl,
        description,
      });

      if (updatedDog.length === 0) {
        return res.status(404).json({ error: 'Dog not found' });
      }

      return res.status(200).json(updatedDog[0]);
    }

    if (req.method === 'DELETE') {
      const deletedDog = await deleteDog(dogId);
      if (deletedDog.length === 0) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      return res.status(200).json({ message: 'Dog deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
