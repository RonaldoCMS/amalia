import {
  Controller, Post, Get, Param, Body, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { JobsService } from './jobs.service'
import {
  CreateJobOfferRequest, JobOfferItem, JobOfferDetail,
  JobCandidateItem, JobApplicationItem, JobMessageItem,
  SendOfferToDevsRequest, SendJobMessageRequest,
} from '@amalia/shared'

@Controller('jobs')
@UseGuards(JwtGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createOffer(
    @Body() body: CreateJobOfferRequest,
    @Request() req: { user: { id: string } },
  ): Promise<JobOfferItem> {
    return this.jobsService.createOffer(req.user.id, body)
  }

  @Get('mine')
  getMyOffers(
    @Request() req: { user: { id: string } },
  ): Promise<JobOfferItem[]> {
    return this.jobsService.getMyOffers(req.user.id)
  }

  @Get('received')
  getReceivedOffers(
    @Request() req: { user: { id: string } },
  ): Promise<JobApplicationItem[]> {
    return this.jobsService.getReceivedOffers(req.user.id)
  }

  @Get(':id')
  getOfferDetail(
    @Param('id') id: string,
  ): Promise<JobOfferDetail> {
    return this.jobsService.getOfferDetail(id)
  }

  @Get(':id/candidates')
  getCandidates(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<JobCandidateItem[]> {
    return this.jobsService.getCandidates(id, req.user.id)
  }

  @Post(':id/send')
  sendOfferToDevs(
    @Param('id') id: string,
    @Body() body: SendOfferToDevsRequest,
    @Request() req: { user: { id: string } },
  ): Promise<{ sent: number }> {
    return this.jobsService.sendOfferToDevs(id, req.user.id, body)
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  closeOffer(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.jobsService.closeOffer(id, req.user.id)
  }

  @Get('applications/:appId/messages')
  getMessages(
    @Param('appId') appId: string,
    @Request() req: { user: { id: string } },
  ): Promise<JobMessageItem[]> {
    return this.jobsService.getMessages(appId, req.user.id)
  }

  @Post('applications/:appId/messages')
  sendMessage(
    @Param('appId') appId: string,
    @Body() body: SendJobMessageRequest,
    @Request() req: { user: { id: string } },
  ): Promise<JobMessageItem> {
    return this.jobsService.sendMessage(appId, req.user.id, body.content)
  }
}
