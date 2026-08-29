import { asyncHandler } from '../../utils/asyncHandler.js';

export class AiController {
  constructor(aiService) {
    this.aiService = aiService;
  }

  analyzeImages = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.analyzeRoomImages(req.body.imageUrls);
    res.status(200).json({ success: true, data: result });
  });

  generateDescription = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.generatePropertyDescription(req.body);
    res.status(200).json({ success: true, data: result });
  });

  matchRoommates = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.matchRoommates(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  getRoommateMatch = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.getRoommateMatch(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  pairRoommates = asyncHandler(async (req, res, next) => {
    const { partnerId, score } = req.body;
    const result = await this.aiService.pairRoommates(req.user.id, partnerId, score);
    res.status(200).json({ success: true, data: result });
  });

  unpairRoommates = asyncHandler(async (req, res, next) => {
    const { partnerId } = req.body;
    const result = await this.aiService.unpairRoommates(req.user.id, partnerId);
    res.status(200).json({ success: true, data: result });
  });

  sendRoommateRequest = asyncHandler(async (req, res, next) => {
    const { receiverId } = req.body;
    const result = await this.aiService.sendRoommateRequest(req.user.id, receiverId);
    res.status(200).json({ success: true, data: result });
  });

  cancelRoommateRequest = asyncHandler(async (req, res, next) => {
    const { receiverId } = req.body;
    const result = await this.aiService.cancelRoommateRequest(req.user.id, receiverId);
    res.status(200).json({ success: true, data: result });
  });

  acceptRoommateRequest = asyncHandler(async (req, res, next) => {
    const { senderId } = req.body;
    const result = await this.aiService.acceptRoommateRequest(req.user.id, senderId);
    res.status(200).json({ success: true, data: result });
  });

  rejectRoommateRequest = asyncHandler(async (req, res, next) => {
    const { senderId } = req.body;
    const result = await this.aiService.rejectRoommateRequest(req.user.id, senderId);
    res.status(200).json({ success: true, data: result });
  });

  getRoommateRequests = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.getRoommateRequests(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  tagProperty = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.tagProperty(req.body.propertyDetails);
    res.status(200).json({ success: true, data: result });
  });

  chat = asyncHandler(async (req, res, next) => {
    const result = await this.aiService.chatWithBot(req.body.message, req.body.context);
    res.status(200).json({ success: true, data: result });
  });
}
