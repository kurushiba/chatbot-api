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

// Get conversations list
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conversations = await conversationRepository.find({
      where: { userId: req.currentUser.id },
      order: { updatedAt: 'DESC' },
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific conversation with messages
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conversation = await conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    if (conversation.userId !== req.currentUser.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a conversation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const result = await conversationRepository.delete({
      id,
      userId: req.currentUser.id,
    });

    if (result.affected === 0) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update conversation title
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const conversation = await conversationRepository.findOne({
      where: { id, userId: req.currentUser.id },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    conversation.title = title;
    await conversationRepository.save(conversation);

    res.json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
