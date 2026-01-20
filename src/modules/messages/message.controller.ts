import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Message } from './message.entity';
import { Conversation } from '../conversations/conversation.entity';

const router = Router({ mergeParams: true });
const messageRepository = datasource.getRepository(Message);
const conversationRepository = datasource.getRepository(Conversation);

// POST /conversations/:conversationId/messages
router.post('/', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { role, content } = req.body;

    if (!content || !role) {
      res.status(400).json({ message: 'Content and role are required' });
      return;
    }

    // Verify conversation exists and belongs to user (optional security check)
    // For now, we assume middleware checks auth, but strictly we should check ownership.
    const conversation = await conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    if (conversation.userId !== req.currentUser?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const message = messageRepository.create({
      conversationId,
      role,
      content,
    });

    const savedMessage = await messageRepository.save(message);

    // Update conversation timestamp
    await conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
