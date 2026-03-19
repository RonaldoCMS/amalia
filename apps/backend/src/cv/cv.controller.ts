import {
  Controller, Post, Get, Delete, Body, Param, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { CvService } from './cv.service'
import { CvSendMessageRequest, CvSession, CvSendMessageResponse, PublicCvItem } from '@amalia/shared'

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // ── Public endpoints (no auth required) ─────────────────────────────────

  @Get('gallery')
  getGallery(): Promise<PublicCvItem[]> {
    return this.cvService.getAllPublic()
  }

  @Get('public/:username')
  getPublicCv(@Param('username') username: string): Promise<CvSession> {
    return this.cvService.getPublicByUsername(username)
  }

  // ── Authenticated endpoints ──────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtGuard)
  getMyCv(@Request() req: { user: { id: string } }): Promise<CvSession | null> {
    return this.cvService.getMyCv(req.user.id)
  }

  @Post('start')
  @UseGuards(JwtGuard)
  startInterview(@Request() req: { user: { id: string } }): Promise<CvSession> {
    return this.cvService.startInterview(req.user.id)
  }

  @Post(':id/message')
  @UseGuards(JwtGuard)
  sendMessage(
    @Param('id') id: string,
    @Body() body: CvSendMessageRequest,
    @Request() req: { user: { id: string } },
  ): Promise<CvSendMessageResponse> {
    return this.cvService.sendMessage(id, req.user.id, body.content)
  }

  @Post(':id/generate')
  @UseGuards(JwtGuard)
  generateCv(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<CvSession> {
    return this.cvService.generateCv(id, req.user.id)
  }

  @Delete('me')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMyCv(@Request() req: { user: { id: string } }): Promise<void> {
    return this.cvService.deleteMyCV(req.user.id)
  }
}
