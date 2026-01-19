import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Conversation } from './conversation.entity';

const router = Router();
const conversationRepository = datasource.getRepository(Conversation);

// Create a new conversation
router.post('/', async (req: Request, res: Response) => {
  try {
    // req.currentUser is set by the set-current-user middleware
    if (!req.currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conversation = await conversationRepository.save({
      userId: req.currentUser.id,
      title: '新しい会話', // Default title, logic to update later
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
