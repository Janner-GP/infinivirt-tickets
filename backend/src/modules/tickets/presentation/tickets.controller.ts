import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, TicketPriority, TicketStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { DashboardMetrics } from '../domain/repositories/ticket.repository';
import { TicketsService } from '../application/tickets.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import {
  TicketCommentResponseDto,
  TicketResponseDto,
} from './dto/ticket-response.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketOwnershipGuard } from './guards/ticket-ownership.guard';

@ApiTags('tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AGENT, Role.CLIENT)
  @ApiOperation({
    summary: 'Crear un ticket (Administrador, Agente o Cliente)',
  })
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.create(dto, currentUser);
    return new TicketResponseDto(ticket);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT, Role.SUPERVISOR, Role.CLIENT)
  @ApiOperation({
    summary:
      'Listar tickets con filtros opcionales (Agente/Cliente solo ven los suyos)',
  })
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('clientId') clientId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findMany(
      { status, priority, clientId, assignedToId, categoryId, subcategoryId },
      currentUser,
    );
    return tickets.map((ticket) => new TicketResponseDto(ticket));
  }

  @Get('overdue')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({
    summary: 'Tickets con más de 48h sin actualizar y no cerrados',
  })
  async findOverdue(): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findOverdue();
    return tickets.map((ticket) => new TicketResponseDto(ticket));
  }

  @Get('metrics')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Métricas básicas para el dashboard operativo' })
  getMetrics(): Promise<DashboardMetrics> {
    return this.ticketsService.getDashboardMetrics();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.AGENT, Role.SUPERVISOR, Role.CLIENT)
  @UseGuards(TicketOwnershipGuard)
  @ApiOperation({ summary: 'Detalle de un ticket, con sus comentarios' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TicketResponseDto> {
    const [ticket, comments] = await Promise.all([
      this.ticketsService.findById(id),
      this.ticketsService.findComments(id),
    ]);

    const visibleComments =
      currentUser.role === Role.CLIENT
        ? comments.filter((c) => !c.isInternal)
        : comments;

    return new TicketResponseDto({
      ...ticket,
      comments: visibleComments.map(
        (comment) => new TicketCommentResponseDto(comment),
      ),
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.AGENT)
  @UseGuards(TicketOwnershipGuard)
  @ApiOperation({ summary: 'Editar título, descripción o prioridad' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.updateFields(id, dto);
    return new TicketResponseDto(ticket);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.AGENT)
  @UseGuards(TicketOwnershipGuard)
  @ApiOperation({
    summary: 'Cambiar el estado del ticket (valida la máquina de estados)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.updateStatus(
      id,
      dto.status,
      currentUser,
    );
    return new TicketResponseDto(ticket);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({
    summary: 'Asignar o reasignar el ticket (Administrador y Supervisor)',
  })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.reassign(
      id,
      dto.assignedToId,
      currentUser,
    );
    return new TicketResponseDto(ticket);
  }

  @Post(':id/comments')
  @Roles(Role.ADMIN, Role.AGENT, Role.SUPERVISOR, Role.CLIENT)
  @UseGuards(TicketOwnershipGuard)
  @ApiOperation({ summary: 'Agregar un comentario al ticket' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TicketCommentResponseDto> {
    const comment = await this.ticketsService.addComment(id, dto, currentUser);
    return new TicketCommentResponseDto(comment);
  }
}
